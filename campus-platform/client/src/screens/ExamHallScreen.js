/**
 * ExamHallScreen.jsx
 *
 * Displays a static list of today's exam halls with their assigned
 * department, year, and timing. This screen is entirely local —
 * it renders correctly even when the backend is unavailable.
 */

import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const COLORS = {
  primary:     "#2E7D32",
  primaryDark: "#1B5E20",
  bg:          "#F5F8FC",
  surface:     "#FFFFFF",
  border:      "#D6E4F0",
  textDark:    "#0D1B2A",
  textMid:     "#3D5068",
  textOnPrimary:      "#FFFFFF",
  textOnPrimaryFaint: "rgba(255,255,255,0.78)",
};

// ─── DATA ─────────────────────────────────────────────────────────────────────

/**
 * Static exam hall schedule for the current day.
 * Replace with an API call when a backend feed becomes available.
 *
 * @type {{ hall: string, note: string, time: string }[]}
 */
const EXAM_HALLS = [
  { hall: "Hall A", note: "CSE - 3rd year", time: "9:30 AM" },
  { hall: "Hall B", note: "ECE - 2nd year", time: "9:30 AM" },
  { hall: "Hall C", note: "MECH - 1st year", time: "2:00 PM" },
];

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

/**
 * Informational hero card shown at the top of the screen.
 */
const HeroCard = () => (
  <View style={styles.heroCard}>
    <Ionicons name="navigate-circle-outline" size={28} color={COLORS.primary} />
    <Text style={styles.heroTitle}>Find your hall faster</Text>
    <Text style={styles.heroText}>
      This page shows local frontend content and is safe to open even when the
      API is unavailable.
    </Text>
  </View>
);

/**
 * A single row displaying one exam hall's details.
 *
 * @param {{ hall: string, note: string, time: string }} props
 */
const HallCard = ({ hall, note, time }) => (
  <View style={styles.hallCard}>
    <View style={styles.hallDot} />
    <View style={{ flex: 1 }}>
      <Text style={styles.hallName}>{hall}</Text>
      <Text style={styles.hallNote}>{note}</Text>
    </View>
    <Text style={styles.hallTime}>{time}</Text>
  </View>
);

// ─── SCREEN ───────────────────────────────────────────────────────────────────

/**
 * ExamHallScreen
 *
 * @param {object} navigation - React Navigation prop used for goBack().
 */
export default function ExamHallScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.root} edges={["left", "right", "bottom"]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={[COLORS.primaryDark, COLORS.primary]} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={COLORS.textOnPrimary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Exam Hall</Text>
          <Text style={styles.headerSubtitle}>Quick hall lookup and exam timing overview</Text>
        </View>
      </LinearGradient>

      {/* Body */}
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <HeroCard />

        <Text style={styles.sectionTitle}>Today's hall list</Text>

        {EXAM_HALLS.map((item) => (
          <HallCard key={item.hall} {...item} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle:    { color: COLORS.textOnPrimary, fontSize: 22, fontWeight: "900" },
  headerSubtitle: { color: COLORS.textOnPrimaryFaint, fontSize: 12, marginTop: 3 },

  // Body
  body: { padding: 16, paddingBottom: 36, gap: 12 },

  // Hero card
  heroCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textDark,
    marginTop: 10,
    marginBottom: 6,
  },
  heroText: { color: COLORS.textMid, lineHeight: 20 },

  // Section heading
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textDark,
    marginTop: 8,
    marginBottom: 2,
  },

  // Hall card
  hallCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  hallDot:  { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  hallName: { color: COLORS.textDark, fontWeight: "800", fontSize: 14 },
  hallNote: { color: COLORS.textMid, fontSize: 12, marginTop: 2 },
  hallTime: { color: COLORS.primary, fontWeight: "800", fontSize: 12 },
});
