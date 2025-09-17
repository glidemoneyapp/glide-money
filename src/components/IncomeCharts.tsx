/**
 * IncomeCharts - Beautiful, minimalist income analytics
 * Matches professional chart design with clean period selection
 */

import React, { useState, useMemo } from 'react'
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from 'react-native'
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit'

// Import constants and types
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants'
import { Transaction } from '../types'
import { GIG_PLATFORMS } from '../constants'
import PlatformDropdown from './PlatformDropdown'

const screenWidth = Dimensions.get('window').width
const chartWidth = screenWidth - (SPACING.lg * 2)

interface IncomeChartsProps {
  transactions: Transaction[]
}

type TimePeriod = 'day' | 'week' | 'month' | '3months' | 'year' | 'all'
type PlatformFilter = 'all' | string

/**
 * Beautiful income charts component
 */
export default function IncomeCharts({ transactions }: IncomeChartsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('month')
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformFilter>('all')

  /**
   * Filter transactions by platform
   */
  const filteredTransactions = useMemo(() => {
    if (selectedPlatform === 'all') return transactions
    return transactions.filter(t => t.merchant === selectedPlatform)
  }, [transactions, selectedPlatform])

  if (!transactions || transactions.length === 0) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>No income data to display charts</Text>
        <Text style={styles.noDataSubtext}>Add some income entries to see beautiful visualizations!</Text>
      </View>
    )
  }

  /**
   * Get date range based on selected period
   */
  const getDateRange = (period: TimePeriod) => {
    const now = new Date()
    const startDate = new Date()
    
    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1)
        break
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case '3months':
        startDate.setMonth(now.getMonth() - 3)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      case 'all':
        startDate.setFullYear(now.getFullYear() - 5) // Last 5 years
        break
    }
    
    return { startDate, endDate: now }
  }

  /**
   * Get platform breakdown data
   */
  const getPlatformBreakdown = () => {
    const platformData: { [key: string]: number } = {}
    
    filteredTransactions.forEach(t => {
      const platform = t.merchant || 'Unknown'
      platformData[platform] = (platformData[platform] || 0) + t.amount
    })
    
    return Object.entries(platformData).map(([name, amount]) => ({
      name,
      amount,
      color: Object.values(GIG_PLATFORMS).find(p => p.name === name)?.color || '#64748B',
      legendFontColor: COLORS.text,
      legendFontSize: 12
    }))
  }

  /**
   * Get time-based data for line chart
   */
  const getTimeBasedData = () => {
    const { startDate, endDate } = getDateRange(selectedPeriod)
    const data: { [key: string]: number } = {}
    
    // Initialize data points based on period
    const current = new Date(startDate)
    while (current <= endDate) {
      let key: string = ''
      
      if (selectedPeriod === 'day') {
        // Show hours for daily view
        key = current.getHours().toString() + ':00'
        current.setHours(current.getHours() + 1)
      } else if (selectedPeriod === 'week') {
        // Show days for weekly view
        key = current.toLocaleDateString('en-CA', { weekday: 'short' })
        current.setDate(current.getDate() + 1)
      } else if (selectedPeriod === 'month') {
        // Show dates for monthly view
        key = current.getDate().toString()
        current.setDate(current.getDate() + 1)
      } else if (selectedPeriod === '3months') {
        // Show weeks for 3-month view
        const weekNumber = Math.ceil((current.getDate() + current.getDay()) / 7)
        key = `W${weekNumber}`
        current.setDate(current.getDate() + 7)
      } else if (selectedPeriod === 'year') {
        // Show months for yearly view
        key = current.toLocaleDateString('en-CA', { month: 'short' })
        current.setMonth(current.getMonth() + 1)
      } else if (selectedPeriod === 'all') {
        // Show years for all-time view
        key = current.getFullYear().toString()
        current.setFullYear(current.getFullYear() + 1)
      }
      
      if (key) {
        data[key] = 0
      }
    }
    
    // Fill in actual transaction data
    filteredTransactions.forEach(t => {
      const date = new Date(t.date)
      if (date >= startDate && date <= endDate) {
        let key: string = ''
        
        if (selectedPeriod === 'day') {
          key = date.getHours().toString() + ':00'
        } else if (selectedPeriod === 'week') {
          key = date.toLocaleDateString('en-CA', { weekday: 'short' })
        } else if (selectedPeriod === 'month') {
          key = date.getDate().toString()
        } else if (selectedPeriod === '3months') {
          const weekNumber = Math.ceil((date.getDate() + date.getDay()) / 7)
          key = `W${weekNumber}`
        } else if (selectedPeriod === 'year') {
          key = date.toLocaleDateString('en-CA', { month: 'short' })
        } else if (selectedPeriod === 'all') {
          key = date.getFullYear().toString()
        }
        
        if (key && data[key] !== undefined) {
          data[key] += t.amount
        }
      }
    })
    
    return Object.entries(data).map(([date, amount]) => ({
      date,
      amount
    }))
  }

  /**
   * Get monthly comparison data
   */
  const getMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    const currentYear = new Date().getFullYear()
    const data = months.map(month => ({ month, amount: 0 }))
    
    filteredTransactions.forEach(t => {
      const date = new Date(t.date)
      if (date.getFullYear() === currentYear) {
        const monthIndex = date.getMonth()
        data[monthIndex].amount += t.amount
      }
    })
    
    return data
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

  // Get chart data
  const platformData = getPlatformBreakdown()
  const timeData = getTimeBasedData()
  const monthlyData = getMonthlyData()

  // Calculate summary stats
  const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.amount, 0)

  const chartConfig = {
    backgroundColor: '#FFFFFF',
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, 0)`, // Transparent x-axis labels
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: COLORS.primary
    }
  }

  return (
    <View style={styles.container}>
      {/* Summary Header */}
      <View style={styles.summaryHeader}>
        <View style={styles.summaryInfo}>
          <Text style={styles.summaryAmount}>{formatCurrency(totalAmount)}</Text>
          <Text style={styles.summaryPeriod}>
            {selectedPeriod === 'day' ? 'past day' : 
             selectedPeriod === 'week' ? 'past week' :
             selectedPeriod === 'month' ? 'past month' :
             selectedPeriod === '3months' ? 'past 3 months' :
             selectedPeriod === 'year' ? 'past year' : 'all time'}
          </Text>
        </View>
        
        {/* Platform Dropdown */}
        <PlatformDropdown
          selectedPlatform={selectedPlatform}
          onPlatformChange={setSelectedPlatform}
        />
      </View>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {(['day', 'week', 'month', '3months', 'year', 'all'] as TimePeriod[]).map(period => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              selectedPeriod === period && styles.periodButtonActive
            ]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text style={[
              styles.periodButtonText,
              selectedPeriod === period && styles.periodButtonTextActive
            ]}>
              {period === 'day' ? '1D' : 
               period === 'week' ? '1W' :
               period === 'month' ? '1M' :
               period === '3months' ? '3M' :
               period === 'year' ? '1Y' : 'ALL'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Main Chart */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Income Trend</Text>
        <View style={styles.chartContainer}>
          <LineChart 
            data={{
              labels: timeData.map(d => d.date),
              datasets: [{
                data: timeData.map(d => d.amount)
              }]
            }} 
            width={chartWidth} 
            height={220} 
            chartConfig={chartConfig} 
            bezier 
            style={styles.chart} 
            withDots={true}
            withShadow={false}
            withInnerLines={false}
            withOuterLines={false}
            withVerticalLines={false}
            withHorizontalLines={true}
            horizontalLabelRotation={0}
            onDataPointClick={({ value, index }) => {
              // This makes the chart interactive
              console.log(`Clicked on ${timeData[index]?.date}: $${value}`)
            }}
            xLabelsOffset={0}
            hidePointsAtIndex={[]}
          />
        </View>
      </View>

      {/* Additional Charts */}
      <ScrollView 
        style={styles.additionalCharts} 
        contentContainerStyle={styles.additionalChartsContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Platform Breakdown */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Income by Platform</Text>
          <View style={styles.pieChartContainer}>
            <PieChart 
              data={platformData} 
              width={chartWidth} 
              height={180} 
              chartConfig={chartConfig} 
              accessor="amount" 
              backgroundColor="transparent" 
              paddingLeft="15" 
              absolute 
            />
          </View>
        </View>

        {/* Monthly Comparison */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Monthly Income</Text>
          <View style={styles.barChartContainer}>
            <BarChart 
              data={{
                labels: monthlyData.map(d => d.month),
                datasets: [{
                  data: monthlyData.map(d => d.amount)
                }]
              }} 
              width={chartWidth} 
              height={180} 
              chartConfig={chartConfig} 
              style={styles.chart} 
              showValuesOnTopOfBars 
              fromZero 
              yAxisLabel=""
              yAxisSuffix=""
              withInnerLines={false}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center' // Center all content
  },
  
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: screenWidth - (SPACING.lg * 2) // Ensure exact same width
  },
  
  summaryInfo: {
    flex: 1,
    marginRight: SPACING.md
  },
  
  summaryAmount: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs
  },
  
  summaryPeriod: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary
  },
  
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: screenWidth - (SPACING.lg * 2) // Ensure exact same width
  },
  
  periodButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'transparent'
  },
  
  periodButtonActive: {
    backgroundColor: COLORS.text
  },
  
  periodButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500'
  },
  
  periodButtonTextActive: {
    color: '#FFFFFF'
  },
  
  chartCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: screenWidth - (SPACING.lg * 2) // Ensure exact same width
  },
  
  chartTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md
  },
  
  chartContainer: {
    alignItems: 'center'
  },
  
  chart: {
    marginVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg
  },
  
  additionalCharts: {
    paddingBottom: SPACING.xl,
    width: '100%'
  },
  
  additionalChartsContent: {
    alignItems: 'center'
  },
  
  pieChartContainer: {
    alignItems: 'center'
  },
  
  barChartContainer: {
    alignItems: 'center'
  },
  
  noDataContainer: {
    padding: SPACING.xl,
    alignItems: 'center'
  },
  
  noDataText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm
  },
  
  noDataSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center'
  }
})
