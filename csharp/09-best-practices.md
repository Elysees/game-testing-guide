# 09. 最佳实践

> Unity游戏开发最佳实践 - 高质量代码、性能优化、架构设计

---

## 📌 本章导航

- [代码组织和架构](#代码组织和架构)
- [性能优化策略](#性能优化策略)
- [内存管理最佳实践](#内存管理最佳实践)
- [UI系统最佳实践](#ui系统最佳实践)
- [音频系统最佳实践](#音频系统最佳实践)
- [动画系统最佳实践](#动画系统最佳实践)
- [测试和调试最佳实践](#测试和调试最佳实践)
- [发布和部署最佳实践](#发布和部署最佳实践)

---

## 代码组织和架构

### 项目结构最佳实践

良好的项目结构是成功开发的基础。以下是一个推荐的Unity项目结构：

```
Assets/
├── Scripts/                    # 脚本文件
│   ├── Core/                   # 核心系统
│   │   ├── Managers/           # 管理器类
│   │   ├── Systems/            # 核心系统
│   │   └── Utilities/          # 工具类
│   ├── Game/                   # 游戏逻辑
│   │   ├── Player/             # 玩家相关
│   │   ├── Enemies/            # 敌人相关
│   │   ├── Items/              # 物品相关
│   │   └── UI/                 # UI逻辑
│   ├── Framework/              # 框架代码
│   └── Editor/                 # 编辑器扩展
├── Prefabs/                    # 预制件
│   ├── Characters/             # 角色预制件
│   ├── Environment/            # 环境预制件
│   └── UI/                     # UI预制件
├── Scenes/                     # 场景文件
├── Materials/                  # 材质
├── Textures/                   # 纹理
├── Models/                     # 模型
├── Audio/                      # 音频
├── Animations/                 # 动画
├── Plugins/                    # 插件
└── Resources/                  # 资源（如果使用Resources加载）
```

### 命名约定

```csharp
// ✅ 推荐的命名约定

// 类名使用PascalCase
public class PlayerController : MonoBehaviour
{
    // 私有字段使用camelCase
    private int playerHealth;
    private float moveSpeed;
    
    // 公共字段使用PascalCase
    public int MaxHealth { get; set; }
    
    // 常量使用PASCAL_CASE
    private const float GRAVITY = -9.81f;
    
    // 事件使用PascalCase
    public event System.Action OnPlayerDeath;
    
    // 方法使用PascalCase
    public void TakeDamage(int damage)
    {
        playerHealth -= damage;
        if (playerHealth <= 0)
        {
            Die();
        }
    }
    
    // 私有方法使用PascalCase
    private void Die()
    {
        // 死亡逻辑
    }
}

// 枚举使用PascalCase
public enum GameState
{
    MainMenu,
    Playing,
    Paused,
    GameOver
}

// 接口使用I前缀
public interface IInteractable
{
    void Interact();
}
```

### 单例模式最佳实践

```csharp
using UnityEngine;

// 线程安全的单例模式
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
                    
                    // 确保单例对象在场景切换时不被销毁
                    DontDestroyOnLoad(_instance);
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

// 泛型单例基类
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
```

### 组件化架构

```csharp
using UnityEngine;
using System.Collections.Generic;

// 组件化架构示例
public class Entity : MonoBehaviour
{
    private List<IEntityComponent> components = new List<IEntityComponent>();

    void Start()
    {
        // 获取所有组件
        IEntityComponent[] foundComponents = GetComponents<IEntityComponent>();
        components.AddRange(foundComponents);
        
        // 初始化所有组件
        foreach (IEntityComponent component in components)
        {
            component.Initialize(this);
        }
    }

    void Update()
    {
        // 更新所有组件
        foreach (IEntityComponent component in components)
        {
            component.Update();
        }
    }

    void FixedUpdate()
    {
        // 固定更新所有组件
        foreach (IEntityComponent component in components)
        {
            component.FixedUpdate();
        }
    }

    // 获取特定类型的组件
    public T GetComponent<T>() where T : class, IEntityComponent
    {
        foreach (IEntityComponent component in components)
        {
            if (component is T specificComponent)
            {
                return specificComponent;
            }
        }
        return null;
    }

    // 添加组件
    public void AddComponent(IEntityComponent component)
    {
        if (!components.Contains(component))
        {
            components.Add(component);
            component.Initialize(this);
        }
    }

    // 移除组件
    public void RemoveComponent(IEntityComponent component)
    {
        if (components.Contains(component))
        {
            component.Dispose();
            components.Remove(component);
        }
    }
}

// 实体组件接口
public interface IEntityComponent
{
    void Initialize(Entity entity);
    void Update();
    void FixedUpdate();
    void Dispose();
}

// 移动组件示例
public class MovementComponent : MonoBehaviour, IEntityComponent
{
    public float moveSpeed = 5f;
    private Entity entity;
    private CharacterController controller;

    public void Initialize(Entity entity)
    {
        this.entity = entity;
        controller = entity.GetComponent<CharacterController>();
    }

    public void Update()
    {
        // 处理输入和移动
        float horizontal = Input.GetAxis("Horizontal");
        float vertical = Input.GetAxis("Vertical");
        
        Vector3 movement = new Vector3(horizontal, 0, vertical) * moveSpeed * Time.deltaTime;
        
        if (controller != null)
        {
            controller.Move(movement);
        }
    }

    public void FixedUpdate() { }
    
    public void Dispose() { }
}

// 战斗组件示例
public class CombatComponent : MonoBehaviour, IEntityComponent
{
    public int health = 100;
    public int maxHealth = 100;
    private Entity entity;

    public void Initialize(Entity entity)
    {
        this.entity = entity;
    }

    public void Update() { }

    public void FixedUpdate() { }

    public void TakeDamage(int damage)
    {
        health -= damage;
        if (health <= 0)
        {
            Die();
        }
    }

    private void Die()
    {
        // 死亡逻辑
        Debug.Log($"{entity.name} 死亡!");
        
        // 通知其他系统
        GameEvents.OnEntityDeath?.Invoke(entity);
    }

    public void Dispose() { }
}

// 事件系统
public static class GameEvents
{
    public static System.Action<Entity> OnEntityDeath;
}
```

### 事件驱动架构

```csharp
using UnityEngine;
using System.Collections.Generic;

// 事件系统管理器
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

    void OnDisable()
    {
        eventDictionary.Clear();
    }

    // 注册事件监听器
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

    // 取消注册事件监听器
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

public struct EnemySpawnEvent
{
    public int enemyId;
    public string enemyType;
    public Vector3 position;

    public EnemySpawnEvent(int id, string type, Vector3 pos)
    {
        enemyId = id;
        enemyType = type;
        position = pos;
    }
}

// 使用事件系统的示例
public class PlayerDeathHandler : MonoBehaviour
{
    void OnEnable()
    {
        EventManager.Instance.Subscribe<PlayerDeathEvent>(OnPlayerDeath);
    }

    void OnDisable()
    {
        EventManager.Instance.Unsubscribe<PlayerDeathEvent>(OnPlayerDeath);
    }

    void OnPlayerDeath(PlayerDeathEvent deathEvent)
    {
        Debug.Log($"玩家 {deathEvent.playerId} 在位置 {deathEvent.position} 死亡");
        
        // 处理玩家死亡逻辑
        HandlePlayerDeath(deathEvent);
    }

    void HandlePlayerDeath(PlayerDeathEvent deathEvent)
    {
        // 创建死亡效果
        CreateDeathEffect(deathEvent.position);
        
        // 更新UI
        UpdateUIOnPlayerDeath(deathEvent.playerId);
        
        // 检查游戏结束条件
        CheckGameOverCondition();
    }

    void CreateDeathEffect(Vector3 position)
    {
        // 创建死亡特效
    }

    void UpdateUIOnPlayerDeath(int playerId)
    {
        // 更新UI显示
    }

    void CheckGameOverCondition()
    {
        // 检查是否满足游戏结束条件
    }
}
```

---

## 性能优化策略

### 对象池系统

```csharp
using UnityEngine;
using System.Collections.Generic;

// 通用对象池
public class ObjectPool<T> where T : Component
{
    private Queue<T> pool = new Queue<T>();
    private T prefab;
    private Transform parent;
    private int initialSize;

    public ObjectPool(T prefab, int initialSize, Transform parent = null)
    {
        this.prefab = prefab;
        this.initialSize = initialSize;
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
            Debug.LogWarning($"对象池 {typeof(T)} 已空，创建新对象");
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

// 对象池管理器
public class ObjectPoolManager : MonoBehaviour
{
    private Dictionary<string, System.Object> pools = new Dictionary<string, System.Object>();

    private static ObjectPoolManager _instance;
    public static ObjectPoolManager Instance
    {
        get
        {
            if (_instance == null)
            {
                _instance = FindObjectOfType<ObjectPoolManager>();
                
                if (_instance == null)
                {
                    GameObject poolManagerObject = new GameObject("ObjectPoolManager");
                    _instance = poolManagerObject.AddComponent<ObjectPoolManager>();
                }
            }
            
            return _instance;
        }
    }

    void Start()
    {
        InitializePools();
    }

    private void InitializePools()
    {
        // 初始化各种对象池
        InitializePool<GameObject>("Bullet", Resources.Load<GameObject>("Prefabs/Bullet"), 20);
        InitializePool<GameObject>("Explosion", Resources.Load<GameObject>("Prefabs/Explosion"), 10);
        InitializePool<GameObject>("Enemy", Resources.Load<GameObject>("Prefabs/Enemy"), 5);
    }

    private void InitializePool<T>(string key, T prefab, int initialSize) where T : Component
    {
        if (prefab != null)
        {
            ObjectPool<T> pool = new ObjectPool<T>(prefab, initialSize, transform);
            pools[key] = pool;
        }
    }

    public T GetObject<T>(string key) where T : Component
    {
        if (pools.ContainsKey(key) && pools[key] is ObjectPool<T> pool)
        {
            return pool.Get();
        }
        
        Debug.LogError($"对象池 {key} 不存在或类型不匹配");
        return null;
    }

    public void ReturnObject<T>(string key, T obj) where T : Component
    {
        if (pools.ContainsKey(key) && pools[key] is ObjectPool<T> pool)
        {
            pool.ReturnToPool(obj);
        }
        else
        {
            Debug.LogError($"对象池 {key} 不存在或类型不匹配");
        }
    }

    // 获取池大小信息
    public int GetPoolSize(string key)
    {
        if (pools.ContainsKey(key))
        {
            var pool = pools[key];
            if (pool is ObjectPool<GameObject> goPool)
                return goPool.PoolSize;
            if (pool is ObjectPool<Rigidbody> rbPool)
                return rbPool.PoolSize;
            // 添加其他类型的检查
        }
        
        return -1;
    }
}

// 使用对象池的示例
public class BulletSpawner : MonoBehaviour
{
    public float spawnRate = 0.5f;
    private float lastSpawnTime = 0f;

    void Update()
    {
        if (Time.time - lastSpawnTime >= spawnRate)
        {
            SpawnBullet();
            lastSpawnTime = Time.time;
        }
    }

    void SpawnBullet()
    {
        GameObject bullet = ObjectPoolManager.Instance.GetObject<GameObject>("Bullet");
        
        if (bullet != null)
        {
            bullet.transform.position = transform.position;
            bullet.transform.rotation = transform.rotation;
            
            // 设置子弹属性
            Bullet bulletScript = bullet.GetComponent<Bullet>();
            if (bulletScript != null)
            {
                bulletScript.Initialize(transform.forward, 10f);
            }
        }
    }

    void OnDisable()
    {
        // 返回所有子弹到池中
        // 这里需要跟踪所有活跃的子弹
    }
}

// 可池化组件
public class Poolable : MonoBehaviour
{
    [Header("对象池设置")]
    public string poolKey;
    public bool returnToPoolOnDisable = true;

    void OnDisable()
    {
        if (returnToPoolOnDisable && !string.IsNullOrEmpty(poolKey))
        {
            ObjectPoolManager.Instance.ReturnObject(poolKey, GetComponent<Poolable>());
        }
    }

    public void Initialize()
    {
        // 初始化对象
        gameObject.SetActive(true);
    }
}
```

### 网格批处理优化

```csharp
using UnityEngine;
using System.Collections.Generic;

// 动态批处理优化工具
public class DynamicBatchingOptimizer : MonoBehaviour
{
    [Header("批处理设置")]
    public bool enableDynamicBatching = true;
    public int maxVerticesPerBatch = 300; // Unity的限制是300个顶点
    public bool optimizeMaterials = true;

    [Header("静态批处理设置")]
    public bool enableStaticBatching = true;

    // 优化游戏对象
    public void OptimizeGameObject(GameObject go)
    {
        if (enableDynamicBatching)
        {
            OptimizeForDynamicBatching(go);
        }

        if (enableStaticBatching)
        {
            OptimizeForStaticBatching(go);
        }
    }

    // 为动态批处理优化
    private void OptimizeForDynamicBatching(GameObject go)
    {
        // 检查网格顶点数
        MeshFilter meshFilter = go.GetComponent<MeshFilter>();
        if (meshFilter != null && meshFilter.sharedMesh != null)
        {
            if (meshFilter.sharedMesh.vertexCount > maxVerticesPerBatch)
            {
                Debug.LogWarning($"游戏对象 {go.name} 的网格顶点数 ({meshFilter.sharedMesh.vertexCount}) 超过批处理限制 ({maxVerticesPerBatch})");
            }
        }

        // 确保使用相同的材质
        Renderer renderer = go.GetComponent<Renderer>();
        if (renderer != null)
        {
            // 检查材质是否可以批处理
            if (renderer.sharedMaterials.Length > 1)
            {
                Debug.LogWarning($"游戏对象 {go.name} 使用多个材质，无法进行批处理");
            }
        }

        // 禁用可能阻止批处理的组件
        if (go.GetComponent<Light>() != null)
        {
            Debug.LogWarning($"游戏对象 {go.name} 包含灯光组件，无法批处理");
        }

        if (go.GetComponent<ParticleSystem>() != null)
        {
            Debug.LogWarning($"游戏对象 {go.name} 包含粒子系统，无法批处理");
        }
    }

    // 为静态批处理优化
    private void OptimizeForStaticBatching(GameObject go)
    {
        go.isStatic = true; // 标记为静态
        
        Renderer renderer = go.GetComponent<Renderer>();
        if (renderer != null)
        {
            renderer.receiveShadows = false; // 减少阴影计算
            renderer.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.Off; // 不投射阴影
        }
    }

    // 批量优化场景中的对象
    public void OptimizeScene()
    {
        GameObject[] allObjects = FindObjectsOfType<GameObject>();
        
        foreach (GameObject go in allObjects)
        {
            if (go.CompareTag("Environment") || go.CompareTag("Static"))
            {
                OptimizeGameObject(go);
            }
        }

        // 执行静态批处理
        StaticBatchingUtility.Combine(GameObject.FindGameObjectsWithTag("Environment"));
    }
}

// 材质优化器
public class MaterialOptimizer : MonoBehaviour
{
    [Header("材质优化设置")]
    public bool combineMaterials = true;
    public bool useTextureAtlasing = true;
    public bool optimizeShaders = true;

    // 合并相同材质
    public void CombineMaterials(GameObject parent)
    {
        if (!combineMaterials) return;

        // 获取所有渲染器
        Renderer[] renderers = parent.GetComponentsInChildren<Renderer>();
        
        // 按材质分组
        Dictionary<Material, List<Renderer>> materialGroups = new Dictionary<Material, List<Renderer>>();
        
        foreach (Renderer renderer in renderers)
        {
            foreach (Material material in renderer.sharedMaterials)
            {
                if (!materialGroups.ContainsKey(material))
                {
                    materialGroups[material] = new List<Renderer>();
                }
                materialGroups[material].Add(renderer);
            }
        }

        // 为每个材质组创建合并网格
        foreach (var group in materialGroups)
        {
            if (group.Value.Count > 1)
            {
                CombineMeshesForMaterial(group.Value, group.Key);
            }
        }
    }

    // 为特定材质合并网格
    private void CombineMeshesForMaterial(List<Renderer> renderers, Material material)
    {
        List<CombineInstance> combineInstances = new List<CombineInstance>();
        
        foreach (Renderer renderer in renderers)
        {
            MeshFilter meshFilter = renderer.GetComponent<MeshFilter>();
            if (meshFilter != null && meshFilter.sharedMesh != null)
            {
                CombineInstance combineInstance = new CombineInstance();
                combineInstance.mesh = meshFilter.sharedMesh;
                combineInstance.transform = renderer.transform.localToWorldMatrix;
                combineInstances.Add(combineInstance);
                
                // 隐藏原始渲染器
                renderer.enabled = false;
            }
        }

        if (combineInstances.Count > 0)
        {
            // 创建合并后的网格
            Mesh combinedMesh = new Mesh();
            combinedMesh.CombineMeshes(combineInstances.ToArray());
            
            // 创建新的游戏对象来承载合并的网格
            GameObject combinedObject = new GameObject($"Combined_{material.name}");
            combinedObject.transform.SetParent(renderers[0].transform.parent);
            
            MeshFilter combinedMeshFilter = combinedObject.AddComponent<MeshFilter>();
            combinedMeshFilter.mesh = combinedMesh;
            
            MeshRenderer combinedRenderer = combinedObject.AddComponent<MeshRenderer>();
            combinedRenderer.sharedMaterials = new Material[] { material };
        }
    }
}
```

### 物理优化

```csharp
using UnityEngine;
using System.Collections.Generic;

// 物理优化管理器
public class PhysicsOptimizer : MonoBehaviour
{
    [Header("物理优化设置")]
    public int maxRigidbodyCount = 100;
    public float physicsUpdateRate = 0.02f; // 50 FPS
    public bool useLayerCollisionMatrix = true;
    public bool optimizeTriggerCollisions = true;

    [Header("物理对象池")]
    public bool usePhysicsObjectPool = true;

    private List<Rigidbody> activeRigidbodies = new List<Rigidbody>();
    private Dictionary<Rigidbody, float> sleepTimers = new Dictionary<Rigidbody, float>();

    void Start()
    {
        // 设置物理更新率
        Time.fixedDeltaTime = physicsUpdateRate;
        
        // 优化层碰撞矩阵
        if (useLayerCollisionMatrix)
        {
            OptimizeLayerCollisionMatrix();
        }
    }

    void Update()
    {
        // 监控刚体数量
        if (activeRigidbodies.Count > maxRigidbodyCount)
        {
            Debug.LogWarning($"刚体数量 ({activeRigidbodies.Count}) 超过限制 ({maxRigidbodyCount})");
            OptimizeRigidbodyCount();
        }

        // 管理休眠刚体
        ManageSleepingRigidbodies();
    }

    // 优化层碰撞矩阵
    private void OptimizeLayerCollisionMatrix()
    {
        // 禁用不必要的层碰撞
        // 例如：UI层不应该与其他游戏对象碰撞
        for (int i = 0; i < 32; i++)
        {
            for (int j = 0; j < 32; j++)
            {
                // 根据游戏需求设置碰撞矩阵
                // Physics.IgnoreLayerCollision(i, j, true/false);
            }
        }

        // 示例：禁用UI层与所有其他层的碰撞
        int uiLayer = LayerMask.NameToLayer("UI");
        if (uiLayer != -1)
        {
            for (int i = 0; i < 32; i++)
            {
                if (i != uiLayer)
                {
                    Physics.IgnoreLayerCollision(uiLayer, i, true);
                }
            }
        }
    }

    // 优化刚体数量
    private void OptimizeRigidbodyCount()
    {
        // 暂停一些刚体的物理模拟
        for (int i = maxRigidbodyCount; i < activeRigidbodies.Count; i++)
        {
            Rigidbody rb = activeRigidbodies[i];
            if (rb != null)
            {
                rb.isKinematic = true; // 暂停物理模拟
                sleepTimers[rb] = Time.time;
            }
        }
    }

    // 管理休眠刚体
    private void ManageSleepingRigidbodies()
    {
        List<Rigidbody> toRemove = new List<Rigidbody>();

        foreach (var pair in sleepTimers)
        {
            Rigidbody rb = pair.Key;
            float sleepStartTime = pair.Value;

            if (rb != null)
            {
                // 检查刚体是否应该唤醒
                if (Time.time - sleepStartTime > 5f) // 休眠5秒后检查
                {
                    // 检查是否有外力作用
                    if (rb.velocity.magnitude > 0.1f || rb.angularVelocity.magnitude > 0.1f)
                    {
                        // 有运动，唤醒刚体
                        rb.isKinematic = false;
                        toRemove.Add(rb);
                    }
                }
            }
            else
            {
                toRemove.Add(rb);
            }
        }

        foreach (Rigidbody rb in toRemove)
        {
            sleepTimers.Remove(rb);
        }
    }

    // 注册刚体
    public void RegisterRigidbody(Rigidbody rb)
    {
        if (!activeRigidbodies.Contains(rb))
        {
            activeRigidbodies.Add(rb);
        }
    }

    // 注销刚体
    public void UnregisterRigidbody(Rigidbody rb)
    {
        activeRigidbodies.Remove(rb);
        sleepTimers.Remove(rb);
    }

    // 优化碰撞体
    public void OptimizeCollider(Collider collider)
    {
        if (collider is MeshCollider meshCollider)
        {
            // 对于静态对象，使用凸包碰撞体
            if (collider.gameObject.isStatic)
            {
                meshCollider.convex = true;
            }
        }

        // 对于触发器，优化设置
        if (collider.isTrigger && optimizeTriggerCollisions)
        {
            // 确保触发器对象没有刚体，除非需要物理响应
            if (collider.GetComponent<Rigidbody>() == null)
            {
                // 可以添加一个简单的刚体来优化触发器性能
                Rigidbody rb = collider.gameObject.AddComponent<Rigidbody>();
                rb.isKinematic = true;
                rb.useGravity = false;
            }
        }
    }

    // 物理对象池
    public class PhysicsObjectPool<T> where T : Component
    {
        private Queue<T> pool = new Queue<T>();
        private T prefab;
        private Transform parent;

        public PhysicsObjectPool(T prefab, int initialSize, Transform parent = null)
        {
            this.prefab = prefab;
            this.parent = parent;

            for (int i = 0; i < initialSize; i++)
            {
                T obj = CreateNewObject();
                obj.GetComponent<Rigidbody>().isKinematic = true; // 初始状态为静止
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
                obj.GetComponent<Rigidbody>().isKinematic = false; // 激活物理
            }
            else
            {
                obj = CreateNewObject();
                obj.GetComponent<Rigidbody>().isKinematic = false;
            }
            return obj;
        }

        public void ReturnToPool(T obj)
        {
            if (obj != null)
            {
                obj.GetComponent<Rigidbody>().isKinematic = true; // 停止物理模拟
                obj.GetComponent<Rigidbody>().velocity = Vector3.zero;
                obj.GetComponent<Rigidbody>().angularVelocity = Vector3.zero;
                
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
    }
}

// 物理事件优化
public class OptimizedPhysicsEvents : MonoBehaviour
{
    [Header("事件优化设置")]
    public float eventCheckInterval = 0.1f;
    public bool useCollisionFiltering = true;

    private float lastEventCheckTime = 0f;
    private Collider[] tempColliders = new Collider[10]; // 重用数组

    void Update()
    {
        if (Time.time - lastEventCheckTime >= eventCheckInterval)
        {
            CheckPhysicsEvents();
            lastEventCheckTime = Time.time;
        }
    }

    private void CheckPhysicsEvents()
    {
        // 使用重用的数组进行碰撞检测
        int count = Physics.OverlapSphereNonAlloc(transform.position, 5f, tempColliders);
        
        for (int i = 0; i < count; i++)
        {
            if (useCollisionFiltering)
            {
                // 过滤不必要的碰撞事件
                if (ShouldProcessCollision(tempColliders[i]))
                {
                    ProcessCollision(tempColliders[i]);
                }
            }
            else
            {
                ProcessCollision(tempColliders[i]);
            }
        }
    }

    private bool ShouldProcessCollision(Collider other)
    {
        // 根据标签或层过滤碰撞
        return other.CompareTag("Player") || other.CompareTag("Enemy");
    }

    private void ProcessCollision(Collider other)
    {
        // 处理碰撞事件
        Debug.Log($"检测到碰撞: {other.name}");
    }
}
```

---

## 内存管理最佳实践

### 内存监控和分析

```csharp
using UnityEngine;
using System.Collections.Generic;
using System.Text;

// 内存监控器
public class MemoryMonitor : MonoBehaviour
{
    [Header("内存监控设置")]
    public bool enableMemoryMonitoring = true;
    public float monitorInterval = 1f;
    public long memoryWarningThreshold = 500 * 1024 * 1024; // 500MB
    public bool logMemoryInfo = true;

    private float lastMonitorTime = 0f;
    private List<long> memoryHistory = new List<long>();
    private StringBuilder memoryReport = new StringBuilder();

    void Update()
    {
        if (enableMemoryMonitoring && Time.time - lastMonitorTime >= monitorInterval)
        {
            MonitorMemory();
            lastMonitorTime = Time.time;
        }
    }

    private void MonitorMemory()
    {
        long currentMemory = System.GC.GetTotalMemory(false);
        memoryHistory.Add(currentMemory);

        // 保持历史记录在合理范围内
        if (memoryHistory.Count > 60) // 保留最近60次记录
        {
            memoryHistory.RemoveAt(0);
        }

        // 检查内存使用是否超过阈值
        if (currentMemory > memoryWarningThreshold)
        {
            Debug.LogWarning($"内存使用警告: {FormatBytes(currentMemory)} (阈值: {FormatBytes(memoryWarningThreshold)})");
            GenerateMemoryReport();
        }

        if (logMemoryInfo)
        {
            LogMemoryInfo(currentMemory);
        }
    }

    private void LogMemoryInfo(long currentMemory)
    {
        Debug.Log($"内存使用: {FormatBytes(currentMemory)}, " +
                 $"分配: {FormatBytes(System.GC.GetTotalMemory(false))}, " +
                 $"GC次数: {System.GC.CollectionCount(0)}/{System.GC.CollectionCount(1)}/{System.GC.CollectionCount(2)}");
    }

    // 生成内存报告
    private void GenerateMemoryReport()
    {
        memoryReport.Length = 0; // 清空但不重新分配
        memoryReport.AppendLine("=== 内存使用报告 ===");
        memoryReport.AppendLine($"当前时间: {System.DateTime.Now}");
        memoryReport.AppendLine($"当前内存使用: {FormatBytes(System.GC.GetTotalMemory(false))}");
        memoryReport.AppendLine($"Unity报告内存: {FormatBytes(UnityEngine.Profiling.Profiler.GetTotalAllocatedMemoryLong())}");
        memoryReport.AppendLine($"Unity保留内存: {FormatBytes(UnityEngine.Profiling.Profiler.GetTotalReservedMemoryLong())}");
        memoryReport.AppendLine($"Unity峰值内存: {FormatBytes(UnityEngine.Profiling.Profiler.GetPeakAllocatedMemoryLong())}");
        
        // GC统计
        memoryReport.AppendLine($"GC次数 (0/1/2): {System.GC.CollectionCount(0)}/{System.GC.CollectionCount(1)}/{System.GC.CollectionCount(2)}");
        
        // 对象统计
        int totalObjects = FindObjectsOfType<Object>().Length;
        memoryReport.AppendLine($"总对象数量: {totalObjects}");
        
        // 材质统计
        Material[] allMaterials = Resources.FindObjectsOfTypeAll<Material>();
        memoryReport.AppendLine($"材质数量: {allMaterials.Length}");
        
        // 纹理统计
        Texture[] allTextures = Resources.FindObjectsOfTypeAll<Texture>();
        memoryReport.AppendLine($"纹理数量: {allTextures.Length}");
        
        // 音频剪辑统计
        AudioClip[] allAudioClips = Resources.FindObjectsOfTypeAll<AudioClip>();
        memoryReport.AppendLine($"音频剪辑数量: {allAudioClips.Length}");

        Debug.Log(memoryReport.ToString());
    }

    // 格式化字节数
    private string FormatBytes(long bytes)
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

    // 强制垃圾回收
    public void ForceGarbageCollection()
    {
        System.GC.Collect();
        System.GC.WaitForPendingFinalizers();
        Debug.Log("强制垃圾回收完成");
    }

    // 获取内存使用详情
    public MemoryUsageInfo GetMemoryUsageInfo()
    {
        return new MemoryUsageInfo
        {
            currentMemory = System.GC.GetTotalMemory(false),
            unityAllocatedMemory = UnityEngine.Profiling.Profiler.GetTotalAllocatedMemoryLong(),
            unityReservedMemory = UnityEngine.Profiling.Profiler.GetTotalReservedMemoryLong(),
            unityPeakMemory = UnityEngine.Profiling.Profiler.GetPeakAllocatedMemoryLong(),
            gcCountGen0 = System.GC.CollectionCount(0),
            gcCountGen1 = System.GC.CollectionCount(1),
            gcCountGen2 = System.GC.CollectionCount(2),
            totalObjects = FindObjectsOfType<Object>().Length
        };
    }
}

[System.Serializable]
public class MemoryUsageInfo
{
    public long currentMemory;
    public long unityAllocatedMemory;
    public long unityReservedMemory;
    public long unityPeakMemory;
    public int gcCountGen0;
    public int gcCountGen1;
    public int gcCountGen2;
    public int totalObjects;
}

// 内存泄漏检测器
public class MemoryLeakDetector : MonoBehaviour
{
    [Header("泄漏检测设置")]
    public bool enableLeakDetection = true;
    public float detectionInterval = 5f;
    public float memoryGrowthThreshold = 0.1f; // 10%的增长阈值

    private Dictionary<string, int> objectCounts = new Dictionary<string, int>();
    private Dictionary<string, int> previousObjectCounts = new Dictionary<string, int>();
    private float lastDetectionTime = 0f;

    void Update()
    {
        if (enableLeakDetection && Time.time - lastDetectionTime >= detectionInterval)
        {
            DetectMemoryLeaks();
            lastDetectionTime = Time.time;
        }
    }

    private void DetectMemoryLeaks()
    {
        previousObjectCounts = new Dictionary<string, int>(objectCounts);
        objectCounts.Clear();

        // 统计各种对象的数量
        CountObjects<Object>("Total Objects");
        CountObjects<GameObject>("GameObjects");
        CountObjects<Component>("Components");
        CountObjects<Material>("Materials");
        CountObjects<Texture>("Textures");
        CountObjects<AudioClip>("AudioClips");
        CountObjects<AnimationClip>("AnimationClips");

        // 检查数量增长
        foreach (var kvp in objectCounts)
        {
            if (previousObjectCounts.ContainsKey(kvp.Key))
            {
                int previousCount = previousObjectCounts[kvp.Key];
                int currentCount = kvp.Value;
                
                if (previousCount > 0)
                {
                    float growthRate = (float)(currentCount - previousCount) / previousCount;
                    
                    if (growthRate > memoryGrowthThreshold)
                    {
                        Debug.LogWarning($"可能的内存泄漏检测到: {kvp.Key} 数量增长 {growthRate:P2} " +
                                       $"({previousCount} -> {currentCount})");
                    }
                }
            }
        }
    }

    private void CountObjects<T>(string key) where T : Object
    {
        T[] objects = Resources.FindObjectsOfTypeAll<T>();
        objectCounts[key] = objects.Length;
    }

    // 获取对象引用信息
    public void LogObjectReferences()
    {
        // 记录所有对象的引用信息
        Object[] allObjects = Resources.FindObjectsOfTypeAll<Object>();
        
        Dictionary<System.Type, int> typeCounts = new Dictionary<System.Type, int>();
        
        foreach (Object obj in allObjects)
        {
            System.Type type = obj.GetType();
            if (typeCounts.ContainsKey(type))
            {
                typeCounts[type]++;
            }
            else
            {
                typeCounts[type] = 1;
            }
        }

        Debug.Log("对象类型统计:");
        foreach (var kvp in typeCounts)
        {
            Debug.Log($"  {kvp.Key.Name}: {kvp.Value}");
        }
    }
}
```

### 资源管理最佳实践

```csharp
using UnityEngine;
using System.Collections;
using System.Collections.Generic;

// 资源管理器
public class ResourceManager : MonoBehaviour
{
    [Header("资源管理设置")]
    public bool enableAssetBundles = false;
    public bool enableResourcePooling = true;
    public float resourceCleanupInterval = 300f; // 5分钟

    private Dictionary<string, Object> loadedAssets = new Dictionary<string, Object>();
    private Dictionary<string, float> lastAccessTime = new Dictionary<string, float>();
    private Dictionary<string, int> referenceCounts = new Dictionary<string, int>();
    private List<string> assetsToUnload = new List<string>();

    private float lastCleanupTime = 0f;

    void Update()
    {
        if (Time.time - lastCleanupTime >= resourceCleanupInterval)
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
        // 检查资源是否已加载
        if (loadedAssets.ContainsKey(path))
        {
            referenceCounts[path]++;
            lastAccessTime[path] = Time.time;
            
            T asset = loadedAssets[path] as T;
            callback?.Invoke(asset);
            yield break;
        }

        // 异步加载资源
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
        // 检查是否已加载
        if (loadedAssets.ContainsKey(path))
        {
            referenceCounts[path]++;
            lastAccessTime[path] = Time.time;
            return loadedAssets[path] as T;
        }

        // 加载资源
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
                // 标记为卸载
                assetsToUnload.Add(path);
            }
        }
    }

    // 立即卸载资源
    public void UnloadAssetImmediate(string path)
    {
        if (loadedAssets.ContainsKey(path))
        {
            Object asset = loadedAssets[path];
            
            // 根据资源类型进行卸载
            if (asset is GameObject || asset is Component)
            {
                // 对于游戏对象，使用Destroy
                if (asset is GameObject go)
                {
                    Destroy(go);
                }
            }
            else
            {
                // 对于其他资源，使用Resources.UnloadAsset
                Resources.UnloadAsset(asset);
            }

            loadedAssets.Remove(path);
            referenceCounts.Remove(path);
            lastAccessTime.Remove(path);
        }
    }

    // 卸载未使用的资源
    public void UnloadUnusedAssets()
    {
        // 使用Unity的内置方法卸载未使用的资源
        Resources.UnloadUnusedAssets();
        System.GC.Collect();
    }

    // 清理未使用的资源
    private void CleanupUnusedResources()
    {
        // 处理标记为卸载的资源
        foreach (string path in assetsToUnload)
        {
            UnloadAssetImmediate(path);
        }
        assetsToUnload.Clear();

        // 卸载长时间未访问的资源
        List<string> toRemove = new List<string>();
        float currentTime = Time.time;

        foreach (var kvp in lastAccessTime)
        {
            // 如果资源超过10分钟未被访问，则考虑卸载
            if (currentTime - kvp.Value > 600f && referenceCounts[kvp.Key] <= 0)
            {
                toRemove.Add(kvp.Key);
            }
        }

        foreach (string path in toRemove)
        {
            UnloadAssetImmediate(path);
        }
    }

    // 预加载资源
    public void PreloadAssets(List<string> assetPaths)
    {
        foreach (string path in assetPaths)
        {
            LoadAsset<Object>(path); // 预加载资源
        }
    }

    // 获取资源使用统计
    public ResourceUsageInfo GetResourceUsageInfo()
    {
        return new ResourceUsageInfo
        {
            loadedAssetCount = loadedAssets.Count,
            totalReferenceCount = 0,
            unusedAssetCount = 0
        };
    }

    // 优化纹理内存使用
    public void OptimizeTextureMemory()
    {
        Texture[] allTextures = Resources.FindObjectsOfTypeAll<Texture>();
        
        foreach (Texture texture in allTextures)
        {
            // 对于运行时创建的纹理，确保正确释放
            if (texture.name.StartsWith("Runtime_"))
            {
                // 这些纹理可能需要特殊处理
                Debug.Log($"运行时纹理: {texture.name}, 尺寸: {texture.width}x{texture.height}");
            }
        }
    }

    void OnDestroy()
    {
        // 清理所有资源
        foreach (string path in loadedAssets.Keys)
        {
            Object asset = loadedAssets[path];
            if (!(asset is GameObject || asset is Component))
            {
                Resources.UnloadAsset(asset);
            }
        }
        
        loadedAssets.Clear();
        referenceCounts.Clear();
        lastAccessTime.Clear();
    }
}

[System.Serializable]
public class ResourceUsageInfo
{
    public int loadedAssetCount;
    public int totalReferenceCount;
    public int unusedAssetCount;
}

// 资源加载器工具类
public static class ResourceLoader
{
    // 安全加载资源，带错误处理
    public static T SafeLoad<T>(string path, T defaultValue = null) where T : Object
    {
        try
        {
            T resource = Resources.Load<T>(path);
            if (resource == null)
            {
                Debug.LogWarning($"无法加载资源: {path}, 返回默认值");
                return defaultValue;
            }
            return resource;
        }
        catch (System.Exception e)
        {
            Debug.LogError($"加载资源时发生异常: {path}, 错误: {e.Message}");
            return defaultValue;
        }
    }

    // 异步安全加载
    public static IEnumerator SafeLoadAsync<T>(string path, System.Action<T> callback, T defaultValue = null) where T : Object
    {
        ResourceRequest request = Resources.LoadAsync<T>(path);
        yield return request;

        try
        {
            T resource = request.asset as T;
            if (resource == null)
            {
                Debug.LogWarning($"无法加载资源: {path}, 返回默认值");
                callback?.Invoke(defaultValue);
            }
            else
            {
                callback?.Invoke(resource);
            }
        }
        catch (System.Exception e)
        {
            Debug.LogError($"加载资源时发生异常: {path}, 错误: {e.Message}");
            callback?.Invoke(defaultValue);
        }
    }

    // 批量加载资源
    public static IEnumerator BatchLoadAsync<T>(List<string> paths, System.Action<Dictionary<string, T>> callback) where T : Object
    {
        Dictionary<string, T> results = new Dictionary<string, T>();
        List<Coroutine> loadOperations = new List<Coroutine>();

        foreach (string path in paths)
        {
            yield return SafeLoadAsync(path, (T resource) =>
            {
                results[path] = resource;
            });
        }

        callback?.Invoke(results);
    }
}
```

### 字符串和集合优化

```csharp
using UnityEngine;
using System.Collections.Generic;
using System.Text;

// 字符串优化工具
public class StringOptimization : MonoBehaviour
{
    // 使用StringBuilder进行字符串拼接
    private StringBuilder stringBuilder = new StringBuilder();

    // 避免字符串拼接的性能问题
    public string BuildStatusString(int health, int maxHealth, int level, string playerName)
    {
        stringBuilder.Length = 0; // 清空但不重新分配内存
        
        stringBuilder.Append(playerName);
        stringBuilder.Append(" - HP: ");
        stringBuilder.Append(health);
        stringBuilder.Append("/");
        stringBuilder.Append(maxHealth);
        stringBuilder.Append(" Lvl: ");
        stringBuilder.Append(level);
        
        return stringBuilder.ToString();
    }

    // 使用字符串池避免重复创建
    private Dictionary<string, string> stringPool = new Dictionary<string, string>();

    public string GetPooledString(string input)
    {
        if (stringPool.ContainsKey(input))
        {
            return stringPool[input];
        }
        
        string pooledString = input; // 实际上就是原字符串，但概念上是池化的
        stringPool[input] = pooledString;
        return pooledString;
    }

    // 避免装箱的数值格式化
    public string FormatNumberWithoutBoxing(int number)
    {
        // 使用Span或直接操作字符数组来避免装箱
        char[] buffer = new char[12]; // int的最大位数
        int index = buffer.Length;

        // 处理负数
        bool isNegative = number < 0;
        if (isNegative)
        {
            number = -number;
        }

        // 从后往前填充数字
        do
        {
            buffer[--index] = (char)('0' + (number % 10));
            number /= 10;
        } while (number != 0);

        // 添加负号
        if (isNegative)
        {
            buffer[--index] = '-';
        }

        // 转换为字符串
        return new string(buffer, index, buffer.Length - index);
    }

    // 使用缓存的字符串比较
    public bool CompareCachedString(string a, string b)
    {
        // 对于频繁比较的字符串，可以使用引用比较（如果确定是同一实例）
        // 或者使用StringComparer.OrdinalIgnoreCase等优化比较
        return string.Equals(a, b, System.StringComparison.Ordinal);
    }
}

// 集合优化工具
public class CollectionOptimization : MonoBehaviour
{
    // 预分配集合大小
    private List<int> preallocatedList = new List<int>(100); // 预分配容量
    private Dictionary<int, string> preallocatedDict = new Dictionary<int, string>(50); // 预分配容量
    private HashSet<string> preallocatedSet = new HashSet<string>(20); // 预分配容量

    // 使用Span<T>进行高性能操作（C# 7.2+）
    void ProcessArrayWithSpan(int[] array)
    {
        System.Span<int> span = array.AsSpan();
        for (int i = 0; i < span.Length; i++)
        {
            span[i] *= 2; // 直接在栈上操作，无GC
        }
    }

    // 使用Memory<T>处理数组片段
    void ProcessArraySegment(int[] array, int start, int length)
    {
        System.Memory<int> memory = array.AsMemory(start, length);
        System.Span<int> span = memory.Span;
        
        for (int i = 0; i < span.Length; i++)
        {
            span[i] *= 2;
        }
    }

    // 优化的列表操作
    public void OptimizedListOperations()
    {
        // 预分配容量
        List<GameObject> gameObjects = new List<GameObject>(100);
        
        // 使用索引访问而不是LINQ（如果可能）
        for (int i = 0; i < gameObjects.Count; i++)
        {
            if (gameObjects[i] != null)
            {
                // 处理对象
            }
        }

        // 使用RemoveAll而不是循环Remove
        gameObjects.RemoveAll(obj => obj == null);

        // 使用Clear而不是创建新列表
        gameObjects.Clear(); // 保持容量，只清空内容
    }

    // 优化的字典操作
    public void OptimizedDictionaryOperations()
    {
        // 使用TryGetValue而不是ContainsKey + 索引
        Dictionary<string, int> dict = new Dictionary<string, int>();
        
        if (dict.TryGetValue("key", out int value))
        {
            // 使用value
        }

        // 预设容量以避免重新哈希
        Dictionary<string, GameObject> objectDict = new Dictionary<string, GameObject>(100);
    }

    // 优化的集合查找
    public void OptimizedLookups()
    {
        // 使用HashSet进行快速成员检查
        HashSet<int> idSet = new HashSet<int> { 1, 2, 3, 4, 5 };
        
        if (idSet.Contains(3)) // O(1)时间复杂度
        {
            // 快速查找
        }

        // 使用Dictionary进行快速键值查找
        Dictionary<int, string> lookup = new Dictionary<int, string>();
        if (lookup.ContainsKey(123))
        {
            string value = lookup[123]; // O(1)时间复杂度
        }
    }

    // 对象池化的集合
    public class PooledList<T>
    {
        private static Stack<List<T>> pool = new Stack<List<T>>();
        private List<T> list;

        public PooledList()
        {
            if (pool.Count > 0)
            {
                list = pool.Pop();
                list.Clear(); // 清空内容但保持容量
            }
            else
            {
                list = new List<T>(10); // 初始容量
            }
        }

        public void Add(T item)
        {
            list.Add(item);
        }

        public T this[int index] => list[index];
        public int Count => list.Count;

        public void ReturnToPool()
        {
            list.Clear();
            pool.Push(list);
        }

        public List<T>.Enumerator GetEnumerator()
        {
            return list.GetEnumerator();
        }
    }

    // 使用示例
    void UsePooledList()
    {
        PooledList<GameObject> pooledList = new PooledList<GameObject>();
        
        try
        {
            // 使用列表
            pooledList.Add(gameObject);
            // ... 其他操作
        }
        finally
        {
            // 确保返回池中
            pooledList.ReturnToPool();
        }
    }
}
```

---

## UI系统最佳实践

### UI性能优化

```csharp
using UnityEngine;
using UnityEngine.UI;
using System.Collections.Generic;

// UI性能优化管理器
public class UIOptimizer : MonoBehaviour
{
    [Header("UI优化设置")]
    public bool enableCanvasOptimization = true;
    public bool enableGraphicRaycastOptimization = true;
    public bool enableLayoutOptimization = true;
    public bool enableAnimationOptimization = true;

    [Header("UI对象池")]
    public bool useUIObjectPooling = true;

    // UI对象池
    private Dictionary<string, Queue<GameObject>> uiObjectPools = new Dictionary<string, Queue<GameObject>>();

    // 优化Canvas
    public void OptimizeCanvas(Canvas canvas)
    {
        if (!enableCanvasOptimization) return;

        // 设置合适的渲染模式
        if (canvas.renderMode == RenderMode.WorldSpace)
        {
            // 世界空间Canvas的优化
            canvas.pixelPerfect = false; // 除非特别需要，否则关闭像素完美
        }
        else
        {
            // 屏幕空间Canvas的优化
            canvas.pixelPerfect = true;
        }

        // 优化射线检测
        if (enableGraphicRaycastOptimization)
        {
            GraphicRaycaster raycaster = canvas.GetComponent<GraphicRaycaster>();
            if (raycaster != null)
            {
                raycaster.blockingObjects = GraphicRaycaster.BlockingObjects.None;
            }
        }

        // 优化渲染顺序
        canvas.sortingOrder = 0; // 根据需要调整
    }

    // 优化UI布局
    public void OptimizeLayout(GameObject uiRoot)
    {
        if (!enableLayoutOptimization) return;

        // 优化布局组件
        LayoutGroup[] layoutGroups = uiRoot.GetComponentsInChildren<LayoutGroup>();
        
        foreach (LayoutGroup layoutGroup in layoutGroups)
        {
            // 减少布局重建
            if (layoutGroup is HorizontalLayoutGroup || layoutGroup is VerticalLayoutGroup)
            {
                // 设置固定大小以避免自动布局计算
                RectTransform rectTransform = layoutGroup.GetComponent<RectTransform>();
                if (rectTransform != null)
                {
                    rectTransform.anchorMin = Vector2.zero;
                    rectTransform.anchorMax = Vector2.one;
                }
            }
        }

        // 优化内容大小过滤器
        ContentSizeFitter[] sizeFitters = uiRoot.GetComponentsInChildren<ContentSizeFitter>();
        foreach (ContentSizeFitter fitter in sizeFitters)
        {
            // 谨慎使用内容大小过滤器，它们会强制重新计算布局
            fitter.enabled = false; // 或根据需要启用
        }
    }

    // 优化UI动画
    public void OptimizeUIAnimation(Animator animator)
    {
        if (!enableAnimationOptimization) return;

        // 优化动画更新模式
        animator.updateMode = AnimatorUpdateMode.UnscaledTime; // 根据需要选择

        // 减少动画中的UI更新频率
        // 在动画中避免频繁改变UI元素的属性
    }

    // 创建UI对象池
    public void CreateUIObjectPool(string poolKey, GameObject prefab, int initialSize)
    {
        if (!useUIObjectPooling) return;

        if (!uiObjectPools.ContainsKey(poolKey))
        {
            uiObjectPools[poolKey] = new Queue<GameObject>();
            
            // 预创建对象
            for (int i = 0; i < initialSize; i++)
            {
                GameObject obj = Instantiate(prefab);
                obj.SetActive(false);
                obj.transform.SetParent(transform, false);
                uiObjectPools[poolKey].Enqueue(obj);
            }
        }
    }

    // 从池中获取UI对象
    public GameObject GetUIObject(string poolKey)
    {
        if (useUIObjectPooling && uiObjectPools.ContainsKey(poolKey))
        {
            if (uiObjectPools[poolKey].Count > 0)
            {
                GameObject obj = uiObjectPools[poolKey].Dequeue();
                obj.SetActive(true);
                return obj;
            }
            else
            {
                Debug.LogWarning($"UI对象池 {poolKey} 已空");
            }
        }

        return null;
    }

    // 返回UI对象到池中
    public void ReturnUIObject(string poolKey, GameObject obj)
    {
        if (useUIObjectPooling && uiObjectPools.ContainsKey(poolKey))
        {
            obj.SetActive(false);
            obj.transform.SetParent(transform, false);
            uiObjectPools[poolKey].Enqueue(obj);
        }
    }

    // 优化UI材质
    public void OptimizeUIMaterials(Canvas canvas)
    {
        // 获取所有UI元素的材质
        Graphic[] graphics = canvas.GetComponentsInChildren<Graphic>();
        
        // 尽可能共享材质实例
        Dictionary<string, Material> materialCache = new Dictionary<string, Material>();
        
        foreach (Graphic graphic in graphics)
        {
            if (graphic.material != null)
            {
                string materialKey = graphic.material.name;
                
                if (materialCache.ContainsKey(materialKey))
                {
                    // 共享相同材质
                    graphic.material = materialCache[materialKey];
                }
                else
                {
                    materialCache[materialKey] = graphic.material;
                }
            }
        }
    }

    // 减少Canvas重建
    public class OptimizedCanvasGroup : MonoBehaviour
    {
        private CanvasGroup canvasGroup;
        private bool isVisible = true;

        void Start()
        {
            canvasGroup = GetComponent<CanvasGroup>();
            if (canvasGroup == null)
            {
                canvasGroup = gameObject.AddComponent<CanvasGroup>();
            }
        }

        // 使用CanvasGroup而不是频繁激活/停用
        public void SetVisible(bool visible)
        {
            if (isVisible != visible)
            {
                isVisible = visible;
                canvasGroup.alpha = visible ? 1f : 0f;
                canvasGroup.interactable = visible;
                canvasGroup.blocksRaycasts = visible;
            }
        }
    }
}

// 高效的UI更新管理器
public class UIUpdateManager : MonoBehaviour
{
    [Header("更新设置")]
    public float updateInterval = 0.1f; // 100ms更新一次
    public bool enableBatchUpdates = true;

    private List<IUIUpdatable> updatableComponents = new List<IUIUpdatable>();
    private float lastUpdateTime = 0f;

    void Update()
    {
        if (Time.time - lastUpdateTime >= updateInterval)
        {
            BatchUpdateUI();
            lastUpdateTime = Time.time;
        }
    }

    // 批量更新UI
    private void BatchUpdateUI()
    {
        if (enableBatchUpdates)
        {
            // 批量更新所有注册的UI组件
            for (int i = 0; i < updatableComponents.Count; i++)
            {
                updatableComponents[i]?.UpdateUI();
            }
        }
    }

    // 注册可更新的UI组件
    public void RegisterUpdatable(IUIUpdatable updatable)
    {
        if (!updatableComponents.Contains(updatable))
        {
            updatableComponents.Add(updatable);
        }
    }

    // 注销可更新的UI组件
    public void UnregisterUpdatable(IUIUpdatable updatable)
    {
        updatableComponents.Remove(updatable);
    }
}

// UI更新接口
public interface IUIUpdatable
{
    void UpdateUI();
}

// 优化的文本组件
public class OptimizedText : MonoBehaviour, IUIUpdatable
{
    private Text uiText;
    private string currentText = "";
    private int currentValue = 0;

    void Start()
    {
        uiText = GetComponent<Text>();
        if (uiText != null)
        {
            UIUpdateManager updateManager = FindObjectOfType<UIUpdateManager>();
            if (updateManager != null)
            {
                updateManager.RegisterUpdatable(this);
            }
        }
    }

    // 设置文本（不立即更新）
    public void SetText(string text)
    {
        currentText = text;
    }

    // 设置数值（不立即更新）
    public void SetValue(int value)
    {
        currentValue = value;
    }

    // 批量更新时调用
    public void UpdateUI()
    {
        if (uiText != null && uiText.text != currentText)
        {
            uiText.text = currentText;
        }
    }

    void OnDestroy()
    {
        UIUpdateManager updateManager = FindObjectOfType<UIUpdateManager>();
        if (updateManager != null)
        {
            updateManager.UnregisterUpdatable(this);
        }
    }
}
```

### UI事件系统优化

```csharp
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.EventSystems;
using System.Collections.Generic;

// 优化的UI事件系统
public class OptimizedUIEventSystem : MonoBehaviour
{
    [Header("事件优化设置")]
    public bool enableEventPooling = true;
    public bool enableEventThrottling = true;
    public float eventThrottleInterval = 0.1f;

    private Dictionary<string, float> lastEventTime = new Dictionary<string, float>();
    private Queue<BaseEventData> eventPool = new Queue<BaseEventData>();

    // 优化的按钮点击处理
    public class OptimizedButton : Button
    {
        [Header("优化设置")]
        public bool enableDoubleClickProtection = true;
        public float doubleClickInterval = 0.3f;

        private float lastClickTime = 0f;
        private bool isDoubleClick = false;

        public override void OnPointerClick(PointerEventData eventData)
        {
            if (enableDoubleClickProtection)
            {
                float currentTime = Time.unscaledTime;
                
                if (currentTime - lastClickTime < doubleClickInterval)
                {
                    isDoubleClick = true;
                    OnDoubleClick();
                }
                else
                {
                    isDoubleClick = false;
                    OnSingleClick();
                }
                
                lastClickTime = currentTime;
            }
            else
            {
                OnSingleClick();
            }
        }

        protected virtual void OnSingleClick()
        {
            // 单击处理
            OnClick?.Invoke();
        }

        protected virtual void OnDoubleClick()
        {
            // 双击处理
            OnDoubleClick?.Invoke();
        }

        public System.Action OnClick;
        public System.Action OnDoubleClick;
    }

    // 优化的滑动条
    public class OptimizedSlider : Slider
    {
        [Header("优化设置")]
        public bool enableValueChangeThrottling = true;
        public float valueChangeInterval = 0.1f;

        private float lastValueChangeTime = 0f;
        private float lastValue = 0f;

        public override float value
        {
            get => base.value;
            set
            {
                if (enableValueChangeThrottling)
                {
                    float currentTime = Time.unscaledTime;
                    
                    if (currentTime - lastValueChangeTime >= valueChangeInterval)
                    {
                        base.value = value;
                        lastValueChangeTime = currentTime;
                        lastValue = value;
                        
                        onValueChanged.Invoke(value);
                    }
                    else if (Mathf.Abs(value - lastValue) > 0.1f) // 大幅变化仍需更新
                    {
                        base.value = value;
                        lastValue = value;
                        onValueChanged.Invoke(value);
                    }
                }
                else
                {
                    base.value = value;
                    onValueChanged.Invoke(value);
                }
            }
        }
    }

    // 优化的输入字段
    public class OptimizedInputField : InputField
    {
        [Header("优化设置")]
        public bool enableTextChangeThrottling = true;
        public float textChangeInterval = 0.5f;

        private float lastTextChangeTime = 0f;

        protected override void SendOnValueChanged()
        {
            if (enableTextChangeThrottling)
            {
                float currentTime = Time.unscaledTime;
                
                if (currentTime - lastTextChangeTime >= textChangeInterval)
                {
                    base.SendOnValueChanged();
                    lastTextChangeTime = currentTime;
                }
            }
            else
            {
                base.SendOnValueChanged();
            }
        }
    }

    // 事件节流检查
    public bool CanProcessEvent(string eventId)
    {
        if (!enableEventThrottling)
        {
            return true;
        }

        float currentTime = Time.unscaledTime;
        
        if (lastEventTime.ContainsKey(eventId))
        {
            if (currentTime - lastEventTime[eventId] >= eventThrottleInterval)
            {
                lastEventTime[eventId] = currentTime;
                return true;
            }
            return false;
        }
        else
        {
            lastEventTime[eventId] = currentTime;
            return true;
        }
    }

    // 优化的UI动画
    public class OptimizedUIAnimation : MonoBehaviour
    {
        [Header("动画设置")]
        public AnimationCurve animationCurve = AnimationCurve.EaseInOut(0, 0, 1, 1);
        public float animationDuration = 1f;
        public bool useUnscaledTime = true;

        private Coroutine animationCoroutine;
        private System.Action onCompleteCallback;

        // 淡入动画
        public void FadeIn(Graphic graphic, System.Action onComplete = null)
        {
            if (animationCoroutine != null)
            {
                StopCoroutine(animationCoroutine);
            }

            onCompleteCallback = onComplete;
            animationCoroutine = StartCoroutine(FadeInCoroutine(graphic));
        }

        private System.Collections.IEnumerator FadeInCoroutine(Graphic graphic)
        {
            CanvasGroup canvasGroup = GetComponent<CanvasGroup>();
            if (canvasGroup == null)
            {
                canvasGroup = gameObject.AddComponent<CanvasGroup>();
            }

            float startTime = useUnscaledTime ? Time.unscaledTime : Time.time;
            float progress = 0f;

            while (progress < 1f)
            {
                progress = useUnscaledTime ? 
                    (Time.unscaledTime - startTime) / animationDuration :
                    (Time.time - startTime) / animationDuration;

                float alpha = animationCurve.Evaluate(progress);
                canvasGroup.alpha = alpha;

                yield return null;
            }

            canvasGroup.alpha = 1f;
            onCompleteCallback?.Invoke();
            animationCoroutine = null;
        }

        // 移动动画
        public void MoveTo(RectTransform rectTransform, Vector2 targetPosition, System.Action onComplete = null)
        {
            if (animationCoroutine != null)
            {
                StopCoroutine(animationCoroutine);
            }

            onCompleteCallback = onComplete;
            animationCoroutine = StartCoroutine(MoveToCoroutine(rectTransform, targetPosition));
        }

        private System.Collections.IEnumerator MoveToCoroutine(RectTransform rectTransform, Vector2 targetPosition)
        {
            Vector2 startPosition = rectTransform.anchoredPosition;
            float startTime = useUnscaledTime ? Time.unscaledTime : Time.time;
            float progress = 0f;

            while (progress < 1f)
            {
                progress = useUnscaledTime ? 
                    (Time.unscaledTime - startTime) / animationDuration :
                    (Time.time - startTime) / animationDuration;

                float t = animationCurve.Evaluate(progress);
                rectTransform.anchoredPosition = Vector2.Lerp(startPosition, targetPosition, t);

                yield return null;
            }

            rectTransform.anchoredPosition = targetPosition;
            onCompleteCallback?.Invoke();
            animationCoroutine = null;
        }

        void OnDisable()
        {
            if (animationCoroutine != null)
            {
                StopCoroutine(animationCoroutine);
                animationCoroutine = null;
            }
        }
    }

    // UI资源管理
    public class UIResourceManager : MonoBehaviour
    {
        private Dictionary<string, Sprite> spriteCache = new Dictionary<string, Sprite>();
        private Dictionary<string, Font> fontCache = new Dictionary<string, Font>();

        // 缓存精灵
        public Sprite GetCachedSprite(string spritePath)
        {
            if (spriteCache.ContainsKey(spritePath))
            {
                return spriteCache[spritePath];
            }

            Sprite sprite = Resources.Load<Sprite>(spritePath);
            if (sprite != null)
            {
                spriteCache[spritePath] = sprite;
            }

            return sprite;
        }

        // 缓存字体
        public Font GetCachedFont(string fontPath)
        {
            if (fontCache.ContainsKey(fontPath))
            {
                return fontCache[fontPath];
            }

            Font font = Resources.Load<Font>(fontPath);
            if (font != null)
            {
                fontCache[fontPath] = font;
            }

            return font;
        }

        // 清理缓存
        public void ClearCache()
        {
            spriteCache.Clear();
            fontCache.Clear();
        }
    }
}
```

---

## 音频系统最佳实践

### 音频管理器优化

```csharp
using UnityEngine;
using System.Collections;
using System.Collections.Generic;

// 优化的音频管理器
public class OptimizedAudioManager : MonoBehaviour
{
    [Header("音频系统设置")]
    public AudioMixerGroup masterMixerGroup;
    public float masterVolume = 1f;
    public float musicVolume = 1f;
    public float sfxVolume = 1f;
    public float voiceVolume = 1f;

    [Header("音频源池")]
    public int audioSourcePoolSize = 10;
    public bool enable3DAudio = true;
    public float max3DDistance = 50f;

    [Header("音频剪辑")]
    public List<AudioClip> musicClips = new List<AudioClip>();
    public List<AudioClip> sfxClips = new List<AudioClip>();
    public List<AudioClip> voiceClips = new List<AudioClip>();

    // 音频源池
    private Queue<AudioSource> audioSourcePool = new Queue<AudioSource>();
    private List<AudioSource> activeAudioSources = new List<AudioSource>();

    // 音频剪辑缓存
    private Dictionary<string, AudioClip> audioClipCache = new Dictionary<string, AudioClip>();
    private Dictionary<string, List<AudioClip>> audioCategoryCache = new Dictionary<string, List<AudioClip>>();

    // 当前播放的音频
    private Dictionary<string, AudioSource> playingAudio = new Dictionary<string, AudioSource>();
    private AudioSource musicSource;
    private AudioSource sfxSource;
    private AudioSource voiceSource;

    private static OptimizedAudioManager _instance;
    public static OptimizedAudioManager Instance
    {
        get
        {
            if (_instance == null)
            {
                _instance = FindObjectOfType<OptimizedAudioManager>();
                
                if (_instance == null)
                {
                    GameObject audioManagerObject = new GameObject("OptimizedAudioManager");
                    _instance = audioManagerObject.AddComponent<OptimizedAudioManager>();
                }
            }
            
            return _instance;
        }
    }

    void Awake()
    {
        if (_instance == null)
        {
            _instance = this;
            DontDestroyOnLoad(gameObject);
            
            InitializeAudioSystem();
        }
        else if (_instance != this)
        {
            Destroy(gameObject);
        }
    }

    private void InitializeAudioSystem()
    {
        // 初始化音频源池
        InitializeAudioSourcePool();
        
        // 构建音频剪辑缓存
        BuildAudioClipCache();
    }

    // 初始化音频源池
    private void InitializeAudioSourcePool()
    {
        for (int i = 0; i < audioSourcePoolSize; i++)
        {
            GameObject audioSourceGO = new GameObject($"AudioSource_{i}");
            audioSourceGO.transform.SetParent(transform);
            
            AudioSource audioSource = audioSourceGO.AddComponent<AudioSource>();
            audioSource.playOnAwake = false;
            audioSource.volume = 1f;
            audioSource.pitch = 1f;
            audioSource.loop = false;
            audioSource.priority = 128; // 默认优先级
            
            if (masterMixerGroup != null)
            {
                audioSource.outputAudioMixerGroup = masterMixerGroup;
            }
            
            audioSourcePool.Enqueue(audioSource);
        }
    }

    // 构建音频剪辑缓存
    private void BuildAudioClipCache()
    {
        // 缓存音乐剪辑
        foreach (AudioClip clip in musicClips)
        {
            if (clip != null)
            {
                audioClipCache[$"Music_{clip.name}"] = clip;
                
                if (!audioCategoryCache.ContainsKey("Music"))
                {
                    audioCategoryCache["Music"] = new List<AudioClip>();
                }
                audioCategoryCache["Music"].Add(clip);
            }
        }

        // 缓存音效剪辑
        foreach (AudioClip clip in sfxClips)
        {
            if (clip != null)
            {
                audioClipCache[$"SFX_{clip.name}"] = clip;
                
                if (!audioCategoryCache.ContainsKey("SFX"))
                {
                    audioCategoryCache["SFX"] = new List<AudioClip>();
                }
                audioCategoryCache["SFX"].Add(clip);
            }
        }

        // 缓存语音剪辑
        foreach (AudioClip clip in voiceClips)
        {
            if (clip != null)
            {
                audioClipCache[$"Voice_{clip.name}"] = clip;
                
                if (!audioCategoryCache.ContainsKey("Voice"))
                {
                    audioCategoryCache["Voice"] = new List<AudioClip>();
                }
                audioCategoryCache["Voice"].Add(clip);
            }
        }
    }

    // 从池中获取音频源
    private AudioSource GetAudioSourceFromPool()
    {
        AudioSource audioSource;
        
        if (audioSourcePool.Count > 0)
        {
            audioSource = audioSourcePool.Dequeue();
            audioSource.gameObject.SetActive(true);
        }
        else
        {
            // 如果池空了，创建新的音频源
            GameObject audioSourceGO = new GameObject("AudioSource_Dynamic");
            audioSourceGO.transform.SetParent(transform);
            audioSource = audioSourceGO.AddComponent<AudioSource>();
            
            if (masterMixerGroup != null)
            {
                audioSource.outputAudioMixerGroup = masterMixerGroup;
            }
            
            Debug.LogWarning("音频源池已空，创建动态音频源");
        }
        
        activeAudioSources.Add(audioSource);
        return audioSource;
    }

    // 返回音频源到池中
    private void ReturnAudioSourceToPool(AudioSource audioSource)
    {
        if (audioSource != null && activeAudioSources.Contains(audioSource))
        {
            audioSource.Stop();
            audioSource.clip = null;
            audioSource.loop = false;
            audioSource.gameObject.SetActive(false);
            audioSource.transform.SetParent(transform);
            
            activeAudioSources.Remove(audioSource);
            audioSourcePool.Enqueue(audioSource);
        }
    }

    // 播放音乐
    public void PlayMusic(string musicName, bool loop = true, float volume = -1f, float pitch = 1f)
    {
        string fullMusicName = $"Music_{musicName}";
        
        if (audioClipCache.TryGetValue(fullMusicName, out AudioClip clip))
        {
            // 如果已经有音乐在播放，停止它
            if (playingAudio.ContainsKey("CurrentMusic"))
            {
                StopAudio("CurrentMusic");
            }

            AudioSource audioSource = GetAudioSourceFromPool();
            SetupAudioSource(audioSource, clip, loop, volume == -1f ? musicVolume : volume, pitch);
            
            playingAudio["CurrentMusic"] = audioSource;
            audioSource.Play();
        }
        else
        {
            Debug.LogWarning($"音乐剪辑 '{musicName}' 未找到");
        }
    }

    // 播放音效
    public void PlaySFX(string sfxName, Vector3? position = null, float volume = -1f, float pitch = 1f, bool use3D = true)
    {
        string fullSfxName = $"SFX_{sfxName}";
        
        if (audioClipCache.TryGetValue(fullSfxName, out AudioClip clip))
        {
            AudioSource audioSource = GetAudioSourceFromPool();
            
            if (position.HasValue && enable3DAudio && use3D)
            {
                // 3D音频设置
                audioSource.spatialBlend = 1f;
                audioSource.maxDistance = max3DDistance;
                audioSource.rolloffMode = AudioRolloffMode.Logarithmic;
                audioSource.transform.position = position.Value;
            }
            else
            {
                // 2D音频设置
                audioSource.spatialBlend = 0f;
            }
            
            SetupAudioSource(audioSource, clip, false, volume == -1f ? sfxVolume : volume, pitch);
            
            string audioKey = $"SFX_{sfxName}_{System.Guid.NewGuid()}";
            playingAudio[audioKey] = audioSource;
            
            audioSource.Play();
            
            // 音效播放完成后自动返回池中
            StartCoroutine(ReturnAudioSourceAfterPlay(audioSource, audioKey, clip.length));
        }
        else
        {
            Debug.LogWarning($"音效剪辑 '{sfxName}' 未找到");
        }
    }

    // 播放语音
    public void PlayVoice(string voiceName, float volume = -1f, float pitch = 1f)
    {
        string fullVoiceName = $"Voice_{voiceName}";
        
        if (audioClipCache.TryGetValue(fullVoiceName, out AudioClip clip))
        {
            AudioSource audioSource = GetAudioSourceFromPool();
            SetupAudioSource(audioSource, clip, false, volume == -1f ? voiceVolume : volume, pitch);
            
            string audioKey = $"Voice_{voiceName}_{System.Guid.NewGuid()}";
            playingAudio[audioKey] = audioSource;
            
            audioSource.Play();
            
            StartCoroutine(ReturnAudioSourceAfterPlay(audioSource, audioKey, clip.length));
        }
        else
        {
            Debug.LogWarning($"语音剪辑 '{voiceName}' 未找到");
        }
    }

    // 设置音频源参数
    private void SetupAudioSource(AudioSource audioSource, AudioClip clip, bool loop, float volume, float pitch)
    {
        audioSource.clip = clip;
        audioSource.loop = loop;
        audioSource.volume = volume * masterVolume;
        audioSource.pitch = pitch;
        audioSource.priority = 128;
    }

    // 播放完成后返回音频源到池
    private IEnumerator ReturnAudioSourceAfterPlay(AudioSource audioSource, string audioKey, float clipLength)
    {
        yield return new WaitForSeconds(clipLength + 0.1f); // 额外等待0.1秒确保播放完成
        
        if (playingAudio.ContainsKey(audioKey))
        {
            playingAudio.Remove(audioKey);
        }
        
        ReturnAudioSourceToPool(audioSource);
    }

    // 停止音频
    public void StopAudio(string audioKey)
    {
        if (playingAudio.ContainsKey(audioKey))
        {
            AudioSource audioSource = playingAudio[audioKey];
            
            if (audioSource != null)
            {
                audioSource.Stop();
                
                // 根据音频类型决定是否返回池中
                if (audioKey.StartsWith("SFX_") || audioKey.StartsWith("Voice_"))
                {
                    ReturnAudioSourceToPool(audioSource);
                }
                else
                {
                    // 音乐等持续播放的音频只停止，不返回池中
                    audioSource.clip = null;
                }
            }
            
            playingAudio.Remove(audioKey);
        }
    }

    // 暂停音频
    public void PauseAudio(string audioKey)
    {
        if (playingAudio.ContainsKey(audioKey))
        {
            AudioSource audioSource = playingAudio[audioKey];
            if (audioSource != null && audioSource.isPlaying)
            {
                audioSource.Pause();
            }
        }
    }

    // 恢复音频
    public void ResumeAudio(string audioKey)
    {
        if (playingAudio.ContainsKey(audioKey))
        {
            AudioSource audioSource = playingAudio[audioKey];
            if (audioSource != null)
            {
                audioSource.UnPause();
            }
        }
    }

    // 停止所有音频
    public void StopAllAudio()
    {
        List<string> keysToStop = new List<string>(playingAudio.Keys);
        
        foreach (string key in keysToStop)
        {
            StopAudio(key);
        }
    }

    // 设置音量
    public void SetMasterVolume(float volume)
    {
        masterVolume = Mathf.Clamp01(volume);
        UpdateAllAudioVolumes();
    }

    public void SetMusicVolume(float volume)
    {
        musicVolume = Mathf.Clamp01(volume);
        UpdateCategoryVolumes("Music");
    }

    public void SetSFXVolume(float volume)
    {
        sfxVolume = Mathf.Clamp01(volume);
        UpdateCategoryVolumes("SFX");
    }

    public void SetVoiceVolume(float volume)
    {
        voiceVolume = Mathf.Clamp01(volume);
        UpdateCategoryVolumes("Voice");
    }

    // 更新所有音频的音量
    private void UpdateAllAudioVolumes()
    {
        foreach (var pair in playingAudio)
        {
            if (pair.Value != null)
            {
                if (pair.Key.StartsWith("CurrentMusic"))
                {
                    pair.Value.volume = musicVolume * masterVolume;
                }
                else if (pair.Key.StartsWith("SFX_"))
                {
                    pair.Value.volume = sfxVolume * masterVolume;
                }
                else if (pair.Key.StartsWith("Voice_"))
                {
                    pair.Value.volume = voiceVolume * masterVolume;
                }
            }
        }
    }

    // 更新特定类别的音量
    private void UpdateCategoryVolumes(string category)
    {
        foreach (var pair in playingAudio)
        {
            if (pair.Key.Contains(category) && pair.Value != null)
            {
                float volume = 1f;
                
                switch (category)
                {
                    case "Music":
                        volume = musicVolume;
                        break;
                    case "SFX":
                        volume = sfxVolume;
                        break;
                    case "Voice":
                        volume = voiceVolume;
                        break;
                }
                
                pair.Value.volume = volume * masterVolume;
            }
        }
    }

    // 播放随机音效
    public void PlayRandomSFX(string category, Vector3? position = null)
    {
        if (audioCategoryCache.TryGetValue(category, out List<AudioClip> clips))
        {
            if (clips.Count > 0)
            {
                AudioClip randomClip = clips[Random.Range(0, clips.Count)];
                PlaySFX(randomClip.name, position);
            }
        }
    }

    // 音频池清理
    void Update()
    {
        // 定期清理已完成的音频
        List<string> completedAudio = new List<string>();
        
        foreach (var pair in playingAudio)
        {
            if (pair.Value != null && !pair.Value.isPlaying)
            {
                completedAudio.Add(pair.Key);
            }
        }
        
        foreach (string key in completedAudio)
        {
            if (key.StartsWith("SFX_") || key.StartsWith("Voice_"))
            {
                ReturnAudioSourceToPool(playingAudio[key]);
            }
            playingAudio.Remove(key);
        }
    }

    void OnDestroy()
    {
        StopAllAudio();
    }
}
```

### 音频事件系统

```csharp
using UnityEngine;

// 音频事件处理器
public class AudioEventHandler : MonoBehaviour
{
    [Header("音频事件设置")]
    public string audioEventName;
    public AudioEventType eventType = AudioEventType.SFX;
    public bool playOnEnable = false;
    public bool playOnStart = false;
    public float delay = 0f;

    void OnEnable()
    {
        if (playOnEnable)
        {
            Invoke("PlayAudioEvent", delay);
        }
    }

    void Start()
    {
        if (playOnStart)
        {
            Invoke("PlayAudioEvent", delay);
        }
    }

    public void PlayAudioEvent()
    {
        switch (eventType)
        {
            case AudioEventType.Music:
                OptimizedAudioManager.Instance?.PlayMusic(audioEventName);
                break;
            case AudioEventType.SFX:
                OptimizedAudioManager.Instance?.PlaySFX(audioEventName, transform.position);
                break;
            case AudioEventType.Voice:
                OptimizedAudioManager.Instance?.PlayVoice(audioEventName);
                break;
        }
    }
}

public enum AudioEventType
{
    Music,
    SFX,
    Voice
}

// 音频区域触发器
public class AudioZone : MonoBehaviour
{
    [Header("音频区域设置")]
    public string musicName;
    public float fadeDuration = 2f;
    public bool loopMusic = true;

    private bool playerInZone = false;

    void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("Player"))
        {
            playerInZone = true;
            if (!string.IsNullOrEmpty(musicName))
            {
                OptimizedAudioManager.Instance?.PlayMusic(musicName, loopMusic);
            }
        }
    }

    void OnTriggerExit(Collider other)
    {
        if (other.CompareTag("Player"))
        {
            playerInZone = false;
            // 可以在这里添加音乐淡出效果
        }
    }
}

// 音频混音器设置
public class AudioMixerController : MonoBehaviour
{
    [Header("混音器设置")]
    public string masterVolumeParameter = "MasterVolume";
    public string musicVolumeParameter = "MusicVolume";
    public string sfxVolumeParameter = "SFXVolume";
    public string voiceVolumeParameter = "VoiceVolume";

    private AudioMixer audioMixer;

    void Start()
    {
        SetupAudioMixer();
    }

    private void SetupAudioMixer()
    {
        // 如果使用Unity的Audio Mixer，可以在这里设置参数
        // audioMixer = Resources.Load<AudioMixer>("AudioMixer");
    }

    public void SetVolume(string parameter, float volume)
    {
        volume = Mathf.Clamp01(volume);
        
        // 设置混音器参数
        // if (audioMixer != null)
        // {
        //     audioMixer.SetFloat(parameter, Mathf.Log10(volume) * 20);
        // }
    }
}
```

---

## 动画系统最佳实践

### 动画优化管理器

```csharp
using UnityEngine;
using System.Collections.Generic;

// 优化的动画管理器
public class OptimizedAnimationManager : MonoBehaviour
{
    [Header("动画系统设置")]
    public bool enableAnimationCulling = true;
    public bool enableAnimationOptimization = true;
    public bool enableLODForAnimations = true;
    public float animationCullDistance = 50f;

    [Header("动画状态机优化")]
    public bool enableStateCache = true;
    public bool enableTransitionOptimization = true;

    // 动画组件缓存
    private Dictionary<GameObject, Animator> animatorCache = new Dictionary<GameObject, Animator>();
    private Dictionary<Animator, AnimationStateCache> stateCache = new Dictionary<Animator, AnimationStateCache>();

    // LOD系统
    private Dictionary<Animator, AnimationLODData> lodData = new Dictionary<Animator, AnimationLODData>();

    // 动画状态缓存
    private class AnimationStateCache
    {
        public Dictionary<string, int> hashCache = new Dictionary<string, int>();
        public Dictionary<int, string> nameCache = new Dictionary<int, string>();
        public Dictionary<string, AnimatorStateInfo> stateInfoCache = new Dictionary<string, AnimatorStateInfo>();
    }

    private class AnimationLODData
    {
        public float distanceToCamera;
        public int currentLOD;
        public AnimationCullingType cullingType;
    }

    // 获取或创建动画器缓存
    public Animator GetAnimator(GameObject go)
    {
        if (animatorCache.ContainsKey(go))
        {
            return animatorCache[go];
        }

        Animator animator = go.GetComponent<Animator>();
        if (animator != null)
        {
            animatorCache[go] = animator;
            
            if (enableStateCache)
            {
                stateCache[animator] = new AnimationStateCache();
            }
            
            if (enableLODForAnimations)
            {
                lodData[animator] = new AnimationLODData();
            }
        }

        return animator;
    }

    // 优化的动画播放
    public void PlayAnimation(Animator animator, string animationName, int layer = 0, float transitionDuration = 0.25f)
    {
        if (animator == null || string.IsNullOrEmpty(animationName)) return;

        // 使用哈希值而不是字符串进行动画播放（性能更好）
        int animationHash = GetAnimationHash(animator, animationName);
        
        if (enableTransitionOptimization)
        {
            // 使用平滑过渡
            animator.CrossFade(animationHash, transitionDuration, layer);
        }
        else
        {
            // 直接播放
            animator.Play(animationHash, layer);
        }
    }

    // 获取动画哈希值（带缓存）
    private int GetAnimationHash(Animator animator, string animationName)
    {
        if (enableStateCache && stateCache.ContainsKey(animator))
        {
            AnimationStateCache cache = stateCache[animator];
            
            if (cache.hashCache.ContainsKey(animationName))
            {
                return cache.hashCache[animationName];
            }
            else
            {
                int hash = Animator.StringToHash(animationName);
                cache.hashCache[animationName] = hash;
                cache.nameCache[hash] = animationName;
                return hash;
            }
        }
        
        return Animator.StringToHash(animationName);
    }

    // 获取动画状态信息（带缓存）
    public AnimatorStateInfo GetStateInfo(Animator animator, string animationName, int layer = 0)
    {
        if (enableStateCache && stateCache.ContainsKey(animator))
        {
            AnimationStateCache cache = stateCache[animator];
            string key = $"{animationName}_{layer}";

            if (cache.stateInfoCache.ContainsKey(key))
            {
                return cache.stateInfoCache[key];
            }
            else
            {
                AnimatorStateInfo stateInfo = animator.GetCurrentAnimatorStateInfo(layer);
                cache.stateInfoCache[key] = stateInfo;
                return stateInfo;
            }
        }
        
        return animator.GetCurrentAnimatorStateInfo(layer);
    }

    // 动画剔除系统
    void Update()
    {
        if (enableAnimationCulling)
        {
            CullDistantAnimations();
        }

        if (enableLODForAnimations)
        {
            UpdateAnimationLOD();
        }

        // 清理状态缓存
        if (enableStateCache)
        {
            CleanupStateCache();
        }
    }

    // 剔除远处的动画
    private void CullDistantAnimations()
    {
        Camera mainCamera = Camera.main;
        if (mainCamera == null) return;

        foreach (var pair in animatorCache)
        {
            Animator animator = pair.Value;
            if (animator != null)
            {
                float distance = Vector3.Distance(mainCamera.transform.position, animator.transform.position);
                
                if (distance > animationCullDistance)
                {
                    // 对远处的对象使用更简单的动画更新模式
                    animator.updateMode = AnimatorUpdateMode.UnscaledTime; // 或其他优化模式
                    animator.cullingMode = AnimatorCullingMode.CullCompletely;
                }
                else
                {
                    // 近处对象使用正常模式
                    animator.cullingMode = AnimatorCullingMode.AlwaysAnimate;
                }
            }
        }
    }

    // 更新动画LOD
    private void UpdateAnimationLOD()
    {
        Camera mainCamera = Camera.main;
        if (mainCamera == null) return;

        foreach (var pair in lodData)
        {
            Animator animator = pair.Key;
            AnimationLODData lod = pair.Value;

            if (animator != null)
            {
                lod.distanceToCamera = Vector3.Distance(mainCamera.transform.position, animator.transform.position);
                
                // 根据距离设置LOD级别
                if (lod.distanceToCamera < 10f)
                {
                    lod.currentLOD = 2; // 高质量
                    lod.cullingType = AnimationCullingType.AlwaysAnimate;
                }
                else if (lod.distanceToCamera < 30f)
                {
                    lod.currentLOD = 1; // 中等质量
                    lod.cullingType = AnimationCullingType.BasedOnRenderers;
                }
                else
                {
                    lod.currentLOD = 0; // 低质量
                    lod.cullingType = AnimationCullingType.CullCompletely;
                }

                animator.cullingMode = (AnimatorCullingMode)lod.cullingType;
            }
        }
    }

    // 清理状态缓存
    private void CleanupStateCache()
    {
        // 定期清理状态缓存以避免内存泄漏
        // 这里可以实现缓存过期机制
    }

    // 优化的动画参数设置
    public void SetAnimationParameter(Animator animator, string paramName, object value)
    {
        if (animator == null) return;

        int paramHash = Animator.StringToHash(paramName);

        if (value is bool boolValue)
        {
            animator.SetBool(paramHash, boolValue);
        }
        else if (value is int intValue)
        {
            animator.SetInteger(paramHash, intValue);
        }
        else if (value is float floatValue)
        {
            animator.SetFloat(paramHash, floatValue);
        }
        else if (value is string stringValue)
        {
            // 触发器参数
            animator.SetTrigger(Animator.StringToHash(stringValue));
        }
    }

    // 批量动画更新
    public void BatchUpdateAnimations(List<Animator> animators, System.Action<Animator> updateAction)
    {
        foreach (Animator animator in animators)
        {
            if (animator != null && animator.isActiveAndEnabled)
            {
                updateAction?.Invoke(animator);
            }
        }
    }
}

// 动画事件优化
public class OptimizedAnimationEvents : MonoBehaviour
{
    [Header("事件优化设置")]
    public bool enableEventPooling = true;
    public bool enableEventThrottling = true;
    public float eventThrottleInterval = 0.1f;

    private Dictionary<string, float> lastEventTime = new Dictionary<string, float>();
    private Queue<string> eventPool = new Queue<string>();

    // 优化的动画事件处理器
    public void OnAnimationEvent(string eventName)
    {
        if (enableEventThrottling)
        {
            if (!CanProcessEvent(eventName))
            {
                return; // 事件被节流
            }
        }

        // 处理动画事件
        ProcessAnimationEvent(eventName);
    }

    // 检查是否可以处理事件
    private bool CanProcessEvent(string eventName)
    {
        float currentTime = Time.unscaledTime;
        
        if (lastEventTime.ContainsKey(eventName))
        {
            if (currentTime - lastEventTime[eventName] >= eventThrottleInterval)
            {
                lastEventTime[eventName] = currentTime;
                return true;
            }
            return false;
        }
        else
        {
            lastEventTime[eventName] = currentTime;
            return true;
        }
    }

    // 处理动画事件
    private void ProcessAnimationEvent(string eventName)
    {
        switch (eventName)
        {
            case "Footstep":
                PlayFootstepSound();
                break;
            case "Attack":
                PerformAttack();
                break;
            case "Land":
                HandleLanding();
                break;
            case "Jump":
                HandleJump();
                break;
            default:
                Debug.Log($"处理动画事件: {eventName}");
                break;
        }
    }

    private void PlayFootstepSound()
    {
        // 播放脚步声
        OptimizedAudioManager.Instance?.PlaySFX("Footstep", transform.position);
    }

    private void PerformAttack()
    {
        // 执行攻击逻辑
        Collider[] hitColliders = Physics.OverlapSphere(
            transform.position + transform.forward * 1f, 
            1f
        );

        foreach (Collider collider in hitColliders)
        {
            if (collider.CompareTag("Enemy"))
            {
                // 对敌人造成伤害
            }
        }
    }

    private void HandleLanding()
    {
        // 处理着陆
        OptimizedAudioManager.Instance?.PlaySFX("Land", transform.position);
    }

    private void HandleJump()
    {
        // 处理跳跃
        OptimizedAudioManager.Instance?.PlaySFX("Jump", transform.position);
    }
}
```

### 高级动画控制

```csharp
using UnityEngine;

// 高级动画控制器
[RequireComponent(typeof(Animator))]
public class AdvancedAnimationController : MonoBehaviour
{
    [Header("根运动设置")]
    public bool useRootMotion = false;
    public bool enableRootMotionOptimization = true;

    [Header("动画层设置")]
    public AnimationLayer[] animationLayers = new AnimationLayer[0];

    [Header("混合树设置")]
    public bool enableBlendTrees = true;
    public AnimationBlendTree[] blendTrees = new AnimationBlendTree[0];

    [Header("动画压缩")]
    public bool enableAnimationCompression = true;
    public AnimationCompressionType compressionType = AnimationCompressionType.Optimal;

    private Animator animator;
    private AnimationCurve speedCurve = AnimationCurve.Linear(0, 0, 1, 1);
    private float currentSpeed = 0f;
    private float targetSpeed = 0f;
    private float speedSmoothTime = 0.1f;
    private float currentDirection = 0f;

    [System.Serializable]
    public class AnimationLayer
    {
        public string layerName;
        public int layerIndex;
        public float weight = 1f;
        public bool enableIK = false;
        public float ikWeight = 1f;
    }

    [System.Serializable]
    public class AnimationBlendTree
    {
        public string treeName;
        public BlendTreeType treeType;
        public string parameterName;
        public AnimationClip[] childAnimations;
        public float[] childThresholds;
    }

    void Start()
    {
        animator = GetComponent<Animator>();
        if (animator != null)
        {
            animator.applyRootMotion = useRootMotion;
            
            // 设置动画压缩
            if (enableAnimationCompression)
            {
                animator.runtimeAnimatorController.animationClips[0].compression = compressionType;
            }
        }
    }

    void Update()
    {
        UpdateAnimationLayers();
        UpdateBlendTrees();
        UpdateRootMotion();
    }

    // 更新动画层
    private void UpdateAnimationLayers()
    {
        if (animator == null) return;

        foreach (AnimationLayer layer in animationLayers)
        {
            if (layer.layerIndex < animator.layerCount)
            {
                animator.SetLayerWeight(layer.layerIndex, layer.weight);
                
                if (layer.enableIK)
                {
                    animator.SetIKPositionWeight(AvatarIKGoal.LeftFoot, layer.ikWeight);
                    animator.SetIKPositionWeight(AvatarIKGoal.RightFoot, layer.ikWeight);
                }
            }
        }
    }

    // 更新混合树
    private void UpdateBlendTrees()
    {
        if (!enableBlendTrees || animator == null) return;

        foreach (AnimationBlendTree tree in blendTrees)
        {
            switch (tree.treeType)
            {
                case BlendTreeType.Simple1D:
                    // 1D混合树
                    if (tree.childThresholds.Length > 0)
                    {
                        float normalizedSpeed = Mathf.Clamp01(currentSpeed / tree.childThresholds[tree.childThresholds.Length - 1]);
                        animator.SetFloat(tree.parameterName, normalizedSpeed);
                    }
                    break;
                case BlendTreeType.SimpleDirectional2D:
                    // 2D方向混合树
                    animator.SetFloat("BlendX", currentDirection);
                    animator.SetFloat("BlendY", currentSpeed);
                    break;
            }
        }
    }

    // 更新根运动
    private void UpdateRootMotion()
    {
        if (!enableRootMotionOptimization || animator == null) return;

        // 优化根运动性能
        if (useRootMotion)
        {
            // 可以在这里添加根运动的优化逻辑
            // 例如：限制根运动对物理的影响
        }
    }

    // 设置动画速度
    public void SetAnimationSpeed(float speed, int layer = 0)
    {
        targetSpeed = speed;
        currentSpeed = Mathf.SmoothDamp(currentSpeed, targetSpeed, ref speedSmoothTime, 0.1f);
        
        if (animator != null)
        {
            animator.SetFloat("Speed", currentSpeed);
        }
    }

    // 设置动画方向
    public void SetAnimationDirection(float direction)
    {
        currentDirection = direction;
        
        if (animator != null)
        {
            animator.SetFloat("Direction", currentDirection);
        }
    }

    // 触发动画事件
    public void TriggerAnimationEvent(string eventName, int layer = 0)
    {
        if (animator != null)
        {
            animator.SetTrigger(eventName);
        }
    }

    // 设置动画参数
    public void SetAnimationParameter(string paramName, float value)
    {
        if (animator != null)
        {
            animator.SetFloat(Animator.StringToHash(paramName), value);
        }
    }

    public void SetAnimationParameter(string paramName, bool value)
    {
        if (animator != null)
        {
            animator.SetBool(Animator.StringToHash(paramName), value);
        }
    }

    public void SetAnimationParameter(string paramName, int value)
    {
        if (animator != null)
        {
            animator.SetInteger(Animator.StringToHash(paramName), value);
        }
    }

    // 检查动画状态
    public bool IsInAnimationState(string stateName, int layer = 0)
    {
        if (animator == null) return false;

        AnimatorStateInfo stateInfo = animator.GetCurrentAnimatorStateInfo(layer);
        return stateInfo.IsName(stateName);
    }

    // 等待动画状态完成
    public System.Collections.IEnumerator WaitForAnimationState(string stateName, int layer = 0)
    {
        while (!IsInAnimationState(stateName, layer))
        {
            yield return null;
        }

        AnimatorStateInfo stateInfo = animator.GetCurrentAnimatorStateInfo(layer);
        while (stateInfo.normalizedTime < 1.0f)
        {
            yield return null;
            stateInfo = animator.GetCurrentAnimatorStateInfo(layer);
        }
    }

    // 动画中断系统
    public void InterruptAnimation(string currentAnimation, string newAnimation)
    {
        if (animator != null)
        {
            // 检查当前动画是否可以被中断
            AnimatorStateInfo stateInfo = animator.GetCurrentAnimatorStateInfo(0);
            
            // 某些动画状态可能不允许中断（如攻击动画的特定阶段）
            if (CanInterruptAnimation(stateInfo))
            {
                PlayAnimation(newAnimation);
            }
        }
    }

    private bool CanInterruptAnimation(AnimatorStateInfo stateInfo)
    {
        // 根据动画状态决定是否可以中断
        // 例如：攻击动画的前20%可能不允许中断
        return stateInfo.normalizedTime > 0.2f || stateInfo.IsTag("Interruptible");
    }

    private void PlayAnimation(string animationName)
    {
        if (animator != null)
        {
            animator.CrossFade(Animator.StringToHash(animationName), 0.2f);
        }
    }

    // 动画同步
    public void SyncAnimationWith(AdvancedAnimationController otherController, string parameterName)
    {
        if (otherController != null && animator != null)
        {
            float otherValue = otherController.GetAnimationParameter<float>(parameterName);
            SetAnimationParameter(parameterName, otherValue);
        }
    }

    public T GetAnimationParameter<T>(string parameterName)
    {
        if (animator == null) return default(T);

        int paramHash = Animator.StringToHash(parameterName);
        
        if (typeof(T) == typeof(float))
        {
            return (T)(object)animator.GetFloat(paramHash);
        }
        else if (typeof(T) == typeof(int))
        {
            return (T)(object)animator.GetInteger(paramHash);
        }
        else if (typeof(T) == typeof(bool))
        {
            return (T)(object)animator.GetBool(paramHash);
        }
        
        return default(T);
    }

    // 动画性能监控
    public AnimationPerformanceData GetAnimationPerformanceData()
    {
        return new AnimationPerformanceData
        {
            isOptimized = true,
            layerCount = animator != null ? animator.layerCount : 0,
            currentAnimation = animator != null ? 
                animator.GetCurrentAnimatorStateInfo(0).IsName("Unknown") ? "Unknown" : 
                GetAnimationName(animator.GetCurrentAnimatorStateInfo(0).fullPathHash) : "No Animator",
            updateMode = animator != null ? animator.updateMode : AnimatorUpdateMode.Normal
        };
    }

    private string GetAnimationName(int hash)
    {
        // 这里需要实现哈希到动画名称的映射
        // Unity不直接提供这个功能，需要自己维护映射表
        return "Animation_" + hash;
    }
}

[System.Serializable]
public class AnimationPerformanceData
{
    public bool isOptimized;
    public int layerCount;
    public string currentAnimation;
    public AnimatorUpdateMode updateMode;
}

public enum BlendTreeType
{
    Simple1D,
    SimpleDirectional2D,
    FreeformDirectional2D,
    FreeformCartesian2D,
    Direct
}
```

---

## 测试和调试最佳实践

### 单元测试框架

```csharp
using UnityEngine;
using System.Collections;
using System.Collections.Generic;

// Unity单元测试框架
public class UnityUnitTestFramework : MonoBehaviour
{
    [Header("测试设置")]
    public bool runTestsOnStart = true;
    public bool logTestResults = true;
    public bool stopOnFirstFailure = false;

    private List<TestCase> testCases = new List<TestCase>();
    private int totalTests = 0;
    private int passedTests = 0;
    private int failedTests = 0;
    private List<string> testFailures = new List<string>();

    void Start()
    {
        if (runTestsOnStart)
        {
            RunAllTests();
        }
    }

    // 定义测试用例
    [System.Serializable]
    public class TestCase
    {
        public string testName;
        public System.Func<bool> testFunction;
        public string expectedBehavior;
        public string category = "General";
        public bool enabled = true;
    }

    // 添加测试用例
    public void AddTest(string name, System.Func<bool> testFunc, string expected = "", string category = "General")
    {
        TestCase testCase = new TestCase
        {
            testName = name,
            testFunction = testFunc,
            expectedBehavior = expected,
            category = category,
            enabled = true
        };

        testCases.Add(testCase);
        totalTests++;
    }

    // 运行所有测试
    public void RunAllTests()
    {
        Debug.Log($"开始运行 {testCases.Count} 个测试...");

        foreach (TestCase testCase in testCases)
        {
            if (!testCase.enabled) continue;

            RunSingleTest(testCase);
            
            if (stopOnFirstFailure && failedTests > 0)
            {
                break;
            }
        }

        LogTestSummary();
    }

    // 运行单个测试
    private void RunSingleTest(TestCase testCase)
    {
        try
        {
            bool result = testCase.testFunction();
            
            if (result)
            {
                passedTests++;
                if (logTestResults)
                {
                    Debug.Log($"✅ 测试通过: {testCase.testName}");
                }
            }
            else
            {
                failedTests++;
                string failureMessage = $"❌ 测试失败: {testCase.testName} - 期望: {testCase.expectedBehavior}";
                testFailures.Add(failureMessage);
                
                if (logTestResults)
                {
                    Debug.LogError(failureMessage);
                }
            }
        }
        catch (System.Exception e)
        {
            failedTests++;
            string failureMessage = $"❌ 测试异常: {testCase.testName} - 错误: {e.Message}";
            testFailures.Add(failureMessage);
            
            if (logTestResults)
            {
                Debug.LogError(failureMessage);
            }
        }
    }

    // 断言方法
    public static bool AssertTrue(bool condition, string message = "条件应为真")
    {
        if (!condition)
        {
            Debug.LogError($"断言失败: {message}");
            return false;
        }
        return true;
    }

    public static bool AssertFalse(bool condition, string message = "条件应为假")
    {
        if (condition)
        {
            Debug.LogError($"断言失败: {message}");
            return false;
        }
        return true;
    }

    public static bool AssertEqual<T>(T actual, T expected, string message = "")
    {
        bool isEqual = EqualityComparer<T>.Default.Equals(actual, expected);
        if (!isEqual)
        {
            Debug.LogError($"断言失败: {message} - 实际: {actual}, 期望: {expected}");
            return false;
        }
        return true;
    }

    public static bool AssertNotEqual<T>(T actual, T expected, string message = "")
    {
        bool isNotEqual = !EqualityComparer<T>.Default.Equals(actual, expected);
        if (!isNotEqual)
        {
            Debug.LogError($"断言失败: {message} - 实际和期望相等: {actual}");
            return false;
        }
        return true;
    }

    public static bool AssertNull(object obj, string message = "对象应为null")
    {
        if (obj != null)
        {
            Debug.LogError($"断言失败: {message} - 对象不为null: {obj}");
            return false;
        }
        return true;
    }

    public static bool AssertNotNull(object obj, string message = "对象不应为null")
    {
        if (obj == null)
        {
            Debug.LogError($"断言失败: {message}");
            return false;
        }
        return true;
    }

    // 浮点数断言（考虑误差）
    public static bool AssertFloatEqual(float actual, float expected, float tolerance = 0.001f, string message = "")
    {
        bool isEqual = Mathf.Abs(actual - expected) <= tolerance;
        if (!isEqual)
        {
            Debug.LogError($"断言失败: {message} - 实际: {actual}, 期望: {expected}, 容差: {tolerance}");
            return false;
        }
        return true;
    }

    // 向量断言
    public static bool AssertVector3Equal(Vector3 actual, Vector3 expected, float tolerance = 0.001f, string message = "")
    {
        bool isEqual = Vector3.Distance(actual, expected) <= tolerance;
        if (!isEqual)
        {
            Debug.LogError($"断言失败: {message} - 实际: {actual}, 期望: {expected}, 距离: {Vector3.Distance(actual, expected)}");
            return false;
        }
        return true;
    }

    // 记录测试摘要
    private void LogTestSummary()
    {
        string summary = $@"
=== 测试摘要 ===
总测试数: {totalTests}
通过: {passedTests}
失败: {failedTests}
成功率: {(totalTests > 0 ? (float)passedTests / totalTests * 100 : 0):F2}%
";

        if (failedTests > 0)
        {
            summary += "\n失败详情:\n";
            foreach (string failure in testFailures)
            {
                summary += $"  {failure}\n";
            }
        }

        Debug.Log(summary);
    }

    // 清理测试结果
    public void ClearTestResults()
    {
        totalTests = 0;
        passedTests = 0;
        failedTests = 0;
        testFailures.Clear();
        testCases.Clear();
    }

    // 按类别运行测试
    public void RunTestsByCategory(string category)
    {
        List<TestCase> categoryTests = testCases.FindAll(tc => tc.category == category);
        
        Debug.Log($"运行 {category} 类别的 {categoryTests.Count} 个测试...");
        
        foreach (TestCase testCase in categoryTests)
        {
            RunSingleTest(testCase);
            
            if (stopOnFirstFailure && failedTests > 0)
            {
                break;
            }
        }
        
        LogTestSummary();
    }

    // 异步测试支持
    public IEnumerator RunAsyncTest(System.Func<IEnumerator> asyncTest, string testName)
    {
        yield return StartCoroutine(asyncTest());
        
        // 测试完成后验证结果
        // 这里可以根据需要添加验证逻辑
        Debug.Log($"异步测试完成: {testName}");
    }
}

// 测试示例
public class TestExample : MonoBehaviour
{
    private UnityUnitTestFramework testFramework;

    void Start()
    {
        testFramework = gameObject.AddComponent<UnityUnitTestFramework>();
        
        // 添加测试用例
        testFramework.AddTest("测试加法运算", TestAddition, "2 + 2 应该等于 4");
        testFramework.AddTest("测试字符串比较", TestStringComparison, "字符串比较应该区分大小写");
        testFramework.AddTest("测试向量运算", TestVectorOperations, "向量长度应该正确计算");
        
        // 运行测试
        testFramework.RunAllTests();
    }

    bool TestAddition()
    {
        int result = 2 + 2;
        return UnityUnitTestFramework.AssertEqual(result, 4, "加法运算结果不正确");
    }

    bool TestStringComparison()
    {
        string str1 = "Hello";
        string str2 = "hello";
        return UnityUnitTestFramework.AssertNotEqual(str1, str2, "字符串比较应该区分大小写");
    }

    bool TestVectorOperations()
    {
        Vector3 v1 = new Vector3(3, 4, 0);
        float magnitude = v1.magnitude;
        return UnityUnitTestFramework.AssertFloatEqual(magnitude, 5f, 0.001f, "向量长度计算错误");
    }
}
```

### 调试工具集

```csharp
using UnityEngine;
using System.Collections.Generic;
using System.Text;

// 高级调试工具集
public class AdvancedDebugTools : MonoBehaviour
{
    [Header("调试设置")]
    public bool enableDebugGUI = true;
    public bool enablePerformanceMonitor = true;
    public bool enableSceneDebugger = true;
    public bool enableMemoryProfiler = true;

    [Header("调试选项")]
    public KeyCode debugToggleKey = KeyCode.F1;
    public KeyCode performanceToggleKey = KeyCode.F2;
    public KeyCode sceneDebuggerKey = KeyCode.F3;

    [Header("性能监控")]
    public float monitorInterval = 1f;
    public int frameSampleCount = 60;

    private bool isDebugActive = false;
    private bool isPerformanceMonitorActive = false;
    private bool isSceneDebuggerActive = false;
    private float lastMonitorTime = 0f;
    private List<float> frameTimes = new List<float>();
    private int frameCounter = 0;
    private float totalTime = 0f;

    void Update()
    {
        HandleDebugInput();
        UpdatePerformanceMonitor();
    }

    // 处理调试输入
    private void HandleDebugInput()
    {
        if (Input.GetKeyDown(debugToggleKey))
        {
            isDebugActive = !isDebugActive;
        }

        if (Input.GetKeyDown(performanceToggleKey))
        {
            isPerformanceMonitorActive = !isPerformanceMonitorActive;
        }

        if (Input.GetKeyDown(sceneDebuggerKey))
        {
            isSceneDebuggerActive = !isSceneDebuggerActive;
        }
    }

    // 更新性能监控
    private void UpdatePerformanceMonitor()
    {
        if (enablePerformanceMonitor && isPerformanceMonitorActive)
        {
            float frameTime = Time.unscaledDeltaTime;
            frameTimes.Add(frameTime);
            
            if (frameTimes.Count > frameSampleCount)
            {
                frameTimes.RemoveAt(0);
            }

            frameCounter++;
            totalTime += frameTime;

            if (Time.time - lastMonitorTime >= monitorInterval)
            {
                LogPerformanceData();
                lastMonitorTime = Time.time;
            }
        }
    }

    // 记录性能数据
    private void LogPerformanceData()
    {
        if (frameTimes.Count == 0) return;

        float avgFrameTime = totalTime / frameCounter;
        float avgFPS = 1.0f / avgFrameTime;
        
        float minFrameTime = float.MaxValue;
        float maxFrameTime = float.MinValue;
        
        foreach (float frameTime in frameTimes)
        {
            if (frameTime < minFrameTime) minFrameTime = frameTime;
            if (frameTime > maxFrameTime) maxFrameTime = frameTime;
        }

        float minFPS = 1.0f / maxFrameTime;
        float maxFPS = 1.0f / minFrameTime;

        string performanceData = $@"
性能数据 ({monitorInterval}秒间隔):
平均FPS: {avgFPS:F1}
最低FPS: {minFPS:F1}
最高FPS: {maxFPS:F1}
平均帧时间: {avgFrameTime * 1000:F1}ms
帧时间范围: {minFrameTime * 1000:F1}ms - {maxFrameTime * 1000:F1}ms
总帧数: {frameCounter}
";
        
        Debug.Log(performanceData);
        
        // 重置计数器
        frameCounter = 0;
        totalTime = 0f;
    }

    // 场景调试器
    public void SceneDebug()
    {
        if (!enableSceneDebugger) return;

        StringBuilder sceneInfo = new StringBuilder();
        sceneInfo.AppendLine("=== 场景信息 ===");
        
        // 游戏对象统计
        GameObject[] allObjects = FindObjectsOfType<GameObject>();
        int activeObjects = 0;
        int inactiveObjects = 0;
        
        foreach (GameObject go in allObjects)
        {
            if (go.activeSelf) activeObjects++;
            else inactiveObjects++;
        }
        
        sceneInfo.AppendLine($"总游戏对象: {allObjects.Length}");
        sceneInfo.AppendLine($"活跃对象: {activeObjects}");
        sceneInfo.AppendLine($"非活跃对象: {inactiveObjects}");
        
        // 组件统计
        int totalComponents = 0;
        Dictionary<string, int> componentCounts = new Dictionary<string, int>();
        
        foreach (GameObject go in allObjects)
        {
            Component[] components = go.GetComponents<Component>();
            totalComponents += components.Length;
            
            foreach (Component comp in components)
            {
                if (comp != null)
                {
                    string compType = comp.GetType().Name;
                    if (componentCounts.ContainsKey(compType))
                    {
                        componentCounts[compType]++;
                    }
                    else
                    {
                        componentCounts[compType] = 1;
                    }
                }
            }
        }
        
        sceneInfo.AppendLine($"总组件数: {totalComponents}");
        sceneInfo.AppendLine("组件分布:");
        
        foreach (var kvp in componentCounts)
        {
            sceneInfo.AppendLine($"  {kvp.Key}: {kvp.Value}");
        }
        
        // 物理统计
        int rigidbodyCount = FindObjectsOfType<Rigidbody>().Length;
        int colliderCount = FindObjectsOfType<Collider>().Length;
        int triggerCount = 0;
        
        Collider[] allColliders = FindObjectsOfType<Collider>();
        foreach (Collider col in allColliders)
        {
            if (col.isTrigger) triggerCount++;
        }
        
        sceneInfo.AppendLine($"刚体数量: {rigidbodyCount}");
        sceneInfo.AppendLine($"碰撞体数量: {colliderCount}");
        sceneInfo.AppendLine($"触发器数量: {triggerCount}");

        Debug.Log(sceneInfo.ToString());
    }

    // 内存分析器
    public void MemoryAnalysis()
    {
        if (!enableMemoryProfiler) return;

        StringBuilder memoryInfo = new StringBuilder();
        memoryInfo.AppendLine("=== 内存分析 ===");
        
        // GC内存
        long gcMemory = System.GC.GetTotalMemory(false);
        memoryInfo.AppendLine($"GC内存使用: {FormatBytes(gcMemory)}");
        
        // Unity内存
        long unityAllocated = UnityEngine.Profiling.Profiler.GetTotalAllocatedMemoryLong();
        long unityReserved = UnityEngine.Profiling.Profiler.GetTotalReservedMemoryLong();
        long unityPeak = UnityEngine.Profiling.Profiler.GetPeakAllocatedMemoryLong();
        
        memoryInfo.AppendLine($"Unity分配内存: {FormatBytes(unityAllocated)}");
        memoryInfo.AppendLine($"Unity保留内存: {FormatBytes(unityReserved)}");
        memoryInfo.AppendLine($"Unity峰值内存: {FormatBytes(unityPeak)}");
        
        // GC统计
        memoryInfo.AppendLine($"GC次数 (0/1/2): {System.GC.CollectionCount(0)}/{System.GC.CollectionCount(1)}/{System.GC.CollectionCount(2)}");
        
        // 资源统计
        Object[] allObjects = Resources.FindObjectsOfTypeAll<Object>();
        int assetObjects = 0;
        int sceneObjects = 0;
        
        foreach (Object obj in allObjects)
        {
            string resourcePath = UnityEditor.AssetDatabase.GetAssetPath(obj);
            if (string.IsNullOrEmpty(resourcePath))
            {
                sceneObjects++;
            }
            else
            {
                assetObjects++;
            }
        }
        
        memoryInfo.AppendLine($"资源对象: {assetObjects}");
        memoryInfo.AppendLine($"场景对象: {sceneObjects}");
        memoryInfo.AppendLine($"总对象数: {allObjects.Length}");

        Debug.Log(memoryInfo.ToString());
    }

    // 格式化字节数
    private string FormatBytes(long bytes)
    {
        string[] suffixes = { "B", "KB", "MB", "GB", "TB" };
        int counter = 0;
        decimal number = (decimal)bytes;
        
        while (Math.Abs(number) >= 1024m && counter < suffixes.Length - 1)
        {
            counter++;
            number /= 1024m;
        }
        
        return string.Format("{0:n1} {1}", number, suffixes[counter]);
    }

    // 性能分析器
    public class PerformanceAnalyzer
    {
        private Dictionary<string, List<float>> methodTimings = new Dictionary<string, List<float>>();
        private Dictionary<string, float> methodTotalTime = new Dictionary<string, float>();
        private Dictionary<string, int> methodCallCount = new Dictionary<string, int>();

        public void StartMethodTiming(string methodName)
        {
            if (!methodTotalTime.ContainsKey(methodName))
            {
                methodTotalTime[methodName] = 0f;
                methodCallCount[methodName] = 0;
            }
        }

        public void EndMethodTiming(string methodName, float duration)
        {
            if (methodTimings.ContainsKey(methodName))
            {
                methodTimings[methodName].Add(duration);
            }
            else
            {
                methodTimings[methodName] = new List<float> { duration };
            }

            methodTotalTime[methodName] += duration;
            methodCallCount[methodName]++;
        }

        public PerformanceReport GenerateReport()
        {
            PerformanceReport report = new PerformanceReport();
            
            foreach (var kvp in methodTotalTime)
            {
                string methodName = kvp.Key;
                float totalTime = kvp.Value;
                int callCount = methodCallCount[methodName];
                
                if (callCount > 0)
                {
                    float avgTime = totalTime / callCount;
                    float minTime = float.MaxValue;
                    float maxTime = float.MinValue;
                    
                    if (methodTimings.ContainsKey(methodName))
                    {
                        foreach (float time in methodTimings[methodName])
                        {
                            if (time < minTime) minTime = time;
                            if (time > maxTime) maxTime = time;
                        }
                    }
                    
                    report.AddMethodReport(methodName, totalTime, callCount, avgTime, minTime, maxTime);
                }
            }
            
            return report;
        }
    }

    [System.Serializable]
    public class PerformanceReport
    {
        public List<MethodPerformanceData> methodReports = new List<MethodPerformanceData>();

        public void AddMethodReport(string methodName, float totalTime, int callCount, float avgTime, float minTime, float maxTime)
        {
            methodReports.Add(new MethodPerformanceData
            {
                methodName = methodName,
                totalTime = totalTime,
                callCount = callCount,
                averageTime = avgTime,
                minTime = minTime,
                maxTime = maxTime
            });
        }

        public void LogReport()
        {
            StringBuilder report = new StringBuilder();
            report.AppendLine("=== 性能分析报告 ===");
            
            // 按总时间排序
            methodReports.Sort((a, b) => b.totalTime.CompareTo(a.totalTime));
            
            foreach (MethodPerformanceData data in methodReports)
            {
                report.AppendLine($"{data.methodName}:");
                report.AppendLine($"  总时间: {data.totalTime * 1000:F2}ms");
                report.AppendLine($"  调用次数: {data.callCount}");
                report.AppendLine($"  平均时间: {data.averageTime * 1000:F3}ms");
                report.AppendLine($"  最小时间: {data.minTime * 1000:F3}ms");
                report.AppendLine($"  最大时间: {data.maxTime * 1000:F3}ms");
                report.AppendLine($"  每次调用平均: {(data.totalTime / data.callCount) * 1000:F3}ms");
                report.AppendLine();
            }
            
            Debug.Log(report.ToString());
        }
    }

    [System.Serializable]
    public class MethodPerformanceData
    {
        public string methodName;
        public float totalTime;
        public int callCount;
        public float averageTime;
        public float minTime;
        public float maxTime;
    }

    // 调试GUI
    void OnGUI()
    {
        if (!enableDebugGUI || !isDebugActive) return;

        // 创建调试窗口
        GUILayout.BeginArea(new Rect(10, 10, 300, 400));
        GUILayout.Box("调试工具");
        
        if (GUILayout.Button("场景调试"))
        {
            SceneDebug();
        }
        
        if (GUILayout.Button("内存分析"))
        {
            MemoryAnalysis();
        }
        
        if (GUILayout.Button($"性能监控: {(isPerformanceMonitorActive ? "开启" : "关闭")}"))
        {
            isPerformanceMonitorActive = !isPerformanceMonitorActive;
        }
        
        if (GUILayout.Button($"场景调试器: {(isSceneDebuggerActive ? "开启" : "关闭")}"))
        {
            isSceneDebuggerActive = !isSceneDebuggerActive;
        }

        // 显示当前性能数据
        if (frameTimes.Count > 0)
        {
            float currentFPS = 1.0f / Time.unscaledDeltaTime;
            GUILayout.Label($"当前FPS: {currentFPS:F1}");
            GUILayout.Label($"平均FPS: {(frameTimes.Count > 0 ? 1.0f / (totalTime / frameCounter) : 0):F1}");
        }

        GUILayout.EndArea();
    }

    // 对象引用分析器
    public void AnalyzeObjectReferences()
    {
        StringBuilder analysis = new StringBuilder();
        analysis.AppendLine("=== 对象引用分析 ===");

        // 分析特定类型的对象
        GameObject[] gameObjects = FindObjectsOfType<GameObject>();
        
        Dictionary<string, int> tagCounts = new Dictionary<string, int>();
        Dictionary<string, int> componentCounts = new Dictionary<string, int>();
        
        foreach (GameObject go in gameObjects)
        {
            // 统计标签
            if (tagCounts.ContainsKey(go.tag))
            {
                tagCounts[go.tag]++;
            }
            else
            {
                tagCounts[go.tag] = 1;
            }
            
            // 统计组件
            Component[] components = go.GetComponents<Component>();
            foreach (Component comp in components)
            {
                if (comp != null)
                {
                    string compType = comp.GetType().Name;
                    if (componentCounts.ContainsKey(compType))
                    {
                        componentCounts[compType]++;
                    }
                    else
                    {
                        componentCounts[compType] = 1;
                    }
                }
            }
        }
        
        analysis.AppendLine("标签统计:");
        foreach (var kvp in tagCounts)
        {
            analysis.AppendLine($"  {kvp.Key}: {kvp.Value}");
        }
        
        analysis.AppendLine("\n组件统计 (前10):");
        var sortedComponents = new List<KeyValuePair<string, int>>(componentCounts);
        sortedComponents.Sort((pair1, pair2) => pair2.Value.CompareTo(pair1.Value));
        
        int count = 0;
        foreach (var kvp in sortedComponents)
        {
            if (count++ >= 10) break;
            analysis.AppendLine($"  {kvp.Key}: {kvp.Value}");
        }

        Debug.Log(analysis.ToString());
    }
}
```

---

## 发布和部署最佳实践

### 构建优化

```csharp
using UnityEngine;
using UnityEditor;
using System.Collections;
using System.Collections.Generic;

// 构建优化管理器
public class BuildOptimizationManager : MonoBehaviour
{
    [Header("构建优化设置")]
    public BuildTarget targetPlatform = BuildTarget.StandaloneWindows64;
    public bool enableStripping = true;
    public bool enableCompression = true;
    public bool enableAssetBundles = true;
    public bool enableAddressables = false;

    [Header("代码优化")]
    public bool enableScriptStripping = true;
    public bool enableManagedStripping = true;
    public ManagedStrippingLevel managedStrippingLevel = ManagedStrippingLevel.Medium;

    [Header("图形优化")]
    public bool enableStaticBatching = true;
    public bool enableDynamicBatching = true;
    public bool enableOcclusionCulling = true;
    public bool enableLODs = true;

    [Header("音频优化")]
    public bool enableAudioCompression = true;
    public AudioCompressionFormat audioCompressionFormat = AudioCompressionFormat.Vorbis;
    public int audioSampleRateSetting = 0; // 0 = Preserve Sample Rate

    [Header("纹理优化")]
    public bool enableTextureCompression = true;
    public TextureFormat textureFormat = TextureFormat.RGBA32;
    public int maxTextureSize = 2048;

    // 应用构建优化设置
    [ContextMenu("应用构建优化设置")]
    public void ApplyBuildOptimizations()
    {
        #if UNITY_EDITOR
        // 应用图形设置优化
        ApplyGraphicsOptimizations();
        
        // 应用音频设置优化
        ApplyAudioOptimizations();
        
        // 应用纹理设置优化
        ApplyTextureOptimizations();
        
        // 应用Player设置优化
        ApplyPlayerOptimizations();
        
        Debug.Log("构建优化设置已应用");
        #endif
    }

    // 应用图形优化
    private void ApplyGraphicsOptimizations()
    {
        #if UNITY_EDITOR
        PlayerSettings.batching = enableStaticBatching ? 
            PlayerSettings.batching | BatchMode.CombineMeshesStatic : 
            PlayerSettings.batching & ~BatchMode.CombineMeshesStatic;
            
        PlayerSettings.batching = enableDynamicBatching ? 
            PlayerSettings.batching | BatchMode.CombineMeshesDynamic : 
            PlayerSettings.batching & ~BatchMode.CombineMeshesDynamic;

        PlayerSettings.usePlayerLog = false; // 减少日志开销
        PlayerSettings.stripUnusedMeshComponents = true; // 移除未使用的网格组件
        #endif
    }

    // 应用音频优化
    private void ApplyAudioOptimizations()
    {
        #if UNITY_EDITOR
        PlayerSettings.audioCompressionFormat = audioCompressionFormat;
        PlayerSettings.audioSampleRate = audioSampleRateSetting;
        PlayerSettings.enableAudio = true;
        #endif
    }

    // 应用纹理优化
    private void ApplyTextureOptimizations()
    {
        #if UNITY_EDITOR
        // 这些设置需要在纹理导入器中应用
        string[] textureGUIDs = UnityEditor.AssetDatabase.FindAssets("t:Texture2D");
        
        foreach (string guid in textureGUIDs)
        {
            string path = UnityEditor.AssetDatabase.GUIDToAssetPath(guid);
            UnityEditor.TextureImporter importer = 
                UnityEditor.AssetImporter.GetAtPath(path) as UnityEditor.TextureImporter;
            
            if (importer != null)
            {
                // 设置压缩
                if (enableTextureCompression)
                {
                    importer.compressionQuality = UnityEditor.TextureImporterCompression.High;
                }
                
                // 设置最大尺寸
                importer.maxTextureSize = Mathf.Min(importer.maxTextureSize, maxTextureSize);
                
                // 应用更改
                importer.SaveAndReimport();
            }
        }
        #endif
    }

    // 应用Player设置优化
    private void ApplyPlayerOptimizations()
    {
        #if UNITY_EDITOR
        PlayerSettings.stripEngineCode = enableStripping;
        PlayerSettings.actionOnDotNetUnhandledException = 
            UnhandledExceptionPolicy.Quit;
        PlayerSettings.enableInternalProfiler = false;
        PlayerSettings.logObjCUncaughtExceptions = false;
        PlayerSettings.enableCrashReportAPI = false;
        #endif
    }

    // 预构建检查
    public BuildCheckResult PreBuildCheck()
    {
        BuildCheckResult result = new BuildCheckResult();
        
        // 检查场景设置
        result.sceneCheckPassed = CheckSceneSettings();
        
        // 检查资源优化
        result.resourceCheckPassed = CheckResourceOptimization();
        
        // 检查代码质量
        result.codeCheckPassed = CheckCodeQuality();
        
        // 检查性能设置
        result.performanceCheckPassed = CheckPerformanceSettings();
        
        // 生成检查报告
        result.generateReport();
        
        return result;
    }

    private bool CheckSceneSettings()
    {
        // 检查场景中的静态对象设置
        GameObject[] allObjects = FindObjectsOfType<GameObject>();
        int staticObjects = 0;
        int dynamicObjects = 0;
        
        foreach (GameObject go in allObjects)
        {
            if (go.isStatic)
            {
                staticObjects++;
            }
            else
            {
                dynamicObjects++;
            }
        }
        
        Debug.Log($"场景静态对象: {staticObjects}, 动态对象: {dynamicObjects}");
        
        // 建议静态对象数量不要过多影响构建时间
        return staticObjects < 10000; // 根据项目调整阈值
    }

    private bool CheckResourceOptimization()
    {
        // 检查大纹理
        Texture[] allTextures = Resources.FindObjectsOfTypeAll<Texture>();
        int largeTextures = 0;
        
        foreach (Texture texture in allTextures)
        {
            if (texture.width > 4096 || texture.height > 4096)
            {
                largeTextures++;
                Debug.LogWarning($"发现大纹理: {texture.name} ({texture.width}x{texture.height})");
            }
        }
        
        // 检查大音频文件
        AudioClip[] allAudio = Resources.FindObjectsOfTypeAll<AudioClip>();
        int largeAudio = 0;
        
        foreach (AudioClip audio in allAudio)
        {
            float length = audio.length;
            if (length > 60) // 超过60秒的音频
            {
                largeAudio++;
                Debug.LogWarning($"发现长音频: {audio.name} ({length:F1}秒)");
            }
        }
        
        return largeTextures == 0 && largeAudio == 0;
    }

    private bool CheckCodeQuality()
    {
        // 检查未使用的脚本
        MonoBehaviour[] allBehaviours = FindObjectsOfType<MonoBehaviour>();
        
        foreach (MonoBehaviour behaviour in allBehaviours)
        {
            if (behaviour == null)
            {
                Debug.LogWarning($"发现空脚本引用");
                return false;
            }
        }
        
        return true;
    }

    private bool CheckPerformanceSettings()
    {
        // 检查性能相关设置
        return true; // 根据具体需求实现
    }

    // 构建后处理
    public void PostBuildProcessing(string buildPath)
    {
        Debug.Log($"构建完成: {buildPath}");
        
        // 执行构建后处理任务
        PerformPostBuildTasks(buildPath);
    }

    private void PerformPostBuildTasks(string buildPath)
    {
        // 生成构建报告
        GenerateBuildReport(buildPath);
        
        // 优化构建输出
        OptimizeBuildOutput(buildPath);
        
        // 验证构建完整性
        VerifyBuildIntegrity(buildPath);
    }

    private void GenerateBuildReport(string buildPath)
    {
        BuildReport report = new BuildReport();
        report.buildPath = buildPath;
        report.buildTime = System.DateTime.Now;
        report.targetPlatform = targetPlatform.ToString();
        
        // 收集构建信息
        report.fileSize = GetDirectorySize(buildPath);
        report.assetCount = GetAssetCount();
        report.sceneCount = UnityEngine.SceneManagement.SceneManager.sceneCountInBuildSettings;
        
        // 保存报告
        string reportPath = System.IO.Path.Combine(buildPath, "build_report.json");
        System.IO.File.WriteAllText(reportPath, JsonUtility.ToJson(report, true));
        
        Debug.Log($"构建报告已生成: {reportPath}");
    }

    private long GetDirectorySize(string directoryPath)
    {
        if (!System.IO.Directory.Exists(directoryPath))
            return 0;

        long size = 0;
        string[] files = System.IO.Directory.GetFiles(directoryPath, "*.*", System.IO.SearchOption.AllDirectories);
        
        foreach (string file in files)
        {
            size += new System.IO.FileInfo(file).Length;
        }
        
        return size;
    }

    private int GetAssetCount()
    {
        // 简化的资源计数
        int count = 0;
        count += Resources.FindObjectsOfTypeAll<GameObject>().Length;
        count += Resources.FindObjectsOfTypeAll<Texture>().Length;
        count += Resources.FindObjectsOfTypeAll<AudioClip>().Length;
        count += Resources.FindObjectsOfTypeAll<Material>().Length;
        return count;
    }

    private void OptimizeBuildOutput(string buildPath)
    {
        // 移除不必要的文件
        RemoveUnnecessaryFiles(buildPath);
        
        // 压缩构建输出
        CompressBuildOutput(buildPath);
    }

    private void RemoveUnnecessaryFiles(string buildPath)
    {
        // 移除调试符号等
        string[] unnecessaryFiles = { "*.pdb", "*.mdb", "*.log" };
        
        foreach (string pattern in unnecessaryFiles)
        {
            string[] files = System.IO.Directory.GetFiles(buildPath, pattern, System.IO.SearchOption.AllDirectories);
            foreach (string file in files)
            {
                try
                {
                    System.IO.File.Delete(file);
                    Debug.Log($"删除文件: {file}");
                }
                catch (System.Exception e)
                {
                    Debug.LogWarning($"无法删除文件 {file}: {e.Message}");
                }
            }
        }
    }

    private void CompressBuildOutput(string buildPath)
    {
        // 使用外部工具压缩构建输出
        // 这里可以集成7-Zip或其他压缩工具
        Debug.Log($"构建输出压缩到: {buildPath}");
    }

    private void VerifyBuildIntegrity(string buildPath)
    {
        // 验证构建文件完整性
        string[] requiredFiles = { 
            System.IO.Path.GetFileNameWithoutExtension(PlayerSettings.productName) + GetExecutableExtension(),
            "UnityPlayer.dll", // Windows平台
            "Resources/unity default resources",
            "Managed/"
        };
        
        bool allFilesExist = true;
        
        foreach (string requiredFile in requiredFiles)
        {
            string fullPath = System.IO.Path.Combine(buildPath, requiredFile);
            if (!System.IO.File.Exists(fullPath) && !System.IO.Directory.Exists(fullPath))
            {
                Debug.LogError($"缺少必要文件: {fullPath}");
                allFilesExist = false;
            }
        }
        
        if (allFilesExist)
        {
            Debug.Log("构建完整性验证通过");
        }
        else
        {
            Debug.LogError("构建完整性验证失败");
        }
    }

    private string GetExecutableExtension()
    {
        switch (targetPlatform)
        {
            case BuildTarget.StandaloneWindows:
            case BuildTarget.StandaloneWindows64:
                return ".exe";
            case BuildTarget.StandaloneOSX:
                return ".app";
            case BuildTarget.Android:
                return ".apk";
            case BuildTarget.iOS:
                return ".ipa";
            default:
                return "";
        }
    }
}

[System.Serializable]
public class BuildCheckResult
{
    public bool sceneCheckPassed = false;
    public bool resourceCheckPassed = false;
    public bool codeCheckPassed = false;
    public bool performanceCheckPassed = false;
    public List<string> warnings = new List<string>();
    public List<string> errors = new List<string>();

    public bool allChecksPassed => sceneCheckPassed && resourceCheckPassed && 
                                  codeCheckPassed && performanceCheckPassed && 
                                  errors.Count == 0;

    public void generateReport()
    {
        string report = $@"
构建检查报告:
场景检查: {(sceneCheckPassed ? "通过" : "失败")}
资源检查: {(resourceCheckPassed ? "通过" : "失败")}
代码检查: {(codeCheckPassed ? "通过" : "失败")}
性能检查: {(performanceCheckPassed ? "通过" : "失败")}
总体结果: {(allChecksPassed ? "通过" : "失败")}

警告 ({warnings.Count} 个):
";
        
        foreach (string warning in warnings)
        {
            report += $"  ⚠️ {warning}\n";
        }
        
        report += $"\n错误 ({errors.Count} 个):\n";
        
        foreach (string error in errors)
        {
            report += $"  ❌ {error}\n";
        }

        Debug.Log(report);
    }
}

[System.Serializable]
public class BuildReport
{
    public string buildPath;
    public System.DateTime buildTime;
    public string targetPlatform;
    public long fileSize;
    public int assetCount;
    public int sceneCount;
    public string unityVersion = Application.unityVersion;
    public string buildGuid = System.Guid.NewGuid().ToString();
}
```

### 部署策略

```csharp
using UnityEngine;
using System.Collections;
using System.Collections.Generic;

// 部署策略管理器
public class DeploymentStrategyManager : MonoBehaviour
{
    [Header("部署配置")]
    public DeploymentEnvironment currentEnvironment = DeploymentEnvironment.Development;
    public string buildVersion = "1.0.0";
    public string buildChannel = "default";
    public bool enableAnalytics = true;
    public bool enableCrashReporting = true;

    [Header("更新策略")]
    public UpdateStrategy updateStrategy = UpdateStrategy.HotUpdate;
    public bool enableAutoUpdate = true;
    public float updateCheckInterval = 3600f; // 1小时

    [Header("内容分发")]
    public bool enableCDN = true;
    public string cdnBaseUrl = "https://cdn.example.com";
    public bool enableAssetBundles = true;

    private float lastUpdateCheckTime = 0f;
    private bool isUpdating = false;

    void Start()
    {
        InitializeDeployment();
    }

    void Update()
    {
        CheckForUpdates();
    }

    // 初始化部署
    private void InitializeDeployment()
    {
        // 设置环境特定配置
        ConfigureEnvironment();

        // 初始化分析系统
        if (enableAnalytics)
        {
            InitializeAnalytics();
        }

        // 初始化崩溃报告
        if (enableCrashReporting)
        {
            InitializeCrashReporting();
        }

        // 检查更新
        if (enableAutoUpdate)
        {
            StartCoroutine(CheckForUpdatesCoroutine());
        }
    }

    // 配置环境
    private void ConfigureEnvironment()
    {
        switch (currentEnvironment)
        {
            case DeploymentEnvironment.Development:
                // 开发环境配置
                QualitySettings.vSyncCount = 0;
                Application.targetFrameRate = 60;
                Debug.unityLogger.logEnabled = true;
                break;
            case DeploymentEnvironment.Staging:
                // 预发布环境配置
                QualitySettings.vSyncCount = 1;
                Application.targetFrameRate = 60;
                Debug.unityLogger.logEnabled = true;
                break;
            case DeploymentEnvironment.Production:
                // 生产环境配置
                QualitySettings.vSyncCount = 1;
                Application.targetFrameRate = 60;
                Debug.unityLogger.logEnabled = false;
                break;
        }
    }

    // 初始化分析系统
    private void InitializeAnalytics()
    {
        // 这里集成具体的分析SDK
        // 例如：Firebase Analytics, Unity Analytics等
        Debug.Log("分析系统已初始化");
    }

    // 初始化崩溃报告
    private void InitializeCrashReporting()
    {
        // 这里集成具体的崩溃报告SDK
        // 例如：Firebase Crashlytics, Unity Cloud Diagnostics等
        Debug.Log("崩溃报告系统已初始化");
    }

    // 检查更新
    private void CheckForUpdates()
    {
        if (enableAutoUpdate && Time.time - lastUpdateCheckTime >= updateCheckInterval && !isUpdating)
        {
            StartCoroutine(CheckForUpdatesCoroutine());
            lastUpdateCheckTime = Time.time;
        }
    }

    private IEnumerator CheckForUpdatesCoroutine()
    {
        isUpdating = true;

        // 检查是否有新版本
        bool hasUpdate = CheckForNewVersion();

        if (hasUpdate)
        {
            // 根据更新策略执行更新
            switch (updateStrategy)
            {
                case UpdateStrategy.HotUpdate:
                    yield return StartCoroutine(PerformHotUpdate());
                    break;
                case UpdateStrategy.FullUpdate:
                    RequestFullUpdate();
                    break;
                case UpdateStrategy.OptionalUpdate:
                    ShowUpdateDialog();
                    break;
            }
        }

        isUpdating = false;
    }

    // 检查新版本
    private bool CheckForNewVersion()
    {
        // 实现版本检查逻辑
        // 从服务器获取最新版本信息
        return false; // 简化实现
    }

    // 执行热更新
    private IEnumerator PerformHotUpdate()
    {
        Debug.Log("开始热更新...");
        
        // 下载更新包
        yield return StartCoroutine(DownloadUpdatePackage());
        
        // 应用更新
        ApplyHotUpdate();
        
        Debug.Log("热更新完成");
    }

    private IEnumerator DownloadUpdatePackage()
    {
        // 实现更新包下载逻辑
        yield return new WaitForSeconds(1f); // 模拟下载
    }

    private void ApplyHotUpdate()
    {
        // 实现热更新应用逻辑
        // 可能包括AssetBundle加载、脚本更新等
    }

    // 请求完整更新
    private void RequestFullUpdate()
    {
        Debug.Log("需要完整更新，请重新下载应用");
        // 这里可以打开应用商店页面
    }

    // 显示更新对话框
    private void ShowUpdateDialog()
    {
        Debug.Log("有新版本可用，是否更新？");
        // 显示更新对话框给用户选择
    }

    // 资源加载优化
    public class OptimizedResourceLoader
    {
        private Dictionary<string, Object> resourceCache = new Dictionary<string, Object>();
        private Queue<string> lruCache = new Queue<string>();
        private int maxCacheSize = 100;

        public T LoadResource<T>(string path) where T : Object
        {
            if (resourceCache.ContainsKey(path))
            {
                // 移动到LRU队列末尾
                lruCache.Enqueue(lruCache.Dequeue()); // 移除并重新添加到末尾
                return resourceCache[path] as T;
            }

            T resource = Resources.Load<T>(path);
            if (resource != null)
            {
                // 添加到缓存
                resourceCache[path] = resource;
                lruCache.Enqueue(path);

                // 如果超过最大缓存大小，移除最久未使用的资源
                if (lruCache.Count > maxCacheSize)
                {
                    string oldestPath = lruCache.Dequeue();
                    resourceCache.Remove(oldestPath);
                }
            }

            return resource;
        }

        public void UnloadResource(string path)
        {
            if (resourceCache.ContainsKey(path))
            {
                Resources.UnloadAsset(resourceCache[path]);
                resourceCache.Remove(path);
                
                // 从LRU队列中移除
                Queue<string> newQueue = new Queue<string>();
                foreach (string p in lruCache)
                {
                    if (p != path)
                    {
                        newQueue.Enqueue(p);
                    }
                }
                lruCache = newQueue;
            }
        }

        public void ClearCache()
        {
            foreach (Object resource in resourceCache.Values)
            {
                Resources.UnloadAsset(resource);
            }
            resourceCache.Clear();
            lruCache.Clear();
        }
    }

    // CDN资源加载器
    public class CDNResourceLoader
    {
        private string baseUrl;
        private OptimizedResourceLoader localLoader;

        public CDNResourceLoader(string cdnUrl)
        {
            baseUrl = cdnUrl;
            localLoader = new OptimizedResourceLoader();
        }

        public IEnumerator LoadFromCDN<T>(string assetPath, System.Action<T> onLoadComplete) where T : Object
        {
            string fullUrl = $"{baseUrl}/{assetPath}";
            
            using (UnityWebRequest request = UnityWebRequestAssetBundle.GetAssetBundle(fullUrl))
            {
                yield return request.SendWebRequest();

                if (request.result == UnityWebRequest.Result.Success)
                {
                    AssetBundle bundle = DownloadHandlerAssetBundle.GetContent(request);
                    if (bundle != null)
                    {
                        T asset = bundle.LoadAsset<T>(System.IO.Path.GetFileName(assetPath));
                        onLoadComplete?.Invoke(asset);
                        
                        // 卸载AssetBundle
                        bundle.Unload(false);
                    }
                }
                else
                {
                    Debug.LogError($"从CDN加载资源失败: {request.error}");
                    // 回退到本地资源
                    T localAsset = localLoader.LoadResource<T>(assetPath);
                    onLoadComplete?.Invoke(localAsset);
                }
            }
        }
    }

    // 版本管理器
    public class VersionManager
    {
        private string currentVersion;
        private string serverVersion;
        private System.DateTime lastCheckTime;

        public VersionManager(string currentVer)
        {
            currentVersion = currentVer;
        }

        public IEnumerator CheckServerVersion(string versionUrl, System.Action<bool> onVersionCheckComplete)
        {
            using (UnityWebRequest request = UnityWebRequest.Get(versionUrl))
            {
                yield return request.SendWebRequest();

                if (request.result == UnityWebRequest.Result.Success)
                {
                    serverVersion = request.downloadHandler.text.Trim();
                    lastCheckTime = System.DateTime.Now;
                    
                    bool hasNewVersion = CompareVersions(serverVersion, currentVersion) > 0;
                    onVersionCheckComplete?.Invoke(hasNewVersion);
                }
                else
                {
                    Debug.LogError($"检查版本失败: {request.error}");
                    onVersionCheckComplete?.Invoke(false);
                }
            }
        }

        private int CompareVersions(string version1, string version2)
        {
            string[] v1Parts = version1.Split('.');
            string[] v2Parts = version2.Split('.');

            for (int i = 0; i < Mathf.Max(v1Parts.Length, v2Parts.Length); i++)
            {
                int part1 = i < v1Parts.Length ? int.Parse(v1Parts[i]) : 0;
                int part2 = i < v2Parts.Length ? int.Parse(v2Parts[i]) : 0;

                if (part1 > part2) return 1;
                if (part1 < part2) return -1;
            }

            return 0;
        }

        public string GetCurrentVersion() => currentVersion;
        public string GetServerVersion() => serverVersion;
        public bool IsUpdateAvailable() => CompareVersions(serverVersion, currentVersion) > 0;
    }
}

public enum DeploymentEnvironment
{
    Development,
    Staging,
    Production
}

public enum UpdateStrategy
{
    HotUpdate,      // 热更新
    FullUpdate,     // 完整更新
    OptionalUpdate  // 可选更新
}
```

---

## 实践练习

### 练习1: 性能监控面板

```csharp
using UnityEngine;
using UnityEngine.UI;
using System.Collections.Generic;

// 性能监控面板
public class PerformanceMonitorPanel : MonoBehaviour
{
    [Header("UI引用")]
    public Text fpsText;
    public Text memoryText;
    public Text drawCallText;
    public Text batchText;
    public Text objectCountText;
    public Slider fpsSlider; // 用于可视化FPS变化
    public Color goodPerformanceColor = Color.green;
    public Color warningPerformanceColor = Color.yellow;
    public Color poorPerformanceColor = Color.red;

    [Header("监控设置")]
    public float updateInterval = 0.5f;
    public int fpsWarningThreshold = 30;
    public int fpsPoorThreshold = 20;
    public long memoryWarningThreshold = 500 * 1024 * 1024; // 500MB
    public long memoryPoorThreshold = 800 * 1024 * 1024; // 800MB

    private float lastUpdateTime = 0f;
    private List<float> fpsHistory = new List<float>();
    private const int fpsHistorySize = 50;

    void Update()
    {
        if (Time.time - lastUpdateTime >= updateInterval)
        {
            UpdatePerformanceInfo();
            lastUpdateTime = Time.time;
        }
    }

    private void UpdatePerformanceInfo()
    {
        // 更新FPS
        float currentFPS = 1.0f / Time.unscaledDeltaTime;
        UpdateFPSInfo(currentFPS);

        // 更新内存使用
        UpdateMemoryInfo();

        // 更新渲染统计
        UpdateRenderStats();

        // 更新对象计数
        UpdateObjectCount();
    }

    private void UpdateFPSInfo(float fps)
    {
        if (fpsText != null)
        {
            fpsText.text = $"FPS: {fps:F1}";
            
            // 根据FPS设置颜色
            if (fps >= fpsWarningThreshold)
            {
                fpsText.color = goodPerformanceColor;
            }
            else if (fps >= fpsPoorThreshold)
            {
                fpsText.color = warningPerformanceColor;
            }
            else
            {
                fpsText.color = poorPerformanceColor;
            }
        }

        // 更新FPS滑块
        if (fpsSlider != null)
        {
            fpsSlider.value = Mathf.Clamp01(fps / 60f); // 假设目标是60FPS
        }

        // 更新FPS历史记录
        fpsHistory.Add(fps);
        if (fpsHistory.Count > fpsHistorySize)
        {
            fpsHistory.RemoveAt(0);
        }
    }

    private void UpdateMemoryInfo()
    {
        if (memoryText != null)
        {
            long memoryUsage = System.GC.GetTotalMemory(false);
            string memoryStr = FormatBytes(memoryUsage);
            
            memoryText.text = $"Memory: {memoryStr}";
            
            // 根据内存使用设置颜色
            if (memoryUsage < memoryWarningThreshold)
            {
                memoryText.color = goodPerformanceColor;
            }
            else if (memoryUsage < memoryPoorThreshold)
            {
                memoryText.color = warningPerformanceColor;
            }
            else
            {
                memoryText.color = poorPerformanceColor;
            }
        }
    }

    private void UpdateRenderStats()
    {
        if (drawCallText != null)
        {
            drawCallText.text = $"Draw Calls: {UnityEngine.Rendering.RenderSettings.renderingLayerMask}";
        }

        if (batchText != null)
        {
            // 注意：Unity没有直接的API获取批处理数量，这里简化处理
            batchText.text = $"Batches: N/A"; // 实际项目中需要使用profiler API
        }
    }

    private void UpdateObjectCount()
    {
        if (objectCountText != null)
        {
            int objectCount = FindObjectsOfType<Object>().Length;
            objectCountText.text = $"Objects: {objectCount}";
        }
    }

    private string FormatBytes(long bytes)
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

    // 获取FPS历史记录（用于图表显示）
    public List<float> GetFPSHistory()
    {
        return new List<float>(fpsHistory);
    }

    // 强制垃圾回收
    public void ForceGarbageCollection()
    {
        System.GC.Collect();
        System.GC.WaitForPendingFinalizers();
        Debug.Log("强制垃圾回收完成");
    }

    // 卸载未使用的资源
    public void UnloadUnusedAssets()
    {
        Resources.UnloadUnusedAssets();
        Debug.Log("卸载未使用的资源");
    }

    // 重置监控数据
    public void ResetMonitor()
    {
        fpsHistory.Clear();
    }
}
```

### 练习2: 代码质量检查工具

```csharp
using UnityEngine;
using System.Collections.Generic;
using System.Text;
using System.Linq;

// 代码质量检查工具
public class CodeQualityChecker : MonoBehaviour
{
    [Header("检查设置")]
    public bool checkForUnusedVariables = true;
    public bool checkForDeepNesting = true;
    public int maxNestingLevel = 5;
    public bool checkForLongMethods = true;
    public int maxMethodLength = 50;
    public bool checkForGODObjects = true;
    public int maxComponentCount = 10;

    [Header("性能检查")]
    public bool checkForExpensiveOperations = true;
    public bool checkForFrequentAllocations = true;

    private List<QualityIssue> issues = new List<QualityIssue>();

    [System.Serializable]
    public class QualityIssue
    {
        public string objectName;
        public string componentName;
        public string issueType;
        public string description;
        public int severity; // 1 = 低, 2 = 中, 3 = 高
        public System.DateTime timestamp;
    }

    // 执行代码质量检查
    public void RunQualityCheck()
    {
        issues.Clear();
        Debug.Log("开始代码质量检查...");

        if (checkForGODObjects)
        {
            CheckForGODObjects();
        }

        if (checkForDeepNesting)
        {
            CheckForDeepNestingIssues();
        }

        if (checkForLongMethods)
        {
            CheckForLongMethods();
        }

        if (checkForExpensiveOperations)
        {
            CheckForExpensiveOperations();
        }

        GenerateQualityReport();
    }

    // 检查GOD对象（组件过多的对象）
    private void CheckForGODObjects()
    {
        GameObject[] allObjects = FindObjectsOfType<GameObject>();
        
        foreach (GameObject go in allObjects)
        {
            Component[] components = go.GetComponents<Component>();
            if (components.Length > maxComponentCount)
            {
                AddQualityIssue(go.name, "GOD Object", 
                    $"对象有 {components.Length} 个组件，超过了建议的 {maxComponentCount} 个",
                    2);
            }
        }
    }

    // 检查深层嵌套
    private void CheckForDeepNestingIssues()
    {
        MonoBehaviour[] allBehaviours = FindObjectsOfType<MonoBehaviour>();
        
        foreach (MonoBehaviour behaviour in allBehaviours)
        {
            // 这里需要分析代码，实际项目中可能需要使用AST分析
            // 简化版本：检查Transform层级深度
            int depth = GetTransformDepth(behaviour.transform);
            if (depth > maxNestingLevel)
            {
                AddQualityIssue(behaviour.name, "Deep Nesting", 
                    $"Transform嵌套层级为 {depth}，超过了建议的 {maxNestingLevel} 层",
                    2);
            }
        }
    }

    // 检查长方法
    private void CheckForLongMethods()
    {
        MonoBehaviour[] allBehaviours = FindObjectsOfType<MonoBehaviour>();
        
        foreach (MonoBehaviour behaviour in allBehaviours)
        {
            // 这需要反射或代码分析工具来检查实际方法长度
            // 简化版本：检查Update方法的复杂度
            System.Reflection.MethodInfo updateMethod = 
                behaviour.GetType().GetMethod("Update", 
                System.Reflection.BindingFlags.Instance | 
                System.Reflection.BindingFlags.Public | 
                System.Reflection.BindingFlags.NonPublic);
                
            if (updateMethod != null)
            {
                // 这里简化处理，实际需要分析方法体
                AddQualityIssue(behaviour.name, "Method Length", 
                    "Update方法可能过长，建议拆分逻辑",
                    1);
            }
        }
    }

    // 检查昂贵操作
    private void CheckForExpensiveOperations()
    {
        // 检查频繁的Find操作
        CheckForFrequentFindOperations();
        
        // 检查Update中的昂贵操作
        CheckForExpensiveUpdateOperations();
    }

    private void CheckForFrequentFindOperations()
    {
        GameObject[] allObjects = FindObjectsOfType<GameObject>();
        
        foreach (GameObject go in allObjects)
        {
            MonoBehaviour[] behaviours = go.GetComponents<MonoBehaviour>();
            foreach (MonoBehaviour behaviour in behaviours)
            {
                // 检查是否在Update中使用了FindObject
                if (HasExpensiveFindOperation(behaviour))
                {
                    AddQualityIssue(behaviour.name, "Expensive Operation", 
                        "在Update中使用了FindObject操作，这很昂贵",
                        3);
                }
            }
        }
    }

    private bool HasExpensiveFindOperation(MonoBehaviour behaviour)
    {
        // 简化的检查，实际需要代码分析
        string scriptContent = GetScriptContent(behaviour);
        return scriptContent.Contains("GameObject.Find") || 
               scriptContent.Contains("FindGameObjectWithTag") ||
               scriptContent.Contains("FindObjectOfType");
    }

    private string GetScriptContent(MonoBehaviour behaviour)
    {
        // 这里简化处理，实际需要读取源代码文件
        return behaviour.GetType().Name;
    }

    private void CheckForExpensiveUpdateOperations()
    {
        MonoBehaviour[] allBehaviours = FindObjectsOfType<MonoBehaviour>();
        
        foreach (MonoBehaviour behaviour in allBehaviours)
        {
            // 检查Update方法中是否有昂贵操作
            System.Reflection.MethodInfo updateMethod = 
                behaviour.GetType().GetMethod("Update");
                
            if (updateMethod != null)
            {
                // 检查是否调用了GetComponent等操作
                AddQualityIssue(behaviour.name, "Expensive Update", 
                    "Update方法中可能包含昂贵操作，建议缓存引用",
                    2);
            }
        }
    }

    // 添加质量问
    private void AddQualityIssue(string objectName, string issueType, string description, int severity)
    {
        QualityIssue issue = new QualityIssue
        {
            objectName = objectName,
            componentName = issueType,
            issueType = issueType,
            description = description,
            severity = severity,
            timestamp = System.DateTime.Now
        };
        
        issues.Add(issue);
    }

    // 生成质量报告
    private void GenerateQualityReport()
    {
        StringBuilder report = new StringBuilder();
        report.AppendLine("=== 代码质量检查报告 ===");
        report.AppendLine($"检查时间: {System.DateTime.Now}");
        report.AppendLine($"发现问题数量: {issues.Count}");
        
        if (issues.Count > 0)
        {
            report.AppendLine("\n问题详情:");
            
            // 按严重程度排序
            var sortedIssues = issues.OrderByDescending(i => i.severity).ToList();
            
            foreach (QualityIssue issue in sortedIssues)
            {
                string severityStr = issue.severity == 3 ? "高" : 
                                   issue.severity == 2 ? "中" : "低";
                
                report.AppendLine($"[{severityStr}] {issue.objectName}.{issue.componentName}: {issue.description}");
            }
        }
        else
        {
            report.AppendLine("\n✅ 未发现代码质量问题！");
        }

        Debug.Log(report.ToString());
    }

    // 获取Transform深度
    private int GetTransformDepth(Transform transform)
    {
        int depth = 0;
        Transform current = transform;
        
        while (current.parent != null)
        {
            depth++;
            current = current.parent;
        }
        
        return depth;
    }

    // 修复建议
    public void GenerateFixSuggestions()
    {
        StringBuilder suggestions = new StringBuilder();
        suggestions.AppendLine("=== 修复建议 ===");

        int godObjectCount = issues.Count(i => i.issueType == "GOD Object");
        int nestingIssues = issues.Count(i => i.issueType.Contains("Nesting"));
        int expensiveOps = issues.Count(i => i.issueType.Contains("Expensive"));

        if (godObjectCount > 0)
        {
            suggestions.AppendLine($"• 将 {godObjectCount} 个GOD对象拆分为多个组件");
            suggestions.AppendLine("  - 使用组合模式替代继承");
            suggestions.AppendLine("  - 将相关功能分组到不同的脚本中");
        }

        if (nestingIssues > 0)
        {
            suggestions.AppendLine($"• 减少 {nestingIssues} 个对象的Transform嵌套层级");
            suggestions.AppendLine("  - 考虑使用对象池减少层级");
            suggestions.AppendLine("  - 重新设计场景层级结构");
        }

        if (expensiveOps > 0)
        {
            suggestions.AppendLine($"• 优化 {expensiveOps} 个昂贵操作");
            suggestions.AppendLine("  - 缓存GameObject.Find的结果");
            suggestions.AppendLine("  - 将GetComponent调用移到Start或Awake中");
            suggestions.AppendLine("  - 使用对象池替代频繁的Instantiate/Destroy");
        }

        Debug.Log(suggestions.ToString());
    }

    // 获取质量评分
    public float GetQualityScore()
    {
        if (issues.Count == 0) return 100f;

        int totalSeverity = issues.Sum(i => i.severity);
        // 基于问题数量和严重程度计算分数
        float score = Mathf.Clamp(100f - (issues.Count * 5 + totalSeverity * 10), 0f, 100f);
        return score;
    }
}
```

---

## 常见错误和最佳实践总结

### 1. 性能相关最佳实践

```csharp
using UnityEngine;
using System.Collections.Generic;

// 性能最佳实践示例
public class PerformanceBestPractices : MonoBehaviour
{
    // ✅ 正确：缓存组件引用
    private Transform cachedTransform;
    private Rigidbody cachedRigidbody;
    private Renderer cachedRenderer;
    private Collider cachedCollider;

    void Start()
    {
        // 一次性获取并缓存组件引用
        cachedTransform = transform;
        cachedRigidbody = GetComponent<Rigidbody>();
        cachedRenderer = GetComponent<Renderer>();
        cachedCollider = GetComponent<Collider>();
    }

    void Update()
    {
        // 使用缓存的引用而不是每次都获取
        if (cachedTransform != null)
        {
            cachedTransform.Translate(Vector3.forward * Time.deltaTime);
        }

        if (cachedRigidbody != null)
        {
            cachedRigidbody.velocity = new Vector3(1, 0, 0);
        }
    }

    // ✅ 正确：使用对象池
    private Queue<GameObject> objectPool = new Queue<GameObject>();
    private GameObject prefab;

    private GameObject GetFromPool()
    {
        if (objectPool.Count > 0)
        {
            GameObject obj = objectPool.Dequeue();
            obj.SetActive(true);
            return obj;
        }
        else
        {
            return Instantiate(prefab);
        }
    }

    private void ReturnToPool(GameObject obj)
    {
        obj.SetActive(false);
        obj.transform.SetParent(transform); // 归属到池对象下
        objectPool.Enqueue(obj);
    }

    // ✅ 正确：避免在Update中进行昂贵操作
    private float expensiveOperationInterval = 1f;
    private float lastExpensiveTime = 0f;

    void Update()
    {
        // 昂贵操作定期执行，而不是每帧执行
        if (Time.time - lastExpensiveTime >= expensiveOperationInterval)
        {
            PerformExpensiveOperation();
            lastExpensiveTime = Time.time;
        }
    }

    private void PerformExpensiveOperation()
    {
        // 只在需要时执行昂贵操作
    }

    // ✅ 正确：使用StringBuilder进行字符串操作
    private System.Text.StringBuilder stringBuilder = new System.Text.StringBuilder();

    string BuildStatusString(int health, int maxHealth, int level, string playerName)
    {
        stringBuilder.Length = 0; // 清空但不重新分配内存
        stringBuilder.Append(playerName);
        stringBuilder.Append(" - HP: ");
        stringBuilder.Append(health);
        stringBuilder.Append("/");
        stringBuilder.Append(maxHealth);
        stringBuilder.Append(" Lvl: ");
        stringBuilder.Append(level);
        return stringBuilder.ToString();
    }

    // ✅ 正确：使用预分配的集合
    private List<GameObject> enemies = new List<GameObject>(100); // 预分配容量
    private Dictionary<int, string> lookupTable = new Dictionary<int, string>(50); // 预分配容量

    // ✅ 正确：使用Span<T>进行高性能数组操作
    void ProcessArrayWithSpan(int[] array)
    {
        System.Span<int> span = array.AsSpan();
        for (int i = 0; i < span.Length; i++)
        {
            span[i] *= 2; // 直接在栈上操作，无GC
        }
    }

    // ❌ 错误：在Update中进行昂贵操作
    /*
    void Update()
    {
        // 每帧都查找对象 - 很慢！
        GameObject player = GameObject.Find("Player");
        
        // 每帧都获取组件 - 很慢！
        Transform playerTransform = GameObject.FindGameObjectWithTag("Player").transform;
        
        // 每帧都进行复杂计算 - 很慢！
        List<GameObject> enemies = new List<GameObject>();
        enemies.AddRange(GameObject.FindGameObjectsWithTag("Enemy"));
    }
    */

    // ❌ 错误：频繁创建和销毁对象
    /*
    void Update()
    {
        GameObject effect = new GameObject(); // 每帧创建新对象
        Destroy(effect, 1f); // 1秒后销毁 - 造成GC压力
    }
    */

    // ❌ 错误：在循环中进行昂贵操作
    /*
    void Update()
    {
        for (int i = 0; i < transform.childCount; i++)
        {
            // 每次循环都调用GetComponent - 很慢！
            var script = transform.GetChild(i).GetComponent<SomeComponent>();
        }
    }
    */
}
```

### 2. 内存管理最佳实践

```csharp
using UnityEngine;
using System.Collections.Generic;

// 内存管理最佳实践
public class MemoryManagementBestPractices : MonoBehaviour
{
    // ✅ 正确：事件系统内存管理
    private System.Action<int> scoreChangedCallback;

    void SubscribeToEvents()
    {
        // 使用具体方法而不是Lambda来避免闭包
        scoreChangedCallback = OnScoreChanged;
        GameEvents.OnScoreChanged += scoreChangedCallback;
    }

    void UnsubscribeFromEvents()
    {
        // 记得取消订阅以避免内存泄漏
        GameEvents.OnScoreChanged -= scoreChangedCallback;
    }

    private void OnScoreChanged(int newScore)
    {
        // 处理分数改变
    }

    // ✅ 正确：资源管理
    private List<Object> loadedAssets = new List<Object>();

    void LoadAssetSafely<T>(string path) where T : Object
    {
        T asset = Resources.Load<T>(path);
        if (asset != null)
        {
            loadedAssets.Add(asset);
        }
    }

    void UnloadAllAssets()
    {
        foreach (Object asset in loadedAssets)
        {
            if (asset != null)
            {
                Resources.UnloadAsset(asset);
            }
        }
        loadedAssets.Clear();
    }

    // ✅ 正确：使用结构体而不是类（适用于小对象）
    [System.Serializable]
    public struct PositionData
    {
        public Vector3 position;
        public Quaternion rotation;
        public int id;

        public PositionData(Vector3 pos, Quaternion rot, int id)
        {
            position = pos;
            rotation = rot;
            this.id = id;
        }
    }

    // ✅ 正确：避免装箱/拆箱
    void AvoidBoxing()
    {
        // ❌ 错误：装箱
        // object boxedInt = 42; // int装箱为object
        // List<object> mixedList = new List<object> { 1, 2, 3, "string" }; // 发生装箱

        // ✅ 正确：使用泛型
        List<int> intList = new List<int> { 1, 2, 3, 4, 5 };
        List<string> stringList = new List<string> { "a", "b", "c" };
    }

    // ✅ 正确：对象生命周期管理
    private List<System.IDisposable> disposableObjects = new List<System.IDisposable>();

    void RegisterDisposable(System.IDisposable disposable)
    {
        disposableObjects.Add(disposable);
    }

    void Cleanup()
    {
        // 清理所有可释放对象
        foreach (System.IDisposable disposable in disposableObjects)
        {
            disposable?.Dispose();
        }
        disposableObjects.Clear();
    }

    void OnDestroy()
    {
        Cleanup();
        UnsubscribeFromEvents();
        UnloadAllAssets();
    }
}
```

---

## 总结

本章我们学习了Unity游戏开发的最佳实践：

✅ **代码组织和架构**: 项目结构、命名约定、单例模式、组件化架构、事件驱动  
✅ **性能优化策略**: 对象池、批处理、物理优化、LOD系统  
✅ **内存管理**: 监控分析、资源管理、字符串优化、集合优化  
✅ **UI系统**: 性能优化、事件系统、动画优化  
✅ **音频系统**: 管理器优化、事件处理、性能监控  
✅ **动画系统**: 控制器优化、事件处理、性能监控  
✅ **测试调试**: 单元测试、调试工具、性能分析  
✅ **发布部署**: 构建优化、部署策略、版本管理  

这些最佳实践是开发高质量Unity游戏的基础，遵循这些原则能够显著提升游戏性能和可维护性。

---

## 下一步

继续学习 [10. 常见坑](10-common-pitfalls.md) →
