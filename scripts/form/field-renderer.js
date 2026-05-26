import { createMetaText } from "./form-dom-utils.js";

export function createFieldRenderer({
  createListenerList,
  createObjectList,
  createStringList,
  getByPath,
  getEffectiveInstanceId,
  getState,
  renderToml,
  setByPath
}) {
  function createField(field) {
    const wrapper = document.createElement("div");
    wrapper.className = `field${field.full ? " full" : ""}`;

    const title = document.createElement("label");
    title.className = "field-title";
    title.textContent = field.title;
    wrapper.appendChild(title);

    if (field.type === "text" || field.type === "number") {
      const input = document.createElement("input");
      input.type = field.type;
      input.placeholder = field.path === "instance_id" && !getByPath(getState(), field.path)
        ? getEffectiveInstanceId()
        : (field.placeholder || "");
      input.value = getByPath(getState(), field.path) ?? "";
      input.addEventListener("input", () => {
        setByPath(getState(), field.path, input.value);
        if (field.path === "instance_id" && !input.value.trim()) {
          input.placeholder = getEffectiveInstanceId();
        }
        renderToml();
      });
      wrapper.appendChild(input);
    } else if (field.type === "select") {
      const select = document.createElement("select");
      field.options.forEach((option) => {
        const node = document.createElement("option");
        node.value = option.value;
        node.textContent = option.label;
        select.appendChild(node);
      });
      select.value = getByPath(getState(), field.path) ?? "";
      select.addEventListener("change", () => {
        setByPath(getState(), field.path, select.value);
        renderToml();
      });
      wrapper.appendChild(select);
    } else if (field.type === "string-list") {
      wrapper.appendChild(createStringList(field));
    } else if (field.type === "listener-list") {
      wrapper.appendChild(createListenerList(field));
    } else if (field.type === "object-list") {
      wrapper.appendChild(createObjectList(field));
    }

    wrapper.appendChild(createMetaText("field-key", field.keyName));
    return wrapper;
  }

  return {
    createField
  };
}
