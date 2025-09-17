/**
 * Main types for the Gig Cashflow Coach app
 * This file defines all the data structures used throughout the application
 */

// User profile and settings
export interface UserProfile {
  id: string
  email: string
  province: Province
  hstRegistered: boolean
  effectiveTaxRate: number
  // Glide Guard settings
  glideGuardEnabled?: boolean
  glideGuardCadence?: 'weekly' | 'bi-weekly' | 'monthly'
  glideGuardTargetPercent?: number // 0.30, 0.10, 0.09
  cushionBuffer?: number // e.g., 100 or 200
  createdAt: Date
  updatedAt: Date
}

// Canadian provinces with their tax rates
export type Province = 
  | 'AB' | 'BC' | 'MB' | 'NB' | 'NL' | 'NS' | 'NT' | 'NU' | 'ON' | 'PE' | 'QC' | 'SK' | 'YT'

// Income stream from gig platforms
export interface IncomeStream {
  id: string
  userId: string
  platform: GigPlatform
  name: string
  isActive: boolean
  predictedAmount: {
    min: number
    max: number
    average: number
  }
  predictedDate: Date
  cadence: 'weekly' | 'bi-weekly' | 'monthly' | 'irregular'
  lastPayout: Date
  confidence: number // 0-100, how confident we are in the prediction
  createdAt: Date
  updatedAt: Date
}

// Supported gig platforms
export type GigPlatform = 
  | 'uber' | 'uber-eats' | 'lyft' | 'doordash' | 'skip-the-dishes' | 'instacart' | 'other'

// Bank account connection
export interface BankAccount {
  id: string
  userId: string
  institution: string
  accountType: 'checking' | 'savings' | 'credit'
  accountNumber: string // masked
  balance: number
  isConnected: boolean
  lastSync: Date
  createdAt: Date
  updatedAt: Date
}

// Transaction from bank
export interface Transaction {
  id: string
  userId: string
  bankAccountId: string
  amount: number
  description: string
  date: Date
  category: TransactionCategory
  isIncome: boolean
  incomeStreamId?: string // if this is income from a gig platform
  merchant: string
  createdAt: Date
}

// Transaction categories aligned with CRA requirements
export type TransactionCategory = 
  | 'vehicle-fuel' | 'vehicle-maintenance' | 'vehicle-insurance' | 'vehicle-parking'
  | 'phone' | 'meals' | 'supplies' | 'tolls' | 'other-business' | 'personal'
  | 'income' | 'transfer'

// Weekly set-aside plan
export interface WeeklySetAside {
  id: string
  userId: string
  weekStart: Date
  weekEnd: Date
  totalEarnings: number
  incomeTax: number
  cpp: number
  hstQst: number
  totalSetAside: number
  isCompleted: boolean
  createdAt: Date
  updatedAt: Date
}

// Recurring bill/PAD
export interface RecurringBill {
  id: string
  userId: string
  name: string
  amount: number
  dueDate: Date
  frequency: 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'yearly'
  category: 'insurance' | 'phone' | 'hydro' | 'car-payment' | 'rent' | 'other'
  isVariable: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Safe-to-spend calculation
export interface SafeToSpend {
  userId: string
  currentBalance: number
  upcomingBills: number
  setAsides: number
  nextIncome: number
  safeAmount: number
  shortfallWarning?: string
  calculatedAt: Date
}

// Money win achievement
export interface MoneyWin {
  id: string
  userId: string
  type: 'overdraft-avoided' | 'set-aside-completed' | 'bill-covered' | 'deduction-captured'
  description: string
  amount?: number
  date: Date
  createdAt: Date
}

// Credit card profile (for Glide Guard)
export interface CardProfile {
  id: string
  userId: string
  institution: string
  cardName: string
  limit: number
  postedBalance?: number
  apr?: number
  observedCloseDay?: number // 0-6 weekday or day-of-month when inferred
  observedGraceDays?: number
  nextDueDate?: Date
  postingDelayDays?: number // rail profile
  confidence?: number
  createdAt: Date
  updatedAt: Date
}

// Glide Guard computed plan
export interface GlideGuardSlice {
  cardId: string
  cardName: string
  amount: number
  safeBy: Date
  rationale: string
}

export interface GlideGuardPlan {
  id: string
  userId: string
  asOf: Date
  slices: GlideGuardSlice[]
}

/**
 * Navigation parameter types for the app
 */
export type RootStackParamList = {
  Login: undefined
  Onboarding: undefined
  Main: undefined
  IncomeStreams: undefined
  AddIncome: undefined
  BankConnection: undefined
}
