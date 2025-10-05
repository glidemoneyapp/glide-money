/**
 * AddIncomeScreen - Add gig income entries with proper categorization
 * This screen lets users record their actual earnings from gig platforms
 */

import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

// Import constants, types, and services
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, GIG_PLATFORMS } from '../constants'
import { GigPlatform, Transaction } from '../types'
import { saveTransaction } from '../services/firebase'
import { useAuth } from '../contexts/AuthContext'
import { useNavigation } from '@react-navigation/native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const FormSchema = z.object({
  amount: z.coerce.number().positive('Enter a positive amount'),
  description: z.string().min(1, 'Description is required')
})

type FormValues = z.infer<typeof FormSchema>

/**
 * Add income screen component
 */
export default function AddIncomeScreen() {
  const { user } = useAuth()
  const navigation = useNavigation()
  const [selectedPlatform, setSelectedPlatform] = useState<GigPlatform | null>(null)
  const [date, setDate] = useState(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [tempDate, setTempDate] = useState<Date>(new Date())

  const { control, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: { amount: 0, description: '' }
  })

  /**
   * Handle platform selection
   */
  const selectPlatform = (platform: GigPlatform) => {
    setSelectedPlatform(platform)
  }

  /**
   * Handle income submission
   */
  const onSubmit = async (values: FormValues) => {
    if (!user || !selectedPlatform) {
      Alert.alert('Error', 'Please select a platform')
      return
    }

    setIsLoading(true)

    try {
      const transaction: Partial<Transaction> = {
        userId: user.uid,
        bankAccountId: 'manual',
        amount: values.amount,
        description: values.description,
        date: date,
        category: 'income',
        isIncome: true,
        merchant: GIG_PLATFORMS[selectedPlatform].name,
        createdAt: new Date()
      }

      await saveTransaction(transaction)

      Alert.alert(
        'Success!',
        `Income of $${values.amount.toFixed(2)} from ${GIG_PLATFORMS[selectedPlatform].name} has been recorded.`,
        [
          {
            text: 'Add Another',
            onPress: () => {
              reset()
              setSelectedPlatform(null)
            }
          },
          { text: 'Done', onPress: () => navigation.goBack() }
        ]
      )

    } catch (error) {
      console.error('Error saving income:', error)
      Alert.alert('Error', 'Failed to save income. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Format date for display
   */
  const formatDate = (d: Date): string => new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: 'short', day: 'numeric' }).format(d)

  const showDatePickerModal = () => { setTempDate(date); setShowDatePicker(true) }
  const handleDateChange = (_event: any, selectedDate?: Date) => { if (selectedDate) setTempDate(selectedDate) }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header with Back Button */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
              </TouchableOpacity>
              <View style={styles.headerContent}>
                <Text style={styles.title}>Add Income</Text>
                <Text style={styles.subtitle}>Record your gig earnings</Text>
              </View>
            </View>
          </View>

          {/* Platform Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Select Platform</Text>
            <Text style={styles.sectionDescription}>Choose the gig platform you earned from</Text>
            <View style={styles.platformGrid}>
              {Object.entries(GIG_PLATFORMS).map(([code, platform]) => (
                <TouchableOpacity
                  key={code}
                  style={[styles.platformButton, selectedPlatform === code && styles.platformButtonSelected]}
                  onPress={() => selectPlatform(code as GigPlatform)}
                >
                  <Text style={styles.platformIcon}>{platform.icon}</Text>
                  <Text style={[styles.platformButtonText, selectedPlatform === code && styles.platformButtonTextSelected]}>
                    {platform.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Amount Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Enter Amount</Text>
            <Text style={styles.sectionDescription}>How much did you earn? (before any fees)</Text>
            <View style={styles.amountContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <Controller
                control={control}
                name="amount"
                render={({ field: { onChange, value } }) => (
                  <TextInput style={styles.amountInput} placeholder="0.00" value={String(value ?? '')} onChangeText={onChange} keyboardType="decimal-pad" />
                )}
              />
            </View>
            {errors.amount && <Text style={{ color: COLORS.error }}>{errors.amount.message}</Text>}
          </View>

          {/* Description Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Add Description</Text>
            <Text style={styles.sectionDescription}>Brief description of the work (e.g., "Dinner shift", "Airport pickup")</Text>
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value } }) => (
                <TextInput style={styles.descriptionInput} placeholder="Describe the work you did..." value={value} onChangeText={onChange} multiline numberOfLines={3} textAlignVertical="top" />
              )}
            />
            {errors.description && <Text style={{ color: COLORS.error }}>{errors.description.message}</Text>}
          </View>

          {/* Date Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Date Earned</Text>
            <Text style={styles.sectionDescription}>When did you complete this work?</Text>
            <TouchableOpacity style={styles.dateButton} onPress={showDatePickerModal}>
              <Ionicons name="calendar" size={20} color={COLORS.primary} />
              <Text style={styles.dateButtonText}>{formatDate(date)}</Text>
              <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.submitButton, (!selectedPlatform || isLoading) && styles.submitButtonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={!selectedPlatform || isLoading}
              accessibilityRole="button"
              accessibilityLabel="Save income"
            >
              <Ionicons name={isLoading ? 'hourglass' : 'checkmark-circle'} size={24} color={COLORS.surface} />
              <Text style={styles.submitButtonText}>{isLoading ? 'Saving...' : 'Save Income'}</Text>
            </TouchableOpacity>
          </View>

          {/* Info */}
          <View style={styles.section}>
            <Text style={styles.info}>
              💡 **Tip**: Record your income as soon as you complete a shift. This helps GlideMoney provide accurate
              financial forecasts and tax planning.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Picker Modal */}
      <Modal visible={showDatePicker} transparent animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select date</Text>
            <DateTimePicker value={tempDate} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'calendar'} onChange={handleDateChange} maximumDate={new Date()} themeVariant={Platform.OS === 'ios' ? 'light' : undefined} />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.modalCancel]} onPress={() => setShowDatePicker(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalConfirm]} onPress={() => { setDate(tempDate); setShowDatePicker(false) }}>
                <Text style={styles.modalConfirmText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  keyboardView: { flex: 1 },
  scrollView: { flex: 1 },
  header: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xl, alignItems: 'center' },
  headerTop: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  backButton: { padding: SPACING.sm, marginRight: SPACING.sm },
  headerContent: { flex: 1 },
  title: { fontSize: FONT_SIZES.xxl, fontWeight: 'bold', color: COLORS.primary, marginBottom: SPACING.sm },
  subtitle: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, textAlign: 'center' },
  section: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.sm },
  sectionDescription: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginBottom: SPACING.md, lineHeight: 20 },
  platformGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  platformButton: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md, padding: SPACING.md, minWidth: '45%', alignItems: 'center', gap: SPACING.xs },
  platformButtonSelected: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  platformIcon: { fontSize: FONT_SIZES.xl },
  platformButtonText: { fontSize: FONT_SIZES.sm, color: COLORS.text, fontWeight: '500', textAlign: 'center' },
  platformButtonTextSelected: { color: COLORS.surface },
  amountContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 2, borderColor: COLORS.primary, borderRadius: BORDER_RADIUS.lg, paddingHorizontal: SPACING.md },
  currencySymbol: { fontSize: FONT_SIZES.xxl, fontWeight: 'bold', color: COLORS.primary, marginRight: SPACING.sm },
  amountInput: { flex: 1, fontSize: FONT_SIZES.xxl, fontWeight: '600', color: COLORS.text, paddingVertical: SPACING.md, textAlign: 'center' },
  descriptionInput: { backgroundColor: COLORS.surface, borderWidth: 2, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, fontSize: FONT_SIZES.md, color: COLORS.text, minHeight: 80, textAlignVertical: 'top' },
  dateButton: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md, padding: SPACING.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateButtonText: { fontSize: FONT_SIZES.md, color: COLORS.text, fontWeight: '500', flex: 1, marginLeft: SPACING.sm },
  submitButton: { backgroundColor: COLORS.success, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5 },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: COLORS.surface, fontSize: FONT_SIZES.lg, fontWeight: '600' },
  info: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20, fontStyle: 'italic' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  modalCard: { width: '90%', backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 8 },
  modalTitle: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.md },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: SPACING.sm, marginTop: SPACING.md },
  modalButton: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg, borderRadius: BORDER_RADIUS.md, borderWidth: 1 },
  modalCancel: { borderColor: COLORS.border },
  modalConfirm: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
  modalCancelText: { color: COLORS.text },
  modalConfirmText: { color: COLORS.surface, fontWeight: '600' }
})
