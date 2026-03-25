import './style.css';

const API_URL = 'http://localhost:5000/api';

const AppState = {
  currentView: 'home',
  authMode: 'login',
  currentUser: null,
  token: localStorage.getItem('token') || null,

  async init() {
    // Check if user was logged in previously
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
      showToast(data.message);
    }
  },

  async sendMoney(recipientEmail, amount) {
    showToast("Processing Payment...");
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
    <div class="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div class="bg-white w-full max-w-md rounded-[2rem] shadow-2xl p-10 border border-slate-100">
        <h1 class="text-3xl font-black text-emerald-600 mb-2 text-center">UbuntuPay</h1>
        <p class="text-center text-slate-400 text-xs font-bold uppercase tracking-widest mb-8">${isLogin ? 'Sign In' : 'Create Account'}</p>
        
        <form id="auth-form" class="space-y-4">
          ${!isLogin ? `
            <input type="text" id="name" placeholder="Full Name" required class="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500">
            <input type="tel" id="phone" placeholder="Phone Number" required class="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500">
          ` : ''}
          <input type="email" id="email" placeholder="Email" required class="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500">
          <input type="password" id="password" placeholder="Password" required class="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500">
          <button type="submit" class="w-full bg-slate-900 text-white font-bold py-5 rounded-2xl shadow-lg uppercase tracking-widest text-xs">${isLogin ? 'Login' : 'Register'}</button>
        </form>
        <button id="toggle-btn" class="w-full mt-6 text-emerald-600 font-bold text-sm">${isLogin ? 'Need an account? Register' : 'Have an account? Login'}</button>
      </div>
    </div>`;
}

function DashboardView() {
  const user = AppState.currentUser;
  return `
    <div class="min-h-screen bg-slate-50">
      <header class="bg-white p-6 flex justify-between items-center shadow-sm">
        <span class="font-black text-emerald-600">UBUNTUPAY</span>
        <button id="logout-btn" class="text-red-500 font-bold text-xs uppercase">Logout</button>
      </header>
      <main class="p-6 max-w-lg mx-auto">
        <div class="bg-slate-900 rounded-[2.5rem] p-10 text-white mb-10 shadow-2xl">
          <p class="text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-2">My Balance</p>
          <h2 class="text-5xl font-light mb-10">R ${user.balance.toFixed(2)}</h2>
          <div class="flex space-x-4">
            <button id="send-trigger" class="flex-1 bg-emerald-500 py-4 rounded-2xl text-xs font-black uppercase shadow-lg shadow-emerald-900/20">Send Money</button>
          </div>
        </div>
        <div class="space-y-4">
          <h3 class="font-bold text-slate-800 px-2 text-lg">Transactions</h3>
          ${user.transactions.map(tx => `
            <div class="bg-white p-5 rounded-2xl flex justify-between items-center border border-slate-100 shadow-sm">
               <div>
                 <p class="text-sm font-bold text-slate-800">${tx.type} ${tx.recipient ? 'to ' + tx.recipient : ''}</p>
                 <p class="text-[10px] text-slate-400 font-bold uppercase">${new Date(tx.date).toLocaleDateString()}</p>
               </div>
               <p class="font-black ${tx.type === 'Receive' ? 'text-emerald-500' : 'text-slate-900'}">R ${tx.amount}</p>
            </div>
          `).join('')}
        </div>
      </main>
    </div>`;
}

// --- LOGIC ---

function attachEventListeners() {
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
        if (res.ok) {
          showToast("Registered! Log in now.");
          AppState.authMode = 'login';
          render();
        }
      }
    });
  }

  const toggleBtn = document.getElementById('toggle-btn');
  if (toggleBtn) toggleBtn.addEventListener('click', () => {
    AppState.authMode = AppState.authMode === 'login' ? 'register' : 'login';
    render();
  });

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', () => AppState.logout());

  const sendTrigger = document.getElementById('send-trigger');
  if (sendTrigger) sendTrigger.addEventListener('click', async () => {
    const email = prompt("Recipient Email:");
    const amount = prompt("Amount (ZAR):");
    if (email && amount) await AppState.sendMoney(email, amount);
  });
}

function showToast(msg) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl text-xs font-black uppercase tracking-widest border-b-4 border-emerald-500';
  toast.innerText = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

function render() {
  const app = document.getElementById('app');
  app.innerHTML = AppState.currentView === 'home' ? HomeView() : DashboardView();
  attachEventListeners();
}

document.addEventListener('DOMContentLoaded', () => AppState.init());