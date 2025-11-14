# 04. LINQ和集合框架

> C#集合框架和LINQ查询完全指南 - 游戏开发中的数据操作

---

## 📌 本章导航

- [集合框架概览](#集合框架概览)
- [常用集合类型](#常用集合类型)
- [LINQ查询语法](#linq查询语法)
- [LINQ方法语法](#linq方法语法)
- [游戏开发中的应用](#游戏开发中的应用)
- [性能优化技巧](#性能优化技巧)

---

## 集合框架概览

### 集合框架层次结构

C#的集合框架提供了丰富的数据结构,适用于不同的使用场景:

```csharp
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

// 集合框架主要接口
// IEnumerable<T> - 可枚举的集合
// ICollection<T> - 可计数、添加、删除的集合
// IList<T> - 可索引访问的列表
// IDictionary<TKey, TValue> - 键值对集合

// 主要集合类型对比
public class CollectionOverview
{
    public static void CompareCollections()
    {
        // List<T> - 动态数组,适合频繁随机访问
        List<int> numbers = new List<int> { 1, 2, 3, 4, 5 };
        
        // Dictionary<TKey, TValue> - 键值对,适合快速查找
        Dictionary<string, int> scores = new Dictionary<string, int>
        {
            {"Player1", 100},
            {"Player2", 85},
            {"Player3", 92}
        };
        
        // HashSet<T> - 无重复元素,适合成员检查
        HashSet<string> uniqueItems = new HashSet<string> { "Sword", "Shield", "Potion" };
        
        // Queue<T> - 先进先出
        Queue<string> gameMessages = new Queue<string>();
        gameMessages.Enqueue("Game started");
        gameMessages.Enqueue("Player joined");
        
        // Stack<T> - 后进先出
        Stack<GameState> gameStates = new Stack<GameState>();
        gameStates.Push(GameState.Menu);
        gameStates.Push(GameState.Playing);
        
        // LinkedList<T> - 双向链表,适合频繁插入删除
        LinkedList<int> linkedList = new LinkedList<int>();
        
        Console.WriteLine("集合类型对比:");
        Console.WriteLine($"List: 适合随机访问, O(1) 索引访问");
        Console.WriteLine($"Dictionary: 适合键值查找, O(1) 平均查找");
        Console.WriteLine($"HashSet: 适合唯一性检查, O(1) 查找");
        Console.WriteLine($"Queue: 适合任务队列, O(1) 入队出队");
        Console.WriteLine($"Stack: 适合状态管理, O(1) 入栈出栈");
    }
}
```

### 集合选择指南

| 场景 | 推荐集合 | 原因 |
|------|----------|------|
| 频繁随机访问 | List<T> | O(1) 索引访问 |
| 快速查找 | Dictionary<TKey, TValue> | O(1) 平均查找时间 |
| 唯一性约束 | HashSet<T> | 自动去重,快速成员检查 |
| 任务队列 | Queue<T> | FIFO顺序处理 |
| 状态管理 | Stack<T> | LIFO状态回退 |
| 频繁插入/删除 | LinkedList<T> | O(1) 中间插入删除 |

---

## 常用集合类型

### List<T> - 动态数组

```csharp
using System;
using System.Collections.Generic;

public class ListDemo
{
    public static void DemonstrateList()
    {
        // 创建和初始化
        List<int> numbers = new List<int>();
        List<string> names = new List<string> { "Alice", "Bob", "Charlie" };
        List<Player> players = new List<Player>(10);  // 预设容量
        
        // 添加元素
        numbers.Add(10);
        numbers.AddRange(new[] { 20, 30, 40 });
        
        // 访问元素
        Console.WriteLine($"第一个元素: {numbers[0]}");
        Console.WriteLine($"最后一个元素: {numbers.Last()}");  // 需要using System.Linq
        
        // 查找元素
        int index = numbers.IndexOf(20);
        bool contains = numbers.Contains(30);
        
        // 插入和删除
        numbers.Insert(1, 15);  // 在索引1处插入
        numbers.RemoveAt(0);    // 删除索引0的元素
        numbers.Remove(30);     // 删除值为30的元素
        
        // 排序
        numbers.Sort();
        numbers.Reverse();
        
        // 转换为数组
        int[] array = numbers.ToArray();
        
        // 遍历
        foreach (int num in numbers)
        {
            Console.WriteLine(num);
        }
        
        // 使用索引遍历
        for (int i = 0; i < numbers.Count; i++)
        {
            Console.WriteLine($"[{i}]: {numbers[i]}");
        }
    }
}

// 游戏中的玩家列表示例
public class PlayerManager
{
    private List<Player> players = new List<Player>();
    
    public void AddPlayer(Player player)
    {
        players.Add(player);
    }
    
    public Player FindPlayerByName(string name)
    {
        return players.FirstOrDefault(p => p.Name.Equals(name, StringComparison.OrdinalIgnoreCase));
    }
    
    public List<Player> GetPlayersByLevel(int minLevel)
    {
        return players.Where(p => p.Level >= minLevel).ToList();
    }
    
    public void RemoveInactivePlayers(TimeSpan maxInactivity)
    {
        players.RemoveAll(p => DateTime.Now - p.LastActivity > maxInactivity);
    }
    
    public int GetTotalScore()
    {
        return players.Sum(p => p.Score);
    }
}
```

### Dictionary<TKey, TValue> - 键值对集合

```csharp
using System;
using System.Collections.Generic;
using System.Linq;

public class DictionaryDemo
{
    public static void DemonstrateDictionary()
    {
        // 创建和初始化
        Dictionary<string, int> scores = new Dictionary<string, int>();
        Dictionary<int, Player> playerLookup = new Dictionary<int, Player>
        {
            { 1, new Player("Player1") },
            { 2, new Player("Player2") }
        };
        
        // 添加/更新
        scores["Alice"] = 100;
        scores["Bob"] = 85;
        scores["Charlie"] = 92;
        
        // 安全添加 (避免键重复异常)
        if (!scores.ContainsKey("Alice"))
        {
            scores.Add("Alice", 100);
        }
        
        // 安全更新
        scores["Alice"] = 105;  // 直接赋值会更新
        scores["Alice"] += 10;  // 复合赋值
        
        // 访问元素
        if (scores.TryGetValue("Alice", out int aliceScore))
        {
            Console.WriteLine($"Alice's score: {aliceScore}");
        }
        
        // 检查键存在
        bool hasAlice = scores.ContainsKey("Alice");
        bool hasDavid = scores.ContainsKey("David");
        
        // 遍历
        foreach (var kvp in scores)
        {
            Console.WriteLine($"{kvp.Key}: {kvp.Value}");
        }
        
        // 遍历键和值
        foreach (string name in scores.Keys)
        {
            Console.WriteLine($"Player: {name}");
        }
        
        foreach (int score in scores.Values)
        {
            Console.WriteLine($"Score: {score}");
        }
        
        // 删除
        scores.Remove("Bob");
        scores.Clear();
    }
}

// 游戏配置管理示例
public class GameConfigManager
{
    private Dictionary<string, object> config = new Dictionary<string, object>();
    
    public void SetConfig<T>(string key, T value)
    {
        config[key] = value;
    }
    
    public T GetConfig<T>(string key, T defaultValue = default(T))
    {
        if (config.TryGetValue(key, out object value))
        {
            if (value is T result)
            {
                return result;
            }
            
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
    
    public bool HasConfig(string key)
    {
        return config.ContainsKey(key);
    }
    
    // 批量设置配置
    public void SetConfigs(Dictionary<string, object> newConfigs)
    {
        foreach (var kvp in newConfigs)
        {
            config[kvp.Key] = kvp.Value;
        }
    }
    
    // 获取所有配置
    public Dictionary<string, T> GetConfigsOfType<T>()
    {
        return config
            .Where(kvp => kvp.Value is T)
            .ToDictionary(kvp => kvp.Key, kvp => (T)kvp.Value);
    }
}

// 使用示例
public class ConfigUsage
{
    public static void Example()
    {
        GameConfigManager config = new GameConfigManager();
        
        // 设置配置
        config.SetConfig("MaxPlayers", 10);
        config.SetConfig("GameMode", "Deathmatch");
        config.SetConfig("TimeLimit", 1800);  // 30分钟
        config.SetConfig("EnablePowerUps", true);
        
        // 获取配置
        int maxPlayers = config.GetConfig("MaxPlayers", 8);
        string gameMode = config.GetConfig("GameMode", "Default");
        bool powerUpsEnabled = config.GetConfig("EnablePowerUps", false);
        
        Console.WriteLine($"Max players: {maxPlayers}");
        Console.WriteLine($"Game mode: {gameMode}");
        Console.WriteLine($"Power-ups: {(powerUpsEnabled ? "Enabled" : "Disabled")}");
    }
}
```

### HashSet<T> - 集合操作

```csharp
using System;
using System.Collections.Generic;
using System.Linq;

public class HashSetDemo
{
    public static void DemonstrateHashSet()
    {
        // 创建和初始化
        HashSet<string> uniqueItems = new HashSet<string>();
        HashSet<int> numbers = new HashSet<int> { 1, 2, 3, 4, 5 };
        
        // 添加元素 (自动去重)
        uniqueItems.Add("Sword");
        uniqueItems.Add("Shield");
        uniqueItems.Add("Sword");  // 重复元素,不会添加
        uniqueItems.Add("Potion");
        
        Console.WriteLine($"Unique items count: {uniqueItems.Count}");
        
        // 检查成员
        bool hasSword = uniqueItems.Contains("Sword");
        bool hasBow = uniqueItems.Contains("Bow");
        
        // 集合操作
        HashSet<int> set1 = new HashSet<int> { 1, 2, 3, 4 };
        HashSet<int> set2 = new HashSet<int> { 3, 4, 5, 6 };
        
        // 并集
        HashSet<int> union = new HashSet<int>(set1);
        union.UnionWith(set2);
        Console.WriteLine($"Union: [{string.Join(", ", union)}]");
        
        // 交集
        HashSet<int> intersection = new HashSet<int>(set1);
        intersection.IntersectWith(set2);
        Console.WriteLine($"Intersection: [{string.Join(", ", intersection)}]");
        
        // 差集
        HashSet<int> difference = new HashSet<int>(set1);
        difference.ExceptWith(set2);
        Console.WriteLine($"Difference (set1 - set2): [{string.Join(", ", difference)}]");
        
        // 对称差集 (XOR)
        HashSet<int> symmetricDiff = new HashSet<int>(set1);
        symmetricDiff.SymmetricExceptWith(set2);
        Console.WriteLine($"Symmetric difference: [{string.Join(", ", symmetricDiff)}]");
        
        // 遍历
        foreach (string item in uniqueItems)
        {
            Console.WriteLine(item);
        }
    }
}

// 游戏物品管理示例
public class InventoryManager
{
    private HashSet<string> uniqueItems = new HashSet<string>();
    private Dictionary<string, int> stackableItems = new Dictionary<string, int>();
    private const int MAX_STACK_SIZE = 99;
    
    public bool AddItem(string itemName, int quantity = 1)
    {
        if (IsUniqueItem(itemName))
        {
            // 独特物品,只能有一个
            if (uniqueItems.Contains(itemName))
            {
                return false; // 已存在
            }
            uniqueItems.Add(itemName);
            return true;
        }
        else
        {
            // 可堆叠物品
            if (stackableItems.ContainsKey(itemName))
            {
                stackableItems[itemName] = Math.Min(
                    stackableItems[itemName] + quantity, 
                    MAX_STACK_SIZE
                );
            }
            else
            {
                stackableItems[itemName] = Math.Min(quantity, MAX_STACK_SIZE);
            }
            return true;
        }
    }
    
    public bool RemoveItem(string itemName, int quantity = 1)
    {
        if (uniqueItems.Contains(itemName))
        {
            return uniqueItems.Remove(itemName);
        }
        else if (stackableItems.TryGetValue(itemName, out int currentQuantity))
        {
            int newQuantity = currentQuantity - quantity;
            if (newQuantity <= 0)
            {
                return stackableItems.Remove(itemName);
            }
            else
            {
                stackableItems[itemName] = newQuantity;
                return true;
            }
        }
        return false;
    }
    
    public bool HasItem(string itemName)
    {
        return uniqueItems.Contains(itemName) || stackableItems.ContainsKey(itemName);
    }
    
    public int GetItemCount(string itemName)
    {
        if (uniqueItems.Contains(itemName))
            return 1;
        else if (stackableItems.TryGetValue(itemName, out int count))
            return count;
        else
            return 0;
    }
    
    private bool IsUniqueItem(string itemName)
    {
        // 根据物品名称或类型判断是否为独特物品
        // 这里简化为以"Unique"开头的物品为独特物品
        return itemName.StartsWith("Unique");
    }
    
    public List<string> GetAllItems()
    {
        var allItems = new List<string>(uniqueItems);
        allItems.AddRange(stackableItems.Where(kvp => kvp.Value > 0).Select(kvp => kvp.Key));
        return allItems;
    }
}
```

### Queue<T> 和 Stack<T> - 有序集合

```csharp
using System;
using System.Collections.Generic;

public class QueueStackDemo
{
    public static void DemonstrateQueue()
    {
        // 队列 - 先进先出 (FIFO)
        Queue<string> messageQueue = new Queue<string>();
        
        // 入队
        messageQueue.Enqueue("Message 1");
        messageQueue.Enqueue("Message 2");
        messageQueue.Enqueue("Message 3");
        
        Console.WriteLine($"队列大小: {messageQueue.Count}");
        Console.WriteLine($"下一个消息: {messageQueue.Peek()}");  // 查看但不移除
        
        // 出队
        while (messageQueue.Count > 0)
        {
            string message = messageQueue.Dequeue();
            Console.WriteLine($"处理消息: {message}");
        }
    }
    
    public static void DemonstrateStack()
    {
        // 栈 - 后进先出 (LIFO)
        Stack<GameAction> actionStack = new Stack<GameAction>();
        
        // 入栈
        actionStack.Push(new GameAction("Move", new Vector3(1, 0, 0)));
        actionStack.Push(new GameAction("Jump", null));
        actionStack.Push(new GameAction("Attack", new Weapon()));
        
        Console.WriteLine($"栈大小: {actionStack.Count}");
        Console.WriteLine($"最近操作: {actionStack.Peek().Type}");  // 查看但不移除
        
        // 出栈 (撤销操作)
        while (actionStack.Count > 0)
        {
            GameAction action = actionStack.Pop();
            Console.WriteLine($"撤销操作: {action.Type}");
        }
    }
}

// 游戏事件系统示例
public class GameEventManager
{
    private Queue<GameEvent> eventQueue = new Queue<GameEvent>();
    private Stack<GameEvent> eventHistory = new Stack<GameEvent>();
    private const int MAX_HISTORY = 50;
    
    public void QueueEvent(GameEvent gameEvent)
    {
        eventQueue.Enqueue(gameEvent);
    }
    
    public void ProcessEvents()
    {
        while (eventQueue.Count > 0)
        {
            GameEvent gameEvent = eventQueue.Dequeue();
            ProcessEvent(gameEvent);
            
            // 保存到历史记录
            eventHistory.Push(gameEvent);
            if (eventHistory.Count > MAX_HISTORY)
            {
                eventHistory = new Stack<GameEvent>(eventHistory.Take(MAX_HISTORY));
            }
        }
    }
    
    private void ProcessEvent(GameEvent gameEvent)
    {
        // 处理游戏事件
        switch (gameEvent.Type)
        {
            case EventType.PlayerMove:
                HandlePlayerMove(gameEvent);
                break;
            case EventType.PlayerAttack:
                HandlePlayerAttack(gameEvent);
                break;
            case EventType.EnemySpawn:
                HandleEnemySpawn(gameEvent);
                break;
        }
    }
    
    public void UndoLastEvent()
    {
        if (eventHistory.Count > 0)
        {
            GameEvent lastEvent = eventHistory.Pop();
            ReverseEvent(lastEvent);
        }
    }
    
    private void ReverseEvent(GameEvent gameEvent)
    {
        // 反转事件效果
        Console.WriteLine($"撤销事件: {gameEvent.Type}");
    }
    
    private void HandlePlayerMove(GameEvent gameEvent)
    {
        Console.WriteLine("处理玩家移动事件");
    }
    
    private void HandlePlayerAttack(GameEvent gameEvent)
    {
        Console.WriteLine("处理玩家攻击事件");
    }
    
    private void HandleEnemySpawn(GameEvent gameEvent)
    {
        Console.WriteLine("处理敌人生成事件");
    }
}

public class GameEvent
{
    public EventType Type { get; set; }
    public object Data { get; set; }
    public DateTime Timestamp { get; set; }
    
    public GameEvent(EventType type, object data)
    {
        Type = type;
        Data = data;
        Timestamp = DateTime.Now;
    }
}

public enum EventType
{
    PlayerMove,
    PlayerAttack,
    EnemySpawn,
    ItemPickup,
    PlayerDeath
}

public class GameAction
{
    public string Type { get; set; }
    public object Data { get; set; }
    
    public GameAction(string type, object data)
    {
        Type = type;
        Data = data;
    }
}
```

---

## LINQ查询语法

### 查询语法基础

```csharp
using System;
using System.Collections.Generic;
using System.Linq;

public class LinqQuerySyntax
{
    public static void DemonstrateQuerySyntax()
    {
        List<Player> players = new List<Player>
        {
            new Player { Name = "Alice", Level = 15, Score = 2500, Class = "Warrior" },
            new Player { Name = "Bob", Level = 8, Score = 1200, Class = "Mage" },
            new Player { Name = "Charlie", Level = 22, Score = 3800, Class = "Archer" },
            new Player { Name = "Diana", Level = 18, Score = 3100, Class = "Warrior" },
            new Player { Name = "Eve", Level = 5, Score = 800, Class = "Mage" }
        };
        
        // 基本查询 - 找出等级大于10的玩家
        var highLevelPlayers = from p in players
                              where p.Level > 10
                              select p;
        
        Console.WriteLine("等级大于10的玩家:");
        foreach (var player in highLevelPlayers)
        {
            Console.WriteLine($"  {player.Name} - Level {player.Level}");
        }
        
        // 多条件查询
        var warriorHighScorers = from p in players
                                where p.Class == "Warrior" && p.Score > 2000
                                select new { p.Name, p.Score, p.Level };
        
        Console.WriteLine("\n高分战士玩家:");
        foreach (var player in warriorHighScorers)
        {
            Console.WriteLine($"  {player.Name} - Score: {player.Score}, Level: {player.Level}");
        }
        
        // 排序查询
        var topPlayers = from p in players
                        orderby p.Score descending, p.Level descending
                        select p;
        
        Console.WriteLine("\n按分数排序的玩家:");
        foreach (var player in topPlayers.Take(3))
        {
            Console.WriteLine($"  {player.Name} - Score: {player.Score}");
        }
        
        // 投影查询 (选择特定字段)
        var playerStats = from p in players
                         where p.Level >= 10
                         select new
                         {
                             Name = p.Name,
                             PowerLevel = p.Level * 10 + p.Score / 100
                         };
        
        Console.WriteLine("\n玩家实力评级:");
        foreach (var stat in playerStats)
        {
            Console.WriteLine($"  {stat.Name}: {stat.PowerLevel}");
        }
        
        // 分组查询
        var playersByClass = from p in players
                            group p by p.Class into g
                            select new { Class = g.Key, Count = g.Count(), AverageLevel = g.Average(p => p.Level) };
        
        Console.WriteLine("\n按职业分组:");
        foreach (var group in playersByClass)
        {
            Console.WriteLine($"  {group.Class}: {group.Count}人, 平均等级 {group.AverageLevel:F1}");
        }
    }
}
```

### 复杂查询语法

```csharp
public class ComplexLinqQueries
{
    public static void DemonstrateComplexQueries()
    {
        // 模拟游戏数据
        var players = new List<Player>
        {
            new Player { Name = "Alice", Level = 15, Score = 2500, Class = "Warrior", Guild = "Lions" },
            new Player { Name = "Bob", Level = 8, Score = 1200, Class = "Mage", Guild = "Wolves" },
            new Player { Name = "Charlie", Level = 22, Score = 3800, Class = "Archer", Guild = "Lions" },
            new Player { Name = "Diana", Level = 18, Score = 3100, Class = "Warrior", Guild = "Eagles" },
            new Player { Name = "Eve", Level = 5, Score = 800, Class = "Mage", Guild = "Wolves" }
        };
        
        var items = new List<Item>
        {
            new Item { Name = "Sword", Type = "Weapon", Value = 100, Owner = "Alice" },
            new Item { Name = "Shield", Type = "Armor", Value = 80, Owner = "Alice" },
            new Item { Name = "Staff", Type = "Weapon", Value = 120, Owner = "Bob" },
            new Item { Name = "Bow", Type = "Weapon", Value = 150, Owner = "Charlie" },
            new Item { Name = "Potion", Type = "Consumable", Value = 20, Owner = "Diana" }
        };
        
        // JOIN查询 - 玩家和物品
        var playerItems = from p in players
                         join i in items on p.Name equals i.Owner
                         select new { Player = p.Name, Item = i.Name, ItemType = i.Type };
        
        Console.WriteLine("玩家物品列表:");
        foreach (var result in playerItems)
        {
            Console.WriteLine($"  {result.Player} 拥有 {result.Item} ({result.ItemType})");
        }
        
        // 嵌套查询
        var richPlayers = from p in players
                         where (from i in items where i.Owner == p.Name select i.Value).Sum() > 150
                         select p;
        
        Console.WriteLine("\n拥有贵重物品的玩家:");
        foreach (var player in richPlayers)
        {
            Console.WriteLine($"  {player.Name}");
        }
        
        // let子句 - 创建临时变量
        var playerWealth = from p in players
                          let totalItemValue = (from i in items where i.Owner == p.Name select i.Value).Sum()
                          let wealthLevel = totalItemValue > 100 ? "Rich" : totalItemValue > 50 ? "Medium" : "Poor"
                          select new { p.Name, TotalValue = totalItemValue, WealthLevel = wealthLevel };
        
        Console.WriteLine("\n玩家财富等级:");
        foreach (var player in playerWealth)
        {
            Console.WriteLine($"  {player.Name}: {player.TotalValue} ({player.WealthLevel})");
        }
        
        // 量词操作
        bool allHighLevel = players.All(p => p.Level >= 5);  // 所有玩家等级都>=5
        bool anyHighScorer = players.Any(p => p.Score > 3000);  // 是否有高分玩家
        
        Console.WriteLine($"\n所有玩家等级>=5: {allHighLevel}");
        Console.WriteLine($"有高分玩家(>3000): {anyHighScorer}");
    }
}

public class Player
{
    public string Name { get; set; }
    public int Level { get; set; }
    public int Score { get; set; }
    public string Class { get; set; }
    public string Guild { get; set; }
    public DateTime LastLogin { get; set; } = DateTime.Now;
}

public class Item
{
    public string Name { get; set; }
    public string Type { get; set; }
    public int Value { get; set; }
    public string Owner { get; set; }
}
```

---

## LINQ方法语法

### 基础方法操作

```csharp
using System;
using System.Collections.Generic;
using System.Linq;

public class LinqMethodSyntax
{
    public static void DemonstrateMethodSyntax()
    {
        List<Player> players = new List<Player>
        {
            new Player { Name = "Alice", Level = 15, Score = 2500, Class = "Warrior" },
            new Player { Name = "Bob", Level = 8, Score = 1200, Class = "Mage" },
            new Player { Name = "Charlie", Level = 22, Score = 3800, Class = "Archer" },
            new Player { Name = "Diana", Level = 18, Score = 3100, Class = "Warrior" },
            new Player { Name = "Eve", Level = 5, Score = 800, Class = "Mage" }
        };
        
        // Where - 过滤
        var highLevelPlayers = players.Where(p => p.Level > 10);
        Console.WriteLine("等级大于10的玩家:");
        highLevelPlayers.ToList().ForEach(p => Console.WriteLine($"  {p.Name}"));
        
        // Select - 投影
        var playerNames = players.Select(p => p.Name);
        Console.WriteLine($"\n所有玩家名字: [{string.Join(", ", playerNames)}]");
        
        // SelectMany - 扁平化
        var nameLengths = players.SelectMany(p => p.Name.ToCharArray()).Count();
        Console.WriteLine($"所有玩家名字字符总数: {nameLengths}");
        
        // OrderBy/ThenBy - 排序
        var sortedPlayers = players
            .OrderByDescending(p => p.Score)
            .ThenByDescending(p => p.Level);
        
        Console.WriteLine("\n按分数和等级排序:");
        sortedPlayers.ToList().ForEach(p => Console.WriteLine($"  {p.Name}: {p.Score}"));
        
        // Take/Skip - 分页
        var top3 = players.OrderByDescending(p => p.Score).Take(3);
        var afterTop3 = players.OrderByDescending(p => p.Score).Skip(3);
        
        Console.WriteLine("\n前三名:");
        top3.ToList().ForEach(p => Console.WriteLine($"  {p.Name}: {p.Score}"));
    }
    
    public static void DemonstrateAggregation()
    {
        List<Player> players = new List<Player>
        {
            new Player { Name = "Alice", Level = 15, Score = 2500 },
            new Player { Name = "Bob", Level = 8, Score = 1200 },
            new Player { Name = "Charlie", Level = 22, Score = 3800 },
            new Player { Name = "Diana", Level = 18, Score = 3100 },
            new Player { Name = "Eve", Level = 5, Score = 800 }
        };
        
        // 聚合操作
        Console.WriteLine($"玩家总数: {players.Count()}");
        Console.WriteLine($"平均等级: {players.Average(p => p.Level):F2}");
        Console.WriteLine($"最高等级: {players.Max(p => p.Level)}");
        Console.WriteLine($"总分数: {players.Sum(p => p.Score)}");
        Console.WriteLine($"最高分数: {players.Max(p => p.Score)}");
        
        // 条件聚合
        var avgHighLevelScore = players
            .Where(p => p.Level >= 10)
            .Average(p => p.Score);
        Console.WriteLine($"高等级玩家平均分数: {avgHighLevelScore:F2}");
        
        // 元素操作
        var firstHighScorer = players.FirstOrDefault(p => p.Score > 3000);
        Console.WriteLine($"第一个高分玩家: {firstHighScorer?.Name ?? "无"}");
        
        var lastPlayer = players.LastOrDefault();
        Console.WriteLine($"最后加入的玩家: {lastPlayer?.Name ?? "无"}");
        
        var playerAt3 = players.ElementAtOrDefault(2);  // 索引从0开始
        Console.WriteLine($"第三个玩家: {playerAt3?.Name ?? "无"}");
    }
}
```

### 高级方法操作

```csharp
public class AdvancedLinqMethods
{
    public static void DemonstrateAdvancedMethods()
    {
        List<Player> players = new List<Player>
        {
            new Player { Name = "Alice", Level = 15, Score = 2500, Class = "Warrior", Guild = "Lions" },
            new Player { Name = "Bob", Level = 8, Score = 1200, Class = "Mage", Guild = "Wolves" },
            new Player { Name = "Charlie", Level = 22, Score = 3800, Class = "Archer", Guild = "Lions" },
            new Player { Name = "Diana", Level = 18, Score = 3100, Class = "Warrior", Guild = "Eagles" },
            new Player { Name = "Eve", Level = 5, Score = 800, Class = "Mage", Guild = "Wolves" }
        };
        
        // GroupBy - 分组
        var playersByClass = players.GroupBy(p => p.Class);
        Console.WriteLine("按职业分组:");
        foreach (var group in playersByClass)
        {
            Console.WriteLine($"  {group.Key}: {string.Join(", ", group.Select(p => p.Name))}");
        }
        
        // ToDictionary - 转换为字典
        var playerDict = players.ToDictionary(p => p.Name, p => p.Score);
        Console.WriteLine($"\n玩家分数字典 - Alice: {playerDict["Alice"]}");
        
        // ToLookup - 创建查找表 (与GroupBy类似,但立即执行)
        var playersByGuild = players.ToLookup(p => p.Guild);
        Console.WriteLine("\n按公会分组:");
        foreach (var guild in playersByGuild)
        {
            Console.WriteLine($"  {guild.Key}: {string.Join(", ", guild.Select(p => p.Name))}");
        }
        
        // Join - 连接操作
        var items = new List<Item>
        {
            new Item { Name = "Sword", Type = "Weapon", Value = 100, Owner = "Alice" },
            new Item { Name = "Staff", Type = "Weapon", Value = 120, Owner = "Bob" },
            new Item { Name = "Bow", Type = "Weapon", Value = 150, Owner = "Charlie" }
        };
        
        var playerItems = players
            .Join(items, 
                  player => player.Name, 
                  item => item.Owner, 
                  (player, item) => new { Player = player.Name, Item = item.Name, Value = item.Value })
            .ToList();
        
        Console.WriteLine("\n玩家物品连接:");
        playerItems.ForEach(pi => Console.WriteLine($"  {pi.Player} - {pi.Item} (价值: {pi.Value})"));
        
        // GroupJoin - 组连接
        var playersWithItems = players
            .GroupJoin(items,
                       player => player.Name,
                       item => item.Owner,
                       (player, playerItems) => new { 
                           Player = player.Name, 
                           Items = playerItems.ToList() 
                       })
            .ToList();
        
        Console.WriteLine("\n玩家及其物品:");
        foreach (var pw in playersWithItems)
        {
            var itemsList = pw.Items.Count > 0 ? 
                string.Join(", ", pw.Items.Select(i => i.Name)) : "无物品";
            Console.WriteLine($"  {pw.Player}: {itemsList}");
        }
    }
    
    public static void DemonstrateSetOperations()
    {
        // 集合操作
        var activePlayers = new List<string> { "Alice", "Bob", "Charlie", "Diana" };
        var premiumPlayers = new List<string> { "Alice", "Charlie", "Eve", "Frank" };
        
        // Union - 并集
        var allPlayers = activePlayers.Union(premiumPlayers);
        Console.WriteLine($"所有玩家 (并集): [{string.Join(", ", allPlayers)}]");
        
        // Intersect - 交集
        var premiumActive = activePlayers.Intersect(premiumPlayers);
        Console.WriteLine($"既活跃又高级的玩家 (交集): [{string.Join(", ", premiumActive)}]");
        
        // Except - 差集
        var activeNotPremium = activePlayers.Except(premiumPlayers);
        Console.WriteLine($"活跃但非高级玩家 (差集): [{string.Join(", ", activeNotPremium)}]");
        
        // Concat - 连接
        var allNames = activePlayers.Concat(premiumPlayers);
        Console.WriteLine($"连接所有名字 (有重复): [{string.Join(", ", allNames)}]");
        
        // Distinct - 去重
        var uniqueNames = activePlayers.Concat(premiumPlayers).Distinct();
        Console.WriteLine($"连接所有名字 (去重): [{string.Join(", ", uniqueNames)}]");
    }
    
    public static void DemonstrateGenerationMethods()
    {
        // 生成方法
        // Range - 生成数字序列
        var levels = Enumerable.Range(1, 10);  // 1到10
        Console.WriteLine($"等级序列: [{string.Join(", ", levels)}]");
        
        // Repeat - 重复值
        var defaultScores = Enumerable.Repeat(0, 5);  // 重复0五次
        Console.WriteLine($"默认分数: [{string.Join(", ", defaultScores)}]");
        
        // Empty - 空集合
        var emptyList = Enumerable.Empty<Player>();
        Console.WriteLine($"空列表数量: {emptyList.Count()}");
        
        // DefaultIfEmpty - 空时提供默认值
        var withDefault = emptyList.DefaultIfEmpty(new Player { Name = "DefaultPlayer" });
        Console.WriteLine($"空列表默认值: {withDefault.First().Name}");
    }
}
```

### 游戏数据查询示例

```csharp
public class GameDataQueries
{
    private List<Player> players;
    private List<Enemy> enemies;
    private List<Item> items;
    
    public GameDataQueries()
    {
        // 初始化游戏数据
        players = new List<Player>
        {
            new Player { Name = "Hero1", Level = 25, Score = 5000, Class = "Warrior", Health = 100, LastLogin = DateTime.Now.AddDays(-1) },
            new Player { Name = "Hero2", Level = 18, Score = 3200, Class = "Mage", Health = 85, LastLogin = DateTime.Now.AddDays(-2) },
            new Player { Name = "Hero3", Level = 30, Score = 6800, Class = "Archer", Health = 90, LastLogin = DateTime.Now },
            new Player { Name = "Hero4", Level = 12, Score = 1800, Class = "Warrior", Health = 70, LastLogin = DateTime.Now.AddDays(-5) },
            new Player { Name = "Hero5", Level = 22, Score = 4500, Class = "Mage", Health = 95, LastLogin = DateTime.Now.AddDays(-1) }
        };
        
        enemies = new List<Enemy>
        {
            new Enemy { Name = "Goblin", Level = 5, Health = 30, Type = "Melee", SpawnArea = "Forest" },
            new Enemy { Name = "Orc", Level = 12, Health = 80, Type = "Melee", SpawnArea = "Mountain" },
            new Enemy { Name = "Skeleton", Level = 8, Health = 45, Type = "Melee", SpawnArea = "Cave" },
            new Enemy { Name = "Skeleton Archer", Level = 10, Health = 40, Type = "Ranged", SpawnArea = "Cave" },
            new Enemy { Name = "Dragon", Level = 25, Health = 500, Type = "Boss", SpawnArea = "Castle" }
        };
        
        items = new List<Item>
        {
            new Item { Name = "Health Potion", Type = "Consumable", Value = 50, Rarity = "Common", Owner = "Hero1" },
            new Item { Name = "Mana Potion", Type = "Consumable", Value = 40, Rarity = "Common", Owner = "Hero2" },
            new Item { Name = "Sword of Light", Type = "Weapon", Value = 500, Rarity = "Epic", Owner = "Hero3" },
            new Item { Name = "Shield", Type = "Armor", Value = 200, Rarity = "Rare", Owner = "Hero1" },
            new Item { Name = "Mystic Orb", Type = "Artifact", Value = 1000, Rarity = "Legendary", Owner = "Hero5" }
        };
    }
    
    // 玩家相关查询
    public List<Player> GetActivePlayers(TimeSpan activityThreshold)
    {
        return players
            .Where(p => DateTime.Now - p.LastLogin <= activityThreshold)
            .OrderByDescending(p => p.Score)
            .ToList();
    }
    
    public Dictionary<string, double> GetAverageLevelByClass()
    {
        return players
            .GroupBy(p => p.Class)
            .ToDictionary(g => g.Key, g => g.Average(p => p.Level));
    }
    
    public Player GetTopPlayer()
    {
        return players
            .OrderByDescending(p => p.Score)
            .ThenByDescending(p => p.Level)
            .FirstOrDefault();
    }
    
    public List<string> GetInactivePlayerNames(TimeSpan inactivityThreshold)
    {
        return players
            .Where(p => DateTime.Now - p.LastLogin > inactivityThreshold)
            .Select(p => p.Name)
            .ToList();
    }
    
    // 敌人相关查询
    public List<Enemy> GetEnemiesByArea(string area)
    {
        return enemies.Where(e => e.SpawnArea.Equals(area, StringComparison.OrdinalIgnoreCase)).ToList();
    }
    
    public Dictionary<string, int> GetEnemyCountByType()
    {
        return enemies
            .GroupBy(e => e.Type)
            .ToDictionary(g => g.Key, g => g.Count());
    }
    
    public Enemy GetStrongestEnemy()
    {
        return enemies.OrderByDescending(e => e.Health).FirstOrDefault();
    }
    
    // 物品相关查询
    public List<Item> GetItemsByRarity(string rarity)
    {
        return items.Where(i => i.Rarity.Equals(rarity, StringComparison.OrdinalIgnoreCase)).ToList();
    }
    
    public Dictionary<string, int> GetItemCountByType()
    {
        return items
            .GroupBy(i => i.Type)
            .ToDictionary(g => g.Key, g => g.Count());
    }
    
    public List<Item> GetMostValuableItems(int count)
    {
        return items.OrderByDescending(i => i.Value).Take(count).ToList();
    }
    
    // 综合查询
    public var GetPlayerStatsSummary()
    {
        return new
        {
            TotalPlayers = players.Count,
            AverageLevel = players.Average(p => p.Level),
            AverageScore = players.Average(p => p.Score),
            ActivePlayers = players.Count(p => DateTime.Now - p.LastLogin <= TimeSpan.FromDays(7)),
            HighestLevelPlayer = players.OrderByDescending(p => p.Level).First().Name,
            HighestScoringPlayer = players.OrderByDescending(p => p.Score).First().Name
        };
    }
    
    public void RunAllQueries()
    {
        Console.WriteLine("=== 游戏数据分析 ===");
        
        // 活跃玩家 (一周内登录)
        var activePlayers = GetActivePlayers(TimeSpan.FromDays(7));
        Console.WriteLine($"活跃玩家: {string.Join(", ", activePlayers.Select(p => p.Name))}");
        
        // 各职业平均等级
        var avgLevels = GetAverageLevelByClass();
        Console.WriteLine("各职业平均等级:");
        foreach (var kvp in avgLevels)
        {
            Console.WriteLine($"  {kvp.Key}: {kvp.Value:F1}");
        }
        
        // 顶级玩家
        var topPlayer = GetTopPlayer();
        Console.WriteLine($"顶级玩家: {topPlayer.Name} (分数: {topPlayer.Score})");
        
        // 非活跃玩家 (超过3天未登录)
        var inactivePlayers = GetInactivePlayerNames(TimeSpan.FromDays(3));
        Console.WriteLine($"非活跃玩家: {string.Join(", ", inactivePlayers)}");
        
        // 按区域分组的敌人
        var enemiesByArea = enemies.GroupBy(e => e.SpawnArea);
        Console.WriteLine("各区域敌人分布:");
        foreach (var area in enemiesByArea)
        {
            Console.WriteLine($"  {area.Key}: {string.Join(", ", area.Select(e => e.Name))}");
        }
        
        // 稀有度物品统计
        var itemsByRarity = items.GroupBy(i => i.Rarity);
        Console.WriteLine("各稀有度物品数量:");
        foreach (var rarity in itemsByRarity)
        {
            Console.WriteLine($"  {rarity.Key}: {rarity.Count()} 件");
        }
        
        // 游戏统计摘要
        var stats = GetPlayerStatsSummary();
        Console.WriteLine($"游戏统计: 总玩家 {stats.TotalPlayers}, 平均等级 {stats.AverageLevel:F1}, 平均分数 {stats.AverageScore:F0}");
    }
}

public class Enemy
{
    public string Name { get; set; }
    public int Level { get; set; }
    public int Health { get; set; }
    public string Type { get; set; }
    public string SpawnArea { get; set; }
}

// 扩展Item类
public class Item
{
    public string Name { get; set; }
    public string Type { get; set; }
    public int Value { get; set; }
    public string Owner { get; set; }
    public string Rarity { get; set; }  // Common, Rare, Epic, Legendary
}
```

---

## 游戏开发中的应用

### 玩家管理系统

```csharp
using System;
using System.Collections.Generic;
using System.Linq;

public class PlayerManagementSystem
{
    private List<Player> players = new List<Player>();
    private Dictionary<string, Player> playerLookup = new Dictionary<string, Player>();
    private Dictionary<string, List<Player>> guildMembers = new Dictionary<string, List<Player>>();
    
    public void AddPlayer(Player player)
    {
        if (!playerLookup.ContainsKey(player.Name))
        {
            players.Add(player);
            playerLookup[player.Name] = player;
            
            // 添加到公会
            if (!string.IsNullOrEmpty(player.Guild))
            {
                if (!guildMembers.ContainsKey(player.Guild))
                {
                    guildMembers[player.Guild] = new List<Player>();
                }
                guildMembers[player.Guild].Add(player);
            }
        }
    }
    
    public Player FindPlayer(string name)
    {
        return playerLookup.GetValueOrDefault(name);
    }
    
    public List<Player> FindPlayersByLevelRange(int minLevel, int maxLevel)
    {
        return players.Where(p => p.Level >= minLevel && p.Level <= maxLevel).ToList();
    }
    
    public List<Player> FindPlayersByClass(string playerClass)
    {
        return players.Where(p => p.Class.Equals(playerClass, StringComparison.OrdinalIgnoreCase)).ToList();
    }
    
    public List<Player> GetTopPlayers(int count, string sortBy = "Score")
    {
        switch (sortBy.ToLower())
        {
            case "level":
                return players.OrderByDescending(p => p.Level).Take(count).ToList();
            case "score":
                return players.OrderByDescending(p => p.Score).Take(count).ToList();
            default:
                return players.OrderByDescending(p => p.Score).ThenByDescending(p => p.Level).Take(count).ToList();
        }
    }
    
    public List<Player> GetOnlinePlayers(TimeSpan recentThreshold = default)
    {
        if (recentThreshold == default)
            recentThreshold = TimeSpan.FromMinutes(10);  // 默认10分钟内
        
        return players
            .Where(p => DateTime.Now - p.LastLogin <= recentThreshold)
            .ToList();
    }
    
    public Dictionary<string, int> GetClassDistribution()
    {
        return players
            .GroupBy(p => p.Class)
            .ToDictionary(g => g.Key, g => g.Count());
    }
    
    public double GetAverageLevel()
    {
        return players.Any() ? players.Average(p => p.Level) : 0;
    }
    
    public double GetAverageScore()
    {
        return players.Any() ? players.Average(p => p.Score) : 0;
    }
    
    public List<Player> GetPlayersForLeaderboard(int page = 1, int pageSize = 10)
    {
        return players
            .OrderByDescending(p => p.Score)
            .ThenByDescending(p => p.Level)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();
    }
    
    public List<Player> GetPlayersByGuild(string guildName)
    {
        return guildMembers.GetValueOrDefault(guildName, new List<Player>());
    }
    
    public Dictionary<string, double> GetAverageStatsByGuild()
    {
        return guildMembers.ToDictionary(
            kvp => kvp.Key,
            kvp => kvp.Value.Any() ? kvp.Value.Average(p => p.Score) : 0
        );
    }
    
    public List<Player> SearchPlayers(string searchTerm)
    {
        return players.Where(p => 
            p.Name.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
            p.Class.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
            (!string.IsNullOrEmpty(p.Guild) && p.Guild.Contains(searchTerm, StringComparison.OrdinalIgnoreCase))
        ).ToList();
    }
    
    public void RemoveInactivePlayers(TimeSpan inactivityThreshold)
    {
        var inactivePlayers = players.Where(p => DateTime.Now - p.LastLogin > inactivityThreshold).ToList();
        
        foreach (var player in inactivePlayers)
        {
            players.Remove(player);
            playerLookup.Remove(player.Name);
            
            // 从公会中移除
            if (!string.IsNullOrEmpty(player.Guild) && guildMembers.ContainsKey(player.Guild))
            {
                guildMembers[player.Guild].Remove(player);
                if (guildMembers[player.Guild].Count == 0)
                {
                    guildMembers.Remove(player.Guild);
                }
            }
        }
    }
    
    public void UpdatePlayerStats(string playerName, int scoreIncrease, int levelIncrease = 0)
    {
        if (playerLookup.TryGetValue(playerName, out Player player))
        {
            player.Score += scoreIncrease;
            if (levelIncrease > 0)
            {
                player.Level += levelIncrease;
            }
            player.LastLogin = DateTime.Now;  // 更新活跃时间
        }
    }
    
    public void PrintSystemStats()
    {
        Console.WriteLine("=== 玩家系统统计 ===");
        Console.WriteLine($"总玩家数: {players.Count}");
        Console.WriteLine($"平均等级: {GetAverageLevel():F2}");
        Console.WriteLine($"平均分数: {GetAverageScore():F2}");
        
        Console.WriteLine("职业分布:");
        foreach (var kvp in GetClassDistribution())
        {
            Console.WriteLine($"  {kvp.Key}: {kvp.Value} 人");
        }
        
        Console.WriteLine("公会统计:");
        foreach (var kvp in guildMembers)
        {
            Console.WriteLine($"  {kvp.Key}: {kvp.Value.Count} 人");
        }
    }
}
```

### 物品和背包系统

```csharp
public class InventorySystem
{
    private Dictionary<string, List<Item>> playerInventories = new Dictionary<string, List<Item>>();
    private Dictionary<string, Item> itemDatabase = new Dictionary<string, Item>();
    
    public void InitializeItemDatabase()
    {
        // 初始化物品数据库
        var defaultItems = new List<Item>
        {
            new Item { Name = "Health Potion", Type = "Consumable", Value = 50, Rarity = "Common", MaxStack = 99 },
            new Item { Name = "Mana Potion", Type = "Consumable", Value = 40, Rarity = "Common", MaxStack = 99 },
            new Item { Name = "Iron Sword", Type = "Weapon", Value = 200, Rarity = "Common", MaxStack = 1 },
            new Item { Name = "Leather Armor", Type = "Armor", Value = 150, Rarity = "Common", MaxStack = 1 },
            new Item { Name = "Magic Scroll", Type = "Consumable", Value = 100, Rarity = "Uncommon", MaxStack = 10 },
            new Item { Name = "Dragon Scale", Type = "Material", Value = 50, Rarity = "Rare", MaxStack = 99 }
        };
        
        foreach (var item in defaultItems)
        {
            itemDatabase[item.Name] = item;
        }
    }
    
    public bool AddItemToPlayer(string playerName, string itemName, int quantity = 1)
    {
        if (!itemDatabase.ContainsKey(itemName))
            return false;
        
        if (!playerInventories.ContainsKey(playerName))
        {
            playerInventories[playerName] = new List<Item>();
        }
        
        var inventory = playerInventories[playerName];
        var templateItem = itemDatabase[itemName];
        
        // 对于可堆叠物品,尝试合并到现有堆栈
        if (templateItem.MaxStack > 1)
        {
            var existingItem = inventory.FirstOrDefault(i => i.Name == itemName && i.Quantity < templateItem.MaxStack);
            if (existingItem != null)
            {
                int spaceAvailable = templateItem.MaxStack - existingItem.Quantity;
                int toAdd = Math.Min(quantity, spaceAvailable);
                existingItem.Quantity += toAdd;
                quantity -= toAdd;
            }
        }
        
        // 如果还有剩余数量,添加新堆栈
        while (quantity > 0)
        {
            int stackSize = Math.Min(quantity, templateItem.MaxStack);
            inventory.Add(new Item 
            { 
                Name = templateItem.Name, 
                Type = templateItem.Type, 
                Value = templateItem.Value, 
                Rarity = templateItem.Rarity, 
                MaxStack = templateItem.MaxStack,
                Quantity = stackSize
            });
            quantity -= stackSize;
        }
        
        return true;
    }
    
    public bool RemoveItemFromPlayer(string playerName, string itemName, int quantity = 1)
    {
        if (!playerInventories.ContainsKey(playerName))
            return false;
        
        var inventory = playerInventories[playerName];
        var itemsToRemove = new List<Item>();
        int remainingToRemove = quantity;
        
        // 从后往前遍历,避免索引问题
        for (int i = inventory.Count - 1; i >= 0 && remainingToRemove > 0; i--)
        {
            var item = inventory[i];
            if (item.Name == itemName)
            {
                if (item.Quantity <= remainingToRemove)
                {
                    // 移除整个堆栈
                    itemsToRemove.Add(item);
                    remainingToRemove -= item.Quantity;
                }
                else
                {
                    // 部分移除
                    item.Quantity -= remainingToRemove;
                    remainingToRemove = 0;
                }
            }
        }
        
        // 实际移除项目
        foreach (var item in itemsToRemove)
        {
            inventory.Remove(item);
        }
        
        return remainingToRemove == 0;
    }
    
    public List<Item> GetPlayerInventory(string playerName)
    {
        return playerInventories.GetValueOrDefault(playerName, new List<Item>());
    }
    
    public List<Item> GetItemsByType(string playerName, string itemType)
    {
        return GetPlayerInventory(playerName)
            .Where(i => i.Type.Equals(itemType, StringComparison.OrdinalIgnoreCase))
            .ToList();
    }
    
    public int GetItemCount(string playerName, string itemName)
    {
        return GetPlayerInventory(playerName)
            .Where(i => i.Name == itemName)
            .Sum(i => i.Quantity);
    }
    
    public List<Item> GetItemsByRarity(string playerName, string rarity)
    {
        return GetPlayerInventory(playerName)
            .Where(i => i.Rarity.Equals(rarity, StringComparison.OrdinalIgnoreCase))
            .ToList();
    }
    
    public bool HasItem(string playerName, string itemName, int minQuantity = 1)
    {
        return GetItemCount(playerName, itemName) >= minQuantity;
    }
    
    public Dictionary<string, int> GetItemCountByType(string playerName)
    {
        return GetPlayerInventory(playerName)
            .GroupBy(i => i.Type)
            .ToDictionary(g => g.Key, g => g.Sum(i => i.Quantity));
    }
    
    public Dictionary<string, int> GetItemCountByRarity(string playerName)
    {
        return GetPlayerInventory(playerName)
            .GroupBy(i => i.Rarity)
            .ToDictionary(g => g.Key, g => g.Sum(i => i.Quantity));
    }
    
    public List<Item> GetMostValuableItems(string playerName, int count = 5)
    {
        return GetPlayerInventory(playerName)
            .OrderByDescending(i => i.Value * i.Quantity)
            .Take(count)
            .ToList();
    }
    
    public void SortInventory(string playerName, string sortBy = "Name")
    {
        if (!playerInventories.ContainsKey(playerName))
            return;
        
        var inventory = playerInventories[playerName];
        
        switch (sortBy.ToLower())
        {
            case "name":
                inventory.Sort((a, b) => string.Compare(a.Name, b.Name));
                break;
            case "type":
                inventory.Sort((a, b) => string.Compare(a.Type, b.Type));
                break;
            case "value":
                inventory.Sort((a, b) => b.Value.CompareTo(a.Value));  // 降序
                break;
            case "rarity":
                var rarityOrder = new Dictionary<string, int> 
                { 
                    ["Common"] = 0, ["Uncommon"] = 1, ["Rare"] = 2, ["Epic"] = 3, ["Legendary"] = 4 
                };
                inventory.Sort((a, b) => rarityOrder.GetValueOrDefault(b.Rarity, 0).CompareTo(rarityOrder.GetValueOrDefault(a.Rarity, 0)));
                break;
        }
    }
    
    public void PrintInventory(string playerName)
    {
        var inventory = GetPlayerInventory(playerName);
        if (!inventory.Any())
        {
            Console.WriteLine($"{playerName} 的背包是空的");
            return;
        }
        
        Console.WriteLine($"{playerName} 的背包:");
        var grouped = inventory.GroupBy(i => i.Name);
        foreach (var group in grouped)
        {
            int totalQuantity = group.Sum(i => i.Quantity);
            var firstItem = group.First();
            Console.WriteLine($"  {firstItem.Name} x{totalQuantity} ({firstItem.Type}, {firstItem.Rarity}) - 总值: {firstItem.Value * totalQuantity}");
        }
    }
}

// 扩展Item类以支持库存系统
public class Item
{
    public string Name { get; set; }
    public string Type { get; set; }
    public int Value { get; set; }
    public string Rarity { get; set; }
    public int MaxStack { get; set; } = 1;
    public int Quantity { get; set; } = 1;
}
```

### 战斗和技能系统

```csharp
public class BattleSystem
{
    public class BattleUnit
    {
        public string Name { get; set; }
        public int Level { get; set; }
        public int Health { get; set; }
        public int MaxHealth { get; set; }
        public int Attack { get; set; }
        public int Defense { get; set; }
        public int Speed { get; set; }
        public List<Skill> Skills { get; set; } = new List<Skill>();
        public bool IsAlive => Health > 0;
        
        public BattleUnit(string name, int level)
        {
            Name = name;
            Level = level;
            MaxHealth = Level * 50;
            Health = MaxHealth;
            Attack = Level * 5;
            Defense = Level * 2;
            Speed = Level * 3;
        }
    }
    
    public class Skill
    {
        public string Name { get; set; }
        public int BaseDamage { get; set; }
        public int ManaCost { get; set; }
        public int Cooldown { get; set; }
        public int CurrentCooldown { get; set; }
        public SkillType Type { get; set; }
        public bool IsAvailable => CurrentCooldown <= 0;
    }
    
    public enum SkillType
    {
        Damage,
        Heal,
        Buff,
        Debuff
    }
    
    public class BattleResult
    {
        public BattleUnit Winner { get; set; }
        public List<BattleAction> Actions { get; set; } = new List<BattleAction>();
        public TimeSpan Duration { get; set; }
    }
    
    public class BattleAction
    {
        public BattleUnit Actor { get; set; }
        public BattleUnit Target { get; set; }
        public string Action { get; set; }
        public int Damage { get; set; }
        public int HealthChange { get; set; }
        public DateTime Time { get; set; }
    }
    
    public BattleResult SimulateBattle(BattleUnit attacker, BattleUnit defender)
    {
        var result = new BattleResult();
        var startTime = DateTime.Now;
        
        // 确保单位处于初始状态
        attacker.Health = attacker.MaxHealth;
        defender.Health = defender.MaxHealth;
        
        // 重置技能冷却
        foreach (var skill in attacker.Skills.Concat(defender.Skills))
        {
            skill.CurrentCooldown = 0;
        }
        
        // 战斗循环
        while (attacker.IsAlive && defender.IsAlive)
        {
            // 根据速度决定行动顺序
            var first = attacker.Speed >= defender.Speed ? attacker : defender;
            var second = first == attacker ? defender : attacker;
            
            // 第一个单位行动
            var action1 = ExecuteTurn(first, second);
            result.Actions.Add(action1);
            
            if (!second.IsAlive) break;
            
            // 第二个单位行动
            var action2 = ExecuteTurn(second, first);
            result.Actions.Add(action2);
        }
        
        result.Winner = attacker.IsAlive ? attacker : defender.IsAlive ? defender : null;
        result.Duration = DateTime.Now - startTime;
        
        return result;
    }
    
    private BattleAction ExecuteTurn(BattleUnit attacker, BattleUnit defender)
    {
        // 选择技能或普通攻击
        var availableSkills = attacker.Skills.Where(s => s.IsAvailable).ToList();
        Skill usedSkill = null;
        
        if (availableSkills.Any())
        {
            // 随机选择一个可用技能
            var random = new Random();
            usedSkill = availableSkills[random.Next(availableSkills.Count)];
        }
        
        if (usedSkill != null)
        {
            return UseSkill(attacker, defender, usedSkill);
        }
        else
        {
            return NormalAttack(attacker, defender);
        }
    }
    
    private BattleAction UseSkill(BattleUnit attacker, BattleUnit defender, Skill skill)
    {
        int damage = 0;
        int healthChange = 0;
        string action = skill.Name;
        
        switch (skill.Type)
        {
            case SkillType.Damage:
                damage = Math.Max(0, skill.BaseDamage + attacker.Attack - defender.Defense);
                defender.Health = Math.Max(0, defender.Health - damage);
                break;
                
            case SkillType.Heal:
                healthChange = skill.BaseDamage;  // 对于治疗技能,BaseDamage表示治疗量
                attacker.Health = Math.Min(attacker.MaxHealth, attacker.Health + healthChange);
                action = $"{skill.Name} (治疗)";
                break;
                
            case SkillType.Buff:
                // 简单的增益效果
                attacker.Attack += skill.BaseDamage / 10;
                action = $"{skill.Name} (增益)";
                break;
                
            case SkillType.Debuff:
                // 简单的减益效果
                defender.Defense = Math.Max(0, defender.Defense - skill.BaseDamage / 20);
                action = $"{skill.Name} (减益)";
                break;
        }
        
        // 设置冷却
        skill.CurrentCooldown = skill.Cooldown;
        
        // 更新所有技能的冷却
        foreach (var s in attacker.Skills)
        {
            s.CurrentCooldown = Math.Max(0, s.CurrentCooldown - 1);
        }
        
        return new BattleAction
        {
            Actor = attacker,
            Target = defender,
            Action = action,
            Damage = damage,
            HealthChange = healthChange,
            Time = DateTime.Now
        };
    }
    
    private BattleAction NormalAttack(BattleUnit attacker, BattleUnit defender)
    {
        int damage = Math.Max(1, attacker.Attack - defender.Defense / 2);
        defender.Health = Math.Max(0, defender.Health - damage);
        
        return new BattleAction
        {
            Actor = attacker,
            Target = defender,
            Action = "普通攻击",
            Damage = damage,
            Time = DateTime.Now
        };
    }
    
    public List<BattleUnit> GetUnitsByStatus(List<BattleUnit> units, bool aliveOnly = true)
    {
        return aliveOnly ? 
            units.Where(u => u.IsAlive).ToList() : 
            units.Where(u => !u.IsAlive).ToList();
    }
    
    public Dictionary<string, double> GetAverageStats(List<BattleUnit> units)
    {
        if (!units.Any()) return new Dictionary<string, double>();
        
        return new Dictionary<string, double>
        {
            ["AverageLevel"] = units.Average(u => u.Level),
            ["AverageHealth"] = units.Average(u => u.MaxHealth),
            ["AverageAttack"] = units.Average(u => u.Attack),
            ["AverageDefense"] = units.Average(u => u.Defense),
            ["AverageSpeed"] = units.Average(u => u.Speed)
        };
    }
    
    public BattleUnit GetStrongestUnit(List<BattleUnit> units)
    {
        return units
            .OrderByDescending(u => u.MaxHealth + u.Attack * 2 + u.Defense + u.Speed)
            .FirstOrDefault();
    }
    
    public List<BattleUnit> SortUnitsByPower(List<BattleUnit> units)
    {
        return units
            .OrderByDescending(u => u.MaxHealth + u.Attack * 2 + u.Defense + u.Speed)
            .ToList();
    }
    
    public void PrintBattleResult(BattleResult result)
    {
        Console.WriteLine("=== 战斗结果 ===");
        Console.WriteLine($"获胜者: {result.Winner?.Name ?? "平局"}");
        Console.WriteLine($"战斗持续: {result.Duration.TotalMilliseconds:F0}ms");
        Console.WriteLine($"行动次数: {result.Actions.Count}");
        
        Console.WriteLine("\n战斗过程:");
        foreach (var action in result.Actions.Take(10))  // 只显示前10个行动
        {
            if (action.Damage > 0)
            {
                Console.WriteLine($"{action.Actor.Name} 对 {action.Target.Name} 使用 {action.Action}, 造成 {action.Damage} 点伤害");
            }
            else if (action.HealthChange != 0)
            {
                Console.WriteLine($"{action.Actor.Name} 使用 {action.Action}, 改变生命值 {action.HealthChange:+#;-#;0}");
            }
            else
            {
                Console.WriteLine($"{action.Actor.Name} 对 {action.Target.Name} 使用 {action.Action}");
            }
        }
        
        if (result.Actions.Count > 10)
        {
            Console.WriteLine($"... 还有 {result.Actions.Count - 10} 个行动");
        }
    }
}
```

---

## 性能优化技巧

### LINQ性能优化

```csharp
using System;
using System.Collections.Generic;
using System.Linq;

public class LinqPerformance
{
    public static void PerformanceTips()
    {
        // 1. 避免在循环中使用LINQ
        var players = new List<Player>();
        for (int i = 0; i < 1000; i++)
        {
            players.Add(new Player { Name = $"Player{i}", Level = i % 50, Score = i * 10 });
        }
        
        // ❌ 错误: 在循环中使用LINQ (性能差)
        // for (int i = 0; i < 100; i++)
        // {
        //     var highScorers = players.Where(p => p.Score > 5000).ToList();  // 每次都重新计算
        // }
        
        // ✅ 正确: 预先计算或使用索引
        var highScorers = players.Where(p => p.Score > 5000).ToList();  // 只计算一次
        
        // 2. 使用IList避免重复枚举
        var query = players.Where(p => p.Level > 10);  // 延迟执行
        
        // 如果需要多次访问结果,转换为列表
        var list = query.ToList();  // 立即执行
        
        // 3. 选择合适的数据结构
        // ❌ 使用List进行频繁查找
        // var player = players.First(p => p.Name == "Alice");
        
        // ✅ 使用Dictionary进行快速查找
        var playerDict = players.ToDictionary(p => p.Name, p => p);
        var player = playerDict.GetValueOrDefault("Alice");
        
        // 4. 使用IEqualityComparer优化
        var uniquePlayers = players
            .GroupBy(p => p.Name, StringComparer.OrdinalIgnoreCase)
            .Select(g => g.First())
            .ToList();
        
        // 5. 避免Select不必要的投影
        // ❌ 不必要的投影
        // var names = players.Select(p => p.Name).Where(name => name.Length > 5);
        
        // ✅ 先过滤再投影
        var names = players.Where(p => p.Name.Length > 5).Select(p => p.Name);
        
        // 6. 使用Any代替Count > 0
        // ❌ 性能差
        // bool hasHighLevel = players.Count(p => p.Level > 20) > 0;
        
        // ✅ 性能好
        bool hasHighLevel = players.Any(p => p.Level > 20);
        
        // 7. 使用FirstOrDefault避免异常
        // ❌ 可能抛出异常
        // var first = players.Where(p => p.Level > 100).First();
        
        // ✅ 安全
        var first = players.FirstOrDefault(p => p.Level > 100);
    }
    
    public static void DemonstrateEfficientPatterns()
    {
        var players = new List<Player>();
        for (int i = 0; i < 10000; i++)
        {
            players.Add(new Player { Name = $"Player{i}", Level = i % 50, Score = i * 10 });
        }
        
        // 高效的分页查询
        int pageNumber = 2;
        int pageSize = 20;
        
        var pagedPlayers = players
            .OrderByDescending(p => p.Score)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToList();
        
        Console.WriteLine($"第{pageNumber}页玩家数量: {pagedPlayers.Count}");
        
        // 高效的分组统计
        var classStats = players
            .GroupBy(p => p.Level / 10)  // 按等级段分组
            .Select(g => new
            {
                LevelRange = $"{g.Key * 10}-{g.Key * 10 + 9}",
                Count = g.Count(),
                AverageScore = g.Average(p => p.Score),
                MaxScore = g.Max(p => p.Score)
            })
            .ToList();
        
        Console.WriteLine("等级段统计:");
        foreach (var stat in classStats.Take(5))
        {
            Console.WriteLine($"  {stat.LevelRange}: {stat.Count}人, 平均分数{stat.AverageScore:F0}, 最高分{stat.MaxScore}");
        }
        
        // 使用HashSet进行快速成员检查
        var specialPlayerNames = new HashSet<string> { "Player100", "Player200", "Player500", "Player999" };
        
        var specialPlayers = players
            .Where(p => specialPlayerNames.Contains(p.Name))
            .ToList();
        
        Console.WriteLine($"特殊玩家数量: {specialPlayers.Count}");
    }
    
    public static void MemoryEfficientQueries()
    {
        var players = new List<Player>();
        for (int i = 0; i < 50000; i++)
        {
            players.Add(new Player { Name = $"Player{i}", Level = i % 50, Score = i * 10 });
        }
        
        // 对于大数据集,考虑使用迭代方式
        var highScorers = new List<Player>();
        foreach (var player in players)
        {
            if (player.Score > 400000)  // 直接遍历,避免LINQ开销
            {
                highScorers.Add(player);
            }
        }
        
        Console.WriteLine($"高分玩家数量: {highScorers.Count}");
        
        // 使用Span<T>和ReadOnlySpan<T>进行高性能操作 (C# 7.2+)
        // 注意: 这里仅作示例,实际使用需要适当的场景
        var playerArray = players.Take(1000).ToArray();
        var span = playerArray.AsSpan();
        
        // 对于字符串操作,使用StringBuilder
        var names = string.Join(", ", players.Take(100).Select(p => p.Name));
        
        Console.WriteLine($"前100个玩家名字长度: {names.Length}");
    }
}
```

### 集合性能优化

```csharp
public class CollectionPerformance
{
    public static void OptimizeCollections()
    {
        // 1. 预设容量
        var players = new List<Player>(1000);  // 预设容量避免频繁重分配
        
        // 2. 使用Dictionary进行快速查找
        var playerLookup = new Dictionary<string, Player>();
        
        // 3. 使用HashSet进行成员检查
        var bannedPlayers = new HashSet<string>();
        
        // 4. 选择合适的集合类型
        // 频繁随机访问 -> List<T>
        // 快速键值查找 -> Dictionary<TKey, TValue>
        // 唯一性约束 -> HashSet<T>
        // 队列处理 -> Queue<T>
        // 栈操作 -> Stack<T>
        
        // 5. 使用Concurrent集合进行多线程操作
        // 注意: 需要using System.Collections.Concurrent;
        // var threadSafePlayers = new ConcurrentDictionary<string, Player>();
        
        // 6. 批量操作
        var newPlayers = new List<Player>
        {
            new Player { Name = "Player1" },
            new Player { Name = "Player2" },
            new Player { Name = "Player3" }
        };
        
        players.AddRange(newPlayers);  // 批量添加比逐个添加高效
        
        // 7. 使用Span<T>进行高性能操作
        var playerArray = players.Take(100).ToArray();
        var span = playerArray.AsSpan();
        
        // 8. 避免装箱拆箱
        // ❌ 值类型装箱
        // var objectList = new List<object> { 1, 2, 3, 4, 5 };
        
        // ✅ 使用泛型
        var intList = new List<int> { 1, 2, 3, 4, 5 };
        
        // 9. 使用ReadOnlyCollection<T>保护数据
        var readOnlyPlayers = new ReadOnlyCollection<Player>(players);
        
        // 10. 使用Collection Initializer
        var quickList = new List<Player>
        {
            new Player { Name = "Quick1" },
            new Player { Name = "Quick2" }
        };
    }
    
    public static void CompareCollectionPerformance()
    {
        const int size = 100000;
        
        // 测试List<T>性能
        var list = new List<int>();
        var sw = System.Diagnostics.Stopwatch.StartNew();
        
        for (int i = 0; i < size; i++)
        {
            list.Add(i);
        }
        sw.Stop();
        Console.WriteLine($"List.Add {size} 个元素耗时: {sw.ElapsedMilliseconds}ms");
        
        // 测试预分配容量的List<T>性能
        var listWithCapacity = new List<int>(size);
        sw.Restart();
        
        for (int i = 0; i < size; i++)
        {
            listWithCapacity.Add(i);
        }
        sw.Stop();
        Console.WriteLine($"预分配List.Add {size} 个元素耗时: {sw.ElapsedMilliseconds}ms");
        
        // 测试Dictionary查找性能
        var dict = new Dictionary<int, int>();
        for (int i = 0; i < size; i++)
        {
            dict[i] = i * 2;
        }
        
        sw.Restart();
        for (int i = 0; i < 1000; i++)
        {
            var value = dict[size / 2];  // 查找中间元素
        }
        sw.Stop();
        Console.WriteLine($"Dictionary查找1000次耗时: {sw.ElapsedMilliseconds}ms");
        
        // 测试List查找性能
        var listForSearch = new List<int>();
        for (int i = 0; i < size; i++)
        {
            listForSearch.Add(i * 2);
        }
        
        sw.Restart();
        for (int i = 0; i < 1000; i++)
        {
            var index = listForSearch.IndexOf(size);  // O(n) 查找
        }
        sw.Stop();
        Console.WriteLine($"List.IndexOf查找1000次耗时: {sw.ElapsedMilliseconds}ms");
    }
}
```

---

## 实践练习

### 练习1: 游戏排行榜系统

```csharp
public class LeaderboardSystem
{
    private List<Player> players = new List<Player>();
    private Dictionary<string, int> playerScores = new Dictionary<string, int>();
    
    public void AddOrUpdatePlayer(string playerName, int score)
    {
        if (playerScores.ContainsKey(playerName))
        {
            playerScores[playerName] = Math.Max(playerScores[playerName], score);
        }
        else
        {
            playerScores[playerName] = score;
        }
    }
    
    public List<Player> GetTopPlayers(int count = 10)
    {
        return playerScores
            .OrderByDescending(kvp => kvp.Value)
            .Take(count)
            .Select(kvp => new Player { Name = kvp.Key, Score = kvp.Value })
            .ToList();
    }
    
    public int GetPlayerRank(string playerName)
    {
        if (!playerScores.ContainsKey(playerName))
            return -1;
        
        var sortedScores = playerScores.Values.OrderByDescending(s => s).ToList();
        var playerScore = playerScores[playerName];
        return sortedScores.IndexOf(playerScore) + 1;
    }
    
    public List<Player> GetPlayersInRankRange(int startRank, int endRank)
    {
        var allPlayers = playerScores
            .OrderByDescending(kvp => kvp.Value)
            .Select(kvp => new Player { Name = kvp.Key, Score = kvp.Value })
            .ToList();
        
        return allPlayers.Skip(startRank - 1).Take(endRank - startRank + 1).ToList();
    }
    
    public Dictionary<int, List<Player>> GetPlayersByScoreRange(int rangeSize = 1000)
    {
        return playerScores
            .GroupBy(kvp => (kvp.Value / rangeSize) * rangeSize)  // 按分数段分组
            .OrderByDescending(g => g.Key)
            .ToDictionary(
                g => g.Key, 
                g => g.Select(kvp => new Player { Name = kvp.Key, Score = kvp.Value }).ToList()
            );
    }
    
    public Player GetPlayerStats(string playerName)
    {
        if (!playerScores.ContainsKey(playerName))
            return null;
        
        var playerScore = playerScores[playerName];
        var allScores = playerScores.Values.ToList();
        
        return new Player
        {
            Name = playerName,
            Score = playerScore,
            Level = CalculateLevel(playerScore),
            Percentile = CalculatePercentile(playerScore, allScores)
        };
    }
    
    private int CalculateLevel(int score)
    {
        return (int)Math.Sqrt(score / 100) + 1;
    }
    
    private double CalculatePercentile(int playerScore, List<int> allScores)
    {
        var higherScores = allScores.Count(s => s > playerScore);
        return (1.0 - (double)higherScores / allScores.Count) * 100;
    }
    
    public void PrintLeaderboard(int count = 10)
    {
        var topPlayers = GetTopPlayers(count);
        
        Console.WriteLine("=== 排行榜 ===");
        for (int i = 0; i < topPlayers.Count; i++)
        {
            var player = topPlayers[i];
            Console.WriteLine($"{i + 1,2}. {player.Name} - {player.Score,8:N0} 分");
        }
    }
    
    public void PrintScoreDistribution()
    {
        var distribution = GetPlayersByScoreRange(5000);
        
        Console.WriteLine("\n=== 分数分布 ===");
        foreach (var range in distribution.Take(5))  // 显示前5个分数段
        {
            Console.WriteLine($"{range.Key,6} - {range.Key + 4999,6}: {range.Value.Count,3} 人");
        }
    }
}
```

### 练习2: 游戏数据分析器

```csharp
public class GameDataAnalyzer
{
    private List<GameSession> sessions = new List<GameSession>();
    private List<PlayerAction> actions = new List<PlayerAction>();
    
    public void AddSession(GameSession session)
    {
        sessions.Add(session);
    }
    
    public void AddAction(PlayerAction action)
    {
        actions.Add(action);
    }
    
    public AnalysisReport GenerateReport()
    {
        var report = new AnalysisReport();
        
        // 会话分析
        report.TotalSessions = sessions.Count;
        report.AverageSessionDuration = sessions.Any() ? 
            TimeSpan.FromTicks((long)sessions.Average(s => s.Duration.Ticks)) : TimeSpan.Zero;
        report.TotalPlayTime = TimeSpan.FromTicks(sessions.Sum(s => s.Duration.Ticks));
        
        // 活跃玩家分析
        var uniquePlayers = sessions.Select(s => s.PlayerId).Distinct().ToList();
        report.UniquePlayers = uniquePlayers.Count;
        
        // 玩家行为分析
        var playerSessions = sessions.GroupBy(s => s.PlayerId);
        report.AverageSessionsPerPlayer = playerSessions.Any() ? 
            playerSessions.Average(g => g.Count()) : 0;
        
        // 操作分析
        report.TotalActions = actions.Count;
        var actionTypeCount = actions.GroupBy(a => a.ActionType)
            .ToDictionary(g => g.Key, g => g.Count());
        report.ActionsByType = actionTypeCount;
        
        // 时间分析
        if (sessions.Any())
        {
            var sessionDates = sessions.Select(s => s.StartTime.Date).ToList();
            report.FirstSession = sessions.Min(s => s.StartTime);
            report.LastSession = sessions.Max(s => s.StartTime);
            report.ActiveDays = sessionDates.Distinct().Count();
        }
        
        // 离开率分析
        var completedSessions = sessions.Count(s => s.IsCompleted);
        report.CompletionRate = sessions.Count > 0 ? 
            (double)completedSessions / sessions.Count * 100 : 0;
        
        return report;
    }
    
    public List<PlayerAction> GetPlayerActions(string playerId, DateTime? startDate = null, DateTime? endDate = null)
    {
        var query = actions.Where(a => a.PlayerId == playerId);
        
        if (startDate.HasValue)
            query = query.Where(a => a.Timestamp >= startDate.Value);
        
        if (endDate.HasValue)
            query = query.Where(a => a.Timestamp <= endDate.Value);
        
        return query.OrderBy(a => a.Timestamp).ToList();
    }
    
    public Dictionary<string, int> GetPlayerActionFrequency(string playerId)
    {
        return GetPlayerActions(playerId)
            .GroupBy(a => a.ActionType)
            .ToDictionary(g => g.Key, g => g.Count());
    }
    
    public List<string> GetMostActivePlayers(int count = 10)
    {
        return sessions
            .GroupBy(s => s.PlayerId)
            .OrderByDescending(g => g.Count())
            .Take(count)
            .Select(g => g.Key)
            .ToList();
    }
    
    public TimeSpan GetAverageTimeToComplete(string actionType)
    {
        var startEvents = actions.Where(a => a.ActionType == $"Start{actionType}");
        var completeEvents = actions.Where(a => a.ActionType == $"Complete{actionType}");
        
        var matchingEvents = startEvents.Join(
            completeEvents,
            start => start.PlayerId,
            complete => complete.PlayerId,
            (start, complete) => new { Start = start.Timestamp, Complete = complete.Timestamp }
        ).Where(j => j.Complete > j.Start);
        
        if (!matchingEvents.Any())
            return TimeSpan.Zero;
        
        return TimeSpan.FromTicks((long)matchingEvents
            .Average(e => (e.Complete - e.Start).Ticks));
    }
    
    public void PrintAnalysis()
    {
        var report = GenerateReport();
        
        Console.WriteLine("=== 游戏数据分析报告 ===");
        Console.WriteLine($"总会话数: {report.TotalSessions}");
        Console.WriteLine($"总玩家数: {report.UniquePlayers}");
        Console.WriteLine($"总操作数: {report.TotalActions}");
        Console.WriteLine($"平均会话时长: {report.AverageSessionDuration}");
        Console.WriteLine($"总游戏时间: {report.TotalPlayTime}");
        Console.WriteLine($"平均每个玩家会话数: {report.AverageSessionsPerPlayer:F2}");
        Console.WriteLine($"完成率: {report.CompletionRate:F2}%");
        Console.WriteLine($"活跃天数: {report.ActiveDays}");
        
        Console.WriteLine("\n操作类型分布:");
        foreach (var action in report.ActionsByType.Take(5))
        {
            Console.WriteLine($"  {action.Key}: {action.Value} 次");
        }
        
        Console.WriteLine($"\n最活跃的5名玩家:");
        foreach (var player in GetMostActivePlayers(5))
        {
            Console.WriteLine($"  {player}");
        }
    }
}

public class GameSession
{
    public string PlayerId { get; set; }
    public DateTime StartTime { get; set; }
    public TimeSpan Duration { get; set; }
    public bool IsCompleted { get; set; }
    public string Level { get; set; }
    public int Score { get; set; }
}

public class PlayerAction
{
    public string PlayerId { get; set; }
    public string ActionType { get; set; }
    public DateTime Timestamp { get; set; }
    public string Details { get; set; }
}

public class AnalysisReport
{
    public int TotalSessions { get; set; }
    public int UniquePlayers { get; set; }
    public int TotalActions { get; set; }
    public TimeSpan AverageSessionDuration { get; set; }
    public TimeSpan TotalPlayTime { get; set; }
    public double AverageSessionsPerPlayer { get; set; }
    public Dictionary<string, int> ActionsByType { get; set; } = new Dictionary<string, int>();
    public DateTime FirstSession { get; set; }
    public DateTime LastSession { get; set; }
    public int ActiveDays { get; set; }
    public double CompletionRate { get; set; }
}
```

---

## 常见错误和最佳实践

### 1. 避免重复枚举

```csharp
// ❌ 错误: 重复枚举可枚举集合
public void BadExample(IEnumerable<int> numbers)
{
    var count = numbers.Count();        // 第一次枚举
    var sum = numbers.Sum();            // 第二次枚举
    var max = numbers.Max();            // 第三次枚举
}

// ✅ 正确: 转换为列表或数组
public void GoodExample(IEnumerable<int> numbers)
{
    var list = numbers.ToList();        // 只枚举一次
    var count = list.Count;             // O(1)
    var sum = list.Sum();               // O(n)
    var max = list.Max();               // O(n)
}
```

### 2. 正确使用FirstOrDefault vs First

```csharp
// ❌ 可能抛出异常
var player = players.First(p => p.Level > 100);  // 如果没有匹配项会抛异常

// ✅ 安全使用
var player = players.FirstOrDefault(p => p.Level > 100);  // 无匹配项返回默认值
if (player != null)
{
    // 处理player
}
```

### 3. 避免在查询中使用复杂方法

```csharp
// ❌ 性能差: 在查询中调用复杂方法
var results = players.Where(p => IsEligibleForReward(p)).ToList();

// ✅ 预先计算或简化条件
var eligiblePlayers = players.Where(p => p.Level >= 10 && p.Score > 1000).ToList();
```

### 4. 使用索引优化

```csharp
// 对于频繁的随机访问,使用List<T>
var players = new List<Player> { /* ... */ };
var player = players[5];  // O(1)

// 对于频繁的键值查找,使用Dictionary<TKey, TValue>
var playerLookup = players.ToDictionary(p => p.Name, p => p);
var player = playerLookup["Alice"];  // O(1)
```

---

## 总结

本章我们深入学习了C#的集合框架和LINQ查询:

✅ **集合框架**: List<T>、Dictionary<TKey, TValue>、HashSet<T>、Queue<T>、Stack<T>等  
✅ **LINQ查询语法**: 查询表达式、过滤、排序、分组、连接等  
✅ **LINQ方法语法**: Where、Select、OrderBy、GroupBy、Join等方法  
✅ **游戏开发应用**: 玩家管理、物品系统、战斗系统等实际应用  
✅ **性能优化**: 避免重复枚举、选择合适集合、使用索引等技巧  

LINQ和集合框架是C#中极其强大的功能,特别适合处理游戏开发中的各种数据操作需求。掌握这些技术可以大大提高代码的可读性和开发效率。

---

## 下一步

继续学习 [05. 高级特性](05-advanced.md) →
