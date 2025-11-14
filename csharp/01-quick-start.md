# 01. C/C++开发者快速入门

> 基于C/C++经验的C#快速上手指南

---

## 📌 本章导航

- [为什么选择C#](#为什么选择c)
- [C# vs C/C++ 详细对比](#c-vs-cc-详细对比)
- [开发环境搭建](#开发环境搭建)
- [第一个C#程序](#第一个c程序)
- [关键概念速览](#关键概念速览)
- [从C/C++到C#的思维转换](#从cc到c的思维转换)

---

## 为什么选择C#

### 1. 游戏开发的首选语言

C#在游戏开发领域具有显著优势:

```csharp
// C#让游戏开发变得简单直观
public class Player : MonoBehaviour
{
    public int health = 100;
    public float speed = 5.0f;
    
    void Update()
    {
        // 简洁的游戏逻辑
        if (health <= 0) {
            Die();
        }
    }
    
    void Die()
    {
        Debug.Log("Player died!");
        Destroy(gameObject);
    }
}
```

### 2. 与C/C++的相似性

如果你有C/C++基础,学习C#会非常容易:
- 语法结构相似
- 面向对象概念相通
- 内存管理更简单
- 强大的标准库

### 3. Unity引擎的官方语言

- Unity是全球最受欢迎的游戏引擎
- C#是Unity的首选脚本语言
- 丰富的社区资源和文档

---

## C# vs C/C++ 详细对比

### 语法对比表

| 特性 | C/C++ | C# | 说明 |
|------|-------|-----|------|
| **Hello World** | ```cpp
#include <iostream>
using namespace std;
int main() {
    cout << "Hello";
    return 0;
}
``` | ```csharp
using System;
class Program {
    static void Main() {
        Console.WriteLine("Hello");
    }
}
``` | 结构相似,语法更简洁 |
| **变量声明** | ```cpp
int age = 25;
string name = "Alice";
``` | ```csharp
int age = 25;
string name = "Alice";
``` | 基本相同 |
| **数组** | ```cpp
int arr[5] = {1,2,3,4,5};
``` | ```csharp
int[] arr = {1,2,3,4,5};
``` | 语法稍有不同 |
| **指针** | ```cpp
int* ptr = &value;
*ptr = 10;
``` | ```csharp
// 不推荐使用
unsafe {
    int* ptr = &value;
}
// 推荐使用引用
int value = 10;
int refValue = value;
``` | C#避免指针,更安全 |
| **类定义** | ```cpp
class Player {
private:
    int health;
public:
    void TakeDamage(int damage);
};
``` | ```csharp
public class Player {
    private int health;
    public void TakeDamage(int damage) {
        // 实现
    }
}
``` | 语法更简洁 |

### 主要差异详解

#### 1. 内存管理

**C/C++**:
```cpp
// 手动管理内存
Player* player = new Player();
// 必须手动释放
delete player;
player = nullptr;
```

**C#**:
```csharp
// 自动垃圾回收
Player player = new Player();
// 无需手动释放,GC自动处理
```

#### 2. 异常处理

**C/C++**:
```cpp
// 异常处理复杂
try {
    riskyOperation();
} catch (const std::exception& e) {
    // 处理异常
}
```

**C#**:
```csharp
// 异常处理更简洁
try {
    RiskyOperation();
} catch (Exception ex) {
    // 处理异常
    Debug.LogError(ex.Message);
}
```

#### 3. 字符串处理

**C/C++**:
```cpp
#include <string>
std::string name = "Alice";
name += " Bob";  // 拼接
```

**C#**:
```csharp
string name = "Alice";
name += " Bob";  // 拼接更简单
string formatted = $"Hello, {name}!";  // 字符串插值
```

---

## 开发环境搭建

### 1. Visual Studio (推荐)

**下载安装**:
- 访问 [Visual Studio官网](https://visualstudio.microsoft.com/)
- 下载Community版本(免费)
- 安装时选择".NET桌面开发"和"游戏开发与Unity"

**Unity集成**:
- Visual Studio Tools for Unity插件自动安装
- 提供Unity项目模板
- 调试Unity游戏的强大功能

### 2. Visual Studio Code

**安装扩展**:
```bash
# 必需扩展
- C# (Omnisharp)
- Unity Tools
- C# Extensions
- Unity Snippets
```

**配置launch.json**:
```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Launch Unity",
            "type": "coreclr",
            "request": "launch",
            "program": "${workspaceFolder}/Unity.exe",
            "args": [],
            "cwd": "${workspaceFolder}",
            "stopAtEntry": false
        }
    ]
}
```

### 3. Unity Hub安装

**Unity版本选择**:
- **LTS (长期支持)**: 2022.3.x - 适合生产项目
- **Latest Release**: 最新功能 - 适合学习和实验

**安装步骤**:
1. 下载Unity Hub
2. 通过Hub安装Unity编辑器
3. 选择Unity Personal(个人版,免费)

---

## 第一个C#程序

### 基础控制台程序

```csharp
using System;

namespace GameDevelopment
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("欢迎来到C#游戏开发!");
            
            // 变量声明
            string playerName = "Hero";
            int level = 1;
            float health = 100.0f;
            
            // 输出信息
            Console.WriteLine($"玩家: {playerName}");
            Console.WriteLine($"等级: {level}");
            Console.WriteLine($"血量: {health}");
            
            // 简单游戏循环
            bool gameRunning = true;
            while (gameRunning)
            {
                Console.WriteLine("\n选择操作:");
                Console.WriteLine("1. 移动");
                Console.WriteLine("2. 攻击");
                Console.WriteLine("3. 退出");
                
                string input = Console.ReadLine();
                
                switch (input)
                {
                    case "1":
                        Console.WriteLine("玩家移动了!");
                        break;
                    case "2":
                        Console.WriteLine("玩家攻击了!");
                        break;
                    case "3":
                        gameRunning = false;
                        break;
                    default:
                        Console.WriteLine("无效选择!");
                        break;
                }
            }
            
            Console.WriteLine("游戏结束!");
        }
    }
}
```

### Unity游戏脚本示例

```csharp
using UnityEngine;

public class PlayerController : MonoBehaviour
{
    [Header("移动设置")]
    public float moveSpeed = 5.0f;
    public float jumpForce = 10.0f;
    
    [Header("游戏状态")]
    public int health = 100;
    public int score = 0;
    
    private Rigidbody2D rb;
    private bool isGrounded;
    
    void Start()
    {
        // 初始化组件
        rb = GetComponent<Rigidbody2D>();
        isGrounded = true;
    }
    
    void Update()
    {
        // 水平移动
        float moveInput = Input.GetAxis("Horizontal");
        rb.velocity = new Vector2(moveInput * moveSpeed, rb.velocity.y);
        
        // 跳跃
        if (Input.GetButtonDown("Jump") && isGrounded)
        {
            rb.velocity = new Vector2(rb.velocity.x, jumpForce);
            isGrounded = false;
        }
        
        // 翻转角色方向
        if (moveInput > 0)
            transform.localScale = new Vector3(1, 1, 1);
        else if (moveInput < 0)
            transform.localScale = new Vector3(-1, 1, 1);
    }
    
    void OnCollisionEnter2D(Collision2D collision)
    {
        if (collision.gameObject.CompareTag("Ground"))
        {
            isGrounded = true;
        }
    }
    
    public void TakeDamage(int damage)
    {
        health -= damage;
        if (health <= 0)
        {
            Die();
        }
    }
    
    void Die()
    {
        Debug.Log("玩家死亡!");
        Destroy(gameObject);
    }
}
```

---

## 关键概念速览

### 1. 命名空间 (Namespace)

```csharp
// 类似C++的命名空间
namespace Game.World
{
    public class Player
    {
        // 类定义
    }
}

// 使用
using Game.World;
Player player = new Player();
```

### 2. 访问修饰符

```csharp
public class GameEntity
{
    public int id;           // 任何地方可访问
    protected string name;   // 派生类可访问
    private float health;    // 仅本类可访问
    internal string tag;     // 程序集内可访问
}
```

### 3. 属性 (Properties)

```csharp
public class Player
{
    private int _health = 100;
    
    // 属性 - 类似C++的getter/setter
    public int Health
    {
        get { return _health; }
        set 
        { 
            _health = Mathf.Clamp(value, 0, 100);
            if (_health <= 0) OnDeath();
        }
    }
    
    private void OnDeath()
    {
        Debug.Log("Player died!");
    }
}
```

### 4. 自动属性

```csharp
public class GameItem
{
    // 自动属性 - 更简洁
    public string Name { get; set; }
    public int Level { get; set; } = 1;  // 默认值
    public float Price { get; private set; }  // 只读setter
}
```

### 5. 数组和集合

```csharp
// 数组
int[] numbers = new int[5];
int[] numbers2 = {1, 2, 3, 4, 5};

// 列表 (类似C++ vector)
using System.Collections.Generic;
List<string> inventory = new List<string>();
inventory.Add("Sword");
inventory.Add("Shield");

// 字典 (类似C++ map)
Dictionary<string, int> stats = new Dictionary<string, int>();
stats["strength"] = 10;
stats["agility"] = 8;

// 访问元素
string firstItem = inventory[0];
int strength = stats["strength"];
```

---

## 从C/C++到C#的思维转换

### 1. 从指针到引用

**C/C++思维**:
```cpp
Player* player = new Player();
player->TakeDamage(10);
delete player;
```

**C#思维**:
```csharp
Player player = new Player();
player.TakeDamage(10);
// 无需手动释放
```

### 2. 从手动内存管理到GC

**C/C++**:
```cpp
// 需要小心内存泄漏
int* data = new int[1000];
// 必须delete[] data;
```

**C#**:
```csharp
// 自动管理
int[] data = new int[1000];
// GC自动回收
```

### 3. 从多继承到接口

**C/C++**:
```cpp
class A {};
class B {};
class C : public A, public B {};  // 多继承
```

**C#**:
```csharp
interface IA {};
interface IB {};
class C : IA, IB {};  // 实现多个接口
```

### 4. 从模板到泛型

**C/C++**:
```cpp
template<typename T>
class Container {
    T data;
};
```

**C#**:
```csharp
class Container<T> {
    T data;
}
```

---

## C#游戏开发优势

### 1. 与Unity的完美集成

```csharp
// Unity的组件系统
public class EnemyAI : MonoBehaviour
{
    public Transform player;
    public float chaseRange = 10f;
    
    void Update()
    {
        if (Vector3.Distance(transform.position, player.position) < chaseRange)
        {
            ChasePlayer();
        }
    }
    
    void ChasePlayer()
    {
        transform.position = Vector3.MoveTowards(
            transform.position, 
            player.position, 
            Time.deltaTime * 5f
        );
    }
}
```

### 2. 丰富的API和工具

```csharp
// Unity内置功能
void OnTriggerEnter2D(Collider2D other)
{
    if (other.CompareTag("Player"))
    {
        // 简单的碰撞检测
        other.GetComponent<Player>().TakeDamage(10);
    }
}

// 协程 - 异步操作
IEnumerator DelayedAction()
{
    yield return new WaitForSeconds(2f);
    Debug.Log("2秒后执行!");
}
```

### 3. 强大的调试工具

```csharp
// 调试输出
Debug.Log("信息");
Debug.LogWarning("警告");
Debug.LogError("错误");

// 条件调试
#if UNITY_EDITOR
Debug.Log("仅在编辑器中输出");
#endif
```

---

## 学习建议

### 1. 对比学习法

- 将C#概念与已知的C++概念对比
- 重点关注差异点
- 练习相同功能的不同实现方式

### 2. 实践驱动

- 边学边做小项目
- 从简单的控制台程序开始
- 逐步过渡到Unity游戏

### 3. 代码重构

- 将C++代码改写为C#
- 体会两种语言的差异
- 理解C#的优势

---

## 常见初学者误区

### 1. 过度使用new

**错误**:
```csharp
// 不必要的对象创建
void Update()
{
    Vector3 pos = new Vector3(1, 2, 3);  // 每帧创建新对象
}
```

**正确**:
```csharp
// 使用静态方法或缓存
void Update()
{
    Vector3 pos = new Vector3(1, 2, 3);  // 可以,但要避免在Update中
    // 或者缓存
    private Vector3 cachedPos = new Vector3(1, 2, 3);
}
```

### 2. 忽视Unity生命周期

```csharp
public class GameEntity : MonoBehaviour
{
    // 错误: 在构造函数中访问Unity API
    public GameEntity()
    {
        // GetComponent在这里不可用
    }
    
    // 正确: 在Start或Awake中
    void Start()
    {
        var component = GetComponent<Renderer>();
    }
}
```

---

## 下一步

恭喜!你已经完成了C#的快速入门。现在你了解了:

✅ C#与C/C++的主要差异  
✅ 开发环境搭建  
✅ 第一个C#程序  
✅ 关键概念  

开始学习 [02. 基础语法详解](02-basics.md) →
