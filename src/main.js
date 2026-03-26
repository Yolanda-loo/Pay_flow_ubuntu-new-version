import './style.css';

const API_URL = 'http://localhost:5000/api';

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
    } else { showToast(data.message); }
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
      showToast("Payment Successful 🇿🇦");
      render();
    }
  }
};

// --- UI COMPONENTS ---

function HomeView() {
  const isLogin = AppState.authMode === 'login';
  return `
    <div class="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 view-transition">
      <div class="bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 border border-slate-800">
        <h1 class="text-3xl font-black text-emerald-500 mb-8 text-center italic tracking-tighter text-shadow-glow">UbuntuPay</h1>
        <form id="auth-form" class="space-y-4">
          ${!isLogin ? `<input type="text" id="name" placeholder="Full Name" required class="w-full p-4 bg-slate-800 rounded-2xl border border-slate-700 text-white outline-none focus:border-emerald-500">` : ''}
          <input type="email" id="email" placeholder="Email" required class="w-full p-4 bg-slate-800 rounded-2xl border border-slate-700 text-white outline-none focus:border-emerald-500">
          <input type="password" id="password" placeholder="Password" required class="w-full p-4 bg-slate-800 rounded-2xl border border-slate-700 text-white outline-none focus:border-emerald-500">
          <button type="submit" class="w-full bg-emerald-500 text-slate-900 font-black py-5 rounded-2xl shadow-lg uppercase tracking-widest text-xs mt-4 hover:bg-emerald-400 transition-all">
            ${isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        <button id="toggle-btn" class="w-full mt-8 text-slate-500 font-bold text-xs uppercase tracking-widest">${isLogin ? 'New Member? Register' : 'Existing? Login'}</button>
      </div>
    </div>`;
}

function DashboardView() {
  const user = AppState.currentUser;
  return `
    <div class="min-h-screen bg-[#0f172a] text-white pb-24 view-transition overflow-x-hidden">
      <header class="p-6 flex justify-between items-center sticky top-0 z-40 bg-[#0f172a]/80 backdrop-blur-lg">
        <h1 class="text-xl font-black tracking-tighter text-emerald-500">UBUNTUPAY</h1>
        <button id="logout-btn" class="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700 hover:text-red-500 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7" stroke-width="2" stroke-linecap="round"></path></svg>
        </button>
      </header>

      <main class="p-6 max-w-xl mx-auto space-y-8">
        <div class="relative bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 overflow-hidden shadow-2xl">
          <div class="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <p class="text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Available Funds</p>
          <h2 class="text-5xl font-light tracking-tighter mb-10">R ${user.balance.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</h2>
          <div class="flex space-x-3">
            <button id="send-trigger" class="flex-1 bg-emerald-500 text-slate-900 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20">Pay</button>
            <button class="flex-1 bg-slate-800 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border border-slate-700">Top Up</button>
          </div>
        </div>

        <div class="grid grid-cols-4 gap-4">
          ${renderService('buy-power', 'Power', 'M13 10V3L4 14h7v7l9-11h-7z')}
          ${renderService('buy-data', 'Data', 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z')}
          ${renderService('scan-pay', 'Scan', 'M3 7V5a2 2 0 012-2h2m10 0h2a2 2 0 012 2v2m0 10v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2')}
          ${renderService('more', 'History', 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z')}
        </div>

        <div class="bg-slate-900 rounded-[2rem] p-8 border border-slate-800">
           <h3 class="font-bold mb-6 text-slate-400 uppercase text-xs tracking-widest">Recent Activity</h3>
           <div class="space-y-6">
             ${user.transactions.length > 0 ? user.transactions.map(tx => `
               <div class="flex justify-between items-center">
                 <div class="flex items-center space-x-4">
                    <div class="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">🇿🇦</div>
                    <div>
                      <p class="text-sm font-bold">${tx.type}</p>
                      <p class="text-[9px] font-black text-slate-500 uppercase">${new Date(tx.date).toLocaleDateString()}</p>
                    </div>
                 </div>
                 <p class="font-bold ${tx.type.includes('Receive') ? 'text-emerald-500' : 'text-slate-300'}">R ${tx.amount.toFixed(2)}</p>
               </div>
             `).join('') : '<p class="text-center text-slate-600 text-xs italic">No activity yet</p>'}
           </div>
        </div>
      </main>

      <div id="scanner-container" class="fixed inset-0 z-50 bg-black hidden flex-col items-center justify-center">
        <video id="scanner-video" class="w-full h-full object-cover opacity-60"></video>
        <div class="absolute inset-0 border-[40px] border-black/60 flex flex-col items-center justify-center">
          <div class="w-64 h-64 border-2 border-emerald-500 rounded-3xl relative overflow-hidden">
            <div class="absolute top-0 left-0 w-full h-1 bg-emerald-500 shadow-[0_0_15px_emerald] scan-line"></div>
          </div>
          <button id="close-scanner" class="mt-20 bg-white/10 text-white px-10 py-4 rounded-2xl font-bold backdrop-blur-xl border border-white/20">Cancel</button>
        </div>
      </div>
    </div>`;
}

// --- HELPERS & LISTENERS ---

function renderService(id, label, iconPath) {
  return `
    <button id="${id}" class="flex flex-col items-center group">
      <div class="w-14 h-14 bg-slate-900 border border-slate-800 text-emerald-500 rounded-2xl flex items-center justify-center mb-2 group-active:scale-90 transition-all shadow-lg">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="${iconPath}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
      </div>
      <span class="text-[9px] font-black text-slate-500 uppercase tracking-tighter">${label}</span>
    </button>`;
}

function showToast(msg) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'bg-emerald-500 text-slate-900 px-8 py-4 rounded-2xl shadow-2xl text-[10px] font-black uppercase tracking-widest view-transition border-b-4 border-emerald-700';
  toast.innerText = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

function attachEventListeners() {
  const toggleBtn = document.getElementById('toggle-btn');
  if (toggleBtn) toggleBtn.addEventListener('click', () => { AppState.authMode = AppState.authMode === 'login' ? 'register' : 'login'; render(); });

  const authForm = document.getElementById('auth-form');
  if (authForm) {
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const pass = document.getElementById('password').value;
      if (AppState.authMode === 'login') { await AppState.login(email, pass); }
      else {
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        await AppState.register(name, email, phone, pass);
      }
    });
  }

  const sendBtn = document.getElementById('send-trigger');
  if (sendBtn) sendBtn.addEventListener('click', async () => {
    const email = prompt("Recipient Email:");
    const amount = prompt("Amount (R):");
    if (email && amount) await AppState.sendMoney(email, amount);
  });

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', () => AppState.logout());

  // SCANNER LOGIC
  const scanBtn = document.getElementById('scan-pay');
  const scannerContainer = document.getElementById('scanner-container');
  const video = document.getElementById('scanner-video');

  if (scanBtn) {
    scanBtn.addEventListener('click', async () => {
      try {
        scannerContainer.classList.remove('hidden');
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        video.srcObject = stream;
        video.play();

        setTimeout(async () => {
          stream.getTracks().forEach(track => track.stop());
          scannerContainer.classList.add('hidden');
          const amount = prompt("QR Scanned! Enter amount to pay Vendor:");
          if (amount) await AppState.sendMoney("vendor@ubuntupay.co.za", amount);
        }, 4000);
      } catch (err) { showToast("Camera Access Denied"); scannerContainer.classList.add('hidden'); }
    });
  }
}

function render() {
  const app = document.getElementById('app');
  app.innerHTML = AppState.currentView === 'home' ? HomeView() : DashboardView();
  attachEventListeners();
}

document.addEventListener('DOMContentLoaded', () => AppState.init());