// main.js - Main entry point for the game

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize utility functions
    window.GameUtils = {
        checkCollision: (obj1, obj2, buffer = { top: 0, right: 0, bottom: 0, left: 0 }) => {
            return (
                obj1.x + buffer.left < obj2.x + obj2.width - buffer.right &&
                obj1.x + obj1.width - buffer.left > obj2.x + buffer.right &&
                obj1.y + buffer.top < obj2.y + obj2.height - buffer.bottom &&
                obj1.y + obj1.height - buffer.top > obj2.y + buffer.bottom
            );
        },
        
        createCanvas: (width, height) => {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            return canvas;
        },
        
        safeDrawImage: (ctx, img, x, y, width, height, flipHorizontal = false) => {
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
        },
        
        createParticleEffect: (options) => {
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
    };
    
    // Initialize game
    const game = new GameEngine(CONFIG);
    game.init();
    
    // Add reload button
    const reloadButton = document.createElement('button');
    reloadButton.textContent = 'Reload Game';
    reloadButton.style.backgroundColor = '#9b59b6';
    reloadButton.addEventListener('click', () => {
        window.location.reload(true);
    });
    
    const controlsElement = document.getElementById('controls');
    if (controlsElement) {
        controlsElement.appendChild(reloadButton);
    }
});
