#!/usr/bin/env node

// VOOO Game Test Runner with Mobile Testing
// Comprehensive test suite including mobile responsiveness and touch controls

const fs = require('fs');
const path = require('path');

console.log('🧪 VOOO Game Test Runner Starting...');
console.log('Setting up test environment...');

// Initialize test results
let testResults = { passed: 0, failed: 0, total: 0 };
let mobileTestResults = { passed: 0, failed: 0, total: 0 };

// Create a mock DOM environment for testing
global.window = {
    addEventListener: () => {},
    requestAnimationFrame: (callback) => setTimeout(callback, 16),
    location: { reload: () => {} },
    getComputedStyle: () => ({}),
    innerWidth: 1024,
    innerHeight: 768
};

global.document = {
    getElementById: (id) => {
        const mockElements = {
            'gameCanvas': {
                getContext: () => ({
                    fillStyle: '',
                    fillRect: () => {},
                    strokeStyle: '',
                    strokeRect: () => {},
                    beginPath: () => {},
                    arc: () => {},
                    fill: () => {},
                    stroke: () => {},
                    fillText: () => {},
                    clearRect: () => {},
                    save: () => {},
                    restore: () => {},
                    translate: () => {},
                    scale: () => {},
                    createLinearGradient: () => ({
                        addColorStop: () => {}
                    }),
                    shadowColor: '',
                    shadowBlur: 0,
                    globalAlpha: 1,
                    font: '',
                    textAlign: '',
                    lineWidth: 1
                }),
                width: 800,
                height: 500,
                style: {
                    width: '800px',
                    height: '500px'
                },
                addEventListener: () => {},
                getBoundingClientRect: () => ({
                    left: 0,
                    top: 0,
                    width: 800,
                    height: 500
                })
            },
            'score': { textContent: 'Score: 0' },
            'lives': { textContent: 'Lives: 3' },
            'gameContainer': {
                getBoundingClientRect: () => ({
                    width: 800,
                    height: 500
                })
            },
            'controls': {
                appendChild: () => {},
                insertBefore: () => {},
                querySelector: () => null,
                innerHTML: ''
            },
            'instructions': {
                innerHTML: ''
            }
        };
        return mockElements[id] || {
            textContent: '',
            innerHTML: '',
            style: {},
            appendChild: () => {},
            addEventListener: () => {},
            getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 })
        };
    },
    createElement: (tag) => ({
        textContent: '',
        innerHTML: '',
        style: {
            cssText: ''
        },
        addEventListener: () => {},
        appendChild: () => {},
        setAttribute: () => {},
        getAttribute: () => null
    }),
    querySelector: () => ({
        content: 'width=device-width, initial-scale=1.0, user-scalable=no'
    }),
    querySelectorAll: () => [{}],
    styleSheets: [{}],
    body: {}
};

global.navigator = {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
    maxTouchPoints: 5
};

global.Image = function() {
    return {
        onload: null,
        onerror: null,
        src: '',
        width: 100,
        height: 100
    };
};

// Mock canvas context
global.CanvasRenderingContext2D = {};

console.log('Loading game files...');

// Load game files
const gameJsPath = path.join(__dirname, '..', 'game.js');
const explosionJsPath = path.join(__dirname, 'explosion.js');
const testsJsPath = path.join(__dirname, 'tests.js');
const mobileTestsJsPath = path.join(__dirname, 'mobile-tests.js');

try {
    // Load main game file
    const gameJs = fs.readFileSync(gameJsPath, 'utf8');
    eval(gameJs);
    
    // Load explosion effects
    const explosionJs = fs.readFileSync(explosionJsPath, 'utf8');
    eval(explosionJs);
    
    console.log('Loading and running tests...');
    
    // Load and run main tests
    const testsJs = fs.readFileSync(testsJsPath, 'utf8');
    eval(testsJs);
    
    // Capture main test results
    if (typeof global.testResults !== 'undefined') {
        testResults = global.testResults;
    }
    
    // Load and run mobile tests
    const mobileTestsJs = fs.readFileSync(mobileTestsJsPath, 'utf8');
    eval(mobileTestsJs);
    
    // Capture mobile test results
    if (typeof global.mobileTestResults !== 'undefined') {
        mobileTestResults = global.mobileTestResults;
    }
    
    // Combined results
    const totalTests = testResults.total + mobileTestResults.total;
    const totalPassed = testResults.passed + mobileTestResults.passed;
    const totalFailed = testResults.failed + mobileTestResults.failed;
    const overallPassRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(2) : '0.00';
    
    console.log('\n🧪🧪🧪 COMBINED TEST RESULTS 🧪🧪🧪');
    console.log(`Core Game Tests: ${testResults.passed}/${testResults.total} passed`);
    console.log(`Mobile Tests: ${mobileTestResults.passed}/${mobileTestResults.total} passed`);
    console.log(`Total tests: ${totalTests}`);
    console.log(`Total passed: ${totalPassed}`);
    console.log(`Total failed: ${totalFailed}`);
    console.log(`Overall pass rate: ${overallPassRate}%`);
    
    if (totalFailed === 0 && totalTests > 0) {
        console.log('🎉 ALL TESTS PASSED! 🎉');
        console.log('✅ Core game functionality working correctly');
        console.log('✅ Mobile responsiveness implemented properly');
        console.log('✅ Touch controls functioning as expected');
        console.log('✅ Cross-device compatibility ensured');
        console.log('✅ No regressions detected');
        console.log('✅ All tests passed! You can safely push your changes.');
        process.exit(0);
    } else {
        console.log(`❌ ${totalFailed} tests failed`);
        console.log('Please fix failing tests before pushing changes.');
        process.exit(1);
    }
    
} catch (error) {
    console.error('❌ Error running tests:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
}
