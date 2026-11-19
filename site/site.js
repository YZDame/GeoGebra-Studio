(() => {
  const root = document.documentElement;
  const langToggle = document.querySelector("[data-lang-toggle]");
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const copyStatus = document.getElementById("copy-status");
  const starCount = document.querySelector("[data-star-count]");

  const translations = Array.from(
    document.querySelectorAll("[data-en], [data-en-label], [data-en-href]"),
    (element) => ({
      element,
      zhText: element.innerHTML,
      enText: element.getAttribute("data-en"),
      hasEn: element.hasAttribute("data-en"),
      zhLabel: element.getAttribute("aria-label"),
      enLabel: element.getAttribute("data-en-label"),
      zhHref: element.getAttribute("href"),
      enHref: element.getAttribute("data-en-href"),
    }),
  );

  let english = false;
  let activeAgentIndex = 0;
  let cycleTimer = null;
  let installMenuOpen = false;

  /* ---------------- Official Agent Registry ---------------- */
  const AGENTS = [
    {
      id: "claude",
      name: "Claude Code",
      logo: "logos/claude.svg",
      mono: false,
      accent: "#D97757",
      tint: "#f9e6dc",
      darkTint: "rgba(217, 119, 87, 0.24)",
    },
    {
      id: "chatgpt",
      name: "ChatGPT/Codex",
      logo: "logos/openai.svg",
      mono: true,
      accent: "#10A37F",
      tint: "#e6f4ee",
      darkTint: "rgba(16, 163, 127, 0.24)",
    },
    {
      id: "deepseek",
      name: "DeepSeek Harness",
      logo: "logos/deepseek.svg",
      mono: false,
      accent: "#4D6BFE",
      tint: "#e6eeff",
      darkTint: "rgba(77, 107, 254, 0.24)",
    },
    {
      id: "grok",
      name: "Grok Bot",
      logo: "logos/grok.svg",
      mono: true,
      accent: "#2E2E2E",
      tint: "#e3e6ec",
      darkTint: "rgba(255, 255, 255, 0.14)",
    },
    {
      id: "cursor",
      name: "Cursor",
      logo: "logos/cursor.svg",
      mono: true,
      accent: "#0F766E",
      tint: "#ebebeb",
      darkTint: "rgba(255, 255, 255, 0.14)",
    },
  ];

  function logoHtml(agent, className = "agent-logo") {
    const cls = agent.mono ? `${className} logo-mono`.trim() : className;
    return `<img src="${agent.logo}" alt=""${cls ? ` class="${cls}"` : ""}>`;
  }

  /* ---------------- Theme Management (Warm Eggshell Default) ---------------- */
  let themePref = null;
  try {
    themePref = localStorage.getItem("ggs-theme");
  } catch {
    themePref = null;
  }

  function effectiveDark() {
    return themePref === "dark";
  }

  function applyColorTheme() {
    if (themePref === "dark") {
      root.setAttribute("data-theme", "dark");
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
    if (rotatingPill) {
      const agent = AGENTS[activeAgentIndex];
      rotatingPill.style.backgroundColor = effectiveDark() ? agent.darkTint : agent.tint;
    }
  }

  /* ---------------- Elements ---------------- */
  const rotatingPill = document.getElementById("rotating-pill");
  const rotatingTrack = document.getElementById("rotating-track");
  const rotatingMeasure = document.getElementById("rotating-measure");
  const rotatingActive = document.getElementById("rotating-active");
  const segmentAgentLogo = document.getElementById("segment-agent-logo");

  const segment = document.querySelector("[data-segment]");
  const segmentThumb = segment?.querySelector(".segment-thumb");
  const segmentItems = segment ? Array.from(segment.querySelectorAll("[data-segment-target]")) : [];

  const installMenuBtn = document.getElementById("install-menu-btn");
  const installMenu = document.getElementById("install-menu");

  if (themeToggle) {
    themeToggle.hidden = false;
    themeToggle.addEventListener("click", () => {
      themePref = effectiveDark() ? "light" : "dark";
      try {
        localStorage.setItem("ggs-theme", themePref);
      } catch {
        // Ignore storage restriction
      }
      applyColorTheme();
    });
  }

  /* ---------------- Rotating Pill Width Measurement ---------------- */
  function measureAgentPillWidth(agent) {
    if (!rotatingMeasure) return 0;
    rotatingMeasure.innerHTML = `${logoHtml(agent)}<span>${agent.name}</span>`;
    return Math.ceil(rotatingMeasure.getBoundingClientRect().width || rotatingMeasure.offsetWidth);
  }

  function syncRotatingTrackWidth() {
    if (!rotatingTrack) return;
    const w = measureAgentPillWidth(AGENTS[activeAgentIndex]);
    if (w > 0) rotatingTrack.style.width = `${w}px`;
  }

  function updateSegmentLogo(agent, animate) {
    if (!segmentAgentLogo) return;
    if (animate && segmentAgentLogo.firstElementChild) {
      const prev = segmentAgentLogo.firstElementChild.cloneNode(true);
      prev.className = `${prev.className} is-exiting`.trim();
      segmentAgentLogo.innerHTML = "";
      segmentAgentLogo.appendChild(prev);
      const nextWrap = document.createElement("span");
      nextWrap.className = "is-entering";
      nextWrap.style.display = "inline-flex";
      nextWrap.innerHTML = logoHtml(agent, "");
      segmentAgentLogo.appendChild(nextWrap);
      setTimeout(() => {
        if (prev.parentNode === segmentAgentLogo) prev.remove();
      }, 340);
    } else {
      segmentAgentLogo.innerHTML = logoHtml(agent, "");
    }
  }

  function highlightCards(tag) {
    for (const card of document.querySelectorAll("[data-install-card]")) {
      const targets = (card.getAttribute("data-install-card") || "").split(/\s+/);
      card.classList.toggle("is-highlighted", Boolean(tag) && targets.includes(tag));
    }
  }

  /* ---------------- Select Active Agent ---------------- */
  function selectAgent(index, { animate = true, highlight = false } = {}) {
    const prevIndex = activeAgentIndex;
    activeAgentIndex = (index + AGENTS.length) % AGENTS.length;
    const agent = AGENTS[activeAgentIndex];
    const prevAgent = AGENTS[prevIndex];
    const shouldAnimate = animate && prevIndex !== activeAgentIndex;

    root.style.setProperty("--active-agent", agent.accent);
    updateSegmentLogo(agent, shouldAnimate);

    if (rotatingPill) {
      rotatingPill.style.backgroundColor = effectiveDark() ? agent.darkTint : agent.tint;
    }
    if (rotatingTrack && rotatingActive) {
      if (shouldAnimate) {
        const exiting = document.createElement("span");
        exiting.className = "rotating-exiting";
        exiting.innerHTML = `${logoHtml(prevAgent)}<span>${prevAgent.name}</span>`;
        rotatingTrack.appendChild(exiting);
        setTimeout(() => exiting.remove(), 340);
      }

      rotatingTrack.style.width = `${measureAgentPillWidth(agent)}px`;
      rotatingActive.innerHTML = `${logoHtml(agent)}<span>${agent.name}</span>`;
      if (shouldAnimate) {
        rotatingActive.classList.remove("is-entering");
        void rotatingActive.offsetWidth;
        rotatingActive.classList.add("is-entering");
      } else {
        rotatingActive.classList.remove("is-entering");
      }
    }

    if (highlight) {
      highlightCards(agent.id);
    }
  }

  /* ---------------- Agent Skills / Plugin Slider Pill ---------------- */
  let spyLockedUntil = 0;

  function placeSegmentThumb() {
    if (!segment || !segmentThumb) return;
    const active = segment.querySelector(".segment-item.is-active");
    if (!active) return;
    segmentThumb.style.width = `${active.offsetWidth}px`;
    segmentThumb.style.transform = `translateX(${active.offsetLeft}px)`;
  }

  function activateSegment(item) {
    for (const other of segmentItems) {
      const on = other === item;
      other.classList.toggle("is-active", on);
      if (on) other.setAttribute("aria-current", "page");
      else other.removeAttribute("aria-current");
    }
    placeSegmentThumb();
  }

  if (segment && segmentThumb && segmentItems.length) {
    placeSegmentThumb();
    requestAnimationFrame(() => segment.classList.add("is-ready"));
    window.addEventListener("resize", placeSegmentThumb);

    for (const item of segmentItems) {
      item.addEventListener("click", () => {
        activateSegment(item);
        spyLockedUntil = Date.now() + 1200;
        const mode = item.getAttribute("data-segment-target");
        if (mode === "plugin") {
          highlightCards("plugin");
        } else {
          highlightCards("claude");
        }
      });
    }

    const pluginSection = document.getElementById("install-plugins");
    const [skillItem, pluginItem] = segmentItems;
    const updateSegmentOnScroll = () => {
      if (Date.now() < spyLockedUntil || !pluginSection) return;
      const rect = pluginSection.getBoundingClientRect();
      const inView = rect.top < window.innerHeight * 0.55 && rect.bottom > window.innerHeight * 0.2;
      const target = inView ? pluginItem : skillItem;
      if (target && !target.classList.contains("is-active")) {
        activateSegment(target);
      }
    };
    window.addEventListener("scroll", updateSegmentOnScroll, { passive: true });
  }

  /* ---------------- Install Popover ---------------- */
  function openInstallMenu() {
    if (!installMenu || !installMenuBtn) return;
    installMenuOpen = true;
    installMenu.hidden = false;
    installMenuBtn.setAttribute("aria-expanded", "true");
  }

  function closeInstallMenu() {
    if (!installMenu || !installMenuBtn) return;
    installMenuOpen = false;
    installMenu.hidden = true;
    installMenuBtn.setAttribute("aria-expanded", "false");
  }

  if (installMenuBtn && installMenu) {
    installMenuBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      if (installMenuOpen) closeInstallMenu();
      else openInstallMenu();
    });

    for (const item of installMenu.querySelectorAll("[data-select-agent]")) {
      item.addEventListener("click", () => {
        const targetId = item.getAttribute("data-select-agent");
        const idx = AGENTS.findIndex((a) => a.id === targetId);
        if (idx >= 0) {
          selectAgent(idx, { animate: true, highlight: true });
        }
        closeInstallMenu();
      });
    }

    document.addEventListener("click", (event) => {
      if (installMenuOpen && !event.target.closest("[data-install-menu-wrap]")) {
        closeInstallMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && installMenuOpen) {
        closeInstallMenu();
        installMenuBtn.focus();
      }
    });
  }

  /* ---------------- Auto-Cycle Engine ---------------- */
  function scheduleCycle() {
    clearInterval(cycleTimer);
    cycleTimer = setInterval(() => {
      if (document.hidden || installMenuOpen) return;
      selectAgent((activeAgentIndex + 1) % AGENTS.length, { animate: true });
    }, 2800);
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
    selectAgent(activeAgentIndex, { animate: false });
    requestAnimationFrame(() => {
      syncRotatingTrackWidth();
      placeSegmentThumb();
    });
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
  for (const agent of AGENTS) new Image().src = agent.logo;
  setLanguage(english);
  window.addEventListener("resize", syncRotatingTrackWidth);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      syncRotatingTrackWidth();
      placeSegmentThumb();
    });
  }
  scheduleCycle();
})();
