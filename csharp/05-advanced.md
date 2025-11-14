# 05. 高级特性

> C#高级特性完全指南 - 委托、事件、异步编程、反射等

---

## 📌 本章导航

- [委托 (Delegates)](#委托-delegates)
- [事件 (Events)](#事件-events)
- [Lambda表达式](#lambda表达式)
- [异步编程 (async/await)](#异步编程-asyncawait)
- [反射 (Reflection)](#反射-reflection)
- [特性 (Attributes)](#特性-attributes)
- [内存管理](#内存管理)
- [游戏开发中的应用](#游戏开发中的应用)

---

## 委托 (Delegates)

### 委托基础概念

委托是C#中一种类型安全的函数指针,允许将方法作为参数传递,是事件系统的基础。

```csharp
using System;

// 1. 声明委托类型
public delegate void SimpleDelegate();
public delegate int MathOperation(int a, int b);
public delegate bool FilterDelegate(int value);

// 2. 使用预定义委托 (推荐)
// Action<T> - 无返回值
// Func<T, TResult> - 有返回值
// Predicate<T> - 返回bool的函数

public class DelegateDemo
{
    // 一些示例方法
    public static void SayHello()
    {
        Console.WriteLine("Hello from method!");
    }
    
    public static int Add(int a, int b)
    {
        return a + b;
    }
    
    public static bool IsEven(int value)
    {
        return value % 2 == 0;
    }
    
    public static void DemonstrateDelegates()
    {
        Console.WriteLine("=== 委托演示 ===");
        
        // 传统委托
        SimpleDelegate simpleDel = new SimpleDelegate(SayHello);
        simpleDel();  // 调用
        
        // 简化语法
        SimpleDelegate simpleDel2 = SayHello;
        simpleDel2();
        
        // 使用预定义委托
        Action action = SayHello;
        action();
        
        Func<int, int, int> mathOp = Add;
        int result = mathOp(5, 3);
        Console.WriteLine($"Add result: {result}");
        
        Predicate<int> filter = IsEven;
        bool isEven = filter(4);
        Console.WriteLine($"Is 4 even? {isEven}");
    }
}
```

### 多播委托

```csharp
public class MulticastDelegateDemo
{
    public static void Method1()
    {
        Console.WriteLine("Method 1 executed");
    }
    
    public static void Method2()
    {
        Console.WriteLine("Method 2 executed");
    }
    
    public static void Method3()
    {
        Console.WriteLine("Method 3 executed");
    }
    
    public static void DemonstrateMulticast()
    {
        Console.WriteLine("\n=== 多播委托演示 ===");
        
        Action multicast = Method1;
        multicast += Method2;  // 添加方法
        multicast += Method3;  // 添加方法
        
        multicast();  // 执行所有方法
        
        Console.WriteLine("\n移除Method2:");
        multicast -= Method2;  // 移除方法
        multicast();
    }
}
```

### 委托在游戏开发中的应用

```csharp
public class GameEventSystem
{
    // 定义游戏相关的委托
    public delegate void PlayerEventHandler(Player player);
    public delegate void DamageEventHandler(Player player, int damage);
    public delegate void GameStateChangeHandler(GameState oldState, GameState newState);
    
    // 事件字段
    public event PlayerEventHandler OnPlayerDeath;
    public event DamageEventHandler OnPlayerTakeDamage;
    public event GameStateChangeHandler OnGameStateChange;
    
    public void TriggerPlayerDeath(Player player)
    {
        OnPlayerDeath?.Invoke(player);  // 安全调用
    }
    
    public void TriggerPlayerTakeDamage(Player player, int damage)
    {
        OnPlayerTakeDamage?.Invoke(player, damage);
    }
    
    public void ChangeGameState(GameState newState)
    {
        OnGameStateChange?.Invoke(CurrentState, newState);
        CurrentState = newState;
    }
    
    public GameState CurrentState { get; private set; } = GameState.Menu;
}

public enum GameState
{
    Menu,
    Playing,
    Paused,
    GameOver
}

public class Player
{
    public string Name { get; set; }
    public int Health { get; set; } = 100;
    public int Level { get; set; } = 1;
}

// 游戏管理器使用委托
public class GameManager
{
    private GameEventSystem eventSystem;
    
    public GameManager()
    {
        eventSystem = new GameEventSystem();
        
        // 订阅事件
        eventSystem.OnPlayerDeath += HandlePlayerDeath;
        eventSystem.OnPlayerTakeDamage += HandlePlayerTakeDamage;
        eventSystem.OnGameStateChange += HandleGameStateChange;
    }
    
    private void HandlePlayerDeath(Player player)
    {
        Console.WriteLine($"Player {player.Name} has died!");
        // 执行死亡相关逻辑
    }
    
    private void HandlePlayerTakeDamage(Player player, int damage)
    {
        Console.WriteLine($"Player {player.Name} took {damage} damage. Health: {player.Health}");
        // 更新UI等
    }
    
    private void HandleGameStateChange(GameState oldState, GameState newState)
    {
        Console.WriteLine($"Game state changed from {oldState} to {newState}");
        // 根据状态变化执行相应逻辑
    }
    
    public void SimulateGame()
    {
        var player = new Player { Name = "Hero" };
        
        // 模拟游戏事件
        eventSystem.TriggerPlayerTakeDamage(player, 25);
        player.Health -= 25;
        
        eventSystem.TriggerPlayerTakeDamage(player, 80);
        player.Health -= 80;
        
        if (player.Health <= 0)
        {
            eventSystem.TriggerPlayerDeath(player);
        }
    }
}
```

---

## 事件 (Events)

### 事件基础

事件是基于委托的特殊成员,提供发布-订阅模式。

```csharp
using System;

public class EventPublisher
{
    // 声明事件
    public event Action<string> OnMessage;
    public event EventHandler<string> OnDataReceived;
    public event EventHandler<DataEventArgs> OnDataUpdated;
    
    // 触发事件的受保护方法
    protected virtual void OnMessageChanged(string message)
    {
        OnMessage?.Invoke(message);
    }
    
    protected virtual void OnDataReceivedInternal(string data)
    {
        OnDataReceived?.Invoke(this, data);
    }
    
    protected virtual void OnDataUpdatedInternal(DataEventArgs args)
    {
        OnDataUpdated?.Invoke(this, args);
    }
    
    // 公共方法触发事件
    public void SendMessage(string message)
    {
        OnMessageChanged(message);
    }
    
    public void ReceiveData(string data)
    {
        OnDataReceivedInternal(data);
    }
    
    public void UpdateData(string key, object value)
    {
        OnDataUpdatedInternal(new DataEventArgs(key, value));
    }
}

// 自定义事件参数
public class DataEventArgs : EventArgs
{
    public string Key { get; }
    public object Value { get; }
    
    public DataEventArgs(string key, object value)
    {
        Key = key;
        Value = value;
    }
}

public class EventSubscriber
{
    private string name;
    
    public EventSubscriber(string name)
    {
        this.name = name;
    }
    
    public void SubscribeToPublisher(EventPublisher publisher)
    {
        // 订阅不同类型的事件
        publisher.OnMessage += HandleMessage;
        publisher.OnDataReceived += HandleDataReceived;
        publisher.OnDataUpdated += HandleDataUpdated;
    }
    
    private void HandleMessage(string message)
    {
        Console.WriteLine($"{name} received message: {message}");
    }
    
    private void HandleDataReceived(object sender, string data)
    {
        Console.WriteLine($"{name} received data: {data}");
    }
    
    private void HandleDataUpdated(object sender, DataEventArgs args)
    {
        Console.WriteLine($"{name} received data update - {args.Key}: {args.Value}");
    }
    
    public void UnsubscribeFromPublisher(EventPublisher publisher)
    {
        publisher.OnMessage -= HandleMessage;
        publisher.OnDataReceived -= HandleDataReceived;
        publisher.OnDataUpdated -= HandleDataUpdated;
    }
}

// 事件演示
public class EventDemo
{
    public static void DemonstrateEvents()
    {
        Console.WriteLine("\n=== 事件演示 ===");
        
        var publisher = new EventPublisher();
        var subscriber1 = new EventSubscriber("Subscriber1");
        var subscriber2 = new EventSubscriber("Subscriber2");
        
        // 订阅事件
        subscriber1.SubscribeToPublisher(publisher);
        subscriber2.SubscribeToPublisher(publisher);
        
        // 触发事件
        publisher.SendMessage("Hello World");
        publisher.ReceiveData("Some data");
        publisher.UpdateData("Health", 100);
        
        Console.WriteLine("\n取消订阅subscriber1:");
        subscriber1.UnsubscribeFromPublisher(publisher);
        
        // 再次触发事件
        publisher.SendMessage("Another message");
    }
}
```

### 游戏事件系统

```csharp
using System;
using System.Collections.Generic;

public class GameEventManager
{
    // 游戏事件类型
    public enum GameEventType
    {
        PlayerSpawn,
        PlayerDeath,
        EnemySpawn,
        EnemyDeath,
        ItemCollected,
        LevelUp,
        GameStart,
        GameEnd
    }
    
    // 事件数据基类
    public abstract class GameEvent
    {
        public GameEventType Type { get; }
        public DateTime Timestamp { get; }
        public object Data { get; }
        
        protected GameEvent(GameEventType type, object data = null)
        {
            Type = type;
            Timestamp = DateTime.Now;
            Data = data;
        }
    }
    
    // 具体事件类
    public class PlayerEvent : GameEvent
    {
        public Player Player { get; }
        
        public PlayerEvent(GameEventType type, Player player) : base(type, player)
        {
            Player = player;
        }
    }
    
    public class ItemEvent : GameEvent
    {
        public Item Item { get; }
        public Player Player { get; }
        
        public ItemEvent(GameEventType type, Item item, Player player) : base(type, new { Item = item, Player = player })
        {
            Item = item;
            Player = player;
        }
    }
    
    // 事件处理器委托
    public delegate void GameEventHandler(GameEvent gameEvent);
    
    // 事件字典 - 按类型存储处理器
    private Dictionary<GameEventType, List<GameEventHandler>> eventHandlers = 
        new Dictionary<GameEventType, List<GameEventHandler>>();
    
    public GameEventManager()
    {
        // 初始化所有事件类型
        foreach (GameEventType type in Enum.GetValues(typeof(GameEventType)))
        {
            eventHandlers[type] = new List<GameEventHandler>();
        }
    }
    
    // 订阅事件
    public void Subscribe(GameEventType eventType, GameEventHandler handler)
    {
        if (eventHandlers.ContainsKey(eventType))
        {
            eventHandlers[eventType].Add(handler);
        }
    }
    
    // 取消订阅事件
    public void Unsubscribe(GameEventType eventType, GameEventHandler handler)
    {
        if (eventHandlers.ContainsKey(eventType))
        {
            eventHandlers[eventType].Remove(handler);
        }
    }
    
    // 触发事件
    public void TriggerEvent(GameEvent gameEvent)
    {
        if (eventHandlers.ContainsKey(gameEvent.Type))
        {
            var handlers = eventHandlers[gameEvent.Type].ToArray(); // 防止在遍历时修改列表
            foreach (var handler in handlers)
            {
                try
                {
                    handler(gameEvent);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error in event handler: {ex.Message}");
                }
            }
        }
    }
    
    // 便捷方法
    public void TriggerPlayerSpawn(Player player)
    {
        TriggerEvent(new PlayerEvent(GameEventType.PlayerSpawn, player));
    }
    
    public void TriggerPlayerDeath(Player player)
    {
        TriggerEvent(new PlayerEvent(GameEventType.PlayerDeath, player));
    }
    
    public void TriggerItemCollected(Item item, Player player)
    {
        TriggerEvent(new ItemEvent(GameEventType.ItemCollected, item, player));
    }
}

// 游戏系统使用事件管理器
public class GameSystem
{
    private GameEventManager eventManager;
    
    public GameSystem()
    {
        eventManager = new GameEventManager();
        
        // 订阅感兴趣的事件
        eventManager.Subscribe(GameEventManager.GameEventType.PlayerDeath, OnPlayerDeath);
        eventManager.Subscribe(GameEventManager.GameEventType.ItemCollected, OnItemCollected);
        eventManager.Subscribe(GameEventManager.GameEventType.LevelUp, OnLevelUp);
    }
    
    private void OnPlayerDeath(GameEventManager.GameEvent gameEvent)
    {
        var playerEvent = gameEvent as GameEventManager.PlayerEvent;
        if (playerEvent != null)
        {
            Console.WriteLine($"Player {playerEvent.Player.Name} has died!");
            // 执行死亡相关逻辑
        }
    }
    
    private void OnItemCollected(GameEventManager.GameEvent gameEvent)
    {
        var itemEvent = gameEvent as GameEventManager.ItemEvent;
        if (itemEvent != null)
        {
            Console.WriteLine($"Player {itemEvent.Player.Name} collected {itemEvent.Item.Name}!");
            // 更新玩家状态
        }
    }
    
    private void OnLevelUp(GameEventManager.GameEvent gameEvent)
    {
        Console.WriteLine("Player leveled up!");
        // 播放音效等
    }
    
    public void SimulateGameplay()
    {
        var player = new Player { Name = "Hero", Level = 1 };
        var healthPotion = new Item { Name = "Health Potion" };
        
        // 触发一些事件
        eventManager.TriggerPlayerSpawn(player);
        eventManager.TriggerItemCollected(healthPotion, player);
        eventManager.TriggerPlayerDeath(player);
    }
}
```

---

## Lambda表达式

### Lambda基础

Lambda表达式提供了一种简洁的方式来创建匿名函数。

```csharp
using System;
using System.Collections.Generic;
using System.Linq;

public class LambdaDemo
{
    public static void BasicLambdas()
    {
        Console.WriteLine("\n=== Lambda表达式演示 ===");
        
        // 无参数Lambda
        Action hello = () => Console.WriteLine("Hello from Lambda!");
        hello();
        
        // 单参数Lambda
        Func<int, int> square = x => x * x;
        Console.WriteLine($"5的平方: {square(5)}");
        
        // 多参数Lambda
        Func<int, int, int> add = (a, b) => a + b;
        Console.WriteLine($"3 + 4 = {add(3, 4)}");
        
        // 复杂Lambda (多行)
        Func<int, int, string> complex = (x, y) =>
        {
            int result = x * y;
            if (result > 100)
                return "Large result";
            else
                return $"Small result: {result}";
        };
        
        Console.WriteLine(complex(10, 15));
        
        // 使用类型推断
        var multiply = (int a, int b) => a * b;
        Console.WriteLine($"6 * 7 = {multiply(6, 7)}");
    }
    
    public static void LambdaWithCollections()
    {
        var numbers = new List<int> { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };
        
        // 使用Lambda进行集合操作
        var evens = numbers.Where(n => n % 2 == 0).ToList();
        var squares = numbers.Select(n => n * n).ToList();
        var sum = numbers.Where(n => n > 5).Sum();
        
        Console.WriteLine($"偶数: [{string.Join(", ", evens)}]");
        Console.WriteLine($"平方: [{string.Join(", ", squares.Take(5))}...]"); // 只显示前5个
        Console.WriteLine($"大于5的数的和: {sum}");
        
        // 更复杂的Lambda
        var players = new List<Player>
        {
            new Player { Name = "Alice", Level = 15, Health = 100 },
            new Player { Name = "Bob", Level = 8, Health = 75 },
            new Player { Name = "Charlie", Level = 22, Health = 90 }
        };
        
        // 使用Lambda过滤和投影
        var highLevelPlayers = players
            .Where(p => p.Level > 10)
            .Select(p => new { Name = p.Name, Power = p.Level * 10 })
            .ToList();
        
        Console.WriteLine("高等级玩家:");
        highLevelPlayers.ForEach(p => Console.WriteLine($"  {p.Name}: {p.Power}"));
    }
    
    public static void ClosureExample()
    {
        Console.WriteLine("\n=== 闭包演示 ===");
        
        int multiplier = 10;
        
        // Lambda捕获外部变量 (闭包)
        Func<int, int> multiplyByMultiplier = x => x * multiplier;
        
        Console.WriteLine($"5 * {multiplier} = {multiplyByMultiplier(5)}");
        
        // 修改外部变量
        multiplier = 20;
        Console.WriteLine($"5 * {multiplier} = {multiplyByMultiplier(5)}"); // 闭包捕获的是变量本身
        
        // 闭包在循环中的陷阱
        var actions = new List<Action>();
        for (int i = 0; i < 3; i++)
        {
            // ❌ 这样会捕获循环变量,所有Lambda都会使用最终值
            // actions.Add(() => Console.WriteLine($"Value: {i}"));
            
            // ✅ 正确方式: 创建局部副本
            int localI = i;
            actions.Add(() => Console.WriteLine($"Value: {localI}"));
        }
        
        Console.WriteLine("循环闭包结果:");
        actions.ForEach(a => a());
    }
}
```

### Lambda在游戏开发中的应用

```csharp
public class GameLogicWithLambdas
{
    private List<Player> players = new List<Player>();
    private List<Enemy> enemies = new List<Enemy>();
    private List<Item> items = new List<Item>();
    
    public void InitializeGame()
    {
        // 使用Lambda初始化游戏对象
        players = Enumerable.Range(1, 5)
            .Select(i => new Player { Name = $"Player{i}", Level = i * 5, Health = 100 })
            .ToList();
        
        enemies = Enumerable.Range(1, 10)
            .Select(i => new Enemy { Name = $"Enemy{i}", Level = i * 2, Health = 50 })
            .ToList();
    }
    
    // 使用Lambda进行游戏逻辑处理
    public void UpdateGame()
    {
        // 恢复玩家生命值
        players.Where(p => p.Health < 100)
               .ToList()
               .ForEach(p => p.Health = Math.Min(100, p.Health + 5));
        
        // 处理受伤玩家
        var injuredPlayers = players.Where(p => p.Health < 50);
        foreach (var player in injuredPlayers)
        {
            Console.WriteLine($"{player.Name} needs healing! Health: {player.Health}");
        }
        
        // 查找最近的敌人
        var playerPosition = new Vector3(0, 0, 0);
        var nearestEnemy = enemies
            .OrderBy(e => Vector3.Distance(playerPosition, e.Position))
            .FirstOrDefault();
        
        if (nearestEnemy != null)
        {
            Console.WriteLine($"Nearest enemy: {nearestEnemy.Name}");
        }
    }
    
    // 条件逻辑使用Lambda
    public void ProcessGameEvents()
    {
        // 使用Lambda定义条件
        Func<Player, bool> isHighLevel = p => p.Level >= 20;
        Func<Player, bool> isLowHealth = p => p.Health <= 30;
        Func<Player, bool> isEligibleForReward = p => p.Level >= 10 && p.Health > 50;
        
        // 应用条件
        var highLevelPlayers = players.Where(isHighLevel).ToList();
        var lowHealthPlayers = players.Where(isLowHealth).ToList();
        var rewardEligible = players.Where(isEligibleForReward).ToList();
        
        Console.WriteLine($"High level players: {highLevelPlayers.Count}");
        Console.WriteLine($"Low health players: {lowHealthPlayers.Count}");
        Console.WriteLine($"Reward eligible: {rewardEligible.Count}");
    }
    
    // 使用Lambda进行事件处理
    public void SetupEventHandlers()
    {
        // 使用Lambda作为事件处理器
        var eventManager = new GameEventManager();
        
        eventManager.Subscribe(
            GameEventManager.GameEventType.PlayerDeath,
            gameEvent => Console.WriteLine("A player has died!")
        );
        
        eventManager.Subscribe(
            GameEventManager.GameEventType.LevelUp,
            gameEvent => {
                Console.WriteLine("Level up event triggered!");
                // 可以访问外部变量
                var currentTime = DateTime.Now;
                Console.WriteLine($"Level up occurred at: {currentTime}");
            }
        );
    }
    
    // 使用Lambda进行配置
    public void ConfigureGameSettings()
    {
        var settings = new GameSettings();
        
        // 使用Lambda验证设置
        Func<int, bool> isValidLevel = level => level >= 1 && level <= 100;
        Func<string, bool> isValidName = name => !string.IsNullOrWhiteSpace(name) && name.Length <= 20;
        
        // 应用验证
        if (isValidLevel(settings.StartingLevel))
        {
            Console.WriteLine($"Starting level {settings.StartingLevel} is valid");
        }
        
        if (isValidName(settings.DefaultPlayerName))
        {
            Console.WriteLine($"Player name '{settings.DefaultPlayerName}' is valid");
        }
    }
}

public class GameSettings
{
    public int StartingLevel { get; set; } = 1;
    public string DefaultPlayerName { get; set; } = "Player";
    public float GameSpeed { get; set; } = 1.0f;
    public bool EnableSound { get; set; } = true;
}

public class Enemy
{
    public string Name { get; set; }
    public int Level { get; set; }
    public int Health { get; set; }
    public Vector3 Position { get; set; } = Vector3.zero;
}

public struct Vector3
{
    public float X, Y, Z;
    
    public Vector3(float x, float y, float z)
    {
        X = x;
        Y = y;
        Z = z;
    }
    
    public static Vector3 zero => new Vector3(0, 0, 0);
    
    public static float Distance(Vector3 a, Vector3 b)
    {
        float dx = a.X - b.X;
        float dy = a.Y - b.Y;
        float dz = a.Z - b.Z;
        return (float)Math.Sqrt(dx * dx + dy * dy + dz * dz);
    }
}
```

---

## 异步编程 (async/await)

### 异步编程基础

```csharp
using System;
using System.Threading.Tasks;
using System.Threading;
using System.Collections.Generic;
using System.Linq;

public class AsyncProgramming
{
    public async Task<string> FetchDataAsync(string url)
    {
        Console.WriteLine($"开始获取数据: {url}");
        
        // 模拟网络请求
        await Task.Delay(2000); // 模拟异步操作
        
        Console.WriteLine($"数据获取完成: {url}");
        return $"Data from {url}";
    }
    
    public async Task ProcessMultipleDataAsync()
    {
        Console.WriteLine("\n=== 异步并行处理演示 ===");
        
        // 串行处理 (慢)
        Console.WriteLine("串行处理:");
        var start = DateTime.Now;
        
        string result1 = await FetchDataAsync("url1");
        string result2 = await FetchDataAsync("url2");
        string result3 = await FetchDataAsync("url3");
        
        var serialTime = DateTime.Now - start;
        Console.WriteLine($"串行处理完成，耗时: {serialTime.TotalSeconds:F2}秒");
        
        // 并行处理 (快)
        Console.WriteLine("\n并行处理:");
        start = DateTime.Now;
        
        var task1 = FetchDataAsync("url1");
        var task2 = FetchDataAsync("url2");
        var task3 = FetchDataAsync("url3");
        
        string[] results = await Task.WhenAll(task1, task2, task3);
        
        var parallelTime = DateTime.Now - start;
        Console.WriteLine($"并行处理完成，耗时: {parallelTime.TotalSeconds:F2}秒");
        Console.WriteLine($"性能提升: {serialTime.TotalSeconds / parallelTime.TotalSeconds:F2}x");
    }
    
    public async Task HandleErrorsAsync()
    {
        Console.WriteLine("\n=== 异步错误处理 ===");
        
        try
        {
            // 模拟可能失败的异步操作
            await Task.Run(() =>
            {
                Thread.Sleep(1000);
                throw new InvalidOperationException("模拟错误");
            });
        }
        catch (InvalidOperationException ex)
        {
            Console.WriteLine($"捕获异步异常: {ex.Message}");
        }
        
        // 使用Task.WhenAll处理多个可能失败的任务
        var tasks = new[]
        {
            FetchDataAsync("valid-url"),
            Task.Run(() => { Thread.Sleep(500); throw new Exception("Failed task"); }),
            FetchDataAsync("another-valid-url")
        };
        
        try
        {
            var results = await Task.WhenAll(tasks);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"WhenAll异常: {ex.Message}");
        }
        
        // 使用Task.WhenAll并单独检查每个任务
        var results = await Task.WhenAll(tasks.Select(async task =>
        {
            try
            {
                return await task;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"任务失败: {ex.Message}");
                return null;
            }
        }));
    }
    
    public async Task TimeoutExampleAsync()
    {
        Console.WriteLine("\n=== 异步超时处理 ===");
        
        using var cts = new CancellationTokenSource();
        cts.CancelAfter(TimeSpan.FromSeconds(1)); // 1秒后取消
        
        try
        {
            var result = await FetchDataAsync("slow-url").WaitAsync(cts.Token);
            Console.WriteLine($"操作成功: {result}");
        }
        catch (OperationCanceledException)
        {
            Console.WriteLine("操作被取消（超时）");
        }
    }
}

// 扩展方法用于超时
public static class TaskExtensions
{
    public static async Task<T> WaitAsync<T>(this Task<T> task, CancellationToken cancellationToken)
    {
        var completedTask = await Task.WhenAny(task, Task.Delay(Timeout.Infinite, cancellationToken));
        if (completedTask == task)
        {
            return await task;
        }
        else
        {
            throw new OperationCanceledException(cancellationToken);
        }
    }
    
    public static async Task WaitAsync(this Task task, CancellationToken cancellationToken)
    {
        var completedTask = await Task.WhenAny(task, Task.Delay(Timeout.Infinite, cancellationToken));
        if (completedTask == task)
        {
            await task;
        }
        else
        {
            throw new OperationCanceledException(cancellationToken);
        }
    }
}
```

### 游戏中的异步操作

```csharp
public class GameAsyncOperations
{
    private List<Player> players = new List<Player>();
    private GameEventSystem eventSystem;
    
    public GameAsyncOperations()
    {
        eventSystem = new GameEventSystem();
    }
    
    // 异步加载游戏资源
    public async Task<bool> LoadGameResourcesAsync()
    {
        Console.WriteLine("开始加载游戏资源...");
        
        var loadTasks = new List<Task>
        {
            LoadTexturesAsync(),
            LoadAudioAsync(),
            LoadModelsAsync(),
            LoadLevelsAsync()
        };
        
        try
        {
            await Task.WhenAll(loadTasks);
            Console.WriteLine("所有资源加载完成！");
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"资源加载失败: {ex.Message}");
            return false;
        }
    }
    
    private async Task LoadTexturesAsync()
    {
        await Task.Delay(1500); // 模拟加载时间
        Console.WriteLine("纹理资源加载完成");
    }
    
    private async Task LoadAudioAsync()
    {
        await Task.Delay(1000); // 模拟加载时间
        Console.WriteLine("音频资源加载完成");
    }
    
    private async Task LoadModelsAsync()
    {
        await Task.Delay(2000); // 模拟加载时间
        Console.WriteLine("模型资源加载完成");
    }
    
    private async Task LoadLevelsAsync()
    {
        await Task.Delay(1800); // 模拟加载时间
        Console.WriteLine("关卡数据加载完成");
    }
    
    // 异步网络请求
    public async Task<PlayerData> FetchPlayerDataAsync(string playerId)
    {
        Console.WriteLine($"获取玩家数据: {playerId}");
        
        // 模拟网络延迟
        await Task.Delay(800);
        
        // 模拟API调用
        var response = await SimulateApiCallAsync($"/api/players/{playerId}");
        
        if (response != null)
        {
            return Newtonsoft.Json.JsonConvert.DeserializeObject<PlayerData>(response);
        }
        
        return null;
    }
    
    private async Task<string> SimulateApiCallAsync(string endpoint)
    {
        // 模拟网络请求
        await Task.Delay(500);
        
        // 模拟成功响应
        return $"{{\"Id\":\"{endpoint.Split('/').Last()}\",\"Name\":\"TestPlayer\",\"Level\":15,\"Score\":2500}}";
    }
    
    // 异步保存游戏
    public async Task<bool> SaveGameAsync(string saveSlot)
    {
        Console.WriteLine($"开始保存游戏到槽位: {saveSlot}");
        
        try
        {
            // 收集游戏状态
            var gameState = CaptureGameState();
            
            // 序列化
            string serializedData = SerializeGameState(gameState);
            
            // 异步写入文件
            await WriteToFileAsync($"save_{saveSlot}.dat", serializedData);
            
            Console.WriteLine($"游戏已保存到: {saveSlot}");
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"保存失败: {ex.Message}");
            return false;
        }
    }
    
    private GameState CaptureGameState()
    {
        return new GameState
        {
            Players = players.ToList(),
            CurrentLevel = "Level1",
            GameTime = DateTime.Now,
            Score = players.Sum(p => p.Level * 100)
        };
    }
    
    private string SerializeGameState(GameState state)
    {
        // 简化的序列化
        return $"GameState: Players={state.Players.Count}, Level={state.CurrentLevel}, Time={state.GameTime}, Score={state.Score}";
    }
    
    private async Task WriteToFileAsync(string filename, string data)
    {
        await Task.Delay(300); // 模拟写入时间
        Console.WriteLine($"数据已写入: {filename}");
    }
    
    // 异步游戏循环
    public async Task RunGameLoopAsync(CancellationToken cancellationToken)
    {
        Console.WriteLine("游戏循环开始...");
        
        while (!cancellationToken.IsCancellationRequested)
        {
            try
            {
                // 异步更新
                await UpdateGameAsync();
                
                // 异步渲染
                await RenderFrameAsync();
                
                // 控制帧率
                await Task.Delay(16, cancellationToken); // ~60 FPS
            }
            catch (OperationCanceledException)
            {
                Console.WriteLine("游戏循环被取消");
                break;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"游戏循环错误: {ex.Message}");
            }
        }
    }
    
    private async Task UpdateGameAsync()
    {
        // 模拟游戏逻辑更新
        await Task.Yield(); // 让出控制权
        
        // 更新玩家状态
        foreach (var player in players)
        {
            // 模拟状态更新
            player.Health = Math.Min(100, player.Health + 1); // 缓慢恢复生命
        }
    }
    
    private async Task RenderFrameAsync()
    {
        // 模拟渲染操作
        await Task.Yield();
        // 实际渲染逻辑在这里
    }
    
    // 异步AI决策
    public async Task<AIAction> GetAIDecisionAsync(Enemy enemy, Player target)
    {
        Console.WriteLine($"AI计算决策: {enemy.Name} -> {target.Name}");
        
        // 模拟AI思考时间
        await Task.Delay(100);
        
        // 简单的AI逻辑
        if (Vector3.Distance(enemy.Position, target.Position) < 5.0f)
        {
            return new AIAction { Type = AIActionType.Attack, Target = target };
        }
        else if (enemy.Health < 30)
        {
            return new AIAction { Type = AIActionType.Retreat };
        }
        else
        {
            return new AIAction { Type = AIActionType.Move, TargetPosition = target.Position };
        }
    }
}

public class PlayerData
{
    public string Id { get; set; }
    public string Name { get; set; }
    public int Level { get; set; }
    public int Score { get; set; }
}

public class GameState
{
    public List<Player> Players { get; set; }
    public string CurrentLevel { get; set; }
    public DateTime GameTime { get; set; }
    public int Score { get; set; }
}

public class AIAction
{
    public AIActionType Type { get; set; }
    public Player Target { get; set; }
    public Vector3 TargetPosition { get; set; }
}

public enum AIActionType
{
    Attack,
    Move,
    Retreat,
    UseItem,
    CastSpell
}
```

---

## 反射 (Reflection)

### 反射基础

```csharp
using System;
using System.Reflection;
using System.Collections.Generic;
using System.Linq;

public class ReflectionDemo
{
    public static void BasicReflection()
    {
        Console.WriteLine("\n=== 反射基础演示 ===");
        
        // 获取类型信息
        Type playerType = typeof(Player);
        Console.WriteLine($"类型名称: {playerType.Name}");
        Console.WriteLine($"完整名称: {playerType.FullName}");
        Console.WriteLine($"命名空间: {playerType.Namespace}");
        
        // 获取属性信息
        PropertyInfo[] properties = playerType.GetProperties();
        Console.WriteLine("\n属性列表:");
        foreach (var prop in properties)
        {
            Console.WriteLine($"  {prop.Name}: {prop.PropertyType.Name} ({(prop.CanRead ? "R" : "")}{(prop.CanWrite ? "W" : "")})");
        }
        
        // 获取方法信息
        MethodInfo[] methods = playerType.GetMethods(BindingFlags.Public | BindingFlags.Instance)
            .Where(m => !m.IsSpecialName) // 过滤掉属性的get/set方法
            .ToArray();
        
        Console.WriteLine("\n方法列表:");
        foreach (var method in methods)
        {
            Console.WriteLine($"  {method.Name}({string.Join(", ", method.GetParameters().Select(p => $"{p.ParameterType.Name} {p.Name}"))})");
        }
        
        // 创建实例
        object playerInstance = Activator.CreateInstance(playerType);
        Player player = (Player)playerInstance;
        player.Name = "ReflectedPlayer";
        player.Level = 10;
        
        Console.WriteLine($"\n创建实例: {player.Name}, Level: {player.Level}");
    }
    
    public static void InvokeMethods()
    {
        Console.WriteLine("\n=== 方法调用演示 ===");
        
        Player player = new Player { Name = "TestPlayer", Level = 5 };
        Type playerType = typeof(Player);
        
        // 获取方法并调用
        MethodInfo levelUpMethod = playerType.GetMethod("LevelUp");
        if (levelUpMethod != null)
        {
            levelUpMethod.Invoke(player, null); // 调用无参数方法
            Console.WriteLine($"调用LevelUp后 - Level: {player.Level}");
        }
        
        // 调用有参数的方法
        MethodInfo takeDamageMethod = playerType.GetMethod("TakeDamage");
        if (takeDamageMethod != null)
        {
            takeDamageMethod.Invoke(player, new object[] { 20 }); // 调用有参数方法
            Console.WriteLine($"调用TakeDamage后 - Health: {player.Health}");
        }
    }
    
    public static void PropertyAccess()
    {
        Console.WriteLine("\n=== 属性访问演示 ===");
        
        Player player = new Player { Name = "PropertyPlayer", Level = 1 };
        Type playerType = typeof(Player);
        
        // 获取属性并读取/设置值
        PropertyInfo nameProperty = playerType.GetProperty("Name");
        PropertyInfo levelProperty = playerType.GetProperty("Level");
        
        // 读取值
        string currentName = (string)nameProperty.GetValue(player);
        int currentLevel = (int)levelProperty.GetValue(player);
        
        Console.WriteLine($"当前值 - Name: {currentName}, Level: {currentLevel}");
        
        // 设置值
        nameProperty.SetValue(player, "NewName");
        levelProperty.SetValue(player, 15);
        
        Console.WriteLine($"新值 - Name: {player.Name}, Level: {player.Level}");
    }
    
    public static void GenericReflection()
    {
        Console.WriteLine("\n=== 泛型反射演示 ===");
        
        // 创建泛型类型
        Type listType = typeof(List<>);
        Type stringListType = listType.MakeGenericType(typeof(string));
        
        // 创建泛型类型的实例
        object stringList = Activator.CreateInstance(stringListType);
        
        // 获取Add方法
        MethodInfo addMethod = stringListType.GetMethod("Add");
        addMethod.Invoke(stringList, new object[] { "Hello" });
        addMethod.Invoke(stringList, new object[] { "World" });
        
        // 获取Count属性
        PropertyInfo countProperty = stringListType.GetProperty("Count");
        int count = (int)countProperty.GetValue(stringList);
        
        Console.WriteLine($"List内容数量: {count}");
    }
}

// 扩展Player类以包含可反射的方法
public static class PlayerExtensions
{
    public static void LevelUp(this Player player)
    {
        player.Level++;
        player.Health = 100; // 升级时恢复生命
        Console.WriteLine($"{player.Name} 升级到 {player.Level} 级!");
    }
    
    public static void TakeDamage(this Player player, int damage)
    {
        player.Health = Math.Max(0, player.Health - damage);
        Console.WriteLine($"{player.Name} 受到 {damage} 点伤害，剩余生命: {player.Health}");
    }
}
```

### 反射在游戏开发中的应用

```csharp
public class GameReflectionSystem
{
    private Dictionary<string, Type> gameComponentTypes = new Dictionary<string, Type>();
    private List<object> activeComponents = new List<object>();
    
    public GameReflectionSystem()
    {
        // 自动扫描和注册游戏组件
        RegisterGameComponents();
    }
    
    private void RegisterGameComponents()
    {
        // 获取当前程序集中的所有类型
        var assembly = Assembly.GetExecutingAssembly();
        var types = assembly.GetTypes()
            .Where(t => t.Namespace?.StartsWith("Game") == true && 
                       t.GetCustomAttribute<GameComponentAttribute>() != null);
        
        foreach (var type in types)
        {
            var attr = type.GetCustomAttribute<GameComponentAttribute>();
            gameComponentTypes[attr.Name] = type;
            Console.WriteLine($"注册组件: {attr.Name} -> {type.Name}");
        }
    }
    
    public T CreateComponent<T>(string componentName) where T : class
    {
        if (gameComponentTypes.TryGetValue(componentName, out Type componentType))
        {
            if (typeof(T).IsAssignableFrom(componentType))
            {
                T instance = (T)Activator.CreateInstance(componentType);
                activeComponents.Add(instance);
                return instance;
            }
        }
        
        return null;
    }
    
    public object CreateComponent(string componentName)
    {
        if (gameComponentTypes.TryGetValue(componentName, out Type componentType))
        {
            object instance = Activator.CreateInstance(componentType);
            activeComponents.Add(instance);
            return instance;
        }
        
        return null;
    }
    
    public void InitializeAllComponents()
    {
        foreach (var component in activeComponents)
        {
            // 查找Initialize方法并调用
            Type type = component.GetType();
            MethodInfo initMethod = type.GetMethod("Initialize", 
                BindingFlags.Public | BindingFlags.Instance | BindingFlags.FlattenHierarchy);
            
            if (initMethod != null)
            {
                initMethod.Invoke(component, null);
            }
        }
    }
    
    public void UpdateAllComponents(float deltaTime)
    {
        foreach (var component in activeComponents)
        {
            Type type = component.GetType();
            MethodInfo updateMethod = type.GetMethod("Update", 
                BindingFlags.Public | BindingFlags.Instance | BindingFlags.FlattenHierarchy,
                null, new Type[] { typeof(float) }, null);
            
            if (updateMethod != null)
            {
                updateMethod.Invoke(component, new object[] { deltaTime });
            }
        }
    }
}

// 游戏组件特性
[AttributeUsage(AttributeTargets.Class)]
public class GameComponentAttribute : Attribute
{
    public string Name { get; }
    
    public GameComponentAttribute(string name)
    {
        Name = name;
    }
}

// 示例游戏组件
[GameComponent("PlayerController")]
public class PlayerController
{
    public string PlayerName { get; set; }
    public Vector3 Position { get; set; }
    
    public void Initialize()
    {
        Console.WriteLine("PlayerController 初始化");
        PlayerName = "DefaultPlayer";
    }
    
    public void Update(float deltaTime)
    {
        // 玩家控制更新逻辑
        Console.WriteLine($"PlayerController 更新 - DeltaTime: {deltaTime}");
    }
    
    public void Move(Vector3 direction)
    {
        Position += direction;
        Console.WriteLine($"玩家移动到: {Position}");
    }
}

[GameComponent("EnemyAI")]
public class EnemyAI
{
    public string EnemyType { get; set; }
    public int Health { get; set; } = 100;
    
    public void Initialize()
    {
        Console.WriteLine("EnemyAI 初始化");
        EnemyType = "BasicEnemy";
    }
    
    public void Update(float deltaTime)
    {
        // AI更新逻辑
        Console.WriteLine($"EnemyAI 更新 - Type: {EnemyType}");
    }
    
    public void Attack(object target)
    {
        Console.WriteLine($"{EnemyType} 攻击目标");
    }
}

// 配置加载器使用反射
public class ConfigLoader
{
    public T LoadConfig<T>(string configPath) where T : new()
    {
        T config = new T();
        
        // 从配置文件加载数据（这里简化为硬编码示例）
        Dictionary<string, object> configData = LoadConfigData(configPath);
        
        Type configType = typeof(T);
        PropertyInfo[] properties = configType.GetProperties();
        
        foreach (var property in properties)
        {
            if (configData.ContainsKey(property.Name))
            {
                object value = ConvertValue(configData[property.Name], property.PropertyType);
                property.SetValue(config, value);
            }
        }
        
        return config;
    }
    
    private Dictionary<string, object> LoadConfigData(string path)
    {
        // 模拟从文件加载配置数据
        return new Dictionary<string, object>
        {
            ["PlayerSpeed"] = 5.0f,
            ["JumpForce"] = 10.0f,
            ["MaxHealth"] = 100,
            ["EnableSound"] = true
        };
    }
    
    private object ConvertValue(object value, Type targetType)
    {
        if (value == null) return null;
        
        Type valueType = value.GetType();
        
        if (targetType.IsAssignableFrom(valueType))
        {
            return value;
        }
        
        // 尝试转换
        if (targetType.IsEnum)
        {
            return Enum.Parse(targetType, value.ToString());
        }
        
        return Convert.ChangeType(value, targetType);
    }
}

public class GameConfig
{
    public float PlayerSpeed { get; set; } = 1.0f;
    public float JumpForce { get; set; } = 5.0f;
    public int MaxHealth { get; set; } = 100;
    public bool EnableSound { get; set; } = true;
    public string GameTitle { get; set; } = "Default Game";
}
```

---

## 特性 (Attributes)

### 特性基础

```csharp
using System;
using System.Reflection;

// 自定义特性
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method | AttributeTargets.Property, 
                AllowMultiple = false, Inherited = true)]
public class GameEntityAttribute : Attribute
{
    public string Name { get; }
    public string Description { get; set; }
    public bool IsPersistent { get; set; }
    
    public GameEntityAttribute(string name)
    {
        Name = name;
    }
}

[AttributeUsage(AttributeTargets.Method)]
public class CommandAttribute : Attribute
{
    public string Name { get; }
    public string Description { get; set; }
    public string Usage { get; set; }
    
    public CommandAttribute(string name)
    {
        Name = name;
    }
}

[AttributeUsage(AttributeTargets.Property)]
public class ConfigPropertyAttribute : Attribute
{
    public string Category { get; }
    public string Description { get; set; }
    public bool IsRequired { get; set; }
    
    public ConfigPropertyAttribute(string category)
    {
        Category = category;
    }
}

// 使用特性的类
[GameEntity("PlayerCharacter", Description = "玩家角色实体", IsPersistent = true)]
public class AnnotatedPlayer
{
    [ConfigProperty("Gameplay", Description = "玩家移动速度", IsRequired = true)]
    public float MoveSpeed { get; set; } = 5.0f;
    
    [ConfigProperty("Gameplay", Description = "跳跃力度")]
    public float JumpForce { get; set; } = 10.0f;
    
    [Command("heal", Description = "治疗玩家", Usage = "/heal <amount>")]
    public void Heal(int amount)
    {
        Console.WriteLine($"Healing player by {amount} HP");
    }
    
    [Command("levelup", Description = "提升等级")]
    public void LevelUp()
    {
        Console.WriteLine("Leveling up player");
    }
}

public class AttributeDemo
{
    public static void DemonstrateAttributes()
    {
        Console.WriteLine("\n=== 特性演示 ===");
        
        Type playerType = typeof(AnnotatedPlayer);
        
        // 获取类上的特性
        var entityAttr = playerType.GetCustomAttribute<GameEntityAttribute>();
        if (entityAttr != null)
        {
            Console.WriteLine($"实体名称: {entityAttr.Name}");
            Console.WriteLine($"描述: {entityAttr.Description}");
            Console.WriteLine($"是否持久化: {entityAttr.IsPersistent}");
        }
        
        // 获取属性上的特性
        PropertyInfo[] properties = playerType.GetProperties();
        foreach (var prop in properties)
        {
            var configAttr = prop.GetCustomAttribute<ConfigPropertyAttribute>();
            if (configAttr != null)
            {
                Console.WriteLine($"\n属性: {prop.Name}");
                Console.WriteLine($"  分类: {configAttr.Category}");
                Console.WriteLine($"  描述: {configAttr.Description}");
                Console.WriteLine($"  必需: {configAttr.IsRequired}");
            }
        }
        
        // 获取方法上的特性
        MethodInfo[] methods = playerType.GetMethods();
        foreach (var method in methods)
        {
            var cmdAttr = method.GetCustomAttribute<CommandAttribute>();
            if (cmdAttr != null)
            {
                Console.WriteLine($"\n命令: {cmdAttr.Name}");
                Console.WriteLine($"  描述: {cmdAttr.Description}");
                Console.WriteLine($"  用法: {cmdAttr.Usage}");
            }
        }
    }
}
```

### 特性在游戏开发中的应用

```csharp
public class GameAttributeSystem
{
    // 游戏对象池特性
    [AttributeUsage(AttributeTargets.Class)]
    public class GameObjectPoolAttribute : Attribute
    {
        public int InitialSize { get; }
        public int MaxSize { get; }
        
        public GameObjectPoolAttribute(int initialSize = 10, int maxSize = 100)
        {
            InitialSize = initialSize;
            MaxSize = maxSize;
        }
    }
    
    // 序列化特性
    [AttributeUsage(AttributeTargets.Property | AttributeTargets.Field)]
    public class GameDataAttribute : Attribute
    {
        public string Key { get; }
        public bool IsEncrypted { get; set; }
        public bool IsCompressed { get; set; }
        
        public GameDataAttribute(string key)
        {
            Key = key;
        }
    }
    
    // 网络同步特性
    [AttributeUsage(AttributeTargets.Property)]
    public class NetworkSyncAttribute : Attribute
    {
        public float SyncInterval { get; set; } = 0.1f;
        public bool IsReliable { get; set; } = true;
        public SyncMode Mode { get; set; } = SyncMode.Both;
    }
    
    public enum SyncMode
    {
        ClientToServer,
        ServerToClient,
        Both
    }
    
    // 游戏对象示例
    [GameObjectPool(20, 200)]
    public class Bullet
    {
        [GameData("pos_x")]
        public float PositionX { get; set; }
        
        [GameData("pos_y")]
        public float PositionY { get; set; }
        
        [GameData("damage")]
        public int Damage { get; set; }
        
        [NetworkSync(SyncInterval = 0.05f, Mode = SyncMode.ServerToClient)]
        public float Speed { get; set; }
        
        public void Reset()
        {
            PositionX = 0;
            PositionY = 0;
            Damage = 10;
            Speed = 10f;
        }
    }
    
    // 配置验证器
    public static class ConfigValidator
    {
        public static List<string> ValidateConfig<T>(T config) where T : class
        {
            List<string> errors = new List<string>();
            Type configType = typeof(T);
            
            PropertyInfo[] properties = configType.GetProperties();
            foreach (var prop in properties)
            {
                var requiredAttr = prop.GetCustomAttribute<ConfigPropertyAttribute>();
                if (requiredAttr != null && requiredAttr.IsRequired)
                {
                    object value = prop.GetValue(config);
                    if (value == null || (value is string str && string.IsNullOrEmpty(str)))
                    {
                        errors.Add($"必需配置项 '{prop.Name}' 未设置");
                    }
                }
            }
            
            return errors;
        }
    }
    
    // 命令处理器
    public class CommandProcessor
    {
        private Dictionary<string, MethodInfo> commands = new Dictionary<string, MethodInfo>();
        
        public void RegisterCommands(object target)
        {
            Type type = target.GetType();
            MethodInfo[] methods = type.GetMethods();
            
            foreach (var method in methods)
            {
                var cmdAttr = method.GetCustomAttribute<CommandAttribute>();
                if (cmdAttr != null)
                {
                    commands[cmdAttr.Name.ToLower()] = method;
                    Console.WriteLine($"注册命令: /{cmdAttr.Name}");
                }
            }
        }
        
        public bool ExecuteCommand(object target, string command, params object[] args)
        {
            string cmdName = command.ToLower().TrimStart('/');
            if (commands.TryGetValue(cmdName, out MethodInfo method))
            {
                try
                {
                    method.Invoke(target, args);
                    return true;
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"命令执行错误: {ex.Message}");
                    return false;
                }
            }
            
            Console.WriteLine($"未知命令: /{command}");
            return false;
        }
    }
    
    // 使用示例
    public static void DemonstrateGameAttributes()
    {
        Console.WriteLine("\n=== 游戏特性应用演示 ===");
        
        // 验证配置
        var gameConfig = new GameConfig
        {
            PlayerSpeed = 5.0f,
            JumpForce = 10.0f,
            MaxHealth = 100
            // GameTitle未设置，但不是必需的
        };
        
        var validationErrors = ConfigValidator.ValidateConfig(gameConfig);
        if (validationErrors.Count > 0)
        {
            Console.WriteLine("配置验证错误:");
            validationErrors.ForEach(error => Console.WriteLine($"  {error}"));
        }
        else
        {
            Console.WriteLine("配置验证通过");
        }
        
        // 命令处理示例
        var player = new AnnotatedPlayer();
        var commandProcessor = new CommandProcessor();
        commandProcessor.RegisterCommands(player);
        
        Console.WriteLine("\n执行命令:");
        commandProcessor.ExecuteCommand(player, "heal", 50);
        commandProcessor.ExecuteCommand(player, "levelup");
        commandProcessor.ExecuteCommand(player, "invalidcommand", 100);
    }
}
```

---

## 内存管理

### 垃圾回收和内存优化

```csharp
using System;
using System.Collections.Generic;

public class MemoryManagement
{
    // 对象池模式 - 减少GC压力
    public class ObjectPool<T> where T : new()
    {
        private Stack<T> pool = new Stack<T>();
        private int maxPoolSize;
        
        public ObjectPool(int initialSize = 10, int maxPoolSize = 100)
        {
            this.maxPoolSize = maxPoolSize;
            for (int i = 0; i < initialSize; i++)
            {
                pool.Push(new T());
            }
        }
        
        public T GetObject()
        {
            if (pool.Count > 0)
            {
                return pool.Pop();
            }
            else
            {
                return new T(); // 如果池空了就创建新的
            }
        }
        
        public void ReturnObject(T obj)
        {
            if (pool.Count < maxPoolSize)
            {
                // 重置对象状态
                if (obj is IPoolable poolable)
                {
                    poolable.Reset();
                }
                pool.Push(obj);
            }
            // 否则丢弃对象，让GC处理
        }
        
        public int PoolSize => pool.Count;
    }
    
    // 可池化对象接口
    public interface IPoolable
    {
        void Reset();
    }
    
    // 示例可池化对象
    public class BulletObject : IPoolable
    {
        public Vector3 Position { get; set; }
        public Vector3 Velocity { get; set; }
        public int Damage { get; set; }
        public bool IsActive { get; set; }
        
        public void Reset()
        {
            Position = Vector3.zero;
            Velocity = Vector3.zero;
            Damage = 0;
            IsActive = false;
        }
    }
    
    // 内存监控
    public static class MemoryMonitor
    {
        public static void PrintMemoryInfo()
        {
            long usedMemory = GC.GetTotalMemory(false);
            int collectionCount0 = GC.CollectionCount(0);
            int collectionCount1 = GC.CollectionCount(1);
            int collectionCount2 = GC.CollectionCount(2);
            
            Console.WriteLine($"=== 内存信息 ===");
            Console.WriteLine($"已用内存: {usedMemory / 1024 / 1024:F2} MB");
            Console.WriteLine($"GC次数 (0/1/2): {collectionCount0}/{collectionCount1}/{collectionCount2}");
        }
        
        public static void ForceGC()
        {
            GC.Collect();
            GC.WaitForPendingFinalizers();
            Console.WriteLine("垃圾回收完成");
        }
    }
    
    // 值类型 vs 引用类型性能对比
    public static void ValueTypeVsReferenceType()
    {
        Console.WriteLine("\n=== 值类型 vs 引用类型性能 ===");
        
        // 值类型数组 - 在栈上分配，访问快
        var valueArray = new Vector3[10000];
        for (int i = 0; i < valueArray.Length; i++)
        {
            valueArray[i] = new Vector3(i, i, i);
        }
        
        // 引用类型列表 - 在堆上分配，有GC压力
        var referenceList = new List<GameObject>(10000);
        for (int i = 0; i < 10000; i++)
        {
            referenceList.Add(new GameObject { Position = new Vector3(i, i, i) });
        }
        
        Console.WriteLine($"值类型数组大小: {valueArray.Length}");
        Console.WriteLine($"引用类型列表大小: {referenceList.Count}");
    }
    
    // 避免装箱/拆箱
    public static void AvoidBoxing()
    {
        Console.WriteLine("\n=== 避免装箱/拆箱 ===");
        
        // ❌ 装箱 - 性能差
        // object boxedInt = 42;  // int装箱为object
        
        // ✅ 使用泛型避免装箱
        var intList = new List<int> { 1, 2, 3, 4, 5 };
        
        // ✅ 使用Span<T>进行高性能操作
        Span<int> span = stackalloc int[5] { 1, 2, 3, 4, 5 };
        foreach (var item in span)
        {
            Console.WriteLine(item);
        }
    }
}

public class GameObject
{
    public Vector3 Position { get; set; }
    public string Name { get; set; }
}
```

### 游戏中的内存管理实践

```csharp
public class GameMemoryManager
{
    private ObjectPool<BulletObject> bulletPool;
    private ObjectPool<ParticleEffect> particlePool;
    private List<IDisposable> disposableObjects = new List<IDisposable>();
    
    public GameMemoryManager()
    {
        bulletPool = new ObjectPool<BulletObject>(50, 500);
        particlePool = new ObjectPool<ParticleEffect>(20, 200);
    }
    
    public BulletObject GetBullet()
    {
        return bulletPool.GetObject();
    }
    
    public void ReturnBullet(BulletObject bullet)
    {
        bulletPool.ReturnObject(bullet);
    }
    
    public ParticleEffect GetParticleEffect()
    {
        return particlePool.GetObject();
    }
    
    public void ReturnParticleEffect(ParticleEffect effect)
    {
        particlePool.ReturnObject(effect);
    }
    
    public void RegisterDisposable(IDisposable disposable)
    {
        disposableObjects.Add(disposable);
    }
    
    public void Cleanup()
    {
        // 释放所有可释放的对象
        foreach (var disposable in disposableObjects)
        {
            disposable?.Dispose();
        }
        disposableObjects.Clear();
        
        // 清空对象池
        // 在对象池中，对象会被自动重用，不需要显式清理
    }
    
    // 内存使用分析
    public void AnalyzeMemoryUsage()
    {
        Console.WriteLine("\n=== 游戏内存分析 ===");
        Console.WriteLine($"子弹池大小: {bulletPool.PoolSize}");
        Console.WriteLine($"粒子池大小: {particlePool.PoolSize}");
        
        MemoryMonitor.PrintMemoryInfo();
    }
    
    // 内存压力测试
    public void StressTest()
    {
        Console.WriteLine("\n=== 内存压力测试 ===");
        
        var bullets = new List<BulletObject>();
        
        // 创建大量对象
        for (int i = 0; i < 1000; i++)
        {
            var bullet = GetBullet();
            bullet.Position = new Vector3(i, 0, 0);
            bullet.IsActive = true;
            bullets.Add(bullet);
        }
        
        Console.WriteLine($"创建了 {bullets.Count} 个子弹对象");
        MemoryMonitor.PrintMemoryInfo();
        
        // 回收对象
        foreach (var bullet in bullets)
        {
            ReturnBullet(bullet);
        }
        
        bullets.Clear();
        Console.WriteLine("对象已回收到池中");
        MemoryMonitor.PrintMemoryInfo();
    }
}

public class ParticleEffect : IPoolable
{
    public Vector3 Position { get; set; }
    public Vector3 Velocity { get; set; }
    public float Lifetime { get; set; }
    public bool IsActive { get; set; }
    
    public void Reset()
    {
        Position = Vector3.zero;
        Velocity = Vector3.zero;
        Lifetime = 0;
        IsActive = false;
    }
}
```

---

## 游戏开发中的应用

### 事件驱动的游戏架构

```csharp
public class EventDrivenGameSystem
{
    private GameEventManager eventManager;
    private Dictionary<Type, List<object>> systems = new Dictionary<Type, List<object>>();
    
    public EventDrivenGameSystem()
    {
        eventManager = new GameEventManager();
        InitializeSystems();
    }
    
    private void InitializeSystems()
    {
        // 创建各种游戏系统
        var inputSystem = new InputSystem(eventManager);
        var physicsSystem = new PhysicsSystem(eventManager);
        var renderSystem = new RenderingSystem(eventManager);
        var audioSystem = new AudioSystem(eventManager);
        
        // 注册系统
        RegisterSystem(inputSystem);
        RegisterSystem(physicsSystem);
        RegisterSystem(renderSystem);
        RegisterSystem(audioSystem);
    }
    
    private void RegisterSystem<T>(T system) where T : class
    {
        Type systemType = typeof(T);
        if (!systems.ContainsKey(systemType))
        {
            systems[systemType] = new List<object>();
        }
        systems[systemType].Add(system);
    }
    
    public T GetSystem<T>() where T : class
    {
        Type systemType = typeof(T);
        if (systems.TryGetValue(systemType, out List<object> systemList))
        {
            return systemList.OfType<T>().FirstOrDefault();
        }
        return null;
    }
    
    public void RunGameLoop()
    {
        Console.WriteLine("\n=== 事件驱动游戏循环 ===");
        
        // 模拟游戏事件
        var player = new Player { Name = "Hero", Health = 100 };
        
        // 触发各种游戏事件
        eventManager.TriggerPlayerSpawn(player);
        
        // 模拟玩家受伤
        eventManager.TriggerEvent(new GameEventManager.GameEvent(
            GameEventManager.GameEventType.PlayerDeath, player));
        
        // 模拟物品收集
        var potion = new Item { Name = "Health Potion" };
        eventManager.TriggerItemCollected(potion, player);
    }
}

// 输入系统
public class InputSystem
{
    private GameEventManager eventManager;
    
    public InputSystem(GameEventManager eventManager)
    {
        this.eventManager = eventManager;
        SubscribeToEvents();
    }
    
    private void SubscribeToEvents()
    {
        eventManager.Subscribe(GameEventManager.GameEventType.GameStart, OnGameStart);
    }
    
    private void OnGameStart(GameEventManager.GameEvent gameEvent)
    {
        Console.WriteLine("输入系统: 游戏开始，激活输入处理");
    }
    
    public void ProcessInput()
    {
        // 处理玩家输入
        Console.WriteLine("处理输入...");
    }
}

// 物理系统
public class PhysicsSystem
{
    private GameEventManager eventManager;
    
    public PhysicsSystem(GameEventManager eventManager)
    {
        this.eventManager = eventManager;
        SubscribeToEvents();
    }
    
    private void SubscribeToEvents()
    {
        eventManager.Subscribe(GameEventManager.GameEventType.PlayerSpawn, OnPlayerSpawn);
    }
    
    private void OnPlayerSpawn(GameEventManager.GameEvent gameEvent)
    {
        var playerEvent = gameEvent as GameEventManager.PlayerEvent;
        if (playerEvent != null)
        {
            Console.WriteLine($"物理系统: 为玩家 {playerEvent.Player.Name} 启用物理模拟");
        }
    }
    
    public void UpdatePhysics(float deltaTime)
    {
        // 更新物理模拟
        Console.WriteLine($"更新物理，Delta: {deltaTime}");
    }
}

// 渲染系统
public class RenderingSystem
{
    private GameEventManager eventManager;
    
    public RenderingSystem(GameEventManager eventManager)
    {
        this.eventManager = eventManager;
        SubscribeToEvents();
    }
    
    private void SubscribeToEvents()
    {
        eventManager.Subscribe(GameEventManager.GameEventType.PlayerDeath, OnPlayerDeath);
    }
    
    private void OnPlayerDeath(GameEventManager.GameEvent gameEvent)
    {
        Console.WriteLine("渲染系统: 播放死亡特效");
    }
    
    public void RenderFrame()
    {
        // 渲染帧
        Console.WriteLine("渲染帧...");
    }
}

// 音频系统
public class AudioSystem
{
    private GameEventManager eventManager;
    
    public AudioSystem(GameEventManager eventManager)
    {
        this.eventManager = eventManager;
        SubscribeToEvents();
    }
    
    private void SubscribeToEvents()
    {
        eventManager.Subscribe(GameEventManager.GameEventType.ItemCollected, OnItemCollected);
    }
    
    private void OnItemCollected(GameEventManager.GameEvent gameEvent)
    {
        Console.WriteLine("音频系统: 播放物品收集音效");
    }
    
    public void PlaySound(string soundName)
    {
        Console.WriteLine($"播放音效: {soundName}");
    }
}
```

### 配置和数据驱动系统

```csharp
public class DataDrivenGameSystem
{
    private Dictionary<string, GameEntityData> entityData = new Dictionary<string, GameEntityData>();
    private Dictionary<string, ItemData> itemData = new Dictionary<string, ItemData>();
    
    public void LoadGameData()
    {
        Console.WriteLine("\n=== 加载游戏数据 ===");
        
        // 模拟从配置文件加载数据
        LoadEntityData();
        LoadItemData();
    }
    
    private void LoadEntityData()
    {
        // 这里通常从JSON、XML或数据库加载
        entityData["Warrior"] = new GameEntityData
        {
            Name = "Warrior",
            Health = 150,
            Attack = 25,
            Defense = 15,
            Speed = 3.0f,
            Abilities = new List<string> { "Charge", "ShieldBash" }
        };
        
        entityData["Mage"] = new GameEntityData
        {
            Name = "Mage",
            Health = 80,
            Attack = 35,
            Defense = 5,
            Speed = 4.0f,
            Abilities = new List<string> { "Fireball", "Teleport" }
        };
        
        Console.WriteLine($"加载了 {entityData.Count} 个实体数据");
    }
    
    private void LoadItemData()
    {
        itemData["HealthPotion"] = new ItemData
        {
            Name = "Health Potion",
            Type = ItemType.Consumable,
            Value = 50,
            Effect = "Heal 50 HP",
            Weight = 0.5f
        };
        
        itemData["IronSword"] = new ItemData
        {
            Name = "Iron Sword",
            Type = ItemType.Weapon,
            Value = 200,
            Effect = "+10 Attack",
            Weight = 3.0f
        };
        
        Console.WriteLine($"加载了 {itemData.Count} 个物品数据");
    }
    
    public Player CreatePlayerFromData(string entityType)
    {
        if (entityData.TryGetValue(entityType, out GameEntityData data))
        {
            return new Player
            {
                Name = data.Name,
                Level = 1,
                Health = data.Health,
                // 可以根据数据创建更复杂的玩家对象
            };
        }
        
        return null;
    }
    
    public Item CreateItemFromData(string itemName)
    {
        if (itemData.TryGetValue(itemName, out ItemData data))
        {
            return new Item
            {
                Name = data.Name,
                Type = data.Type.ToString(),
                // 根据需要设置其他属性
            };
        }
        
        return null;
    }
    
    public void PrintGameData()
    {
        Console.WriteLine("\n=== 游戏数据概览 ===");
        
        Console.WriteLine("实体数据:");
        foreach (var entity in entityData.Values)
        {
            Console.WriteLine($"  {entity.Name}: HP={entity.Health}, ATK={entity.Attack}, DEF={entity.Defense}");
        }
        
        Console.WriteLine("\n物品数据:");
        foreach (var item in itemData.Values)
        {
            Console.WriteLine($"  {item.Name}: {item.Type}, Value={item.Value}, {item.Effect}");
        }
    }
}

public class GameEntityData
{
    public string Name { get; set; }
    public int Health { get; set; }
    public int Attack { get; set; }
    public int Defense { get; set; }
    public float Speed { get; set; }
    public List<string> Abilities { get; set; }
}

public class ItemData
{
    public string Name { get; set; }
    public ItemType Type { get; set; }
    public int Value { get; set; }
    public string Effect { get; set; }
    public float Weight { get; set; }
}

public enum ItemType
{
    Weapon,
    Armor,
    Consumable,
    Material,
    QuestItem
}
```

---

## 实践练习

### 练习1: 游戏命令系统

```csharp
public class GameCommandSystem
{
    private Dictionary<string, CommandInfo> commands = new Dictionary<string, CommandInfo>();
    private GameEventSystem eventSystem;
    
    public GameCommandSystem()
    {
        eventSystem = new GameEventSystem();
        RegisterDefaultCommands();
    }
    
    private void RegisterDefaultCommands()
    {
        RegisterCommand("help", "显示帮助信息", ShowHelp, 0);
        RegisterCommand("status", "显示玩家状态", ShowStatus, 0);
        RegisterCommand("teleport", "传送玩家", Teleport, 2, "x", "y");
        RegisterCommand("give", "给予物品", GiveItem, 2, "item", "quantity");
        RegisterCommand("level", "设置等级", SetLevel, 1, "level");
    }
    
    public void RegisterCommand(string name, string description, Action<string[]> execute, 
                               int paramCount, params string[] paramNames)
    {
        commands[name.ToLower()] = new CommandInfo
        {
            Name = name.ToLower(),
            Description = description,
            Execute = execute,
            ParameterCount = paramCount,
            ParameterNames = paramNames
        };
        
        Console.WriteLine($"注册命令: /{name}");
    }
    
    public bool ExecuteCommand(string input)
    {
        if (string.IsNullOrWhiteSpace(input) || !input.StartsWith("/"))
            return false;
        
        string[] parts = input.Substring(1).Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 0)
            return false;
        
        string commandName = parts[0].ToLower();
        string[] parameters = parts.Length > 1 ? parts[1..] : new string[0];
        
        if (commands.TryGetValue(commandName, out CommandInfo cmd))
        {
            if (parameters.Length != cmd.ParameterCount)
            {
                Console.WriteLine($"参数数量错误。用法: /{cmd.Name} {string.Join(" ", cmd.ParameterNames)}");
                return false;
            }
            
            try
            {
                cmd.Execute(parameters);
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"命令执行错误: {ex.Message}");
                return false;
            }
        }
        
        Console.WriteLine($"未知命令: /{commandName}");
        return false;
    }
    
    private void ShowHelp(string[] parameters)
    {
        Console.WriteLine("可用命令:");
        foreach (var cmd in commands.Values)
        {
            string usage = cmd.ParameterCount > 0 ? 
                $" {string.Join(" ", cmd.ParameterNames)}" : "";
            Console.WriteLine($"  /{cmd.Name}{usage} - {cmd.Description}");
        }
    }
    
    private void ShowStatus(string[] parameters)
    {
        Console.WriteLine("玩家状态:");
        Console.WriteLine("  等级: 1");
        Console.WriteLine("  生命值: 100/100");
        Console.WriteLine("  位置: (0, 0, 0)");
    }
    
    private void Teleport(string[] parameters)
    {
        if (float.TryParse(parameters[0], out float x) && float.TryParse(parameters[1], out float y))
        {
            Console.WriteLine($"传送至 ({x}, {y}, 0)");
            // 这里会实际更新玩家位置
        }
        else
        {
            Console.WriteLine("坐标必须是数字");
        }
    }
    
    private void GiveItem(string[] parameters)
    {
        string itemName = parameters[0];
        if (int.TryParse(parameters[1], out int quantity))
        {
            Console.WriteLine($"获得 {quantity} 个 {itemName}");
            // 这里会实际添加物品到玩家背包
        }
        else
        {
            Console.WriteLine("数量必须是整数");
        }
    }
    
    private void SetLevel(string[] parameters)
    {
        if (int.TryParse(parameters[0], out int level))
        {
            Console.WriteLine($"等级设置为 {level}");
            // 这里会实际更新玩家等级
        }
        else
        {
            Console.WriteLine("等级必须是整数");
        }
    }
    
    public void RunCommandLoop()
    {
        Console.WriteLine("\n=== 游戏命令系统 ===");
        Console.WriteLine("输入命令 (输入 /help 查看帮助，输入 'quit' 退出):");
        
        string input;
        while ((input = Console.ReadLine()) != "quit")
        {
            if (!string.IsNullOrEmpty(input))
            {
                ExecuteCommand(input);
            }
        }
    }
}

public class CommandInfo
{
    public string Name { get; set; }
    public string Description { get; set; }
    public Action<string[]> Execute { get; set; }
    public int ParameterCount { get; set; }
    public string[] ParameterNames { get; set; }
}
```

### 练习2: 游戏对象管理系统

```csharp
public class GameObjectManager
{
    private Dictionary<int, GameObject> gameObjects = new Dictionary<int, GameObject>();
    private Dictionary<Type, List<GameObject>> objectsByType = new Dictionary<Type, List<GameObject>>();
    private int nextId = 1;
    
    public int CreateObject<T>(T obj) where T : GameObject
    {
        int id = nextId++;
        obj.Id = id;
        obj.CreatedTime = DateTime.Now;
        
        gameObjects[id] = obj;
        
        Type type = typeof(T);
        if (!objectsByType.ContainsKey(type))
        {
            objectsByType[type] = new List<GameObject>();
        }
        objectsByType[type].Add(obj);
        
        Console.WriteLine($"创建对象: {type.Name}#{id}");
        return id;
    }
    
    public T GetObject<T>(int id) where T : GameObject
    {
        if (gameObjects.TryGetValue(id, out GameObject obj) && obj is T typedObj)
        {
            return typedObj;
        }
        return null;
    }
    
    public bool DestroyObject(int id)
    {
        if (gameObjects.TryGetValue(id, out GameObject obj))
        {
            Type type = obj.GetType();
            if (objectsByType.ContainsKey(type))
            {
                objectsByType[type].Remove(obj);
            }
            
            gameObjects.Remove(id);
            Console.WriteLine($"销毁对象: {obj.GetType().Name}#{id}");
            return true;
        }
        return false;
    }
    
    public List<T> GetObjectsByType<T>() where T : GameObject
    {
        Type type = typeof(T);
        if (objectsByType.TryGetValue(type, out List<GameObject> objects))
        {
            return objects.OfType<T>().ToList();
        }
        return new List<T>();
    }
    
    public List<GameObject> FindObjectsByName(string name)
    {
        return gameObjects.Values
            .Where(obj => obj.Name.Equals(name, StringComparison.OrdinalIgnoreCase))
            .ToList();
    }
    
    public void UpdateAll(float deltaTime)
    {
        foreach (var obj in gameObjects.Values)
        {
            obj.Update(deltaTime);
        }
    }
    
    public void PrintObjectStats()
    {
        Console.WriteLine("\n=== 游戏对象统计 ===");
        Console.WriteLine($"总对象数: {gameObjects.Count}");
        
        foreach (var kvp in objectsByType)
        {
            Console.WriteLine($"  {kvp.Key.Name}: {kvp.Value.Count}");
        }
    }
}

public class GameObject
{
    public int Id { get; set; }
    public string Name { get; set; }
    public Vector3 Position { get; set; }
    public DateTime CreatedTime { get; set; }
    
    public virtual void Update(float deltaTime)
    {
        // 基础更新逻辑
    }
    
    public virtual void OnAddedToGame()
    {
        Console.WriteLine($"{GetType().Name}#{Id} 已添加到游戏中");
    }
    
    public virtual void OnDestroy()
    {
        Console.WriteLine($"{GetType().Name}#{Id} 即将被销毁");
    }
}

public class PlayerObject : GameObject
{
    public int Level { get; set; } = 1;
    public int Health { get; set; } = 100;
    public int MaxHealth { get; set; } = 100;
    
    public override void Update(float deltaTime)
    {
        // 玩家特定更新逻辑
        Console.WriteLine($"更新玩家对象 {Id} - 位置: {Position}");
    }
}

public class EnemyObject : GameObject
{
    public int AttackPower { get; set; } = 10;
    public float DetectionRange { get; set; } = 10f;
    
    public override void Update(float deltaTime)
    {
        // 敌人AI更新逻辑
        Console.WriteLine($"更新敌人对象 {Id} - 攻击力: {AttackPower}");
    }
}
```

---

## 常见错误和最佳实践

### 1. 委托和事件的最佳实践

```csharp
public class DelegateBestPractices
{
    // ✅ 使用预定义委托类型
    public event Action<Player> OnPlayerJoined;
    public event Func<Player, bool> OnPlayerCanJoin;
    
    // ✅ 事件安全调用
    protected virtual void PlayerJoined(Player player)
    {
        OnPlayerJoined?.Invoke(player);
    }
    
    // ✅ 避免事件泄漏 - 在适当时机取消订阅
    public void Cleanup()
    {
        OnPlayerJoined = null; // 或者对具体订阅者使用 -=
    }
    
    // ✅ 使用EventHandler<T>模式
    public event EventHandler<PlayerEventArgs> PlayerEvent;
    
    protected virtual void OnPlayerEvent(PlayerEventArgs e)
    {
        PlayerEvent?.Invoke(this, e);
    }
}

public class PlayerEventArgs : EventArgs
{
    public Player Player { get; }
    public string Action { get; }
    
    public PlayerEventArgs(Player player, string action)
    {
        Player = player;
        Action = action;
    }
}
```

### 2. 异步编程最佳实践

```csharp
public class AsyncBestPractices
{
    // ✅ 使用CancellationToken支持取消
    public async Task<string> GetDataAsync(CancellationToken cancellationToken = default)
    {
        using var timeoutCts = new CancellationTokenSource(TimeSpan.FromSeconds(10));
        using var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken, timeoutCts.Token);
        
        // 模拟异步操作
        await Task.Delay(1000, linkedCts.Token);
        
        return "Data";
    }
    
    // ✅ 避免async void
    public async Task ProcessDataAsync()  // ✅ 正确
    {
        // 处理逻辑
    }
    
    // ❌ 错误: async void 应该只用于事件处理器
    // public async void ProcessDataAsync() { }
    
    // ✅ 正确处理异常
    public async Task<bool> SafeOperationAsync()
    {
        try
        {
            await Task.Delay(100);
            return true;
        }
        catch (OperationCanceledException)
        {
            // 特殊处理取消异常
            return false;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"操作失败: {ex.Message}");
            return false;
        }
    }
}
```

### 3. 内存管理最佳实践

```csharp
public class MemoryBestPractices : IDisposable
{
    private bool disposed = false;
    private List<IDisposable> disposables = new List<IDisposable>();
    
    // ✅ 实现IDisposable模式
    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }
    
    protected virtual void Dispose(bool disposing)
    {
        if (!disposed)
        {
            if (disposing)
            {
                // 释放托管资源
                foreach (var disposable in disposables)
                {
                    disposable?.Dispose();
                }
                disposables.Clear();
            }
            
            // 释放非托管资源
            disposed = true;
        }
    }
    
    // ✅ 使用对象池减少GC压力
    private ObjectPool<BulletObject> bulletPool = new ObjectPool<BulletObject>();
    
    public BulletObject GetBullet()
    {
        return bulletPool.GetObject();
    }
    
    public void ReturnBullet(BulletObject bullet)
    {
        bullet?.Reset();
        bulletPool.ReturnObject(bullet);
    }
    
    // ✅ 避免不必要的装箱
    public void AvoidBoxing()
    {
        // ✅ 使用泛型集合
        var numbers = new List<int> { 1, 2, 3, 4, 5 };
        
        // ✅ 使用Span<T>进行高性能操作
        Span<int> stackArray = stackalloc int[10];
        
        // ✅ 使用结构体而不是类(当适合时)
        var position = new Vector3(1, 2, 3); // 值类型，栈分配
    }
}
```

---

## 总结

本章我们深入学习了C#的高级特性:

✅ **委托**: 类型安全的函数指针,支持多播和事件系统  
✅ **事件**: 基于委托的发布-订阅模式  
✅ **Lambda表达式**: 简洁的匿名函数语法  
✅ **异步编程**: async/await模式,提高程序响应性  
✅ **反射**: 运行时类型检查和动态调用  
✅ **特性**: 声明性编程和元数据  
✅ **内存管理**: 垃圾回收、对象池、性能优化  

这些高级特性是构建复杂游戏系统的基础,特别是事件系统、异步资源加载、配置管理等方面。

---

## 下一步

继续学习 [06. Unity基础](06-unity-basics.md) →
