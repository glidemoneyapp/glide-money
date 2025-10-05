/**
 * Firebase service functions for GlideMoney app
 * Provides authentication, database operations, and utility functions
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  UserCredential
} from 'firebase/auth'

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  DocumentData,
  QuerySnapshot
} from 'firebase/firestore'

import { auth, db } from '../config/firebase'
import { UserProfile, IncomeStream, Transaction, WeeklySetAside, RecurringBill, CardProfile, GlideGuardPlan } from '../types'

// ============================================================================
// AUTHENTICATION SERVICES
// ============================================================================

/**
 * Sign up a new user with email and password
 */
export const signUp = async (email: string, password: string): Promise<UserCredential> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    return userCredential
  } catch (error) {
    console.error('Error signing up:', error)
    throw error
  }
}

/**
 * Sign in existing user with email and password
 */
export const signIn = async (email: string, password: string): Promise<UserCredential> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential
  } catch (error) {
    console.error('Error signing in:', error)
    throw error
  }
}

/**
 * Sign out current user
 */
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth)
  } catch (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

/**
 * Get current authenticated user
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser
}

/**
 * Listen to authentication state changes
 */
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback)
}

// ============================================================================
// USER PROFILE SERVICES
// ============================================================================

/**
 * Create or update user profile
 */
export const saveUserProfile = async (userId: string, profile: Partial<UserProfile>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId)
    await setDoc(userRef, {
      ...profile,
      updatedAt: new Date()
    }, { merge: true })
  } catch (error) {
    console.error('Error saving user profile:', error)
    throw error
  }
}

/**
 * Get user profile by ID
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)
    
    if (userSnap.exists()) {
      return userSnap.data() as UserProfile
    }
    return null
  } catch (error) {
    console.error('Error getting user profile:', error)
    throw error
  }
}

// ============================================================================
// INCOME STREAM SERVICES
// ============================================================================

/**
 * Save income stream
 */
export const saveIncomeStream = async (incomeStream: Partial<IncomeStream>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'incomeStreams'), {
      ...incomeStream,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    return docRef.id
  } catch (error) {
    console.error('Error saving income stream:', error)
    throw error
  }
}

/**
 * Get income streams for a user
 */
export const getUserIncomeStreams = async (userId: string): Promise<IncomeStream[]> => {
  try {
    const q = query(
      collection(db, 'incomeStreams'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    const incomeStreams: IncomeStream[] = []
    
    querySnapshot.forEach((doc) => {
      incomeStreams.push({
        id: doc.id,
        ...doc.data()
      } as IncomeStream)
    })
    
    return incomeStreams
  } catch (error) {
    console.error('Error getting income streams:', error)
    throw error
  }
}

// ============================================================================
// TRANSACTION SERVICES
// ============================================================================

/**
 * Save transaction
 */
export const saveTransaction = async (transaction: Partial<Transaction>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'transactions'), {
      ...transaction,
      createdAt: new Date()
    })
    return docRef.id
  } catch (error) {
    console.error('Error saving transaction:', error)
    throw error
  }
}

/**
 * Get transactions for a user
 */
export const getUserTransactions = async (
  userId: string, 
  limitCount: number = 50
): Promise<Transaction[]> => {
  try {
    // Use a simpler query that doesn't require complex indexing
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      limit(limitCount)
    )
    
    const querySnapshot = await getDocs(q)
    const transactions: Transaction[] = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      transactions.push({
        id: doc.id,
        ...data,
        // Ensure date is properly converted
        date: data.date ? new Date(data.date.toDate ? data.date.toDate() : data.date) : new Date(),
        createdAt: data.createdAt ? new Date(data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt) : new Date()
      } as Transaction)
    })
    
    // Sort by date in memory instead of in the query
    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch (error) {
    console.error('Error getting transactions:', error)
    throw error
  }
}

// ============================================================================
// WEEKLY SET-ASIDE SERVICES
// ============================================================================

/**
 * Save weekly set-aside
 */
export const saveWeeklySetAside = async (setAside: Partial<WeeklySetAside>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'weeklySetAsides'), {
      ...setAside,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    return docRef.id
  } catch (error) {
    console.error('Error saving weekly set-aside:', error)
    throw error
  }
}

/**
 * Get weekly set-asides for a user
 */
export const getUserWeeklySetAsides = async (userId: string): Promise<WeeklySetAside[]> => {
  try {
    const q = query(
      collection(db, 'weeklySetAsides'),
      where('userId', '==', userId),
      orderBy('weekStart', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    const setAsides: WeeklySetAside[] = []
    
    querySnapshot.forEach((doc) => {
      setAsides.push({
        id: doc.id,
        ...doc.data()
      } as WeeklySetAside)
    })
    
    return setAsides
  } catch (error) {
    console.error('Error getting weekly set-asides:', error)
    throw error
  }
}

// ============================================================================
// RECURRING BILL SERVICES
// ============================================================================

/**
 * Save recurring bill
 */
export const saveRecurringBill = async (bill: Partial<RecurringBill>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'recurringBills'), {
      ...bill,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    return docRef.id
  } catch (error) {
    console.error('Error saving recurring bill:', error)
    throw error
  }
}

/**
 * Get recurring bills for a user
 */
export const getUserRecurringBills = async (userId: string): Promise<RecurringBill[]> => {
  try {
    // Temporary fix: Remove orderBy to avoid index requirement
    const q = query(
      collection(db, 'recurringBills'),
      where('userId', '==', userId),
      where('isActive', '==', true)
    )
    
    const querySnapshot = await getDocs(q)
    const bills: RecurringBill[] = []
    
    querySnapshot.forEach((doc) => {
      bills.push({
        id: doc.id,
        ...doc.data()
      } as RecurringBill)
    })
    
    // Sort by dueDate in JavaScript since we removed orderBy from query
    return bills.sort((a, b) => {
      const dateA = a.dueDate?.toDate ? a.dueDate.toDate() : new Date(a.dueDate)
      const dateB = b.dueDate?.toDate ? b.dueDate.toDate() : new Date(b.dueDate)
      return dateA.getTime() - dateB.getTime()
    })
  } catch (error) {
    console.error('Error getting recurring bills:', error)
    throw error
  }
}

// ============================================================================
// CARD PROFILE (Glide Guard)
// ============================================================================

export const saveCardProfile = async (card: Partial<CardProfile>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'cardProfiles'), {
      ...card,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    return docRef.id
  } catch (error) {
    console.error('Error saving card profile:', error)
    throw error
  }
}

export const getUserCardProfiles = async (userId: string): Promise<CardProfile[]> => {
  try {
    const q = query(collection(db, 'cardProfiles'), where('userId', '==', userId))
    const snap = await getDocs(q)
    const cards: CardProfile[] = []
    snap.forEach(doc => cards.push({ id: doc.id, ...doc.data() } as CardProfile))
    return cards
  } catch (error) {
    console.error('Error getting card profiles:', error)
    throw error
  }
}

// ============================================================================
// GLIDE GUARD PLAN
// ============================================================================

export const saveGlideGuardPlan = async (plan: Partial<GlideGuardPlan>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'glideGuardPlans'), {
      ...plan,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    return docRef.id
  } catch (error) {
    console.error('Error saving glide guard plan:', error)
    throw error
  }
}

export const getLatestGlideGuardPlan = async (userId: string): Promise<GlideGuardPlan | null> => {
  try {
    const q = query(collection(db, 'glideGuardPlans'), where('userId', '==', userId), orderBy('createdAt', 'desc'), limit(1))
    const snap = await getDocs(q)
    const doc0 = snap.docs[0]
    if (!doc0) return null
    return { id: doc0.id, ...doc0.data() } as GlideGuardPlan
  } catch (error) {
    console.error('Error getting glide guard plan:', error)
    throw error
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert Firestore timestamp to Date
 */
export const convertTimestamp = (timestamp: any): Date => {
  if (timestamp?.toDate) {
    return timestamp.toDate()
  }
  if (timestamp instanceof Date) {
    return timestamp
  }
  return new Date(timestamp)
}

/**
 * Convert Date to Firestore timestamp
 */
export const convertToTimestamp = (date: Date) => {
  return date
}
