/**
 * LoginScreen - Simple authentication screen for testing Firebase
 * This screen has distinct visual differences between sign-up and sign-in modes
 */

import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

// Import Firebase services and constants
import { signUp, signIn } from '../services/firebase'
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants'

/**
 * Login screen component
 */
export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  /**
   * Handle authentication (sign up or sign in)
   */
  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password')
      return
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters')
      return
    }

    setIsLoading(true)

    try {
      console.log('Attempting authentication...', { email, isSignUp })
      
      if (isSignUp) {
        const result = await signUp(email, password)
        console.log('Sign up successful:', result.user.uid)
        Alert.alert('Success', 'Account created successfully!')
      } else {
        const result = await signIn(email, password)
        console.log('Sign in successful:', result.user.uid)
        Alert.alert('Success', 'Signed in successfully!')
      }
    } catch (error: any) {
      console.error('Authentication error:', error)
      
      // Provide more specific error messages
      let errorMessage = 'Authentication failed'
      
      if (error.code === 'auth/configuration-not-found') {
        errorMessage = 'Firebase Authentication not enabled. Please enable it in your Firebase project.'
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password'
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists'
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      Alert.alert('Error', errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Test Firebase connection
   */
  const testConnection = () => {
    Alert.alert(
      'Firebase Test',
      'Testing Firebase connection...\n\nIf you see this, the basic connection is working.\n\nMake sure to enable:\n1. Authentication (Email/Password)\n2. Firestore Database\n\nIn your Firebase project console.',
      [{ text: 'OK' }]
    )
  }

  // Dynamic colors based on mode
  const primaryColor = isSignUp ? COLORS.success : COLORS.primary
  const secondaryColor = isSignUp ? COLORS.warning : COLORS.secondary
  const backgroundColor = isSignUp ? '#F0FDF4' : '#F0F9FF' // Light green vs light blue

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Header with different styling for each mode */}
          <View style={styles.header}>
            <View style={[styles.logoContainer, { backgroundColor: primaryColor }]}>
              <Text style={styles.logoText}>💰</Text>
            </View>
            
            <Text style={[styles.title, { color: primaryColor }]}>
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </Text>
            
            <Text style={styles.subtitle}>
              {isSignUp 
                ? 'Join GlideMoney to start managing your gig finances'
                : 'Sign in to access your financial dashboard'
              }
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail" size={20} color={primaryColor} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { borderColor: primaryColor }]}
                placeholder="Email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed" size={20} color={primaryColor} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { borderColor: primaryColor }]}
                placeholder="Password (6+ characters)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
            
            <TouchableOpacity
              style={[
                styles.authButton, 
                { backgroundColor: primaryColor },
                isLoading && styles.authButtonDisabled
              ]}
              onPress={handleAuth}
              disabled={isLoading}
            >
              <Ionicons 
                name={isLoading ? "hourglass" : (isSignUp ? "person-add" : "log-in")} 
                size={20} 
                color={COLORS.surface} 
              />
              <Text style={styles.authButtonText}>
                {isLoading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Mode Switch */}
          <View style={styles.modeSwitch}>
            <Text style={styles.modeText}>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </Text>
            
            <TouchableOpacity
              style={[styles.switchButton, { backgroundColor: secondaryColor }]}
              onPress={() => setIsSignUp(!isSignUp)}
            >
              <Text style={styles.switchButtonText}>
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Test Connection Button */}
          <TouchableOpacity style={styles.testButton} onPress={testConnection}>
            <Text style={styles.testButtonText}>Test Firebase Connection</Text>
          </TouchableOpacity>

          {/* Info */}
          <Text style={styles.info}>
            {isSignUp 
              ? 'By creating an account, you agree to our Terms of Service and Privacy Policy.'
              : 'This app helps Canadian gig workers manage their finances and taxes.'
            }
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  
  keyboardView: {
    flex: 1
  },
  
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl
  },
  
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl
  },
  
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5
  },
  
  logoText: {
    fontSize: 40
  },
  
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
    textAlign: 'center'
  },
  
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280
  },
  
  form: {
    width: '100%',
    maxWidth: 320,
    marginBottom: SPACING.xl
  },
  
  inputContainer: {
    position: 'relative',
    marginBottom: SPACING.md
  },
  
  inputIcon: {
    position: 'absolute',
    left: SPACING.md,
    top: '50%',
    marginTop: -10,
    zIndex: 1
  },
  
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    paddingLeft: SPACING.xl + SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  
  authButton: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5
  },
  
  authButtonDisabled: {
    opacity: 0.6
  },
  
  authButtonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600'
  },
  
  modeSwitch: {
    alignItems: 'center',
    marginBottom: SPACING.lg
  },
  
  modeText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md
  },
  
  switchButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  
  switchButtonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.md,
    fontWeight: '600'
  },
  
  testButton: {
    backgroundColor: COLORS.info,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.lg
  },
  
  testButtonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.sm,
    fontWeight: '500'
  },
  
  info: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300
  }
})
