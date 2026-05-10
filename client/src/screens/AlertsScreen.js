import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  StatusBar, Animated, Easing, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const C = {
  primary:      '#4A6FA5',
  primaryDark:  '#2E4D7A',
  primaryPale:  '#EBF1F8',
  orange:       '#E07B3A',
  teal:         '#00796B',
  gold:         '#FFB300',
  purple:       '#6A1B9A',
  bg:           '#F5F8FC',
  surface:      '#FFFFFF',
  textDark:     '#0D1B2A',
  textMid:      '#3D5068',
  textLight:    '#8FA8C0',
  border:       '#D6E4F0',
  danger:       '#D32F2F',
};

const EASE = Easing.bezier(0.22, 1, 0.36, 1);
const useEntrance = (delay = 0, dy = 20) => {
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(dy)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 560, delay, easing: EASE, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 560, delay, easing: EASE, useNativeDriver: true }),
    ]).start();
  }, []);
  return { opacity, transform: [{ translateY }] };
};

const TABS = ['All', 'Academic', 'Events', 'Clubs', 'System'];

const ALERTS = [
  {
    id: '1', type: 'Academic', icon: 'book-outline',
    title: 'Mid Semester Exams',
    body: 'Mid semester exams scheduled from Nov 18–24. Hall tickets available in Exam Locator.',
    time: '2 min ago', color: C.primary, unread: true,
  },
  {
    id: '2', type: 'Events', icon: 'trophy-outline',
    title: 'Hackathon 2025 — Registration Open!',
    body: 'Register before Nov 15 for the Annual University Hackathon. Prizes worth ₹2 Lakh.',
    time: '1 hr ago', color: C.orange, unread: true,
  },
  {
    id: '3', type: 'Clubs', icon: 'people-outline',
    title: 'Coding Club — Weekly Meet',
    body: 'This Saturday at 10AM in Lab 3. Topic: Competitive Programming with C++.',
    time: '3 hrs ago', color: C.purple, unread: true,
  },
  {
    id: '4', type: 'Academic', icon: 'document-text-outline',
    title: 'Assignment Deadline Reminder',
    body: 'DS Lab assignment due tomorrow 11:59 PM. Submit via the college portal.',
    time: '5 hrs ago', color: C.primary, unread: false,
  },
  {
    id: '5', type: 'System', icon: 'settings-outline',
    title: 'Campix Update Available',
    body: 'New version 1.1.0 is ready. Includes Campus Memories, improved Lost & Found.',
    time: 'Yesterday', color: C.teal, unread: false,
  },
  {
    id: '6', type: 'Events', icon: 'musical-notes-outline',
    title: 'Cultural Fest — Aditya Mahotsav',
    body: 'Three-day cultural fest kicks off Nov 22. Registrations close Nov 19.',
    time: '2 days ago', color: C.orange, unread: false,
  },
  {
    id: '7', type: 'Academic', icon: 'library-outline',
    title: 'Library Hours Extended',
    body: 'Library will remain open till 10 PM during exam season (Nov 14–24).',
    time: '3 days ago', color: C.primary, unread: false,
  },
  {
    id: '8', type: 'Clubs', icon: 'camera-outline',
    title: 'Photography Club: Campus Walk',
    body: 'Join us Sunday 7AM for the golden hour campus photography session.',
    time: '4 days ago', color: C.purple, unread: false,
  },
];

const AlertCard = ({ item, delay, onPress }) => {
  const anim = useEntrance(delay, 18);
  return (
    <Animated.View style={anim}>
      <TouchableOpacity style={[S.alertCard, item.unread && S.alertCardUnread]}
        onPress={onPress} activeOpacity={0.78}>
        <View style={[S.alertIconWrap, { backgroundColor: item.color + '18' }]}>
          <Ionicons name={item.icon} size={20} color={item.color} />
          {item.unread && <View style={[S.unreadDot, { backgroundColor: item.color }]} />}
        </View>
        <View style={{ flex: 1 }}>
          <View style={S.alertTopRow}>
            <Text style={[S.alertType, { color: item.color }]}>{item.type}</Text>
            <Text style={S.alertTime}>{item.time}</Text>
          </View>
          <Text style={S.alertTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={S.alertBody} numberOfLines={2}>{item.body}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function AlertsScreen({ navigation }) {
  const SB_H = Platform.OS === 'ios' ? 44 : (StatusBar.currentHeight || 24);
  const [activeTab, setActiveTab] = useState('All');
  const [alerts, setAlerts] = useState(ALERTS);

  const headerAnim = useEntrance(60, -12);
  const unreadCount = alerts.filter(a => a.unread).length;

  const filtered = activeTab === 'All' ? alerts : alerts.filter(a => a.type === activeTab);

  const markAllRead = () => setAlerts(a => a.map(x => ({ ...x, unread: false })));
  const markRead = (id) => setAlerts(a => a.map(x => x.id === id ? { ...x, unread: false } : x));

  return (
    <View style={S.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <Animated.View style={headerAnim}>
        <LinearGradient colors={[C.primary, C.primaryDark]} style={[S.header, { paddingTop: SB_H + 12 }]}>
          <TouchableOpacity style={S.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View>
            <Text style={S.headerTitle}>Notifications</Text>
            {unreadCount > 0 && <Text style={S.headerSub}>{unreadCount} unread alerts</Text>}
          </View>
          <TouchableOpacity style={S.markAllBtn} onPress={markAllRead}>
            <Text style={S.markAllT}>Mark all read</Text>
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>

      {/* TABS */}
      <View style={S.tabsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={S.tabs}>
          {TABS.map(t => {
            const active = activeTab === t;
            const cnt = t === 'All' ? alerts.filter(x => x.unread).length
              : alerts.filter(x => x.type === t && x.unread).length;
            return (
              <TouchableOpacity key={t} style={[S.tab, active && S.tabActive]}
                onPress={() => setActiveTab(t)} activeOpacity={0.75}>
                <Text style={[S.tabT, active && S.tabTActive]}>{t}</Text>
                {cnt > 0 && (
                  <View style={[S.tabBadge, active && S.tabBadgeActive]}>
                    <Text style={[S.tabBadgeT, active && S.tabBadgeTActive]}>{cnt}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={S.list}>
        {filtered.length === 0 ? (
          <View style={S.empty}>
            <Ionicons name="notifications-off-outline" size={52} color={C.textLight} />
            <Text style={S.emptyT}>No alerts here</Text>
          </View>
        ) : filtered.map((item, i) => (
          <AlertCard key={item.id} item={item} delay={60 + i * 40}
            onPress={() => markRead(item.id)} />
        ))}
      </ScrollView>
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 18 },
  headerTitle: { color: '#fff', fontWeight: '900', fontSize: 20, textAlign: 'center' },
  headerSub:   { color: 'rgba(255,255,255,0.75)', fontSize: 11, textAlign: 'center', marginTop: 2 },
  backBtn:     { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center' },
  markAllBtn:  { paddingHorizontal: 12, paddingVertical: 7, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 20 },
  markAllT:    { color: '#fff', fontSize: 11, fontWeight: '700' },

  tabsWrap: { backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  tab:  { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: C.bg, borderWidth: 1, borderColor: C.border },
  tabActive:  { backgroundColor: C.primary, borderColor: C.primary },
  tabT:       { fontSize: 12, fontWeight: '700', color: C.textMid },
  tabTActive: { color: '#fff' },
  tabBadge:   { backgroundColor: C.primary + '20', borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1 },
  tabBadgeActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  tabBadgeT:  { fontSize: 10, fontWeight: '800', color: C.primary },
  tabBadgeTActive: { color: '#fff' },

  list: { padding: 16, gap: 10, paddingBottom: 110 },

  alertCard: {
    flexDirection: 'row', gap: 12, backgroundColor: C.surface, borderRadius: 18,
    padding: 14, borderWidth: 1, borderColor: C.border,
    shadowColor: '#00000010', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2,
  },
  alertCardUnread: { borderLeftWidth: 3, borderLeftColor: C.primary, backgroundColor: C.primaryPale + '60' },
  alertIconWrap: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  unreadDot: { position: 'absolute', top: 0, right: 0, width: 9, height: 9, borderRadius: 5, borderWidth: 1.5, borderColor: C.bg },
  alertTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  alertType:  { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  alertTime:  { fontSize: 10, color: C.textLight, fontWeight: '600' },
  alertTitle: { fontSize: 14, fontWeight: '800', color: C.textDark, marginBottom: 4 },
  alertBody:  { fontSize: 12, color: C.textMid, lineHeight: 17 },

  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyT: { color: C.textLight, fontSize: 15, fontWeight: '600' },
});