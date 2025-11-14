# 09. 常见坑和解决方案

> 30+个常见问题和解决方案

---

## Selenium常见坑

### 1. NoSuchElementException

**问题**: 元素找不到,抛出NoSuchElementException

**原因**: 
- 元素还未加载完成
- 元素在iframe中
- 元素被动态创建/删除
- 定位器错误

**解决方案**:
```python
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By

# 使用显式等待
wait = WebDriverWait(driver, 10)
element = wait.until(
    EC.presence_of_element_located((By.ID, 'element-id'))
)

# 或者检查元素是否存在
def element_exists(driver, locator, timeout=3):
    try:
        WebDriverWait(driver, timeout).until(
            EC.presence_of_element_located(locator)
        )
        return True
    except:
        return False

if element_exists(driver, (By.ID, 'element-id')):
    element = driver.find_element(By.ID, 'element-id')
```

### 2. ElementNotInteractableException

**问题**: 元素存在但无法交互

**原因**:
- 元素被其他元素遮挡
- 元素不可见(visibility:hidden, display:none)
- 元素未完全加载

**解决方案**:
```python
# 滚动到元素
driver.execute_script("arguments[0].scrollIntoView();", element)

# 等待元素可点击
wait = WebDriverWait(driver, 10)
clickable_element = wait.until(
    EC.element_to_be_clickable((By.ID, 'button-id'))
)
clickable_element.click()

# 使用JavaScript点击
driver.execute_script("arguments[0].click();", element)
```

### 3. StaleElementReferenceException

**问题**: 元素引用失效,页面已刷新

**原因**: 
- 页面刷新
- DOM元素被重新创建
- 动态内容更新

**解决方案**:
```python
def safe_click(driver, locator):
    """安全点击,处理元素失效"""
    max_retries = 3
    for attempt in range(max_retries):
        try:
            element = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable(locator)
            )
            element.click()
            return True
        except StaleElementReferenceException:
            if attempt == max_retries - 1:
                raise
            time.sleep(0.5)
    return False

# 重新查找元素
def refresh_element(driver, locator):
    """刷新元素引用"""
    return driver.find_element(*locator)
```

### 4. TimeoutException

**问题**: 等待超时

**原因**:
- 网络慢
- 元素永远不会出现
- 错误的等待条件

**解决方案**:
```python
# 合理设置超时时间
wait = WebDriverWait(driver, 30)  # 增加超时时间

# 使用更精确的等待条件
wait.until(EC.text_to_be_present_in_element((By.ID, 'status'), '完成'))

# 组合等待条件
from selenium.webdriver.support import expected_conditions as EC

# 等待元素出现且可点击
wait.until(EC.element_to_be_clickable((By.ID, 'submit-btn')))

# 等待URL变化
wait.until(EC.url_contains('/dashboard'))
```

---

## Appium常见坑

### 1. Element定位问题

**问题**: Android/iOS元素定位困难

**解决方案**:
```python
from appium.webdriver.common.appiumby import AppiumBy

# Android推荐定位方式
# 1. Resource ID (最稳定)
element = driver.find_element(
    AppiumBy.ID, 'com.example.game:id/button_id'
)

# 2. UI Automator (Android特有)
element = driver.find_element(
    AppiumBy.ANDROID_UIAUTOMATOR,
    'new UiSelector().text("开始游戏")'
)

# 3. Accessibility ID (跨平台)
element = driver.find_element(
    AppiumBy.ACCESSIBILITY_ID, 'start_button'
)

# iOS推荐定位方式
# 1. Accessibility ID
element = driver.find_element(
    AppiumBy.ACCESSIBILITY_ID, 'start_button'
)

# 2. Predicate (iOS特有)
element = driver.find_element(
    AppiumBy.IOS_PREDICATE, 'label == "开始游戏"'
)
```

### 2. 权限弹窗处理

**问题**: 应用启动时出现权限弹窗

**解决方案**:
```python
def handle_permission_dialogs(driver):
    """处理权限弹窗"""
    permission_buttons = [
        'com.android.packageinstaller:id/permission_allow_button',
        'com.android.packageinstaller:id/permission_deny_button',
        'com.example.game:id/allow_location',
    ]
    
    for button_id in permission_buttons:
        try:
            allow_btn = WebDriverWait(driver, 3).until(
                EC.element_to_be_clickable((AppiumBy.ID, button_id))
            )
            allow_btn.click()
            break
        except:
            continue

# 在测试开始时调用
handle_permission_dialogs(driver)
```

### 3. 设备兼容性问题

**问题**: 不同设备上表现不一致

**解决方案**:
```python
def get_device_info(driver):
    """获取设备信息"""
    # Android
    if driver.capabilities['platformName'] == 'Android':
        model = driver.execute_script('mobile: shell', {
            'command': 'getprop ro.product.model'
        })
        version = driver.execute_script('mobile: shell', {
            'command': 'getprop ro.build.version.release'
        })
    # iOS
    else:
        model = driver.capabilities.get('deviceName')
        version = driver.capabilities.get('platformVersion')
    
    return {'model': model, 'version': version}

def adaptive_tap(driver, x, y):
    """自适应点击,考虑不同屏幕尺寸"""
    size = driver.get_window_size()
    scale_x = x / 1080  # 基于1080宽度设计
    scale_y = y / 1920  # 基于1920高度设计
    
    actual_x = int(size['width'] * scale_x)
    actual_y = int(size['height'] * scale_y)
    
    driver.tap([(actual_x, actual_y)])
```

---

## Pytest常见坑

### 1. fixture作用域问题

**问题**: fixture被多次创建

**解决方案**:
```python
import pytest

# 错误示例: 每次测试都创建新driver
@pytest.fixture
def driver():
    driver = webdriver.Chrome()
    yield driver
    driver.quit()

# 正确示例: 使用适当作用域
@pytest.fixture(scope='session')  # 整个测试会话只创建一次
def driver():
    driver = webdriver.Chrome()
    yield driver
    driver.quit()

# 或者使用function作用域(每个测试函数)
@pytest.fixture(scope='function')
def fresh_page(driver):
    driver.get('https://game.com')
    yield driver
    # 清理操作
```

### 2. 测试依赖问题

**问题**: 测试之间有依赖,导致失败

**解决方案**:
```python
# 错误: 测试依赖其他测试
def test_create_user():
    global user_id
    user_id = create_user('test_user')

def test_update_user():
    # 依赖test_create_user
    update_user(user_id, 'new_name')

# 正确: 每个测试独立
def test_create_user():
    user = create_user('test_user')
    assert user.name == 'test_user'

def test_update_user():
    # 独立创建用户
    user = create_user('test_user')
    updated_user = update_user(user.id, 'new_name')
    assert updated_user.name == 'new_name'
```

### 3. 并发测试问题

**问题**: 并行执行时出现数据冲突

**解决方案**:
```python
import threading

# 使用锁保护共享资源
lock = threading.Lock()

def create_unique_user():
    with lock:
        # 生成唯一用户名
        timestamp = int(time.time() * 1000)
        username = f"test_user_{timestamp}"
        return create_user(username)

# 或者使用pytest-xdist的测试隔离
@pytest.fixture(scope='session')
def unique_test_data():
    """为每个进程生成唯一测试数据"""
    import os
    process_id = os.getpid()
    return f"test_data_{process_id}"
```

---

## 性能测试常见坑

### 1. 虚假性能结果

**问题**: 测试结果不准确

**解决方案**:
```python
# 确保测试环境一致性
def setup_performance_test():
    """性能测试前的环境准备"""
    # 清理缓存
    clear_cache()
    
    # 重启服务
    restart_game_server()
    
    # 等待服务稳定
    time.sleep(5)
    
    # 预热
    for _ in range(10):
        make_test_request()

# 避免预热数据影响
def performance_test():
    setup_performance_test()
    
    # 预热请求
    for _ in range(100):
        make_test_request()
    
    # 实际测试
    results = []
    for _ in range(1000):
        start = time.time()
        response = make_test_request()
        response_time = (time.time() - start) * 1000
        results.append(response_time)
    
    return results
```

### 2. 资源泄露

**问题**: 长时间运行后内存/CPU占用过高

**解决方案**:
```python
import gc
import psutil

def monitor_resources():
    """监控资源使用"""
    process = psutil.Process()
    memory_mb = process.memory_info().rss / 1024 / 1024
    cpu_percent = process.cpu_percent()
    
    print(f"Memory: {memory_mb:.2f}MB, CPU: {cpu_percent}%")
    
    # 强制垃圾回收
    if memory_mb > 1000:  # 超过1GB
        gc.collect()

# 在长时间测试中定期调用
def long_running_test():
    for i in range(10000):
        make_request()
        if i % 1000 == 0:  # 每1000次监控一次
            monitor_resources()
```

---

## 数据库测试常见坑

### 1. 测试数据污染

**问题**: 测试数据相互影响

**解决方案**:
```python
import pytest

@pytest.fixture
def clean_database():
    """每次测试前清理数据库"""
    # 创建测试数据库
    test_db = create_test_database()
    
    yield test_db
    
    # 清理测试数据库
    drop_test_database(test_db)

@pytest.fixture
def transaction_rollback():
    """使用事务回滚"""
    conn = get_db_connection()
    conn.begin()
    
    try:
        yield conn
    finally:
        conn.rollback()  # 测试结束后回滚
        conn.close()
```

### 2. 并发访问冲突

**问题**: 多个测试同时访问数据库导致冲突

**解决方案**:
```python
import threading
import sqlite3

# 使用连接池
class DatabasePool:
    def __init__(self, db_path, max_connections=10):
        self.db_path = db_path
        self.max_connections = max_connections
        self.pool = []
        self.lock = threading.Lock()
        
        # 预创建连接
        for _ in range(max_connections):
            conn = sqlite3.connect(db_path)
            self.pool.append(conn)
    
    def get_connection(self):
        with self.lock:
            if self.pool:
                return self.pool.pop()
            else:
                return sqlite3.connect(self.db_path)
    
    def return_connection(self, conn):
        with self.lock:
            if len(self.pool) < self.max_connections:
                self.pool.append(conn)
            else:
                conn.close()
```

---

## API测试常见坑

### 1. 状态管理问题

**问题**: API调用间的状态依赖

**解决方案**:
```python
class APIClient:
    def __init__(self, base_url):
        self.base_url = base_url
        self.session = requests.Session()
        self.auth_token = None
    
    def login(self, username, password):
        """登录并保存token"""
        response = self.session.post(f"{self.base_url}/login", 
                                   json={'username': username, 'password': password})
        if response.status_code == 200:
            self.auth_token = response.json()['token']
            self.session.headers.update({'Authorization': f'Bearer {self.auth_token}'})
        return response
    
    def logout(self):
        """登出并清理token"""
        self.session.headers.pop('Authorization', None)
        self.auth_token = None

# 使用session管理状态
@pytest.fixture
def api_client():
    client = APIClient('https://api.game.com')
    yield client
    client.logout()  # 自动清理
```

### 2. 网络超时问题

**问题**: 网络不稳定导致测试失败

**解决方案**:
```python
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

def create_robust_session():
    """创建具有重试机制的会话"""
    session = requests.Session()
    
    # 配置重试策略
    retry_strategy = Retry(
        total=3,  # 总重试次数
        backoff_factor=1,  # 重试间隔
        status_forcelist=[429, 500, 502, 503, 504],  # 需要重试的状态码
    )
    
    adapter = HTTPAdapter(max_retries=retry_strategy)
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    
    # 设置超时
    session.timeout = 30
    
    return session

def make_api_call_with_retry(url, max_retries=3):
    """带重试的API调用"""
    for attempt in range(max_retries):
        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            return response
        except requests.exceptions.RequestException as e:
            if attempt == max_retries - 1:
                raise e
            time.sleep(2 ** attempt)  # 指数退避
```

---

## 移动端特殊问题

### 1. 应用状态管理

**问题**: 应用状态影响测试结果

**解决方案**:
```python
def reset_app_state(driver):
    """重置应用状态"""
    # 方式1: 使用noReset=false
    # 在capabilities中设置noReset=false
    
    # 方式2: 手动清理
    driver.remove_app('com.example.game')  # 卸载应用
    driver.install_app('/path/to/app.apk')  # 重新安装
    
    # 方式3: 清理应用数据
    driver.execute_script('mobile: shell', {
        'command': 'pm clear com.example.game'
    })

# 在测试前后调用
@pytest.fixture
def fresh_app(driver):
    reset_app_state(driver)
    driver.launch_app()
    yield driver
    driver.close_app()
```

### 2. 网络环境问题

**问题**: 不同网络环境下表现不一致

**解决方案**:
```python
def set_network_conditions(driver, network_type='wifi'):
    """设置网络条件"""
    if driver.capabilities['platformName'] == 'Android':
        if network_type == '2g':
            driver.execute_script('mobile: shell', {
                'command': 'am start -a android.intent.action.VIEW -d "https://www.google.com"'
            })
        elif network_type == 'offline':
            driver.execute_script('mobile: shell', {
                'command': 'svc data disable && svc wifi disable'
            })
    else:  # iOS
        # iOS需要使用XCUITest的网络模拟
        pass

def test_with_network_conditions():
    """在不同网络条件下测试"""
    for network in ['wifi', '3g', '4g']:
        set_network_conditions(driver, network)
        # 执行测试
        result = test_login()
        print(f"网络类型: {network}, 结果: {result}")
```

---

## 环境配置问题

### 1. 浏览器驱动问题

**问题**: ChromeDriver版本不匹配

**解决方案**:
```python
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service

# 自动管理驱动版本
def create_driver():
    service = Service(ChromeDriverManager().install())
    options = webdriver.ChromeOptions()
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    return webdriver.Chrome(service=service, options=options)

# 或者指定特定版本
def create_driver_with_version(version):
    service = Service(ChromeDriverManager(version=version).install())
    return webdriver.Chrome(service=service)
```

### 2. 环境变量问题

**问题**: 测试环境配置不一致

**解决方案**:
```python
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

class Config:
    def __init__(self):
        self.base_url = os.getenv('BASE_URL', 'https://game.com')
        self.browser = os.getenv('BROWSER', 'chrome')
        self.headless = os.getenv('HEADLESS', 'false').lower() == 'true'
        self.timeout = int(os.getenv('TIMEOUT', '10'))

# .env文件
"""
BASE_URL=https://staging.game.com
BROWSER=chrome
HEADLESS=true
TIMEOUT=15
"""
```

---

## 数据分析常见坑

### 1. 数据质量问题

**问题**: 测试数据不准确影响分析结果

**解决方案**:
```python
import pandas as pd
import numpy as np

def clean_performance_data(df):
    """清理性能测试数据"""
    # 移除异常值 (使用IQR方法)
    Q1 = df['response_time'].quantile(0.25)
    Q3 = df['response_time'].quantile(0.75)
    IQR = Q3 - Q1
    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR
    
    df_cleaned = df[
        (df['response_time'] >= lower_bound) & 
        (df['response_time'] <= upper_bound)
    ]
    
    # 处理缺失值
    df_cleaned = df_cleaned.dropna()
    
    # 检查数据一致性
    print(f"原始数据: {len(df)} 条")
    print(f"清理后: {len(df_cleaned)} 条")
    print(f"清理比例: {(len(df) - len(df_cleaned))/len(df)*100:.2f}%")
    
    return df_cleaned
```

### 2. 统计分析误区

**问题**: 错误的统计方法导致错误结论

**解决方案**:
```python
def proper_performance_analysis(df):
    """正确的性能分析"""
    # 使用适当的统计量
    stats = {
        'mean': df['response_time'].mean(),
        'median': df['response_time'].median(),  # 中位数对异常值不敏感
        'p95': df['response_time'].quantile(0.95),  # P95更能反映用户体验
        'p99': df['response_time'].quantile(0.99),
        'std': df['response_time'].std(),
        'min': df['response_time'].min(),
        'max': df['response_time'].max()
    }
    
    # 避免平均值误导
    print(f"平均响应时间: {stats['mean']:.2f}ms")
    print(f"中位数响应时间: {stats['median']:.2f}ms")
    print(f"注意: 如果平均值远大于中位数,可能存在异常值")
    
    return stats
```

---

## 最佳实践总结

### 预防措施

1. **充分的等待策略**: 使用显式等待而非固定时间等待
2. **异常处理**: 为可能失败的操作添加重试机制
3. **数据隔离**: 确保测试数据相互独立
4. **环境一致性**: 测试环境应与生产环境尽可能一致
5. **监控和日志**: 记录详细的测试日志便于问题排查

### 调试技巧

```python
def debug_element(driver, locator):
    """调试元素定位问题"""
    print(f"尝试定位: {locator}")
    
    # 检查页面源码
    print("页面源码片段:")
    print(driver.page_source[:500])
    
    # 尝试不同的定位方式
    try:
        element = driver.find_element(*locator)
        print(f"元素位置: {element.location}")
        print(f"元素大小: {element.size}")
        print(f"元素属性: {element.get_attributes()}")
    except Exception as e:
        print(f"定位失败: {e}")
    
    # 截图
    driver.save_screenshot('debug_screenshot.png')
    print("已保存调试截图")
```

---

## 下一步

继续学习:
- [10. 面试题](10-interview-questions.md)
- [Python指南总结](00-index.md#python-游戏测试自动化指南)
