// Test Runner for VOOO Game
// This script sets up a headless environment for running tests

const fs = require('fs');
const path = require('path');

// Mock canvas and context for headless testing
class MockCanvas {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.eventListeners = {};
    }
    
    getContext() {
        return new MockContext();
    }
    
    addEventListener(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }
    
    dispatchEvent(event) {
        const listeners = this.eventListeners[event.type] || [];
        listeners.forEach(callback => callback(event));
    }
    
    getBoundingClientRect() {
        return {
            left: 0,
            top: 0,
            width: this.width,
            height: this.height
        };
    }
}

class MockContext {
    constructor() {
        this.fillStyle = '';
        this.strokeStyle = '';
        this.lineWidth = 1;
        this.font = '';
        this.textAlign = '';
        this.globalAlpha = 1;
        this.shadowBlur = 0;
        this.shadowColor = '';
    }
    
    clearRect() {}
    fillRect() {}
    strokeRect() {}
    beginPath() {}
    moveTo() {}
    lineTo() {}
    arc() {}
    fill() {}
    stroke() {}
    fillText() {}
    drawImage() {}
    createLinearGradient() {
        return {
            addColorStop: function() {}
        };
    }
    save() {}
    restore() {}
    translate() {}
    scale() {}
}

// Mock Image class
class MockImage {
    constructor() {
        this.src = '';
        this.width = 0;
        this.height = 0;
        
        // Simulate image loading
        setTimeout(() => {
            if (this.onload) this.onload();
        }, 10);
    }
}

// Setup mock environment before running tests
function setupMockEnvironment() {
    // Create mock globals
    global.window = {
        addEventListener: function(event, callback) {
            if (event === 'load') {
                setTimeout(callback, 10);
            }
        }
    };
    
    global.document = {
        getElementById: function(id) {
            if (id === 'gameCanvas') {
                return new MockCanvas(800, 500);
            } else if (id === 'score') {
                return { textContent: '' };
            } else if (id === 'lives') {
                return { textContent: '' };
            } else if (id === 'controls') {
                return { appendChild: function() {} };
            }
            return null;
        },
        createElement: function(type) {
            if (type === 'canvas') {
                return new MockCanvas(800, 500);
            }
            return {
                width: 0,
                height: 0,
                getContext: function() {
                    return new MockContext();
                }
            };
        },
        body: {
            appendChild: function() {},
            removeChild: function() {}
        }
    };
    
    global.Image = MockImage;
    global.HTMLCanvasElement = MockCanvas;
    
    // Mock requestAnimationFrame
    global.requestAnimationFrame = function(callback) {
        setTimeout(callback, 16); // ~60fps
    };
}

// Load and execute JavaScript file in the global context
function loadJavaScriptFile(filePath) {
    const fullPath = path.resolve(__dirname, filePath);
    const code = fs.readFileSync(fullPath, 'utf8');
    
    // Execute the code in the global context
    const vm = require('vm');
    const context = vm.createContext(global);
    vm.runInContext(code, context);
}

// Run tests with proper environment setup
function runTestsWithEnvironment() {
    console.log("Setting up test environment...");
    
    setupMockEnvironment();
    
    try {
        // Load game code files in order
        console.log("Loading game files...");
        
        // Load main game file
        loadJavaScriptFile('../game.js');
        
        // Load explosion code
        loadJavaScriptFile('./explosion.js');
        
        // Load and run tests
        console.log("Loading and running tests...");
        loadJavaScriptFile('./tests.js');
        
        // Run the tests
        if (typeof global.runAllTests === 'function') {
            const testResult = global.runAllTests();
            return testResult;
        } else if (typeof runAllTests === 'function') {
            const testResult = runAllTests();
            return testResult;
        } else {
            console.error("runAllTests function not found!");
            return false;
        }
    } catch (error) {
        console.error("Error running tests:", error);
        console.error("Stack trace:", error.stack);
        return false;
    }
}

// Run the tests
const testResult = runTestsWithEnvironment();
if (testResult) {
    console.log("✅ All tests passed! You can safely push your changes.");
    process.exit(0);
} else {
    console.error("❌ Tests failed! Please fix the issues before pushing.");
    process.exit(1);
}
