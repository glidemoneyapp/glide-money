/**
 * BankConnectionScreen - Connect bank accounts through Plaid
 * This screen allows users to securely connect their bank accounts
 * for automatic transaction import and categorization
 */

import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'

// Import constants and types
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants'
import { useAuth } from '../contexts/AuthContext'

/**
 * Bank connection screen component
 */
export default function BankConnectionScreen() {
  const navigation = useNavigation()
  const { user } = useAuth()
  const [isConnecting, setIsConnecting] = useState(false)

  /**
   * Handle Plaid bank connection
   */
  const handlePlaidConnection = async () => {
    if (!user) {
      Alert.alert('Error', 'Please sign in to connect bank accounts')
      return
    }

    setIsConnecting(true)

    try {
      // TODO: Implement Plaid Link SDK integration
      // For now, show a placeholder
      Alert.alert(
        'Bank Connection',
        'Plaid integration is coming soon! This will allow you to:\n\n' +
        '• Securely connect your bank accounts\n' +
        '• Automatically import transactions\n' +
        '• Auto-categorize income and expenses\n' +
        '• Sync with your gig platforms\n\n' +
        'For now, continue using manual entry.',
        [
          {
            text: 'Got it',
            style: 'default'
          }
        ]
      )
    } catch (error) {
      console.error('Error connecting bank:', error)
      Alert.alert('Error', 'Failed to connect bank account. Please try again.')
    } finally {
      setIsConnecting(false)
    }
  }

  /**
   * Navigate to manual transaction entry
   */
  const navigateToManualEntry = () => {
    navigation.navigate('AddIncome' as never)
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.title}>Connect Bank Account</Text>
              <Text style={styles.subtitle}>Automatically import your transactions</Text>
            </View>
          </View>
        </View>

        {/* Plaid Connection */}
        <View style={styles.section}>
          <View style={styles.plaidCard}>
            <View style={styles.plaidHeader}>
              <Text style={styles.plaidIcon}>🏦</Text>
              <Text style={styles.plaidTitle}>Plaid Integration</Text>
            </View>
            
            <Text style={styles.plaidDescription}>
              Securely connect your bank accounts through Plaid to automatically 
              import and categorize your transactions.
            </Text>
            
            <TouchableOpacity
              style={[
                styles.plaidButton,
                isConnecting && styles.plaidButtonDisabled
              ]}
              onPress={handlePlaidConnection}
              disabled={isConnecting}
            >
              <Ionicons 
                name={isConnecting ? "hourglass" : "link"} 
                size={20} 
                color={COLORS.surface} 
              />
              <Text style={styles.plaidButtonText}>
                {isConnecting ? 'Connecting...' : 'Connect Bank Account'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Benefits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Connect Your Bank?</Text>
          
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Ionicons name="sync" size={24} color={COLORS.primary} />
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Automatic Sync</Text>
                <Text style={styles.benefitDescription}>
                  Transactions automatically appear in your app
                </Text>
              </View>
            </View>
            
            <View style={styles.benefitItem}>
              <Ionicons name="pricetag" size={24} color={COLORS.success} />
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Smart Categorization</Text>
                <Text style={styles.benefitDescription}>
                  AI automatically categorizes your transactions
                </Text>
              </View>
            </View>
            
            <View style={styles.benefitItem}>
              <Ionicons name="trending-up" size={24} color={COLORS.warning} />
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Better Insights</Text>
                <Text style={styles.benefitDescription}>
                  Get detailed spending and income analysis
                </Text>
              </View>
            </View>
            
            <View style={styles.benefitItem}>
              <Ionicons name="shield-checkmark" size={24} color={COLORS.error} />
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Bank-Level Security</Text>
                <Text style={styles.benefitDescription}>
                  Plaid uses the same security as major banks
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Manual Entry Option */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Or Continue Manually</Text>
          
          <TouchableOpacity style={styles.manualButton} onPress={navigateToManualEntry}>
            <Ionicons name="add-circle" size={20} color={COLORS.primary} />
            <Text style={styles.manualButtonText}>Add Income Manually</Text>
          </TouchableOpacity>
          
          <Text style={styles.manualDescription}>
            You can always add income and expenses manually while we work on 
            bank integration. Your data will be synced when you connect later.
          </Text>
        </View>

        {/* Security Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security & Privacy</Text>
          
          <View style={styles.securityList}>
            <View style={styles.securityItem}>
              <Ionicons name="lock-closed" size={20} color={COLORS.success} />
              <Text style={styles.securityText}>
                Plaid never shares your banking credentials with us
              </Text>
            </View>
            
            <View style={styles.securityItem}>
              <Ionicons name="eye-off" size={20} color={COLORS.success} />
              <Text style={styles.securityText}>
                We only see transaction data, never account numbers
              </Text>
            </View>
            
            <View style={styles.securityItem}>
              <Ionicons name="trash" size={20} color={COLORS.success} />
              <Text style={styles.securityText}>
                You can disconnect your bank account at any time
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm
  },

  backButton: {
    padding: SPACING.sm
  },

  headerContent: {
    flex: 1
  },
  
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm
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
    marginBottom: SPACING.md
  },
  
  plaidCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  
  plaidHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm
  },
  
  plaidIcon: {
    fontSize: FONT_SIZES.xl
  },
  
  plaidTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text
  },
  
  plaidDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.lg
  },
  
  plaidButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5
  },
  
  plaidButtonDisabled: {
    opacity: 0.6
  },
  
  plaidButtonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600'
  },
  
  benefitsList: {
    gap: SPACING.md
  },
  
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md
  },
  
  benefitContent: {
    flex: 1
  },
  
  benefitTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs
  },
  
  benefitDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 18
  },
  
  manualButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md
  },
  
  manualButtonText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600'
  },
  
  manualDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18
  },
  
  securityList: {
    gap: SPACING.md
  },
  
  securityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm
  },
  
  securityText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 18
  }
})
