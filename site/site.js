/* Language, the live star count, copyable commands, and GSAP.
   The construction strokes draw once on load. ScrollTrigger only assigns
   an iframe address when that figure nears the screen, so deployggb.js
   stays off the first paint. Reduced motion skips the stroke draw. */
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
  var stored = null;
  try { stored = localStorage.getItem("ggs-lang"); } catch (e) {}
  if (stored === "en") applyLang("en");

  var stars = document.querySelector("[data-stars]");
  var STAR_KEY = "ggs-stars";
  function showStars(n) {
    if (!stars || typeof n !== "number") return;
    stars.textContent = "· " + n;
  }
  try {
    var cached = JSON.parse(localStorage.getItem(STAR_KEY) || "null");
    if (cached && typeof cached.n === "number" && Date.now() - cached.t < 6 * 60 * 60 * 1000) showStars(cached.n);
  } catch (e) {}
  fetch("https://api.github.com/repos/YZDame/GeoGebra-Studio")
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      if (!data || typeof data.stargazers_count !== "number") return;
      showStars(data.stargazers_count);
      try { localStorage.setItem(STAR_KEY, JSON.stringify({ n: data.stargazers_count, t: Date.now() })); } catch (e) {}
    })
    .catch(function () {});

  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var node = document.querySelector(btn.getAttribute("data-copy"));
      if (!node) return;
      var text = node.innerText.trim();
      var done = function () {
        if (!btn.dataset.zh) btn.dataset.zh = btn.textContent;
        var en = document.documentElement.lang === "en";
        var prev = en ? (btn.dataset.en || btn.dataset.zh) : btn.dataset.zh;
        btn.textContent = en ? "Copied" : "已复制";
        setTimeout(function () { btn.textContent = prev; }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(function () {});
      }
    });
  });

  function arm(frame) {
    if (!frame || frame.dataset.armed) return;
    frame.dataset.armed = "1";
    frame.addEventListener("load", function () { frame.classList.add("is-ready"); });
  }

  function mount(frame) {
    if (!frame || frame.src) return;
    var src = frame.getAttribute("data-src");
    if (!src) return;
    arm(frame);
    frame.src = src;
  }

  document.querySelectorAll("iframe[data-src]").forEach(arm);

  if (window.gsap) {
    if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    if (!reduce) {
      document.querySelectorAll("[data-draw]").forEach(function (el) {
        var len = 0;
        try { len = el.getTotalLength(); } catch (e) { len = 0; }
        if (!len) return;
        el.style.strokeDasharray = String(len);
        el.style.strokeDashoffset = String(len);
      });
      gsap.to("[data-draw]", {
        strokeDashoffset: 0,
        duration: 1.35,
        stagger: 0.12,
        ease: "power2.out",
        delay: 0.25
      });
    }
    if (window.ScrollTrigger) {
      document.querySelectorAll("iframe[data-src]").forEach(function (frame) {
        ScrollTrigger.create({
          trigger: frame,
          start: "top 125%",
          once: true,
          onEnter: function () { mount(frame); }
        });
      });
    } else {
      document.querySelectorAll("iframe[data-src]").forEach(mount);
    }
  } else {
    document.querySelectorAll("iframe[data-src]").forEach(mount);
  }

  document.querySelectorAll(".ex-row").forEach(function (row) {
    row.addEventListener("click", function () {
      var frame = document.querySelector("#live-frame");
      var src = row.getAttribute("data-src");
      if (!frame || !src) return;
      document.querySelectorAll(".ex-row").forEach(function (other) {
        other.setAttribute("aria-pressed", other === row ? "true" : "false");
      });
      if (frame.src && frame.src.indexOf(src) !== -1) return;
      frame.classList.remove("is-ready");
      arm(frame);
      frame.src = src;
    });
  });
})();
