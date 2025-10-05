import React from 'react'
import { Modal, View, Pressable, StyleSheet, Platform } from 'react-native'

type Props = { 
  visible: boolean
  onClose: () => void
  children: React.ReactNode
}

export default function BottomSheet({ visible, onClose, children }: Props) {
  return (
    <Modal 
      visible={visible} 
      onRequestClose={onClose} 
      transparent
      animationType={Platform.select({ ios: "slide", android: "fade" })}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        {children}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: "rgba(0,0,0,0.6)" 
  },
  sheet: { 
    position: "absolute", 
    bottom: 0, 
    left: 0, 
    right: 0, 
    backgroundColor: "#0b0b0b", 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24, 
    padding: 16, 
    maxHeight: "85%" 
  },
  handle: { 
    alignSelf: "center", 
    width: 48, 
    height: 4, 
    borderRadius: 2, 
    backgroundColor: "rgba(255,255,255,0.2)", 
    marginBottom: 12 
  },
})


