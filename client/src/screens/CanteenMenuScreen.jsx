import React, { useState, useMemo, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Dimensions,
} from 'react-native';
import { ActivityIndicator } from 'react-native';

const { width } = Dimensions.get('window');
const CANTEENS = [
  'All Canteens',
  'Satya Canteen',
  'Pencil Canteen',
  'Aparna Canteen',
];
const CanteenMenuScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCanteen, setSelectedCanteen] = useState('All Canteens');
  const [showCanteenDropdown, setShowCanteenDropdown] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [menuData, setMenuData] = useState([]);
 const [loading, setLoading] = useState(true);

useEffect(() => {
  fetch("http://192.168.1.7:5000/menu")
    .then(res => res.json())
    .then(data => {
      console.log("API DATA:", data);
      setMenuData(data.data || data);
      setLoading(false);   
    })
    .catch(err => {
      console.log(err);
      setLoading(false);
    });
}, []);

const filteredItems = useMemo(() => {
  if (!Array.isArray(menuData)) return [];

  return menuData.filter((item) => {
    const q = searchQuery.toLowerCase();

    return (
      (!q || (item?.name && item.name.toLowerCase().includes(q))) &&
      (selectedCanteen === 'All Canteens' || item?.canteen === selectedCanteen)
    );
  });
}, [searchQuery, selectedCanteen, menuData]);
if (loading) {
  return (
    <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
      <ActivityIndicator size="large" color="#6B46C1" />
      <Text style={{ marginTop:10 }}>Loading menu...</Text>
    </View>
  );
}

  const handleCanteenSelect = (canteen) => {
    setSelectedCanteen(canteen);
    setShowCanteenDropdown(false);
  };

  const clearSearch = () => setSearchQuery('');

  const goBack = () => {
    if (navigation?.canGoBack()) {
      navigation.goBack();
    }
  };
  const renderMenuItem = ({ item }) => (
    <TouchableOpacity
      style={styles.menuCard}
      activeOpacity={0.88}
      onPress={() => {}}
    >
      <View style={styles.imageWrapper}>
        <Image source={{ uri: item.image || 'https://via.placeholder.com/150' }} />
        <View
          style={[
            styles.availabilityBadge,
            { backgroundColor: item.available ? '#E8F5E9' : '#FFEBEE' },
          ]}
        >
          <Text
            style={[
              styles.availabilityText,
              { color: item.available ? '#2E7D32' : '#C62828' },
            ]}
          >
            {item.available ? 'Available' : 'Unavailable'}
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
  const renderDropdownItem = (canteen, index) => {
    const isSelected = selectedCanteen === canteen;
    const isLast = index === CANTEENS.length - 1;
    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.dropdownItem,
          isSelected && styles.selectedDropdownItem,
          isLast && { borderBottomWidth: 0 },
        ]}
        onPress={() => handleCanteenSelect(canteen)}
        activeOpacity={0.7}
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
  };
  const ListHeader = () => (
    <>
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search food items..."
            placeholderTextColor="#aaa"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.canteenSelector}>
          <TouchableOpacity
            style={[
              styles.dropdownButton,
              showCanteenDropdown && styles.dropdownButtonActive,
            ]}
            onPress={() => setShowOverlay(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.canteenIcon}>🏪</Text>
            <Text style={styles.selectedCanteenText} numberOfLines={1}>
              {selectedCanteen}
            </Text>
            <Text
              style={[
                styles.dropdownArrow,
                showCanteenDropdown && styles.dropdownArrowOpen,
              ]}
            >
              ▼
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.resultsInfo}>
        <Text style={styles.resultsText}>
          {filteredItems.length}{' '}
          {filteredItems.length === 1 ? 'item' : 'items'} found
        </Text>
        {selectedCanteen !== 'All Canteens' && (
          <TouchableOpacity onPress={() => setSelectedCanteen('All Canteens')}>
            <Text style={styles.clearFilterText}>Clear filter ✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );
  const EmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🍽️</Text>
      <Text style={styles.emptyText}>No items found</Text>
      <Text style={styles.emptySubtext}>
        Try adjusting your search or filters
      </Text>
    </View>
  );
  return (
    <SafeAreaView style={styles.container} edges={['left','right','bottom']}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={goBack}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerTitleBlock}>
          <Text style={styles.headerTitle}>Canteen Menu</Text>
          <Text style={styles.headerSubtitle}>{menuData.length} items</Text>
        </View>

        <View style={styles.headerIconBtn} />
      </View>
      <View style={styles.listWrapper}>
        <FlatList
          data={filteredItems}
          renderItem={renderMenuItem}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          ListHeaderComponent={<ListHeader />}
          ListEmptyComponent={<EmptyComponent />}
          contentContainerStyle={styles.menuList}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />
      </View>
      {showOverlay && (
  <TouchableOpacity
    style={styles.overlay}
    activeOpacity={1}
    onPress={() => setShowOverlay(false)}
  >
    <View style={styles.overlayDropdown}>
      {CANTEENS.map((canteen, index) => {
        const isSelected = selectedCanteen === canteen;

        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.dropdownItem,
              isSelected && styles.selectedDropdownItem,
            ]}
            onPress={() => {
              setSelectedCanteen(canteen);
              setShowOverlay(false);
            }}
          >
            <Text style={styles.dropdownItemText}>{canteen}</Text>
            {isSelected && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        );
      })}
    </View>
  </TouchableOpacity>
)}
    </SafeAreaView>
  );
};
const CARD_WIDTH = (width - 36) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#6B46C1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    elevation: 6,
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  marginTop: 0,
  paddingTop: 10,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#FFF',
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
    color: '#FFF',
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 1,
  },
 listWrapper: {
  zIndex: 0,
}, 
  searchSection: {
    backgroundColor: '#FFF',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  zIndex: 9999,
  elevation: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 9,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    padding: 0,
    lineHeight: 18,
  },
  clearIcon: {
    fontSize: 14,
    color: '#aaa',
    paddingLeft: 10,
  },
  canteenSelector: {
  position: 'relative',
  zIndex: 9999,
},
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
  },
  dropdownButtonActive: {
    borderColor: '#6B46C1',
    backgroundColor: '#FAF7FF',
  },
  canteenIcon: {
    fontSize: 16,
    marginRight: 9,
  },
  selectedCanteenText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  dropdownArrow: {
    fontSize: 10,
    color: '#888',
    marginLeft: 8,
  },
  dropdownArrowOpen: {
    color: '#6B46C1',
    transform: [{ rotate: '180deg' }],
  },
 dropdown: {
  position: 'absolute',
  top: 55,
  left: 0,
  right: 0,
  backgroundColor: '#FFF',
  borderRadius: 14,

  elevation: 20,        
  zIndex: 9999,         
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 6,
},
  dropdownScroll: {
    maxHeight: 220,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  selectedDropdownItem: {
    backgroundColor: '#F3E8FF',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#444',
  },
  selectedDropdownItemText: {
    fontWeight: '600',
    color: '#6B46C1',
  },
  checkmark: {
    fontSize: 16,
    color: '#6B46C1',
    fontWeight: '700',
  },
  resultsInfo: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#F5F5F5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultsText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  clearFilterText: {
    fontSize: 12,
    color: '#6B46C1',
    fontWeight: '600',
  },

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
    backgroundColor: '#FFF',
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
    color: '#1A1A1A',
    marginBottom: 3,
  },
  canteenName: {
    fontSize: 11,
    color: '#999',
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: '#6B46C1',
  },
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
    color: '#333',
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#aaa',
    textAlign: 'center',
  },
  overlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.2)',
  justifyContent: 'flex-start',
},

overlayDropdown: {
  marginTop: 170, // adjust if needed
  marginHorizontal: 14,
  backgroundColor: '#FFF',
  borderRadius: 14,
  paddingVertical: 6,

  elevation: 12,
  shadowColor: '#000',
  shadowOpacity: 0.2,
  shadowRadius: 6,
},
});

export default CanteenMenuScreen;
