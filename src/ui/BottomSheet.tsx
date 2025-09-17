import React from 'react'
import { Modal, View, Text, TouchableOpacity } from 'react-native'
import { COLORS, SPACING, FONT_SIZES } from '../constants'

export default function BottomSheet({ visible, title, onClose, children }: BottomSheetProps) {
  if (!visible) return null

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.25)' }}>
        <View style={{ backgroundColor: COLORS.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: SPACING.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm }}>
            <Text style={{ color: COLORS.text, fontSize: FONT_SIZES.lg, fontWeight: '600' }}>{title}</Text>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Close" onPress={onClose}>
              <Text style={{ color: COLORS.primary, fontSize: FONT_SIZES.md }}>Close</Text>
            </TouchableOpacity>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  )
}

interface BottomSheetProps {
  visible: boolean
  title: string
  onClose: () => void
  children?: React.ReactNode
}


