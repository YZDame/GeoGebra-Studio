(() => {
  "use strict";

  const root = document.documentElement;
  const langToggle = document.querySelector("[data-lang-toggle]");
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const copyStatus = document.getElementById("copy-status");
  const starCount = document.querySelector("[data-star-count]");

  // Collect static translatable nodes (check attribute presence so empty data-en="" works cleanly).
  const translations = Array.from(
    document.querySelectorAll("[data-en], [data-en-label], [data-en-href]"),
    (element) => ({
      element,
      hasEn: element.hasAttribute("data-en"),
      zhText: element.innerHTML,
      enText: element.getAttribute("data-en"),
      zhLabel: element.getAttribute("aria-label"),
      enLabel: element.getAttribute("data-en-label"),
      zhHref: element.getAttribute("href"),
      enHref: element.getAttribute("data-en-href"),
    }),
  );

  let english = false;
  let activeAgentIndex = 0;
  let autoCycle = true;
  let cycleTimer = null;
  let dropdownOpen = false;
  let hoverPaused = false;

  const ICONS = {
    claude: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5 4.2 16.5"/></svg>`,
    codex: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/></svg>`,
    chatgpt: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v4.5l4 2.3M20.5 12h-4.5l-2.3 4M12 20.5V16l-4-2.3M3.5 12H8l2.3-4" stroke-linecap="round"/></svg>`,
    grok: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round"><path d="M5 19 19 5M14 5h5v5"/><circle cx="11.5" cy="12.5" r="7"/></svg>`,
    deepseek: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 20 8v8l-8 5-8-5V8l8-5Z"/><circle cx="12" cy="12" r="2.6"/></svg>`,
    cursor: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="m5 3 14 8-6.2 1.8L11 19 5 3Z"/></svg>`,
  };

  const AGENTS = [
    {
      id: "claude",
      name: "Claude Code",
      accent: "#D97757",
      modeTag: "SKILL.md",
      installTargets: ["claude"],
      sub: { zh: "命令行终端 · Agent Skill", en: "Terminal Agent · Skill" },
      conn: { zh: "Skill 已连接 ✓", en: "Skill connected ✓" },
      attachment: { zh: "几何作图需求", en: "Geometry prompt" },
      prompt: {
        zh: "画出拿破仑定理：任意三角形 ABC 向外作三个正三角形，把它们的中心连起来，顶点可以自由拖动。",
        en: "Draw Napoleon's theorem: construct outward equilateral triangles on any triangle ABC and connect their centers, with draggable vertices.",
      },
      steps: {
        zh: ["加载 skills/geogebra-studio 规范", "生成带外心正三角形约束的 JSON", "写出可编辑 HTML · napoleon.html"],
        en: ["Load skills/geogebra-studio spec", "Build constrained JSON construction", "Write editable HTML · napoleon.html"],
      },
      outputFile: "napoleon.html",
      reply: {
        zh: "已完成拿破仑定理构造。拖动蓝色顶点 A、B、C 时，外侧三个正三角形的中心 O₁O₂O₃ 始终构成正三角形，支持直接下载 GGB 或 TikZ。",
        en: "Built Napoleon's theorem. Drag vertices A, B, or C and watch O₁O₂O₃ stay equilateral. Ready to export as GGB, PNG, PDF, or TikZ.",
      },
      composer: { zh: "向 Claude Code 发送几何作图需求…", en: "Ask Claude Code to draw a figure…" },
      figureTitle: { zh: "拿破仑定理 · Napoleon’s theorem", en: "Napoleon’s theorem" },
      figureHref: "figures/napoleon.html",
      hint: { zh: "拖动蓝色顶点 A、B、C 试试", en: "Drag blue vertices A, B, or C" },
      demo: "napoleon",
    },
    {
      id: "codex",
      name: "Codex",
      accent: "#4F46E5",
      modeTag: "Codex Plugin",
      installTargets: ["codex"],
      sub: { zh: "桌面与 CLI · 可选插件", en: "App & CLI · Optional Plugin" },
      conn: { zh: "Codex 插件就绪 ✓", en: "Codex plugin ready ✓" },
      attachment: { zh: "立体几何截面", en: "3D solid geometry" },
      prompt: {
        zh: "绘制一个带可移动水平截面的曲面立体几何模型，用滑块 h 控制截面高度。",
        en: "Draw a 3D curved solid geometry model with a movable horizontal cross-section controlled by slider h.",
      },
      steps: {
        zh: ["启用 mode: \"3D\" 原生空间视角", "添加截面高度滑块 h ∈ [0.15, 0.85]", "输出交互页面 · wedge-cross-section.html"],
        en: ["Enable native mode: \"3D\" perspective", "Bind cross-section slider h ∈ [0.15, 0.85]", "Generate wedge-cross-section.html"],
      },
      outputFile: "cube-3d.html",
      reply: {
        zh: "已生成 3D 交互模型。拖动高度滑块 h 可观察水平截面面积变化，完整页面中还支持自由旋转 3D 视角与切换 9 套配色。",
        en: "3D solid model ready. Scrub slider h to move the cross-section plane, or open the full GeoGebra canvas to orbit freely in 3D.",
      },
      composer: { zh: "在 Codex 中继续修改图形参数…", en: "Refine parameters with Codex…" },
      figureTitle: { zh: "3D 空间与可变截面 · 3D Solid", en: "3D Solid & Cross-Section" },
      figureHref: "figures/cube-3d.html",
      hint: { zh: "滑动底部滑块 h 改变截面高度", en: "Scrub slider h to move the cross-section" },
      demo: "wedge3d",
    },
    {
      id: "chatgpt",
      name: "ChatGPT",
      accent: "#10A37F",
      modeTag: "Agent Skill",
      installTargets: ["claude"],
      sub: { zh: "上传题目图 · 交互作图", en: "Problem Upload · Interactive" },
      conn: { zh: "Skill 已激活 ✓", en: "Skill active ✓" },
      attachment: { zh: "几何证明题.pdf", en: "geometry-problem.pdf" },
      prompt: {
        zh: "帮我把这道几何题的九点圆与欧拉线画成可拖动图形，证明 O、G、N₉、H 四点共线。",
        en: "Plot the nine-point circle and Euler line from this problem so students can drag vertices and see O, G, N₉, H stay collinear.",
      },
      steps: {
        zh: ["识别三角形与垂心、外心几何关系", "构造九点圆与欧拉线联动指令", "打包本地 HTML · nine-point-circle.html"],
        en: ["Extract circumcenter & orthocenter rules", "Construct nine-point circle & Euler line", "Package nine-point-circle.html"],
      },
      outputFile: "nine-point-circle.html",
      reply: {
        zh: "九点圆与欧拉线已绘制完成。拖动任意顶点，可以看到九点圆始终经过三边中点与垂足，外心 O、重心 G、九点圆心 N₉、垂心 H 始终共线。",
        en: "Nine-point circle and Euler line ready. Drag any vertex to verify midpoints, altitude feet, and the collinear Euler line O–G–N₉–H.",
      },
      composer: { zh: "向 ChatGPT 追加导出或标注需求…", en: "Ask ChatGPT to add labels or export…" },
      figureTitle: { zh: "九点圆与欧拉线 · Nine-point circle", en: "Nine-point circle & Euler line" },
      figureHref: "figures/nine-point-circle.html",
      hint: { zh: "拖动顶点 A、B、C 观察欧拉线共线", en: "Drag vertices A, B, or C to move the Euler line" },
      demo: "ninepoint",
    },
    {
      id: "grok",
      name: "Grok Bot",
      accent: "#D97706",
      modeTag: "Skill Library",
      installTargets: ["grok"],
      sub: { zh: "对话装技能 · 快速出图", en: "Bot Skill · Instant Figure" },
      conn: { zh: "Skill 已导入 ✓", en: "Skill imported ✓" },
      attachment: { zh: "轨迹动画", en: "Parametric locus" },
      prompt: {
        zh: "画一个沿 x 轴滚动的圆，用参数 t 追踪圆周上一点画出的钟摆线轨迹。",
        en: "Draw a circle rolling along the x-axis and trace a point on its rim to form a cycloid controlled by parameter t.",
      },
      steps: {
        zh: ["从技能库调用 geogebra-studio", "建立参数方程 (t - sin t, 1 - cos t)", "生成交互式摆线 · cycloid.html"],
        en: ["Invoke geogebra-studio from skill library", "Define parametric locus (t - sin t, 1 - cos t)", "Build interactive cycloid.html"],
      },
      outputFile: "cycloid.html",
      reply: {
        zh: "钟摆线已生成。滑动参数 t 可以滚动圆轮，实时观察圆周点 P 描绘出的完整摆线弧。",
        en: "Cycloid generated. Drag parameter t to roll the wheel along the axis and watch point P trace the cycloid arch.",
      },
      composer: { zh: "让 Grok Bot 调整轨迹颜色或范围…", en: "Ask Grok Bot to adjust style or range…" },
      figureTitle: { zh: "钟摆线 · Cycloid", en: "Cycloid" },
      figureHref: "figures/cycloid.html",
      hint: { zh: "滑动参数 t 滚动圆轮", en: "Scrub slider t to roll the circle" },
      demo: "cycloid",
    },
    {
      id: "deepseek",
      name: "DeepSeek Harness",
      accent: "#3B82F6",
      modeTag: "DSH Right Canvas",
      installTargets: ["deepseek"],
      sub: { zh: "桌面插件 · 对话旁实时画布", en: "Desktop Plugin · Live Sidebar Canvas" },
      conn: { zh: "右侧画布已同步 ✓", en: "Right canvas synced ✓" },
      attachment: { zh: "解析几何", en: "Analytic geometry" },
      prompt: {
        zh: "画出椭圆 x²/9 + y²/4 = 1，其焦点、准线和一条过右焦点的可调焦点弦。",
        en: "Plot ellipse x²/9 + y²/4 = 1 with its foci, directrices, and a focal chord controlled by angle θ.",
      },
      steps: {
        zh: ["调用 geogebra_build 工具直连画布", "绑定焦点弦方向角 θ 滑块", "实时渲染至右侧 GeoGebra Studio"],
        en: ["Call geogebra_build into sidebar canvas", "Bind focal chord direction slider θ", "Render live in GeoGebra Studio pane"],
      },
      outputFile: "dsh-geogebra-studio",
      reply: {
        zh: "椭圆与焦点弦已直接同步到右侧 GeoGebra Studio 画布。调节方向角 θ，弦 AB 围绕右焦点 F₂ 旋转，可直接导出清洗后的 TikZ。",
        en: "Synced directly to the right-side GeoGebra Studio canvas. Adjust angle θ to rotate focal chord AB around F₂ and export clean TikZ.",
      },
      composer: { zh: "在 DeepSeek Harness 中继续追问…", en: "Continue prompting in DeepSeek Harness…" },
      figureTitle: { zh: "椭圆焦点弦与准线 · Ellipse Chord", en: "Ellipse, Foci & Focal Chord" },
      figureHref: "figures/circle-tangency.html",
      hint: { zh: "滑动方向角 θ 旋转焦点弦 AB", en: "Scrub angle θ to sweep focal chord AB" },
      demo: "ellipse",
    },
    {
      id: "cursor",
      name: "Cursor",
      accent: "#0F766E",
      modeTag: ".cursor/skills",
      installTargets: ["grok", "claude"],
      sub: { zh: "IDE 编辑器 · 本地插件", en: "IDE Agent · Local Plugin" },
      conn: { zh: "本地 Skill 就绪 ✓", en: "Local skill ready ✓" },
      attachment: { zh: "射影几何", en: "Projective geometry" },
      prompt: {
        zh: "把帕斯卡六边形定理画出来：椭圆上六个点可以拖动，三组对边交点始终共线。",
        en: "Construct Pascal's theorem on an ellipse with six draggable vertices so opposite-side intersections stay collinear.",
      },
      steps: {
        zh: ["读取 .cursor/skills/geogebra-studio", "计算三组对边交点 X、Y、Z 与帕斯卡线", "启动本地预览 · pascal-theorem.html"],
        en: ["Load .cursor/skills/geogebra-studio", "Compute intersections X, Y, Z & Pascal line", "Launch preview · pascal-theorem.html"],
      },
      outputFile: "pascal-theorem.html",
      reply: {
        zh: "帕斯卡定理页面已生成。沿椭圆拖动蓝色顶点 P₁，可以看到三组对边交点 X、Y、Z 始终落在同一条帕斯卡直线上。",
        en: "Pascal's theorem is ready. Drag vertex P₁ along the ellipse and watch intersections X, Y, and Z remain collinear on the Pascal line.",
      },
      composer: { zh: "让 Cursor 修改构造或导出 Asymptote…", en: "Ask Cursor to edit or export Asymptote…" },
      figureTitle: { zh: "帕斯卡定理 · Pascal’s theorem", en: "Pascal’s theorem" },
      figureHref: "figures/pascal-theorem.html",
      hint: { zh: "沿椭圆拖动蓝色点 P₁", en: "Drag blue point P₁ around the ellipse" },
      demo: "pascal",
    },
  ];

  /* ---------------- Theme Management ---------------- */
  let themePref = null;
  try {
    themePref = localStorage.getItem("ggs-theme");
  } catch {
    themePref = null;
  }

  function effectiveDark() {
    if (themePref === "dark") return true;
    if (themePref === "light") return false;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function applyColorTheme() {
    if (themePref === "dark" || themePref === "light") {
      root.setAttribute("data-theme", themePref);
    } else {
      root.removeAttribute("data-theme");
    }
    if (themeToggle) {
      const dark = effectiveDark();
      const useEl = themeToggle.querySelector("use");
      if (useEl) useEl.setAttribute("href", dark ? "icons.svg#sun" : "icons.svg#moon");
      themeToggle.setAttribute(
        "aria-label",
        dark
          ? (english ? "Switch to light mode" : "切换到浅色模式")
          : (english ? "Switch to dark mode" : "切换到深色模式"),
      );
    }
  }

  if (themeToggle) {
    themeToggle.hidden = false;
    applyColorTheme();
    themeToggle.addEventListener("click", () => {
      themePref = effectiveDark() ? "light" : "dark";
      try {
        localStorage.setItem("ggs-theme", themePref);
      } catch {
        // Ignore storage restriction
      }
      applyColorTheme();
      renderDemo();
    });
  }

  /* ---------------- Elements ---------------- */
  const heroSlotBtn = document.getElementById("agent-picker-btn");
  const heroAgentIcon = document.getElementById("hero-agent-icon");
  const heroAgentViewport = document.getElementById("hero-agent-viewport");
  const heroAgentName = document.getElementById("hero-agent-name");
  const agentDropdown = document.getElementById("agent-dropdown");
  const agentDock = document.getElementById("agent-dock");
  const autoCycleBtn = document.getElementById("auto-cycle-btn");

  const stageAgentIcon = document.getElementById("stage-agent-icon");
  const stageAgentTitle = document.getElementById("stage-agent-title");
  const stageConnText = document.getElementById("stage-conn-text");
  const stageModeTag = document.getElementById("stage-mode-tag");
  const stageAttachment = document.getElementById("stage-attachment");
  const stagePrompt = document.getElementById("stage-prompt");
  const stageSteps = document.getElementById("stage-steps");
  const stageReplyRole = document.getElementById("stage-reply-role");
  const stageOutputFile = document.getElementById("stage-output-file");
  const stageReply = document.getElementById("stage-reply");
  const stageComposer = document.getElementById("stage-composer");
  const stageFigureTitle = document.getElementById("stage-figure-title");
  const stageHint = document.getElementById("stage-hint");
  const stageFigureLink = document.getElementById("stage-figure-link");

  const svg = document.getElementById("live-geo-svg");
  const viewportControls = document.getElementById("viewport-controls");
  const geoSlider = document.getElementById("geo-slider");
  const geoSliderName = document.getElementById("geo-slider-name");
  const geoSliderVal = document.getElementById("geo-slider-val");

  /* ---------------- Build Dock & Dropdown ---------------- */
  function buildSelectors() {
    agentDock.replaceChildren();
    agentDropdown.replaceChildren();

    AGENTS.forEach((agent, idx) => {
      // Dock Pill
      const pill = document.createElement("button");
      pill.type = "button";
      pill.className = "dock-pill" + (idx === activeAgentIndex ? " is-active" : "");
      pill.setAttribute("role", "tab");
      pill.setAttribute("aria-selected", String(idx === activeAgentIndex));
      pill.style.setProperty("--i", String(idx));
      pill.style.setProperty("--pill-accent", agent.accent);
      pill.innerHTML = `<span class="dock-pill-icon" aria-hidden="true">${ICONS[agent.id]}</span><span>${agent.name}</span>`;
      pill.addEventListener("click", () => {
        setAutoCycle(false);
        selectAgent(idx, { animate: true });
      });
      agentDock.appendChild(pill);

      // Dropdown Option
      const opt = document.createElement("button");
      opt.type = "button";
      opt.className = "agent-option" + (idx === activeAgentIndex ? " is-active" : "");
      opt.setAttribute("role", "option");
      opt.setAttribute("aria-selected", String(idx === activeAgentIndex));
      opt.innerHTML = `
        <span class="agent-option-left">
          <span class="agent-option-icon" style="color:${agent.accent}">${ICONS[agent.id]}</span>
          <span>
            <span class="agent-option-name">${agent.name}</span>
            <span class="agent-option-sub">${english ? agent.sub.en : agent.sub.zh}</span>
          </span>
        </span>
        <svg class="agent-option-check" aria-hidden="true"><use href="icons.svg#check-lg"></use></svg>
      `;
      opt.addEventListener("click", () => {
        setAutoCycle(false);
        selectAgent(idx, { animate: true });
        closeDropdown();
      });
      agentDropdown.appendChild(opt);
    });
  }

  function measureTextWidth(text) {
    const probe = document.createElement("span");
    probe.style.cssText = "position:absolute;visibility:hidden;white-space:nowrap;pointer-events:none;width:auto;";
    probe.className = heroAgentName.className;
    probe.textContent = text;
    heroSlotBtn.appendChild(probe);
    const measured = parseFloat(getComputedStyle(probe).width) || probe.offsetWidth;
    probe.remove();
    return Math.ceil(measured + 2);
  }

  function updateHeroSlotWidth() {
    if (!heroAgentViewport || !heroAgentName) return;
    heroAgentViewport.style.width = `${measureTextWidth(heroAgentName.textContent)}px`;
  }

  function selectAgent(index, { animate = true } = {}) {
    activeAgentIndex = (index + AGENTS.length) % AGENTS.length;
    const agent = AGENTS[activeAgentIndex];
    const lang = english ? "en" : "zh";

    root.style.setProperty("--active-agent", agent.accent);
    root.style.setProperty("--active-agent-soft", `${agent.accent}1c`);

    // Hero inline kinetic capsule
    heroAgentIcon.innerHTML = ICONS[agent.id];
    const nextWidth = measureTextWidth(agent.name);
    heroAgentViewport.style.width = `${nextWidth}px`;
    heroAgentName.textContent = agent.name;
    if (animate) {
      heroAgentName.classList.remove("is-entering");
      void heroAgentName.offsetWidth;
      heroAgentName.classList.add("is-entering");
    }

    // Update dock & dropdown active markers
    Array.from(agentDock.children).forEach((el, idx) => {
      const active = idx === activeAgentIndex;
      el.classList.toggle("is-active", active);
      el.setAttribute("aria-selected", String(active));
    });
    Array.from(agentDropdown.children).forEach((el, idx) => {
      const active = idx === activeAgentIndex;
      el.classList.toggle("is-active", active);
      el.setAttribute("aria-selected", String(active));
    });

    // Update install card gentle highlight
    for (const card of document.querySelectorAll("[data-install-card]")) {
      const targets = (card.getAttribute("data-install-card") || "").split(/\s+/);
      card.classList.toggle("is-highlighted", targets.includes(agent.id));
    }

    // Update stage conversation
    stageAgentIcon.innerHTML = ICONS[agent.id];
    stageAgentTitle.textContent = agent.name;
    stageConnText.textContent = agent.conn[lang];
    stageModeTag.textContent = agent.modeTag;
    stageAttachment.textContent = agent.attachment[lang];
    stagePrompt.textContent = agent.prompt[lang];

    stageSteps.replaceChildren();
    agent.steps[lang].forEach((stepText) => {
      const row = document.createElement("div");
      row.className = "chat-step";
      row.innerHTML = `<span class="chat-step-dot" aria-hidden="true">✓</span><span></span>`;
      row.lastElementChild.textContent = stepText;
      stageSteps.appendChild(row);
    });

    stageReplyRole.textContent = agent.name;
    stageOutputFile.textContent = agent.outputFile;
    stageReply.textContent = agent.reply[lang];
    stageComposer.textContent = agent.composer[lang];
    stageFigureTitle.textContent = agent.figureTitle[lang];
    stageHint.textContent = agent.hint[lang];
    stageFigureLink.setAttribute("href", agent.figureHref);

    configureSliderForDemo(agent.demo);
    renderDemo();
  }

  /* ---------------- Dropdown Controls ---------------- */
  function openDropdown() {
    dropdownOpen = true;
    agentDropdown.hidden = false;
    heroSlotBtn.setAttribute("aria-expanded", "true");
  }

  function closeDropdown() {
    dropdownOpen = false;
    agentDropdown.hidden = true;
    heroSlotBtn.setAttribute("aria-expanded", "false");
  }

  heroSlotBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    if (dropdownOpen) closeDropdown();
    else openDropdown();
  });

  heroSlotBtn.addEventListener("mouseenter", () => { hoverPaused = true; });
  heroSlotBtn.addEventListener("mouseleave", () => { hoverPaused = false; });

  document.addEventListener("click", (event) => {
    if (dropdownOpen && !event.target.closest("[data-agent-picker]")) {
      closeDropdown();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && dropdownOpen) {
      closeDropdown();
      heroSlotBtn.focus();
    }
  });

  /* ---------------- Auto-Cycle Engine ---------------- */
  function scheduleCycle() {
    clearInterval(cycleTimer);
    if (!autoCycle) return;
    cycleTimer = setInterval(() => {
      if (document.hidden || dropdownOpen || hoverPaused || draggingPoint) return;
      selectAgent((activeAgentIndex + 1) % AGENTS.length, { animate: true });
    }, 2800);
  }

  function setAutoCycle(enabled) {
    autoCycle = enabled;
    autoCycleBtn.classList.toggle("is-active", enabled);
    autoCycleBtn.setAttribute("aria-pressed", String(enabled));
    if (enabled) {
      scheduleCycle();
    } else {
      clearInterval(cycleTimer);
    }
  }

  autoCycleBtn.addEventListener("click", () => {
    const next = !autoCycle;
    setAutoCycle(next);
    if (next) {
      selectAgent((activeAgentIndex + 1) % AGENTS.length, { animate: true });
    }
  });

  /* ---------------- Interactive Mathematical Geometry Engine ---------------- */
  const state = {
    napoleon: {
      A: { x: 206, y: 196 },
      B: { x: 356, y: 202 },
      C: { x: 266, y: 102 },
    },
    ninepoint: {
      A: { x: 236, y: 92 },
      B: { x: 146, y: 268 },
      C: { x: 404, y: 268 },
    },
    wedge3d: { h: 0.56 },
    cycloid: { t: 3.65 },
    ellipse: { theta: 0.92 },
    pascal: {
      t1: -1.6,
      rest: [0.49, -2.52, 1.37, -0.38, 2.82],
    },
  };

  let draggingPoint = null;

  function configureSliderForDemo(demo) {
    if (demo === "wedge3d") {
      viewportControls.hidden = false;
      geoSlider.min = "0.18";
      geoSlider.max = "0.84";
      geoSlider.step = "0.01";
      geoSlider.value = String(state.wedge3d.h);
      geoSliderName.textContent = "h =";
      geoSliderVal.textContent = state.wedge3d.h.toFixed(2);
    } else if (demo === "cycloid") {
      viewportControls.hidden = false;
      geoSlider.min = "0.25";
      geoSlider.max = "6.10";
      geoSlider.step = "0.02";
      geoSlider.value = String(state.cycloid.t);
      geoSliderName.textContent = "t =";
      geoSliderVal.textContent = `${state.cycloid.t.toFixed(2)}`;
    } else if (demo === "ellipse") {
      viewportControls.hidden = false;
      geoSlider.min = "0.25";
      geoSlider.max = "2.90";
      geoSlider.step = "0.01";
      geoSlider.value = String(state.ellipse.theta);
      geoSliderName.textContent = "θ =";
      geoSliderVal.textContent = `${Math.round((state.ellipse.theta * 180) / Math.PI)}°`;
    } else if (demo === "pascal") {
      viewportControls.hidden = false;
      geoSlider.min = "-2.15";
      geoSlider.max = "-0.95";
      geoSlider.step = "0.01";
      geoSlider.value = String(state.pascal.t1);
      geoSliderName.textContent = "P₁ =";
      geoSliderVal.textContent = `${Math.round((-state.pascal.t1 * 180) / Math.PI)}°`;
    } else {
      viewportControls.hidden = true;
    }
  }

  geoSlider.addEventListener("input", () => {
    const val = parseFloat(geoSlider.value);
    const demo = AGENTS[activeAgentIndex].demo;
    if (demo === "wedge3d") {
      state.wedge3d.h = val;
      geoSliderVal.textContent = val.toFixed(2);
    } else if (demo === "cycloid") {
      state.cycloid.t = val;
      geoSliderVal.textContent = val.toFixed(2);
    } else if (demo === "ellipse") {
      state.ellipse.theta = val;
      geoSliderVal.textContent = `${Math.round((val * 180) / Math.PI)}°`;
    } else if (demo === "pascal") {
      state.pascal.t1 = val;
      geoSliderVal.textContent = `${Math.round((-val * 180) / Math.PI)}°`;
    }
    setAutoCycle(false);
    renderDemo();
  });

  function svgCoords(event) {
    const rect = svg.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 560;
    const y = ((event.clientY - rect.top) / rect.height) * 360;
    return {
      x: Math.max(36, Math.min(524, x)),
      y: Math.max(32, Math.min(328, y)),
    };
  }

  svg.addEventListener("pointerdown", (event) => {
    const hit = event.target.closest("[data-drag]");
    if (!hit) return;
    draggingPoint = hit.dataset.drag;
    setAutoCycle(false);
    svg.setPointerCapture(event.pointerId);
  });

  svg.addEventListener("pointermove", (event) => {
    if (!draggingPoint) return;
    const pt = svgCoords(event);
    const demo = AGENTS[activeAgentIndex].demo;
    if (demo === "napoleon" && state.napoleon[draggingPoint]) {
      state.napoleon[draggingPoint] = pt;
      renderDemo();
    } else if (demo === "ninepoint" && state.ninepoint[draggingPoint]) {
      state.ninepoint[draggingPoint] = pt;
      renderDemo();
    } else if (demo === "pascal" && draggingPoint === "P1") {
      let ang = Math.atan2((pt.y - 178) / 92, (pt.x - 280) / 168);
      if (ang > Math.PI / 2) ang -= 2 * Math.PI;
      state.pascal.t1 = Math.max(-2.15, Math.min(-0.95, ang));
      geoSlider.value = String(state.pascal.t1);
      geoSliderVal.textContent = `${Math.round((-state.pascal.t1 * 180) / Math.PI)}°`;
      renderDemo();
    }
  });

  function releaseDrag(event) {
    if (!draggingPoint) return;
    draggingPoint = null;
    try {
      svg.releasePointerCapture(event.pointerId);
    } catch {
      // Ignore if not captured
    }
  }
  svg.addEventListener("pointerup", releaseDrag);
  svg.addEventListener("pointercancel", releaseDrag);

  function fmt(n) { return n.toFixed(1); }

  function pointMarkup(id, pt, label, draggable = true, color = "var(--accent)", dx = 10, dy = -10) {
    return `
      <g>
        ${draggable ? `<circle cx="${fmt(pt.x)}" cy="${fmt(pt.y)}" r="16" fill="transparent" class="geo-point-hit" data-drag="${id}"/>` : ""}
        <circle cx="${fmt(pt.x)}" cy="${fmt(pt.y)}" r="${draggable ? 5.2 : 3.8}" fill="${color}" stroke="var(--surface)" stroke-width="1.8" pointer-events="none"/>
        <text x="${fmt(pt.x + dx)}" y="${fmt(pt.y + dy)}" font-family="var(--font-serif)" font-style="italic" font-size="14" font-weight="600" fill="var(--ink)" pointer-events="none">${label}</text>
      </g>
    `;
  }

  function outwardEquilateral(P, Q, orientSign) {
    const mx = (P.x + Q.x) / 2;
    const my = (P.y + Q.y) / 2;
    const vx = Q.x - P.x;
    const vy = Q.y - P.y;
    const h = Math.sqrt(3) / 2;
    // Perpendicular pointing outward based on triangle winding
    const nx = -vy * orientSign;
    const ny = vx * orientSign;
    return { x: mx + h * nx, y: my + h * ny };
  }

  function centroid(P, Q, R) {
    return { x: (P.x + Q.x + R.x) / 3, y: (P.y + Q.y + R.y) / 3 };
  }

  function lineIntersect(A, B, C, D) {
    const a1 = B.y - A.y, b1 = A.x - B.x, c1 = a1 * A.x + b1 * A.y;
    const a2 = D.y - C.y, b2 = C.x - D.x, c2 = a2 * C.x + b2 * C.y;
    const det = a1 * b2 - a2 * b1;
    if (Math.abs(det) < 1e-4) return null;
    return { x: (b2 * c1 - b1 * c2) / det, y: (a1 * c2 - a2 * c1) / det };
  }

  function renderNapoleon() {
    const { A, B, C } = state.napoleon;
    const cross = (B.x - A.x) * (C.y - A.y) - (B.y - A.y) * (C.x - A.x);
    const sign = cross >= 0 ? -1 : 1;
    const C2 = outwardEquilateral(A, B, sign);
    const A2 = outwardEquilateral(B, C, sign);
    const B2 = outwardEquilateral(C, A, sign);

    const O1 = centroid(B, C, A2);
    const O2 = centroid(C, A, B2);
    const O3 = centroid(A, B, C2);

    svg.innerHTML = `
      <polygon points="${fmt(A.x)},${fmt(A.y)} ${fmt(B.x)},${fmt(B.y)} ${fmt(C2.x)},${fmt(C2.y)}" fill="var(--accent-soft)" fill-opacity="0.45" stroke="var(--canvas-axis)" stroke-width="1.2"/>
      <polygon points="${fmt(B.x)},${fmt(B.y)} ${fmt(C.x)},${fmt(C.y)} ${fmt(A2.x)},${fmt(A2.y)}" fill="var(--accent-soft)" fill-opacity="0.45" stroke="var(--canvas-axis)" stroke-width="1.2"/>
      <polygon points="${fmt(C.x)},${fmt(C.y)} ${fmt(A.x)},${fmt(A.y)} ${fmt(B2.x)},${fmt(B2.y)}" fill="var(--accent-soft)" fill-opacity="0.45" stroke="var(--canvas-axis)" stroke-width="1.2"/>
      <polygon points="${fmt(A.x)},${fmt(A.y)} ${fmt(B.x)},${fmt(B.y)} ${fmt(C.x)},${fmt(C.y)}" fill="var(--bg-soft)" fill-opacity="0.5" stroke="var(--ink)" stroke-width="1.75"/>
      <polygon points="${fmt(O1.x)},${fmt(O1.y)} ${fmt(O2.x)},${fmt(O2.y)} ${fmt(O3.x)},${fmt(O3.y)}" fill="var(--teal-soft)" stroke="var(--teal)" stroke-width="2"/>
      ${pointMarkup("O1", O1, "O₁", false, "var(--teal)", 8, -7)}
      ${pointMarkup("O2", O2, "O₂", false, "var(--teal)", -20, -6)}
      ${pointMarkup("O3", O3, "O₃", false, "var(--teal)", 8, 16)}
      ${pointMarkup("A", A, "A", true, "var(--accent)", -18, 14)}
      ${pointMarkup("B", B, "B", true, "var(--accent)", 10, 14)}
      ${pointMarkup("C", C, "C", true, "var(--accent)", 8, -10)}
    `;
  }

  function renderWedge3D() {
    const h = state.wedge3d.h;
    // Perspective projection coordinates inspired by docs/images/cover.png
    const P0 = { x: 206, y: 248 }; // back-left base
    const P1 = { x: 326, y: 278 }; // front base
    const P2 = { x: 432, y: 236 }; // right base
    const T0 = { x: 206, y: 92 };  // back-left top
    const T2 = { x: 432, y: 152 }; // curved top ridge start/end

    // Horizontal cross-section interpolation at height h
    const yLeft = P0.y - h * (P0.y - T0.y);
    const yFront = P1.y - h * 112;
    const yRight = P2.y - h * (P2.y - T2.y);

    // Intersection points on curved ribs
    const S0 = { x: P0.x, y: yLeft };
    const S1 = { x: P1.x - h * 18, y: yFront };
    const S2 = { x: P2.x - h * 12, y: yRight };
    const barY = 278 - h * 165;

    svg.innerHTML = `
      <!-- Height control track (matching cover.png) -->
      <line x1="126" y1="108" x2="126" y2="282" stroke="var(--canvas-axis)" stroke-width="1.3"/>
      <circle cx="126" cy="${fmt(barY)}" r="4.5" fill="var(--amber)" stroke="var(--surface)" stroke-width="1.5"/>
      <text x="108" y="${fmt(barY + 4)}" font-family="var(--font-serif)" font-style="italic" font-size="14" fill="var(--ink)">h</text>
      <line x1="132" y1="${fmt(barY)}" x2="${fmt(S0.x)}" y2="${fmt(S0.y)}" stroke="var(--subtle)" stroke-width="1" stroke-dasharray="4 4"/>

      <!-- Hidden base back edge -->
      <line x1="${fmt(P0.x)}" y1="${fmt(P0.y)}" x2="${fmt(P2.x)}" y2="${fmt(P2.y)}" stroke="var(--canvas-axis)" stroke-width="1.2" stroke-dasharray="5 4"/>
      <line x1="${fmt(P0.x)}" y1="${fmt(P0.y)}" x2="${fmt(P0.x)}" y2="${fmt(T0.y)}" stroke="var(--canvas-axis)" stroke-width="1.2" stroke-dasharray="5 4"/>

      <!-- Solid translucent body -->
      <path d="M ${fmt(P0.x)} ${fmt(P0.y)} L ${fmt(P1.x)} ${fmt(P1.y)} L ${fmt(P2.x)} ${fmt(P2.y)} Q 380 120 ${fmt(T0.x)} ${fmt(T0.y)} Z" fill="var(--accent-soft)" fill-opacity="0.45"/>
      <!-- Front ribs -->
      <line x1="${fmt(P0.x)}" y1="${fmt(P0.y)}" x2="${fmt(P1.x)}" y2="${fmt(P1.y)}" stroke="var(--ink)" stroke-width="1.4"/>
      <line x1="${fmt(P1.x)}" y1="${fmt(P1.y)}" x2="${fmt(P2.x)}" y2="${fmt(P2.y)}" stroke="var(--ink)" stroke-width="1.4"/>
      <path d="M ${fmt(T0.x)} ${fmt(T0.y)} Q 296 105 ${fmt(P1.x)} ${fmt(P1.y)}" fill="none" stroke="var(--ink)" stroke-width="1.45"/>
      <path d="M ${fmt(T0.x)} ${fmt(T0.y)} Q 350 112 ${fmt(P2.x)} ${fmt(P2.y)}" fill="none" stroke="var(--ink)" stroke-width="1.45"/>

      <!-- Movable horizontal cross-section plane -->
      <polygon points="${fmt(S0.x)},${fmt(S0.y)} ${fmt(S1.x)},${fmt(S1.y)} ${fmt(S2.x)},${fmt(S2.y)}" fill="var(--amber-soft)" stroke="var(--amber)" stroke-width="2"/>
      <line x1="${fmt(S0.x)}" y1="${fmt(S0.y)}" x2="${fmt(S2.x)}" y2="${fmt(S2.y)}" stroke="var(--amber)" stroke-width="1.3" stroke-dasharray="4 3"/>
    `;
  }

  function renderNinePoint() {
    const { A, B, C } = state.ninepoint;
    const Ma = { x: (B.x + C.x) / 2, y: (B.y + C.y) / 2 };
    const Mb = { x: (A.x + C.x) / 2, y: (A.y + C.y) / 2 };
    const Mc = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };

    // Circumcenter O via determinant
    const D = 2 * (A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y));
    if (Math.abs(D) < 1) return;
    const a2 = A.x * A.x + A.y * A.y;
    const b2 = B.x * B.x + B.y * B.y;
    const c2 = C.x * C.x + C.y * C.y;
    const O = {
      x: (a2 * (B.y - C.y) + b2 * (C.y - A.y) + c2 * (A.y - B.y)) / D,
      y: (a2 * (C.x - B.x) + b2 * (A.x - C.x) + c2 * (B.x - A.x)) / D,
    };
    const R = Math.hypot(A.x - O.x, A.y - O.y);
    const G = centroid(A, B, C);
    const H = { x: A.x + B.x + C.x - 2 * O.x, y: A.y + B.y + C.y - 2 * O.y };
    const N9 = { x: (O.x + H.x) / 2, y: (O.y + H.y) / 2 };

    // Extend Euler line cleanly across O and H
    const dx = H.x - O.x, dy = H.y - O.y;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len, uy = dy / len;
    const E1 = { x: O.x - ux * 42, y: O.y - uy * 42 };
    const E2 = { x: H.x + ux * 42, y: H.y + uy * 42 };

    svg.innerHTML = `
      <circle cx="${fmt(O.x)}" cy="${fmt(O.y)}" r="${fmt(R)}" fill="none" stroke="var(--canvas-axis)" stroke-width="1.1" stroke-dasharray="4 4"/>
      <circle cx="${fmt(N9.x)}" cy="${fmt(N9.y)}" r="${fmt(R / 2)}" fill="var(--accent-soft)" fill-opacity="0.55" stroke="var(--accent)" stroke-width="1.75"/>
      <polygon points="${fmt(A.x)},${fmt(A.y)} ${fmt(B.x)},${fmt(B.y)} ${fmt(C.x)},${fmt(C.y)}" fill="none" stroke="var(--ink)" stroke-width="1.6"/>
      <line x1="${fmt(E1.x)}" y1="${fmt(E1.y)}" x2="${fmt(E2.x)}" y2="${fmt(E2.y)}" stroke="var(--teal)" stroke-width="1.8"/>
      ${pointMarkup("Ma", Ma, "", false, "var(--accent)")}
      ${pointMarkup("Mb", Mb, "", false, "var(--accent)")}
      ${pointMarkup("Mc", Mc, "", false, "var(--accent)")}
      ${pointMarkup("O", O, "O", false, "var(--teal)", 8, -7)}
      ${pointMarkup("G", G, "G", false, "var(--teal)", 8, -7)}
      ${pointMarkup("N9", N9, "N₉", false, "var(--teal)", 8, 14)}
      ${pointMarkup("H", H, "H", false, "var(--teal)", 8, -7)}
      ${pointMarkup("A", A, "A", true, "var(--accent)", 10, -8)}
      ${pointMarkup("B", B, "B", true, "var(--accent)", -18, 14)}
      ${pointMarkup("C", C, "C", true, "var(--accent)", 10, 14)}
    `;
  }

  function renderCycloid() {
    const t = state.cycloid.t;
    const r = 46;
    const x0 = 96;
    const y0 = 248;

    let fullPath = "";
    let tracedPath = "";
    for (let i = 0; i <= 120; i++) {
      const tau = (i / 120) * (2 * Math.PI);
      const px = x0 + r * (tau - Math.sin(tau));
      const py = y0 - r * (1 - Math.cos(tau));
      fullPath += `${i === 0 ? "M" : "L"}${fmt(px)} ${fmt(py)} `;
    }
    const steps = 80;
    for (let i = 0; i <= steps; i++) {
      const tau = (i / steps) * t;
      const px = x0 + r * (tau - Math.sin(tau));
      const py = y0 - r * (1 - Math.cos(tau));
      tracedPath += `${i === 0 ? "M" : "L"}${fmt(px)} ${fmt(py)} `;
    }

    const cx = x0 + r * t;
    const cy = y0 - r;
    const px = x0 + r * (t - Math.sin(t));
    const py = y0 - r * (1 - Math.cos(t));

    svg.innerHTML = `
      <!-- Coordinate axes -->
      <line x1="48" y1="${y0}" x2="514" y2="${y0}" stroke="var(--canvas-axis)" stroke-width="1.3"/>
      <line x1="${x0}" y1="54" x2="${x0}" y2="296" stroke="var(--canvas-axis)" stroke-width="1.3"/>
      <path d="M510 ${y0 - 4} L516 ${y0} L510 ${y0 + 4} M${x0 - 4} 58 L${x0} 52 L${x0 + 4} 58" fill="none" stroke="var(--canvas-axis)" stroke-width="1.3"/>

      <!-- Full reference cycloid -->
      <path d="${fullPath}" fill="none" stroke="var(--canvas-axis)" stroke-width="1.3" stroke-dasharray="4 4"/>
      <!-- Active traced cycloid -->
      <path d="${tracedPath}" fill="none" stroke="var(--accent)" stroke-width="2.4" stroke-linecap="round"/>

      <!-- Rolling circle -->
      <circle cx="${fmt(cx)}" cy="${fmt(cy)}" r="${r}" fill="var(--accent-soft)" fill-opacity="0.35" stroke="var(--ink)" stroke-width="1.5"/>
      <line x1="${fmt(cx)}" y1="${fmt(cy)}" x2="${fmt(px)}" y2="${fmt(py)}" stroke="var(--teal)" stroke-width="1.6"/>
      <circle cx="${fmt(cx)}" cy="${fmt(cy)}" r="3.2" fill="var(--ink)"/>
      <circle cx="${fmt(cx)}" cy="${y0}" r="3.2" fill="var(--subtle)"/>
      ${pointMarkup("P", { x: px, y: py }, "P", false, "var(--accent)", 10, -10)}
    `;
  }

  function renderEllipse() {
    const theta = state.ellipse.theta;
    const ox = 280, oy = 180, scale = 46;
    const a = 3, b = 2, c = Math.sqrt(5);
    const dirX = 9 / c;

    // Intersect line (c + L cos(theta), L sin(theta)) with x^2/9 + y^2/4 = 1
    const ct = Math.cos(theta), st = Math.sin(theta);
    const Acoef = (ct * ct) / 9 + (st * st) / 4;
    const Bcoef = (2 * c * ct) / 9;
    const Ccoef = (c * c) / 9 - 1;
    const disc = Math.max(0, Bcoef * Bcoef - 4 * Acoef * Ccoef);
    const L1 = (-Bcoef + Math.sqrt(disc)) / (2 * Acoef);
    const L2 = (-Bcoef - Math.sqrt(disc)) / (2 * Acoef);

    const ptA = { x: ox + (c + L1 * ct) * scale, y: oy - L1 * st * scale };
    const ptB = { x: ox + (c + L2 * ct) * scale, y: oy - L2 * st * scale };
    const F1 = { x: ox - c * scale, y: oy };
    const F2 = { x: ox + c * scale, y: oy };
    const d1x = ox - dirX * scale;
    const d2x = ox + dirX * scale;

    svg.innerHTML = `
      <!-- Coordinate axes -->
      <line x1="56" y1="${oy}" x2="504" y2="${oy}" stroke="var(--canvas-axis)" stroke-width="1.25"/>
      <line x1="${ox}" y1="44" x2="${ox}" y2="316" stroke="var(--canvas-axis)" stroke-width="1.25"/>
      <path d="M500 ${oy - 4} L506 ${oy} L500 ${oy + 4} M${ox - 4} 48 L${ox} 42 L${ox + 4} 48" fill="none" stroke="var(--canvas-axis)" stroke-width="1.25"/>

      <!-- Directrices -->
      <line x1="${fmt(d1x)}" y1="48" x2="${fmt(d1x)}" y2="312" stroke="var(--amber)" stroke-width="1.2" stroke-dasharray="6 5"/>
      <line x1="${fmt(d2x)}" y1="48" x2="${fmt(d2x)}" y2="312" stroke="var(--amber)" stroke-width="1.2" stroke-dasharray="6 5"/>
      <text x="${fmt(d1x + 8)}" y="68" font-family="var(--font-serif)" font-style="italic" font-size="13" fill="var(--amber)">d₁</text>
      <text x="${fmt(d2x + 8)}" y="68" font-family="var(--font-serif)" font-style="italic" font-size="13" fill="var(--amber)">d₂</text>

      <!-- Ellipse -->
      <ellipse cx="${ox}" cy="${oy}" rx="${a * scale}" ry="${b * scale}" fill="var(--accent-soft)" fill-opacity="0.3" stroke="var(--accent)" stroke-width="1.8"/>

      <!-- Focal chord AB -->
      <line x1="${fmt(ptA.x)}" y1="${fmt(ptA.y)}" x2="${fmt(ptB.x)}" y2="${fmt(ptB.y)}" stroke="var(--teal)" stroke-width="2.1"/>

      ${pointMarkup("F1", F1, "F₁", false, "var(--amber)", -14, 18)}
      ${pointMarkup("F2", F2, "F₂", false, "var(--amber)", -6, 18)}
      ${pointMarkup("A", ptA, "A", false, "var(--ink)", 8, -8)}
      ${pointMarkup("B", ptB, "B", false, "var(--ink)", -16, 16)}
    `;
  }

  function renderPascal() {
    const cx = 280, cy = 178, rx = 168, ry = 92;
    const angles = [state.pascal.t1, ...state.pascal.rest];
    const P = angles.map((a) => ({ x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a) }));

    const X = lineIntersect(P[0], P[1], P[3], P[4]);
    const Y = lineIntersect(P[1], P[2], P[4], P[5]);
    const Z = lineIntersect(P[2], P[3], P[5], P[0]);

    const pts = [X, Y, Z].filter(Boolean);
    let pascalLine = "";
    if (pts.length >= 2) {
      let pA = pts[0], pB = pts[1], maxDist = -1;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dist = Math.hypot(pts[j].x - pts[i].x, pts[j].y - pts[i].y);
          if (dist > maxDist) { maxDist = dist; pA = pts[i]; pB = pts[j]; }
        }
      }
      const dx = pB.x - pA.x, dy = pB.y - pA.y;
      const d = Math.hypot(dx, dy) || 1;
      const ux = dx / d, uy = dy / d;
      pascalLine = `<line x1="${fmt(pA.x - ux * 42)}" y1="${fmt(pA.y - uy * 42)}" x2="${fmt(pB.x + ux * 42)}" y2="${fmt(pB.y + uy * 42)}" stroke="var(--teal)" stroke-width="2.2" stroke-linecap="round"/>`;
    }

    const pairLine = (A, B, I) => I
      ? `<line x1="${fmt(A.x)}" y1="${fmt(A.y)}" x2="${fmt(I.x)}" y2="${fmt(I.y)}" stroke="var(--canvas-axis)" stroke-width="1" stroke-dasharray="3 3"/>`
      : "";
    const subDigits = ["P₂", "P₃", "P₄", "P₅", "P₆"];

    svg.innerHTML = `
      <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="var(--accent-soft)" fill-opacity="0.25" stroke="var(--canvas-axis)" stroke-width="1.35"/>
      ${pairLine(P[0], P[1], X)}${pairLine(P[3], P[4], X)}
      ${pairLine(P[1], P[2], Y)}${pairLine(P[4], P[5], Y)}
      ${pairLine(P[2], P[3], Z)}${pairLine(P[5], P[0], Z)}
      <polygon points="${P.map((p) => `${fmt(p.x)},${fmt(p.y)}`).join(" ")}" fill="none" stroke="var(--ink)" stroke-width="1.45"/>
      ${pascalLine}
      ${X ? pointMarkup("X", X, "X", false, "var(--teal)", 8, -10) : ""}
      ${Y ? pointMarkup("Y", Y, "Y", false, "var(--teal)", 4, -11) : ""}
      ${Z ? pointMarkup("Z", Z, "Z", false, "var(--teal)", -14, -10) : ""}
      ${P.slice(1).map((pt, i) => pointMarkup(`P${i + 2}`, pt, subDigits[i], false, "var(--ink)", pt.x < cx ? -18 : 8, pt.y < cy ? -9 : 17)).join("")}
      ${pointMarkup("P1", P[0], "P₁", true, "var(--accent)", 8, -10)}
    `;
  }

  function renderDemo() {
    const demo = AGENTS[activeAgentIndex].demo;
    if (demo === "napoleon") renderNapoleon();
    else if (demo === "wedge3d") renderWedge3D();
    else if (demo === "ninepoint") renderNinePoint();
    else if (demo === "cycloid") renderCycloid();
    else if (demo === "ellipse") renderEllipse();
    else if (demo === "pascal") renderPascal();
  }

  /* ---------------- Language Switching ---------------- */
  function setLanguage(value) {
    english = value;
    root.lang = english ? "en" : "zh-CN";
    document.title = english
      ? "GeoGebra Studio: Turn math problems into interactive figures with an Agent Skill"
      : "GeoGebra Studio：用 Agent Skill 把题目做成可拖动图形";

    for (const item of translations) {
      if (item.hasEn) {
        item.element.innerHTML = english ? item.enText : item.zhText;
      }
      if (item.enLabel) {
        item.element.setAttribute("aria-label", english ? item.enLabel : item.zhLabel);
      }
      if (item.enHref) {
        item.element.setAttribute("href", english ? item.enHref : item.zhHref);
      }
    }

    langToggle.textContent = english ? "中文" : "EN";
    langToggle.setAttribute("aria-label", english ? "切换到简体中文" : "Switch to English");
    copyStatus.textContent = "";

    applyColorTheme();
    buildSelectors();
    selectAgent(activeAgentIndex, { animate: false });
  }

  langToggle.hidden = false;
  try {
    if (localStorage.getItem("ggs-lang") === "en") {
      english = true;
    }
  } catch {
    // Ignore storage restriction
  }

  langToggle.addEventListener("click", () => {
    setLanguage(!english);
    try {
      localStorage.setItem("ggs-lang", english ? "en" : "zh");
    } catch {
      // Keep current language in memory
    }
  });

  /* ---------------- Copy Buttons ---------------- */
  for (const button of document.querySelectorAll("[data-copy]")) {
    const command = document.getElementById(button.dataset.copy);
    const glyph = button.querySelector("use");
    button.hidden = false;
    let reset;

    button.addEventListener("click", async () => {
      clearTimeout(reset);
      try {
        await navigator.clipboard.writeText(command.textContent);
        glyph.setAttribute("href", "icons.svg#check-lg");
        copyStatus.textContent = english ? "Copied." : "已复制。";
      } catch {
        const selection = window.getSelection();
        selection.selectAllChildren(command);
        copyStatus.textContent = english
          ? "Text selected. Copy it using your keyboard or menu."
          : "文本已选中，请用键盘或菜单复制。";
      }

      reset = setTimeout(() => {
        glyph.setAttribute("href", "icons.svg#copy");
      }, 1800);
    });
  }

  /* ---------------- GitHub Stars ---------------- */
  fetch("https://api.github.com/repos/YZDame/GeoGebra-Studio")
    .then((response) => (response.ok ? response.json() : null))
    .then((repository) => {
      if (!Number.isSafeInteger(repository?.stargazers_count) || repository.stargazers_count < 0) return;
      starCount.textContent = repository.stargazers_count;
      starCount.parentElement.hidden = false;
    })
    .catch(() => {
      // Keep the count stamped at deployment if GitHub API is unavailable.
    });

  /* ---------------- Boot ---------------- */
  setLanguage(english);
  window.addEventListener("resize", updateHeroSlotWidth);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(updateHeroSlotWidth);
  }
  scheduleCycle();
})();
