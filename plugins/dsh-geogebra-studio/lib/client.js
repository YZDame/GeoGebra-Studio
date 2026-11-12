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
  lead: "\u8FD9\u4E2A\u6309\u94AE\u53EA\u6253\u5F00\u4F7F\u7528\u8BF4\u660E\u3002\u5B83\u4E0D\u4F1A\u5B89\u88C5 Skill\uFF0C\u4E5F\u4E0D\u4F1A\u753B\u51FA\u56FE\u5F62\u3002",
  invoke: "\u5B89\u88C5 Skill \u4E4B\u540E\uFF0C\u5728\u5BF9\u8BDD\u91CC\u8F93\u5165 /geogebra-studio\u3002",
  requirements: "\u9700\u8981 Node.js 22.12+\u3001\u6587\u4EF6\u5199\u5165\u548C\u547D\u4EE4\u6267\u884C\u6743\u9650\u3002\u5BA2\u6237\u7AEF\u80FD\u6253\u5F00\u672C\u673A\u5730\u5740\u65F6\uFF0C\u4F18\u5148\u4F7F\u7528 HTTP \u9884\u89C8\u3002",
  promptLabel: "\u53EF\u4EE5\u590D\u5236\u7ED9 Agent \u7684\u5F00\u5934",
  prompt: "Use the geogebra-studio skill to create an editable GeoGebra HTML construction and open the HTTP preview.",
  copy: "\u590D\u5236",
  copied: "\u5DF2\u590D\u5236",
  skillInstall: "Skill \u5B89\u88C5\u547D\u4EE4\u3002\u4E0D\u8981\u5BF9 Skill \u76EE\u5F55\u6267\u884C dsh plugin add\u3002",
  skillCommand: "npx skills add YZDame/GeoGebra-Studio --skill geogebra-studio"
};
var en = {
  label: "GeoGebra",
  title: "GeoGebra Studio",
  close: "Close",
  unofficial: "An independent project. Not affiliated with GeoGebra.",
  lead: "This button opens a guide. It does not install the Skill and it does not draw a figure.",
  invoke: "After the Skill is installed, type /geogebra-studio in chat.",
  requirements: "Requires Node.js 22.12+, plus file and shell access. Prefer the HTTP preview when the client can open a loopback URL.",
  promptLabel: "Starter text you can copy to the agent",
  prompt: "Use the geogebra-studio skill to create an editable GeoGebra HTML construction and open the HTTP preview.",
  copy: "Copy",
  copied: "Copied",
  skillInstall: "Skill install command. Do not run dsh plugin add on the Skill directory.",
  skillCommand: "npx skills add YZDame/GeoGebra-Studio --skill geogebra-studio"
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
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ggs_label", children: t("promptLabel") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { className: "ggs_pre", children: t("prompt") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ggs_actions", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "ggs_btn", onClick: copyPrompt, children: copied ? t("copied") : t("copy") }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ggs_label", children: t("skillInstall") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { className: "ggs_pre", children: t("skillCommand") })
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
