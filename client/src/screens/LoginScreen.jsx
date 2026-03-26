// import React, { useState } from "react";
// import { useNavigation } from "@react-navigation/native";
// import {
// View,
// Text,
// TextInput,
// TouchableOpacity,
// StyleSheet,
// Image
// } from "react-native";

// export default function LoginScreen() {

// const [email,setEmail] = useState("");
// const [password,setPassword] = useState("");
// const navigation = useNavigation();
// const handleLogin = () => {
// navigation.navigate("Reset");
// };

// return (

// <View style={styles.container}>

// {/* Logo */}
// <View style={styles.logoArea}>

// <View style={styles.logoRing}>
// <Image
// source={require("../../assets/pic1.png")}
// style={styles.logo}
// />
// </View>

// <Text style={styles.title}>Campus System</Text>

// <Text style={styles.subtitle}>
// Welcome back, please login to your account
// </Text>

// </View>

// {/* Email */}
// <TextInput
// placeholder="University Email"
// placeholderTextColor="#888"
// style={styles.input}
// value={email}
// onChangeText={setEmail}
// />

// {/* Password */}
// <TextInput
// placeholder="Password"
// placeholderTextColor="#888"
// secureTextEntry
// style={styles.input}
// value={password}
// onChangeText={setPassword}
// />

// {/* Forgot */}
// <TouchableOpacity>
// <Text style={styles.forgot}>Forgot Password?</Text>
// </TouchableOpacity>

// {/* Login Button */}
// <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
// <Text style={styles.loginText}>LOGIN</Text>
// </TouchableOpacity>

// </View>

// );
// }

// const styles = StyleSheet.create({

// container:{
// flex:1,
// backgroundColor:"#0B0B1A",
// justifyContent:"center",
// padding:25
// },

// logoArea:{
// alignItems:"center",
// marginBottom:40
// },

// logoRing:{
// width:90,
// height:90,
// borderRadius:50,
// borderWidth:2,
// borderColor:"#6C63FF",
// justifyContent:"center",
// alignItems:"center",
// marginBottom:15
// },

// logo:{
// width:60,
// height:60,
// resizeMode:"contain"
// },

// title:{
// color:"#fff",
// fontSize:28,
// fontWeight:"bold"
// },

// subtitle:{
// color:"#aaa",
// marginTop:5,
// textAlign:"center"
// },

// input:{
// backgroundColor:"#111",
// color:"#fff",
// padding:15,
// borderRadius:12,
// marginBottom:15
// },

// forgot:{
// color:"#6C63FF",
// alignSelf:"flex-end",
// marginBottom:20
// },

// loginBtn:{
// backgroundColor:"#6C63FF",
// padding:15,
// borderRadius:12
// },

// loginText:{
// color:"#fff",
// textAlign:"center",
// fontWeight:"bold",
// letterSpacing:1
// }

// });
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

const { width } = Dimensions.get('window');

// ─── GRADIENT BUTTON ─────────────────────────────────────────────────────────
const GradientButton = ({ onPress, label, loading }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn  = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
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

// ─── INPUT FIELD ─────────────────────────────────────────────────────────────
const InputField = ({
  icon, placeholder, value, onChangeText,
  secureTextEntry, keyboardType, rightIcon, onRightIconPress,
}) => {
  const [focused, setFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const onFocus = () => {
    setFocused(true);
    Animated.timing(borderAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  };
  const onBlur = () => {
    setFocused(false);
    Animated.timing(borderAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  };

  const borderColor = borderAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: ['#2A2A3E', '#6C63FF'],
  });

  const shadowOpacity = borderAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [0, 0.3],
  });

  return (
    <Animated.View style={[
      styles.inputWrapper,
      { borderColor },
      focused && { shadowColor: '#6C63FF', shadowOpacity, shadowRadius: 8, shadowOffset: { width: 0, height: 0 }, elevation: 4 },
    ]}>
      <Text style={[styles.inputIcon, focused && styles.inputIconFocused]}>{icon}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#4A4A6A"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType || 'default'}
        onFocus={onFocus}
        onBlur={onBlur}
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

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function LoginScreen({ navigation }) {
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPwd,     setShowPwd]     = useState(false);
  const [loading,     setLoading]     = useState(false);

  // Animations
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoSpin  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1,   friction: 5, tension: 60, useNativeDriver: true }),
        Animated.timing(logoSpin,  { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 50, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const spin = logoSpin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const handleLogin = () => {

  if (!email.trim()) {
    Alert.alert("Missing Field", "Please enter your university email.");
    return;
  }

  if (!password) {
    Alert.alert("Missing Field", "Please enter your password.");
    return;
  }

  setLoading(true);

  setTimeout(() => {
    setLoading(false);

    Alert.alert("Login Successful");

    navigation.navigate("ResetPassword");   // 👈 ADD THIS LINE

  }, 1500);
};

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0B0B1A" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>

          {/* Background Orbs */}
          <View style={styles.orb1} />
          <View style={styles.orb2} />
          <View style={styles.orb3} />

          {/* ── LOGO ── */}
         {/* ── LOGO ── */}
<Animated.View
  style={[
    styles.logoContainer,
    { transform: [{ scale: logoScale }, { rotate: spin }], opacity: fadeAnim },
  ]}
>
  <View style={styles.logoRing}>
    <Image
      source={require('../../assets/pic1.png')}
      style={styles.logo}
      resizeMode="contain"
    />
  </View>
</Animated.View>

          {/* ── TITLE ── */}
          <Animated.View style={[
            styles.titleBlock,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}>
            <Text style={styles.appTitle}>Campus System</Text>
            <View style={styles.titleAccent} />
            <Text style={styles.subtitle}>
              Welcome back, please login{'\n'}to your account.
            </Text>
          </Animated.View>

          {/* ── CARD ── */}
          <Animated.View style={[
            styles.card,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}>

            {/* Email */}
            <Text style={styles.fieldLabel}>University Email</Text>
            <InputField
              icon="✉️"
              placeholder="yourname@university.edu"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <View style={styles.spacer} />

            {/* Password */}
            <Text style={styles.fieldLabel}>Password</Text>
            <InputField
              icon="🔒"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPwd}
              rightIcon={showPwd ? '🙈' : '👁️'}
              onRightIconPress={() => setShowPwd(!showPwd)}
            />

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotRow}
              onPress={() => navigation.navigate("ResetPassword")}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <GradientButton onPress={handleLogin} loading={loading} />

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* SSO Button */}
            <TouchableOpacity style={styles.ssoBtn}>
              <Text style={styles.ssoBtnText}>🏛️  Sign in with University SSO</Text>
            </TouchableOpacity>

          </Animated.View>

          {/* Footer */}
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

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  scroll: {
    flexGrow: 1,
    backgroundColor: '#1A0000',
  },

  container: {
    flex: 1,
    backgroundColor: '#1A0000',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 40,
    overflow: 'hidden',
  },

  // ── Orbs ──
  orb1: {
    position: 'absolute',
    width: 360, height: 360,
    borderRadius: 180,
    backgroundColor: '#D00000',
    opacity: 0.07,
    top: -120, right: -120,
  },
  orb2: {
    position: 'absolute',
    width: 280, height: 280,
    borderRadius: 140,
    backgroundColor: '#FF3333',
    opacity: 0.05,
    bottom: 80, left: -80,
  },
  orb3: {
    position: 'absolute',
    width: 160, height: 160,
    borderRadius: 80,
    backgroundColor: '#D00000',
    opacity: 0.04,
    top: '40%', left: '5%',
  },

  // ── Logo ──
  logoContainer: {
    marginBottom: 28,
  },
  logoRing: {
    width: 96, height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: '#D00000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    shadowColor: '#D00000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  logoCircle: {
    width: 76, height: 76,
    borderRadius: 38,
    backgroundColor: '#1A1A2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
  width: 60,
  height: 60,
},

  // ── Title ──
  titleBlock: {
    alignItems: 'center',
    marginBottom: 32,
  },
  appTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  titleAccent: {
    width: 48, height: 3,
    borderRadius: 2,
    backgroundColor: '#D00000',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#FFBBBB',
    textAlign: 'center',
    lineHeight: 22,
  },

  // ── Card ──
  card: {
    width: '100%',
    backgroundColor: '#2A0000',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#4A0000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 18,
  },

  // ── Field Label ──
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color:'#CC6666',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 2,
  },

  // ── Input ──
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F0000',
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    borderColor : '#5A0000',
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
    color: '#FFFFFF',
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

  spacer: { height: 16 },

  // ── Forgot ──
  forgotRow: {
    alignSelf: 'flex-end',
    marginTop: 12,
    marginBottom: 24,
  },
  forgotText: {
    color: '#FF4444',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  // ── Login Button ──
  loginBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#D00000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  loginBtnDisabled: {
    opacity: 0.65,
  },
  loginBtnGradient: {
    backgroundColor: '#D00000',
    paddingVertical: 17,
    alignItems: 'center',
    borderRadius: 16,
    borderTopWidth: 1,
    borderTopColor: '#FF4444',
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  // ── Divider ──
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#5A0000',
  },
  dividerText: {
    color: '#CC6666',
    fontSize: 12,
    fontWeight: '600',
    marginHorizontal: 12,
    letterSpacing: 1,
  },

  // ── SSO ──
  ssoBtn: {
    borderWidth: 1.5,
    borderColor: '#5A0000',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: '#1F0000',
  },
  ssoBtnText: {
    color: '#AAAACC',
    fontSize: 14,
    fontWeight: '600',
  },

  // ── Footer ──
  footer: {
    color: '#CC6666',
    fontSize: 13,
    textAlign: 'center',
  },
  footerLink: {
    color: '#FF4444',
    fontWeight: '600',
  },
});