export function createTomlBuilder({
  dataCompressAlgoMap,
  getEffectiveInstanceId,
  getState
}) {
  function escapeTomlString(value) {
    return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  }

  function isFilled(value) {
    if (Array.isArray(value)) return value.length > 0;
    return value !== "" && value !== null && value !== undefined;
  }

  function normalizeList(items) {
    return items.map((item) => String(item).trim()).filter(Boolean);
  }

  function normalizeListeners(items) {
    return items
      .map((item) => ({
        protocol: String(item.protocol || "").trim(),
        host: String(item.host || "").trim(),
        port: String(item.port || "").trim()
      }))
      .filter((item) => item.protocol && item.host && item.port)
      .map((item) => {
        const suffix = item.protocol === "ws" || item.protocol === "wss" ? "/" : "";
        return `${item.protocol}://${item.host}:${item.port}${suffix}`;
      });
  }

  function normalizeObjectList(items, keys) {
    return items
      .map((item) => {
        const normalized = {};
        keys.forEach((key) => {
          normalized[key] = String(item[key] || "").trim();
        });
        return normalized;
      })
      .filter((item) => keys.some((key) => item[key]));
  }

  function parseBooleanSelect(value) {
    if (value === "true") return true;
    if (value === "false") return false;
    return null;
  }

  function parseNumber(value) {
    if (value === "" || value === null || value === undefined) return null;
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
  }

  function formatTomlValue(value) {
    if (typeof value === "boolean") return value ? "true" : "false";
    if (typeof value === "number") return String(value);
    return `"${escapeTomlString(value)}"`;
  }

  function formatTomlArray(values) {
    const list = values.map((value) => `    ${formatTomlValue(value)}`);
    return `[\n${list.join(",\n")}\n]`;
  }

  function appendScalar(lines, key, value, parser = null) {
    if (!isFilled(value)) return;
    const parsed = parser ? parser(value) : value;
    if (parsed === null || parsed === undefined || parsed === "") return;
    lines.push(`${key} = ${formatTomlValue(parsed)}`);
  }

  function appendArray(lines, key, values) {
    const normalized = normalizeList(values);
    if (!normalized.length) return;
    lines.push(`${key} = ${formatTomlArray(normalized)}`);
  }

  function appendListenerArray(lines, key, values) {
    const normalized = normalizeListeners(values);
    if (!normalized.length) return;
    lines.push(`${key} = ${formatTomlArray(normalized)}`);
  }

  function buildToml() {
    const state = getState();
    const lines = [];

    appendScalar(lines, "hostname", state.hostname);
    appendScalar(lines, "instance_name", state.instance_name);
    appendScalar(lines, "instance_id", getEffectiveInstanceId());
    appendScalar(lines, "machine_id", state.machine_id);
    appendScalar(lines, "config_server", state.config_server);
    appendScalar(lines, "ipv4", state.ipv4);
    appendScalar(lines, "ipv6", state.ipv6);
    appendScalar(lines, "ipv6_public_addr_provider", state.ipv6_public_addr_provider, parseBooleanSelect);
    appendScalar(lines, "ipv6_public_addr_auto", state.ipv6_public_addr_auto, parseBooleanSelect);
    appendScalar(lines, "ipv6_public_addr_prefix", state.ipv6_public_addr_prefix);
    appendScalar(lines, "dhcp", state.dhcp, parseBooleanSelect);
    appendListenerArray(lines, "listeners", state.listeners);
    appendArray(lines, "mapped_listeners", state.mapped_listeners);
    appendArray(lines, "routes", state.routes);
    appendScalar(lines, "socks5_proxy", state.socks5_proxy);
    appendArray(lines, "tcp_whitelist", state.tcp_whitelist);
    appendArray(lines, "udp_whitelist", state.udp_whitelist);
    appendArray(lines, "stun_servers", state.stun_servers);
    appendArray(lines, "stun_servers_v6", state.stun_servers_v6);
    appendArray(lines, "exit_nodes", state.exit_nodes);
    appendArray(lines, "relay_network_whitelist", state.relay_network_whitelist);
    appendScalar(lines, "external_node", state.external_node);
    appendScalar(lines, "no_listener", state.no_listener, parseBooleanSelect);

    if (state.network_name || state.network_secret) {
      lines.push("");
      lines.push("[network_identity]");
      appendScalar(lines, "network_name", state.network_name);
      appendScalar(lines, "network_secret", state.network_secret);
    }

    normalizeObjectList(state.peers, ["uri"]).forEach((peer) => {
      lines.push("");
      lines.push("[[peer]]");
      appendScalar(lines, "uri", peer.uri);
    });

    normalizeObjectList(state.proxy_networks, ["cidr", "mapped_cidr"]).forEach((network) => {
      lines.push("");
      lines.push("[[proxy_network]]");
      appendScalar(lines, "cidr", network.cidr);
      appendScalar(lines, "mapped_cidr", network.mapped_cidr);
    });

    if (state.vpn_portal_config.client_cidr || state.vpn_portal_config.wireguard_listen) {
      lines.push("");
      lines.push("[vpn_portal_config]");
      appendScalar(lines, "client_cidr", state.vpn_portal_config.client_cidr);
      appendScalar(lines, "wireguard_listen", state.vpn_portal_config.wireguard_listen);
    }

    normalizeObjectList(state.port_forwards, ["bind_addr", "dst_addr", "proto"]).forEach((forward) => {
      lines.push("");
      lines.push("[[port_forward]]");
      appendScalar(lines, "bind_addr", forward.bind_addr);
      appendScalar(lines, "dst_addr", forward.dst_addr);
      appendScalar(lines, "proto", forward.proto);
    });

    const flagLines = [];
    const flags = state.flags;
    const boolKeys = [
      "accept_dns", "bind_device", "disable_encryption", "disable_ipv6", "disable_kcp_input",
      "disable_p2p", "disable_quic_input", "disable_relay_kcp", "disable_relay_quic",
      "disable_sym_hole_punching", "disable_tcp_hole_punching", "disable_udp_hole_punching",
      "disable_upnp", "enable_exit_node", "enable_kcp_proxy", "enable_quic_proxy",
      "enable_relay_foreign_network_kcp", "enable_relay_foreign_network_quic", "enable_udp_broadcast_relay",
      "latency_first", "multi_thread", "need_p2p", "p2p_only", "private_mode",
      "proxy_forward_by_system", "relay_all_peer_rpc", "secure_mode", "use_smoltcp"
    ];

    boolKeys.forEach((key) => appendScalar(flagLines, key, flags[key], parseBooleanSelect));
    appendScalar(flagLines, "data_compress_algo", flags.data_compress_algo, (value) => dataCompressAlgoMap[value] ?? null);
    appendScalar(flagLines, "default_protocol", flags.default_protocol);
    appendScalar(flagLines, "encryption_algorithm", flags.encryption_algorithm);
    appendScalar(flagLines, "dev_name", flags.dev_name);
    appendScalar(flagLines, "mtu", flags.mtu, parseNumber);
    appendScalar(flagLines, "multi_thread_count", flags.multi_thread_count, parseNumber);
    appendScalar(flagLines, "foreign_relay_bps_limit", flags.foreign_relay_bps_limit, parseNumber);
    appendScalar(flagLines, "instance_recv_bps_limit", flags.instance_recv_bps_limit, parseNumber);
    appendScalar(flagLines, "console_log_level", flags.console_log_level);
    appendScalar(flagLines, "file_log_level", flags.file_log_level);
    appendScalar(flagLines, "file_log_dir", flags.file_log_dir);
    appendScalar(flagLines, "file_log_size", flags.file_log_size, parseNumber);
    appendScalar(flagLines, "file_log_count", flags.file_log_count, parseNumber);
    appendScalar(flagLines, "rpc_portal", flags.rpc_portal);
    appendScalar(flagLines, "rpc_portal_whitelist", flags.rpc_portal_whitelist);
    appendScalar(flagLines, "tld_dns_zone", flags.tld_dns_zone);
    appendScalar(flagLines, "local_private_key", flags.local_private_key);
    appendScalar(flagLines, "local_public_key", flags.local_public_key);
    appendScalar(flagLines, "credential", flags.credential);
    appendScalar(flagLines, "credential_file", flags.credential_file);

    if (flagLines.length) {
      lines.push("");
      lines.push("[flags]");
      lines.push(...flagLines);
    }

    if (!lines.length) {
      return "# 当前还没有可输出的配置项\n";
    }

    return `${lines.join("\n").trim()}\n`;
  }

  return {
    buildToml
  };
}
