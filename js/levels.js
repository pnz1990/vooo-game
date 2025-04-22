// levels.js - Level generation and management

/**
 * LevelManager class for creating and managing game levels
 */
class LevelManager {
    /**
     * Create a new LevelManager
     * @param {Object} config - Game configuration
     */
    constructor(config) {
        this.config = config;
        this.platforms = [];
        this.obstacles = [];
        this.levelEnd = { x: 8200, width: 50, height: 500 };
    }
    
    /**
     * Create a level based on the current level number
     * @param {number} currentLevel - Current level number
     * @returns {Object} - Level data with platforms and obstacles
     */
    createLevel(currentLevel) {
        this.platforms = [];
        this.obstacles = [];
        
        // Create ground platform with gaps for lava in level 2+
        if (currentLevel === 1) {
            // Level 1: Continuous ground
            this.platforms = [
                { 
                    x: 0, 
                    y: this.config.CANVAS_HEIGHT - this.config.TILE_SIZE, 
                    width: 8000, 
                    height: this.config.TILE_SIZE, 
                    type: 'ground' 
                }
            ];
        } else {
            // Level 2+: Ground with lava gaps
            this.createGroundWithLavaGaps();
        }
        
        // Add platforms
        this.createPlatforms();
        
        // Add obstacles
        this.createObstacles(currentLevel);
        
        // Set level end
        this.levelEnd = { x: 8200, width: 50, height: 500 };
        
        return {
            platforms: this.platforms,
            obstacles: this.obstacles,
            levelEnd: this.levelEnd
        };
    }
    
    /**
     * Create ground with lava gaps for levels 2+
     */
    createGroundWithLavaGaps() {
        let currentX = 0;
        
        while (currentX < 8000) {
            // Determine segment length
            let segmentLength;
            
            if (currentX < 500) {
                // Safe starting area
                segmentLength = 500;
                
                // Add ground segment
                this.platforms.push({
                    x: currentX,
                    y: this.config.CANVAS_HEIGHT - this.config.TILE_SIZE,
                    width: segmentLength,
                    height: this.config.TILE_SIZE,
                    type: 'ground'
                });
                
                currentX += segmentLength;
            } else if (currentX > 7400) { // Match buffer zone
                // Safe boss area
                segmentLength = 8000 - currentX;
                
                // Add ground segment
                this.platforms.push({
                    x: currentX,
                    y: this.config.CANVAS_HEIGHT - this.config.TILE_SIZE,
                    width: segmentLength,
                    height: this.config.TILE_SIZE,
                    type: 'ground'
                });
                
                currentX += segmentLength;
            } else {
                // Random segment length between 200-500
                segmentLength = Math.random() * 300 + 200;
                
                // Add ground segment
                this.platforms.push({
                    x: currentX,
                    y: this.config.CANVAS_HEIGHT - this.config.TILE_SIZE,
                    width: segmentLength,
                    height: this.config.TILE_SIZE,
                    type: 'ground'
                });
                
                currentX += segmentLength;
                
                // Add lava gap after this segment (only if not near boss area)
                if (currentX < 7300) {
                    const gapLength = Math.random() * 100 + 80;
                    
                    // Add lava obstacle IN THE GAP
                    this.obstacles.push({
                        x: currentX,
                        y: this.config.CANVAS_HEIGHT - this.config.TILE_SIZE,
                        width: gapLength,
                        height: this.config.TILE_SIZE,
                        type: 'lava'
                    });
                    
                    // Skip the gap for next ground segment
                    currentX += gapLength;
                }
            }
        }
    }
    
    /**
     * Create platforms for the level
     */
    createPlatforms() {
        for (let i = 0; i < 40; i++) {
            const platformWidth = Math.random() * 200 + 100;
            const platformX = 500 + i * 200 + Math.random() * 100;
            const platformY = this.config.CANVAS_HEIGHT - this.config.TILE_SIZE - (Math.random() * 250 + 50);
            
            // STRICT CHECK: Don't place ANY platforms in or near the boss area
            if (platformX < this.config.BOSS_AREA_START) {
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
                    
                    // Double-check that even with offsets, the platform doesn't extend into boss area
                    if (smallPlatformX + smallPlatformWidth < this.config.BOSS_AREA_START) {
                        this.platforms.push({
                            x: smallPlatformX,
                            y: smallPlatformY,
                            width: smallPlatformWidth,
                            height: 20,
                            type: 'platform'
                        });
                    }
                }
            }
        }
    }
    
    /**
     * Create obstacles for the level
     * @param {number} currentLevel - Current level number
     */
    createObstacles(currentLevel) {
        // Add regular obstacles (rocks, etc.)
        const obstacleCount = currentLevel === 1 ? 25 : 30; // More obstacles in level 2+
        
        for (let i = 0; i < obstacleCount; i++) {
            const obstacleWidth = Math.random() * 60 + 40;
            const obstacleHeight = Math.random() * 80 + 40;
            const obstacleX = 800 + i * 300 + Math.random() * 200;
            const obstacleY = this.config.CANVAS_HEIGHT - this.config.TILE_SIZE - obstacleHeight;
            
            // STRICT CHECK: Don't place obstacles in or near the boss area
            if (obstacleX < this.config.BOSS_AREA_START) {
                this.obstacles.push({
                    x: obstacleX,
                    y: obstacleY,
                    width: obstacleWidth,
                    height: obstacleHeight,
                    type: 'rock'
                });
            }
        }
    }
    
    /**
     * Draw platforms
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} cameraX - Camera X position
     * @param {Object} assets - Game assets
     */
    drawPlatforms(ctx, cameraX, assets) {
        this.platforms.forEach(platform => {
            const screenX = platform.x - cameraX;
            
            // Skip if off-screen
            if (screenX + platform.width < 0 || screenX > ctx.canvas.width) return;
            
            // Skip drawing non-ground platforms in boss area
            if (platform.x > this.config.BOSS_AREA_START && platform.type !== 'ground') return;
            
            if (platform.type === 'ground') {
                // Draw ground with tiles
                for (let x = 0; x < platform.width; x += assets.tiles.size) {
                    ctx.drawImage(
                        assets.tiles.img,
                        0, 0, assets.tiles.size, assets.tiles.size,
                        screenX + x, platform.y, 
                        assets.tiles.size, assets.tiles.size
                    );
                }
            } else {
                // Draw platform with tiles
                for (let x = 0; x < platform.width; x += assets.tiles.size) {
                    ctx.drawImage(
                        assets.tiles.img,
                        assets.tiles.size, 0, assets.tiles.size, assets.tiles.size,
                        screenX + x, platform.y, 
                        assets.tiles.size, assets.tiles.size
                    );
                }
            }
        });
    }
    
    /**
     * Draw obstacles
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} cameraX - Camera X position
     * @param {Object} assets - Game assets
     */
    drawObstacles(ctx, cameraX, assets) {
        this.obstacles.forEach(obstacle => {
            const screenX = obstacle.x - cameraX;
            
            // Skip if off-screen
            if (screenX + obstacle.width < 0 || screenX > ctx.canvas.width) return;
            
            // Skip obstacles in boss area except for lava
            if (obstacle.x > this.config.BOSS_AREA_START && obstacle.type !== 'lava') return;
            
            if (obstacle.type === 'lava') {
                this.drawLava(ctx, screenX, obstacle, assets);
            } else {
                // Draw regular obstacle with tiles
                for (let x = 0; x < obstacle.width; x += assets.tiles.size) {
                    for (let y = 0; y < obstacle.height; y += assets.tiles.size) {
                        ctx.drawImage(
                            assets.tiles.img,
                            assets.tiles.size * 2, 0, assets.tiles.size, assets.tiles.size,
                            screenX + x, obstacle.y + y, 
                            assets.tiles.size, assets.tiles.size
                        );
                    }
                }
            }
        });
    }
    
    /**
     * Draw lava obstacle with special effects
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} screenX - Screen X position
     * @param {Object} obstacle - Obstacle object
     * @param {Object} assets - Game assets
     */
    drawLava(ctx, screenX, obstacle, assets) {
        // Draw lava with animation effect
        const time = Date.now() * assets.lava.animationSpeed;
        
        // Create lava gradient
        const lavaGradient = ctx.createLinearGradient(
            screenX, obstacle.y - 5, // Start gradient slightly above the lava surface
            screenX, obstacle.y + obstacle.height
        );
        
        lavaGradient.addColorStop(0, assets.lava.glowColor);
        lavaGradient.addColorStop(0.3 + Math.sin(time) * 0.2, assets.lava.color);
        lavaGradient.addColorStop(1, '#990000');
        
        ctx.fillStyle = lavaGradient;
        ctx.fillRect(screenX, obstacle.y - 5, obstacle.width, obstacle.height + 5); // Extend lava upward slightly
        
        // Add glow effect around lava
        ctx.shadowColor = assets.lava.glowColor;
        ctx.shadowBlur = 15;
        ctx.fillRect(screenX, obstacle.y - 10, obstacle.width, 5);
        ctx.shadowBlur = 0;
        
        // Add bubbling effect
        for (let i = 0; i < obstacle.width / 10; i++) {
            const bubbleX = screenX + i * 10 + Math.sin(time + i) * 5;
            const bubbleY = obstacle.y + Math.sin(time * 2 + i * 0.7) * 8; // Increased amplitude
            const bubbleSize = Math.max(1, 2 + Math.sin(time * 3 + i * 1.5) * 2.5); // Ensure positive radius
            
            ctx.fillStyle = assets.lava.glowColor;
            try {
                ctx.beginPath();
                // Ensure radius is positive
                const safeRadius = Math.abs(bubbleSize);
                ctx.arc(bubbleX, bubbleY, safeRadius, 0, Math.PI * 2);
                ctx.fill();
            } catch (e) {
                // Fallback to a simple rectangle if arc fails
                ctx.fillRect(bubbleX - 2, bubbleY - 2, 4, 4);
            }
        }
        
        // Add glow effect
        ctx.fillStyle = 'rgba(255, 69, 0, 0.3)';
        ctx.fillRect(screenX - 5, obstacle.y - 5, obstacle.width + 10, obstacle.height + 5);
    }
    
    /**
     * Draw level end flag
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} cameraX - Camera X position
     * @param {boolean} bossDefeated - Whether boss is defeated
     */
    drawLevelEnd(ctx, cameraX, bossDefeated) {
        const screenX = this.levelEnd.x - cameraX;
        
        if (screenX < ctx.canvas.width && bossDefeated) {
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
            ctx.fillRect(screenX - 20, ctx.canvas.height - 80, 45, 40);
        }
    }
}

// Export the LevelManager class
if (typeof window !== 'undefined') {
    window.LevelManager = LevelManager;
}
