# 侧栏图标并列（sidebar-icon-row）

侧栏底部 `sidebar.footer.action` 的每个入口默认都是 42px 整行，所以插件入口会一条一行。
本插件注入一段作用域限定的 CSS，把它们压成 36×36 的图标方块并排显示：

- 「今日 / 余额」卡片仍独占一整行（沿用 cost-meter 自己的 `.cm-footer-stack`）；
- 每个入口只显示图标（18px 居中），常驻文字隐藏；
- 悬停时在图标上方显示名称（`::after` + `aria-label`，不额外执行 JS）；
- 侧栏收起成 56px 轨道时保持原样（图标竖排）。

## 实现方式

- 不注册任何 Slot，不修改任何宿主或其他插件的 DOM；只在 `apply` 里插入一个 `<style>`，卸载时移除。
- 选择器用 `[data-slot="sidebar.footer.action"] > *` 与 `[class*="footerActions"]` 锚定，
  不使用 `_2H3hWW_` 这类带构建哈希的类名。
- 兜底：即使 cost-meter 不再提供 `flex-wrap`，插件自己也声明了 `flex-wrap: wrap`。

## 安装 / 卸载

```powershell
# 安装（当前 profile；源码就放在 profile 的 local-plugins 下，不依赖工作区）
dsh plugin install "E:\DeepseekHarness-data\data\profiles\desktop\local-plugins\sidebar-icon-row"
# 卸载
dsh plugin remove @local/sidebar-icon-row
```

安装后刷新页面；新增 bundle 首次加载可能需要重启一次 `dsh web`。

## 回滚

在插件管理里关掉「侧栏图标并列」，或卸载本包，样式会立即随 `<style>` 的清理而消失。
