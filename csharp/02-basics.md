# 02. 基础语法详解

> C#基础语法完全指南 - 从C/C++到C#的语法对比学习

---

## 📌 本章导航

- [数据类型详解](#数据类型详解)
- [变量和常量](#变量和常量)
- [控制流语句](#控制流语句)
- [方法定义和调用](#方法定义和调用)
- [参数传递机制](#参数传递机制)
- [类型转换](#类型转换)
- [异常处理基础](#异常处理基础)
- [C#与C/C++语法差异总结](#c与cc语法差异总结)

---

## 数据类型详解

### 值类型 (Value Types)

C#的值类型与C/C++有很多相似之处,但也有一些重要差异:

```csharp
// 整数类型
sbyte  num1 = -128;    // 8位有符号整数 (-128 到 127)
byte   num2 = 255;     // 8位无符号整数 (0 到 255)
short  num3 = -32768;  // 16位有符号整数
ushort num4 = 65535;   // 16位无符号整数
int    num5 = -2147483648;  // 32位有符号整数 (与C++ int相同)
uint   num6 = 4294967295U;  // 32位无符号整数
long   num7 = 9223372036854775807L;  // 64位有符号整数
ulong  num8 = 18446744073709551615UL; // 64位无符号整数

// 浮点类型
float  f1 = 3.14F;     // 32位浮点数 (需要F后缀)
double f2 = 3.14159;   // 64位浮点数 (默认)
decimal f3 = 3.14159M; // 128位高精度浮点数 (需要M后缀)

// 布尔类型
bool   flag = true;    // 与C++ bool相同

// 字符类型
char   ch = 'A';       // 16位Unicode字符 (与C++ char不同)
```

**与C/C++的主要差异**:

| C/C++ | C# | 说明 |
|-------|-----|------|
| `bool` | `bool` | 相同 |
| `char` (8位) | `char` (16位) | C#的char是Unicode |
| `wchar_t` | `char` | C#原生支持Unicode |
| 无内置decimal | `decimal` | C#提供高精度小数类型 |

### 引用类型 (Reference Types)

```csharp
// 字符串类型
string name = "Hello World";  // 与C++ string类似,但更安全
string multiline = @"这是一个
多行字符串
支持换行";

// 数组
int[] numbers = new int[5];           // 一维数组
int[,] matrix = new int[3, 3];        // 二维数组
int[][] jagged = new int[3][];        // 锯齿数组

// 对象
Player player = new Player();         // 创建对象
```

### 可空类型 (Nullable Types)

```csharp
// C#特有的可空类型
int? nullableInt = null;              // 可空整数
bool? nullableBool = null;            // 可空布尔值

// 检查可空类型
if (nullableInt.HasValue)
{
    Console.WriteLine(nullableInt.Value);
}
else
{
    Console.WriteLine("值为null");
}

// 空合并运算符
int result = nullableInt ?? 0;        // 如果为null则使用默认值
```

---

## 变量和常量

### 变量声明

```csharp
// 显式类型声明
int age = 25;
string name = "Alice";
bool isActive = true;

// 隐式类型声明 (var关键字)
var score = 100;           // 编译器推断为int
var playerName = "Bob";    // 编译器推断为string
var players = new List<string>(); // 编译器推断为List<string>

// 常量声明
const int MAX_PLAYERS = 10;        // 编译时常量
readonly double PI = 3.14159;      // 运行时常量
```

### 变量作用域

```csharp
public class GameLogic
{
    // 字段 (类级别)
    private int gameScore = 0;
    
    // 局部变量
    public void UpdateScore(int points)
    {
        int tempScore = gameScore + points;  // 方法级别
        
        if (tempScore > 1000)
        {
            bool isHighScore = true;         // 块级别
            Console.WriteLine("高分!");
        }
        
        // isHighScore在此处不可访问
    }
}
```

### 字面量表示法

```csharp
// 整数字面量
int binary = 0b1010;           // 二进制 (C# 7.0+)
int hex = 0xFF;                // 十六进制
int decimalNum = 123;          // 十进制
int largeNum = 1_000_000;     // 数字分隔符 (C# 7.0+)

// 字符串字面量
string normal = "Hello";
string verbatim = @"C:\Users\Game\Assets";  // 逐字字符串,不转义

// 字符字面量
char letter = 'A';
char escape = '\n';           // 转义字符
char unicode = 'A';      // Unicode字符 (A)
```

---

## 控制流语句

### 条件语句

```csharp
// if-else语句 (与C++基本相同)
int playerLevel = 5;
if (playerLevel >= 10)
{
    Console.WriteLine("高级玩家");
}
else if (playerLevel >= 5)
{
    Console.WriteLine("中级玩家");
}
else
{
    Console.WriteLine("初级玩家");
}

// switch语句 (C#更强大)
string playerClass = "Warrior";
switch (playerClass)
{
    case "Warrior":
        Console.WriteLine("战士 - 高生命值");
        break;
    case "Mage":
        Console.WriteLine("法师 - 高魔法");
        break;
    case "Archer" when playerLevel > 5:  // 模式匹配 (C# 7.0+)
        Console.WriteLine("高级弓箭手");
        break;
    case "Archer":
        Console.WriteLine("弓箭手");
        break;
    default:
        Console.WriteLine("未知职业");
        break;
}

// 三元运算符
string status = playerLevel >= 10 ? "Expert" : "Beginner";

// 模式匹配 (C# 7.0+)
object value = 42;
if (value is int number && number > 0)
{
    Console.WriteLine($"正整数: {number}");
}
```

### 循环语句

```csharp
// for循环 (与C++相同)
for (int i = 0; i < 10; i++)
{
    Console.WriteLine($"循环 {i}");
}

// while循环 (与C++相同)
int count = 0;
while (count < 5)
{
    Console.WriteLine($"计数: {count}");
    count++;
}

// do-while循环 (与C++相同)
int health = 100;
do
{
    health -= 10;
    Console.WriteLine($"生命值: {health}");
} while (health > 0);

// foreach循环 (C#特有,类似C++范围for)
string[] items = {"Sword", "Shield", "Potion"};
foreach (string item in items)
{
    Console.WriteLine($"物品: {item}");
}

// for-each with collections
List<int> scores = new List<int> {85, 92, 78, 96};
foreach (int score in scores)
{
    Console.WriteLine($"分数: {score}");
}

// using range-based for (C# 8.0+)
int[] numbers = {1, 2, 3, 4, 5};
foreach (int num in numbers)
{
    Console.WriteLine(num);
}
```

### 跳转语句

```csharp
// break, continue, goto (与C++相同)
for (int i = 0; i < 10; i++)
{
    if (i == 3)
        continue;  // 跳过本次循环
    
    if (i == 8)
        break;     // 退出循环
    
    Console.WriteLine(i);
}

// return (与C++相同)
public int CalculateScore(int baseScore, bool isBonus)
{
    if (isBonus)
        return baseScore * 2;
    
    return baseScore;
}
```

---

## 方法定义和调用

### 基本方法定义

```csharp
public class Player
{
    public string Name { get; set; }
    public int Level { get; set; } = 1;
    public int Health { get; set; } = 100;
    
    // 基本方法
    public void TakeDamage(int damage)
    {
        Health -= damage;
        if (Health <= 0)
        {
            Die();
        }
    }
    
    // 带返回值的方法
    public bool IsAlive()
    {
        return Health > 0;
    }
    
    // 静态方法
    public static int CalculateExperience(int currentLevel)
    {
        return currentLevel * 1000;
    }
    
    // 方法重载
    public void Move(int x, int y)
    {
        Console.WriteLine($"移动到 ({x}, {y})");
    }
    
    public void Move(Vector2 position)
    {
        Console.WriteLine($"移动到 {position}");
    }
    
    private void Die()
    {
        Console.WriteLine($"{Name} 死亡了!");
    }
}
```

### 方法参数

```csharp
public class GameMath
{
    // 值参数 (默认)
    public static int Add(int a, int b)
    {
        return a + b;
    }
    
    // 输出参数 (类似C++的引用参数)
    public static void GetPlayerStats(out int level, out int health)
    {
        level = 10;
        health = 100;
    }
    
    // 引用参数 (类似C++的引用)
    public static void ModifyPlayer(ref int health)
    {
        health += 50;
    }
    
    // 可变参数 (类似C++的可变参数模板)
    public static int Sum(params int[] numbers)
    {
        int total = 0;
        foreach (int num in numbers)
        {
            total += num;
        }
        return total;
    }
    
    // 命名参数 (C#特有)
    public static void CreatePlayer(string name, int level = 1, int health = 100)
    {
        Console.WriteLine($"创建玩家: {name}, 等级: {level}, 生命: {health}");
    }
    
    // 可选参数 (C#特有)
    public static void Attack(string target, int damage = 10, bool isCritical = false)
    {
        Console.WriteLine($"攻击 {target} 造成 {damage} 点伤害");
        if (isCritical)
            Console.WriteLine("暴击!");
    }
}

// 使用示例
Player player = new Player();
GameMath.GetPlayerStats(out int level, out int health);  // 输出参数
GameMath.ModifyPlayer(ref health);                      // 引用参数
int sum = GameMath.Sum(1, 2, 3, 4, 5);                 // 可变参数
GameMath.CreatePlayer("Hero", health: 150);            // 命名参数
GameMath.Attack("Enemy");                              // 使用默认参数
```

### Lambda表达式

```csharp
using System;
using System.Collections.Generic;
using System.Linq;

// Lambda表达式 - C#强大的特性
public class GameFilter
{
    public void DemonstrateLambdas()
    {
        List<int> scores = new List<int> {85, 92, 78, 96, 88, 94};
        
        // 简单Lambda
        Func<int, bool> isHighScore = score => score > 90;
        var highScores = scores.Where(isHighScore);
        
        // 多参数Lambda
        Func<int, int, int> add = (a, b) => a + b;
        
        // 无参数Lambda
        Action printHello = () => Console.WriteLine("Hello");
        
        // 复杂Lambda
        var excellentScores = scores.Where(score => score >= 90)
                                   .OrderByDescending(score => score)
                                   .ToList();
        
        // 在Unity中使用Lambda
        List<Player> players = new List<Player>();
        var activePlayers = players.Where(p => p.Health > 0 && p.Level >= 5);
    }
}
```

---

## 参数传递机制

### 值传递 vs 引用传递

```csharp
public class ParameterDemo
{
    // 值传递 (默认) - 传递副本
    public static void ChangeValue(int number)
    {
        number = 100;  // 只改变局部副本
    }
    
    // 引用传递 - 传递引用
    public static void ChangeValueRef(ref int number)
    {
        number = 100;  // 改变原始值
    }
    
    // 输出参数
    public static void GetValues(out int value1, out int value2)
    {
        value1 = 10;   // 必须赋值
        value2 = 20;   // 必须赋值
    }
    
    // 演示
    public static void Demo()
    {
        int num = 5;
        Console.WriteLine($"初始值: {num}");  // 5
        
        ChangeValue(num);
        Console.WriteLine($"值传递后: {num}");  // 5 (未改变)
        
        ChangeValueRef(ref num);
        Console.WriteLine($"引用传递后: {num}");  // 100 (已改变)
        
        GetValues(out int a, out int b);
        Console.WriteLine($"输出参数: {a}, {b}");  // 10, 20
    }
}
```

### 引用类型参数

```csharp
public class ReferenceTypeDemo
{
    // 引用类型参数 - 传递引用的副本
    public static void ModifyList(List<int> list)
    {
        list.Add(999);        // 会修改原始列表
        list = new List<int> {1, 2, 3};  // 只改变局部引用,不影响原始列表
    }
    
    // 使用ref传递引用本身
    public static void ReplaceList(ref List<int> list)
    {
        list = new List<int> {1, 2, 3};  // 会替换原始列表
    }
    
    public static void Demo()
    {
        List<int> numbers = new List<int> {1, 2, 3};
        Console.WriteLine($"初始: [{string.Join(", ", numbers)}]");  // [1, 2, 3]
        
        ModifyList(numbers);
        Console.WriteLine($"修改后: [{string.Join(", ", numbers)}]");  // [1, 2, 3, 999]
        
        ReplaceList(ref numbers);
        Console.WriteLine($"替换后: [{string.Join(", ", numbers)}]");  // [1, 2, 3]
    }
}
```

---

## 类型转换

### 隐式转换

```csharp
public class TypeConversion
{
    public static void ImplicitConversion()
    {
        // 数值类型隐式转换 (从小到大)
        byte b = 100;
        int i = b;        // byte -> int (安全)
        long l = i;       // int -> long (安全)
        float f = l;      // long -> float (可能精度损失)
        double d = f;     // float -> double (安全)
        
        // 引用类型隐式转换
        Player player = new Player();
        object obj = player;  // 派生类 -> 基类 (安全)
        
        // 值类型隐式转换
        int? nullableInt = 5;  // int -> int? (安全)
    }
}
```

### 显式转换

```csharp
public class ExplicitConversion
{
    public static void ExplicitConversionDemo()
    {
        // 数值类型显式转换 (强制转换)
        int largeNum = 1000000;
        short smallNum = (short)largeNum;  // 可能数据丢失
        
        // 检查转换 (安全方式)
        if (largeNum <= short.MaxValue && largeNum >= short.MinValue)
        {
            smallNum = (short)largeNum;
        }
        
        // 使用Convert类 (更安全)
        try
        {
            short converted = Convert.ToInt16(largeNum);
        }
        catch (OverflowException)
        {
            Console.WriteLine("转换溢出!");
        }
        
        // 引用类型转换
        object obj = new Player();
        if (obj is Player player)
        {
            // 安全转换
            Console.WriteLine($"玩家: {player.Name}");
        }
        
        // as运算符 (失败返回null)
        Player player2 = obj as Player;
        if (player2 != null)
        {
            Console.WriteLine($"转换成功: {player2.Name}");
        }
        
        // is运算符 (类型检查)
        if (obj is Player)
        {
            Player p = (Player)obj;  // 安全转换
        }
    }
}
```

### 用户定义转换

```csharp
public struct Vector2
{
    public float X { get; set; }
    public float Y { get; set; }
    
    public Vector2(float x, float y)
    {
        X = x;
        Y = y;
    }
    
    // 隐式转换
    public static implicit operator Vector2(Point point)
    {
        return new Vector2(point.X, point.Y);
    }
    
    // 显式转换
    public static explicit operator Point(Vector2 vector)
    {
        return new Point((int)vector.X, (int)vector.Y);
    }
    
    public override string ToString()
    {
        return $"({X}, {Y})";
    }
}

public struct Point
{
    public int X { get; set; }
    public int Y { get; set; }
    
    public Point(int x, int y)
    {
        X = x;
        Y = y;
    }
}

// 使用示例
public class ConversionUsage
{
    public static void Demo()
    {
        Point point = new Point(10, 20);
        
        // 隐式转换
        Vector2 vector = point;  // 自动转换
        Console.WriteLine(vector);  // (10, 20)
        
        // 显式转换
        Point converted = (Point)vector;  // 需要显式转换
        Console.WriteLine($"({converted.X}, {converted.Y})");
    }
}
```

---

## 异常处理基础

### try-catch-finally

```csharp
using System;
using System.IO;

public class ExceptionHandling
{
    public static void BasicExceptionHandling()
    {
        try
        {
            // 可能抛出异常的代码
            int[] numbers = {1, 2, 3};
            int value = numbers[10];  // 索引超出范围
        }
        catch (IndexOutOfRangeException ex)
        {
            // 处理特定异常
            Console.WriteLine($"数组越界: {ex.Message}");
        }
        catch (Exception ex)
        {
            // 处理所有其他异常
            Console.WriteLine($"发生异常: {ex.Message}");
        }
        finally
        {
            // 无论是否发生异常都会执行
            Console.WriteLine("清理资源");
        }
    }
    
    // 多异常处理 (C# 6.0+)
    public static void MultipleExceptions()
    {
        try
        {
            // 一些操作
        }
        catch (FileNotFoundException)
        {
            Console.WriteLine("文件未找到");
        }
        catch (DirectoryNotFoundException)
        {
            Console.WriteLine("目录未找到");
        }
        catch (IOException ex) when (ex.Message.Contains("access"))
        {
            // 异常过滤器 (C# 7.0+)
            Console.WriteLine("访问权限问题");
        }
    }
    
    // 异常抛出
    public static void ThrowException(int level)
    {
        if (level < 1)
        {
            throw new ArgumentException("等级不能小于1", nameof(level));
        }
        
        if (level > 100)
        {
            throw new ArgumentOutOfRangeException(nameof(level), "等级不能超过100");
        }
    }
    
    // 自定义异常
    public class GameException : Exception
    {
        public GameException(string message) : base(message) { }
        public GameException(string message, Exception inner) : base(message, inner) { }
    }
    
    public static void UseCustomException()
    {
        try
        {
            throw new GameException("游戏错误");
        }
        catch (GameException ex)
        {
            Console.WriteLine($"游戏异常: {ex.Message}");
        }
    }
}
```

### using语句 (资源管理)

```csharp
using System;
using System.IO;

public class ResourceManagement
{
    // 传统的try-finally
    public static void TraditionalWay()
    {
        FileStream file = null;
        try
        {
            file = new FileStream("data.txt", FileMode.Open);
            // 使用文件
        }
        finally
        {
            file?.Dispose();  // 确保资源释放
        }
    }
    
    // using语句 (推荐)
    public static void UsingStatement()
    {
        using (FileStream file = new FileStream("data.txt", FileMode.Open))
        {
            // 使用文件
            // 离开using块时自动调用Dispose()
        }
    }
    
    // using声明 (C# 8.0+)
    public static void UsingDeclaration()
    {
        using FileStream file = new FileStream("data.txt", FileMode.Open);
        // 文件在方法结束时自动释放
    }
    
    // 多个资源
    public static void MultipleResources()
    {
        using (FileStream input = new FileStream("input.txt", FileMode.Open))
        using (FileStream output = new FileStream("output.txt", FileMode.Create))
        {
            // 同时使用多个资源
        }
    }
}
```

---

## C#与C/C++语法差异总结

### 1. 内存管理

**C/C++**:
```cpp
// 手动管理内存
Player* player = new Player();
// 必须手动delete
delete player;
player = nullptr;
```

**C#**:
```csharp
// 自动垃圾回收
Player player = new Player();
// 无需手动释放,GC自动管理
```

### 2. 指针 vs 引用

**C/C++**:
```cpp
int value = 10;
int* ptr = &value;  // 指针
*ptr = 20;          // 解引用
```

**C#**:
```csharp
int value = 10;
// C#避免使用指针,更安全
int refValue = value;  // 值类型是值传递
// 如果需要引用语义,使用ref参数
```

### 3. 字符串处理

**C/C++**:
```cpp
#include <string>
std::string name = "Hello";
name += " World";  // 拼接
```

**C#**:
```csharp
string name = "Hello";
name += " World";  // 拼接
string formatted = $"Hello {name}!";  // 字符串插值 (更强大)
```

### 4. 数组声明

**C/C++**:
```cpp
int arr[5] = {1, 2, 3, 4, 5};  // 栈上数组
int* arr2 = new int[5];         // 堆上数组
```

**C#**:
```csharp
int[] arr = {1, 2, 3, 4, 5};    // 引用类型
int[] arr2 = new int[5];        // 创建指定大小
```

### 5. 函数指针 vs 委托

**C/C++**:
```cpp
int (*func)(int, int) = &add;   // 函数指针
```

**C#**:
```csharp
Func<int, int, int> func = (a, b) => a + b;  // 委托
Action<string> print = Console.WriteLine;     // 无返回值委托
```

---

## 实践练习

### 练习1: 游戏数据管理器

```csharp
using System;
using System.Collections.Generic;

public class GameDataManager
{
    private Dictionary<string, object> _gameData = new Dictionary<string, object>();
    
    // 设置数据
    public void SetData<T>(string key, T value)
    {
        _gameData[key] = value;
    }
    
    // 获取数据
    public T GetData<T>(string key, T defaultValue = default(T))
    {
        if (_gameData.TryGetValue(key, out object value))
        {
            if (value is T result)
            {
                return result;
            }
            
            // 尝试转换
            try
            {
                return (T)Convert.ChangeType(value, typeof(T));
            }
            catch
            {
                return defaultValue;
            }
        }
        
        return defaultValue;
    }
    
    // 检查数据是否存在
    public bool HasData(string key)
    {
        return _gameData.ContainsKey(key);
    }
    
    // 删除数据
    public bool RemoveData(string key)
    {
        return _gameData.Remove(key);
    }
    
    // 清空所有数据
    public void ClearAll()
    {
        _gameData.Clear();
    }
    
    // 获取所有键
    public List<string> GetAllKeys()
    {
        return new List<string>(_gameData.Keys);
    }
}

// 使用示例
public class PracticeDemo
{
    public static void Run()
    {
        GameDataManager manager = new GameDataManager();
        
        // 存储不同类型的数据
        manager.SetData("playerName", "Hero");
        manager.SetData("playerLevel", 10);
        manager.SetData("playerHealth", 100.5f);
        manager.SetData("isOnline", true);
        
        // 读取数据
        string name = manager.GetData<string>("playerName");
        int level = manager.GetData<int>("playerLevel");
        float health = manager.GetData<float>("playerHealth");
        bool online = manager.GetData<bool>("isOnline");
        
        Console.WriteLine($"玩家: {name}, 等级: {level}, 生命: {health}, 在线: {online}");
        
        // 使用默认值
        int score = manager.GetData<int>("playerScore", 0);
        Console.WriteLine($"分数: {score}");  // 输出: 分数: 0
    }
}
```

### 练习2: 简单的游戏状态机

```csharp
using System;

public enum GameState
{
    Menu,
    Playing,
    Paused,
    GameOver
}

public class SimpleGameStateMachine
{
    private GameState _currentState = GameState.Menu;
    
    public GameState CurrentState 
    { 
        get { return _currentState; }
        private set { _currentState = value; }
    }
    
    public void ChangeState(GameState newState)
    {
        if (newState == _currentState)
        {
            Console.WriteLine("已经在该状态");
            return;
        }
        
        GameState oldState = _currentState;
        _currentState = newState;
        
        OnStateExit(oldState);
        OnStateEnter(newState);
    }
    
    private void OnStateEnter(GameState state)
    {
        switch (state)
        {
            case GameState.Menu:
                Console.WriteLine("进入主菜单");
                break;
            case GameState.Playing:
                Console.WriteLine("开始游戏");
                break;
            case GameState.Paused:
                Console.WriteLine("游戏暂停");
                break;
            case GameState.GameOver:
                Console.WriteLine("游戏结束");
                break;
        }
    }
    
    private void OnStateExit(GameState state)
    {
        switch (state)
        {
            case GameState.Menu:
                Console.WriteLine("离开主菜单");
                break;
            case GameState.Playing:
                Console.WriteLine("停止游戏");
                break;
            case GameState.Paused:
                Console.WriteLine("恢复游戏");
                break;
            case GameState.GameOver:
                Console.WriteLine("结束游戏结束状态");
                break;
        }
    }
    
    // 状态转换验证
    public bool CanTransitionTo(GameState targetState)
    {
        switch (_currentState)
        {
            case GameState.Menu:
                return targetState == GameState.Playing;
            case GameState.Playing:
                return targetState == GameState.Paused || targetState == GameState.GameOver;
            case GameState.Paused:
                return targetState == GameState.Playing || targetState == GameState.Menu;
            case GameState.GameOver:
                return targetState == GameState.Menu;
            default:
                return false;
        }
    }
    
    public void HandleInput(string input)
    {
        switch (input.ToLower())
        {
            case "start":
                if (CanTransitionTo(GameState.Playing))
                    ChangeState(GameState.Playing);
                break;
            case "pause":
                if (CanTransitionTo(GameState.Paused))
                    ChangeState(GameState.Paused);
                break;
            case "resume":
                if (CanTransitionTo(GameState.Playing))
                    ChangeState(GameState.Playing);
                break;
            case "menu":
                if (CanTransitionTo(GameState.Menu))
                    ChangeState(GameState.Menu);
                break;
            case "gameover":
                if (CanTransitionTo(GameState.GameOver))
                    ChangeState(GameState.GameOver);
                break;
        }
    }
}

// 使用示例
public class StateMachineDemo
{
    public static void Run()
    {
        SimpleGameStateMachine stateMachine = new SimpleGameStateMachine();
        
        Console.WriteLine($"当前状态: {stateMachine.CurrentState}");
        
        stateMachine.HandleInput("start");
        Console.WriteLine($"当前状态: {stateMachine.CurrentState}");
        
        stateMachine.HandleInput("pause");
        Console.WriteLine($"当前状态: {stateMachine.CurrentState}");
        
        stateMachine.HandleInput("resume");
        Console.WriteLine($"当前状态: {stateMachine.CurrentState}");
        
        stateMachine.HandleInput("gameover");
        Console.WriteLine($"当前状态: {stateMachine.CurrentState}");
    }
}
```

---

## 常见错误和最佳实践

### 1. 避免装箱/拆箱性能问题

```csharp
// 错误: 频繁的装箱拆箱
List<object> numbers = new List<object>();
for (int i = 0; i < 1000000; i++)
{
    numbers.Add(i);  // 装箱
    int value = (int)numbers[i];  // 拆箱
}

// 正确: 使用泛型
List<int> numbers = new List<int>();
for (int i = 0; i < 1000000; i++)
{
    numbers.Add(i);  // 无需装箱
    int value = numbers[i];  // 无需拆箱
}
```

### 2. 字符串拼接优化

```csharp
// 错误: 低效的字符串拼接
string result = "";
for (int i = 0; i < 1000; i++)
{
    result += "Item " + i + ", ";  // 每次都创建新字符串
}

// 正确: 使用StringBuilder
using System.Text;
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 1000; i++)
{
    sb.Append("Item ");
    sb.Append(i);
    sb.Append(", ");
}
string result = sb.ToString();

// 或者使用字符串插值 (C# 6.0+)
string result = string.Join(", ", Enumerable.Range(0, 1000).Select(i => $"Item {i}"));
```

### 3. 正确使用异常

```csharp
// 错误: 用异常控制流程
public int GetPlayerScore(string playerName)
{
    try
    {
        return playerScores[playerName];
    }
    catch (KeyNotFoundException)
    {
        return 0;  // 不应该用异常来处理正常流程
    }
}

// 正确: 使用Try模式
public bool TryGetPlayerScore(string playerName, out int score)
{
    return playerScores.TryGetValue(playerName, out score);
}

// 使用
if (TryGetPlayerScore("player1", out int score))
{
    Console.WriteLine($"分数: {score}");
}
else
{
    Console.WriteLine("玩家不存在");
}
```

---

## 总结

本章我们学习了C#的基础语法,包括:

✅ **数据类型**: 值类型、引用类型、可空类型  
✅ **变量和常量**: 声明、作用域、字面量  
✅ **控制流**: if/switch/循环语句  
✅ **方法**: 定义、参数传递、Lambda表达式  
✅ **类型转换**: 隐式/显式转换  
✅ **异常处理**: try-catch-finally  

这些基础知识是C#游戏开发的根基。与C/C++相比,C#提供了更安全的内存管理、更丰富的类型系统和更简洁的语法。

---

## 下一步

继续学习 [03. 面向对象编程](03-oop.md) →
