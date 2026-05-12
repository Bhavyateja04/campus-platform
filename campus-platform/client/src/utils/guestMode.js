// ============================================================================
// Guest Mode Utilities
// ============================================================================
// Manages guest user session and feature access control
// ============================================================================

import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// Constants
// ============================================================================

const GUEST_MODE_KEY = 'guest_mode';

/**
 * Feature access matrix for guest users
 * Guest users can view public content but cannot create/edit
 */
export const GUEST_FEATURE_ACCESS = {
  // Navigation & Maps
  Campus_Map: true,

  // Lost & Found
  Lost_And_Found_View: true,
  Lost_And_Found_CREATE: false,

  // Canteen
  Canteen_Menu: true,

  // Marketplace
  Marketplace_View: true,
  Marketplace_CREATE: false,

  // Placements
  Placements_View: true,
  Placements_SUBMIT: false,

  // Clubs
  Clubs_View: true,
  Clubs_JOIN: false,

  // Memories
  Memories_View: true,
  Memories_CREATE: false,

  // Academic
  Exam_Hall: true,
  Alerts: true,

  // User
  Profile: false,
};

// ============================================================================
// Guest Mode Management
// ============================================================================

/**
 * Checks if the app is currently in guest mode
 * @returns {Promise<boolean>} True if in guest mode, false otherwise
 */
export async function isGuestMode() {
  try {
    const guestMode = await AsyncStorage.getItem(GUEST_MODE_KEY);
    return guestMode === 'true';
  } catch (err) {
    console.error('Error checking guest mode:', err);
    return false;
  }
}

/**
 * Enters guest mode
 * @returns {Promise<void>}
 */
export async function enterGuestMode() {
  try {
    await AsyncStorage.setItem(GUEST_MODE_KEY, 'true');
  } catch (err) {
    console.error('Error entering guest mode:', err);
  }
}

/**
 * Exits guest mode and returns to login screen
 * @returns {Promise<void>}
 */
export async function exitGuestMode() {
  try {
    await AsyncStorage.removeItem(GUEST_MODE_KEY);
  } catch (err) {
    console.error('Error exiting guest mode:', err);
  }
}

// ============================================================================
// Feature Access Control
// ============================================================================

/**
 * Determines if a feature/action is allowed for guest users
 * @param {string} featureName - Feature name to check
 * @returns {boolean} True if feature is allowed, false otherwise
 */
export function isFeatureAllowedForGuest(featureName) {
  return GUEST_FEATURE_ACCESS[featureName] !== false;
}

/**
 * Gets all allowed features for guest users
 * @returns {string[]} Array of allowed feature names
 */
export function getAllowedFeaturesForGuest() {
  return Object.entries(GUEST_FEATURE_ACCESS)
    .filter(([, allowed]) => allowed)
    .map(([feature]) => feature);
}

/**
 * Gets all restricted features for guest users
 * @returns {string[]} Array of restricted feature names
 */
export function getRestrictedFeaturesForGuest() {
  return Object.entries(GUEST_FEATURE_ACCESS)
    .filter(([, allowed]) => !allowed)
    .map(([feature]) => feature);
}

/**
 * Checks if a feature can be created/submitted by guest users
 * (Checks for _CREATE and _SUBMIT suffixes)
 * @param {string} featureName - Feature name to check
 * @returns {boolean} True if feature is creatable/submittable, false otherwise
 */
export function canGuestCreateContent(featureName) {
  const createFeature = `${featureName}_CREATE`;
  const submitFeature = `${featureName}_SUBMIT`;

  return (
    GUEST_FEATURE_ACCESS[createFeature] === true ||
    GUEST_FEATURE_ACCESS[submitFeature] === true
  );
}
