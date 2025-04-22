// input.js - Input handling for keyboard and mouse

/**
 * InputManager class for handling user input
 */
class InputManager {
    /**
     * Create a new InputManager
     */
    constructor() {
        this.keys = {};
        this.cheatSequence = [];
        this.cheatActivated = false;
        this.onJump = null;
        this.onCheatActivated = null;
        this.onLevelSelect = null;
    }
    
    /**
     * Initialize input event listeners
     * @param {HTMLCanvasElement} canvas - Game canvas
     */
    init(canvas) {
        // Keyboard event listeners
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Canvas click event listeners
        canvas.addEventListener('click', (e) => this.handleCanvasClick(e, canvas));
    }
    
    /**
     * Handle keydown events
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyDown(e) {
        // Only register key press if it wasn't already pressed (prevents holding key to spam jump)
        if (!this.keys[e.code]) {
            this.keys[e.code] = true;
            
            // Check for cheat code (999)
            if (e.code === 'Digit9' || e.code === 'Numpad9') {
                this.cheatSequence.push('9');
                
                // Keep only the last 3 entries
                if (this.cheatSequence.length > 3) {
                    this.cheatSequence.shift();
                }
                
                // Check if the sequence is "999"
                if (this.cheatSequence.length === 3 && 
                    this.cheatSequence[0] === '9' && 
                    this.cheatSequence[1] === '9' && 
                    this.cheatSequence[2] === '9' && 
                    !this.cheatActivated) {
                    
                    this.cheatActivated = true;
                    
                    // Call cheat activated callback
                    if (this.onCheatActivated) {
                        this.onCheatActivated();
                    }
                }
            } else {
                // Reset cheat sequence if any other key is pressed
                this.cheatSequence = [];
            }
            
            // Level selection with number keys
            if (e.code === 'Digit1' || e.code === 'Numpad1') {
                if (this.onLevelSelect) this.onLevelSelect(1);
            } else if (e.code === 'Digit2' || e.code === 'Numpad2') {
                if (this.onLevelSelect) this.onLevelSelect(2);
            } else if (e.code === 'Digit3' || e.code === 'Numpad3') {
                if (this.onLevelSelect) this.onLevelSelect(3);
            } else if (e.code === 'Digit4' || e.code === 'Numpad4') {
                if (this.onLevelSelect) this.onLevelSelect(4);
            }
            
            // Handle jump key press
            if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
                if (this.onJump) {
                    this.onJump();
                }
            }
        }
        
        // Prevent default for arrow keys and space to avoid page scrolling
        if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
            e.preventDefault();
        }
    }
    
    /**
     * Handle keyup events
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyUp(e) {
        this.keys[e.code] = false;
    }
    
    /**
     * Handle canvas click events
     * @param {MouseEvent} e - Mouse event
     * @param {HTMLCanvasElement} canvas - Game canvas
     */
    handleCanvasClick(e, canvas) {
        // Get mouse position relative to canvas
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Check if in level selection mode
        if (window.game && window.game.levelSelectionMode && !window.game.gameRunning) {
            // Check if clicked on level 1 button
            if (mouseX >= canvas.width / 2 - 100 && 
                mouseX <= canvas.width / 2 + 100 && 
                mouseY >= canvas.height / 2 + 20 && 
                mouseY <= canvas.height / 2 + 60) {
                
                if (this.onLevelSelect) this.onLevelSelect(1);
            }
            
            // Check if clicked on level 2 button
            if (mouseX >= canvas.width / 2 - 100 && 
                mouseX <= canvas.width / 2 + 100 && 
                mouseY >= canvas.height / 2 + 70 && 
                mouseY <= canvas.height / 2 + 110) {
                
                if (this.onLevelSelect) this.onLevelSelect(2);
            }
            
            // Check if clicked on level 3 button
            if (mouseX >= canvas.width / 2 - 100 && 
                mouseX <= canvas.width / 2 + 100 && 
                mouseY >= canvas.height / 2 + 120 && 
                mouseY <= canvas.height / 2 + 160) {
                
                if (this.onLevelSelect) this.onLevelSelect(3);
            }
        }
    }
    
    /**
     * Check if a key is pressed
     * @param {string} code - Key code
     * @returns {boolean} - Whether key is pressed
     */
    isKeyPressed(code) {
        return this.keys[code] === true;
    }
    
    /**
     * Reset input state
     */
    reset() {
        this.keys = {};
        // Don't reset cheat state
    }
}

// Export the InputManager class
if (typeof window !== 'undefined') {
    window.InputManager = InputManager;
}
