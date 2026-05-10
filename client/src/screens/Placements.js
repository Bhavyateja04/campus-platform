import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  StatusBar, Dimensions, Animated, Easing, Platform,
  TextInput, Modal, TouchableWithoutFeedback, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// ─── THEME ────────────────────────────────────────────────────────────────────
const C = {
  primary:     '#2563EB',
  primaryDark: '#1E3A8A',
  primaryMid:  '#1D4ED8',
  primaryPale: '#DBEAFE',
  primaryText: '#1E40AF',
  accent:      '#60A5FA',
  bg:          '#F7F9FC',
  surface:     '#FFFFFF',
  textDark:    '#1A1F2E',
  textMid:     '#6B7280',
  textLight:   '#9CA3AF',
  border:      '#E5E7EB',
  green:       '#059669',
  greenPale:   '#D1FAE5',
  orange:      '#D97706',
  orangePale:  '#FEF3C7',
  red:         '#DC2626',
  redPale:     '#FEE2E2',
  gold:        '#F59E0B',
};

const EASE = Easing.bezier(0.22, 1, 0.36, 1);

const useEntrance = (delay = 0, dy = 20) => {
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(dy)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 520, delay, easing: EASE, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 520, delay, easing: EASE, useNativeDriver: true }),
    ]).start();
  }, []);
  return { opacity, transform: [{ translateY }] };
};

// ─── COMPANIES DATA ───────────────────────────────────────────────────────────
const COMPANIES = [
  { id:'tcs',       name:'TCS',        category:'IT Services',        tag:'Mass Recruiter', emoji:'🔵', logoBg:'#EFF6FF', logoColor:'#2563EB', tagBg:'#DBEAFE', tagColor:'#1E40AF', rating:4.1, reviewCount:312, grad:['#1E3A8A','#2563EB'] },
  { id:'infosys',   name:'Infosys',    category:'IT Consulting',      tag:'Top Recruiter',  emoji:'🟢', logoBg:'#ECFDF5', logoColor:'#059669', tagBg:'#D1FAE5', tagColor:'#065F46', rating:4.0, reviewCount:287, grad:['#064E3B','#059669'] },
  { id:'wipro',     name:'Wipro',      category:'IT Services',        tag:'Campus Drive',   emoji:'🟡', logoBg:'#FFFBEB', logoColor:'#D97706', tagBg:'#FEF3C7', tagColor:'#92400E', rating:3.9, reviewCount:198, grad:['#78350F','#D97706'] },
  { id:'accenture', name:'Accenture',  category:'Consulting',         tag:'Dream Company',  emoji:'🟣', logoBg:'#F5F3FF', logoColor:'#7C3AED', tagBg:'#EDE9FE', tagColor:'#5B21B6', rating:4.3, reviewCount:241, grad:['#4C1D95','#7C3AED'] },
  { id:'amazon',    name:'Amazon',     category:'E-Commerce / Cloud', tag:'FAANG',          emoji:'🛒', logoBg:'#FFFBEB', logoColor:'#F59E0B', tagBg:'#FEF3C7', tagColor:'#92400E', rating:4.6, reviewCount:89,  grad:['#92400E','#F59E0B'] },
  { id:'google',    name:'Google',     category:'Big Tech',           tag:'FAANG',          emoji:'🔴', logoBg:'#FEF2F2', logoColor:'#DC2626', tagBg:'#FEE2E2', tagColor:'#991B1B', rating:4.8, reviewCount:67,  grad:['#7F1D1D','#DC2626'] },
  { id:'microsoft', name:'Microsoft',  category:'Big Tech',           tag:'Dream Company',  emoji:'🪟', logoBg:'#EFF6FF', logoColor:'#2563EB', tagBg:'#DBEAFE', tagColor:'#1E40AF', rating:4.7, reviewCount:74,  grad:['#1E3A8A','#3B82F6'] },
  { id:'capgemini', name:'Capgemini',  category:'IT Consulting',      tag:'Mass Recruiter', emoji:'🔷', logoBg:'#EFF6FF', logoColor:'#1D4ED8', tagBg:'#DBEAFE', tagColor:'#1E40AF', rating:3.8, reviewCount:176, grad:['#1E3A8A','#1D4ED8'] },
  { id:'cognizant', name:'Cognizant',  category:'IT Services',        tag:'Campus Drive',   emoji:'🔵', logoBg:'#EFF6FF', logoColor:'#0284C7', tagBg:'#E0F2FE', tagColor:'#075985', rating:3.9, reviewCount:203, grad:['#0C4A6E','#0284C7'] },
  { id:'hcl',       name:'HCL Tech',   category:'IT Services',        tag:'Mass Recruiter', emoji:'🟢', logoBg:'#ECFDF5', logoColor:'#16A34A', tagBg:'#DCFCE7', tagColor:'#14532D', rating:3.7, reviewCount:154, grad:['#14532D','#16A34A'] },
  { id:'deloitte',  name:'Deloitte',   category:'Big 4 Consulting',   tag:'Dream Company',  emoji:'🟢', logoBg:'#ECFDF5', logoColor:'#059669', tagBg:'#D1FAE5', tagColor:'#065F46', rating:4.4, reviewCount:112, grad:['#064E3B','#10B981'] },
  { id:'oracle',    name:'Oracle',     category:'Enterprise Tech',    tag:'Product',        emoji:'🔴', logoBg:'#FEF2F2', logoColor:'#DC2626', tagBg:'#FEE2E2', tagColor:'#991B1B', rating:4.2, reviewCount:98,  grad:['#991B1B','#EF4444'] },
];

const EXPERIENCES = {
  tcs: [
    { id:'t1', name:'Ravi Teja',    initials:'RT', role:'SDE — TCS NQT 2024',  date:'Dec 2024', avatarBg:'#EFF6FF', avatarColor:'#2563EB', difficulty:'Medium', diffBg:'#FEF3C7', diffColor:'#92400E', experience:'The TCS NQT consisted of 3 rounds: Cognitive, Programming, and HR. The cognitive section was time-bound and covered verbal, numerical, and logical reasoning. The programming section had two coding questions — one easy (array manipulation) and one medium (string pattern). HR was very relaxed. Overall, good preparation for 3–4 weeks is sufficient.', tips:'Focus on TCS NQT model papers. Practice aptitude from IndiaBix. For coding, revise arrays, strings, and basic patterns. The HR usually asks about projects, strengths, and "why TCS".' },
    { id:'t2', name:'Priya Sharma', initials:'PS', role:'Digital — TCS 2024',  date:'Nov 2024', avatarBg:'#F5F3FF', avatarColor:'#7C3AED', difficulty:'Easy',   diffBg:'#D1FAE5', diffColor:'#065F46', experience:'I appeared for TCS Digital. It included an advanced coding round with 2 problems — one on dynamic programming and one on graphs. Then a technical interview focusing on DSA, OOPs, DBMS, and OS. The interviewer was friendly and guided when I was stuck. Final HR was straightforward.', tips:'For TCS Digital, strengthen DSA especially DP and graphs. Know DBMS queries and normalization well. Revise OOPs concepts with examples from your project.' },
  ],
  infosys: [
    { id:'i1', name:'Sneha Reddy',  initials:'SR', role:'Systems Engineer 2024', date:'Jan 2025', avatarBg:'#ECFDF5', avatarColor:'#059669', difficulty:'Easy', diffBg:'#D1FAE5', diffColor:'#065F46', experience:'Infosys Instep recruitment was smooth. Online test had verbal ability, reasoning, and a pseudocode section. No hardcore coding. Technical interview covered basic concepts — OOPS, data types, difference between C and C++. Panel was very welcoming and the process moved fast.', tips:'Revise basic programming concepts. OOPs fundamentals are key. Practice pseudocode questions — they are unique to Infosys and need practice.' },
  ],
  wipro: [
    { id:'w1', name:'Divya Rao', initials:'DR', role:'Project Engineer 2024', date:'Dec 2024', avatarBg:'#FFFBEB', avatarColor:'#D97706', difficulty:'Easy', diffBg:'#D1FAE5', diffColor:'#065F46', experience:'Wipro NLTH consisted of an online test and two interviews. The online test covered verbal, aptitude, and a basic coding section. Technical interview asked basic C++ questions and about my internship project. Very chill process overall.', tips:'Practice basic aptitude and verbal. The coding section has easy problems — arrays, strings, basic loops. Know at least one programming language well.' },
  ],
  accenture: [
    { id:'a1', name:'Kavya Nair', initials:'KN', role:'Associate SE 2024', date:'Mar 2025', avatarBg:'#F5F3FF', avatarColor:'#7C3AED', difficulty:'Medium', diffBg:'#FEF3C7', diffColor:'#92400E', experience:'Accenture campus process had 3 rounds: Cognitive + Technical Assessment, Communication Assessment, and HR interview. The cognitive section was standard. Technical assessment covered basic programming, DBMS, and networking. The communication round tested English fluency. HR was conversational.', tips:'The communication round is eliminative — practise speaking English fluently and clearly. For technical, focus on DBMS (SQL queries), networking basics (TCP/IP, DNS), and SDLC.' },
  ],
  amazon: [
    { id:'am1', name:'Sai Varma', initials:'SV', role:'SDE Intern 2024', date:'Aug 2024', avatarBg:'#FFFBEB', avatarColor:'#F59E0B', difficulty:'Hard', diffBg:'#FEE2E2', diffColor:'#991B1B', experience:'Amazon SDE internship interview had 2 online assessment rounds and 2 virtual interviews. OA had DSA problems — medium/hard LeetCode level. Virtual interviews included LP (Leadership Principle) questions and live coding. Every answer has to tie back to an Amazon LP.', tips:'Prepare at least 3 STAR stories per LP — memorise all 16 Leadership Principles. DSA-wise, focus on trees, graphs, sliding window, and DP. Articulate your thought process before coding.' },
  ],
  google: [
    { id:'g1', name:'Nikhil Verma', initials:'NV', role:'SWE Intern 2024', date:'Sep 2024', avatarBg:'#FEF2F2', avatarColor:'#DC2626', difficulty:'Hard', diffBg:'#FEE2E2', diffColor:'#991B1B', experience:'Google intern process: phone screen + 2 virtual interviews. Problems were all medium-hard — graph traversal, segment trees, and a tricky DP problem. Interviewers are very collaborative and give hints. Communication matters more than getting the right answer on first try.', tips:'Grind LeetCode — at least 200 problems, mostly medium. Know time/space complexity by heart. Practice on Google Docs (no IDE hints). Talk through every step before writing code.' },
  ],
  microsoft: [
    { id:'ms1', name:'Teja Varma', initials:'TV', role:'SWE Intern 2024', date:'Oct 2024', avatarBg:'#EFF6FF', avatarColor:'#2563EB', difficulty:'Medium', diffBg:'#FEF3C7', diffColor:'#92400E', experience:"Microsoft intern interview: 2 coding rounds + 1 HR. Coding was straightforward — trees and dynamic programming. Interviewers were friendly and gave helpful hints. They care about clean code and good variable names.", tips:"Microsoft values clean, readable code. Don't sacrifice readability for cleverness. Be enthusiastic about the product/team you're interviewing for." },
  ],
  capgemini: [
    { id:'cap1', name:'Vikram Rao', initials:'VR', role:'Analyst 2024', date:'Nov 2024', avatarBg:'#EFF6FF', avatarColor:'#1D4ED8', difficulty:'Easy', diffBg:'#D1FAE5', diffColor:'#065F46', experience:'Capgemini process was 4 rounds: Game-based assessment, Behavioral, Technical, and HR. The game-based assessment was unique — puzzles, cognitive tests. Technical asked basic programming, data structures, and SQL. Very relaxed overall atmosphere.', tips:"The game-based assessment is unique — play practice games at assessmentday.co.uk. Technical round is basic — just know sorting, searching, and SQL fundamentals." },
  ],
  cognizant: [
    { id:'co1', name:'Deepa Nair', initials:'DN', role:'Programmer Analyst 2024', date:'Dec 2024', avatarBg:'#E0F2FE', avatarColor:'#0284C7', difficulty:'Medium', diffBg:'#FEF3C7', diffColor:'#92400E', experience:'Cognizant GenC process included online assessment and 2 interviews. OA had aptitude and coding sections (2 easy problems). Technical interview covered basic OOPs, DBMS, and asked me to write a simple program. Timeline from test to offer was about 6 weeks.', tips:'Prepare OOPs — inheritance, polymorphism, encapsulation with real examples. DBMS joins and transactions are commonly asked. Practice easy LeetCode to stay sharp on coding basics.' },
  ],
  hcl: [
    { id:'h1', name:'Chandra Sekhar', initials:'CS', role:'Engineer — HCL 2024', date:'Oct 2024', avatarBg:'#ECFDF5', avatarColor:'#16A34A', difficulty:'Easy', diffBg:'#D1FAE5', diffColor:'#065F46', experience:'HCL graduate drives were straightforward. Written test with aptitude and coding. Technical round focused on basics and my projects. HR asked about relocation and shift timings. Process was fast and transparent.', tips:'Know your resume well. HCL often gives puzzles in the technical round — practice logical puzzles. Be open about flexibility in the HR round.' },
  ],
  deloitte: [
    { id:'d1', name:'Radha Krishna', initials:'RK', role:'Business Analyst 2024', date:'Feb 2025', avatarBg:'#ECFDF5', avatarColor:'#059669', difficulty:'Medium', diffBg:'#FEF3C7', diffColor:'#92400E', experience:'Deloitte campus process: group discussion, technical interview, and HR. GD topic was "Impact of AI on jobs". Technical asked SQL, basic programming, and a small case study. HR was professional and asked about long-term career goals. The GD round is eliminative.', tips:'Prepare for GDs by reading current affairs. For Deloitte, communication skills matter as much as technical. SQL is important — practice complex queries.' },
  ],
  oracle: [
    { id:'or1', name:'Pavithra S', initials:'PS', role:'Associate Consultant 2024', date:'Mar 2025', avatarBg:'#FEF2F2', avatarColor:'#DC2626', difficulty:'Hard', diffBg:'#FEE2E2', diffColor:'#991B1B', experience:'Oracle campus process had 4 rounds. Online test was medium-hard with DSA and database questions. Technical round 1 was pure DSA — trees and graphs. Technical round 2 went deep into DBMS, OS, and networks. HR was relaxed. Very thorough process.', tips:'Oracle values strong CS fundamentals. OS concepts like scheduling, memory management, and process synchronization are asked in depth. DBMS — indexing, transactions, isolation levels.' },
  ],
};

// ─── STARS ────────────────────────────────────────────────────────────────────
const Stars = ({ rating, size = 12 }) => (
  <View style={{ flexDirection:'row', gap:2 }}>
    {[1,2,3,4,5].map(i => (
      <Ionicons key={i} name={i <= Math.round(rating) ? 'star' : 'star-outline'} size={size} color={C.gold} />
    ))}
  </View>
);

// ─── EXPERIENCE CARD ──────────────────────────────────────────────────────────
const ExperienceCard = ({ exp, index }) => {
  const [expanded, setExpanded] = useState(false);
  const anim = useEntrance(index * 80, 16);
  return (
    <Animated.View style={[anim, EC.card]}>
      <View style={EC.header}>
        <View style={[EC.avatar, { backgroundColor: exp.avatarBg }]}>
          <Text style={[EC.avatarT, { color: exp.avatarColor }]}>{exp.initials}</Text>
        </View>
        <View style={{ flex:1 }}>
          <Text style={EC.name}>{exp.name}</Text>
          <Text style={EC.role}>{exp.role}</Text>
        </View>
        <View style={{ alignItems:'flex-end', gap:5 }}>
          <View style={EC.datePill}><Text style={EC.dateTxt}>{exp.date}</Text></View>
          <View style={[EC.diffPill, { backgroundColor:exp.diffBg }]}>
            <Text style={[EC.diffTxt, { color:exp.diffColor }]}>{exp.difficulty}</Text>
          </View>
        </View>
      </View>
      <Text style={EC.preview} numberOfLines={expanded ? undefined : 3}>{exp.experience}</Text>
      <TouchableOpacity style={EC.toggle} onPress={() => setExpanded(p => !p)} activeOpacity={0.7}>
        <Text style={EC.toggleTxt}>{expanded ? 'Show less ▲' : 'Read full experience ▼'}</Text>
      </TouchableOpacity>
      {expanded && (
        <View style={EC.tipsBox}>
          <Text style={EC.tipsLabel}>💡  Preparation Tips</Text>
          <Text style={EC.tipsTxt}>{exp.tips}</Text>
        </View>
      )}
    </Animated.View>
  );
};
const EC = StyleSheet.create({
  card:     { backgroundColor:C.surface, borderRadius:18, marginBottom:12, padding:16, borderWidth:1, borderColor:'rgba(37,99,235,0.08)', shadowColor:C.primary+'18', shadowOffset:{width:0,height:2}, shadowOpacity:1, shadowRadius:8, elevation:3 },
  header:   { flexDirection:'row', alignItems:'center', gap:12, marginBottom:10 },
  avatar:   { width:44, height:44, borderRadius:14, justifyContent:'center', alignItems:'center' },
  avatarT:  { fontWeight:'800', fontSize:13 },
  name:     { fontSize:14, fontWeight:'700', color:C.textDark },
  role:     { fontSize:11, color:C.textMid, marginTop:1 },
  datePill: { backgroundColor:'#F3F4F6', borderRadius:8, paddingHorizontal:8, paddingVertical:3 },
  dateTxt:  { fontSize:10, color:C.textMid, fontWeight:'600' },
  diffPill: { borderRadius:8, paddingHorizontal:8, paddingVertical:3 },
  diffTxt:  { fontSize:10, fontWeight:'700' },
  preview:  { fontSize:13, color:'#4B5563', lineHeight:20, marginBottom:8 },
  toggle:   { paddingVertical:4 },
  toggleTxt:{ fontSize:12, fontWeight:'700', color:C.primary },
  tipsBox:  { backgroundColor:'#EFF6FF', borderRadius:12, padding:14, marginTop:10, borderLeftWidth:3, borderLeftColor:C.primary },
  tipsLabel:{ fontSize:11, fontWeight:'700', color:C.primary, letterSpacing:0.5, textTransform:'uppercase', marginBottom:6 },
  tipsTxt:  { fontSize:13, color:'#1E40AF', lineHeight:20 },
});

// ─── UPLOAD EXPERIENCE MODAL ──────────────────────────────────────────────────
const COMPANY_NAMES = COMPANIES.map(c => c.name);
const DIFFICULTY_OPTIONS = ['Easy', 'Medium', 'Hard'];

const UploadModal = ({ onClose }) => {
  const slideY = useRef(new Animated.Value(height)).current;
  const [name,        setName]        = useState('');
  const [role,        setRole]        = useState('');
  const [company,     setCompany]     = useState('');
  const [difficulty,  setDifficulty]  = useState('');
  const [experience,  setExperience]  = useState('');
  const [tips,        setTips]        = useState('');
  const [showCompDrop, setShowCompDrop] = useState(false);

  useEffect(() => {
    Animated.spring(slideY, { toValue:0, speed:18, bounciness:4, useNativeDriver:true }).start();
  }, []);

  const close = () => {
    Animated.timing(slideY, { toValue:height, duration:280, easing:EASE, useNativeDriver:true }).start(onClose);
  };

  const handleSubmit = () => {
    if (!name.trim() || !role.trim() || !company || !difficulty || !experience.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all required fields before submitting.');
      return;
    }
    Alert.alert('✅ Submitted!', 'Your experience has been submitted for review. Thank you for helping juniors!', [
      { text: 'OK', onPress: close }
    ]);
  };

  return (
    <Modal transparent animationType="none" onRequestClose={close}>
      <TouchableWithoutFeedback onPress={close}>
        <View style={UM.overlay} />
      </TouchableWithoutFeedback>

      <Animated.View style={[UM.sheet, { transform:[{ translateY:slideY }] }]}>
        <View style={UM.handle} />

        {/* Header */}
        <LinearGradient colors={['#1E3A8A','#2563EB']} style={UM.modalHeader}>
          <View>
            <Text style={UM.modalTitle}>Share Your Experience</Text>
            <Text style={UM.modalSub}>Help your juniors crack interviews 🎯</Text>
          </View>
          <TouchableOpacity style={UM.closeBtn} onPress={close} activeOpacity={0.8}>
            <Ionicons name="close" size={18} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView
          style={UM.scroll}
          contentContainerStyle={{ paddingBottom:40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Your Name */}
          <Text style={UM.label}>Your Name <Text style={UM.required}>*</Text></Text>
          <TextInput
            style={UM.input}
            placeholder="e.g. Ravi Teja"
            placeholderTextColor={C.textLight}
            value={name}
            onChangeText={setName}
          />

          {/* Role / Position */}
          <Text style={UM.label}>Role / Position <Text style={UM.required}>*</Text></Text>
          <TextInput
            style={UM.input}
            placeholder="e.g. SDE — TCS NQT 2024"
            placeholderTextColor={C.textLight}
            value={role}
            onChangeText={setRole}
          />

          {/* Company Picker */}
          <Text style={UM.label}>Company <Text style={UM.required}>*</Text></Text>
          <TouchableOpacity
            style={[UM.input, UM.picker]}
            onPress={() => setShowCompDrop(p => !p)}
            activeOpacity={0.8}
          >
            <Text style={[UM.pickerTxt, !company && { color:C.textLight }]}>
              {company || 'Select a company'}
            </Text>
            <Ionicons name={showCompDrop ? 'chevron-up' : 'chevron-down'} size={16} color={C.textLight} />
          </TouchableOpacity>
          {showCompDrop && (
            <View style={UM.dropdown}>
              <ScrollView style={{ maxHeight:180 }} nestedScrollEnabled>
                {COMPANY_NAMES.map(cn => (
                  <TouchableOpacity
                    key={cn}
                    style={[UM.dropItem, company === cn && UM.dropItemActive]}
                    onPress={() => { setCompany(cn); setShowCompDrop(false); }}
                    activeOpacity={0.75}
                  >
                    <Text style={[UM.dropItemTxt, company === cn && { color:C.primary, fontWeight:'700' }]}>{cn}</Text>
                    {company === cn && <Ionicons name="checkmark" size={14} color={C.primary} />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Difficulty */}
          <Text style={UM.label}>Difficulty <Text style={UM.required}>*</Text></Text>
          <View style={UM.diffRow}>
            {DIFFICULTY_OPTIONS.map(d => {
              const colors = { Easy:['#D1FAE5','#059669'], Medium:['#FEF3C7','#D97706'], Hard:['#FEE2E2','#DC2626'] };
              const [bg, fg] = colors[d];
              const active = difficulty === d;
              return (
                <TouchableOpacity
                  key={d}
                  style={[UM.diffChip, active && { backgroundColor:bg, borderColor:fg }]}
                  onPress={() => setDifficulty(d)}
                  activeOpacity={0.8}
                >
                  <Text style={[UM.diffChipTxt, active && { color:fg }]}>{d}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Interview Experience */}
          <Text style={UM.label}>Interview Experience <Text style={UM.required}>*</Text></Text>
          <TextInput
            style={[UM.input, UM.textarea]}
            placeholder="Describe the rounds, questions asked, atmosphere..."
            placeholderTextColor={C.textLight}
            value={experience}
            onChangeText={setExperience}
            multiline
            textAlignVertical="top"
          />

          {/* Preparation Tips */}
          <Text style={UM.label}>Preparation Tips <Text style={UM.optional}>(optional)</Text></Text>
          <TextInput
            style={[UM.input, UM.textarea]}
            placeholder="Share what helped you prepare — resources, topics, strategies..."
            placeholderTextColor={C.textLight}
            value={tips}
            onChangeText={setTips}
            multiline
            textAlignVertical="top"
          />

          {/* Submit */}
          <TouchableOpacity onPress={handleSubmit} activeOpacity={0.88} style={{ marginTop:8 }}>
            <LinearGradient colors={['#1E3A8A','#2563EB']} style={UM.submitBtn}>
              <Ionicons name="cloud-upload-outline" size={18} color="#fff" />
              <Text style={UM.submitTxt}>Submit Experience</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={UM.disclaimer}>
            Your submission will be reviewed before publishing. We never share your personal details without consent.
          </Text>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
};

const UM = StyleSheet.create({
  overlay:     { ...StyleSheet.absoluteFillObject, backgroundColor:'rgba(15,23,42,0.55)' },
  sheet:       { position:'absolute', bottom:0, left:0, right:0, backgroundColor:'#F7F9FC', borderTopLeftRadius:24, borderTopRightRadius:24, maxHeight:height*0.92, paddingBottom: Platform.OS==='ios'?20:0 },
  handle:      { width:36, height:4, borderRadius:2, backgroundColor:'#D1D5DB', alignSelf:'center', marginTop:12, marginBottom:0 },
  modalHeader: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:20, paddingVertical:18 },
  modalTitle:  { fontSize:17, fontWeight:'800', color:'#fff' },
  modalSub:    { fontSize:12, color:'rgba(255,255,255,0.72)', marginTop:3 },
  closeBtn:    { width:32, height:32, borderRadius:10, backgroundColor:'rgba(255,255,255,0.2)', justifyContent:'center', alignItems:'center' },
  scroll:      { padding:16 },
  label:       { fontSize:13, fontWeight:'700', color:C.textDark, marginBottom:6, marginTop:14 },
  required:    { color:C.red },
  optional:    { fontSize:11, color:C.textLight, fontWeight:'400' },
  input:       { backgroundColor:C.surface, borderRadius:14, borderWidth:1, borderColor:C.border, paddingHorizontal:14, paddingVertical:12, fontSize:14, color:C.textDark },
  textarea:    { minHeight:100, paddingTop:12 },
  picker:      { flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  pickerTxt:   { fontSize:14, color:C.textDark, flex:1 },
  dropdown:    { backgroundColor:C.surface, borderRadius:14, borderWidth:1, borderColor:C.border, marginTop:4, overflow:'hidden' },
  dropItem:    { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:14, paddingVertical:11, borderBottomWidth:1, borderBottomColor:C.border },
  dropItemActive:{ backgroundColor:'#EFF6FF' },
  dropItemTxt: { fontSize:14, color:C.textDark },
  diffRow:     { flexDirection:'row', gap:10 },
  diffChip:    { flex:1, paddingVertical:10, borderRadius:12, borderWidth:1.5, borderColor:C.border, alignItems:'center', backgroundColor:C.surface },
  diffChipTxt: { fontSize:13, fontWeight:'600', color:C.textMid },
  submitBtn:   { flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, borderRadius:16, paddingVertical:16 },
  submitTxt:   { fontSize:16, fontWeight:'800', color:'#fff' },
  disclaimer:  { fontSize:11, color:C.textLight, textAlign:'center', marginTop:14, lineHeight:16 },
});

// ─── BOTTOM SHEET (experiences viewer) ───────────────────────────────────────
const BottomSheet = ({ company, onClose }) => {
  const slideY = useRef(new Animated.Value(height)).current;
  const exps   = EXPERIENCES[company.id] || [];
  useEffect(() => {
    Animated.spring(slideY, { toValue:0, speed:18, bounciness:4, useNativeDriver:true }).start();
  }, []);
  const close = () => {
    Animated.timing(slideY, { toValue:height, duration:280, easing:EASE, useNativeDriver:true }).start(onClose);
  };
  return (
    <Modal transparent animationType="none" onRequestClose={close}>
      <TouchableWithoutFeedback onPress={close}>
        <View style={BS.overlay} />
      </TouchableWithoutFeedback>
      <Animated.View style={[BS.sheet, { transform:[{ translateY:slideY }] }]}>
        <View style={BS.handle} />
        <View style={BS.header}>
          <View style={{ flexDirection:'row', alignItems:'center', gap:12, flex:1 }}>
            <LinearGradient colors={company.grad} style={BS.logoBox}>
              <Text style={BS.logoEmoji}>{company.emoji}</Text>
            </LinearGradient>
            <View>
              <Text style={BS.companyName}>{company.name}</Text>
              <Text style={BS.expCount}>{exps.length} student experience{exps.length !== 1 ? 's' : ''}</Text>
            </View>
          </View>
          <TouchableOpacity style={BS.closeBtn} onPress={close} activeOpacity={0.8}>
            <Ionicons name="close" size={18} color={C.textMid} />
          </TouchableOpacity>
        </View>
        <ScrollView style={BS.scroll} contentContainerStyle={{ paddingBottom:36 }} showsVerticalScrollIndicator={false}>
          {exps.length === 0 ? (
            <View style={BS.empty}>
              <Text style={BS.emptyIcon}>📭</Text>
              <Text style={BS.emptyTitle}>No experiences yet</Text>
              <Text style={BS.emptySub}>Be the first to share!</Text>
            </View>
          ) : exps.map((exp, i) => (
            <ExperienceCard key={exp.id} exp={exp} index={i} />
          ))}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
};
const BS = StyleSheet.create({
  overlay:     { ...StyleSheet.absoluteFillObject, backgroundColor:'rgba(15,23,42,0.55)' },
  sheet:       { position:'absolute', bottom:0, left:0, right:0, backgroundColor:'#F7F9FC', borderTopLeftRadius:24, borderTopRightRadius:24, maxHeight:height*0.88, paddingBottom:Platform.OS==='ios'?20:0 },
  handle:      { width:36, height:4, borderRadius:2, backgroundColor:'#D1D5DB', alignSelf:'center', marginTop:12, marginBottom:4 },
  header:      { flexDirection:'row', alignItems:'center', paddingHorizontal:20, paddingVertical:16, borderBottomWidth:1, borderBottomColor:C.border, backgroundColor:C.surface },
  logoBox:     { width:44, height:44, borderRadius:13, justifyContent:'center', alignItems:'center' },
  logoEmoji:   { fontSize:20 },
  companyName: { fontSize:17, fontWeight:'800', color:C.textDark },
  expCount:    { fontSize:12, color:C.textMid, marginTop:2 },
  closeBtn:    { width:32, height:32, borderRadius:10, backgroundColor:'#F3F4F6', justifyContent:'center', alignItems:'center' },
  scroll:      { padding:16 },
  empty:       { alignItems:'center', paddingTop:60, gap:10 },
  emptyIcon:   { fontSize:44 },
  emptyTitle:  { fontSize:16, fontWeight:'700', color:C.textDark },
  emptySub:    { fontSize:13, color:C.textLight },
});

// ─── COMPANY CARD ──────────────────────────────────────────────────────────────
const HCompanyCard = ({ company, onPress, index }) => {
  const anim  = useEntrance(index * 60, 18);
  const press = useRef(new Animated.Value(1)).current;
  const onIn  = () => Animated.spring(press, { toValue:0.97, speed:22, useNativeDriver:true }).start();
  const onOut = () => Animated.spring(press, { toValue:1,    speed:16, useNativeDriver:true }).start();
  return (
    <Animated.View style={[anim, { transform:[...anim.transform, { scale:press }] }]}>
      <TouchableOpacity onPressIn={onIn} onPressOut={onOut} onPress={() => onPress(company)} activeOpacity={1} style={HC.card}>
        <LinearGradient colors={company.grad} style={HC.logoBox}>
          <Text style={HC.logoEmoji}>{company.emoji}</Text>
        </LinearGradient>
        <View style={HC.info}>
          <View style={[HC.tag, { backgroundColor:company.tagBg }]}>
            <Text style={[HC.tagTxt, { color:company.tagColor }]}>{company.tag}</Text>
          </View>
          <Text style={HC.name}>{company.name}</Text>
          <Text style={HC.category}>{company.category}</Text>
          <View style={HC.ratingRow}>
            <Stars rating={company.rating} size={11} />
            <Text style={HC.ratingVal}>{company.rating}</Text>
            <Text style={HC.dot}>·</Text>
            <Text style={HC.reviews}>{company.reviewCount} reviews</Text>
          </View>
        </View>
        <View style={HC.ctaCol}>
          <LinearGradient colors={[C.primary, C.primaryDark]} style={HC.ctaBtn}>
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </LinearGradient>
          <Text style={HC.ctaTxt}>View</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};
const HC = StyleSheet.create({
  card:      { flexDirection:'row', alignItems:'center', backgroundColor:C.surface, borderRadius:20, marginBottom:12, padding:14, gap:14, borderWidth:1, borderColor:'rgba(37,99,235,0.07)', shadowColor:C.primary+'18', shadowOffset:{width:0,height:3}, shadowOpacity:1, shadowRadius:10, elevation:4 },
  logoBox:   { width:56, height:56, borderRadius:16, justifyContent:'center', alignItems:'center', flexShrink:0 },
  logoEmoji: { fontSize:24 },
  info:      { flex:1, gap:3 },
  tag:       { alignSelf:'flex-start', borderRadius:7, paddingHorizontal:7, paddingVertical:2, marginBottom:2 },
  tagTxt:    { fontSize:9, fontWeight:'700', letterSpacing:0.5, textTransform:'uppercase' },
  name:      { fontSize:16, fontWeight:'800', color:C.textDark, lineHeight:20 },
  category:  { fontSize:11, color:C.textLight },
  ratingRow: { flexDirection:'row', alignItems:'center', gap:5, marginTop:3 },
  ratingVal: { fontSize:12, fontWeight:'700', color:C.textDark },
  dot:       { fontSize:12, color:C.textLight },
  reviews:   { fontSize:11, color:C.textLight },
  ctaCol:    { alignItems:'center', gap:4, flexShrink:0 },
  ctaBtn:    { width:36, height:36, borderRadius:12, justifyContent:'center', alignItems:'center' },
  ctaTxt:    { fontSize:10, fontWeight:'700', color:C.primary },
});

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
export default function PlacementsScreen({ navigation }) {
  const SB_H = Platform.OS==='ios' ? 44 : (StatusBar.currentHeight||24);
  const [search,           setSearch]           = useState('');
  const [selectedCompany,  setSelectedCompany]  = useState(null);
  const [showUpload,       setShowUpload]        = useState(false);

  const headerAnim = useEntrance(0, -16);
  const statsAnim  = useEntrance(120, 14);
  const searchAnim = useEntrance(220, 14);
  const listAnim   = useEntrance(300, 18);

  const filtered = COMPANIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase()) ||
    c.tag.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={S.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom:110 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── GRADIENT HEADER ── */}
        <Animated.View style={headerAnim}>
          <LinearGradient
            colors={['#1E3A8A','#2563EB','#3B82F6']}
            start={{ x:0.1, y:0 }} end={{ x:0.9, y:1 }}
            style={[S.header, { paddingTop: SB_H + 12 }]}
          >
            <View style={S.deco1} />
            <View style={S.deco2} />
            <View style={S.deco3} />

            <View style={S.topRow}>
              <TouchableOpacity style={S.backBtn} onPress={() => navigation?.goBack()} activeOpacity={0.8}>
                <Ionicons name="arrow-back-outline" size={22} color="#fff" />
              </TouchableOpacity>
              <View style={{ flex:1 }}>
                <Text style={S.subLabel}>🎓  Campus Placement Hub</Text>
                <Text style={S.headerTitle}>PlacePrep</Text>
                <Text style={S.headerSub}>Real interview stories from seniors</Text>
              </View>
            </View>

            {/* Stats strip — Experiences | Students | Placed */}
            <Animated.View style={[statsAnim, S.statsRow]}>
              {[
                { label:'Experiences', value:'1,532'             },
                { label:'Companies',   value:`${COMPANIES.length}` },
                { label:'Placed',      value:'620+'              },
              ].map((st, i) => (
                <View key={i} style={[S.statBox, i < 2 && S.statBorderR]}>
                  <Text style={S.statVal}>{st.value}</Text>
                  <Text style={S.statLbl}>{st.label}</Text>
                </View>
              ))}
            </Animated.View>

            {/* Search */}
            <Animated.View style={[searchAnim, S.searchWrap]}>
              <Ionicons name="search-outline" size={17} color={C.textLight} style={S.searchIcon} />
              <TextInput
                style={S.searchInput}
                placeholder="Search companies, roles, tags..."
                placeholderTextColor={C.textLight}
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')} style={S.searchClear}>
                  <Ionicons name="close-circle" size={17} color={C.textLight} />
                </TouchableOpacity>
              )}
            </Animated.View>
          </LinearGradient>
        </Animated.View>

        {/* ── SECTION LABEL + UPLOAD BUTTON ── */}
        <Animated.View style={[listAnim, S.sectionHeader]}>
          <View>
            <Text style={S.sectionTitle}>{search ? `Results for "${search}"` : 'Top Companies'}</Text>
            <View style={S.countChipRow}>
              <View style={S.countChip}>
                <Text style={S.countChipTxt}>{filtered.length} found</Text>
              </View>
            </View>
          </View>
          {/* Upload Experience CTA */}
          <TouchableOpacity style={S.uploadBtn} onPress={() => setShowUpload(true)} activeOpacity={0.85}>
            <LinearGradient colors={['#1E3A8A','#2563EB']} style={S.uploadBtnInner}>
              <Ionicons name="add-circle-outline" size={15} color="#fff" />
              <Text style={S.uploadBtnTxt}>Share</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* ── COMPANY LIST ── */}
        <Animated.View style={[listAnim, S.listContainer]}>
          {filtered.length === 0 ? (
            <View style={S.empty}>
              <Text style={S.emptyIcon}>🔍</Text>
              <Text style={S.emptyTitle}>No companies found</Text>
              <Text style={S.emptySub}>Try "TCS", "FAANG", or "IT Services"</Text>
              <TouchableOpacity style={S.clearBtn} onPress={() => setSearch('')} activeOpacity={0.85}>
                <Text style={S.clearBtnTxt}>Clear Search</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filtered.map((company, index) => (
              <HCompanyCard key={company.id} company={company} onPress={setSelectedCompany} index={index} />
            ))
          )}
        </Animated.View>
      </ScrollView>

      {/* ── EXPERIENCE VIEWER BOTTOM SHEET ── */}
      {selectedCompany && (
        <BottomSheet company={selectedCompany} onClose={() => setSelectedCompany(null)} />
      )}

      {/* ── UPLOAD EXPERIENCE MODAL ── */}
      {showUpload && (
        <UploadModal onClose={() => setShowUpload(false)} />
      )}
    </View>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  root: { flex:1, backgroundColor:C.bg },

  header:    { paddingHorizontal:20, paddingBottom:22, position:'relative', overflow:'hidden' },
  deco1:     { position:'absolute', top:-30, right:-30, width:120, height:120, borderRadius:60, backgroundColor:'rgba(255,255,255,0.06)' },
  deco2:     { position:'absolute', bottom:-40, left:-20, width:100, height:100, borderRadius:50, backgroundColor:'rgba(255,255,255,0.04)' },
  deco3:     { position:'absolute', top:20, right:60, width:60, height:60, borderRadius:30, backgroundColor:'rgba(96,165,250,0.15)' },

  topRow:    { flexDirection:'row', alignItems:'flex-start', marginBottom:18, gap:12 },
  backBtn:   { width:38, height:38, borderRadius:19, backgroundColor:'rgba(255,255,255,0.18)', justifyContent:'center', alignItems:'center', marginTop:2 },
  subLabel:  { fontSize:11, color:'rgba(255,255,255,0.65)', fontWeight:'600', letterSpacing:0.8, textTransform:'uppercase', marginBottom:4 },

  // New: title row with inline companies count
  titleRow:       { flexDirection:'row', alignItems:'center', gap:10, flexWrap:'wrap' },
  headerTitle:    { fontSize:26, fontWeight:'800', color:'#fff', lineHeight:30 },
  inlineCountBadge:{ flexDirection:'row', alignItems:'center', backgroundColor:'rgba(255,255,255,0.20)', borderRadius:10, paddingHorizontal:10, paddingVertical:5, borderWidth:1, borderColor:'rgba(255,255,255,0.28)', alignSelf:'center', gap:2 },
  inlineCountVal:  { fontSize:12, fontWeight:'800', color:'#fff' },
  inlineCountLbl:  { fontSize:11, color:'rgba(255,255,255,0.85)', fontWeight:'600' },
  inlineCountSep:  { fontSize:11, color:'rgba(255,255,255,0.65)', fontWeight:'500' },

  headerSub: { fontSize:13, color:'rgba(255,255,255,0.70)', marginTop:4 },

  statsRow:   { flexDirection:'row', backgroundColor:'rgba(255,255,255,0.12)', borderRadius:16, marginBottom:16, overflow:'hidden' },
  statBox:    { flex:1, paddingVertical:10, alignItems:'center' },
  statBorderR:{ borderRightWidth:1, borderRightColor:'rgba(255,255,255,0.18)' },
  statVal:    { fontSize:14, fontWeight:'800', color:'#fff' },
  statLbl:    { fontSize:10, color:'rgba(255,255,255,0.65)', marginTop:2 },

  searchWrap: { flexDirection:'row', alignItems:'center', backgroundColor:C.surface, borderRadius:14, paddingHorizontal:14, paddingVertical:11, shadowColor:'#00000018', shadowOffset:{width:0,height:2}, shadowOpacity:1, shadowRadius:8, elevation:3 },
  searchIcon: { marginRight:6 },
  searchInput:{ flex:1, fontSize:14, color:C.textDark, padding:0 },
  searchClear:{ marginLeft:8 },

  sectionHeader:  { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:16, paddingTop:20, paddingBottom:12 },
  sectionTitle:   { fontSize:16, fontWeight:'800', color:C.textDark },
  countChipRow:   { flexDirection:'row', marginTop:4 },
  countChip:      { backgroundColor:C.primaryPale, borderRadius:10, paddingHorizontal:10, paddingVertical:4, alignSelf:'flex-start' },
  countChipTxt:   { fontSize:11, fontWeight:'700', color:C.primaryText },

  uploadBtn:      { borderRadius:12, overflow:'hidden' },
  uploadBtnInner: { flexDirection:'row', alignItems:'center', gap:5, paddingHorizontal:14, paddingVertical:10 },
  uploadBtnTxt:   { fontSize:13, fontWeight:'700', color:'#fff' },

  listContainer: { paddingHorizontal:16 },

  empty:      { alignItems:'center', paddingTop:60, gap:10 },
  emptyIcon:  { fontSize:48 },
  emptyTitle: { fontSize:18, fontWeight:'700', color:C.textDark },
  emptySub:   { fontSize:14, color:C.textLight },
  clearBtn:   { marginTop:10, backgroundColor:C.primary, borderRadius:12, paddingHorizontal:24, paddingVertical:12 },
  clearBtnTxt:{ color:'#fff', fontWeight:'700', fontSize:14 },
});