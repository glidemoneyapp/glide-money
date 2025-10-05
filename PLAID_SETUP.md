# 🏦 Plaid Sandbox Integration Setup Guide

This guide will help you set up Plaid sandbox integration for your GlideMoney app.

## ✅ Current Status

**What's Already Implemented:**
- ✅ Plaid Link SDK integration in React Native
- ✅ Backend API server with Plaid endpoints
- ✅ Bank connection screen with full UI
- ✅ Error handling and user feedback
- ✅ Environment configuration setup
- ✅ TypeScript types for Plaid responses

## 🚀 Quick Start

### 1. Get Plaid Developer Account

1. Go to [Plaid Developers](https://plaid.com/developers/)
2. Sign up for a free account
3. Create a new application
4. Copy your **Client ID** and **Secret** from the dashboard

### 2. Configure Environment Variables

#### Frontend (React Native App)

Create a `.env` file in your app root:

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` with your Plaid credentials:

```env
# Plaid Configuration (Sandbox)
EXPO_PUBLIC_PLAID_CLIENT_ID=your_plaid_client_id
EXPO_PUBLIC_PLAID_SECRET=your_plaid_secret_key
EXPO_PUBLIC_PLAID_ENVIRONMENT=sandbox
EXPO_PUBLIC_PLAID_LINK_TOKEN_ENDPOINT=http://localhost:3001/api/plaid/create-link-token
```

#### Backend (API Server)

Create a `.env` file in the backend directory:

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your Plaid credentials:

```env
# Plaid Configuration
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret_key
PLAID_ENVIRONMENT=sandbox

# Server Configuration
PORT=3001
NODE_ENV=development
```

### 3. Start the Backend Server

```bash
cd backend
npm install
npm start
```

You should see:
```
🚀 GlideMoney Backend running on port 3001
📊 Plaid Environment: sandbox
🔗 API Base URL: http://localhost:3001
```

### 4. Start the Expo App

```bash
# In the main app directory
npm start
```

### 5. Test the Integration

1. Open your app in Expo Go or simulator
2. Navigate to **Bank Connection** screen
3. Tap **Connect Bank Account**
4. Use Plaid sandbox credentials:
   - **Username**: `user_good`
   - **Password**: `pass_good`
   - **Institution**: Choose any (e.g., Chase, Bank of America)

## 🧪 Testing with Plaid Sandbox

### Test Credentials

| Username | Password | Result |
|----------|----------|---------|
| `user_good` | `pass_good` | ✅ Success |
| `user_bad` | `pass_bad` | ❌ Error |
| `user_good` | `pass_bad` | ❌ Error |

### Test Institutions

- **Chase** - Multiple accounts with transactions
- **Bank of America** - Credit card and checking
- **Wells Fargo** - Savings and checking accounts

### Sample Data

The sandbox provides realistic test data:
- **Transactions**: Various types (purchases, deposits, transfers)
- **Account Types**: Checking, savings, credit cards
- **Merchants**: Real merchant names for categorization

## 📱 App Flow

### 1. Bank Connection Screen

- Shows Plaid integration status
- Displays configuration warnings if needed
- Provides fallback to manual entry

### 2. Plaid Link Flow

1. User taps "Connect Bank Account"
2. App fetches link token from backend
3. Plaid Link modal opens
4. User enters sandbox credentials
5. User selects accounts to connect
6. Success callback processes the connection

### 3. Post-Connection

- Public token exchanged for access token
- Success message with institution info
- Navigation back to previous screen

## 🔧 Troubleshooting

### Common Issues

#### "Configuration Required" Button
- **Cause**: Missing environment variables
- **Fix**: Check `.env` files in both frontend and backend

#### "Failed to get link token"
- **Cause**: Backend server not running or wrong endpoint
- **Fix**: Start backend server on port 3001

#### "Plaid configuration incomplete"
- **Cause**: Missing `EXPO_PUBLIC_PLAID_CLIENT_ID` or `EXPO_PUBLIC_PLAID_LINK_TOKEN_ENDPOINT`
- **Fix**: Update frontend `.env` file

#### CORS Errors
- **Cause**: Frontend trying to access backend from different origin
- **Fix**: Backend is configured with CORS enabled

### Debug Steps

1. **Check Backend Health**:
   ```bash
   curl http://localhost:3001/health
   ```

2. **Verify Environment Variables**:
   ```bash
   # Backend
   cd backend && cat .env
   
   # Frontend
   cat .env
   ```

3. **Check Expo Logs**:
   - Look for Plaid-related errors in Expo console
   - Check network requests in React Native debugger

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Native  │    │   Backend API   │    │   Plaid API     │
│      App        │    │    (Express)    │    │   (Sandbox)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ 1. Request Link Token │                       │
         ├──────────────────────►│                       │
         │                       │ 2. Create Link Token  │
         │                       ├──────────────────────►│
         │                       │ 3. Return Link Token  │
         │                       │◄──────────────────────┤
         │ 4. Return Link Token  │                       │
         │◄──────────────────────┤                       │
         │                       │                       │
         │ 5. Open Plaid Link   │                       │
         ├──────────────────────┼──────────────────────►│
         │                       │                       │
         │ 6. User connects bank│                       │
         │◄──────────────────────┼──────────────────────┤
         │                       │                       │
         │ 7. Send Public Token │                       │
         ├──────────────────────►│                       │
         │                       │ 8. Exchange Token     │
         │                       ├──────────────────────►│
         │                       │ 9. Return Access Token│
         │                       │◄──────────────────────┤
         │ 10. Success Response  │                       │
         │◄──────────────────────┤                       │
```

## 🔄 Next Steps

### Immediate (Ready to Test)
1. ✅ Set up Plaid developer account
2. ✅ Configure environment variables
3. ✅ Test bank connection flow

### Future Enhancements
- [ ] Transaction synchronization
- [ ] Account balance display
- [ ] Transaction categorization
- [ ] Webhook handling for real-time updates
- [ ] Production environment setup

## 📚 Resources

- [Plaid Documentation](https://plaid.com/docs/)
- [Plaid Link Documentation](https://plaid.com/docs/link/)
- [React Native Plaid SDK](https://github.com/plaid/react-native-plaid-link-sdk)
- [Plaid Sandbox Guide](https://plaid.com/docs/sandbox/)

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify all environment variables are set correctly
3. Ensure backend server is running on port 3001
4. Check Expo console for error messages
5. Review Plaid developer dashboard for API logs

---

**Ready to connect your first bank account?** 🏦✨

Follow the Quick Start guide above and you'll be testing Plaid integration in minutes!
