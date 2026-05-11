import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  Animated,
  Dimensions,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';

// ─── Constants ────────────────────────────────────────────────────────────────

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const COLORS = {
  teal:      '#2563EB',
  tealLight: '#DBEAFE',
  tealDark:  '#1E3A8A',
  tealMid:   '#60A5FA',
  bg:        '#F7F9FC',
  white:     '#FFFFFF',
  border:    '#e8ecf1',
  text:      '#1a1f2e',
  textMid:   '#374151',
  textLight: '#6b7280',
  star:      '#f59e0b',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns a filled/empty star string for a given rating (0–5). */
const starsText = (n) =>
  '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));

/** Returns background/text color and display label for a sentiment code. */
const getSentimentStyle = (sentiment) => {
  if (sentiment === 'pos') return { bg: '#d1fae5', text: '#065f46', label: 'Positive' };
  if (sentiment === 'neu') return { bg: '#fef9c3', text: '#78350f', label: 'Neutral' };
  return { bg: '#fee2e2', text: '#991b1b', label: 'Critical' };
};

// ─── ReviewCard ───────────────────────────────────────────────────────────────

const ReviewCard = ({ review, index }) => {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 300, delay: index * 80, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 300, delay: index * 80, useNativeDriver: true }),
    ]).start();
  }, []);

  const sent = getSentimentStyle(review.sentiment);

  return (
    <Animated.View style={[styles.reviewCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.reviewTop}>
        <View style={styles.reviewerRow}>
          <View style={[styles.avatar, { backgroundColor: review.avatarBg }]}>
            <Text style={[styles.avatarText, { color: review.avatarText }]}>{review.initials}</Text>
          </View>
          <View>
            <Text style={styles.reviewerName}>{review.name}</Text>
            <Text style={styles.reviewerRole}>{review.role}</Text>
          </View>
        </View>
        <Text style={styles.reviewStars}>{starsText(review.stars)}</Text>
      </View>

      <Text style={styles.reviewText}>{review.text}</Text>

      <View style={styles.reviewFooter}>
        <Text style={styles.reviewDate}>{review.date}</Text>
        <View style={[styles.sentimentBadge, { backgroundColor: sent.bg }]}>
          <Text style={[styles.sentimentText, { color: sent.text }]}>{sent.label}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

// ─── InlineReview (extracted from CompanyCard) ────────────────────────────────

const InlineReview = ({ review, onCollapse }) => {
  const sent = getSentimentStyle(review.sentiment);

  return (
    <View style={styles.inlineReview}>
      <TouchableOpacity onPress={onCollapse} style={styles.collapseBtn}>
        <Text style={styles.collapseBtnText}>✕ close</Text>
      </TouchableOpacity>

      <View style={styles.reviewerRow}>
        <View style={[styles.avatar, { backgroundColor: review.avatarBg }]}>
          <Text style={[styles.avatarText, { color: review.avatarText }]}>{review.initials}</Text>
        </View>
        <View>
          <Text style={styles.reviewerName}>{review.name}</Text>
          <Text style={styles.reviewerRole}>{review.role}</Text>
        </View>
      </View>

      <Text style={styles.reviewStars}>{starsText(review.stars)}</Text>
      <Text style={[styles.reviewText, { marginTop: 6 }]}>{review.text}</Text>

      <View style={styles.reviewFooter}>
        <Text style={styles.reviewDate}>{review.date}</Text>
        <View style={[styles.sentimentBadge, { backgroundColor: sent.bg }]}>
          <Text style={[styles.sentimentText, { color: sent.text }]}>{sent.label}</Text>
        </View>
      </View>
    </View>
  );
};

// ─── CompanyCard ──────────────────────────────────────────────────────────────

const CompanyCard = ({ company, expanded, onPress, onCollapse }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn  = () => Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true, speed: 50 }).start();
  const handlePressOut = () => Animated.spring(scaleAnim, { toValue: 1,    useNativeDriver: true, speed: 50 }).start();

  const reviewCount = company.reviews?.length || 0;
  const firstReview = company.reviews?.[0];

  return (
    <Animated.View style={[styles.cardWrapper, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.card, expanded && styles.cardExpanded]}
      >
        {/* Logo */}
        <View style={[styles.cardLogo, { backgroundColor: company.logoBg }]}>
          <Image source={{ uri: company.logo }} style={styles.cardLogoImage} resizeMode="contain" />
        </View>

        {/* Name & meta */}
        <Text style={styles.cardName}>{company.name}</Text>
        <View style={styles.cardMeta}>
          <Text style={styles.cardStar}>★</Text>
          <Text style={styles.cardRating}>{company.rating.toFixed(1)}</Text>
          <Text style={styles.cardReviewCount}>
            · {reviewCount} review{reviewCount !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Category tag */}
        <View style={[styles.cardTag, styles.cardTagTeal]}>
          <Text style={styles.cardTagText}>{company.cat}</Text>
        </View>

        {/* Inline preview for single-review companies */}
        {expanded && firstReview && (
          <InlineReview review={firstReview} onCollapse={onCollapse} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── BottomSheet ──────────────────────────────────────────────────────────────

const BottomSheet = ({ company, visible, onClose }) => {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : SCREEN_HEIGHT,
      useNativeDriver: true,
      damping: 20,
      stiffness: 200,
    }).start();
  }, [visible]);

  if (!company) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />
      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.sheetHandle} />

        {/* Sheet header */}
        <View style={styles.sheetHeader}>
          <View style={[styles.sheetLogo, { backgroundColor: company.logoBg }]}>
            <Image source={{ uri: company.logo }} style={styles.sheetLogoImage} resizeMode="contain" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sheetTitle}>{company.name}</Text>
            <Text style={styles.sheetSubtitle}>
              {company.reviews?.length || 0} reviews · {starsText(company.rating)} {company.rating.toFixed(1)}
            </Text>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Review list */}
        <ScrollView
          style={styles.sheetScroll}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {(company.reviews || []).map((review, i) => (
            <ReviewCard key={i} review={review} index={i} />
          ))}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
};

// ─── PlacementsScreen ─────────────────────────────────────────────────────────

export default function PlacementsScreen() {
  const [companies,     setCompanies]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState('');
  const [expandedId,    setExpandedId]    = useState(null);
  const [sheetCompany,  setSheetCompany]  = useState(null);
  const [sheetVisible,  setSheetVisible]  = useState(false);

  // Fetch company listings on mount
  useEffect(() => {
    fetch('http://192.168.X.X:5000/companies') // Replace with your API base URL
      .then((res) => res.json())
      .then((data) => {
        setCompanies(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch companies:', err);
        setLoading(false);
      });
  }, []);

  // Filter by name or category
  const filtered = companies.filter((c) => {
    const q = search.toLowerCase();
    return (
      !q ||
      c.name?.toLowerCase().includes(q) ||
      c.cat?.toLowerCase().includes(q)
    );
  });

  // Single-review companies expand inline; multi-review open the bottom sheet
  const handleCardPress = useCallback((company) => {
    const reviewCount = company.reviews?.length || 0;
    if (reviewCount === 1) {
      setExpandedId((prev) => (prev === company.id ? null : company.id));
    } else {
      setSheetCompany(company);
      setSheetVisible(true);
    }
  }, []);

  const renderCard = useCallback(({ item, index }) => {
    const isRightColumn = index % 2 !== 0;
    return (
      <View style={[styles.gridItem, isRightColumn ? { paddingLeft: 6 } : { paddingRight: 6 }]}>
        <CompanyCard
          company={item}
          expanded={expandedId === item.id}
          onPress={() => handleCardPress(item)}
          onCollapse={() => setExpandedId(null)}
        />
      </View>
    );
  }, [expandedId, handleCardPress]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const sectionLabel = filtered.length === companies.length
    ? 'Trending companies'
    : `${filtered.length} result${filtered.length !== 1 ? 's' : ''} found`;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.logo}>
            <Text style={styles.logoPrimary}>Placements</Text>
          </Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{companies.length} companies</Text>
          </View>
        </View>

        {/* Search bar */}
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search companies..."
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Company Grid ── */}
      <FlatList
        data={filtered}
        renderItem={renderCard}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        contentContainerStyle={styles.gridContent}
        ListHeaderComponent={<Text style={styles.sectionLabel}>{sectionLabel}</Text>}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>No companies match your search.</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* ── Bottom Sheet ── */}
      <BottomSheet
        company={sheetCompany}
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Layout
  safe:             { flex: 1, backgroundColor: COLORS.bg },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText:      { fontSize: 14, color: COLORS.textLight },

  // Header
  header:         { backgroundColor: COLORS.bg, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: 10, zIndex: 10 },
  headerTop:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, marginBottom: 12 },
  logo:           { fontSize: 20, fontWeight: '700', color: COLORS.text },
  logoPrimary:    { color: COLORS.tealDark },
  countBadge:     { backgroundColor: COLORS.tealLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  countBadgeText: { fontSize: 11, fontWeight: '600', color: COLORS.tealDark },

  // Search
  searchWrap:  { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 10, borderWidth: 1.5, borderColor: COLORS.border, paddingHorizontal: 12, marginHorizontal: 16, marginBottom: 10, height: 44 },
  searchIcon:  { fontSize: 14, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text },
  clearBtn:    { fontSize: 14, color: COLORS.textLight, paddingLeft: 8 },

  // Grid
  gridContent:  { paddingHorizontal: 10, paddingBottom: 32 },
  sectionLabel: { fontSize: 13, color: COLORS.textLight, fontWeight: '500', paddingVertical: 12, paddingHorizontal: 6 },
  gridItem:     { flex: 1, marginBottom: 12 },

  // Company card
  cardWrapper: {},
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 16,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  cardExpanded:    { borderColor: COLORS.tealMid },
  cardLogo:        { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  cardLogoImage:   { width: 32, height: 32 },
  cardName:        { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  cardMeta:        { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cardStar:        { color: COLORS.star, fontSize: 12 },
  cardRating:      { fontSize: 12, fontWeight: '600', color: COLORS.text, marginLeft: 2 },
  cardReviewCount: { fontSize: 12, color: COLORS.textLight },
  cardTag:         { alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20 },
  cardTagTeal:     { backgroundColor: COLORS.tealLight },
  cardTagText:     { fontSize: 11, fontWeight: '600', color: COLORS.tealDark },

  // Inline review (single-review expand)
  inlineReview:    { backgroundColor: COLORS.bg, borderRadius: 10, padding: 12, marginTop: 12, borderWidth: 1, borderColor: COLORS.border },
  collapseBtn:     { alignSelf: 'flex-end', marginBottom: 8 },
  collapseBtnText: { fontSize: 12, color: COLORS.textLight },

  // Shared reviewer row
  reviewerRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  avatar:       { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  avatarText:   { fontSize: 12, fontWeight: '700' },
  reviewerName: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  reviewerRole: { fontSize: 11, color: COLORS.textLight },

  // Review content
  reviewStars:    { color: COLORS.star, fontSize: 13, letterSpacing: 1 },
  reviewText:     { fontSize: 13, color: COLORS.textMid, lineHeight: 20 },
  reviewFooter:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  reviewDate:     { fontSize: 11, color: COLORS.textLight },
  sentimentBadge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20 },
  sentimentText:  { fontSize: 11, fontWeight: '600' },

  reviewCard: { backgroundColor: COLORS.bg, borderRadius: 10, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  reviewTop:  { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 },

  // Bottom sheet
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,20,35,0.45)' },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.88,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.12, shadowRadius: 20 },
      android: { elevation: 20 },
    }),
  },
  sheetHandle:    { width: 36, height: 4, backgroundColor: COLORS.border, borderRadius: 2, alignSelf: 'center', marginTop: 14, marginBottom: 4 },
  sheetHeader:    { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
  sheetLogo:      { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  sheetLogoImage: { width: 40, height: 40 },
  sheetTitle:     { fontSize: 18, fontWeight: '700', color: COLORS.text },
  sheetSubtitle:  { fontSize: 13, color: COLORS.textLight, marginTop: 2 },
  closeBtn:       { width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  closeBtnText:   { fontSize: 14, color: COLORS.textLight },
  sheetScroll:    { flex: 1 },

  // Empty state
  emptyWrap: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 14, color: COLORS.textLight },
});
