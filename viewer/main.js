import { executeViewerActionCommand } from '../src/export/viewer-action-commands';
import { executeViewerCommand } from '../src/export/viewer-command-executor';
import { executeViewerStyleCommand, executeViewerViewportCommand } from '../src/export/viewer-style-commands';

(() => {
  (() => {
    const specification = JSON.parse(document.getElementById("construction-data").textContent);
    const is3D = specification.mode === "3D";
    const graphicsPerspective = is3D ? "T" : "G";
    const host = document.getElementById("ggb-element"), status = document.getElementById("status");
    const toggle = document.getElementById("download-toggle"), menu = document.getElementById("download-menu");
    const themes = JSON.parse(document.getElementById("viewer-themes").textContent);
    const themeMenu = document.getElementById("theme-menu"), themeToggle = document.getElementById("theme-toggle"), modeToggle = document.getElementById("mode-toggle"), sidebarToggle = document.getElementById("sidebar-toggle");
    const themeNames = { default: "\u9ED8\u8BA4", ayu: "Ayu", catppuccin: "Catppuccin", everforest: "Everforest", gruvbox: "Gruvbox", "rose-pine": "Ros\xE9 Pine", nord: "Nord", solarized: "Solarized", flexoki: "Flexoki" };
    themeMenu.replaceChildren();
    for (const name of Object.keys(themes)) {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.theme = name;
      button.setAttribute("role", "menuitemradio");
      const label = document.createElement("span");
      label.className = "theme-name";
      label.textContent = themeNames[name];
      button.append(label);
      for (const palette of themes[name]) {
        const swatch = document.createElement("span");
        swatch.className = "swatch";
        swatch.style.background = palette.paper;
        swatch.setAttribute("aria-hidden", "true");
        button.append(swatch);
      }
      themeMenu.append(button);
    }
    const explicitColorObjects = new Set();
    let api, ready = false, resizeObserver, resizeFrame, resizeVersion = 0, sidebarOpen = false, objectThemeApplied = false;
    const themeObjectColors = new Set(Object.values(themes).flat().flatMap((p) => [p.ink, p.blue]).concat(["#000000", "#666666", "#4d4dff"]).map((c) => c.toLowerCase()));
    const validTheme = (value) => typeof value === "string" && /^[a-z-]+:[01]$/.test(value) && Object.hasOwn(themes, value.split(":")[0]);
    let chosenTheme = validTheme(specification.theme) ? specification.theme : "default:0";
    try {
      const saved = localStorage.getItem("geogebra-viewer-theme");
      if (validTheme(saved)) chosenTheme = saved;
    } catch (_) {
    }
    function applyTheme() {
      const [name, mode] = chosenTheme.split(":");
      const palette = themes[name][Number(mode)];
      for (const [key, value] of Object.entries(palette)) document.documentElement.style.setProperty("--" + key, value);
      document.documentElement.style.colorScheme = Number(mode) ? "dark" : "light";
      document.getElementById("theme-name").textContent = themeNames[name];
      for (const button of themeMenu.querySelectorAll("[data-theme]")) button.setAttribute("aria-checked", String(button.dataset.theme === name));
      const action = Number(mode) ? "\u5207\u6362\u4E3A\u6D45\u8272" : "\u5207\u6362\u4E3A\u6DF1\u8272";
      modeToggle.setAttribute("aria-label", action);
      modeToggle.title = action;
      modeToggle.setAttribute("aria-pressed", String(Boolean(Number(mode))));
      modeToggle.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (Number(mode) ? '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5"/>' : '<path d="M20.8 13A9 9 0 0 1 11 3.2 9 9 0 1 0 20.8 13Z"/>') + "</svg>";
      if (api) {
        const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
        api.setGraphicsOptions(is3D ? 3 : 1, { bgColor: palette.paper, axesColor: palette.muted, gridColor: palette.line });
        for (const object of api.getAllObjectNames()) {
          const type = api.getObjectType(object);
          if (!explicitColorObjects.has(object) && ["point", "text", "line", "segment", "ray", "circle", "conic"].includes(type) && (!objectThemeApplied && !specification.ggbBase64 || themeObjectColors.has(api.getColor(object).toLowerCase()))) api.setColor(object, ...rgb(type === "point" && api.isMoveable(object) ? palette.blue : palette.ink));
        }
        objectThemeApplied = true;
      }
    }
    function saveTheme() {
      try {
        localStorage.setItem("geogebra-viewer-theme", chosenTheme);
      } catch (_) {
      }
      applyTheme();
    }
    themeMenu.addEventListener("click", (event) => {
      const button = event.target.closest("[data-theme]");
      if (!button) return;
      chosenTheme = button.dataset.theme + ":" + chosenTheme.split(":")[1];
      saveTheme();
      closeMenus();
      themeToggle.focus();
    });
    modeToggle.addEventListener("click", () => {
      chosenTheme = chosenTheme.split(":")[0] + ":" + (chosenTheme.endsWith(":1") ? "0" : "1");
      saveTheme();
    });
    applyTheme();
    window.ggbReady = false;
    window.ggbError = null;
    const runtime = window.geogebraStudio = {
      status: "loading",
      completedCommands: 0,
      failedCommand: null,
      warnings: [],
      checks: null
    };
    toggle.disabled = true;
    window.failGeoGebra = (message) => {
      ready = false;
      window.ggbReady = false;
      window.ggbError = String(message);
      runtime.status = "error";
      toggle.disabled = true;
      sidebarToggle.disabled = true;
      setStatus(window.ggbError, true);
    };
    function checkConstruction() {
      const names = api.getAllObjectNames();
      const view = is3D ? read3DView() : JSON.parse(api.getViewProperties(1));
      return {
        objectCount: names.length,
        undefinedVisibleObjects: names.filter((name) => api.getVisible(name) && !api.isDefined(name)),
        equalAxes: is3D ? view.equalAxes : Math.abs(view.invXscale / view.invYscale - 1) < 1e-6,
        viewWidth: view.width,
        viewHeight: view.height
      };
    }
    runtime.snapshot = async () => {
      if (!ready) throw new Error("GeoGebra \u5C1A\u672A\u5C31\u7EEA");
      return { ggbBase64: await callbackExport("ggb"), constructionXml: api.getXML(), checks: checkConstruction() };
    };
    function setStatus(text, error = false) {
      status.textContent = text;
      status.classList.toggle("error", error);
      status.hidden = !text;
    }
    // getViewProperties only describes 2D views, even when passed 3.
    function read3DView() {
      const xml = new DOMParser().parseFromString(api.getXML(), "application/xml");
      const coords = xml.querySelector("euclidianView3D > coordSystem");
      const scale = Number(coords?.getAttribute("scale"));
      const scales = ["xscale", "yscale", "zscale"].map(key => coords?.hasAttribute(key) ? Number(coords.getAttribute(key)) : scale);
      const canvas = [...host.querySelectorAll("canvas")].map(c => c.getBoundingClientRect()).find(r => r.width > 0 && r.height > 0);
      return { width: canvas?.width || 0, height: canvas?.height || 0,
        left: canvas?.left || 0, top: canvas?.top || 0,
        equalAxes: scales.every(n => Number.isFinite(n) && n > 0 && Math.abs(n / scales[0] - 1) < 1e-6) };
    }
    function equalAxes() {
      if (is3D) return;
      const v = JSON.parse(api.getViewProperties(1)), unit = Math.max(v.invXscale, v.invYscale), cx = v.xMin + v.width * v.invXscale / 2, cy = v.yMin + v.height * v.invYscale / 2;
      api.setCoordSystem(cx - v.width * unit / 2, cx + v.width * unit / 2, cy - v.height * unit / 2, cy + v.height * unit / 2);
    }
    function readCamera() {
      if (is3D) return null; // Native setSize retains the 3D rotation and zoom.
      const v = JSON.parse(api.getViewProperties(1));
      return { cx: v.xMin + v.width * v.invXscale / 2, cy: v.yMin + v.height * v.invYscale / 2, span: Math.min(v.width * v.invXscale, v.height * v.invYscale) };
    }
    function setSize(camera) {
      if (!api) return;
      camera = camera || readCamera();
      const version = ++resizeVersion;
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(async () => {
        const width = Math.round(host.clientWidth), height = Math.round(host.clientHeight);
        if (width < 1 || height < 1) return;
        api.setSize(width, height);
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        if (version !== resizeVersion) return;
        const view = is3D ? read3DView() : JSON.parse(api.getViewProperties(1));
        if (!is3D) {
          const { cx, cy, span } = camera, unit = span / Math.min(view.width, view.height);
          api.setCoordSystem(cx - view.width * unit / 2, cx + view.width * unit / 2, cy - view.height * unit / 2, cy + view.height * unit / 2);
          equalAxes();
        }
        sidebarToggle.style.top = Math.max(10, view.top - host.getBoundingClientRect().top + 10) + "px";
        sidebarToggle.style.left = sidebarOpen ? Math.max(10, view.left - host.getBoundingClientRect().left + 10) + "px" : "10px";
      });
    }
    function toBytes(data) {
      return Uint8Array.from(atob(data.replace(/^data:[^,]+,/, "")), (c) => c.charCodeAt(0));
    }
    function download(data, mime, extension, base64 = false) {
      const blob = new Blob([base64 ? toBytes(data) : data], { type: mime });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "construction." + extension;
      link.hidden = true;
      document.body.append(link);
      link.click();
      setTimeout(() => { link.remove(); URL.revokeObjectURL(url); }, 60000);
    }
    function callbackExport(format) {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("\u5BFC\u51FA\u8D85\u65F6")), 2e4);
        const done = (value) => {
          clearTimeout(timer);
          value ? resolve(value) : reject(new Error("GeoGebra \u672A\u8FD4\u56DE\u6587\u4EF6"));
        };
        try {
          if (format === "ggb") api.getBase64(done);
          else if (format === "pdf") api.exportPDF(1, done);
          else if (format === "tikz") api.exportPGF(done);
          else api.exportSVG(done);
        } catch (error) {
          clearTimeout(timer);
          reject(error);
        }
      });
    }
    async function fitView() {
      if (is3D) {
        const points = api.getAllObjectNames().filter(n => api.getVisible(n) && api.isDefined(n) && api.getObjectType(n) === "point")
          .map(n => [api.getXcoord(n), api.getYcoord(n), api.getZcoord(n)]).filter(p => p.every(Number.isFinite));
        if (specification.view3D?.bounds) api.setCoordSystem(...specification.view3D.bounds, false);
        else if (points.length) {
          const mins = [0,1,2].map(i => Math.min(...points.map(p => p[i]))), maxs = [0,1,2].map(i => Math.max(...points.map(p => p[i])));
          const radius = Math.max(Math.hypot(...maxs.map((v,i) => v - mins[i])) * 0.65, 1);
          const center = mins.map((v,i) => (v + maxs[i]) / 2);
          api.setCoordSystem(...center.flatMap(v => [v - radius, v + radius]), false);
        } else api.showAllObjects();
        if (specification.view3D?.direction) api.evalCommand("SetViewDirection((" + specification.view3D.direction.join(",") + "),false)");
        return;
      }
      api.showAllObjects();
      await new Promise((resolve) => setTimeout(resolve, 650));
      const view = JSON.parse(api.getViewProperties(1));
      let xmin = Infinity, xmax = -Infinity, ymin = Infinity, ymax = -Infinity, hasCircle = false, unsupported = false;
      for (const name of api.getAllObjectNames()) {
        if (!api.getVisible(name)) continue;
        const type = api.getObjectType(name);
        if (type === "point") {
          const x = api.getXcoord(name), y = api.getYcoord(name);
          if (Number.isFinite(x) && Number.isFinite(y)) {
            xmin = Math.min(xmin, x);
            xmax = Math.max(xmax, x);
            ymin = Math.min(ymin, y);
            ymax = Math.max(ymax, y);
          }
        } else if (type === "circle" || type === "conic") {
          const xml = new DOMParser().parseFromString("<root>" + api.getXML(name) + "</root>", "application/xml"), matrix = xml.querySelector("matrix");
          if (!matrix) {
            unsupported = true;
            continue;
          }
          const a = [0, 1, 2, 3, 4, 5].map((i) => Number(matrix.getAttribute("A" + i)));
          if (Math.abs(a[0] - a[1]) > 1e-8 || Math.abs(a[3]) > 1e-8 || !a[0]) {
            unsupported = true;
            continue;
          }
          const x = -a[4] / a[0], y = -a[5] / a[0], r = Math.sqrt(x * x + y * y - a[2] / a[0]);
          if (Number.isFinite(r)) {
            hasCircle = true;
            xmin = Math.min(xmin, x - r);
            xmax = Math.max(xmax, x + r);
            ymin = Math.min(ymin, y - r);
            ymax = Math.max(ymax, y + r);
          }
        } else if (!["line", "ray", "segment", "text", "numeric", "boolean"].includes(type)) unsupported = true;
      }
      if (!hasCircle || unsupported) {
        xmin = view.xMin;
        xmax = xmin + view.width * view.invXscale;
        ymin = view.yMin;
        ymax = ymin + view.height * view.invYscale;
      }
      const unit = Math.max((xmax - xmin) * 1.16 / view.width, (ymax - ymin) * 1.16 / view.height, 2 / Math.min(view.width, view.height)), cx = (xmin + xmax) / 2, cy = (ymin + ymax) / 2;
      api.setCoordSystem(cx - view.width * unit / 2, cx + view.width * unit / 2, cy - view.height * unit / 2, cy + view.height * unit / 2);
    }
    function applyViewerDefaults() {
      const names = api.getAllObjectNames();
      const visible = new Set(specification.visibleLabels || []), captions = specification.captionOverrides || {};
      const view = is3D ? null : JSON.parse(api.getViewProperties(1)), dx = view ? 10 * view.invXscale : 0, dy = view ? 10 * view.invYscale : 0;
      const points = is3D ? names.filter(n => api.getObjectType(n) === "point" && api.isDefined(n)) : [];
      const coordinates = points.map(n => [api.getXcoord(n), api.getYcoord(n), api.getZcoord(n)]);
      const center = [0,1,2].map(i => coordinates.length ? coordinates.reduce((sum,p) => sum + p[i],0) / coordinates.length : 0);
      const extent = Math.max(1,...coordinates.map(p => Math.hypot(...p.map((v,i) => v - center[i]))));
      for (const name of names) {
        try {
          const type = api.getObjectType(name), show = visible.size ? visible.has(name) : type === "point";
          api.setLabelVisible(name, false);
          if (type === "point") api.setPointSize(name, is3D ? 1 : 3);
          else if (["line", "segment", "ray", "vector", "circle", "conic", "polygon", "function", "curve"].includes(type) || is3D && type === "angle") api.setLineThickness(name, is3D ? 1 : 3);
          if (show && api.getVisible(name) && (!is3D || type === "point" || ["segment", "line", "ray", "circle", "conic", "curve"].includes(type))) {
            let caption = captions[name] || name;
            caption = caption.replace(/^\$|\$$/g, "");
            const math = caption === "\u0393" ? "\\Gamma" : caption === "\u03C9" ? "\\omega" : /^[A-Za-z]+$/.test(caption) ? "\\mathit{" + caption + "}" : caption;
            const anchor = type === "point" ? name : "Point(" + name + ",0.38)";
            let label = "mcpLabel" + name;
            while (api.exists(label)) label += "x";
            const offset = is3D ? (specification.labelOffsets?.[name] || [api.getXcoord(name), api.getYcoord(name), api.getZcoord(name)].map((v,i) => {
              const delta = v - center[i];
              return Math.abs(delta) > 1e-8 ? Math.sign(delta) * extent * 0.07 : extent * 0.035;
            })) : [dx,dy];
            if (!api.evalCommand(label + " = Text(" + JSON.stringify(math).replaceAll(String.fromCharCode(92, 92), String.fromCharCode(92)) + ", " + anchor + " + (" + offset.join(",") + "), true, true)")) throw new Error("无法创建 LaTeX 标签 " + name);
            if (is3D) api.evalCommand("SetFontSize(" + label + ",18)");
            api.setLabelVisible(label, false);
            api.setFixed(label, true, false);
            api.setAuxiliary(label, true);
          }
        } catch (error) {
          runtime.warnings.push("\u6837\u5F0F\u8BBE\u7F6E\u5931\u8D25 " + name + ": " + String(error.message || error));
        }
      }
    }
    const scriptJson = (value) => JSON.stringify(value).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
    async function exportAs(format) {
      if (!ready || toggle.disabled) return;
      toggle.disabled = true;
      try {
        if (format === "tikz") {
          if (typeof api.exportPGF !== "function") throw new Error("\u5F53\u524D GeoGebra \u5F15\u64CE\u4E0D\u652F\u6301 TikZ \u5BFC\u51FA");
          setStatus("\u6B63\u5728\u901A\u8FC7 Gikz \u6E05\u6D17\u2026");
          const source = await callbackExport("tikz");
          if (!globalThis.Gikz) throw new Error("Gikz \u672A\u52A0\u8F7D\uFF0C\u5DF2\u505C\u6B62 TikZ \u5BFC\u51FA");
          const cleaned = Gikz.wrapStandalone(Gikz.cleanTikZCode(source));
          if (!cleaned.includes("\\begin{tikzpicture}")) throw new Error("Gikz \u672A\u751F\u6210\u6709\u6548 TikZ");
          download(cleaned, "application/x-tex", "tex");
        } else if (format === "xml") download(api.getXML(), "application/xml", "xml");
        else if (format === "png") download(api.getPNGBase64(2, false, 144), "image/png", "png", true);
        else if (format === "html") {
          const base64 = await callbackExport("ggb");
          const payload = scriptJson({
            commands: [],
            ggbBase64: base64,
            theme: chosenTheme,
            mode: is3D ? "3D" : "2D",
            view3D: specification.view3D,
            labelOffsets: specification.labelOffsets,
            showAxes: specification.showAxes === true,
            visibleLabels: specification.visibleLabels || [],
            captionOverrides: specification.captionOverrides || {}
          });
          const html = window.constructionTemplate.replace(
            /(<script id="construction-data" type="application\/json">)[\s\S]*?(<\/script>)/,
            (_, opening, closing) => opening + payload + closing
          );
          download(html, "text/html", "html");
        } else {
          const value = await callbackExport(format);
          download(value, format === "pdf" ? "application/pdf" : format === "ggb" ? "application/vnd.geogebra.file" : "image/svg+xml", format, format === "pdf" || format === "ggb");
        }
        setStatus("");
      } catch (error) {
        setStatus(error.message || "\u5BFC\u51FA\u5931\u8D25", true);
      } finally {
        toggle.disabled = false;
      }
    }
    const popupMenus = [[toggle, menu], [themeToggle, themeMenu]];
    function closeMenus() {
      for (const [button, popup] of popupMenus) {
        popup.classList.remove("open");
        button.setAttribute("aria-expanded", "false");
      }
    }
    for (const [button, popup] of popupMenus) {
      button.addEventListener("click", () => {
        const open = !popup.classList.contains("open");
        closeMenus();
        if (open) {
          popup.classList.add("open");
          button.setAttribute("aria-expanded", "true");
        }
      });
      button.addEventListener("keydown", (event) => {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          closeMenus();
          popup.classList.add("open");
          button.setAttribute("aria-expanded", "true");
          popup.querySelector("button").focus();
        }
      });
      popup.addEventListener("keydown", (event) => {
        const items = [...popup.querySelectorAll("button")], index = items.indexOf(document.activeElement);
        if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
          event.preventDefault();
          items[event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : (index + (event.key === "ArrowDown" ? 1 : items.length - 1)) % items.length].focus();
        }
        if (event.key === "Escape") {
          closeMenus();
          button.focus();
        }
      });
    }
    menu.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-format]");
      if (!button) return;
      closeMenus();
      await exportAs(button.dataset.format);
    });
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".menu-control")) closeMenus();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenus();
    });
    sidebarToggle.addEventListener("click", () => {
      if (!ready) return;
      const camera = readCamera();
      sidebarOpen = !sidebarOpen;
      api.setPerspective((sidebarOpen ? "A" : "") + graphicsPerspective);
      api.showAlgebraInput(sidebarOpen);
      api.showToolBar(sidebarOpen);
      api.showMenuBar(sidebarOpen);
      sidebarToggle.setAttribute("aria-expanded", String(sidebarOpen));
      sidebarToggle.setAttribute("aria-label", sidebarOpen ? "\u6536\u8D77\u5BF9\u8C61\u680F" : "\u5C55\u5F00\u5BF9\u8C61\u680F");
      sidebarToggle.title = sidebarOpen ? "\u6536\u8D77\u5BF9\u8C61\u680F" : "\u5C55\u5F00\u5BF9\u8C61\u680F";
      sidebarToggle.querySelector("svg path").setAttribute("d", sidebarOpen ? "M9 4v16m7-11-3 3 3 3" : "M9 4v16m4-11 3 3-3 3");
      setSize(camera);
    });
    window.startGeoGebra = () => {
      window.constructionTemplate = "<!doctype html>\n" + document.documentElement.outerHTML;
      const width = Math.max(200, Math.round(host.clientWidth));
      const height = Math.max(200, Math.round(host.clientHeight));
      const applet = new GGBApplet({
        appName: "classic",
        width,
        height,
        disableAutoScale: true,
        showZoomButtons: false,
        borderColor: "transparent",
        language: "zh-CN",
        showToolBar: true,
        showMenuBar: true,
        showAlgebraInput: true,
        allowStyleBar: true,
        enableRightClick: true,
        showResetIcon: false,
        useBrowserForJS: false,
        preventFocus: true,
        enableLabelDrags: true,
        enableShiftDragZoom: true,
        ...specification.ggbBase64 ? { ggbBase64: specification.ggbBase64 } : {},
        appletOnLoad: async (loaded) => {
          api = loaded;
          window.ggbApplet = api;
          try {
            runtime.status = "executing";
            api.setErrorDialogsActive(false);
            if (!specification.ggbBase64 || (specification.commands || []).length) {
              api.setPerspective(graphicsPerspective);
              if (is3D) api.setAxesVisible(3, specification.showAxes === true, specification.showAxes === true, specification.showAxes === true);
              else api.setAxesVisible(specification.showAxes === true, specification.showAxes === true);
              api.setGridVisible(is3D ? 3 : 1, false);
              if (is3D) api.setVisible("xOyPlane", false);
              const styleCommands = [];
              let explicitViewport = false;
              for (const [index, command] of (specification.commands || []).entries()) {
                setStatus("\u6B63\u5728\u6267\u884C\u6784\u9020 " + (index + 1) + " / " + specification.commands.length);
                let success;
                try {
                  const styled = executeViewerStyleCommand({
                    exists: name => api.exists(name),
                    getValue: expression => api.getValue(expression),
                    setColor: (name, ...rgb) => { api.setColor(name, ...rgb); explicitColorObjects.add(name); },
                    setLineThickness: (name, value) => api.setLineThickness(name, value),
                    setLineStyle: (name, value) => api.setLineStyle(name, value),
                    setPointSize: (name, value) => api.setPointSize(name, value),
                  }, command);
                  if (styled) styleCommands.push(command);
                  const viewport = styled || is3D ? null : executeViewerViewportCommand(api, command);
                  if (viewport) explicitViewport = true;
                  const action = styled || viewport ? null : executeViewerActionCommand(api, command);
                  success = styled ?? viewport ?? action ?? await executeViewerCommand(api, command);
                } catch (error) {
                  runtime.failedCommand = { index: index + 1, command };
                  throw new Error("第 " + (index + 1) + " 条命令失败：" + command + " — " + (error.message || error));
                }
                if (!success) {
                  runtime.failedCommand = { index: index + 1, command };
                  throw new Error("\u7B2C " + (index + 1) + " \u6761\u547D\u4EE4\u5931\u8D25\uFF1A" + command);
                }
                runtime.completedCommands++;
              }
              if (!explicitViewport && (specification.commands || []).length) await fitView();
              applyViewerDefaults();
              // Defaults must not erase point sizes or line weights from the spec.
              for (const command of styleCommands) executeViewerStyleCommand(api, command);
            }
            api.setPerspective(graphicsPerspective);
            api.showAlgebraInput(false);
            api.showToolBar(false);
            api.showMenuBar(false);
            if (is3D) api.setAxesVisible(3, specification.showAxes === true, specification.showAxes === true, specification.showAxes === true);
            else api.setAxesVisible(specification.showAxes === true, specification.showAxes === true);
            equalAxes();
            applyTheme();
            runtime.checks = checkConstruction();
            if (runtime.checks.undefinedVisibleObjects.length) throw new Error("\u5B58\u5728\u672A\u5B9A\u4E49\u7684\u53EF\u89C1\u5BF9\u8C61\uFF1A" + runtime.checks.undefinedVisibleObjects.join(", "));
            if (!runtime.checks.equalAxes || runtime.checks.viewWidth <= 0 || runtime.checks.viewHeight <= 0) throw new Error("\u89C6\u56FE\u6BD4\u4F8B\u6216\u5C3A\u5BF8\u68C0\u67E5\u5931\u8D25");
            runtime.status = "ready";
            ready = true;
            sidebarToggle.disabled = false;
            toggle.disabled = false;
            window.ggbError = null;
            window.ggbReady = true;
            setStatus("");
            resizeObserver = new ResizeObserver(() => setSize());
            resizeObserver.observe(document.querySelector(".stage"));
            setSize();
          } catch (error) {
            window.failGeoGebra(error.message || String(error));
          } finally {
            api.setErrorDialogsActive(true);
          }
        }
      }, true);
      applet.inject("ggb-element");
    };
    setTimeout(() => {
      if (!ready && !window.ggbError) window.failGeoGebra("GeoGebra \u52A0\u8F7D\u8D85\u65F6\uFF0C\u8BF7\u68C0\u67E5\u7F51\u7EDC\u540E\u5237\u65B0");
    }, 6e4);
  })();
})();
