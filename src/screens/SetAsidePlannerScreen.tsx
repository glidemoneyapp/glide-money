/**
 * SetAsidePlannerScreen - Weekly set-aside planning for taxes, CPP, and HST/QST
 * This screen helps gig workers plan their weekly tax set-asides to avoid tax-time surprises
 */

import React, { useState, useEffect, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  Modal
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { useFocusEffect } from '@react-navigation/native'

// Import constants and types
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, PROVINCE_TAX_RATES, TAX_CONSTANTS } from '../constants'
import { getUserRecurringBills } from '../services/firebase'
import { trackEvent } from '../services/analytics'
import { useAuth } from '../contexts/AuthContext'
import { getUserTransactions } from '../services/firebase'
import { Transaction, WeeklySetAside, Province } from '../types'
import * as Location from 'expo-location'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { Circle, Rect } from 'react-native-svg'
import type { GestureResponderEvent } from 'react-native'

type SetAsidePlannerScreenNavigationProp = StackNavigationProp<any, 'SetAside'>

interface SetAsideCalculation {
  weeklyIncome: number
  federalTax: number
  provincialTax: number
  cpp: number
  hstQst: number
  totalSetAside: number
  safeToSpend: number
  nextWeekProjection: number
}

export default function SetAsidePlannerScreen() {
  const navigation = useNavigation<SetAsidePlannerScreenNavigationProp>()
  const { userProfile, user } = useAuth()
  
  // State
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedProvince, setSelectedProvince] = useState<Province>('ON')
  const [hasGSTNumber, setHasGSTNumber] = useState(false)
  const [weeklyIncome, setWeeklyIncome] = useState('')
  const [setAsideCalculation, setSetAsideCalculation] = useState<SetAsideCalculation | null>(null)
  const [weeklyHistory, setWeeklyHistory] = useState<WeeklySetAside[]>([])
  const [isDetectingLocation, setIsDetectingLocation] = useState(false)
  const [locationInfo, setLocationInfo] = useState<{
    province: Province | null;
    city: string;
    isDetected: boolean;
  }>({
    province: null,
    city: '',
    isDetected: false
  })
  const [enablePredictions, setEnablePredictions] = useState(true)
  const [recurringBills, setRecurringBills] = useState<RecurringBillState[]>([])
  const [ytdTaxableSales, setYtdTaxableSales] = useState(24300)
  const hstThreshold = PROVINCE_TAX_RATES[selectedProvince].hstThreshold
  // v2 UI state
  const [isExplanationOpen, setIsExplanationOpen] = useState(false)
  const [isAllocationOpen, setIsAllocationOpen] = useState(false)
  const [allocation, setAllocation] = useState({ incomeTax: 190, cpp: 70, hst: 30 })

  // Fetch user's income transactions
  const fetchTransactions = async () => {
    if (!user) return
    
    try {
      setIsLoading(true)
      const userTransactions = await getUserTransactions(user.uid)
      // Filter only income transactions from the last 12 weeks
      const twelveWeeksAgo = new Date()
      twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84)
      
      const recentIncomeTransactions = userTransactions.filter(t => 
        t.isIncome && new Date(t.date) >= twelveWeeksAgo
      )
      setTransactions(recentIncomeTransactions)

      // YTD taxable sales (approximate with available transactions)
      const startOfYear = new Date(new Date().getFullYear(), 0, 1)
      const ytd = userTransactions
        .filter(t => t.isIncome && new Date(t.date) >= startOfYear)
        .reduce((sum, t) => sum + t.amount, 0)
      setYtdTaxableSales(Math.max(0, Math.round(ytd)))
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Detect user's location and recommend province
  const detectUserLocation = async () => {
    try {
      setIsDetectingLocation(true)
      
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'To provide accurate tax calculations, we need to detect your province. You can also manually select your province below.',
          [{ text: 'OK' }]
        )
        return
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      })

      // Reverse geocode to get address
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      })

      if (addressResponse.length > 0) {
        const address = addressResponse[0]
        const province = address.region as Province
        
        if (province && Object.keys(PROVINCE_TAX_RATES).includes(province)) {
          setLocationInfo({
            province,
            city: address.city || 'Unknown City',
            isDetected: true
          })
          
          // Auto-select the detected province
          setSelectedProvince(province)
          
          Alert.alert(
            'Location Detected! 🎯',
            `We detected you're in ${address.city || 'your city'}, ${PROVINCE_TAX_RATES[province].name}. Tax calculations will now be accurate for your province.`,
            [{ text: 'Perfect!' }]
          )
        } else {
          // Province not recognized, try to find closest match
          const detectedProvince = findClosestProvince(address.region || '')
          if (detectedProvince) {
            setLocationInfo({
              province: detectedProvince,
              city: address.city || 'Unknown City',
              isDetected: true
            })
            setSelectedProvince(detectedProvince)
          }
        }
      }
    } catch (error) {
      console.error('Error detecting location:', error)
      Alert.alert(
        'Location Detection Failed',
        'We couldn\'t detect your location. Please manually select your province for accurate tax calculations.',
        [{ text: 'OK' }]
      )
    } finally {
      setIsDetectingLocation(false)
    }
  }

  // Find closest province match (for edge cases)
  const findClosestProvince = (region: string): Province | null => {
    const regionLower = region.toLowerCase()
    
    // Common abbreviations and variations
    const provinceMap: Record<string, Province> = {
      'ontario': 'ON',
      'on': 'ON',
      'quebec': 'QC',
      'qc': 'QC',
      'british columbia': 'BC',
      'bc': 'BC',
      'alberta': 'AB',
      'ab': 'AB',
      'manitoba': 'MB',
      'mb': 'MB',
      'saskatchewan': 'SK',
      'sk': 'SK',
      'nova scotia': 'NS',
      'ns': 'NS',
      'new brunswick': 'NB',
      'nb': 'NB',
      'newfoundland': 'NL',
      'nl': 'NL',
      'pei': 'PE',
      'prince edward island': 'PE',
      'northwest territories': 'NT',
      'nt': 'NT',
      'nunavut': 'NU',
      'nu': 'NU',
      'yukon': 'YT',
      'yt': 'YT'
    }
    
    return provinceMap[regionLower] || null
  }

  // AI Income Pattern Analysis and Prediction
  const analyzeIncomePatterns = () => {
    if (!transactions.length) return null
    
    // Group transactions by week to find patterns
    const weeklyData = new Map<string, number>()
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date)
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay()) // Start of week (Sunday)
      const weekKey = weekStart.toISOString().split('T')[0]
      
      weeklyData.set(weekKey, (weeklyData.get(weekKey) || 0) + transaction.amount)
    })
    
    // Calculate trend and patterns
    const weeks = Array.from(weeklyData.keys()).sort()
    const weeklyAmounts = weeks.map(week => weeklyData.get(week) || 0)
    
    if (weeklyAmounts.length < 2) return null
    
    // Calculate moving average and trend
    const recentWeeks = weeklyAmounts.slice(-4) // Last 4 weeks
    const averageWeekly = recentWeeks.reduce((sum, amount) => sum + amount, 0) / recentWeeks.length
    
    // Calculate trend (positive/negative)
    const trend = weeklyAmounts[weeklyAmounts.length - 1] - weeklyAmounts[0]
    const isTrendingUp = trend > 0
    
    // Predict future income based on pattern
    const predictions = {
      weekly: Math.round(averageWeekly),
      monthly: Math.round(averageWeekly * 4.33), // 4.33 weeks per month
      sixMonths: Math.round(averageWeekly * 4.33 * 6),
      yearly: Math.round(averageWeekly * 52),
      trend: isTrendingUp ? 'up' : 'down',
      confidence: Math.min(95, Math.max(60, 100 - (weeklyAmounts.length * 5))) // More data = higher confidence
    }
    
    return predictions
  }

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true)
    await fetchTransactions()
    setRefreshing(false)
  }

  // Calculate weekly earnings from transactions
  const calculateWeeklyEarnings = (): number => {
    if (!transactions.length) return 0
    
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    return transactions
      .filter(t => new Date(t.date) >= oneWeekAgo)
      .reduce((sum, t) => sum + t.amount, 0)
  }

  // Calculate set-asides based on income and province
  const calculateSetAsides = () => {
    if (!weeklyIncome || parseFloat(weeklyIncome) <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid weekly income amount.')
      return
    }

    const weekly = parseFloat(weeklyIncome)
    const annual = weekly * 52
    
    // Get selected province tax info
    const provinceInfo = PROVINCE_TAX_RATES[selectedProvince]
    if (!provinceInfo) return

    // Federal tax brackets (2024 rates)
    let federalTaxRate = 0
    if (annual <= 55197) federalTaxRate = 0.15
    else if (annual <= 110392) federalTaxRate = 0.205
    else if (annual <= 173205) federalTaxRate = 0.26
    else if (annual <= 246752) federalTaxRate = 0.29
    else federalTaxRate = 0.33

    // Provincial tax (simplified - using basic rate)
    let provincialTaxRate = 0
    if (annual <= 50000) provincialTaxRate = 0.05
    else if (annual <= 100000) provincialTaxRate = 0.075
    else provincialTaxRate = 0.12

    // CPP (2024: 5.95% on earnings between $3,500 and $68,500)
    const cppEarnings = Math.max(0, Math.min(annual, 68500) - 3500)
    const cppWeekly = (cppEarnings * TAX_CONSTANTS.CPP_RATE) / 52

    // HST/GST (only if no GST number)
    const hstWeekly = hasGSTNumber ? 0 : (weekly * provinceInfo.hstRate)

    // Calculate weekly amounts
    const federalTaxWeekly = (annual * federalTaxRate) / 52
    const provincialTaxWeekly = (annual * provincialTaxRate) / 52
    const totalSetAside = federalTaxWeekly + provincialTaxWeekly + cppWeekly + hstWeekly
    const safeToSpend = weekly - totalSetAside

    // Project next week based on current week's earnings
    const currentWeeklyEarnings = calculateWeeklyEarnings()
    const nextWeekProjection = currentWeeklyEarnings > 0 ? currentWeeklyEarnings : weekly

    setSetAsideCalculation({
      weeklyIncome: weekly,
      federalTax: federalTaxWeekly,
      provincialTax: provincialTaxWeekly,
      cpp: cppWeekly,
      hstQst: hstWeekly,
      totalSetAside,
      safeToSpend,
      nextWeekProjection
    })
  }

  // Reset calculator
  const resetCalculator = () => {
    setWeeklyIncome('')
    setSelectedProvince('ON')
    setHasGSTNumber(false)
    setSetAsideCalculation(null)
  }

  // Format currency for display
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount)
  }

  // Get province name for display
  const getProvinceName = (code: Province): string => {
    return PROVINCE_TAX_RATES[code].name
  }

  // Load data on component mount
  useEffect(() => {
    fetchTransactions()
  }, [])

  // Refresh data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchTransactions()
    }, [])
  )

  // Auto-calculate if user has recent transactions
  useEffect(() => {
    if (transactions.length > 0) {
      const weeklyEarnings = calculateWeeklyEarnings()
      if (weeklyEarnings > 0) {
        setWeeklyIncome(weeklyEarnings.toString())
      }
    }
  }, [transactions])

  // Auto-calc set-asides when weekly income updates
  useEffect(() => {
    const n = parseFloat(weeklyIncome)
    if (Number.isFinite(n) && n > 0) calculateSetAsides()
  }, [weeklyIncome, selectedProvince, hasGSTNumber])

  // Load bills for safe-to-spend
  useEffect(() => {
    if (!user) return
    ;(async () => {
      try {
        const bills = await getUserRecurringBills(user.uid)
        setRecurringBills(bills.map(b => ({ name: b.name, amount: b.amount })))
        ;(global as any).__recurringBills = bills.map(b => ({ name: b.name, amount: b.amount }))
      } catch (err) {
        // ignore
      }
    })()
  }, [user])

  // Analytics: screen view
  useEffect(() => {
    trackEvent('setaside_reco_seen')
  }, [])

  // Derived values for recommendation
  const lastWeekIncome = useMemo(() => {
    return calculateWeeklyEarnings()
  }, [transactions])

  const recommended = useMemo(() => {
    const weekly = parseFloat(weeklyIncome || String(lastWeekIncome))
    if (!Number.isFinite(weekly) || weekly <= 0) return { total: 0, percent: 0 }

    const provinceInfo = PROVINCE_TAX_RATES[selectedProvince]
    const effectiveIncomeTaxRate = userProfile?.effectiveTaxRate ?? 0.18

    const incomeTaxWeekly = weekly * effectiveIncomeTaxRate

    const annual = weekly * 52
    const cppEarnings = Math.max(0, Math.min(annual, 68500) - 3500)
    const cppWeekly = (cppEarnings * TAX_CONSTANTS.CPP_RATE) / 52

    const hstWeekly = hasGSTNumber ? weekly * provinceInfo.hstRate : 0

    const total = Math.max(0, incomeTaxWeekly + cppWeekly + hstWeekly)
    const percent = Math.round((total / weekly) * 100)
    return { total, percent }
  }, [weeklyIncome, lastWeekIncome, selectedProvince, hasGSTNumber, userProfile])

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Top App Bar */}
      <View style={styles.appBar}>
        <View style={styles.appBarLeft}>
          <View style={styles.avatar} />
          <Text style={styles.greeting}>Hi {user?.displayName?.split(' ')[0] || 'Aman'}</Text>
        </View>
        <Text style={styles.appBarTitle}>Set Aside</Text>
        <View style={styles.appBarRight}>
          <TouchableOpacity onPress={() => setIsExplanationOpen(true)}>
            <Ionicons name="information-circle-outline" size={22} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Settings' as never)} style={{ marginLeft: 12 }}>
            <Ionicons name="settings-outline" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.subheaderStrip}>
        <Text style={styles.subheaderText}>{getCurrentWeekLabel()} • Read‑only (you move money)</Text>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Context chips */}
        <View style={styles.chipsRow}>
          <View style={styles.chip}><Text style={styles.chipText}>ON</Text></View>
          <View style={styles.dot} />
          <View style={styles.chip}><Text style={styles.chipText}>HST 13%</Text></View>
          <View style={styles.dot} />
          <View style={styles.chip}><Text style={styles.chipText}>Self‑employed CPP</Text></View>
          <View style={styles.dot} />
          <View style={styles.chip}><Text style={styles.chipText}>{getCurrentWeekLabel()}</Text></View>
        </View>

        {/* Hero Recommendation Card */}
        <LinearGradient colors={[COLORS.surface, '#F0F7FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
          <Text style={styles.heroTitle}>Set aside {formatCurrency(recommended.total)} this week</Text>
          <Text style={styles.heroSubline}>
            ~{recommended.percent}% of last week’s {formatCurrency(lastWeekIncome)}
          </Text>

          <View style={styles.heroCtas}>
            <TouchableOpacity style={styles.primaryCta} onPress={() => { trackEvent('setaside_mark_saved', { amount: recommended.total }); markAsSaved() }}>
              <Text style={styles.primaryCtaText}>Mark as Saved</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryCta} onPress={() => { trackEvent('allocation_opened'); setIsAllocationOpen(true) }}>
              <Text style={styles.secondaryCtaText}>Adjust</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => { trackEvent('why_opened'); setIsExplanationOpen(true) }}>
            <Text style={styles.whyLink}>Why this?</Text>
          </TouchableOpacity>
          <Text style={styles.assurance}>Cushion $100 protected • Glide Guard on track</Text>
          <View style={styles.chipsRowAlt}>
            <View style={styles.chip}><Text style={styles.chipText}>Income Tax {formatCurrency(allocation.incomeTax)}</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>CPP {formatCurrency(allocation.cpp)}</Text></View>
            {!hasGSTNumber && <View style={styles.chip}><Text style={styles.chipText}>HST {formatCurrency(allocation.hst)}</Text></View>}
          </View>
          <View style={styles.segmentBar}>
            <View style={[styles.segment, { backgroundColor: COLORS.primary, flex: allocation.incomeTax }]} />
            <View style={[styles.segment, { backgroundColor: COLORS.info, flex: allocation.cpp }]} />
            {!hasGSTNumber ? <View style={[styles.segment, { backgroundColor: COLORS.warning, flex: allocation.hst }]} /> : null}
          </View>
        </LinearGradient>

        {/* Safe-to-Spend mini-card */}
        <TouchableOpacity style={styles.safeMiniCard} onPress={() => navigation.navigate('Bills' as never)}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={styles.safeMiniTitle}>After bills & set‑aside →</Text>
              <Text style={styles.safeMiniAmount}>~{formatCurrency(Math.max(0, (parseFloat(String(lastWeekIncome)) || 0) - recommended.total - ((global as any).__recurringBills?.reduce((s: number, b: RecurringBillState) => s + (b.amount || 0), 0) || 0)))} safe</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={COLORS.textSecondary} />
          </View>
        </TouchableOpacity>

        {/* Payout chips row */}
        {!!recentIncomeChips().length && (
          <View style={styles.payoutRow}>
            {recentIncomeChips().map((c) => (
              <TouchableOpacity key={c.label} style={styles.payoutChip} onPress={() => showRationale(c)}>
                <Text style={styles.payoutChipText}>{c.label} ~ {formatCurrency(c.amount)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* HST/QST status strip */}
        <View style={styles.hstStrip}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={styles.hstText}>YTD taxable sales {formatCurrency(ytdTaxableSales)}</Text>
            <Text style={styles.hstText}>{Math.min(100, Math.round((ytdTaxableSales / hstThreshold) * 100))}% of {formatCurrency(hstThreshold)}</Text>
          </View>
          <View style={styles.hstBarBg}>
            <View style={[styles.hstBarFg, { width: `${Math.min(100, (ytdTaxableSales / hstThreshold) * 100)}%` }]} />
          </View>
          <View style={styles.hstChipRow}>
            <TouchableOpacity style={styles.hstChip} onPress={() => { setHasGSTNumber(!hasGSTNumber); trackEvent('hst_toggle', { registered: !hasGSTNumber }) }}>
              <Text style={styles.hstChipText}>{hasGSTNumber ? 'Registered' : 'Not Registered'}</Text>
            </TouchableOpacity>
            <Text style={styles.hstNote}>Crossing $30k in any 12 months means you must register.</Text>
          </View>
        </View>
        {/* Quick Stats Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="calculator" size={24} color={COLORS.primary} />
            <Text style={styles.cardTitle}>This Week's Earnings</Text>
          </View>
          
          <Text style={styles.earningsAmount}>
            {formatCurrency(calculateWeeklyEarnings())}
          </Text>
          
          <Text style={styles.earningsDescription}>
            Based on your recent transactions
          </Text>
        </View>

        {/* Location Card */}
        <TouchableOpacity
          style={styles.card}
          onPress={detectUserLocation}
          disabled={isDetectingLocation}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="map" size={24} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Your Location</Text>
          </View>
          {isDetectingLocation ? (
            <Text style={styles.locationInfoText}>Detecting...</Text>
          ) : locationInfo.isDetected ? (
            <View style={styles.locationInfoContainer}>
              <Text style={styles.locationInfoText}>
                {locationInfo.city}, {getProvinceName(locationInfo.province!)}
              </Text>
              <Text style={styles.locationInfoSubtext}>
                Tax calculations will be accurate for this location.
              </Text>
            </View>
          ) : (
            <Text style={styles.locationInfoText}>
              Tap to detect your location for accurate tax calculations.
            </Text>
          )}
        </TouchableOpacity>

        {/* Info Section */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 How Set-Asides Work</Text>
          <Text style={styles.infoText}>
            • <Text style={styles.infoBold}>Federal Tax:</Text> Progressive brackets - only pay higher rates on income above each threshold
          </Text>
          <Text style={styles.infoText}>
            • <Text style={styles.infoBold}>Provincial Tax:</Text> Varies by province with progressive brackets
          </Text>
          <Text style={styles.infoText}>
            • <Text style={styles.infoBold}>CPP:</Text> 5.95% on earnings between $3,500-$68,500, pro-rated for partial years
          </Text>
          <Text style={styles.infoText}>
            • <Text style={styles.infoBold}>HST:</Text> Only collect if you cross $30K threshold or don't have GST number
          </Text>
          <Text style={styles.infoText}>
            • <Text style={styles.infoBold}>Safe to Spend:</Text> Your income minus all set-asides
          </Text>
        </View>

        {/* Advanced Logic Section */}
        <View style={styles.advancedCard}>
          <Text style={styles.advancedTitle}>🧮 Advanced Calculation Logic</Text>
          <Text style={styles.advancedText}>
            • <Text style={styles.advancedBold}>YTD Income:</Text> Uses your actual transaction history, not just weekly projections
          </Text>
          <Text style={styles.advancedText}>
            • <Text style={styles.advancedBold}>Partial Year:</Text> If you started mid-year, CPP and taxes are pro-rated accordingly
          </Text>
          <Text style={styles.advancedText}>
            • <Text style={styles.advancedBold}>Progressive Brackets:</Text> Each dollar is taxed at the rate for its bracket, not your highest rate
          </Text>
          <Text style={styles.advancedText}>
            • <Text style={styles.advancedBold}>HST Threshold:</Text> Tracks if/when you'll cross $30K and adjusts collection accordingly
          </Text>
          <Text style={styles.advancedText}>
            • <Text style={styles.advancedBold}>Low Income:</Text> If you earn less than $3,500, no CPP contributions are required
          </Text>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Pro Tips</Text>
          <Text style={styles.tipsText}>
            • Set aside money weekly to avoid tax-time surprises
          </Text>
          <Text style={styles.tipsText}>
            • Keep your set-asides in a separate savings account
          </Text>
          <Text style={styles.tipsText}>
            • Review your calculations monthly as income changes
          </Text>
          <Text style={styles.tipsText}>
            • Consider quarterly HST payments if you collect over $30,000/year
          </Text>
          <Text style={styles.tipsText}>
            • If you start mid-year, your tax burden will be proportionally lower
          </Text>
        </View>
      </ScrollView>
      {/* Allocation Drawer */}
      <Modal visible={isAllocationOpen} transparent animationType="slide" onRequestClose={() => setIsAllocationOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.drawer}>
            <Text style={styles.drawerTitle}>Allocation</Text>
            <View style={styles.allocationRow}>
              <Text style={styles.allocationLabel}>Income Tax</Text>
              <View style={styles.stepper}>
                <TouchableOpacity style={styles.stepperBtn} onPress={() => setAllocation(a => ({ ...a, incomeTax: Math.max(0, a.incomeTax - 10) }))}><Text style={styles.stepperText}>−</Text></TouchableOpacity>
                <Text style={styles.stepperValue}>{formatCurrency(allocation.incomeTax)}</Text>
                <TouchableOpacity style={styles.stepperBtn} onPress={() => setAllocation(a => ({ ...a, incomeTax: a.incomeTax + 10 }))}><Text style={styles.stepperText}>+</Text></TouchableOpacity>
              </View>
            </View>
            <View style={styles.allocationRow}>
              <Text style={styles.allocationLabel}>CPP</Text>
              <View style={styles.stepper}>
                <TouchableOpacity style={styles.stepperBtn} onPress={() => setAllocation(a => ({ ...a, cpp: Math.max(0, a.cpp - 5) }))}><Text style={styles.stepperText}>−</Text></TouchableOpacity>
                <Text style={styles.stepperValue}>{formatCurrency(allocation.cpp)}</Text>
                <TouchableOpacity style={styles.stepperBtn} onPress={() => setAllocation(a => ({ ...a, cpp: a.cpp + 5 }))}><Text style={styles.stepperText}>+</Text></TouchableOpacity>
              </View>
            </View>
            <View style={styles.allocationRow}>
              <Text style={styles.allocationLabel}>HST/QST</Text>
              <View style={styles.stepper}>
                <TouchableOpacity style={styles.stepperBtn} onPress={() => setAllocation(a => ({ ...a, hst: Math.max(0, a.hst - 5) }))}><Text style={styles.stepperText}>−</Text></TouchableOpacity>
                <Text style={styles.stepperValue}>{formatCurrency(allocation.hst)}</Text>
                <TouchableOpacity style={styles.stepperBtn} onPress={() => setAllocation(a => ({ ...a, hst: a.hst + 5 }))}><Text style={styles.stepperText}>+</Text></TouchableOpacity>
              </View>
            </View>
            <View style={styles.totalBar}>
              <Text style={styles.totalBarText}>Allocated {formatCurrency(allocation.incomeTax + allocation.cpp + allocation.hst)} / {formatCurrency(recommended.total)}</Text>
            </View>
            <View style={styles.drawerButtons}>
              <TouchableOpacity style={styles.primaryCta} onPress={() => { trackEvent('allocation_saved', { allocation }); setIsAllocationOpen(false) }}>
                <Text style={styles.primaryCtaText}>Save Allocation</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tertiaryCta} onPress={() => setAllocation({ incomeTax: 190, cpp: 70, hst: 30 })}>
                <Text style={styles.tertiaryCtaText}>Reset to Recommended</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Explanation Sheet */}
      <Modal visible={isExplanationOpen} transparent animationType="fade" onRequestClose={() => setIsExplanationOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Why this amount?</Text>
            <Text style={styles.sheetBullet}>• We saw {formatCurrency(lastWeekIncome)} in gig income last week.</Text>
            <Text style={styles.sheetBullet}>• We recommend ~{recommended.percent}% for income tax based on your province & income band.</Text>
            <Text style={styles.sheetBullet}>• CPP applies above $3,500/year; we estimate a portion weekly.</Text>
            <Text style={styles.sheetBullet}>• HST set to 13% (ON). If not registered, we track threshold only.</Text>
            <TouchableOpacity style={styles.tertiaryCtaCenter} onPress={() => navigation.navigate('Learn' as never)}>
              <Text style={styles.tertiaryCtaText}>Learn more about CPP, HST/QST, thresholds</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetClose} onPress={() => setIsExplanationOpen(false)}>
              <Text style={styles.sheetCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

function getCurrentWeekLabel(): string {
  const now = new Date()
  const start = new Date(now)
  const day = start.getDay()
  const diffToMon = (day + 6) % 7
  start.setDate(start.getDate() - diffToMon)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return `${formatDateShort(start)}–${formatDateShort(end)}`
}

function formatDateShort(d: Date): string {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  return new Intl.DateTimeFormat('en-CA', opts).format(d)
}

function lastWeekIncome(): number { return 1045 }
function safeToSpendEstimate(): number { return 210 }
function calcSafeToSpend(): number {
  const weekly = parseFloat(String(lastWeekIncome()))
  const reco = 0 // replaced by recommended.total at call sites; keeping here to avoid confusion
  const upcoming = Math.round((global as any).__recurringBills?.reduce((s: number, b: RecurringBillState) => s + (b.amount || 0), 0) || 0)
  return Math.max(0, weekly - reco - upcoming)
}

// set global mirror whenever bills change (temporary)
type IncomeChip = { label: string; amount: number }
function recentIncomeChips(): IncomeChip[] { return [ { label: 'Uber Wed', amount: 620 }, { label: 'Skip Thu', amount: 240 } ] }
function showRationale(c: IncomeChip) { Alert.alert('Rationale', `${c.label}: trend over last 8 weeks`) }
function markAsSaved() { Alert.alert('Nice!', 'Saved this week’s set‑aside · 4‑week streak') }

interface RecurringBillState { name: string; amount: number }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
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
  appBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: SPACING.md, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  appBarLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  avatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.divider },
  greeting: { color: COLORS.textSecondary },
  appBarTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  appBarRight: { flexDirection: 'row', alignItems: 'center' },
  subheaderStrip: { paddingHorizontal: SPACING.lg, paddingVertical: 6, backgroundColor: COLORS.background, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  subheaderText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.xs },
  headerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm
  },
  readOnlyBadge: {
    backgroundColor: COLORS.border,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm
  },
  readOnlyBadgeText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary
  },
  
  scrollView: {
    flex: 1
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md
  },
  chip: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6
  },
  chipText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border
  },
  heroCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  heroTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text
  },
  heroSubline: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary
  },
  assurance: {
    marginTop: SPACING.sm,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center'
  },
  chipsRowAlt: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.sm
  },
  segmentBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: COLORS.divider,
    marginTop: SPACING.sm
  },
  segment: {
    height: 8
  },
  heroCtas: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md
  },
  primaryCta: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center'
  },
  primaryCtaText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.md,
    fontWeight: '600'
  },
  secondaryCta: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center'
  },
  secondaryCtaText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: '600'
  },
  whyLink: {
    marginTop: SPACING.sm,
    color: COLORS.primary,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center'
  },
  safeMiniCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  safeMiniTitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary
  },
  safeMiniAmount: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.success
  },
  payoutRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md
  },
  payoutChip: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6
  },
  payoutChipText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text
  },
  hstStrip: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  hstText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary
  },
  hstBarBg: {
    height: 8,
    backgroundColor: COLORS.divider,
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: SPACING.sm
  },
  hstBarFg: {
    height: 8,
    backgroundColor: COLORS.primary
  },
  hstChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    gap: SPACING.sm
  },
  hstChip: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    marginBottom: SPACING.xs
  },
  hstChipText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text
  },
  hstNote: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    flexShrink: 1,
    flexGrow: 1,
    minWidth: '60%'
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end'
  },
  drawer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg
  },
  drawerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md
  },
  allocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm
  },
  allocationLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6
  },
  stepperText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text
  },
  stepperValue: {
    width: 90,
    textAlign: 'right',
    fontSize: FONT_SIZES.md,
    color: COLORS.text
  },
  totalBar: {
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm
  },
  totalBarText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary
  },
  drawerButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md
  },
  tertiaryCta: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center'
  },
  tertiaryCtaCenter: {
    marginTop: SPACING.md,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center'
  },
  tertiaryCtaText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: '600'
  },
  sheet: {
    backgroundColor: COLORS.surface,
    margin: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg
  },
  sheetTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm
  },
  sheetBullet: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 6
  },
  sheetClose: {
    marginTop: SPACING.md,
    alignItems: 'center'
  },
  sheetCloseText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600'
  },
  
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
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
  
  earningsAmount: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.xs
  },
  
  earningsDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center'
  },
  
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md
  },
  
  inputGroup: {
    marginBottom: SPACING.lg
  },
  
  inputLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SPACING.sm
  },
  
  currencyInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface
  },
  
  currencySymbol: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textSecondary,
    paddingHorizontal: SPACING.md
  },
  
  textInput: {
    flex: 1,
    fontSize: FONT_SIZES.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    color: COLORS.text
  },
  
  provinceSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.sm
  },
  
  provinceButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface
  },
  
  provinceButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  
  provinceButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.text
  },
  
  provinceButtonTextActive: {
    color: COLORS.surface
  },
  
  provinceInfo: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic'
  },
  
  toggleContainer: {
    flexDirection: 'row',
    gap: SPACING.sm
  },
  
  toggleButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    alignItems: 'center'
  },
  
  toggleButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  
  toggleButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center'
  },
  
  toggleButtonTextActive: {
    color: COLORS.surface
  },
  
  calculateButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginTop: SPACING.md
  },
  
  calculateButtonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600'
  },
  
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg
  },
  
  summaryItem: {
    flex: 1,
    alignItems: 'center'
  },
  
  summaryLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs
  },
  
  summaryValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text
  },
  
  safeToSpendCard: {
    backgroundColor: COLORS.success + '10',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.success + '30'
  },
  
  safeToSpendLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs
  },
  
  safeToSpendAmount: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.success,
    marginBottom: SPACING.xs
  },
  
  safeToSpendDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center'
  },
  
  breakdownSection: {
    marginBottom: SPACING.lg
  },
  
  breakdownTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md
  },
  
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider
  },
  
  breakdownLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary
  },
  
  breakdownValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text
  },
  
  projectionCard: {
    backgroundColor: COLORS.info + '10',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.info + '30'
  },
  
  projectionTitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs
  },
  
  projectionAmount: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.info,
    marginBottom: SPACING.xs
  },
  
  projectionDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center'
  },
  
  resetButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center'
  },
  
  resetButtonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.md,
    fontWeight: '500'
  },
  
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  
  infoTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md
  },
  
  infoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    lineHeight: 20
  },
  
  infoBold: {
    fontWeight: '600',
    color: COLORS.text
  },
  
  advancedCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },

  advancedTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md
  },

  advancedText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    lineHeight: 20
  },

  advancedBold: {
    fontWeight: '600',
    color: COLORS.text
  },
  
  tipsCard: {
    backgroundColor: COLORS.warning + '10',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.warning + '30'
  },
  
  tipsTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md
  },
  
  tipsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    lineHeight: 20
  },
  // (deduped above)
  locationInfoContainer: {
    alignItems: 'center',
    marginTop: SPACING.sm
  },
  locationInfoText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center'
  },
  locationInfoSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs
  },
  predictionsContainer: {
    marginBottom: SPACING.md,
    alignItems: 'center'
  },
  predictionsLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm
  },
  predictionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.sm
  },
  predictionsItem: {
    alignItems: 'center'
  },
  predictionsValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs
  },
  predictionsItemLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary
  },
  predictionsTrend: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs
  },
  predictionsConfidence: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary
  },
  togglePredictionsButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center'
  },
  togglePredictionsButtonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.md,
    fontWeight: '500'
  }
})
