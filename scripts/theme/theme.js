export const THEME_STORAGE_KEY = "etconfig-theme-mode";
const THEME_MODE_ORDER = ["system", "light", "dark"];
const THEME_BACKGROUNDS = {
  light: `radial-gradient(circle at top left, rgba(219, 177, 107, 0.24), transparent 28%), radial-gradient(circle at top right, rgba(13, 107, 97, 0.18), transparent 24%), linear-gradient(135deg, #f4efe6 0%, #efe4d3 44%, #e8dcc7 100%)`,
  dark: `radial-gradient(circle at top left, rgba(226, 157, 81, 0.12), transparent 28%), radial-gradient(circle at top right, rgba(48, 178, 157, 0.16), transparent 24%), linear-gradient(135deg, #121617 0%, #111719 44%, #0a0d0e 100%)`
};
const ICON_MAP = {
  system: `
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect width="20" height="14" x="2" y="3" rx="2"></rect>
      <line x1="8" x2="16" y1="21" y2="21"></line>
      <line x1="12" x2="12" y1="17" y2="21"></line>
    </svg>
  `,
  light: `
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="4.25"></circle>
      <path d="M12 2v2"></path>
      <path d="M12 20v2"></path>
      <path d="m4.93 4.93 1.41 1.41"></path>
      <path d="m17.66 17.66 1.41 1.41"></path>
      <path d="M2 12h2"></path>
      <path d="M20 12h2"></path>
      <path d="m6.34 17.66-1.41 1.41"></path>
      <path d="m19.07 4.93-1.41 1.41"></path>
    </svg>
  `,
  dark: `
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"></path>
    </svg>
  `
};

function getIconMarkup(mode) {
  return ICON_MAP[mode];
}

function getIconColor(mode, resolvedTheme) {
  if (mode === "light") return "#1e1f1c";
  if (mode === "dark") return "#f3f6f4";
  return resolvedTheme === "dark" ? "#f3f6f4" : "#1e1f1c";
}

export function getStoredThemeMode() {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
}

export function getNextThemeMode(mode) {
  const currentIndex = THEME_MODE_ORDER.indexOf(mode);
  return THEME_MODE_ORDER[(currentIndex + 1) % THEME_MODE_ORDER.length];
}

export function createThemeController({ root, button, icon, systemThemeQuery }) {
  function resolveTheme(mode) {
    if (mode === "light" || mode === "dark") {
      return mode;
    }
    return systemThemeQuery.matches ? "dark" : "light";
  }

  function applyTheme(mode) {
    const resolvedTheme = resolveTheme(mode);
    root.dataset.themeMode = mode;
    root.dataset.theme = resolvedTheme;
    const labelMap = {
      system: "跟随系统",
      light: "浅色模式",
      dark: "深色模式"
    };
    const iconMode = mode === "system" ? "system" : mode;
    if (button && icon) {
      button.dataset.mode = mode;
      button.setAttribute("aria-pressed", "true");
      button.title = `主题：${labelMap[mode]}`;
      button.setAttribute("aria-label", `主题：${labelMap[mode]}`);
      icon.innerHTML = getIconMarkup(iconMode);
      icon.style.color = getIconColor(mode, resolvedTheme);
    }
  }

  function animateThemeChange(mode, trigger) {
    const resolvedTheme = resolveTheme(mode);
    if (typeof window === "undefined" || typeof document === "undefined") {
      applyTheme(mode);
      return;
    }

    const source = trigger?.getBoundingClientRect?.() || button?.getBoundingClientRect?.();
    const originX = source ? source.left + source.width / 2 : window.innerWidth - 32;
    const originY = source ? source.top + source.height / 2 : 32;
    const radius = Math.hypot(
      Math.max(originX, window.innerWidth - originX),
      Math.max(originY, window.innerHeight - originY)
    );

    const overlay = document.createElement("div");
    overlay.className = "theme-transition-overlay";
    overlay.style.left = `${originX - radius}px`;
    overlay.style.top = `${originY - radius}px`;
    overlay.style.width = `${radius * 2}px`;
    overlay.style.height = `${radius * 2}px`;
    overlay.style.background = THEME_BACKGROUNDS[resolvedTheme];

    root.classList.add("theme-animating");
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.classList.add("is-active");
    });

    window.setTimeout(() => {
      applyTheme(mode);
    }, 140);

    const cleanup = () => {
      overlay.removeEventListener("transitionend", cleanup);
      overlay.remove();
      root.classList.remove("theme-animating");
    };

    overlay.addEventListener("transitionend", cleanup);
  }

  return { applyTheme, animateThemeChange, resolveTheme };
}
