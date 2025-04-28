/**
 * UI management for the game
 */
import CONFIG from './config.js';

class UI {
    constructor(gameState) {
        this.gameState = gameState;
        this.scoreElement = document.getElementById('score');
        this.livesElement = document.getElementById('lives');
    }

    updateScoreDisplay() {
        this.scoreElement.textContent = `Score: ${this.gameState.score} | Level: ${this.gameState.currentLevel}`;
    }

    updateLivesDisplay() {
        this.livesElement.textContent = `Lives: ${this.gameState.lives}`;
    }

    showMessage(ctx, text, bossDefeated = false) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
        
        // Main title - smaller font
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(text, CONFIG.canvas.width / 2, CONFIG.canvas.height / 2 - 10);
        
        // Start instruction - smaller and closer
        ctx.font = '18px Arial';
        ctx.fillText('Press Start to play', CONFIG.canvas.width / 2, CONFIG.canvas.height / 2 + 20);
        
        // Controls info - condensed to one line, smaller font
        ctx.font = '14px Arial';
        ctx.fillText('Controls: WASD/Arrows to move, Space/W/Up to double jump', CONFIG.canvas.width / 2, CONFIG.canvas.height / 2 + 50);
        
        if (bossDefeated) {
            ctx.fillStyle = '#FFFF00';
            ctx.fillText('Boss defeated! Congratulations!', CONFIG.canvas.width / 2, CONFIG.canvas.height / 2 + 80);
            
            if (this.gameState.currentLevel > 1) {
                ctx.fillStyle = '#00FF00';
                const speedIncrease = Math.round((this.gameState.speedMultiplier - CONFIG.levels.level1.speedMultiplier) * 100 / CONFIG.levels.level1.speedMultiplier);
                ctx.fillText(`Next level: ${speedIncrease}% faster`, CONFIG.canvas.width / 2, CONFIG.canvas.height / 2 + 100);
            }
        }
        
        // Level-specific info
        if (this.gameState.currentLevel === 2) {
            ctx.fillStyle = '#FF4500';
            ctx.fillText('LEVEL 2: Watch out for LAVA GAPS!', CONFIG.canvas.width / 2, CONFIG.canvas.height / 2 + 120);
        }
    }
}

export default UI;
