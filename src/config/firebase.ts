/**
 * Firebase configuration for GlideMoney app
 * Contains Firebase app initialization and service exports
 */

import { initializeApp, getApps } from 'firebase/app'
import { initializeAuth, getAuth } from 'firebase/auth'
// Expo SDK 53 RN Firebase uses native persistence by default; remove RN persistence import to fix TS
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBkXIOSRImmHqRIZliYjq0sT-RbuAsJ-_s",
  authDomain: "glidemoney.firebaseapp.com",
  projectId: "glidemoney",
  storageBucket: "glidemoney.firebasestorage.app",
  messagingSenderId: "169072570567",
  appId: "1:169072570567:web:3f0cb2d58cbdc21ec1cee2",
  measurementId: "G-M4P8THLQQP"
}

// Initialize Firebase app only if not already initialized
let app
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApps()[0]
}

// Initialize Firebase Auth with AsyncStorage persistence
const auth = getAuth(app)

// Initialize Firebase services
export const db = getFirestore(app)
export const storage = getStorage(app)

// Export the auth instance and app
export { auth }
export default app
