# 08. 最佳实践

> 游戏测试开发最佳实践和框架设计

---

## 测试框架设计原则

### 1. Page Object模式

Page Object模式将页面元素和操作封装成类,提高代码可维护性。

```python
# pages/base_page.py
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By

class BasePage:
    """页面基类"""
    
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)
    
    def find_element(self, locator):
        """查找元素"""
        return self.wait.until(EC.presence_of_element_located(locator))
    
    def click(self, locator):
        """点击元素"""
        element = self.wait.until(EC.element_to_be_clickable(locator))
        element.click()
    
    def input_text(self, locator, text):
        """输入文本"""
        element = self.find_element(locator)
        element.clear()
        element.send_keys(text)

# pages/login_page.py
class LoginPage(BasePage):
    """登录页面"""
    
    USERNAME_INPUT = (By.ID, 'username')
    PASSWORD_INPUT = (By.ID, 'password')
    LOGIN_BUTTON = (By.ID, 'login-btn')
    
    def login(self, username, password):
        """执行登录"""
        self.input_text(self.USERNAME_INPUT, username)
        self.input_text(self.PASSWORD_INPUT, password)
        self.click(self.LOGIN_BUTTON)
```

### 2. 数据驱动测试

使用参数化测试覆盖多种测试场景。

```python
import pytest

@pytest.mark.parametrize('username,password,expected_result', [
    ('valid_user', 'valid_pass', True),
    ('invalid_user', 'any_pass', False),
    ('', 'any_pass', False),
    ('user', '', False),
])
def test_login_scenarios(login_page, username, password, expected_result):
    """测试多种登录场景"""
    login_page.login(username, password)
    assert login_page.is_login_successful() == expected_result
```

### 3. 配置管理

集中管理测试配置,便于环境切换。

```python
# config/config.py
import yaml
import os

class Config:
    """配置管理类"""
    
    def __init__(self, config_file='configs/test_config.yaml'):
        with open(config_file, 'r', encoding='utf-8') as f:
            self.config = yaml.safe_load(f)
    
    def get(self, key, default=None):
        """获取配置值"""
        keys = key.split('.')
        value = self.config
        for k in keys:
            value = value.get(k, {})
        return value if value != {} else default

# configs/test_config.yaml
environments:
  dev:
    base_url: "https://dev.game.com"
    db_host: "dev-db.game.com"
  staging:
    base_url: "https://staging.game.com"
    db_host: "staging-db.game.com"
  prod:
    base_url: "https://game.com"
    db_host: "prod-db.game.com"
    
browser:
  timeout: 10
  headless: false
  window_size: "1920,1080"
```

---

## 代码组织结构

### 项目目录结构

```
game-test-framework/
├── conftest.py              # Pytest配置
├── pytest.ini              # Pytest配置文件
├── requirements.txt        # 依赖包
├── pages/                  # Page Object类
│   ├── __init__.py
│   ├── base_page.py
│   ├── login_page.py
│   └── game_page.py
├── tests/                  # 测试用例
│   ├── __init__.py
│   ├── test_login.py
│   ├── test_game.py
│   └── test_api.py
├── utils/                  # 工具函数
│   ├── __init__.py
│   ├── api_client.py
│   ├── database_helper.py
│   └── file_helper.py
├── configs/                # 配置文件
│   ├── test_config.yaml
│   └── environments.yaml
├── data/                   # 测试数据
│   ├── test_users.json
│   └── game_data.json
└── reports/                # 测试报告
```

### conftest.py配置

```python
# conftest.py
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
from utils.config import Config

@pytest.fixture(scope='session')
def config():
    """配置fixture"""
    return Config()

@pytest.fixture(scope='session')
def driver(config):
    """WebDriver fixture"""
    options = Options()
    
    # 从配置加载选项
    browser_options = config.get('browser.options', [])
    for option in browser_options:
        options.add_argument(option)
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    
    yield driver
    driver.quit()

@pytest.fixture
def logged_in_driver(driver, config):
    """已登录的driver fixture"""
    # 登录逻辑
    driver.get(f"{config.get('base_url')}/login")
    # ... 登录操作 ...
    
    yield driver
    # 登出逻辑
    driver.get(f"{config.get('base_url')}/logout")

# pytest.ini
[tool:pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = 
    -v
    --tb=short
    --strict-markers
markers =
    smoke: 冒烟测试
    regression: 回归测试
    integration: 集成测试
    ui: UI测试
    api: API测试
```

---

## CI/CD集成

### GitHub Actions配置

```yaml
# .github/workflows/test.yml
name: Game Test Automation

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        python-version: [3.8, 3.9, 3.10]
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Set up Python ${{ matrix.python-version }}
      uses: actions/setup-python@v2
      with:
        python-version: ${{ matrix.python-version }}
    
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
    
    - name: Run unit tests
      run: |
        pytest tests/unit/ -v
    
    - name: Run integration tests
      run: |
        pytest tests/integration/ -v --html=reports/integration_report.html
    
    - name: Upload test results
      uses: actions/upload-artifact@v2
      with:
        name: test-reports
        path: reports/
```

### Docker化测试环境

```dockerfile
# Dockerfile
FROM python:3.9-slim

# 安装Chrome
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    unzip \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable

# 安装Python依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制代码
WORKDIR /app
COPY . .

# 运行测试
CMD ["pytest", "tests/", "-v"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  selenium:
    image: selenium/standalone-chrome
    ports:
      - "4444:4444"
    environment:
      - SE_SCREEN_WIDTH=1920
      - SE_SCREEN_HEIGHT=1080
  
  test-runner:
    build: .
    depends_on:
      - selenium
    environment:
      - SELENIUM_HOST=selenium
    volumes:
      - ./reports:/app/reports
```

---

## 性能优化

### 1. 测试并行执行

```python
# 安装pytest-xdist
pip install pytest-xdist

# 并行运行测试
pytest -n 4  # 使用4个进程
pytest -n auto  # 自动检测CPU核心数
```

### 2. 重用浏览器会话

```python
@pytest.fixture(scope='session')
def driver():
    """Session级别的driver,所有测试共享"""
    options = Options()
    options.add_argument('--headless')
    driver = webdriver.Chrome(options=options)
    yield driver
    driver.quit()

@pytest.fixture
def fresh_page(driver):
    """每个测试前重置页面状态"""
    driver.get('https://game.com')
    yield driver
    # 清理操作
```

### 3. 缓存测试数据

```python
import pytest
import json

@pytest.fixture(scope='session')
def test_data():
    """Session级别的测试数据缓存"""
    with open('data/test_users.json', 'r') as f:
        return json.load(f)

@pytest.fixture
def fresh_user(test_data):
    """提供新的测试用户"""
    # 从测试数据中获取一个用户
    user = test_data['users'].pop(0)
    yield user
    # 清理用户
    cleanup_user(user['id'])
```

---

## 日志和监控

### 1. 日志配置

```python
# utils/logger.py
import logging
import os
from datetime import datetime

def setup_logger(name, log_file, level=logging.INFO):
    """设置日志记录器"""
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    handler = logging.FileHandler(log_file)
    handler.setFormatter(formatter)
    
    logger = logging.getLogger(name)
    logger.setLevel(level)
    logger.addHandler(handler)
    
    return logger

# 在测试中使用
import logging

logger = logging.getLogger(__name__)

def test_login():
    logger.info("开始登录测试")
    try:
        # 测试逻辑
        logger.info("登录成功")
    except Exception as e:
        logger.error(f"登录失败: {e}")
        raise
```

### 2. Allure报告

```bash
# 安装Allure
pip install allure-pytest

# 运行测试生成报告
pytest --alluredir=./allure-results

# 查看报告
allure serve ./allure-results
```

```python
# 使用Allure装饰器
import allure

@allure.feature('玩家系统')
@allure.story('登录功能')
@allure.severity(allure.severity_level.CRITICAL)
def test_player_login():
    """测试玩家登录"""
    with allure.step('输入用户名'):
        # 输入用户名
        pass
    
    with allure.step('输入密码'):
        # 输入密码
        pass
    
    with allure.step('点击登录'):
        # 点击登录
        pass
    
    with allure.step('验证登录成功'):
        # 验证结果
        assert True
```

---

## 数据库测试

### 1. 测试数据管理

```python
# utils/database_helper.py
import sqlite3
import json
from contextlib import contextmanager

class DatabaseHelper:
    """数据库辅助类"""
    
    def __init__(self, db_path):
        self.db_path = db_path
    
    @contextmanager
    def get_connection(self):
        """获取数据库连接"""
        conn = sqlite3.connect(self.db_path)
        try:
            yield conn
        finally:
            conn.close()
    
    def insert_test_data(self, table, data):
        """插入测试数据"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            placeholders = ','.join(['?' for _ in data])
            columns = ','.join(data.keys())
            query = f"INSERT INTO {table} ({columns}) VALUES ({placeholders})"
            cursor.execute(query, list(data.values()))
            conn.commit()
    
    def cleanup_test_data(self, table, condition):
        """清理测试数据"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            query = f"DELETE FROM {table} WHERE {condition}"
            cursor.execute(query)
            conn.commit()

# 使用示例
@pytest.fixture
def db_helper():
    return DatabaseHelper('test.db')

def test_player_creation(db_helper):
    """测试玩家创建"""
    # 准备测试数据
    player_data = {
        'name': 'test_player',
        'level': 1,
        'exp': 0
    }
    
    db_helper.insert_test_data('players', player_data)
    
    try:
        # 执行测试
        # ...
        pass
    finally:
        # 清理数据
        db_helper.cleanup_test_data('players', "name='test_player'")
```

### 2. 数据库事务管理

```python
class TransactionManager:
    """事务管理器"""
    
    def __init__(self, db_helper):
        self.db_helper = db_helper
        self.transactions = []
    
    def begin_transaction(self):
        """开始事务"""
        conn = self.db_helper.get_connection()
        conn.execute('BEGIN')
        self.transactions.append(conn)
        return conn
    
    def rollback_all(self):
        """回滚所有事务"""
        for conn in reversed(self.transactions):
            conn.rollback()
        self.transactions.clear()
    
    def commit_all(self):
        """提交所有事务"""
        for conn in self.transactions:
            conn.commit()
        self.transactions.clear()

# 测试中使用
@pytest.fixture
def transaction_manager(db_helper):
    tm = TransactionManager(db_helper)
    yield tm
    tm.rollback_all()  # 测试失败时自动回滚

def test_game_transaction(transaction_manager):
    """测试游戏事务"""
    conn = transaction_manager.begin_transaction()
    
    # 执行数据库操作
    # ...
    
    # 如果测试通过则提交
    transaction_manager.commit_all()
```

---

## API测试最佳实践

### 1. API客户端封装

```python
# utils/api_client.py
import requests
import json
from typing import Dict, Any

class APIClient:
    """API客户端"""
    
    def __init__(self, base_url, timeout=30):
        self.base_url = base_url
        self.timeout = timeout
        self.session = requests.Session()
    
    def get(self, endpoint, headers=None, **kwargs):
        """GET请求"""
        url = f"{self.base_url}{endpoint}"
        response = self.session.get(url, headers=headers, timeout=self.timeout, **kwargs)
        return self._handle_response(response)
    
    def post(self, endpoint, data=None, json_data=None, headers=None, **kwargs):
        """POST请求"""
        url = f"{self.base_url}{endpoint}"
        response = self.session.post(url, data=data, json=json_data, 
                                   headers=headers, timeout=self.timeout, **kwargs)
        return self._handle_response(response)
    
    def _handle_response(self, response):
        """处理响应"""
        response.raise_for_status()
        try:
            return response.json()
        except:
            return response.text

# 测试中使用
@pytest.fixture
def api_client(config):
    return APIClient(config.get('api.base_url'))

def test_player_api(api_client):
    """测试玩家API"""
    # 创建玩家
    player_data = {
        'name': 'test_player',
        'level': 1
    }
    response = api_client.post('/api/players', json_data=player_data)
    assert response['name'] == 'test_player'
```

### 2. Mock API测试

```python
from unittest.mock import Mock, patch
import pytest

def test_api_with_mock():
    """使用Mock测试API"""
    mock_response = Mock()
    mock_response.json.return_value = {
        'id': 1,
        'name': 'test_player',
        'level': 1
    }
    mock_response.status_code = 200
    
    with patch('requests.get', return_value=mock_response):
        # 调用实际的API方法
        result = get_player_info(1)
        assert result['name'] == 'test_player'
```

---

## 移动端测试最佳实践

### 1. 设备管理

```python
# utils/device_manager.py
import subprocess
import json
from typing import List, Dict

class DeviceManager:
    """设备管理器"""
    
    @staticmethod
    def get_connected_devices():
        """获取连接的设备"""
        result = subprocess.run(['adb', 'devices'], 
                              capture_output=True, text=True)
        lines = result.stdout.strip().split('\n')[1:]  # 跳过标题行
        devices = []
        for line in lines:
            if line and 'device' in line:
                device_id = line.split('\t')[0]
                devices.append(device_id)
        return devices
    
    @staticmethod
    def install_app(device_id, apk_path):
        """安装应用"""
        subprocess.run(['adb', '-s', device_id, 'install', apk_path])
    
    @staticmethod
    def get_device_info(device_id):
        """获取设备信息"""
        model = subprocess.run(['adb', '-s', device_id, 'shell', 'getprop', 'ro.product.model'], 
                              capture_output=True, text=True).stdout.strip()
        version = subprocess.run(['adb', '-s', device_id, 'shell', 'getprop', 'ro.build.version.release'], 
                                capture_output=True, text=True).stdout.strip()
        return {
            'model': model,
            'version': version,
            'id': device_id
        }

# 在测试中使用
@pytest.fixture(scope='session')
def device():
    devices = DeviceManager.get_connected_devices()
    if not devices:
        pytest.skip("没有连接的设备")
    return devices[0]
```

### 2. 跨平台测试

```python
import pytest
from appium import webdriver
from appium.options.android import UiAutomator2Options
from appium.options.ios import XCUITestOptions

class CrossPlatformTest:
    """跨平台测试基类"""
    
    @pytest.fixture
    def driver(self, platform):
        """根据平台创建driver"""
        if platform == 'android':
            options = UiAutomator2Options()
            options.platform_name = 'Android'
            options.device_name = 'Android Emulator'
            options.app_package = 'com.example.game'
            options.app_activity = '.MainActivity'
            driver = webdriver.Remote('http://localhost:4723', options=options)
        
        elif platform == 'ios':
            options = XCUITestOptions()
            options.platform_name = 'iOS'
            options.device_name = 'iPhone 13'
            options.bundle_id = 'com.example.game'
            driver = webdriver.Remote('http://localhost:4723', options=options)
        
        yield driver
        driver.quit()

# 参数化跨平台测试
@pytest.mark.parametrize('platform', ['android', 'ios'])
def test_login_cross_platform(cross_platform_test, platform):
    """跨平台登录测试"""
    driver = cross_platform_test.driver(platform)
    # 执行相同的测试逻辑
    # ...
```

---

## 测试数据管理

### 1. 测试数据工厂

```python
# utils/test_data_factory.py
import random
import string
from datetime import datetime, timedelta

class TestDataFactory:
    """测试数据工厂"""
    
    @staticmethod
    def create_player_data(level=1, gold=100):
        """创建玩家数据"""
        return {
            'username': f"test_user_{random.randint(1000, 9999)}",
            'level': level,
            'gold': gold,
            'exp': 0,
            'created_at': datetime.now().isoformat()
        }
    
    @staticmethod
    def create_game_item(item_type='weapon', rarity='common'):
        """创建游戏道具"""
        return {
            'name': f"{rarity}_{item_type}_{random.randint(1, 100)}",
            'type': item_type,
            'rarity': rarity,
            'level_required': random.randint(1, 50),
            'price': random.randint(10, 1000)
        }
    
    @staticmethod
    def create_enemy_data(level=1):
        """创建敌人数据"""
        enemies = ['Goblin', 'Orc', 'Skeleton', 'Zombie']
        return {
            'name': f"{random.choice(enemies)}_{random.randint(1, 100)}",
            'level': level,
            'hp': level * 100,
            'attack': level * 10,
            'exp_reward': level * 50
        }

# 使用示例
def test_player_creation():
    factory = TestDataFactory()
    player_data = factory.create_player_data(level=5)
    
    # 使用测试数据
    result = create_player(player_data)
    assert result['level'] == 5
```

### 2. 测试数据清理

```python
# utils/test_data_cleaner.py
class TestDataCleaner:
    """测试数据清理器"""
    
    def __init__(self, db_helper, api_client):
        self.db_helper = db_helper
        self.api_client = api_client
        self.cleanup_queue = []
    
    def register_for_cleanup(self, cleanup_func, *args, **kwargs):
        """注册清理函数"""
        self.cleanup_queue.append((cleanup_func, args, kwargs))
    
    def cleanup_all(self):
        """执行所有清理操作"""
        for cleanup_func, args, kwargs in reversed(self.cleanup_queue):
            try:
                cleanup_func(*args, **kwargs)
            except Exception as e:
                print(f"清理失败: {e}")
        self.cleanup_queue.clear()

# 在测试中使用
@pytest.fixture
def test_cleaner(db_helper, api_client):
    cleaner = TestDataCleaner(db_helper, api_client)
    yield cleaner
    cleaner.cleanup_all()

def test_create_and_delete_player(test_cleaner):
    """测试创建和删除玩家"""
    player_data = TestDataFactory.create_player_data()
    result = create_player(player_data)
    
    # 注册清理操作
    test_cleaner.register_for_cleanup(delete_player, result['id'])
    
    # 验证创建成功
    assert result['username'] == player_data['username']
```

---

## 性能测试最佳实践

### 1. 基准测试

```python
import time
import statistics
from functools import wraps

def benchmark(func):
    """性能基准测试装饰器"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        times = []
        for _ in range(10):  # 执行10次取平均值
            start = time.time()
            result = func(*args, **kwargs)
            end = time.time()
            times.append((end - start) * 1000)  # 转换为毫秒
        
        avg_time = statistics.mean(times)
        median_time = statistics.median(times)
        p95_time = sorted(times)[int(len(times) * 0.95)]
        
        print(f"{func.__name__} - "
              f"平均: {avg_time:.2f}ms, "
              f"中位数: {median_time:.2f}ms, "
              f"P95: {p95_time:.2f}ms")
        
        return result
    return wrapper

# 使用示例
@benchmark
def test_login_performance():
    """测试登录性能"""
    # 登录测试逻辑
    pass
```

### 2. 负载测试

```python
import threading
import time
from concurrent.futures import ThreadPoolExecutor

def load_test(target_func, num_users=10, duration=60):
    """负载测试"""
    results = []
    lock = threading.Lock()
    
    def run_test():
        start_time = time.time()
        user_results = []
        
        while time.time() - start_time < duration:
            try:
                start_req = time.time()
                target_func()
                response_time = (time.time() - start_req) * 1000
                user_results.append({
                    'response_time': response_time,
                    'success': True,
                    'timestamp': time.time()
                })
            except Exception as e:
                user_results.append({
                    'response_time': 0,
                    'success': False,
                    'error': str(e),
                    'timestamp': time.time()
                })
            
            time.sleep(0.1)  # 模拟用户操作间隔
        
        with lock:
            results.extend(user_results)
    
    with ThreadPoolExecutor(max_workers=num_users) as executor:
        futures = [executor.submit(run_test) for _ in range(num_users)]
        for future in futures:
            future.result()
    
    # 分析结果
    successful_requests = [r for r in results if r['success']]
    failed_requests = [r for r in results if not r['success']]
    
    print(f"总请求数: {len(results)}")
    print(f"成功请求数: {len(successful_requests)}")
    print(f"失败请求数: {len(failed_requests)}")
    print(f"成功率: {len(successful_requests)/len(results)*100:.2f}%")
    
    if successful_requests:
        response_times = [r['response_time'] for r in successful_requests]
        print(f"平均响应时间: {statistics.mean(response_times):.2f}ms")
        print(f"P95响应时间: {sorted(response_times)[int(len(response_times)*0.95)]:.2f}ms")
    
    return results

# 使用示例
def api_call():
    """要测试的API调用"""
    response = requests.get('https://api.game.com/status')
    response.raise_for_status()

# 运行负载测试
load_test(api_call, num_users=50, duration=300)  # 50用户, 5分钟
```

---

## 总结

最佳实践的核心原则:

1. **模块化设计**: 使用Page Object模式组织代码
2. **数据驱动**: 参数化测试覆盖多种场景
3. **配置管理**: 集中管理环境配置
4. **日志监控**: 完善的日志和报告系统
5. **性能优化**: 并行执行和资源复用
6. **数据管理**: 测试数据的创建和清理
7. **CI/CD集成**: 自动化测试流程

---

## 下一步

继续学习:
- [09. 常见坑](09-common-pitfalls.md)
- [10. 面试题](10-interview-questions.md)
