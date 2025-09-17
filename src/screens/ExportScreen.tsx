/**
 * ExportScreen - CRA exports and accountant sharing
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
 * Export screen component
 */
export default function ExportScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <View style={styles.content}>
        <Text style={styles.title}>Export & Reports</Text>
        <Text style={styles.subtitle}>Coming Soon!</Text>
        <Text style={styles.description}>
          This screen will generate CRA-ready reports, 
          CSV exports, and summaries for your accountant.
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
    color: COLORS.success,
    marginBottom: SPACING.md
  },
  
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24
  }
})
