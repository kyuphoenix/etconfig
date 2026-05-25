import {
  DATA_COMPRESS_ALGO_MAP,
  DEFAULT_STATE,
  GROUPS,
  PROTOCOL_OPTIONS
} from "./config-data.js";
import { createFormRenderer } from "./form-renderer.js";
import { createStateController } from "./state-controller.js";
import {
  createThemeController,
  getNextThemeMode,
  getStoredThemeMode,
  THEME_STORAGE_KEY
} from "./theme.js";
import { createTomlBuilder } from "./toml-builder.js";

const formRoot = document.getElementById("formRoot");
const tomlOutput = document.getElementById("tomlOutput");
const statusText = document.getElementById("statusText");
const systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
const themeCycleBtn = document.getElementById("themeCycleBtn");
const themeCycleIcon = document.getElementById("themeCycleIcon");
const { applyTheme } = createThemeController({
  root: document.documentElement,
  button: themeCycleBtn,
  icon: themeCycleIcon,
  systemThemeQuery
});
const stateController = createStateController({
  defaultState: DEFAULT_STATE,
  groups: GROUPS
});
const {
  getState,
  getByPath,
  setByPath,
  getEffectiveInstanceId,
  resetState,
  groupOpenState
} = stateController;

const tomlBuilder = createTomlBuilder({
  dataCompressAlgoMap: DATA_COMPRESS_ALGO_MAP,
  getEffectiveInstanceId,
  getState
});

function renderToml() {
  const toml = tomlBuilder.buildToml();
  tomlOutput.textContent = toml;
  const lineCount = toml.split("\n").filter(Boolean).length;
  statusText.textContent = `已生成 ${lineCount} 行`;
}

function rerender() {
  formRenderer.renderForm();
  renderToml();
}

const formRenderer = createFormRenderer({
  formRoot,
  getByPath,
  getEffectiveInstanceId,
  getState,
  groupOpenState,
  groups: GROUPS,
  protocolOptions: PROTOCOL_OPTIONS,
  renderToml,
  rerender,
  setByPath
});

document.getElementById("copyTomlBtn").addEventListener("click", async () => {
  const text = tomlOutput.textContent;
  await navigator.clipboard.writeText(text);
  statusText.textContent = "已复制到剪贴板";
});

document.getElementById("downloadTomlBtn").addEventListener("click", () => {
  const blob = new Blob([tomlOutput.textContent], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "config.toml";
  link.click();
  URL.revokeObjectURL(url);
  statusText.textContent = "已下载 config.toml";
});

document.getElementById("resetBtn").addEventListener("click", () => {
  resetState();
  rerender();
  statusText.textContent = "已清空为安全默认状态";
});

if (themeCycleBtn) {
  themeCycleBtn.addEventListener("click", () => {
    const nextMode = getNextThemeMode(getStoredThemeMode());
    localStorage.setItem(THEME_STORAGE_KEY, nextMode);
    applyTheme(nextMode);
  });
}

if (systemThemeQuery && typeof systemThemeQuery.addEventListener === "function") {
  systemThemeQuery.addEventListener("change", () => {
    if (getStoredThemeMode() === "system") {
      applyTheme("system");
    }
  });
}

applyTheme(getStoredThemeMode());
rerender();
