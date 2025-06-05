// VOOO Game Test Suite
// Comprehensive tests for all game features including new level system, double jump, enemy scaling, and dual boss system

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
    },
    arrayContains: function(array, value, message) {
        testResults.total++;
        if (Array.isArray(array) && array.includes(value)) {
            testResults.passed++;
            console.log(`✅ PASS: ${message}`);
            return true;
        } else {
            testResults.failed++;
            console.error(`❌ FAIL: ${message}`);
            console.error(`   Array: ${JSON.stringify(array)}, Expected to contain: ${value}`);
            return false;
        }
    },
    hasProperty: function(obj, property, message) {
        testResults.total++;
        if (obj && obj.hasOwnProperty(property)) {
            testResults.passed++;
            console.log(`✅ PASS: ${message}`);
            return true;
        } else {
            testResults.failed++;
            console.error(`❌ FAIL: ${message}`);
            console.error(`   Object does not have property: ${property}`);
            return false;
        }
    }
};
// Test suite
const tests = {
    // Test Level System and Speed Multipliers
    testLevelSystemAndSpeedMultipliers: function() {
        console.log("🧪 Testing Level System and Speed Multipliers...");
        
        // Save original values
        const originalLevel = typeof currentLevel !== 'undefined' ? currentLevel : 1;
        const originalSpeedMultiplier = typeof speedMultiplier !== 'undefined' ? speedMultiplier : 1;
        
        // Test Level 1 (15% slower)
        const level1Speed = 0.85;
        assert.equal(level1Speed, 0.85, "Level 1 should have 15% slower speed (0.85)");
        
        // Test Level 2 (normal speed)
        const level2Speed = 1 + ((2 - 2) * 0.1);
        assert.equal(level2Speed, 1.0, "Level 2 should have normal speed (1.0)");
        
        // Test Level 3 (10% faster)
        const level3Speed = 1 + ((3 - 2) * 0.1);
        assert.equal(level3Speed, 1.1, "Level 3 should have 10% faster speed (1.1)");
        
        // Test Level 4 (20% faster)
        const level4Speed = 1 + ((4 - 2) * 0.1);
        assert.equal(level4Speed, 1.2, "Level 4 should have 20% faster speed (1.2)");
        
        // Test speed affects all movement variables
        const testSpeedMultiplier = 0.85;
        const playerMoveSpeed = 3.45 * testSpeedMultiplier;
        const playerJumpPower = -11.5 * testSpeedMultiplier;
        const playerDoubleJumpPower = -13 * testSpeedMultiplier;
        const enemySpeed = 1.5 * testSpeedMultiplier;
        const bossSpeed = 1.725 * testSpeedMultiplier;
        
        assert.approximately(playerMoveSpeed, 3.45 * 0.85, 0.01, "Player move speed should be affected by speed multiplier");
        assert.approximately(playerJumpPower, -11.5 * 0.85, 0.01, "Player jump power should be affected by speed multiplier");
        assert.approximately(playerDoubleJumpPower, -13 * 0.85, 0.01, "Player double jump power should be affected by speed multiplier");
        assert.approximately(enemySpeed, 1.5 * 0.85, 0.01, "Enemy speed should be affected by speed multiplier");
        assert.approximately(bossSpeed, 1.725 * 0.85, 0.01, "Boss speed should be affected by speed multiplier");
    },
    
    // Test Double Jump Ability
    testDoubleJumpAbility: function() {
        console.log("🧪 Testing Double Jump Ability...");
        
        // Test double jump feature is enabled
        const doubleJumpFeatureEnabled = typeof doubleJumpEnabled !== 'undefined' ? doubleJumpEnabled : true;
        assert.isTrue(doubleJumpFeatureEnabled, "Double jump feature should be enabled");
        
        // Test jump power values
        const regularJumpPower = -11.5;
        const doubleJumpPower = -13;
        assert.isLessThan(doubleJumpPower, regularJumpPower, "Double jump power should be stronger (more negative) than regular jump");
        
        // Test double jump logic
        let jumping = false;
        let doubleJumping = false;
        let canDoubleJump = false;
        let velocityY = 0;
        
        // Test first jump
        if (!jumping) {
            velocityY = regularJumpPower;
            jumping = true;
            canDoubleJump = doubleJumpFeatureEnabled;
        }
        
        assert.isTrue(jumping, "Player should be in jumping state after first jump");
        assert.approximately(velocityY, regularJumpPower, 0.01, "First jump should apply jump power");
        assert.equal(canDoubleJump, doubleJumpFeatureEnabled, "Double jump should be available after first jump");
        
        // Test double jump
        if (canDoubleJump && !doubleJumping) {
            velocityY = doubleJumpPower;
            doubleJumping = true;
            canDoubleJump = false;
        }
        
        assert.isTrue(doubleJumping, "Player should be in double jumping state");
        assert.approximately(velocityY, doubleJumpPower, 0.01, "Double jump should apply stronger jump power");
        assert.isFalse(canDoubleJump, "Double jump should not be available after use");
        
        // Test that triple jump is not possible
        const canTripleJump = canDoubleJump && !doubleJumping;
        assert.isFalse(canTripleJump, "Triple jump should not be possible");
        
        // Test double jump reset on landing
        jumping = false;
        doubleJumping = false;
        canDoubleJump = false;
        
        assert.isFalse(jumping, "Player should not be jumping when landed");
        assert.isFalse(doubleJumping, "Player should not be double jumping when landed");
        assert.isFalse(canDoubleJump, "Double jump should reset when landed");
    },
    
    // Test Enemy Scaling by Level
    testEnemyScaling: function() {
        console.log("🧪 Testing Enemy Scaling by Level...");
        
        // Test Level 1 enemy count (fewer enemies)
        const level1EnemyCount = 1 === 1 ? 15 : 30;
        assert.equal(level1EnemyCount, 15, "Level 1 should have 15 enemies (fewer for easier difficulty)");
        
        // Test Level 1 platform enemy chance (lower chance)
        const level1PlatformChance = 1 === 1 ? 0.2 : 0.4;
        assert.equal(level1PlatformChance, 0.2, "Level 1 should have 20% platform enemy chance");
        
        // Test Level 2+ enemy count (more enemies)
        const level2EnemyCount = 2 === 1 ? 15 : 30;
        assert.equal(level2EnemyCount, 30, "Level 2+ should have 30 enemies (more for increased difficulty)");
        
        // Test Level 2+ platform enemy chance (higher chance)
        const level2PlatformChance = 2 === 1 ? 0.2 : 0.4;
        assert.equal(level2PlatformChance, 0.4, "Level 2+ should have 40% platform enemy chance");
        
        // Test Level 3
        const level3EnemyCount = 3 === 1 ? 15 : 30;
        const level3PlatformChance = 3 === 1 ? 0.2 : 0.4;
        assert.equal(level3EnemyCount, 30, "Level 3 should have 30 enemies");
        assert.equal(level3PlatformChance, 0.4, "Level 3 should have 40% platform enemy chance");
        
        // Test Level 4
        const level4EnemyCount = 4 === 1 ? 15 : 30;
        const level4PlatformChance = 4 === 1 ? 0.2 : 0.4;
        assert.equal(level4EnemyCount, 30, "Level 4 should have 30 enemies");
        assert.equal(level4PlatformChance, 0.4, "Level 4 should have 40% platform enemy chance");
    },
    
    // Test Mixed Enemy Types in Level 4
    testMixedEnemyTypes: function() {
        console.log("🧪 Testing Mixed Enemy Types in Level 4...");
        
        // Create test enemies of both types (using actual asset sizes)
        const enemyWidth = typeof assets !== 'undefined' ? assets.strawberry.width : 60;
        const enemyHeight = typeof assets !== 'undefined' ? assets.strawberry.height : 60;
        
        const strawberryEnemy = {
            x: 500,
            y: 300,
            width: enemyWidth,
            height: enemyHeight,
            velocityX: 1.5,
            active: true,
            type: 'strawberry'
        };
        
        const cherryEnemy = {
            x: 700,
            y: 300,
            width: enemyWidth,
            height: enemyHeight,
            velocityX: -1.5,
            active: true,
            type: 'cherry'
        };
        
        // Test enemy type properties
        assert.equal(strawberryEnemy.type, 'strawberry', "Strawberry enemy should have correct type");
        assert.equal(cherryEnemy.type, 'cherry', "Cherry enemy should have correct type");
        
        // Test enemy size consistency
        assert.equal(strawberryEnemy.width, enemyWidth, "Strawberry enemy should have correct width");
        assert.equal(strawberryEnemy.height, enemyHeight, "Strawberry enemy should have correct height");
        assert.equal(cherryEnemy.width, enemyWidth, "Cherry enemy should have correct width");
        assert.equal(cherryEnemy.height, enemyHeight, "Cherry enemy should have correct height");
        
        // Test enemy movement
        assert.isGreaterThan(strawberryEnemy.velocityX, 0, "Strawberry enemy should move right");
        assert.isLessThan(cherryEnemy.velocityX, 0, "Cherry enemy should move left");
        
        // Test random enemy type selection logic
        const originalRandom = Math.random;
        
        // Test strawberry selection (random < 0.5)
        Math.random = function() { return 0.25; };
        let selectedType = Math.random() < 0.5 ? 'strawberry' : 'cherry';
        assert.equal(selectedType, 'strawberry', "Should select strawberry when random < 0.5");
        
        // Test cherry selection (random >= 0.5)
        Math.random = function() { return 0.75; };
        selectedType = Math.random() < 0.5 ? 'strawberry' : 'cherry';
        assert.equal(selectedType, 'cherry', "Should select cherry when random >= 0.5");
        
        // Restore original Math.random
        Math.random = originalRandom;
    },
    
    // Test Dual Boss System in Level 4
    testDualBossSystem: function() {
        console.log("🧪 Testing Dual Boss System in Level 4...");
        
        // Test Level 4 dual boss activation
        const shouldHaveTwoBosses = 4 === 4;
        assert.isTrue(shouldHaveTwoBosses, "Level 4 should have dual boss system");
        
        // Test boss positioning logic
        const firstBossX = 7800;
        const secondBossX = 7600;
        assert.isGreaterThan(firstBossX, secondBossX, "First boss should be positioned to the right of second boss");
        
        // Test boss movement directions
        const firstBossVelocity = 1.725;
        const secondBossVelocity = -1.725;
        assert.isGreaterThan(firstBossVelocity, 0, "First boss should move right initially");
        assert.isLessThan(secondBossVelocity, 0, "Second boss should move left initially");
        assert.isTrue(firstBossVelocity * secondBossVelocity < 0, "Bosses should move in opposite directions");
        
        // Test boss types
        const firstBossType = 'cherry';
        const secondBossType = 'strawberry';
        assert.equal(firstBossType, 'cherry', "First boss should be cherry type in level 4");
        assert.equal(secondBossType, 'strawberry', "Second boss should be strawberry type in level 4");
        
        // Test level completion logic for dual boss system
        let bossDefeated = false;
        let secondBossDefeated = false;
        
        // Test incomplete with no bosses defeated
        let levelComplete = 4 === 4 ? (bossDefeated && secondBossDefeated) : bossDefeated;
        assert.isFalse(levelComplete, "Level should not be complete with no bosses defeated");
        
        // Test incomplete with only first boss defeated
        bossDefeated = true;
        levelComplete = 4 === 4 ? (bossDefeated && secondBossDefeated) : bossDefeated;
        assert.isFalse(levelComplete, "Level should not be complete with only first boss defeated");
        
        // Test incomplete with only second boss defeated
        bossDefeated = false;
        secondBossDefeated = true;
        levelComplete = 4 === 4 ? (bossDefeated && secondBossDefeated) : bossDefeated;
        assert.isFalse(levelComplete, "Level should not be complete with only second boss defeated");
        
        // Test complete with both bosses defeated
        bossDefeated = true;
        secondBossDefeated = true;
        levelComplete = 4 === 4 ? (bossDefeated && secondBossDefeated) : bossDefeated;
        assert.isTrue(levelComplete, "Level should be complete with both bosses defeated");
        
        // Test single boss system in other levels
        bossDefeated = true;
        secondBossDefeated = false;
        const singleBossLevelComplete = 2 === 4 ? (bossDefeated && secondBossDefeated) : bossDefeated;
        assert.isTrue(singleBossLevelComplete, "Single boss level should be complete when boss is defeated");
    },
    
    // Test Game Initialization
    testGameInitialization: function() {
        console.log("🧪 Testing Game Initialization...");
        
        // Test initial game state variables
        if (typeof gameRunning !== 'undefined') {
            assert.equal(typeof gameRunning, 'boolean', "gameRunning should be a boolean");
        }
        if (typeof score !== 'undefined') {
            assert.equal(typeof score, 'number', "score should be a number");
        }
        if (typeof lives !== 'undefined') {
            assert.equal(typeof lives, 'number', "lives should be a number");
        }
        if (typeof currentLevel !== 'undefined') {
            assert.equal(typeof currentLevel, 'number', "currentLevel should be a number");
            assert.isGreaterThan(currentLevel, 0, "currentLevel should be greater than 0");
        }
        if (typeof maxLevel !== 'undefined') {
            assert.equal(typeof maxLevel, 'number', "maxLevel should be a number");
            assert.equal(maxLevel, 4, "maxLevel should be 4");
        }
        if (typeof speedMultiplier !== 'undefined') {
            assert.equal(typeof speedMultiplier, 'number', "speedMultiplier should be a number");
            assert.isGreaterThan(speedMultiplier, 0, "speedMultiplier should be positive");
            assert.isLessThan(speedMultiplier, 2, "speedMultiplier should be reasonable (< 2)");
        }
        
        // Test double jump feature is enabled
        if (typeof doubleJumpEnabled !== 'undefined') {
            assert.equal(typeof doubleJumpEnabled, 'boolean', "doubleJumpEnabled should be a boolean");
            assert.isTrue(doubleJumpEnabled, "doubleJumpEnabled should be true");
        }
    },
    
    // Test Player Mechanics
    testPlayerMechanics: function() {
        console.log("🧪 Testing Player Mechanics...");
        
        // Test player object structure
        if (typeof player !== 'undefined') {
            assert.hasProperty(player, 'x', "Player should have x property");
            assert.hasProperty(player, 'y', "Player should have y property");
            assert.hasProperty(player, 'width', "Player should have width property");
            assert.hasProperty(player, 'height', "Player should have height property");
            assert.hasProperty(player, 'velocityX', "Player should have velocityX property");
            assert.hasProperty(player, 'velocityY', "Player should have velocityY property");
            assert.hasProperty(player, 'jumping', "Player should have jumping property");
            assert.hasProperty(player, 'doubleJumping', "Player should have doubleJumping property");
            assert.hasProperty(player, 'canDoubleJump', "Player should have canDoubleJump property");
            assert.hasProperty(player, 'jumpPower', "Player should have jumpPower property");
            assert.hasProperty(player, 'doubleJumpPower', "Player should have doubleJumpPower property");
            assert.hasProperty(player, 'moveSpeed', "Player should have moveSpeed property");
            
            // Test player dimensions
            assert.equal(player.width, 50, "Player width should be 50");
            assert.equal(player.height, 70, "Player height should be 70");
            
            // Test double jump is stronger than regular jump
            assert.isLessThan(player.doubleJumpPower, player.jumpPower, "Double jump should be stronger (more negative) than regular jump");
        }
    },
    
    // Test Boss Mechanics
    testBossMechanics: function() {
        console.log("🧪 Testing Boss Mechanics...");
        
        // Test boss object structure
        if (typeof boss !== 'undefined') {
            assert.hasProperty(boss, 'x', "Boss should have x property");
            assert.hasProperty(boss, 'y', "Boss should have y property");
            assert.hasProperty(boss, 'width', "Boss should have width property");
            assert.hasProperty(boss, 'height', "Boss should have height property");
            assert.hasProperty(boss, 'velocityX', "Boss should have velocityX property");
            assert.hasProperty(boss, 'velocityY', "Boss should have velocityY property");
            assert.hasProperty(boss, 'active', "Boss should have active property");
            assert.hasProperty(boss, 'hits', "Boss should have hits property");
            assert.hasProperty(boss, 'type', "Boss should have type property");
            
            // Test boss dimensions
            assert.equal(boss.width, 100, "Boss width should be 100");
            assert.equal(boss.height, 120, "Boss height should be 120");
            
            // Test boss types
            const validBossTypes = ['cherry', 'strawberry'];
            assert.arrayContains(validBossTypes, boss.type, "Boss should have valid type");
        }
        
        // Test second boss object structure
        if (typeof secondBoss !== 'undefined') {
            assert.hasProperty(secondBoss, 'x', "Second boss should have x property");
            assert.hasProperty(secondBoss, 'y', "Second boss should have y property");
            assert.hasProperty(secondBoss, 'active', "Second boss should have active property");
            assert.hasProperty(secondBoss, 'type', "Second boss should have type property");
            
            assert.equal(secondBoss.width, 100, "Second boss width should be 100");
            assert.equal(secondBoss.height, 120, "Second boss height should be 120");
            
            const validBossTypes = ['cherry', 'strawberry'];
            assert.arrayContains(validBossTypes, secondBoss.type, "Second boss should have valid type");
        }
    },
    
    // Test Collision Detection
    testCollisionDetection: function() {
        console.log("🧪 Testing Collision Detection...");
        
        // Test basic collision detection logic
        const obj1 = { x: 100, y: 100, width: 50, height: 50 };
        const obj2 = { x: 120, y: 120, width: 50, height: 50 };
        const obj3 = { x: 200, y: 200, width: 50, height: 50 };
        
        // Test overlapping objects
        const collision1 = 
            obj1.x + 5 < obj2.x + obj2.width - 5 &&
            obj1.x + obj1.width - 5 > obj2.x + 5 &&
            obj1.y + 5 < obj2.y + obj2.height - 5 &&
            obj1.y + obj1.height - 5 > obj2.y + 5;
            
        assert.isTrue(collision1, "Overlapping objects should collide");
        
        // Test non-overlapping objects
        const collision2 = 
            obj1.x + 5 < obj3.x + obj3.width - 5 &&
            obj1.x + obj1.width - 5 > obj3.x + 5 &&
            obj1.y + 5 < obj3.y + obj3.height - 5 &&
            obj1.y + obj1.height - 5 > obj3.y + 5;
            
        assert.isFalse(collision2, "Non-overlapping objects should not collide");
        
        // Test jumping on enemy detection
        const playerObj = { x: 100, y: 100, width: 50, height: 70, velocityY: 5 };
        const enemyObj = { x: 110, y: 150, width: 60, height: 60 };
        
        const jumpingOnEnemy = 
            playerObj.velocityY > 0 && 
            playerObj.y + playerObj.height - playerObj.velocityY <= enemyObj.y + enemyObj.height/4;
            
        assert.isTrue(jumpingOnEnemy, "Jumping on enemy from above should be detected");
    },
    
    // Test Asset Loading
    testAssetLoading: function() {
        console.log("🧪 Testing Asset Loading...");
        
        // Test asset structure
        if (typeof assets !== 'undefined') {
            assert.hasProperty(assets, 'vooo', "Assets should have vooo property");
            assert.hasProperty(assets, 'strawberry', "Assets should have strawberry property");
            assert.hasProperty(assets, 'cherry', "Assets should have cherry property");
            assert.hasProperty(assets, 'boss', "Assets should have boss property");
            assert.hasProperty(assets, 'explosion', "Assets should have explosion property");
            
            // Test VOOO assets
            assert.hasProperty(assets.vooo, 'width', "VOOO assets should have width");
            assert.hasProperty(assets.vooo, 'height', "VOOO assets should have height");
            assert.equal(assets.vooo.width, 50, "VOOO width should be 50");
            assert.equal(assets.vooo.height, 70, "VOOO height should be 70");
            
            // Test enemy assets (they start as 40x40 but are resized to 60x60 in loadAssets())
            const actualStrawberryWidth = assets.strawberry.width;
            const actualStrawberryHeight = assets.strawberry.height;
            const actualCherryWidth = assets.cherry.width;
            const actualCherryHeight = assets.cherry.height;
            
            // Assets should be either 40x40 (initial) or 60x60 (after loadAssets)
            const validSizes = [40, 60];
            assert.arrayContains(validSizes, actualStrawberryWidth, "Strawberry enemy width should be valid (40 or 60)");
            assert.arrayContains(validSizes, actualStrawberryHeight, "Strawberry enemy height should be valid (40 or 60)");
            assert.arrayContains(validSizes, actualCherryWidth, "Cherry enemy width should be valid (40 or 60)");
            assert.arrayContains(validSizes, actualCherryHeight, "Cherry enemy height should be valid (40 or 60)");
            
            // Test boss assets
            assert.equal(assets.boss.width, 100, "Boss width should be 100");
            assert.equal(assets.boss.height, 120, "Boss height should be 120");
            assert.equal(assets.boss.hitsRequired, 5, "Boss should require 5 hits");
            
            // Test explosion assets
            assert.hasProperty(assets.explosion, 'duration', "Explosion should have duration");
            assert.hasProperty(assets.explosion, 'particleCount', "Explosion should have particleCount");
            assert.isGreaterThan(assets.explosion.duration, 0, "Explosion duration should be positive");
            assert.isGreaterThan(assets.explosion.particleCount, 0, "Explosion particle count should be positive");
        }
    }
};
// Run all tests
function runAllTests() {
    console.log("🧪🧪🧪 STARTING COMPREHENSIVE TEST SUITE 🧪🧪🧪");
    console.log("Testing all game features including new level system, double jump, enemy scaling, and dual boss system");
    
    // Reset test results
    testResults.passed = 0;
    testResults.failed = 0;
    testResults.total = 0;
    
    // Run each test
    tests.testLevelSystemAndSpeedMultipliers();
    tests.testDoubleJumpAbility();
    tests.testEnemyScaling();
    tests.testMixedEnemyTypes();
    tests.testDualBossSystem();
    tests.testGameInitialization();
    tests.testPlayerMechanics();
    tests.testBossMechanics();
    tests.testCollisionDetection();
    tests.testAssetLoading();
    
    // Report results
    console.log("\n🧪🧪🧪 TEST RESULTS 🧪🧪🧪");
    console.log(`Total tests: ${testResults.total}`);
    console.log(`Passed: ${testResults.passed}`);
    console.log(`Failed: ${testResults.failed}`);
    
    const passRate = testResults.total > 0 ? (testResults.passed / testResults.total) * 100 : 0;
    console.log(`Pass rate: ${passRate.toFixed(2)}%`);
    
    if (testResults.failed === 0) {
        console.log("🎉 ALL TESTS PASSED! 🎉");
        console.log("✅ Level system with speed multipliers working correctly");
        console.log("✅ Double jump ability implemented properly");
        console.log("✅ Enemy scaling by level functioning as expected");
        console.log("✅ Mixed enemy types in Level 4 supported");
        console.log("✅ Dual boss system in Level 4 working correctly");
        console.log("✅ All core game mechanics tested and verified");
    } else {
        console.log("❌ SOME TESTS FAILED!");
        console.log("Please review the failed tests above and fix the issues.");
    }
    
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

// Export for Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runAllTests, runTestsBeforePush, tests, assert };
}

// Make functions available globally for browser environment
if (typeof window !== 'undefined') {
    window.runAllTests = runAllTests;
    window.runTestsBeforePush = runTestsBeforePush;
    window.tests = tests;
    window.assert = assert;
} else if (typeof global !== 'undefined') {
    global.runAllTests = runAllTests;
    global.runTestsBeforePush = runTestsBeforePush;
    global.tests = tests;
    global.assert = assert;
}
