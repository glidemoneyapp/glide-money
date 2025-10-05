/**
 * Main App component for GlideMoney
 * Sets up navigation and provides the app structure
 */

import React from 'react'
import { StatusBar } from 'expo-status-bar'

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
      <StatusBar style="auto" />
      {/* Navigation linking support */}
      <AppNavigator linking={linking as any} />
    </AuthProvider>
  )
}
