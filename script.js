// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeAnimations();
    initializeWidgets();
    initializeForms();
});

// Initialize Animations
function initializeAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => {
                    entry.target.classList.add('fade-in');
                }, delay);
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.feature-item, .widget').forEach(el => {
        observer.observe(el);
    });
}

// Initialize Interactive Widgets
function initializeWidgets() {
    const widgets = document.querySelectorAll('.widget');
    
    widgets.forEach(widget => {
        const route = widget.dataset.route;
        const delay = parseInt(widget.dataset.delay) || 0;
        
        // Add staggered animation
        setTimeout(() => {
            widget.classList.add('fade-in');
        }, delay);
        
        // Add click handler
        widget.addEventListener('click', function() {
            // Add click animation
            this.style.transform = 'translateY(-4px) scale(0.98)';
            
            // Navigate after animation
            setTimeout(() => {
                window.location.href = route;
            }, 200);
        });
        
        // Add hover sound effect (optional)
        widget.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        widget.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Initialize Forms (for booking pages)
function initializeForms() {
    // Date inputs - set minimum date to today
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const today = new Date().toISOString().split('T')[0];
    
    dateInputs.forEach(input => {
        input.min = today;
    });

    // Form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', handleFormSubmit);
    });
}

// Handle form submission
// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    // Basic validation (unchanged)
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.style.borderColor = '#ef4444';
            field.addEventListener('input', () => field.style.borderColor = '');
        }
    });
    if (!isValid) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    addLoadingState(submitBtn, 'Processing...');

    try {
        let url = '';
        let method = 'POST';

        // choose correct endpoint by form id or data-action
        switch (form.id) {
            case 'signupForm':
                url = 'http://127.0.0.1:5000/signup';
                break;
            case 'loginForm':
                // login is GET
                url = `http://127.0.0.1:5000/login?username=${data.username}&password=${data.password}`;
                method = 'GET';
                break;
            case 'flightForm':
                url = 'http://127.0.0.1:5000/book_flight';
                break;
            case 'trainForm':
                url = 'http://127.0.0.1:5000/book_train';
                break;
            case 'cabForm':
                url = 'http://127.0.0.1:5000/book_cab';
                break;
            default:
                showNotification('Unknown form', 'error');
                removeLoadingState(submitBtn);
                return;
        }

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: method === 'POST' ? JSON.stringify(data) : null
        });

        const result = await res.json();
        showNotification(result.message, res.ok ? 'success' : 'error');

        if (res.ok && form.id === 'loginForm') {
            setTimeout(() => window.location.href = 'flights.html', 1000);
        }
    } catch (err) {
        console.error(err);
        showNotification('Server error, try again.', 'error');
    } finally {
        removeLoadingState(submitBtn);
    }
}


// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '0.5rem',
        color: 'white',
        fontWeight: '500',
        zIndex: '9999',
        transform: 'translateX(400px)',
        transition: 'transform 0.3s ease',
        maxWidth: '300px'
    });
    
    // Set background color based on type
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#3b82f6'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Smooth scrolling for anchor links
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

// Page transition effect
function initPageTransition() {
    document.body.classList.add('page-transition');
}

// Mobile menu toggle (if needed)
function toggleMobileMenu() {
    const mobileMenu = document.querySelector('.mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('active');
    }
}

// Utility functions
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

// Add loading states to buttons
function addLoadingState(button, text = 'Loading...') {
    button.dataset.originalText = button.textContent;
    button.textContent = text;
    button.disabled = true;
    button.classList.add('loading');
}

function removeLoadingState(button) {
    button.textContent = button.dataset.originalText;
    button.disabled = false;
    button.classList.remove('loading');
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPageTransition);
} else {
    initPageTransition();
}
