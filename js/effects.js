/**
 * Visual effects for the game
 */

/**
 * Creates a particle effect for double jump
 * @param {Object} player - The player object
 * @param {number} cameraX - Current camera X position
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
 */
export function createDoubleJumpEffect(player, cameraX, ctx) {
    // Create particles for double jump effect
    const particleCount = 15;
    const particles = [];
    
    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 2;
        const size = Math.random() * 5 + 3;
        
        particles.push({
            x: player.x + player.width / 2,
            y: player.y + player.height,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: size,
            color: '#FFFFFF',
            life: 20
        });
    }
    
    // Animate particles
    function animateParticles() {
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
            
            // Draw particle
            const screenX = p.x - cameraX;
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life / 20;
            ctx.beginPath();
            ctx.arc(screenX, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
        
        // Continue animation if particles remain
        if (particles.length > 0) {
            requestAnimationFrame(animateParticles);
        }
    }
    
    // Start animation
    animateParticles();
}
