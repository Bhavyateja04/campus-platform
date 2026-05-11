import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { goodsApi } from "../services/api";

// Map a backend Goods document into the local UI shape used by this screen.
function backendGoodsToUi(g) {
  if (!g || !g._id) return null;
  return {
    id: String(g._id),
    title: g.title || g.itemName || "(Untitled)",
    category: g.category || "Textbooks",
    price: Number(g.price) || 0,
    originalPrice: Number(g.originalPrice) || 0,
    icon: "EX",
    bg: "#EAF1F7",
    image: resolveProductImage({
      title: g.title || g.itemName || "(Untitled)",
      category: g.category || "Textbooks",
      image: g.image || g.photoUrl,
    }),
    condition: g.condition || "Good",
    seller: {
      name: (g.seller && g.seller.name) || g.sellerName || "Anonymous",
      phone: g.phone || g.contactNumber || "",
      email: (g.seller && g.seller.email) || "",
      whatsapp: (g.phone || g.contactNumber || "").replace(/[^0-9]/g, ""),
    },
    _backend: true,
  };
}
const { width, height } = Dimensions.get("window");
const H_PADDING = 16;
const CARD_GAP = 10;
const CARD_W = (width - H_PADDING * 2 - CARD_GAP) / 2;
const G = {
  green: "#5F768A",
  greenLight: "#DDE7EF",
  greenDark: "#344B5E",
  greenMid: "#8BA0B0",
  bg: "#F3F6F8",
  white: "#FFFFFF",
  card: "#FFFFFF",
  border: "#D7E0E8",
  text: "#102230",
  textMid: "#41505F",
  textLight: "#8091A1",
  whatsapp: "#5F768A",
  red: "#C45D5D",
};

const PRODUCT_IMAGES = {
  textbooks:
    "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1200&q=80",
  casios:
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
  notes:
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
  "engineering drawing":
    "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
  default:
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
};

function resolveProductImage(item) {
  if (item?.image) return item.image;

  const text = `${item?.category || ""} ${item?.title || ""}`.toLowerCase();
  const matchKey = Object.keys(PRODUCT_IMAGES).find(
    (key) => key !== "default" && text.includes(key),
  );
  return PRODUCT_IMAGES[matchKey || "default"];
}

const CATEGORIES = [
  { id: 0, label: "All", icon: "ALL" },
  { id: 1, label: "Textbooks", icon: "TXT" },
  { id: 2, label: "Casios", icon: "CAL" },
  { id: 3, label: "Notes", icon: "NTS" },
  { id: 4, label: "Engineering Drawing", icon: "DRW" },
];

const PRODUCTS = [
  {
    id: "1",
    title: "Engineering Maths Vol.2",
    category: "Textbooks",
    price: 180,
    originalPrice: 350,
    icon: "BK",
    bg: "#EAF1F7",
    condition: "Good",
    seller: {
      name: "Arjun Sharma",
      phone: "+91 98765 43210",
      email: "arjun.sharma@campus.edu",
      whatsapp: "919876543210",
    },
  },
  {
    id: "2",
    title: "Casio FX-991EX",
    category: "Casios",
    price: 650,
    originalPrice: 1200,
    icon: "CAL",
    bg: "#DDE7EF",
    condition: "Like New",
    seller: {
      name: "Priya Nair",
      phone: "+91 91234 56789",
      email: "priya.nair@campus.edu",
      whatsapp: "919123456789",
    },
  },
  {
    id: "3",
    title: "DSA Handwritten Notes",
    category: "Notes",
    price: 80,
    originalPrice: 0,
    icon: "NTS",
    bg: "#EAF1F7",
    condition: "New",
    seller: {
      name: "Rohan Mehta",
      phone: "+91 87654 32109",
      email: "rohan.m@campus.edu",
      whatsapp: "918765432109",
    },
  },
  {
    id: "4",
    title: "Drawing Kit (Complete)",
    category: "Engineering Drawing",
    price: 220,
    originalPrice: 450,
    icon: "DRW",
    bg: "#DDE7EF",
    condition: "Good",
    seller: {
      name: "Sneha Patel",
      phone: "+91 99887 76655",
      email: "sneha.p@campus.edu",
      whatsapp: "919988776655",
    },
  },
  {
    id: "5",
    title: "Physics by HC Verma",
    category: "Textbooks",
    price: 140,
    originalPrice: 280,
    icon: "BK",
    bg: "#EAF1F7",
    condition: "Acceptable",
    seller: {
      name: "Vikram Singh",
      phone: "+91 70000 11223",
      email: "vikram.s@campus.edu",
      whatsapp: "917000011223",
    },
  },
  {
    id: "6",
    title: "Networks Short Notes",
    category: "Notes",
    price: 60,
    originalPrice: 0,
    icon: "NTS",
    bg: "#DDE7EF",
    condition: "New",
    seller: {
      name: "Ananya Rao",
      phone: "+91 88990 12345",
      email: "ananya.r@campus.edu",
      whatsapp: "918899012345",
    },
  },
  {
    id: "7",
    title: "Casio FX-82MS",
    category: "Casios",
    price: 280,
    originalPrice: 600,
    icon: "CAL",
    bg: "#EAF1F7",
    condition: "Good",
    seller: {
      name: "Karan Joshi",
      phone: "+91 76543 21987",
      email: "karan.j@campus.edu",
      whatsapp: "917654321987",
    },
  },
  {
    id: "8",
    title: "AutoCAD Drawing Set",
    category: "Engineering Drawing",
    price: 180,
    originalPrice: 350,
    icon: "DRW",
    bg: "#DDE7EF",
    condition: "Like New",
    seller: {
      name: "Divya Menon",
      phone: "+91 93456 78901",
      email: "divya.m@campus.edu",
      whatsapp: "919345678901",
    },
  },
].map((item) => ({
  ...item,
  image: resolveProductImage(item),
}));
const NAV_ITEMS = [
  { id: "home", icon: "HM", label: "Home" },
  { id: "sell", icon: "SL", label: "Sell" },
  { id: "chat", icon: "CH", label: "Chat" },
  { id: "profile", icon: "PR", label: "Profile" },
];
const SellModal = ({ visible, onClose, onSelectCategory }) => {
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
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
    <Modal
      transparent
      animationType="none"
      visible={visible}
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={onClose}
          activeOpacity={1}
        />
        <Animated.View
          style={[styles.sellSheet, { transform: [{ translateY: slideAnim }] }]}
        >
          <View style={styles.sheetHandle} />
          <Text style={styles.sellTitle}>List an Item</Text>
          <Text style={styles.sellSub}>
            Sell your unused stuff to fellow students
          </Text>
          {[
            "Textbooks",
            "Calculators",
            "Notes",
            "Drawing Tools",
            "Other Items",
          ].map((item, i) => (
            <TouchableOpacity
              key={i}
              style={styles.sellOption}
              onPress={() => {
                onSelectCategory(item); // for now check click
              }}
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
const ContactModal = ({ visible, product, onClose }) => {
  const slideAnim = useRef(new Animated.Value(400)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 400,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible || !product) return null;
  const { seller, title, price } = product;

  const call = () => Linking.openURL(`tel:${seller.phone}`);

  return (
    <Modal
      transparent
      animationType="none"
      visible={visible}
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={onClose}
          activeOpacity={1}
        />
        <Animated.View
          style={[
            styles.contactSheet,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.sheetHandle} />
          <View style={styles.contactProductRow}>
            <View style={styles.contactProductImg}>
              <Image
                source={{ uri: product.image }}
                style={styles.contactProductImage}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactProductTitle} numberOfLines={2}>
                {title}
              </Text>
              <Text style={styles.contactProductPrice}>₹{price}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <Text style={styles.contactSectionLabel}>Seller details</Text>
          <View style={styles.sellerCard}>
            <View style={styles.sellerAvatar}>
              <Text style={styles.sellerAvatarTxt}>
                {seller.name.charAt(0)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sellerName}>{seller.name}</Text>
              <View style={[styles.verifiedBadge]}>
                <Text style={styles.verifiedTxt}>Verified student</Text>
              </View>
            </View>
          </View>

          <View style={styles.sellerInfoRow}>
            <Text style={styles.sellerInfoVal}>{seller.phone}</Text>
          </View>

          <View style={styles.divider} />
          <View style={styles.contactBtnsRow}>
            <TouchableOpacity
              style={[styles.contactBtn, styles.callBtn]}
              onPress={call}
            >
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

  const handlePressIn = () =>
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  const handlePressOut = () =>
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();

  const discount =
    item.originalPrice > 0
      ? Math.round(
          ((item.originalPrice - item.price) / item.originalPrice) * 100,
        )
      : 0;

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
          <View
            style={[
              styles.conditionBadge,
              item.condition === "Like New" && {
                backgroundColor: G.greenLight,
              },
              item.condition === "New" && { backgroundColor: "#DDE7EF" },
            ]}
          >
            <Text
              style={[
                styles.conditionTxt,
                item.condition === "Like New" && { color: G.green },
                item.condition === "New" && { color: G.greenDark },
              ]}
            >
              {item.condition}
            </Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.cardPrice}>₹{item.price}</Text>
            {item.originalPrice > 0 && (
              <Text style={styles.originalPrice}>₹{item.originalPrice}</Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.buyBtn}
            onPress={() => onBuy(item)}
            activeOpacity={0.85}
          >
            <Text style={styles.buyBtnTxt}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};
export default function MarketplaceScreen({ navigation }) {
  const [newItem, setNewItem] = useState({
    title: "",
    price: "",
    category: "",
    contact: "",
    Name: "",
  });
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState(0);
  const [selectedProd, setSelectedProd] = useState(null);
  const [contactVisible, setContactVisible] = useState(false);
  const [sellVisible, setSellVisible] = useState(false);
  const [activeNav, setActiveNav] = useState("home");
  const [formVisible, setFormVisible] = useState(false);

  const [products, setProducts] = useState(PRODUCTS);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await goodsApi.list();
        if (cancelled) return;
        const ui = (res?.data || []).map(backendGoodsToUi).filter(Boolean);
        if (ui.length)
          setProducts((prev) => [...ui, ...prev.filter((p) => !p._backend)]);
      } catch (err) {
        console.warn(
          "[Marketplace] backend fetch failed (using seed data):",
          err?.message || err,
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = products.filter((p) => {
    const matchCat =
      selectedCat === 0 || p.category === CATEGORIES[selectedCat].label;
    const matchSearch =
      !search.trim() ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());

    return matchCat && matchSearch;
  });

  const handleNav = (id) => {
    setActiveNav(id);
    if (id === "sell") setSellVisible(true);
  };
  const handleAddItem = async () => {
    if (!newItem.title?.trim()) {
      Alert.alert("Required", "Please enter the item title.");
      return;
    }
    try {
      const result = await goodsApi.create({
        title: newItem.title,
        price: Number(newItem.price) || 0,
        category: newItem.category || "Textbooks",
        sellerName: newItem.Name || newItem.name,
        phone: newItem.contact || newItem.phone,
        condition: newItem.condition || "Good",
      });
      const created = backendGoodsToUi(result?.data);
      if (created) setProducts((prev) => [created, ...prev]);
      setFormVisible(false);
      setSellVisible(false);
    } catch (err) {
      Alert.alert("Could not list item", err?.message || "Network error.");
    }
  };

  const handleBuy = (item) => {
    setSelectedProd(item);
    setContactVisible(true);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor={G.bg} />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Good Morning</Text>
            <Text style={styles.headerTitle}>Campus Exchange</Text>
          </View>
          <View style={styles.notifBtn}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: G.textMid }}>
              N
            </Text>
            <View style={styles.notifDot} />
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>S</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search books, notes, calculators..."
            placeholderTextColor={G.textLight}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Text style={{ color: G.textLight, fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.catScroll}
          contentContainerStyle={{
            paddingHorizontal: 16,
            gap: 8,
            paddingVertical: 2,
          }}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.catChip,
                selectedCat === cat.id && styles.catChipActive,
              ]}
              onPress={() => setSelectedCat(cat.id)}
              activeOpacity={0.75}
            >
              <Text style={styles.catChipIcon}>{cat.icon}</Text>
              <Text
                style={[
                  styles.catChipTxt,
                  selectedCat === cat.id && styles.catChipTxtActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <ScrollView
        style={styles.body}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 108 }}
      >
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>
            {selectedCat === 0 ? "All Items" : CATEGORIES[selectedCat].label}
          </Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeTxt}>{filtered.length} listings</Text>
          </View>
        </View>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No items found</Text>
            <Text style={styles.emptySub}>
              Try a different category or search term
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filtered.map((item, idx) => (
              <View key={item.id} style={styles.gridItem}>
                <ProductCard item={item} onBuy={handleBuy} />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      <View style={styles.bottomNav}>
        {NAV_ITEMS.map((nav) => (
          <TouchableOpacity
            key={nav.id}
            style={[styles.navItem, nav.id === "sell" && styles.navSellItem]}
            onPress={() => handleNav(nav.id)}
            activeOpacity={0.75}
          >
            {nav.id === "sell" ? (
              <View style={styles.navSellBtn}>
                <Text style={{ fontSize: 22 }}>{nav.icon}</Text>
              </View>
            ) : (
              <>
                <Text
                  style={[
                    styles.navIcon,
                    activeNav === nav.id && styles.navIconActive,
                  ]}
                >
                  {nav.icon}
                </Text>
                <Text
                  style={[
                    styles.navLabel,
                    activeNav === nav.id && styles.navLabelActive,
                  ]}
                >
                  {nav.label}
                </Text>
                {activeNav === nav.id && <View style={styles.navDot} />}
              </>
            )}
          </TouchableOpacity>
        ))}
      </View>
      <ContactModal
        visible={contactVisible}
        product={selectedProd}
        onClose={() => setContactVisible(false)}
      />
      <SellModal
        visible={sellVisible}
        onClose={() => setSellVisible(false)}
        onSelectCategory={(category) => {
          const cleanCategory = category.split(" ")[1];

          setSellVisible(false);
          setFormVisible(true);
          setNewItem((prev) => ({ ...prev, category: cleanCategory }));
        }}
      />
      <Modal
        transparent
        animationType="slide"
        visible={formVisible}
        onRequestClose={() => setFormVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setFormVisible(false)}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.formModalWrap}
        >
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Add Item</Text>

            <TextInput
              placeholder="Item Name"
              value={newItem.title}
              onChangeText={(text) => setNewItem({ ...newItem, title: text })}
              style={styles.formInput}
            />

            <TextInput
              placeholder="Price"
              keyboardType="numeric"
              value={newItem.price}
              onChangeText={(text) => setNewItem({ ...newItem, price: text })}
              style={styles.formInput}
            />

            <TextInput
              placeholder="Your Name"
              value={newItem.name}
              onChangeText={(text) => setNewItem({ ...newItem, name: text })}
              style={styles.formInput}
            />

            <TextInput
              placeholder="Phone Number"
              keyboardType="phone-pad"
              value={newItem.phone}
              onChangeText={(text) => setNewItem({ ...newItem, phone: text })}
              style={styles.formInput}
            />

            <TouchableOpacity style={styles.formSubmit} onPress={handleAddItem}>
              <Text style={styles.formSubmitTxt}>Submit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFormVisible(false)}
              style={styles.formClose}
            >
              <Text style={styles.formCloseTxt}>Close</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

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
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: G.bg },

  header: {
    backgroundColor: G.white,
    paddingBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: G.border,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
  greeting: { fontSize: 12, color: G.textLight },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: G.text,
    letterSpacing: -0.3,
  },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: G.bg,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notifDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: G.red,
    borderWidth: 1.5,
    borderColor: G.white,
  },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: G.bg,
    borderRadius: 12,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
    marginBottom: 12,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 14, color: G.text, padding: 0 },
  catScroll: {},
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: G.bg,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: G.border,
  },
  catChipActive: { backgroundColor: G.greenLight, borderColor: G.green },
  catChipIcon: { fontSize: 14 },
  catChipTxt: { fontSize: 13, color: G.textMid, fontWeight: "500" },
  catChipTxtActive: { color: G.green, fontWeight: "600" },
  body: { flex: 1, paddingHorizontal: H_PADDING, paddingTop: 12 },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: G.text },
  countBadge: {
    backgroundColor: G.greenLight,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  countBadgeTxt: { fontSize: 12, color: G.green, fontWeight: "500" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: { width: CARD_W, marginBottom: 12 },
  card: {
    backgroundColor: G.card,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: G.border,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },
  cardImg: {
    height: 132,
    justifyContent: "flex-start",
    alignItems: "stretch",
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  discountBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(16,34,48,0.82)",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  discountTxt: { fontSize: 9, color: G.white, fontWeight: "700" },

  conditionBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  conditionTxt: { fontSize: 9, color: G.textMid, fontWeight: "600" },

  cardBody: { padding: 12 },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: G.text,
    marginBottom: 6,
    lineHeight: 19,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  cardPrice: { fontSize: 16, fontWeight: "700", color: G.greenDark },
  originalPrice: {
    fontSize: 11,
    color: G.textLight,
    textDecorationLine: "line-through",
  },

  buyBtn: {
    backgroundColor: G.green,
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: "center",
  },
  buyBtnTxt: { color: "#fff", fontSize: 13, fontWeight: "700" },

  emptyState: { alignItems: "center", paddingVertical: 46 },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: G.textMid,
    marginBottom: 6,
  },
  emptySub: { fontSize: 13, color: G.textLight, textAlign: "center" },

  bottomNav: {
    flexDirection: "row",
    backgroundColor: G.white,
    borderTopWidth: 0.5,
    borderTopColor: G.border,
    paddingBottom: Platform.OS === "ios" ? 18 : 10,
    paddingTop: 8,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    position: "relative",
  },
  navSellItem: { justifyContent: "center", alignItems: "center" },
  navSellBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: G.green,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -20,
    elevation: 4,
    shadowColor: G.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  navIcon: { fontSize: 20 },
  navIconActive: {},
  navLabel: { fontSize: 11, color: G.textLight },
  navLabelActive: { color: G.green, fontWeight: "600" },
  navDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: G.green,
    marginTop: 1,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
    alignSelf: "center",
    marginBottom: 16,
  },
  divider: { height: 0.5, backgroundColor: G.border, marginVertical: 14 },
  contactSheet: {
    backgroundColor: G.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 36 : 24,
  },
  contactProductRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  contactProductImg: {
    width: 58,
    height: 58,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: G.bg,
  },
  contactProductImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  contactProductTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: G.text,
    marginBottom: 4,
    flex: 1,
  },
  contactProductPrice: { fontSize: 18, fontWeight: "700", color: G.greenDark },
  contactSectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: G.textLight,
    letterSpacing: 1,
    marginBottom: 10,
  },

  sellerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  sellerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: G.greenLight,
    justifyContent: "center",
    alignItems: "center",
  },
  sellerAvatarTxt: { fontSize: 18, fontWeight: "700", color: G.greenDark },
  sellerName: {
    fontSize: 15,
    fontWeight: "600",
    color: G.text,
    marginBottom: 3,
  },
  verifiedBadge: {
    backgroundColor: G.greenLight,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: "flex-start",
  },
  verifiedTxt: { fontSize: 10, color: G.greenDark, fontWeight: "500" },

  sellerInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  sellerInfoLabel: { fontSize: 16 },
  sellerInfoVal: { fontSize: 13, color: G.textMid },

  contactBtnsRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  contactBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 12,
    paddingVertical: 13,
  },
  callBtn: { backgroundColor: G.greenLight },
  emailBtn: { backgroundColor: "#EFF6FF" },
  contactBtnIcon: { fontSize: 16 },
  contactBtnTxt: { fontSize: 14, fontWeight: "600", color: G.text },

  whatsappBtn: {
    backgroundColor: G.whatsapp,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 10,
  },
  whatsappIcon: { fontSize: 18 },
  whatsappTxt: { color: "#fff", fontSize: 15, fontWeight: "700" },

  closeBtn: {
    backgroundColor: G.bg,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
  },
  closeBtnTxt: { fontSize: 14, fontWeight: "500", color: G.textMid },
  sellSheet: {
    backgroundColor: G.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 36 : 24,
  },
  sellTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: G.text,
    marginBottom: 4,
  },
  sellSub: { fontSize: 13, color: G.textLight, marginBottom: 16 },
  sellOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: G.border,
  },
  sellOptionTxt: { fontSize: 15, color: G.textMid },
  sellCancelBtn: {
    marginTop: 14,
    backgroundColor: G.bg,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
  },
  sellCancelTxt: { fontSize: 14, fontWeight: "500", color: G.textMid },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  formModalWrap: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 60,
    alignItems: "center",
  },
  formCard: {
    width: "100%",
    backgroundColor: G.white,
    borderRadius: 12,
    padding: 16,
    elevation: 12,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: G.text,
    marginBottom: 8,
  },
  formInput: {
    borderBottomWidth: 1,
    borderColor: "#E6ECF1",
    marginBottom: 12,
    paddingVertical: 8,
    color: G.text,
  },
  formSubmit: {
    backgroundColor: G.green,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 6,
  },
  formSubmitTxt: { color: "#fff", fontWeight: "700" },
  formClose: { alignItems: "center", marginTop: 8 },
  formCloseTxt: { color: G.red },
  addFab: {
    position: "absolute",
    right: 18,
    bottom: Platform.OS === "ios" ? 90 : 78,
    backgroundColor: G.green,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    elevation: 8,
  },
  addFabTxt: { color: "#fff", fontWeight: "700" },
});
