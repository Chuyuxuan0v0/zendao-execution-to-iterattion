# 禅道 - 替换"执行"为"迭代"

一个 Tampermonkey 油猴脚本，在禅道（ZenTao）页面中自动将所有"执行"文本替换为"迭代"。

## 安装

1. 浏览器安装 [Tampermonkey](https://www.tampermonkey.net/) 扩展
2. [点击安装脚本](https://raw.githubusercontent.com/Chuyuxuan0v0/zendao-execution-to-iterattion/main/zendao-replace.user.js)
3. 访问禅道即可自动生效

## 功能

- 将页面中所有可见的"执行"文本替换为"迭代"
- 支持 iframe 内内容替换
- 通过 `MutationObserver` 监听动态加载的内容
- 不破坏 DOM 结构（使用 `TreeWalker` 只替换文本节点，保留事件绑定和输入框状态）

## 技术细节

使用 `document.createTreeWalker` 遍历所有文本节点，只替换可见文本内容，跳过 `<script>` / `<style>` / `<textarea>` 等不应修改的元素，避免 `innerHTML` 暴力替换带来的页面崩溃问题。

## 手动调用

在浏览器控制台中可手动执行：

```js
window.replaceExecute();
```

## 许可证

MIT
