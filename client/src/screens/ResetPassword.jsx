import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  StatusBar, Animated, Dimensions, KeyboardAvoidingView,
  Platform, ScrollView, Alert, Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const C = {
  bg:          '#1A0000',
  card:        '#2A0000',
  cardBorder:  '#4A0000',
  input:       '#1F0000',
  inputBorder: '#5A0000',
  primary:     '#D00000',
  primaryLight:'#FF4444',
  primaryDark: '#900000',
  white:       '#FFFFFF',
  grey1:       '#FFBBBB',
  grey2:       '#CC6666',
  grey3:       '#5A0000',
  amber:       '#FF8800',
  red:         '#FF3333',
};
const Orbs = () => (
  <>
    <View style={[s.orb, { backgroundColor: '#D00000', top: -140, right: -130, width: 340, height: 340, borderRadius: 170 }]} />
    <View style={[s.orb, { backgroundColor: '#FF3333', bottom: -80, left: -90, width: 260, height: 260, borderRadius: 130, opacity: 0.04 }]} />
  </>
);

const Logo = ({ scale }) => (
  <Animated.View style={[s.logoWrap, scale && { transform: [{ scale }] }]}>
    <View style={s.logoRing}>
      <View style={s.logoCircle}>
        <Image
          source={require('../../assets/pic1.png')}
          style={{ width: 50, height: 50 }}
          resizeMode="contain"
        />
      </View>
    </View>
  </Animated.View>
);

const FieldLabel = ({ children }) => <Text style={s.fieldLabel}>{children}</Text>;

const InputBox = ({ icon, placeholder, value, onChangeText, secure, onToggle, showToggle, keyboardType, matchState, editable = true }) => {
  const [focused, setFocused] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;
  const focus = () => { setFocused(true);  Animated.timing(anim, { toValue: 1, duration: 180, useNativeDriver: false }).start(); };
  const blur  = () => { setFocused(false); Animated.timing(anim, { toValue: 0, duration: 180, useNativeDriver: false }).start(); };
  const bc = matchState === 'match' ? '#FFFFFF' : matchState === 'mismatch' ? C.red
    : anim.interpolate({ inputRange: [0,1], outputRange: [C.inputBorder, '#D00000'] });
  return (
    <Animated.View style={[s.inputBox, { borderColor: bc }, focused && s.inputBoxFocused]}>
      <Text style={[s.inputIco, focused && s.inputIcoFocused]}>{icon}</Text>
      <TextInput
        style={[s.inputText, !editable && { color: C.grey1 }]}
        placeholder={placeholder} placeholderTextColor={C.grey2}
        value={value} onChangeText={onChangeText}
        secureTextEntry={secure} keyboardType={keyboardType || 'default'}
        onFocus={focus} onBlur={blur}
        autoCapitalize="none" autoCorrect={false} editable={editable}
      />
      {showToggle && (
        <TouchableOpacity onPress={onToggle} style={s.eyeBtn}>
          <Text style={s.eyeIco}>{secure ? '👁️' : '🙈'}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const PrimaryBtn = ({ label, onPress, loading }) => {
  const sc = useRef(new Animated.Value(1)).current;
  const pi = () => Animated.spring(sc, { toValue: 0.96, useNativeDriver: true }).start();
  const po = () => Animated.spring(sc, { toValue: 1,    useNativeDriver: true }).start();
  return (
    <Animated.View style={{ transform: [{ scale: sc }] }}>
      <TouchableOpacity onPress={onPress} onPressIn={pi} onPressOut={po} disabled={loading} activeOpacity={1}
        style={[s.primaryBtn, loading && s.btnDisabled]}>
        <Text style={s.primaryBtnText}>{loading ? '⏳  Please wait...' : label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const AlertBox = ({ type, msg }) => {
  if (!msg) return null;
  const map = { error: ['#FF4444','rgba(208,0,0,0.15)'], success: ['#FFFFFF','rgba(255,255,255,0.08)'], info: ['#FF9999','rgba(208,0,0,0.1)'] };
  const [text, bg] = map[type] || map.info;
  return <View style={[s.alertBox, { backgroundColor: bg, borderColor: text+'44' }]}><Text style={[s.alertText, { color: text }]}>{msg}</Text></View>;
};
function LoginScreen({ navigate }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [err, setErr]           = useState('');

  const fade  = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(40)).current;
  const logo  = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(logo,  { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(fade,  { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.spring(slide, { toValue: 0, friction: 8,  tension: 50, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const handleLogin = () => {
    setErr('');
    if (!email.trim())        return setErr('⚠️  Please enter your university email.');
    if (!email.includes('@')) return setErr('⚠️  Enter a valid email address.');
    if (!password)            return setErr('⚠️  Please enter your password.');
    setLoading(true);
    const payload = { email: email.trim(), password };
    console.log('Login API payload:', payload);

fetch("http://YOUR_IP:5000/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    email: email.trim(),
    password: password
  })
})
.then(res => res.json())
.then(async data => {
  setLoading(false);

  if (data.success) {
    await AsyncStorage.setItem("token", data.token);
    if (data.forceReset) {
      navigate('ForceReset', { email: email.trim() });
    } else {
      Alert.alert("Login Success")
    }

  } else {
    setErr(data.message || "Invalid credentials");
  }
})
.catch(err => {
  console.log(err);
  setLoading(false);
  setErr("Network error");
});
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={s.container}>
          <Orbs />
          <Logo scale={logo} />

          <Animated.View style={[s.titleBlock, { opacity: fade, transform: [{ translateY: slide }] }]}>
            <Text style={s.pageTitle}>Welcome Back</Text>
            <View style={s.accent} />
            <Text style={s.pageSub}>Sign in to your campus account</Text>
          </Animated.View>

          <Animated.View style={[s.card, { opacity: fade, transform: [{ translateY: slide }] }]}>
            <AlertBox type="error" msg={err} />

            <FieldLabel>University Email</FieldLabel>
            <InputBox
              icon="✉️"
              placeholder="yourname@university.edu"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <View style={{ height: 14 }} />
            <FieldLabel>Password</FieldLabel>
            <InputBox
              icon="🔒"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secure={!showPwd}
              showToggle
              onToggle={() => setShowPwd(!showPwd)}
            />

            <TouchableOpacity style={s.forgotRow} onPress={() => navigate('ForgotPassword')}>
              <Text style={s.forgotTxt}>Forgot Password?</Text>
            </TouchableOpacity>

            <PrimaryBtn label="Login" onPress={handleLogin} loading={loading} />

            <View style={s.divRow}>
              <View style={s.divLine} /><Text style={s.divTxt}>OR</Text><View style={s.divLine} />
            </View>

            <TouchableOpacity style={s.ssoBtn}>
              <Text style={s.ssoBtnTxt}>🏛️  Sign in with University SSO</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ opacity: fade }}>
            <Text style={s.footer}>Need help? <Text style={s.footerLink}>Contact IT Support</Text></Text>
          </Animated.View>

  
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
function ForgotPasswordScreen({ navigate }) {
  const [step,    setStep]    = useState('phone');
  const [phone,   setPhone]   = useState('');
  const [otp,     setOtp]     = useState(['','','','','','']);
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState('');
  const [info,    setInfo]    = useState('');
  const [timer,   setTimer]   = useState(0);

  const otpRefs = useRef([...Array(6)].map(() => React.createRef()));
  const fade    = useRef(new Animated.Value(0)).current;
  const slide   = useRef(new Animated.Value(40)).current;
  const logo    = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(logo,  { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(fade,  { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.spring(slide, { toValue: 0, friction: 8,  tension: 50, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  useEffect(() => {
    if (timer <= 0) return;
    const t = setInterval(() => setTimer(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [timer]);

  const sendOtp = () => {
    setErr('');
    if (!phone.trim())           return setErr('⚠️  Please enter your mobile number.');
    if (phone.trim().length < 7) return setErr('⚠️  Enter a valid mobile number.');
    setLoading(true);
    const payload = { phone: phone.trim() };
    console.log('Send OTP API payload:', payload);

   fetch("http://YOUR_IP:5000/send-otp", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ phone: phone.trim() })
})
.then(res => res.json())
.then(data => {
  setLoading(false);

  if (data.success) {
    setStep('otp');
    setTimer(60);
    setInfo("OTP sent successfully");
  } else {
    setErr(data.message || "Failed to send OTP");
  }
})
.catch(err => {
  console.log(err);
  setLoading(false);
  setErr("Network error");
});
  };

  const handleOtpChange = (val, idx) => {
    const newOtp = [...otp];
    newOtp[idx] = val.replace(/[^0-9]/g, '').slice(-1);
    setOtp(newOtp);
    if (val && idx < 5) otpRefs.current[idx + 1]?.current?.focus();
    if (!val && idx > 0) otpRefs.current[idx - 1]?.current?.focus();
  };

const verifyOtp = () => {
  setErr('');
  const entered = otp.join('');

  if (entered.length < 6) {
    return setErr('⚠️ Enter 6-digit OTP');
  }

  setLoading(true);

  fetch("http://192.168.X.X:5000/verify-otp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      phone: phone.trim(),
      otp: entered
    })
  })
  .then(res => res.json())
  .then(data => {
    setLoading(false);

    if (data.success) {
      navigate('ForceReset', { phone });
    } else {
      setErr("Invalid OTP");
    }
  })
  .catch(err => {
    console.log(err);
    setLoading(false);
    setErr("Network error");
  });
};


  const resendOtp = () => {
    if (timer > 0) return;
    setOtp(['','','','','','']);
    setErr(''); setTimer(60);
    const payload = { phone: phone.trim() };
    console.log('Resend OTP API payload:', payload);

    setInfo(`New OTP sent! (Demo OTP: ${DEMO_OTP})`);

  };
const handleLogout = async () => {
  await AsyncStorage.removeItem("token");
  navigate("Login"); 
};
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={s.container}>
          <Orbs />
          <Logo scale={logo} />

          <Animated.View style={[s.titleBlock, { opacity: fade, transform: [{ translateY: slide }] }]}>
            <Text style={s.pageTitle}>{step === 'phone' ? 'Forgot Password' : 'Enter OTP'}</Text>
            <View style={[s.accent, { backgroundColor: '#FFFFFF' }]} />
            <Text style={s.pageSub}>
              {step === 'phone'
                ? 'Enter your registered mobile number to receive a verification code'
                : `We sent a 6-digit code to\n${phone}`}
            </Text>
          </Animated.View>

          <Animated.View style={[s.card, { opacity: fade, transform: [{ translateY: slide }] }]}>
            <AlertBox type="error" msg={err} />
            <AlertBox type="info"  msg={info} />

            {step === 'phone' ? (
              <>
                <FieldLabel>Mobile Number</FieldLabel>
                <InputBox
                  icon="📱"
                  placeholder="Enter mobile number"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
                <View style={{ height: 24 }} />
                <PrimaryBtn label="Send OTP Code" onPress={sendOtp} loading={loading} />
              </>
            ) : (
              <>
                <Text style={s.otpLabel}>Verification Code</Text>
                <View style={s.otpRow}>
                  {otp.map((digit, i) => (
                    <TextInput
                      key={i} ref={otpRefs.current[i]}
                      style={[s.otpBox, digit && s.otpBoxFilled]}
                      value={digit} onChangeText={v => handleOtpChange(v, i)}
                      keyboardType="number-pad" maxLength={1} textAlign="center" selectTextOnFocus
                    />
                  ))}
                </View>
                <View style={s.resendRow}>
                  {timer > 0
                    ? <Text style={s.timerTxt}>Resend OTP in <Text style={{ color: '#FFFFFF' }}>0:{timer.toString().padStart(2,'0')}</Text></Text>
                    : <TouchableOpacity onPress={resendOtp}><Text style={s.resendTxt}>Didn't receive? Resend OTP</Text></TouchableOpacity>
                  }
                </View>
                <View style={{ height: 20 }} />
                <PrimaryBtn label="✅  Verify OTP" onPress={verifyOtp} loading={loading} />
                <TouchableOpacity style={s.changeEmailRow} onPress={() => { setStep('phone'); setErr(''); setInfo(''); setOtp(['','','','','','']); }}>
                  <Text style={s.changeEmailTxt}>← Change Number</Text>
                </TouchableOpacity>
              </>
            )}
          </Animated.View>

          <Animated.View style={{ opacity: fade }}>
           <TouchableOpacity onPress={handleLogout}>
  <Text style={{ color: 'red', textAlign: 'center', marginTop: 10 }}>
    Logout
  </Text>
</TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
function ForceResetScreen({ navigate, params }) {
  const [newPwd,   setNewPwd]   = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showN,    setShowN]    = useState(false);
  const [showC,    setShowC]    = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [err,      setErr]      = useState('');
  const [showReqs, setShowReqs] = useState(false);

  const fade  = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(40)).current;
  const logo  = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(logo,  { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(fade,  { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.spring(slide, { toValue: 0, friction: 8,  tension: 50, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const getStrength = p => {
    let s = 0;
    if (p.length >= 8)          s++;
    if (/[A-Z]/.test(p))        s++;
    if (/[0-9]/.test(p))        s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };

  const strength  = getStrength(newPwd);
  const sColor    = strength <= 1 ? '#FF3333' : strength <= 2 ? C.amber : '#FFFFFF';
  const sLabel    = strength <= 1 ? '⚠️  Weak' : strength <= 2 ? '⚡  Medium' : '✅  Strong';
  const segColors = [0,1,2,3].map(i => i < strength ? sColor : C.grey3);

  const reqs = [
    { t: 'At least 8 characters',       ok: newPwd.length >= 8 },
    { t: 'One uppercase letter (A–Z)',   ok: /[A-Z]/.test(newPwd) },
    { t: 'One number (0–9)',             ok: /[0-9]/.test(newPwd) },
    { t: 'One special character (!@#$)', ok: /[^A-Za-z0-9]/.test(newPwd) },
  ];

  const isMatch    = confirm.length > 0 && newPwd === confirm;
  const isMismatch = confirm.length > 0 && newPwd !== confirm;

  const handleReset = () => {
    setErr('');
    if (!newPwd)                     return setErr('⚠️  Please enter a new password.');
    if (strength < 2)                return setErr('⚠️  Password is too weak. Check requirements below.');
    if (newPwd === DEFAULT_PASSWORD)  return setErr('⚠️  New password cannot be same as default password.');
    if (!confirm)                    return setErr('⚠️  Please confirm your new password.');
    if (newPwd !== confirm)          return setErr('⚠️  Passwords do not match.');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('🎉 Password Updated!', 'Your password has been reset successfully. Please login with your new password.', [
        { text: 'Go to Login', onPress: () => navigate('Login') },
      ]);
    }, 1800);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={s.container}>
          <Orbs />
          <Logo scale={logo} />

          <Animated.View style={[s.warningBanner, { opacity: fade }]}>
            <Text style={s.warningIcon}>⚠️</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.warningTitle}>Password Reset Required</Text>
              <Text style={s.warningTxt}>You're using default credentials. Please set a new secure password to continue.</Text>
            </View>
          </Animated.View>

          <Animated.View style={[s.titleBlock, { opacity: fade, transform: [{ translateY: slide }] }]}>
            <Text style={s.pageTitle}>Set New Password</Text>
            <View style={[s.accent, { backgroundColor: '#FFFFFF' }]} />
            <Text style={s.pageSub}>Secure your account with a strong password</Text>
          </Animated.View>

          <Animated.View style={[s.card, { opacity: fade, transform: [{ translateY: slide }] }]}>
            <FieldLabel>Account Email</FieldLabel>
            <InputBox icon="✉️" placeholder="" value={params?.email || ""} editable={false} />
            <View style={{ height: 16 }} />

            <View style={s.secBadge}>
              <Text style={s.secBadgeIco}>🔐</Text>
              <Text style={s.secBadgeTxt}>256-bit encrypted · Secure connection</Text>
            </View>

            <AlertBox type="error" msg={err} />

            <FieldLabel>New Password</FieldLabel>
            <InputBox icon="🔑" placeholder="Create new password" value={newPwd}
              onChangeText={v => { setNewPwd(v); setShowReqs(true); }}
              secure={!showN} showToggle onToggle={() => setShowN(!showN)} />

            {newPwd.length > 0 && (
              <View style={s.strBlock}>
                <View style={s.strBar}>
                  {segColors.map((c,i) => <View key={i} style={[s.strSeg, { backgroundColor: c }]} />)}
                </View>
                <Text style={[s.strLabel, { color: sColor }]}>{sLabel} password</Text>
              </View>
            )}

            {showReqs && (
              <View style={s.reqBox}>
                <Text style={s.reqTitle}>Requirements</Text>
                {reqs.map((r,i) => (
                  <View key={i} style={s.reqRow}>
                    <View style={[s.reqDot, r.ok && { backgroundColor: '#FFFFFF' }]} />
                    <Text style={[s.reqTxt, r.ok && { color: '#FFFFFF' }]}>{r.t}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={{ height: 16 }} />

            <FieldLabel>Confirm New Password</FieldLabel>
            <InputBox icon="🔒" placeholder="Re-enter new password" value={confirm}
              onChangeText={setConfirm} secure={!showC} showToggle onToggle={() => setShowC(!showC)}
              matchState={isMatch ? 'match' : isMismatch ? 'mismatch' : null} />
            {isMatch    && <Text style={[s.matchTxt, { color: '#FFFFFF' }]}>✅  Passwords match</Text>}
            {isMismatch && <Text style={[s.matchTxt, { color: C.red    }]}>❌  Passwords do not match</Text>}

            <View style={{ height: 24 }} />
            <PrimaryBtn label="🔐  Update Password" onPress={handleReset} loading={loading} />
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
function ResetPassword() {
  const [screen, setScreen] = useState('Login');
  const [params, setParams] = useState(null);

  const navigate = useCallback((to, p = null) => {
    setParams(p);
    setScreen(to);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {screen === 'Login' && <LoginScreen navigate={navigate} />}
      {screen === 'ForgotPassword' && <ForgotPasswordScreen navigate={navigate} />}
      {screen === 'ForceReset' && <ForceResetScreen navigate={navigate} params={params} />}
    </View>
  );
}

export default ResetPassword;
const s = StyleSheet.create({
  scroll:    { flexGrow: 1, backgroundColor: C.bg },
  container: { flex: 1, backgroundColor: C.bg, alignItems: 'center', paddingHorizontal: 22, paddingTop: 56, paddingBottom: 40, overflow: 'hidden' },
  orb: { position: 'absolute', opacity: 0.06 },
  logoWrap:   { alignItems: 'center', marginBottom: 22 },
  logoRing:   { width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: '#D00000', alignItems: 'center', justifyContent: 'center', marginBottom: 12, shadowColor: '#D00000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 16, elevation: 10 },
  logoCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#2A0000', alignItems: 'center', justifyContent: 'center' },
  titleBlock: { alignItems: 'center', marginBottom: 20, width: '100%' },
  pageTitle:  { fontSize: 28, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.3, marginBottom: 10, textAlign: 'center' },
  accent:     { width: 44, height: 3, borderRadius: 2, backgroundColor: '#D00000', marginBottom: 10 },
  pageSub:    { fontSize: 13.5, color: C.grey1, textAlign: 'center', lineHeight: 21 },
  card: { width: '100%', backgroundColor: C.card, borderRadius: 24, padding: 24, marginBottom: 20, borderWidth: 1, borderColor: C.cardBorder, shadowColor: '#D00000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 18 },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: C.grey2, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 7, marginLeft: 2 },
  inputBox:        { flexDirection: 'row', alignItems: 'center', backgroundColor: C.input, borderRadius: 13, borderWidth: 1.5, paddingHorizontal: 14, height: 54 },
  inputBoxFocused: { shadowColor: '#D00000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  inputIco:        { fontSize: 17, marginRight: 10, opacity: 0.4 },
  inputIcoFocused: { opacity: 1 },
  inputText:       { flex: 1, color: '#FFFFFF', fontSize: 15, fontWeight: '500' },
  eyeBtn:          { padding: 4 },
  eyeIco:          { fontSize: 17, opacity: 0.5 },
  primaryBtn:     { borderRadius: 14, paddingVertical: 16, alignItems: 'center', backgroundColor: '#D00000', shadowColor: '#D00000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.55, shadowRadius: 14, elevation: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)' },
  btnDisabled:    { opacity: 0.6 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 15.5, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase' },
  forgotRow: { alignSelf: 'flex-end', marginTop: 10, marginBottom: 22 },
  forgotTxt: { color: '#FF4444', fontSize: 13, fontWeight: '600' },
  divRow:    { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  divLine:   { flex: 1, height: 1, backgroundColor: C.grey3 },
  divTxt:    { color: C.grey2, fontSize: 12, fontWeight: '600', marginHorizontal: 12, letterSpacing: 1 },
  ssoBtn:    { borderWidth: 1.5, borderColor: C.grey3, borderRadius: 13, paddingVertical: 15, alignItems: 'center', backgroundColor: C.input },
  ssoBtnTxt: { color: C.grey1, fontSize: 14, fontWeight: '600' },
  footer:     { color: C.grey2, fontSize: 13, textAlign: 'center' },
  footerLink: { color: '#FF4444', fontWeight: '600' },
  hintBox:    { marginTop: 16, backgroundColor: 'rgba(208,0,0,0.1)', borderWidth: 1, borderColor: 'rgba(208,0,0,0.3)', borderRadius: 12, padding: 14, width: '100%' },
  hintTitle:  { color: '#FF4444', fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginBottom: 6 },
  hintTxt:    { color: C.grey1, fontSize: 12, lineHeight: 20 },
  alertBox:  { borderRadius: 10, borderWidth: 1, padding: 11, marginBottom: 14 },
  alertText: { fontSize: 13, fontWeight: '500' },
  backLink: { color: C.grey1, fontSize: 14, fontWeight: '500', textAlign: 'center', paddingVertical: 8 },
  otpLabel:       { fontSize: 13, fontWeight: '600', color: C.grey1, marginBottom: 14, textAlign: 'center', letterSpacing: 0.3 },
  otpRow:         { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 8 },
  otpBox:         { width: (width - 44 - 48 - 50) / 6, height: 54, borderRadius: 12, borderWidth: 2, borderColor: C.grey3, backgroundColor: C.input, color: '#FFFFFF', fontSize: 22, fontWeight: '700', textAlign: 'center' },
  otpBoxFilled:   { borderColor: '#D00000', color: '#FFFFFF' },
  resendRow:      { alignItems: 'center', marginTop: 10 },
  timerTxt:       { color: C.grey1, fontSize: 13 },
  resendTxt:      { color: '#FF4444', fontSize: 13, fontWeight: '600' },
  changeEmailRow: { alignItems: 'center', marginTop: 16 },
  changeEmailTxt: { color: C.grey1, fontSize: 13 },
  warningBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: 'rgba(208,0,0,0.12)', borderWidth: 1, borderColor: 'rgba(208,0,0,0.35)', borderRadius: 13, padding: 14, marginBottom: 16, width: '100%' },
  warningIcon:   { fontSize: 20 },
  warningTitle:  { color: '#FF4444', fontSize: 13, fontWeight: '700', marginBottom: 3 },
  warningTxt:    { color: C.grey1, fontSize: 12, lineHeight: 18 },
  secBadge:    { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: 'rgba(208,0,0,0.1)', borderWidth: 1, borderColor: 'rgba(208,0,0,0.25)', borderRadius: 10, padding: 10, marginBottom: 16 },
  secBadgeIco: { fontSize: 14 },
  secBadgeTxt: { fontSize: 12, color: '#FF8888', fontWeight: '600' },
  strBlock: { marginTop: 9 },
  strBar:   { flexDirection: 'row', gap: 5, marginBottom: 5 },
  strSeg:   { flex: 1, height: 3, borderRadius: 2 },
  strLabel: { fontSize: 11, fontWeight: '700', marginLeft: 2 },
  reqBox:   { backgroundColor: C.input, borderWidth: 1, borderColor: C.cardBorder, borderRadius: 11, padding: 13, marginTop: 10 },
  reqTitle: { fontSize: 11, fontWeight: '700', color: C.grey2, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 9 },
  reqRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 },
  reqDot:   { width: 7, height: 7, borderRadius: 4, backgroundColor: C.grey3 },
  reqTxt:   { fontSize: 12, color: C.grey2 },
  matchTxt: { fontSize: 12, fontWeight: '600', marginTop: 6, marginLeft: 2 },
});
