import './style.css';
import QRCode from 'qrcode';

const API_URL = 'http://localhost:5000/api';

// ============================================
// 1. STATE MANAGEMENT & API CALLS
// ============================================
const AppState = {
  currentView: 'home',
  authMode: 'login',
  currentUser: null,
  token: localStorage.getItem('token') || null,

  async init() {
    const saved = localStorage.getItem('user_data');
    if (this.token && saved) {
      this.currentUser = JSON.parse(saved);
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
        showToast("Registration Success! Sign In.");
        this.authMode = 'login';
        render();
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to create account");
      }
    } catch (err) {
      showToast("Network Error");
    }
  },

  async sendMoney(recipientEmail, amount) {
    showToast("Processing Payment...");
    try {
      const res = await fetch(`${API_URL}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderEmail: this.currentUser.email, recipientEmail, amount })
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

  async buyUtility(type, amount, provider) {
    showToast(`Purchasing ${type}...`);
    try {
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
          alert(`⚡ PREPAID TOKEN GENERATED:\n\n${data.token}\n\nUnits added to Meter.`);
        } else {
          showToast(`${type} Recharged!`);
        }
        render();
      }
    } catch (err) {
      showToast("Purchase Error");
    }
  },

  async showMyQRCode() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-[60] bg-[#0f172a]/95 flex flex-col items-center justify-center p-6 view-transition';
    const canvas = document.createElement('canvas');
    canvas.className = 'rounded-3xl border-8 border-white shadow-2xl mb-6';
    
    await QRCode.toCanvas(canvas, this.currentUser.email, { width: 260, margin: 2 });
    
    modal.innerHTML = `
      <h2 class="text-emerald-500 font-black uppercase tracking-[0.2em] mb-2 text-xs">My Pay ID</h2>
      <p class="text-slate-400 text-xs mb-8 text-center font-medium">Scanning this pays<br><span class="text-white">${this.currentUser.fullName}</span></p>
      <div id="qr-target"></div>
      <button id="close-qr" class="mt-12 bg-slate-800 text-white px-12 py-4 rounded-2xl font-bold border border-slate-700 uppercase text-[10px] tracking-widest">Close</button>
    `;

    document.body.appendChild(modal);
    document.getElementById('qr-target').appendChild(canvas);
    document.getElementById('close-qr').onclick = () => modal.remove();
  },

  logout() {
    localStorage.clear();
    location.reload();
  }
};

// ============================================
// 2. VIEW COMPONENTS (THE UI)
// ============================================

function HomeView() {
  const isLogin = AppState.authMode === 'login';
  return `
    <div class="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 view-transition">
      <div class="bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 border border-slate-800">
        <div class="flex flex-col items-center mb-10">
          <div class="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-emerald-500/20">
             <span class="text-slate-900 text-2xl font-black italic">U</span>
          </div>
          <h1 class="text-2xl font-bold text-white tracking-tight">UbuntuPay</h1>
          <p class="text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">${isLogin ? 'Welcome Back' : 'Create Account'}</p>
        </div>

        <form id="auth-form" class="space-y-4">
          ${!isLogin ? `
            <input type="text" id="name" placeholder="Full Name" required class="w-full px-5 py-4 rounded-2xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-emerald-500 text-sm">
            <input type="tel" id="phone" placeholder="Phone (+27)" required class="w-full px-5 py-4 rounded-2xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-emerald-500 text-sm">
          ` : ''}
          <input type="email" id="email" placeholder="Email Address" required class="w-full px-5 py-4 rounded-2xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-emerald-500 text-sm">
          <input type="password" id="password" placeholder="Password" required class="w-full px-5 py-4 rounded-2xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-emerald-500 text-sm">
          <button type="submit" class="w-full bg-emerald-500 text-slate-900 font-black py-5 rounded-2xl shadow-lg hover:bg-emerald-400 active:scale-95 transition-all mt-4 uppercase tracking-widest text-[10px]">
            ${isLogin ? 'Sign In' : 'Register Now'}
          </button>
        </form>

        <button id="toggle-btn" class="w-full mt-8 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-emerald-500 transition-colors">
          ${isLogin ? "New to the platform? Register" : "Member? Sign In Here"}
        </button>
      </div>
    </div>`;
}

function DashboardView() {
  const user = AppState.currentUser;
  const firstName = user.fullName.split(' ')[0];
  return `
    <div class="min-h-screen bg-[#0b1222] text-white pb-24 view-transition overflow-x-hidden">
      <header class="p-6 flex justify-between items-center sticky top-0 z-40 bg-[#0b1222]/80 backdrop-blur-xl border-b border-slate-800/50">
        <div>
          <p class="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Good Day</p>
          <h1 class="text-2xl font-bold tracking-tight">${firstName}</h1>
        </div>
        <button id="logout-btn" class="w-12 h-12 bg-slate-800/50 rounded-2xl flex items-center justify-center border border-slate-700">
          <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7" stroke-width="2" stroke-linecap="round"></path></svg>
        </button>
      </header>

      <main class="p-6 max-w-xl mx-auto space-y-8">
        <div class="relative group">
          <div class="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div class="relative bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 overflow-hidden shadow-2xl">
            <div class="flex justify-between items-start mb-12">
              <span class="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Transactional Plus</span>
              <div class="w-10 h-6 bg-slate-800 rounded-md border border-slate-700 flex items-center px-1">
                <div class="w-3 h-3 bg-amber-500 rounded-full opacity-50 shadow-[0_0_8px_amber]"></div>
              </div>
            </div>
            <p class="text-slate-500 text-xs mb-1 font-bold">Available ZAR</p>
            <h2 class="text-5xl font-light tracking-tighter mb-10 text-white">R ${user.balance.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</h2>
            <div class="flex space-x-3">
              <button id="send-trigger" class="flex-1 bg-emerald-500 text-slate-900 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20">Pay Someone</button>
              <button id="my-qr" class="flex-1 bg-slate-800 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-700 active:scale-95 transition-all">My Pay ID</button>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-4 gap-4">
          ${renderService('buy-power', 'Power', 'M13 10V3L4 14h7v7l9-11h-7z')}
          ${renderService('buy-data', 'Airtime', 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z')}
          ${renderService('scan-pay', 'Scan', 'M3 7V5a2 2 0 012-2h2m10 0h2a2 2 0 012 2v2m0 10v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2')}
          ${renderService('more', 'History', 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z')}
        </div>

        <div class="bg-slate-900/50 rounded-[2.5rem] p-8 border border-slate-800/60">
           <div class="flex justify-between items-center mb-8">
             <h3 class="font-bold text-lg tracking-tight">Recent Activity</h3>
             <span class="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Live Updates</span>
           </div>
           <div class="space-y-6">
             ${user.transactions.length > 0 ? user.transactions.map(tx => renderTxItem(tx)).join('') : '<p class="text-center text-slate-600 py-10 text-xs italic">No activity recorded</p>'}
           </div>
        </div>
      </main>

      <div id="scanner-container" class="fixed inset-0 z-50 bg-black hidden flex-col items-center justify-center">
        <video id="scanner-video" class="w-full h-full object-cover opacity-60"></video>
        <div class="absolute inset-0 border-[40px] border-black/80 flex flex-col items-center justify-center">
          <div class="w-64 h-64 border-2 border-emerald-500 rounded-3xl relative overflow-hidden">
            <div class="absolute top-0 left-0 w-full h-1 bg-emerald-500 shadow-[0_0_15px_emerald] scan-line"></div>
          </div>
          <button id="close-scanner" class="mt-20 bg-white/10 text-white px-10 py-4 rounded-2xl font-bold backdrop-blur-xl border border-white/20 active:scale-95 transition-all">Cancel Scan</button>
        </div>
      </div>
    </div>`;
}

// ============================================
// 3. HELPERS & LISTENERS
// ============================================

function renderService(id, label, iconPath) {
  return `
    <button id="${id}" class="flex flex-col items-center group">
      <div class="w-14 h-14 bg-slate-900 border border-slate-800 text-emerald-500 rounded-2xl flex items-center justify-center mb-2 group-active:scale-90 transition-all shadow-lg">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="${iconPath}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
      </div>
      <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest">${label}</span>
    </button>`;
}

function renderTxItem(tx) {
  const isReceive = tx.type.includes('Receive') || tx.type.includes('Deposit');
  return `
    <div class="flex justify-between items-center">
      <div class="flex items-center space-x-4">
        <div class="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-lg">
           ${isReceive ? '🇿🇦' : '💸'}
        </div>
        <div>
          <p class="text-sm font-bold text-white">${tx.type}</p>
          <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest">${new Date(tx.date).toLocaleDateString()}</p>
        </div>
      </div>
      <p class="font-black ${isReceive ? 'text-emerald-500' : 'text-slate-300'}">
        ${isReceive ? '+' : '-'} R${tx.amount.toFixed(2)}
      </p>
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
  // Toggle Auth
  document.getElementById('toggle-btn')?.addEventListener('click', () => {
    AppState.authMode = AppState.authMode === 'login' ? 'register' : 'login';
    render();
  });

  // Auth Form
  document.getElementById('auth-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email')?.value;
    const pass = document.getElementById('password')?.value;
    if (AppState.authMode === 'login') {
      await AppState.login(email, pass);
    } else {
      const name = document.getElementById('name').value;
      const phone = document.getElementById('phone').value;
      await AppState.register(name, email, phone, pass);
    }
  });

  // Action Buttons
  document.getElementById('my-qr')?.addEventListener('click', () => AppState.showMyQRCode());
  document.getElementById('logout-btn')?.addEventListener('click', () => AppState.logout());
  
  document.getElementById('send-trigger')?.addEventListener('click', async () => {
    const email = prompt("Recipient Email Address:");
    const amount = prompt("Amount (ZAR):");
    if (email && amount) await AppState.sendMoney(email, amount);
  });

  document.getElementById('buy-power')?.addEventListener('click', async () => {
    const amount = prompt("Enter Electricity Amount (R):");
    if (amount) await AppState.buyUtility('Electricity', amount, 'Eskom Prepaid');
  });

  document.getElementById('buy-data')?.addEventListener('click', async () => {
    const amount = prompt("Enter Airtime Amount (R):");
    if (amount) await AppState.buyUtility('Airtime', amount, 'Vodacom');
  });

  // Scanner Container
  const scanBtn = document.getElementById('scan-pay');
  const scannerContainer = document.getElementById('scanner-container');
  const video = document.getElementById('scanner-video');

  if (scanBtn && scannerContainer && video) {
    scanBtn.addEventListener('click', async () => {
      try {
        scannerContainer.classList.remove('hidden');
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        video.srcObject = stream;
        video.play();
        setTimeout(async () => {
          stream.getTracks().forEach(track => track.stop());
          scannerContainer.classList.add('hidden');
          const email = prompt("QR Scanned! Enter recipient email:");
          const amount = prompt("Enter amount (R):");
          if (email && amount) await AppState.sendMoney(email, amount);
        }, 3500);
      } catch (err) {
        showToast("Camera Access Denied");
        scannerContainer.classList.add('hidden');
      }
    });
  }

  document.getElementById('close-scanner')?.addEventListener('click', () => {
    const stream = video.srcObject;
    if (stream) stream.getTracks().forEach(track => track.stop());
    scannerContainer.classList.add('hidden');
  });
}

function render() {
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = AppState.currentView === 'home' ? HomeView() : DashboardView();
    attachEventListeners();
  }
}

document.addEventListener('DOMContentLoaded', () => AppState.init());