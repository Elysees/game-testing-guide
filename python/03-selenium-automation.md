# 03. Selenium Web自动化测试

> Web游戏自动化测试完全指南

---

## Selenium简介

Selenium是Web自动化测试的行业标准,支持:
- 所有主流浏览器(Chrome、Firefox、Safari、Edge)
- 多种编程语言
- 跨平台运行
- 丰富的API和工具

### 应用场景

- Web游戏功能测试
- 浏览器游戏UI测试
- 游戏官网测试
- H5小游戏测试
- 回归测试自动化

---

## 环境配置

### 安装Selenium

```bash
pip install selenium
pip install webdriver-manager  # 自动管理驱动
```

### 配置ChromeDriver

```python
from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service

# 方式1: 自动管理驱动(推荐)
service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service)

# 方式2: 手动指定驱动路径
driver = webdriver.Chrome(executable_path='/path/to/chromedriver')

# 方式3: 驱动在PATH中
driver = webdriver.Chrome()
```

### Chrome选项配置

```python
from selenium.webdriver.chrome.options import Options

options = Options()

# 无头模式(后台运行)
options.add_argument('--headless')

# 窗口大小
options.add_argument('--window-size=1920,1080')

# 禁用GPU加速
options.add_argument('--disable-gpu')

# 禁用沙盒(Docker环境需要)
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')

# 忽略证书错误
options.add_argument('--ignore-certificate-errors')

# 禁用图片加载(加速)
prefs = {'profile.managed_default_content_settings.images': 2}
options.add_experimental_option('prefs', prefs)

driver = webdriver.Chrome(options=options)
```

---

## 元素定位

### 8种定位方法

```python
from selenium.webdriver.common.by import By

# 1. ID定位(最快最稳定)
element = driver.find_element(By.ID, 'username')

# 2. Name定位
element = driver.find_element(By.NAME, 'password')

# 3. Class Name定位
element = driver.find_element(By.CLASS_NAME, 'login-btn')

# 4. Tag Name定位
element = driver.find_element(By.TAG_NAME, 'input')

# 5. Link Text定位(完全匹配)
element = driver.find_element(By.LINK_TEXT, '登录')

# 6. Partial Link Text定位(部分匹配)
element = driver.find_element(By.PARTIAL_LINK_TEXT, '登')

# 7. CSS Selector定位(推荐)
element = driver.find_element(By.CSS_SELECTOR, '#username')
element = driver.find_element(By.CSS_SELECTOR, '.login-btn')
element = driver.find_element(By.CSS_SELECTOR, 'input[name="username"]')

# 8. XPath定位(最强大)
element = driver.find_element(By.XPATH, '//input[@id="username"]')
element = driver.find_element(By.XPATH, '//button[text()="登录"]')
```

### CSS Selector技巧

```python
# ID选择器
driver.find_element(By.CSS_SELECTOR, '#player-name')

# Class选择器
driver.find_element(By.CSS_SELECTOR, '.game-button')

# 属性选择器
driver.find_element(By.CSS_SELECTOR, '[data-test-id="login"]')
driver.find_element(By.CSS_SELECTOR, 'input[type="password"]')

# 层级选择器
driver.find_element(By.CSS_SELECTOR, 'div.container > button')
driver.find_element(By.CSS_SELECTOR, '#game-area .player-info')

# 伪类选择器
driver.find_element(By.CSS_SELECTOR, 'button:first-child')
driver.find_element(By.CSS_SELECTOR, 'li:nth-child(2)')

# 组合选择器
driver.find_element(By.CSS_SELECTOR, 'button.primary[type="submit"]')
```

### XPath技巧

```python
# 绝对路径(不推荐,脆弱)
element = driver.find_element(By.XPATH, '/html/body/div[1]/form/input[1]')

# 相对路径(推荐)
element = driver.find_element(By.XPATH, '//input[@id="username"]')

# 文本匹配
element = driver.find_element(By.XPATH, '//button[text()="开始游戏"]')
element = driver.find_element(By.XPATH, '//a[contains(text(), "登录")]')

# 属性匹配
element = driver.find_element(By.XPATH, '//input[@type="text"]')
element = driver.find_element(By.XPATH, '//div[@class="game-panel"]')

# 轴定位
element = driver.find_element(By.XPATH, '//label[text()="用户名"]/following-sibling::input')
element = driver.find_element(By.XPATH, '//button[@id="submit"]/../input')

# 逻辑运算
element = driver.find_element(By.XPATH, '//input[@type="text" and @name="username"]')
element = driver.find_element(By.XPATH, '//button[@class="btn" or @class="button"]')
```

---

## 元素操作

### 基础操作

```python
# 输入文本
element.send_keys('test_user')

# 清空内容
element.clear()

# 点击
element.click()

# 提交表单
element.submit()

# 获取文本
text = element.text

# 获取属性
value = element.get_attribute('value')
class_name = element.get_attribute('class')

# 获取CSS属性
color = element.value_of_css_property('color')

# 判断元素状态
is_displayed = element.is_displayed()
is_enabled = element.is_enabled()
is_selected = element.is_selected()  # checkbox/radio
```

### 下拉框操作

```python
from selenium.webdriver.support.ui import Select

select_element = driver.find_element(By.ID, 'server-select')
select = Select(select_element)

# 通过索引选择
select.select_by_index(0)

# 通过value选择
select.select_by_value('server1')

# 通过可见文本选择
select.select_by_visible_text('美国服务器')

# 获取所有选项
options = select.options
for option in options:
    print(option.text)

# 获取当前选中项
selected = select.first_selected_option
```

### 鼠标操作

```python
from selenium.webdriver.common.action_chains import ActionChains

actions = ActionChains(driver)

# 移动到元素
element = driver.find_element(By.ID, 'menu')
actions.move_to_element(element).perform()

# 点击
actions.click(element).perform()

# 双击
actions.double_click(element).perform()

# 右键
actions.context_click(element).perform()

# 拖拽
source = driver.find_element(By.ID, 'item')
target = driver.find_element(By.ID, 'inventory')
actions.drag_and_drop(source, target).perform()

# 悬停
actions.move_to_element(element).pause(2).perform()

# 链式操作
actions.move_to_element(menu).click().move_to_element(submenu).click().perform()
```

### 键盘操作

```python
from selenium.webdriver.common.keys import Keys

element = driver.find_element(By.ID, 'search')

# 输入并回车
element.send_keys('游戏攻略', Keys.ENTER)

# 组合键
element.send_keys(Keys.CONTROL, 'a')  # 全选
element.send_keys(Keys.CONTROL, 'c')  # 复制

# 特殊键
element.send_keys(Keys.TAB)
element.send_keys(Keys.ESCAPE)
element.send_keys(Keys.ARROW_DOWN)
```

---

## 等待策略

### 1. 隐式等待

```python
# 全局设置,一次设置全局有效
driver.implicitly_wait(10)  # 等待最多10秒

# 查找元素时会自动等待
element = driver.find_element(By.ID, 'username')
```

**注意**: 不推荐使用,可能导致不必要的等待。

### 2. 显式等待(推荐)

```python
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

wait = WebDriverWait(driver, 10)  # 最多等待10秒

# 等待元素出现
element = wait.until(
    EC.presence_of_element_located((By.ID, 'username'))
)

# 等待元素可见
element = wait.until(
    EC.visibility_of_element_located((By.ID, 'message'))
)

# 等待元素可点击
element = wait.until(
    EC.element_to_be_clickable((By.ID, 'submit-btn'))
)

# 等待文本出现
wait.until(
    EC.text_to_be_present_in_element((By.ID, 'status'), '成功')
)

# 等待标题包含
wait.until(EC.title_contains('游戏'))

# 等待URL包含
wait.until(EC.url_contains('/game'))

# 等待元素消失
wait.until(
    EC.invisibility_of_element_located((By.ID, 'loading'))
)
```

### 3. 自定义等待条件

```python
from selenium.webdriver.support.ui import WebDriverWait

def element_has_css_class(locator, css_class):
    """等待元素具有指定class"""
    def _predicate(driver):
        element = driver.find_element(*locator)
        classes = element.get_attribute('class').split()
        return css_class in classes
    return _predicate

wait = WebDriverWait(driver, 10)
wait.until(element_has_css_class((By.ID, 'player'), 'active'))
```

---

## 窗口和框架

### 窗口操作

```python
# 获取当前窗口句柄
current_window = driver.current_window_handle

# 获取所有窗口句柄
all_windows = driver.window_handles

# 打开新标签页
driver.execute_script('window.open("https://game.com")')

# 切换窗口
for window in driver.window_handles:
    if window != current_window:
        driver.switch_to.window(window)

# 关闭当前窗口
driver.close()

# 关闭浏览器
driver.quit()

# 窗口大小
driver.set_window_size(1920, 1080)
driver.maximize_window()

# 窗口位置
driver.set_window_position(0, 0)
```

### iframe切换

```python
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
```

### Alert处理

```python
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# 等待alert出现
alert = WebDriverWait(driver, 10).until(EC.alert_is_present())

# 获取alert文本
text = alert.text

# 接受alert (点击确定)
alert.accept()

# 拒绝alert (点击取消)
alert.dismiss()

# 输入文本到prompt
alert.send_keys('test input')
alert.accept()
```

---

## JavaScript执行

```python
# 执行JavaScript
driver.execute_script('alert("Hello")')

# 滚动到元素
element = driver.find_element(By.ID, 'footer')
driver.execute_script('arguments[0].scrollIntoView()', element)

# 滚动到页面底部
driver.execute_script('window.scrollTo(0, document.body.scrollHeight)')

# 点击被遮挡的元素
driver.execute_script('arguments[0].click()', element)

# 修改元素属性
driver.execute_script('arguments[0].value = "test"', input_element)

# 获取返回值
title = driver.execute_script('return document.title')

# 异步JavaScript
driver.execute_async_script('''
    var callback = arguments[arguments.length - 1];
    setTimeout(function() {
        callback('done');
    }, 1000);
''')
```

---

## Page Object模式

```python
# pages/base_page.py
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class BasePage:
    """页面基类"""
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
    
    def input_text(self, locator, text):
        element = self.find_element(locator)
        element.clear()
        element.send_keys(text)

# pages/login_page.py
from selenium.webdriver.common.by import By
from pages.base_page import BasePage

class LoginPage(BasePage):
    """登录页面"""
    URL = 'https://game.com/login'
    
    # 定位器
    USERNAME_INPUT = (By.ID, 'username')
    PASSWORD_INPUT = (By.ID, 'password')
    LOGIN_BUTTON = (By.ID, 'login-btn')
    ERROR_MESSAGE = (By.CLASS_NAME, 'error-msg')
    
    def open(self):
        self.driver.get(self.URL)
    
    def login(self, username, password):
        self.input_text(self.USERNAME_INPUT, username)
        self.input_text(self.PASSWORD_INPUT, password)
        self.click(self.LOGIN_BUTTON)
    
    def get_error_message(self):
        element = self.find_element(self.ERROR_MESSAGE)
        return element.text

# test_login.py
import pytest
from pages.login_page import LoginPage

class TestLogin:
    @pytest.fixture
    def login_page(self, driver):
        page = LoginPage(driver)
        page.open()
        return page
    
    def test_successful_login(self, login_page):
        login_page.login('valid_user', 'valid_pass')
        # 验证登录成功
        assert 'Welcome' in driver.title
    
    def test_invalid_login(self, login_page):
        login_page.login('invalid', 'invalid')
        error = login_page.get_error_message()
        assert '用户名或密码错误' in error
```

---

## 实战案例

### Web游戏自动化测试

```python
import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class TestWebGame:
    @pytest.fixture
    def driver(self):
        driver = webdriver.Chrome()
        driver.maximize_window()
        yield driver
        driver.quit()
    
    def test_game_launch(self, driver):
        """测试游戏启动"""
        driver.get('https://2048game.com')
        wait = WebDriverWait(driver, 10)
        
        # 验证页面加载
        assert '2048' in driver.title
        
        # 验证游戏容器存在
        game_container = wait.until(
            EC.presence_of_element_located(
                (By.CLASS_NAME, 'game-container')
            )
        )
        assert game_container.is_displayed()
    
    def test_game_interaction(self, driver):
        """测试游戏交互"""
        driver.get('https://2048game.com')
        wait = WebDriverWait(driver, 10)
        
        # 等待游戏加载
        wait.until(
            EC.presence_of_element_located((By.CLASS_NAME, 'tile'))
        )
        
        # 获取初始分数
        score_elem = driver.find_element(By.CLASS_NAME, 'score-container')
        initial_score = int(score_elem.text.split('\n')[0])
        
        # 执行游戏操作
        from selenium.webdriver.common.keys import Keys
        body = driver.find_element(By.TAG_NAME, 'body')
        
        for _ in range(10):
            body.send_keys(Keys.ARROW_UP)
            body.send_keys(Keys.ARROW_LEFT)
        
        # 等待动画
        import time
        time.sleep(2)
        
        # 验证分数变化
        final_score = int(score_elem.text.split('\n')[0])
        assert final_score >= initial_score
```

---

## 常见问题

### Q1: 元素找不到?

```python
# 问题: NoSuchElementException
# 解决: 使用显式等待
wait = WebDriverWait(driver, 10)
element = wait.until(
    EC.presence_of_element_located((By.ID, 'element-id'))
)
```

### Q2: 元素被遮挡?

```python
# 问题: ElementClickInterceptedException
# 解决1: 滚动到元素
driver.execute_script('arguments[0].scrollIntoView()', element)
element.click()

# 解决2: 用JS点击
driver.execute_script('arguments[0].click()', element)
```

### Q3: StaleElementReferenceException?

```python
# 问题: 页面刷新后元素引用失效
# 解决: 重新查找元素
def find_and_click(locator):
    element = driver.find_element(*locator)
    element.click()
```

---

## 下一步

继续学习:
- [04. Appium移动测试](04-appium-mobile.md)
- [07. 实战项目](07-real-projects.md)
- [09. 常见坑](09-common-pitfalls.md)
