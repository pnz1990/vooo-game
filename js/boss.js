// boss.js - Boss entity and related functionality

/**
 * Boss class representing the final boss
 */
class Boss {
    /**
     * Create a new Boss
     * @param {Object} config - Game configuration
     * @param {Object} assets - Game assets
     * @param {boolean} isSecondBoss - Whether this is the second boss (for level 4)
     */
    constructor(config, assets, isSecondBoss = false) {
        this.config = config;
        this.assets = assets;
        this.isSecondBoss = isSecondBoss;
        
        // Calculate speed based on current level
        const speedMultiplier = this.getCurrentSpeedMultiplier();
        
        // Position the boss - second boss is positioned differently
        this.x = isSecondBoss ? 8000 : 7800;
        this.y = 0;
        this.width = assets.boss.width;
        this.height = assets.boss.height;
        this.velocityX = config.BASE_BOSS_VELOCITY * speedMultiplier * (isSecondBoss ? -1 : 1);
        this.velocityY = 0;
        this.active = true;
        this.hits = 0;
        this.invulnerable = false;
        this.invulnerableTimer = 0;
        this.jumpPower = config.BASE_BOSS_JUMP_POWER * speedMultiplier;
    }
    
    /**
     * Get current speed multiplier based on level
     * @returns {number} - Speed multiplier
     */
    getCurrentSpeedMultiplier() {
        const currentLevel = window.game.currentLevel;
        if (currentLevel === 1) {
            return this.config.LEVEL_1_SPEED_MULTIPLIER;
        } else {
            return 1 + ((currentLevel - 2) * this.config.LEVEL_SPEED_INCREMENT);
        }
    }
    
    /**
     * Reset boss for a new level
     */
    reset() {
        // Calculate speed based on current level
        const speedMultiplier = this.getCurrentSpeedMultiplier();
        
        this.x = 7800;
        this.y = 0;
        this.velocityX = this.config.BASE_BOSS_VELOCITY * speedMultiplier;
        this.velocityY = 0;
        this.active = true;
        this.hits = 0;
        this.invulnerable = false;
        this.invulnerableTimer = 0;
        this.jumpPower = this.config.BASE_BOSS_JUMP_POWER * speedMultiplier;
    }
    
    /**
     * Update boss state
     * @param {Array} platforms - Game platforms
     * @param {number} gravity - Current gravity value
     */
    update(platforms, gravity) {
        if (!this.active) return;
        
        // Apply gravity
        this.velocityY += gravity * 0.8;
        
        // Update boss position
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Check for collisions with platforms - ONLY ground platforms in boss area
        platforms.forEach(platform => {
            // Skip non-ground platforms in boss area
            if (this.x > this.config.BOSS_AREA_START && platform.type !== 'ground') {
                return;
            }
            
            if (
                this.y + this.height > platform.y &&
                this.y < platform.y + platform.height &&
                this.x + this.width - 5 > platform.x &&
                this.x + 5 < platform.x + platform.width
            ) {
                // Collision from above (landing on platform)
                if (this.velocityY > 0 && this.y + this.height - this.velocityY <= platform.y + 10) {
                    this.y = platform.y - this.height;
                    this.velocityY = 0;
                    
                    // Random jump
                    if (Math.random() < 0.02) {
                        this.velocityY = this.jumpPower;
                    }
                }
            }
        });
        
        // Reverse direction if hitting level boundaries
        if (this.x < 7600 || this.x > 8000 - this.width) {
            this.velocityX *= -1;
        }
        
        // Handle invulnerability timer
        if (this.invulnerable) {
            this.invulnerableTimer--;
            if (this.invulnerableTimer <= 0) {
                this.invulnerable = false;
            }
        }
    }
    
    /**
     * Draw the boss
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} cameraX - Camera X position
     */
    draw(ctx, cameraX) {
        if (!this.active) return;
        
        const { safeDrawImage } = window.GameUtils;
        const screenX = this.x - cameraX;
        
        // Skip if off-screen
        if (screenX + this.width < 0 || screenX > ctx.canvas.width) return;
        
        // Skip drawing if boss is invulnerable and should blink
        if (this.invulnerable && Math.floor(this.invulnerableTimer / 5) % 2 === 0) {
            return;
        }
        
        // Draw boss with proper orientation
        safeDrawImage(
            ctx,
            this.assets.boss.img,
            screenX,
            this.y,
            this.width,
            this.height,
            this.velocityX < 0 || this.isSecondBoss
        );
    }
    
    /**
     * Draw boss health bar
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    drawHealthBar(ctx) {
        const barWidth = 200;
        const barHeight = 20;
        const x = ctx.canvas.width / 2 - barWidth / 2;
        const y = 50;
        const healthPercentage = (this.assets.boss.hitsRequired - this.hits) / this.assets.boss.hitsRequired;
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Health
        ctx.fillStyle = this.invulnerable ? '#FFFF00' : '#FF0000';
        ctx.fillRect(x, y, barWidth * healthPercentage, barHeight);
        
        // Border
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, barWidth, barHeight);
        
        // Text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('BOSS', ctx.canvas.width / 2, y - 5);
    }
}

// Export the Boss class
if (typeof window !== 'undefined') {
    window.Boss = Boss;
}
