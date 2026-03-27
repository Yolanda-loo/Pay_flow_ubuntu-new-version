import './style.css';
import QRCode from 'qrcode';

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

  async buyUtility(type, amount, provider) {
    const res = await fetch(`${API_URL}/utility`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: this.currentUser.email, type, amount, provider })
    });
    const data = await res.json();
    if (res.ok) {
      this.currentUser = data.user;
      localStorage.setItem('user_data', JSON.stringify(data.user));
      if(type === 'Electricity') alert(`⚡ METER TOKEN:\n${data.token}`);
      render();
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
      showToast("Payment Successful 🇿🇦");
      render();
    }
  },

  async showMyQRCode() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-[60] bg-black/95 flex flex-col items-center justify-center p-6';
    const canvas = document.createElement('canvas');
    canvas.className = 'rounded-3xl border-8 border-white shadow-2xl';
    await QRCode.toCanvas(canvas, this.currentUser.email, { width: 280, margin: 2 });
    modal.innerHTML = `<h2 class="text-emerald-500 font-bold mb-4 uppercase tracking-widest text-xs">My Pay ID</h2><div id="qr-wrap"></div><button id="close-qr" class="mt-10 bg-white/10 text-white px-8 py-4 rounded-2xl border border-white/20">Close</button>`;
    document.body.appendChild(modal);
    document.getElementById('qr-wrap').appendChild(canvas);
    document.getElementById('close-qr').onclick = () => modal.remove();
  }
};

// --- VIEWS ---

function DashboardView() {
  const user = AppState.currentUser;
  return `
    <div class="min-h-screen bg-[#0f172a] text-white pb-24 view-transition">
      <header class="p-6 flex justify-between items-center sticky top-0 z-40 bg-[#0f172a]/80 backdrop-blur-lg">
        <h1 class="text-xl font-black text-emerald-500 italic tracking-tighter">UBUNTUPAY</h1>
        <button id="logout-btn" class="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7" stroke-width="2" stroke-linecap="round"></path></svg>
        </button>
      </header>

      <main class="p-6 max-w-xl mx-auto space-y-8">
        <div class="relative bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 overflow-hidden shadow-2xl">
          <div class="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <p class="text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-shadow-glow">Global Balance</p>
          <h2 class="text-5xl font-light tracking-tighter mb-10">R ${user.balance.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</h2>
          <div class="flex space-x-3">
            <button id="send-trigger" class="flex-1 bg-emerald-500 text-slate-900 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20">Pay</button>
            <button id="my-qr" class="flex-1 bg-slate-800 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border border-slate-700">My QR</button>
          </div>
        </div>

        <div class="grid grid-cols-4 gap-4">
          ${renderService('buy-power', 'Power', 'M13 10V3L4 14h7v7l9-11h-7z')}
          ${renderService('buy-data', 'Data', 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z')}
          ${renderService('scan-pay', 'Scan', 'M3 7V5a2 2 0 012-2h2m10 0h2a2 2 0 012 2v2m0 10v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2')}
          ${renderService('more', 'History', 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z')}
        </div>

        <div class="bg-slate-900 rounded-[2rem] p-8 border border-slate-800">
           <h3 class="font-bold mb-6 text-slate-500 uppercase text-xs tracking-widest italic">Activity History</h3>
           <div class="space-y-6">
             ${user.transactions.map(tx => `
               <div class="flex justify-between items-center">
                 <div class="flex items-center space-x-4">
                    <div class="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-lg">🇿🇦</div>
                    <div>
                      <p class="text-sm font-bold text-slate-200">${tx.type}</p>
                      <p class="text-[9px] font-black text-slate-500 uppercase">${new Date(tx.date).toLocaleDateString()}</p>
                    </div>
                 </div>
                 <p class="font-bold ${tx.type.includes('Receive') ? 'text-emerald-500' : 'text-slate-300'}">R ${tx.amount.toFixed(2)}</p>
               </div>
             `).join('')}
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

// ... (Keep renderService, HomeView, showToast from previous versions) ...

function attachEventListeners() {
  document.getElementById('my-qr')?.addEventListener('click', () => AppState.showMyQRCode());
  document.getElementById('buy-power')?.addEventListener('click', () => {
    const amt = prompt("Enter Power Amount (R):");
    if(amt) AppState.buyUtility('Electricity', amt, 'Eskom');
  });
  
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
          const email = prompt("Recipient Scanned! Enter Email:");
          const amount = prompt("Enter Amount (R):");
          if (email && amount) await AppState.sendMoney(email, amount);
        }, 3500);
      } catch (err) { scannerContainer.classList.add('hidden'); }
    });
  }
}
// ... (Render and Init logic) ...