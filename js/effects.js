// effects.js - Visual effects for the game

/**
 * EffectsManager class for creating and managing visual effects
 */
class EffectsManager {
    /**
     * Create a new EffectsManager
     * @param {Object} config - Game configuration
     */
    constructor(config) {
        this.config = config;
        this.effects = [];
    }
    
    /**
     * Create a double jump effect
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Function} drawCallback - Function to draw particles
     */
    createDoubleJumpEffect(x, y, drawCallback) {
        const { createParticleEffect } = window.GameUtils;
        
        createParticleEffect({
            x: x,
            y: y,
            count: 15,
            color: '#FFFFFF',
            speed: 3,
            life: 20,
            drawCallback: drawCallback
        });
    }
    
    /**
     * Create an enemy defeat effect
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} color - Particle color
     * @param {Function} drawCallback - Function to draw particles
     */
    createEnemyDefeatEffect(x, y, color, drawCallback) {
        const { createParticleEffect } = window.GameUtils;
        
        createParticleEffect({
            x: x,
            y: y,
            count: 20,
            color: color || '#FF0000',
            speed: 4,
            life: 30,
            drawCallback: drawCallback
        });
    }
    
    /**
     * Create a boss hit effect
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Function} drawCallback - Function to draw particles
     */
    createBossHitEffect(x, y, drawCallback) {
        const { createParticleEffect } = window.GameUtils;
        
        createParticleEffect({
            x: x,
            y: y,
            count: 30,
            color: '#FFFF00',
            speed: 5,
            life: 40,
            drawCallback: drawCallback
        });
    }
    
    /**
     * Create a level complete effect
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Function} drawCallback - Function to draw particles
     */
    createLevelCompleteEffect(x, y, drawCallback) {
        const { createParticleEffect } = window.GameUtils;
        
        // Create multiple particle bursts with different colors
        const colors = ['#FFFF00', '#00FF00', '#00FFFF', '#FF00FF'];
        
        colors.forEach((color, index) => {
            setTimeout(() => {
                createParticleEffect({
                    x: x,
                    y: y,
                    count: 40,
                    color: color,
                    speed: 6,
                    life: 60,
                    drawCallback: drawCallback
                });
            }, index * 200); // Stagger the effects
        });
    }
}

// Export the EffectsManager class
if (typeof window !== 'undefined') {
    window.EffectsManager = EffectsManager;
}
