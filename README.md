# easytier配置生成

一个纯静态前端页面，用来根据 EasyTier 配置项生成 `config.toml`。

适合场景：

- 本地快速填写 EasyTier 配置
- 参考 `options.txt` 和示例 `config.toml` 生成配置
- 部署到 GitHub Pages / Cloudflare Pages 作为静态工具页使用

## 功能

- 按中文说明填写配置项
- 输入框下方显示实际配置键名
- 布尔值和固定选项使用下拉框
- 复杂项支持新增 / 删除
- 实时生成 TOML
- 支持复制和下载 `config.toml`
- `instance_id` 未填写时自动生成随机 UUID
- 小屏设备下优化了表单和 TOML 预览区域

## 文件说明

- [index.html](D:\etconfig\index.html)：页面结构
- [scripts](D:\etconfig\scripts)：前端脚本目录
- [scripts/app.js](D:\etconfig\scripts\app.js)：页面入口，负责组装表单、状态、主题和 TOML 预览
- [scripts/data/config-data.js](D:\etconfig\scripts\data\config-data.js)：配置项元数据、默认值和分组定义
- [scripts/form/form-renderer.js](D:\etconfig\scripts\form\form-renderer.js)：表单整体分组渲染
- [scripts/form/field-renderer.js](D:\etconfig\scripts\form\field-renderer.js)：单个字段渲染
- [scripts/form/dynamic-list-renderers.js](D:\etconfig\scripts\form\dynamic-list-renderers.js)：字符串列表、对象列表、监听器列表渲染
- [scripts/form/form-dom-utils.js](D:\etconfig\scripts\form\form-dom-utils.js)：表单相关的 DOM 小工具
- [scripts/state/state-controller.js](D:\etconfig\scripts\state\state-controller.js)：配置状态、折叠状态和自动实例 ID
- [scripts/state/ui-status.js](D:\etconfig\scripts\state\ui-status.js)：顶部状态文案控制
- [scripts/theme/theme.js](D:\etconfig\scripts\theme\theme.js)：亮色、深色、跟随系统主题逻辑
- [scripts/toml/toml-builder.js](D:\etconfig\scripts\toml\toml-builder.js)：TOML 生成逻辑
- [scripts/utils/path-utils.js](D:\etconfig\scripts\utils\path-utils.js)：按路径读写配置对象的工具函数
- [scripts/utils/dom-handlers.js](D:\etconfig\scripts\utils\dom-handlers.js)：复制、下载、重置和主题切换事件绑定
- [style.css](D:\etconfig\style.css)：页面样式和响应式布局
- [options.txt](D:\etconfig\options.txt)：`easytier-core --help` 导出的可配置项参考
- [config.toml](D:\etconfig\config.toml)：示例配置

## 本地使用

直接打开 [index.html](D:\etconfig\index.html) 即可。

如果你想用本地静态服务预览，也可以在项目目录运行：

```powershell
python -m http.server 4173
```

然后访问：

```text
http://127.0.0.1:4173
```

## 使用方式

1. 在左侧配置表单中填写需要的字段
2. 右侧实时查看生成的 TOML
3. 使用“复制 TOML”或“下载 config.toml”

说明：

- 没有填写的字段不会输出到最终 TOML
- `listeners` 默认保留了一组常见监听配置，可按需删除
- `ws` / `wss` 监听地址会自动补全末尾的 `/`

## 部署到 Cloudflare Pages

这是一个纯静态项目，不依赖 Node 构建，也不依赖后端服务。

Cloudflare Pages 推荐配置：

- Framework preset: `None`
- Build command: 留空
- Build output directory: `/`

也可以直接把当前目录作为静态站点根目录部署。

说明：

- 页面入口脚本现在由 [index.html](D:\etconfig\index.html) 引用 [scripts/app.js](D:\etconfig\scripts\app.js)

## 参考

- EasyTier 配置说明：
  - [完整配置选项](https://easytier.cn/guide/network/configurations.html)
  - [配置文件说明](https://easytier.cn/guide/network/config-file.html)
