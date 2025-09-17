import React from 'react'
import { View, Text } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { COLORS, FONT_SIZES } from '../constants'

export function SpendPowerMedallion({ amount, cushion }: { amount: number; cushion: number }) {
  return (
    <View style={{ alignItems: 'center', marginTop: 16 }} accessible accessibilityLabel={`Spend Power, ${amount}. Money you can use this week after taxes, bills, Card Guard, and cushion.`}>
      <LinearGradient colors={["#A7F3D0", "#6EE7B7"]} style={{ width: 144, height: 144, borderRadius: 72, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#047857', fontSize: 36, fontWeight: '700' }}>${amount}</Text>
          <Text style={{ color: COLORS.textSecondary, marginTop: 2 }}>Free to use this week</Text>
        </View>
      </LinearGradient>
      <Text style={{ color: COLORS.textSecondary, fontSize: FONT_SIZES.xs, marginTop: 8 }}>After CRA Reserve, Locked, and your ${cushion} Safety Cushion.</Text>
    </View>
  )
}

export default SpendPowerMedallion



