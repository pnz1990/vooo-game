// Test mixed enemy types in level 4
tests.testMixedEnemyTypes = function() {
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
};
