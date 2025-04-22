/**
 * VOOO's Adventure Game - Game Engine
 * Core game engine functionality
 */

// Game engine namespace
const Engine = {
    // Canvas and context
    canvas: null,
    ctx: null,
    
    // Game state
    gameRunning: false,
    currentLevel: 1,
    maxLevel: 2,
    score: 0,
    lives: 3,
    
    // Physics constants
    baseGravity: 0.46,
    gravity: 0.46,
    speedMultiplier: 0.85,
    
    // Camera
    cameraX: 0,
    
    // Input tracking
    keys: {},
    
    /**
     * Initialize the game engine
     */
    init: function() {
        // Set up canvas
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = 800;
        this.canvas.height = 500;
        
        // Initialize UI
        UI.init();
        
        // Load assets
        Assets.loadAll(() => {
            // Assets loaded, show start screen
            UI.showStartScreen();
        });
        
        // Set up event listeners
        this.setupEventListeners();
    },
    
    /**
     * Set up event listeners for keyboard and buttons
     */
    setupEventListeners: function() {
        // Keyboard events
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            // Prevent scrolling with arrow keys and space
            if(['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                e.preventDefault();
            }
            
            // Handle jump
            if ((e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') && 
                this.gameRunning && !Player.jumping) {
                Player.jump();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Start button
        document.getElementById('startButton').addEventListener('click', () => {
            if (!this.gameRunning) {
                this.startGame();
            }
        });
    },
    
    /**
     * Start a new game
     */
    startGame: function() {
        this.gameRunning = true;
        this.score = 0;
        this.lives = 3;
        
        // Update speed multiplier based on level
        this.updateSpeedMultiplier();
        
        // Initialize level
        LevelManager.loadLevel(this.currentLevel);
        
        // Initialize player
        Player.init();
        
        // Update UI
        UI.updateScoreDisplay(this.score);
        UI.updateLivesDisplay(this.lives);
        
        // Start game loop
        this.gameLoop();
    },
    
    /**
     * Update speed multiplier based on current level
     */
    updateSpeedMultiplier: function() {
        if (this.currentLevel === 1) {
            this.speedMultiplier = 0.85; // Level 1: 15% slower
        } else {
            this.speedMultiplier = 1 + ((this.currentLevel - 2) * 0.1); // Increase by 10% per level after level 2
        }
        
        // Update gravity based on speed multiplier
        this.gravity = this.baseGravity * this.speedMultiplier;
    },
    
    /**
     * Main game loop
     */
    gameLoop: function() {
        if (!this.gameRunning) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update game state
        this.update();
        
        // Draw everything
        this.draw();
        
        // Continue loop
        requestAnimationFrame(() => this.gameLoop());
    },
    
    /**
     * Update game state
     */
    update: function() {
        // Update player
        Player.update();
        
        // Update enemies
        Enemies.update();
        
        // Update boss
        Boss.update();
        
        // Check for level completion
        if (Boss.defeated && Player.x + Player.width > LevelManager.currentLevel.end.x) {
            this.gameRunning = false;
            this.currentLevel++;
            UI.showLevelComplete(this.score);
        }
        
        // Check if player is alive
        if (!Player.isAlive) {
            this.lives--;
            UI.updateLivesDisplay(this.lives);
            
            if (this.lives <= 0) {
                this.gameRunning = false;
                UI.showGameOver(this.score);
            } else {
                Player.resetAfterDeath();
            }
        }
    },
    
    /**
     * Draw game elements
     */
    draw: function() {
        // Draw background
        Background.draw();
        
        // Draw platforms
        LevelManager.drawPlatforms();
        
        // Draw obstacles
        LevelManager.drawObstacles();
        
        // Draw level end
        LevelManager.drawLevelEnd();
        
        // Draw enemies
        Enemies.draw();
        
        // Draw player
        Player.draw();
        
        // Draw boss
        Boss.draw();
        
        // Draw boss health bar if near boss
        if (Math.abs(Player.x - Boss.x) < 500 && Boss.active) {
            Boss.drawHealthBar();
        }
    },
    
    /**
     * Add to score
     * @param {number} points - Points to add
     */
    addScore: function(points) {
        this.score += points;
        UI.updateScoreDisplay(this.score);
    }
};

// Initialize engine when window loads
window.addEventListener('load', () => Engine.init());
