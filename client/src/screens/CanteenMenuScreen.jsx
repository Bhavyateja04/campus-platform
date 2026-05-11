// ─── Imports ──────────────────────────────────────────────────────────────────
import React, { useState, useMemo, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Constants ─────────────────────────────────────────────────────────────────
const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH   = (SCREEN_WIDTH - 36) / 2;

const COLORS = {
  primary:         '#6B46C1',
  primaryLight:    '#FAF7FF',
  primaryFaint:    '#F3E8FF',
  primaryMuted:    'rgba(255,255,255,0.18)',
  primarySubtitle: 'rgba(255,255,255,0.7)',
  white:           '#FFF',
  background:      '#F5F5F5',
  surface:         '#F8F9FA',
  border:          '#E8E8E8',
  borderStrong:    '#E0E0E0',
  divider:         '#F5F5F5',
  text:            '#1A1A1A',
  textSecondary:   '#333',
  textMuted:       '#888',
  textFaint:       '#aaa',
  textCanteen:     '#999',
  textDropdown:    '#444',
  availableText:   '#2E7D32',
  availableBg:     '#E8F5E9',
  unavailableText: '#C62828',
  unavailableBg:   '#FFEBEE',
  overlayBg:       'rgba(0,0,0,0.2)',
};

const CANTEENS = [
  'All Canteens',
  'Satya Canteen',
  'Pencil Canteen',
  'Aparna Canteen',
];

const API_BASE_URL = 'http://192.168.1.7:5000';

// ─── Custom Hook ───────────────────────────────────────────────────────────────
const useMenuData = () => {
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/menu`)
      .then((res) => res.json())
      .then((data) => {
        setMenuData(data.data ?? data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch menu:', err);
        setLoading(false);
      });
  }, []);

  return { menuData, loading };
};

// ─── Sub-components ────────────────────────────────────────────────────────────
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={COLORS.primary} />
    <Text style={styles.loadingText}>Loading menu...</Text>
  </View>
);

const Header = ({ itemCount, onBackPress }) => (
  <View style={styles.header}>
    <TouchableOpacity
      style={styles.headerIconBtn}
      onPress={onBackPress}
      activeOpacity={0.7}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Text style={styles.backIcon}>←</Text>
    </TouchableOpacity>

    <View style={styles.headerTitleBlock}>
      <Text style={styles.headerTitle}>Canteen Menu</Text>
      <Text style={styles.headerSubtitle}>{itemCount} items</Text>
    </View>

    {/* Spacer to keep title centered */}
    <View style={styles.headerIconBtn} />
  </View>
);

const SearchBar = ({ value, onChangeText, onClear }) => (
  <View style={styles.searchBar}>
    <Text style={styles.searchIcon}>🔍</Text>
    <TextInput
      style={styles.searchInput}
      placeholder="Search food items..."
      placeholderTextColor={COLORS.textFaint}
      value={value}
      onChangeText={onChangeText}
    />
    {value.length > 0 && (
      <TouchableOpacity
        onPress={onClear}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.clearIcon}>✕</Text>
      </TouchableOpacity>
    )}
  </View>
);

const CanteenDropdownButton = ({ selectedCanteen, isOpen, onPress }) => (
  <TouchableOpacity
    style={[styles.dropdownButton, isOpen && styles.dropdownButtonActive]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Text style={styles.canteenIcon}>🏪</Text>
    <Text style={styles.selectedCanteenText} numberOfLines={1}>
      {selectedCanteen}
    </Text>
    <Text style={[styles.dropdownArrow, isOpen && styles.dropdownArrowOpen]}>
      ▼
    </Text>
  </TouchableOpacity>
);

const ResultsBar = ({ count, hasFilter, onClearFilter }) => (
  <View style={styles.resultsInfo}>
    <Text style={styles.resultsText}>
      {count} {count === 1 ? 'item' : 'items'} found
    </Text>
    {hasFilter && (
      <TouchableOpacity onPress={onClearFilter}>
        <Text style={styles.clearFilterText}>Clear filter ✕</Text>
      </TouchableOpacity>
    )}
  </View>
);

const MenuItemCard = ({ item }) => {
  const availabilityStyle = {
    backgroundColor: item.available ? COLORS.availableBg : COLORS.unavailableBg,
  };
  const availabilityTextStyle = {
    color: item.available ? COLORS.availableText : COLORS.unavailableText,
  };

  return (
    <TouchableOpacity style={styles.menuCard} activeOpacity={0.88} onPress={() => {}}>
      <View style={styles.imageWrapper}>
        <Image
          style={styles.foodImage}
          source={{ uri: item.image || 'https://via.placeholder.com/150' }}
        />
        <View style={[styles.availabilityBadge, availabilityStyle]}>
          <Text style={[styles.availabilityText, availabilityTextStyle]}>
            {item.available ? 'Available' : 'Unavailable'}
          </Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.canteenName} numberOfLines={1}>{item.canteen}</Text>
        <Text style={styles.price}>₹{item.price}</Text>
      </View>
    </TouchableOpacity>
  );
};

const EmptyState = () => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyIcon}>🍽️</Text>
    <Text style={styles.emptyText}>No items found</Text>
    <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
  </View>
);

const CanteenDropdownOverlay = ({ selectedCanteen, onSelect, onDismiss }) => (
  <TouchableOpacity
    style={styles.overlay}
    activeOpacity={1}
    onPress={onDismiss}
  >
    <View style={styles.overlayDropdown}>
      {CANTEENS.map((canteen, index) => {
        const isSelected = selectedCanteen === canteen;
        return (
          <TouchableOpacity
            key={index}
            style={[styles.dropdownItem, isSelected && styles.selectedDropdownItem]}
            onPress={() => onSelect(canteen)}
          >
            <Text style={[
              styles.dropdownItemText,
              isSelected && styles.selectedDropdownItemText,
            ]}>
              {canteen}
            </Text>
            {isSelected && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        );
      })}
    </View>
  </TouchableOpacity>
);

// ─── Main Screen ───────────────────────────────────────────────────────────────
const CanteenMenuScreen = ({ navigation }) => {
  const { menuData, loading } = useMenuData();

  const [searchQuery,       setSearchQuery]       = useState('');
  const [selectedCanteen,   setSelectedCanteen]   = useState('All Canteens');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const filteredItems = useMemo(() => {
    if (!Array.isArray(menuData)) return [];

    const query = searchQuery.toLowerCase();
    return menuData.filter((item) => {
      const matchesSearch   = !query || item?.name?.toLowerCase().includes(query);
      const matchesCanteen  = selectedCanteen === 'All Canteens' || item?.canteen === selectedCanteen;
      return matchesSearch && matchesCanteen;
    });
  }, [searchQuery, selectedCanteen, menuData]);

  const handleCanteenSelect = (canteen) => {
    setSelectedCanteen(canteen);
    setIsDropdownVisible(false);
  };

  const handleClearFilter = () => setSelectedCanteen('All Canteens');

  const handleGoBack = () => {
    if (navigation?.canGoBack()) navigation.goBack();
  };

  if (loading) return <LoadingScreen />;

  const ListHeader = () => (
    <>
      <View style={styles.searchSection}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
        />
        <CanteenDropdownButton
          selectedCanteen={selectedCanteen}
          isOpen={isDropdownVisible}
          onPress={() => setIsDropdownVisible(true)}
        />
      </View>
      <ResultsBar
        count={filteredItems.length}
        hasFilter={selectedCanteen !== 'All Canteens'}
        onClearFilter={handleClearFilter}
      />
    </>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <Header itemCount={menuData.length} onBackPress={handleGoBack} />

      <View style={styles.listWrapper}>
        <FlatList
          data={filteredItems}
          renderItem={({ item }) => <MenuItemCard item={item} />}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          ListHeaderComponent={<ListHeader />}
          ListEmptyComponent={<EmptyState />}
          contentContainerStyle={styles.menuList}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />
      </View>

      {isDropdownVisible && (
        <CanteenDropdownOverlay
          selectedCanteen={selectedCanteen}
          onSelect={handleCanteenSelect}
          onDismiss={() => setIsDropdownVisible(false)}
        />
      )}
    </SafeAreaView>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listWrapper: {
    zIndex: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
  },

  // Header
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingTop: 10,
    elevation: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: COLORS.white,
    fontWeight: '700',
    lineHeight: 22,
  },
  headerTitleBlock: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: 11,
    color: COLORS.primarySubtitle,
    marginTop: 1,
  },

  // Search & Filter
  searchSection: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 14,
    elevation: 10,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 9,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    padding: 0,
    lineHeight: 18,
  },
  clearIcon: {
    fontSize: 14,
    color: COLORS.textFaint,
    paddingLeft: 10,
  },

  // Canteen Dropdown
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1.5,
    borderColor: COLORS.borderStrong,
  },
  dropdownButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  canteenIcon: {
    fontSize: 16,
    marginRight: 9,
  },
  selectedCanteenText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  dropdownArrow: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginLeft: 8,
  },
  dropdownArrowOpen: {
    color: COLORS.primary,
    transform: [{ rotate: '180deg' }],
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  selectedDropdownItem: {
    backgroundColor: COLORS.primaryFaint,
  },
  dropdownItemText: {
    fontSize: 14,
    color: COLORS.textDropdown,
  },
  selectedDropdownItemText: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  checkmark: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '700',
  },

  // Results bar
  resultsInfo: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultsText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  clearFilterText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Menu Grid
  menuList: {
    paddingHorizontal: 12,
    paddingBottom: 30,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  menuCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 6,
  },
  imageWrapper: {
    position: 'relative',
  },
  foodImage: {
    width: '100%',
    height: 130,
    resizeMode: 'cover',
  },
  availabilityBadge: {
    position: 'absolute',
    top: 7,
    right: 7,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  availabilityText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  cardContent: {
    padding: 11,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 3,
  },
  canteenName: {
    fontSize: 11,
    color: COLORS.textCanteen,
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 14,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 13,
    color: COLORS.textFaint,
    textAlign: 'center',
  },

  // Overlay
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.overlayBg,
    justifyContent: 'flex-start',
  },
  overlayDropdown: {
    marginTop: 170,
    marginHorizontal: 14,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingVertical: 6,
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
});

export default CanteenMenuScreen;
