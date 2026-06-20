// ===================================
// DOM ELEMENTS
// ===================================
fetch('/api/contact')
const navbar = document.querySelector('.navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelectorAll('.nav-link');
const scrollIndicator = document.getElementById('scrollIndicator');
const scrollProjects = document.getElementById('scrollProjects');
const downloadCV = document.getElementById('downloadCV');
const contactForm = document.getElementById('contactForm');

// ===================================
// NAVIGATION
// ===================================

// Navbar scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Smooth scroll navigation
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Hamburger menu (future mobile support)
hamburger.addEventListener('click', () => {
    // Will be implemented when nav-links are made mobile responsive
    console.log('Mobile menu toggled');
});

// ===================================
// BUTTON ACTIONS
// ===================================

scrollProjects.addEventListener('click', () => {
    const projectsSection = document.getElementById('projects');
    projectsSection.scrollIntoView({ behavior: 'smooth' });
});

downloadCV.addEventListener('click', () => {
    // Simulate CV download
    alert('CV download initiated. In a real scenario, this would download a PDF file.');
    // You can replace with actual file download:
    // const link = document.createElement('a');
    // link.href = 'path/to/cv.pdf';
    // link.download = 'Your_CV.pdf';
    // link.click();
});

// ===================================
// SCROLL INDICATOR
// ===================================

window.addEventListener('scroll', () => {
    const heroSection = document.querySelector('.hero');
    if (window.scrollY > heroSection.offsetHeight - 200) {
        scrollIndicator.style.opacity = '0';
        scrollIndicator.style.pointerEvents = 'none';
    } else {
        scrollIndicator.style.opacity = '1';
        scrollIndicator.style.pointerEvents = 'auto';
    }
});

// ===================================
// CONTACT FORM
// ===================================

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    
    // Validate form
    if (!name || !email || !subject || !message) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    // Validate email
    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email', 'error');
        return;
    }
    
    // Prepare form data
    const formData = {
        name,
        email,
        subject,
        message,
        timestamp: new Date().toISOString()
    };
    
    // Send to backend
    sendFormData(formData);
});

// ===================================
// FORM UTILITIES
// ===================================

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#00ff88' : '#ff4444'};
        color: ${type === 'success' ? '#000' : '#fff'};
        padding: 1rem 1.5rem;
        border-radius: 6px;
        font-weight: 600;
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

async function sendFormData(formElement, formData) {
    const submitBtn = formElement.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    try {
        // Show loading state
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        const response = await fetch('/your-endpoint', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const result = await response.json();
        console.log('Success:', result);
        // Handle success (e.g., clear form, show message)
    } catch (error) {
        console.error('Error:', error);
        // Handle error (e.g., show error message)
    } finally {
        // Re-enable button and reset text
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

    
}
        
        // Send to backend
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
            contactForm.reset();
        } else {
            showNotification('Failed to send message. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error sending form:', error);
        showNotification('An error occurred. Please try again later.', 'error');
    } finally {
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// ===================================
// INTERSECTION OBSERVER FOR ANIMATIONS
// ===================================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'slideInUp 0.6s ease-out forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe skill cards
document.querySelectorAll('.skill-category').forEach(card => {
    observer.observe(card);
});

// Observe project cards
document.querySelectorAll('.project-card').forEach(card => {
    observer.observe(card);
});

// ===================================
// LAZY LOADING IMAGES (Future enhancement)
// ===================================

if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ===================================
// KEYBOARD NAVIGATION
// ===================================

document.addEventListener('keydown', (e) => {
    // Escape key - close mobile menu (if implemented)
    if (e.key === 'Escape') {
        // Handle escape
    }
    
    // Keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
        if (e.key === '/') {
            e.preventDefault();
            // Could open search or command palette
            console.log('Command palette could open here');
        }
    }
});

// ===================================
// PERFORMANCE OPTIMIZATION
// ===================================

// Debounce function for scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ===================================
// ANALYTICS (Optional - can be replaced with actual analytics)
// ===================================

class Analytics {
    constructor() {
        this.events = [];
    }
    
    trackEvent(eventName, eventData = {}) {
        const event = {
            name: eventName,
            timestamp: new Date().toISOString(),
            data: eventData
        };
        this.events.push(event);
        console.log('Event tracked:', event);
    }
    
    trackPageView(pageName) {
        this.trackEvent('page_view', { page: pageName });
    }
    
    trackButtonClick(buttonName) {
        this.trackEvent('button_click', { button: buttonName });
    }
}

const analytics = new Analytics();

// Track page views
window.addEventListener('load', () => {
    analytics.trackPageView('portfolio');
});

// Track button clicks
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', () => {
        analytics.trackButtonClick(btn.textContent);
    });
});

// ===================================
// THEME TOGGLE (Optional enhancement)
// ===================================

class ThemeManager {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'dark';
        this.applyTheme();
    }
    
    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', this.theme);
        this.applyTheme();
    }
    
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
    }
}

// Initialize theme manager (uncomment to use)
// const themeManager = new ThemeManager();

// ===================================
// UTILITY FUNCTIONS
// ===================================

// Get element by ID
function getElementByIdSafe(id) {
    return document.getElementById(id) || null;
}

// Add event listener safely
function addEventListenerSafe(selector, event, handler) {
    const element = document.querySelector(selector);
    if (element) {
        element.addEventListener(event, handler);
    }
}

// Add CSS animations dynamically
function addAnimation(element, animationName, duration = 0.6) {
    element.style.animation = `${animationName} ${duration}s ease-out forwards`;
}

// ===================================
// SERVICE WORKER (Optional - for PWA support)
// ===================================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment to register service worker
        // navigator.serviceWorker.register('/service-worker.js')
        //     .then(reg => console.log('Service Worker registered'))
        //     .catch(err => console.log('Service Worker registration failed'));
    });
}

// ===================================
// INITIALIZATION
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Portfolio website loaded successfully');
    
    // Initialize tooltips if present
    initializeTooltips();
    
    // Setup animations
    setupAnimations();
});

function initializeTooltips() {
    // Tooltip functionality can be added here
    console.log('Tooltips initialized');
}

function setupAnimations() {
    // Additional animation setup can be added here
    console.log('Animations setup complete');
}

// Add CSS animation keyframes dynamically if needed
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(30px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(30px);
        }
    }
`;
document.head.appendChild(style);