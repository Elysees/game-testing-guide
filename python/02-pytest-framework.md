# 02. Pytest框架详解

> 最强大的Python测试框架完全指南

---

## Pytest简介

Pytest是Python最流行的测试框架,具有:
- 简洁的测试语法
- 强大的fixture系统
- 丰富的插件生态
- 详细的测试报告
- 参数化测试支持

### 为什么选择Pytest?

```python
# unittest需要继承TestCase类
import unittest

class TestPlayer(unittest.TestCase):
    def test_level_up(self):
        player = Player('test')
        player.gain_exp(1000)
        self.assertEqual(player.level, 2)

# Pytest更简洁
def test_level_up():
    player = Player('test')
    player.gain_exp(1000)
    assert player.level == 2
```

---

## 基础用法

### 1. 简单测试

```python
# test_basic.py

def add(a, b):
    return a + b

def test_add():
    """测试加法函数"""
    assert add(1, 2) == 3
    assert add(-1, 1) == 0
    assert add(0, 0) == 0

def test_add_negative():
    """测试负数"""
    assert add(-5, -3) == -8
```

运行测试:
```bash
pytest test_basic.py -v
```

### 2. 测试类组织

```python
# test_player.py

class Player:
    def __init__(self, name, level=1):
        self.name = name
        self.level = level
        self.hp = 100
        self.exp = 0
    
    def gain_exp(self, amount):
        self.exp += amount
        while self.exp >= 1000:
            self.level += 1
            self.exp -= 1000
    
    def take_damage(self, damage):
        self.hp = max(0, self.hp - damage)

class TestPlayer:
    """玩家系统测试"""
    
    def test_creation(self):
        """测试创建玩家"""
        player = Player('hero', level=1)
        assert player.name == 'hero'
        assert player.level == 1
        assert player.hp == 100
    
    def test_gain_exp(self):
        """测试获得经验"""
        player = Player('hero')
        player.gain_exp(1500)
        assert player.level == 2
        assert player.exp == 500
    
    def test_take_damage(self):
        """测试受伤"""
        player = Player('hero')
        player.take_damage(30)
        assert player.hp == 70
        
        player.take_damage(100)
        assert player.hp == 0
```

---

## Fixture详解

Fixture是Pytest最强大的功能,用于测试前的准备和测试后的清理。

### 1. 基础Fixture

```python
import pytest

@pytest.fixture
def player():
    """创建测试玩家"""
    print("\n创建玩家")
    p = Player('test_player')
    yield p  # 返回给测试函数
    print("\n清理玩家")

def test_player_level(player):
    """测试使用fixture"""
    assert player.level == 1
    player.gain_exp(1000)
    assert player.level == 2

def test_player_hp(player):
    """每个测试都获得新的player"""
    assert player.hp == 100
    player.take_damage(50)
    assert player.hp == 50
```

### 2. Fixture作用域

```python
import pytest

# function级别 - 每个测试函数都执行(默认)
@pytest.fixture(scope='function')
def temp_player():
    return Player('temp')

# class级别 - 每个测试类执行一次
@pytest.fixture(scope='class')
def shared_player():
    return Player('shared')

# module级别 - 每个模块执行一次
@pytest.fixture(scope='module')
def db_connection():
    print("\n连接数据库")
    conn = connect_to_db()
    yield conn
    print("\n关闭数据库")
    conn.close()

# session级别 - 整个测试会话执行一次
@pytest.fixture(scope='session')
def browser():
    print("\n启动浏览器")
    driver = webdriver.Chrome()
    yield driver
    print("\n关闭浏览器")
    driver.quit()
```

### 3. Fixture依赖

```python
import pytest

@pytest.fixture
def database():
    """数据库fixture"""
    db = Database()
    db.connect()
    yield db
    db.close()

@pytest.fixture
def player_repository(database):
    """依赖database的fixture"""
    return PlayerRepository(database)

@pytest.fixture
def test_player(player_repository):
    """依赖player_repository的fixture"""
    player = player_repository.create_player('test')
    yield player
    player_repository.delete_player(player.id)

def test_save_player(test_player, player_repository):
    """测试保存玩家"""
    test_player.level = 10
    player_repository.save(test_player)
    
    loaded = player_repository.load(test_player.id)
    assert loaded.level == 10
```

### 4. conftest.py - 共享Fixture

```python
# conftest.py - 整个项目共享的fixture

import pytest
from selenium import webdriver

@pytest.fixture(scope='session')
def browser():
    """浏览器fixture"""
    driver = webdriver.Chrome()
    driver.implicitly_wait(10)
    yield driver
    driver.quit()

@pytest.fixture
def logged_in_player(browser):
    """已登录的玩家"""
    browser.get('https://game.com/login')
    browser.find_element('id', 'username').send_keys('test')
    browser.find_element('id', 'password').send_keys('test123')
    browser.find_element('id', 'login').click()
    yield browser
    # 测试后登出
    browser.get('https://game.com/logout')
```

使用:
```python
# test_game_features.py

def test_player_profile(logged_in_player):
    """测试玩家资料页"""
    logged_in_player.get('https://game.com/profile')
    assert 'Profile' in logged_in_player.title

def test_inventory(logged_in_player):
    """测试背包"""
    logged_in_player.get('https://game.com/inventory')
    items = logged_in_player.find_elements('class name', 'item')
    assert len(items) >= 0
```

---

## 参数化测试

### 1. 基础参数化

```python
import pytest

@pytest.mark.parametrize('exp,expected_level', [
    (0, 1),
    (500, 1),
    (1000, 2),
    (2500, 3),
    (5000, 6),
])
def test_level_calculation(exp, expected_level):
    """测试等级计算"""
    player = Player('test')
    player.gain_exp(exp)
    assert player.level == expected_level
```

运行结果:
```
test_player.py::test_level_calculation[0-1] PASSED
test_player.py::test_level_calculation[500-1] PASSED
test_player.py::test_level_calculation[1000-2] PASSED
test_player.py::test_level_calculation[2500-3] PASSED
test_player.py::test_level_calculation[5000-6] PASSED
```

### 2. 多参数组合

```python
@pytest.mark.parametrize('username,password,expected', [
    ('valid_user', 'valid_pass', True),
    ('invalid_user', 'any_pass', False),
    ('valid_user', 'wrong_pass', False),
    ('', '', False),
])
def test_login(username, password, expected):
    """测试登录"""
    result = login(username, password)
    assert result == expected
```

### 3. 笛卡尔积参数化

```python
@pytest.mark.parametrize('weapon', ['sword', 'bow', 'staff'])
@pytest.mark.parametrize('level', [1, 10, 50])
def test_damage_calculation(weapon, level):
    """测试不同武器和等级的伤害"""
    player = Player('hero', level=level)
    player.equip(weapon)
    damage = player.calculate_damage()
    assert damage > 0
    
# 将生成9个测试: 3武器 × 3等级
```

### 4. 使用pytest.param添加ID

```python
@pytest.mark.parametrize('test_input,expected', [
    pytest.param(100, 100, id='normal_hp'),
    pytest.param(0, 0, id='zero_hp'),
    pytest.param(-10, 0, id='negative_hp_clamped'),
])
def test_hp_values(test_input, expected):
    """测试HP值处理"""
    player = Player('test')
    player.hp = test_input
    assert player.hp == expected
```

---

## 标记(Markers)

### 1. 内置标记

```python
import pytest

@pytest.mark.skip(reason='功能未实现')
def test_new_feature():
    """跳过测试"""
    pass

@pytest.mark.skipif(sys.version_info < (3, 8), reason='需要Python 3.8+')
def test_modern_feature():
    """条件跳过"""
    pass

@pytest.mark.xfail(reason='已知的bug')
def test_known_bug():
    """预期失败"""
    assert False

@pytest.mark.slow
def test_performance():
    """自定义标记"""
    time.sleep(5)
    assert True
```

运行特定标记的测试:
```bash
# 只运行slow标记的测试
pytest -m slow

# 排除slow标记
pytest -m "not slow"

# 组合条件
pytest -m "slow and important"
```

### 2. 自定义标记

```python
# pytest.ini
[pytest]
markers =
    smoke: 冒烟测试
    regression: 回归测试
    integration: 集成测试
    ui: UI测试

# test_game.py
import pytest

@pytest.mark.smoke
def test_game_launch():
    """测试游戏启动"""
    assert launch_game() == True

@pytest.mark.regression
@pytest.mark.ui
def test_main_menu():
    """测试主菜单"""
    menu = get_main_menu()
    assert menu.is_visible()

@pytest.mark.integration
def test_save_load():
    """测试存档加载"""
    game = Game()
    game.save()
    game2 = Game()
    game2.load()
    assert game2.state == game.state
```

---

## 断言和异常

### 1. 高级断言

```python
def test_assertions():
    """Pytest的智能断言"""
    x = 5
    y = 10
    
    # 简单断言
    assert x < y
    
    # 带消息
    assert x < y, f"x({x}) should be less than y({y})"
    
    # 复杂条件
    assert x > 0 and y > 0
    
    # 集合
    assert 'sword' in ['sword', 'shield', 'bow']
    
    # 字典
    player = {'name': 'hero', 'level': 10}
    assert player['level'] == 10

def test_float_comparison():
    """浮点数比较"""
    result = 0.1 + 0.2
    assert result == pytest.approx(0.3)  # 处理浮点精度
```

### 2. 异常测试

```python
import pytest

def divide(a, b):
    if b == 0:
        raise ValueError('除数不能为0')
    return a / b

def test_divide_by_zero():
    """测试除零异常"""
    with pytest.raises(ValueError) as exc_info:
        divide(10, 0)
    
    assert '除数不能为0' in str(exc_info.value)

def test_divide_by_zero_match():
    """使用match参数"""
    with pytest.raises(ValueError, match=r'除数不能为0'):
        divide(10, 0)

def test_no_exception():
    """测试不应该抛出异常"""
    result = divide(10, 2)
    assert result == 5
```

---

## Mock和Patch

### 1. unittest.mock基础

```python
from unittest.mock import Mock, patch

def test_api_call_with_mock():
    """使用Mock对象"""
    # 创建Mock对象
    mock_api = Mock()
    mock_api.get_player_info.return_value = {
        'name': 'hero',
        'level': 10
    }
    
    # 测试
    result = mock_api.get_player_info('player_id')
    assert result['level'] == 10
    
    # 验证调用
    mock_api.get_player_info.assert_called_once_with('player_id')

def test_with_patch():
    """使用patch"""
    with patch('game.api.get_player') as mock_get:
        mock_get.return_value = Player('hero', level=5)
        
        player = game.api.get_player('id123')
        assert player.level == 5
        mock_get.assert_called_once()
```

### 2. Patch装饰器

```python
@patch('requests.get')
def test_api_request(mock_get):
    """测试API请求"""
    # 配置mock返回值
    mock_response = Mock()
    mock_response.json.return_value = {'status': 'success'}
    mock_response.status_code = 200
    mock_get.return_value = mock_response
    
    # 测试
    response = make_api_request('https://api.game.com/status')
    assert response['status'] == 'success'

@patch('game.database.save')
@patch('game.database.load')
def test_save_load(mock_load, mock_save):
    """测试保存和加载"""
    player = Player('test')
    save_player(player)
    mock_save.assert_called_once()
```

---

## 测试报告

### 1. HTML报告

```bash
# 安装插件
pip install pytest-html

# 生成报告
pytest --html=report.html --self-contained-html
```

### 2. Allure报告

```bash
# 安装
pip install allure-pytest

# 运行并生成数据
pytest --alluredir=./allure-results

# 查看报告
allure serve ./allure-results
```

添加Allure装饰器:
```python
import allure

@allure.feature('玩家系统')
@allure.story('等级系统')
@allure.severity(allure.severity_level.CRITICAL)
def test_level_up():
    """测试升级功能"""
    with allure.step('创建1级玩家'):
        player = Player('hero', level=1)
    
    with allure.step('获得1000经验'):
        player.gain_exp(1000)
    
    with allure.step('验证升到2级'):
        assert player.level == 2
```

### 3. 覆盖率报告

```bash
# 安装
pip install pytest-cov

# 运行测试并生成覆盖率
pytest --cov=game --cov-report=html

# 查看报告
open htmlcov/index.html
```

---

## Pytest插件

### 常用插件

```bash
# 并行执行
pip install pytest-xdist
pytest -n 4  # 使用4个进程

# 重试失败测试
pip install pytest-rerunfailures
pytest --reruns 3  # 失败重试3次

# 超时控制
pip install pytest-timeout
pytest --timeout=300  # 每个测试最多5分钟

# 随机执行顺序
pip install pytest-randomly
pytest  # 自动随机化测试顺序

# BDD支持
pip install pytest-bdd

# 异步测试
pip install pytest-asyncio
```

使用示例:
```python
# test_with_plugins.py

import pytest
import time

@pytest.mark.timeout(5)
def test_quick_operation():
    """5秒超时"""
    result = quick_function()
    assert result == True

@pytest.mark.flaky(reruns=3)
def test_unstable_feature():
    """不稳定的测试,失败重试3次"""
    assert random_api_call() == 'success'

@pytest.mark.asyncio
async def test_async_operation():
    """异步测试"""
    result = await async_function()
    assert result == True
```

---

## 实战示例

### 完整的游戏测试套件

```python
# conftest.py
import pytest
from game import Game, Player, Database

@pytest.fixture(scope='session')
def db():
    """数据库连接"""
    database = Database()
    database.connect()
    yield database
    database.close()

@pytest.fixture
def game(db):
    """游戏实例"""
    g = Game(db)
    g.initialize()
    yield g
    g.cleanup()

@pytest.fixture
def player(game):
    """测试玩家"""
    p = game.create_player('test_player')
    yield p
    game.remove_player(p.id)

# test_player_system.py
import pytest

class TestPlayerSystem:
    """玩家系统测试"""
    
    def test_player_creation(self, player):
        """测试创建玩家"""
        assert player.name == 'test_player'
        assert player.level == 1
        assert player.hp > 0
    
    @pytest.mark.parametrize('exp,expected_level', [
        (0, 1), (1000, 2), (5000, 6)
    ])
    def test_leveling(self, player, exp, expected_level):
        """测试升级系统"""
        player.gain_exp(exp)
        assert player.level == expected_level
    
    def test_combat(self, player, game):
        """测试战斗系统"""
        enemy = game.spawn_enemy('goblin')
        initial_hp = player.hp
        
        player.attack(enemy)
        assert enemy.hp < enemy.max_hp
        
        enemy.attack(player)
        assert player.hp < initial_hp
```

---

## 最佳实践

1. **测试命名**: 使用清晰的test_前缀和描述性名称
2. **一个测试一个目的**: 每个测试只验证一个功能点
3. **使用fixture**: 避免重复的setup代码
4. **参数化**: 用参数化测试覆盖多个场景
5. **独立性**: 测试之间不应该有依赖
6. **快速反馈**: 优先运行快速测试
7. **清晰断言**: 断言失败时应该容易理解原因

---

## 下一步

继续学习:
- [03. Selenium Web自动化](03-selenium-automation.md)
- [04. Appium移动测试](04-appium-mobile.md)
- [08. 最佳实践](08-best-practices.md)
