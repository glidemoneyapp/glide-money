/**
 * Main App component for GlideMoney
 * Sets up navigation and provides the app structure
 */

import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { ErrorBoundary } from './src/ui/ErrorBoundary'

// Import our navigation and auth provider
import AppNavigator from './src/navigation/AppNavigator'
import { linking } from './src/navigation/linking'
import { AuthProvider } from './src/contexts/AuthContext'

/**
 * Main App component
 */
export default function App() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <ErrorBoundary>
          <StatusBar style="auto" />
          <AppNavigator linking={linking as any} />
        </ErrorBoundary>
      </SafeAreaProvider>
    </AuthProvider>
  )
}
