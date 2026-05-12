// ============================================================================
// Babel Configuration
// ============================================================================
// Configures Babel for Expo React Native development
// ============================================================================

/**
 * Babel configuration module
 *
 * Presets:
 *   - babel-preset-expo: Official Expo preset with all necessary transforms
 *
 * Plugins:
 *   - react-native-reanimated/plugin: Required for Reanimated 2+ animations
 *
 * Caching:
 *   - api.cache(true): Enables Babel caching for faster builds
 *
 * @param {Object} api - Babel API object
 * @returns {Object} Babel configuration object
 */
module.exports = function (api) {
  // ────────────────────────────────────────────────────────────────────
  // Caching
  // ────────────────────────────────────────────────────────────────────

  /**
   * Enable Babel caching
   * Improves build performance by caching transformation results
   * Set to false if you need to disable caching (e.g., for debugging)
   */
  api.cache(true);

  // ────────────────────────────────────────────────────────────────────
  // Configuration
  // ────────────────────────────────────────────────────────────────────

  return {
    /**
     * Presets: Standard transformation rules
     * - babel-preset-expo: Recommended for all Expo projects
     *   Includes JSX, ES6+, and React Native transforms
     */
    presets: ['babel-preset-expo'],

    /**
     * Plugins: Additional transformation plugins
     * - react-native-reanimated/plugin: Required for smooth 60fps animations
     *   Must be included when using Reanimated 2 or later
     */
    plugins: ['react-native-reanimated/plugin'],
  };
};
