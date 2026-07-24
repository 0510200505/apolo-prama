/* ==========================================================================
   Apollo Pharma Hub - Interactive Logic, Cart & Booking System
   ========================================================================== */

let cart = [];

document.addEventListener('DOMContentLoaded', () => {
  initStickyNavbar();
  initMobileMenu();
  initSmoothScroll();
  initProductFilters();
  initCartSystem();
  initBookingSystem();
  initContactForm();
});

/* Sticky Navbar & Active Section Highlighting */
function initStickyNavbar() {
  const navbar = document.querySelector('.navbar');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    let currentSectionId = '';
    const scrollPosition = window.scrollY + 200;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  });
}

/* Mobile Menu Toggle */
function initMobileMenu() {
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (!mobileToggle || !navLinks) return;

  mobileToggle.addEventListener('click', () => {
    navLinks.classList.toggle('mobile-open');
    const icon = mobileToggle.querySelector('i');
    if (icon) {
      if (navLinks.classList.contains('mobile-open')) {
        icon.className = 'fa-solid fa-xmark';
      } else {
        icon.className = 'fa-solid fa-bars';
      }
    }
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('mobile-open');
      const icon = mobileToggle.querySelector('i');
      if (icon) icon.className = 'fa-solid fa-bars';
    });
  });
}

/* Smooth Scrolling */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/* Product Category Filter Tabs */
function initProductFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      productCards.forEach(card => {
        const category = card.getAttribute('data-category');

        if (filterValue === 'all' || category === filterValue) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 250);
        }
      });
    });
  });
}

/* Cart Management System */
function initCartSystem() {
  const cartTrigger = document.getElementById('cart-trigger');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartCloseBtn = document.getElementById('cart-close-btn');

  if (cartTrigger) {
    cartTrigger.addEventListener('click', () => {
      cartDrawer.classList.add('active');
    });
  }

  if (cartCloseBtn) {
    cartCloseBtn.addEventListener('click', () => {
      cartDrawer.classList.remove('active');
    });
  }

  cartDrawer.addEventListener('click', (e) => {
    if (e.target === cartDrawer) {
      cartDrawer.classList.remove('active');
    }
  });

  // Attach event listeners to Add to Cart buttons
  document.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const name = btn.getAttribute('data-name');
      const price = parseFloat(btn.getAttribute('data-price'));

      addToCart(name, price);
    });
  });
}

function addToCart(name, price) {
  const existingItem = cart.find(item => item.name === name);

  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({ name, price, qty: 1 });
  }

  updateCartUI();
  showToast(`Added "${name}" to your medical cart!`, 'success');
}

function updateCartQuantity(name, change) {
  const item = cart.find(item => item.name === name);
  if (!item) return;

  item.qty += change;

  if (item.qty <= 0) {
    cart = cart.filter(i => i.name !== name);
  }

  updateCartUI();
}

function updateCartUI() {
  const cartCountEl = document.getElementById('cart-count');
  const cartItemsBody = document.getElementById('cart-items-body');
  const cartSubtotalEl = document.getElementById('cart-subtotal-val');

  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  if (cartCountEl) cartCountEl.textContent = totalCount;
  if (cartSubtotalEl) cartSubtotalEl.textContent = `$${subtotal.toFixed(2)}`;

  if (!cartItemsBody) return;

  if (cart.length === 0) {
    cartItemsBody.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); margin-top: 3rem;">
        <i class="fa-solid fa-cart-flatbed" style="font-size: 3rem; margin-bottom: 1rem; color: var(--accent-purple-glow);"></i>
        <p>Your medical shopping cart is currently empty.</p>
      </div>
    `;
    return;
  }

  cartItemsBody.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)} ($${item.price.toFixed(2)} each)</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="updateCartQuantity('${item.name}', -1)">-</button>
          <span style="font-weight: 700; font-size: 0.9rem;">${item.qty}</span>
          <button class="qty-btn" onclick="updateCartQuantity('${item.name}', 1)">+</button>
        </div>
      </div>
      <button onclick="updateCartQuantity('${item.name}', -${item.qty})" style="background:none; border:none; color:var(--text-muted); cursor:pointer;">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    </div>
  `).join('');
}

/* Booking / Order Modal System */
function initBookingSystem() {
  const modalBackdrop = document.getElementById('booking-modal');
  const modalClose = document.getElementById('booking-modal-close');
  const bookingForm = document.getElementById('booking-form');

  document.querySelectorAll('.btn-quick-book').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const prodName = btn.getAttribute('data-name') || 'Medical Service / Item';
      
      const itemField = document.getElementById('booking-item-name');
      if (itemField) itemField.value = prodName;

      modalBackdrop.classList.add('active');
    });
  });

  if (modalClose) {
    modalClose.addEventListener('click', () => {
      modalBackdrop.classList.remove('active');
    });
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        modalBackdrop.classList.remove('active');
      }
    });
  }

  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('booking-customer-name').value.trim();
      const item = document.getElementById('booking-item-name').value;

      if (!name) {
        showToast('Please enter your full name.', 'warning');
        return;
      }

      modalBackdrop.classList.remove('active');
      bookingForm.reset();
      showToast(`Order booking placed for "${item}". Our pharmacist will contact you shortly, ${name}!`, 'success');
    });
  }
}

// Global Checkout Handler for Cart Drawer
function handleCartCheckout() {
  if (cart.length === 0) {
    showToast('Your cart is empty! Add products before checking out.', 'warning');
    return;
  }

  const drawer = document.getElementById('cart-drawer');
  drawer.classList.remove('active');

  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  cart = [];
  updateCartUI();

  showToast(`Medical order successfully booked ($${total.toFixed(2)})! 24/7 Express Dispatch initiated.`, 'success');
}

/* Contact Form Validation & Toast Notifications */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const message = document.getElementById('contact-message').value.trim();

    if (!name || !email || !message) {
      showToast('Please fill in all required fields.', 'warning');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('Please enter a valid email address.', 'warning');
      return;
    }

    showToast(`Thank you, ${name}! Your request has been dispatched to our pharmacy team.`, 'success');
    form.reset();
  });
}

/* Toast Helper */
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  
  const iconClass = type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation';
  const iconColor = type === 'success' ? '#4ade80' : '#f59e0b';

  toast.innerHTML = `
    <i class="fa-solid ${iconClass}" style="color: ${iconColor}; font-size: 1.2rem;"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
