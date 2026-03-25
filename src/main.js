import './style.css';

// ============================================
// 1. STATE MANAGEMENT & PERSISTENCE
// ============================================
const AppState = {
  currentView: 'home',
  currentUser: null,
  onboardingStep: 1,

  init() {
    const savedUser = localStorage.getItem('ubuntupay_user');
    const loginState = localStorage.getItem('ubuntupay_loggedIn');

    if (loginState === 'true' && savedUser) {
      this.currentUser = JSON.parse(savedUser);
      // Determine where to send the user based on onboarding status
      this.currentView = this.currentUser.onboardingComplete ? 'dashboard' : 'onboarding';
    }
    this.ensureDefaultUser();
  },

  ensureDefaultUser() {
    const users = this.getUsers();
    const demoEmail = 'john.doe@example.com';
    if (!users[demoEmail]) {
      users[demoEmail] = {
        email: demoEmail,
        password: btoa('password'),
        fullName: 'John Doe',
        phone: '+27 82 123 4567',
        balance: 1250.50,
        onboardingComplete: true, // Demo user is already verified
        biometricEnabled: true,
        recoveryCode: 'UBUNTU-DEMO-2026',
        transactions: [
          { id: 1, date: new Date().toISOString(), type: 'Deposit', amount: 1250.50, status: 'Completed', recipient: 'Standard Bank Transfer' }
        ]
      };
      localStorage.setItem('ubuntupay_users', JSON.stringify(users));
    }
  },

  getUsers() {
    return JSON.parse(localStorage.getItem('ubuntupay_users') || '{}');
  },

  saveCurrentUser() {
    if (this.currentUser) {
      localStorage.setItem('ubuntupay_user', JSON.stringify(this.currentUser));
      const users = this.getUsers();
      users[this.currentUser.email] = this.currentUser;
      localStorage.setItem('ubuntupay_users', JSON.stringify(users));
    }
  },

  login(email, password) {
    const users = this.getUsers();
    const user = users[email.toLowerCase()];
    if (user && user.password === btoa(password)) {
      this.currentUser = user;
      localStorage.setItem('ubuntupay_loggedIn', 'true');
      this.saveCurrentUser();
      this.currentView = user.onboardingComplete ? 'dashboard' : 'onboarding';
      return true;
    }
    return false;
  },

  logout() {
    localStorage.removeItem('ubuntupay_loggedIn');
    localStorage.removeItem('ubuntupay_user');
    this.currentUser = null;
    this.currentView = 'home';
    this.onboardingStep = 1;
  }
};

// ============================================
// 2. VIEW COMPONENTS (HTML Templates)
// ============================================

function HomeView() {
  return `
    <div class="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-6 flex flex-col items-center justify-center view-transition">
      <div class="w-20 h-20 bg-emerald-500 rounded-3xl shadow-xl flex items-center justify-center mb-6">
        <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      </div>
      <h1 class="text-3xl font-bold text-slate-900 mb-2">UbuntuPay</h1>
      <p class="text-slate-600 mb-8 text-center max-w-xs">Secure payments for South Africa.</p>
      
      <div class="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8">
        <form id="login-form" class="space-y-4">
          <input type="email" id="login-email" placeholder="Email" required class="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500">
          <input type="password" id="login-password" placeholder="Password" required class="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500">
          <button type="submit" class="w-full bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-emerald-600 transition-all">Sign In</button>
        </form>
        <button id="biometric-login-btn" class="w-full mt-4 flex items-center justify-center space-x-2 text-emerald-600 font-medium py-2">
           <span>Use Face ID / Fingerprint</span>
        </button>
      </div>
    </div>`;
}

function OnboardingView() {
  const step = AppState.onboardingStep;
  return `
    <div class="min-h-screen bg-slate-50 p-6 flex flex-col items-center view-transition">
      <div class="w-full max-w-md">
        <div class="flex justify-between items-center mb-8">
          <div class="flex flex-col">
            <span class="text-xs font-bold text-slate-400">STEP ${step} OF 2</span>
            <h2 class="text-2xl font-bold text-slate-900">${step === 1 ? 'Verify Identity' : 'Face Registration'}</h2>
          </div>
        </div>

        ${step === 1 ? `
          <div class="bg-white rounded-3xl shadow-xl p-8 text-center">
            <p class="text-slate-600 mb-8">Upload a photo of your South African ID.</p>
            <label class="block w-full border-2 border-dashed border-slate-200 rounded-2xl p-10 cursor-pointer hover:border-emerald-500 transition-all mb-6">
              <input type="file" id="id-upload" class="hidden" accept="image/*">
              <span class="text-emerald-600 font-bold">Capture ID Document</span>
            </label>
            <button id="next-step-btn" class="w-full bg-slate-200 text-slate-400 py-4 rounded-xl font-bold transition-all" disabled>Continue</button>
          </div>
        ` : `
          <div class="bg-white rounded-3xl shadow-xl p-8 text-center">
            <div class="relative w-48 h-48 mx-auto mb-10">
              <div class="absolute inset-0 border-4 border-emerald-500 rounded-full pulse-scan"></div>
              <div class="w-full h-full rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                 <svg class="w-20 h-20 text-slate-300" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path></svg>
              </div>
            </div>
            <button id="start-scan-btn" class="w-full bg-emerald-500 text-white py-4 rounded-xl font-bold shadow-lg">Start Face Scan</button>
          </div>
        `}
      </div>
    </div>`;
}

function DashboardView() {
  const user = AppState.currentUser;
  return `
    <div class="min-h-screen bg-slate-50 view-transition">
      <header class="bg-white p-6 flex justify-between items-center shadow-sm">
        <h1 class="text-xl font-bold text-emerald-600">UbuntuPay</h1>
        <button id="logout-btn" class="text-slate-400 hover:text-red-500 underline text-sm">Logout</button>
      </header>
      
      <main class="p-6">
        <div class="bg-emerald-500 rounded-3xl p-8 text-white shadow-xl mb-8">
          <p class="opacity-80 text-sm mb-1">Available Balance</p>
          <h2 class="text-4xl font-bold mb-6">R ${user.balance.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</h2>
          <div class="flex space-x-4">
            <button class="flex-1 bg-white/20 py-3 rounded-xl font-medium backdrop-blur-md">Send</button>
            <button class="flex-1 bg-white/20 py-3 rounded-xl font-medium backdrop-blur-md">Top Up</button>
          </div>
        </div>
        
        <h3 class="font-bold text-slate-800 mb-4 text-lg">Recent Transactions</h3>
        <div class="space-y-4">
          ${user.transactions.map(tx => `
            <div class="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm border border-slate-100">
              <div class="flex items-center space-x-4">
                <div class="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                  <span>${tx.type === 'Deposit' ? '🇿🇦' : '💸'}</span>
                </div>
                <div>
                  <p class="font-bold text-slate-800">${tx.type}</p>
                  <p class="text-xs text-slate-400">${new Date(tx.date).toLocaleDateString()}</p>
                </div>
              </div>
              <p class="font-bold text-emerald-600">R ${tx.amount}</p>
            </div>
          `).join('')}
        </div>
      </main>
    </div>`;
}

// ============================================
// 3. UTILITIES & EVENT LISTENERS
// ============================================

function showToast(msg) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl text-sm animate-bounce';
  toast.innerText = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function attachEventListeners() {
  // Login Logic
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const pass = document.getElementById('login-password').value;
      if (AppState.login(email, pass)) {
        render();
      } else {
        showToast("Invalid Credentials");
      }
    });
  }

  // Logout Logic
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      AppState.logout();
      render();
    });
  }

  // ID Upload Logic
  const idInput = document.getElementById('id-upload');
  if (idInput) {
    idInput.addEventListener('change', () => {
      const btn = document.getElementById('next-step-btn');
      btn.disabled = false;
      btn.className = "w-full bg-emerald-500 text-white py-4 rounded-xl font-bold shadow-lg";
      showToast("ID Uploaded!");
    });
  }

  const nextBtn = document.getElementById('next-step-btn');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      AppState.onboardingStep = 2;
      render();
    });
  }

  // Face Scan Simulation
  const scanBtn = document.getElementById('start-scan-btn');
  if (scanBtn) {
    scanBtn.addEventListener('click', () => {
      scanBtn.innerText = "Scanning Face...";
      scanBtn.disabled = true;
      setTimeout(() => {
        AppState.currentUser.onboardingComplete = true;
        AppState.saveCurrentUser();
        AppState.currentView = 'dashboard';
        render();
        showToast("Welcome to UbuntuPay!");
      }, 2500);
    });
  }
}

// ============================================
// 4. CORE RENDER ENGINE
// ============================================

function render() {
  const app = document.getElementById('app');
  let content = '';

  switch (AppState.currentView) {
    case 'home': content = HomeView(); break;
    case 'onboarding': content = OnboardingView(); break;
    case 'dashboard': content = DashboardView(); break;
    default: content = HomeView();
  }

  app.innerHTML = content;
  attachEventListeners();
}

// Global Init
document.addEventListener('DOMContentLoaded', () => {
  AppState.init();
  render();
});