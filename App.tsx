/**
 * Main App component for GlideMoney
 * Sets up navigation and provides the app structure
 */

import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { ErrorBoundary } from './src/ui/ErrorBoundary'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Import our navigation and auth provider
import AppNavigator from './src/navigation/AppNavigator'
import { linking } from './src/navigation/linking'
import { AuthProvider } from './src/contexts/AuthContext'

/**
 * Main App component
 */
export default function App() {
  const queryClient = new QueryClient()
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <ErrorBoundary>
            <StatusBar style="auto" />
            <AppNavigator linking={linking as any} />
          </ErrorBoundary>
        </SafeAreaProvider>
      </QueryClientProvider>
    </AuthProvider>
  )
}
