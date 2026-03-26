import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

// Mock data for canteen menu items
const MENU_DATA = [
  {
    id: '1',
    name: 'Chicken Biryani',
    price: 120,
    canteen: 'Satya Canteen',
    available: true,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400',
  },
  {
    id: '2',
    name: 'Veg Fried Rice',
    price: 80,
    canteen: 'Satya Canteen',
    available: true,
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400',
  },
  {
    id: '3',
    name: 'Dum Biryani',
    price: 150,
    canteen: 'Pencil Canteen',
    available: false,
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400',
  },
  {
    id: '4',
    name: 'Chicken Fry Piece',
    price: 100,
    canteen: 'Aparna Canteen',
    available: true,
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400',
  },
  {
    id: '5',
    name: 'Egg Fried Rice',
    price: 90,
    canteen: 'Satya Canteen',
    available: true,
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
  },
  {
    id: '6',
    name: 'Paneer Biryani',
    price: 110,
    canteen: 'Pencil Canteen',
    available: true,
    image: 'https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=400',
  },
  {
    id: '7',
    name: 'Mutton Biryani',
    price: 180,
    canteen: 'Aparna Canteen',
    available: false,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400',
  },
  {
    id: '8',
    name: 'Schezwan Fried Rice',
    price: 95,
    canteen: 'Pencil Canteen',
    available: true,
    image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400',
  },
  {
    id: '9',
    name: 'Fish Fry',
    price: 130,
    canteen: 'Satya Canteen',
    available: true,
    image: 'https://images.unsplash.com/photo-1580217593608-61931cefc821?w=400',
  },
  {
    id: '10',
    name: 'Prawn Biryani',
    price: 200,
    canteen: 'Aparna Canteen',
    available: true,
    image: 'https://images.unsplash.com/photo-1633945274309-62e1d4f8651d?w=400',
  },
  {
    id: '11',
    name: 'Chicken 65',
    price: 140,
    canteen: 'Pencil Canteen',
    available: true,
    image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=400',
  },
  {
    id: '12',
    name: 'Mixed Fried Rice',
    price: 105,
    canteen: 'Aparna Canteen',
    available: false,
    image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400',
  },
];

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

  // Filter menu items based on search and canteen selection
  const filteredItems = useMemo(() => {
    return MENU_DATA.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCanteen =
        selectedCanteen === 'All Canteens' || item.canteen === selectedCanteen;
      return matchesSearch && matchesCanteen;
    });
  }, [searchQuery, selectedCanteen]);

  const handleCanteenSelect = (canteen) => {
    setSelectedCanteen(canteen);
    setShowCanteenDropdown(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const goBack = () => {
    navigation.goBack();
    // or navigation.navigate('Home');
  };

  const renderMenuItem = ({ item }) => (
    <TouchableOpacity style={styles.menuCard} activeOpacity={0.9}>
      <Image source={{ uri: item.image }} style={styles.foodImage} />

      <View style={styles.cardContent}>
        <Text style={styles.itemName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.canteenName} numberOfLines={1}>
          {item.canteen}
        </Text>

        <View style={styles.cardFooter}>
          <Text style={styles.price}>₹{item.price}</Text>
          <View
            style={[
              styles.availabilityBadge,
              {
                backgroundColor: item.available ? '#E8F5E9' : '#FFEBEE',
              },
            ]}>
            <Text
              style={[
                styles.availabilityText,
                {
                  color: item.available ? '#2E7D32' : '#C62828',
                },
              ]}>
              {item.available ? 'Available' : 'Not Available'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderDropdownItem = (canteen, index) => {
    const isSelected = selectedCanteen === canteen;
    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.dropdownItem,
          isSelected && styles.selectedDropdownItem,
        ]}
        onPress={() => handleCanteenSelect(canteen)}>
        <Text
          style={[
            styles.dropdownItemText,
            isSelected && styles.selectedDropdownItemText,
          ]}>
          {canteen}
        </Text>
        {isSelected && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6B46C1" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Canteen Menu</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search and Filter Section */}
      <View style={styles.searchSection}>
        {/* Food Item Search Bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search food items..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Canteen Selector */}
        <View style={styles.canteenSelector}>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowCanteenDropdown(!showCanteenDropdown)}>
            <Text style={styles.canteenIcon}>🏪</Text>
            <Text style={styles.selectedCanteen} numberOfLines={1}>
              {selectedCanteen}
            </Text>
            <Text
              style={[
                styles.dropdownIcon,
                showCanteenDropdown && styles.dropdownIconOpen,
              ]}>
              ▼
            </Text>
          </TouchableOpacity>

          {showCanteenDropdown && (
            <View style={styles.dropdown}>
              <ScrollView
                style={styles.dropdownScroll}
                nestedScrollEnabled={true}>
                {CANTEENS.map((canteen, index) =>
                  renderDropdownItem(canteen, index)
                )}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      {/* Results Info */}
      <View style={styles.resultsInfo}>
        <Text style={styles.resultsText}>
          {filteredItems.length}{' '}
          {filteredItems.length === 1 ? 'item' : 'items'} found
        </Text>
      </View>

      {/* Menu Items Grid */}
      <FlatList
        data={filteredItems}
        renderItem={renderMenuItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.menuList}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🍽️</Text>
            <Text style={styles.emptyText}>No items found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your search or filters
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

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
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 4,
  },
  backIcon: {
    fontSize: 28,
    color: '#FFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 36,
  },
  searchSection: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    padding: 0,
  },
  clearIcon: {
    fontSize: 18,
    color: '#999',
    paddingLeft: 10,
  },
  canteenSelector: {
    position: 'relative',
    zIndex: 1000,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  canteenIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  selectedCanteen: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  dropdownIcon: {
    fontSize: 10,
    color: '#666',
    marginLeft: 8,
  },
  dropdownIconOpen: {
    transform: [{ rotate: '180deg' }],
  },
  dropdown: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderRadius: 12,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    maxHeight: 200,
    zIndex: 2000,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedDropdownItem: {
    backgroundColor: '#F3E8FF',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#333',
  },
  selectedDropdownItemText: {
    fontWeight: '600',
    color: '#6B46C1',
  },
  checkmark: {
    fontSize: 18,
    color: '#6B46C1',
    fontWeight: 'bold',
  },
  resultsInfo: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  menuList: {
    padding: 12,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  menuCard: {
    width: (width - 36) / 2,
    marginBottom: 12,
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  foodImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  canteenName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'column',
    gap: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: '800',
    color: '#6B46C1',
  },
  availabilityBadge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  availabilityText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
});

export default CanteenMenuScreen;