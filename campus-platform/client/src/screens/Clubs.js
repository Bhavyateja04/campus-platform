import React, { useRef, useEffect, useState, useCallback } from 'react';
import { clubsApi } from '../services/api';

// Translate a backend Club document into the rich client UI shape used here.
function backendClubToUi(c) {
  if (!c || !c._id) return null;
  return {
    id: String(c._id),
    name: c.name,
    fullName: c.name,
    tagline: c.description || '',
    category: 'General',
    categoryColor: '#7C3AED',
    categoryBg: '#EDE9FE',
    icon: 'people',
    grad: ['#1E3A5F', '#3D6A9E'],
    imageUri: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    members: 0,
    founded: c.createdAt ? new Date(c.createdAt).getFullYear().toString() : '',
    meetings: 'Contact coordinator',
    venue: 'Campus',
    president: c.coordinatorName || '—',
    contact: c.coordinatorEmail || '',
    joined: false,
    about: c.description || '',
    achievements: [],
    activities: [],
    upcoming: '',
    _backend: true,
  };
}
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  StatusBar, Dimensions, Animated, Easing, Platform,
  TextInput, Modal, TouchableWithoutFeedback, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// ─── THEME — Deep Indigo / Gold  ─────────────────────────────────────────────
// Professional, distinct from Home (navy), Lost&Found (violet), Memories (rose)
const C = {
  primary:      '#1E3A5F',   // deep navy-indigo
  primaryDark:  '#0F2340',
  primaryLight: '#3D6A9E',
  primaryPale:  '#E8EFF8',
  accent:       '#F5A623',   // gold accent
  accentLight:  '#FFF8E7',
  bg:           '#F2F5FA',
  surface:      '#FFFFFF',
  surfaceAlt:   '#F7F9FC',
  textDark:     '#0A1628',
  textMid:      '#3D5068',
  textLight:    '#8FA5C0',
  border:       '#DDE6F0',
  green:        '#16A34A',
  greenPale:    '#DCFCE7',
};

const EASE = Easing.bezier(0.22, 1, 0.36, 1);

const useEntrance = (delay = 0, dy = 20) => {
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(dy)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 500, delay, easing: EASE, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 500, delay, easing: EASE, useNativeDriver: true }),
    ]).start();
  }, []);
  return { opacity, transform: [{ translateY }] };
};

// ─── CLUB DATA ────────────────────────────────────────────────────────────────
const CLUBS = [
  {
    id: 'sac',
    name: 'SAC',
    fullName: 'Student Activity Council',
    tagline: 'Leading campus culture & student welfare',
    category: 'Leadership',
    categoryColor: '#7C3AED',
    categoryBg:    '#EDE9FE',
    icon: 'people',
    grad: ['#1E3A5F', '#3D6A9E'],
    imageUri: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    members: 120,
    founded: '2010',
    meetings: 'Every Saturday, 10:00 AM',
    venue: 'Main Auditorium',
    president: 'Arjun Mehta',
    contact: 'sac@adityauniversity.in',
    joined: false,
    about: 'The Student Activity Council is the apex student body of Aditya University. SAC coordinates all major campus events, fests, and student welfare initiatives. From organizing the annual cultural fest to representing student voices to the administration, SAC is the heartbeat of campus life.',
    achievements: [
      'Organized "Aaditya Fest 2025" with 5,000+ attendees',
      'Launched the Campus Mental Health Initiative',
      'Won Best Student Council Award – AP State 2024',
      'Facilitated ₹2L scholarship for 40+ students',
    ],
    activities: ['Cultural Fests', 'Student Elections', 'Welfare Programs', 'Inter-college Events', 'Community Outreach'],
    upcoming: 'Annual Tech-Cultural Fest — July 2025',
  },
  {
    id: 'edc',
    name: 'EDC',
    fullName: 'Entrepreneurship Development Cell',
    tagline: 'Building tomorrow\'s founders today',
    category: 'Entrepreneurship',
    categoryColor: '#D97706',
    categoryBg:    '#FEF3C7',
    icon: 'bulb',
    grad: ['#92400E', '#D97706'],
    imageUri: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80',
    members: 85,
    founded: '2015',
    meetings: 'Every Wednesday, 5:00 PM',
    venue: 'Innovation Hub, Block C',
    president: 'Priya Sharma',
    contact: 'edc@adityauniversity.in',
    joined: false,
    about: 'The Entrepreneurship Development Cell nurtures the startup mindset among students. EDC provides mentorship, funding guidance, networking opportunities, and hands-on workshops to transform student ideas into real businesses. We believe every student has a founder within them.',
    achievements: [
      '12 student startups funded through EDC network',
      'Hosted "Startup Carnival" with 30+ investor pitches',
      'MOU signed with NASSCOM & TiE Andhra Pradesh',
      'Students won ₹15L at national hackathons',
    ],
    activities: ['Startup Pitches', 'Investor Meetups', 'Ideathons', 'Business Workshops', 'Mentorship Sessions'],
    upcoming: 'Startup Weekend Bootcamp — June 2025',
  },
  {
    id: 'robotics',
    name: 'Robotics Club',
    fullName: 'Aditya Robotics & Automation Club',
    tagline: 'Engineering the future, one bot at a time',
    category: 'Technology',
    categoryColor: '#0891B2',
    categoryBg:    '#CFFAFE',
    icon: 'hardware-chip',
    grad: ['#0C4A6E', '#0891B2'],
    imageUri: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80',
    members: 68,
    founded: '2018',
    meetings: 'Tuesdays & Thursdays, 4:00 PM',
    venue: 'Robotics Lab, Block B',
    president: 'Kiran Babu',
    contact: 'robotics@adityauniversity.in',
    joined: false,
    about: 'The Robotics & Automation Club is where engineering meets creativity. Members design, build, and program robots from scratch using Arduino, Raspberry Pi, ROS and more. We compete in national robotics competitions and also collaborate with local industries on automation projects.',
    achievements: [
      '1st Place – National Robotics Championship 2024',
      'Built an autonomous campus delivery bot prototype',
      'Collaborated with DRDO on drone navigation project',
      'Represented Andhra Pradesh at IIT Bombay Techfest',
    ],
    activities: ['Robot Building', 'Arduino Workshops', 'Drone Racing', 'IoT Projects', 'AI/ML Integration'],
    upcoming: 'Robowar 2025 — Inter-college Robot Battle, August',
  },
  {
    id: 'leo',
    name: 'LEO Club',
    fullName: 'LEO Club of Aditya University',
    tagline: 'Leadership, Experience & Opportunity',
    category: 'Social Service',
    categoryColor: '#16A34A',
    categoryBg:    '#DCFCE7',
    icon: 'heart',
    grad: ['#14532D', '#16A34A'],
    imageUri: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80',
    members: 94,
    founded: '2012',
    meetings: 'Every Sunday, 9:00 AM',
    venue: 'Community Hall',
    president: 'Sneha Reddy',
    contact: 'leo@adityauniversity.in',
    joined: false,
    about: 'LEO Club is affiliated with Lions International and is dedicated to community service, leadership development, and creating meaningful impact in society. Our members volunteer for causes ranging from education and health camps to environmental conservation and disaster relief.',
    achievements: [
      'Organized 20+ blood donation camps (1,200+ units)',
      'Adopted 3 villages for digital literacy programs',
      'Won Best LEO Club – South India District 2024',
      'Planted 5,000 trees across Surampalem region',
    ],
    activities: ['Blood Donation', 'Village Adoption', 'Health Camps', 'Environmental Drives', 'Literacy Programs'],
    upcoming: 'Mega Blood Donation Camp — June 5, 2025',
  },
  {
    id: 'sports',
    name: 'Sports Club',
    fullName: 'Aditya University Sports Council',
    tagline: 'Sweat, compete, champion',
    category: 'Sports',
    categoryColor: '#DC2626',
    categoryBg:    '#FEE2E2',
    icon: 'trophy',
    grad: ['#7F1D1D', '#DC2626'],
    imageUri: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
    members: 200,
    founded: '2008',
    meetings: 'Daily, 6:00 AM & 5:00 PM',
    venue: 'Sports Complex & Athletic Ground',
    president: 'Rohit Kumar',
    contact: 'sports@adityauniversity.in',
    joined: false,
    about: 'The Sports Council oversees all sporting activities at Aditya University. From cricket and football to chess and athletics, we support student athletes with training, coaching, and inter-college competition opportunities. Our goal is to nurture champions at every level.',
    achievements: [
      'University Cricket Team – State Champions 2024',
      'Football team qualified for National College League',
      'Produced 3 athletes selected for AP State Games',
      'Hosted "Aditya Sports Meet" with 1,000+ participants',
    ],
    activities: ['Cricket', 'Football', 'Volleyball', 'Chess', 'Athletics', 'Badminton', 'Basketball'],
    upcoming: 'Annual Sports Meet 2025 — July 10–15',
  },
  {
    id: 'coding',
    name: 'CodeChef Chapter',
    fullName: 'Aditya CodeChef Campus Chapter',
    tagline: 'Code, compete & conquer',
    category: 'Technology',
    categoryColor: '#0891B2',
    categoryBg:    '#CFFAFE',
    icon: 'code-slash',
    grad: ['#1E3A5F', '#0891B2'],
    imageUri: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80',
    members: 110,
    founded: '2019',
    meetings: 'Every Friday, 6:00 PM',
    venue: 'CS Lab 2, Block A',
    president: 'Teja Varma',
    contact: 'codechef@adityauniversity.in',
    joined: false,
    about: 'The official CodeChef Campus Chapter trains students for competitive programming, coding contests, and placement preparation. We conduct weekly coding contests, DSA workshops, and mock interviews. Our members have consistently ranked in the top 1% of national coding competitions.',
    achievements: [
      'Ranked #3 among all CodeChef chapters in AP',
      '15 students placed in top 100 at CodeChef Long',
      'Conducted 50+ DSA sessions for 500+ students',
      'Alumni placed at Google, Amazon, Microsoft, Flipkart',
    ],
    activities: ['DSA Workshops', 'Coding Contests', 'Hackathons', 'Mock Interviews', 'CP Training'],
    upcoming: 'Code Sprint 2025 — Open coding contest, June 20',
  },
  {
    id: 'nss',
    name: 'NSS Unit',
    fullName: 'National Service Scheme – Aditya Unit',
    tagline: 'Not me, but you',
    category: 'Social Service',
    categoryColor: '#16A34A',
    categoryBg:    '#DCFCE7',
    icon: 'ribbon',
    grad: ['#064E3B', '#059669'],
    imageUri: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80',
    members: 150,
    founded: '2009',
    meetings: 'Saturdays, 8:00 AM',
    venue: 'NSS Room, Admin Block',
    president: 'Meera Nair',
    contact: 'nss@adityauniversity.in',
    joined: false,
    about: 'NSS at Aditya University is a government-recognized social service program that instills a sense of social responsibility in students. NSS volunteers contribute 120+ hours of community service per year in areas like education, health, sanitation, and disaster management.',
    achievements: [
      'Best NSS Unit Award – Andhra Pradesh 2023 & 2024',
      'Conducted COVID relief camps for 10,000+ families',
      'Swachh Bharat drives across 15 villages',
      'Annual special camp with 200+ volunteers',
    ],
    activities: ['Village Camps', 'Health Awareness', 'Swachh Bharat', 'Disaster Relief', 'Education Drives'],
    upcoming: 'Annual 7-Day Special Camp — July 2025',
  },
  {
    id: 'ieee',
    name: 'IEEE SB',
    fullName: 'IEEE Student Branch – Aditya University',
    tagline: 'Advancing technology for humanity',
    category: 'Technology',
    categoryColor: '#0891B2',
    categoryBg:    '#CFFAFE',
    icon: 'flash',
    grad: ['#1E3A5F', '#7C3AED'],
    imageUri: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=80',
    members: 78,
    founded: '2016',
    meetings: 'Every Thursday, 5:30 PM',
    venue: 'ECE Seminar Hall, Block D',
    president: 'Naveen Raj',
    contact: 'ieee@adityauniversity.in',
    joined: false,
    about: 'The IEEE Student Branch connects engineering students to the world\'s largest professional organization for technical advancement. Members get access to research papers, global conferences, webinars, and collaborate on cutting-edge technical projects in AI, IoT, and embedded systems.',
    achievements: [
      'Best IEEE SB in Andhra Pradesh – 2024',
      'Published 8 student research papers at IEEE conferences',
      'Organized "TechVision 2025" with 500+ attendees',
      'Partnered with IEEE Delhi Section for national programs',
    ],
    activities: ['Research Projects', 'Technical Workshops', 'Paper Presentations', 'Webinars', 'Industry Visits'],
    upcoming: 'IEEE TechVision Symposium — August 2025',
  },
];

const CATEGORIES = ['All', 'Technology', 'Leadership', 'Entrepreneurship', 'Social Service', 'Sports'];

// ─── STAT CHIP ────────────────────────────────────────────────────────────────
const StatChip = ({ icon, value, label }) => (
  <View style={S.statChip}>
    <Ionicons name={icon} size={14} color={C.primary} />
    <View>
      <Text style={S.statVal}>{value}</Text>
      <Text style={S.statLbl}>{label}</Text>
    </View>
  </View>
);

// ─── CLUB DETAIL MODAL ────────────────────────────────────────────────────────
const ClubDetailModal = ({ club, onClose, onToggleJoin }) => {
  const slideY = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    Animated.spring(slideY, { toValue: 0, speed: 16, bounciness: 3, useNativeDriver: true }).start();
  }, []);

  const close = () => {
    Animated.timing(slideY, { toValue: height, duration: 280, easing: EASE, useNativeDriver: true }).start(onClose);
  };

  return (
    <Modal transparent animationType="none" onRequestClose={close}>
      <TouchableWithoutFeedback onPress={close}>
        <View style={dm.overlay} />
      </TouchableWithoutFeedback>

      <Animated.View style={[dm.sheet, { transform: [{ translateY: slideY }] }]}>
        {/* Drag handle */}
        <View style={dm.handle} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Hero image */}
          <View style={dm.heroWrap}>
            <Image source={{ uri: club.imageUri }} style={dm.heroImg} resizeMode="cover" />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.72)']}
              style={StyleSheet.absoluteFill}
            />
            {/* Close button */}
            <TouchableOpacity style={dm.closeBtn} onPress={close}>
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
            {/* Club badge */}
            <View style={dm.heroBadge}>
              <LinearGradient colors={club.grad} style={dm.heroBadgeGrad}>
                <Ionicons name={club.icon} size={22} color="#fff" />
              </LinearGradient>
            </View>
            {/* Title */}
            <View style={dm.heroText}>
              <View style={[dm.catPill, { backgroundColor: club.categoryBg }]}>
                <Text style={[dm.catTxt, { color: club.categoryColor }]}>{club.category}</Text>
              </View>
              <Text style={dm.heroName}>{club.name}</Text>
              <Text style={dm.heroFull}>{club.fullName}</Text>
            </View>
          </View>

          <View style={dm.body}>
            {/* Stats row */}
            <View style={dm.statsRow}>
              <StatChip icon="people-outline" value={`${club.members}+`} label="Members" />
              <View style={dm.statDiv} />
              <StatChip icon="calendar-outline" value={club.founded} label="Founded" />
              <View style={dm.statDiv} />
              <StatChip icon="location-outline" value={club.venue.split(',')[0]} label="Venue" />
            </View>

            {/* About */}
            <Text style={dm.sectionTitle}>About</Text>
            <Text style={dm.aboutTxt}>{club.about}</Text>

            {/* Meeting info */}
            <View style={dm.infoCard}>
              <View style={dm.infoRow}>
                <View style={dm.infoIcon}><Ionicons name="time-outline" size={16} color={C.primary} /></View>
                <View>
                  <Text style={dm.infoLabel}>Meeting Schedule</Text>
                  <Text style={dm.infoVal}>{club.meetings}</Text>
                </View>
              </View>
              <View style={dm.infoDivider} />
              <View style={dm.infoRow}>
                <View style={dm.infoIcon}><Ionicons name="location-outline" size={16} color={C.primary} /></View>
                <View>
                  <Text style={dm.infoLabel}>Venue</Text>
                  <Text style={dm.infoVal}>{club.venue}</Text>
                </View>
              </View>
              <View style={dm.infoDivider} />
              <View style={dm.infoRow}>
                <View style={dm.infoIcon}><Ionicons name="person-outline" size={16} color={C.primary} /></View>
                <View>
                  <Text style={dm.infoLabel}>President</Text>
                  <Text style={dm.infoVal}>{club.president}</Text>
                </View>
              </View>
              <View style={dm.infoDivider} />
              <View style={dm.infoRow}>
                <View style={dm.infoIcon}><Ionicons name="mail-outline" size={16} color={C.primary} /></View>
                <View>
                  <Text style={dm.infoLabel}>Contact</Text>
                  <Text style={dm.infoVal}>{club.contact}</Text>
                </View>
              </View>
            </View>

            {/* Activities */}
            <Text style={dm.sectionTitle}>Activities</Text>
            <View style={dm.tagsWrap}>
              {club.activities.map((a, i) => (
                <View key={i} style={dm.actTag}>
                  <Text style={dm.actTagTxt}>{a}</Text>
                </View>
              ))}
            </View>

            {/* Achievements */}
            <Text style={dm.sectionTitle}>Achievements</Text>
            {club.achievements.map((ach, i) => (
              <View key={i} style={dm.achRow}>
                <LinearGradient colors={club.grad} style={dm.achDot}>
                  <Ionicons name="star" size={9} color="#fff" />
                </LinearGradient>
                <Text style={dm.achTxt}>{ach}</Text>
              </View>
            ))}

            {/* Upcoming */}
            <View style={dm.upcomingCard}>
              <LinearGradient colors={[C.accentLight, '#FFFDF0']} style={dm.upcomingGrad}>
                <View style={dm.upcomingRow}>
                  <View style={dm.upcomingIcon}>
                    <Ionicons name="megaphone" size={16} color={C.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={dm.upcomingLabel}>Upcoming Event</Text>
                    <Text style={dm.upcomingTxt}>{club.upcoming}</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* Join / Joined button */}
            <TouchableOpacity
              onPress={() => onToggleJoin(club.id)}
              activeOpacity={0.85}
              style={{ marginTop: 20 }}
            >
              {club.joined ? (
                <View style={dm.joinedBtn}>
                  <Ionicons name="checkmark-circle" size={18} color={C.green} />
                  <Text style={dm.joinedBtnTxt}>Joined</Text>
                </View>
              ) : (
                <LinearGradient colors={[C.primary, C.primaryDark]} style={dm.joinBtn}>
                  <Ionicons name="add-circle-outline" size={18} color="#fff" />
                  <Text style={dm.joinBtnTxt}>Join Club</Text>
                </LinearGradient>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
};

const dm = StyleSheet.create({
  overlay:      { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet:        { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: C.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: height * 0.92 },
  handle:       { width: 40, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: 'center', marginTop: 12, marginBottom: 0 },
  // Hero
  heroWrap:     { height: 240, position: 'relative' },
  heroImg:      { width: '100%', height: '100%' },
  closeBtn:     { position: 'absolute', top: 16, right: 16, width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  heroBadge:    { position: 'absolute', bottom: 60, left: 20 },
  heroBadgeGrad:{ width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  heroText:     { position: 'absolute', bottom: 18, left: 84, right: 16 },
  catPill:      { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 4 },
  catTxt:       { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  heroName:     { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: 0.2 },
  heroFull:     { fontSize: 11, color: 'rgba(255,255,255,0.78)', fontWeight: '500', marginTop: 1 },
  // Body
  body:         { padding: 20 },
  statsRow:     { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surfaceAlt, borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: C.border },
  statChip:     { flex: 1, alignItems: 'center', gap: 4 },
  statVal:      { fontSize: 14, fontWeight: '800', color: C.textDark, textAlign: 'center' },
  statLbl:      { fontSize: 10, color: C.textLight, textAlign: 'center', fontWeight: '600' },
  statDiv:      { width: 1, height: 36, backgroundColor: C.border },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: C.textDark, letterSpacing: 0.2, marginBottom: 10, marginTop: 4, textTransform: 'uppercase' },
  aboutTxt:     { fontSize: 14, color: C.textMid, lineHeight: 22, marginBottom: 18 },
  // Info card
  infoCard:     { backgroundColor: C.surfaceAlt, borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: C.border },
  infoRow:      { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 8 },
  infoIcon:     { width: 32, height: 32, borderRadius: 10, backgroundColor: C.primaryPale, justifyContent: 'center', alignItems: 'center' },
  infoLabel:    { fontSize: 11, color: C.textLight, fontWeight: '600', marginBottom: 2 },
  infoVal:      { fontSize: 13, color: C.textDark, fontWeight: '600' },
  infoDivider:  { height: 1, backgroundColor: C.border, marginLeft: 44 },
  // Tags
  tagsWrap:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  actTag:       { backgroundColor: C.primaryPale, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: C.border },
  actTagTxt:    { fontSize: 12, fontWeight: '600', color: C.primary },
  // Achievements
  achRow:       { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  achDot:       { width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', flexShrink: 0, marginTop: 1 },
  achTxt:       { flex: 1, fontSize: 13, color: C.textMid, lineHeight: 19 },
  // Upcoming
  upcomingCard: { borderRadius: 14, overflow: 'hidden', marginTop: 16, borderWidth: 1, borderColor: '#FFE082' },
  upcomingGrad: { padding: 14 },
  upcomingRow:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  upcomingIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#FFF8E1', justifyContent: 'center', alignItems: 'center' },
  upcomingLabel:{ fontSize: 10, fontWeight: '700', color: C.accent, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 2 },
  upcomingTxt:  { fontSize: 13, fontWeight: '600', color: C.textDark },
  // Buttons
  joinBtn:      { borderRadius: 16, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  joinBtnTxt:   { color: '#fff', fontWeight: '800', fontSize: 15 },
  joinedBtn:    { borderRadius: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.greenPale, borderWidth: 1.5, borderColor: C.green },
  joinedBtnTxt: { color: C.green, fontWeight: '800', fontSize: 15 },
});

// ─── CLUB CARD ────────────────────────────────────────────────────────────────
const ClubCard = ({ club, index, onPress, onToggleJoin }) => {
  const anim  = useEntrance(Math.min(index, 5) * 70, 20);
  const press = useRef(new Animated.Value(1)).current;
  const onIn  = () => Animated.spring(press, { toValue: 0.97, speed: 22, bounciness: 4, useNativeDriver: true }).start();
  const onOut = () => Animated.spring(press, { toValue: 1,    speed: 16, bounciness: 6, useNativeDriver: true }).start();

  return (
    <Animated.View style={[anim, { transform: [...anim.transform, { scale: press }] }]}>
      <TouchableOpacity onPressIn={onIn} onPressOut={onOut} onPress={() => onPress(club)}
        activeOpacity={1} style={S.card}>

        {/* Image */}
        <View style={S.cardImgWrap}>
          <Image source={{ uri: club.imageUri }} style={S.cardImg} resizeMode="cover" />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.65)']} style={StyleSheet.absoluteFill} />
          {/* Category */}
          <View style={[S.cardCat, { backgroundColor: club.categoryBg }]}>
            <Text style={[S.cardCatTxt, { color: club.categoryColor }]}>{club.category}</Text>
          </View>
          {/* Members badge */}
          <View style={S.membersBadge}>
            <Ionicons name="people" size={11} color="#fff" />
            <Text style={S.membersBadgeTxt}>{club.members}+ members</Text>
          </View>
        </View>

        {/* Content */}
        <View style={S.cardBody}>
          <View style={S.cardTitleRow}>
            <LinearGradient colors={club.grad} style={S.cardIcon}>
              <Ionicons name={club.icon} size={16} color="#fff" />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={S.cardName}>{club.name}</Text>
              <Text style={S.cardFull} numberOfLines={1}>{club.fullName}</Text>
            </View>
          </View>

          <Text style={S.cardTagline} numberOfLines={2}>{club.tagline}</Text>

          {/* Activity chips */}
          <View style={S.chipRow}>
            {club.activities.slice(0, 3).map((a, i) => (
              <View key={i} style={S.chip}>
                <Text style={S.chipTxt}>{a}</Text>
              </View>
            ))}
            {club.activities.length > 3 && (
              <View style={S.chip}>
                <Text style={S.chipTxt}>+{club.activities.length - 3}</Text>
              </View>
            )}
          </View>

          {/* Footer */}
          <View style={S.cardFooter}>
            <View style={S.meetRow}>
              <Ionicons name="time-outline" size={12} color={C.textLight} />
              <Text style={S.meetTxt} numberOfLines={1}>{club.meetings}</Text>
            </View>
            <TouchableOpacity
              onPress={(e) => { e.stopPropagation?.(); onToggleJoin(club.id); }}
              activeOpacity={0.82}
              style={[S.joinChip, club.joined && S.joinChipOn]}>
              {club.joined
                ? <><Ionicons name="checkmark" size={13} color={C.green} /><Text style={[S.joinChipTxt, { color: C.green }]}>Joined</Text></>
                : <><Ionicons name="add" size={13} color={C.primary} /><Text style={S.joinChipTxt}>Join</Text></>
              }
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── STATS BANNER ─────────────────────────────────────────────────────────────
const StatsBanner = ({ joined }) => {
  const anim = useEntrance(0, 10);
  return (
    <Animated.View style={[anim, S.statsBanner]}>
      <LinearGradient colors={[C.primary, C.primaryDark]} style={S.statsBannerGrad}>
        <View style={S.statsBannerItem}>
          <Text style={S.statsBannerVal}>8</Text>
          <Text style={S.statsBannerLbl}>Clubs</Text>
        </View>
        <View style={S.statsBannerDiv} />
        <View style={S.statsBannerItem}>
          <Text style={S.statsBannerVal}>905+</Text>
          <Text style={S.statsBannerLbl}>Members</Text>
        </View>
        <View style={S.statsBannerDiv} />
        <View style={S.statsBannerItem}>
          <Text style={S.statsBannerVal}>{joined}</Text>
          <Text style={S.statsBannerLbl}>Joined</Text>
        </View>
        <View style={S.statsBannerDiv} />
        <View style={S.statsBannerItem}>
          <Text style={S.statsBannerVal}>50+</Text>
          <Text style={S.statsBannerLbl}>Events/yr</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function ClubsScreen({ navigation }) {
  const [clubs,       setClubs]       = useState(CLUBS);
  const [search,      setSearch]      = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedClub, setSelectedClub] = useState(null);
  const SB_H = Platform.OS === 'ios' ? 44 : (StatusBar.currentHeight || 24);
  const hAnim = useEntrance(0, -8);

  const toggleJoin = useCallback((id) => {
    setClubs(prev => prev.map(c => c.id === id ? { ...c, joined: !c.joined } : c));
    // Also update selectedClub so the modal reflects
    setSelectedClub(prev => prev?.id === id ? { ...prev, joined: !prev.joined } : prev);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await clubsApi.list();
        if (cancelled) return;
        const ui = (Array.isArray(list) ? list : []).map(backendClubToUi).filter(Boolean);
        if (ui.length) setClubs(prev => [...ui, ...prev.filter(p => !p._backend)]);
      } catch (err) {
        console.warn('[Clubs] backend fetch failed (using seed data):', err?.message || err);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = clubs.filter(c => {
    const matchCat  = activeFilter === 'All' || c.category === activeFilter;
    const matchSearch = !search.trim() ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const joinedCount = clubs.filter(c => c.joined).length;

  return (
    <View style={S.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} translucent={false} />

      {/* Header */}
      <Animated.View style={[hAnim, S.header, { paddingTop: SB_H + 4 }]}>
        <TouchableOpacity style={S.hBtn} onPress={() => navigation?.goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color={C.textDark} />
        </TouchableOpacity>
        <View style={S.headerCenter}>
          <LinearGradient colors={[C.primary, C.accent]} style={S.headerLogo}>
            <Ionicons name="people" size={15} color="#fff" />
          </LinearGradient>
          <Text style={S.headerTitle}>Clubs</Text>
        </View>
        <View style={{ width: 36 }} />
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}
        stickyHeaderIndices={[1]}>

        {/* Stats Banner */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 }}>
          <StatsBanner joined={joinedCount} />
        </View>

        {/* Sticky Search + Filter */}
        <View style={S.stickyBlock}>
          {/* Search */}
          <View style={S.searchBar}>
            <Ionicons name="search-outline" size={17} color={C.textLight} />
            <TextInput
              style={S.searchInput}
              placeholder="Search clubs..."
              placeholderTextColor={C.textLight}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={17} color={C.textLight} />
              </TouchableOpacity>
            )}
          </View>
          {/* Filter tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={S.filterRow}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity key={cat}
                style={[S.filterChip, activeFilter === cat && S.filterChipOn]}
                onPress={() => setActiveFilter(cat)} activeOpacity={0.8}>
                <Text style={[S.filterChipTxt, activeFilter === cat && S.filterChipTxtOn]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Club Cards */}
        <View style={S.cardList}>
          {filtered.length === 0 ? (
            <View style={S.empty}>
              <Ionicons name="search-outline" size={40} color={C.textLight} />
              <Text style={S.emptyTxt}>No clubs found</Text>
              <Text style={S.emptySub}>Try a different search or category</Text>
            </View>
          ) : (
            filtered.map((club, i) => (
              <ClubCard
                key={club.id}
                club={club}
                index={i}
                onPress={setSelectedClub}
                onToggleJoin={toggleJoin}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Club Detail Modal */}
      {selectedClub && (
        <ClubDetailModal
          club={selectedClub}
          onClose={() => setSelectedClub(null)}
          onToggleJoin={toggleJoin}
        />
      )}
    </View>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 10,
    backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  hBtn:         { width: 36, height: 36, justifyContent: 'center' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerLogo:   { width: 30, height: 30, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  headerTitle:  { fontSize: 17, fontWeight: '800', color: C.textDark, letterSpacing: 0.2 },

  // Stats banner
  statsBanner:      { borderRadius: 18, overflow: 'hidden', shadowColor: C.primary + '40', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 6 },
  statsBannerGrad:  { flexDirection: 'row', paddingVertical: 16, paddingHorizontal: 8 },
  statsBannerItem:  { flex: 1, alignItems: 'center' },
  statsBannerVal:   { fontSize: 18, fontWeight: '900', color: '#fff' },
  statsBannerLbl:   { fontSize: 10, color: 'rgba(255,255,255,0.72)', fontWeight: '600', marginTop: 2 },
  statsBannerDiv:   { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 4 },

  // Sticky block
  stickyBlock:  { backgroundColor: C.bg, paddingTop: 12, paddingBottom: 4 },
  searchBar:    { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.surface, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11, marginHorizontal: 16, borderWidth: 1, borderColor: C.border, shadowColor: '#00000008', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2 },
  searchInput:  { flex: 1, fontSize: 14, color: C.textDark, padding: 0 },
  filterRow:    { paddingHorizontal: 16, gap: 8, paddingVertical: 12, paddingBottom: 6 },
  filterChip:   { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
  filterChipOn: { backgroundColor: C.primary, borderColor: C.primary },
  filterChipTxt:{ fontSize: 12, fontWeight: '600', color: C.textMid },
  filterChipTxtOn: { color: '#fff' },

  // Cards
  cardList:     { paddingHorizontal: 16, paddingTop: 4, gap: 16 },
  card:         { backgroundColor: C.surface, borderRadius: 22, overflow: 'hidden', shadowColor: C.primary + '18', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 14, elevation: 5, borderWidth: 1, borderColor: C.border },

  cardImgWrap:  { height: 180, position: 'relative' },
  cardImg:      { width: '100%', height: '100%' },
  cardCat:      { position: 'absolute', top: 12, left: 12, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4 },
  cardCatTxt:   { fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },
  membersBadge: { position: 'absolute', bottom: 12, right: 12, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  membersBadgeTxt: { color: '#fff', fontSize: 11, fontWeight: '600' },

  cardBody:     { padding: 16 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  cardIcon:     { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardName:     { fontSize: 16, fontWeight: '800', color: C.textDark },
  cardFull:     { fontSize: 11, color: C.textLight, fontWeight: '500', marginTop: 1 },
  cardTagline:  { fontSize: 13, color: C.textMid, lineHeight: 19, marginBottom: 12 },

  chipRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  chip:         { backgroundColor: C.primaryPale, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: C.border },
  chipTxt:      { fontSize: 11, fontWeight: '600', color: C.primary },

  cardFooter:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  meetRow:      { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  meetTxt:      { fontSize: 11, color: C.textLight, fontWeight: '500', flex: 1 },
  joinChip:     { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: C.primaryPale, borderWidth: 1.5, borderColor: C.primary + '50' },
  joinChipOn:   { backgroundColor: C.greenPale, borderColor: C.green + '80' },
  joinChipTxt:  { fontSize: 12, fontWeight: '700', color: C.primary },

  // Empty
  empty:      { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTxt:   { fontSize: 16, fontWeight: '700', color: C.textLight },
  emptySub:   { fontSize: 13, color: C.textLight },
});