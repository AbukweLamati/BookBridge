/* =============================================
   BOOKBRIDGE — CART & WISHLIST FUNCTIONS
   ============================================= */

/* ── Storage helpers ── */
function getCart() {
  try { return JSON.parse(localStorage.getItem('bb_cart') || '[]'); } catch { return []; }
}
function saveCart(cart) {
  localStorage.setItem('bb_cart', JSON.stringify(cart));
  updateBadges();
}
function getWishlist() {
  try { return JSON.parse(localStorage.getItem('bb_wishlist') || '[]'); } catch { return []; }
}
function saveWishlist(wl) {
  localStorage.setItem('bb_wishlist', JSON.stringify(wl));
  updateBadges();
}

/* ── Badge updater ── */
function updateBadges() {
  const cartCount = getCart().reduce((s, i) => s + (i.quantity || 1), 0);
  const wlCount   = getWishlist().length;

  document.querySelectorAll('.cart-badge').forEach(el => {
    el.textContent = cartCount;
    el.style.display = cartCount > 0 ? 'inline-block' : 'none';
  });
  document.querySelectorAll('.wishlist-badge').forEach(el => {
    el.textContent = wlCount;
    el.style.display = wlCount > 0 ? 'inline-block' : 'none';
  });
}

/* ── Toast notification ── */
function showToast(msg, type = 'cart') {
  // Remove existing toast
  const old = document.getElementById('bb-toast');
  if (old) old.remove();

  const toast = document.createElement('div');
  toast.id = 'bb-toast';
  const icon = type === 'wishlist' ? '♥' : '🛒';
  toast.innerHTML = `<span style="margin-right:6px;">${icon}</span>${msg}`;
  toast.style.cssText = `
    position:fixed;bottom:28px;right:28px;z-index:9999;
    background:#1C1C1C;color:#fff;padding:12px 20px;
    border-radius:8px;font-family:'Poppins',sans-serif;font-size:13px;font-weight:600;
    border-left:4px solid #C1440E;box-shadow:0 6px 24px rgba(0,0,0,0.35);
    animation:toastIn 0.3s ease forwards;
  `;
  // Inject keyframe if not present
  if (!document.getElementById('toast-style')) {
    const s = document.createElement('style');
    s.id = 'toast-style';
    s.textContent = `
      @keyframes toastIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
      @keyframes toastOut{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(16px)}}
    `;
    document.head.appendChild(s);
  }
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 2200);
}

/* ── Add to cart ── */
function addToCart(book) {
  const cart = getCart();
  const existing = cart.find(i => i.id === book.id);
  if (existing) {
    existing.quantity = (existing.quantity || 1) + 1;
    showToast('Quantity updated in cart!');
  } else {
    cart.push({ ...book, quantity: 1 });
    showToast('Added to cart!');
  }
  saveCart(cart);
  // Animate button
  const btn = document.querySelector(`[data-id="${book.id}"].btn-cart`);
  if (btn) {
    btn.textContent = 'Added ✓';
    btn.style.background = '#4A6741';
    setTimeout(() => {
      btn.textContent = 'Add to Cart 🛒';
      btn.style.background = '';
    }, 1500);
  }
}

/* ── Toggle wishlist ── */
function toggleWishlist(book) {
  const wl = getWishlist();
  const idx = wl.findIndex(i => i.id === book.id);
  const btn = document.querySelector(`[data-id="${book.id}"].btn-wishlist`);
  if (idx === -1) {
    wl.push(book);
    showToast('Added to wishlist!', 'wishlist');
    if (btn) { btn.innerHTML = '&#9829;'; btn.classList.add('active'); }
  } else {
    wl.splice(idx, 1);
    showToast('Removed from wishlist', 'wishlist');
    if (btn) { btn.innerHTML = '&#9825;'; btn.classList.remove('active'); }
  }
  saveWishlist(wl);
}

/* ── Sync wishlist button states on page load ── */
function syncWishlistButtons() {
  const wl = getWishlist();
  document.querySelectorAll('.btn-wishlist').forEach(btn => {
    const id = btn.getAttribute('data-id');
    if (wl.find(i => i.id === id)) {
      btn.innerHTML = '&#9829;';
      btn.classList.add('active');
    } else {
      btn.innerHTML = '&#9825;';
      btn.classList.remove('active');
    }
  });
}

/* ── Init on every page ── */
document.addEventListener('DOMContentLoaded', () => {
  updateBadges();
  syncWishlistButtons();
});