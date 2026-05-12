/**
 * HomeScreen.jsx
 *
 * Root landing screen for the Campix app. Displays a hero section with live
 * aggregate stats, a grid of core feature shortcuts, an "About the College"
 * tile, student reviews, and a sticky bottom navigation bar.
 *
 * Data sources
 * ─────────────
 * • User name   — persisted via getUser()
 * • Unread count — notificationsApi.list() + real-time socket events
 * • Stats strip  — lostFoundApi, memoriesApi, clubsApi (Promise.allSettled)
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  Animated,
  Easing,
  Platform,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import {
  getUser,
  notificationsApi,
  clubsApi,
  lostFoundApi,
  memoriesApi,
} from '../services/api';
import { getSocket } from '../services/realtime';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const { width } = Dimensions.get('window');

/** Shared colour palette. */
const COLORS = {
  primary:      '#4A6FA5',
  primaryDark:  '#2E4D7A',
  primaryLight: '#A8C0DD',
  primaryPale:  '#EBF1F8',
  bg:           '#F5F8FC',
  surface:      '#FFFFFF',
  textDark:     '#0D1B2A',
  textMid:      '#3D5068',
  textLight:    '#8FA8C0',
  border:       '#D6E4F0',
  gold:         '#FFB300',
};

/**
 * Feature-grid layout metrics.
 * All four cards in each row share an identical fixed width so no rounding
 * differences can cause misalignment across devices.
 */
const GRID_PAD  = 16;
const GRID_GAP  = 8;
const CARD_W    = Math.floor((width - GRID_PAD * 2 - GRID_GAP * 3) / 4);
const ICON_SIZE = Math.floor(CARD_W * 0.54);
const ICON_R    = Math.floor(ICON_SIZE * 0.3);

/** Smooth spring-like cubic-bezier reused for every animation. */
const EASE_OUT_EXPO = Easing.bezier(0.22, 1, 0.36, 1);

const COLLEGE_IMAGE = require('../../assets/droneviewaditya.jpg');

// ─── DATA ─────────────────────────────────────────────────────────────────────

/**
 * Core feature shortcuts rendered in the 4-column grid.
 * `route` maps directly to a React Navigation screen name.
 */
const FEATURES = [
  { id: '1', icon: 'search-outline',     label: 'Lost & Found',    grad: ['#1A237E', '#283593'], route: 'LostAndFound'    },
  { id: '2', icon: 'map-outline',         label: 'Campus Map',      grad: ['#4A148C', '#7B1FA2'], route: 'CampusMap'       },
  { id: '3', icon: 'restaurant-outline',  label: 'Canteen Menu',    grad: ['#BF360C', '#E64A19'], route: 'CanteenMenu'     },
  { id: '4', icon: 'storefront-outline',  label: 'Campus Exchange', grad: ['#004D40', '#00695C'], route: 'Marketplace'     },
  { id: '5', icon: 'briefcase-outline',   label: 'Placements',      grad: ['#0D47A1', '#1565C0'], route: 'Placements'      },
  { id: '6', icon: 'navigate-outline',    label: 'Exam Hall',       grad: ['#1B5E20', '#2E7D32'], route: 'ExamHall'        },
  { id: '7', icon: 'people-outline',      label: 'Clubs',           grad: ['#880E4F', '#AD1457'], route: 'Clubs'           },
  { id: '8', icon: 'images-outline',      label: 'Campus\nMemories',grad: ['#006064', '#00838F'], route: 'CampusMemories'  },
];

/** Student reviews shown in the bottom section. */
const REVIEWS = [
  {
    id: '1',
    name: 'Arjun Mehta',
    role: 'CSE, 3rd Year',
    initials: 'AM',
    gradColors: ['#4A6FA5', '#2E4D7A'],
    rating: 5,
    review:
      'Campix has completely transformed how I navigate campus life. Everything I need is in one place — clean, fast, and super useful!',
  },
  {
    id: '2',
    name: 'Sneha Reddy',
    role: 'ECE, 2nd Year',
    initials: 'SR',
    gradColors: ['#00897B', '#00796B'],
    rating: 5,
    review:
      'The best student app I have used. Beautiful UI and genuinely helpful features. Campix saves me at least 30 minutes every day!',
  },
];

/** Bottom navigation items. */
const NAV_ITEMS = [
  { key: 'Home',    icon: 'home',            label: 'Home'    },
  { key: 'Alerts',  icon: 'notifications',   label: 'Alerts'  },
  { key: 'About',   icon: 'school',          label: 'About'   },
  { key: 'Profile', icon: 'person-circle',   label: 'Profile' },
];

// ─── HOOKS ────────────────────────────────────────────────────────────────────

/**
 * Drives a fade-in + slide-up entrance animation.
 *
 * @param {number} delay         - Start delay in milliseconds.
 * @param {number} [slideDistance=24] - Vertical distance in pixels.
 */
function useEntranceAnimation(delay = 0, slideDistance = 24) {
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(slideDistance)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 580, delay, easing: EASE_OUT_EXPO, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 580, delay, easing: EASE_OUT_EXPO, useNativeDriver: true }),
    ]).start();
  }, []);

  return { opacity, transform: [{ translateY }] };
}

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────

/**
 * Animated pulsing badge showing the unread notification count.
 * Returns null when count is zero or undefined.
 *
 * @param {number} count - Number to display (capped at "9+").
 */
const PulseBadge = ({ count }) => {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!count) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.35, duration: 800, easing: EASE_OUT_EXPO, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1,    duration: 800, easing: EASE_OUT_EXPO, useNativeDriver: true }),
      ]),
    ).start();
  }, [count]);

  if (!count || count <= 0) return null;

  return (
    <Animated.View style={[styles.badge, { transform: [{ scale }] }]}>
      <Text style={styles.badgeText}>{count > 9 ? '9+' : String(count)}</Text>
    </Animated.View>
  );
};

/**
 * Row of five star icons reflecting a numeric rating.
 *
 * @param {number} count - Integer from 1 to 5.
 */
const Stars = ({ count }) => (
  <View style={{ flexDirection: 'row', gap: 2 }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Ionicons key={i} name={i <= count ? 'star' : 'star-outline'} size={12} color={COLORS.gold} />
    ))}
  </View>
);

/**
 * Section heading with an optional "View All" link.
 *
 * @param {string}    title  - Heading text.
 * @param {Function}  [onMore] - Called when "View All" is pressed. Omit to hide.
 */
const SectionHeader = ({ title, onMore }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {onMore && (
      <TouchableOpacity onPress={onMore} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={styles.sectionMoreLink}>View All ›</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ─── FEATURE CARD ─────────────────────────────────────────────────────────────

/**
 * Single cell in the core-features grid.
 * Uses a strictly fixed width so every card is identical regardless of content.
 *
 * @param {object}   item       - Feature descriptor from FEATURES.
 * @param {number}   delay      - Entrance animation delay in ms.
 * @param {object}   navigation - React Navigation prop.
 */
const FeatureCard = ({ item, delay, navigation }) => {
  const entranceStyle = useEntranceAnimation(delay, 18);
  const pressScale    = useRef(new Animated.Value(1)).current;

  const handlePressIn  = () =>
    Animated.spring(pressScale, { toValue: 0.93, speed: 22, bounciness: 4, useNativeDriver: true }).start();
  const handlePressOut = () =>
    Animated.spring(pressScale, { toValue: 1,    speed: 16, bounciness: 6, useNativeDriver: true }).start();

  return (
    <Animated.View style={[entranceStyle, { transform: [...entranceStyle.transform, { scale: pressScale }] }]}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        onPress={() => item.route && navigation?.navigate(item.route)}
        style={featureCardStyles.card}
      >
        <LinearGradient
          colors={item.grad}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={featureCardStyles.iconBox}
        >
          <Ionicons name={item.icon} size={Math.floor(ICON_SIZE * 0.46)} color="#fff" />
        </LinearGradient>

        {/* Fixed-height label container keeps all rows aligned. */}
        <View style={featureCardStyles.labelWrapper}>
          <Text style={featureCardStyles.label} numberOfLines={2}>
            {item.label}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const featureCardStyles = StyleSheet.create({
  card: {
    width:             CARD_W,
    height:            CARD_W + 36,
    backgroundColor:   COLORS.surface,
    borderRadius:      16,
    paddingTop:        13,
    paddingBottom:     10,
    paddingHorizontal: 4,
    alignItems:        'center',
    gap:               9,
    shadowColor:       '#4A6FA530',
    shadowOffset:      { width: 0, height: 3 },
    shadowOpacity:     1,
    shadowRadius:      8,
    elevation:         3,
    borderWidth:       1,
    borderColor:       COLORS.border,
  },
  iconBox: {
    width:           ICON_SIZE,
    height:          ICON_SIZE,
    borderRadius:    ICON_R,
    justifyContent:  'center',
    alignItems:      'center',
  },
  labelWrapper: {
    height:          28,
    justifyContent:  'center',
    alignItems:      'center',
    paddingHorizontal: 2,
  },
  label: {
    color:         COLORS.textMid,
    fontSize:      10.5,
    fontWeight:    '700',
    textAlign:     'center',
    lineHeight:    14,
    letterSpacing: 0.1,
  },
});

// ─── REVIEW CARD ──────────────────────────────────────────────────────────────

/**
 * Displays a single student review with avatar, rating, and quoted text.
 *
 * @param {{ id, name, role, initials, gradColors, rating, review }} item
 */
const ReviewCard = ({ item }) => (
  <View style={styles.reviewCard}>
    <View style={styles.reviewHeader}>
      <LinearGradient colors={item.gradColors} style={styles.reviewAvatar}>
        <Text style={styles.reviewAvatarText}>{item.initials}</Text>
      </LinearGradient>
      <View style={{ flex: 1 }}>
        <Text style={styles.reviewName}>{item.name}</Text>
        <Text style={styles.reviewRole}>{item.role}</Text>
      </View>
      <Stars count={item.rating} />
    </View>
    <Text style={styles.reviewText}>"{item.review}"</Text>
  </View>
);

// ─── HERO SECTION ─────────────────────────────────────────────────────────────

/**
 * Full-bleed hero with a drone-view background image, animated welcome text,
 * and a stats strip at the bottom.
 *
 * @param {number}   statusBarHeight - Platform-specific status bar height.
 * @param {object}   navigation      - React Navigation prop.
 * @param {string}   userName        - First name of the logged-in student.
 * @param {number}   unreadCount     - Number of unread notifications.
 * @param {object}   stats           - { lostFound, memories, clubs } display strings.
 */
const HeroSection = ({ statusBarHeight, navigation, userName, unreadCount, stats }) => {
  const HERO_HEIGHT = 360 + statusBarHeight;

  const logoAnim   = useEntranceAnimation(100, -12);
  const greetAnim  = useEntranceAnimation(260, 14);
  const nameAnim   = useEntranceAnimation(340, 14);
  const pillAnim   = useEntranceAnimation(420, 12);
  const statsAnim  = useEntranceAnimation(490, 10);

  const [imageLoadError, setImageLoadError] = useState(false);

  return (
    <View style={[styles.heroContainer, { height: HERO_HEIGHT }]}>
      <ImageBackground
        source={COLLEGE_IMAGE}
        style={StyleSheet.absoluteFill}
        imageStyle={{ width: '100%', height: '100%' }}
        resizeMode="cover"
        onError={() => setImageLoadError(true)}
      >
        {imageLoadError && (
          <LinearGradient colors={['#2E4D7A', '#4A6FA5']} style={StyleSheet.absoluteFill} />
        )}
      </ImageBackground>

      {/* Gradient overlay — darkens toward the bottom for text legibility. */}
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.80)']}
        locations={[0, 0.32, 0.52, 0.76, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Top bar — logo + notification bell */}
      <Animated.View style={[styles.heroBar, { top: statusBarHeight + 14 }, logoAnim]}>
        <View style={styles.brandRow}>
          <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.brandIcon}>
            <Ionicons name="school" size={17} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={styles.heroAppName}>Campix</Text>
            <Text style={styles.heroUniversityName}>Aditya University</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.bellButton} onPress={() => navigation?.navigate('Alerts')}>
          <Ionicons name="notifications-outline" size={20} color="#fff" />
          <PulseBadge count={unreadCount} />
        </TouchableOpacity>
      </Animated.View>

      {/* Welcome text block */}
      <View style={styles.welcomeBlock}>
        <Animated.Text style={[greetAnim, styles.heroGreeting]}>Welcome back,</Animated.Text>
        <Animated.Text style={[nameAnim,  styles.heroName]}>{userName || 'Student'} 👋</Animated.Text>
        <Animated.View style={[pillAnim,  styles.heroPill]}>
          <Ionicons name="sparkles-outline" size={12} color={COLORS.primaryLight} />
          <Text style={styles.heroPillText}>Smart Student App · Aditya University</Text>
        </Animated.View>
      </View>

      {/* Stats strip at the bottom of the hero */}
      <Animated.View style={[statsAnim, styles.statsStrip]}>
        {[
          { value: stats.lostFound, label: 'Lost & Found', icon: 'search'  },
          { value: stats.memories,  label: 'Memories',     icon: 'images'  },
          { value: stats.clubs,     label: 'Clubs',        icon: 'trophy'  },
        ].map((stat, index) => (
          <View key={stat.label} style={[styles.statItem, index < 2 && styles.statItemBorder]}>
            <Ionicons name={stat.icon} size={15} color="rgba(255,255,255,0.85)" />
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
};

// ─── SCREEN ───────────────────────────────────────────────────────────────────

/**
 * HomeScreen
 *
 * @param {object} navigation - React Navigation prop.
 */
export default function HomeScreen({ navigation }) {
  const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 44 : (StatusBar.currentHeight || 24);

  const scrollY = useRef(new Animated.Value(0)).current;

  const [userName,    setUserName]    = useState('Student');
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats,       setStats]       = useState({ lostFound: '—', memories: '—', clubs: '—' });

  // Sticky header fades in as the hero scrolls out of view.
  const stickyOpacity = scrollY.interpolate({
    inputRange:  [0, 160],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Section entrance animations (staggered).
  const mapBannerAnim  = useEntranceAnimation(60);
  const featuresAnim   = useEntranceAnimation(120);
  const aboutAnim      = useEntranceAnimation(180);
  const reviewsAnim    = useEntranceAnimation(240);

  // ── Data fetching ────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    // User name
    (async () => {
      const stored = await getUser();
      if (cancelled || !stored?.name) return;
      setUserName(String(stored.name).split(' ')[0]);
    })();

    // Unread notification count
    const fetchUnreadCount = async () => {
      try {
        const response = await notificationsApi.list();
        if (cancelled) return;
        setUnreadCount((response?.data || []).filter((n) => n.unread).length);
      } catch {
        // Non-critical — badge simply stays at 0.
      }
    };
    fetchUnreadCount();

    // Aggregate stats (best-effort; each source fails independently)
    (async () => {
      try {
        const [lostFoundResult, memoriesResult, clubsResult] = await Promise.allSettled([
          lostFoundApi.list(),
          memoriesApi.list(),
          clubsApi.list(),
        ]);

        if (cancelled) return;

        const lostFoundCount =
          lostFoundResult.status === 'fulfilled' ? lostFoundResult.value?.data?.length ?? 0 : null;
        const memoriesCount =
          memoriesResult.status === 'fulfilled'
            ? Array.isArray(memoriesResult.value) ? memoriesResult.value.length : 0
            : null;
        const clubsCount =
          clubsResult.status === 'fulfilled'
            ? Array.isArray(clubsResult.value) ? clubsResult.value.length : 0
            : null;

        setStats({
          lostFound: lostFoundCount != null ? String(lostFoundCount) : '—',
          memories:  memoriesCount  != null ? String(memoriesCount)  : '—',
          clubs:     clubsCount     != null ? String(clubsCount)     : '—',
        });
      } catch {
        // Stats remain as '—'.
      }
    })();

    // Real-time notification updates via WebSocket
    const socket = getSocket();
    socket.on('notifications:changed', fetchUnreadCount);

    return () => {
      cancelled = true;
      socket.off('notifications:changed', fetchUnreadCount);
    };
  }, []);

  // ── Derived data ─────────────────────────────────────────────────────────

  /** Features arranged into rows of 4 for the grid layout. */
  const featureRows = [];
  for (let i = 0; i < FEATURES.length; i += 4) {
    featureRows.push(FEATURES.slice(i, i + 4));
  }

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleNavPress = (routeKey) => {
    if (routeKey === 'Home') return;
    navigation.navigate(routeKey);
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Sticky header — visible only after scrolling past the hero */}
      <Animated.View style={[styles.stickyHeader, { opacity: stickyOpacity }]} pointerEvents="box-none">
        <LinearGradient
          colors={[`${COLORS.primary}F9`, `${COLORS.primaryDark}F9`]}
          style={[styles.stickyHeaderInner, { paddingTop: STATUS_BAR_HEIGHT + 8 }]}
        >
          <View>
            <Text style={styles.stickyAppName}>Campix</Text>
            <Text style={styles.stickyUniversityName}>Aditya University</Text>
          </View>
          <TouchableOpacity style={styles.stickyBellButton} onPress={() => navigation.navigate('Alerts')}>
            <Ionicons name="notifications" size={20} color="#fff" />
            <PulseBadge count={unreadCount} />
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        decelerationRate={0.92}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* Hero */}
        <HeroSection
          statusBarHeight={STATUS_BAR_HEIGHT}
          navigation={navigation}
          userName={userName}
          unreadCount={unreadCount}
          stats={stats}
        />

        {/* Campus Map banner */}
        <Animated.View style={[mapBannerAnim, { marginTop: 10 }]}>
          <View style={[styles.section, { paddingHorizontal: 16 }]}>
            <TouchableOpacity activeOpacity={0.84} onPress={() => navigation?.navigate('CampusMap')}>
              <LinearGradient colors={[COLORS.primaryDark, COLORS.primary]} style={styles.mapBanner}>
                <View>
                  <Text style={styles.mapBannerTitle}>📍 Explore Campus Map</Text>
                  <Text style={styles.mapBannerSubtitle}>Navigate buildings, labs & canteens</Text>
                </View>
                <View style={styles.mapBannerArrow}>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Core Features */}
        <Animated.View style={featuresAnim}>
          <View style={[styles.section, { marginTop: 16 }]}>
            <SectionHeader title="Core Features" />
            <View style={styles.featureGrid}>
              {featureRows.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.featureRow}>
                  {row.map((feature, colIndex) => (
                    <FeatureCard
                      key={feature.id}
                      item={feature}
                      delay={60 + (rowIndex * 4 + colIndex) * 35}
                      navigation={navigation}
                    />
                  ))}
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* About the College */}
        <Animated.View style={aboutAnim}>
          <View style={styles.section}>
            <TouchableOpacity
              activeOpacity={0.82}
              style={styles.aboutTile}
              onPress={() => navigation.navigate('About')}
            >
              <LinearGradient colors={[COLORS.primaryDark, COLORS.primary]} style={styles.aboutTileInner}>
                <View style={styles.aboutLeft}>
                  <View style={styles.adityaIconBox}>
                    <Ionicons name="school" size={24} color="#fff" />
                    <Text style={styles.adityaIconText}>ADITYA</Text>
                  </View>
                  <View>
                    <Text style={styles.aboutTitle}>About the College</Text>
                    <Text style={styles.aboutSubtitle}>Aditya University · Surampalem, AP</Text>
                  </View>
                </View>
                <View style={styles.aboutArrow}>
                  <Ionicons name="chevron-forward" size={18} color="#fff" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Student Reviews */}
        <Animated.View style={reviewsAnim}>
          <View style={styles.section}>
            <SectionHeader title="⭐  Student Reviews" onMore={() => {}} />
            <View style={styles.reviewList}>
              {REVIEWS.map((review) => (
                <ReviewCard key={review.id} item={review} />
              ))}
            </View>
          </View>
        </Animated.View>
      </Animated.ScrollView>

      {/* Bottom navigation bar */}
      <View style={styles.navWrapper}>
        <LinearGradient colors={['#FFFFFFFD', COLORS.bg]} style={styles.navBar}>
          {NAV_ITEMS.map((item) => {
            const isActive = item.key === 'Home';
            return (
              <TouchableOpacity
                key={item.key}
                style={styles.navItem}
                onPress={() => handleNavPress(item.key)}
                activeOpacity={0.7}
              >
                {isActive && <View style={styles.navActivePip} />}
                <View style={[styles.navIconBox, isActive && styles.navIconBoxActive]}>
                  <Ionicons
                    name={isActive ? item.icon : `${item.icon}-outline`}
                    size={23}
                    color={isActive ? COLORS.primary : COLORS.textLight}
                  />
                  {item.key === 'Alerts' && <PulseBadge />}
                </View>
                <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </LinearGradient>
      </View>
    </View>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },

  // Sticky header
  stickyHeader:      { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 },
  stickyHeaderInner: {
    flexDirection:    'row',
    alignItems:       'center',
    justifyContent:   'space-between',
    paddingHorizontal: 20,
    paddingBottom:    12,
  },
  stickyAppName:        { color: '#fff', fontWeight: '900', fontSize: 17, letterSpacing: 0.4 },
  stickyUniversityName: { color: '#D6E4F0', fontSize: 11, marginTop: 1 },
  stickyBellButton:     { padding: 4 },

  // Hero
  heroContainer: { width, overflow: 'hidden', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  heroBar: {
    position:          'absolute',
    left:              0,
    right:             0,
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    paddingHorizontal: 20,
  },
  brandRow:            { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandIcon: {
    width:          38,
    height:         38,
    borderRadius:   11,
    justifyContent: 'center',
    alignItems:     'center',
    shadowColor:    '#000',
    shadowOffset:   { width: 0, height: 2 },
    shadowOpacity:  0.3,
    shadowRadius:   4,
    elevation:      4,
  },
  heroAppName: {
    color:            '#FFFFFF',
    fontWeight:       '900',
    fontSize:         18,
    letterSpacing:    0.3,
    textShadowColor:  'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroUniversityName: {
    color:         'rgba(255,255,255,0.80)',
    fontSize:      10,
    fontWeight:    '600',
    marginTop:     1,
    letterSpacing: 0.4,
  },
  bellButton: {
    width:           42,
    height:          42,
    borderRadius:    21,
    backgroundColor: 'rgba(0,0,0,0.28)',
    justifyContent:  'center',
    alignItems:      'center',
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.22)',
  },
  welcomeBlock: { position: 'absolute', bottom: 70, left: 22, right: 22 },
  heroGreeting: {
    color:            'rgba(255,255,255,0.90)',
    fontSize:         15,
    fontWeight:       '600',
    letterSpacing:    0.2,
    textShadowColor:  'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  heroName: {
    color:            '#FFFFFF',
    fontSize:         32,
    fontWeight:       '900',
    letterSpacing:    0.2,
    marginTop:        2,
    textShadowColor:  'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  heroPill: {
    flexDirection:    'row',
    alignItems:       'center',
    gap:              7,
    marginTop:        14,
    alignSelf:        'flex-start',
    backgroundColor:  'rgba(255,255,255,0.18)',
    paddingHorizontal: 14,
    paddingVertical:  7,
    borderRadius:     22,
    borderWidth:      1,
    borderColor:      'rgba(255,255,255,0.28)',
  },
  heroPillText: { color: 'rgba(255,255,255,0.92)', fontSize: 11, fontWeight: '600', letterSpacing: 0.3 },
  statsStrip: {
    position:              'absolute',
    bottom:                0,
    left:                  0,
    right:                 0,
    flexDirection:         'row',
    backgroundColor:       'rgba(0,0,0,0.45)',
    paddingVertical:       13,
    borderBottomLeftRadius:  30,
    borderBottomRightRadius: 30,
    borderTopWidth:        1,
    borderTopColor:        'rgba(255,255,255,0.10)',
  },
  statItem:       { flex: 1, alignItems: 'center', gap: 3 },
  statItemBorder: { borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.18)' },
  statValue: {
    color:            '#fff',
    fontWeight:       '900',
    fontSize:         16,
    textShadowColor:  'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  statLabel: { color: 'rgba(255,255,255,0.72)', fontSize: 10, fontWeight: '600' },

  // Sections
  section:       { marginTop: 16 },
  sectionHeader: {
    flexDirection:    'row',
    justifyContent:   'space-between',
    alignItems:       'center',
    paddingHorizontal: 16,
    marginBottom:     14,
  },
  sectionTitle:    { fontSize: 16, fontWeight: '800', color: COLORS.textDark, letterSpacing: 0.1 },
  sectionMoreLink: { fontSize: 13, fontWeight: '600', color: COLORS.primary },

  // Feature grid
  featureGrid: { paddingHorizontal: GRID_PAD, gap: GRID_GAP },
  featureRow:  { flexDirection: 'row', gap: GRID_GAP },

  // Map banner
  mapBanner: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    borderRadius:   22,
    padding:        22,
    shadowColor:    `${COLORS.primary}44`,
    shadowOffset:   { width: 0, height: 6 },
    shadowOpacity:  1,
    shadowRadius:   14,
    elevation:      6,
  },
  mapBannerTitle:    { color: '#fff', fontWeight: '800', fontSize: 16 },
  mapBannerSubtitle: { color: '#ffffffAA', fontSize: 12, marginTop: 4 },
  mapBannerArrow: {
    width:          42,
    height:         42,
    borderRadius:   21,
    backgroundColor:'#FFFFFF1E',
    justifyContent: 'center',
    alignItems:     'center',
  },

  // About tile
  aboutTile: {
    marginHorizontal: 16,
    borderRadius:     22,
    overflow:         'hidden',
    shadowColor:      `${COLORS.primaryDark}44`,
    shadowOffset:     { width: 0, height: 6 },
    shadowOpacity:    1,
    shadowRadius:     14,
    elevation:        6,
  },
  aboutTileInner: {
    flexDirection:    'row',
    alignItems:       'center',
    justifyContent:   'space-between',
    paddingHorizontal: 20,
    paddingVertical:  18,
  },
  aboutLeft:     { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
  adityaIconBox: {
    width:           58,
    height:          58,
    borderRadius:    16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent:  'center',
    alignItems:      'center',
    gap:             3,
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.28)',
  },
  adityaIconText: { color: '#fff', fontSize: 7, fontWeight: '900', letterSpacing: 1.6 },
  aboutTitle:     { color: '#fff', fontWeight: '800', fontSize: 15 },
  aboutSubtitle:  { color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 3 },
  aboutArrow: {
    width:          34,
    height:         34,
    borderRadius:   17,
    backgroundColor:'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems:     'center',
  },

  // Reviews
  reviewList: { paddingHorizontal: 16, gap: 10 },
  reviewCard: {
    backgroundColor: COLORS.surface,
    borderRadius:    16,
    padding:         14,
    shadowColor:     `${COLORS.primary}18`,
    shadowOffset:    { width: 0, height: 3 },
    shadowOpacity:   1,
    shadowRadius:    10,
    elevation:       3,
    borderWidth:     1,
    borderColor:     COLORS.border,
  },
  reviewHeader:     { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  reviewAvatar:     { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  reviewAvatarText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  reviewName:       { color: COLORS.textDark, fontWeight: '700', fontSize: 13 },
  reviewRole:       { color: COLORS.textLight, fontSize: 11, marginTop: 1 },
  reviewText:       { color: COLORS.textMid, fontSize: 12, lineHeight: 19, fontStyle: 'italic' },

  // Notification badge
  badge: {
    position:        'absolute',
    top:             -4,
    right:           -4,
    backgroundColor: '#FFB300',
    width:           16,
    height:          16,
    borderRadius:    8,
    justifyContent:  'center',
    alignItems:      'center',
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },

  // Bottom navigation
  navWrapper: {
    position:     'absolute',
    bottom:       0,
    left:         0,
    right:        0,
    shadowColor:  '#00000018',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation:    20,
  },
  navBar: {
    flexDirection:         'row',
    paddingBottom:         Platform.OS === 'ios' ? 28 : 10,
    paddingTop:            10,
    borderTopLeftRadius:   24,
    borderTopRightRadius:  24,
    borderTopWidth:        1,
    borderColor:           COLORS.border,
  },
  navItem:          { flex: 1, alignItems: 'center', gap: 4, paddingTop: 2 },
  navActivePip: {
    position:        'absolute',
    top:             -10,
    width:           28,
    height:          3,
    borderRadius:    3,
    backgroundColor: COLORS.primary,
  },
  navIconBox: {
    width:          46,
    height:         36,
    justifyContent: 'center',
    alignItems:     'center',
    borderRadius:   13,
  },
  navIconBoxActive: { backgroundColor: `${COLORS.primary}18` },
  navLabel:         { fontSize: 10, color: COLORS.textLight, fontWeight: '600' },
  navLabelActive:   { color: COLORS.primary, fontWeight: '800' },
});
