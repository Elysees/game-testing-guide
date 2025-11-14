/**
 * 现代化代码复制功能
 * 为所有代码块添加美观的复制按钮和交互效果
 */

class CodeCopyManager {
    constructor() {
        this.init();
    }

    init() {
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.addCopyButtons();
                this.addLanguageLabels();
            });
        } else {
            this.addCopyButtons();
            this.addLanguageLabels();
        }
    }

    addCopyButtons() {
        // 查找所有代码块
        const codeBlocks = document.querySelectorAll('pre code, pre');
        
        codeBlocks.forEach((block, index) => {
            // 确保是代码块容器
            const preElement = block.tagName === 'PRE' ? block : block.parentElement;
            
            if (preElement && preElement.tagName === 'PRE') {
                this.addCopyButton(preElement, index);
            }
        });
    }

    addLanguageLabels() {
        // 为代码块添加语言标签
        const codeBlocks = document.querySelectorAll('pre[class*="language-"]');
        
        codeBlocks.forEach(preElement => {
            const className = preElement.className;
            const languageMatch = className.match(/language-(\w+)/);
            
            if (languageMatch) {
                const language = languageMatch[1];
                preElement.setAttribute('data-language', this.getLanguageDisplayName(language));
            }
        });
    }

    getLanguageDisplayName(language) {
        const languageMap = {
            'python': 'Python',
            'py': 'Python',
            'csharp': 'C#',
            'cs': 'C#',
            'javascript': 'JavaScript',
            'js': 'JavaScript',
            'typescript': 'TypeScript',
            'ts': 'TypeScript',
            'html': 'HTML',
            'css': 'CSS',
            'scss': 'SCSS',
            'json': 'JSON',
            'xml': 'XML',
            'yaml': 'YAML',
            'yml': 'YAML',
            'bash': 'Shell',
            'shell': 'Shell',
            'powershell': 'PowerShell',
            'sql': 'SQL',
            'java': 'Java',
            'cpp': 'C++',
            'c': 'C',
            'php': 'PHP',
            'ruby': 'Ruby',
            'go': 'Go',
            'rust': 'Rust',
            'swift': 'Swift',
            'kotlin': 'Kotlin',
            'dart': 'Dart'
        };
        
        return languageMap[language.toLowerCase()] || language.toUpperCase();
    }

    addCopyButton(preElement, index) {
        // 避免重复添加
        if (preElement.querySelector('.copy-code-btn')) {
            return;
        }

        // 创建复制按钮
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-code-btn';
        copyButton.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span>复制</span>
        `;
        copyButton.setAttribute('aria-label', '复制代码');
        copyButton.setAttribute('data-code-index', index);
        copyButton.setAttribute('title', '复制代码到剪贴板');

        // 添加点击事件
        copyButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.copyCode(preElement, copyButton);
        });

        // 添加键盘支持
        copyButton.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.copyCode(preElement, copyButton);
            }
        });

        // 将按钮添加到代码块
        preElement.style.position = 'relative';
        preElement.appendChild(copyButton);

        // 添加悬停效果
        preElement.addEventListener('mouseenter', () => {
            copyButton.style.opacity = '1';
        });

        preElement.addEventListener('mouseleave', () => {
            if (!copyButton.classList.contains('copied')) {
                copyButton.style.opacity = '0';
            }
        });
    }

    async copyCode(preElement, button) {
        try {
            // 获取代码内容
            const codeElement = preElement.querySelector('code') || preElement;
            const codeText = this.getCodeText(codeElement);

            // 复制到剪贴板
            await this.copyToClipboard(codeText);

            // 更新按钮状态
            this.showCopySuccess(button);

            // 添加复制成功的视觉反馈
            this.showCopyFeedback(preElement);

        } catch (error) {
            console.error('复制失败:', error);
            this.showCopyError(button);
        }
    }

    getCodeText(element) {
        // 创建临时元素来获取纯文本
        const tempElement = element.cloneNode(true);
        
        // 移除行号等辅助元素
        const lineNumbers = tempElement.querySelectorAll('.line-numbers-rows');
        lineNumbers.forEach(el => el.remove());
        
        // 移除复制按钮
        const copyButtons = tempElement.querySelectorAll('.copy-code-btn');
        copyButtons.forEach(el => el.remove());
        
        // 获取文本内容并清理
        let text = tempElement.textContent || tempElement.innerText || '';
        
        // 清理多余的空行和空格
        text = text.replace(/^\s*\n/, '').replace(/\n\s*$/, '');
        
        return text;
    }

    async copyToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
            // 现代浏览器的 Clipboard API
            await navigator.clipboard.writeText(text);
        } else {
            // 降级方案
            this.fallbackCopyToClipboard(text);
        }
    }

    fallbackCopyToClipboard(text) {
        // 创建临时文本区域
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
        } catch (error) {
            throw new Error('复制失败');
        } finally {
            document.body.removeChild(textArea);
        }
    }

    showCopySuccess(button) {
        const originalContent = button.innerHTML;
        
        button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
            <span>已复制</span>
        `;
        button.classList.add('copied');
        button.disabled = true;

        // 3秒后恢复
        setTimeout(() => {
            button.innerHTML = originalContent;
            button.classList.remove('copied');
            button.disabled = false;
            button.style.opacity = '0';
        }, 3000);
    }

    showCopyError(button) {
        const originalContent = button.innerHTML;
        
        button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            <span>失败</span>
        `;
        button.classList.add('error');

        // 3秒后恢复
        setTimeout(() => {
            button.innerHTML = originalContent;
            button.classList.remove('error');
        }, 3000);
    }

    showCopyFeedback(preElement) {
        // 创建复制成功的动画反馈
        const feedback = document.createElement('div');
        feedback.className = 'copy-feedback';
        feedback.innerHTML = '✓ 代码已复制到剪贴板';
        
        feedback.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(39, 202, 63, 0.9);
            color: white;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 0.8rem;
            font-weight: 500;
            z-index: 1000;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s ease;
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;
        
        preElement.appendChild(feedback);
        
        // 显示动画
        requestAnimationFrame(() => {
            feedback.style.opacity = '1';
        });
        
        // 1.5秒后移除
        setTimeout(() => {
            feedback.style.opacity = '0';
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.parentNode.removeChild(feedback);
                }
            }, 300);
        }, 1500);
    }
}

// 初始化代码复制功能
new CodeCopyManager();
