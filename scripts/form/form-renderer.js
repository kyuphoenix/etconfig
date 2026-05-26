import { createFieldRenderer } from "./field-renderer.js";
import { createListRenderers } from "./dynamic-list-renderers.js";
import { getByPath, setByPath } from "../utils/path-utils.js";

export function createFormRenderer({
  formRoot,
  getEffectiveInstanceId,
  getState,
  groupOpenState,
  groups,
  protocolOptions,
  renderToml,
  rerender
}) {
  const { createStringList, createObjectList, createListenerList } = createListRenderers({
    getByPath,
    getState,
    protocolOptions,
    renderToml,
    rerender
  });
  const { createField } = createFieldRenderer({
    createListenerList,
    createObjectList,
    createStringList,
    getByPath,
    getEffectiveInstanceId,
    getState,
    renderToml,
    setByPath
  });

  function renderForm() {
    formRoot.innerHTML = "";
    groups.forEach((group) => {
      const section = document.createElement("details");
      section.className = "group-card";
      section.open = groupOpenState.get(group.title) ?? !group.collapsed;
      section.addEventListener("toggle", () => {
        groupOpenState.set(group.title, section.open);
      });

      const summary = document.createElement("summary");
      summary.className = "group-head";
      summary.innerHTML = `<div><h3>${group.title}</h3><p>${group.description}</p></div><span class="fold-indicator">展开</span>`;

      const body = document.createElement("div");
      body.className = "group-body";

      const grid = document.createElement("div");
      grid.className = "field-grid";
      group.fields.forEach((field) => {
        grid.appendChild(createField(field));
      });

      body.appendChild(grid);
      section.appendChild(summary);
      section.appendChild(body);
      formRoot.appendChild(section);
    });
  }

  return {
    renderForm
  };
}
