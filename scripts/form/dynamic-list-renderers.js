import { createAddButton, createMetaText, createRemoveButton } from "./form-dom-utils.js";

export function createListRenderers({
  getByPath,
  getState,
  protocolOptions,
  renderToml,
  rerender
}) {
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

      row.appendChild(input);
      row.appendChild(createRemoveButton(() => {
        values.splice(index, 1);
        rerender();
      }));
      block.appendChild(row);
    });

    block.appendChild(createAddButton(field.addLabel || "新增", () => {
      values.push("");
      rerender();
    }));

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
      head.appendChild(title);
      head.appendChild(createRemoveButton(() => {
        items.splice(index, 1);
        rerender();
      }));
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

    block.appendChild(createAddButton(field.addLabel || "新增", () => {
      const nextItem = {};
      field.schema.forEach((subField) => {
        nextItem[subField.key] = "";
      });
      items.push(nextItem);
      rerender();
    }));

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
      head.appendChild(title);
      head.appendChild(createRemoveButton(() => {
        items.splice(index, 1);
        rerender();
      }));
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

    block.appendChild(createAddButton(field.addLabel || "新增", () => {
      items.push({ protocol: "tcp", host: "0.0.0.0", port: "" });
      rerender();
    }));

    return block;
  }

  return {
    createListenerList,
    createObjectList,
    createStringList
  };
}
