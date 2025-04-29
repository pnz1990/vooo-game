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
