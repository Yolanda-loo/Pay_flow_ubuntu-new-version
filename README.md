# UbuntuPay - Progressive Web App

A fully functional, offline-first Progressive Web App (PWA) that simulates a secure biometric payment system for South African users. Built with vanilla JavaScript, HTML, and Tailwind CSS.

## Features

### Authentication & Security
- **Dual Login Methods**: Email/password login or simulated biometric login (Face ID/Fingerprint)
- **New User Registration**: Streamlined registration flow with email, password, full name, and phone
- **Mandatory Onboarding**: Two-step process for new users:
  - Step 1: ID Verification with simulated document upload
  - Step 2: Face Registration with simulated biometric scan
- **Profile Management**: Update personal details and manage security settings
- **Recovery Code**: Auto-generated 12-character recovery code for account recovery

### Core Financial Features
- **Live Dashboard**: Personalized greeting with real-time account balance in ZAR (R)
- **Send Money**: Transfer funds with biometric authentication
- **Deposit**: Add funds to your account
- **Withdraw**: Remove funds with biometric verification
- **Transaction History**: View recent transactions with detailed information

### Biometric Integration (Simulated)
- **Payment Authentication**: Face ID or Fingerprint verification for sends and withdrawals
- **Biometric Login**: Quick access with simulated biometric scan
- **Animated Scanning**: Realistic scanning animations with 2-second delay

### Offline-First PWA
- **Service Worker**: Caches all assets for offline functionality
- **Installable**: Add to home screen with custom icons
- **Data Persistence**: All user data stored in localStorage
- **Offline Banner**: Automatic detection and notification of offline status

## Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: Tailwind CSS (via CDN)
- **PWA**: Service Worker for caching and offline support
- **Storage**: localStorage for data persistence
- **Build Tool**: Vite

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Modern web browser (Chrome, Firefox, Edge, Safari)

### Installation

1. Clone the repository:
```bash
git clone <repository-url> ubuntupay-app
cd ubuntupay-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:5173
```

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Testing the App

### Default Test Credentials
- **Email**: john.doe@example.com
- **Password**: password

### Testing Workflow

1. **First-Time User (Registration)**:
   - Fill out the registration form with your details
   - Upload ID images (front and back) - any image file works
   - Complete face registration with simulated scan
   - Access the dashboard

2. **Returning User (Login)**:
   - Use email/password or biometric login
   - Access dashboard immediately

3. **Send Money**:
   - Click "Send" button
   - Enter recipient email/phone and amount
   - Authenticate with Face ID or Fingerprint
   - Transaction completes instantly

4. **Deposit/Withdraw**:
   - Click respective buttons
   - Enter amount
   - Withdraw requires biometric authentication
   - Balance updates immediately

5. **Profile Management**:
   - Click "Profile" button
   - Update name and phone number
   - Enable/disable SMS and email alerts
   - Generate new recovery code

6. **Offline Testing**:
   - Load the app once while online
   - Disconnect from internet
   - App continues to work fully
   - Reconnect to see online status

### Installing as PWA

1. **Desktop (Chrome/Edge)**:
   - Click the install icon in the address bar
   - Or use browser menu: "Install UbuntuPay"

2. **Mobile (Android/iOS)**:
   - Open the app in browser
   - Tap "Add to Home Screen" from browser menu
   - App opens as standalone application

## Project Structure

```
ubuntupay-app/
├── index.html          # Main SPA file with all HTML, CSS, and JS
├── manifest.json       # PWA manifest configuration
├── sw.js              # Service Worker for offline functionality
├── public/
│   ├── icon-192.svg   # App icon (192x192)
│   ├── icon-512.svg   # App icon (512x512)
│   └── vite.svg       # Vite logo
├── package.json       # Project dependencies and scripts
└── README.md          # This file
```

## Key Features Explained

### State Management
- All state managed in vanilla JavaScript `AppState` object
- Persistent storage using localStorage
- Automatic state synchronization

### Security Simulations
- Passwords encoded with `btoa()` for demo purposes
- Biometric scans simulated with 2-second delay
- All validations happen client-side

### Currency Formatting
- South African Rand (ZAR) with proper formatting
- Format: R 1,000.00

### Responsive Design
- Mobile-first approach
- Works seamlessly on desktop and mobile
- Tailwind CSS utility classes
- Custom animations and transitions

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Requires service worker support

## Future Enhancements

Potential features for future versions:
- Real backend API integration
- Actual biometric API (WebAuthn)
- Push notifications
- Background sync for transactions
- QR code payments
- Multi-currency support
- Transaction export (PDF/CSV)
- Dark mode

## Troubleshooting

### Service Worker Not Registering
- Ensure you're serving over HTTPS or localhost
- Check browser console for errors
- Try clearing browser cache

### App Not Installing
- Ensure manifest.json is accessible
- Check that icons are loading correctly
- Verify service worker is registered

### Data Not Persisting
- Check localStorage is enabled in browser
- Ensure not in private/incognito mode
- Check for localStorage quota issues

## Development Notes

- Single-page application (SPA) architecture
- No external dependencies for core functionality
- All simulations use timeouts and mock data
- No real payment processing
- For demo/educational purposes only

## Security Disclaimer

**IMPORTANT**: This is a demonstration application only. It simulates payment flows and biometric authentication for educational purposes. Do NOT use this code in production for real financial transactions without:

1. Proper backend API with authentication
2. Real payment gateway integration
3. Actual biometric authentication (WebAuthn)
4. Proper encryption and security measures
5. Compliance with financial regulations
6. Professional security audit

## License

This project is for educational and demonstration purposes.

## Credits

Built with:
- Vanilla JavaScript
- Tailwind CSS
- Vite
- Service Workers API
- Web App Manifest

---

**UbuntuPay** - Secure Biometric Payments Demo
