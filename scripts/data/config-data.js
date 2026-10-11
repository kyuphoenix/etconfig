export const PROTOS = {
  tcp: 11010,
  udp: 11010,
  wg: 11011,
  ws: 11011,
  wss: 11012,
  quic: 11012,
  faketcp: 11013,
  http: 80,
  https: 443,
  txt: 0,
  srv: 0
};

const LISTENER_EXCLUDED_PROTOS = new Set(["http", "https", "txt", "srv"]);

export const LISTENER_PROTOS = Object.fromEntries(
  Object.entries(PROTOS).filter(([proto]) => !LISTENER_EXCLUDED_PROTOS.has(proto))
);

export const PATH_PROTOS = new Set(["ws", "wss", "http", "https"]);

export const PORT_FORWARD_PROTO_OPTIONS = ["tcp", "udp"];

export const ACL_CHAIN_TYPES = [
  { value: 1, key: "inbound", label: "入站 (Inbound)", defaultName: "default_inbound", defaultAction: 2 },
  { value: 2, key: "outbound", label: "出站 (Outbound)", defaultName: "default_outbound", defaultAction: 1 },
  { value: 3, key: "forward", label: "转发 (Forward)", defaultName: "default_forward", defaultAction: 2 }
];

export const ACL_ACTIONS = [
  { value: 1, label: "允许 (Allow)" },
  { value: 2, label: "丢弃 (Drop)" }
];

export const ACL_PROTOCOLS = [
  { value: 5, label: "任意 (Any)" },
  { value: 1, label: "TCP" },
  { value: 2, label: "UDP" },
  { value: 3, label: "ICMP" },
  { value: 4, label: "ICMPv6" }
];

/**
 * Boolean flags rendered in `高级设置 -> 功能开关`, in exact schema order from
 * `easytier-proto/proto/common.proto` (`formFlags()`) plus `ipv6_public_addr_auto`.
 */
export const BOOL_FLAGS = [
  {
    field: "disable_encryption",
    tomlKey: "enable_encryption",
    negate: true,
    defaultValue: false,
    label: "禁用加密",
    help: "禁用对等节点通信的加密。注意：默认启用加密，若勾选此项则关闭，必须与对等节点设置一致。"
  },
  {
    field: "disable_ipv6",
    tomlKey: "enable_ipv6",
    negate: true,
    defaultValue: false,
    label: "禁用IPv6",
    help: "禁用此节点的IPv6功能，仅使用IPv4进行网络通信。"
  },
  {
    field: "latency_first",
    tomlKey: "latency_first",
    negate: false,
    defaultValue: false,
    label: "开启延迟优先模式",
    help: "忽略中转跳数，选择总延迟最低的路径"
  },
  {
    field: "enable_exit_node",
    tomlKey: "enable_exit_node",
    negate: false,
    defaultValue: false,
    label: "启用出口节点",
    help: "允许此节点成为出口节点"
  },
  {
    field: "no_tun",
    tomlKey: "no_tun",
    negate: false,
    defaultValue: false,
    label: "无 TUN 模式",
    help: "不使用 TUN 网卡，适合无管理员权限时使用。本节点仅允许被访问。访问其他节点需要使用 SOCK5"
  },
  {
    field: "use_smoltcp",
    tomlKey: "use_smoltcp",
    negate: false,
    defaultValue: false,
    label: "使用用户态协议栈",
    help: "使用用户态 TCP/IP 协议栈，避免操作系统防火墙问题导致无法子网代理 / KCP代理。"
  },
  {
    field: "disable_p2p",
    tomlKey: "disable_p2p",
    negate: false,
    defaultValue: false,
    label: "禁用 P2P",
    help: "禁用普通自动 P2P。开启 need-p2p 的节点仍可与当前节点建立 P2P。"
  },
  {
    field: "relay_all_peer_rpc",
    tomlKey: "relay_all_peer_rpc",
    negate: false,
    defaultValue: false,
    label: "转发RPC包",
    help: "允许转发所有对等节点的RPC数据包，即使对等节点不在转发网络白名单中。这可以帮助白名单外网络中的对等节点建立P2P连接。"
  },
  {
    field: "disable_udp_hole_punching",
    tomlKey: "disable_udp_hole_punching",
    negate: false,
    defaultValue: false,
    label: "禁用UDP打洞",
    help: "禁用UDP打洞功能"
  },
  {
    field: "multi_thread",
    tomlKey: "multi_thread",
    negate: false,
    defaultValue: true,
    label: "启用多线程",
    help: "使用多线程运行时"
  },
  {
    field: "bind_device",
    tomlKey: "bind_device",
    negate: false,
    defaultValue: true,
    label: "仅使用物理网卡",
    help: "仅使用物理网卡，避免 EasyTier 通过其他虚拟网建立连接。"
  },
  {
    field: "enable_kcp_proxy",
    tomlKey: "enable_kcp_proxy",
    negate: false,
    defaultValue: false,
    label: "启用 KCP 代理",
    help: "将 TCP 流量转为 KCP 流量，降低传输延迟，提升传输速度。"
  },
  {
    field: "disable_kcp_input",
    tomlKey: "disable_kcp_input",
    negate: false,
    defaultValue: false,
    label: "禁用 KCP 输入",
    help: "禁用 KCP 入站流量，其他开启 KCP 代理的节点仍然使用 TCP 连接到本节点。"
  },
  {
    field: "proxy_forward_by_system",
    tomlKey: "proxy_forward_by_system",
    negate: false,
    defaultValue: false,
    label: "系统转发",
    help: "通过系统内核转发子网代理数据包，禁用内置NAT"
  },
  {
    field: "enable_magic_dns",
    tomlKey: "accept_dns",
    negate: false,
    defaultValue: false,
    label: "启用魔法DNS",
    help: "启用魔法DNS，允许通过EasyTier的DNS服务器访问其他节点的虚拟IPv4地址， 如 node1.et.net。"
  },
  {
    field: "enable_private_mode",
    tomlKey: "private_mode",
    negate: false,
    defaultValue: false,
    label: "启用私有模式",
    help: "启用私有模式，则不允许使用了与本网络不相同的网络名称和密码的节点通过本节点进行握手或中转。"
  },
  {
    field: "enable_quic_proxy",
    tomlKey: "enable_quic_proxy",
    negate: false,
    defaultValue: false,
    label: "启用 QUIC 代理",
    help: "将 TCP 流量转为 QUIC 流量，降低传输延迟，提升传输速度。"
  },
  {
    field: "disable_quic_input",
    tomlKey: "disable_quic_input",
    negate: false,
    defaultValue: false,
    label: "禁用 QUIC 输入",
    help: "禁用 QUIC 入站流量，其他开启 QUIC 代理的节点仍然使用 TCP 连接到本节点。"
  },
  {
    field: "disable_sym_hole_punching",
    tomlKey: "disable_sym_hole_punching",
    negate: false,
    defaultValue: false,
    label: "禁用对称NAT打洞",
    help: "禁用对称NAT的打洞（生日攻击），将对称NAT视为锥形NAT处理"
  },
  {
    field: "p2p_only",
    tomlKey: "p2p_only",
    negate: false,
    defaultValue: false,
    label: "仅 P2P",
    help: "仅与已经建立P2P连接的对等节点通信，不通过其他节点中转。"
  },
  {
    field: "disable_tcp_hole_punching",
    tomlKey: "disable_tcp_hole_punching",
    negate: false,
    defaultValue: false,
    label: "禁用TCP打洞",
    help: "禁用TCP打洞功能"
  },
  {
    field: "lazy_p2p",
    tomlKey: "lazy_p2p",
    negate: false,
    defaultValue: false,
    label: "延迟 P2P",
    help: "仅在实际流量需要某个对等节点时才尝试建立 P2P。开启 need-p2p 的节点仍会被主动连接。"
  },
  {
    field: "need_p2p",
    tomlKey: "need_p2p",
    negate: false,
    defaultValue: false,
    label: "需要 P2P",
    help: "即使其他节点启用了 lazy p2p，也要求它们主动与当前节点建立 P2P 连接。"
  },
  {
    field: "disable_upnp",
    tomlKey: "disable_upnp",
    negate: false,
    defaultValue: false,
    label: "禁用 UPnP",
    help: "禁用符合条件监听器的运行时 UPnP/NAT-PMP 端口映射；自动端口映射默认开启。"
  },
  {
    field: "disable_relay_data",
    tomlKey: "disable_relay_data",
    negate: false,
    defaultValue: false,
    label: "不转发数据",
    help: "不转发其他节点的数据包，本节点不承载自身以外的流量。"
  },
  {
    field: "enable_udp_broadcast_relay",
    tomlKey: "enable_udp_broadcast_relay",
    negate: false,
    defaultValue: false,
    label: "UDP 广播中继",
    help: "仅 Windows：捕获物理网卡上的本机 UDP 广播包并转发给 EasyTier 对等节点，帮助局域网游戏发现房间。需要管理员权限。"
  },
  {
    field: "prefer_peer_relay",
    tomlKey: "prefer_peer_relay",
    negate: false,
    defaultValue: false,
    label: "优先凭证节点转发",
    help: "优先通过已经转发到目标节点的凭证节点转发，而不是为同一目标再通告一条直连路径。"
  },
  {
    field: "ipv6_public_addr_auto",
    tomlKey: "ipv6_public_addr_auto",
    topLevel: true,
    negate: false,
    defaultValue: false,
    label: "自动获取公网 IPv6",
    help: "自动从共享了 IPv6 子网的对等节点获取一个公网 IPv6 地址。"
  }
];

export const GROUPS = [
  {
    id: "basic_settings",
    title: "基础设置",
    description: "虚拟 IPv4、网络名称与密钥/临时凭证、初始节点连接列表。",
    collapsed: false
  },
  {
    id: "advanced_settings",
    title: "高级设置",
    description: "功能开关、主机名、子网代理、WireGuard、监听地址、路由与 SOCKS5 等。",
    collapsed: true
  },
  {
    id: "port_forwards",
    title: "端口转发",
    description: "将本地端口转发到虚拟网络中的远程端口。",
    collapsed: true
  },
  {
    id: "acl_settings",
    title: "访问控制",
    description: "配置入站、出站、转发规则链与用户组策略 (ACL v1)。",
    collapsed: true
  }
];

export function generateClampedX25519PrivateKeyBase64() {
  const key = crypto.getRandomValues(new Uint8Array(32));
  key[0] &= 248;
  key[31] = (key[31] & 127) | 64;
  return btoa(String.fromCharCode(...key));
}

export function createVpnPortalConfig() {
  return {
    enabled: true,
    wireguard_listen: "0.0.0.0:22022",
    wireguard_private_key: generateClampedX25519PrivateKeyBase64(),
    clients: []
  };
}

export function createEmptyAcl() {
  return {
    acl_v1: {
      chains: [],
      group: {
        declares: [],
        members: []
      }
    }
  };
}

function createDefaultFlagState() {
  const flags = {};
  for (const flag of BOOL_FLAGS) {
    flags[flag.field] = flag.defaultValue;
  }
  return flags;
}

export const DEFAULT_STATE = {
  instance_id: "",
  dhcp: true,
  virtual_ipv4: "",
  network_length: 24,
  network_name: "easytier",
  network_secret: "",
  identity_mode: "secret",
  credential_secret: "",
  secure_mode: null,

  peer_urls: [],

  ...createDefaultFlagState(),

  hostname: "",
  proxy_cidrs: [],
  vpn_portal_config: null,

  listener_urls: [
    "tcp://0.0.0.0:11010",
    "udp://0.0.0.0:11010",
    "wg://0.0.0.0:11011"
  ],

  dev_name: "",
  mtu: null,
  instance_recv_bps_limit: null,

  enable_relay_network_whitelist: false,
  relay_network_whitelist: [],

  enable_manual_routes: false,
  routes: [],

  enable_socks5: false,
  socks5_port: 1080,

  exit_nodes: [],
  mapped_listeners: [],

  port_forwards: [],
  acl: createEmptyAcl()
};
