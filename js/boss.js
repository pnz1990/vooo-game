/**
 * Boss class for handling boss-related functionality
 */
import CONFIG from './config.js';

class Boss {
    constructor(gameState) {
        this.gameState = gameState;
        this.x = 7800;
        this.y = 0;
        this.width = CONFIG.boss.width;
        this.height = CONFIG.boss.height;
        this.velocityX = CONFIG.boss.baseSpeed * gameState.speedMultiplier;
        this.velocityY = 0;
        this.active = true;
        this.hits = 0;
        this.invulnerable = false;
        this.invulnerableTimer = 0;
        this.jumpPower = CONFIG.boss.baseJumpPower * gameState.speedMultiplier;
    }

    update(platforms, gravity) {
        if (!this.active) return;
        
        // Apply gravity
        this.velocityY += gravity * 0.8;
        
        // Update boss position
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Check for collisions with platforms
        platforms.forEach(platform => {
            if (
                this.y + this.height > platform.y &&
                this.y < platform.y + platform.height &&
                this.x + this.width > platform.x &&
                this.x < platform.x + platform.width
            ) {
                // Collision from above (landing on platform)
                if (this.velocityY > 0 && this.y + this.height - this.velocityY <= platform.y) {
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

    draw(ctx, cameraX) {
        if (!this.active) return;
        
        const screenX = this.x - cameraX;
        
        // Skip if off-screen
        if (screenX + this.width < 0 || screenX > CONFIG.canvas.width) return;
        
        // Skip drawing if boss is invulnerable and should blink
        if (this.invulnerable && Math.floor(this.invulnerableTimer / 5) % 2 === 0) {
            return;
        }
        
        // Draw the entire boss sprite
        try {
            // Flip horizontally based on direction
            ctx.save();
            if (this.velocityX < 0) {
                ctx.translate(screenX + this.width, this.y);
                ctx.scale(-1, 1);
                ctx.drawImage(
                    this.gameState.assets.boss.img,
                    0, 0, this.width, this.height
                );
            } else {
                ctx.drawImage(
                    this.gameState.assets.boss.img,
                    screenX, this.y, this.width, this.height
                );
            }
            ctx.restore();
        } catch (e) {
            console.error("Error drawing boss:", e);
            // Fallback to a simple shape if image fails
            ctx.fillStyle = '#FF6600';
            ctx.fillRect(screenX, this.y, this.width, this.height);
        }
    }

    drawHealthBar(ctx) {
        if (!this.active) return;
        
        const barWidth = 200;
        const barHeight = 20;
        const x = CONFIG.canvas.width / 2 - barWidth / 2;
        const y = 50;
        const healthPercentage = (CONFIG.boss.hitsRequired - this.hits) / CONFIG.boss.hitsRequired;
        
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
        ctx.fillText('BOSS', CONFIG.canvas.width / 2, y - 5);
    }
}

export default Boss;
