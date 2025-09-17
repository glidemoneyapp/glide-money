/**
 * OnboardingScreen - Collects user's province and HST/QST status
 * This screen appears after first login to set up the user's profile
 */

import React, { useMemo, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Switch,
  Linking
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

// Import constants, types, and services
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, PROVINCE_TAX_RATES } from '../constants'
import { Province, UserProfile } from '../types'
import { saveUserProfile } from '../services/firebase'
import { useAuth } from '../contexts/AuthContext'
import { fetchPlaidLinkToken } from '../services/plaid'

/**
 * Onboarding screen component
 */
export default function OnboardingScreen() {
  const { user, userProfile, refreshUserProfile } = useAuth()
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null)
  const [isHstRegistered, setIsHstRegistered] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(false)
  const [glideGuardEnabled, setGlideGuardEnabled] = useState(true)
  const [glideGuardTargetPercent, setGlideGuardTargetPercent] = useState(0.30)
  const [glideGuardCadence, setGlideGuardCadence] = useState<'weekly' | 'bi-weekly' | 'monthly'>('weekly')
  const [isProvincePickerOpen, setIsProvincePickerOpen] = useState(false)
  const [isGlideInfoOpen, setIsGlideInfoOpen] = useState(false)
  const [isLinking, setIsLinking] = useState(false)
  const [plaidError, setPlaidError] = useState<string | null>(null)
  const provinceOptions = useMemo(() => Object.entries(PROVINCE_TAX_RATES).map(([code, p]) => ({ code, name: p.name })), [])

  // If user already has a profile, they shouldn't be here
  if (userProfile) {
    return null // This will trigger navigation to main app
  }

  /**
   * Handle province selection
   */
  const selectProvince = (province: Province) => {
    setSelectedProvince(province)
  }

  /**
   * Handle HST registration selection
   */
  const selectHstStatus = (registered: boolean) => {
    setIsHstRegistered(registered)
  }

  /**
   * Complete onboarding and save user profile
   */
  const completeOnboarding = async () => {
    if (!selectedProvince || !user) {
      Alert.alert('Error', 'Please complete all selections before continuing')
      return
    }

    setIsLoading(true)

    try {
      // Save user profile
      const userProfile: Partial<UserProfile> = {
        id: user.uid,
        email: user.email || '',
        province: selectedProvince,
        hstRegistered: isHstRegistered,
        // Approximate effective rate: take mid-bracket provincial average + base federal segment
        effectiveTaxRate: (
          PROVINCE_TAX_RATES[selectedProvince].provincialTaxBrackets[Math.min(1, PROVINCE_TAX_RATES[selectedProvince].provincialTaxBrackets.length - 1)].rate
        ) + 0.15,
        glideGuardEnabled,
        glideGuardCadence,
        glideGuardTargetPercent: glideGuardTargetPercent,
        cushionBuffer: 100,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await saveUserProfile(user.uid, userProfile)

      Alert.alert(
        'Welcome to GlideMoney!',
        'Your profile has been set up successfully. You can now start tracking your income and managing your finances.',
        [{ 
          text: 'Get Started',
          onPress: async () => {
            // Refresh the user profile to trigger navigation
            await refreshUserProfile()
          }
        }]
      )

    } catch (error) {
      console.error('Error completing onboarding:', error)
      Alert.alert('Error', 'Failed to complete setup. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Check if all selections are complete
   */
  const isComplete = true

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to GlideMoney!</Text>
          <Text style={styles.subtitle}>Let's set up your financial profile</Text>
        </View>

        {/* Province Selection (dropdown) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Select Your Province</Text>
          <Text style={styles.sectionDescription}>
            This helps us calculate the correct tax rates for your area
          </Text>
          <TouchableOpacity style={styles.dropdown} onPress={() => setIsProvincePickerOpen(true)}>
            <Text style={styles.dropdownText}>
              {selectedProvince ? PROVINCE_TAX_RATES[selectedProvince].name : 'Select province/territory'}
            </Text>
            <Ionicons name="chevron-down" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* HST Registration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. HST/GST Registration Status</Text>
          <Text style={styles.sectionDescription}>
            Are you registered to collect HST/GST? (Required if you earn over $30,000/year)
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ color: COLORS.text }}>HST/GST Registered</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
              <Text style={{ color: isHstRegistered ? COLORS.textSecondary : COLORS.text }}>No</Text>
              <Switch
                value={isHstRegistered}
                onValueChange={setIsHstRegistered}
                thumbColor={isHstRegistered ? COLORS.surface : '#fff'}
                trackColor={{ true: COLORS.primary, false: COLORS.border }}
              />
              <Text style={{ color: isHstRegistered ? COLORS.text : COLORS.textSecondary }}>Yes</Text>
            </View>
          </View>
          <Text style={[styles.sectionDescription, { marginTop: SPACING.sm }]}>If you are not registered, we'll track your progress toward the $30,000 threshold and keep your calculations conservative.</Text>
        </View>

        {/* Removed Gig Platform Selection to streamline onboarding */}

        {/* Bank Connection (Plaid) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connect your bank (recommended)</Text>
          <Text style={styles.sectionDescription}>Read-only access. We use this to detect income, bills (PADs), and card cycles. You can disconnect anytime.</Text>
          <TouchableOpacity
            style={[styles.completeButton, isLinking && styles.completeButtonDisabled]}
            onPress={async () => {
              setPlaidError(null)
              setIsLinking(true)
              try {
                const linkToken = await fetchPlaidLinkToken()
                if (!linkToken) {
                  setPlaidError('Could not retrieve Link Token. Check server configuration.')
                  return
                }
                // For Expo Go, open in-app browser as placeholder instruction
                // Integrate react-native-plaid-link-sdk when building a dev client
                const url = `https://cdn.plaid.com/link/v2/stable/link.html?isWebview=true&token=${encodeURIComponent(linkToken)}`
                // eslint-disable-next-line no-undef
                Linking.openURL?.(url)
              } finally {
                setIsLinking(false)
              }
            }}
            disabled={isLinking}
          >
            <Text style={styles.completeButtonText}>{isLinking ? 'Opening…' : 'Connect bank'}</Text>
          </TouchableOpacity>
          {plaidError && <Text style={{ color: COLORS.error, marginTop: SPACING.sm }}>{plaidError}</Text>}
        </View>

        {/* Glide Guard Toggle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Glide Guard™ (recommended)</Text>
          <Text style={styles.sectionDescription}>Plan one weekly card payment so you close each statement under your target and avoid interest. Read-only; you stay in control.</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ color: COLORS.text }}>Enable Glide Guard</Text>
            <Switch value={glideGuardEnabled} onValueChange={setGlideGuardEnabled} thumbColor={glideGuardEnabled ? COLORS.surface : '#fff'} trackColor={{ true: COLORS.primary, false: COLORS.border }} />
          </View>
          <Text style={[styles.sectionDescription, { marginTop: SPACING.sm }]}>Defaults: Cadence Weekly • Targets 30% per card • Cushion $100 protected. <Text onPress={() => setIsGlideInfoOpen(true)} style={{ color: COLORS.primary }}>What is Glide Guard?</Text></Text>
        </View>

        {/* Complete Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[
              styles.completeButton,
              isLoading && styles.completeButtonDisabled
            ]}
            onPress={completeOnboarding}
            disabled={isLoading}
          >
            <Text style={styles.completeButtonText}>
              {isLoading ? 'Setting Up...' : 'Complete Setup'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {/* Province picker modal */}
      <Modal visible={isProvincePickerOpen} transparent animationType="fade" onRequestClose={() => setIsProvincePickerOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select province/territory</Text>
            <ScrollView style={{ maxHeight: 360 }}>
              {provinceOptions.map(opt => (
                <TouchableOpacity key={opt.code} style={styles.optionRow} onPress={() => { setSelectedProvince(opt.code as Province); setIsProvincePickerOpen(false) }}>
                  <Text style={styles.optionText}>{opt.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalClose} onPress={() => setIsProvincePickerOpen(false)}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Glide Guard info modal */}
      <Modal visible={isGlideInfoOpen} transparent animationType="fade" onRequestClose={() => setIsGlideInfoOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>About Glide Guard™</Text>
            <Text style={styles.modalBody}>We’ll compute exact weekly card payments and safe-by times so your statement closes at your target utilization (9/10/30%) and you avoid interest—without touching your CRA set-asides or cushion. Read-only; you stay in control. You can change cadence and targets anytime in Settings.</Text>
            <TouchableOpacity style={styles.modalClose} onPress={() => setIsGlideInfoOpen(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  )
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  
  scrollView: {
    flex: 1
  },
  
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    alignItems: 'center'
  },
  
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center'
  },
  
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center'
  },
  
  section: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider
  },
  
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm
  },
  
  sectionDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 20
  },
  
  dropdown: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md, padding: SPACING.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dropdownText: { fontSize: FONT_SIZES.md, color: COLORS.text },
  
  hstButtons: {
    gap: SPACING.md
  },
  
  hstButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm
  },
  
  hstButtonSelected: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary
  },
  
  hstButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500'
  },
  
  hstButtonTextSelected: {
    color: COLORS.surface
  },
  
  // removed platform styles
  
  completeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
    marginTop: SPACING.md
  },
  
  completeButtonDisabled: {
    opacity: 0.6
  },
  
  completeButtonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600'
  },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  modalCard: { width: '90%', backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg },
  modalTitle: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.sm },
  modalBody: { color: COLORS.textSecondary },
  modalClose: { marginTop: SPACING.md, alignItems: 'center' },
  modalCloseText: { color: COLORS.primary, fontWeight: '600' },
  optionRow: { paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  optionText: { color: COLORS.text }
})
