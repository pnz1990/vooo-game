// Create explosion effect
function createExplosion(x, y) {
    // Create particles for explosion effect
    const particles = [];
    
    for (let i = 0; i < assets.explosion.particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * assets.explosion.particleSpeed + 1;
        const size = Math.random() * assets.explosion.particleSize + 2;
        const colorIndex = Math.floor(Math.random() * assets.explosion.colors.length);
        
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: size,
            color: assets.explosion.colors[colorIndex],
            life: assets.explosion.duration,
            gravity: 0.1,
            alpha: 1.0
        });
    }
    
    // Add explosion to the active explosions array
    explosions.push({
        particles: particles,
        x: x,
        y: y,
        duration: assets.explosion.duration,
        currentFrame: 0
    });
}

// Update explosions
function updateExplosions() {
    // Update each explosion
    for (let i = explosions.length - 1; i >= 0; i--) {
        const explosion = explosions[i];
        explosion.currentFrame++;
        
        // Remove explosion if it's finished
        if (explosion.currentFrame >= explosion.duration) {
            explosions.splice(i, 1);
            continue;
        }
        
        // Update each particle in the explosion
        for (let j = 0; j < explosion.particles.length; j++) {
            const particle = explosion.particles[j];
            
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Apply gravity
            particle.vy += particle.gravity;
            
            // Decrease life and alpha
            particle.life--;
            particle.alpha = particle.life / explosion.duration;
            
            // Decrease size slightly
            if (particle.size > 0.5) {
                particle.size -= 0.05;
            }
        }
    }
}

// Draw explosions
function drawExplosions() {
    explosions.forEach(explosion => {
        explosion.particles.forEach(particle => {
            const screenX = particle.x - cameraX;
            
            // Skip if off-screen
            if (screenX < -50 || screenX > canvas.width + 50) return;
            
            // Draw particle
            ctx.save();
            ctx.globalAlpha = particle.alpha;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(screenX, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    });
}
