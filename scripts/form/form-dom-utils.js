export function createMetaText(className, text) {
  const node = document.createElement("div");
  node.className = className;
  node.textContent = text;
  return node;
}

export function createRemoveButton(onClick) {
  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "mini-btn danger-btn";
  removeBtn.textContent = "删除";
  removeBtn.addEventListener("click", onClick);
  return removeBtn;
}

export function createAddButton(text, onClick) {
  const addBtn = document.createElement("button");
  addBtn.type = "button";
  addBtn.className = "ghost-btn";
  addBtn.textContent = text || "新增";
  addBtn.addEventListener("click", onClick);
  return addBtn;
}
