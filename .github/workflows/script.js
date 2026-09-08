const cartStorageKey = 'kedaiSenjaCart';
const favoritesStorageKey = 'kedaiSenjaFavorites';
function readStorage(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

let cart = readStorage(cartStorageKey, []);
let favorites = readStorage(favoritesStorageKey, []);
let currentCategory = 'all';
let discountPercent = 0;
const ownerNumber = '6289676375328';
const menuProducts = [
  { name: 'Signature Latte', category: 'coffee', price: 28000, image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=80', description: 'Espresso premium dengan susu creamy dan aroma lembut.' },
  { name: 'Caramel Macchiato', category: 'coffee', price: 32000, image: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=900&q=80', description: 'Perpaduan espresso, susu, dan caramel yang menggoda.' },
  { name: 'Americano', category: 'coffee', price: 22000, image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80', description: 'Espresso dengan air pilihan, clean dan strong.' },
  { name: 'Chocolate Cream', category: 'noncoffee', price: 27000, image: 'https://images.unsplash.com/photo-1572449043416-55f4685c9bb7?auto=format&fit=crop&w=900&q=80', description: 'Cokelat premium dengan cream lembut dan manis seimbang.' },
  { name: 'Beef Black Pepper', category: 'food', price: 48000, image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=900&q=80', description: 'Daging sapi juicy dengan saus lada hitam khas kedai.' },
  { name: 'Premium Pizza', category: 'food', price: 55000, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80', description: 'Pizza hangat dengan topping melimpah dan keju premium.' },
  { name: 'Golden Donut', category: 'dessert', price: 20000, image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=900&q=80', description: 'Donat lembut dengan glaze manis yang menggoda.' },
  { name: 'Chocolate Cake', category: 'dessert', price: 25000, image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80', description: 'Kue cokelat lembut dengan rasa rich dan premium.' }
];

const $ = (selector) => document.querySelector(selector);
const all = (selector) => document.querySelectorAll(selector);

function rupiah(number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
}

function saveCart() {
  localStorage.setItem(cartStorageKey, JSON.stringify(cart));
}

function calculateTotal() {
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const discount = subtotal * discountPercent / 100;
  return { subtotal, discount, total: subtotal - discount };
}

function updateCart() {
  const cartItems = $('#cart-items') || $('#cartItems');
  const cartCount = $('#cart-count') || $('#cartCount');
  const cartTotal = $('#cart-total') || $('#grandTotal');
  const subtotalElement = $('#subtotal');
  const discountElement = $('#discount');
  const discountRow = $('#discountRow');
  const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const discount = subtotal * discountPercent / 100;

  if (cartCount) cartCount.textContent = totalQuantity;
  if (cartCount) cartCount.parentElement?.setAttribute('aria-label', `Buka keranjang, ${totalQuantity} item`);
  if (subtotalElement) subtotalElement.textContent = rupiah(subtotal);
  if (discountElement) discountElement.textContent = `- ${rupiah(discount)}`;
  if (discountRow) discountRow.classList.toggle('show', discount > 0);
  if (cartTotal) cartTotal.textContent = rupiah(subtotal - discount);
  if (!cartItems) return;

  if (!cart.length) {
    cartItems.innerHTML = '<p class="empty-cart">Keranjangmu masih kosong.</p>';
    return;
  }

  cartItems.innerHTML = cart.map((item, index) => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-info cart-info">
        <h4>${item.name}</h4>
        <div class="cart-item-price cart-price">${rupiah(item.price)}</div>
        <div class="quantity">
          <button type="button" data-action="decrease" data-index="${index}" aria-label="Kurangi ${item.name}">−</button>
          <span>${item.quantity}</span>
          <button type="button" data-action="increase" data-index="${index}" aria-label="Tambah ${item.name}">+</button>
        </div>
      </div>
      <button class="remove" type="button" data-action="remove" data-index="${index}" aria-label="Hapus ${item.name}">×</button>
    </div>`).join('');
}

function addToCart(name, price, image) {
  const existing = cart.find((item) => item.name === name);
  if (existing) existing.quantity += 1;
  else cart.push({ name, price, image, quantity: 1 });
  saveCart();
  updateCart();
  openCart();
}

function increaseQuantity(index) {
  if (!cart[index]) return;
  cart[index].quantity += 1;
  saveCart();
  updateCart();
}

function decreaseQuantity(index) {
  if (!cart[index]) return;
  cart[index].quantity -= 1;
  if (cart[index].quantity <= 0) cart.splice(index, 1);
  saveCart();
  updateCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  updateCart();
}

function openCart() {
  const panel = $('#cart') || $('#cartPanel') || $('#cartDrawer');
  const overlay = $('#cart-overlay') || $('#cartOverlay');
  if (panel) panel.classList.add('show');
  if (overlay) overlay.classList.add('show');
  panel?.setAttribute('aria-hidden', 'false');
  overlay?.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  const panel = $('#cart') || $('#cartPanel') || $('#cartDrawer');
  const overlay = $('#cart-overlay') || $('#cartOverlay');
  if (panel) panel.classList.remove('show');
  if (overlay) overlay.classList.remove('show');
  panel?.setAttribute('aria-hidden', 'true');
  overlay?.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function filterMenu() {
  const input = $('#searchInput') || $('#searchMenu');
  const query = input ? input.value.toLowerCase().trim() : '';
  let found = 0;
  all('.product').forEach((product) => {
    const name = (product.dataset.name || product.querySelector('h3')?.textContent || '').toLowerCase();
    const category = product.dataset.category || 'all';
    const matches = name.includes(query) && (currentCategory === 'all' || category === currentCategory);
    product.style.display = matches ? '' : 'none';
    if (matches) found += 1;
  });
  const noResult = $('#noResult');
  if (noResult) noResult.style.display = found ? 'none' : 'block';
}

function setCategory(category, button) {
  currentCategory = category;
  all('.category').forEach((item) => item.classList.remove('active'));
  if (button) button.classList.add('active');
  filterMenu();
}

function toggleFavorite(name, button) {
  const index = favorites.indexOf(name);
  if (index === -1) {
    favorites.push(name);
    button.classList.add('active');
    button.textContent = '♥';
  } else {
    favorites.splice(index, 1);
    button.classList.remove('active');
    button.textContent = '♡';
  }
  localStorage.setItem(favoritesStorageKey, JSON.stringify(favorites));
}

function applyVoucher() {
  const input = $('#voucherInput');
  const message = $('#voucherMessage');
  if (!input || !message) return;
  if (input.value.trim().toUpperCase() === 'SENJA10') {
    discountPercent = 10;
    message.textContent = '✓ Voucher SENJA10 berhasil digunakan.';
  } else {
    discountPercent = 0;
    message.textContent = 'Voucher tidak valid.';
  }
  updateCart();
}

function copyVoucher() {
  const input = $('#voucherInput');
  if (!input) return;
  input.value = 'SENJA10';
  openCart();
}

function toggleMobileMenu() {
  const menu = $('#navMenu');
  const toggle = document.querySelector('.menu-toggle');
  const isOpen = menu?.classList.toggle('show') ?? false;
  toggle?.setAttribute('aria-expanded', String(isOpen));
}

function renderMenu() {
  const menuGrid = $('#menuGrid');
  if (!menuGrid) return;
  menuGrid.innerHTML = menuProducts.map((product) => `
    <article class="product" data-name="${product.name}" data-category="${product.category}">
      <div class="product-image"><img src="${product.image}" alt="${product.name}" loading="lazy"></div>
      <div class="product-body"><span class="tag">${product.category.toUpperCase()}</span><h3>${product.name}</h3><p>${product.description}</p>
        <div class="product-footer"><strong>${rupiah(product.price)}</strong><button class="add-button" type="button" data-product="${product.name}">Tambah</button></div>
      </div>
    </article>`).join('');
}

function openCheckout() {
  if (!cart.length) {
    alert('Keranjang kamu masih kosong.');
    return;
  }
  const total = $('#checkoutTotal');
  const modal = $('#checkoutModal');
  if (total) total.textContent = rupiah(calculateTotal().total);
  if (modal) modal.classList.add('show');
  else sendWhatsApp();
}

function closeCheckout() {
  const modal = $('#checkoutModal');
  if (modal) modal.classList.remove('show');
}

function sendWhatsApp() {
  if (!cart.length) {
    alert('Keranjang masih kosong.');
    return;
  }

  const name = $('#customerName')?.value.trim() || '';
  const phone = $('#customerPhone')?.value.trim() || '';
  const note = $('#orderNote')?.value.trim() || $('#customerNote')?.value.trim() || '';
  const orderType = $('#orderType')?.value || 'Dine in';

  if (!name) {
    alert('Silakan masukkan nama Anda.');
    return;
  }

  if (!phone) {
    alert('Silakan masukkan nomor WhatsApp Anda.');
    return;
  }

  let message = '*KEDAI SENJA - PESANAN BARU* ☕\n';
  message += '━━━━━━━━━━━━━━━━━━\n\n';
  message += `👤 *Nama:* ${name}\n`;
  message += `📱 *WhatsApp:* ${phone}\n`;
  message += `🍽️ *Pesanan:* ${orderType}\n\n`;
  message += '*DETAIL PESANAN*\n';

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    message += `\n${index + 1}. ${item.name}`;
    message += `\n   ${item.quantity} x ${rupiah(item.price)}`;
    message += `\n   = *${rupiah(itemTotal)}*\n`;
  });

  const totals = calculateTotal();
  message += '\n━━━━━━━━━━━━━━━━━━\n';
  message += `Subtotal: ${rupiah(totals.subtotal)}\n`;
  if (totals.discount > 0) message += `Diskon: -${rupiah(totals.discount)}\n`;
  message += `*TOTAL: ${rupiah(totals.total)}*\n`;
  if (note) message += `\n📝 *Catatan:*\n${note}\n`;
  message += '\n━━━━━━━━━━━━━━━━━━\n';
  message += 'Mohon konfirmasi pesanan saya. Terima kasih. 🙏';

  const whatsappURL = `https://wa.me/${ownerNumber}?text=${encodeURIComponent(message)}`;
  window.open(whatsappURL, '_blank', 'noopener');
}

$('#menuGrid')?.addEventListener('click', (event) => {
  const button = event.target.closest('.add-button');
  if (!button) return;
  const product = menuProducts.find((item) => item.name === button.dataset.product);
  if (product) addToCart(product.name, product.price, product.image);
});

const cartItemsElement = $('#cart-items') || $('#cartItems');
if (cartItemsElement) cartItemsElement.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const index = Number(button.dataset.index);
  if (button.dataset.action === 'increase') increaseQuantity(index);
  if (button.dataset.action === 'decrease') decreaseQuantity(index);
  if (button.dataset.action === 'remove') removeFromCart(index);
});

$('#cart-button')?.addEventListener('click', openCart);
$('#close-cart')?.addEventListener('click', closeCart);
($('#cart-overlay') || $('#cartOverlay'))?.addEventListener('click', closeCart);
$('#checkout-button')?.addEventListener('click', openCheckout);
($('#searchInput') || $('#searchMenu'))?.addEventListener('input', filterMenu);
all('.category').forEach((button) => button.addEventListener('click', () => setCategory(button.dataset.category || 'all', button)));
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { closeCart(); closeCheckout(); } });

renderMenu();
updateCart();
filterMenu();
