import {
  BOOL_FLAGS,
  LISTENER_PROTOS,
  PROTOS,
   generateClampedX25519PrivateKeyBase64
} from "../data/config-data.js";
import {
  renderAclPanel,
  renderPortForwardsPanel,
  renderUrlListInput,
  renderVpnPortalSection
} from "./dynamic-list-renderers.js";
import {
  createChipsInput,
  createFieldHeader,
  createHelpBadge,
  createPasswordInput,
  createSwitchControl,
  createToggleButton
} from "./form-dom-utils.js";

const UINT64_MAX = (1n << 64n) - 1n;

function parseUint64Limit(raw) {
  const trimmed = String(raw ?? "").trim();
  if (!trimmed) return null;
  if (!/^\d+$/.test(trimmed)) return undefined;
  const n = BigInt(trimmed);
  if (n === 0n) return null;
  if (n > UINT64_MAX) return undefined;
  return n <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(n) : n.toString();
}

export function renderBasicSettingsPanel({ state, renderToml, rerender }) {
  const container = document.createElement("div");
  container.className = "gui-panel-stack";

  // 1. Virtual IPv4 + DHCP
  const ipv4Field = document.createElement("div");
  ipv4Field.className = "field full";

  const ipv4HeadRow = document.createElement("div");
  ipv4HeadRow.className = "gui-ipv4-head";

  const ipv4TitleWrap = createFieldHeader("虚拟IPv4地址", "ipv4 / dhcp");

  const dhcpLabel = document.createElement("label");
  dhcpLabel.className = "gui-check-label dhcp-check-label";
  const dhcpCheck = document.createElement("input");
  dhcpCheck.type = "checkbox";
  dhcpCheck.checked = Boolean(state.dhcp);
  const dhcpText = document.createElement("span");
  dhcpText.textContent = "DHCP";
  dhcpLabel.append(dhcpCheck, dhcpText);

  ipv4HeadRow.append(ipv4TitleWrap, dhcpLabel);
  ipv4Field.appendChild(ipv4HeadRow);

  const ipv4InputGroup = document.createElement("div");
  ipv4InputGroup.className = `gui-input-group ipv4-cidr-group ${state.dhcp ? "is-disabled" : ""}`.trim();

  const ipv4Input = document.createElement("input");
  ipv4Input.type = "text";
  ipv4Input.className = "ipv4-addr-input";
  ipv4Input.placeholder = "例如：10.126.126.1";
  ipv4Input.value = state.virtual_ipv4 || "";
  ipv4Input.disabled = Boolean(state.dhcp);
  ipv4Input.addEventListener("input", () => {
    state.virtual_ipv4 = ipv4Input.value;
    renderToml();
  });

  const slashAddon = document.createElement("span");
  slashAddon.className = "gui-input-addon";
  slashAddon.textContent = "/";

  const netLenInput = document.createElement("input");
  netLenInput.type = "number";
  netLenInput.className = "ipv4-len-input";
  netLenInput.min = "1";
  netLenInput.max = "32";
  netLenInput.step = "1";
  netLenInput.value = String(state.network_length ?? 24);
  netLenInput.disabled = Boolean(state.dhcp);
  netLenInput.addEventListener("input", () => {
    const val = Number(netLenInput.value);
    state.network_length = Number.isFinite(val)
      ? Math.min(32, Math.max(1, val))
      : 24;
    renderToml();
  });

  dhcpCheck.addEventListener("change", () => {
    state.dhcp = dhcpCheck.checked;
    ipv4Input.disabled = state.dhcp;
    netLenInput.disabled = state.dhcp;
    ipv4InputGroup.classList.toggle("is-disabled", Boolean(state.dhcp));
    renderToml();
  });

  ipv4InputGroup.append(ipv4Input, slashAddon, netLenInput);
  ipv4Field.appendChild(ipv4InputGroup);
  container.appendChild(ipv4Field);

  // 2. Network Name / Secure Mode & Network Secret / Credential
  const identityGrid = document.createElement("div");
  identityGrid.className = "field-grid";

  const netNameCol = document.createElement("div");
  netNameCol.className = "field";
  netNameCol.appendChild(
    createFieldHeader("网络名称", "network_identity.network_name")
  );

  const netNameInput = document.createElement("input");
  netNameInput.type = "text";
  netNameInput.value = state.network_name || "";
  netNameInput.placeholder = "easytier";
  netNameInput.addEventListener("input", () => {
    state.network_name = netNameInput.value;
    renderToml();
  });
  netNameCol.appendChild(netNameInput);

  if (state.identity_mode !== "credential") {
    const secureModeEnabled = Boolean(state.secure_mode?.enabled);
    const secureSwitch = createSwitchControl({
      id: "secure_mode_switch",
      checked: secureModeEnabled,
      labelText: "安全模式",
      helpText: "节点间使用 Noise 加密握手与身份认证；对端节点需支持安全模式",
      onChange: (checked) => {
        if (checked) {
          state.secure_mode = {
            enabled: true,
            local_private_key:
              state.secure_mode?.local_private_key ||
              generateClampedX25519PrivateKeyBase64()
          };
        } else {
          state.secure_mode = null;
        }
        renderToml();
      }
    });
    netNameCol.appendChild(secureSwitch);
  }

  const secretCol = document.createElement("div");
  secretCol.className = "field";

  if (state.identity_mode !== "credential") {
    secretCol.appendChild(
      createFieldHeader("网络密码", "network_identity.network_secret")
    );
    const { wrap: pwWrap } = createPasswordInput({
      id: "network_secret_input",
      value: state.network_secret || "",
      placeholder: "留空表示无密码",
      onInput: (val) => {
        state.network_secret = val;
        renderToml();
      }
    });
    secretCol.appendChild(pwWrap);

    const switchToCredBtn = document.createElement("button");
    switchToCredBtn.type = "button";
    switchToCredBtn.className = "gui-link-btn";
    switchToCredBtn.textContent = "我有管理员签发的临时凭证 ›";
    switchToCredBtn.addEventListener("click", () => {
      state.identity_mode = "credential";
      rerender();
    });
    secretCol.appendChild(switchToCredBtn);
  } else {
    secretCol.appendChild(
      createFieldHeader("临时凭证", "secure_mode.local_private_key")
    );
    const isInvalid = !String(state.credential_secret || "").trim();
    const { wrap: credWrap } = createPasswordInput({
      id: "credential_secret_input",
      value: state.credential_secret || "",
      placeholder: "粘贴管理员签发的临时凭证",
      invalid: isInvalid,
      onInput: (val, wrapEl) => {
        state.credential_secret = val;
        wrapEl.classList.toggle("is-invalid", !val.trim());
        renderToml();
      }
    });
    secretCol.appendChild(credWrap);

    const hint1 = document.createElement("small");
    hint1.className = "gui-field-hint";
    hint1.textContent = "粘贴管理员签发的临时凭证";
    secretCol.appendChild(hint1);

    const hint2 = document.createElement("div");
    hint2.className = "gui-field-hint";
    hint2.textContent =
      "使用临时凭证加入网络：连接自动加密，到期自动失效。如果你没有收到凭证，请改用网络密钥。";
    secretCol.appendChild(hint2);

    const switchToSecretBtn = document.createElement("button");
    switchToSecretBtn.type = "button";
    switchToSecretBtn.className = "gui-link-btn";
    switchToSecretBtn.textContent = "‹ 改用网络密钥";
    switchToSecretBtn.addEventListener("click", () => {
      state.credential_secret = "";
      state.identity_mode = "secret";
      rerender();
    });
    secretCol.appendChild(switchToSecretBtn);
  }

  identityGrid.append(netNameCol, secretCol);
  container.appendChild(identityGrid);

  // 3. Initial Nodes (peer_urls)
  const peersField = document.createElement("div");
  peersField.className = "field full";
  peersField.appendChild(
    createFieldHeader(
      "初始节点",
      "[[peer]].uri",
      "EasyTier 不分服务端/客户端。只需填一个已在网内（或可公网/局域网直连）的节点地址，连上后会自动发现其他节点并尝试 P2P 直连；网络的首个节点可留空。"
    )
  );
  state.peer_urls = Array.isArray(state.peer_urls) ? state.peer_urls : [];
  peersField.appendChild(
    renderUrlListInput({
      urls: state.peer_urls,
      protos: PROTOS,
      defaultUrl: "tcp://:11010",
      addLabel: "添加初始节点",
      placeholder: "例如：node.example.com",
      renderToml,
      rerender
    })
  );
  container.appendChild(peersField);

  return container;
}

export function renderAdvancedSettingsPanel({ state, renderToml, rerender }) {
  const container = document.createElement("div");
  container.className = "gui-panel-stack";

  // 1. Boolean Flags Grid (功能开关)
  const flagsField = document.createElement("div");
  flagsField.className = "field full";
  flagsField.appendChild(createFieldHeader("功能开关", "[flags]"));

  const flagsGrid = document.createElement("div");
  flagsGrid.className = "flags-checkbox-grid";

  BOOL_FLAGS.forEach((flag) => {
    const item = document.createElement("div");
    item.className = "flag-check-item";

    const checkId = `flag_${flag.field}`;
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = checkId;
    checkbox.checked =
      typeof state[flag.field] === "boolean"
        ? state[flag.field]
        : flag.defaultValue;

    checkbox.addEventListener("change", () => {
      state[flag.field] = checkbox.checked;
      renderToml();
    });

    const textCol = document.createElement("div");
    textCol.className = "flag-check-text";

    const labelRow = document.createElement("div");
    labelRow.className = "flag-label-row";

    const label = document.createElement("label");
    label.htmlFor = checkId;
    label.textContent = flag.label;
    labelRow.appendChild(label);

    if (flag.help) {
      labelRow.appendChild(createHelpBadge(flag.help));
    }

    const keySub = document.createElement("div");
    keySub.className = "flag-key-tag";
    keySub.textContent = flag.topLevel
      ? flag.tomlKey
      : flag.negate
        ? `flags.${flag.tomlKey} = !${flag.field}`
        : `flags.${flag.tomlKey}`;

    textCol.append(labelRow, keySub);
    item.append(checkbox, textCol);
    flagsGrid.appendChild(item);
  });

  flagsField.appendChild(flagsGrid);
  container.appendChild(flagsField);

  // 2. Hostname
  const hostnameField = document.createElement("div");
  hostnameField.className = "field full";
  hostnameField.appendChild(createFieldHeader("主机名", "hostname"));
  const hostnameInput = document.createElement("input");
  hostnameInput.type = "text";
  hostnameInput.placeholder = "留空默认为主机名";
  hostnameInput.value = state.hostname || "";
  hostnameInput.addEventListener("input", () => {
    state.hostname = hostnameInput.value;
    renderToml();
  });
  hostnameField.appendChild(hostnameInput);
  container.appendChild(hostnameField);

  // 3. Subnet Proxy CIDRs (proxy_cidrs)
  const proxyField = document.createElement("div");
  proxyField.className = "field full";
  proxyField.appendChild(
    createFieldHeader(
      "子网代理CIDR",
      "[[proxy_network]]",
      "支持格式：<real_cidr> 或 <real_cidr>-><mapped_cidr>，例如 10.0.0.0/24 或 10.0.0.0/24->192.168.0.0/24"
    )
  );
  state.proxy_cidrs = Array.isArray(state.proxy_cidrs) ? state.proxy_cidrs : [];
  proxyField.appendChild(
    createChipsInput({
      values: state.proxy_cidrs,
      placeholder: "输入后回车添加，例如 10.0.0.0/24",
      suggestCidr: true,
      onChange: () => renderToml()
    })
  );
  container.appendChild(proxyField);

  // 4. WireGuard VPN Portal
  container.appendChild(
    renderVpnPortalSection({ state, renderToml, rerender })
  );

  // 5. Listener URLs
  const listenersField = document.createElement("div");
  listenersField.className = "field full";
  listenersField.appendChild(createFieldHeader("监听地址", "listeners"));
  state.listener_urls = Array.isArray(state.listener_urls)
    ? state.listener_urls
    : [];
  listenersField.appendChild(
    renderUrlListInput({
      urls: state.listener_urls,
      protos: LISTENER_PROTOS,
      defaultUrl: "tcp://0.0.0.0:11010",
      addLabel: "添加监听地址",
      placeholder: "0.0.0.0",
      renderToml,
      rerender
    })
  );
  container.appendChild(listenersField);

  // 6. TUN Interface Name (dev_name)
  const devNameField = document.createElement("div");
  devNameField.className = "field full";
  devNameField.appendChild(createFieldHeader("TUN接口名称", "flags.dev_name"));
  const devNameInput = document.createElement("input");
  devNameInput.type = "text";
  devNameInput.placeholder =
    "注意：当多个网络同时使用相同的TUN接口名称时，将会在设置TUN的IP时产生冲突，留空以自动生成随机名称";
  devNameInput.value = state.dev_name || "";
  devNameInput.addEventListener("input", () => {
    state.dev_name = devNameInput.value;
    renderToml();
  });
  devNameField.appendChild(devNameInput);
  container.appendChild(devNameField);

  // 7. MTU & Instance Recv BPS Limit
  const mtuRateGrid = document.createElement("div");
  mtuRateGrid.className = "field-grid";

  const mtuField = document.createElement("div");
  mtuField.className = "field";
  mtuField.appendChild(
    createFieldHeader(
      "MTU",
      "flags.mtu",
      "TUN 设备的 MTU 值，默认值为不加密时 1380，加密时 1360。范围 400-1380。"
    )
  );
  const mtuInput = document.createElement("input");
  mtuInput.type = "number";
  mtuInput.min = "400";
  mtuInput.max = "1380";
  mtuInput.step = "1";
  mtuInput.placeholder = "留空为默认值1380";
  mtuInput.value = state.mtu == null || state.mtu === "" ? "" : String(state.mtu);
  mtuInput.addEventListener("input", () => {
    const raw = mtuInput.value.trim();
    if (!raw) {
      state.mtu = null;
    } else {
      const num = Number(raw);
      state.mtu = Number.isFinite(num) && num >= 0 ? Math.trunc(num) : null;
    }
    renderToml();
  });
  mtuField.appendChild(mtuInput);

  const bpsField = document.createElement("div");
  bpsField.className = "field";
  bpsField.appendChild(
    createFieldHeader(
      "实例接收限速",
      "flags.instance_recv_bps_limit",
      "该网络实例接收流量的最大速率（单位：字节/秒），留空或0表示不限速。"
    )
  );
  const bpsInput = document.createElement("input");
  bpsInput.type = "text";
  bpsInput.inputMode = "numeric";
  bpsInput.pattern = "[0-9]*";
  bpsInput.placeholder = "留空表示不限速";
  bpsInput.value =
    state.instance_recv_bps_limit == null ? "" : String(state.instance_recv_bps_limit);
  bpsInput.addEventListener("input", () => {
    const parsed = parseUint64Limit(bpsInput.value);
    if (parsed !== undefined) {
      state.instance_recv_bps_limit = parsed;
      renderToml();
    }
  });
  bpsField.appendChild(bpsInput);

  mtuRateGrid.append(mtuField, bpsField);
  container.appendChild(mtuRateGrid);

  // 8. Relay Network Whitelist
  const whitelistField = document.createElement("div");
  whitelistField.className = "field full";
  whitelistField.appendChild(
    createFieldHeader(
      "网络白名单",
      "flags.relay_network_whitelist",
      "仅转发白名单网络的流量（支持通配符字符串，如：*、def*）"
    )
  );
  whitelistField.appendChild(
    createToggleButton({
      checked: Boolean(state.enable_relay_network_whitelist),
      onChange: (val) => {
        state.enable_relay_network_whitelist = val;
        rerender();
      }
    })
  );
  if (state.enable_relay_network_whitelist) {
    state.relay_network_whitelist = Array.isArray(state.relay_network_whitelist)
      ? state.relay_network_whitelist
      : [];
    whitelistField.appendChild(
      createChipsInput({
        values: state.relay_network_whitelist,
        placeholder: "输入白名单网络名称后按回车添加，例如 def*",
        onChange: () => renderToml()
      })
    );
  }
  container.appendChild(whitelistField);

  // 9. Manual Routes
  const routesField = document.createElement("div");
  routesField.className = "field full";
  routesField.appendChild(
    createFieldHeader(
      "自定义路由",
      "routes",
      "手动分配路由CIDR，将禁用子网代理和wireguard自动生成的路由。"
    )
  );
  routesField.appendChild(
    createToggleButton({
      checked: Boolean(state.enable_manual_routes),
      onChange: (val) => {
        state.enable_manual_routes = val;
        rerender();
      }
    })
  );
  if (state.enable_manual_routes) {
    state.routes = Array.isArray(state.routes) ? state.routes : [];
    routesField.appendChild(
      createChipsInput({
        values: state.routes,
        placeholder: "输入后回车添加，例如 192.168.0.0/16",
        suggestCidr: true,
        onChange: () => renderToml()
      })
    );
  }
  container.appendChild(routesField);

  // 10. SOCKS5 Server
  const socks5Field = document.createElement("div");
  socks5Field.className = "field full";
  socks5Field.appendChild(
    createFieldHeader(
      "socks5服务器",
      "socks5_proxy",
      "启用 socks5 服务器，允许通过 socks5 访问虚拟网络中的所有节点"
    )
  );
  socks5Field.appendChild(
    createToggleButton({
      checked: Boolean(state.enable_socks5),
      onChange: (val) => {
        state.enable_socks5 = val;
        rerender();
      }
    })
  );
  if (state.enable_socks5) {
    const socksInput = document.createElement("input");
    socksInput.type = "number";
    socksInput.min = "0";
    socksInput.max = "65535";
    socksInput.step = "1";
    socksInput.value = String(state.socks5_port ?? 1080);
    socksInput.addEventListener("input", () => {
      const p = Number(socksInput.value);
      state.socks5_port = Number.isFinite(p)
        ? Math.min(65535, Math.max(0, Math.trunc(p)))
        : 1080;
      renderToml();
    });
    socks5Field.appendChild(socksInput);
  }
  container.appendChild(socks5Field);

  // 11. Exit Nodes
  const exitNodesField = document.createElement("div");
  exitNodesField.className = "field full";
  exitNodesField.appendChild(
    createFieldHeader(
      "出口节点列表",
      "exit_nodes",
      "转发所有流量的出口节点，虚拟 IPv4 地址，优先级按列表顺序确定"
    )
  );
  state.exit_nodes = Array.isArray(state.exit_nodes) ? state.exit_nodes : [];
  exitNodesField.appendChild(
    createChipsInput({
      values: state.exit_nodes,
      placeholder: "输入后回车添加，例如 192.168.8.8",
      onChange: () => renderToml()
    })
  );
  container.appendChild(exitNodesField);

  // 12. Mapped Listeners
  const mappedField = document.createElement("div");
  mappedField.className = "field full";
  mappedField.appendChild(
    createFieldHeader(
      "监听映射",
      "mapped_listeners",
      "手动指定本机监听器的公网地址，其他节点可以使用该地址连接到本节点（不支持域名）。例如：tcp://123.123.123.123:11223，可以指定多个。"
    )
  );
  state.mapped_listeners = Array.isArray(state.mapped_listeners)
    ? state.mapped_listeners
    : [];
  mappedField.appendChild(
    renderUrlListInput({
      urls: state.mapped_listeners,
      protos: PROTOS,
      defaultUrl: "tcp://0.0.0.0:11010",
      addLabel: "添加监听映射",
      placeholder: "0.0.0.0",
      renderToml,
      rerender
    })
  );
  container.appendChild(mappedField);

  return container;
}

export function renderGroupPanelBody(groupId, ctx) {
  switch (groupId) {
    case "basic_settings":
      return renderBasicSettingsPanel(ctx);
    case "advanced_settings":
      return renderAdvancedSettingsPanel(ctx);
    case "port_forwards":
      return renderPortForwardsPanel(ctx);
    case "acl_settings":
      return renderAclPanel(ctx);
    default:
      return document.createElement("div");
  }
}
