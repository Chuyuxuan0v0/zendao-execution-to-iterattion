// ==UserScript==
// @name         禅道 - 替换"执行"为"迭代"（极致版）
// @namespace    http://tampermonkey.net/
// @version      1.2.0
// @description  在禅道中，将所有"执行"文本替换为"迭代"，使用 TreeWalker 只替换可见文本节点，不破坏 DOM
// @author       Chuyuxuan0v0
// @match        http://10.7.6.23/*
// @grant        none
// @run-at       document-idle
// @downloadURL  https://raw.githubusercontent.com/Chuyuxuan0v0/zendao-execution-to-iterattion/main/zendao-replace.user.js
// @updateURL    https://raw.githubusercontent.com/Chuyuxuan0v0/zendao-execution-to-iterattion/main/zendao-replace.user.js
// ==/UserScript==

(function() {
    'use strict';

    const SEARCH = '执行';
    const REPLACE = '迭代';
    const REGEX = new RegExp(SEARCH.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');

    let totalReplaceCount = 0;

    // ---------- 核心替换：TreeWalker 只替换可见文本节点 ----------
    // 避免 innerHTML 暴力替换导致事件绑定丢失、输入框清空、页面崩溃
    function replaceTextNodes(root) {
        if (!root || !root.body) return;

        const walker = document.createTreeWalker(
            root.body,
            NodeFilter.SHOW_TEXT,
            function(node) {
                // 跳过 script/style/textarea 内部的文本节点
                const parent = node.parentNode;
                if (parent) {
                    const tag = parent.tagName;
                    if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEXTAREA') {
                        return NodeFilter.FILTER_SKIP;
                    }
                }
                // 只处理包含目标字符串的文本节点
                return node.nodeValue.includes(SEARCH)
                    ? NodeFilter.FILTER_ACCEPT
                    : NodeFilter.FILTER_SKIP;
            },
            false
        );

        let node;
        let replaced = false;
        while ((node = walker.nextNode())) {
            node.nodeValue = node.nodeValue.replace(REGEX, REPLACE);
            replaced = true;
        }

        if (replaced) {
            totalReplaceCount++;
            console.log(`[替换脚本] 第 ${totalReplaceCount} 次替换（${SEARCH}→${REPLACE}）`);
        }
    }

    // ---------- 遍历同源 iframe ----------
    function replaceIframes() {
        document.querySelectorAll('iframe').forEach(iframe => {
            try {
                const doc = iframe.contentDocument || iframe.contentWindow?.document;
                if (doc) replaceTextNodes(doc);
            } catch (e) {
                // 跨域 iframe 跳过，不做任何事
            }
        });
    }

    // ---------- 完整替换 ----------
    function fullReplace() {
        replaceTextNodes(document);
        replaceIframes();
    }

    // ---------- 首次执行 ----------
    fullReplace();

    // ---------- MutationObserver 监听 DOM 变化（300ms 防抖） ----------
    let observerTimer = null;
    const observer = new MutationObserver(() => {
        if (observerTimer) return;
        observerTimer = setTimeout(() => {
            fullReplace();
            observerTimer = null;
        }, 300);
    });

    const waitForBody = setInterval(() => {
        if (document.body) {
            observer.observe(document.body, { childList: true, subtree: true });
            clearInterval(waitForBody);
        }
    }, 100);

    // ---------- 安全兜底：每 3 秒扫描一次 ----------
    setInterval(fullReplace, 3000);

    // ---------- 页面完全加载后补一次 ----------
    window.addEventListener('load', () => {
        setTimeout(fullReplace, 500);
    });

    // ---------- 暴露手动执行函数到控制台 ----------
    window.replaceExecute = fullReplace;

    console.log(`[替换脚本] 已启动，将"${SEARCH}"替换为"${REPLACE}"（TreeWalker 模式，不破坏 DOM）`);
})();
