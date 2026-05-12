import React, { useState, useRef, useEffect } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi, setSession } from "../services/api";

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const SCREEN_WIDTH = Dimensions.get("window").width;

const COLOR = {
  background:       "#1A0000",
  card:             "#2A0000",
  inputBg:          "#1F0000",
  borderDefault:    "#2A2A3E",
  borderCard:       "#4A0000",
  borderInput:      "#5A0000",
  borderFocused:    "#6C63FF",
  primary:          "#D00000",
  primaryBright:    "#FF3333",
  primaryLight:     "#FF4444",
  white:            "#FFFFFF",
  textSubtitle:     "#FFBBBB",
  textLabel:        "#CC6666",
  textPlaceholder:  "#4A4A6A",
  textMuted:        "#AAAACC",
};

const ANIMATION = {
  logoFriction:    5,
  logoTension:     60,
  logoSpinMs:      600,
  contentFadeMs:   500,
  slideFriction:   8,
  slideTension:    50,
  inputBorderMs:   200,
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function validateLoginInputs(email, password) {
  if (!email.trim()) return "Please enter your university email.";
  if (!password)     return "Please enter your password.";
  return null;
}

// ─────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────

function BackgroundOrbs() {
  return (
    <>
      <View style={S.orb1} />
      <View style={S.orb2} />
      <View style={S.orb3} />
    </>
  );
}

function LogoSection({ scale, spin, opacity }) {
  return (
    <Animated.View
      style={[S.logoContainer, { transform: [{ scale }, { rotate: spin }], opacity }]}
    >
      <View style={S.logoRing}>
        <Image
          source={require("../../assets/pic1.png")}
          style={S.logo}
          resizeMode="contain"
        />
      </View>
    </Animated.View>
  );
}

function TitleSection({ opacity, translateY }) {
  return (
    <Animated.View style={[S.titleBlock, { opacity, transform: [{ translateY }] }]}>
      <Text style={S.appTitle}>Campus System</Text>
      <View style={S.titleAccent} />
      <Text style={S.subtitle}>
        Welcome back, please login{"\n"}to your account.
      </Text>
    </Animated.View>
  );
}

function OrDivider() {
  return (
    <View style={S.dividerRow}>
      <View style={S.dividerLine} />
      <Text style={S.dividerText}>OR</Text>
      <View style={S.dividerLine} />
    </View>
  );
}

function AnimatedLoginButton({ onPress, loading }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
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
        style={[S.loginButton, loading && S.loginButtonDisabled]}
      >
        <View style={S.loginButtonInner}>
          <Text style={S.loginButtonText}>
            {loading ? "⏳  Logging in..." : "Login"}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function InputField({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType = "default",
  rightIcon,
  onRightIconPress,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  function animateBorder(toValue) {
    Animated.timing(borderAnim, {
      toValue,
      duration: ANIMATION.inputBorderMs,
      useNativeDriver: false,
    }).start();
  }

  function handleFocus() {
    setIsFocused(true);
    animateBorder(1);
  }

  function handleBlur() {
    setIsFocused(false);
    animateBorder(0);
  }

  const borderColor = borderAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [COLOR.borderDefault, COLOR.borderFocused],
  });

  const shadowOpacity = borderAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [0, 0.3],
  });

  const focusedShadow = isFocused
    ? {
        shadowColor:  COLOR.borderFocused,
        shadowOpacity,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 0 },
        elevation: 4,
      }
    : {};

  return (
    <Animated.View style={[S.inputWrapper, { borderColor }, focusedShadow]}>
      <Text style={[S.inputIcon, isFocused && S.inputIconFocused]}>{icon}</Text>
      <TextInput
        style={S.input}
        placeholder={placeholder}
        placeholderTextColor={COLOR.textPlaceholder}
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
        <TouchableOpacity onPress={onRightIconPress} style={S.eyeButton}>
          <Text style={S.eyeIcon}>{rightIcon}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

// ─────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────

export default function LoginScreen({ navigation }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]   = useState(false);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoSpin  = useRef(new Animated.Value(0)).current;

  const spinInterpolation = logoSpin.interpolate({
    inputRange:  [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue:  1,
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

  async function handleLogin() {
    const validationError = validateLoginInputs(email, password);
    if (validationError) {
      Alert.alert("Missing Field", validationError);
      return;
    }

    setLoading(true);
    try {
      const data = await authApi.login({ email: email.trim(), password });
      if (data?.token) {
        await setSession({ token: data.token, role: data.role });
        navigation.reset({ index: 0, routes: [{ name: "Home" }] });
      } else {
        Alert.alert("Login Failed", data?.message ?? "Invalid credentials.");
      }
    } catch (err) {
      Alert.alert(
        "Login Failed",
        err?.message ?? "Network error. Verify the backend is running and reachable."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGuestMode() {
    try {
      await AsyncStorage.setItem("guest_mode", "true");
      navigation.reset({ index: 0, routes: [{ name: "GuestHome" }] });
    } catch {
      Alert.alert("Error", "Failed to enter guest mode.");
    }
  }

  const cardAnim = { opacity: fadeAnim, transform: [{ translateY: slideAnim }] };

  return (
    <KeyboardAvoidingView
      style={S.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLOR.background} />

      <ScrollView
        contentContainerStyle={S.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={S.container}>
          <BackgroundOrbs />

          <LogoSection scale={logoScale} spin={spinInterpolation} opacity={fadeAnim} />

          <TitleSection opacity={fadeAnim} translateY={slideAnim} />

          <Animated.View style={[S.card, cardAnim]}>
            <Text style={S.fieldLabel}>University Email</Text>
            <InputField
              icon="✉️"
              placeholder="yourname@university.edu"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <View style={S.fieldSpacer} />

            <Text style={S.fieldLabel}>Password</Text>
            <InputField
              icon="🔒"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              rightIcon={showPassword ? "🙈" : "👁️"}
              onRightIconPress={() => setShowPassword((prev) => !prev)}
            />

            <TouchableOpacity
              style={S.forgotPasswordRow}
              onPress={() => navigation.navigate("ForgotPassword")}
            >
              <Text style={S.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <AnimatedLoginButton onPress={handleLogin} loading={loading} />

            <OrDivider />

            <TouchableOpacity style={S.ssoButton}>
              <Text style={S.ssoButtonText}>🏛️ Sign in with University SSO</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={S.forgotPasswordRow}
              onPress={() => navigation.navigate("Register")}
            >
              <Text style={S.forgotPasswordText}>
                New here?{" "}
                <Text style={S.registerLink}>Create an account</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[S.ssoButton, S.guestButton]}
              onPress={handleGuestMode}
            >
              <Text style={S.ssoButtonText}>👤 Continue as Guest</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={S.footer}>
              Need help?{" "}
              <Text style={S.footerLink}>Contact IT Support</Text>
            </Text>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────

const S = StyleSheet.create({
  // ── Layout ──────────────────────────────────
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: COLOR.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLOR.background,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 40,
    overflow: "hidden",
  },

  // ── Background Orbs ──────────────────────────
  orb1: {
    position: "absolute",
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: COLOR.primary,
    opacity: 0.07,
    top: -120,
    right: -120,
  },
  orb2: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: COLOR.primaryBright,
    opacity: 0.05,
    bottom: 80,
    left: -80,
  },
  orb3: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLOR.primary,
    opacity: 0.04,
    top: "40%",
    left: "5%",
  },

  // ── Logo ─────────────────────────────────────
  logoContainer: {
    marginBottom: 28,
  },
  logoRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: COLOR.primary,
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
    shadowColor: COLOR.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  logo: {
    width: 60,
    height: 60,
  },

  // ── Title ─────────────────────────────────────
  titleBlock: {
    alignItems: "center",
    marginBottom: 32,
  },
  appTitle: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 32,
    fontWeight: "800",
    color: COLOR.white,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  titleAccent: {
    width: 48,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLOR.primary,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: COLOR.textSubtitle,
    textAlign: "center",
    lineHeight: 22,
  },

  // ── Card ─────────────────────────────────────
  card: {
    width: "100%",
    backgroundColor: COLOR.card,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLOR.borderCard,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 18,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLOR.textLabel,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
    marginLeft: 2,
  },
  fieldSpacer: {
    height: 16,
  },

  // ── Input Field ──────────────────────────────
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLOR.inputBg,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLOR.borderInput,
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
    color: COLOR.white,
    fontSize: 15,
    fontWeight: "500",
  },
  eyeButton: {
    padding: 4,
  },
  eyeIcon: {
    fontSize: 18,
    opacity: 0.55,
  },

  // ── Forgot Password ──────────────────────────
  forgotPasswordRow: {
    alignSelf: "flex-end",
    marginTop: 12,
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: COLOR.primaryLight,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.2,
  },

  // ── Login Button ─────────────────────────────
  loginButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: COLOR.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  loginButtonDisabled: {
    opacity: 0.65,
  },
  loginButtonInner: {
    backgroundColor: COLOR.primary,
    paddingVertical: 17,
    alignItems: "center",
    borderRadius: 16,
    borderTopWidth: 1,
    borderTopColor: COLOR.primaryLight,
  },
  loginButtonText: {
    color: COLOR.white,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },

  // ── OR Divider ───────────────────────────────
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLOR.borderInput,
  },
  dividerText: {
    color: COLOR.textLabel,
    fontSize: 12,
    fontWeight: "600",
    marginHorizontal: 12,
    letterSpacing: 1,
  },

  // ── SSO / Guest Buttons ──────────────────────
  ssoButton: {
    borderWidth: 1.5,
    borderColor: COLOR.borderInput,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    backgroundColor: COLOR.inputBg,
  },
  ssoButtonText: {
    color: COLOR.textMuted,
    fontSize: 14,
    fontWeight: "600",
  },
  guestButton: {
    backgroundColor: COLOR.borderDefault,
    marginTop: 12,
  },

  // ── Register Link ─────────────────────────────
  registerLink: {
    fontWeight: "800",
  },

  // ── Footer ───────────────────────────────────
  footer: {
    color: COLOR.textLabel,
    fontSize: 13,
    textAlign: "center",
  },
  footerLink: {
    color: COLOR.primaryLight,
    fontWeight: "600",
  },
});
