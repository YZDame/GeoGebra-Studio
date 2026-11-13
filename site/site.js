const toggle = document.querySelector("[data-lang-toggle]");
const copyStatus = document.getElementById("copy-status");
const translations = Array.from(
  document.querySelectorAll("[data-en], [data-en-label], [data-en-href]"),
  (element) => ({
    element,
    text: element.textContent,
    label: element.getAttribute("aria-label"),
    href: element.getAttribute("href"),
  }),
);

let english = false;

function setLanguage(value) {
  english = value;
  document.documentElement.lang = english ? "en" : "zh-CN";

  for (const { element, text, label, href } of translations) {
    if (element.dataset.en) element.textContent = english ? element.dataset.en : text;
    if (element.dataset.enLabel) element.setAttribute("aria-label", english ? element.dataset.enLabel : label);
    if (element.dataset.enHref) element.setAttribute("href", english ? element.dataset.enHref : href);
  }

  toggle.textContent = english ? "中文" : "EN";
  toggle.setAttribute("aria-label", english ? "切换到简体中文" : "Switch to English");
  copyStatus.textContent = "";
}

toggle.hidden = false;
try {
  if (localStorage.getItem("ggs-lang") === "en") setLanguage(true);
} catch {
  // The switch also works when storage is unavailable.
}

toggle.addEventListener("click", () => {
  setLanguage(!english);
  try {
    localStorage.setItem("ggs-lang", english ? "en" : "zh");
  } catch {
    // Keep the current language for this page.
  }
});

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
      copyStatus.textContent = english ? "Text selected. Copy it using your keyboard or menu." : "文本已选中，请用键盘或菜单复制。";
    }

    reset = setTimeout(() => {
      glyph.setAttribute("href", "icons.svg#copy");
    }, 1800);
  });
}

const starCount = document.querySelector("[data-star-count]");
fetch("https://api.github.com/repos/YZDame/GeoGebra-Studio")
  .then((response) => response.ok ? response.json() : null)
  .then((repository) => {
    if (!Number.isSafeInteger(repository?.stargazers_count) || repository.stargazers_count < 0) return;
    starCount.textContent = repository.stargazers_count;
    starCount.parentElement.hidden = false;
  })
  .catch(() => {
    // Keep the count recorded at deployment if GitHub's API is unavailable.
  });
