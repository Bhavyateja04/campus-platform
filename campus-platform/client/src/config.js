// Single place to configure where the client talks to.
// Change API_BASE_URL based on where you're running the Expo client:
//   - Web (browser):                http://localhost:5000
//   - iOS Simulator:                http://localhost:5000
//   - Android Emulator:             http://10.0.2.2:5000
//   - Physical device on same LAN:  http://<your-mac-LAN-ip>:5000
//
// You can also override via Expo env: set EXPO_PUBLIC_API_BASE_URL when starting expo.
// For the local AI memory moderation service, set EXPO_PUBLIC_AI_SERVICE_BASE_URL.

import { Platform } from "react-native";

const fromEnv =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  (typeof globalThis !== "undefined" && globalThis.__API_BASE_URL__);

const aiFromEnv =
  process.env.EXPO_PUBLIC_AI_SERVICE_BASE_URL ||
  (typeof globalThis !== "undefined" && globalThis.__AI_SERVICE_BASE_URL__);

function inferDefault() {
  if (Platform.OS === "web") return "http://localhost:5000";
  if (Platform.OS === "android") return "http://10.0.2.2:5000";
  return "http://localhost:5000";
}

function inferAiDefault() {
  if (Platform.OS === "web") return "http://localhost:5050";
  if (Platform.OS === "android") return "http://10.0.2.2:5050";
  return "http://localhost:5050";
}

export const API_BASE_URL = fromEnv || inferDefault();
export const AI_SERVICE_BASE_URL = aiFromEnv || inferAiDefault();
