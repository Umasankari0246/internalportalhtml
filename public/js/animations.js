// Interactive Elements and Animations
class ShowbayAnimations {
  constructor() {
    this.init();
  }

  init() {
    this.setupSmoothScrolling();
    this.setupButtonInteractions();
    this.setupChatButton();
    this.setupScrollAnimations();
    this.setupParallaxEffects();
  }

  // Smooth scrolling for navigation links
  setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  // Button hover effects and click animations
  setupButtonInteractions() {
    const buttons = document.querySelectorAll('.nav-cta, .hero-cta');
    
    buttons.forEach(button => {
      // Ripple effect on click
      button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        // Add ripple styles if not already present
        if (!document.querySelector('#ripple-styles')) {
          const style = document.createElement('style');
          style.id = 'ripple-styles';
          style.textContent = `
            .ripple {
              position: absolute;
              border-radius: 50%;
              background: rgba(255, 255, 255, 0.6);
              transform: scale(0);
              animation: ripple 0.6s linear;
              pointer-events: none;
            }
            @keyframes ripple {
              to {
                transform: scale(4);
                opacity: 0;
              }
            }
            .nav-cta, .hero-cta {
              position: relative;
              overflow: hidden;
            }
          `;
          document.head.appendChild(style);
        }
        
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      });
    });
  }

  // Chat button functionality
  setupChatButton() {
    const chatButton = document.getElementById('chatButton');
    if (chatButton) {
      chatButton.addEventListener('click', () => {
        // Toggle chat window or open chat interface
        this.toggleChatWindow();
      });

      // Add pulse animation to chat button
      setInterval(() => {
        chatButton.style.animation = 'none';
        setTimeout(() => {
          chatButton.style.animation = 'pulse 2s infinite';
        }, 10);
      }, 10000);
    }
  }

  // Toggle chat window (placeholder for actual chat implementation)
  toggleChatWindow() {
    // Create chat window if it doesn't exist
    let chatWindow = document.getElementById('chatWindow');
    
    if (!chatWindow) {
      chatWindow = document.createElement('div');
      chatWindow.id = 'chatWindow';
      chatWindow.innerHTML = `
        <div class="chat-header">
          <h3>Chat with Showbay</h3>
          <button class="chat-close">&times;</button>
        </div>
        <div class="chat-body">
          <p>Hello! How can I help you transform your events with AI today?</p>
        </div>
        <div class="chat-input">
          <input type="text" placeholder="Type your message...">
          <button>Send</button>
        </div>
      `;
      
      // Add chat window styles
      const chatStyles = document.createElement('style');
      chatStyles.textContent = `
        #chatWindow {
          position: fixed;
          bottom: 100px;
          right: 2rem;
          width: 350px;
          height: 500px;
          background: rgba(26, 35, 126, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(79, 195, 247, 0.3);
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          z-index: 1001;
          animation: slideUp 0.3s ease;
        }
        .chat-header {
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .chat-header h3 {
          margin: 0;
          color: #4fc3f7;
          font-size: 1rem;
        }
        .chat-close {
          background: none;
          border: none;
          color: #b8c5d6;
          font-size: 1.5rem;
          cursor: pointer;
        }
        .chat-body {
          flex: 1;
          padding: 1rem;
          overflow-y: auto;
          color: #ffffff;
        }
        .chat-input {
          padding: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          gap: 0.5rem;
        }
        .chat-input input {
          flex: 1;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          padding: 0.5rem;
          color: #ffffff;
        }
        .chat-input button {
          background: #4fc3f7;
          color: #0a0e27;
          border: none;
          border-radius: 6px;
          padding: 0.5rem 1rem;
          cursor: pointer;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `;
      document.head.appendChild(chatStyles);
      document.body.appendChild(chatWindow);
      
      // Close button functionality
      chatWindow.querySelector('.chat-close').addEventListener('click', () => {
        chatWindow.remove();
      });
    } else {
      chatWindow.remove();
    }
  }

  // Scroll-triggered animations
  setupScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
        }
      });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.hero-content > *').forEach(el => {
      observer.observe(el);
    });

    // Add fadeInUp animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Parallax effects for background elements
  setupParallaxEffects() {
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const parallaxElements = document.querySelectorAll('.wireframe-cube, .particles-container');
      
      parallaxElements.forEach((el, index) => {
        const speed = index % 2 === 0 ? 0.5 : 0.3;
        const yPos = -(scrolled * speed);
        el.style.transform = `translateY(${yPos}px)`;
      });
    });
  }
}

// Wireframe cube 3D animation enhancement
class WireframeCube {
  constructor() {
    this.cube = document.getElementById('wireframeCube');
    if (this.cube) {
      this.enhanceCube();
    }
  }

  enhanceCube() {
    // Add additional 3D wireframe elements
    const cubeContent = `
      <div class="cube-face cube-front"></div>
      <div class="cube-face cube-back"></div>
      <div class="cube-face cube-left"></div>
      <div class="cube-face cube-right"></div>
      <div class="cube-face cube-top"></div>
      <div class="cube-face cube-bottom"></div>
    `;
    
    this.cube.innerHTML = cubeContent;
    
    // Add 3D cube styles
    const cubeStyles = document.createElement('style');
    cubeStyles.textContent = `
      .wireframe-cube {
        transform-style: preserve-3d;
      }
      .cube-face {
        position: absolute;
        width: 100%;
        height: 100%;
        border: 2px solid rgba(79, 195, 247, 0.6);
        background: rgba(79, 195, 247, 0.02);
      }
      .cube-front { transform: translateZ(75px); }
      .cube-back { transform: rotateY(180deg) translateZ(75px); }
      .cube-left { transform: rotateY(-90deg) translateZ(75px); }
      .cube-right { transform: rotateY(90deg) translateZ(75px); }
      .cube-top { transform: rotateX(90deg) translateZ(75px); }
      .cube-bottom { transform: rotateX(-90deg) translateZ(75px); }
    `;
    document.head.appendChild(cubeStyles);
  }
}

// Initialize all animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ShowbayAnimations();
  new WireframeCube();
});

// Export for use in other files
window.ShowbayAnimations = ShowbayAnimations;
window.WireframeCube = WireframeCube;
