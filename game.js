// Game canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');

// Set canvas size to match container
canvas.width = 800;
canvas.height = 500;

// Game state
let gameRunning = false;
let score = 0;
let lives = 3;
let gravity = 0.46; // Adjusted gravity (15% faster than 0.4)
let keys = {};
let cameraX = 0;
let bossHits = 0;
let bossDefeated = false;

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
        speed: 3.45, // 15% faster than 3
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
    velocityX: 0,
    velocityY: 0,
    jumpPower: -11.5, // 15% faster than -10
    isAlive: true,
    invulnerable: false,
    invulnerableTimer: 0,
    moveSpeed: 3.45 // 15% faster than 3
};

// Boss object
const boss = {
    x: 7800,
    y: 0,
    width: assets.boss.width,
    height: assets.boss.height,
    velocityX: 1.725, // 15% faster than 1.5
    velocityY: 0,
    active: true,
    hits: 0,
    invulnerable: false,
    invulnerableTimer: 0,
    jumpPower: -6.9 // 15% faster than -6
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
    lives = 3;
    cameraX = 0;
    bossHits = 0;
    bossDefeated = false;
    
    // Reset player
    player.x = 100;
    player.y = 0;
    player.velocityX = 0;
    player.velocityY = 0;
    player.jumping = false;
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
    
    // Create ground platform
    platforms = [
        { x: 0, y: canvas.height - 40, width: 8000, height: 40, type: 'ground' }
    ];
    
    // Add platforms - more of them and more varied
    for (let i = 0; i < 40; i++) {
        const platformWidth = Math.random() * 200 + 100;
        const platformX = 500 + i * 200 + Math.random() * 100;
        const platformY = canvas.height - 40 - (Math.random() * 250 + 50);
        
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
            
            platforms.push({
                x: smallPlatformX,
                y: smallPlatformY,
                width: smallPlatformWidth,
                height: 20,
                type: 'platform'
            });
        }
    }
    
    // Add a special platform for the boss battle
    platforms.push({
        x: 7700,
        y: canvas.height - 40 - 150,
        width: 400,
        height: 20,
        type: 'platform'
    });
    
    // Add obstacles
    obstacles = [];
    for (let i = 0; i < 25; i++) {
        const obstacleWidth = Math.random() * 60 + 40;
        const obstacleHeight = Math.random() * 80 + 40;
        const obstacleX = 800 + i * 300 + Math.random() * 200;
        const obstacleY = canvas.height - 40 - obstacleHeight;
        
        // Don't place obstacles in the boss area
        if (obstacleX < 7500) {
            obstacles.push({
                x: obstacleX,
                y: obstacleY,
                width: obstacleWidth,
                height: obstacleHeight
            });
        }
    }
    
    // Add enemies - more of them
    enemies = [];
    for (let i = 0; i < 30; i++) {
        const enemyX = 600 + i * 250 + Math.random() * 100;
        // Position enemies on top of the ground, not buried in it
        const enemyY = canvas.height - 40 - assets.strawberry.height;
        
        // Don't place enemies in the boss area
        if (enemyX < 7500) {
            enemies.push({
                x: enemyX,
                y: enemyY,
                width: assets.strawberry.width,
                height: assets.strawberry.height,
                velocityX: Math.random() > 0.5 ? -1.5 : 1.5, // Random direction
                active: true
            });
        }
    }
    
    // Add some enemies on platforms
    platforms.forEach((platform, index) => {
        if (index > 0 && platform.width > 80 && Math.random() > 0.4 && platform.x < 7500) {
            enemies.push({
                x: platform.x + platform.width/2,
                // Position enemies on top of platforms, not buried in them
                y: platform.y - assets.strawberry.height,
                width: assets.strawberry.width,
                height: assets.strawberry.height,
                velocityX: Math.random() > 0.5 ? -1.5 : 1.5, // Move left or right
                platformIndex: index,
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
    scoreElement.textContent = `Score: ${score}`;
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
        showMessage("Level Complete! Score: " + score);
    }
    
    // Check if player is alive
    if (!player.isAlive) {
        lives--;
        updateLivesDisplay();
        
        if (lives <= 0) {
            gameRunning = false;
            showMessage("Game Over! Final Score: " + score);
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
    
    if ((keys['KeyW'] || keys['ArrowUp'] || keys['Space']) && !player.jumping) {
        player.velocityY = player.jumpPower;
        player.jumping = true;
        assets.vooo.isJumping = true;
    }
    
    // Apply gravity
    player.velocityY += gravity;
    
    // Update player position
    player.x += player.velocityX;
    player.y += player.velocityY;
    
    // Keep player within level bounds
    if (player.x < 0) {
        player.x = 0;
    }
    
    // Check for collisions with platforms
    let onGround = false;
    platforms.forEach(platform => {
        if (
            player.y + player.height > platform.y &&
            player.y < platform.y + platform.height &&
            player.x + player.width > platform.x &&
            player.x < platform.x + platform.width
        ) {
            // Collision from above (landing on platform)
            if (player.velocityY > 0 && player.y + player.height - player.velocityY <= platform.y) {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.jumping = false;
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
            player.y + player.height > obstacle.y &&
            player.y < obstacle.y + obstacle.height &&
            player.x + player.width > obstacle.x &&
            player.x < obstacle.x + obstacle.width
        ) {
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
        player.x < boss.x + boss.width &&
        player.x + player.width > boss.x &&
        player.y < boss.y + boss.height &&
        player.y + player.height > boss.y
    ) {
        // Check if player is jumping on boss from above
        if (player.velocityY > 0 && player.y + player.height - player.velocityY <= boss.y + boss.height/4) {
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
    
    // Check for collisions with platforms
    platforms.forEach(platform => {
        if (
            boss.y + boss.height > platform.y &&
            boss.y < platform.y + platform.height &&
            boss.x + boss.width > platform.x &&
            boss.x < platform.x + platform.width
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
        
        // Draw obstacle with tiles
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
}

// Draw enemies
function drawEnemies() {
    enemies.forEach(enemy => {
        if (!enemy.active) return;
        
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
    
    // Move player back a bit from where they died
    player.x = Math.max(100, player.x - 200);
}

// Show message
function showMessage(text) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    
    ctx.font = '20px Arial';
    ctx.fillText('Press Start to play again', canvas.width / 2, canvas.height / 2 + 40);
    
    // Add controls info
    ctx.font = '16px Arial';
    ctx.fillText('Controls: WASD or Arrow Keys to move, Space to jump', canvas.width / 2, canvas.height / 2 + 80);
    
    if (bossDefeated) {
        ctx.fillStyle = '#FFFF00';
        ctx.fillText('You defeated the Boss! Congratulations!', canvas.width / 2, canvas.height / 2 + 120);
    }
}

// Event listeners
startButton.addEventListener('click', () => {
    if (!gameRunning) {
        initLevel();
        gameRunning = true;
        gameLoop();
    }
});

// Keyboard controls
window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    
    if ((e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') && gameRunning && !player.jumping) {
        player.velocityY = player.jumpPower;
        player.jumping = true;
        assets.vooo.isJumping = true;
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
            showMessage("VOOO's Adventure! Press Start to play\nUse WASD or Arrow Keys to move\nDefeat the Boss at the end by jumping on its head 5 times!");
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
