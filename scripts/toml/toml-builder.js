const P25519 = (1n << 255n) - 19n;
const A24 = 121665n;

function mod(a) {
  const r = a % P25519;
  return r >= 0n ? r : r + P25519;
}

function modPow(base, exp) {
  let result = 1n;
  let b = mod(base);
  let e = exp;
  while (e > 0n) {
    if (e & 1n) result = mod(result * b);
    b = mod(b * b);
    e >>= 1n;
  }
  return result;
}

function cswap(swap, a, b) {
  const mask = swap ? ~0n : 0n;
  const dummy = mask & (a ^ b);
  return [a ^ dummy, b ^ dummy];
}

export function deriveX25519PublicKeyBase64(privateKeyBase64) {
  try {
    const binary = atob(String(privateKeyBase64).trim());
    if (binary.length !== 32) return null;
    const kBytes = new Uint8Array(32);
    for (let i = 0; i < 32; i += 1) {
      kBytes[i] = binary.charCodeAt(i);
    }
    kBytes[0] &= 248;
    kBytes[31] &= 127;
    kBytes[31] |= 64;

    let k = 0n;
    for (let i = 0; i < 32; i += 1) {
      k |= BigInt(kBytes[i]) << BigInt(8 * i);
    }

    const x1 = 9n;
    let x2 = 1n;
    let z2 = 0n;
    let x3 = x1;
    let z3 = 1n;
    let swap = 0n;

    for (let t = 254n; t >= 0n; t -= 1n) {
      const kt = (k >> t) & 1n;
      swap ^= kt;
      [x2, x3] = cswap(swap === 1n, x2, x3);
      [z2, z3] = cswap(swap === 1n, z2, z3);
      swap = kt;

      const A = mod(x2 + z2);
      const AA = mod(A * A);
      const B = mod(x2 - z2);
      const BB = mod(B * B);
      const E = mod(AA - BB);
      const C = mod(x3 + z3);
      const D = mod(x3 - z3);
      const DA = mod(D * A);
      const CB = mod(C * B);
      x3 = mod((DA + CB) * (DA + CB));
      z3 = mod(x1 * mod((DA - CB) * (DA - CB)));
      x2 = mod(AA * BB);
      z2 = mod(E * mod(AA + mod(A24 * E)));
    }

    [x2, x3] = cswap(swap === 1n, x2, x3);
    [z2, z3] = cswap(swap === 1n, z2, z3);

    const res = mod(x2 * modPow(z2, P25519 - 2n));
    const outBytes = new Uint8Array(32);
    let temp = res;
    for (let i = 0; i < 32; i += 1) {
      outBytes[i] = Number(temp & 0xffn);
      temp >>= 8n;
    }
    return btoa(String.fromCharCode(...outBytes));
  } catch {
    return null;
  }
}

export function escapeTomlString(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}

function normalizeUrlForToml(rawUrl) {
  const trimmed = String(rawUrl ?? "").trim();
  if (!trimmed) return "";
  const match = trimmed.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):\/\/(.*)$/);
  if (!match) return trimmed;
  const scheme = match[1].toLowerCase();
  const rest = match[2];
  if (["ws", "wss", "http", "https"].includes(scheme) && !rest.includes("/")) {
    return `${scheme}://${rest}/`;
  }
  return `${scheme}://${rest}`;
}

function formatStringArrayMultiline(items) {
  if (!items || items.length === 0) return "[]";
  const lines = items.map((item) => `    "${escapeTomlString(item)}",`);
  return `[\n${lines.join("\n")}\n]`;
}

function formatStringArrayInline(items) {
  if (!items || items.length === 0) return "[]";
  return `[${items.map((item) => `"${escapeTomlString(item)}"`).join(", ")}]`;
}

function sanitizeHostname(raw) {
  if (!raw) return "";
  return Array.from(String(raw))
    .filter((ch) => {
      const code = ch.charCodeAt(0);
      return code > 0x1f && code !== 0x7f;
    })
    .slice(0, 32)
    .join("");
}

function isAclEmpty(acl) {
  const aclV1 = acl?.acl_v1;
  if (!aclV1) return true;
  const hasChains = Array.isArray(aclV1.chains) && aclV1.chains.length > 0;
  const hasDeclares =
    Array.isArray(aclV1.group?.declares) &&
    aclV1.group.declares.some(
      (d) => String(d.group_name || "").trim() || String(d.group_secret || "").trim()
    );
  const hasMembers =
    Array.isArray(aclV1.group?.members) && aclV1.group.members.length > 0;
  return !hasChains && !hasDeclares && !hasMembers;
}

export function createTomlBuilder({ getEffectiveInstanceId, getState }) {
  function buildToml() {
    const state = getState();
    const lines = [];

    const pushBlank = () => {
      if (lines.length > 0 && lines[lines.length - 1] !== "") {
        lines.push("");
      }
    };

    // --- 1. Top-level fields (matching struct Config in easytier-core/src/config/toml.rs) ---
    const hostname = sanitizeHostname(state.hostname);
    if (hostname) {
      lines.push(`hostname = "${escapeTomlString(hostname)}"`);
    }

    const networkName = String(state.network_name ?? "");
    lines.push(`instance_name = "${escapeTomlString(networkName)}"`);
    lines.push(`instance_id = "${escapeTomlString(getEffectiveInstanceId())}"`);

    const dhcp = Boolean(state.dhcp);
    if (!dhcp) {
      const virtualIpv4 = String(state.virtual_ipv4 ?? "").trim();
      if (virtualIpv4) {
        const netLen =
          state.network_length != null && state.network_length !== ""
            ? Number(state.network_length)
            : 24;
        lines.push(`ipv4 = "${escapeTomlString(`${virtualIpv4}/${netLen}`)}"`);
      }
    }

    lines.push(`ipv6_public_addr_auto = ${Boolean(state.ipv6_public_addr_auto)}`);
    lines.push(`dhcp = ${dhcp}`);

    const listenerUrls = (state.listener_urls || [])
      .map(normalizeUrlForToml)
      .filter(Boolean);
    lines.push(`listeners = ${formatStringArrayMultiline(listenerUrls)}`);

    const mappedListeners = (state.mapped_listeners || [])
      .map(normalizeUrlForToml)
      .filter(Boolean);
    if (mappedListeners.length > 0) {
      lines.push(`mapped_listeners = ${formatStringArrayMultiline(mappedListeners)}`);
    }

    const exitNodes = (state.exit_nodes || [])
      .map((s) => String(s).trim())
      .filter(Boolean);
    if (exitNodes.length > 0) {
      lines.push(`exit_nodes = ${formatStringArrayMultiline(exitNodes)}`);
    }

    if (state.enable_manual_routes) {
      const routes = (state.routes || [])
        .map((s) => String(s).trim())
        .filter(Boolean);
      lines.push(`routes = ${formatStringArrayMultiline(routes)}`);
    }

    if (state.enable_socks5 && state.socks5_port != null && state.socks5_port !== "") {
      lines.push(`socks5_proxy = "socks5://0.0.0.0:${Number(state.socks5_port)}"`);
    }

    // --- 2. [network_identity] ---
    const credentialSecret =
      state.identity_mode === "credential"
        ? String(state.credential_secret ?? "").trim()
        : "";

    pushBlank();
    lines.push("[network_identity]");
    lines.push(`network_name = "${escapeTomlString(networkName)}"`);
    if (!credentialSecret) {
      lines.push(
        `network_secret = "${escapeTomlString(state.network_secret ?? "")}"`
      );
    }

    // --- 3. [[peer]] ---
    const peerUrls = (state.peer_urls || [])
      .map(normalizeUrlForToml)
      .filter(Boolean);
    peerUrls.forEach((uri) => {
      pushBlank();
      lines.push("[[peer]]");
      lines.push(`uri = "${escapeTomlString(uri)}"`);
    });

    // --- 4. [[proxy_network]] ---
    const proxyCidrs = (state.proxy_cidrs || [])
      .map((s) => String(s).trim())
      .filter(Boolean);
    proxyCidrs.forEach((entry) => {
      const parts = entry.split("->").map((p) => p.trim());
      if (!parts[0]) return;
      pushBlank();
      lines.push("[[proxy_network]]");
      lines.push(`cidr = "${escapeTomlString(parts[0])}"`);
      if (parts[1]) {
        lines.push(`mapped_cidr = "${escapeTomlString(parts[1])}"`);
      }
    });

    // --- 5. [vpn_portal_config] ---
    if (state.vpn_portal_config) {
      const portal = state.vpn_portal_config;
      const validClients = (portal.clients || []).filter(
        (c) => String(c.name || "").trim() || String(c.virtual_ip || "").trim()
      );
      if (portal.enabled !== false || validClients.length > 0) {
        pushBlank();
        lines.push("[vpn_portal_config]");
        if (portal.enabled === false) {
          lines.push("enabled = false");
        }
        lines.push(
          `wireguard_listen = "${escapeTomlString(portal.wireguard_listen || "0.0.0.0:22022")}"`
        );
        if (portal.wireguard_private_key) {
          lines.push(
            `wireguard_private_key = "${escapeTomlString(portal.wireguard_private_key)}"`
          );
        }
        if (validClients.length === 0) {
          lines.push("clients = []");
        } else {
          validClients.forEach((client) => {
            pushBlank();
            lines.push("[[vpn_portal_config.clients]]");
            lines.push(`name = "${escapeTomlString(client.name || "")}"`);
            lines.push(
              `virtual_ip = "${escapeTomlString(client.virtual_ip || "")}"`
            );
            const groups = (client.groups || [])
              .map((g) => String(g).trim())
              .filter(Boolean);
            lines.push(`groups = ${formatStringArrayInline(groups)}`);
          });
        }
      }
    }

    // --- 6. [[port_forward]] ---
    const portForwards = (state.port_forwards || []).filter(
      (pf) => String(pf.bind_ip || "").trim() && String(pf.dst_ip || "").trim()
    );
    portForwards.forEach((pf) => {
      pushBlank();
      lines.push("[[port_forward]]");
      lines.push(
        `bind_addr = "${escapeTomlString(`${pf.bind_ip.trim()}:${pf.bind_port ?? 65535}`)}"`
      );
      lines.push(
        `dst_addr = "${escapeTomlString(`${pf.dst_ip.trim()}:${pf.dst_port ?? 65535}`)}"`
      );
      lines.push(`proto = "${escapeTomlString(pf.proto || "tcp")}"`);
    });

    // --- 7. [secure_mode] ---
    if (credentialSecret) {
      pushBlank();
      lines.push("[secure_mode]");
      lines.push("enabled = true");
      lines.push(`local_private_key = "${escapeTomlString(credentialSecret)}"`);
      const pubKey = deriveX25519PublicKeyBase64(credentialSecret);
      if (pubKey) {
        lines.push(`local_public_key = "${escapeTomlString(pubKey)}"`);
      }
    } else if (state.secure_mode?.enabled) {
      const privKey = String(state.secure_mode.local_private_key || "").trim();
      pushBlank();
      lines.push("[secure_mode]");
      lines.push("enabled = true");
      if (privKey) {
        lines.push(`local_private_key = "${escapeTomlString(privKey)}"`);
        const pubKey = deriveX25519PublicKeyBase64(privKey);
        if (pubKey) {
          lines.push(`local_public_key = "${escapeTomlString(pubKey)}"`);
        }
      }
    }

    // --- 8. [flags] (in exact common.proto Flags field order patched by gen_config()) ---
    pushBlank();
    lines.push("[flags]");
    lines.push(`dev_name = "${escapeTomlString(state.dev_name ?? "")}"`);
    lines.push(`enable_encryption = ${!state.disable_encryption}`);
    lines.push(`enable_ipv6 = ${!state.disable_ipv6}`);
    if (state.mtu != null && state.mtu !== "") {
      lines.push(`mtu = ${Number(state.mtu)}`);
    }
    lines.push(`latency_first = ${Boolean(state.latency_first)}`);
    lines.push(`enable_exit_node = ${Boolean(state.enable_exit_node)}`);
    lines.push(`proxy_forward_by_system = ${Boolean(state.proxy_forward_by_system)}`);
    lines.push(`no_tun = ${Boolean(state.no_tun)}`);
    lines.push(`use_smoltcp = ${Boolean(state.use_smoltcp)}`);
    const whitelistStr = state.enable_relay_network_whitelist
      ? (state.relay_network_whitelist || [])
          .map((s) => String(s).trim())
          .filter(Boolean)
          .join(" ")
      : "*";
    lines.push(`relay_network_whitelist = "${escapeTomlString(whitelistStr)}"`);
    lines.push(`disable_p2p = ${Boolean(state.disable_p2p)}`);
    lines.push(`relay_all_peer_rpc = ${Boolean(state.relay_all_peer_rpc)}`);
    lines.push(
      `disable_tcp_hole_punching = ${Boolean(state.disable_tcp_hole_punching)}`
    );
    lines.push(
      `disable_udp_hole_punching = ${Boolean(state.disable_udp_hole_punching)}`
    );
    lines.push(`multi_thread = ${Boolean(state.multi_thread)}`);
    lines.push(`bind_device = ${Boolean(state.bind_device)}`);
    lines.push(`enable_kcp_proxy = ${Boolean(state.enable_kcp_proxy)}`);
    lines.push(`disable_kcp_input = ${Boolean(state.disable_kcp_input)}`);
    lines.push(`disable_relay_data = ${Boolean(state.disable_relay_data)}`);
    lines.push(`enable_quic_proxy = ${Boolean(state.enable_quic_proxy)}`);
    lines.push(`disable_quic_input = ${Boolean(state.disable_quic_input)}`);
    lines.push(`accept_dns = ${Boolean(state.enable_magic_dns)}`);
    lines.push(`private_mode = ${Boolean(state.enable_private_mode)}`);
    lines.push(
      `disable_sym_hole_punching = ${Boolean(state.disable_sym_hole_punching)}`
    );
    lines.push(`p2p_only = ${Boolean(state.p2p_only)}`);
    if (
      state.instance_recv_bps_limit != null &&
      state.instance_recv_bps_limit !== ""
    ) {
      if (typeof state.instance_recv_bps_limit === "number") {
        lines.push(`instance_recv_bps_limit = ${state.instance_recv_bps_limit}`);
      } else {
        lines.push(
          `instance_recv_bps_limit = "${escapeTomlString(state.instance_recv_bps_limit)}"`
        );
      }
    }
    lines.push(`need_p2p = ${Boolean(state.need_p2p)}`);
    lines.push(`lazy_p2p = ${Boolean(state.lazy_p2p)}`);
    lines.push(`disable_upnp = ${Boolean(state.disable_upnp)}`);
    lines.push(
      `enable_udp_broadcast_relay = ${Boolean(state.enable_udp_broadcast_relay)}`
    );
    lines.push(`prefer_peer_relay = ${Boolean(state.prefer_peer_relay)}`);

    // --- 9. [acl] ---
    if (!isAclEmpty(state.acl)) {
      const aclV1 = state.acl.acl_v1;
      (aclV1.chains || []).forEach((chain) => {
        pushBlank();
        lines.push("[[acl.acl_v1.chains]]");
        lines.push(`name = "${escapeTomlString(chain.name || "")}"`);
        lines.push(`chain_type = ${Number(chain.chain_type || 1)}`);
        lines.push(`description = "${escapeTomlString(chain.description || "")}"`);
        lines.push(`default_action = ${Number(chain.default_action || 2)}`);
        lines.push(`enabled = ${chain.enabled !== false}`);
        if (!chain.rules || chain.rules.length === 0) {
          lines.push("rules = []");
        } else {
          chain.rules.forEach((rule) => {
            pushBlank();
            lines.push("[[acl.acl_v1.chains.rules]]");
            lines.push(`name = "${escapeTomlString(rule.name || "")}"`);
            lines.push(
              `description = "${escapeTomlString(rule.description || "")}"`
            );
            lines.push(`priority = ${Number(rule.priority ?? 100)}`);
            lines.push(`enabled = ${rule.enabled !== false}`);
            lines.push(`protocol = ${Number(rule.protocol || 5)}`);
            lines.push(`ports = ${formatStringArrayInline(rule.ports || [])}`);
            lines.push(
              `source_ips = ${formatStringArrayInline(rule.source_ips || [])}`
            );
            lines.push(
              `destination_ips = ${formatStringArrayInline(rule.destination_ips || [])}`
            );
            lines.push(
              `source_ports = ${formatStringArrayInline(rule.source_ports || [])}`
            );
            lines.push(`action = ${Number(rule.action || 1)}`);
            lines.push(`rate_limit = ${Number(rule.rate_limit ?? 0)}`);
            lines.push(`burst_limit = ${Number(rule.burst_limit ?? 0)}`);
            lines.push(`stateful = ${Boolean(rule.stateful)}`);
            lines.push(
              `source_groups = ${formatStringArrayInline(rule.source_groups || [])}`
            );
            lines.push(
              `destination_groups = ${formatStringArrayInline(rule.destination_groups || [])}`
            );
          });
        }
      });

      const declares = (aclV1.group?.declares || []).filter(
        (d) => String(d.group_name || "").trim() || String(d.group_secret || "").trim()
      );
      const members = (aclV1.group?.members || [])
        .map((m) => String(m).trim())
        .filter(Boolean);

      if (declares.length > 0 || members.length > 0) {
        pushBlank();
        lines.push("[acl.acl_v1.group]");
        lines.push(`members = ${formatStringArrayInline(members)}`);
        if (declares.length === 0) {
          lines.push("declares = []");
        } else {
          declares.forEach((decl) => {
            pushBlank();
            lines.push("[[acl.acl_v1.group.declares]]");
            lines.push(
              `group_name = "${escapeTomlString(decl.group_name || "")}"`
            );
            lines.push(
              `group_secret = "${escapeTomlString(decl.group_secret || "")}"`
            );
          });
        }
      }
    }

    return `${lines.join("\n")}\n`;
  }

  return {
    buildToml
  };
}
