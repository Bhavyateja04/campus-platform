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

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const LANDMARKS = [
  { name: "Admin Block",     note: "Admissions, records, support" },
  { name: "Library",         note: "Study halls, journals, computers" },
  { name: "Satya Canteen",   note: "Main food court near the courtyard" },
  { name: "Innovation Lab",  note: "Project demos and maker space" },
  { name: "Sports Ground",   note: "Outdoor practice and events" },
];

// ─────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────

const Header = ({ onBack }) => (
  <LinearGradient colors={["#2E4D7A", "#4A6FA5"]} style={styles.header}>
    <TouchableOpacity style={styles.backBtn} onPress={onBack}>
      <Ionicons name="chevron-back" size={22} color="#fff" />
    </TouchableOpacity>
    <View>
      <Text style={styles.title}>Campus Map</Text>
      <Text style={styles.subtitle}>Quick navigation to key places on campus</Text>
    </View>
  </LinearGradient>
);

const MapInfoCard = () => (
  <View style={styles.mapCard}>
    <View style={styles.mapBadge}>
      <Ionicons name="location" size={18} color="#fff" />
    </View>
    <Text style={styles.mapHeadline}>Explore Aditya University</Text>
    <Text style={styles.mapText}>
      This is a lightweight in-app campus guide. It works even if the API is
      offline.
    </Text>
  </View>
);

const LandmarkCard = ({ name, note }) => (
  <View style={styles.landmarkCard}>
    <Ionicons name="ellipse" size={10} color="#4A6FA5" />
    <View style={styles.landmarkContent}>
      <Text style={styles.landmarkName}>{name}</Text>
      <Text style={styles.landmarkNote}>{note}</Text>
    </View>
  </View>
);

// ─────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────

export default function CampusMapScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.root} edges={["left", "right", "bottom"]}>
      <StatusBar barStyle="light-content" />

      <Header onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <MapInfoCard />

        <Text style={styles.sectionTitle}>Key Landmarks</Text>

        {LANDMARKS.map((item) => (
          <LandmarkCard key={item.name} name={item.name} note={item.note} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  // Layout
  root: {
    flex: 1,
    backgroundColor: "#F5F8FC",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
  },
  subtitle: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 12,
    marginTop: 3,
  },

  // Body
  body: {
    padding: 16,
    paddingBottom: 36,
    gap: 12,
  },

  // Map Info Card
  mapCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#D6E4F0",
  },
  mapBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#4A6FA5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  mapHeadline: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0D1B2A",
    marginBottom: 8,
  },
  mapText: {
    color: "#3D5068",
    lineHeight: 20,
  },

  // Section Title
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0D1B2A",
    marginTop: 8,
    marginBottom: 2,
  },

  // Landmark Card
  landmarkCard: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#D6E4F0",
  },
  landmarkContent: {
    flex: 1,
  },
  landmarkName: {
    color: "#0D1B2A",
    fontWeight: "800",
    fontSize: 14,
  },
  landmarkNote: {
    color: "#3D5068",
    fontSize: 12,
    marginTop: 2,
    lineHeight: 18,
  },
});
