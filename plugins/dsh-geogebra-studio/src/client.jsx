/** Client half: one sidebar-foot button that opens the GeoGebra Studio guide. */

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const NS = 'geogebraStudio'

export const name = 'dsh-geogebra-studio'

export const inject = ['slots', 'locale']

const zh = {
  label: 'GeoGebra',
  title: 'GeoGebra Studio',
  close: '关闭',
  unofficial: '独立项目，与 GeoGebra 官方无隶属关系。',
  lead: '这个插件提供三个工具，并内置 geogebra-studio Skill。在对话里描述图形，Agent 会写出可编辑的 HTML、启动本机预览并导出源码。',
  toolsLabel: '插件提供的工具',
  tools: 'geogebra_build — 从 JSON 规格生成新的 HTML 图形\ngeogebra_preview — 在本机地址预览图形\ngeogebra_export — 导出 TSQX、Asymptote 或 TikZ',
  invoke: '直接说明要画的图形即可；需要固定格式时可以在消息里点名这些工具。',
  requirements: '需要工作区写入权限。预览使用本机地址，渲染时浏览器要联网加载 GeoGebra 官方引擎；生成 HTML 本身不需要联网。',
  promptLabel: '可以复制给 Agent 的开头',
  prompt: 'Use the GeoGebra Studio tools to draw a circle through three points. Open the preview, then export TikZ.',
  copy: '复制',
  copied: '已复制',
}

const en = {
  label: 'GeoGebra',
  title: 'GeoGebra Studio',
  close: 'Close',
  unofficial: 'An independent project. Not affiliated with GeoGebra.',
  lead: 'This plugin adds three tools and ships the geogebra-studio skill. Describe a figure in chat and the agent writes an editable HTML file, serves a local preview and exports source.',
  toolsLabel: 'Tools in this plugin',
  tools: 'geogebra_build — generate a new HTML construction from a JSON spec\ngeogebra_preview — serve the figure on a loopback URL\ngeogebra_export — export TSQX, Asymptote or TikZ',
  invoke: 'Ask for the figure directly; name a tool when you need a specific output.',
  requirements: 'Requires workspace write access. Previews use a loopback URL and the browser needs internet access for the official GeoGebra engine; writing the HTML works offline.',
  promptLabel: 'Starter text you can copy to the agent',
  prompt: 'Use the GeoGebra Studio tools to draw a circle through three points. Open the preview, then export TikZ.',
  copy: 'Copy',
  copied: 'Copied',
}

const css = `
.ggs_footBtn{box-sizing:border-box;display:flex;align-items:center;gap:8px;width:calc(100% + 8px);height:34px;margin:4px -4px;padding:6px 2px 6px 10px;cursor:pointer;border:none;background:transparent;color:var(--dsw-alias-label-primary);border-radius:12px;font-family:inherit;font-size:14px;line-height:22px;overflow:hidden}
.ggs_footBtn:hover,.ggs_footBtn[aria-expanded="true"]{background:var(--dsw-alias-interactive-bg-hover)}
.ggs_footBtnRail{width:36px;height:36px;gap:0;justify-content:center;border-radius:50%;padding:0;margin:4px auto}
.ggs_icon{display:block;flex:none}
.ggs_overlay{position:fixed;inset:0;z-index:9990;background:var(--dsw-alias-bg-mask-2);display:flex;align-items:center;justify-content:center;padding:24px}
.ggs_panel{width:440px;max-width:100%;max-height:min(640px,88vh);overflow:auto;display:flex;flex-direction:column;gap:12px;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l2);border-radius:14px;box-shadow:var(--dsw-elevation-prominent);padding:16px}
.ggs_head{display:flex;align-items:center;gap:8px}
.ggs_title{font-weight:600;font-size:14px;color:var(--dsw-alias-label-primary);flex:1}
.ggs_iconBtn{cursor:pointer;border:none;background:transparent;color:var(--dsw-alias-label-secondary);border-radius:6px;padding:4px;display:inline-flex}
.ggs_iconBtn:hover{background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary)}
.ggs_text{margin:0;font-size:13px;line-height:1.5;color:var(--dsw-alias-label-secondary)}
.ggs_note{margin:0;font-size:12px;line-height:1.5;color:var(--dsw-alias-label-tertiary)}
.ggs_label{font-size:12px;font-weight:600;color:var(--dsw-alias-label-tertiary)}
.ggs_pre{margin:0;background:var(--dsw-alias-bg-layer-3);border:1px solid var(--dsw-alias-border-l2);border-radius:10px;padding:10px 12px;font-size:12px;color:var(--dsw-alias-label-secondary);white-space:pre-wrap;word-break:break-word}
.ggs_actions{display:flex;gap:8px}
.ggs_btn{cursor:pointer;font:inherit;font-size:12px;line-height:18px;padding:4px 10px;border-radius:8px;border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary)}
.ggs_btn:hover{background:var(--dsw-alias-bg-layer-3)}
`

function injectStyles() {
  if (typeof document === 'undefined') return () => {}
  const marker = 'style[data-plugin-css="dsh-geogebra-studio/main"]'
  const existing = document.querySelector(marker)
  if (existing !== null) return () => {}
  const tag = document.createElement('style')
  tag.dataset.plugin = 'dsh-geogebra-studio'
  tag.dataset.pluginCss = 'dsh-geogebra-studio/main'
  tag.textContent = css
  document.head.appendChild(tag)
  return () => { tag.remove() }
}

function GeometryIcon() {
  return (
    <svg className="ggs_icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.4" />
      <path d="M4.2 11.2 8 4.6l3.8 6.6H4.2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  )
}

function FooterButton(props) {
  const wide = props.wide
  const t = props.t
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  async function copyPrompt() {
    const text = t('prompt')
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  const dialog = open ? (
    <div
      className="ggs_overlay"
      onClick={() => setOpen(false)}
    >
      <div
        className="ggs_panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ggs-geogebra-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ggs_head">
          <GeometryIcon />
          <h2 className="ggs_title" id="ggs-geogebra-title">{t('title')}</h2>
          <button type="button" className="ggs_iconBtn" aria-label={t('close')} onClick={() => setOpen(false)}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </button>
        </div>
        <p className="ggs_note">{t('unofficial')}</p>
        <p className="ggs_text">{t('lead')}</p>
        <p className="ggs_text">{t('invoke')}</p>
        <p className="ggs_text">{t('requirements')}</p>
        <div className="ggs_label">{t('toolsLabel')}</div>
        <pre className="ggs_pre">{t('tools')}</pre>
        <div className="ggs_label">{t('promptLabel')}</div>
        <pre className="ggs_pre">{t('prompt')}</pre>
        <div className="ggs_actions">
          <button type="button" className="ggs_btn" onClick={copyPrompt}>{copied ? t('copied') : t('copy')}</button>
        </div>
      </div>
    </div>
  ) : null

  return (
    <>
      <button
        type="button"
        className={wide === false ? 'ggs_footBtn ggs_footBtnRail' : 'ggs_footBtn'}
        data-ggs-footer="geogebra"
        data-wide={wide === false ? 'false' : 'true'}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={t('title')}
        title={t('title')}
        onClick={() => setOpen((value) => !value)}
      >
        <GeometryIcon />
        {wide === false ? null : <span>{t('label')}</span>}
      </button>
      {dialog !== null && typeof document !== 'undefined' ? createPortal(dialog, document.body) : null}
    </>
  )
}

export function apply(ctx) {
  const t = ctx.locale.bind(NS)
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'geogebra-studio: dictionaries')
  ctx.effect(injectStyles, 'geogebra-studio: stylesheet')
  ctx.effect(
    () => ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
      name: 'sidebar.footer.action',
      id: 'dsh-geogebra-studio',
      order: 20,
      label: () => t('label'),
      locale: NS,
    }, FooterButton)),
    'geogebra-studio: sidebar action',
  )
}
