import React, { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { AllPlaces } from "../../src/data/places";

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const API_BASE_URL = "http://YOUR_IP:5000";
const ALPHANUMERIC_REGEX = /[^a-zA-Z0-9]/g;

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function normalizeString(str) {
  return str.replace(/\s+/g, "").toLowerCase();
}

function findMatchingPlace(buildingName) {
  const normalized = normalizeString(buildingName);
  return AllPlaces.find((place) =>
    normalizeString(place.name).includes(normalized)
  ) ?? null;
}

async function fetchExamData({ rollNo, buildingName }) {
  const response = await axios.get(`${API_BASE_URL}/exam-search`, {
    params: { rollNo, buildingName },
  });
  return response.data;
}

// ─────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────

function OrDivider() {
  return (
    <View style={styles.orDivider}>
      <View style={styles.dividerLine} />
      <Text style={styles.orText}>OR</Text>
      <View style={styles.dividerLine} />
    </View>
  );
}

function SearchCard({ rollNo, buildingInput, onRollChange, onBuildingChange, onSearch, onClear }) {
  return (
    <View style={styles.searchCard}>
      <Text style={styles.inputLabel}>Roll Number</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Roll Number"
        value={rollNo}
        onChangeText={onRollChange}
        autoCapitalize="characters"
      />

      <OrDivider />

      <Text style={styles.inputLabel}>Building Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Building Name"
        value={buildingInput}
        onChangeText={onBuildingChange}
      />

      <View style={styles.buttonRow}>
        <Pressable style={styles.searchButton} onPress={onSearch}>
          <Text style={styles.buttonText}>Search</Text>
        </Pressable>
        <Pressable style={styles.clearButton} onPress={onClear}>
          <Text style={styles.buttonText}>Clear</Text>
        </Pressable>
      </View>
    </View>
  );
}

function BuildingCard({ building, onPress }) {
  if (!building) return null;
  return (
    <Pressable style={styles.buildingCard} onPress={onPress}>
      <Image source={building.placeImage} style={styles.buildingImage} />
      <Text style={styles.buildingName}>{building.name}</Text>
    </Pressable>
  );
}

function ResultsTable({ students }) {
  if (students.length === 0) return null;
  return (
    <View style={styles.table}>
      <View style={styles.tableHeaderRow}>
        {["Name", "Roll", "Room", "Building"].map((heading) => (
          <Text key={heading} style={styles.tableHeaderCell}>
            {heading}
          </Text>
        ))}
      </View>
      {students.map((student) => (
        <View key={student._id} style={styles.tableRow}>
          <Text style={styles.tableCell}>{student.name}</Text>
          <Text style={styles.tableCell}>{student.rollNo}</Text>
          <Text style={styles.tableCell}>{student.roomNo}</Text>
          <Text style={styles.tableCell}>{student.buildingName}</Text>
        </View>
      ))}
    </View>
  );
}

function NotFoundMessage() {
  return (
    <View style={styles.notFoundBox}>
      <Text style={styles.notFoundTitle}>No Results Found</Text>
      <Text style={styles.notFoundSubtitle}>
        Please check Roll Number or Building Name
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────

export default function ExamHallScreen() {
  const navigation = useNavigation();

  const [rollNo, setRollNo] = useState("");
  const [buildingInput, setBuildingInput] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [notFound, setNotFound] = useState(false);

  function handleRollChange(text) {
    setRollNo(text.replace(ALPHANUMERIC_REGEX, ""));
    setBuildingInput("");
  }

  function handleBuildingChange(text) {
    setBuildingInput(text);
    setRollNo("");
  }

  function handleClear() {
    setRollNo("");
    setBuildingInput("");
    setStudents([]);
    setSelectedBuilding(null);
    setNotFound(false);
  }

  async function handleSearch() {
    if (!rollNo && !buildingInput) {
      Alert.alert("Enter Roll Number or Building Name");
      return;
    }

    try {
      const data = await fetchExamData({ rollNo, buildingName: buildingInput });
      setStudents(data);

      if (data.length === 0) {
        setNotFound(true);
        setSelectedBuilding(null);
      } else {
        setNotFound(false);
        setSelectedBuilding(findMatchingPlace(data[0].buildingName));
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Server error. Please try again.");
    }
  }

  function handleBuildingCardPress() {
    navigation.navigate("Map", { place: selectedBuilding });
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Exam Center Locator</Text>

      <SearchCard
        rollNo={rollNo}
        buildingInput={buildingInput}
        onRollChange={handleRollChange}
        onBuildingChange={handleBuildingChange}
        onSearch={handleSearch}
        onClear={handleClear}
      />

      <BuildingCard
        building={selectedBuilding}
        onPress={handleBuildingCardPress}
      />

      <ResultsTable students={students} />

      {notFound && <NotFoundMessage />}
    </ScrollView>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────

const COLOR = {
  green: "#2d8a4e",
  red: "#e74c3c",
  danger: "#d10000",
  dangerDark: "#a00000",
  dangerBg: "#ffe5e5",
  white: "#fff",
  background: "#f5f7fa",
  inputBg: "#f2f2f2",
  border: "#ddd",
  divider: "#ccc",
  text: "#333",
  muted: "gray",
};

const styles = StyleSheet.create({
  // ── Layout ──────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: COLOR.background,
    padding: 16,
  },

  // ── Heading ─────────────────────────────────
  heading: {
    fontSize: 26,
    fontWeight: "bold",
    color: COLOR.green,
    marginBottom: 15,
  },

  // ── Search Card ──────────────────────────────
  searchCard: {
    backgroundColor: COLOR.white,
    borderRadius: 18,
    padding: 16,
    elevation: 4,
    marginBottom: 20,
  },
  inputLabel: {
    fontWeight: "600",
    marginBottom: 6,
    color: COLOR.text,
  },
  input: {
    backgroundColor: COLOR.inputBg,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLOR.border,
  },

  // ── OR Divider ───────────────────────────────
  orDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLOR.divider,
  },
  orText: {
    marginHorizontal: 10,
    fontWeight: "bold",
    color: COLOR.muted,
  },

  // ── Buttons ──────────────────────────────────
  buttonRow: {
    flexDirection: "row",
    marginTop: 15,
    justifyContent: "space-between",
  },
  searchButton: {
    flex: 1,
    backgroundColor: COLOR.green,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginRight: 10,
  },
  clearButton: {
    flex: 1,
    backgroundColor: COLOR.red,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: COLOR.white,
    fontWeight: "bold",
  },

  // ── Building Card ────────────────────────────
  buildingCard: {
    backgroundColor: COLOR.white,
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 20,
    elevation: 3,
  },
  buildingImage: {
    width: "100%",
    height: 180,
  },
  buildingName: {
    fontSize: 20,
    fontWeight: "bold",
    padding: 12,
  },

  // ── Results Table ────────────────────────────
  table: {
    backgroundColor: COLOR.white,
    borderRadius: 12,
    overflow: "hidden",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: COLOR.green,
    padding: 10,
  },
  tableHeaderCell: {
    flex: 1,
    color: COLOR.white,
    fontWeight: "bold",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tableCell: {
    flex: 1,
    textAlign: "center",
  },

  // ── Not Found ────────────────────────────────
  notFoundBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: COLOR.dangerBg,
    borderRadius: 12,
    alignItems: "center",
  },
  notFoundTitle: {
    color: COLOR.danger,
    fontWeight: "bold",
    fontSize: 16,
  },
  notFoundSubtitle: {
    color: COLOR.dangerDark,
    fontSize: 13,
    marginTop: 5,
  },
});s
