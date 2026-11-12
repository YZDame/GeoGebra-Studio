window.__ModuleLoader__.load({
 id: "dsh-geogebra-studio",
 factory: (require) => {
 var module = { exports: {} };
 var exports = module.exports;
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client.jsx
var client_exports = {};
__export(client_exports, {
  apply: () => apply,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(client_exports);
var import_react = require("react");
var import_react_dom = require("react-dom");
var import_jsx_runtime = require("react/jsx-runtime");
var NS = "geogebraStudio";
var name = "dsh-geogebra-studio";
var inject = ["slots", "locale"];
var zh = {
  label: "GeoGebra",
  title: "GeoGebra Studio",
  close: "\u5173\u95ED",
  unofficial: "\u72EC\u7ACB\u9879\u76EE\uFF0C\u4E0E GeoGebra \u5B98\u65B9\u65E0\u96B6\u5C5E\u5173\u7CFB\u3002",
  lead: "\u8FD9\u4E2A\u63D2\u4EF6\u63D0\u4F9B\u4E09\u4E2A\u5DE5\u5177\uFF0C\u5E76\u5185\u7F6E geogebra-studio Skill\u3002\u5728\u5BF9\u8BDD\u91CC\u63CF\u8FF0\u56FE\u5F62\uFF0CAgent \u4F1A\u5199\u51FA\u53EF\u7F16\u8F91\u7684 HTML\u3001\u542F\u52A8\u672C\u673A\u9884\u89C8\u5E76\u5BFC\u51FA\u6E90\u7801\u3002",
  toolsLabel: "\u63D2\u4EF6\u63D0\u4F9B\u7684\u5DE5\u5177",
  tools: "geogebra_build \u2014 \u4ECE JSON \u89C4\u683C\u751F\u6210\u65B0\u7684 HTML \u56FE\u5F62\ngeogebra_preview \u2014 \u5728\u672C\u673A\u5730\u5740\u9884\u89C8\u56FE\u5F62\ngeogebra_export \u2014 \u5BFC\u51FA TSQX\u3001Asymptote \u6216 TikZ",
  invoke: "\u76F4\u63A5\u8BF4\u660E\u8981\u753B\u7684\u56FE\u5F62\u5373\u53EF\uFF1B\u9700\u8981\u56FA\u5B9A\u683C\u5F0F\u65F6\u53EF\u4EE5\u5728\u6D88\u606F\u91CC\u70B9\u540D\u8FD9\u4E9B\u5DE5\u5177\u3002",
  requirements: "\u9700\u8981\u5DE5\u4F5C\u533A\u5199\u5165\u6743\u9650\u3002\u9884\u89C8\u4F7F\u7528\u672C\u673A\u5730\u5740\uFF0C\u6E32\u67D3\u65F6\u6D4F\u89C8\u5668\u8981\u8054\u7F51\u52A0\u8F7D GeoGebra \u5B98\u65B9\u5F15\u64CE\uFF1B\u751F\u6210 HTML \u672C\u8EAB\u4E0D\u9700\u8981\u8054\u7F51\u3002",
  promptLabel: "\u53EF\u4EE5\u590D\u5236\u7ED9 Agent \u7684\u5F00\u5934",
  prompt: "Use the GeoGebra Studio tools to draw a circle through three points. Open the preview, then export TikZ.",
  copy: "\u590D\u5236",
  copied: "\u5DF2\u590D\u5236"
};
var en = {
  label: "GeoGebra",
  title: "GeoGebra Studio",
  close: "Close",
  unofficial: "An independent project. Not affiliated with GeoGebra.",
  lead: "This plugin adds three tools and ships the geogebra-studio skill. Describe a figure in chat and the agent writes an editable HTML file, serves a local preview and exports source.",
  toolsLabel: "Tools in this plugin",
  tools: "geogebra_build \u2014 generate a new HTML construction from a JSON spec\ngeogebra_preview \u2014 serve the figure on a loopback URL\ngeogebra_export \u2014 export TSQX, Asymptote or TikZ",
  invoke: "Ask for the figure directly; name a tool when you need a specific output.",
  requirements: "Requires workspace write access. Previews use a loopback URL and the browser needs internet access for the official GeoGebra engine; writing the HTML works offline.",
  promptLabel: "Starter text you can copy to the agent",
  prompt: "Use the GeoGebra Studio tools to draw a circle through three points. Open the preview, then export TikZ.",
  copy: "Copy",
  copied: "Copied"
};
var css = `
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
`;
function injectStyles() {
  if (typeof document === "undefined") return () => {
  };
  const marker = 'style[data-plugin-css="dsh-geogebra-studio/main"]';
  const existing = document.querySelector(marker);
  if (existing !== null) return () => {
  };
  const tag = document.createElement("style");
  tag.dataset.plugin = "dsh-geogebra-studio";
  tag.dataset.pluginCss = "dsh-geogebra-studio/main";
  tag.textContent = css;
  document.head.appendChild(tag);
  return () => {
    tag.remove();
  };
}
function GeometryIcon() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { className: "ggs_icon", width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { cx: "8", cy: "8", r: "6.25", stroke: "currentColor", strokeWidth: "1.4" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M4.2 11.2 8 4.6l3.8 6.6H4.2Z", stroke: "currentColor", strokeWidth: "1.3", strokeLinejoin: "round" })
  ] });
}
function FooterButton(props) {
  const wide = props.wide;
  const t = props.t;
  const [open, setOpen] = (0, import_react.useState)(false);
  const [copied, setCopied] = (0, import_react.useState)(false);
  (0, import_react.useEffect)(() => {
    if (!open) return void 0;
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  async function copyPrompt() {
    const text = t("prompt");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }
  const dialog = open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "div",
    {
      className: "ggs_overlay",
      onClick: () => setOpen(false),
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        "div",
        {
          className: "ggs_panel",
          role: "dialog",
          "aria-modal": "true",
          "aria-labelledby": "ggs-geogebra-title",
          onClick: (event) => event.stopPropagation(),
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ggs_head", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GeometryIcon, {}),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { className: "ggs_title", id: "ggs-geogebra-title", children: t("title") }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "ggs_iconBtn", "aria-label": t("close"), onClick: () => setOpen(false), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M4 4l8 8M12 4l-8 8", stroke: "currentColor", strokeWidth: "1.4" }) }) })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "ggs_note", children: t("unofficial") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "ggs_text", children: t("lead") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "ggs_text", children: t("invoke") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "ggs_text", children: t("requirements") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ggs_label", children: t("toolsLabel") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { className: "ggs_pre", children: t("tools") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ggs_label", children: t("promptLabel") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { className: "ggs_pre", children: t("prompt") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ggs_actions", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "ggs_btn", onClick: copyPrompt, children: copied ? t("copied") : t("copy") }) })
          ]
        }
      )
    }
  ) : null;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "button",
      {
        type: "button",
        className: wide === false ? "ggs_footBtn ggs_footBtnRail" : "ggs_footBtn",
        "data-ggs-footer": "geogebra",
        "data-wide": wide === false ? "false" : "true",
        "aria-expanded": open,
        "aria-haspopup": "dialog",
        "aria-label": t("title"),
        title: t("title"),
        onClick: () => setOpen((value) => !value),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GeometryIcon, {}),
          wide === false ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("label") })
        ]
      }
    ),
    dialog !== null && typeof document !== "undefined" ? (0, import_react_dom.createPortal)(dialog, document.body) : null
  ] });
}
function apply(ctx) {
  const t = ctx.locale.bind(NS);
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), "geogebra-studio: dictionaries");
  ctx.effect(injectStyles, "geogebra-studio: stylesheet");
  ctx.effect(
    () => ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
      name: "sidebar.footer.action",
      id: "dsh-geogebra-studio",
      order: 20,
      label: () => t("label"),
      locale: NS
    }, FooterButton)),
    "geogebra-studio: sidebar action"
  );
}
 return module.exports;
 }
});
