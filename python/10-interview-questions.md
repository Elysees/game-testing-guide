# 10. 面试题精讲

> 40+道高频面试题及详细解答

---

## Python基础题 (10题)

### 1. Python中的`self`是什么?为什么需要它?

**答案**: 
`self`是Python类实例方法的第一个参数,代表类的实例本身。它用于区分实例变量和局部变量,以及调用实例方法。

```python
class Player:
    def __init__(self, name):
        self.name = name  # self.name是实例变量
    
    def get_name(self):
        return self.name  # 通过self访问实例变量
    
    def set_name(self, name):
        self.name = name  # 通过self修改实例变量
```

**面试要点**:
- `self`不是关键字,可以用其他名称,但约定使用`self`
- 构造函数`__init__`中必须使用`self`来创建实例变量
- 调用实例方法时不需要传递`self`参数

### 2. 解释Python中的GIL(全局解释器锁)

**答案**:
GIL(Global Interpreter Lock)是CPython解释器中的一个互斥锁,确保同一时刻只有一个线程执行Python字节码。

**影响**:
- 限制了多线程CPU密集型程序的性能
- 对I/O密集型程序影响较小
- 多进程可以绕过GIL限制

**示例**:
```python
import threading
import time

def cpu_intensive_task():
    """CPU密集型任务"""
    total = 0
    for i in range(10000000):
        total += i * i
    return total

# 多线程执行(受GIL影响)
start_time = time.time()
threads = []
for _ in range(4):
    t = threading.Thread(target=cpu_intensive_task)
    threads.append(t)
    t.start()

for t in threads:
    t.join()
print(f"多线程耗时: {time.time() - start_time}")

# 多进程执行(绕过GIL)
from multiprocessing import Pool
start_time = time.time()
with Pool(4) as p:
    results = p.map(cpu_intensive_task, range(4))
print(f"多进程耗时: {time.time() - start_time}")
```

### 3. Python中的装饰器是什么?如何自定义装饰器?

**答案**:
装饰器是修改或增强函数行为的函数,使用`@decorator_name`语法应用。

```python
# 基础装饰器
def timer(func):
    """计时装饰器"""
    import time
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} 执行时间: {end - start:.2f}秒")
        return result
    return wrapper

@timer
def slow_function():
    time.sleep(1)
    return "完成"

# 带参数的装饰器
def retry(max_attempts=3, delay=1):
    """重试装饰器"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts - 1:
                        raise e
                    time.sleep(delay)
        return wrapper
    return decorator

@retry(max_attempts=3, delay=2)
def unstable_api_call():
    # 可能失败的API调用
    pass
```

### 4. 解释Python中的生成器(generator)和迭代器(iterator)

**答案**:
- **迭代器**: 实现`__iter__()`和`__next__()`方法的对象
- **生成器**: 使用`yield`关键字的函数,自动实现迭代器协议

```python
# 自定义迭代器
class NumberIterator:
    def __init__(self, start, end):
        self.current = start
        self.end = end
    
    def __iter__(self):
        return self
    
    def __next__(self):
        if self.current < self.end:
            current = self.current
            self.current += 1
            return current
        raise StopIteration

# 生成器函数
def number_generator(start, end):
    current = start
    while current < end:
        yield current
        current += 1

# 生成器表达式
squares = (x**2 for x in range(10))

# 使用示例
for num in NumberIterator(1, 5):
    print(num)  # 输出: 1, 2, 3, 4

for num in number_generator(1, 5):
    print(num)  # 输出: 1, 2, 3, 4
```

### 5. Python中的深拷贝和浅拷贝有什么区别?

**答案**:
- **浅拷贝**: 创建新对象,但嵌套对象仍引用原对象
- **深拷贝**: 创建新对象,嵌套对象也完全复制

```python
import copy

# 浅拷贝示例
original = [[1, 2, 3], [4, 5, 6]]
shallow = copy.copy(original)
shallow[0][0] = 999

print(original)  # [[999, 2, 3], [4, 5, 6]] - 原对象也被修改
print(shallow)   # [[999, 2, 3], [4, 5, 6]]

# 深拷贝示例
original = [[1, 2, 3], [4, 5, 6]]
deep = copy.deepcopy(original)
deep[0][0] = 999

print(original)  # [[1, 2, 3], [4, 5, 6]] - 原对象未被修改
print(deep)      # [[999, 2, 3], [4, 5, 6]]
```

### 6. 解释Python中的`*args`和`**kwargs`

**答案**:
- `*args`: 接收任意数量的位置参数,打包为元组
- `**kwargs`: 接收任意数量的关键字参数,打包为字典

```python
def flexible_function(*args, **kwargs):
    print(f"位置参数: {args}")
    print(f"关键字参数: {kwargs}")

flexible_function(1, 2, 3, name="Alice", age=25)
# 输出:
# 位置参数: (1, 2, 3)
# 关键字参数: {'name': 'Alice', 'age': 25}

# 在装饰器中的应用
def log_calls(func):
    def wrapper(*args, **kwargs):
        print(f"调用 {func.__name__} 参数: {args}, {kwargs}")
        result = func(*args, **kwargs)
        print(f"{func.__name__} 返回: {result}")
        return result
    return wrapper
```

### 7. Python中的列表推导式和字典推导式

**答案**:
推导式提供简洁的创建列表/字典的方式。

```python
# 列表推导式
squares = [x**2 for x in range(10)]
evens = [x for x in range(20) if x % 2 == 0]

# 带条件的列表推导式
scores = [85, 92, 78, 96, 88]
high_scores = [score for score in scores if score >= 90]

# 字典推导式
name_lengths = {name: len(name) for name in ['Alice', 'Bob', 'Charlie']}
squared_dict = {x: x**2 for x in range(5)}

# 集合推导式
unique_lengths = {len(name) for name in ['Alice', 'Bob', 'Charlie', 'David']}

# 嵌套推导式
matrix = [[i*j for j in range(3)] for i in range(3)]
# 结果: [[0, 0, 0], [0, 1, 2], [0, 2, 4]]
```

### 8. 解释Python中的异常处理机制

**答案**:
Python使用try-except-finally语句处理异常。

```python
def safe_divide(a, b):
    try:
        result = a / b
        return result
    except ZeroDivisionError:
        print("错误: 除数不能为0")
        return None
    except TypeError:
        print("错误: 参数类型不正确")
        return None
    except Exception as e:
        print(f"未知错误: {e}")
        return None
    finally:
        print("计算完成")  # 无论是否有异常都会执行

# 自定义异常
class GameError(Exception):
    """游戏相关异常"""
    def __init__(self, message, error_code=None):
        super().__init__(message)
        self.error_code = error_code

def check_player_level(player):
    if player.level < 1:
        raise GameError("玩家等级不能小于1", error_code="INVALID_LEVEL")
```

### 9. Python中的`with`语句和上下文管理器

**答案**:
`with`语句确保资源的正确获取和释放。

```python
# 文件操作
with open('data.txt', 'r') as f:
    content = f.read()
# 文件自动关闭

# 自定义上下文管理器
class DatabaseConnection:
    def __enter__(self):
        print("连接数据库")
        self.connection = create_connection()
        return self.connection
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        print("关闭数据库")
        self.connection.close()
        
        # 如果有异常,返回True表示已处理
        if exc_type:
            print(f"处理异常: {exc_val}")
        return False

# 使用
with DatabaseConnection() as conn:
    # 数据库操作
    pass

# 使用contextlib
from contextlib import contextmanager

@contextmanager
def timer():
    start = time.time()
    try:
        yield
    finally:
        print(f"耗时: {time.time() - start:.2f}秒")
```

### 10. 解释Python中的`lambda`函数

**答案**:
`lambda`是创建匿名函数的简洁方式。

```python
# 基础用法
add = lambda x, y: x + y
square = lambda x: x**2

# 在高阶函数中使用
numbers = [1, 2, 3, 4, 5]
squared = list(map(lambda x: x**2, numbers))
evens = list(filter(lambda x: x % 2 == 0, numbers))

# 排序
players = [
    {'name': 'Alice', 'score': 95},
    {'name': 'Bob', 'score': 87},
    {'name': 'Charlie', 'score': 92}
]
sorted_players = sorted(players, key=lambda p: p['score'], reverse=True)

# 事件处理
button_callbacks = {
    'click': lambda: print("按钮被点击"),
    'hover': lambda: print("鼠标悬停")
}
```

---

## Selenium/Appium题 (15题)

### 11. Selenium中8种元素定位方式的区别和使用场景

**答案**:
```python
from selenium.webdriver.common.by import By

# 1. ID定位 - 最快最稳定
driver.find_element(By.ID, 'username')

# 2. Name定位 - 有name属性时使用
driver.find_element(By.NAME, 'password')

# 3. Class Name定位 - 单个class时使用
driver.find_element(By.CLASS_NAME, 'btn-primary')

# 4. Tag Name定位 - 获取特定标签元素
buttons = driver.find_elements(By.TAG_NAME, 'button')

# 5. Link Text - 完全匹配链接文本
driver.find_element(By.LINK_TEXT, '登录')

# 6. Partial Link Text - 部分匹配链接文本
driver.find_element(By.PARTIAL_LINK_TEXT, '登')

# 7. CSS Selector - 复杂定位时使用
driver.find_element(By.CSS_SELECTOR, '#username')
driver.find_element(By.CSS_SELECTOR, '.form-control[name="email"]')

# 8. XPath - 最强大,任何场景都可用
driver.find_element(By.XPATH, '//input[@id="username"]')
driver.find_element(By.XPATH, '//button[text()="提交"]')
```

**选择原则**:
- 优先使用ID,然后是Name、CSS Selector、XPath
- XPath功能强大但性能较差,谨慎使用
- CSS Selector性能好于XPath

### 12. Selenium中的显式等待和隐式等待的区别

**答案**:
```python
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# 隐式等待 - 全局设置,查找元素时自动等待
driver.implicitly_wait(10)  # 最多等待10秒

# 显式等待 - 针对特定条件等待
wait = WebDriverWait(driver, 10)
element = wait.until(
    EC.presence_of_element_located((By.ID, 'dynamic-element'))
)

# 常用的Expected Conditions
wait.until(EC.element_to_be_clickable((By.ID, 'submit-btn')))
wait.until(EC.visibility_of_element_located((By.CLASS_NAME, 'loading')))
wait.until(EC.text_to_be_present_in_element((By.ID, 'status'), '完成'))
wait.until(EC.url_contains('/dashboard'))
wait.until(EC.title_is('游戏主页'))
```

**区别**:
- 隐式等待: 设置一次,全局有效,找不到元素时等待
- 显式等待: 针对特定条件,可自定义等待逻辑
- 显式等待更精确,推荐使用

### 13. Appium中Android和iOS的元素定位方式

**答案**:
```python
from appium.webdriver.common.appiumby import AppiumBy

# Android定位方式
# 1. Resource ID (推荐)
element = driver.find_element(
    AppiumBy.ID, 'com.example.game:id/start_button'
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

# iOS定位方式
# 1. Accessibility ID (推荐)
element = driver.find_element(
    AppiumBy.ACCESSIBILITY_ID, 'start_button'
)

# 2. Predicate (iOS特有)
element = driver.find_element(
    AppiumBy.IOS_PREDICATE, 'label == "开始游戏"'
)

# 3. Class Chain (iOS特有)
element = driver.find_element(
    AppiumBy.IOS_CLASS_CHAIN, '**/XCUIElementTypeButton[`label == "开始"`]'
)
```

### 14. 如何处理Selenium中的iframe和多窗口

**答案**:
```python
# 处理iframe
# 切换到iframe (通过索引)
driver.switch_to.frame(0)

# 切换到iframe (通过name/id)
driver.switch_to.frame('game-frame')

# 切换到iframe (通过WebElement)
iframe = driver.find_element(By.ID, 'game-iframe')
driver.switch_to.frame(iframe)

# 切换回主文档
driver.switch_to.default_content()

# 切换到父框架
driver.switch_to.parent_frame()

# 处理多窗口
# 获取当前窗口句柄
current_window = driver.current_window_handle

# 获取所有窗口句柄
all_windows = driver.window_handles

# 切换窗口
for window in driver.window_handles:
    if window != current_window:
        driver.switch_to.window(window)
        break

# 关闭当前窗口
driver.close()

# 切换回原窗口
driver.switch_to.window(current_window)
```

### 15. 解释Page Object模式的优势和实现

**答案**:
```python
# 基础页面类
class BasePage:
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)
    
    def find_element(self, locator):
        return self.wait.until(EC.presence_of_element_located(locator))
    
    def click(self, locator):
        element = self.wait.until(EC.element_to_be_clickable(locator))
        element.click()
    
    def input_text(self, locator, text):
        element = self.find_element(locator)
        element.clear()
        element.send_keys(text)

# 登录页面
class LoginPage(BasePage):
    USERNAME_INPUT = (By.ID, 'username')
    PASSWORD_INPUT = (By.ID, 'password')
    LOGIN_BUTTON = (By.ID, 'login-btn')
    ERROR_MESSAGE = (By.CLASS_NAME, 'error')
    
    def login(self, username, password):
        self.input_text(self.USERNAME_INPUT, username)
        self.input_text(self.PASSWORD_INPUT, password)
        self.click(self.LOGIN_BUTTON)
    
    def get_error_message(self):
        try:
            element = self.find_element(self.ERROR_MESSAGE)
            return element.text
        except:
            return None

# 测试用例
def test_login():
    login_page = LoginPage(driver)
    login_page.login('test_user', 'test_pass')
    assert login_page.get_error_message() is None
```

**优势**:
- 代码复用: 页面元素和操作集中管理
- 易维护: 元素定位变化只需修改一处
- 可读性: 测试用例更清晰

### 16. 如何处理Selenium中的动态加载内容

**答案**:
```python
# 等待动态内容加载
wait = WebDriverWait(driver, 10)

# 等待元素出现
wait.until(EC.presence_of_element_located((By.CLASS_NAME, 'dynamic-content')))

# 等待元素可见
wait.until(EC.visibility_of_element_located((By.ID, 'loading-spinner')))

# 等待元素不可见(加载完成)
wait.until(EC.invisibility_of_element_located((By.CLASS_NAME, 'loading')))

# 等待文本出现
wait.until(EC.text_to_be_present_in_element((By.ID, 'status'), '加载完成'))

# 自定义等待条件
def element_has_class(locator, class_name):
    def _predicate(driver):
        element = driver.find_element(*locator)
        return class_name in element.get_attribute('class')
    return _predicate

wait.until(element_has_class((By.ID, 'status'), 'loaded'))
```

### 17. Appium中的手势操作如何实现

**答案**:
```python
from appium.webdriver.common.touch_action import TouchAction
from appium.webdriver.common.multi_action import MultiAction

# 点击坐标
driver.tap([(100, 200)])

# 长按
action = TouchAction(driver)
action.long_press(x=100, y=200, duration=2000).perform()

# 滑动
driver.swipe(start_x=500, start_y=1000, end_x=500, end_y=300, duration=800)

# 拖拽
source = driver.find_element(AppiumBy.ID, 'item1')
target = driver.find_element(AppiumBy.ID, 'item2')
driver.drag_and_drop(source, target)

# 多点触控 - 缩放
action1 = TouchAction(driver)
action1.press(x=200, y=500).move_to(x=100, y=400).release()

action2 = TouchAction(driver)
action2.press(x=400, y=500).move_to(x=500, y=600).release()

multi_action = MultiAction(driver)
multi_action.add(action1, action2)
multi_action.perform()

# 使用W3C Actions (新API)
from selenium.webdriver.common.actions.action_builder import ActionBuilder
from selenium.webdriver.common.actions.pointer_input import PointerInput

actions = ActionBuilder(driver)
pointer = PointerInput(PointerInput.TOUCH, "touch")
actions.add(pointer.create_pointer_move(x=100, y=100))
actions.add(pointer.create_pointer_down())
actions.add(pointer.create_pointer_move(x=200, y=200))
actions.add(pointer.create_pointer_up())
actions.perform()
```

### 18. 如何处理Selenium中的JavaScript执行

**答案**:
```python
# 执行JavaScript
result = driver.execute_script('return document.title')

# 点击被遮挡的元素
element = driver.find_element(By.ID, 'hidden-button')
driver.execute_script('arguments[0].click();', element)

# 滚动到元素
driver.execute_script('arguments[0].scrollIntoView();', element)

# 修改元素属性
driver.execute_script('arguments[0].value = "new value";', input_element)

# 滚动页面
driver.execute_script('window.scrollTo(0, document.body.scrollHeight);')

# 异步JavaScript
async_result = driver.execute_async_script('''
    var callback = arguments[arguments.length - 1];
    setTimeout(function() {
        callback(document.readyState);
    }, 1000);
''')
```

### 19. 解释Selenium Grid的架构和使用

**答案**:
```bash
# 启动Hub
java -jar selenium-server-standalone-3.141.59.jar -role hub

# 启动Node
java -jar selenium-server-standalone-3.141.59.jar -role node -hub http://hub-ip:4444/grid/register

# 代码中连接Grid
from selenium import webdriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities

# 连接到Grid
driver = webdriver.Remote(
    command_executor='http://hub-ip:4444/wd/hub',
    desired_capabilities=DesiredCapabilities.CHROME
)
```

**架构**:
- Hub: 统一管理,分发测试请求
- Node: 执行具体的测试任务
- 优势: 并行执行,多环境测试

### 20. 如何处理移动应用的权限弹窗

**答案**:
```python
def handle_permissions(driver):
    """处理权限弹窗"""
    permission_selectors = [
        (AppiumBy.ID, 'com.android.packageinstaller:id/permission_allow_button'),
        (AppiumBy.ID, 'com.android.packageinstaller:id/permission_deny_button'),
        (AppiumBy.ANDROID_UIAUTATOR, 'new UiSelector().text("允许")'),
        (AppiumBy.ANDROID_UIAUTOR, 'new UiSelector().text("拒绝")'),
    ]
    
    for selector in permission_selectors:
        try:
            element = WebDriverWait(driver, 3).until(
                EC.element_to_be_clickable(selector)
            )
            element.click()
            print("权限弹窗已处理")
            break
        except:
            continue

# 在测试开始时调用
def setup_test(driver):
    driver.launch_app()
    handle_permissions(driver)
```

### 21. Appium中如何处理原生和H5混合应用

**答案**:
```python
# 获取当前上下文
current_context = driver.current_context
print(f"当前上下文: {current_context}")

# 获取所有上下文
contexts = driver.contexts
print(f"所有上下文: {contexts}")

# 切换到WebView
for context in contexts:
    if 'WEBVIEW' in context:
        driver.switch_to.context(context)
        break

# 执行H5页面操作
driver.find_element(By.ID, 'h5-element').click()

# 切换回原生
driver.switch_to.context('NATIVE_APP')

# 验证当前上下文
assert driver.current_context == 'NATIVE_APP'
```

### 22. 如何优化Selenium测试的执行速度

**答案**:
```python
# 1. 使用headless模式
options = webdriver.ChromeOptions()
options.add_argument('--headless')

# 2. 禁用图片加载
prefs = {'profile.managed_default_content_settings.images': 2}
options.add_experimental_option('prefs', prefs)

# 3. 禁用通知
options.add_argument('--disable-notifications')

# 4. 设置合适的超时时间
driver.implicitly_wait(5)  # 减少隐式等待时间

# 5. 重用浏览器实例
@pytest.fixture(scope='session')
def driver():
    driver = webdriver.Chrome(options=options)
    yield driver
    driver.quit()

# 6. 并行执行测试
# pytest -n 4

# 7. 使用显式等待而非固定时间等待
wait = WebDriverWait(driver, 10)
element = wait.until(EC.element_to_be_clickable((By.ID, 'button')))
```

### 23. 解释Selenium中的Expected Conditions

**答案**:
```python
from selenium.webdriver.support import expected_conditions as EC

# 元素相关
EC.presence_of_element_located((By.ID, 'element'))  # 元素存在
EC.visibility_of_element_located((By.ID, 'element'))  # 元素可见
EC.element_to_be_clickable((By.ID, 'button'))  # 元素可点击
EC.invisibility_of_element_located((By.CLASS_NAME, 'loading'))  # 元素不可见

# 文本相关
EC.text_to_be_present_in_element((By.ID, 'status'), '完成')  # 元素包含文本
EC.text_to_be_present_in_element_value((By.ID, 'input'), 'value')  # 输入框值

# 标题和URL相关
EC.title_is('页面标题')  # 标题完全匹配
EC.title_contains('游戏')  # 标题包含
EC.url_contains('/dashboard')  # URL包含
EC.url_matches(r'^https://game\.com/dashboard')  # URL正则匹配

# 框架相关
EC.frame_to_be_available_and_switch_to_it((By.ID, 'iframe'))  # iframe可用

# 弹窗相关
EC.alert_is_present()  # alert存在
```

### 24. 如何处理Selenium中的文件上传和下载

**答案**:
```python
# 文件上传
file_input = driver.find_element(By.ID, 'file-upload')
file_input.send_keys('/path/to/file.txt')

# 文件下载 - 配置下载路径
options = webdriver.ChromeOptions()
prefs = {
    'download.default_directory': '/path/to/download/directory',
    'download.prompt_for_download': False,
    'download.directory_upgrade': True,
    'safebrowsing.enabled': True
}
options.add_experimental_option('prefs', prefs)

# 等待文件下载完成
import os
import time

def wait_for_download(file_path, timeout=30):
    """等待文件下载完成"""
    start_time = time.time()
    while time.time() - start_time < timeout:
        if os.path.exists(file_path):
            # 检查文件是否还在写入(大小是否稳定)
            initial_size = os.path.getsize(file_path)
            time.sleep(1)
            final_size = os.path.getsize(file_path)
            if initial_size == final_size:
                return True
        time.sleep(1)
    return False
```

### 25. Appium中如何处理不同屏幕尺寸的适配

**答案**:
```python
def get_element_position(driver, element):
    """获取元素在屏幕上的相对位置"""
    size = driver.get_window_size()
    location = element.location
    size_element = element.size
    
    # 计算中心点坐标
    center_x = location['x'] + size_element['width'] // 2
    center_y = location['y'] + size_element['height'] // 2
    
    # 转换为相对坐标(0-1)
    relative_x = center_x / size['width']
    relative_y = center_y / size['height']
    
    return relative_x, relative_y

def tap_relative_position(driver, relative_x, relative_y):
    """根据相对位置点击"""
    size = driver.get_window_size()
    absolute_x = int(size['width'] * relative_x)
    absolute_y = int(size['height'] * relative_y)
    
    driver.tap([(absolute_x, absolute_y)])

# 使用示例
element = driver.find_element(AppiumBy.ID, 'game-button')
rel_x, rel_y = get_element_position(driver, element)
tap_relative_position(driver, rel_x, rel_y)
```

---

## 框架设计题 (10题)

### 26. 如何设计一个可扩展的自动化测试框架

**答案**:
```python
# 框架结构
"""
test_framework/
├── conftest.py              # Pytest配置
├── pytest.ini              # Pytest配置
├── pages/                  # Page Objects
│   ├── __init__.py
│   ├── base_page.py
│   ├── login_page.py
│   └── game_page.py
├── tests/                  # 测试用例
│   ├── __init__.py
│   ├── test_login.py
│   └── test_game.py
├── utils/                  # 工具类
│   ├── __init__.py
│   ├── config.py
│   ├── logger.py
│   └── report_generator.py
├── configs/                # 配置文件
│   ├── test_config.yaml
│   └── environments.yaml
└── data/                   # 测试数据
    ├── test_users.json
    └── game_data.json
"""

# 配置管理
class Config:
    def __init__(self, config_file='configs/test_config.yaml'):
        with open(config_file, 'r', encoding='utf-8') as f:
            self.config = yaml.safe_load(f)
    
    def get(self, key, default=None):
        keys = key.split('.')
        value = self.config
        for k in keys:
            value = value.get(k, {})
        return value if value != {} else default

# 基础页面类
class BasePage:
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)
        self.logger = logging.getLogger(self.__class__.__name__)

# 数据驱动测试
@pytest.mark.parametrize('test_data', load_test_data('login_test_cases.json'))
def test_login_data_driven(test_data):
    username = test_data['username']
    password = test_data['password']
    expected_result = test_data['expected_result']
    
    login_page = LoginPage(driver)
    login_page.login(username, password)
    assert login_page.is_login_successful() == expected_result
```

### 27. 如何实现测试数据的管理和清理

**答案**:
```python
class TestDataManager:
    """测试数据管理器"""
    
    def __init__(self):
        self.created_data = []  # 跟踪创建的数据
    
    def create_test_user(self):
        """创建测试用户"""
        user_data = {
            'username': f"test_user_{int(time.time() * 1000)}",
            'email': f"test_{int(time.time() * 1000)}@example.com",
            'password': 'test123'
        }
        
        # 创建用户
        user = create_user_api(user_data)
        self.created_data.append(('user', user['id']))
        return user
    
    def create_test_game_data(self):
        """创建测试游戏数据"""
        game_data = {
            'player_id': self.get_test_user()['id'],
            'level': 1,
            'score': 0
        }
        
        game = create_game_data_api(game_data)
        self.created_data.append(('game_data', game['id']))
        return game
    
    def cleanup_all(self):
        """清理所有创建的数据"""
        for data_type, data_id in reversed(self.created_data):
            try:
                if data_type == 'user':
                    delete_user_api(data_id)
                elif data_type == 'game_data':
                    delete_game_data_api(data_id)
            except Exception as e:
                print(f"清理失败 {data_type} {data_id}: {e}")
        self.created_data.clear()

# 使用fixture管理数据
@pytest.fixture
def test_data_manager():
    manager = TestDataManager()
    yield manager
    manager.cleanup_all()  # 自动清理
```

### 28. 如何实现测试报告的自动生成

**答案**:
```python
# 使用Allure生成报告
import allure

@allure.feature('玩家系统')
@allure.story('登录功能')
@allure.severity(allure.severity_level.CRITICAL)
def test_player_login():
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
        assert True

# 自定义HTML报告
class HTMLReportGenerator:
    def __init__(self):
        self.results = []
    
    def add_result(self, test_name, status, duration, error=None):
        self.results.append({
            'name': test_name,
            'status': status,
            'duration': duration,
            'error': error
        })
    
    def generate_report(self, output_file='report.html'):
        # 使用模板生成HTML报告
        html = f"""
        <html>
        <head><title>测试报告</title></head>
        <body>
            <h1>自动化测试报告</h1>
            <table>
                <tr><th>测试名称</th><th>状态</th><th>耗时</th></tr>
                {''.join([
                    f'<tr><td>{r["name"]}</td><td>{r["status"]}</td><td>{r["duration"]}</td></tr>'
                    for r in self.results
                ])}
            </table>
        </body>
        </html>
        """
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(html)
```

### 29. 如何实现测试用例的优先级和分组

**答案**:
```python
# 使用pytest标记
@pytest.mark.smoke
@pytest.mark.critical
def test_login():
    """冒烟测试 - 登录"""
    pass

@pytest.mark.regression
@pytest.mark.high
def test_game_features():
    """回归测试 - 游戏功能"""
    pass

@pytest.mark.low
def test_ui_elements():
    """低优先级 - UI元素"""
    pass

# pytest.ini配置
"""
[tool:pytest]
markers =
    smoke: 冒烟测试
    regression: 回归测试
    critical: 关键功能
    high: 高优先级
    medium: 中优先级
    low: 低优先级
"""

# 运行特定标记的测试
# pytest -m smoke          # 只运行冒烟测试
# pytest -m "critical or high"  # 运行关键或高优先级
# pytest -m "not low"      # 排除低优先级
```

### 30. 如何实现测试环境的动态切换

**答案**:
```python
# 环境配置
class EnvironmentManager:
    def __init__(self):
        self.environments = {
            'dev': {
                'base_url': 'https://dev.game.com',
                'api_url': 'https://api-dev.game.com',
                'db_host': 'dev-db.game.com'
            },
            'staging': {
                'base_url': 'https://staging.game.com',
                'api_url': 'https://api-staging.game.com',
                'db_host': 'staging-db.game.com'
            },
            'prod': {
                'base_url': 'https://game.com',
                'api_url': 'https://api.game.com',
                'db_host': 'prod-db.game.com'
            }
        }
    
    def get_environment(self, env_name):
        return self.environments.get(env_name, self.environments['dev'])

# 使用环境变量
@pytest.fixture(scope='session')
def environment():
    env = os.getenv('TEST_ENV', 'dev')
    return EnvironmentManager().get_environment(env)

# 在测试中使用
def test_with_environment(environment):
    driver.get(environment['base_url'])
    # 执行测试
```

### 31. 如何实现测试结果的统计分析

**答案**:
```python
import pandas as pd
import matplotlib.pyplot as plt

class TestResultAnalyzer:
    def __init__(self, result_file):
        self.df = pd.read_csv(result_file)
    
    def basic_stats(self):
        """基础统计"""
        total = len(self.df)
        passed = len(self.df[self.df['status'] == 'PASSED'])
        failed = len(self.df[self.df['status'] == 'FAILED'])
        
        stats = {
            'total': total,
            'passed': passed,
            'failed': failed,
            'pass_rate': passed / total * 100 if total > 0 else 0
        }
        return stats
    
    def by_test_type(self):
        """按测试类型统计"""
        return self.df.groupby('test_type')['status'].value_counts().unstack(fill_value=0)
    
    def execution_time_analysis(self):
        """执行时间分析"""
        time_stats = self.df['duration'].describe()
        return time_stats
    
    def generate_charts(self, output_dir='charts'):
        """生成统计图表"""
        os.makedirs(output_dir, exist_ok=True)
        
        # 通过率饼图
        stats = self.basic_stats()
        plt.pie([stats['passed'], stats['failed']], 
                labels=['通过', '失败'], autopct='%1.1f%%')
        plt.title('测试通过率')
        plt.savefig(f'{output_dir}/pass_rate.png')
        plt.close()
        
        # 按类型统计柱状图
        type_stats = self.by_test_type()
        type_stats.plot(kind='bar', stacked=True)
        plt.title('各类型测试结果')
        plt.savefig(f'{output_dir}/by_type.png')
        plt.close()
```

### 32. 如何实现测试用例的参数化和数据驱动

**答案**:
```python
# 使用pytest参数化
@pytest.mark.parametrize('username,password,expected', [
    ('valid_user', 'valid_pass', True),
    ('invalid_user', 'any_pass', False),
    ('', 'any_pass', False),
    ('user', '', False),
])
def test_login_scenarios(login_page, username, password, expected):
    login_page.login(username, password)
    assert login_page.is_login_successful() == expected

# 从文件加载测试数据
def load_test_data_from_csv(file_path):
    """从CSV加载测试数据"""
    import csv
    test_data = []
    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            test_data.append({
                'username': row['username'],
                'password': row['password'],
                'expected': row['expected'].lower() == 'true'
            })
    return test_data

@pytest.mark.parametrize(
    'test_case', 
    load_test_data_from_csv('test_data/login_scenarios.csv')
)
def test_login_from_csv(login_page, test_case):
    login_page.login(test_case['username'], test_case['password'])
    assert login_page.is_login_successful() == test_case['expected']

# 使用fixture提供参数化数据
@pytest.fixture(params=[
    {'level': 1, 'exp': 0, 'expected_next_level_exp': 1000},
    {'level': 5, 'exp': 2500, 'expected_next_level_exp': 5000},
    {'level': 10, 'exp': 10000, 'expected_next_level_exp': 15000},
])
def level_data(request):
    return request.param

def test_level_calculation(level_data):
    player = Player(level=level_data['level'], exp=level_data['exp'])
    expected = level_data['expected_next_level_exp']
    assert player.get_exp_for_next_level() == expected
```

### 33. 如何实现测试的并发执行和资源管理

**答案**:
```python
# 使用pytest-xdist实现并发
# pytest -n 4  # 使用4个进程

# 资源池管理
class ResourcePool:
    def __init__(self, resource_type, max_resources=5):
        self.resource_type = resource_type
        self.max_resources = max_resources
        self.available = []
        self.allocated = {}
        self.lock = threading.Lock()
    
    def acquire(self):
        """获取资源"""
        with self.lock:
            if self.available:
                resource = self.available.pop()
            else:
                if len(self.allocated) < self.max_resources:
                    resource = self.create_resource()
                else:
                    # 等待资源释放
                    raise Exception("资源不足")
            
            thread_id = threading.current_thread().ident
            self.allocated[thread_id] = resource
            return resource
    
    def release(self):
        """释放资源"""
        with self.lock:
            thread_id = threading.current_thread().ident
            if thread_id in self.allocated:
                resource = self.allocated.pop(thread_id)
                self.available.append(resource)
    
    def create_resource(self):
        """创建资源"""
        if self.resource_type == 'driver':
            return webdriver.Chrome()
        # 其他资源类型

# 使用示例
@pytest.fixture(scope='session')
def resource_pool():
    return ResourcePool('driver', max_resources=3)

@pytest.fixture
def driver(resource_pool):
    driver = resource_pool.acquire()
    yield driver
    resource_pool.release()
```

### 34. 如何实现测试的依赖管理和执行顺序

**答案**:
```python
# 使用pytest-dependency插件
import pytest

@pytest.mark.dependency()
def test_create_user():
    """创建用户 - 无依赖"""
    user = create_user('test_user')
    assert user is not None

@pytest.mark.dependency(depends=["test_create_user"])
def test_update_user():
    """更新用户 - 依赖创建用户"""
    # 前置条件: 用户已创建
    user = get_user('test_user')
    updated_user = update_user(user.id, 'new_name')
    assert updated_user.name == 'new_name'

@pytest.mark.dependency(depends=["test_update_user"])
def test_delete_user():
    """删除用户 - 依赖更新用户"""
    # 前置条件: 用户已更新
    result = delete_user('test_user')
    assert result is True

# 自定义依赖管理
class DependencyManager:
    def __init__(self):
        self.completed_tests = set()
        self.dependencies = {}
    
    def register_dependency(self, test_name, depends_on=None):
        """注册测试依赖"""
        self.dependencies[test_name] = depends_on or []
    
    def can_run(self, test_name):
        """检查是否可以运行测试"""
        deps = self.dependencies.get(test_name, [])
        return all(dep in self.completed_tests for dep in deps)
    
    def mark_completed(self, test_name):
        """标记测试完成"""
        self.completed_tests.add(test_name)

# 使用类组织相关测试
class TestUserWorkflow:
    """用户工作流测试 - 保持顺序"""
    
    def test_01_create_user(self):
        """创建用户"""
        self.user_id = create_user('test_user')['id']
        assert self.user_id is not None
    
    def test_02_update_user(self):
        """更新用户 - 依赖创建"""
        result = update_user(self.user_id, 'updated_name')
        assert result['name'] == 'updated_name'
    
    def test_03_delete_user(self):
        """删除用户 - 依赖更新"""
        result = delete_user(self.user_id)
        assert result is True
```

### 35. 如何实现测试框架的配置热更新

**答案**:
```python
import json
import threading
import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class ConfigWatcher(FileSystemEventHandler):
    """配置文件监听器"""
    
    def __init__(self, config_manager):
        self.config_manager = config_manager
        self.last_modified = 0
    
    def on_modified(self, event):
        if event.src_path.endswith('.json') or event.src_path.endswith('.yaml'):
            current_time = time.time()
            if current_time - self.last_modified > 1:  # 防抖
                self.config_manager.reload_config()
                self.last_modified = current_time

class ConfigManager:
    """配置管理器"""
    
    def __init__(self, config_file):
        self.config_file = config_file
        self.config = self.load_config()
        self.observers = []
        self.start_watching()
    
    def load_config(self):
        """加载配置"""
        with open(self.config_file, 'r', encoding='utf-8') as f:
            if self.config_file.endswith('.json'):
                return json.load(f)
            elif self.config_file.endswith('.yaml'):
                import yaml
                return yaml.safe_load(f)
    
    def reload_config(self):
        """重新加载配置"""
        print("检测到配置文件更改，重新加载...")
        self.config = self.load_config()
        self.notify_observers()
    
    def add_observer(self, observer):
        """添加观察者"""
        self.observers.append(observer)
    
    def notify_observers(self):
        """通知观察者配置更新"""
        for observer in self.observers:
            observer.on_config_update(self.config)
    
    def start_watching(self):
        """开始监听配置文件"""
        event_handler = ConfigWatcher(self)
        observer = Observer()
        observer.schedule(event_handler, path=os.path.dirname(self.config_file), recursive=False)
        observer.start()

# 使用示例
class TestComponent:
    """测试组件 - 响应配置更新"""
    
    def __init__(self, config_manager):
        self.config_manager = config_manager
        self.config_manager.add_observer(self)
        self.update_config(self.config_manager.config)
    
    def on_config_update(self, new_config):
        """配置更新回调"""
        self.update_config(new_config)
        print(f"组件配置已更新: {new_config}")
    
    def update_config(self, config):
        """更新内部配置"""
        self.timeout = config.get('timeout', 10)
        self.retry_count = config.get('retry_count', 3)
```

---

## 性能测试题 (5题)

### 36. 如何使用Locust进行压力测试

**答案**:
```python
from locust import HttpUser, task, between, TaskSet

class GameUser(HttpUser):
    wait_time = between(1, 3)
    
    def on_start(self):
        """用户开始时执行 - 登录"""
        response = self.client.post('/api/login', json={
            'username': 'test_user',
            'password': 'test_pass'
        })
        if response.status_code == 200:
            self.token = response.json()['token']
            self.client.headers.update({'Authorization': f'Bearer {self.token}'})
    
    @task(3)  # 权重3,执行频率更高
    def view_profile(self):
        """查看个人资料"""
        self.client.get('/api/profile')
    
    @task(2)
    def play_game(self):
        """玩游戏"""
        self.client.post('/api/game/play', json={
            'level_id': 1
        })
    
    @task(1)
    def buy_item(self):
        """购买道具"""
        self.client.post('/api/shop/buy', json={
            'item_id': 1001
        })

# 复杂场景
class GameBehavior(TaskSet):
    """游戏行为集合"""
    
    @task(5)
    def browse_shop(self):
        self.client.get('/api/shop/items')
    
    @task(3)
    def battle(self):
        self.client.post('/api/battle/start', json={
            'enemy_id': 100
        })
    
    @task(1)
    def upgrade_equipment(self):
        self.client.post('/api/equipment/upgrade', json={
            'equipment_id': 1
        })

class AdvancedGameUser(HttpUser):
    tasks = [GameBehavior]
    wait_time = between(0.5, 2)
    
    def on_start(self):
        # 登录逻辑
        pass

# 运行命令:
# locust -f locustfile.py --host=https://api.game.com
```

### 37. 如何分析性能测试结果

**答案**:
```python
import pandas as pd
import matplotlib.pyplot as plt

def analyze_locust_results(log_file):
    """分析Locust测试结果"""
    # 从Locust生成的CSV文件分析
    df = pd.read_csv(log_file)
    
    # 基础统计
    stats = {
        'total_requests': len(df),
        'success_rate': (df['status'] == '200').mean() * 100,
        'avg_response_time': df['response_time'].mean(),
        'p95_response_time': df['response_time'].quantile(0.95),
        'p99_response_time': df['response_time'].quantile(0.99),
        'min_response_time': df['response_time'].min(),
        'max_response_time': df['response_time'].max()
    }
    
    # 按端点分析
    endpoint_stats = df.groupby('endpoint').agg({
        'response_time': ['mean', 'median', 'max'],
        'status': lambda x: (x == '200').mean() * 100
    })
    
    return stats, endpoint_stats

def generate_performance_report(stats, endpoint_stats, output_file='performance_report.html'):
    """生成性能报告"""
    html = f"""
    <html>
    <head><title>性能测试报告</title></head>
    <body>
        <h1>性能测试报告</h1>
        <h2>总体统计</h2>
        <ul>
            <li>总请求数: {stats['total_requests']}</li>
            <li>成功率: {stats['success_rate']:.2f}%</li>
            <li>平均响应时间: {stats['avg_response_time']:.2f}ms</li>
            <li>P95响应时间: {stats['p95_response_time']:.2f}ms</li>
            <li>P99响应时间: {stats['p99_response_time']:.2f}ms</li>
        </ul>
        
        <h2>各端点性能</h2>
        {endpoint_stats.to_html()}
    </body>
    </html>
    """
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(html)

# 实时监控
def monitor_performance():
    """实时性能监控"""
    import psutil
    import time
    
    while True:
        cpu_percent = psutil.cpu_percent()
        memory_percent = psutil.virtual_memory().percent
        network = psutil.net_io_counters()
        
        print(f"CPU: {cpu_percent}%, Memory: {memory_percent}%, "
              f"Network: RX={network.bytes_recv}, TX={network.bytes_sent}")
        
        time.sleep(5)
```

### 38. 如何进行数据库性能测试

**答案**:
```python
import time
import threading
from concurrent.futures import ThreadPoolExecutor
import psycopg2

class DatabasePerformanceTester:
    """数据库性能测试器"""
    
    def __init__(self, connection_string):
        self.connection_string = connection_string
    
    def test_query_performance(self, query, params=None, iterations=100):
        """测试查询性能"""
        times = []
        
        for _ in range(iterations):
            start_time = time.time()
            try:
                with psycopg2.connect(self.connection_string) as conn:
                    with conn.cursor() as cur:
                        cur.execute(query, params)
                        cur.fetchall()
            except Exception as e:
                print(f"查询错误: {e}")
                continue
            finally:
                query_time = (time.time() - start_time) * 1000
                times.append(query_time)
        
        return {
            'avg_time': sum(times) / len(times) if times else 0,
            'min_time': min(times) if times else 0,
            'max_time': max(times) if times else 0,
            'p95_time': sorted(times)[int(len(times)*0.95)] if times else 0,
            'total_time': sum(times)
        }
    
    def test_concurrent_queries(self, query, num_threads=10, iterations_per_thread=50):
        """测试并发查询"""
        def run_queries():
            times = []
            for _ in range(iterations_per_thread):
                start_time = time.time()
                try:
                    with psycopg2.connect(self.connection_string) as conn:
                        with conn.cursor() as cur:
                            cur.execute(query)
                            cur.fetchall()
                except Exception as e:
                    print(f"线程查询错误: {e}")
                    continue
                finally:
                    times.append((time.time() - start_time) * 1000)
            return times
        
        all_times = []
        with ThreadPoolExecutor(max_workers=num_threads) as executor:
            futures = [executor.submit(run_queries) for _ in range(num_threads)]
            for future in futures:
                all_times.extend(future.result())
        
        return all_times

# 使用示例
tester = DatabasePerformanceTester('postgresql://user:pass@localhost/game_db')

# 测试单个查询
result = tester.test_query_performance(
    "SELECT * FROM players WHERE level > %s", 
    params=(50,), 
    iterations=1000
)
print(f"查询性能: {result}")

# 测试并发
concurrent_times = tester.test_concurrent_queries(
    "SELECT COUNT(*) FROM players", 
    num_threads=20, 
    iterations_per_thread=100
)
print(f"并发查询完成, 平均时间: {sum(concurrent_times)/len(concurrent_times):.2f}ms")
```

### 39. 如何进行API性能基准测试

**答案**:
```python
import requests
import time
import statistics
from concurrent.futures import ThreadPoolExecutor, as_completed

class APIBenchmark:
    """API基准测试工具"""
    
    def __init__(self, base_url):
        self.base_url = base_url
        self.session = requests.Session()
    
    def single_request_benchmark(self, endpoint, method='GET', **kwargs):
        """单个请求基准测试"""
        url = f"{self.base_url}{endpoint}"
        times = []
        
        # 预热
        for _ in range(10):
            try:
                getattr(self.session, method.lower())(url, **kwargs)
            except:
                pass
        
        # 正式测试
        for _ in range(100):
            start = time.time()
            try:
                response = getattr(self.session, method.lower())(url, **kwargs)
                request_time = (time.time() - start) * 1000
                if response.status_code == 200:
                    times.append(request_time)
            except Exception as e:
                print(f"请求失败: {e}")
        
        if times:
            return {
                'avg': statistics.mean(times),
                'median': statistics.median(times),
                'p95': statistics.quantiles(times, n=20)[-1],  # P95
                'min': min(times),
                'max': max(times),
                'std': statistics.stdev(times) if len(times) > 1 else 0
            }
        return None
    
    def concurrent_benchmark(self, endpoint, num_users=10, duration=60, method='GET', **kwargs):
        """并发基准测试"""
        url = f"{self.base_url}{endpoint}"
        results = []
        lock = threading.Lock()
        
        def make_requests():
            user_results = []
            start_time = time.time()
            
            while time.time() - start_time < duration:
                req_start = time.time()
                try:
                    response = getattr(requests, method.lower())(url, **kwargs)
                    response_time = (time.time() - req_start) * 1000
                    user_results.append({
                        'response_time': response_time,
                        'status_code': response.status_code,
                        'success': response.status_code == 200
                    })
                except Exception as e:
                    user_results.append({
                        'response_time': (time.time() - req_start) * 1000,
                        'status_code': 0,
                        'success': False,
                        'error': str(e)
                    })
                
                time.sleep(0.1)  # 模拟用户操作间隔
            
            with lock:
                results.extend(user_results)
        
        with ThreadPoolExecutor(max_workers=num_users) as executor:
            futures = [executor.submit(make_requests) for _ in range(num_users)]
            for future in as_completed(futures):
                future.result()
        
        # 分析结果
        successful = [r for r in results if r['success']]
        failed = [r for r in results if not r['success']]
        
        return {
            'total_requests': len(results),
            'successful_requests': len(successful),
            'failed_requests': len(failed),
            'success_rate': len(successful) / len(results) * 100 if results else 0,
            'avg_response_time': statistics.mean([r['response_time'] for r in successful]) if successful else 0,
            'p95_response_time': statistics.quantiles([r['response_time'] for r in successful], n=20)[-1] if successful else 0,
            'throughput': len(results) / duration if duration > 0 else 0  # 请求/秒
        }

# 使用示例
benchmark = APIBenchmark('https://api.game.com')

# 单个请求测试
result = benchmark.single_request_benchmark('/api/players')
print(f"API基准测试结果: {result}")

# 并发测试
concurrent_result = benchmark.concurrent_benchmark(
    '/api/leaderboard', 
    num_users=50, 
    duration=300  # 5分钟
)
print(f"并发测试结果: {concurrent_result}")
```

### 40. 如何进行移动端性能测试

**答案**:
```python
from appium import webdriver
from appium.options.android import UiAutomator2Options
import time
import threading

class MobilePerformanceTester:
    """移动端性能测试器"""
    
    def __init__(self):
        self.driver = None
    
    def setup_android_performance_test(self):
        """设置Android性能测试"""
        options = UiAutomator2Options()
        options.platform_name = 'Android'
        options.device_name = 'Android Emulator'
        options.app_package = 'com.example.game'
        options.app_activity = '.MainActivity'
        options.enablePerformanceLogging = True
        
        self.driver = webdriver.Remote('http://localhost:4723', options=options)
    
    def get_android_performance_data(self):
        """获取Android性能数据"""
        # CPU使用率
        cpu_data = self.driver.execute_script('mobile: shell', {
            'command': 'top -n 1 -p $(pidof com.example.game) | grep com.example.game'
        })
        
        # 内存使用
        mem_data = self.driver.execute_script('mobile: shell', {
            'command': 'dumpsys meminfo com.example.game'
        })
        
        # 电池信息
        battery_data = self.driver.execute_script('mobile: battery_info')
        
        return {
            'cpu': cpu_data,
            'memory': mem_data,
            'battery': battery_data
        }
    
    def measure_game_performance(self, test_duration=60):
        """测量游戏性能"""
        start_time = time.time()
        performance_data = []
        
        while time.time() - start_time < test_duration:
            # 获取性能数据
            perf = self.get_android_performance_data()
            
            # 记录时间戳
            perf['timestamp'] = time.time()
            
            # 模拟游戏操作
            self.simulate_gameplay()
            
            performance_data.append(perf)
            
            time.sleep(5)  # 每5秒记录一次
        
        return performance_data
    
    def simulate_gameplay(self):
        """模拟游戏操作"""
        # 随机点击屏幕
        size = self.driver.get_window_size()
        x = size['width'] // 2 + random.randint(-100, 100)
        y = size['height'] // 2 + random.randint(-100, 100)
        
        self.driver.tap([(x, y)])
        
        # 滑动操作
        self.driver.swipe(
            start_x=size['width'] * 0.8,
            start_y=size['height'] * 0.5,
            end_x=size['width'] * 0.2,
            end_y=size['height'] * 0.5,
            duration=500
        )
    
    def analyze_performance_data(self, data):
        """分析性能数据"""
        # 提取CPU和内存数据
        cpu_usage = []
        memory_usage = []
        
        for record in data:
            # 解析CPU和内存数据(需要根据实际返回格式调整)
            cpu_usage.append(self.parse_cpu_data(record['cpu']))
            memory_usage.append(self.parse_memory_data(record['memory']))
        
        return {
            'avg_cpu': sum(cpu_usage) / len(cpu_usage) if cpu_usage else 0,
            'avg_memory': sum(memory_usage) / len(memory_usage) if memory_usage else 0,
            'max_cpu': max(cpu_usage) if cpu_usage else 0,
            'max_memory': max(memory_usage) if memory_usage else 0,
            'duration': len(data) * 5  # 假设每5秒记录一次
        }
    
    def parse_cpu_data(self, cpu_str):
        """解析CPU数据"""
        # 实际解析逻辑需要根据top命令输出格式调整
        return 0  # 占位符
    
    def parse_memory_data(self, mem_str):
        """解析内存数据"""
        # 实际解析逻辑需要根据dumpsys输出格式调整
        return 0  # 占位符

# 使用示例
tester = MobilePerformanceTester()
tester.setup_android_performance_test()

# 运行性能测试
perf_data = tester.measure_game_performance(test_duration=300)  # 5分钟测试

# 分析结果
analysis = tester.analyze_performance_data(perf_data)
print(f"性能分析结果: {analysis}")

# 生成性能报告
def generate_mobile_performance_report(analysis, output_file='mobile_performance_report.txt'):
    """生成移动端性能报告"""
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("移动端游戏性能测试报告\n")
        f.write("=" * 50 + "\n")
        f.write(f"测试时长: {analysis['duration']}秒\n")
        f.write(f"平均CPU使用率: {analysis['avg_cpu']:.2f}%\n")
        f.write(f"平均内存使用: {analysis['avg_memory']:.2f}MB\n")
        f.write(f"最大CPU使用率: {analysis['max_cpu']:.2f}%\n")
        f.write(f"最大内存使用: {analysis['max_memory']:.2f}MB\n")
        f.write("\n性能评估: " + ("良好" if analysis['avg_cpu'] < 80 else "需要优化"))
```

---

## 总结

本章涵盖了Python游戏测试开发的40+道高频面试题,包括:
- Python基础(10题)
- Selenium/Appium(15题)
- 框架设计(10题)
- 性能测试(5题)

这些问题覆盖了实际工作中的核心知识点,建议深入理解并结合实际项目经验进行准备。

