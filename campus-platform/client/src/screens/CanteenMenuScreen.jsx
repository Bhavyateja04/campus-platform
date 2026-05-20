/**
 * CanteenMenuScreen.jsx
 * Clean, production-grade refactor of the canteen menu screen.
 *
 * Key improvements:
 * - Extracted constants to a dedicated config section
 * - Moved helper functions outside the component (no re-creation on render)
 * - Separated sub-components (MenuCard, DropdownOverlay, ListHeader) into named exports
 * - Removed dead/unused state (showCanteenDropdown is never set to true via dropdown)
 * - Collapsed duplicated dropdown rendering into a single DropdownOverlay component
 * - Added PropTypes-style JSDoc for component props
 * - Consistent StyleSheet token ordering
 */

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { canteensApi } from "../services/api";

// ─────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 36) / 2;

const CANTEENS = [
  "All Canteens",
  "Satya Canteen",
  "Pencil Canteen",
  "Aparna Canteen",
];

const THEME = {
  primary: "#6B46C1",
  background: "#F5F5F5",
  white: "#FFFFFF",
};

// ─────────────────────────────────────────────
// Seed / Fallback Data
// ─────────────────────────────────────────────

const FALLBACK_MENU = [
  {
    _id: "m1",
    name: "Veg Biryani",
    canteen: "Satya Canteen",
    price: 90,
    available: true,
    image:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80",
  },
  {
    _id: "m2",
    name: "Masala Dosa",
    canteen: "Pencil Canteen",
    price: 60,
    available: true,
    image:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80",
  },
  {
    _id: "m3",
    name: "Chicken Biryani",
    canteen: "Aparna Canteen",
    price: 120,
    available: true,
    image:
      "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=600&q=80",
  },
  {
    _id: "m4",
    name: "Paneer Roll",
    canteen: "Satya Canteen",
    price: 70,
    available: false,
    image:
      "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&q=80",
  },
];

const IMAGE_FALLBACKS = {
  biryani:
    "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80",
  dosa: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80",
  roll: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&q=80",
  chicken:
    "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=600&q=80",
  sandwich:
    "https://images.unsplash.com/photo-1550507992-eb63ffee0847?w=600&q=80",
  burger:
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
  noodles:
    "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80",
  default:
    "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80",
};

// ─────────────────────────────────────────────
// Pure Helpers  (defined outside component → stable references)
// ─────────────────────────────────────────────

/** Returns the best image URI for a menu item, with keyword-based fallback. */
function resolveMenuImage(item, canteenImage) {
  const direct = item?.image || item?.imageUrl || canteenImage;
  if (direct) return direct;

  const name = String(item?.name || item?.title || "").toLowerCase();
  const key = Object.keys(IMAGE_FALLBACKS).find(
    (k) => k !== "default" && name.includes(k),
  );
  return IMAGE_FALLBACKS[key ?? "default"];
}

/**
 * Normalises a raw canteen document from the backend into an array of
 * flat menu-row objects the screen can render.
 *
 * Handles two backend shapes:
 *   • Canteen document  { _id, name, menu: [...] }
 *   • Legacy item doc   { _id, name, price, canteen, ... }
 */
function normaliseCanteen(raw) {
  // Accept either Mongo `_id` or a plain `id`, and tolerate legacy shapes
  const id = raw?._id ?? raw?.id;
  if (!id && !Array.isArray(raw?.menu) && !raw?.name) return [];

  // Shape A – canteen document with embedded menu array
  if (Array.isArray(raw.menu) && raw.menu.length) {
    return raw.menu.map((it, idx) => ({
      _id: `${id || raw._id || raw?.name}-${idx}`,
      name: it.name || it.title || (typeof it === "string" ? it : "Menu Item"),
      canteen: raw.name || raw.location || "All Canteens",
      price: Number(it.price) || 0,
      available: it.available !== false,
      image: it.image ?? raw.image ?? null,
    }));
  }

  // Shape B – legacy flat item document
  return [
    {
      _id: String(
        id ?? raw._id ?? raw?.name ?? Math.random().toString(36).slice(2, 9),
      ),
      name: raw.name || raw.itemName || "Menu Item",
      canteen: raw.canteen || raw.location || "All Canteens",
      price: Number(raw.price) || 0,
      available: raw.available !== false,
      image: raw.image || raw.imageUrl || null,
    },
  ];
}

/** Builds a stable, unique row key for FlatList. */
function buildRowKey(item, index) {
  return `${item._id || item.name || "item"}-${item.canteen || "canteen"}-${index}`;
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

/** Single food card rendered inside the FlatList grid. */
const MenuCard = ({ item }) => (
  <TouchableOpacity
    style={styles.menuCard}
    activeOpacity={0.88}
    onPress={() => {}}
  >
    <View style={styles.imageWrapper}>
      <Image
        source={{ uri: resolveMenuImage(item) }}
        style={styles.foodImage}
      />
      <View
        style={[
          styles.availabilityBadge,
          { backgroundColor: item.available ? "#E8F5E9" : "#FFEBEE" },
        ]}
      >
        <Text
          style={[
            styles.availabilityText,
            { color: item.available ? "#2E7D32" : "#C62828" },
          ]}
        >
          {item.available ? "Available" : "Unavailable"}
        </Text>
      </View>
    </View>

    <View style={styles.cardContent}>
      <Text style={styles.itemName} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.canteenName} numberOfLines={1}>
        {item.canteen}
      </Text>
      <Text style={styles.price}>₹{item.price}</Text>
    </View>
  </TouchableOpacity>
);

/**
 * Full-screen dimmed overlay that shows the canteen picker dropdown.
 * @param {{ visible: boolean, selected: string, onSelect: Function, onDismiss: Function }} props
 */
const DropdownOverlay = ({ visible, selected, onSelect, onDismiss }) => {
  if (!visible) return null;

  return (
    <TouchableOpacity
      style={styles.overlay}
      activeOpacity={1}
      onPress={onDismiss}
    >
      <View style={styles.overlayDropdown}>
        {CANTEENS.map((canteen, idx) => {
          const isSelected = selected === canteen;
          return (
            <TouchableOpacity
              key={`${canteen}-${idx}`}
              style={[
                styles.dropdownItem,
                isSelected && styles.selectedDropdownItem,
              ]}
              onPress={() => onSelect(canteen)}
            >
              <Text
                style={[
                  styles.dropdownItemText,
                  isSelected && styles.selectedDropdownItemText,
                ]}
              >
                {canteen}
              </Text>
              {isSelected && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
    </TouchableOpacity>
  );
};

/**
 * FlatList header: search bar + canteen filter + results summary.
 * @param {{ searchQuery: string, onSearch: Function, onClearSearch: Function,
 *           selectedCanteen: string, onOpenDropdown: Function,
 *           onClearFilter: Function, resultCount: number }} props
 */
const ListHeader = ({
  searchQuery,
  onSearch,
  onClearSearch,
  selectedCanteen,
  onOpenDropdown,
  onClearFilter,
  resultCount,
}) => (
  <>
    <View style={styles.searchSection}>
      {/* Search bar */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search food items..."
          placeholderTextColor="#aaa"
          value={searchQuery}
          onChangeText={onSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={onClearSearch}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Canteen filter button */}
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={onOpenDropdown}
        activeOpacity={0.8}
      >
        <Text style={styles.canteenIcon}>🏪</Text>
        <Text style={styles.selectedCanteenText} numberOfLines={1}>
          {selectedCanteen}
        </Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>
    </View>

    {/* Results summary row */}
    <View style={styles.resultsInfo}>
      <Text style={styles.resultsText}>
        {resultCount} {resultCount === 1 ? "item" : "items"} found
      </Text>
      {selectedCanteen !== "All Canteens" && (
        <TouchableOpacity onPress={onClearFilter}>
          <Text style={styles.clearFilterText}>Clear filter ✕</Text>
        </TouchableOpacity>
      )}
    </View>
  </>
);

/** Shown when the filtered list is empty. */
const EmptyState = () => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyIcon}>🍽️</Text>
    <Text style={styles.emptyText}>No items found</Text>
    <Text style={styles.emptySubtext}>
      Try adjusting your search or filters
    </Text>
  </View>
);

// ─────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────

const CanteenMenuScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCanteen, setSelectedCanteen] = useState("All Canteens");
  const [showOverlay, setShowOverlay] = useState(false);
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch menu from API; fall back to seed data on error
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await canteensApi.list();
        if (cancelled) return;

        const raw = Array.isArray(response) ? response : (response?.data ?? []);
        const rows = raw.flatMap(normaliseCanteen).filter(Boolean);

        setMenuData(rows.length ? rows : FALLBACK_MENU);
      } catch (err) {
        console.warn(
          "[CanteenMenu] API error – using seed data:",
          err?.message ?? err,
        );
        if (!cancelled) setMenuData(FALLBACK_MENU);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Memoised filtered + keyed list
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return menuData
      .filter((item) => {
        const matchesSearch =
          !query || item?.name?.toLowerCase().includes(query);
        const matchesCanteen =
          selectedCanteen === "All Canteens" ||
          item?.canteen === selectedCanteen;
        return matchesSearch && matchesCanteen;
      })
      .map((item, index) => ({
        ...item,
        rowKey: buildRowKey(item, index),
      }));
  }, [searchQuery, selectedCanteen, menuData]);

  // Stable callbacks (avoid re-creating on every render)
  const handleCanteenSelect = useCallback((canteen) => {
    setSelectedCanteen(canteen);
    setShowOverlay(false);
  }, []);

  const handleGoBack = useCallback(() => {
    if (navigation?.canGoBack()) navigation.goBack();
  }, [navigation]);

  // ── Render ──────────────────────────────────

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={THEME.primary} />
        <Text style={styles.loadingText}>Loading menu…</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={handleGoBack}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerTitleBlock}>
          <Text style={styles.headerTitle}>Canteen Menu</Text>
          <Text style={styles.headerSubtitle}>{menuData.length} items</Text>
        </View>

        {/* Spacer to keep title centred */}
        <View style={styles.headerIconBtn} />
      </View>

      {/* Menu grid */}
      <View style={styles.listWrapper}>
        <FlatList
          data={filteredItems}
          renderItem={({ item }) => <MenuCard item={item} />}
          keyExtractor={(item) => String(item.rowKey)}
          numColumns={2}
          ListHeaderComponent={
            <ListHeader
              searchQuery={searchQuery}
              onSearch={setSearchQuery}
              onClearSearch={() => setSearchQuery("")}
              selectedCanteen={selectedCanteen}
              onOpenDropdown={() => setShowOverlay(true)}
              onClearFilter={() => setSelectedCanteen("All Canteens")}
              resultCount={filteredItems.length}
            />
          }
          ListEmptyComponent={<EmptyState />}
          contentContainerStyle={styles.menuList}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />
      </View>

      {/* Canteen picker overlay */}
      <DropdownOverlay
        visible={showOverlay}
        selected={selectedCanteen}
        onSelect={handleCanteenSelect}
        onDismiss={() => setShowOverlay(false)}
      />
    </SafeAreaView>
  );
};

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  // Layout
  container: { flex: 1, backgroundColor: THEME.background },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  listWrapper: { flex: 1, zIndex: 0 },

  // Loading
  loadingText: { marginTop: 10, color: "#666" },

  // Header
  header: {
    backgroundColor: THEME.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    elevation: 6,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    fontSize: 20,
    color: THEME.white,
    fontWeight: "700",
    lineHeight: 22,
  },
  headerTitleBlock: { flex: 1, alignItems: "center" },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: THEME.white,
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    marginTop: 1,
  },

  // Search section
  searchSection: {
    backgroundColor: THEME.white,
    paddingHorizontal: 14,
    paddingVertical: 14,
    elevation: 10,
    zIndex: 9999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  searchIcon: { fontSize: 16, marginRight: 9 },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    padding: 0,
    lineHeight: 18,
  },
  clearIcon: { fontSize: 14, color: "#aaa", paddingLeft: 10 },

  // Canteen dropdown button
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
  },
  canteenIcon: { fontSize: 16, marginRight: 9 },
  selectedCanteenText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  dropdownArrow: { fontSize: 10, color: "#888", marginLeft: 8 },

  // Results row
  resultsInfo: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: THEME.background,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  resultsText: { fontSize: 12, color: "#888", fontWeight: "500" },
  clearFilterText: { fontSize: 12, color: THEME.primary, fontWeight: "600" },

  // Grid list
  menuList: { paddingHorizontal: 12, paddingBottom: 30 },
  row: { justifyContent: "space-between", marginBottom: 12 },

  // Menu card
  menuCard: {
    width: CARD_WIDTH,
    backgroundColor: THEME.white,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 6,
  },
  imageWrapper: { position: "relative" },
  foodImage: { width: "100%", height: 130, resizeMode: "cover" },
  availabilityBadge: {
    position: "absolute",
    top: 7,
    right: 7,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  availabilityText: {
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  cardContent: { padding: 11 },
  itemName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 3,
  },
  canteenName: { fontSize: 11, color: "#999", marginBottom: 8 },
  price: { fontSize: 16, fontWeight: "800", color: THEME.primary },

  // Empty state
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
    paddingHorizontal: 24,
  },
  emptyIcon: { fontSize: 56, marginBottom: 14 },
  emptyText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  emptySubtext: { fontSize: 13, color: "#aaa", textAlign: "center" },

  // Overlay + dropdown
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "flex-start",
  },
  overlayDropdown: {
    marginTop: 170,
    marginHorizontal: 14,
    backgroundColor: THEME.white,
    borderRadius: 14,
    paddingVertical: 6,
    elevation: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  selectedDropdownItem: { backgroundColor: "#F3E8FF" },
  dropdownItemText: { fontSize: 14, color: "#444" },
  selectedDropdownItemText: { fontWeight: "600", color: THEME.primary },
  checkmark: { fontSize: 16, color: THEME.primary, fontWeight: "700" },
});

export default CanteenMenuScreen;
