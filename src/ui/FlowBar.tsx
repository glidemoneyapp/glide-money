import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { COLORS, SPACING, FONT_SIZES } from '../constants'

export function FlowBar({ reserve, locked, spend, cushion, onPress }: { reserve: number; locked: number; spend: number; cushion: number; onPress: (seg: 'reserve' | 'locked' | 'spend') => void }) {
  const total = Math.max(1, reserve + locked + spend)
  const pct = (v: number) => (v / total) * 100
  return (
    <View style={{ marginHorizontal: SPACING.lg, marginTop: SPACING.lg }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ color: COLORS.text, fontWeight: '600' }}>This Week’s Flow</Text>
        <Text style={{ color: COLORS.textSecondary }}>Safety Cushion ${cushion}</Text>
      </View>
      <View style={{ flexDirection: 'row', height: 14, borderRadius: 999, overflow: 'hidden', backgroundColor: COLORS.divider }}>
        <Pressable style={{ width: `${pct(reserve)}%` }} onPress={() => onPress('reserve')} accessibilityLabel={`CRA Reserve ${reserve}`}> 
          <LinearGradient colors={["#38BDF8", "#0284C7"]} style={{ flex: 1 }} />
        </Pressable>
        <Pressable style={{ width: `${pct(locked)}%` }} onPress={() => onPress('locked')} accessibilityLabel={`Locked ${locked}`}>
          <LinearGradient colors={["#818CF8", "#4F46E5"]} style={{ flex: 1 }} />
        </Pressable>
        <Pressable style={{ width: `${pct(spend)}%` }} onPress={() => onPress('spend')} accessibilityLabel={`Spend Power ${spend}`}>
          <LinearGradient colors={["#34D399", "#059669"]} style={{ flex: 1 }} />
        </Pressable>
      </View>
      <Text style={{ color: COLORS.textSecondary, fontSize: FONT_SIZES.xs, marginTop: 6 }}>🛡 CRA Reserve ${reserve} · 🔒 Locked ${locked} · 🌿 Spend Power ${spend}</Text>
    </View>
  )
}

export default FlowBar



