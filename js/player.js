// player.js - Player entity and related functionality

/**
 * Player class representing the main character
 */
class Player {
    /**
     * Create a new Player
     * @param {Object} config - Game configuration
     * @param {Object} assets - Game assets
     */
    constructor(config, assets) {
        this.config = config;
        this.assets = assets;
        
        // Calculate speed based on current level
        const speedMultiplier = this.getCurrentSpeedMultiplier();
        
        this.x = 100;
        this.y = 0;
        this.width = assets.vooo.width;
        this.height = assets.vooo.height;
        this.jumping = false;
        this.doubleJumping = false;
        this.canDoubleJump = false;
        this.velocityX = 0;
        this.velocityY = 0;
        this.jumpPower = config.BASE_PLAYER_JUMP_POWER * speedMultiplier;
        this.doubleJumpPower = config.BASE_PLAYER_DOUBLE_JUMP_POWER * speedMultiplier;
        this.isAlive = true;
        this.invulnerable = false;
        this.invulnerableTimer = 0;
        this.moveSpeed = config.BASE_PLAYER_SPEED * speedMultiplier;
        this.score = 0;
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
     * Reset player for a new level
     */
    reset() {
        // Calculate speed based on current level
        const speedMultiplier = this.getCurrentSpeedMultiplier();
        
        this.x = 100;
        this.y = 0;
        this.velocityX = 0;
        this.velocityY = 0;
        this.jumping = false;
        this.doubleJumping = false;
        this.canDoubleJump = false;
        this.isAlive = true;
        this.invulnerable = false;
        this.invulnerableTimer = 0;
        this.jumpPower = this.config.BASE_PLAYER_JUMP_POWER * speedMultiplier;
        this.doubleJumpPower = this.config.BASE_PLAYER_DOUBLE_JUMP_POWER * speedMultiplier;
        this.moveSpeed = this.config.BASE_PLAYER_SPEED * speedMultiplier;
        this.score = 0;
    }
    
    /**
     * Reset player after death
     */
    resetAfterDeath() {
        this.isAlive = true;
        this.invulnerable = true;
        this.invulnerableTimer = this.config.INVULNERABILITY_FRAMES;
        this.y = 0;
        this.velocityY = 0;
        this.velocityX = 0;
        this.jumping = false;
        this.doubleJumping = false;
        this.canDoubleJump = false;
        this.assets.vooo.isJumping = false;
        
        // Move player back a bit from where they died
        this.x = Math.max(100, this.x - 200);
    }
    
    /**
     * Handle player jump
     * @param {boolean} doubleJumpEnabled - Whether double jump is enabled
     * @returns {boolean} - Whether a jump was performed
     */
    jump(doubleJumpEnabled) {
        // First jump
        if (!this.jumping) {
            this.velocityY = this.jumpPower;
            this.jumping = true;
            this.canDoubleJump = doubleJumpEnabled;
            this.assets.vooo.isJumping = true;
            return true;
        }
        // Double jump
        else if (this.canDoubleJump && !this.doubleJumping) {
            this.velocityY = this.doubleJumpPower;
            this.doubleJumping = true;
            this.canDoubleJump = false;
            
            // Create double jump effect
            this.createDoubleJumpEffect();
            return true;
        }
        
        return false;
    }
    
    /**
     * Create visual effect for double jump
     */
    createDoubleJumpEffect() {
        const { createParticleEffect } = window.GameUtils;
        
        createParticleEffect({
            x: this.x + this.width / 2,
            y: this.y + this.height,
            count: 15,
            color: '#FFFFFF',
            speed: 3,
            life: 20,
            drawCallback: (particle) => {
                const screenX = particle.x - window.game.cameraX;
                const ctx = window.game.ctx;
                
                ctx.fillStyle = particle.color;
                ctx.globalAlpha = particle.life / 20;
                ctx.beginPath();
                ctx.arc(screenX, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }
        });
    }
    
    /**
     * Update player state
     * @param {Object} keys - Keyboard state
     * @param {Array} platforms - Game platforms
     * @param {Array} obstacles - Game obstacles
     * @param {Object} boss - Boss object
     * @param {number} gravity - Current gravity value
     * @param {number} canvasHeight - Canvas height
     * @param {Object} secondBoss - Second boss object (for level 4)
     */
    update(keys, platforms, obstacles, boss, gravity, canvasHeight, secondBoss) {
        // Handle keyboard input for movement
        this.velocityX = 0;
        
        if (keys['KeyA'] || keys['ArrowLeft']) {
            this.velocityX = -this.moveSpeed;
            this.assets.vooo.facingRight = false;
        }
        
        if (keys['KeyD'] || keys['ArrowRight']) {
            this.velocityX = this.moveSpeed;
            this.assets.vooo.facingRight = true;
        }
        
        // Apply gravity
        this.velocityY += gravity;
        
        // Update player position
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Keep player within level bounds
        if (this.x < 0) {
            this.x = 0;
        }
        
        // Check if player is in boss area
        const inBossArea = this.x > this.config.BOSS_AREA_START;
        
        // Check for collisions with platforms
        let onGround = false;
        platforms.forEach(platform => {
            // Skip ALL non-ground platforms in boss area
            if (inBossArea && platform.type !== 'ground') {
                return;
            }
            
            if (this.checkPlatformCollision(platform)) {
                onGround = true;
            }
        });
        
        // Check for collisions with obstacles
        obstacles.forEach(obstacle => {
            this.checkObstacleCollision(obstacle);
        });
        
        // Check if player fell off the screen
        if (this.y > canvasHeight) {
            this.isAlive = false;
        }
        
        // Update score based on distance traveled
        if (this.velocityX > 0) {
            this.score += Math.floor(this.velocityX);
        }
        
        // Handle invulnerability timer
        if (this.invulnerable) {
            this.invulnerableTimer--;
            if (this.invulnerableTimer <= 0) {
                this.invulnerable = false;
            }
        }
        
        // Check for collision with boss
        if (boss && boss.active) {
            this.checkBossCollision(boss);
        }
        
        // Check for collision with second boss (for level 4)
        if (secondBoss && secondBoss.active) {
            this.checkBossCollision(secondBoss);
        }
    }
    
    /**
     * Check collision with a platform
     * @param {Object} platform - Platform object
     * @returns {boolean} - Whether player is on ground after collision
     */
    checkPlatformCollision(platform) {
        const { checkCollision } = window.GameUtils;
        
        if (checkCollision(
            this,
            platform,
            { top: 0, right: 5, bottom: 0, left: 5 }
        )) {
            // Collision from above (landing on platform)
            if (this.velocityY > 0 && this.y + this.height - this.velocityY <= platform.y + 10) {
                this.y = platform.y - this.height;
                this.velocityY = 0;
                this.jumping = false;
                this.doubleJumping = false;
                this.canDoubleJump = false; // Reset double jump when landing
                this.assets.vooo.isJumping = false;
                return true;
            }
            // Collision from below (hitting platform from underneath)
            else if (this.velocityY < 0 && this.y >= platform.y + platform.height) {
                this.y = platform.y + platform.height;
                this.velocityY = 0;
            }
            // Collision from left
            else if (this.velocityX > 0 && this.x + this.width - this.velocityX <= platform.x) {
                this.x = platform.x - this.width;
            }
            // Collision from right
            else if (this.velocityX < 0 && this.x - this.velocityX >= platform.x + platform.width) {
                this.x = platform.x + platform.width;
            }
        }
        
        return false;
    }
    
    /**
     * Check collision with an obstacle
     * @param {Object} obstacle - Obstacle object
     */
    checkObstacleCollision(obstacle) {
        const { checkCollision } = window.GameUtils;
        
        if (checkCollision(
            this,
            obstacle,
            { top: 5, right: 5, bottom: 5, left: 5 }
        )) {
            // Handle lava collision - instant death
            if (obstacle.type === 'lava' && 
                this.y + this.height > obstacle.y - 5) {
                this.isAlive = false;
                return;
            }
            
            // Collision from above
            if (this.velocityY > 0 && this.y + this.height - this.velocityY <= obstacle.y) {
                this.y = obstacle.y - this.height;
                this.velocityY = 0;
                this.jumping = false;
                this.assets.vooo.isJumping = false;
                return;
            }
            
            // Find the shortest direction to push out
            const fromLeft = this.x + this.width - obstacle.x;
            const fromRight = obstacle.x + obstacle.width - this.x;
            const fromTop = this.y + this.height - obstacle.y;
            const fromBottom = obstacle.y + obstacle.height - this.y;
            
            const min = Math.min(fromLeft, fromRight, fromTop, fromBottom);
            
            if (min === fromLeft) {
                this.x = obstacle.x - this.width;
            } else if (min === fromRight) {
                this.x = obstacle.x + obstacle.width;
            } else if (min === fromTop) {
                this.y = obstacle.y - this.height;
                this.velocityY = 0;
                this.jumping = false;
                this.assets.vooo.isJumping = false;
            } else if (min === fromBottom) {
                this.y = obstacle.y + obstacle.height;
                this.velocityY = 0;
            }
        }
    }
    
    /**
     * Check collision with the boss
     * @param {Object} boss - Boss object
     */
    checkBossCollision(boss) {
        const { checkCollision } = window.GameUtils;
        
        if (!this.invulnerable && !boss.invulnerable &&
            checkCollision(
                this,
                boss,
                { top: 5, right: 5, bottom: 5, left: 5 }
            )
        ) {
            // Check if player is jumping on boss from above
            if (this.velocityY > 0 && this.y + this.height - this.velocityY <= boss.y + boss.height/3) {
                // Hit boss
                boss.hits++;
                boss.invulnerable = true;
                boss.invulnerableTimer = this.config.BOSS_INVULNERABILITY_FRAMES;
                this.velocityY = this.jumpPower * 0.7; // Bounce
                this.score += this.config.BOSS_HIT_SCORE;
                
                // Check if boss is defeated
                if (boss.hits >= this.assets.boss.hitsRequired) {
                    boss.active = false;
                    window.game.bossDefeated = true;
                    this.score += this.config.BOSS_DEFEAT_SCORE;
                }
            } else {
                // Player gets hit by boss
                this.isAlive = false;
            }
        }
    }
    
    /**
     * Draw the player
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} cameraX - Camera X position
     */
    draw(ctx, cameraX) {
        // Skip drawing if player is invulnerable and should blink
        if (this.invulnerable && Math.floor(this.invulnerableTimer / 5) % 2 === 0) {
            return;
        }
        
        const { safeDrawImage } = window.GameUtils;
        const screenX = this.x - cameraX;
        
        // Choose the right sprite based on state
        const playerSprite = this.assets.vooo.isJumping ? 
                            this.assets.vooo.jumping : 
                            this.assets.vooo.running;
        
        // Draw player with proper orientation
        safeDrawImage(
            ctx,
            playerSprite,
            screenX,
            this.y,
            this.width,
            this.height,
            !this.assets.vooo.facingRight
        );
        
        // Draw double jump indicator if available
        if (this.jumping && this.canDoubleJump) {
            // Draw a more visible glow around the player
            ctx.save();
            ctx.globalAlpha = 0.7;
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(screenX + this.width/2, this.y + this.height/2, 
                    this.width * 0.7, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
            ctx.restore();
        }
        
        // Debug info
        if (this.config.DEBUG_MODE) {
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`jumping: ${this.jumping}`, screenX, this.y - 30);
            ctx.fillText(`doubleJumping: ${this.doubleJumping}`, screenX, this.y - 15);
            ctx.fillText(`canDoubleJump: ${this.canDoubleJump}`, screenX, this.y);
        }
    }
}

// Export the Player class
if (typeof window !== 'undefined') {
    window.Player = Player;
}
