import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  FlatList, StyleSheet, StatusBar, Dimensions,
  Animated, Modal, Linking, Platform, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
const { width, height } = Dimensions.get('window');
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
  { id: 0, label: 'All',              icon: '🛍️' },
  { id: 1, label: 'Textbooks',        icon: '📚' },
  { id: 2, label: 'Casios',           icon: '🖩'  },
  { id: 3, label: 'Notes',            icon: '📝' },
  { id: 4, label: 'Engineering Drawing', icon: '📐' },
];

const PRODUCTS = [
  {
    id: '1', title: 'Engineering Maths Vol.2', category: 'Textbooks',
    price: 180, originalPrice: 350, icon: '📗', bg: '#F0FDF4',
    condition: 'Good', seller: { name: 'Arjun Sharma', phone: '+91 98765 43210', email: 'arjun.sharma@campus.edu', whatsapp: '919876543210' },
  },
  {
    id: '2', title: 'Casio FX-991EX', category: 'Casios',
    price: 650, originalPrice: 1200, icon: '🖩', bg: '#ECFDF5',
    condition: 'Like New', seller: { name: 'Priya Nair', phone: '+91 91234 56789', email: 'priya.nair@campus.edu', whatsapp: '919123456789' },
  },
  {
    id: '3', title: 'DSA Handwritten Notes', category: 'Notes',
    price: 80, originalPrice: 0, icon: '📓', bg: '#F0FDF4',
    condition: 'New', seller: { name: 'Rohan Mehta', phone: '+91 87654 32109', email: 'rohan.m@campus.edu', whatsapp: '918765432109' },
  },
  {
    id: '4', title: 'Drawing Kit (Complete)', category: 'Engineering Drawing',
    price: 220, originalPrice: 450, icon: '📐', bg: '#ECFDF5',
    condition: 'Good', seller: { name: 'Sneha Patel', phone: '+91 99887 76655', email: 'sneha.p@campus.edu', whatsapp: '919988776655' },
  },
  {
    id: '5', title: 'Physics by HC Verma', category: 'Textbooks',
    price: 140, originalPrice: 280, icon: '📘', bg: '#F0FDF4',
    condition: 'Acceptable', seller: { name: 'Vikram Singh', phone: '+91 70000 11223', email: 'vikram.s@campus.edu', whatsapp: '917000011223' },
  },
  {
    id: '6', title: 'Networks Short Notes', category: 'Notes',
    price: 60, originalPrice: 0, icon: '📋', bg: '#ECFDF5',
    condition: 'New', seller: { name: 'Ananya Rao', phone: '+91 88990 12345', email: 'ananya.r@campus.edu', whatsapp: '918899012345' },
  },
  {
    id: '7', title: 'Casio FX-82MS', category: 'Casios',
    price: 280, originalPrice: 600, icon: '🧮', bg: '#F0FDF4',
    condition: 'Good', seller: { name: 'Karan Joshi', phone: '+91 76543 21987', email: 'karan.j@campus.edu', whatsapp: '917654321987' },
  },
  {
    id: '8', title: 'AutoCAD Drawing Set', category: 'Engineering Drawing',
    price: 180, originalPrice: 350, icon: '✏️', bg: '#ECFDF5',
    condition: 'Like New', seller: { name: 'Divya Menon', phone: '+91 93456 78901', email: 'divya.m@campus.edu', whatsapp: '919345678901' },
  },
];
const NAV_ITEMS = [
  { id: 'home',    icon: '🏠', label: 'Home'    },
  { id: 'sell',    icon: '➕', label: 'Sell'    },
  { id: 'chat',    icon: '💬', label: 'Chat'    },
  { id: 'profile', icon: '👤', label: 'Profile' },
];
const SellModal = ({ visible, onClose, onSelectCategory }) => {
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 60, useNativeDriver: true }),
        Animated.timing(fadeAnim,  { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 300, duration: 200, useNativeDriver: true }),
        Animated.timing(fadeAnim,  { toValue: 0,   duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;
  const handleAddItem = async () => {
  try {
    const response = await fetch("https://your-api.com/add-item", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: newItem.title,
        price: newItem.price,
        category: newItem.category,
        sellerName: "You",
        phone: "+91XXXXXXXX",
      }),
    });

    const data = await response.json();
    console.log("Saved:", data);

    setFormVisible(false);

  } catch (err) {
    console.log(err);
  }
};

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />
        <Animated.View style={[styles.sellSheet, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sellTitle}>List an Item</Text>
          <Text style={styles.sellSub}>Sell your unused stuff to fellow students</Text>
          {['📚 Textbooks', '🖩 Calculators', '📝 Notes', '📐 Drawing Tools', '🎒 Other Items'].map((item, i) => (
            <TouchableOpacity key={i} style={styles.sellOption} onPress={() => {
onSelectCategory(item);// for now check click
}}>
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
const ContactModal = ({ visible, product, onClose }) => {
  const slideAnim = useRef(new Animated.Value(400)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 60, useNativeDriver: true }),
        Animated.timing(fadeAnim,  { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 400, duration: 220, useNativeDriver: true }),
        Animated.timing(fadeAnim,  { toValue: 0,   duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!visible || !product) return null;
  const { seller, title, price } = product;

  const call      = () => Linking.openURL(`tel:${seller.phone}`);


  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />
        <Animated.View style={[styles.contactSheet, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.sheetHandle} />
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
          <Text style={styles.contactSectionLabel}>SELLER DETAILS</Text>
          <View style={styles.sellerCard}>
            <View style={styles.sellerAvatar}>
              <Text style={styles.sellerAvatarTxt}>{seller.name.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sellerName}>{seller.name}</Text>
              <View style={[styles.verifiedBadge]}>
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
            <TouchableOpacity style={[styles.contactBtn, styles.callBtn]} onPress={call}>
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
const ProductCard = ({ item, onBuy }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn  = () => Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true }).start();
  const handlePressOut = () => Animated.spring(scaleAnim, { toValue: 1,    useNativeDriver: true }).start();

  const discount = item.originalPrice > 0
    ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
    : 0;

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
          <View style={[styles.conditionBadge, item.condition === 'Like New' && { backgroundColor: G.greenLight }, item.condition === 'New' && { backgroundColor: '#DBEAFE' }]}>
            <Text style={[styles.conditionTxt, item.condition === 'Like New' && { color: G.green }, item.condition === 'New' && { color: '#2563EB' }]}>{item.condition}</Text>
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
export default function MarketplaceScreen({ navigation }) {
  const [newItem, setNewItem] = useState({
  title: '',
  price: '',
  category: '',
  contact: '',
  Name: '',
});
  const [search,        setSearch]        = useState('');
  const [selectedCat,   setSelectedCat]   = useState(0);
  const [selectedProd,  setSelectedProd]  = useState(null);
  const [contactVisible,setContactVisible]= useState(false);
  const [sellVisible,   setSellVisible]   = useState(false);
  const [activeNav,     setActiveNav]     = useState('home');
  const [formVisible, setFormVisible] = useState(false);

 const [products, setProducts] = useState([]);

useEffect(() => {
  fetch("https://your-api.com/get-items")
    .then(res => res.json())
    .then(data => setProducts(data))
    .catch(err => console.log(err));
}, []);

const filtered = products.filter(p => {
  const matchCat = selectedCat === 0 || p.category === CATEGORIES[selectedCat].label;
  const matchSearch =
    !search.trim() ||
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase());

  return matchCat && matchSearch;
});

  const handleNav = (id) => {
    setActiveNav(id);
    if (id === 'sell') setSellVisible(true);
  };
  const handleAddItem = async () => {
  try {
    const response = await fetch("https://your-api.com/add-item", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
  title: newItem.title,
  price: newItem.price,
  category: newItem.category,
  sellerName: newItem.name,
  phone: newItem.phone,
}),
    });

    const data = await response.json();

    setProducts(prev => [data, ...prev]); 
    setFormVisible(false);

  } catch (err) {
    console.log(err);
  }
};

  return (
    <SafeAreaView style={styles.safe} edges={['left','right','bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={G.bg} />

      {/* ── HEADER ── */}
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

        {/* Search */}
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 2 }}>
          {CATEGORIES.map(cat => (
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
      <ScrollView style={styles.body} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
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
              <View key={item.id} style={[styles.gridItem, idx % 2 === 0 ? { paddingRight: 6 } : { paddingLeft: 6 }]}>
                <ProductCard item={item} onBuy={handleBuy} />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      <View style={styles.bottomNav}>
        {NAV_ITEMS.map(nav => (
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
                <Text style={[styles.navIcon, activeNav === nav.id && styles.navIconActive]}>{nav.icon}</Text>
                <Text style={[styles.navLabel, activeNav === nav.id && styles.navLabelActive]}>{nav.label}</Text>
                {activeNav === nav.id && <View style={styles.navDot} />}
              </>
            )}
          </TouchableOpacity>
        ))}
      </View>
      <ContactModal visible={contactVisible} product={selectedProd} onClose={() => setContactVisible(false)} />
<SellModal
  visible={sellVisible}
  onClose={() => setSellVisible(false)}
  onSelectCategory={(category) => {
    const cleanCategory = category.split(' ')[1];

    setSellVisible(false);
    setFormVisible(true);
    setNewItem(prev => ({ ...prev, category: cleanCategory }));
  }}
/>
{formVisible && (
  <View style={{
    position: 'absolute',
    top: 150,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    elevation: 10
  }}>
    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Add Item</Text>

    <TextInput
      placeholder="Item Name"
      value={newItem.title}
      onChangeText={(text) => setNewItem({ ...newItem, title: text })}
      style={{ borderBottomWidth: 1, marginBottom: 10 }}
    />

    <TextInput
      placeholder="Price"
      keyboardType="numeric"
      value={newItem.price}
      onChangeText={(text) => setNewItem({ ...newItem, price: text })}
      style={{ borderBottomWidth: 1, marginBottom: 10 }}
    />
    <TextInput
  placeholder="Your Name"
  value={newItem.name}
  onChangeText={(text) => setNewItem({ ...newItem, name: text })}
  style={{ borderBottomWidth: 1, marginBottom: 10 }}
/>

<TextInput
  placeholder="Phone Number"
  keyboardType="phone-pad"
  value={newItem.phone}
  onChangeText={(text) => setNewItem({ ...newItem, phone: text })}
  style={{ borderBottomWidth: 1, marginBottom: 10 }}
/>

    <TouchableOpacity
      style={{ backgroundColor: 'green', padding: 12, borderRadius: 8 }}
      onPress={handleAddItem}
    >
      <Text style={{ color: 'white', textAlign: 'center' }}>Submit</Text>
    </TouchableOpacity>

    <TouchableOpacity onPress={() => setFormVisible(false)}>
      <Text style={{ marginTop: 10, color: 'red' }}>Close</Text>
    </TouchableOpacity>
  </View>
)}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe:  { flex: 1, backgroundColor: G.bg },

  header: { backgroundColor: G.white, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: G.border, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12 },
  greeting:    { fontSize: 12, color: G.textLight },
  headerTitle: { fontSize: 22, fontWeight: '700', color: G.text, letterSpacing: -0.3 },
  notifBtn:    { width: 42, height: 42, borderRadius: 21, backgroundColor: G.bg, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  notifDot:    { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: G.red, borderWidth: 1.5, borderColor: G.white },

  searchBar:   { flexDirection: 'row', alignItems: 'center', backgroundColor: G.bg, borderRadius: 12, marginHorizontal: 16, paddingHorizontal: 12, paddingVertical: 10, gap: 8, marginBottom: 12 },
  searchIcon:  { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 14, color: G.text, padding: 0 },
  catScroll: { },
  catChip:       { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: G.bg, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: G.border },
  catChipActive: { backgroundColor: G.greenLight, borderColor: G.green },
  catChipIcon:   { fontSize: 14 },
  catChipTxt:    { fontSize: 13, color: G.textMid, fontWeight: '500' },
  catChipTxtActive: { color: G.green, fontWeight: '600' },
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 14 },
  sectionRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle:  { fontSize: 16, fontWeight: '600', color: G.text },
  countBadge:    { backgroundColor: G.greenLight, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  countBadgeTxt: { fontSize: 12, color: G.green, fontWeight: '500' },
  grid:     { flexDirection: 'row', flexWrap: 'wrap' },
  gridItem: { width: '50%', marginBottom: 12 },
  card:    { backgroundColor: G.card, borderRadius: 14, overflow: 'hidden', borderWidth: 0.5, borderColor: G.border, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8 },
  cardImg: { height: 120, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  cardIcon:{ fontSize: 48 },

  discountBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#FEF2F2', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2 },
  discountTxt:   { fontSize: 9, color: G.red, fontWeight: '700' },

  conditionBadge: { position: 'absolute', bottom: 8, right: 8, backgroundColor: '#F3F4F6', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2 },
  conditionTxt:   { fontSize: 9, color: G.textMid, fontWeight: '500' },

  cardBody:  { padding: 10 },
  cardTitle: { fontSize: 13, fontWeight: '500', color: G.text, marginBottom: 5, lineHeight: 18 },
  priceRow:  { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8 },
  cardPrice:     { fontSize: 15, fontWeight: '700', color: G.green },
  originalPrice: { fontSize: 11, color: G.textLight, textDecorationLine: 'line-through' },

  buyBtn:    { backgroundColor: G.green, borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  buyBtnTxt: { color: '#fff', fontSize: 13, fontWeight: '600' },

  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: G.textMid, marginBottom: 6 },
  emptySub:   { fontSize: 13, color: G.textLight, textAlign: 'center' },

  bottomNav: { flexDirection: 'row', backgroundColor: G.white, borderTopWidth: 0.5, borderTopColor: G.border, paddingBottom: Platform.OS === 'ios' ? 20 : 8, paddingTop: 8, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  navItem:     { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2, position: 'relative' },
  navSellItem: { justifyContent: 'center', alignItems: 'center' },
  navSellBtn:  { width: 52, height: 52, borderRadius: 26, backgroundColor: G.green, justifyContent: 'center', alignItems: 'center', marginTop: -20, elevation: 4, shadowColor: G.green, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
  navIcon:       { fontSize: 20 },
  navIconActive: { },
  navLabel:      { fontSize: 11, color: G.textLight },
  navLabelActive:{ color: G.green, fontWeight: '600' },
  navDot:        { width: 4, height: 4, borderRadius: 2, backgroundColor: G.green, marginTop: 1 },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', alignSelf: 'center', marginBottom: 16 },
  divider: { height: 0.5, backgroundColor: G.border, marginVertical: 14 },
  contactSheet: { backgroundColor: G.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: Platform.OS === 'ios' ? 36 : 24 },
  contactProductRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  contactProductImg: { width: 58, height: 58, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  contactProductTitle: { fontSize: 14, fontWeight: '600', color: G.text, marginBottom: 4, flex: 1 },
  contactProductPrice: { fontSize: 18, fontWeight: '700', color: G.green },
  contactSectionLabel: { fontSize: 11, fontWeight: '700', color: G.textLight, letterSpacing: 1, marginBottom: 10 },

  sellerCard:     { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  sellerAvatar:   { width: 44, height: 44, borderRadius: 22, backgroundColor: G.greenLight, justifyContent: 'center', alignItems: 'center' },
  sellerAvatarTxt:{ fontSize: 18, fontWeight: '700', color: G.green },
  sellerName:     { fontSize: 15, fontWeight: '600', color: G.text, marginBottom: 3 },
  verifiedBadge:  { backgroundColor: G.greenLight, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start' },
  verifiedTxt:    { fontSize: 10, color: G.green, fontWeight: '500' },

  sellerInfoRow:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  sellerInfoLabel:{ fontSize: 16 },
  sellerInfoVal:  { fontSize: 13, color: G.textMid },

  contactBtnsRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  contactBtn:     { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 12, paddingVertical: 13 },
  callBtn:        { backgroundColor: G.greenLight },
  emailBtn:       { backgroundColor: '#EFF6FF' },
  contactBtnIcon: { fontSize: 16 },
  contactBtnTxt:  { fontSize: 14, fontWeight: '600', color: G.text },

  whatsappBtn:  { backgroundColor: G.whatsapp, borderRadius: 12, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 },
  whatsappIcon: { fontSize: 18 },
  whatsappTxt:  { color: '#fff', fontSize: 15, fontWeight: '700' },

  closeBtn:    { backgroundColor: G.bg, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  closeBtnTxt: { fontSize: 14, fontWeight: '500', color: G.textMid },
  sellSheet: { backgroundColor: G.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: Platform.OS === 'ios' ? 36 : 24 },
  sellTitle: { fontSize: 20, fontWeight: '700', color: G.text, marginBottom: 4 },
  sellSub:   { fontSize: 13, color: G.textLight, marginBottom: 16 },
  sellOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: G.border },
  sellOptionTxt:{ fontSize: 15, color: G.textMid },
  sellCancelBtn:{ marginTop: 14, backgroundColor: G.bg, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  sellCancelTxt:{ fontSize: 14, fontWeight: '500', color: G.textMid },
});
