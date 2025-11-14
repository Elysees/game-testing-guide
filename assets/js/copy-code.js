/**
 * 代码复制功能
 * 为所有代码块添加复制按钮和复制功能
 */

class CodeCopyManager {
    constructor() {
        this.copiedTimeout = null;
        this.init();
    }

    init() {
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupCodeBlocks();
            });
        } else {
            this.setupCodeBlocks();
        }

        // 监听动态添加的代码块
        this.observeCodeBlocks();
    }

    setupCodeBlocks() {
        const codeBlocks = document.querySelectorAll('pre code, .highlight code, .language-code');
        
        codeBlocks.forEach((codeBlock, index) => {
            this.addCopyButton(codeBlock, index);
        });

        // 处理没有code标签的pre元素
        const preBlocks = document.querySelectorAll('pre:not(:has(code))');
        preBlocks.forEach((preBlock, index) => {
            this.addCopyButton(preBlock, index + 1000);
        });
    }

    addCopyButton(codeElement, index) {
        // 避免重复添加
        if (codeElement.parentNode.querySelector('.copy-code-btn')) {
            return;
        }

        const container = codeElement.closest('pre') || codeElement.parentNode;
        if (!container) return;

        // 确保容器有相对定位
        if (getComputedStyle(container).position === 'static') {
            container.style.position = 'relative';
        }

        // 创建复制按钮
        const copyButton = this.createCopyButton(index);
        
        // 添加事件监听器
        copyButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.copyCode(codeElement, copyButton);
        });

        // 添加键盘支持
        copyButton.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.copyCode(codeElement, copyButton);
            }
        });

        // 添加到容器
        container.appendChild(copyButton);

        // 添加hover效果
        this.setupHoverEffects(container, copyButton);
    }

    createCopyButton(index) {
        const button = document.createElement('button');
        button.className = 'copy-code-btn';
        button.type = 'button';
        button.setAttribute('aria-label', '复制代码');
        button.setAttribute('data-code-id', index);
        button.title = '复制代码';
        
        // 添加图标和文本
        button.innerHTML = `
            <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span class="copy-text">复制</span>
        `;

        return button;
    }

    setupHoverEffects(container, button) {
        // 鼠标悬停显示按钮
        container.addEventListener('mouseenter', () => {
            button.style.opacity = '1';
            button.style.visibility = 'visible';
        });

        container.addEventListener('mouseleave', () => {
            if (!button.classList.contains('copied')) {
                button.style.opacity = '0.7';
                button.style.visibility = 'visible';
            }
        });

        // 初始状态
        button.style.opacity = '0.7';
        button.style.visibility = 'visible';
    }

    async copyCode(codeElement, button) {
        try {
            // 获取代码文本
            const codeText = this.extractCodeText(codeElement);
            
            // 复制到剪贴板
            await this.copyToClipboard(codeText);
            
            // 更新按钮状态
            this.showCopySuccess(button);
            
            // 触发复制事件
            this.dispatchCopyEvent(codeText, codeElement);
            
        } catch (error) {
            console.error('复制失败:', error);
            this.showCopyError(button);
        }
    }

    extractCodeText(codeElement) {
        // 克隆元素以避免修改原始内容
        const clone = codeElement.cloneNode(true);
        
        // 移除行号（如果存在）
        const lineNumbers = clone.querySelectorAll('.line-number, .lineno');
        lineNumbers.forEach(lineNum => lineNum.remove());
        
        // 移除复制按钮
        const copyButtons = clone.querySelectorAll('.copy-code-btn');
        copyButtons.forEach(btn => btn.remove());
        
        // 处理语法高亮的span标签，保留文本内容
        let text = clone.textContent || clone.innerText || '';
        
        // 清理文本
        text = text
            .replace(/^\s*\n/, '') // 移除开头的空行
            .replace(/\n\s*$/, '') // 移除结尾的空行
            .replace(/\t/g, '    '); // 将tab转换为4个空格
        
        return text;
    }

    async copyToClipboard(text) {
        // 优先使用现代API
        if (navigator.clipboard && window.isSecureContext) {
            try {
                await navigator.clipboard.writeText(text);
                return;
            } catch (error) {
                console.warn('Clipboard API失败，使用fallback方法:', error);
            }
        }
        
        // Fallback方法
        return this.fallbackCopyToClipboard(text);
    }

    fallbackCopyToClipboard(text) {
        return new Promise((resolve, reject) => {
            // 创建临时textarea
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            textArea.setAttribute('readonly', '');
            textArea.setAttribute('aria-hidden', 'true');
            
            document.body.appendChild(textArea);
            
            try {
                // 选择文本
                textArea.focus();
                textArea.select();
                textArea.setSelectionRange(0, text.length);
                
                // 执行复制命令
                const successful = document.execCommand('copy');
                
                if (successful) {
                    resolve();
                } else {
                    reject(new Error('execCommand复制失败'));
                }
            } catch (error) {
                reject(error);
            } finally {
                document.body.removeChild(textArea);
            }
        });
    }

    showCopySuccess(button) {
        // 清除之前的超时
        if (this.copiedTimeout) {
            clearTimeout(this.copiedTimeout);
        }

        // 更新按钮状态
        button.classList.add('copied');
        const copyText = button.querySelector('.copy-text');
        const copyIcon = button.querySelector('.copy-icon');
        
        if (copyText) {
            copyText.textContent = '已复制!';
        }
        
        if (copyIcon) {
            copyIcon.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
            `;
        }

        // 2秒后恢复原状
        this.copiedTimeout = setTimeout(() => {
            button.classList.remove('copied');
            
            if (copyText) {
                copyText.textContent = '复制';
            }
            
            if (copyIcon) {
                copyIcon.innerHTML = `
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                `;
            }
        }, 2000);
    }

    showCopyError(button) {
        const copyText = button.querySelector('.copy-text');
        const originalText = copyText ? copyText.textContent : '复制';
        
        if (copyText) {
            copyText.textContent = '复制失败';
        }
        
        button.classList.add('error');
        
        setTimeout(() => {
            button.classList.remove('error');
            if (copyText) {
                copyText.textContent = originalText;
            }
        }, 2000);
    }

    dispatchCopyEvent(text, codeElement) {
        const event = new CustomEvent('code-copied', {
            detail: {
                text: text,
                element: codeElement,
                timestamp: new Date().toISOString()
            },
            bubbles: true
        });
        
        document.dispatchEvent(event);
    }

    observeCodeBlocks() {
        // 使用MutationObserver监听动态添加的代码块
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // 检查新添加的代码块
                        const codeBlocks = node.querySelectorAll('pre code, .highlight code, .language-code');
                        codeBlocks.forEach((codeBlock, index) => {
                            this.addCopyButton(codeBlock, Date.now() + index);
                        });
                        
                        // 检查节点本身是否是代码块
                        if (node.matches('pre code, .highlight code, .language-code')) {
                            this.addCopyButton(node, Date.now());
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // 公共API方法
    refreshCodeBlocks() {
        // 重新扫描并设置所有代码块
        this.setupCodeBlocks();
    }

    removeAllCopyButtons() {
        const copyButtons = document.querySelectorAll('.copy-code-btn');
        copyButtons.forEach(button => {
            if (button.parentNode) {
                button.parentNode.removeChild(button);
            }
        });
    }

    getCopyStats() {
        // 返回复制统计信息（如果需要的话）
        return {
            totalCodeBlocks: document.querySelectorAll('pre code, .highlight code').length,
            buttonsAdded: document.querySelectorAll('.copy-code-btn').length
        };
    }
}

// 添加必要的CSS样式（如果不存在）
function addCopyButtonStyles() {
    const styleId = 'copy-code-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        .copy-code-btn {
            position: absolute;
            top: 8px;
            right: 8px;
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid rgba(0, 0, 0, 0.1);
            border-radius: 4px;
            padding: 6px 10px;
            font-size: 12px;
            font-family: inherit;
            color: #333;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 4px;
            z-index: 10;
            opacity: 0.7;
            backdrop-filter: blur(4px);
        }
        
        .copy-code-btn:hover {
            background: rgba(255, 255, 255, 0.95);
            opacity: 1;
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
        
        .copy-code-btn:active {
            transform: translateY(0);
        }
        
        .copy-code-btn.copied {
            background: rgba(40, 167, 69, 0.9);
            color: white;
            border-color: rgba(40, 167, 69, 0.3);
        }
        
        .copy-code-btn.error {
            background: rgba(220, 53, 69, 0.9);
            color: white;
            border-color: rgba(220, 53, 69, 0.3);
        }
        
        .copy-code-btn .copy-icon {
            flex-shrink: 0;
        }
        
        .copy-code-btn .copy-text {
            white-space: nowrap;
        }
        
        /* 响应式设计 */
        @media (max-width: 768px) {
            .copy-code-btn {
                padding: 4px 6px;
                font-size: 11px;
            }
            
            .copy-code-btn .copy-text {
                display: none;
            }
        }
        
        /* 暗色主题适配 */
        @media (prefers-color-scheme: dark) {
            .copy-code-btn {
                background: rgba(33, 37, 41, 0.9);
                color: #f8f9fa;
                border-color: rgba(255, 255, 255, 0.1);
            }
            
            .copy-code-btn:hover {
                background: rgba(33, 37, 41, 0.95);
            }
        }
        
        /* 高对比度模式 */
        @media (prefers-contrast: high) {
            .copy-code-btn {
                background: white;
                color: black;
                border: 2px solid black;
            }
            
            .copy-code-btn:hover {
                background: black;
                color: white;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    addCopyButtonStyles();
    const codeCopyManager = new CodeCopyManager();
    
    // 全局访问
    window.codeCopyManager = codeCopyManager;
});

// 如果DOM已经加载完成
if (document.readyState !== 'loading') {
    addCopyButtonStyles();
    const codeCopyManager = new CodeCopyManager();
    window.codeCopyManager = codeCopyManager;
}