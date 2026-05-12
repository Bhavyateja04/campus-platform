import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
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
const { width } = Dimensions.get("window");
const MAP_HEIGHT = Math.round((width * 9) / 16);

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
      <Text style={styles.subtitle}>
        Quick navigation to key places on campus
      </Text>
    </View>
  </LinearGradient>
);

const MapInfoCard = () => (
  <View style={styles.mapCard}>
    <Text style={styles.mapHeadline}>Explore Aditya University</Text>
    <Text style={styles.mapText}>
      Tap markers to view places. Use your device's location to center the map.
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
  const route = useRoute();
  const mapRef = useRef(null);
  const [region, setRegion] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    // If a place is passed via params, center on it
    const place = route.params?.place;
    if (place && place.latitude && place.longitude) {
      const r = {
        latitude: place.latitude,
        longitude: place.longitude,
        latitudeDelta: 0.004,
        longitudeDelta: 0.006,
      };
      setRegion(r);
      setTimeout(() => mapRef.current?.animateToRegion(r, 500), 300);
      setSelected(place);
      return;
    }

    // Otherwise try to use device location, fallback to first place
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({});
          setRegion({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          });
          return;
        }
      } catch (e) {
        /* ignore */
      }

      const first = AllPlaces[0];
      setRegion({
        latitude: first.latitude,
        longitude: first.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    })();
  }, [route.params]);

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
            style={{ width: "100%", height: MAP_HEIGHT, borderRadius: 12 }}
            initialRegion={region}
            showsUserLocation={true}
          >
            {AllPlaces.map((p) => (
              <Marker
                key={p.id}
                coordinate={{ latitude: p.latitude, longitude: p.longitude }}
                title={p.name}
                description={p.name}
                onPress={() => {
                  setSelected(p);
                  mapRef.current?.animateToRegion(
                    {
                      latitude: p.latitude,
                      longitude: p.longitude,
                      latitudeDelta: 0.004,
                      longitudeDelta: 0.006,
                    },
                    300,
                  );
                }}
              />
            ))}
          </MapView>
        )}

        <Text style={styles.sectionTitle}>Key Landmarks</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ gap: 10 }}
        >
          {AllPlaces.map((place) => (
            <TouchableOpacity
              key={place.id}
              style={styles.landmarkCard}
              onPress={() => {
                setSelected(place);
                const r = {
                  latitude: place.latitude,
                  longitude: place.longitude,
                  latitudeDelta: 0.004,
                  longitudeDelta: 0.006,
                };
                mapRef.current?.animateToRegion(r, 300);
              }}
            >
              <Image
                source={place.placeImage}
                style={{ width: 140, height: 90, borderRadius: 10 }}
              />
              <View style={{ padding: 8, width: 200 }}>
                <Text style={styles.landmarkName}>{place.name}</Text>
                <Text numberOfLines={2} style={styles.landmarkNote}>
                  {place.note || ""}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {selected && (
          <View style={styles.bottomCard}>
            <Text style={{ fontWeight: "800" }}>{selected.name}</Text>
            <Text style={{ color: "#444", marginTop: 6 }}>{selected.note}</Text>
          </View>
        )}
      </View>
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
    justifyContent: "center",
  },
  bottomCard: {
    position: "absolute",
    bottom: 20,
    left: 15,
    right: 15,
    backgroundColor: "white",
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
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
  },

  mapHeadline: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#0D1B2A",
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
    justifyContent: "space-between",
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
