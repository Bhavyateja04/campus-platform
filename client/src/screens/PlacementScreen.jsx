import React, { useState, useRef, useCallback } from 'react';
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
import { useEffect } from 'react';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const starsText = (n) => '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));

const getSentimentStyle = (s) => {
  if (s === 'pos') return { bg: '#d1fae5', text: '#065f46', label: 'Positive' };
  if (s === 'neu') return { bg: '#fef9c3', text: '#78350f', label: 'Neutral' };
  return { bg: '#fee2e2', text: '#991b1b', label: 'Critical' };
};
const ReviewCard = ({ review, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, delay: index * 80, useNativeDriver: true }),
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
const CompanyCard = ({ company, expanded, onPress, onCollapse }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true, speed: 50 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50 }).start();
  };

  const review = company.reviews?.[0];

  return (
    <Animated.View style={[styles.cardWrapper, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.card, expanded && styles.cardExpanded]}
      >
    <View style={[styles.cardLogo, { backgroundColor: company.logoBg }]}>
  <Image
    source={{ uri: company.logo }}
    style={{ width: 32, height: 32 }}
    resizeMode="contain"
  />
</View>
        <Text style={styles.cardName}>{company.name}</Text>
        <View style={styles.cardMeta}>
          <Text style={styles.cardStar}>★</Text>
          <Text style={styles.cardRating}>{company.rating.toFixed(1)}</Text>
         <Text style={styles.cardReviewCount}>
  · {company.reviews?.length || 0} review
  {(company.reviews?.length || 0) > 1 ? 's' : ''}
</Text>
        </View>
        <View style={[styles.cardTag, styles.cardTagTeal]}>
          <Text style={styles.cardTagText}>{company.cat}</Text>
        </View>

        {expanded && review && (
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
              <View style={[styles.sentimentBadge, { backgroundColor: getSentimentStyle(review.sentiment).bg }]}>
                <Text style={[styles.sentimentText, { color: getSentimentStyle(review.sentiment).text }]}>
                  {getSentimentStyle(review.sentiment).label}
                </Text>
              </View>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};
const BottomSheet = ({ company, visible, onClose }) => {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  React.useEffect(() => {
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
        <View style={styles.sheetHeader}>
         <View style={[styles.sheetLogo, { backgroundColor: company.logoBg }]}>
  <Image
    source={{ uri: company.logo }}
    style={{ width: 40, height: 40 }}  
    resizeMode="contain"
  />
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
        <ScrollView
          style={styles.sheetScroll}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {(company.reviews || []).map((r, i) => (
            <ReviewCard key={i} review={r} index={i} />
          ))}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
};

export default function App() {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [sheetCompany, setSheetCompany] = useState(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
    useEffect(() => {
  fetch("http://192.168.X.X:5000/companies") // 👈 replace with your friend's API
    .then(res => res.json())
    .then(data => {
      setCompanies(data);
      setLoading(false);
    })
    .catch(err => {
      console.log(err);
      setLoading(false);
    });
}, []);

 const filtered = companies.filter(c => {
  const q = search.toLowerCase();

  return (
    !q ||
    (c.name && c.name.toLowerCase().includes(q)) ||
    (c.cat && c.cat.toLowerCase().includes(q))
  );
});
  const handleCardPress = useCallback((company) => {
    if ((company.reviews?.length || 0) === 1) {
      setExpandedId(prev => (prev === company.id ? null : company.id));
    } else {
      setSheetCompany(company);
      setSheetVisible(true);
    }
  }, []);

  const renderCard = useCallback(({ item, index }) => {
    const col = index % 2;
    return (
      <View style={[styles.gridItem, col === 0 ? { paddingRight: 6 } : { paddingLeft: 6 }]}>
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
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Loading...</Text>
    </View>
  );
}

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F9FC" />
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.logo}>
            <Text style={styles.logoGreen}>Placements</Text>
          </Text>
          <View style={styles.countBadge}>
           <Text style={styles.countBadgeText}>
  {companies.length} companies
</Text>
          </View>
        </View>
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
      <FlatList
        data={filtered}
        renderItem={renderCard}
        keyExtractor={item => String(item.id)}
        numColumns={2}
        contentContainerStyle={styles.gridContent}
        ListHeaderComponent={
         <Text style={styles.sectionLabel}>
  {filtered.length === companies.length
    ? 'Trending companies'
    : `${filtered.length} result${filtered.length !== 1 ? 's' : ''} found`}
</Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>No companies match your search.</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
      <BottomSheet
        company={sheetCompany}
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
      />
    </SafeAreaView>
  );
}
const TEAL = '#2563EB';
const TEAL_LIGHT = '#DBEAFE';
const TEAL_DARK = '#1E3A8A';
const TEAL_MID = '#60A5FA';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F9FC' },

  header: {
    backgroundColor: '#F7F9FC',
    borderBottomWidth: 1,
    borderBottomColor: '#e8ecf1',
    paddingBottom: 10,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 12,
  },
  logo: { fontSize: 20, fontWeight: '700', color: '#1a1f2e' },
  logoGreen: { color: TEAL_DARK },
  countBadge: { backgroundColor: TEAL_LIGHT, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  countBadgeText: { fontSize: 11, fontWeight: '600', color: TEAL_DARK },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e8ecf1',
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    height: 44,
  },
  searchIcon: { fontSize: 14, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#1a1f2e' },
  clearBtn: { fontSize: 14, color: '#9ca3af', paddingLeft: 8 },

  filtersScroll: { flexGrow: 0 },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#e8ecf1',
    backgroundColor: '#fff',
  },
  filterBtnActive: { borderColor: TEAL, backgroundColor: TEAL_LIGHT },
  filterBtnText: { fontSize: 13, fontWeight: '500', color: '#6b7280' },
  filterBtnTextActive: { color: TEAL_DARK },

  gridContent: { paddingHorizontal: 10, paddingBottom: 32 },
  sectionLabel: { fontSize: 13, color: '#6b7280', fontWeight: '500', paddingVertical: 12, paddingHorizontal: 6 },
  gridItem: { flex: 1, marginBottom: 12 },

  cardWrapper: {},
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e8ecf1',
    padding: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  cardExpanded: { borderColor: TEAL_MID },
  cardLogo: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  cardLogoText: { fontSize: 22 },
  cardName: { fontSize: 14, fontWeight: '700', color: '#1a1f2e', marginBottom: 4 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cardStar: { color: '#f59e0b', fontSize: 12 },
  cardRating: { fontSize: 12, fontWeight: '600', color: '#1a1f2e', marginLeft: 2 },
  cardReviewCount: { fontSize: 12, color: '#6b7280' },
  cardTag: { alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20 },
  cardTagTeal: { backgroundColor: TEAL_LIGHT },
  cardTagText: { fontSize: 11, fontWeight: '600', color: TEAL_DARK },

  inlineReview: {
    backgroundColor: '#F7F9FC',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e8ecf1',
  },
  collapseBtn: { alignSelf: 'flex-end', marginBottom: 8 },
  collapseBtnText: { fontSize: 12, color: '#6b7280' },

  reviewerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 12, fontWeight: '700' },
  reviewerName: { fontSize: 13, fontWeight: '600', color: '#1a1f2e' },
  reviewerRole: { fontSize: 11, color: '#6b7280' },

  reviewStars: { color: '#f59e0b', fontSize: 13, letterSpacing: 1 },
  reviewText: { fontSize: 13, color: '#374151', lineHeight: 20 },
  reviewFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  reviewDate: { fontSize: 11, color: '#6b7280' },
  sentimentBadge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20 },
  sentimentText: { fontSize: 11, fontWeight: '600' },

  reviewCard: {
    backgroundColor: '#F7F9FC',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e8ecf1',
  },
  reviewTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 },

  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,20,35,0.45)' },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.88,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.12, shadowRadius: 20 },
      android: { elevation: 20 },
    }),
  },
  sheetHandle: { width: 36, height: 4, backgroundColor: '#e8ecf1', borderRadius: 2, alignSelf: 'center', marginTop: 14, marginBottom: 4 },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e8ecf1',
    gap: 12,
  },
  sheetLogo: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  sheetLogoText: { fontSize: 26 },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: '#1a1f2e' },
  sheetSubtitle: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, borderColor: '#e8ecf1', alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { fontSize: 14, color: '#6b7280' },
  sheetScroll: { flex: 1 },

  emptyWrap: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 14, color: '#6b7280' },
});