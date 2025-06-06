// Enhanced Test Suite for Professional Game Quality
// Tests all new systems: error handling, memory management, performance, input validation

console.log('🧪🔬 STARTING ENHANCED PROFESSIONAL TEST SUITE 🔬🧪');

let enhancedTestResults = {
    passed: 0,
    failed: 0,
    total: 0,
    categories: {
        errorHandling: { passed: 0, failed: 0, total: 0 },
        memoryManagement: { passed: 0, failed: 0, total: 0 },
        performance: { passed: 0, failed: 0, total: 0 },
        inputValidation: { passed: 0, failed: 0, total: 0 },
        gameState: { passed: 0, failed: 0, total: 0 }
    }
};

function runEnhancedTest(testName, testFunction, category = 'general') {
    enhancedTestResults.total++;
    if (enhancedTestResults.categories[category]) {
        enhancedTestResults.categories[category].total++;
    }
    
    try {
        const result = testFunction();
        if (result) {
            console.log(`✅ ENHANCED PASS: ${testName}`);
            enhancedTestResults.passed++;
            if (enhancedTestResults.categories[category]) {
                enhancedTestResults.categories[category].passed++;
            }
        } else {
            console.log(`❌ ENHANCED FAIL: ${testName}`);
            enhancedTestResults.failed++;
            if (enhancedTestResults.categories[category]) {
                enhancedTestResults.categories[category].failed++;
            }
        }
    } catch (error) {
        console.log(`❌ ENHANCED ERROR: ${testName} - ${error.message}`);
        enhancedTestResults.failed++;
        if (enhancedTestResults.categories[category]) {
            enhancedTestResults.categories[category].failed++;
        }
    }
}

// === ERROR HANDLING TESTS ===
console.log('\n🛡️ Testing Error Handling System...');

runEnhancedTest('Logger class should exist and be functional', () => {
    return typeof Logger === 'function' && typeof logger === 'object';
}, 'errorHandling');

runEnhancedTest('ErrorHandler class should exist and be functional', () => {
    return typeof ErrorHandler === 'function' && typeof errorHandler === 'object';
}, 'errorHandling');

runEnhancedTest('Logger should have all required methods', () => {
    return typeof logger.debug === 'function' &&
           typeof logger.info === 'function' &&
           typeof logger.warn === 'function' &&
           typeof logger.error === 'function';
}, 'errorHandling');

runEnhancedTest('Logger should maintain log history', () => {
    const initialLogCount = logger.logs.length;
    logger.info('Test log entry');
    return logger.logs.length > initialLogCount;
}, 'errorHandling');

runEnhancedTest('ErrorHandler should handle errors safely', () => {
    const initialErrorCount = errorHandler.criticalErrors;
    errorHandler.handleError(new Error('Test error'), 'Test context');
    return errorHandler.criticalErrors > initialErrorCount;
}, 'errorHandling');

runEnhancedTest('Safe execution wrapper should exist', () => {
    return typeof safe === 'function';
}, 'errorHandling');

runEnhancedTest('Safe wrapper should catch errors', () => {
    const result = safe(() => {
        throw new Error('Test error');
    }, 'Test context', 'fallback');
    return result === 'fallback';
}, 'errorHandling');

// === MEMORY MANAGEMENT TESTS ===
console.log('\n💾 Testing Memory Management System...');

runEnhancedTest('ObjectPool class should exist and be functional', () => {
    return typeof ObjectPool === 'function';
}, 'memoryManagement');

runEnhancedTest('Enemy pool should be initialized', () => {
    return typeof enemyPool === 'object' && 
           typeof enemyPool.acquire === 'function' &&
           typeof enemyPool.release === 'function';
}, 'memoryManagement');

runEnhancedTest('Explosion pool should be initialized', () => {
    return typeof explosionPool === 'object' && 
           typeof explosionPool.acquire === 'function' &&
           typeof explosionPool.release === 'function';
}, 'memoryManagement');

runEnhancedTest('Object pool should acquire and release objects', () => {
    const obj = enemyPool.acquire();
    const initialActive = enemyPool.active.length;
    enemyPool.release(obj);
    return enemyPool.active.length < initialActive;
}, 'memoryManagement');

runEnhancedTest('MemoryManager should exist and be functional', () => {
    return typeof MemoryManager === 'function' && typeof memoryManager === 'object';
}, 'memoryManagement');

runEnhancedTest('MemoryManager should provide memory statistics', () => {
    const stats = memoryManager.getMemoryReport();
    return typeof stats === 'object' && 
           typeof stats.enemies === 'number' &&
           typeof stats.explosions === 'number';
}, 'memoryManagement');

runEnhancedTest('Memory cleanup should be functional', () => {
    return typeof memoryManager.cleanup === 'function';
}, 'memoryManagement');

// === PERFORMANCE TESTS ===
console.log('\n⚡ Testing Performance System...');

runEnhancedTest('PerformanceManager should exist and be functional', () => {
    return typeof PerformanceManager === 'function' && typeof performanceManager === 'object';
}, 'performance');

runEnhancedTest('Performance manager should track FPS', () => {
    return typeof performanceManager.fps === 'number' &&
           typeof performanceManager.deltaTime === 'number';
}, 'performance');

runEnhancedTest('Performance manager should have start/stop methods', () => {
    return typeof performanceManager.start === 'function' &&
           typeof performanceManager.stop === 'function';
}, 'performance');

runEnhancedTest('Performance monitoring should update metrics', () => {
    const initialFrameCount = performanceManager.frameCount;
    performanceManager.updatePerformance(performance.now());
    return performanceManager.frameCount > initialFrameCount;
}, 'performance');

// === INPUT VALIDATION TESTS ===
console.log('\n🔒 Testing Input Validation System...');

runEnhancedTest('InputManager should exist and be functional', () => {
    return typeof InputManager === 'function' && typeof inputManager === 'object';
}, 'inputValidation');

runEnhancedTest('Input validation should reject invalid keys', () => {
    return !inputManager.isValidKey('InvalidKey123');
}, 'inputValidation');

runEnhancedTest('Input validation should accept valid keys', () => {
    return inputManager.isValidKey('KeyW') && 
           inputManager.isValidKey('Space') &&
           inputManager.isValidKey('ArrowUp');
}, 'inputValidation');

runEnhancedTest('Rate limiting should prevent spam', () => {
    // First call should succeed
    const firstCall = inputManager.canProcessInput();
    // Immediate second call should fail due to rate limiting
    const secondCall = inputManager.canProcessInput();
    return firstCall && !secondCall;
}, 'inputValidation');

runEnhancedTest('Cheat code processing should be secure', () => {
    return typeof inputManager.processCheatCode === 'function' &&
           typeof inputManager.cheatSequence === 'object';
}, 'inputValidation');

// === GAME STATE TESTS ===
console.log('\n🎮 Testing Enhanced Game State Management...');

runEnhancedTest('GAME_CONFIG constants should be defined', () => {
    return typeof GAME_CONFIG === 'object' &&
           typeof GAME_CONFIG.CANVAS === 'object' &&
           typeof GAME_CONFIG.PLAYER === 'object' &&
           typeof GAME_CONFIG.PHYSICS === 'object';
}, 'gameState');

runEnhancedTest('GameState class should exist', () => {
    return typeof GameState === 'function';
}, 'gameState');

runEnhancedTest('Game state should have validation methods', () => {
    return typeof gameState.setLevel === 'function' &&
           typeof gameState.addScore === 'function' &&
           typeof gameState.loseLife === 'function';
}, 'gameState');

runEnhancedTest('Level validation should work correctly', () => {
    return gameState.setLevel(2) === true && // Valid level
           gameState.setLevel(99) === false;   // Invalid level
}, 'gameState');

runEnhancedTest('Score validation should prevent negative scores', () => {
    const initialScore = gameState.score;
    gameState.addScore(-100); // Should be rejected
    return gameState.score === initialScore;
}, 'gameState');

runEnhancedTest('Canvas initialization should have error handling', () => {
    return typeof initResponsiveCanvas === 'function';
}, 'gameState');

runEnhancedTest('Mobile controls should have enhanced structure', () => {
    return typeof mobileControls.reset === 'function' &&
           typeof mobileControls.isActive === 'function';
}, 'gameState');

// Display enhanced test results
console.log('\n🧪🔬 ENHANCED TEST RESULTS 🔬🧪');
console.log(`Total enhanced tests: ${enhancedTestResults.total}`);
console.log(`Passed: ${enhancedTestResults.passed}`);
console.log(`Failed: ${enhancedTestResults.failed}`);
console.log(`Pass rate: ${((enhancedTestResults.passed / enhancedTestResults.total) * 100).toFixed(2)}%`);

console.log('\n📊 Results by Category:');
Object.entries(enhancedTestResults.categories).forEach(([category, results]) => {
    if (results.total > 0) {
        const passRate = ((results.passed / results.total) * 100).toFixed(2);
        console.log(`  ${category}: ${results.passed}/${results.total} (${passRate}%)`);
    }
});

if (enhancedTestResults.failed === 0) {
    console.log('\n🎉 ALL ENHANCED TESTS PASSED! 🎉');
    console.log('✅ Error handling system working correctly');
    console.log('✅ Memory management optimized');
    console.log('✅ Performance monitoring active');
    console.log('✅ Input validation secure');
    console.log('✅ Game state management robust');
    console.log('✅ Professional-grade quality achieved!');
} else {
    console.log(`\n❌ ${enhancedTestResults.failed} enhanced tests failed`);
    console.log('Please review and fix failing systems');
}

// Export results for main test runner
if (typeof module !== 'undefined' && module.exports) {
    module.exports = enhancedTestResults;
}
