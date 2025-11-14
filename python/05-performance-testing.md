# 05. 游戏性能测试

> 性能测试和压力测试完全指南

---

## 性能测试基础

### 核心指标

- **响应时间**: 请求到响应的时间
- **吞吐量(TPS)**: 每秒处理的事务数
- **并发用户数**: 同时在线用户数
- **错误率**: 失败请求的百分比
- **CPU使用率**: 服务器CPU占用
- **内存使用**: 服务器内存占用

---

## Locust压力测试

### 安装和配置

```bash
pip install locust
```

### 基础用法

```python
# locustfile.py
from locust import HttpUser, task, between

class GameUser(HttpUser):
    """游戏用户行为模拟"""
    
    # 用户操作间隔时间
    wait_time = between(1, 3)
    
    def on_start(self):
        """每个用户开始时执行"""
        # 登录
        response = self.client.post('/api/login', json={
            'username': 'test_user',
            'password': 'test123'
        })
        self.token = response.json()['token']
    
    @task(3)  # 权重3,执行频率更高
    def get_player_info(self):
        """获取玩家信息"""
        self.client.get('/api/player/info', headers={
            'Authorization': f'Bearer {self.token}'
        })
    
    @task(2)
    def battle(self):
        """进行战斗"""
        self.client.post('/api/battle/start', json={
            'enemy_id': 1001
        }, headers={
            'Authorization': f'Bearer {self.token}'
        })
    
    @task(1)
    def get_leaderboard(self):
        """查看排行榜"""
        self.client.get('/api/leaderboard')
```

运行测试:
```bash
# Web界面模式
locust -f locustfile.py --host=https://api.game.com

# 无界面模式
locust -f locustfile.py --host=https://api.game.com \
       --users 100 --spawn-rate 10 --run-time 5m --headless
```

### 高级场景

```python
from locust import HttpUser, TaskSet, task, between
import random

class PlayerBehavior(TaskSet):
    """玩家行为集"""
    
    @task(5)
    def browse_shop(self):
        """浏览商店"""
        self.client.get('/api/shop/items')
    
    @task(3)
    def buy_item(self):
        """购买物品"""
        item_id = random.randint(1, 100)
        self.client.post(f'/api/shop/buy/{item_id}')
    
    @task(2)
    def upgrade_weapon(self):
        """升级武器"""
        self.client.post('/api/weapon/upgrade', json={
            'weapon_id': random.randint(1, 10)
        })

class GameUser(HttpUser):
    tasks = [PlayerBehavior]
    wait_time = between(1, 5)
    
    def on_start(self):
        """登录"""
        self.client.post('/api/login', json={
            'username': f'user_{random.randint(1, 10000)}',
            'password': 'test123'
        })
```

### 分布式测试

```bash
# 主节点
locust -f locustfile.py --master --host=https://api.game.com

# 从节点1
locust -f locustfile.py --worker --master-host=192.168.1.100

# 从节点2
locust -f locustfile.py --worker --master-host=192.168.1.100
```

---

## 性能监控

### 响应时间监控

```python
import time
from locust import HttpUser, task, events

# 自定义统计
custom_stats = []

@events.request.add_listener
def on_request(request_type, name, response_time, response_length, exception, **kwargs):
    """记录每个请求"""
    if exception:
        print(f"请求失败: {name} - {exception}")
    else:
        custom_stats.append({
            'name': name,
            'response_time': response_time,
            'timestamp': time.time()
        })

class GameUser(HttpUser):
    @task
    def test_api(self):
        self.client.get('/api/test')

@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    """测试结束后分析数据"""
    if custom_stats:
        import statistics
        times = [s['response_time'] for s in custom_stats]
        print(f"\n性能统计:")
        print(f"平均响应时间: {statistics.mean(times):.2f}ms")
        print(f"中位数: {statistics.median(times):.2f}ms")
        print(f"P95: {sorted(times)[int(len(times)*0.95)]:.2f}ms")
        print(f"P99: {sorted(times)[int(len(times)*0.99)]:.2f}ms")
```

### 实时监控仪表盘

```python
# 使用Grafana + InfluxDB

from locust import HttpUser, task, events
from influxdb import InfluxDBClient

# 连接InfluxDB
client = InfluxDBClient(host='localhost', port=8086, database='locust')

@events.request.add_listener
def on_request(request_type, name, response_time, response_length, exception, **kwargs):
    """发送数据到InfluxDB"""
    json_body = [{
        'measurement': 'api_performance',
        'tags': {
            'request_type': request_type,
            'name': name,
        },
        'fields': {
            'response_time': response_time,
            'response_length': response_length,
            'success': 1 if not exception else 0
        }
    }]
    client.write_points(json_body)
```

---

## Python性能分析

### CPU分析 - cProfile

```python
import cProfile
import pstats

def expensive_function():
    """耗时函数"""
    result = 0
    for i in range(1000000):
        result += i * i
    return result

# 性能分析
profiler = cProfile.Profile()
profiler.enable()

expensive_function()

profiler.disable()

# 查看结果
stats = pstats.Stats(profiler)
stats.sort_stats('cumulative')
stats.print_stats(10)  # 显示前10个最耗时的函数
```

装饰器方式:
```python
import cProfile

@cProfile.profile
def game_logic():
    """游戏逻辑"""
    # ... 游戏代码 ...
    pass
```

### 内存分析 - memory_profiler

```bash
pip install memory-profiler
```

```python
from memory_profiler import profile

@profile
def load_game_data():
    """加载游戏数据"""
    large_list = [i for i in range(1000000)]
    large_dict = {i: i*2 for i in range(100000)}
    return large_list, large_dict

# 运行
python -m memory_profiler script.py
```

### 行级性能分析 - line_profiler

```bash
pip install line-profiler
```

```python
@profile
def calculate_damage(player, enemy):
    """计算伤害"""
    base_damage = player.attack
    defense_reduction = enemy.defense * 0.5
    final_damage = max(1, base_damage - defense_reduction)
    critical = random.random() < player.crit_rate
    if critical:
        final_damage *= 2
    return final_damage

# 运行
kernprof -l -v script.py
```

---

## 数据库性能测试

### SQL查询性能

```python
import time
import psycopg2

def test_query_performance():
    """测试查询性能"""
    conn = psycopg2.connect(
        host="localhost",
        database="game_db",
        user="user",
        password="password"
    )
    cursor = conn.cursor()
    
    # 测试查询
    start_time = time.time()
    cursor.execute("SELECT * FROM players WHERE level > 50")
    results = cursor.fetchall()
    query_time = time.time() - start_time
    
    print(f"查询时间: {query_time:.3f}秒")
    print(f"结果数量: {len(results)}")
    
    cursor.close()
    conn.close()

# 批量插入性能测试
def test_bulk_insert():
    """测试批量插入性能"""
    conn = psycopg2.connect(...)
    cursor = conn.cursor()
    
    data = [(f'player_{i}', i, 100) for i in range(10000)]
    
    start_time = time.time()
    cursor.executemany(
        "INSERT INTO players (name, level, hp) VALUES (%s, %s, %s)",
        data
    )
    conn.commit()
    insert_time = time.time() - start_time
    
    print(f"插入10000条数据耗时: {insert_time:.3f}秒")
    print(f"TPS: {10000/insert_time:.2f}")
```

---

## WebSocket性能测试

```python
import asyncio
import websockets
import time

async def test_websocket_performance():
    """测试WebSocket性能"""
    uri = "ws://game.com/ws"
    
    async with websockets.connect(uri) as websocket:
        # 发送消息
        start_time = time.time()
        
        for i in range(100):
            await websocket.send(f"Message {i}")
            response = await websocket.recv()
        
        duration = time.time() - start_time
        print(f"100次往返耗时: {duration:.3f}秒")
        print(f"平均延迟: {duration/100*1000:.2f}ms")

# 运行
asyncio.run(test_websocket_performance())
```

---

## 性能测试报告

### 自动生成报告

```python
import pandas as pd
import matplotlib.pyplot as plt
from datetime import datetime

class PerformanceReport:
    """性能测试报告生成器"""
    
    def __init__(self):
        self.results = []
    
    def add_result(self, api, response_time, success):
        """添加测试结果"""
        self.results.append({
            'api': api,
            'response_time': response_time,
            'success': success,
            'timestamp': datetime.now()
        })
    
    def generate_report(self, output_file='performance_report.html'):
        """生成HTML报告"""
        df = pd.DataFrame(self.results)
        
        # 计算统计数据
        stats = df.groupby('api').agg({
            'response_time': ['mean', 'median', 'min', 'max'],
            'success': 'sum'
        })
        
        # 生成图表
        fig, axes = plt.subplots(2, 2, figsize=(15, 10))
        
        # 响应时间分布
        df['response_time'].hist(bins=50, ax=axes[0, 0])
        axes[0, 0].set_title('响应时间分布')
        axes[0, 0].set_xlabel('响应时间(ms)')
        
        # API性能对比
        stats['response_time']['mean'].plot(kind='bar', ax=axes[0, 1])
        axes[0, 1].set_title('各API平均响应时间')
        
        # 时间序列
        df.plot(x='timestamp', y='response_time', ax=axes[1, 0])
        axes[1, 0].set_title('响应时间趋势')
        
        # 成功率
        success_rate = df.groupby('api')['success'].mean()
        success_rate.plot(kind='bar', ax=axes[1, 1])
        axes[1, 1].set_title('各API成功率')
        
        plt.tight_layout()
        plt.savefig('performance_charts.png')
        
        # 生成HTML报告
        html = f"""
        <html>
        <head><title>性能测试报告</title></head>
        <body>
            <h1>性能测试报告</h1>
            <h2>测试统计</h2>
            {stats.to_html()}
            <h2>性能图表</h2>
            <img src="performance_charts.png">
        </body>
        </html>
        """
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(html)
        
        print(f"报告已生成: {output_file}")
```

---

## 实战案例

### 游戏登录压力测试

```python
from locust import HttpUser, task, between
import random
import string

class GameLoginTest(HttpUser):
    """登录压力测试"""
    
    wait_time = between(1, 2)
    
    def generate_username(self):
        """生成随机用户名"""
        return ''.join(random.choices(string.ascii_letters, k=10))
    
    @task
    def login(self):
        """测试登录"""
        username = self.generate_username()
        response = self.client.post('/api/login', json={
            'username': username,
            'password': 'test123'
        })
        
        if response.status_code == 200:
            token = response.json().get('token')
            # 使用token进行后续操作
            self.client.get('/api/player/info', headers={
                'Authorization': f'Bearer {token}'
            })
```

### 游戏战斗性能测试

```python
class BattlePerformanceTest(HttpUser):
    """战斗系统性能测试"""
    
    wait_time = between(0.5, 1)
    
    def on_start(self):
        """初始化"""
        # 登录
        response = self.client.post('/api/login', json={
            'username': 'test_user',
            'password': 'test123'
        })
        self.token = response.json()['token']
    
    @task(10)
    def start_battle(self):
        """开始战斗"""
        self.client.post('/api/battle/start', 
            json={'enemy_id': random.randint(1, 100)},
            headers={'Authorization': f'Bearer {self.token}'}
        )
    
    @task(5)
    def attack(self):
        """攻击"""
        self.client.post('/api/battle/attack',
            json={'skill_id': random.randint(1, 10)},
            headers={'Authorization': f'Bearer {self.token}'}
        )
    
    @task(1)
    def use_item(self):
        """使用道具"""
        self.client.post('/api/battle/use_item',
            json={'item_id': random.randint(1, 5)},
            headers={'Authorization': f'Bearer {self.token}'}
        )
```

---

## 性能优化建议

### 1. 数据库优化
- 添加索引
- 使用连接池
- 查询优化
- 批量操作

### 2. 缓存策略
- Redis缓存热点数据
- 本地缓存
- CDN加速

### 3. 代码优化
- 算法优化
- 异步处理
- 减少IO操作

### 4. 架构优化
- 负载均衡
- 水平扩展
- 微服务架构

---

## 下一步

继续学习:
- [06. 数据分析](06-data-analysis.md)
- [07. 实战项目](07-real-projects.md)
- [09. 常见坑](09-common-pitfalls.md)
