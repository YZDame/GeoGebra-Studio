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

// plugins/dsh-geogebra-studio/src/client.jsx
var client_exports = {};
__export(client_exports, {
  GeoGebraCanvas: () => GeoGebraCanvas,
  apply: () => apply,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(client_exports);
var import_react = require("react");
var import_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
var import_jsx_runtime = require("react/jsx-runtime");
var NS = "geogebraStudio";
var PANEL_ID = "geogebra";
var TAB_KIND = "geogebra-studio";
var TAB_ID = "dsh-geogebra-studio";
var STATE_PATH = "/dsh-geogebra-studio/state";
var VIEWER_PATH = "/dsh-geogebra-studio/viewer";
var name = "dsh-geogebra-studio";
var inject = ["slots", "locale", "layout", "sidebarRight", "sidebarRightTabs"];
var zh = {
  panel: "GeoGebra Studio",
  tab: "GeoGebra"
};
var en = {
  panel: "GeoGebra Studio",
  tab: "GeoGebra"
};
function GeoGebraPanelIcon({ size }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.IconCompareSplitOutlineRegular, { size });
}
function GeoGebraCanvas({ sessionId }) {
  const [version, setVersion] = (0, import_react.useState)(0);
  (0, import_react.useEffect)(() => {
    if (sessionId === void 0) return void 0;
    setVersion(0);
    let active = true;
    let timer;
    const poll = async () => {
      try {
        const response = await fetch(
          `${STATE_PATH}?session=${encodeURIComponent(sessionId)}`,
          { cache: "no-store", credentials: "same-origin" }
        );
        if (!response.ok) return;
        const state = await response.json();
        if (!active) return;
        const next = Number(state?.version);
        if (Number.isInteger(next) && next >= 0) {
          setVersion((current) => current === next ? current : next);
        }
      } catch {
      }
    };
    void poll();
    timer = window.setInterval(poll, 800);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [sessionId]);
  if (sessionId === void 0) return null;
  const src = `${VIEWER_PATH}?session=${encodeURIComponent(sessionId)}&v=${version}`;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "div",
    {
      "data-geogebra-canvas": true,
      style: {
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 0,
        background: "var(--dsw-alias-bg-layer-1)"
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "iframe",
        {
          src,
          title: "GeoGebra Studio",
          allow: "clipboard-write; fullscreen",
          style: {
            position: "absolute",
            inset: 0,
            display: "block",
            width: "100%",
            height: "100%",
            border: 0
          }
        },
        src
      )
    }
  );
}
function Launcher({ launch }) {
  (0, import_react.useLayoutEffect)(() => {
    launch();
  }, []);
  return null;
}
function apply(ctx) {
  const t = ctx.locale.bind(NS);
  ctx.effect(
    () => ctx.locale.register(NS, { zh, en }),
    "geogebra-studio: dictionaries"
  );
  ctx.effect(
    () => ctx.sidebarRightTabs.register({
      id: TAB_ID,
      kind: TAB_KIND,
      title: () => t("tab")
    }),
    "geogebra-studio: right tab type"
  );
  ctx.effect(
    () => ctx.slots.inject("sidebar.right.pane.tab", () => ctx.slots.register({
      name: "sidebar.right.pane.tab",
      key: TAB_ID,
      locale: NS
    }, GeoGebraCanvas)),
    "geogebra-studio: right tab body"
  );
  ctx.effect(
    () => ctx.slots.inject("main", () => ctx.slots.register({
      name: "main",
      key: PANEL_ID,
      locale: NS,
      inject: () => ({
        launch: () => {
          ctx.layout.selectPanel(null);
          const open = () => {
            try {
              ctx.sidebarRight.openTab(TAB_KIND);
            } catch {
            }
          };
          open();
          setTimeout(open, 0);
        }
      })
    }, Launcher)),
    "geogebra-studio: launcher panel"
  );
  ctx.effect(
    () => ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({
      name: "sidebar.panellist",
      id: PANEL_ID,
      order: 20,
      locale: NS,
      label: () => t("panel")
    }, GeoGebraPanelIcon)),
    "geogebra-studio: sidebar entry"
  );
}
 return module.exports;
 }
});
