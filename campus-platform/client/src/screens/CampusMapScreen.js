import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import MapViewDirections from "react-native-maps-directions";
import { AllPlaces } from "../data/places";
import { GOOGLE_MAPS_APIKEY, ORS_API_KEY } from "../utils/constants";

const THEME = {
  primary: "#6B46C1",
  primaryDark: "#4A2FA0",
  background: "#F6F7FB",
  surface: "#FFFFFF",
  muted: "#667085",
};

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const { width } = Dimensions.get("window");
const MAP_HEIGHT = Math.round((width * 9) / 16);

// ─────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────

const Header = ({ onBack }) => (
  <LinearGradient
    colors={[THEME.primaryDark, THEME.primary]}
    style={styles.header}
  >
    <TouchableOpacity style={styles.backBtn} onPress={onBack}>
      <Ionicons name="chevron-back" size={22} color="#fff" />
    </TouchableOpacity>
    <View style={styles.headerTitleBlock}>
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
  <View style={styles.landmarkCardRow}>
    <Ionicons name="ellipse" size={10} color={THEME.primary} />
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
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selected, setSelected] = useState(null);
  const [routeStarted, setRouteStarted] = useState(false);
  const [routeSummary, setRouteSummary] = useState(null);
  const [polylineCoords, setPolylineCoords] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const getDistanceMeters = (from, to) => {
    if (!from || !to) return null;

    const earthRadius = 6371000;
    const lat1 = (from.latitude * Math.PI) / 180;
    const lat2 = (to.latitude * Math.PI) / 180;
    const deltaLat = ((to.latitude - from.latitude) * Math.PI) / 180;
    const deltaLng = ((to.longitude - from.longitude) * Math.PI) / 180;

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(deltaLng / 2) *
        Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadius * c;
  };

  const formatDistance = (meters) => {
    if (meters == null || Number.isNaN(meters)) return null;
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const formatDuration = (meters) => {
    if (meters == null || Number.isNaN(meters)) return null;

    const walkingSpeedMetersPerSecond = 1.4;
    const minutes = Math.max(
      1,
      Math.round(meters / (walkingSpeedMetersPerSecond * 60)),
    );

    if (minutes < 60) return `${minutes} min`;

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  const formatEta = (minutes) => {
    if (minutes == null) return null;
    const date = new Date(Date.now() + minutes * 60000);
    const h = date.getHours();
    const m = date.getMinutes();
    const hh = h % 12 || 12;
    const ampm = h >= 12 ? "PM" : "AM";
    return `${hh}:${m.toString().padStart(2, "0")} ${ampm}`;
  };

  const handleStartRoute = async () => {
    if (routeStarted) {
      setRouteStarted(false);
      setPolylineCoords([]);
      setRouteSummary(null);
      return;
    }

    if (!selected) return;
    setRouteStarted(true);
    setRouteSummary(null);
    setPolylineCoords([]);

    if (!currentLocation) {
      setRouteSummary({
        errorMessage: "Location access required to calculate route.",
      });
      return;
    }

    const googleKeyValid =
      typeof GOOGLE_MAPS_APIKEY === "string" &&
      GOOGLE_MAPS_APIKEY.startsWith("AIza");
    const orsKeyValid =
      typeof ORS_API_KEY === "string" && ORS_API_KEY.trim().length > 0;

    if (!googleKeyValid && !orsKeyValid) {
      setRouteSummary({
        errorMessage:
          "Routing disabled: provide a valid Google or OpenRouteService key.",
      });
      return;
    }

    if (googleKeyValid) {
      setRouteSummary({});
      mapRef.current?.fitToCoordinates(
        [
          currentLocation,
          { latitude: selected.latitude, longitude: selected.longitude },
        ],
        {
          edgePadding: { top: 80, right: 60, bottom: 80, left: 60 },
          animated: true,
        },
      );
      return;
    }

    try {
      const start = `${currentLocation.longitude},${currentLocation.latitude}`;
      const end = `${selected.longitude},${selected.latitude}`;
      const getUrl = `https://api.openrouteservice.org/v2/directions/foot-walking?start=${start}&end=${end}`;

      let res = await fetch(getUrl, {
        headers: { Authorization: ORS_API_KEY, Accept: "application/json" },
      });

      let data = null;
      try {
        data = await res.json();
      } catch (jsonErr) {
        data = null;
      }

      let feat = data?.features?.[0];

      if (
        !feat ||
        !feat.geometry ||
        !Array.isArray(feat.geometry.coordinates)
      ) {
        const postUrl =
          "https://api.openrouteservice.org/v2/directions/foot-walking/geojson";
        const body = {
          coordinates: [
            [currentLocation.longitude, currentLocation.latitude],
            [selected.longitude, selected.latitude],
          ],
        };
        res = await fetch(postUrl, {
          method: "POST",
          headers: {
            Authorization: ORS_API_KEY,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
        data = await res.json();
        feat = data?.features?.[0];
      }

      if (feat && feat.geometry && Array.isArray(feat.geometry.coordinates)) {
        const coords = feat.geometry.coordinates.map((c) => ({
          latitude: c[1],
          longitude: c[0],
        }));
        setPolylineCoords(coords);
        const seconds =
          feat.properties?.summary?.duration ??
          feat.properties?.segments?.[0]?.duration;
        const minutes = seconds ? Math.max(1, Math.round(seconds / 60)) : null;
        setRouteSummary({
          durationLabel: minutes ? `${minutes} min` : null,
          etaLabel: minutes ? formatEta(minutes) : null,
        });
        mapRef.current?.fitToCoordinates(coords, {
          edgePadding: { top: 80, right: 60, bottom: 80, left: 60 },
          animated: true,
        });
      } else {
        setRouteSummary({
          errorMessage: "Route not available from OpenRouteService.",
        });
      }
    } catch (e) {
      setRouteSummary({
        errorMessage: "Routing failed — network or key issue.",
      });
      console.warn("ORS routing error", e);
    }
  };

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
      setRouteStarted(false);
    }

    // Otherwise try to use device location, fallback to first place
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({});
          const coords = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          };
          setCurrentLocation(coords);
          setRegion({
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          });
          return;
        }
      } catch (e) {
        /* ignore */
      }

      const first = AllPlaces[0];
      setCurrentLocation({
        latitude: first.latitude,
        longitude: first.longitude,
      });
      setRegion({
        latitude: first.latitude,
        longitude: first.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    })();
  }, [route.params]);

  useEffect(() => {
    setRouteStarted(false);
    setRouteSummary(null);
  }, [selected]);

  const distanceMeters = getDistanceMeters(currentLocation, selected);
  const distanceLabel = formatDistance(distanceMeters);
  const durationLabel =
    routeSummary?.durationLabel || formatDuration(distanceMeters);
  const etaLabel = routeSummary?.etaLabel || null;
  const origin = routeStarted && currentLocation ? currentLocation : null;
  const destination =
    routeStarted && selected
      ? { latitude: selected.latitude, longitude: selected.longitude }
      : null;

  return (
    <SafeAreaView style={styles.root} edges={["left", "right", "bottom"]}>
      <StatusBar
        barStyle={Platform.OS === "ios" ? "dark-content" : "light-content"}
      />

      <Header onBack={() => navigation.goBack()} />

      <View style={styles.body}>
        {/* Top search + info */}
        <View style={styles.searchRow}>
          <TextInput
            placeholder="Search location..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInputTop}
          />
          <TouchableOpacity style={styles.searchRightBtn} onPress={() => {}}>
            <Ionicons name="filter" size={18} color={THEME.primaryDark} />
          </TouchableOpacity>
        </View>

        {/* Map card */}
        <View style={styles.mapCardLarge}>
          {region && (
            <MapView
              ref={mapRef}
              style={styles.mapLarge}
              initialRegion={region}
              showsUserLocation={true}
            >
              {routeStarted &&
                origin &&
                destination &&
                typeof GOOGLE_MAPS_APIKEY === "string" &&
                GOOGLE_MAPS_APIKEY.startsWith("AIza") && (
                  <MapViewDirections
                    origin={origin}
                    destination={destination}
                    apikey={GOOGLE_MAPS_APIKEY}
                    strokeColor={THEME.primaryDark}
                    strokeWidth={4}
                    mode="WALKING"
                    onReady={(result) => {
                      const minutes = Math.max(1, Math.round(result.duration));
                      setRouteSummary({
                        durationLabel: `${minutes} min`,
                        etaLabel: formatEta(minutes),
                      });

                      mapRef.current?.fitToCoordinates([origin, destination], {
                        edgePadding: {
                          top: 80,
                          right: 60,
                          bottom: 80,
                          left: 60,
                        },
                        animated: true,
                      });
                    }}
                    onError={() => {
                      setRouteSummary({
                        durationLabel: null,
                        etaLabel: null,
                      });
                    }}
                  />
                )}
              {polylineCoords?.length > 0 && (
                <Polyline
                  coordinates={polylineCoords}
                  strokeColor={THEME.primaryDark}
                  strokeWidth={4}
                />
              )}
              {AllPlaces.map((p) => (
                <Marker
                  key={p.id}
                  coordinate={{ latitude: p.latitude, longitude: p.longitude }}
                  title={p.name}
                  pinColor={THEME.primary}
                  onPress={() => {
                    setSelected(p);
                  }}
                />
              ))}
            </MapView>
          )}

          <TouchableOpacity style={styles.mapControl} onPress={() => {}}>
            <Ionicons name="locate" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Quick access chips */}
        <View style={styles.quickRowWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.quickRow}>
              <TouchableOpacity style={styles.chip}>
                <Text style={styles.chipIcon}>📚</Text>
                <Text style={styles.chipText}>Library</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.chip}>
                <Text style={styles.chipIcon}>🍽️</Text>
                <Text style={styles.chipText}>Canteen</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.chip}>
                <Text style={styles.chipIcon}>🔬</Text>
                <Text style={styles.chipText}>Labs</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.chip}>
                <Text style={styles.chipIcon}>🏠</Text>
                <Text style={styles.chipText}>Hostel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.chip}>
                <Text style={styles.chipIcon}>🚌</Text>
                <Text style={styles.chipText}>Bus Stop</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        {/* Nearby places */}
        <Text style={styles.sectionTitle}>Nearby Places</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.landmarkList}
        >
          {AllPlaces.slice(0, 6).map((place) => (
            <TouchableOpacity
              key={place.id}
              style={styles.landmarkThumb}
              onPress={() => {
                setSelected(place);
                mapRef.current?.animateToRegion(
                  {
                    latitude: place.latitude,
                    longitude: place.longitude,
                    latitudeDelta: 0.004,
                    longitudeDelta: 0.006,
                  },
                  300,
                );
              }}
            >
              <Image source={place.placeImage} style={styles.thumbImage} />
              <View style={styles.thumbContent}>
                <Text style={styles.landmarkName}>{place.name}</Text>
                <Text numberOfLines={1} style={styles.landmarkNote}>
                  {place.note || ""}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Route panel (compact) */}
        {selected && (
          <View style={styles.routePanelCompact}>
            <View style={{ flex: 1 }}>
              <Text style={styles.routeTitle}>{selected.name}</Text>
              <Text style={styles.routeSubtitle}>
                {routeSummary?.errorMessage
                  ? routeSummary.errorMessage
                  : !routeStarted
                    ? distanceLabel
                      ? `${distanceLabel} away. Tap Start to show walk time and ETA.`
                      : "Location access required to calculate distance"
                    : routeSummary?.durationLabel && routeSummary?.etaLabel
                      ? `${distanceLabel || "Route ready"} away • ${routeSummary.durationLabel} walk • ETA ${routeSummary.etaLabel}`
                      : routeStarted && distanceLabel
                        ? `${distanceLabel} away • calculating route...`
                        : distanceLabel
                          ? `${distanceLabel} away from your current location`
                          : "Location access required to calculate distance"}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.startBtnCompact}
              onPress={handleStartRoute}
            >
              <Text style={styles.startBtnText}>
                {routeStarted ? "On route" : "Start"}
              </Text>
            </TouchableOpacity>
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
    backgroundColor: THEME.background,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  headerTitleBlock: { flex: 1, alignItems: "center" },
  bottomCard: {
    position: "absolute",
    bottom: 20,
    left: 15,
    right: 15,
    backgroundColor: THEME.surface,
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
  },
  subtitle: {
    color: "rgba(255,255,255,0.9)",
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
    backgroundColor: THEME.surface,
    borderRadius: 12,
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

  // Landmark Card (inline row used by small lists)
  landmarkCardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
  // Horizontal landmark thumbnails
  landmarkList: { paddingVertical: 12, paddingHorizontal: 2 },
  landmarkThumb: {
    width: 160,
    marginRight: 12,
    backgroundColor: THEME.surface,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 4,
  },
  thumbImage: { width: "100%", height: 98, resizeMode: "cover" },
  thumbContent: { padding: 10 },

  // Map container
  mapContainer: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    backgroundColor: "#fff",
  },
  map: { width: "100%", height: MAP_HEIGHT },

  // Selected bottom card
  selectedTitle: { fontSize: 16, fontWeight: "800", color: "#0D1B2A" },
  selectedNote: { color: THEME.muted, marginTop: 6 },
  navButton: {
    backgroundColor: THEME.primary,
    padding: 10,
    borderRadius: 10,
    marginLeft: 12,
  },
  /* New UI styles */
  searchRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  searchInputTop: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#ECECEC",
  },
  searchRightBtn: {
    marginLeft: 10,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    elevation: 2,
  },
  mapCardLarge: {
    marginTop: 8,
    borderRadius: 14,
    overflow: "hidden",
    elevation: 6,
    backgroundColor: THEME.surface,
  },
  mapLarge: { width: "100%", height: MAP_HEIGHT + 40 },
  mapControl: {
    position: "absolute",
    right: 12,
    bottom: 12,
    backgroundColor: THEME.primary,
    padding: 10,
    borderRadius: 10,
  },
  quickRowWrap: { marginTop: 12 },
  quickRow: { flexDirection: "row", paddingHorizontal: 4 },
  chip: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 8,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },
  chipIcon: { marginRight: 8 },
  chipText: { fontWeight: "600", color: "#333" },
  /* Route panel compact */
  routePanelCompact: {
    marginTop: 12,
    backgroundColor: THEME.surface,
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 4,
  },
  routeTitle: { fontSize: 16, fontWeight: "800", color: "#0D1B2A" },
  routeSubtitle: { color: THEME.muted, marginTop: 4 },
  startBtnCompact: {
    backgroundColor: THEME.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  startBtnText: { color: "#fff", fontWeight: "800" },
});
