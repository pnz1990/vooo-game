/**
 * Enemy management and behavior
 */
import CONFIG from './config.js';

class EnemyManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.enemies = [];
    }

    createEnemies(platforms, currentLevel, speedMultiplier) {
        this.enemies = [];
        
        // Determine enemy count based on level
        let enemyCount;
        
        if (currentLevel === 1) {
            enemyCount = CONFIG.levels.level1.enemyCount;
        } else if (currentLevel === 2) {
            enemyCount = Math.floor(CONFIG.levels.baseEnemyCount * 1.1);
        } else {
            enemyCount = Math.floor(CONFIG.levels.baseEnemyCount * (1 + (currentLevel - 2) * 0.15));
        }
        
        // Create ground-based enemies
        for (let i = 0; i < enemyCount; i++) {
            const enemyX = 600 + i * 250 + Math.random() * 100;
            // Position enemies on top of the ground, not buried in it
            const enemyY = CONFIG.canvas.height - 40 - CONFIG.enemies.strawberry.height;
            
            // Don't place enemies in the boss area
            if (enemyX < 7500) {
                this.enemies.push({
                    x: enemyX,
                    y: enemyY,
                    width: CONFIG.enemies.strawberry.width,
                    height: CONFIG.enemies.strawberry.height,
                    velocityX: (Math.random() > 0.5 ? -1.5 : 1.5) * speedMultiplier,
                    active: true
                });
            }
        }
        
        // Add platform-based enemies - fewer in level 1
        const platformEnemyChance = currentLevel === 1 ? 
            CONFIG.levels.level1.platformEnemyChance : 0.4;
        
        platforms.forEach((platform, index) => {
            if (index > 0 && platform.width > 80 && 
                Math.random() > (1 - platformEnemyChance) && 
                platform.x < 7500) {
                
                this.enemies.push({
                    x: platform.x + platform.width/2,
                    y: platform.y - CONFIG.enemies.strawberry.height,
                    width: CONFIG.enemies.strawberry.width,
                    height: CONFIG.enemies.strawberry.height,
                    velocityX: (Math.random() > 0.5 ? -1.5 : 1.5) * speedMultiplier,
                    platformIndex: index,
                    active: true
                });
            }
        });
        
        return this.enemies;
    }

    update(player, platforms) {
        this.enemies.forEach(enemy => {
            if (!enemy.active) return;
            
            // Move enemy
            enemy.x += enemy.velocityX;
            
            // Check if enemy is on a platform
            if (enemy.platformIndex !== undefined) {
                const platform = platforms[enemy.platformIndex];
                
                // Keep enemy on platform
                if (enemy.x < platform.x) {
                    enemy.velocityX *= -1;
                    enemy.x = platform.x;
                } else if (enemy.x + enemy.width > platform.x + platform.width) {
                    enemy.velocityX *= -1;
                    enemy.x = platform.x + platform.width - enemy.width;
                }
            }
            
            // Check collision with player
            if (
                !player.invulnerable &&
                player.x < enemy.x + enemy.width &&
                player.x + player.width > enemy.x &&
                player.y < enemy.y + enemy.height &&
                player.y + player.height > enemy.y
            ) {
                // Check if player is jumping on enemy from above
                if (player.velocityY > 0 && player.y + player.height - player.velocityY <= enemy.y) {
                    // Defeat enemy
                    enemy.active = false;
                    player.velocityY = player.jumpPower * 0.7; // Bounce
                    this.gameState.score += 100;
                    this.gameState.updateScoreDisplay();
                } else {
                    // Player gets hit
                    player.isAlive = false;
                }
            }
        });
    }

    draw(ctx, cameraX) {
        this.enemies.forEach(enemy => {
            if (!enemy.active) return;
            
            const screenX = enemy.x - cameraX;
            
            // Skip if off-screen
            if (screenX + enemy.width < 0 || screenX > CONFIG.canvas.width) return;
            
            // Draw the entire enemy sprite
            try {
                ctx.drawImage(
                    this.gameState.assets.strawberry.img,
                    screenX, enemy.y, enemy.width, enemy.height
                );
            } catch (e) {
                console.error("Error drawing enemy:", e);
                // Fallback to a simple red circle if image fails
                ctx.fillStyle = '#FF0033';
                ctx.beginPath();
                ctx.arc(screenX + enemy.width/2, enemy.y + enemy.height/2, enemy.width/2, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }
}

export default EnemyManager;
