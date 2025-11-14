# 06. Unity基础

> Unity引擎完全指南 - 从C#开发者到Unity游戏开发

---

## 📌 本章导航

- [Unity环境和编辑器界面](#unity环境和编辑器界面)
- [MonoBehaviour生命周期](#monobehaviour生命周期)
- [场景和游戏对象](#场景和游戏对象)
- [组件系统](#组件系统)
- [Transform和空间变换](#transform和空间变换)
- [输入系统](#输入系统)
- [Time和帧率控制](#time和帧率控制)
- [Unity中的C#实践](#unity中的c实践)

---

## Unity环境和编辑器界面

### Unity Hub和Unity编辑器

Unity是目前最受欢迎的游戏开发引擎之一，它提供了一个完整的开发环境，让开发者可以创建2D和3D游戏。对于C#开发者来说，Unity提供了一个熟悉的编程环境，因为Unity的脚本系统主要使用C#。

**Unity Hub安装和项目管理**:

Unity Hub是Unity的中央管理工具，用于：
- 管理Unity版本
- 创建和管理项目
- 访问Unity Learn资源
- 管理Unity账户

**Unity编辑器界面**:

Unity编辑器包含以下主要窗口：

1. **Scene视图**: 3D/2D场景的可视化编辑器
2. **Game视图**: 游戏运行时的视图
3. **Hierarchy窗口**: 场景中所有游戏对象的层次结构
4. **Project窗口**: 项目资源管理
5. **Inspector窗口**: 选中对象的属性和组件
6. **Console窗口**: 调试信息和错误输出

### 项目结构

```csharp
// Unity项目的典型目录结构
Assets/
├── Scripts/          // C#脚本文件
├── Scenes/           // 场景文件
├── Prefabs/          // 预制件
├── Materials/        // 材质
├── Textures/         // 纹理
├── Models/           // 3D模型
├── Audio/            // 音频文件
├── Animations/       // 动画文件
└── Plugins/          // 插件
```

### Unity编辑器基本操作

在Unity中，你需要熟悉以下基本操作：

- **场景导航**: 
  - 鼠标右键 + WASD: 移动视图
  - 鼠标中键: 平移视图
  - 滚轮: 缩放视图
  - F键: 聚焦选中对象

- **对象操作**:
  - W: 移动工具
  - E: 旋转工具
  - R: 缩放工具
  - Q: 选择工具

### 创建第一个Unity项目

```csharp
// 1. 打开Unity Hub
// 2. 点击"New Project"
// 3. 选择模板: 3D, 2D, 或Universal
// 4. 设置项目名称和位置
// 5. 点击"Create Project"
```

---

## MonoBehaviour生命周期

### MonoBehaviour基础

MonoBehaviour是Unity中所有脚本组件的基类。它定义了组件在游戏运行时的行为生命周期。

```csharp
using UnityEngine;

// 继承MonoBehaviour的脚本
public class PlayerController : MonoBehaviour
{
    // Start is called before the first frame update
    void Start()
    {
        Debug.Log("PlayerController Start");
        // 初始化代码
    }

    // Update is called once per frame
    void Update()
    {
        // 每帧执行的代码
        HandleInput();
    }

    // FixedUpdate is called at regular intervals
    void FixedUpdate()
    {
        // 物理更新代码
        ApplyPhysics();
    }

    // LateUpdate is called after Update
    void LateUpdate()
    {
        // 后续更新代码，通常用于跟随相机等
        FollowTarget();
    }

    private void HandleInput()
    {
        // 处理输入
    }

    private void ApplyPhysics()
    {
        // 应用物理
    }

    private void FollowTarget()
    {
        // 跟随目标
    }
}
```

### 完整的生命周期方法

```csharp
using UnityEngine;

public class LifecycleDemo : MonoBehaviour
{
    // 1. 脚本实例创建时调用（在对象被创建时）
    private void Awake()
    {
        Debug.Log("1. Awake - 对象创建时调用");
        // 初始化变量
        // 设置单例模式
        // 不能调用StartCoroutine
    }

    // 2. 脚本启用时调用（在Start之前）
    private void OnEnable()
    {
        Debug.Log("2. OnEnable - 脚本启用时调用");
        // 订阅事件
        // 注册回调
    }

    // 3. 在所有Awake后调用，用于初始化
    void Start()
    {
        Debug.Log("3. Start - 初始化代码");
        // 只执行一次
        // 依赖于其他对象的初始化
    }

    // 4. 每帧更新（渲染前）
    void Update()
    {
        Debug.Log("4. Update - 每帧更新");
        // 处理输入
        // UI更新
        // 游戏逻辑
    }

    // 5. 固定时间间隔更新（物理更新）
    void FixedUpdate()
    {
        Debug.Log("5. FixedUpdate - 物理更新");
        // 物理计算
        // 刚体操作
        // 确保物理计算的一致性
    }

    // 6. 渲染后更新
    void LateUpdate()
    {
        Debug.Log("6. LateUpdate - 渲染后更新");
        // 相机跟随
        // 后处理
    }

    // 7. 碰撞检测
    void OnCollisionEnter(Collision collision)
    {
        Debug.Log($"碰撞检测: {collision.gameObject.name}");
    }

    // 8. 触发器检测
    void OnTriggerEnter(Collider other)
    {
        Debug.Log($"触发检测: {other.gameObject.name}");
    }

    // 9. 脚本禁用时调用
    private void OnDisable()
    {
        Debug.Log("7. OnDisable - 脚本禁用时调用");
        // 取消订阅事件
        // 清理资源
    }

    // 10. 对象销毁时调用
    private void OnDestroy()
    {
        Debug.Log("8. OnDestroy - 对象销毁时调用");
        // 清理资源
        // 保存数据
        // 取消订阅
    }

    // 11. GUI渲染（OnGUI已被弃用，但了解其用途）
    void OnGUI()
    {
        // 用于调试GUI
        GUI.Label(new Rect(10, 10, 200, 20), "Debug Info");
    }
}
```

### 生命周期最佳实践

```csharp
using UnityEngine;

public class BestPracticeExample : MonoBehaviour
{
    [Header("移动设置")]
    public float moveSpeed = 5.0f;
    public float jumpForce = 10.0f;

    [Header("游戏状态")]
    public int health = 100;
    public int maxHealth = 100;

    private Rigidbody rb;
    private Animator animator;
    private bool isGrounded = true;

    // Awake: 初始化组件引用和单例模式
    void Awake()
    {
        // 获取组件引用
        rb = GetComponent<Rigidbody>();
        animator = GetComponent<Animator>();
        
        // 单例模式示例
        if (FindObjectsOfType<BestPracticeExample>().Length > 1)
        {
            Destroy(gameObject);
        }
    }

    // Start: 依赖其他对象的初始化
    void Start()
    {
        // 依赖其他对象的初始化
        InitializePlayer();
    }

    // Update: 输入处理和游戏逻辑
    void Update()
    {
        HandleInput();
        UpdateUI();
    }

    // FixedUpdate: 物理相关的更新
    void FixedUpdate()
    {
        ApplyMovement();
    }

    // OnEnable/OnDisable: 事件订阅/取消订阅
    private void OnEnable()
    {
        // 订阅事件
        GameEvents.OnPlayerDeath += OnPlayerDeath;
    }

    private void OnDisable()
    {
        // 取消订阅事件
        GameEvents.OnPlayerDeath -= OnPlayerDeath;
    }

    // OnDestroy: 清理资源
    private void OnDestroy()
    {
        // 清理资源
        if (rb != null)
        {
            rb.velocity = Vector3.zero;
        }
    }

    private void InitializePlayer()
    {
        health = maxHealth;
        if (animator != null)
        {
            animator.SetInteger("Health", health);
        }
    }

    private void HandleInput()
    {
        if (Input.GetButtonDown("Jump") && isGrounded)
        {
            Jump();
        }
    }

    private void ApplyMovement()
    {
        if (rb != null)
        {
            Vector3 movement = new Vector3(Input.GetAxis("Horizontal"), 0, Input.GetAxis("Vertical"));
            rb.velocity = new Vector3(movement.x * moveSpeed, rb.velocity.y, movement.z * moveSpeed);
        }
    }

    private void Jump()
    {
        if (rb != null)
        {
            rb.AddForce(Vector3.up * jumpForce, ForceMode.Impulse);
            isGrounded = false;
        }
    }

    private void UpdateUI()
    {
        // UI更新逻辑
    }

    private void OnPlayerDeath()
    {
        // 玩家死亡处理
        Debug.Log("Player died!");
    }
}
```

---

## 场景和游戏对象

### 游戏对象 (GameObject) 基础

GameObject是Unity中所有实体的基础，它本身只是一个容器，通过附加不同的组件来实现具体功能。

```csharp
using UnityEngine;

public class GameObjectDemo : MonoBehaviour
{
    // 创建游戏对象
    void CreateGameObjects()
    {
        // 1. 创建空游戏对象
        GameObject emptyObject = new GameObject("EmptyObject");
        
        // 2. 创建带组件的游戏对象
        GameObject cube = GameObject.CreatePrimitive(PrimitiveType.Cube);
        cube.name = "PlayerCube";
        
        // 3. 从预制件创建
        // GameObject prefab = Resources.Load<GameObject>("Prefabs/PlayerPrefab");
        // GameObject instance = Instantiate(prefab);
        
        // 4. 从场景中查找
        GameObject player = GameObject.Find("Player");
        GameObject[] allObjects = GameObject.FindGameObjectsWithTag("Enemy");
    }

    // 游戏对象操作
    void ManipulateGameObjects()
    {
        GameObject target = new GameObject("Target");
        
        // 设置位置
        target.transform.position = new Vector3(10, 0, 0);
        
        // 设置旋转
        target.transform.rotation = Quaternion.Euler(0, 45, 0);
        
        // 设置缩放
        target.transform.localScale = Vector3.one * 2;
        
        // 设置父对象
        target.transform.SetParent(this.transform);
        
        // 激活/禁用
        target.SetActive(false);
        target.SetActive(true);
        
        // 销毁对象
        // Destroy(target); // 延迟一帧后销毁
        // DestroyImmediate(target); // 立即销毁（仅在编辑器中）
    }

    // 游戏对象查找
    void FindGameObjects()
    {
        // 通过名称查找
        GameObject player = GameObject.Find("Player");
        
        // 通过标签查找
        GameObject enemy = GameObject.FindGameObjectWithTag("Enemy");
        GameObject[] enemies = GameObject.FindGameObjectsWithTag("Enemy");
        
        // 通过组件查找
        PlayerController playerController = FindObjectOfType<PlayerController>();
        PlayerController[] allPlayers = FindObjectsOfType<PlayerController>();
    }
}
```

### 场景管理

```csharp
using UnityEngine;
using UnityEngine.SceneManagement;

public class SceneManagementDemo : MonoBehaviour
{
    // 场景加载
    public void LoadScene(string sceneName)
    {
        // 同步加载
        SceneManager.LoadScene(sceneName);
        
        // 异步加载
        StartCoroutine(LoadSceneAsync(sceneName));
    }

    // 异步场景加载
    System.Collections.IEnumerator LoadSceneAsync(string sceneName)
    {
        AsyncOperation asyncLoad = SceneManager.LoadSceneAsync(sceneName);
        
        while (!asyncLoad.isDone)
        {
            float progress = Mathf.Clamp01(asyncLoad.progress / 0.9f);
            Debug.Log($"加载进度: {progress * 100}%");
            yield return null;
        }
    }

    // 场景切换
    public void SwitchToScene(int sceneIndex)
    {
        SceneManager.LoadScene(sceneIndex);
    }

    // 添加场景
    public void LoadSceneAdditive(string sceneName)
    {
        SceneManager.LoadSceneAsync(sceneName, LoadSceneMode.Additive);
    }

    // 场景信息
    void SceneInfo()
    {
        Scene currentScene = SceneManager.GetActiveScene();
        Debug.Log($"当前场景: {currentScene.name}");
        Debug.Log($"场景索引: {currentScene.buildIndex}");
        Debug.Log($"场景是否有效: {currentScene.isLoaded}");
        
        int sceneCount = SceneManager.sceneCount;
        Debug.Log($"加载的场景数量: {sceneCount}");
    }

    // 场景卸载
    public void UnloadScene(string sceneName)
    {
        SceneManager.UnloadSceneAsync(sceneName);
    }
}
```

### 预制件 (Prefab) 系统

```csharp
using UnityEngine;

public class PrefabDemo : MonoBehaviour
{
    [Header("预制件引用")]
    public GameObject playerPrefab;
    public GameObject enemyPrefab;
    public GameObject bulletPrefab;

    [Header("生成设置")]
    public Transform spawnPoint;
    public float spawnInterval = 2.0f;

    private System.Collections.IEnumerator spawnCoroutine;

    void Start()
    {
        // 开始自动生成敌人
        spawnCoroutine = SpawnEnemies();
        StartCoroutine(spawnCoroutine);
    }

    // 实例化预制件
    GameObject SpawnObject(GameObject prefab, Vector3 position, Quaternion rotation)
    {
        if (prefab != null)
        {
            GameObject instance = Instantiate(prefab, position, rotation);
            instance.name = prefab.name + "_Instance";
            return instance;
        }
        return null;
    }

    // 生成敌人
    System.Collections.IEnumerator SpawnEnemies()
    {
        while (true)
        {
            if (enemyPrefab != null && spawnPoint != null)
            {
                Vector3 spawnPos = spawnPoint.position;
                GameObject enemy = SpawnObject(enemyPrefab, spawnPos, Quaternion.identity);
                
                if (enemy != null)
                {
                    // 设置敌人属性
                    EnemyController enemyCtrl = enemy.GetComponent<EnemyController>();
                    if (enemyCtrl != null)
                    {
                        enemyCtrl.SetDifficulty(1.0f);
                    }
                }
            }
            
            yield return new WaitForSeconds(spawnInterval);
        }
    }

    // 生成子弹
    public void SpawnBullet(Vector3 position, Vector3 direction)
    {
        if (bulletPrefab != null)
        {
            GameObject bullet = Instantiate(bulletPrefab, position, Quaternion.identity);
            BulletController bulletCtrl = bullet.GetComponent<BulletController>();
            if (bulletCtrl != null)
            {
                bulletCtrl.SetDirection(direction);
            }
        }
    }

    // 预制件操作
    void PrefabOperations()
    {
        // 检查对象是否为预制件实例
        if (PrefabUtility.IsPartOfPrefabInstance(this.gameObject))
        {
            Debug.Log("这是一个预制件实例");
        }
        
        // 获取预制件源
        GameObject prefabSource = PrefabUtility.GetCorrespondingObjectFromSource(this.gameObject) as GameObject;
    }

    void OnDestroy()
    {
        // 停止生成协程
        if (spawnCoroutine != null)
        {
            StopCoroutine(spawnCoroutine);
        }
    }
}

// 敌人控制器示例
public class EnemyController : MonoBehaviour
{
    public float health = 100f;
    public float speed = 2.0f;
    public int damage = 10;

    public void SetDifficulty(float multiplier)
    {
        health *= multiplier;
        speed *= multiplier;
        damage = Mathf.RoundToInt(damage * multiplier);
    }

    public void TakeDamage(float damage)
    {
        health -= damage;
        if (health <= 0)
        {
            Die();
        }
    }

    void Die()
    {
        // 播放死亡效果
        Debug.Log($"{gameObject.name} died!");
        Destroy(gameObject);
    }
}

// 子弹控制器示例
public class BulletController : MonoBehaviour
{
    public float speed = 10.0f;
    public float damage = 20.0f;
    public float lifeTime = 5.0f;

    private Vector3 direction;

    public void SetDirection(Vector3 dir)
    {
        direction = dir.normalized;
    }

    void Start()
    {
        // 设置子弹生命周期
        Destroy(gameObject, lifeTime);
    }

    void Update()
    {
        // 移动子弹
        transform.position += direction * speed * Time.deltaTime;
    }

    void OnTriggerEnter(Collider other)
    {
        // 检测碰撞
        if (other.CompareTag("Enemy"))
        {
            EnemyController enemy = other.GetComponent<EnemyController>();
            if (enemy != null)
            {
                enemy.TakeDamage(damage);
            }
            Destroy(gameObject); // 销毁子弹
        }
    }
}
```

---

## 组件系统

### 组件基础

组件是Unity中功能的基本单元，每个GameObject都可以附加多个组件来实现不同的功能。

```csharp
using UnityEngine;

public class ComponentDemo : MonoBehaviour
{
    // 常用组件引用
    private Transform transform;  // 继承自MonoBehaviour，自动可用
    private Rigidbody rb;
    private Renderer renderer;
    private Collider collider;
    private AudioSource audioSource;
    private Animator animator;

    void Awake()
    {
        // 获取组件的几种方式
        rb = GetComponent<Rigidbody>();
        renderer = GetComponent<Renderer>();
        collider = GetComponent<Collider>();
        audioSource = GetComponent<AudioSource>();
        animator = GetComponent<Animator>();
        
        // 获取组件（如果不存在则添加）
        rb = GetComponent<Rigidbody>() ?? gameObject.AddComponent<Rigidbody>();
        
        // 获取多个组件
        Renderer[] renderers = GetComponents<Renderer>();
        
        // 获取子对象的组件
        Renderer childRenderer = GetComponentInChildren<Renderer>();
        Renderer[] childRenderers = GetComponentsInChildren<Renderer>();
        
        // 获取父对象的组件
        PlayerController parentController = GetComponentInParent<PlayerController>();
    }

    // 组件操作
    void ComponentOperations()
    {
        // 启用/禁用组件
        if (renderer != null)
        {
            renderer.enabled = false; // 禁用渲染
            renderer.enabled = true;  // 启用渲染
        }
        
        // 检查组件是否存在
        if (GetComponent<Rigidbody>() != null)
        {
            Debug.Log("物体有刚体组件");
        }
        
        // 添加组件
        if (GetComponent<MeshFilter>() == null)
        {
            gameObject.AddComponent<MeshFilter>();
        }
        
        // 移除组件
        // Destroy(GetComponent<Renderer>()); // 通过销毁组件对象来移除
    }

    // 自定义组件示例
    void CustomComponentExample()
    {
        // 添加自定义组件
        HealthComponent health = gameObject.AddComponent<HealthComponent>();
        health.maxHealth = 200;
        health.currentHealth = 200;
    }
}

// 自定义组件示例
public class HealthComponent : MonoBehaviour
{
    [Header("生命值设置")]
    public int maxHealth = 100;
    public int currentHealth;
    
    [Header("生命值UI")]
    public UnityEngine.UI.Slider healthBar;

    void Start()
    {
        currentHealth = maxHealth;
        UpdateHealthBar();
    }

    public void TakeDamage(int damage)
    {
        currentHealth = Mathf.Max(0, currentHealth - damage);
        UpdateHealthBar();
        
        if (currentHealth <= 0)
        {
            Die();
        }
    }

    public void Heal(int amount)
    {
        currentHealth = Mathf.Min(maxHealth, currentHealth + amount);
        UpdateHealthBar();
    }

    void UpdateHealthBar()
    {
        if (healthBar != null)
        {
            healthBar.value = (float)currentHealth / maxHealth;
        }
    }

    void Die()
    {
        Debug.Log($"{gameObject.name} died!");
        // 触发死亡事件
        SendMessage("OnDeath", this, SendMessageOptions.DontRequireReceiver);
    }
}
```

### 组件间通信

```csharp
using UnityEngine;

// 主控制器组件
[RequireComponent(typeof(Rigidbody))]
[RequireComponent(typeof(Collider))]
public class PlayerController : MonoBehaviour
{
    [Header("移动设置")]
    public float moveSpeed = 5.0f;
    public float jumpForce = 10.0f;

    private Rigidbody rb;
    private HealthComponent health;
    private WeaponComponent weapon;

    void Start()
    {
        rb = GetComponent<Rigidbody>();
        health = GetComponent<HealthComponent>();
        weapon = GetComponent<WeaponComponent>();
        
        // 如果组件不存在，创建它们
        if (health == null)
        {
            health = gameObject.AddComponent<HealthComponent>();
        }
        
        if (weapon == null)
        {
            weapon = gameObject.AddComponent<WeaponComponent>();
        }
    }

    void Update()
    {
        HandleMovement();
        HandleInput();
    }

    void HandleMovement()
    {
        float horizontal = Input.GetAxis("Horizontal");
        float vertical = Input.GetAxis("Vertical");
        
        Vector3 movement = new Vector3(horizontal, 0, vertical).normalized;
        rb.velocity = new Vector3(movement.x * moveSpeed, rb.velocity.y, movement.z * moveSpeed);
    }

    void HandleInput()
    {
        if (Input.GetButtonDown("Jump"))
        {
            Jump();
        }
        
        if (Input.GetButtonDown("Fire1"))
        {
            weapon?.Shoot();
        }
    }

    void Jump()
    {
        rb.AddForce(Vector3.up * jumpForce, ForceMode.Impulse);
    }

    // 接收来自其他组件的消息
    void OnDamageTaken(int damage)
    {
        health?.TakeDamage(damage);
    }

    void OnHealthChanged(int current, int max)
    {
        Debug.Log($"Health changed: {current}/{max}");
    }
}

// 武器组件
public class WeaponComponent : MonoBehaviour
{
    [Header("武器设置")]
    public float damage = 25.0f;
    public float fireRate = 0.5f;
    public float range = 100.0f;

    private float lastFireTime = 0f;
    private PlayerController player;

    void Start()
    {
        player = GetComponent<PlayerController>();
    }

    public void Shoot()
    {
        if (Time.time - lastFireTime >= fireRate)
        {
            lastFireTime = Time.time;
            
            // 射线检测
            Ray ray = Camera.main.ViewportPointToRay(new Vector3(0.5f, 0.5f, 0));
            RaycastHit hit;
            
            if (Physics.Raycast(ray, out hit, range))
            {
                // 检查是否击中敌人
                EnemyController enemy = hit.collider.GetComponent<EnemyController>();
                if (enemy != null)
                {
                    enemy.TakeDamage((int)damage);
                }
            }
            
            // 播放射击效果
            OnShoot();
        }
    }

    void OnShoot()
    {
        Debug.Log("Weapon fired!");
        // 播放音效、粒子效果等
    }
}

// 碰撞检测组件
public class CollisionDetector : MonoBehaviour
{
    void OnCollisionEnter(Collision collision)
    {
        if (collision.gameObject.CompareTag("Enemy"))
        {
            // 通知玩家控制器受到伤害
            PlayerController player = GetComponent<PlayerController>();
            if (player != null)
            {
                player.SendMessage("OnDamageTaken", 10, SendMessageOptions.DontRequireReceiver);
            }
        }
    }

    void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("PowerUp"))
        {
            // 激活道具效果
            ActivatePowerUp(other.gameObject);
        }
    }

    void ActivatePowerUp(GameObject powerUp)
    {
        Debug.Log($"Collected power-up: {powerUp.name}");
        Destroy(powerUp);
        
        // 通知其他组件
        SendMessage("OnPowerUpCollected", powerUp.name, SendMessageOptions.DontRequireReceiver);
    }
}
```

### 组件属性面板

```csharp
using UnityEngine;

// 使用属性特性自定义Inspector面板
public class CustomInspectorDemo : MonoBehaviour
{
    [Header("基本设置")]
    public string playerName = "Player";
    [Range(1, 100)]
    public int level = 1;
    [Tooltip("玩家移动速度")]
    public float moveSpeed = 5.0f;

    [Header("颜色设置")]
    public Color playerColor = Color.blue;
    public Gradient healthGradient;

    [Header("音效设置")]
    public AudioClip[] soundEffects;
    [Range(0f, 1f)]
    public float volume = 1.0f;

    [Header("特殊能力")]
    [TextArea(3, 10)]
    public string specialAbilityDescription = "描述特殊能力";
    
    [Space(10)]
    [Header("调试设置")]
    public bool debugMode = false;
    [ConditionalField("debugMode")]
    public int debugValue = 0;

    // 自定义属性
    [System.NonSerialized]
    private int internalScore = 0;

    public int Score 
    { 
        get { return internalScore; }
        set { internalScore = Mathf.Max(0, value); }
    }

    // 只读属性显示
    [System.NonSerialized]
    private float calculatedValue = 0f;

    void Update()
    {
        calculatedValue = level * moveSpeed;
    }

    // 在Inspector中显示只读值
    private void OnValidate()
    {
        level = Mathf.Clamp(level, 1, 100);
        moveSpeed = Mathf.Max(0.1f, moveSpeed);
    }
}

// 自定义属性特性
public class ConditionalFieldAttribute : PropertyAttribute
{
    public string ConditionFieldName { get; private set; }
    
    public ConditionalFieldAttribute(string conditionFieldName)
    {
        ConditionFieldName = conditionFieldName;
    }
}

// 使用标签和层
public class TagLayerDemo : MonoBehaviour
{
    [Header("目标设置")]
    public string targetTag = "Player";
    public LayerMask collisionLayers = -1; // 所有层

    void Start()
    {
        // 使用标签查找
        GameObject target = GameObject.FindGameObjectWithTag(targetTag);
        
        // 使用层检测
        Collider[] hitColliders = Physics.OverlapSphere(transform.position, 5f, collisionLayers);
        foreach (var hitCollider in hitColliders)
        {
            Debug.Log($"检测到: {hitCollider.name}");
        }
    }
}
```

---

## Transform和空间变换

### Transform组件详解

Transform组件是Unity中每个GameObject都有的组件，它管理对象的位置、旋转和缩放。

```csharp
using UnityEngine;

public class TransformDemo : MonoBehaviour
{
    [Header("目标设置")]
    public Transform target;
    public float moveSpeed = 5.0f;
    public float rotateSpeed = 60.0f;

    void Update()
    {
        if (target != null)
        {
            MoveToTarget();
            LookAtTarget();
        }
    }

    // 位置操作
    void PositionOperations()
    {
        // 设置绝对位置
        transform.position = new Vector3(10, 5, 0);
        
        // 相对当前位置移动
        transform.position += Vector3.forward * Time.deltaTime * moveSpeed;
        
        // 相对自身坐标系移动
        transform.Translate(Vector3.forward * Time.deltaTime * moveSpeed);
        
        // 相对世界坐标系移动
        transform.Translate(Vector3.forward * Time.deltaTime * moveSpeed, Space.World);
        
        // 相对本地坐标系移动
        transform.Translate(Vector3.forward * Time.deltaTime * moveSpeed, Space.Self);
    }

    // 旋转操作
    void RotationOperations()
    {
        // 设置绝对旋转（欧拉角）
        transform.eulerAngles = new Vector3(0, 45, 0);
        
        // 设置绝对旋转（四元数）
        transform.rotation = Quaternion.Euler(0, 45, 0);
        
        // 相对当前旋转增加
        transform.Rotate(Vector3.up, rotateSpeed * Time.deltaTime);
        
        // 绕指定轴旋转
        transform.RotateAround(Vector3.zero, Vector3.up, 30 * Time.deltaTime);
        
        // 朝向指定点
        if (target != null)
        {
            transform.LookAt(target);
        }
    }

    // 缩放操作
    void ScaleOperations()
    {
        // 设置绝对缩放
        transform.localScale = Vector3.one * 2;
        
        // 相对缩放
        transform.localScale += Vector3.one * 0.1f * Time.deltaTime;
    }

    // 移动到目标
    void MoveToTarget()
    {
        // 线性插值移动
        transform.position = Vector3.Lerp(transform.position, target.position, 
                                         moveSpeed * Time.deltaTime);
        
        // 平滑移动
        transform.position = Vector3.SmoothDamp(transform.position, target.position, 
                                              ref velocity, 0.1f);
    }

    // 朝向目标
    void LookAtTarget()
    {
        if (target != null)
        {
            // 简单位置朝向
            Vector3 direction = target.position - transform.position;
            transform.rotation = Quaternion.LookRotation(direction);
            
            // 平滑朝向
            Quaternion targetRotation = Quaternion.LookRotation(direction);
            transform.rotation = Quaternion.Slerp(transform.rotation, targetRotation, 
                                                rotateSpeed * Time.deltaTime);
        }
    }

    private Vector3 velocity = Vector3.zero; // 用于SmoothDamp

    // 空间变换示例
    void SpaceTransformations()
    {
        // 世界坐标和本地坐标的转换
        Vector3 worldPos = transform.position;                    // 世界位置
        Vector3 localPos = transform.localPosition;              // 本地位置
        
        // 坐标系转换
        Vector3 worldToTarget = target.position - transform.position;
        Vector3 localToTarget = transform.InverseTransformPoint(target.position);
        
        // 方向转换
        Vector3 worldForward = transform.forward;                // 世界空间的前方
        Vector3 localForward = transform.TransformDirection(Vector3.forward); // 本地转世界方向
        
        // 验证转换
        Debug.Log($"世界位置: {worldPos}, 本地位置: {localPos}");
        Debug.Log($"世界到目标: {worldToTarget}, 本地到目标: {localToTarget}");
    }
}
```

### 高级Transform操作

```csharp
using UnityEngine;

public class AdvancedTransform : MonoBehaviour
{
    [Header("变换设置")]
    public Transform[] childObjects;
    public float orbitRadius = 5.0f;
    public float orbitSpeed = 30.0f;

    void Start()
    {
        // 获取所有子对象
        childObjects = new Transform[transform.childCount];
        for (int i = 0; i < transform.childCount; i++)
        {
            childObjects[i] = transform.GetChild(i);
        }
    }

    void Update()
    {
        OrbitMovement();
        ParentChildOperations();
    }

    // 环绕运动
    void OrbitMovement()
    {
        for (int i = 0; i < childObjects.Length; i++)
        {
            if (childObjects[i] != null)
            {
                float angle = Time.time * orbitSpeed * Mathf.Deg2Rad + (i * Mathf.PI * 2 / childObjects.Length);
                Vector3 orbitPos = new Vector3(
                    Mathf.Cos(angle) * orbitRadius,
                    0,
                    Mathf.Sin(angle) * orbitRadius
                );
                
                childObjects[i].position = transform.position + orbitPos;
                childObjects[i].LookAt(transform);
            }
        }
    }

    // 父子关系操作
    void ParentChildOperations()
    {
        // 设置父对象
        // childObject.SetParent(parentObject);
        
        // 设置父对象并保持世界位置不变
        // childObject.SetParent(parentObject, false); // 保持本地位置
        // childObject.SetParent(parentObject, true);  // 保持世界位置
        
        // 解除父关系
        // childObject.SetParent(null);
        
        // 获取父对象
        Transform parent = transform.parent;
        
        // 获取根对象
        Transform root = transform.root;
        
        // 获取层级深度
        int depth = GetTransformDepth(transform);
    }

    int GetTransformDepth(Transform t)
    {
        int depth = 0;
        while (t.parent != null)
        {
            depth++;
            t = t.parent;
        }
        return depth;
    }

    // 批量变换操作
    public void BatchTransformOperation(System.Action<Transform> operation)
    {
        operation(transform);
        
        for (int i = 0; i < transform.childCount; i++)
        {
            Transform child = transform.GetChild(i);
            BatchTransformOperationRecursive(child, operation);
        }
    }

    void BatchTransformOperationRecursive(Transform t, System.Action<Transform> operation)
    {
        operation(t);
        
        for (int i = 0; i < t.childCount; i++)
        {
            Transform child = t.GetChild(i);
            BatchTransformOperationRecursive(child, operation);
        }
    }

    // 变换重置
    public void ResetTransform()
    {
        transform.position = Vector3.zero;
        transform.rotation = Quaternion.identity;
        transform.localScale = Vector3.one;
    }

    // 变换复制
    public void CopyTransformFrom(Transform source)
    {
        if (source != null)
        {
            transform.position = source.position;
            transform.rotation = source.rotation;
            transform.localScale = source.localScale;
        }
    }

    // 相对变换
    public void ApplyRelativeTransform(Vector3 relativePos, Quaternion relativeRot, Vector3 relativeScale)
    {
        transform.position += transform.TransformDirection(relativePos);
        transform.rotation = transform.rotation * relativeRot;
        transform.localScale = Vector3.Scale(transform.localScale, relativeScale);
    }
}

// 变换工具类
public static class TransformUtils
{
    // 在指定对象的局部空间中查找最近的点
    public static Vector3 GetClosestPointOnObject(Transform transform, Vector3 worldPoint)
    {
        Renderer renderer = transform.GetComponent<Renderer>();
        if (renderer != null)
        {
            return renderer.bounds.ClosestPoint(worldPoint);
        }
        return transform.position;
    }

    // 获取对象的边界框
    public static Bounds GetRendererBounds(GameObject obj)
    {
        Renderer[] renderers = obj.GetComponentsInChildren<Renderer>();
        if (renderers.Length == 0) return new Bounds();

        Bounds bounds = renderers[0].bounds;
        for (int i = 1; i < renderers.Length; i++)
        {
            bounds.Encapsulate(renderers[i].bounds);
        }
        return bounds;
    }

    // 检查两个对象是否重叠
    public static bool CheckOverlap(GameObject obj1, GameObject obj2)
    {
        Bounds bounds1 = GetRendererBounds(obj1);
        Bounds bounds2 = GetRendererBounds(obj2);
        return bounds1.Intersects(bounds2);
    }

    // 获取对象的中心点
    public static Vector3 GetCenterPoint(GameObject obj)
    {
        Bounds bounds = GetRendererBounds(obj);
        return bounds.center;
    }
}
```

### Transform动画和插值

```csharp
using UnityEngine;

public class TransformAnimation : MonoBehaviour
{
    [Header("动画设置")]
    public AnimationCurve positionCurve = AnimationCurve.EaseInOut(0, 0, 1, 1);
    public float animationDuration = 2.0f;
    public bool loopAnimation = true;

    private Vector3 startPos;
    private Quaternion startRot;
    private Vector3 endPos;
    private Quaternion endRot;
    private float animationTime = 0f;
    private bool isAnimating = false;

    void Start()
    {
        startPos = transform.position;
        startRot = transform.rotation;
        endPos = startPos + Vector3.right * 5f;
        endRot = startRot * Quaternion.Euler(0, 90, 0);
    }

    void Update()
    {
        if (isAnimating)
        {
            AnimateTransform();
        }
    }

    // 开始动画
    public void StartAnimation()
    {
        animationTime = 0f;
        isAnimating = true;
    }

    // 动画更新
    void AnimateTransform()
    {
        animationTime += Time.deltaTime;
        float progress = Mathf.Clamp01(animationTime / animationDuration);

        // 使用动画曲线
        float curvedProgress = positionCurve.Evaluate(progress);

        // 位置插值
        transform.position = Vector3.Lerp(startPos, endPos, curvedProgress);

        // 旋转插值
        transform.rotation = Quaternion.Slerp(startRot, endRot, curvedProgress);

        if (progress >= 1f)
        {
            if (loopAnimation)
            {
                // 循环动画：交换起始和结束位置
                Vector3 tempPos = startPos;
                Quaternion tempRot = startRot;
                startPos = endPos;
                startRot = endRot;
                endPos = tempPos;
                endRot = tempRot;
                animationTime = 0f;
            }
            else
            {
                isAnimating = false;
            }
        }
    }

    // 平滑跟随
    public void SmoothFollow(Transform target, float smoothTime = 0.3f)
    {
        if (target != null)
        {
            transform.position = Vector3.SmoothDamp(transform.position, 
                                                  target.position, 
                                                  ref velocity, 
                                                  smoothTime);
        }
    }

    // 弹簧效果
    public void SpringFollow(Transform target, float stiffness = 10f, float damping = 1f)
    {
        if (target != null)
        {
            Vector3 force = (target.position - transform.position) * stiffness;
            velocity += force * Time.deltaTime;
            velocity *= Mathf.Exp(-damping * Time.deltaTime); // 阻尼
            transform.position += velocity * Time.deltaTime;
        }
    }

    private Vector3 velocity = Vector3.zero;

    // 旋转动画
    public void RotateOverTime(Vector3 axis, float degreesPerSecond)
    {
        transform.Rotate(axis, degreesPerSecond * Time.deltaTime);
    }

    // 缓动函数
    public static class Easing
    {
        public static float EaseInQuad(float t) => t * t;
        public static float EaseOutQuad(float t) => t * (2 - t);
        public static float EaseInOutQuad(float t) => t < 0.5f ? 2 * t * t : -1 + (4 - 2 * t) * t;
        public static float EaseInCubic(float t) => t * t * t;
        public static float EaseOutCubic(float t) => 1 + (--t) * t * t;
    }
}
```

---

## 输入系统

### 传统输入系统

Unity提供了多种输入检测方式，从简单的按键检测到复杂的输入管理。

```csharp
using UnityEngine;

public class InputSystemDemo : MonoBehaviour
{
    [Header("移动设置")]
    public float moveSpeed = 5.0f;
    public float mouseSensitivity = 2.0f;

    [Header("输入轴映射")]
    public string horizontalAxis = "Horizontal";
    public string verticalAxis = "Vertical";
    public string jumpButton = "Jump";
    public string fireButton = "Fire1";

    private float mouseX = 0f;
    private float mouseY = 0f;
    private bool isJumping = false;

    void Update()
    {
        HandleKeyboardInput();
        HandleMouseInput();
        HandleGamepadInput();
        HandleTouchInput();
    }

    // 键盘输入处理
    void HandleKeyboardInput()
    {
        // 按键按下（每帧检测）
        if (Input.GetKeyDown(KeyCode.Space))
        {
            Jump();
        }

        // 按键持续按下
        if (Input.GetKey(KeyCode.LeftShift))
        {
            moveSpeed *= 2f; // 加速
        }

        // 按键抬起
        if (Input.GetKeyUp(KeyCode.Space))
        {
            isJumping = false;
        }

        // 轴输入（推荐用于平滑移动）
        float horizontal = Input.GetAxis(horizontalAxis);
        float vertical = Input.GetAxis(verticalAxis);

        Vector3 movement = new Vector3(horizontal, 0, vertical) * moveSpeed * Time.deltaTime;
        transform.Translate(movement);

        // 获取特定按键状态
        bool jumpPressed = Input.GetButton(jumpButton);
        bool firePressed = Input.GetButton(fireButton);
    }

    // 鼠标输入处理
    void HandleMouseInput()
    {
        // 鼠标按键
        if (Input.GetMouseButtonDown(0)) // 左键
        {
            Debug.Log("左键按下");
        }

        if (Input.GetMouseButton(1)) // 右键持续按下
        {
            // 相机旋转
            mouseX = Input.GetAxis("Mouse X") * mouseSensitivity;
            mouseY = Input.GetAxis("Mouse Y") * mouseSensitivity;
            
            transform.Rotate(Vector3.down, mouseX);
            Camera.main.transform.Rotate(Vector3.right, -mouseY);
        }

        // 鼠标滚轮
        float scroll = Input.GetAxis("Mouse ScrollWheel");
        if (Mathf.Abs(scroll) > 0.01f)
        {
            Debug.Log($"滚轮滚动: {scroll}");
        }

        // 鼠标位置
        Vector3 mousePos = Input.mousePosition;
        Vector3 worldPos = Camera.main.ScreenToWorldPoint(
            new Vector3(mousePos.x, mousePos.y, Camera.main.nearClipPlane));
    }

    // 手柄输入处理
    void HandleGamepadInput()
    {
        // 手柄轴
        float leftStickX = Input.GetAxis("Left Stick X");
        float leftStickY = Input.GetAxis("Left Stick Y");
        float rightStickX = Input.GetAxis("Right Stick X");
        float rightStickY = Input.GetAxis("Right Stick Y");

        // 手柄按钮 (通常为0-19)
        if (Input.GetButtonDown("joystick button 0")) // A/X按钮
        {
            Debug.Log("A按钮按下");
        }

        // 触发器
        float leftTrigger = Input.GetAxis("Left Trigger");
        float rightTrigger = Input.GetAxis("Right Trigger");
    }

    // 触摸输入处理（移动端）
    void HandleTouchInput()
    {
        if (Input.touchSupported && Input.touchCount > 0)
        {
            Touch touch = Input.GetTouch(0);

            switch (touch.phase)
            {
                case TouchPhase.Began:
                    Debug.Log("触摸开始");
                    break;
                case TouchPhase.Moved:
                    Debug.Log($"触摸移动: {touch.deltaPosition}");
                    break;
                case TouchPhase.Ended:
                    Debug.Log("触摸结束");
                    break;
                case TouchPhase.Canceled:
                    Debug.Log("触摸取消");
                    break;
            }

            // 多点触控
            if (Input.touchCount >= 2)
            {
                Touch touch1 = Input.GetTouch(0);
                Touch touch2 = Input.GetTouch(1);

                // 计算两点间距离，用于缩放
                float currentDist = Vector2.Distance(touch1.position, touch2.position);
                
                if (touch1.phase == TouchPhase.Moved || touch2.phase == TouchPhase.Moved)
                {
                    // 实现缩放逻辑
                }
            }
        }
    }

    void Jump()
    {
        if (!isJumping)
        {
            isJumping = true;
            // 实现跳跃逻辑
            Debug.Log("跳跃!");
        }
    }
}
```

### 新输入系统 (New Input System)

Unity的新输入系统提供了更灵活和强大的输入管理。

```csharp
// 注意：新输入系统需要导入Package: "Input System"
// 以下代码展示概念，实际使用需要设置Input Actions

/*
using UnityEngine;
using UnityEngine.InputSystem;

public class NewInputSystemDemo : MonoBehaviour
{
    [Header("移动设置")]
    public float moveSpeed = 5.0f;

    private PlayerInput playerInput;
    private InputAction moveAction;
    private InputAction jumpAction;
    private InputAction fireAction;

    void Awake()
    {
        playerInput = new PlayerInput();
    }

    void OnEnable()
    {
        moveAction = playerInput.Player.Move;
        jumpAction = playerInput.Player.Jump;
        fireAction = playerInput.Player.Fire;

        moveAction.Enable();
        jumpAction.Enable();
        fireAction.Enable();

        jumpAction.performed += _ => Jump();
        fireAction.performed += _ => Fire();
    }

    void OnDisable()
    {
        moveAction.Disable();
        jumpAction.Disable();
        fireAction.Disable();
    }

    void Update()
    {
        // 获取移动向量
        Vector2 moveInput = moveAction.ReadValue<Vector2>();
        Vector3 movement = new Vector3(moveInput.x, 0, moveInput.y) * moveSpeed * Time.deltaTime;
        transform.Translate(movement);
    }

    void Jump()
    {
        Debug.Log("跳跃!");
    }

    void Fire()
    {
        Debug.Log("开火!");
    }
}
*/
```

### 输入管理器

```csharp
using UnityEngine;

// 输入管理器单例
public class InputManager : MonoBehaviour
{
    public static InputManager Instance { get; private set; }

    [Header("移动控制")]
    public string horizontalAxis = "Horizontal";
    public string verticalAxis = "Vertical";
    
    [Header("动作控制")]
    public string jumpButton = "Jump";
    public string fireButton = "Fire1";
    public string interactButton = "Interact";

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

    // 获取轴输入
    public float GetHorizontalAxis() => Input.GetAxis(horizontalAxis);
    public float GetVerticalAxis() => Input.GetAxis(verticalAxis);
    public Vector2 GetMovementVector() => new Vector2(GetHorizontalAxis(), GetVerticalAxis());

    // 获取按钮状态
    public bool IsJumpPressed() => Input.GetButtonDown(jumpButton);
    public bool IsFirePressed() => Input.GetButtonDown(fireButton);
    public bool IsInteractPressed() => Input.GetButtonDown(interactButton);

    // 获取持续按钮状态
    public bool IsJumpHeld() => Input.GetButton(jumpButton);
    public bool IsFireHeld() => Input.GetButton(fireButton);

    // 获取按钮抬起状态
    public bool IsJumpReleased() => Input.GetButtonUp(jumpButton);

    // 复合输入检测
    public bool IsMoving() => Mathf.Abs(GetHorizontalAxis()) > 0.1f || Mathf.Abs(GetVerticalAxis()) > 0.1f;
    public bool IsSprinting() => Input.GetKey(KeyCode.LeftShift) || Input.GetKey(KeyCode.RightShift);
    public bool IsCrouching() => Input.GetKey(KeyCode.LeftControl) || Input.GetKey(KeyCode.RightControl);

    // 鼠标输入
    public Vector2 GetMouseDelta() => new Vector2(Input.GetAxis("Mouse X"), Input.GetAxis("Mouse Y"));
    public bool IsLeftMousePressed() => Input.GetMouseButtonDown(0);
    public bool IsRightMousePressed() => Input.GetMouseButtonDown(1);
    public Vector3 GetMousePosition() => Input.mousePosition;

    // 触摸输入
    public bool IsTouchSupported() => Input.touchSupported;
    public int GetTouchCount() => Input.touchCount;
    public Touch? GetTouch(int index)
    {
        if (Input.touchCount > index)
            return Input.GetTouch(index);
        return null;
    }

    // 输入设备检测
    public string[] GetConnectedInputDevices()
    {
        return Input.GetJoystickNames();
    }

    public bool IsGamepadConnected()
    {
        string[] joysticks = Input.GetJoystickNames();
        return joysticks.Length > 0 && !string.IsNullOrEmpty(joysticks[0]);
    }
}

// 使用输入管理器的示例
public class PlayerWithInputManager : MonoBehaviour
{
    [Header("移动设置")]
    public float moveSpeed = 5.0f;
    public float rotateSpeed = 60.0f;

    void Update()
    {
        HandleMovement();
        HandleActions();
    }

    void HandleMovement()
    {
        Vector2 moveInput = InputManager.Instance.GetMovementVector();
        Vector3 movement = new Vector3(moveInput.x, 0, moveInput.y) * moveSpeed * Time.deltaTime;
        transform.Translate(movement);

        if (InputManager.Instance.IsMoving())
        {
            // 根据移动方向旋转角色
            if (moveInput.magnitude > 0.1f)
            {
                float targetAngle = Mathf.Atan2(moveInput.x, moveInput.y) * Mathf.Rad2Deg;
                transform.rotation = Quaternion.Slerp(
                    transform.rotation, 
                    Quaternion.Euler(0, targetAngle, 0), 
                    rotateSpeed * Time.deltaTime
                );
            }
        }
    }

    void HandleActions()
    {
        if (InputManager.Instance.IsJumpPressed())
        {
            Jump();
        }

        if (InputManager.Instance.IsFirePressed())
        {
            Fire();
        }

        if (InputManager.Instance.IsInteractPressed())
        {
            Interact();
        }
    }

    void Jump()
    {
        Debug.Log("玩家跳跃!");
    }

    void Fire()
    {
        Debug.Log("玩家开火!");
    }

    void Interact()
    {
        Debug.Log("玩家交互!");
    }
}
```

---

## Time和帧率控制

### Time类详解

Time类提供了游戏时间相关的各种信息和控制。

```csharp
using UnityEngine;

public class TimeSystemDemo : MonoBehaviour
{
    [Header("时间设置")]
    public float gameSpeed = 1.0f;
    public float slowMotionFactor = 0.1f;

    [Header("计时器")]
    public float timerDuration = 10.0f;
    private float timer = 0f;
    private bool timerRunning = false;

    void Start()
    {
        PrintTimeInfo();
    }

    void Update()
    {
        UpdateTimer();
        HandleTimeControls();
        
        // 基于时间的移动（重要：使用Time.deltaTime）
        transform.Translate(Vector3.forward * 5f * Time.deltaTime);
    }

    // 时间信息
    void PrintTimeInfo()
    {
        Debug.Log($"=== 时间信息 ===");
        Debug.Log($"当前时间: {Time.time:F2}s");
        Debug.Log($"帧时间: {Time.deltaTime:F4}s");
        Debug.Log($"固定时间步长: {Time.fixedDeltaTime:F4}s");
        Debug.Log($"时间缩放: {Time.timeScale:F2}");
        Debug.Log($"帧率: {1.0f / Time.deltaTime:F1} FPS");
    }

    // Time类的主要属性
    void TimeProperties()
    {
        // 从游戏开始的总时间
        float totalTime = Time.time;
        
        // 上一帧到当前帧的时间（秒）
        float deltaTime = Time.deltaTime;
        
        // 固定更新的时间间隔
        float fixedDeltaTime = Time.fixedDeltaTime;
        
        // 时间缩放因子（用于慢动作等效果）
        float timeScale = Time.timeScale;
        
        // 未缩放的时间（不受timeScale影响）
        float unscaledTime = Time.unscaledTime;
        float unscaledDeltaTime = Time.unscaledDeltaTime;
        
        // 自游戏开始的总帧数
        int frameCount = Time.frameCount;
        
        // 固定更新调用次数
        int fixedFrameCount = Time.fixedFrameCount;
        
        // 目标帧率
        int targetFrameRate = Application.targetFrameRate;
    }

    // 时间缩放控制
    void HandleTimeControls()
    {
        if (Input.GetKeyDown(KeyCode.Space))
        {
            // 慢动作效果
            Time.timeScale = slowMotionFactor;
        }
        
        if (Input.GetKeyUp(KeyCode.Space))
        {
            // 恢复正常速度
            Time.timeScale = 1.0f;
        }
        
        if (Input.GetKeyDown(KeyCode.Alpha1))
        {
            // 暂停游戏
            Time.timeScale = 0f;
        }
        
        if (Input.GetKeyDown(KeyCode.Alpha2))
        {
            // 正常速度
            Time.timeScale = 1.0f;
        }
        
        if (Input.GetKeyDown(KeyCode.Alpha3))
        {
            // 2倍速
            Time.timeScale = 2.0f;
        }
    }

    // 计时器功能
    void UpdateTimer()
    {
        if (timerRunning)
        {
            timer += Time.unscaledDeltaTime; // 使用未缩放时间确保计时准确性
            
            if (timer >= timerDuration)
            {
                TimerComplete();
            }
        }
    }

    public void StartTimer()
    {
        timer = 0f;
        timerRunning = true;
    }

    public void StopTimer()
    {
        timerRunning = false;
    }

    public void ResetTimer()
    {
        timer = 0f;
        timerRunning = false;
    }

    void TimerComplete()
    {
        Debug.Log("计时器完成!");
        timerRunning = false;
        
        // 可以触发其他事件
        OnTimerComplete();
    }

    void OnTimerComplete()
    {
        // 计时器完成时的回调
    }

    // 帧率控制
    void FrameRateControl()
    {
        // 设置目标帧率
        Application.targetFrameRate = 60; // 60 FPS
        
        // 获取当前帧率
        float currentFPS = 1.0f / Time.deltaTime;
        
        // VSync控制
        QualitySettings.vSyncCount = 1; // 启用垂直同步
    }

    // 基于时间的平滑移动示例
    public void SmoothMoveTo(Vector3 targetPosition, float duration)
    {
        StartCoroutine(SmoothMoveCoroutine(targetPosition, duration));
    }

    System.Collections.IEnumerator SmoothMoveCoroutine(Vector3 target, float duration)
    {
        Vector3 startPosition = transform.position;
        float elapsed = 0f;

        while (elapsed < duration)
        {
            transform.position = Vector3.Lerp(startPosition, target, 
                                            elapsed / duration);
            elapsed += Time.deltaTime;
            yield return null;
        }

        transform.position = target;
    }

    // 固定时间步长的重要性
    void FixedUpdate()
    {
        // 物理更新应该使用Time.fixedDeltaTime
        // 这确保了物理计算的稳定性
        rb.velocity = movementDirection * speed * Time.fixedDeltaTime;
    }

    private Rigidbody rb;
    private Vector3 movementDirection = Vector3.forward;
    private float speed = 5.0f;
}
```

### 时间管理最佳实践

```csharp
using UnityEngine;

public class TimeManagementBestPractices : MonoBehaviour
{
    [Header("游戏状态")]
    public GameState gameState = GameState.Playing;

    [Header("时间设置")]
    public float normalTimeScale = 1.0f;
    public float pauseTimeScale = 0.0f;
    public float slowMotionScale = 0.25f;

    private float normalFixedDeltaTime;
    private TimeManager timeManager;

    void Start()
    {
        // 保存正常的固定时间步长
        normalFixedDeltaTime = Time.fixedDeltaTime;
        timeManager = new TimeManager();
    }

    void Update()
    {
        HandleGameStateChanges();
        UpdateGameLogic();
    }

    // 游戏状态时间管理
    void HandleGameStateChanges()
    {
        switch (gameState)
        {
            case GameState.Paused:
                Time.timeScale = pauseTimeScale;
                Time.fixedDeltaTime = normalFixedDeltaTime * pauseTimeScale;
                break;
            case GameState.SlowMotion:
                Time.timeScale = slowMotionScale;
                Time.fixedDeltaTime = normalFixedDeltaTime * slowMotionScale;
                break;
            case GameState.Playing:
                Time.timeScale = normalTimeScale;
                Time.fixedDeltaTime = normalFixedDeltaTime;
                break;
        }
    }

    // 游戏逻辑更新（使用时间管理）
    void UpdateGameLogic()
    {
        switch (gameState)
        {
            case GameState.Playing:
                // 正常游戏逻辑
                ProcessGameplay();
                break;
            case GameState.Paused:
                // 暂停状态逻辑（如果有）
                ProcessPauseLogic();
                break;
            case GameState.SlowMotion:
                // 慢动作逻辑
                ProcessSlowMotion();
                break;
        }
    }

    void ProcessGameplay()
    {
        // 正常游戏逻辑
        // 使用Time.deltaTime进行时间相关的计算
        transform.Translate(Vector3.forward * 5f * Time.deltaTime);
    }

    void ProcessPauseLogic()
    {
        // 暂停时的特殊逻辑
        // 注意：在暂停状态下，Time.deltaTime为0
    }

    void ProcessSlowMotion()
    {
        // 慢动作时的特殊逻辑
        // 所有使用Time.deltaTime的计算都会自动适应慢动作
    }

    // 时间管理器类
    public class TimeManager
    {
        public float GameTime { get; private set; }
        public float RealTime { get; private set; }
        public float TimeScale { get; private set; } = 1.0f;

        public void Update()
        {
            GameTime += Time.deltaTime;
            RealTime += Time.unscaledDeltaTime;
        }

        public void SetTimeScale(float scale)
        {
            TimeScale = Mathf.Clamp(scale, 0f, 10f);
            Time.timeScale = TimeScale;
        }

        public void Pause()
        {
            SetTimeScale(0f);
        }

        public void Resume()
        {
            SetTimeScale(1f);
        }

        public void SlowMotion(float factor)
        {
            SetTimeScale(factor);
        }
    }

    // 时间相关的工具方法
    public static class TimeUtils
    {
        // 格式化时间显示
        public static string FormatTime(float seconds)
        {
            int minutes = Mathf.FloorToInt(seconds / 60F);
            int remainingSeconds = Mathf.FloorToInt(seconds - minutes * 60);
            return string.Format("{0:00}:{1:00}", minutes, remainingSeconds);
        }

        // 平滑时间缩放
        public static void SmoothTimeScale(float targetScale, float duration)
        {
            // 这里可以实现平滑的时间缩放过渡
        }

        // 检查是否为固定更新帧
        public static bool IsFixedUpdateFrame()
        {
            return Time.frameCount % Mathf.RoundToInt(1f / Time.fixedDeltaTime) == 0;
        }
    }

    // 状态枚举
    public enum GameState
    {
        Playing,
        Paused,
        SlowMotion,
        GameOver
    }
}
```

---

## Unity中的C#实践

### Unity特有的C#模式

```csharp
using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public class UnityCSharpPatterns : MonoBehaviour
{
    // 单例模式
    public class Singleton<T> where T : MonoBehaviour
    {
        private static T _instance;
        private static readonly object _lock = new object();

        public static T Instance
        {
            get
            {
                if (_instance == null)
                {
                    lock (_lock)
                    {
                        if (_instance == null)
                        {
                            GameObject singletonObject = new GameObject(typeof(T).Name);
                            _instance = singletonObject.AddComponent<T>();
                        }
                    }
                }
                return _instance;
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
    }

    // 对象池模式
    public class ObjectPool<T> where T : Component
    {
        private Queue<T> pool;
        private T prefab;
        private Transform parent;

        public ObjectPool(T prefab, int initialSize, Transform parent = null)
        {
            this.prefab = prefab;
            this.parent = parent;
            pool = new Queue<T>();

            for (int i = 0; i < initialSize; i++)
            {
                CreateNewObject();
            }
        }

        public T GetObject()
        {
            T obj;
            if (pool.Count > 0)
            {
                obj = pool.Dequeue();
                obj.gameObject.SetActive(true);
            }
            else
            {
                obj = CreateNewObject();
            }

            return obj;
        }

        public void ReturnObject(T obj)
        {
            obj.gameObject.SetActive(false);
            obj.transform.SetParent(parent);
            pool.Enqueue(obj);
        }

        private T CreateNewObject()
        {
            T newObj = GameObject.Instantiate(prefab);
            newObj.transform.SetParent(parent);
            newObj.gameObject.SetActive(false);
            return newObj;
        }
    }

    // 事件系统
    public static class GameEvents
    {
        public static System.Action OnGameStart;
        public static System.Action OnGameEnd;
        public static System.Action<int> OnScoreChanged;
        public static System.Action<GameObject> OnPlayerDeath;
        public static System.Action<string, object> OnCustomEvent;

        public static void TriggerGameStart()
        {
            OnGameStart?.Invoke();
        }

        public static void TriggerScoreChanged(int newScore)
        {
            OnScoreChanged?.Invoke(newScore);
        }

        public static void TriggerPlayerDeath(GameObject player)
        {
            OnPlayerDeath?.Invoke(player);
        }

        public static void TriggerCustomEvent(string eventName, object data)
        {
            OnCustomEvent?.Invoke(eventName, data);
        }
    }

    // 状态机模式
    public abstract class GameState
    {
        public abstract void Enter();
        public abstract void Execute();
        public abstract void Exit();
    }

    public class PlayState : GameState
    {
        public override void Enter()
        {
            Debug.Log("进入游戏状态");
        }

        public override void Execute()
        {
            // 游戏执行逻辑
        }

        public override void Exit()
        {
            Debug.Log("退出游戏状态");
        }
    }

    public class PauseState : GameState
    {
        public override void Enter()
        {
            Debug.Log("进入暂停状态");
            Time.timeScale = 0f;
        }

        public override void Execute()
        {
            // 暂停状态逻辑
        }

        public override void Exit()
        {
            Debug.Log("退出暂停状态");
            Time.timeScale = 1f;
        }
    }

    // 命令模式
    public interface ICommand
    {
        void Execute();
        void Undo();
    }

    public class MoveCommand : ICommand
    {
        private Transform transform;
        private Vector3 startPosition;
        private Vector3 endPosition;

        public MoveCommand(Transform transform, Vector3 endPosition)
        {
            this.transform = transform;
            this.startPosition = transform.position;
            this.endPosition = endPosition;
        }

        public void Execute()
        {
            transform.position = endPosition;
        }

        public void Undo()
        {
            transform.position = startPosition;
        }
    }

    // 观察者模式
    public interface IObserver
    {
        void OnNotify(object data);
    }

    public class Subject
    {
        private List<IObserver> observers = new List<IObserver>();

        public void Attach(IObserver observer)
        {
            observers.Add(observer);
        }

        public void Detach(IObserver observer)
        {
            observers.Remove(observer);
        }

        public void Notify(object data)
        {
            foreach (var observer in observers)
            {
                observer.OnNotify(data);
            }
        }
    }
}

// 使用示例
public class GameSystemExample : MonoBehaviour
{
    private UnityCSharpPatterns.ObjectPool<GameObject> objectPool;
    private Queue<UnityCSharpPatterns.ICommand> commandHistory = new Queue<UnityCSharpPatterns.ICommand>();

    void Start()
    {
        // 初始化对象池
        GameObject prefab = GameObject.CreatePrimitive(PrimitiveType.Cube);
        objectPool = new UnityCSharpPatterns.ObjectPool<GameObject>(prefab, 10, transform);

        // 订阅游戏事件
        UnityCSharpPatterns.GameEvents.OnScoreChanged += OnScoreChanged;
        UnityCSharpPatterns.GameEvents.OnPlayerDeath += OnPlayerDeath;
    }

    void Update()
    {
        if (Input.GetKeyDown(KeyCode.Space))
        {
            // 从对象池获取对象
            GameObject obj = objectPool.GetObject();
            obj.transform.position = transform.position + Random.insideUnitSphere * 5f;

            // 执行移动命令
            UnityCSharpPatterns.MoveCommand moveCmd = new UnityCSharpPatterns.MoveCommand(
                obj.transform, obj.transform.position + Vector3.up * 5f);
            moveCmd.Execute();
            commandHistory.Enqueue(moveCmd);
        }

        if (Input.GetKeyDown(KeyCode.Z) && Input.GetKey(KeyCode.LeftControl))
        {
            // 撤销命令
            if (commandHistory.Count > 0)
            {
                UnityCSharpPatterns.ICommand lastCommand = commandHistory.Dequeue();
                lastCommand.Undo();
            }
        }
    }

    void OnScoreChanged(int newScore)
    {
        Debug.Log($"分数更新: {newScore}");
    }

    void OnPlayerDeath(GameObject player)
    {
        Debug.Log($"玩家死亡: {player.name}");
        
        // 将对象返回池中而不是销毁
        StartCoroutine(ReturnToPoolAfterDelay(player));
    }

    IEnumerator ReturnToPoolAfterDelay(GameObject obj)
    {
        yield return new WaitForSeconds(1f);
        // objectPool.ReturnObject(obj.GetComponent<GameObject>()); // 需要适当调整
    }

    void OnDestroy()
    {
        // 取消事件订阅
        UnityCSharpPatterns.GameEvents.OnScoreChanged -= OnScoreChanged;
        UnityCSharpPatterns.GameEvents.OnPlayerDeath -= OnPlayerDeath;
    }
}
```

### Unity协程和异步编程

```csharp
using UnityEngine;
using System.Collections;

public class CoroutineAsyncDemo : MonoBehaviour
{
    [Header("协程设置")]
    public float waitDuration = 2.0f;

    void Start()
    {
        // 启动各种协程
        StartCoroutine(DelayedAction());
        StartCoroutine(RepeatAction());
        StartCoroutine(SequenceActions());
    }

    // 延迟执行协程
    IEnumerator DelayedAction()
    {
        Debug.Log("开始等待...");
        yield return new WaitForSeconds(waitDuration);
        Debug.Log("等待结束，执行操作");
        
        // 执行具体操作
        PerformAction();
    }

    // 重复执行协程
    IEnumerator RepeatAction()
    {
        while (true) // 注意：需要适当的退出条件
        {
            Debug.Log($"重复操作执行 - 时间: {Time.time:F2}");
            yield return new WaitForSeconds(1.0f); // 每秒执行一次
        }
    }

    // 序列执行多个操作
    IEnumerator SequenceActions()
    {
        Debug.Log("序列开始");
        
        yield return StartCoroutine(Action1());
        yield return StartCoroutine(Action2());
        yield return StartCoroutine(Action3());
        
        Debug.Log("序列结束");
    }

    IEnumerator Action1()
    {
        Debug.Log("执行操作1");
        yield return new WaitForSeconds(0.5f);
    }

    IEnumerator Action2()
 {
        Debug.Log("执行操作2");
        yield return new WaitForSeconds(0.5f);
    }

    IEnumerator Action3()
    {
        Debug.Log("执行操作3");
        yield return new WaitForSeconds(0.5f);
    }

    // 条件等待协程
    IEnumerator WaitForCondition()
    {
        Debug.Log("等待条件满足...");
        
        // 等待直到某个条件为真
        while (transform.position.y < 5f)
        {
            yield return null; // 等待下一帧
        }
        
        Debug.Log("条件满足！");
    }

    // 等待动画结束
    IEnumerator WaitForAnimation(Animator animator)
    {
        if (animator != null)
        {
            // 等待特定动画状态结束
            while (animator.GetCurrentAnimatorStateInfo(0).normalizedTime < 1.0f)
            {
                yield return null;
            }
            Debug.Log("动画播放完成");
        }
    }

    // 等待WWW/UnityWebRequest完成
    /*
    IEnumerator DownloadData(string url)
    {
        using (UnityWebRequest webRequest = UnityWebRequest.Get(url))
        {
            yield return webRequest.SendWebRequest();

            if (webRequest.result == UnityWebRequest.Result.Success)
            {
                string response = webRequest.downloadHandler.text;
                Debug.Log($"下载完成: {response}");
            }
            else
            {
                Debug.Log($"下载失败: {webRequest.error}");
            }
        }
    }
    */

    // 协程管理器
    private List<Coroutine> activeCoroutines = new List<Coroutine>();

    public Coroutine StartManagedCoroutine(IEnumerator routine)
    {
        Coroutine coroutine = StartCoroutine(routine);
        activeCoroutines.Add(coroutine);
        return coroutine;
    }

    public void StopManagedCoroutine(Coroutine coroutine)
    {
        if (activeCoroutines.Contains(coroutine))
        {
            StopCoroutine(coroutine);
            activeCoroutines.Remove(coroutine);
        }
    }

    public void StopAllManagedCoroutines()
    {
        foreach (Coroutine coroutine in activeCoroutines)
        {
            StopCoroutine(coroutine);
        }
        activeCoroutines.Clear();
    }

    // 性能优化的等待
    void PerformanceOptimizedWaits()
    {
        // 不同的等待类型：
        yield return null;                    // 等待下一帧
        yield return new WaitForSeconds(1f);  // 等待指定时间
        yield return new WaitForSecondsRealtime(1f); // 真实时间等待（不受timeScale影响）
        yield return new WaitForEndOfFrame(); // 等待渲染结束
        yield return new WaitForFixedUpdate(); // 等待固定更新
    }

    void PerformAction()
    {
        // 具体的操作实现
        transform.Rotate(Vector3.up, 45f);
    }

    void OnDestroy()
    {
        // 清理所有协程
        StopAllManagedCoroutines();
    }
}

// 异步方法示例（需要导入using System.Threading.Tasks;）
/*
public class AsyncMethodsDemo : MonoBehaviour
{
    async void Start()
    {
        await LoadGameDataAsync();
        await InitializeGameAsync();
        StartGame();
    }

    async Task LoadGameDataAsync()
    {
        await Task.Delay(2000); // 模拟加载时间
        Debug.Log("游戏数据加载完成");
    }

    async Task InitializeGameAsync()
    {
        await Task.Delay(1000); // 模拟初始化时间
        Debug.Log("游戏初始化完成");
    }

    void StartGame()
    {
        Debug.Log("游戏开始！");
    }
}
*/
```

### Unity调试和性能优化

```csharp
using UnityEngine;
#if UNITY_EDITOR
using UnityEditor;
#endif

public class UnityDebugging : MonoBehaviour
{
    [Header("调试设置")]
    public bool enableDebug = true;
    public bool showGizmos = true;
    public Color gizmoColor = Color.yellow;

    [Header("性能监控")]
    public bool enablePerformanceMonitor = true;
    private float lastUpdateTime = 0f;
    private int frameCount = 0;
    private float fps = 0f;

    void Update()
    {
        if (enablePerformanceMonitor)
        {
            UpdatePerformanceStats();
        }
    }

    void UpdatePerformanceStats()
    {
        frameCount++;
        if (Time.time >= lastUpdateTime + 1f)
        {
            fps = frameCount / (Time.time - lastUpdateTime);
            frameCount = 0;
            lastUpdateTime = Time.time;
            
            if (enableDebug)
            {
                Debug.Log($"FPS: {fps:F1}");
            }
        }
    }

    // 调试方法
    void DebuggingMethods()
    {
        if (!enableDebug) return;

        // 不同类型的调试信息
        Debug.Log("普通信息");
        Debug.LogWarning("警告信息");
        Debug.LogError("错误信息");

        // 条件调试
        if (transform.position.y < 0)
        {
            Debug.LogError($"对象掉落到地下: {transform.position}");
        }

        // 断言
        Debug.Assert(transform != null, "Transform不能为空");

        // 绘制调试线
        Debug.DrawLine(transform.position, transform.position + transform.forward * 5f, Color.blue);

        // 绘制射线
        Debug.DrawRay(transform.position, transform.forward * 10f, Color.red);
    }

    // Gizmo绘制
    void OnDrawGizmos()
    {
        if (!showGizmos) return;

        Gizmos.color = gizmoColor;
        
        // 绘制对象的范围
        Gizmos.DrawWireSphere(transform.position, 1f);
        
        // 绘制朝向
        Gizmos.DrawLine(transform.position, transform.position + transform.forward * 3f);
        
        // 绘制边界框
        Gizmos.DrawWireCube(transform.position, Vector3.one * 2f);
    }

    // 性能优化技巧
    void PerformanceOptimizations()
    {
        // 1. 缓存组件引用
        // 而不是每次Update都GetComponent
        Rigidbody rb = GetComponent<Rigidbody>(); // 在Start或Awake中获取

        // 2. 对象池
        // 而不是频繁创建销毁对象

        // 3. 减少Update中的计算
        // 使用计时器减少执行频率
        if (Time.time - lastUpdateTime > 0.1f)
        {
            // 执行不需要每帧执行的操作
            lastUpdateTime = Time.time;
        }

        // 4. 使用对象引用而不是字符串查找
        // GameObject.Find很慢，缓存引用更好

        // 5. 优化循环
        // 缓存数组长度
        Transform[] children = new Transform[transform.childCount];
        for (int i = 0; i < transform.childCount; i++)
        {
            children[i] = transform.GetChild(i);
        }
    }

    // 内存管理
    void MemoryManagement()
    {
        // 及时清理引用
        // GameObject.Destroy(object); // Unity会自动处理

        // 清理事件订阅
        // eventHandler -= handlerMethod;

        // 清理协程
        // StopCoroutine(coroutineName);
    }
}

// 编辑器专用调试工具
#if UNITY_EDITOR
[CustomEditor(typeof(UnityDebugging))]
public class UnityDebuggingEditor : Editor
{
    public override void OnInspectorGUI()
    {
        DrawDefaultInspector();

        UnityDebugging debugScript = (UnityDebugging)target;

        if (GUILayout.Button("Force GC"))
        {
            System.GC.Collect();
        }

        if (GUILayout.Button("Log Scene Info"))
        {
            Debug.Log($"Active Scene: {UnityEngine.SceneManagement.SceneManager.GetActiveScene().name}");
            Debug.Log($"Loaded Scenes: {UnityEngine.SceneManagement.SceneManager.sceneCount}");
        }
    }
}
#endif
```

---

## 实践练习

### 练习1: 简单的玩家控制器

```csharp
using UnityEngine;

public class SimplePlayerController : MonoBehaviour
{
    [Header("移动设置")]
    public float moveSpeed = 5.0f;
    public float jumpForce = 10.0f;
    public float gravity = -9.81f;

    [Header("地面检测")]
    public Transform groundCheck;
    public float groundDistance = 0.4f;
    public LayerMask groundMask;

    private CharacterController controller;
    private Vector3 velocity;
    private bool isGrounded;

    void Start()
    {
        controller = GetComponent<CharacterController>();
        
        // 设置地面检测点
        if (groundCheck == null)
        {
            groundCheck = new GameObject("GroundCheck").transform;
            groundCheck.SetParent(transform);
            groundCheck.localPosition = new Vector3(0, -transform.localScale.y / 2 - 0.1f, 0);
        }
    }

    void Update()
    {
        // 地面检测
        isGrounded = Physics.CheckSphere(groundCheck.position, groundDistance, groundMask);
        
        if (isGrounded && velocity.y < 0)
        {
            velocity.y = -2f;
        }

        // 移动输入
        float x = Input.GetAxis("Horizontal");
        float z = Input.GetAxis("Vertical");

        Vector3 move = transform.right * x + transform.forward * z;

        controller.Move(move * moveSpeed * Time.deltaTime);

        // 跳跃
        if (Input.GetButtonDown("Jump") && isGrounded)
        {
            velocity.y = Mathf.Sqrt(jumpForce * -2f * gravity);
        }

        // 重力
        velocity.y += gravity * Time.deltaTime;
        controller.Move(velocity * Time.deltaTime);
    }

    // 地面检测Gizmo
    void OnDrawGizmosSelected()
    {
        if (groundCheck != null)
        {
            Gizmos.color = isGrounded ? Color.green : Color.red;
            Gizmos.DrawSphere(groundCheck.position, groundDistance);
        }
    }
}
```

### 练习2: 敌人AI系统

```csharp
using UnityEngine;
using System.Collections;

public class EnemyAI : MonoBehaviour
{
    [Header("AI设置")]
    public float detectionRange = 10f;
    public float attackRange = 2f;
    public float moveSpeed = 3f;
    public float rotationSpeed = 5f;
    public int damage = 20;
    public float health = 100f;

    [Header("巡逻设置")]
    public Transform[] patrolPoints;
    public float waitTime = 2f;
    public bool isPatrolling = true;

    private Transform player;
    private int currentPatrolIndex = 0;
    private bool isChasing = false;
    private bool isAttacking = false;

    void Start()
    {
        // 查找玩家
        GameObject playerObj = GameObject.FindGameObjectWithTag("Player");
        if (playerObj != null)
        {
            player = playerObj.transform;
        }

        if (isPatrolling && patrolPoints.Length > 0)
        {
            StartCoroutine(Patrol());
        }
    }

    void Update()
    {
        if (health <= 0)
        {
            Die();
            return;
        }

        if (player == null) return;

        float distanceToPlayer = Vector3.Distance(transform.position, player.position);

        if (distanceToPlayer <= detectionRange)
        {
            isChasing = true;
            StopCoroutine(Patrol());

            if (distanceToPlayer <= attackRange)
            {
                if (!isAttacking)
                {
                    StartCoroutine(Attack());
                }
            }
            else
            {
                isAttacking = false;
                ChasePlayer();
            }
        }
        else
        {
            isChasing = false;
            if (isPatrolling && patrolPoints.Length > 0 && !isAttacking)
            {
                StartCoroutine(Patrol());
            }
        }
    }

    void ChasePlayer()
    {
        Vector3 direction = (player.position - transform.position).normalized;
        transform.Translate(direction * moveSpeed * Time.deltaTime);
        
        // 朝向玩家
        Vector3 lookDirection = new Vector3(player.position.x, transform.position.y, player.position.z);
        transform.LookAt(lookDirection);
    }

    IEnumerator Attack()
    {
        isAttacking = true;
        
        // 攻击动画/效果
        Debug.Log($"{gameObject.name} 攻击玩家!");
        
        // 对玩家造成伤害（这里简化处理）
        if (player.GetComponent<SimplePlayerController>() != null)
        {
            // 实际伤害逻辑
        }

        yield return new WaitForSeconds(1f); // 攻击间隔
        isAttacking = false;
    }

    IEnumerator Patrol()
    {
        while (!isChasing && patrolPoints.Length > 0)
        {
            Transform targetPoint = patrolPoints[currentPatrolIndex];
            
            if (Vector3.Distance(transform.position, targetPoint.position) < 0.5f)
            {
                yield return new WaitForSeconds(waitTime);
                currentPatrolIndex = (currentPatrolIndex + 1) % patrolPoints.Length;
            }
            else
            {
                Vector3 direction = (targetPoint.position - transform.position).normalized;
                transform.Translate(direction * moveSpeed * Time.deltaTime);
                transform.LookAt(new Vector3(targetPoint.position.x, transform.position.y, targetPoint.position.z));
            }
            
            yield return null;
        }
    }

    public void TakeDamage(float damage)
    {
        health -= damage;
        Debug.Log($"{gameObject.name} 受到 {damage} 点伤害，剩余生命: {health}");

        if (health <= 0)
        {
            Die();
        }
    }

    void Die()
    {
        Debug.Log($"{gameObject.name} 被击败!");
        Destroy(gameObject);
    }

    // 可视化AI范围
    void OnDrawGizmos()
    {
        Gizmos.color = Color.yellow;
        Gizmos.DrawWireSphere(transform.position, detectionRange);
        
        Gizmos.color = Color.red;
        Gizmos.DrawWireSphere(transform.position, attackRange);
        
        // 巡逻路径
        if (patrolPoints != null && patrolPoints.Length > 1)
        {
            Gizmos.color = Color.blue;
            for (int i = 0; i < patrolPoints.Length; i++)
            {
                if (patrolPoints[i] != null)
                {
                    Gizmos.DrawSphere(patrolPoints[i].position, 0.3f);
                    
                    if (i > 0)
                    {
                        Gizmos.DrawLine(patrolPoints[i-1].position, patrolPoints[i].position);
                    }
                }
            }
            
            // 闭合路径
            if (patrolPoints.Length > 2 && patrolPoints[0] != null)
            {
                Gizmos.DrawLine(patrolPoints[patrolPoints.Length-1].position, patrolPoints[0].position);
            }
        }
    }
}
```

---

## 常见错误和最佳实践

### 1. 性能相关错误

```csharp
public class PerformanceBestPractices : MonoBehaviour
{
    // ❌ 错误：在Update中进行昂贵操作
    /*
    void Update()
    {
        GameObject player = GameObject.Find("Player"); // 很慢！
        Transform target = GameObject.FindGameObjectWithTag("Target").transform; // 很慢！
    }
    */

    // ✅ 正确：缓存引用
    private Transform playerTransform;
    private GameObject[] enemies;

    void Start()
    {
        // 缓存引用
        GameObject player = GameObject.FindGameObjectWithTag("Player");
        if (player != null)
        {
            playerTransform = player.transform;
        }
        
        // 一次性获取所有敌人
        enemies = GameObject.FindGameObjectsWithTag("Enemy");
    }

    void Update()
    {
        // 使用缓存的引用
        if (playerTransform != null)
        {
            // 操作playerTransform
        }
    }

    // ❌ 错误：频繁创建对象
    /*
    void Update()
    {
        GameObject effect = new GameObject(); // 每帧创建新对象
        Destroy(effect, 1f); // 造成GC压力
    }
    */

    // ✅ 正确：使用对象池
    // 使用前面定义的对象池模式

    // ❌ 错误：在循环中进行昂贵操作
    /*
    void Update()
    {
        for (int i = 0; i < transform.childCount; i++)
        {
            // GetComponent在循环中很昂贵
            var script = transform.GetChild(i).GetComponent<SomeComponent>();
        }
    }
    */

    // ✅ 正确：预先获取引用
    private SomeComponent[] childComponents;

    void CacheComponents()
    {
        childComponents = new SomeComponent[transform.childCount];
        for (int i = 0; i < transform.childCount; i++)
        {
            childComponents[i] = transform.GetChild(i).GetComponent<SomeComponent>();
        }
    }
}

// SomeComponent的占位符
public class SomeComponent : MonoBehaviour { }
```

### 2. 生命周期管理错误

```csharp
public class LifecycleManagement : MonoBehaviour
{
    private Coroutine animationCoroutine;
    private System.Action eventCallback;

    void Start()
    {
        // 订阅事件
        SomeEventManager.OnEvent += HandleEvent;
    }

    // ✅ 正确：在OnDestroy中清理
    void OnDestroy()
    {
        // 取消事件订阅
        SomeEventManager.OnEvent -= HandleEvent;
        
        // 停止协程
        if (animationCoroutine != null)
        {
            StopCoroutine(animationCoroutine);
        }
        
        // 清理回调
        eventCallback = null;
    }

    void HandleEvent()
    {
        // 事件处理逻辑
    }
}

// 事件管理器占位符
public static class SomeEventManager
{
    public static event System.Action OnEvent;
}
```

### 3. Transform操作最佳实践

```csharp
public class TransformBestPractices : MonoBehaviour
{
    // ✅ 预先缓存常用的向量
    private Vector3 tempVector3 = Vector3.zero;
    private Quaternion tempQuaternion = Quaternion.identity;

    void Update()
    {
        // ✅ 使用缓存的向量
        tempVector3.Set(Input.GetAxis("Horizontal"), 0, Input.GetAxis("Vertical"));
        transform.Translate(tempVector3 * Time.deltaTime);

        // ✅ 使用静态方法而不是重复创建向量
        transform.position = Vector3.Lerp(
            transform.position, 
            GetTargetPosition(), 
            Time.deltaTime * 5f
        );
    }

    Vector3 GetTargetPosition()
    {
        return Vector3.zero; // 示例目标位置
    }
}
```

---

## 总结

本章我们学习了Unity引擎的基础知识：

✅ **Unity环境**: 编辑器界面、项目结构、基本操作  
✅ **MonoBehaviour生命周期**: Awake、Start、Update、FixedUpdate、LateUpdate等方法的使用时机  
✅ **场景和游戏对象**: GameObject操作、场景管理、预制件系统  
✅ **组件系统**: 组件获取、通信、属性面板自定义  
✅ **Transform变换**: 位置、旋转、缩放操作和空间变换  
✅ **输入系统**: 键盘、鼠标、手柄、触摸输入处理  
✅ **Time系统**: 时间管理、帧率控制、时间缩放  
✅ **Unity中的C#实践**: 设计模式、协程、调试技巧  

Unity为C#开发者提供了强大的游戏开发平台，掌握这些基础知识是进行游戏开发的必要前提。

---

## 下一步

继续学习 [07. 游戏开发实战](07-game-development.md) →
