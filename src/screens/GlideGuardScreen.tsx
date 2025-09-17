import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, TouchableOpacity, RefreshControl, Modal } from 'react-native'
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants'
import { computeDemoGlideGuardPlan, markSlicePaid, computePlan } from '../services/glideGuard'
import { trackEvent } from '../services/analytics'
import { useAuth } from '../contexts/AuthContext'
import { getLatestGlideGuardPlan, getUserCardProfiles, getUserRecurringBills, getUserTransactions } from '../services/firebase'
import Svg, { Circle } from 'react-native-svg'

export default function GlideGuardScreen() {
  const { user } = useAuth()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [plan, setPlan] = useState(computeDemoGlideGuardPlan())
  const [whyOpen, setWhyOpen] = useState<null | { title: string, body: string }>(null)

  useEffect(() => {
    trackEvent('glideguard_plan_viewed', { slices: plan.thisWeek.length })
  }, [])

  const onRefresh = async () => {
    setIsRefreshing(true)
    try {
      if (user) {
        const [cards, bills, txns] = await Promise.all([
          getUserCardProfiles(user.uid),
          getUserRecurringBills(user.uid),
          getUserTransactions(user.uid, 100)
        ])
        const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7)
        const weeklyIncome = txns.filter(t => t.isIncome && new Date(t.date) >= weekAgo).reduce((s, t) => s + (t.amount || 0), 0)
        const userProfile = (await (await import('../contexts/AuthContext')).useAuth()).userProfile
        // Fallback profile if context not accessible in refresh
        const profile = userProfile || { province: 'ON', hstRegistered: false, effectiveTaxRate: 0.18, glideGuardCadence: 'weekly', glideGuardTargetPercent: 0.30, cushionBuffer: 100 } as any
        const computed = computePlan({ cards, userProfile: profile, upcomingBills: bills, weeklyIncome })
        setPlan(computed)
      }
    } finally {
      setIsRefreshing(false)
    }
  }

  const topUpRisk = useMemo(() => {
    // simple heuristic placeholder: if more than one slice and first amount < 50 show top-up banner
    const first = plan.thisWeek[0]
    return !!first && first.amount < 50
  }, [plan])

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}>
        <View style={styles.header}>
          <Text style={styles.title}>Glide Guard™</Text>
          <Text style={styles.subtitle}>This week’s plan keeps your cards on track</Text>
        </View>

        {/* Top-up banner (conditional) */}
        {topUpRisk && (
          <View style={styles.banner}>
            <Text style={styles.bannerTitle}>Shortfall risk</Text>
            <Text style={styles.bannerText}>Spend drift may miss target. One small top-up could keep you on track.</Text>
            <View style={{ flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm }}>
              <TouchableOpacity style={styles.bannerPrimary}><Text style={styles.bannerPrimaryText}>See options</Text></TouchableOpacity>
              <TouchableOpacity style={styles.bannerSecondary}><Text style={styles.bannerSecondaryText}>Dismiss</Text></TouchableOpacity>
            </View>
          </View>
        )}

        {/* Hero plan */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>This week’s payments</Text>
          {plan.thisWeek.map(slice => (
            <View key={slice.cardId} style={styles.sliceRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sliceTitle}>{slice.cardName} — Pay ${slice.amount}</Text>
                <Text style={styles.sliceSub}>by {slice.safeBy}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
                <TouchableOpacity style={styles.linkBtn} onPress={() => setWhyOpen({ title: slice.cardName, body: slice.rationale })}><Text style={styles.linkBtnText}>Why?</Text></TouchableOpacity>
                <TouchableOpacity style={styles.payBtn} onPress={() => markSlicePaid(slice.cardId, slice.amount)}>
                  <Text style={styles.payBtnText}>Pay now</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          {!plan.thisWeek.length && (
            <Text style={styles.empty}>No payments needed this week.</Text>
          )}
        </View>

        {/* 14-day timeline */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Next 14 days</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: SPACING.sm }}>
            {Array.from({ length: 14 }).map((_, i) => (
              <View key={i} style={styles.dayCol}>
                <View style={styles.dayDot} />
                <Text style={styles.dayLabel}>D+{i}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* KPI cards */}
        <View style={[styles.card, { paddingBottom: SPACING.md }]}>
          <Text style={styles.sectionTitle}>Impact</Text>
          <View style={styles.kpiRow}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiValue}>82%</Text>
              <Text style={styles.kpiLabel}>Cycles ≤ target</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiValue}>$12</Text>
              <Text style={styles.kpiLabel}>Interest saved/mo</Text>
            </View>
          </View>
          <View style={styles.kpiRow}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiValue}>91%</Text>
              <Text style={styles.kpiLabel}>On-time rate</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiValue}>4</Text>
              <Text style={styles.kpiLabel}>Week streak</Text>
            </View>
          </View>
        </View>

        {/* Card list with utilization rings (demo entries) */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Cards</Text>
          <CardRow name="TD Visa" utilization={0.22} target={0.30} dueLabel="Thu 22" />
          <CardRow name="RBC MC" utilization={0.12} target={0.30} dueLabel="Fri 23" />
        </View>

        {/* Why modal */}
        <Modal visible={!!whyOpen} transparent animationType="fade" onRequestClose={() => setWhyOpen(null)}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>{whyOpen?.title}</Text>
              <Text style={styles.modalBody}>{whyOpen?.body}</Text>
              <TouchableOpacity style={styles.modalClose} onPress={() => setWhyOpen(null)}>
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  )
}

function CardRow({ name, utilization, target, dueLabel }: { name: string; utilization: number; target: number; dueLabel: string }) {
  const radius = 16
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(1, utilization)
  const strokeDashoffset = circumference * (1 - progress)
  return (
    <View style={styles.cardRow}>
      <Svg width={40} height={40}>
        <Circle cx={20} cy={20} r={radius} stroke={COLORS.divider} strokeWidth={4} fill="none" />
        <Circle cx={20} cy={20} r={radius} stroke={utilization <= target ? COLORS.success : COLORS.warning} strokeWidth={4} strokeDasharray={`${circumference}`} strokeDashoffset={strokeDashoffset} strokeLinecap="round" fill="none" />
      </Svg>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardRowTitle}>{name}</Text>
        <Text style={styles.cardRowSub}>{Math.round(utilization * 100)}% • Target {Math.round(target * 100)}% • Due {dueLabel}</Text>
      </View>
      <TouchableOpacity style={styles.linkBtn}><Text style={styles.linkBtnText}>Details</Text></TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollView: { flex: 1 },
  header: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl, paddingBottom: SPACING.lg },
  title: { fontSize: FONT_SIZES.xxl, fontWeight: 'bold', color: COLORS.text },
  subtitle: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  sliceRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  sliceTitle: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.text },
  sliceSub: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  sliceWhy: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  payBtn: { borderWidth: 1, borderColor: COLORS.primary, paddingVertical: 8, paddingHorizontal: 12, borderRadius: BORDER_RADIUS.md },
  payBtnText: { color: COLORS.primary, fontWeight: '600' },
  empty: { textAlign: 'center', color: COLORS.textSecondary }
  ,
  banner: { backgroundColor: COLORS.warning + '10', borderWidth: 1, borderColor: COLORS.warning + '30', borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, marginHorizontal: SPACING.lg, marginTop: SPACING.lg },
  bannerTitle: { color: COLORS.warning, fontWeight: '700' },
  bannerText: { color: COLORS.textSecondary, marginTop: 4 },
  bannerPrimary: { backgroundColor: COLORS.primary, paddingVertical: 8, paddingHorizontal: 12, borderRadius: BORDER_RADIUS.md },
  bannerPrimaryText: { color: COLORS.surface, fontWeight: '600' },
  bannerSecondary: { borderWidth: 1, borderColor: COLORS.border, paddingVertical: 8, paddingHorizontal: 12, borderRadius: BORDER_RADIUS.md },
  bannerSecondaryText: { color: COLORS.text },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.sm },
  dayCol: { alignItems: 'center', width: 48 },
  dayDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.border, marginBottom: 6 },
  dayLabel: { color: COLORS.textSecondary, fontSize: FONT_SIZES.xs },
  kpiRow: { flexDirection: 'row', gap: SPACING.sm },
  kpiCard: { flex: 1, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md, padding: SPACING.md, alignItems: 'center' },
  kpiValue: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: COLORS.text },
  kpiLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  linkBtn: { borderWidth: 1, borderColor: COLORS.border, paddingVertical: 6, paddingHorizontal: 10, borderRadius: BORDER_RADIUS.md },
  linkBtnText: { color: COLORS.text },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  cardRowTitle: { color: COLORS.text, fontWeight: '600' },
  cardRowSub: { color: COLORS.textSecondary, fontSize: FONT_SIZES.xs },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  modalCard: { width: '90%', backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg },
  modalTitle: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.sm },
  modalBody: { color: COLORS.textSecondary },
  modalClose: { marginTop: SPACING.md, alignItems: 'center' },
  modalCloseText: { color: COLORS.primary, fontWeight: '600' }
})


