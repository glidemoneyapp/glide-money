import React, { useState } from 'react'
import { SafeAreaView, StatusBar, ScrollView, View, Text } from 'react-native'
import { COLORS, SPACING, FONT_SIZES } from '../constants'
import GlassCard from '../ui/GlassCard'
import { PrimaryButton, SecondaryButton } from '../ui/Button'
import SpendPowerMedallion from '../ui/Medallion'
import FlowBar from '../ui/FlowBar'
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
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ paddingHorizontal: SPACING.lg, paddingTop: SPACING.md }}>
          <Text style={{ color: COLORS.textSecondary, fontSize: FONT_SIZES.xs }}>{demo.week}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: FONT_SIZES.xl, fontWeight: '700', color: COLORS.text }}>Set Aside</Text>
            <View style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
              <Text style={{ color: COLORS.textSecondary, fontSize: FONT_SIZES.xs }}>Read‑only</Text>
            </View>
          </View>
        </View>

        {/* A) Spend Power medallion */}
        <SpendPowerMedallion amount={demo.spendPower} cushion={demo.cushion} />

        {/* B) Flow bar */}
        <FlowBar reserve={demo.reserve} locked={demo.locked} spend={demo.spendPower} cushion={demo.cushion} onPress={setSheet} />

        {/* C) Money Day */}
        <GlassCard>
          <Text style={{ color: COLORS.text, fontWeight: '600' }}>Money Day</Text>
          <Text style={{ color: COLORS.text, marginTop: 6 }}>Move ${demo.reserve} to your CRA Reserve by Wed 5pm.</Text>
          <View style={{ flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm }}>
            <PrimaryButton title="Mark as Moved" onPress={() => {}} gradient="sky" />
            <SecondaryButton title="Why $61?" onPress={() => setSheet('reserve')} />
          </View>
          <Text style={{ color: COLORS.textSecondary, marginTop: 6 }}>Based on last week’s ${demo.deposits} deposits.</Text>
        </GlassCard>

        {/* D) Next 7 days */}
        <GlassCard>
          <Text style={{ color: COLORS.text, fontWeight: '600' }}>Next 7 days</Text>
          {demo.events.map((e, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              <Text style={{ color: e.tone === 'warn' ? '#B45309' : COLORS.textSecondary }}>{e.kind === 'card' ? 'Card Guard' : 'Bill'}</Text>
              <Text style={{ color: COLORS.text }}>{e.when} — {e.label}</Text>
            </View>
          ))}
        </GlassCard>

        {/* E) HST pace */}
        <GlassCard>
          <Text style={{ color: COLORS.text, fontWeight: '600' }}>HST pace</Text>
          <Text style={{ color: COLORS.textSecondary, marginTop: 6 }}>Taxable sales ${demo.hst.ytdTaxable} this year ({Math.round((demo.hst.ytdTaxable / demo.hst.threshold) * 100)}% of $30k)</Text>
          <View style={{ height: 6, backgroundColor: COLORS.divider, borderRadius: 999, marginTop: 6, overflow: 'hidden' }}>
            <View style={{ height: 6, width: `${Math.min(100, (demo.hst.ytdTaxable / demo.hst.threshold) * 100)}%`, backgroundColor: COLORS.primary }} />
          </View>
        </GlassCard>
      </ScrollView>

      {/* Bottom sheets */}
      <BottomSheet visible={sheet === 'reserve'} title={`CRA Reserve $${demo.reserve}`} onClose={() => setSheet(null)}>
        <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
          <GlassMini label={`Income Tax $${demo.split.tax}`} />
          <GlassMini label={`CPP $${demo.split.cpp}`} />
          <GlassMini label={`HST $${demo.split.hst}`} />
        </View>
        <PrimaryButton title="Mark as Moved" onPress={() => {}} gradient="sky" style={{ marginTop: SPACING.md }} />
        <Text style={{ color: COLORS.textSecondary, marginTop: 6 }}>35 + 26 + 0 = 61</Text>
      </BottomSheet>
      <BottomSheet visible={sheet === 'locked'} title={`Locked $${demo.locked}`} onClose={() => setSheet(null)}>
        {demo.events.map((e, i) => (
          <Text key={i} style={{ color: e.tone === 'warn' ? '#B45309' : COLORS.text, marginTop: 6 }}>{e.when} — {e.label}</Text>
        ))}
      </BottomSheet>
      <BottomSheet visible={sheet === 'spend'} title={`Spend Power $${demo.spendPower}`} onClose={() => setSheet(null)}>
        <Text style={{ color: COLORS.text, marginTop: 6 }}>• Groceries & fuel</Text>
        <Text style={{ color: COLORS.text, marginTop: 6 }}>• Optional card top-up</Text>
        <Text style={{ color: COLORS.text, marginTop: 6 }}>• Add to Safety Cushion</Text>
      </BottomSheet>
    </SafeAreaView>
  )
}

function GlassMini({ label }: { label: string }) {
  return (
    <View style={{ backgroundColor: 'rgba(255,255,255,0.78)', borderWidth: 1, borderColor: 'rgba(15,23,42,0.08)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 }}>
      <Text style={{ color: COLORS.text }}>{label}</Text>
    </View>
  )
}




