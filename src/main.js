import './style.css';

// ============================================
// 1. STATE MANAGEMENT & PERSISTENCE
// ============================================
const AppState = {
  currentView: 'home',
  currentUser: null,
  isOnboarding: false,
  onboardingStep: 1,

  init() {
    const savedUser = localStorage.getItem('ubuntupay_user');
    const loginState = localStorage.getItem('ubuntupay_loggedIn');

    if (loginState === 'true' && savedUser) {
      this.currentUser = JSON.parse(savedUser);
      this.currentView = 'dashboard';
    }
    this.ensureDefaultUser();
  },

  ensureDefaultUser() {
    const users = this.getUsers();
    if (!users['john.doe@example.com']) {
      users['john.doe@example.com'] = {
        email: 'john.doe@example.com',
        password: btoa('password'),
        fullName: 'John Doe',
        phone: '+27 82 123 4567',
        balance: 1000.00,
        onboardingComplete: true,
        biometricEnabled: true,
        recoveryCode: this.generateRecoveryCode(),
        transactions: [
          { id: 1, date: new Date().toISOString(), type: 'Deposit', amount: 1000, status: 'Completed', recipient: 'Initial Balance' }
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

  register(email, password, fullName, phone) {
    const users = this.getUsers();
    if (users[email]) return { success: false, message: 'Email already registered' };

    const newUser = {
      email, fullName, phone,
      password: btoa(password),
      balance: 1000.00,
      onboardingComplete: false,
      recoveryCode: this.generateRecoveryCode(),
      transactions: [{ id: Date.now(), date: new Date().toISOString(), type: 'Deposit', amount: 1000, status: 'Completed', recipient: 'Welcome Bonus' }]
    };

    users[email] = newUser;
    localStorage.setItem('ubuntupay_users', JSON.stringify(users));
    return { success: true };
  },

  logout() {
    localStorage.removeItem('ubuntupay_loggedIn');
    this.currentUser = null;
    this.currentView = 'home';
  },

  generateRecoveryCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }
};

// ============================================
// 2. VIEW COMPONENTS (HTML Templates)
// ============================================

function HomeView() {
  return `
    <div class="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-6 flex flex-col items-center justify-center">
      <div class="w-20 h-20 bg-emerald-500 rounded-3xl shadow-xl flex items-center justify-center mb-6">
        <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      </div>
      <h1 class="text-3xl font-bold text-slate-900 mb-2 text-center">UbuntuPay</h1>
      <p class="text-slate-600 mb-8 text-center max-w-xs">Secure biometric payments for the South African community.</p>
      
      <div class="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8">
        <form id="login-form" class="space-y-4">
          <input type="email" id="login-email" placeholder="Email" required class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none">
          <input type="password" id="login-password" placeholder="Password" required class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none">
          <button type="submit" class="w-full bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-emerald-600 transition-all">Sign In</button>
        </form>
        <button id="biometric-login-btn" class="w-full mt-4 flex items-center justify-center space-x-2 text-emerald-600 font-medium py-2">
           <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" stroke-width="2" stroke-linecap="round"></path></svg>
           <span>Biometric Login</span>
        </button>
      </div>
    </div>`;
}

function DashboardView() {
  const user = AppState.currentUser;
  return `
    <div class="min-h-screen pb-20">
      <header class="bg-white p-6 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <h1 class="text-xl font-bold text-emerald-600">UbuntuPay</h1>
        <button id="logout-btn" class="p-2 text-slate-400 hover:text-red-500"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke-width="2" stroke-linecap="round"></path></svg></button>
      </header>
      
      <main class="p-6">
        <div class="bg-emerald-500 rounded-3xl p-8 text-white shadow-xl mb-8">
          <p class="opacity-80 text-sm mb-1">Total Balance</p>
          <h2 class="text-4xl font-bold mb-6">R ${user.balance.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</h2>
          <div class="flex space-x-4">
            <button id="send-money-btn" class="flex-1 bg-white/20 hover:bg-white/30 py-3 rounded-xl font-medium backdrop-blur-md">Send</button>
            <button id="deposit-btn" class="flex-1 bg-white/20 hover:bg-white/30 py-3 rounded-xl font-medium backdrop-blur-md">Top Up</button>
          </div>
        </div>
        
        <h3 class="font-bold text-slate-800 mb-4">Recent Activity</h3>
        <div class="space-y-4">
          ${user.transactions.map(tx => `
            <div class="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm">
              <div class="flex items-center space-x-4">
                <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <span class="text-lg">${tx.type === 'Deposit' ? '📥' : '📤'}</span>
                </div>
                <div>
                  <p class="font-bold text-slate-800">${tx.type}</p>
                  <p class="text-xs text-slate-400">${tx.recipient || 'Personal'}</p>
                </div>
              </div>
              <p class="font-bold ${tx.type === 'Deposit' ? 'text-emerald-500' : 'text-slate-800'}">
                ${tx.type === 'Deposit' ? '+' : '-'} R ${tx.amount}
              </p>
            </div>
          `).join('')}
        </div>
      </main>
    </div>`;
}

// ============================================
// 3. EVENT LISTENERS & UI LOGIC
// ============================================

function attachEventListeners() {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const pass = document.getElementById('login-password').value;
      if (AppState.login(email, pass)) {
        render();
      } else {
        alert("Invalid credentials. Use john.doe@example.com / password");
      }
    });
  }

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      AppState.logout();
      render();
    });
  }

  const bioBtn = document.getElementById('biometric-login-btn');
  if (bioBtn) {
    bioBtn.addEventListener('click', () => {
      // Logic for Biometric simulation
      alert("Simulating Biometric Scan...");
      setTimeout(() => {
        if (AppState.login('john.doe@example.com', 'password')) render();
      }, 1500);
    });
  }
}

// ============================================
// 4. CORE APP ENGINE
// ============================================

function render() {
  const app = document.getElementById('app');
  let content = '';

  switch (AppState.currentView) {
    case 'home': content = HomeView(); break;
    case 'dashboard': content = DashboardView(); break;
    case 'onboarding': content = `Onboarding Step ${AppState.onboardingStep}`; break;
    case 'profile': content = `Profile Settings`; break;
    default: content = HomeView();
  }

  app.innerHTML = content;
  attachEventListeners();
}

// Global Initialization
document.addEventListener('DOMContentLoaded', () => {
  AppState.init();
  render();
});

window.AppState = AppState;