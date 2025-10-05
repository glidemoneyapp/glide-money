/**
 * Firebase configuration for GlideMoney app
 * Contains Firebase app initialization and service exports
 */

import { initializeApp, getApps } from 'firebase/app'
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Firebase configuration from env (public in client, non-secret)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY as string,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID as string,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID as string
}

// Initialize Firebase app only if not already initialized
let app
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApps()[0]
}

// Initialize Firebase Auth with AsyncStorage persistence
let auth
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  })
} catch (error) {
  // If auth is already initialized, get the existing instance
  auth = getAuth(app)
}

// Initialize Firebase services
export const db = getFirestore(app)
export const storage = getStorage(app)

// Export the auth instance and app
export { auth }
export default app
