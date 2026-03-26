import './style.css';

const API_URL = 'http://localhost:5000/api';

// ============================================
// 1. STATE MANAGEMENT (CORE ENGINE)
// ============================================
const AppState = {
  currentView: 'home', // 'home' or 'dashboard'
  authMode: 'login',   // 'login' or 'register'
  currentUser: null,
  token: localStorage.getItem('token') || null,

  async init() {
    const savedUser = localStorage.getItem('user_data');
    if (this.token && savedUser) {
      this.currentUser = JSON.parse(savedUser);
      this.currentView = 'dashboard';
    }
    render();
  },

  async login(email, password) {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        this.token = data.token;
        this.currentUser = data.user;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        this.currentView = 'dashboard';
        render();
      } else {
        showToast(data.message || "Invalid Credentials");
      }
    } catch (err) {
      showToast("Backend Server Offline");
    }
  },

  async register(fullName, email, phone, password) {
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, phone, password })
      });
      if (res.ok) {
        showToast("Success! Now Sign In.");
        this.authMode = 'login';
        render();
      } else {
        const data = await res.json();
        showToast(data.error || "Registration failed");
      }
    } catch (err) {
      showToast("Connection Error");
    }
  },

  async sendMoney(recipientEmail, amount) {
    showToast("Processing Payment...");
    try {
      const res = await fetch(`${API_URL}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderEmail: this.currentUser.email,
          recipientEmail,
          amount
        })
      });
      const data = await res.json();
      if (res.ok) {
        this.currentUser = data.user;
        localStorage.setItem('user_data', JSON.stringify(data.user));
        showToast("Payment Successful! 🇿🇦");
        render();
      } else {
        showToast(data.message);
      }
    } catch (err) {
      showToast("Transaction Failed");
    }
  },

  logout() {
    localStorage.clear();
    location.reload();
  }
};

// ============================================
// 2. VIEW COMPONENTS (THE PROFESSIONAL UI)
// ============================================

function HomeView() {
  const isLogin = AppState.authMode === 'login';
  return `
    <div class="min-h-screen bg-slate-50 flex items-center justify-center p-6 view-transition">
      <div class="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 border border-slate-100">
        <div class="flex flex-col items-center mb-10">
          <div class="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-emerald-100">
             <span class="text-white text-2xl font-black">U</span>
          </div>
          <h1 class="text-2xl font-bold text-slate-900">UbuntuPay</h1>
          <p class="text-slate-400 text-xs font-black uppercase tracking-widest mt-1">${isLogin ? 'Welcome Back' : 'Create Account'}</p>
        </div>

        <form id="auth-form" class="space-y-4">
          ${!isLogin ? `
            <input type="text" id="name" placeholder="Full Name" required class="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-emerald-500 text-sm">
            <input type="tel" id="phone" placeholder="Phone (+27)" required class="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-emerald-500 text-sm">
          ` : ''}
          <input type="email" id="email" placeholder="Email Address" required class="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-emerald-500 text-sm">
          <input type="password" id="password" placeholder="Password" required class="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-emerald-500 text-sm">
          <button type="submit" class="w-full bg-slate-900 text-white font-bold py-5 rounded-2xl shadow-lg hover:bg-emerald-600 transition-all mt-4 uppercase tracking-widest text-xs">
            ${isLogin ? 'Sign In' : 'Register'}
          </button>
        </form>

        <button id="toggle-btn" class="w-full mt-8 text-sm font-bold text-emerald-600 hover:text-emerald-700">
          ${isLogin ? "Need an account? Register" : "Already have an account? Login"}
        </button>
      </div>
    </div>`;
}

function DashboardView() {
  const user = AppState.currentUser || { fullName: "User", balance: 0, transactions: [] };
  return `
    <div class="min-h-screen bg-slate-50 pb-12 view-transition">
      <header class="bg-white px-8 py-5 flex justify-between items-center sticky top-0 z-30 border-b border-slate-100">
        <div class="flex items-center space-x-2">
           <div class="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">U</div>
           <span class="font-black text-slate-900 tracking-tighter text-lg uppercase">UBUNTUPAY</span>
        </div>
        <button id="logout-btn" class="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke-width="2" stroke-linecap="round"></path></svg>
        </button>
      </header>
      
      <main class="p-6 max-w-xl mx-auto">
        <div class="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl mb-10 relative overflow-hidden">
          <div class="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl"></div>
          <div class="relative z-10">
            <p class="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Available Balance</p>
            <h2 class="text-5xl font-light tracking-tight mb-2">R ${user.balance.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</h2>
            <p class="text-slate-500 text-[10px] font-bold uppercase tracking-widest">🇿🇦 Verified Account</p>
          </div>
        </div>

        <div class="grid grid-cols-4 gap-4 mb-12">
          ${renderMenuAction('send-money-trigger', 'Send', 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8', 'emerald')}
          ${renderMenuAction('deposit-trigger', 'Top Up', 'M12 4v16m8-8H4', 'blue')}
          ${renderMenuAction('scan-pay-trigger', 'Scan', 'M12 4v1m0 11v1m4-8h1m-11 0h1m5 2v5m1-1h2m-2 0h-2', 'purple')}
          ${renderMenuAction('more-trigger', 'More', 'M5 12h.01M12 12h.01M19 12h.01', 'slate')}
        </div>

        <div class="flex justify-between items-end mb-6 px-2">
          <h3 class="font-bold text-slate-900 text-xl tracking-tight">Recent Activity</h3>
          <button class="text-[10px] font-black text-emerald-600 uppercase tracking-widest">See All</button>
        </div>
        
        <div class="space-y-3">
          ${user.transactions.length > 0 ? user.transactions.map(tx => renderTransactionItem(tx)).join('') : '<p class="text-center text-slate-400 py-16 text-sm italic">No activity yet...</p>'}
        </div>
      </main>
    </div>`;
}

// ============================================
// 3. UI HELPERS & LISTENERS
// ============================================

function renderMenuAction(id, label, iconPath, color) {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    slate: 'bg-slate-100 text-slate-600'
  };
  return `
    <button id="${id}" class="flex flex-col items-center group">
      <div class="w-14 h-14 ${colors[color]} rounded-2xl flex items-center justify-center mb-2 shadow-sm group-active:scale-90 transition-all">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="${iconPath}" stroke-width="2" stroke-linecap="round"></path></svg>
      </div>
      <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">${label}</span>
    </button>`;
}

function renderTransactionItem(tx) {
  const isReceive = tx.type === 'Receive';
  return `
    <div class="bg-white p-5 rounded-[1.8rem] flex justify-between items-center shadow-sm border border-slate-50 transition-all hover:shadow-md">
      <div class="flex items-center space-x-4">
        <div class="w-12 h-12 rounded-2xl ${isReceive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600'} flex items-center justify-center text-xl">
           ${isReceive ? '🇿🇦' : '💸'}
        </div>
        <div>
          <p class="text-sm font-bold text-slate-900">${tx.type} ${tx.recipient ? ' - ' + tx.recipient : ''}</p>
          <p class="text-[10px] text-slate-400 font-black uppercase tracking-tighter">${new Date(tx.date).toLocaleDateString('en-ZA')}</p>
        </div>
      </div>
      <p class="font-black ${isReceive ? 'text-emerald-600' : 'text-slate-900'}">${isReceive ? '+' : '-'} R${tx.amount.toFixed(2)}</p>
    </div>`;
}

function showToast(msg) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'bg-slate-900 text-emerald-400 px-8 py-4 rounded-2xl shadow-2xl text-[10px] font-black uppercase tracking-widest view-transition border-b-4 border-emerald-500';
  toast.innerText = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

function attachEventListeners() {
  const toggleBtn = document.getElementById('toggle-btn');
  if (toggleBtn) toggleBtn.addEventListener('click', () => {
    AppState.authMode = AppState.authMode === 'login' ? 'register' : 'login';
    render();
  });

  const authForm = document.getElementById('auth-form');
  if (authForm) {
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const pass = document.getElementById('password').value;
      if (AppState.authMode === 'login') {
        await AppState.login(email, pass);
      } else {
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        await AppState.register(name, email, phone, pass);
      }
    });
  }

  const sendBtn = document.getElementById('send-money-trigger');
  if (sendBtn) sendBtn.addEventListener('click', async () => {
    const email = prompt("Recipient's UbuntuPay Email:");
    const amount = prompt("Amount (ZAR):");
    if (email && amount) await AppState.sendMoney(email, amount);
  });

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', () => AppState.logout());
}

// ============================================
// 4. CORE RENDER ENGINE
// ============================================

function render() {
  const app = document.getElementById('app');
  app.innerHTML = AppState.currentView === 'home' ? HomeView() : DashboardView();
  attachEventListeners();
}

document.addEventListener('DOMContentLoaded', () => AppState.init());