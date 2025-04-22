// engine.js - Game engine and main loop

/**
 * GameEngine class for managing the game loop and state
 */
class GameEngine {
    /**
     * Create a new GameEngine
     * @param {Object} config - Game configuration
     */
    constructor(config) {
        this.config = config;
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = config.CANVAS_WIDTH;
        this.canvas.height = config.CANVAS_HEIGHT;
        
        // Game state
        this.gameRunning = false;
        this.levelSelectionMode = false;
        this.currentLevel = 1;
        this.lives = config.STARTING_LIVES;
        this.cameraX = 0;
        this.bossDefeated = false;
        this.doubleJumpEnabled = true;
        
        // Initialize managers
        this.assetManager = new AssetManager(config);
        this.inputManager = new InputManager();
        this.levelManager = new LevelManager(config);
        this.enemyManager = new EnemyManager(config);
        this.uiManager = new UIManager(config);
        this.effectsManager = new EffectsManager(config);
        
        // Game objects
        this.player = null;
        this.boss = null;
        this.platforms = [];
        this.obstacles = [];
        this.levelEnd = null;
        
        // Calculate speed multiplier
        this.speedMultiplier = this.getSpeedMultiplier();
        this.gravity = config.BASE_GRAVITY * this.speedMultiplier;
        
        // Set up input handlers
        this.setupInputHandlers();
        
        // Make the game instance globally available
        window.game = this;
    }
    
    /**
     * Initialize the game
     */
    init() {
        // Load assets
        this.assetManager.setLevel(this.currentLevel);
        this.assetManager.loadAssets(() => {
            // Show level selection when assets are loaded
            this.levelSelectionMode = true;
            this.showMessage("VOOO's Adventure");
        });
        
        // Initialize input
        this.inputManager.init(this.canvas);
        
        // Add canvas click event for starting game
        this.canvas.addEventListener('click', () => {
            if (!this.gameRunning && !this.levelSelectionMode) {
                // Show level selection
                this.levelSelectionMode = true;
                this.showMessage("VOOO's Adventure");
            }
        });
    }
    
    /**
     * Set up input handlers
     */
    setupInputHandlers() {
        // Jump handler
        this.inputManager.onJump = () => {
            if (this.gameRunning && this.player) {
                this.player.jump(this.doubleJumpEnabled);
            }
        };
        
        // Cheat activation handler
        this.inputManager.onCheatActivated = () => {
            this.lives = 999;
            this.uiManager.updateLivesDisplay(this.lives);
            this.uiManager.showCheatActivatedMessage();
        };
        
        // Level selection handler
        this.inputManager.onLevelSelect = (level) => {
            if (this.levelSelectionMode && !this.gameRunning) {
                this.currentLevel = level;
                this.levelSelectionMode = false;
                this.initLevel();
                // The gameLoop will be started after assets are loaded in initLevel()
            }
        };
    }
    
    /**
     * Get speed multiplier based on current level
     * @returns {number} - Speed multiplier
     */
    getSpeedMultiplier() {
        if (this.currentLevel === 1) {
            return this.config.LEVEL_1_SPEED_MULTIPLIER;
        } else {
            return 1 + ((this.currentLevel - 2) * this.config.LEVEL_SPEED_INCREMENT);
        }
    }
    
    /**
     * Initialize level
     */
    initLevel() {
        // Reset game state
        this.player = null;
        this.boss = null;
        this.platforms = [];
        this.obstacles = [];
        this.cameraX = 0;
        this.bossDefeated = false;
        this.gameRunning = false; // Ensure game is not running until assets are loaded
        
        // Set speed multiplier based on current level
        this.speedMultiplier = this.getSpeedMultiplier();
        this.gravity = this.config.BASE_GRAVITY * this.speedMultiplier;
        
        // Load assets for the current level
        this.assetManager.setLevel(this.currentLevel);
        this.assetManager.loadAssets(() => {
            // Create level
            const levelData = this.levelManager.createLevel(this.currentLevel);
            this.platforms = levelData.platforms;
            this.obstacles = levelData.obstacles;
            this.levelEnd = levelData.levelEnd;
            
            // Create player
            this.player = new Player(this.config, this.assetManager.assets);
            
            // Create boss
            this.boss = new Boss(this.config, this.assetManager.assets);
            
            // Create enemies
            this.enemyManager.createEnemies(
                this.currentLevel, 
                this.platforms, 
                this.config.BOSS_AREA_START
            );
            
            // Update UI
            this.uiManager.updateScoreDisplay(this.player.score, this.currentLevel);
            this.uiManager.updateLivesDisplay(this.lives);
            
            // Now that everything is loaded and initialized, start the game
            this.gameRunning = true;
            this.gameLoop();
        });
    }
    
    /**
     * Main game loop
     */
    gameLoop() {
        if (!this.gameRunning) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.drawBackground();
        
        // Update player
        if (this.player) {
            this.player.update(
                this.inputManager.keys, 
                this.platforms, 
                this.obstacles, 
                this.boss, 
                this.gravity, 
                this.canvas.height
            );
        }
        
        // Update enemies only if player exists
        if (this.player) {
            this.enemyManager.update(
                this.platforms, 
                this.obstacles, 
                this.player, 
                this.gravity, 
                this.canvas.height, 
                this.config.BOSS_AREA_START
            );
        }
        
        // Update boss
        if (this.boss) {
            this.boss.update(this.platforms, this.gravity);
        }
        
        // Draw level elements
        this.levelManager.drawPlatforms(this.ctx, this.cameraX, this.assetManager.assets);
        this.levelManager.drawObstacles(this.ctx, this.cameraX, this.assetManager.assets);
        this.levelManager.drawLevelEnd(this.ctx, this.cameraX, this.bossDefeated);
        
        // Draw player
        if (this.player) {
            this.player.draw(this.ctx, this.cameraX);
        }
        
        // Draw enemies
        this.enemyManager.draw(
            this.ctx, 
            this.cameraX, 
            this.assetManager.assets, 
            this.currentLevel
        );
        
        // Draw boss
        if (this.boss) {
            this.boss.draw(this.ctx, this.cameraX);
            
            // Draw boss health bar if near boss
            if (this.player && 
                Math.abs(this.player.x - this.boss.x) < 500 && 
                this.boss.active) {
                this.boss.drawHealthBar(this.ctx);
            }
        }
        
        // Update camera position to follow player
        if (this.player) {
            if (this.player.x > this.canvas.width / 3 && 
                this.player.x < this.levelEnd.x - this.canvas.width * 2/3) {
                this.cameraX = this.player.x - this.canvas.width / 3;
            }
            
            // Update score display if score changed
            if (this.player.score % 100 === 0) {
                this.uiManager.updateScoreDisplay(this.player.score, this.currentLevel);
            }
        }
        
        // Check for level completion
        if (this.player && this.bossDefeated && 
            this.player.x + this.player.width > this.levelEnd.x) {
            this.gameRunning = false;
            this.currentLevel = Math.min(this.currentLevel + 1, this.config.MAX_LEVEL);
            this.showMessage("Level Complete! Score: " + this.player.score);
        }
        
        // Check if player is alive
        if (this.player && !this.player.isAlive) {
            this.lives--;
            this.uiManager.updateLivesDisplay(this.lives);
            
            if (this.lives <= 0) {
                this.gameRunning = false;
                this.showMessage("Game Over! Score: " + this.player.score);
            } else {
                this.player.resetAfterDeath();
            }
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    /**
     * Draw background with parallax effect
     */
    drawBackground() {
        // Draw each layer with parallax effect
        this.assetManager.assets.background.layers.forEach(layer => {
            const offsetX = -this.cameraX * layer.speed;
            this.ctx.drawImage(
                layer.img, 
                offsetX % this.assetManager.assets.background.width, 
                0
            );
            this.ctx.drawImage(
                layer.img, 
                offsetX % this.assetManager.assets.background.width + 
                this.assetManager.assets.background.width, 
                0
            );
        });
    }
    
    /**
     * Show message overlay
     * @param {string} text - Message text
     */
    showMessage(text) {
        this.uiManager.showMessage(
            this.ctx, 
            text, 
            this.levelSelectionMode, 
            this.currentLevel, 
            this.bossDefeated, 
            this.speedMultiplier
        );
    }
}

// Export the GameEngine class
if (typeof window !== 'undefined') {
    window.GameEngine = GameEngine;
}
