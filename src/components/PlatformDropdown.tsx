/**
 * PlatformDropdown - Beautiful dropdown for platform selection
 * Matches the professional chart design aesthetic
 */

import React, { useState, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Animated } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

// Import constants and types
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants'
import { GIG_PLATFORMS } from '../constants'

interface PlatformDropdownProps {
  selectedPlatform: string
  onPlatformChange: (platform: string) => void
}

/**
 * Platform dropdown component
 */
export default function PlatformDropdown({ selectedPlatform, onPlatformChange }: PlatformDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPlatformName, setSelectedPlatformName] = useState(
    selectedPlatform === 'all' ? 'All Platforms' : 
    Object.values(GIG_PLATFORMS).find(p => p.name === selectedPlatform)?.name || 'All Platforms'
  )

  const handlePlatformSelect = (platform: string, displayName: string) => {
    setSelectedPlatformName(displayName)
    onPlatformChange(platform)
    setIsOpen(false)
  }

  const getPlatformIcon = (platformName: string) => {
    if (platformName === 'all') return '🏢'
    return Object.values(GIG_PLATFORMS).find(p => p.name === platformName)?.icon || '🏢'
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.dropdownButton} 
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.7}
      >
        <View style={styles.buttonContent}>
          <Text style={styles.platformIcon}>{getPlatformIcon(selectedPlatform)}</Text>
          <Text style={styles.buttonText}>{selectedPlatformName}</Text>
        </View>
        <Ionicons 
          name={isOpen ? 'chevron-up' : 'chevron-down'} 
          size={20} 
          color={COLORS.textSecondary} 
        />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.dropdownMenu}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* All Platforms Option */}
              <TouchableOpacity
                style={[
                  styles.dropdownItem,
                  selectedPlatform === 'all' && styles.dropdownItemSelected
                ]}
                onPress={() => handlePlatformSelect('all', 'All Platforms')}
              >
                <Text style={styles.dropdownItemIcon}>🏢</Text>
                <Text style={[
                  styles.dropdownItemText,
                  selectedPlatform === 'all' && styles.dropdownItemTextSelected
                ]}>
                  All Platforms
                </Text>
                {selectedPlatform === 'all' && (
                  <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                )}
              </TouchableOpacity>

              {/* Individual Platform Options */}
              {Object.values(GIG_PLATFORMS).map((platform) => (
                <TouchableOpacity
                  key={platform.name}
                  style={[
                    styles.dropdownItem,
                    selectedPlatform === platform.name && styles.dropdownItemSelected
                  ]}
                  onPress={() => handlePlatformSelect(platform.name, platform.name)}
                >
                  <Text style={styles.dropdownItemIcon}>{platform.icon}</Text>
                  <Text style={[
                    styles.dropdownItemText,
                    selectedPlatform === platform.name && styles.dropdownItemTextSelected
                  ]}>
                    {platform.name}
                  </Text>
                  {selectedPlatform === platform.name && (
                    <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

// Styles
const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000
  },
  
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 160
  },
  
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  
  platformIcon: {
    fontSize: FONT_SIZES.md,
    marginRight: SPACING.sm
  },
  
  buttonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
    flex: 1
  },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 100
  },
  
  dropdownMenu: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.sm,
    minWidth: 200,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5
  },
  
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider
  },
  
  dropdownItemSelected: {
    backgroundColor: COLORS.primary + '10'
  },
  
  dropdownItemIcon: {
    fontSize: FONT_SIZES.md,
    marginRight: SPACING.sm,
    width: 24,
    textAlign: 'center'
  },
  
  dropdownItemText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
    flex: 1
  },
  
  dropdownItemTextSelected: {
    color: COLORS.primary,
    fontWeight: '600'
  }
})
