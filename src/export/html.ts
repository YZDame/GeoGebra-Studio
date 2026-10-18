import path from 'path';
import { readFileSync } from 'fs';
import { gikzBrowserScripts } from './gikz';
import { viewerThemes } from './viewer-themes';

export interface HtmlOptions {
  /** Defaults to 2D for existing constructions. */
  mode?: '2D' | '3D';
  /** Native 3D camera bounds and direction; omitted bounds fit visible points. */
  view3D?: { bounds?: [number, number, number, number, number, number]; direction?: [number, number, number] };
  /** World-coordinate offsets for native LaTeX labels in 3D. */
  labelOffsets?: Record<string, [number, number, number]>;
  /** Kept for API compatibility; the viewer itself intentionally has no title. */
  title?: string;
  commands?: string[];
  ggbBase64?: string;
  /** Initial engine dimensions; the browser viewer resizes to its container. */
  width?: number;
  height?: number;
  /** Keep Cartesian axes visible in coordinate-based diagrams. */
  showAxes?: boolean;
  visibleLabels?: string[];
  captionOverrides?: Record<string, string>;
}

const viewerScript = () => readFileSync(path.join(__dirname, '../../dist/viewer.js'), 'utf8').replace(/<\/script/gi, '<\\/script');

const scriptJson = (value: unknown) => JSON.stringify(value)
  .replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

/** A responsive, title-free viewer for an embedded GGB or a semantic command construction. */
export function constructionHtml(options: HtmlOptions = {}): string {
  const cleaner = gikzBrowserScripts();
  const payload = scriptJson({
    mode: options.mode ?? '2D',
    ...(options.view3D ? { view3D: options.view3D } : {}),
    ...(options.labelOffsets ? { labelOffsets: options.labelOffsets } : {}),
    commands: options.commands ?? [],
    ...(options.ggbBase64 ? { ggbBase64: options.ggbBase64 } : {}),
    showAxes: options.showAxes === true,
    visibleLabels: options.visibleLabels ?? [],
    captionOverrides: options.captionOverrides ?? {}
  });

  return `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark"><title>GeoGebra</title>
<style>
:root{color-scheme:light;--paper:#fffcf0;--line:#e6e4d9;--ink:#100f0f;--muted:#6f6e69;--hover:#f2f0e5}
*{box-sizing:border-box}html,body{margin:0;height:100%;overflow:hidden;background:var(--paper);color:var(--ink);font:14px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Noto Sans CJK SC",sans-serif}
main{height:100dvh;width:100%;padding:12px 16px 16px;display:flex;flex-direction:column}
header{position:relative;z-index:10;display:flex;justify-content:flex-end;align-items:center;gap:8px;flex-shrink:0;min-height:42px;margin-bottom:8px}
.menu-control{position:relative}.control-button{display:inline-flex;align-items:center;justify-content:center;gap:8px;appearance:none;height:38px;min-width:72px;padding:0 14px;border:1px solid var(--line);border-radius:9px;background:var(--paper);color:var(--ink);font:inherit;cursor:pointer}
.control-button:hover,.control-button[aria-expanded="true"]{background:var(--hover)}.control-button:focus-visible,.viewer-menu button:focus-visible{outline:2px solid var(--blue);outline-offset:2px}.icon-button{min-width:38px;width:38px;padding:0}.control-button svg{width:18px;height:18px;flex-shrink:0}.chevron{width:12px!important;height:12px!important}
.viewer-menu{position:absolute;top:43px;right:0;z-index:20;display:none;min-width:170px;padding:5px;border:1px solid var(--line);border-radius:10px;background:var(--paper);box-shadow:0 12px 32px rgb(16 15 15 / 12%)}
.viewer-menu.open{display:grid}.viewer-menu button{display:flex;align-items:center;gap:10px;min-height:34px;padding:0 10px;border:0;border-radius:6px;background:transparent;color:var(--ink);text-align:left;font:inherit;cursor:pointer}
.viewer-menu button:hover,.viewer-menu button[aria-checked="true"]{background:var(--hover)}.viewer-menu{max-height:min(70vh,400px);overflow:auto}.theme-name{flex:1}.swatch{width:12px;height:12px;border-radius:50%;border:1px solid rgb(128 128 128 / 35%)}.sidebar-toggle{position:absolute;top:10px;left:10px;z-index:3;box-shadow:0 2px 8px rgb(0 0 0 / 7%)}.viewer-menu button:disabled{opacity:.5;cursor:wait}
.stage{position:relative;width:100%;flex:1;min-height:200px;overflow:hidden;border:1px solid var(--line);border-radius:10px;background:var(--paper)}
#ggb-element{position:absolute;inset:0;width:100%!important;height:100%!important;overflow:hidden}
#status{position:absolute;inset:0;z-index:2;display:grid;place-items:center;margin:0;padding:16px;color:var(--muted);background:var(--paper);text-align:center;pointer-events:none}
#status[hidden]{display:none}#status.error{color:#af3029}
@media(max-width:640px){main{padding:8px}.stage{border-radius:7px}header{margin-bottom:6px}}
@media print{main{width:100%;padding:0}header,.sidebar-toggle{display:none}.stage{border:0;border-radius:0}}
</style></head><body><main>
<header><div class="menu-control"><button id="theme-toggle" class="control-button" type="button" aria-label="选择主题" aria-expanded="false" aria-haspopup="menu" aria-controls="theme-menu"><span id="theme-name">默认</span><svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button><div id="theme-menu" class="viewer-menu" role="menu" aria-label="配色主题"></div></div>
<button id="mode-toggle" class="control-button icon-button" type="button" aria-label="切换深浅色"></button>
<div class="menu-control downloads"><button class="control-button download-toggle" id="download-toggle" type="button" aria-expanded="false" aria-haspopup="menu" aria-controls="download-menu" title="编辑后请下载当前 HTML 或 GGB 保存；刷新会恢复文件中的构造" disabled>下载</button>
<div class="viewer-menu" id="download-menu" role="menu" aria-label="下载格式">
<button type="button" role="menuitem" data-format="ggb">GeoGebra 文件</button>
<button type="button" role="menuitem" data-format="png">PNG 图片</button>
<button type="button" role="menuitem" data-format="svg">SVG 矢量图</button>
<button type="button" role="menuitem" data-format="tikz">TikZ 源文件 (.tex)</button>
<button type="button" role="menuitem" data-format="pdf">PDF 文档</button>
<button type="button" role="menuitem" data-format="xml">XML 源文件</button>
<button type="button" role="menuitem" data-format="html">交互 HTML</button></div></div></header>
<section class="stage" aria-label="GeoGebra 图形"><button id="sidebar-toggle" class="control-button icon-button sidebar-toggle" type="button" aria-label="展开对象栏" title="展开对象栏" aria-expanded="false" disabled><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M9 4v16m4-11 3 3-3 3"/></svg></button><p id="status" role="status" aria-live="polite">正在加载…</p><div id="ggb-element"></div></section></main>
<script id="construction-data" type="application/json">${payload}</script>
${cleaner}
<script id="viewer-themes" type="application/json">${scriptJson(viewerThemes)}</script>
<script>${viewerScript()}</script><script src="https://www.geogebra.org/apps/deployggb.js" onload="startGeoGebra()" onerror="failGeoGebra('GeoGebra 加载失败，请检查网络后刷新')"></script>
</body></html>`;
}
