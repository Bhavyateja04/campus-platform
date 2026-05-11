// ─── Imports ──────────────────────────────────────────────────────────────────
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
<<<<<<< HEAD:campus-platform/client/src/screens/LoginScreen.jsx
import { authApi, setSession } from '../services/api';
=======
import AsyncStorage from '@react-native-async-storage/async-storage';
>>>>>>> 42497444c3dfa972ccb0e3bbcafe0428cec6335a:client/src/screens/LoginScreen.jsx

// ─── Constants ─────────────────────────────────────────────────────────────────
const SCREEN_WIDTH = Dimensions.get('window').width;

const API_BASE_URL = 'http://192.168.1.7:5000';

const COLORS = {
  background:       '#1A0000',
  card:             '#2A0000',
  inputBg:          '#1F0000',
  borderDefault:    '#2A2A3E',
  borderCard:       '#4A0000',
  borderInput:      '#5A0000',
  borderFocused:    '#6C63FF',
  primary:          '#D00000',
  primaryBright:    '#FF3333',
  primaryLight:     '#FF4444',
  white:            '#FFFFFF',
  textSubtitle:     '#FFBBBB',
  textLabel:        '#CC6666',
  textPlaceholder:  '#4A4A6A',
  textMuted:        '#AAAACC',
  orb1:             '#D00000',
  orb2:             '#FF3333',
};

const ANIMATION = {
  logoFriction:   5,
  logoTension:    60,
  logoSpinMs:     600,
  contentFadeMs:  500,
  slideFriction:  8,
  slideTension:   50,
  inputBorderMs:  200,
};

// ─── Sub-components ────────────────────────────────────────────────────────────
const AnimatedButton = ({ onPress, loading }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn  = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  const handlePressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        disabled={loading}
        style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
      >
        <View style={styles.loginBtnGradient}>
          <Text style={styles.loginBtnText}>
            {loading ? '⏳  Logging in...' : 'Login'}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const InputField = ({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType = 'default',
  rightIcon,
  onRightIconPress,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const animateBorder = (toValue) =>
    Animated.timing(borderAnim, {
      toValue,
      duration: ANIMATION.inputBorderMs,
      useNativeDriver: false,
    }).start();

  const handleFocus = () => { setIsFocused(true);  animateBorder(1); };
  const handleBlur  = () => { setIsFocused(false); animateBorder(0); };

  const borderColor = borderAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [COLORS.borderDefault, COLORS.borderFocused],
  });

  const shadowOpacity = borderAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [0, 0.3],
  });

  const focusedShadow = isFocused
    ? { shadowColor: COLORS.borderFocused, shadowOpacity, shadowRadius: 8, shadowOffset: { width: 0, height: 0 }, elevation: 4 }
    : {};

  return (
    <Animated.View style={[styles.inputWrapper, { borderColor }, focusedShadow]}>
      <Text style={[styles.inputIcon, isFocused && styles.inputIconFocused]}>{icon}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textPlaceholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {rightIcon && (
        <TouchableOpacity onPress={onRightIconPress} style={styles.eyeBtn}>
          <Text style={styles.eyeIcon}>{rightIcon}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const BackgroundOrbs = () => (
  <>
    <View style={styles.orb1} />
    <View style={styles.orb2} />
    <View style={styles.orb3} />
  </>
);

const LogoSection = ({ scale, spin, opacity }) => (
  <Animated.View style={[styles.logoContainer, { transform: [{ scale }, { rotate: spin }], opacity }]}>
    <View style={styles.logoRing}>
      <Image
        source={require('../../assets/pic1.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  </Animated.View>
);

const TitleSection = ({ opacity, translateY }) => (
  <Animated.View style={[styles.titleBlock, { opacity, transform: [{ translateY }] }]}>
    <Text style={styles.appTitle}>Campus System</Text>
    <View style={styles.titleAccent} />
    <Text style={styles.subtitle}>
      Welcome back, please login{'\n'}to your account.
    </Text>
  </Animated.View>
);

const Divider = () => (
  <View style={styles.dividerRow}>
    <View style={styles.dividerLine} />
    <Text style={styles.dividerText}>OR</Text>
    <View style={styles.dividerLine} />
  </View>
);

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function LoginScreen({ navigation }) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoSpin  = useRef(new Animated.Value(0)).current;

  const spin = logoSpin.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: ANIMATION.logoFriction,
          tension:  ANIMATION.logoTension,
          useNativeDriver: true,
        }),
        Animated.timing(logoSpin, {
          toValue:  1,
          duration: ANIMATION.logoSpinMs,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue:  1,
          duration: ANIMATION.contentFadeMs,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue:  0,
          friction: ANIMATION.slideFriction,
          tension:  ANIMATION.slideTension,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

<<<<<<< HEAD:campus-platform/client/src/screens/LoginScreen.jsx
  const spin = logoSpin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

const handleLogin = async () => {
  if (!email.trim()) {
    Alert.alert("Missing Field", "Please enter your university email.");
    return;
  }

  if (!password) {
    Alert.alert("Missing Field", "Please enter your password.");
    return;
  }

  setLoading(true);

  try {
    const data = await authApi.login({ email: email.trim(), password });

    if (data?.token) {
      await setSession({ token: data.token, role: data.role });
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } else {
      Alert.alert("Login failed", data?.message || "Invalid credentials");
    }
  } catch (err) {
    Alert.alert(
      "Login failed",
      err?.message || "Network error. Verify the backend is running and API_BASE_URL is reachable."
    );
  } finally {
    setLoading(false);
  }
};
=======
  const validateInputs = () => {
    if (!email.trim()) {
      Alert.alert('Missing Field', 'Please enter your university email.');
      return false;
    }
    if (!password) {
      Alert.alert('Missing Field', 'Please enter your password.');
      return false;
    }
    return true;
  };

  const handleLoginSuccess = async (data) => {
    await AsyncStorage.setItem('token', data.token);
    navigation.navigate('ResetPassword', { email: email.trim() });
  };

  const handleLogin = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();

      if (data.success) {
        await handleLoginSuccess(data);
      } else {
        Alert.alert('Error', data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };
>>>>>>> 42497444c3dfa972ccb0e3bbcafe0428cec6335a:client/src/screens/LoginScreen.jsx

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <BackgroundOrbs />

          <LogoSection scale={logoScale} spin={spin} opacity={fadeAnim} />

          <TitleSection opacity={fadeAnim} translateY={slideAnim} />

          <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.fieldLabel}>University Email</Text>
            <InputField
              icon="✉️"
              placeholder="yourname@university.edu"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <View style={styles.spacer} />

            <Text style={styles.fieldLabel}>Password</Text>
            <InputField
              icon="🔒"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPwd}
              rightIcon={showPwd ? '🙈' : '👁️'}
              onRightIconPress={() => setShowPwd((prev) => !prev)}
            />

            <TouchableOpacity
              style={styles.forgotRow}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <AnimatedButton onPress={handleLogin} loading={loading} />

            <Divider />

            <TouchableOpacity style={styles.ssoBtn}>
              <Text style={styles.ssoBtnText}>🏛️  Sign in with University SSO</Text>
            </TouchableOpacity>
<<<<<<< HEAD:campus-platform/client/src/screens/LoginScreen.jsx

            <TouchableOpacity
              style={styles.forgotRow}
              onPress={() => navigation.navigate("Register")}
            >
              <Text style={styles.forgotText}>
                New here? <Text style={{ fontWeight: '800' }}>Create an account</Text>
              </Text>
            </TouchableOpacity>

=======
>>>>>>> 42497444c3dfa972ccb0e3bbcafe0428cec6335a:client/src/screens/LoginScreen.jsx
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={styles.footer}>
              Need help?{' '}
              <Text style={styles.footerLink}>Contact IT Support</Text>
            </Text>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Layout
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 40,
    overflow: 'hidden',
  },

  // Background orbs
  orb1: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: COLORS.orb1,
    opacity: 0.07,
    top: -120,
    right: -120,
  },
  orb2: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: COLORS.orb2,
    opacity: 0.05,
    bottom: 80,
    left: -80,
  },
  orb3: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.orb1,
    opacity: 0.04,
    top: '40%',
    left: '5%',
  },

  // Logo
  logoContainer: {
    marginBottom: 28,
  },
  logoRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  logo: {
    width: 60,
    height: 60,
  },

  // Title
  titleBlock: {
    alignItems: 'center',
    marginBottom: 32,
  },
  appTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  titleAccent: {
    width: 48,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSubtitle,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Card
  card: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.borderCard,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 18,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textLabel,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 2,
  },

  // Input
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.borderInput,
    paddingHorizontal: 14,
    height: 56,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 10,
    opacity: 0.45,
  },
  inputIconFocused: {
    opacity: 1,
  },
  input: {
    flex: 1,
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '500',
  },
  eyeBtn: {
    padding: 4,
  },
  eyeIcon: {
    fontSize: 18,
    opacity: 0.55,
  },
  spacer: {
    height: 16,
  },

  // Forgot password
  forgotRow: {
    alignSelf: 'flex-end',
    marginTop: 12,
    marginBottom: 24,
  },
  forgotText: {
    color: COLORS.primaryLight,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  // Login button
  loginBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  loginBtnDisabled: {
    opacity: 0.65,
  },
  loginBtnGradient: {
    backgroundColor: COLORS.primary,
    paddingVertical: 17,
    alignItems: 'center',
    borderRadius: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.primaryLight,
  },
  loginBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.borderInput,
  },
  dividerText: {
    color: COLORS.textLabel,
    fontSize: 12,
    fontWeight: '600',
    marginHorizontal: 12,
    letterSpacing: 1,
  },

  // SSO button
  ssoBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.borderInput,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
  },
  ssoBtnText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },

  // Footer
  footer: {
    color: COLORS.textLabel,
    fontSize: 13,
    textAlign: 'center',
  },
  footerLink: {
    color: COLORS.primaryLight,
    fontWeight: '600',
  },
});
