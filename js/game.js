/**
 * Main game class that coordinates all game components
 */
import CONFIG from './config.js';
import AssetManager from './assets.js';
import Player from './player.js';
import EnemyManager from './enemies.js';
import Boss from './boss.js';
import LevelManager from './levels.js';
import UI from './ui.js';
import InputHandler from './input.js';

class Game {
    constructor() {
        // Canvas setup
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = CONFIG.canvas.width;
        this.canvas.height = CONFIG.canvas.height;
        
        // Game state
        this.gameRunning = false;
        this.score = 0;
        this.lives = 3;
        this.currentLevel = 1;
        this.speedMultiplier = CONFIG.levels.level1.speedMultiplier; // Level 1: 15% slower (0.85)
        this.gravity = CONFIG.physics.baseGravity * this.speedMultiplier;
        this.cameraX = 0;
        this.bossDefeated = false;
        
        // Initialize components
        this.assetManager = new AssetManager();
        this.ui = new UI(this);
        this.levelManager = new LevelManager(this);
        this.enemyManager = new EnemyManager(this);
        this.inputHandler = new InputHandler(this);
        
        // Initialize game
        this.init();
    }

    async init() {
        // Load assets
        await this.assetManager.loadAssets();
        
        // Store assets reference for easy access
        this.assets = this.assetManager.assets;
        
        // Show initial message
        this.ui.showMessage(this.ctx, "VOOO's Adventure - Level " + this.currentLevel);
    }

    startGame() {
        if (!this.gameRunning) {
            this.initLevel();
            this.gameRunning = true;
            this.gameLoop();
        }
    }

    initLevel() {
        // Reset game state
        this.score = 0;
        this.lives = 3;
        this.cameraX = 0;
        this.bossDefeated = false;
        
        // Set speed multiplier based on current level
        // Level 1: 15% slower (0.85)
        // Level 2+: Progressively faster
        this.speedMultiplier = this.currentLevel === 1 ? 
            CONFIG.levels.level1.speedMultiplier : 
            1 + ((this.currentLevel - 2) * 0.1);
        
        // Update speed-dependent variables
        this.gravity = CONFIG.physics.baseGravity * this.speedMultiplier;
        
        // Generate level
        const levelData = this.levelManager.generateLevel(this.currentLevel);
        this.platforms = levelData.platforms;
        this.obstacles = levelData.obstacles;
        this.levelEnd = levelData.levelEnd;
        
        // Create player
        this.player = new Player(this);
        
        // Create boss
        this.boss = new Boss(this);
        
        // Create enemies
        this.enemies = this.enemyManager.createEnemies(this.platforms, this.currentLevel, this.speedMultiplier);
        
        // Update UI
        this.ui.updateScoreDisplay();
        this.ui.updateLivesDisplay();
    }

    gameLoop() {
        if (!this.gameRunning) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.assetManager.drawBackground(this.ctx, this.cameraX);
        
        // Update player
        this.player.update(this.platforms, this.obstacles, this.boss, this.inputHandler.keys);
        
        // Update enemies
        this.enemyManager.update(this.player, this.platforms);
        
        // Update boss
        this.boss.update(this.platforms, this.gravity);
        
        // Draw level elements
        this.levelManager.drawPlatforms(this.ctx, this.cameraX);
        this.levelManager.drawObstacles(this.ctx, this.cameraX);
        this.levelManager.drawLevelEnd(this.ctx, this.cameraX, this.bossDefeated);
        
        // Draw entities
        this.player.draw(this.ctx, this.cameraX);
        this.enemyManager.draw(this.ctx, this.cameraX);
        this.boss.draw(this.ctx, this.cameraX);
        
        // Draw boss health bar if near boss
        if (Math.abs(this.player.x - this.boss.x) < 500 && this.boss.active) {
            this.boss.drawHealthBar(this.ctx);
        }
        
        // Check for level completion
        if (this.bossDefeated && this.player.x + this.player.width > this.levelEnd.x) {
            this.gameRunning = false;
            this.currentLevel++; // Increment level for next game
            this.ui.showMessage(this.ctx, "Level Complete! Score: " + this.score, true);
        }
        
        // Check if player is alive
        if (!this.player.isAlive) {
            this.lives--;
            this.ui.updateLivesDisplay();
            
            if (this.lives <= 0) {
                this.gameRunning = false;
                this.ui.showMessage(this.ctx, "Game Over! Score: " + this.score);
            } else {
                this.player.resetAfterDeath();
            }
        }
        
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    handleJump() {
        if (this.player) {
            this.player.jump();
        }
    }

    updateScoreDisplay() {
        this.ui.updateScoreDisplay();
    }
}

export default Game;
