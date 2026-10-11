import {
  ACL_ACTIONS,
  ACL_CHAIN_TYPES,
  ACL_PROTOCOLS,
  PATH_PROTOS,
  PORT_FORWARD_PROTO_OPTIONS,
  createEmptyAcl,
  createVpnPortalConfig
} from "../data/config-data.js";
import {
  createChipsInput,
  createCustomSelect,
  createFieldHeader,
  createPasswordInput,
  createSwitchControl
} from "./form-dom-utils.js";

export function parseGuiUrl(input, protos) {
  const defaultProto = Object.keys(protos)[0] || "tcp";
  const defaultPort = protos[defaultProto] !== 0 ? protos[defaultProto] : null;
  let proto = defaultProto;
  let host = "";
  let port = defaultPort;
  let path = "";

  if (!input) {
    return { proto, host, port, path };
  }

  let rest = String(input);
  const schemeMatch = rest.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):\/\/(.*)$/);
  if (schemeMatch) {
    const candidate = schemeMatch[1].toLowerCase();
    proto = Object.prototype.hasOwnProperty.call(protos, candidate)
      ? candidate
      : defaultProto;
    rest = schemeMatch[2];
    port = null;
  }

  const slashIndex = rest.indexOf("/");
  let hostPort = rest;
  if (slashIndex !== -1) {
    hostPort = rest.slice(0, slashIndex);
    path = rest.slice(slashIndex);
  } else {
    path = "";
  }

  const ipv6Match = hostPort.match(/^\[([a-fA-F0-9:.]+)\]:(\d+)$/);
  const ipv6NoPortMatch = hostPort.match(/^\[([a-fA-F0-9:.]+)\]$/);

  if (ipv6Match) {
    host = `[${ipv6Match[1]}]`;
    port = Number(ipv6Match[2]);
  } else if (ipv6NoPortMatch) {
    host = `[${ipv6NoPortMatch[1]}]`;
    port = null;
  } else {
    const lastColonIndex = hostPort.lastIndexOf(":");
    const firstColonIndex = hostPort.indexOf(":");
    if (lastColonIndex !== -1 && firstColonIndex === lastColonIndex) {
      host = hostPort.slice(0, lastColonIndex);
      const portPart = hostPort.slice(lastColonIndex + 1);
      if (portPart && !Number.isNaN(Number(portPart))) {
        port = Number(portPart);
      } else {
        port = null;
      }
    } else {
      host = hostPort;
      port = null;
    }
  }

  if (protos[proto] !== 0 && port === null) {
    port = protos[proto];
  } else if (protos[proto] === 0) {
    port = null;
  }

  return { proto, host, port, path };
}

export function buildGuiUrl({ proto, host, port, path }, protos) {
  let url = `${proto}://${host}`;
  if (protos[proto] !== 0) {
    const resolvedPort = port !== null && port !== "" && !Number.isNaN(Number(port))
      ? Number(port)
      : protos[proto];
    url += `:${resolvedPort}`;
  }
  if (PATH_PROTOS.has(proto) && path) {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    url += cleanPath;
  }
  return url;
}

export function renderUrlListInput({
  urls,
  protos,
  defaultUrl = "tcp://0.0.0.0:11010",
  addLabel = "添加",
  placeholder = "0.0.0.0",
  renderToml,
  rerender
}) {
  const wrap = document.createElement("div");
  wrap.className = "url-list-block";

  urls.forEach((rawUrl, index) => {
    const parsed = parseGuiUrl(rawUrl, protos);
    const hasPort = protos[parsed.proto] !== 0;
    const hasPath = PATH_PROTOS.has(parsed.proto);

    const row = document.createElement("div");
    row.className = "url-input-row";

    const group = document.createElement("div");
    group.className = "gui-input-group url-input-group";

    const protoSelect = createCustomSelect({
      options: Object.keys(protos).map((protoKey) => ({
        value: protoKey,
        label: `${protoKey}://`
      })),
      value: parsed.proto,
      className: "url-proto-select",
      ariaLabel: "协议",
      onChange: (newProto) => {
        const oldProto = parsed.proto;
        parsed.proto = newProto;
        if (protos[newProto] === 0) {
          parsed.port = null;
        } else if (parsed.port === null || parsed.port === protos[oldProto]) {
          parsed.port = protos[newProto];
        }
        if (!PATH_PROTOS.has(newProto)) {
          parsed.path = "";
        }
        urls[index] = buildGuiUrl(parsed, protos);
        rerender();
      }
    });

    const hostInput = document.createElement("input");
    hostInput.type = "text";
    hostInput.className = "url-host-input";
    hostInput.placeholder = placeholder;
    hostInput.value = parsed.host;

    group.append(protoSelect, hostInput);

    let portInput = null;
    if (hasPort) {
      const colonAddon = document.createElement("span");
      colonAddon.className = "gui-input-addon";
      colonAddon.textContent = ":";

      portInput = document.createElement("input");
      portInput.type = "number";
      portInput.className = "url-port-input";
      portInput.min = "1";
      portInput.max = "65535";
      portInput.step = "1";
      portInput.placeholder = String(protos[parsed.proto]);
      portInput.value = parsed.port !== null ? String(parsed.port) : "";

      group.append(colonAddon, portInput);
    }

    let pathInput = null;
    if (hasPath) {
      pathInput = document.createElement("input");
      pathInput.type = "text";
      pathInput.className = "url-path-input";
      pathInput.placeholder = "/mypath";
      pathInput.value = parsed.path;
      group.appendChild(pathInput);
    }

    const syncRowUrl = () => {
      urls[index] = buildGuiUrl(parsed, protos);
      renderToml();
    };

    hostInput.addEventListener("input", () => {
      const rawHost = hostInput.value.trim();
      if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(rawHost)) {
        const reparsed = parseGuiUrl(rawHost, protos);
        Object.assign(parsed, reparsed);
        urls[index] = buildGuiUrl(parsed, protos);
        rerender();
        return;
      }
      parsed.host = hostInput.value;
      syncRowUrl();
    });

    if (portInput) {
      portInput.addEventListener("input", () => {
        const val = portInput.value.trim();
        parsed.port = val === "" ? protos[parsed.proto] : Number(val);
        syncRowUrl();
      });
    }

    if (pathInput) {
      pathInput.addEventListener("input", () => {
        parsed.path = pathInput.value;
        syncRowUrl();
      });
    }

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "mini-btn danger-btn url-remove-btn";
    removeBtn.textContent = "删除";
    removeBtn.addEventListener("click", () => {
      urls.splice(index, 1);
      rerender();
    });

    row.append(group, removeBtn);
    wrap.appendChild(row);
  });

  const addBtn = document.createElement("button");
  addBtn.type = "button";
  addBtn.className = "ghost-btn url-add-btn";
  addBtn.textContent = `+ ${addLabel}`;
  addBtn.addEventListener("click", () => {
    urls.push(defaultUrl);
    rerender();
  });

  wrap.appendChild(addBtn);
  return wrap;
}

export function renderVpnPortalSection({ state, renderToml, rerender }) {
  const wrap = document.createElement("div");
  wrap.className = "field full vpn-portal-block";

  const isEnabled = Boolean(
    state.vpn_portal_config && state.vpn_portal_config.enabled !== false
  );

  const checkRow = document.createElement("label");
  checkRow.className = "gui-check-label vpn-enable-label";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = isEnabled;
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      if (!state.vpn_portal_config) {
        state.vpn_portal_config = createVpnPortalConfig();
      } else {
        state.vpn_portal_config.enabled = true;
        if (!state.vpn_portal_config.wireguard_private_key) {
          state.vpn_portal_config.wireguard_private_key =
            createVpnPortalConfig().wireguard_private_key;
        }
      }
    } else if (state.vpn_portal_config) {
      if ((state.vpn_portal_config.clients || []).length === 0) {
        state.vpn_portal_config = null;
      } else {
        state.vpn_portal_config.enabled = false;
      }
    }
    rerender();
  });

  const titleSpan = document.createElement("span");
  titleSpan.className = "field-title";
  titleSpan.textContent = "启用 WireGuard";

  const keySpan = document.createElement("span");
  keySpan.className = "field-key inline-key";
  keySpan.textContent = "[vpn_portal_config]";

  checkRow.append(checkbox, titleSpan, keySpan);
  wrap.appendChild(checkRow);

  const helpP = document.createElement("p");
  helpP.className = "gui-help-text";
  helpP.textContent =
    "点击生成客户端配置并导出 WireGuard 配置文件。在下方添加客户端名称和虚拟 IPv4 地址（例如 10.14.14.2/24）。";
  wrap.appendChild(helpP);

  if (isEnabled && state.vpn_portal_config) {
    const portal = state.vpn_portal_config;

    const advDetails = document.createElement("details");
    advDetails.className = "vpn-adv-details";
    advDetails.open = true;

    const advSummary = document.createElement("summary");
    advSummary.textContent = "高级设置";
    advDetails.appendChild(advSummary);

    const advBody = document.createElement("div");
    advBody.className = "sub-grid vpn-adv-body";

    const listenField = document.createElement("div");
    listenField.className = "field";
    listenField.appendChild(
      createFieldHeader("WireGuard 监听地址", "vpn_portal_config.wireguard_listen")
    );
    const listenInput = document.createElement("input");
    listenInput.type = "text";
    listenInput.placeholder = "例如：0.0.0.0:22022";
    listenInput.value = portal.wireguard_listen || "";
    listenInput.addEventListener("input", () => {
      portal.wireguard_listen = listenInput.value;
      renderToml();
    });
    listenField.appendChild(listenInput);

    const keyField = document.createElement("div");
    keyField.className = "field";
    keyField.appendChild(
      createFieldHeader("WireGuard 私钥 (Base64)", "vpn_portal_config.wireguard_private_key")
    );
    const keyRow = document.createElement("div");
    keyRow.className = "chips-input-row";
    const keyInput = document.createElement("input");
    keyInput.type = "text";
    keyInput.placeholder = "自动生成 32 字节 X25519 私钥";
    keyInput.value = portal.wireguard_private_key || "";
    keyInput.addEventListener("input", () => {
      portal.wireguard_private_key = keyInput.value;
      renderToml();
    });
    const regenBtn = document.createElement("button");
    regenBtn.type = "button";
    regenBtn.className = "mini-btn";
    regenBtn.textContent = "重新生成";
    regenBtn.addEventListener("click", () => {
      portal.wireguard_private_key = createVpnPortalConfig().wireguard_private_key;
      keyInput.value = portal.wireguard_private_key;
      renderToml();
    });
    keyRow.append(keyInput, regenBtn);
    keyField.appendChild(keyRow);

    advBody.append(listenField, keyField);
    advDetails.appendChild(advBody);
    wrap.appendChild(advDetails);

    const clientsHead = document.createElement("div");
    clientsHead.className = "dynamic-card-head vpn-clients-head";
    const clientsLabel = document.createElement("span");
    clientsLabel.className = "field-title";
    clientsLabel.textContent = "WireGuard 客户端 ([[vpn_portal_config.clients]])";

    const addClientBtn = document.createElement("button");
    addClientBtn.type = "button";
    addClientBtn.className = "mini-btn";
    addClientBtn.textContent = "+ 添加客户端";
    addClientBtn.disabled = (portal.clients || []).length >= 64;
    addClientBtn.addEventListener("click", () => {
      portal.clients = portal.clients || [];
      portal.clients.push({
        name: `device-${crypto.randomUUID().slice(0, 8)}`,
        virtual_ip: "",
        groups: []
      });
      rerender();
    });

    clientsHead.append(clientsLabel, addClientBtn);
    wrap.appendChild(clientsHead);

    if (!portal.clients || portal.clients.length === 0) {
      const emptyNote = document.createElement("div");
      emptyNote.className = "gui-empty-hint";
      emptyNote.textContent = "未配置 WireGuard 客户端";
      wrap.appendChild(emptyNote);
    } else {
      const clientList = document.createElement("div");
      clientList.className = "card-block";

      portal.clients.forEach((client, idx) => {
        const card = document.createElement("div");
        card.className = "dynamic-card";

        const head = document.createElement("div");
        head.className = "dynamic-card-head";
        const title = document.createElement("strong");
        title.textContent = `客户端 #${idx + 1}`;
        const delBtn = document.createElement("button");
        delBtn.type = "button";
        delBtn.className = "mini-btn danger-btn";
        delBtn.textContent = "移除客户端";
        delBtn.addEventListener("click", () => {
          portal.clients.splice(idx, 1);
          rerender();
        });
        head.append(title, delBtn);

        const grid = document.createElement("div");
        grid.className = "sub-grid";

        const nameField = document.createElement("div");
        nameField.className = "field";
        nameField.appendChild(createFieldHeader("客户端名称", "name"));
        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.value = client.name || "";
        nameInput.addEventListener("input", () => {
          client.name = nameInput.value;
          renderToml();
        });
        nameField.appendChild(nameInput);

        const ipField = document.createElement("div");
        ipField.className = "field";
        ipField.appendChild(createFieldHeader("虚拟 IPv4", "virtual_ip"));
        const ipInput = document.createElement("input");
        ipInput.type = "text";
        ipInput.placeholder = "例如：10.14.14.2/24";
        ipInput.value = client.virtual_ip || "";
        ipInput.addEventListener("input", () => {
          client.virtual_ip = ipInput.value;
          renderToml();
        });
        ipField.appendChild(ipInput);

        const groupsField = document.createElement("div");
        groupsField.className = "field full";
        groupsField.appendChild(createFieldHeader("访问控制组", "groups"));
        client.groups = Array.isArray(client.groups) ? client.groups : [];
        groupsField.appendChild(
          createChipsInput({
            values: client.groups,
            placeholder: "选择或输入访问控制组名称后按回车添加",
            onChange: () => renderToml()
          })
        );

        grid.append(nameField, ipField, groupsField);
        card.append(head, grid);
        clientList.appendChild(card);
      });

      wrap.appendChild(clientList);
    }
  }

  return wrap;
}

export function renderPortForwardsPanel({ state, renderToml, rerender }) {
  const wrap = document.createElement("div");
  wrap.className = "card-block";

  const helpText = document.createElement("p");
  helpText.className = "gui-help-text";
  helpText.textContent =
    "将本地端口转发到虚拟网络中的远程端口。例如：udp://0.0.0.0:12345/10.126.126.1:23456 表示将本地UDP 12345端口转发到虚拟网络中10.126.126.1的23456端口。支持同时配置多项。";
  wrap.appendChild(helpText);

  state.port_forwards = Array.isArray(state.port_forwards) ? state.port_forwards : [];

  state.port_forwards.forEach((row, index) => {
    const itemCard = document.createElement("div");
    itemCard.className = "port-forward-row";

    const protoGroup = document.createElement("div");
    protoGroup.className = "seg-btn-group";
    PORT_FORWARD_PROTO_OPTIONS.forEach((protoOpt) => {
      const segBtn = document.createElement("button");
      segBtn.type = "button";
      segBtn.className = `seg-btn ${(row.proto || "tcp") === protoOpt ? "is-active" : ""}`;
      segBtn.textContent = protoOpt.toUpperCase();
      segBtn.addEventListener("click", () => {
        row.proto = protoOpt;
        rerender();
      });
      protoGroup.appendChild(segBtn);
    });

    const bindGroup = document.createElement("div");
    bindGroup.className = "gui-input-group pf-addr-group";
    const bindIpInput = document.createElement("input");
    bindIpInput.type = "text";
    bindIpInput.placeholder = "绑定地址，如：0.0.0.0";
    bindIpInput.value = row.bind_ip || "";
    bindIpInput.addEventListener("input", () => {
      row.bind_ip = bindIpInput.value;
      renderToml();
    });

    const bindColon = document.createElement("span");
    bindColon.className = "gui-input-addon";
    bindColon.textContent = ":";

    const bindPortInput = document.createElement("input");
    bindPortInput.type = "number";
    bindPortInput.className = "pf-port-input";
    bindPortInput.min = "1";
    bindPortInput.max = "65535";
    bindPortInput.step = "1";
    bindPortInput.value = String(row.bind_port ?? 65535);
    bindPortInput.addEventListener("input", () => {
      const n = Number(bindPortInput.value);
      row.bind_port = Number.isFinite(n) ? Math.min(65535, Math.max(1, n)) : 65535;
      renderToml();
    });
    bindGroup.append(bindIpInput, bindColon, bindPortInput);

    const arrow = document.createElement("span");
    arrow.className = "pf-arrow";
    arrow.textContent = "→";

    const dstGroup = document.createElement("div");
    dstGroup.className = "gui-input-group pf-addr-group";
    const dstIpInput = document.createElement("input");
    dstIpInput.type = "text";
    dstIpInput.placeholder = "目标地址，如：10.126.126.1";
    dstIpInput.value = row.dst_ip || "";
    dstIpInput.addEventListener("input", () => {
      row.dst_ip = dstIpInput.value;
      renderToml();
    });

    const dstColon = document.createElement("span");
    dstColon.className = "gui-input-addon";
    dstColon.textContent = ":";

    const dstPortInput = document.createElement("input");
    dstPortInput.type = "number";
    dstPortInput.className = "pf-port-input";
    dstPortInput.min = "1";
    dstPortInput.max = "65535";
    dstPortInput.step = "1";
    dstPortInput.value = String(row.dst_port ?? 65535);
    dstPortInput.addEventListener("input", () => {
      const n = Number(dstPortInput.value);
      row.dst_port = Number.isFinite(n) ? Math.min(65535, Math.max(1, n)) : 65535;
      renderToml();
    });
    dstGroup.append(dstIpInput, dstColon, dstPortInput);

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "mini-btn danger-btn";
    delBtn.textContent = "删除";
    delBtn.addEventListener("click", () => {
      state.port_forwards.splice(index, 1);
      rerender();
    });

    itemCard.append(protoGroup, bindGroup, arrow, dstGroup, delBtn);
    wrap.appendChild(itemCard);
  });

  const addBtn = document.createElement("button");
  addBtn.type = "button";
  addBtn.className = "ghost-btn";
  addBtn.textContent = "+ 添加";
  addBtn.addEventListener("click", () => {
    state.port_forwards.push({
      proto: "tcp",
      bind_ip: "",
      bind_port: 65535,
      dst_ip: "",
      dst_port: 65535
    });
    rerender();
  });

  wrap.appendChild(addBtn);
  return wrap;
}

export function renderAclPanel({ state, renderToml, rerender }) {
  const wrap = document.createElement("div");
  wrap.className = "acl-manager-block";

  if (!state.acl || !state.acl.acl_v1) {
    state.acl = createEmptyAcl();
  }
  const aclV1 = state.acl.acl_v1;
  aclV1.chains = Array.isArray(aclV1.chains) ? aclV1.chains : [];
  aclV1.group = aclV1.group || { declares: [], members: [] };
  aclV1.group.declares = Array.isArray(aclV1.group.declares) ? aclV1.group.declares : [];
  aclV1.group.members = Array.isArray(aclV1.group.members) ? aclV1.group.members : [];

  const chainsToolbar = document.createElement("div");
  chainsToolbar.className = "acl-toolbar";

  const chainsTitle = document.createElement("div");
  chainsTitle.appendChild(
    createFieldHeader("管理规则链", "[[acl.acl_v1.chains]]")
  );

  const chainBtns = document.createElement("div");
  chainBtns.className = "acl-toolbar-actions";

  ACL_CHAIN_TYPES.forEach((chainMeta) => {
    const exists = aclV1.chains.some((c) => Number(c.chain_type) === chainMeta.value);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "mini-btn";
    btn.disabled = exists;
    btn.textContent = `+ ${chainMeta.label.split(" ")[0]}`;
    btn.addEventListener("click", () => {
      aclV1.chains.push({
        name: chainMeta.defaultName,
        chain_type: chainMeta.value,
        description: "",
        default_action: chainMeta.defaultAction,
        enabled: true,
        rules: []
      });
      rerender();
    });
    chainBtns.appendChild(btn);
  });

  chainsToolbar.append(chainsTitle, chainBtns);
  wrap.appendChild(chainsToolbar);

  if (aclV1.chains.length === 0) {
    const emptyBox = document.createElement("div");
    emptyBox.className = "gui-empty-hint";
    emptyBox.textContent = "未配置访问控制规则链。点击上方「+ 入站 / + 出站 / + 转发」添加规则链。";
    wrap.appendChild(emptyBox);
  } else {
    const chainsContainer = document.createElement("div");
    chainsContainer.className = "card-block";

    aclV1.chains.forEach((chain, chainIndex) => {
      chain.rules = Array.isArray(chain.rules) ? chain.rules : [];
      const chainMeta =
        ACL_CHAIN_TYPES.find((t) => t.value === Number(chain.chain_type)) ||
        ACL_CHAIN_TYPES[0];

      const chainCard = document.createElement("div");
      chainCard.className = "dynamic-card acl-chain-card";

      const chainHead = document.createElement("div");
      chainHead.className = "dynamic-card-head acl-chain-head";

      const badgeWrap = document.createElement("div");
      badgeWrap.className = "acl-chain-title-wrap";
      const badge = document.createElement("span");
      badge.className = `acl-badge acl-badge-${chainMeta.key}`;
      badge.textContent = chainMeta.label;
      badgeWrap.appendChild(badge);

      const headActions = document.createElement("div");
      headActions.className = "acl-chain-actions";

      const enableSwitch = createSwitchControl({
        checked: chain.enabled !== false,
        labelText: "启用",
        onChange: (val) => {
          chain.enabled = val;
          renderToml();
        }
      });

      const addRuleBtn = document.createElement("button");
      addRuleBtn.type = "button";
      addRuleBtn.className = "mini-btn";
      addRuleBtn.textContent = "+ 添加规则";
      addRuleBtn.addEventListener("click", () => {
        chain.rules.push({
          name: `rule_${chain.rules.length + 1}`,
          description: "",
          priority: 100,
          enabled: true,
          protocol: 5,
          ports: [],
          source_ips: [],
          destination_ips: [],
          source_ports: [],
          action: 1,
          rate_limit: 0,
          burst_limit: 0,
          stateful: true,
          source_groups: [],
          destination_groups: []
        });
        rerender();
      });

      const delChainBtn = document.createElement("button");
      delChainBtn.type = "button";
      delChainBtn.className = "mini-btn danger-btn";
      delChainBtn.textContent = "删除链";
      delChainBtn.addEventListener("click", () => {
        aclV1.chains.splice(chainIndex, 1);
        rerender();
      });

      headActions.append(enableSwitch, addRuleBtn, delChainBtn);
      chainHead.append(badgeWrap, headActions);
      chainCard.appendChild(chainHead);

      const chainMetaGrid = document.createElement("div");
      chainMetaGrid.className = "field-grid acl-chain-meta-grid";

      const nameField = document.createElement("div");
      nameField.className = "field";
      nameField.appendChild(createFieldHeader("链名称", "name"));
      const nameInput = document.createElement("input");
      nameInput.type = "text";
      nameInput.value = chain.name || "";
      nameInput.addEventListener("input", () => {
        chain.name = nameInput.value;
        renderToml();
      });
      nameField.appendChild(nameInput);

      const defaultActionField = document.createElement("div");
      defaultActionField.className = "field";
      defaultActionField.appendChild(createFieldHeader("默认策略", "default_action"));
      const actionSelect = createCustomSelect({
        options: ACL_ACTIONS.map((act) => ({
          value: String(act.value),
          label: act.label
        })),
        value: String(chain.default_action || 2),
        ariaLabel: "默认策略",
        onChange: (val) => {
          chain.default_action = Number(val);
          renderToml();
        }
      });
      defaultActionField.appendChild(actionSelect);

      const descField = document.createElement("div");
      descField.className = "field full";
      descField.appendChild(createFieldHeader("链描述", "description"));
      const descInput = document.createElement("input");
      descInput.type = "text";
      descInput.placeholder = "可选描述";
      descInput.value = chain.description || "";
      descInput.addEventListener("input", () => {
        chain.description = descInput.value;
        renderToml();
      });
      descField.appendChild(descInput);

      chainMetaGrid.append(nameField, defaultActionField, descField);
      chainCard.appendChild(chainMetaGrid);

      if (chain.rules.length === 0) {
        const noRules = document.createElement("div");
        noRules.className = "gui-empty-hint";
        noRules.textContent = "该链中没有定义规则。流量将遵循默认策略。";
        chainCard.appendChild(noRules);
      } else {
        const rulesList = document.createElement("div");
        rulesList.className = "acl-rules-list";

        chain.rules.forEach((rule, ruleIndex) => {
          rule.ports = Array.isArray(rule.ports) ? rule.ports : [];
          rule.source_ips = Array.isArray(rule.source_ips) ? rule.source_ips : [];
          rule.destination_ips = Array.isArray(rule.destination_ips) ? rule.destination_ips : [];
          rule.source_ports = Array.isArray(rule.source_ports) ? rule.source_ports : [];
          rule.source_groups = Array.isArray(rule.source_groups) ? rule.source_groups : [];
          rule.destination_groups = Array.isArray(rule.destination_groups)
            ? rule.destination_groups
            : [];

          const ruleDetails = document.createElement("details");
          ruleDetails.className = "acl-rule-card";
          ruleDetails.open = true;

          const ruleSummary = document.createElement("summary");
          ruleSummary.className = "acl-rule-summary";

          const summaryLeft = document.createElement("div");
          summaryLeft.className = "acl-rule-summary-left";
          const ruleTitle = document.createElement("strong");
          ruleTitle.textContent = rule.name || `规则 #${ruleIndex + 1}`;
          const prioBadge = document.createElement("span");
          prioBadge.className = "acl-mini-tag";
          prioBadge.textContent = `优先级: ${rule.priority ?? 100}`;
          const actBadge = document.createElement("span");
          actBadge.className = `acl-mini-tag ${Number(rule.action) === 1 ? "is-allow" : "is-drop"}`;
          actBadge.textContent = Number(rule.action) === 1 ? "允许" : "丢弃";
          summaryLeft.append(ruleTitle, prioBadge, actBadge);

          const summaryRight = document.createElement("div");
          summaryRight.className = "acl-rule-summary-right";
          const delRuleBtn = document.createElement("button");
          delRuleBtn.type = "button";
          delRuleBtn.className = "mini-btn danger-btn";
          delRuleBtn.textContent = "删除规则";
          delRuleBtn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            chain.rules.splice(ruleIndex, 1);
            rerender();
          });
          summaryRight.appendChild(delRuleBtn);

          ruleSummary.append(summaryLeft, summaryRight);
          ruleDetails.appendChild(ruleSummary);

          const ruleBody = document.createElement("div");
          ruleBody.className = "field-grid acl-rule-body";

          const rNameField = document.createElement("div");
          rNameField.className = "field";
          rNameField.appendChild(createFieldHeader("名称", "name"));
          const rNameInput = document.createElement("input");
          rNameInput.type = "text";
          rNameInput.value = rule.name || "";
          rNameInput.addEventListener("input", () => {
            rule.name = rNameInput.value;
            ruleTitle.textContent = rule.name || `规则 #${ruleIndex + 1}`;
            renderToml();
          });
          rNameField.appendChild(rNameInput);

          const rPrioField = document.createElement("div");
          rPrioField.className = "field";
          rPrioField.appendChild(createFieldHeader("优先级 (数字越大越优先)", "priority"));
          const rPrioInput = document.createElement("input");
          rPrioInput.type = "number";
          rPrioInput.step = "1";
          rPrioInput.value = String(rule.priority ?? 100);
          rPrioInput.addEventListener("input", () => {
            const p = Number(rPrioInput.value);
            rule.priority = Number.isFinite(p) ? p : 100;
            prioBadge.textContent = `优先级: ${rule.priority}`;
            renderToml();
          });
          rPrioField.appendChild(rPrioInput);

          const rActionField = document.createElement("div");
          rActionField.className = "field";
          rActionField.appendChild(createFieldHeader("操作", "action"));
          const rActionSelect = createCustomSelect({
            options: ACL_ACTIONS.map((act) => ({
              value: String(act.value),
              label: act.label
            })),
            value: String(rule.action || 1),
            ariaLabel: "操作",
            onChange: (val) => {
              rule.action = Number(val);
              actBadge.className = `acl-mini-tag ${rule.action === 1 ? "is-allow" : "is-drop"}`;
              actBadge.textContent = rule.action === 1 ? "允许" : "丢弃";
              renderToml();
            }
          });
          rActionField.appendChild(rActionSelect);

          const rProtoField = document.createElement("div");
          rProtoField.className = "field";
          rProtoField.appendChild(createFieldHeader("协议", "protocol"));
          const rProtoSelect = createCustomSelect({
            options: ACL_PROTOCOLS.map((p) => ({
              value: String(p.value),
              label: p.label
            })),
            value: String(rule.protocol || 5),
            ariaLabel: "协议",
            onChange: (val) => {
              rule.protocol = Number(val);
              if (![1, 2, 5].includes(rule.protocol)) {
                rule.source_ports = [];
                rule.ports = [];
              }
              rerender();
            }
          });
          rProtoField.appendChild(rProtoSelect);

          const rDescField = document.createElement("div");
          rDescField.className = "field full";
          rDescField.appendChild(createFieldHeader("描述", "description"));
          const rDescInput = document.createElement("input");
          rDescInput.type = "text";
          rDescInput.placeholder = "规则目的的可选描述";
          rDescInput.value = rule.description || "";
          rDescInput.addEventListener("input", () => {
            rule.description = rDescInput.value;
            renderToml();
          });
          rDescField.appendChild(rDescInput);

          const srcIpField = document.createElement("div");
          srcIpField.className = "field";
          srcIpField.appendChild(createFieldHeader("源 IP", "source_ips"));
          srcIpField.appendChild(
            createChipsInput({
              values: rule.source_ips,
              placeholder: "例如 10.0.0.0/24（留空表示任意）",
              suggestCidr: true,
              onChange: () => renderToml()
            })
          );

          const dstIpField = document.createElement("div");
          dstIpField.className = "field";
          dstIpField.appendChild(createFieldHeader("目的 IP", "destination_ips"));
          dstIpField.appendChild(
            createChipsInput({
              values: rule.destination_ips,
              placeholder: "例如 10.0.0.1/32（留空表示任意）",
              suggestCidr: true,
              onChange: () => renderToml()
            })
          );

          ruleBody.append(
            rNameField,
            rPrioField,
            rActionField,
            rProtoField,
            rDescField,
            srcIpField,
            dstIpField
          );

          const supportsPorts = [1, 2, 5].includes(Number(rule.protocol || 5));
          if (supportsPorts) {
            const srcPortField = document.createElement("div");
            srcPortField.className = "field";
            srcPortField.appendChild(createFieldHeader("源端口", "source_ports"));
            srcPortField.appendChild(
              createChipsInput({
                values: rule.source_ports,
                placeholder: "例如 80 或 8000-8080",
                onChange: () => renderToml()
              })
            );

            const dstPortField = document.createElement("div");
            dstPortField.className = "field";
            dstPortField.appendChild(createFieldHeader("目的端口", "ports"));
            dstPortField.appendChild(
              createChipsInput({
                values: rule.ports,
                placeholder: "例如 443 或 1000-2000",
                onChange: () => renderToml()
              })
            );

            ruleBody.append(srcPortField, dstPortField);
          }

          const srcGroupField = document.createElement("div");
          srcGroupField.className = "field";
          srcGroupField.appendChild(createFieldHeader("源组", "source_groups"));
          srcGroupField.appendChild(
            createChipsInput({
              values: rule.source_groups,
              placeholder: "输入源用户组名称",
              onChange: () => renderToml()
            })
          );

          const dstGroupField = document.createElement("div");
          dstGroupField.className = "field";
          dstGroupField.appendChild(createFieldHeader("目的组", "destination_groups"));
          dstGroupField.appendChild(
            createChipsInput({
              values: rule.destination_groups,
              placeholder: "输入目的用户组名称",
              onChange: () => renderToml()
            })
          );

          const rateField = document.createElement("div");
          rateField.className = "field";
          rateField.appendChild(createFieldHeader("速率限制 (包/秒)", "rate_limit"));
          const rateInput = document.createElement("input");
          rateInput.type = "number";
          rateInput.min = "0";
          rateInput.step = "1";
          rateInput.placeholder = "0 表示无限制";
          rateInput.value = String(rule.rate_limit ?? 0);

          const burstField = document.createElement("div");
          burstField.className = "field";
          burstField.appendChild(createFieldHeader("突发限制", "burst_limit"));
          const burstInput = document.createElement("input");
          burstInput.type = "number";
          burstInput.min = "0";
          burstInput.step = "1";
          burstInput.placeholder = "0 表示默认";
          burstInput.value = String(rule.burst_limit ?? 0);
          burstInput.disabled = !(Number(rule.rate_limit) > 0);

          rateInput.addEventListener("input", () => {
            const val = Math.max(0, Number(rateInput.value) || 0);
            rule.rate_limit = val;
            burstInput.disabled = val <= 0;
            renderToml();
          });
          burstInput.addEventListener("input", () => {
            rule.burst_limit = Math.max(0, Number(burstInput.value) || 0);
            renderToml();
          });

          rateField.appendChild(rateInput);
          burstField.appendChild(burstInput);

          const togglesField = document.createElement("div");
          togglesField.className = "field full acl-rule-toggles";

          const enabledRuleSwitch = createSwitchControl({
            checked: rule.enabled !== false,
            labelText: "启用该规则 (enabled)",
            onChange: (val) => {
              rule.enabled = val;
              renderToml();
            }
          });

          const statefulSwitch = createSwitchControl({
            checked: Boolean(rule.stateful),
            labelText: "有状态连接跟踪 (stateful：自动允许返回流量)",
            onChange: (val) => {
              rule.stateful = val;
              renderToml();
            }
          });

          togglesField.append(enabledRuleSwitch, statefulSwitch);

          ruleBody.append(
            srcGroupField,
            dstGroupField,
            rateField,
            burstField,
            togglesField
          );

          ruleDetails.appendChild(ruleBody);
          rulesList.appendChild(ruleDetails);
        });

        chainCard.appendChild(rulesList);
      }

      chainsContainer.appendChild(chainCard);
    });

    wrap.appendChild(chainsContainer);
  }

  const groupSection = document.createElement("div");
  groupSection.className = "dynamic-card acl-group-section";

  const groupHead = document.createElement("div");
  groupHead.className = "dynamic-card-head";
  groupHead.appendChild(
    createFieldHeader("组管理 (用户组声明与成员身份)", "[acl.acl_v1.group]")
  );

  const addDeclareBtn = document.createElement("button");
  addDeclareBtn.type = "button";
  addDeclareBtn.className = "mini-btn";
  addDeclareBtn.textContent = "+ 添加声明组";
  addDeclareBtn.addEventListener("click", () => {
    aclV1.group.declares.push({
      group_name: "",
      group_secret: ""
    });
    rerender();
  });
  groupHead.appendChild(addDeclareBtn);
  groupSection.appendChild(groupHead);

  const declareDesc = document.createElement("p");
  declareDesc.className = "gui-help-text";
  declareDesc.textContent =
    "声明的组（本节点作为验证者）：定义此节点拥有的组，其他节点可以使用组密钥加入这些组。";
  groupSection.appendChild(declareDesc);

  if (aclV1.group.declares.length === 0) {
    const emptyDeclares = document.createElement("div");
    emptyDeclares.className = "gui-empty-hint";
    emptyDeclares.textContent = "未声明任何组";
    groupSection.appendChild(emptyDeclares);
  } else {
    const declareList = document.createElement("div");
    declareList.className = "card-block";

    aclV1.group.declares.forEach((decl, declIndex) => {
      const declRow = document.createElement("div");
      declRow.className = "acl-declare-row";

      const gNameField = document.createElement("div");
      gNameField.className = "field";
      gNameField.appendChild(createFieldHeader("组名", "group_name"));
      const gNameInput = document.createElement("input");
      gNameInput.type = "text";
      gNameInput.placeholder = "例如：admin";
      gNameInput.value = decl.group_name || "";
      gNameInput.addEventListener("input", () => {
        decl.group_name = gNameInput.value;
        renderToml();
      });
      gNameField.appendChild(gNameInput);

      const gSecretField = document.createElement("div");
      gSecretField.className = "field";
      gSecretField.appendChild(createFieldHeader("组密钥", "group_secret"));
      const { wrap: pwWrap } = createPasswordInput({
        value: decl.group_secret || "",
        placeholder: "最小 6 个字符",
        onInput: (val) => {
          decl.group_secret = val;
          renderToml();
        }
      });
      gSecretField.appendChild(pwWrap);

      const delDeclBtn = document.createElement("button");
      delDeclBtn.type = "button";
      delDeclBtn.className = "mini-btn danger-btn acl-declare-del";
      delDeclBtn.textContent = "移除";
      delDeclBtn.addEventListener("click", () => {
        aclV1.group.declares.splice(declIndex, 1);
        rerender();
      });

      declRow.append(gNameField, gSecretField, delDeclBtn);
      declareList.appendChild(declRow);
    });

    groupSection.appendChild(declareList);
  }

  const memberField = document.createElement("div");
  memberField.className = "field full acl-members-field";
  memberField.appendChild(
    createFieldHeader(
      "加入的组 (本节点作为成员)",
      "acl.acl_v1.group.members",
      "指定此节点属于哪些组。"
    )
  );
  memberField.appendChild(
    createChipsInput({
      values: aclV1.group.members,
      placeholder: "输入要加入的组名后按回车添加",
      onChange: () => renderToml()
    })
  );
  groupSection.appendChild(memberField);

  wrap.appendChild(groupSection);
  return wrap;
}
