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

const HALLS = [
  { hall: "Hall A", note: "CSE - 3rd year", time: "9:30 AM" },
  { hall: "Hall B", note: "ECE - 2nd year", time: "9:30 AM" },
  { hall: "Hall C", note: "MECH - 1st year", time: "2:00 PM" },
];

export default function ExamHallScreen({ navigation }) {
  return (
    <SafeAreaView style={S.root} edges={["left", "right", "bottom"]}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#1B5E20", "#2E7D32"]} style={S.header}>
        <TouchableOpacity style={S.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={S.title}>Exam Hall</Text>
          <Text style={S.sub}>Quick hall lookup and exam timing overview</Text>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={S.body}
        showsVerticalScrollIndicator={false}
      >
        <View style={S.heroCard}>
          <Ionicons name="navigate-circle-outline" size={28} color="#2E7D32" />
          <Text style={S.heroTitle}>Find your hall faster</Text>
          <Text style={S.heroText}>
            This page is local frontend content, not a backend feed. It is safe
            to open even when the API is down.
          </Text>
        </View>

        <Text style={S.sectionTitle}>Today’s hall list</Text>
        {HALLS.map((item) => (
          <View key={item.hall} style={S.hallCard}>
            <View style={S.hallDot} />
            <View style={{ flex: 1 }}>
              <Text style={S.hallName}>{item.hall}</Text>
              <Text style={S.hallNote}>{item.note}</Text>
            </View>
            <Text style={S.hallTime}>{item.time}</Text>
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
  heroCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#D6E4F0",
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0D1B2A",
    marginTop: 10,
    marginBottom: 6,
  },
  heroText: { color: "#3D5068", lineHeight: 20 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0D1B2A",
    marginTop: 8,
    marginBottom: 2,
  },
  hallCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#D6E4F0",
  },
  hallDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2E7D32",
  },
  hallName: { color: "#0D1B2A", fontWeight: "800", fontSize: 14 },
  hallNote: { color: "#3D5068", fontSize: 12, marginTop: 2 },
  hallTime: { color: "#2E7D32", fontWeight: "800", fontSize: 12 },
});
