// ─── Imports ──────────────────────────────────────────────────────────────────
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
  Image,
  Alert,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { goodsApi } from '../services/api';

// ─── Constants ─────────────────────────────────────────────────────────────────
const { width } = Dimensions.get('window');

const H_PADDING = 16;
const CARD_GAP  = 10;
const CARD_W    = (width - H_PADDING * 2 - CARD_GAP) / 2;

const COLORS = {
  primary:      '#5F768A',
  primaryLight: '#DDE7EF',
  primaryDark:  '#344B5E',
  primaryMid:   '#8BA0B0',
  background:   '#F3F6F8',
  white:        '#FFFFFF',
  card:         '#FFFFFF',
  border:       '#D7E0E8',
  text:         '#102230',
  textMid:      '#41505F',
  textLight:    '#8091A1',
  red:          '#C45D5D',
  overlayBg:    'rgba(0,0,0,0.45)',
};

const ANIMATION = {
  sheetFriction: 8,
  sheetTension:  60,
  fadeMs:        200,
  slideOutMs:    220,
};

const PRODUCT_IMAGES = {
  textbooks:            'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1200&q=80',
  casios:               'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
  notes:                'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
  'engineering drawing':'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
  default:              'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
};

const CATEGORIES = [
  { id: 0, label: 'All',                  icon: 'ALL' },
  { id: 1, label: 'Textbooks',            icon: 'TXT' },
  { id: 2, label: 'Casios',               icon: 'CAL' },
  { id: 3, label: 'Notes',                icon: 'NTS' },
  { id: 4, label: 'Engineering Drawing',  icon: 'DRW' },
];

const SELL_CATEGORIES = [
  'Textbooks',
  'Calculators',
  'Notes',
  'Drawing Tools',
  'Other Items',
];

const NAV_ITEMS = [
  { id: 'home',    icon: 'HM', label: 'Home'    },
  { id: 'sell',    icon: 'SL', label: 'Sell'    },
  { id: 'chat',    icon: 'CH', label: 'Chat'    },
  { id: 'profile', icon: 'PR', label: 'Profile' },
];

const EMPTY_NEW_ITEM = {
  title:    '',
  price:    '',
  category: '',
  contact:  '',
  name:     '',
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
const resolveProductImage = (item) => {
  if (item?.image) return item.image;

  const text     = `${item?.category || ''} ${item?.title || ''}`.toLowerCase();
  const matchKey = Object.keys(PRODUCT_IMAGES).find(
    (key) => key !== 'default' && text.includes(key),
  );
  return PRODUCT_IMAGES[matchKey ?? 'default'];
};

const backendGoodsToUi = (g) => {
  if (!g?._id) return null;

  const title = g.title || g.itemName || '(Untitled)';
  return {
    id:            String(g._id),
    title,
    category:      g.category      || 'Textbooks',
    price:         Number(g.price) || 0,
    originalPrice: Number(g.originalPrice) || 0,
    icon:          'EX',
    bg:            '#EAF1F7',
    image:         resolveProductImage({ title, category: g.category, image: g.image || g.photoUrl }),
    condition:     g.condition     || 'Good',
    seller: {
      name:      g.seller?.name    || g.sellerName || 'Anonymous',
      phone:     g.phone           || g.contactNumber || '',
      email:     g.seller?.email   || '',
      whatsapp: (g.phone           || g.contactNumber || '').replace(/[^0-9]/g, ''),
    },
    _backend: true,
  };
};

// ─── Seed Data ─────────────────────────────────────────────────────────────────
const SEED_PRODUCTS = [
  {
    id: '1', title: 'Engineering Maths Vol.2', category: 'Textbooks',
    price: 180, originalPrice: 350, icon: 'BK', bg: '#EAF1F7', condition: 'Good',
    seller: { name: 'Arjun Sharma',  phone: '+91 98765 43210', email: 'arjun.sharma@campus.edu',  whatsapp: '919876543210' },
  },
  {
    id: '2', title: 'Casio FX-991EX', category: 'Casios',
    price: 650, originalPrice: 1200, icon: 'CAL', bg: '#DDE7EF', condition: 'Like New',
    seller: { name: 'Priya Nair',    phone: '+91 91234 56789', email: 'priya.nair@campus.edu',    whatsapp: '919123456789' },
  },
  {
    id: '3', title: 'DSA Handwritten Notes', category: 'Notes',
    price: 80, originalPrice: 0, icon: 'NTS', bg: '#EAF1F7', condition: 'New',
    seller: { name: 'Rohan Mehta',   phone: '+91 87654 32109', email: 'rohan.m@campus.edu',       whatsapp: '918765432109' },
  },
  {
    id: '4', title: 'Drawing Kit (Complete)', category: 'Engineering Drawing',
    price: 220, originalPrice: 450, icon: 'DRW', bg: '#DDE7EF', condition: 'Good',
    seller: { name: 'Sneha Patel',   phone: '+91 99887 76655', email: 'sneha.p@campus.edu',       whatsapp: '919988776655' },
  },
  {
    id: '5', title: 'Physics by HC Verma', category: 'Textbooks',
    price: 140, originalPrice: 280, icon: 'BK', bg: '#EAF1F7', condition: 'Acceptable',
    seller: { name: 'Vikram Singh',  phone: '+91 70000 11223', email: 'vikram.s@campus.edu',      whatsapp: '917000011223' },
  },
  {
    id: '6', title: 'Networks Short Notes', category: 'Notes',
    price: 60, originalPrice: 0, icon: 'NTS', bg: '#DDE7EF', condition: 'New',
    seller: { name: 'Ananya Rao',    phone: '+91 88990 12345', email: 'ananya.r@campus.edu',      whatsapp: '918899012345' },
  },
  {
    id: '7', title: 'Casio FX-82MS', category: 'Casios',
    price: 280, originalPrice: 600, icon: 'CAL', bg: '#EAF1F7', condition: 'Good',
    seller: { name: 'Karan Joshi',   phone: '+91 76543 21987', email: 'karan.j@campus.edu',       whatsapp: '917654321987' },
  },
  {
    id: '8', title: 'AutoCAD Drawing Set', category: 'Engineering Drawing',
    price: 180, originalPrice: 350, icon: 'DRW', bg: '#DDE7EF', condition: 'Like New',
    seller: { name: 'Divya Menon',   phone: '+91 93456 78901', email: 'divya.m@campus.edu',       whatsapp: '919345678901' },
  },
].map((item) => ({ ...item, image: resolveProductImage(item) }));

// ─── Shared Sheet Animation Hook ───────────────────────────────────────────────
const useSheetAnimation = (visible, slideStart = 300) => {
  const slideAnim = useRef(new Animated.Value(slideStart)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: ANIMATION.sheetFriction,
          tension:  ANIMATION.sheetTension,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: ANIMATION.fadeMs,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: slideStart,
          duration: ANIMATION.slideOutMs,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: ANIMATION.fadeMs,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return { slideAnim, fadeAnim };
};

// ─── Sub-components ────────────────────────────────────────────────────────────
const SheetHandle = () => <View style={styles.sheetHandle} />;

const SellModal = ({ visible, onClose, onSelectCategory }) => {
  const { slideAnim, fadeAnim } = useSheetAnimation(visible, 300);

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onClose}>
      <Animated.View style={[styles.overlayFill, { opacity: fadeAnim }]}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />
        <Animated.View style={[styles.sellSheet, { transform: [{ translateY: slideAnim }] }]}>
          <SheetHandle />
          <Text style={styles.sellTitle}>List an Item</Text>
          <Text style={styles.sellSub}>Sell your unused stuff to fellow students</Text>
          {SELL_CATEGORIES.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.sellOption}
              onPress={() => onSelectCategory(item)}
            >
              <Text style={styles.sellOptionTxt}>{item}</Text>
              <Text style={{ color: COLORS.textLight }}>›</Text>
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

const ContactModal = ({ visible, product, onClose }) => {
  const { slideAnim, fadeAnim } = useSheetAnimation(visible, 400);

  if (!visible || !product) return null;

  const { seller, title, price } = product;
  const handleCall = () => Linking.openURL(`tel:${seller.phone}`);

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onClose}>
      <Animated.View style={[styles.overlayFill, { opacity: fadeAnim }]}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />
        <Animated.View style={[styles.contactSheet, { transform: [{ translateY: slideAnim }] }]}>
          <SheetHandle />

          <View style={styles.contactProductRow}>
            <View style={styles.contactProductImg}>
              <Image source={{ uri: product.image }} style={styles.contactProductImage} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactProductTitle} numberOfLines={2}>{title}</Text>
              <Text style={styles.contactProductPrice}>₹{price}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.contactSectionLabel}>Seller details</Text>
          <View style={styles.sellerCard}>
            <View style={styles.sellerAvatar}>
              <Text style={styles.sellerAvatarTxt}>{seller.name.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sellerName}>{seller.name}</Text>
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedTxt}>Verified student</Text>
              </View>
            </View>
          </View>

          <View style={styles.sellerInfoRow}>
            <Text style={styles.sellerInfoVal}>{seller.phone}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.contactBtnsRow}>
            <TouchableOpacity style={[styles.contactBtn, styles.callBtn]} onPress={handleCall}>
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

const ProductCard = ({ item, onBuy }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn  = () =>
    Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true }).start();
  const handlePressOut = () =>
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();

  const discount = item.originalPrice > 0
    ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
    : 0;

  const conditionStyle = {
    'Like New': { bg: COLORS.primaryLight,  text: COLORS.primary     },
    'New':      { bg: '#DDE7EF',            text: COLORS.primaryDark },
  };
  const condition = conditionStyle[item.condition] || {};

  return (
    <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.cardImg}>
          <Image source={{ uri: item.image }} style={styles.cardImage} />
          {discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountTxt}>{discount}% OFF</Text>
            </View>
          )}
          <View style={[styles.conditionBadge, condition.bg && { backgroundColor: condition.bg }]}>
            <Text style={[styles.conditionTxt, condition.text && { color: condition.text }]}>
              {item.condition}
            </Text>
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

const AddItemModal = ({ visible, newItem, onChange, onSubmit, onClose }) => (
  <Modal
    transparent
    animationType="slide"
    visible={visible}
    onRequestClose={onClose}
  >
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.overlayFill} />
    </TouchableWithoutFeedback>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.formModalWrap}
    >
      <View style={styles.formCard}>
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
          value={newItem.contact}
          onChangeText={(text) => onChange({ ...newItem, contact: text })}
          style={styles.formInput}
        />

        <TouchableOpacity style={styles.formSubmit} onPress={onSubmit}>
          <Text style={styles.formSubmitTxt}>Submit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose} style={styles.formClose}>
          <Text style={styles.formCloseTxt}>Close</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  </Modal>
);

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function MarketplaceScreen({ navigation }) {
  const [products,        setProducts]        = useState(SEED_PRODUCTS);
  const [search,          setSearch]          = useState('');
  const [selectedCat,     setSelectedCat]     = useState(0);
  const [selectedProd,    setSelectedProd]    = useState(null);
  const [contactVisible,  setContactVisible]  = useState(false);
  const [sellVisible,     setSellVisible]     = useState(false);
  const [formVisible,     setFormVisible]     = useState(false);
  const [activeNav,       setActiveNav]       = useState('home');
  const [newItem,         setNewItem]         = useState(EMPTY_NEW_ITEM);

  // ─── Data fetching ──────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      try {
        const res  = await goodsApi.list();
        if (cancelled) return;

        const uiItems = (res?.data || []).map(backendGoodsToUi).filter(Boolean);
        if (uiItems.length) {
          setProducts((prev) => [...uiItems, ...prev.filter((p) => !p._backend)]);
        }
      } catch (err) {
        console.warn('[Marketplace] backend fetch failed (using seed data):', err?.message || err);
      }
    };

    fetchProducts();
    return () => { cancelled = true; };
  }, []);

  // ─── Derived state ──────────────────────────────────────────────────────────
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCat === 0 || p.category === CATEGORIES[selectedCat].label;
    const matchesSearch   = !search.trim()
      || p.title.toLowerCase().includes(search.toLowerCase())
      || p.category.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleNavPress = (id) => {
    setActiveNav(id);
    if (id === 'sell') setSellVisible(true);
  };

  const handleCategorySelect = (category) => {
    setSellVisible(false);
    setFormVisible(true);
    setNewItem((prev) => ({ ...prev, category: category.split(' ')[0] }));
  };

  const handleBuy = (item) => {
    setSelectedProd(item);
    setContactVisible(true);
  };

  const handleAddItem = async () => {
    if (!newItem.title?.trim()) {
      Alert.alert('Required', 'Please enter the item title.');
      return;
    }
    try {
      const result = await goodsApi.create({
        title:      newItem.title,
        price:      Number(newItem.price) || 0,
        category:   newItem.category || 'Textbooks',
        sellerName: newItem.name,
        phone:      newItem.contact,
        condition:  'Good',
      });

      const created = backendGoodsToUi(result?.data);
      if (created) setProducts((prev) => [created, ...prev]);

      setNewItem(EMPTY_NEW_ITEM);
      setFormVisible(false);
      setSellVisible(false);
    } catch (err) {
      Alert.alert('Could not list item', err?.message || 'Network error.');
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Good Morning</Text>
            <Text style={styles.headerTitle}>Campus Exchange</Text>
          </View>
          <View style={styles.notifBtn}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.textMid }}>N</Text>
            <View style={styles.notifDot} />
          </View>
        </View>

        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>S</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search books, notes, calculators..."
            placeholderTextColor={COLORS.textLight}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={{ color: COLORS.textLight, fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

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

      {/* Product List */}
      <ScrollView
        style={styles.body}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 108 }}
      >
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>
            {selectedCat === 0 ? 'All Items' : CATEGORIES[selectedCat].label}
          </Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeTxt}>{filteredProducts.length} listings</Text>
          </View>
        </View>

        {filteredProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No items found</Text>
            <Text style={styles.emptySub}>Try a different category or search term</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredProducts.map((item) => (
              <View key={item.id} style={styles.gridItem}>
                <ProductCard item={item} onBuy={handleBuy} />
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        {NAV_ITEMS.map((nav) => (
          <TouchableOpacity
            key={nav.id}
            style={[styles.navItem, nav.id === 'sell' && styles.navSellItem]}
            onPress={() => handleNavPress(nav.id)}
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

      {/* Modals */}
      <ContactModal
        visible={contactVisible}
        product={selectedProd}
        onClose={() => setContactVisible(false)}
      />
      <SellModal
        visible={sellVisible}
        onClose={() => setSellVisible(false)}
        onSelectCategory={handleCategorySelect}
      />
      <AddItemModal
        visible={formVisible}
        newItem={newItem}
        onChange={setNewItem}
        onSubmit={handleAddItem}
        onClose={() => setFormVisible(false)}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.addFab}
        onPress={() => setFormVisible(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.addFabTxt}>Add Item</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    backgroundColor: COLORS.white,
    paddingBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.red,
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
    marginBottom: 12,
  },
  searchIcon:  { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text, padding: 0 },
  catScroll:   {},

  // Category chips
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  catChipActive:    { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  catChipIcon:      { fontSize: 14 },
  catChipTxt:       { fontSize: 13, color: COLORS.textMid, fontWeight: '500' },
  catChipTxtActive: { color: COLORS.primary, fontWeight: '600' },

  // Body
  body: { flex: 1, paddingHorizontal: H_PADDING, paddingTop: 12 },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  countBadge: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  countBadgeTxt: { fontSize: 12, color: COLORS.primary, fontWeight: '500' },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: { width: CARD_W, marginBottom: 12 },

  // Product Card
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },
  cardImg: {
    height: 132,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    position: 'relative',
  },
  cardImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  discountBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(16,34,48,0.82)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  discountTxt: { fontSize: 9, color: COLORS.white, fontWeight: '700' },
  conditionBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  conditionTxt: { fontSize: 9, color: COLORS.textMid, fontWeight: '600' },
  cardBody:  { padding: 12 },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
    lineHeight: 19,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  cardPrice:     { fontSize: 16, fontWeight: '700', color: COLORS.primaryDark },
  originalPrice: { fontSize: 11, color: COLORS.textLight, textDecorationLine: 'line-through' },
  buyBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: 'center',
  },
  buyBtnTxt: { color: COLORS.white, fontSize: 13, fontWeight: '700' },

  // Empty state
  emptyState: { alignItems: 'center', paddingVertical: 46 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textMid, marginBottom: 6 },
  emptySub:   { fontSize: 13, color: COLORS.textLight, textAlign: 'center' },

  // Bottom Nav
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
    paddingBottom: Platform.OS === 'ios' ? 18 : 10,
    paddingTop: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  navItem:     { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2, position: 'relative' },
  navSellItem: { justifyContent: 'center', alignItems: 'center' },
  navSellBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  navIcon:        { fontSize: 20 },
  navIconActive:  {},
  navLabel:       { fontSize: 11, color: COLORS.textLight },
  navLabelActive: { color: COLORS.primary, fontWeight: '600' },
  navDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginTop: 1,
  },

  // Shared sheet / overlay
  overlayFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlayBg,
    justifyContent: 'flex-end',
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 16,
  },
  divider: { height: 0.5, backgroundColor: COLORS.border, marginVertical: 14 },

  // Contact sheet
  contactSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  contactProductRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  contactProductImg: {
    width: 58,
    height: 58,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.background,
  },
  contactProductImage:  { width: '100%', height: '100%', resizeMode: 'cover' },
  contactProductTitle:  { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 4, flex: 1 },
  contactProductPrice:  { fontSize: 18, fontWeight: '700', color: COLORS.primaryDark },
  contactSectionLabel:  { fontSize: 11, fontWeight: '700', color: COLORS.textLight, letterSpacing: 1, marginBottom: 10 },
  sellerCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  sellerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sellerAvatarTxt: { fontSize: 18, fontWeight: '700', color: COLORS.primaryDark },
  sellerName:      { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 3 },
  verifiedBadge: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  verifiedTxt:   { fontSize: 10, color: COLORS.primaryDark, fontWeight: '500' },
  sellerInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  sellerInfoVal: { fontSize: 13, color: COLORS.textMid },
  contactBtnsRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 12,
    paddingVertical: 13,
  },
  callBtn:       { backgroundColor: COLORS.primaryLight },
  contactBtnTxt: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  closeBtn: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  closeBtnTxt: { fontSize: 14, fontWeight: '500', color: COLORS.textMid },

  // Sell sheet
  sellSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  sellTitle:     { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  sellSub:       { fontSize: 13, color: COLORS.textLight, marginBottom: 16 },
  sellOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  sellOptionTxt: { fontSize: 15, color: COLORS.textMid },
  sellCancelBtn: {
    marginTop: 14,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  sellCancelTxt: { fontSize: 14, fontWeight: '500', color: COLORS.textMid },

  // Add Item form
  formModalWrap: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 60,
    alignItems: 'center',
  },
  formCard: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    elevation: 12,
  },
  formTitle:     { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  formInput: {
    borderBottomWidth: 1,
    borderColor: '#E6ECF1',
    marginBottom: 12,
    paddingVertical: 8,
    color: COLORS.text,
  },
  formSubmit: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  formSubmitTxt: { color: COLORS.white, fontWeight: '700' },
  formClose:     { alignItems: 'center', marginTop: 8 },
  formCloseTxt:  { color: COLORS.red },

  // FAB
  addFab: {
    position: 'absolute',
    right: 18,
    bottom: Platform.OS === 'ios' ? 90 : 78,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    elevation: 8,
  },
  addFabTxt: { color: COLORS.white, fontWeight: '700' },
});
