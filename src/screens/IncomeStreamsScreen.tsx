/**
 * IncomeStreamsScreen - Shows user's gig platform income streams and predictions
 * This screen displays income streams and allows adding new income entries
 */

import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  RefreshControl
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation, useFocusEffect } from '@react-navigation/native'

// Import constants and types
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, GIG_PLATFORMS } from '../constants'
import { useAuth } from '../contexts/AuthContext'
import { getUserTransactions } from '../services/firebase'
import { Transaction, GigPlatform } from '../types'
import IncomeCharts from '../components/IncomeCharts'

/**
 * Income streams screen component
 */
export default function IncomeStreamsScreen() {
  const navigation = useNavigation()
  const { userProfile, user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  /**
   * Fetch user's income transactions
   */
  const fetchTransactions = async () => {
    if (!user) return
    
    try {
      setIsLoading(true)
      const userTransactions = await getUserTransactions(user.uid)
      // Filter only income transactions
      const incomeTransactions = userTransactions.filter(t => t.isIncome)
      setTransactions(incomeTransactions)
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Handle pull-to-refresh
   */
  const onRefresh = async () => {
    setRefreshing(true)
    await fetchTransactions()
    setRefreshing(false)
  }

  /**
   * Calculate earnings for a specific time period
   */
  const calculateEarnings = (days: number): number => {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    
    return transactions
      .filter(t => new Date(t.date) >= cutoffDate)
      .reduce((sum, t) => sum + t.amount, 0)
  }

  /**
   * Calculate earnings by platform
   */
  const calculatePlatformEarnings = (platformCode: GigPlatform, days: number): number => {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    
    return transactions
      .filter(t => 
        new Date(t.date) >= cutoffDate && 
        t.merchant === GIG_PLATFORMS[platformCode].name
      )
      .reduce((sum, t) => sum + t.amount, 0)
  }

  /**
   * Format currency for display
   */
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount)
  }

  /**
   * Navigate to add income screen
   */
  const navigateToAddIncome = () => {
    navigation.navigate('AddIncome' as never)
  }

  /**
   * Navigate to add income for specific platform
   */
  const navigateToAddPlatformIncome = (platformCode: GigPlatform) => {
    navigation.navigate('AddIncome' as never)
  }

  // Fetch transactions when component mounts or user changes
  useEffect(() => {
    fetchTransactions()
  }, [user])

  // Refresh data when screen comes into focus (real-time updates)
  useFocusEffect(
    React.useCallback(() => {
      fetchTransactions()
    }, [])
  )

  // Calculate current earnings
  const thisWeekEarnings = calculateEarnings(7)
  const lastWeekEarnings = calculateEarnings(14) - thisWeekEarnings
  const thisMonthEarnings = calculateEarnings(30)

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Income Streams</Text>
          <Text style={styles.subtitle}>Track your gig earnings across platforms</Text>
        </View>

        {/* Income Analytics - At the Top! */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Income Analytics</Text>
          <Text style={styles.sectionDescription}>Visual insights into your earnings patterns</Text>
          <IncomeCharts transactions={transactions} />
        </View>

        {/* Action Buttons */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.addIncomeButton} onPress={navigateToAddIncome}>
            <Ionicons name="add-circle" size={24} color={COLORS.surface} />
            <Text style={styles.addIncomeButtonText}>Add New Income</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bankConnectionButton} onPress={() => navigation.navigate('BankConnection' as never)}>
            <Ionicons name="link" size={20} color={COLORS.primary} />
            <Text style={styles.bankConnectionButtonText}>Connect Bank Account</Text>
          </TouchableOpacity>
        </View>

        {/* Platform Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Platforms</Text>
          
          <View style={styles.platformsList}>
            {Object.entries(GIG_PLATFORMS).map(([code, platform]) => {
              const platformCode = code as GigPlatform
              const thisWeek = calculatePlatformEarnings(platformCode, 7)
              const lastWeek = calculatePlatformEarnings(platformCode, 14) - thisWeek
              const thisMonth = calculatePlatformEarnings(platformCode, 30)
              
              return (
                <View key={code} style={styles.platformCard}>
                  <View style={styles.platformHeader}>
                    <Text style={styles.platformIcon}>{platform.icon}</Text>
                    <Text style={styles.platformName}>{platform.name}</Text>
                  </View>
                  
                  <View style={styles.platformStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>This Week</Text>
                      <Text style={styles.statValue}>{formatCurrency(thisWeek)}</Text>
                    </View>
                    
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Last Week</Text>
                      <Text style={styles.statValue}>{formatCurrency(lastWeek)}</Text>
                    </View>
                    
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>This Month</Text>
                      <Text style={styles.statValue}>{formatCurrency(thisMonth)}</Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.addPlatformIncomeButton}
                    onPress={() => navigateToAddPlatformIncome(platformCode)}
                  >
                    <Ionicons name="add" size={16} color={COLORS.primary} />
                    <Text style={styles.addPlatformIncomeButtonText}>Add Income</Text>
                  </TouchableOpacity>
                </View>
              )
            })}
          </View>
        </View>



        {/* Recent Transactions */}
        {transactions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Income</Text>
            
            <View style={styles.transactionsList}>
              {transactions
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5)
                .map((transaction, index) => (
                  <View key={index} style={styles.transactionItem}>
                    <View style={styles.transactionLeft}>
                      <Text style={styles.transactionMerchant}>{transaction.merchant}</Text>
                      <Text style={styles.transactionDescription}>{transaction.description}</Text>
                      <Text style={styles.transactionDate}>
                        {new Date(transaction.date).toLocaleDateString('en-CA', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </Text>
                    </View>
                    <Text style={styles.transactionAmount}>
                      {formatCurrency(transaction.amount)}
                    </Text>
                  </View>
                ))}
            </View>
          </View>
        )}



        {/* Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tips for Better Tracking</Text>
          
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <Text style={styles.tipText}>Record income immediately after completing a shift</Text>
            </View>
            
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <Text style={styles.tipText}>Include tips and bonuses in your total amount</Text>
            </View>
            
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <Text style={styles.tipText}>Add descriptions to help with tax categorization</Text>
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
  
  sectionDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 20
  },
  
  addIncomeButton: {
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
  
  addIncomeButtonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600'
  },
  
  bankConnectionButton: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginTop: SPACING.md
  },
  
  bankConnectionButtonText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
    fontWeight: '500'
  },
  

  
  platformsList: {
    gap: SPACING.md
  },
  
  platformCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  
  platformHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm
  },
  
  platformIcon: {
    fontSize: FONT_SIZES.xl
  },
  
  platformName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text
  },
  
  platformStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md
  },
  
  statItem: {
    alignItems: 'center',
    flex: 1
  },
  
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs
  },
  
  statValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text
  },
  
  addPlatformIncomeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: SPACING.md
  },
  
  addPlatformIncomeButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500'
  },
  
  transactionsList: {
    gap: SPACING.md
  },
  
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  
  transactionLeft: {
    flex: 1
  },
  
  transactionMerchant: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs
  },
  
  transactionDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs
  },
  
  transactionDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary
  },
  
  transactionAmount: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.success
  },
  
  tipsList: {
    gap: SPACING.md
  },
  
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm
  },
  
    tipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 20
  }
})
