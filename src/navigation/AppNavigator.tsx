/**
 * Main navigation structure for the GlideMoney app
 * Uses React Navigation with bottom tabs for main sections
 */

import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator } from '@react-navigation/stack'
import { Ionicons } from '@expo/vector-icons'

// Import screens
import LoginScreen from '../screens/LoginScreen'
import OnboardingScreen from '../screens/OnboardingScreen'
import HomeScreen from '../screens/HomeScreen'
import IncomeStreamsScreen from '../screens/IncomeStreamsScreen'
import AddIncomeScreen from '../screens/AddIncomeScreen'
import SetAsidePlannerScreen from '../screens/SetAsidePlannerScreen'
import BillsScreen from '../screens/BillsScreen'
import TransactionsScreen from '../screens/TransactionsScreen'
import ExportScreen from '../screens/ExportScreen'
import SettingsScreen from '../screens/SettingsScreen'
import LearnScreen from '../screens/LearnScreen'
import BankConnectionScreen from '../screens/BankConnectionScreen'
import SetAsideScreen from '../screens/SetAsideScreen'
import GlideGuardScreen from '../screens/GlideGuardScreen'

// Import types and auth context
import { RootStackParamList } from '../types'
import { useAuth } from '../contexts/AuthContext'

// Create navigators
const Tab = createBottomTabNavigator()
const Stack = createStackNavigator<any>()

/**
 * Bottom tab navigator for main app sections
 */
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap

          // Set icon based on route name
          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline'
              break
            case 'Income':
              iconName = focused ? 'trending-up' : 'trending-up-outline'
              break
            case 'SetAside':
              iconName = focused ? 'calculator' : 'calculator-outline'
              break
            case 'Bills':
              iconName = focused ? 'receipt' : 'receipt-outline'
              break
            case 'Transactions':
              iconName = focused ? 'list' : 'list-outline'
              break
            case 'Export':
              iconName = focused ? 'download' : 'download-outline'
              break
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline'
              break
            case 'Learn':
              iconName = focused ? 'school' : 'school-outline'
              break
            default:
              iconName = 'help-outline'
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60
        },
        headerShown: false
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="Income" 
        component={IncomeStackNavigator}
        options={{ tabBarLabel: 'Income' }}
      />
      <Tab.Screen 
        name="SetAside" 
        component={SetAsideScreen}
        options={{ tabBarLabel: 'Set Aside' }}
      />
      <Tab.Screen 
        name="Bills" 
        component={BillsScreen}
        options={{ tabBarLabel: 'Bills' }}
      />
      <Tab.Screen 
        name="Transactions" 
        component={TransactionsScreen}
        options={{ tabBarLabel: 'Transactions' }}
      />
      <Tab.Screen 
        name="Export" 
        component={ExportScreen}
        options={{ tabBarLabel: 'Export' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ tabBarLabel: 'Settings' }}
      />
      <Tab.Screen 
        name="GlideGuard" 
        component={GlideGuardScreen}
        options={{ tabBarLabel: 'Glide Guard' }}
      />
      <Tab.Screen 
        name="Learn" 
        component={LearnScreen}
        options={{ tabBarLabel: 'Learn' }}
      />
    </Tab.Navigator>
  )
}

/**
 * Income stack navigator for income-related screens
 */
function IncomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="IncomeStreams" component={IncomeStreamsScreen} />
      <Stack.Screen name="AddIncome" component={AddIncomeScreen} />
      <Stack.Screen name="BankConnection" component={BankConnectionScreen} />
    </Stack.Navigator>
  )
}

/**
 * Main app navigator that handles authentication flow
 */
export default function AppNavigator() {
  const { isAuthenticated, isLoading, userProfile } = useAuth()

  // Show loading screen while checking authentication
  if (isLoading) {
    return null // You can add a proper loading screen here
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          // User is authenticated, check if they need onboarding
          userProfile ? (
            // User has completed onboarding, show main app
            <Stack.Screen name="Main" component={TabNavigator} />
          ) : (
            // User needs to complete onboarding
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          )
        ) : (
          // User is not authenticated, show login
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
