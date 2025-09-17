/**
 * BillsScreen - Manage recurring bills and PADs
 * This is a placeholder screen that will be enhanced with real functionality
 */

import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar
} from 'react-native'

// Import constants
import { COLORS, SPACING, FONT_SIZES } from '../constants'

/**
 * Bills screen component
 */
export default function BillsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <View style={styles.content}>
        <Text style={styles.title}>Bills & PADs</Text>
        <Text style={styles.subtitle}>Coming Soon!</Text>
        <Text style={styles.description}>
          This screen will help you track recurring bills, 
          set up payment reminders, and avoid overdrafts.
        </Text>
      </View>
    </SafeAreaView>
  )
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg
  },
  
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm
  },
  
  subtitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.warning,
    marginBottom: SPACING.md
  },
  
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24
  }
})
