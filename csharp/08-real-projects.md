# 08. 完整游戏项目

> Unity完整游戏项目实战 - 从概念到发布的完整开发流程

---

## 📌 本章导航

- [2D平台跳跃游戏](#2d平台跳跃游戏)
- [塔防游戏](#塔防游戏)
- [RPG游戏系统](#rpg游戏系统)
- [游戏发布流程](#游戏发布流程)
- [性能优化实践](#性能优化实践)
- [项目总结与扩展](#项目总结与扩展)

---

## 2D平台跳跃游戏

### 项目概述

2D平台跳跃游戏是学习游戏开发的经典项目，它涵盖了角色控制、物理系统、关卡设计、敌人AI等核心概念。

**核心功能:**
- 角色移动和跳跃
- 物理碰撞检测
- 敌人AI系统
- 收集品系统
- 关卡设计
- UI界面

### 项目结构设计

```csharp
// 2D平台跳跃游戏的项目结构
using UnityEngine;
using System.Collections;
using System.Collections.Generic;

// 游戏管理器
public class PlatformerGameManager : MonoBehaviour
{
    [Header("游戏设置")]
    public int currentLevel = 1;
    public int maxLives = 3;
    public float timeLimit = 300f; // 5分钟

    [Header("玩家设置")]
    public GameObject playerPrefab;
    public Transform[] spawnPoints;
    public float respawnDelay = 3f;

    [Header("UI设置")]
    public PlatformerUIManager uiManager;
    public PlatformerAudioManager audioManager;

    [Header("游戏对象")]
    public List<GameObject> enemies = new List<GameObject>();
    public List<GameObject> collectibles = new List<GameObject>();
    public List<GameObject> platforms = new List<GameObject>();

    private int currentLives;
    private float currentTime;
    private bool isGameActive = false;
    private bool isLevelComplete = false;

    public static PlatformerGameManager Instance { get; private set; }

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
        InitializeGame();
    }

    private void InitializeGame()
    {
        currentLives = maxLives;
        currentTime = 0f;
        isGameActive = true;
        isLevelComplete = false;

        SpawnPlayer();
        InitializeUI();
        StartGameTimer();
    }

    private void SpawnPlayer()
    {
        if (playerPrefab != null && spawnPoints.Length > 0)
        {
            Transform spawnPoint = spawnPoints[Random.Range(0, spawnPoints.Length)];
            GameObject player = Instantiate(playerPrefab, spawnPoint.position, spawnPoint.rotation);
            
            // 注册玩家事件
            PlayerController2D playerCtrl = player.GetComponent<PlayerController2D>();
            if (playerCtrl != null)
            {
                playerCtrl.OnPlayerDeath += OnPlayerDeath;
                playerCtrl.OnLevelComplete += OnLevelComplete;
            }
        }
    }

    private void InitializeUI()
    {
        if (uiManager != null)
        {
            uiManager.UpdateLives(currentLives);
            uiManager.UpdateLevel(currentLevel);
            uiManager.UpdateTime(timeLimit);
        }
    }

    private void StartGameTimer()
    {
        StartCoroutine(GameTimerCoroutine());
    }

    private IEnumerator GameTimerCoroutine()
    {
        while (isGameActive && !isLevelComplete)
        {
            currentTime += Time.deltaTime;
            
            if (currentTime >= timeLimit)
            {
                GameOver();
                yield break;
            }

            if (uiManager != null)
            {
                uiManager.UpdateTime(timeLimit - currentTime);
            }

            yield return null;
        }
    }

    private void OnPlayerDeath()
    {
        currentLives--;

        if (uiManager != null)
        {
            uiManager.UpdateLives(currentLives);
        }

        if (currentLives <= 0)
        {
            GameOver();
        }
        else
        {
            // 延迟重生
            Invoke("RespawnPlayer", respawnDelay);
        }
    }

    private void RespawnPlayer()
    {
        // 销毁当前玩家
        GameObject currentPlayer = GameObject.FindGameObjectWithTag("Player");
        if (currentPlayer != null)
        {
            Destroy(currentPlayer);
        }

        // 重生玩家
        SpawnPlayer();
    }

    private void OnLevelComplete()
    {
        isLevelComplete = true;
        isGameActive = false;

        if (uiManager != null)
        {
            uiManager.ShowLevelComplete();
        }

        // 延迟进入下一关
        Invoke("LoadNextLevel", 3f);
    }

    private void LoadNextLevel()
    {
        currentLevel++;
        
        // 重新加载场景或加载下一关
        UnityEngine.SceneManagement.SceneManager.LoadScene(
            UnityEngine.SceneManagement.SceneManager.GetActiveScene().buildIndex + 1);
    }

    private void GameOver()
    {
        isGameActive = false;
        
        if (uiManager != null)
        {
            uiManager.ShowGameOver();
        }
    }

    public void AddScore(int points)
    {
        if (uiManager != null)
        {
            uiManager.AddScore(points);
        }
    }

    public void CollectItem()
    {
        if (uiManager != null)
        {
            uiManager.UpdateCollectibles();
        }
    }
}

// 玩家控制器2D
[RequireComponent(typeof(Rigidbody2D))]
public class PlayerController2D : MonoBehaviour
{
    [Header("移动设置")]
    public float moveSpeed = 5f;
    public float jumpForce = 10f;
    public float fallMultiplier = 2.5f; // 下降倍数，让跳跃更可控
    public float lowJumpMultiplier = 2f; // 短跳倍数

    [Header("地面检测")]
    public Transform groundCheck;
    public float groundCheckRadius = 0.2f;
    public LayerMask groundLayerMask;

    [Header("动画设置")]
    public Animator animator;
    public SpriteRenderer spriteRenderer;

    private Rigidbody2D rb;
    private bool isGrounded;
    private bool isJumping;
    private bool facingRight = true;
    private float horizontalInput;
    private bool jumpInput;
    private bool jumpHeld;

    // 事件
    public System.Action OnPlayerDeath;
    public System.Action OnLevelComplete;

    void Start()
    {
        rb = GetComponent<Rigidbody2D>();
        
        if (animator == null)
        {
            animator = GetComponent<Animator>();
        }
        
        if (spriteRenderer == null)
        {
            spriteRenderer = GetComponent<SpriteRenderer>();
        }

        // 设置地面检测点
        if (groundCheck == null)
        {
            groundCheck = new GameObject("GroundCheck").transform;
            groundCheck.SetParent(transform);
            groundCheck.localPosition = new Vector3(0, -0.5f, 0);
        }
    }

    void Update()
    {
        HandleInput();
        CheckGrounded();
        UpdateAnimation();
    }

    void FixedUpdate()
    {
        Move();
        HandleJump();
    }

    private void HandleInput()
    {
        horizontalInput = Input.GetAxisRaw("Horizontal");
        jumpInput = Input.GetButtonDown("Jump");
        jumpHeld = Input.GetButton("Jump");
    }

    private void Move()
    {
        rb.velocity = new Vector2(horizontalInput * moveSpeed, rb.velocity.y);

        // 翻转精灵方向
        if (horizontalInput > 0 && !facingRight)
        {
            Flip();
        }
        else if (horizontalInput < 0 && facingRight)
        {
            Flip();
        }
    }

    private void HandleJump()
    {
        isGrounded = Physics2D.OverlapCircle(groundCheck.position, groundCheckRadius, groundLayerMask);

        if (isGrounded && jumpInput)
        {
            rb.velocity = new Vector2(rb.velocity.x, jumpForce);
            isJumping = true;
        }

        // 可变跳跃高度
        if (rb.velocity.y < 0)
        {
            rb.velocity += Vector2.up * Physics2D.gravity.y * (fallMultiplier - 1) * Time.deltaTime;
        }
        else if (rb.velocity.y > 0 && !jumpHeld)
        {
            rb.velocity += Vector2.up * Physics2D.gravity.y * (lowJumpMultiplier - 1) * Time.deltaTime;
        }
    }

    private void CheckGrounded()
    {
        isGrounded = Physics2D.OverlapCircle(groundCheck.position, groundCheckRadius, groundLayerMask);
        
        if (isGrounded && isJumping)
        {
            isJumping = false;
        }
    }

    private void Flip()
    {
        facingRight = !facingRight;
        Vector3 scale = transform.localScale;
        scale.x *= -1;
        transform.localScale = scale;
    }

    private void UpdateAnimation()
    {
        if (animator != null)
        {
            animator.SetFloat("Speed", Mathf.Abs(horizontalInput));
            animator.SetBool("IsGrounded", isGrounded);
            animator.SetFloat("VerticalVelocity", rb.velocity.y);
        }
    }

    // 碰撞检测
    void OnCollisionEnter2D(Collision2D collision)
    {
        if (collision.gameObject.CompareTag("Enemy"))
        {
            TakeDamage();
        }
        else if (collision.gameObject.CompareTag("Hazard"))
        {
            Die();
        }
        else if (collision.gameObject.CompareTag("MovingPlatform"))
        {
            // 附加到移动平台
            transform.SetParent(collision.transform);
        }
    }

    void OnCollisionExit2D(Collision2D collision)
    {
        if (collision.gameObject.CompareTag("MovingPlatform"))
        {
            // 从移动平台分离
            transform.SetParent(null);
        }
    }

    void OnTriggerEnter2D(Collider2D other)
    {
        if (other.CompareTag("Collectible"))
        {
            CollectItem(other.gameObject);
        }
        else if (other.CompareTag("Goal"))
        {
            CompleteLevel();
        }
        else if (other.CompareTag("Checkpoint"))
        {
            SetCheckpoint(other.transform.position);
        }
    }

    private void TakeDamage()
    {
        // 可以添加无敌时间、闪烁效果等
        Die();
    }

    private void Die()
    {
        if (OnPlayerDeath != null)
        {
            OnPlayerDeath();
        }
        
        // 播放死亡效果
        gameObject.SetActive(false);
    }

    private void CollectItem(GameObject item)
    {
        // 添加分数
        PlatformerGameManager.Instance?.AddScore(10);
        
        // 播放收集音效
        PlatformerAudioManager.Instance?.PlaySFX("Collect");
        
        // 销毁收集品
        Destroy(item);
        
        // 通知游戏管理器
        PlatformerGameManager.Instance?.CollectItem();
    }

    private void CompleteLevel()
    {
        if (OnLevelComplete != null)
        {
            OnLevelComplete();
        }
    }

    private void SetCheckpoint(Vector3 position)
    {
        // 设置检查点，重生时从这里开始
        // 这里简化处理，实际应该有检查点系统
    }

    // 可视化地面检测
    void OnDrawGizmosSelected()
    {
        if (groundCheck != null)
        {
            Gizmos.color = isGrounded ? Color.green : Color.red;
            Gizmos.DrawWireSphere(groundCheck.position, groundCheckRadius);
        }
    }
}
```

### 敌人AI系统

```csharp
using UnityEngine;
using System.Collections;

// 平台跳跃游戏敌人基类
public class PlatformerEnemy : MonoBehaviour
{
    [Header("敌人设置")]
    public float moveSpeed = 2f;
    public float detectionRange = 5f;
    public float attackRange = 1f;
    public int health = 1;
    public int damage = 1;
    public float knockbackForce = 5f;

    [Header("巡逻设置")]
    public Transform[] patrolPoints;
    public float waitTime = 2f;
    public bool isPatrolling = true;

    [Header("动画设置")]
    public Animator animator;

    protected Transform player;
    protected Rigidbody2D rb;
    protected bool facingRight = true;
    protected int currentPatrolIndex = 0;
    protected bool isMovingToPatrolPoint = false;
    protected bool isAggressive = false;

    void Start()
    {
        rb = GetComponent<Rigidbody2D>();
        
        if (animator == null)
        {
            animator = GetComponent<Animator>();
        }

        FindPlayer();
        
        if (isPatrolling && patrolPoints.Length > 0)
        {
            StartCoroutine(PatrolCoroutine());
        }
    }

    void Update()
    {
        FindPlayer();
        UpdateAnimation();
    }

    void FindPlayer()
    {
        if (player == null)
        {
            GameObject playerObj = GameObject.FindGameObjectWithTag("Player");
            if (playerObj != null)
            {
                player = playerObj.transform;
            }
        }
    }

    void UpdateAnimation()
    {
        if (animator != null)
        {
            animator.SetFloat("Speed", rb.velocity.magnitude);
            animator.SetBool("IsAggressive", isAggressive);
        }
    }

    // 巡逻协程
    private IEnumerator PatrolCoroutine()
    {
        while (isPatrolling)
        {
            if (patrolPoints.Length > 0 && !isAggressive)
            {
                if (!isMovingToPatrolPoint)
                {
                    StartCoroutine(MoveToPatrolPoint());
                }
            }
            
            yield return new WaitForSeconds(0.1f);
        }
    }

    // 移动到巡逻点
    private IEnumerator MoveToPatrolPoint()
    {
        isMovingToPatrolPoint = true;
        
        Transform targetPoint = patrolPoints[currentPatrolIndex];
        
        while (Vector2.Distance(transform.position, targetPoint.position) > 0.5f)
        {
            Vector2 direction = (targetPoint.position - transform.position).normalized;
            rb.velocity = new Vector2(direction.x * moveSpeed, rb.velocity.y);
            
            // 翻转方向
            if (direction.x > 0 && !facingRight)
            {
                Flip();
            }
            else if (direction.x < 0 && facingRight)
            {
                Flip();
            }
            
            yield return null;
        }
        
        // 到达巡逻点，等待
        yield return new WaitForSeconds(waitTime);
        
        // 移动到下一个巡逻点
        currentPatrolIndex = (currentPatrolIndex + 1) % patrolPoints.Length;
        
        isMovingToPatrolPoint = false;
    }

    // 检测玩家
    void OnTriggerEnter2D(Collider2D other)
    {
        if (other.CompareTag("Player"))
        {
            isAggressive = true;
            StopCoroutine(PatrolCoroutine());
            StartCoroutine(ChasePlayerCoroutine());
        }
    }

    void OnTriggerExit2D(Collider2D other)
    {
        if (other.CompareTag("Player"))
        {
            isAggressive = false;
            if (isPatrolling)
            {
                StartCoroutine(PatrolCoroutine());
            }
        }
    }

    // 追击玩家协程
    private IEnumerator ChasePlayerCoroutine()
    {
        while (isAggressive && player != null)
        {
            float distanceToPlayer = Vector2.Distance(transform.position, player.position);
            
            if (distanceToPlayer <= attackRange)
            {
                // 攻击玩家
                AttackPlayer();
            }
            else if (distanceToPlayer <= detectionRange)
            {
                // 追击玩家
                Vector2 direction = (player.position - transform.position).normalized;
                rb.velocity = new Vector2(direction.x * moveSpeed, rb.velocity.y);
                
                // 翻转方向
                if (direction.x > 0 && !facingRight)
                {
                    Flip();
                }
                else if (direction.x < 0 && facingRight)
                {
                    Flip();
                }
            }
            else
            {
                // 超出检测范围，停止追击
                isAggressive = false;
                if (isPatrolling)
                {
                    StartCoroutine(PatrolCoroutine());
                }
            }
            
            yield return null;
        }
    }

    // 攻击玩家
    protected virtual void AttackPlayer()
    {
        if (player != null)
        {
            PlayerController2D playerCtrl = player.GetComponent<PlayerController2D>();
            if (playerCtrl != null)
            {
                // 对玩家造成伤害
                playerCtrl.TakeDamage();
            }
        }
    }

    // 受伤
    public virtual void TakeDamage(int damageAmount = 1)
    {
        health -= damageAmount;
        
        if (health <= 0)
        {
            Die();
        }
        else
        {
            // 击退效果
            if (player != null)
            {
                Vector2 knockbackDirection = (transform.position - player.position).normalized;
                rb.AddForce(knockbackDirection * knockbackForce, ForceMode2D.Impulse);
            }
        }
    }

    // 死亡
    protected virtual void Die()
    {
        // 播放死亡效果
        if (PlatformerAudioManager.Instance != null)
        {
            PlatformerAudioManager.Instance.PlaySFX("EnemyDie");
        }
        
        // 给予玩家分数
        PlatformerGameManager.Instance?.AddScore(50);
        
        // 销毁敌人
        Destroy(gameObject);
    }

    // 翻转方向
    protected void Flip()
    {
        facingRight = !facingRight;
        Vector3 scale = transform.localScale;
        scale.x *= -1;
        transform.localScale = scale;
    }

    // 可视化检测范围
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
                    Gizmos.DrawSphere(patrolPoints[i].position, 0.2f);
                    
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

// 特定类型的敌人 - 行走敌人
public class WalkingEnemy : PlatformerEnemy
{
    [Header("行走敌人特有设置")]
    public float jumpForce = 5f;
    public float jumpFrequency = 2f; // 跳跃频率
    private float lastJumpTime = 0f;

    protected override void AttackPlayer()
    {
        if (player != null && Time.time >= lastJumpTime + jumpFrequency)
        {
            // 跳向玩家
            Vector2 jumpDirection = (player.position - transform.position).normalized;
            rb.velocity = new Vector2(rb.velocity.x, jumpForce);
            
            lastJumpTime = Time.time;
        }
        
        base.AttackPlayer();
    }
}

// 特定类型的敌人 - 投射物敌人
public class ProjectileEnemy : PlatformerEnemy
{
    [Header("投射物敌人特有设置")]
    public GameObject projectilePrefab;
    public Transform firePoint;
    public float fireRate = 2f;
    private float lastFireTime = 0f;

    protected override void AttackPlayer()
    {
        if (player != null && Time.time >= lastFireTime + fireRate)
        {
            // 发射投射物
            if (projectilePrefab != null && firePoint != null)
            {
                GameObject projectile = Instantiate(projectilePrefab, firePoint.position, Quaternion.identity);
                Projectile proj = projectile.GetComponent<Projectile>();
                
                if (proj != null)
                {
                    Vector2 direction = (player.position - firePoint.position).normalized;
                    proj.Initialize(direction, 1); // 伤害值
                }
                
                lastFireTime = Time.time;
            }
        }
        
        base.AttackPlayer();
    }
}

// 投射物类
public class Projectile : MonoBehaviour
{
    public float speed = 10f;
    public int damage = 1;
    public float lifeTime = 5f;

    private Vector2 direction;
    private float lifeTimer = 0f;

    void Update()
    {
        transform.Translate(direction * speed * Time.deltaTime);
        lifeTimer += Time.deltaTime;

        if (lifeTimer >= lifeTime)
        {
            Destroy(gameObject);
        }
    }

    public void Initialize(Vector2 dir, int dmg)
    {
        direction = dir;
        damage = dmg;
        transform.right = direction; // 设置朝向
    }

    void OnTriggerEnter2D(Collider2D other)
    {
        if (other.CompareTag("Player"))
        {
            PlayerController2D player = other.GetComponent<PlayerController2D>();
            if (player != null)
            {
                player.TakeDamage();
            }
            
            Destroy(gameObject);
        }
        else if (other.CompareTag("Ground") || other.CompareTag("Obstacle"))
        {
            // 碰到地面或障碍物时销毁
            Destroy(gameObject);
        }
    }
}
```

### UI和音频系统

```csharp
using UnityEngine;
using UnityEngine.UI;
using System.Collections;

// 2D平台跳跃游戏UI管理器
public class PlatformerUIManager : MonoBehaviour
{
    [Header("UI元素")]
    public Text scoreText;
    public Text livesText;
    public Text levelText;
    public Text timeText;
    public Text collectiblesText;
    public Slider healthBar;
    public Image fadeImage;

    [Header("面板")]
    public GameObject gamePanel;
    public GameObject pausePanel;
    public GameObject gameOverPanel;
    public GameObject levelCompletePanel;
    public GameObject collectibleEffect;

    [Header("动画")]
    public Animator uiAnimator;

    private int currentScore = 0;
    private int currentLives = 3;
    private int currentLevel = 1;
    private int totalCollectibles = 0;
    private int collectedCount = 0;
    private float currentTime = 0f;

    void Start()
    {
        InitializeUI();
    }

    private void InitializeUI()
    {
        UpdateScore(0);
        UpdateLives(PlatformerGameManager.Instance?.maxLives ?? 3);
        UpdateLevel(PlatformerGameManager.Instance?.currentLevel ?? 1);
        UpdateTime(PlatformerGameManager.Instance?.timeLimit ?? 300f);
        UpdateCollectibles();
    }

    public void UpdateScore(int points)
    {
        currentScore += points;
        if (scoreText != null)
        {
            scoreText.text = $"Score: {currentScore}";
        }
    }

    public void AddScore(int points)
    {
        currentScore += points;
        if (scoreText != null)
        {
            scoreText.text = $"Score: {currentScore}";
        }
    }

    public void UpdateLives(int lives)
    {
        currentLives = lives;
        if (livesText != null)
        {
            livesText.text = $"Lives: {currentLives}";
        }
    }

    public void UpdateLevel(int level)
    {
        currentLevel = level;
        if (levelText != null)
        {
            levelText.text = $"Level: {currentLevel}";
        }
    }

    public void UpdateTime(float timeLeft)
    {
        currentTime = timeLeft;
        if (timeText != null)
        {
            int minutes = Mathf.FloorToInt(timeLeft / 60);
            int seconds = Mathf.FloorToInt(timeLeft % 60);
            timeText.text = $"Time: {minutes:00}:{seconds:00}";
        }
    }

    public void UpdateCollectibles()
    {
        collectedCount++;
        if (collectiblesText != null)
        {
            collectiblesText.text = $"Items: {collectedCount}/{totalCollectibles}";
        }
        
        // 显示收集效果
        if (collectibleEffect != null)
        {
            Instantiate(collectibleEffect, Vector3.zero, Quaternion.identity);
        }
    }

    public void UpdateHealth(float healthPercentage)
    {
        if (healthBar != null)
        {
            healthBar.value = healthPercentage;
        }
    }

    public void ShowPauseMenu()
    {
        if (pausePanel != null)
        {
            pausePanel.SetActive(true);
        }
    }

    public void HidePauseMenu()
    {
        if (pausePanel != null)
        {
            pausePanel.SetActive(false);
        }
    }

    public void ShowGameOver()
    {
        if (gameOverPanel != null)
        {
            gameOverPanel.SetActive(true);
        }
        
        if (gamePanel != null)
        {
            gamePanel.SetActive(false);
        }
    }

    public void ShowLevelComplete()
    {
        if (levelCompletePanel != null)
        {
            levelCompletePanel.SetActive(true);
        }
        
        if (gamePanel != null)
        {
            gamePanel.SetActive(false);
        }
    }

    // 按钮事件
    public void OnPauseButton()
    {
        PlatformerGameManager.Instance?.PauseGame();
        ShowPauseMenu();
    }

    public void OnResumeButton()
    {
        PlatformerGameManager.Instance?.ResumeGame();
        HidePauseMenu();
    }

    public void OnRestartButton()
    {
        UnityEngine.SceneManagement.SceneManager.LoadScene(
            UnityEngine.SceneManagement.SceneManager.GetActiveScene().buildIndex);
    }

    public void OnNextLevelButton()
    {
        // 加载下一关
        int currentScene = UnityEngine.SceneManagement.SceneManager.GetActiveScene().buildIndex;
        UnityEngine.SceneManagement.SceneManager.LoadScene(currentScene + 1);
    }

    public void OnQuitButton()
    {
        #if UNITY_EDITOR
        UnityEditor.EditorApplication.isPlaying = false;
        #else
        Application.Quit();
        #endif
    }

    // 淡入淡出效果
    public IEnumerator FadeToBlack(float duration)
    {
        if (fadeImage != null)
        {
            Color color = fadeImage.color;
            color.a = 0;
            fadeImage.color = color;

            float time = 0;
            while (time < duration)
            {
                time += Time.deltaTime;
                color.a = Mathf.Lerp(0, 1, time / duration);
                fadeImage.color = color;
                yield return null;
            }
        }
    }

    public IEnumerator FadeFromBlack(float duration)
    {
        if (fadeImage != null)
        {
            Color color = fadeImage.color;
            color.a = 1;
            fadeImage.color = color;

            float time = 0;
            while (time < duration)
            {
                time += Time.deltaTime;
                color.a = Mathf.Lerp(1, 0, time / duration);
                fadeImage.color = color;
                yield return null;
            }
        }
    }
}

// 2D平台跳跃游戏音频管理器
public class PlatformerAudioManager : MonoBehaviour
{
    [Header("音频源")]
    public AudioSource bgmSource;
    public AudioSource sfxSource;
    public AudioSource ambientSource;

    [Header("音频剪辑")]
    public AudioClip[] bgmClips;
    public AudioClip[] sfxClips;
    public AudioClip[] ambientClips;

    private Dictionary<string, AudioClip> sfxDictionary = new Dictionary<string, AudioClip>();
    private Dictionary<string, AudioClip> bgmDictionary = new Dictionary<string, AudioClip>();

    public static PlatformerAudioManager Instance { get; private set; }

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
        InitializeAudio();
    }

    private void InitializeAudio()
    {
        // 创建音频源（如果未设置）
        if (bgmSource == null)
        {
            GameObject bgmGO = new GameObject("BGMAudioSource");
            bgmGO.transform.SetParent(transform);
            bgmSource = bgmGO.AddComponent<AudioSource>();
            bgmSource.playOnAwake = false;
            bgmSource.loop = true;
        }

        if (sfxSource == null)
        {
            GameObject sfxGO = new GameObject("SFXAudioSource");
            sfxGO.transform.SetParent(transform);
            sfxSource = sfxGO.AddComponent<AudioSource>();
            sfxSource.playOnAwake = false;
            sfxSource.loop = false;
        }

        if (ambientSource == null)
        {
            GameObject ambientGO = new GameObject("AmbientAudioSource");
            ambientGO.transform.SetParent(transform);
            ambientSource = ambientGO.AddComponent<AudioSource>();
            ambientSource.playOnAwake = false;
            ambientSource.loop = true;
        }

        // 建立音频字典
        foreach (AudioClip clip in sfxClips)
        {
            if (clip != null)
            {
                sfxDictionary[clip.name] = clip;
            }
        }

        foreach (AudioClip clip in bgmClips)
        {
            if (clip != null)
            {
                bgmDictionary[clip.name] = clip;
            }
        }
    }

    public void PlaySFX(string sfxName)
    {
        if (sfxDictionary.TryGetValue(sfxName, out AudioClip clip))
        {
            sfxSource.PlayOneShot(clip);
        }
        else
        {
            Debug.LogWarning($"SFX '{sfxName}' not found!");
        }
    }

    public void PlayBGM(string bgmName, bool loop = true)
    {
        if (bgmDictionary.TryGetValue(bgmName, out AudioClip clip))
        {
            bgmSource.clip = clip;
            bgmSource.loop = loop;
            bgmSource.Play();
        }
        else
        {
            Debug.LogWarning($"BGM '{bgmName}' not found!");
        }
    }

    public void StopBGM()
    {
        bgmSource.Stop();
    }

    public void SetBGMVolume(float volume)
    {
        bgmSource.volume = volume;
    }

    public void SetSFXVolume(float volume)
    {
        sfxSource.volume = volume;
    }

    // 3D音效
    public void Play3DSound(AudioClip clip, Vector3 position, float volume = 1f)
    {
        if (clip == null) return;

        GameObject audioGO = new GameObject("3DAudioSource");
        audioGO.transform.position = position;
        AudioSource source = audioGO.AddComponent<AudioSource>();
        
        source.clip = clip;
        source.volume = volume;
        source.spatialBlend = 1f;
        source.maxDistance = 20f;
        
        source.Play();
        
        Destroy(audioGO, clip.length);
    }

    // 随机播放音效
    public void PlayRandomSFX(string[] sfxNames)
    {
        if (sfxNames.Length > 0)
        {
            string randomSFX = sfxNames[Random.Range(0, sfxNames.Length)];
            PlaySFX(randomSFX);
        }
    }
}
```

### 关卡设计和完成

```csharp
using UnityEngine;
using System.Collections;
using System.Collections.Generic;

// 关卡管理器
public class PlatformerLevelManager : MonoBehaviour
{
    [Header("关卡设置")]
    public int levelIndex;
    public string levelName;
    public int parTime = 180; // 标准时间（秒）
    public int parCollectibles = 10; // 标准收集品数量
    public int parScore = 1000; // 标准分数

    [Header("奖励设置")]
    public int timeBonus = 100; // 时间奖励
    public int collectibleBonus = 50; // 收集品奖励
    public int completionBonus = 500; // 完成奖励

    [Header("检查点")]
    public List<Transform> checkpoints = new List<Transform>();
    public Transform defaultSpawnPoint;

    [Header("关卡目标")]
    public List<LevelObjective> objectives = new List<LevelObjective>();

    private float levelStartTime;
    private int collectedItems = 0;
    private int destroyedEnemies = 0;
    private bool levelCompleted = false;

    void Start()
    {
        levelStartTime = Time.time;
        collectedItems = 0;
        destroyedEnemies = 0;
        levelCompleted = false;
    }

    // 更新收集品计数
    public void ItemCollected()
    {
        collectedItems++;
        CheckObjectives();
    }

    // 更新敌人消灭计数
    public void EnemyDestroyed()
    {
        destroyedEnemies++;
        CheckObjectives();
    }

    // 检查目标是否完成
    private void CheckObjectives()
    {
        bool allObjectivesMet = true;
        
        foreach (LevelObjective objective in objectives)
        {
            bool objectiveMet = false;
            
            switch (objective.type)
            {
                case ObjectiveType.CollectItems:
                    objectiveMet = collectedItems >= objective.targetCount;
                    break;
                case ObjectiveType.DestroyEnemies:
                    objectiveMet = destroyedEnemies >= objective.targetCount;
                    break;
                case ObjectiveType.ReachLocation:
                    // 这个需要在角色到达特定位置时手动设置
                    objectiveMet = objective.isCompleted;
                    break;
                case ObjectiveType.TimeLimit:
                    objectiveMet = (Time.time - levelStartTime) <= objective.targetTime;
                    break;
            }
            
            if (!objectiveMet)
            {
                allObjectivesMet = false;
                break;
            }
        }
        
        if (allObjectivesMet && !levelCompleted)
        {
            CompleteLevel();
        }
    }

    // 完成关卡
    private void CompleteLevel()
    {
        levelCompleted = true;
        
        // 计算奖励
        float levelTime = Time.time - levelStartTime;
        int timeBonus = Mathf.Max(0, Mathf.RoundToInt((parTime - levelTime) * timeBonus));
        int collectibleBonus = (collectedItems >= parCollectibles) ? parCollectibles * this.collectibleBonus : collectedItems * this.collectibleBonus;
        int completionBonus = this.completionBonus;
        
        int totalBonus = timeBonus + collectibleBonus + completionBonus;
        
        // 添加奖励分数
        PlatformerGameManager.Instance?.AddScore(totalBonus);
        
        // 保存关卡完成数据
        SaveLevelProgress();
        
        // 触发关卡完成事件
        PlatformerGameManager.Instance?.OnLevelComplete();
    }

    // 保存关卡进度
    private void SaveLevelProgress()
    {
        string levelKey = $"Level_{levelIndex}_Completed";
        PlayerPrefs.SetInt(levelKey, 1);
        
        string timeKey = $"Level_{levelIndex}_BestTime";
        float currentTime = Time.time - levelStartTime;
        if (!PlayerPrefs.HasKey(timeKey) || PlayerPrefs.GetFloat(timeKey) > currentTime)
        {
            PlayerPrefs.SetFloat(timeKey, currentTime);
        }
        
        string scoreKey = $"Level_{levelIndex}_BestScore";
        int currentScore = PlatformerGameManager.Instance?.currentScore ?? 0;
        if (!PlayerPrefs.HasKey(scoreKey) || PlayerPrefs.GetInt(scoreKey) < currentScore)
        {
            PlayerPrefs.SetInt(scoreKey, currentScore);
        }
        
        PlayerPrefs.Save();
    }

    // 设置检查点
    public void SetCurrentCheckpoint(Transform checkpoint)
    {
        // 在这里可以保存当前检查点信息
        // 用于角色死亡后重生
    }

    // 获取最近的检查点
    public Transform GetNearestCheckpoint(Vector3 position)
    {
        Transform nearest = null;
        float minDistance = float.MaxValue;
        
        foreach (Transform checkpoint in checkpoints)
        {
            float distance = Vector3.Distance(position, checkpoint.position);
            if (distance < minDistance)
            {
                minDistance = distance;
                nearest = checkpoint;
            }
        }
        
        return nearest ?? defaultSpawnPoint;
    }
}

// 关卡目标类型
public enum ObjectiveType
{
    CollectItems,
    DestroyEnemies,
    ReachLocation,
    TimeLimit
}

// 关卡目标
[System.Serializable]
public class LevelObjective
{
    public ObjectiveType type;
    public int targetCount = 1;
    public float targetTime = 60f;
    public string description;
    public bool isCompleted = false;
}

// 关卡目标触发器
public class LevelObjectiveTrigger : MonoBehaviour
{
    public ObjectiveType objectiveType;
    public int requiredCount = 1;
    public string targetTag;

    void OnTriggerEnter2D(Collider2D other)
    {
        if (other.CompareTag(targetTag))
        {
            PlatformerLevelManager levelManager = FindObjectOfType<PlatformerLevelManager>();
            if (levelManager != null)
            {
                switch (objectiveType)
                {
                    case ObjectiveType.CollectItems:
                        levelManager.ItemCollected();
                        break;
                    case ObjectiveType.DestroyEnemies:
                        levelManager.EnemyDestroyed();
                        break;
                    case ObjectiveType.ReachLocation:
                        CompleteReachObjective(levelManager);
                        break;
                }
                
                // 销毁触发器（如果是单次触发）
                Destroy(gameObject);
            }
        }
    }

    private void CompleteReachObjective(PlatformerLevelManager levelManager)
    {
        // 找到对应的目标并标记为完成
        LevelObjective objective = levelManager.objectives.Find(obj => obj.type == ObjectiveType.ReachLocation);
        if (objective != null)
        {
            objective.isCompleted = true;
        }
    }
}

// 收集品脚本
public class CollectibleItem : MonoBehaviour
{
    [Header("收集品设置")]
    public int points = 10;
    public bool rotate = true;
    public float rotationSpeed = 60f;
    public GameObject collectEffect;
    public AudioClip collectSound;

    [Header("特殊类型")]
    public bool isPowerUp = false;
    public PowerUpType powerUpType = PowerUpType.None;
    public float powerUpDuration = 10f;

    void Update()
    {
        if (rotate)
        {
            transform.Rotate(Vector3.up, rotationSpeed * Time.deltaTime);
        }
    }

    void OnTriggerEnter2D(Collider2D other)
    {
        if (other.CompareTag("Player"))
        {
            Collect();
        }
    }

    private void Collect()
    {
        // 添加分数
        PlatformerGameManager.Instance?.AddScore(points);
        
        // 播放音效
        if (collectSound != null)
        {
            PlatformerAudioManager.Instance?.PlaySFX(collectSound.name);
        }
        
        // 创建效果
        if (collectEffect != null)
        {
            Instantiate(collectEffect, transform.position, Quaternion.identity);
        }
        
        // 更新UI
        PlatformerUIManager.Instance?.UpdateCollectibles();
        
        // 通知关卡管理器
        PlatformerLevelManager levelManager = FindObjectOfType<PlatformerLevelManager>();
        if (levelManager != null)
        {
            levelManager.ItemCollected();
        }
        
        // 如果是强化道具，应用效果
        if (isPowerUp)
        {
            ApplyPowerUp();
        }
        
        // 销毁收集品
        Destroy(gameObject);
    }

    private void ApplyPowerUp()
    {
        PlayerController2D player = FindObjectOfType<PlayerController2D>();
        if (player != null)
        {
            switch (powerUpType)
            {
                case PowerUpType.SpeedBoost:
                    StartCoroutine(ApplySpeedBoost(player));
                    break;
                case PowerUpType.JumpBoost:
                    StartCoroutine(ApplyJumpBoost(player));
                    break;
                case PowerUpType.Invulnerability:
                    StartCoroutine(ApplyInvulnerability(player));
                    break;
            }
        }
    }

    private IEnumerator ApplySpeedBoost(PlayerController2D player)
    {
        float originalSpeed = player.moveSpeed;
        player.moveSpeed *= 1.5f; // 50%速度提升
        
        yield return new WaitForSeconds(powerUpDuration);
        
        player.moveSpeed = originalSpeed;
    }

    private IEnumerator ApplyJumpBoost(PlayerController2D player)
    {
        float originalJumpForce = player.jumpForce;
        player.jumpForce *= 1.3f; // 30%跳跃力提升
        
        yield return new WaitForSeconds(powerUpDuration);
        
        player.jumpForce = originalJumpForce;
    }

    private IEnumerator ApplyInvulnerability(PlayerController2D player)
    {
        // 这里需要在PlayerController2D中实现无敌逻辑
        // 简化处理，实际应该有更复杂的无敌系统
        yield return new WaitForSeconds(powerUpDuration);
    }
}

public enum PowerUpType
{
    None,
    SpeedBoost,
    JumpBoost,
    Invulnerability,
    ExtraLife
}
```

---

## 塔防游戏

### 项目概述

塔防游戏（Tower Defense）是一种策略游戏类型，玩家需要建造防御塔来阻止敌人到达终点。这类游戏涉及路径寻找、波次管理、经济系统、塔的升级等复杂机制。

**核心功能:**
- 路径系统和敌人移动
- 防御塔建造和升级
- 敌人AI和波次管理
- 经济系统（金钱、生命值）
- UI和游戏状态管理

### 核心系统设计

```csharp
using UnityEngine;
using System.Collections;
using System.Collections.Generic;

// 塔防游戏管理器
public class TowerDefenseManager : MonoBehaviour
{
    [Header("游戏设置")]
    public int startingMoney = 100;
    public int startingLives = 20;
    public int waveInterval = 10; // 波次间隔（秒）
    public int baseReward = 10; // 击杀基础奖励

    [Header("波次设置")]
    public List<WaveData> waves = new List<WaveData>();
    public int currentWave = 0;
    public int enemiesSpawned = 0;
    public int enemiesRemaining = 0;

    [Header("游戏状态")]
    public int currentMoney;
    public int currentLives;
    public bool isGameActive = false;
    public bool isWaveActive = false;

    [Header("引用")]
    public TowerDefenseUIManager uiManager;
    public TowerDefenseAudioManager audioManager;
    public PathManager pathManager;
    public List<Tower> towers = new List<Tower>();
    public List<Enemy> enemies = new List<Enemy>();

    public static TowerDefenseManager Instance { get; private set; }

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
        InitializeGame();
    }

    private void InitializeGame()
    {
        currentMoney = startingMoney;
        currentLives = startingLives;
        currentWave = 0;
        isGameActive = true;
        isWaveActive = false;

        InitializeUI();
        StartGame();
    }

    private void InitializeUI()
    {
        if (uiManager != null)
        {
            uiManager.UpdateMoney(currentMoney);
            uiManager.UpdateLives(currentLives);
            uiManager.UpdateWave(currentWave, waves.Count);
        }
    }

    private void StartGame()
    {
        if (waves.Count > 0)
        {
            StartCoroutine(GameLoop());
        }
    }

    private IEnumerator GameLoop()
    {
        while (isGameActive)
        {
            if (currentWave < waves.Count)
            {
                yield return StartCoroutine(SpawnWave(waves[currentWave]));
                
                // 等待当前波次的所有敌人被消灭
                while (enemiesRemaining > 0 && isGameActive)
                {
                    yield return null;
                }
                
                if (!isGameActive) break; // 如果游戏结束则退出
                
                currentWave++;
                
                if (uiManager != null)
                {
                    uiManager.UpdateWave(currentWave, waves.Count);
                }
                
                // 波次间隔
                yield return new WaitForSeconds(waveInterval);
            }
            else
            {
                // 所有波次完成，游戏胜利
                GameWin();
                break;
            }
        }
    }

    private IEnumerator SpawnWave(WaveData wave)
    {
        isWaveActive = true;
        enemiesSpawned = 0;
        enemiesRemaining = wave.enemyCount;

        for (int i = 0; i < wave.enemyCount; i++)
        {
            SpawnEnemy(wave.enemyType);
            enemiesSpawned++;
            
            // 敌人生成间隔
            yield return new WaitForSeconds(wave.spawnInterval);
        }
    }

    private void SpawnEnemy(EnemyType enemyType)
    {
        if (pathManager != null)
        {
            Vector3 spawnPos = pathManager.GetStartPoint();
            GameObject enemyPrefab = GetEnemyPrefab(enemyType);
            
            if (enemyPrefab != null)
            {
                GameObject enemyGO = Instantiate(enemyPrefab, spawnPos, Quaternion.identity);
                Enemy enemy = enemyGO.GetComponent<Enemy>();
                
                if (enemy != null)
                {
                    enemy.Initialize(pathManager.GetPath(), GetEnemyStats(enemyType));
                    enemies.Add(enemy);
                    
                    // 订阅敌人事件
                    enemy.OnEnemyKilled += OnEnemyKilled;
                    enemy.OnEnemyReachedEnd += OnEnemyReachedEnd;
                }
            }
        }
    }

    private GameObject GetEnemyPrefab(EnemyType enemyType)
    {
        // 根据敌人类型返回对应的预制件
        // 这里简化处理，实际应该有配置表
        switch (enemyType)
        {
            case EnemyType.Basic:
                return Resources.Load<GameObject>("Prefabs/Enemies/BasicEnemy");
            case EnemyType.Fast:
                return Resources.Load<GameObject>("Prefabs/Enemies/FastEnemy");
            case EnemyType.Tank:
                return Resources.Load<GameObject>("Prefabs/Enemies/TankEnemy");
            case EnemyType.Armored:
                return Resources.Load<GameObject>("Prefabs/Enemies/ArmoredEnemy");
            default:
                return Resources.Load<GameObject>("Prefabs/Enemies/BasicEnemy");
        }
    }

    private EnemyStats GetEnemyStats(EnemyType enemyType)
    {
        // 根据敌人类型返回对应的属性
        switch (enemyType)
        {
            case EnemyType.Basic:
                return new EnemyStats { health = 50, speed = 2f, reward = baseReward, armor = 0 };
            case EnemyType.Fast:
                return new EnemyStats { health = 30, speed = 4f, reward = baseReward * 1, armor = 0 };
            case EnemyType.Tank:
                return new EnemyStats { health = 150, speed = 1f, reward = baseReward * 3, armor = 2 };
            case EnemyType.Armored:
                return new EnemyStats { health = 80, speed = 1.5f, reward = baseReward * 2, armor = 5 };
            default:
                return new EnemyStats { health = 50, speed = 2f, reward = baseReward, armor = 0 };
        }
    }

    private void OnEnemyKilled(Enemy enemy, int reward)
    {
        // 移除敌人引用
        enemies.Remove(enemy);
        enemiesRemaining--;
        
        // 给予奖励
        AddMoney(reward);
        
        // 更新UI
        if (uiManager != null)
        {
            uiManager.UpdateEnemiesRemaining(enemiesRemaining);
        }
    }

    private void OnEnemyReachedEnd(Enemy enemy)
    {
        // 移除敌人引用
        enemies.Remove(enemy);
        enemiesRemaining--;
        
        // 减少生命值
        TakeDamage(1);
    }

    public void AddMoney(int amount)
    {
        currentMoney += amount;
        
        if (uiManager != null)
        {
            uiManager.UpdateMoney(currentMoney);
        }
    }

    public bool SpendMoney(int amount)
    {
        if (currentMoney >= amount)
        {
            currentMoney -= amount;
            
            if (uiManager != null)
            {
                uiManager.UpdateMoney(currentMoney);
            }
            
            return true;
        }
        
        return false;
    }

    public void TakeDamage(int damage)
    {
        currentLives -= damage;
        
        if (uiManager != null)
        {
            uiManager.UpdateLives(currentLives);
        }
        
        if (currentLives <= 0)
        {
            GameOver();
        }
    }

    public void BuildTower(Tower tower, Vector3 position)
    {
        if (SpendMoney(tower.cost))
        {
            GameObject towerGO = Instantiate(tower.gameObject, position, Quaternion.identity);
            Tower newTower = towerGO.GetComponent<Tower>();
            
            if (newTower != null)
            {
                towers.Add(newTower);
                newTower.Initialize();
            }
        }
    }

    public void UpgradeTower(Tower tower)
    {
        if (tower != null && SpendMoney(tower.upgradeCost))
        {
            tower.Upgrade();
        }
    }

    private void GameOver()
    {
        isGameActive = false;
        
        if (uiManager != null)
        {
            uiManager.ShowGameOver();
        }
    }

    private void GameWin()
    {
        isGameActive = false;
        
        if (uiManager != null)
        {
            uiManager.ShowGameWin();
        }
    }
}

// 波次数据
[System.Serializable]
public class WaveData
{
    public string waveName;
    public int enemyCount = 10;
    public float spawnInterval = 1f;
    public EnemyType enemyType = EnemyType.Basic;
    public int rewardMultiplier = 1;
}

// 敌人类型
public enum EnemyType
{
    Basic,
    Fast,
    Tank,
    Armored
}

// 敌人属性
[System.Serializable]
public class EnemyStats
{
    public int health = 100;
    public float speed = 2f;
    public int reward = 10;
    public int armor = 0;
}

// 路径管理器
public class PathManager : MonoBehaviour
{
    public List<Transform> waypoints = new List<Transform>();
    public Transform startPoint;
    public Transform endPoint;

    void Start()
    {
        // 自动查找路径点
        if (waypoints.Count == 0)
        {
            FindWaypoints();
        }
    }

    private void FindWaypoints()
    {
        // 查找子对象中的路径点
        Transform[] children = GetComponentsInChildren<Transform>();
        
        foreach (Transform child in children)
        {
            if (child.CompareTag("Waypoint"))
            {
                waypoints.Add(child);
            }
            else if (child.CompareTag("StartPoint"))
            {
                startPoint = child;
            }
            else if (child.CompareTag("EndPoint"))
            {
                endPoint = child;
            }
        }
        
        // 按照名称排序路径点（Waypoint_0, Waypoint_1, ...）
        waypoints.Sort((a, b) => {
            string aNum = System.Text.RegularExpressions.Regex.Replace(a.name, "[^0-9]", "");
            string bNum = System.Text.RegularExpressions.Regex.Replace(b.name, "[^0-9]", "");
            
            int aInt = int.TryParse(aNum, out int numA) ? numA : 0;
            int bInt = int.TryParse(bNum, out int numB) ? numB : 0;
            
            return aInt.CompareTo(bInt);
        });
    }

    public List<Vector3> GetPath()
    {
        List<Vector3> path = new List<Vector3>();
        
        foreach (Transform waypoint in waypoints)
        {
            path.Add(waypoint.position);
        }
        
        if (endPoint != null)
        {
            path.Add(endPoint.position);
        }
        
        return path;
    }

    public Vector3 GetStartPoint()
    {
        return startPoint != null ? startPoint.position : Vector3.zero;
    }

    public Vector3 GetEndPoint()
    {
        return endPoint != null ? endPoint.position : Vector3.zero;
    }

    // 可视化路径
    void OnDrawGizmos()
    {
        if (waypoints.Count > 0)
        {
            Vector3 previousPoint = waypoints[0].position;
            
            foreach (Transform waypoint in waypoints)
            {
                Gizmos.color = Color.red;
                Gizmos.DrawSphere(waypoint.position, 0.5f);
                
                if (waypoint != waypoints[0])
                {
                    Gizmos.color = Color.yellow;
                    Gizmos.DrawLine(previousPoint, waypoint.position);
                }
                
                previousPoint = waypoint.position;
            }
            
            // 绘制到终点的连线
            if (endPoint != null)
            {
                Gizmos.color = Color.yellow;
                Gizmos.DrawLine(previousPoint, endPoint.position);
            }
        }
    }
}
```

### 防御塔系统

```csharp
using UnityEngine;
using System.Collections.Generic;

// 防御塔基类
public abstract class Tower : MonoBehaviour
{
    [Header("塔的基本属性")]
    public string towerName = "Tower";
    public int cost = 50;
    public int upgradeCost = 30;
    public int maxLevel = 3;
    public int currentLevel = 1;

    [Header("攻击属性")]
    public float range = 5f;
    public float fireRate = 1f; // 每秒攻击次数
    public int damage = 10;
    public float projectileSpeed = 10f;
    public GameObject projectilePrefab;

    [Header("目标选择")]
    public TargetingMode targetingMode = TargetingMode.ClosestToGoal;
    public LayerMask enemyLayerMask;

    [Header("视觉效果")]
    public Transform turret; // 炮塔旋转部分
    public GameObject muzzleFlash;
    public GameObject rangeIndicator;

    protected float lastFireTime = 0f;
    protected List<Enemy> enemiesInRange = new List<Enemy>();
    protected Enemy currentTarget;
    protected bool isInitialized = false;

    // 属性修改器
    protected float rangeMultiplier = 1f;
    protected float damageMultiplier = 1f;
    protected float fireRateMultiplier = 1f;

    public virtual void Initialize()
    {
        if (isInitialized) return;

        isInitialized = true;

        // 设置范围指示器
        if (rangeIndicator != null)
        {
            rangeIndicator.transform.localScale = Vector3.one * range * 2f;
            rangeIndicator.SetActive(false); // 默认隐藏
        }

        // 开始检测敌人
        StartCoroutine(DetectEnemiesCoroutine());
    }

    // 检测敌人协程
    private IEnumerator DetectEnemiesCoroutine()
    {
        while (true)
        {
            DetectEnemies();
            yield return new WaitForSeconds(0.5f); // 每0.5秒检测一次
        }
    }

    // 检测范围内的敌人
    private void DetectEnemies()
    {
        Collider2D[] hitColliders = Physics2D.OverlapCircleAll(transform.position, range, enemyLayerMask);
        
        enemiesInRange.Clear();
        
        foreach (Collider2D collider in hitColliders)
        {
            Enemy enemy = collider.GetComponent<Enemy>();
            if (enemy != null && enemy.isActiveAndEnabled)
            {
                enemiesInRange.Add(enemy);
            }
        }

        // 选择目标
        SelectTarget();
    }

    // 选择攻击目标
    private void SelectTarget()
    {
        if (enemiesInRange.Count == 0)
        {
            currentTarget = null;
            return;
        }

        switch (targetingMode)
        {
            case TargetingMode.ClosestToGoal:
                currentTarget = GetClosestToGoal();
                break;
            case TargetingMode.Strongest:
                currentTarget = GetStrongest();
                break;
            case TargetingMode.Weakest:
                currentTarget = GetWeakest();
                break;
            case TargetingMode.FirstEntered:
                currentTarget = enemiesInRange[0];
                break;
        }
    }

    // 获取最接近终点的敌人
    private Enemy GetClosestToGoal()
    {
        Enemy closest = null;
        float minDistance = float.MaxValue;

        foreach (Enemy enemy in enemiesInRange)
        {
            if (TowerDefenseManager.Instance.pathManager != null)
            {
                float distance = Vector3.Distance(enemy.transform.position, 
                    TowerDefenseManager.Instance.pathManager.GetEndPoint());
                
                if (distance < minDistance)
                {
                    minDistance = distance;
                    closest = enemy;
                }
            }
        }

        return closest;
    }

    // 获取最强的敌人
    private Enemy GetStrongest()
    {
        Enemy strongest = null;
        int maxHealth = 0;

        foreach (Enemy enemy in enemiesInRange)
        {
            if (enemy.currentHealth > maxHealth)
            {
                maxHealth = enemy.currentHealth;
                strongest = enemy;
            }
        }

        return strongest;
    }

    // 获取最弱的敌人
    private Enemy GetWeakest()
    {
        Enemy weakest = null;
        int minHealth = int.MaxValue;

        foreach (Enemy enemy in enemiesInRange)
        {
            if (enemy.currentHealth < minHealth)
            {
                minHealth = enemy.currentHealth;
                weakest = enemy;
            }
        }

        return weakest;
    }

    void Update()
    {
        if (!isInitialized) return;

        // 攻击逻辑
        if (currentTarget != null && CanFire())
        {
            AimAtTarget();
            FireAtTarget();
        }

        // 转向目标
        if (currentTarget != null && turret != null)
        {
            Vector3 direction = currentTarget.transform.position - turret.position;
            float angle = Mathf.Atan2(direction.y, direction.x) * Mathf.Rad2Deg;
            turret.rotation = Quaternion.AngleAxis(angle, Vector3.forward);
        }
    }

    // 是否可以开火
    private bool CanFire()
    {
        return Time.time >= lastFireTime + (1f / (fireRate * fireRateMultiplier));
    }

    // 瞄准目标
    private void AimAtTarget()
    {
        if (turret != null && currentTarget != null)
        {
            Vector3 direction = currentTarget.transform.position - turret.position;
            float angle = Mathf.Atan2(direction.y, direction.x) * Mathf.Rad2Deg;
            turret.rotation = Quaternion.AngleAxis(angle, Vector3.forward);
        }
    }

    // 攻击目标
    protected virtual void FireAtTarget()
    {
        lastFireTime = Time.time;

        if (projectilePrefab != null)
        {
            Vector3 firePos = turret != null ? turret.position : transform.position;
            GameObject projectileGO = Instantiate(projectilePrefab, firePos, turret.rotation);
            Projectile projectile = projectileGO.GetComponent<Projectile>();

            if (projectile != null)
            {
                projectile.Initialize(currentTarget, damage * damageMultiplier, projectileSpeed);
            }
        }

        // 显示枪口闪光
        if (muzzleFlash != null)
        {
            muzzleFlash.SetActive(true);
            Invoke("HideMuzzleFlash", 0.05f);
        }

        // 播放音效
        if (TowerDefenseAudioManager.Instance != null)
        {
            TowerDefenseAudioManager.Instance.PlaySFX("TowerShoot");
        }
    }

    private void HideMuzzleFlash()
    {
        if (muzzleFlash != null)
        {
            muzzleFlash.SetActive(false);
        }
    }

    // 升级塔
    public virtual void Upgrade()
    {
        if (currentLevel < maxLevel)
        {
            currentLevel++;
            ApplyUpgradeStats();
        }
    }

    // 应用升级属性
    protected virtual void ApplyUpgradeStats()
    {
        // 基础升级效果
        damage = Mathf.RoundToInt(damage * 1.3f);
        range = range * 1.1f;
        fireRate = fireRate * 1.1f;
    }

    // 应用属性修改器
    public void ApplyModifier(TowerModifier modifier)
    {
        switch (modifier.type)
        {
            case ModifierType.Range:
                rangeMultiplier *= modifier.value;
                break;
            case ModifierType.Damage:
                damageMultiplier *= modifier.value;
                break;
            case ModifierType.FireRate:
                fireRateMultiplier *= modifier.value;
                break;
        }
    }

    // 移除属性修改器
    public void RemoveModifier(TowerModifier modifier)
    {
        switch (modifier.type)
        {
            case ModifierType.Range:
                rangeMultiplier /= modifier.value;
                break;
            case ModifierType.Damage:
                damageMultiplier /= modifier.value;
                break;
            case ModifierType.FireRate:
                fireRateMultiplier /= modifier.value;
                break;
        }
    }

    // 显示范围
    public void ShowRange(bool show)
    {
        if (rangeIndicator != null)
        {
            rangeIndicator.SetActive(show);
        }
    }

    // 可视化范围
    void OnDrawGizmosSelected()
    {
        Gizmos.color = Color.red;
        Gizmos.DrawWireSphere(transform.position, range);
    }
}

// 目标选择模式
public enum TargetingMode
{
    ClosestToGoal,  // 最接近终点
    Strongest,      // 最强的
    Weakest,        // 最弱的
    FirstEntered    // 第一个进入范围的
}

// 塔的属性修改器
[System.Serializable]
public class TowerModifier
{
    public ModifierType type;
    public float value = 1.1f; // 增加的倍数
    public float duration = -1f; // 持续时间，-1表示永久
}

public enum ModifierType
{
    Range,
    Damage,
    FireRate
}

// 具体的塔类型 - 炮塔
public class CannonTower : Tower
{
    [Header("炮塔特有属性")]
    public float explosionRadius = 2f;
    public int explosionDamage = 15;

    protected override void FireAtTarget()
    {
        lastFireTime = Time.time;

        // 发射爆炸炮弹
        if (projectilePrefab != null)
        {
            Vector3 firePos = turret != null ? turret.position : transform.position;
            GameObject projectileGO = Instantiate(projectilePrefab, firePos, turret.rotation);
            ExplosionProjectile projectile = projectileGO.GetComponent<ExplosionProjectile>();

            if (projectile != null)
            {
                projectile.Initialize(currentTarget, damage * damageMultiplier, projectileSpeed, explosionRadius, explosionDamage * damageMultiplier);
            }
        }

        // 显示枪口闪光
        if (muzzleFlash != null)
        {
            muzzleFlash.SetActive(true);
            Invoke("HideMuzzleFlash", 0.05f);
        }

        // 播放音效
        if (TowerDefenseAudioManager.Instance != null)
        {
            TowerDefenseAudioManager.Instance.PlaySFX("CannonShoot");
        }
    }

    protected override void ApplyUpgradeStats()
    {
        base.ApplyUpgradeStats();
        
        // 炮塔特有升级
        explosionRadius *= 1.1f;
        explosionDamage = Mathf.RoundToInt(explosionDamage * 1.2f);
    }
}

// 具体的塔类型 - 箭塔
public class ArrowTower : Tower
{
    [Header("箭塔特有属性")]
    public float slowPercentage = 0.3f; // 减速百分比
    public float slowDuration = 1f; // 减速持续时间

    protected override void FireAtTarget()
    {
        lastFireTime = Time.time;

        // 发射减速箭
        if (projectilePrefab != null)
        {
            Vector3 firePos = turret != null ? turret.position : transform.position;
            GameObject projectileGO = Instantiate(projectilePrefab, firePos, turret.rotation);
            SlowProjectile projectile = projectileGO.GetComponent<SlowProjectile>();

            if (projectile != null)
            {
                projectile.Initialize(currentTarget, damage * damageMultiplier, projectileSpeed, slowPercentage, slowDuration);
            }
        }

        // 显示枪口闪光
        if (muzzleFlash != null)
        {
            muzzleFlash.SetActive(true);
            Invoke("HideMuzzleFlash", 0.05f);
        }

        // 播放音效
        if (TowerDefenseAudioManager.Instance != null)
        {
            TowerDefenseAudioManager.Instance.PlaySFX("ArrowShoot");
        }
    }

    protected override void ApplyUpgradeStats()
    {
        base.ApplyUpgradeStats();
        
        // 箭塔特有升级
        slowPercentage += 0.05f;
        slowDuration += 0.2f;
    }
}

// 具体的塔类型 - 激光塔
public class LaserTower : Tower
{
    [Header("激光塔特有属性")]
    public LineRenderer laserLine;
    public float laserWidth = 0.1f;
    public float pierceCount = 1; // 穿透数量

    void Start()
    {
        if (laserLine == null)
        {
            laserLine = GetComponent<LineRenderer>();
            if (laserLine == null)
            {
                laserLine = gameObject.AddComponent<LineRenderer>();
            }
        }

        if (laserLine != null)
        {
            laserLine.startWidth = laserWidth;
            laserLine.endWidth = laserWidth;
            laserLine.enabled = false;
        }
    }

    void Update()
    {
        if (!isInitialized) return;

        if (currentTarget != null && Vector3.Distance(transform.position, currentTarget.transform.position) <= range)
        {
            if (CanFire())
            {
                AimAtTarget();
                FireAtTarget();
            }
        }
        else
        {
            if (laserLine != null)
            {
                laserLine.enabled = false;
            }
        }
    }

    protected override void FireAtTarget()
    {
        if (laserLine != null && currentTarget != null)
        {
            laserLine.enabled = true;
            laserLine.SetPosition(0, transform.position);
            laserLine.SetPosition(1, currentTarget.transform.position);

            // 对目标造成持续伤害
            currentTarget.TakeDamage(damage * damageMultiplier * Time.deltaTime);
        }

        // 激光塔不需要重置lastFireTime，因为是持续攻击
    }

    protected override void ApplyUpgradeStats()
    {
        base.ApplyUpgradeStats();
        
        // 激光塔特有升级
        pierceCount += 1;
        damage = Mathf.RoundToInt(damage * 1.1f);
    }
}

// 投射物类
public abstract class Projectile : MonoBehaviour
{
    protected Enemy target;
    protected int damage;
    protected float speed;
    protected Vector3 direction;
    protected float lifeTime = 5f;
    protected float lifeTimer = 0f;

    public virtual void Initialize(Enemy target, int damage, float speed)
    {
        this.target = target;
        this.damage = damage;
        this.speed = speed;
        
        if (target != null)
        {
            direction = (target.transform.position - transform.position).normalized;
            transform.right = direction; // 设置朝向
        }
    }

    void Update()
    {
        Move();
        lifeTimer += Time.deltaTime;

        if (lifeTimer >= lifeTime || target == null)
        {
            Destroy(gameObject);
        }
    }

    protected virtual void Move()
    {
        transform.Translate(direction * speed * Time.deltaTime);
    }

    void OnTriggerEnter2D(Collider2D other)
    {
        if (other.CompareTag("Enemy") && other.gameObject == target.gameObject)
        {
            OnHitEnemy(other.GetComponent<Enemy>());
            OnHit();
        }
        else if (other.CompareTag("Obstacle"))
        {
            OnHit();
        }
    }

    protected virtual void OnHitEnemy(Enemy enemy)
    {
        if (enemy != null)
        {
            enemy.TakeDamage(damage);
        }
    }

    protected virtual void OnHit()
    {
        // 投射物命中后的处理
        Destroy(gameObject);
    }
}

// 爆炸投射物
public class ExplosionProjectile : Projectile
{
    public float explosionRadius = 2f;
    public int explosionDamage = 15;
    public GameObject explosionEffect;

    public void Initialize(Enemy target, int damage, float speed, float explosionRadius, int explosionDamage)
    {
        base.Initialize(target, damage, speed);
        this.explosionRadius = explosionRadius;
        this.explosionDamage = explosionDamage;
    }

    protected override void OnHit()
    {
        // 创建爆炸效果
        if (explosionEffect != null)
        {
            Instantiate(explosionEffect, transform.position, Quaternion.identity);
        }

        // 对范围内的敌人造成伤害
        Collider2D[] hitColliders = Physics2D.OverlapCircleAll(transform.position, explosionRadius);
        
        foreach (Collider2D collider in hitColliders)
        {
            if (collider.CompareTag("Enemy"))
            {
                Enemy enemy = collider.GetComponent<Enemy>();
                if (enemy != null)
                {
                    enemy.TakeDamage(explosionDamage);
                }
            }
        }

        // 播放音效
        if (TowerDefenseAudioManager.Instance != null)
        {
            TowerDefenseAudioManager.Instance.PlaySFX("Explosion");
        }

        Destroy(gameObject);
    }
}

// 减速投射物
public class SlowProjectile : Projectile
{
    public float slowPercentage = 0.3f;
    public float slowDuration = 1f;

    public void Initialize(Enemy target, int damage, float speed, float slowPercentage, float slowDuration)
    {
        base.Initialize(target, damage, speed);
        this.slowPercentage = slowPercentage;
        this.slowDuration = slowDuration;
    }

    protected override void OnHitEnemy(Enemy enemy)
    {
        if (enemy != null)
        {
            enemy.TakeDamage(damage);
            enemy.ApplySlow(slowPercentage, slowDuration);
        }
    }
}
```

### 敌人系统

```csharp
using UnityEngine;
using System.Collections;
using System.Collections.Generic;

// 敌人类
[RequireComponent(typeof(Rigidbody2D))]
public class Enemy : MonoBehaviour
{
    [Header("敌人属性")]
    public EnemyType enemyType;
    public int maxHealth = 100;
    public int currentHealth;
    public float speed = 2f;
    public int reward = 10;
    public int armor = 0;
    public float slowResistance = 0.5f; // 减速抵抗

    [Header("视觉效果")]
    public SpriteRenderer spriteRenderer;
    public GameObject deathEffect;
    public Material slowMaterial; // 减速时的材质

    [Header("状态")]
    public bool isSlowed = false;
    public float slowMultiplier = 1f;
    public float slowDuration = 0f;

    private Rigidbody2D rb;
    private List<Vector3> path;
    private int currentWaypointIndex = 0;
    private Material originalMaterial;
    private bool hasReachedEnd = false;

    // 事件
    public System.Action<Enemy, int> OnEnemyKilled;
    public System.Action<Enemy> OnEnemyReachedEnd;

    void Start()
    {
        rb = GetComponent<Rigidbody2D>();
        
        if (spriteRenderer == null)
        {
            spriteRenderer = GetComponent<SpriteRenderer>();
        }

        currentHealth = maxHealth;

        // 保存原始材质
        if (spriteRenderer != null)
        {
            originalMaterial = spriteRenderer.material;
        }
    }

    public void Initialize(List<Vector3> path, EnemyStats stats)
    {
        this.path = path;
        this.maxHealth = stats.health;
        this.currentHealth = stats.health;
        this.speed = stats.speed;
        this.reward = stats.reward;
        this.armor = stats.armor;
    }

    void Update()
    {
        if (path != null && currentWaypointIndex < path.Count && !hasReachedEnd)
        {
            MoveAlongPath();
        }

        UpdateSlowEffect();
    }

    private void MoveAlongPath()
    {
        if (currentWaypointIndex >= path.Count)
        {
            // 到达终点
            if (!hasReachedEnd)
            {
                hasReachedEnd = true;
                if (OnEnemyReachedEnd != null)
                {
                    OnEnemyReachedEnd(this);
                }
                Destroy(gameObject);
            }
            return;
        }

        Vector3 targetPosition = path[currentWaypointIndex];
        Vector3 direction = (targetPosition - transform.position).normalized;

        rb.velocity = direction * speed * slowMultiplier;

        // 检查是否到达当前路径点
        if (Vector3.Distance(transform.position, targetPosition) < 0.1f)
        {
            currentWaypointIndex++;
        }
    }

    // 受到伤害
    public void TakeDamage(int damage)
    {
        // 计算护甲减免
        int actualDamage = Mathf.Max(1, damage - armor);
        currentHealth -= actualDamage;

        // 更新视觉效果（比如血量条）
        UpdateVisualEffect();

        if (currentHealth <= 0)
        {
            Die();
        }
    }

    // 应用减速效果
    public void ApplySlow(float slowPercentage, float duration)
    {
        // 考虑减速抵抗
        float actualSlow = slowPercentage * (1f - slowResistance);
        slowMultiplier = 1f - actualSlow;
        slowDuration = duration;

        // 应用减速视觉效果
        ApplySlowVisualEffect();
    }

    // 更新减速效果
    private void UpdateSlowEffect()
    {
        if (isSlowed)
        {
            slowDuration -= Time.deltaTime;
            if (slowDuration <= 0)
            {
                ResetSlowEffect();
            }
        }
    }

    // 重置减速效果
    private void ResetSlowEffect()
    {
        isSlowed = false;
        slowMultiplier = 1f;
        
        // 移除减速视觉效果
        if (spriteRenderer != null && originalMaterial != null)
        {
            spriteRenderer.material = originalMaterial;
        }
    }

    // 应用减速视觉效果
    private void ApplySlowVisualEffect()
    {
        isSlowed = true;
        if (spriteRenderer != null && slowMaterial != null)
        {
            spriteRenderer.material = slowMaterial;
        }
    }

    // 更新视觉效果
    private void UpdateVisualEffect()
    {
        // 这里可以更新血量条、闪烁效果等
        if (spriteRenderer != null)
        {
            // 简单的受伤闪烁效果
            StartCoroutine(FlashRed());
        }
    }

    // 受伤闪烁效果
    private IEnumerator FlashRed()
    {
        if (spriteRenderer != null)
        {
            Color originalColor = spriteRenderer.color;
            spriteRenderer.color = Color.red;
            yield return new WaitForSeconds(0.1f);
            spriteRenderer.color = originalColor;
        }
    }

    // 死亡
    private void Die()
    {
        // 播放死亡效果
        if (deathEffect != null)
        {
            Instantiate(deathEffect, transform.position, Quaternion.identity);
        }

        // 给予奖励
        if (OnEnemyKilled != null)
        {
            OnEnemyKilled(this, reward);
        }

        // 播放音效
        if (TowerDefenseAudioManager.Instance != null)
        {
            TowerDefenseAudioManager.Instance.PlaySFX("EnemyDie");
        }

        // 销毁敌人
        Destroy(gameObject);
    }

    // 获取生命值百分比
    public float GetHealthPercentage()
    {
        return (float)currentHealth / maxHealth;
    }

    // 可视化生命值
    void OnDrawGizmos()
    {
        // 显示生命值条
        if (currentHealth < maxHealth)
        {
            Vector3 screenPos = Camera.current.WorldToScreenPoint(transform.position + Vector3.up * 1f);
            if (Camera.current != null)
            {
                // 绘制生命值条（在场景视图中）
                Gizmos.color = Color.red;
                Vector3 healthBarSize = new Vector3(1f, 0.1f, 0f);
                Vector3 healthBarPos = transform.position + Vector3.up * 0.5f;
                Gizmos.DrawCube(healthBarPos, healthBarSize);

                Gizmos.color = Color.green;
                Vector3 filledHealthBarSize = new Vector3(1f * GetHealthPercentage(), 0.1f, 0f);
                Vector3 filledHealthBarPos = healthBarPos + Vector3.left * (1f - GetHealthPercentage()) / 2f;
                Gizmos.DrawCube(filledHealthBarPos, filledHealthBarSize);
            }
        }
    }
}
```

### UI和游戏控制

```csharp
using UnityEngine;
using UnityEngine.UI;
using System.Collections;

// 塔防游戏UI管理器
public class TowerDefenseUIManager : MonoBehaviour
{
    [Header("游戏UI")]
    public Text moneyText;
    public Text livesText;
    public Text waveText;
    public Text enemiesRemainingText;
    public Slider buildProgressSlider;
    public Text buildProgressText;

    [Header("建造菜单")]
    public GameObject buildMenu;
    public Button[] towerButtons;
    public Text[] towerCostTexts;

    [Header("游戏面板")]
    public GameObject gamePanel;
    public GameObject pausePanel;
    public GameObject gameOverPanel;
    public GameObject gameWinPanel;
    public GameObject towerInfoPanel;
    public Text towerInfoText;

    [Header("音效控制")]
    public Slider bgmVolumeSlider;
    public Slider sfxVolumeSlider;

    private bool isBuildMenuActive = false;
    private Tower selectedTowerForUpgrade;

    void Start()
    {
        InitializeUI();
        SetupVolumeSliders();
    }

    private void InitializeUI()
    {
        UpdateMoney(TowerDefenseManager.Instance?.currentMoney ?? 0);
        UpdateLives(TowerDefenseManager.Instance?.currentLives ?? 20);
        UpdateWave(TowerDefenseManager.Instance?.currentWave ?? 0, 
                  TowerDefenseManager.Instance?.waves.Count ?? 0);
        UpdateEnemiesRemaining(TowerDefenseManager.Instance?.enemiesRemaining ?? 0);
    }

    private void SetupVolumeSliders()
    {
        if (bgmVolumeSlider != null)
        {
            bgmVolumeSlider.onValueChanged.AddListener(OnBGMVolumeChanged);
        }

        if (sfxVolumeSlider != null)
        {
            sfxVolumeSlider.onValueChanged.AddListener(OnSFXVolumeChanged);
        }
    }

    public void UpdateMoney(int money)
    {
        if (moneyText != null)
        {
            moneyText.text = $"Money: ${money}";
        }
    }

    public void UpdateLives(int lives)
    {
        if (livesText != null)
        {
            livesText.text = $"Lives: {lives}";
        }
    }

    public void UpdateWave(int currentWave, int totalWaves)
    {
        if (waveText != null)
        {
            waveText.text = $"Wave: {currentWave + 1}/{totalWaves}";
        }
    }

    public void UpdateEnemiesRemaining(int remaining)
    {
        if (enemiesRemainingText != null)
        {
            enemiesRemainingText.text = $"Enemies: {remaining}";
        }
    }

    public void ShowBuildMenu(bool show)
    {
        isBuildMenuActive = show;
        if (buildMenu != null)
        {
            buildMenu.SetActive(show);
        }
    }

    public void ShowTowerInfo(Tower tower)
    {
        if (towerInfoPanel != null && towerInfoText != null)
        {
            towerInfoPanel.SetActive(true);
            
            string info = $"<b>{tower.towerName}</b>\n" +
                         $"Level: {tower.currentLevel}\n" +
                         $"Damage: {tower.damage}\n" +
                         $"Range: {tower.range:F1}\n" +
                         $"Fire Rate: {tower.fireRate:F1}/s\n" +
                         $"Cost: ${tower.upgradeCost}";
            
            towerInfoText.text = info;
            
            selectedTowerForUpgrade = tower;
        }
    }

    public void HideTowerInfo()
    {
        if (towerInfoPanel != null)
        {
            towerInfoPanel.SetActive(false);
        }
        selectedTowerForUpgrade = null;
    }

    public void ShowPauseMenu()
    {
        if (pausePanel != null)
        {
            pausePanel.SetActive(true);
        }
    }

    public void HidePauseMenu()
    {
        if (pausePanel != null)
        {
            pausePanel.SetActive(false);
        }
    }

    public void ShowGameOver()
    {
        if (gameOverPanel != null)
        {
            gameOverPanel.SetActive(true);
        }
        
        if (gamePanel != null)
        {
            gamePanel.SetActive(false);
        }
    }

    public void ShowGameWin()
    {
        if (gameWinPanel != null)
        {
            gameWinPanel.SetActive(true);
        }
        
        if (gamePanel != null)
        {
            gamePanel.SetActive(false);
        }
    }

    // 建造按钮事件
    public void OnCannonTowerButton()
    {
        if (TowerDefenseManager.Instance != null)
        {
            TowerDefenseManager.Instance.BuildTower(
                Resources.Load<Tower>("Prefabs/Towers/CannonTower"), 
                GetBuildPosition());
        }
    }

    public void OnArrowTowerButton()
    {
        if (TowerDefenseManager.Instance != null)
        {
            TowerDefenseManager.Instance.BuildTower(
                Resources.Load<Tower>("Prefabs/Towers/ArrowTower"), 
                GetBuildPosition());
        }
    }

    public void OnLaserTowerButton()
    {
        if (TowerDefenseManager.Instance != null)
        {
            TowerDefenseManager.Instance.BuildTower(
                Resources.Load<Tower>("Prefabs/Towers/LaserTower"), 
                GetBuildPosition());
        }
    }

    private Vector3 GetBuildPosition()
    {
        // 这里应该获取鼠标位置并转换为世界坐标
        // 简化处理，返回一个默认位置
        return Camera.main.ScreenToWorldPoint(Input.mousePosition + Vector3.forward * 10);
    }

    // 升级按钮事件
    public void OnUpgradeTowerButton()
    {
        if (selectedTowerForUpgrade != null && TowerDefenseManager.Instance != null)
        {
            TowerDefenseManager.Instance.UpgradeTower(selectedTowerForUpgrade);
            HideTowerInfo();
        }
    }

    // 按钮事件
    public void OnPauseButton()
    {
        Time.timeScale = 0f;
        ShowPauseMenu();
    }

    public void OnResumeButton()
    {
        Time.timeScale = 1f;
        HidePauseMenu();
    }

    public void OnRestartButton()
    {
        Time.timeScale = 1f;
        UnityEngine.SceneManagement.SceneManager.LoadScene(
            UnityEngine.SceneManagement.SceneManager.GetActiveScene().buildIndex);
    }

    public void OnMainMenuButton()
    {
        Time.timeScale = 1f;
        UnityEngine.SceneManagement.SceneManager.LoadScene(0); // 主菜单场景
    }

    public void OnQuitButton()
    {
        #if UNITY_EDITOR
        UnityEditor.EditorApplication.isPlaying = false;
        #else
        Application.Quit();
        #endif
    }

    // 音量控制事件
    private void OnBGMVolumeChanged(float volume)
    {
        if (TowerDefenseAudioManager.Instance != null)
        {
            TowerDefenseAudioManager.Instance.SetBGMVolume(volume);
        }
    }

    private void OnSFXVolumeChanged(float volume)
    {
        if (TowerDefenseAudioManager.Instance != null)
        {
            TowerDefenseAudioManager.Instance.SetSFXVolume(volume);
        }
    }

    // 更新建造进度（如果有的话）
    public void UpdateBuildProgress(float progress, string status)
    {
        if (buildProgressSlider != null)
        {
            buildProgressSlider.value = progress;
        }

        if (buildProgressText != null)
        {
            buildProgressText.text = status;
        }
    }

    void Update()
    {
        // ESC键暂停游戏
        if (Input.GetKeyDown(KeyCode.Escape))
        {
            if (pausePanel.activeSelf)
            {
                OnResumeButton();
            }
            else
            {
                OnPauseButton();
            }
        }
    }
}

// 塔防游戏音频管理器
public class TowerDefenseAudioManager : MonoBehaviour
{
    [Header("音频源")]
    public AudioSource bgmSource;
    public AudioSource sfxSource;

    [Header("音频剪辑")]
    public AudioClip[] bgmClips;
    public AudioClip[] sfxClips;

    private Dictionary<string, AudioClip> sfxDictionary = new Dictionary<string, AudioClip>();
    private Dictionary<string, AudioClip> bgmDictionary = new Dictionary<string, AudioClip>();

    public static TowerDefenseAudioManager Instance { get; private set; }

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
        InitializeAudio();
    }

    private void InitializeAudio()
    {
        // 创建音频源（如果未设置）
        if (bgmSource == null)
        {
            GameObject bgmGO = new GameObject("TD_BGM_AudioSource");
            bgmGO.transform.SetParent(transform);
            bgmSource = bgmGO.AddComponent<AudioSource>();
            bgmSource.playOnAwake = false;
            bgmSource.loop = true;
        }

        if (sfxSource == null)
        {
            GameObject sfxGO = new GameObject("TD_SFX_AudioSource");
            sfxGO.transform.SetParent(transform);
            sfxSource = sfxGO.AddComponent<AudioSource>();
            sfxSource.playOnAwake = false;
            sfxSource.loop = false;
        }

        // 建立音频字典
        foreach (AudioClip clip in sfxClips)
        {
            if (clip != null)
            {
                sfxDictionary[clip.name] = clip;
            }
        }

        foreach (AudioClip clip in bgmClips)
        {
            if (clip != null)
            {
                bgmDictionary[clip.name] = clip;
            }
        }
    }

    public void PlaySFX(string sfxName)
    {
        if (sfxDictionary.TryGetValue(sfxName, out AudioClip clip))
        {
            sfxSource.PlayOneShot(clip);
        }
        else
        {
            Debug.LogWarning($"SFX '{sfxName}' not found!");
        }
    }

    public void PlayBGM(string bgmName, bool loop = true)
    {
        if (bgmDictionary.TryGetValue(bgmName, out AudioClip clip))
        {
            bgmSource.clip = clip;
            bgmSource.loop = loop;
            bgmSource.Play();
        }
        else
        {
            Debug.LogWarning($"BGM '{bgmName}' not found!");
        }
    }

    public void SetBGMVolume(float volume)
    {
        bgmSource.volume = volume;
    }

    public void SetSFXVolume(float volume)
    {
        sfxSource.volume = volume;
    }

    public void StopBGM()
    {
        bgmSource.Stop();
    }

    public void StopSFX()
    {
        sfxSource.Stop();
    }
}

// 建造控制器
public class BuildController : MonoBehaviour
{
    [Header("建造设置")]
    public LayerMask buildableLayerMask;
    public LayerMask enemyLayerMask;
    public GameObject buildPreview;
    public Color validBuildColor = Color.green;
    public Color invalidBuildColor = Color.red;

    private bool isBuilding = false;
    private Tower towerToBuild;
    private Vector3 buildPosition;
    private bool canBuild = false;

    void Update()
    {
        if (isBuilding)
        {
            UpdateBuildPreview();
            HandleBuildInput();
        }
    }

    public void StartBuilding(Tower tower)
    {
        if (TowerDefenseManager.Instance.SpendMoney(tower.cost))
        {
            isBuilding = true;
            towerToBuild = tower;
            
            if (buildPreview != null)
            {
                buildPreview.SetActive(true);
            }
        }
    }

    private void UpdateBuildPreview()
    {
        // 获取鼠标位置
        Vector3 mousePos = Camera.main.ScreenToWorldPoint(Input.mousePosition + Vector3.forward * 10);
        
        // 将Y坐标设置为0（2D游戏）
        mousePos.z = 0;
        
        buildPosition = mousePos;
        
        if (buildPreview != null)
        {
            buildPreview.transform.position = buildPosition;
            
            // 检查是否可以建造
            canBuild = CanBuildAtPosition(buildPosition);
            
            // 设置预览颜色
            SpriteRenderer previewRenderer = buildPreview.GetComponent<SpriteRenderer>();
            if (previewRenderer != null)
            {
                previewRenderer.color = canBuild ? validBuildColor : invalidBuildColor;
            }
        }
    }

    private bool CanBuildAtPosition(Vector3 position)
    {
        // 检查是否有足够的金钱
        if (TowerDefenseManager.Instance.currentMoney < towerToBuild.cost)
        {
            return false;
        }

        // 检查是否有其他物体
        Collider2D[] colliders = Physics2D.OverlapCircleAll(position, 0.5f);
        
        foreach (Collider2D collider in colliders)
        {
            if (collider.CompareTag("Tower") || collider.CompareTag("Obstacle"))
            {
                return false; // 有塔或其他障碍物，不能建造
            }
        }

        // 检查是否在路径上
        PathManager pathManager = TowerDefenseManager.Instance.pathManager;
        if (pathManager != null)
        {
            foreach (Vector3 waypoint in pathManager.GetPath())
            {
                if (Vector3.Distance(position, waypoint) < 1f)
                {
                    return false; // 在路径上，不能建造
                }
            }
        }

        return true;
    }

    private void HandleBuildInput()
    {
        if (Input.GetMouseButtonDown(0) && canBuild)
        {
            BuildTower();
        }
        else if (Input.GetMouseButtonDown(1))
        {
            CancelBuilding();
        }
    }

    private void BuildTower()
    {
        if (towerToBuild != null && canBuild)
        {
            TowerDefenseManager.Instance.BuildTower(towerToBuild, buildPosition);
            EndBuilding();
        }
    }

    private void CancelBuilding()
    {
        // 退还金钱
        TowerDefenseManager.Instance.AddMoney(towerToBuild.cost);
        EndBuilding();
    }

    private void EndBuilding()
    {
        isBuilding = false;
        
        if (buildPreview != null)
        {
            buildPreview.SetActive(false);
        }
        
        towerToBuild = null;
    }

    // 可视化建造范围
    void OnDrawGizmos()
    {
        if (isBuilding && buildPreview != null)
        {
            Gizmos.color = canBuild ? Color.green : Color.red;
            Gizmos.DrawWireSphere(buildPosition, 0.5f);
        }
    }
}
```

---

## RPG游戏系统

### 项目概述

RPG（Role-Playing Game）游戏类型强调角色成长、故事叙述和探索。这类游戏通常包含复杂的角色系统、技能树、装备系统、任务系统等。

**核心功能:**
- 角色创建和成长系统
- 战斗系统（回合制或即时制）
- 技能和法术系统
- 装备和物品系统
- 任务和对话系统
- 世界探索

### 角色和战斗系统

```csharp
using UnityEngine;
using System.Collections;
using System.Collections.Generic;

// RPG游戏管理器
public class RPGGameManager : MonoBehaviour
{
    [Header("游戏设置")]
    public int maxLevel = 99;
    public float experienceMultiplier = 1.5f;
    public float goldMultiplier = 1.2f;

    [Header("玩家设置")]
    public PlayerCharacter player;
    public List<CharacterClass> characterClasses = new List<CharacterClass>();
    public List<Skill> allSkills = new List<Skill>();
    public List<Item> allItems = new List<Item>();
    public List<Quest> allQuests = new List<Quest>();

    [Header("游戏系统")]
    public RPGUIManager uiManager;
    public RPGBattleSystem battleSystem;
    public RPGInventorySystem inventorySystem;
    public RPGQuestSystem questSystem;

    public static RPGGameManager Instance { get; private set; }

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
        InitializeGame();
    }

    private void InitializeGame()
    {
        // 初始化玩家
        if (player == null)
        {
            player = new PlayerCharacter();
            player.Initialize("Hero", CharacterClassType.Warrior);
        }

        // 初始化各个系统
        InitializeSystems();
    }

    private void InitializeSystems()
    {
        if (battleSystem != null)
        {
            battleSystem.Initialize();
        }

        if (inventorySystem != null)
        {
            inventorySystem.Initialize();
        }

        if (questSystem != null)
        {
            questSystem.Initialize();
        }

        if (uiManager != null)
        {
            uiManager.Initialize();
        }
    }

    // 计算升级所需经验
    public int GetExperienceForLevel(int level)
    {
        // 使用公式：Exp = Base * (Multiplier ^ Level)
        int baseExp = 100;
        return Mathf.RoundToInt(baseExp * Mathf.Pow(experienceMultiplier, level - 1));
    }

    // 添加经验值
    public void AddExperience(int exp)
    {
        if (player != null)
        {
            int expBefore = player.experience;
            player.AddExperience(exp);

            // 检查是否升级
            if (player.level > expBefore / GetExperienceForLevel(expBefore))
            {
                OnLevelUp(player.level);
            }

            // 更新UI
            if (uiManager != null)
            {
                uiManager.UpdateExperience(player.experience, GetExperienceForLevel(player.level));
                uiManager.UpdateLevel(player.level);
            }
        }
    }

    // 等级提升事件
    private void OnLevelUp(int newLevel)
    {
        if (uiManager != null)
        {
            uiManager.ShowLevelUp(newLevel);
        }

        // 播放升级音效
        if (RPGAudioManager.Instance != null)
        {
            RPGAudioManager.Instance.PlaySFX("LevelUp");
        }

        // 给予属性点
        if (player != null)
        {
            player.attributePoints += 5; // 每级给予5个属性点
            player.skillPoints += 1; // 每级给予1个技能点
        }
    }

    // 添加金币
    public void AddGold(int amount)
    {
        if (player != null)
        {
            player.AddGold(amount);
            
            if (uiManager != null)
            {
                uiManager.UpdateGold(player.gold);
            }
        }
    }

    // 获取角色职业数据
    public CharacterClass GetCharacterClass(CharacterClassType classType)
    {
        return characterClasses.Find(c => c.classType == classType);
    }

    // 获取技能数据
    public Skill GetSkill(string skillName)
    {
        return allSkills.Find(s => s.skillName == skillName);
    }

    // 获取物品数据
    public Item GetItem(string itemName)
    {
        return allItems.Find(i => i.itemName == itemName);
    }

    // 获取任务数据
    public Quest GetQuest(string questName)
    {
        return allQuests.Find(q => q.questName == questName);
    }
}

// 角色类型
public enum CharacterClassType
{
    Warrior,
    Mage,
    Rogue,
    Cleric,
    Ranger,
    Paladin
}

// 角色职业数据
[System.Serializable]
public class CharacterClass
{
    public CharacterClassType classType;
    public string className;
    public string description;
    public float healthMultiplier = 1f;
    public float manaMultiplier = 1f;
    public float staminaMultiplier = 1f;
    public float strengthGrowth = 1f;
    public float dexterityGrowth = 1f;
    public float intelligenceGrowth = 1f;
    public float constitutionGrowth = 1f;
    public float luckGrowth = 1f;
    public List<string> startingSkills = new List<string>();
    public List<string> startingItems = new List<string>();
    public Color classColor = Color.white;
}

// 技能类型
public enum SkillType
{
    Active,
    Passive,
    Ultimate
}

// 技能目标类型
public enum SkillTargetType
{
    Self,
    Enemy,
    Ally,
    Area,
    Projectile
}

// 技能数据
[System.Serializable]
public class Skill
{
    public string skillName;
    public string description;
    public SkillType skillType;
    public SkillTargetType targetType;
    public int manaCost = 10;
    public float cooldown = 1f;
    public int requiredLevel = 1;
    public int damage = 0;
    public float range = 5f;
    public float castTime = 0f;
    public float duration = 0f;
    public int maxLevel = 1;
    public List<SkillUpgrade> upgrades = new List<SkillUpgrade>();
    public string animationName;
    public AudioClip castSound;
    public GameObject effectPrefab;
}

[System.Serializable]
public class SkillUpgrade
{
    public int level;
    public int damageIncrease;
    public float rangeIncrease;
    public float cooldownReduction;
    public string description;
}

// 物品类型
public enum ItemType
{
    Weapon,
    Armor,
    Consumable,
    QuestItem,
    Material,
    Accessory
}

// 物品稀有度
public enum ItemRarity
{
    Common,
    Uncommon,
    Rare,
    Epic,
    Legendary,
    Artifact
}

// 物品数据
[System.Serializable]
public class Item
{
    public string itemName;
    public string description;
    public ItemType itemType;
    public ItemRarity rarity;
    public int buyPrice = 10;
    public int sellPrice = 5;
    public int requiredLevel = 1;
    public int stackLimit = 1;
    public bool isConsumable = false;
    public bool isSoulbound = false;
    public bool isUnique = false;
    
    // 装备属性
    public int strength = 0;
    public int dexterity = 0;
    public int intelligence = 0;
    public int constitution = 0;
    public int luck = 0;
    public int healthBonus = 0;
    public int manaBonus = 0;
    public int armorBonus = 0;
    public int damageBonus = 0;
    public int magicPower = 0;
    public int criticalChance = 0;
    public int attackSpeed = 0;
    public int movementSpeed = 0;
    
    // 消耗品属性
    public int healthRestore = 0;
    public int manaRestore = 0;
    public float restorePercentage = 0f;
    public float duration = 0f;
    public int effectValue = 0;
    public string effectType;
    
    public Sprite icon;
    public GameObject prefab;
}

// 任务类型
public enum QuestType
{
    Fetch,
    Kill,
    Escort,
    Explore,
    Deliver,
    Defend
}

// 任务状态
public enum QuestStatus
{
    NotStarted,
    InProgress,
    Completed,
    Failed,
    Rewarded
}

// 任务数据
[System.Serializable]
public class Quest
{
    public string questName;
    public string description;
    public string objective;
    public QuestType questType;
    public int requiredLevel = 1;
    public int experienceReward = 100;
    public int goldReward = 50;
    public List<ItemReward> itemRewards = new List<ItemReward>();
    public List<QuestObjective> objectives = new List<QuestObjective>();
    public bool isRepeatable = false;
    public bool isMainQuest = false;
    public string questGiver;
    public string nextQuest;
    public float timeLimit = 0f; // 0表示无时间限制
}

[System.Serializable]
public class ItemReward
{
    public string itemName;
    public int quantity = 1;
    public int chance = 100; // 出现几率（0-100）
}

[System.Serializable]
public class QuestObjective
{
    public string description;
    public int targetCount = 1;
    public int currentCount = 0;
    public string targetName; // 敌人名称、物品名称等
    public bool isCompleted = false;
}

// 玩家角色类
public class PlayerCharacter
{
    // 基本信息
    public string characterName;
    public CharacterClassType characterClassType;
    public CharacterClass characterClass;

    // 等级和经验
    public int level = 1;
    public int experience = 0;
    public int skillPoints = 0;
    public int attributePoints = 0;

    // 属性
    public int strength = 10;
    public int dexterity = 10;
    public int intelligence = 10;
    public int constitution = 10;
    public int luck = 10;

    // 生命值和法力值
    public int maxHealth = 100;
    public int currentHealth = 100;
    public int maxMana = 50;
    public int currentMana = 50;
    public int maxStamina = 100;
    public int currentStamina = 100;

    // 战斗属性
    public int armor = 5;
    public int magicResist = 5;
    public int attackPower = 10;
    public int magicPower = 5;
    public int criticalChance = 5;
    public int attackSpeed = 100; // 百分比
    public int movementSpeed = 100; // 百分比

    // 经济
    public int gold = 100;

    // 装备
    public Dictionary<EquipmentSlot, Item> equipment = new Dictionary<EquipmentSlot, Item>();

    // 技能
    public List<Skill> knownSkills = new List<Skill>();
    public List<Skill> activeSkills = new List<Skill>();

    // 物品
    public List<Item> inventory = new List<Item>();
    public int inventorySize = 30;

    // 任务
    public List<Quest> activeQuests = new List<Quest>();
    public List<Quest> completedQuests = new List<Quest>();

    // 状态
    public bool isAlive = true;
    public bool isCasting = false;
    public bool isStunned = false;
    public bool isSilenced = false;

    public PlayerCharacter()
    {
        // 初始化装备槽
        foreach (EquipmentSlot slot in System.Enum.GetValues(typeof(EquipmentSlot)))
        {
            equipment[slot] = null;
        }
    }

    public void Initialize(string name, CharacterClassType classType)
    {
        characterName = name;
        characterClassType = classType;
        characterClass = RPGGameManager.Instance.GetCharacterClass(classType);

        // 根据职业设置基础属性
        if (characterClass != null)
        {
            strength = Mathf.RoundToInt(10 * characterClass.strengthGrowth);
            dexterity = Mathf.RoundToInt(10 * characterClass.dexterityGrowth);
            intelligence = Mathf.RoundToInt(10 * characterClass.intelligenceGrowth);
            constitution = Mathf.RoundToInt(10 * characterClass.constitutionGrowth);
            luck = Mathf.RoundToInt(10 * characterClass.luckGrowth);

            maxHealth = Mathf.RoundToInt(100 * characterClass.healthMultiplier);
            currentHealth = maxHealth;
            maxMana = Mathf.RoundToInt(50 * characterClass.manaMultiplier);
            currentMana = maxMana;
            maxStamina = Mathf.RoundToInt(100 * characterClass.staminaMultiplier);
            currentStamina = maxStamina;

            // 添加职业技能
            foreach (string skillName in characterClass.startingSkills)
            {
                Skill skill = RPGGameManager.Instance.GetSkill(skillName);
                if (skill != null)
                {
                    knownSkills.Add(skill);
                }
            }

            // 添加初始物品
            foreach (string itemName in characterClass.startingItems)
            {
                Item item = RPGGameManager.Instance.GetItem(itemName);
                if (item != null)
                {
                    AddItem(item, 1);
                }
            }
        }
    }

    // 添加经验值
    public void AddExperience(int exp)
    {
        experience += exp;

        // 检查是否升级
        int expForNextLevel = RPGGameManager.Instance.GetExperienceForLevel(level + 1);
        while (experience >= expForNextLevel && level < RPGGameManager.Instance.maxLevel)
        {
            level++;
            experience -= expForNextLevel;
            skillPoints++;
            attributePoints += 5;

            // 升级属性
            maxHealth = Mathf.RoundToInt(maxHealth * 1.1f);
            currentHealth = maxHealth;
            maxMana = Mathf.RoundToInt(maxMana * 1.1f);
            currentMana = maxMana;
            maxStamina = Mathf.RoundToInt(maxStamina * 1.1f);
            currentStamina = maxStamina;

            expForNextLevel = RPGGameManager.Instance.GetExperienceForLevel(level + 1);
        }
    }

    // 添加金币
    public void AddGold(int amount)
    {
        gold += amount;
    }

    // 添加物品到背包
    public bool AddItem(Item item, int quantity = 1)
    {
        if (inventory.Count >= inventorySize)
        {
            return false; // 背包已满
        }

        // 检查是否已有相同物品且可堆叠
        Item existingItem = inventory.Find(i => i.itemName == item.itemName && i.stackLimit > 1);
        if (existingItem != null && existingItem.stackLimit > existingItem.quantity)
        {
            int newQuantity = Mathf.Min(existingItem.quantity + quantity, existingItem.stackLimit);
            existingItem.quantity = newQuantity;
            return true;
        }
        else if (inventory.Count < inventorySize)
        {
            Item newItem = CreateItemCopy(item);
            newItem.quantity = quantity;
            inventory.Add(newItem);
            return true;
        }

        return false; // 无法添加
    }

    // 移除物品
    public bool RemoveItem(string itemName, int quantity = 1)
    {
        Item item = inventory.Find(i => i.itemName == itemName);
        if (item != null)
        {
            if (item.quantity > quantity)
            {
                item.quantity -= quantity;
            }
            else
            {
                inventory.Remove(item);
            }
            return true;
        }
        return false;
    }

    // 创建物品副本
    private Item CreateItemCopy(Item original)
    {
        Item copy = new Item();
        System.Reflection.FieldInfo[] fields = typeof(Item).GetFields();
        foreach (System.Reflection.FieldInfo field in fields)
        {
            field.SetValue(copy, field.GetValue(original));
        }
        return copy;
    }

    // 装备物品
    public bool EquipItem(Item item)
    {
        if (item.itemType != ItemType.Weapon && 
            item.itemType != ItemType.Armor && 
            item.itemType != ItemType.Accessory)
        {
            return false; // 只能装备武器、护甲和饰品
        }

        EquipmentSlot slot = GetEquipmentSlot(item);
        if (slot == EquipmentSlot.None)
        {
            return false;
        }

        // 如果该槽位已有装备，先卸下
        if (equipment[slot] != null)
        {
            UnequipItem(slot);
        }

        // 装备新物品
        equipment[slot] = item;

        // 应用属性加成
        ApplyItemStats(item, true);

        return true;
    }

    // 卸下物品
    public bool UnequipItem(EquipmentSlot slot)
    {
        if (equipment.ContainsKey(slot) && equipment[slot] != null)
        {
            Item item = equipment[slot];
            equipment[slot] = null;

            // 移除属性加成
            ApplyItemStats(item, false);

            // 将物品放回背包
            AddItem(item, 1);

            return true;
        }
        return false;
    }

    // 获取装备槽
    private EquipmentSlot GetEquipmentSlot(Item item)
    {
        switch (item.itemType)
        {
            case ItemType.Weapon:
                return EquipmentSlot.Weapon;
            case ItemType.Armor:
                if (item.itemName.Contains("Helmet") || item.itemName.Contains("Head"))
                    return EquipmentSlot.Head;
                else if (item.itemName.Contains("Chest") || item.itemName.Contains("Armor"))
                    return EquipmentSlot.Chest;
                else if (item.itemName.Contains("Legs") || item.itemName.Contains("Pants"))
                    return EquipmentSlot.Legs;
                else if (item.itemName.Contains("Boots") || item.itemName.Contains("Shoes"))
                    return EquipmentSlot.Feet;
                else if (item.itemName.Contains("Gloves"))
                    return EquipmentSlot.Hands;
                break;
            case ItemType.Accessory:
                if (equipment[EquipmentSlot.Accessory1] == null)
                    return EquipmentSlot.Accessory1;
                else if (equipment[EquipmentSlot.Accessory2] == null)
                    return EquipmentSlot.Accessory2;
                break;
        }

        return EquipmentSlot.None;
    }

    // 应用物品属性
    private void ApplyItemStats(Item item, bool isEquipping)
    {
        int multiplier = isEquipping ? 1 : -1;

        strength += item.strength * multiplier;
        dexterity += item.dexterity * multiplier;
        intelligence += item.intelligence * multiplier;
        constitution += item.constitution * multiplier;
        luck += item.luck * multiplier;

        maxHealth += item.healthBonus * multiplier;
        maxMana += item.manaBonus * multiplier;
        armor += item.armorBonus * multiplier;
        attackPower += item.damageBonus * multiplier;
        magicPower += item.magicPower * multiplier;
        criticalChance += item.criticalChance * multiplier;
        attackSpeed += item.attackSpeed * multiplier;
        movementSpeed += item.movementSpeed * multiplier;
    }

    // 学习技能
    public bool LearnSkill(string skillName)
    {
        if (skillPoints <= 0)
        {
            return false;
        }

        Skill skill = RPGGameManager.Instance.GetSkill(skillName);
        if (skill != null && skill.requiredLevel <= level)
        {
            if (!knownSkills.Contains(skill))
            {
                knownSkills.Add(skill);
                skillPoints--;
                return true;
            }
        }

        return false;
    }

    // 使用技能
    public bool UseSkill(string skillName, Character target = null)
    {
        if (isCasting || isStunned || isSilenced)
        {
            return false;
        }

        Skill skill = knownSkills.Find(s => s.skillName == skillName);
        if (skill == null || currentMana < skill.manaCost)
        {
            return false;
        }

        // 检查冷却
        if (activeSkills.Contains(skill))
        {
            return false; // 技能在冷却中
        }

        // 扣除法力值
        currentMana -= skill.manaCost;

        // 开始施法
        if (skill.castTime > 0)
        {
            isCasting = true;
            // 这里可以添加施法条UI
        }

        // 立即生效的技能
        if (skill.castTime == 0)
        {
            ExecuteSkill(skill, target);
        }

        // 添加到激活技能列表（用于冷却）
        activeSkills.Add(skill);

        // 开始冷却计时
        StartCoroutine(EndSkillCooldown(skill));

        return true;
    }

    // 执行技能效果
    private void ExecuteSkill(Skill skill, Character target)
    {
        switch (skill.skillType)
        {
            case SkillType.Active:
                // 对目标造成伤害或治疗
                if (target != null)
                {
                    if (skill.damage > 0)
                    {
                        int damage = Mathf.RoundToInt(skill.damage * (1 + magicPower / 100f));
                        target.TakeDamage(damage);
                    }
                }
                break;
            case SkillType.Passive:
                // 被动技能效果在属性计算时应用
                break;
            case SkillType.Ultimate:
                // 终极技能特殊效果
                break;
        }

        // 播放技能效果
        if (skill.effectPrefab != null)
        {
            // 实例化技能效果
        }

        // 播放音效
        if (skill.castSound != null && RPGAudioManager.Instance != null)
        {
            RPGAudioManager.Instance.PlaySFX(skill.castSound.name);
        }
    }

    // 技能冷却协程
    private IEnumerator EndSkillCooldown(Skill skill)
    {
        yield return new WaitForSeconds(skill.cooldown);
        activeSkills.Remove(skill);
        isCasting = false;
    }

    // 受到伤害
    public void TakeDamage(int damage)
    {
        if (!isAlive) return;

        // 计算护甲减免
        int armorReduction = Mathf.RoundToInt(damage * armor / (armor + 100f));
        int finalDamage = damage - armorReduction;

        currentHealth -= finalDamage;

        if (currentHealth <= 0)
        {
            Die();
        }
    }

    // 治疗
    public void Heal(int amount)
    {
        currentHealth = Mathf.Min(maxHealth, currentHealth + amount);
    }

    // 恢复法力
    public void RestoreMana(int amount)
    {
        currentMana = Mathf.Min(maxMana, currentMana + amount);
    }

    // 死亡
    private void Die()
    {
        isAlive = false;

        // 可以添加死亡效果
        if (RPGAudioManager.Instance != null)
        {
            RPGAudioManager.Instance.PlaySFX("PlayerDie");
        }

        // 可以添加复活逻辑
    }

    // 使用物品
    public bool UseItem(string itemName)
    {
        Item item = inventory.Find(i => i.itemName == itemName && i.isConsumable);
        if (item != null)
        {
            // 应用物品效果
            if (item.healthRestore > 0)
            {
                Heal(item.healthRestore);
            }

            if (item.manaRestore > 0)
            {
                RestoreMana(item.manaRestore);
            }

            // 按比例恢复
            if (item.restorePercentage > 0)
            {
                Heal(Mathf.RoundToInt(maxHealth * item.restorePercentage / 100f));
                RestoreMana(Mathf.RoundToInt(maxMana * item.restorePercentage / 100f));
            }

            // 移除使用过的物品
            RemoveItem(itemName, 1);

            return true;
        }

        return false;
    }

    // 获取属性总和（包括装备加成）
    public int GetTotalStrength() { return strength + GetEquipmentStat(e => e.strength); }
    public int GetTotalDexterity() { return dexterity + GetEquipmentStat(e => e.dexterity); }
    public int GetTotalIntelligence() { return intelligence + GetEquipmentStat(e => e.intelligence); }
    public int GetTotalConstitution() { return constitution + GetEquipmentStat(e => e.constitution); }
    public int GetTotalLuck() { return luck + GetEquipmentStat(e => e.luck); }

    // 获取装备提供的特定属性总和
    private int GetEquipmentStat(System.Func<Item, int> statSelector)
    {
        int total = 0;
        foreach (Item item in equipment.Values)
        {
            if (item != null)
            {
                total += statSelector(item);
            }
        }
        return total;
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

// 角色基类（用于玩家和敌人）
public abstract class Character : MonoBehaviour
{
    public string characterName;
    public int level = 1;
    public int maxHealth = 100;
    public int currentHealth;
    public int maxMana = 50;
    public int currentMana;
    public int attackPower = 10;
    public int magicPower = 5;
    public int armor = 5;
    public int magicResist = 5;
    public int criticalChance = 5;
    public float movementSpeed = 5f;

    public System.Action<Character> OnCharacterDeath;

    protected virtual void Start()
    {
        currentHealth = maxHealth;
        currentMana = maxMana;
    }

    // 受到伤害
    public virtual void TakeDamage(int damage)
    {
        // 计算护甲减免
        int armorReduction = Mathf.RoundToInt(damage * armor / (armor + 100f));
        int finalDamage = damage - armorReduction;

        currentHealth -= finalDamage;

        if (currentHealth <= 0)
        {
            Die();
        }
    }

    // 治疗
    public virtual void Heal(int amount)
    {
        currentHealth = Mathf.Min(maxHealth, currentHealth + amount);
    }

    // 恢复法力
    public virtual void RestoreMana(int amount)
    {
        currentMana = Mathf.Min(maxMana, currentMana + amount);
    }

    // 死亡
    protected virtual void Die()
    {
        if (OnCharacterDeath != null)
        {
            OnCharacterDeath(this);
        }

        // 给予经验值和金币
        PlayerCharacter player = FindObjectOfType<PlayerCharacter>();
        if (player != null)
        {
            int expReward = Mathf.RoundToInt(50 * (level / (float)player.level));
            int goldReward = Mathf.RoundToInt(20 * (level / (float)player.level));
            
            RPGGameManager.Instance.AddExperience(expReward);
            RPGGameManager.Instance.AddGold(goldReward);
        }

        // 销毁角色
        Destroy(gameObject);
    }

    // 获取生命值百分比
    public float GetHealthPercentage()
    {
        return (float)currentHealth / maxHealth;
    }

    // 获取法力值百分比
    public float GetManaPercentage()
    {
        return (float)currentMana / maxMana;
    }
}
```

### 战斗系统

```csharp
using UnityEngine;
using System.Collections;
using System.Collections.Generic;

// RPG战斗系统
public class RPGBattleSystem : MonoBehaviour
{
    [Header("战斗设置")]
    public BattleType battleType = BattleType.RealTime;
    public float turnDuration = 30f; // 回合制战斗的回合时长
    public float actionDelay = 0.5f; // 行动延迟

    [Header("战斗队伍")]
    public List<Character> playerTeam = new List<Character>();
    public List<Character> enemyTeam = new List<Character>();

    [Header("战斗状态")]
    public bool isBattleActive = false;
    public bool isPlayerTurn = true;
    public Character currentActor;
    public List<Character> battleQueue = new List<Character>();

    [Header("UI引用")]
    public RPGBattleUI battleUI;

    private Queue<BattleAction> actionQueue = new Queue<BattleAction>();
    private float turnTimer = 0f;
    private bool isProcessingAction = false;

    public void Initialize()
    {
        // 初始化战斗系统
    }

    // 开始战斗
    public void StartBattle(List<Character> playerCharacters, List<Character> enemyCharacters)
    {
        playerTeam = playerCharacters;
        enemyTeam = enemyCharacters;
        isBattleActive = true;
        isPlayerTurn = true;

        // 初始化战斗队列（根据速度排序）
        InitializeBattleQueue();

        if (battleUI != null)
        {
            battleUI.ShowBattleUI(true);
            UpdateBattleUI();
        }

        if (battleType == BattleType.TurnBased)
        {
            StartTurn();
        }
    }

    // 初始化战斗队列
    private void InitializeBattleQueue()
    {
        battleQueue.Clear();
        
        // 合并所有角色
        List<Character> allCharacters = new List<Character>();
        allCharacters.AddRange(playerTeam);
        allCharacters.AddRange(enemyTeam);

        // 根据速度排序（速度高的先行动）
        allCharacters.Sort((a, b) => b.movementSpeed.CompareTo(a.movementSpeed));
        
        battleQueue.AddRange(allCharacters);
    }

    // 开始回合
    private void StartTurn()
    {
        if (battleQueue.Count == 0)
        {
            EndBattle();
            return;
        }

        currentActor = battleQueue[0];
        battleQueue.RemoveAt(0);
        battleQueue.Add(currentActor); // 将行动者移到队尾

        turnTimer = turnDuration;

        if (currentActor is PlayerCharacter)
        {
            isPlayerTurn = true;
            if (battleUI != null)
            {
                battleUI.ShowActionSelection(currentActor);
            }
        }
        else
        {
            isPlayerTurn = false;
            StartCoroutine(EnemyTurn());
        }

        UpdateBattleUI();
    }

    // 敌人回合
    private IEnumerator EnemyTurn()
    {
        yield return new WaitForSeconds(actionDelay);

        // AI选择行动
        BattleAction action = SelectEnemyAction(currentActor);

        if (action != null)
        {
            ProcessAction(action);
        }
        else
        {
            EndTurn();
        }
    }

    // 选择敌人行动
    private BattleAction SelectEnemyAction(Character enemy)
    {
        // 简单的AI：随机选择目标并使用基础攻击
        List<Character> targets = isPlayerTurn ? new List<Character>(playerTeam) : new List<Character>(enemyTeam);
        
        // 移除已死亡的目标
        targets.RemoveAll(c => c.currentHealth <= 0);

        if (targets.Count > 0)
        {
            Character target = targets[Random.Range(0, targets.Count)];
            
            return new BattleAction
            {
                actor = enemy,
                actionType = BattleActionType.Attack,
                target = target,
                skill = null
            };
        }

        return null;
    }

    // 玩家选择行动
    public void PlayerSelectAction(BattleAction action)
    {
        if (isPlayerTurn && currentActor == action.actor)
        {
            actionQueue.Enqueue(action);
            
            if (battleUI != null)
            {
                battleUI.HideActionSelection();
            }

            // 立即处理行动或等待所有玩家行动
            if (battleType == BattleType.TurnBased)
            {
                ProcessAction(action);
            }
        }
    }

    // 处理行动
    private void ProcessAction(BattleAction action)
    {
        if (isProcessingAction) return;

        isProcessingAction = true;
        StartCoroutine(ExecuteAction(action));
    }

    // 执行行动协程
    private IEnumerator ExecuteAction(BattleAction action)
    {
        yield return new WaitForSeconds(actionDelay);

        switch (action.actionType)
        {
            case BattleActionType.Attack:
                ExecuteAttack(action);
                break;
            case BattleActionType.Skill:
                ExecuteSkill(action);
                break;
            case BattleActionType.Item:
                ExecuteItem(action);
                break;
            case BattleActionType.Defend:
                ExecuteDefend(action);
                break;
        }

        yield return new WaitForSeconds(actionDelay);

        isProcessingAction = false;

        if (battleType == BattleType.TurnBased)
        {
            // 检查战斗是否结束
            if (!CheckBattleEnd())
            {
                EndTurn();
            }
        }
        else
        {
            // 即时战斗继续
            UpdateBattleUI();
        }
    }

    // 执行攻击
    private void ExecuteAttack(BattleAction action)
    {
        if (action.target != null)
        {
            int damage = Mathf.RoundToInt(action.actor.attackPower * (1f + Random.Range(-0.1f, 0.1f)));
            
            // 检查暴击
            if (Random.Range(0, 100) < action.actor.criticalChance)
            {
                damage *= 2;
                if (battleUI != null)
                {
                    battleUI.ShowCriticalHit(action.target);
                }
            }

            action.target.TakeDamage(damage);

            if (battleUI != null)
            {
                battleUI.ShowDamage(action.target, damage);
            }

            // 播放攻击音效
            if (RPGAudioManager.Instance != null)
            {
                RPGAudioManager.Instance.PlaySFX("Attack");
            }
        }
    }

    // 执行技能
    private void ExecuteSkill(BattleAction action)
    {
        if (action.skill != null && action.target != null)
        {
            // 扣除法力值
            if (action.actor is PlayerCharacter player)
            {
                player.currentMana -= action.skill.manaCost;
            }

            // 计算技能伤害
            int damage = Mathf.RoundToInt(action.skill.damage * (1f + action.actor.magicPower / 100f));
            action.target.TakeDamage(damage);

            if (battleUI != null)
            {
                battleUI.ShowSkillEffect(action.skill, action.target, damage);
            }

            // 播放技能音效
            if (action.skill.castSound != null && RPGAudioManager.Instance != null)
            {
                RPGAudioManager.Instance.PlaySFX(action.skill.castSound.name);
            }
        }
    }

    // 使用物品
    private void ExecuteItem(BattleAction action)
    {
        if (action.item != null && action.target != null)
        {
            // 应用物品效果到目标
            if (action.item.healthRestore > 0)
            {
                action.target.Heal(action.item.healthRestore);
                if (battleUI != null)
                {
                    battleUI.ShowHealEffect(action.target, action.item.healthRestore);
                }
            }

            // 从玩家背包中移除物品
            if (action.actor is PlayerCharacter player)
            {
                player.RemoveItem(action.item.itemName, 1);
            }
        }
    }

    // 防御
    private void ExecuteDefend(BattleAction action)
    {
        // 防御状态，减少受到的伤害
        // 这里可以设置一个防御标志或临时增加护甲
        if (battleUI != null)
        {
            battleUI.ShowDefendEffect(action.actor);
        }
    }

    // 结束回合
    private void EndTurn()
    {
        if (battleType == BattleType.TurnBased)
        {
            StartTurn();
        }
    }

    // 检查战斗是否结束
    private bool CheckBattleEnd()
    {
        bool playerTeamDefeated = true;
        bool enemyTeamDefeated = true;

        foreach (Character character in playerTeam)
        {
            if (character.currentHealth > 0)
            {
                playerTeamDefeated = false;
                break;
            }
        }

        foreach (Character character in enemyTeam)
        {
            if (character.currentHealth > 0)
            {
                enemyTeamDefeated = false;
                break;
            }
        }

        if (playerTeamDefeated)
        {
            EndBattle(false); // 玩家失败
            return true;
        }
        else if (enemyTeamDefeated)
        {
            EndBattle(true); // 玩家胜利
            return true;
        }

        return false;
    }

    // 结束战斗
    private void EndBattle(bool playerVictory = false)
    {
        isBattleActive = false;

        if (battleUI != null)
        {
            battleUI.ShowBattleUI(false);
            battleUI.ShowBattleResult(playerVictory);
        }

        // 给予战斗奖励
        if (playerVictory)
        {
            // 计算经验值和金币奖励
            int totalExp = 0;
            int totalGold = 0;

            foreach (Character enemy in enemyTeam)
            {
                totalExp += Mathf.RoundToInt(50 * enemy.level);
                totalGold += Mathf.RoundToInt(20 * enemy.level);
            }

            RPGGameManager.Instance.AddExperience(totalExp);
            RPGGameManager.Instance.AddGold(totalGold);
        }

        // 重置战斗状态
        playerTeam.Clear();
        enemyTeam.Clear();
        battleQueue.Clear();
    }

    // 更新战斗UI
    private void UpdateBattleUI()
    {
        if (battleUI != null)
        {
            battleUI.UpdateCharacterStatus(playerTeam, enemyTeam);
            battleUI.UpdateTurnIndicator(currentActor, isPlayerTurn);
        }
    }

    void Update()
    {
        if (isBattleActive && battleType == TurnBased)
        {
            turnTimer -= Time.deltaTime;
            
            if (turnTimer <= 0 && isPlayerTurn)
            {
                // 玩家超时，自动执行防御行动
                BattleAction timeoutAction = new BattleAction
                {
                    actor = currentActor,
                    actionType = BattleActionType.Defend,
                    target = currentActor
                };
                
                PlayerSelectAction(timeoutAction);
            }
        }
    }
}

// 战斗类型
public enum BattleType
{
    TurnBased,
    RealTime
}

// 战斗行动类型
public enum BattleActionType
{
    Attack,
    Skill,
    Item,
    Defend,
    Flee
}

// 战斗行动类
public class BattleAction
{
    public Character actor;
    public BattleActionType actionType;
    public Character target;
    public Skill skill;
    public Item item;
    public string additionalData; // 额外数据，如逃跑成功率等
}

// 战斗UI管理器
public class RPGBattleUI : MonoBehaviour
{
    [Header("战斗UI元素")]
    public GameObject battlePanel;
    public GameObject actionSelectionPanel;
    public GameObject battleResultPanel;
    public Text battleResultText;
    public Slider[] playerHealthBars;
    public Slider[] enemyHealthBars;
    public Text[] playerNames;
    public Text[] enemyNames;
    public GameObject turnIndicator;
    public Text turnText;

    [Header("行动按钮")]
    public Button attackButton;
    public Button skillButton;
    public Button itemButton;
    public Button defendButton;

    private List<Character> playerTeam;
    private List<Character> enemyTeam;

    public void ShowBattleUI(bool show)
    {
        if (battlePanel != null)
        {
            battlePanel.SetActive(show);
        }
    }

    public void ShowActionSelection(Character actor)
    {
        if (actionSelectionPanel != null)
        {
            actionSelectionPanel.SetActive(true);
        }
    }

    public void HideActionSelection()
    {
        if (actionSelectionPanel != null)
        {
            actionSelectionPanel.SetActive(false);
        }
    }

    public void UpdateCharacterStatus(List<Character> players, List<Character> enemies)
    {
        playerTeam = players;
        enemyTeam = enemies;

        // 更新玩家状态条
        for (int i = 0; i < playerHealthBars.Length && i < players.Count; i++)
        {
            if (playerHealthBars[i] != null)
            {
                playerHealthBars[i].value = players[i].GetHealthPercentage();
            }

            if (playerNames[i] != null)
            {
                playerNames[i].text = $"{players[i].characterName}\nHP: {players[i].currentHealth}/{players[i].maxHealth}";
            }
        }

        // 更新敌人状态条
        for (int i = 0; i < enemyHealthBars.Length && i < enemies.Count; i++)
        {
            if (enemyHealthBars[i] != null)
            {
                enemyHealthBars[i].value = enemies[i].GetHealthPercentage();
            }

            if (enemyNames[i] != null)
            {
                enemyNames[i].text = $"{enemies[i].characterName}\nHP: {enemies[i].currentHealth}/{enemies[i].maxHealth}";
            }
        }
    }

    public void UpdateTurnIndicator(Character currentActor, bool isPlayerTurn)
    {
        if (turnIndicator != null)
        {
            turnIndicator.SetActive(true);
        }

        if (turnText != null)
        {
            turnText.text = isPlayerTurn ? 
                $"Player Turn: {currentActor.characterName}" : 
                $"Enemy Turn: {currentActor.characterName}";
        }
    }

    public void ShowDamage(Character target, int damage)
    {
        // 显示伤害数字
        StartCoroutine(ShowFloatingText(target, $"-{damage}", Color.red));
    }

    public void ShowHealEffect(Character target, int amount)
    {
        // 显示治疗效果
        StartCoroutine(ShowFloatingText(target, $"+{amount}", Color.green));
    }

    public void ShowCriticalHit(Character target)
    {
        // 显示暴击效果
        StartCoroutine(ShowFloatingText(target, "CRITICAL!", Color.yellow, 1.5f));
    }

    public void ShowSkillEffect(Skill skill, Character target, int damage)
    {
        // 显示技能效果
        StartCoroutine(ShowFloatingText(target, $"{skill.skillName}\n-{damage}", Color.blue));
    }

    public void ShowDefendEffect(Character character)
    {
        // 显示防御效果
        StartCoroutine(ShowFloatingText(character, "DEFENDING", Color.gray, 0.8f));
    }

    public void ShowBattleResult(bool playerVictory)
    {
        if (battleResultPanel != null)
        {
            battleResultPanel.SetActive(true);
        }

        if (battleResultText != null)
        {
            battleResultText.text = playerVictory ? "Victory!" : "Defeat!";
        }
    }

    private IEnumerator ShowFloatingText(Character target, string text, Color color, float scale = 1f)
    {
        // 这里需要创建浮动文字效果
        // 由于没有具体的UI元素，这里只是示例
        yield return new WaitForSeconds(1.5f);
    }

    // 按钮事件
    public void OnAttackButton()
    {
        if (RPGBattleSystem.Instance != null)
        {
            BattleAction action = new BattleAction
            {
                actor = RPGBattleSystem.Instance.currentActor,
                actionType = BattleActionType.Attack,
                target = SelectTarget() // 这里需要实现目标选择逻辑
            };
            
            RPGBattleSystem.Instance.PlayerSelectAction(action);
        }
    }

    public void OnSkillButton()
    {
        // 技能选择逻辑
    }

    public void OnItemButton()
    {
        // 物品选择逻辑
    }

    public void OnDefendButton()
    {
        if (RPGBattleSystem.Instance != null)
        {
            BattleAction action = new BattleAction
            {
                actor = RPGBattleSystem.Instance.currentActor,
                actionType = BattleActionType.Defend,
                target = RPGBattleSystem.Instance.currentActor
            };
            
            RPGBattleSystem.Instance.PlayerSelectAction(action);
        }
    }

    private Character SelectTarget()
    {
        // 简单的目标选择：选择第一个敌人
        if (RPGBattleSystem.Instance != null)
        {
            foreach (Character enemy in RPGBattleSystem.Instance.enemyTeam)
            {
                if (enemy.currentHealth > 0)
                {
                    return enemy;
                }
            }
        }
        return null;
    }
}

// 战斗系统单例
public class RPGBattleSystem
{
    public static RPGBattleSystem Instance { get; private set; }
    
    public Character currentActor;
    public List<Character> playerTeam = new List<Character>();
    public List<Character> enemyTeam = new List<Character>();
    
    static RPGBattleSystem()
    {
        Instance = new RPGBattleSystem();
    }
}
```

### 任务和对话系统

```csharp
using UnityEngine;
using UnityEngine.UI;
using System.Collections;
using System.Collections.Generic;

// RPG任务系统
public class RPGQuestSystem : MonoBehaviour
{
    [Header("任务数据")]
    public List<Quest> availableQuests = new List<Quest>();
    public List<Quest> activeQuests = new List<Quest>();
    public List<Quest> completedQuests = new List<Quest>();

    [Header("任务UI")]
    public RPGQuestUI questUI;
    public RPGDialogueSystem dialogueSystem;

    [Header("NPC引用")]
    public List<NPC> npcs = new List<NPC>();

    private PlayerCharacter player;

    public void Initialize()
    {
        player = RPGGameManager.Instance.player;
        
        // 初始化可用任务列表
        availableQuests = new List<Quest>(RPGGameManager.Instance.allQuests);
    }

    // 接受任务
    public bool AcceptQuest(string questName)
    {
        Quest quest = availableQuests.Find(q => q.questName == questName);
        if (quest != null && player.level >= quest.requiredLevel)
        {
            activeQuests.Add(quest);
            availableQuests.Remove(quest);
            
            // 通知UI更新
            if (questUI != null)
            {
                questUI.UpdateQuestList();
            }
            
            // 开始任务计时（如果有时间限制）
            if (quest.timeLimit > 0)
            {
                StartCoroutine(QuestTimeLimitCoroutine(quest));
            }
            
            return true;
        }
        
        return false;
    }

    // 完成任务
    public bool CompleteQuest(string questName)
    {
        Quest quest = activeQuests.Find(q => q.questName == questName);
        if (quest != null && IsQuestCompleted(quest))
        {
            activeQuests.Remove(quest);
            completedQuests.Add(quest);
            
            // 给予奖励
            GiveQuestRewards(quest);
            
            // 通知UI更新
            if (questUI != null)
            {
                questUI.UpdateQuestList();
            }
            
            return true;
        }
        
        return false;
    }

    // 检查任务是否完成
    public bool IsQuestCompleted(Quest quest)
    {
        foreach (QuestObjective objective in quest.objectives)
        {
            if (!objective.isCompleted)
            {
                return false;
            }
        }
        return true;
    }

    // 更新任务目标
    public void UpdateQuestObjective(string questName, string targetName, int amount = 1)
    {
        Quest quest = activeQuests.Find(q => q.questName == questName);
        if (quest != null)
        {
            QuestObjective objective = quest.objectives.Find(o => o.targetName == targetName);
            if (objective != null)
            {
                objective.currentCount = Mathf.Min(objective.targetCount, objective.currentCount + amount);
                objective.isCompleted = objective.currentCount >= objective.targetCount;
                
                // 通知UI更新
                if (questUI != null)
                {
                    questUI.UpdateActiveQuests();
                }
                
                // 检查是否完成任务
                if (IsQuestCompleted(quest))
                {
                    if (questUI != null)
                    {
                        questUI.ShowQuestComplete(quest);
                    }
                }
            }
        }
    }

    // 给予任务奖励
    private void GiveQuestRewards(Quest quest)
    {
        // 经验奖励
        RPGGameManager.Instance.AddExperience(quest.experienceReward);
        
        // 金币奖励
        RPGGameManager.Instance.AddGold(quest.goldReward);
        
        // 物品奖励
        foreach (ItemReward reward in quest.itemRewards)
        {
            if (Random.Range(0, 100) < reward.chance)
            {
                Item item = RPGGameManager.Instance.GetItem(reward.itemName);
                if (item != null)
                {
                    player.AddItem(item, reward.quantity);
                }
            }
        }
        
        // 播放奖励音效
        if (RPGAudioManager.Instance != null)
        {
            RPGAudioManager.Instance.PlaySFX("QuestComplete");
        }
    }

    // 任务时间限制协程
    private IEnumerator QuestTimeLimitCoroutine(Quest quest)
    {
        float timeLeft = quest.timeLimit;
        
        while (timeLeft > 0 && activeQuests.Contains(quest))
        {
            timeLeft -= Time.deltaTime;
            
            // 更新UI显示时间
            if (questUI != null)
            {
                questUI.UpdateQuestTime(quest, timeLeft);
            }
            
            yield return null;
        }
        
        // 时间到，任务失败
        if (activeQuests.Contains(quest))
        {
            FailQuest(quest.questName);
        }
    }

    // 任务失败
    private void FailQuest(string questName)
    {
        Quest quest = activeQuests.Find(q => q.questName == questName);
        if (quest != null)
        {
            activeQuests.Remove(quest);
            availableQuests.Add(quest); // 任务失败后可能可以重新接受
            
            // 通知UI
            if (questUI != null)
            {
                questUI.ShowQuestFailed(quest);
            }
        }
    }

    // 获取NPC的可用任务
    public List<Quest> GetAvailableQuestsForNPC(string npcName)
    {
        List<Quest> npcQuests = new List<Quest>();
        
        foreach (Quest quest in availableQuests)
        {
            if (quest.questGiver == npcName && player.level >= quest.requiredLevel)
            {
                npcQuests.Add(quest);
            }
        }
        
        return npcQuests;
    }

    // 获取NPC的进行中任务
    public List<Quest> GetActiveQuestsForNPC(string npcName)
    {
        List<Quest> npcQuests = new List<Quest>();
        
        foreach (Quest quest in activeQuests)
        {
            // 检查是否是交付任务的NPC
            // 这里简化处理，实际应该有更复杂的逻辑
            npcQuests.Add(quest);
        }
        
        return npcQuests;
    }
}

// NPC类
public class NPC : MonoBehaviour
{
    [Header("NPC信息")]
    public string npcName;
    public string npcType; // QuestGiver, Merchant, Trainer等
    public List<string> dialogueLines = new List<string>();
    public List<string> availableQuests = new List<string>();
    public List<string> shopItems = new List<string>();

    [Header("外观")]
    public Sprite portrait;
    public Color nameColor = Color.white;

    private RPGQuestSystem questSystem;
    private RPGDialogueSystem dialogueSystem;

    void Start()
    {
        questSystem = FindObjectOfType<RPGQuestSystem>();
        dialogueSystem = FindObjectOfType<RPGDialogueSystem>();
    }

    // 与NPC交互
    public void Interact()
    {
        if (questSystem != null)
        {
            // 检查是否有可接受的任务
            List<Quest> available = questSystem.GetAvailableQuestsForNPC(npcName);
            
            if (available.Count > 0)
            {
                // 显示任务对话
                if (RPGQuestUI.Instance != null)
                {
                    RPGQuestUI.Instance.ShowQuestOffer(available[0]);
                }
                return;
            }

            // 检查是否有可交付的任务
            List<Quest> active = questSystem.GetActiveQuestsForNPC(npcName);
            foreach (Quest quest in active)
            {
                if (questSystem.IsQuestCompleted(quest))
                {
                    // 显示完成任务对话
                    if (RPGQuestUI.Instance != null)
                    {
                        RPGQuestUI.Instance.ShowQuestCompletion(quest);
                    }
                    return;
                }
            }
        }

        // 如果没有任务相关的内容，显示对话
        if (dialogueSystem != null && dialogueLines.Count > 0)
        {
            dialogueSystem.StartDialogue(npcName, dialogueLines, portrait);
        }
    }
}

// RPG对话系统
public class RPGDialogueSystem : MonoBehaviour
{
    [Header("对话UI")]
    public GameObject dialoguePanel;
    public Text npcNameText;
    public Text dialogueText;
    public Image npcPortrait;
    public Button continueButton;
    public GameObject choicesPanel;
    public Transform choicesParent;

    private Queue<string> sentences;
    private List<string> currentDialogue;
    private int currentSentenceIndex = 0;
    private System.Action onDialogueEnd;

    void Start()
    {
        dialoguePanel.SetActive(false);
        sentences = new Queue<string>();
    }

    // 开始对话
    public void StartDialogue(string npcName, List<string> dialogue, Sprite portrait = null, System.Action callback = null)
    {
        onDialogueEnd = callback;
        
        if (npcNameText != null)
        {
            npcNameText.text = npcName;
        }
        
        if (npcPortrait != null && portrait != null)
        {
            npcPortrait.sprite = portrait;
        }
        
        currentDialogue = dialogue;
        currentSentenceIndex = 0;
        
        ShowNextSentence();
    }

    // 显示下一句话
    public void ShowNextSentence()
    {
        if (currentSentenceIndex < currentDialogue.Count)
        {
            string sentence = currentDialogue[currentSentenceIndex];
            currentSentenceIndex++;
            
            if (dialogueText != null)
            {
                dialogueText.text = sentence;
            }
            
            if (dialoguePanel != null)
            {
                dialoguePanel.SetActive(true);
            }
        }
        else
        {
            EndDialogue();
        }
    }

    // 结束对话
    private void EndDialogue()
    {
        if (dialoguePanel != null)
        {
            dialoguePanel.SetActive(false);
        }
        
        if (onDialogueEnd != null)
        {
            onDialogueEnd();
        }
    }

    // 显示对话选择
    public void ShowChoices(List<DialogueChoice> choices)
    {
        if (choicesPanel != null)
        {
            choicesPanel.SetActive(true);
        }
        
        // 清除旧的选择按钮
        foreach (Transform child in choicesParent)
        {
            Destroy(child.gameObject);
        }
        
        // 创建新的选择按钮
        foreach (DialogueChoice choice in choices)
        {
            GameObject choiceButtonGO = new GameObject("ChoiceButton");
            choiceButtonGO.transform.SetParent(choicesParent);
            
            Button choiceButton = choiceButtonGO.AddComponent<Button>();
            Text choiceText = choiceButtonGO.AddComponent<Text>();
            choiceText.text = choice.text;
            
            choiceButton.onClick.AddListener(() => {
                choice.onSelected();
                HideChoices();
            });
        }
    }

    // 隐藏选择
    private void HideChoices()
    {
        if (choicesPanel != null)
        {
            choicesPanel.SetActive(false);
        }
    }

    // 按钮事件
    public void OnContinueButton()
    {
        ShowNextSentence();
    }
}

// 对话选择
[System.Serializable]
public class DialogueChoice
{
    public string text;
    public System.Action onSelected;
}

// RPG任务UI
public class RPGQuestUI : MonoBehaviour
{
    public static RPGQuestUI Instance { get; private set; }

    [Header("任务面板")]
    public GameObject questPanel;
    public GameObject questLogPanel;
    public GameObject questOfferPanel;
    public GameObject questCompletePanel;

    [Header("任务列表")]
    public Transform availableQuestsParent;
    public Transform activeQuestsParent;
    public Transform completedQuestsParent;

    [Header("任务详情")]
    public Text questTitleText;
    public Text questDescriptionText;
    public Text questObjectivesText;
    public Text questRewardsText;

    [Header("任务按钮")]
    public Button acceptButton;
    public Button completeButton;
    public Button cancelButton;

    private RPGQuestSystem questSystem;

    void Awake()
    {
        Instance = this;
    }

    void Start()
    {
        questSystem = FindObjectOfType<RPGQuestSystem>();
        questPanel.SetActive(false);
    }

    // 更新任务列表
    public void UpdateQuestList()
    {
        ClearQuestList(availableQuestsParent);
        ClearQuestList(activeQuestsParent);
        ClearQuestList(completedQuestsParent);

        // 添加可用任务
        foreach (Quest quest in questSystem.availableQuests)
        {
            CreateQuestButton(quest, availableQuestsParent, OnQuestClick);
        }

        // 添加进行中任务
        foreach (Quest quest in questSystem.activeQuests)
        {
            CreateQuestButton(quest, activeQuestsParent, OnActiveQuestClick);
        }

        // 添加已完成任务
        foreach (Quest quest in questSystem.completedQuests)
        {
            CreateQuestButton(quest, completedQuestsParent, OnCompletedQuestClick);
        }
    }

    // 更新进行中的任务
    public void UpdateActiveQuests()
    {
        ClearQuestList(activeQuestsParent);

        foreach (Quest quest in questSystem.activeQuests)
        {
            CreateQuestButton(quest, activeQuestsParent, OnActiveQuestClick);
        }
    }

    // 创建任务按钮
    private void CreateQuestButton(Quest quest, Transform parent, System.Action<Quest> onClick)
    {
        GameObject buttonGO = new GameObject(quest.questName);
        buttonGO.transform.SetParent(parent);

        Button button = buttonGO.AddComponent<Button>();
        Text text = buttonGO.AddComponent<Text>();
        text.text = quest.questName;

        button.onClick.AddListener(() => onClick(quest));
    }

    // 清空任务列表
    private void ClearQuestList(Transform parent)
    {
        foreach (Transform child in parent)
        {
            Destroy(child.gameObject);
        }
    }

    // 任务点击事件
    private void OnQuestClick(Quest quest)
    {
        ShowQuestDetails(quest);
        if (acceptButton != null)
        {
            acceptButton.gameObject.SetActive(true);
            acceptButton.onClick.RemoveAllListeners();
            acceptButton.onClick.AddListener(() => OnAcceptQuest(quest));
        }
    }

    // 进行中任务点击事件
    private void OnActiveQuestClick(Quest quest)
    {
        ShowQuestDetails(quest);
        if (completeButton != null)
        {
            completeButton.gameObject.SetActive(questSystem.IsQuestCompleted(quest));
            completeButton.onClick.RemoveAllListeners();
            completeButton.onClick.AddListener(() => OnCompleteQuest(quest));
        }
    }

    // 已完成任务点击事件
    private void OnCompletedQuestClick(Quest quest)
    {
        ShowQuestDetails(quest);
    }

    // 显示任务详情
    private void ShowQuestDetails(Quest quest)
    {
        if (questTitleText != null)
        {
            questTitleText.text = quest.questName;
        }

        if (questDescriptionText != null)
        {
            questDescriptionText.text = quest.description;
        }

        if (questObjectivesText != null)
        {
            string objectives = "Objectives:\n";
            foreach (QuestObjective objective in quest.objectives)
            {
                objectives += $"• {objective.description}: {objective.currentCount}/{objective.targetCount}\n";
            }
            questObjectivesText.text = objectives;
        }

        if (questRewardsText != null)
        {
            string rewards = $"Rewards:\n+{quest.experienceReward} EXP\n+{quest.goldReward} Gold";
            foreach (ItemReward reward in quest.itemRewards)
            {
                rewards += $"\n+{reward.quantity} {reward.itemName}";
            }
            questRewardsText.text = rewards;
        }
    }

    // 接受任务
    private void OnAcceptQuest(Quest quest)
    {
        if (questSystem.AcceptQuest(quest.questName))
        {
            UpdateQuestList();
            if (questOfferPanel != null)
            {
                questOfferPanel.SetActive(false);
            }
        }
    }

    // 完成任务
    private void OnCompleteQuest(Quest quest)
    {
        if (questSystem.CompleteQuest(quest.questName))
        {
            UpdateQuestList();
            if (questCompletePanel != null)
            {
                questCompletePanel.SetActive(false);
            }
        }
    }

    // 显示/隐藏任务面板
    public void ToggleQuestPanel()
    {
        if (questPanel != null)
        {
            bool isActive = !questPanel.activeSelf;
            questPanel.SetActive(isActive);
            
            if (isActive)
            {
                UpdateQuestList();
            }
        }
    }

    // 显示任务提供
    public void ShowQuestOffer(Quest quest)
    {
        if (questOfferPanel != null)
        {
            questOfferPanel.SetActive(true);
            ShowQuestDetails(quest);
            
            if (acceptButton != null)
            {
                acceptButton.gameObject.SetActive(true);
                acceptButton.onClick.RemoveAllListeners();
                acceptButton.onClick.AddListener(() => OnAcceptQuest(quest));
            }
            
            if (cancelButton != null)
            {
                cancelButton.onClick.RemoveAllListeners();
                cancelButton.onClick.AddListener(() => questOfferPanel.SetActive(false));
            }
        }
    }

    // 显示任务完成
    public void ShowQuestCompletion(Quest quest)
    {
        if (questCompletePanel != null)
        {
            questCompletePanel.SetActive(true);
            ShowQuestDetails(quest);
            
            if (completeButton != null)
            {
                completeButton.gameObject.SetActive(true);
                completeButton.onClick.RemoveAllListeners();
                completeButton.onClick.AddListener(() => OnCompleteQuest(quest));
            }
            
            if (cancelButton != null)
            {
                cancelButton.onClick.RemoveAllListeners();
                cancelButton.onClick.AddListener(() => questCompletePanel.SetActive(false));
            }
        }
    }

    // 显示任务完成结果
    public void ShowQuestComplete(Quest quest)
    {
        // 这里可以显示任务完成的特殊UI或效果
        Debug.Log($"Quest completed: {quest.questName}");
    }

    // 显示任务失败
    public void ShowQuestFailed(Quest quest)
    {
        // 这里可以显示任务失败的UI或效果
        Debug.Log($"Quest failed: {quest.questName}");
    }

    // 更新任务时间
    public void UpdateQuestTime(Quest quest, float timeLeft)
    {
        // 这里可以更新UI显示剩余时间
    }
}
```

### 背包和商店系统

```csharp
using UnityEngine;
using UnityEngine.UI;
using System.Collections.Generic;

// RPG背包系统
public class RPGInventorySystem : MonoBehaviour
{
    [Header("背包设置")]
    public int inventorySize = 30;
    public int equipmentSlots = 10;

    [Header("UI引用")]
    public RPGInventoryUI inventoryUI;
    public RPGShopUI shopUI;

    private PlayerCharacter player;
    private List<Item> inventory = new List<Item>();
    private Dictionary<EquipmentSlot, Item> equipment = new Dictionary<EquipmentSlot, Item>();

    public void Initialize()
    {
        player = RPGGameManager.Instance.player;
        
        // 初始化装备槽
        foreach (EquipmentSlot slot in System.Enum.GetValues(typeof(EquipmentSlot)))
        {
            if (slot != EquipmentSlot.None)
            {
                equipment[slot] = null;
            }
        }
    }

    // 添加物品到背包
    public bool AddItem(Item item, int quantity = 1)
    {
        if (player == null) return false;

        // 检查背包是否已满
        if (inventory.Count >= inventorySize)
        {
            // 检查是否可以堆叠
            Item existingItem = FindItem(item.itemName);
            if (existingItem != null && existingItem.stackLimit > 1 && 
                existingItem.quantity < existingItem.stackLimit)
            {
                int newQuantity = Mathf.Min(existingItem.quantity + quantity, existingItem.stackLimit);
                existingItem.quantity = newQuantity;
                
                if (inventoryUI != null)
                {
                    inventoryUI.UpdateItemQuantity(existingItem);
                }
                
                return true;
            }
            else
            {
                return false; // 背包已满且无法堆叠
            }
        }

        // 检查是否可以与现有物品堆叠
        Item stackableItem = FindItem(item.itemName);
        if (stackableItem != null && stackableItem.stackLimit > 1)
        {
            int spaceAvailable = stackableItem.stackLimit - stackableItem.quantity;
            int toAdd = Mathf.Min(quantity, spaceAvailable);
            
            stackableItem.quantity += toAdd;
            quantity -= toAdd;
            
            if (inventoryUI != null)
            {
                inventoryUI.UpdateItemQuantity(stackableItem);
            }
        }

        // 添加剩余物品
        if (quantity > 0)
        {
            Item newItem = CreateItemCopy(item);
            newItem.quantity = quantity;
            inventory.Add(newItem);
            
            if (inventoryUI != null)
            {
                inventoryUI.AddItemToUI(newItem);
            }
        }

        return true;
    }

    // 移除物品
    public bool RemoveItem(string itemName, int quantity = 1)
    {
        Item item = FindItem(itemName);
        if (item != null)
        {
            if (item.quantity > quantity)
            {
                item.quantity -= quantity;
                
                if (inventoryUI != null)
                {
                    inventoryUI.UpdateItemQuantity(item);
                }
            }
            else
            {
                inventory.Remove(item);
                
                if (inventoryUI != null)
                {
                    inventoryUI.RemoveItemFromUI(item);
                }
            }
            
            return true;
        }
        
        return false;
    }

    // 使用物品
    public bool UseItem(string itemName)
    {
        Item item = FindItem(itemName);
        if (item != null && item.isConsumable)
        {
            // 应用物品效果
            ApplyItemEffect(item);
            
            // 减少数量或移除
            if (item.quantity > 1)
            {
                item.quantity--;
                
                if (inventoryUI != null)
                {
                    inventoryUI.UpdateItemQuantity(item);
                }
            }
            else
            {
                inventory.Remove(item);
                
                if (inventoryUI != null)
                {
                    inventoryUI.RemoveItemFromUI(item);
                }
            }
            
            return true;
        }
        
        return false;
    }

    // 装备物品
    public bool EquipItem(string itemName)
    {
        Item item = FindItem(itemName);
        if (item != null)
        {
            EquipmentSlot slot = GetEquipmentSlot(item);
            if (slot != EquipmentSlot.None)
            {
                // 如果该槽位已有装备，先卸下
                if (equipment[slot] != null)
                {
                    UnequipItem(slot);
                }

                // 从背包中移除物品
                inventory.Remove(item);

                // 装备物品
                equipment[slot] = item;

                // 应用属性加成
                ApplyEquipmentStats(item, true);

                if (inventoryUI != null)
                {
                    inventoryUI.UpdateEquipment(slot, item);
                    inventoryUI.RemoveItemFromUI(item);
                }

                return true;
            }
        }
        
        return false;
    }

    // 卸下装备
    public bool UnequipItem(EquipmentSlot slot)
    {
        if (equipment.ContainsKey(slot) && equipment[slot] != null)
        {
            Item item = equipment[slot];
            
            // 移除属性加成
            ApplyEquipmentStats(item, false);

            // 将物品放回背包
            if (!AddItem(item, 1))
            {
                // 如果背包满了，丢弃物品（或者有其他处理方式）
                Debug.LogWarning("Cannot unequip item: inventory full");
                return false;
            }

            // 清空装备槽
            equipment[slot] = null;

            if (inventoryUI != null)
            {
                inventoryUI.UpdateEquipment(slot, null);
            }

            return true;
        }
        
        return false;
    }

    // 购买物品
    public bool BuyItem(Item item, int quantity = 1)
    {
        int totalCost = item.buyPrice * quantity;
        
        if (player.gold >= totalCost)
        {
            player.gold -= totalCost;
            
            if (AddItem(item, quantity))
            {
                if (inventoryUI != null)
                {
                    inventoryUI.UpdateGoldDisplay(player.gold);
                }
                return true;
            }
            else
            {
                // 如果添加失败，退还金币
                player.gold += totalCost;
                return false;
            }
        }
        
        return false;
    }

    // 出售物品
    public bool SellItem(string itemName, int quantity = 1)
    {
        Item item = FindItem(itemName);
        if (item != null && item.quantity >= quantity)
        {
            int sellPrice = Mathf.RoundToInt(item.sellPrice * quantity * player.GetTotalLuck() / 100f);
            player.gold += sellPrice;

            if (item.quantity > quantity)
            {
                item.quantity -= quantity;
                
                if (inventoryUI != null)
                {
                    inventoryUI.UpdateItemQuantity(item);
                }
            }
            else
            {
                inventory.Remove(item);
                
                if (inventoryUI != null)
                {
                    inventoryUI.RemoveItemFromUI(item);
                }
            }

            if (inventoryUI != null)
            {
                inventoryUI.UpdateGoldDisplay(player.gold);
            }

            return true;
        }
        
        return false;
    }

    // 查找物品
    private Item FindItem(string itemName)
    {
        return inventory.Find(item => item.itemName == itemName);
    }

    // 获取装备槽
    private EquipmentSlot GetEquipmentSlot(Item item)
    {
        switch (item.itemType)
        {
            case ItemType.Weapon:
                return EquipmentSlot.Weapon;
            case ItemType.Armor:
                if (item.itemName.Contains("Helmet") || item.itemName.Contains("Head"))
                    return EquipmentSlot.Head;
                else if (item.itemName.Contains("Chest") || item.itemName.Contains("Armor"))
                    return EquipmentSlot.Chest;
                else if (item.itemName.Contains("Legs") || item.itemName.Contains("Pants"))
                    return EquipmentSlot.Legs;
                else if (item.itemName.Contains("Boots") || item.itemName.Contains("Shoes"))
                    return EquipmentSlot.Feet;
                else if (item.itemName.Contains("Gloves"))
                    return EquipmentSlot.Hands;
                break;
            case ItemType.Accessory:
                // 这里可以实现多个饰品槽
                if (equipment[EquipmentSlot.Accessory1] == null)
                    return EquipmentSlot.Accessory1;
                else if (equipment[EquipmentSlot.Accessory2] == null)
                    return EquipmentSlot.Accessory2;
                break;
        }

        return EquipmentSlot.None;
    }

    // 应用物品效果
    private void ApplyItemEffect(Item item)
    {
        if (player != null)
        {
            if (item.healthRestore > 0)
            {
                player.Heal(item.healthRestore);
            }

            if (item.manaRestore > 0)
            {
                player.RestoreMana(item.manaRestore);
            }

            if (item.restorePercentage > 0)
            {
                int healthRestore = Mathf.RoundToInt(player.maxHealth * item.restorePercentage / 100f);
                int manaRestore = Mathf.RoundToInt(player.maxMana * item.restorePercentage / 100f);
                player.Heal(healthRestore);
                player.RestoreMana(manaRestore);
            }

            // 其他效果，如临时属性提升等
            if (item.duration > 0 && !string.IsNullOrEmpty(item.effectType))
            {
                ApplyTemporaryEffect(item);
            }
        }
    }

    // 应用临时效果
    private void ApplyTemporaryEffect(Item item)
    {
        // 这里可以实现临时属性提升效果
        // 例如：增加攻击力、防御力等，持续item.duration秒
        StartCoroutine(ApplyTemporaryEffectCoroutine(item));
    }

    // 临时效果协程
    private System.Collections.IEnumerator ApplyTemporaryEffectCoroutine(Item item)
    {
        // 应用效果
        switch (item.effectType)
        {
            case "StrengthBoost":
                player.strength += item.effectValue;
                break;
            case "DefenseBoost":
                player.armor += item.effectValue;
                break;
            case "SpeedBoost":
                player.movementSpeed += item.effectValue;
                break;
        }

        // 等待持续时间
        yield return new UnityEngine.WaitForSeconds(item.duration);

        // 移除效果
        switch (item.effectType)
        {
            case "StrengthBoost":
                player.strength -= item.effectValue;
                break;
            case "DefenseBoost":
                player.armor -= item.effectValue;
                break;
            case "SpeedBoost":
                player.movementSpeed -= item.effectValue;
                break;
        }
    }

    // 应用装备属性
    private void ApplyEquipmentStats(Item item, bool isEquipping)
    {
        if (player == null) return;

        int multiplier = isEquipping ? 1 : -1;

        player.strength += item.strength * multiplier;
        player.dexterity += item.dexterity * multiplier;
        player.intelligence += item.intelligence * multiplier;
        player.constitution += item.constitution * multiplier;
        player.luck += item.luck * multiplier;

        player.maxHealth += item.healthBonus * multiplier;
        player.armor += item.armorBonus * multiplier;
        player.attackPower += item.damageBonus * multiplier;
        player.magicPower += item.magicPower * multiplier;
        player.criticalChance += item.criticalChance * multiplier;
        player.attackSpeed += item.attackSpeed * multiplier;
        player.movementSpeed += item.movementSpeed * multiplier;

        // 如果是武器，可能需要更新玩家的攻击动画或攻击方式
    }

    // 创建物品副本
    private Item CreateItemCopy(Item original)
    {
        Item copy = new Item();
        System.Reflection.FieldInfo[] fields = typeof(Item).GetFields();
        foreach (System.Reflection.FieldInfo field in fields)
        {
            field.SetValue(copy, field.GetValue(original));
        }
        return copy;
    }

    // 获取背包中物品数量
    public int GetItemCount(string itemName)
    {
        Item item = FindItem(itemName);
        return item != null ? item.quantity : 0;
    }

    // 获取背包占用空间
    public int GetInventoryUsage()
    {
        return inventory.Count;
    }

    // 获取背包剩余空间
    public int GetRemainingInventorySpace()
    {
        return inventorySize - inventory.Count;
    }

    // 获取所有物品
    public List<Item> GetAllItems()
    {
        return new List<Item>(inventory);
    }

    // 获取装备
    public Dictionary<EquipmentSlot, Item> GetEquipment()
    {
        return new Dictionary<EquipmentSlot, Item>(equipment);
    }
}

// RPG背包UI
public class RPGInventoryUI : MonoBehaviour
{
    [Header("背包面板")]
    public GameObject inventoryPanel;
    public Transform inventoryGrid;
    public Transform equipmentGrid;

    [Header("物品按钮预制件")]
    public GameObject itemButtonPrefab;
    public GameObject equipmentSlotPrefab;

    [Header("信息面板")]
    public Text goldText;
    public Text inventoryInfoText;
    public Image itemIcon;
    public Text itemNameText;
    public Text itemDescriptionText;
    public Text itemStatsText;

    private Dictionary<Item, GameObject> itemButtons = new Dictionary<Item, GameObject>();
    private Dictionary<EquipmentSlot, GameObject> equipmentSlots = new Dictionary<EquipmentSlot, GameObject>();
    private Item selectedItem;

    void Start()
    {
        inventoryPanel.SetActive(false);
        InitializeEquipmentSlots();
    }

    // 初始化装备槽
    private void InitializeEquipmentSlots()
    {
        foreach (EquipmentSlot slot in System.Enum.GetValues(typeof(EquipmentSlot)))
        {
            if (slot != EquipmentSlot.None)
            {
                GameObject slotGO = Instantiate(equipmentSlotPrefab, equipmentGrid);
                slotGO.name = slot.ToString();
                
                // 添加点击事件
                Button slotButton = slotGO.GetComponent<Button>();
                EquipmentSlot capturedSlot = slot; // 避免闭包问题
                slotButton.onClick.AddListener(() => OnEquipmentSlotClick(capturedSlot));
                
                equipmentSlots[slot] = slotGO;
            }
        }
    }

    // 添加物品到UI
    public void AddItemToUI(Item item)
    {
        if (itemButtonPrefab != null && inventoryGrid != null)
        {
            GameObject itemGO = Instantiate(itemButtonPrefab, inventoryGrid);
            itemGO.name = item.itemName;

            // 设置物品信息
            SetItemButtonInfo(itemGO, item);

            // 添加点击事件
            Button button = itemGO.GetComponent<Button>();
            button.onClick.AddListener(() => OnItemClick(item));

            itemButtons[item] = itemGO;
        }
    }

    // 更新物品数量显示
    public void UpdateItemQuantity(Item item)
    {
        if (itemButtons.ContainsKey(item))
        {
            GameObject itemGO = itemButtons[item];
            Text quantityText = itemGO.GetComponentInChildren<Text>();
            if (quantityText != null)
            {
                quantityText.text = item.quantity > 1 ? item.quantity.ToString() : "";
            }
        }
    }

    // 从UI移除物品
    public void RemoveItemFromUI(Item item)
    {
        if (itemButtons.ContainsKey(item))
        {
            GameObject itemGO = itemButtons[item];
            Destroy(itemGO);
            itemButtons.Remove(item);
        }
    }

    // 更新装备显示
    public void UpdateEquipment(EquipmentSlot slot, Item item)
    {
        if (equipmentSlots.ContainsKey(slot))
        {
            GameObject slotGO = equipmentSlots[slot];
            
            // 设置装备图标
            if (item != null && item.icon != null)
            {
                Image iconImage = slotGO.GetComponent<Image>();
                if (iconImage != null)
                {
                    iconImage.sprite = item.icon;
                }
            }
            else
            {
                Image iconImage = slotGO.GetComponent<Image>();
                if (iconImage != null)
                {
                    iconImage.sprite = null; // 或设置为空装备图标
                }
            }
        }
    }

    // 设置物品按钮信息
    private void SetItemButtonInfo(GameObject buttonGO, Item item)
    {
        Image iconImage = buttonGO.GetComponent<Image>();
        if (iconImage != null && item.icon != null)
        {
            iconImage.sprite = item.icon;
        }

        Text quantityText = buttonGO.GetComponentInChildren<Text>();
        if (quantityText != null)
        {
            quantityText.text = item.quantity > 1 ? item.quantity.ToString() : "";
        }
    }

    // 更新金币显示
    public void UpdateGoldDisplay(int gold)
    {
        if (goldText != null)
        {
            goldText.text = $"Gold: {gold}";
        }
    }

    // 更新背包信息
    public void UpdateInventoryInfo(int usedSpace, int totalSpace)
    {
        if (inventoryInfoText != null)
        {
            inventoryInfoText.text = $"Inventory: {usedSpace}/{totalSpace}";
        }
    }

    // 显示/隐藏背包面板
    public void ToggleInventoryPanel()
    {
        if (inventoryPanel != null)
        {
            bool isActive = !inventoryPanel.activeSelf;
            inventoryPanel.SetActive(isActive);
            
            if (isActive)
            {
                RefreshInventoryDisplay();
            }
        }
    }

    // 刷新背包显示
    public void RefreshInventoryDisplay()
    {
        // 清除现有的物品按钮
        foreach (GameObject itemGO in itemButtons.Values)
        {
            Destroy(itemGO);
        }
        itemButtons.Clear();

        // 重新添加所有物品
        RPGInventorySystem inventorySystem = FindObjectOfType<RPGInventorySystem>();
        if (inventorySystem != null)
        {
            List<Item> allItems = inventorySystem.GetAllItems();
            foreach (Item item in allItems)
            {
                AddItemToUI(item);
            }

            // 更新金币和背包信息
            UpdateGoldDisplay(RPGGameManager.Instance.player.gold);
            UpdateInventoryInfo(inventorySystem.GetInventoryUsage(), inventorySystem.inventorySize);
        }
    }

    // 物品点击事件
    private void OnItemClick(Item item)
    {
        selectedItem = item;

        // 显示物品详细信息
        if (itemIcon != null && item.icon != null)
        {
            itemIcon.sprite = item.icon;
        }

        if (itemNameText != null)
        {
            itemNameText.text = item.itemName;
        }

        if (itemDescriptionText != null)
        {
            itemDescriptionText.text = item.description;
        }

        if (itemStatsText != null)
        {
            string stats = "";
            if (item.strength > 0) stats += $"\n+{item.strength} Strength";
            if (item.dexterity > 0) stats += $"\n+{item.dexterity} Dexterity";
            if (item.intelligence > 0) stats += $"\n+{item.intelligence} Intelligence";
            if (item.healthBonus > 0) stats += $"\n+{item.healthBonus} Max HP";
            if (item.armorBonus > 0) stats += $"\n+{item.armorBonus} Armor";
            if (item.damageBonus > 0) stats += $"\n+{item.damageBonus} Attack";
            if (item.healthRestore > 0) stats += $"\nRestores {item.healthRestore} HP";

            itemStatsText.text = stats;
        }
    }

    // 装备槽点击事件
    private void OnEquipmentSlotClick(EquipmentSlot slot)
    {
        if (selectedItem != null)
        {
            // 尝试装备选中的物品
            RPGInventorySystem inventorySystem = FindObjectOfType<RPGInventorySystem>();
            if (inventorySystem != null)
            {
                inventorySystem.EquipItem(selectedItem.itemName);
            }
        }
    }
}

// RPG商店UI
public class RPGShopUI : MonoBehaviour
{
    [Header("商店面板")]
    public GameObject shopPanel;
    public Transform shopItemsGrid;
    public Transform playerInventoryGrid;

    [Header("商店信息")]
    public Text shopNameText;
    public Text playerGoldText;

    [Header("物品按钮预制件")]
    public GameObject shopItemButtonPrefab;
    public GameObject inventoryItemButtonPrefab;

    private List<Item> shopInventory = new List<Item>();
    private NPC currentNPC;

    // 设置商店
    public void SetShop(NPC npc)
    {
        currentNPC = npc;
        shopInventory.Clear();

        if (shopNameText != null)
        {
            shopNameText.text = $"{npc.npcName}'s Shop";
        }

        // 添加NPC的商店物品
        foreach (string itemName in npc.shopItems)
        {
            Item item = RPGGameManager.Instance.GetItem(itemName);
            if (item != null)
            {
                shopInventory.Add(item);
            }
        }

        DisplayShopItems();
    }

    // 显示商店物品
    private void DisplayShopItems()
    {
        // 清除现有物品
        foreach (Transform child in shopItemsGrid)
        {
            Destroy(child.gameObject);
        }

        // 添加商店物品
        foreach (Item item in shopInventory)
        {
            if (shopItemButtonPrefab != null)
            {
                GameObject itemGO = Instantiate(shopItemButtonPrefab, shopItemsGrid);
                SetupShopItemButton(itemGO, item);
            }
        }

        // 显示玩家背包物品
        DisplayPlayerInventory();
    }

    // 设置商店物品按钮
    private void SetupShopItemButton(GameObject buttonGO, Item item)
    {
        // 设置图标
        Image iconImage = buttonGO.GetComponent<Image>();
        if (iconImage != null && item.icon != null)
        {
            iconImage.sprite = item.icon;
        }

        // 设置文本（物品名和价格）
        Text[] texts = buttonGO.GetComponentsInChildren<Text>();
        if (texts.Length >= 2)
        {
            texts[0].text = item.itemName;
            texts[1].text = $"${item.buyPrice}";
        }

        // 设置点击事件
        Button button = buttonGO.GetComponent<Button>();
        button.onClick.AddListener(() => OnShopItemBuy(item));
    }

    // 显示玩家背包物品
    private void DisplayPlayerInventory()
    {
        // 清除现有物品
        foreach (Transform child in playerInventoryGrid)
        {
            Destroy(child.gameObject);
        }

        // 获取玩家背包物品
        RPGInventorySystem inventorySystem = FindObjectOfType<RPGInventorySystem>();
        if (inventorySystem != null)
        {
            List<Item> playerItems = inventorySystem.GetAllItems();
            
            foreach (Item item in playerItems)
            {
                if (inventoryItemButtonPrefab != null)
                {
                    GameObject itemGO = Instantiate(inventoryItemButtonPrefab, playerInventoryGrid);
                    SetupInventoryItemButton(itemGO, item);
                }
            }
        }
    }

    // 设置背包物品按钮
    private void SetupInventoryItemButton(GameObject buttonGO, Item item)
    {
        // 设置图标
        Image iconImage = buttonGO.GetComponent<Image>();
        if (iconImage != null && item.icon != null)
        {
            iconImage.sprite = item.icon;
        }

        // 设置文本（物品名和售价）
        Text[] texts = buttonGO.GetComponentsInChildren<Text>();
        if (texts.Length >= 2)
        {
            texts[0].text = item.itemName;
            texts[1].text = $"Sell: ${item.sellPrice}";
        }

        // 设置点击事件
        Button button = buttonGO.GetComponent<Button>();
        button.onClick.AddListener(() => OnInventoryItemSell(item));
    }

    // 购买物品
    private void OnShopItemBuy(Item item)
    {
        RPGInventorySystem inventorySystem = FindObjectOfType<RPGInventorySystem>();
        if (inventorySystem != null)
        {
            if (inventorySystem.BuyItem(item))
            {
                // 购买成功，刷新显示
                DisplayShopItems();
                
                // 播放音效
                if (RPGAudioManager.Instance != null)
                {
                    RPGAudioManager.Instance.PlaySFX("ItemBuy");
                }
            }
            else
            {
                // 购买失败（金币不足或背包满）
                Debug.LogWarning("Cannot buy item: not enough gold or inventory full");
            }
        }
    }

    // 出售物品
    private void OnInventoryItemSell(Item item)
    {
        RPGInventorySystem inventorySystem = FindObjectOfType<RPGInventorySystem>();
        if (inventorySystem != null)
        {
            if (inventorySystem.SellItem(item.itemName))
            {
                // 出售成功，刷新显示
                DisplayShopItems();
                
                // 播放音效
                if (RPGAudioManager.Instance != null)
                {
                    RPGAudioManager.Instance.PlaySFX("ItemSell");
                }
            }
            else
            {
                // 出售失败
                Debug.LogWarning("Cannot sell item");
            }
        }
    }

    // 更新玩家金币显示
    private void UpdatePlayerGold()
    {
        if (playerGoldText != null)
        {
            playerGoldText.text = $"Gold: {RPGGameManager.Instance.player.gold}";
        }
    }

    // 显示/隐藏商店面板
    public void ToggleShopPanel()
    {
        if (shopPanel != null)
        {
            bool isActive = !shopPanel.activeSelf;
            shopPanel.SetActive(isActive);
            
            if (isActive && currentNPC != null)
            {
                SetShop(currentNPC);
                UpdatePlayerGold();
            }
        }
    }
}
```

---

## 游戏发布流程

### 构建设置

```csharp
using UnityEngine;
using UnityEditor;
using System.Collections;

// 游戏发布设置
public class GameBuildSettings : MonoBehaviour
{
    [Header("构建设置")]
    public string gameTitle = "My Game";
    public string companyName = "My Company";
    public string productVersion = "1.0.0";
    public string bundleIdentifier = "com.mycompany.mygame";

    [Header("游戏配置")]
    public int targetFrameRate = 60;
    public bool enableVSync = false;
    public Resolution defaultResolution = new Resolution { width = 1920, height = 1080, refreshRate = 60 };
    public bool fullscreenMode = true;

    [Header("优化设置")]
    public bool enableDynamicBatching = true;
    public bool enableStaticBatching = true;
    public bool enableOcclusionCulling = true;
    public bool enableLODs = true;

    [Header("音频设置")]
    public bool enableAudioDucking = true;
    public float masterVolume = 1f;

    [Header("控制设置")]
    public bool enableMouseCursor = true;
    public bool enableTouchInput = true;
    public bool enableGamepadInput = true;

    // 应用构建设置
    [ContextMenu("应用构建设置")]
    public void ApplyBuildSettings()
    {
        #if UNITY_EDITOR
        // 应用基本设置
        PlayerSettings.productName = gameTitle;
        PlayerSettings.companyName = companyName;
        PlayerSettings.bundleVersion = productVersion;
        
        #if UNITY_STANDALONE
        PlayerSettings.applicationIdentifier = bundleIdentifier;
        #elif UNITY_ANDROID
        PlayerSettings.applicationIdentifier = bundleIdentifier;
        #elif UNITY_IOS
        PlayerSettings.applicationIdentifier = bundleIdentifier;
        #endif

        // 应用性能设置
        Application.targetFrameRate = targetFrameRate;
        QualitySettings.vSyncCount = enableVSync ? 1 : 0;

        // 应用图形设置
        QualitySettings.names = new string[] { "Very Low", "Low", "Medium", "High", "Very High", "Ultra" };
        
        // 应用批处理设置
        PlayerSettings.batching = enableDynamicBatching ? 
            PlayerSettings.batching | BatchMode.CombineMeshesStatic : 
            PlayerSettings.batching & ~BatchMode.CombineMeshesStatic;
            
        PlayerSettings.batching = enableStaticBatching ? 
            PlayerSettings.batching | BatchMode.CombineMeshesDynamic : 
            PlayerSettings.batching & ~BatchMode.CombineMeshesDynamic;

        // 应用其他设置
        PlayerSettings.runInBackground = true;
        PlayerSettings.captureSingleScreen = false;
        PlayerSettings.resizableWindow = !fullscreenMode;
        PlayerSettings.fullScreenMode = fullscreenMode ? 
            FullScreenMode.FullScreenWindow : FullScreenMode.Windowed;

        Debug.Log("构建设置已应用");
        #endif
    }

    // 分辨率设置
    [System.Serializable]
    public class Resolution
    {
        public int width = 1920;
        public int height = 1080;
        public int refreshRate = 60;
    }

    // 获取推荐的分辨率
    public static Resolution[] GetRecommendedResolutions()
    {
        return new Resolution[]
        {
            new Resolution { width = 1920, height = 1080, refreshRate = 60 }, // 1080p
            new Resolution { width = 1280, height = 720, refreshRate = 60 },  // 720p
            new Resolution { width = 2560, height = 1440, refreshRate = 60 }, // 1440p
            new Resolution { width = 3840, height = 2160, refreshRate = 60 }  // 4K
        };
    }

    // 检查系统兼容性
    public static SystemCompatibilityInfo GetSystemCompatibility()
    {
        SystemCompatibilityInfo info = new SystemCompatibilityInfo();
        
        info.os = SystemInfo.operatingSystem;
        info.gpu = SystemInfo.graphicsDeviceName;
        info.gpuType = SystemInfo.graphicsDeviceType.ToString();
        info.ram = SystemInfo.systemMemorySize;
        info.cpu = SystemInfo.processorType;
        info.cpuCount = SystemInfo.processorCount;
        info.supportsShadows = SystemInfo.supportsShadows;
        info.supportsRenderTextures = SystemInfo.supportsRenderTextures;
        info.supportsComputeShaders = SystemInfo.supportsComputeShaders;
        
        // 评估兼容性等级
        if (info.ram >= 8192 && info.cpuCount >= 4 && info.supportsShadows)
        {
            info.compatibilityLevel = CompatibilityLevel.High;
        }
        else if (info.ram >= 4096 && info.cpuCount >= 2)
        {
            info.compatibilityLevel = CompatibilityLevel.Medium;
        }
        else
        {
            info.compatibilityLevel = CompatibilityLevel.Low;
        }

        return info;
    }
}

// 系统兼容性信息
[System.Serializable]
public class SystemCompatibilityInfo
{
    public string os;
    public string gpu;
    public string gpuType;
    public int ram; // MB
    public string cpu;
    public int cpuCount;
    public bool supportsShadows;
    public bool supportsRenderTextures;
    public bool supportsComputeShaders;
    public CompatibilityLevel compatibilityLevel;
}

public enum CompatibilityLevel
{
    Low,
    Medium,
    High
}

// 构建工具类
public class BuildTool : MonoBehaviour
{
    [Header("构建配置")]
    public BuildTargetGroup targetPlatform = BuildTargetGroup.Standalone;
    public BuildTarget buildTarget = BuildTarget.StandaloneWindows64;
    public string buildPath = "Builds/";
    public bool developmentBuild = false;
    public bool autoRunPlayer = false;
    public bool enableHeadlessMode = false;

    [Header("场景配置")]
    public string[] scenesToBuild;
    public int mainSceneIndex = 0;

    [ContextMenu("执行构建")]
    public void PerformBuild()
    {
        #if UNITY_EDITOR
        // 设置场景
        EditorBuildSettingsScene[] buildScenes = new EditorBuildSettingsScene[scenesToBuild.Length];
        for (int i = 0; i < scenesToBuild.Length; i++)
        {
            buildScenes[i] = new EditorBuildSettingsScene(scenesToBuild[i], true);
        }
        EditorBuildSettings.scenes = buildScenes;

        // 构建选项
        BuildOptions options = BuildOptions.None;
        if (developmentBuild)
        {
            options |= BuildOptions.Development;
        }
        if (enableHeadlessMode)
        {
            options |= BuildOptions.EnableHeadlessMode;
        }

        // 执行构建
        string buildPathFull = buildPath + GetBuildFileName();
        UnityEditor.Build.Reporting.BuildReport report = 
            UnityEditor.BuildPipeline.BuildPlayer(
                scenesToBuild, 
                buildPathFull, 
                buildTarget, 
                options
            );

        if (report.summary.result == UnityEditor.Build.Reporting.BuildResult.Succeeded)
        {
            Debug.Log($"构建成功: {buildPathFull}");
        }
        else
        {
            Debug.LogError($"构建失败: {report.summary.totalErrors} 个错误");
        }
        #endif
    }

    // 获取构建文件名
    private string GetBuildFileName()
    {
        string fileName = GameBuildSettings.Instance.gameTitle.Replace(" ", "_");
        
        switch (buildTarget)
        {
            case BuildTarget.StandaloneWindows:
            case BuildTarget.StandaloneWindows64:
                return fileName + ".exe";
            case BuildTarget.StandaloneOSX:
                return fileName + ".app";
            case BuildTarget.Android:
                return fileName + ".apk";
            case BuildTarget.iOS:
                return fileName + ".ipa";
            default:
                return fileName + ".exe";
        }
    }

    // 设置目标平台
    public void SetTargetPlatform(BuildTarget newTarget)
    {
        buildTarget = newTarget;
        
        switch (newTarget)
        {
            case BuildTarget.StandaloneWindows:
            case BuildTarget.StandaloneWindows64:
                targetPlatform = BuildTargetGroup.Standalone;
                break;
            case BuildTarget.Android:
                targetPlatform = BuildTargetGroup.Android;
                break;
            case BuildTarget.iOS:
                targetPlatform = BuildTargetGroup.iOS;
                break;
            case BuildTarget.WebGL:
                targetPlatform = BuildTargetGroup.WebGL;
                break;
        }
    }

    // 检查构建先决条件
    public bool CheckBuildPrerequisites()
    {
        #if UNITY_EDITOR
        // 检查是否安装了目标平台的构建支持
        if (!BuildPipeline.IsBuildTargetSupported(buildTarget))
        {
            Debug.LogError($"目标平台 {buildTarget} 不受支持");
            return false;
        }

        // 检查场景文件是否存在
        foreach (string scene in scenesToBuild)
        {
            if (string.IsNullOrEmpty(scene))
            {
                Debug.LogError("场景路径不能为空");
                return false;
            }
        }

        return true;
        #else
        return false;
        #endif
    }
}

// 发布清单
public class ReleaseManifest
{
    public string version;
    public string buildDate;
    public string[] dependencies;
    public string[] assets;
    public string[] scenes;
    public string[] scripts;
    public string[] prefabs;
    public string[] materials;
    public string[] textures;
    public string platform;
    public string architecture;
    public string[] supportedLanguages;
    public string[] requiredPermissions;

    public ReleaseManifest()
    {
        version = Application.version;
        buildDate = System.DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
        platform = Application.platform.ToString();
        architecture = System.Environment.Is64BitProcess ? "x64" : "x86";
    }

    // 生成发布清单
    public static ReleaseManifest GenerateManifest()
    {
        ReleaseManifest manifest = new ReleaseManifest();

        // 收集场景
        manifest.scenes = UnityEngine.SceneManagement.SceneManager.sceneCountInBuildSettings > 0 ?
            new string[UnityEngine.SceneManagement.SceneManager.sceneCountInBuildSettings] : new string[0];

        // 收集资源（简化版本）
        manifest.assets = new string[] { "Assets/", "Resources/", "StreamingAssets/" };

        // 收集脚本（实际项目中需要更复杂的资源分析）
        manifest.scripts = new string[] { "Scripts/", "Editor/" };

        // 收集预制件
        manifest.prefabs = new string[] { "Prefabs/" };

        // 收集材质
        manifest.materials = new string[] { "Materials/" };

        // 收集纹理
        manifest.textures = new string[] { "Textures/" };

        // 支持的语言
        manifest.supportedLanguages = new string[] { "English", "Chinese" }; // 根据项目需要调整

        // 需要的权限（主要用于移动平台）
        manifest.requiredPermissions = new string[] { 
            "Internet", 
            "Storage", 
            "Microphone" // 如果有音频录制功能
        };

        return manifest;
    }
}
```

### 性能优化检查清单

```csharp
using UnityEngine;
using System.Collections.Generic;

// 性能优化检查器
public class PerformanceChecker : MonoBehaviour
{
    [Header("性能监控")]
    public bool enablePerformanceMonitoring = true;
    public float monitorInterval = 1f;
    public int targetFrameRate = 60;
    public float warningThreshold = 0.8f; // 80%目标帧率的阈值

    [Header("优化建议")]
    public bool suggestOptimizations = true;
    public bool autoApplyOptimizations = false;

    private float lastMonitorTime = 0f;
    private List<float> frameTimes = new List<float>();
    private int frameCount = 0;
    private float totalTime = 0f;

    void Update()
    {
        if (enablePerformanceMonitoring && Time.time - lastMonitorTime >= monitorInterval)
        {
            AnalyzePerformance();
            lastMonitorTime = Time.time;
        }
    }

    // 分析性能
    private void AnalyzePerformance()
    {
        float currentFPS = 1.0f / Time.unscaledDeltaTime;
        float averageFPS = frameCount > 0 ? totalTime / frameCount : currentFPS;

        // 检查帧率
        if (currentFPS < targetFrameRate * warningThreshold)
        {
            Debug.LogWarning($"性能警告: 当前FPS {currentFPS:F1}, 低于阈值 {targetFrameRate * warningThreshold:F1}");
            SuggestFPSOptimizations();
        }

        // 检查内存使用
        long memoryUsage = System.GC.GetTotalMemory(false);
        if (memoryUsage > 500 * 1024 * 1024) // 500MB
        {
            Debug.LogWarning($"内存使用警告: {memoryUsage / 1024 / 1024}MB");
            SuggestMemoryOptimizations();
        }

        // 检查Draw Calls
        if (UnityEngine.Rendering.RenderSettings.renderingLayerMask > 1000)
        {
            Debug.LogWarning($"绘制调用过多: {UnityEngine.Rendering.RenderSettings.renderingLayerMask}");
            SuggestDrawCallOptimizations();
        }

        // 记录帧时间
        frameTimes.Add(Time.unscaledDeltaTime);
        if (frameTimes.Count > 60) // 保留最近60帧的数据
        {
            frameTimes.RemoveAt(0);
        }
    }

    // 建议FPS优化
    private void SuggestFPSOptimizations()
    {
        if (!suggestOptimizations) return;

        Debug.Log("FPS优化建议:");
        Debug.Log("1. 检查是否有过多的Update调用");
        Debug.Log("2. 优化物理计算和碰撞检测");
        Debug.Log("3. 减少不必要的对象创建和销毁");
        Debug.Log("4. 使用对象池模式");
        Debug.Log("5. 优化AI和路径寻找算法");
        Debug.Log("6. 减少UI更新频率");
    }

    // 建议内存优化
    private void SuggestMemoryOptimizations()
    {
        if (!suggestOptimizations) return;

        Debug.Log("内存优化建议:");
        Debug.Log("1. 检查是否有内存泄漏");
        Debug.Log("2. 优化纹理和模型的内存占用");
        Debug.Log("3. 使用AssetBundles进行资源管理");
        Debug.Log("4. 及时释放不需要的资源");
        Debug.Log("5. 使用对象池减少GC压力");
        Debug.Log("6. 检查字符串操作，避免频繁拼接");
    }

    // 建议绘制调用优化
    private void SuggestDrawCallOptimizations()
    {
        if (!suggestOptimizations) return;

        Debug.Log("绘制调用优化建议:");
        Debug.Log("1. 启用动态批处理和静态批处理");
        Debug.Log("2. 使用图集合并小纹理");
        Debug.Log("3. 减少材质数量");
        Debug.Log("4. 使用LOD系统");
        Debug.Log("5. 优化光照计算");
        Debug.Log("6. 使用遮挡剔除");
    }

    // 性能报告
    public PerformanceReport GeneratePerformanceReport()
    {
        PerformanceReport report = new PerformanceReport();
        
        report.timestamp = System.DateTime.Now;
        report.targetFrameRate = targetFrameRate;
        report.currentFrameRate = 1.0f / Time.unscaledDeltaTime;
        
        if (frameTimes.Count > 0)
        {
            float sum = 0f;
            foreach (float time in frameTimes)
            {
                sum += time;
            }
            report.averageFrameRate = 1.0f / (sum / frameTimes.Count);
        }
        
        report.memoryUsage = System.GC.GetTotalMemory(false);
        report.totalObjects = FindObjectsOfType<Object>().Length;
        report.drawCalls = UnityEngine.Rendering.RenderSettings.renderingLayerMask;
        
        return report;
    }

    // 性能报告数据结构
    [System.Serializable]
    public class PerformanceReport
    {
        public System.DateTime timestamp;
        public int targetFrameRate;
        public float currentFrameRate;
        public float averageFrameRate;
        public long memoryUsage; // 字节
        public int totalObjects;
        public int drawCalls;
        public string[] optimizationSuggestions;
        public bool isOptimal;
    }
}

// 资源优化工具
public class ResourceOptimizer : MonoBehaviour
{
    [Header("纹理优化")]
    public bool compressTextures = true;
    public int maxTextureSize = 2048;
    public TextureFormat targetFormat = TextureFormat.RGBA32;

    [Header("模型优化")]
    public bool optimizeMeshes = true;
    public float maxPolygonCount = 10000f;
    public bool useLODs = true;

    [Header("音频优化")]
    public bool compressAudio = true;
    public AudioCompressionFormat compressionFormat = AudioCompressionFormat.PCM;

    // 优化纹理
    public void OptimizeTextures()
    {
        #if UNITY_EDITOR
        // 获取所有纹理资源
        string[] textureGUIDs = UnityEditor.AssetDatabase.FindAssets("t:Texture2D");
        
        foreach (string guid in textureGUIDs)
        {
            string path = UnityEditor.AssetDatabase.GUIDToAssetPath(guid);
            UnityEditor.TextureImporter importer = 
                UnityEditor.AssetImporter.GetAtPath(path) as UnityEditor.TextureImporter;
            
            if (importer != null)
            {
                // 设置压缩
                if (compressTextures)
                {
                    importer.compressionQuality = UnityEditor.TextureImporterCompression.High;
                }
                
                // 设置最大尺寸
                importer.maxTextureSize = Mathf.Min(importer.maxTextureSize, maxTextureSize);
                
                // 应用更改
                importer.SaveAndReimport();
            }
        }
        
        Debug.Log($"纹理优化完成，处理了 {textureGUIDs.Length} 个纹理");
        #endif
    }

    // 优化模型
    public void OptimizeModels()
    {
        #if UNITY_EDITOR
        // 获取所有模型资源
        string[] modelGUIDs = UnityEditor.AssetDatabase.FindAssets("t:Model");
        
        foreach (string guid in modelGUIDs)
        {
            string path = UnityEditor.AssetDatabase.GUIDToAssetPath(guid);
            UnityEditor.ModelImporter importer = 
                UnityEditor.AssetImporter.GetAtPath(path) as UnityEditor.ModelImporter;
            
            if (importer != null)
            {
                // 设置网格优化
                if (optimizeMeshes)
                {
                    importer.optimizeMeshVertices = true;
                    importer.optimizeMeshIndices = true;
                }
                
                // 设置动画压缩
                importer.animationCompression = UnityEditor.ModelImporterAnimationCompression.Optimal;
                
                // 应用更改
                importer.SaveAndReimport();
            }
        }
        
        Debug.Log($"模型优化完成，处理了 {modelGUIDs.Length} 个模型");
        #endif
    }

    // 优化音频
    public void OptimizeAudio()
    {
        #if UNITY_EDITOR
        // 获取所有音频资源
        string[] audioGUIDs = UnityEditor.AssetDatabase.FindAssets("t:AudioClip");
        
        foreach (string guid in audioGUIDs)
        {
            string path = UnityEditor.AssetDatabase.GUIDToAssetPath(guid);
            UnityEditor.AudioImporter importer = 
                UnityEditor.AssetImporter.GetAtPath(path) as UnityEditor.AudioImporter;
            
            if (importer != null)
            {
                // 设置压缩
                if (compressAudio)
                {
                    importer.compressionFormat = compressionFormat;
                    importer.quality = 0.5f; // 中等质量
                }
                
                // 设置3D音效
                importer.forceToMono = false; // 根据需要设置
                
                // 应用更改
                importer.SaveAndReimport();
            }
        }
        
        Debug.Log($"音频优化完成，处理了 {audioGUIDs.Length} 个音频文件");
        #endif
    }

    // 一键优化所有资源
    public void OptimizeAllResources()
    {
        OptimizeTextures();
        OptimizeModels();
        OptimizeAudio();
        
        Debug.Log("所有资源优化完成！");
    }
}
```

---

## 项目总结与扩展

### 项目总结

```csharp
// 项目总结和最佳实践
public class ProjectSummary : MonoBehaviour
{
    [Header("项目结构总结")]
    public string projectName = "Game Project";
    public string projectVersion = "1.0.0";
    public string developmentTeam = "Development Team";
    public string projectDuration = "3 months";

    [Header("技术栈总结")]
    public string engineVersion = "Unity 2022.3 LTS";
    public string programmingLanguage = "C#";
    public string targetPlatforms = "Windows, Android, iOS";
    public string thirdPartyAssets = "TextMeshPro, Post Processing, DOTween";

    [Header("功能模块")]
    public List<FeatureModule> implementedModules = new List<FeatureModule>();
    public List<FeatureModule> plannedModules = new List<FeatureModule>();

    [Header("性能指标")]
    public PerformanceMetrics performanceMetrics = new PerformanceMetrics();

    [Header("代码质量")]
    public CodeQualityMetrics codeQuality = new CodeQualityMetrics();

    // 功能模块信息
    [System.Serializable]
    public class FeatureModule
    {
        public string moduleName;
        public string description;
        public string status; // Implemented, In Progress, Planned
        public string implementationDate;
        public string developer;
        public string complexity; // Low, Medium, High
        public string performanceImpact; // Low, Medium, High
    }

    // 性能指标
    [System.Serializable]
    public class PerformanceMetrics
    {
        public float averageFrameRate = 60f;
        public float minimumFrameRate = 30f;
        public long peakMemoryUsage = 500 * 1024 * 1024; // 500MB
        public int drawCallCount = 100;
        public int batchCount = 50;
        public string testScenarios;
    }

    // 代码质量指标
    [System.Serializable]
    public class CodeQualityMetrics
    {
        public int totalLinesOfCode = 10000;
        public int totalClasses = 50;
        public int totalMethods = 200;
        public float codeCoverage = 0.8f; // 80%
        public int codeViolations = 5;
        public string codeStandards = "Unity C# Coding Standards";
        public string documentationCoverage = "70%";
    }

    // 生成项目总结报告
    public ProjectReport GenerateProjectReport()
    {
        ProjectReport report = new ProjectReport();
        
        report.projectName = projectName;
        report.version = projectVersion;
        report.duration = projectDuration;
        report.team = developmentTeam;
        
        report.engineVersion = engineVersion;
        report.language = programmingLanguage;
        report.platforms = targetPlatforms;
        report.assets = thirdPartyAssets;
        
        report.implementedFeatures = implementedModules.Count;
        report.plannedFeatures = plannedModules.Count;
        
        report.performance = performanceMetrics;
        report.codeQuality = codeQuality;
        
        report.completionPercentage = CalculateCompletionPercentage();
        report.riskAssessment = PerformRiskAssessment();
        report.recommendations = GenerateRecommendations();
        
        return report;
    }

    // 计算完成百分比
    private float CalculateCompletionPercentage()
    {
        int totalFeatures = implementedModules.Count + plannedModules.Count;
        return totalFeatures > 0 ? (float)implementedModules.Count / totalFeatures * 100 : 0;
    }

    // 执行风险评估
    private RiskAssessment PerformRiskAssessment()
    {
        RiskAssessment assessment = new RiskAssessment();
        
        // 性能风险
        if (performanceMetrics.averageFrameRate < 30)
        {
            assessment.performanceRisk = RiskLevel.High;
        }
        else if (performanceMetrics.averageFrameRate < 50)
        {
            assessment.performanceRisk = RiskLevel.Medium;
        }
        else
        {
            assessment.performanceRisk = RiskLevel.Low;
        }

        // 内存风险
        if (performanceMetrics.peakMemoryUsage > 1000 * 1024 * 1024) // 1GB
        {
            assessment.memoryRisk = RiskLevel.High;
        }
        else if (performanceMetrics.peakMemoryUsage > 500 * 1024 * 1024) // 500MB
        {
            assessment.memoryRisk = RiskLevel.Medium;
        }
        else
        {
            assessment.memoryRisk = RiskLevel.Low;
        }

        // 代码质量风险
        if (codeQuality.codeCoverage < 0.5f) // 50%
        {
            assessment.codeQualityRisk = RiskLevel.High;
        }
        else if (codeQuality.codeCoverage < 0.7f) // 70%
        {
            assessment.codeQualityRisk = RiskLevel.Medium;
        }
        else
        {
            assessment.codeQualityRisk = RiskLevel.Low;
        }

        return assessment;
    }

    // 生成建议
    private List<string> GenerateRecommendations()
    {
        List<string> recommendations = new List<string>();

        if (performanceMetrics.averageFrameRate < 50)
        {
            recommendations.Add("优化游戏性能，目标平均帧率提升至50以上");
        }

        if (performanceMetrics.peakMemoryUsage > 500 * 1024 * 1024)
        {
            recommendations.Add("优化内存使用，减少峰值内存占用");
        }

        if (codeQuality.codeCoverage < 0.7f)
        {
            recommendations.Add("增加单元测试覆盖，目标覆盖率提升至70%以上");
        }

        if (implementedModules.Count == 0)
        {
            recommendations.Add("开始实施核心功能模块");
        }

        return recommendations;
    }
}

// 项目报告
[System.Serializable]
public class ProjectReport
{
    public string projectName;
    public string version;
    public string duration;
    public string team;
    public string engineVersion;
    public string language;
    public string platforms;
    public string assets;
    
    public int implementedFeatures;
    public int plannedFeatures;
    
    public ProjectSummary.PerformanceMetrics performance;
    public ProjectSummary.CodeQualityMetrics codeQuality;
    
    public float completionPercentage;
    public RiskAssessment riskAssessment;
    public List<string> recommendations = new List<string>();
    public System.DateTime reportGenerated = System.DateTime.Now;
}

// 风险评估
[System.Serializable]
public class RiskAssessment
{
    public RiskLevel performanceRisk = RiskLevel.Unknown;
    public RiskLevel memoryRisk = RiskLevel.Unknown;
    public RiskLevel codeQualityRisk = RiskLevel.Unknown;
    public RiskLevel scheduleRisk = RiskLevel.Unknown;
    public RiskLevel featureRisk = RiskLevel.Unknown;
}

public enum RiskLevel
{
    Unknown,
    Low,
    Medium,
    High
}
```

### 扩展建议

```csharp
// 项目扩展建议
public class ProjectExtensionGuide : MonoBehaviour
{
    [Header("扩展方向")]
    public List<ExtensionArea> extensionAreas = new List<ExtensionArea>();

    [Header("技术升级路径")]
    public List<TechnologyUpgrade> technologyUpgrades = new List<TechnologyUpgrade>();

    [Header("功能扩展")]
    public List<FeatureExtension> featureExtensions = new List<FeatureExtension>();

    // 扩展领域
    [System.Serializable]
    public class ExtensionArea
    {
        public string areaName;
        public string description;
        public Priority priority;
        public Complexity complexity;
        public float estimatedTime; // 周
        public string dependencies;
        public string benefits;
        public string risks;
    }

    // 技术升级
    [System.Serializable]
    public class TechnologyUpgrade
    {
        public string technologyName;
        public string currentVersion;
        public string targetVersion;
        public string benefits;
        public string risks;
        public float estimatedTime;
        public string implementationSteps;
    }

    // 功能扩展
    [System.Serializable]
    public class FeatureExtension
    {
        public string featureName;
        public string description;
        public string implementationPlan;
        public string resourceRequirements;
        public float estimatedDevelopmentTime;
        public float estimatedTestingTime;
        public string successMetrics;
    }

    public enum Priority
    {
        Low,
        Medium,
        High,
        Critical
    }

    public enum Complexity
    {
        Simple,
        Moderate,
        Complex,
        VeryComplex
    }

    // 获取扩展建议
    public ExtensionRecommendation GetExtensionRecommendations()
    {
        ExtensionRecommendation recommendation = new ExtensionRecommendation();

        // 分析当前项目状态
        AnalyzeCurrentState(recommendation);

        // 生成扩展建议
        GenerateExpansionSuggestions(recommendation);

        // 评估实施难度
        EvaluateImplementationDifficulty(recommendation);

        return recommendation;
    }

    // 分析当前状态
    private void AnalyzeCurrentState(ExtensionRecommendation recommendation)
    {
        // 分析性能指标
        PerformanceChecker perfChecker = FindObjectOfType<PerformanceChecker>();
        if (perfChecker != null)
        {
            PerformanceChecker.PerformanceReport report = perfChecker.GeneratePerformanceReport();
            
            if (report.averageFrameRate < 50)
            {
                recommendation.performanceOptimizationNeeded = true;
            }
            
            if (report.memoryUsage > 500 * 1024 * 1024)
            {
                recommendation.memoryOptimizationNeeded = true;
            }
        }

        // 分析代码质量
        // 这里可以集成代码分析工具的输出
    }

    // 生成扩展建议
    private void GenerateExpansionSuggestions(ExtensionRecommendation recommendation)
    {
        // 根据游戏类型生成建议
        if (FindObjectOfType<TowerDefenseManager>() != null)
        {
            // 塔防游戏扩展建议
            recommendation.suggestedExtensions.Add("更多塔类型和升级路径");
            recommendation.suggestedExtensions.Add("更多敌人类型和特殊能力");
            recommendation.suggestedExtensions.Add("多人合作模式");
            recommendation.suggestedExtensions.Add("地图编辑器");
        }
        else if (FindObjectOfType<RPGGameManager>() != null)
        {
            // RPG游戏扩展建议
            recommendation.suggestedExtensions.Add("更多职业和技能树");
            recommendation.suggestedExtensions.Add("宠物/伙伴系统");
            recommendation.suggestedExtensions.Add("公会/社交系统");
            recommendation.suggestedExtensions.Add("更多装备和制作系统");
        }
        else if (FindObjectOfType<PlatformerGameManager>() != null)
        {
            // 平台游戏扩展建议
            recommendation.suggestedExtensions.Add("更多关卡和挑战模式");
            recommendation.suggestedExtensions.Add("角色自定义系统");
            recommendation.suggestedExtensions.Add("关卡分享功能");
            recommendation.suggestedExtensions.Add("成就和排行榜系统");
        }
    }

    // 评估实施难度
    private void EvaluateImplementationDifficulty(ExtensionRecommendation recommendation)
    {
        // 根据项目复杂度和团队能力评估
        int totalFeatures = GetImplementedFeaturesCount();
        float complexityScore = CalculateComplexityScore();
        
        if (complexityScore > 0.8f)
        {
            recommendation.implementationDifficulty = Difficulty.High;
            recommendation.requiresSeniorDevelopers = true;
        }
        else if (complexityScore > 0.5f)
        {
            recommendation.implementationDifficulty = Difficulty.Medium;
        }
        else
        {
            recommendation.implementationDifficulty = Difficulty.Low;
        }
    }

    // 获取已实现功能数量
    private int GetImplementedFeaturesCount()
    {
        int count = 0;
        
        // 计算各种系统实现的数量
        if (FindObjectOfType<RPGBattleSystem>() != null) count++;
        if (FindObjectOfType<RPGQuestSystem>() != null) count++;
        if (FindObjectOfType<RPGInventorySystem>() != null) count++;
        if (FindObjectOfType<RPGBattleSystem>() != null) count++;
        
        return count;
    }

    // 计算复杂度评分
    private float CalculateComplexityScore()
    {
        // 简化的复杂度计算
        int totalSystems = 10; // 假设项目应该有10个主要系统
        int implementedSystems = GetImplementedFeaturesCount();
        
        return (float)implementedSystems / totalSystems;
    }
}

// 扩展建议数据结构
[System.Serializable]
public class ExtensionRecommendation
{
    public List<string> suggestedExtensions = new List<string>();
    public List<string> technologyUpgrades = new List<string>();
    public List<string> featurePriorities = new List<string>();
    
    public bool performanceOptimizationNeeded = false;
    public bool memoryOptimizationNeeded = false;
    public bool codeRefactoringNeeded = false;
    public bool architectureImprovementNeeded = false;
    
    public Difficulty implementationDifficulty = Difficulty.Unknown;
    public bool requiresSeniorDevelopers = false;
    public float estimatedTimeToImplement = 0f; // 月
    
    public string implementationPlan;
    public string resourceRequirements;
    public string riskAssessment;
}

public enum Difficulty
{
    Unknown,
    Low,
    Medium,
    High
}

// 项目维护指南
public class ProjectMaintenanceGuide : MonoBehaviour
{
    [Header("维护计划")]
    public List<MaintenanceTask> maintenanceTasks = new List<MaintenanceTask>();
    public float maintenanceInterval = 30f; // 天
    public bool autoMaintenance = false;

    [System.Serializable]
    public class MaintenanceTask
    {
        public string taskName;
        public string description;
        public MaintenanceType type;
        public float interval; // 天
        public System.DateTime lastRun;
        public bool isEnabled = true;
    }

    public enum MaintenanceType
    {
        PerformanceOptimization,
        CodeRefactoring,
        BugFixing,
        FeatureUpdate,
        SecurityUpdate,
        CompatibilityCheck
    }

    // 执行维护任务
    public void PerformMaintenance()
    {
        foreach (MaintenanceTask task in maintenanceTasks)
        {
            if (task.isEnabled && 
                (task.lastRun == System.DateTime.MinValue || 
                 System.DateTime.Now.Subtract(task.lastRun).TotalDays >= task.interval))
            {
                ExecuteMaintenanceTask(task);
                task.lastRun = System.DateTime.Now;
            }
        }
    }

    // 执行特定维护任务
    private void ExecuteMaintenanceTask(MaintenanceTask task)
    {
        switch (task.type)
        {
            case MaintenanceType.PerformanceOptimization:
                OptimizePerformance();
                break;
            case MaintenanceType.CodeRefactoring:
                RefactorCode();
                break;
            case MaintenanceType.BugFixing:
                FixBugs();
                break;
            case MaintenanceType.FeatureUpdate:
                UpdateFeatures();
                break;
            case MaintenanceType.SecurityUpdate:
                UpdateSecurity();
                break;
            case MaintenanceType.CompatibilityCheck:
                CheckCompatibility();
                break;
        }
    }

    // 各种维护操作
    private void OptimizePerformance()
    {
        // 性能优化操作
        System.GC.Collect();
        // 这里可以集成性能分析工具
    }

    private void RefactorCode()
    {
        // 代码重构操作
        // 这里可以集成代码分析和重构工具
    }

    private void FixBugs()
    {
        // Bug修复操作
        // 收集和修复已知问题
    }

    private void UpdateFeatures()
    {
        // 功能更新操作
        // 根据用户反馈更新功能
    }

    private void UpdateSecurity()
    {
        // 安全更新操作
        // 更新依赖库和修复安全漏洞
    }

    private void CheckCompatibility()
    {
        // 兼容性检查操作
        // 检查在新平台或新版本下的兼容性
    }
}
```

---

## 实践练习

### 练习1: 完整的RPG角色创建系统

```csharp
using UnityEngine;
using UnityEngine.UI;
using System.Collections.Generic;

// RPG角色创建系统
public class RPGCharacterCreator : MonoBehaviour
{
    [Header("角色创建UI")]
    public GameObject characterCreationPanel;
    public InputField characterNameInput;
    public Dropdown characterClassDropdown;
    public Slider[] attributeSliders = new Slider[5]; // 力量、敏捷、智力、体质、运气
    public Text[] attributeTexts = new Text[5];
    public Text totalPointsText;
    public Button createCharacterButton;
    public Button resetButton;

    [Header("预设角色")]
    public List<PresetCharacter> presetCharacters = new List<PresetCharacter>();

    [Header("角色预览")]
    public GameObject characterPreview;
    public Image characterPortrait;

    private int totalAttributePoints = 25;
    private int remainingPoints = 25;
    private int[] attributeValues = new int[5]; // 力量、敏捷、智力、体质、运气

    void Start()
    {
        InitializeCharacterCreator();
    }

    private void InitializeCharacterCreator()
    {
        // 设置职业下拉菜单
        if (characterClassDropdown != null)
        {
            characterClassDropdown.ClearOptions();
            List<string> classOptions = new List<string>();
            
            foreach (CharacterClassType classType in System.Enum.GetValues(typeof(CharacterClassType)))
            {
                classOptions.Add(classType.ToString());
            }
            
            characterClassDropdown.AddOptions(classOptions);
        }

        // 初始化属性滑块
        for (int i = 0; i < attributeSliders.Length; i++)
        {
            int index = i; // 用于闭包
            attributeSliders[i].minValue = 1;
            attributeSliders[i].maxValue = 10;
            attributeSliders[i].value = 5;
            attributeValues[i] = 5;
            
            attributeSliders[i].onValueChanged.AddListener(delegate { OnAttributeChanged(index); });
        }

        UpdateUI();
    }

    // 属性改变事件
    private void OnAttributeChanged(int attributeIndex)
    {
        int oldValue = attributeValues[attributeIndex];
        int newValue = Mathf.RoundToInt(attributeSliders[attributeIndex].value);
        
        int difference = newValue - oldValue;
        remainingPoints -= difference;
        attributeValues[attributeIndex] = newValue;

        // 确保不会超出点数限制
        if (remainingPoints < 0)
        {
            // 撤销更改
            attributeSliders[attributeIndex].value = oldValue;
            attributeValues[attributeIndex] = oldValue;
            remainingPoints += difference;
        }
        else
        {
            UpdateUI();
        }
    }

    // 更新UI显示
    private void UpdateUI()
    {
        // 更新属性文本
        string[] attributeNames = { "Strength", "Dexterity", "Intelligence", "Constitution", "Luck" };
        
        for (int i = 0; i < attributeTexts.Length && i < attributeNames.Length; i++)
        {
            if (attributeTexts[i] != null)
            {
                attributeTexts[i].text = $"{attributeNames[i]}: {attributeValues[i]}";
            }
        }

        // 更新剩余点数显示
        if (totalPointsText != null)
        {
            totalPointsText.text = $"Remaining Points: {remainingPoints}";
        }

        // 更新创建按钮状态
        if (createCharacterButton != null)
        {
            createCharacterButton.interactable = remainingPoints >= 0 && 
                                               !string.IsNullOrEmpty(characterNameInput.text) &&
                                               characterNameInput.text.Length >= 3;
        }
    }

    // 重置属性点数
    public void ResetAttributes()
    {
        for (int i = 0; i < attributeSliders.Length; i++)
        {
            attributeSliders[i].value = 5;
            attributeValues[i] = 5;
        }
        
        remainingPoints = totalAttributePoints - (5 * attributeSliders.Length);
        UpdateUI();
    }

    // 应用预设角色
    public void ApplyPresetCharacter(int presetIndex)
    {
        if (presetIndex >= 0 && presetIndex < presetCharacters.Count)
        {
            PresetCharacter preset = presetCharacters[presetIndex];
            
            // 设置职业
            if (characterClassDropdown != null)
            {
                int classIndex = (int)preset.characterClass;
                characterClassDropdown.value = classIndex;
            }

            // 设置属性
            for (int i = 0; i < attributeSliders.Length && i < preset.attributeValues.Length; i++)
            {
                attributeSliders[i].value = preset.attributeValues[i];
                attributeValues[i] = preset.attributeValues[i];
            }

            // 计算剩余点数
            int usedPoints = 0;
            foreach (int value in preset.attributeValues)
            {
                usedPoints += value;
            }
            remainingPoints = totalAttributePoints - usedPoints;

            UpdateUI();
        }
    }

    // 创建角色
    public void CreateCharacter()
    {
        if (remainingPoints < 0)
        {
            Debug.LogWarning("Not enough attribute points!");
            return;
        }

        string characterName = characterNameInput.text;
        CharacterClassType selectedClass = (CharacterClassType)characterClassDropdown.value;

        // 创建角色数据
        PlayerCharacter newCharacter = new PlayerCharacter();
        newCharacter.Initialize(characterName, selectedClass);

        // 设置属性
        newCharacter.strength = attributeValues[0];
        newCharacter.dexterity = attributeValues[1];
        newCharacter.intelligence = attributeValues[2];
        newCharacter.constitution = attributeValues[3];
        newCharacter.luck = attributeValues[4];

        // 应用职业修正
        CharacterClass charClass = RPGGameManager.Instance.GetCharacterClass(selectedClass);
        if (charClass != null)
        {
            newCharacter.strength = Mathf.RoundToInt(newCharacter.strength * charClass.strengthGrowth);
            newCharacter.dexterity = Mathf.RoundToInt(newCharacter.dexterity * charClass.dexterityGrowth);
            newCharacter.intelligence = Mathf.RoundToInt(newCharacter.intelligence * charClass.intelligenceGrowth);
            newCharacter.constitution = Mathf.RoundToInt(newCharacter.constitution * charClass.constitutionGrowth);
            newCharacter.luck = Mathf.RoundToInt(newCharacter.luck * charClass.luckGrowth);

            // 设置生命值和法力值
            newCharacter.maxHealth = Mathf.RoundToInt(100 * charClass.healthMultiplier) + 
                                   (newCharacter.constitution - 10) * 10;
            newCharacter.currentHealth = newCharacter.maxHealth;
            newCharacter.maxMana = Mathf.RoundToInt(50 * charClass.manaMultiplier) + 
                                 (newCharacter.intelligence - 10) * 5;
            newCharacter.currentMana = newCharacter.maxMana;
        }

        // 设置为当前玩家角色
        RPGGameManager.Instance.player = newCharacter;

        // 隐藏创建面板
        if (characterCreationPanel != null)
        {
            characterCreationPanel.SetActive(false);
        }

        // 触发角色创建完成事件
        OnCharacterCreated(newCharacter);
    }

    // 角色创建完成事件
    private void OnCharacterCreated(PlayerCharacter character)
    {
        Debug.Log($"Character '{character.characterName}' created successfully!");
        
        // 播放创建成功音效
        if (RPGAudioManager.Instance != null)
        {
            RPGAudioManager.Instance.PlaySFX("CharacterCreate");
        }

        // 可以在这里添加角色进入游戏世界的逻辑
    }

    // 预设角色数据
    [System.Serializable]
    public class PresetCharacter
    {
        public string presetName;
        public CharacterClassType characterClass;
        public int[] attributeValues = new int[5]; // 力量、敏捷、智力、体质、运气
    }
}
```

### 练习2: 动态关卡生成系统

```csharp
using UnityEngine;
using System.Collections.Generic;

// 动态关卡生成系统
public class DynamicLevelGenerator : MonoBehaviour
{
    [Header("关卡设置")]
    public int levelWidth = 50;
    public int levelHeight = 50;
    public int seed = 0;
    public bool useRandomSeed = true;

    [Header("地形生成")]
    public float terrainScale = 20f;
    public float waterLevel = 0.3f;
    public float mountainLevel = 0.7f;

    [Header("房间设置")]
    public int minRooms = 5;
    public int maxRooms = 10;
    public int minRoomSize = 4;
    public int maxRoomSize = 10;

    [Header("走廊设置")]
    public bool generateCorridors = true;
    public float corridorWidth = 1f;

    [Header("敌人生成")]
    public List<EnemySpawnData> enemySpawns = new List<EnemySpawnData>();
    public float enemySpawnRate = 0.3f;

    [Header("物品生成")]
    public List<ItemSpawnData> itemSpawns = new List<ItemSpawnData>();
    public float itemSpawnRate = 0.2f;

    [Header("预制件")]
    public GameObject floorPrefab;
    public GameObject wallPrefab;
    public GameObject waterPrefab;
    public GameObject doorPrefab;
    public List<GameObject> enemyPrefabs = new List<GameObject>();
    public List<GameObject> itemPrefabs = new List<GameObject>();

    private System.Random random;
    private List<Room> rooms = new List<Room>();
    private List<Corridor> corridors = new List<Corridor>();
    private bool[,] levelMap;

    [System.Serializable]
    public class EnemySpawnData
    {
        public string enemyType;
        public float spawnChance = 1f;
        public int minLevel = 1;
        public int maxLevel = 10;
    }

    [System.Serializable]
    public class ItemSpawnData
    {
        public string itemType;
        public float spawnChance = 1f;
        public int minLevel = 1;
        public int maxLevel = 10;
    }

    [System.Serializable]
    public class Room
    {
        public int x, y, width, height;
        public int centerX, centerY;
    }

    [System.Serializable]
    public class Corridor
    {
        public int startX, startY, endX, endY;
    }

    void Start()
    {
        GenerateLevel();
    }

    // 生成关卡
    public void GenerateLevel()
    {
        // 设置随机种子
        if (useRandomSeed)
        {
            seed = System.DateTime.Now.Millisecond;
        }
        random = new System.Random(seed);

        // 初始化地图
        levelMap = new bool[levelWidth, levelHeight];

        // 生成房间
        GenerateRooms();

        // 连接房间
        if (generateCorridors)
        {
            GenerateCorridors();
        }

        // 生成地形
        GenerateTerrain();

        // 生成敌人
        SpawnEnemies();

        // 生成物品
        SpawnItems();

        // 在编辑器中可视化地图
        VisualizeLevel();
    }

    // 生成房间
    private void GenerateRooms()
    {
        rooms.Clear();
        int numRooms = random.Next(minRooms, maxRooms + 1);

        for (int i = 0; i < numRooms; i++)
        {
            int width = random.Next(minRoomSize, maxRoomSize + 1);
            int height = random.Next(minRoomSize, maxRoomSize + 1);
            int x = random.Next(1, levelWidth - width - 1);
            int y = random.Next(1, levelHeight - height - 1);

            Room newRoom = new Room
            {
                x = x,
                y = y,
                width = width,
                height = height,
                centerX = x + width / 2,
                centerY = y + height / 2
            };

            // 检查是否与现有房间重叠
            bool overlaps = false;
            foreach (Room otherRoom in rooms)
            {
                if (RectanglesIntersect(newRoom, otherRoom))
                {
                    overlaps = true;
                    break;
                }
            }

            if (!overlaps)
            {
                rooms.Add(newRoom);

                // 标记房间区域
                for (int xi = newRoom.x; xi < newRoom.x + newRoom.width; xi++)
                {
                    for (int yi = newRoom.y; yi < newRoom.y + newRoom.height; yi++)
                    {
                        if (xi >= 0 && xi < levelWidth && yi >= 0 && yi < levelHeight)
                        {
                            levelMap[xi, yi] = true;
                        }
                    }
                }
            }
        }
    }

    // 生成走廊
    private void GenerateCorridors()
    {
        corridors.Clear();

        for (int i = 0; i < rooms.Count - 1; i++)
        {
            Room currentRoom = rooms[i];
            Room nextRoom = rooms[i + 1];

            // H型走廊
            int x1 = currentRoom.centerX;
            int y1 = currentRoom.centerY;
            int x2 = nextRoom.centerX;
            int y2 = nextRoom.centerY;

            // 水平走廊
            int minX = Mathf.Min(x1, x2);
            int maxX = Mathf.Max(x1, x2);
            for (int x = minX; x <= maxX; x++)
            {
                if (x >= 0 && x < levelWidth && y1 >= 0 && y1 < levelHeight)
                {
                    levelMap[x, y1] = true;
                }
            }

            // 垂直走廊
            int minY = Mathf.Min(y1, y2);
            int maxY = Mathf.Max(y1, y2);
            for (int y = minY; y <= maxY; y++)
            {
                if (x2 >= 0 && x2 < levelWidth && y >= 0 && y < levelHeight)
                {
                    levelMap[x2, y] = true;
                }
            }

            corridors.Add(new Corridor { startX = x1, startY = y1, endX = x2, endY = y2 });
        }
    }

    // 生成地形
    private void GenerateTerrain()
    {
        for (int x = 0; x < levelWidth; x++)
        {
            for (int y = 0; y < levelHeight; y++)
            {
                if (!levelMap[x, y])
                {
                    // 使用噪声生成自然地形
                    float noise = Mathf.PerlinNoise(
                        (float)x / terrainScale + seed, 
                        (float)y / terrainScale + seed
                    );

                    if (noise < waterLevel)
                    {
                        // 水域
                        levelMap[x, y] = false; // 保持为false，表示不可通行
                    }
                    else if (noise > mountainLevel)
                    {
                        // 山地，不可通行
                        levelMap[x, y] = false;
                    }
                    else
                    {
                        // 普通地面，可通行
                        levelMap[x, y] = true;
                    }
                }
            }
        }
    }

    // 生成敌人
    private void SpawnEnemies()
    {
        for (int x = 0; x < levelWidth; x++)
        {
            for (int y = 0; y < levelHeight; y++)
            {
                if (levelMap[x, y] && random.NextDouble() < enemySpawnRate)
                {
                    // 选择敌人类型
                    if (enemyPrefabs.Count > 0)
                    {
                        int enemyIndex = random.Next(enemyPrefabs.Count);
                        GameObject enemyPrefab = enemyPrefabs[enemyIndex];

                        Vector3 spawnPos = new Vector3(x, 0, y);
                        GameObject enemy = Instantiate(enemyPrefab, spawnPos, Quaternion.identity);
                        
                        // 设置敌人属性（等级等）
                        Enemy enemyScript = enemy.GetComponent<Enemy>();
                        if (enemyScript != null)
                        {
                            // 根据关卡调整敌人属性
                            enemyScript.level = Random.Range(1, 5);
                        }
                    }
                }
            }
        }
    }

    // 生成物品
    private void SpawnItems()
    {
        for (int x = 0; x < levelWidth; x++)
        {
            for (int y = 0; y < levelHeight; y++)
            {
                if (levelMap[x, y] && random.NextDouble() < itemSpawnRate)
                {
                    // 选择物品类型
                    if (itemPrefabs.Count > 0)
                    {
                        int itemIndex = random.Next(itemPrefabs.Count);
                        GameObject itemPrefab = itemPrefabs[itemIndex];

                        Vector3 spawnPos = new Vector3(x, 0, y);
                        Instantiate(itemPrefab, spawnPos, Quaternion.identity);
                    }
                }
            }
        }
    }

    // 检查矩形是否相交
    private bool RectanglesIntersect(Room a, Room b)
    {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }

    // 可视化关卡（仅在编辑器中）
    private void VisualizeLevel()
    {
        #if UNITY_EDITOR
        // 清除旧的可视化对象
        foreach (Transform child in transform)
        {
            DestroyImmediate(child.gameObject);
        }

        // 创建可视化对象
        for (int x = 0; x < levelWidth; x++)
        {
            for (int y = 0; y < levelHeight; y++)
            {
                GameObject tile;
                if (levelMap[x, y])
                {
                    // 可通行区域
                    tile = Instantiate(floorPrefab, new Vector3(x, 0, y), Quaternion.identity);
                    tile.name = $"Floor_{x}_{y}";
                }
                else
                {
                    // 不可通行区域
                    tile = Instantiate(wallPrefab, new Vector3(x, 0, y), Quaternion.identity);
                    tile.name = $"Wall_{x}_{y}";
                }
                
                tile.transform.SetParent(transform);
            }
        }
        #endif
    }

    // 获取随机可通行位置
    public Vector3 GetRandomPassablePosition()
    {
        List<Vector3> passablePositions = new List<Vector3>();

        for (int x = 0; x < levelWidth; x++)
        {
            for (int y = 0; y < levelHeight; y++)
            {
                if (levelMap[x, y])
                {
                    passablePositions.Add(new Vector3(x, 0, y));
                }
            }
        }

        if (passablePositions.Count > 0)
        {
            int randomIndex = random.Next(passablePositions.Count);
            return passablePositions[randomIndex];
        }

        return Vector3.zero; // 如果没有可通行位置，返回原点
    }

    // 检查位置是否可通行
    public bool IsPassable(int x, int y)
    {
        if (x < 0 || x >= levelWidth || y < 0 || y >= levelHeight)
        {
            return false;
        }
        return levelMap[x, y];
    }

    // 生成新关卡
    public void GenerateNewLevel()
    {
        if (useRandomSeed)
        {
            seed = System.DateTime.Now.Millisecond;
        }
        else
        {
            seed = random.Next();
        }
        
        GenerateLevel();
    }

    // 在场景视图中可视化
    void OnDrawGizmos()
    {
        if (levelMap != null)
        {
            for (int x = 0; x < levelWidth; x++)
            {
                for (int y = 0; y < levelHeight; y++)
                {
                    Gizmos.color = levelMap[x, y] ? Color.green : Color.red;
                    Gizmos.DrawCube(new Vector3(x, 0, y), Vector3.one * 0.8f);
                }
            }

            // 绘制房间边界
            Gizmos.color = Color.blue;
            foreach (Room room in rooms)
            {
                Vector3 center = new Vector3(room.x + room.width / 2f, 0, room.y + room.height / 2f);
                Vector3 size = new Vector3(room.width, 0.1f, room.height);
                Gizmos.DrawWireCube(center, size);
            }

            // 绘制走廊
            Gizmos.color = Color.yellow;
            foreach (Corridor corridor in corridors)
            {
                Gizmos.DrawLine(
                    new Vector3(corridor.startX, 0.1f, corridor.startY),
                    new Vector3(corridor.endX, 0.1f, corridor.endY)
                );
            }
        }
    }
}
```

---

## 常见错误和最佳实践

### 1. 性能优化最佳实践

```csharp
using UnityEngine;
using System.Collections.Generic;

// 性能优化最佳实践示例
public class PerformanceBestPractices : MonoBehaviour
{
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

    // ✅ 正确：缓存引用
    private Transform playerTransform;
    private List<Transform> enemyTransforms = new List<Transform>();
    private CharacterController playerController;
    private Renderer playerRenderer;

    void Start()
    {
        // 一次性获取并缓存引用
        GameObject playerObj = GameObject.FindGameObjectWithTag("Player");
        if (playerObj != null)
        {
            playerTransform = playerObj.transform;
            playerController = playerObj.GetComponent<CharacterController>();
            playerRenderer = playerObj.GetComponent<Renderer>();
        }

        // 一次性获取所有敌人引用
        GameObject[] enemyObjs = GameObject.FindGameObjectsWithTag("Enemy");
        foreach (GameObject enemyObj in enemyObjs)
        {
            enemyTransforms.Add(enemyObj.transform);
        }
    }

    void Update()
    {
        // 使用缓存的引用 - 快！
        if (playerTransform != null)
        {
            // 对playerTransform进行操作
        }

        // 使用缓存的组件 - 快！
        if (playerController != null)
        {
            // 对playerController进行操作
        }
    }

    // ❌ 错误：频繁创建和销毁对象
    /*
    void Update()
    {
        GameObject effect = new GameObject(); // 每帧创建新对象
        Destroy(effect, 1f); // 1秒后销毁 - 造成GC压力
    }
    */

    // ✅ 正确：使用对象池
    private Queue<GameObject> effectPool = new Queue<GameObject>();
    private GameObject effectPrefab;

    private GameObject GetEffectFromPool()
    {
        if (effectPool.Count > 0)
        {
            GameObject effect = effectPool.Dequeue();
            effect.SetActive(true);
            return effect;
        }
        else
        {
            return Instantiate(effectPrefab);
        }
    }

    private void ReturnEffectToPool(GameObject effect)
    {
        effect.SetActive(false);
        effect.transform.SetParent(transform); // 归属到池对象下
        effectPool.Enqueue(effect);
    }

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

    // ✅ 正确：预先获取引用
    private List<SomeComponent> childComponents = new List<SomeComponent>();

    void CacheChildComponents()
    {
        childComponents.Clear();
        for (int i = 0; i < transform.childCount; i++)
        {
            SomeComponent component = transform.GetChild(i).GetComponent<SomeComponent>();
            if (component != null)
            {
                childComponents.Add(component);
            }
        }
    }

    // 使用预分配的列表而不是每次都创建新列表
    private List<Collider> tempColliders = new List<Collider>(50); // 预分配容量

    void OptimizedOverlapSphere(Vector3 center, float radius)
    {
        tempColliders.Clear(); // 清空但不重新分配内存
        int count = Physics.OverlapSphereNonAlloc(center, radius, 
            tempColliders.Capacity > 0 ? 
            tempColliders.GetRange(0, tempColliders.Capacity).ToArray() : 
            new Collider[0]);
        
        // 处理碰撞体...
    }

    // 使用对象池的完整示例
    public class ObjectPool<T> where T : Component
    {
        private Queue<T> pool = new Queue<T>();
        private T prefab;
        private Transform parent;

        public ObjectPool(T prefab, int initialSize, Transform parent = null)
        {
            this.prefab = prefab;
            this.parent = parent;

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
                obj = CreateNewObject();
            }
            return obj;
        }

        public void ReturnToPool(T obj)
        {
            obj.gameObject.SetActive(false);
            obj.transform.SetParent(parent);
            pool.Enqueue(obj);
        }

        private T CreateNewObject()
        {
            T obj = GameObject.Instantiate(prefab);
            obj.transform.SetParent(parent);
            obj.gameObject.SetActive(false);
            return obj;
        }
    }

    // 使用对象池
    private ObjectPool<GameObject> bulletPool;

    void InitializeBulletPool()
    {
        GameObject bulletPrefab = Resources.Load<GameObject>("Prefabs/Bullet");
        bulletPool = new ObjectPool<GameObject>(bulletPrefab, 20, transform);
    }

    GameObject SpawnBullet()
    {
        return bulletPool.Get();
    }

    void ReturnBullet(GameObject bullet)
    {
        bulletPool.ReturnToPool(bullet);
    }

    // 优化的字符串操作
    private System.Text.StringBuilder stringBuilder = new System.Text.StringBuilder();

    string BuildStatusString(int health, int mana, int level)
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

    // 优化的协程管理
    private List<Coroutine> activeCoroutines = new List<Coroutine>();

    Coroutine StartManagedCoroutine(System.Collections.IEnumerator routine)
    {
        Coroutine coroutine = StartCoroutine(routine);
        activeCoroutines.Add(coroutine);
        return coroutine;
    }

    void StopManagedCoroutine(Coroutine coroutine)
    {
        if (activeCoroutines.Contains(coroutine))
        {
            StopCoroutine(coroutine);
            activeCoroutines.Remove(coroutine);
        }
    }

    void StopAllManagedCoroutines()
    {
        foreach (Coroutine coroutine in activeCoroutines.ToArray())
        {
            if (coroutine != null)
            {
                StopCoroutine(coroutine);
            }
        }
        activeCoroutines.Clear();
    }

    void OnDestroy()
    {
        StopAllManagedCoroutines();
    }
}

// 占位符组件
public class SomeComponent : MonoBehaviour { }
```

### 2. 内存管理最佳实践

```csharp
using UnityEngine;
using System.Collections.Generic;

// 内存管理最佳实践
public class MemoryManagementBestPractices : MonoBehaviour
{
    // ✅ 使用结构体而不是类（适用于小对象）
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

    // ✅ 预分配列表大小
    private List<GameObject> enemies = new List<GameObject>(100); // 预分配容量
    private Dictionary<int, PositionData> entityData = new Dictionary<int, PositionData>(50); // 预分配容量

    // ✅ 使用Span<T>进行高性能数组操作（C# 7.2+）
    void ProcessArrayWithSpan(int[] array)
    {
        System.Span<int> span = array.AsSpan();
        for (int i = 0; i < span.Length; i++)
        {
            span[i] *= 2; // 直接在栈上操作，无GC
        }
    }

    // ✅ 避免装箱/拆箱
    void AvoidBoxing()
    {
        // ❌ 错误：装箱
        // object boxedInt = 42; // int装箱为object
        // List<object> mixedList = new List<object> { 1, 2, 3, "string" }; // 发生装箱

        // ✅ 正确：使用泛型
        List<int> intList = new List<int> { 1, 2, 3, 4, 5 };
        List<string> stringList = new List<string> { "a", "b", "c" };
    }

    // ✅ 事件系统内存管理
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

    // ✅ 资源管理
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

    // ✅ 组件访问优化
    private Transform cachedTransform;
    private Rigidbody cachedRigidbody;
    private Renderer cachedRenderer;
    private Collider cachedCollider;

    void CacheComponents()
    {
        cachedTransform = transform;
        cachedRigidbody = GetComponent<Rigidbody>();
        cachedRenderer = GetComponent<Renderer>();
        cachedCollider = GetComponent<Collider>();
    }

    void UseCachedComponents()
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

    // ✅ 对象生命周期管理
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

    // ✅ 使用引用而不是值传递大数据结构
    void ProcessLargeData(ref PositionData data)
    {
        // 通过引用传递，避免复制大数据结构
        data.position += Vector3.one;
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

本章我们学习了Unity中完整的项目开发实践：

✅ **2D平台跳跃游戏**: 角色控制、敌人AI、关卡设计、收集系统  
✅ **塔防游戏**: 路径系统、防御塔、敌人波次、经济系统  
✅ **RPG游戏系统**: 角色成长、战斗系统、任务对话、背包商店  
✅ **游戏发布流程**: 构建设置、性能优化、发布清单  
✅ **项目总结扩展**: 项目总结、扩展建议、维护指南  

这些完整的项目示例涵盖了游戏开发的各个方面，从基础的机制实现到完整的系统设计，为实际项目开发提供了全面的参考。

---

## 下一步

继续学习 [09. 最佳实践](09-best-practices.md) →
