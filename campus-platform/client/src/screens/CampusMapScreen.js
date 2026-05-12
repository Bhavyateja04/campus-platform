import React, { useState, useEffect, useRef } from "react";
import {
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { AllPlaces } from "../data/places";

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const SCREEN_WIDTH = Dimensions.get("window").width;
const MAP_HEIGHT = Math.round((SCREEN_WIDTH * 9) / 16);

const DEFAULT_REGION_DELTA = { latitudeDelta: 0.02, longitudeDelta: 0.02 };
const FOCUSED_REGION_DELTA = { latitudeDelta: 0.004, longitudeDelta: 0.006 };
const MAP_ANIMATE_DURATION_MS = 300;
const MAP_INIT_DELAY_MS = 300;

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function buildRegion(latitude, longitude, delta = FOCUSED_REGION_DELTA) {
  return { latitude, longitude, ...delta };
}

async function fetchDeviceLocation() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") return null;
  const { coords } = await Location.getCurrentPositionAsync({});
  return coords;
}

// ─────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────

function Header({ onBack }) {
  return (
    <LinearGradient colors={["#2E4D7A", "#4A6FA5"]} style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="chevron-back" size={22} color="#fff" />
      </TouchableOpacity>
      <View>
        <Text style={styles.headerTitle}>Campus Map</Text>
        <Text style={styles.headerSubtitle}>
          Quick navigation to key places on campus
        </Text>
      </View>
    </LinearGradient>
  );
}

function MapInfoCard() {
  return (
    <View style={styles.mapInfoCard}>
      <Text style={styles.mapInfoHeadline}>Explore Aditya University</Text>
      <Text style={styles.mapInfoBody}>
        Tap markers to view places. Use your device's location to center the
        map.
      </Text>
    </View>
  );
}

function LandmarkThumbnail({ place, onPress }) {
  return (
    <TouchableOpacity style={styles.landmarkCard} onPress={() => onPress(place)}>
      <Image source={place.placeImage} style={styles.landmarkImage} />
      <View style={styles.landmarkTextContainer}>
        <Text style={styles.landmarkName}>{place.name}</Text>
        <Text numberOfLines={2} style={styles.landmarkNote}>
          {place.note ?? ""}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function SelectedPlaceCard({ place }) {
  if (!place) return null;
  return (
    <View style={styles.selectedPlaceCard}>
      <Text style={styles.selectedPlaceName}>{place.name}</Text>
      <Text style={styles.selectedPlaceNote}>{place.note}</Text>
    </View>
  );
}

// ─────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────

export default function CampusMapScreen({ navigation }) {
  const route = useRoute();
  const mapRef = useRef(null);

  const [region, setRegion] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);

  useEffect(() => {
    const routePlace = route.params?.place;
    if (routePlace?.latitude && routePlace?.longitude) {
      initFromRoutePlace(routePlace);
    } else {
      initFromDeviceOrFallback();
    }
  }, [route.params]);

  function initFromRoutePlace(place) {
    const r = buildRegion(place.latitude, place.longitude);
    setRegion(r);
    setSelectedPlace(place);
    setTimeout(() => mapRef.current?.animateToRegion(r, MAP_ANIMATE_DURATION_MS), MAP_INIT_DELAY_MS);
  }

  async function initFromDeviceOrFallback() {
    try {
      const coords = await fetchDeviceLocation();
      if (coords) {
        setRegion(buildRegion(coords.latitude, coords.longitude, DEFAULT_REGION_DELTA));
        return;
      }
    } catch {
      // fall through to default
    }

    const [firstPlace] = AllPlaces;
    setRegion(buildRegion(firstPlace.latitude, firstPlace.longitude, DEFAULT_REGION_DELTA));
  }

  function focusPlace(place) {
    const r = buildRegion(place.latitude, place.longitude);
    setSelectedPlace(place);
    mapRef.current?.animateToRegion(r, MAP_ANIMATE_DURATION_MS);
  }

  return (
    <SafeAreaView style={styles.root} edges={["left", "right", "bottom"]}>
      <StatusBar
        barStyle={Platform.OS === "ios" ? "dark-content" : "light-content"}
      />

      <Header onBack={() => navigation.goBack()} />

      <View style={styles.body}>
        <MapInfoCard />

        {region && (
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={region}
            showsUserLocation
          >
            {AllPlaces.map((place) => (
              <Marker
                key={place.id}
                coordinate={{ latitude: place.latitude, longitude: place.longitude }}
                title={place.name}
                description={place.name}
                onPress={() => focusPlace(place)}
              />
            ))}
          </MapView>
        )}

        <Text style={styles.sectionTitle}>Key Landmarks</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {AllPlaces.map((place) => (
            <LandmarkThumbnail
              key={place.id}
              place={place}
              onPress={focusPlace}
            />
          ))}
        </ScrollView>

        <SelectedPlaceCard place={selectedPlace} />
      </View>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  // ── Layout ──────────────────────────────────
  root: {
    flex: 1,
    backgroundColor: "#F5F8FC",
  },
  body: {
    padding: 16,
    paddingBottom: 36,
    gap: 12,
  },

  // ── Header ──────────────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    // reserve space for back icon; add padding as needed
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 12,
    marginTop: 3,
  },

  // ── Map Info Card ────────────────────────────
  mapInfoCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  mapInfoHeadline: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#0D1B2A",
  },
  mapInfoBody: {
    color: "#3D5068",
    lineHeight: 20,
  },

  // ── Map ─────────────────────────────────────
  map: {
    width: "100%",
    height: MAP_HEIGHT,
    borderRadius: 12,
  },

  // ── Section Title ────────────────────────────
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0D1B2A",
    marginTop: 8,
    marginBottom: 2,
  },

  // ── Landmark Thumbnail ───────────────────────
  landmarkCard: {
    flexDirection: "row",
  },
  landmarkImage: {
    width: 140,
    height: 90,
    borderRadius: 10,
  },
  landmarkTextContainer: {
    padding: 8,
    width: 200,
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

  // ── Selected Place Card ──────────────────────
  selectedPlaceCard: {
    position: "absolute",
    bottom: 20,
    left: 15,
    right: 15,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedPlaceName: {
    fontWeight: "800",
  },
  selectedPlaceNote: {
    color: "#444",
    marginTop: 6,
  },
});
