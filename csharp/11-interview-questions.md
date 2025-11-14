# 11. 面试题

> Unity C# 游戏开发面试题精讲 - 40+ 高频面试题及详细解答

---

## 📌 本章导航

- [C# 基础题](#c-基础题)
- [Unity 开发题](#unity-开发题)
- [游戏开发题](#游戏开发题)
- [系统设计题](#系统设计题)
- [算法题（游戏开发相关）](#算法题游戏开发相关)

---

## C# 基础题

### 1. C# 中值类型和引用类型的区别是什么？

**答案：**

值类型（Value Types）和引用类型（Reference Types）是C#中两种基本的数据类型分类，它们在内存分配、赋值行为和性能特征方面有显著差异：

**值类型：**
- 存储在栈（stack）上（局部变量）或作为对象的字段时存储在堆上
- 赋值时复制整个值
- 包括：int、float、double、bool、char、struct、enum等
- 默认值为0或false

```csharp
int x = 10;
int y = x;  // y获得x的副本，改变y不影响x
y = 20;
Console.WriteLine($"x: {x}, y: {y}"); // 输出: x: 10, y: 20
```

**引用类型：**
- 存储在堆（heap）上
- 变量存储的是对象在堆中的地址
- 赋值时复制引用（地址），不复制对象本身
- 包括：class、interface、delegate、array等

```csharp
List<int> list1 = new List<int> { 1, 2, 3 };
List<int> list2 = list1;  // list2指向同一个对象
list2.Add(4);
Console.WriteLine($"list1: {string.Join(",", list1)}"); // 输出: 1,2,3,4
Console.WriteLine($"list2: {string.Join(",", list2)}"); // 输出: 1,2,3,4
```

**性能考虑：**
- 值类型：栈分配/释放速度快，但大结构体会影响性能
- 引用类型：堆分配有GC压力，但适合大型对象和共享数据

### 2. 解释C#中的装箱和拆箱，以及它们的性能影响

**答案：**

装箱（Boxing）和拆箱（Unboxing）是值类型和引用类型之间转换的过程：

**装箱：** 将值类型转换为引用类型（object或接口）
- 在堆上创建对象
- 将值类型的数据复制到堆对象中
- 返回堆对象的引用

**拆箱：** 将引用类型转换回值类型
- 验证引用是否为有效的装箱值类型
- 从堆对象中复制值到栈上

```csharp
// 装箱示例
int i = 42;
object obj = i;  // 装箱：在堆上创建object，复制i的值

// 拆箱示例
int j = (int)obj;  // 拆箱：将obj转换回int，复制值到栈

// 性能问题示例
List<object> list = new List<object>();
for (int k = 0; k < 1000; k++)
{
    list.Add(k);  // 每次都发生装箱，性能差
}

// 性能优化示例
List<int> intList = new List<int>();
for (int k = 0; k < 1000; k++)
{
    intList.Add(k);  // 不发生装箱，性能好
}
```

**性能影响：**
- 装箱：堆分配、内存复制、GC压力
- 拆箱：类型检查、内存复制
- 频繁的装箱拆箱会严重影响性能

**避免方法：**
- 使用泛型避免装箱
- 使用struct而不是class（对于小对象）
- 使用Span<T>、Memory<T>等高性能集合

### 3. C#中ref、out、in参数修饰符的区别是什么？

**答案：**

这三个关键字用于控制方法参数的传递方式：

**ref（引用传递）：**
- 参数必须在传递前初始化
- 方法可以读取和修改参数值
- 修改会影响原始变量

```csharp
void ModifyValue(ref int value)
{
    value = value * 2;  // 可以修改
}

int num = 5;
ModifyValue(ref num);
Console.WriteLine(num);  // 输出: 10
```

**out（输出参数）：**
- 参数在方法内部必须被赋值
- 调用时不需要初始化
- 通常用于返回多个值

```csharp
bool TryParseInt(string input, out int result)
{
    // result必须在方法返回前被赋值
    if (int.TryParse(input, out result))
    {
        return true;
    }
    result = 0;  // 确保被赋值
    return false;
}

if (TryParseInt("123", out int number))
{
    Console.WriteLine(number);  // 输出: 123
}
```

**in（输入参数，C# 7.2+）：**
- 传递引用但参数为只读
- 避免大结构体的复制开销
- 方法内部不能修改参数

```csharp
struct LargeStruct
{
    public int[] data;
    public string description;
    
    public LargeStruct(int size, string desc)
    {
        data = new int[size];
        description = desc;
    }
}

void ProcessStruct(in LargeStruct ls)  // 传递引用，避免复制
{
    Console.WriteLine(ls.description);
    // ls.data[0] = 10;  // 错误：不能修改
}
```

### 4. 解释C#中的委托（Delegate）和事件（Event）的区别

**答案：**

**委托（Delegate）：**
- 类型安全的函数指针
- 可以指向一个或多个方法（多播委托）
- 可以在类外部直接调用

```csharp
// 声明委托
public delegate void NumberChangedHandler(int newNumber);

public class NumberChanger
{
    // 声明委托变量
    public NumberChangedHandler OnNumberChanged;

    private int number;
    
    public int Number
    {
        get { return number; }
        set
        {
            number = value;
            // 直接调用委托
            OnNumberChanged?.Invoke(number);
        }
    }
}

// 使用
NumberChanger changer = new NumberChanger();
changer.OnNumberChanged += (n) => Console.WriteLine($"Number changed to: {n}");
changer.Number = 42;  // 输出: Number changed to: 42
```

**事件（Event）：**
- 基于委托的封装
- 提供更好的封装性
- 只能在类内部触发，外部只能订阅/取消订阅

```csharp
public class NumberPublisher
{
    // 声明事件
    public event System.Action<int> NumberChanged;

    private int number;
    
    public int Number
    {
        get { return number; }
        set
        {
            number = value;
            // 只能在类内部触发事件
            NumberChanged?.Invoke(number);
        }
    }
    
    // 外部无法直接调用NumberChanged()，只能通过属性设置触发
}

// 使用
NumberPublisher publisher = new NumberPublisher();
publisher.NumberChanged += (n) => Console.WriteLine($"Number changed to: {n}");
publisher.Number = 42;  // 输出: Number changed to: 42

// publisher.NumberChanged(100);  // 错误：无法在外部直接调用事件
```

**主要区别：**
- 封装性：事件提供更好的封装
- 调用权限：委托可在外部直接调用，事件只能在内部触发
- 使用场景：事件更适合发布-订阅模式

### 5. 解释C#中的async/await异步编程模型

**答案：**

async/await是C#中实现异步编程的语法糖，基于Task和Task<T>类型：

**基本语法：**
- 方法标记为async
- 使用await关键字等待异步操作
- 返回Task或Task<T>

```csharp
// 异步方法示例
public async Task<string> DownloadDataAsync(string url)
{
    using (HttpClient client = new HttpClient())
    {
        // await使方法异步等待，不阻塞线程
        string result = await client.GetStringAsync(url);
        return result;
    }
}

// 调用异步方法
public async Task ProcessDataAsync()
{
    string data = await DownloadDataAsync("https://api.example.com/data");
    Console.WriteLine($"Received: {data.Length} characters");
}

// 并行执行多个异步操作
public async Task ProcessMultipleAsync()
{
    Task<string> task1 = DownloadDataAsync("https://api1.com");
    Task<string> task2 = DownloadDataAsync("https://api2.com");
    
    // 并行执行
    string[] results = await Task.WhenAll(task1, task2);
    Console.WriteLine($"Results: {results[0]}, {results[1]}");
}
```

**状态机：**
- 编译器生成状态机来管理异步操作
- 将异步方法分解为多个步骤
- 每个await点都是一个状态转换

**常见陷阱：**
- 避免async void（除了事件处理器）
- 避免在同步方法中使用.Result或.Wait()
- 正确处理异常

```csharp
// 错误示例
public async void BadMethod()  // 应该返回Task
{
    await SomeAsyncMethod();
}

// 正确示例
public async Task GoodMethod()
{
    await SomeAsyncMethod();
}

// 避免阻塞异步方法
public void SynchronousMethod()
{
    // 错误：可能导致死锁
    // string result = DownloadDataAsync("url").Result;
    
    // 正确：异步调用
    ProcessDataAsync();
}
```

### 6. 解释C#中的LINQ查询语法和方法语法

**答案：**

LINQ（Language Integrated Query）提供统一的查询语法来查询各种数据源：

**查询语法：**
- 类似SQL的语法
- 使用from、where、select等关键字
- 更直观易读

```csharp
List<int> numbers = new List<int> { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };

// 查询语法
var evenNumbers = from n in numbers
                  where n % 2 == 0
                  select n * 2;

foreach (int num in evenNumbers)
{
    Console.WriteLine(num);  // 输出: 4, 8, 12, 16, 20
}
```

**方法语法：**
- 使用扩展方法链
- 更灵活，可与Lambda表达式结合
- 功能更强大

```csharp
// 方法语法
var evenNumbers = numbers
    .Where(n => n % 2 == 0)
    .Select(n => n * 2);

// 复杂查询示例
var query = numbers
    .Where(n => n > 2)
    .OrderByDescending(n => n)
    .Take(3)
    .ToList();
```

**转换关系：**
查询语法在编译时转换为方法语法：

```csharp
// 查询语法
var query1 = from n in numbers
             where n > 5
             select n;

// 等价的方法语法
var query2 = numbers.Where(n => n > 5).Select(n => n);
```

**常用LINQ方法：**
- Where: 过滤
- Select: 投影
- OrderBy/ThenBy: 排序
- GroupBy: 分组
- Join: 连接
- Aggregate: 聚合操作

### 7. 解释C#中的内存管理机制和垃圾回收

**答案：**

C#使用自动内存管理，主要通过垃圾回收器（GC）管理内存：

**内存区域：**
- 栈（Stack）：存储值类型、方法参数、局部变量
- 堆（Heap）：存储引用类型、装箱的值类型

```csharp
void Example()
{
    int value = 42;           // 存储在栈上
    string text = "Hello";    // "Hello"在字符串池，引用在栈上
    List<int> list = new List<int>();  // List对象在堆上，引用在栈上
}
```

**垃圾回收机制：**
- 分代回收：0代、1代、2代
- 标记-清除算法
- 压缩内存碎片

**GC代：**
- 0代：新分配的对象，回收最频繁
- 1代：0代回收后存活的对象
- 2代：长期存活的对象

```csharp
// 强制垃圾回收（一般不推荐手动调用）
System.GC.Collect();
System.GC.WaitForPendingFinalizers();
```

**性能优化：**
- 避免频繁分配/释放对象
- 使用对象池
- 实现IDisposable接口

```csharp
// 实现IDisposable模式
public class ResourceManager : IDisposable
{
    private bool disposed = false;
    private IntPtr resourceHandle;

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
            }
            
            // 释放非托管资源
            if (resourceHandle != IntPtr.Zero)
            {
                // 释放资源
                resourceHandle = IntPtr.Zero;
            }
            
            disposed = true;
        }
    }

    ~ResourceManager()
    {
        Dispose(false);
    }
}
```

### 8. 解释C#中的异常处理机制

**答案：**

C#提供try-catch-finally语句处理异常：

**基本结构：**
```csharp
try
{
    // 可能抛出异常的代码
    int result = 10 / 0;  // 会抛出DivideByZeroException
}
catch (DivideByZeroException ex)
{
    // 处理特定异常
    Console.WriteLine($"除零错误: {ex.Message}");
}
catch (Exception ex)
{
    // 处理其他异常
    Console.WriteLine($"发生错误: {ex.Message}");
}
finally
{
    // 无论是否发生异常都会执行
    Console.WriteLine("清理资源");
}
```

**异常处理最佳实践：**
- 捕获特定异常而不是通用Exception
- 不要忽略异常
- 使用using语句自动释放资源
- 记录异常信息

```csharp
// 良好的异常处理示例
public async Task<string> GetDataAsync(string url)
{
    if (string.IsNullOrEmpty(url))
    {
        throw new ArgumentException("URL不能为空", nameof(url));
    }

    try
    {
        using (HttpClient client = new HttpClient())
        {
            return await client.GetStringAsync(url);
        }
    }
    catch (HttpRequestException ex)
    {
        // 记录错误
        Console.WriteLine($"HTTP请求失败: {ex.Message}");
        throw;  // 重新抛出异常
    }
    catch (TaskCanceledException ex)
    {
        Console.WriteLine($"请求超时: {ex.Message}");
        throw;
    }
}
```

**自定义异常：**
```csharp
public class GameException : Exception
{
    public GameException(string message) : base(message) { }
    public GameException(string message, Exception innerException) 
        : base(message, innerException) { }
}

// 使用自定义异常
public void ValidatePlayerLevel(int level)
{
    if (level < 1 || level > 100)
    {
        throw new GameException($"玩家等级必须在1-100之间，当前值: {level}");
    }
}
```

---

## Unity 开发题

### 9. 解释Unity中的MonoBehaviour生命周期

**答案：**

MonoBehaviour是Unity中所有脚本组件的基类，具有特定的生命周期方法：

**初始化阶段：**
- **Awake**: 脚本实例被加载时调用，每个对象只调用一次
- **OnEnable**: 对象变为启用状态时调用
- **Start**: 在第一次Update之前调用，且仅在脚本第一次启用时调用

```csharp
public class LifecycleExample : MonoBehaviour
{
    void Awake()
    {
        Debug.Log("Awake: 对象被加载时调用");
        // 通常用于初始化变量、查找引用
        // 在这里可以安全地调用DontDestroyOnLoad
    }

    void OnEnable()
    {
        Debug.Log("OnEnable: 对象启用时调用");
        // 用于订阅事件、注册监听器
    }

    void Start()
    {
        Debug.Log("Start: 第一次Update前调用");
        // 用于需要在Awake后执行的初始化
        // 此时其他对象的Awake已执行完毕
    }
}
```

**物理更新阶段：**
- **FixedUpdate**: 固定时间间隔调用，用于物理计算
- **OnTriggerEnter/Exit/Stay**: 碰撞体触发事件
- **OnCollisionEnter/Exit/Stay**: 碰撞事件

```csharp
void FixedUpdate()
{
    // 物理相关的更新，如力的施加
    if (rb != null)
    {
        rb.AddForce(Vector3.forward * moveForce);
    }
}
```

**渲染更新阶段：**
- **Update**: 每帧调用，用于游戏逻辑更新
- **LateUpdate**: 在所有Update后调用，常用于相机跟随

```csharp
void Update()
{
    // 游戏逻辑更新
    HandleInput();
    UpdateAnimation();
}

void LateUpdate()
{
    // 相机跟随逻辑
    if (target != null)
    {
        transform.position = target.position + offset;
    }
}
```

**销毁阶段：**
- **OnDisable**: 对象变为禁用状态时调用
- **OnDestroy**: 对象被销毁时调用

```csharp
void OnDisable()
{
    Debug.Log("OnDisable: 对象禁用时调用");
    // 取消订阅事件、清理引用
}

void OnDestroy()
{
    Debug.Log("OnDestroy: 对象销毁时调用");
    // 释放资源、清理内存
}
```

**重要注意事项：**
- Awake在所有对象的Start之前执行
- OnDestroy在场景切换时调用
- 非激活对象不会执行Update等方法

### 10. 解释Unity中的协程（Coroutine）机制

**答案：**

协程是Unity中实现异步操作的机制，允许在多个帧之间暂停和恢复执行：

**基本语法：**
```csharp
public class CoroutineExample : MonoBehaviour
{
    void Start()
    {
        // 启动协程
        StartCoroutine(MyCoroutine());
        StartCoroutine(DelayedAction(2f, () => Debug.Log("延迟执行")));
    }

    // 协程方法返回IEnumerator
    IEnumerator MyCoroutine()
    {
        Debug.Log("协程开始");
        
        // 等待1秒
        yield return new WaitForSeconds(1f);
        
        Debug.Log("等待1秒后");
        
        // 等待下一帧
        yield return null;
        
        Debug.Log("下一帧");
        
        // 等待固定数量的帧
        for (int i = 0; i < 10; i++)
        {
            transform.position += Vector3.forward * 0.1f;
            yield return new WaitForFixedUpdate(); // 等待下一次FixedUpdate
        }
        
        Debug.Log("协程结束");
    }

    // 带参数的协程
    IEnumerator DelayedAction(float delay, System.Action action)
    {
        yield return new WaitForSeconds(delay);
        action?.Invoke();
    }
}
```

**协程控制：**
```csharp
public class CoroutineControl : MonoBehaviour
{
    private Coroutine runningCoroutine;

    void Start()
    {
        runningCoroutine = StartCoroutine(RunForever());
    }

    IEnumerator RunForever()
    {
        while (true)
        {
            Debug.Log("Running...");
            yield return new WaitForSeconds(1f);
        }
    }

    void StopCoroutineExample()
    {
        // 停止特定协程
        if (runningCoroutine != null)
        {
            StopCoroutine(runningCoroutine);
        }
        
        // 停止所有协程
        StopAllCoroutines();
    }
}
```

**协程 vs 线程：**
- 协程在主线程中执行，不是真正的多线程
- 协程是Unity特有的概念，基于生成器模式
- 线程可能访问Unity API导致错误

**协程的使用场景：**
- 延迟执行
- 重复执行的任务
- 复杂的序列化操作
- 简单的异步操作

### 11. 解释Unity中的对象池模式实现

**答案：**

对象池用于避免频繁创建/销毁对象导致的性能问题，特别是垃圾回收：

**基本对象池实现：**
```csharp
using System.Collections.Generic;
using UnityEngine;

public class ObjectPool<T> where T : Component
{
    private Queue<T> pool = new Queue<T>();
    private T prefab;
    private Transform parent;

    public ObjectPool(T prefab, int initialSize, Transform parent = null)
    {
        this.prefab = prefab;
        this.parent = parent;

        // 预先创建对象
        for (int i = 0; i < initialSize; i++)
        {
            T obj = CreateNewObject();
            ReturnToPool(obj);
        }
    }

    public T Get()
    {
        T obj;
        if (pool.Count > 0)
        {
            obj = pool.Dequeue();
            obj.gameObject.SetActive(true);
        }
        else
        {
            // 如果池空了，创建新对象（应该避免这种情况）
            obj = CreateNewObject();
            Debug.LogWarning($"对象池已空，创建新对象: {typeof(T)}");
        }
        
        return obj;
    }

    public void ReturnToPool(T obj)
    {
        if (obj != null)
        {
            obj.gameObject.SetActive(false);
            obj.transform.SetParent(parent);
            pool.Enqueue(obj);
        }
    }

    private T CreateNewObject()
    {
        T obj = GameObject.Instantiate(prefab);
        obj.transform.SetParent(parent);
        obj.gameObject.SetActive(false);
        return obj;
    }

    public int PoolSize => pool.Count;
}

// 使用示例
public class BulletSpawner : MonoBehaviour
{
    private ObjectPool<Bullet> bulletPool;
    public Bullet bulletPrefab;
    public Transform poolParent;

    void Start()
    {
        // 初始化对象池
        bulletPool = new ObjectPool<Bullet>(bulletPrefab, 20, poolParent);
    }

    void Update()
    {
        if (Input.GetMouseButtonDown(0))
        {
            SpawnBullet();
        }
    }

    void SpawnBullet()
    {
        Bullet bullet = bulletPool.Get();
        if (bullet != null)
        {
            bullet.transform.position = transform.position;
            bullet.transform.rotation = transform.rotation;
            
            // 设置子弹属性
            bullet.Initialize(bulletPool);
        }
    }
}

// 可回收的子弹组件
public class Bullet : MonoBehaviour
{
    private ObjectPool<Bullet> pool;
    private float lifeTime = 5f;
    private float timer = 0f;

    public void Initialize(ObjectPool<Bullet> bulletPool)
    {
        pool = bulletPool;
        timer = 0f;
        gameObject.SetActive(true);
    }

    void Update()
    {
        timer += Time.deltaTime;
        
        if (timer >= lifeTime)
        {
            ReturnToPool();
        }
    }

    void ReturnToPool()
    {
        if (pool != null)
        {
            pool.ReturnToPool(this);
        }
        else
        {
            Destroy(gameObject);
        }
    }
}
```

**Unity内置对象池（Unity 2022.2+）：**
```csharp
using UnityEngine.Pool;

public class ModernObjectPool : MonoBehaviour
{
    private ObjectPool<Bullet> pool;

    void Start()
    {
        pool = new ObjectPool<Bullet>(
            // 创建函数
            createFunc: () => Instantiate(bulletPrefab),
            // 获取函数
            actionOnGet: (bullet) => {
                bullet.gameObject.SetActive(true);
            },
            // 释放函数
            actionOnRelease: (bullet) => {
                bullet.gameObject.SetActive(false);
            },
            // 销毁函数
            destructionFunction: (bullet) => Destroy(bullet.gameObject),
            // 默认容量
            defaultCapacity: 20,
            // 最大容量
            maxSize: 100,
            // 是否单线程
            collectionCheck: false
        );
    }

    void SpawnBullet()
    {
        Bullet bullet = pool.Get();
        // 使用子弹...
    }

    void ReturnBullet(Bullet bullet)
    {
        pool.Release(bullet);
    }
}
```

### 12. 解释Unity中的单例模式实现

**答案：**

单例模式确保一个类只有一个实例，并提供全局访问点：

**基础单例实现：**
```csharp
public class GameManager : MonoBehaviour
{
    private static GameManager _instance;
    private static readonly object _lock = new object();
    private static bool _applicationIsQuitting = false;

    public static GameManager Instance
    {
        get
        {
            if (_applicationIsQuitting)
            {
                Debug.LogWarning("单例在应用程序退出时被访问!");
                return null;
            }

            lock (_lock)
            {
                if (_instance == null)
                {
                    _instance = FindObjectOfType<GameManager>();
                    
                    if (_instance == null)
                    {
                        GameObject singletonObject = new GameObject("GameManager");
                        _instance = singletonObject.AddComponent<GameManager>();
                    }
                    
                    if (_instance != null)
                    {
                        DontDestroyOnLoad(_instance);
                    }
                }
                
                return _instance;
            }
        }
    }

    void Awake()
    {
        if (_instance != null && _instance != this)
        {
            // 如果已经存在实例，销毁新的实例
            Destroy(gameObject);
            return;
        }

        _instance = this;
        DontDestroyOnLoad(gameObject);
    }

    void OnDestroy()
    {
        if (_instance == this)
        {
            _applicationIsQuitting = true;
        }
    }
}
```

**泛型单例基类：**
```csharp
public class Singleton<T> : MonoBehaviour where T : MonoBehaviour
{
    private static T _instance;
    private static readonly object _lock = new object();
    private static bool _applicationIsQuitting = false;

    public static T Instance
    {
        get
        {
            if (_applicationIsQuitting)
            {
                Debug.LogWarning($"单例 {typeof(T)} 在应用程序退出时被访问!");
                return null;
            }

            lock (_lock)
            {
                if (_instance == null)
                {
                    _instance = FindObjectOfType<T>();
                    
                    if (_instance == null)
                    {
                        GameObject singletonObject = new GameObject(typeof(T).Name);
                        _instance = singletonObject.AddComponent<T>();
                    }
                    
                    if (_instance != null)
                    {
                        DontDestroyOnLoad(_instance);
                    }
                }
                
                return _instance;
            }
        }
    }

    protected virtual void Awake()
    {
        if (_instance != null && _instance != this)
        {
            Destroy(gameObject);
            return;
        }

        _instance = this;
        DontDestroyOnLoad(gameObject);
    }

    protected virtual void OnDestroy()
    {
        if (_instance == this)
        {
            _applicationIsQuitting = true;
        }
    }
}

// 使用泛型单例
public class AudioManager : Singleton<AudioManager>
{
    public AudioSource musicSource;
    public AudioSource sfxSource;

    public void PlayMusic(AudioClip clip)
    {
        musicSource.clip = clip;
        musicSource.Play();
    }

    public void PlaySFX(AudioClip clip)
    {
        sfxSource.PlayOneShot(clip);
    }
}
```

**注意事项：**
- 线程安全
- 防止重复创建
- 应用程序退出时的处理
- 使用DontDestroyOnLoad保持实例

### 13. 解释Unity中的事件系统和观察者模式

**答案：**

Unity提供内置事件系统，同时可以实现自定义事件系统：

**Unity内置事件系统：**
```csharp
using UnityEngine;
using UnityEngine.EventSystems;

public class UIEventHandler : MonoBehaviour, IPointerClickHandler, IPointerEnterHandler, IPointerExitHandler
{
    public void OnPointerClick(PointerEventData eventData)
    {
        Debug.Log("按钮被点击");
    }

    public void OnPointerEnter(PointerEventData eventData)
    {
        Debug.Log("鼠标进入");
    }

    public void OnPointerExit(PointerEventData eventData)
    {
        Debug.Log("鼠标离开");
    }
}
```

**自定义事件系统：**
```csharp
// 事件数据结构
public struct PlayerDeathEvent
{
    public int playerId;
    public Vector3 position;
    public float time;

    public PlayerDeathEvent(int id, Vector3 pos)
    {
        playerId = id;
        position = pos;
        time = Time.time;
    }
}

public struct ScoreChangeEvent
{
    public int playerId;
    public int oldScore;
    public int newScore;

    public ScoreChangeEvent(int id, int oldScore, int newScore)
    {
        playerId = id;
        this.oldScore = oldScore;
        this.newScore = newScore;
    }
}

// 事件管理器
public class EventManager : MonoBehaviour
{
    private Dictionary<System.Type, System.Delegate> eventDictionary = 
        new Dictionary<System.Type, System.Delegate>();

    private static EventManager _instance;

    public static EventManager Instance
    {
        get
        {
            if (_instance == null)
            {
                _instance = FindObjectOfType<EventManager>();
                
                if (_instance == null)
                {
                    GameObject eventManagerObject = new GameObject("EventManager");
                    _instance = eventManagerObject.AddComponent<EventManager>();
                }
            }
            
            return _instance;
        }
    }

    // 订阅事件
    public void Subscribe<T>(System.Action<T> listener) where T : struct
    {
        System.Type eventType = typeof(T);
        
        if (eventDictionary.ContainsKey(eventType))
        {
            eventDictionary[eventType] = System.Delegate.Combine(eventDictionary[eventType], listener);
        }
        else
        {
            eventDictionary[eventType] = listener;
        }
    }

    // 取消订阅事件
    public void Unsubscribe<T>(System.Action<T> listener) where T : struct
    {
        System.Type eventType = typeof(T);

        if (eventDictionary.ContainsKey(eventType))
        {
            eventDictionary[eventType] = System.Delegate.Remove(eventDictionary[eventType], listener);

            if (eventDictionary[eventType] == null)
            {
                eventDictionary.Remove(eventType);
            }
        }
    }

    // 触发事件
    public void Trigger<T>(T eventToTrigger) where T : struct
    {
        System.Type eventType = typeof(T);

        if (eventDictionary.ContainsKey(eventType))
        {
            System.Delegate multicastDelegate = eventDictionary[eventType];
            
            if (multicastDelegate != null)
            {
                System.Action<T> callback = multicastDelegate as System.Action<T>;
                if (callback != null)
                {
                    callback(eventToTrigger);
                }
            }
        }
    }
}

// 使用事件系统
public class PlayerController : MonoBehaviour
{
    private int playerId = 1;
    private int score = 0;

    void OnEnable()
    {
        EventManager.Instance.Subscribe<PlayerDeathEvent>(OnPlayerDeath);
    }

    void OnDisable()
    {
        EventManager.Instance.Unsubscribe<PlayerDeathEvent>(OnPlayerDeath);
    }

    void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("DeathZone"))
        {
            // 触发玩家死亡事件
            PlayerDeathEvent deathEvent = new PlayerDeathEvent(playerId, transform.position);
            EventManager.Instance.Trigger(deathEvent);
        }
    }

    void OnPlayerDeath(PlayerDeathEvent deathEvent)
    {
        if (deathEvent.playerId == playerId)
        {
            Debug.Log($"玩家 {playerId} 在位置 {deathEvent.position} 死亡");
            // 处理玩家死亡逻辑
        }
    }

    public void AddScore(int points)
    {
        int oldScore = score;
        score += points;
        
        // 触发分数改变事件
        ScoreChangeEvent scoreEvent = new ScoreChangeEvent(playerId, oldScore, score);
        EventManager.Instance.Trigger(scoreEvent);
    }
}
```

### 14. 解释Unity中的动画系统和状态机

**答案：**

Unity的动画系统基于Animator组件和状态机：

**Animator Controller设置：**
```csharp
public class PlayerAnimationController : MonoBehaviour
{
    private Animator animator;
    private int speedHash;
    private int directionHash;
    private int isRunningHash;
    private int jumpHash;

    void Start()
    {
        animator = GetComponent<Animator>();
        
        // 预计算参数哈希值（性能优化）
        speedHash = Animator.StringToHash("Speed");
        directionHash = Animator.StringToHash("Direction");
        isRunningHash = Animator.StringToHash("IsRunning");
        jumpHash = Animator.StringToHash("Jump");
    }

    void Update()
    {
        // 获取输入
        float horizontal = Input.GetAxis("Horizontal");
        float vertical = Input.GetAxis("Vertical");
        Vector2 inputVector = new Vector2(horizontal, vertical);
        float speed = inputVector.magnitude;

        // 设置动画参数
        animator.SetFloat(speedHash, speed);
        animator.SetFloat(directionHash, horizontal);
        animator.SetBool(isRunningHash, speed > 0.1f);

        // 处理跳跃
        if (Input.GetButtonDown("Jump"))
        {
            animator.SetTrigger(jumpHash);
        }
    }

    // 动画事件方法
    void OnFootstep()
    {
        // 播放脚步声
        AudioManager.Instance?.PlaySFX(footstepSound);
    }

    void OnAttack()
    {
        // 处理攻击逻辑
        Collider[] hitColliders = Physics.OverlapSphere(attackPoint.position, attackRange);
        foreach (Collider collider in hitColliders)
        {
            if (collider.CompareTag("Enemy"))
            {
                // 对敌人造成伤害
            }
        }
    }
}
```

**动画事件处理：**
```csharp
public class AnimationEventReceiver : MonoBehaviour
{
    [Header("动画事件配置")]
    public AudioSource audioSource;
    public AudioClip[] footstepSounds;

    // 由动画事件调用
    public void PlayFootstepSound()
    {
        if (audioSource != null && footstepSounds.Length > 0)
        {
            AudioClip randomClip = footstepSounds[Random.Range(0, footstepSounds.Length)];
            audioSource.PlayOneShot(randomClip);
        }
    }

    public void EnableWeaponCollider()
    {
        // 启用武器碰撞体
        WeaponCollider.enabled = true;
    }

    public void DisableWeaponCollider()
    {
        // 禁用武器碰撞体
        WeaponCollider.enabled = false;
    }

    public void SetNextAttackReady()
    {
        // 设置下次攻击准备就绪
        PlayerCombat.Instance?.SetNextAttackReady();
    }
}
```

**动画混合树：**
```csharp
// 用于控制混合树参数的脚本
public class BlendTreeController : MonoBehaviour
{
    private Animator animator;
    private int blendXHash;
    private int blendYHash;

    void Start()
    {
        animator = GetComponent<Animator>();
        blendXHash = Animator.StringToHash("BlendX");
        blendYHash = Animator.StringToHash("BlendY");
    }

    void Update()
    {
        // 控制2D混合树的参数
        float moveX = Input.GetAxis("Horizontal");
        float moveY = Input.GetAxis("Vertical");
        
        animator.SetFloat(blendXHash, moveX);
        animator.SetFloat(blendYHash, moveY);
    }
}
```

### 15. 解释Unity中的物理系统和碰撞检测

**答案：**

Unity物理系统基于NVIDIA PhysX引擎：

**刚体（Rigidbody）配置：**
```csharp
public class PhysicsObject : MonoBehaviour
{
    private Rigidbody rb;

    void Start()
    {
        rb = GetComponent<Rigidbody>();
        
        // 配置刚体属性
        rb.mass = 1f;                    // 质量
        rb.drag = 0.1f;                 // 线性阻力
        rb.angularDrag = 0.05f;         // 角阻力
        rb.useGravity = true;           // 使用重力
        rb.isKinematic = false;         // 不是运动学刚体
        rb.interpolation = RigidbodyInterpolation.Interpolate; // 平滑插值
    }

    void FixedUpdate()
    {
        // 在FixedUpdate中应用物理力
        if (Input.GetKey(KeyCode.W))
        {
            rb.AddForce(Vector3.forward * moveForce);
        }
    }

    // 碰撞检测
    void OnCollisionEnter(Collision collision)
    {
        Debug.Log($"碰撞到: {collision.gameObject.name}");
        
        // 获取碰撞信息
        foreach (ContactPoint contact in collision.contacts)
        {
            Debug.DrawRay(contact.point, contact.normal, Color.white);
        }
    }

    void OnCollisionStay(Collision collision)
    {
        // 持续碰撞
    }

    void OnCollisionExit(Collision collision)
    {
        // 离开碰撞
    }
}
```

**触发器检测：**
```csharp
public class TriggerDetector : MonoBehaviour
{
    void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("Player"))
        {
            Debug.Log("玩家进入触发器区域");
            // 处理玩家进入逻辑
        }
    }

    void OnTriggerStay(Collider other)
    {
        if (other.CompareTag("Player"))
        {
            // 玩家在触发器内持续执行
        }
    }

    void OnTriggerExit(Collider other)
    {
        if (other.CompareTag("Player"))
        {
            Debug.Log("玩家离开触发器区域");
        }
    }
}
```

**射线检测：**
```csharp
public class RaycastDetector : MonoBehaviour
{
    public LayerMask detectionMask = -1;  // 所有层
    public float detectionDistance = 10f;

    void Update()
    {
        // 从摄像机发射射线
        Ray ray = Camera.main.ScreenPointToRay(Input.mousePosition);
        RaycastHit hit;

        if (Physics.Raycast(ray, out hit, detectionDistance, detectionMask))
        {
            Debug.Log($"射线击中: {hit.collider.name}");
            
            // 可视化射线
            Debug.DrawRay(ray.origin, ray.direction * hit.distance, Color.red);
            
            if (Input.GetMouseButtonDown(0))
            {
                // 处理点击逻辑
                OnObjectClicked(hit.collider.gameObject);
            }
        }
        else
        {
            // 射线未击中任何物体
            Debug.DrawRay(ray.origin, ray.direction * detectionDistance, Color.white);
        }
    }

    void OnObjectClicked(GameObject clickedObject)
    {
        // 处理对象点击
        Debug.Log($"点击了对象: {clickedObject.name}");
    }
}
```

### 16. 解释Unity中的UI系统优化

**答案：**

Unity UI系统（UGUI）需要特别注意性能优化：

**Canvas优化：**
```csharp
public class UIOptimizer : MonoBehaviour
{
    [Header("Canvas优化")]
    public Canvas canvas;
    public GraphicRaycaster raycaster;

    void Start()
    {
        // 优化Canvas设置
        if (canvas != null)
        {
            // 根据需要设置渲染模式
            if (canvas.renderMode == RenderMode.WorldSpace)
            {
                canvas.pixelPerfect = false;  // 世界空间Canvas通常不需要像素完美
            }
        }

        // 优化射线检测
        if (raycaster != null)
        {
            // 减少射线检测的复杂度
            raycaster.blockingObjects = GraphicRaycaster.BlockingObjects.None;
        }
    }

    // 减少Canvas重建
    public void SetUIActive(CanvasGroup canvasGroup, bool active)
    {
        // 使用CanvasGroup而不是频繁激活/停用GameObject
        canvasGroup.alpha = active ? 1f : 0f;
        canvasGroup.interactable = active;
        canvasGroup.blocksRaycasts = active;
    }
}
```

**UI更新优化：**
```csharp
public class OptimizedUIUpdater : MonoBehaviour, IUIUpdatable
{
    public Text scoreText;
    public Slider healthSlider;
    public Image healthBarFill;

    private int currentScore = 0;
    private int lastDisplayedScore = -1;
    private float currentHealth = 1f;
    private float lastDisplayedHealth = -1f;

    private static List<IUIUpdatable> updatableComponents = new List<IUIUpdatable>();
    private static float updateInterval = 0.1f;  // 100ms更新一次
    private static float lastUpdateTime = 0f;

    void Start()
    {
        // 注册到全局更新管理器
        updatableComponents.Add(this);
    }

    void OnDestroy()
    {
        updatableComponents.Remove(this);
    }

    // 批量更新所有UI组件
    void Update()
    {
        if (Time.time - lastUpdateTime >= updateInterval)
        {
            foreach (IUIUpdatable updatable in updatableComponents)
            {
                updatable.UpdateUI();
            }
            lastUpdateTime = Time.time;
        }
    }

    public void UpdateUI()
    {
        // 只在值改变时更新UI
        if (lastDisplayedScore != currentScore)
        {
            lastDisplayedScore = currentScore;
            if (scoreText != null)
            {
                scoreText.text = $"Score: {currentScore}";
            }
        }

        // 健康值变化超过阈值时更新
        if (Mathf.Abs(lastDisplayedHealth - currentHealth) > 0.01f)
        {
            lastDisplayedHealth = currentHealth;
            if (healthSlider != null)
            {
                healthSlider.value = currentHealth;
            }
            if (healthBarFill != null)
            {
                healthBarFill.fillAmount = currentHealth;
            }
        }
    }

    // 外部设置值的方法
    public void SetScore(int score)
    {
        currentScore = score;
    }

    public void SetHealth(float health)
    {
        currentHealth = Mathf.Clamp01(health);
    }
}

public interface IUIUpdatable
{
    void UpdateUI();
}
```

**UI对象池：**
```csharp
public class UIObjectPool : MonoBehaviour
{
    private Dictionary<string, Queue<GameObject>> pools = new Dictionary<string, Queue<GameObject>>();

    public void CreatePool(string poolName, GameObject prefab, int initialSize)
    {
        if (!pools.ContainsKey(poolName))
        {
            pools[poolName] = new Queue<GameObject>();
            
            // 预创建对象
            for (int i = 0; i < initialSize; i++)
            {
                GameObject obj = Instantiate(prefab);
                obj.SetActive(false);
                obj.transform.SetParent(transform, false);
                pools[poolName].Enqueue(obj);
            }
        }
    }

    public GameObject GetObject(string poolName)
    {
        if (pools.ContainsKey(poolName) && pools[poolName].Count > 0)
        {
            GameObject obj = pools[poolName].Dequeue();
            obj.SetActive(true);
            return obj;
        }
        
        Debug.LogWarning($"对象池 {poolName} 不存在或已空");
        return null;
    }

    public void ReturnObject(string poolName, GameObject obj)
    {
        if (pools.ContainsKey(poolName))
        {
            obj.SetActive(false);
            obj.transform.SetParent(transform, false);
            pools[poolName].Enqueue(obj);
        }
    }
}
```

---

## 游戏开发题

### 17. 设计一个简单的游戏状态管理器

**答案：**

游戏状态管理器是游戏开发中的核心组件，用于管理游戏的不同状态：

```csharp
using UnityEngine;
using System.Collections;

public enum GameState
{
    MainMenu,
    Playing,
    Paused,
    GameOver,
    LevelComplete
}

public class GameStateManager : MonoBehaviour
{
    public static GameStateManager Instance { get; private set; }

    private GameState currentState = GameState.MainMenu;
    private GameState previousState = GameState.MainMenu;

    [Header("UI Panels")]
    public GameObject mainMenuPanel;
    public GameObject gamePanel;
    public GameObject pausePanel;
    public GameObject gameOverPanel;
    public GameObject levelCompletePanel;

    [Header("Game Systems")]
    public PlayerController playerController;
    public EnemySpawner enemySpawner;
    public UIManager uiManager;

    void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
        }
    }

    void Start()
    {
        ChangeState(GameState.MainMenu);
    }

    public void ChangeState(GameState newState)
    {
        if (currentState == newState) return;

        // 退出当前状态
        ExitState(currentState);

        // 保存之前的状态
        previousState = currentState;
        currentState = newState;

        // 进入新状态
        EnterState(currentState);

        Debug.Log($"State changed from {previousState} to {currentState}");
    }

    private void ExitState(GameState state)
    {
        switch (state)
        {
            case GameState.MainMenu:
                mainMenuPanel?.SetActive(false);
                break;
            case GameState.Playing:
                gamePanel?.SetActive(false);
                Time.timeScale = 1f; // 重置时间尺度
                break;
            case GameState.Paused:
                pausePanel?.SetActive(false);
                Time.timeScale = 1f; // 恢复游戏时间
                break;
            case GameState.GameOver:
                gameOverPanel?.SetActive(false);
                break;
            case GameState.LevelComplete:
                levelCompletePanel?.SetActive(false);
                break;
        }
    }

    private void EnterState(GameState state)
    {
        switch (state)
        {
            case GameState.MainMenu:
                mainMenuPanel?.SetActive(true);
                DisableGameplaySystems();
                break;
            case GameState.Playing:
                gamePanel?.SetActive(true);
                EnableGameplaySystems();
                break;
            case GameState.Paused:
                pausePanel?.SetActive(true);
                Time.timeScale = 0f; // 暂停游戏
                break;
            case GameState.GameOver:
                gameOverPanel?.SetActive(true);
                DisableGameplaySystems();
                Time.timeScale = 0f;
                break;
            case GameState.LevelComplete:
                levelCompletePanel?.SetActive(true);
                DisableGameplaySystems();
                Time.timeScale = 0f;
                break;
        }
    }

    private void EnableGameplaySystems()
    {
        if (playerController != null) playerController.enabled = true;
        if (enemySpawner != null) enemySpawner.enabled = true;
        if (uiManager != null) uiManager.EnableGameUI();
    }

    private void DisableGameplaySystems()
    {
        if (playerController != null) playerController.enabled = false;
        if (enemySpawner != null) enemySpawner.enabled = false;
        if (uiManager != null) uiManager.DisableGameUI();
    }

    // 公共方法供外部调用
    public void StartGame()
    {
        ChangeState(GameState.Playing);
    }

    public void PauseGame()
    {
        ChangeState(GameState.Paused);
    }

    public void ResumeGame()
    {
        ChangeState(GameState.Playing);
    }

    public void GameOver()
    {
        ChangeState(GameState.GameOver);
    }

    public void LevelComplete()
    {
        ChangeState(GameState.LevelComplete);
    }

    public void ReturnToMainMenu()
    {
        ChangeState(GameState.MainMenu);
    }

    public GameState GetCurrentState()
    {
        return currentState;
    }

    public bool IsInState(GameState state)
    {
        return currentState == state;
    }

    // 处理暂停状态的输入
    void Update()
    {
        if (currentState == GameState.Playing && Input.GetKeyDown(KeyCode.Escape))
        {
            PauseGame();
        }
    }

    // 确保退出暂停状态
    void OnApplicationFocus(bool hasFocus)
    {
        if (!hasFocus && currentState == GameState.Playing)
        {
            // 应用失去焦点时暂停游戏
            PauseGame();
        }
    }
}

// 配套的UI管理器
public class UIManager : MonoBehaviour
{
    public GameObject inGameUI;
    public GameObject pauseUI;
    public GameObject gameOverUI;

    public void EnableGameUI()
    {
        inGameUI?.SetActive(true);
        pauseUI?.SetActive(false);
        gameOverUI?.SetActive(false);
    }

    public void DisableGameUI()
    {
        inGameUI?.SetActive(false);
    }

    public void ShowPauseUI()
    {
        pauseUI?.SetActive(true);
    }

    public void ShowGameOverUI()
    {
        gameOverUI?.SetActive(true);
    }
}
```

### 18. 实现一个简单的敌人AI系统

**答案：**

敌人AI系统通常包括感知、决策和行动三个部分：

```csharp
using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public enum EnemyState
{
    Idle,
    Patrol,
    Chase,
    Attack,
    Flee
}

public class EnemyAI : MonoBehaviour
{
    [Header("AI设置")]
    public EnemyState currentState = EnemyState.Idle;
    public float detectionRange = 10f;
    public float attackRange = 2f;
    public float moveSpeed = 3f;
    public float rotationSpeed = 5f;

    [Header("巡逻设置")]
    public Transform[] patrolPoints;
    public float patrolWaitTime = 2f;
    private int currentPatrolIndex = 0;

    [Header("攻击设置")]
    public int damage = 10;
    public float attackCooldown = 1f;
    private float lastAttackTime = 0f;

    [Header("感知设置")]
    public LayerMask playerLayer;
    public LayerMask obstacleLayer;

    private Transform target;
    private NavMeshAgent agent;
    private Animator animator;
    private float lastSightTime = 0f;
    private Vector3 lastKnownPosition = Vector3.zero;

    void Start()
    {
        agent = GetComponent<UnityEngine.AI.NavMeshAgent>();
        animator = GetComponent<Animator>();
        
        if (agent != null)
        {
            agent.speed = moveSpeed;
        }
        
        // 开始巡逻
        if (patrolPoints.Length > 0)
        {
            currentState = EnemyState.Patrol;
        }
    }

    void Update()
    {
        switch (currentState)
        {
            case EnemyState.Idle:
                IdleState();
                break;
            case EnemyState.Patrol:
                PatrolState();
                break;
            case EnemyState.Chase:
                ChaseState();
                break;
            case EnemyState.Attack:
                AttackState();
                break;
            case EnemyState.Flee:
                FleeState();
                break;
        }
    }

    void IdleState()
    {
        // 原地待命，检测玩家
        DetectPlayer();
    }

    void PatrolState()
    {
        if (patrolPoints.Length == 0) return;

        // 移动到巡逻点
        Vector3 targetPosition = patrolPoints[currentPatrolIndex].position;
        
        if (agent != null)
        {
            agent.SetDestination(targetPosition);
            
            // 检查是否到达目标点
            if (Vector3.Distance(transform.position, targetPosition) < 1f)
            {
                StartCoroutine(WaitAtPatrolPoint());
            }
        }

        // 检测玩家
        DetectPlayer();
    }

    IEnumerator WaitAtPatrolPoint()
    {
        if (animator != null)
        {
            animator.SetBool("IsWalking", false);
        }

        yield return new WaitForSeconds(patrolWaitTime);

        // 移动到下一个巡逻点
        currentPatrolIndex = (currentPatrolIndex + 1) % patrolPoints.Length;
        
        if (animator != null)
        {
            animator.SetBool("IsWalking", true);
        }
    }

    void ChaseState()
    {
        if (target != null)
        {
            if (agent != null)
            {
                agent.SetDestination(target.position);
            }

            // 面向目标
            Vector3 direction = (target.position - transform.position).normalized;
            Quaternion targetRotation = Quaternion.LookRotation(direction);
            transform.rotation = Quaternion.Slerp(transform.rotation, targetRotation, rotationSpeed * Time.deltaTime);

            // 检查是否进入攻击范围
            float distanceToTarget = Vector3.Distance(transform.position, target.position);
            if (distanceToTarget <= attackRange)
            {
                ChangeState(EnemyState.Attack);
            }
            // 检查是否超出检测范围
            else if (distanceToTarget > detectionRange)
            {
                lastSightTime = Time.time;
                lastKnownPosition = target.position;
                ChangeState(EnemyState.Idle);
            }
        }
        else
        {
            // 目标丢失，返回巡逻或待机
            if (patrolPoints.Length > 0)
            {
                ChangeState(EnemyState.Patrol);
            }
            else
            {
                ChangeState(EnemyState.Idle);
            }
        }
    }

    void AttackState()
    {
        if (target != null)
        {
            // 面向目标
            Vector3 direction = (target.position - transform.position).normalized;
            Quaternion targetRotation = Quaternion.LookRotation(direction);
            transform.rotation = Quaternion.Slerp(transform.rotation, targetRotation, rotationSpeed * Time.deltaTime);

            // 检查攻击冷却
            if (Time.time - lastAttackTime >= attackCooldown)
            {
                PerformAttack();
                lastAttackTime = Time.time;
            }

            // 检查目标是否离开攻击范围
            float distanceToTarget = Vector3.Distance(transform.position, target.position);
            if (distanceToTarget > attackRange + 1f)
            {
                ChangeState(EnemyState.Chase);
            }
        }
        else
        {
            ChangeState(EnemyState.Idle);
        }
    }

    void FleeState()
    {
        // 计算远离目标的方向
        if (target != null)
        {
            Vector3 fleeDirection = (transform.position - target.position).normalized;
            Vector3 fleePosition = transform.position + fleeDirection * 10f;

            if (agent != null)
            {
                agent.SetDestination(fleePosition);
            }

            // 一段时间后停止逃跑
            if (Vector3.Distance(transform.position, target.position) > detectionRange * 2f)
            {
                ChangeState(EnemyState.Idle);
            }
        }
    }

    void DetectPlayer()
    {
        // 使用射线检测或球形检测
        Collider[] hitColliders = Physics.OverlapSphere(transform.position, detectionRange, playerLayer);
        
        foreach (Collider collider in hitColliders)
        {
            if (collider.CompareTag("Player"))
            {
                // 检查是否有障碍物阻挡视线
                Vector3 direction = collider.transform.position - transform.position;
                float distance = direction.magnitude;
                direction.Normalize();

                if (distance <= detectionRange)
                {
                    RaycastHit hit;
                    if (Physics.Raycast(transform.position, direction, out hit, distance, ~obstacleLayer))
                    {
                        if (hit.collider.CompareTag("Player"))
                        {
                            target = collider.transform;
                            ChangeState(EnemyState.Chase);
                            return;
                        }
                    }
                }
            }
        }
    }

    void PerformAttack()
    {
        if (target != null)
        {
            // 播放攻击动画
            if (animator != null)
            {
                animator.SetTrigger("Attack");
            }

            // 对目标造成伤害（通过消息或直接调用）
            PlayerHealth playerHealth = target.GetComponent<PlayerHealth>();
            if (playerHealth != null)
            {
                playerHealth.TakeDamage(damage);
            }
        }
    }

    void ChangeState(EnemyState newState)
    {
        if (currentState == newState) return;

        // 退出当前状态的处理
        OnExitState(currentState);

        currentState = newState;

        // 进入新状态的处理
        OnEnterState(currentState);
    }

    void OnExitState(EnemyState state)
    {
        switch (state)
        {
            case EnemyState.Attack:
                if (animator != null)
                {
                    animator.ResetTrigger("Attack");
                }
                break;
        }
    }

    void OnEnterState(EnemyState state)
    {
        switch (state)
        {
            case EnemyState.Attack:
                if (animator != null)
                {
                    animator.SetBool("IsAttacking", true);
                }
                break;
            case EnemyState.Chase:
                if (animator != null)
                {
                    animator.SetBool("IsWalking", true);
                    animator.SetBool("IsAttacking", false);
                }
                break;
            case EnemyState.Patrol:
                if (animator != null)
                {
                    animator.SetBool("IsWalking", true);
                    animator.SetBool("IsAttacking", false);
                }
                break;
        }
    }

    // 可视化检测范围
    void OnDrawGizmosSelected()
    {
        Gizmos.color = Color.red;
        Gizmos.DrawWireSphere(transform.position, detectionRange);
        
        Gizmos.color = Color.yellow;
        Gizmos.DrawWireSphere(transform.position, attackRange);
    }

    // 受伤时的反应
    public void TakeDamage(int damageAmount)
    {
        // 可以添加受伤动画、音效等
        // 根据剩余血量决定是否逃跑或继续攻击
    }
}
```

### 19. 解释游戏中的碰撞检测和伤害系统

**答案：**

游戏中的碰撞检测和伤害系统是核心玩法机制：

```csharp
using UnityEngine;

// 玩家伤害系统
public class PlayerHealth : MonoBehaviour
{
    [Header("生命值设置")]
    public int maxHealth = 100;
    private int currentHealth;
    public float invincibilityDuration = 1f;
    private float invincibilityTimer = 0f;
    private bool isInvincible = false;

    [Header("UI引用")]
    public HealthBar healthBar;

    [Header("音效")]
    public AudioClip hurtSound;
    public AudioClip deathSound;

    void Start()
    {
        currentHealth = maxHealth;
        UpdateHealthUI();
    }

    void Update()
    {
        // 更新无敌时间
        if (isInvincible)
        {
            invincibilityTimer -= Time.deltaTime;
            if (invincibilityTimer <= 0)
            {
                isInvincible = false;
            }
        }
    }

    public void TakeDamage(int damage)
    {
        if (isInvincible) return;

        currentHealth -= damage;
        currentHealth = Mathf.Clamp(currentHealth, 0, maxHealth);

        // 播放受伤音效
        if (hurtSound != null)
        {
            AudioSource.PlayClipAtPoint(hurtSound, transform.position);
        }

        // 设置无敌时间
        isInvincible = true;
        invincibilityTimer = invincibilityDuration;

        // 更新UI
        UpdateHealthUI();

        // 检查是否死亡
        if (currentHealth <= 0)
        {
            Die();
        }
    }

    public void Heal(int healAmount)
    {
        currentHealth += healAmount;
        currentHealth = Mathf.Clamp(currentHealth, 0, maxHealth);
        UpdateHealthUI();
    }

    void UpdateHealthUI()
    {
        if (healthBar != null)
        {
            healthBar.SetHealth(currentHealth, maxHealth);
        }
    }

    void Die()
    {
        // 播放死亡音效
        if (deathSound != null)
        {
            AudioSource.PlayClipAtPoint(deathSound, transform.position);
        }

        // 触发死亡事件
        GameEvents.OnPlayerDeath?.Invoke();

        // 玩家死亡逻辑
        gameObject.SetActive(false); // 或者使用其他死亡处理方式
    }

    public float GetHealthPercentage()
    {
        return (float)currentHealth / maxHealth;
    }

    public bool IsAlive()
    {
        return currentHealth > 0;
    }
}

// 伤害处理接口
public interface IDamageable
{
    void TakeDamage(int damage);
    void Heal(int healAmount);
    bool IsAlive();
}

// 武器系统
public class Weapon : MonoBehaviour, IDamageable
{
    [Header("武器属性")]
    public int baseDamage = 25;
    public float attackRange = 2f;
    public float attackRate = 1f;  // 每秒攻击次数
    public LayerMask attackLayer;

    private float lastAttackTime = 0f;
    private Animator animator;

    void Start()
    {
        animator = GetComponent<Animator>();
    }

    public void Attack()
    {
        if (Time.time - lastAttackTime >= 1f / attackRate)
        {
            lastAttackTime = Time.time;

            // 播放攻击动画
            if (animator != null)
            {
                animator.SetTrigger("Attack");
            }

            // 检测攻击范围内的目标
            DetectAndDamageTargets();
        }
    }

    void DetectAndDamageTargets()
    {
        Collider[] hitColliders = Physics.OverlapSphere(transform.position, attackRange, attackLayer);
        
        foreach (Collider collider in hitColliders)
        {
            IDamageable damageable = collider.GetComponent<IDamageable>();
            if (damageable != null && damageable != this)  // 避免伤害自己
            {
                int finalDamage = CalculateDamage();
                damageable.TakeDamage(finalDamage);
            }
        }
    }

    int CalculateDamage()
    {
        // 可以根据武器等级、玩家属性等计算最终伤害
        return baseDamage;
    }

    public void TakeDamage(int damage)
    {
        // 武器通常不会受到伤害，但可以实现耐久度系统
    }

    public void Heal(int healAmount)
    {
        // 武器通常不需要治疗
    }

    public bool IsAlive()
    {
        // 武器总是"活着"，除非有耐久度系统
        return true;
    }

    // 可视化攻击范围
    void OnDrawGizmosSelected()
    {
        Gizmos.color = Color.red;
        Gizmos.DrawWireSphere(transform.position, attackRange);
    }
}

// 护甲系统
public class Armor : MonoBehaviour
{
    [Header("护甲属性")]
    public int armorValue = 10;  // 减少的伤害值
    public float damageReductionPercentage = 0.2f;  // 伤害减免百分比

    public int ApplyDamageReduction(int incomingDamage)
    {
        // 先应用固定值减免，再应用百分比减免
        int reducedDamage = incomingDamage - armorValue;
        reducedDamage = Mathf.Max(1, reducedDamage);  // 至少造成1点伤害
        
        float percentageReduction = reducedDamage * damageReductionPercentage;
        int finalDamage = Mathf.RoundToInt(reducedDamage - percentageReduction);
        
        return Mathf.Max(1, finalDamage);  // 至少造成1点伤害
    }
}

// 爆炸伤害系统
public class Explosion : MonoBehaviour
{
    [Header("爆炸属性")]
    public float explosionRadius = 5f;
    public int explosionDamage = 50;
    public float explosionForce = 1000f;
    public LayerMask affectedLayers;

    public void Explode()
    {
        // 显示爆炸效果
        ShowExplosionEffect();

        // 检测爆炸范围内的所有对象
        Collider[] colliders = Physics.OverlapSphere(transform.position, explosionRadius, affectedLayers);

        foreach (Collider collider in colliders)
        {
            float distance = Vector3.Distance(collider.transform.position, transform.position);
            float damageFalloff = 1f - (distance / explosionRadius);
            int damage = Mathf.RoundToInt(explosionDamage * damageFalloff);

            // 应用伤害
            IDamageable damageable = collider.GetComponent<IDamageable>();
            if (damageable != null)
            {
                damageable.TakeDamage(damage);
            }

            // 应用爆炸力
            Rigidbody rb = collider.GetComponent<Rigidbody>();
            if (rb != null)
            {
                Vector3 explosionDirection = collider.transform.position - transform.position;
                rb.AddExplosionForce(explosionForce * damageFalloff, transform.position, explosionRadius);
            }
        }

        // 销毁爆炸对象
        Destroy(gameObject);
    }

    void ShowExplosionEffect()
    {
        // 播放爆炸粒子效果
        // 播放爆炸音效
    }

    void OnDrawGizmosSelected()
    {
        Gizmos.color = Color.red;
        Gizmos.DrawWireSphere(transform.position, explosionRadius);
    }
}

// 碰撞伤害触发器
public class DamageTrigger : MonoBehaviour
{
    [Header("触发器设置")]
    public int damageAmount = 20;
    public LayerMask affectedLayers;
    public float triggerInterval = 1f;  // 触发间隔

    private Dictionary<GameObject, float> lastTriggerTime = new Dictionary<GameObject, float>();

    void OnTriggerEnter(Collider other)
    {
        if (IsAffectedLayer(other.gameObject))
        {
            HandleDamage(other.gameObject);
        }
    }

    void OnTriggerStay(Collider other)
    {
        if (IsAffectedLayer(other.gameObject))
        {
            float currentTime = Time.time;
            if (!lastTriggerTime.ContainsKey(other.gameObject) || 
                currentTime - lastTriggerTime[other.gameObject] >= triggerInterval)
            {
                HandleDamage(other.gameObject);
                lastTriggerTime[other.gameObject] = currentTime;
            }
        }
    }

    bool IsAffectedLayer(GameObject obj)
    {
        return ((1 << obj.layer) & affectedLayers) != 0;
    }

    void HandleDamage(GameObject target)
    {
        IDamageable damageable = target.GetComponent<IDamageable>();
        if (damageable != null)
        {
            damageable.TakeDamage(damageAmount);
        }
    }
}
```

### 20. 解释游戏中的资源管理和内存优化

**答案：**

游戏资源管理和内存优化是确保游戏性能的关键：

```csharp
using UnityEngine;
using System.Collections;
using System.Collections.Generic;

// 资源管理器
public class ResourceManager : MonoBehaviour
{
    private static ResourceManager _instance;
    public static ResourceManager Instance
    {
        get
        {
            if (_instance == null)
            {
                GameObject managerObject = new GameObject("ResourceManager");
                _instance = managerObject.AddComponent<ResourceManager>();
            }
            return _instance;
        }
    }

    // 资源缓存
    private Dictionary<string, Object> loadedAssets = new Dictionary<string, Object>();
    private Dictionary<string, int> referenceCounts = new Dictionary<string, int>();
    private Dictionary<string, float> lastAccessTime = new Dictionary<string, float>();

    [Header("资源管理设置")]
    public float cleanupInterval = 300f;  // 5分钟清理一次
    public float maxIdleTime = 600f;     // 10分钟未使用就清理

    private float lastCleanupTime = 0f;

    void Update()
    {
        if (Time.time - lastCleanupTime >= cleanupInterval)
        {
            CleanupUnusedResources();
            lastCleanupTime = Time.time;
        }
    }

    // 异步加载资源
    public Coroutine LoadAssetAsync<T>(string path, System.Action<T> callback) where T : Object
    {
        return StartCoroutine(LoadAssetAsyncCoroutine(path, callback));
    }

    private IEnumerator LoadAssetAsyncCoroutine<T>(string path, System.Action<T> callback) where T : Object
    {
        // 检查是否已加载
        if (loadedAssets.ContainsKey(path))
        {
            referenceCounts[path]++;
            lastAccessTime[path] = Time.time;
            
            T asset = loadedAssets[path] as T;
            callback?.Invoke(asset);
            yield break;
        }

        // 异步加载
        ResourceRequest request = Resources.LoadAsync<T>(path);
        yield return request;

        if (request.asset != null)
        {
            T asset = request.asset as T;
            loadedAssets[path] = asset;
            referenceCounts[path] = 1;
            lastAccessTime[path] = Time.time;
            
            callback?.Invoke(asset);
        }
        else
        {
            Debug.LogError($"无法加载资源: {path}");
            callback?.Invoke(null);
        }
    }

    // 同步加载资源
    public T LoadAsset<T>(string path) where T : Object
    {
        if (loadedAssets.ContainsKey(path))
        {
            referenceCounts[path]++;
            lastAccessTime[path] = Time.time;
            return loadedAssets[path] as T;
        }

        T asset = Resources.Load<T>(path);
        if (asset != null)
        {
            loadedAssets[path] = asset;
            referenceCounts[path] = 1;
            lastAccessTime[path] = Time.time;
        }
        else
        {
            Debug.LogError($"无法加载资源: {path}");
        }

        return asset;
    }

    // 释放资源
    public void UnloadAsset(string path)
    {
        if (referenceCounts.ContainsKey(path))
        {
            referenceCounts[path]--;
            
            if (referenceCounts[path] <= 0)
            {
                // 真正卸载资源
                if (loadedAssets.ContainsKey(path))
                {
                    Object asset = loadedAssets[path];
                    
                    // 根据资源类型选择卸载方式
                    if (asset is GameObject || asset is Component)
                    {
                        // 游戏对象使用Destroy
                        Destroy(asset);
                    }
                    else
                    {
                        // 其他资源使用Resources.UnloadAsset
                        Resources.UnloadAsset(asset);
                    }

                    loadedAssets.Remove(path);
                    referenceCounts.Remove(path);
                    lastAccessTime.Remove(path);
                }
            }
        }
    }

    // 清理未使用的资源
    private void CleanupUnusedResources()
    {
        List<string> toRemove = new List<string>();
        float currentTime = Time.time;

        foreach (var kvp in lastAccessTime)
        {
            if (currentTime - kvp.Value > maxIdleTime && referenceCounts[kvp.Key] <= 0)
            {
                toRemove.Add(kvp.Key);
            }
        }

        foreach (string path in toRemove)
        {
            UnloadAsset(path);
        }

        // 强制垃圾回收
        System.GC.Collect();
    }

    // 预加载资源
    public void PreloadAssets(List<string> assetPaths)
    {
        foreach (string path in assetPaths)
        {
            LoadAsset<Object>(path);
        }
    }

    // 卸载所有未使用的资源
    public void UnloadUnusedAssets()
    {
        Resources.UnloadUnusedAssets();
    }

    // 获取资源使用统计
    public ResourceStats GetResourceStats()
    {
        return new ResourceStats
        {
            loadedAssetCount = loadedAssets.Count,
            totalReferenceCount = 0,
            memoryUsage = System.GC.GetTotalMemory(false)
        };
    }
}

[System.Serializable]
public class ResourceStats
{
    public int loadedAssetCount;
    public int totalReferenceCount;
    public long memoryUsage;
}

// 纹理压缩和优化
public class TextureOptimizer : MonoBehaviour
{
    [Header("纹理优化设置")]
    public bool compressTextures = true;
    public int maxTextureSize = 1024;
    public TextureFormat targetFormat = TextureFormat.RGBA32;

    public Texture2D OptimizeTexture(Texture2D originalTexture)
    {
        if (originalTexture == null) return null;

        // 调整纹理大小
        Texture2D optimizedTexture = ResizeTexture(originalTexture, maxTextureSize);

        // 应用压缩（在编辑器中设置）
        #if UNITY_EDITOR
        if (compressTextures)
        {
            UnityEditor.TextureImporter importer = 
                (UnityEditor.TextureImporter)UnityEditor.TextureImporter.GetAtPath(
                    UnityEditor.AssetDatabase.GetAssetPath(optimizedTexture));
            
            if (importer != null)
            {
                importer.maxTextureSize = maxTextureSize;
                importer.textureCompression = UnityEditor.TextureImporterCompression.Compressed;
                importer.SaveAndReimport();
            }
        }
        #endif

        return optimizedTexture;
    }

    Texture2D ResizeTexture(Texture2D original, int maxSize)
    {
        int width = original.width;
        int height = original.height;

        // 保持宽高比
        if (width > maxSize || height > maxSize)
        {
            float aspectRatio = (float)width / height;
            if (width > height)
            {
                width = maxSize;
                height = Mathf.RoundToInt(maxSize / aspectRatio);
            }
            else
            {
                height = maxSize;
                width = Mathf.RoundToInt(maxSize * aspectRatio);
            }
        }

        // 创建新的纹理
        Texture2D resized = new Texture2D(width, height, original.format, false);
        
        // 缩放纹理内容（简化实现）
        // 实际项目中可能需要更复杂的缩放算法
        Color[] pixels = original.GetPixels(0, 0, width, height);
        resized.SetPixels(pixels);
        resized.Apply();

        return resized;
    }
}

// 内存监控器
public class MemoryMonitor : MonoBehaviour
{
    [Header("内存监控设置")]
    public float monitorInterval = 1f;
    public long memoryWarningThreshold = 500 * 1024 * 1024; // 500MB

    private float lastMonitorTime = 0f;
    private List<long> memoryHistory = new List<long>();

    void Update()
    {
        if (Time.time - lastMonitorTime >= monitorInterval)
        {
            MonitorMemory();
            lastMonitorTime = Time.time;
        }
    }

    void MonitorMemory()
    {
        long currentMemory = System.GC.GetTotalMemory(false);
        memoryHistory.Add(currentMemory);

        if (memoryHistory.Count > 60) // 保留最近60次记录
        {
            memoryHistory.RemoveAt(0);
        }

        if (currentMemory > memoryWarningThreshold)
        {
            Debug.LogWarning($"内存使用警告: {FormatBytes(currentMemory)}");
            GenerateMemoryReport();
        }
    }

    void GenerateMemoryReport()
    {
        System.Text.StringBuilder report = new System.Text.StringBuilder();
        report.AppendLine("=== 内存使用报告 ===");
        report.AppendLine($"当前内存: {FormatBytes(System.GC.GetTotalMemory(false))}");
        report.AppendLine($"Unity分配: {FormatBytes(UnityEngine.Profiling.Profiler.GetTotalAllocatedMemoryLong())}");
        report.AppendLine($"GC次数: {System.GC.CollectionCount(0)}/{System.GC.CollectionCount(1)}/{System.GC.CollectionCount(2)}");
        
        // 统计对象数量
        Object[] allObjects = Resources.FindObjectsOfTypeAll<Object>();
        System.Collections.Generic.Dictionary<string, int> typeCounts = new System.Collections.Generic.Dictionary<string, int>();
        
        foreach (Object obj in allObjects)
        {
            string typeName = obj.GetType().Name;
            if (typeCounts.ContainsKey(typeName))
            {
                typeCounts[typeName]++;
            }
            else
            {
                typeCounts[typeName] = 1;
            }
        }
        
        report.AppendLine("对象类型统计:");
        foreach (var kvp in typeCounts)
        {
            report.AppendLine($"  {kvp.Key}: {kvp.Value}");
        }

        Debug.Log(report.ToString());
    }

    string FormatBytes(long bytes)
    {
        string[] suffixes = { "B", "KB", "MB", "GB" };
        int counter = 0;
        decimal number = (decimal)bytes;
        
        while (Math.Abs(number) >= 1024m && counter < suffixes.Length - 1)
        {
            counter++;
            number /= 1024m;
        }
        
        return string.Format("{0:n1} {1}", number, suffixes[counter]);
    }

    public void ForceGarbageCollection()
    {
        System.GC.Collect();
        System.GC.WaitForPendingFinalizers();
    }
}
```

---

## 系统设计题

### 21. 设计一个游戏配置管理系统

**答案：**

游戏配置管理系统用于管理游戏的各种配置数据：

```csharp
using UnityEngine;
using System.Collections.Generic;
using System.IO;
using System.Runtime.Serialization.Formatters.Binary;

// 配置数据基类
[System.Serializable]
public abstract class GameConfig
{
    public string configName;
    public System.DateTime lastModified;
}

// 玩家配置
[System.Serializable]
public class PlayerConfig : GameConfig
{
    public float mouseSensitivity = 1.0f;
    public bool invertYAxis = false;
    public int graphicsQuality = 2; // 0=Low, 1=Medium, 2=High, 3=Ultra
    public float masterVolume = 1.0f;
    public float musicVolume = 1.0f;
    public float sfxVolume = 1.0f;
    public bool fullScreen = true;
    public int resolutionWidth = 1920;
    public int resolutionHeight = 1080;
}

// 游戏配置
[System.Serializable]
public class GameSettingsConfig : GameConfig
{
    public int startingLives = 3;
    public float gameSpeed = 1.0f;
    public bool enableCheats = false;
    public int maxPlayers = 4;
    public float difficultyMultiplier = 1.0f;
}

// 关卡配置
[System.Serializable]
public class LevelConfig : GameConfig
{
    public string levelName;
    public int levelNumber;
    public int parTime;
    public int parScore;
    public List<string> requiredItems;
    public List<string> enemyTypes;
    public string nextLevel;
}

// 配置管理器
public class ConfigManager : MonoBehaviour
{
    private static ConfigManager _instance;
    public static ConfigManager Instance
    {
        get
        {
            if (_instance == null)
            {
                GameObject configObject = new GameObject("ConfigManager");
                _instance = configObject.AddComponent<ConfigManager>();
            }
            return _instance;
        }
    }

    private Dictionary<string, GameConfig> configs = new Dictionary<string, GameConfig>();
    private string configPath;

    void Awake()
    {
        if (_instance == null)
        {
            _instance = this;
            DontDestroyOnLoad(gameObject);
            Initialize();
        }
        else
        {
            Destroy(gameObject);
        }
    }

    void Initialize()
    {
        configPath = Path.Combine(Application.persistentDataPath, "Configs");
        if (!Directory.Exists(configPath))
        {
            Directory.CreateDirectory(configPath);
        }

        // 加载所有配置
        LoadAllConfigs();
    }

    // 保存配置
    public void SaveConfig<T>(T config) where T : GameConfig
    {
        string filePath = Path.Combine(configPath, config.configName + ".dat");
        
        try
        {
            using (FileStream fileStream = new FileStream(filePath, FileMode.Create))
            {
                BinaryFormatter formatter = new BinaryFormatter();
                formatter.Serialize(fileStream, config);
            }
            
            // 更新内存中的配置
            configs[config.configName] = config;
            config.lastModified = System.DateTime.Now;
            
            Debug.Log($"配置已保存: {filePath}");
        }
        catch (System.Exception e)
        {
            Debug.LogError($"保存配置失败: {e.Message}");
        }
    }

    // 加载配置
    public T LoadConfig<T>(string configName) where T : GameConfig
    {
        string filePath = Path.Combine(configPath, configName + ".dat");
        
        if (File.Exists(filePath))
        {
            try
            {
                using (FileStream fileStream = new FileStream(filePath, FileMode.Open))
                {
                    BinaryFormatter formatter = new BinaryFormatter();
                    T config = (T)formatter.Deserialize(fileStream);
                    
                    // 更新内存缓存
                    configs[configName] = config;
                    
                    Debug.Log($"配置已加载: {filePath}");
                    return config;
                }
            }
            catch (System.Exception e)
            {
                Debug.LogError($"加载配置失败: {e.Message}");
            }
        }
        
        // 如果文件不存在或加载失败，返回默认配置
        return CreateDefaultConfig<T>(configName);
    }

    // 创建默认配置
    private T CreateDefaultConfig<T>(string configName) where T : GameConfig
    {
        T config = System.Activator.CreateInstance<T>();
        config.configName = configName;
        config.lastModified = System.DateTime.Now;
        
        // 根据类型设置默认值
        if (config is PlayerConfig)
        {
            PlayerConfig playerConfig = config as PlayerConfig;
            playerConfig.mouseSensitivity = 1.0f;
            playerConfig.graphicsQuality = 2;
            playerConfig.masterVolume = 1.0f;
        }
        else if (config is GameSettingsConfig)
        {
            GameSettingsConfig gameConfig = config as GameSettingsConfig;
            gameConfig.startingLives = 3;
            gameConfig.gameSpeed = 1.0f;
        }
        
        return config;
    }

    // 加载所有配置
    private void LoadAllConfigs()
    {
        if (Directory.Exists(configPath))
        {
            string[] files = Directory.GetFiles(configPath, "*.dat");
            foreach (string file in files)
            {
                string fileName = Path.GetFileNameWithoutExtension(file);
                // 这里可以根据文件名和内容来加载不同类型的配置
                // 简化实现，只记录文件名
                Debug.Log($"发现配置文件: {fileName}");
            }
        }
    }

    // 检查配置是否存在
    public bool HasConfig(string configName)
    {
        return configs.ContainsKey(configName) || 
               File.Exists(Path.Combine(configPath, configName + ".dat"));
    }

    // 删除配置
    public void DeleteConfig(string configName)
    {
        string filePath = Path.Combine(configPath, configName + ".dat");
        if (File.Exists(filePath))
        {
            File.Delete(filePath);
        }
        
        configs.Remove(configName);
    }

    // 获取所有配置名称
    public List<string> GetAllConfigNames()
    {
        List<string> names = new List<string>();
        
        // 从内存缓存获取
        foreach (string name in configs.Keys)
        {
            names.Add(name);
        }
        
        // 从文件系统获取
        if (Directory.Exists(configPath))
        {
            string[] files = Directory.GetFiles(configPath, "*.dat");
            foreach (string file in files)
            {
                string name = Path.GetFileNameWithoutExtension(file);
                if (!names.Contains(name))
                {
                    names.Add(name);
                }
            }
        }
        
        return names;
    }

    // 应用玩家配置到游戏系统
    public void ApplyPlayerConfig(PlayerConfig config)
    {
        if (config != null)
        {
            // 应用鼠标灵敏度
            MouseLook.sensitivity = config.mouseSensitivity;
            MouseLook.invertY = config.invertYAxis;

            // 应用图形设置
            QualitySettings.SetQualityLevel(config.graphicsQuality);

            // 应用音频设置
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.SetMasterVolume(config.masterVolume);
                AudioManager.Instance.SetMusicVolume(config.musicVolume);
                AudioManager.Instance.SetSFXVolume(config.sfxVolume);
            }

            // 应用分辨率设置
            Screen.SetResolution(config.resolutionWidth, config.resolutionHeight, config.fullScreen);
        }
    }

    // 重置所有配置到默认值
    public void ResetAllConfigs()
    {
        configs.Clear();
        
        // 删除所有配置文件
        if (Directory.Exists(configPath))
        {
            Directory.Delete(configPath, true);
            Directory.CreateDirectory(configPath);
        }
    }
}

// 配置变化监听器
public class ConfigChangeListener : MonoBehaviour
{
    private PlayerConfig lastPlayerConfig;

    void Start()
    {
        // 加载初始配置
        lastPlayerConfig = ConfigManager.Instance.LoadConfig<PlayerConfig>("PlayerConfig");
    }

    void Update()
    {
        // 定期检查配置变化（实际项目中可能使用事件系统）
        CheckConfigChanges();
    }

    void CheckConfigChanges()
    {
        PlayerConfig currentConfig = ConfigManager.Instance.LoadConfig<PlayerConfig>("PlayerConfig");
        
        if (currentConfig != null && lastPlayerConfig != null)
        {
            // 检查是否有变化
            if (currentConfig.mouseSensitivity != lastPlayerConfig.mouseSensitivity ||
                currentConfig.graphicsQuality != lastPlayerConfig.graphicsQuality ||
                currentConfig.masterVolume != lastPlayerConfig.masterVolume)
            {
                // 应用变化
                ConfigManager.Instance.ApplyPlayerConfig(currentConfig);
                lastPlayerConfig = currentConfig;
            }
        }
    }
}

// JSON配置管理器（替代方案）
public class JsonConfigManager : MonoBehaviour
{
    private static JsonConfigManager _instance;
    public static JsonConfigManager Instance
    {
        get
        {
            if (_instance == null)
            {
                GameObject obj = new GameObject("JsonConfigManager");
                _instance = obj.AddComponent<JsonConfigManager>();
            }
            return _instance;
        }
    }

    private Dictionary<string, string> jsonConfigs = new Dictionary<string, string>();

    // 保存JSON配置
    public void SaveJsonConfig<T>(string configName, T config) where T : class
    {
        string json = JsonUtility.ToJson(config, true);
        string filePath = Path.Combine(Application.persistentDataPath, configName + ".json");
        
        File.WriteAllText(filePath, json);
        jsonConfigs[configName] = json;
    }

    // 加载JSON配置
    public T LoadJsonConfig<T>(string configName) where T : class
    {
        string filePath = Path.Combine(Application.persistentDataPath, configName + ".json");
        
        if (File.Exists(filePath))
        {
            string json = File.ReadAllText(filePath);
            jsonConfigs[configName] = json;
            return JsonUtility.FromJson<T>(json);
        }
        
        return null;
    }
}
```

### 22. 设计一个成就系统

**答案：**

成就系统用于跟踪玩家的游戏进度和奖励：

```csharp
using UnityEngine;
using System.Collections.Generic;
using System.Linq;

// 成就类型枚举
public enum AchievementType
{
    ScoreBased,      // 基于分数
    TimeBased,       // 基于时间
    LevelBased,      // 基于关卡
    ItemBased,       // 基于物品收集
    EnemyBased,      // 基于敌人击杀
    Multiplayer,     // 多人游戏相关
    Challenge        // 挑战类型
}

// 成就状态
public enum AchievementStatus
{
    Locked,      // 未解锁
    Unlocked,    // 已解锁
    InProgress   // 进行中
}

// 成就数据
[System.Serializable]
public class AchievementData
{
    public string id;
    public string title;
    public string description;
    public AchievementType type;
    public AchievementStatus status = AchievementStatus.Locked;
    public int targetValue;
    public int currentValue = 0;
    public string iconPath;
    public int rewardPoints = 0;
    public System.DateTime unlockDate;
    public bool hidden = false; // 隐藏成就
}

// 成就进度数据
[System.Serializable]
public class AchievementProgress
{
    public string achievementId;
    public int progressValue;
    public System.DateTime lastUpdated;
}

// 成就系统
public class AchievementSystem : MonoBehaviour
{
    private static AchievementSystem _instance;
    public static AchievementSystem Instance
    {
        get
        {
            if (_instance == null)
            {
                GameObject obj = new GameObject("AchievementSystem");
                _instance = obj.AddComponent<AchievementSystem>();
            }
            return _instance;
        }
    }

    [Header("成就配置")]
    public List<AchievementData> allAchievements = new List<AchievementData>();
    private List<AchievementProgress> progressData = new List<AchievementProgress>();
    private List<string> unlockedAchievements = new List<string>();

    [Header("UI引用")]
    public AchievementUI achievementUI;

    void Awake()
    {
        if (_instance == null)
        {
            _instance = this;
            DontDestroyOnLoad(gameObject);
            Initialize();
        }
        else
        {
            Destroy(gameObject);
        }
    }

    void Initialize()
    {
        // 加载成就数据
        LoadAchievements();
        LoadProgress();
        
        // 注册游戏事件监听器
        RegisterGameEventListeners();
    }

    // 注册游戏事件监听器
    private void RegisterGameEventListeners()
    {
        // 订阅游戏事件
        GameEvents.OnScoreChanged += OnScoreChanged;
        GameEvents.OnLevelComplete += OnLevelComplete;
        GameEvents.OnEnemyKilled += OnEnemyKilled;
        GameEvents.OnItemCollected += OnItemCollected;
    }

    // 加载成就定义
    private void LoadAchievements()
    {
        // 从配置文件或资源中加载成就定义
        // 这里使用硬编码示例
        allAchievements.Add(new AchievementData
        {
            id = "ACH_FIRST_WIN",
            title = "首胜",
            description = "赢得第一场游戏",
            type = AchievementType.LevelBased,
            targetValue = 1,
            rewardPoints = 10
        });

        allAchievements.Add(new AchievementData
        {
            id = "ACH_SCORE_1000",
            title = "千分王",
            description = "单局得分达到1000分",
            type = AchievementType.ScoreBased,
            targetValue = 1000,
            rewardPoints = 25
        });

        allAchievements.Add(new AchievementData
        {
            id = "ACH_KILL_100_ENEMIES",
            title = "杀戮机器",
            description = "击杀100个敌人",
            type = AchievementType.EnemyBased,
            targetValue = 100,
            rewardPoints = 50
        });

        allAchievements.Add(new AchievementData
        {
            id = "ACH_COLLECT_50_ITEMS",
            title = "收藏家",
            description = "收集50个物品",
            type = AchievementType.ItemBased,
            targetValue = 50,
            rewardPoints = 30
        });
    }

    // 加载进度数据
    private void LoadProgress()
    {
        // 从PlayerPrefs或文件加载进度
        string progressJson = PlayerPrefs.GetString("AchievementProgress", "");
        if (!string.IsNullOrEmpty(progressJson))
        {
            progressData = JsonUtility.FromJson<ListWrapper<AchievementProgress>>(progressJson).items;
        }

        string unlockedJson = PlayerPrefs.GetString("UnlockedAchievements", "");
        if (!string.IsNullOrEmpty(unlockedJson))
        {
            unlockedAchievements = JsonUtility.FromJson<ListWrapper<string>>(unlockedJson).items;
        }

        // 更新成就状态
        UpdateAchievementStatus();
    }

    // 保存进度数据
    private void SaveProgress()
    {
        string progressJson = JsonUtility.ToJson(new ListWrapper<AchievementProgress> { items = progressData });
        PlayerPrefs.SetString("AchievementProgress", progressJson);

        string unlockedJson = JsonUtility.ToJson(new ListWrapper<string> { items = unlockedAchievements });
        PlayerPrefs.SetString("UnlockedAchievements", unlockedJson);
        
        PlayerPrefs.Save();
    }

    // 更新成就状态
    private void UpdateAchievementStatus()
    {
        foreach (AchievementData achievement in allAchievements)
        {
            AchievementProgress progress = GetProgress(achievement.id);
            
            if (unlockedAchievements.Contains(achievement.id))
            {
                achievement.status = AchievementStatus.Unlocked;
            }
            else if (progress != null && progress.progressValue >= achievement.targetValue)
            {
                // 解锁成就
                UnlockAchievement(achievement.id);
            }
            else if (progress != null && progress.progressValue > 0)
            {
                achievement.status = AchievementStatus.InProgress;
                achievement.currentValue = progress.progressValue;
            }
        }
    }

    // 获取进度
    private AchievementProgress GetProgress(string achievementId)
    {
        return progressData.FirstOrDefault(p => p.achievementId == achievementId);
    }

    // 更新成就进度
    public void UpdateAchievementProgress(string achievementId, int value)
    {
        AchievementData achievement = allAchievements.FirstOrDefault(a => a.id == achievementId);
        if (achievement == null) return;

        // 获取或创建进度数据
        AchievementProgress progress = GetProgress(achievementId);
        if (progress == null)
        {
            progress = new AchievementProgress
            {
                achievementId = achievementId,
                progressValue = 0
            };
            progressData.Add(progress);
        }

        // 更新进度
        progress.progressValue = Mathf.Max(progress.progressValue, value);
        progress.lastUpdated = System.DateTime.Now;

        // 更新成就数据
        achievement.currentValue = progress.progressValue;

        // 检查是否解锁
        if (progress.progressValue >= achievement.targetValue && !unlockedAchievements.Contains(achievementId))
        {
            UnlockAchievement(achievementId);
        }

        // 保存进度
        SaveProgress();

        // 更新UI
        achievementUI?.UpdateAchievementUI(achievement);
    }

    // 解锁成就
    private void UnlockAchievement(string achievementId)
    {
        AchievementData achievement = allAchievements.FirstOrDefault(a => a.id == achievementId);
        if (achievement == null) return;

        if (!unlockedAchievements.Contains(achievementId))
        {
            // 标记为已解锁
            achievement.status = AchievementStatus.Unlocked;
            achievement.unlockDate = System.DateTime.Now;
            unlockedAchievements.Add(achievementId);

            // 给予奖励
            GrantAchievementReward(achievement);

            // 触发解锁事件
            OnAchievementUnlocked?.Invoke(achievement);

            // 显示解锁通知
            ShowAchievementNotification(achievement);

            Debug.Log($"成就解锁: {achievement.title}");
        }
    }

    // 给予成就奖励
    private void GrantAchievementReward(AchievementData achievement)
    {
        // 给予积分奖励
        if (achievement.rewardPoints > 0)
        {
            GameManager.Instance?.AddScore(achievement.rewardPoints);
        }

        // 可以添加其他奖励，如道具、称号等
    }

    // 显示成就解锁通知
    private void ShowAchievementNotification(AchievementData achievement)
    {
        if (achievementUI != null)
        {
            achievementUI.ShowUnlockNotification(achievement);
        }
    }

    // 事件处理方法
    private void OnScoreChanged(int newScore)
    {
        // 更新分数相关成就
        UpdateAchievementProgress("ACH_SCORE_1000", newScore);
    }

    private void OnLevelComplete(int levelNumber)
    {
        // 更新关卡相关成就
        UpdateAchievementProgress("ACH_FIRST_WIN", levelNumber >= 1 ? 1 : 0);
    }

    private void OnEnemyKilled(string enemyType)
    {
        // 统计击杀数
        int killCount = GetKillCount();
        UpdateAchievementProgress("ACH_KILL_100_ENEMIES", killCount);
    }

    private void OnItemCollected(string itemType)
    {
        // 统计收集数
        int collectCount = GetCollectCount();
        UpdateAchievementProgress("ACH_COLLECT_50_ITEMS", collectCount);
    }

    // 获取击杀统计
    private int GetKillCount()
    {
        AchievementProgress progress = GetProgress("ACH_KILL_100_ENEMIES");
        return progress?.progressValue ?? 0;
    }

    // 获取收集统计
    private int GetCollectCount()
    {
        AchievementProgress progress = GetProgress("ACH_COLLECT_50_ITEMS");
        return progress?.progressValue ?? 0;
    }

    // 获取所有成就
    public List<AchievementData> GetAllAchievements()
    {
        return new List<AchievementData>(allAchievements);
    }

    // 获取已解锁成就数量
    public int GetUnlockedCount()
    {
        return unlockedAchievements.Count;
    }

    // 获取总成就数量
    public int GetTotalCount()
    {
        return allAchievements.Count;
    }

    // 获取成就进度百分比
    public float GetCompletionPercentage()
    {
        return allAchievements.Count > 0 ? (float)unlockedAchievements.Count / allAchievements.Count : 0f;
    }

    // 成就解锁事件
    public System.Action<AchievementData> OnAchievementUnlocked;

    // 重置所有成就进度
    public void ResetAllProgress()
    {
        progressData.Clear();
        unlockedAchievements.Clear();

        // 重置成就状态
        foreach (AchievementData achievement in allAchievements)
        {
            achievement.status = AchievementStatus.Locked;
            achievement.currentValue = 0;
        }

        SaveProgress();
    }

    void OnDestroy()
    {
        // 注销事件监听器
        GameEvents.OnScoreChanged -= OnScoreChanged;
        GameEvents.OnLevelComplete -= OnLevelComplete;
        GameEvents.OnEnemyKilled -= OnEnemyKilled;
        GameEvents.OnItemCollected -= OnItemCollected;
    }
}

// 成就UI管理器
public class AchievementUI : MonoBehaviour
{
    public GameObject achievementPanel;
    public Transform achievementListParent;
    public GameObject achievementItemPrefab;

    private List<AchievementItemUI> achievementItems = new List<AchievementItemUI>();

    void Start()
    {
        LoadAchievements();
    }

    void LoadAchievements()
    {
        if (AchievementSystem.Instance != null)
        {
            List<AchievementData> achievements = AchievementSystem.Instance.GetAllAchievements();
            
            foreach (AchievementData achievement in achievements)
            {
                CreateAchievementItem(achievement);
            }
        }
    }

    void CreateAchievementItem(AchievementData achievement)
    {
        GameObject itemObj = Instantiate(achievementItemPrefab, achievementListParent);
        AchievementItemUI itemUI = itemObj.GetComponent<AchievementItemUI>();
        
        if (itemUI != null)
        {
            itemUI.Initialize(achievement);
            achievementItems.Add(itemUI);
        }
    }

    public void UpdateAchievementUI(AchievementData achievement)
    {
        AchievementItemUI item = achievementItems.FirstOrDefault(i => i.GetAchievementId() == achievement.id);
        if (item != null)
        {
            item.UpdateDisplay(achievement);
        }
    }

    public void ShowUnlockNotification(AchievementData achievement)
    {
        // 显示解锁通知动画
        Debug.Log($"显示成就解锁通知: {achievement.title}");
    }
}

// 成就项目UI
public class AchievementItemUI : MonoBehaviour
{
    public TMPro.TextMeshProUGUI titleText;
    public TMPro.TextMeshProUGUI descriptionText;
    public TMPro.TextMeshProUGUI progressText;
    public UnityEngine.UI.Image iconImage;
    public UnityEngine.UI.Image lockImage;
    public UnityEngine.UI.Slider progressSlider;

    private AchievementData achievementData;

    public void Initialize(AchievementData achievement)
    {
        achievementData = achievement;
        UpdateDisplay(achievement);
    }

    public void UpdateDisplay(AchievementData achievement)
    {
        if (titleText != null) titleText.text = achievement.title;
        if (descriptionText != null) descriptionText.text = achievement.description;

        if (progressSlider != null)
        {
            progressSlider.maxValue = achievement.targetValue;
            progressSlider.value = achievement.currentValue;
        }

        if (progressText != null)
        {
            if (achievement.status == AchievementStatus.Unlocked)
            {
                progressText.text = "已解锁";
            }
            else if (achievement.status == AchievementStatus.InProgress)
            {
                progressText.text = $"{achievement.currentValue}/{achievement.targetValue}";
            }
            else
            {
                progressText.text = "锁定";
            }
        }

        if (lockImage != null)
        {
            lockImage.gameObject.SetActive(achievement.status == AchievementStatus.Locked);
        }
    }

    public string GetAchievementId()
    {
        return achievementData?.id;
    }
}

// 用于JSON序列化的包装类
[System.Serializable]
public class ListWrapper<T>
{
    public List<T> items;
}
```

---

## 算法题（游戏开发相关）

### 23. 实现A*寻路算法

**答案：**

A*算法是游戏中最常用的寻路算法之一：

```csharp
using UnityEngine;
using System.Collections.Generic;
using System.Linq;

// 网格节点
public class PathNode
{
    public int x, y;
    public float gCost; // 从起点到当前节点的代价
    public float hCost; // 从当前节点到终点的启发式代价
    public float fCost => gCost + hCost; // 总代价
    public PathNode parent;
    public bool isWalkable;

    public PathNode(int x, int y, bool walkable)
    {
        this.x = x;
        this.y = y;
        this.isWalkable = walkable;
    }
}

// A*寻路系统
public class AStarPathfinding : MonoBehaviour
{
    [Header("寻路设置")]
    public int gridSizeX = 20;
    public int gridSizeY = 20;
    public float nodeSize = 1f;
    public LayerMask unwalkableMask;

    private PathNode[,] grid;
    private List<PathNode> openSet;
    private HashSet<PathNode> closedSet;

    void Start()
    {
        CreateGrid();
    }

    // 创建网格
    void CreateGrid()
    {
        grid = new PathNode[gridSizeX, gridSizeY];

        Vector3 worldBottomLeft = transform.position - 
            Vector3.right * gridSizeX * nodeSize / 2 - 
            Vector3.forward * gridSizeY * nodeSize / 2;

        for (int x = 0; x < gridSizeX; x++)
        {
            for (int y = 0; y < gridSizeY; y++)
            {
                Vector3 worldPoint = worldBottomLeft + 
                    Vector3.right * (x * nodeSize + nodeSize / 2) + 
                    Vector3.forward * (y * nodeSize + nodeSize / 2);

                bool walkable = !Physics.CheckSphere(worldPoint, nodeSize / 2, unwalkableMask);
                grid[x, y] = new PathNode(x, y, walkable);
            }
        }
    }

    // 寻路主方法
    public List<Vector3> FindPath(Vector3 startPos, Vector3 targetPos)
    {
        PathNode startNode = GetNodeFromWorldPoint(startPos);
        PathNode targetNode = GetNodeFromWorldPoint(targetPos);

        if (!startNode.isWalkable || !targetNode.isWalkable)
        {
            return null; // 起点或终点不可行走
        }

        openSet = new List<PathNode>();
        closedSet = new HashSet<PathNode>();

        openSet.Add(startNode);

        while (openSet.Count > 0)
        {
            PathNode currentNode = openSet.OrderBy(node => node.fCost).First();
            openSet.Remove(currentNode);
            closedSet.Add(currentNode);

            if (currentNode == targetNode)
            {
                // 找到路径，回溯路径
                return RetracePath(startNode, targetNode);
            }

            // 检查相邻节点
            foreach (PathNode neighbor in GetNeighboringNodes(currentNode))
            {
                if (!neighbor.isWalkable || closedSet.Contains(neighbor))
                {
                    continue;
                }

                float newMovementCostToNeighbor = currentNode.gCost + GetDistance(currentNode, neighbor);

                if (newMovementCostToNeighbor < neighbor.gCost || !openSet.Contains(neighbor))
                {
                    neighbor.gCost = newMovementCostToNeighbor;
                    neighbor.hCost = GetDistance(neighbor, targetNode);
                    neighbor.parent = currentNode;

                    if (!openSet.Contains(neighbor))
                    {
                        openSet.Add(neighbor);
                    }
                }
            }
        }

        return null; // 没有找到路径
    }

    // 回溯路径
    List<Vector3> RetracePath(PathNode startNode, PathNode endNode)
    {
        List<PathNode> path = new List<PathNode>();
        PathNode currentNode = endNode;

        while (currentNode != startNode)
        {
            path.Add(currentNode);
            currentNode = currentNode.parent;
        }

        path.Reverse();

        // 转换为世界坐标
        List<Vector3> worldPath = new List<Vector3>();
        foreach (PathNode node in path)
        {
            worldPath.Add(GetWorldPointFromNode(node));
        }

        return worldPath;
    }

    // 获取相邻节点
    List<PathNode> GetNeighboringNodes(PathNode node)
    {
        List<PathNode> neighbors = new List<PathNode>();

        for (int x = -1; x <= 1; x++)
        {
            for (int y = -1; y <= 1; y++)
            {
                if (x == 0 && y == 0)
                    continue;

                int checkX = node.x + x;
                int checkY = node.y + y;

                if (checkX >= 0 && checkX < gridSizeX && checkY >= 0 && checkY < gridSizeY)
                {
                    neighbors.Add(grid[checkX, checkY]);
                }
            }
        }

        return neighbors;
    }

    // 计算两点间距离
    int GetDistance(PathNode nodeA, PathNode nodeB)
    {
        int dstX = Mathf.Abs(nodeA.x - nodeB.x);
        int dstY = Mathf.Abs(nodeA.y - nodeB.y);

        if (dstX > dstY)
            return 14 * dstY + 10 * (dstX - dstY);
        return 14 * dstX + 10 * (dstY - dstX);
    }

    // 从世界坐标获取节点
    PathNode GetNodeFromWorldPoint(Vector3 worldPosition)
    {
        float percentX = (worldPosition.x - transform.position.x + gridSizeX * nodeSize / 2) / (gridSizeX * nodeSize);
        float percentY = (worldPosition.z - transform.position.z + gridSizeY * nodeSize / 2) / (gridSizeY * nodeSize);

        percentX = Mathf.Clamp01(percentX);
        percentY = Mathf.Clamp01(percentY);

        int x = Mathf.RoundToInt((gridSizeX - 1) * percentX);
        int y = Mathf.RoundToInt((gridSizeY - 1) * percentY);

        return grid[x, y];
    }

    // 从节点获取世界坐标
    Vector3 GetWorldPointFromNode(PathNode node)
    {
        float x = transform.position.x - gridSizeX * nodeSize / 2 + node.x * nodeSize + nodeSize / 2;
        float z = transform.position.z - gridSizeY * nodeSize / 2 + node.y * nodeSize + nodeSize / 2;
        return new Vector3(x, transform.position.y, z);
    }

    // 获取网格中的节点
    public PathNode GetNode(int x, int y)
    {
        if (x >= 0 && x < gridSizeX && y >= 0 && y < gridSizeY)
        {
            return grid[x, y];
        }
        return null;
    }

    // 绘制网格（用于调试）
    void OnDrawGizmos()
    {
        if (grid != null)
        {
            foreach (PathNode n in grid)
            {
                Gizmos.color = n.isWalkable ? Color.white : Color.red;
                Vector3 worldPos = GetWorldPointFromNode(n);
                Gizmos.DrawCube(worldPos, Vector3.one * (nodeSize - 0.1f));
            }
        }
    }
}

// 寻路请求处理器
public class PathfindingRequestManager : MonoBehaviour
{
    private Queue<PathRequest> pathRequestQueue = new Queue<PathRequest>();
    private PathRequest currentPathRequest;
    private AStarPathfinding pathfinding;
    private bool isProcessingPath;

    void Awake()
    {
        pathfinding = GetComponent<AStarPathfinding>();
    }

    public void RequestPath(Vector3 pathStart, Vector3 pathEnd, System.Action<List<Vector3>, bool> callback)
    {
        PathRequest newRequest = new PathRequest(pathStart, pathEnd, callback);
        pathRequestQueue.Enqueue(newRequest);

        if (!isProcessingPath)
        {
            ProcessNextPathRequest();
        }
    }

    void ProcessNextPathRequest()
    {
        isProcessingPath = true;
        currentPathRequest = pathRequestQueue.Dequeue();
        
        // 在后台线程中执行寻路
        System.Threading.ThreadPool.QueueUserWorkItem(ProcessPath);
    }

    void ProcessPath(System.Object pathing)
    {
        List<Vector3> path = pathfinding.FindPath(currentPathRequest.pathStart, currentPathRequest.pathEnd);
        bool pathSuccess = path != null;

        System.Action callback = () => {
            currentPathRequest.callback(path, pathSuccess);
            isProcessingPath = false;
            if (pathRequestQueue.Count > 0)
            {
                ProcessNextPathRequest();
            }
        };

        // 在主线程中执行回调
        ThreadSafeExecutor.Instance.ExecuteOnMainThread(callback);
    }
}

// 寻路请求结构
public struct PathRequest
{
    public Vector3 pathStart;
    public Vector3 pathEnd;
    public System.Action<List<Vector3>, bool> callback;

    public PathRequest(Vector3 start, Vector3 end, System.Action<List<Vector3>, bool> callback)
    {
        pathStart = start;
        pathEnd = end;
        this.callback = callback;
    }
}

// 线程安全执行器
public class ThreadSafeExecutor : MonoBehaviour
{
    private static ThreadSafeExecutor _instance;
    public static ThreadSafeExecutor Instance
    {
        get
        {
            if (_instance == null)
            {
                GameObject obj = new GameObject("ThreadSafeExecutor");
                _instance = obj.AddComponent<ThreadSafeExecutor>();
            }
            return _instance;
        }
    }

    private Queue<System.Action> executionQueue = new Queue<System.Action>();

    void Update()
    {
        lock (executionQueue)
        {
            while (executionQueue.Count > 0)
            {
                executionQueue.Dequeue().Invoke();
            }
        }
    }

    public void ExecuteOnMainThread(System.Action action)
    {
        lock (executionQueue)
        {
            executionQueue.Enqueue(action);
        }
    }
}
```

### 24. 实现四叉树空间分区算法

**答案：**

四叉树用于优化2D空间中的碰撞检测和对象查询：

```csharp
using UnityEngine;
using System.Collections.Generic;

// 四叉树节点中的对象接口
public interface IQuadTreeObject
{
    Vector2 Position { get; }
    float Width { get; }
    float Height { get; }
}

// 四叉树节点
public class QuadTreeNode<T> where T : IQuadTreeObject
{
    private Rectangle boundary;
    private int capacity;
    private List<T> objects;
    private bool divided = false;
    
    // 子节点
    private QuadTreeNode<T> topLeft;
    private QuadTreeNode<T> topRight;
    private QuadTreeNode<T> bottomLeft;
    private QuadTreeNode<T> bottomRight;

    public QuadTreeNode(Rectangle boundary, int capacity)
    {
        this.boundary = boundary;
        this.capacity = capacity;
        this.objects = new List<T>();
    }

    // 插入对象
    public bool Insert(T obj)
    {
        // 检查对象是否在边界内
        if (!boundary.Contains(obj.Position))
        {
            return false;
        }

        // 如果节点未满且未分割，直接添加
        if (objects.Count < capacity && !divided)
        {
            objects.Add(obj);
            return true;
        }

        // 如果需要分割
        if (!divided)
        {
            Subdivide();
        }

        // 尝试插入到子节点
        if (topLeft.Insert(obj)) return true;
        if (topRight.Insert(obj)) return true;
        if (bottomLeft.Insert(obj)) return true;
        if (bottomRight.Insert(obj)) return true;

        // 如果对象跨越多个子节点，存储在当前节点
        objects.Add(obj);
        return true;
    }

    // 分割节点
    private void Subdivide()
    {
        float x = boundary.x;
        float y = boundary.y;
        float w = boundary.w / 2;
        float h = boundary.h / 2;

        topLeft = new QuadTreeNode<T>(new Rectangle(x - w/2, y + h/2, w, h), capacity);
        topRight = new QuadTreeNode<T>(new Rectangle(x + w/2, y + h/2, w, h), capacity);
        bottomLeft = new QuadTreeNode<T>(new Rectangle(x - w/2, y - h/2, w, h), capacity);
        bottomRight = new QuadTreeNode<T>(new Rectangle(x + w/2, y - h/2, w, h), capacity);

        divided = true;

        // 重新分配现有对象
        for (int i = objects.Count - 1; i >= 0; i--)
        {
            T obj = objects[i];
            if (topLeft.Insert(obj) || topRight.Insert(obj) || 
                bottomLeft.Insert(obj) || bottomRight.Insert(obj))
            {
                objects.RemoveAt(i);
            }
        }
    }

    // 查询范围内的对象
    public void Query(Rectangle range, List<T> foundObjects)
    {
        if (!boundary.Intersects(range))
        {
            return;
        }

        // 检查当前节点的对象
        foreach (T obj in objects)
        {
            if (range.Contains(obj.Position))
            {
                if (!foundObjects.Contains(obj))
                {
                    foundObjects.Add(obj);
                }
            }
        }

        // 如果已分割，查询子节点
        if (divided)
        {
            topLeft.Query(range, foundObjects);
            topRight.Query(range, foundObjects);
            bottomLeft.Query(range, foundObjects);
            bottomRight.Query(range, foundObjects);
        }
    }

    // 查询点附近的对象
    public void QueryPoint(Vector2 point, List<T> foundObjects)
    {
        if (!boundary.Contains(point))
        {
            return;
        }

        foreach (T obj in objects)
        {
            if (obj.Position == point)
            {
                if (!foundObjects.Contains(obj))
                {
                    foundObjects.Add(obj);
                }
            }
        }

        if (divided)
        {
            topLeft.QueryPoint(point, foundObjects);
            topRight.QueryPoint(point, foundObjects);
            bottomLeft.QueryPoint(point, foundObjects);
            bottomRight.QueryPoint(point, foundObjects);
        }
    }

    // 获取所有对象
    public void GetAllObjects(List<T> allObjects)
    {
        allObjects.AddRange(objects);

        if (divided)
        {
            topLeft.GetAllObjects(allObjects);
            topRight.GetAllObjects(allObjects);
            bottomLeft.GetAllObjects(allObjects);
            bottomRight.GetAllObjects(allObjects);
        }
    }

    // 检查是否为空
    public bool IsEmpty()
    {
        bool empty = objects.Count == 0;
        if (divided)
        {
            empty = empty && topLeft.IsEmpty() && topRight.IsEmpty() && 
                   bottomLeft.IsEmpty() && bottomRight.IsEmpty();
        }
        return empty;
    }

    // 获取节点统计信息
    public QuadTreeStats GetStats()
    {
        QuadTreeStats stats = new QuadTreeStats();
        GetStatsRecursive(ref stats);
        return stats;
    }

    private void GetStatsRecursive(ref QuadTreeStats stats)
    {
        stats.nodeCount++;
        stats.objectCount += objects.Count;

        if (divided)
        {
            topLeft.GetStatsRecursive(ref stats);
            topRight.GetStatsRecursive(ref stats);
            bottomLeft.GetStatsRecursive(ref stats);
            bottomRight.GetStatsRecursive(ref stats);
        }
    }
}

// 矩形边界
public struct Rectangle
{
    public float x, y, w, h;

    public Rectangle(float x, float y, float w, float h)
    {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    public bool Contains(Vector2 point)
    {
        return point.x >= x - w/2 && point.x <= x + w/2 &&
               point.y >= y - h/2 && point.y <= y + h/2;
    }

    public bool Intersects(Rectangle range)
    {
        return !(range.x - range.w/2 > x + w/2 ||
                 range.x + range.w/2 < x - w/2 ||
                 range.y - range.h/2 > y + h/2 ||
                 range.y + range.h/2 < y - h/2);
    }
}

// 四叉树统计信息
public struct QuadTreeStats
{
    public int nodeCount;
    public int objectCount;
}

// 四叉树管理器
public class QuadTreeManager<T> where T : IQuadTreeObject
{
    private QuadTreeNode<T> root;
    private Rectangle boundary;
    private int capacity;

    public QuadTreeManager(Rectangle boundary, int capacity = 8)
    {
        this.boundary = boundary;
        this.capacity = capacity;
        this.root = new QuadTreeNode<T>(boundary, capacity);
    }

    public void Insert(T obj)
    {
        root.Insert(obj);
    }

    public List<T> Query(Rectangle range)
    {
        List<T> foundObjects = new List<T>();
        root.Query(range, foundObjects);
        return foundObjects;
    }

    public List<T> QueryCircle(Vector2 center, float radius)
    {
        // 将圆形查询转换为矩形查询
        Rectangle range = new Rectangle(center.x, center.y, radius * 2, radius * 2);
        List<T> candidates = root.Query(range);
        
        // 过滤出真正位于圆内的对象
        List<T> inCircle = new List<T>();
        foreach (T obj in candidates)
        {
            float distance = Vector2.Distance(center, obj.Position);
            if (distance <= radius)
            {
                inCircle.Add(obj);
            }
        }
        
        return inCircle;
    }

    public List<T> QueryPoint(Vector2 point)
    {
        List<T> foundObjects = new List<T>();
        root.QueryPoint(point, foundObjects);
        return foundObjects;
    }

    public List<T> GetAllObjects()
    {
        List<T> allObjects = new List<T>();
        root.GetAllObjects(allObjects);
        return allObjects;
    }

    public void Clear()
    {
        root = new QuadTreeNode<T>(boundary, capacity);
    }

    public QuadTreeStats GetStats()
    {
        return root.GetStats();
    }

    public bool IsEmpty()
    {
        return root.IsEmpty();
    }
}

// 示例：游戏对象实现IQuadTreeObject接口
public class GameObjectQuadTree : MonoBehaviour, IQuadTreeObject
{
    public float Width { get; set; } = 1f;
    public float Height { get; set; } = 1f;

    public Vector2 Position => new Vector2(transform.position.x, transform.position.z);

    void Start()
    {
        // 注册到四叉树
        QuadTreeSystem.RegisterObject(this);
    }

    void OnDestroy()
    {
        // 从四叉树注销
        QuadTreeSystem.UnregisterObject(this);
    }

    void Update()
    {
        // 当位置改变时更新四叉树
        if (QuadTreeSystem.HasMoved(this))
        {
            QuadTreeSystem.UpdateObjectPosition(this);
        }
    }
}

// 四叉树系统管理器
public class QuadTreeSystem : MonoBehaviour
{
    private static QuadTreeManager<GameObjectQuadTree> quadTree;
    private static Dictionary<GameObjectQuadTree, Vector2> lastPositions = new Dictionary<GameObjectQuadTree, Vector2>();

    void Start()
    {
        // 初始化四叉树（根据游戏世界大小调整边界）
        Rectangle worldBoundary = new Rectangle(0, 0, 100, 100);
        quadTree = new QuadTreeManager<GameObjectQuadTree>(worldBoundary, 4);
    }

    public static void RegisterObject(GameObjectQuadTree obj)
    {
        quadTree.Insert(obj);
        lastPositions[obj] = obj.Position;
    }

    public static void UnregisterObject(GameObjectQuadTree obj)
    {
        // 四叉树通常不支持直接删除，可以标记为无效或重新构建
        lastPositions.Remove(obj);
    }

    public static bool HasMoved(GameObjectQuadTree obj)
    {
        if (lastPositions.ContainsKey(obj))
        {
            bool moved = lastPositions[obj] != obj.Position;
            if (moved)
            {
                lastPositions[obj] = obj.Position;
            }
            return moved;
        }
        return false;
    }

    public static void UpdateObjectPosition(GameObjectQuadTree obj)
    {
        // 重新插入对象到新位置（简单实现，实际可能需要更复杂的更新逻辑）
        UnregisterObject(obj);
        RegisterObject(obj);
    }

    public static List<GameObjectQuadTree> QueryRange(Vector2 center, float radius)
    {
        Rectangle range = new Rectangle(center.x, center.y, radius * 2, radius * 2);
        return quadTree.Query(range);
    }

    public static List<GameObjectQuadTree> QueryCircle(Vector2 center, float radius)
    {
        return quadTree.QueryCircle(center, radius);
    }

    // 获取碰撞对（用于碰撞检测优化）
    public static List<(GameObjectQuadTree, GameObjectQuadTree)> GetPotentialCollisions(float objectRadius)
    {
        List<(GameObjectQuadTree, GameObjectQuadTree)> collisions = new List<(GameObjectQuadTree, GameObjectQuadTree)>();
        List<GameObjectQuadTree> allObjects = quadTree.GetAllObjects();

        foreach (GameObjectQuadTree obj1 in allObjects)
        {
            // 查询附近的对象
            List<GameObjectQuadTree> nearbyObjects = quadTree.QueryCircle(obj1.Position, objectRadius * 2);
            
            foreach (GameObjectQuadTree obj2 in nearbyObjects)
            {
                if (obj1 != obj2)
                {
                    // 确保不重复添加配对
                    if (!collisions.Exists(c => (c.Item1 == obj1 && c.Item2 == obj2) || 
                                              (c.Item1 == obj2 && c.Item2 == obj1)))
                    {
                        float distance = Vector2.Distance(obj1.Position, obj2.Position);
                        if (distance <= objectRadius * 2) // 粗略碰撞检测
                        {
                            collisions.Add((obj1, obj2));
                        }
                    }
                }
            }
        }

        return collisions;
    }
}
```

### 25. 实现游戏对象池管理器

**答案：**

游戏对象池是优化性能的重要模式：

```csharp
using UnityEngine;
using System.Collections.Generic;

// 对象池接口
public interface IPoolable
{
    void OnObjectSpawn();
    void OnObjectReturn();
}

// 对象池管理器
public class ObjectPoolManager : MonoBehaviour
{
    private static ObjectPoolManager _instance;
    public static ObjectPoolManager Instance
    {
        get
        {
            if (_instance == null)
            {
                GameObject obj = new GameObject("ObjectPoolManager");
                _instance = obj.AddComponent<ObjectPoolManager>();
            }
            return _instance;
        }
    }

    private Dictionary<string, BaseObjectPool> pools = new Dictionary<string, BaseObjectPool>();

    void Awake()
    {
        if (_instance == null)
        {
            _instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
        }
    }

    // 创建对象池
    public void CreatePool<T>(string poolName, T prefab, int initialSize = 10, int maxSize = 100) where T : Component
    {
        if (!pools.ContainsKey(poolName))
        {
            GameObjectPool<T> pool = new GameObjectPool<T>(prefab, initialSize, maxSize);
            pools[poolName] = pool;
        }
    }

    // 获取对象
    public T GetObject<T>(string poolName) where T : Component
    {
        if (pools.ContainsKey(poolName) && pools[poolName] is GameObjectPool<T> pool)
        {
            return pool.Get();
        }
        
        Debug.LogError($"对象池 {poolName} 不存在或类型不匹配");
        return null;
    }

    // 返回对象到池
    public void ReturnObject<T>(string poolName, T obj) where T : Component
    {
        if (pools.ContainsKey(poolName) && pools[poolName] is GameObjectPool<T> pool)
        {
            pool.Return(obj);
        }
        else
        {
            Debug.LogError($"对象池 {poolName} 不存在或类型不匹配");
            // 如果池不存在，直接销毁对象
            if (obj != null)
            {
                Destroy(obj.gameObject);
            }
        }
    }

    // 获取池大小信息
    public PoolStats GetPoolStats(string poolName)
    {
        if (pools.ContainsKey(poolName))
        {
            return pools[poolName].GetStats();
        }
        return new PoolStats();
    }

    // 清理所有池
    public void ClearAllPools()
    {
        foreach (var pool in pools.Values)
        {
            pool.Clear();
        }
        pools.Clear();
    }

    // 预热对象池（预先创建对象）
    public void WarmupPool(string poolName)
    {
        if (pools.ContainsKey(poolName))
        {
            pools[poolName].Warmup();
        }
    }
}

// 基础对象池接口
public abstract class BaseObjectPool
{
    public abstract PoolStats GetStats();
    public abstract void Clear();
    public abstract void Warmup();
}

// 游戏对象池实现
public class GameObjectPool<T> : BaseObjectPool where T : Component
{
    private Queue<T> pool = new Queue<T>();
    private T prefab;
    private Transform parent;
    private int maxSize;
    private int createdCount = 0;

    public GameObjectPool(T prefab, int initialSize, int maxSize)
    {
        this.prefab = prefab;
        this.maxSize = maxSize;
        this.parent = new GameObject($"Pool_{typeof(T).Name}").transform;
        this.parent.SetParent(ObjectPoolManager.Instance.transform);

        // 预创建对象
        for (int i = 0; i < initialSize; i++)
        {
            T obj = CreateNewObject();
            Return(obj);
        }
    }

    public T Get()
    {
        T obj;
        if (pool.Count > 0)
        {
            obj = pool.Dequeue();
            obj.gameObject.SetActive(true);
            
            // 调用对象的生成回调
            IPoolable poolable = obj as IPoolable;
            poolable?.OnObjectSpawn();
        }
        else
        {
            // 如果池空了但未达到最大大小，创建新对象
            if (createdCount < maxSize)
            {
                obj = CreateNewObject();
            }
            else
            {
                Debug.LogWarning($"对象池已达到最大大小，无法创建新对象: {typeof(T).Name}");
                return null;
            }
        }
        
        return obj;
    }

    public void Return(T obj)
    {
        if (obj != null && !pool.Contains(obj))
        {
            obj.gameObject.SetActive(false);
            obj.transform.SetParent(parent);
            
            // 调用对象的回收回调
            IPoolable poolable = obj as IPoolable;
            poolable?.OnObjectReturn();
            
            pool.Enqueue(obj);
        }
    }

    private T CreateNewObject()
    {
        T obj = GameObject.Instantiate(prefab);
        obj.transform.SetParent(parent);
        obj.gameObject.SetActive(false);
        createdCount++;
        return obj;
    }

    public override PoolStats GetStats()
    {
        return new PoolStats
        {
            poolSize = pool.Count,
            createdCount = createdCount,
            maxSize = maxSize
        };
    }

    public override void Clear()
    {
        foreach (T obj in pool)
        {
            if (obj != null)
            {
                GameObject.Destroy(obj.gameObject);
            }
        }
        pool.Clear();
        createdCount = 0;
    }

    public override void Warmup()
    {
        // 预热池，确保有足够的对象
        int needed = maxSize - createdCount;
        for (int i = 0; i < needed; i++)
        {
            T obj = CreateNewObject();
            Return(obj);
        }
    }
}

// 池统计信息
public struct PoolStats
{
    public int poolSize;
    public int createdCount;
    public int maxSize;
}

// 池化对象基类
public abstract class PooledObject : MonoBehaviour, IPoolable
{
    [Header("对象池设置")]
    public string poolName;
    public bool returnToPoolOnDisable = true;

    protected virtual void OnEnable()
    {
        OnObjectSpawn();
    }

    protected virtual void OnDisable()
    {
        if (returnToPoolOnDisable)
        {
            ReturnToPool();
        }
    }

    public virtual void OnObjectSpawn()
    {
        // 对象从池中取出时的初始化逻辑
        gameObject.SetActive(true);
    }

    public virtual void OnObjectReturn()
    {
        // 对象返回池时的清理逻辑
        transform.SetParent(null);
        gameObject.SetActive(false);
    }

    public void ReturnToPool()
    {
        if (!string.IsNullOrEmpty(poolName))
        {
            ObjectPoolManager.Instance.ReturnObject(poolName, this as MonoBehaviour as Component);
        }
        else
        {
            Debug.LogError("对象池名称未设置", this);
            Destroy(gameObject);
        }
    }
}

// 子弹示例
public class Bullet : PooledObject
{
    [Header("子弹设置")]
    public float speed = 10f;
    public int damage = 10;
    public float lifeTime = 5f;

    private float timer = 0f;
    private Rigidbody rb;

    void Start()
    {
        rb = GetComponent<Rigidbody>();
        poolName = "BulletPool";
    }

    void Update()
    {
        timer += Time.deltaTime;
        
        if (timer >= lifeTime)
        {
            ReturnToPool();
            return;
        }

        // 移动逻辑
        if (rb != null)
        {
            rb.velocity = transform.forward * speed;
        }
        else
        {
            transform.Translate(Vector3.forward * speed * Time.deltaTime);
        }
    }

    public override void OnObjectSpawn()
    {
        base.OnObjectSpawn();
        timer = 0f;
        
        // 重置子弹属性
        if (rb != null)
        {
            rb.velocity = Vector3.zero;
            rb.angularVelocity = Vector3.zero;
        }
    }

    public override void OnObjectReturn()
    {
        base.OnObjectReturn();
        timer = 0f;
    }

    void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("Enemy"))
        {
            // 对敌人造成伤害
            EnemyHealth enemyHealth = other.GetComponent<EnemyHealth>();
            if (enemyHealth != null)
            {
                enemyHealth.TakeDamage(damage);
            }
            
            // 子弹击中后返回池
            ReturnToPool();
        }
        else if (!other.CompareTag("Player")) // 避免与玩家碰撞
        {
            // 与其他障碍物碰撞后返回池
            ReturnToPool();
        }
    }
}

// 敌人生成器示例
public class EnemySpawner : MonoBehaviour
{
    public float spawnInterval = 2f;
    public Transform[] spawnPoints;

    void Start()
    {
        // 创建敌人对象池
        GameObject enemyPrefab = Resources.Load<GameObject>("Prefabs/Enemy");
        if (enemyPrefab != null)
        {
            ObjectPoolManager.Instance.CreatePool("EnemyPool", enemyPrefab.GetComponent<Enemy>(), 5, 20);
        }
        
        // 开始生成敌人
        InvokeRepeating("SpawnEnemy", spawnInterval, spawnInterval);
    }

    void SpawnEnemy()
    {
        if (spawnPoints.Length > 0)
        {
            Transform spawnPoint = spawnPoints[Random.Range(0, spawnPoints.Length)];
            
            Enemy enemy = ObjectPoolManager.Instance.GetObject<Enemy>("EnemyPool");
            if (enemy != null)
            {
                enemy.transform.position = spawnPoint.position;
                enemy.transform.rotation = spawnPoint.rotation;
            }
        }
    }
}

// 敌人类
public class Enemy : PooledObject, IDamageable
{
    [Header("敌人设置")]
    public int maxHealth = 100;
    public int currentHealth;
    public float moveSpeed = 2f;

    private Transform player;
    private Rigidbody rb;

    void Start()
    {
        rb = GetComponent<Rigidbody>();
        player = GameObject.FindGameObjectWithTag("Player")?.transform;
        poolName = "EnemyPool";
    }

    void Update()
    {
        if (player != null)
        {
            // 追踪玩家
            Vector3 direction = (player.position - transform.position).normalized;
            if (rb != null)
            {
                rb.MovePosition(transform.position + direction * moveSpeed * Time.deltaTime);
            }
            else
            {
                transform.position += direction * moveSpeed * Time.deltaTime;
            }
        }
    }

    public override void OnObjectSpawn()
    {
        base.OnObjectSpawn();
        currentHealth = maxHealth;
        
        // 重置敌人状态
        if (rb != null)
        {
            rb.velocity = Vector3.zero;
            rb.angularVelocity = Vector3.zero;
        }
    }

    public override void OnObjectReturn()
    {
        base.OnObjectReturn();
        currentHealth = maxHealth;
    }

    public void TakeDamage(int damage)
    {
        currentHealth -= damage;
        
        if (currentHealth <= 0)
        {
            Die();
        }
    }

    void Die()
    {
        // 播放死亡效果
        // 增加分数
        // 掉落物品等
        
        ReturnToPool();
    }

    public void Heal(int healAmount)
    {
        currentHealth = Mathf.Clamp(currentHealth + healAmount, 0, maxHealth);
    }

    public bool IsAlive()
    {
        return currentHealth > 0;
    }
}
```

---

## 总结

本章涵盖了Unity C#游戏开发中的40+道高频面试题，包括：

✅ **C#基础题** (1-8): 值类型引用类型、装箱拆箱、参数修饰符、委托事件、异步编程、LINQ、内存管理、异常处理

✅ **Unity开发题** (9-16): MonoBehaviour生命周期、协程、对象池、单例模式、事件系统、动画系统、物理系统、UI优化

✅ **游戏开发题** (17-20): 游戏状态管理、敌人AI、碰撞伤害系统、资源管理

✅ **系统设计题** (21-22): 配置管理、成就系统

✅ **算法题** (23-25): A*寻路、四叉树、对象池

这些面试题涵盖了游戏开发的核心知识点，掌握这些内容将有助于在Unity C#游戏开发面试中取得好成绩。

---

## 下一步

继续学习 [12. 学习资源](12-resources.md) →
