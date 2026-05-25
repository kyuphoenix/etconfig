export const THEME_STORAGE_KEY = "etconfig-theme-mode";
const THEME_MODE_ORDER = ["system", "light", "dark"];

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
    const iconMap = {
      system: "🖥",
      light: "☀",
      dark: "☾"
    };
    if (button && icon) {
      button.dataset.mode = mode;
      button.setAttribute("aria-pressed", "true");
      button.title = labelMap[mode];
      button.setAttribute("aria-label", `主题模式：${labelMap[mode]}`);
      icon.textContent = iconMap[mode];
    }
  }

  return { applyTheme, resolveTheme };
}
