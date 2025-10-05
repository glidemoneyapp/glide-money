import React, { useState } from 'react'
import { SafeAreaView, StatusBar, ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants'
import { PrimaryButton, SecondaryButton } from '../ui/Button'
import BottomSheet from '../ui/BottomSheet'
import { SpendPowerModel } from '../types/money'

const demo: SpendPowerModel = {
  week: 'Mon Sep 1 → Sun Sep 7',
  deposits: 250,
  spendPower: 189,
  reserve: 61,
  locked: 107,
  cushion: 100,
  events: [
    { kind: 'card', when: 'Tue 5pm', label: 'Pay $62 (posts before Thu close)' },
    { kind: 'card', when: 'Thu 5pm', label: 'Pay $45 (posts before Fri close)' },
    { kind: 'bill', when: 'Fri', label: 'Insurance PAD $180', tone: 'warn' }
  ],
  split: { tax: 35, cpp: 26, hst: 0 },
  hst: { registered: false, ytdTaxable: 320, threshold: 30000 }
}

export default function SetAsideScreen() {
  const [sheet, setSheet] = useState<null | 'reserve' | 'locked' | 'spend'>(null)

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Set Aside</Text>
          <Text style={styles.headerSubtitle}>{demo.week}</Text>
        </View>

        {/* Main Spend Power Card - Most Important */}
        <View style={styles.mainCard}>
          <View style={styles.spendPowerHeader}>
            <Ionicons name="wallet" size={28} color={COLORS.success} />
            <Text style={styles.spendPowerTitle}>Your Spend Power</Text>
          </View>
          
          <Text style={styles.spendPowerAmount}>${demo.spendPower}</Text>
          <Text style={styles.spendPowerSubtitle}>✨ Free to use this week</Text>
          
          <Text style={styles.spendPowerDescription}>
            After CRA Reserve, Locked items, and your ${demo.cushion} Safety Cushion
          </Text>
        </View>

        {/* Money Breakdown - Visual Flow */}
        <View style={styles.breakdownCard}>
          <Text style={styles.cardTitle}>This Week's Money Flow</Text>
          
          <View style={styles.flowContainer}>
            {/* CRA Reserve */}
            <TouchableOpacity 
              style={styles.flowItem} 
              onPress={() => setSheet('reserve')}
            >
              <View style={styles.flowItemHeader}>
                <Ionicons name="shield" size={20} color="#3B82F6" />
                <Text style={styles.flowItemTitle}>CRA Reserve</Text>
                <Text style={styles.flowItemAmount}>${demo.reserve}</Text>
              </View>
              <View style={[styles.flowBar, { backgroundColor: '#3B82F6', width: '18%' }]} />
            </TouchableOpacity>

            {/* Locked */}
            <TouchableOpacity 
              style={styles.flowItem} 
              onPress={() => setSheet('locked')}
            >
              <View style={styles.flowItemHeader}>
                <Ionicons name="lock-closed" size={20} color="#8B5CF6" />
                <Text style={styles.flowItemTitle}>Locked</Text>
                <Text style={styles.flowItemAmount}>${demo.locked}</Text>
              </View>
              <View style={[styles.flowBar, { backgroundColor: '#8B5CF6', width: '30%' }]} />
            </TouchableOpacity>

            {/* Spend Power */}
            <TouchableOpacity 
              style={styles.flowItem} 
              onPress={() => setSheet('spend')}
            >
              <View style={styles.flowItemHeader}>
                <Ionicons name="leaf" size={20} color="#10B981" />
                <Text style={styles.flowItemTitle}>Spend Power</Text>
                <Text style={styles.flowItemAmount}>${demo.spendPower}</Text>
              </View>
              <View style={[styles.flowBar, { backgroundColor: '#10B981', width: '52%' }]} />
            </TouchableOpacity>
            </View>

          <View style={styles.safetyCushion}>
            <Ionicons name="umbrella" size={16} color={COLORS.textSecondary} />
            <Text style={styles.safetyCushionText}>Safety Cushion: ${demo.cushion}</Text>
          </View>
        </View>

        {/* Action Required */}
        <View style={styles.actionCard}>
          <View style={styles.actionHeader}>
            <Ionicons name="calendar" size={24} color={COLORS.warning} />
            <Text style={styles.actionTitle}>Action Required</Text>
          </View>
          
          <Text style={styles.actionDescription}>
            Move ${demo.reserve} to your CRA Reserve by Wed 5pm
          </Text>
          
          <View style={styles.actionButtons}>
            <PrimaryButton title="Mark as Moved" onPress={() => {}} gradient="sky" />
            <SecondaryButton title="Why $61?" onPress={() => setSheet('reserve')} />
          </View>
          
          <Text style={styles.actionNote}>
            Based on last week's ${demo.deposits} deposits
          </Text>
        </View>

        {/* Upcoming Events */}
        <View style={styles.eventsCard}>
          <Text style={styles.cardTitle}>Upcoming This Week</Text>
          
          {demo.events.map((event, index) => (
            <View 
              key={index} 
              style={[
                styles.eventItem,
                event.tone === 'warn' && styles.eventItemUrgent
              ]}
            >
              <View style={styles.eventIconContainer}>
                <Ionicons 
                  name={event.kind === 'card' ? 'shield' : 'lock-closed'} 
                  size={20} 
                  color={event.tone === 'warn' ? COLORS.warning : COLORS.textSecondary} 
                />
              </View>
              <View style={styles.eventContent}>
                <Text style={styles.eventTime}>{event.when}</Text>
                <Text style={styles.eventDescription}>
                  {event.kind === 'card' ? 'Card Guard' : 'Insurance PAD'} · {event.label}
                </Text>
              </View>
              {event.tone === 'warn' && (
                <View style={styles.urgentBadge}>
                  <Text style={styles.urgentText}>!</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* HST Progress */}
        <View style={styles.progressCard}>
          <Text style={styles.cardTitle}>HST Registration Progress</Text>
          <Text style={styles.progressDescription}>
            Taxable sales ${demo.hst.ytdTaxable} this year
          </Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[
                styles.progressFill,
                { width: `${Math.min(100, (demo.hst.ytdTaxable / demo.hst.threshold) * 100)}%` }
              ]} />
            </View>
            <Text style={styles.progressText}>
              {Math.round((demo.hst.ytdTaxable / demo.hst.threshold) * 100)}% of $30k threshold
            </Text>
          </View>
        </View>

      </ScrollView>

      {/* Bottom Sheets */}
      <BottomSheet visible={sheet === 'reserve'} title={`CRA Reserve $${demo.reserve}`} onClose={() => setSheet(null)}>
        <View style={styles.breakdownDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Income Tax</Text>
            <Text style={styles.detailValue}>${demo.split.tax}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>CPP</Text>
            <Text style={styles.detailValue}>${demo.split.cpp}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>HST</Text>
            <Text style={styles.detailValue}>${demo.split.hst}</Text>
          </View>
        </View>
        <PrimaryButton title="Mark as Moved" onPress={() => {}} gradient="sky" style={{ marginTop: SPACING.lg }} />
        <Text style={styles.calculationText}>
          {demo.split.tax} + {demo.split.cpp} + {demo.split.hst} = ${demo.reserve}
        </Text>
      </BottomSheet>

      <BottomSheet visible={sheet === 'locked'} title={`Locked $${demo.locked}`} onClose={() => setSheet(null)}>
        <Text style={styles.lockedDescription}>
          This money is reserved for upcoming bills and obligations
        </Text>
        {demo.events.map((event, index) => (
          <View key={index} style={styles.lockedEvent}>
            <Text style={styles.lockedEventTime}>{event.when}</Text>
            <Text style={styles.lockedEventDescription}>{event.label}</Text>
          </View>
        ))}
      </BottomSheet>

      <BottomSheet visible={sheet === 'spend'} title={`Spend Power $${demo.spendPower}`} onClose={() => setSheet(null)}>
        <Text style={styles.spendDescription}>
          This money is available for your daily expenses
        </Text>
        <View style={styles.spendSuggestions}>
          <Text style={styles.suggestionItem}>• Groceries & fuel</Text>
          <Text style={styles.suggestionItem}>• Optional card top-up</Text>
          <Text style={styles.suggestionItem}>• Add to Safety Cushion</Text>
        </View>
      </BottomSheet>
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
    flex: 1,
    paddingHorizontal: SPACING.lg
  },
  
  header: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: SPACING.lg
  },
  
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs
  },
  
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary
  },
  
  // Main Spend Power Card - Hero Section
  mainCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5
  },
  
  spendPowerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md
  },
  
  spendPowerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: SPACING.sm
  },
  
  spendPowerAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.success,
    marginBottom: SPACING.xs
  },
  
  spendPowerSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md
  },
  
  spendPowerDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20
  },
  
  // Money Flow Breakdown Card
  breakdownCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  
  cardTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.lg
  },
  
  flowContainer: {
    gap: SPACING.md
  },
  
  flowItem: {
    paddingVertical: SPACING.sm
  },
  
  flowItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs
  },
  
  flowItemTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text,
    marginLeft: SPACING.sm
  },
  
  flowItemAmount: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text
  },
  
  flowBar: {
    height: 6,
    borderRadius: 3
  },
  
  safetyCushion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider
  },
  
  safetyCushionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs
  },
  
  // Action Required Card
  actionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md
  },
  
  actionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: SPACING.sm
  },
  
  actionDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.lg,
    lineHeight: 22
  },
  
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md
  },
  
  actionNote: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary
  },
  
  // Events Card
  eventsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm
  },
  
  eventItemUrgent: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)'
  },
  
  eventIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.divider,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md
  },
  
  eventContent: {
    flex: 1
  },
  
  eventTime: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2
  },
  
  eventDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 18
  },
  
  urgentBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.warning,
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  urgentText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold'
  },
  
  // Progress Card
  progressCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  
  progressDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md
  },
  
  progressContainer: {
    gap: SPACING.sm
  },
  
  progressBar: {
    height: 8,
    backgroundColor: COLORS.divider,
    borderRadius: 4,
    overflow: 'hidden'
  },
  
  progressFill: {
    height: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 4
  },
  
  progressText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center'
  },
  
  // Bottom Sheet Styles
  breakdownDetails: {
    gap: SPACING.md
  },
  
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider
  },
  
  detailLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary
  },
  
  detailValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text
  },
  
  calculationText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm
  },
  
  lockedDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight: 22
  },
  
  lockedEvent: {
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider
  },
  
  lockedEventTime: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2
  },
  
  lockedEventDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary
  },
  
  spendDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight: 22
  },
  
  spendSuggestions: {
    gap: SPACING.sm
  },
  
  suggestionItem: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 22
  }
})




