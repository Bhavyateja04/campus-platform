// ============================================================================
// Configuration
// ============================================================================
// Central place to configure where the client talks to the backend
// ============================================================================

import { Platform } from 'react-native';

// ============================================================================
// Environment Variables
// ============================================================================

/**
 * API Base URL from environment or global scope
 * Priority:
 * 1. EXPO_PUBLIC_API_BASE_URL env variable
 * 2. globalThis.__API_BASE_URL__ (injected at runtime)
 * 3. Platform-specific default
 */
const API_URL_FROM_ENV =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  (typeof globalThis !== 'undefined' && globalThis.__API_BASE_URL__);

/**
 * AI Service Base URL from environment or global scope
 * Priority:
 * 1. EXPO_PUBLIC_AI_SERVICE_BASE_URL env variable
 * 2. globalThis.__AI_SERVICE_BASE_URL__ (injected at runtime)
 * 3. Platform-specific default
 */
const AI_SERVICE_URL_FROM_ENV =
  process.env.EXPO_PUBLIC_AI_SERVICE_BASE_URL ||
  (typeof globalThis !== 'undefined' && globalThis.__AI_SERVICE_BASE_URL__);

// ============================================================================
// Platform-Specific Defaults
// ============================================================================

/**
 * Infers the API base URL based on the platform
 * - Web (browser):                http://localhost:5000
 * - iOS Simulator:                http://localhost:5000
 * - Android Emulator:             http://10.0.2.2:5000
 * - Physical device on same LAN:  Use EXPO_PUBLIC_API_BASE_URL
 * @returns {string} Default API base URL
 */
function getDefaultApiUrl() {
  switch (Platform.OS) {
    case 'web':
      return 'http://localhost:5000';
    case 'android':
      return 'http://10.0.2.2:5000';
    case 'ios':
      return 'http://localhost:5000';
    default:
      return 'http://localhost:5000';
  }
}

/**
 * Infers the AI Service base URL based on the platform
 * - Web (browser):                http://localhost:5050
 * - iOS Simulator:                http://localhost:5050
 * - Android Emulator:             http://10.0.2.2:5050
 * - Physical device on same LAN:  Use EXPO_PUBLIC_AI_SERVICE_BASE_URL
 * @returns {string} Default AI service base URL
 */
function getDefaultAiServiceUrl() {
  switch (Platform.OS) {
    case 'web':
      return 'http://localhost:5050';
    case 'android':
      return 'http://10.0.2.2:5050';
    case 'ios':
      return 'http://localhost:5050';
    default:
      return 'http://localhost:5050';
  }
}

// ============================================================================
// Exported Configuration
// ============================================================================

/**
 * Base URL for the backend API
 * Override by setting EXPO_PUBLIC_API_BASE_URL environment variable
 */
export const API_BASE_URL = API_URL_FROM_ENV || getDefaultApiUrl();

/**
 * Base URL for the AI service (content moderation)
 * Override by setting EXPO_PUBLIC_AI_SERVICE_BASE_URL environment variable
 */
export const AI_SERVICE_BASE_URL =
  AI_SERVICE_URL_FROM_ENV || getDefaultAiServiceUrl();

// ============================================================================
// Configuration Info (for debugging)
// ============================================================================

/**
 * Logs current configuration (useful for debugging)
 * Remove or comment out in production
 */
export function logConfig() {
  if (__DEV__) {
    console.log('=== Configuration ===');
    console.log('Platform:', Platform.OS);
    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('AI_SERVICE_BASE_URL:', AI_SERVICE_BASE_URL);
    console.log('====================');
  }
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validates that configuration is set correctly
 * @throws {Error} If required configuration is missing
 */
export function validateConfig() {
  if (!API_BASE_URL) {
    throw new Error('API_BASE_URL is not configured');
  }

  if (!AI_SERVICE_BASE_URL) {
    throw new Error('AI_SERVICE_BASE_URL is not configured');
  }
}
