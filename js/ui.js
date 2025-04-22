// ui.js - User interface elements and rendering

/**
 * UIManager class for handling game UI
 */
class UIManager {
    /**
     * Create a new UIManager
     * @param {Object} config - Game configuration
     */
    constructor(config) {
        this.config = config;
        this.scoreElement = document.getElementById('score');
        this.livesElement = document.getElementById('lives');
    }
    
    /**
     * Update score display
     * @param {number} score - Current score
     * @param {number} currentLevel - Current level
     */
    updateScoreDisplay(score, currentLevel) {
        if (this.scoreElement) {
            this.scoreElement.textContent = `Score: ${score} | Level: ${currentLevel}`;
        }
    }
    
    /**
     * Update lives display
     * @param {number} lives - Current lives
     */
    updateLivesDisplay(lives) {
        if (this.livesElement) {
            this.livesElement.textContent = `Lives: ${lives}`;
        }
    }
    
    /**
     * Show message overlay
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string} text - Message text
     * @param {boolean} levelSelectionMode - Whether in level selection mode
     * @param {number} currentLevel - Current level
     * @param {boolean} bossDefeated - Whether boss is defeated
     * @param {number} speedMultiplier - Current speed multiplier
     */
    showMessage(ctx, text, levelSelectionMode, currentLevel, bossDefeated, speedMultiplier) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Main title - larger font and centered
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(text, ctx.canvas.width / 2, ctx.canvas.height / 2 - 80);
        
        if (levelSelectionMode) {
            this.drawLevelSelection(ctx, currentLevel);
        } else {
            this.drawGameMessage(ctx, bossDefeated, currentLevel, speedMultiplier);
        }
    }
    
    /**
     * Draw level selection UI
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} currentLevel - Current level
     */
    drawLevelSelection(ctx, currentLevel) {
        // Level selection instructions
        ctx.font = '22px Arial';
        ctx.fillText('Select a level:', ctx.canvas.width / 2, ctx.canvas.height / 2);
        
        // Button dimensions
        const buttonWidth = 240;  // Wider buttons to fit text
        const buttonHeight = 40;
        const buttonY = ctx.canvas.height / 2 + 30;
        const buttonSpacing = 20;
        
        // Level 1 button
        ctx.fillStyle = currentLevel === 1 ? '#4CAF50' : '#3498db';
        ctx.fillRect(ctx.canvas.width / 2 - buttonWidth/2, buttonY, buttonWidth, buttonHeight);
        
        // Set smaller font for button text
        ctx.font = '16px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('Level 1: Beginner', ctx.canvas.width / 2, buttonY + 25);
        
        // Level 2 button
        ctx.fillStyle = currentLevel === 2 ? '#4CAF50' : '#3498db';
        ctx.fillRect(ctx.canvas.width / 2 - buttonWidth/2, buttonY + buttonHeight + buttonSpacing, buttonWidth, buttonHeight);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('Level 2: Lava Challenge', ctx.canvas.width / 2, buttonY + buttonHeight + buttonSpacing + 25);
        
        // Level 3 button
        ctx.fillStyle = currentLevel === 3 ? '#4CAF50' : '#3498db';
        ctx.fillRect(ctx.canvas.width / 2 - buttonWidth/2, buttonY + (buttonHeight + buttonSpacing) * 2, buttonWidth, buttonHeight);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('Level 3: Cherry Chaos', ctx.canvas.width / 2, buttonY + (buttonHeight + buttonSpacing) * 2 + 25);
        
        // Level 4 button
        ctx.fillStyle = currentLevel === 4 ? '#4CAF50' : '#3498db';
        ctx.fillRect(ctx.canvas.width / 2 - buttonWidth/2, buttonY + (buttonHeight + buttonSpacing) * 3, buttonWidth, buttonHeight);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('Level 4: Ultimate Challenge', ctx.canvas.width / 2, buttonY + (buttonHeight + buttonSpacing) * 3 + 25);
        
        // Instructions
        ctx.font = '14px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('Click on a level to start, or press 1-4 on keyboard', ctx.canvas.width / 2, buttonY + (buttonHeight + buttonSpacing) * 4);
    }
    
    /**
     * Draw game message UI
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {boolean} bossDefeated - Whether boss is defeated
     * @param {number} currentLevel - Current level
     * @param {number} speedMultiplier - Current speed multiplier
     */
    drawGameMessage(ctx, bossDefeated, currentLevel, speedMultiplier) {
        const centerY = ctx.canvas.height / 2;
        
        // Regular game message
        ctx.font = '22px Arial';
        ctx.fillText('Click anywhere to play', ctx.canvas.width / 2, centerY);
        
        // Controls info - condensed to one line, smaller font
        ctx.font = '16px Arial';
        ctx.fillText('Controls: WASD/Arrows to move, Space/W/Up to double jump', ctx.canvas.width / 2, centerY + 40);
        
        if (bossDefeated) {
            ctx.fillStyle = '#FFFF00';
            ctx.fillText('Boss defeated! Congratulations!', ctx.canvas.width / 2, centerY + 80);
            
            if (currentLevel > 1) {
                ctx.fillStyle = '#00FF00';
                ctx.fillText('Next level: ' + Math.round((speedMultiplier - 0.85) * 100 / 0.85) + '% faster', ctx.canvas.width / 2, centerY + 110);
            }
        }
        
        // Level-specific info
        if (currentLevel === 2) {
            ctx.fillStyle = '#FF4500';
            ctx.fillText('LEVEL 2: Watch out for LAVA GAPS!', ctx.canvas.width / 2, centerY + 140);
        } else if (currentLevel === 3) {
            ctx.fillStyle = '#FF0066';
            ctx.fillText('LEVEL 3: Cherry Chaos - Beware the cherry enemies!', ctx.canvas.width / 2, centerY + 140);
        }
    }
    
    /**
     * Show cheat activated message
     */
    showCheatActivatedMessage() {
        // Show cheat activated message
        const cheatMessage = document.createElement('div');
        cheatMessage.textContent = '🎮 CHEAT ACTIVATED: 999 LIVES! 🎮';
        cheatMessage.style.position = 'absolute';
        cheatMessage.style.top = '100px';
        cheatMessage.style.left = '50%';
        cheatMessage.style.transform = 'translateX(-50%)';
        cheatMessage.style.backgroundColor = 'rgba(255, 215, 0, 0.8)';
        cheatMessage.style.color = '#FF0000';
        cheatMessage.style.padding = '10px 20px';
        cheatMessage.style.borderRadius = '5px';
        cheatMessage.style.fontWeight = 'bold';
        cheatMessage.style.fontSize = '20px';
        cheatMessage.style.zIndex = '1000';
        document.body.appendChild(cheatMessage);
        
        // Remove the message after 3 seconds
        setTimeout(() => {
            document.body.removeChild(cheatMessage);
        }, 3000);
    }
}

// Export the UIManager class
if (typeof window !== 'undefined') {
    window.UIManager = UIManager;
}
