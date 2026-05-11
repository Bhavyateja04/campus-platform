/**
 * ClubsScreen.jsx
 *
 * Displays all university clubs with search, category filtering,
 * detail modal, and join/leave toggling. Merges live backend data
 * with local seed data, falling back to seed data on network error.
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
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
  TextInput,
  Modal,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { clubsApi } from '../services/api';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const { width, height } = Dimensions.get('window');

/** App-wide colour palette — Deep Indigo / Gold theme. */
const COLORS = {
  primary:      '#1E3A5F',
  primaryDark:  '#0F2340',
  primaryLight: '#3D6A9E',
  primaryPale:  '#E8EFF8',
  accent:       '#F5A623',
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

/** Smooth spring-like cubic-bezier used for all entrance animations. */
const EASE_OUT_EXPO = Easing.bezier(0.22, 1, 0.36, 1);

/** Category filter options shown in the horizontal tab bar. */
const CATEGORIES = ['All', 'Technology', 'Leadership', 'Entrepreneurship', 'Social Service', 'Sports'];

// ─── SEED DATA ────────────────────────────────────────────────────────────────

/**
 * Static club data used when the backend is unavailable or returns no records.
 * Each club matches the UI shape expected by ClubCard and ClubDetailModal.
 */
const SEED_CLUBS = [
  {
    id: 'sac',
    name: 'SAC',
    fullName: 'Student Activity Council',
    tagline: 'Leading campus culture & student welfare',
    category: 'Leadership',
    categoryColor: '#7C3AED',
    categoryBg: '#EDE9FE',
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
    about:
      'The Student Activity Council is the apex student body of Aditya University. SAC coordinates all major campus events, fests, and student welfare initiatives. From organizing the annual cultural fest to representing student voices to the administration, SAC is the heartbeat of campus life.',
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
    tagline: "Building tomorrow's founders today",
    category: 'Entrepreneurship',
    categoryColor: '#D97706',
    categoryBg: '#FEF3C7',
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
    about:
      'The Entrepreneurship Development Cell nurtures the startup mindset among students. EDC provides mentorship, funding guidance, networking opportunities, and hands-on workshops to transform student ideas into real businesses. We believe every student has a founder within them.',
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
    categoryBg: '#CFFAFE',
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
    about:
      'The Robotics & Automation Club is where engineering meets creativity. Members design, build, and program robots from scratch using Arduino, Raspberry Pi, ROS and more. We compete in national robotics competitions and also collaborate with local industries on automation projects.',
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
    categoryBg: '#DCFCE7',
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
    about:
      'LEO Club is affiliated with Lions International and is dedicated to community service, leadership development, and creating meaningful impact in society. Our members volunteer for causes ranging from education and health camps to environmental conservation and disaster relief.',
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
    categoryBg: '#FEE2E2',
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
    about:
      'The Sports Council oversees all sporting activities at Aditya University. From cricket and football to chess and athletics, we support student athletes with training, coaching, and inter-college competition opportunities. Our goal is to nurture champions at every level.',
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
    id: 'codechef',
    name: 'CodeChef Chapter',
    fullName: 'Aditya CodeChef Campus Chapter',
    tagline: 'Code, compete & conquer',
    category: 'Technology',
    categoryColor: '#0891B2',
    categoryBg: '#CFFAFE',
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
    about:
      'The official CodeChef Campus Chapter trains students for competitive programming, coding contests, and placement preparation. We conduct weekly coding contests, DSA workshops, and mock interviews. Our members have consistently ranked in the top 1% of national coding competitions.',
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
    categoryBg: '#DCFCE7',
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
    about:
      'NSS at Aditya University is a government-recognized social service program that instills a sense of social responsibility in students. NSS volunteers contribute 120+ hours of community service per year in areas like education, health, sanitation, and disaster management.',
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
    categoryBg: '#CFFAFE',
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
    about:
      "The IEEE Student Branch connects engineering students to the world's largest professional organization for technical advancement. Members get access to research papers, global conferences, webinars, and collaborate on cutting-edge technical projects in AI, IoT, and embedded systems.",
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

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/**
 * Maps a raw backend Club document to the UI shape used throughout this screen.
 *
 * @param {object} backendClub - Raw document returned by the API.
 * @returns {object|null} UI-ready club object, or null if the input is invalid.
 */
function mapBackendClubToUi(backendClub) {
  if (!backendClub?._id) return null;

  return {
    id:            String(backendClub._id),
    name:          backendClub.name,
    fullName:      backendClub.name,
    tagline:       backendClub.description || '',
    category:      'General',
    categoryColor: '#7C3AED',
    categoryBg:    '#EDE9FE',
    icon:          'people',
    grad:          ['#1E3A5F', '#3D6A9E'],
    imageUri:      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    members:       0,
    founded:       backendClub.createdAt ? new Date(backendClub.createdAt).getFullYear().toString() : '',
    meetings:      'Contact coordinator',
    venue:         'Campus',
    president:     backendClub.coordinatorName  || '—',
    contact:       backendClub.coordinatorEmail || '',
    joined:        false,
    about:         backendClub.description || '',
    achievements:  [],
    activities:    [],
    upcoming:      '',
    _isFromBackend: true,
  };
}

// ─── HOOKS ────────────────────────────────────────────────────────────────────

/**
 * Drives a fade-in + slide-up entrance animation.
 *
 * @param {number} delay - Animation start delay in milliseconds.
 * @param {number} [slideDistance=20] - Vertical slide distance in pixels.
 * @returns {{ opacity: Animated.Value, transform: object[] }}
 */
function useEntranceAnimation(delay, slideDistance = 20) {
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(slideDistance)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 500, delay, easing: EASE_OUT_EXPO, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 500, delay, easing: EASE_OUT_EXPO, useNativeDriver: true }),
    ]).start();
  }, []);

  return { opacity, transform: [{ translateY }] };
}

// ─── PRESENTATIONAL COMPONENTS ────────────────────────────────────────────────

/**
 * Small icon + value + label chip used inside the stats row of the detail modal.
 */
const StatChip = ({ icon, value, label }) => (
  <View style={styles.statChip}>
    <Ionicons name={icon} size={14} color={COLORS.primary} />
    <View>
      <Text style={styles.statChipValue}>{value}</Text>
      <Text style={styles.statChipLabel}>{label}</Text>
    </View>
  </View>
);

/**
 * Horizontal banner summarising aggregate club statistics.
 *
 * @param {number} joinedCount - Number of clubs the user has joined.
 */
const StatsBanner = ({ joinedCount }) => {
  const animStyle = useEntranceAnimation(0, 10);

  return (
    <Animated.View style={[animStyle, styles.statsBanner]}>
      <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.statsBannerGradient}>
        {[
          { value: '8',    label: 'Clubs' },
          { value: '905+', label: 'Members' },
          { value: String(joinedCount), label: 'Joined' },
          { value: '50+',  label: 'Events/yr' },
        ].map(({ value, label }, index, arr) => (
          <React.Fragment key={label}>
            <View style={styles.statsBannerItem}>
              <Text style={styles.statsBannerValue}>{value}</Text>
              <Text style={styles.statsBannerLabel}>{label}</Text>
            </View>
            {index < arr.length - 1 && <View style={styles.statsBannerDivider} />}
          </React.Fragment>
        ))}
      </LinearGradient>
    </Animated.View>
  );
};

// ─── CLUB CARD ────────────────────────────────────────────────────────────────

/**
 * Card displayed in the main list for a single club.
 *
 * @param {object}   club          - Club data object.
 * @param {number}   index         - Position in the list (used to stagger entrance).
 * @param {Function} onPress       - Called with the club when the card is tapped.
 * @param {Function} onToggleJoin  - Called with club.id to join or leave.
 */
const ClubCard = ({ club, index, onPress, onToggleJoin }) => {
  const entranceStyle = useEntranceAnimation(Math.min(index, 5) * 70);
  const pressScale    = useRef(new Animated.Value(1)).current;

  const handlePressIn  = () =>
    Animated.spring(pressScale, { toValue: 0.97, speed: 22, bounciness: 4, useNativeDriver: true }).start();

  const handlePressOut = () =>
    Animated.spring(pressScale, { toValue: 1, speed: 16, bounciness: 6, useNativeDriver: true }).start();

  const handleJoinPress = (event) => {
    event.stopPropagation?.();
    onToggleJoin(club.id);
  };

  return (
    <Animated.View style={[entranceStyle, { transform: [...entranceStyle.transform, { scale: pressScale }] }]}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onPress(club)}
        activeOpacity={1}
        style={styles.card}
      >
        {/* ── Hero image ── */}
        <View style={styles.cardImageWrapper}>
          <Image source={{ uri: club.imageUri }} style={styles.cardImage} resizeMode="cover" />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.65)']} style={StyleSheet.absoluteFill} />

          <View style={[styles.categoryPill, { backgroundColor: club.categoryBg }]}>
            <Text style={[styles.categoryPillText, { color: club.categoryColor }]}>{club.category}</Text>
          </View>

          <View style={styles.membersBadge}>
            <Ionicons name="people" size={11} color="#fff" />
            <Text style={styles.membersBadgeText}>{club.members}+ members</Text>
          </View>
        </View>

        {/* ── Content ── */}
        <View style={styles.cardBody}>
          {/* Title row */}
          <View style={styles.cardTitleRow}>
            <LinearGradient colors={club.grad} style={styles.cardIconBadge}>
              <Ionicons name={club.icon} size={16} color="#fff" />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardName}>{club.name}</Text>
              <Text style={styles.cardFullName} numberOfLines={1}>{club.fullName}</Text>
            </View>
          </View>

          <Text style={styles.cardTagline} numberOfLines={2}>{club.tagline}</Text>

          {/* Activity chips */}
          <View style={styles.activityChipRow}>
            {club.activities.slice(0, 3).map((activity) => (
              <View key={activity} style={styles.activityChip}>
                <Text style={styles.activityChipText}>{activity}</Text>
              </View>
            ))}
            {club.activities.length > 3 && (
              <View style={styles.activityChip}>
                <Text style={styles.activityChipText}>+{club.activities.length - 3}</Text>
              </View>
            )}
          </View>

          {/* Footer */}
          <View style={styles.cardFooter}>
            <View style={styles.meetingRow}>
              <Ionicons name="time-outline" size={12} color={COLORS.textLight} />
              <Text style={styles.meetingText} numberOfLines={1}>{club.meetings}</Text>
            </View>

            <TouchableOpacity
              onPress={handleJoinPress}
              activeOpacity={0.82}
              style={[styles.joinChip, club.joined && styles.joinChipActive]}
            >
              {club.joined ? (
                <>
                  <Ionicons name="checkmark" size={13} color={COLORS.green} />
                  <Text style={[styles.joinChipText, { color: COLORS.green }]}>Joined</Text>
                </>
              ) : (
                <>
                  <Ionicons name="add" size={13} color={COLORS.primary} />
                  <Text style={styles.joinChipText}>Join</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── CLUB DETAIL MODAL ────────────────────────────────────────────────────────

/**
 * Bottom-sheet modal showing full details for a selected club.
 *
 * @param {object}   club          - Club to display.
 * @param {Function} onClose       - Called when the sheet is dismissed.
 * @param {Function} onToggleJoin  - Called with club.id to join or leave.
 */
const ClubDetailModal = ({ club, onClose, onToggleJoin }) => {
  const slideY = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    Animated.spring(slideY, { toValue: 0, speed: 16, bounciness: 3, useNativeDriver: true }).start();
  }, []);

  const handleClose = () => {
    Animated.timing(slideY, { toValue: height, duration: 280, easing: EASE_OUT_EXPO, useNativeDriver: true })
      .start(onClose);
  };

  return (
    <Modal transparent animationType="none" onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={modalStyles.overlay} />
      </TouchableWithoutFeedback>

      <Animated.View style={[modalStyles.sheet, { transform: [{ translateY: slideY }] }]}>
        {/* Drag handle */}
        <View style={modalStyles.dragHandle} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* ── Hero image ── */}
          <View style={modalStyles.heroWrapper}>
            <Image source={{ uri: club.imageUri }} style={modalStyles.heroImage} resizeMode="cover" />
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.72)']} style={StyleSheet.absoluteFill} />

            <TouchableOpacity style={modalStyles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>

            <View style={modalStyles.heroBadge}>
              <LinearGradient colors={club.grad} style={modalStyles.heroBadgeGradient}>
                <Ionicons name={club.icon} size={22} color="#fff" />
              </LinearGradient>
            </View>

            <View style={modalStyles.heroTextContainer}>
              <View style={[modalStyles.heroCategoryPill, { backgroundColor: club.categoryBg }]}>
                <Text style={[modalStyles.heroCategoryText, { color: club.categoryColor }]}>{club.category}</Text>
              </View>
              <Text style={modalStyles.heroClubName}>{club.name}</Text>
              <Text style={modalStyles.heroFullName}>{club.fullName}</Text>
            </View>
          </View>

          {/* ── Body ── */}
          <View style={modalStyles.body}>
            {/* Stats row */}
            <View style={modalStyles.statsRow}>
              <StatChip icon="people-outline"   value={`${club.members}+`}           label="Members" />
              <View style={modalStyles.statsDivider} />
              <StatChip icon="calendar-outline" value={club.founded}                  label="Founded" />
              <View style={modalStyles.statsDivider} />
              <StatChip icon="location-outline" value={club.venue.split(',')[0]}      label="Venue" />
            </View>

            {/* About */}
            <Text style={modalStyles.sectionTitle}>About</Text>
            <Text style={modalStyles.aboutText}>{club.about}</Text>

            {/* Info card */}
            <View style={modalStyles.infoCard}>
              {[
                { icon: 'time-outline',     label: 'Meeting Schedule', value: club.meetings },
                { icon: 'location-outline', label: 'Venue',            value: club.venue },
                { icon: 'person-outline',   label: 'President',        value: club.president },
                { icon: 'mail-outline',     label: 'Contact',          value: club.contact },
              ].map(({ icon, label, value }, index, arr) => (
                <React.Fragment key={label}>
                  <View style={modalStyles.infoRow}>
                    <View style={modalStyles.infoIconWrapper}>
                      <Ionicons name={icon} size={16} color={COLORS.primary} />
                    </View>
                    <View>
                      <Text style={modalStyles.infoLabel}>{label}</Text>
                      <Text style={modalStyles.infoValue}>{value}</Text>
                    </View>
                  </View>
                  {index < arr.length - 1 && <View style={modalStyles.infoDivider} />}
                </React.Fragment>
              ))}
            </View>

            {/* Activities */}
            <Text style={modalStyles.sectionTitle}>Activities</Text>
            <View style={modalStyles.tagsWrapper}>
              {club.activities.map((activity) => (
                <View key={activity} style={modalStyles.activityTag}>
                  <Text style={modalStyles.activityTagText}>{activity}</Text>
                </View>
              ))}
            </View>

            {/* Achievements */}
            <Text style={modalStyles.sectionTitle}>Achievements</Text>
            {club.achievements.map((achievement) => (
              <View key={achievement} style={modalStyles.achievementRow}>
                <LinearGradient colors={club.grad} style={modalStyles.achievementDot}>
                  <Ionicons name="star" size={9} color="#fff" />
                </LinearGradient>
                <Text style={modalStyles.achievementText}>{achievement}</Text>
              </View>
            ))}

            {/* Upcoming event */}
            <View style={modalStyles.upcomingCard}>
              <LinearGradient colors={[COLORS.accentLight, '#FFFDF0']} style={modalStyles.upcomingGradient}>
                <View style={modalStyles.upcomingRow}>
                  <View style={modalStyles.upcomingIconWrapper}>
                    <Ionicons name="megaphone" size={16} color={COLORS.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={modalStyles.upcomingLabel}>Upcoming Event</Text>
                    <Text style={modalStyles.upcomingText}>{club.upcoming}</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* Join / Leave button */}
            <TouchableOpacity
              onPress={() => onToggleJoin(club.id)}
              activeOpacity={0.85}
              style={{ marginTop: 20 }}
            >
              {club.joined ? (
                <View style={modalStyles.joinedButton}>
                  <Ionicons name="checkmark-circle" size={18} color={COLORS.green} />
                  <Text style={modalStyles.joinedButtonText}>Joined</Text>
                </View>
              ) : (
                <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={modalStyles.joinButton}>
                  <Ionicons name="add-circle-outline" size={18} color="#fff" />
                  <Text style={modalStyles.joinButtonText}>Join Club</Text>
                </LinearGradient>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
};

// ─── SCREEN ───────────────────────────────────────────────────────────────────

/**
 * ClubsScreen
 *
 * Root screen component. Handles data fetching, search, filtering,
 * and coordination between the card list and the detail modal.
 *
 * @param {object} navigation - React Navigation prop (optional; used for goBack).
 */
export default function ClubsScreen({ navigation }) {
  const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 44 : (StatusBar.currentHeight || 24);

  const [clubs,        setClubs]        = useState(SEED_CLUBS);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedClub, setSelectedClub] = useState(null);

  const headerStyle = useEntranceAnimation(0, -8);

  // ── Data fetching ──────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    async function fetchClubs() {
      try {
        const response = await clubsApi.list();
        if (cancelled) return;

        const backendClubs = (Array.isArray(response) ? response : [])
          .map(mapBackendClubToUi)
          .filter(Boolean);

        if (backendClubs.length > 0) {
          setClubs((prev) => [
            ...backendClubs,
            ...prev.filter((club) => !club._isFromBackend),
          ]);
        }
      } catch (error) {
        console.warn('[ClubsScreen] Backend fetch failed — using seed data.', error?.message ?? error);
      }
    }

    fetchClubs();
    return () => { cancelled = true; };
  }, []);

  // ── Derived state ──────────────────────────────────────────────────────────

  const filteredClubs = clubs.filter((club) => {
    const matchesCategory = activeFilter === 'All' || club.category === activeFilter;
    const query           = searchQuery.trim().toLowerCase();
    const matchesSearch   = !query
      || club.name.toLowerCase().includes(query)
      || club.fullName.toLowerCase().includes(query)
      || club.category.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  const joinedCount = clubs.filter((club) => club.joined).length;

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleToggleJoin = useCallback((clubId) => {
    setClubs((prev) =>
      prev.map((club) => club.id === clubId ? { ...club, joined: !club.joined } : club)
    );
    // Keep the open modal in sync without re-fetching.
    setSelectedClub((prev) =>
      prev?.id === clubId ? { ...prev, joined: !prev.joined } : prev
    );
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} translucent={false} />

      {/* Header */}
      <Animated.View style={[headerStyle, styles.header, { paddingTop: STATUS_BAR_HEIGHT + 4 }]}>
        <TouchableOpacity style={styles.headerBackButton} onPress={() => navigation?.goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color={COLORS.textDark} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <LinearGradient colors={[COLORS.primary, COLORS.accent]} style={styles.headerLogo}>
            <Ionicons name="people" size={15} color="#fff" />
          </LinearGradient>
          <Text style={styles.headerTitle}>Clubs</Text>
        </View>

        {/* Spacer keeps the title visually centred. */}
        <View style={{ width: 36 }} />
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        stickyHeaderIndices={[1]}
      >
        {/* Stats banner */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 }}>
          <StatsBanner joinedCount={joinedCount} />
        </View>

        {/* Sticky search + filter block */}
        <View style={styles.stickyBlock}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={17} color={COLORS.textLight} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search clubs..."
              placeholderTextColor={COLORS.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={17} color={COLORS.textLight} />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[styles.filterChip, activeFilter === category && styles.filterChipActive]}
                onPress={() => setActiveFilter(category)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterChipText, activeFilter === category && styles.filterChipTextActive]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Club cards */}
        <View style={styles.cardList}>
          {filteredClubs.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={40} color={COLORS.textLight} />
              <Text style={styles.emptyStateTitle}>No clubs found</Text>
              <Text style={styles.emptyStateSubtitle}>Try a different search or category</Text>
            </View>
          ) : (
            filteredClubs.map((club, index) => (
              <ClubCard
                key={club.id}
                club={club}
                index={index}
                onPress={setSelectedClub}
                onToggleJoin={handleToggleJoin}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Club detail modal */}
      {selectedClub && (
        <ClubDetailModal
          club={selectedClub}
          onClose={() => setSelectedClub(null)}
          onToggleJoin={handleToggleJoin}
        />
      )}
    </View>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerBackButton: { width: 36, height: 36, justifyContent: 'center' },
  headerCenter:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerLogo:       { width: 30, height: 30, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  headerTitle:      { fontSize: 17, fontWeight: '800', color: COLORS.textDark, letterSpacing: 0.2 },

  // Stats banner
  statsBanner: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: `${COLORS.primary}40`,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
  },
  statsBannerGradient: { flexDirection: 'row', paddingVertical: 16, paddingHorizontal: 8 },
  statsBannerItem:     { flex: 1, alignItems: 'center' },
  statsBannerValue:    { fontSize: 18, fontWeight: '900', color: '#fff' },
  statsBannerLabel:    { fontSize: 10, color: 'rgba(255,255,255,0.72)', fontWeight: '600', marginTop: 2 },
  statsBannerDivider:  { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 4 },

  // Sticky search + filter
  stickyBlock: { backgroundColor: COLORS.bg, paddingTop: 12, paddingBottom: 4 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#00000008',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  searchInput:  { flex: 1, fontSize: 14, color: COLORS.textDark, padding: 0 },
  filterRow:    { paddingHorizontal: 16, gap: 8, paddingVertical: 12, paddingBottom: 6 },
  filterChip:   { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterChipText:   { fontSize: 12, fontWeight: '600', color: COLORS.textMid },
  filterChipTextActive: { color: '#fff' },

  // Club card
  cardList: { paddingHorizontal: 16, paddingTop: 4, gap: 16 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: `${COLORS.primary}18`,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 14,
    elevation: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardImageWrapper: { height: 180, position: 'relative' },
  cardImage:        { width: '100%', height: '100%' },
  categoryPill: {
    position: 'absolute',
    top: 12,
    left: 12,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  categoryPillText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },
  membersBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  membersBadgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  cardBody:         { padding: 16 },
  cardTitleRow:     { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  cardIconBadge:    { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardName:         { fontSize: 16, fontWeight: '800', color: COLORS.textDark },
  cardFullName:     { fontSize: 11, color: COLORS.textLight, fontWeight: '500', marginTop: 1 },
  cardTagline:      { fontSize: 13, color: COLORS.textMid, lineHeight: 19, marginBottom: 12 },
  activityChipRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  activityChip:     { backgroundColor: COLORS.primaryPale, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: COLORS.border },
  activityChipText: { fontSize: 11, fontWeight: '600', color: COLORS.primary },
  cardFooter:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  meetingRow:       { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  meetingText:      { fontSize: 11, color: COLORS.textLight, fontWeight: '500', flex: 1 },
  joinChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.primaryPale,
    borderWidth: 1.5,
    borderColor: `${COLORS.primary}50`,
  },
  joinChipActive: { backgroundColor: COLORS.greenPale, borderColor: `${COLORS.green}80` },
  joinChipText:   { fontSize: 12, fontWeight: '700', color: COLORS.primary },

  // Stat chip (modal)
  statChip:      { flex: 1, alignItems: 'center', gap: 4 },
  statChipValue: { fontSize: 14, fontWeight: '800', color: COLORS.textDark, textAlign: 'center' },
  statChipLabel: { fontSize: 10, color: COLORS.textLight, textAlign: 'center', fontWeight: '600' },

  // Empty state
  emptyState:        { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyStateTitle:   { fontSize: 16, fontWeight: '700', color: COLORS.textLight },
  emptyStateSubtitle:{ fontSize: 13, color: COLORS.textLight },
});

const modalStyles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: height * 0.92,
  },
  dragHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.border, alignSelf: 'center', marginTop: 12 },

  // Hero
  heroWrapper:   { height: 240, position: 'relative' },
  heroImage:     { width: '100%', height: '100%' },
  closeButton:   { position: 'absolute', top: 16, right: 16, width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  heroBadge:     { position: 'absolute', bottom: 60, left: 20 },
  heroBadgeGradient: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  heroTextContainer: { position: 'absolute', bottom: 18, left: 84, right: 16 },
  heroCategoryPill:  { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 4 },
  heroCategoryText:  { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  heroClubName:      { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: 0.2 },
  heroFullName:      { fontSize: 11, color: 'rgba(255,255,255,0.78)', fontWeight: '500', marginTop: 1 },

  // Body
  body:         { padding: 20 },
  statsRow:     { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surfaceAlt, borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border },
  statsDivider: { width: 1, height: 36, backgroundColor: COLORS.border },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textDark, letterSpacing: 0.2, marginBottom: 10, marginTop: 4, textTransform: 'uppercase' },
  aboutText:    { fontSize: 14, color: COLORS.textMid, lineHeight: 22, marginBottom: 18 },

  // Info card
  infoCard:       { backgroundColor: COLORS.surfaceAlt, borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border },
  infoRow:        { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 8 },
  infoIconWrapper:{ width: 32, height: 32, borderRadius: 10, backgroundColor: COLORS.primaryPale, justifyContent: 'center', alignItems: 'center' },
  infoLabel:      { fontSize: 11, color: COLORS.textLight, fontWeight: '600', marginBottom: 2 },
  infoValue:      { fontSize: 13, color: COLORS.textDark, fontWeight: '600' },
  infoDivider:    { height: 1, backgroundColor: COLORS.border, marginLeft: 44 },

  // Tags
  tagsWrapper:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  activityTag:     { backgroundColor: COLORS.primaryPale, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.border },
  activityTagText: { fontSize: 12, fontWeight: '600', color: COLORS.primary },

  // Achievements
  achievementRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  achievementDot:  { width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', flexShrink: 0, marginTop: 1 },
  achievementText: { flex: 1, fontSize: 13, color: COLORS.textMid, lineHeight: 19 },

  // Upcoming
  upcomingCard:      { borderRadius: 14, overflow: 'hidden', marginTop: 16, borderWidth: 1, borderColor: '#FFE082' },
  upcomingGradient:  { padding: 14 },
  upcomingRow:       { flexDirection: 'row', alignItems: 'center', gap: 12 },
  upcomingIconWrapper:{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#FFF8E1', justifyContent: 'center', alignItems: 'center' },
  upcomingLabel:     { fontSize: 10, fontWeight: '700', color: COLORS.accent, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 2 },
  upcomingText:      { fontSize: 13, fontWeight: '600', color: COLORS.textDark },

  // Buttons
  joinButton:      { borderRadius: 16, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  joinButtonText:  { color: '#fff', fontWeight: '800', fontSize: 15 },
  joinedButton:    { borderRadius: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.greenPale, borderWidth: 1.5, borderColor: COLORS.green },
  joinedButtonText:{ color: COLORS.green, fontWeight: '800', fontSize: 15 },
});
