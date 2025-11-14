# 07. 实战项目

> 3个完整的游戏测试项目案例

---

## 项目1: Web游戏自动化测试框架

### 项目概述

构建一个完整的Web游戏自动化测试框架,用于测试HTML5游戏。

### 项目结构

```
web-game-test/
├── conftest.py              # Pytest配置
├── requirements.txt         # 依赖
├── pages/                   # Page Object
│   ├── __init__.py
│   ├── base_page.py
│   ├── login_page.py
│   ├── game_page.py
│   └── profile_page.py
├── tests/                   # 测试用例
│   ├── __init__.py
│   ├── test_login.py
│   ├── test_game.py
│   └── test_profile.py
├── utils/                   # 工具函数
│   ├── __init__.py
│   ├── config.py
│   ├── database.py
│   └── report_generator.py
├── configs/                 # 配置文件
│   ├── test_config.yaml
│   └── environments.yaml
└── reports/                 # 测试报告
```

### 基础页面类

```python
# pages/base_page.py
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
import time

class BasePage:
    """页面基类"""
    
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)
    
    def find_element(self, locator):
        """查找元素"""
        return self.wait.until(EC.presence_of_element_located(locator))
    
    def find_elements(self, locator):
        """查找多个元素"""
        return self.driver.find_elements(*locator)
    
    def click(self, locator):
        """点击元素"""
        element = self.wait.until(EC.element_to_be_clickable(locator))
        element.click()
    
    def input_text(self, locator, text):
        """输入文本"""
        element = self.find_element(locator)
        element.clear()
        element.send_keys(text)
    
    def is_element_present(self, locator, timeout=3):
        """检查元素是否存在"""
        try:
            WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located(locator)
            )
            return True
        except:
            return False
    
    def wait_for_text(self, locator, text):
        """等待元素包含指定文本"""
        self.wait.until(EC.text_to_be_present_in_element(locator, text))
    
    def get_text(self, locator):
        """获取元素文本"""
        element = self.find_element(locator)
        return element.text
```

### 登录页面

```python
# pages/login_page.py
from selenium.webdriver.common.by import By
from pages.base_page import BasePage

class LoginPage(BasePage):
    """登录页面"""
    
    URL = 'https://game.example.com/login'
    
    # 定位器
    USERNAME_INPUT = (By.ID, 'username')
    PASSWORD_INPUT = (By.ID, 'password')
    LOGIN_BUTTON = (By.ID, 'login-btn')
    ERROR_MESSAGE = (By.CLASS_NAME, 'error-message')
    SIGNUP_LINK = (By.LINK_TEXT, '注册')
    
    def open(self):
        """打开登录页面"""
        self.driver.get(self.URL)
    
    def login(self, username, password):
        """执行登录"""
        self.input_text(self.USERNAME_INPUT, username)
        self.input_text(self.PASSWORD_INPUT, password)
        self.click(self.LOGIN_BUTTON)
    
    def get_error_message(self):
        """获取错误信息"""
        if self.is_element_present(self.ERROR_MESSAGE):
            return self.get_text(self.ERROR_MESSAGE)
        return None
    
    def click_signup(self):
        """点击注册"""
        self.click(self.SIGNUP_LINK)
    
    def is_login_successful(self):
        """检查是否登录成功"""
        # 检查是否跳转到主页
        return 'dashboard' in self.driver.current_url or 'game' in self.driver.current_url
```

### 游戏页面

```python
# pages/game_page.py
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from pages.base_page import BasePage
import time

class GamePage(BasePage):
    """游戏页面"""
    
    # 游戏元素定位器
    GAME_CANVAS = (By.ID, 'game-canvas')
    START_BUTTON = (By.ID, 'start-game')
    PAUSE_BUTTON = (By.ID, 'pause-game')
    SCORE_DISPLAY = (By.ID, 'score')
    LIVES_DISPLAY = (By.ID, 'lives')
    INVENTORY_BUTTON = (By.ID, 'inventory')
    CHAT_INPUT = (By.ID, 'chat-input')
    CHAT_SEND_BUTTON = (By.ID, 'chat-send')
    
    def start_game(self):
        """开始游戏"""
        self.click(self.START_BUTTON)
    
    def pause_game(self):
        """暂停游戏"""
        self.click(self.PAUSE_BUTTON)
    
    def get_score(self):
        """获取分数"""
        score_text = self.get_text(self.SCORE_DISPLAY)
        return int(score_text) if score_text.isdigit() else 0
    
    def get_lives(self):
        """获取生命值"""
        lives_text = self.get_text(self.LIVES_DISPLAY)
        return int(lives_text) if lives_text.isdigit() else 0
    
    def open_inventory(self):
        """打开背包"""
        self.click(self.INVENTORY_BUTTON)
    
    def send_chat_message(self, message):
        """发送聊天消息"""
        self.input_text(self.CHAT_INPUT, message)
        self.click(self.CHAT_SEND_BUTTON)
    
    def play_game_for_duration(self, duration=30):
        """玩游戏指定时长(秒)"""
        start_time = time.time()
        
        # 模拟游戏操作
        body = self.driver.find_element(By.TAG_NAME, 'body')
        while time.time() - start_time < duration:
            # 随机操作
            import random
            actions = [
                lambda: body.send_keys(Keys.ARROW_UP),
                lambda: body.send_keys(Keys.ARROW_DOWN),
                lambda: body.send_keys(Keys.ARROW_LEFT),
                lambda: body.send_keys(Keys.ARROW_RIGHT),
                lambda: self.click(self.START_BUTTON) if random.random() < 0.1 else None
            ]
            random.choice(actions)()
            
            time.sleep(0.1)
```

### 测试用例

```python
# tests/test_login.py
import pytest
from pages.login_page import LoginPage
from pages.game_page import GamePage

class TestLogin:
    """登录测试"""
    
    @pytest.fixture
    def login_page(self, driver):
        """登录页面fixture"""
        page = LoginPage(driver)
        page.open()
        return page
    
    def test_valid_login(self, login_page):
        """测试有效登录"""
        login_page.login('test_user', 'test_pass')
        
        # 验证登录成功
        assert login_page.is_login_successful()
    
    def test_invalid_login(self, login_page):
        """测试无效登录"""
        login_page.login('invalid_user', 'invalid_pass')
        
        # 验证显示错误信息
        error = login_page.get_error_message()
        assert error is not None
        assert '用户名或密码错误' in error
    
    def test_empty_credentials(self, login_page):
        """测试空凭据"""
        login_page.login('', '')
        
        # 验证显示错误信息
        error = login_page.get_error_message()
        assert error is not None

# tests/test_game.py
class TestGame:
    """游戏测试"""
    
    @pytest.fixture
    def game_page(self, logged_in_driver):
        """游戏页面fixture"""
        page = GamePage(logged_in_driver)
        return page
    
    def test_game_start(self, game_page):
        """测试游戏开始"""
        game_page.start_game()
        
        # 验证游戏开始
        initial_score = game_page.get_score()
        assert initial_score >= 0
    
    def test_game_interaction(self, game_page):
        """测试游戏交互"""
        game_page.start_game()
        
        # 获取初始状态
        initial_score = game_page.get_score()
        initial_lives = game_page.get_lives()
        
        # 玩游戏30秒
        game_page.play_game_for_duration(30)
        
        # 验证分数变化
        final_score = game_page.get_score()
        assert final_score >= initial_score
```

### 配置文件

```python
# utils/config.py
import yaml
import os

class Config:
    """配置管理"""
    
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
    
    def get_browser_options(self):
        """获取浏览器选项"""
        return self.get('browser.options', [])
    
    def get_base_url(self):
        """获取基础URL"""
        return self.get('base_url', 'https://game.example.com')

# configs/test_config.yaml
base_url: "https://game.example.com"
browser:
  options:
    - "--headless"
    - "--no-sandbox"
    - "--disable-dev-shm-usage"
    - "--window-size=1920,1080"
timeout: 10
retries: 3
```

### conftest.py

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
    browser_options = config.get_browser_options()
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
    driver.get(f"{config.get_base_url()}/login")
    # ... 登录操作 ...
    
    yield driver
    # 登出逻辑
    driver.get(f"{config.get_base_url()}/logout")
```

---

## 项目2: 手游UI自动化测试

### 项目概述

构建一个Android手游的UI自动化测试框架。

### 项目结构

```
mobile-game-test/
├── conftest.py
├── requirements.txt
├── pages/
│   ├── base_page.py
│   ├── login_page.py
│   ├── main_menu_page.py
│   ├── battle_page.py
│   └── inventory_page.py
├── tests/
│   ├── test_login.py
│   ├── test_battle.py
│   └── test_inventory.py
├── utils/
│   ├── appium_helper.py
│   ├── device_manager.py
│   └── test_data.py
└── configs/
    └── capabilities.yaml
```

### Appium配置

```python
# utils/appium_helper.py
from appium import webdriver
from appium.options.android import UiAutomator2Options
import yaml

class AppiumHelper:
    """Appium辅助类"""
    
    def __init__(self, capabilities_file='configs/capabilities.yaml'):
        with open(capabilities_file, 'r', encoding='utf-8') as f:
            self.capabilities = yaml.safe_load(f)
    
    def create_driver(self, device_name='default'):
        """创建Appium driver"""
        options = UiAutomator2Options()
        
        # 设置capabilities
        device_caps = self.capabilities.get(device_name, self.capabilities['default'])
        for key, value in device_caps.items():
            setattr(options, key, value)
        
        return webdriver.Remote('http://localhost:4723', options=options)

# configs/capabilities.yaml
default:
  platform_name: "Android"
  platform_version: "11"
  device_name: "Android Emulator"
  app_package: "com.example.game"
  app_activity: ".MainActivity"
  automation_name: "UiAutomator2"
  no_reset: true
  full_reset: false

real_device:
  platform_name: "Android"
  platform_version: "12"
  device_name: "MyDevice"
  udid: "device_udid_here"
  app_package: "com.example.game"
  app_activity: ".MainActivity"
  automation_name: "UiAutomator2"
```

### 手游页面对象

```python
# pages/base_page.py
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class BasePage:
    """移动端页面基类"""
    
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)
    
    def find_element(self, locator):
        """查找元素"""
        return self.wait.until(EC.presence_of_element_located(locator))
    
    def find_elements(self, locator):
        """查找多个元素"""
        return self.driver.find_elements(*locator)
    
    def click(self, locator):
        """点击元素"""
        element = self.wait.until(EC.element_to_be_clickable(locator))
        element.click()
    
    def input_text(self, locator, text):
        """输入文本"""
        element = self.find_element(locator)
        element.clear()
        element.send_keys(text)
    
    def swipe_up(self, duration=500):
        """向上滑动"""
        size = self.driver.get_window_size()
        start_x = size['width'] // 2
        start_y = size['height'] * 0.8
        end_y = size['height'] * 0.2
        
        self.driver.swipe(start_x, start_y, start_x, end_y, duration)
    
    def swipe_down(self, duration=500):
        """向下滑动"""
        size = self.driver.get_window_size()
        start_x = size['width'] // 2
        start_y = size['height'] * 0.2
        end_y = size['height'] * 0.8
        
        self.driver.swipe(start_x, start_y, start_x, end_y, duration)
    
    def tap_coordinates(self, x, y):
        """点击坐标"""
        self.driver.tap([(x, y)])

# pages/login_page.py
class LoginPage(BasePage):
    """登录页面"""
    
    USERNAME_INPUT = (AppiumBy.ID, 'com.example.game:id/username')
    PASSWORD_INPUT = (AppiumBy.ID, 'com.example.game:id/password')
    LOGIN_BUTTON = (AppiumBy.ID, 'com.example.game:id/login_btn')
    SIGNUP_BUTTON = (AppiumBy.ID, 'com.example.game:id/signup_btn')
    ERROR_MESSAGE = (AppiumBy.ID, 'com.example.game:id/error_msg')
    
    def login(self, username, password):
        """执行登录"""
        self.input_text(self.USERNAME_INPUT, username)
        self.input_text(self.PASSWORD_INPUT, password)
        self.click(self.LOGIN_BUTTON)
    
    def get_error_message(self):
        """获取错误信息"""
        try:
            element = self.find_element(self.ERROR_MESSAGE)
            return element.text
        except:
            return None
```

### 战斗系统测试

```python
# pages/battle_page.py
class BattlePage(BasePage):
    """战斗页面"""
    
    BATTLE_START_BUTTON = (AppiumBy.ID, 'com.example.game:id/battle_start')
    ATTACK_BUTTON = (AppiumBy.ID, 'com.example.game:id/attack_btn')
    SKILL_BUTTONS = (AppiumBy.ID, 'com.example.game:id/skill_btn')
    ENEMY_HP_BAR = (AppiumBy.ID, 'com.example.game:id/enemy_hp')
    PLAYER_HP_BAR = (AppiumBy.ID, 'com.example.game:id/player_hp')
    BATTLE_RESULT = (AppiumBy.ID, 'com.example.game:id/battle_result')
    
    def start_battle(self):
        """开始战斗"""
        self.click(self.BATTLE_START_BUTTON)
    
    def attack(self):
        """普通攻击"""
        self.click(self.ATTACK_BUTTON)
    
    def use_skill(self, skill_index=0):
        """使用技能"""
        skills = self.find_elements(self.SKILL_BUTTONS)
        if len(skills) > skill_index:
            skills[skill_index].click()
    
    def get_enemy_hp(self):
        """获取敌人血量"""
        hp_element = self.find_element(self.ENEMY_HP_BAR)
        # 解析血量值
        hp_text = hp_element.get_attribute('text')
        return int(hp_text.split('/')[0]) if '/' in hp_text else 0
    
    def get_player_hp(self):
        """获取玩家血量"""
        hp_element = self.find_element(self.PLAYER_HP_BAR)
        hp_text = hp_element.get_attribute('text')
        return int(hp_text.split('/')[0]) if '/' in hp_text else 0
    
    def is_battle_won(self):
        """判断战斗是否胜利"""
        try:
            result = self.find_element(self.BATTLE_RESULT)
            return '胜利' in result.text
        except:
            return False

# tests/test_battle.py
class TestBattle:
    """战斗系统测试"""
    
    @pytest.fixture
    def battle_page(self, logged_in_driver):
        """战斗页面fixture"""
        # 导航到战斗页面
        # ... 导航逻辑 ...
        return BattlePage(logged_in_driver)
    
    def test_battle_flow(self, battle_page):
        """测试战斗流程"""
        # 开始战斗
        battle_page.start_battle()
        
        # 战斗过程
        initial_enemy_hp = battle_page.get_enemy_hp()
        initial_player_hp = battle_page.get_player_hp()
        
        # 连续攻击
        for i in range(10):
            battle_page.attack()
            time.sleep(1)
            
            # 检查战斗是否结束
            if battle_page.get_enemy_hp() <= 0:
                break
        
        # 验证战斗结果
        assert battle_page.is_battle_won()
```

---

## 项目3: 性能测试数据分析系统

### 项目概述

构建一个完整的性能测试数据收集、分析和报告生成系统。

### 项目结构

```
performance-test-system/
├── data_collector.py        # 数据收集器
├── analyzer.py             # 数据分析器
├── report_generator.py     # 报告生成器
├── dashboard.py            # 仪表盘
├── requirements.txt
├── config.yaml
├── data/                   # 测试数据
│   ├── raw/
│   ├── processed/
│   └── reports/
└── templates/              # 报告模板
    └── performance_report.html
```

### 数据收集器

```python
# data_collector.py
import requests
import time
import json
import threading
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor
import pandas as pd

class PerformanceDataCollector:
    """性能数据收集器"""
    
    def __init__(self, config_file='config.yaml'):
        with open(config_file, 'r', encoding='utf-8') as f:
            self.config = json.load(f)
        
        self.results = []
        self.lock = threading.Lock()
    
    def single_request(self, endpoint, method='GET', **kwargs):
        """单个请求测试"""
        start_time = time.time()
        
        try:
            response = requests.request(method, endpoint, **kwargs)
            response_time = (time.time() - start_time) * 1000  # 转换为毫秒
            
            result = {
                'timestamp': datetime.now().isoformat(),
                'endpoint': endpoint,
                'method': method,
                'status_code': response.status_code,
                'response_time': response_time,
                'success': response.status_code == 200,
                'response_size': len(response.content)
            }
            
        except Exception as e:
            result = {
                'timestamp': datetime.now().isoformat(),
                'endpoint': endpoint,
                'method': method,
                'status_code': 0,
                'response_time': (time.time() - start_time) * 1000,
                'success': False,
                'response_size': 0,
                'error': str(e)
            }
        
        with self.lock:
            self.results.append(result)
        
        return result
    
    def concurrent_test(self, endpoint, num_users=10, duration=60):
        """并发测试"""
        start_time = time.time()
        
        def make_request():
            while time.time() - start_time < duration:
                self.single_request(endpoint)
                time.sleep(0.1)  # 模拟用户操作间隔
        
        with ThreadPoolExecutor(max_workers=num_users) as executor:
            futures = [executor.submit(make_request) for _ in range(num_users)]
            for future in futures:
                future.result()
    
    def save_results(self, filename=None):
        """保存结果"""
        if filename is None:
            filename = f"data/raw/performance_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, ensure_ascii=False, indent=2)
        
        print(f"结果已保存: {filename}")
        return filename

# 使用示例
collector = PerformanceDataCollector()
collector.concurrent_test('https://api.game.com/login', num_users=50, duration=300)
collector.save_results()
```

### 数据分析器

```python
# analyzer.py
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import matplotlib.pyplot as plt
import seaborn as sns

class PerformanceAnalyzer:
    """性能数据分析器"""
    
    def __init__(self, data_file):
        self.df = pd.read_json(data_file)
        self.df['timestamp'] = pd.to_datetime(self.df['timestamp'])
    
    def basic_statistics(self):
        """基础统计"""
        stats = {
            'total_requests': len(self.df),
            'success_rate': (self.df['success'] == True).mean() * 100,
            'avg_response_time': self.df['response_time'].mean(),
            'p95_response_time': self.df['response_time'].quantile(0.95),
            'p99_response_time': self.df['response_time'].quantile(0.99),
            'min_response_time': self.df['response_time'].min(),
            'max_response_time': self.df['response_time'].max()
        }
        return stats
    
    def endpoint_analysis(self):
        """按接口分析"""
        endpoint_stats = self.df.groupby('endpoint').agg({
            'response_time': ['mean', 'median', 'min', 'max'],
            'success': 'mean',
            'timestamp': 'count'
        }).round(2)
        
        endpoint_stats.columns = [
            'avg_response_time', 'median_response_time', 
            'min_response_time', 'max_response_time',
            'success_rate', 'request_count'
        ]
        
        return endpoint_stats
    
    def time_series_analysis(self, interval='1min'):
        """时间序列分析"""
        self.df['interval'] = self.df['timestamp'].dt.round(interval)
        
        time_stats = self.df.groupby('interval').agg({
            'response_time': 'mean',
            'success': 'mean',
            'timestamp': 'count'
        }).rename(columns={'timestamp': 'requests_per_interval'})
        
        return time_stats
    
    def slow_requests_analysis(self, threshold=1000):
        """慢请求分析"""
        slow_requests = self.df[self.df['response_time'] > threshold]
        
        slow_analysis = {
            'slow_request_count': len(slow_requests),
            'slow_request_percentage': len(slow_requests) / len(self.df) * 100,
            'slow_endpoints': slow_requests['endpoint'].value_counts().to_dict()
        }
        
        return slow_analysis, slow_requests
    
    def error_analysis(self):
        """错误分析"""
        errors = self.df[self.df['success'] == False]
        
        error_analysis = {
            'error_count': len(errors),
            'error_rate': len(errors) / len(self.df) * 100,
            'error_codes': errors['status_code'].value_counts().to_dict(),
            'error_endpoints': errors['endpoint'].value_counts().to_dict()
        }
        
        return error_analysis, errors
```

### 报告生成器

```python
# report_generator.py
from jinja2 import Template
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
from datetime import datetime

class PerformanceReportGenerator:
    """性能报告生成器"""
    
    HTML_TEMPLATE = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>性能测试报告 - {{ title }}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #2c3e50; text-align: center; }
            h2 { color: #34495e; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
            .summary { background: #ecf0f1; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .metric { display: inline-block; margin: 10px; padding: 15px; 
                      background: white; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .metric-value { font-size: 24px; font-weight: bold; color: #2980b9; }
            .metric-label { font-size: 14px; color: #7f8c8d; }
            table { border-collapse: collapse; width: 100%; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #3498db; color: white; }
            tr:nth-child(even) { background-color: #f2f2f2; }
            .chart { margin: 30px 0; text-align: center; }
            .success { color: #27ae60; }
            .warning { color: #f39c12; }
            .error { color: #e74c3c; }
        </style>
    </head>
    <body>
        <h1>{{ title }}</h1>
        <p>测试时间: {{ test_time }}</p>
        
        <div class="summary">
            <h2>测试摘要</h2>
            <div class="metric">
                <div class="metric-value">{{ total_requests }}</div>
                <div class="metric-label">总请求数</div>
            </div>
            <div class="metric">
                <div class="metric-value {{ 'success' if success_rate > 95 else 'warning' if success_rate > 90 else 'error' }}">
                    {{ success_rate }}%
                </div>
                <div class="metric-label">成功率</div>
            </div>
            <div class="metric">
                <div class="metric-value">{{ avg_response_time }}ms</div>
                <div class="metric-label">平均响应时间</div>
            </div>
            <div class="metric">
                <div class="metric-value">{{ p95_response_time }}ms</div>
                <div class="metric-label">P95响应时间</div>
            </div>
        </div>
        
        <h2>各接口性能</h2>
        {{ endpoint_stats_table }}
        
        <h2>性能趋势图</h2>
        <div class="chart">
            <img src="{{ chart_filename }}" style="max-width: 100%;">
        </div>
        
        <h2>慢请求分析</h2>
        <p>慢请求数量: {{ slow_requests_count }} ({{ slow_requests_percentage }}%)</p>
        {{ slow_endpoints_table }}
        
        <h2>错误分析</h2>
        <p>错误数量: {{ error_count }} ({{ error_rate }}%)</p>
        {{ error_codes_table }}
    </body>
    </html>
    """
    
    def __init__(self, analyzer):
        self.analyzer = analyzer
    
    def generate_report(self, output_file='performance_report.html'):
        """生成完整报告"""
        # 获取分析结果
        basic_stats = self.analyzer.basic_statistics()
        endpoint_stats = self.analyzer.endpoint_analysis()
        
        slow_analysis, slow_requests = self.analyzer.slow_requests_analysis()
        error_analysis, errors = self.analyzer.error_analysis()
        
        # 生成图表
        chart_filename = self.generate_charts()
        
        # 渲染模板
        template = Template(self.HTML_TEMPLATE)
        html = template.render(
            title='游戏API性能测试报告',
            test_time=datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            total_requests=basic_stats['total_requests'],
            success_rate=f"{basic_stats['success_rate']:.2f}",
            avg_response_time=f"{basic_stats['avg_response_time']:.2f}",
            p95_response_time=f"{basic_stats['p95_response_time']:.2f}",
            endpoint_stats_table=endpoint_stats.to_html(classes='stats-table'),
            chart_filename=chart_filename,
            slow_requests_count=slow_analysis['slow_request_count'],
            slow_requests_percentage=f"{slow_analysis['slow_request_percentage']:.2f}",
            slow_endpoints_table=pd.Series(slow_analysis['slow_endpoints']).to_frame('慢请求次数').to_html(),
            error_count=error_analysis['error_count'],
            error_rate=f"{error_analysis['error_rate']:.2f}",
            error_codes_table=pd.Series(error_analysis['error_codes']).to_frame('错误次数').to_html()
        )
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(html)
        
        print(f"性能报告已生成: {output_file}")
    
    def generate_charts(self, output_file='performance_charts.png'):
        """生成性能图表"""
        fig, axes = plt.subplots(2, 2, figsize=(15, 12))
        
        # 1. 响应时间分布
        axes[0, 0].hist(self.analyzer.df['response_time'], bins=50, alpha=0.7)
        axes[0, 0].set_title('响应时间分布')
        axes[0, 0].set_xlabel('响应时间(ms)')
        axes[0, 0].set_ylabel('请求数量')
        
        # 2. 各接口平均响应时间
        endpoint_avg = self.analyzer.df.groupby('endpoint')['response_time'].mean()
        axes[0, 1].bar(range(len(endpoint_avg)), endpoint_avg.values)
        axes[0, 1].set_title('各接口平均响应时间')
        axes[0, 1].set_xlabel('接口')
        axes[0, 1].set_ylabel('响应时间(ms)')
        axes[0, 1].set_xticks(range(len(endpoint_avg)))
        axes[0, 1].set_xticklabels(endpoint_avg.index, rotation=45, ha='right')
        
        # 3. 时间序列趋势
        time_stats = self.analyzer.time_series_analysis()
        axes[1, 0].plot(time_stats.index, time_stats['response_time'])
        axes[1, 0].set_title('响应时间趋势')
        axes[1, 0].set_xlabel('时间')
        axes[1, 0].set_ylabel('平均响应时间(ms)')
        axes[1, 0].tick_params(axis='x', rotation=45)
        
        # 4. 成功率趋势
        axes[1, 1].plot(time_stats.index, time_stats['success'] * 100)
        axes[1, 1].set_title('成功率趋势')
        axes[1, 1].set_xlabel('时间')
        axes[1, 1].set_ylabel('成功率(%)')
        axes[1, 1].tick_params(axis='x', rotation=45)
        
        plt.tight_layout()
        plt.savefig(output_file, dpi=150, bbox_inches='tight')
        plt.close()
        
        return output_file

# 使用示例
analyzer = PerformanceAnalyzer('test_data.json')
report_gen = PerformanceReportGenerator(analyzer)
report_gen.generate_report()
```

---

## 项目总结

这3个实战项目涵盖了:

1. **Web游戏自动化测试框架**: 完整的Selenium测试框架,包含Page Object模式、配置管理、测试用例组织
2. **手游UI自动化测试**: Appium移动端测试框架,包含手势操作、页面对象、并发测试
3. **性能测试数据分析系统**: 数据收集、分析、可视化、报告生成的完整系统

每个项目都包含了完整的代码结构、最佳实践和可扩展的设计。

---

## 下一步

继续学习:
- [08. 最佳实践](08-best-practices.md)
- [09. 常见坑](09-common-pitfalls.md)
- [10. 面试题](10-interview-questions.md)
