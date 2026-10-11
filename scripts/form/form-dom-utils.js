let floatingTooltipEl = null;
let activeHelpBadge = null;

let floatingSelectMenuEl = null;
let activeSelectTrigger = null;
let activeSelectCleanup = null;

function ensureFloatingTooltip() {
  if (floatingTooltipEl || typeof document === "undefined") {
    return floatingTooltipEl;
  }
  floatingTooltipEl = document.createElement("div");
  floatingTooltipEl.className = "gui-floating-tooltip";
  floatingTooltipEl.setAttribute("role", "tooltip");
  floatingTooltipEl.setAttribute("aria-hidden", "true");
  document.body.appendChild(floatingTooltipEl);

  const handleViewportChange = () => {
    if (!activeHelpBadge) return;
    if (!document.body.contains(activeHelpBadge)) {
      hideFloatingTooltip();
      return;
    }
    positionFloatingTooltip(activeHelpBadge);
  };

  window.addEventListener("scroll", handleViewportChange, true);
  window.addEventListener("resize", handleViewportChange);
  document.addEventListener("pointerdown", (event) => {
    if (activeHelpBadge && !activeHelpBadge.contains(event.target)) {
      hideFloatingTooltip();
    }
  });

  return floatingTooltipEl;
}

function positionFloatingTooltip(badge) {
  const tip = ensureFloatingTooltip();
  if (!tip) return;

  const badgeRect = badge.getBoundingClientRect();
  const tipRect = tip.getBoundingClientRect();
  const margin = 10;
  const gap = 8;

  let top = badgeRect.top - tipRect.height - gap;
  if (top < margin) {
    top = badgeRect.bottom + gap;
  }

  let left = badgeRect.left + badgeRect.width / 2 - tipRect.width / 2;
  const maxLeft = window.innerWidth - tipRect.width - margin;
  left = Math.max(margin, Math.min(maxLeft, left));

  tip.style.top = `${Math.round(top)}px`;
  tip.style.left = `${Math.round(left)}px`;
}

function showFloatingTooltip(badge, text) {
  const tip = ensureFloatingTooltip();
  if (!tip) return;
  activeHelpBadge = badge;
  tip.textContent = text;
  tip.classList.add("is-visible");
  tip.setAttribute("aria-hidden", "false");
  positionFloatingTooltip(badge);
}

function hideFloatingTooltip(badge) {
  if (badge && activeHelpBadge && badge !== activeHelpBadge) {
    return;
  }
  activeHelpBadge = null;
  if (!floatingTooltipEl) return;
  floatingTooltipEl.classList.remove("is-visible");
  floatingTooltipEl.setAttribute("aria-hidden", "true");
}

function ensureFloatingSelectMenu() {
  if (floatingSelectMenuEl || typeof document === "undefined") {
    return floatingSelectMenuEl;
  }
  floatingSelectMenuEl = document.createElement("div");
  floatingSelectMenuEl.className = "gui-select-dropdown";
  floatingSelectMenuEl.setAttribute("role", "listbox");
  floatingSelectMenuEl.setAttribute("aria-hidden", "true");
  document.body.appendChild(floatingSelectMenuEl);

  const handleViewportChange = (event) => {
    if (!activeSelectTrigger) return;
    if (
      event?.type === "scroll" &&
      floatingSelectMenuEl &&
      floatingSelectMenuEl.contains(event.target)
    ) {
      return;
    }
    if (!document.body.contains(activeSelectTrigger)) {
      closeFloatingSelectMenu();
      return;
    }
    positionFloatingSelectMenu(activeSelectTrigger);
  };

  window.addEventListener("scroll", handleViewportChange, true);
  window.addEventListener("resize", handleViewportChange);
  document.addEventListener("pointerdown", (event) => {
    if (!activeSelectTrigger) return;
    if (
      activeSelectTrigger.contains(event.target) ||
      (floatingSelectMenuEl && floatingSelectMenuEl.contains(event.target))
    ) {
      return;
    }
    closeFloatingSelectMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && activeSelectTrigger) {
      const triggerToFocus = activeSelectTrigger;
      closeFloatingSelectMenu();
      triggerToFocus.focus();
    }
  });

  return floatingSelectMenuEl;
}

function positionFloatingSelectMenu(anchorEl) {
  const menu = ensureFloatingSelectMenu();
  if (!menu) return;

  const rect = anchorEl.getBoundingClientRect();
  const margin = 8;
  const gap = 6;

  menu.style.minWidth = `${Math.max(120, Math.round(rect.width))}px`;
  const menuRect = menu.getBoundingClientRect();

  const spaceBelow = window.innerHeight - rect.bottom - margin;
  const spaceAbove = rect.top - margin;

  let top = rect.bottom + gap;
  if (spaceBelow < menuRect.height && spaceAbove > spaceBelow) {
    top = Math.max(margin, rect.top - menuRect.height - gap);
  }

  let left = rect.left;
  const maxLeft = window.innerWidth - menuRect.width - margin;
  left = Math.max(margin, Math.min(maxLeft, left));

  menu.style.top = `${Math.round(top)}px`;
  menu.style.left = `${Math.round(left)}px`;
}

export function closeFloatingSelectMenu() {
  if (activeSelectTrigger) {
    activeSelectTrigger.classList.remove("is-open");
    activeSelectTrigger.setAttribute("aria-expanded", "false");
  }
  if (typeof activeSelectCleanup === "function") {
    activeSelectCleanup();
  }
  activeSelectTrigger = null;
  activeSelectCleanup = null;
  if (!floatingSelectMenuEl) return;
  floatingSelectMenuEl.classList.remove("is-visible");
  floatingSelectMenuEl.setAttribute("aria-hidden", "true");
  floatingSelectMenuEl.innerHTML = "";
}

export function createCustomSelect({
  options = [],
  value = "",
  className = "",
  ariaLabel = "选择项",
  disabled = false,
  onChange
}) {
  let currentValue = String(value ?? "");

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = `gui-select-trigger ${className}`.trim();
  btn.disabled = Boolean(disabled);
  btn.setAttribute("aria-haspopup", "listbox");
  btn.setAttribute("aria-expanded", "false");
  btn.setAttribute("aria-label", ariaLabel);

  const labelSpan = document.createElement("span");
  labelSpan.className = "gui-select-label";

  const arrowSpan = document.createElement("span");
  arrowSpan.className = "gui-select-arrow";
  arrowSpan.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>`;

  const syncLabel = () => {
    const matched =
      options.find((opt) => String(opt.value) === currentValue) || options[0];
    labelSpan.textContent = matched ? matched.label : currentValue;
  };
  syncLabel();

  btn.append(labelSpan, arrowSpan);

  const openMenu = () => {
    if (btn.disabled) return;
    if (activeSelectTrigger === btn) {
      closeFloatingSelectMenu();
      return;
    }
    closeFloatingSelectMenu();

    const menu = ensureFloatingSelectMenu();
    if (!menu) return;

    menu.innerHTML = "";
    options.forEach((opt) => {
      const optValue = String(opt.value);
      const isSelected = optValue === currentValue;
      const item = document.createElement("button");
      item.type = "button";
      item.className = `gui-select-option ${isSelected ? "is-selected" : ""}`;
      item.setAttribute("role", "option");
      item.setAttribute("aria-selected", String(isSelected));

      const text = document.createElement("span");
      text.textContent = opt.label;

      const check = document.createElement("span");
      check.className = "gui-select-check";
      check.textContent = isSelected ? "✓" : "";

      item.append(text, check);
      item.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const prev = currentValue;
        currentValue = optValue;
        syncLabel();
        closeFloatingSelectMenu();
        if (prev !== currentValue && typeof onChange === "function") {
          onChange(currentValue);
        }
      });

      menu.appendChild(item);
    });

    activeSelectTrigger = btn;
    btn.classList.add("is-open");
    btn.setAttribute("aria-expanded", "true");
    menu.classList.add("is-visible");
    menu.setAttribute("aria-hidden", "false");
    positionFloatingSelectMenu(btn);

    const selectedEl = menu.querySelector(".gui-select-option.is-selected");
    if (selectedEl && typeof selectedEl.scrollIntoView === "function") {
      selectedEl.scrollIntoView({ block: "nearest" });
    }
  };

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    openMenu();
  });

  btn.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const idx = options.findIndex((o) => String(o.value) === currentValue);
      const step = e.key === "ArrowDown" ? 1 : -1;
      const nextIdx = Math.max(
        0,
        Math.min(options.length - 1, (idx === -1 ? 0 : idx) + step)
      );
      const nextOpt = options[nextIdx];
      if (nextOpt && String(nextOpt.value) !== currentValue) {
        currentValue = String(nextOpt.value);
        syncLabel();
        if (typeof onChange === "function") {
          onChange(currentValue);
        }
      }
    }
  });

  return btn;
}

export function createHelpBadge(helpText) {
  const badge = document.createElement("span");
  badge.className = "help-badge";
  badge.tabIndex = 0;
  badge.setAttribute("role", "note");
  badge.setAttribute("aria-label", helpText);
  badge.dataset.tooltip = helpText;
  badge.textContent = "?";

  badge.addEventListener("mouseenter", () => {
    showFloatingTooltip(badge, helpText);
  });
  badge.addEventListener("mouseleave", () => {
    hideFloatingTooltip(badge);
  });
  badge.addEventListener("focus", () => {
    showFloatingTooltip(badge, helpText);
  });
  badge.addEventListener("blur", () => {
    hideFloatingTooltip(badge);
  });
  badge.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (activeHelpBadge === badge) {
      hideFloatingTooltip(badge);
    } else {
      showFloatingTooltip(badge, helpText);
    }
  });

  return badge;
}

export function createFieldHeader(titleText, keyText = "", helpText = "") {
  const wrap = document.createElement("div");
  wrap.className = "field-header";

  const titleRow = document.createElement("div");
  titleRow.className = "field-title-row";

  const title = document.createElement("span");
  title.className = "field-title";
  title.textContent = titleText;
  titleRow.appendChild(title);

  if (helpText) {
    titleRow.appendChild(createHelpBadge(helpText));
  }

  wrap.appendChild(titleRow);

  if (keyText) {
    const key = document.createElement("div");
    key.className = "field-key";
    key.textContent = keyText;
    wrap.appendChild(key);
  }

  return wrap;
}

export function createPasswordInput({
  id = "",
  value = "",
  placeholder = "",
  invalid = false,
  onInput
}) {
  const wrap = document.createElement("div");
  wrap.className = "password-input-wrap";
  if (invalid) {
    wrap.classList.add("is-invalid");
  }

  const input = document.createElement("input");
  input.type = "password";
  if (id) input.id = id;
  input.value = value || "";
  input.placeholder = placeholder;
  input.autocomplete = "off";

  const toggleBtn = document.createElement("button");
  toggleBtn.type = "button";
  toggleBtn.className = "password-toggle-btn";
  toggleBtn.title = "显示/隐藏内容";
  toggleBtn.setAttribute("aria-label", "显示或隐藏密码");
  toggleBtn.textContent = "显示";

  toggleBtn.addEventListener("click", () => {
    const showing = input.type === "text";
    input.type = showing ? "password" : "text";
    toggleBtn.textContent = showing ? "显示" : "隐藏";
  });

  input.addEventListener("input", () => {
    onInput(input.value, wrap);
  });

  wrap.append(input, toggleBtn);
  return { wrap, input };
}

export function createSwitchControl({
  id = "",
  checked = false,
  labelText = "",
  helpText = "",
  onChange
}) {
  const row = document.createElement("div");
  row.className = "switch-row";

  const label = document.createElement("label");
  label.className = "switch-label";
  if (id) label.htmlFor = id;

  const input = document.createElement("input");
  input.type = "checkbox";
  input.className = "switch-input";
  if (id) input.id = id;
  input.checked = Boolean(checked);

  const track = document.createElement("span");
  track.className = "switch-track";

  const text = document.createElement("span");
  text.className = "switch-text";
  text.textContent = labelText;

  input.addEventListener("change", () => {
    onChange(input.checked);
  });

  label.append(input, track, text);
  row.appendChild(label);

  if (helpText) {
    row.appendChild(createHelpBadge(helpText));
  }

  return row;
}

export function createToggleButton({
  checked = false,
  onChange
}) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = `gui-toggle-btn ${checked ? "is-on" : "is-off"}`;
  btn.setAttribute("aria-pressed", String(Boolean(checked)));

  const icon = document.createElement("span");
  icon.className = "gui-toggle-icon";
  icon.textContent = checked ? "✓" : "✕";

  const text = document.createElement("span");
  text.textContent = checked ? "已开启（点击关闭）" : "已关闭（点击开启）";

  btn.append(icon, text);
  btn.addEventListener("click", () => {
    onChange(!checked);
  });

  return btn;
}

export function createChipsInput({
  values = [],
  placeholder = "输入后按回车添加",
  suggestCidr = false,
  onChange
}) {
  const container = document.createElement("div");
  container.className = "chips-container";

  const chipsWrap = document.createElement("div");
  chipsWrap.className = "chips-wrap";

  const inputRow = document.createElement("div");
  inputRow.className = "chips-input-row";

  const input = document.createElement("input");
  input.type = "text";
  input.className = "chips-text-input";
  input.placeholder = placeholder;
  input.autocomplete = "off";

  const addBtn = document.createElement("button");
  addBtn.type = "button";
  addBtn.className = "mini-btn chips-add-btn";
  addBtn.textContent = "+ 添加";

  function renderChips() {
    chipsWrap.innerHTML = "";
    values.forEach((item, index) => {
      const chip = document.createElement("span");
      chip.className = "chip-tag";

      const text = document.createElement("span");
      text.className = "chip-tag-text";
      text.textContent = item;

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "chip-remove-btn";
      removeBtn.title = "移除";
      removeBtn.setAttribute("aria-label", `移除 ${item}`);
      removeBtn.textContent = "×";
      removeBtn.addEventListener("click", () => {
        values.splice(index, 1);
        renderChips();
        onChange(values);
      });

      chip.append(text, removeBtn);
      chipsWrap.appendChild(chip);
    });
    chipsWrap.style.display = values.length > 0 ? "flex" : "none";
  }

  function commitValue(rawVal) {
    const raw = String(rawVal ?? input.value).trim();
    if (!raw) return;
    const parts = raw
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    let changed = false;
    for (const part of parts) {
      if (!values.includes(part)) {
        values.push(part);
        changed = true;
      }
    }
    input.value = "";
    if (activeSelectTrigger === input) {
      closeFloatingSelectMenu();
    }
    if (changed) {
      renderChips();
      onChange(values);
    }
  }

  if (suggestCidr) {
    const updateCidrMenu = () => {
      const q = input.value.trim();
      if (!q) {
        if (activeSelectTrigger === input) {
          closeFloatingSelectMenu();
        }
        return;
      }
      const suggestions = [];
      if (q.includes("/")) {
        suggestions.push(q);
      } else {
        const preferred = [24, 16, 8, 32];
        const seen = new Set();
        for (const len of preferred) {
          seen.add(len);
          suggestions.push(`${q}/${len}`);
        }
        for (let i = 0; i <= 32; i += 1) {
          if (!seen.has(i)) {
            suggestions.push(`${q}/${i}`);
          }
        }
      }

      const menu = ensureFloatingSelectMenu();
      if (!menu) return;
      menu.innerHTML = "";
      suggestions.forEach((cidrStr) => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "gui-select-option";
        item.setAttribute("role", "option");
        const span = document.createElement("span");
        span.textContent = cidrStr;
        item.appendChild(span);
        item.addEventListener("mousedown", (e) => {
          e.preventDefault();
          commitValue(cidrStr);
        });
        menu.appendChild(item);
      });

      activeSelectTrigger = input;
      menu.classList.add("is-visible");
      menu.setAttribute("aria-hidden", "false");
      positionFloatingSelectMenu(input);
    };

    input.addEventListener("input", updateCidrMenu);
    input.addEventListener("focus", () => {
      if (input.value.trim()) {
        updateCidrMenu();
      }
    });
  }

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commitValue();
    } else if (
      event.key === "Backspace" &&
      input.value === "" &&
      values.length > 0
    ) {
      values.pop();
      renderChips();
      onChange(values);
    }
  });

  input.addEventListener("blur", () => {
    if (activeSelectTrigger === input) {
      closeFloatingSelectMenu();
    }
    if (input.value.trim()) {
      commitValue();
    }
  });

  addBtn.addEventListener("click", () => {
    commitValue();
    input.focus();
  });

  renderChips();
  inputRow.append(input, addBtn);
  container.append(chipsWrap, inputRow);
  return container;
}
