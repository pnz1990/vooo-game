// Game canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');

// Set canvas size to match container
canvas.width = 800;
canvas.height = 500;

// Game state
let gameRunning = false;
let score = 0;
let lives = 3;
let currentLevel = 1;
let maxLevel = 2; // Maximum available level
let speedMultiplier = 0.85; // Level 1: 15% slower (0.85)
let gravity = 0.46; // Base gravity value
let keys = {};
let cameraX = 0;
let levelSelectionMode = false; // Whether we're in level selection mode
let bossHits = 0;
let bossDefeated = false;
let doubleJumpEnabled = true; // Enable double jump feature
let debugMode = false; // Disable debug information

// Cheat code variables
let cheatSequence = [];
let cheatActivated = false;

// Game assets
const assets = {
    vooo: {
        running: null,
        jumping: null,
        width: 50,
        height: 70,
        spriteWidth: 398, // Actual width of running.png
        spriteHeight: 625, // Actual height of running.png
        jumpSpriteWidth: 431, // Actual width of jumping.png
        jumpSpriteHeight: 780, // Actual height of jumping.png
        frames: 1, // Using just one frame for now to fix blinking
        currentFrame: 0,
        frameCount: 0,
        frameDelay: 8,
        speed: 3.45 * speedMultiplier, // Base speed adjusted by speed multiplier
        facingRight: true,
        isJumping: false
    },
    strawberry: {
        img: null,
        width: 40,
        height: 40,
        spriteWidth: 1024, // Actual width of enemies.png
        spriteHeight: 1024, // Actual height of enemies.png
        frames: 1, // Using just one frame for now
        currentFrame: 0,
        frameCount: 0,
        frameDelay: 15
    },
    lava: {
        color: '#FF4500', // Bright orange-red
        glowColor: '#FFFF00', // Yellow glow
        animationSpeed: 0.003 // Slowed down for smoother animation
    },
    boss: {
        img: null,
        width: 100,
        height: 120,
        spriteWidth: 1024, // Actual width of boss.png
        spriteHeight: 1024, // Actual height of boss.png
        frames: 1, // Using just one frame for now
        currentFrame: 0,
        frameCount: 0,
        frameDelay: 20,
        hitsRequired: 5,
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
        size: 40
    }
};

// Player object
const player = {
    x: 100,
    y: 0,
    width: assets.vooo.width,
    height: assets.vooo.height,
    jumping: false,
    doubleJumping: false,
    canDoubleJump: false,
    velocityX: 0,
    velocityY: 0,
    jumpPower: -11.5 * speedMultiplier, // Base jump power adjusted by speed multiplier
    doubleJumpPower: -13 * speedMultiplier, // Stronger jump for double jump
    isAlive: true,
    invulnerable: false,
    invulnerableTimer: 0,
    moveSpeed: 3.45 * speedMultiplier // Base move speed adjusted by speed multiplier
};

// Boss object
const boss = {
    x: 7800,
    y: 0,
    width: assets.boss.width,
    height: assets.boss.height,
    velocityX: 1.725 * speedMultiplier, // Base velocity adjusted by speed multiplier
    velocityY: 0,
    active: true,
    hits: 0,
    invulnerable: false,
    invulnerableTimer: 0,
    jumpPower: -6.9 * speedMultiplier // Base jump power adjusted by speed multiplier
};

// Game objects
let platforms = [];
let enemies = [];
let obstacles = [];
let levelEnd = { x: 8000, width: 50, height: 500 };

// Load game assets
function loadAssets() {
    // Load VOOO running sprite
    assets.vooo.running = new Image();
    assets.vooo.running.src = 'running.png';
    
    // Load VOOO jumping sprite
    assets.vooo.jumping = new Image();
    assets.vooo.jumping.src = 'jumping.png';
    
    // Load strawberry enemies sprite
    assets.strawberry.img = new Image();
    assets.strawberry.img.src = 'enemies.png';
    
    // Make enemies bigger for better visibility
    assets.strawberry.width = 60;
    assets.strawberry.height = 60;
    
    // Load boss sprite
    assets.boss.img = new Image();
    assets.boss.img.src = 'boss.png';
    
    // Make boss bigger for better visibility
    assets.boss.width = 120;
    assets.boss.height = 140;
    
    // Create tiles for platforms
    assets.tiles.img = document.createElement('canvas');
    assets.tiles.img.width = assets.tiles.size * 3; // 3 tile types
    assets.tiles.img.height = assets.tiles.size;
    const tilesCtx = assets.tiles.img.getContext('2d');
    
    // Ground tile
    tilesCtx.fillStyle = '#8B4513'; // Brown base
    tilesCtx.fillRect(0, 0, assets.tiles.size, assets.tiles.size);
    tilesCtx.fillStyle = '#A0522D'; // Lighter brown top
    tilesCtx.fillRect(0, 0, assets.tiles.size, 5);
    tilesCtx.fillStyle = '#654321'; // Darker details
    tilesCtx.fillRect(5, 10, 5, 5);
    tilesCtx.fillRect(20, 15, 8, 8);
    tilesCtx.fillRect(30, 25, 6, 6);
    
    // Platform tile
    tilesCtx.fillStyle = '#00AA00'; // Green base
    tilesCtx.fillRect(assets.tiles.size, 0, assets.tiles.size, assets.tiles.size);
    tilesCtx.fillStyle = '#00CC00'; // Lighter green top
    tilesCtx.fillRect(assets.tiles.size, 0, assets.tiles.size, 5);
    tilesCtx.fillStyle = '#008800'; // Darker details
    tilesCtx.fillRect(assets.tiles.size + 10, 15, 7, 7);
    tilesCtx.fillRect(assets.tiles.size + 25, 20, 10, 5);
    
    // Obstacle tile
    tilesCtx.fillStyle = '#888888'; // Gray base
    tilesCtx.fillRect(assets.tiles.size * 2, 0, assets.tiles.size, assets.tiles.size);
    tilesCtx.fillStyle = '#AAAAAA'; // Lighter top
    tilesCtx.fillRect(assets.tiles.size * 2, 0, assets.tiles.size, 5);
    tilesCtx.fillStyle = '#666666'; // Darker details
    tilesCtx.fillRect(assets.tiles.size * 2 + 5, 10, 10, 10);
    tilesCtx.fillRect(assets.tiles.size * 2 + 20, 15, 15, 15);
    
    // Create multi-layered background
    assets.background.layers = [];
    
    // Sky layer
    const skyLayer = document.createElement('canvas');
    skyLayer.width = assets.background.width;
    skyLayer.height = assets.background.height;
    const skyCtx = skyLayer.getContext('2d');
    
    // Gradient sky
    const skyGradient = skyCtx.createLinearGradient(0, 0, 0, assets.background.height);
    skyGradient.addColorStop(0, '#87CEEB'); // Sky blue
    skyGradient.addColorStop(1, '#E0F7FF'); // Lighter at horizon
    skyCtx.fillStyle = skyGradient;
    skyCtx.fillRect(0, 0, assets.background.width, assets.background.height);
    
    assets.background.layers.push({
        img: skyLayer,
        speed: 0.1
    });
    
    // Mountains layer
    const mountainsLayer = document.createElement('canvas');
    mountainsLayer.width = assets.background.width;
    mountainsLayer.height = assets.background.height;
    const mountainsCtx = mountainsLayer.getContext('2d');
    
    // Mountains
    for (let i = 0; i < 15; i++) {
        const mountainX = i * 400;
        const mountainHeight = Math.random() * 150 + 100;
        
        // Mountain gradient
        const mountainGradient = mountainsCtx.createLinearGradient(
            mountainX, assets.background.height - mountainHeight,
            mountainX + 200, assets.background.height
        );
        mountainGradient.addColorStop(0, '#8B4513'); // Brown
        mountainGradient.addColorStop(0.5, '#A0522D'); // Lighter brown
        mountainGradient.addColorStop(1, '#654321'); // Darker brown
        
        mountainsCtx.fillStyle = mountainGradient;
        mountainsCtx.beginPath();
        mountainsCtx.moveTo(mountainX, assets.background.height);
        mountainsCtx.lineTo(mountainX + 200, assets.background.height - mountainHeight);
        mountainsCtx.lineTo(mountainX + 400, assets.background.height);
        mountainsCtx.fill();
        
        // Snow caps
        mountainsCtx.fillStyle = '#FFFFFF';
        mountainsCtx.beginPath();
        mountainsCtx.moveTo(mountainX + 180, assets.background.height - mountainHeight + 20);
        mountainsCtx.lineTo(mountainX + 200, assets.background.height - mountainHeight);
        mountainsCtx.lineTo(mountainX + 220, assets.background.height - mountainHeight + 20);
        mountainsCtx.fill();
    }
    
    assets.background.layers.push({
        img: mountainsLayer,
        speed: 0.2
    });
    
    // Clouds layer
    const cloudsLayer = document.createElement('canvas');
    cloudsLayer.width = assets.background.width;
    cloudsLayer.height = assets.background.height;
    const cloudsCtx = cloudsLayer.getContext('2d');
    
    // Clouds
    cloudsCtx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 20; i++) {
        const cloudX = Math.random() * assets.background.width;
        const cloudY = Math.random() * 150 + 20;
        const cloudWidth = Math.random() * 100 + 50;
        const cloudHeight = Math.random() * 40 + 20;
        
        cloudsCtx.beginPath();
        cloudsCtx.arc(cloudX, cloudY, cloudWidth/2, 0, Math.PI * 2);
        cloudsCtx.arc(cloudX + cloudWidth/2, cloudY - cloudHeight/4, cloudWidth/3, 0, Math.PI * 2);
        cloudsCtx.arc(cloudX - cloudWidth/3, cloudY - cloudHeight/6, cloudWidth/4, 0, Math.PI * 2);
        cloudsCtx.fill();
    }
    
    assets.background.layers.push({
        img: cloudsLayer,
        speed: 0.3
    });
    
    // Trees and bushes layer
    const treesLayer = document.createElement('canvas');
    treesLayer.width = assets.background.width;
    treesLayer.height = assets.background.height;
    const treesCtx = treesLayer.getContext('2d');
    
    // Trees
    for (let i = 0; i < 30; i++) {
        const treeX = i * 200 + Math.random() * 100;
        const treeHeight = Math.random() * 100 + 80;
        
        // Trunk
        treesCtx.fillStyle = '#8B4513';
        treesCtx.fillRect(treeX, assets.background.height - treeHeight, 20, treeHeight);
        
        // Leaves
        treesCtx.fillStyle = '#006400';
        treesCtx.beginPath();
        treesCtx.arc(treeX + 10, assets.background.height - treeHeight - 30, 40, 0, Math.PI * 2);
        treesCtx.fill();
        treesCtx.beginPath();
        treesCtx.arc(treeX + 30, assets.background.height - treeHeight - 10, 30, 0, Math.PI * 2);
        treesCtx.fill();
        treesCtx.beginPath();
        treesCtx.arc(treeX - 10, assets.background.height - treeHeight - 20, 25, 0, Math.PI * 2);
        treesCtx.fill();
    }
    
    // Bushes
    for (let i = 0; i < 40; i++) {
        const bushX = i * 150 + Math.random() * 100;
        
        treesCtx.fillStyle = '#228B22';
        treesCtx.beginPath();
        treesCtx.arc(bushX, assets.background.height - 20, 20, 0, Math.PI * 2);
        treesCtx.arc(bushX + 15, assets.background.height - 25, 15, 0, Math.PI * 2);
        treesCtx.arc(bushX - 15, assets.background.height - 15, 18, 0, Math.PI * 2);
        treesCtx.fill();
    }
    
    assets.background.layers.push({
        img: treesLayer,
        speed: 0.5
    });
    
    // Combine all layers into the background image
    assets.background.img = document.createElement('canvas');
    assets.background.img.width = assets.background.width;
    assets.background.img.height = assets.background.height;
    const bgCtx = assets.background.img.getContext('2d');
    
    // Draw all layers
    assets.background.layers.forEach(layer => {
        bgCtx.drawImage(layer.img, 0, 0);
    });
}

// Initialize level
function initLevel() {
    // Reset game state
    score = 0;
    lives = cheatActivated ? 999 : 3; // Keep 999 lives if cheat is active
    cameraX = 0;
    bossHits = 0;
    bossDefeated = false;
    
    // Set speed multiplier based on current level
    // Level 1: 15% slower (0.85)
    // Level 2+: Progressively faster
    speedMultiplier = currentLevel === 1 ? 0.85 : 1 + ((currentLevel - 2) * 0.1);
    
    // Update speed-dependent variables
    gravity = 0.46 * speedMultiplier;
    player.moveSpeed = 3.45 * speedMultiplier;
    player.jumpPower = -11.5 * speedMultiplier;
    player.doubleJumpPower = -13 * speedMultiplier;
    boss.velocityX = 1.725 * speedMultiplier;
    boss.jumpPower = -6.9 * speedMultiplier;
    assets.vooo.speed = 3.45 * speedMultiplier;
    
    // Reset player
    player.x = 100;
    player.y = 0;
    player.velocityX = 0;
    player.velocityY = 0;
    player.jumping = false;
    player.doubleJumping = false;
    player.canDoubleJump = false;
    player.isAlive = true;
    player.invulnerable = false;
    player.invulnerableTimer = 0;
    
    // Reset boss
    boss.x = 7800;
    boss.y = 0;
    boss.velocityX = 1.725;
    boss.velocityY = 0;
    boss.active = true;
    boss.hits = 0;
    boss.invulnerable = false;
    boss.invulnerableTimer = 0;
    
    // Create ground platform with gaps for lava in level 2+
    if (currentLevel === 1) {
        // Level 1: Continuous ground
        platforms = [
            { x: 0, y: canvas.height - 40, width: 8000, height: 40, type: 'ground' }
        ];
    } else {
        // Level 2+: Ground with lava gaps
        platforms = [];
        obstacles = []; // Clear obstacles first
        let currentX = 0;
        
        while (currentX < 8000) {
            // Determine segment length
            let segmentLength;
            
            if (currentX < 500) {
                // Safe starting area
                segmentLength = 500;
                
                // Add ground segment
                platforms.push({
                    x: currentX,
                    y: canvas.height - 40,
                    width: segmentLength,
                    height: 40,
                    type: 'ground'
                });
                
                currentX += segmentLength;
            } else if (currentX > 7400) { // Match buffer zone
                // Safe boss area
                segmentLength = 8000 - currentX;
                
                // Add ground segment
                platforms.push({
                    x: currentX,
                    y: canvas.height - 40,
                    width: segmentLength,
                    height: 40,
                    type: 'ground'
                });
                
                currentX += segmentLength;
            } else {
                // Random segment length between 200-500
                segmentLength = Math.random() * 300 + 200;
                
                // Add ground segment
                platforms.push({
                    x: currentX,
                    y: canvas.height - 40,
                    width: segmentLength,
                    height: 40,
                    type: 'ground'
                });
                
                currentX += segmentLength;
                
                // Add lava gap after this segment (only if not near boss area)
                if (currentX < 7300) {
                    const gapLength = Math.random() * 100 + 80;
                    
                    // Add lava obstacle IN THE GAP
                    obstacles.push({
                        x: currentX,
                        y: canvas.height - 40, // Align with bottom of screen
                        width: gapLength,
                        height: 40, // Match the height of the ground platforms
                        type: 'lava'
                    });
                    
                    // Skip the gap for next ground segment
                    currentX += gapLength;
                }
            }
        }
    }
    
    // Add platforms - more of them and more varied
    for (let i = 0; i < 40; i++) {
        const platformWidth = Math.random() * 200 + 100;
        const platformX = 500 + i * 200 + Math.random() * 100;
        const platformY = canvas.height - 40 - (Math.random() * 250 + 50);
        
        // STRICT CHECK: Don't place ANY platforms in or near the boss area
        if (platformX < 7400) {  // Added buffer zone before boss area
            platforms.push({
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
                if (smallPlatformX + smallPlatformWidth < 7400) {
                    platforms.push({
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
    
    // Add a special platform for the boss battle
    // Removed the special platform for boss battle to make it a clean arena
    
    // Add obstacles
    if (!obstacles) obstacles = [];
    
    // Add regular obstacles (rocks, etc.)
    const obstacleCount = currentLevel === 1 ? 25 : 30; // More obstacles in level 2+
    for (let i = 0; i < obstacleCount; i++) {
        const obstacleWidth = Math.random() * 60 + 40;
        const obstacleHeight = Math.random() * 80 + 40;
        const obstacleX = 800 + i * 300 + Math.random() * 200;
        const obstacleY = canvas.height - 40 - obstacleHeight;
        
        // STRICT CHECK: Don't place obstacles in or near the boss area
        if (obstacleX < 7400) {  // Added buffer zone before boss area
            obstacles.push({
                x: obstacleX,
                y: obstacleY,
                width: obstacleWidth,
                height: obstacleHeight,
                type: 'rock'
            });
        }
    }
    
    // Add enemies - number based on level
    enemies = [];
    // Fewer enemies in level 1, more in higher levels
    // Level 2 has 10% more enemies than the base amount
    const baseEnemyCount = 30;
    let enemyCount;
    
    if (currentLevel === 1) {
        enemyCount = 8; // Level 1: Few enemies
    } else if (currentLevel === 2) {
        enemyCount = Math.floor(baseEnemyCount * 1.1); // Level 2: 10% more than base
    } else {
        enemyCount = Math.floor(baseEnemyCount * (1 + (currentLevel - 2) * 0.15)); // Higher levels: Even more
    }
    
    for (let i = 0; i < enemyCount; i++) {
        const enemyX = 600 + i * 250 + Math.random() * 100;
        
        // STRICT CHECK: Skip this iteration if the enemy would be in or near the boss area
        if (enemyX >= 7400) {  // Added buffer zone before boss area
            continue;
        }
        
        // Position enemies on top of the ground, not buried in it
        const enemyY = canvas.height - 40 - assets.strawberry.height;
        
        enemies.push({
            x: enemyX,
            y: enemyY,
            width: assets.strawberry.width,
            height: assets.strawberry.height,
            velocityX: (Math.random() > 0.5 ? -1.5 : 1.5) * speedMultiplier, // Random direction adjusted by speed multiplier
            active: true
        });
    }
    
    // Add some enemies on platforms - fewer in level 1
    const platformEnemyChance = currentLevel === 1 ? 0.1 : 0.4;
    
    // Filter platforms to only include those outside the boss area
    const nonBossPlatforms = platforms.filter(platform => platform.x < 7400 || platform.type === 'ground');
    
    nonBossPlatforms.forEach((platform, index) => {
        // Skip ground platforms and platforms in boss area
        if (platform.type === 'ground' || platform.x >= 7400) {
            return;
        }
        
        if (platform.width > 80 && Math.random() > (1 - platformEnemyChance)) {
            enemies.push({
                x: platform.x + platform.width/2,
                // Position enemies on top of platforms, not buried in them
                y: platform.y - assets.strawberry.height,
                width: assets.strawberry.width,
                height: assets.strawberry.height,
                velocityX: (Math.random() > 0.5 ? -1.5 : 1.5) * speedMultiplier, // Move left or right, adjusted by speed multiplier
                platformIndex: platforms.indexOf(platform), // Get the actual index in the original array
                active: true
            });
        }
    });
    
    // Set level end - further away
    levelEnd = { x: 8200, width: 50, height: 500 };
    
    updateScoreDisplay();
    updateLivesDisplay();
}

// Update score display
function updateScoreDisplay() {
    scoreElement.textContent = `Score: ${score} | Level: ${currentLevel}`;
    livesElement.textContent = `Lives: ${lives}`;
}

// Update lives display
function updateLivesDisplay() {
    livesElement.textContent = `Lives: ${lives}`;
}

// Game loop
function gameLoop() {
    if (!gameRunning) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    drawBackground();
    
    // Update player
    updatePlayer();
    
    // Update enemies
    updateEnemies();
    
    // Update boss
    updateBoss();
    
    // Draw platforms
    drawPlatforms();
    
    // Draw obstacles
    drawObstacles();
    
    // Draw level end
    drawLevelEnd();
    
    // Draw player
    drawPlayer();
    
    // Draw enemies
    drawEnemies();
    
    // Draw boss
    drawBoss();
    
    // Draw boss health bar if near boss
    if (Math.abs(player.x - boss.x) < 500 && boss.active) {
        drawBossHealthBar();
    }
    
    // Check for level completion
    if (bossDefeated && player.x + player.width > levelEnd.x) {
        gameRunning = false;
        currentLevel++; // Increment level for next game
        showMessage("Level Complete! Score: " + score);
    }
    
    // Check if player is alive
    if (!player.isAlive) {
        lives--;
        updateLivesDisplay();
        
        if (lives <= 0) {
            gameRunning = false;
            showMessage("Game Over! Score: " + score);
        } else {
            resetPlayerAfterDeath();
        }
    }
    
    requestAnimationFrame(gameLoop);
}

// Update player position and state
function updatePlayer() {
    // Handle keyboard input for movement
    player.velocityX = 0;
    
    if (keys['KeyA'] || keys['ArrowLeft']) {
        player.velocityX = -player.moveSpeed;
        assets.vooo.facingRight = false;
    }
    
    if (keys['KeyD'] || keys['ArrowRight']) {
        player.velocityX = player.moveSpeed;
        assets.vooo.facingRight = true;
    }
    
    // Handle jumping and double jumping - REMOVED from here to avoid duplicate jumps
    // Jump handling is now only in the keydown event listener
    
    // Apply gravity
    player.velocityY += gravity;
    
    // Update player position
    player.x += player.velocityX;
    player.y += player.velocityY;
    
    // Keep player within level bounds
    if (player.x < 0) {
        player.x = 0;
    }
    
    // Check if player is in boss area (x position > 7500)
    const inBossArea = player.x > 7500;
    
    // Check for collisions with platforms
    let onGround = false;
    platforms.forEach(platform => {
        // Skip ALL non-ground platforms in boss area
        if (inBossArea && platform.type !== 'ground') {
            return;
        }
        
        if (
            player.y + player.height > platform.y + 5 &&
            player.y < platform.y + platform.height - 5 &&
            player.x + player.width - 5 > platform.x &&
            player.x + 5 < platform.x + platform.width
        ) {
            // Collision from above (landing on platform)
            if (player.velocityY > 0 && player.y + player.height - player.velocityY <= platform.y) {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.jumping = false;
                player.doubleJumping = false;
                player.canDoubleJump = false; // Reset double jump when landing
                assets.vooo.isJumping = false;
                onGround = true;
            }
            // Collision from below (hitting platform from underneath)
            else if (player.velocityY < 0 && player.y >= platform.y + platform.height) {
                player.y = platform.y + platform.height;
                player.velocityY = 0;
            }
            // Collision from left
            else if (player.velocityX > 0 && player.x + player.width - player.velocityX <= platform.x) {
                player.x = platform.x - player.width;
            }
            // Collision from right
            else if (player.velocityX < 0 && player.x - player.velocityX >= platform.x + platform.width) {
                player.x = platform.x + platform.width;
            }
        }
    });
    
    // Check for collisions with obstacles
    obstacles.forEach(obstacle => {
        if (
            player.y + player.height > obstacle.y + 5 &&  // Add 5px buffer at the top
            player.y < obstacle.y + obstacle.height - 5 &&  // Add 5px buffer at the bottom
            player.x + player.width - 5 > obstacle.x &&  // Add 5px buffer on the right
            player.x + 5 < obstacle.x + obstacle.width  // Add 5px buffer on the left
        ) {
            // Handle lava collision - instant death
            if (obstacle.type === 'lava' && 
                player.y + player.height > obstacle.y - 5) { // Adjusted collision detection for lava
                player.isAlive = false;
                return;
            }
            
            // Collision from above
            if (player.velocityY > 0 && player.y + player.height - player.velocityY <= obstacle.y) {
                player.y = obstacle.y - player.height;
                player.velocityY = 0;
                player.jumping = false;
                assets.vooo.isJumping = false;
                onGround = true;
            }
            // Collision from sides or below - push player away
            else {
                // Find the shortest direction to push out
                const fromLeft = player.x + player.width - obstacle.x;
                const fromRight = obstacle.x + obstacle.width - player.x;
                const fromTop = player.y + player.height - obstacle.y;
                const fromBottom = obstacle.y + obstacle.height - player.y;
                
                const min = Math.min(fromLeft, fromRight, fromTop, fromBottom);
                
                if (min === fromLeft) {
                    player.x = obstacle.x - player.width;
                } else if (min === fromRight) {
                    player.x = obstacle.x + obstacle.width;
                } else if (min === fromTop) {
                    player.y = obstacle.y - player.height;
                    player.velocityY = 0;
                    player.jumping = false;
                    assets.vooo.isJumping = false;
                } else if (min === fromBottom) {
                    player.y = obstacle.y + obstacle.height;
                    player.velocityY = 0;
                }
            }
        }
    });
    
    // Check if player fell off the screen
    if (player.y > canvas.height) {
        player.isAlive = false;
    }
    
    // Update camera position to follow player
    if (player.x > canvas.width / 3 && player.x < levelEnd.x - canvas.width * 2/3) {
        cameraX = player.x - canvas.width / 3;
    }
    
    // Update score based on distance traveled
    if (player.velocityX > 0) {
        score += Math.floor(player.velocityX);
        if (score % 100 === 0) {
            updateScoreDisplay();
        }
    }
    
    // Handle invulnerability timer
    if (player.invulnerable) {
        player.invulnerableTimer--;
        if (player.invulnerableTimer <= 0) {
            player.invulnerable = false;
        }
    }
    
    // Check for collision with boss
    if (boss.active && !player.invulnerable && !boss.invulnerable &&
        player.x + 5 < boss.x + boss.width - 5 &&
        player.x + player.width - 5 > boss.x + 5 &&
        player.y + 5 < boss.y + boss.height - 5 &&
        player.y + player.height - 5 > boss.y + 5
    ) {
        // Check if player is jumping on boss from above
        if (player.velocityY > 0 && player.y + player.height - player.velocityY <= boss.y + boss.height/3) {
            // Hit boss
            boss.hits++;
            boss.invulnerable = true;
            boss.invulnerableTimer = 30;
            player.velocityY = player.jumpPower * 0.7; // Bounce
            score += 200;
            updateScoreDisplay();
            
            // Check if boss is defeated
            if (boss.hits >= assets.boss.hitsRequired) {
                boss.active = false;
                bossDefeated = true;
                score += 1000;
                updateScoreDisplay();
            }
        } else {
            // Player gets hit by boss
            player.isAlive = false;
        }
    }
}

// Update enemies
function updateEnemies() {
    enemies.forEach(enemy => {
        if (!enemy.active) return;
        
        // Deactivate enemies that enter the boss area or buffer zone
        if (enemy.x > 7400) {
            enemy.active = false;
            return;
        }
        
        // Apply gravity to ground enemies
        if (enemy.platformIndex === undefined) {
            enemy.velocityY = enemy.velocityY || 0;
            enemy.velocityY += gravity;
            enemy.y += enemy.velocityY;
        }
        
        // Move enemy horizontally
        enemy.x += enemy.velocityX;
        
        // Check if enemy is on a platform
        if (enemy.platformIndex !== undefined) {
            const platform = platforms[enemy.platformIndex];
            
            // Skip if platform no longer exists
            if (!platform) {
                enemy.active = false;
                return;
            }
            
            // Keep enemy on platform
            if (enemy.x < platform.x) {
                enemy.velocityX *= -1;
                enemy.x = platform.x;
            } else if (enemy.x + enemy.width > platform.x + platform.width) {
                enemy.velocityX *= -1;
                enemy.x = platform.x + platform.width - enemy.width;
            }
        } else {
            // Ground enemy - check if it's still on ground
            let onGround = false;
            
            // Check for collisions with ground platforms
            for (let i = 0; i < platforms.length; i++) {
                const platform = platforms[i];
                if (platform.type === 'ground' && 
                    enemy.x + enemy.width > platform.x && 
                    enemy.x < platform.x + platform.width &&
                    enemy.y + enemy.height > platform.y &&
                    enemy.y + enemy.height < platform.y + platform.height + 5) {
                    
                    enemy.y = platform.y - enemy.height;
                    enemy.velocityY = 0;
                    onGround = true;
                    break;
                }
            }
            
            // If enemy is not on ground, it should fall
            if (!onGround) {
                // Check if enemy fell off screen
                if (enemy.y > canvas.height) {
                    enemy.active = false;
                }
                
                // Check if enemy fell into lava
                obstacles.forEach(obstacle => {
                    if (obstacle.type === 'lava' &&
                        enemy.x + enemy.width > obstacle.x &&
                        enemy.x < obstacle.x + obstacle.width &&
                        enemy.y + enemy.height > obstacle.y) {
                        enemy.active = false;
                    }
                });
            } else {
                // If at edge of platform, turn around
                let foundPlatform = false;
                for (let i = 0; i < platforms.length; i++) {
                    const platform = platforms[i];
                    if (platform.type === 'ground') {
                        // Check if about to walk off edge
                        if (enemy.velocityX > 0 && 
                            enemy.x + enemy.width + 5 > platform.x + platform.width &&
                            enemy.x < platform.x + platform.width) {
                            enemy.velocityX *= -1;
                            foundPlatform = true;
                            break;
                        } else if (enemy.velocityX < 0 && 
                                  enemy.x - 5 < platform.x &&
                                  enemy.x + enemy.width > platform.x) {
                            enemy.velocityX *= -1;
                            foundPlatform = true;
                            break;
                        }
                    }
                }
            }
        }
        
        // Check collision with player
        if (
            !player.invulnerable &&
            player.x + 5 < enemy.x + enemy.width - 5 &&
            player.x + player.width - 5 > enemy.x + 5 &&
            player.y + 5 < enemy.y + enemy.height - 5 &&
            player.y + player.height - 5 > enemy.y + 5
        ) {
            // Check if player is jumping on enemy from above
            if (player.velocityY > 0 && player.y + player.height - player.velocityY <= enemy.y + enemy.height/4) {
                // Defeat enemy
                enemy.active = false;
                player.velocityY = player.jumpPower * 0.7; // Bounce
                score += 100;
                updateScoreDisplay();
            } else {
                // Player gets hit
                player.isAlive = false;
            }
        }
    });
}

// Update boss
function updateBoss() {
    if (!boss.active) return;
    
    // Apply gravity
    boss.velocityY += gravity * 0.8;
    
    // Update boss position
    boss.x += boss.velocityX;
    boss.y += boss.velocityY;
    
    // Check for collisions with platforms - ONLY ground platforms in boss area
    platforms.forEach(platform => {
        // Skip non-ground platforms in boss area
        if (boss.x > 7500 && platform.type !== 'ground') {
            return;
        }
        
        if (
            boss.y + boss.height > platform.y + 5 &&
            boss.y < platform.y + platform.height - 5 &&
            boss.x + boss.width - 5 > platform.x &&
            boss.x + 5 < platform.x + platform.width
        ) {
            // Collision from above (landing on platform)
            if (boss.velocityY > 0 && boss.y + boss.height - boss.velocityY <= platform.y) {
                boss.y = platform.y - boss.height;
                boss.velocityY = 0;
                
                // Random jump
                if (Math.random() < 0.02) {
                    boss.velocityY = boss.jumpPower;
                }
            }
        }
    });
    
    // Reverse direction if hitting level boundaries
    if (boss.x < 7600 || boss.x > 8000 - boss.width) {
        boss.velocityX *= -1;
    }
    
    // Handle invulnerability timer
    if (boss.invulnerable) {
        boss.invulnerableTimer--;
        if (boss.invulnerableTimer <= 0) {
            boss.invulnerable = false;
        }
    }
}

// Draw background
function drawBackground() {
    // Draw each layer with parallax effect
    assets.background.layers.forEach(layer => {
        const offsetX = -cameraX * layer.speed;
        ctx.drawImage(layer.img, offsetX % assets.background.width, 0);
        ctx.drawImage(layer.img, offsetX % assets.background.width + assets.background.width, 0);
    });
}

// Draw platforms
function drawPlatforms() {
    platforms.forEach(platform => {
        const screenX = platform.x - cameraX;
        
        // Skip if off-screen
        if (screenX + platform.width < 0 || screenX > canvas.width) return;
        
        // Skip drawing non-ground platforms in boss area
        if (platform.x > 7400 && platform.type !== 'ground') return;
        
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

// Draw obstacles
function drawObstacles() {
    obstacles.forEach(obstacle => {
        const screenX = obstacle.x - cameraX;
        
        // Skip if off-screen
        if (screenX + obstacle.width < 0 || screenX > canvas.width) return;
        
        // Skip obstacles in boss area except for lava
        if (obstacle.x > 7400 && obstacle.type !== 'lava') return;
        
        if (obstacle.type === 'lava') {
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

// Draw level end
function drawLevelEnd() {
    const screenX = levelEnd.x - cameraX;
    
    if (screenX < canvas.width && bossDefeated) {
        // Pole
        ctx.fillStyle = '#888888';
        ctx.fillRect(screenX, 0, 5, levelEnd.height);
        
        // Flag
        ctx.fillStyle = '#FF0000'; // Red flag
        ctx.beginPath();
        ctx.moveTo(screenX + 5, 50);
        ctx.lineTo(screenX + 35, 60);
        ctx.lineTo(screenX + 5, 70);
        ctx.fill();
        
        // Base
        ctx.fillStyle = '#FFD700'; // Gold
        ctx.fillRect(screenX - 20, canvas.height - 80, 45, 40);
    }
}

// Draw player
function drawPlayer() {
    // Skip drawing if player is invulnerable and should blink
    if (player.invulnerable && Math.floor(player.invulnerableTimer / 5) % 2 === 0) {
        return;
    }
    
    const screenX = player.x - cameraX;
    
    // Choose the right sprite based on state
    const playerSprite = assets.vooo.isJumping ? assets.vooo.jumping : assets.vooo.running;
    
    // Flip horizontally if facing left
    ctx.save();
    if (!assets.vooo.facingRight) {
        ctx.translate(screenX + player.width, player.y);
        ctx.scale(-1, 1);
        ctx.drawImage(
            playerSprite,
            0, 0, playerSprite.width, playerSprite.height,
            0, 0, player.width, player.height
        );
    } else {
        ctx.drawImage(
            playerSprite,
            0, 0, playerSprite.width, playerSprite.height,
            screenX, player.y, player.width, player.height
        );
    }
    ctx.restore();
    
    // Draw double jump indicator if available
    if (player.jumping && player.canDoubleJump) {
        // Draw a more visible glow around the player
        ctx.save();
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(screenX + player.width/2, player.y + player.height/2, 
                player.width * 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.restore();
    }
    
    // Debug info - only shown if debugMode is true
    if (debugMode) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`jumping: ${player.jumping}`, screenX, player.y - 30);
        ctx.fillText(`doubleJumping: ${player.doubleJumping}`, screenX, player.y - 15);
        ctx.fillText(`canDoubleJump: ${player.canDoubleJump}`, screenX, player.y);
    }
}

// Draw enemies
function drawEnemies() {
    enemies.forEach(enemy => {
        if (!enemy.active) return;
        
        // Skip enemies in boss area
        if (enemy.x > 7400) return;
        
        const screenX = enemy.x - cameraX;
        
        // Skip if off-screen
        if (screenX + enemy.width < 0 || screenX > canvas.width) return;
        
        // Draw the entire enemy sprite
        try {
            ctx.drawImage(
                assets.strawberry.img,
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

// Draw boss
function drawBoss() {
    if (!boss.active) return;
    
    const screenX = boss.x - cameraX;
    
    // Skip if off-screen
    if (screenX + boss.width < 0 || screenX > canvas.width) return;
    
    // Skip drawing if boss is invulnerable and should blink
    if (boss.invulnerable && Math.floor(boss.invulnerableTimer / 5) % 2 === 0) {
        return;
    }
    
    // Draw the entire boss sprite
    try {
        // Flip horizontally based on direction
        ctx.save();
        if (boss.velocityX < 0) {
            ctx.translate(screenX + boss.width, boss.y);
            ctx.scale(-1, 1);
            ctx.drawImage(
                assets.boss.img,
                0, 0, boss.width, boss.height
            );
        } else {
            ctx.drawImage(
                assets.boss.img,
                screenX, boss.y, boss.width, boss.height
            );
        }
        ctx.restore();
    } catch (e) {
        console.error("Error drawing boss:", e);
        // Fallback to a simple shape if image fails
        ctx.fillStyle = '#FF6600';
        ctx.fillRect(screenX, boss.y, boss.width, boss.height);
    }
}

// Draw boss health bar
function drawBossHealthBar() {
    const barWidth = 200;
    const barHeight = 20;
    const x = canvas.width / 2 - barWidth / 2;
    const y = 50;
    const healthPercentage = (assets.boss.hitsRequired - boss.hits) / assets.boss.hitsRequired;
    
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(x, y, barWidth, barHeight);
    
    // Health
    ctx.fillStyle = boss.invulnerable ? '#FFFF00' : '#FF0000';
    ctx.fillRect(x, y, barWidth * healthPercentage, barHeight);
    
    // Border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, barWidth, barHeight);
    
    // Text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('BOSS', canvas.width / 2, y - 5);
}

// Reset player after death
function resetPlayerAfterDeath() {
    player.isAlive = true;
    player.invulnerable = true;
    player.invulnerableTimer = 60; // Invulnerable for 60 frames
    player.y = 0;
    player.velocityY = 0;
    player.velocityX = 0;
    player.jumping = false;
    player.doubleJumping = false;
    player.canDoubleJump = false;
    
    // Move player back a bit from where they died
    player.x = Math.max(100, player.x - 200);
}

// Show message
function showMessage(text) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Main title - smaller font
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2 - 50);
    
    if (levelSelectionMode) {
        // Level selection instructions
        ctx.font = '18px Arial';
        ctx.fillText('Select a level:', canvas.width / 2, canvas.height / 2 - 10);
        
        // Level 1 button
        ctx.fillStyle = currentLevel === 1 ? '#4CAF50' : '#3498db';
        ctx.fillRect(canvas.width / 2 - 100, canvas.height / 2 + 20, 200, 40);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('Level 1: Beginner', canvas.width / 2, canvas.height / 2 + 45);
        
        // Level 2 button
        ctx.fillStyle = currentLevel === 2 ? '#4CAF50' : '#3498db';
        ctx.fillRect(canvas.width / 2 - 100, canvas.height / 2 + 70, 200, 40);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('Level 2: Lava Challenge', canvas.width / 2, canvas.height / 2 + 95);
        
        // Instructions
        ctx.font = '14px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('Click on a level to start, or press 1-2 on keyboard', canvas.width / 2, canvas.height / 2 + 130);
    } else {
        // Regular game message
        ctx.font = '18px Arial';
        ctx.fillText('Click anywhere to play', canvas.width / 2, canvas.height / 2 + 20);
        
        // Controls info - condensed to one line, smaller font
        ctx.font = '14px Arial';
        ctx.fillText('Controls: WASD/Arrows to move, Space/W/Up to double jump', canvas.width / 2, canvas.height / 2 + 50);
        
        if (bossDefeated) {
            ctx.fillStyle = '#FFFF00';
            ctx.fillText('Boss defeated! Congratulations!', canvas.width / 2, canvas.height / 2 + 80);
            
            if (currentLevel > 1) {
                ctx.fillStyle = '#00FF00';
                ctx.fillText('Next level: ' + Math.round((speedMultiplier - 0.85) * 100 / 0.85) + '% faster', canvas.width / 2, canvas.height / 2 + 100);
            }
        }
        
        // Level-specific info
        if (currentLevel === 2) {
            ctx.fillStyle = '#FF4500';
            ctx.fillText('LEVEL 2: Watch out for LAVA GAPS!', canvas.width / 2, canvas.height / 2 + 120);
        }
    }
}
// Handle mouse clicks for level selection
canvas.addEventListener('click', (e) => {
    if (levelSelectionMode && !gameRunning) {
        // Get mouse position relative to canvas
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Check if clicked on level 1 button
        if (mouseX >= canvas.width / 2 - 100 && 
            mouseX <= canvas.width / 2 + 100 && 
            mouseY >= canvas.height / 2 + 20 && 
            mouseY <= canvas.height / 2 + 60) {
            
            currentLevel = 1;
            levelSelectionMode = false;
            initLevel();
            gameRunning = true;
            gameLoop();
        }
        
        // Check if clicked on level 2 button
        if (mouseX >= canvas.width / 2 - 100 && 
            mouseX <= canvas.width / 2 + 100 && 
            mouseY >= canvas.height / 2 + 70 && 
            mouseY <= canvas.height / 2 + 110) {
            
            currentLevel = 2;
            levelSelectionMode = false;
            initLevel();
            gameRunning = true;
            gameLoop();
        }
    }
});

// Canvas click event for starting game
canvas.addEventListener('click', () => {
    if (!gameRunning && !levelSelectionMode) {
        // Show level selection
        levelSelectionMode = true;
        showMessage("VOOO's Adventure");
    }
});

// Handle mouse clicks for level selection
canvas.addEventListener('click', (e) => {
    if (levelSelectionMode && !gameRunning) {
        // Get mouse position relative to canvas
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Check if clicked on level 1 button
        if (mouseX >= canvas.width / 2 - 100 && 
            mouseX <= canvas.width / 2 + 100 && 
            mouseY >= canvas.height / 2 + 20 && 
            mouseY <= canvas.height / 2 + 60) {
            
            currentLevel = 1;
            levelSelectionMode = false;
            initLevel();
            gameRunning = true;
            gameLoop();
        }
        
        // Check if clicked on level 2 button
        if (mouseX >= canvas.width / 2 - 100 && 
            mouseX <= canvas.width / 2 + 100 && 
            mouseY >= canvas.height / 2 + 70 && 
            mouseY <= canvas.height / 2 + 110) {
            
            currentLevel = 2;
            levelSelectionMode = false;
            initLevel();
            gameRunning = true;
            gameLoop();
        }
    }
});// Keyboard controls
window.addEventListener('keydown', (e) => {
    // Only register key press if it wasn't already pressed (prevents holding key to spam jump)
    if (!keys[e.code]) {
        keys[e.code] = true;
        
        // Check for cheat code (999)
        if (e.code === 'Digit9' || e.code === 'Numpad9') {
            cheatSequence.push('9');
            
            // Keep only the last 3 entries
            if (cheatSequence.length > 3) {
                cheatSequence.shift();
            }
            
            // Check if the sequence is "999"
            if (cheatSequence.length === 3 && 
                cheatSequence[0] === '9' && 
                cheatSequence[1] === '9' && 
                cheatSequence[2] === '9' && 
                !cheatActivated) {
                
                // Activate cheat: 999 lives
                lives = 999;
                updateLivesDisplay();
                cheatActivated = true;
                
                // Show cheat activated message
                const cheatMessage = document.createElement('div');
                cheatMessage.textContent = '🎮 CHEAT ACTIVATED: 999 LIVES! 🎮';
                cheatMessage.style.position = 'absolute';
                cheatMessage.style.top = '100px';
                cheatMessage.style.left = '50%';
                cheatMessage.style.transform = 'translateX(-50%)';
                cheatMessage.style.backgroundColor = 'rgba(255, 215, 0, 0.8)';
                cheatMessage.style.color = '#FF0000';
                cheatMessage.style.padding = '10px 20px';
                cheatMessage.style.borderRadius = '5px';
                cheatMessage.style.fontWeight = 'bold';
                cheatMessage.style.fontSize = '20px';
                cheatMessage.style.zIndex = '1000';
                document.body.appendChild(cheatMessage);
                
                // Remove the message after 3 seconds
                setTimeout(() => {
                    document.body.removeChild(cheatMessage);
                }, 3000);
            }
        } else {
            // Reset cheat sequence if any other key is pressed
            cheatSequence = [];
        }
        
        // Level selection with number keys
        if (levelSelectionMode && !gameRunning) {
            if (e.code === 'Digit1' || e.code === 'Numpad1') {
                currentLevel = 1;
                levelSelectionMode = false;
                initLevel();
                gameRunning = true;
                gameLoop();
            } else if (e.code === 'Digit2' || e.code === 'Numpad2') {
                currentLevel = 2;
                levelSelectionMode = false;
                initLevel();
                gameRunning = true;
                gameLoop();
            }
        }
        
        // Handle jump key press
        if ((e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') && gameRunning) {
            // First jump
            if (!player.jumping) {
                player.velocityY = player.jumpPower;
                player.jumping = true;
                player.canDoubleJump = doubleJumpEnabled;
                assets.vooo.isJumping = true;
            }
            // Double jump
            else if (player.canDoubleJump && !player.doubleJumping) {
                player.velocityY = player.doubleJumpPower;
                player.doubleJumping = true;
                player.canDoubleJump = false;
                
                // Visual effect for double jump
                createDoubleJumpEffect();
            }
        }
    }
    
    // Prevent default for arrow keys and space to avoid page scrolling
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// Initialize game
window.addEventListener('load', () => {
    // Wait for images to load
    let imagesLoaded = 0;
    const totalImages = 4; // running.png, jumping.png, enemies.png, boss.png
    
    function checkAllImagesLoaded() {
        imagesLoaded++;
        if (imagesLoaded === totalImages) {
            initLevel();
            levelSelectionMode = true;
            showMessage("VOOO's Adventure");
        }
    }
    
    loadAssets();
    
    // Add load event listeners to images
    assets.vooo.running.onload = checkAllImagesLoaded;
    assets.vooo.jumping.onload = checkAllImagesLoaded;
    assets.strawberry.img.onload = checkAllImagesLoaded;
    assets.boss.img.onload = checkAllImagesLoaded;
    
    // Handle image loading errors
    assets.vooo.running.onerror = function() {
        console.error("Error loading running.png");
        checkAllImagesLoaded();
    };
    assets.vooo.jumping.onerror = function() {
        console.error("Error loading jumping.png");
        checkAllImagesLoaded();
    };
    assets.strawberry.img.onerror = function() {
        console.error("Error loading enemies.png");
        checkAllImagesLoaded();
    };
    assets.boss.img.onerror = function() {
        console.error("Error loading boss.png");
        checkAllImagesLoaded();
    };
});
// Create double jump effect
function createDoubleJumpEffect() {
    // Create particles for double jump effect
    const particleCount = 15;
    const particles = [];
    
    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 2;
        const size = Math.random() * 5 + 3;
        
        particles.push({
            x: player.x + player.width / 2,
            y: player.y + player.height,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: size,
            color: '#FFFFFF',
            life: 20
        });
    }
    
    // Animate particles
    function animateParticles() {
        if (particles.length === 0) return;
        
        // Update and draw particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            
            // Update position
            p.x += p.vx;
            p.y += p.vy;
            
            // Apply gravity
            p.vy += 0.1;
            
            // Decrease life
            p.life--;
            
            // Remove dead particles
            if (p.life <= 0) {
                particles.splice(i, 1);
                continue;
            }
            
            // Draw particle
            const screenX = p.x - cameraX;
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life / 20;
            ctx.beginPath();
            ctx.arc(screenX, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
        
        // Continue animation if particles remain
        if (particles.length > 0) {
            requestAnimationFrame(animateParticles);
        }
    }
    
    // Start animation
    animateParticles();
}
// Initialize the game when the page loads
window.addEventListener('load', () => {
    // Show level selection immediately
    levelSelectionMode = true;
    showMessage("VOOO's Adventure");
    
    // Load assets
    loadAssets();
});
