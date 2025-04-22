// enemies.js - Enemy entities and related functionality

/**
 * Enemy class representing strawberry/cherry enemies
 */
class Enemy {
    /**
     * Create a new Enemy
     * @param {Object} config - Game configuration
     * @param {Object} options - Enemy options
     * @param {number} options.x - X position
     * @param {number} options.y - Y position
     * @param {number} options.velocityX - Horizontal velocity
     * @param {number} [options.platformIndex] - Index of platform enemy is on
     */
    constructor(config, options) {
        this.config = config;
        this.x = options.x;
        this.y = options.y;
        this.width = config.ENEMY_WIDTH;
        this.height = config.ENEMY_HEIGHT;
        this.velocityX = options.velocityX;
        this.velocityY = 0;
        this.platformIndex = options.platformIndex;
        this.active = true;
    }
    
    /**
     * Update enemy state
     * @param {Array} platforms - Game platforms
     * @param {Array} obstacles - Game obstacles
     * @param {Object} player - Player object
     * @param {number} gravity - Current gravity value
     * @param {number} canvasHeight - Canvas height
     * @param {number} bossAreaStart - X position where boss area starts
     */
    update(platforms, obstacles, player, gravity, canvasHeight, bossAreaStart) {
        if (!this.active) return;
        
        // Safety check: ensure required parameters exist
        if (!platforms || !obstacles || !canvasHeight || !bossAreaStart) {
            return;
        }
        
        // Deactivate enemies that enter the boss area or buffer zone
        if (this.x > bossAreaStart) {
            this.active = false;
            return;
        }
        
        // Apply gravity to ground enemies
        if (this.platformIndex === undefined) {
            this.velocityY += gravity;
            this.y += this.velocityY;
        }
        
        // Move enemy horizontally
        this.x += this.velocityX;
        
        // Check if enemy is on a platform
        if (this.platformIndex !== undefined) {
            this.updatePlatformEnemy(platforms);
        } else {
            // Ground enemy - check if it's still on ground
            this.updateGroundEnemy(platforms, canvasHeight);
        }
        
        // Check if enemy fell into lava
        obstacles.forEach(obstacle => {
            if (obstacle.type === 'lava' &&
                this.x + this.width > obstacle.x &&
                this.x < obstacle.x + obstacle.width &&
                this.y + this.height > obstacle.y) {
                this.active = false;
            }
        });
        
        // Check collision with player only if player exists
        if (player && typeof player === 'object') {
            this.checkPlayerCollision(player);
        }
    }
    
    /**
     * Update platform-based enemy
     * @param {Array} platforms - Game platforms
     */
    updatePlatformEnemy(platforms) {
        const platform = platforms[this.platformIndex];
        
        // Skip if platform no longer exists
        if (!platform) {
            this.active = false;
            return;
        }
        
        // Keep enemy on platform
        if (this.x < platform.x) {
            this.velocityX *= -1;
            this.x = platform.x;
        } else if (this.x + this.width > platform.x + platform.width) {
            this.velocityX *= -1;
            this.x = platform.x + platform.width - this.width;
        }
    }
    
    /**
     * Update ground-based enemy
     * @param {Array} platforms - Game platforms
     * @param {number} canvasHeight - Canvas height
     */
    updateGroundEnemy(platforms, canvasHeight) {
        let onGround = false;
        
        // Check for collisions with ground platforms
        for (let i = 0; i < platforms.length; i++) {
            const platform = platforms[i];
            if (platform.type === 'ground' && 
                this.x + this.width > platform.x && 
                this.x < platform.x + platform.width &&
                this.y + this.height > platform.y &&
                this.y + this.height < platform.y + platform.height + 5) {
                
                this.y = platform.y - this.height;
                this.velocityY = 0;
                onGround = true;
                
                // If at edge of platform, turn around
                if (this.velocityX > 0 && 
                    this.x + this.width + 5 > platform.x + platform.width) {
                    this.velocityX *= -1;
                } else if (this.velocityX < 0 && 
                          this.x - 5 < platform.x) {
                    this.velocityX *= -1;
                }
                
                break;
            }
        }
        
        // If enemy is not on ground, it should fall
        if (!onGround) {
            // Check if enemy fell off screen
            if (this.y > canvasHeight) {
                this.active = false;
            }
        }
    }
    
    /**
     * Check collision with player
     * @param {Object} player - Player object
     */
    checkPlayerCollision(player) {
        // Safety check: ensure player exists and is valid
        if (!player || typeof player !== 'object') {
            return;
        }
        
        const { checkCollision } = window.GameUtils;
        
        if (this.active && !player.invulnerable &&
            checkCollision(
                player,
                this,
                { top: 5, right: 5, bottom: 5, left: 5 }
            )
        ) {
            // Check if player is jumping on enemy from above
            if (player.velocityY > 0 && player.y + player.height - player.velocityY <= this.y + this.height/4) {
                // Defeat enemy
                this.active = false;
                player.velocityY = player.jumpPower * 0.7; // Bounce
                player.score += this.config.ENEMY_DEFEAT_SCORE;
            } else {
                // Player gets hit
                player.isAlive = false;
            }
        }
    }
    
    /**
     * Draw the enemy
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} cameraX - Camera X position
     * @param {Object} assets - Game assets
     * @param {number} currentLevel - Current level
     */
    draw(ctx, cameraX, assets, currentLevel) {
        if (!this.active) return;
        
        const { safeDrawImage } = window.GameUtils;
        const screenX = this.x - cameraX;
        
        // Skip if off-screen
        if (screenX + this.width < 0 || screenX > ctx.canvas.width) return;
        
        // Choose enemy type based on level
        let enemyImage;
        if (currentLevel === 3) {
            enemyImage = assets.cherry.img;
        } else if (currentLevel === 4) {
            // For level 4, randomly choose between strawberry and cherry
            enemyImage = Math.random() > 0.5 ? assets.strawberry.img : assets.cherry.img;
        } else {
            enemyImage = assets.strawberry.img;
        }
        
        // Draw the enemy with flipping based on direction
        safeDrawImage(
            ctx,
            enemyImage,
            screenX,
            this.y,
            this.width,
            this.height,
            this.velocityX < 0
        );
    }
}

/**
 * EnemyManager class for creating and managing enemies
 */
class EnemyManager {
    /**
     * Create a new EnemyManager
     * @param {Object} config - Game configuration
     */
    constructor(config) {
        this.config = config;
        this.enemies = [];
    }
    
    /**
     * Create enemies for the current level
     * @param {number} currentLevel - Current level
     * @param {Array} platforms - Game platforms
     * @param {number} bossAreaStart - X position where boss area starts
     */
    createEnemies(currentLevel, platforms, bossAreaStart) {
        this.enemies = [];
        
        // Determine enemy count based on level
        let enemyCount;
        
        if (currentLevel === 1) {
            enemyCount = this.config.LEVEL_1_ENEMY_COUNT;
        } else if (currentLevel === 2) {
            enemyCount = Math.floor(this.config.BASE_ENEMY_COUNT * 1.1);
        } else if (currentLevel === 3) {
            enemyCount = Math.floor(this.config.BASE_ENEMY_COUNT * 1.2);
        } else if (currentLevel === 4) {
            enemyCount = this.config.LEVEL_4_ENEMY_COUNT;
        } else {
            enemyCount = Math.floor(this.config.BASE_ENEMY_COUNT * (1 + (currentLevel - 2) * 0.15));
        }
        
        // Calculate speed multiplier
        const speedMultiplier = currentLevel === 1 ? 
            this.config.LEVEL_1_SPEED_MULTIPLIER : 
            1 + ((currentLevel - 2) * this.config.LEVEL_SPEED_INCREMENT);
        
        // Create ground enemies
        for (let i = 0; i < enemyCount; i++) {
            const enemyX = 600 + i * 250 + Math.random() * 100;
            
            // Skip if enemy would be in boss area
            if (enemyX >= bossAreaStart) {
                continue;
            }
            
            // Position enemies on top of the ground
            const enemyY = this.config.CANVAS_HEIGHT - this.config.TILE_SIZE - this.config.ENEMY_HEIGHT;
            
            this.enemies.push(new Enemy(this.config, {
                x: enemyX,
                y: enemyY,
                velocityX: (Math.random() > 0.5 ? -1.5 : 1.5) * speedMultiplier
            }));
        }
        
        // Add platform-based enemies
        this.addPlatformEnemies(currentLevel, platforms, bossAreaStart, speedMultiplier);
    }
    
    /**
     * Add enemies on platforms
     * @param {number} currentLevel - Current level
     * @param {Array} platforms - Game platforms
     * @param {number} bossAreaStart - X position where boss area starts
     * @param {number} speedMultiplier - Speed multiplier for current level
     */
    addPlatformEnemies(currentLevel, platforms, bossAreaStart, speedMultiplier) {
        // Determine platform enemy chance based on level
        let platformEnemyChance;
        
        if (currentLevel === 1) {
            platformEnemyChance = this.config.LEVEL_1_PLATFORM_ENEMY_CHANCE;
        } else if (currentLevel === 2) {
            platformEnemyChance = this.config.LEVEL_2_PLATFORM_ENEMY_CHANCE;
        } else if (currentLevel === 3) {
            platformEnemyChance = this.config.LEVEL_3_PLATFORM_ENEMY_CHANCE;
        } else if (currentLevel === 4) {
            platformEnemyChance = this.config.LEVEL_4_PLATFORM_ENEMY_CHANCE;
        } else {
            platformEnemyChance = this.config.LEVEL_3_PLATFORM_ENEMY_CHANCE;
        }
        
        // Filter platforms to only include those outside the boss area
        const nonBossPlatforms = platforms.filter(platform => 
            platform.x < bossAreaStart || platform.type === 'ground'
        );
        
        nonBossPlatforms.forEach((platform, index) => {
            // Skip ground platforms and platforms in boss area
            if (platform.type === 'ground' || platform.x >= bossAreaStart) {
                return;
            }
            
            if (platform.width > 80 && Math.random() > (1 - platformEnemyChance)) {
                this.enemies.push(new Enemy(this.config, {
                    x: platform.x + platform.width/2,
                    y: platform.y - this.config.ENEMY_HEIGHT,
                    velocityX: (Math.random() > 0.5 ? -1.5 : 1.5) * speedMultiplier,
                    platformIndex: platforms.indexOf(platform)
                }));
            }
        });
    }
    
    /**
     * Update all enemies
     * @param {Array} platforms - Game platforms
     * @param {Array} obstacles - Game obstacles
     * @param {Object} player - Player object
     * @param {number} gravity - Current gravity value
     * @param {number} canvasHeight - Canvas height
     * @param {number} bossAreaStart - X position where boss area starts
     */
    update(platforms, obstacles, player, gravity, canvasHeight, bossAreaStart) {
        // Safety check: ensure player exists before updating enemies
        if (!player || typeof player !== 'object') {
            return;
        }
        
        this.enemies.forEach(enemy => {
            enemy.update(platforms, obstacles, player, gravity, canvasHeight, bossAreaStart);
        });
    }
    
    /**
     * Draw all enemies
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} cameraX - Camera X position
     * @param {Object} assets - Game assets
     * @param {number} currentLevel - Current level
     */
    draw(ctx, cameraX, assets, currentLevel) {
        this.enemies.forEach(enemy => {
            enemy.draw(ctx, cameraX, assets, currentLevel);
        });
    }
}

// Export the classes
if (typeof window !== 'undefined') {
    window.Enemy = Enemy;
    window.EnemyManager = EnemyManager;
}
