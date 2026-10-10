import { useState } from 'react'
import { CATALOG_VERSION, suggestedPath } from '../data/assets'
import { FAMILY_LABEL, STATUS_LABEL, categoryLabel } from '../data/types'
import { buildRows, useEffectiveAssets, useFilteredAssets, type PromptRow } from '../store/selectors'
import { useAppStore } from '../store/useAppStore'
import { copyText, downloadJson, downloadText } from '../store/persist'
import { toast } from './Toast'

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

function toMarkdown(rows: PromptRow[]): string {
  const lines = ['# 中式 RPG 城镇素材 · 提示词清单', '', `共 ${rows.length} 项`, '']
  rows.forEach(({ asset, prompt, status, images }, i) => {
    lines.push(
      `## ${String(i + 1).padStart(2, '0')} · ${asset.zh}`,
      '',
      `- id: \`${asset.id}\``,
      `- 家族: ${FAMILY_LABEL[asset.family]} / ${categoryLabel(asset.category)}`,
      `- 状态: ${STATUS_LABEL[status]}`,
      `- 建议目录: \`${suggestedPath(asset)}\``,
    )
    if (images.length) {
      // 第一张嵌成图片，其余列成链接——这份 md 在编辑器里预览就是个小画廊
      lines.push('', `![${asset.zh}](${images[0]})`)
      lines.push(...images.slice(1).map((u) => `- ${u}`))
    }
    lines.push('', '### 正面提示词', '', '```text', prompt.positive, '```', '')
    if (prompt.negative) {
      lines.push('### 负面提示词', '', '```text', prompt.negative, '```', '')
    }
  })
  return lines.join('\n')
}

function toPlainText(rows: PromptRow[]): string {
  return rows
    .map(
      ({ asset, prompt, images }, i) =>
        `${String(i + 1).padStart(2, '0')}. ${asset.zh}  (${asset.id})` +
        (images.length ? `\n[IMG] ${images.join('\n[IMG] ')}` : '') +
        `\n${prompt.positive}` +
        (prompt.negative ? `\n[NEGATIVE] ${prompt.negative}` : ''),
    )
    .join('\n\n' + '─'.repeat(60) + '\n\n')
}

/** 只要链接，方便一次性贴到别处（比如批量下载脚本的输入）。 */
function toImageList(rows: PromptRow[]): string {
  return rows
    .flatMap(({ asset, images }) => images.map((u) => `${asset.id}\t${asset.zh}\t${u}`))
    .join('\n')
}

function toCsv(rows: PromptRow[]): string {
  const header = [
    'id', '中文名', '英文名', '家族', '分类', '阶段', '状态',
    '图片链接', '正面提示词', '负面提示词', '建议目录',
  ]
  const body = rows.map(({ asset, prompt, status, images }) =>
    [
      asset.id,
      asset.zh,
      asset.en,
      FAMILY_LABEL[asset.family],
      categoryLabel(asset.category),
      asset.phase ? String(asset.phase) : '',
      STATUS_LABEL[status],
      images.join(' | '),
      prompt.positive,
      prompt.negative,
      suggestedPath(asset),
    ]
      .map((v) => csvCell(String(v)))
      .join(','),
  )
  // 带 BOM，Excel 打开中文不乱码
  return '﻿' + [header.map(csvCell).join(','), ...body].join('\r\n')
}

/** 按文档 §24 的目录结构导出清单，方便直接照着建文件夹、放图。 */
function toTree(rows: PromptRow[]): string {
  const byPath = new Map<string, PromptRow[]>()
  for (const row of rows) {
    const path = suggestedPath(row.asset)
    const list = byPath.get(path) ?? []
    list.push(row)
    byPath.set(path, list)
  }
  const lines = ['Chinese_RPG_Town/', '']
  for (const [path, list] of [...byPath.entries()].sort()) {
    lines.push(`  ${path}/`)
    for (const { asset, status } of list) {
      lines.push(`    ${STATUS_LABEL[status] === '未生成' ? '[ ]' : '[x]'} ${asset.zh}  (${asset.id})`)
    }
    lines.push('')
  }
  return lines.join('\n')
}

export function BatchPanel() {
  const close = useAppStore((s) => s.toggleBatch)
  const patches = useAppStore((s) => s.patches)
  const style = useAppStore((s) => s.style)
  const query = useAppStore((s) => s.query)
  const toggleSave = useAppStore((s) => s.toggleSave)
  const filtered = useFilteredAssets()
  // 用有效素材表，不能直接用 ASSETS——那样会漏掉用户自建的建筑
  const allAssets = useEffectiveAssets()

  const [scope, setScope] = useState<'filtered' | 'all'>('filtered')

  const isFiltered = scope === 'filtered' && filtered.length !== allAssets.length
  const assets = scope === 'filtered' ? filtered : allAssets
  const rows = buildRows(assets, patches, style)
  const localCount = Object.keys(patches).length
  const stamp = new Date().toISOString().slice(0, 10)

  return (
    <div className="drawer-mask" onClick={() => close(false)}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <h2>批量导出</h2>
          <span className="card-spacer" />
          <button type="button" className="btn btn-sm" onClick={() => close(false)}>
            关闭
          </button>
        </div>

        <div className="drawer-body">
          <div className="section">
            <div className="section-head">
              <h3>导出范围</h3>
            </div>
            <div className="filter-row">
              <button
                type="button"
                className={scope === 'filtered' ? 'chip chip-active' : 'chip'}
                onClick={() => setScope('filtered')}
                disabled={!filtered.length}
              >
                当前筛选结果（{filtered.length}）
              </button>
              <button
                type="button"
                className={scope === 'all' ? 'chip chip-active' : 'chip'}
                onClick={() => setScope('all')}
              >
                全部素材（{allAssets.length}）
              </button>
            </div>
            <p className="hint" style={{ marginBottom: 0 }}>
              {isFiltered
                ? '正在按左侧的筛选条件导出。想导全部就切到「全部素材」。'
                : '导出的是这批复制的最终版本——包含你在单项里做过的提示词修改。'}
            </p>
          </div>

          <div className="section">
            <div className="section-head">
              <h3>复制提示词</h3>
            </div>
            <div className="filter-row">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={async () => {
                  const ok = await copyText(toPlainText(rows))
                  toast(ok ? `已复制 ${rows.length} 条提示词` : '复制失败，改用导出文件', !ok)
                }}
              >
                复制全部提示词（纯文本）
              </button>
              <button
                type="button"
                className="btn btn-sm"
                onClick={async () => {
                  const ok = await copyText(toTree(rows))
                  toast(ok ? '目录清单已复制' : '复制失败', !ok)
                }}
              >
                复制目录清单
              </button>
              <button
                type="button"
                className="btn btn-sm"
                disabled={!rows.some((r) => r.images.length)}
                title="id + 中文名 + 链接，制表符分隔"
                onClick={async () => {
                  const text = toImageList(rows)
                  const n = text ? text.split('\n').length : 0
                  const ok = await copyText(text)
                  toast(ok ? `已复制 ${n} 条图片链接` : '复制失败', !ok)
                }}
              >
                复制图片链接
              </button>
            </div>
          </div>

          <div className="section">
            <div className="section-head">
              <h3>导出文件</h3>
            </div>
            <div className="filter-row">
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => {
                  downloadText(`prompts-${stamp}.md`, toMarkdown(rows), 'text/markdown')
                  toast('已导出 Markdown 提示词清单')
                }}
              >
                提示词 prompts.md
              </button>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => {
                  downloadText(`prompts-${stamp}.csv`, toCsv(rows), 'text/csv')
                  toast('已导出 CSV')
                }}
              >
                提示词 prompts.csv
              </button>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => {
                  downloadText(`catalog-tree-${stamp}.txt`, toTree(rows))
                  toast('已导出目录清单')
                }}
              >
                目录清单 txt
              </button>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => {
                  downloadJson(`catalog-${stamp}.json`, {
                    catalogVersion: CATALOG_VERSION,
                    assets: allAssets,
                  })
                  toast('已导出目录数据')
                }}
              >
                目录数据 catalog.json
              </button>
              <button
                type="button"
                className="btn btn-sm"
                disabled={!rows.some((r) => r.images.length)}
                onClick={() => {
                  downloadText(`image-links-${stamp}.txt`, toImageList(rows))
                  toast('已导出图片链接清单')
                }}
              >
                图片链接 txt
              </button>
            </div>
          </div>

          <div className="section">
            <div className="section-head">
              <h3>存档</h3>
              <span className="hint">当前有 {localCount} 项被标记或改过</span>
            </div>
            <p className="hint" style={{ marginTop: 0 }}>
              进度、备注、改过的提示词、图片链接和风格配置都在存档文件里。
              导出、导入、清空都挪到了顶栏的「存档」面板。
            </p>
            <div className="filter-row">
              <button type="button" className="btn btn-sm" onClick={() => toggleSave(true)}>
                打开存档面板
              </button>
            </div>
          </div>

          <div className="section">
            <div className="section-head">
              <h3>预览</h3>
              <span className="hint">前 3 条</span>
            </div>
            {rows.slice(0, 3).map(({ asset, prompt }) => (
              <div className="prompt-block" key={asset.id}>
                <div className="prompt-block-head">
                  <span>{asset.zh}</span>
                  <span className="card-spacer" />
                  <span className="hint mono">{asset.id}</span>
                </div>
                <div className="prompt-block-body">
                  {prompt.positive.length > 260
                    ? prompt.positive.slice(0, 260) + ' …'
                    : prompt.positive}
                </div>
              </div>
            ))}
            {query.text && (
              <p className="hint">当前搜索词「{query.text}」也会影响导出范围。</p>
            )}
          </div>
        </div>

        <div className="drawer-foot">
          <span className="hint">
            导出的是提示词和图片链接，不含图片本体——图片存在你自己的图床/网盘上。
          </span>
        </div>
      </div>
    </div>
  )
}
