// assets.js - Asset loading and management

/**
 * Asset manager for the game
 */
class AssetManager {
    constructor(config) {
        this.config = config;
        this.assets = {
            vooo: {
                running: null,
                jumping: null,
                width: config.PLAYER_WIDTH,
                height: config.PLAYER_HEIGHT,
                spriteWidth: 398,
                spriteHeight: 625,
                jumpSpriteWidth: 431,
                jumpSpriteHeight: 780,
                frames: 1,
                currentFrame: 0,
                frameCount: 0,
                frameDelay: 8,
                speed: config.BASE_PLAYER_SPEED * this.getSpeedMultiplier(),
                facingRight: true,
                isJumping: false
            },
            strawberry: {
                img: null,
                width: config.ENEMY_WIDTH,
                height: config.ENEMY_HEIGHT,
                spriteWidth: 1024,
                spriteHeight: 1024,
                frames: 1,
                currentFrame: 0,
                frameCount: 0,
                frameDelay: 15
            },
            cherry: {
                img: null,
                width: config.ENEMY_WIDTH,
                height: config.ENEMY_HEIGHT,
                spriteWidth: 1024,
                spriteHeight: 1024,
                frames: 1,
                currentFrame: 0,
                frameCount: 0,
                frameDelay: 15
            },
            lava: {
                color: '#FF4500',
                glowColor: '#FFFF00',
                animationSpeed: 0.003
            },
            boss: {
                img: null,
                width: config.BOSS_WIDTH,
                height: config.BOSS_HEIGHT,
                spriteWidth: 1024,
                spriteHeight: 1024,
                frames: 1,
                currentFrame: 0,
                frameCount: 0,
                frameDelay: 20,
                hitsRequired: config.BOSS_HITS_REQUIRED,
                invulnerable: false,
                invulnerableTimer: 0
            },
            background: {
                img: null,
                x: 0,
                width: 3200,
                height: 500,
                layers: []
            },
            tiles: {
                img: null,
                size: config.TILE_SIZE
            }
        };
        
        this.currentLevel = 1;
        this.imagesLoaded = 0;
        this.totalImages = 5; // running.png, jumping.png, enemies.png, cherry-enemies.png, boss.png
        this.onAllLoaded = null;
    }
    
    /**
     * Get speed multiplier based on current level
     * @returns {number} - Speed multiplier
     */
    getSpeedMultiplier() {
        if (this.currentLevel === 1) {
            return this.config.LEVEL_1_SPEED_MULTIPLIER;
        } else {
            return 1 + ((this.currentLevel - 2) * this.config.LEVEL_SPEED_INCREMENT);
        }
    }
    
    /**
     * Set current level and update speed-dependent assets
     * @param {number} level - Level number
     */
    setLevel(level) {
        this.currentLevel = level;
        const speedMultiplier = this.getSpeedMultiplier();
        this.assets.vooo.speed = this.config.BASE_PLAYER_SPEED * speedMultiplier;
    }
    
    /**
     * Load all game assets
     * @param {Function} callback - Function to call when all assets are loaded
     */
    loadAssets(callback) {
        this.onAllLoaded = callback;
        this.imagesLoaded = 0;
        
        // Load VOOO running sprite
        this.assets.vooo.running = new Image();
        this.assets.vooo.running.src = 'running.png';
        this.assets.vooo.running.onload = () => this.checkAllImagesLoaded();
        this.assets.vooo.running.onerror = () => {
            console.error("Error loading running.png");
            this.checkAllImagesLoaded();
        };
        
        // Load VOOO jumping sprite
        this.assets.vooo.jumping = new Image();
        this.assets.vooo.jumping.src = 'jumping.png';
        this.assets.vooo.jumping.onload = () => this.checkAllImagesLoaded();
        this.assets.vooo.jumping.onerror = () => {
            console.error("Error loading jumping.png");
            this.checkAllImagesLoaded();
        };
        
        // Load strawberry enemies sprite
        this.assets.strawberry.img = new Image();
        this.assets.strawberry.img.src = 'enemies.png';
        this.assets.strawberry.img.onload = () => this.checkAllImagesLoaded();
        this.assets.strawberry.img.onerror = () => {
            console.error("Error loading enemies.png");
            this.checkAllImagesLoaded();
        };
        
        // Load cherry enemies sprite
        this.assets.cherry.img = new Image();
        this.assets.cherry.img.src = 'cherry-enemies.png';
        this.assets.cherry.img.onload = () => this.checkAllImagesLoaded();
        this.assets.cherry.img.onerror = () => {
            console.error("Error loading cherry-enemies.png");
            this.checkAllImagesLoaded();
        };
        
        // Load boss sprite based on level
        this.assets.boss.img = new Image();
        if (this.currentLevel === 3) {
            this.assets.boss.img.src = 'cherry-boss.png';
        } else {
            this.assets.boss.img.src = 'boss.png';
        }
        this.assets.boss.img.onload = () => this.checkAllImagesLoaded();
        this.assets.boss.img.onerror = () => {
            console.error("Error loading boss.png");
            this.checkAllImagesLoaded();
        };
        
        // Create tiles for platforms
        this.createTiles();
        
        // Create background layers
        this.createBackgroundLayers();
    }
    
    /**
     * Check if all images are loaded
     */
    checkAllImagesLoaded() {
        this.imagesLoaded++;
        if (this.imagesLoaded === this.totalImages + 1 && this.onAllLoaded) {
            this.onAllLoaded();
        }
    }
    
    /**
     * Create tiles for platforms
     */
    createTiles() {
        this.assets.tiles.img = document.createElement('canvas');
        this.assets.tiles.img.width = this.assets.tiles.size * 3; // 3 tile types
        this.assets.tiles.img.height = this.assets.tiles.size;
        const tilesCtx = this.assets.tiles.img.getContext('2d');
        
        // Ground tile
        tilesCtx.fillStyle = '#8B4513'; // Brown base
        tilesCtx.fillRect(0, 0, this.assets.tiles.size, this.assets.tiles.size);
        tilesCtx.fillStyle = '#A0522D'; // Lighter brown top
        tilesCtx.fillRect(0, 0, this.assets.tiles.size, 5);
        tilesCtx.fillStyle = '#654321'; // Darker details
        tilesCtx.fillRect(5, 10, 5, 5);
        tilesCtx.fillRect(20, 15, 8, 8);
        tilesCtx.fillRect(30, 25, 6, 6);
        
        // Platform tile
        tilesCtx.fillStyle = '#00AA00'; // Green base
        tilesCtx.fillRect(this.assets.tiles.size, 0, this.assets.tiles.size, this.assets.tiles.size);
        tilesCtx.fillStyle = '#00CC00'; // Lighter green top
        tilesCtx.fillRect(this.assets.tiles.size, 0, this.assets.tiles.size, 5);
        tilesCtx.fillStyle = '#008800'; // Darker details
        tilesCtx.fillRect(this.assets.tiles.size + 10, 15, 7, 7);
        tilesCtx.fillRect(this.assets.tiles.size + 25, 20, 10, 5);
        
        // Obstacle tile
        tilesCtx.fillStyle = '#888888'; // Gray base
        tilesCtx.fillRect(this.assets.tiles.size * 2, 0, this.assets.tiles.size, this.assets.tiles.size);
        tilesCtx.fillStyle = '#AAAAAA'; // Lighter top
        tilesCtx.fillRect(this.assets.tiles.size * 2, 0, this.assets.tiles.size, 5);
        tilesCtx.fillStyle = '#666666'; // Darker details
        tilesCtx.fillRect(this.assets.tiles.size * 2 + 5, 10, 10, 10);
        tilesCtx.fillRect(this.assets.tiles.size * 2 + 20, 15, 15, 15);
    }
    
    /**
     * Create background layers with parallax effect
     */
    createBackgroundLayers() {
        const { createCanvas } = window.GameUtils;
        this.assets.background.layers = [];
        
        // Sky layer
        const skyLayer = createCanvas(this.assets.background.width, this.assets.background.height);
        const skyCtx = skyLayer.getContext('2d');
        
        // Gradient sky
        const skyGradient = skyCtx.createLinearGradient(0, 0, 0, this.assets.background.height);
        skyGradient.addColorStop(0, '#87CEEB'); // Sky blue
        skyGradient.addColorStop(1, '#E0F7FF'); // Lighter at horizon
        skyCtx.fillStyle = skyGradient;
        skyCtx.fillRect(0, 0, this.assets.background.width, this.assets.background.height);
        
        this.assets.background.layers.push({
            img: skyLayer,
            speed: 0.1
        });
        
        // Mountains layer
        const mountainsLayer = createCanvas(this.assets.background.width, this.assets.background.height);
        const mountainsCtx = mountainsLayer.getContext('2d');
        
        // Mountains
        for (let i = 0; i < 15; i++) {
            const mountainX = i * 400;
            const mountainHeight = Math.random() * 150 + 100;
            
            // Mountain gradient
            const mountainGradient = mountainsCtx.createLinearGradient(
                mountainX, this.assets.background.height - mountainHeight,
                mountainX + 200, this.assets.background.height
            );
            mountainGradient.addColorStop(0, '#8B4513'); // Brown
            mountainGradient.addColorStop(0.5, '#A0522D'); // Lighter brown
            mountainGradient.addColorStop(1, '#654321'); // Darker brown
            
            mountainsCtx.fillStyle = mountainGradient;
            mountainsCtx.beginPath();
            mountainsCtx.moveTo(mountainX, this.assets.background.height);
            mountainsCtx.lineTo(mountainX + 200, this.assets.background.height - mountainHeight);
            mountainsCtx.lineTo(mountainX + 400, this.assets.background.height);
            mountainsCtx.fill();
            
            // Snow caps
            mountainsCtx.fillStyle = '#FFFFFF';
            mountainsCtx.beginPath();
            mountainsCtx.moveTo(mountainX + 180, this.assets.background.height - mountainHeight + 20);
            mountainsCtx.lineTo(mountainX + 200, this.assets.background.height - mountainHeight);
            mountainsCtx.lineTo(mountainX + 220, this.assets.background.height - mountainHeight + 20);
            mountainsCtx.fill();
        }
        
        this.assets.background.layers.push({
            img: mountainsLayer,
            speed: 0.2
        });
        
        // Clouds layer
        const cloudsLayer = createCanvas(this.assets.background.width, this.assets.background.height);
        const cloudsCtx = cloudsLayer.getContext('2d');
        
        // Clouds
        cloudsCtx.fillStyle = '#FFFFFF';
        for (let i = 0; i < 20; i++) {
            const cloudX = Math.random() * this.assets.background.width;
            const cloudY = Math.random() * 150 + 20;
            const cloudWidth = Math.random() * 100 + 50;
            const cloudHeight = Math.random() * 40 + 20;
            
            cloudsCtx.beginPath();
            cloudsCtx.arc(cloudX, cloudY, cloudWidth/2, 0, Math.PI * 2);
            cloudsCtx.arc(cloudX + cloudWidth/2, cloudY - cloudHeight/4, cloudWidth/3, 0, Math.PI * 2);
            cloudsCtx.arc(cloudX - cloudWidth/3, cloudY - cloudHeight/6, cloudWidth/4, 0, Math.PI * 2);
            cloudsCtx.fill();
        }
        
        this.assets.background.layers.push({
            img: cloudsLayer,
            speed: 0.3
        });
        
        // Trees and bushes layer
        const treesLayer = createCanvas(this.assets.background.width, this.assets.background.height);
        const treesCtx = treesLayer.getContext('2d');
        
        // Trees
        for (let i = 0; i < 30; i++) {
            const treeX = i * 200 + Math.random() * 100;
            const treeHeight = Math.random() * 100 + 80;
            
            // Trunk
            treesCtx.fillStyle = '#8B4513';
            treesCtx.fillRect(treeX, this.assets.background.height - treeHeight, 20, treeHeight);
            
            // Leaves
            treesCtx.fillStyle = '#006400';
            treesCtx.beginPath();
            treesCtx.arc(treeX + 10, this.assets.background.height - treeHeight - 30, 40, 0, Math.PI * 2);
            treesCtx.fill();
            treesCtx.beginPath();
            treesCtx.arc(treeX + 30, this.assets.background.height - treeHeight - 10, 30, 0, Math.PI * 2);
            treesCtx.fill();
            treesCtx.beginPath();
            treesCtx.arc(treeX - 10, this.assets.background.height - treeHeight - 20, 25, 0, Math.PI * 2);
            treesCtx.fill();
        }
        
        // Bushes
        for (let i = 0; i < 40; i++) {
            const bushX = i * 150 + Math.random() * 100;
            
            treesCtx.fillStyle = '#228B22';
            treesCtx.beginPath();
            treesCtx.arc(bushX, this.assets.background.height - 20, 20, 0, Math.PI * 2);
            treesCtx.arc(bushX + 15, this.assets.background.height - 25, 15, 0, Math.PI * 2);
            treesCtx.arc(bushX - 15, this.assets.background.height - 15, 18, 0, Math.PI * 2);
            treesCtx.fill();
        }
        
        this.assets.background.layers.push({
            img: treesLayer,
            speed: 0.5
        });
        
        // Combine all layers into the background image
        this.assets.background.img = createCanvas(this.assets.background.width, this.assets.background.height);
        const bgCtx = this.assets.background.img.getContext('2d');
        
        // Draw all layers
        this.assets.background.layers.forEach(layer => {
            bgCtx.drawImage(layer.img, 0, 0);
        });
    }
}

// Export the AssetManager
if (typeof window !== 'undefined') {
    window.AssetManager = AssetManager;
}
