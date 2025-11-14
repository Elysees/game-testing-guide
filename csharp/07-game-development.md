# 07. 游戏开发实战

> Unity游戏开发完整实战指南 - 从零开始构建游戏系统

---

## 📌 本章导航

- [游戏架构设计](#游戏架构设计)
- [玩家角色系统](#玩家角色系统)
- [敌人AI系统](#敌人ai系统)
- [碰撞检测和物理系统](#碰撞检测和物理系统)
- [UI系统集成](#ui系统集成)
- [音频系统](#音频系统)
- [动画系统](#动画系统)
- [游戏管理器设计](#游戏管理器设计)

---

## 游戏架构设计

### 游戏架构基础

游戏架构是游戏开发的核心，它决定了游戏的可维护性、扩展性和性能。在Unity中，良好的架构设计应该遵循以下原则：

1. **单一职责原则**：每个组件只负责一个功能
2. **依赖倒置原则**：高层模块不应该依赖低层模块
3. **组件化设计**：通过组合而非继承实现功能
4. **事件驱动**：使用事件系统解耦各个模块

```csharp
using UnityEngine;
using System.Collections;
using System.Collections.Generic;

// 游戏架构基础接口
public interface IGameSystem
{
    void Initialize();
    void Update(float deltaTime);
    void Shutdown();
}

// 游戏状态管理器
public enum GameState
{
    MainMenu,
    Playing,
    Paused,
    GameOver,
    LevelComplete
}

// 游戏管理器 - 核心架构
public class GameManager : MonoBehaviour, IGameSystem
{
    public static GameManager Instance { get; private set; }

    [Header("游戏设置")]
    public GameState CurrentState { get; private set; } = GameState.MainMenu;
    public float GameTime { get; private set; } = 0f;
    public int CurrentLevel { get; private set; } = 1;
    public int Score { get; private set; } = 0;

    [Header("系统引用")]
    public PlayerController Player { get; private set; }
    public UIManager UIManager { get; private set; }
    public AudioManager AudioManager { get; private set; }

    private Dictionary<System.Type, IGameSystem> gameSystems = new Dictionary<System.Type, IGameSystem>();
    private List<IEventListener> eventListeners = new List<IEventListener>();

    void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
            Initialize();
        }
        else
        {
            Destroy(gameObject);
        }
    }

    public void Initialize()
    {
        // 初始化所有游戏系统
        InitializeSystems();
        
        // 注册事件监听器
        RegisterEventListeners();
        
        // 设置初始状态
        SetGameState(GameState.MainMenu);
    }

    private void InitializeSystems()
    {
        // 初始化UI管理器
        if (UIManager == null)
        {
            GameObject uiCanvas = new GameObject("UICanvas");
            uiCanvas.AddComponent<Canvas>();
            uiCanvas.AddComponent<UnityEngine.UI.GraphicRaycaster>();
            
            UIManager = uiCanvas.AddComponent<UIManager>();
            RegisterSystem(UIManager);
        }

        // 初始化音频管理器
        if (AudioManager == null)
        {
            AudioManager = gameObject.AddComponent<AudioManager>();
            RegisterSystem(AudioManager);
        }

        // 初始化其他系统
        // PhysicsSystem, InputSystem等
    }

    public void RegisterSystem<T>(T system) where T : IGameSystem
    {
        gameSystems[typeof(T)] = system;
        system.Initialize();
    }

    public T GetSystem<T>() where T : class, IGameSystem
    {
        if (gameSystems.TryGetValue(typeof(T), out IGameSystem system))
        {
            return system as T;
        }
        return null;
    }

    private void RegisterEventListeners()
    {
        // 注册全局事件监听器
        eventListeners.Add(UIManager);
        // 可以添加更多监听器
    }

    void Update()
    {
        if (CurrentState == GameState.Playing)
        {
            GameTime += Time.deltaTime;
            
            // 更新所有注册的系统
            foreach (var system in gameSystems.Values)
            {
                system.Update(Time.deltaTime);
            }
        }
    }

    public void SetGameState(GameState newState)
    {
        GameState oldState = CurrentState;
        CurrentState = newState;

        // 通知所有监听器状态改变
        foreach (var listener in eventListeners)
        {
            listener.OnGameStateChange(oldState, newState);
        }

        // 根据新状态执行特定逻辑
        OnGameStateSet(newState);
    }

    private void OnGameStateSet(GameState state)
    {
        switch (state)
        {
            case GameState.MainMenu:
                Time.timeScale = 1f;
                break;
            case GameState.Playing:
                Time.timeScale = 1f;
                break;
            case GameState.Paused:
                Time.timeScale = 0f;
                break;
            case GameState.GameOver:
                Time.timeScale = 1f;
                break;
        }
    }

    public void StartGame()
    {
        SetGameState(GameState.Playing);
        GameTime = 0f;
        Score = 0;
        CurrentLevel = 1;
        
        // 通知UI更新
        UIManager?.UpdateScore(Score);
        UIManager?.UpdateLevel(CurrentLevel);
    }

    public void PauseGame()
    {
        if (CurrentState == GameState.Playing)
        {
            SetGameState(GameState.Paused);
        }
    }

    public void ResumeGame()
    {
        if (CurrentState == GameState.Paused)
        {
            SetGameState(GameState.Playing);
        }
    }

    public void GameOver()
    {
        SetGameState(GameState.GameOver);
    }

    public void AddScore(int points)
    {
        Score += points;
        UIManager?.UpdateScore(Score);
    }

    public void NextLevel()
    {
        CurrentLevel++;
        UIManager?.UpdateLevel(CurrentLevel);
    }

    public void Shutdown()
    {
        foreach (var system in gameSystems.Values)
        {
            system.Shutdown();
        }
        gameSystems.Clear();
    }

    void OnDestroy()
    {
        Shutdown();
    }
}

// 事件监听器接口
public interface IEventListener
{
    void OnGameStateChange(GameState oldState, GameState newState);
}

// 全局事件管理器
public static class GameEvents
{
    public static System.Action<int> OnScoreChanged;
    public static System.Action<int> OnLevelChanged;
    public static System.Action<GameState, GameState> OnGameStateChange;
    public static System.Action OnGameStart;
    public static System.Action OnGameOver;
    public static System.Action<GameObject> OnPlayerSpawn;
    public static System.Action<GameObject> OnPlayerDeath;
    public static System.Action<string> OnItemCollected;

    public static void TriggerScoreChanged(int newScore)
    {
        OnScoreChanged?.Invoke(newScore);
    }

    public static void TriggerLevelChanged(int newLevel)
    {
        OnLevelChanged?.Invoke(newLevel);
    }

    public static void TriggerGameStateChange(GameState oldState, GameState newState)
    {
        OnGameStateChange?.Invoke(oldState, newState);
    }

    public static void TriggerGameStart()
    {
        OnGameStart?.Invoke();
    }

    public static void TriggerGameOver()
    {
        OnGameOver?.Invoke();
    }

    public static void TriggerPlayerSpawn(GameObject player)
    {
        OnPlayerSpawn?.Invoke(player);
    }

    public static void TriggerPlayerDeath(GameObject player)
    {
        OnPlayerDeath?.Invoke(player);
    }

    public static void TriggerItemCollected(string itemName)
    {
        OnItemCollected?.Invoke(itemName);
    }
}
```

### 对象池系统

```csharp
using UnityEngine;
using System.Collections.Generic;

// 对象池管理器 - 优化性能
public class ObjectPool : MonoBehaviour
{
    [System.Serializable]
    public class PoolItem
    {
        public string tag;
        public GameObject prefab;
        public int size;
    }

    public List<PoolItem> items = new List<PoolItem>();
    private Dictionary<string, Queue<GameObject>> pools = new Dictionary<string, Queue<GameObject>>();

    void Start()
    {
        InitializePools();
    }

    private void InitializePools()
    {
        foreach (PoolItem item in items)
        {
            CreatePool(item.tag, item.prefab, item.size);
        }
    }

    private void CreatePool(string tag, GameObject prefab, int size)
    {
        Queue<GameObject> pool = new Queue<GameObject>();
        
        for (int i = 0; i < size; i++)
        {
            GameObject obj = Instantiate(prefab);
            obj.SetActive(false);
            obj.transform.SetParent(transform);
            pool.Enqueue(obj);
        }
        
        pools[tag] = pool;
    }

    public GameObject SpawnFromPool(string tag, Vector3 position, Quaternion rotation)
    {
        if (!pools.ContainsKey(tag))
        {
            Debug.LogWarning($"Pool with tag {tag} doesn't exist.");
            return null;
        }

        GameObject objectToSpawn = pools[tag].Dequeue();
        objectToSpawn.SetActive(true);
        objectToSpawn.transform.position = position;
        objectToSpawn.transform.rotation = rotation;

        // 添加到池中以便回收
        PoolObject poolObject = objectToSpawn.GetComponent<PoolObject>();
        if (poolObject == null)
        {
            poolObject = objectToSpawn.AddComponent<PoolObject>();
        }
        poolObject.pool = this;
        poolObject.tag = tag;

        pools[tag].Enqueue(objectToSpawn);
        return objectToSpawn;
    }

    public void ReturnToPool(GameObject obj, string tag)
    {
        if (pools.ContainsKey(tag))
        {
            obj.SetActive(false);
            obj.transform.SetParent(transform);
        }
    }
}

// 可回收对象组件
public class PoolObject : MonoBehaviour
{
    public ObjectPool pool;
    public string tag;

    void OnDisable()
    {
        if (pool != null)
        {
            pool.ReturnToPool(gameObject, tag);
        }
    }
}
```

### 资源管理器

```csharp
using UnityEngine;
using System.Collections;
using System.Collections.Generic;

// 资源管理器
public class ResourceManager : MonoBehaviour
{
    private Dictionary<string, Object> loadedAssets = new Dictionary<string, Object>();
    private Dictionary<string, AssetBundle> loadedBundles = new Dictionary<string, AssetBundle>();

    // 同步加载资源
    public T LoadAsset<T>(string path) where T : Object
    {
        if (loadedAssets.ContainsKey(path))
        {
            return loadedAssets[path] as T;
        }

        T asset = Resources.Load<T>(path);
        if (asset != null)
        {
            loadedAssets[path] = asset;
        }
        else
        {
            Debug.LogWarning($"Could not load asset at path: {path}");
        }

        return asset;
    }

    // 异步加载资源
    public IEnumerator LoadAssetAsync<T>(string path, System.Action<T> callback) where T : Object
    {
        if (loadedAssets.ContainsKey(path))
        {
            callback?.Invoke(loadedAssets[path] as T);
            yield break;
        }

        ResourceRequest request = Resources.LoadAsync<T>(path);
        yield return request;

        if (request.asset != null)
        {
            loadedAssets[path] = request.asset;
            callback?.Invoke(request.asset as T);
        }
        else
        {
            Debug.LogWarning($"Could not load asset at path: {path}");
            callback?.Invoke(null);
        }
    }

    // 加载AssetBundle
    public IEnumerator LoadBundleAsync(string bundlePath, System.Action<AssetBundle> callback)
    {
        if (loadedBundles.ContainsKey(bundlePath))
        {
            callback?.Invoke(loadedBundles[bundlePath]);
            yield break;
        }

        // 注意：在实际项目中，bundlePath应该是有效的AssetBundle路径
        // AssetBundle bundle = AssetBundle.LoadFromFile(bundlePath);
        // if (bundle != null)
        // {
        //     loadedBundles[bundlePath] = bundle;
        //     callback?.Invoke(bundle);
        // }
        // else
        // {
        //     callback?.Invoke(null);
        // }

        yield return null;
    }

    // 卸载资源
    public void UnloadAsset(string path)
    {
        if (loadedAssets.ContainsKey(path))
        {
            Resources.UnloadAsset(loadedAssets[path]);
            loadedAssets.Remove(path);
        }
    }

    // 卸载所有资源
    public void UnloadAllAssets()
    {
        foreach (var asset in loadedAssets.Values)
        {
            Resources.UnloadAsset(asset);
        }
        loadedAssets.Clear();
    }

    // 预加载常用资源
    public void PreloadCommonAssets()
    {
        StartCoroutine(LoadAssetAsync<GameObject>("Prefabs/Player", null));
        StartCoroutine(LoadAssetAsync<GameObject>("Prefabs/Enemy", null));
        StartCoroutine(LoadAssetAsync<AudioClip>("Audio/BGM", null));
    }

    void OnDestroy()
    {
        UnloadAllAssets();
    }
}
```

---

## 玩家角色系统

### 玩家控制器

```csharp
using UnityEngine;

// 玩家输入模式
public enum PlayerInputMode
{
    KeyboardMouse,
    Gamepad,
    Touch
}

// 玩家控制器 - 处理玩家输入和行为
[RequireComponent(typeof(CharacterController))]
public class PlayerController : MonoBehaviour, IGameSystem
{
    [Header("移动设置")]
    public float moveSpeed = 5.0f;
    public float runSpeed = 8.0f;
    public float jumpHeight = 2.0f;
    public float gravity = -9.81f;

    [Header("摄像机设置")]
    public Transform cameraParent;
    public float mouseSensitivity = 2.0f;
    public float cameraDistance = 5.0f;

    [Header("状态设置")]
    public float health = 100f;
    public float maxHealth = 100f;
    public float stamina = 100f;
    public float maxStamina = 100f;

    [Header("装备设置")]
    public Weapon currentWeapon;
    public GameObject[] inventory = new GameObject[10];

    // 私有变量
    private CharacterController controller;
    private Camera playerCamera;
    private Vector3 velocity;
    private bool isGrounded;
    private float currentStamina;
    private float currentHealth;
    private float xRotation = 0f;
    private PlayerInputMode inputMode = PlayerInputMode.KeyboardMouse;

    // 属性
    public bool IsAlive { get; private set; } = true;
    public bool IsRunning { get; private set; } = false;
    public bool IsSprinting { get; private set; } = false;
    public float HealthPercentage => currentHealth / maxHealth;
    public float StaminaPercentage => currentStamina / maxStamina;

    public void Initialize()
    {
        controller = GetComponent<CharacterController>();
        playerCamera = Camera.main;
        
        if (cameraParent != null)
        {
            // 设置第三人称摄像机
            SetupCamera();
        }

        currentHealth = maxHealth;
        currentStamina = maxStamina;
        IsAlive = true;

        // 订阅游戏事件
        GameEvents.OnGameStateChange += OnGameStateChange;
    }

    private void SetupCamera()
    {
        // 第三人称摄像机设置
        cameraParent.position = transform.position - transform.forward * cameraDistance + transform.up * 2f;
        cameraParent.LookAt(transform);
    }

    public void Update(float deltaTime)
    {
        if (!IsAlive || GameManager.Instance.CurrentState != GameState.Playing) return;

        HandleMovement(deltaTime);
        HandleRotation(deltaTime);
        HandleActions();
        UpdateStamina(deltaTime);
        UpdateCamera();
    }

    private void HandleMovement(float deltaTime)
    {
        isGrounded = controller.isGrounded;
        
        if (isGrounded && velocity.y < 0)
        {
            velocity.y = -2f;
        }

        // 获取输入
        float x = Input.GetAxis("Horizontal");
        float z = Input.GetAxis("Vertical");

        Vector3 move = transform.right * x + transform.forward * z;
        
        // 跑步状态
        float currentSpeed = moveSpeed;
        if (Input.GetKey(KeyCode.LeftShift) && currentStamina > 0)
        {
            currentSpeed = runSpeed;
            IsSprinting = true;
            currentStamina -= 10 * deltaTime; // 消耗体力
        }
        else
        {
            IsSprinting = false;
            currentStamina = Mathf.Min(maxStamina, currentStamina + 5 * deltaTime); // 恢复体力
        }

        controller.Move(move * currentSpeed * deltaTime);

        // 跳跃
        if (Input.GetButtonDown("Jump") && isGrounded)
        {
            velocity.y = Mathf.Sqrt(jumpHeight * -2f * gravity);
        }

        // 重力
        velocity.y += gravity * deltaTime;
        controller.Move(velocity * deltaTime);

        IsRunning = move.magnitude > 0.1f;
    }

    private void HandleRotation(float deltaTime)
    {
        if (inputMode == PlayerInputMode.KeyboardMouse && cameraParent != null)
        {
            // 鼠标控制视角
            float mouseX = Input.GetAxis("Mouse X") * mouseSensitivity;
            float mouseY = Input.GetAxis("Mouse Y") * mouseSensitivity;

            xRotation -= mouseY;
            xRotation = Mathf.Clamp(xRotation, -90f, 90f);

            cameraParent.localRotation = Quaternion.Euler(xRotation, 0f, 0f);
            transform.Rotate(Vector3.up * mouseX);
        }
    }

    private void HandleActions()
    {
        // 射击
        if (Input.GetButtonDown("Fire1") && currentWeapon != null)
        {
            currentWeapon.Shoot();
        }

        // 换武器
        if (Input.GetKeyDown(KeyCode.Alpha1))
        {
            SwitchWeapon(0);
        }
        if (Input.GetKeyDown(KeyCode.Alpha2))
        {
            SwitchWeapon(1);
        }

        // 使用物品
        if (Input.GetKeyDown(KeyCode.E))
        {
            UseItem();
        }

        // 打开背包
        if (Input.GetKeyDown(KeyCode.Tab))
        {
            ToggleInventory();
        }
    }

    private void UpdateStamina(float deltaTime)
    {
        // 爬坡时消耗体力
        if (controller.isGrounded && velocity.y > 0)
        {
            currentStamina -= 2 * deltaTime;
        }

        // 限制体力值
        currentStamina = Mathf.Clamp(currentStamina, 0, maxStamina);
    }

    private void UpdateCamera()
    {
        if (cameraParent != null)
        {
            // 保持摄像机跟随玩家
            Vector3 targetPos = transform.position - transform.forward * cameraDistance + transform.up * 2f;
            cameraParent.position = Vector3.Lerp(cameraParent.position, targetPos, 5f * Time.deltaTime);
        }
    }

    // 受伤
    public void TakeDamage(float damage)
    {
        if (!IsAlive) return;

        currentHealth -= damage;
        currentHealth = Mathf.Max(0, currentHealth);

        // 更新UI
        GameEvents.TriggerScoreChanged(Mathf.RoundToInt(currentHealth));

        if (currentHealth <= 0)
        {
            Die();
        }
    }

    // 治疗
    public void Heal(float amount)
    {
        currentHealth = Mathf.Min(maxHealth, currentHealth + amount);
    }

    // 死亡
    private void Die()
    {
        IsAlive = false;
        GameEvents.TriggerPlayerDeath(gameObject);
        
        // 播放死亡动画
        StartCoroutine(DieCoroutine());
    }

    private IEnumerator DieCoroutine()
    {
        // 死亡动画和效果
        yield return new WaitForSeconds(2f);
        
        // 重生或游戏结束
        GameManager.Instance.GameOver();
    }

    // 切换武器
    public void SwitchWeapon(int slot)
    {
        if (slot >= 0 && slot < inventory.Length && inventory[slot] != null)
        {
            GameObject weaponGO = inventory[slot];
            Weapon newWeapon = weaponGO.GetComponent<Weapon>();
            
            if (newWeapon != null)
            {
                currentWeapon = newWeapon;
                // 更新UI显示当前武器
            }
        }
    }

    // 使用物品
    public void UseItem()
    {
        // 实现物品使用逻辑
        for (int i = 0; i < inventory.Length; i++)
        {
            if (inventory[i] != null && inventory[i].tag == "UsableItem")
            {
                UseableItem item = inventory[i].GetComponent<UseableItem>();
                if (item != null)
                {
                    item.Use(this);
                    break;
                }
            }
        }
    }

    // 切换背包显示
    private void ToggleInventory()
    {
        // 通知UI系统切换背包显示
        UIManager.Instance?.ToggleInventory();
    }

    // 碰撞检测
    void OnControllerColliderHit(ControllerColliderHit hit)
    {
        // 处理碰撞事件
        if (hit.gameObject.CompareTag("Collectible"))
        {
            CollectItem(hit.gameObject);
        }
    }

    // 收集物品
    private void CollectItem(GameObject item)
    {
        // 添加到背包
        for (int i = 0; i < inventory.Length; i++)
        {
            if (inventory[i] == null)
            {
                inventory[i] = item;
                item.SetActive(false); // 隐藏场景中的物品
                
                // 触发收集事件
                GameEvents.TriggerItemCollected(item.name);
                break;
            }
        }
    }

    // 状态改变处理
    private void OnGameStateChange(GameState oldState, GameState newState)
    {
        enabled = newState == GameState.Playing;
    }

    public void Shutdown()
    {
        GameEvents.OnGameStateChange -= OnGameStateChange;
    }

    // 调试显示
    void OnGUI()
    {
        if (GameManager.Instance.CurrentState == GameState.Playing)
        {
            GUI.Box(new Rect(10, 10, 200, 80), "Player Stats");
            GUI.Label(new Rect(20, 35, 180, 20), $"Health: {currentHealth:F1}/{maxHealth}");
            GUI.Label(new Rect(20, 55, 180, 20), $"Stamina: {currentStamina:F1}/{maxStamina}");
            GUI.Label(new Rect(20, 75, 180, 20), $"Alive: {IsAlive}");
        }
    }
}
```

### 武器系统

```csharp
using UnityEngine;

// 武器类型
public enum WeaponType
{
    Melee,
    Ranged,
    Magic
}

// 武器基类
public abstract class Weapon : MonoBehaviour
{
    [Header("武器基础属性")]
    public string weaponName = "Weapon";
    public WeaponType weaponType = WeaponType.Ranged;
    public int damage = 25;
    public float fireRate = 0.5f;
    public int maxAmmo = 30;
    public int currentAmmo;
    public float range = 100f;
    public float reloadTime = 2f;

    [Header("视觉效果")]
    public GameObject muzzleFlash;
    public GameObject shellEject;
    public LayerMask hitLayers;

    protected float lastFireTime = 0f;
    protected bool isReloading = false;
    protected PlayerController player;

    void Start()
    {
        currentAmmo = maxAmmo;
        player = GetComponentInParent<PlayerController>();
    }

    // 射击方法 - 由子类实现
    public abstract void Shoot();

    // 重载
    public virtual void Reload()
    {
        if (isReloading || currentAmmo == maxAmmo) return;

        isReloading = true;
        Invoke("FinishReload", reloadTime);
    }

    protected virtual void FinishReload()
    {
        currentAmmo = maxAmmo;
        isReloading = false;
    }

    // 检查是否可以射击
    protected virtual bool CanShoot()
    {
        return !isReloading && 
               currentAmmo > 0 && 
               Time.time >= lastFireTime + fireRate;
    }

    // 显示武器信息
    public virtual string GetWeaponInfo()
    {
        return $"{weaponName}\nDamage: {damage}\nAmmo: {currentAmmo}/{maxAmmo}";
    }
}

// 枪械武器
public class GunWeapon : Weapon
{
    [Header("枪械特有属性")]
    public float bulletSpeed = 1000f;
    public float spread = 0.1f;
    public int bulletsPerShot = 1;

    public override void Shoot()
    {
        if (!CanShoot()) return;

        lastFireTime = Time.time;
        currentAmmo--;

        for (int i = 0; i < bulletsPerShot; i++)
        {
            // 添加随机散布
            Vector3 direction = transform.forward;
            direction += Random.insideUnitSphere * spread;
            direction.Normalize();

            // 射线检测
            Ray ray = new Ray(transform.position, direction);
            RaycastHit hit;

            if (Physics.Raycast(ray, out hit, range, hitLayers))
            {
                // 检测到目标
                HandleHit(hit);
            }

            // 创建子弹效果
            CreateBulletEffect(hit.point, hit.normal);
        }

        // 播放音效
        AudioManager.Instance?.PlaySFX("GunShot");

        // 显示枪口闪光
        if (muzzleFlash != null)
        {
            muzzleFlash.SetActive(true);
            Invoke("HideMuzzleFlash", 0.05f);
        }

        // 抛壳
        if (shellEject != null)
        {
            GameObject shell = Instantiate(shellEject, transform.position, transform.rotation);
            Rigidbody shellRb = shell.GetComponent<Rigidbody>();
            if (shellRb != null)
            {
                shellRb.AddForce(transform.right * 5f, ForceMode.Impulse);
                shellRb.AddTorque(Random.insideUnitSphere * 10f, ForceMode.Impulse);
            }
        }
    }

    private void HandleHit(RaycastHit hit)
    {
        // 处理命中逻辑
        HealthComponent health = hit.collider.GetComponent<HealthComponent>();
        if (health != null)
        {
            health.TakeDamage(damage);
        }

        // 创建命中效果
        CreateHitEffect(hit.point, hit.normal);
    }

    private void CreateBulletEffect(Vector3 hitPoint, Vector3 hitNormal)
    {
        // 创建子弹轨迹效果
        // 这里可以添加子弹轨迹、烟雾等效果
    }

    private void CreateHitEffect(Vector3 hitPoint, Vector3 hitNormal)
    {
        // 创建命中效果
        // 如火花、弹孔贴图等
        Debug.DrawRay(transform.position, (hitPoint - transform.position).normalized * range, Color.red, 2f);
    }

    private void HideMuzzleFlash()
    {
        if (muzzleFlash != null)
        {
            muzzleFlash.SetActive(false);
        }
    }
}

// 近战武器
public class MeleeWeapon : Weapon
{
    [Header("近战特有属性")]
    public float attackRange = 2f;
    public float attackAngle = 45f;

    public override void Shoot()
    {
        if (!CanShoot()) return;

        lastFireTime = Time.time;

        // 检测攻击范围内的敌人
        Collider[] hitColliders = Physics.OverlapSphere(transform.position, attackRange);
        
        foreach (Collider collider in hitColliders)
        {
            // 检查角度
            Vector3 direction = (collider.transform.position - transform.position).normalized;
            float angle = Vector3.Angle(transform.forward, direction);
            
            if (angle <= attackAngle / 2 && collider.CompareTag("Enemy"))
            {
                HealthComponent health = collider.GetComponent<HealthComponent>();
                if (health != null)
                {
                    health.TakeDamage(damage);
                }
            }
        }

        // 播放攻击音效
        AudioManager.Instance?.PlaySFX("MeleeAttack");
    }

    void OnDrawGizmosSelected()
    {
        // 显示攻击范围
        if (attackRange > 0)
        {
            Gizmos.color = Color.red;
            Gizmos.DrawWireSphere(transform.position, attackRange);
            
            // 显示攻击角度
            Vector3 forward = transform.forward;
            Vector3 left = Quaternion.Euler(0, -attackAngle / 2, 0) * forward;
            Vector3 right = Quaternion.Euler(0, attackAngle / 2, 0) * forward;
            
            Gizmos.DrawLine(transform.position, transform.position + left * attackRange);
            Gizmos.DrawLine(transform.position, transform.position + right * attackRange);
        }
    }
}

// 可用物品基类
public abstract class UseableItem : MonoBehaviour
{
    public string itemName = "Item";
    public int maxUses = 1;
    protected int currentUses = 0;

    public abstract void Use(PlayerController player);

    public virtual bool CanUse()
    {
        return currentUses < maxUses;
    }

    public virtual string GetItemInfo()
    {
        return $"{itemName}\nUses: {currentUses}/{maxUses}";
    }
}

// 治疗物品
public class HealthPotion : UseableItem
{
    public float healAmount = 25f;

    public override void Use(PlayerController player)
    {
        if (CanUse())
        {
            player.Heal(healAmount);
            currentUses++;
            
            if (currentUses >= maxUses)
            {
                // 物品用完，可以销毁
                Destroy(gameObject);
            }
        }
    }
}
```

### 健康系统

```csharp
using UnityEngine;

// 健康组件 - 可以附加到任何游戏对象
public class HealthComponent : MonoBehaviour
{
    [Header("健康设置")]
    public float maxHealth = 100f;
    public float currentHealth;
    public bool isInvulnerable = false;
    public float invulnerabilityTime = 1f;

    [Header("视觉效果")]
    public GameObject hitEffect;
    public Material hitMaterial;
    public float hitFlashDuration = 0.1f;

    [Header("死亡设置")]
    public GameObject deathEffect;
    public float deathDelay = 0f;
    public bool destroyOnDeath = true;

    private bool isDead = false;
    private float invulnerabilityTimer = 0f;
    private Renderer originalRenderer;
    private Material originalMaterial;

    void Start()
    {
        currentHealth = maxHealth;
        isDead = false;
        
        // 保存原始材质
        Renderer renderer = GetComponent<Renderer>();
        if (renderer != null)
        {
            originalRenderer = renderer;
            originalMaterial = renderer.material;
        }
    }

    void Update()
    {
        // 更新无敌时间
        if (invulnerabilityTimer > 0)
        {
            invulnerabilityTimer -= Time.deltaTime;
        }
    }

    // 受伤
    public virtual void TakeDamage(float damage)
    {
        if (isDead || (isInvulnerable && invulnerabilityTimer > 0)) return;

        currentHealth -= damage;
        currentHealth = Mathf.Max(0, currentHealth);

        // 触发受伤效果
        OnTakeDamage(damage);

        // 检查是否死亡
        if (currentHealth <= 0 && !isDead)
        {
            Die();
        }

        // 设置无敌时间
        invulnerabilityTimer = invulnerabilityTime;
    }

    // 治疗
    public virtual void Heal(float amount)
    {
        currentHealth = Mathf.Min(maxHealth, currentHealth + amount);
    }

    // 受伤时的处理
    protected virtual void OnTakeDamage(float damage)
    {
        // 播放受伤音效
        AudioManager.Instance?.PlaySFX("PlayerHurt");

        // 创建受伤效果
        if (hitEffect != null)
        {
            Instantiate(hitEffect, transform.position, Quaternion.identity);
        }

        // 闪烁效果
        StartCoroutine(HitFlash());
    }

    // 死亡
    protected virtual void Die()
    {
        isDead = true;

        // 触发死亡事件
        if (gameObject.CompareTag("Player"))
        {
            GameEvents.TriggerPlayerDeath(gameObject);
        }
        else if (gameObject.CompareTag("Enemy"))
        {
            GameEvents.TriggerScoreChanged(100); // 给予击杀分数
        }

        // 创建死亡效果
        if (deathEffect != null)
        {
            Instantiate(deathEffect, transform.position, Quaternion.identity);
        }

        // 延迟销毁
        if (destroyOnDeath)
        {
            Destroy(gameObject, deathDelay);
        }
    }

    // 受伤闪烁效果
    private System.Collections.IEnumerator HitFlash()
    {
        if (originalRenderer != null && hitMaterial != null)
        {
            originalRenderer.material = hitMaterial;
            yield return new WaitForSeconds(hitFlashDuration);
            originalRenderer.material = originalMaterial;
        }
    }

    // 获取健康百分比
    public float GetHealthPercentage()
    {
        return currentHealth / maxHealth;
    }

    // 检查是否完全健康
    public bool IsFullyHealed()
    {
        return currentHealth >= maxHealth;
    }

    // 检查是否无敌
    public bool IsInvulnerable()
    {
        return isInvulnerable && invulnerabilityTimer > 0;
    }

    // 设置无敌状态
    public void SetInvulnerable(bool invulnerable, float duration = 0f)
    {
        isInvulnerable = invulnerable;
        if (duration > 0)
        {
            invulnerabilityTimer = duration;
        }
    }

    // 复活
    public virtual void Resurrect(float healthPercentage = 1f)
    {
        if (isDead)
        {
            currentHealth = maxHealth * healthPercentage;
            isDead = false;
        }
    }

    // 调试显示
    void OnGUI()
    {
        if (GetComponent<PlayerController>() != null)
        {
            // 显示玩家健康条
            Rect healthBar = new Rect(Screen.width / 2 - 100, 50, 200, 20);
            GUI.Box(healthBar, "");
            Rect healthFill = new Rect(Screen.width / 2 - 100, 50, 200 * GetHealthPercentage(), 20);
            GUI.color = Color.green;
            GUI.DrawTexture(healthFill, Texture2D.whiteTexture);
            GUI.color = Color.white;
            GUI.Label(healthBar, $"{currentHealth:F0}/{maxHealth}");
        }
    }
}
```

---

## 敌人AI系统

### 基础AI控制器

```csharp
using UnityEngine;
using System.Collections;
using System.Collections.Generic;

// AI状态枚举
public enum AIState
{
    Idle,
    Patrol,
    Chase,
    Attack,
    Flee,
    Dead
}

// AI控制器基类
public abstract class AIController : MonoBehaviour
{
    [Header("AI基础设置")]
    public AIState currentState = AIState.Idle;
    public float detectionRange = 10f;
    public float attackRange = 2f;
    public float moveSpeed = 3f;
    public float rotationSpeed = 5f;

    [Header("AI属性")]
    public float health = 100f;
    public float maxHealth = 100f;
    public int damage = 20;
    public float attackCooldown = 1f;

    [Header("目标设置")]
    public Transform target;
    public LayerMask targetLayerMask;

    protected HealthComponent healthComponent;
    protected float lastAttackTime = 0f;
    protected bool isAttacking = false;
    protected bool isDead = false;

    void Start()
    {
        InitializeAI();
    }

    void Update()
    {
        if (isDead) return;

        UpdateAI();
    }

    protected virtual void InitializeAI()
    {
        healthComponent = GetComponent<HealthComponent>();
        if (healthComponent == null)
        {
            healthComponent = gameObject.AddComponent<HealthComponent>();
            healthComponent.maxHealth = maxHealth;
            healthComponent.currentHealth = health;
        }

        // 查找玩家作为目标
        FindTarget();
    }

    protected virtual void UpdateAI()
    {
        FindTarget();

        switch (currentState)
        {
            case AIState.Idle:
                UpdateIdleState();
                break;
            case AIState.Patrol:
                UpdatePatrolState();
                break;
            case AIState.Chase:
                UpdateChaseState();
                break;
            case AIState.Attack:
                UpdateAttackState();
                break;
            case AIState.Flee:
                UpdateFleeState();
                break;
        }

        // 检查状态转换
        CheckStateTransitions();
    }

    // 查找目标
    protected virtual void FindTarget()
    {
        if (target != null && Vector3.Distance(transform.position, target.position) > detectionRange * 2)
        {
            target = null;
        }

        if (target == null)
        {
            // 查找最近的玩家
            GameObject[] players = GameObject.FindGameObjectsWithTag("Player");
            float minDistance = float.MaxValue;

            foreach (GameObject player in players)
            {
                float distance = Vector3.Distance(transform.position, player.transform.position);
                if (distance < detectionRange && distance < minDistance)
                {
                    target = player.transform;
                    minDistance = distance;
                }
            }
        }
    }

    // 空闲状态
    protected virtual void UpdateIdleState()
    {
        // 空闲状态逻辑
        // 可以添加随机巡逻点选择等
    }

    // 巡逻状态
    protected virtual void UpdatePatrolState()
    {
        // 巡逻逻辑将在子类中实现
    }

    // 追击状态
    protected virtual void UpdateChaseState()
    {
        if (target != null)
        {
            Vector3 direction = (target.position - transform.position).normalized;
            transform.Translate(direction * moveSpeed * Time.deltaTime);
            
            // 朝向目标
            Vector3 lookDirection = new Vector3(target.position.x, transform.position.y, target.position.z);
            transform.rotation = Quaternion.Slerp(
                transform.rotation, 
                Quaternion.LookRotation(lookDirection), 
                rotationSpeed * Time.deltaTime
            );
        }
    }

    // 攻击状态
    protected virtual void UpdateAttackState()
    {
        if (target != null && !isAttacking && Time.time >= lastAttackTime + attackCooldown)
        {
            StartCoroutine(AttackCoroutine());
        }
    }

    // 逃跑状态
    protected virtual void UpdateFleeState()
    {
        if (target != null)
        {
            Vector3 fleeDirection = (transform.position - target.position).normalized;
            transform.Translate(fleeDirection * moveSpeed * Time.deltaTime);
        }
    }

    // 检查状态转换
    protected virtual void CheckStateTransitions()
    {
        if (target != null)
        {
            float distanceToTarget = Vector3.Distance(transform.position, target.position);

            if (distanceToTarget <= attackRange)
            {
                currentState = AIState.Attack;
            }
            else if (distanceToTarget <= detectionRange)
            {
                currentState = AIState.Chase;
            }
            else
            {
                currentState = AIState.Patrol;
            }
        }
        else
        {
            currentState = AIState.Patrol;
        }
    }

    // 攻击协程
    protected virtual IEnumerator AttackCoroutine()
    {
        isAttacking = true;
        
        // 攻击动画/效果
        OnAttack();
        
        // 对目标造成伤害
        if (target != null)
        {
            HealthComponent targetHealth = target.GetComponent<HealthComponent>();
            if (targetHealth != null)
            {
                targetHealth.TakeDamage(damage);
            }
        }

        lastAttackTime = Time.time;
        yield return new WaitForSeconds(attackCooldown);
        isAttacking = false;
    }

    // 攻击时的处理
    protected abstract void OnAttack();

    // 受伤处理
    public virtual void TakeDamage(float damage)
    {
        if (isDead) return;

        health -= damage;
        health = Mathf.Max(0, health);

        // 触发受伤事件
        OnTakeDamage(damage);

        if (health <= 0)
        {
            Die();
        }
    }

    // 受伤时的处理
    protected virtual void OnTakeDamage(float damage)
    {
        // 改变AI状态为追击
        if (currentState == AIState.Idle || currentState == AIState.Patrol)
        {
            currentState = AIState.Chase;
        }

        // 播放受伤音效
        AudioManager.Instance?.PlaySFX("EnemyHurt");
    }

    // 死亡
    protected virtual void Die()
    {
        isDead = true;
        currentState = AIState.Dead;

        // 触发死亡事件
        GameEvents.TriggerScoreChanged(50); // 给予击杀分数

        // 播放死亡音效
        AudioManager.Instance?.PlaySFX("EnemyDie");

        // 创建死亡效果
        if (GetComponent<HealthComponent>() != null)
        {
            GetComponent<HealthComponent>().Die();
        }

        // 销毁对象
        Destroy(gameObject, 1f);
    }

    // 设置目标
    public virtual void SetTarget(Transform newTarget)
    {
        target = newTarget;
    }

    // 获取健康百分比
    public float GetHealthPercentage()
    {
        return health / maxHealth;
    }

    // 可视化AI范围
    void OnDrawGizmos()
    {
        Gizmos.color = Color.yellow;
        Gizmos.DrawWireSphere(transform.position, detectionRange);
        
        Gizmos.color = Color.red;
        Gizmos.DrawWireSphere(transform.position, attackRange);
        
        if (target != null)
        {
            Gizmos.color = Color.blue;
            Gizmos.DrawLine(transform.position, target.position);
        }
    }
}
```

### 不同类型的敌人AI

```csharp
using UnityEngine;
using System.Collections;

// 巡逻AI
public class PatrolAI : AIController
{
    [Header("巡逻设置")]
    public Transform[] patrolPoints;
    public float waitTime = 2f;
    public bool loopPatrol = true;

    private int currentPatrolIndex = 0;
    private bool isMovingToPatrolPoint = false;

    protected override void InitializeAI()
    {
        base.InitializeAI();
        
        if (patrolPoints.Length == 0)
        {
            // 如果没有设置巡逻点，创建默认巡逻区域
            CreateDefaultPatrolPoints();
        }
    }

    protected override void UpdatePatrolState()
    {
        if (patrolPoints.Length > 0 && !isMovingToPatrolPoint)
        {
            StartCoroutine(MoveToPatrolPoint());
        }
    }

    private IEnumerator MoveToPatrolPoint()
    {
        isMovingToPatrolPoint = true;
        
        Transform targetPoint = patrolPoints[currentPatrolIndex];
        
        while (Vector3.Distance(transform.position, targetPoint.position) > 0.5f)
        {
            Vector3 direction = (targetPoint.position - transform.position).normalized;
            transform.Translate(direction * moveSpeed * Time.deltaTime);
            
            // 朝向移动方向
            if (direction != Vector3.zero)
            {
                transform.rotation = Quaternion.Slerp(
                    transform.rotation,
                    Quaternion.LookRotation(direction),
                    rotationSpeed * Time.deltaTime
                );
            }
            
            yield return null;
        }
        
        // 到达巡逻点，等待
        yield return new WaitForSeconds(waitTime);
        
        // 移动到下一个巡逻点
        currentPatrolIndex = (currentPatrolIndex + 1) % patrolPoints.Length;
        if (!loopPatrol && currentPatrolIndex == 0)
        {
            // 如果不循环，保持在最后一个点
            currentPatrolIndex = patrolPoints.Length - 1;
        }
        
        isMovingToPatrolPoint = false;
    }

    private void CreateDefaultPatrolPoints()
    {
        // 创建围绕当前位置的巡逻点
        patrolPoints = new Transform[4];
        Vector3 center = transform.position;
        float radius = 5f;

        for (int i = 0; i < 4; i++)
        {
            GameObject pointGO = new GameObject($"PatrolPoint_{i}");
            pointGO.transform.position = center + new Vector3(
                Mathf.Cos(i * Mathf.PI / 2) * radius,
                0,
                Mathf.Sin(i * Mathf.PI / 2) * radius
            );
            patrolPoints[i] = pointGO.transform;
        }
    }

    protected override void OnAttack()
    {
        // 巡逻AI的攻击逻辑
        Debug.Log($"{gameObject.name} 攻击目标!");
        // 可以添加攻击动画、音效等
    }
}

// 追击AI
public class ChaseAI : AIController
{
    [Header("追击设置")]
    public float chaseSpeedMultiplier = 1.5f;
    public float loseTargetDistance = 20f;

    protected override void UpdateChaseState()
    {
        if (target != null)
        {
            float distanceToTarget = Vector3.Distance(transform.position, target.position);
            
            if (distanceToTarget > loseTargetDistance)
            {
                // 距离太远，丢失目标
                target = null;
                currentState = AIState.Patrol;
                return;
            }

            // 使用更快的速度追击
            Vector3 direction = (target.position - transform.position).normalized;
            float currentSpeed = moveSpeed * chaseSpeedMultiplier;
            transform.Translate(direction * currentSpeed * Time.deltaTime);
            
            // 朝向目标
            Vector3 lookDirection = new Vector3(target.position.x, transform.position.y, target.position.z);
            transform.rotation = Quaternion.Slerp(
                transform.rotation, 
                Quaternion.LookRotation(lookDirection), 
                rotationSpeed * Time.deltaTime
            );
        }
    }

    protected override void OnAttack()
    {
        // 追击AI的攻击逻辑
        Debug.Log($"{gameObject.name} 猛烈攻击目标!");
        // 可以添加更强烈的攻击效果
    }
}

// 环绕AI
public class OrbitAI : AIController
{
    [Header("环绕设置")]
    public float orbitRadius = 5f;
    public float orbitSpeed = 30f;
    public bool orbitClockwise = true;

    private float orbitAngle = 0f;

    protected override void UpdateChaseState()
    {
        if (target != null)
        {
            float distanceToTarget = Vector3.Distance(transform.position, target.position);
            
            if (distanceToTarget <= detectionRange)
            {
                // 围绕目标移动
                orbitAngle += (orbitClockwise ? 1 : -1) * orbitSpeed * Time.deltaTime * Mathf.Deg2Rad;
                
                Vector3 orbitOffset = new Vector3(
                    Mathf.Cos(orbitAngle) * orbitRadius,
                    0,
                    Mathf.Sin(orbitAngle) * orbitRadius
                );
                
                Vector3 targetOrbitPos = target.position + orbitOffset;
                Vector3 direction = (targetOrbitPos - transform.position).normalized;
                
                transform.Translate(direction * moveSpeed * Time.deltaTime);
                
                // 朝向目标
                transform.LookAt(target);
            }
        }
    }

    protected override void OnAttack()
    {
        // 环绕AI的攻击逻辑
        Debug.Log($"{gameObject.name} 从侧面攻击目标!");
    }
}

// 群体AI控制器
public class GroupAIController : MonoBehaviour
{
    [Header("群体设置")]
    public List<AIController> groupMembers = new List<AIController>();
    public float groupDetectionRadius = 15f;
    public bool useGroupTactics = true;

    void Start()
    {
        FindGroupMembers();
    }

    private void FindGroupMembers()
    {
        Collider[] nearbyColliders = Physics.OverlapSphere(transform.position, groupDetectionRadius);
        
        foreach (Collider collider in nearbyColliders)
        {
            AIController ai = collider.GetComponent<AIController>();
            if (ai != null && ai != GetComponent<AIController>())
            {
                if (!groupMembers.Contains(ai))
                {
                    groupMembers.Add(ai);
                }
            }
        }
    }

    public void AlertGroup(AIController alertingMember, Transform target)
    {
        if (!useGroupTactics) return;

        foreach (AIController member in groupMembers)
        {
            if (member != alertingMember && member != null)
            {
                member.SetTarget(target);
                
                // 可以实现更复杂的群体行为
                // 例如：包围目标、协同攻击等
                if (Vector3.Distance(member.transform.position, alertingMember.transform.position) < 10f)
                {
                    // 靠近的成员直接加入战斗
                    member.currentState = AIState.Chase;
                }
            }
        }
    }

    void OnDrawGizmos()
    {
        Gizmos.color = Color.cyan;
        Gizmos.DrawWireSphere(transform.position, groupDetectionRadius);
    }
}
```

### 高级AI行为树

```csharp
using UnityEngine;
using System.Collections.Generic;

// 行为树节点基类
public abstract class BTNode
{
    public enum NodeState
    {
        Running,
        Success,
        Failure
    }

    protected NodeState state = NodeState.Running;
    public NodeState State { get { return state; } }

    public abstract NodeState Evaluate();

    public virtual void Reset()
    {
        state = NodeState.Running;
    }
}

// 行为树装饰器
public abstract class BTDecorator : BTNode
{
    protected BTNode child;

    public void SetChild(BTNode childNode)
    {
        child = childNode;
    }
}

// 行为树复合节点
public abstract class BTComposite : BTNode
{
    protected List<BTNode> children = new List<BTNode>();

    public void AddChild(BTNode child)
    {
        children.Add(child);
    }

    public void RemoveChild(BTNode child)
    {
        children.Remove(child);
    }

    public void ClearChildren()
    {
        children.Clear();
    }
}

// 选择器节点（执行第一个成功的孩子节点）
public class BTSelector : BTComposite
{
    private int currentChildIndex = 0;

    public override BTNode.NodeState Evaluate()
    {
        for (int i = 0; i < children.Count; i++)
        {
            NodeState childState = children[i].Evaluate();

            if (childState == NodeState.Success)
            {
                currentChildIndex = i;
                state = NodeState.Success;
                return state;
            }
            else if (childState == NodeState.Running)
            {
                currentChildIndex = i;
                state = NodeState.Running;
                return state;
            }
        }

        state = NodeState.Failure;
        return state;
    }

    public override void Reset()
    {
        base.Reset();
        foreach (BTNode child in children)
        {
            child.Reset();
        }
        currentChildIndex = 0;
    }
}

// 序列节点（按顺序执行所有孩子节点）
public class BTSequence : BTComposite
{
    private int currentChildIndex = 0;

    public override BTNode.NodeState Evaluate()
    {
        while (currentChildIndex < children.Count)
        {
            NodeState childState = children[currentChildIndex].Evaluate();

            if (childState == NodeState.Failure)
            {
                currentChildIndex = 0;
                state = NodeState.Failure;
                return state;
            }
            else if (childState == NodeState.Running)
            {
                state = NodeState.Running;
                return state;
            }

            currentChildIndex++;
        }

        currentChildIndex = 0;
        state = NodeState.Success;
        return state;
    }

    public override void Reset()
    {
        base.Reset();
        foreach (BTNode child in children)
        {
            child.Reset();
        }
        currentChildIndex = 0;
    }
}

// 条件节点示例
public class BTCondition : BTNode
{
    private System.Func<bool> condition;

    public BTCondition(System.Func<bool> conditionFunc)
    {
        condition = conditionFunc;
    }

    public override NodeState Evaluate()
    {
        return condition() ? NodeState.Success : NodeState.Failure;
    }
}

// 动作节点示例
public class BTAction : BTNode
{
    private System.Func<NodeState> action;

    public BTAction(System.Func<NodeState> actionFunc)
    {
        action = actionFunc;
    }

    public override NodeState Evaluate()
    {
        return action();
    }
}

// AI行为树控制器
public class BTAIController : AIController
{
    [Header("行为树设置")]
    public BTComposite root;

    private Dictionary<string, object> blackboard = new Dictionary<string, object>();

    protected override void InitializeAI()
    {
        base.InitializeAI();
        CreateBehaviorTree();
    }

    private void CreateBehaviorTree()
    {
        // 创建行为树根节点
        root = new BTSelector();

        // 创建"战斗"分支
        BTSequence combatSequence = new BTSequence();
        combatSequence.AddChild(new BTCondition(() => target != null && Vector3.Distance(transform.position, target.position) <= detectionRange));
        combatSequence.AddChild(new BTCondition(() => Vector3.Distance(transform.position, target.position) <= attackRange));
        combatSequence.AddChild(new BTAction(() => { currentState = AIState.Attack; return NodeState.Success; }));

        // 创建"追击"分支
        BTSequence chaseSequence = new BTSequence();
        chaseSequence.AddChild(new BTCondition(() => target != null && Vector3.Distance(transform.position, target.position) <= detectionRange));
        chaseSequence.AddChild(new BTAction(() => { currentState = AIState.Chase; return NodeState.Success; }));

        // 创建"巡逻"分支
        BTSequence patrolSequence = new BTSequence();
        patrolSequence.AddChild(new BTCondition(() => target == null));
        patrolSequence.AddChild(new BTAction(() => { currentState = AIState.Patrol; return NodeState.Success; }));

        // 添加到根节点
        root.AddChild(combatSequence);
        root.AddChild(chaseSequence);
        root.AddChild(patrolSequence);
    }

    protected override void UpdateAI()
    {
        if (root != null)
        {
            root.Evaluate();
        }

        base.UpdateAI();
    }

    protected override void UpdatePatrolState()
    {
        // 行为树AI的巡逻逻辑
        base.UpdatePatrolState();
    }

    protected override void UpdateChaseState()
    {
        // 行为树AI的追击逻辑
        base.UpdateChaseState();
    }

    protected override void UpdateAttackState()
    {
        // 行为树AI的攻击逻辑
        base.UpdateAttackState();
    }

    protected override void OnAttack()
    {
        Debug.Log($"{gameObject.name} 使用行为树执行攻击!");
    }

    // 黑板系统 - 用于节点间共享数据
    public T GetBlackboardValue<T>(string key)
    {
        if (blackboard.ContainsKey(key))
        {
            return (T)blackboard[key];
        }
        return default(T);
    }

    public void SetBlackboardValue(string key, object value)
    {
        if (blackboard.ContainsKey(key))
        {
            blackboard[key] = value;
        }
        else
        {
            blackboard.Add(key, value);
        }
    }
}
```

---

## 碰撞检测和物理系统

### 碰撞检测基础

```csharp
using UnityEngine;

// 碰撞检测管理器
public class CollisionManager : MonoBehaviour
{
    [Header("物理设置")]
    public LayerMask collisionLayers = -1;
    public float detectionRadius = 1f;

    void Start()
    {
        SetupCollisionDetection();
    }

    private void SetupCollisionDetection()
    {
        // 确保有碰撞器组件
        if (GetComponent<Collider>() == null)
        {
            // 根据需要添加适当的碰撞器
            if (GetComponent<Rigidbody>() != null)
            {
                gameObject.AddComponent<BoxCollider>();
            }
            else
            {
                gameObject.AddComponent<SphereCollider>();
            }
        }
    }

    // 触发器检测
    void OnTriggerEnter(Collider other)
    {
        HandleTriggerEnter(other);
    }

    void OnTriggerExit(Collider other)
    {
        HandleTriggerExit(other);
    }

    // 碰撞检测
    void OnCollisionEnter(Collision collision)
    {
        HandleCollisionEnter(collision);
    }

    void OnCollisionExit(Collision collision)
    {
        HandleCollisionExit(collision);
    }

    // 处理触发器进入
    protected virtual void HandleTriggerEnter(Collider other)
    {
        if (other.CompareTag("Player"))
        {
            OnPlayerEnter(other.gameObject);
        }
        else if (other.CompareTag("Enemy"))
        {
            OnEnemyEnter(other.gameObject);
        }
        else if (other.CompareTag("Collectible"))
        {
            OnCollectibleEnter(other.gameObject);
        }
        else if (other.CompareTag("Obstacle"))
        {
            OnObstacleEnter(other.gameObject);
        }
    }

    // 处理触发器退出
    protected virtual void HandleTriggerExit(Collider other)
    {
        if (other.CompareTag("Player"))
        {
            OnPlayerExit(other.gameObject);
        }
        else if (other.CompareTag("Enemy"))
        {
            OnEnemyExit(other.gameObject);
        }
    }

    // 处理碰撞进入
    protected virtual void HandleCollisionEnter(Collision collision)
    {
        if (collision.gameObject.CompareTag("Player"))
        {
            OnPlayerCollision(collision);
        }
        else if (collision.gameObject.CompareTag("Bullet"))
        {
            OnBulletCollision(collision);
        }
        else if (collision.gameObject.CompareTag("Environment"))
        {
            OnEnvironmentCollision(collision);
        }
    }

    // 处理碰撞退出
    protected virtual void HandleCollisionExit(Collision collision)
    {
        // 碰撞结束处理
    }

    // 玩家相关事件
    protected virtual void OnPlayerEnter(GameObject player)
    {
        Debug.Log($"玩家进入区域: {player.name}");
    }

    protected virtual void OnPlayerExit(GameObject player)
    {
        Debug.Log($"玩家离开区域: {player.name}");
    }

    protected virtual void OnPlayerCollision(Collision collision)
    {
        // 玩家碰撞处理
        PlayerController playerCtrl = collision.gameObject.GetComponent<PlayerController>();
        if (playerCtrl != null)
        {
            // 根据碰撞力度造成伤害
            float impactForce = collision.relativeVelocity.magnitude;
            if (impactForce > 5f) // 只有足够大的冲击才造成伤害
            {
                playerCtrl.TakeDamage(impactForce);
            }
        }
    }

    // 敌人相关事件
    protected virtual void OnEnemyEnter(GameObject enemy)
    {
        // 敌人进入区域的处理
    }

    protected virtual void OnEnemyExit(GameObject enemy)
    {
        // 敌人离开区域的处理
    }

    // 收集品相关事件
    protected virtual void OnCollectibleEnter(GameObject collectible)
    {
        // 自动收集
        if (collectible.CompareTag("Collectible"))
        {
            CollectibleItem item = collectible.GetComponent<CollectibleItem>();
            if (item != null)
            {
                item.Collect();
            }
        }
    }

    // 障碍物相关事件
    protected virtual void OnObstacleEnter(GameObject obstacle)
    {
        // 障碍物进入处理
    }

    // 子弹相关事件
    protected virtual void OnBulletCollision(Collision collision)
    {
        // 子弹碰撞处理
        Bullet bullet = collision.gameObject.GetComponent<Bullet>();
        if (bullet != null)
        {
            bullet.OnHit(collision);
        }
    }

    // 环境碰撞
    protected virtual void OnEnvironmentCollision(Collision collision)
    {
        // 与环境的碰撞处理
        // 例如：落地音效、撞击效果等
        if (collision.relativeVelocity.magnitude > 3f)
        {
            AudioManager.Instance?.PlaySFX("Impact");
        }
    }

    // 射线检测工具
    public bool RaycastToTarget(Vector3 start, Vector3 direction, float distance, out RaycastHit hit)
    {
        return Physics.Raycast(start, direction, out hit, distance, collisionLayers);
    }

    // 球形检测工具
    public Collider[] SphereCast(Vector3 center, float radius)
    {
        return Physics.OverlapSphere(center, radius, collisionLayers);
    }

    // 盒子检测工具
    public Collider[] BoxCast(Vector3 center, Vector3 halfExtents, Quaternion orientation)
    {
        return Physics.OverlapBox(center, halfExtents, orientation, collisionLayers);
    }

    // 可视化碰撞检测范围
    void OnDrawGizmos()
    {
        Gizmos.color = Color.yellow;
        Gizmos.DrawWireSphere(transform.position, detectionRadius);
    }
}

// 收集品物品
public class CollectibleItem : MonoBehaviour
{
    [Header("收集品设置")]
    public string itemName = "Item";
    public int value = 10;
    public float rotationSpeed = 30f;
    public bool autoRotate = true;

    [Header("收集效果")]
    public GameObject collectEffect;
    public AudioClip collectSound;

    void Update()
    {
        if (autoRotate)
        {
            transform.Rotate(Vector3.up, rotationSpeed * Time.deltaTime);
        }
    }

    public virtual void Collect()
    {
        // 增加分数
        GameManager.Instance?.AddScore(value);

        // 播放收集效果
        if (collectEffect != null)
        {
            Instantiate(collectEffect, transform.position, Quaternion.identity);
        }

        if (collectSound != null && AudioManager.Instance != null)
        {
            AudioManager.Instance.PlaySFX(collectSound.name);
        }

        // 触发收集事件
        GameEvents.TriggerItemCollected(itemName);

        // 销毁物品
        Destroy(gameObject);
    }

    // 检测玩家接近
    void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("Player"))
        {
            Collect();
        }
    }
}

// 子弹类
public class Bullet : MonoBehaviour
{
    [Header("子弹设置")]
    public float speed = 20f;
    public float damage = 25f;
    public float lifeTime = 5f;
    public GameObject hitEffect;

    private Vector3 direction;
    private float lifeTimer = 0f;

    void Start()
    {
        Destroy(gameObject, lifeTime);
    }

    void Update()
    {
        transform.Translate(direction * speed * Time.deltaTime);
        lifeTimer += Time.deltaTime;

        if (lifeTimer >= lifeTime)
        {
            Destroy(gameObject);
        }
    }

    public void SetDirection(Vector3 dir)
    {
        direction = dir.normalized;
        // 设置子弹朝向
        transform.rotation = Quaternion.LookRotation(direction);
    }

    public void OnHit(Collision collision)
    {
        // 创建命中效果
        if (hitEffect != null)
        {
            Instantiate(hitEffect, transform.position, Quaternion.identity);
        }

        // 对命中目标造成伤害
        HealthComponent health = collision.gameObject.GetComponent<HealthComponent>();
        if (health != null)
        {
            health.TakeDamage(damage);
        }

        // 销毁子弹
        Destroy(gameObject);
    }

    // 碰撞检测
    void OnCollisionEnter(Collision collision)
    {
        OnHit(collision);
    }
}
```

### 物理交互系统

```csharp
using UnityEngine;

// 物理交互管理器
public class PhysicsInteractionManager : MonoBehaviour
{
    [Header("交互设置")]
    public float interactionDistance = 3f;
    public LayerMask interactableLayers;

    private Camera playerCamera;

    void Start()
    {
        playerCamera = Camera.main;
    }

    void Update()
    {
        HandleInteractionInput();
    }

    private void HandleInteractionInput()
    {
        if (Input.GetKeyDown(KeyCode.E))
        {
            TryInteract();
        }
    }

    private void TryInteract()
    {
        if (playerCamera == null) return;

        Ray ray = playerCamera.ViewportPointToRay(new Vector3(0.5f, 0.5f, 0));
        RaycastHit hit;

        if (Physics.Raycast(ray, out hit, interactionDistance, interactableLayers))
        {
            IInteractable interactable = hit.collider.GetComponent<IInteractable>();
            if (interactable != null)
            {
                interactable.Interact();
            }
            else
            {
                // 尝试其他交互组件
                HandleGenericInteraction(hit);
            }
        }
    }

    private void HandleGenericInteraction(RaycastHit hit)
    {
        // 处理没有特定交互接口的物体
        if (hit.collider.CompareTag("Door"))
        {
            ToggleDoor(hit.collider.gameObject);
        }
        else if (hit.collider.CompareTag("Switch"))
        {
            ActivateSwitch(hit.collider.gameObject);
        }
        else if (hit.collider.CompareTag("Lever"))
        {
            ToggleLever(hit.collider.gameObject);
        }
    }

    private void ToggleDoor(GameObject door)
    {
        // 门的开关逻辑
        DoorController doorCtrl = door.GetComponent<DoorController>();
        if (doorCtrl != null)
        {
            doorCtrl.Toggle();
        }
        else
        {
            // 简单的开关效果
            door.SetActive(!door.activeSelf);
        }
    }

    private void ActivateSwitch(GameObject switchObj)
    {
        // 开关激活逻辑
        SwitchController switchCtrl = switchObj.GetComponent<SwitchController>();
        if (switchCtrl != null)
        {
            switchCtrl.Activate();
        }
    }

    private void ToggleLever(GameObject lever)
    {
        // 杠杆切换逻辑
        LeverController leverCtrl = lever.GetComponent<LeverController>();
        if (leverCtrl != null)
        {
            leverCtrl.Toggle();
        }
    }

    // 可交互接口
    public interface IInteractable
    {
        void Interact();
        string GetInteractionText();
    }

    // 可破坏物体
    public class BreakableObject : MonoBehaviour, IInteractable
    {
        [Header("破坏设置")]
        public int health = 50;
        public GameObject brokenPrefab;
        public GameObject[] dropItems;
        public float explosionForce = 10f;
        public float explosionRadius = 5f;

        public void Interact()
        {
            TakeDamage(health); // 立即破坏
        }

        public void TakeDamage(int damage)
        {
            health -= damage;
            
            if (health <= 0)
            {
                Break();
            }
        }

        private void Break()
        {
            // 创建破坏效果
            if (brokenPrefab != null)
            {
                Instantiate(brokenPrefab, transform.position, transform.rotation);
            }

            // 爆炸效果
            Explode();

            // 掉落物品
            DropItems();

            // 销毁原物体
            Destroy(gameObject);
        }

        private void Explode()
        {
            Collider[] colliders = Physics.OverlapSphere(transform.position, explosionRadius);
            foreach (Collider collider in colliders)
            {
                Rigidbody rb = collider.GetComponent<Rigidbody>();
                if (rb != null)
                {
                    rb.AddExplosionForce(explosionForce, transform.position, explosionRadius);
                }
            }
        }

        private void DropItems()
        {
            foreach (GameObject item in dropItems)
            {
                if (item != null && Random.value > 0.5f) // 50% 概率掉落
                {
                    GameObject droppedItem = Instantiate(item, transform.position, Quaternion.identity);
                    
                    // 给掉落物添加随机力
                    Rigidbody rb = droppedItem.GetComponent<Rigidbody>();
                    if (rb != null)
                    {
                        rb.AddForce(Random.insideUnitSphere * 5f, ForceMode.Impulse);
                    }
                }
            }
        }

        public string GetInteractionText()
        {
            return health > 0 ? "破坏" : "已破坏";
        }
    }

    // 门控制器
    public class DoorController : MonoBehaviour, IInteractable
    {
        [Header("门设置")]
        public float openSpeed = 2f;
        public Vector3 openPosition;
        public Vector3 closedPosition;
        public bool isOpen = false;

        private bool isMoving = false;

        void Start()
        {
            closedPosition = transform.localPosition;
            openPosition = transform.localPosition + Vector3.up * 2f; // 向上移动2单位
        }

        public void Interact()
        {
            Toggle();
        }

        public void Toggle()
        {
            if (!isMoving)
            {
                isOpen = !isOpen;
                StartCoroutine(MoveDoor());
            }
        }

        private System.Collections.IEnumerator MoveDoor()
        {
            isMoving = true;
            Vector3 targetPosition = isOpen ? openPosition : closedPosition;
            Vector3 startPosition = transform.localPosition;
            float journeyLength = Vector3.Distance(startPosition, targetPosition);
            float startTime = Time.time;

            while (transform.localPosition != targetPosition)
            {
                float distCovered = (Time.time - startTime) * openSpeed;
                float fractionOfJourney = distCovered / journeyLength;
                transform.localPosition = Vector3.Lerp(startPosition, targetPosition, fractionOfJourney);
                
                yield return null;
            }

            isMoving = false;
        }

        public string GetInteractionText()
        {
            return isOpen ? "关闭" : "打开";
        }
    }

    // 开关控制器
    public class SwitchController : MonoBehaviour, IInteractable
    {
        [Header("开关设置")]
        public bool isActivated = false;
        public GameObject[] affectedObjects;
        public float activationDuration = 5f;

        public void Interact()
        {
            Activate();
        }

        public void Activate()
        {
            isActivated = !isActivated;
            
            // 激活相关对象
            foreach (GameObject obj in affectedObjects)
            {
                if (obj != null)
                {
                    obj.SetActive(isActivated);
                    
                    // 如果有特殊激活逻辑
                    IActivatable activatable = obj.GetComponent<IActivatable>();
                    if (activatable != null)
                    {
                        activatable.Activate(isActivated);
                    }
                }
            }

            // 如果是临时激活，启动倒计时
            if (isActivated && activationDuration > 0)
            {
                Invoke("Deactivate", activationDuration);
            }
        }

        private void Deactivate()
        {
            if (isActivated)
            {
                Activate(); // 切换回未激活状态
            }
        }

        public string GetInteractionText()
        {
            return isActivated ? "关闭" : "激活";
        }
    }

    // 可激活接口
    public interface IActivatable
    {
        void Activate(bool isActive);
    }

    // 杠杆控制器
    public class LeverController : MonoBehaviour, IInteractable
    {
        [Header("杠杆设置")]
        public bool isOn = false;
        public Vector3 onRotation = new Vector3(0, 0, -90);
        public Vector3 offRotation = new Vector3(0, 0, 0);
        public GameObject[] connectedObjects;

        public void Interact()
        {
            Toggle();
        }

        public void Toggle()
        {
            isOn = !isOn;
            
            // 平滑旋转到新位置
            StartCoroutine(RotateLever());
            
            // 激活连接的对象
            foreach (GameObject obj in connectedObjects)
            {
                if (obj != null)
                {
                    obj.SetActive(isOn);
                }
            }
        }

        private System.Collections.IEnumerator RotateLever()
        {
            Quaternion startRotation = transform.localRotation;
            Quaternion targetRotation = Quaternion.Euler(isOn ? onRotation : offRotation);
            float duration = 0.5f;
            float elapsed = 0f;

            while (elapsed < duration)
            {
                transform.localRotation = Quaternion.Lerp(startRotation, targetRotation, elapsed / duration);
                elapsed += Time.deltaTime;
                yield return null;
            }

            transform.localRotation = targetRotation;
        }

        public string GetInteractionText()
        {
            return isOn ? "关闭" : "打开";
        }
    }
}
```

---

## UI系统集成

### UI管理器

```csharp
using UnityEngine;
using UnityEngine.UI;
using System.Collections;

// UI管理器
public class UIManager : MonoBehaviour, IGameSystem, IEventListener
{
    [Header("UI画布")]
    public Canvas uiCanvas;
    public Camera uiCamera;

    [Header("主要UI面板")]
    public GameObject mainMenuPanel;
    public GameObject gameUIPanel;
    public GameObject pauseMenuPanel;
    public GameObject gameOverPanel;
    public GameObject inventoryPanel;

    [Header("游戏UI元素")]
    public Text scoreText;
    public Text levelText;
    public Text healthText;
    public Slider healthBar;
    public Text ammoText;
    public Image crosshair;
    public Text interactText;

    [Header("动画设置")]
    public Animator uiAnimator;
    public float panelTransitionTime = 0.3f;

    private PlayerController player;
    private bool isInventoryOpen = false;

    public void Initialize()
    {
        SetupUI();
        SubscribeToEvents();
    }

    private void SetupUI()
    {
        // 初始化UI画布
        if (uiCanvas == null)
        {
            GameObject canvasGO = new GameObject("UICanvas");
            uiCanvas = canvasGO.AddComponent<Canvas>();
            uiCanvas.renderMode = RenderMode.ScreenSpaceOverlay;
            
            canvasGO.AddComponent<CanvasScaler>();
            canvasGO.AddComponent<GraphicRaycaster>();
        }

        if (uiCamera == null)
        {
            uiCamera = Camera.main;
        }

        // 初始化面板
        SetupPanels();
    }

    private void SetupPanels()
    {
        // 设置初始面板状态
        SetPanelActive(mainMenuPanel, true);
        SetPanelActive(gameUIPanel, false);
        SetPanelActive(pauseMenuPanel, false);
        SetPanelActive(gameOverPanel, false);
        SetPanelActive(inventoryPanel, false);

        // 设置UI元素初始值
        UpdateScore(0);
        UpdateLevel(1);
        UpdateHealth(100);
        UpdateAmmo(30);
    }

    private void SubscribeToEvents()
    {
        GameEvents.OnScoreChanged += UpdateScore;
        GameEvents.OnLevelChanged += UpdateLevel;
        GameEvents.OnGameStateChange += OnGameStateChange;
        GameEvents.OnGameStart += OnGameStart;
        GameEvents.OnGameOver += OnGameOver;
        GameEvents.OnPlayerDeath += OnPlayerDeath;
        GameEvents.OnItemCollected += OnItemCollected;
    }

    public void Update(float deltaTime)
    {
        UpdateCrosshair();
        UpdateInteractionPrompt();
    }

    // 更新分数显示
    public void UpdateScore(int newScore)
    {
        if (scoreText != null)
        {
            scoreText.text = $"Score: {newScore}";
        }
    }

    // 更新关卡显示
    public void UpdateLevel(int newLevel)
    {
        if (levelText != null)
        {
            levelText.text = $"Level: {newLevel}";
        }
    }

    // 更新健康显示
    public void UpdateHealth(float healthPercentage)
    {
        if (healthBar != null)
        {
            healthBar.value = healthPercentage;
        }

        if (healthText != null)
        {
            healthText.text = $"HP: {(int)(healthPercentage * 100)}%";
        }
    }

    // 更新弹药显示
    public void UpdateAmmo(int currentAmmo, int maxAmmo = -1)
    {
        if (ammoText != null)
        {
            if (maxAmmo >= 0)
            {
                ammoText.text = $"Ammo: {currentAmmo}/{maxAmmo}";
            }
            else
            {
                ammoText.text = $"Ammo: {currentAmmo}";
            }
        }
    }

    // 更新准星
    private void UpdateCrosshair()
    {
        if (crosshair != null)
        {
            if (GameManager.Instance.CurrentState == GameState.Playing)
            {
                crosshair.gameObject.SetActive(true);
            }
            else
            {
                crosshair.gameObject.SetActive(false);
            }
        }
    }

    // 更新交互提示
    private void UpdateInteractionPrompt()
    {
        if (interactText != null)
        {
            // 检测玩家附近的可交互物体
            if (GameManager.Instance.Player != null)
            {
                // 这里需要实现射线检测来找到可交互物体
                // 简化版本：显示默认提示
                interactText.text = "Press [E] to interact";
            }
            else
            {
                interactText.text = "";
            }
        }
    }

    // 设置面板激活状态
    private void SetPanelActive(GameObject panel, bool active)
    {
        if (panel != null)
        {
            panel.SetActive(active);
        }
    }

    // 显示主菜单
    public void ShowMainMenu()
    {
        SetPanelActive(mainMenuPanel, true);
        SetPanelActive(gameUIPanel, false);
        SetPanelActive(pauseMenuPanel, false);
        SetPanelActive(gameOverPanel, false);
        SetPanelActive(inventoryPanel, false);
    }

    // 开始游戏
    public void StartGame()
    {
        GameManager.Instance.StartGame();
        SetPanelActive(mainMenuPanel, false);
        SetPanelActive(gameUIPanel, true);
        SetPanelActive(pauseMenuPanel, false);
        SetPanelActive(gameOverPanel, false);
    }

    // 暂停游戏
    public void PauseGame()
    {
        GameManager.Instance.PauseGame();
        SetPanelActive(pauseMenuPanel, true);
    }

    // 恢复游戏
    public void ResumeGame()
    {
        GameManager.Instance.ResumeGame();
        SetPanelActive(pauseMenuPanel, false);
    }

    // 游戏结束
    public void GameOver()
    {
        SetPanelActive(gameOverPanel, true);
    }

    // 切换背包
    public void ToggleInventory()
    {
        isInventoryOpen = !isInventoryOpen;
        SetPanelActive(inventoryPanel, isInventoryOpen);
        
        if (isInventoryOpen)
        {
            UpdateInventoryDisplay();
        }
    }

    // 更新背包显示
    private void UpdateInventoryDisplay()
    {
        // 这里实现背包物品的显示逻辑
        // 可以通过Grid布局显示物品图标等
    }

    // 按钮事件处理
    public void OnStartButton()
    {
        StartGame();
    }

    public void OnPauseButton()
    {
        PauseGame();
    }

    public void OnResumeButton()
    {
        ResumeGame();
    }

    public void OnRestartButton()
    {
        GameManager.Instance.StartGame();
        SetPanelActive(gameOverPanel, false);
        SetPanelActive(gameUIPanel, true);
    }

    public void OnQuitButton()
    {
        #if UNITY_EDITOR
        UnityEditor.EditorApplication.isPlaying = false;
        #else
        Application.Quit();
        #endif
    }

    // 事件处理
    public void OnGameStateChange(GameState oldState, GameState newState)
    {
        switch (newState)
        {
            case GameState.MainMenu:
                ShowMainMenu();
                break;
            case GameState.Playing:
                SetPanelActive(gameUIPanel, true);
                SetPanelActive(pauseMenuPanel, false);
                break;
            case GameState.Paused:
                SetPanelActive(pauseMenuPanel, true);
                break;
            case GameState.GameOver:
                GameOver();
                break;
        }
    }

    private void OnGameStart()
    {
        UpdateScore(0);
        UpdateLevel(1);
    }

    private void OnGameOver()
    {
        SetPanelActive(gameOverPanel, true);
        SetPanelActive(gameUIPanel, false);
    }

    private void OnPlayerDeath(GameObject player)
    {
        // 玩家死亡时的UI处理
        UpdateHealth(0);
    }

    private void OnItemCollected(string itemName)
    {
        // 显示物品收集提示
        StartCoroutine(ShowItemCollectedPrompt(itemName));
    }

    private IEnumerator ShowItemCollectedPrompt(string itemName)
    {
        if (interactText != null)
        {
            string originalText = interactText.text;
            interactText.text = $"Collected: {itemName}";
            yield return new WaitForSeconds(2f);
            interactText.text = originalText;
        }
    }

    public void Shutdown()
    {
        GameEvents.OnScoreChanged -= UpdateScore;
        GameEvents.OnLevelChanged -= UpdateLevel;
        GameEvents.OnGameStateChange -= OnGameStateChange;
        GameEvents.OnGameStart -= OnGameStart;
        GameEvents.OnGameOver -= OnGameOver;
        GameEvents.OnPlayerDeath -= OnPlayerDeath;
        GameEvents.OnItemCollected -= OnItemCollected;
    }
}
```

### 动态UI元素

```csharp
using UnityEngine;
using UnityEngine.UI;
using System.Collections.Generic;

// 动态UI元素管理器
public class DynamicUIManager : MonoBehaviour
{
    [Header("UI预制件")]
    public GameObject healthBarPrefab;
    public GameObject damagePopupPrefab;
    public GameObject minimapMarkerPrefab;

    [Header("UI容器")]
    public Transform worldSpaceUIParent;
    public Transform screenSpaceUIParent;

    private Dictionary<GameObject, GameObject> trackedObjects = new Dictionary<GameObject, GameObject>();
    private List<GameObject> damagePopups = new List<GameObject>();

    void Start()
    {
        SetupUIContainers();
    }

    private void SetupUIContainers()
    {
        if (worldSpaceUIParent == null)
        {
            GameObject parentGO = new GameObject("WorldSpaceUI");
            worldSpaceUIParent = parentGO.transform;
        }

        if (screenSpaceUIParent == null)
        {
            GameObject parentGO = new GameObject("ScreenSpaceUI");
            parentGO.transform.SetParent(UIManager.Instance.uiCanvas.transform);
            screenSpaceUIParent = parentGO.transform;
        }
    }

    // 为对象添加健康条
    public GameObject AddHealthBar(GameObject targetObject)
    {
        if (healthBarPrefab == null) return null;

        GameObject healthBarGO = Instantiate(healthBarPrefab, worldSpaceUIParent);
        HealthBar healthBar = healthBarGO.GetComponent<HealthBar>();
        
        if (healthBar != null)
        {
            healthBar.Initialize(targetObject);
        }

        trackedObjects[targetObject] = healthBarGO;
        return healthBarGO;
    }

    // 移除健康条
    public void RemoveHealthBar(GameObject targetObject)
    {
        if (trackedObjects.ContainsKey(targetObject))
        {
            GameObject healthBar = trackedObjects[targetObject];
            if (healthBar != null)
            {
                Destroy(healthBar);
            }
            trackedObjects.Remove(targetObject);
        }
    }

    // 显示伤害弹出
    public void ShowDamagePopup(GameObject target, int damage, bool isCritical = false)
    {
        if (damagePopupPrefab == null) return;

        GameObject popupGO = Instantiate(damagePopupPrefab, screenSpaceUIParent);
        DamagePopup popup = popupGO.GetComponent<DamagePopup>();
        
        if (popup != null)
        {
            popup.Initialize(damage, isCritical);
        }

        // 添加到列表以便管理
        damagePopups.Add(popupGO);

        // 自动销毁
        Destroy(popupGO, 2f);
    }

    // 创建小地图标记
    public GameObject AddMinimapMarker(GameObject targetObject, Color color)
    {
        if (minimapMarkerPrefab == null) return null;

        GameObject markerGO = Instantiate(minimapMarkerPrefab, screenSpaceUIParent);
        MinimapMarker marker = markerGO.GetComponent<MinimapMarker>();
        
        if (marker != null)
        {
            marker.Initialize(targetObject, color);
        }

        return markerGO;
    }

    // 更新所有追踪的UI元素
    void LateUpdate()
    {
        UpdateTrackedObjects();
        UpdateDamagePopups();
    }

    private void UpdateTrackedObjects()
    {
        foreach (var pair in new Dictionary<GameObject, GameObject>(trackedObjects))
        {
            GameObject target = pair.Key;
            GameObject uiElement = pair.Value;

            if (target == null || uiElement == null)
            {
                // 清理无效引用
                if (target == null)
                {
                    RemoveHealthBar(target);
                }
                if (uiElement == null)
                {
                    trackedObjects.Remove(target);
                }
                continue;
            }

            // 更新UI位置（朝向摄像机）
            HealthBar healthBar = uiElement.GetComponent<HealthBar>();
            if (healthBar != null)
            {
                healthBar.UpdatePosition();
            }
        }
    }

    private void UpdateDamagePopups()
    {
        // 更新伤害弹出位置和动画
        for (int i = damagePopups.Count - 1; i >= 0; i--)
        {
            GameObject popup = damagePopups[i];
            if (popup == null)
            {
                damagePopups.RemoveAt(i);
                continue;
            }

            DamagePopup popupComp = popup.GetComponent<DamagePopup>();
            if (popupComp != null)
            {
                popupComp.UpdateAnimation();
            }
        }
    }

    // 健康条组件
    public class HealthBar : MonoBehaviour
    {
        private GameObject targetObject;
        private HealthComponent healthComponent;
        private Slider healthSlider;
        private Camera uiCamera;

        public void Initialize(GameObject target)
        {
            targetObject = target;
            healthComponent = target.GetComponent<HealthComponent>();
            
            healthSlider = GetComponent<Slider>();
            if (healthSlider == null)
            {
                healthSlider = GetComponentInChildren<Slider>();
            }

            uiCamera = Camera.main;
        }

        public void UpdatePosition()
        {
            if (targetObject != null && uiCamera != null)
            {
                // 将世界位置转换为屏幕位置
                Vector3 worldPos = targetObject.transform.position + Vector3.up * 2f; // 稍微高一点
                Vector3 screenPos = uiCamera.WorldToScreenPoint(worldPos);
                
                // 设置UI位置
                transform.position = screenPos;

                // 朝向摄像机
                transform.LookAt(uiCamera.transform);
                transform.Rotate(0, 180, 0); // 翻转朝向
            }

            // 更新健康值
            if (healthComponent != null && healthSlider != null)
            {
                healthSlider.value = healthComponent.GetHealthPercentage();
            }
        }
    }

    // 伤害弹出组件
    public class DamagePopup : MonoBehaviour
    {
        private Text damageText;
        private Color originalColor;
        private float startTime;
        private Vector3 startPos;
        private float floatSpeed = 1f;
        private float fadeDuration = 1f;

        public void Initialize(int damage, bool isCritical)
        {
            damageText = GetComponent<Text>();
            if (damageText == null)
            {
                damageText = GetComponentInChildren<Text>();
            }

            if (damageText != null)
            {
                damageText.text = damage.ToString();
                
                if (isCritical)
                {
                    damageText.fontSize = Mathf.RoundToInt(damageText.fontSize * 1.5f);
                    damageText.color = Color.red;
                }
            }

            originalColor = damageText.color;
            startTime = Time.time;
            startPos = transform.position;
        }

        public void UpdateAnimation()
        {
            if (damageText == null) return;

            float elapsed = Time.time - startTime;
            
            // 向上浮动
            transform.position = startPos + Vector3.up * floatSpeed * elapsed;
            
            // 淡出效果
            float alpha = 1f - (elapsed / fadeDuration);
            damageText.color = new Color(originalColor.r, originalColor.g, originalColor.b, alpha);

            if (elapsed >= fadeDuration)
            {
                Destroy(gameObject);
            }
        }
    }

    // 小地图标记组件
    public class MinimapMarker : MonoBehaviour
    {
        private GameObject targetObject;
        private RectTransform rectTransform;
        private Image markerImage;
        private Camera mainCamera;

        public void Initialize(GameObject target, Color color)
        {
            targetObject = target;
            rectTransform = GetComponent<RectTransform>();
            markerImage = GetComponent<Image>();
            
            if (markerImage != null)
            {
                markerImage.color = color;
            }

            mainCamera = Camera.main;
        }

        void Update()
        {
            if (targetObject != null && mainCamera != null && rectTransform != null)
            {
                // 计算目标在小地图上的位置
                Vector3 targetPos = targetObject.transform.position;
                Vector3 playerPos = mainCamera.transform.position;
                
                // 相对于玩家的位置
                Vector3 relativePos = targetPos - playerPos;
                relativePos.y = 0; // 忽略高度
                
                // 转换为UI坐标（简化版本）
                float mapScale = 0.1f; // 缩放因子
                Vector2 mapPos = new Vector2(relativePos.x, relativePos.z) * mapScale;
                
                rectTransform.anchoredPosition = mapPos;
                
                // 限制在小地图范围内
                float mapRadius = 100f; // 小地图半径
                if (rectTransform.anchoredPosition.magnitude > mapRadius)
                {
                    rectTransform.anchoredPosition = rectTransform.anchoredPosition.normalized * mapRadius;
                }
            }
        }
    }
}
```

---

## 音频系统

### 音频管理器

```csharp
using UnityEngine;
using System.Collections.Generic;

// 音频类型枚举
public enum AudioType
{
    Music,
    SFX,
    Voice,
    Ambient
}

// 音频管理器
public class AudioManager : MonoBehaviour, IGameSystem
{
    [Header("音频设置")]
    public float masterVolume = 1f;
    public float musicVolume = 1f;
    public float sfxVolume = 1f;
    public float voiceVolume = 1f;

    [Header("音频源")]
    public AudioSource musicSource;
    public AudioSource sfxSource;
    public AudioSource voiceSource;
    public AudioSource ambientSource;

    [Header("音频剪辑")]
    public List<AudioClip> musicClips = new List<AudioClip>();
    public List<AudioClip> sfxClips = new List<AudioClip>();
    public List<AudioClip> voiceClips = new List<AudioClip>();

    private Dictionary<string, AudioClip> audioClipDictionary = new Dictionary<string, AudioClip>();
    private Dictionary<AudioType, AudioSource> audioSourceDictionary = new Dictionary<AudioType, AudioSource>();
    private Queue<AudioClip> musicQueue = new Queue<AudioClip>();
    private bool isMusicPlaying = false;

    public static AudioManager Instance { get; private set; }

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

    public void Initialize()
    {
        SetupAudioSources();
        SetupAudioClips();
    }

    private void SetupAudioSources()
    {
        // 创建音频源（如果没有设置的话）
        if (musicSource == null)
        {
            GameObject musicGO = new GameObject("MusicSource");
            musicGO.transform.SetParent(transform);
            musicSource = musicGO.AddComponent<AudioSource>();
            musicSource.playOnAwake = false;
            musicSource.loop = true;
        }

        if (sfxSource == null)
        {
            GameObject sfxGO = new GameObject("SFXSource");
            sfxGO.transform.SetParent(transform);
            sfxSource = sfxGO.AddComponent<AudioSource>();
            sfxSource.playOnAwake = false;
            sfxSource.loop = false;
        }

        if (voiceSource == null)
        {
            GameObject voiceGO = new GameObject("VoiceSource");
            voiceGO.transform.SetParent(transform);
            voiceSource = voiceGO.AddComponent<AudioSource>();
            voiceSource.playOnAwake = false;
            voiceSource.loop = false;
        }

        if (ambientSource == null)
        {
            GameObject ambientGO = new GameObject("AmbientSource");
            ambientGO.transform.SetParent(transform);
            ambientSource = ambientGO.AddComponent<AudioSource>();
            ambientSource.playOnAwake = false;
            ambientSource.loop = true;
        }

        // 设置音量
        UpdateVolumes();

        // 建立音频源字典
        audioSourceDictionary[AudioType.Music] = musicSource;
        audioSourceDictionary[AudioType.SFX] = sfxSource;
        audioSourceDictionary[AudioType.Voice] = voiceSource;
        audioSourceDictionary[AudioType.Ambient] = ambientSource;
    }

    private void SetupAudioClips()
    {
        // 建立音频剪辑字典
        foreach (AudioClip clip in musicClips)
        {
            if (clip != null)
            {
                audioClipDictionary[$"Music_{clip.name}"] = clip;
            }
        }

        foreach (AudioClip clip in sfxClips)
        {
            if (clip != null)
            {
                audioClipDictionary[$"SFX_{clip.name}"] = clip;
            }
        }

        foreach (AudioClip clip in voiceClips)
        {
            if (clip != null)
            {
                audioClipDictionary[$"Voice_{clip.name}"] = clip;
            }
        }
    }

    public void Update(float deltaTime)
    {
        // 音频系统更新逻辑
        // 例如：动态音乐切换、环境音效调整等
    }

    // 播放音乐
    public void PlayMusic(string musicName, bool loop = true)
    {
        if (audioClipDictionary.TryGetValue($"Music_{musicName}", out AudioClip clip))
        {
            PlayAudio(clip, AudioType.Music, loop);
        }
        else
        {
            Debug.LogWarning($"Music clip '{musicName}' not found!");
        }
    }

    // 播放音效
    public void PlaySFX(string sfxName)
    {
        if (audioClipDictionary.TryGetValue($"SFX_{sfxName}", out AudioClip clip))
        {
            PlayAudio(clip, AudioType.SFX, false);
        }
        else
        {
            Debug.LogWarning($"SFX clip '{sfxName}' not found!");
        }
    }

    // 播放语音
    public void PlayVoice(string voiceName)
    {
        if (audioClipDictionary.TryGetValue($"Voice_{voiceName}", out AudioClip clip))
        {
            PlayAudio(clip, AudioType.Voice, false);
        }
        else
        {
            Debug.LogWarning($"Voice clip '{voiceName}' not found!");
        }
    }

    // 播放环境音
    public void PlayAmbient(string ambientName, bool loop = true)
    {
        if (audioClipDictionary.TryGetValue($"Ambient_{ambientName}", out AudioClip clip))
        {
            PlayAudio(clip, AudioType.Ambient, loop);
        }
    }

    // 播放音频的通用方法
    private void PlayAudio(AudioClip clip, AudioType audioType, bool loop)
    {
        if (clip == null) return;

        AudioSource source = audioSourceDictionary[audioType];
        if (source != null)
        {
            source.clip = clip;
            source.loop = loop;
            
            // 设置音量
            float volume = 1f;
            switch (audioType)
            {
                case AudioType.Music:
                    volume = musicVolume;
                    break;
                case AudioType.SFX:
                    volume = sfxVolume;
                    break;
                case AudioType.Voice:
                    volume = voiceVolume;
                    break;
                case AudioType.Ambient:
                    volume = masterVolume * 0.5f; // 环境音通常较轻
                    break;
            }
            
            source.volume = volume * masterVolume;
            source.Play();
        }
    }

    // 停止音频
    public void StopAudio(AudioType audioType)
    {
        AudioSource source = audioSourceDictionary[audioType];
        if (source != null)
        {
            source.Stop();
        }
    }

    // 暂停音频
    public void PauseAudio(AudioType audioType)
    {
        AudioSource source = audioSourceDictionary[audioType];
        if (source != null && source.isPlaying)
        {
            source.Pause();
        }
    }

    // 恢复音频
    public void ResumeAudio(AudioType audioType)
    {
        AudioSource source = audioSourceDictionary[audioType];
        if (source != null && source.isPlaying)
        {
            source.UnPause();
        }
    }

    // 更新音量
    public void UpdateVolumes()
    {
        if (musicSource != null)
        {
            musicSource.volume = musicVolume * masterVolume;
        }
        if (sfxSource != null)
        {
            sfxSource.volume = sfxVolume * masterVolume;
        }
        if (voiceSource != null)
        {
            voiceSource.volume = voiceVolume * masterVolume;
        }
        if (ambientSource != null)
        {
            ambientSource.volume = masterVolume * 0.5f;
        }
    }

    // 设置主音量
    public void SetMasterVolume(float volume)
    {
        masterVolume = Mathf.Clamp01(volume);
        UpdateVolumes();
    }

    // 设置音乐音量
    public void SetMusicVolume(float volume)
    {
        musicVolume = Mathf.Clamp01(volume);
        UpdateVolumes();
    }

    // 设置音效音量
    public void SetSFXVolume(float volume)
    {
        sfxVolume = Mathf.Clamp01(volume);
        UpdateVolumes();
    }

    // 设置语音音量
    public void SetVoiceVolume(float volume)
    {
        voiceVolume = Mathf.Clamp01(volume);
        UpdateVolumes();
    }

    // 播放下一个音乐（队列模式）
    public void QueueMusic(string musicName)
    {
        if (audioClipDictionary.TryGetValue($"Music_{musicName}", out AudioClip clip))
        {
            musicQueue.Enqueue(clip);
        }
    }

    // 播放队列中的下一个音乐
    public void PlayNextInQueue()
    {
        if (musicQueue.Count > 0)
        {
            AudioClip nextClip = musicQueue.Dequeue();
            if (musicSource != null)
            {
                musicSource.clip = nextClip;
                musicSource.Play();
            }
        }
    }

    // 3D音效
    public void Play3DSound(AudioClip clip, Vector3 position, float volume = 1f, float pitch = 1f)
    {
        if (clip == null) return;

        // 创建临时音频源来播放3D音效
        GameObject audioGO = new GameObject("3DAudioSource");
        audioGO.transform.position = position;
        AudioSource source = audioGO.AddComponent<AudioSource>();
        
        source.clip = clip;
        source.volume = volume;
        source.pitch = pitch;
        source.spatialBlend = 1f; // 3D音效
        source.maxDistance = 50f;
        source.rolloffMode = AudioRolloffMode.Logarithmic;
        
        source.Play();
        
        // 音效播放完后自动销毁
        Destroy(audioGO, clip.length);
    }

    // 距离衰减音效
    public void PlayDistanceSound(string sfxName, Vector3 position, float maxDistance = 30f)
    {
        if (audioClipDictionary.TryGetValue($"SFX_{sfxName}", out AudioClip clip))
        {
            // 根据距离计算音量
            if (Camera.main != null)
            {
                float distance = Vector3.Distance(position, Camera.main.transform.position);
                float volume = Mathf.Clamp01(1f - (distance / maxDistance));
                
                if (volume > 0.1f) // 只有在足够近时才播放
                {
                    Play3DSound(clip, position, volume);
                }
            }
        }
    }

    // 音频均衡器效果
    public void ApplyAudioEffect(AudioType audioType, AudioReverbFilter reverbFilter = null, AudioLowPassFilter lowPassFilter = null)
    {
        AudioSource source = audioSourceDictionary[audioType];
        if (source != null)
        {
            if (reverbFilter != null)
            {
                AudioReverbFilter existingReverb = source.GetComponent<AudioReverbFilter>();
                if (existingReverb == null)
                {
                    existingReverb = source.gameObject.AddComponent<AudioReverbFilter>();
                }
                // 应用混响设置
            }

            if (lowPassFilter != null)
            {
                AudioLowPassFilter existingLowPass = source.GetComponent<AudioLowPassFilter>();
                if (existingLowPass == null)
                {
                    existingLowPass = source.gameObject.AddComponent<AudioLowPassFilter>();
                }
                // 应用低通滤波设置
            }
        }
    }

    public void Shutdown()
    {
        // 停止所有音频
        foreach (AudioSource source in audioSourceDictionary.Values)
        {
            if (source != null)
            {
                source.Stop();
            }
        }
    }

    // 音频配置文件
    [System.Serializable]
    public class AudioProfile
    {
        public string profileName;
        public float masterVolume = 1f;
        public float musicVolume = 1f;
        public float sfxVolume = 1f;
        public float voiceVolume = 1f;
        public AudioRolloffMode rolloffMode = AudioRolloffMode.Logarithmic;
        public float dopplerLevel = 1f;
    }

    // 应用音频配置文件
    public void ApplyAudioProfile(AudioProfile profile)
    {
        masterVolume = profile.masterVolume;
        musicVolume = profile.musicVolume;
        sfxVolume = profile.sfxVolume;
        voiceVolume = profile.voiceVolume;
        
        UpdateVolumes();
        
        // 应用其他设置
        foreach (AudioSource source in audioSourceDictionary.Values)
        {
            if (source != null)
            {
                source.rolloffMode = profile.rolloffMode;
                source.dopplerLevel = profile.dopplerLevel;
            }
        }
    }
}
```

### 音效触发器

```csharp
using UnityEngine;

// 音效触发器
public class AudioTrigger : MonoBehaviour
{
    [Header("音效设置")]
    public string audioClipName;
    public AudioType audioType = AudioType.SFX;
    public bool playOnEnter = true;
    public bool playOnExit = false;
    public bool playOnCollision = false;
    public float volume = 1f;
    public float pitch = 1f;
    public bool loop = false;
    public float delay = 0f;

    [Header("3D音效设置")]
    public bool is3DSound = true;
    public float maxDistance = 30f;

    void OnTriggerEnter(Collider other)
    {
        if (playOnEnter && other.CompareTag("Player"))
        {
            Invoke("PlaySound", delay);
        }
    }

    void OnTriggerExit(Collider other)
    {
        if (playOnExit && other.CompareTag("Player"))
        {
            Invoke("PlaySound", delay);
        }
    }

    void OnCollisionEnter(Collision collision)
    {
        if (playOnCollision && collision.gameObject.CompareTag("Player"))
        {
            Invoke("PlaySound", delay);
        }
    }

    private void PlaySound()
    {
        if (AudioManager.Instance == null) return;

        if (is3DSound)
        {
            if (AudioManager.Instance.audioClipDictionary.TryGetValue($"SFX_{audioClipName}", out AudioClip clip))
            {
                AudioManager.Instance.Play3DSound(clip, transform.position, volume, pitch);
            }
        }
        else
        {
            switch (audioType)
            {
                case AudioType.Music:
                    AudioManager.Instance.PlayMusic(audioClipName, loop);
                    break;
                case AudioType.SFX:
                    AudioManager.Instance.PlaySFX(audioClipName);
                    break;
                case AudioType.Voice:
                    AudioManager.Instance.PlayVoice(audioClipName);
                    break;
            }
        }
    }
}

// 背景音乐区域
public class MusicZone : MonoBehaviour
{
    [Header("音乐设置")]
    public string musicName;
    public float fadeDuration = 2f;
    public bool playOnEnter = true;
    public bool stopOnExit = true;

    private bool isPlayerInZone = false;

    void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("Player") && !isPlayerInZone)
        {
            isPlayerInZone = true;
            if (playOnEnter)
            {
                FadeInMusic();
            }
        }
    }

    void OnTriggerExit(Collider other)
    {
        if (other.CompareTag("Player") && isPlayerInZone)
        {
            isPlayerInZone = false;
            if (stopOnExit)
            {
                FadeOutMusic();
            }
        }
    }

    private void FadeInMusic()
    {
        if (AudioManager.Instance != null)
        {
            // 这里可以实现音乐淡入效果
            AudioManager.Instance.PlayMusic(musicName);
        }
    }

    private void FadeOutMusic()
    {
        if (AudioManager.Instance != null)
        {
            // 这里可以实现音乐淡出效果
            AudioManager.Instance.StopAudio(AudioType.Music);
        }
    }
}
```

---

## 动画系统

### 动画控制器

```csharp
using UnityEngine;

// 动画参数类型
public enum AnimationParameterType
{
    Bool,
    Int,
    Float,
    Trigger
}

// 动画状态枚举
public enum AnimationState
{
    Idle,
    Walk,
    Run,
    Jump,
    Attack,
    TakeDamage,
    Die,
    Interact
}

// 动画管理器
public class AnimationManager : MonoBehaviour
{
    [Header("动画组件")]
    public Animator animator;
    public AnimationState currentState = AnimationState.Idle;

    [Header("动画参数")]
    public string speedParameter = "Speed";
    public string directionParameter = "Direction";
    public string jumpParameter = "IsJumping";
    public string attackParameter = "Attack";
    public string damageParameter = "TakeDamage";
    public string dieParameter = "Die";
    public string interactParameter = "Interact";

    [Header("动画设置")]
    public float runSpeedThreshold = 0.5f;
    public float walkSpeedThreshold = 0.1f;

    private CharacterController controller;
    private PlayerController playerController;
    private float currentSpeed = 0f;
    private bool isJumping = false;
    private bool isAttacking = false;

    void Start()
    {
        InitializeAnimationManager();
    }

    private void InitializeAnimationManager()
    {
        if (animator == null)
        {
            animator = GetComponent<Animator>();
        }

        if (animator == null)
        {
            Debug.LogWarning("No Animator found on " + gameObject.name);
            enabled = false;
            return;
        }

        controller = GetComponent<CharacterController>();
        playerController = GetComponent<PlayerController>();
    }

    void Update()
    {
        UpdateAnimationParameters();
        UpdateAnimationState();
    }

    // 更新动画参数
    private void UpdateAnimationParameters()
    {
        if (animator == null) return;

        // 计算移动速度
        if (controller != null)
        {
            Vector3 velocity = controller.velocity;
            velocity.y = 0; // 忽略Y轴速度
            currentSpeed = velocity.magnitude;
        }
        else if (playerController != null)
        {
            // 如果使用PlayerController，可以从那里获取速度
            currentSpeed = new Vector3(
                Input.GetAxis("Horizontal"), 
                0, 
                Input.GetAxis("Vertical")
            ).magnitude;
        }

        // 设置速度参数
        animator.SetFloat(speedParameter, currentSpeed);

        // 设置方向参数（如果需要）
        if (playerController != null)
        {
            Vector3 moveDirection = new Vector3(Input.GetAxis("Horizontal"), 0, Input.GetAxis("Vertical"));
            if (moveDirection.magnitude > 0.1f)
            {
                float direction = Vector3.SignedAngle(Vector3.forward, moveDirection, Vector3.up);
                animator.SetFloat(directionParameter, direction);
            }
        }

        // 设置跳跃参数
        if (controller != null)
        {
            bool wasJumping = isJumping;
            isJumping = !controller.isGrounded;

            if (isJumping && !wasJumping)
            {
                animator.SetBool(jumpParameter, true);
            }
            else if (!isJumping && wasJumping)
            {
                animator.SetBool(jumpParameter, false);
            }
        }

        // 设置攻击参数
        if (isAttacking)
        {
            animator.SetTrigger(attackParameter);
            isAttacking = false; // 重置攻击状态
        }
    }

    // 更新动画状态
    private void UpdateAnimationState()
    {
        AnimationState newState = currentState;

        if (currentSpeed > runSpeedThreshold)
        {
            newState = AnimationState.Run;
        }
        else if (currentSpeed > walkSpeedThreshold)
        {
            newState = AnimationState.Walk;
        }
        else if (isJumping)
        {
            newState = AnimationState.Jump;
        }
        else
        {
            newState = AnimationState.Idle;
        }

        if (newState != currentState)
        {
            currentState = newState;
            OnAnimationStateChanged(currentState);
        }
    }

    // 动画状态改变时的处理
    protected virtual void OnAnimationStateChanged(AnimationState newState)
    {
        // 可以在这里添加状态改变时的逻辑
        switch (newState)
        {
            case AnimationState.Idle:
                // 空闲状态处理
                break;
            case AnimationState.Walk:
                // 行走状态处理
                break;
            case AnimationState.Run:
                // 跑步状态处理
                break;
            case AnimationState.Jump:
                // 跳跃状态处理
                break;
        }
    }

    // 触发攻击动画
    public void TriggerAttack()
    {
        isAttacking = true;
    }

    // 触发受伤动画
    public void TriggerTakeDamage()
    {
        if (animator != null)
        {
            animator.SetTrigger(damageParameter);
        }
    }

    // 触发死亡动画
    public void TriggerDie()
    {
        if (animator != null)
        {
            animator.SetTrigger(dieParameter);
        }
    }

    // 触发交互动画
    public void TriggerInteract()
    {
        if (animator != null)
        {
            animator.SetTrigger(interactParameter);
        }
    }

    // 设置动画参数的通用方法
    public void SetAnimationParameter(string parameterName, AnimationParameterType type, System.Object value)
    {
        if (animator == null) return;

        switch (type)
        {
            case AnimationParameterType.Bool:
                animator.SetBool(parameterName, (bool)value);
                break;
            case AnimationParameterType.Int:
                animator.SetInteger(parameterName, (int)value);
                break;
            case AnimationParameterType.Float:
                animator.SetFloat(parameterName, (float)value);
                break;
            case AnimationParameterType.Trigger:
                animator.SetTrigger(parameterName);
                break;
        }
    }

    // 获取动画参数
    public T GetAnimationParameter<T>(string parameterName, AnimationParameterType type)
    {
        if (animator == null) return default(T);

        switch (type)
        {
            case AnimationParameterType.Bool:
                return (T)(object)animator.GetBool(parameterName);
            case AnimationParameterType.Int:
                return (T)(object)animator.GetInteger(parameterName);
            case AnimationParameterType.Float:
                return (T)(object)animator.GetFloat(parameterName);
            default:
                return default(T);
        }
    }

    // 检查当前是否在特定动画状态
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

    // 动画事件处理器
    public void OnAnimationEvent(string eventName)
    {
        // 处理动画事件
        switch (eventName)
        {
            case "Footstep":
                // 播放脚步声
                AudioManager.Instance?.PlaySFX("Footstep");
                break;
            case "AttackHit":
                // 攻击命中事件
                OnAttackHit();
                break;
            case "Land":
                // 着陆事件
                AudioManager.Instance?.PlaySFX("Land");
                break;
        }
    }

    private void OnAttackHit()
    {
        // 攻击命中时的逻辑
        // 例如：检测攻击范围内的敌人并造成伤害
        Collider[] hitColliders = Physics.OverlapSphere(
            transform.position + transform.forward * 1f, 
            1f
        );

        foreach (Collider collider in hitColliders)
        {
            if (collider.CompareTag("Enemy"))
            {
                HealthComponent health = collider.GetComponent<HealthComponent>();
                if (health != null)
                {
                    health.TakeDamage(25f); // 攻击力
                }
            }
        }
    }

    // 可视化动画参数
    void OnDrawGizmos()
    {
        if (animator != null)
        {
            // 显示攻击范围
            if (currentState == AnimationState.Attack)
            {
                Gizmos.color = Color.red;
                Gizmos.DrawWireSphere(transform.position + transform.forward, 1f);
            }
        }
    }
}
```

### 高级动画控制

```csharp
using UnityEngine;

// 高级动画控制器
public class AdvancedAnimationController : AnimationManager
{
    [Header("高级动画设置")]
    public AnimationCurve speedCurve = AnimationCurve.EaseInOut(0, 0, 1, 1);
    public float directionSmoothing = 10f;
    public bool useRootMotion = false;

    [Header("混合树参数")]
    public string blendXParameter = "BlendX";
    public string blendYParameter = "BlendY";

    [Header("动画层")]
    public int upperBodyLayer = 1;
    public int lowerBodyLayer = 0;

    private float targetDirection = 0f;
    private float currentDirection = 0f;
    private Vector2 blendValue = Vector2.zero;

    void Start()
    {
        base.InitializeAnimationManager();
        
        if (animator != null)
        {
            animator.applyRootMotion = useRootMotion;
        }
    }

    void Update()
    {
        base.UpdateAnimationParameters();
        UpdateAdvancedParameters();
        UpdateAnimationState();
    }

    private void UpdateAdvancedParameters()
    {
        if (animator == null) return;

        // 平滑方向转换
        if (playerController != null)
        {
            Vector3 moveDirection = new Vector3(Input.GetAxis("Horizontal"), 0, Input.GetAxis("Vertical"));
            if (moveDirection.magnitude > 0.1f)
            {
                targetDirection = Vector3.SignedAngle(Vector3.forward, moveDirection, Vector3.up);
            }
        }

        currentDirection = Mathf.Lerp(currentDirection, targetDirection, 
                                    directionSmoothing * Time.deltaTime);

        // 应用速度曲线
        float curvedSpeed = speedCurve.Evaluate(currentSpeed);
        animator.SetFloat(speedParameter, curvedSpeed);

        // 更新混合树参数
        UpdateBlendTree();
    }

    private void UpdateBlendTree()
    {
        if (animator == null) return;

        // 基于移动方向和速度更新混合值
        float xBlend = Mathf.Clamp(currentDirection / 180f, -1f, 1f);
        float yBlend = Mathf.Clamp(currentSpeed / 10f, -1f, 1f); // 假设最大速度为10

        blendValue = Vector2.Lerp(blendValue, new Vector2(xBlend, yBlend), 
                                 5f * Time.deltaTime);

        animator.SetFloat(blendXParameter, blendValue.x);
        animator.SetFloat(blendYParameter, blendValue.y);
    }

    // 分层动画控制
    public void SetLayerWeight(int layerIndex, float weight)
    {
        if (animator != null)
        {
            animator.SetLayerWeight(layerIndex, Mathf.Clamp01(weight));
        }
    }

    // 上半身动画控制
    public void SetUpperBodyAnimation(string animationName, float weight = 1f)
    {
        SetLayerWeight(upperBodyLayer, weight);
        if (weight > 0.9f) // 只有在权重足够高时才播放动画
        {
            animator.SetTrigger(animationName);
        }
    }

    // 下半身动画控制
    public void SetLowerBodyAnimation(string animationName, float weight = 1f)
    {
        SetLayerWeight(lowerBodyLayer, weight);
        if (weight > 0.9f)
        {
            animator.SetTrigger(animationName);
        }
    }

    // 动画遮罩
    public void ApplyAnimationMask(AnimatorMask mask, int layer)
    {
        if (animator != null)
        {
            animator.SetLayerMask(layer, mask);
        }
    }

    // 动画同步
    public void SyncAnimationWith(Animator otherAnimator, string parameterName)
    {
        if (animator != null && otherAnimator != null)
        {
            // 同步参数值
            float otherValue = otherAnimator.GetFloat(parameterName);
            animator.SetFloat(parameterName, otherValue);
        }
    }

    // 动画进度控制
    public void SetAnimationProgress(string stateName, float normalizedTime, int layer = 0)
    {
        if (animator != null)
        {
            // 这种方法比较复杂，需要使用Animator.Play()并设置时间
            // 一般情况下不建议直接设置动画进度
        }
    }

    // 动画时间缩放
    public void SetAnimationSpeed(float speed, int layer = -1)
    {
        if (animator != null)
        {
            if (layer >= 0)
            {
                // 设置特定层的速度
                animator.SetFloat("SpeedMultiplier", speed);
            }
            else
            {
                // 设置整体速度
                animator.speed = speed;
            }
        }
    }

    // 动画事件系统
    [System.Serializable]
    public class AnimationEvent
    {
        public string eventName;
        public float time;
        public System.Action callback;
    }

    public AnimationEvent[] animationEvents = new AnimationEvent[0];

    // 自定义动画事件触发
    public void TriggerCustomAnimationEvent(string eventName)
    {
        foreach (AnimationEvent animEvent in animationEvents)
        {
            if (animEvent.eventName == eventName && animEvent.callback != null)
            {
                animEvent.callback();
            }
        }
    }

    // 动画状态机行为
    public void AddStateMachineBehaviour(AnimatorState state, StateMachineBehaviour behaviour)
    {
        // 这需要在编辑器中设置，运行时添加比较复杂
    }

    // 动画混合
    public void BlendToAnimation(string animationName, float blendDuration = 0.3f)
    {
        if (animator != null)
        {
            // 使用动画过渡
            AnimatorTransitionInfo transitionInfo = animator.GetAnimatorTransitionInfo(0);
            if (!transitionInfo.IsName(animationName))
            {
                animator.CrossFade(animationName, blendDuration);
            }
        }
    }

    // 动画同步组
    public class AnimationSyncGroup
    {
        public List<Animator> animators = new List<Animator>();
        public string syncParameter;

        public void SyncParameter(float value)
        {
            foreach (Animator anim in animators)
            {
                if (anim != null)
                {
                    anim.SetFloat(syncParameter, value);
                }
            }
        }
    }
}

// 动画事件处理器
public class AnimationEventHandler : StateMachineBehaviour
{
    public override void OnStateEnter(Animator animator, AnimatorStateInfo stateInfo, int layerIndex)
    {
        AnimationManager animManager = animator.GetComponent<AnimationManager>();
        if (animManager != null)
        {
            animManager.OnAnimationEvent("StateEnter");
        }
    }

    public override void OnStateUpdate(Animator animator, AnimatorStateInfo stateInfo, int layerIndex)
    {
        AnimationManager animManager = animator.GetComponent<AnimationManager>();
        if (animManager != null)
        {
            animManager.OnAnimationEvent("StateUpdate");
        }
    }

    public override void OnStateExit(Animator animator, AnimatorStateInfo stateInfo, int layerIndex)
    {
        AnimationManager animManager = animator.GetComponent<AnimationManager>();
        if (animManager != null)
        {
            animManager.OnAnimationEvent("StateExit");
        }
    }

    public override void OnStateMove(Animator animator, AnimatorStateInfo stateInfo, int layerIndex)
    {
        // 处理根运动
        AnimationManager animManager = animator.GetComponent<AnimationManager>();
        if (animManager != null)
        {
            animManager.OnAnimationEvent("StateMove");
        }
    }
}
```

---

## 游戏管理器设计

### 高级游戏管理器

```csharp
using UnityEngine;
using System.Collections;
using System.Collections.Generic;

// 游戏模式
public enum GameMode
{
    SinglePlayer,
    Multiplayer,
    Coop,
    Competitive
}

// 游戏难度
public enum GameDifficulty
{
    Easy,
    Normal,
    Hard,
    Expert
}

// 高级游戏管理器
public class AdvancedGameManager : GameManager
{
    [Header("游戏模式设置")]
    public GameMode currentGameMode = GameMode.SinglePlayer;
    public GameDifficulty difficulty = GameDifficulty.Normal;
    public int maxPlayers = 4;

    [Header("游戏进度")]
    public int currentWave = 1;
    public int totalWaves = 10;
    public float gameTimeLimit = 300f; // 5分钟
    public bool isTimeLimited = true;

    [Header("玩家设置")]
    public List<PlayerData> players = new List<PlayerData>();
    public int maxLives = 3;
    public float respawnTime = 3f;

    [Header("AI设置")]
    public int maxEnemies = 50;
    public float enemySpawnRate = 2f;
    public float difficultyMultiplier = 1f;

    [Header("网络设置")]
    public bool isNetworkGame = false;
    public string gameRoomName = "DefaultRoom";

    private Dictionary<string, System.Action> gameActions = new Dictionary<string, System.Action>();
    private List<Coroutine> activeCoroutines = new List<Coroutine>();
    private float gameStartTime = 0f;

    void Start()
    {
        InitializeAdvancedFeatures();
    }

    private void InitializeAdvancedFeatures()
    {
        // 初始化游戏动作字典
        InitializeGameActions();

        // 设置难度相关参数
        SetDifficultySettings();

        // 初始化玩家数据
        InitializePlayers();

        // 订阅更多事件
        GameEvents.OnPlayerDeath += OnPlayerDeath;
        GameEvents.OnLevelChanged += OnLevelChanged;
    }

    private void InitializeGameActions()
    {
        gameActions["StartGame"] = StartGame;
        gameActions["PauseGame"] = PauseGame;
        gameActions["ResumeGame"] = ResumeGame;
        gameActions["GameOver"] = GameOver;
        gameActions["NextLevel"] = NextLevel;
        gameActions["RestartGame"] = RestartGame;
        gameActions["QuitGame"] = QuitGame;
    }

    private void SetDifficultySettings()
    {
        switch (difficulty)
        {
            case GameDifficulty.Easy:
                difficultyMultiplier = 0.7f;
                maxLives = 5;
                break;
            case GameDifficulty.Normal:
                difficultyMultiplier = 1.0f;
                maxLives = 3;
                break;
            case GameDifficulty.Hard:
                difficultyMultiplier = 1.5f;
                maxLives = 2;
                break;
            case GameDifficulty.Expert:
                difficultyMultiplier = 2.0f;
                maxLives = 1;
                break;
        }

        // 应用难度设置到敌人生成
        enemySpawnRate /= difficultyMultiplier;
        maxEnemies = Mathf.RoundToInt(maxEnemies * difficultyMultiplier);
    }

    private void InitializePlayers()
    {
        // 根据游戏模式初始化玩家
        if (currentGameMode == GameMode.SinglePlayer)
        {
            players.Add(new PlayerData { name = "Player1", lives = maxLives, score = 0 });
        }
        else
        {
            // 多人游戏初始化
            for (int i = 0; i < maxPlayers; i++)
            {
                players.Add(new PlayerData { 
                    name = $"Player{i + 1}", 
                    lives = maxLives, 
                    score = 0,
                    isActive = i == 0 // 第一个玩家默认活跃
                });
            }
        }
    }

    // 重写基类方法
    public override void StartGame()
    {
        base.StartGame();
        gameStartTime = Time.time;

        // 启动游戏特定系统
        if (isTimeLimited)
        {
            StartCoroutine(GameTimeLimitCoroutine());
        }

        if (currentGameMode == GameMode.SinglePlayer)
        {
            StartCoroutine(SpawnEnemiesCoroutine());
        }

        // 触发游戏开始事件
        GameEvents.TriggerGameStart();
    }

    public override void GameOver()
    {
        base.GameOver();
        
        // 停止所有协程
        StopAllGameCoroutines();
        
        // 保存游戏进度
        SaveGameProgress();
        
        // 显示游戏结束UI
        UIManager.Instance?.GameOver();
    }

    // 玩家死亡处理
    private void OnPlayerDeath(GameObject player)
    {
        PlayerData playerData = GetPlayerData(player);
        if (playerData != null)
        {
            playerData.lives--;

            if (playerData.lives <= 0)
            {
                playerData.isActive = false;
                
                // 检查是否所有玩家都失败了
                if (GetActivePlayerCount() == 0)
                {
                    GameOver();
                }
            }
            else
            {
                // 重生玩家
                StartCoroutine(RespawnPlayerCoroutine(player));
            }
        }
    }

    private IEnumerator RespawnPlayerCoroutine(GameObject player)
    {
        yield return new WaitForSeconds(respawnTime);
        
        // 重生逻辑
        HealthComponent health = player.GetComponent<HealthComponent>();
        if (health != null)
        {
            health.Resurrect();
        }
        
        // 重置玩家位置
        player.transform.position = GetRespawnPosition();
    }

    private Vector3 GetRespawnPosition()
    {
        // 返回安全的重生位置
        // 这里简化为返回原点，实际应该检测安全位置
        return Vector3.zero;
    }

    // 关卡改变处理
    private void OnLevelChanged(int newLevel)
    {
        // 关卡特定逻辑
        SetDifficultySettings(); // 重新调整难度
        
        // 生成新关卡的敌人
        if (currentGameMode == GameMode.SinglePlayer)
        {
            StartCoroutine(SpawnLevelEnemiesCoroutine(newLevel));
        }
    }

    // 敌人生成协程
    private IEnumerator SpawnEnemiesCoroutine()
    {
        while (CurrentState == GameState.Playing)
        {
            if (GetActiveEnemyCount() < maxEnemies)
            {
                SpawnEnemy();
            }
            
            yield return new WaitForSeconds(enemySpawnRate);
        }
    }

    private IEnumerator SpawnLevelEnemiesCoroutine(int level)
    {
        int enemiesToSpawn = Mathf.RoundToInt(10 * level * difficultyMultiplier);
        
        for (int i = 0; i < enemiesToSpawn; i++)
        {
            SpawnEnemy();
            yield return new WaitForSeconds(enemySpawnRate * 0.5f);
        }
    }

    private void SpawnEnemy()
    {
        // 从对象池获取敌人
        if (GetComponent<ObjectPool>() != null)
        {
            Vector3 spawnPos = GetRandomSpawnPosition();
            GameObject enemy = GetComponent<ObjectPool>().SpawnFromPool("Enemy", spawnPos, Quaternion.identity);
            
            if (enemy != null)
            {
                // 设置敌人属性
                AIController ai = enemy.GetComponent<AIController>();
                if (ai != null)
                {
                    ai.health *= difficultyMultiplier;
                    ai.damage = Mathf.RoundToInt(ai.damage * difficultyMultiplier);
                }
            }
        }
    }

    private Vector3 GetRandomSpawnPosition()
    {
        // 返回随机生成位置，远离玩家
        Vector3 playerPos = Vector3.zero;
        if (Player != null)
        {
            playerPos = Player.transform.position;
        }

        // 生成在距离玩家一定距离的位置
        Vector3 spawnDir = Random.insideUnitSphere;
        spawnDir.y = 0;
        spawnDir.Normalize();
        
        return playerPos + spawnDir * 15f; // 15单位外生成
    }

    // 游戏时间限制协程
    private IEnumerator GameTimeLimitCoroutine()
    {
        yield return new WaitForSeconds(gameTimeLimit);
        
        if (CurrentState == GameState.Playing)
        {
            // 时间到，游戏结束
            GameOver();
        }
    }

    // 获取玩家数据
    private PlayerData GetPlayerData(GameObject playerObject)
    {
        // 根据玩家对象获取玩家数据
        // 这里简化处理，实际应该有更复杂的玩家识别机制
        if (players.Count > 0)
        {
            return players[0]; // 返回第一个玩家数据
        }
        return null;
    }

    // 获取活跃玩家数量
    private int GetActivePlayerCount()
    {
        return players.FindAll(p => p.isActive).Count;
    }

    // 获取活跃敌人数量
    private int GetActiveEnemyCount()
    {
        GameObject[] enemies = GameObject.FindGameObjectsWithTag("Enemy");
        return enemies.Length;
    }

    // 执行游戏动作
    public void ExecuteGameAction(string actionName)
    {
        if (gameActions.ContainsKey(actionName))
        {
            gameActions[actionName]?.Invoke();
        }
    }

    // 保存游戏进度
    public void SaveGameProgress()
    {
        // 保存当前游戏状态
        PlayerPrefs.SetInt("CurrentLevel", CurrentLevel);
        PlayerPrefs.SetInt("Score", Score);
        PlayerPrefs.SetFloat("GameTime", GameTime);
        PlayerPrefs.SetInt("CurrentWave", currentWave);
        
        // 保存玩家数据
        for (int i = 0; i < players.Count; i++)
        {
            PlayerPrefs.SetInt($"Player{i}_Lives", players[i].lives);
            PlayerPrefs.SetInt($"Player{i}_Score", players[i].score);
        }
        
        PlayerPrefs.Save();
    }

    // 加载游戏进度
    public void LoadGameProgress()
    {
        CurrentLevel = PlayerPrefs.GetInt("CurrentLevel", 1);
        Score = PlayerPrefs.GetInt("Score", 0);
        GameTime = PlayerPrefs.GetFloat("GameTime", 0f);
        currentWave = PlayerPrefs.GetInt("CurrentWave", 1);
        
        // 加载玩家数据
        for (int i = 0; i < players.Count; i++)
        {
            players[i].lives = PlayerPrefs.GetInt($"Player{i}_Lives", maxLives);
            players[i].score = PlayerPrefs.GetInt($"Player{i}_Score", 0);
        }
    }

    // 重新开始游戏
    public void RestartGame()
    {
        // 清理当前游戏状态
        StopAllGameCoroutines();
        ClearAllGameObjects();
        
        // 重置游戏状态
        CurrentLevel = 1;
        Score = 0;
        GameTime = 0f;
        currentWave = 1;
        
        // 重置玩家数据
        foreach (PlayerData player in players)
        {
            player.lives = maxLives;
            player.score = 0;
            player.isActive = true;
        }
        
        // 重新开始游戏
        StartGame();
    }

    // 退出游戏
    public void QuitGame()
    {
        SaveGameProgress();
        
        #if UNITY_EDITOR
        UnityEditor.EditorApplication.isPlaying = false;
        #else
        Application.Quit();
        #endif
    }

    // 停止所有游戏协程
    private void StopAllGameCoroutines()
    {
        foreach (Coroutine coroutine in activeCoroutines)
        {
            if (coroutine != null)
            {
                StopCoroutine(coroutine);
            }
        }
        activeCoroutines.Clear();
    }

    // 清理所有游戏对象
    private void ClearAllGameObjects()
    {
        // 销毁所有敌人
        GameObject[] enemies = GameObject.FindGameObjectsWithTag("Enemy");
        foreach (GameObject enemy in enemies)
        {
            Destroy(enemy);
        }

        // 销毁所有子弹
        GameObject[] bullets = GameObject.FindGameObjectsWithTag("Bullet");
        foreach (GameObject bullet in bullets)
        {
            Destroy(bullet);
        }

        // 销毁其他游戏对象
        GameObject[] items = GameObject.FindGameObjectsWithTag("Collectible");
        foreach (GameObject item in items)
        {
            Destroy(item);
        }
    }

    // 添加并跟踪协程
    protected Coroutine StartGameCoroutine(IEnumerator routine)
    {
        Coroutine coroutine = StartCoroutine(routine);
        activeCoroutines.Add(coroutine);
        return coroutine;
    }

    // 移除已结束的协程
    protected void RemoveCoroutine(Coroutine coroutine)
    {
        activeCoroutines.Remove(coroutine);
    }

    void OnDestroy()
    {
        // 清理事件订阅
        GameEvents.OnPlayerDeath -= OnPlayerDeath;
        GameEvents.OnLevelChanged -= OnLevelChanged;
        
        // 停止所有协程
        StopAllGameCoroutines();
    }
}

// 玩家数据结构
[System.Serializable]
public class PlayerData
{
    public string name;
    public int lives;
    public int score;
    public bool isActive = true;
    public Vector3 lastPosition;
    public float lastHealth;
}
```

### 游戏状态管理

```csharp
using UnityEngine;
using System.Collections.Generic;

// 游戏状态管理器
public class GameStateManager : MonoBehaviour
{
    [Header("状态设置")]
    public List<GameStateData> gameStates = new List<GameStateData>();
    public GameState currentState = GameState.MainMenu;
    public GameState previousState = GameState.MainMenu;

    [Header("状态转换设置")]
    public float stateTransitionDelay = 0.1f;
    public bool allowParallelStates = false;

    private Dictionary<GameState, GameStateData> stateDataMap = new Dictionary<GameState, GameStateData>();
    private Stack<GameState> stateStack = new Stack<GameState>();
    private bool isTransitioning = false;

    void Start()
    {
        InitializeStateData();
        InitializeGameState();
    }

    private void InitializeStateData()
    {
        // 建立状态数据映射
        foreach (GameStateData stateData in gameStates)
        {
            if (!stateDataMap.ContainsKey(stateData.state))
            {
                stateDataMap[stateData.state] = stateData;
            }
        }
    }

    private void InitializeGameState()
    {
        // 初始化默认状态
        if (gameStates.Count > 0)
        {
            currentState = gameStates[0].state;
            EnterState(currentState);
        }
    }

    // 进入状态
    public void EnterState(GameState newState)
    {
        if (isTransitioning || newState == currentState) return;

        isTransitioning = true;
        previousState = currentState;

        // 退出当前状态
        ExitState(currentState);

        // 设置新状态
        currentState = newState;

        // 进入新状态
        GameStateData stateData = GetStateData(newState);
        if (stateData != null)
        {
            stateData.EnterState();
        }

        // 触发状态改变事件
        GameEvents.TriggerGameStateChange(previousState, currentState);

        Invoke("EndTransition", stateTransitionDelay);
    }

    // 退出状态
    private void ExitState(GameState stateToExit)
    {
        GameStateData stateData = GetStateData(stateToExit);
        if (stateData != null)
        {
            stateData.ExitState();
        }
    }

    // 结束转换
    private void EndTransition()
    {
        isTransitioning = false;
    }

    // 获取状态数据
    private GameStateData GetStateData(GameState state)
    {
        if (stateDataMap.ContainsKey(state))
        {
            return stateDataMap[state];
        }
        return null;
    }

    // 推入状态（用于临时状态，如暂停）
    public void PushState(GameState newState)
    {
        if (currentState != newState)
        {
            stateStack.Push(currentState);
            EnterState(newState);
        }
    }

    // 弹出状态
    public void PopState()
    {
        if (stateStack.Count > 0)
        {
            GameState previous = stateStack.Pop();
            EnterState(previous);
        }
    }

    // 立即切换到状态（不经过退出/进入流程）
    public void SwitchToState(GameState newState)
    {
        currentState = newState;
        GameEvents.TriggerGameStateChange(previousState, currentState);
    }

    // 检查是否在特定状态
    public bool IsInState(GameState state)
    {
        return currentState == state;
    }

    // 检查是否在状态栈中
    public bool IsStateInStack(GameState state)
    {
        return stateStack.Contains(state);
    }

    // 获取状态栈大小
    public int GetStateStackSize()
    {
        return stateStack.Count;
    }

    // 清空状态栈
    public void ClearStateStack()
    {
        stateStack.Clear();
    }

    // 状态数据类
    [System.Serializable]
    public class GameStateData
    {
        public GameState state;
        public string stateName;
        public List<GameObject> activateObjects = new List<GameObject>();
        public List<GameObject> deactivateObjects = new List<GameObject>();
        public System.Action onEnter;
        public System.Action onExit;
        public System.Action onUpdate;

        public void EnterState()
        {
            // 激活对象
            foreach (GameObject obj in activateObjects)
            {
                if (obj != null) obj.SetActive(true);
            }

            // 停用对象
            foreach (GameObject obj in deactivateObjects)
            {
                if (obj != null) obj.SetActive(false);
            }

            // 执行进入回调
            onEnter?.Invoke();
        }

        public void ExitState()
        {
            // 执行退出回调
            onExit?.Invoke();
        }

        public void UpdateState()
        {
            // 执行更新回调
            onUpdate?.Invoke();
        }
    }

    // 状态转换条件
    public bool CanTransitionTo(GameState targetState)
    {
        GameStateData currentData = GetStateData(currentState);
        if (currentData != null)
        {
            // 检查是否有转换限制
            // 这里可以添加特定的转换规则
        }

        return !isTransitioning && targetState != currentState;
    }

    // 条件状态转换
    public void ConditionalTransition(System.Func<bool> condition, GameState targetState)
    {
        if (condition() && CanTransitionTo(targetState))
        {
            EnterState(targetState);
        }
    }

    // 带延迟的状态转换
    public IEnumerator DelayedStateTransition(GameState newState, float delay)
    {
        yield return new WaitForSeconds(delay);
        EnterState(newState);
    }

    // 状态转换管理器
    [System.Serializable]
    public class StateTransitionRule
    {
        public GameState fromState;
        public GameState toState;
        public System.Func<bool> condition;
        public float transitionDelay = 0f;
    }

    public List<StateTransitionRule> transitionRules = new List<StateTransitionRule>();

    // 检查并执行转换规则
    public void CheckTransitionRules()
    {
        foreach (StateTransitionRule rule in transitionRules)
        {
            if (rule.fromState == currentState && rule.condition != null && rule.condition())
            {
                if (rule.transitionDelay > 0)
                {
                    StartCoroutine(DelayedStateTransition(rule.toState, rule.transitionDelay));
                }
                else
                {
                    EnterState(rule.toState);
                }
                break; // 执行第一个匹配的规则
            }
        }
    }

    void Update()
    {
        // 检查转换规则
        CheckTransitionRules();

        // 更新当前状态
        GameStateData currentData = GetStateData(currentState);
        if (currentData != null)
        {
            currentData.UpdateState();
        }
    }
}
```

---

## 实践练习

### 练习1: 完整的射击游戏

```csharp
using UnityEngine;

// 完整射击游戏管理器
public class ShootingGameManager : AdvancedGameManager
{
    [Header("射击游戏特定设置")]
    public Transform[] spawnPoints;
    public GameObject playerPrefab;
    public GameObject enemyPrefab;
    public GameObject bulletPrefab;
    public GameObject[] powerUpPrefabs;

    [Header("游戏目标")]
    public int targetScore = 1000;
    public int enemiesToKillForNextLevel = 10;

    [Header("波次设置")]
    public int currentEnemyCount = 0;
    public int enemiesKilledInCurrentWave = 0;
    public float waveSpawnInterval = 5f;

    private int enemiesToSpawnInWave = 5;
    private int enemiesSpawnedInWave = 0;

    void Start()
    {
        InitializeShootingGame();
    }

    private void InitializeShootingGame()
    {
        // 设置游戏模式
        currentGameMode = GameMode.SinglePlayer;
        difficulty = GameDifficulty.Normal;

        // 初始化玩家
        SpawnPlayer();

        // 设置游戏UI
        UIManager.Instance?.UpdateScore(0);
        UIManager.Instance?.UpdateLevel(1);
    }

    private void SpawnPlayer()
    {
        if (playerPrefab != null && spawnPoints.Length > 0)
        {
            Transform spawnPoint = spawnPoints[Random.Range(0, spawnPoints.Length)];
            GameObject playerGO = Instantiate(playerPrefab, spawnPoint.position, spawnPoint.rotation);
            
            Player = playerGO.GetComponent<PlayerController>();
            if (Player != null)
            {
                GameEvents.TriggerPlayerSpawn(playerGO);
            }
        }
    }

    public override void StartGame()
    {
        base.StartGame();
        
        // 开始生成敌人
        StartCoroutine(SpawnWaveCoroutine());
        
        // 开始生成道具
        StartCoroutine(SpawnPowerUpsCoroutine());
    }

    // 生成敌人波次
    private System.Collections.IEnumerator SpawnWaveCoroutine()
    {
        while (CurrentState == GameState.Playing)
        {
            if (enemiesSpawnedInWave < enemiesToSpawnInWave)
            {
                SpawnEnemy();
                enemiesSpawnedInWave++;
                currentEnemyCount++;
            }
            else if (enemiesKilledInCurrentWave >= enemiesToSpawnInWave)
            {
                // 波次完成，开始下一波
                NextWave();
            }
            
            yield return new WaitForSeconds(waveSpawnInterval);
        }
    }

    // 生成道具
    private System.Collections.IEnumerator SpawnPowerUpsCoroutine()
    {
        while (CurrentState == GameState.Playing)
        {
            if (powerUpPrefabs.Length > 0 && Random.value < 0.3f) // 30% 概率生成道具
            {
                SpawnPowerUp();
            }
            
            yield return new WaitForSeconds(Random.Range(10f, 30f)); // 10-30秒间隔
        }
    }

    private void SpawnEnemy()
    {
        if (enemyPrefab != null && spawnPoints.Length > 0)
        {
            Transform spawnPoint = spawnPoints[Random.Range(0, spawnPoints.Length)];
            GameObject enemyGO = Instantiate(enemyPrefab, spawnPoint.position, spawnPoint.rotation);
            
            // 设置敌人属性
            AIController enemyAI = enemyGO.GetComponent<AIController>();
            if (enemyAI != null)
            {
                enemyAI.health *= Mathf.Pow(1.2f, CurrentLevel - 1); // 随关卡增强
                enemyAI.damage = Mathf.RoundToInt(enemyAI.damage * Mathf.Pow(1.1f, CurrentLevel - 1));
            }
        }
    }

    private void SpawnPowerUp()
    {
        if (powerUpPrefabs.Length > 0 && spawnPoints.Length > 0)
        {
            GameObject powerUpPrefab = powerUpPrefabs[Random.Range(0, powerUpPrefabs.Length)];
            Transform spawnPoint = spawnPoints[Random.Range(0, spawnPoints.Length)];
            
            Instantiate(powerUpPrefab, spawnPoint.position, spawnPoint.rotation);
        }
    }

    private void NextWave()
    {
        currentWave++;
        enemiesKilledInCurrentWave = 0;
        enemiesSpawnedInWave = 0;
        enemiesToSpawnInWave = 5 + (currentWave * 2); // 每波增加敌人数量
        
        // 更新UI
        UIManager.Instance?.UpdateLevel(currentWave);
        
        // 播放波次完成音效
        AudioManager.Instance?.PlaySFX("WaveComplete");
        
        // 给玩家奖励
        AddScore(100 * currentWave);
    }

    // 重写玩家死亡处理
    private new void OnPlayerDeath(GameObject player)
    {
        PlayerData playerData = GetPlayerData(player);
        if (playerData != null)
        {
            playerData.lives--;
            
            if (playerData.lives <= 0)
            {
                GameOver();
            }
            else
            {
                // 重生玩家
                Invoke("RespawnPlayer", respawnTime);
            }
        }
    }

    private void RespawnPlayer()
    {
        if (Player == null)
        {
            SpawnPlayer();
        }
    }

    // 重写添加分数方法
    public override void AddScore(int points)
    {
        base.AddScore(points);
        
        // 检查是否达到目标分数
        if (Score >= targetScore)
        {
            WinGame();
        }
    }

    // 击杀敌人时调用
    public void OnEnemyKilled()
    {
        enemiesKilledInCurrentWave++;
        currentEnemyCount--;
        
        // 额外分数奖励
        int killBonus = 50 * currentWave;
        AddScore(killBonus);
        
        // 检查是否完成波次
        if (enemiesKilledInCurrentWave >= enemiesToSpawnInWave)
        {
            // 波次完成逻辑已经在NextWave中处理
        }
    }

    // 获胜游戏
    private void WinGame()
    {
        // 停止游戏
        SetGameState(GameState.GameOver);
        
        // 显示获胜UI
        if (UIManager.Instance != null)
        {
            UIManager.Instance.SetPanelActive(UIManager.Instance.gameOverPanel, true);
            // 可以添加获胜文本
        }
        
        // 播放获胜音效
        AudioManager.Instance?.PlaySFX("GameWin");
    }

    // 更新方法
    void Update()
    {
        if (CurrentState == GameState.Playing)
        {
            // 检查胜利条件
            if (currentWave > totalWaves && currentEnemyCount <= 0)
            {
                WinGame();
            }
        }
    }
}

// 射击游戏专用的敌人AI
public class ShootingEnemyAI : AIController
{
    [Header("射击游戏特定设置")]
    public float shootRange = 15f;
    public float shootRate = 1f;
    public GameObject projectilePrefab;
    public Transform firePoint;

    private float lastShootTime = 0f;

    protected override void UpdateAI()
    {
        base.UpdateAI();

        if (currentState == AIState.Chase || currentState == AIState.Attack)
        {
            TryShoot();
        }
    }

    private void TryShoot()
    {
        if (target != null && Time.time >= lastShootTime + shootRate)
        {
            float distanceToTarget = Vector3.Distance(transform.position, target.position);
            
            if (distanceToTarget <= shootRange)
            {
                ShootAtTarget();
                lastShootTime = Time.time;
            }
        }
    }

    private void ShootAtTarget()
    {
        if (projectilePrefab != null && firePoint != null)
        {
            GameObject projectile = Instantiate(projectilePrefab, firePoint.position, firePoint.rotation);
            Bullet bullet = projectile.GetComponent<Bullet>();
            
            if (bullet != null)
            {
                Vector3 direction = (target.position - firePoint.position).normalized;
                bullet.SetDirection(direction);
            }
        }
    }

    protected override void OnAttack()
    {
        // 射击游戏中的攻击就是射击
        ShootAtTarget();
    }

    protected override void Die()
    {
        base.Die();
        
        // 通知游戏管理器敌人被击杀
        ShootingGameManager shootingGame = FindObjectOfType<ShootingGameManager>();
        if (shootingGame != null)
        {
            shootingGame.OnEnemyKilled();
        }
    }

    void OnDrawGizmos()
    {
        base.OnDrawGizmos();
        
        // 显示射击范围
        Gizmos.color = Color.blue;
        Gizmos.DrawWireSphere(transform.position, shootRange);
    }
}

// 射击游戏专用的武器
public class ShootingWeapon : Weapon
{
    [Header("射击游戏武器特定设置")]
    public float projectileSpeed = 100f;
    public GameObject projectilePrefab;
    public Transform firePoint;

    public override void Shoot()
    {
        if (!CanShoot()) return;

        lastFireTime = Time.time;
        currentAmmo--;

        // 创建弹丸
        if (projectilePrefab != null && firePoint != null)
        {
            GameObject projectile = Instantiate(projectilePrefab, firePoint.position, firePoint.rotation);
            Bullet bullet = projectile.GetComponent<Bullet>();
            
            if (bullet != null)
            {
                // 设置弹丸方向（考虑散布）
                Vector3 direction = firePoint.forward;
                direction += Random.insideUnitSphere * spread;
                direction.Normalize();
                
                bullet.SetDirection(direction);
                bullet.damage = damage;
            }
        }

        // 播放音效
        AudioManager.Instance?.PlaySFX("Shoot");

        // 显示枪口闪光
        if (muzzleFlash != null)
        {
            muzzleFlash.SetActive(true);
            Invoke("HideMuzzleFlash", 0.05f);
        }
    }

    private void HideMuzzleFlash()
    {
        if (muzzleFlash != null)
        {
            muzzleFlash.SetActive(false);
        }
    }

    public override string GetWeaponInfo()
    {
        return $"{weaponName}\nDamage: {damage}\nAmmo: {currentAmmo}/{maxAmmo}\nFire Rate: {1f/fireRate} shots/sec";
    }
}
```

### 练习2: RPG游戏系统

```csharp
using UnityEngine;
using System.Collections.Generic;

// RPG游戏管理器
public class RPGGameManager : AdvancedGameManager
{
    [Header("RPG特定设置")]
    public List<CharacterClass> characterClasses = new List<CharacterClass>();
    public List<ItemData> itemDatabase = new List<ItemData>();
    public List<SkillData> skillDatabase = new List<SkillData>();
    public List<QuestData> questDatabase = new List<QuestData>();

    [Header("游戏世界设置")]
    public List<ZoneData> gameZones = new List<ZoneData>();
    public List<NPCData> npcs = new List<NPCData>();

    private Dictionary<string, ItemData> itemLookup = new Dictionary<string, ItemData>();
    private Dictionary<string, SkillData> skillLookup = new Dictionary<string, SkillData>();
    private Dictionary<string, QuestData> questLookup = new Dictionary<string, QuestData>();

    void Start()
    {
        InitializeRPGSystems();
    }

    private void InitializeRPGSystems()
    {
        // 初始化数据库查找表
        InitializeLookups();

        // 设置RPG特定的游戏模式
        currentGameMode = GameMode.SinglePlayer;
        difficulty = GameDifficulty.Normal;

        // 初始化玩家角色
        InitializePlayerCharacter();
    }

    private void InitializeLookups()
    {
        foreach (ItemData item in itemDatabase)
        {
            if (!itemLookup.ContainsKey(item.itemName))
            {
                itemLookup[item.itemName] = item;
            }
        }

        foreach (SkillData skill in skillDatabase)
        {
            if (!skillLookup.ContainsKey(skill.skillName))
            {
                skillLookup[skill.skillName] = skill;
            }
        }

        foreach (QuestData quest in questDatabase)
        {
            if (!questLookup.ContainsKey(quest.questName))
            {
                questLookup[quest.questName] = quest;
            }
        }
    }

    private void InitializePlayerCharacter()
    {
        // 创建默认玩家角色
        PlayerCharacter playerChar = new PlayerCharacter();
        playerChar.className = "Warrior";
        playerChar.level = 1;
        playerChar.experience = 0;
        playerChar.health = 100;
        playerChar.maxHealth = 100;
        playerChar.mana = 50;
        playerChar.maxMana = 50;
        playerChar.strength = 10;
        playerChar.dexterity = 10;
        playerChar.intelligence = 10;
        playerChar.defense = 5;

        // 装备默认武器
        if (itemLookup.ContainsKey("Wooden Sword"))
        {
            playerChar.EquipItem(itemLookup["Wooden Sword"]);
        }

        // 添加默认技能
        if (skillLookup.ContainsKey("Basic Attack"))
        {
            playerChar.LearnSkill(skillLookup["Basic Attack"]);
        }
    }

    // 获取物品数据
    public ItemData GetItemData(string itemName)
    {
        if (itemLookup.ContainsKey(itemName))
        {
            return itemLookup[itemName];
        }
        return null;
    }

    // 获取技能数据
    public SkillData GetSkillData(string skillName)
    {
        if (skillLookup.ContainsKey(skillName))
        {
            return skillLookup[skillName];
        }
        return null;
    }

    // 获取任务数据
    public QuestData GetQuestData(string questName)
    {
        if (questLookup.ContainsKey(questName))
        {
            return questLookup[questName];
        }
        return null;
    }

    // 玩家升级
    public void PlayerLevelUp(PlayerCharacter player)
    {
        player.level++;
        player.maxHealth += 20;
        player.health = player.maxHealth; // 升级时回满血
        player.maxMana += 10;
        player.mana = player.maxMana; // 升级时回满魔
        player.skillPoints += 1; // 每级获得1个技能点
        player.attributePoints += 2; // 每级获得2个属性点

        // 播放升级音效
        AudioManager.Instance?.PlaySFX("LevelUp");

        // 更新UI
        UIManager.Instance?.UpdateLevel(player.level);
    }

    // 计算经验值需求
    public int GetExperienceForLevel(int level)
    {
        // 指数增长：Exp = Base * Level^GrowthRate
        int baseExp = 100;
        float growthRate = 1.5f;
        return Mathf.RoundToInt(baseExp * Mathf.Pow(level, growthRate));
    }

    // 添加经验值
    public void AddExperience(PlayerCharacter player, int exp)
    {
        player.experience += exp;

        // 检查是否升级
        int expForNextLevel = GetExperienceForLevel(player.level + 1);
        while (player.experience >= expForNextLevel)
        {
            PlayerLevelUp(player);
            expForNextLevel = GetExperienceForLevel(player.level + 1);
        }

        // 更新UI
        UIManager.Instance?.UpdateScore(player.experience);
    }

    // 使用物品
    public bool UseItem(PlayerCharacter player, string itemName)
    {
        ItemData item = GetItemData(itemName);
        if (item == null) return false;

        switch (item.itemType)
        {
            case ItemType.Consumable:
                // 使用消耗品
                if (item.effectType == EffectType.Heal)
                {
                    player.health = Mathf.Min(player.maxHealth, player.health + item.effectValue);
                }
                else if (item.effectType == EffectType.ManaRestore)
                {
                    player.mana = Mathf.Min(player.maxMana, player.mana + item.effectValue);
                }
                
                // 从背包中移除物品
                player.RemoveItem(itemName);
                return true;

            case ItemType.Equipment:
                // 装备物品
                player.EquipItem(item);
                return true;
        }

        return false;
    }

    // 学习技能
    public bool LearnSkill(PlayerCharacter player, string skillName)
    {
        SkillData skill = GetSkillData(skillName);
        if (skill == null || player.skillPoints <= 0) return false;

        if (player.LearnSkill(skill))
        {
            player.skillPoints--;
            return true;
        }

        return false;
    }

    // 完成任务
    public void CompleteQuest(PlayerCharacter player, string questName)
    {
        QuestData quest = GetQuestData(questName);
        if (quest == null) return;

        // 给予奖励
        AddExperience(player, quest.experienceReward);
        player.gold += quest.goldReward;

        // 给予物品奖励
        foreach (string itemReward in quest.itemRewards)
        {
            player.AddItem(itemReward, 1);
        }

        // 更新任务状态
        player.completedQuests.Add(questName);

        // 播放完成音效
        AudioManager.Instance?.PlaySFX("QuestComplete");
    }

    // 检查任务条件
    public bool CheckQuestConditions(PlayerCharacter player, string questName)
    {
        QuestData quest = GetQuestData(questName);
        if (quest == null) return false;

        // 检查所有任务条件
        foreach (QuestCondition condition in quest.conditions)
        {
            switch (condition.type)
            {
                case QuestConditionType.KillEnemy:
                    if (!player.killCounts.ContainsKey(condition.target) || 
                        player.killCounts[condition.target] < condition.requiredCount)
                    {
                        return false;
                    }
                    break;
                case QuestConditionType.CollectItem:
                    if (player.GetItemQuantity(condition.target) < condition.requiredCount)
                    {
                        return false;
                    }
                    break;
                case QuestConditionType.ReachLevel:
                    if (player.level < condition.requiredCount)
                    {
                        return false;
                    }
                    break;
            }
        }

        return true;
    }
}

// 角色职业数据
[System.Serializable]
public class CharacterClass
{
    public string className;
    public float healthMultiplier = 1f;
    public float manaMultiplier = 1f;
    public float strengthGrowth = 1f;
    public float dexterityGrowth = 1f;
    public float intelligenceGrowth = 1f;
    public List<string> startingSkills = new List<string>();
    public List<string> startingItems = new List<string>();
}

// 物品数据
public enum ItemType
{
    Consumable,
    Equipment,
    QuestItem,
    Material
}

public enum EffectType
{
    None,
    Heal,
    ManaRestore,
    Buff,
    Debuff
}

[System.Serializable]
public class ItemData
{
    public string itemName;
    public ItemType itemType;
    public EffectType effectType;
    public int effectValue;
    public int buyPrice;
    public int sellPrice;
    public string description;
    public Sprite icon;
}

// 技能数据
public enum SkillType
{
    Active,
    Passive
}

public enum SkillTarget
{
    Self,
    Enemy,
    Ally,
    Area
}

[System.Serializable]
public class SkillData
{
    public string skillName;
    public SkillType skillType;
    public SkillTarget target;
    public int manaCost;
    public float cooldown;
    public int requiredLevel;
    public int damage;
    public float range;
    public string description;
    public Sprite icon;
}

// 任务数据
public enum QuestConditionType
{
    KillEnemy,
    CollectItem,
    ReachLevel,
    TalkToNPC,
    VisitLocation
}

[System.Serializable]
public class QuestCondition
{
    public QuestConditionType type;
    public string target;
    public int requiredCount;
}

[System.Serializable]
public class QuestData
{
    public string questName;
    public string description;
    public List<QuestCondition> conditions = new List<QuestCondition>();
    public int experienceReward;
    public int goldReward;
    public List<string> itemRewards = new List<string>();
    public bool isRepeatable;
    public int levelRequirement;
}

// 区域数据
[System.Serializable]
public class ZoneData
{
    public string zoneName;
    public string description;
    public int minLevel;
    public int maxLevel;
    public List<string> enemyTypes = new List<string>();
    public float enemySpawnRate;
    public List<string> resourceNodes = new List<string>();
    public Color mapColor;
}

// NPC数据
[System.Serializable]
public class NPCData
{
    public string npcName;
    public string dialogue;
    public NPCType npcType;
    public List<string> availableQuests = new List<string>();
    public List<string> shopItems = new List<string>();
}

public enum NPCType
{
    QuestGiver,
    Shopkeeper,
    Trainer,
    Story
}

// 玩家角色类
public class PlayerCharacter
{
    public string playerName;
    public string className;
    public int level;
    public int experience;
    public float health;
    public float maxHealth;
    public float mana;
    public float maxMana;
    public int strength;
    public int dexterity;
    public int intelligence;
    public int defense;
    public int gold;
    public int skillPoints;
    public int attributePoints;

    // 装备
    public Dictionary<EquipmentSlot, ItemData> equipment = new Dictionary<EquipmentSlot, ItemData>();
    
    // 背包
    public Dictionary<string, int> inventory = new Dictionary<string, int>();
    
    // 技能
    public List<SkillData> knownSkills = new List<SkillData>();
    
    // 任务
    public List<string> activeQuests = new List<string>();
    public List<string> completedQuests = new List<string>();
    public Dictionary<string, int> killCounts = new Dictionary<string, int>();

    public PlayerCharacter()
    {
        // 初始化装备槽
        foreach (EquipmentSlot slot in System.Enum.GetValues(typeof(EquipmentSlot)))
        {
            equipment[slot] = null;
        }
    }

    // 添加物品到背包
    public void AddItem(string itemName, int quantity)
    {
        if (inventory.ContainsKey(itemName))
        {
            inventory[itemName] += quantity;
        }
        else
        {
            inventory[itemName] = quantity;
        }
    }

    // 移除物品
    public bool RemoveItem(string itemName, int quantity = 1)
    {
        if (inventory.ContainsKey(itemName) && inventory[itemName] >= quantity)
        {
            inventory[itemName] -= quantity;
            if (inventory[itemName] <= 0)
            {
                inventory.Remove(itemName);
            }
            return true;
        }
        return false;
    }

    // 获取物品数量
    public int GetItemQuantity(string itemName)
    {
        if (inventory.ContainsKey(itemName))
        {
            return inventory[itemName];
        }
        return 0;
    }

    // 装备物品
    public bool EquipItem(ItemData item)
    {
        if (item.itemType != ItemType.Equipment) return false;

        // 确定装备槽
        EquipmentSlot slot = GetEquipmentSlot(item);
        if (slot == EquipmentSlot.None) return false;

        // 如果有已装备的物品，先卸下
        if (equipment[slot] != null)
        {
            UnequipItem(slot);
        }

        // 装备新物品
        equipment[slot] = item;
        
        // 应用属性加成
        ApplyEquipmentStats(item, true);

        return true;
    }

    // 卸下物品
    public bool UnequipItem(EquipmentSlot slot)
    {
        if (equipment.ContainsKey(slot) && equipment[slot] != null)
        {
            ItemData item = equipment[slot];
            equipment[slot] = null;
            
            // 移除属性加成
            ApplyEquipmentStats(item, false);
            
            // 将物品放回背包
            AddItem(item.itemName, 1);

            return true;
        }
        return false;
    }

    // 获取装备槽
    private EquipmentSlot GetEquipmentSlot(ItemData item)
    {
        // 根据物品名称或类型确定装备槽
        // 这里简化处理，实际应该有更复杂的逻辑
        if (item.itemName.Contains("Sword") || item.itemName.Contains("Axe") || item.itemName.Contains("Staff"))
        {
            return EquipmentSlot.Weapon;
        }
        else if (item.itemName.Contains("Helmet"))
        {
            return EquipmentSlot.Head;
        }
        else if (item.itemName.Contains("Chest") || item.itemName.Contains("Armor"))
        {
            return EquipmentSlot.Chest;
        }
        else if (item.itemName.Contains("Pants"))
        {
            return EquipmentSlot.Legs;
        }
        else if (item.itemName.Contains("Boots"))
        {
            return EquipmentSlot.Feet;
        }

        return EquipmentSlot.None;
    }

    // 应用装备属性
    private void ApplyEquipmentStats(ItemData item, bool isEquipping)
    {
        int multiplier = isEquipping ? 1 : -1;

        // 这里应该根据物品属性来增加角色属性
        // 简化版本，实际应该有更复杂的属性系统
        if (item.itemName.Contains("Sword"))
        {
            strength += 5 * multiplier;
        }
        else if (item.itemName.Contains("Armor"))
        {
            defense += 3 * multiplier;
        }
    }

    // 学习技能
    public bool LearnSkill(SkillData skill)
    {
        if (!knownSkills.Contains(skill) && level >= skill.requiredLevel)
        {
            knownSkills.Add(skill);
            return true;
        }
        return false;
    }

    // 使用技能
    public bool UseSkill(string skillName, PlayerCharacter target = null)
    {
        SkillData skill = knownSkills.Find(s => s.skillName == skillName);
        if (skill == null || mana < skill.manaCost) return false;

        // 扣除魔力
        mana -= skill.manaCost;

        // 执行技能效果
        ExecuteSkillEffect(skill, target);

        return true;
    }

    // 执行技能效果
    private void ExecuteSkillEffect(SkillData skill, PlayerCharacter target)
    {
        // 执行技能的逻辑
        // 这里简化处理
        if (skill.damage > 0 && target != null)
        {
            target.health -= skill.damage;
        }
    }
}

// 装备槽枚举
public enum EquipmentSlot
{
    None,
    Weapon,
    Head,
    Chest,
    Legs,
    Feet,
    Hands,
    Accessory1,
    Accessory2
}
```

---

## 常见错误和最佳实践

### 1. 性能优化最佳实践

```csharp
using UnityEngine;
using System.Collections.Generic;

// 性能优化示例
public class PerformanceOptimizedGame : MonoBehaviour
{
    [Header("对象池设置")]
    public GameObject enemyPrefab;
    public int enemyPoolSize = 50;

    private ObjectPool enemyPool;
    private List<GameObject> activeEnemies = new List<GameObject>();
    private Vector3[] enemyPositions = new Vector3[100]; // 缓存位置数组

    void Start()
    {
        // 初始化对象池
        InitializeObjectPool();
    }

    private void InitializeObjectPool()
    {
        // 创建对象池
        enemyPool = gameObject.AddComponent<ObjectPool>();
        
        // 添加池配置
        ObjectPool.PoolItem poolItem = new ObjectPool.PoolItem
        {
            tag = "Enemy",
            prefab = enemyPrefab,
            size = enemyPoolSize
        };
        
        enemyPool.items.Add(poolItem);
        enemyPool.Start(); // 初始化池
    }

    // 优化的敌人生成
    private GameObject SpawnEnemyOptimized(Vector3 position)
    {
        GameObject enemy = enemyPool.SpawnFromPool("Enemy", position, Quaternion.identity);
        if (enemy != null)
        {
            activeEnemies.Add(enemy);
        }
        return enemy;
    }

    // 优化的更新方法
    void Update()
    {
        // 使用缓存的数组而不是每次都创建新数组
        int activeCount = activeEnemies.Count;
        for (int i = 0; i < activeCount; i++)
        {
            if (activeEnemies[i] != null)
            {
                // 更新敌人逻辑
                UpdateEnemy(activeEnemies[i]);
            }
        }

        // 定期清理空引用
        if (Time.frameCount % 60 == 0) // 每秒检查一次（假设60FPS）
        {
            CleanupNullReferences();
        }
    }

    private void UpdateEnemy(GameObject enemy)
    {
        // 敌人更新逻辑
        // 使用缓存的组件引用而不是每次都GetComponent
        AIController ai = enemy.GetComponent<AIController>();
        if (ai != null)
        {
            ai.Update(Time.deltaTime);
        }
    }

    private void CleanupNullReferences()
    {
        activeEnemies.RemoveAll(item => item == null);
    }

    // 使用对象池回收敌人
    public void ReturnEnemyToPool(GameObject enemy)
    {
        if (enemy != null)
        {
            // 重置敌人状态
            ResetEnemy(enemy);
            
            // 返回池中
            PoolObject poolObj = enemy.GetComponent<PoolObject>();
            if (poolObj != null)
            {
                enemyPool.ReturnToPool(enemy, "Enemy");
            }
            else
            {
                // 如果没有PoolObject组件，手动回收
                enemy.SetActive(false);
                enemy.transform.SetParent(enemyPool.transform);
            }
            
            activeEnemies.Remove(enemy);
        }
    }

    private void ResetEnemy(GameObject enemy)
    {
        // 重置敌人状态
        HealthComponent health = enemy.GetComponent<HealthComponent>();
        if (health != null)
        {
            health.Resurrect(1f); // 满血复活
        }

        AIController ai = enemy.GetComponent<AIController>();
        if (ai != null)
        {
            ai.enabled = true;
            ai.health = ai.maxHealth;
            ai.currentState = AIState.Patrol;
        }
    }

    // 优化的射线检测
    private RaycastHit[] raycastHits = new RaycastHit[10]; // 重用射线检测结果数组

    public RaycastHit[] OptimizedRaycast(Vector3 origin, Vector3 direction, float distance, int layerMask)
    {
        int hitCount = Physics.RaycastNonAlloc(origin, direction, raycastHits, distance, layerMask);
        
        RaycastHit[] results = new RaycastHit[hitCount];
        for (int i = 0; i < hitCount; i++)
        {
            results[i] = raycastHits[i];
        }
        
        return results;
    }

    // 优化的碰撞检测
    private Collider[] overlapResults = new Collider[50]; // 重用碰撞检测结果数组

    public Collider[] OptimizedOverlapSphere(Vector3 position, float radius, int layerMask)
    {
        int overlapCount = Physics.OverlapSphereNonAlloc(position, radius, overlapResults, layerMask);
        
        Collider[] results = new Collider[overlapCount];
        for (int i = 0; i < overlapCount; i++)
        {
            results[i] = overlapResults[i];
        }
        
        return results;
    }

    // 使用位运算优化层检测
    private int groundLayerMask;
    private int enemyLayerMask;

    void OnValidate()
    {
        // 使用位运算预计算层掩码
        groundLayerMask = 1 << LayerMask.NameToLayer("Ground");
        enemyLayerMask = 1 << LayerMask.NameToLayer("Enemy");
    }

    // 优化的层检测
    public bool IsInLayerMask(int targetLayer, int layerMask)
    {
        return (layerMask & (1 << targetLayer)) != 0;
    }

    // 缓存字符串以避免GC
    private static readonly int HashSpeed = Animator.StringToHash("Speed");
    private static readonly int HashIsJumping = Animator.StringToHash("IsJumping");
    private static readonly int HashAttack = Animator.StringToHash("Attack");

    // 使用缓存的哈希值设置动画参数
    public void SetAnimationParameters(Animator animator, float speed, bool isJumping)
    {
        animator.SetFloat(HashSpeed, speed);
        animator.SetBool(HashIsJumping, isJumping);
    }

    // 优化的协程管理
    private List<Coroutine> managedCoroutines = new List<Coroutine>();

    protected Coroutine StartManagedCoroutine(IEnumerator routine)
    {
        Coroutine coroutine = StartCoroutine(routine);
        managedCoroutines.Add(coroutine);
        return coroutine;
    }

    protected void StopManagedCoroutine(Coroutine coroutine)
    {
        if (managedCoroutines.Contains(coroutine))
        {
            StopCoroutine(coroutine);
            managedCoroutines.Remove(coroutine);
        }
    }

    protected void StopAllManagedCoroutines()
    {
        foreach (Coroutine coroutine in managedCoroutines.ToArray())
        {
            if (coroutine != null)
            {
                StopCoroutine(coroutine);
            }
        }
        managedCoroutines.Clear();
    }

    void OnDestroy()
    {
        StopAllManagedCoroutines();
    }
}
```

### 2. 内存管理最佳实践

```csharp
using UnityEngine;
using System.Collections.Generic;

// 内存管理示例
public class MemoryManagementExample : MonoBehaviour
{
    // 避免装箱的数值类型操作
    private int[] intBuffer = new int[1000];
    private float[] floatBuffer = new float[1000];
    private Vector3[] vectorBuffer = new Vector3[1000];

    // 对象引用缓存
    private Transform cachedTransform;
    private Rigidbody cachedRigidbody;
    private Renderer cachedRenderer;
    private Collider cachedCollider;

    void Start()
    {
        // 缓存常用组件
        CacheComponents();
    }

    private void CacheComponents()
    {
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

    // 使用结构体而不是类来减少GC（适用于小对象）
    [System.Serializable]
    public struct GameData
    {
        public int id;
        public float value;
        public Vector3 position;
        public int state;

        public GameData(int id, float value, Vector3 position, int state)
        {
            this.id = id;
            this.value = value;
            this.position = position;
            this.state = state;
        }
    }

    // 对象池实现（避免频繁创建销毁对象）
    private Queue<GameObject> objectPool = new Queue<GameObject>();
    private int poolSize = 10;

    private void InitializeObjectPool(GameObject prefab)
    {
        for (int i = 0; i < poolSize; i++)
        {
            GameObject obj = Instantiate(prefab);
            obj.SetActive(false);
            objectPool.Enqueue(obj);
        }
    }

    public GameObject GetObjectFromPool()
    {
        if (objectPool.Count > 0)
        {
            GameObject obj = objectPool.Dequeue();
            obj.SetActive(true);
            return obj;
        }
        else
        {
            // 如果池空了，创建新对象（应该避免这种情况）
            Debug.LogWarning("Object pool is empty, creating new object");
            return new GameObject("PooledObject");
        }
    }

    public void ReturnObjectToPool(GameObject obj)
    {
        if (obj != null && objectPool.Count < poolSize * 2) // 防止池无限增长
        {
            obj.SetActive(false);
            objectPool.Enqueue(obj);
        }
        else if (obj != null)
        {
            // 池已满，直接销毁对象
            Destroy(obj);
        }
    }

    // 使用StringBuilder优化字符串操作
    private System.Text.StringBuilder stringBuilder = new System.Text.StringBuilder();

    public string BuildStatusString(int health, int mana, int level)
    {
        stringBuilder.Length = 0; // 清空但不重新分配内存
        stringBuilder.Append("Health: ");
        stringBuilder.Append(health);
        stringBuilder.Append(", Mana: ");
        stringBuilder.Append(mana);
        stringBuilder.Append(", Level: ");
        stringBuilder.Append(level);
        
        return stringBuilder.ToString();
    }

    // 预分配列表大小以避免频繁重分配
    private List<GameObject> enemies = new List<GameObject>(50); // 预分配容量
    private Dictionary<int, GameData> gameDataDict = new Dictionary<int, GameData>(100); // 预分配容量

    // 使用Span<T>进行高性能数组操作（C# 7.2+）
    public void ProcessArraySpan(int[] array)
    {
        System.Span<int> span = array.AsSpan();
        for (int i = 0; i < span.Length; i++)
        {
            span[i] *= 2; // 直接在栈上操作，无GC
        }
    }

    // 事件系统优化 - 避免内存泄漏
    private System.Action<int> optimizedScoreCallback;

    void SubscribeToEvents()
    {
        // 使用具体的方法而不是Lambda来避免闭包
        optimizedScoreCallback = OnScoreChanged;
        GameEvents.OnScoreChanged += optimizedScoreCallback;
    }

    void UnsubscribeFromEvents()
    {
        // 记得取消订阅以避免内存泄漏
        GameEvents.OnScoreChanged -= optimizedScoreCallback;
    }

    private void OnScoreChanged(int newScore)
    {
        // 处理分数改变
    }

    // 使用引用而不是值类型传递大数据结构
    public void ProcessLargeData(ref GameData data)
    {
        // 通过引用传递，避免复制大数据结构
        data.value += 10;
    }

    // 对象生命周期管理
    private List<System.IDisposable> disposableObjects = new List<System.IDisposable>();

    public void RegisterDisposable(System.IDisposable disposable)
    {
        disposableObjects.Add(disposable);
    }

    void Cleanup()
    {
        // 清理所有可释放对象
        foreach (var disposable in disposableObjects)
        {
            disposable?.Dispose();
        }
        disposableObjects.Clear();
    }

    void OnDestroy()
    {
        Cleanup();
        UnsubscribeFromEvents();
    }
}
```

---

## 总结

本章我们学习了Unity游戏开发的实战技能：

✅ **游戏架构设计**: 游戏管理器、状态管理、对象池系统、资源管理  
✅ **玩家角色系统**: 玩家控制器、武器系统、健康系统、输入处理  
✅ **敌人AI系统**: 基础AI、不同类型AI、行为树、群体AI  
✅ **碰撞检测**: 碰撞与触发器、物理交互、射线检测  
✅ **UI系统**: UI管理器、动态UI、动画效果  
✅ **音频系统**: 音频管理器、3D音效、音乐系统  
✅ **动画系统**: 动画控制器、状态机、混合树  
✅ **游戏管理器**: 高级游戏管理、状态管理、进度保存  

这些实战技能是开发完整游戏的基础，掌握它们能够帮助你构建功能丰富、性能良好的游戏。

---

## 下一步

继续学习 [08. 完整游戏项目](08-real-projects.md) →
