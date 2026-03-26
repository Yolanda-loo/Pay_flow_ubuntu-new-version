import './style.css';

const API_URL = 'http://localhost:5000/api';

const AppState = {
  currentView: 'home',
  authMode: 'login',
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
      showToast(data.message || "Login Failed");
    }
  },

  async buyUtility(type, amount, provider) {
    showToast(`Buying ${type}...`);
    const res = await fetch(`${API_URL}/utility`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: this.currentUser.email, type, amount, provider })
    });
    const data = await res.json();
    if (res.ok) {
      this.currentUser = data.user;
      localStorage.setItem('user_data', JSON.stringify(data.user));
      if (type === 'Electricity') {
        alert(`⚡ SUCCESS!\nYour Meter Token: ${data.token}`);
      } else {
        showToast(`${type} recharged!`);
      }
      render();
    } else {
      showToast(data.message);
    }
  },

  async sendMoney(recipientEmail, amount) {
    const res = await fetch(`${API_URL}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderEmail: this.currentUser.email, recipientEmail, amount })
    });
    const data = await res.json();
    if (res.ok) {
      this.currentUser = data.user;
      localStorage.setItem('user_data', JSON.stringify(data.user));
      showToast("Money Sent! 🇿🇦");
      render();
    } else {
      showToast(data.message);
    }
  },

  logout() {
    localStorage.clear();
    location.reload();
  }
};

// --- VIEWS ---

function HomeView() {
  const isLogin = AppState.authMode === 'login';
  return `
    <div class="min-h-screen bg-slate-100 flex items-center justify-center p-6 view-transition">
      <div class="bg-white w-full max-w-md rounded-3xl shadow-xl p-8 border-t-8 border-emerald-500 text-center">
        <h1 class="text-3xl font-black text-slate-800 tracking-tighter mb-8">Ubuntu<span class="text-emerald-500">Pay</span></h1>
        <form id="auth-form" class="space-y-4">
          ${!isLogin ? `<input type="text" id="name" placeholder="Full Name" required class="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:border-emerald-500">` : ''}
          <input type="email" id="email" placeholder="Email" required class="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:border-emerald-500">
          <input type="password" id="password" placeholder="Password" required class="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:border-emerald-500">
          <button type="submit" class="w-full bg-emerald-500 text-white font-black py-4 rounded-xl shadow-lg uppercase text-sm italic tracking-tighter">
            ${isLogin ? 'SIGN IN' : 'JOIN NOW'}
          </button>
        </form>
        <button id="toggle-btn" class="mt-8 text-sm font-bold text-slate-400 italic">${isLogin ? 'Register Account' : 'Back to Login'}</button>
      </div>
    </div>`;
}

function DashboardView() {
  const user = AppState.currentUser;
  const firstName = user.fullName.split(' ')[0];

  return `
    <div class="min-h-screen bg-slate-100 pb-24 view-transition">
      <header class="bg-white px-6 py-4 flex justify-between items-center sticky top-0 z-30 shadow-sm border-b border-slate-100">
        <div class="flex flex-col">
           <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Account Holder</span>
           <span class="font-black text-slate-900 text-xl">${firstName}</span>
        </div>
        <button id="logout-btn" class="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke-width="2" stroke-linecap="round"></path></svg>
        </button>
      </header>
      
      <main class="p-6 max-w-xl mx-auto space-y-6">
        <div class="bg-white rounded-[2.5rem] p-8 shadow-md border-l-8 border-emerald-500">
          <div class="flex justify-between items-center mb-6">
             <span class="text-[10px] font-black text-slate-300 uppercase tracking-widest">Main Transactional</span>
             <span class="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">ACTIVE</span>
          </div>
          <h2 class="text-4xl font-black text-slate-900 mb-8 tracking-tighter">R ${user.balance.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</h2>
          <div class="grid grid-cols-2 gap-3">
             <button id="send-trigger" class="bg-emerald-500 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100">Pay Someone</button>
             <button class="bg-slate-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest">Add Funds</button>
          </div>
        </div>

        <div class="grid grid-cols-4 gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
          ${renderService('buy-power', 'Power', 'M13 10V3L4 14h7v7l9-11h-7z', 'amber')}
          ${renderService('buy-data', 'Airtime', 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z', 'blue')}
          ${renderService('scan-pay', 'Scan', 'M3 7V5a2 2 0 012-2h2m10 0h2a2 2 0 012 2v2m0 10v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2', 'emerald')}
          ${renderService('more', 'More', 'M5 12h.01M12 12h.01M19 12h.01', 'slate')}
        </div>

        <div>
           <h3 class="font-black text-slate-800 text-xs uppercase tracking-widest mb-4 opacity-50 px-2">Recent Activity</h3>
           <div class="space-y-2">
             ${user.transactions.length > 0 ? user.transactions.map(tx => renderTxItem(tx)).join('') : '<p class="text-center text-slate-300 py-10 text-sm italic font-bold">No transactions found</p>'}
           </div>
        </div>
      </main>

      <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-10 py-5 flex justify-between items-center z-40">
        <div class="text-emerald-500 flex flex-col items-center">
           <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"></path></svg>
           <span class="text-[9px] font-black uppercase mt-1">Home</span>
        </div>
        <div class="text-slate-300 flex flex-col items-center">
           <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2"></path></svg>
           <span class="text-[9px] font-black uppercase mt-1">Cards</span>
        </div>
        <div class="text-slate-300 flex flex-col items-center">
           <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" stroke-width="2"></path></svg>
           <span class="text-[9px] font-black uppercase mt-1">Settings</span>
        </div>
      </nav>
    </div>`;
}

// --- UI HELPERS ---

function renderService(id, label, iconPath, color) {
  const colors = { amber: 'text-amber-500', blue: 'text-blue-500', emerald: 'text-emerald-500', slate: 'text-slate-400' };
  return `
    <button id="${id}" class="flex flex-col items-center active:scale-90 transition-transform">
      <div class="${colors[color]} mb-1">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="${iconPath}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
      </div>
      <span class="text-[9px] font-black text-slate-500 uppercase tracking-tighter">${label}</span>
    </button>`;
}

function renderTxItem(tx) {
  const isReceive = tx.type === 'Receive';
  return `
    <div class="bg-white p-5 rounded-2xl flex justify-between items-center shadow-sm border border-slate-50 active:bg-slate-50">
      <div class="flex items-center space-x-4">
        <div class="w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-black ${isReceive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}">
           ${isReceive ? 'IN' : 'OUT'}
        </div>
        <div>
          <p class="text-sm font-black text-slate-900">${tx.type} ${tx.recipient ? ' - ' + tx.recipient : ''}</p>
          <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">${new Date(tx.date).toDateString()}</p>
        </div>
      </div>
      <p class="text-sm font-black ${isReceive ? 'text-emerald-600' : 'text-slate-900'}">
        ${isReceive ? '+' : '-'} R${tx.amount.toFixed(2)}
      </p>
    </div>`;
}

function showToast(msg) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'bg-slate-900 text-emerald-400 px-8 py-3 rounded-full shadow-2xl text-[9px] font-black uppercase tracking-widest border-t-2 border-emerald-500 mb-20';
  toast.innerText = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// --- EVENT LISTENERS ---

function attachEventListeners() {
  // Auth toggles
  const toggleBtn = document.getElementById('toggle-btn');
  if (toggleBtn) toggleBtn.addEventListener('click', () => { AppState.authMode = AppState.authMode === 'login' ? 'register' : 'login'; render(); });

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
        const res = await fetch(`${API_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fullName: name, email, phone, password: pass })
        });
        if (res.ok) { showToast("Registered! Sign in now."); AppState.authMode = 'login'; render(); }
      }
    });
  }

  // Pay Someone
  const sendBtn = document.getElementById('send-trigger');
  if (sendBtn) sendBtn.addEventListener('click', async () => {
    const email = prompt("Recipient Email:");
    const amount = prompt("Amount (ZAR):");
    if (email && amount) await AppState.sendMoney(email, amount);
  });

  // Buy Electricity
  const powerBtn = document.getElementById('buy-power');
  if (powerBtn) powerBtn.addEventListener('click', async () => {
    const amount = prompt("Enter Electricity Amount (R):");
    if (amount) await AppState.buyUtility('Electricity', amount, 'Eskom Prepaid');
  });

  // Buy Airtime
  const dataBtn = document.getElementById('buy-data');
  if (dataBtn) dataBtn.addEventListener('click', async () => {
    const amount = prompt("Enter Airtime Amount (R):");
    if (amount) await AppState.buyUtility('Airtime', amount, 'Vodacom SA');
  });

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', () => AppState.logout());
}

function render() {
  const app = document.getElementById('app');
  app.innerHTML = AppState.currentView === 'home' ? HomeView() : DashboardView();
  attachEventListeners();
}

document.addEventListener('DOMContentLoaded', () => AppState.init());