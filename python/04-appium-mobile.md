# 04. Appium移动端游戏测试

> 手机游戏自动化测试完全指南

---

## Appium简介

Appium是移动端自动化测试的标准工具,支持:
- iOS和Android双平台
- 原生应用、混合应用、H5游戏
- 多种编程语言
- 真机和模拟器

---

## 环境配置

### Android环境

```bash
# 1. 安装Java JDK
# 下载并安装JDK 8或11

# 2. 安装Android SDK
# 下载Android Studio或SDK Tools

# 3. 配置环境变量
export ANDROID_HOME=/path/to/android-sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools

# 4. 安装Appium
npm install -g appium

# 5. 安装Appium驱动
appium driver install uiautomator2

# 6. 安装Python客户端
pip install Appium-Python-Client

# 7. 验证环境
appium-doctor --android
```

### iOS环境(macOS)

```bash
# 1. 安装Xcode
# 从App Store安装

# 2. 安装依赖
brew install carthage
brew install libimobiledevice
brew install ios-deploy

# 3. 安装Appium
npm install -g appium

# 4. 安装XCUITest驱动
appium driver install xcuitest

# 5. 验证环境
appium-doctor --ios
```

---

## 基础用法

### Android测试配置

```python
from appium import webdriver
from appium.options.android import UiAutomator2Options

# 配置选项
options = UiAutomator2Options()
options.platform_name = 'Android'
options.platform_version = '11'
options.device_name = 'Android Emulator'
options.app = '/path/to/game.apk'
options.app_package = 'com.example.game'
options.app_activity = '.MainActivity'
options.automation_name = 'UiAutomator2'
options.no_reset = True  # 不重置应用

# 连接Appium服务器
driver = webdriver.Remote('http://localhost:4723', options=options)
```

### iOS测试配置

```python
from appium import webdriver
from appium.options.ios import XCUITestOptions

options = XCUITestOptions()
options.platform_name = 'iOS'
options.platform_version = '15.0'
options.device_name = 'iPhone 13'
options.app = '/path/to/game.app'
options.bundle_id = 'com.example.game'
options.automation_name = 'XCUITest'
options.no_reset = True

driver = webdriver.Remote('http://localhost:4723', options=options)
```

---

## 元素定位

### Android定位方法

```python
from appium.webdriver.common.appiumby import AppiumBy

# 1. Resource ID (推荐)
element = driver.find_element(
    AppiumBy.ID, 'com.example.game:id/start_button'
)

# 2. Accessibility ID
element = driver.find_element(
    AppiumBy.ACCESSIBILITY_ID, 'start_game'
)

# 3. XPath
element = driver.find_element(
    AppiumBy.XPATH, '//android.widget.Button[@text="开始"]'
)

# 4. Class Name
element = driver.find_element(
    AppiumBy.CLASS_NAME, 'android.widget.Button'
)

# 5. UIAutomator (Android特有)
element = driver.find_element(
    AppiumBy.ANDROID_UIAUTOMATOR,
    'new UiSelector().text("开始游戏")'
)

# UIAutomator高级用法
element = driver.find_element(
    AppiumBy.ANDROID_UIAUTOMATOR,
    'new UiSelector().resourceId("button").className("Button")'
)
```

### iOS定位方法

```python
# 1. Accessibility ID
element = driver.find_element(
    AppiumBy.ACCESSIBILITY_ID, 'start_button'
)

# 2. XPath
element = driver.find_element(
    AppiumBy.XPATH, '//XCUIElementTypeButton[@name="开始"]'
)

# 3. Class Name
element = driver.find_element(
    AppiumBy.CLASS_NAME, 'XCUIElementTypeButton'
)

# 4. Predicate (iOS特有)
element = driver.find_element(
    AppiumBy.IOS_PREDICATE,
    'label == "开始游戏"'
)

# 5. Class Chain (iOS特有)
element = driver.find_element(
    AppiumBy.IOS_CLASS_CHAIN,
    '**/XCUIElementTypeButton[`label == "开始"`]'
)
```

---

## 手势操作

### 点击和滑动

```python
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.actions import interaction
from selenium.webdriver.common.actions.action_builder import ActionBuilder
from selenium.webdriver.common.actions.pointer_input import PointerInput

# 简单点击
element = driver.find_element(AppiumBy.ID, 'button')
element.click()

# 坐标点击
driver.tap([(100, 200)])

# 长按
actions = ActionChains(driver)
actions.click_and_hold(element).pause(2).release().perform()

# 滑动
driver.swipe(start_x=500, start_y=1000, end_x=500, end_y=300, duration=800)

# 从元素滑动到元素
source = driver.find_element(AppiumBy.ID, 'item1')
target = driver.find_element(AppiumBy.ID, 'item2')

actions = ActionChains(driver)
actions.click_and_hold(source)
actions.move_to_element(target)
actions.release()
actions.perform()
```

### 手势进阶

```python
from appium.webdriver.common.touch_action import TouchAction

# 使用TouchAction (旧API)
action = TouchAction(driver)

# 点击坐标
action.tap(x=100, y=200).perform()

# 长按
action.long_press(element).perform()

# 滑动
action.press(x=500, y=1000).move_to(x=500, y=300).release().perform()

# 多点触控 - 缩放
from appium.webdriver.common.multi_action import MultiAction

action1 = TouchAction(driver)
action1.press(x=200, y=500).move_to(x=100, y=400).release()

action2 = TouchAction(driver)
action2.press(x=400, y=500).move_to(x=500, y=600).release()

multi_action = MultiAction(driver)
multi_action.add(action1, action2)
multi_action.perform()
```

### 滚动操作

```python
# 滚动到元素可见
element = driver.find_element(AppiumBy.XPATH, '//某个元素')
driver.execute_script('mobile: scrollToElement', {'element': element})

# Android滚动
driver.find_element(
    AppiumBy.ANDROID_UIAUTOMATOR,
    'new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(text("目标文本"))'
)

# iOS滚动
driver.execute_script('mobile: scroll', {'direction': 'down'})
```

---

## 游戏测试实战

### 手游启动测试

```python
import pytest
from appium import webdriver
from appium.options.android import UiAutomator2Options
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class TestGameLaunch:
    @pytest.fixture(scope='class')
    def driver(self):
        options = UiAutomator2Options()
        options.platform_name = 'Android'
        options.device_name = 'Android Emulator'
        options.app = '/path/to/game.apk'
        options.app_package = 'com.example.game'
        options.app_activity = '.SplashActivity'
        options.no_reset = True
        
        driver = webdriver.Remote('http://localhost:4723', options=options)
        yield driver
        driver.quit()
    
    def test_splash_screen(self, driver):
        """测试启动画面"""
        wait = WebDriverWait(driver, 30)
        
        # 等待启动画面出现
        splash = wait.until(
            EC.presence_of_element_located(
                (AppiumBy.ID, 'com.example.game:id/splash_logo')
            )
        )
        assert splash.is_displayed()
    
    def test_main_menu_load(self, driver):
        """测试主菜单加载"""
        wait = WebDriverWait(driver, 60)
        
        # 等待主菜单
        start_button = wait.until(
            EC.element_to_be_clickable(
                (AppiumBy.ID, 'com.example.game:id/start_button')
            )
        )
        assert start_button.is_displayed()
```

### UI交互测试

```python
class TestGameUI:
    def test_button_click(self, driver):
        """测试按钮点击"""
        start_btn = driver.find_element(
            AppiumBy.ID, 'com.example.game:id/start_button'
        )
        start_btn.click()
        
        # 验证跳转
        wait = WebDriverWait(driver, 10)
        game_view = wait.until(
            EC.presence_of_element_located(
                (AppiumBy.ID, 'com.example.game:id/game_view')
            )
        )
        assert game_view.is_displayed()
    
    def test_swipe_gesture(self, driver):
        """测试滑动操作"""
        # 获取屏幕尺寸
        size = driver.get_window_size()
        
        # 向左滑动
        driver.swipe(
            start_x=size['width'] * 0.8,
            start_y=size['height'] * 0.5,
            end_x=size['width'] * 0.2,
            end_y=size['height'] * 0.5,
            duration=500
        )
        
        # 验证滑动后的界面
        # ...
```

### 游戏性能测试

```python
class TestGamePerformance:
    def test_launch_time(self, driver):
        """测试启动时间"""
        import time
        
        start_time = time.time()
        
        # 启动应用
        driver.launch_app()
        
        # 等待主界面
        wait = WebDriverWait(driver, 60)
        wait.until(
            EC.presence_of_element_located(
                (AppiumBy.ID, 'com.example.game:id/main_view')
            )
        )
        
        launch_time = time.time() - start_time
        
        # 验证启动时间 < 10秒
        assert launch_time < 10, f"启动时间过长: {launch_time}秒"
    
    def test_fps(self, driver):
        """测试帧率"""
        # 获取性能数据
        perf_data = driver.get_performance_data_types()
        
        # 获取CPU使用率
        cpu_data = driver.get_performance_data('cpuinfo', 'cpuinfo')
        
        # 分析性能
        # ...
```

---

## 多设备管理

### 并行测试

```python
import pytest
from concurrent.futures import ThreadPoolExecutor

def run_test_on_device(device_config):
    """在指定设备上运行测试"""
    options = UiAutomator2Options()
    options.platform_name = 'Android'
    options.udid = device_config['udid']
    options.app = device_config['app']
    
    driver = webdriver.Remote(
        f"http://localhost:{device_config['port']}",
        options=options
    )
    
    try:
        # 运行测试
        test_login(driver)
        test_main_menu(driver)
    finally:
        driver.quit()

def test_multiple_devices():
    """多设备并行测试"""
    devices = [
        {'udid': 'device1', 'port': 4723, 'app': '/path/to/app.apk'},
        {'udid': 'device2', 'port': 4724, 'app': '/path/to/app.apk'},
        {'udid': 'device3', 'port': 4725, 'app': '/path/to/app.apk'},
    ]
    
    with ThreadPoolExecutor(max_workers=3) as executor:
        executor.map(run_test_on_device, devices)
```

---

## 调试技巧

### 查看元素属性

```python
# 获取页面源码
page_source = driver.page_source
print(page_source)

# 获取当前Activity (Android)
current_activity = driver.current_activity
print(f"当前Activity: {current_activity}")

# 获取元素属性
element = driver.find_element(AppiumBy.ID, 'button')
text = element.get_attribute('text')
enabled = element.get_attribute('enabled')
bounds = element.get_attribute('bounds')
```

### 截图

```python
# 截图
driver.save_screenshot('/path/to/screenshot.png')

# 元素截图
element = driver.find_element(AppiumBy.ID, 'game_view')
element.screenshot('/path/to/element.png')
```

### Appium Inspector

使用Appium Inspector查看应用结构:
1. 启动Appium Inspector
2. 输入服务器地址和capabilities
3. 启动会话
4. 查看元素树和属性

---

## Page Object模式

```python
# pages/base_page.py
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class BasePage:
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)
    
    def find_element(self, locator):
        return self.wait.until(
            EC.presence_of_element_located(locator)
        )
    
    def click(self, locator):
        element = self.wait.until(
            EC.element_to_be_clickable(locator)
        )
        element.click()

# pages/login_page.py
class LoginPage(BasePage):
    USERNAME_INPUT = (AppiumBy.ID, 'com.example.game:id/username')
    PASSWORD_INPUT = (AppiumBy.ID, 'com.example.game:id/password')
    LOGIN_BUTTON = (AppiumBy.ID, 'com.example.game:id/login_btn')
    
    def login(self, username, password):
        self.find_element(self.USERNAME_INPUT).send_keys(username)
        self.find_element(self.PASSWORD_INPUT).send_keys(password)
        self.click(self.LOGIN_BUTTON)

# test_login.py
def test_login(driver):
    login_page = LoginPage(driver)
    login_page.login('test_user', 'test_pass')
    # 验证登录成功
```

---

## 常见问题

### Q1: 如何处理权限弹窗?

```python
# Android权限弹窗
try:
    allow_btn = WebDriverWait(driver, 5).until(
        EC.presence_of_element_located(
            (AppiumBy.ID, 'com.android.packageinstaller:id/permission_allow_button')
        )
    )
    allow_btn.click()
except:
    pass  # 没有权限弹窗
```

### Q2: 元素找不到怎么办?

```python
# 增加等待时间
wait = WebDriverWait(driver, 30)

# 使用多种定位方式
try:
    element = driver.find_element(AppiumBy.ID, 'button')
except:
    element = driver.find_element(
        AppiumBy.XPATH, '//android.widget.Button'
    )
```

### Q3: 真机连接问题?

```bash
# 检查设备连接
adb devices

# 重启adb
adb kill-server
adb start-server

# 查看日志
adb logcat
```

---

## 下一步

继续学习:
- [05. 性能测试](05-performance-testing.md)
- [07. 实战项目](07-real-projects.md)
- [09. 常见坑](09-common-pitfalls.md)
