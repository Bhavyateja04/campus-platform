import React, { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AllPlaces } from "../data/places";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function normalizeString(str) {
  return str.replace(/\s+/g, "").toLowerCase();
}

function filterPlaces(places, query) {
  const normalized = normalizeString(query);
  return places.filter((place) =>
    normalizeString(place.name).includes(normalized)
  );
}

// ─────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────

function SearchBar({ value, onChangeText }) {
  return (
    <TextInput
      style={styles.searchInput}
      placeholder="Search places..."
      value={value}
      onChangeText={onChangeText}
    />
  );
}

function PlaceCard({ place, onPress }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={place.placeImage} style={styles.cardImage} />
      <Text style={styles.placeName}>{place.name}</Text>
    </Pressable>
  );
}

// ─────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────

export default function FindLocationScreen() {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState("");

  const filteredPlaces = filterPlaces(AllPlaces, searchText);

  function handlePlacePress(place) {
    navigation.navigate("Map", { place });
  }

  return (
    <View style={styles.root}>
      <Text style={styles.heading}>Find Places throughout the campus</Text>

      <SearchBar value={searchText} onChangeText={setSearchText} />

      <ScrollView>
        {filteredPlaces.map((place) => (
          <PlaceCard
            key={place.id}
            place={place}
            onPress={() => handlePlacePress(place)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  // ── Layout ──────────────────────────────────
  root: {
    flex: 1,
    backgroundColor: "#fff",
  },

  // ── Heading ─────────────────────────────────
  heading: {
    color: "green",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
    paddingTop: 10,
    paddingLeft: 10,
  },

  // ── Search Bar ───────────────────────────────
  searchInput: {
    backgroundColor: "#f2f2f2",
    marginHorizontal: 10,
    marginBottom: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  // ── Place Card ───────────────────────────────
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  cardImage: {
    width: "100%",
    height: 160,
  },
  placeName: {
    fontSize: 18,
    fontWeight: "bold",
    padding: 12,
    color: "#222",
  },
});
