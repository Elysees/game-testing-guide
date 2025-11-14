# 01. Python基础知识和环境配置

> 为游戏测试开发工程师准备的Python入门指南

---

## 为什么选择Python

Python在游戏测试领域的核心优势:

1. **简洁易读**: 代码接近自然语言
2. **丰富生态**: Pytest、Selenium、Appium等完整工具链
3. **跨平台**: 一次编写,到处运行
4. **快速开发**: 10行代码完成基础测试
5. **强大社区**: 海量资源和解决方案

```python
# 示例: 10行代码实现Web游戏测试
from selenium import webdriver

driver = webdriver.Chrome()
driver.get('https://game.example.com')
driver.find_element('id', 'username').send_keys('test')
driver.find_element('id', 'password').send_keys('pass')
driver.find_element('id', 'login').click()
assert 'Welcome' in driver.page_source
driver.quit()
```

---

## 核心测试库生态

### 1. Pytest - 测试框架

```python
import pytest

class TestPlayer:
    @pytest.fixture
    def player(self):
        return Player('test_user')
    
    def test_level_up(self, player):
        player.gain_exp(1000)
        assert player.level == 2
```

### 2. Selenium - Web自动化

```python
from selenium import webdriver
from selenium.webdriver.common.by import By

driver = webdriver.Chrome()
driver.get('https://game.com')
element = driver.find_element(By.ID, 'start_btn')
element.click()
```

### 3. Appium - 移动测试

```python
from appium import webdriver

caps = {
    'platformName': 'Android',
    'deviceName': 'emulator',
    'app': '/path/to/game.apk'
}
driver = webdriver.Remote('http://localhost:4723/wd/hub', caps)
```

### 4. Locust - 性能测试

```python
from locust import HttpUser, task

class GameUser(HttpUser):
    @task
    def login(self):
        self.client.post('/api/login', json={
            'user': 'test', 'pass': 'test123'
        })
```

---

## 环境配置指南

### Windows配置

```bash
# 安装Python
# 从 https://www.python.org 下载并安装

# 验证
python --version
pip --version

# 创建虚拟环境
python -m venv game_test_env
game_test_env\Scripts\activate

# 安装工具
pip install pytest selenium appium-python-client locust pandas
pip install webdriver-manager
```

### macOS配置

```bash
# 安装Python
brew install python@3.11

# 创建虚拟环境
python3 -m venv game_test_env
source game_test_env/bin/activate

# 安装工具
pip install pytest selenium appium-python-client locust pandas
```

### Linux配置

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install python3 python3-pip python3-venv

# 创建虚拟环境
python3 -m venv game_test_env
source game_test_env/bin/activate

# 安装工具
pip install pytest selenium appium-python-client locust pandas
```

---

## 第一个测试脚本

### 示例1: 单元测试

```python
# test_player.py
import pytest

class Player:
    def __init__(self, name, level=1):
        self.name = name
        self.level = level
        self.exp = 0
    
    def gain_exp(self, amount):
        self.exp += amount
        while self.exp >= 1000:
            self.level += 1
            self.exp -= 1000

class TestPlayer:
    @pytest.fixture
    def player(self):
        return Player('test_user')
    
    def test_creation(self, player):
        assert player.name == 'test_user'
        assert player.level == 1
    
    def test_gain_exp(self, player):
        player.gain_exp(1500)
        assert player.level == 2
        assert player.exp == 500
```

运行测试:
```bash
pytest test_player.py -v
```

### 示例2: Web测试

```python
# test_web_game.py
from selenium import webdriver
from selenium.webdriver.common.by import By
import pytest

class TestWebGame:
    @pytest.fixture
    def driver(self):
        driver = webdriver.Chrome()
        yield driver
        driver.quit()
    
    def test_game_load(self, driver):
        driver.get('https://2048game.com')
        assert '2048' in driver.title
        
        game = driver.find_element(By.CLASS_NAME, 'game-container')
        assert game.is_displayed()
```

---

## 常见问题解答

### Q1: 虚拟环境有什么用?

**A**: 隔离项目依赖,避免版本冲突

```bash
# 创建
python -m venv myenv

# 激活 (Windows)
myenv\Scripts\activate

# 激活 (macOS/Linux)
source myenv/bin/activate
```

### Q2: pip安装慢怎么办?

**A**: 使用国内镜像

```bash
# 使用清华镜像
pip install pytest -i https://pypi.tuna.tsinghua.edu.cn/simple

# 永久配置
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
```

### Q3: ChromeDriver版本不匹配?

**A**: 使用webdriver-manager

```python
from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service

service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service)
```

### Q4: 如何加速测试?

```bash
# 并行执行
pip install pytest-xdist
pytest -n 4  # 4个进程

# 使用无头模式
options = webdriver.ChromeOptions()
options.add_argument('--headless')
driver = webdriver.Chrome(options=options)
```

---

## 项目结构建议

```
game_test_project/
├── tests/
│   ├── conftest.py        # 配置和fixture
│   ├── test_player.py
│   └── test_battle.py
├── pages/                  # Page Object
│   └── login_page.py
├── utils/                  # 工具函数
│   └── api_client.py
├── configs/                # 配置
│   └── test_config.yaml
├── requirements.txt        # 依赖
└── pytest.ini             # Pytest配置
```

---

## 下一步

环境配置完成后,继续学习:
- [02. Pytest框架详解](02-pytest-framework.md)
- [03. Selenium Web自动化](03-selenium-automation.md)
- [04. Appium移动测试](04-appium-mobile.md)

---

**开始你的Python游戏测试之旅! 🚀**
