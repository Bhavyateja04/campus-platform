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

const LANDMARKS = [
  { name: "Admin Block", note: "Admissions, records, support" },
  { name: "Library", note: "Study halls, journals, computers" },
  { name: "Satya Canteen", note: "Main food court near the courtyard" },
  { name: "Innovation Lab", note: "Project demos and maker space" },
  { name: "Sports Ground", note: "Outdoor practice and events" },
];

export default function CampusMapScreen({ navigation }) {
  return (
    <SafeAreaView style={S.root} edges={["left", "right", "bottom"]}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#2E4D7A", "#4A6FA5"]} style={S.header}>
        <TouchableOpacity style={S.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={S.title}>Campus Map</Text>
          <Text style={S.sub}>Quick navigation to key places on campus</Text>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={S.body}
        showsVerticalScrollIndicator={false}
      >
        <View style={S.mapCard}>
          <View style={S.mapBadge}>
            <Ionicons name="location" size={18} color="#fff" />
          </View>
          <Text style={S.mapHeadline}>Explore Aditya University</Text>
          <Text style={S.mapText}>
            This is a lightweight in-app campus guide. It is not backend data,
            so it works even if the API is offline.
          </Text>
        </View>

        <Text style={S.sectionTitle}>Key landmarks</Text>
        {LANDMARKS.map((item) => (
          <View key={item.name} style={S.landmarkCard}>
            <Ionicons name="ellipse" size={10} color="#4A6FA5" />
            <View style={{ flex: 1 }}>
              <Text style={S.landmarkName}>{item.name}</Text>
              <Text style={S.landmarkNote}>{item.note}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F5F8FC" },
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
  title: { color: "#fff", fontSize: 22, fontWeight: "900" },
  sub: { color: "rgba(255,255,255,0.78)", fontSize: 12, marginTop: 3 },
  body: { padding: 16, paddingBottom: 36, gap: 12 },
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
  mapText: { color: "#3D5068", lineHeight: 20 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0D1B2A",
    marginTop: 8,
    marginBottom: 2,
  },
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
  landmarkName: { color: "#0D1B2A", fontWeight: "800", fontSize: 14 },
  landmarkNote: {
    color: "#3D5068",
    fontSize: 12,
    marginTop: 2,
    lineHeight: 18,
  },
});
