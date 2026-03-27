
# 🇿🇦 UbuntuPay: Full-Stack Biometric PWA

**UbuntuPay** is a high-fidelity, offline-first Progressive Web App (PWA) designed to simulate a modern South African banking ecosystem. It features a "Fintech Dark" aesthetic, real-time MongoDB integration, and hardware-level API access for QR scanning.


## 🚀 Technical Highlights

* **Full-Stack Architecture**: Built with the MERN-lite stack (Node.js, Express, MongoDB Atlas).
* **P2P Transaction Engine**: Atomic updates ensure data integrity when sending money between users.
* **Utility Integration**: Simulated Eskom prepaid electricity and airtime purchase system with 20-digit token generation.
* **Hardware API Access**: Real-time camera integration for QR code scanning using `getUserMedia`.
* **Secure Authentication**: Industry-standard password hashing with `bcrypt` and session management via **JSON Web Tokens (JWT)**.
* **Dynamic QR Generation**: On-the-fly canvas rendering of personal Pay IDs using the `qrcode` library.

---

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Vanilla JavaScript (ES6+), Vite, Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas (Cloud Cluster) |
| **Security** | JWT, BcryptJS, Dotenv |
| **PWA** | Service Workers, Web App Manifest |

---

## 📂 Project Structure

```text
ubuntupay-app/
├── server/
│   ├── models/User.js      # MongoDB Schema (Users, Balances, Tx)
│   └── server.js           # Express API & Transaction Logic
├── src/
│   ├── main.js             # Frontend State, Views & Scanner Logic
│   └── style.css           # Custom Glassmorphism & Scan Animations
├── public/                 # PWA Icons & Manifest
├── index.html              # SPA Entry Point
└── vite.config.js          # Build Configuration
```

---

## 🚦 Getting Started

### 1. Prerequisites
* Node.js (v18+)
* MongoDB Atlas Account

### 2. Installation
```bash
# Clone the repository
git clone <your-repo-link>
cd ubuntupay-app

# Install dependencies
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```text
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_random_string
PORT=5000
```

### 4. Running the App
You will need two terminal windows:
* **Terminal 1 (Backend)**: `node server/server.js`
* **Terminal 2 (Frontend)**: `npm run dev`

---

## 📱 Features in Action

### **Real-Time P2P Payments**
Users can search for other registered members via email and transfer ZAR instantly. The system validates sufficient funds and updates both ledgers in real-time.

### **Utility Ecosystem**
Simulate the South African experience of buying prepaid electricity. The system deducts the balance and generates a unique, valid-format 20-digit meter token.

### **QR Pay & Receive**
The app leverages the device camera to "scan" a recipient's email from a QR code. Users can also display their own unique QR code to receive payments without sharing sensitive details.

---

## ⚠️ Disclaimer
This project is a **functional prototype** built for educational purposes. While it uses real encryption (Bcrypt) and secure tokens (JWT), it should not be used for real financial transactions.

---

**Built by Tebogo Mathaba** 

