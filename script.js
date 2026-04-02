const YELLOW = '#F4C430';

function showToast(msg, success = true) {
  const t = document.getElementById('toast');
  if (!t) return;

  t.textContent = msg;
  t.style.background = success
    ? 'linear-gradient(135deg,#27ae60,#2ecc71)'
    : 'linear-gradient(135deg,#c0392b,#e74c3c)';

  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

function createFloaters() {
  const floaters = document.getElementById('floaters');
  if (!floaters) return;

  const emojis = ['🌮','🍔','🍟','🌯','🍕','🥤','🍗','🧅','🥙','🍖'];

  for (let i = 0; i < 16; i++) {
    const el = document.createElement('div');
    el.className = 'floater';
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.left = Math.random() * 100 + 'vw';
    el.style.animationDuration = (6 + Math.random() * 8) + 's';
    el.style.animationDelay = Math.random() * 8 + 's';
    el.style.fontSize = (1.5 + Math.random() * 2) + 'rem';
    floaters.appendChild(el);
  }
}

function togglePass(id, btn) {
  const inp = document.getElementById(id);
  if (!inp) return;

  if (inp.type === 'password') {
    inp.type = 'text';
    btn.textContent = '🙈';
  } else {
    inp.type = 'password';
    btn.textContent = '👁️';
  }
}

function checkStrength(val) {
  const fill = document.getElementById('strengthFill');
  const text = document.getElementById('strengthText');
  if (!fill || !text) return;

  let score = 0;
  if (val.length >= 8) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;

  const map = [
    ['Too short', '#e74c3c', 10],
    ['Weak', '#e74c3c', 25],
    ['Fair', '#f39c12', 50],
    ['Good', '#27ae60', 75],
    ['Strong 💪', '#2ecc71', 100]
  ];

  const [label, color, width] = map[score] || map[0];
  fill.style.width = width + '%';
  fill.style.background = color;
  text.textContent = label;
  text.style.color = color;
}

function handleRegister(e) {
  e.preventDefault();

  const fn = document.getElementById('firstName').value.trim();
  const ln = document.getElementById('lastName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const restaurant = document.getElementById('restaurantName').value.trim();
  const role = document.getElementById('regRole').value;
  const username = document.getElementById('regUsername').value.trim();
  const pass = document.getElementById('regPass').value;
  const pass2 = document.getElementById('regPass2').value;

  if (pass !== pass2) {
    showToast('❌ Passwords do not match!', false);
    return;
  }

  if (pass.length < 8) {
    showToast('❌ Password must be 8+ characters', false);
    return;
  }

  const users = JSON.parse(localStorage.getItem('fs_users') || '[]');

  if (users.find(u => u.username === username || u.email === email)) {
    showToast('❌ Username or email already exists!', false);
    return;
  }

  users.push({
    name: `${fn} ${ln}`,
    email,
    phone,
    restaurant,
    role,
    username,
    password: pass,
    createdAt: new Date().toISOString()
  });

  localStorage.setItem('fs_users', JSON.stringify(users));
  showToast('🎉 Account created! Redirecting to login...');
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 1500);
}

function handleLogin(e) {
  e.preventDefault();

  const user = document.getElementById('loginUser').value.trim();
  const pass = document.getElementById('loginPass').value.trim();

  const users = JSON.parse(localStorage.getItem('fs_users') || '[]');
  const allUsers = [
    { username: 'admin', email: 'admin@foodstock.com', password: 'admin123', role: 'Admin', name: 'Admin User' },
    ...users
  ];

  const found = allUsers.find(u =>
    (u.username === user || u.email === user) && u.password === pass
  );

  if (!found) {
    showToast('❌ Invalid credentials! Try admin / admin123', false);
    return;
  }

  localStorage.setItem('fs_session', JSON.stringify({
    name: found.name || found.username,
    role: found.role || 'Staff',
    username: found.username
  }));

  showToast('✅ Welcome back, ' + (found.name || found.username) + '!');
  setTimeout(() => {
    window.location.href = 'dashboard.html';
  }, 1000);
}

let DB = {};

function saveDB() {
  localStorage.setItem('fs_db', JSON.stringify(DB));
}

function loadDB() {
  const d = localStorage.getItem('fs_db');
  if (d) DB = JSON.parse(d);
}

function initData() {
  DB = {
    products: [
      {id:1,name:'Classic Burger Patty',category:'Burgers',emoji:'🍔',unit:'kg',stock:45,minStock:10,price:180},
      {id:2,name:'Chicken Wings',category:'Burgers',emoji:'🍗',unit:'kg',stock:8,minStock:12,price:220},
      {id:3,name:'Taco Shells',category:'Tacos',emoji:'🌮',unit:'packs',stock:30,minStock:15,price:95},
      {id:4,name:'Seasoned Fries',category:'Sides',emoji:'🍟',unit:'kg',stock:22,minStock:10,price:60}
    ],
    orders: [
      {id:'PO-001',supplier:'Meat Masters',items:'Burger Patty x20kg',total:3600,status:'Delivered'},
      {id:'PO-002',supplier:'Poultry Plus',items:'Chicken Wings x15kg',total:3300,status:'Pending'}
    ],
    suppliers: [
      {id:1,name:'Meat Masters',contact:'Raj Sharma',email:'raj@meatmasters.com',phone:'+91 98001 11111'},
      {id:2,name:'Poultry Plus',contact:'Anita Patel',email:'anita@poultryplus.com',phone:'+91 98001 22222'}
    ],
    sales: [
      {id:'SL-001',product:'Classic Burger',qty:34,total:6766},
      {id:'SL-002',product:'Crispy Tacos',qty:22,total:3278}
    ]
  };

  saveDB();
}

function setupUser() {
  const sess = JSON.parse(localStorage.getItem('fs_session') || '{}');
  const userName = document.getElementById('userName');
  const userRole = document.getElementById('userRole');
  const userAvatar = document.getElementById('userAvatar');

  if (userName) userName.textContent = sess.name || 'Admin';
  if (userRole) userRole.textContent = sess.role || 'Administrator';
  if (userAvatar) userAvatar.textContent = (sess.name || 'A')[0].toUpperCase();
}

function logout() {
  localStorage.removeItem('fs_session');
  window.location.href = 'login.html';
}

function showPage(page, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));

  const pageEl = document.getElementById('page-' + page);
  if (pageEl) pageEl.classList.add('active');
  if (el) el.classList.add('active');

  const title = document.getElementById('pageTitle');
  if (title) title.textContent = page.charAt(0).toUpperCase() + page.slice(1);

  if (page === 'products') renderProducts();
  if (page === 'stock') renderStock();
  if (page === 'orders') renderOrders();
  if (page === 'suppliers') renderSuppliers();
  if (page === 'sales') renderSales();
  if (page === 'reports') renderReports();
  if (page === 'alerts') renderAlerts();
}

function renderDashboard() {
  if (!document.getElementById('statsGrid')) return;

  const lowCount = DB.products.filter(p => p.stock <= p.minStock).length;

  document.getElementById('statsGrid').innerHTML = `
    <div class="stat-card">
      <div class="stat-icon">📦</div>
      <div class="stat-value">${DB.products.length}</div>
      <div class="stat-label">Total Products</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">⚠️</div>
      <div class="stat-value">${lowCount}</div>
      <div class="stat-label">Low Stock</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">🛒</div>
      <div class="stat-value">${DB.orders.length}</div>
      <div class="stat-label">Orders</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">💰</div>
      <div class="stat-value">₹${DB.sales.reduce((a, s) => a + s.total, 0)}</div>
      <div class="stat-label">Sales</div>
    </div>
  `;

  const salesChart = document.getElementById('salesChart');
  if (salesChart) {
    const vals = [40, 70, 55, 90, 65, 85, 75];
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const max = Math.max(...vals);

    salesChart.innerHTML = vals.map((v, i) => `
      <div class="chart-bar-wrap">
        <div class="chart-bar" style="height:${(v / max) * 140}px"></div>
        <div class="chart-label">${days[i]}</div>
      </div>
    `).join('');
  }

  updateBadges();
}

function renderProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  grid.innerHTML = DB.products.map(p => `
    <div class="product-card">
      <span class="card-emoji">${p.emoji}</span>
      <div class="card-name">${p.name}</div>
      <div class="card-cat">${p.category} • ${p.stock} ${p.unit}</div>
    </div>
  `).join('');
}

function renderStock() {
  const table = document.getElementById('stockTable');
  if (!table) return;

  table.innerHTML = DB.products.map(p => `
    <tr>
      <td>${p.emoji} ${p.name}</td>
      <td>${p.category}</td>
      <td>${p.unit}</td>
      <td>${p.stock}</td>
      <td>${p.minStock}</td>
      <td>${p.stock <= p.minStock ? 'Low' : 'OK'}</td>
    </tr>
  `).join('');
}

function renderOrders() {
  const table = document.getElementById('ordersTable');
  if (!table) return;

  table.innerHTML = DB.orders.map(o => `
    <tr>
      <td>${o.id}</td>
      <td>${o.supplier}</td>
      <td>${o.items}</td>
      <td>₹${o.total}</td>
      <td>${o.status}</td>
    </tr>
  `).join('');
}

function renderSuppliers() {
  const table = document.getElementById('suppliersTable');
  if (!table) return;

  table.innerHTML = DB.suppliers.map(s => `
    <tr>
      <td>${s.name}</td>
      <td>${s.contact}</td>
      <td>${s.email}</td>
      <td>${s.phone}</td>
    </tr>
  `).join('');
}

function renderSales() {
  const table = document.getElementById('salesTable');
  if (!table) return;

  table.innerHTML = DB.sales.map(s => `
    <tr>
      <td>${s.id}</td>
      <td>${s.product}</td>
      <td>${s.qty}</td>
      <td>₹${s.total}</td>
    </tr>
  `).join('');
}

function renderReports() {
  const box = document.getElementById('reportsStats');
  if (!box) return;

  box.innerHTML = `
    <div class="stat-card">
      <div class="stat-icon">📦</div>
      <div class="stat-value">${DB.products.length}</div>
      <div class="stat-label">Products</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">💰</div>
      <div class="stat-value">₹${DB.sales.reduce((a, s) => a + s.total, 0)}</div>
      <div class="stat-label">Revenue</div>
    </div>
  `;
}

function renderAlerts() {
  const alerts = document.getElementById('alertsList');
  if (!alerts) return;

  const low = DB.products.filter(p => p.stock <= p.minStock);

  if (low.length === 0) {
    alerts.innerHTML = '<div class="chart-box">✅ No alerts</div>';
    return;
  }

  alerts.innerHTML = low.map(p => `
    <div class="chart-box">
      ⚠️ ${p.name} is low in stock (${p.stock} ${p.unit})
    </div>
  `).join('');
}

function updateBadges() {
  const low = DB.products.filter(p => p.stock <= p.minStock).length;

  const lowStockBadge = document.getElementById('lowStockBadge');
  const alertBadge = document.getElementById('alertBadge');

  if (lowStockBadge) lowStockBadge.textContent = low;
  if (alertBadge) alertBadge.textContent = low;
}

function globalSearchFn(q) {
  q = q.toLowerCase();
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  const found = DB.products.filter(p =>
    p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
  );

  if (q === '') {
    renderProducts();
    return;
  }

  showPage('products');

  grid.innerHTML = found.map(p => `
    <div class="product-card">
      <span class="card-emoji">${p.emoji}</span>
      <div class="card-name">${p.name}</div>
      <div class="card-cat">${p.category} • ${p.stock} ${p.unit}</div>
    </div>
  `).join('');
}

function exportData() {
  const blob = new Blob([JSON.stringify(DB, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'foodstock-export.json';
  a.click();
  showToast('📤 Data exported!');
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const main = document.getElementById('main');
  const btn = document.getElementById('toggleBtn');

  if (!sidebar || !main || !btn) return;

  if (sidebar.style.width === '70px') {
    sidebar.style.width = '240px';
    main.style.marginLeft = '240px';
    btn.textContent = '◀';
  } else {
    sidebar.style.width = '70px';
    main.style.marginLeft = '70px';
    btn.textContent = '▶';
  }
}

document.addEventListener('DOMContentLoaded', function () {
  createFloaters();

  const regPass = document.getElementById('regPass');
  if (regPass) {
    regPass.addEventListener('input', function () {
      checkStrength(this.value);
    });
  }

  const regForm = document.getElementById('regForm');
  if (regForm) {
    regForm.addEventListener('submit', handleRegister);
  }

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  if (document.body.classList.contains('dashboard-page')) {
    const sess = localStorage.getItem('fs_session');
    if (!sess) {
      window.location.href = 'login.html';
      return;
    }

    loadDB();
    if (!DB.products) initData();
    setupUser();
    renderDashboard();
  }
});