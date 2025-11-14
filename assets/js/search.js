/**
 * 搜索功能实现
 * 使用Lunr.js进行客户端全文搜索
 */

class SearchEngine {
    constructor() {
        this.searchIndex = null;
        this.documents = [];
        this.searchInput = null;
        this.searchResults = null;
        this.isInitialized = false;
        
        this.init();
    }

    async init() {
        this.searchInput = document.getElementById('searchInput');
        if (!this.searchInput) return;

        // 检查 Lunr.js 是否加载
        if (typeof lunr === 'undefined') {
            console.warn('Lunr.js 未加载，搜索功能不可用');
            return;
        }

        this.setupSearchUI();
        await this.loadSearchIndex();
        this.setupEventListeners();
        this.isInitialized = true;
    }

    setupSearchUI() {
        // 创建搜索结果容器
        const searchContainer = this.searchInput.parentElement;
        this.searchResults = document.createElement('div');
        this.searchResults.className = 'search-results';
        this.searchResults.id = 'searchResults';
        searchContainer.appendChild(this.searchResults);
    }

    async loadSearchIndex() {
        try {
            // 生成搜索索引数据
            await this.generateSearchData();
            
            // 保存文档引用，避免作用域问题
            const documents = this.documents;
            
            // 创建Lunr搜索索引
            this.searchIndex = lunr(function () {
                this.ref('id');
                this.field('title', { boost: 10 });
                this.field('content');
                this.field('category', { boost: 5 });
                this.field('tags', { boost: 3 });

                // 添加文档到索引
                documents.forEach((doc) => {
                    this.add(doc);
                });
            });

        } catch (error) {
            console.error('搜索索引加载失败:', error);
        }
    }

    async generateSearchData() {
        // 从页面中提取搜索数据
        const pages = await this.extractPageData();
        this.documents = pages;
    }

    async extractPageData() {
        const pages = [];
        let id = 0;

        // Python指南页面
        const pythonChapters = [
            { url: '/python/00-index', title: '课程目录和导航', category: 'python' },
            { url: '/python/01-basics', title: '基础知识和环境配置', category: 'python' },
            { url: '/python/02-pytest-framework', title: 'Pytest框架详解', category: 'python' },
            { url: '/python/03-selenium-automation', title: 'Selenium Web自动化', category: 'python' },
            { url: '/python/04-appium-mobile', title: 'Appium移动测试', category: 'python' },
            { url: '/python/05-performance-testing', title: '性能测试', category: 'python' },
            { url: '/python/06-data-analysis', title: '数据分析和报告', category: 'python' },
            { url: '/python/07-real-projects', title: '完整实战项目', category: 'python' },
            { url: '/python/08-best-practices', title: '最佳实践和框架设计', category: 'python' },
            { url: '/python/09-common-pitfalls', title: '常见坑和解决方案', category: 'python' },
            { url: '/python/10-interview-questions', title: '面试题精讲', category: 'python' }
        ];

        // C#指南页面
        const csharpChapters = [
            { url: '/csharp/00-index', title: '课程目录和导航', category: 'csharp' },
            { url: '/csharp/01-quick-start', title: 'C/C++开发者快速入门', category: 'csharp' },
            { url: '/csharp/02-basics', title: '基础语法详解', category: 'csharp' },
            { url: '/csharp/03-oop', title: '面向对象编程', category: 'csharp' },
            { url: '/csharp/04-linq', title: 'LINQ和集合框架', category: 'csharp' },
            { url: '/csharp/05-advanced', title: '高级特性', category: 'csharp' },
            { url: '/csharp/06-unity-basics', title: 'Unity基础', category: 'csharp' },
            { url: '/csharp/07-game-development', title: '游戏开发实战', category: 'csharp' },
            { url: '/csharp/09-best-practices', title: '最佳实践和性能优化', category: 'csharp' },
            { url: '/csharp/10-common-pitfalls', title: '常见坑和解决方案', category: 'csharp' },
            { url: '/csharp/11-interview-questions', title: '面试题精讲', category: 'csharp' },
            { url: '/csharp/12-resources', title: '学习资源和扩展阅读', category: 'csharp' }
        ];

        // 合并所有章节
        const allChapters = [...pythonChapters, ...csharpChapters];

        // 为每个章节生成搜索数据
        allChapters.forEach(chapter => {
            const content = this.generateChapterContent(chapter);
            const tags = this.generateTags(chapter);
            
            pages.push({
                id: id++,
                url: chapter.url,
                title: chapter.title,
                content: content,
                category: chapter.category,
                tags: tags.join(' ')
            });
        });

        // 添加首页
        pages.push({
            id: id++,
            url: '/',
            title: '游戏测试开发完全指南',
            content: 'Python游戏测试自动化 C#游戏开发 Unity 自动化测试 性能测试 移动测试 Web测试',
            category: 'home',
            tags: 'python csharp unity 游戏开发 测试 自动化'
        });

        return pages;
    }

    generateChapterContent(chapter) {
        // 根据章节生成相关内容关键词
        const contentMap = {
            'python': {
                '01-basics': 'Python 基础 环境配置 pip virtualenv pytest selenium appium',
                '02-pytest-framework': 'pytest 测试框架 fixture parametrize mock 单元测试',
                '03-selenium-automation': 'selenium webdriver 元素定位 页面对象模型 web自动化',
                '04-appium-mobile': 'appium 移动测试 android ios 手势操作 移动自动化',
                '05-performance-testing': 'locust 性能测试 压力测试 负载测试 监控',
                '06-data-analysis': 'pandas matplotlib 数据分析 可视化 报告生成',
                '07-real-projects': '实战项目 完整案例 框架设计 最佳实践',
                '08-best-practices': '最佳实践 代码规范 框架设计 CI/CD',
                '09-common-pitfalls': '常见问题 解决方案 调试技巧 错误处理',
                '10-interview-questions': '面试题 技术面试 算法 系统设计'
            },
            'csharp': {
                '01-quick-start': 'C# 快速入门 Visual Studio 开发环境',
                '02-basics': 'C# 基础语法 数据类型 控制流 方法',
                '03-oop': '面向对象 类 继承 多态 封装 接口',
                '04-linq': 'LINQ 集合 查询 Lambda表达式',
                '05-advanced': '高级特性 委托 事件 异步编程 泛型',
                '06-unity-basics': 'Unity 游戏引擎 MonoBehaviour 组件系统',
                '07-game-development': '游戏开发 Unity 3D 2D 物理系统 动画',
                '09-best-practices': '最佳实践 性能优化 代码规范 设计模式',
                '10-common-pitfalls': '常见问题 调试 内存管理 性能优化',
                '11-interview-questions': '面试题 C# Unity 游戏开发 算法',
                '12-resources': '学习资源 文档 教程 社区'
            }
        };

        const categoryContent = contentMap[chapter.category];
        const chapterKey = chapter.url.split('/').pop();
        
        return categoryContent && categoryContent[chapterKey] 
            ? categoryContent[chapterKey] 
            : chapter.title;
    }

    generateTags(chapter) {
        const tagMap = {
            'python': ['python', '测试', '自动化', 'pytest', 'selenium', 'appium'],
            'csharp': ['csharp', '游戏开发', 'unity', '面向对象', 'dotnet']
        };

        return tagMap[chapter.category] || [];
    }

    setupEventListeners() {
        if (!this.searchInput) return;

        // 输入事件
        this.searchInput.addEventListener('input', this.debounce((e) => {
            const query = e.target.value.trim();
            if (query.length >= 2) {
                this.performSearch(query);
            } else {
                this.hideSearchResults();
            }
        }, 300));

        // 焦点事件
        this.searchInput.addEventListener('focus', () => {
            const query = this.searchInput.value.trim();
            if (query.length >= 2) {
                this.showSearchResults();
            }
        });

        // 失去焦点事件（延迟隐藏，允许点击结果）
        this.searchInput.addEventListener('blur', () => {
            setTimeout(() => {
                this.hideSearchResults();
            }, 200);
        });

        // 键盘导航
        this.searchInput.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });

        // 点击外部关闭
        document.addEventListener('click', (e) => {
            if (!this.searchInput.contains(e.target) && !this.searchResults.contains(e.target)) {
                this.hideSearchResults();
            }
        });
    }

    performSearch(query) {
        if (!this.searchIndex || !this.isInitialized) {
            console.warn('搜索索引未初始化');
            return;
        }

        try {
            // 执行搜索
            const results = this.searchIndex.search(query);
            
            // 限制结果数量
            const limitedResults = results.slice(0, 8);
            
            // 显示结果
            this.displaySearchResults(limitedResults, query);
            
        } catch (error) {
            console.error('搜索执行失败:', error);
            this.displayNoResults();
        }
    }

    displaySearchResults(results, query) {
        if (!this.searchResults) return;

        if (results.length === 0) {
            this.displayNoResults();
            return;
        }

        const resultsHTML = results.map(result => {
            const doc = this.documents.find(d => d.id === parseInt(result.ref));
            if (!doc) return '';

            const highlightedTitle = this.highlightText(doc.title, query);
            const excerpt = this.generateExcerpt(doc.content, query);
            const categoryLabel = doc.category === 'python' ? 'Python指南' : 
                                 doc.category === 'csharp' ? 'C#指南' : '首页';

            return `
                <div class="search-result-item" data-url="${doc.url}">
                    <div class="search-result-category">${categoryLabel}</div>
                    <div class="search-result-title">${highlightedTitle}</div>
                    <div class="search-result-excerpt">${excerpt}</div>
                </div>
            `;
        }).join('');

        this.searchResults.innerHTML = resultsHTML;
        this.showSearchResults();
        this.setupResultClickHandlers();
    }

    displayNoResults() {
        if (!this.searchResults) return;

        this.searchResults.innerHTML = `
            <div class="search-no-results">
                <i class="fas fa-search"></i>
                <p>未找到相关内容</p>
                <small>尝试使用不同的关键词</small>
            </div>
        `;
        this.showSearchResults();
    }

    highlightText(text, query) {
        if (!query) return text;
        
        const regex = new RegExp(`(${this.escapeRegExp(query)})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    generateExcerpt(content, query, maxLength = 120) {
        if (!query) return content.substring(0, maxLength) + '...';

        const queryIndex = content.toLowerCase().indexOf(query.toLowerCase());
        if (queryIndex === -1) {
            return content.substring(0, maxLength) + '...';
        }

        const start = Math.max(0, queryIndex - 30);
        const end = Math.min(content.length, queryIndex + query.length + 60);
        
        let excerpt = content.substring(start, end);
        if (start > 0) excerpt = '...' + excerpt;
        if (end < content.length) excerpt = excerpt + '...';

        return this.highlightText(excerpt, query);
    }

    setupResultClickHandlers() {
        const resultItems = this.searchResults.querySelectorAll('.search-result-item');
        
        resultItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                const url = item.getAttribute('data-url');
                if (url) {
                    window.location.href = url;
                }
            });

            // 添加索引用于键盘导航
            item.setAttribute('data-index', index);
        });
    }

    showSearchResults() {
        if (this.searchResults) {
            this.searchResults.classList.add('show');
        }
    }

    hideSearchResults() {
        if (this.searchResults) {
            this.searchResults.classList.remove('show');
        }
    }

    handleKeyboardNavigation(e) {
        const results = this.searchResults.querySelectorAll('.search-result-item');
        if (results.length === 0) return;

        let currentIndex = -1;
        const activeResult = this.searchResults.querySelector('.search-result-item.active');
        if (activeResult) {
            currentIndex = parseInt(activeResult.getAttribute('data-index'));
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                currentIndex = Math.min(currentIndex + 1, results.length - 1);
                this.highlightResult(results, currentIndex);
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                currentIndex = Math.max(currentIndex - 1, 0);
                this.highlightResult(results, currentIndex);
                break;
                
            case 'Enter':
                e.preventDefault();
                if (activeResult) {
                    activeResult.click();
                }
                break;
                
            case 'Escape':
                e.preventDefault();
                this.hideSearchResults();
                this.searchInput.blur();
                break;
        }
    }

    highlightResult(results, index) {
        // 移除所有高亮
        results.forEach(result => result.classList.remove('active'));
        
        // 高亮当前项
        if (results[index]) {
            results[index].classList.add('active');
            results[index].scrollIntoView({ block: 'nearest' });
        }
    }

    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Lunr.js 简化版实现（如果CDN不可用）
if (typeof lunr === 'undefined') {
    window.lunr = function(config) {
        const index = {
            documents: [],
            search: function(query) {
                const results = [];
                const queryLower = query.toLowerCase();
                
                this.documents.forEach((doc, index) => {
                    let score = 0;
                    const titleLower = doc.title.toLowerCase();
                    const contentLower = doc.content.toLowerCase();
                    
                    // 标题匹配得分更高
                    if (titleLower.includes(queryLower)) {
                        score += 10;
                    }
                    
                    // 内容匹配
                    if (contentLower.includes(queryLower)) {
                        score += 1;
                    }
                    
                    // 分类匹配
                    if (doc.category && doc.category.toLowerCase().includes(queryLower)) {
                        score += 5;
                    }
                    
                    if (score > 0) {
                        results.push({
                            ref: doc.id.toString(),
                            score: score
                        });
                    }
                });
                
                // 按分数排序
                return results.sort((a, b) => b.score - a.score);
            }
        };
        
        const builder = {
            ref: function(field) { this.refField = field; },
            field: function(field, options) { /* 简化实现 */ },
            add: function(doc) { index.documents.push(doc); }
        };
        
        config.call(builder);
        return index;
    };
}

// 初始化搜索引擎
document.addEventListener('DOMContentLoaded', () => {
    new SearchEngine();
});