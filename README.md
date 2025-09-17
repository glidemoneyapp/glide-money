# GlideMoney 💰

A comprehensive **Gig Cashflow Coach** mobile app designed specifically for Canadian gig workers. GlideMoney helps freelancers, contractors, and gig economy workers manage their finances, track income streams, and stay compliant with Canadian tax requirements.

## 🚀 Features

### Core Functionality
- **Income Tracking** - Monitor multiple income streams from various gig platforms
- **Set-Aside Planning** - Automatically calculate tax reserves (CPP, Income Tax, HST)
- **Bank Integration** - Connect bank accounts via Plaid for real-time transaction monitoring
- **GlideGuard** - Smart financial protection and planning tools
- **Canadian Tax Compliance** - Built-in support for Canadian tax rates and regulations

### Screens & Navigation
- **Home Dashboard** - Overview of financial health and key metrics
- **Income Streams** - Track earnings from Uber, DoorDash, SkipTheDishes, and more
- **Set Aside** - Manage tax reserves and compliance
- **Transactions** - View and categorize bank transactions
- **Bills** - Track recurring expenses and payments
- **Learn** - Educational content for gig workers
- **Settings** - App configuration and preferences

### Platform Support
- **iOS** - Native iOS app via Expo
- **Android** - Native Android app via Expo
- **Web** - Progressive web app support

## 🛠 Tech Stack

### Frontend
- **React Native** 0.81.4 - Cross-platform mobile development
- **Expo SDK 54** - Development platform and tooling
- **React 19.1.0** - UI library
- **TypeScript 5.9.2** - Type-safe development

### Navigation & UI
- **React Navigation v7** - Navigation library
- **Expo Vector Icons** - Icon system
- **React Native SVG** - Vector graphics
- **React Native Gesture Handler** - Touch interactions
- **React Native Safe Area Context** - Safe area handling

### Backend & Data
- **Firebase** - Backend services
  - Authentication
  - Firestore Database
  - Cloud Functions
- **Firebase Data Connect** - GraphQL-like API layer
- **Plaid Link SDK** - Bank account integration
- **React Native AsyncStorage** - Local data persistence

### Charts & Visualization
- **React Native Chart Kit** - Financial data visualization
- **Expo Linear Gradient** - UI gradients

## 📱 Getting Started

### Prerequisites
- **Node.js** 18+ 
- **npm** or **yarn**
- **Expo CLI** (`npm install -g @expo/cli`)
- **iOS Simulator** (for iOS development) or **Android Studio** (for Android)
- **Expo Go app** on your phone for testing

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/glidemoneyapp/glide-money.git
   cd glide-money
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   - **iOS**: `npm run ios` or scan QR code with Camera app
   - **Android**: `npm run android` or scan QR code with Expo Go
   - **Web**: `npm run web`

### Development Commands

```bash
# Start Expo development server
npm start

# Start with specific platform
npm run ios      # iOS simulator
npm run android  # Android emulator
npm run web      # Web browser

# Type checking
npx tsc --noEmit

# Clear Expo cache
npx expo start --clear
```

## 🔧 Configuration

### Firebase Setup
1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication and Firestore
3. Add your Firebase config to `src/config/firebase.ts`

### Plaid Integration
1. Sign up for Plaid at [plaid.com](https://plaid.com)
2. Configure your Plaid credentials in `src/services/plaid.ts`

### Environment Variables
Create a `.env` file in the root directory:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_PLAID_CLIENT_ID=your_plaid_client_id
```

## 📁 Project Structure

```
glidemoney/
├── src/
│   ├── components/          # Reusable UI components
│   ├── config/             # App configuration
│   ├── constants/          # App constants and themes
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom React hooks
│   ├── navigation/         # Navigation configuration
│   ├── screens/            # App screens
│   ├── services/           # API and external services
│   ├── types/              # TypeScript type definitions
│   └── ui/                 # UI components
├── assets/                 # Images and static assets
├── functions/              # Firebase Cloud Functions
├── dataconnect/           # Firebase Data Connect schema
└── firestore.rules        # Firestore security rules
```

## 🎯 Key Features Explained

### Set-Aside Planning
Automatically calculates and tracks:
- **CPP Contributions** (5.95% for 2024)
- **Income Tax** (based on federal brackets)
- **HST/GST** (province-specific rates)
- **Reserve Management** for quarterly payments

### Income Stream Tracking
Supports major Canadian gig platforms:
- Uber & Uber Eats
- DoorDash
- SkipTheDishes
- Instacart
- Lyft
- Custom income sources

### GlideGuard Protection
Smart financial features:
- Expense categorization
- Tax optimization suggestions
- Cash flow forecasting
- Compliance reminders

## 🚀 Deployment

### Expo Application Services (EAS)
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Configure EAS
eas build:configure

# Build for production
eas build --platform ios
eas build --platform android

# Submit to app stores
eas submit --platform ios
eas submit --platform android
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Email**: support@glidemoney.ca
- **Website**: [glidemoney.ca](https://glidemoney.ca)
- **Issues**: [GitHub Issues](https://github.com/glidemoneyapp/glide-money/issues)

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev) and [React Native](https://reactnative.dev)
- Powered by [Firebase](https://firebase.google.com)
- Bank integration via [Plaid](https://plaid.com)
- Icons by [Expo Vector Icons](https://icons.expo.fyi)

---

**Made with ❤️ for Canadian gig workers**