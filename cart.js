// Shopping Cart and Auth Functionality
let cart = JSON.parse(localStorage.getItem('rodmarsh_cart')) || [];
let isLoggedIn = localStorage.getItem('rodmarsh_logged_in') === 'true';

// Notification System
function showNotification(message, type = 'success') {
    let container = document.querySelector('.notification-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';

    notification.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
    container.appendChild(notification);

    // Show
    setTimeout(() => notification.classList.add('show'), 10);

    // Remove
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;
    }
}

function saveCart() {
    localStorage.setItem('rodmarsh_cart', JSON.stringify(cart));
    updateCartCount();
}

function addToCart(id, name, price, image) {
    if (!isLoggedIn) {
        showNotification('Please login first to add products to your cart!', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }

    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id, name, price: parseFloat(price), image, quantity: 1 });
    }
    saveCart();
    showNotification(`${name} added to cart!`, 'success');
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    renderCart();
    showNotification('Item removed from cart.', 'info');
}

function updateQuantity(id, delta) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            removeFromCart(id);
        } else {
            saveCart();
            renderCart();
        }
    }
}

function renderCart() {
    const cartItemsElement = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    
    if (!cartItemsElement) return;

    if (cart.length === 0) {
        cartItemsElement.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 40px;">Your cart is empty. <br><br> <a href="products.html" class="btn">Shop Now</a></td></tr>';
        if (cartTotalElement) cartTotalElement.textContent = '₱0.00';
        return;
    }

    let total = 0;
    cartItemsElement.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        return `
            <tr>
                <td data-label="Image"><img src="${item.image}" alt="${item.name}" class="cart-item-image"></td>
                <td data-label="Product" style="font-weight: 600;">${item.name}</td>
                <td data-label="Price">₱${item.price.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                <td data-label="Quantity">
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                        <span class="quantity-value">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                    </div>
                </td>
                <td data-label="Subtotal" style="font-weight: bold;">₱${itemTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                <td data-label="Action"><button onclick="removeFromCart('${item.id}')" class="btn" style="padding: 8px 15px; background: #ff4d4d; font-size: 0.8rem;">Remove</button></td>
            </tr>
        `;
    }).join('');

    if (cartTotalElement) {
        cartTotalElement.textContent = `₱${total.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    }
}

function updateAuthUI() {
    const loginLinks = document.querySelectorAll('a[href="login.html"]');
    const authNavText = document.querySelector('nav ul li a[href="login.html"]');
    
    if (isLoggedIn) {
        if (authNavText) {
            authNavText.textContent = 'LOGOUT';
            authNavText.href = '#';
            authNavText.classList.add('logout-btn');
            authNavText.addEventListener('click', logout);
        }
        
        loginLinks.forEach(link => {
            if (link.querySelector('.fa-user')) {
                link.title = 'Logout';
                link.href = '#';
                link.classList.add('logout-btn');
                link.addEventListener('click', logout);
            }
        });
    }
}

function logout(e) {
    if (e) e.preventDefault();
    localStorage.setItem('rodmarsh_logged_in', 'false');
    isLoggedIn = false;
    showNotification('Logged out successfully!', 'info');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    updateAuthUI();

    // Mobile nav toggle for all pages
    const burgerButton = document.getElementById('burger-toggle');
    const nav = document.getElementById('main-nav');
    if (burgerButton && nav) {
        burgerButton.addEventListener('click', () => {
            nav.classList.toggle('mobile-open');
            const isExpanded = nav.classList.contains('mobile-open');
            burgerButton.setAttribute('aria-expanded', String(isExpanded));
        });

        nav.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                nav.classList.remove('mobile-open');
                burgerButton.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // Add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const { id, name, price, image } = e.target.dataset;
            addToCart(id, name, price, image);
        });
    });

    // Render cart if on cart page
    if (window.location.pathname.includes('cart.html')) {
        renderCart();
    }

    // Handle checkout button
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (!isLoggedIn) {
                showNotification('Please login first to checkout!', 'error');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
                return;
            }
            if (cart.length === 0) {
                showNotification('Your cart is empty!', 'error');
                return;
            }
            // In a real app, this would send data to a server
            localStorage.setItem('last_order', JSON.stringify({
                items: cart,
                total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                date: new Date().toLocaleDateString()
            }));
            cart = [];
            saveCart();
            window.location.href = 'thankyou.html';
        });
    }

    // Login form handling (simple mock)
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            localStorage.setItem('rodmarsh_logged_in', 'true');
            isLoggedIn = true;
            showNotification('Login successful! Welcome back to the Kingdom.', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        });
    }
});
