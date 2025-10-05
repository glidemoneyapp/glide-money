import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants'

export function FlowBar({ reserve, locked, spend, cushion, onPress }: { reserve: number; locked: number; spend: number; cushion: number; onPress: (seg: 'reserve' | 'locked' | 'spend') => void }) {
  const total = Math.max(1, reserve + locked + spend)
  const pct = (v: number) => (v / total) * 100
  
  return (
    <View style={{ 
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
    }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
        <Text style={{ color: COLORS.text, fontWeight: '600', fontSize: FONT_SIZES.lg }}>This Week's Flow</Text>
        <Text style={{ color: COLORS.textSecondary, fontSize: FONT_SIZES.sm }}>Safety Cushion ${cushion}</Text>
      </View>
      
      {/* Progress bar */}
      <View style={{ 
        flexDirection: 'row', 
        height: 16, 
        borderRadius: 999, 
        overflow: 'hidden', 
        backgroundColor: COLORS.divider,
        marginBottom: SPACING.md
      }}>
        <Pressable 
          style={{ width: `${pct(reserve)}%` }} 
          onPress={() => onPress('reserve')} 
          accessibilityLabel={`CRA Reserve ${reserve}`}
        > 
          <LinearGradient colors={["#3B82F6", "#1D4ED8"]} style={{ flex: 1 }} />
        </Pressable>
        <Pressable 
          style={{ width: `${pct(locked)}%` }} 
          onPress={() => onPress('locked')} 
          accessibilityLabel={`Locked ${locked}`}
        >
          <LinearGradient colors={["#8B5CF6", "#7C3AED"]} style={{ flex: 1 }} />
        </Pressable>
        <Pressable 
          style={{ width: `${pct(spend)}%` }} 
          onPress={() => onPress('spend')} 
          accessibilityLabel={`Spend Power ${spend}`}
        >
          <LinearGradient colors={["#10B981", "#059669"]} style={{ flex: 1 }} />
        </Pressable>
      </View>
      
      {/* Category labels */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, marginRight: 4 }}>🛡️</Text>
          <Text style={{ color: COLORS.text, fontSize: FONT_SIZES.sm, fontWeight: '500' }}>CRA Reserve</Text>
          <Text style={{ color: COLORS.text, fontSize: FONT_SIZES.sm, fontWeight: '600', marginLeft: 4 }}>${reserve}</Text>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, marginRight: 4 }}>🔒</Text>
          <Text style={{ color: COLORS.text, fontSize: FONT_SIZES.sm, fontWeight: '500' }}>Locked</Text>
          <Text style={{ color: COLORS.text, fontSize: FONT_SIZES.sm, fontWeight: '600', marginLeft: 4 }}>${locked}</Text>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, marginRight: 4 }}>🌿</Text>
          <Text style={{ color: COLORS.text, fontSize: FONT_SIZES.sm, fontWeight: '500' }}>Spend Power</Text>
          <Text style={{ color: COLORS.text, fontSize: FONT_SIZES.sm, fontWeight: '600', marginLeft: 4 }}>${spend}</Text>
        </View>
      </View>
    </View>
  )
}

export default FlowBar



