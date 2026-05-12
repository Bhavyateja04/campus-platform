// ─── Imports ──────────────────────────────────────────────────────────────────
import React, { useState, useRef, useEffect } from 'react';
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
  Switch,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getUser, clearSession, setSession, usersApi, logout as apiLogout } from '../services/api';

// ─── Constants ─────────────────────────────────────────────────────────────────
const { width } = Dimensions.get('window');

const COLORS = {
  primary:      '#4A6FA5',
  primaryDark:  '#2E4D7A',
  primaryLight: '#A8C0DD',
  primaryPale:  '#EBF1F8',
  orange:       '#E07B3A',
  teal:         '#00796B',
  gold:         '#FFB300',
  background:   '#F5F8FC',
  surface:      '#FFFFFF',
  textDark:     '#0D1B2A',
  textMid:      '#3D5068',
  textLight:    '#8FA8C0',
  border:       '#D6E4F0',
  danger:       '#D32F2F',
};

const EASE = Easing.bezier(0.22, 1, 0.36, 1);

const ANIMATION = {
  durationMs: 560,
  dy:         24,
};

const STATS = [
  { val: '47', label: 'Posts',  icon: 'document-text' },
  { val: '12', label: 'Events', icon: 'calendar'      },
  { val: '8',  label: 'Clubs',  icon: 'people'        },
];

const THEMES = [
  { id: 'blue',   colors: ['#4A6FA5', '#2E4D7A'], label: 'Ocean Blue' },
  { id: 'teal',   colors: ['#00897B', '#00796B'], label: 'Emerald'    },
  { id: 'purple', colors: ['#7B1FA2', '#6A1B9A'], label: 'Violet'     },
  { id: 'orange', colors: ['#E07B3A', '#BF5A1A'], label: 'Amber'      },
  { id: 'dark',   colors: ['#1A1A2E', '#16213E'], label: 'Midnight'   },
];

// Maps the UI label to the backend field accepted by PUT /api/users/me.
// Email and Roll No are intentionally excluded — they form the user's identity.
const FIELD_TO_BACKEND_KEY = {
  Name:   'name',
  Phone:  'phone',
  Branch: 'department',
};

const PERSONAL_INFO_FIELDS = [
  { icon: 'person-outline',  label: 'Name',    key: 'name'   },
  { icon: 'mail-outline',    label: 'Email',   key: 'email'  },
  { icon: 'call-outline',    label: 'Phone',   key: 'phone'  },
  { icon: 'card-outline',    label: 'Roll No', key: 'roll'   },
  { icon: 'school-outline',  label: 'Branch',  key: 'branch' },
];

const DEFAULT_USER = { name: '—', roll: '—', branch: '—', email: '—', phone: '—' };

// ─── Helpers ───────────────────────────────────────────────────────────────────
const applyServerUserToLocal = (serverUser) => {
  if (!serverUser) return null;
  return {
    name:   serverUser.name       || '—',
    roll:   serverUser.rollNumber || '—',
    branch: serverUser.department || serverUser.course || '—',
    email:  serverUser.email      || '—',
    phone:  serverUser.phone      || '—',
  };
};

// ─── Custom Hooks ──────────────────────────────────────────────────────────────
const useEntrance = (delay = 0, dy = ANIMATION.dy) => {
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(dy)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: ANIMATION.durationMs, delay, easing: EASE, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: ANIMATION.durationMs, delay, easing: EASE, useNativeDriver: true }),
    ]).start();
  }, []);

  return { opacity, transform: [{ translateY }] };
};

// ─── Sub-components ────────────────────────────────────────────────────────────
const SectionCard = ({ children, style }) => (
  <View style={[S.card, style]}>{children}</View>
);

const SettingRow = ({ icon, label, iconColor = COLORS.primary, onPress, right, danger }) => (
  <TouchableOpacity style={S.settingRow} onPress={onPress} activeOpacity={0.7}>
    <View style={[S.settingIcon, { backgroundColor: (danger ? COLORS.danger : iconColor) + '1A' }]}>
      <Ionicons name={icon} size={18} color={danger ? COLORS.danger : iconColor} />
    </View>
    <Text style={[S.settingLabel, danger && { color: COLORS.danger }]}>{label}</Text>
    {right || <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} />}
  </TouchableOpacity>
);

const EditModal = ({ visible, onClose, field, value, onSave, saving, editable = true }) => {
  const [text, setText] = useState(value);
  useEffect(() => { setText(value); }, [value, visible]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={M.overlay}>
        <View style={M.sheet}>
          <Text style={M.title}>Edit {field}</Text>
          {editable ? (
            <TextInput
              style={M.input}
              value={text}
              onChangeText={setText}
              placeholder={`Enter ${field}`}
              placeholderTextColor={COLORS.textLight}
              autoFocus
              editable={!saving}
            />
          ) : (
            <Text style={M.helpText}>
              {field} is tied to your account and can't be changed here.
              Please contact admin if it needs to be updated.
            </Text>
          )}
          <View style={M.row}>
            <TouchableOpacity style={M.cancelBtn} onPress={onClose} disabled={saving}>
              <Text style={M.cancelT}>{editable ? 'Cancel' : 'Close'}</Text>
            </TouchableOpacity>
            {editable && (
              <TouchableOpacity
                style={[M.saveBtn, saving && { opacity: 0.7 }]}
                onPress={() => onSave(text)}
                disabled={saving}
              >
                <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={M.saveBtnInner}>
                  <Text style={M.saveT}>{saving ? 'Saving…' : 'Save'}</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function ProfileScreen({ navigation }) {
  const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 44 : (StatusBar.currentHeight || 24);

  const [user,          setUser]          = useState(DEFAULT_USER);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingEdit,    setSavingEdit]    = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('blue');
  const [notifications, setNotifications] = useState(true);
  const [locationAccess, setLocationAccess] = useState(false);
  const [profileVisible, setProfileVisible] = useState(true);
  const [editModal,     setEditModal]     = useState({ visible: false, field: '', value: '' });

  // Entrance animations
  const heroAnim  = useEntrance(80,  -12);
  const statsAnim = useEntrance(200,  16);
  const s1Anim    = useEntrance(280,  16);
  const s2Anim    = useEntrance(340,  16);
  const s3Anim    = useEntrance(400,  16);
  const s4Anim    = useEntrance(460,  16);

  const currentTheme = THEMES.find((t) => t.id === selectedTheme) ?? THEMES[0];

  // ─── Data fetching ──────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      // Hydrate from cache first so the UI never shows placeholder dashes
      try {
        const cached = await getUser();
        if (!cancelled && cached) {
          setUser((prev) => ({ ...prev, ...applyServerUserToLocal(cached) }));
        }
      } catch {
        /* AsyncStorage may be empty on a fresh install — that's fine. */
      }

      // Always refresh from the server to reflect the source of truth
      try {
        const res   = await usersApi.me();
        const fresh = res?.user;
        if (cancelled || !fresh) return;

        setUser(applyServerUserToLocal(fresh));
        await setSession({ user: fresh });
      } catch (err) {
        if (!cancelled && err?.status === 401) {
          await clearSession();
          navigation?.reset?.({ index: 0, routes: [{ name: 'Login' }] });
        }
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    };

    loadProfile();
    return () => { cancelled = true; };
  }, [navigation]);

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await apiLogout();
    if (navigation?.reset) {
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } else {
      navigation?.navigate?.('Login');
    }
  };

  // RN Web's Alert.alert polyfill silently drops multi-button dialogs — use
  // window.confirm on web and the native Alert on iOS/Android.
  const confirmLogout = () => {
    if (Platform.OS === 'web') {
      const ok = typeof window !== 'undefined'
        ? window.confirm('Are you sure you want to log out?')
        : true;
      if (ok) handleLogout();
      return;
    }
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel',   style: 'cancel'      },
      { text: 'Log Out',  style: 'destructive', onPress: handleLogout },
    ]);
  };

  const openEdit  = (field, value) => setEditModal({ visible: true, field, value });
  const closeEdit = ()              => setEditModal((e) => ({ ...e, visible: false }));

  const saveEdit = async (field, value) => {
    const backendKey = FIELD_TO_BACKEND_KEY[field];

    // Identity fields (Email, Roll No) are read-only — just close the modal.
    if (!backendKey) { closeEdit(); return; }

    const trimmed = (value || '').trim();
    if (!trimmed) {
      Alert.alert('Validation', `${field} cannot be empty.`);
      return;
    }

    setSavingEdit(true);
    try {
      const res   = await usersApi.updateMe({ [backendKey]: trimmed });
      const fresh = res?.user;
      if (fresh) {
        setUser(applyServerUserToLocal(fresh));
        await setSession({ user: fresh });
      } else {
        // Server didn't echo a user — apply locally; re-verified on next mount
        setUser((u) => ({ ...u, [field.toLowerCase()]: trimmed }));
      }
      closeEdit();
    } catch (err) {
      Alert.alert('Could not update profile', err?.message || 'Please try again.');
    } finally {
      setSavingEdit(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={S.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Header + Avatar */}
      <Animated.View style={[heroAnim, { zIndex: 10 }]}>
        <LinearGradient
          colors={currentTheme.colors}
          style={[S.header, { paddingTop: STATUS_BAR_HEIGHT + 12 }]}
        >
          <TouchableOpacity style={S.headerIconBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={S.headerTitle}>My Profile</Text>
          <TouchableOpacity style={S.headerIconBtn} onPress={() => openEdit('Name', user.name)}>
            <Ionicons name="pencil" size={16} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>

        <LinearGradient colors={currentTheme.colors} style={S.avatarZone}>
          <View style={S.avatarShadow}>
            <LinearGradient colors={['#fff', COLORS.primaryPale]} style={S.avatar}>
              <Text style={[S.avatarInitials, { color: currentTheme.colors[0] }]}>
                {(user.name && user.name !== '—' ? user.name : '?').slice(0, 2).toUpperCase()}
              </Text>
            </LinearGradient>
          </View>
          <Text style={S.heroName}>{user.name}</Text>
          <Text style={S.heroSub}>{user.roll}  ·  {user.branch}</Text>
          <View style={S.heroBadge}>
            <Ionicons name="school-outline" size={11} color="rgba(255,255,255,0.85)" />
            <Text style={S.heroBadgeT}>Aditya University</Text>
          </View>
        </LinearGradient>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Stats */}
        <Animated.View style={[statsAnim, S.statsRow]}>
          {STATS.map((stat, i) => (
            <View key={i} style={[S.statBox, i < 2 && S.statBorderR]}>
              <Ionicons name={stat.icon} size={18} color={COLORS.primary} />
              <Text style={S.statVal}>{stat.val}</Text>
              <Text style={S.statLbl}>{stat.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Personal Info */}
        <Animated.View style={[s1Anim, S.sec]}>
          <Text style={S.secTitle}>Personal Info</Text>
          <SectionCard>
            {PERSONAL_INFO_FIELDS.map((item, i, arr) => (
              <TouchableOpacity
                key={i}
                style={[S.infoRow, i < arr.length - 1 && S.infoRowBorder]}
                onPress={() => openEdit(item.label, user[item.key])}
                activeOpacity={0.7}
              >
                <View style={S.infoIconWrap}>
                  <Ionicons name={item.icon} size={17} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={S.infoLabel}>{item.label}</Text>
                  <Text style={S.infoVal}>{user[item.key]}</Text>
                </View>
                <Ionicons name="pencil-outline" size={14} color={COLORS.textLight} />
              </TouchableOpacity>
            ))}
          </SectionCard>
        </Animated.View>

        {/* Theme Picker */}
        <Animated.View style={[s2Anim, S.sec]}>
          <Text style={S.secTitle}>App Theme</Text>
          <SectionCard>
            <View style={S.themeRow}>
              {THEMES.map((theme) => (
                <TouchableOpacity
                  key={theme.id}
                  onPress={() => setSelectedTheme(theme.id)}
                  style={S.themeDot}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={theme.colors}
                    style={[S.themeCircle, selectedTheme === theme.id && S.themeCircleActive]}
                  >
                    {selectedTheme === theme.id && (
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    )}
                  </LinearGradient>
                  <Text style={[S.themeLabel, selectedTheme === theme.id && S.themeLabelActive]}>
                    {theme.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </SectionCard>
        </Animated.View>

        {/* Privacy & Notifications */}
        <Animated.View style={[s3Anim, S.sec]}>
          <Text style={S.secTitle}>Privacy & Notifications</Text>
          <SectionCard>
            {[
              { icon: 'notifications-outline', label: 'Push Notifications',       value: notifications,  onChange: setNotifications,  color: COLORS.primary },
              { icon: 'location-outline',       label: 'Location Access',          value: locationAccess, onChange: setLocationAccess,  color: COLORS.teal    },
              { icon: 'eye-outline',            label: 'Profile Visible to Others', value: profileVisible, onChange: setProfileVisible,  color: COLORS.orange  },
            ].map((row, i) => (
              <View key={i} style={[S.switchRow, i > 0 && S.switchRowBorder]}>
                <View style={S.switchLeft}>
                  <View style={[S.settingIcon, { backgroundColor: row.color + '1A' }]}>
                    <Ionicons name={row.icon} size={18} color={row.color} />
                  </View>
                  <Text style={S.settingLabel}>{row.label}</Text>
                </View>
                <Switch
                  value={row.value}
                  onValueChange={row.onChange}
                  trackColor={{ false: COLORS.border, true: row.color + '60' }}
                  thumbColor={row.value ? row.color : '#ccc'}
                />
              </View>
            ))}
          </SectionCard>
        </Animated.View>

        {/* Settings */}
        <Animated.View style={[s4Anim, S.sec]}>
          <Text style={S.secTitle}>Settings</Text>
          <SectionCard>
            <SettingRow
              icon="lock-closed-outline"
              label="Change Password"
              onPress={() => navigation?.navigate?.('ResetPassword')}
            />
            <View style={S.settingDivider} />
            <SettingRow icon="shield-checkmark-outline" label="Privacy Policy"   iconColor={COLORS.teal}   onPress={() => {}} />
            <View style={S.settingDivider} />
            <SettingRow icon="document-text-outline"    label="Terms of Service" iconColor={COLORS.teal}   onPress={() => {}} />
            <View style={S.settingDivider} />
            <SettingRow icon="help-circle-outline"      label="Help & Support"   iconColor={COLORS.orange} onPress={() => {}} />
            <View style={S.settingDivider} />
            <SettingRow icon="log-out-outline"          label="Log Out"          danger onPress={confirmLogout} />
          </SectionCard>
        </Animated.View>

        <Text style={S.version}>Campix v1.0.0  ·  Aditya University</Text>
      </ScrollView>

      <EditModal
        visible={editModal.visible}
        field={editModal.field}
        value={editModal.value}
        editable={!!FIELD_TO_BACKEND_KEY[editModal.field]}
        saving={savingEdit}
        onClose={closeEdit}
        onSave={(val) => saveEdit(editModal.field, val)}
      />
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },

  // Header
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 0 },
  headerTitle:  { color: '#fff', fontWeight: '800', fontSize: 18, letterSpacing: 0.2 },
  headerIconBtn:{ width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center' },

  // Avatar zone
  avatarZone:    { alignItems: 'center', paddingBottom: 32, paddingTop: 10 },
  avatarShadow:  { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 12, borderRadius: 50, marginBottom: 14 },
  avatar:        { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#fff' },
  avatarInitials:{ fontSize: 32, fontWeight: '900' },
  heroName:      { color: '#fff', fontWeight: '900', fontSize: 24, letterSpacing: 0.2 },
  heroSub:       { color: 'rgba(255,255,255,0.80)', fontSize: 12, marginTop: 4 },
  heroBadge:     { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10, backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 },
  heroBadgeT:    { color: 'rgba(255,255,255,0.90)', fontSize: 11, fontWeight: '600' },

  // Stats
  statsRow:    { flexDirection: 'row', backgroundColor: COLORS.surface, marginHorizontal: 16, borderRadius: 20, marginTop: -16, shadowColor: COLORS.primary + '22', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 4 },
  statBox:     { flex: 1, alignItems: 'center', paddingVertical: 18, gap: 4 },
  statBorderR: { borderRightWidth: 1, borderRightColor: COLORS.border },
  statVal:     { color: COLORS.textDark, fontWeight: '900', fontSize: 20 },
  statLbl:     { color: COLORS.textLight, fontSize: 11, fontWeight: '600' },

  // Section
  sec:      { marginTop: 22, paddingHorizontal: 16 },
  secTitle: { fontSize: 13, fontWeight: '800', color: COLORS.textMid, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 },
  card:     { backgroundColor: COLORS.surface, borderRadius: 20, overflow: 'hidden', shadowColor: '#00000010', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: COLORS.border },

  // Info rows
  infoRow:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  infoIconWrap:  { width: 34, height: 34, borderRadius: 10, backgroundColor: COLORS.primaryPale, justifyContent: 'center', alignItems: 'center' },
  infoLabel:     { color: COLORS.textLight, fontSize: 11, fontWeight: '600' },
  infoVal:       { color: COLORS.textDark, fontSize: 14, fontWeight: '700', marginTop: 2 },

  // Theme picker
  themeRow:          { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 18, gap: 6, justifyContent: 'space-between' },
  themeDot:          { alignItems: 'center', gap: 6, flex: 1 },
  themeCircle:       { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  themeCircleActive: { borderWidth: 3, borderColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  themeLabel:        { color: COLORS.textLight, fontSize: 9, fontWeight: '600', textAlign: 'center' },
  themeLabelActive:  { color: COLORS.primary, fontWeight: '700' },

  // Switches
  switchRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  switchRowBorder: { borderTopWidth: 1, borderTopColor: COLORS.border },
  switchLeft:      { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },

  // Settings
  settingRow:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  settingIcon:    { width: 36, height: 36, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  settingLabel:   { flex: 1, color: COLORS.textDark, fontSize: 14, fontWeight: '600' },
  settingDivider: { height: 1, backgroundColor: COLORS.border, marginLeft: 64 },

  version: { textAlign: 'center', color: COLORS.textLight, fontSize: 11, marginTop: 28, marginBottom: 8 },
});

const M = StyleSheet.create({
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet:        { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  title:        { fontSize: 17, fontWeight: '800', color: COLORS.textDark, marginBottom: 16 },
  input:        { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, color: COLORS.textDark, backgroundColor: COLORS.background, marginBottom: 20 },
  helpText:     { color: COLORS.textMid, fontSize: 13, lineHeight: 19, marginBottom: 20 },
  row:          { flexDirection: 'row', gap: 12 },
  cancelBtn:    { flex: 1, height: 48, borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
  cancelT:      { color: COLORS.textMid, fontWeight: '700', fontSize: 15 },
  saveBtn:      { flex: 1, borderRadius: 14, overflow: 'hidden' },
  saveBtnInner: { height: 48, justifyContent: 'center', alignItems: 'center' },
  saveT:        { color: '#fff', fontWeight: '800', fontSize: 15 },
});
