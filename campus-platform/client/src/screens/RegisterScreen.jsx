import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  StatusBar, KeyboardAvoidingView, Platform, ScrollView, Alert,
  ActivityIndicator,
} from 'react-native';

import { authApi, setSession } from '../services/api';

const C = {
  bg:          '#1A0000',
  card:        '#2A0000',
  cardBorder:  '#4A0000',
  input:       '#1F0000',
  inputBorder: '#5A0000',
  primary:     '#D00000',
  primaryDark: '#900000',
  white:       '#FFFFFF',
  grey1:       '#FFBBBB',
  grey2:       '#CC6666',
  red:         '#FF3333',
};

const ALLOWED_DOMAINS = /@(acet|aec|aus)\.ac\.in$/i;

function Field({ label, value, onChangeText, placeholder, secure = false, keyboardType = 'default', autoCapitalize = 'none' }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={s.fieldLabel}>{label}</Text>
      <TextInput
        style={s.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.grey2}
        secureTextEntry={secure}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
      />
    </View>
  );
}

export default function RegisterScreen({ navigation }) {
  const [name,        setName]        = useState('');
  const [email,       setEmail]       = useState('');
  const [rollNumber,  setRollNumber]  = useState('');
  const [phone,       setPhone]       = useState('');
  const [department,  setDepartment]  = useState('');
  const [password,    setPassword]    = useState('');
  const [confirmPwd,  setConfirmPwd]  = useState('');
  const [loading,     setLoading]     = useState(false);
  const [err,         setErr]         = useState('');

  const onRegister = async () => {
    setErr('');
    if (!name.trim())                          return setErr('Please enter your full name.');
    if (!email.trim() || !ALLOWED_DOMAINS.test(email.trim()))
      return setErr('Email must end with @acet.ac.in, @aec.ac.in, or @aus.ac.in');
    if (!rollNumber.trim())                    return setErr('Please enter your roll number.');
    if (!password || password.length < 6)      return setErr('Password must be at least 6 characters.');
    if (password !== confirmPwd)               return setErr('Passwords do not match.');

    setLoading(true);
    try {
      const data = await authApi.register({
        name: name.trim(),
        email: email.trim(),
        rollNumber: rollNumber.trim(),
        password,
        phone: phone.trim() || undefined,
        department: department.trim() || undefined,
      });

      if (data?.token) {
        await setSession({ token: data.token, role: data.role, user: data.user });
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      } else {
        setErr(data?.message || 'Registration succeeded but no session token was returned.');
      }
    } catch (error) {
      setErr(error?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={s.container}>
          <Text style={s.title}>Create your account</Text>
          <Text style={s.subtitle}>Aditya University students only — use your @aus.ac.in / @aec.ac.in / @acet.ac.in email.</Text>

          <View style={s.card}>
            <Field label="Full Name"        value={name}       onChangeText={setName}       placeholder="e.g. Varshitha Reddy" autoCapitalize="words" />
            <Field label="University Email" value={email}      onChangeText={setEmail}      placeholder="varshitha@aus.ac.in"   keyboardType="email-address" />
            <Field label="Roll Number"      value={rollNumber} onChangeText={setRollNumber} placeholder="22CSE1042" />
            <Field label="Phone (optional)" value={phone}      onChangeText={setPhone}      placeholder="9876543210" keyboardType="phone-pad" />
            <Field label="Department (optional)" value={department} onChangeText={setDepartment} placeholder="CSE" autoCapitalize="characters" />
            <Field label="Password (min 6 chars)" value={password}   onChangeText={setPassword}   placeholder="••••••••" secure />
            <Field label="Confirm Password"        value={confirmPwd} onChangeText={setConfirmPwd} placeholder="••••••••" secure />

            {!!err && <Text style={s.err}>{err}</Text>}

            <TouchableOpacity style={s.btn} onPress={onRegister} disabled={loading} activeOpacity={0.85}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.btnText}>Create Account</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 16, alignSelf: 'center' }}>
              <Text style={{ color: C.grey1 }}>Already have an account? <Text style={{ fontWeight: '800', color: C.white }}>Log in</Text></Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  scroll:    { flexGrow: 1, backgroundColor: C.bg },
  container: { flex: 1, paddingHorizontal: 22, paddingTop: 64, paddingBottom: 40 },
  title:     { color: C.white, fontSize: 26, fontWeight: '900' },
  subtitle:  { color: C.grey1, fontSize: 13, marginTop: 6, marginBottom: 22 },
  card:      { backgroundColor: C.card, borderColor: C.cardBorder, borderWidth: 1, borderRadius: 18, padding: 18 },
  fieldLabel:{ color: C.grey1, fontSize: 12, fontWeight: '700', marginBottom: 6 },
  input:     { backgroundColor: C.input, borderColor: C.inputBorder, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 14 : 10, color: C.white, fontSize: 15 },
  err:       { color: C.red, marginTop: 4, marginBottom: 8, fontSize: 13 },
  btn:       { backgroundColor: C.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  btnText:   { color: C.white, fontWeight: '800', fontSize: 15 },
});
