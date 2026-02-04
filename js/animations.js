// Ramadan Quests - Animations & Visual Effects
// ==============================================

// Confetti Animation
function createConfetti() {
    const confettiContainer = document.getElementById('confettiContainer');
    const colors = ['#00a896', '#f4a259', '#6a4c93', '#4caf50', '#ff9800'];
    const shapes = ['circle', 'square', 'triangle'];
    const emojis = ['⭐', '🌙', '✨', '🎉', '🎊', '💫'];
    
    // Create 50 confetti pieces
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            
            // Random choice between geometric shapes and emojis
            const useEmoji = Math.random() > 0.5;
            
            if (useEmoji) {
                confetti.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                confetti.style.cssText = `
                    position: absolute;
                    top: -20px;
                    left: ${Math.random() * 100}%;
                    font-size: ${Math.random() * 20 + 15}px;
                    animation: confetti-fall ${Math.random() * 2 + 3}s linear forwards;
                    z-index: 9999;
                    pointer-events: none;
                `;
            } else {
                const shape = shapes[Math.floor(Math.random() * shapes.length)];
                const color = colors[Math.floor(Math.random() * colors.length)];
                
                confetti.style.cssText = `
                    position: absolute;
                    top: -20px;
                    left: ${Math.random() * 100}%;
                    width: ${Math.random() * 10 + 5}px;
                    height: ${Math.random() * 10 + 5}px;
                    background: ${color};
                    animation: confetti-fall ${Math.random() * 2 + 3}s linear forwards;
                    z-index: 9999;
                    pointer-events: none;
                `;
                
                if (shape === 'circle') {
                    confetti.style.borderRadius = '50%';
                } else if (shape === 'triangle') {
                    confetti.style.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
                }
            }
            
            confettiContainer.appendChild(confetti);
            
            // Remove confetti after animation
            setTimeout(() => {
                confetti.remove();
            }, 5000);
        }, i * 50);
    }
}

// Sparkle Effect for Elements
function addSparkleEffect(element) {
    const sparkle = document.createElement('div');
    sparkle.innerHTML = '✨';
    sparkle.style.cssText = `
        position: absolute;
        top: ${Math.random() * 100}%;
        left: ${Math.random() * 100}%;
        font-size: ${Math.random() * 20 + 10}px;
        animation: sparkle-fade 1s ease-out forwards;
        pointer-events: none;
        z-index: 1000;
    `;
    
    element.style.position = 'relative';
    element.appendChild(sparkle);
    
    setTimeout(() => sparkle.remove(), 1000);
}

// Add sparkle animation CSS
const sparkleStyle = document.createElement('style');
sparkleStyle.textContent = `
    @keyframes sparkle-fade {
        0% {
            opacity: 1;
            transform: scale(0) rotate(0deg);
        }
        50% {
            opacity: 1;
            transform: scale(1.2) rotate(180deg);
        }
        100% {
            opacity: 0;
            transform: scale(0.5) rotate(360deg);
        }
    }
`;
document.head.appendChild(sparkleStyle);

// Pulse Animation for Important Elements
function pulseElement(element) {
    element.style.animation = 'pulse-scale 0.6s ease-in-out';
    
    setTimeout(() => {
        element.style.animation = '';
    }, 600);
}

// Add pulse animation CSS
const pulseStyle = document.createElement('style');
pulseStyle.textContent = `
    @keyframes pulse-scale {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.1);
        }
    }
`;
document.head.appendChild(pulseStyle);

// Shake Animation for Errors or Attention
function shakeElement(element) {
    element.style.animation = 'shake 0.5s ease-in-out';
    
    setTimeout(() => {
        element.style.animation = '';
    }, 500);
}

// Add shake animation CSS
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(shakeStyle);

// Badge Unlock Animation
function animateBadgeUnlock(badgeElement) {
    badgeElement.style.animation = 'badge-unlock 1s ease-out forwards';
}

// Add badge unlock animation CSS
const badgeStyle = document.createElement('style');
badgeStyle.textContent = `
    @keyframes badge-unlock {
        0% {
            transform: scale(0) rotate(-180deg);
            opacity: 0;
        }
        50% {
            transform: scale(1.2) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
        }
    }
`;
document.head.appendChild(badgeStyle);

// Number Counter Animation
function animateCounter(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16); // 60fps
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

// Progress Bar Fill Animation
function animateProgressBar(progressBar, targetWidth) {
    progressBar.style.transition = 'width 1s ease-out';
    setTimeout(() => {
        progressBar.style.width = targetWidth + '%';
    }, 100);
}

// Floating Animation for Elements
function makeElementFloat(element) {
    element.style.animation = 'float 3s ease-in-out infinite';
}

// Card Flip Animation
function flipCard(card) {
    card.style.animation = 'flip-card 0.6s ease-in-out';
    
    setTimeout(() => {
        card.style.animation = '';
    }, 600);
}

// Add flip animation CSS
const flipStyle = document.createElement('style');
flipStyle.textContent = `
    @keyframes flip-card {
        0% { transform: rotateY(0deg); }
        50% { transform: rotateY(90deg); }
        100% { transform: rotateY(0deg); }
    }
`;
document.head.appendChild(flipStyle);

// Slide In Animation for Elements
function slideInElement(element, direction = 'left') {
    const directions = {
        'left': 'translateX(-100%)',
        'right': 'translateX(100%)',
        'top': 'translateY(-100%)',
        'bottom': 'translateY(100%)'
    };
    
    element.style.transform = directions[direction];
    element.style.opacity = '0';
    element.style.transition = 'transform 0.5s ease-out, opacity 0.5s ease-out';
    
    setTimeout(() => {
        element.style.transform = 'translate(0, 0)';
        element.style.opacity = '1';
    }, 100);
}

// Bounce Animation
function bounceElement(element) {
    element.style.animation = 'bounce-effect 0.6s ease-in-out';
    
    setTimeout(() => {
        element.style.animation = '';
    }, 600);
}

// Add bounce animation CSS
const bounceStyle = document.createElement('style');
bounceStyle.textContent = `
    @keyframes bounce-effect {
        0%, 100% { transform: translateY(0); }
        25% { transform: translateY(-20px); }
        50% { transform: translateY(-10px); }
        75% { transform: translateY(-15px); }
    }
`;
document.head.appendChild(bounceStyle);

// Glow Effect for Special Elements
function addGlowEffect(element, color = '#f4a259') {
    element.style.boxShadow = `0 0 20px ${color}, 0 0 40px ${color}`;
    element.style.transition = 'box-shadow 0.3s ease';
    
    setTimeout(() => {
        element.style.boxShadow = '';
    }, 2000);
}

// Particle Burst Effect
function createParticleBurst(x, y) {
    const particles = 15;
    const colors = ['#00a896', '#f4a259', '#6a4c93'];
    
    for (let i = 0; i < particles; i++) {
        const particle = document.createElement('div');
        const angle = (Math.PI * 2 * i) / particles;
        const velocity = Math.random() * 100 + 50;
        
        particle.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: 8px;
            height: 8px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: 50%;
            pointer-events: none;
            z-index: 10000;
        `;
        
        document.body.appendChild(particle);
        
        const dx = Math.cos(angle) * velocity;
        const dy = Math.sin(angle) * velocity;
        
        let currentX = x;
        let currentY = y;
        let opacity = 1;
        
        const animateParticle = () => {
            currentX += dx * 0.05;
            currentY += dy * 0.05 + 2; // Gravity effect
            opacity -= 0.02;
            
            particle.style.left = currentX + 'px';
            particle.style.top = currentY + 'px';
            particle.style.opacity = opacity;
            
            if (opacity > 0) {
                requestAnimationFrame(animateParticle);
            } else {
                particle.remove();
            }
        };
        
        animateParticle();
    }
}

// Typing Effect for Text
function typeText(element, text, speed = 50) {
    element.textContent = '';
    let index = 0;
    
    const typeInterval = setInterval(() => {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            index++;
        } else {
            clearInterval(typeInterval);
        }
    }, speed);
}

// Fade In/Out Effects
function fadeIn(element, duration = 500) {
    element.style.opacity = '0';
    element.style.transition = `opacity ${duration}ms ease-in`;
    
    setTimeout(() => {
        element.style.opacity = '1';
    }, 10);
}

function fadeOut(element, duration = 500) {
    element.style.transition = `opacity ${duration}ms ease-out`;
    element.style.opacity = '0';
    
    setTimeout(() => {
        element.style.display = 'none';
    }, duration);
}

// Loading Spinner
function showLoadingSpinner(container) {
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    spinner.innerHTML = '🌙';
    spinner.style.cssText = `
        font-size: 3rem;
        animation: spin 2s linear infinite;
        text-align: center;
        padding: 2rem;
    `;
    
    container.appendChild(spinner);
    return spinner;
}

// Add spin animation CSS
const spinStyle = document.createElement('style');
spinStyle.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(spinStyle);

// Intersection Observer for Scroll Animations
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe all quest cards, badge cards, etc.
    document.querySelectorAll('.quest-card, .badge-card, .stat-card, .resource-card').forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(50px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });
}

// Initialize scroll animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(setupScrollAnimations, 500);
});

// Ripple Effect on Click
function createRipple(event, element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.5);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple-effect 0.6s ease-out;
        pointer-events: none;
    `;
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}

// Add ripple animation CSS
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple-effect {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// Add ripple effect to buttons
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function(e) {
            createRipple(e, this);
        });
    });
});

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createConfetti,
        addSparkleEffect,
        pulseElement,
        shakeElement,
        animateBadgeUnlock,
        animateCounter,
        animateProgressBar,
        makeElementFloat,
        flipCard,
        slideInElement,
        bounceElement,
        addGlowEffect,
        createParticleBurst,
        typeText,
        fadeIn,
        fadeOut,
        showLoadingSpinner,
        setupScrollAnimations,
        createRipple
    };
}