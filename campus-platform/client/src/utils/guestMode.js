import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Check if the app is in guest mode
 */
export async function isGuestMode() {
  try {
    const guestMode = await AsyncStorage.getItem("guest_mode");
    return guestMode === "true";
  } catch (err) {
    console.error("Error checking guest mode:", err);
    return false;
  }
}

/**
 * Exit guest mode and return to login
 */
export async function exitGuestMode() {
  try {
    await AsyncStorage.removeItem("guest_mode");
  } catch (err) {
    console.error("Error exiting guest mode:", err);
  }
}

/**
 * Check if a specific feature is available in guest mode
 * Guest users can view public content but cannot create/edit
 */
export const GUEST_FEATURE_ACCESS = {
  Campus_Map: true,
  Lost_And_Found_View: true,
  Lost_And_Found_CREATE: false,
  Canteen_Menu: true,
  Marketplace_View: true,
  Marketplace_CREATE: false,
  Placements_View: true,
  Placements_SUBMIT: false,
  Clubs_View: true,
  Clubs_JOIN: false,
  Memories_View: true,
  Memories_CREATE: false,
  Exam_Hall: true,
  Alerts: true,
  Profile: false,
};

/**
 * Determine if a feature/action is allowed for guest users
 */
export function isFeatureAllowedForGuest(featureName) {
  return GUEST_FEATURE_ACCESS[featureName] !== false;
}
