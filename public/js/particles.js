// Particle Animation System
class ParticleSystem {
  constructor() {
    this.container = document.getElementById('particles');
    this.particles = [];
    this.particleCount = 50;
    this.init();
  }

  init() {
    if (!this.container) return;
    
    for (let i = 0; i < this.particleCount; i++) {
      this.createParticle();
    }
  }

  createParticle() {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random size
    const size = Math.random() * 4 + 2;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    
    // Random position
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    
    // Random animation delay and duration
    particle.style.animationDelay = `${Math.random() * 6}s`;
    particle.style.animationDuration = `${Math.random() * 4 + 4}s`;
    
    // Random opacity
    particle.style.opacity = Math.random() * 0.5 + 0.3;
    
    this.container.appendChild(particle);
    this.particles.push(particle);
  }

  // Optional: Add mouse interaction
  addMouseInteraction() {
    document.addEventListener('mousemove', (e) => {
      const mouseX = e.clientX / window.innerWidth;
      const mouseY = e.clientY / window.innerHeight;
      
      this.particles.forEach((particle, index) => {
        const speed = (index % 3 + 1) * 0.01;
        const x = (mouseX - 0.5) * speed * 100;
        const y = (mouseY - 0.5) * speed * 100;
        
        particle.style.transform = `translate(${x}px, ${y}px)`;
      });
    });
  }
}

// Initialize particle system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const particleSystem = new ParticleSystem();
  particleSystem.addMouseInteraction();
});

// Export for use in other files
window.ParticleSystem = ParticleSystem;
