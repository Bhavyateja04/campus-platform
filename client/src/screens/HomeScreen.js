import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  StatusBar, Dimensions, Animated, Easing, Platform, ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const C = {
  primary:      '#4A6FA5',
  primaryDark:  '#2E4D7A',
  primaryLight: '#A8C0DD',
  primaryPale:  '#EBF1F8',
  orange:       '#E07B3A',
  blue:         '#1565C0',
  purple:       '#6A1B9A',
  teal:         '#00796B',
  gold:         '#FFB300',
  bg:           '#F5F8FC',
  surface:      '#FFFFFF',
  textDark:     '#0D1B2A',
  textMid:      '#3D5068',
  textLight:    '#8FA8C0',
  border:       '#D6E4F0',
};

// 4 cards per row
const GRID_PAD = 16;
const GRID_GAP = 8;
const CARD_W   = (width - GRID_PAD * 2 - GRID_GAP * 3) / 4;

const FEATURES = [
  { id:'1', icon:'search-outline',     label:'Lost & Found',     grad:['#1A237E','#283593'], route:'LostAndFound'    },
  { id:'2', icon:'map-outline',        label:'Campus Map',       grad:['#4A148C','#7B1FA2']                         },
  { id:'3', icon:'restaurant-outline', label:'Canteen Menu',     grad:['#BF360C','#E64A19']                         },
  { id:'4', icon:'storefront-outline', label:'ReTrade', grad:['#004D40','#00695C']                         },
  { id:'5', icon:'briefcase-outline',  label:'Placements',       grad:['#0D47A1','#1565C0'], route:'Placements'     },
  { id:'6', icon:'navigate-outline',   label:'Exam Hall',        grad:['#1B5E20','#2E7D32']                         },
  { id:'7', icon:'people-outline',     label:'Clubs',            grad:['#880E4F','#AD1457'],  route:'Clubs'          },
  { id:'8', icon:'images-outline',     label:'Campus\nMemories', grad:['#006064','#00838F'],  route:'CampusMemories' },
];

const PUBLIC = [
  { id:'1', icon:'school-outline',   label:'College\nInfo',  color:C.primary, grad:['#4A6FA5','#2E4D7A'] },
  { id:'2', icon:'map-outline',      label:'College\nMap',   color:C.purple,  grad:['#7B1FA2','#6A1B9A'] },
  { id:'3', icon:'navigate-outline', label:'Exam\nLocator',  color:C.teal,    grad:['#00897B','#00796B'] },
];

const FEEDBACK = [
  { id:'1', name:'Arjun Mehta',  role:'CSE, 3rd Year', initials:'AM', gradColors:['#4A6FA5','#2E4D7A'], rating:5,
    review:'Campix has completely transformed how I navigate campus life. Everything I need is in one place — clean, fast, and super useful!' },
  { id:'2', name:'Sneha Reddy',  role:'ECE, 2nd Year', initials:'SR', gradColors:['#00897B','#00796B'], rating:5,
    review:'The best student app I have used. Beautiful UI and genuinely helpful features. Campix saves me at least 30 minutes every day!' },
];

const NAV = [
  { key:'Home',    icon:'home',          label:'Home'    },
  { key:'Alerts',  icon:'notifications', label:'Alerts'  },
  { key:'About',   icon:'school',        label:'About'   },
  { key:'Profile', icon:'person-circle', label:'Profile' },
];

const COLLEGE_IMG = require('../../assets/droneviewaditya.jpg');
const EASE = Easing.bezier(0.22, 1, 0.36, 1);

// ─── Hooks ────────────────────────────────────────────────────────────────────

const useEntrance = (delay = 0, dy = 24) => {
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(dy)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue:1, duration:580, delay, easing:EASE, useNativeDriver:true }),
      Animated.timing(translateY, { toValue:0, duration:580, delay, easing:EASE, useNativeDriver:true }),
    ]).start();
  }, []);
  return { opacity, transform:[{ translateY }] };
};

// ─── Small components ─────────────────────────────────────────────────────────

const PulseBadge = () => {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(scale, { toValue:1.35, duration:800, easing:EASE, useNativeDriver:true }),
      Animated.timing(scale, { toValue:1,    duration:800, easing:EASE, useNativeDriver:true }),
    ])).start();
  }, []);
  return (
    <Animated.View style={[S.badge, { transform:[{ scale }] }]}>
      <Text style={S.badgeText}>3</Text>
    </Animated.View>
  );
};

const Stars = ({ count }) => (
  <View style={{ flexDirection:'row', gap:2 }}>
    {[1,2,3,4,5].map(i => (
      <Ionicons key={i} name={i<=count?'star':'star-outline'} size={12} color={C.gold} />
    ))}
  </View>
);

const SecHeader = ({ title, onMore }) => (
  <View style={S.secHeader}>
    <Text style={S.secTitle}>{title}</Text>
    {onMore && (
      <TouchableOpacity onPress={onMore} hitSlop={{ top:8, bottom:8, left:8, right:8 }}>
        <Text style={S.secMore}>View All  ›</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ─── FeatureCard — white card + gradient icon, 4-per-row ─────────────────────

const FeatureCard = ({ item, delay, navigation }) => {
  const anim  = useEntrance(delay, 18);
  const press = useRef(new Animated.Value(1)).current;
  const onIn  = () => Animated.spring(press, { toValue:0.93, speed:22, bounciness:4, useNativeDriver:true }).start();
  const onOut = () => Animated.spring(press, { toValue:1,    speed:16, bounciness:6, useNativeDriver:true }).start();

  const ICON_SIZE = CARD_W * 0.56;

  return (
    <Animated.View style={[anim, { transform:[...anim.transform, { scale:press }] }]}>
      <TouchableOpacity
        onPressIn={onIn} onPressOut={onOut} activeOpacity={1}
        onPress={() => item.route && navigation?.navigate(item.route)}
        style={FC.card}
      >
        {/* Gradient icon box */}
        <LinearGradient
          colors={item.grad}
          start={{ x:0, y:0 }}
          end={{ x:1, y:1 }}
          style={[FC.iconBox, { width:ICON_SIZE, height:ICON_SIZE, borderRadius:ICON_SIZE * 0.32 }]}
        >
          <Ionicons name={item.icon} size={ICON_SIZE * 0.46} color="#fff" />
        </LinearGradient>

        {/* Label */}
        <Text style={FC.label} numberOfLines={2}>{item.label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const FC = StyleSheet.create({
  card: {
    width: CARD_W,
    backgroundColor: C.surface,
    borderRadius: 16,
    paddingTop: 14,
    paddingBottom: 12,
    paddingHorizontal: 4,
    alignItems: 'center',
    gap: 10,
    shadowColor: '#4A6FA530',
    shadowOffset: { width:0, height:3 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: C.border,
  },
  iconBox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    color: C.textMid,
    fontSize: 10.5,
    fontWeight: '700',
    textAlign: 'center',
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
      <View style={{ flex:1 }}>
        <Text style={S.fbName}>{item.name}</Text>
        <Text style={S.fbRole}>{item.role}</Text>
      </View>
      <Stars count={item.rating} />
    </View>
    <Text style={S.fbText}>"{item.review}"</Text>
  </View>
);

// ─── Hero ─────────────────────────────────────────────────────────────────────

const Hero = ({ SB_H, navigation }) => {
  const HERO_H    = 360 + SB_H;
  const logoAnim  = useEntrance(100, -12);
  const greetAnim = useEntrance(260, 14);
  const nameAnim  = useEntrance(340, 14);
  const pillAnim  = useEntrance(420, 12);
  const statsAnim = useEntrance(490, 10);
  const [imgError, setImgError] = useState(false);

  return (
    <View style={[S.heroContainer, { height:HERO_H }]}>
      <ImageBackground
        source={COLLEGE_IMG}
        style={StyleSheet.absoluteFill}
        imageStyle={{ width:'100%', height:'100%' }}
        resizeMode="cover"
        onError={() => setImgError(true)}
      >
        {imgError && <LinearGradient colors={['#2E4D7A','#4A6FA5']} style={StyleSheet.absoluteFill} />}
      </ImageBackground>

      <LinearGradient
        colors={['rgba(0,0,0,0)','rgba(0,0,0,0)','rgba(0,0,0,0.15)','rgba(0,0,0,0.55)','rgba(0,0,0,0.80)']}
        locations={[0, 0.32, 0.52, 0.76, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <Animated.View style={[S.heroBar, { top:SB_H+14 }, logoAnim]}>
        <View style={S.brandRow}>
          <LinearGradient colors={[C.primary,C.primaryDark]} style={S.brandIcon}>
            <Ionicons name="school" size={17} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={S.heroApp}>Campix</Text>
            <Text style={S.heroUni}>Aditya University</Text>
          </View>
        </View>
        <TouchableOpacity style={S.bellBtn} onPress={() => navigation?.navigate('Alerts')}>
          <Ionicons name="notifications-outline" size={20} color="#fff" />
          <PulseBadge />
        </TouchableOpacity>
      </Animated.View>

      <View style={S.welcomeBlock}>
        <Animated.Text style={[greetAnim, S.heroHi]}>Welcome back,</Animated.Text>
        <Animated.Text style={[nameAnim, S.heroName]}>Varshitha 👋</Animated.Text>
        <Animated.View style={[pillAnim, S.heroPill]}>
          <Ionicons name="sparkles-outline" size={12} color={C.primaryLight} />
          <Text style={S.heroPillT}>Smart Student App  ·  Aditya University</Text>
        </Animated.View>
      </View>

      <Animated.View style={[statsAnim, S.statsStrip]}>
        {[
          { val:'12K+', label:'Students', icon:'people'  },
          { val:'200+', label:'Faculty',  icon:'person'  },
          { val:'50+',  label:'Clubs',    icon:'trophy'  },
        ].map((s,i) => (
          <View key={i} style={[S.statItem, i<2 && S.statBorder]}>
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
  const SB_H = Platform.OS==='ios' ? 44 : (StatusBar.currentHeight||24);

  const stickyOp = scrollY.interpolate({ inputRange:[0,160], outputRange:[0,1], extrapolate:'clamp' });

  const sec1Anim = useEntrance(80);
  const sec2Anim = useEntrance(140);
  const sec3Anim = useEntrance(200);
  const sec4Anim = useEntrance(260);

  const handleNav = (routeKey) => {
    if (routeKey==='Home') return;
    navigation.navigate(routeKey);
  };

  // Split into rows of 4
  const featureRows = [];
  for (let i = 0; i < FEATURES.length; i += 4) {
    featureRows.push(FEATURES.slice(i, i + 4));
  }

  return (
    <View style={S.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Sticky header */}
      <Animated.View style={[S.sticky, { opacity:stickyOp }]} pointerEvents="box-none">
        <LinearGradient colors={[C.primary+'F9', C.primaryDark+'F9']}
          style={[S.stickyInner, { paddingTop:SB_H+8 }]}>
          <View>
            <Text style={S.stickyApp}>Campix</Text>
            <Text style={S.stickyUni}>Aditya University</Text>
          </View>
          <TouchableOpacity style={S.stickyBell} onPress={() => navigation.navigate('Alerts')}>
            <Ionicons name="notifications" size={20} color="#fff" />
            <PulseBadge />
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        decelerationRate={0.92}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent:{ contentOffset:{ y:scrollY } } }], { useNativeDriver:true })}
        contentContainerStyle={{ paddingBottom:110 }}
      >
        <Hero SB_H={SB_H} navigation={navigation} />

        {/* ── Core Features ── */}
        <Animated.View style={sec1Anim}>
          <View style={S.sec}>
            <SecHeader title="Core Features" />
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

        {/* ── Public Access ── */}
        <Animated.View style={sec2Anim}>
          <View style={S.sec}>
            <SecHeader title="Public Access" />
            <View style={S.pubRow}>
              {PUBLIC.map(p => (
                <TouchableOpacity key={p.id} activeOpacity={0.78}
                  style={[S.pubCard, { borderTopColor:p.color }]}>
                  <LinearGradient colors={p.grad} style={S.pubIconGrad}>
                    <Ionicons name={p.icon} size={22} color="#fff" />
                  </LinearGradient>
                  <Text style={[S.pubLabel, { color:p.color }]}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* ── About the College ── */}
        <Animated.View style={sec3Anim}>
          <View style={S.sec}>
            <TouchableOpacity activeOpacity={0.82} style={S.aboutTile}
              onPress={() => navigation.navigate('About')}>
              <LinearGradient colors={[C.primaryDark, C.primary]} style={S.aboutTileInner}>
                <View style={S.aboutLeft}>
                  <View style={S.adityaBox}>
                    <Ionicons name="school" size={24} color="#fff" />
                    <Text style={S.adityaText}>ADITYA</Text>
                  </View>
                  <View>
                    <Text style={S.aboutTitle}>About the College</Text>
                    <Text style={S.aboutSub}>Aditya University · Surampalem, AP</Text>
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
        <Animated.View style={sec4Anim}>
          <View style={S.sec}>
            <SecHeader title="⭐  Student Reviews" onMore={() => {}} />
            <View style={S.fbList}>
              {FEEDBACK.map(f => <FeedbackCard key={f.id} item={f} />)}
            </View>
          </View>
        </Animated.View>

        {/* ── Campus Map banner ── */}
        <Animated.View style={[sec4Anim, { marginTop:8 }]}>
          <View style={[S.sec, { paddingHorizontal:16 }]}>
            <TouchableOpacity activeOpacity={0.84}>
              <LinearGradient colors={[C.primaryDark, C.primary]} style={S.mapBanner}>
                <View>
                  <Text style={S.mapTitle}>📍  Explore Campus Map</Text>
                  <Text style={S.mapSub}>Navigate buildings, labs & canteens</Text>
                </View>
                <View style={S.mapArrow}>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>

      </Animated.ScrollView>

      {/* ── Bottom Nav ── */}
      <View style={S.navWrap}>
        <LinearGradient colors={['#FFFFFFFD', C.bg]} style={S.navBar}>
          {NAV.map(item => {
            const on = item.key==='Home';
            return (
              <TouchableOpacity key={item.key} style={S.navItem}
                onPress={() => handleNav(item.key)} activeOpacity={0.7}>
                {on && <View style={S.navPip} />}
                <View style={[S.navIconBox, on && S.navIconBoxOn]}>
                  <Ionicons
                    name={on ? item.icon : item.icon+'-outline'}
                    size={23}
                    color={on ? C.primary : C.textLight}
                  />
                  {item.key==='Alerts' && <PulseBadge />}
                </View>
                <Text style={[S.navLabel, on && S.navLabelOn]}>{item.label}</Text>
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
  root: { flex:1, backgroundColor:C.bg },

  sticky:      { position:'absolute', top:0, left:0, right:0, zIndex:100 },
  stickyInner: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:20, paddingBottom:12 },
  stickyApp:   { color:'#fff', fontWeight:'900', fontSize:17, letterSpacing:0.4 },
  stickyUni:   { color:'#D6E4F0', fontSize:11, marginTop:1 },
  stickyBell:  { padding:4 },

  heroContainer: { width, overflow:'hidden', borderBottomLeftRadius:30, borderBottomRightRadius:30 },
  heroBar:   { position:'absolute', left:0, right:0, flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:20 },
  brandRow:  { flexDirection:'row', alignItems:'center', gap:10 },
  brandIcon: { width:38, height:38, borderRadius:11, justifyContent:'center', alignItems:'center', shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.3, shadowRadius:4, elevation:4 },
  heroApp:   { color:'#FFFFFF', fontWeight:'900', fontSize:18, letterSpacing:0.3, textShadowColor:'rgba(0,0,0,0.5)', textShadowOffset:{width:0,height:1}, textShadowRadius:4 },
  heroUni:   { color:'rgba(255,255,255,0.80)', fontSize:10, fontWeight:'600', marginTop:1, letterSpacing:0.4 },
  bellBtn:   { width:42, height:42, borderRadius:21, backgroundColor:'rgba(0,0,0,0.28)', justifyContent:'center', alignItems:'center', borderWidth:1, borderColor:'rgba(255,255,255,0.22)' },

  welcomeBlock: { position:'absolute', bottom:70, left:22, right:22 },
  heroHi:    { color:'rgba(255,255,255,0.90)', fontSize:15, fontWeight:'600', letterSpacing:0.2, textShadowColor:'rgba(0,0,0,0.7)', textShadowOffset:{width:0,height:1}, textShadowRadius:6 },
  heroName:  { color:'#FFFFFF', fontSize:32, fontWeight:'900', letterSpacing:0.2, marginTop:2, textShadowColor:'rgba(0,0,0,0.8)', textShadowOffset:{width:0,height:2}, textShadowRadius:10 },
  heroPill:  { flexDirection:'row', alignItems:'center', gap:7, marginTop:14, alignSelf:'flex-start', backgroundColor:'rgba(255,255,255,0.18)', paddingHorizontal:14, paddingVertical:7, borderRadius:22, borderWidth:1, borderColor:'rgba(255,255,255,0.28)' },
  heroPillT: { color:'rgba(255,255,255,0.92)', fontSize:11, fontWeight:'600', letterSpacing:0.3 },

  statsStrip: { position:'absolute', bottom:0, left:0, right:0, flexDirection:'row', backgroundColor:'rgba(0,0,0,0.45)', paddingVertical:13, borderBottomLeftRadius:30, borderBottomRightRadius:30, borderTopWidth:1, borderTopColor:'rgba(255,255,255,0.10)' },
  statItem:   { flex:1, alignItems:'center', gap:3 },
  statBorder: { borderRightWidth:1, borderRightColor:'rgba(255,255,255,0.18)' },
  statVal:    { color:'#fff', fontWeight:'900', fontSize:16, textShadowColor:'rgba(0,0,0,0.5)', textShadowOffset:{width:0,height:1}, textShadowRadius:3 },
  statLabel:  { color:'rgba(255,255,255,0.72)', fontSize:10, fontWeight:'600' },

  sec:       { marginTop:24 },
  secHeader: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:16, marginBottom:14 },
  secTitle:  { fontSize:16, fontWeight:'800', color:C.textDark, letterSpacing:0.1 },
  secMore:   { fontSize:13, fontWeight:'600', color:C.primary },

  // Feature grid — 2 rows × 4 cols
  featureGrid: { paddingHorizontal:GRID_PAD, gap:GRID_GAP },
  featureRow:  { flexDirection:'row', gap:GRID_GAP },

  pubRow:     { flexDirection:'row', paddingHorizontal:16, gap:10 },
  pubCard:    { flex:1, borderRadius:18, backgroundColor:C.surface, alignItems:'center', paddingVertical:18, gap:10, borderTopWidth:3, shadowColor:'#00000010', shadowOffset:{width:0,height:3}, shadowOpacity:1, shadowRadius:8, elevation:2 },
  pubIconGrad:{ width:48, height:48, borderRadius:14, justifyContent:'center', alignItems:'center' },
  pubLabel:   { fontSize:11, fontWeight:'700', textAlign:'center', color:C.textMid, lineHeight:15 },

  aboutTile:      { marginHorizontal:16, borderRadius:22, overflow:'hidden', shadowColor:C.primaryDark+'44', shadowOffset:{width:0,height:6}, shadowOpacity:1, shadowRadius:14, elevation:6 },
  aboutTileInner: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:20, paddingVertical:18 },
  aboutLeft:      { flexDirection:'row', alignItems:'center', gap:16, flex:1 },
  adityaBox:      { width:58, height:58, borderRadius:16, backgroundColor:'rgba(255,255,255,0.18)', justifyContent:'center', alignItems:'center', gap:3, borderWidth:1, borderColor:'rgba(255,255,255,0.28)' },
  adityaText:     { color:'#fff', fontSize:7, fontWeight:'900', letterSpacing:1.6 },
  aboutTitle:     { color:'#fff', fontWeight:'800', fontSize:15 },
  aboutSub:       { color:'rgba(255,255,255,0.75)', fontSize:11, marginTop:3 },
  aboutArrow:     { width:34, height:34, borderRadius:17, backgroundColor:'rgba(255,255,255,0.18)', justifyContent:'center', alignItems:'center' },

  fbList:    { paddingHorizontal:16, gap:10 },
  fbCard:    { backgroundColor:C.surface, borderRadius:16, padding:14, shadowColor:C.primary+'18', shadowOffset:{width:0,height:3}, shadowOpacity:1, shadowRadius:10, elevation:3, borderWidth:1, borderColor:C.border },
  fbHeader:  { flexDirection:'row', alignItems:'center', gap:10, marginBottom:10 },
  fbAvatar:  { width:40, height:40, borderRadius:20, justifyContent:'center', alignItems:'center' },
  fbAvatarT: { color:'#fff', fontWeight:'800', fontSize:14 },
  fbName:    { color:C.textDark, fontWeight:'700', fontSize:13 },
  fbRole:    { color:C.textLight, fontSize:11, marginTop:1 },
  fbText:    { color:C.textMid, fontSize:12, lineHeight:19, fontStyle:'italic' },

  mapBanner: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', borderRadius:22, padding:22, shadowColor:C.primary+'44', shadowOffset:{width:0,height:6}, shadowOpacity:1, shadowRadius:14, elevation:6 },
  mapTitle:  { color:'#fff', fontWeight:'800', fontSize:16 },
  mapSub:    { color:'#ffffffAA', fontSize:12, marginTop:4 },
  mapArrow:  { width:42, height:42, borderRadius:21, backgroundColor:'#FFFFFF1E', justifyContent:'center', alignItems:'center' },

  badge:     { position:'absolute', top:-4, right:-4, backgroundColor:'#FFB300', width:16, height:16, borderRadius:8, justifyContent:'center', alignItems:'center' },
  badgeText: { color:'#fff', fontSize:9, fontWeight:'800' },

  navWrap:      { position:'absolute', bottom:0, left:0, right:0, shadowColor:'#00000018', shadowOffset:{width:0,height:-3}, shadowOpacity:1, shadowRadius:16, elevation:20 },
  navBar:       { flexDirection:'row', paddingBottom:Platform.OS==='ios'?28:10, paddingTop:10, borderTopLeftRadius:24, borderTopRightRadius:24, borderTopWidth:1, borderColor:C.border },
  navItem:      { flex:1, alignItems:'center', gap:4, paddingTop:2 },
  navPip:       { position:'absolute', top:-10, width:28, height:3, borderRadius:3, backgroundColor:C.primary },
  navIconBox:   { width:46, height:36, justifyContent:'center', alignItems:'center', borderRadius:13 },
  navIconBoxOn: { backgroundColor:C.primary+'18' },
  navLabel:     { fontSize:10, color:C.textLight, fontWeight:'600' },
  navLabelOn:   { color:C.primary, fontWeight:'800' },
});






// import React, { useRef, useEffect, useState } from 'react';
// import {
//   View, Text, ScrollView, TouchableOpacity, StyleSheet,
//   StatusBar, Dimensions, Animated, Easing, Platform, ImageBackground,
//   Alert,
// } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';

// const { width } = Dimensions.get('window');

// const C = {
//   primary:      '#4A6FA5',
//   primaryDark:  '#2E4D7A',
//   primaryLight: '#A8C0DD',
//   primaryPale:  '#EBF1F8',
//   orange:       '#E07B3A',
//   blue:         '#1565C0',
//   purple:       '#6A1B9A',
//   teal:         '#00796B',
//   gold:         '#FFB300',
//   bg:           '#F5F8FC',
//   surface:      '#FFFFFF',
//   textDark:     '#0D1B2A',
//   textMid:      '#3D5068',
//   textLight:    '#8FA8C0',
//   border:       '#D6E4F0',
// };

// // ── PUBLIC routes (no login required) ────────────────────────────────────────
// const PUBLIC_ROUTES = new Set(['About', 'CollegeInfo', 'CollegeMap', 'ExamLocator']);

// // ── FEATURES ──────────────────────────────────────────────────────────────────
// // isPublic: true  → accessible without login
// // isPublic: false → redirects to Login if not authenticated
// const FEATURES = [
//   { id:'1', icon:'search-outline',     label:'Lost & Found',    grad:['#1A237E','#283593'], route:'LostAndFound',    isPublic: false },
//   { id:'2', icon:'map-outline',        label:'Campus Map',      grad:['#4A148C','#7B1FA2'], route:'CollegeMap',      isPublic: true  },
//   { id:'3', icon:'restaurant-outline', label:'Canteen Menu',    grad:['#BF360C','#E64A19'], route:'CanteenMenu',     isPublic: false },
//   { id:'4', icon:'storefront-outline', label:'2nd Hand Market', grad:['#004D40','#00695C'], route:'SecondHandMarket',isPublic: false },
//   { id:'5', icon:'briefcase-outline',  label:'Placements',      grad:['#0D47A1','#1565C0'], route:'Placements',      isPublic: false },
//   { id:'6', icon:'navigate-outline',   label:'Exam Hall',       grad:['#1B5E20','#2E7D32'], route:'ExamLocator',     isPublic: true  },
//   { id:'7', icon:'people-outline',     label:'Clubs',           grad:['#880E4F','#AD1457'], route:'Clubs',           isPublic: false },
//   { id:'8', icon:'images-outline',     label:'Campus Memories', grad:['#006064','#00838F'], route:'CampusMemories',  isPublic: false },
// ];

// const PUBLIC_ACCESS = [
//   { id:'1', icon:'school-outline',   label:'College\nInfo',  color:C.primary, grad:['#4A6FA5','#2E4D7A'], route:'About',       isPublic: true },
//   { id:'2', icon:'map-outline',      label:'College\nMap',   color:C.purple,  grad:['#7B1FA2','#6A1B9A'], route:'CollegeMap',  isPublic: true },
//   { id:'3', icon:'navigate-outline', label:'Exam\nLocator',  color:C.teal,    grad:['#00897B','#00796B'], route:'ExamLocator', isPublic: true },
// ];

// const FEEDBACK = [
//   { id:'1', name:'Arjun Mehta',  role:'CSE, 3rd Year', initials:'AM', gradColors:['#4A6FA5','#2E4D7A'], rating:5,
//     review:'Campix has completely transformed how I navigate campus life. Everything I need is in one place — clean, fast, and super useful!' },
//   { id:'2', name:'Sneha Reddy',  role:'ECE, 2nd Year', initials:'SR', gradColors:['#00897B','#00796B'], rating:5,
//     review:'The best student app I have used. Beautiful UI and genuinely helpful features. Campix saves me at least 30 minutes every day!' },
// ];

// const NAV = [
//   { key:'Home',    icon:'home',          label:'Home'    },
//   { key:'Alerts',  icon:'notifications', label:'Alerts'  },
//   { key:'About',   icon:'school',        label:'About'   },
//   { key:'Profile', icon:'person-circle', label:'Profile' },
// ];

// const COLLEGE_IMG = require('../../assets/droneviewaditya.jpg');
// const EASE = Easing.bezier(0.22, 1, 0.36, 1);

// const CARD_W = (width - 32 - 10) / 2;
// const CARD_H = CARD_W * 0.64;

// const useEntrance = (delay = 0, dy = 24) => {
//   const opacity    = useRef(new Animated.Value(0)).current;
//   const translateY = useRef(new Animated.Value(dy)).current;
//   useEffect(() => {
//     Animated.parallel([
//       Animated.timing(opacity,    { toValue:1, duration:580, delay, easing:EASE, useNativeDriver:true }),
//       Animated.timing(translateY, { toValue:0, duration:580, delay, easing:EASE, useNativeDriver:true }),
//     ]).start();
//   }, []);
//   return { opacity, transform:[{ translateY }] };
// };

// const PulseBadge = () => {
//   const scale = useRef(new Animated.Value(1)).current;
//   useEffect(() => {
//     Animated.loop(Animated.sequence([
//       Animated.timing(scale, { toValue:1.35, duration:800, easing:EASE, useNativeDriver:true }),
//       Animated.timing(scale, { toValue:1,    duration:800, easing:EASE, useNativeDriver:true }),
//     ])).start();
//   }, []);
//   return (
//     <Animated.View style={[S.badge, { transform:[{ scale }] }]}>
//       <Text style={S.badgeText}>3</Text>
//     </Animated.View>
//   );
// };

// const Stars = ({ count }) => (
//   <View style={{ flexDirection:'row', gap:2 }}>
//     {[1,2,3,4,5].map(i => (
//       <Ionicons key={i} name={i<=count?'star':'star-outline'} size={12} color={C.gold} />
//     ))}
//   </View>
// );

// const SecHeader = ({ title, onMore }) => (
//   <View style={S.secHeader}>
//     <Text style={S.secTitle}>{title}</Text>
//     {onMore && (
//       <TouchableOpacity onPress={onMore} hitSlop={{ top:8, bottom:8, left:8, right:8 }}>
//         <Text style={S.secMore}>View All  ›</Text>
//       </TouchableOpacity>
//     )}
//   </View>
// );

// // ── Auth-aware navigation helper ──────────────────────────────────────────────
// // isLoggedIn: read from your auth context / Redux / AsyncStorage.
// // Once you have a Login screen in your navigator, replace the Alert with:
// //   navigation?.navigate('Login', { redirectTo: route });
// const useAuthNav = (navigation, isLoggedIn) => {
//   return (route, isPublic) => {
//     if (!route) return;

//     if (isPublic || isLoggedIn) {
//       // Allowed — navigate normally
//       navigation?.navigate(route);
//     } else {
//       // Not logged in — show a prompt instead of crashing
//       Alert.alert(
//         '🔒 Login Required',
//         'Please log in to access this feature.',
//         [
//           { text: 'Cancel', style: 'cancel' },
//           {
//             text: 'Log In',
//             onPress: () => {
//               // Uncomment once Login screen is registered in your App navigator:
//               // navigation?.navigate('Login', { redirectTo: route });
//             },
//           },
//         ],
//         { cancelable: true }
//       );
//     }
//   };
// };

// // ── Feature Card ──────────────────────────────────────────────────────────────
// const FeatureCard = ({ item, delay, navigation, isLoggedIn }) => {
//   const anim    = useEntrance(delay, 22);
//   const press   = useRef(new Animated.Value(1)).current;
//   const authNav = useAuthNav(navigation, isLoggedIn);

//   const onIn  = () => Animated.spring(press, { toValue:0.94, speed:22, bounciness:4, useNativeDriver:true }).start();
//   const onOut = () => Animated.spring(press, { toValue:1,    speed:16, bounciness:6, useNativeDriver:true }).start();

//   return (
//     <Animated.View style={[anim, { transform:[...anim.transform, { scale:press }], width:CARD_W }]}>
//       <TouchableOpacity
//         onPressIn={onIn} onPressOut={onOut} activeOpacity={1}
//         onPress={() => authNav(item.route, item.isPublic)}
//         style={{ width:CARD_W, height:CARD_H }}
//       >
//         <LinearGradient colors={item.grad} style={FC.card}>
//           <View style={FC.deco1} />
//           <View style={FC.deco2} />

//           {/* Lock icon overlay for private features when not logged in */}
//           {!item.isPublic && !isLoggedIn && (
//             <View style={FC.lockBadge}>
//               <Ionicons name="lock-closed" size={10} color="#fff" />
//             </View>
//           )}

//           <View style={FC.iconBox}>
//             <Ionicons name={item.icon} size={22} color="#fff" />
//           </View>
//           <View style={FC.bottom}>
//             <Text style={FC.label} numberOfLines={2}>{item.label}</Text>
//             <View style={FC.arrowBox}>
//               <Ionicons name={!item.isPublic && !isLoggedIn ? 'lock-closed' : 'chevron-forward'} size={12} color="#fff" />
//             </View>
//           </View>
//         </LinearGradient>
//       </TouchableOpacity>
//     </Animated.View>
//   );
// };

// const FC = StyleSheet.create({
//   card: {
//     width:'100%', height:'100%', borderRadius:20, padding:14,
//     overflow:'hidden', justifyContent:'space-between',
//     shadowColor:'#00000040', shadowOffset:{ width:0, height:6 },
//     shadowOpacity:1, shadowRadius:12, elevation:8,
//   },
//   deco1: {
//     position:'absolute', width:CARD_W*0.68, height:CARD_W*0.68,
//     borderRadius:CARD_W*0.34, backgroundColor:'rgba(255,255,255,0.09)',
//     top:-CARD_W*0.22, right:-CARD_W*0.16,
//   },
//   deco2: {
//     position:'absolute', width:CARD_W*0.4, height:CARD_W*0.4,
//     borderRadius:CARD_W*0.2, backgroundColor:'rgba(255,255,255,0.06)',
//     bottom:-CARD_W*0.1, left:-CARD_W*0.08,
//   },
//   iconBox: {
//     width:42, height:42, borderRadius:13,
//     backgroundColor:'rgba(255,255,255,0.20)',
//     justifyContent:'center', alignItems:'center',
//     borderWidth:1, borderColor:'rgba(255,255,255,0.25)',
//   },
//   lockBadge: {
//     position:'absolute', top:10, right:10,
//     width:20, height:20, borderRadius:10,
//     backgroundColor:'rgba(0,0,0,0.35)',
//     justifyContent:'center', alignItems:'center',
//     borderWidth:1, borderColor:'rgba(255,255,255,0.3)',
//   },
//   bottom:   { flexDirection:'row', alignItems:'flex-end', justifyContent:'space-between' },
//   label:    { color:'#fff', fontSize:13, fontWeight:'800', lineHeight:17, flex:1, letterSpacing:0.1 },
//   arrowBox: { width:24, height:24, borderRadius:12, backgroundColor:'rgba(255,255,255,0.22)', justifyContent:'center', alignItems:'center', marginLeft:6, flexShrink:0 },
// });

// // ── Feedback Card ─────────────────────────────────────────────────────────────
// const FeedbackCard = ({ item }) => (
//   <View style={S.fbCard}>
//     <View style={S.fbHeader}>
//       <LinearGradient colors={item.gradColors} style={S.fbAvatar}>
//         <Text style={S.fbAvatarT}>{item.initials}</Text>
//       </LinearGradient>
//       <View style={{ flex:1 }}>
//         <Text style={S.fbName}>{item.name}</Text>
//         <Text style={S.fbRole}>{item.role}</Text>
//       </View>
//       <Stars count={item.rating} />
//     </View>
//     <Text style={S.fbText}>"{item.review}"</Text>
//   </View>
// );

// // ── Hero Section ──────────────────────────────────────────────────────────────
// const Hero = ({ SB_H, navigation }) => {
//   const HERO_H    = 360 + SB_H;
//   const logoAnim  = useEntrance(100, -12);
//   const greetAnim = useEntrance(260, 14);
//   const nameAnim  = useEntrance(340, 14);
//   const pillAnim  = useEntrance(420, 12);
//   const statsAnim = useEntrance(490, 10);
//   const [imgError, setImgError] = useState(false);

//   return (
//     <View style={[S.heroContainer, { height:HERO_H }]}>
//       <ImageBackground
//         source={COLLEGE_IMG}
//         style={StyleSheet.absoluteFill}
//         imageStyle={{ width:'100%', height:'100%' }}
//         resizeMode="cover"
//         onError={() => setImgError(true)}
//       >
//         {imgError && <LinearGradient colors={['#2E4D7A','#4A6FA5']} style={StyleSheet.absoluteFill} />}
//       </ImageBackground>

//       <LinearGradient
//         colors={['rgba(0,0,0,0)','rgba(0,0,0,0)','rgba(0,0,0,0.15)','rgba(0,0,0,0.55)','rgba(0,0,0,0.80)']}
//         locations={[0, 0.32, 0.52, 0.76, 1]}
//         style={StyleSheet.absoluteFill}
//         pointerEvents="none"
//       />

//       <Animated.View style={[S.heroBar, { top:SB_H+14 }, logoAnim]}>
//         <View style={S.brandRow}>
//           <LinearGradient colors={[C.primary,C.primaryDark]} style={S.brandIcon}>
//             <Ionicons name="school" size={17} color="#fff" />
//           </LinearGradient>
//           <View>
//             <Text style={S.heroApp}>Campix</Text>
//             <Text style={S.heroUni}>Aditya University</Text>
//           </View>
//         </View>
//         <TouchableOpacity style={S.bellBtn} onPress={() => navigation?.navigate('Alerts')}>
//           <Ionicons name="notifications-outline" size={20} color="#fff" />
//           <PulseBadge />
//         </TouchableOpacity>
//       </Animated.View>

//       <View style={S.welcomeBlock}>
//         <Animated.Text style={[greetAnim, S.heroHi]}>Welcome back,</Animated.Text>
//         <Animated.Text style={[nameAnim, S.heroName]}>Varshitha 👋</Animated.Text>
//         <Animated.View style={[pillAnim, S.heroPill]}>
//           <Ionicons name="sparkles-outline" size={12} color={C.primaryLight} />
//           <Text style={S.heroPillT}>Smart Student App  ·  Aditya University</Text>
//         </Animated.View>
//       </View>

//       <Animated.View style={[statsAnim, S.statsStrip]}>
//         {[
//           { val:'12K+', label:'Students', icon:'people'  },
//           { val:'200+', label:'Faculty',  icon:'person'  },
//           { val:'50+',  label:'Clubs',    icon:'trophy'  },
//         ].map((s,i) => (
//           <View key={i} style={[S.statItem, i<2 && S.statBorder]}>
//             <Ionicons name={s.icon} size={15} color="rgba(255,255,255,0.85)" />
//             <Text style={S.statVal}>{s.val}</Text>
//             <Text style={S.statLabel}>{s.label}</Text>
//           </View>
//         ))}
//       </Animated.View>
//     </View>
//   );
// };

// // ── Main Screen ───────────────────────────────────────────────────────────────
// export default function HomeScreen({ navigation, route }) {
//   const scrollY = useRef(new Animated.Value(0)).current;
//   const SB_H = Platform.OS==='ios' ? 44 : (StatusBar.currentHeight||24);

//   // ── Auth state ─────────────────────────────────────────────────────────────
//   // Replace this with your actual auth context/store (e.g. useAuth(), Redux, etc.)
//   // For demo: pass isLoggedIn as a route param, or read from your auth context.
//   const isLoggedIn = route?.params?.isLoggedIn ?? false;

//   const authNav = useAuthNav(navigation, isLoggedIn);

//   const stickyOp = scrollY.interpolate({ inputRange:[0,160], outputRange:[0,1], extrapolate:'clamp' });

//   const sec1Anim = useEntrance(80);
//   const sec2Anim = useEntrance(140);
//   const sec3Anim = useEntrance(200);
//   const sec4Anim = useEntrance(260);

//   const handleNav = (routeKey) => {
//     if (routeKey==='Home') return;
//     navigation.navigate(routeKey);
//   };

//   return (
//     <View style={S.root}>
//       <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

//       <Animated.View style={[S.sticky, { opacity:stickyOp }]} pointerEvents="box-none">
//         <LinearGradient colors={[C.primary+'F9', C.primaryDark+'F9']}
//           style={[S.stickyInner, { paddingTop:SB_H+8 }]}>
//           <View>
//             <Text style={S.stickyApp}>Campix</Text>
//             <Text style={S.stickyUni}>Aditya University</Text>
//           </View>
//           <TouchableOpacity style={S.stickyBell} onPress={() => navigation.navigate('Alerts')}>
//             <Ionicons name="notifications" size={20} color="#fff" />
//             <PulseBadge />
//           </TouchableOpacity>
//         </LinearGradient>
//       </Animated.View>

//       <Animated.ScrollView
//         showsVerticalScrollIndicator={false}
//         decelerationRate={0.92}
//         scrollEventThrottle={16}
//         onScroll={Animated.event([{ nativeEvent:{ contentOffset:{ y:scrollY } } }], { useNativeDriver:true })}
//         contentContainerStyle={{ paddingBottom:110 }}
//       >
//         <Hero SB_H={SB_H} navigation={navigation} />

//         {/* ── CORE FEATURES ── */}
//         <Animated.View style={sec1Anim}>
//           <View style={S.sec}>
//             <SecHeader title="Core Features" />
//             <View style={S.featureGrid}>
//               {FEATURES.map((f,i) => (
//                 <FeatureCard
//                   key={f.id}
//                   item={f}
//                   delay={60+i*40}
//                   navigation={navigation}
//                   isLoggedIn={isLoggedIn}
//                 />
//               ))}
//             </View>
//           </View>
//         </Animated.View>

//         {/* ── PUBLIC ACCESS ── */}
//         <Animated.View style={sec2Anim}>
//           <View style={S.sec}>
//             <SecHeader title="Public Access" />
//             <View style={S.pubRow}>
//               {PUBLIC_ACCESS.map(p => (
//                 <TouchableOpacity
//                   key={p.id}
//                   activeOpacity={0.78}
//                   style={[S.pubCard, { borderTopColor:p.color }]}
//                   onPress={() => navigation?.navigate(p.route)}
//                 >
//                   <LinearGradient colors={p.grad} style={S.pubIconGrad}>
//                     <Ionicons name={p.icon} size={22} color="#fff" />
//                   </LinearGradient>
//                   <Text style={[S.pubLabel, { color:p.color }]}>{p.label}</Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           </View>
//         </Animated.View>

//         {/* ── ABOUT TILE ── */}
//         <Animated.View style={sec3Anim}>
//           <View style={S.sec}>
//             <TouchableOpacity activeOpacity={0.82} style={S.aboutTile}
//               onPress={() => navigation.navigate('About')}>
//               <LinearGradient colors={[C.primaryDark, C.primary]} style={S.aboutTileInner}>
//                 <View style={S.aboutLeft}>
//                   <View style={S.adityaBox}>
//                     <Ionicons name="school" size={24} color="#fff" />
//                     <Text style={S.adityaText}>ADITYA</Text>
//                   </View>
//                   <View>
//                     <Text style={S.aboutTitle}>About the College</Text>
//                     <Text style={S.aboutSub}>Aditya University · Surampalem, AP</Text>
//                   </View>
//                 </View>
//                 <View style={S.aboutArrow}>
//                   <Ionicons name="chevron-forward" size={18} color="#fff" />
//                 </View>
//               </LinearGradient>
//             </TouchableOpacity>
//           </View>
//         </Animated.View>

//         {/* ── REVIEWS ── */}
//         <Animated.View style={sec4Anim}>
//           <View style={S.sec}>
//             <SecHeader title="⭐  Student Reviews" onMore={() => {}} />
//             <View style={S.fbList}>
//               {FEEDBACK.map(f => <FeedbackCard key={f.id} item={f} />)}
//             </View>
//           </View>
//         </Animated.View>

//         {/* ── MAP BANNER ── */}
//         <Animated.View style={[sec4Anim, { marginTop:8 }]}>
//           <View style={[S.sec, { paddingHorizontal:16 }]}>
//             <TouchableOpacity activeOpacity={0.84} onPress={() => navigation?.navigate('CollegeMap')}>
//               <LinearGradient colors={[C.primaryDark, C.primary]} style={S.mapBanner}>
//                 <View>
//                   <Text style={S.mapTitle}>📍  Explore Campus Map</Text>
//                   <Text style={S.mapSub}>Navigate buildings, labs & canteens</Text>
//                 </View>
//                 <View style={S.mapArrow}>
//                   <Ionicons name="arrow-forward" size={20} color="#fff" />
//                 </View>
//               </LinearGradient>
//             </TouchableOpacity>
//           </View>
//         </Animated.View>

//       </Animated.ScrollView>

//       {/* ── BOTTOM NAV ── */}
//       <View style={S.navWrap}>
//         <LinearGradient colors={['#FFFFFFFD', C.bg]} style={S.navBar}>
//           {NAV.map(item => {
//             const on = item.key==='Home';
//             return (
//               <TouchableOpacity key={item.key} style={S.navItem}
//                 onPress={() => handleNav(item.key)} activeOpacity={0.7}>
//                 {on && <View style={S.navPip} />}
//                 <View style={[S.navIconBox, on && S.navIconBoxOn]}>
//                   <Ionicons
//                     name={on ? item.icon : item.icon+'-outline'}
//                     size={23}
//                     color={on ? C.primary : C.textLight}
//                   />
//                   {item.key==='Alerts' && <PulseBadge />}
//                 </View>
//                 <Text style={[S.navLabel, on && S.navLabelOn]}>{item.label}</Text>
//               </TouchableOpacity>
//             );
//           })}
//         </LinearGradient>
//       </View>
//     </View>
//   );
// }

// const S = StyleSheet.create({
//   root: { flex:1, backgroundColor:C.bg },

//   sticky:      { position:'absolute', top:0, left:0, right:0, zIndex:100 },
//   stickyInner: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:20, paddingBottom:12 },
//   stickyApp:   { color:'#fff', fontWeight:'900', fontSize:17, letterSpacing:0.4 },
//   stickyUni:   { color:'#D6E4F0', fontSize:11, marginTop:1 },
//   stickyBell:  { padding:4 },

//   heroContainer: { width, overflow:'hidden', borderBottomLeftRadius:30, borderBottomRightRadius:30 },
//   heroBar:   { position:'absolute', left:0, right:0, flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:20 },
//   brandRow:  { flexDirection:'row', alignItems:'center', gap:10 },
//   brandIcon: { width:38, height:38, borderRadius:11, justifyContent:'center', alignItems:'center', shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.3, shadowRadius:4, elevation:4 },
//   heroApp:   { color:'#FFFFFF', fontWeight:'900', fontSize:18, letterSpacing:0.3, textShadowColor:'rgba(0,0,0,0.5)', textShadowOffset:{width:0,height:1}, textShadowRadius:4 },
//   heroUni:   { color:'rgba(255,255,255,0.80)', fontSize:10, fontWeight:'600', marginTop:1, letterSpacing:0.4 },
//   bellBtn:   { width:42, height:42, borderRadius:21, backgroundColor:'rgba(0,0,0,0.28)', justifyContent:'center', alignItems:'center', borderWidth:1, borderColor:'rgba(255,255,255,0.22)' },

//   welcomeBlock: { position:'absolute', bottom:70, left:22, right:22 },
//   heroHi:    { color:'rgba(255,255,255,0.90)', fontSize:15, fontWeight:'600', letterSpacing:0.2, textShadowColor:'rgba(0,0,0,0.7)', textShadowOffset:{width:0,height:1}, textShadowRadius:6 },
//   heroName:  { color:'#FFFFFF', fontSize:32, fontWeight:'900', letterSpacing:0.2, marginTop:2, textShadowColor:'rgba(0,0,0,0.8)', textShadowOffset:{width:0,height:2}, textShadowRadius:10 },
//   heroPill:  { flexDirection:'row', alignItems:'center', gap:7, marginTop:14, alignSelf:'flex-start', backgroundColor:'rgba(255,255,255,0.18)', paddingHorizontal:14, paddingVertical:7, borderRadius:22, borderWidth:1, borderColor:'rgba(255,255,255,0.28)' },
//   heroPillT: { color:'rgba(255,255,255,0.92)', fontSize:11, fontWeight:'600', letterSpacing:0.3 },

//   statsStrip: { position:'absolute', bottom:0, left:0, right:0, flexDirection:'row', backgroundColor:'rgba(0,0,0,0.45)', paddingVertical:13, borderBottomLeftRadius:30, borderBottomRightRadius:30, borderTopWidth:1, borderTopColor:'rgba(255,255,255,0.10)' },
//   statItem:   { flex:1, alignItems:'center', gap:3 },
//   statBorder: { borderRightWidth:1, borderRightColor:'rgba(255,255,255,0.18)' },
//   statVal:    { color:'#fff', fontWeight:'900', fontSize:16, textShadowColor:'rgba(0,0,0,0.5)', textShadowOffset:{width:0,height:1}, textShadowRadius:3 },
//   statLabel:  { color:'rgba(255,255,255,0.72)', fontSize:10, fontWeight:'600' },

//   sec:       { marginTop:24 },
//   secHeader: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:16, marginBottom:14 },
//   secTitle:  { fontSize:16, fontWeight:'800', color:C.textDark, letterSpacing:0.1 },
//   secMore:   { fontSize:13, fontWeight:'600', color:C.primary },

//   featureGrid: { flexDirection:'row', flexWrap:'wrap', paddingHorizontal:16, gap:10 },

//   pubRow:     { flexDirection:'row', paddingHorizontal:16, gap:10 },
//   pubCard:    { flex:1, borderRadius:18, backgroundColor:C.surface, alignItems:'center', paddingVertical:18, gap:10, borderTopWidth:3, shadowColor:'#00000010', shadowOffset:{width:0,height:3}, shadowOpacity:1, shadowRadius:8, elevation:2 },
//   pubIconGrad:{ width:48, height:48, borderRadius:14, justifyContent:'center', alignItems:'center' },
//   pubLabel:   { fontSize:11, fontWeight:'700', textAlign:'center', color:C.textMid, lineHeight:15 },

//   aboutTile:      { marginHorizontal:16, borderRadius:22, overflow:'hidden', shadowColor:C.primaryDark+'44', shadowOffset:{width:0,height:6}, shadowOpacity:1, shadowRadius:14, elevation:6 },
//   aboutTileInner: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:20, paddingVertical:18 },
//   aboutLeft:      { flexDirection:'row', alignItems:'center', gap:16, flex:1 },
//   adityaBox:      { width:58, height:58, borderRadius:16, backgroundColor:'rgba(255,255,255,0.18)', justifyContent:'center', alignItems:'center', gap:3, borderWidth:1, borderColor:'rgba(255,255,255,0.28)' },
//   adityaText:     { color:'#fff', fontSize:7, fontWeight:'900', letterSpacing:1.6 },
//   aboutTitle:     { color:'#fff', fontWeight:'800', fontSize:15 },
//   aboutSub:       { color:'rgba(255,255,255,0.75)', fontSize:11, marginTop:3 },
//   aboutArrow:     { width:34, height:34, borderRadius:17, backgroundColor:'rgba(255,255,255,0.18)', justifyContent:'center', alignItems:'center' },

//   fbList:    { paddingHorizontal:16, gap:10 },
//   fbCard:    { backgroundColor:C.surface, borderRadius:16, padding:14, shadowColor:C.primary+'18', shadowOffset:{width:0,height:3}, shadowOpacity:1, shadowRadius:10, elevation:3, borderWidth:1, borderColor:C.border },
//   fbHeader:  { flexDirection:'row', alignItems:'center', gap:10, marginBottom:10 },
//   fbAvatar:  { width:40, height:40, borderRadius:20, justifyContent:'center', alignItems:'center' },
//   fbAvatarT: { color:'#fff', fontWeight:'800', fontSize:14 },
//   fbName:    { color:C.textDark, fontWeight:'700', fontSize:13 },
//   fbRole:    { color:C.textLight, fontSize:11, marginTop:1 },
//   fbText:    { color:C.textMid, fontSize:12, lineHeight:19, fontStyle:'italic' },

//   mapBanner: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', borderRadius:22, padding:22, shadowColor:C.primary+'44', shadowOffset:{width:0,height:6}, shadowOpacity:1, shadowRadius:14, elevation:6 },
//   mapTitle:  { color:'#fff', fontWeight:'800', fontSize:16 },
//   mapSub:    { color:'#ffffffAA', fontSize:12, marginTop:4 },
//   mapArrow:  { width:42, height:42, borderRadius:21, backgroundColor:'#FFFFFF1E', justifyContent:'center', alignItems:'center' },

//   badge:     { position:'absolute', top:-4, right:-4, backgroundColor:'#FFB300', width:16, height:16, borderRadius:8, justifyContent:'center', alignItems:'center' },
//   badgeText: { color:'#fff', fontSize:9, fontWeight:'800' },

//   navWrap:      { position:'absolute', bottom:0, left:0, right:0, shadowColor:'#00000018', shadowOffset:{width:0,height:-3}, shadowOpacity:1, shadowRadius:16, elevation:20 },
//   navBar:       { flexDirection:'row', paddingBottom:Platform.OS==='ios'?28:10, paddingTop:10, borderTopLeftRadius:24, borderTopRightRadius:24, borderTopWidth:1, borderColor:C.border },
//   navItem:      { flex:1, alignItems:'center', gap:4, paddingTop:2 },
//   navPip:       { position:'absolute', top:-10, width:28, height:3, borderRadius:3, backgroundColor:C.primary },
//   navIconBox:   { width:46, height:36, justifyContent:'center', alignItems:'center', borderRadius:13 },
//   navIconBoxOn: { backgroundColor:C.primary+'18' },
//   navLabel:     { fontSize:10, color:C.textLight, fontWeight:'600' },
//   navLabelOn:   { color:C.primary, fontWeight:'800' },
// });