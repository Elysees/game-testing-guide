/**
 * 主要JavaScript功能
 * 包含导航、响应式菜单、滚动进度等核心功能
 */

class GameGuideApp {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeComponents();
        this.handleResponsiveNavigation();
        this.setupScrollProgress();
        this.initializeSidebar();
    }

    setupEventListeners() {
        // DOM加载完成后执行
        document.addEventListener('DOMContentLoaded', () => {
            this.onDOMReady();
        });

        // 窗口大小变化
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));

        // 滚动事件
        window.addEventListener('scroll', this.throttle(() => {
            this.handleScroll();
        }, 16));
    }

    onDOMReady() {
        // 初始化所有组件
        this.initializeNavigation();
        this.initializeTableOfContents();
        this.highlightCurrentChapter();
        this.setupKeyboardNavigation();
        
        // 添加加载动画
        document.body.classList.add('loaded');
    }

    initializeComponents() {
        // 初始化各种UI组件
        this.setupTooltips();
        this.setupModals();
        this.setupAnimations();
    }

    // ===== 导航功能 =====
    initializeNavigation() {
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('open');
                navToggle.classList.toggle('active');
                
                // 更新ARIA属性
                const isOpen = navMenu.classList.contains('open');
                navToggle.setAttribute('aria-expanded', isOpen);
                navMenu.setAttribute('aria-hidden', !isOpen);
            });

            // 点击外部关闭菜单
            document.addEventListener('click', (e) => {
                if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                    navMenu.classList.remove('open');
                    navToggle.classList.remove('active');
                    navToggle.setAttribute('aria-expanded', 'false');
                    navMenu.setAttribute('aria-hidden', 'true');
                }
            });
        }
    }

    handleResponsiveNavigation() {
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        
        const handleMediaChange = (e) => {
            const navMenu = document.getElementById('navMenu');
            if (!e.matches && navMenu) {
                // 桌面模式下重置菜单状态
                navMenu.classList.remove('open');
                navMenu.setAttribute('aria-hidden', 'false');
            }
        };

        mediaQuery.addListener(handleMediaChange);
        handleMediaChange(mediaQuery);
    }

    // ===== 侧边栏功能 =====
    initializeSidebar() {
        const sidebar = document.getElementById('sidebar');
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        
        if (!sidebar) return;

        // 侧边栏切换
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }

        // 遮罩点击关闭
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', () => {
                this.closeSidebar();
            });
        }

        // ESC键关闭侧边栏
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && sidebar.classList.contains('open')) {
                this.closeSidebar();
            }
        });

        // 响应式处理
        this.handleSidebarResize();
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        
        if (sidebar && sidebarOverlay) {
            const isOpen = sidebar.classList.contains('open');
            
            if (isOpen) {
                this.closeSidebar();
            } else {
                this.openSidebar();
            }
        }
    }

    openSidebar() {
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        
        if (sidebar && sidebarOverlay) {
            sidebar.classList.add('open');
            sidebarOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        
        if (sidebar && sidebarOverlay) {
            sidebar.classList.remove('open');
            sidebarOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    handleSidebarResize() {
        const mediaQuery = window.matchMedia('(min-width: 1025px)');
        
        const handleChange = (e) => {
            if (e.matches) {
                // 桌面模式下自动关闭移动端侧边栏
                this.closeSidebar();
            }
        };

        mediaQuery.addListener(handleChange);
    }

    // ===== 滚动进度条 =====
    setupScrollProgress() {
        const progressBar = document.getElementById('progressBar');
        if (!progressBar) return;

        this.updateScrollProgress();
    }

    updateScrollProgress() {
        const progressBar = document.getElementById('progressBar');
        if (!progressBar) return;

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / scrollHeight) * 100;
        
        progressBar.style.width = `${Math.min(progress, 100)}%`;
    }

    // ===== 目录生成 =====
    initializeTableOfContents() {
        const tocContent = document.getElementById('tocContent');
        if (!tocContent) return;

        const headings = document.querySelectorAll('.content-body h1, .content-body h2, .content-body h3, .content-body h4');
        if (headings.length === 0) return;

        const tocList = this.generateTOC(headings);
        tocContent.appendChild(tocList);

        // 设置目录点击事件
        this.setupTOCNavigation(tocContent);
    }

    generateTOC(headings) {
        const ul = document.createElement('ul');
        let currentLevel = 1;
        let currentList = ul;
        const listStack = [ul];

        headings.forEach((heading, index) => {
            const level = parseInt(heading.tagName.charAt(1));
            const id = heading.id || `heading-${index}`;
            
            if (!heading.id) {
                heading.id = id;
            }

            // 处理层级
            if (level > currentLevel) {
                for (let i = currentLevel; i < level; i++) {
                    const newUl = document.createElement('ul');
                    const lastLi = currentList.lastElementChild;
                    if (lastLi) {
                        lastLi.appendChild(newUl);
                    } else {
                        currentList.appendChild(newUl);
                    }
                    listStack.push(newUl);
                    currentList = newUl;
                }
            } else if (level < currentLevel) {
                for (let i = currentLevel; i > level; i--) {
                    listStack.pop();
                    currentList = listStack[listStack.length - 1];
                }
            }

            currentLevel = level;

            // 创建目录项
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#${id}`;
            a.textContent = heading.textContent;
            a.className = 'toc-link';
            
            li.appendChild(a);
            currentList.appendChild(li);
        });

        return ul;
    }

    setupTOCNavigation(tocContainer) {
        const links = tocContainer.querySelectorAll('.toc-link');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    this.smoothScrollTo(targetElement);
                    
                    // 更新活动状态
                    links.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            });
        });

        // 滚动时高亮当前章节
        this.setupTOCHighlight(links);
    }

    setupTOCHighlight(links) {
        const headings = Array.from(document.querySelectorAll('.content-body h1, .content-body h2, .content-body h3, .content-body h4'));
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    const activeLink = document.querySelector(`.toc-link[href="#${id}"]`);
                    
                    if (activeLink) {
                        links.forEach(link => link.classList.remove('active'));
                        activeLink.classList.add('active');
                    }
                }
            });
        }, {
            rootMargin: '-20% 0px -70% 0px'
        });

        headings.forEach(heading => {
            if (heading.id) {
                observer.observe(heading);
            }
        });
    }

    // ===== 章节高亮 =====
    highlightCurrentChapter() {
        const currentPath = window.location.pathname;
        const chapterLinks = document.querySelectorAll('.chapter-link');
        
        chapterLinks.forEach(link => {
            const linkPath = new URL(link.href).pathname;
            if (linkPath === currentPath) {
                link.classList.add('active');
                
                // 滚动到当前章节
                setTimeout(() => {
                    link.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }, 100);
            }
        });
    }

    // ===== 键盘导航 =====
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Alt + 左箭头：上一章
            if (e.altKey && e.key === 'ArrowLeft') {
                e.preventDefault();
                const prevLink = document.querySelector('.nav-prev');
                if (prevLink) {
                    window.location.href = prevLink.href;
                }
            }
            
            // Alt + 右箭头：下一章
            if (e.altKey && e.key === 'ArrowRight') {
                e.preventDefault();
                const nextLink = document.querySelector('.nav-next');
                if (nextLink) {
                    window.location.href = nextLink.href;
                }
            }
            
            // Ctrl + K：聚焦搜索
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.getElementById('searchInput');
                if (searchInput) {
                    searchInput.focus();
                }
            }
        });
    }

    // ===== 工具函数 =====
    smoothScrollTo(element, offset = 80) {
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
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

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    handleScroll() {
        this.updateScrollProgress();
    }

    handleResize() {
        // 处理窗口大小变化
        this.handleResponsiveNavigation();
        this.handleSidebarResize();
    }

    // ===== UI组件初始化 =====
    setupTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                this.showTooltip(e.target);
            });
            
            element.addEventListener('mouseleave', (e) => {
                this.hideTooltip(e.target);
            });
        });
    }

    showTooltip(element) {
        const tooltipText = element.getAttribute('data-tooltip');
        if (!tooltipText) return;

        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = tooltipText;
        
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
        
        element._tooltip = tooltip;
    }

    hideTooltip(element) {
        if (element._tooltip) {
            document.body.removeChild(element._tooltip);
            delete element._tooltip;
        }
    }

    setupModals() {
        // 模态框功能（如果需要的话）
        const modalTriggers = document.querySelectorAll('[data-modal]');
        
        modalTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const modalId = trigger.getAttribute('data-modal');
                this.openModal(modalId);
            });
        });
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // ESC键关闭
            const closeHandler = (e) => {
                if (e.key === 'Escape') {
                    this.closeModal(modalId);
                    document.removeEventListener('keydown', closeHandler);
                }
            };
            document.addEventListener('keydown', closeHandler);
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    setupAnimations() {
        // 滚动动画
        const animatedElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        animatedElements.forEach(element => {
            observer.observe(element);
        });
    }
}

// 初始化应用
const app = new GameGuideApp();