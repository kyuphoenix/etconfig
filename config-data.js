export const BOOLEAN_OPTIONS = [
  { value: "", label: "未设置" },
  { value: "true", label: "是 / true" },
  { value: "false", label: "否 / false" }
];

export const COMPRESSION_OPTIONS = [
  { value: "", label: "未设置" },
  { value: "none", label: "none" },
  { value: "zstd", label: "zstd" }
];

export const ENCRYPTION_OPTIONS = [
  { value: "", label: "未设置" },
  { value: "xor", label: "xor" },
  { value: "aes-gcm", label: "aes-gcm" },
  { value: "aes-256-gcm", label: "aes-256-gcm" },
  { value: "chacha20", label: "chacha20" }
];

export const LOG_LEVEL_OPTIONS = [
  { value: "", label: "未设置" },
  { value: "error", label: "error" },
  { value: "warn", label: "warn" },
  { value: "info", label: "info" },
  { value: "debug", label: "debug" },
  { value: "trace", label: "trace" }
];

export const PROTOCOL_OPTIONS = [
  { value: "", label: "未设置" },
  { value: "tcp", label: "tcp" },
  { value: "udp", label: "udp" },
  { value: "wg", label: "wg" },
  { value: "ws", label: "ws" },
  { value: "wss", label: "wss" },
  { value: "quic", label: "quic" },
  { value: "faketcp", label: "faketcp" }
];

export const DATA_COMPRESS_ALGO_MAP = {
  none: 0,
  zstd: 2
};

export const DEFAULT_STATE = {
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

export const GROUPS = [
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
