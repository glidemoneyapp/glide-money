/**
 * IncomeMetrics - Beautiful, interactive metric cards for income overview
 * Shows key metrics with animations and real-time updates
 */

import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

// Import constants and types
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants'
import { Transaction } from '../types'

// Get screen dimensions for responsive design
const screenWidth = Dimensions.get('window').width
const cardWidth = (screenWidth - (SPACING.lg * 3)) / 2

interface IncomeMetricsProps {
  transactions: Transaction[]
  onMetricPress?: (metricType: string) => void
}

/**
 * Income metrics component
 */
export default function IncomeMetrics({ transactions, onMetricPress }: IncomeMetricsProps) {
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
   * Format currency for display
   */
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount)
  }

  /**
   * Get transaction count for a period
   */
  const getTransactionCount = (days: number): number => {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    
    return transactions.filter(t => new Date(t.date) >= cutoffDate).length
  }

  /**
   * Handle metric card press
   */
  const handleMetricPress = (metricType: string) => {
    if (onMetricPress) {
      onMetricPress(metricType)
    }
  }

  // Calculate metrics
  const thisWeekEarnings = calculateEarnings(7)
  const lastWeekEarnings = calculateEarnings(14) - thisWeekEarnings
  const thisMonthEarnings = calculateEarnings(30)
  const totalEarnings = transactions.reduce((sum, t) => sum + t.amount, 0)
  
  const thisWeekCount = getTransactionCount(7)
  const thisMonthCount = getTransactionCount(30)

  return (
    <View style={styles.container}>
      {/* Main Metrics Row */}
      <View style={styles.mainRow}>
        {/* This Week Card */}
        <TouchableOpacity 
          style={[styles.metricCard, styles.primaryCard]} 
          onPress={() => handleMetricPress('thisWeek')}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="calendar" size={20} color={COLORS.surface} />
            <Text style={styles.cardTitle}>This Week</Text>
          </View>
          
          <Text style={styles.earningsAmount}>
            {formatCurrency(thisWeekEarnings)}
          </Text>
          
          <View style={styles.cardFooter}>
            <Text style={styles.transactionCount}>
              {thisWeekCount} {thisWeekCount === 1 ? 'entry' : 'entries'}
            </Text>
            <View style={styles.trendIndicator}>
              {thisWeekEarnings > lastWeekEarnings ? (
                <Ionicons name="trending-up" size={16} color={COLORS.success} />
              ) : thisWeekEarnings < lastWeekEarnings ? (
                <Ionicons name="trending-down" size={16} color={COLORS.error} />
              ) : (
                <Ionicons name="remove" size={16} color={COLORS.textSecondary} />
              )}
            </View>
          </View>
        </TouchableOpacity>

        {/* This Month Card */}
        <TouchableOpacity 
          style={[styles.metricCard, styles.secondaryCard]} 
          onPress={() => handleMetricPress('thisMonth')}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>This Month</Text>
          </View>
          
          <Text style={styles.earningsAmount}>
            {formatCurrency(thisMonthEarnings)}
          </Text>
          
          <View style={styles.cardFooter}>
            <Text style={styles.transactionCount}>
              {thisMonthCount} {thisMonthCount === 1 ? 'entry' : 'entries'}
            </Text>
            <View style={styles.trendIndicator}>
              <Ionicons name="bar-chart" size={16} color={COLORS.primary} />
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Secondary Metrics Row */}
      <View style={styles.secondaryRow}>
        {/* Total Earnings Card */}
        <TouchableOpacity 
          style={[styles.metricCard, styles.successCard]} 
          onPress={() => handleMetricPress('total')}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="wallet" size={18} color={COLORS.surface} />
            <Text style={styles.cardTitle}>Total Earnings</Text>
          </View>
          
          <Text style={styles.earningsAmount}>
            {formatCurrency(totalEarnings)}
          </Text>
          
          <View style={styles.cardFooter}>
            <Text style={styles.transactionCount}>
              {transactions.length} total {transactions.length === 1 ? 'entry' : 'entries'}
            </Text>
            <View style={styles.trendIndicator}>
              <Ionicons name="star" size={16} color={COLORS.surface} />
            </View>
          </View>
        </TouchableOpacity>

        {/* Last Week Comparison Card */}
        <TouchableOpacity 
          style={[styles.metricCard, styles.infoCard]} 
          onPress={() => handleMetricPress('lastWeek')}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="time" size={18} color={COLORS.surface} />
            <Text style={styles.cardTitle}>Last Week</Text>
          </View>
          
          <Text style={styles.earningsAmount}>
            {formatCurrency(lastWeekEarnings)}
          </Text>
          
          <View style={styles.cardFooter}>
            <Text style={styles.transactionCount}>
              {getTransactionCount(14) - thisWeekCount} entries
            </Text>
            <View style={styles.trendIndicator}>
              {lastWeekEarnings > 0 ? (
                <Ionicons name="checkmark-circle" size={16} color={COLORS.surface} />
              ) : (
                <Ionicons name="information-circle" size={16} color={COLORS.surface} />
              )}
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Quick Stats Bar */}
      <View style={styles.quickStatsBar}>
        <View style={styles.quickStat}>
          <Text style={styles.quickStatLabel}>Avg. Per Entry</Text>
          <Text style={styles.quickStatValue}>
            {transactions.length > 0 ? formatCurrency(totalEarnings / transactions.length) : '$0.00'}
          </Text>
        </View>
        
        <View style={styles.quickStat}>
          <Text style={styles.quickStatLabel}>Best Week</Text>
          <Text style={styles.quickStatValue}>
            {formatCurrency(Math.max(thisWeekEarnings, lastWeekEarnings))}
          </Text>
        </View>
        
        <View style={styles.quickStat}>
          <Text style={styles.quickStatLabel}>Active Days</Text>
          <Text style={styles.quickStatValue}>
            {new Set(transactions.map(t => new Date(t.date).toDateString())).size}
          </Text>
        </View>
      </View>
    </View>
  )
}

// Styles
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md
  },
  
  mainRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md
  },
  
  secondaryRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg
  },
  
  metricCard: {
    width: cardWidth,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    minHeight: 120
  },
  
  primaryCard: {
    backgroundColor: COLORS.primary
  },
  
  secondaryCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.primary
  },
  
  successCard: {
    backgroundColor: COLORS.success
  },
  
  infoCard: {
    backgroundColor: COLORS.info || '#3B82F6'
  },
  
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.xs
  },
  
  cardTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.surface,
    flex: 1
  },
  
  earningsAmount: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.surface,
    marginBottom: SPACING.sm,
    textAlign: 'center'
  },
  
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  
  transactionCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.surface,
    opacity: 0.9,
    flex: 1
  },
  
  trendIndicator: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  quickStatsBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  
  quickStat: {
    flex: 1,
    alignItems: 'center'
  },
  
  quickStatLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    textAlign: 'center'
  },
  
  quickStatValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center'
  }
})
