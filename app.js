const BOOLEAN_OPTIONS = [
  { value: "", label: "未设置" },
  { value: "true", label: "是 / true" },
  { value: "false", label: "否 / false" }
];

const COMPRESSION_OPTIONS = [
  { value: "", label: "未设置" },
  { value: "none", label: "none" },
  { value: "zstd", label: "zstd" }
];

const ENCRYPTION_OPTIONS = [
  { value: "", label: "未设置" },
  { value: "xor", label: "xor" },
  { value: "aes-gcm", label: "aes-gcm" },
  { value: "aes-256-gcm", label: "aes-256-gcm" },
  { value: "chacha20", label: "chacha20" }
];

const LOG_LEVEL_OPTIONS = [
  { value: "", label: "未设置" },
  { value: "error", label: "error" },
  { value: "warn", label: "warn" },
  { value: "info", label: "info" },
  { value: "debug", label: "debug" },
  { value: "trace", label: "trace" }
];

const PROTOCOL_OPTIONS = [
  { value: "", label: "未设置" },
  { value: "tcp", label: "tcp" },
  { value: "udp", label: "udp" },
  { value: "wg", label: "wg" },
  { value: "ws", label: "ws" },
  { value: "wss", label: "wss" },
  { value: "quic", label: "quic" },
  { value: "faketcp", label: "faketcp" }
];

const DATA_COMPRESS_ALGO_MAP = {
  none: 0,
  zstd: 2
};

const DEFAULT_STATE = {
  hostname: "",
  instance_name: "",
  instance_id: "",
  machine_id: "",
  config_server: "",
  ipv4: "",
  ipv6: "",
  ipv6_public_addr_provider: "",
  ipv6_public_addr_auto: "",
  ipv6_public_addr_prefix: "",
  dhcp: "",
  listeners: [
    { protocol: "tcp", host: "0.0.0.0", port: "11010" },
    { protocol: "udp", host: "0.0.0.0", port: "11010" },
    { protocol: "wg", host: "0.0.0.0", port: "11011" },
    { protocol: "quic", host: "0.0.0.0", port: "11012" },
    { protocol: "ws", host: "0.0.0.0", port: "11011" },
    { protocol: "wss", host: "0.0.0.0", port: "11012" },
    { protocol: "faketcp", host: "0.0.0.0", port: "11013" }
  ],
  mapped_listeners: [],
  no_listener: "",
  external_node: "",
  peers: [],
  network_name: "",
  network_secret: "",
  proxy_networks: [],
  routes: [],
  exit_nodes: [],
  relay_network_whitelist: [],
  socks5_proxy: "",
  tcp_whitelist: [],
  udp_whitelist: [],
  stun_servers: [],
  stun_servers_v6: [],
  vpn_portal_config: {
    client_cidr: "",
    wireguard_listen: ""
  },
  port_forwards: [],
  flags: {
    accept_dns: "",
    bind_device: "",
    console_log_level: "",
    credential: "",
    credential_file: "",
    data_compress_algo: "",
    default_protocol: "",
    dev_name: "",
    disable_encryption: "",
    disable_ipv6: "",
    disable_kcp_input: "",
    disable_p2p: "",
    disable_quic_input: "",
    disable_relay_kcp: "",
    disable_relay_quic: "",
    disable_sym_hole_punching: "",
    disable_tcp_hole_punching: "",
    disable_udp_hole_punching: "",
    disable_upnp: "",
    enable_exit_node: "",
    enable_kcp_proxy: "",
    enable_quic_proxy: "",
    enable_relay_foreign_network_kcp: "",
    enable_relay_foreign_network_quic: "",
    enable_udp_broadcast_relay: "",
    file_log_count: "",
    file_log_dir: "",
    file_log_level: "",
    file_log_size: "",
    foreign_relay_bps_limit: "",
    instance_recv_bps_limit: "",
    latency_first: "",
    local_private_key: "",
    local_public_key: "",
    mtu: "",
    multi_thread: "",
    multi_thread_count: "",
    need_p2p: "",
    p2p_only: "",
    private_mode: "",
    proxy_forward_by_system: "",
    relay_all_peer_rpc: "",
    rpc_portal: "",
    rpc_portal_whitelist: "",
    secure_mode: "",
    tld_dns_zone: "",
    use_smoltcp: "",
    encryption_algorithm: ""
  }
};

const GROUPS = [
  {
    title: "基础信息",
    description: "实例标识与网络身份。",
    collapsed: false,
    fields: [
      { path: "hostname", title: "设备主机名", keyName: "hostname", type: "text", placeholder: "例如 my-device" },
      { path: "instance_name", title: "实例名称", keyName: "instance_name", type: "text", placeholder: "例如 office-node" },
      { path: "instance_id", title: "实例唯一 ID", keyName: "instance_id", type: "text", placeholder: "例如 UUID，可选" },
      { path: "machine_id", title: "Web 配置机器 ID", keyName: "machine_id", type: "text", placeholder: "仅使用配置服务器时再填写" },
      { path: "config_server", title: "配置服务器地址", keyName: "config_server", type: "text", placeholder: "例如 udp://127.0.0.1:22020/admin" },
      { path: "network_name", title: "网络名称", keyName: "network_identity.network_name", type: "text", placeholder: "例如 my_network" },
      { path: "network_secret", title: "网络密钥", keyName: "network_identity.network_secret", type: "text", placeholder: "例如 my_secret" }
    ]
  },
  {
    title: "地址与监听",
    description: "虚拟地址、监听器和初始对等节点。",
    collapsed: false,
    fields: [
      { path: "ipv4", title: "虚拟 IPv4 地址", keyName: "ipv4", type: "text", placeholder: "例如 10.144.144.2" },
      { path: "ipv6", title: "虚拟 IPv6 地址", keyName: "ipv6", type: "text", placeholder: "例如 fd00::2" },
      { path: "dhcp", title: "自动分配地址", keyName: "dhcp", type: "select", options: BOOLEAN_OPTIONS },
      { path: "ipv6_public_addr_provider", title: "共享公网 IPv6 前缀", keyName: "ipv6_public_addr_provider", type: "select", options: BOOLEAN_OPTIONS },
      { path: "ipv6_public_addr_auto", title: "自动获取公网 IPv6", keyName: "ipv6_public_addr_auto", type: "select", options: BOOLEAN_OPTIONS },
      { path: "ipv6_public_addr_prefix", title: "手动指定公网 IPv6 前缀", keyName: "ipv6_public_addr_prefix", type: "text", placeholder: "例如 2001:db8::/64" },
      { path: "external_node", title: "公共共享节点", keyName: "external_node", type: "text", placeholder: "例如 tcp://example.com:11010" },
      { path: "no_listener", title: "不监听任何端口", keyName: "no_listener", type: "select", options: BOOLEAN_OPTIONS },
      { path: "listeners", title: "监听器列表", keyName: "listeners", type: "listener-list", full: true, addLabel: "新增监听器" },
      { path: "mapped_listeners", title: "公网监听器映射", keyName: "mapped_listeners", type: "string-list", full: true, addLabel: "新增公网监听器", placeholder: "例如 tcp://123.123.123.123:11223" },
      { path: "peers", title: "初始对等节点", keyName: "[[peer]]", type: "object-list", full: true, addLabel: "新增 peer", itemTitle: "Peer", schema: [
        { key: "uri", title: "对等节点地址", type: "text", placeholder: "例如 tcp://1.2.3.4:11010", keyName: "peer.uri" }
      ] }
    ]
  },
  {
    title: "路由与代理",
    description: "子网代理、路由、端口转发等。默认折叠。",
    collapsed: true,
    fields: [
      { path: "routes", title: "路由列表", keyName: "routes", type: "string-list", full: true, addLabel: "新增路由", placeholder: "例如 192.168.0.0/16" },
      { path: "proxy_networks", title: "代理子网", keyName: "[[proxy_network]]", type: "object-list", full: true, addLabel: "新增代理子网", itemTitle: "Proxy Network", schema: [
        { key: "cidr", title: "导出网段", type: "text", placeholder: "例如 10.0.0.0/24", keyName: "proxy_network.cidr" },
        { key: "mapped_cidr", title: "映射网段", type: "text", placeholder: "例如 192.168.0.0/24，可选", keyName: "proxy_network.mapped_cidr" }
      ] },
      { path: "exit_nodes", title: "出口节点", keyName: "exit_nodes", type: "string-list", full: true, addLabel: "新增出口节点", placeholder: "例如 10.144.144.1" },
      { path: "relay_network_whitelist", title: "转发网络白名单", keyName: "relay_network_whitelist", type: "string-list", full: true, addLabel: "新增白名单项", placeholder: "例如 * 或 office*" },
      { path: "socks5_proxy", title: "SOCKS5 服务", keyName: "socks5_proxy", type: "text", placeholder: "例如 socks5://0.0.0.0:1080" },
      { path: "tcp_whitelist", title: "TCP 端口白名单", keyName: "tcp_whitelist", type: "string-list", addLabel: "新增 TCP 端口", placeholder: "例如 80 或 8000-9000" },
      { path: "udp_whitelist", title: "UDP 端口白名单", keyName: "udp_whitelist", type: "string-list", addLabel: "新增 UDP 端口", placeholder: "例如 53 或 5000-6000" },
      { path: "port_forwards", title: "端口转发", keyName: "[[port_forward]]", type: "object-list", full: true, addLabel: "新增端口转发", itemTitle: "Port Forward", schema: [
        { key: "bind_addr", title: "本地绑定地址", type: "text", placeholder: "例如 0.0.0.0:12345", keyName: "port_forward.bind_addr" },
        { key: "dst_addr", title: "目标地址", type: "text", placeholder: "例如 10.126.126.1:23456", keyName: "port_forward.dst_addr" },
        { key: "proto", title: "协议", type: "select", options: PROTOCOL_OPTIONS, keyName: "port_forward.proto" }
      ] }
    ]
  },
  {
    title: "VPN 与服务",
    description: "VPN 门户、STUN、RPC 与日志。默认折叠。",
    collapsed: true,
    fields: [
      { path: "vpn_portal_config.client_cidr", title: "VPN 客户端网段", keyName: "vpn_portal_config.client_cidr", type: "text", placeholder: "例如 10.14.14.0/24" },
      { path: "vpn_portal_config.wireguard_listen", title: "WireGuard 监听地址", keyName: "vpn_portal_config.wireguard_listen", type: "text", placeholder: "例如 0.0.0.0:11010" },
      { path: "stun_servers", title: "STUN 服务器", keyName: "stun_servers", type: "string-list", full: true, addLabel: "新增 STUN", placeholder: "例如 stun.l.google.com:19302" },
      { path: "stun_servers_v6", title: "IPv6 STUN 服务器", keyName: "stun_servers_v6", type: "string-list", full: true, addLabel: "新增 IPv6 STUN", placeholder: "例如 stun.l.google.com:19302" },
      { path: "flags.rpc_portal", title: "RPC 管理入口", keyName: "flags.rpc_portal", type: "text", placeholder: "例如 0.0.0.0:15888" },
      { path: "flags.rpc_portal_whitelist", title: "RPC 白名单", keyName: "flags.rpc_portal_whitelist", type: "text", placeholder: "例如 127.0.0.1/32,::1/128" },
      { path: "flags.console_log_level", title: "控制台日志级别", keyName: "flags.console_log_level", type: "select", options: LOG_LEVEL_OPTIONS },
      { path: "flags.file_log_level", title: "文件日志级别", keyName: "flags.file_log_level", type: "select", options: LOG_LEVEL_OPTIONS },
      { path: "flags.file_log_dir", title: "日志目录", keyName: "flags.file_log_dir", type: "text", placeholder: "例如 D:/easytier/logs" },
      { path: "flags.file_log_size", title: "单个日志文件大小 MB", keyName: "flags.file_log_size", type: "number", placeholder: "例如 100" },
      { path: "flags.file_log_count", title: "日志文件数量上限", keyName: "flags.file_log_count", type: "number", placeholder: "例如 10" }
    ]
  },
  {
    title: "高级 Flags",
    description: "性能、安全、P2P、压缩等高级选项。默认折叠。",
    collapsed: true,
    fields: [
      { path: "flags.accept_dns", title: "启用魔法 DNS", keyName: "flags.accept_dns", type: "select", options: BOOLEAN_OPTIONS },
      { path: "flags.tld_dns_zone", title: "魔法 DNS 顶级域", keyName: "flags.tld_dns_zone", type: "text", placeholder: "例如 et.net." },
      { path: "flags.data_compress_algo", title: "压缩算法", keyName: "flags.data_compress_algo", type: "select", options: COMPRESSION_OPTIONS },
      { path: "flags.default_protocol", title: "默认连接协议", keyName: "flags.default_protocol", type: "select", options: PROTOCOL_OPTIONS },
      { path: "flags.disable_encryption", title: "禁用节点间加密", keyName: "flags.disable_encryption", type: "select", options: BOOLEAN_OPTIONS },
      { path: "flags.encryption_algorithm", title: "加密算法", keyName: "flags.encryption_algorithm", type: "select", options: ENCRYPTION_OPTIONS },
      { path: "flags.multi_thread", title: "启用多线程", keyName: "flags.multi_thread", type: "select", options: BOOLEAN_OPTIONS },
      { path: "flags.multi_thread_count", title: "多线程数量", keyName: "flags.multi_thread_count", type: "number", placeholder: "例如 4" },
      { path: "flags.disable_ipv6", title: "禁用 IPv6", keyName: "flags.disable_ipv6", type: "select", options: BOOLEAN_OPTIONS },
      { path: "flags.dev_name", title: "TUN 设备名称", keyName: "flags.dev_name", type: "text", placeholder: "例如 tun-et" },
      { path: "flags.mtu", title: "MTU", keyName: "flags.mtu", type: "number", placeholder: "例如 1360" },
      { path: "flags.latency_first", title: "延迟优先", keyName: "flags.latency_first", type: "select", options: BOOLEAN_OPTIONS },
      { path: "flags.enable_exit_node", title: "允许作为出口节点", keyName: "flags.enable_exit_node", type: "select", options: BOOLEAN_OPTIONS },
      { path: "flags.proxy_forward_by_system", title: "使用系统内核转发代理流量", keyName: "flags.proxy_forward_by_system", type: "select", options: BOOLEAN_OPTIONS },
      { path: "flags.use_smoltcp", title: "启用 smoltcp", keyName: "flags.use_smoltcp", type: "select", options: BOOLEAN_OPTIONS },
      { path: "flags.p2p_only", title: "仅使用已建立的 P2P", keyName: "flags.p2p_only", type: "select", options: BOOLEAN_OPTIONS },
      { path: "flags.need_p2p", title: "要求其他节点主动建立 P2P", keyName: "flags.need_p2p", type: "select", options: BOOLEAN_OPTIONS },
      { path: "flags.disable_p2p", title: "禁用普通自动 P2P", keyName: "flags.disable_p2p", type: "select", options: BOOLEAN_OPTIONS },
      { path: "flags.disable_udp_hole_punching", title: "禁用 UDP 打洞", keyName: "flags.disable_udp_hole_punching", type: "select", options: BOOLEAN_OPTIONS },
      { path: "flags.disable_tcp_hole_punching", title: "禁用 TCP 打洞", keyName: "flags.disable_tcp_hole_punching", type: "select", options: BOOLEAN_OPTIONS },
      { path: "flags.disable_sym_hole_punching", title: "禁用对称 NAT 打洞", keyName: "flags.disable_sym_hole_punching", type: "select", options: BOOLEAN_OPTIONS },
      { path: "flags.disable_upnp", title: "禁用 UPnP/NAT-PMP", keyName: "flags.disable_upnp", type: "select", options: BOOLEAN_OPTIONS },
      { path: "flags.enable_udp_broadcast_relay", title: "转发本机 UDP 广播", keyName: "flags.enable_udp_broadcast_relay", type: "select", options: BOOLEAN_OPTIONS },
      { path: "flags.relay_all_peer_rpc", title: "转发所有 peer RPC", keyName: "flags.relay_all_peer_rpc", type: "select", options: BOOLEAN_OPTIONS },
      { path: "flags.bind_device", title: "绑定物理设备", keyName: "flags.bind_device", type: "select", options: BOOLEAN_OPTIONS },
      { path: "flags.enable_kcp_proxy", title: "启用 KCP 代理 TCP", keyName: "flags.enable_kcp_proxy", type: "select", options: BOOLEAN_OPTIONS },
      { path: "flags.disable_kcp_input", title: "禁用 KCP 输入", keyName: "flags.disable_kcp_input", type: "select", options: BOOLEAN_OPTIONS },
      { path: "flags.enable_quic_proxy", title: "启用 QUIC 代理 TCP", keyName: "flags.enable_quic_proxy", type: "select", options: BOOLEAN_OPTIONS },
      { path: "flags.disable_quic_input", title: "禁用 QUIC 输入", keyName: "flags.disable_quic_input", type: "select", options: BOOLEAN_OPTIONS },
      { path: "flags.private_mode", title: "启用私有模式", keyName: "flags.private_mode", type: "select", options: BOOLEAN_OPTIONS },
      { path: "flags.foreign_relay_bps_limit", title: "外部网络转发速率上限", keyName: "flags.foreign_relay_bps_limit", type: "number", placeholder: "单位 BPS" },
      { path: "flags.instance_recv_bps_limit", title: "实例总入站速率上限", keyName: "flags.instance_recv_bps_limit", type: "number", placeholder: "单位 BPS" },
      { path: "flags.disable_relay_kcp", title: "禁止中转 KCP 数据包", keyName: "flags.disable_relay_kcp", type: "select", options: BOOLEAN_OPTIONS },
      { path: "flags.disable_relay_quic", title: "禁止中转 QUIC 数据包", keyName: "flags.disable_relay_quic", type: "select", options: BOOLEAN_OPTIONS },
      { path: "flags.enable_relay_foreign_network_kcp", title: "允许中转外部网络 KCP", keyName: "flags.enable_relay_foreign_network_kcp", type: "select", options: BOOLEAN_OPTIONS },
      { path: "flags.enable_relay_foreign_network_quic", title: "允许中转外部网络 QUIC", keyName: "flags.enable_relay_foreign_network_quic", type: "select", options: BOOLEAN_OPTIONS },
      { path: "flags.secure_mode", title: "启用安全模式", keyName: "flags.secure_mode", type: "select", options: BOOLEAN_OPTIONS },
      { path: "flags.local_private_key", title: "本地私钥", keyName: "flags.local_private_key", type: "text", placeholder: "安全模式下使用" },
      { path: "flags.local_public_key", title: "本地公钥", keyName: "flags.local_public_key", type: "text", placeholder: "安全模式下使用" },
      { path: "flags.credential", title: "临时节点凭据", keyName: "flags.credential", type: "text", placeholder: "base64 编码私钥" },
      { path: "flags.credential_file", title: "凭据文件路径", keyName: "flags.credential_file", type: "text", placeholder: "例如 D:/easytier/credential.txt" }
    ]
  }
];

let state = structuredClone(DEFAULT_STATE);
let generatedInstanceId = crypto.randomUUID();
const groupOpenState = new Map(
  GROUPS.map((group) => [group.title, !group.collapsed])
);

const formRoot = document.getElementById("formRoot");
const tomlOutput = document.getElementById("tomlOutput");
const statusText = document.getElementById("statusText");

function getByPath(object, path) {
  return path.split(".").reduce((current, key) => current?.[key], object);
}

function setByPath(object, path, value) {
  const keys = path.split(".");
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => {
    if (!(key in current)) {
      current[key] = {};
    }
    return current[key];
  }, object);
  target[lastKey] = value;
}

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

function getEffectiveInstanceId() {
  const manualValue = String(state.instance_id || "").trim();
  return manualValue || generatedInstanceId;
}

function appendListenerArray(lines, key, values) {
  const normalized = normalizeListeners(values);
  if (!normalized.length) return;
  lines.push(`${key} = ${formatTomlArray(normalized)}`);
}

function buildToml() {
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
  appendScalar(flagLines, "data_compress_algo", flags.data_compress_algo, (value) => DATA_COMPRESS_ALGO_MAP[value] ?? null);
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

function createMetaText(className, text) {
  const node = document.createElement("div");
  node.className = className;
  node.textContent = text;
  return node;
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
    input.placeholder = field.path === "instance_id" && !getByPath(state, field.path)
      ? getEffectiveInstanceId()
      : (field.placeholder || "");
    input.value = getByPath(state, field.path) ?? "";
    input.addEventListener("input", () => {
      setByPath(state, field.path, input.value);
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
    select.value = getByPath(state, field.path) ?? "";
    select.addEventListener("change", () => {
      setByPath(state, field.path, select.value);
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

function createStringList(field) {
  const block = document.createElement("div");
  block.className = "list-block";

  const values = getByPath(state, field.path);
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

  const items = getByPath(state, field.path);
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

  const items = getByPath(state, field.path);
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
    PROTOCOL_OPTIONS.forEach((option) => {
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

function renderForm() {
  formRoot.innerHTML = "";
  GROUPS.forEach((group) => {
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

function renderToml() {
  const toml = buildToml();
  tomlOutput.textContent = toml;
  const lineCount = toml.split("\n").filter(Boolean).length;
  statusText.textContent = `已生成 ${lineCount} 行`;
}

function rerender() {
  renderForm();
  renderToml();
}

document.getElementById("copyTomlBtn").addEventListener("click", async () => {
  const text = tomlOutput.textContent;
  await navigator.clipboard.writeText(text);
  statusText.textContent = "已复制到剪贴板";
});

document.getElementById("downloadTomlBtn").addEventListener("click", () => {
  const blob = new Blob([tomlOutput.textContent], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "config.toml";
  link.click();
  URL.revokeObjectURL(url);
  statusText.textContent = "已下载 config.toml";
});

document.getElementById("resetBtn").addEventListener("click", () => {
  state = structuredClone(DEFAULT_STATE);
  generatedInstanceId = crypto.randomUUID();
  GROUPS.forEach((group) => {
    groupOpenState.set(group.title, !group.collapsed);
  });
  rerender();
  statusText.textContent = "已清空为安全默认状态";
});

rerender();
