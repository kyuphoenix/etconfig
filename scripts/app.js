import {
  DEFAULT_STATE,
  GROUPS
} from "./data/config-data.js";
import { createFormRenderer } from "./form/form-renderer.js";
import { createStateController } from "./state/state-controller.js";
import { createStatusController } from "./state/ui-status.js?v=3";
import {
  createThemeController,
  getNextThemeMode,
  getStoredThemeMode,
  THEME_STORAGE_KEY
} from "./theme/theme.js?v=6";
import { createTomlBuilder } from "./toml/toml-builder.js";
import { bindDomHandlers } from "./utils/dom-handlers.js?v=3";

const formRoot = document.getElementById("formRoot");
const tomlOutput = document.getElementById("tomlOutput");
const statusText = document.getElementById("statusText");
const copyTomlBtn = document.getElementById("copyTomlBtn");
const copyTomlMobileBtn = document.getElementById("copyTomlMobileBtn");
const downloadTomlBtn = document.getElementById("downloadTomlBtn");
const resetBtn = document.getElementById("resetBtn");
const systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
const themeCycleBtn = document.getElementById("themeCycleBtn");
const themeCycleIcon = document.getElementById("themeCycleIcon");
const statusController = createStatusController(statusText);
const { applyTheme, animateThemeChange } = createThemeController({
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
  getEffectiveInstanceId,
  resetState,
  groupOpenState
} = stateController;

const tomlBuilder = createTomlBuilder({
  getEffectiveInstanceId,
  getState
});

function renderToml() {
  const toml = tomlBuilder.buildToml();
  tomlOutput.textContent = toml;
  const lineCount = toml.split("\n").filter(Boolean).length;
  statusController.setGeneratedLines(lineCount);
}

function rerender() {
  formRenderer.renderForm();
  renderToml();
}

const formRenderer = createFormRenderer({
  formRoot,
  getEffectiveInstanceId,
  getState,
  groupOpenState,
  groups: GROUPS,
  renderToml,
  rerender
});

bindDomHandlers({
  copyButton: copyTomlBtn,
  mobileCopyButton: copyTomlMobileBtn,
  downloadButton: downloadTomlBtn,
  resetButton: resetBtn,
  themeButton: themeCycleBtn,
  systemThemeQuery,
  getStoredThemeMode,
  getNextThemeMode,
  storageKey: THEME_STORAGE_KEY,
  applyTheme,
  animateThemeChange,
  getTomlText: () => tomlOutput.textContent,
  onReset: () => {
    resetState();
    rerender();
  },
  statusController
});

applyTheme(getStoredThemeMode());
rerender();
