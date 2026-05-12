import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ============================================================================
// Vite Configuration
// Reference: https://vitejs.dev/config/
// ============================================================================

export default defineConfig({
  plugins: [react()],

  // Server configuration
  server: {
    port: 5173,
    strictPort: false,
    open: true,
  },

  // Build configuration
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: false,
  },
});
