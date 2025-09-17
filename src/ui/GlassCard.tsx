import React from 'react'
import { View, ViewStyle } from 'react-native'
import { COLORS, SPACING, BORDER_RADIUS } from '../constants'

export function GlassCard({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return (
    <View
      style={{
        backgroundColor: 'rgba(255,255,255,0.78)',
        borderRadius: 24,
        padding: SPACING.lg,
        marginHorizontal: SPACING.lg,
        marginTop: SPACING.lg,
        borderWidth: 1,
        borderColor: 'rgba(15,23,42,0.08)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 6,
        ...(style || {})
      }}
    >
      {children}
    </View>
  )
}

export default GlassCard



