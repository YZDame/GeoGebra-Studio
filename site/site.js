/* Language, GitHub stars, the copyable install command, GSAP.
   The hero draws the construction once, then the live figure covers it.
   Other viewers load when they near the screen. Reduced motion skips the draw. */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function applyLang(lang) {
    var en = lang === "en";
    document.documentElement.lang = en ? "en" : "zh-CN";
    document.querySelectorAll("[data-en]").forEach(function (el) {
      if (!el.dataset.zh) el.dataset.zh = el.innerHTML;
      el.innerHTML = en ? el.dataset.en : el.dataset.zh;
    });
    var toggle = document.querySelector("[data-lang-toggle]");
    if (toggle) {
      toggle.textContent = en ? "中文" : "EN";
      toggle.setAttribute("aria-pressed", en ? "true" : "false");
    }
    try { localStorage.setItem("ggs-lang", en ? "en" : "zh"); } catch (e) {}
  }

  var toggle = document.querySelector("[data-lang-toggle]");
  if (toggle) {
    toggle.addEventListener("click", function () {
      applyLang(document.documentElement.lang === "en" ? "zh" : "en");
    });
  }
  try { if (localStorage.getItem("ggs-lang") === "en") applyLang("en"); } catch (e) {}

  var stars = document.querySelector("[data-stars]");
  function showStars(n) {
    if (!stars || typeof n !== "number") return;
    stars.textContent = String(n);
  }
  try {
    var cached = JSON.parse(localStorage.getItem("ggs-stars") || "null");
    if (cached && typeof cached.n === "number" && Date.now() - cached.t < 6 * 60 * 60 * 1000) showStars(cached.n);
  } catch (e) {}
  fetch("https://api.github.com/repos/YZDame/GeoGebra-Studio")
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      if (!data || typeof data.stargazers_count !== "number") return;
      showStars(data.stargazers_count);
      try { localStorage.setItem("ggs-stars", JSON.stringify({ n: data.stargazers_count, t: Date.now() })); } catch (e) {}
    })
    .catch(function () {});

  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var node = document.querySelector(btn.getAttribute("data-copy"));
      if (!node || !navigator.clipboard) return;
      var label = btn.querySelector(".cmd__copy");
      navigator.clipboard.writeText(node.textContent.trim()).then(function () {
        if (!label) return;
        var prev = label.textContent;
        label.textContent = document.documentElement.lang === "en" ? "Copied" : "已复制";
        setTimeout(function () { label.textContent = prev; }, 1400);
      }).catch(function () {});
    });
  });

  function mount(frame) {
    if (!frame || frame.getAttribute("src")) return;
    var src = frame.getAttribute("data-src");
    if (!src) return;
    frame.addEventListener("load", function () { frame.classList.add("is-ready"); }, { once: true });
    frame.src = src;
  }

  var hero = document.querySelector(".plate--hero");
  var heroFrame = document.querySelector("#live-frame");
  function showHero() {
    if (hero) hero.classList.add("is-drawn");
    mount(heroFrame);
  }
  if (hero && window.gsap && !reduce) {
    var lines = hero.querySelectorAll("[data-draw]");
    lines.forEach(function (el) {
      var len = 0;
      try { len = el.getTotalLength(); } catch (e) { len = 0; }
      if (!len) return;
      el.style.strokeDasharray = String(len);
      el.style.strokeDashoffset = String(len);
    });
    gsap.to(lines, {
      strokeDashoffset: 0,
      duration: 0.85,
      stagger: 0.1,
      ease: "power2.out",
      delay: 0.15,
      onComplete: showHero
    });
  } else {
    showHero();
  }

  var rest = document.querySelectorAll("iframe[data-src]:not(#live-frame)");
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    rest.forEach(function (frame) {
      ScrollTrigger.create({
        trigger: frame,
        start: "top 120%",
        once: true,
        onEnter: function () { mount(frame); }
      });
    });
  } else {
    rest.forEach(mount);
  }
})();
