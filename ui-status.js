export function createStatusController(statusText) {
  return {
    setGeneratedLines(lineCount) {
      statusText.textContent = `已生成 ${lineCount} 行`;
    },
    setCopied() {
      statusText.textContent = "已复制到剪贴板";
    },
    setDownloaded() {
      statusText.textContent = "已下载 config.toml";
    },
    setReset() {
      statusText.textContent = "已清空为安全默认状态";
    }
  };
}
