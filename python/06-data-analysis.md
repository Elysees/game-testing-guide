# 06. 测试数据分析

> 使用Pandas和Matplotlib进行数据分析和可视化

---

## Pandas基础

### 数据读取

```python
import pandas as pd

# 读取CSV
df = pd.read_csv('test_results.csv')

# 读取Excel
df = pd.read_excel('test_data.xlsx')

# 读取JSON
df = pd.read_json('api_results.json')

# 查看数据
print(df.head())  # 前5行
print(df.tail())  # 后5行
print(df.info())  # 数据信息
print(df.describe())  # 统计摘要
```

### 数据清洗

```python
# 处理缺失值
df = df.dropna()  # 删除含缺失值的行
df = df.fillna(0)  # 填充缺失值

# 删除重复行
df = df.drop_duplicates()

# 数据类型转换
df['response_time'] = pd.to_numeric(df['response_time'])
df['timestamp'] = pd.to_datetime(df['timestamp'])

# 过滤数据
success_only = df[df['status'] == 'success']
slow_requests = df[df['response_time'] > 1000]
```

---

## 性能数据分析

### 分析测试结果

```python
import pandas as pd
import matplotlib.pyplot as plt

class PerformanceAnalyzer:
    """性能测试数据分析器"""
    
    def __init__(self, csv_file):
        self.df = pd.read_csv(csv_file)
        self.df['timestamp'] = pd.to_datetime(self.df['timestamp'])
    
    def basic_stats(self):
        """基础统计"""
        print("=== 性能统计 ===")
        print(f"总请求数: {len(self.df)}")
        print(f"成功率: {(self.df['success']==True).mean()*100:.2f}%")
        print(f"\n响应时间统计:")
        print(self.df['response_time'].describe())
        
        # P95, P99
        p95 = self.df['response_time'].quantile(0.95)
        p99 = self.df['response_time'].quantile(0.99)
        print(f"P95: {p95:.2f}ms")
        print(f"P99: {p99:.2f}ms")
    
    def analyze_by_endpoint(self):
        """按接口分析"""
        grouped = self.df.groupby('endpoint').agg({
            'response_time': ['mean', 'median', 'min', 'max'],
            'success': 'mean'
        })
        print("\n=== 各接口性能 ===")
        print(grouped)
        return grouped
    
    def find_slow_requests(self, threshold=1000):
        """找出慢请求"""
        slow = self.df[self.df['response_time'] > threshold]
        print(f"\n=== 慢请求分析(>{threshold}ms) ===")
        print(f"慢请求数量: {len(slow)}")
        print(f"占比: {len(slow)/len(self.df)*100:.2f}%")
        print("\n慢请求详情:")
        print(slow[['endpoint', 'response_time', 'timestamp']])
        return slow

# 使用示例
analyzer = PerformanceAnalyzer('performance_results.csv')
analyzer.basic_stats()
analyzer.analyze_by_endpoint()
analyzer.find_slow_requests()
```

### 时间序列分析

```python
def analyze_time_series(df):
    """时间序列分析"""
    # 按时间分组
    df['minute'] = df['timestamp'].dt.floor('1min')
    time_stats = df.groupby('minute').agg({
        'response_time': 'mean',
        'success': 'mean'
    })
    
    # 绘制趋势图
    fig, axes = plt.subplots(2, 1, figsize=(12, 8))
    
    # 响应时间趋势
    axes[0].plot(time_stats.index, time_stats['response_time'])
    axes[0].set_title('响应时间趋势')
    axes[0].set_ylabel('响应时间(ms)')
    axes[0].grid(True)
    
    # 成功率趋势
    axes[1].plot(time_stats.index, time_stats['success'] * 100)
    axes[1].set_title('成功率趋势')
    axes[1].set_ylabel('成功率(%)')
    axes[1].grid(True)
    
    plt.tight_layout()
    plt.savefig('time_series.png')
    print("时间序列图已保存")
```

---

## 数据可视化

### Matplotlib基础

```python
import matplotlib.pyplot as plt
import numpy as np

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 基础图表
fig, axes = plt.subplots(2, 2, figsize=(12, 10))

# 1. 折线图
axes[0, 0].plot([1, 2, 3, 4], [10, 20, 15, 25])
axes[0, 0].set_title('响应时间趋势')
axes[0, 0].set_xlabel('时间')
axes[0, 0].set_ylabel('响应时间(ms)')

# 2. 柱状图
endpoints = ['登录', '查询', '更新', '删除']
times = [100, 80, 120, 90]
axes[0, 1].bar(endpoints, times)
axes[0, 1].set_title('各接口响应时间')

# 3. 饼图
labels = ['成功', '失败']
sizes = [95, 5]
axes[1, 0].pie(sizes, labels=labels, autopct='%1.1f%%')
axes[1, 0].set_title('请求成功率')

# 4. 直方图
data = np.random.normal(100, 20, 1000)
axes[1, 1].hist(data, bins=30)
axes[1, 1].set_title('响应时间分布')

plt.tight_layout()
plt.savefig('performance_dashboard.png')
```

### 性能仪表盘

```python
class PerformanceDashboard:
    """性能数据可视化仪表盘"""
    
    def __init__(self, df):
        self.df = df
        plt.rcParams['font.sans-serif'] = ['SimHei']
    
    def create_dashboard(self, output_file='dashboard.png'):
        """创建完整仪表盘"""
        fig = plt.figure(figsize=(16, 12))
        gs = fig.add_gridspec(3, 3, hspace=0.3, wspace=0.3)
        
        # 1. 响应时间分布
        ax1 = fig.add_subplot(gs[0, :2])
        self.plot_response_time_distribution(ax1)
        
        # 2. 成功率饼图
        ax2 = fig.add_subplot(gs[0, 2])
        self.plot_success_rate_pie(ax2)
        
        # 3. 时间趋势
        ax3 = fig.add_subplot(gs[1, :])
        self.plot_time_trend(ax3)
        
        # 4. 各API对比
        ax4 = fig.add_subplot(gs[2, :2])
        self.plot_endpoint_comparison(ax4)
        
        # 5. Top慢请求
        ax5 = fig.add_subplot(gs[2, 2])
        self.plot_slow_requests(ax5)
        
        plt.savefig(output_file, dpi=150, bbox_inches='tight')
        print(f"仪表盘已保存: {output_file}")
    
    def plot_response_time_distribution(self, ax):
        """响应时间分布直方图"""
        ax.hist(self.df['response_time'], bins=50, edgecolor='black')
        ax.set_title('响应时间分布', fontsize=14, fontweight='bold')
        ax.set_xlabel('响应时间(ms)')
        ax.set_ylabel('请求数量')
        ax.axvline(self.df['response_time'].mean(), 
                   color='red', linestyle='--', label='平均值')
        ax.legend()
    
    def plot_success_rate_pie(self, ax):
        """成功率饼图"""
        success_count = (self.df['success'] == True).sum()
        fail_count = len(self.df) - success_count
        
        ax.pie([success_count, fail_count], 
               labels=['成功', '失败'],
               autopct='%1.1f%%',
               colors=['#2ecc71', '#e74c3c'])
        ax.set_title('请求成功率', fontsize=14, fontweight='bold')
    
    def plot_time_trend(self, ax):
        """时间趋势图"""
        self.df['minute'] = pd.to_datetime(self.df['timestamp']).dt.floor('1min')
        trend = self.df.groupby('minute')['response_time'].mean()
        
        ax.plot(trend.index, trend.values, linewidth=2)
        ax.fill_between(trend.index, trend.values, alpha=0.3)
        ax.set_title('响应时间趋势', fontsize=14, fontweight='bold')
        ax.set_xlabel('时间')
        ax.set_ylabel('平均响应时间(ms)')
        ax.grid(True, alpha=0.3)
    
    def plot_endpoint_comparison(self, ax):
        """各API性能对比"""
        grouped = self.df.groupby('endpoint')['response_time'].agg(['mean', 'median'])
        
        x = np.arange(len(grouped))
        width = 0.35
        
        ax.bar(x - width/2, grouped['mean'], width, label='平均值')
        ax.bar(x + width/2, grouped['median'], width, label='中位数')
        
        ax.set_title('各API响应时间对比', fontsize=14, fontweight='bold')
        ax.set_xlabel('API接口')
        ax.set_ylabel('响应时间(ms)')
        ax.set_xticks(x)
        ax.set_xticklabels(grouped.index, rotation=45, ha='right')
        ax.legend()
    
    def plot_slow_requests(self, ax):
        """慢请求TOP10"""
        slow = self.df.nlargest(10, 'response_time')
        
        ax.barh(range(len(slow)), slow['response_time'])
        ax.set_yticks(range(len(slow)))
        ax.set_yticklabels(slow['endpoint'], fontsize=8)
        ax.set_title('TOP10慢请求', fontsize=14, fontweight='bold')
        ax.set_xlabel('响应时间(ms)')
        ax.invert_yaxis()

# 使用示例
df = pd.read_csv('performance_results.csv')
dashboard = PerformanceDashboard(df)
dashboard.create_dashboard()
```

---

## 测试报告生成

### HTML报告生成器

```python
import pandas as pd
from jinja2 import Template

class TestReportGenerator:
    """测试报告生成器"""
    
    HTML_TEMPLATE = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>性能测试报告</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #2c3e50; }
            h2 { color: #34495e; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
            table { border-collapse: collapse; width: 100%; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #3498db; color: white; }
            tr:nth-child(even) { background-color: #f2f2f2; }
            .success { color: #27ae60; font-weight: bold; }
            .fail { color: #e74c3c; font-weight: bold; }
            .chart { margin: 20px 0; text-align: center; }
            .summary { background: #ecf0f1; padding: 20px; border-radius: 5px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <h1>{{ title }}</h1>
        <p>测试时间: {{ test_time }}</p>
        
        <div class="summary">
            <h2>测试摘要</h2>
            <p>总请求数: {{ total_requests }}</p>
            <p>成功率: <span class="{{ 'success' if success_rate > 95 else 'fail' }}">{{ success_rate }}%</span></p>
            <p>平均响应时间: {{ avg_response_time }}ms</p>
            <p>P95响应时间: {{ p95_response_time }}ms</p>
        </div>
        
        <h2>详细统计</h2>
        {{ stats_table }}
        
        <h2>性能图表</h2>
        <div class="chart">
            <img src="dashboard.png" style="max-width: 100%;">
        </div>
        
        <h2>慢请求列表</h2>
        {{ slow_requests_table }}
    </body>
    </html>
    """
    
    def __init__(self, df):
        self.df = df
    
    def generate(self, output_file='test_report.html'):
        """生成报告"""
        from datetime import datetime
        
        # 计算统计数据
        total_requests = len(self.df)
        success_rate = (self.df['success'] == True).mean() * 100
        avg_response_time = self.df['response_time'].mean()
        p95_response_time = self.df['response_time'].quantile(0.95)
        
        # 按API统计
        stats = self.df.groupby('endpoint').agg({
            'response_time': ['mean', 'median', 'max'],
            'success': lambda x: (x == True).mean() * 100
        }).round(2)
        
        # 慢请求
        slow_requests = self.df.nlargest(20, 'response_time')
        
        # 渲染模板
        template = Template(self.HTML_TEMPLATE)
        html = template.render(
            title='游戏性能测试报告',
            test_time=datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            total_requests=total_requests,
            success_rate=f'{success_rate:.2f}',
            avg_response_time=f'{avg_response_time:.2f}',
            p95_response_time=f'{p95_response_time:.2f}',
            stats_table=stats.to_html(classes='stats-table'),
            slow_requests_table=slow_requests[['endpoint', 'response_time', 'timestamp']].to_html()
        )
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(html)
        
        print(f"报告已生成: {output_file}")
```

---

## 实战案例

### 游戏登录性能分析

```python
import pandas as pd
import matplotlib.pyplot as plt

# 读取测试数据
df = pd.read_csv('login_test_results.csv')
df['timestamp'] = pd.to_datetime(df['timestamp'])

# 基础统计
print("=== 登录性能分析 ===")
print(f"总登录次数: {len(df)}")
print(f"成功登录: {(df['success']==True).sum()}")
print(f"成功率: {(df['success']==True).mean()*100:.2f}%")

# 响应时间分析
print(f"\n响应时间统计:")
print(df['response_time'].describe())

# 找出慢登录
slow_logins = df[df['response_time'] > 2000]
print(f"\n慢登录(>2s): {len(slow_logins)}次")

# 按时段分析
df['hour'] = df['timestamp'].dt.hour
hourly_stats = df.groupby('hour').agg({
    'response_time': 'mean',
    'success': lambda x: (x==True).mean()
})

# 可视化
fig, axes = plt.subplots(1, 2, figsize=(14, 5))

# 响应时间分布
axes[0].hist(df['response_time'], bins=50)
axes[0].set_title('登录响应时间分布')
axes[0].set_xlabel('响应时间(ms)')
axes[0].set_ylabel('次数')

# 按小时统计
axes[1].plot(hourly_stats.index, hourly_stats['response_time'])
axes[1].set_title('各时段平均登录时间')
axes[1].set_xlabel('小时')
axes[1].set_ylabel('平均响应时间(ms)')
axes[1].grid(True)

plt.tight_layout()
plt.savefig('login_analysis.png')
```

---

## 数据对比

### AB测试对比

```python
def compare_ab_tests(file_a, file_b):
    """对比AB测试结果"""
    df_a = pd.read_csv(file_a)
    df_b = pd.read_csv(file_b)
    
    print("=== AB测试对比 ===")
    print(f"\n版本A:")
    print(f"  平均响应时间: {df_a['response_time'].mean():.2f}ms")
    print(f"  P95: {df_a['response_time'].quantile(0.95):.2f}ms")
    print(f"  成功率: {(df_a['success']==True).mean()*100:.2f}%")
    
    print(f"\n版本B:")
    print(f"  平均响应时间: {df_b['response_time'].mean():.2f}ms")
    print(f"  P95: {df_b['response_time'].quantile(0.95):.2f}ms")
    print(f"  成功率: {(df_b['success']==True).mean()*100:.2f}%")
    
    # 可视化对比
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))
    
    # 响应时间对比
    axes[0].hist(df_a['response_time'], alpha=0.5, label='版本A', bins=30)
    axes[0].hist(df_b['response_time'], alpha=0.5, label='版本B', bins=30)
    axes[0].set_title('响应时间分布对比')
    axes[0].legend()
    
    # 箱型图对比
    axes[1].boxplot([df_a['response_time'], df_b['response_time']], 
                    labels=['版本A', '版本B'])
    axes[1].set_title('响应时间箱型图')
    axes[1].set_ylabel('响应时间(ms)')
    
    plt.tight_layout()
    plt.savefig('ab_comparison.png')
```

---

## 下一步

继续学习:
- [07. 实战项目](07-real-projects.md)
- [08. 最佳实践](08-best-practices.md)
- [10. 面试题](10-interview-questions.md)
