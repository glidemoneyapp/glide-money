/**
 * HomeScreen - Main dashboard for the GlideMoney app
 * Shows safe-to-spend amount, upcoming bills, and weekly set-aside information
 */

import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

// Import constants and types
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants'
import { SafeToSpend, WeeklySetAside } from '../types'

/**
 * Main home screen component
 */
export default function HomeScreen() {
  // TODO: Replace with real data from Firebase
  const mockSafeToSpend: SafeToSpend = {
    userId: 'user123',
    currentBalance: 2450.75,
    upcomingBills: 320.50,
    setAsides: 185.00,
    nextIncome: 680.00,
    safeAmount: 2625.25,
    shortfallWarning: undefined,
    calculatedAt: new Date()
  }

  const mockWeeklySetAside: WeeklySetAside = {
    id: 'setaside123',
    userId: 'user123',
    weekStart: new Date('2024-01-15'),
    weekEnd: new Date('2024-01-21'),
    totalEarnings: 680.00,
    incomeTax: 102.00,
    cpp: 40.46,
    hstQst: 88.40,
    totalSetAside: 230.86,
    isCompleted: false,
    createdAt: new Date(),
    updatedAt: new Date()
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
   * Format date for display
   */
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-CA', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>GlideMoney</Text>
        <Text style={styles.headerSubtitle}>Your Financial Coach</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Safe to Spend Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="wallet" size={24} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Safe to Spend</Text>
          </View>
          
          <Text style={styles.safeAmount}>
            {formatCurrency(mockSafeToSpend.safeAmount)}
          </Text>
          
          <Text style={styles.safeDescription}>
            Available after bills and set-asides
          </Text>

          {/* Breakdown */}
          <View style={styles.breakdown}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Current Balance</Text>
              <Text style={styles.breakdownValue}>
                {formatCurrency(mockSafeToSpend.currentBalance)}
              </Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Upcoming Bills</Text>
              <Text style={[styles.breakdownValue, styles.negative]}>
                -{formatCurrency(mockSafeToSpend.upcomingBills)}
              </Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Set-Asides</Text>
              <Text style={[styles.breakdownValue, styles.negative]}>
                -{formatCurrency(mockSafeToSpend.setAsides)}
              </Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Next Income</Text>
              <Text style={[styles.breakdownValue, styles.positive]}>
                +{formatCurrency(mockSafeToSpend.nextIncome)}
              </Text>
            </View>
          </View>
        </View>

        {/* Weekly Set-Aside Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="calculator" size={24} color={COLORS.secondary} />
            <Text style={styles.cardTitle}>This Week's Set-Aside</Text>
          </View>
          
          <Text style={styles.setAsideAmount}>
            {formatCurrency(mockWeeklySetAside.totalSetAside)}
          </Text>
          
          <Text style={styles.setAsideDescription}>
            {formatDate(mockWeeklySetAside.weekStart)} - {formatDate(mockWeeklySetAside.weekEnd)}
          </Text>

          {/* Set-Aside Breakdown */}
          <View style={styles.setAsideBreakdown}>
            <View style={styles.setAsideRow}>
              <Text style={styles.setAsideLabel}>Income Tax</Text>
              <Text style={styles.setAsideValue}>
                {formatCurrency(mockWeeklySetAside.incomeTax)}
              </Text>
            </View>
            <View style={styles.setAsideRow}>
              <Text style={styles.setAsideLabel}>CPP</Text>
              <Text style={styles.setAsideValue}>
                {formatCurrency(mockWeeklySetAside.cpp)}
              </Text>
            </View>
            <View style={styles.setAsideRow}>
              <Text style={styles.setAsideLabel}>HST/QST</Text>
              <Text style={styles.setAsideValue}>
                {formatCurrency(mockWeeklySetAside.hstQst)}
              </Text>
            </View>
          </View>

          <View style={styles.setAsideStatus}>
            <Ionicons 
              name={mockWeeklySetAside.isCompleted ? "checkmark-circle" : "time"} 
              size={20} 
              color={mockWeeklySetAside.isCompleted ? COLORS.success : COLORS.warning} 
            />
            <Text style={[
              styles.setAsideStatusText,
              { color: mockWeeklySetAside.isCompleted ? COLORS.success : COLORS.warning }
            ]}>
              {mockWeeklySetAside.isCompleted ? 'Completed' : 'Pending'}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          
          <View style={styles.quickActions}>
            <View style={styles.quickAction}>
              <Ionicons name="add-circle" size={24} color={COLORS.primary} />
              <Text style={styles.quickActionText}>Add Income</Text>
            </View>
            
            <View style={styles.quickAction}>
              <Ionicons name="receipt" size={24} color={COLORS.secondary} />
              <Text style={styles.quickActionText}>Add Bill</Text>
            </View>
            
            <View style={styles.quickAction}>
              <Ionicons name="card" size={24} color={COLORS.success} />
              <Text style={styles.quickActionText}>Connect Bank</Text>
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
  
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs
  },
  
  headerSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary
  },
  
  scrollView: {
    flex: 1,
    paddingHorizontal: SPACING.lg
  },
  
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginVertical: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md
  },
  
  cardTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: SPACING.sm
  },
  
  safeAmount: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.success,
    textAlign: 'center',
    marginBottom: SPACING.sm
  },
  
  safeDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg
  },
  
  breakdown: {
    gap: SPACING.sm
  },
  
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  
  breakdownLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary
  },
  
  breakdownValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text
  },
  
  negative: {
    color: COLORS.error
  },
  
  positive: {
    color: COLORS.success
  },
  
  setAsideAmount: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.secondary,
    textAlign: 'center',
    marginBottom: SPACING.sm
  },
  
  setAsideDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg
  },
  
  setAsideBreakdown: {
    gap: SPACING.sm,
    marginBottom: SPACING.md
  },
  
  setAsideRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  
  setAsideLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary
  },
  
  setAsideValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text
  },
  
  setAsideStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs
  },
  
  setAsideStatusText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500'
  },
  
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.md
  },
  
  quickAction: {
    alignItems: 'center',
    gap: SPACING.xs
  },
  
  quickActionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center'
  }
})
