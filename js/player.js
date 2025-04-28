/**
 * Player class for handling player-related functionality
 */
import CONFIG from './config.js';
import { createDoubleJumpEffect } from './effects.js';

class Player {
    constructor(gameState) {
        this.gameState = gameState;
        this.x = 100;
        this.y = 0;
        this.width = CONFIG.player.width;
        this.height = CONFIG.player.height;
        this.jumping = false;
        this.doubleJumping = false;
        this.canDoubleJump = false;
        this.velocityX = 0;
        this.velocityY = 0;
        this.jumpPower = CONFIG.player.baseJumpPower * gameState.speedMultiplier;
        this.doubleJumpPower = CONFIG.player.doubleJumpPower * gameState.speedMultiplier;
        this.isAlive = true;
        this.invulnerable = false;
        this.invulnerableTimer = 0;
        this.moveSpeed = CONFIG.player.baseSpeed * gameState.speedMultiplier;
    }

    update(platforms, obstacles, boss, keys) {
        // Handle keyboard input for movement
        this.velocityX = 0;
        
        if (keys['KeyA'] || keys['ArrowLeft']) {
            this.velocityX = -this.moveSpeed;
            this.gameState.assets.vooo.facingRight = false;
        }
        
        if (keys['KeyD'] || keys['ArrowRight']) {
            this.velocityX = this.moveSpeed;
            this.gameState.assets.vooo.facingRight = true;
        }
        
        // Apply gravity
        this.velocityY += this.gameState.gravity;
        
        // Update player position
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Keep player within level bounds
        if (this.x < 0) {
            this.x = 0;
        }
        
        // Check for collisions with platforms
        let onGround = false;
        platforms.forEach(platform => {
            if (this.checkCollision(platform)) {
                // Collision from above (landing on platform)
                if (this.velocityY > 0 && this.y + this.height - this.velocityY <= platform.y) {
                    this.y = platform.y - this.height;
                    this.velocityY = 0;
                    this.jumping = false;
                    this.doubleJumping = false;
                    this.canDoubleJump = false; // Reset double jump when landing
                    this.gameState.assets.vooo.isJumping = false;
                    onGround = true;
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
        });
        
        // Check for collisions with obstacles
        obstacles.forEach(obstacle => {
            if (this.checkCollision(obstacle)) {
                // Handle lava collision - instant death
                if (obstacle.type === 'lava') {
                    this.isAlive = false;
                    return;
                }
                
                // Collision from above
                if (this.velocityY > 0 && this.y + this.height - this.velocityY <= obstacle.y) {
                    this.y = obstacle.y - this.height;
                    this.velocityY = 0;
                    this.jumping = false;
                    this.gameState.assets.vooo.isJumping = false;
                    onGround = true;
                }
                // Collision from sides or below - push player away
                else {
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
                        this.gameState.assets.vooo.isJumping = false;
                    } else if (min === fromBottom) {
                        this.y = obstacle.y + obstacle.height;
                        this.velocityY = 0;
                    }
                }
            }
        });
        
        // Check if player fell off the screen
        if (this.y > CONFIG.canvas.height) {
            this.isAlive = false;
        }
        
        // Update camera position to follow player
        if (this.x > CONFIG.canvas.width / 3 && this.x < this.gameState.levelEnd.x - CONFIG.canvas.width * 2/3) {
            this.gameState.cameraX = this.x - CONFIG.canvas.width / 3;
        }
        
        // Update score based on distance traveled
        if (this.velocityX > 0) {
            this.gameState.score += Math.floor(this.velocityX);
            if (this.gameState.score % 100 === 0) {
                this.gameState.updateScoreDisplay();
            }
        }
        
        // Handle invulnerability timer
        if (this.invulnerable) {
            this.invulnerableTimer--;
            if (this.invulnerableTimer <= 0) {
                this.invulnerable = false;
            }
        }
        
        // Check for collision with boss
        if (boss && boss.active && !this.invulnerable && !boss.invulnerable &&
            this.x < boss.x + boss.width &&
            this.x + this.width > boss.x &&
            this.y < boss.y + boss.height &&
            this.y + this.height > boss.y
        ) {
            // Check if player is jumping on boss from above
            if (this.velocityY > 0 && this.y + this.height - this.velocityY <= boss.y + boss.height/4) {
                // Hit boss
                boss.hits++;
                boss.invulnerable = true;
                boss.invulnerableTimer = 30;
                this.velocityY = this.jumpPower * 0.7; // Bounce
                this.gameState.score += 200;
                this.gameState.updateScoreDisplay();
                
                // Check if boss is defeated
                if (boss.hits >= CONFIG.boss.hitsRequired) {
                    boss.active = false;
                    this.gameState.bossDefeated = true;
                    this.gameState.score += 1000;
                    this.gameState.updateScoreDisplay();
                }
            } else {
                // Player gets hit by boss
                this.isAlive = false;
            }
        }
    }

    jump() {
        // First jump when on the ground
        if (!this.jumping) {
            this.velocityY = this.jumpPower;
            this.jumping = true;
            this.canDoubleJump = true;
            this.gameState.assets.vooo.isJumping = true;
            return true;
        }
        // Double jump when in the air and double jump is available
        else if (this.canDoubleJump && !this.doubleJumping) {
            this.velocityY = this.doubleJumpPower;
            this.doubleJumping = true;
            this.canDoubleJump = false;
            createDoubleJumpEffect(this, this.gameState.cameraX, this.gameState.ctx);
            return true;
        }
        return false;
    }

    resetAfterDeath() {
        this.isAlive = true;
        this.invulnerable = true;
        this.invulnerableTimer = 60; // Invulnerable for 60 frames
        this.y = 0;
        this.velocityY = 0;
        this.velocityX = 0;
        this.jumping = false;
        this.doubleJumping = false;
        this.canDoubleJump = false;
        
        // Move player back a bit from where they died
        this.x = Math.max(100, this.x - 200);
    }

    draw(ctx, cameraX) {
        // Skip drawing if player is invulnerable and should blink
        if (this.invulnerable && Math.floor(this.invulnerableTimer / 5) % 2 === 0) {
            return;
        }
        
        const screenX = this.x - cameraX;
        
        // Choose the right sprite based on state
        const playerSprite = this.gameState.assets.vooo.isJumping ? 
            this.gameState.assets.vooo.jumping : 
            this.gameState.assets.vooo.running;
        
        // Flip horizontally if facing left
        ctx.save();
        if (!this.gameState.assets.vooo.facingRight) {
            ctx.translate(screenX + this.width, this.y);
            ctx.scale(-1, 1);
            ctx.drawImage(
                playerSprite,
                0, 0, playerSprite.width, playerSprite.height,
                0, 0, this.width, this.height
            );
        } else {
            ctx.drawImage(
                playerSprite,
                0, 0, playerSprite.width, playerSprite.height,
                screenX, this.y, this.width, this.height
            );
        }
        ctx.restore();
        
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
        
        // Debug info - only shown if debugMode is true
        if (CONFIG.debug) {
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`jumping: ${this.jumping}`, screenX, this.y - 30);
            ctx.fillText(`doubleJumping: ${this.doubleJumping}`, screenX, this.y - 15);
            ctx.fillText(`canDoubleJump: ${this.canDoubleJump}`, screenX, this.y);
        }
    }

    checkCollision(object) {
        return (
            this.y + this.height > object.y &&
            this.y < object.y + object.height &&
            this.x + this.width > object.x &&
            this.x < object.x + object.width
        );
    }
}

export default Player;
