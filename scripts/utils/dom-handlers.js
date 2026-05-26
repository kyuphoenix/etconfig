export function bindDomHandlers({
  copyButton,
  downloadButton,
  resetButton,
  themeButton,
  systemThemeQuery,
  getStoredThemeMode,
  getNextThemeMode,
  storageKey,
  applyTheme,
  animateThemeChange,
  getTomlText,
  onReset,
  statusController
}) {
  copyButton.addEventListener("click", async () => {
    await navigator.clipboard.writeText(getTomlText());
    statusController.setCopied();
  });

  downloadButton.addEventListener("click", () => {
    const blob = new Blob([getTomlText()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "config.toml";
    link.click();
    URL.revokeObjectURL(url);
    statusController.setDownloaded();
  });

  resetButton.addEventListener("click", () => {
    onReset();
    statusController.setReset();
  });

  if (themeButton) {
    themeButton.addEventListener("click", () => {
      const nextMode = getNextThemeMode(getStoredThemeMode());
      localStorage.setItem(storageKey, nextMode);
      if (typeof animateThemeChange === "function") {
        animateThemeChange(nextMode, themeButton);
      } else {
        applyTheme(nextMode);
      }
    });
  }

  if (systemThemeQuery && typeof systemThemeQuery.addEventListener === "function") {
    systemThemeQuery.addEventListener("change", () => {
      if (getStoredThemeMode() === "system") {
        applyTheme("system");
      }
    });
  }
}
