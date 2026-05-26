import { getByPath, setByPath } from "./path-utils.js";

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
  function createMetaText(className, text) {
    const node = document.createElement("div");
    node.className = className;
    node.textContent = text;
    return node;
  }

  function createStringList(field) {
    const block = document.createElement("div");
    block.className = "list-block";

    const values = getByPath(getState(), field.path);
    values.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "list-item";

      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = field.placeholder || "";
      input.value = item;
      input.addEventListener("input", () => {
        values[index] = input.value;
        renderToml();
      });

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "mini-btn danger-btn";
      removeBtn.textContent = "删除";
      removeBtn.addEventListener("click", () => {
        values.splice(index, 1);
        rerender();
      });

      row.appendChild(input);
      row.appendChild(removeBtn);
      block.appendChild(row);
    });

    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "ghost-btn";
    addBtn.textContent = field.addLabel || "新增";
    addBtn.addEventListener("click", () => {
      values.push("");
      rerender();
    });

    block.appendChild(addBtn);
    return block;
  }

  function createObjectList(field) {
    const block = document.createElement("div");
    block.className = "card-block";

    const items = getByPath(getState(), field.path);
    items.forEach((item, index) => {
      const card = document.createElement("div");
      card.className = "dynamic-card";

      const head = document.createElement("div");
      head.className = "dynamic-card-head";

      const title = document.createElement("strong");
      title.textContent = `${field.itemTitle || "Item"} ${index + 1}`;

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "mini-btn danger-btn";
      removeBtn.textContent = "删除";
      removeBtn.addEventListener("click", () => {
        items.splice(index, 1);
        rerender();
      });

      head.appendChild(title);
      head.appendChild(removeBtn);
      card.appendChild(head);

      const grid = document.createElement("div");
      grid.className = "sub-grid";

      field.schema.forEach((subField) => {
        const fieldWrap = document.createElement("div");
        fieldWrap.className = "field";

        const label = document.createElement("label");
        label.className = "field-title";
        label.textContent = subField.title;
        fieldWrap.appendChild(label);

        let input;
        if (subField.type === "select") {
          input = document.createElement("select");
          subField.options.forEach((option) => {
            const node = document.createElement("option");
            node.value = option.value;
            node.textContent = option.label;
            input.appendChild(node);
          });
          input.addEventListener("change", () => {
            item[subField.key] = input.value;
            renderToml();
          });
        } else {
          input = document.createElement("input");
          input.type = subField.type || "text";
          input.placeholder = subField.placeholder || "";
        }

        input.value = item[subField.key] || "";
        input.addEventListener("input", () => {
          item[subField.key] = input.value;
          renderToml();
        });
        fieldWrap.appendChild(input);
        fieldWrap.appendChild(createMetaText("field-key", subField.keyName || subField.key));
        grid.appendChild(fieldWrap);
      });

      card.appendChild(grid);
      block.appendChild(card);
    });

    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "ghost-btn";
    addBtn.textContent = field.addLabel || "新增";
    addBtn.addEventListener("click", () => {
      const nextItem = {};
      field.schema.forEach((subField) => {
        nextItem[subField.key] = "";
      });
      items.push(nextItem);
      rerender();
    });
    block.appendChild(addBtn);

    return block;
  }

  function createListenerList(field) {
    const block = document.createElement("div");
    block.className = "card-block";

    const items = getByPath(getState(), field.path);
    items.forEach((item, index) => {
      const card = document.createElement("div");
      card.className = "dynamic-card";

      const head = document.createElement("div");
      head.className = "dynamic-card-head";

      const title = document.createElement("strong");
      title.textContent = `监听器 ${index + 1}`;

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "mini-btn danger-btn";
      removeBtn.textContent = "删除";
      removeBtn.addEventListener("click", () => {
        items.splice(index, 1);
        rerender();
      });

      head.appendChild(title);
      head.appendChild(removeBtn);
      card.appendChild(head);

      const row = document.createElement("div");
      row.className = "listener-grid";

      const protocolWrap = document.createElement("div");
      protocolWrap.className = "field";
      const protocolLabel = document.createElement("label");
      protocolLabel.className = "field-title";
      protocolLabel.textContent = "协议";
      const protocolSelect = document.createElement("select");
      protocolOptions.forEach((option) => {
        const node = document.createElement("option");
        node.value = option.value;
        node.textContent = option.label;
        protocolSelect.appendChild(node);
      });
      protocolSelect.value = item.protocol || "";
      protocolSelect.addEventListener("change", () => {
        item.protocol = protocolSelect.value;
        renderToml();
      });
      protocolWrap.appendChild(protocolLabel);
      protocolWrap.appendChild(protocolSelect);
      protocolWrap.appendChild(createMetaText("field-key", "listeners[].protocol"));

      const hostWrap = document.createElement("div");
      hostWrap.className = "field";
      const hostLabel = document.createElement("label");
      hostLabel.className = "field-title";
      hostLabel.textContent = "监听 IP";
      const hostInput = document.createElement("input");
      hostInput.type = "text";
      hostInput.placeholder = "例如 0.0.0.0";
      hostInput.value = item.host || "";
      hostInput.addEventListener("input", () => {
        item.host = hostInput.value;
        renderToml();
      });
      hostWrap.appendChild(hostLabel);
      hostWrap.appendChild(hostInput);
      hostWrap.appendChild(createMetaText("field-key", "listeners[].host"));

      const portWrap = document.createElement("div");
      portWrap.className = "field";
      const portLabel = document.createElement("label");
      portLabel.className = "field-title";
      portLabel.textContent = "端口";
      const portInput = document.createElement("input");
      portInput.type = "number";
      portInput.placeholder = "例如 11010";
      portInput.value = item.port || "";
      portInput.addEventListener("input", () => {
        item.port = portInput.value;
        renderToml();
      });
      portWrap.appendChild(portLabel);
      portWrap.appendChild(portInput);
      portWrap.appendChild(createMetaText("field-key", "listeners[].port"));

      row.appendChild(protocolWrap);
      row.appendChild(hostWrap);
      row.appendChild(portWrap);
      card.appendChild(row);
      block.appendChild(card);
    });

    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "ghost-btn";
    addBtn.textContent = field.addLabel || "新增";
    addBtn.addEventListener("click", () => {
      items.push({ protocol: "tcp", host: "0.0.0.0", port: "" });
      rerender();
    });
    block.appendChild(addBtn);

    return block;
  }

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
