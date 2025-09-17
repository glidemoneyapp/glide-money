/**
 * SettingsScreen - User preferences and data controls
 * This screen lets users manage their settings and sign out
 */

import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
  ScrollView
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

// Import constants and services
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants'
import { signOutUser } from '../services/firebase'
import { useAuth } from '../contexts/AuthContext'

/**
 * Settings screen component
 */
export default function SettingsScreen() {
  const { user, userProfile } = useAuth()

  /**
   * Handle sign out
   */
  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOutUser()
            } catch (error) {
              console.error('Error signing out:', error)
              Alert.alert('Error', 'Failed to sign out. Please try again.')
            }
          }
        }
      ]
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Manage your account and preferences</Text>
        </View>

        {/* User Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="mail" size={20} color={COLORS.textSecondary} />
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>
          
          {userProfile && (
            <>
              <View style={styles.infoRow}>
                <Ionicons name="location" size={20} color={COLORS.textSecondary} />
                <Text style={styles.infoLabel}>Province</Text>
                <Text style={styles.infoValue}>{userProfile.province}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="card" size={20} color={COLORS.textSecondary} />
                <Text style={styles.infoLabel}>HST Registered</Text>
                <Text style={styles.infoValue}>
                  {userProfile.hstRegistered ? 'Yes' : 'No'}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          
          <TouchableOpacity style={styles.settingRow}>
            <Ionicons name="notifications" size={20} color={COLORS.textSecondary} />
            <Text style={styles.settingLabel}>Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingRow}>
            <Ionicons name="shield-checkmark" size={20} color={COLORS.textSecondary} />
            <Text style={styles.settingLabel}>Privacy & Security</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingRow}>
            <Ionicons name="help-circle" size={20} color={COLORS.textSecondary} />
            <Text style={styles.settingLabel}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Data Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Controls</Text>
          
          <TouchableOpacity style={styles.settingRow}>
            <Ionicons name="download" size={20} color={COLORS.textSecondary} />
            <Text style={styles.settingLabel}>Export My Data</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingRow}>
            <Ionicons name="trash" size={20} color={COLORS.textSecondary} />
            <Text style={styles.settingLabel}>Delete My Data</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Ionicons name="log-out" size={20} color={COLORS.surface} />
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="information-circle" size={20} color={COLORS.textSecondary} />
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  
  scrollView: {
    flex: 1
  },
  
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    alignItems: 'center'
  },
  
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm
  },
  
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center'
  },
  
  section: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider
  },
  
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md
  },
  
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    gap: SPACING.sm
  },
  
  infoLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    flex: 1
  },
  
  infoValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500'
  },
  
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.sm
  },
  
  settingLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    flex: 1
  },
  
  signOutButton: {
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm
  },
  
  signOutButtonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.md,
    fontWeight: '600'
  }
})
