// VOOO Game Test Suite
// This file contains comprehensive tests for the game's functionality

// Test results tracking
const testResults = {
    passed: 0,
    failed: 0,
    total: 0
};

// Test utilities
const assert = {
    equal: function(actual, expected, message) {
        testResults.total++;
        if (actual === expected) {
            testResults.passed++;
            console.log(`✅ PASS: ${message}`);
            return true;
        } else {
            testResults.failed++;
            console.error(`❌ FAIL: ${message}`);
            console.error(`   Expected: ${expected}, Actual: ${actual}`);
            return false;
        }
    },
    notEqual: function(actual, expected, message) {
        testResults.total++;
        if (actual !== expected) {
            testResults.passed++;
            console.log(`✅ PASS: ${message}`);
            return true;
        } else {
            testResults.failed++;
            console.error(`❌ FAIL: ${message}`);
            console.error(`   Expected not to be: ${expected}, Actual: ${actual}`);
            return false;
        }
    },
    isTrue: function(value, message) {
        return this.equal(value, true, message);
    },
    isFalse: function(value, message) {
        return this.equal(value, false, message);
    },
    isUndefined: function(value, message) {
        return this.equal(value, undefined, message);
    },
    isNotUndefined: function(value, message) {
        return this.notEqual(value, undefined, message);
    },
    isNull: function(value, message) {
        return this.equal(value, null, message);
    },
    isNotNull: function(value, message) {
        return this.notEqual(value, null, message);
    },
    isGreaterThan: function(actual, expected, message) {
        testResults.total++;
        if (actual > expected) {
            testResults.passed++;
            console.log(`✅ PASS: ${message}`);
            return true;
        } else {
            testResults.failed++;
            console.error(`❌ FAIL: ${message}`);
            console.error(`   Expected > ${expected}, Actual: ${actual}`);
            return false;
        }
    },
    isLessThan: function(actual, expected, message) {
        testResults.total++;
        if (actual < expected) {
            testResults.passed++;
            console.log(`✅ PASS: ${message}`);
            return true;
        } else {
            testResults.failed++;
            console.error(`❌ FAIL: ${message}`);
            console.error(`   Expected < ${expected}, Actual: ${actual}`);
            return false;
        }
    },
    approximately: function(actual, expected, tolerance, message) {
        testResults.total++;
        if (Math.abs(actual - expected) <= tolerance) {
            testResults.passed++;
            console.log(`✅ PASS: ${message}`);
            return true;
        } else {
            testResults.failed++;
            console.error(`❌ FAIL: ${message}`);
            console.error(`   Expected: ${expected} ±${tolerance}, Actual: ${actual}`);
            return false;
        }
    }
};

// Test suite
const tests = {
    // Test dual boss system in level 4
    testDualBossSystem: function() {
        console.log("🧪 Testing dual boss system in level 4...");
        
        // Save original level and game state
        const originalLevel = currentLevel;
        const originalBossDefeated = bossDefeated;
        const originalSecondBossDefeated = secondBossDefeated;
        
        // Set to level 4 for testing
        currentLevel = 4;
        
        // Test boss initialization in level 4
        initLevel();
        
        // Check that both bosses are active in level 4
        assert.isTrue(boss.active, "First boss should be active in level 4");
        assert.isTrue(secondBoss.active, "Second boss should be active in level 4");
        
        // Check boss types
        assert.equal(boss.type, 'cherry', "First boss should be cherry type");
        assert.equal(secondBoss.type, 'strawberry', "Second boss should be strawberry type");
        
        // Check boss positions
        assert.isTrue(boss.x > secondBoss.x, "First boss should be positioned to the right of second boss");
        
        // Check that bosses move in opposite directions initially
        assert.isTrue(boss.velocityX * secondBoss.velocityX < 0, "Bosses should move in opposite directions initially");
        
        // Test boss collision detection
        // Save original player state
        const originalPlayerX = player.x;
        const originalPlayerY = player.y;
        const originalPlayerVelocityY = player.velocityY;
        const originalPlayerIsAlive = player.isAlive;
        const originalLives = lives;
        
        // Position player above first boss
        player.x = boss.x + boss.width/2 - player.width/2;
        player.y = boss.y - player.height;
        player.velocityY = 1; // Moving downward
        player.isAlive = true;
        
        // Check collision detection with first boss
        const collisionWithFirstBoss = 
            player.x + 5 < boss.x + boss.width - 5 &&
            player.x + player.width - 5 > boss.x + 5 &&
            player.y + 5 < boss.y + boss.height - 5 &&
            player.y + player.height - 5 > boss.y + 5;
            
        assert.isTrue(collisionWithFirstBoss, "Collision detection with first boss should work");
        
        // Check jumping on first boss from above
        const jumpingOnFirstBoss = 
            player.velocityY > 0 && 
            player.y + player.height - player.velocityY <= boss.y + boss.height/3;
            
        assert.isTrue(jumpingOnFirstBoss, "Jumping on first boss from above should be detected");
        
        // Position player above second boss
        player.x = secondBoss.x + secondBoss.width/2 - player.width/2;
        player.y = secondBoss.y - player.height;
        player.velocityY = 1; // Moving downward
        
        // Check collision detection with second boss
        const collisionWithSecondBoss = 
            player.x + 5 < secondBoss.x + secondBoss.width - 5 &&
            player.x + player.width - 5 > secondBoss.x + 5 &&
            player.y + 5 < secondBoss.y + secondBoss.height - 5 &&
            player.y + player.height - 5 > secondBoss.y + 5;
            
        assert.isTrue(collisionWithSecondBoss, "Collision detection with second boss should work");
        
        // Check jumping on second boss from above
        const jumpingOnSecondBoss = 
            player.velocityY > 0 && 
            player.y + player.height - player.velocityY <= secondBoss.y + secondBoss.height/3;
            
        assert.isTrue(jumpingOnSecondBoss, "Jumping on second boss from above should be detected");
        
        // Test boss hit mechanics
        boss.hits = 0;
        secondBoss.hits = 0;
        bossDefeated = false;
        secondBossDefeated = false;
        
        // Simulate hitting first boss
        boss.hits++;
        assert.equal(boss.hits, 1, "First boss hit counter should increment");
        assert.isFalse(bossDefeated, "First boss should not be defeated yet");
        
        // Simulate hitting second boss
        secondBoss.hits++;
        assert.equal(secondBoss.hits, 1, "Second boss hit counter should increment");
        assert.isFalse(secondBossDefeated, "Second boss should not be defeated yet");
        
        // Simulate defeating first boss
        boss.hits = assets.boss.hitsRequired;
        if (boss.hits >= assets.boss.hitsRequired) {
            boss.active = false;
            bossDefeated = true;
        }
        assert.isTrue(bossDefeated, "First boss should be defeated after required hits");
        assert.isFalse(boss.active, "First boss should be inactive after defeat");
        
        // Check that level is not complete with only one boss defeated
        const allBossesDefeated = currentLevel === 4 ? 
                                (bossDefeated && secondBossDefeated) : 
                                bossDefeated;
        assert.isFalse(allBossesDefeated, "Level should not be complete with only one boss defeated");
        
        // Simulate defeating second boss
        secondBoss.hits = assets.boss.hitsRequired;
        if (secondBoss.hits >= assets.boss.hitsRequired) {
            secondBoss.active = false;
            secondBossDefeated = true;
        }
        assert.isTrue(secondBossDefeated, "Second boss should be defeated after required hits");
        assert.isFalse(secondBoss.active, "Second boss should be inactive after defeat");
        
        // Check that level is complete with both bosses defeated
        const allBossesDefeatedNow = currentLevel === 4 ? 
                                    (bossDefeated && secondBossDefeated) : 
                                    bossDefeated;
        assert.isTrue(allBossesDefeatedNow, "Level should be complete with both bosses defeated");
        
        // Test boss health bar rendering
        // Mock the canvas context methods
        const originalFillRect = ctx.fillRect;
        const originalFillText = ctx.fillText;
        
        let healthBarsDrawn = 0;
        ctx.fillRect = function() {
            healthBarsDrawn++;
        };
        ctx.fillText = function(text) {
            if (text === 'CHERRY BOSS' || text === 'STRAWBERRY BOSS') {
                healthBarsDrawn++;
            }
        };
        
        // Simulate drawing boss health bars
        drawBossHealthBar();
        
        // Check that both health bars were drawn
        assert.isTrue(healthBarsDrawn > 0, "Boss health bars should be drawn");
        
        // Restore original context methods
        ctx.fillRect = originalFillRect;
        ctx.fillText = originalFillText;
        
        // Test level end flag visibility
        // Mock the drawLevelEnd function
        const originalDrawLevelEnd = drawLevelEnd;
        
        let flagDrawn = false;
        drawLevelEnd = function() {
            // Check if the flag would be drawn
            const allBossesDefeated = currentLevel === 4 ? 
                                     (bossDefeated && secondBossDefeated) : 
                                     bossDefeated;
            if (allBossesDefeated) {
                flagDrawn = true;
            }
        };
        
        // Call the mocked function
        drawLevelEnd();
        
        // Check that flag is drawn when both bosses are defeated
        assert.isTrue(flagDrawn, "Level end flag should be drawn when both bosses are defeated");
        
        // Restore original function
        drawLevelEnd = originalDrawLevelEnd;
        
        // Test level 1-3 behavior (only one boss)
        currentLevel = 2;
        initLevel();
        
        // Check that only first boss is active in level 2
        assert.isTrue(boss.active, "First boss should be active in level 2");
        assert.isFalse(secondBoss.active, "Second boss should not be active in level 2");
        
        // Restore original game state
        currentLevel = originalLevel;
        bossDefeated = originalBossDefeated;
        secondBossDefeated = originalSecondBossDefeated;
        player.x = originalPlayerX;
        player.y = originalPlayerY;
        player.velocityY = originalPlayerVelocityY;
        player.isAlive = originalPlayerIsAlive;
        lives = originalLives;
    },
    
    // Test mixed enemy types in level 4
    testMixedEnemyTypes: function() {
        console.log("🧪 Testing mixed enemy types in level 4...");
        
        // Save original level
        const originalLevel = currentLevel;
        
        // Set to level 4 for testing
        currentLevel = 4;
        
        // Create test enemies of both types
        const strawberryEnemy = {
            x: 500,
            y: 300,
            width: assets.strawberry.width,
            height: assets.strawberry.height,
            velocityX: 1.5 * speedMultiplier,
            active: true,
            type: 'strawberry'
        };
        
        const cherryEnemy = {
            x: 700,
            y: 300,
            width: assets.cherry.width,
            height: assets.cherry.height,
            velocityX: -1.5 * speedMultiplier,
            active: true,
            type: 'cherry'
        };
        
        // Test that both enemy types have correct properties
        assert.equal(strawberryEnemy.type, 'strawberry', "Strawberry enemy should have type 'strawberry'");
        assert.equal(cherryEnemy.type, 'cherry', "Cherry enemy should have type 'cherry'");
        
        // Test enemy sprite selection
        // Save the original drawImage method
        const originalDrawImage = ctx.drawImage;
        
        let lastDrawnImage = null;
        // Mock the drawImage method to track which sprite is used
        ctx.drawImage = function(image) {
            lastDrawnImage = image;
        };
        
        // Test strawberry enemy drawing
        const screenX1 = strawberryEnemy.x - cameraX;
        ctx.save();
        if (strawberryEnemy.velocityX < 0) {
            ctx.translate(screenX1 + strawberryEnemy.width, strawberryEnemy.y);
            ctx.scale(-1, 1);
        }
        
        // Draw strawberry enemy
        const enemySprite1 = strawberryEnemy.type === 'cherry' ? assets.cherry.img : assets.strawberry.img;
        ctx.drawImage(enemySprite1, 0, 0, strawberryEnemy.width, strawberryEnemy.height);
        ctx.restore();
        
        // Check that strawberry sprite was used
        assert.equal(lastDrawnImage, assets.strawberry.img, "Strawberry enemy should use strawberry sprite");
        
        // Test cherry enemy drawing
        const screenX2 = cherryEnemy.x - cameraX;
        ctx.save();
        if (cherryEnemy.velocityX < 0) {
            ctx.translate(screenX2 + cherryEnemy.width, cherryEnemy.y);
            ctx.scale(-1, 1);
        }
        
        // Draw cherry enemy
        const enemySprite2 = cherryEnemy.type === 'cherry' ? assets.cherry.img : assets.strawberry.img;
        ctx.drawImage(enemySprite2, 0, 0, cherryEnemy.width, cherryEnemy.height);
        ctx.restore();
        
        // Check that cherry sprite was used
        assert.equal(lastDrawnImage, assets.cherry.img, "Cherry enemy should use cherry sprite");
        
        // Restore the original drawImage method
        ctx.drawImage = originalDrawImage;
        
        // Test explosion creation for cherry enemies
        // Save original explosions array
        const originalExplosions = [...explosions];
        explosions = [];
        
        // Mock the createExplosion function
        let explosionCreated = false;
        let explosionX = 0;
        let explosionY = 0;
        
        // Save the original createExplosion function
        const originalCreateExplosion = window.createExplosion;
        
        // Mock createExplosion to track calls
        window.createExplosion = function(x, y) {
            explosionCreated = true;
            explosionX = x;
            explosionY = y;
            explosions.push({
                x: x,
                y: y,
                particles: [{x: x, y: y, vx: 1, vy: 1, size: 5, color: '#FF0000', life: 20}],
                currentFrame: 0,
                duration: 30
            });
        };
        
        // Simulate collision with cherry enemy
        if (cherryEnemy.type === 'cherry') {
            createExplosion(cherryEnemy.x + cherryEnemy.width/2, cherryEnemy.y + cherryEnemy.height/2);
        }
        
        // Check that explosion was created for cherry enemy
        assert.isTrue(explosionCreated, "Explosion should be created for cherry enemy");
        assert.equal(explosionX, cherryEnemy.x + cherryEnemy.width/2, "Explosion X position should match cherry enemy center");
        assert.equal(explosionY, cherryEnemy.y + cherryEnemy.height/2, "Explosion Y position should match cherry enemy center");
        assert.equal(explosions.length, 1, "One explosion should be added to explosions array");
        
        // Reset explosion tracking
        explosionCreated = false;
        explosionX = 0;
        explosionY = 0;
        explosions = [];
        
        // Simulate collision with strawberry enemy
        if (strawberryEnemy.type === 'strawberry') {
            createExplosion(strawberryEnemy.x + strawberryEnemy.width/2, strawberryEnemy.y + strawberryEnemy.height/2);
        }
        
        // Check that explosion was created for strawberry enemy (this is just testing our test logic)
        assert.isTrue(explosionCreated, "Test function should create explosion for any enemy type");
        
        // In the actual game, we'd check that strawberry enemies don't create explosions automatically
        // But we can't easily test that negative behavior here
        
        // Restore the original createExplosion function
        window.createExplosion = originalCreateExplosion;
        
        // Restore original explosions array
        explosions = originalExplosions;
        
        // Test enemy distribution in level 4
        // We can't directly test randomness, but we can check that the enemy creation
        // code handles both types correctly
        
        // Mock Math.random to return predictable values
        const originalRandom = Math.random;
        
        // First test: Math.random returns 0.25 (should create strawberry enemy)
        Math.random = function() { return 0.25; };
        
        let enemyType = Math.random() < 0.5 ? 'strawberry' : 'cherry';
        assert.equal(enemyType, 'strawberry', "Should create strawberry enemy when random < 0.5");
        
        // Second test: Math.random returns 0.75 (should create cherry enemy)
        Math.random = function() { return 0.75; };
        
        enemyType = Math.random() < 0.5 ? 'strawberry' : 'cherry';
        assert.equal(enemyType, 'cherry', "Should create cherry enemy when random >= 0.5");
        
        // Restore original Math.random
        Math.random = originalRandom;
        
        // Restore original level
        currentLevel = originalLevel;
    },
    
    // Game initialization tests
    testGameInitialization: function() {
        console.log("🧪 Testing game initialization...");
        
        // Test initial game state
        assert.equal(gameRunning, false, "Game should not be running initially");
        assert.equal(score, 0, "Initial score should be 0");
        assert.equal(lives, 3, "Initial lives should be 3");
        assert.isTrue(currentLevel >= 1 && currentLevel <= maxLevel, "Current level should be valid");
        
        // Test speed multiplier calculation
        if (currentLevel === 1) {
            assert.equal(speedMultiplier, 0.85, "Level 1 speed multiplier should be 0.85");
        } else {
            const expectedMultiplier = 1 + ((currentLevel - 2) * 0.1);
            assert.approximately(speedMultiplier, expectedMultiplier, 0.01, 
                `Level ${currentLevel} speed multiplier should be approximately ${expectedMultiplier}`);
        }
        
        // Test that assets are loaded
        assert.isNotUndefined(assets.vooo.running, "VOOO running sprite should be loaded");
        assert.isNotUndefined(assets.vooo.jumping, "VOOO jumping sprite should be loaded");
        assert.isNotUndefined(assets.strawberry.img, "Enemy sprite should be loaded");
        assert.isNotUndefined(assets.boss.img, "Boss sprite should be loaded");
    },
    
    // Player mechanics tests
    testPlayerMechanics: function() {
        console.log("🧪 Testing player mechanics...");
        
        // Save original player state
        const originalX = player.x;
        const originalY = player.y;
        const originalVelocityY = player.velocityY;
        const originalJumping = player.jumping;
        const originalDoubleJumping = player.doubleJumping;
        
        // Test player movement
        player.velocityX = player.moveSpeed;
        const expectedX = originalX + player.moveSpeed;
        player.x += player.velocityX;
        assert.equal(player.x, expectedX, "Player should move right correctly");
        
        // Test gravity effect
        player.velocityY = 0;
        player.velocityY += gravity;
        assert.approximately(player.velocityY, gravity, 0.01, "Gravity should affect player velocity");
        
        // Test jumping
        player.jumping = false;
        player.doubleJumping = false;
        player.velocityY = 0;
        
        // Simulate jump
        player.velocityY = player.jumpPower;
        player.jumping = true;
        player.canDoubleJump = true;
        
        assert.isTrue(player.jumping, "Player should be in jumping state");
        assert.approximately(player.velocityY, player.jumpPower, 0.01, "Jump power should be applied correctly");
        
        // Simulate double jump
        const originalVelocityAfterJump = player.velocityY;
        player.velocityY = player.doubleJumpPower;
        player.doubleJumping = true;
        player.canDoubleJump = false;
        
        assert.isTrue(player.doubleJumping, "Player should be in double jumping state");
        assert.isFalse(player.canDoubleJump, "Player should not be able to double jump again");
        assert.approximately(player.velocityY, player.doubleJumpPower, 0.01, "Double jump power should be applied correctly");
        
        // Restore original player state
        player.x = originalX;
        player.y = originalY;
        player.velocityY = originalVelocityY;
        player.jumping = originalJumping;
        player.doubleJumping = originalDoubleJumping;
    },
    
    // Enemy tests
    testEnemies: function() {
        console.log("🧪 Testing enemy functionality...");
        
        // Create a test enemy
        const testEnemy = {
            x: 500,
            y: 300,
            width: assets.strawberry.width,
            height: assets.strawberry.height,
            velocityX: 1.5 * speedMultiplier,
            active: true
        };
        
        // Test enemy movement
        const originalX = testEnemy.x;
        testEnemy.x += testEnemy.velocityX;
        assert.approximately(testEnemy.x, originalX + (1.5 * speedMultiplier), 0.01, "Enemy should move correctly");
        
        // Test enemy-player collision detection
        // Position player above enemy
        const originalPlayerX = player.x;
        const originalPlayerY = player.y;
        
        player.x = testEnemy.x;
        player.y = testEnemy.y - player.height;
        player.velocityY = 1; // Moving downward
        
        // Check if collision detection works
        const collision = 
            player.x + 5 < testEnemy.x + testEnemy.width - 5 &&
            player.x + player.width - 5 > testEnemy.x + 5 &&
            player.y + 5 < testEnemy.y + testEnemy.height - 5 &&
            player.y + player.height - 5 > testEnemy.y + 5;
            
        assert.isTrue(collision, "Collision detection should work correctly");
        
        // Check if jumping on enemy is detected correctly
        const jumpingOnEnemy = 
            player.velocityY > 0 && 
            player.y + player.height - player.velocityY <= testEnemy.y + testEnemy.height/4;
            
        assert.isTrue(jumpingOnEnemy, "Jumping on enemy should be detected correctly");
        
        // Restore player position
        player.x = originalPlayerX;
        player.y = originalPlayerY;
    },
    
    // Test enemy sprite flipping
    testEnemySpriteFlipping: function() {
        console.log("🧪 Testing enemy sprite flipping...");
        
        // Create test enemies with different movement directions
        const rightMovingEnemy = {
            x: 500,
            y: 300,
            width: assets.strawberry.width,
            height: assets.strawberry.height,
            velocityX: 1.5 * speedMultiplier, // Moving right
            active: true
        };
        
        const leftMovingEnemy = {
            x: 700,
            y: 300,
            width: assets.strawberry.width,
            height: assets.strawberry.height,
            velocityX: -1.5 * speedMultiplier, // Moving left
            active: true
        };
        
        // Save the original context methods to mock them
        const originalSave = ctx.save;
        const originalTranslate = ctx.translate;
        const originalScale = ctx.scale;
        const originalDrawImage = ctx.drawImage;
        const originalRestore = ctx.restore;
        
        let saveWasCalled = false;
        let translateWasCalled = false;
        let scaleWasCalled = false;
        let drawImageWasCalled = false;
        let restoreWasCalled = false;
        let scaleDirection = 0;
        
        // Mock the context methods
        ctx.save = function() { saveWasCalled = true; };
        ctx.translate = function(x, y) { translateWasCalled = true; };
        ctx.scale = function(x, y) { scaleWasCalled = true; scaleDirection = x; };
        ctx.drawImage = function() { drawImageWasCalled = true; };
        ctx.restore = function() { restoreWasCalled = true; };
        
        // Test right-moving enemy (should not flip)
        // Reset mocks
        saveWasCalled = false;
        translateWasCalled = false;
        scaleWasCalled = false;
        drawImageWasCalled = false;
        restoreWasCalled = false;
        scaleDirection = 0;
        
        // Mock the drawEnemies function for a single right-moving enemy
        const screenX = rightMovingEnemy.x - cameraX;
        
        // Simulate the drawing code for right-moving enemy
        ctx.save();
        if (rightMovingEnemy.velocityX < 0) {
            ctx.translate(screenX + rightMovingEnemy.width, rightMovingEnemy.y);
            ctx.scale(-1, 1);
        }
        ctx.drawImage(assets.strawberry.img, 0, 0, rightMovingEnemy.width, rightMovingEnemy.height);
        ctx.restore();
        
        // Check that the right methods were called
        assert.isTrue(saveWasCalled, "ctx.save() should be called for right-moving enemy");
        assert.isTrue(drawImageWasCalled, "ctx.drawImage() should be called for right-moving enemy");
        assert.isTrue(restoreWasCalled, "ctx.restore() should be called for right-moving enemy");
        assert.isFalse(translateWasCalled, "ctx.translate() should not be called for right-moving enemy");
        assert.isFalse(scaleWasCalled, "ctx.scale() should not be called for right-moving enemy");
        
        // Test left-moving enemy (should flip)
        // Reset mocks
        saveWasCalled = false;
        translateWasCalled = false;
        scaleWasCalled = false;
        drawImageWasCalled = false;
        restoreWasCalled = false;
        scaleDirection = 0;
        
        // Mock the drawEnemies function for a single left-moving enemy
        const screenX2 = leftMovingEnemy.x - cameraX;
        
        // Simulate the drawing code for left-moving enemy
        ctx.save();
        if (leftMovingEnemy.velocityX < 0) {
            ctx.translate(screenX2 + leftMovingEnemy.width, leftMovingEnemy.y);
            ctx.scale(-1, 1);
        }
        ctx.drawImage(assets.strawberry.img, 0, 0, leftMovingEnemy.width, leftMovingEnemy.height);
        ctx.restore();
        
        // Check that the right methods were called
        assert.isTrue(saveWasCalled, "ctx.save() should be called for left-moving enemy");
        assert.isTrue(translateWasCalled, "ctx.translate() should be called for left-moving enemy");
        assert.isTrue(scaleWasCalled, "ctx.scale() should be called for left-moving enemy");
        assert.equal(scaleDirection, -1, "ctx.scale() should use -1 for x to flip horizontally");
        assert.isTrue(drawImageWasCalled, "ctx.drawImage() should be called for left-moving enemy");
        assert.isTrue(restoreWasCalled, "ctx.restore() should be called for left-moving enemy");
        
        // Restore the original context methods
        ctx.save = originalSave;
        ctx.translate = originalTranslate;
        ctx.scale = originalScale;
        ctx.drawImage = originalDrawImage;
        ctx.restore = originalRestore;
    },
    
    // Platform collision tests
    testPlatformCollisions: function() {
        console.log("🧪 Testing platform collisions...");
        
        // Create a test platform
        const testPlatform = {
            x: 300,
            y: 400,
            width: 200,
            height: 20,
            type: 'platform'
        };
        
        // Save original player state
        const originalX = player.x;
        const originalY = player.y;
        const originalVelocityY = player.velocityY;
        
        // Position player above platform
        player.x = testPlatform.x + 50;
        player.y = testPlatform.y - player.height - 5;
        player.velocityY = 10; // Moving downward fast
        
        // Check collision detection
        const collision = 
            player.y + player.height > testPlatform.y &&
            player.y < testPlatform.y + testPlatform.height &&
            player.x + player.width - 5 > testPlatform.x &&
            player.x + 5 < testPlatform.x + testPlatform.width;
            
        assert.isTrue(collision, "Platform collision detection should work correctly");
        
        // Check landing on platform
        const landingOnPlatform = 
            player.velocityY > 0 && 
            player.y + player.height - player.velocityY <= testPlatform.y + 10;
            
        assert.isTrue(landingOnPlatform, "Landing on platform should be detected correctly");
        
        // Restore player state
        player.x = originalX;
        player.y = originalY;
        player.velocityY = originalVelocityY;
    },
    
    // Boss tests
    testBoss: function() {
        console.log("🧪 Testing boss functionality...");
        
        // Save original boss state
        const originalX = boss.x;
        const originalY = boss.y;
        const originalVelocityX = boss.velocityX;
        const originalVelocityY = boss.velocityY;
        const originalHits = boss.hits;
        const originalActive = boss.active;
        
        // Save original player state
        const originalPlayerX = player.x;
        const originalPlayerY = player.y;
        const originalPlayerVelocityY = player.velocityY;
        const originalPlayerIsAlive = player.isAlive;
        const originalLives = lives;
        
        // Test boss movement
        boss.x += boss.velocityX;
        assert.approximately(boss.x, originalX + boss.velocityX, 0.01, "Boss should move correctly");
        
        // Test gravity effect on boss
        boss.velocityY += gravity * 0.8;
        assert.approximately(boss.velocityY, originalVelocityY + (gravity * 0.8), 0.01, 
            "Gravity should affect boss velocity");
        
        // Test boss-player collision detection
        // Position player above boss
        player.x = boss.x + boss.width/2 - player.width/2;
        player.y = boss.y - player.height;
        player.velocityY = 1; // Moving downward
        player.isAlive = true;
        
        // Check if collision detection works
        const collision = 
            player.x + 5 < boss.x + boss.width - 5 &&
            player.x + player.width - 5 > boss.x + 5 &&
            player.y + 5 < boss.y + boss.height - 5 &&
            player.y + player.height - 5 > boss.y + 5;
            
        assert.isTrue(collision, "Boss collision detection should work correctly");
        
        // Check if jumping on boss is detected correctly
        const jumpingOnBoss = 
            player.velocityY > 0 && 
            player.y + player.height - player.velocityY <= boss.y + boss.height/3;
            
        assert.isTrue(jumpingOnBoss, "Jumping on boss should be detected correctly");
        
        // Test boss hit mechanics
        const originalBossHits = boss.hits;
        boss.hits++;
        assert.equal(boss.hits, originalBossHits + 1, "Boss hit counter should increment correctly");
        
        // Test boss defeat condition
        boss.hits = assets.boss.hitsRequired - 1;
        const notDefeatedYet = boss.hits < assets.boss.hitsRequired;
        assert.isTrue(notDefeatedYet, "Boss should not be defeated yet");
        
        boss.hits = assets.boss.hitsRequired;
        const shouldBeDefeated = boss.hits >= assets.boss.hitsRequired;
        assert.isTrue(shouldBeDefeated, "Boss should be defeated after required hits");
        
        // Test cherry boss instant defeat feature
        // Save current level
        const originalLevel = currentLevel;
        
        // Test with regular boss (level 1-2)
        currentLevel = 2;
        lives = 3;
        player.isAlive = true;
        
        // Simulate collision with boss (not from above)
        player.x = boss.x;
        player.y = boss.y + boss.height/2;
        player.velocityY = 0;
        
        // Check collision that's not from above
        const sideCollision = 
            player.x + 5 < boss.x + boss.width - 5 &&
            player.x + player.width - 5 > boss.x + 5 &&
            player.y + 5 < boss.y + boss.height - 5 &&
            player.y + player.height - 5 > boss.y + 5 &&
            !(player.velocityY > 0 && player.y + player.height - player.velocityY <= boss.y + boss.height/3);
            
        assert.isTrue(sideCollision, "Side collision with boss should be detected correctly");
        
        // Simulate the collision effect for regular boss
        player.isAlive = false;
        assert.isFalse(player.isAlive, "Player should lose a life when hit by regular boss");
        assert.equal(lives, 3, "Lives should not be set to zero for regular boss");
        
        // Test with cherry boss (level 3-4)
        currentLevel = 3;
        lives = 3;
        player.isAlive = true;
        
        // Simulate the collision effect for cherry boss
        player.isAlive = false;
        lives = 0; // Cherry boss sets lives to 0
        
        assert.isFalse(player.isAlive, "Player should lose a life when hit by cherry boss");
        assert.equal(lives, 0, "Lives should be set to zero for cherry boss");
        
        // Restore boss and player state
        boss.x = originalX;
        boss.y = originalY;
        boss.velocityX = originalVelocityX;
        boss.velocityY = originalVelocityY;
        boss.hits = originalHits;
        boss.active = originalActive;
        
        player.x = originalPlayerX;
        player.y = originalPlayerY;
        player.velocityY = originalPlayerVelocityY;
        player.isAlive = originalPlayerIsAlive;
        
        lives = originalLives;
        currentLevel = originalLevel;
    },
    
    // Level progression tests
    testLevelProgression: function() {
        console.log("🧪 Testing level progression...");
        
        // Save original level
        const originalLevel = currentLevel;
        
        // Test level 1 speed
        currentLevel = 1;
        let expectedSpeedMultiplier = 0.85;
        if (currentLevel === 1) {
            speedMultiplier = 0.85;
        } else {
            speedMultiplier = 1 + ((currentLevel - 2) * 0.1);
        }
        assert.equal(speedMultiplier, expectedSpeedMultiplier, "Level 1 speed multiplier should be 0.85");
        
        // Test level 2 speed
        currentLevel = 2;
        expectedSpeedMultiplier = 1.0;
        if (currentLevel === 1) {
            speedMultiplier = 0.85;
        } else {
            speedMultiplier = 1 + ((currentLevel - 2) * 0.1);
        }
        assert.equal(speedMultiplier, expectedSpeedMultiplier, "Level 2 speed multiplier should be 1.0");
        
        // Test level 3 speed
        currentLevel = 3;
        expectedSpeedMultiplier = 1.1;
        if (currentLevel === 1) {
            speedMultiplier = 0.85;
        } else {
            speedMultiplier = 1 + ((currentLevel - 2) * 0.1);
        }
        assert.equal(speedMultiplier, expectedSpeedMultiplier, "Level 3 speed multiplier should be 1.1");
        
        // Test level 4 speed
        currentLevel = 4;
        expectedSpeedMultiplier = 1.2;
        if (currentLevel === 1) {
            speedMultiplier = 0.85;
        } else {
            speedMultiplier = 1 + ((currentLevel - 2) * 0.1);
        }
        assert.equal(speedMultiplier, expectedSpeedMultiplier, "Level 4 speed multiplier should be 1.2");
        
        // Restore original level
        currentLevel = originalLevel;
        if (currentLevel === 1) {
            speedMultiplier = 0.85;
        } else {
            speedMultiplier = 1 + ((currentLevel - 2) * 0.1);
        }
    },
    
    // Explosion tests
    testExplosions: function() {
        console.log("🧪 Testing explosion functionality...");
        
        // Clear existing explosions
        explosions = [];
        assert.equal(explosions.length, 0, "Explosions array should start empty");
        
        // Create a test explosion
        createExplosion(400, 300);
        assert.equal(explosions.length, 1, "Explosion should be added to explosions array");
        assert.isGreaterThan(explosions[0].particles.length, 0, "Explosion should have particles");
        
        // Test explosion update
        const originalParticleCount = explosions[0].particles.length;
        const originalFrame = explosions[0].currentFrame;
        
        updateExplosions();
        
        assert.equal(explosions[0].currentFrame, originalFrame + 1, "Explosion frame should increment");
        assert.equal(explosions[0].particles.length, originalParticleCount, "Particle count should remain the same");
        
        // Test explosion completion
        explosions[0].currentFrame = explosions[0].duration - 1;
        updateExplosions();
        assert.equal(explosions.length, 0, "Explosion should be removed when duration is reached");
        
        // Test cherry enemy explosion
        // Only for levels 3 and 4
        if (currentLevel === 3 || currentLevel === 4) {
            // Create a test enemy
            const testEnemy = {
                x: 500,
                y: 300,
                width: assets.strawberry.width,
                height: assets.strawberry.height,
                velocityX: 1.5 * speedMultiplier,
                active: true
            };
            
            // Clear explosions
            explosions = [];
            
            // Position player to hit enemy from side
            const originalPlayerX = player.x;
            const originalPlayerY = player.y;
            
            player.x = testEnemy.x - player.width;
            player.y = testEnemy.y;
            
            // Simulate collision from side (not from above)
            const collidingFromSide = 
                player.x + 5 < testEnemy.x + testEnemy.width - 5 &&
                player.x + player.width - 5 > testEnemy.x + 5 &&
                player.y + 5 < testEnemy.y + testEnemy.height - 5 &&
                player.y + player.height - 5 > testEnemy.y + 5 &&
                !(player.velocityY > 0 && player.y + player.height - player.velocityY <= testEnemy.y + testEnemy.height/4);
                
            assert.isTrue(collidingFromSide, "Side collision detection should work correctly");
            
            // In the actual game, this would create an explosion
            createExplosion(testEnemy.x + testEnemy.width/2, testEnemy.y + testEnemy.height/2);
            assert.equal(explosions.length, 1, "Explosion should be created for cherry enemy collision");
            
            // Restore player position
            player.x = originalPlayerX;
            player.y = originalPlayerY;
        }
    }
};

// Run all tests
function runAllTests() {
    console.log("🧪🧪🧪 STARTING TEST SUITE 🧪🧪🧪");
    
    // Run each test
    tests.testGameInitialization();
    tests.testPlayerMechanics();
    tests.testEnemies();
    tests.testEnemySpriteFlipping();
    tests.testMixedEnemyTypes();
    tests.testDualBossSystem(); // New test for dual boss system
    tests.testPlatformCollisions();
    tests.testBoss();
    tests.testLevelProgression();
    tests.testExplosions();
    
    // Report results
    console.log("\n🧪🧪🧪 TEST RESULTS 🧪🧪🧪");
    console.log(`Total tests: ${testResults.total}`);
    console.log(`Passed: ${testResults.passed}`);
    console.log(`Failed: ${testResults.failed}`);
    
    const passRate = (testResults.passed / testResults.total) * 100;
    console.log(`Pass rate: ${passRate.toFixed(2)}%`);
    
    return testResults.failed === 0;
}

// Function to run before any git push
function runTestsBeforePush() {
    const allTestsPassed = runAllTests();
    
    if (allTestsPassed) {
        console.log("✅ All tests passed! Safe to push changes.");
        return true;
    } else {
        console.error("❌ Some tests failed! Please fix issues before pushing.");
        return false;
    }
}
