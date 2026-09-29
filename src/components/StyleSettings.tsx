import { TEMPLATE_VARS, buildDefaultStyleConfig } from '../prompt/templates'
import type { StyleConfig } from '../prompt/templates'
import { useAppStore } from '../store/useAppStore'
import { useSelectedRow } from '../store/selectors'
import { toast } from './Toast'

function Field({
  label,
  hint,
  value,
  onChange,
  rows = 4,
}: {
  label: string
  hint?: string
  value: string
  onChange: (v: string) => void
  rows?: number
}) {
  return (
    <div className="section">
      <div className="section-head">
        <h3>{label}</h3>
        {hint && <span className="hint">{hint}</span>}
      </div>
      <textarea
        className="textarea"
        style={{ minHeight: rows * 22 + 16 }}
        value={value}
        spellCheck={false}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

/**
 * 风格与模板设置。
 *
 * 文档 §31 说整个项目最重要的是「先统一，再扩充」，所以风格只在这里定义一份，
 * 所有素材的提示词都从这几个字段拼出来。改这里 = 全套素材的提示词同步变化。
 */
export function StyleSettings() {
  const style = useAppStore((s) => s.style)
  const setStyle = useAppStore((s) => s.setStyle)
  const resetStyle = useAppStore((s) => s.resetStyle)
  const close = useAppStore((s) => s.toggleSettings)
  const row = useSelectedRow()

  const patch = (part: Partial<StyleConfig>) => setStyle({ ...style, ...part })

  const changed =
    JSON.stringify({ ...style, version: 0 }) !==
    JSON.stringify({ ...buildDefaultStyleConfig(), version: 0 })

  return (
    <div className="drawer-mask" onClick={() => close(false)}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <h2>风格与模板</h2>
          {changed && <span className="tag">已改动</span>}
          <span className="card-spacer" />
          <button type="button" className="btn btn-sm" onClick={() => close(false)}>
            关闭
          </button>
        </div>

        <div className="drawer-body">
          <p className="hint" style={{ marginTop: 0 }}>
            这几块内容会注入到每一条提示词里。改这里，整套素材的提示词同步跟着变——
            这正是文档 §31「先统一，再扩充」要做的事。
          </p>

          <Field
            label="视角约束"
            hint="取自文档 §3.1，是防止 Krea 生成斜 45 度的关键"
            value={style.cameraClause}
            rows={6}
            onChange={(v) => patch({ cameraClause: v })}
          />

          <Field
            label="统一美术风格块"
            hint="取自文档 §4，建筑模板默认引用"
            value={style.styleBlock}
            rows={3}
            onChange={(v) => patch({ styleBlock: v })}
          />

          <div className="section">
            <div className="section-head">
              <h3>负面词</h3>
              <span className="hint">按素材家族分开，粘到 Krea 各自的负面框</span>
            </div>
            <label className="field-item" style={{ marginBottom: 8 }}>
              <input
                type="checkbox"
                checked={style.appendNegativeInline}
                onChange={(e) => patch({ appendNegativeInline: e.target.checked })}
              />
              <span>
                把负面词拼进正面提示词末尾
                <span className="hint">（只有一个输入框时打开；分开填效果通常更好）</span>
              </span>
            </label>
            <Field
              label="建筑"
              value={style.negative.building}
              onChange={(v) => patch({ negative: { ...style.negative, building: v } })}
              rows={2}
            />
            <Field
              label="地形"
              value={style.negative.terrain}
              onChange={(v) => patch({ negative: { ...style.negative, terrain: v } })}
              rows={2}
            />
            <Field
              label="装饰"
              value={style.negative.decoration}
              onChange={(v) => patch({ negative: { ...style.negative, decoration: v } })}
              rows={2}
            />
          </div>

          <div className="section template-editor">
            <div className="section-head">
              <h3>模板</h3>
              <span className="hint">占位符写成 {'{{名字}}'}，留空的占位符会自动收掉空行</span>
            </div>

            <Field
              label="建筑模板"
              hint="文档 §5"
              value={style.templates.building}
              rows={14}
              onChange={(v) => patch({ templates: { ...style.templates, building: v } })}
            />
            <Field
              label="地形模板"
              hint="文档 §17 / §18 / §20"
              value={style.templates.terrain}
              rows={12}
              onChange={(v) => patch({ templates: { ...style.templates, terrain: v } })}
            />
            <Field
              label="地形模板（独立件）"
              hint="木桥 / 码头 / 荷叶 / 芦苇，这些不是可拼接的 tile"
              value={style.templates.terrainObject}
              rows={12}
              onChange={(v) => patch({ templates: { ...style.templates, terrainObject: v } })}
            />
            <Field
              label="装饰模板"
              hint="文档 §32-C"
              value={style.templates.decoration}
              rows={12}
              onChange={(v) => patch({ templates: { ...style.templates, decoration: v } })}
            />
          </div>

          <div className="section">
            <div className="section-head">
              <h3>可用占位符</h3>
            </div>
            <div className="field-list">
              {TEMPLATE_VARS.map((v) => (
                <div key={v.key} className="field-item">
                  <span className="tag mono">{v.key}</span>
                  <span className="hint">{v.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {row && (
            <div className="section">
              <div className="section-head">
                <h3>实时预览</h3>
                <span className="hint">当前选中：{row.asset.zh}</span>
              </div>
              <div className="prompt-block">
                <div className="prompt-block-head">
                  <span>正面提示词</span>
                  <span className="card-spacer" />
                  <span className="hint">{row.prompt.wordCount} 词</span>
                </div>
                <div className="prompt-block-body">{row.prompt.positive}</div>
              </div>
            </div>
          )}
        </div>

        <div className="drawer-foot">
          <button
            type="button"
            className="btn"
            disabled={!changed}
            onClick={() => {
              resetStyle()
              toast('已恢复为文档里的默认风格与模板')
            }}
          >
            恢复默认
          </button>
          <span className="hint">
            改动即时生效，并自动保存到本地（不会改动目录数据本身）
          </span>
        </div>
      </div>
    </div>
  )
}
