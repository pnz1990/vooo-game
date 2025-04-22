// utils.js - Utility functions for the game

/**
 * Checks if two objects are colliding using bounding box collision detection
 * @param {Object} obj1 - First object with x, y, width, height properties
 * @param {Object} obj2 - Second object with x, y, width, height properties
 * @param {Object} buffer - Optional buffer to adjust collision boundaries
 * @returns {boolean} - True if objects are colliding
 */
function checkCollision(obj1, obj2, buffer = { top: 0, right: 0, bottom: 0, left: 0 }) {
    return (
        obj1.x + buffer.left < obj2.x + obj2.width - buffer.right &&
        obj1.x + obj1.width - buffer.left > obj2.x + buffer.right &&
        obj1.y + buffer.top < obj2.y + obj2.height - buffer.bottom &&
        obj1.y + obj1.height - buffer.top > obj2.y + buffer.bottom
    );
}

/**
 * Creates a canvas element with specified dimensions
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @returns {HTMLCanvasElement} - Created canvas element
 */
function createCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
}

/**
 * Safely draws an image with error handling
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {HTMLImageElement} img - Image to draw
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} width - Width to draw
 * @param {number} height - Height to draw
 * @param {boolean} flipHorizontal - Whether to flip the image horizontally
 */
function safeDrawImage(ctx, img, x, y, width, height, flipHorizontal = false) {
    try {
        if (flipHorizontal) {
            ctx.save();
            ctx.translate(x + width, y);
            ctx.scale(-1, 1);
            ctx.drawImage(img, 0, 0, width, height);
            ctx.restore();
        } else {
            ctx.drawImage(img, x, y, width, height);
        }
    } catch (e) {
        console.error("Error drawing image:", e);
        // Fallback to a colored rectangle
        ctx.fillStyle = '#FF6600';
        ctx.fillRect(x, y, width, height);
    }
}

/**
 * Creates a visual effect with particles
 * @param {Object} options - Effect options
 * @param {number} options.x - X position
 * @param {number} options.y - Y position
 * @param {number} options.count - Number of particles
 * @param {string} options.color - Particle color
 * @param {number} options.speed - Particle speed
 * @param {number} options.life - Particle lifetime
 * @param {Function} options.drawCallback - Function to draw particles
 */
function createParticleEffect(options) {
    const particles = [];
    const {
        x, 
        y, 
        count = 15, 
        color = '#FFFFFF', 
        speed = 3, 
        life = 20,
        drawCallback
    } = options;
    
    // Create particles
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const particleSpeed = Math.random() * speed + 2;
        const size = Math.random() * 5 + 3;
        
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * particleSpeed,
            vy: Math.sin(angle) * particleSpeed,
            size: size,
            color: color,
            life: life
        });
    }
    
    // Animation function
    function animate() {
        if (particles.length === 0) return;
        
        // Update and draw particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            
            // Update position
            p.x += p.vx;
            p.y += p.vy;
            
            // Apply gravity
            p.vy += 0.1;
            
            // Decrease life
            p.life--;
            
            // Remove dead particles
            if (p.life <= 0) {
                particles.splice(i, 1);
                continue;
            }
            
            // Draw particle using callback
            if (drawCallback) {
                drawCallback(p);
            }
        }
        
        // Continue animation if particles remain
        if (particles.length > 0) {
            requestAnimationFrame(animate);
        }
    }
    
    // Start animation
    animate();
}

// Export the utility functions
if (typeof module !== 'undefined') {
    module.exports = {
        checkCollision,
        createCanvas,
        safeDrawImage,
        createParticleEffect
    };
}
