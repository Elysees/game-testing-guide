/**
 * 学习进度跟踪功能
 * 使用localStorage保存用户的学习进度
 */

class ProgressTracker {
    constructor() {
        this.storageKey = 'game-guide-progress';
        this.progress = this.loadProgress();
        this.totalChapters = this.calculateTotalChapters();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateUI();
        this.initializeCompleteButton();
        this.updateProgressStats();
    }

    loadProgress() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.error('加载进度数据失败:', error);
            return {};
        }
    }

    saveProgress() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.progress));
        } catch (error) {
            console.error('保存进度数据失败:', error);
        }
    }

    calculateTotalChapters() {
        // Python: 10章节 (01-10)
        // C#: 11章节 (01-12, 跳过08)
        return {
            python: 10,
            csharp: 11,
            total: 21
        };
    }

    setupEventListeners() {
        // 监听页面加载完成
        document.addEventListener('DOMContentLoaded', () => {
            this.updateUI();
            this.updateProgressStats();
        });

        // 监听存储变化（多标签页同步）
        window.addEventListener('storage', (e) => {
            if (e.key === this.storageKey) {
                this.progress = this.loadProgress();
                this.updateUI();
                this.updateProgressStats();
            }
        });
    }

    initializeCompleteButton() {
        const completeBtn = document.getElementById('completeBtn');
        if (!completeBtn) return;

        const chapterPath = completeBtn.getAttribute('data-chapter');
        if (!chapterPath) return;

        // 设置按钮初始状态
        this.updateCompleteButton(completeBtn, chapterPath);

        // 添加点击事件
        completeBtn.addEventListener('click', () => {
            this.toggleChapterCompletion(chapterPath, completeBtn);
        });
    }

    toggleChapterCompletion(chapterPath, button) {
        const isCompleted = this.isChapterCompleted(chapterPath);
        
        if (isCompleted) {
            this.markChapterIncomplete(chapterPath);
        } else {
            this.markChapterComplete(chapterPath);
        }
        
        this.updateCompleteButton(button, chapterPath);
        this.updateUI();
        this.updateProgressStats();
        this.showProgressNotification(chapterPath, !isCompleted);
    }

    markChapterComplete(chapterPath) {
        this.progress[chapterPath] = {
            completed: true,
            timestamp: new Date().toISOString(),
            readingTime: this.calculateReadingTime()
        };
        
        this.saveProgress();
        
        // 触发完成事件
        this.dispatchProgressEvent('chapter-completed', {
            chapter: chapterPath,
            progress: this.getProgressStats()
        });
    }

    markChapterIncomplete(chapterPath) {
        if (this.progress[chapterPath]) {
            this.progress[chapterPath].completed = false;
            this.progress[chapterPath].timestamp = new Date().toISOString();
        }
        
        this.saveProgress();
        
        // 触发事件
        this.dispatchProgressEvent('chapter-uncompleted', {
            chapter: chapterPath,
            progress: this.getProgressStats()
        });
    }

    isChapterCompleted(chapterPath) {
        return this.progress[chapterPath]?.completed === true;
    }

    updateCompleteButton(button, chapterPath) {
        if (!button) return;

        const isCompleted = this.isChapterCompleted(chapterPath);
        const icon = button.querySelector('i');
        
        if (isCompleted) {
            button.classList.add('completed');
            button.innerHTML = '<i class="fas fa-check-circle"></i> 已完成';
            button.title = '点击标记为未完成';
        } else {
            button.classList.remove('completed');
            button.innerHTML = '<i class="fas fa-check"></i> 标记为已完成';
            button.title = '点击标记为已完成';
        }
    }

    updateUI() {
        // 更新章节链接状态
        const chapterLinks = document.querySelectorAll('.chapter-link');
        chapterLinks.forEach(link => {
            const chapterPath = link.getAttribute('data-chapter');
            if (chapterPath && this.isChapterCompleted(chapterPath)) {
                link.classList.add('completed');
            } else {
                link.classList.remove('completed');
            }
        });

        // 更新进度条
        this.updateProgressBar();
    }

    updateProgressStats() {
        const stats = this.getProgressStats();
        
        // 更新总体进度
        const completedElement = document.getElementById('completedChapters');
        const totalElement = document.getElementById('totalChapters');
        const progressFill = document.getElementById('progressFill');
        
        if (completedElement) {
            completedElement.textContent = stats.completed;
        }
        
        if (totalElement) {
            totalElement.textContent = stats.total;
        }
        
        if (progressFill) {
            const percentage = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
            progressFill.style.width = `${percentage}%`;
        }

        // 更新分类进度
        this.updateCategoryProgress('python', stats.python);
        this.updateCategoryProgress('csharp', stats.csharp);
    }

    updateCategoryProgress(category, stats) {
        const completedElement = document.getElementById(`${category}Completed`);
        const totalElement = document.getElementById(`${category}Total`);
        const progressElement = document.getElementById(`${category}Progress`);
        
        if (completedElement) {
            completedElement.textContent = stats.completed;
        }
        
        if (totalElement) {
            totalElement.textContent = stats.total;
        }
        
        if (progressElement) {
            const percentage = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
            progressElement.style.width = `${percentage}%`;
        }
    }

    updateProgressBar() {
        const progressBars = document.querySelectorAll('.progress-fill');
        const stats = this.getProgressStats();
        
        progressBars.forEach(bar => {
            const category = bar.getAttribute('data-category');
            let percentage = 0;
            
            if (category === 'python') {
                percentage = stats.python.total > 0 ? (stats.python.completed / stats.python.total) * 100 : 0;
            } else if (category === 'csharp') {
                percentage = stats.csharp.total > 0 ? (stats.csharp.completed / stats.csharp.total) * 100 : 0;
            } else {
                percentage = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
            }
            
            bar.style.width = `${percentage}%`;
        });
    }

    getProgressStats() {
        const pythonCompleted = this.getCompletedChaptersCount('python');
        const csharpCompleted = this.getCompletedChaptersCount('csharp');
        
        return {
            completed: pythonCompleted + csharpCompleted,
            total: this.totalChapters.total,
            python: {
                completed: pythonCompleted,
                total: this.totalChapters.python
            },
            csharp: {
                completed: csharpCompleted,
                total: this.totalChapters.csharp
            },
            percentage: ((pythonCompleted + csharpCompleted) / this.totalChapters.total) * 100
        };
    }

    getCompletedChaptersCount(category) {
        let count = 0;
        
        Object.keys(this.progress).forEach(chapterPath => {
            if (chapterPath.startsWith(`/${category}/`) && this.progress[chapterPath].completed) {
                count++;
            }
        });
        
        return count;
    }

    calculateReadingTime() {
        // 简单的阅读时间计算（基于页面停留时间）
        const startTime = performance.timing.navigationStart;
        const currentTime = Date.now();
        return Math.round((currentTime - startTime) / 1000); // 秒
    }

    showProgressNotification(chapterPath, completed) {
        const notification = this.createNotification(chapterPath, completed);
        document.body.appendChild(notification);
        
        // 显示动画
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // 自动隐藏
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    createNotification(chapterPath, completed) {
        const notification = document.createElement('div');
        notification.className = 'progress-notification';
        
        const chapterTitle = this.getChapterTitle(chapterPath);
        const stats = this.getProgressStats();
        
        const icon = completed ? 'fas fa-check-circle' : 'fas fa-undo';
        const message = completed ? '章节已完成！' : '已取消完成标记';
        const progressText = `总进度: ${stats.completed}/${stats.total} (${Math.round(stats.percentage)}%)`;
        
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    <i class="${icon}"></i>
                </div>
                <div class="notification-text">
                    <div class="notification-title">${message}</div>
                    <div class="notification-chapter">${chapterTitle}</div>
                    <div class="notification-progress">${progressText}</div>
                </div>
            </div>
        `;
        
        return notification;
    }

    getChapterTitle(chapterPath) {
        const titleMap = {
            '/python/01-basics': '基础知识和环境配置',
            '/python/02-pytest-framework': 'Pytest框架详解',
            '/python/03-selenium-automation': 'Selenium Web自动化',
            '/python/04-appium-mobile': 'Appium移动测试',
            '/python/05-performance-testing': '性能测试',
            '/python/06-data-analysis': '数据分析和报告',
            '/python/07-real-projects': '完整实战项目',
            '/python/08-best-practices': '最佳实践和框架设计',
            '/python/09-common-pitfalls': '常见坑和解决方案',
            '/python/10-interview-questions': '面试题精讲',
            
            '/csharp/01-quick-start': 'C/C++开发者快速入门',
            '/csharp/02-basics': '基础语法详解',
            '/csharp/03-oop': '面向对象编程',
            '/csharp/04-linq': 'LINQ和集合框架',
            '/csharp/05-advanced': '高级特性',
            '/csharp/06-unity-basics': 'Unity基础',
            '/csharp/07-game-development': '游戏开发实战',
            '/csharp/09-best-practices': '最佳实践和性能优化',
            '/csharp/10-common-pitfalls': '常见坑和解决方案',
            '/csharp/11-interview-questions': '面试题精讲',
            '/csharp/12-resources': '学习资源和扩展阅读'
        };
        
        return titleMap[chapterPath] || chapterPath;
    }

    dispatchProgressEvent(eventName, detail) {
        const event = new CustomEvent(eventName, {
            detail: detail,
            bubbles: true
        });
        document.dispatchEvent(event);
    }

    // 公共API方法
    getProgress() {
        return { ...this.progress };
    }

    resetProgress() {
        if (confirm('确定要重置所有学习进度吗？此操作不可撤销。')) {
            this.progress = {};
            this.saveProgress();
            this.updateUI();
            this.updateProgressStats();
            
            this.showProgressNotification('/', false);
        }
    }

    exportProgress() {
        const data = {
            progress: this.progress,
            stats: this.getProgressStats(),
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `game-guide-progress-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    importProgress(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.progress) {
                    this.progress = data.progress;
                    this.saveProgress();
                    this.updateUI();
                    this.updateProgressStats();
                    
                    alert('进度导入成功！');
                }
            } catch (error) {
                console.error('导入进度失败:', error);
                alert('导入失败，请检查文件格式。');
            }
        };
        reader.readAsText(file);
    }
}

// 初始化进度跟踪器
const progressTracker = new ProgressTracker();

// 全局访问
window.progressTracker = progressTracker;