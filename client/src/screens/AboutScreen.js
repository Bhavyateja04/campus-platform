import React, { useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  StatusBar, Animated, Easing, Platform, Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const C = {
  primary:     '#4A6FA5',
  primaryDark: '#2E4D7A',
  primaryPale: '#EBF1F8',
  orange:      '#E07B3A',
  teal:        '#00796B',
  gold:        '#FFB300',
  purple:      '#6A1B9A',
  bg:          '#F5F8FC',
  surface:     '#FFFFFF',
  textDark:    '#0D1B2A',
  textMid:     '#3D5068',
  textLight:   '#8FA8C0',
  border:      '#D6E4F0',
};

const EASE = Easing.bezier(0.22, 1, 0.36, 1);
const useEntrance = (delay = 0, dy = 20) => {
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(dy)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 580, delay, easing: EASE, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 580, delay, easing: EASE, useNativeDriver: true }),
    ]).start();
  }, []);
  return { opacity, transform: [{ translateY }] };
};

const COLLEGE_STATS = [
  { val: '1995', label: 'Est. Year',   icon: 'calendar-outline'    },
  { val: '12K+', label: 'Students',    icon: 'people-outline'      },
  { val: '200+', label: 'Faculty',     icon: 'person-outline'      },
  { val: '50+',  label: 'Clubs',       icon: 'trophy-outline'      },
];

const APP_FEATURES = [
  { icon: 'search-outline',     label: 'Lost & Found',     desc: 'Report and recover lost items on campus',    color: C.primary  },
  { icon: 'map-outline',        label: 'Campus Map',       desc: 'Navigate buildings, labs & facilities',      color: C.purple   },
  { icon: 'restaurant-outline', label: 'Canteen Menu',     desc: 'Daily menus from all campus canteens',       color: C.orange   },
  { icon: 'storefront-outline', label: '2nd Hand Market',  desc: 'Buy & sell items within the campus',         color: C.teal     },
  { icon: 'briefcase-outline',  label: 'Placements',       desc: 'Placement notices, drives and prep tips',    color: C.primaryDark },
  { icon: 'navigate-outline',   label: 'Exam Hall Finder', desc: 'Find your exam hall quickly',                color: '#1565C0'  },
  { icon: 'people-outline',     label: 'Clubs',            desc: 'Explore and join student clubs',             color: C.purple   },
  { icon: 'images-outline',     label: 'Campus Memories',  desc: 'Share and explore campus photos',            color: C.teal     },
];

const TEAM = [
  { name: 'Varshitha', role: 'Lead Developer', initials: 'VA', grad: [C.primary, C.primaryDark] },
  { name: 'Ravi Teja',  role: 'UI/UX Design',  initials: 'RT', grad: [C.teal, '#004D40']       },
  { name: 'Sai Priya', role: 'Backend Dev',    initials: 'SP', grad: [C.purple, '#4A148C']      },
];

export default function AboutScreen({ navigation }) {
  const SB_H = Platform.OS === 'ios' ? 44 : (StatusBar.currentHeight || 24);

  const h0 = useEntrance(60, -12);
  const h1 = useEntrance(160, 16);
  const h2 = useEntrance(220, 16);
  const h3 = useEntrance(280, 16);
  const h4 = useEntrance(340, 16);
  const h5 = useEntrance(400, 16);

  return (
    <View style={S.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* HEADER */}
      <Animated.View style={h0}>
        <LinearGradient colors={[C.primary, C.primaryDark]} style={[S.header, { paddingTop: SB_H + 12 }]}>
          <TouchableOpacity style={S.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={S.headerTitle}>About Campix</Text>
          <View style={{ width: 38 }} />
        </LinearGradient>

        {/* APP HERO */}
        <LinearGradient colors={[C.primaryDark, C.primary]} style={S.appHero}>
          <View style={S.appLogoWrap}>
            <LinearGradient colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']} style={S.appLogo}>
              <Ionicons name="school" size={36} color="#fff" />
            </LinearGradient>
          </View>
          <Text style={S.appName}>Campix</Text>
          <Text style={S.appTagline}>Your Smart Student Companion</Text>
          <View style={S.versionPill}>
            <Text style={S.versionPillT}>v1.0.0  ·  Aditya University  ·  2025</Text>
          </View>
        </LinearGradient>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* ABOUT CAMPIX */}
        <Animated.View style={[h1, S.sec]}>
          <Text style={S.secLabel}>About the App</Text>
          <View style={S.card}>
            <Text style={S.bodyText}>
              Campix is the official smart student app for Aditya University, Surampalem. Designed to make campus life easier, more connected, and more fun — all from a single, beautifully crafted platform.
            </Text>
            <Text style={[S.bodyText, { marginTop: 10 }]}>
              From finding a lost ID card to exploring campus clubs, checking the canteen menu, or preparing for placements — Campix puts everything you need, right at your fingertips.
            </Text>
          </View>
        </Animated.View>

        {/* COLLEGE STATS */}
        <Animated.View style={[h2, S.sec]}>
          <Text style={S.secLabel}>Aditya University</Text>
          <View style={S.statsGrid}>
            {COLLEGE_STATS.map((s, i) => (
              <View key={i} style={S.statBox}>
                <LinearGradient colors={[C.primary, C.primaryDark]} style={S.statIcon}>
                  <Ionicons name={s.icon} size={18} color="#fff" />
                </LinearGradient>
                <Text style={S.statVal}>{s.val}</Text>
                <Text style={S.statLbl}>{s.label}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* FEATURES */}
        <Animated.View style={[h3, S.sec]}>
          <Text style={S.secLabel}>App Features</Text>
          <View style={S.card}>
            {APP_FEATURES.map((f, i) => (
              <View key={i} style={[S.featureRow, i < APP_FEATURES.length - 1 && S.featureRowBorder]}>
                <View style={[S.featureIcon, { backgroundColor: f.color + '18' }]}>
                  <Ionicons name={f.icon} size={18} color={f.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={S.featureName}>{f.label}</Text>
                  <Text style={S.featureDesc}>{f.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* TEAM */}
        <Animated.View style={[h4, S.sec]}>
          <Text style={S.secLabel}>Built by Students, for Students</Text>
          <View style={S.teamRow}>
            {TEAM.map((m, i) => (
              <View key={i} style={S.teamCard}>
                <LinearGradient colors={m.grad} style={S.teamAvatar}>
                  <Text style={S.teamInitials}>{m.initials}</Text>
                </LinearGradient>
                <Text style={S.teamName}>{m.name}</Text>
                <Text style={S.teamRole}>{m.role}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* CONTACT */}
        <Animated.View style={[h5, S.sec]}>
          <Text style={S.secLabel}>Connect With Us</Text>
          <View style={S.card}>
            {[
              { icon: 'globe-outline',  label: 'Website',  val: 'www.adityauniversity.in', color: C.primary, action: () => Linking.openURL('https://www.adityauniversity.in') },
              { icon: 'mail-outline',   label: 'Email',    val: 'campix@aditya.edu.in',   color: C.teal    },
              { icon: 'logo-instagram', label: 'Instagram',val: '@campix_app',             color: C.purple  },
            ].map((item, i, arr) => (
              <TouchableOpacity key={i} style={[S.contactRow, i < arr.length - 1 && S.contactBorder]}
                onPress={item.action} activeOpacity={0.7}>
                <View style={[S.contactIcon, { backgroundColor: item.color + '18' }]}>
                  <Ionicons name={item.icon} size={18} color={item.color} />
                </View>
                <View>
                  <Text style={S.contactLabel}>{item.label}</Text>
                  <Text style={[S.contactVal, { color: item.color }]}>{item.val}</Text>
                </View>
                <Ionicons name="open-outline" size={14} color={C.textLight} style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <Text style={S.footer}>
          Made with ❤️ at Aditya University, Surampalem, Andhra Pradesh
        </Text>
      </ScrollView>
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 0 },
  headerTitle: { color: '#fff', fontWeight: '900', fontSize: 18 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center' },

  appHero: { alignItems: 'center', paddingVertical: 36, paddingTop: 20 },
  appLogoWrap: { marginBottom: 14 },
  appLogo: { width: 80, height: 80, borderRadius: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  appName:    { color: '#fff', fontWeight: '900', fontSize: 30, letterSpacing: 0.4 },
  appTagline: { color: 'rgba(255,255,255,0.80)', fontSize: 13, marginTop: 4, fontWeight: '600' },
  versionPill:{ marginTop: 14, backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 16, paddingVertical: 7, borderRadius: 22 },
  versionPillT: { color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '600' },

  sec: { marginTop: 22, paddingHorizontal: 16 },
  secLabel: { fontSize: 13, fontWeight: '800', color: C.textMid, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 },

  card: { backgroundColor: C.surface, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: C.border, shadowColor: '#00000010', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },

  bodyText: { color: C.textMid, fontSize: 14, lineHeight: 22, padding: 16 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statBox: { flex: 1, minWidth: '45%', backgroundColor: C.surface, borderRadius: 18, alignItems: 'center', paddingVertical: 20, gap: 8, borderWidth: 1, borderColor: C.border, shadowColor: '#00000010', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 1 },
  statIcon: { width: 44, height: 44, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  statVal:  { color: C.textDark, fontWeight: '900', fontSize: 22 },
  statLbl:  { color: C.textLight, fontSize: 11, fontWeight: '600' },

  featureRow:       { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 13 },
  featureRowBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  featureIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  featureName: { color: C.textDark, fontWeight: '700', fontSize: 14 },
  featureDesc: { color: C.textLight, fontSize: 11, marginTop: 2 },

  teamRow: { flexDirection: 'row', gap: 10 },
  teamCard: { flex: 1, backgroundColor: C.surface, borderRadius: 18, alignItems: 'center', paddingVertical: 20, gap: 8, borderWidth: 1, borderColor: C.border },
  teamAvatar: { width: 54, height: 54, borderRadius: 27, justifyContent: 'center', alignItems: 'center' },
  teamInitials: { color: '#fff', fontWeight: '900', fontSize: 18 },
  teamName: { color: C.textDark, fontWeight: '800', fontSize: 13 },
  teamRole: { color: C.textLight, fontSize: 10, fontWeight: '600', textAlign: 'center' },

  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  contactBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  contactIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  contactLabel: { color: C.textLight, fontSize: 11, fontWeight: '600' },
  contactVal:   { fontSize: 13, fontWeight: '700', marginTop: 2 },

  footer: { textAlign: 'center', color: C.textLight, fontSize: 12, marginTop: 28, marginBottom: 8, paddingHorizontal: 32, lineHeight: 18 },
});