import React, { useRef, useEffect, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  ImageBackground,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import {
  clubsApi,
  getUser,
  lostFoundApi,
  memoriesApi,
  notificationsApi,
} from "../services/api";
import { getSocket } from "../services/realtime";
import {
  exitGuestMode,
  isFeatureAllowedForGuest,
  isGuestMode,
} from "../utils/guestMode";

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const SCREEN_WIDTH = Dimensions.get("window").width;
const COLLEGE_IMG = require("../../assets/droneviewaditya.jpg");
const EASE = Easing.bezier(0.22, 1, 0.36, 1);

const GRID_PADDING = 16;
const GRID_GAP = 8;
const CARD_W = Math.floor((SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP * 3) / 4);
const ICON_SIZE = Math.floor(CARD_W * 0.54);
const ICON_RADIUS = Math.floor(ICON_SIZE * 0.3);

const COLOR = {
  primary: "#4A6FA5",
  primaryDark: "#2E4D7A",
  primaryLight: "#A8C0DD",
  primaryPale: "#EBF1F8",
  orange: "#E07B3A",
  blue: "#1565C0",
  purple: "#6A1B9A",
  teal: "#00796B",
  gold: "#FFB300",
  red: "#DC2626",
  bg: "#F5F8FC",
  surface: "#FFFFFF",
  textDark: "#0D1B2A",
  textMid: "#3D5068",
  textLight: "#8FA8C0",
  border: "#D6E4F0",
};

const FEATURES = [
  { id: "1", icon: "search-outline",      label: "Lost & Found",    grad: ["#1A237E", "#283593"], route: "LostAndFound"    },
  { id: "2", icon: "map-outline",          label: "Campus Map",      grad: ["#4A148C", "#7B1FA2"], route: "CampusMap"       },
  { id: "3", icon: "restaurant-outline",   label: "Canteen Menu",    grad: ["#BF360C", "#E64A19"], route: "CanteenMenu"     },
  { id: "4", icon: "storefront-outline",   label: "Campus Exchange", grad: ["#004D40", "#00695C"], route: "Marketplace"     },
  { id: "5", icon: "briefcase-outline",    label: "Placements",      grad: ["#0D47A1", "#1565C0"], route: "Placements"      },
  { id: "6", icon: "navigate-outline",     label: "Exam Hall",       grad: ["#1B5E20", "#2E7D32"], route: "ExamHall"        },
  { id: "7", icon: "people-outline",       label: "Clubs",           grad: ["#880E4F", "#AD1457"], route: "Clubs"           },
  { id: "8", icon: "images-outline",       label: "Campus\nMemories",grad: ["#006064", "#00838F"], route: "CampusMemories"  },
];

const FEEDBACK = [
  {
    id: "1",
    name: "Arjun Mehta",
    role: "CSE, 3rd Year",
    initials: "AM",
    gradColors: [COLOR.primary, COLOR.primaryDark],
    rating: 5,
    review:
      "Campix has completely transformed how I navigate campus life. Everything I need is in one place — clean, fast, and super useful!",
  },
  {
    id: "2",
    name: "Sneha Reddy",
    role: "ECE, 2nd Year",
    initials: "SR",
    gradColors: ["#00897B", "#00796B"],
    rating: 5,
    review:
      "The best student app I have used. Beautiful UI and genuinely helpful features. Campix saves me at least 30 minutes every day!",
  },
];

const NAV_ITEMS = [
  { key: "Home",    icon: "home",          label: "Home"    },
  { key: "Alerts",  icon: "notifications", label: "Alerts"  },
  { key: "About",   icon: "school",        label: "About"   },
  { key: "Profile", icon: "person-circle", label: "Profile" },
];

const EMPTY_STATS = { lostFound: "—", memories: "—", clubs: "—" };

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

function resolveCount(settledResult) {
  if (settledResult.status !== "fulfilled") return null;
  const val = settledResult.value;
  const data = val?.data ?? val;
  return Array.isArray(data) ? data.length : null;
}

function countToString(count) {
  return count != null ? String(count) : "—";
}

// ─────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────

function useEntranceAnimation(delay = 0, translateYOffset = 24) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(translateYOffset)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 580,
        delay,
        easing: EASE,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 580,
        delay,
        easing: EASE,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return { opacity, transform: [{ translateY }] };
}

// ─────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────

function PulseBadge({ count }) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!count) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.35, duration: 800, easing: EASE, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1,    duration: 800, easing: EASE, useNativeDriver: true }),
      ])
    ).start();
  }, [count]);

  if (!count || count <= 0) return null;

  return (
    <Animated.View style={[S.badge, { transform: [{ scale }] }]}>
      <Text style={S.badgeText}>{count > 9 ? "9+" : String(count)}</Text>
    </Animated.View>
  );
}

function Stars({ count }) {
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={i <= count ? "star" : "star-outline"}
          size={12}
          color={COLOR.gold}
        />
      ))}
    </View>
  );
}

function SectionHeader({ title, onMore }) {
  return (
    <View style={S.secHeader}>
      <Text style={S.secTitle}>{title}</Text>
      {onMore && (
        <TouchableOpacity
          onPress={onMore}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={S.secMore}>View All ›</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function FeatureCard({ item, delay, navigation }) {
  const entranceAnim = useEntranceAnimation(delay, 18);
  const pressScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
    Animated.spring(pressScale, { toValue: 0.93, speed: 22, bounciness: 4, useNativeDriver: true }).start();

  const handlePressOut = () =>
    Animated.spring(pressScale, { toValue: 1, speed: 16, bounciness: 6, useNativeDriver: true }).start();

  return (
    <Animated.View
      style={[entranceAnim, { transform: [...entranceAnim.transform, { scale: pressScale }] }]}
    >
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        onPress={() => item.route && navigation?.navigate(item.route)}
        style={FC.card}
      >
        <LinearGradient
          colors={item.grad}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={FC.iconBox}
        >
          <Ionicons name={item.icon} size={Math.floor(ICON_SIZE * 0.46)} color="#fff" />
        </LinearGradient>

        <View style={FC.labelWrap}>
          <Text style={FC.label} numberOfLines={2}>
            {item.label}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function FeedbackCard({ item }) {
  return (
    <View style={S.fbCard}>
      <View style={S.fbHeader}>
        <LinearGradient colors={item.gradColors} style={S.fbAvatar}>
          <Text style={S.fbAvatarInitials}>{item.initials}</Text>
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <Text style={S.fbName}>{item.name}</Text>
          <Text style={S.fbRole}>{item.role}</Text>
        </View>
        <Stars count={item.rating} />
      </View>
      <Text style={S.fbText}>"{item.review}"</Text>
    </View>
  );
}

function Hero({ statusBarHeight, navigation, userName, isGuest, unreadCount, stats }) {
  const HERO_HEIGHT = 360 + statusBarHeight;

  const logoAnim  = useEntranceAnimation(100, -12);
  const greetAnim = useEntranceAnimation(260,  14);
  const nameAnim  = useEntranceAnimation(340,  14);
  const pillAnim  = useEntranceAnimation(420,  12);
  const statsAnim = useEntranceAnimation(490,  10);

  const [imageError, setImageError] = useState(false);

  const displayName = isGuest ? "Guest" : `${userName} 👋`;

  return (
    <View style={[S.heroContainer, { height: HERO_HEIGHT }]}>
      <ImageBackground
        source={COLLEGE_IMG}
        style={StyleSheet.absoluteFill}
        imageStyle={{ width: "100%", height: "100%" }}
        resizeMode="cover"
        onError={() => setImageError(true)}
      >
        {imageError && (
          <LinearGradient
            colors={[COLOR.primaryDark, COLOR.primary]}
            style={StyleSheet.absoluteFill}
          />
        )}
      </ImageBackground>

      <LinearGradient
        colors={["rgba(0,0,0,0)", "rgba(0,0,0,0)", "rgba(0,0,0,0.15)", "rgba(0,0,0,0.55)", "rgba(0,0,0,0.80)"]}
        locations={[0, 0.32, 0.52, 0.76, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <Animated.View style={[S.heroBar, { top: statusBarHeight + 14 }, logoAnim]}>
        <View style={S.brandRow}>
          <LinearGradient colors={[COLOR.primary, COLOR.primaryDark]} style={S.brandIcon}>
            <Ionicons name="school" size={17} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={S.heroAppName}>Campix</Text>
            <Text style={S.heroUniName}>Aditya University</Text>
          </View>
        </View>
        <TouchableOpacity style={S.bellButton} onPress={() => navigation?.navigate("Alerts")}>
          <Ionicons name="notifications-outline" size={20} color="#fff" />
          <PulseBadge count={unreadCount} />
        </TouchableOpacity>
      </Animated.View>

      <View style={S.welcomeBlock}>
        <Animated.Text style={[greetAnim, S.heroGreeting]}>Welcome back,</Animated.Text>
        <Animated.Text style={[nameAnim, S.heroName]}>{displayName}</Animated.Text>
        <Animated.View style={[pillAnim, S.heroPill]}>
          <Ionicons name="sparkles-outline" size={12} color={COLOR.primaryLight} />
          <Text style={S.heroPillText}>Smart Student App · Aditya University</Text>
        </Animated.View>
      </View>

      <Animated.View style={[statsAnim, S.statsStrip]}>
        {[
          { val: stats.lostFound, label: "Lost & Found", icon: "search"  },
          { val: stats.memories,  label: "Memories",     icon: "images"  },
          { val: stats.clubs,     label: "Clubs",         icon: "trophy" },
        ].map((stat, index) => (
          <View key={stat.label} style={[S.statItem, index < 2 && S.statBorder]}>
            <Ionicons name={stat.icon} size={15} color="rgba(255,255,255,0.85)" />
            <Text style={S.statValue}>{stat.val}</Text>
            <Text style={S.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

function StickyHeader({ scrollY, statusBarHeight, unreadCount, navigation }) {
  const opacity = scrollY.interpolate({
    inputRange: [0, 160],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  return (
    <Animated.View style={[S.sticky, { opacity }]} pointerEvents="box-none">
      <LinearGradient
        colors={[COLOR.primary + "F9", COLOR.primaryDark + "F9"]}
        style={[S.stickyInner, { paddingTop: statusBarHeight + 8 }]}
      >
        <View>
          <Text style={S.stickyAppName}>Campix</Text>
          <Text style={S.stickyUniName}>Aditya University</Text>
        </View>
        <TouchableOpacity style={S.stickyBell} onPress={() => navigation.navigate("Alerts")}>
          <Ionicons name="notifications" size={20} color="#fff" />
          <PulseBadge count={unreadCount} />
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
}

function GuestNavBar({ navigation }) {
  async function handleExitGuest() {
    Alert.alert(
      "Exit Guest Mode",
      "You will be logged out and returned to the login screen.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Exit",
          style: "destructive",
          onPress: async () => {
            await exitGuestMode();
            await AsyncStorage.removeItem("auth_token");
            navigation.reset({ index: 0, routes: [{ name: "Login" }] });
          },
        },
      ]
    );
  }

  return (
    <>
      <TouchableOpacity style={S.navItem} onPress={() => navigation.navigate("Home")} activeOpacity={0.7}>
        <View style={S.navPip} />
        <View style={[S.navIconBox, S.navIconBoxActive]}>
          <Ionicons name="home" size={23} color={COLOR.primary} />
        </View>
        <Text style={[S.navLabel, S.navLabelActive]}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={S.navItem} onPress={() => navigation.navigate("About")} activeOpacity={0.7}>
        <View style={S.navIconBox}>
          <Ionicons name="school-outline" size={23} color={COLOR.textLight} />
        </View>
        <Text style={S.navLabel}>About</Text>
      </TouchableOpacity>

      <TouchableOpacity style={S.navItem} onPress={handleExitGuest} activeOpacity={0.7}>
        <View style={S.navIconBox}>
          <Ionicons name="log-out-outline" size={23} color={COLOR.red} />
        </View>
        <Text style={[S.navLabel, { color: COLOR.red }]}>Exit</Text>
      </TouchableOpacity>
    </>
  );
}

function UserNavBar({ navigation, unreadCount }) {
  return (
    <>
      {NAV_ITEMS.map((item) => {
        const isActive = item.key === "Home";
        return (
          <TouchableOpacity
            key={item.key}
            style={S.navItem}
            onPress={() => item.key !== "Home" && navigation.navigate(item.key)}
            activeOpacity={0.7}
          >
            {isActive && <View style={S.navPip} />}
            <View style={[S.navIconBox, isActive && S.navIconBoxActive]}>
              <Ionicons
                name={isActive ? item.icon : `${item.icon}-outline`}
                size={23}
                color={isActive ? COLOR.primary : COLOR.textLight}
              />
              {item.key === "Alerts" && <PulseBadge count={unreadCount} />}
            </View>
            <Text style={[S.navLabel, isActive && S.navLabelActive]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </>
  );
}

// ─────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────

export default function HomeScreen({ navigation }) {
  const scrollY = useRef(new Animated.Value(0)).current;
  const statusBarHeight = Platform.OS === "ios" ? 44 : StatusBar.currentHeight ?? 24;

  const [userName, setUserName] = useState("Student");
  const [isGuest, setIsGuest] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState(EMPTY_STATS);

  const sec0Anim = useEntranceAnimation(60);
  const sec1Anim = useEntranceAnimation(120);
  const sec2Anim = useEntranceAnimation(180);
  const sec3Anim = useEntranceAnimation(240);

  const featureRows = chunkArray(FEATURES, 4);

  useEffect(() => {
    let cancelled = false;
    const socket = getSocket();

    async function initGuestMode() {
      const guestMode = await isGuestMode();
      if (cancelled) return;
      setIsGuest(guestMode);
    }

    async function initUserName() {
      const guestMode = await isGuestMode();
      if (guestMode) { setUserName("Guest"); return; }
      const stored = await getUser();
      if (cancelled) return;
      if (stored?.name) setUserName(String(stored.name).split(" ")[0]);
    }

    async function initUnreadCount() {
      try {
        const res = await notificationsApi.list();
        if (cancelled) return;
        setUnreadCount((res?.data ?? []).filter((n) => n.unread).length);
      } catch {}
    }

    async function initStats() {
      try {
        const [lf, mem, cl] = await Promise.allSettled([
          lostFoundApi.list(),
          memoriesApi.list(),
          clubsApi.list(),
        ]);
        if (cancelled) return;
        setStats({
          lostFound: countToString(resolveCount(lf)),
          memories:  countToString(resolveCount(mem)),
          clubs:     countToString(resolveCount(cl)),
        });
      } catch {}
    }

    async function refreshUnreadCount() {
      try {
        const res = await notificationsApi.list();
        if (cancelled) return;
        setUnreadCount((res?.data ?? []).filter((n) => n.unread).length);
      } catch {}
    }

    initGuestMode();
    initUserName();
    initUnreadCount();
    initStats();

    socket.on("notifications:changed", refreshUnreadCount);

    return () => {
      cancelled = true;
      socket.off("notifications:changed", refreshUnreadCount);
    };
  }, []);

  function handleGuestFeaturePress(routeKey) {
    if (!isFeatureAllowedForGuest(routeKey.replace(/[^a-zA-Z_]/g, "_"))) {
      Alert.alert(
        "Guest Access",
        "This feature requires a full account. Please log in or create an account.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Log In",
            onPress: async () => {
              await exitGuestMode();
              navigation.reset({ index: 0, routes: [{ name: "Login" }] });
            },
          },
        ]
      );
    }
  }

  return (
    <View style={S.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <StickyHeader
        scrollY={scrollY}
        statusBarHeight={statusBarHeight}
        unreadCount={unreadCount}
        navigation={navigation}
      />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        decelerationRate={0.92}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        <Hero
          statusBarHeight={statusBarHeight}
          navigation={navigation}
          userName={userName}
          isGuest={isGuest}
          unreadCount={unreadCount}
          stats={stats}
        />

        {/* Campus Map Banner */}
        <Animated.View style={[sec0Anim, { marginTop: 10 }]}>
          <View style={[S.sec, { paddingHorizontal: 16 }]}>
            <TouchableOpacity
              activeOpacity={0.84}
              onPress={() => navigation?.navigate("FindLocationScreen")}
            >
              <LinearGradient colors={[COLOR.primaryDark, COLOR.primary]} style={S.mapBanner}>
                <View>
                  <Text style={S.mapBannerTitle}>📍 Explore Campus Map</Text>
                  <Text style={S.mapBannerSubtitle}>Navigate buildings, labs & canteens</Text>
                </View>
                <View style={S.mapBannerArrow}>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Core Features */}
        <Animated.View style={sec1Anim}>
          <View style={[S.sec, { marginTop: 16 }]}>
            <SectionHeader title="Core Features" />
            <View style={S.featureGrid}>
              {featureRows.map((row, rowIndex) => (
                <View key={rowIndex} style={S.featureRow}>
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
        <Animated.View style={sec2Anim}>
          <View style={S.sec}>
            <TouchableOpacity
              activeOpacity={0.82}
              style={S.aboutTile}
              onPress={() => navigation.navigate("About")}
            >
              <LinearGradient colors={[COLOR.primaryDark, COLOR.primary]} style={S.aboutTileInner}>
                <View style={S.aboutLeft}>
                  <View style={S.adityaBox}>
                    <Ionicons name="school" size={24} color="#fff" />
                    <Text style={S.adityaText}>ADITYA</Text>
                  </View>
                  <View>
                    <Text style={S.aboutTitle}>About the College</Text>
                    <Text style={S.aboutSubtitle}>Aditya University · Surampalem, AP</Text>
                  </View>
                </View>
                <View style={S.aboutArrow}>
                  <Ionicons name="chevron-forward" size={18} color="#fff" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Student Reviews */}
        <Animated.View style={sec3Anim}>
          <View style={S.sec}>
            <SectionHeader title="⭐  Student Reviews" onMore={() => {}} />
            <View style={S.fbList}>
              {FEEDBACK.map((f) => (
                <FeedbackCard key={f.id} item={f} />
              ))}
            </View>
          </View>
        </Animated.View>
      </Animated.ScrollView>

      {/* Bottom Navigation */}
      <View style={S.navWrap}>
        <LinearGradient colors={["#FFFFFFFD", COLOR.bg]} style={S.navBar}>
          {isGuest
            ? <GuestNavBar navigation={navigation} />
            : <UserNavBar navigation={navigation} unreadCount={unreadCount} />
          }
        </LinearGradient>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────

const FC = StyleSheet.create({
  card: {
    width: CARD_W,
    height: CARD_W + 36,
    backgroundColor: COLOR.surface,
    borderRadius: 16,
    paddingTop: 13,
    paddingBottom: 10,
    paddingHorizontal: 4,
    alignItems: "center",
    gap: 9,
    shadowColor: "#4A6FA530",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLOR.border,
  },
  iconBox: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_RADIUS,
    justifyContent: "center",
    alignItems: "center",
  },
  labelWrap: {
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 2,
  },
  label: {
    color: COLOR.textMid,
    fontSize: 10.5,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 14,
    letterSpacing: 0.1,
  },
});

const S = StyleSheet.create({
  // ── Layout ──────────────────────────────────
  root: { flex: 1, backgroundColor: COLOR.bg },

  // ── Sticky Header ────────────────────────────
  sticky: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 100 },
  stickyInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  stickyAppName: { color: "#fff", fontWeight: "900", fontSize: 17, letterSpacing: 0.4 },
  stickyUniName: { color: "#D6E4F0", fontSize: 11, marginTop: 1 },
  stickyBell: { padding: 4 },

  // ── Hero ─────────────────────────────────────
  heroContainer: {
    width: SCREEN_WIDTH,
    overflow: "hidden",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  heroBar: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  heroAppName: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 18,
    letterSpacing: 0.3,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroUniName: {
    color: "rgba(255,255,255,0.80)",
    fontSize: 10,
    fontWeight: "600",
    marginTop: 1,
    letterSpacing: 0.4,
  },
  bellButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(0,0,0,0.28)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },
  welcomeBlock: { position: "absolute", bottom: 70, left: 22, right: 22 },
  heroGreeting: {
    color: "rgba(255,255,255,0.90)",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.2,
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  heroName: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: 0.2,
    marginTop: 2,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  heroPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 14,
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
  },
  heroPillText: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  // ── Stats Strip ──────────────────────────────
  statsStrip: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingVertical: 13,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.10)",
  },
  statItem: { flex: 1, alignItems: "center", gap: 3 },
  statBorder: { borderRightWidth: 1, borderRightColor: "rgba(255,255,255,0.18)" },
  statValue: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  statLabel: { color: "rgba(255,255,255,0.72)", fontSize: 10, fontWeight: "600" },

  // ── Sections ─────────────────────────────────
  sec: { marginTop: 16 },
  secHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  secTitle: { fontSize: 16, fontWeight: "800", color: COLOR.textDark, letterSpacing: 0.1 },
  secMore: { fontSize: 13, fontWeight: "600", color: COLOR.primary },

  // ── Feature Grid ─────────────────────────────
  featureGrid: { paddingHorizontal: GRID_PADDING, gap: GRID_GAP },
  featureRow: { flexDirection: "row", gap: GRID_GAP },

  // ── About Tile ───────────────────────────────
  aboutTile: {
    marginHorizontal: 16,
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: COLOR.primaryDark + "44",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 14,
    elevation: 6,
  },
  aboutTileInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  aboutLeft: { flexDirection: "row", alignItems: "center", gap: 16, flex: 1 },
  adityaBox: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
    gap: 3,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
  },
  adityaText: { color: "#fff", fontSize: 7, fontWeight: "900", letterSpacing: 1.6 },
  aboutTitle: { color: "#fff", fontWeight: "800", fontSize: 15 },
  aboutSubtitle: { color: "rgba(255,255,255,0.75)", fontSize: 11, marginTop: 3 },
  aboutArrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },

  // ── Feedback ─────────────────────────────────
  fbList: { paddingHorizontal: 16, gap: 10 },
  fbCard: {
    backgroundColor: COLOR.surface,
    borderRadius: 16,
    padding: 14,
    shadowColor: COLOR.primary + "18",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLOR.border,
  },
  fbHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  fbAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  fbAvatarInitials: { color: "#fff", fontWeight: "800", fontSize: 14 },
  fbName: { color: COLOR.textDark, fontWeight: "700", fontSize: 13 },
  fbRole: { color: COLOR.textLight, fontSize: 11, marginTop: 1 },
  fbText: { color: COLOR.textMid, fontSize: 12, lineHeight: 19, fontStyle: "italic" },

  // ── Map Banner ───────────────────────────────
  mapBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 22,
    padding: 22,
    shadowColor: COLOR.primary + "44",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 14,
    elevation: 6,
  },
  mapBannerTitle: { color: "#fff", fontWeight: "800", fontSize: 16 },
  mapBannerSubtitle: { color: "#ffffffAA", fontSize: 12, marginTop: 4 },
  mapBannerArrow: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF1E",
    justifyContent: "center",
    alignItems: "center",
  },

  // ── Notification Badge ───────────────────────
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#FFB300",
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "800" },

  // ── Bottom Navigation ────────────────────────
  navWrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: "#00000018",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 20,
  },
  navBar: {
    flexDirection: "row",
    paddingBottom: Platform.OS === "ios" ? 28 : 10,
    paddingTop: 10,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: COLOR.border,
  },
  navItem: { flex: 1, alignItems: "center", gap: 4, paddingTop: 2 },
  navPip: {
    position: "absolute",
    top: -10,
    width: 28,
    height: 3,
    borderRadius: 3,
    backgroundColor: COLOR.primary,
  },
  navIconBox: {
    width: 46,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 13,
  },
  navIconBoxActive: { backgroundColor: COLOR.primary + "18" },
  navLabel: { fontSize: 10, color: COLOR.textLight, fontWeight: "600" },
  navLabelActive: { color: COLOR.primary, fontWeight: "800" },
});
