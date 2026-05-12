// ============================================================================
// App.js
// ============================================================================
// Main application entry point and navigation setup
// ============================================================================

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// Feature Screens
// ============================================================================

import HomeScreen from './src/screens/HomeScreen';
import LostAndFoundScreen from './src/screens/LostandFound';
import CampusMemoriesScreen from './src/screens/CampusMemories';
import Clubs from './src/screens/Clubs';
import AlertsScreen from './src/screens/AlertsScreen';
import AboutScreen from './src/screens/AboutScreen';
import ProfileScreen from './src/screens/Profilescreen';
import PlacementsScreen from './src/screens/Placements';
import MarketplaceScreen from './src/screens/MarketplaceScreen';
import CanteenMenuScreen from './src/screens/CanteenMenuScreen';
import CampusMapScreen from './src/screens/CampusMapScreen';
import ExamHallScreen from './src/screens/ExamHallScreen';
import FindLocationScreen from './src/screens/FindLocationScreen';

// ============================================================================
// Authentication Screens
// ============================================================================

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ResetPassword, {
  ForgotPasswordScreen,
  ForceResetScreen,
} from './src/screens/ResetPassword';

// ============================================================================
// Navigation Setup
// ============================================================================

const Stack = createNativeStackNavigator();

// ============================================================================
// App Component
// ============================================================================

/**
 * Main App component
 * Initializes navigation and handles guest mode detection
 *
 * Features:
 * - Async guest mode detection from AsyncStorage
 * - Conditional initial route based on guest mode
 * - Native stack navigation with all screens
 * - Error handling for storage operations
 *
 * @returns {JSX.Element} Navigation container with stack navigator
 */
export default function App() {
  // ──────────────────────────────────────────────────────────────────────
  // State Management
  // ──────────────────────────────────────────────────────────────────────

  /**
   * Guest mode flag
   * Determines if the app starts in guest mode or login mode
   */
  const [guestMode, setGuestMode] = useState(false);

  /**
   * Loading state
   * Prevents rendering until guest mode is determined
   */
  const [loading, setLoading] = useState(true);

  // ──────────────────────────────────────────────────────────────────────
  // Lifecycle Hooks
  // ──────────────────────────────────────────────────────────────────────

  /**
   * Checks guest mode status on app initialization
   * Runs once on component mount
   */
  useEffect(() => {
    const checkGuestMode = async () => {
      try {
        const guest = await AsyncStorage.getItem('guest_mode');
        setGuestMode(guest === 'true');
      } catch (err) {
        console.error('Error checking guest mode:', err);
        // Fail gracefully: default to logged-in mode
        setGuestMode(false);
      } finally {
        setLoading(false);
      }
    };

    checkGuestMode();
  }, []);

  // ──────────────────────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────────────────────

  /**
   * Don't render navigation until guest mode is determined
   * Prevents flash of wrong initial screen
   */
  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={guestMode ? 'GuestHome' : 'Home'}
        screenOptions={{ headerShown: false }}
      >
        {/* ───────────────────────────────────────────────────────────── */
        {/* Authentication Screens */
        {/* ───────────────────────────────────────────────────────────── */}

        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
        />
        <Stack.Screen name="ForceReset" component={ForceResetScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPassword} />

        {/* ───────────────────────────────────────────────────────────── */
        {/* Core Navigation */
        {/* ───────────────────────────────────────────────────────────── */}

        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="GuestHome"
          component={HomeScreen}
          options={{
            unmountOnBlur: true,
          }}
        />

        {/* ───────────────────────────────────────────────────────────── */
        {/* User & Profile Screens */
        {/* ───────────────────────────────────────────────────────────── */}

        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Alerts" component={AlertsScreen} />
        <Stack.Screen name="About" component={AboutScreen} />

        {/* ───────────────────────────────────────────────────────────── */
        {/* Campus Features */
        {/* ───────────────────────────────────────────────────────────── */}

        <Stack.Screen name="CampusMap" component={CampusMapScreen} />
        <Stack.Screen name="ExamHall" component={ExamHallScreen} />
        <Stack.Screen
          name="FindLocationScreen"
          component={FindLocationScreen}
        />

        {/* ───────────────────────────────────────────────────────────── */
        {/* Campus Community */
        {/* ───────────────────────────────────────────────────────────── */}

        <Stack.Screen name="Clubs" component={Clubs} />
        <Stack.Screen name="CampusMemories" component={CampusMemoriesScreen} />

        {/* ───────────────────────────────────────────────────────────── */
        {/* Marketplace & Services */
        {/* ───────────────────────────────────────────────────────────── */}

        <Stack.Screen name="LostAndFound" component={LostAndFoundScreen} />
        <Stack.Screen name="Marketplace" component={MarketplaceScreen} />
        <Stack.Screen name="CanteenMenu" component={CanteenMenuScreen} />

        {/* ───────────────────────────────────────────────────────────── */
        {/* Career & Academics */
        {/* ───────────────────────────────────────────────────────────── */}

        <Stack.Screen name="Placements" component={PlacementsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
