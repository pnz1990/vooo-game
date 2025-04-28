/**
 * Level generation and management
 */
import CONFIG from './config.js';

class LevelManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.platforms = [];
        this.obstacles = [];
        this.levelEnd = { x: 8200, width: 50, height: 500 };
    }

    generateLevel(currentLevel) {
        this.platforms = [];
        this.obstacles = [];
        
        // Create ground platform with gaps for lava in level 2+
        if (currentLevel === 1) {
            // Level 1: Continuous ground
            this.platforms = [
                { x: 0, y: CONFIG.canvas.height - 40, width: 8000, height: 40, type: 'ground' }
            ];
        } else {
            // Level 2+: Ground with lava gaps
            this.platforms = [];
            let currentX = 0;
            
            while (currentX < 8000) {
                // Determine segment length
                let segmentLength;
                
                if (currentX < 500) {
                    // Safe starting area
                    segmentLength = 500;
                } else if (currentX > 7500) {
                    // Safe boss area
                    segmentLength = 8000 - currentX;
                } else {
                    // Random segment length between 200-500
                    segmentLength = Math.random() * 300 + 200;
                    
                    // Add lava gap after this segment
                    const gapLength = Math.random() * 100 + 80;
                    
                    // Add lava obstacle
                    this.obstacles.push({
                        x: currentX + segmentLength,
                        y: CONFIG.canvas.height - 20,
                        width: gapLength,
                        height: 20,
                        type: 'lava'
                    });
                    
                    // Skip the gap for next ground segment
                    currentX += gapLength;
                }
                
                // Add ground segment
                this.platforms.push({
                    x: currentX,
                    y: CONFIG.canvas.height - 40,
                    width: segmentLength,
                    height: 40,
                    type: 'ground'
                });
                
                currentX += segmentLength;
            }
        }
        
        // Add platforms - more of them and more varied
        for (let i = 0; i < 40; i++) {
            const platformWidth = Math.random() * 200 + 100;
            const platformX = 500 + i * 200 + Math.random() * 100;
            const platformY = CONFIG.canvas.height - 40 - (Math.random() * 250 + 50);
            
            this.platforms.push({
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
                
                this.platforms.push({
                    x: smallPlatformX,
                    y: smallPlatformY,
                    width: smallPlatformWidth,
                    height: 20,
                    type: 'platform'
                });
            }
        }
        
        // Add a special platform for the boss battle
        this.platforms.push({
            x: 7700,
            y: CONFIG.canvas.height - 40 - 150,
            width: 400,
            height: 20,
            type: 'platform'
        });
        
        // Add regular obstacles (rocks, etc.)
        const obstacleCount = currentLevel === 1 ? 25 : 30; // More obstacles in level 2+
        for (let i = 0; i < obstacleCount; i++) {
            const obstacleWidth = Math.random() * 60 + 40;
            const obstacleHeight = Math.random() * 80 + 40;
            const obstacleX = 800 + i * 300 + Math.random() * 200;
            const obstacleY = CONFIG.canvas.height - 40 - obstacleHeight;
            
            // Don't place obstacles in the boss area
            if (obstacleX < 7500) {
                this.obstacles.push({
                    x: obstacleX,
                    y: obstacleY,
                    width: obstacleWidth,
                    height: obstacleHeight,
                    type: 'rock'
                });
            }
        }
        
        // Set level end
        this.levelEnd = { x: 8200, width: 50, height: 500 };
        
        return {
            platforms: this.platforms,
            obstacles: this.obstacles,
            levelEnd: this.levelEnd
        };
    }

    drawPlatforms(ctx, cameraX) {
        this.platforms.forEach(platform => {
            const screenX = platform.x - cameraX;
            
            // Skip if off-screen
            if (screenX + platform.width < 0 || screenX > CONFIG.canvas.width) return;
            
            if (platform.type === 'ground') {
                // Draw ground with tiles
                for (let x = 0; x < platform.width; x += CONFIG.tiles.size) {
                    ctx.drawImage(
                        this.gameState.assets.tiles.img,
                        0, 0, CONFIG.tiles.size, CONFIG.tiles.size,
                        screenX + x, platform.y, 
                        CONFIG.tiles.size, CONFIG.tiles.size
                    );
                }
            } else {
                // Draw platform with tiles
                for (let x = 0; x < platform.width; x += CONFIG.tiles.size) {
                    ctx.drawImage(
                        this.gameState.assets.tiles.img,
                        CONFIG.tiles.size, 0, CONFIG.tiles.size, CONFIG.tiles.size,
                        screenX + x, platform.y, 
                        CONFIG.tiles.size, CONFIG.tiles.size
                    );
                }
            }
        });
    }

    drawObstacles(ctx, cameraX) {
        this.obstacles.forEach(obstacle => {
            const screenX = obstacle.x - cameraX;
            
            // Skip if off-screen
            if (screenX + obstacle.width < 0 || screenX > CONFIG.canvas.width) return;
            
            if (obstacle.type === 'lava') {
                // Draw lava with animation effect
                const time = Date.now() * this.gameState.assets.lava.animationSpeed;
                
                // Create lava gradient
                const lavaGradient = ctx.createLinearGradient(
                    screenX, obstacle.y, 
                    screenX, obstacle.y + obstacle.height
                );
                
                lavaGradient.addColorStop(0, this.gameState.assets.lava.glowColor);
                lavaGradient.addColorStop(0.3 + Math.sin(time) * 0.2, this.gameState.assets.lava.color);
                lavaGradient.addColorStop(1, '#990000');
                
                ctx.fillStyle = lavaGradient;
                ctx.fillRect(screenX, obstacle.y, obstacle.width, obstacle.height);
                
                // Add bubbling effect
                for (let i = 0; i < obstacle.width / 10; i++) {
                    const bubbleX = screenX + i * 10 + Math.sin(time + i) * 5;
                    const bubbleY = obstacle.y + Math.sin(time * 2 + i * 0.7) * 5;
                    const bubbleSize = 2 + Math.sin(time * 3 + i * 1.5) * 2;
                    
                    ctx.fillStyle = this.gameState.assets.lava.glowColor;
                    ctx.beginPath();
                    ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                // Add glow effect
                ctx.fillStyle = 'rgba(255, 69, 0, 0.3)';
                ctx.fillRect(screenX - 5, obstacle.y - 5, obstacle.width + 10, obstacle.height + 5);
            } else {
                // Draw regular obstacle with tiles
                for (let x = 0; x < obstacle.width; x += CONFIG.tiles.size) {
                    for (let y = 0; y < obstacle.height; y += CONFIG.tiles.size) {
                        ctx.drawImage(
                            this.gameState.assets.tiles.img,
                            CONFIG.tiles.size * 2, 0, CONFIG.tiles.size, CONFIG.tiles.size,
                            screenX + x, obstacle.y + y, 
                            CONFIG.tiles.size, CONFIG.tiles.size
                        );
                    }
                }
            }
        });
    }

    drawLevelEnd(ctx, cameraX, bossDefeated) {
        const screenX = this.levelEnd.x - cameraX;
        
        if (screenX < CONFIG.canvas.width && bossDefeated) {
            // Pole
            ctx.fillStyle = '#888888';
            ctx.fillRect(screenX, 0, 5, this.levelEnd.height);
            
            // Flag
            ctx.fillStyle = '#FF0000'; // Red flag
            ctx.beginPath();
            ctx.moveTo(screenX + 5, 50);
            ctx.lineTo(screenX + 35, 60);
            ctx.lineTo(screenX + 5, 70);
            ctx.fill();
            
            // Base
            ctx.fillStyle = '#FFD700'; // Gold
            ctx.fillRect(screenX - 20, CONFIG.canvas.height - 80, 45, 40);
        }
    }
}

export default LevelManager;
