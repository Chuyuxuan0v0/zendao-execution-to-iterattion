// ==UserScript==
// @name         禅道 - 替换"执行"为"迭代"
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  在禅道（http://10.7.6.23/）中，将所有"执行"文本替换为"迭代"，支持动态内容
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
    let replaceCount = 0;

    // ---------- 核心替换函数（使用 innerHTML 暴力替换） ----------
    function doReplace() {
        if (!document.body) return;

        // 备份当前 body 的 innerHTML
        let html = document.body.innerHTML;
        // 全局替换所有"执行"为"迭代"（注意转义正则特殊字符，但中文无需）
        const newHtml = html.replace(new RegExp(SEARCH, 'g'), REPLACE);
        if (newHtml !== html) {
            document.body.innerHTML = newHtml;
            replaceCount++;
            console.log(`[替换脚本] 已执行第 ${replaceCount} 次替换，将"${SEARCH}"替换为"${REPLACE}"`);
        }
    }

    // ---------- 首次执行 ----------
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', doReplace);
    } else {
        doReplace();
    }

    // ---------- 定时重试（每 500ms 执行一次，持续 10 秒） ----------
    let timer = setInterval(() => {
        doReplace();
        if (replaceCount > 20) { // 大约 10 秒后停止
            clearInterval(timer);
            console.log('[替换脚本] 定时重试已停止');
        }
    }, 500);

    // ---------- MutationObserver 监听新增内容 ----------
    // 注意：因为使用 innerHTML 会触发 MutationObserver 自身，需防递归
    let isObserving = false;
    const observer = new MutationObserver(() => {
        if (isObserving) return;
        isObserving = true;
        // 延迟执行，避免循环
        setTimeout(() => {
            doReplace();
            isObserving = false;
        }, 50);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // ---------- 页面完全加载后额外执行几次 ----------
    window.addEventListener('load', function() {
        setTimeout(doReplace, 500);
        setTimeout(doReplace, 1000);
        setTimeout(doReplace, 2000);
        // 清除定时器，因为已经加载完成
        clearInterval(timer);
    });

    // ---------- 暴露手动执行函数到控制台，方便调试 ----------
    window.replaceExecute = doReplace;

    console.log(`[替换脚本] 已启动，将持续替换"${SEARCH}"为"${REPLACE}"`);
})();
