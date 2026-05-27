function ensureToastElement() {
  let toast = document.getElementById("toastMessage");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toastMessage";
    toast.className = "toast-message";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.appendChild(toast);
  }

  return toast;
}

export function createStatusController(statusText) {
  const toast = ensureToastElement();
  let hideTimer = null;

  function showToast(message, type) {
    if (hideTimer) {
      window.clearTimeout(hideTimer);
      hideTimer = null;
    }

    toast.textContent = message;
    toast.dataset.type = type;
    toast.classList.add("is-visible");

    hideTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 2200);
  }

  return {
    setGeneratedLines(lineCount) {
      statusText.textContent = `已生成 ${lineCount} 行`;
    },
    setCopying() {
      showToast("正在复制 TOML...", "success");
    },
    setCopied() {
      showToast("TOML 已复制到剪贴板", "success");
    },
    setCopyFailed() {
      showToast("复制失败，请手动复制", "error");
    },
    setDownloaded() {
      statusText.textContent = "已下载 config.toml";
    },
    setReset() {
      statusText.textContent = "已清空为安全默认值";
    }
  };
}
