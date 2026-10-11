import { renderGroupPanelBody } from "./field-renderer.js";
import { closeFloatingSelectMenu } from "./form-dom-utils.js";

export function createFormRenderer({
  formRoot,
  getEffectiveInstanceId,
  getState,
  groupOpenState,
  groups,
  renderToml,
  rerender
}) {
  function renderForm() {
    closeFloatingSelectMenu();
    const state = getState();
    const scrollParent = formRoot.closest(".panel-scroll");
    const savedScrollTop = scrollParent ? scrollParent.scrollTop : 0;

    formRoot.innerHTML = "";

    groups.forEach((group) => {
      const card = document.createElement("details");
      card.className = "group-card";
      card.open = groupOpenState.get(group.title) ?? !group.collapsed;

      const head = document.createElement("summary");
      head.className = "group-head";

      const headCopy = document.createElement("div");
      const title = document.createElement("h3");
      title.textContent = group.title;
      const desc = document.createElement("p");
      desc.textContent = group.description;
      headCopy.append(title, desc);

      const indicator = document.createElement("span");
      indicator.className = "fold-indicator";
      indicator.textContent = "展开";

      head.append(headCopy, indicator);

      card.addEventListener("toggle", () => {
        groupOpenState.set(group.title, card.open);
      });

      const body = document.createElement("div");
      body.className = "group-body";
      body.appendChild(
        renderGroupPanelBody(group.id, {
          state,
          getEffectiveInstanceId,
          renderToml,
          rerender
        })
      );

      card.append(head, body);
      formRoot.appendChild(card);
    });

    if (scrollParent) {
      scrollParent.scrollTop = savedScrollTop;
    }
  }

  return {
    renderForm
  };
}
