/**
 * App-wide constants for the Gig Cashflow Coach app
 * Contains Canadian tax rates, province information, and other fixed values
 */

import { Province } from '../types'

// Canadian tax rates and constants
export const TAX_CONSTANTS = {
  // CPP (Canada Pension Plan) contribution rate
  CPP_RATE: 0.0595, // 5.95% for 2024
  
  // CPP contribution maximum for 2024
  CPP_MAX_CONTRIBUTION: 3754.45,
  
  // Basic personal amount (federal)
  BASIC_PERSONAL_AMOUNT: 15000,
  
  // Federal tax brackets for 2024
  FEDERAL_TAX_BRACKETS: [
    { rate: 0.15, max: 55197 },
    { rate: 0.205, max: 110392 },
    { rate: 0.26, max: 173205 },
    { rate: 0.29, max: 246752 },
    { rate: 0.33, max: Infinity }
  ]
} as const

// Province-specific tax information
export const PROVINCE_TAX_RATES: Record<Province, {
  name: string
  hstRate: number
  gstRate: number
  qstRate: number
  provincialTaxBrackets: Array<{ rate: number; max: number }>
  hstThreshold: number
}> = {
  AB: { 
    name: 'Alberta', 
    hstRate: 0.05, 
    gstRate: 0.05, 
    qstRate: 0, 
    provincialTaxBrackets: [
      { rate: 0.10, max: 148269 },
      { rate: 0.12, max: 177922 },
      { rate: 0.13, max: 237230 },
      { rate: 0.14, max: 355845 },
      { rate: 0.15, max: Infinity }
    ],
    hstThreshold: 30000 
  },
  BC: { 
    name: 'British Columbia', 
    hstRate: 0.12, 
    gstRate: 0.05, 
    qstRate: 0, 
    provincialTaxBrackets: [
      { rate: 0.0506, max: 45654 },
      { rate: 0.077, max: 91310 },
      { rate: 0.105, max: 104835 },
      { rate: 0.1229, max: 127299 },
      { rate: 0.147, max: 172602 },
      { rate: 0.168, max: 240716 },
      { rate: 0.205, max: Infinity }
    ],
    hstThreshold: 30000 
  },
  MB: { 
    name: 'Manitoba', 
    hstRate: 0.12, 
    gstRate: 0.05, 
    qstRate: 0, 
    provincialTaxBrackets: [
      { rate: 0.108, max: 36842 },
      { rate: 0.1275, max: 79625 },
      { rate: 0.174, max: Infinity }
    ],
    hstThreshold: 30000 
  },
  NB: { 
    name: 'New Brunswick', 
    hstRate: 0.15, 
    gstRate: 0.05, 
    qstRate: 0, 
    provincialTaxBrackets: [
      { rate: 0.0968, max: 47715 },
      { rate: 0.1482, max: 95431 },
      { rate: 0.1658, max: 176756 },
      { rate: 0.1781, max: Infinity }
    ],
    hstThreshold: 30000 
  },
  NL: { 
    name: 'Newfoundland and Labrador', 
    hstRate: 0.15, 
    gstRate: 0.05, 
    qstRate: 0, 
    provincialTaxBrackets: [
      { rate: 0.087, max: 41447 },
      { rate: 0.145, max: 82894 },
      { rate: 0.158, max: 148027 },
      { rate: 0.173, max: 207239 },
      { rate: 0.183, max: 264750 },
      { rate: 0.208, max: 529500 },
      { rate: 0.213, max: 1059000 },
      { rate: 0.218, max: Infinity }
    ],
    hstThreshold: 30000 
  },
  NS: { 
    name: 'Nova Scotia', 
    hstRate: 0.15, 
    gstRate: 0.05, 
    qstRate: 0, 
    provincialTaxBrackets: [
      { rate: 0.0879, max: 29590 },
      { rate: 0.1495, max: 59180 },
      { rate: 0.1667, max: 93000 },
      { rate: 0.175, max: 150000 },
      { rate: 0.21, max: Infinity }
    ],
    hstThreshold: 30000 
  },
  NT: { 
    name: 'Northwest Territories', 
    hstRate: 0.05, 
    gstRate: 0.05, 
    qstRate: 0, 
    provincialTaxBrackets: [
      { rate: 0.059, max: 48326 },
      { rate: 0.086, max: 96655 },
      { rate: 0.122, max: 157139 },
      { rate: 0.1405, max: Infinity }
    ],
    hstThreshold: 30000 
  },
  NU: { 
    name: 'Nunavut', 
    hstRate: 0.05, 
    gstRate: 0.05, 
    qstRate: 0, 
    provincialTaxBrackets: [
      { rate: 0.04, max: 50877 },
      { rate: 0.07, max: 101754 },
      { rate: 0.09, max: 165429 },
      { rate: 0.115, max: Infinity }
    ],
    hstThreshold: 30000 
  },
  ON: { 
    name: 'Ontario', 
    hstRate: 0.13, 
    gstRate: 0.05, 
    qstRate: 0, 
    provincialTaxBrackets: [
      { rate: 0.0505, max: 51446 },
      { rate: 0.0915, max: 102894 },
      { rate: 0.1116, max: 150000 },
      { rate: 0.1216, max: 220000 },
      { rate: 0.1316, max: Infinity }
    ],
    hstThreshold: 30000 
  },
  PE: { 
    name: 'Prince Edward Island', 
    hstRate: 0.15, 
    gstRate: 0.05, 
    qstRate: 0, 
    provincialTaxBrackets: [
      { rate: 0.098, max: 31984 },
      { rate: 0.138, max: 63968 },
      { rate: 0.167, max: Infinity }
    ],
    hstThreshold: 30000 
  },
  QC: { 
    name: 'Quebec', 
    hstRate: 0.14975, 
    gstRate: 0.05, 
    qstRate: 0.09975, 
    provincialTaxBrackets: [
      { rate: 0.14, max: 49275 },
      { rate: 0.19, max: 98540 },
      { rate: 0.24, max: 119910 },
      { rate: 0.2575, max: Infinity }
    ],
    hstThreshold: 30000 
  },
  SK: { 
    name: 'Saskatchewan', 
    hstRate: 0.11, 
    gstRate: 0.05, 
    qstRate: 0, 
    provincialTaxBrackets: [
      { rate: 0.105, max: 49720 },
      { rate: 0.125, max: 142058 },
      { rate: 0.145, max: Infinity }
    ],
    hstThreshold: 30000 
  },
  YT: { 
    name: 'Yukon', 
    hstRate: 0.05, 
    gstRate: 0.05, 
    qstRate: 0, 
    provincialTaxBrackets: [
      { rate: 0.064, max: 53359 },
      { rate: 0.09, max: 106717 },
      { rate: 0.109, max: 165430 },
      { rate: 0.128, max: 235675 },
      { rate: 0.15, max: Infinity }
    ],
    hstThreshold: 30000 
  }
} as const

// Gig platform information
export const GIG_PLATFORMS = {
  uber: { name: 'Uber', icon: '🚗', color: '#000000' },
  'uber-eats': { name: 'Uber Eats', icon: '🍕', color: '#000000' },
  lyft: { name: 'Lyft', icon: '🚗', color: '#FF00BF' },
  doordash: { name: 'DoorDash', icon: '🍽️', color: '#FF0000' },
  'skip-the-dishes': { name: 'SkipTheDishes', icon: '🍽️', color: '#FF6B35' },
  instacart: { name: 'Instacart', icon: '🛒', color: '#43E97B' },
  other: { name: 'Other', icon: '💼', color: '#6B7280' }
} as const

// Transaction categories with icons and colors
export const TRANSACTION_CATEGORIES = {
  'vehicle-fuel': { name: 'Vehicle Fuel', icon: '⛽', color: '#F59E0B' },
  'vehicle-maintenance': { name: 'Vehicle Maintenance', icon: '🔧', color: '#EF4444' },
  'vehicle-insurance': { name: 'Vehicle Insurance', icon: '🛡️', color: '#3B82F6' },
  'vehicle-parking': { name: 'Vehicle Parking', icon: '🅿️', color: '#8B5CF6' },
  phone: { name: 'Phone', icon: '📱', color: '#10B981' },
  meals: { name: 'Meals', icon: '🍔', color: '#F97316' },
  supplies: { name: 'Supplies', icon: '📦', color: '#6B7280' },
  tolls: { name: 'Tolls', icon: '🛣️', color: '#84CC16' },
  'other-business': { name: 'Other Business', icon: '💼', color: '#6366F1' },
  personal: { name: 'Personal', icon: '👤', color: '#EC4899' },
  income: { name: 'Income', icon: '💰', color: '#10B981' },
  transfer: { name: 'Transfer', icon: '💸', color: '#8B5CF6' }
} as const

// App colors and theme
export const COLORS = {
  // Primary colors
  primary: '#2563EB',
  secondary: '#64748B',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Background colors
  background: '#F8FAFC',
  surface: '#FFFFFF',
  
  // Text colors
  text: '#1F2937',
  textSecondary: '#6B7280',
  
  // UI colors
  border: '#E5E7EB',
  divider: '#F1F5F9',
  
  // Chart colors
  chartPrimary: '#2563EB',
  chartSecondary: '#64748B',
  chartSuccess: '#10B981',
  chartWarning: '#F59E0B',
  chartError: '#EF4444'
} as const

// Spacing and sizing constants
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
} as const

// Border radius constants
export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999
} as const

// Font sizes
export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32
} as const

// App configuration
export const APP_CONFIG = {
  name: 'GlideMoney',
  version: '1.0.0',
  description: 'Gig Cashflow Coach for Canadian workers',
  supportEmail: 'support@glidemoney.ca',
  privacyPolicyUrl: 'https://glidemoney.ca/privacy',
  termsOfServiceUrl: 'https://glidemoney.ca/terms'
} as const
