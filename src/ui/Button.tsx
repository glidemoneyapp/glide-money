import React from 'react'
import { Text, TouchableOpacity, ViewStyle } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../constants'

export function PrimaryButton({ title, onPress, gradient = 'sky', style }: { title: string; onPress: () => void; gradient?: 'sky' | 'emerald' | 'indigo'; style?: ViewStyle }) {
  const map = {
    sky: ['#38BDF8', '#0284C7'],
    emerald: ['#34D399', '#059669'],
    indigo: ['#818CF8', '#4F46E5']
  } as const
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={{ borderRadius: BORDER_RADIUS.md, overflow: 'hidden', minHeight: 44 }}>
      <LinearGradient colors={map[gradient]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingVertical: SPACING.md, alignItems: 'center', ...(style || {}) }}>
        <Text style={{ color: 'white', fontWeight: '600', fontSize: FONT_SIZES.md }}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  )
}

export function SecondaryButton({ title, onPress, style }: { title: string; onPress: () => void; style?: ViewStyle }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ minHeight: 44, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md, alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.md, ...(style || {}) }}>
      <Text style={{ color: COLORS.text, fontWeight: '600' }}>{title}</Text>
    </TouchableOpacity>
  )
}



