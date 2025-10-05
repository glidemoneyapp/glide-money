import React from 'react'
import { View, Text } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { COLORS, FONT_SIZES, SPACING } from '../constants'

export function SpendPowerMedallion({ amount, cushion }: { amount: number; cushion: number }) {
  return (
    <View style={{ alignItems: 'center', marginTop: SPACING.md, marginHorizontal: SPACING.lg }} accessible accessibilityLabel={`Spend Power, ${amount}. Money you can use this week after taxes, bills, Card Guard, and cushion.`}>
      {/* Title */}
      <Text style={{ 
        color: COLORS.text, 
        fontSize: FONT_SIZES.lg, 
        fontWeight: '600', 
        marginBottom: SPACING.md 
      }}>
        Your Spend Power
      </Text>
      
      {/* Circular medallion */}
      <LinearGradient 
        colors={["#A7F3D0", "#6EE7B7"]} 
        style={{ 
          width: 160, 
          height: 160, 
          borderRadius: 80, 
          alignItems: 'center', 
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4
        }}
      >
        <View style={{ 
          width: 140, 
          height: 140, 
          borderRadius: 70, 
          backgroundColor: 'white', 
          alignItems: 'center', 
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2
        }}>
          <Text style={{ 
            color: '#047857', 
            fontSize: 42, 
            fontWeight: '700',
            marginBottom: 4
          }}>
            ${amount}
          </Text>
          <Text style={{ 
            color: COLORS.textSecondary, 
            fontSize: FONT_SIZES.sm,
            fontWeight: '500'
          }}>
            ✨ Free to use this week
          </Text>
        </View>
      </LinearGradient>
      
      {/* Description */}
      <Text style={{ 
        color: COLORS.textSecondary, 
        fontSize: FONT_SIZES.sm, 
        marginTop: SPACING.md,
        textAlign: 'center',
        lineHeight: 20
      }}>
        After CRA Reserve, Locked items, and your ${cushion} Safety Cushion.
      </Text>
    </View>
  )
}

export default SpendPowerMedallion



