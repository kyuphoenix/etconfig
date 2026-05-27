export function bindDomHandlers({
  copyButton,
  mobileCopyButton,
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
  function fallbackCopyText(text) {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "true");
      textarea.style.position = "fixed";
      textarea.style.top = "-9999px";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);
      const copied = typeof document.execCommand === "function" ? document.execCommand("copy") : false;
      textarea.remove();
      return copied;
    } catch (error) {
      return false;
    }
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(text);
          return true;
        } catch (error) {
          // Fall back to selection-based copy for restrictive mobile browsers.
        }
      }

      return fallbackCopyText(text);
    } catch (error) {
      return false;
    }
  }

  const handleCopy = async () => {
    statusController.setCopying();

    try {
      const copied = await copyText(getTomlText());
      if (copied) {
        statusController.setCopied();
        return;
      }
    } catch (error) {
      // Fall through to the visible failure state below.
    }

    statusController.setCopyFailed();
  };

  copyButton.addEventListener("click", handleCopy);

  if (mobileCopyButton) {
    mobileCopyButton.addEventListener("click", handleCopy);
  }

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
