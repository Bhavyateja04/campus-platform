import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Dimensions,
  Animated,
  Modal,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Constants ───────────────────────────────────────────────────────────────

const { width } = Dimensions.get('window');
const CARD_W = (width - 48) / 2;

const G = {
  green:      '#16A34A',
  greenLight: '#DCFCE7',
  greenDark:  '#15803D',
  greenMid:   '#22C55E',
  bg:         '#F8FAF8',
  white:      '#FFFFFF',
  card:       '#FFFFFF',
  border:     '#E5E7EB',
  text:       '#111827',
  textMid:    '#374151',
  textLight:  '#9CA3AF',
  whatsapp:   '#25D366',
  red:        '#EF4444',
};

const CATEGORIES = [
  { id: 0, label: 'All',                icon: '🛍️' },
  { id: 1, label: 'Textbooks',          icon: '📚' },
  { id: 2, label: 'Casios',             icon: '🖩'  },
  { id: 3, label: 'Notes',              icon: '📝' },
  { id: 4, label: 'Engineering Drawing',icon: '📐' },
];

const SELL_CATEGORIES = [
  '📚 Textbooks',
  '🖩 Calculators',
  '📝 Notes',
  '📐 Drawing Tools',
  '🎒 Other Items',
];

const NAV_ITEMS = [
  { id: 'home',    icon: '🏠', label: 'Home'    },
  { id: 'sell',    icon: '➕', label: 'Sell'    },
  { id: 'chat',    icon: '💬', label: 'Chat'    },
  { id: 'profile', icon: '👤', label: 'Profile' },
];

const EMPTY_FORM = { title: '', price: '', category: '', name: '', phone: '' };

// ─── SellModal ────────────────────────────────────────────────────────────────

const SellModal = ({ visible, onClose, onSelectCategory }) => {
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const toSlide = visible ? 0   : 300;
    const toFade  = visible ? 1   : 0;
    const dur     = visible ? undefined : 200;

    Animated.parallel([
      visible
        ? Animated.spring(slideAnim, { toValue: toSlide, friction: 8, tension: 60, useNativeDriver: true })
        : Animated.timing(slideAnim, { toValue: toSlide, duration: dur, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: toFade, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />
        <Animated.View style={[styles.sellSheet, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sellTitle}>List an Item</Text>
          <Text style={styles.sellSub}>Sell your unused stuff to fellow students</Text>

          {SELL_CATEGORIES.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={styles.sellOption}
              onPress={() => onSelectCategory(item)}
            >
              <Text style={styles.sellOptionTxt}>{item}</Text>
              <Text style={{ color: G.textLight }}>›</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.sellCancelBtn} onPress={onClose}>
            <Text style={styles.sellCancelTxt}>Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// ─── ContactModal ─────────────────────────────────────────────────────────────

const ContactModal = ({ visible, product, onClose }) => {
  const slideAnim = useRef(new Animated.Value(400)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      visible
        ? Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 60, useNativeDriver: true })
        : Animated.timing(slideAnim, { toValue: 400, duration: 220, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: visible ? 1 : 0, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [visible]);

  if (!visible || !product) return null;

  const { seller, title, price } = product;
  const handleCall = () => Linking.openURL(`tel:${seller.phone}`);

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />
        <Animated.View style={[styles.contactSheet, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.sheetHandle} />

          {/* Product summary */}
          <View style={styles.contactProductRow}>
            <View style={[styles.contactProductImg, { backgroundColor: product.bg }]}>
              <Text style={{ fontSize: 28 }}>{product.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactProductTitle} numberOfLines={2}>{title}</Text>
              <Text style={styles.contactProductPrice}>₹{price}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Seller details */}
          <Text style={styles.contactSectionLabel}>SELLER DETAILS</Text>
          <View style={styles.sellerCard}>
            <View style={styles.sellerAvatar}>
              <Text style={styles.sellerAvatarTxt}>{seller.name.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sellerName}>{seller.name}</Text>
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedTxt}>✓ Verified Student</Text>
              </View>
            </View>
          </View>

          <View style={styles.sellerInfoRow}>
            <Text style={styles.sellerInfoLabel}>📞</Text>
            <Text style={styles.sellerInfoVal}>{seller.phone}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.contactBtnsRow}>
            <TouchableOpacity style={[styles.contactBtn, styles.callBtn]} onPress={handleCall}>
              <Text style={styles.contactBtnIcon}>📞</Text>
              <Text style={styles.contactBtnTxt}>Call</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnTxt}>Close</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// ─── AddItemForm ──────────────────────────────────────────────────────────────

const AddItemForm = ({ newItem, onChange, onSubmit, onClose }) => (
  <View style={styles.formContainer}>
    <Text style={styles.formTitle}>Add Item</Text>

    <TextInput
      placeholder="Item Name"
      value={newItem.title}
      onChangeText={(text) => onChange({ ...newItem, title: text })}
      style={styles.formInput}
    />
    <TextInput
      placeholder="Price"
      keyboardType="numeric"
      value={newItem.price}
      onChangeText={(text) => onChange({ ...newItem, price: text })}
      style={styles.formInput}
    />
    <TextInput
      placeholder="Your Name"
      value={newItem.name}
      onChangeText={(text) => onChange({ ...newItem, name: text })}
      style={styles.formInput}
    />
    <TextInput
      placeholder="Phone Number"
      keyboardType="phone-pad"
      value={newItem.phone}
      onChangeText={(text) => onChange({ ...newItem, phone: text })}
      style={styles.formInput}
    />

    <TouchableOpacity style={styles.formSubmitBtn} onPress={onSubmit}>
      <Text style={styles.formSubmitTxt}>Submit</Text>
    </TouchableOpacity>

    <TouchableOpacity onPress={onClose}>
      <Text style={styles.formCloseTxt}>Close</Text>
    </TouchableOpacity>
  </View>
);

// ─── ProductCard ──────────────────────────────────────────────────────────────

const ProductCard = ({ item, onBuy }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn  = () => Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true }).start();
  const handlePressOut = () => Animated.spring(scaleAnim, { toValue: 1,    useNativeDriver: true }).start();

  const discount = item.originalPrice > 0
    ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
    : 0;

  const conditionStyle = item.condition === 'Like New'
    ? { badge: { backgroundColor: G.greenLight }, text: { color: G.green } }
    : item.condition === 'New'
    ? { badge: { backgroundColor: '#DBEAFE' },    text: { color: '#2563EB' } }
    : {};

  return (
    <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity activeOpacity={1} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <View style={[styles.cardImg, { backgroundColor: item.bg }]}>
          <Text style={styles.cardIcon}>{item.icon}</Text>

          {discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountTxt}>{discount}% OFF</Text>
            </View>
          )}

          <View style={[styles.conditionBadge, conditionStyle.badge]}>
            <Text style={[styles.conditionTxt, conditionStyle.text]}>{item.condition}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.cardPrice}>₹{item.price}</Text>
            {item.originalPrice > 0 && (
              <Text style={styles.originalPrice}>₹{item.originalPrice}</Text>
            )}
          </View>
          <TouchableOpacity style={styles.buyBtn} onPress={() => onBuy(item)} activeOpacity={0.85}>
            <Text style={styles.buyBtnTxt}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── MarketplaceScreen ────────────────────────────────────────────────────────

export default function MarketplaceScreen({ navigation }) {
  const [products,       setProducts]       = useState([]);
  const [newItem,        setNewItem]        = useState(EMPTY_FORM);
  const [search,         setSearch]         = useState('');
  const [selectedCat,    setSelectedCat]    = useState(0);
  const [selectedProd,   setSelectedProd]   = useState(null);
  const [contactVisible, setContactVisible] = useState(false);
  const [sellVisible,    setSellVisible]    = useState(false);
  const [formVisible,    setFormVisible]    = useState(false);
  const [activeNav,      setActiveNav]      = useState('home');

  // Fetch listings on mount
  useEffect(() => {
    fetch('https://your-api.com/get-items')
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error('Failed to fetch items:', err));
  }, []);

  // Filter products by category and search query
  const filtered = products.filter((p) => {
    const matchCat    = selectedCat === 0 || p.category === CATEGORIES[selectedCat].label;
    const matchSearch = !search.trim() ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // Open contact modal for a product
  const handleBuy = (item) => {
    setSelectedProd(item);
    setContactVisible(true);
  };

  // Submit a new listing
  const handleAddItem = async () => {
    try {
      const response = await fetch('https://your-api.com/add-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:      newItem.title,
          price:      newItem.price,
          category:   newItem.category,
          sellerName: newItem.name,
          phone:      newItem.phone,
        }),
      });
      const data = await response.json();
      setProducts((prev) => [data, ...prev]);
      setNewItem(EMPTY_FORM);
      setFormVisible(false);
    } catch (err) {
      console.error('Failed to add item:', err);
    }
  };

  // Handle bottom nav taps
  const handleNav = (id) => {
    setActiveNav(id);
    if (id === 'sell') setSellVisible(true);
  };

  // When a sell category is picked, open the add-item form
  const handleSelectSellCategory = (categoryLabel) => {
    const cleanCategory = categoryLabel.split(' ').slice(1).join(' ');
    setNewItem((prev) => ({ ...prev, category: cleanCategory }));
    setSellVisible(false);
    setFormVisible(true);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={G.bg} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Good Morning 👋</Text>
            <Text style={styles.headerTitle}>Student Market</Text>
          </View>
          <View style={styles.notifBtn}>
            <Text style={{ fontSize: 20 }}>🔔</Text>
            <View style={styles.notifDot} />
          </View>
        </View>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search books, notes, calculators..."
            placeholderTextColor={G.textLight}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={{ color: G.textLight, fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.catScroll}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 2 }}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.catChip, selectedCat === cat.id && styles.catChipActive]}
              onPress={() => setSelectedCat(cat.id)}
              activeOpacity={0.75}
            >
              <Text style={styles.catChipIcon}>{cat.icon}</Text>
              <Text style={[styles.catChipTxt, selectedCat === cat.id && styles.catChipTxtActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Product Grid ── */}
      <ScrollView
        style={styles.body}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>
            {selectedCat === 0 ? 'All Items' : CATEGORIES[selectedCat].label}
          </Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeTxt}>{filtered.length} listings</Text>
          </View>
        </View>

        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📭</Text>
            <Text style={styles.emptyTitle}>No items found</Text>
            <Text style={styles.emptySub}>Try a different category or search term</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filtered.map((item, idx) => (
              <View
                key={item.id}
                style={[styles.gridItem, idx % 2 === 0 ? { paddingRight: 6 } : { paddingLeft: 6 }]}
              >
                <ProductCard item={item} onBuy={handleBuy} />
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ── Bottom Navigation ── */}
      <View style={styles.bottomNav}>
        {NAV_ITEMS.map((nav) => (
          <TouchableOpacity
            key={nav.id}
            style={[styles.navItem, nav.id === 'sell' && styles.navSellItem]}
            onPress={() => handleNav(nav.id)}
            activeOpacity={0.75}
          >
            {nav.id === 'sell' ? (
              <View style={styles.navSellBtn}>
                <Text style={{ fontSize: 22 }}>{nav.icon}</Text>
              </View>
            ) : (
              <>
                <Text style={[styles.navIcon, activeNav === nav.id && styles.navIconActive]}>
                  {nav.icon}
                </Text>
                <Text style={[styles.navLabel, activeNav === nav.id && styles.navLabelActive]}>
                  {nav.label}
                </Text>
                {activeNav === nav.id && <View style={styles.navDot} />}
              </>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Modals & Forms ── */}
      <ContactModal
        visible={contactVisible}
        product={selectedProd}
        onClose={() => setContactVisible(false)}
      />

      <SellModal
        visible={sellVisible}
        onClose={() => setSellVisible(false)}
        onSelectCategory={handleSelectSellCategory}
      />

      {formVisible && (
        <AddItemForm
          newItem={newItem}
          onChange={setNewItem}
          onSubmit={handleAddItem}
          onClose={() => setFormVisible(false)}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: G.bg },

  // Header
  header:      { backgroundColor: G.white, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: G.border, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
  headerTop:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12 },
  greeting:    { fontSize: 12, color: G.textLight },
  headerTitle: { fontSize: 22, fontWeight: '700', color: G.text, letterSpacing: -0.3 },
  notifBtn:    { width: 42, height: 42, borderRadius: 21, backgroundColor: G.bg, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  notifDot:    { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: G.red, borderWidth: 1.5, borderColor: G.white },

  // Search
  searchBar:   { flexDirection: 'row', alignItems: 'center', backgroundColor: G.bg, borderRadius: 12, marginHorizontal: 16, paddingHorizontal: 12, paddingVertical: 10, gap: 8, marginBottom: 12 },
  searchIcon:  { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 14, color: G.text, padding: 0 },

  // Categories
  catScroll:        {},
  catChip:          { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: G.bg, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: G.border },
  catChipActive:    { backgroundColor: G.greenLight, borderColor: G.green },
  catChipIcon:      { fontSize: 14 },
  catChipTxt:       { fontSize: 13, color: G.textMid, fontWeight: '500' },
  catChipTxtActive: { color: G.green, fontWeight: '600' },

  // Body / Grid
  body:          { flex: 1, paddingHorizontal: 16, paddingTop: 14 },
  sectionRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle:  { fontSize: 16, fontWeight: '600', color: G.text },
  countBadge:    { backgroundColor: G.greenLight, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  countBadgeTxt: { fontSize: 12, color: G.green, fontWeight: '500' },
  grid:          { flexDirection: 'row', flexWrap: 'wrap' },
  gridItem:      { width: '50%', marginBottom: 12 },

  // Product card
  card:    { backgroundColor: G.card, borderRadius: 14, overflow: 'hidden', borderWidth: 0.5, borderColor: G.border, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8 },
  cardImg: { height: 120, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  cardIcon:{ fontSize: 48 },

  discountBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#FEF2F2', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2 },
  discountTxt:   { fontSize: 9, color: G.red, fontWeight: '700' },
  conditionBadge:{ position: 'absolute', bottom: 8, right: 8, backgroundColor: '#F3F4F6', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2 },
  conditionTxt:  { fontSize: 9, color: G.textMid, fontWeight: '500' },

  cardBody:      { padding: 10 },
  cardTitle:     { fontSize: 13, fontWeight: '500', color: G.text, marginBottom: 5, lineHeight: 18 },
  priceRow:      { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8 },
  cardPrice:     { fontSize: 15, fontWeight: '700', color: G.green },
  originalPrice: { fontSize: 11, color: G.textLight, textDecorationLine: 'line-through' },
  buyBtn:        { backgroundColor: G.green, borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  buyBtnTxt:     { color: '#fff', fontSize: 13, fontWeight: '600' },

  // Empty state
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: G.textMid, marginBottom: 6 },
  emptySub:   { fontSize: 13, color: G.textLight, textAlign: 'center' },

  // Bottom nav
  bottomNav:    { flexDirection: 'row', backgroundColor: G.white, borderTopWidth: 0.5, borderTopColor: G.border, paddingBottom: Platform.OS === 'ios' ? 20 : 8, paddingTop: 8, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  navItem:      { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2, position: 'relative' },
  navSellItem:  { justifyContent: 'center', alignItems: 'center' },
  navSellBtn:   { width: 52, height: 52, borderRadius: 26, backgroundColor: G.green, justifyContent: 'center', alignItems: 'center', marginTop: -20, elevation: 4, shadowColor: G.green, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
  navIcon:      { fontSize: 20 },
  navIconActive:{},
  navLabel:     { fontSize: 11, color: G.textLight },
  navLabelActive:{ color: G.green, fontWeight: '600' },
  navDot:       { width: 4, height: 4, borderRadius: 2, backgroundColor: G.green, marginTop: 1 },

  // Shared sheet styles
  overlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', alignSelf: 'center', marginBottom: 16 },
  divider:     { height: 0.5, backgroundColor: G.border, marginVertical: 14 },

  // Contact sheet
  contactSheet:        { backgroundColor: G.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: Platform.OS === 'ios' ? 36 : 24 },
  contactProductRow:   { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  contactProductImg:   { width: 58, height: 58, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  contactProductTitle: { fontSize: 14, fontWeight: '600', color: G.text, marginBottom: 4, flex: 1 },
  contactProductPrice: { fontSize: 18, fontWeight: '700', color: G.green },
  contactSectionLabel: { fontSize: 11, fontWeight: '700', color: G.textLight, letterSpacing: 1, marginBottom: 10 },

  sellerCard:      { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  sellerAvatar:    { width: 44, height: 44, borderRadius: 22, backgroundColor: G.greenLight, justifyContent: 'center', alignItems: 'center' },
  sellerAvatarTxt: { fontSize: 18, fontWeight: '700', color: G.green },
  sellerName:      { fontSize: 15, fontWeight: '600', color: G.text, marginBottom: 3 },
  verifiedBadge:   { backgroundColor: G.greenLight, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start' },
  verifiedTxt:     { fontSize: 10, color: G.green, fontWeight: '500' },

  sellerInfoRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  sellerInfoLabel: { fontSize: 16 },
  sellerInfoVal:   { fontSize: 13, color: G.textMid },

  contactBtnsRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  contactBtn:     { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 12, paddingVertical: 13 },
  callBtn:        { backgroundColor: G.greenLight },
  contactBtnIcon: { fontSize: 16 },
  contactBtnTxt:  { fontSize: 14, fontWeight: '600', color: G.text },
  closeBtn:       { backgroundColor: G.bg, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  closeBtnTxt:    { fontSize: 14, fontWeight: '500', color: G.textMid },

  // Sell sheet
  sellSheet:     { backgroundColor: G.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: Platform.OS === 'ios' ? 36 : 24 },
  sellTitle:     { fontSize: 20, fontWeight: '700', color: G.text, marginBottom: 4 },
  sellSub:       { fontSize: 13, color: G.textLight, marginBottom: 16 },
  sellOption:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: G.border },
  sellOptionTxt: { fontSize: 15, color: G.textMid },
  sellCancelBtn: { marginTop: 14, backgroundColor: G.bg, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  sellCancelTxt: { fontSize: 14, fontWeight: '500', color: G.textMid },

  // Add-item form
  formContainer: { position: 'absolute', top: 150, left: 20, right: 20, backgroundColor: G.white, padding: 20, borderRadius: 12, elevation: 10 },
  formTitle:     { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  formInput:     { borderBottomWidth: 1, borderBottomColor: G.border, marginBottom: 12, paddingVertical: 6, fontSize: 14, color: G.text },
  formSubmitBtn: { backgroundColor: G.green, padding: 12, borderRadius: 8, alignItems: 'center' },
  formSubmitTxt: { color: G.white, fontWeight: '600', fontSize: 14 },
  formCloseTxt:  { marginTop: 10, color: G.red, textAlign: 'center', fontSize: 14 },
});
