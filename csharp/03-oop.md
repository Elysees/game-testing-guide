# 03. 面向对象编程

> C#面向对象编程完全指南 - 从C++到C#的OOP对比学习

---

## 📌 本章导航

- [类和对象](#类和对象)
- [属性和字段](#属性和字段)
- [构造函数](#构造函数)
- [继承机制](#继承机制)
- [多态性](#多态性)
- [抽象类和接口](#抽象类和接口)
- [访问修饰符](#访问修饰符)
- [C#与C++ OOP差异总结](#c与c-oop差异总结)

---

## 类和对象

### 类定义基础

C#的类定义与C++有很多相似之处,但也有一些重要的差异:

```csharp
// C#类定义
public class Player
{
    // 字段 (成员变量)
    private string name;
    private int level;
    private int health;
    
    // 属性 (类似C++的getter/setter)
    public string Name
    {
        get { return name; }
        set { name = value; }
    }
    
    public int Level
    {
        get { return level; }
        set { level = value > 0 ? value : 1; }  // 验证逻辑
    }
    
    public int Health
    {
        get { return health; }
        set { health = Math.Clamp(value, 0, 100); }  // 使用内置方法
    }
    
    // 构造函数
    public Player(string name)
    {
        this.name = name;
        level = 1;
        health = 100;
    }
    
    // 方法
    public void TakeDamage(int damage)
    {
        health = Math.Max(0, health - damage);
        if (health <= 0)
        {
            OnDeath();
        }
    }
    
    public void LevelUp()
    {
        level++;
        health = 100;  // 升级时恢复生命
    }
    
    private void OnDeath()
    {
        Console.WriteLine($"{name} died!");
    }
}

// 对象创建和使用
Player player = new Player("Hero");
player.TakeDamage(20);
player.LevelUp();
Console.WriteLine($"Player: {player.Name}, Level: {player.Level}, Health: {player.Health}");
```

### 与C++类定义的对比

| 特性 | C++ | C# | 说明 |
|------|-----|-----|------|
| **类声明** | `class Player { ... };` | `public class Player { ... }` | C#需要访问修饰符 |
| **构造函数** | `Player(const string& name)` | `public Player(string name)` | C#需要访问修饰符 |
| **析构函数** | `~Player()` | `~Player()` (不推荐) | C#有GC,通常不需要析构函数 |
| **成员访问** | `player.name` (public) | `player.Name` (属性) | C#推荐使用属性 |

### C#特有的类特性

```csharp
// 部分类 (partial class)
public partial class GameEntity
{
    public string Name { get; set; }
}

public partial class GameEntity
{
    public void Initialize()
    {
        // 可以在不同文件中定义同一类的不同部分
    }
}

// 静态类 (不能实例化)
public static class GameMath
{
    public static float CalculateDistance(Vector3 a, Vector3 b)
    {
        return Vector3.Distance(a, b);
    }
    
    public static int CalculateScore(int baseScore, float multiplier)
    {
        return (int)(baseScore * multiplier);
    }
}

// 密封类 (不能被继承)
public sealed class SingletonManager
{
    private static SingletonManager instance;
    
    private SingletonManager() { }
    
    public static SingletonManager Instance
    {
        get
        {
            if (instance == null)
                instance = new SingletonManager();
            return instance;
        }
    }
}
```

---

## 属性和字段

### 字段 (Fields)

字段是类的成员变量,在C#中通常声明为私有:

```csharp
public class GameItem
{
    // 私有字段 (类似C++的private成员变量)
    private string name;
    private int value;
    private bool isEquipped;
    
    // 只读字段 (类似C++的const成员)
    private readonly int id;
    private static readonly string defaultCategory = "Misc";
    
    public GameItem(string name, int value)
    {
        this.name = name;
        this.value = value;
        this.id = GenerateId();  // 只能在构造函数中赋值
    }
    
    private int GenerateId()
    {
        return new Random().Next(1000, 9999);
    }
    
    // 公共字段 (不推荐,但有时有用)
    public const int MAX_STACK_SIZE = 99;
}
```

### 属性 (Properties)

属性是C#的特色功能,提供了更安全的数据访问方式:

```csharp
public class Character
{
    // 私有字段
    private int health;
    private int maxHealth;
    private string characterClass;
    
    // 自动属性 (C# 3.0+)
    public string Name { get; set; }
    public int Level { get; set; } = 1;  // 带默认值
    
    // 完整属性 (带验证逻辑)
    public int Health
    {
        get { return health; }
        set 
        { 
            health = Math.Clamp(value, 0, MaxHealth);
            OnHealthChanged();
        }
    }
    
    // 只读属性
    public int MaxHealth
    {
        get { return maxHealth; }
        private set { maxHealth = value; }  // private setter
    }
    
    // 计算属性
    public bool IsAlive => Health > 0;
    public float HealthPercentage => (float)Health / MaxHealth * 100;
    
    // 索引器 (类似C++的operator[])
    private Dictionary<string, int> stats = new Dictionary<string, int>();
    public int this[string statName]
    {
        get { return stats.ContainsKey(statName) ? stats[statName] : 0; }
        set { stats[statName] = value; }
    }
    
    // 只读索引器 (C# 8.0+)
    public int this[int index] => stats.Values.ElementAtOrDefault(index);
    
    private void OnHealthChanged()
    {
        if (Health <= 0)
        {
            Console.WriteLine("Character died!");
        }
    }
    
    public Character(string name, int maxHealth = 100)
    {
        Name = name;
        this.maxHealth = maxHealth;
        this.health = maxHealth;
    }
}

// 使用示例
Character player = new Character("Warrior", 150);
player.Health = 50;  // 调用setter
Console.WriteLine($"Health: {player.Health}");  // 调用getter
Console.WriteLine($"Alive: {player.IsAlive}");  // 计算属性
player["strength"] = 10;  // 索引器
```

### 属性 vs 字段的对比

```csharp
public class PlayerStats
{
    // C++风格: 直接访问字段
    // private int health;  // C++中可能直接访问
    
    // C#风格: 使用属性控制访问
    private int _health = 100;
    private int _maxHealth = 100;
    
    public int Health
    {
        get { return _health; }
        set 
        { 
            _health = Math.Clamp(value, 0, _maxHealth);
            if (_health <= 0)
            {
                OnPlayerDied();
            }
        }
    }
    
    public int MaxHealth
    {
        get { return _maxHealth; }
        set 
        { 
            _maxHealth = Math.Max(1, value);
            _health = Math.Min(_health, _maxHealth);  // 确保健康值不超过最大值
        }
    }
    
    // 只读属性
    public float HealthPercentage => (float)_health / _maxHealth * 100;
    
    // 条件属性
    public bool IsInCombat { get; set; }
    public bool CanLevelUp => HealthPercentage >= 80 && IsInCombat;
    
    private void OnPlayerDied()
    {
        Console.WriteLine("Player has died!");
        // 触发死亡事件
    }
}
```

---

## 构造函数

### 构造函数类型

```csharp
public class GameEntity
{
    public string Name { get; set; }
    public int Id { get; private set; }
    public Vector3 Position { get; set; }
    public float Rotation { get; set; }
    
    // 无参构造函数
    public GameEntity()
    {
        Name = "Default";
        Id = GenerateId();
        Position = Vector3.zero;
        Rotation = 0f;
    }
    
    // 有参构造函数
    public GameEntity(string name)
    {
        Name = name;
        Id = GenerateId();
        Position = Vector3.zero;
        Rotation = 0f;
    }
    
    // 多参数构造函数
    public GameEntity(string name, Vector3 position, float rotation = 0f)
    {
        Name = name;
        Id = GenerateId();
        Position = position;
        Rotation = rotation;
    }
    
    // 私有构造函数 (用于单例等模式)
    private GameEntity(int id)
    {
        Id = id;
        Name = $"Entity_{id}";
    }
    
    // 静态工厂方法
    public static GameEntity CreatePlayer(string name)
    {
        return new GameEntity(name) { Id = GenerateId() };
    }
    
    public static GameEntity CreateEnemy(string name, Vector3 spawnPosition)
    {
        return new GameEntity(name, spawnPosition) { Id = GenerateId() };
    }
    
    private static int GenerateId()
    {
        return new System.Random().Next(1000, 9999);
    }
}

// 构造函数调用示例
GameEntity entity1 = new GameEntity();                           // 无参构造
GameEntity entity2 = new GameEntity("Player");                   // 有参构造
GameEntity entity3 = new GameEntity("Enemy", new Vector3(10, 0, 0)); // 多参数构造
GameEntity entity4 = GameEntity.CreatePlayer("Hero");            // 工厂方法
```

### 构造函数链 (Constructor Chaining)

```csharp
public class Weapon
{
    public string Name { get; set; }
    public int Damage { get; set; }
    public float AttackSpeed { get; set; }
    public int Durability { get; set; }
    public string Type { get; set; }
    
    // 基础构造函数
    public Weapon(string name, int damage, float attackSpeed)
    {
        Name = name;
        Damage = damage;
        AttackSpeed = attackSpeed;
        Durability = 100;  // 默认耐久度
        Type = "Weapon";   // 默认类型
    }
    
    // 使用this调用其他构造函数
    public Weapon(string name, int damage) : this(name, damage, 1.0f)
    {
        // 只需设置特定值
    }
    
    // 更复杂的构造函数链
    public Weapon(string name) : this(name, 10)
    {
        // 从最基础的构造函数链式调用
    }
    
    // 带初始化的构造函数
    public Weapon(string name, int damage, float attackSpeed, int durability) 
        : this(name, damage, attackSpeed)
    {
        Durability = durability;
    }
}

// 使用示例
Weapon sword1 = new Weapon("Iron Sword", 25, 1.2f);     // 完整参数
Weapon sword2 = new Weapon("Iron Sword", 25);           // 使用默认攻击速度
Weapon sword3 = new Weapon("Iron Sword");               // 使用默认伤害和速度
Weapon sword4 = new Weapon("Iron Sword", 25, 1.2f, 80); // 带耐久度
```

### 析构函数和IDisposable

```csharp
using System;

public class GameResource : IDisposable
{
    private IntPtr nativeResource;  // 假设这是非托管资源
    private int[] managedResource;  // 托管资源
    private bool disposed = false;
    
    public GameResource()
    {
        // 分配资源
        managedResource = new int[1000];
        // nativeResource = AllocateNativeResource();
    }
    
    // 实现IDisposable接口 (推荐方式)
    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);  // 防止析构函数被调用
    }
    
    // 受保护的虚拟方法,允许派生类重写
    protected virtual void Dispose(bool disposing)
    {
        if (!disposed)
        {
            if (disposing)
            {
                // 释放托管资源
                if (managedResource != null)
                {
                    Array.Clear(managedResource, 0, managedResource.Length);
                    managedResource = null;
                }
            }
            
            // 释放非托管资源
            // if (nativeResource != IntPtr.Zero)
            // {
            //     FreeNativeResource(nativeResource);
            //     nativeResource = IntPtr.Zero;
            // }
            
            disposed = true;
        }
    }
    
    // 析构函数 (不推荐,仅作为安全网)
    ~GameResource()
    {
        Dispose(false);
    }
    
    // 确保资源被释放
    public void EnsureResourcesReleased()
    {
        if (!disposed)
        {
            Dispose();
        }
    }
}

// 使用using语句自动释放资源
public class ResourceManager
{
    public void UseResource()
    {
        using (GameResource resource = new GameResource())
        {
            // 使用资源
            // 离开using块时自动调用Dispose()
        }
        // 资源已被释放
    }
}
```

---

## 继承机制

### 基础继承

```csharp
// 基类
public class Character
{
    public string Name { get; set; }
    public int Level { get; set; }
    public int Health { get; set; }
    public int MaxHealth { get; set; }
    
    public Character(string name, int level = 1)
    {
        Name = name;
        Level = level;
        MaxHealth = level * 100;
        Health = MaxHealth;
    }
    
    // 虚方法 (可以被重写)
    public virtual void TakeDamage(int damage)
    {
        Health = Math.Max(0, Health - damage);
        Console.WriteLine($"{Name} took {damage} damage. Health: {Health}");
    }
    
    // 普通方法 (不能被重写)
    public void LevelUp()
    {
        Level++;
        MaxHealth += 100;
        Health = MaxHealth;
        Console.WriteLine($"{Name} leveled up to {Level}!");
    }
    
    // 虚方法 - 攻击
    public virtual void Attack(Character target, int baseDamage)
    {
        int damage = baseDamage + Level * 5;
        target.TakeDamage(damage);
    }
}

// 派生类
public class Warrior : Character
{
    public int Strength { get; set; }
    public int Armor { get; set; }
    
    public Warrior(string name, int level = 1) : base(name, level)
    {
        Strength = level * 10;
        Armor = level * 5;
    }
    
    // 重写虚方法
    public override void TakeDamage(int damage)
    {
        int actualDamage = Math.Max(0, damage - Armor);
        base.TakeDamage(actualDamage);  // 调用基类方法
    }
    
    // 重写攻击方法
    public override void Attack(Character target, int baseDamage)
    {
        int damage = baseDamage + Strength + Level * 5;
        Console.WriteLine($"{Name} swings their sword!");
        target.TakeDamage(damage);
    }
    
    // 新方法
    public void Bash(Character target)
    {
        int damage = Strength * 2;
        target.TakeDamage(damage);
        Console.WriteLine($"{Name} bashed {target.Name} for {damage} damage!");
    }
}

// 另一个派生类
public class Mage : Character
{
    public int Intelligence { get; set; }
    public int Mana { get; set; }
    public int MaxMana { get; set; }
    
    public Mage(string name, int level = 1) : base(name, level)
    {
        Intelligence = level * 8;
        MaxMana = level * 50;
        Mana = MaxMana;
    }
    
    public override void Attack(Character target, int baseDamage)
    {
        if (Mana >= 10)
        {
            int damage = baseDamage + Intelligence * 2;
            Mana -= 10;
            Console.WriteLine($"{Name} casts a fireball!");
            target.TakeDamage(damage);
        }
        else
        {
            Console.WriteLine($"{Name} is out of mana!");
        }
    }
    
    public void Heal(Character target)
    {
        if (Mana >= 15)
        {
            int healAmount = Intelligence * 3;
            target.Health = Math.Min(target.MaxHealth, target.Health + healAmount);
            Mana -= 15;
            Console.WriteLine($"{Name} healed {target.Name} for {healAmount}!");
        }
    }
}
```

### 继承与C++的对比

| 特性 | C++ | C# | 说明 |
|------|-----|-----|------|
| **继承语法** | `class Warrior : public Character` | `class Warrior : Character` | C#更简洁 |
| **虚函数** | `virtual void func()` | `virtual void Func()` | 相似,但C#需要override |
| **重写** | `void func() override` | `override void Func()` | C#需要明确override关键字 |
| **访问基类** | `Base::func()` | `base.Func()` | 语法不同 |
| **多继承** | 支持 | 不支持 | C#只支持单继承 |

### 抽象继承示例

```csharp
// 抽象基类
public abstract class GameEntity
{
    public string Name { get; set; }
    public Vector3 Position { get; set; }
    public bool IsActive { get; set; } = true;
    
    protected GameEntity(string name)
    {
        Name = name;
    }
    
    // 抽象方法 - 必须在派生类中实现
    public abstract void Update(float deltaTime);
    
    // 虚方法 - 可以在派生类中重写
    public virtual void OnEnable()
    {
        Console.WriteLine($"{Name} enabled");
    }
    
    public virtual void OnDisable()
    {
        Console.WriteLine($"{Name} disabled");
    }
    
    // 具体方法 - 所有派生类继承
    public void MoveTo(Vector3 newPosition)
    {
        Position = newPosition;
    }
    
    // 抽象属性
    public abstract float Speed { get; }
}

// 实现抽象类
public class Enemy : GameEntity
{
    public int Damage { get; set; }
    public float AttackRange { get; set; }
    
    public Enemy(string name) : base(name)
    {
        AttackRange = 2.0f;
    }
    
    public override void Update(float deltaTime)
    {
        // AI更新逻辑
        if (IsActive)
        {
            // 寻找玩家
            // 移动
            // 攻击判断
            Console.WriteLine($"{Name} is updating...");
        }
    }
    
    public override float Speed => 3.0f;  // 实现抽象属性
}

// 另一个实现
public class NPC : GameEntity
{
    public string Dialogue { get; set; }
    public bool IsFriendly { get; set; }
    
    public NPC(string name) : base(name)
    {
        IsFriendly = true;
    }
    
    public override void Update(float deltaTime)
    {
        // NPC行为逻辑
        Console.WriteLine($"{Name} is minding their own business...");
    }
    
    public override float Speed => 1.5f;
    
    public void Talk()
    {
        Console.WriteLine(Dialogue);
    }
}
```

---

## 多态性

### 多态基础

```csharp
public class PolymorphismDemo
{
    public static void DemonstratePolymorphism()
    {
        // 创建不同类型的对象
        Character warrior = new Warrior("Conan", 10);
        Character mage = new Mage("Gandalf", 8);
        Character archer = new Archer("Legolas", 7);  // 假设存在Archer类
        
        // 多态数组 - 基类引用指向派生类对象
        Character[] characters = { warrior, mage, archer };
        
        // 多态调用 - 运行时决定调用哪个方法
        foreach (Character character in characters)
        {
            Console.WriteLine($"\n{character.Name} is taking action:");
            character.Attack(warrior, 10);  // 调用各自重写的Attack方法
        }
        
        // 类型检查和转换
        foreach (Character character in characters)
        {
            // as转换 - 失败返回null
            Warrior warriorRef = character as Warrior;
            if (warriorRef != null)
            {
                warriorRef.Bash(mage);  // 只有Warrior有Bash方法
            }
            
            // is检查
            if (character is Mage mageRef)
            {
                mageRef.Heal(character);  // C# 7.0+ 模式匹配
            }
            
            // 传统类型检查
            if (character.GetType() == typeof(Archer))
            {
                Console.WriteLine($"{character.Name} is an Archer");
            }
        }
    }
}
```

### 虚方法和重写

```csharp
public abstract class GameObject
{
    public string Tag { get; set; }
    public bool IsActive { get; set; } = true;
    
    public GameObject(string tag)
    {
        Tag = tag;
    }
    
    // 虚方法 - 可以被重写
    public virtual void Start()
    {
        Console.WriteLine($"{Tag} started");
    }
    
    // 抽象方法 - 必须被重写
    public abstract void Update(float deltaTime);
    
    // 虚方法 - 有默认实现
    public virtual void OnTriggerEnter(GameObject other)
    {
        Console.WriteLine($"{Tag} triggered with {other.Tag}");
    }
    
    // 密封方法 - 不能被进一步重写
    public virtual void OnCollision(GameObject other)
    {
        Console.WriteLine($"{Tag} collided with {other.Tag}");
    }
    
    public sealed override string ToString()
    {
        return $"GameObject: {Tag}";
    }
}

public class PlayerObject : GameObject
{
    public int Score { get; set; }
    public float Speed { get; set; } = 5.0f;
    
    public PlayerObject() : base("Player")
    {
    }
    
    public override void Start()
    {
        base.Start();  // 调用基类方法
        Console.WriteLine("Player controls initialized");
    }
    
    public override void Update(float deltaTime)
    {
        // 处理玩家输入
        // 移动逻辑
        Console.WriteLine($"Player updated with delta: {deltaTime}");
    }
    
    // 重写触发方法
    public override void OnTriggerEnter(GameObject other)
    {
        if (other.Tag == "Coin")
        {
            Score += 10;
            Console.WriteLine($"Player collected coin! Score: {Score}");
        }
        else
        {
            base.OnTriggerEnter(other);  // 调用基类实现
        }
    }
    
    // 重写碰撞方法
    public override void OnCollision(GameObject other)
    {
        base.OnCollision(other);
        // 玩家特定的碰撞处理
        if (other.Tag == "Enemy")
        {
            Console.WriteLine("Player took damage from enemy!");
        }
    }
}

public class EnemyObject : GameObject
{
    public int Health { get; set; } = 100;
    public float AttackPower { get; set; } = 20;
    
    public EnemyObject() : base("Enemy")
    {
    }
    
    public override void Update(float deltaTime)
    {
        // AI逻辑
        Console.WriteLine($"Enemy AI updated with delta: {deltaTime}");
    }
    
    public override void OnTriggerEnter(GameObject other)
    {
        if (other.Tag == "Player")
        {
            Console.WriteLine("Enemy detected player!");
            AttackPlayer(other as PlayerObject);
        }
        else
        {
            base.OnTriggerEnter(other);
        }
    }
    
    private void AttackPlayer(PlayerObject player)
    {
        if (player != null)
        {
            Console.WriteLine($"Enemy attacks player for {AttackPower} damage!");
        }
    }
}
```

### 接口多态

```csharp
// 定义接口
public interface IInteractable
{
    void OnInteract(Player player);
    bool CanInteract(Player player);
}

public interface IMovable
{
    void Move(Vector3 direction);
    float Speed { get; }
}

public interface IDamageable
{
    int Health { get; set; }
    void TakeDamage(int damage);
    bool IsAlive { get; }
}

// 类实现多个接口
public class InteractiveObject : IInteractable, IMovable, IDamageable
{
    public string Name { get; set; }
    public int Health { get; set; } = 100;
    public float Speed { get; set; } = 3.0f;
    
    public InteractiveObject(string name)
    {
        Name = name;
    }
    
    // 实现IInteractable
    public void OnInteract(Player player)
    {
        Console.WriteLine($"{player.Name} interacts with {Name}");
    }
    
    public bool CanInteract(Player player)
    {
        return Health > 0 && Vector3.Distance(player.Position, this.Position) < 3.0f;
    }
    
    // 实现IMovable
    public void Move(Vector3 direction)
    {
        // 移动逻辑
        this.Position += direction * Speed * Time.deltaTime;
    }
    
    // 实现IDamageable
    public void TakeDamage(int damage)
    {
        Health -= damage;
        if (Health <= 0)
        {
            Health = 0;
            Console.WriteLine($"{Name} has been destroyed!");
        }
    }
    
    public bool IsAlive => Health > 0;
    
    // 类特有的属性
    public Vector3 Position { get; set; }
}

// 多态使用示例
public class InterfacePolymorphism
{
    public static void Demonstrate()
    {
        InteractiveObject obj = new InteractiveObject("Chest");
        Player player = new Player("Hero");
        
        // 通过不同接口引用同一对象
        IInteractable interactable = obj;
        IMovable movable = obj;
        IDamageable damageable = obj;
        
        // 多态调用
        if (interactable.CanInteract(player))
        {
            interactable.OnInteract(player);
        }
        
        movable.Move(new Vector3(1, 0, 0));
        damageable.TakeDamage(25);
        
        Console.WriteLine($"Health after damage: {damageable.Health}");
    }
}
```

---

## 抽象类和接口

### 抽象类详解

```csharp
// 抽象类 - 不能直接实例化
public abstract class GameCharacter
{
    // 具体字段
    protected string name;
    protected int level;
    protected int health;
    
    // 属性
    public string Name => name;
    public int Level 
    { 
        get => level;
        protected set => level = Math.Max(1, value);
    }
    public int Health 
    { 
        get => health;
        set => health = Math.Clamp(value, 0, MaxHealth);
    }
    
    // 抽象属性 - 必须在派生类中实现
    public abstract int MaxHealth { get; }
    public abstract float MoveSpeed { get; }
    
    // 构造函数
    protected GameCharacter(string name, int level = 1)
    {
        this.name = name;
        this.level = level;
        this.health = MaxHealth;  // 使用抽象属性
    }
    
    // 具体方法 - 所有派生类继承
    public void LevelUp()
    {
        Level++;
        Health = MaxHealth;  // 满血升级
        Console.WriteLine($"{Name} leveled up to {Level}!");
    }
    
    // 虚方法 - 可以在派生类中重写
    public virtual void TakeDamage(int damage)
    {
        Health -= damage;
        Console.WriteLine($"{Name} took {damage} damage. Health: {Health}");
    }
    
    // 抽象方法 - 必须在派生类中实现
    public abstract void Attack(GameCharacter target);
    
    // 抽象方法 - 移动
    public abstract void Move(Vector3 direction);
    
    // 具体方法 - 检查是否存活
    public bool IsAlive() => Health > 0;
    
    // 虚方法 - 特殊技能
    public virtual void UseSpecialAbility()
    {
        Console.WriteLine($"{Name} used a basic ability");
    }
}

// 具体实现类
public class Knight : GameCharacter
{
    public int Armor { get; set; }
    public int ShieldPower { get; set; }
    
    public Knight(string name, int level = 1) : base(name, level)
    {
        Armor = level * 5;
        ShieldPower = level * 3;
    }
    
    public override int MaxHealth => Level * 120;  // 实现抽象属性
    public override float MoveSpeed => 3.0f;
    
    public override void Attack(GameCharacter target)
    {
        int damage = Level * 15 + Armor / 2;
        Console.WriteLine($"{Name} attacks with sword for {damage} damage!");
        target.TakeDamage(damage);
    }
    
    public override void Move(Vector3 direction)
    {
        // 骑士移动逻辑
        Console.WriteLine($"{Name} moves slowly with armor");
    }
    
    public override void TakeDamage(int damage)
    {
        int reducedDamage = Math.Max(0, damage - Armor / 3);
        base.TakeDamage(reducedDamage);
    }
    
    public override void UseSpecialAbility()
    {
        Console.WriteLine($"{Name} raises shield, reducing damage by {ShieldPower}!");
    }
}

public class Archer : GameCharacter
{
    public int Agility { get; set; }
    public float AttackRange { get; set; } = 10f;
    
    public Archer(string name, int level = 1) : base(name, level)
    {
        Agility = level * 8;
    }
    
    public override int MaxHealth => Level * 80;
    public override float MoveSpeed => 5.0f;
    
    public override void Attack(GameCharacter target)
    {
        int damage = Level * 12 + Agility / 2;
        Console.WriteLine($"{Name} shoots arrow at {target.Name} for {damage} damage!");
        
        // 检查距离
        float distance = Vector3.Distance(this.Position, target.Position);
        if (distance > AttackRange)
        {
            Console.WriteLine("Target is too far!");
            return;
        }
        
        target.TakeDamage(damage);
    }
    
    public override void Move(Vector3 direction)
    {
        Console.WriteLine($"{Name} moves quickly with bow ready");
    }
    
    public override void UseSpecialAbility()
    {
        Console.WriteLine($"{Name} performs a critical shot!");
    }
    
    public Vector3 Position { get; set; } = Vector3.zero;
}
```

### 接口详解

```csharp
// 单一职责接口
public interface IAttackable
{
    void Attack(IDamageable target, int baseDamage);
    int AttackPower { get; }
}

public interface IDamageable
{
    int Health { get; set; }
    int MaxHealth { get; }
    void TakeDamage(int damage);
    bool IsAlive { get; }
}

public interface IMovable
{
    Vector3 Position { get; set; }
    float Speed { get; }
    void Move(Vector3 direction);
    void Rotate(float angle);
}

public interface ICollectable
{
    string ItemName { get; }
    int Value { get; }
    void OnCollected(GameObject collector);
}

// 接口继承
public interface IGameEntity : IMovable, IDamageable
{
    string Tag { get; set; }
    bool IsActive { get; set; }
    void Initialize();
    void Update(float deltaTime);
}

// 接口实现示例
public class GameItem : ICollectable
{
    public string ItemName { get; private set; }
    public int Value { get; private set; }
    public string ItemType { get; private set; }
    
    public GameItem(string name, int value, string type)
    {
        ItemName = name;
        Value = value;
        ItemType = type;
    }
    
    public void OnCollected(GameObject collector)
    {
        Console.WriteLine($"{collector.Name} collected {ItemName} worth {Value} points!");
        
        // 根据物品类型执行不同逻辑
        switch (ItemType)
        {
            case "HealthPotion":
                // 恢复生命
                break;
            case "Coin":
                // 增加金币
                break;
            case "Key":
                // 解锁功能
                break;
        }
    }
}

// 复杂类实现多个接口
public class PlayerCharacter : IGameEntity, IAttackable
{
    public string Tag { get; set; } = "Player";
    public bool IsActive { get; set; } = true;
    public Vector3 Position { get; set; } = Vector3.zero;
    public float Speed { get; } = 5.0f;
    public int Health { get; set; } = 100;
    public int MaxHealth { get; } = 100;
    public int AttackPower { get; set; } = 25;
    public string Name { get; set; }
    
    public PlayerCharacter(string name)
    {
        Name = name;
    }
    
    // IGameEntity 实现
    public void Initialize()
    {
        Console.WriteLine($"Player {Name} initialized at {Position}");
    }
    
    public void Update(float deltaTime)
    {
        // 玩家更新逻辑
        HandleInput();
    }
    
    // IMovable 实现
    public void Move(Vector3 direction)
    {
        Position += direction * Speed * Time.deltaTime;
    }
    
    public void Rotate(float angle)
    {
        // 旋转逻辑
    }
    
    // IDamageable 实现
    public void TakeDamage(int damage)
    {
        Health = Math.Max(0, Health - damage);
        Console.WriteLine($"Player took {damage} damage. Health: {Health}");
    }
    
    public bool IsAlive => Health > 0;
    
    // IAttackable 实现
    public void Attack(IDamageable target, int baseDamage)
    {
        Console.WriteLine($"{Name} attacks target!");
        target.TakeDamage(baseDamage + AttackPower);
    }
    
    // 私有方法
    private void HandleInput()
    {
        // 处理玩家输入
    }
}
```

### 接口 vs 抽象类对比

```csharp
// 接口 - 定义契约
public interface IWeapon
{
    int Damage { get; }
    float AttackSpeed { get; }
    void Use(ICharacter target);
}

// 抽象类 - 提供部分实现
public abstract class WeaponBase
{
    public string Name { get; protected set; }
    public int Damage { get; protected set; }
    public float AttackSpeed { get; protected set; }
    public int Durability { get; protected set; }
    
    protected WeaponBase(string name, int damage, float speed)
    {
        Name = name;
        Damage = damage;
        AttackSpeed = speed;
        Durability = 100;
    }
    
    // 具体方法 - 所有武器共享
    public void ReduceDurability(int amount)
    {
        Durability = Math.Max(0, Durability - amount);
        if (Durability <= 0)
        {
            Console.WriteLine($"{Name} has broken!");
        }
    }
    
    // 抽象方法 - 每种武器实现不同
    public abstract void Use(ICharacter target);
    
    // 虚方法 - 可以重写
    public virtual bool IsUsable()
    {
        return Durability > 0;
    }
}

// 具体武器实现
public class Sword : WeaponBase, IWeapon
{
    public int Sharpness { get; set; }
    
    public Sword(string name, int damage) : base(name, damage, 1.2f)
    {
        Sharpness = 10;
    }
    
    public void IWeapon.Use(ICharacter target)  // 显式接口实现
    {
        Use(target);
    }
    
    public override void Use(ICharacter target)
    {
        if (IsUsable())
        {
            int actualDamage = Damage + Sharpness;
            target.TakeDamage(actualDamage);
            ReduceDurability(5);
            Console.WriteLine($"Slash with {Name} for {actualDamage} damage!");
        }
    }
}

public class Bow : WeaponBase
{
    public float Range { get; set; } = 20f;
    
    public Bow(string name, int damage) : base(name, damage, 0.8f)
    {
        Range = 20f;
    }
    
    public override void Use(ICharacter target)
    {
        if (IsUsable())
        {
            // 检查距离
            float distance = Vector3.Distance(this.Position, target.Position);
            if (distance <= Range)
            {
                target.TakeDamage(Damage);
                ReduceDurability(2);
                Console.WriteLine($"Shoot arrow with {Name} for {Damage} damage!");
            }
            else
            {
                Console.WriteLine("Target is too far!");
            }
        }
    }
    
    public Vector3 Position { get; set; }
}
```

---

## 访问修饰符

### 访问修饰符详解

```csharp
public class AccessModifiersDemo
{
    // public: 任何地方都可以访问
    public int PublicField = 1;
    public void PublicMethod() { }
    
    // private: 只能在本类内部访问 (默认)
    private int PrivateField = 2;
    private void PrivateMethod() { }
    
    // protected: 本类和派生类可以访问
    protected int ProtectedField = 3;
    protected void ProtectedMethod() { }
    
    // internal: 同一程序集内可以访问
    internal int InternalField = 4;
    internal void InternalMethod() { }
    
    // protected internal: 同一程序集内或派生类可以访问
    protected internal int ProtectedInternalField = 5;
    
    // private protected: 本类或同一程序集内的派生类可以访问 (C# 7.2+)
    private protected int PrivateProtectedField = 6;
    
    public void AccessDemo()
    {
        // 在本类内部可以访问所有成员 (除了其他实例的private)
        Console.WriteLine($"Public: {PublicField}");
        Console.WriteLine($"Private: {PrivateField}");
        Console.WriteLine($"Protected: {ProtectedField}");
        Console.WriteLine($"Internal: {InternalField}");
    }
}

// 派生类可以访问protected成员
public class DerivedClass : AccessModifiersDemo
{
    public void DerivedAccessDemo()
    {
        // 可以访问protected成员
        Console.WriteLine($"Protected: {ProtectedField}");
        Console.WriteLine($"Protected Internal: {ProtectedInternalField}");
        
        // 不能访问private成员
        // Console.WriteLine(PrivateField); // 编译错误
    }
}

// 不同程序集中的类
public class ExternalClass
{
    public void ExternalAccessDemo()
    {
        AccessModifiersDemo demo = new AccessModifiersDemo();
        
        // 只能访问public成员
        Console.WriteLine($"Public: {demo.PublicField}");
        
        // 不能访问非public成员
        // Console.WriteLine(demo.PrivateField); // 编译错误
        // Console.WriteLine(demo.ProtectedField); // 编译错误
    }
}
```

### 封装示例

```csharp
public class BankAccount
{
    // 私有字段 - 存储实际数据
    private decimal balance;
    private string accountNumber;
    private DateTime createdDate;
    
    // 只读属性 - 外部可以读取但不能直接修改
    public string AccountNumber => accountNumber;
    public DateTime CreatedDate => createdDate;
    public DateTime LastModified { get; private set; }
    
    // 公共属性 - 带验证的访问
    public decimal Balance 
    { 
        get => balance;
        private set  // 只有本类可以修改
        {
            balance = value;
            LastModified = DateTime.Now;
        }
    }
    
    // 可读写属性
    public string OwnerName { get; set; }
    public string BankName { get; set; }
    
    public BankAccount(string accountNumber, string ownerName, decimal initialBalance = 0)
    {
        this.accountNumber = accountNumber;
        this.OwnerName = ownerName;
        this.balance = Math.Max(0, initialBalance);
        this.createdDate = DateTime.Now;
        this.LastModified = DateTime.Now;
    }
    
    // 公共方法 - 控制访问
    public bool Deposit(decimal amount)
    {
        if (amount > 0)
        {
            Balance += amount;
            LogTransaction("Deposit", amount);
            return true;
        }
        return false;
    }
    
    public bool Withdraw(decimal amount)
    {
        if (amount > 0 && balance >= amount)
        {
            Balance -= amount;
            LogTransaction("Withdrawal", -amount);
            return true;
        }
        return false;
    }
    
    // 内部方法 - 只有本类使用
    private void LogTransaction(string type, decimal amount)
    {
        Console.WriteLine($"[{DateTime.Now}] {type}: {amount:C} | Balance: {Balance:C}");
    }
    
    // 受保护方法 - 派生类可以访问
    protected void InternalTransfer(decimal amount, BankAccount target)
    {
        if (this.Withdraw(amount))
        {
            target.Deposit(amount);
        }
    }
}

// 使用示例
public class BankingDemo
{
    public static void Demonstrate()
    {
        BankAccount account = new BankAccount("12345", "John Doe", 1000);
        
        Console.WriteLine($"Account: {account.AccountNumber}");
        Console.WriteLine($"Owner: {account.OwnerName}");
        Console.WriteLine($"Balance: {account.Balance:C}");
        
        account.Deposit(500);
        account.Withdraw(200);
        
        Console.WriteLine($"Final Balance: {account.Balance:C}");
        
        // 以下操作是不允许的:
        // account.Balance = 9999;  // 编译错误 - Balance的setter是private
        // account.accountNumber = "67890";  // 编译错误 - accountNumber是private字段
    }
}
```

---

## C#与C++ OOP差异总结

### 1. 继承机制

**C++**:
```cpp
class Character {
public:
    virtual void Attack() = 0;  // 纯虚函数
    virtual ~Character() {}      // 虚析构函数
};

class Warrior : public Character {
public:
    void Attack() override { }  // 重写
};
```

**C#**:
```csharp
public abstract class Character {
    public abstract void Attack();  // 抽象方法
}

public class Warrior : Character {
    public override void Attack() { }  // 重写,必须使用override
}
```

### 2. 访问控制

**C++**:
```cpp
class GameEntity {
private:
    int health;
protected:
    int level;
public:
    int score;
};
```

**C#**:
```csharp
public class GameEntity {
    private int health;     // 或使用默认访问级别
    protected int level;
    public int Score { get; set; }  // 属性而非字段
}
```

### 3. 多重继承

**C++**: 支持多重继承
```cpp
class Flying : public Character, public IMovable { ... };
```

**C#**: 不支持多重继承,但支持多接口实现
```csharp
public class Flying : Character, IMovable, IFlyable { ... };
```

### 4. 析构和资源管理

**C++**:
```cpp
class GameResource {
public:
    ~GameResource() {  // 析构函数
        // 清理资源
    }
};
```

**C#**:
```csharp
public class GameResource : IDisposable {
    ~GameResource() {  // 析构函数(终结器)
        // 仅作为安全网
    }
    
    public void Dispose() {  // 实现IDisposable
        // 清理资源
    }
}
```

### 5. 属性系统

**C++**: 需要手动实现getter/setter
```cpp
class Player {
private:
    int health;
public:
    int GetHealth() const { return health; }
    void SetHealth(int h) { health = h; }
};
```

**C#**: 内置属性系统
```csharp
public class Player {
    public int Health { get; set; }  // 自动实现
    public int MaxHealth { get; private set; }  // 私有setter
}
```

---

## 实践练习

### 练习1: 游戏单位层次结构

```csharp
// 游戏单位基类
public abstract class Unit
{
    public string Name { get; set; }
    public Vector3 Position { get; set; }
    public float Health { get; set; }
    public float MaxHealth { get; protected set; }
    public float Speed { get; set; }
    public int Level { get; set; }
    public bool IsAlive => Health > 0;
    
    protected Unit(string name, float maxHealth, float speed, int level = 1)
    {
        Name = name;
        MaxHealth = maxHealth;
        Health = maxHealth;
        Speed = speed;
        Level = level;
    }
    
    public abstract void Attack(Unit target);
    public virtual void TakeDamage(float damage)
    {
        Health = Math.Max(0, Health - damage);
        if (!IsAlive)
        {
            OnDeath();
        }
    }
    
    protected virtual void OnDeath()
    {
        Console.WriteLine($"{Name} has been defeated!");
    }
    
    public virtual void Move(Vector3 direction)
    {
        Position += direction * Speed * Time.deltaTime;
    }
}

// 具体单位类型
public class Soldier : Unit
{
    public float AttackPower { get; set; }
    public float AttackRange { get; set; }
    
    public Soldier(string name, int level = 1) : base(name, 100, 3.0f, level)
    {
        AttackPower = level * 15;
        AttackRange = 2.0f;
    }
    
    public override void Attack(Unit target)
    {
        if (Vector3.Distance(Position, target.Position) <= AttackRange)
        {
            target.TakeDamage(AttackPower);
            Console.WriteLine($"{Name} attacks {target.Name} for {AttackPower} damage!");
        }
        else
        {
            Console.WriteLine($"{Name} is too far from {target.Name}!");
        }
    }
}

public class Archer : Unit
{
    public float AttackPower { get; set; }
    public float AttackRange { get; set; } = 10.0f;
    public int ArrowCount { get; set; } = 20;
    
    public Archer(string name, int level = 1) : base(name, 70, 4.0f, level)
    {
        AttackPower = level * 12;
    }
    
    public override void Attack(Unit target)
    {
        if (ArrowCount <= 0)
        {
            Console.WriteLine($"{Name} is out of arrows!");
            return;
        }
        
        if (Vector3.Distance(Position, target.Position) <= AttackRange)
        {
            target.TakeDamage(AttackPower);
            ArrowCount--;
            Console.WriteLine($"{Name} shoots {target.Name} for {AttackPower} damage! Arrows left: {ArrowCount}");
        }
        else
        {
            Console.WriteLine($"{Name} is too far from {target.Name}!");
        }
    }
    
    public void Reload()
    {
        ArrowCount = 20;
        Console.WriteLine($"{Name} reloaded arrows!");
    }
}

// 游戏管理器
public class GameManager
{
    private List<Unit> units = new List<Unit>();
    
    public void AddUnit(Unit unit)
    {
        units.Add(unit);
    }
    
    public void Update(float deltaTime)
    {
        // 多态更新
        foreach (Unit unit in units)
        {
            if (unit.IsAlive)
            {
                unit.Move(new Vector3(1, 0, 0));  // 简单移动AI
            }
        }
    }
    
    public void Battle(Unit attacker, Unit defender)
    {
        if (attacker.IsAlive && defender.IsAlive)
        {
            attacker.Attack(defender);
            
            // 如果弓箭手,可能需要特殊处理
            if (attacker is Archer archer && archer.ArrowCount <= 0)
            {
                Console.WriteLine($"{archer.Name} needs to reload!");
            }
        }
    }
}
```

### 练习2: 装备系统

```csharp
// 装备接口
public interface IEquipment
{
    string Name { get; }
    int LevelRequirement { get; }
    EquipmentType Type { get; }
    void Equip(Character character);
    void UnEquip(Character character);
    bool CanEquip(Character character);
}

public enum EquipmentType
{
    Weapon,
    Armor,
    Accessory
}

// 抽象装备类
public abstract class Equipment : IEquipment
{
    public string Name { get; protected set; }
    public int LevelRequirement { get; protected set; }
    public EquipmentType Type { get; protected set; }
    public int Value { get; protected set; }
    public bool IsEquipped { get; private set; }
    
    protected Equipment(string name, int levelReq, EquipmentType type, int value)
    {
        Name = name;
        LevelRequirement = levelReq;
        Type = type;
        Value = value;
    }
    
    public virtual bool CanEquip(Character character)
    {
        return character.Level >= LevelRequirement && !IsEquipped;
    }
    
    public abstract void Equip(Character character);
    public abstract void UnEquip(Character character);
}

// 武器装备
public class Weapon : Equipment
{
    public int AttackPower { get; private set; }
    public float AttackSpeed { get; private set; }
    
    public Weapon(string name, int levelReq, int attackPower, float attackSpeed) 
        : base(name, levelReq, EquipmentType.Weapon, attackPower * 10)
    {
        AttackPower = attackPower;
        AttackSpeed = attackSpeed;
    }
    
    public override void Equip(Character character)
    {
        if (CanEquip(character))
        {
            character.AddAttackPower(AttackPower);
            character.AddAttackSpeed(AttackSpeed);
            IsEquipped = true;
            Console.WriteLine($"{character.Name} equipped {Name}");
        }
    }
    
    public override void UnEquip(Character character)
    {
        character.SubtractAttackPower(AttackPower);
        character.SubtractAttackSpeed(AttackSpeed);
        IsEquipped = false;
        Console.WriteLine($"{character.Name} unequipped {Name}");
    }
}

// 防具装备
public class Armor : Equipment
{
    public int Defense { get; private set; }
    public int MaxHealthBonus { get; private set; }
    
    public Armor(string name, int levelReq, int defense, int healthBonus) 
        : base(name, levelReq, EquipmentType.Armor, defense * 8)
    {
        Defense = defense;
        MaxHealthBonus = healthBonus;
    }
    
    public override void Equip(Character character)
    {
        if (CanEquip(character))
        {
            character.AddDefense(Defense);
            character.AddMaxHealth(MaxHealthBonus);
            IsEquipped = true;
            Console.WriteLine($"{character.Name} equipped {Name}");
        }
    }
    
    public override void UnEquip(Character character)
    {
        character.SubtractDefense(Defense);
        character.SubtractMaxHealth(MaxHealthBonus);
        IsEquipped = false;
        Console.WriteLine($"{character.Name} unequipped {Name}");
    }
}

// 角色类
public class Character
{
    public string Name { get; set; }
    public int Level { get; set; }
    public float Health { get; set; }
    public float MaxHealth { get; private set; }
    public int AttackPower { get; private set; }
    public float AttackSpeed { get; private set; }
    public int Defense { get; private set; }
    
    private List<IEquipment> equipment = new List<IEquipment>();
    
    public Character(string name, int level = 1)
    {
        Name = name;
        Level = level;
        MaxHealth = level * 100;
        Health = MaxHealth;
        AttackPower = level * 10;
        AttackSpeed = 1.0f;
        Defense = level * 2;
    }
    
    // 装备管理
    public bool EquipItem(IEquipment item)
    {
        if (item.CanEquip(this))
        {
            if (HasEquipmentOfType(item.Type))
            {
                UnequipItemOfType(item.Type);
            }
            
            item.Equip(this);
            equipment.Add(item);
            return true;
        }
        return false;
    }
    
    public void UnequipItem(IEquipment item)
    {
        if (equipment.Contains(item))
        {
            item.UnEquip(this);
            equipment.Remove(item);
        }
    }
    
    private bool HasEquipmentOfType(EquipmentType type)
    {
        return equipment.Any(e => e.Type == type);
    }
    
    private void UnequipItemOfType(EquipmentType type)
    {
        IEquipment existing = equipment.FirstOrDefault(e => e.Type == type);
        if (existing != null)
        {
            UnequipItem(existing);
        }
    }
    
    // 属性修改方法
    public void AddAttackPower(int amount) => AttackPower += amount;
    public void AddAttackSpeed(float amount) => AttackSpeed += amount;
    public void AddDefense(int amount) => Defense += amount;
    public void AddMaxHealth(int amount)
    {
        MaxHealth += amount;
        Health += amount;  // 装备时增加当前生命值
    }
    
    public void SubtractAttackPower(int amount) => AttackPower = Math.Max(0, AttackPower - amount);
    public void SubtractAttackSpeed(float amount) => AttackSpeed = Math.Max(0.1f, AttackSpeed - amount);
    public void SubtractDefense(int amount) => Defense = Math.Max(0, Defense - amount);
    public void SubtractMaxHealth(int amount)
    {
        MaxHealth = Math.Max(1, MaxHealth - amount);
        Health = Math.Min(Health, MaxHealth);
    }
}

// 使用示例
public class EquipmentDemo
{
    public static void Run()
    {
        Character player = new Character("Hero", 10);
        Weapon sword = new Weapon("Magic Sword", 5, 50, 1.2f);
        Armor chestplate = new Armor("Dragon Chestplate", 8, 30, 150);
        
        Console.WriteLine($"初始攻击力: {player.AttackPower}, 生命值: {player.MaxHealth}");
        
        // 装备武器
        if (player.EquipItem(sword))
        {
            Console.WriteLine($"装备后攻击力: {player.AttackPower}");
        }
        
        // 装备防具
        if (player.EquipItem(chestplate))
        {
            Console.WriteLine($"装备后生命值: {player.MaxHealth}, 防御力: {player.Defense}");
        }
    }
}
```

---

## 常见错误和最佳实践

### 1. 避免过度继承

```csharp
// 错误: 过深的继承层次
public class GameObject { }
public class LivingObject : GameObject { }
public class Character : LivingObject { }
public class Player : Character { }
public class Warrior : Player { }  // 继承层次过深

// 正确: 使用组合而非继承
public class Warrior
{
    public CharacterBase Base { get; set; }
    public CombatSystem Combat { get; set; }
    public EquipmentSystem Equipment { get; set; }
}
```

### 2. 正确使用虚方法

```csharp
public class GameEntity
{
    // 正确: 为可能被重写的提供虚方法
    public virtual void Update(float deltaTime)
    {
        // 基础更新逻辑
    }
    
    // 正确: 为必须被重写的提供抽象方法
    public abstract void Initialize();
    
    // 正确: 为不应该被重写的提供密封方法
    public virtual void CriticalSystem()
    {
        // 关键系统逻辑
    }
    
    public sealed override string ToString()
    {
        return $"GameEntity: {this.GetType().Name}";
    }
}
```

### 3. 接口设计原则

```csharp
// 正确: 遵循接口隔离原则
public interface IMovable { void Move(Vector3 direction); }
public interface IAttackable { void Attack(IDamageable target); }
public interface IDamageable { void TakeDamage(int damage); }

// 而不是: 大而全的接口
// public interface IGameCharacter { void Move(); void Attack(); void TakeDamage(); ... }
```

---

## 总结

本章我们深入学习了C#的面向对象编程:

✅ **类和对象**: 类定义、对象创建、部分类、静态类  
✅ **属性和字段**: 自动属性、完整属性、只读属性、索引器  
✅ **构造函数**: 多种构造函数、构造函数链、资源管理  
✅ **继承机制**: 单继承、基类访问、构造函数链  
✅ **多态性**: 虚方法、重写、接口多态  
✅ **抽象类和接口**: 抽象类设计、接口实现、多重接口  
✅ **访问修饰符**: 各种访问级别、封装实践  

C#的面向对象特性比C++更加安全和易用,提供了更好的封装性、更清晰的继承关系和更灵活的多态机制。

---

## 下一步

继续学习 [04. LINQ和集合框架](04-linq.md) →
