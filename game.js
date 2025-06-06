// Game canvas setup with mobile responsiveness and error handling
const canvas = document.getElementById('gameCanvas');
const ctx = canvas?.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');

// Validate critical elements exist
if (!canvas) {
    throw new Error('Game canvas element not found. Please ensure HTML contains element with id="gameCanvas"');
}
if (!ctx) {
    throw new Error('Canvas 2D context not supported. Please use a modern browser.');
}
if (!scoreElement || !livesElement) {
    console.warn('UI elements missing. Game will continue but UI updates may not work.');
}

// Mobile detection and responsive canvas setup
let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
let isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// Canvas dimensions - responsive (constants for better maintainability)
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;
const ASPECT_RATIO = CANVAS_WIDTH / CANVAS_HEIGHT;

let canvasWidth = CANVAS_WIDTH;
let canvasHeight = CANVAS_HEIGHT;
let scaleFactor = 1;

// Mobile control variables with better structure
let mobileControls = {
    left: false,
    right: false,
    jump: false,
    showControls: false,
    
    // Reset all controls
    reset() {
        this.left = false;
        this.right = false;
        this.jump = false;
    },
    
    // Check if any control is active
    isActive() {
        return this.left || this.right || this.jump;
    }
};

// Initialize responsive canvas with error handling
function initResponsiveCanvas() {
    try {
        const container = document.getElementById('gameContainer');
        if (!container) {
            console.error('Game container not found');
            return false;
        }
        
        const containerRect = container.getBoundingClientRect();
        
        // Validate container dimensions
        if (containerRect.width <= 0 || containerRect.height <= 0) {
            console.warn('Container has invalid dimensions, using defaults');
            return false;
        }
        
        // Calculate scale factor to maintain aspect ratio
        let newWidth = containerRect.width;
        let newHeight = containerRect.height;
        
        // Ensure we maintain aspect ratio
        if (newWidth / newHeight > ASPECT_RATIO) {
            newWidth = newHeight * ASPECT_RATIO;
        } else {
            newHeight = newWidth / ASPECT_RATIO;
        }
        
        // Set canvas internal resolution
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        
        // Set canvas display size to fill container properly
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';
        canvas.style.margin = '0 auto';
        
        // Calculate scale factor for game coordinates
        scaleFactor = Math.min(newWidth / canvasWidth, newHeight / canvasHeight);
        
        // Add mobile controls if needed
        if (isMobile || isTouch) {
            addMobileControls();
        }
        
        // Ensure container uses full available space
        const isLandscape = window.innerWidth > window.innerHeight;
        if (isMobile && isLandscape) {
            // Optimize for landscape mobile gaming
            container.style.width = '98vw';
            container.style.height = '75vh';
            container.style.maxHeight = '90vh';
        }
        
        return true;
    } catch (error) {
        console.error('Error initializing responsive canvas:', error);
        return false;
    }
}

// Add mobile touch controls
function addMobileControls() {
    const controlsContainer = document.getElementById('controls');
    
    // Clear existing controls except reload button
    const reloadButton = controlsContainer.querySelector('button');
    controlsContainer.innerHTML = '';
    if (reloadButton) {
        controlsContainer.appendChild(reloadButton);
    }
    
    // Create mobile control buttons container
    const mobileControlsDiv = document.createElement('div');
    mobileControlsDiv.id = 'mobileControls';
    mobileControlsDiv.style.cssText = `
        display: flex;
        gap: 15px;
        margin: 10px 0;
        justify-content: center;
        align-items: center;
        width: 100%;
        max-width: 400px;
    `;
    
    // Left button
    const leftBtn = document.createElement('button');
    leftBtn.textContent = '← LEFT';
    leftBtn.style.cssText = `
        background-color: #e74c3c;
        padding: 15px 20px;
        font-size: 16px;
        font-weight: bold;
        border-radius: 8px;
        min-width: 90px;
        flex: 1;
        max-width: 120px;
    `;
    
    // Jump button (center, larger)
    const jumpBtn = document.createElement('button');
    jumpBtn.textContent = '↑ JUMP';
    jumpBtn.style.cssText = `
        background-color: #27ae60;
        padding: 18px 25px;
        font-size: 18px;
        font-weight: bold;
        border-radius: 8px;
        min-width: 100px;
        flex: 1.2;
        max-width: 140px;
    `;
    
    // Right button
    const rightBtn = document.createElement('button');
    rightBtn.textContent = 'RIGHT →';
    rightBtn.style.cssText = `
        background-color: #e74c3c;
        padding: 15px 20px;
        font-size: 16px;
        font-weight: bold;
        border-radius: 8px;
        min-width: 90px;
        flex: 1;
        max-width: 120px;
    `;
    
    // Add touch event listeners
    addTouchEvents(leftBtn, 'left');
    addTouchEvents(jumpBtn, 'jump');
    addTouchEvents(rightBtn, 'right');
    
    // Arrange buttons: LEFT - JUMP - RIGHT
    // Arrange buttons: LEFT - JUMP - RIGHT (3 buttons only)
    mobileControlsDiv.appendChild(leftBtn);
    mobileControlsDiv.appendChild(jumpBtn);
    mobileControlsDiv.appendChild(rightBtn);
    
    controlsContainer.insertBefore(mobileControlsDiv, controlsContainer.firstChild);
    
    // Show mobile controls indicator
    mobileControls.showControls = true;
    
    // Update instructions for mobile
    const instructions = document.getElementById('instructions');
    if (instructions) {
        instructions.innerHTML = `
            <p><strong>Mobile Controls:</strong> Use LEFT/RIGHT to move, JUMP for single/double jump!</p>
            <p>Defeat enemies by jumping on them. Find and defeat the boss to win!</p>
            <p>Level 1: Strawberry enemies | Level 2: Lava Challenge | Level 3: Cherry enemies | Level 4: Double Boss</p>
        `;
    }
}

// Add touch events to mobile control buttons
function addTouchEvents(button, action) {
    // Prevent default touch behaviors
    button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        mobileControls[action] = true;
        button.style.opacity = '0.7';
        
        // Handle jump action immediately
        if (action === 'jump') {
            handleJumpInput();
        }
    }, { passive: false });
    
    button.addEventListener('touchend', (e) => {
        e.preventDefault();
        mobileControls[action] = false;
        button.style.opacity = '1';
    }, { passive: false });
    
    button.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        mobileControls[action] = false;
        button.style.opacity = '1';
    }, { passive: false });
    
    // Also handle mouse events for testing
    button.addEventListener('mousedown', (e) => {
        e.preventDefault();
        mobileControls[action] = true;
        button.style.opacity = '0.7';
        
        if (action === 'jump') {
            handleJumpInput();
        }
    });
    
    button.addEventListener('mouseup', (e) => {
        e.preventDefault();
        mobileControls[action] = false;
        button.style.opacity = '1';
    });
    
    button.addEventListener('mouseleave', (e) => {
        mobileControls[action] = false;
        button.style.opacity = '1';
    });
}

// Handle jump input (for both keyboard and mobile)
function handleJumpInput() {
    if (!gameRunning) return;
    
    // First jump when on the ground
    if (!player.jumping) {
        player.velocityY = player.jumpPower * speedMultiplier;
        player.jumping = true;
        player.canDoubleJump = doubleJumpEnabled;
    }
    // Double jump when in the air and double jump is available
    else if (player.canDoubleJump && !player.doubleJumping) {
        player.velocityY = player.doubleJumpPower * speedMultiplier;
        player.doubleJumping = true;
        player.canDoubleJump = false;
        createDoubleJumpEffect();
    }
}

// Window resize handler
function handleResize() {
    initResponsiveCanvas();
    
    // Redraw current screen
    if (levelSelectionMode) {
        showMessage("VOOO's Adventure");
    }
}

// Set canvas size to match container with responsiveness
initResponsiveCanvas();

// Add resize event listener
window.addEventListener('resize', handleResize);
window.addEventListener('orientationchange', () => {
    setTimeout(handleResize, 100); // Delay to ensure orientation change is complete
});

// Game constants for better maintainability
const GAME_CONFIG = {
    CANVAS: {
        WIDTH: 800,
        HEIGHT: 500,
        ASPECT_RATIO: 800 / 500
    },
    PLAYER: {
        WIDTH: 50,
        HEIGHT: 70,
        BASE_SPEED: 3.45,
        BASE_JUMP_POWER: -11.5,
        DOUBLE_JUMP_POWER: -13
    },
    PHYSICS: {
        BASE_GRAVITY: 0.46,
        GROUND_LEVEL: 430
    },
    GAME: {
        MAX_LEVEL: 4,
        DEFAULT_LIVES: 3,
        CHEAT_LIVES: 999,
        LEVEL_1_SPEED_MULTIPLIER: 0.85
    },
    ENEMIES: {
        LEVEL_1_COUNT: 15,
        DEFAULT_COUNT: 30,
        LEVEL_1_PLATFORM_CHANCE: 0.2,
        DEFAULT_PLATFORM_CHANCE: 0.4
    },
    BOSS: {
        WIDTH: 100,
        HEIGHT: 120,
        HITS_REQUIRED: 5
    }
};

// Game state management with validation
class GameState {
    constructor() {
        this.gameRunning = false;
        this.score = 0;
        this.lives = GAME_CONFIG.GAME.DEFAULT_LIVES;
        this.currentLevel = 1;
        this.maxLevel = GAME_CONFIG.GAME.MAX_LEVEL;
        this.speedMultiplier = GAME_CONFIG.GAME.LEVEL_1_SPEED_MULTIPLIER;
        this.gravity = GAME_CONFIG.PHYSICS.BASE_GRAVITY;
        this.levelSelectionMode = false;
        this.bossDefeated = false;
        this.secondBossDefeated = false;
        this.doubleJumpEnabled = true;
        this.debugMode = false;
        this.cheatActivated = false;
    }
    
    // Reset game state
    reset() {
        this.gameRunning = false;
        this.score = 0;
        this.lives = this.cheatActivated ? GAME_CONFIG.GAME.CHEAT_LIVES : GAME_CONFIG.GAME.DEFAULT_LIVES;
        this.bossDefeated = false;
        this.secondBossDefeated = false;
        this.updateSpeedMultiplier();
    }
    
    // Update speed multiplier based on current level
    updateSpeedMultiplier() {
        if (this.currentLevel === 1) {
            this.speedMultiplier = GAME_CONFIG.GAME.LEVEL_1_SPEED_MULTIPLIER;
        } else {
            this.speedMultiplier = 1 + ((this.currentLevel - 2) * 0.1);
        }
        this.gravity = GAME_CONFIG.PHYSICS.BASE_GRAVITY * this.speedMultiplier;
    }
    
    // Validate level
    setLevel(level) {
        if (level >= 1 && level <= this.maxLevel) {
            this.currentLevel = level;
            this.updateSpeedMultiplier();
            return true;
        }
        console.warn(`Invalid level: ${level}. Must be between 1 and ${this.maxLevel}`);
        return false;
    }
    
    // Add score with validation
    addScore(points) {
        if (typeof points === 'number' && points >= 0) {
            this.score += points;
            this.updateUI();
        }
    }
    
    // Lose life with validation
    loseLife() {
        if (this.lives > 0) {
            this.lives--;
            this.updateUI();
            return this.lives > 0;
        }
        return false;
    }
    
    // Update UI elements safely
    updateUI() {
        try {
            if (scoreElement) {
                scoreElement.textContent = `Score: ${this.score} | Level: ${this.currentLevel}`;
            }
            if (livesElement) {
                livesElement.textContent = `Lives: ${this.lives}`;
            }
        } catch (error) {
            console.warn('Error updating UI:', error);
        }
    }
}

// Initialize game state
const gameState = new GameState();

// Legacy variables for backward compatibility (will be gradually replaced)
let gameRunning = false;
let score = 0;
let lives = GAME_CONFIG.GAME.DEFAULT_LIVES;
let currentLevel = 1;
let maxLevel = GAME_CONFIG.GAME.MAX_LEVEL;
let speedMultiplier = GAME_CONFIG.GAME.LEVEL_1_SPEED_MULTIPLIER;
let gravity = GAME_CONFIG.PHYSICS.BASE_GRAVITY;
let levelSelectionMode = false;
let bossDefeated = false;
let secondBossDefeated = false;
let doubleJumpEnabled = true;
let debugMode = false;
let cheatActivated = false;
// bossDefeated already declared above - removed duplicate
// secondBossDefeated already declared above - removed duplicate
// doubleJumpEnabled already declared above - removed duplicate
// debugMode already declared above - removed duplicate

// Cheat code variables
let cheatSequence = [];
// cheatActivated already declared above - removed duplicate

// Game assets
const assets = {
    vooo: {
        running: null,
        jumping: null,
        width: 50,
        height: 70,
        spriteWidth: 398, // Actual width of running.png
        spriteHeight: 625, // Actual height of running.png
        jumpSpriteWidth: 431, // Actual width of jumping.png
        jumpSpriteHeight: 780, // Actual height of jumping.png
        frames: 1, // Using just one frame for now to fix blinking
        currentFrame: 0,
        frameCount: 0,
        frameDelay: 8,
        speed: 3.45 * speedMultiplier, // Base speed adjusted by speed multiplier
        facingRight: true,
        isJumping: false
    },
    strawberry: {
        img: null,
        width: 40,
        height: 40,
        spriteWidth: 1024, // Actual width of enemies.png
        spriteHeight: 1024, // Actual height of enemies.png
        frames: 1, // Using just one frame for now
        currentFrame: 0,
        frameCount: 0,
        frameDelay: 15
    },
    cherry: {
        img: null,
        width: 40,
        height: 40,
        spriteWidth: 1024, // Actual width of cherry-enemies.png
        spriteHeight: 1024, // Actual height of cherry-enemies.png
        frames: 1, // Using just one frame for now
        currentFrame: 0,
        frameCount: 0,
        frameDelay: 15
    },
    explosion: {
        particles: [],
        colors: ['#FF4500', '#FF6347', '#FF8C00', '#FFD700', '#FFFF00'], // Fire colors
        duration: 30, // Frames the explosion lasts
        particleCount: 30, // Number of particles per explosion
        particleSize: 5, // Base size of particles
        particleSpeed: 3 // Base speed of particles
    },
    lava: {
        color: '#FF4500', // Bright orange-red
        glowColor: '#FFFF00', // Yellow glow
        animationSpeed: 0.003 // Slowed down for smoother animation
    },
    boss: {
        img: null,
        width: 100,
        height: 120,
        spriteWidth: 1024, // Actual width of boss.png
        spriteHeight: 1024, // Actual height of boss.png
        frames: 1, // Using just one frame for now
        currentFrame: 0,
        frameCount: 0,
        frameDelay: 20,
        hitsRequired: 5,
        invulnerable: false,
        invulnerableTimer: 0
    },
    background: {
        img: null,
        x: 0,
        width: 3200,
        height: 500,
        layers: []
    },
    tiles: {
        img: null,
        size: 40
    }
};

// Player object
const player = {
    x: 100,
    y: 0,
    width: assets.vooo.width,
    height: assets.vooo.height,
    jumping: false,
    doubleJumping: false,
    canDoubleJump: false,
    velocityX: 0,
    velocityY: 0,
    jumpPower: -11.5 * speedMultiplier, // Base jump power adjusted by speed multiplier
    doubleJumpPower: -13 * speedMultiplier, // Stronger jump for double jump
    isAlive: true,
    invulnerable: false,
    invulnerableTimer: 0,
    moveSpeed: 3.45 * speedMultiplier // Base move speed adjusted by speed multiplier
};

// Boss object
const boss = {
    x: 7800,
    y: 0,
    width: assets.boss.width,
    height: assets.boss.height,
    velocityX: 1.725 * speedMultiplier, // Base velocity adjusted by speed multiplier
    velocityY: 0,
    active: true,
    hits: 0,
    invulnerable: false,
    invulnerableTimer: 0,
    jumpPower: -6.9 * speedMultiplier, // Base jump power adjusted by speed multiplier
    type: 'cherry' // Default boss type
};

// Second boss object for level 4
const secondBoss = {
    x: 7600, // Position slightly to the left of the first boss
    y: 0,
    width: assets.boss.width,
    height: assets.boss.height,
    velocityX: -1.725 * speedMultiplier, // Start moving in opposite direction
    velocityY: 0,
    active: false, // Only active in level 4
    hits: 0,
    invulnerable: false,
    invulnerableTimer: 0,
    jumpPower: -6.9 * speedMultiplier,
    type: 'strawberry'
};

// Memory management and object pooling
class ObjectPool {
    constructor(createFn, resetFn, initialSize = 10) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.pool = [];
        this.active = [];
        
        // Pre-allocate objects
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.createFn());
        }
    }
    
    // Get object from pool or create new one
    acquire() {
        let obj;
        if (this.pool.length > 0) {
            obj = this.pool.pop();
        } else {
            obj = this.createFn();
        }
        
        this.active.push(obj);
        return obj;
    }
    
    // Return object to pool
    release(obj) {
        const index = this.active.indexOf(obj);
        if (index > -1) {
            this.active.splice(index, 1);
            this.resetFn(obj);
            this.pool.push(obj);
        }
    }
    
    // Release all active objects
    releaseAll() {
        while (this.active.length > 0) {
            this.release(this.active[0]);
        }
    }
    
    // Get pool statistics
    getStats() {
        return {
            pooled: this.pool.length,
            active: this.active.length,
            total: this.pool.length + this.active.length
        };
    }
}

// Object factories for pooling
const createEnemy = () => ({
    x: 0, y: 0, width: 40, height: 40,
    velocityX: 0, velocityY: 0,
    onPlatform: false, type: 'strawberry',
    active: false, isAlive: true
});

const resetEnemy = (enemy) => {
    enemy.x = 0;
    enemy.y = 0;
    enemy.velocityX = 0;
    enemy.velocityY = 0;
    enemy.onPlatform = false;
    enemy.type = 'strawberry';
    enemy.active = false;
    enemy.isAlive = true;
};

// Explosion factory for pooling (createExplosion function is in explosion.js)
const createExplosionObject = () => ({
    x: 0, y: 0, duration: 0, maxDuration: 30,
    particles: [], active: false
});

const resetExplosion = (explosion) => {
    explosion.x = 0;
    explosion.y = 0;
    explosion.duration = 0;
    explosion.maxDuration = 30;
    explosion.particles = [];
    explosion.active = false;
};

// Initialize object pools
const enemyPool = new ObjectPool(createEnemy, resetEnemy, 50);
const explosionPool = new ObjectPool(createExplosionObject, resetExplosion, 20);

// Memory-efficient game objects with pooling
let platforms = [];
let enemies = []; // Will be replaced with pool system gradually
let obstacles = [];
let explosions = []; // Will be replaced with pool system

// Memory management utilities
class MemoryManager {
    constructor() {
        this.gcInterval = 30000; // 30 seconds
        this.lastGC = 0;
        this.memoryStats = {
            enemies: 0,
            explosions: 0,
            platforms: 0
        };
    }
    
    // Force garbage collection if available (development only)
    forceGC() {
        if (window.gc && debugMode) {
            window.gc();
            console.log('Forced garbage collection');
        }
    }
    
    // Clean up unused objects
    cleanup() {
        const now = performance.now();
        if (now - this.lastGC > this.gcInterval) {
            this.cleanupExplosions();
            this.cleanupEnemies();
            this.updateMemoryStats();
            this.lastGC = now;
            
            if (debugMode) {
                console.log('Memory cleanup performed', this.memoryStats);
            }
        }
    }
    
    // Clean up inactive explosions
    cleanupExplosions() {
        explosions = explosions.filter(explosion => {
            if (!explosion.active || explosion.duration >= explosion.maxDuration) {
                // Return to pool if using pooling
                if (explosionPool.active.includes(explosion)) {
                    explosionPool.release(explosion);
                }
                return false;
            }
            return true;
        });
    }
    
    // Clean up dead enemies
    cleanupEnemies() {
        enemies = enemies.filter(enemy => {
            if (!enemy.isAlive || !enemy.active) {
                // Return to pool if using pooling
                if (enemyPool.active.includes(enemy)) {
                    enemyPool.release(enemy);
                }
                return false;
            }
            return true;
        });
    }
    
    // Update memory statistics
    updateMemoryStats() {
        this.memoryStats.enemies = enemies.length;
        this.memoryStats.explosions = explosions.length;
        this.memoryStats.platforms = platforms.length;
    }
    
    // Get memory usage report
    getMemoryReport() {
        return {
            ...this.memoryStats,
            pools: {
                enemies: enemyPool.getStats(),
                explosions: explosionPool.getStats()
            }
        };
    }
}

// Initialize memory manager
const memoryManager = new MemoryManager();

// Explosion management functions
function updateExplosions() {
    // Update all active explosions
    for (let i = explosions.length - 1; i >= 0; i--) {
        const explosion = explosions[i];
        
        if (!explosion.active) {
            explosions.splice(i, 1);
            continue;
        }
        
        explosion.duration++;
        
        // Update particles
        for (let j = explosion.particles.length - 1; j >= 0; j--) {
            const particle = explosion.particles[j];
            
            // Update particle position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Apply gravity to particles
            particle.vy += 0.1;
            
            // Reduce particle life
            particle.life--;
            
            // Remove dead particles
            if (particle.life <= 0) {
                explosion.particles.splice(j, 1);
            }
        }
        
        // Remove explosion if duration exceeded or no particles left
        if (explosion.duration >= explosion.maxDuration || explosion.particles.length === 0) {
            explosion.active = false;
            explosions.splice(i, 1);
        }
    }
}

function drawExplosions() {
    // Draw all active explosions
    explosions.forEach(explosion => {
        if (!explosion.active) return;
        
        explosion.particles.forEach(particle => {
            const screenX = particle.x - cameraX;
            
            // Only draw if on screen
            if (screenX > -50 && screenX < canvas.width + 50) {
                ctx.save();
                ctx.globalAlpha = particle.life / 20; // Fade out over time
                ctx.fillStyle = particle.color;
                ctx.beginPath();
                ctx.arc(screenX, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        });
    });
}

// Enhanced logging and error handling system
class Logger {
    constructor() {
        this.logLevel = debugMode ? 'DEBUG' : 'ERROR';
        this.logs = [];
        this.maxLogs = 100;
        this.errorCount = 0;
        this.warningCount = 0;
    }
    
    // Log levels
    static LEVELS = {
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3
    };
    
    // Add log entry
    addLog(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            data,
            stack: level === 'ERROR' ? new Error().stack : null
        };
        
        this.logs.push(logEntry);
        
        // Maintain log size
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
        
        // Update counters
        if (level === 'ERROR') this.errorCount++;
        if (level === 'WARN') this.warningCount++;
        
        // Console output
        this.outputToConsole(logEntry);
    }
    
    // Output to console with appropriate method
    outputToConsole(logEntry) {
        const { level, message, data } = logEntry;
        const output = data ? [message, data] : [message];
        
        switch (level) {
            case 'DEBUG':
                if (debugMode) console.debug(...output);
                break;
            case 'INFO':
                console.info(...output);
                break;
            case 'WARN':
                console.warn(...output);
                break;
            case 'ERROR':
                console.error(...output);
                break;
        }
    }
    
    // Convenience methods
    debug(message, data) { this.addLog('DEBUG', message, data); }
    info(message, data) { this.addLog('INFO', message, data); }
    warn(message, data) { this.addLog('WARN', message, data); }
    error(message, data) { this.addLog('ERROR', message, data); }
    
    // Get error summary
    getErrorSummary() {
        return {
            totalLogs: this.logs.length,
            errors: this.errorCount,
            warnings: this.warningCount,
            recentErrors: this.logs.filter(log => log.level === 'ERROR').slice(-5)
        };
    }
    
    // Export logs for debugging
    exportLogs() {
        return JSON.stringify(this.logs, null, 2);
    }
}

// Global error handler
class ErrorHandler {
    constructor(logger) {
        this.logger = logger;
        this.setupGlobalHandlers();
        this.criticalErrors = 0;
        this.maxCriticalErrors = 5;
    }
    
    // Setup global error handlers
    setupGlobalHandlers() {
        // Catch unhandled errors
        window.addEventListener('error', (event) => {
            this.handleError(event.error, 'Unhandled Error', {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });
        
        // Catch unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason, 'Unhandled Promise Rejection');
            event.preventDefault(); // Prevent console spam
        });
    }
    
    // Handle errors with context
    handleError(error, context = 'Unknown', additionalData = {}) {
        this.criticalErrors++;
        
        const errorInfo = {
            message: error?.message || 'Unknown error',
            stack: error?.stack || 'No stack trace',
            context,
            timestamp: Date.now(),
            gameState: {
                running: gameRunning,
                level: currentLevel,
                score: score,
                lives: lives
            },
            ...additionalData
        };
        
        this.logger.error(`${context}: ${errorInfo.message}`, errorInfo);
        
        // Handle critical errors
        if (this.criticalErrors >= this.maxCriticalErrors) {
            this.handleCriticalFailure();
        }
        
        return errorInfo;
    }
    
    // Handle critical system failure
    handleCriticalFailure() {
        this.logger.error('Critical failure: Too many errors, stopping game');
        
        try {
            gameRunning = false;
            performanceManager.stop();
            
            // Show user-friendly error message
            if (ctx) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                ctx.fillStyle = '#FF0000';
                ctx.font = 'bold 24px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Game Error', canvas.width / 2, canvas.height / 2 - 50);
                
                ctx.fillStyle = '#FFFFFF';
                ctx.font = '16px Arial';
                ctx.fillText('Please reload the page', canvas.width / 2, canvas.height / 2);
                ctx.fillText('Sorry for the inconvenience!', canvas.width / 2, canvas.height / 2 + 30);
            }
        } catch (e) {
            // Last resort - direct DOM manipulation
            document.body.innerHTML = `
                <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: #222; color: white; font-family: Arial;">
                    <div style="text-align: center;">
                        <h1 style="color: #ff0000;">Game Error</h1>
                        <p>Please reload the page</p>
                        <button onclick="location.reload()" style="padding: 10px 20px; font-size: 16px;">Reload Game</button>
                    </div>
                </div>
            `;
        }
    }
    
    // Safe function wrapper
    safeExecute(fn, context = 'Unknown function', fallback = null) {
        try {
            return fn();
        } catch (error) {
            this.handleError(error, context);
            return fallback;
        }
    }
    
    // Async safe wrapper
    async safeExecuteAsync(fn, context = 'Unknown async function', fallback = null) {
        try {
            return await fn();
        } catch (error) {
            this.handleError(error, context);
            return fallback;
        }
    }
}

// Initialize logging and error handling
const logger = new Logger();
const errorHandler = new ErrorHandler(logger);

// Safe wrapper for critical functions
const safe = (fn, context, fallback = null) => {
    return errorHandler.safeExecute(fn, context, fallback);
};
let levelEnd = { x: 8000, width: 50, height: 500 };

// Load game assets
function loadAssets() {
    // Load VOOO running sprite
    assets.vooo.running = new Image();
    assets.vooo.running.src = 'running.png';
    
    // Load VOOO jumping sprite
    assets.vooo.jumping = new Image();
    assets.vooo.jumping.src = 'jumping.png';
    
    // Load strawberry enemy sprite
    assets.strawberry.img = new Image();
    assets.strawberry.img.src = 'enemies.png';
    
    // Load cherry enemy sprite
    assets.cherry.img = new Image();
    assets.cherry.img.src = 'cherry-enemies.png';
    
    // Make enemies bigger for better visibility
    assets.strawberry.width = 60;
    assets.strawberry.height = 60;
    assets.cherry.width = 60;
    assets.cherry.height = 60;
    
    // Load boss sprites based on level and type
    assets.boss.img = new Image();
    
    // Cherry boss (for boss object)
    if (currentLevel === 3 || currentLevel === 4) {
        assets.boss.img.src = 'cherry-boss.png';
    } else {
        assets.boss.img.src = 'boss.png';
    }
    
    // For level 4, load second boss sprite (strawberry)
    if (currentLevel === 4) {
        // Create a new image for the second boss
        secondBoss.img = new Image();
        secondBoss.img.src = 'boss.png'; // Regular boss sprite for strawberry boss
        secondBoss.active = true; // Activate second boss in level 4
    } else {
        secondBoss.active = false; // Deactivate second boss in other levels
    }
    
    // Make boss bigger for better visibility
    assets.boss.width = 120;
    assets.boss.height = 140;
    
    // Create tiles for platforms
    assets.tiles.img = document.createElement('canvas');
    assets.tiles.img.width = assets.tiles.size * 3; // 3 tile types
    assets.tiles.img.height = assets.tiles.size;
    const tilesCtx = assets.tiles.img.getContext('2d');
    
    // Ground tile
    tilesCtx.fillStyle = '#8B4513'; // Brown base
    tilesCtx.fillRect(0, 0, assets.tiles.size, assets.tiles.size);
    tilesCtx.fillStyle = '#A0522D'; // Lighter brown top
    tilesCtx.fillRect(0, 0, assets.tiles.size, 5);
    tilesCtx.fillStyle = '#654321'; // Darker details
    tilesCtx.fillRect(5, 10, 5, 5);
    tilesCtx.fillRect(20, 15, 8, 8);
    tilesCtx.fillRect(30, 25, 6, 6);
    
    // Platform tile
    tilesCtx.fillStyle = '#00AA00'; // Green base
    tilesCtx.fillRect(assets.tiles.size, 0, assets.tiles.size, assets.tiles.size);
    tilesCtx.fillStyle = '#00CC00'; // Lighter green top
    tilesCtx.fillRect(assets.tiles.size, 0, assets.tiles.size, 5);
    tilesCtx.fillStyle = '#008800'; // Darker details
    tilesCtx.fillRect(assets.tiles.size + 10, 15, 7, 7);
    tilesCtx.fillRect(assets.tiles.size + 25, 20, 10, 5);
    
    // Obstacle tile
    tilesCtx.fillStyle = '#888888'; // Gray base
    tilesCtx.fillRect(assets.tiles.size * 2, 0, assets.tiles.size, assets.tiles.size);
    tilesCtx.fillStyle = '#AAAAAA'; // Lighter top
    tilesCtx.fillRect(assets.tiles.size * 2, 0, assets.tiles.size, 5);
    tilesCtx.fillStyle = '#666666'; // Darker details
    tilesCtx.fillRect(assets.tiles.size * 2 + 5, 10, 10, 10);
    tilesCtx.fillRect(assets.tiles.size * 2 + 20, 15, 15, 15);
    
    // Create multi-layered background
    assets.background.layers = [];
    
    // Sky layer
    const skyLayer = document.createElement('canvas');
    skyLayer.width = assets.background.width;
    skyLayer.height = assets.background.height;
    const skyCtx = skyLayer.getContext('2d');
    
    // Gradient sky
    const skyGradient = skyCtx.createLinearGradient(0, 0, 0, assets.background.height);
    skyGradient.addColorStop(0, '#87CEEB'); // Sky blue
    skyGradient.addColorStop(1, '#E0F7FF'); // Lighter at horizon
    skyCtx.fillStyle = skyGradient;
    skyCtx.fillRect(0, 0, assets.background.width, assets.background.height);
    
    assets.background.layers.push({
        img: skyLayer,
        speed: 0.1
    });
    
    // Mountains layer
    const mountainsLayer = document.createElement('canvas');
    mountainsLayer.width = assets.background.width;
    mountainsLayer.height = assets.background.height;
    const mountainsCtx = mountainsLayer.getContext('2d');
    
    // Mountains
    for (let i = 0; i < 15; i++) {
        const mountainX = i * 400;
        const mountainHeight = Math.random() * 150 + 100;
        
        // Mountain gradient
        const mountainGradient = mountainsCtx.createLinearGradient(
            mountainX, assets.background.height - mountainHeight,
            mountainX + 200, assets.background.height
        );
        mountainGradient.addColorStop(0, '#8B4513'); // Brown
        mountainGradient.addColorStop(0.5, '#A0522D'); // Lighter brown
        mountainGradient.addColorStop(1, '#654321'); // Darker brown
        
        mountainsCtx.fillStyle = mountainGradient;
        mountainsCtx.beginPath();
        mountainsCtx.moveTo(mountainX, assets.background.height);
        mountainsCtx.lineTo(mountainX + 200, assets.background.height - mountainHeight);
        mountainsCtx.lineTo(mountainX + 400, assets.background.height);
        mountainsCtx.fill();
        
        // Snow caps
        mountainsCtx.fillStyle = '#FFFFFF';
        mountainsCtx.beginPath();
        mountainsCtx.moveTo(mountainX + 180, assets.background.height - mountainHeight + 20);
        mountainsCtx.lineTo(mountainX + 200, assets.background.height - mountainHeight);
        mountainsCtx.lineTo(mountainX + 220, assets.background.height - mountainHeight + 20);
        mountainsCtx.fill();
    }
    
    assets.background.layers.push({
        img: mountainsLayer,
        speed: 0.2
    });
    
    // Clouds layer
    const cloudsLayer = document.createElement('canvas');
    cloudsLayer.width = assets.background.width;
    cloudsLayer.height = assets.background.height;
    const cloudsCtx = cloudsLayer.getContext('2d');
    
    // Clouds
    cloudsCtx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 20; i++) {
        const cloudX = Math.random() * assets.background.width;
        const cloudY = Math.random() * 150 + 20;
        const cloudWidth = Math.random() * 100 + 50;
        const cloudHeight = Math.random() * 40 + 20;
        
        cloudsCtx.beginPath();
        cloudsCtx.arc(cloudX, cloudY, cloudWidth/2, 0, Math.PI * 2);
        cloudsCtx.arc(cloudX + cloudWidth/2, cloudY - cloudHeight/4, cloudWidth/3, 0, Math.PI * 2);
        cloudsCtx.arc(cloudX - cloudWidth/3, cloudY - cloudHeight/6, cloudWidth/4, 0, Math.PI * 2);
        cloudsCtx.fill();
    }
    
    assets.background.layers.push({
        img: cloudsLayer,
        speed: 0.3
    });
    
    // Trees and bushes layer
    const treesLayer = document.createElement('canvas');
    treesLayer.width = assets.background.width;
    treesLayer.height = assets.background.height;
    const treesCtx = treesLayer.getContext('2d');
    
    // Trees
    for (let i = 0; i < 30; i++) {
        const treeX = i * 200 + Math.random() * 100;
        const treeHeight = Math.random() * 100 + 80;
        
        // Trunk
        treesCtx.fillStyle = '#8B4513';
        treesCtx.fillRect(treeX, assets.background.height - treeHeight, 20, treeHeight);
        
        // Leaves
        treesCtx.fillStyle = '#006400';
        treesCtx.beginPath();
        treesCtx.arc(treeX + 10, assets.background.height - treeHeight - 30, 40, 0, Math.PI * 2);
        treesCtx.fill();
        treesCtx.beginPath();
        treesCtx.arc(treeX + 30, assets.background.height - treeHeight - 10, 30, 0, Math.PI * 2);
        treesCtx.fill();
        treesCtx.beginPath();
        treesCtx.arc(treeX - 10, assets.background.height - treeHeight - 20, 25, 0, Math.PI * 2);
        treesCtx.fill();
    }
    
    // Bushes
    for (let i = 0; i < 40; i++) {
        const bushX = i * 150 + Math.random() * 100;
        
        treesCtx.fillStyle = '#228B22';
        treesCtx.beginPath();
        treesCtx.arc(bushX, assets.background.height - 20, 20, 0, Math.PI * 2);
        treesCtx.arc(bushX + 15, assets.background.height - 25, 15, 0, Math.PI * 2);
        treesCtx.arc(bushX - 15, assets.background.height - 15, 18, 0, Math.PI * 2);
        treesCtx.fill();
    }
    
    assets.background.layers.push({
        img: treesLayer,
        speed: 0.5
    });
    
    // Combine all layers into the background image
    assets.background.img = document.createElement('canvas');
    assets.background.img.width = assets.background.width;
    assets.background.img.height = assets.background.height;
    const bgCtx = assets.background.img.getContext('2d');
    
    // Draw all layers
    assets.background.layers.forEach(layer => {
        bgCtx.drawImage(layer.img, 0, 0);
    });
}

// Initialize level
function initLevel() {
    // Reset game state
    score = 0;
    lives = cheatActivated ? 999 : 3; // Keep 999 lives if cheat is active
    cameraX = 0;
    bossHits = 0;
    bossDefeated = false;
    secondBossDefeated = false; // Reset second boss defeated state
    explosions = []; // Clear any active explosions
    
    // Set speed multiplier based on current level
    // Level 1: 15% slower (0.85)
    // Level 2+: Progressively faster
    if (currentLevel === 1) {
        speedMultiplier = 0.85; // Level 1: 15% slower
    } else {
        speedMultiplier = 1 + ((currentLevel - 2) * 0.1); // Other levels follow progression
    }
    
    // Update speed-dependent variables
    gravity = 0.46 * speedMultiplier;
    player.moveSpeed = 3.45 * speedMultiplier;
    player.jumpPower = -11.5 * speedMultiplier;
    player.doubleJumpPower = -13 * speedMultiplier;
    boss.velocityX = 1.725 * speedMultiplier;
    boss.jumpPower = -6.9 * speedMultiplier;
    assets.vooo.speed = 3.45 * speedMultiplier;
    
    // Reset player
    player.x = 100;
    player.y = 0;
    player.velocityX = 0;
    player.velocityY = 0;
    player.jumping = false;
    player.doubleJumping = false;
    player.canDoubleJump = false;
    player.isAlive = true;
    player.invulnerable = false;
    player.invulnerableTimer = 0;
    
    // Reset first boss
    boss.x = 7800;
    boss.y = 0;
    boss.velocityX = 1.725 * speedMultiplier;
    boss.velocityY = 0;
    boss.active = true;
    boss.hits = 0;
    boss.invulnerable = false;
    boss.invulnerableTimer = 0;
    
    // Reset second boss (for level 4)
    secondBoss.x = 7600;
    secondBoss.y = 0;
    secondBoss.velocityX = -1.725 * speedMultiplier; // Move in opposite direction
    secondBoss.velocityY = 0;
    secondBoss.active = currentLevel === 4; // Only active in level 4
    secondBoss.hits = 0;
    secondBoss.invulnerable = false;
    secondBoss.invulnerableTimer = 0;
    
    // Load appropriate assets for the current level
    loadAssets();
    
    // Create ground platform with gaps for lava in level 2+
    if (currentLevel === 1) {
        // Level 1: Continuous ground
        platforms = [
            { x: 0, y: canvas.height - 40, width: 8000, height: 40, type: 'ground' }
        ];
    } else {
        // Level 2+: Ground with lava gaps
        platforms = [];
        obstacles = []; // Clear obstacles first
        let currentX = 0;
        
        while (currentX < 8000) {
            // Determine segment length
            let segmentLength;
            
            if (currentX < 500) {
                // Safe starting area
                segmentLength = 500;
                
                // Add ground segment
                platforms.push({
                    x: currentX,
                    y: canvas.height - 40,
                    width: segmentLength,
                    height: 40,
                    type: 'ground'
                });
                
                currentX += segmentLength;
            } else if (currentX > 7400) { // Match buffer zone
                // Safe boss area
                segmentLength = 8000 - currentX;
                
                // Add ground segment
                platforms.push({
                    x: currentX,
                    y: canvas.height - 40,
                    width: segmentLength,
                    height: 40,
                    type: 'ground'
                });
                
                currentX += segmentLength;
            } else {
                // Random segment length between 200-500
                segmentLength = Math.random() * 300 + 200;
                
                // Add ground segment
                platforms.push({
                    x: currentX,
                    y: canvas.height - 40,
                    width: segmentLength,
                    height: 40,
                    type: 'ground'
                });
                
                currentX += segmentLength;
                
                // Add lava gap after this segment (only if not near boss area)
                if (currentX < 7300) {
                    const gapLength = Math.random() * 100 + 80;
                    
                    // Add lava obstacle IN THE GAP
                    obstacles.push({
                        x: currentX,
                        y: canvas.height - 40, // Align with bottom of screen
                        width: gapLength,
                        height: 40, // Match the height of the ground platforms
                        type: 'lava'
                    });
                    
                    // Skip the gap for next ground segment
                    currentX += gapLength;
                }
            }
        }
    }
    
    // Add platforms - more of them and more varied
    for (let i = 0; i < 40; i++) {
        const platformWidth = Math.random() * 200 + 100;
        const platformX = 500 + i * 200 + Math.random() * 100;
        const platformY = canvas.height - 40 - (Math.random() * 250 + 50);
        
        // STRICT CHECK: Don't place ANY platforms in or near the boss area
        if (platformX < 7400) {  // Added buffer zone before boss area
            platforms.push({
                x: platformX,
                y: platformY,
                width: platformWidth,
                height: 20,
                type: 'platform'
            });
            
            // Add some floating smaller platforms
            if (Math.random() > 0.6) {
                const smallPlatformWidth = Math.random() * 100 + 50;
                const smallPlatformX = platformX + platformWidth/2 - smallPlatformWidth/2;
                const smallPlatformY = platformY - Math.random() * 150 - 50;
                
                // Double-check that even with offsets, the platform doesn't extend into boss area
                if (smallPlatformX + smallPlatformWidth < 7400) {
                    platforms.push({
                        x: smallPlatformX,
                        y: smallPlatformY,
                        width: smallPlatformWidth,
                        height: 20,
                        type: 'platform'
                    });
                }
            }
        }
    }
    
    // Add a special platform for the boss battle
    // Removed the special platform for boss battle to make it a clean arena
    
    // Add obstacles
    if (!obstacles) obstacles = [];
    
    // Add regular obstacles (rocks, etc.)
    const obstacleCount = currentLevel === 1 ? 25 : 30; // More obstacles in level 2+
    for (let i = 0; i < obstacleCount; i++) {
        const obstacleWidth = Math.random() * 60 + 40;
        const obstacleHeight = Math.random() * 80 + 40;
        const obstacleX = 800 + i * 300 + Math.random() * 200;
        const obstacleY = canvas.height - 40 - obstacleHeight;
        
        // STRICT CHECK: Don't place obstacles in or near the boss area
        if (obstacleX < 7400) {  // Added buffer zone before boss area
            obstacles.push({
                x: obstacleX,
                y: obstacleY,
                width: obstacleWidth,
                height: obstacleHeight,
                type: 'rock'
            });
        }
    }
    
    // Add enemies - number based on level
    enemies = [];
    // Fewer enemies in level 1, more in higher levels
    // Level 2 has 10% more enemies than the base amount
    // Level 3 has 20% more enemies than the base amount
    const baseEnemyCount = 30;
    let enemyCount;
    
    if (currentLevel === 1) {
        enemyCount = 8; // Level 1: Few enemies
    } else if (currentLevel === 2) {
        enemyCount = Math.floor(baseEnemyCount * 1.1); // Level 2: 10% more than base
    } else if (currentLevel === 3) {
        enemyCount = Math.floor(baseEnemyCount * 1.2); // Level 3: 20% more than base
    } else if (currentLevel === 4) {
        enemyCount = Math.floor(baseEnemyCount * 1.3); // Level 4: 30% more than base
    } else {
        enemyCount = Math.floor(baseEnemyCount * (1 + (currentLevel - 2) * 0.15)); // Higher levels: Even more
    }
    
    for (let i = 0; i < enemyCount; i++) {
        const enemyX = 600 + i * 250 + Math.random() * 100;
        
        // STRICT CHECK: Skip this iteration if the enemy would be in or near the boss area
        if (enemyX >= 7400) {  // Added buffer zone before boss area
            continue;
        }
        
        // Position enemies on top of the ground, not buried in it
        const enemyY = canvas.height - 40 - assets.strawberry.height;
        
        // For level 4, randomly choose between strawberry and cherry enemies
        if (currentLevel === 4) {
            // 50% chance for each enemy type
            if (Math.random() < 0.5) {
                // Strawberry enemy
                enemies.push({
                    x: enemyX,
                    y: enemyY,
                    width: assets.strawberry.width,
                    height: assets.strawberry.height,
                    velocityX: (Math.random() > 0.5 ? -1.5 : 1.5) * speedMultiplier,
                    active: true,
                    type: 'strawberry'
                });
            } else {
                // Cherry enemy
                enemies.push({
                    x: enemyX,
                    y: enemyY,
                    width: assets.cherry.width,
                    height: assets.cherry.height,
                    velocityX: (Math.random() > 0.5 ? -1.5 : 1.5) * speedMultiplier,
                    active: true,
                    type: 'cherry'
                });
            }
        } else if (currentLevel === 3) {
            // Level 3: All cherry enemies
            enemies.push({
                x: enemyX,
                y: enemyY,
                width: assets.cherry.width,
                height: assets.cherry.height,
                velocityX: (Math.random() > 0.5 ? -1.5 : 1.5) * speedMultiplier,
                active: true,
                type: 'cherry'
            });
        } else {
            // Level 1-2: All strawberry enemies
            enemies.push({
                x: enemyX,
                y: enemyY,
                width: assets.strawberry.width,
                height: assets.strawberry.height,
                velocityX: (Math.random() > 0.5 ? -1.5 : 1.5) * speedMultiplier,
                active: true,
                type: 'strawberry'
            });
        }
    }
    
    // Add some enemies on platforms - fewer in level 1
    const platformEnemyChance = currentLevel === 1 ? 0.1 : 
                               (currentLevel === 3 ? 0.5 : 
                               (currentLevel === 4 ? 0.6 : 0.4)); // Level 4 has most platform enemies
    
    // Filter platforms to only include those outside the boss area
    const nonBossPlatforms = platforms.filter(platform => platform.x < 7400 || platform.type === 'ground');
    
    nonBossPlatforms.forEach((platform, index) => {
        // Skip ground platforms and platforms in boss area
        if (platform.type === 'ground' || platform.x >= 7400) {
            return;
        }
        
        if (platform.width > 80 && Math.random() > (1 - platformEnemyChance)) {
            // For level 4, randomly choose between strawberry and cherry enemies
            if (currentLevel === 4) {
                // 50% chance for each enemy type
                if (Math.random() < 0.5) {
                    // Strawberry enemy
                    enemies.push({
                        x: platform.x + platform.width/2,
                        y: platform.y - assets.strawberry.height,
                        width: assets.strawberry.width,
                        height: assets.strawberry.height,
                        velocityX: (Math.random() > 0.5 ? -1.5 : 1.5) * speedMultiplier,
                        platformIndex: platforms.indexOf(platform),
                        active: true,
                        type: 'strawberry'
                    });
                } else {
                    // Cherry enemy
                    enemies.push({
                        x: platform.x + platform.width/2,
                        y: platform.y - assets.cherry.height,
                        width: assets.cherry.width,
                        height: assets.cherry.height,
                        velocityX: (Math.random() > 0.5 ? -1.5 : 1.5) * speedMultiplier,
                        platformIndex: platforms.indexOf(platform),
                        active: true,
                        type: 'cherry'
                    });
                }
            } else if (currentLevel === 3) {
                // Level 3: All cherry enemies
                enemies.push({
                    x: platform.x + platform.width/2,
                    y: platform.y - assets.cherry.height,
                    width: assets.cherry.width,
                    height: assets.cherry.height,
                    velocityX: (Math.random() > 0.5 ? -1.5 : 1.5) * speedMultiplier,
                    platformIndex: platforms.indexOf(platform),
                    active: true,
                    type: 'cherry'
                });
            } else {
                // Level 1-2: All strawberry enemies
                enemies.push({
                    x: platform.x + platform.width/2,
                    y: platform.y - assets.strawberry.height,
                    width: assets.strawberry.width,
                    height: assets.strawberry.height,
                    velocityX: (Math.random() > 0.5 ? -1.5 : 1.5) * speedMultiplier,
                    platformIndex: platforms.indexOf(platform),
                    active: true,
                    type: 'strawberry'
                });
            }
        }
    });
    
    // Set level end - further away
    levelEnd = { x: 8200, width: 50, height: 500 };
    
    updateScoreDisplay();
    updateLivesDisplay();
}

// Update score display
function updateScoreDisplay() {
    scoreElement.textContent = `Score: ${score} | Level: ${currentLevel}`;
    livesElement.textContent = `Lives: ${lives}`;
}

// Update lives display
function updateLivesDisplay() {
    livesElement.textContent = `Lives: ${lives}`;
}

// Level selection animation loop
function levelSelectionLoop() {
    if (levelSelectionMode && !gameRunning) {
        showMessage("VOOO's Adventure");
        requestAnimationFrame(levelSelectionLoop);
    }
}

// Game loop
// Performance monitoring and optimization
class PerformanceManager {
    constructor() {
        this.frameCount = 0;
        this.lastTime = 0;
        this.fps = 0;
        this.deltaTime = 0;
        this.targetFPS = 60;
        this.frameTime = 1000 / this.targetFPS;
        this.animationId = null;
        this.isRunning = false;
    }
    
    // Calculate FPS and delta time
    updatePerformance(currentTime) {
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        this.frameCount++;
        
        // Calculate FPS every second
        if (this.frameCount % 60 === 0) {
            this.fps = Math.round(1000 / this.deltaTime);
            if (debugMode) {
                console.log(`FPS: ${this.fps}, Delta: ${this.deltaTime.toFixed(2)}ms`);
            }
        }
    }
    
    // Start performance monitoring
    start() {
        this.isRunning = true;
        this.lastTime = performance.now();
    }
    
    // Stop performance monitoring
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
}

// Initialize performance manager
const performanceManager = new PerformanceManager();

// Optimized game loop with error handling and performance monitoring
function gameLoop(currentTime = performance.now()) {
    if (!gameRunning) {
        performanceManager.stop();
        return;
    }
    
    // Update performance metrics
    performanceManager.updatePerformance(currentTime);
    
    try {
        // Clear canvas efficiently
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background
        drawBackground();
        
        // Update player
        updatePlayer();
        
        // Update enemies
        updateEnemies();
        
        // Update boss
        updateBoss();
        
        // Update explosions
        updateExplosions();
        
        // Draw platforms
        drawPlatforms();
        
        // Draw obstacles
        drawObstacles();
        
        // Draw level end
        drawLevelEnd();
        
        // Draw player
        drawPlayer();
        
        // Draw enemies
        drawEnemies();
        
        // Draw boss
        drawBoss();
        
        // Draw explosions
        drawExplosions();
        
        // Draw boss health bar if near boss
        if (Math.abs(player.x - boss.x) < 500 && (boss.active || secondBoss.active)) {
            drawBossHealthBar();
        }
        
        // Check for level completion
        checkGameConditions();
        
    } catch (error) {
        console.error('Error in game loop:', error);
        gameRunning = false;
        showMessage("Game Error! Please reload.");
        return;
    }
    
    // Schedule next frame
    requestAnimationFrame(gameLoop);
}

// Separate function for game condition checks (better organization)
function checkGameConditions() {
    // Check for level completion
    // For level 4, both bosses must be defeated
    // For other levels, only the main boss needs to be defeated
    const allBossesDefeated = currentLevel === 4 ? 
                             (bossDefeated && secondBossDefeated) : 
                             bossDefeated;
    
    if (allBossesDefeated && player.x + player.width > levelEnd.x) {
        gameRunning = false;
        currentLevel++; // Increment level for next game
        showMessage("Level Complete! Score: " + score);
        return;
    }
    
    // Check if player is alive
    if (!player.isAlive) {
        lives--;
        updateLivesDisplay();
        
        if (lives <= 0) {
            gameRunning = false;
            showMessage("Game Over! Score: " + score);
        } else {
            resetPlayerAfterDeath();
        }
    }
}

// Update player position and state
function updatePlayer() {
    // Handle keyboard and mobile input for movement
    player.velocityX = 0;
    
    // Keyboard controls
    if (keys['KeyA'] || keys['ArrowLeft']) {
        player.velocityX = -player.moveSpeed;
        assets.vooo.facingRight = false;
    }
    
    if (keys['KeyD'] || keys['ArrowRight']) {
        player.velocityX = player.moveSpeed;
        assets.vooo.facingRight = true;
    }
    
    // Mobile controls
    if (mobileControls.left) {
        player.velocityX = -player.moveSpeed;
        assets.vooo.facingRight = false;
    }
    
    if (mobileControls.right) {
        player.velocityX = player.moveSpeed;
        assets.vooo.facingRight = true;
    }
    
    // Handle jumping and double jumping - REMOVED from here to avoid duplicate jumps
    // Jump handling is now only in the keydown event listener and mobile touch events
    
    // Apply gravity
    player.velocityY += gravity;
    
    // Update player position
    player.x += player.velocityX;
    player.y += player.velocityY;
    
    // Keep player within level bounds
    if (player.x < 0) {
        player.x = 0;
    }
    
    // Check if player is in boss area (x position > 7500)
    const inBossArea = player.x > 7500;
    
    // Check for collisions with platforms
    let onGround = false;
    platforms.forEach(platform => {
        // Skip ALL non-ground platforms in boss area
        if (inBossArea && platform.type !== 'ground') {
            return;
        }
        
        if (
            player.y + player.height > platform.y &&
            player.y < platform.y + platform.height &&
            player.x + player.width - 5 > platform.x &&
            player.x + 5 < platform.x + platform.width
        ) {
            // Collision from above (landing on platform)
            if (player.velocityY > 0 && player.y + player.height - player.velocityY <= platform.y + 10) {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.jumping = false;
                player.doubleJumping = false;
                player.canDoubleJump = false; // Reset double jump when landing
                assets.vooo.isJumping = false;
                onGround = true;
            }
            // Collision from below (hitting platform from underneath)
            else if (player.velocityY < 0 && player.y >= platform.y + platform.height) {
                player.y = platform.y + platform.height;
                player.velocityY = 0;
            }
            // Collision from left
            else if (player.velocityX > 0 && player.x + player.width - player.velocityX <= platform.x) {
                player.x = platform.x - player.width;
            }
            // Collision from right
            else if (player.velocityX < 0 && player.x - player.velocityX >= platform.x + platform.width) {
                player.x = platform.x + platform.width;
            }
        }
    });
    
    // Check for collisions with obstacles
    obstacles.forEach(obstacle => {
        if (
            player.y + player.height > obstacle.y + 5 &&  // Add 5px buffer at the top
            player.y < obstacle.y + obstacle.height - 5 &&  // Add 5px buffer at the bottom
            player.x + player.width - 5 > obstacle.x &&  // Add 5px buffer on the right
            player.x + 5 < obstacle.x + obstacle.width  // Add 5px buffer on the left
        ) {
            // Handle lava collision - instant death
            if (obstacle.type === 'lava' && 
                player.y + player.height > obstacle.y - 5) { // Adjusted collision detection for lava
                player.isAlive = false;
                return;
            }
            
            // Collision from above
            if (player.velocityY > 0 && player.y + player.height - player.velocityY <= obstacle.y) {
                player.y = obstacle.y - player.height;
                player.velocityY = 0;
                player.jumping = false;
                assets.vooo.isJumping = false;
                onGround = true;
            }
            // Collision from sides or below - push player away
            else {
                // Find the shortest direction to push out
                const fromLeft = player.x + player.width - obstacle.x;
                const fromRight = obstacle.x + obstacle.width - player.x;
                const fromTop = player.y + player.height - obstacle.y;
                const fromBottom = obstacle.y + obstacle.height - player.y;
                
                const min = Math.min(fromLeft, fromRight, fromTop, fromBottom);
                
                if (min === fromLeft) {
                    player.x = obstacle.x - player.width;
                } else if (min === fromRight) {
                    player.x = obstacle.x + obstacle.width;
                } else if (min === fromTop) {
                    player.y = obstacle.y - player.height;
                    player.velocityY = 0;
                    player.jumping = false;
                    assets.vooo.isJumping = false;
                } else if (min === fromBottom) {
                    player.y = obstacle.y + obstacle.height;
                    player.velocityY = 0;
                }
            }
        }
    });
    
    // Check if player fell off the screen
    if (player.y > canvas.height) {
        player.isAlive = false;
    }
    
    // Update camera position to follow player
    if (player.x > canvas.width / 3 && player.x < levelEnd.x - canvas.width * 2/3) {
        cameraX = player.x - canvas.width / 3;
    }
    
    // Update score based on distance traveled
    if (player.velocityX > 0) {
        score += Math.floor(player.velocityX);
        if (score % 100 === 0) {
            updateScoreDisplay();
        }
    }
    
    // Handle invulnerability timer
    if (player.invulnerable) {
        player.invulnerableTimer--;
        if (player.invulnerableTimer <= 0) {
            player.invulnerable = false;
        }
    }
    
    // Check for collision with boss
    if (boss.active && !player.invulnerable && !boss.invulnerable &&
        player.x + 5 < boss.x + boss.width - 5 &&
        player.x + player.width - 5 > boss.x + 5 &&
        player.y + 5 < boss.y + boss.height - 5 &&
        player.y + player.height - 5 > boss.y + 5
    ) {
        // Check if player is jumping on boss from above
        if (player.velocityY > 0 && player.y + player.height - player.velocityY <= boss.y + boss.height/3) {
            // Hit boss
            boss.hits++;
            boss.invulnerable = true;
            boss.invulnerableTimer = 30;
            player.velocityY = player.jumpPower * 0.7; // Bounce
            score += 200;
            updateScoreDisplay();
            
            // Check if boss is defeated
            if (boss.hits >= assets.boss.hitsRequired) {
                boss.active = false;
                bossDefeated = true;
                score += 1000;
                updateScoreDisplay();
            }
        } else {
            // Player gets hit by boss
            player.isAlive = false;
            
            // If it's a cherry boss (level 3 or 4), defeat player immediately regardless of lives
            if (currentLevel === 3 || currentLevel === 4) {
                lives = 0; // Set lives to 0 to trigger game over
                updateLivesDisplay();
            }
        }
    }
    
    // Check for collision with second boss (level 4 only)
    if (secondBoss.active && !player.invulnerable && !secondBoss.invulnerable &&
        player.x + 5 < secondBoss.x + secondBoss.width - 5 &&
        player.x + player.width - 5 > secondBoss.x + 5 &&
        player.y + 5 < secondBoss.y + secondBoss.height - 5 &&
        player.y + player.height - 5 > secondBoss.y + 5
    ) {
        // Check if player is jumping on second boss from above
        if (player.velocityY > 0 && player.y + player.height - player.velocityY <= secondBoss.y + secondBoss.height/3) {
            // Hit second boss
            secondBoss.hits++;
            secondBoss.invulnerable = true;
            secondBoss.invulnerableTimer = 30;
            player.velocityY = player.jumpPower * 0.7; // Bounce
            score += 200;
            updateScoreDisplay();
            
            // Check if second boss is defeated
            if (secondBoss.hits >= assets.boss.hitsRequired) {
                secondBoss.active = false;
                secondBossDefeated = true;
                score += 1000;
                updateScoreDisplay();
            }
        } else {
            // Player gets hit by second boss
            player.isAlive = false;
            
            // Strawberry boss in level 4 also defeats player immediately
            if (currentLevel === 4) {
                lives = 0; // Set lives to 0 to trigger game over
                updateLivesDisplay();
            }
        }
    }
}

// Update enemies
function updateEnemies() {
    enemies.forEach(enemy => {
        if (!enemy.active) return;
        
        // Deactivate enemies that enter the boss area or buffer zone
        if (enemy.x > 7400) {
            enemy.active = false;
            return;
        }
        
        // Apply gravity to ground enemies
        if (enemy.platformIndex === undefined) {
            enemy.velocityY = enemy.velocityY || 0;
            enemy.velocityY += gravity;
            enemy.y += enemy.velocityY;
        }
        
        // Move enemy horizontally
        enemy.x += enemy.velocityX;
        
        // Check if enemy is on a platform
        if (enemy.platformIndex !== undefined) {
            const platform = platforms[enemy.platformIndex];
            
            // Skip if platform no longer exists
            if (!platform) {
                enemy.active = false;
                return;
            }
            
            // Keep enemy on platform
            if (enemy.x < platform.x) {
                enemy.velocityX *= -1;
                enemy.x = platform.x;
            } else if (enemy.x + enemy.width > platform.x + platform.width) {
                enemy.velocityX *= -1;
                enemy.x = platform.x + platform.width - enemy.width;
            }
        } else {
            // Ground enemy - check if it's still on ground
            let onGround = false;
            
            // Check for collisions with ground platforms
            for (let i = 0; i < platforms.length; i++) {
                const platform = platforms[i];
                if (platform.type === 'ground' && 
                    enemy.x + enemy.width > platform.x && 
                    enemy.x < platform.x + platform.width &&
                    enemy.y + enemy.height > platform.y &&
                    enemy.y + enemy.height < platform.y + platform.height + 5) {
                    
                    enemy.y = platform.y - enemy.height;
                    enemy.velocityY = 0;
                    onGround = true;
                    break;
                }
            }
            
            // If enemy is not on ground, it should fall
            if (!onGround) {
                // Check if enemy fell off screen
                if (enemy.y > canvas.height) {
                    enemy.active = false;
                }
                
                // Check if enemy fell into lava
                obstacles.forEach(obstacle => {
                    if (obstacle.type === 'lava' &&
                        enemy.x + enemy.width > obstacle.x &&
                        enemy.x < obstacle.x + obstacle.width &&
                        enemy.y + enemy.height > obstacle.y) {
                        enemy.active = false;
                    }
                });
            } else {
                // If at edge of platform, turn around
                let foundPlatform = false;
                for (let i = 0; i < platforms.length; i++) {
                    const platform = platforms[i];
                    if (platform.type === 'ground') {
                        // Check if about to walk off edge
                        if (enemy.velocityX > 0 && 
                            enemy.x + enemy.width + 5 > platform.x + platform.width &&
                            enemy.x < platform.x + platform.width) {
                            enemy.velocityX *= -1;
                            foundPlatform = true;
                            break;
                        } else if (enemy.velocityX < 0 && 
                                  enemy.x - 5 < platform.x &&
                                  enemy.x + enemy.width > platform.x) {
                            enemy.velocityX *= -1;
                            foundPlatform = true;
                            break;
                        }
                    }
                }
            }
        }
        
        // Check collision with player
        if (
            !player.invulnerable &&
            player.x + 5 < enemy.x + enemy.width - 5 &&
            player.x + player.width - 5 > enemy.x + 5 &&
            player.y + 5 < enemy.y + enemy.height - 5 &&
            player.y + player.height - 5 > enemy.y + 5
        ) {
            // Check if player is jumping on enemy from above
            if (player.velocityY > 0 && player.y + player.height - player.velocityY <= enemy.y + enemy.height/4) {
                // Defeat enemy
                enemy.active = false;
                player.velocityY = player.jumpPower * 0.7; // Bounce
                score += 100;
                updateScoreDisplay();
            } else {
                // Player gets hit by enemy from the side or below
                
                // Create explosion if it's a cherry enemy
                if (enemy.type === 'cherry') {
                    createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                }
                
                // Deactivate enemy
                enemy.active = false;
                
                // Player gets hit
                player.isAlive = false;
            }
        }
    });
}

// Update boss
function updateBoss() {
    if (!boss.active) return;
    
    // Apply gravity
    boss.velocityY += gravity * 0.8;
    
    // Update boss position
    boss.x += boss.velocityX;
    boss.y += boss.velocityY;
    
    // Check for collisions with platforms - ONLY ground platforms in boss area
    platforms.forEach(platform => {
        // Skip non-ground platforms in boss area
        if (boss.x > 7500 && platform.type !== 'ground') {
            return;
        }
        
        if (
            boss.y + boss.height > platform.y &&
            boss.y < platform.y + platform.height &&
            boss.x + boss.width - 5 > platform.x &&
            boss.x + 5 < platform.x + platform.width
        ) {
            // Collision from above (landing on platform)
            if (boss.velocityY > 0 && boss.y + boss.height - boss.velocityY <= platform.y + 10) {
                boss.y = platform.y - boss.height;
                boss.velocityY = 0;
                
                // Random jump
                if (Math.random() < 0.02) {
                    boss.velocityY = boss.jumpPower;
                }
            }
        }
    });
    
    // Reverse direction if hitting level boundaries
    if (boss.x < 7600 || boss.x > 8000 - boss.width) {
        boss.velocityX *= -1;
    }
    
    // Handle invulnerability timer
    if (boss.invulnerable) {
        boss.invulnerableTimer--;
        if (boss.invulnerableTimer <= 0) {
            boss.invulnerable = false;
        }
    }
    
    // Update second boss (for level 4)
    if (secondBoss.active) {
        // Apply gravity
        secondBoss.velocityY += gravity * 0.8;
        
        // Update second boss position
        secondBoss.x += secondBoss.velocityX;
        secondBoss.y += secondBoss.velocityY;
        
        // Check for collisions with platforms - ONLY ground platforms in boss area
        platforms.forEach(platform => {
            // Skip non-ground platforms in boss area
            if (secondBoss.x > 7500 && platform.type !== 'ground') {
                return;
            }
            
            if (
                secondBoss.y + secondBoss.height > platform.y &&
                secondBoss.y < platform.y + platform.height &&
                secondBoss.x + secondBoss.width - 5 > platform.x &&
                secondBoss.x + 5 < platform.x + platform.width
            ) {
                // Collision from above (landing on platform)
                if (secondBoss.velocityY > 0 && secondBoss.y + secondBoss.height - secondBoss.velocityY <= platform.y + 10) {
                    secondBoss.y = platform.y - secondBoss.height;
                    secondBoss.velocityY = 0;
                    
                    // Random jump
                    if (Math.random() < 0.02) {
                        secondBoss.velocityY = secondBoss.jumpPower;
                    }
                }
            }
        });
        
        // Reverse direction if hitting level boundaries
        if (secondBoss.x < 7600 || secondBoss.x > 8000 - secondBoss.width) {
            secondBoss.velocityX *= -1;
        }
        
        // Handle invulnerability timer
        if (secondBoss.invulnerable) {
            secondBoss.invulnerableTimer--;
            if (secondBoss.invulnerableTimer <= 0) {
                secondBoss.invulnerable = false;
            }
        }
    }
}

// Draw background
function drawBackground() {
    // Draw each layer with parallax effect
    assets.background.layers.forEach(layer => {
        const offsetX = -cameraX * layer.speed;
        ctx.drawImage(layer.img, offsetX % assets.background.width, 0);
        ctx.drawImage(layer.img, offsetX % assets.background.width + assets.background.width, 0);
    });
}

// Draw platforms
function drawPlatforms() {
    platforms.forEach(platform => {
        const screenX = platform.x - cameraX;
        
        // Skip if off-screen
        if (screenX + platform.width < 0 || screenX > canvas.width) return;
        
        // Skip drawing non-ground platforms in boss area
        if (platform.x > 7400 && platform.type !== 'ground') return;
        
        if (platform.type === 'ground') {
            // Draw ground with tiles
            for (let x = 0; x < platform.width; x += assets.tiles.size) {
                ctx.drawImage(
                    assets.tiles.img,
                    0, 0, assets.tiles.size, assets.tiles.size,
                    screenX + x, platform.y, 
                    assets.tiles.size, assets.tiles.size
                );
            }
        } else {
            // Draw platform with tiles
            for (let x = 0; x < platform.width; x += assets.tiles.size) {
                ctx.drawImage(
                    assets.tiles.img,
                    assets.tiles.size, 0, assets.tiles.size, assets.tiles.size,
                    screenX + x, platform.y, 
                    assets.tiles.size, assets.tiles.size
                );
            }
        }
    });
}

// Draw obstacles
function drawObstacles() {
    obstacles.forEach(obstacle => {
        const screenX = obstacle.x - cameraX;
        
        // Skip if off-screen
        if (screenX + obstacle.width < 0 || screenX > canvas.width) return;
        
        // Skip obstacles in boss area except for lava
        if (obstacle.x > 7400 && obstacle.type !== 'lava') return;
        
        if (obstacle.type === 'lava') {
            // Draw lava with animation effect
            const time = Date.now() * assets.lava.animationSpeed;
            
            // Create lava gradient
            const lavaGradient = ctx.createLinearGradient(
                screenX, obstacle.y - 5, // Start gradient slightly above the lava surface
                screenX, obstacle.y + obstacle.height
            );
            
            lavaGradient.addColorStop(0, assets.lava.glowColor);
            lavaGradient.addColorStop(0.3 + Math.sin(time) * 0.2, assets.lava.color);
            lavaGradient.addColorStop(1, '#990000');
            
            ctx.fillStyle = lavaGradient;
            ctx.fillRect(screenX, obstacle.y - 5, obstacle.width, obstacle.height + 5); // Extend lava upward slightly
            
            // Add glow effect around lava
            ctx.shadowColor = assets.lava.glowColor;
            ctx.shadowBlur = 15;
            ctx.fillRect(screenX, obstacle.y - 10, obstacle.width, 5);
            ctx.shadowBlur = 0;
            
            // Add bubbling effect
            for (let i = 0; i < obstacle.width / 10; i++) {
                const bubbleX = screenX + i * 10 + Math.sin(time + i) * 5;
                const bubbleY = obstacle.y + Math.sin(time * 2 + i * 0.7) * 8; // Increased amplitude
                const bubbleSize = Math.max(1, 2 + Math.sin(time * 3 + i * 1.5) * 2.5); // Ensure positive radius
                
                ctx.fillStyle = assets.lava.glowColor;
                try {
                ctx.beginPath();
                // Ensure radius is positive
                const safeRadius = Math.abs(bubbleSize);
                ctx.arc(bubbleX, bubbleY, safeRadius, 0, Math.PI * 2);
                ctx.fill();
            } catch (e) {
                // Fallback to a simple rectangle if arc fails
                ctx.fillRect(bubbleX - 2, bubbleY - 2, 4, 4);
            }
            }
            
            // Add glow effect
            ctx.fillStyle = 'rgba(255, 69, 0, 0.3)';
            ctx.fillRect(screenX - 5, obstacle.y - 5, obstacle.width + 10, obstacle.height + 5);
        } else {
            // Draw regular obstacle with tiles
            for (let x = 0; x < obstacle.width; x += assets.tiles.size) {
                for (let y = 0; y < obstacle.height; y += assets.tiles.size) {
                    ctx.drawImage(
                        assets.tiles.img,
                        assets.tiles.size * 2, 0, assets.tiles.size, assets.tiles.size,
                        screenX + x, obstacle.y + y, 
                        assets.tiles.size, assets.tiles.size
                    );
                }
            }
        }
    });
}

// Draw level end
function drawLevelEnd() {
    const screenX = levelEnd.x - cameraX;
    
    // Only show level end flag when both bosses are defeated
    // For level 4, both bosses must be defeated
    // For other levels, only the main boss needs to be defeated
    const allBossesDefeated = currentLevel === 4 ? 
                             (bossDefeated && secondBossDefeated) : 
                             bossDefeated;
    
    if (screenX < canvas.width && allBossesDefeated) {
        // Pole
        ctx.fillStyle = '#888888';
        ctx.fillRect(screenX, 0, 5, levelEnd.height);
        
        // Flag
        ctx.fillStyle = '#FF0000'; // Red flag
        ctx.beginPath();
        ctx.moveTo(screenX + 5, 50);
        ctx.lineTo(screenX + 35, 60);
        ctx.lineTo(screenX + 5, 70);
        ctx.fill();
        
        // Base
        ctx.fillStyle = '#FFD700'; // Gold
        ctx.fillRect(screenX - 20, canvas.height - 80, 45, 40);
    }
}

// Draw player
function drawPlayer() {
    // Skip drawing if player is invulnerable and should blink
    if (player.invulnerable && Math.floor(player.invulnerableTimer / 5) % 2 === 0) {
        return;
    }
    
    const screenX = player.x - cameraX;
    
    // Choose the right sprite based on state
    const playerSprite = assets.vooo.isJumping ? assets.vooo.jumping : assets.vooo.running;
    
    // Flip horizontally if facing left
    ctx.save();
    if (!assets.vooo.facingRight) {
        ctx.translate(screenX + player.width, player.y);
        ctx.scale(-1, 1);
        ctx.drawImage(
            playerSprite,
            0, 0, playerSprite.width, playerSprite.height,
            0, 0, player.width, player.height
        );
    } else {
        ctx.drawImage(
            playerSprite,
            0, 0, playerSprite.width, playerSprite.height,
            screenX, player.y, player.width, player.height
        );
    }
    ctx.restore();
    
    // Draw double jump indicator if available
    if (player.jumping && player.canDoubleJump) {
        // Draw a more visible glow around the player
        ctx.save();
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(screenX + player.width/2, player.y + player.height/2, 
                player.width * 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.restore();
    }
    
    // Debug info - only shown if debugMode is true
    if (debugMode) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`jumping: ${player.jumping}`, screenX, player.y - 30);
        ctx.fillText(`doubleJumping: ${player.doubleJumping}`, screenX, player.y - 15);
        ctx.fillText(`canDoubleJump: ${player.canDoubleJump}`, screenX, player.y);
    }
}

// Draw enemies
function drawEnemies() {
    enemies.forEach(enemy => {
        if (!enemy.active) return;
        
        // Skip enemies in boss area
        if (enemy.x > 7400) return;
        
        const screenX = enemy.x - cameraX;
        
        // Skip if off-screen
        if (screenX + enemy.width < 0 || screenX > canvas.width) return;
        
        try {
            // Determine which sprite to use based on enemy type
            const enemySprite = enemy.type === 'cherry' ? assets.cherry.img : assets.strawberry.img;
            
            // Flip all enemies based on their movement direction
            ctx.save();
            if (enemy.velocityX < 0) {
                // Flip horizontally for left-moving enemies
                ctx.translate(screenX + enemy.width, enemy.y);
                ctx.scale(-1, 1);
                ctx.drawImage(
                    enemySprite,
                    0, 0, enemy.width, enemy.height
                );
            } else {
                ctx.drawImage(
                    enemySprite,
                    screenX, enemy.y, enemy.width, enemy.height
                );
            }
            ctx.restore();
        } catch (e) {
            console.error("Error drawing enemy:", e);
            // Fallback to a simple red circle if image fails
            ctx.fillStyle = enemy.type === 'cherry' ? '#FF0066' : '#FF0033';
            ctx.beginPath();
            ctx.arc(screenX + enemy.width/2, enemy.y + enemy.height/2, enemy.width/2, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

// Draw boss
function drawBoss() {
    // Draw first boss
    if (boss.active) {
        const screenX = boss.x - cameraX;
        
        // Skip if off-screen
        if (screenX + boss.width < 0 || screenX > canvas.width) return;
        
        // Skip drawing if boss is invulnerable and should blink
        if (boss.invulnerable && Math.floor(boss.invulnerableTimer / 5) % 2 === 0) {
            // Skip drawing
        } else {
            // Draw the boss sprite
            try {
                // Flip horizontally based on direction
                ctx.save();
                if (boss.velocityX < 0) {
                    ctx.translate(screenX + boss.width, boss.y);
                    ctx.scale(-1, 1);
                    ctx.drawImage(
                        assets.boss.img,
                        0, 0, boss.width, boss.height
                    );
                } else {
                    ctx.drawImage(
                        assets.boss.img,
                        screenX, boss.y, boss.width, boss.height
                    );
                }
                ctx.restore();
            } catch (e) {
                console.error("Error drawing boss:", e);
                // Fallback to a simple shape if image fails
                ctx.fillStyle = '#FF6600';
                ctx.fillRect(screenX, boss.y, boss.width, boss.height);
            }
        }
    }
    
    // Draw second boss (for level 4)
    if (secondBoss.active) {
        const screenX = secondBoss.x - cameraX;
        
        // Skip if off-screen
        if (screenX + secondBoss.width < 0 || screenX > canvas.width) return;
        
        // Skip drawing if second boss is invulnerable and should blink
        if (secondBoss.invulnerable && Math.floor(secondBoss.invulnerableTimer / 5) % 2 === 0) {
            // Skip drawing
        } else {
            // Draw the second boss sprite
            try {
                // Flip horizontally based on direction
                ctx.save();
                if (secondBoss.velocityX < 0) {
                    ctx.translate(screenX + secondBoss.width, secondBoss.y);
                    ctx.scale(-1, 1);
                    ctx.drawImage(
                        secondBoss.img,
                        0, 0, secondBoss.width, secondBoss.height
                    );
                } else {
                    ctx.drawImage(
                        secondBoss.img,
                        screenX, secondBoss.y, secondBoss.width, secondBoss.height
                    );
                }
                ctx.restore();
            } catch (e) {
                console.error("Error drawing second boss:", e);
                // Fallback to a simple shape if image fails
                ctx.fillStyle = '#FF3300';
                ctx.fillRect(screenX, secondBoss.y, secondBoss.width, secondBoss.height);
            }
        }
    }
}

// Draw boss health bar
function drawBossHealthBar() {
    // Only draw health bars if player is near boss area
    if (Math.abs(player.x - boss.x) < 500 && (boss.active || secondBoss.active)) {
        const barWidth = 200;
        const barHeight = 20;
        
        // First boss health bar (cherry boss)
        if (boss.active) {
            const x = canvas.width / 2 - barWidth / 2;
            const y = 30; // Position first boss health bar higher
            const healthPercentage = (assets.boss.hitsRequired - boss.hits) / assets.boss.hitsRequired;
            
            // Background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(x, y, barWidth, barHeight);
            
            // Health
            ctx.fillStyle = boss.invulnerable ? '#FFFF00' : '#FF0000';
            ctx.fillRect(x, y, barWidth * healthPercentage, barHeight);
            
            // Border
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, barWidth, barHeight);
            
            // Text
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('CHERRY BOSS', canvas.width / 2, y - 5);
        }
        
        // Second boss health bar (strawberry boss) - only in level 4
        if (secondBoss.active) {
            const x = canvas.width / 2 - barWidth / 2;
            const y = 70; // Position second boss health bar lower
            const healthPercentage = (assets.boss.hitsRequired - secondBoss.hits) / assets.boss.hitsRequired;
            
            // Background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(x, y, barWidth, barHeight);
            
            // Health
            ctx.fillStyle = secondBoss.invulnerable ? '#FFFF00' : '#FF3300';
            ctx.fillRect(x, y, barWidth * healthPercentage, barHeight);
            
            // Border
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, barWidth, barHeight);
            
            // Text
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('STRAWBERRY BOSS', canvas.width / 2, y - 5);
        }
    }
}

// Reset player after death
function resetPlayerAfterDeath() {
    player.isAlive = true;
    player.invulnerable = true;
    player.invulnerableTimer = 60; // Invulnerable for 60 frames
    player.y = 0;
    player.velocityY = 0;
    player.velocityX = 0;
    player.jumping = false;
    player.doubleJumping = false;
    player.canDoubleJump = false;
    
    // Move player back a bit from where they died
    player.x = Math.max(100, player.x - 200);
}

// Show message
function showMessage(text) {
    if (levelSelectionMode) {
        drawLevelSelectionScreen(text);
    } else {
        drawGameMessage(text);
    }
}

// Animation variables for level selection
let titlePulse = 0;
let titlePulseDirection = 1;

// Draw beautiful level selection screen
function drawLevelSelectionScreen(title) {
    // Update title pulse animation
    titlePulse += titlePulseDirection * 0.02;
    if (titlePulse > 1) {
        titlePulse = 1;
        titlePulseDirection = -1;
    } else if (titlePulse < 0) {
        titlePulse = 0;
        titlePulseDirection = 1;
    }
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1e3c72');
    gradient.addColorStop(0.5, '#2a5298');
    gradient.addColorStop(1, '#1e3c72');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add subtle pattern overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 0; i < canvas.width; i += 40) {
        for (let j = 0; j < canvas.height; j += 40) {
            if ((i + j) % 80 === 0) {
                ctx.fillRect(i, j, 20, 20);
            }
        }
    }
    
    // Main title with animated glow effect
    const glowIntensity = 15 + titlePulse * 10;
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = glowIntensity;
    ctx.fillStyle = `rgba(255, 215, 0, ${0.8 + titlePulse * 0.2})`;
    
    // Responsive font size for title
    const titleFontSize = Math.max(24, Math.min(36, canvas.width * 0.045));
    ctx.font = `bold ${titleFontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(title, canvas.width / 2, canvas.height * 0.16);
    
    // Reset shadow
    ctx.shadowBlur = 0;
    
    // Subtitle
    ctx.fillStyle = '#E8E8E8';
    const subtitleFontSize = Math.max(14, Math.min(18, canvas.width * 0.0225));
    ctx.font = `${subtitleFontSize}px Arial`;
    ctx.fillText('Choose Your Adventure', canvas.width / 2, canvas.height * 0.22);
    
    // Level buttons data
    const levels = [
        {
            number: 1,
            title: 'Beginner',
            subtitle: 'Learn the basics',
            color: '#4CAF50',
            hoverColor: '#45a049',
            icon: '🌱'
        },
        {
            number: 2,
            title: 'Lava Challenge',
            subtitle: 'Avoid the lava gaps',
            color: '#FF5722',
            hoverColor: '#e64a19',
            icon: '🌋'
        },
        {
            number: 3,
            title: 'Cherry Chaos',
            subtitle: 'Explosive enemies',
            color: '#E91E63',
            hoverColor: '#c2185b',
            icon: '🍒'
        },
        {
            number: 4,
            title: 'Double Boss',
            subtitle: 'Ultimate challenge',
            color: '#9C27B0',
            hoverColor: '#7b1fa2',
            icon: '👹'
        }
    ];
    
    // Responsive button layout
    const baseButtonWidth = 160;
    const baseButtonHeight = 70;
    const buttonWidth = Math.max(120, Math.min(baseButtonWidth, canvas.width * 0.2));
    const buttonHeight = Math.max(50, Math.min(baseButtonHeight, canvas.height * 0.14));
    const spacingX = Math.max(20, canvas.width * 0.0375);
    const spacingY = Math.max(15, canvas.height * 0.04);
    
    // Check if we should use single column layout for very small screens
    const useColumnLayout = canvas.width < 400 || canvas.height < 300;
    
    if (useColumnLayout) {
        // Single column layout for very small screens
        const startX = canvas.width / 2 - buttonWidth / 2;
        const startY = canvas.height * 0.3;
        
        levels.forEach((level, index) => {
            const x = startX;
            const y = startY + index * (buttonHeight + spacingY);
            
            drawLevelButton(x, y, buttonWidth, buttonHeight, level, currentLevel === level.number, true);
        });
    } else {
        // 2x2 grid layout for larger screens
        const startX = canvas.width / 2 - buttonWidth - spacingX / 2;
        const startY = canvas.height * 0.32;
        
        levels.forEach((level, index) => {
            const col = index % 2;
            const row = Math.floor(index / 2);
            
            const x = startX + col * (buttonWidth + spacingX);
            const y = startY + row * (buttonHeight + spacingY);
            
            drawLevelButton(x, y, buttonWidth, buttonHeight, level, currentLevel === level.number, false);
        });
    }
    
    // Instructions at bottom (responsive positioning)
    ctx.fillStyle = '#B0B0B0';
    const instructionFontSize = Math.max(12, Math.min(16, canvas.width * 0.02));
    ctx.font = `${instructionFontSize}px Arial`;
    ctx.textAlign = 'center';
    
    const instructionText = (isMobile || isTouch) ? 
        'Tap a level or use mobile controls below' : 
        'Click a level or press 1-4 on your keyboard';
    
    ctx.fillText(instructionText, canvas.width / 2, canvas.height * 0.94);
}

// Draw individual level button
function drawLevelButton(x, y, width, height, level, isSelected, isCompact = false) {
    const isHovered = hoveredButton === (level.number - 1);
    
    // Button shadow (larger for hover effect)
    ctx.fillStyle = isHovered ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.3)';
    const shadowOffset = isHovered ? 5 : 3;
    ctx.fillRect(x + shadowOffset, y + shadowOffset, width, height);
    
    // Button background with gradient
    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    if (isSelected) {
        gradient.addColorStop(0, level.hoverColor);
        gradient.addColorStop(1, level.color);
    } else if (isHovered) {
        gradient.addColorStop(0, level.color);
        gradient.addColorStop(0.5, level.hoverColor);
        gradient.addColorStop(1, level.color);
    } else {
        gradient.addColorStop(0, level.color);
        gradient.addColorStop(1, level.hoverColor);
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);
    
    // Button border (glowing effect for hover)
    if (isHovered && !isSelected) {
        ctx.shadowColor = level.color;
        ctx.shadowBlur = 10;
    }
    ctx.strokeStyle = isSelected ? '#FFD700' : (isHovered ? '#FFFFFF' : 'rgba(255, 255, 255, 0.3)');
    ctx.lineWidth = isSelected ? 3 : (isHovered ? 2 : 1);
    ctx.strokeRect(x, y, width, height);
    ctx.shadowBlur = 0; // Reset shadow
    
    // Responsive sizing based on button dimensions
    const scale = Math.min(width / 160, height / 70);
    
    // Level number circle
    const circleX = x + (isCompact ? 15 : 20) * scale;
    const circleY = y + height / 2;
    const circleRadius = (isHovered ? 16 : 15) * scale;
    
    ctx.fillStyle = isHovered ? '#FFFFFF' : 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = level.color;
    const numberFontSize = Math.max(12, (isHovered ? 18 : 16) * scale);
    ctx.font = `bold ${numberFontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(level.number.toString(), circleX, circleY + 6 * scale);
    
    // Level icon (positioned to avoid overlap)
    const iconFontSize = Math.max(14, (isHovered ? 20 : 18) * scale);
    ctx.font = `${iconFontSize}px Arial`;
    ctx.fillText(level.icon, x + width - (isCompact ? 15 : 20) * scale, y + (isCompact ? 15 : 20) * scale);
    
    // Level title (adjusted position to avoid overlap with icon)
    ctx.fillStyle = isHovered ? '#FFFFFF' : 'rgba(255, 255, 255, 0.95)';
    const titleFontSize = Math.max(10, (isHovered ? 14 : 13) * scale);
    ctx.font = `bold ${titleFontSize}px Arial`;
    ctx.textAlign = 'left';
    const titleX = x + (isCompact ? 35 : 42) * scale;
    const titleY = y + (isCompact ? 18 : 22) * scale;
    ctx.fillText(level.title, titleX, titleY);
    
    // Level subtitle (only show if there's enough space)
    if (height > 50) {
        ctx.fillStyle = isHovered ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.8)';
        const subtitleFontSize = Math.max(8, (isHovered ? 11 : 10) * scale);
        ctx.font = `${subtitleFontSize}px Arial`;
        ctx.fillText(level.subtitle, titleX, titleY + 16 * scale);
        
        // Difficulty stars (positioned below subtitle)
        const stars = level.number;
        ctx.fillStyle = isHovered ? '#FFD700' : '#FFA500';
        const starFontSize = Math.max(8, 10 * scale);
        ctx.font = `${starFontSize}px Arial`;
        let starText = '';
        for (let i = 0; i < stars; i++) {
            starText += '★';
        }
        for (let i = stars; i < 4; i++) {
            starText += '☆';
        }
        ctx.fillText(starText, titleX, titleY + 30 * scale);
    }
    
    // Speed indicator (bottom right, only if there's space)
    if (width > 100) {
        let speedText = '';
        if (level.number === 1) speedText = '85%';
        else if (level.number === 2) speedText = '100%';
        else if (level.number === 3) speedText = '110%';
        else if (level.number === 4) speedText = '120%';
        
        ctx.fillStyle = isHovered ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.6)';
        const speedFontSize = Math.max(7, 9 * scale);
        ctx.font = `${speedFontSize}px Arial`;
        ctx.textAlign = 'right';
        ctx.fillText(speedText, x + width - 8 * scale, y + height - 6 * scale);
    }
}

// Draw regular game message (non-level selection)
function drawGameMessage(text) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Main title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2 - 50);
    // Regular game message
    ctx.font = '18px Arial';
    ctx.fillText('Click anywhere to play', canvas.width / 2, canvas.height / 2 + 20);
    
    // Controls info - condensed to one line, smaller font
    ctx.font = '14px Arial';
    ctx.fillText('Controls: WASD/Arrows to move, Space/W/Up to double jump', canvas.width / 2, canvas.height / 2 + 50);
    
    if (bossDefeated) {
        ctx.fillStyle = '#FFFF00';
        
        // For level 4, show different message based on which bosses are defeated
        if (currentLevel === 4) {
            if (bossDefeated && secondBossDefeated) {
                ctx.fillText('Both bosses defeated! Congratulations!', canvas.width / 2, canvas.height / 2 + 80);
            } else if (bossDefeated) {
                ctx.fillText('Cherry boss defeated! Now defeat the Strawberry boss!', canvas.width / 2, canvas.height / 2 + 80);
            } else if (secondBossDefeated) {
                ctx.fillText('Strawberry boss defeated! Now defeat the Cherry boss!', canvas.width / 2, canvas.height / 2 + 80);
            }
        } else {
            ctx.fillText('Boss defeated! Congratulations!', canvas.width / 2, canvas.height / 2 + 80);
        }
        
        if (currentLevel > 1) {
            ctx.fillStyle = '#00FF00';
            ctx.fillText('Next level: ' + Math.round((speedMultiplier - 0.85) * 100 / 0.85) + '% faster', canvas.width / 2, canvas.height / 2 + 100);
        }
    }
    
    // Level-specific info
    if (currentLevel === 2) {
        ctx.fillStyle = '#FF4500';
        ctx.fillText('LEVEL 2: Watch out for LAVA GAPS!', canvas.width / 2, canvas.height / 2 + 120);
    } else if (currentLevel === 3) {
        ctx.fillStyle = '#FF0066';
        ctx.fillText('LEVEL 3: Cherry Chaos - Beware the cherry enemies!', canvas.width / 2, canvas.height / 2 + 120);
    } else if (currentLevel === 4) {
        ctx.fillStyle = '#FF0066';
        ctx.fillText('LEVEL 4: Double Boss Challenge - Defeat BOTH bosses to win!', canvas.width / 2, canvas.height / 2 + 120);
    }
}
// Track mouse position for hover effects
let mouseX = 0;
let mouseY = 0;
let hoveredButton = -1;

// Mouse move event for hover effects (desktop only)
canvas.addEventListener('mousemove', (e) => {
    if ((levelSelectionMode && !gameRunning) && !isMobile) {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
        
        // Convert screen coordinates to canvas coordinates
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        mouseX *= scaleX;
        mouseY *= scaleY;
        
        updateHoveredButton();
    }
});

// Touch events for mobile
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (levelSelectionMode && !gameRunning) {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const touchX = (touch.clientX - rect.left) * (canvas.width / rect.width);
        const touchY = (touch.clientY - rect.top) * (canvas.height / rect.height);
        
        handleLevelSelection(touchX, touchY);
    }
}, { passive: false });

// Update hovered button based on mouse/touch position
function updateHoveredButton() {
    const useColumnLayout = canvas.width < 400 || canvas.height < 300;
    const baseButtonWidth = 160;
    const baseButtonHeight = 70;
    const buttonWidth = Math.max(120, Math.min(baseButtonWidth, canvas.width * 0.2));
    const buttonHeight = Math.max(50, Math.min(baseButtonHeight, canvas.height * 0.14));
    const spacingX = Math.max(20, canvas.width * 0.0375);
    const spacingY = Math.max(15, canvas.height * 0.04);
    
    hoveredButton = -1;
    
    if (useColumnLayout) {
        // Single column layout
        const startX = canvas.width / 2 - buttonWidth / 2;
        const startY = canvas.height * 0.3;
        
        for (let i = 0; i < 4; i++) {
            const buttonX = startX;
            const buttonY = startY + i * (buttonHeight + spacingY);
            
            if (mouseX >= buttonX && mouseX <= buttonX + buttonWidth && 
                mouseY >= buttonY && mouseY <= buttonY + buttonHeight) {
                hoveredButton = i;
                canvas.style.cursor = 'pointer';
                break;
            }
        }
    } else {
        // 2x2 grid layout
        const startX = canvas.width / 2 - buttonWidth - spacingX / 2;
        const startY = canvas.height * 0.32;
        
        for (let i = 0; i < 4; i++) {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const buttonX = startX + col * (buttonWidth + spacingX);
            const buttonY = startY + row * (buttonHeight + spacingY);
            
            if (mouseX >= buttonX && mouseX <= buttonX + buttonWidth && 
                mouseY >= buttonY && mouseY <= buttonY + buttonHeight) {
                hoveredButton = i;
                canvas.style.cursor = 'pointer';
                break;
            }
        }
    }
    
    if (hoveredButton === -1) {
        canvas.style.cursor = 'default';
    }
}

// Handle level selection (both mouse and touch)
function handleLevelSelection(x, y) {
    const useColumnLayout = canvas.width < 400 || canvas.height < 300;
    const baseButtonWidth = 160;
    const baseButtonHeight = 70;
    const buttonWidth = Math.max(120, Math.min(baseButtonWidth, canvas.width * 0.2));
    const buttonHeight = Math.max(50, Math.min(baseButtonHeight, canvas.height * 0.14));
    const spacingX = Math.max(20, canvas.width * 0.0375);
    const spacingY = Math.max(15, canvas.height * 0.04);
    
    if (useColumnLayout) {
        // Single column layout
        const startX = canvas.width / 2 - buttonWidth / 2;
        const startY = canvas.height * 0.3;
        
        for (let i = 0; i < 4; i++) {
            const buttonX = startX;
            const buttonY = startY + i * (buttonHeight + spacingY);
            
            if (x >= buttonX && x <= buttonX + buttonWidth && 
                y >= buttonY && y <= buttonY + buttonHeight) {
                selectLevel(i + 1);
                break;
            }
        }
    } else {
        // 2x2 grid layout
        const startX = canvas.width / 2 - buttonWidth - spacingX / 2;
        const startY = canvas.height * 0.32;
        
        for (let i = 0; i < 4; i++) {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const buttonX = startX + col * (buttonWidth + spacingX);
            const buttonY = startY + row * (buttonHeight + spacingY);
            
            if (x >= buttonX && x <= buttonX + buttonWidth && 
                y >= buttonY && y <= buttonY + buttonHeight) {
                selectLevel(i + 1);
                break;
            }
        }
    }
}

// Select level and start game
function selectLevel(levelNumber) {
    currentLevel = levelNumber;
    levelSelectionMode = false;
    initLevel();
    gameRunning = true;
    gameLoop();
}

// Handle mouse clicks for level selection
canvas.addEventListener('click', (e) => {
    if (levelSelectionMode && !gameRunning) {
        // Get mouse position relative to canvas
        const rect = canvas.getBoundingClientRect();
        const clickX = (e.clientX - rect.left) * (canvas.width / rect.width);
        const clickY = (e.clientY - rect.top) * (canvas.height / rect.height);
        
        handleLevelSelection(clickX, clickY);
    }
});

// Canvas click event for starting game
canvas.addEventListener('click', () => {
    if (!gameRunning && !levelSelectionMode) {
        // Show level selection
        levelSelectionMode = true;
        showMessage("VOOO's Adventure");
        levelSelectionLoop(); // Start animation loop
    }
});

// This duplicate event listener has been removed// Keyboard controls
// Input validation and sanitization
class InputManager {
    constructor() {
        this.keys = {};
        this.validKeys = new Set([
            'KeyW', 'KeyA', 'KeyS', 'KeyD',
            'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
            'Space', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit9',
            'Numpad1', 'Numpad2', 'Numpad3', 'Numpad4', 'Numpad9'
        ]);
        this.cheatSequence = [];
        this.lastInputTime = 0;
        this.inputCooldown = 16; // ~60fps limit
    }
    
    // Validate key input
    isValidKey(keyCode) {
        return this.validKeys.has(keyCode);
    }
    
    // Rate limiting for inputs
    canProcessInput() {
        const now = performance.now();
        if (now - this.lastInputTime < this.inputCooldown) {
            return false;
        }
        this.lastInputTime = now;
        return true;
    }
    
    // Sanitize and process key down
    handleKeyDown(event) {
        // Validate event
        if (!event || !event.code) {
            console.warn('Invalid key event');
            return false;
        }
        
        // Rate limiting
        if (!this.canProcessInput()) {
            return false;
        }
        
        // Validate key
        if (!this.isValidKey(event.code)) {
            console.warn(`Invalid key: ${event.code}`);
            return false;
        }
        
        // Prevent key repeat spam
        if (this.keys[event.code]) {
            return false;
        }
        
        this.keys[event.code] = true;
        return true;
    }
    
    // Handle key up
    handleKeyUp(event) {
        if (!event || !event.code) {
            return false;
        }
        
        if (this.isValidKey(event.code)) {
            this.keys[event.code] = false;
            return true;
        }
        
        return false;
    }
    
    // Process cheat code with validation
    processCheatCode(keyCode) {
        if (keyCode === 'Digit9' || keyCode === 'Numpad9') {
            this.cheatSequence.push('9');
            
            // Limit sequence length for security
            if (this.cheatSequence.length > 3) {
                this.cheatSequence.shift();
            }
            
            // Check for valid cheat sequence
            if (this.cheatSequence.length === 3 && 
                this.cheatSequence.every(digit => digit === '9') && 
                !cheatActivated) {
                
                this.activateCheat();
                return true;
            }
        } else {
            // Reset sequence on any other key
            this.cheatSequence = [];
        }
        
        return false;
    }
    
    // Safely activate cheat
    activateCheat() {
        try {
            lives = GAME_CONFIG.GAME.CHEAT_LIVES;
            updateLivesDisplay();
            cheatActivated = true;
            
            this.showCheatMessage();
        } catch (error) {
            console.error('Error activating cheat:', error);
        }
    }
    
    // Show cheat activation message safely
    showCheatMessage() {
        try {
            const cheatMessage = document.createElement('div');
            cheatMessage.textContent = '🎮 CHEAT ACTIVATED: 999 LIVES! 🎮';
            cheatMessage.style.cssText = `
                position: absolute;
                top: 100px;
                left: 50%;
                transform: translateX(-50%);
                background-color: rgba(255, 215, 0, 0.9);
                color: #FF0000;
                padding: 10px 20px;
                border-radius: 5px;
                font-weight: bold;
                font-size: 20px;
                z-index: 1000;
                pointer-events: none;
                box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            `;
            
            document.body.appendChild(cheatMessage);
            
            // Remove message after 3 seconds
            setTimeout(() => {
                if (document.body.contains(cheatMessage)) {
                    document.body.removeChild(cheatMessage);
                }
            }, 3000);
            
        } catch (error) {
            console.error('Error showing cheat message:', error);
        }
    }
    
    // Process level selection with validation
    processLevelSelection(keyCode) {
        if (!levelSelectionMode || gameRunning) {
            return false;
        }
        
        const levelMap = {
            'Digit1': 1, 'Numpad1': 1,
            'Digit2': 2, 'Numpad2': 2,
            'Digit3': 3, 'Numpad3': 3,
            'Digit4': 4, 'Numpad4': 4
        };
        
        const selectedLevel = levelMap[keyCode];
        if (selectedLevel && selectedLevel >= 1 && selectedLevel <= maxLevel) {
            currentLevel = selectedLevel;
            levelSelectionMode = false;
            initLevel();
            gameRunning = true;
            performanceManager.start();
            gameLoop();
            return true;
        }
        
        return false;
    }
}

// Initialize input manager
const inputManager = new InputManager();

// Legacy keys object for backward compatibility
let keys = {};
// cheatSequence already declared above - removed duplicate

// Enhanced keyboard event handlers with validation
window.addEventListener('keydown', (e) => {
    // Validate and process input
    if (!inputManager.handleKeyDown(e)) {
        return;
    }
    
    // Update legacy keys object
    keys[e.code] = true;
    
    // Process cheat code
    inputManager.processCheatCode(e.code);
    
    // Process level selection
    if (inputManager.processLevelSelection(e.code)) {
        return;
    }
    
    // Handle jump key press
    if ((e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') && gameRunning) {
        // First jump
        if (!player.jumping) {
            player.velocityY = player.jumpPower;
            player.jumping = true;
            player.canDoubleJump = doubleJumpEnabled;
            assets.vooo.isJumping = true;
        }
        // Double jump
        else if (player.canDoubleJump && !player.doubleJumping) {
            player.velocityY = player.doubleJumpPower;
            player.doubleJumping = true;
            player.canDoubleJump = false;
            
            // Visual effect for double jump
            createDoubleJumpEffect();
        }
    }
    
    // Prevent default for arrow keys and space to avoid page scrolling
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// Initialize game
window.addEventListener('load', () => {
    // Wait for images to load
    let imagesLoaded = 0;
    const totalImages = 4; // running.png, jumping.png, enemies.png, boss.png
    
    function checkAllImagesLoaded() {
        imagesLoaded++;
        if (imagesLoaded === totalImages) {
            initLevel();
            levelSelectionMode = true;
            showMessage("VOOO's Adventure");
        }
    }
    
    loadAssets();
    
    // Add load event listeners to images
    assets.vooo.running.onload = checkAllImagesLoaded;
    assets.vooo.jumping.onload = checkAllImagesLoaded;
    assets.strawberry.img.onload = checkAllImagesLoaded;
    assets.boss.img.onload = checkAllImagesLoaded;
    
    // Handle image loading errors
    assets.vooo.running.onerror = function() {
        console.error("Error loading running.png");
        checkAllImagesLoaded();
    };
    assets.vooo.jumping.onerror = function() {
        console.error("Error loading jumping.png");
        checkAllImagesLoaded();
    };
    assets.strawberry.img.onerror = function() {
        console.error("Error loading enemies.png");
        checkAllImagesLoaded();
    };
    assets.boss.img.onerror = function() {
        console.error("Error loading boss.png");
        checkAllImagesLoaded();
    };
});
// Create double jump effect
function createDoubleJumpEffect() {
    // Create particles for double jump effect
    const particleCount = 15;
    const particles = [];
    
    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 2;
        const size = Math.random() * 5 + 3;
        
        particles.push({
            x: player.x + player.width / 2,
            y: player.y + player.height,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: size,
            color: '#FFFFFF',
            life: 20
        });
    }
    
    // Animate particles
    function animateParticles() {
        if (particles.length === 0) return;
        
        // Update and draw particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            
            // Update position
            p.x += p.vx;
            p.y += p.vy;
            
            // Apply gravity
            p.vy += 0.1;
            
            // Decrease life
            p.life--;
            
            // Remove dead particles
            if (p.life <= 0) {
                particles.splice(i, 1);
                continue;
            }
            
            // Draw particle
            const screenX = p.x - cameraX;
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life / 20;
            ctx.beginPath();
            ctx.arc(screenX, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
        
        // Continue animation if particles remain
        if (particles.length > 0) {
            requestAnimationFrame(animateParticles);
        }
    }
    
    // Start animation
    animateParticles();
}
// Initialize the game when the page loads
window.addEventListener('load', () => {
    // Show level selection immediately
    levelSelectionMode = true;
    showMessage("VOOO's Adventure");
    
    // Start level selection animation loop
    levelSelectionLoop();
    
    // Load assets
    loadAssets();
});
