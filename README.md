# 侧栏图标并列（sidebar-icon-row）

DeepSeek Harness 插件的侧栏入口默认都是 42px 整行，所以「插件广场 / 远程控制 / 面板入口」会一条一行。
本插件把它们压成 36×36 的图标方块并排显示，并提供设置页。

- 面板入口（`sidebar.panellist`）与底部入口（`sidebar.footer.action`）统一处理；
- 「今日 / 余额」卡片仍独占一整行（沿用 cost-meter 自己的 `.cm-footer-stack`）；
- 每个入口只显示图标，常驻文字隐藏，悬停时在图标上方显示名称（纯 CSS `::after` + `aria-label`）；
- 侧栏收起成 56px 轨道时保持原样（图标竖排）；
- 底部新增一个「设置」齿轮入口，一键打开 DSH 设置页；
- 设置页里可调图标大小（16 / 18 / 20 / 24）、逐个开关入口、并调整图标先后顺序；
- 自定义入口：给任意已安装插件在侧栏加一个图标，位置可选「上排」（面板入口，`sidebar.panellist`）
  或「下排」（底部入口，`sidebar.footer.action`），点击直达该插件的插件页。

## 自定义入口

DSH 的槽位约定是：一个面板入口必须自己提供同 id 的 `main` 面板，否则侧栏点了会切到空白主区。
本插件给自定义入口用 `pin:<包名>` 作为独立 key（不和插件自带入口共享隐藏/排序状态），并对两种位置分别处理：

- 下排：注册一个 `sidebar.footer.action` 条目，自己渲染 36×36 的方块按钮；
- 上排：注册 `sidebar.panellist` 条目（`id` = `sir-pin-N`，于是侧栏会为它渲染一行），
  同时注册一个同 key 的 `main` 占位组件作为兜底；图标上拦截点击并 `stopPropagation`，
  这样选中态不变、直接调用 `pluginNavigation.openBundle(包名)` 打开插件页。
  键盘 Enter 走宿主自己的 `selectPanel`，由 `main` 占位组件即刻重定向。

图标字符：包无法在这里加载别的插件的 SVG（跨包资源不可达），所以自定义入口用 1–2 个文字字符当图标，
留空时取插件标题首字；字符与位置都能在设置页里改。

## 实现方式

- 只注入一个 `<style>` 节点，不修改任何宿主或其他插件的组件；
- 选择器用 `[data-slot="sidebar.footer.action"] > *` 与 `[class*="panelList"]` / `[class*="panelRow"]` 锚定，
  不使用 `_2H3hWW_` 这类带构建哈希的类名；
- 侧栏入口按渲染出来的名字（`aria-label` 优先）打上 `data-sir-key`，隐藏与排序都作用在这个属性上，
  关闭的入口直接 `display: none !important`（内联），所以不依赖选择器优先级；
- 排序通过给每个入口写 `order` 实现，不移动 DOM；
- 设置存在浏览器 `localStorage`（键 `dsh.sidebar-icon-row.v1`），按浏览器各自保存。

## 设置页

`插件 → 已安装插件 → 侧栏图标并列`。设置区注册在 `plugins.bundle.config`（key 为包名），
在插件页描述下方、插件行上方渲染。

## 安装 / 卸载

```powershell
# 安装（当前 profile；源码就放在 profile 的 local-plugins 下，不依赖工作区）
dsh plugin install "E:\DeepseekHarness-data\data\profiles\desktop\local-plugins\sidebar-icon-row"
# 卸载
dsh plugin remove dsh-sidebar-icon-row
```

安装后刷新页面；新增 bundle 首次加载可能需要重启一次 `dsh web`。

## 回滚

在插件管理里关掉「侧栏图标并列」，或卸载本包：样式随 `<style>` 清理消失，
额外的「设置」图标随 `sidebar.footer.action` 的注册一并移除。
