/**
 * Authentication context for GlideMoney app
 * Manages user authentication state and provides auth functions to all components
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from 'firebase/auth'

// Import Firebase services
import { onAuthStateChange, getCurrentUser, getUserProfile } from '../services/firebase'
import type { UserProfile } from '../types'

// Define the context type
interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  isLoading: boolean
  isAuthenticated: boolean
  refreshUserProfile: () => Promise<void>
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider component props
interface AuthProviderProps {
  children: ReactNode
}

/**
 * Authentication provider component
 * Wraps the app and provides authentication state
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  /**
   * Fetch user profile from Firebase
   */
  const fetchUserProfile = async (userId: string) => {
    try {
      const profile = await getUserProfile(userId)
      setUserProfile(profile)
    } catch (error) {
      console.error('Error getting user profile:', error)
      setUserProfile(null)
    }
  }

  /**
   * Refresh user profile (called after onboarding completion)
   */
  const refreshUserProfile = async () => {
    if (user) {
      await fetchUserProfile(user.uid)
    }
  }

  useEffect(() => {
    // Listen to authentication state changes
    const unsubscribe = onAuthStateChange(async (user) => {
      setUser(user)
      
      if (user) {
        // User is signed in, get their profile
        await fetchUserProfile(user.uid)
      } else {
        // User is signed out
        setUserProfile(null)
      }
      
      setIsLoading(false)
    })

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [])

  // Check if user is authenticated
  const isAuthenticated = !!user

  const value: AuthContextType = {
    user,
    userProfile,
    isLoading,
    isAuthenticated,
    refreshUserProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook to use authentication context
 * Must be used within an AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}
