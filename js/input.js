/**
 * Input handling for the game
 */

class InputHandler {
    constructor(game) {
        this.game = game;
        this.keys = {};
        
        // Set up event listeners
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
        
        // Add button event listeners
        const startButton = document.getElementById('startButton');
        if (startButton) {
            startButton.addEventListener('click', this.handleStartClick.bind(this));
        }
    }

    handleKeyDown(e) {
        // Only register key press if it wasn't already pressed (prevents holding key to spam jump)
        if (!this.keys[e.code]) {
            this.keys[e.code] = true;
            
            // Handle jump key press
            if ((e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') && this.game.gameRunning) {
                this.game.handleJump();
            }
        }
        
        // Prevent default for arrow keys and space to avoid page scrolling
        if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
            e.preventDefault();
        }
    }

    handleKeyUp(e) {
        this.keys[e.code] = false;
    }

    handleStartClick() {
        this.game.startGame();
    }
}

export default InputHandler;
