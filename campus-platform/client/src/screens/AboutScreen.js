import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  Easing,
  Platform,
  Linking,
  Image,
  Dimensions,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// ─────────────────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────────────────

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

// ─────────────────────────────────────────────────────────
//  Data
// ─────────────────────────────────────────────────────────

const COLLEGE_STATS = [
  { val: 'A+',  label: 'NAAC Rating',  icon: 'ribbon-outline'  },
  { val: '12K+', label: 'Students',    icon: 'people-outline'  },
  { val: '200+', label: 'Faculty',     icon: 'person-outline'  },
  { val: '50+',  label: 'Departments', icon: 'school-outline'  },
];

const CAMPUS_IMAGES = [
  {
    uri:     'https://ik.imagekit.io/lhb4hvprkpz/wifi_2tU1IcdcN.jpg?updatedAt=1627469037857',
    caption: 'Wi-Fi Enabled Campus',
  },
  {
    uri:     'https://ik.imagekit.io/lhb4hvprkpz/hostel-1_3mKkzFot1.jpg?updatedAt=1627470077377',
    caption: 'Hostel Facility',
  },
  {
    uri:     'https://ik.imagekit.io/lhb4hvprkpz/zym_ZoidnRVOV.jpg?updatedAt=1627469080425',
    caption: 'Sports & Fitness',
  },
];

const UNIVERSITY_FEATURES = [
  { icon: 'library-outline',  label: 'Central Library',  desc: 'Modern digital and physical library facilities',         color: C.primary     },
  { icon: 'desktop-outline',  label: 'Computer Labs',    desc: 'Advanced laboratories with latest technology',           color: C.purple      },
  { icon: 'people-outline',   label: 'Student Clubs',    desc: 'Technical, cultural and social activity clubs',          color: C.orange      },
  { icon: 'briefcase-outline', label: 'Placements',      desc: 'Top placement training and recruitment drives',          color: C.teal        },
  { icon: 'flask-outline',    label: 'Research Labs',    desc: 'Innovation and research focused laboratories',           color: C.primaryDark },
  { icon: 'football-outline', label: 'Sports Facilities',desc: 'Indoor and outdoor sports infrastructure',               color: '#1565C0'     },
  { icon: 'business-outline', label: 'Modern Campus',    desc: 'Smart classrooms and modern infrastructure',             color: C.purple      },
  { icon: 'cafe-outline',     label: 'Cafeteria',        desc: 'Healthy food and spacious dining areas',                 color: C.teal        },
];

// ─────────────────────────────────────────────────────────
//  Custom Hook — Entrance Animation
// ─────────────────────────────────────────────────────────

const useEntrance = (delay = 0, dy = 20) => {
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(dy)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue:         1,
        duration:        580,
        delay,
        easing:          EASE,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue:         0,
        duration:        580,
        delay,
        easing:          EASE,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return { opacity, transform: [{ translateY }] };
};

// ─────────────────────────────────────────────────────────
//  Component — Aditya Logo Hero
// ─────────────────────────────────────────────────────────

function AdityaLogoHero() {
  return (
    <View style={logoS.hero}>

      {/* Glowing rings around the logo */}
      <View style={logoS.outerRing}>
        <View style={logoS.innerRing}>
          <View style={logoS.badge}>
            <Image
              source={require('../../assets/aditya.jpg')}
              style={logoS.logoImg}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>

      {/* University name */}
      <Text style={logoS.uniName}>Aditya University</Text>

      {/* Gold ornamental divider */}
      <View style={logoS.divider}>
        <View style={logoS.divLine} />
        <View style={logoS.divDot}  />
        <View style={logoS.divLine} />
      </View>

      <Text style={logoS.uniSub}>Surampalem, Andhra Pradesh</Text>

      {/* Quick-stat badge row */}
      <View style={logoS.badgeRow}>
        <View style={logoS.naacBadge}>
          <Text style={logoS.naacGrade}>A+</Text>
          <Text style={logoS.naacLabel}>NAAC</Text>
        </View>

        <View style={logoS.separator} />

        <View style={logoS.naacBadge}>
          <Text style={logoS.naacGrade}>24+</Text>
          <Text style={logoS.naacLabel}>Years</Text>
        </View>

        <View style={logoS.separator} />

        <View style={logoS.naacBadge}>
          <Text style={logoS.naacGrade}>12K+</Text>
          <Text style={logoS.naacLabel}>Students</Text>
        </View>
      </View>

    </View>
  );
}

const logoS = StyleSheet.create({
  hero: {
    alignItems:    'center',
    paddingVertical: 10,
    gap:           8,
  },

  outerRing: {
    width:           116,
    height:          116,
    borderRadius:    58,
    borderWidth:     1.5,
    borderColor:     'rgba(255,255,255,0.25)',
    justifyContent:  'center',
    alignItems:      'center',
    marginBottom:    4,
  },

  innerRing: {
    width:          98,
    height:         98,
    borderRadius:   49,
    borderWidth:    2,
    borderColor:    'rgba(255,255,255,0.45)',
    justifyContent: 'center',
    alignItems:     'center',
  },

  badge: {
    width:           84,
    height:          84,
    borderRadius:    42,
    backgroundColor: '#FFFFFF',
    justifyContent:  'center',
    alignItems:      'center',
    shadowColor:     '#000',
    shadowOpacity:   0.35,
    shadowRadius:    14,
    shadowOffset:    { width: 0, height: 6 },
    elevation:       12,
    overflow:        'hidden',
  },

  logoImg: {
    width:  72,
    height: 72,
  },

  uniName: {
    color:            '#FFFFFF',
    fontSize:         26,
    fontWeight:       '800',
    letterSpacing:    0.8,
    textShadowColor:  'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },

  divider: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           6,
    marginVertical: 2,
  },
  divLine: {
    width:           50,
    height:          1,
    backgroundColor: '#FFB300',
    opacity:         0.8,
  },
  divDot: {
    width:           5,
    height:          5,
    borderRadius:    2.5,
    backgroundColor: '#FFB300',
  },

  uniSub: {
    color:        'rgba(255,255,255,0.75)',
    fontSize:     12,
    fontWeight:   '500',
    letterSpacing: 0.5,
  },

  badgeRow: {
    flexDirection:   'row',
    alignItems:      'center',
    marginTop:       6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius:    20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.2)',
    gap:             0,
  },

  naacBadge: {
    alignItems:    'center',
    paddingHorizontal: 16,
  },
  naacGrade: {
    color:      '#FFD54F',
    fontWeight: '900',
    fontSize:   16,
    lineHeight: 18,
  },
  naacLabel: {
    color:        'rgba(255,255,255,0.7)',
    fontSize:     9,
    fontWeight:   '600',
    letterSpacing: 0.5,
  },

  separator: {
    width:           1,
    height:          28,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
});

// ─────────────────────────────────────────────────────────
//  Component — Campus Image Slideshow
// ─────────────────────────────────────────────────────────

function ImageSlideshow() {
  const [activeIdx, setActiveIdx] = useState(0);
  const flatRef  = useRef(null);
  const autoRef  = useRef(null);

  useEffect(() => {
    autoRef.current = setInterval(() => {
      setActiveIdx(prev => {
        const next = (prev + 1) % CAMPUS_IMAGES.length;
        flatRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 3000);

    return () => clearInterval(autoRef.current);
  }, []);

  const onScroll = e => {
    const idx = Math.round(
      e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 32)
    );
    setActiveIdx(idx);
  };

  return (
    <View style={slide.wrap}>
      <FlatList
        ref={flatRef}
        data={CAMPUS_IMAGES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={SCREEN_WIDTH - 32}
        decelerationRate="fast"
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <View style={slide.item}>
            <Image
              source={{ uri: item.uri }}
              style={slide.img}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.55)']}
              style={slide.overlay}
            >
              <Text style={slide.caption}>{item.caption}</Text>
            </LinearGradient>
          </View>
        )}
      />

      {/* Dot indicators */}
      <View style={slide.dots}>
        {CAMPUS_IMAGES.map((_, i) => (
          <View
            key={i}
            style={[slide.dot, i === activeIdx && slide.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

const slide = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginTop:        10,
    borderRadius:     20,
    overflow:         'hidden',
    borderWidth:      1,
    borderColor:      C.border,
  },

  item: {
    width:           SCREEN_WIDTH - 32,
    height:          200,
    backgroundColor: C.primaryPale,
    position:        'relative',
  },

  img: {
    width:  '100%',
    height: '100%',
  },

  overlay: {
    position:        'absolute',
    bottom:          0,
    left:            0,
    right:           0,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  caption: {
    color:      '#fff',
    fontWeight: '700',
    fontSize:   13,
  },

  dots: {
    position:      'absolute',
    bottom:        10,
    right:         14,
    flexDirection: 'row',
    gap:           5,
  },

  dot: {
    width:           6,
    height:          6,
    borderRadius:    3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },

  dotActive: {
    backgroundColor: '#fff',
    width:           14,
  },
});

// ─────────────────────────────────────────────────────────
//  Screen — About
// ─────────────────────────────────────────────────────────

export default function AboutScreen({ navigation }) {
  const SB_H = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24;

  // Staggered entrance animations
  const h0 = useEntrance(60,  -12);
  const h1 = useEntrance(160,  16);
  const h2 = useEntrance(220,  16);
  const h3 = useEntrance(280,  16);
  const h4 = useEntrance(340,  16);
  const h5 = useEntrance(400,  16);

  // Contact items config
  const CONTACT_ITEMS = [
    {
      icon:   'globe-outline',
      label:  'Website',
      val:    'www.adityauniversity.in',
      color:  C.primary,
      action: () => Linking.openURL('https://www.adityauniversity.in'),
    },
    {
      icon:  'mail-outline',
      label: 'Email',
      val:   'info@adityauniversity.in',
      color: C.teal,
    },
    {
      icon:  'logo-instagram',
      label: 'Instagram',
      val:   '@adityauniversity',
      color: C.purple,
    },
  ];

  return (
    <View style={S.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── Header + Hero ── */}
      <Animated.View style={h0}>
        <LinearGradient
          colors={[C.primary, C.primaryDark]}
          style={[S.header, { paddingTop: SB_H + 12 }]}
        >
          <TouchableOpacity style={S.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>

          <Text style={S.headerTitle}>About Aditya University</Text>

          {/* Spacer to balance the back button */}
          <View style={{ width: 38 }} />
        </LinearGradient>

        <LinearGradient colors={[C.primaryDark, C.primary]} style={S.appHero}>
          <AdityaLogoHero />
        </LinearGradient>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >

        {/* ── About — split layout ── */}
        <Animated.View style={[h1, S.sec]}>
          <Text style={S.secLabel}>About the University</Text>

          {/* Row 1: image left, text right */}
          <View style={S.splitCard}>
            <View style={S.splitImgWrap}>
              <Image
                source={{ uri: 'https://ik.imagekit.io/lhb4hvprkpz/1_ycquTeVGC.jpg?updatedAt=1627469248691' }}
                style={S.splitImgPhoto}
                resizeMode="cover"
              />
            </View>
            <View style={S.splitText}>
              <Text style={S.splitHeading}>Aditya University</Text>
              <Text style={S.splitBody}>
                One of the leading institutions in Andhra Pradesh, known for
                academic excellence, innovation, and modern campus facilities.
              </Text>
            </View>
          </View>

          {/* Row 2: text left, image right */}
          <View style={[S.splitCard, { marginTop: 10 }]}>
            <View style={S.splitText}>
              <Text style={S.splitHeading}>Holistic Development</Text>
              <Text style={S.splitBody}>
                Students are encouraged to participate in technical events,
                cultural activities, placements, research programs, and
                student clubs.
              </Text>
            </View>
            <View style={S.splitImgWrap}>
              <Image
                source={{ uri: 'https://ik.imagekit.io/lhb4hvprkpz/2_Gq3MZHfTS.jpg?updatedAt=1627469249245' }}
                style={S.splitImgPhoto}
                resizeMode="cover"
              />
            </View>
          </View>
        </Animated.View>

        {/* ── Campus Gallery ── */}
        <Animated.View style={h2}>
          <Text style={[S.secLabel, { marginHorizontal: 16, marginTop: 22 }]}>
            Campus Gallery
          </Text>
          <ImageSlideshow />
        </Animated.View>

        {/* ── Stats ── */}
        <Animated.View style={[h3, S.sec]}>
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

        {/* ── University Facilities ── */}
        <Animated.View style={[h4, S.sec]}>
          <Text style={S.secLabel}>University Facilities</Text>

          <View style={S.card}>
            {UNIVERSITY_FEATURES.map((f, i) => (
              <View
                key={i}
                style={[
                  S.featureRow,
                  i < UNIVERSITY_FEATURES.length - 1 && S.featureRowBorder,
                ]}
              >
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

        {/* ── Contact Information ── */}
        <Animated.View style={[h5, S.sec]}>
          <Text style={S.secLabel}>Contact Information</Text>

          <View style={S.card}>
            {CONTACT_ITEMS.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  S.contactRow,
                  i < CONTACT_ITEMS.length - 1 && S.contactBorder,
                ]}
                onPress={item.action}
                activeOpacity={0.7}
              >
                <View style={[S.contactIcon, { backgroundColor: item.color + '18' }]}>
                  <Ionicons name={item.icon} size={18} color={item.color} />
                </View>
                <View>
                  <Text style={S.contactLabel}>{item.label}</Text>
                  <Text style={[S.contactVal, { color: item.color }]}>{item.val}</Text>
                </View>
                <Ionicons
                  name="open-outline"
                  size={14}
                  color={C.textLight}
                  style={{ marginLeft: 'auto' }}
                />
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <Text style={S.footer}>
          Aditya University • Surampalem • Andhra Pradesh
        </Text>
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────
//  Styles — Main Screen
// ─────────────────────────────────────────────────────────

const S = StyleSheet.create({
  root: {
    flex:            1,
    backgroundColor: C.bg,
  },

  // Header
  header: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    paddingHorizontal: 20,
    paddingBottom:   0,
  },
  headerTitle: {
    color:      '#fff',
    fontWeight: '900',
    fontSize:   18,
  },
  backBtn: {
    width:           38,
    height:          38,
    borderRadius:    19,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent:  'center',
    alignItems:      'center',
  },

  // Hero
  appHero: {
    alignItems:      'center',
    paddingVertical: 30,
    paddingTop:      20,
    paddingHorizontal: 16,
  },

  // Section
  sec: {
    marginTop:       22,
    paddingHorizontal: 16,
  },
  secLabel: {
    fontSize:      13,
    fontWeight:    '800',
    color:         C.textMid,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom:  10,
  },

  // Split card layout
  splitCard: {
    flexDirection:   'row',
    backgroundColor: C.surface,
    borderRadius:    20,
    overflow:        'hidden',
    borderWidth:     1,
    borderColor:     C.border,
    elevation:       2,
  },
  splitImgWrap: {
    width:    '42%',
    overflow: 'hidden',
  },
  splitImgPhoto: {
    width:  '100%',
    height: 130,
  },
  splitText: {
    flex:           1,
    padding:        14,
    justifyContent: 'center',
    gap:            6,
  },
  splitHeading: {
    color:      C.textDark,
    fontWeight: '800',
    fontSize:   13,
    lineHeight: 18,
  },
  splitBody: {
    color:      C.textMid,
    fontSize:   12,
    lineHeight: 18,
  },

  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           10,
  },
  statBox: {
    flex:            1,
    minWidth:        '45%',
    backgroundColor: C.surface,
    borderRadius:    18,
    alignItems:      'center',
    paddingVertical: 20,
    gap:             8,
    borderWidth:     1,
    borderColor:     C.border,
  },
  statIcon: {
    width:          44,
    height:         44,
    borderRadius:   13,
    justifyContent: 'center',
    alignItems:     'center',
  },
  statVal: {
    color:      C.textDark,
    fontWeight: '900',
    fontSize:   22,
  },
  statLbl: {
    color:      C.textLight,
    fontSize:   11,
    fontWeight: '600',
  },

  // Card
  card: {
    backgroundColor: C.surface,
    borderRadius:    20,
    overflow:        'hidden',
    borderWidth:     1,
    borderColor:     C.border,
    elevation:       2,
  },

  // Feature rows
  featureRow: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             14,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  featureRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  featureIcon: {
    width:          40,
    height:         40,
    borderRadius:   12,
    justifyContent: 'center',
    alignItems:     'center',
  },
  featureName: {
    color:      C.textDark,
    fontWeight: '700',
    fontSize:   14,
  },
  featureDesc: {
    color:     C.textLight,
    fontSize:  11,
    marginTop: 2,
  },

  // Contact rows
  contactRow: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  contactBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  contactIcon: {
    width:          40,
    height:         40,
    borderRadius:   12,
    justifyContent: 'center',
    alignItems:     'center',
  },
  contactLabel: {
    color:      C.textLight,
    fontSize:   11,
    fontWeight: '600',
  },
  contactVal: {
    fontSize:   13,
    fontWeight: '700',
    marginTop:  2,
  },

  // Footer
  footer: {
    textAlign:       'center',
    color:           C.textLight,
    fontSize:        12,
    marginTop:       28,
    marginBottom:    8,
    paddingHorizontal: 32,
    lineHeight:      18,
  },
});
