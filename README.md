# GlideMoney - Gig Cashflow Coach

A Canada-first mobile app that helps rideshare & delivery workers stay cash-flow positive, avoid overdrafts, and stop tax-time surprises.

## 🚀 What We've Built So Far

### ✅ Completed Features
- **Project Structure**: Clean, industry-standard folder organization
- **Navigation**: Bottom tab navigation with 8 main sections
- **Home Screen**: Beautiful dashboard showing safe-to-spend, set-asides, and quick actions
- **Type System**: Comprehensive TypeScript interfaces for all app data
- **Constants**: Canadian tax rates, province information, and app-wide constants
- **Placeholder Screens**: All main screens created with "Coming Soon" placeholders

### 🔄 In Progress
- Firebase integration setup
- Real data implementation
- Bank connection functionality

### 📱 Screens Available
1. **Home** - Main dashboard with financial overview
2. **Income** - Gig platform income streams (placeholder)
3. **Set Aside** - Weekly tax planning (placeholder)
4. **Bills** - Recurring bills management (placeholder)
5. **Transactions** - Transaction history (placeholder)
6. **Export** - CRA reports and exports (placeholder)
7. **Settings** - User preferences (placeholder)
8. **Learn** - Financial education (placeholder)

## 🏗️ Project Structure

```
glidemoney/
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/            # Main app screens
│   ├── navigation/         # Navigation setup
│   ├── services/           # Firebase and API services
│   ├── types/              # TypeScript interfaces
│   ├── utils/              # Helper functions
│   ├── constants/          # App-wide constants
│   ├── hooks/              # Custom React hooks
│   └── assets/             # Images, fonts, etc.
├── App.tsx                 # Main app component
├── package.json            # Dependencies
└── README.md              # This file
```

## 🛠️ Tech Stack

- **Frontend**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation v7
- **Backend**: Firebase (planned)
- **Styling**: React Native StyleSheet
- **Icons**: Expo Vector Icons

## 🚀 How to Run the App

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for Mac) or Android Emulator

### Installation Steps

1. **Install Dependencies**
   ```bash
   cd glidemoney
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

3. **Run on Device/Simulator**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app on your phone

### Development Commands

```bash
# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web
```

## 📱 What You'll See

When you run the app, you'll see:

1. **Home Tab**: A beautiful dashboard with:
   - Safe-to-spend amount (mock data: $2,625.25)
   - Weekly set-aside breakdown (mock data: $230.86)
   - Quick action buttons
   - Financial breakdown cards

2. **Other Tabs**: Placeholder screens with "Coming Soon" messages

3. **Navigation**: Bottom tab bar with icons for each section

## 🔧 Next Steps

### Phase 1: Core Functionality
- [ ] Firebase project setup
- [ ] User authentication
- [ ] Real data models
- [ ] Basic CRUD operations

### Phase 2: Bank Integration
- [ ] Bank connection setup
- [ ] Transaction import
- [ ] Income stream detection

### Phase 3: Tax Calculations
- [ ] Set-aside calculator
- [ ] Province-specific tax rates
- [ ] HST/QST threshold tracking

### Phase 4: Advanced Features
- [ ] Bill tracking
- [ ] Export functionality
- [ ] Notifications
- [ ] Learning content

## 🎯 Key Features (Planned)

- **Safe-to-Spend Calculator**: Real-time calculation of available funds
- **Weekly Set-Aside Planning**: Automatic tax, CPP, and HST/QST calculations
- **Income Prediction**: ML-based payout forecasting for gig platforms
- **Bill Management**: Track recurring payments and avoid overdrafts
- **CRA Export**: Generate tax-ready reports and summaries
- **Province-Aware**: Automatic tax calculations based on Canadian province

## 🏛️ Canadian Tax Compliance

The app is designed to handle:
- **CPP Contributions**: 5.95% rate with maximum limits
- **Provincial Taxes**: All 13 provinces and territories
- **HST/GST/QST**: Province-specific rates and thresholds
- **T2125 Support**: Business income reporting for self-employed

## 🤝 Contributing

This is a step-by-step development project. Each feature is built incrementally to ensure quality and avoid bugs.

## 📞 Support

For questions or issues, please refer to the project documentation or create an issue in the repository.

---

**Built with ❤️ for Canadian gig workers**
