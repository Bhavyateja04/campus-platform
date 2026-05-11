import React, { useRef, useEffect, useState } from "react";
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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  getUser,
  notificationsApi,
  clubsApi,
  lostFoundApi,
  memoriesApi,
} from "../services/api";
import { getSocket } from "../services/realtime";
import FindLocationScreen from "./FindLocationScreen";
const { width } = Dimensions.get("window");

const C = {
  primary: "#4A6FA5",
  primaryDark: "#2E4D7A",
  primaryLight: "#A8C0DD",
  primaryPale: "#EBF1F8",
  orange: "#E07B3A",
  blue: "#1565C0",
  purple: "#6A1B9A",
  teal: "#00796B",
  gold: "#FFB300",
  bg: "#F5F8FC",
  surface: "#FFFFFF",
  textDark: "#0D1B2A",
  textMid: "#3D5068",
  textLight: "#8FA8C0",
  border: "#D6E4F0",
};

// ── Feature card sizing — strict fixed values so every card is identical ──────
const GRID_PAD = 16;
const GRID_GAP = 8;
// Force exact equal width for all 4 columns — no dynamic calc differences
const CARD_W = Math.floor((width - GRID_PAD * 2 - GRID_GAP * 3) / 4);
const ICON_SIZE = Math.floor(CARD_W * 0.54); // fixed icon box size
const ICON_R = Math.floor(ICON_SIZE * 0.3);

const FEATURES = [
  {
    id: "1",
    icon: "search-outline",
    label: "Lost & Found",
    grad: ["#1A237E", "#283593"],
    route: "LostAndFound",
  },
  {
    id: "2",
    icon: "map-outline",
    label: "Campus Map",
    grad: ["#4A148C", "#7B1FA2"],
    route: "CampusMap",
  },
  {
    id: "3",
    icon: "restaurant-outline",
    label: "Canteen Menu",
    grad: ["#BF360C", "#E64A19"],
    route: "CanteenMenu",
  },
  {
    id: "4",
    icon: "storefront-outline",
    label: "Campus Exchange",
    grad: ["#004D40", "#00695C"],
    route: "Marketplace",
  },
  {
    id: "5",
    icon: "briefcase-outline",
    label: "Placements",
    grad: ["#0D47A1", "#1565C0"],
    route: "Placements",
  },
  {
    id: "6",
    icon: "navigate-outline",
    label: "Exam Hall",
    grad: ["#1B5E20", "#2E7D32"],
    route: "ExamHall",
  },
  {
    id: "7",
    icon: "people-outline",
    label: "Clubs",
    grad: ["#880E4F", "#AD1457"],
    route: "Clubs",
  },
  {
    id: "8",
    icon: "images-outline",
    label: "Campus\nMemories",
    grad: ["#006064", "#00838F"],
    route: "CampusMemories",
  },
];

const FEEDBACK = [
  {
    id: "1",
    name: "Arjun Mehta",
    role: "CSE, 3rd Year",
    initials: "AM",
    gradColors: ["#4A6FA5", "#2E4D7A"],
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

const NAV = [
  { key: "Home", icon: "home", label: "Home" },
  { key: "Alerts", icon: "notifications", label: "Alerts" },
  { key: "About", icon: "school", label: "About" },
  { key: "Profile", icon: "person-circle", label: "Profile" },
];

const COLLEGE_IMG = require("../../assets/droneviewaditya.jpg");
const EASE = Easing.bezier(0.22, 1, 0.36, 1);

// ─── Hooks ────────────────────────────────────────────────────────────────────

const useEntrance = (delay = 0, dy = 24) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(dy)).current;
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
};

// ─── Small components ─────────────────────────────────────────────────────────

const PulseBadge = ({ count }) => {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!count) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.35,
          duration: 800,
          easing: EASE,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 800,
          easing: EASE,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [count]);
  if (!count || count <= 0) return null;
  return (
    <Animated.View style={[S.badge, { transform: [{ scale }] }]}>
      <Text style={S.badgeText}>{count > 9 ? "9+" : String(count)}</Text>
    </Animated.View>
  );
};

const Stars = ({ count }) => (
  <View style={{ flexDirection: "row", gap: 2 }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Ionicons
        key={i}
        name={i <= count ? "star" : "star-outline"}
        size={12}
        color={C.gold}
      />
    ))}
  </View>
);

const SecHeader = ({ title, onMore }) => (
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

// ─── FeatureCard — strict fixed size, no dynamic per-card variance ─────────────

const FeatureCard = ({ item, delay, navigation }) => {
  const anim = useEntrance(delay, 18);
  const press = useRef(new Animated.Value(1)).current;
  const onIn = () =>
    Animated.spring(press, {
      toValue: 0.93,
      speed: 22,
      bounciness: 4,
      useNativeDriver: true,
    }).start();
  const onOut = () =>
    Animated.spring(press, {
      toValue: 1,
      speed: 16,
      bounciness: 6,
      useNativeDriver: true,
    }).start();

  return (
    <Animated.View
      style={[anim, { transform: [...anim.transform, { scale: press }] }]}
    >
      <TouchableOpacity
        onPressIn={onIn}
        onPressOut={onOut}
        activeOpacity={1}
        onPress={() => item.route && navigation?.navigate(item.route)}
        style={FC.card}
      >
        {/* Gradient icon box — strictly fixed size */}
        <LinearGradient
          colors={item.grad}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={FC.iconBox}
        >
          <Ionicons
            name={item.icon}
            size={Math.floor(ICON_SIZE * 0.46)}
            color="#fff"
          />
        </LinearGradient>

        {/* Label — fixed height container so rows align */}
        <View style={FC.labelWrap}>
          <Text style={FC.label} numberOfLines={2}>
            {item.label}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const FC = StyleSheet.create({
  card: {
    // Exact fixed width — prevents any flex rounding differences
    width: CARD_W,
    height: CARD_W + 36, // icon + label zone — uniform height
    backgroundColor: C.surface,
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
    borderColor: C.border,
  },
  iconBox: {
    // Fixed size — identical for every card
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_R,
    justifyContent: "center",
    alignItems: "center",
  },
  labelWrap: {
    // Fixed height so text area never pushes card size
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 2,
  },
  label: {
    color: C.textMid,
    fontSize: 10.5,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 14,
    letterSpacing: 0.1,
  },
});

// ─── FeedbackCard ─────────────────────────────────────────────────────────────

const FeedbackCard = ({ item }) => (
  <View style={S.fbCard}>
    <View style={S.fbHeader}>
      <LinearGradient colors={item.gradColors} style={S.fbAvatar}>
        <Text style={S.fbAvatarT}>{item.initials}</Text>
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

// ─── Hero ─────────────────────────────────────────────────────────────────────

const Hero = ({ SB_H, navigation, userName, unreadCount, stats }) => {
  const HERO_H = 360 + SB_H;
  const logoAnim = useEntrance(100, -12);
  const greetAnim = useEntrance(260, 14);
  const nameAnim = useEntrance(340, 14);
  const pillAnim = useEntrance(420, 12);
  const statsAnim = useEntrance(490, 10);
  const [imgError, setImgError] = useState(false);

  return (
    <View style={[S.heroContainer, { height: HERO_H }]}>
      <ImageBackground
        source={COLLEGE_IMG}
        style={StyleSheet.absoluteFill}
        imageStyle={{ width: "100%", height: "100%" }}
        resizeMode="cover"
        onError={() => setImgError(true)}
      >
        {imgError && (
          <LinearGradient
            colors={["#2E4D7A", "#4A6FA5"]}
            style={StyleSheet.absoluteFill}
          />
        )}
      </ImageBackground>

      <LinearGradient
        colors={[
          "rgba(0,0,0,0)",
          "rgba(0,0,0,0)",
          "rgba(0,0,0,0.15)",
          "rgba(0,0,0,0.55)",
          "rgba(0,0,0,0.80)",
        ]}
        locations={[0, 0.32, 0.52, 0.76, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <Animated.View style={[S.heroBar, { top: SB_H + 14 }, logoAnim]}>
        <View style={S.brandRow}>
          <LinearGradient
            colors={[C.primary, C.primaryDark]}
            style={S.brandIcon}
          >
            <Ionicons name="school" size={17} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={S.heroApp}>Campix</Text>
            <Text style={S.heroUni}>Aditya University</Text>
          </View>
        </View>
        <TouchableOpacity
          style={S.bellBtn}
          onPress={() => navigation?.navigate("Alerts")}
        >
          <Ionicons name="notifications-outline" size={20} color="#fff" />
          <PulseBadge count={unreadCount} />
        </TouchableOpacity>
      </Animated.View>

      <View style={S.welcomeBlock}>
        <Animated.Text style={[greetAnim, S.heroHi]}>
          Welcome back,
        </Animated.Text>
        <Animated.Text style={[nameAnim, S.heroName]}>
          {userName || "Student"} 👋
        </Animated.Text>
        <Animated.View style={[pillAnim, S.heroPill]}>
          <Ionicons name="sparkles-outline" size={12} color={C.primaryLight} />
          <Text style={S.heroPillT}>Smart Student App · Aditya University</Text>
        </Animated.View>
      </View>

      <Animated.View style={[statsAnim, S.statsStrip]}>
        {[
          { val: stats.lostFound, label: "Lost & Found", icon: "search" },
          { val: stats.memories, label: "Memories", icon: "images" },
          { val: stats.clubs, label: "Clubs", icon: "trophy" },
        ].map((s, i) => (
          <View key={i} style={[S.statItem, i < 2 && S.statBorder]}>
            <Ionicons name={s.icon} size={15} color="rgba(255,255,255,0.85)" />
            <Text style={S.statVal}>{s.val}</Text>
            <Text style={S.statLabel}>{s.label}</Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
};

// ─── HomeScreen ───────────────────────────────────────────────────────────────

export default function HomeScreen({ navigation }) {
  const scrollY = useRef(new Animated.Value(0)).current;
  const SB_H = Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 24;

  const stickyOp = scrollY.interpolate({
    inputRange: [0, 160],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const [userName, setUserName] = useState("Student");
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState({
    lostFound: "—",
    memories: "—",
    clubs: "—",
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const stored = await getUser();
      if (cancelled) return;
      if (stored?.name) setUserName(String(stored.name).split(" ")[0]);
    })();

    (async () => {
      try {
        const res = await notificationsApi.list();
        if (cancelled) return;
        setUnreadCount((res?.data || []).filter((n) => n.unread).length);
      } catch {}
    })();

    (async () => {
      try {
        const [lf, mem, cl] = await Promise.allSettled([
          lostFoundApi.list(),
          memoriesApi.list(),
          clubsApi.list(),
        ]);
        if (cancelled) return;
        const lfCount =
          lf.status === "fulfilled" ? lf.value?.data?.length || 0 : null;
        const memCount =
          mem.status === "fulfilled"
            ? Array.isArray(mem.value)
              ? mem.value.length
              : 0
            : null;
        const clCount =
          cl.status === "fulfilled"
            ? Array.isArray(cl.value)
              ? cl.value.length
              : 0
            : null;
        setStats({
          lostFound: lfCount != null ? String(lfCount) : "—",
          memories: memCount != null ? String(memCount) : "—",
          clubs: clCount != null ? String(clCount) : "—",
        });
      } catch {}
    })();

    const socket = getSocket();
    const refreshUnreadCount = async () => {
      try {
        const res = await notificationsApi.list();
        if (cancelled) return;
        setUnreadCount((res?.data || []).filter((n) => n.unread).length);
      } catch {}
    };

    socket.on("notifications:changed", refreshUnreadCount);

    return () => {
      cancelled = true;
      socket.off("notifications:changed", refreshUnreadCount);
    };
  }, []);

  // ✅ FIX 1: Reduced marginTop from 24 → 10 to close gap after hero
  const sec0Anim = useEntrance(60);
  const sec1Anim = useEntrance(120);
  const sec2Anim = useEntrance(180);
  const sec3Anim = useEntrance(240);

  const handleNav = (routeKey) => {
    if (routeKey === "Home") return;
    navigation.navigate(routeKey);
  };

  // Split features into rows of 4
  const featureRows = [];
  for (let i = 0; i < FEATURES.length; i += 4) {
    featureRows.push(FEATURES.slice(i, i + 4));
  }

  return (
    <View style={S.root}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Sticky header */}
      <Animated.View
        style={[S.sticky, { opacity: stickyOp }]}
        pointerEvents="box-none"
      >
        <LinearGradient
          colors={[C.primary + "F9", C.primaryDark + "F9"]}
          style={[S.stickyInner, { paddingTop: SB_H + 8 }]}
        >
          <View>
            <Text style={S.stickyApp}>Campix</Text>
            <Text style={S.stickyUni}>Aditya University</Text>
          </View>
          <TouchableOpacity
            style={S.stickyBell}
            onPress={() => navigation.navigate("Alerts")}
          >
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
        <Hero
          SB_H={SB_H}
          navigation={navigation}
          userName={userName}
          unreadCount={unreadCount}
          stats={stats}
        />

        {/* ── Campus Map Banner — ✅ FIX: marginTop 24→10 closes the gap ── */}
        <Animated.View style={[sec0Anim, { marginTop: 10 }]}>
          <View style={[S.sec, { paddingHorizontal: 16 }]}>
            <TouchableOpacity
              activeOpacity={0.84}
              onPress={() => navigation?.navigate("FindLocationScreen")}
            >
              <LinearGradient
                colors={[C.primaryDark, C.primary]}
                style={S.mapBanner}
              >
                <View>
                  <Text style={S.mapTitle}>📍 Explore Campus Map</Text>
                  <Text style={S.mapSub}>
                    Navigate buildings, labs & canteens
                  </Text>
                </View>
                <View style={S.mapArrow}>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ── Core Features ── */}
        <Animated.View style={sec1Anim}>
          {/* ✅ FIX: marginTop 24→16 tightens the section gap */}
          <View style={[S.sec, { marginTop: 16 }]}>
            <SecHeader title="Core Features" />
            {/* ✅ FIX 2: featureGrid uses fixed gap, rows use fixed gap */}
            <View style={S.featureGrid}>
              {featureRows.map((row, rowIdx) => (
                <View key={rowIdx} style={S.featureRow}>
                  {row.map((f, colIdx) => (
                    <FeatureCard
                      key={f.id}
                      item={f}
                      delay={60 + (rowIdx * 4 + colIdx) * 35}
                      navigation={navigation}
                    />
                  ))}
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* ── About the College ── */}
        <Animated.View style={sec2Anim}>
          <View style={S.sec}>
            <TouchableOpacity
              activeOpacity={0.82}
              style={S.aboutTile}
              onPress={() => navigation.navigate("About")}
            >
              <LinearGradient
                colors={[C.primaryDark, C.primary]}
                style={S.aboutTileInner}
              >
                <View style={S.aboutLeft}>
                  <View style={S.adityaBox}>
                    <Ionicons name="school" size={24} color="#fff" />
                    <Text style={S.adityaText}>ADITYA</Text>
                  </View>
                  <View>
                    <Text style={S.aboutTitle}>About the College</Text>
                    <Text style={S.aboutSub}>
                      Aditya University · Surampalem, AP
                    </Text>
                  </View>
                </View>
                <View style={S.aboutArrow}>
                  <Ionicons name="chevron-forward" size={18} color="#fff" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ── Student Reviews ── */}
        <Animated.View style={sec3Anim}>
          <View style={S.sec}>
            <SecHeader title="⭐  Student Reviews" onMore={() => {}} />
            <View style={S.fbList}>
              {FEEDBACK.map((f) => (
                <FeedbackCard key={f.id} item={f} />
              ))}
            </View>
          </View>
        </Animated.View>
      </Animated.ScrollView>

      {/* ── Bottom Nav ── */}
      <View style={S.navWrap}>
        <LinearGradient colors={["#FFFFFFFD", C.bg]} style={S.navBar}>
          {NAV.map((item) => {
            const on = item.key === "Home";
            return (
              <TouchableOpacity
                key={item.key}
                style={S.navItem}
                onPress={() => handleNav(item.key)}
                activeOpacity={0.7}
              >
                {on && <View style={S.navPip} />}
                <View style={[S.navIconBox, on && S.navIconBoxOn]}>
                  <Ionicons
                    name={on ? item.icon : item.icon + "-outline"}
                    size={23}
                    color={on ? C.primary : C.textLight}
                  />
                  {item.key === "Alerts" && <PulseBadge />}
                </View>
                <Text style={[S.navLabel, on && S.navLabelOn]}>
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  sticky: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 100 },
  stickyInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  stickyApp: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 17,
    letterSpacing: 0.4,
  },
  stickyUni: { color: "#D6E4F0", fontSize: 11, marginTop: 1 },
  stickyBell: { padding: 4 },

  heroContainer: {
    width,
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
  heroApp: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 18,
    letterSpacing: 0.3,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroUni: {
    color: "rgba(255,255,255,0.80)",
    fontSize: 10,
    fontWeight: "600",
    marginTop: 1,
    letterSpacing: 0.4,
  },
  bellBtn: {
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
  heroHi: {
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
  heroPillT: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

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
  statBorder: {
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.18)",
  },
  statVal: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  statLabel: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 10,
    fontWeight: "600",
  },

  // ✅ FIX: sec marginTop reduced to 16 (was 24) — tighter spacing overall
  sec: { marginTop: 16 },
  secHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  secTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: C.textDark,
    letterSpacing: 0.1,
  },
  secMore: { fontSize: 13, fontWeight: "600", color: C.primary },

  // ✅ FIX 2: Feature grid — fixed gap, rows are flex with fixed gap
  featureGrid: { paddingHorizontal: GRID_PAD, gap: GRID_GAP },
  featureRow: { flexDirection: "row", gap: GRID_GAP },

  aboutTile: {
    marginHorizontal: 16,
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: C.primaryDark + "44",
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
  adityaText: {
    color: "#fff",
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1.6,
  },
  aboutTitle: { color: "#fff", fontWeight: "800", fontSize: 15 },
  aboutSub: { color: "rgba(255,255,255,0.75)", fontSize: 11, marginTop: 3 },
  aboutArrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },

  fbList: { paddingHorizontal: 16, gap: 10 },
  fbCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 14,
    shadowColor: C.primary + "18",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: C.border,
  },
  fbHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  fbAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  fbAvatarT: { color: "#fff", fontWeight: "800", fontSize: 14 },
  fbName: { color: C.textDark, fontWeight: "700", fontSize: 13 },
  fbRole: { color: C.textLight, fontSize: 11, marginTop: 1 },
  fbText: {
    color: C.textMid,
    fontSize: 12,
    lineHeight: 19,
    fontStyle: "italic",
  },

  mapBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 22,
    padding: 22,
    shadowColor: C.primary + "44",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 14,
    elevation: 6,
  },
  mapTitle: { color: "#fff", fontWeight: "800", fontSize: 16 },
  mapSub: { color: "#ffffffAA", fontSize: 12, marginTop: 4 },
  mapArrow: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF1E",
    justifyContent: "center",
    alignItems: "center",
  },

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
    borderColor: C.border,
  },
  navItem: { flex: 1, alignItems: "center", gap: 4, paddingTop: 2 },
  navPip: {
    position: "absolute",
    top: -10,
    width: 28,
    height: 3,
    borderRadius: 3,
    backgroundColor: C.primary,
  },
  navIconBox: {
    width: 46,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 13,
  },
  navIconBoxOn: { backgroundColor: C.primary + "18" },
  navLabel: { fontSize: 10, color: C.textLight, fontWeight: "600" },
  navLabelOn: { color: C.primary, fontWeight: "800" },
});
