import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  StatusBar, Dimensions, Animated, Easing, Platform,
  TextInput, Modal, KeyboardAvoidingView,
  TouchableWithoutFeedback, Keyboard, Image, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const { width, height } = Dimensions.get('window');
const CARD_W = (width - 16 * 2 - 10) / 2;

// ─── THEME ────────────────────────────────────────────────────────────────────
const C = {
  primary:      '#6C3CE1',
  primaryDark:  '#4B1FA8',
  primaryLight: '#9B6FF0',
  primaryPale:  '#F0EAFF',
  bg:           '#F8F6FF',
  surface:      '#FFFFFF',
  surfaceAlt:   '#F0EAFF',
  textDark:     '#1A0A3C',
  textMid:      '#4A3880',
  textLight:    '#9B8EC0',
  border:       '#DDD4F8',
  red:          '#E53935',
  redPale:      '#FFF0F0',
  green:        '#1B8A4C',
  greenPale:    '#E8F7EE',
};

const EASE = Easing.bezier(0.22, 1, 0.36, 1);
const ME   = { name: 'Varshitha', rollNo: '22BCE7890' };

const useEntrance = (delay = 0, dy = 18) => {
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

const nowTime = () => { const d = new Date(); let h = d.getHours(), m = d.getMinutes(), a = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return `${h}:${String(m).padStart(2,'0')} ${a}`; };
const nowDate = () => { const d = new Date(); return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`; };

// ─── ICON CATEGORIES ─────────────────────────────────────────────────────────
const ICONS = [
  { icon: 'wallet',         label: 'Wallet',      color: '#C07030', bg: '#FFF3E0' },
  { icon: 'phone-portrait', label: 'Phone',       color: '#1565C0', bg: '#E3F2FD' },
  { icon: 'headset',        label: 'Headphones',  color: '#6C3CE1', bg: '#F0EAFF' },
  { icon: 'key',            label: 'Keys',        color: '#E05252', bg: '#FDEAEA' },
  { icon: 'card',           label: 'ID / Card',   color: '#F0A500', bg: '#FFF4D6' },
  { icon: 'laptop',         label: 'Laptop',      color: '#444',    bg: '#F0F0F0' },
  { icon: 'shirt',          label: 'Clothing',    color: '#6B5EA8', bg: '#EEEAF8' },
  { icon: 'book',           label: 'Books',       color: '#00796B', bg: '#E0F2F1' },
  { icon: 'bag',            label: 'Bag',         color: '#8D4E1F', bg: '#FBF0E8' },
  { icon: 'watch',          label: 'Watch',       color: '#6C3CE1', bg: '#F0EAFF' },
  { icon: 'umbrella',       label: 'Umbrella',    color: '#1565C0', bg: '#E3F2FD' },
  { icon: 'cafe',           label: 'Bottle',      color: '#00796B', bg: '#E0F2F1' },
  { icon: 'pencil',         label: 'Stationery',  color: '#6B5EA8', bg: '#EEEAF8' },
  { icon: 'glasses',        label: 'Glasses',     color: '#333',    bg: '#F5F5F5' },
  { icon: 'musical-notes',  label: 'Earphones',   color: '#E91E63', bg: '#FCE4EC' },
  { icon: 'cube-outline',   label: 'Other',       color: '#4A6560', bg: '#EFF4F3' },
];

// ─── REAL PRODUCT IMAGES (Unsplash — reliable & free) ────────────────────────
const IMG = {
  headphones:  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
  wallet:      'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&q=80',
  phone:       'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80',
  keys:        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
  laptop:      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80',
  bag:         'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80',
  watch:       'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
  bottle:      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&q=80',
  jacket:      'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=400&q=80',
  umbrella:    'https://images.unsplash.com/photo-1527540003-4debc444f40f?w=400&q=80',
  idcard:      'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&q=80',
  pencilcase:  'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400&q=80',
  earphones:   'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=400&q=80',
  glasses:     'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400&q=80',
  book:        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80',
  airpods:     'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400&q=80',
  charger:     'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&q=80',
  ring:        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80',
  backpack:    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80',
  notebook:    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
  sonyheadphones: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&q=80',
  smartwatch:  'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&q=80',
};

// ─── RICH SEED DATA — 16 Lost + 16 Found ─────────────────────────────────────
const SEED_LOST = [
  { id:'l01', type:'lost', personName:'Arjun Mehta',    rollNo:'21CSE4501', itemName:'Blue Bose QC45 Headphones',    location:'Central Library, 3rd Floor',      time:'2h ago',  date:'13/03/2026', desc:'Left in Study Room 302. Black carrying case with "AM" written inside lid.',            iconIdx:2,  urgent:true,  createdBy:'21CSE4501', imageUrl: IMG.headphones },
  { id:'l02', type:'lost', personName:ME.name,          rollNo:ME.rollNo,   itemName:'Brown Leather Bifold Wallet',  location:'Student Union Food Court',          time:'1d ago',  date:'12/03/2026', desc:'Brown bifold. Has student ID, ATM card, ₹500 cash. Please return urgently.',          iconIdx:0,  urgent:true,  createdBy:ME.rollNo,   imageUrl: IMG.wallet },
  { id:'l03', type:'lost', personName:'Priya Sharma',   rollNo:'22ECE3302', itemName:'iPhone 14 Pro — Space Black',  location:'Engineering Block B Restroom',      time:'5h ago',  date:'13/03/2026', desc:'No screen protector. Lock screen has a mountain range wallpaper.',                   iconIdx:1,  urgent:true,  createdBy:'22ECE3302', imageUrl: IMG.phone },
  { id:'l04', type:'lost', personName:'Rohit Kumar',    rollNo:'21ME2210',  itemName:'North Face Jacket Black L',    location:'Athletic Center Bench',             time:'2d ago',  date:'11/03/2026', desc:'Black insulated jacket, Size L. Left on bench outside the gym.',                    iconIdx:6,  urgent:false, createdBy:'21ME2210',  imageUrl: IMG.jacket },
  { id:'l05', type:'lost', personName:'Divya Rao',      rollNo:'22EEE5540', itemName:'Blue Hydro Flask 32oz',        location:'Science Block B, Room 204',         time:'4h ago',  date:'13/03/2026', desc:'Blue bottle with mountain sticker and Aditya University sticker. 32 oz.',            iconIdx:11, urgent:false, createdBy:'22EEE5540', imageUrl: IMG.bottle },
  { id:'l06', type:'lost', personName:'Kavya Nair',     rollNo:'22CSE1110', itemName:'Samsung Galaxy Watch 5',       location:'Canteen Block A',                   time:'6h ago',  date:'13/03/2026', desc:'Black band Galaxy Watch 5. Minor scratch on bezel. Has "Kavya" on strap.',           iconIdx:9,  urgent:true,  createdBy:'22CSE1110', imageUrl: IMG.smartwatch },
  { id:'l07', type:'lost', personName:'Sai Kiran',      rollNo:'21CSE7890', itemName:'Dell Inspiron 15 — Silver',   location:'CS Lab Block A, 2nd Floor',         time:'3h ago',  date:'13/03/2026', desc:'Silver Dell laptop with blue stickers. Charger also missing. Has project files.',    iconIdx:5,  urgent:true,  createdBy:'21CSE7890', imageUrl: IMG.laptop },
  { id:'l08', type:'lost', personName:'Meena Kumari',   rollNo:'22ME4433',  itemName:'AirPods Pro — White',          location:'Seminar Hall, Main Block',          time:'1h ago',  date:'13/03/2026', desc:'White AirPods Pro in white case. Right earpiece has a small green dot sticker.',    iconIdx:14, urgent:false, createdBy:'22ME4433',  imageUrl: IMG.airpods },
  { id:'l09', type:'lost', personName:'Aakash Singh',   rollNo:'22EEE1231', itemName:'Fossil Chronograph Watch',     location:'Lab 3, Mech Block',                 time:'5d ago',  date:'08/03/2026', desc:'Brown leather strap, silver dial. "A.S" initials engraved on the back.',            iconIdx:9,  urgent:false, createdBy:'22EEE1231', imageUrl: IMG.watch },
  { id:'l10', type:'lost', personName:'Pooja Reddy',    rollNo:'21ECE2200', itemName:'Dark Green Backpack Adidas',   location:'Auditorium, Main Block',            time:'2d ago',  date:'11/03/2026', desc:'Dark green backpack. Contains notebooks, charger, and a red thermos bottle.',        iconIdx:8,  urgent:false, createdBy:'21ECE2200', imageUrl: IMG.backpack },
  { id:'l11', type:'lost', personName:'Nikhil Verma',   rollNo:'22CSE5566', itemName:'Black Prescription Glasses',   location:'Library Reading Area, Table 12',    time:'7h ago',  date:'13/03/2026', desc:'Black rectangular frame glasses with blue-tint lenses. Left at reading table 12.',  iconIdx:13, urgent:false, createdBy:'22CSE5566', imageUrl: IMG.glasses },
  { id:'l12', type:'lost', personName:'Swathi Goud',    rollNo:'22ECE8811', itemName:'Boat Airdopes 441 — Teal',     location:'Sports Ground Bleachers',           time:'3d ago',  date:'10/03/2026', desc:'Teal & black wireless earbuds. Charging case has a crack on the lid.',             iconIdx:14, urgent:false, createdBy:'22ECE8811', imageUrl: IMG.earphones },
  { id:'l13', type:'lost', personName:'Tarun Babu',     rollNo:'21ME9900',  itemName:'Engineering Drawing Set',      location:'Drawing Hall, Block D',             time:'1d ago',  date:'12/03/2026', desc:'Pentel stationery set in blue zip pouch. Protractor, compass and ruler inside.',    iconIdx:12, urgent:false, createdBy:'21ME9900',  imageUrl: IMG.pencilcase },
  { id:'l14', type:'lost', personName:'Hema Latha',     rollNo:'22CSE3341', itemName:'Red Umbrella Collapsible',     location:'Campus WiFi Lounge',                time:'6h ago',  date:'13/03/2026', desc:'Compact red folding umbrella, slight wear on handle. Left near WiFi lounge seats.',  iconIdx:10, urgent:false, createdBy:'22CSE3341', imageUrl: IMG.umbrella },
  { id:'l15', type:'lost', personName:'Vikram Rao',     rollNo:'21ME1122',  itemName:'Sony WH-1000XM4 Headphones',  location:'Cafeteria, Main Counter Area',      time:'4h ago',  date:'13/03/2026', desc:'Black over-ear Sony headphones. No case. Found near the food counter area.',         iconIdx:2,  urgent:true,  createdBy:'21ME1122',  imageUrl: IMG.sonyheadphones },
  { id:'l16', type:'lost', personName:'Deepa Nair',     rollNo:'22EEE4499', itemName:'MacBook MagSafe 67W Charger', location:'Block C Study Hall',                time:'8h ago',  date:'13/03/2026', desc:'White Apple MagSafe 3 charger 67W. Has "DN" written in black marker on the brick.', iconIdx:15, urgent:false, createdBy:'22EEE4499', imageUrl: IMG.charger },
];

const SEED_FOUND = [
  { id:'f01', type:'found', personName:'Sneha Reddy',    rollNo:'22ECE3105', itemName:'Keys with Red Keychain',       location:'Main Gate Security Office',         time:'1h ago',  date:'13/03/2026', desc:'3 keys with red keychain + mini LED flashlight. Submitted to main gate security.',   iconIdx:3,  urgent:false, createdBy:'22ECE3105', imageUrl: IMG.keys },
  { id:'f02', type:'found', personName:'Kiran Babu',     rollNo:'21CSE7701', itemName:'Samsung Galaxy Watch 4',       location:'Central Canteen Table 6',           time:'6h ago',  date:'13/03/2026', desc:'Black band watch. Very minor screen scratch on right side. Kept with warden.',      iconIdx:9,  urgent:false, createdBy:'21CSE7701', imageUrl: IMG.smartwatch },
  { id:'f03', type:'found', personName:'Meera Nair',     rollNo:'22ME1004',  itemName:'Purple Folding Umbrella',      location:'CS Lab Block A Entrance',           time:'2h ago',  date:'13/03/2026', desc:'Compact collapsible purple umbrella. Left near lab door. Floral pattern inside.',   iconIdx:10, urgent:false, createdBy:'22ME1004',  imageUrl: IMG.umbrella },
  { id:'f04', type:'found', personName:'Anil Kumar',     rollNo:'21CSE0092', itemName:'Aditya University ID Card',    location:'Sports Ground Near Goal Post',      time:'3h ago',  date:'13/03/2026', desc:'Student ID card found on ground. Name clearly visible. Submitted to admin office.', iconIdx:4,  urgent:false, createdBy:'21CSE0092', imageUrl: IMG.idcard },
  { id:'f05', type:'found', personName:'Lakshmi Devi',   rollNo:'22EEE9901', itemName:'Bose Headphones in Black Case', location:'Block C Corridor Near Rm 204',     time:'5h ago',  date:'13/03/2026', desc:'Blue Bose headphones in black case. Found in corridor. Handed to Class Rep.',       iconIdx:2,  urgent:false, createdBy:'22EEE9901', imageUrl: IMG.headphones },
  { id:'f06', type:'found', personName:'Ravi Teja',      rollNo:'21CSE3312', itemName:'Blue Stationery Zipper Pouch', location:'Library Reading Hall Table 8',       time:'8h ago',  date:'13/03/2026', desc:'Blue zipper pouch with scale, pens, eraser, compass. Placed at library help desk.',  iconIdx:12, urgent:false, createdBy:'21CSE3312', imageUrl: IMG.pencilcase },
  { id:'f07', type:'found', personName:'Harini Devi',    rollNo:'22CSE2234', itemName:'Black 65W Laptop Charger',     location:'CS Lab 2, Block B',                 time:'4h ago',  date:'13/03/2026', desc:'Black laptop charger 65W. Found under desk in Lab 2. Has yellow sticker on brick.', iconIdx:15, urgent:false, createdBy:'22CSE2234', imageUrl: IMG.charger },
  { id:'f08', type:'found', personName:'Suresh Babu',    rollNo:'21ME0045',  itemName:'Matte Black Steel Bottle 1L',  location:'Gymnasium Entry Area',              time:'2d ago',  date:'11/03/2026', desc:'Matte black 1L steel bottle with "SB" initials on base. Found at gym entry gate.', iconIdx:11, urgent:false, createdBy:'21ME0045',  imageUrl: IMG.bottle },
  { id:'f09', type:'found', personName:'Anjali Reddy',   rollNo:'22ECE4421', itemName:'Brown Leather Wallet',         location:'Canteen Seating Area',              time:'1d ago',  date:'12/03/2026', desc:'Brown bifold wallet with some cash and an ID card. Found between canteen seats.',   iconIdx:0,  urgent:true,  createdBy:'22ECE4421', imageUrl: IMG.wallet },
  { id:'f10', type:'found', personName:'Pradeep Rao',    rollNo:'21CSE6677', itemName:'Apple AirPods Pro White',      location:'Library Study Cubicle 7B',          time:'3h ago',  date:'13/03/2026', desc:'White AirPods Pro in case. Owner name not matching anything nearby. With librarian.', iconIdx:14, urgent:false, createdBy:'21CSE6677', imageUrl: IMG.airpods },
  { id:'f11', type:'found', personName:'Chandra Sekhar', rollNo:'22ME5532',  itemName:'Black Reading Glasses',        location:'Reading Room, Library Block',       time:'5h ago',  date:'13/03/2026', desc:'Black rectangular glasses found on reading table 9. Handed to the librarian.',     iconIdx:13, urgent:false, createdBy:'22ME5532',  imageUrl: IMG.glasses },
  { id:'f12', type:'found', personName:'Radha Krishna',  rollNo:'21EEE3310', itemName:'Spiral Notebook Set of 3',     location:'Seminar Hall Exit Area',            time:'6h ago',  date:'13/03/2026', desc:'3 spiral notebooks: Math, Physics, Chemistry. Found after seminar. At dept office.',  iconIdx:7,  urgent:false, createdBy:'21EEE3310', imageUrl: IMG.notebook },
  { id:'f13', type:'found', personName:'Pavithra S',     rollNo:'22CSE7788', itemName:'Fossil Men\'s Leather Watch',  location:'Sports Ground Pavilion',            time:'1d ago',  date:'12/03/2026', desc:'Brown strap Fossil watch. "FS" engraved on back. Found on pavilion bench.',         iconIdx:9,  urgent:false, createdBy:'22CSE7788', imageUrl: IMG.watch },
  { id:'f14', type:'found', personName:'Venkat Rao',     rollNo:'21ME2289',  itemName:'Sony WH-1000XM4 Headphones',  location:'Block A Rooftop Garden',            time:'2h ago',  date:'13/03/2026', desc:'Black Sony over-ear headphones near garden bench. No case. Fully functional.',      iconIdx:2,  urgent:false, createdBy:'21ME2289',  imageUrl: IMG.sonyheadphones },
  { id:'f15', type:'found', personName:'Bhavya Teja',    rollNo:'22ECE0011', itemName:'Samsung Galaxy A53 — Blue',   location:'Workshop Block Exit',               time:'7h ago',  date:'13/03/2026', desc:'Blue Samsung A53 without a case. Locked. Submitted to workshop block security.',    iconIdx:1,  urgent:true,  createdBy:'22ECE0011', imageUrl: IMG.phone },
  { id:'f16', type:'found', personName:'Naga Sai',       rollNo:'21CSE8899', itemName:'Navy Blue Adidas Backpack',   location:'Main Auditorium Row 12',            time:'3d ago',  date:'10/03/2026', desc:'Navy blue Adidas backpack with red logo. Books and charger inside. With security.',  iconIdx:8,  urgent:false, createdBy:'21CSE8899', imageUrl: IMG.bag },
];

// ─── AI HELPERS ───────────────────────────────────────────────────────────────
const analyzeImageWithAI = async (base64Image, type) => {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:1000, messages:[{ role:'user', content:[
        { type:'image', source:{ type:'base64', media_type:'image/jpeg', data:base64Image } },
        { type:'text',  text:`Analyze this ${type} item image. JSON only:\n{"itemName":"name","category":"Wallet|Phone|Headphones|Keys|ID/Card|Laptop|Clothing|Books|Bag|Watch|Umbrella|Bottle|Stationery|Glasses|Earphones|Other","description":"2-3 sentences","suggestedLocation":"or empty"}` },
      ]}] }),
    });
    const data = await res.json();
    return JSON.parse((data.content?.[0]?.text||'').replace(/```json|```/g,'').trim());
  } catch { return null; }
};

const moderateContent = async ({ base64Image, mediaType, itemName, description }) => {
  try {
    const mc = [];
    if (base64Image) mc.push({ type:'image', source:{ type:'base64', media_type:mediaType||'image/jpeg', data:base64Image } });
    const parts = [];
    if (itemName)    parts.push(`Item: "${itemName}"`);
    if (description) parts.push(`Desc: "${description}"`);
    mc.push({ type:'text', text:`Campus Lost & Found moderator.\n${parts.join('\n')}\nJSON only:\n{"safe":true,"reason":"","category":"safe"}` });
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:200, messages:[{ role:'user', content:mc }] }),
    });
    const data = await res.json();
    return JSON.parse((data.content?.[0]?.text||'').replace(/```json|```/g,'').trim());
  } catch { return { safe:true, reason:'', category:'safe' }; }
};

const CAT_IDX = { 'Wallet':0,'Phone':1,'Headphones':2,'Keys':3,'ID/Card':4,'Laptop':5,'Clothing':6,'Books':7,'Bag':8,'Watch':9,'Umbrella':10,'Bottle':11,'Stationery':12,'Glasses':13,'Earphones':14,'Other':15 };

// ─────────────────────────────────────────────────────────────────────────────
// ── PROFESSIONAL GRID CARD ────────────────────────────────────────────────────
const GridCard = ({ item, onPress, delay }) => {
  const anim    = useEntrance(delay, 24);
  const press   = useRef(new Animated.Value(1)).current;
  const isOwner = item.createdBy === ME.rollNo;
  const ic      = ICONS[item.iconIdx] ?? ICONS[15];
  const isLost  = item.type === 'lost';
  const [imgErr, setImgErr] = useState(false);

  const onIn  = () => Animated.spring(press, { toValue:0.96, speed:22, useNativeDriver:true }).start();
  const onOut = () => Animated.spring(press, { toValue:1,    speed:16, useNativeDriver:true }).start();

  return (
    <Animated.View style={[anim, { transform:[...anim.transform, { scale:press }], width:CARD_W }]}>
      <TouchableOpacity onPressIn={onIn} onPressOut={onOut} onPress={() => onPress(item)} activeOpacity={1} style={G.card}>

        {/* ── IMAGE ZONE ── */}
        <View style={G.imageBox}>
          {item.imageUrl && !imgErr ? (
            <>
              <Image source={{ uri:item.imageUrl }} style={G.itemImage} resizeMode="cover" onError={() => setImgErr(true)} />
              {/* subtle dark gradient for text readability */}
              <LinearGradient colors={['transparent','rgba(0,0,0,0.42)']} style={StyleSheet.absoluteFill} pointerEvents="none" />
            </>
          ) : (
            <View style={[G.iconFallback, { backgroundColor:ic.bg }]}>
              <Ionicons name={ic.icon} size={52} color={ic.color} />
            </View>
          )}

          {/* TOP LEFT BADGES */}
          <View style={G.badgeRow}>
            {item.urgent && (
              <View style={G.urgentBadge}>
                <Ionicons name="flash" size={8} color="#fff" />
                <Text style={G.urgentT}>URGENT</Text>
              </View>
            )}
            {isOwner && (
              <View style={G.youBadge}><Text style={G.youBadgeT}>YOU</Text></View>
            )}
          </View>

          {/* BOTTOM RIGHT — LOST / FOUND stamp */}
          <View style={[G.stamp, { backgroundColor: isLost ? 'rgba(229,57,53,0.90)' : 'rgba(27,138,76,0.90)' }]}>
            <Ionicons name={isLost ? 'alert-circle' : 'checkmark-circle'} size={9} color="#fff" />
            <Text style={G.stampT}>{isLost ? 'LOST' : 'FOUND'}</Text>
          </View>
        </View>

        {/* ── INFO ZONE ── */}
        <View style={G.info}>
          {/* Category pill */}
          <View style={[G.catPill, { backgroundColor:ic.bg }]}>
            <Ionicons name={ic.icon} size={9} color={ic.color} />
            <Text style={[G.catPillT, { color:ic.color }]}>{ic.label}</Text>
          </View>

          {/* Item name */}
          <Text style={G.name} numberOfLines={2}>{item.itemName}</Text>

          {/* Location */}
          <View style={G.locRow}>
            <Ionicons name="location-outline" size={10} color={C.textLight} />
            <Text style={G.locT} numberOfLines={1}>{item.location}</Text>
          </View>

          {/* Reporter · time */}
          <View style={G.metaRow}>
            <LinearGradient colors={[C.primary,C.primaryDark]} style={G.dot}>
              <Text style={G.dotT}>{item.personName[0]}</Text>
            </LinearGradient>
            <Text style={G.reporter} numberOfLines={1}>{item.personName.split(' ')[0]}</Text>
            <Text style={G.sep}>·</Text>
            <Text style={G.time}>{item.time}</Text>
          </View>
        </View>

        {/* ── ACTION BUTTON ── */}
        {!isOwner ? (
          <TouchableOpacity
            style={[G.btn, { backgroundColor: isLost ? C.primary : C.green }]}
            onPress={() => onPress(item)} activeOpacity={0.85}>
            <Ionicons name={isLost ? 'chatbubble-ellipses-outline' : 'call-outline'} size={12} color="#fff" />
            <Text style={G.btnT}>{isLost ? 'I Found It!' : "It's Mine!"}</Text>
          </TouchableOpacity>
        ) : (
          <View style={G.ownerBtn}>
            <Ionicons name="person-circle-outline" size={12} color={C.primary} />
            <Text style={G.ownerBtnT}>Your Report</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const GridList = ({ items, onPress }) => {
  if (items.length === 0) return (
    <View style={G.empty}>
      <Ionicons name="search-outline" size={44} color={C.textLight} />
      <Text style={G.emptyTxt}>No items found</Text>
      <Text style={G.emptySub}>Tap + to report one</Text>
    </View>
  );
  const rows = [];
  for (let i = 0; i < items.length; i += 2) rows.push(items.slice(i, i+2));
  return (
    <View style={G.grid}>
      {rows.map((row, ri) => (
        <View key={ri} style={G.row}>
          {row.map((item, ci) => (
            <GridCard key={item.id} item={item} onPress={onPress} delay={ri * 55 + ci * 25} />
          ))}
          {row.length === 1 && <View style={{ width:CARD_W }} />}
        </View>
      ))}
    </View>
  );
};

const G = StyleSheet.create({
  grid:  { paddingHorizontal:16, paddingTop:8, paddingBottom:8 },
  row:   { flexDirection:'row', gap:10, marginBottom:12 },
  card:  { backgroundColor:C.surface, borderRadius:16, overflow:'hidden', borderWidth:1, borderColor:'#E8E0F8', shadowColor:'#4B1FA8', shadowOffset:{width:0,height:4}, shadowOpacity:0.10, shadowRadius:10, elevation:5 },

  imageBox:    { width:'100%', height:CARD_W * 0.84, position:'relative', backgroundColor:'#F0EAFF' },
  itemImage:   { width:'100%', height:'100%' },
  iconFallback:{ width:'100%', height:'100%', justifyContent:'center', alignItems:'center' },

  badgeRow:  { position:'absolute', top:8, left:8, flexDirection:'row', gap:4, zIndex:10 },
  urgentBadge:{ flexDirection:'row', alignItems:'center', gap:3, backgroundColor:C.red, borderRadius:6, paddingHorizontal:6, paddingVertical:3 },
  urgentT:   { color:'#fff', fontSize:8, fontWeight:'900', letterSpacing:0.4 },
  youBadge:  { backgroundColor:C.primary, borderRadius:6, paddingHorizontal:6, paddingVertical:3 },
  youBadgeT: { color:'#fff', fontSize:8, fontWeight:'900', letterSpacing:0.4 },

  stamp:  { position:'absolute', bottom:8, right:8, flexDirection:'row', alignItems:'center', gap:4, paddingHorizontal:7, paddingVertical:4, borderRadius:8 },
  stampT: { color:'#fff', fontSize:9, fontWeight:'900', letterSpacing:0.6 },

  info: { paddingHorizontal:10, paddingTop:10, paddingBottom:6, gap:5 },

  catPill:  { flexDirection:'row', alignItems:'center', gap:4, alignSelf:'flex-start', borderRadius:6, paddingHorizontal:7, paddingVertical:3 },
  catPillT: { fontSize:9, fontWeight:'800', letterSpacing:0.3 },

  name:     { fontSize:13, fontWeight:'800', color:C.textDark, lineHeight:17 },

  locRow:   { flexDirection:'row', alignItems:'center', gap:3 },
  locT:     { fontSize:10, color:C.textLight, flex:1 },

  metaRow:   { flexDirection:'row', alignItems:'center', gap:4, marginTop:2 },
  dot:       { width:16, height:16, borderRadius:8, justifyContent:'center', alignItems:'center' },
  dotT:      { color:'#fff', fontWeight:'900', fontSize:7 },
  reporter:  { fontSize:10, color:C.textMid, fontWeight:'600', maxWidth:CARD_W * 0.34 },
  sep:       { fontSize:8, color:C.textLight },
  time:      { fontSize:9, color:C.textLight, fontWeight:'600' },

  btn:      { margin:8, marginTop:2, paddingVertical:9, borderRadius:10, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:5 },
  btnT:     { color:'#fff', fontWeight:'800', fontSize:11, letterSpacing:0.2 },
  ownerBtn: { margin:8, marginTop:2, paddingVertical:9, borderRadius:10, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:5, backgroundColor:C.primaryPale, borderWidth:1, borderColor:C.border },
  ownerBtnT:{ color:C.primary, fontWeight:'800', fontSize:11 },

  empty:    { alignItems:'center', paddingTop:60, gap:10 },
  emptyTxt: { fontSize:15, color:C.textLight, fontWeight:'700' },
  emptySub: { fontSize:12, color:C.textLight },
});

// ─────────────────────────────────────────────────────────────────────────────
// ── DETAIL SHEET ──────────────────────────────────────────────────────────────
const DetailSheet = ({ item, onClose }) => {
  const slideY  = useRef(new Animated.Value(height)).current;
  const isOwner = item.createdBy === ME.rollNo;
  const ic      = ICONS[item.iconIdx] ?? ICONS[15];
  const isLost  = item.type === 'lost';
  const [imgErr, setImgErr] = useState(false);

  useEffect(() => {
    Animated.spring(slideY, { toValue:0, speed:18, bounciness:4, useNativeDriver:true }).start();
  }, []);
  const close = () => Animated.timing(slideY, { toValue:height, duration:260, easing:EASE, useNativeDriver:true }).start(onClose);

  return (
    <Modal transparent animationType="none" onRequestClose={close}>
      <TouchableWithoutFeedback onPress={close}><View style={ds.overlay} /></TouchableWithoutFeedback>
      <Animated.View style={[ds.sheet, { transform:[{translateY:slideY}] }]}>
        <View style={ds.handle} />
        <View style={ds.heroBox}>
          {item.imageUrl && !imgErr ? (
            <Image source={{ uri:item.imageUrl }} style={ds.heroImg} resizeMode="cover" onError={() => setImgErr(true)} />
          ) : (
            <View style={[ds.heroFallback, { backgroundColor:ic.bg }]}>
              <Ionicons name={ic.icon} size={56} color={ic.color} />
            </View>
          )}
          <LinearGradient colors={['transparent','rgba(0,0,0,0.55)']} style={StyleSheet.absoluteFill} />
          <View style={[ds.typeChip, { backgroundColor: isLost ? C.red : C.green }]}>
            <Ionicons name={isLost ? 'alert-circle' : 'checkmark-circle'} size={12} color="#fff" />
            <Text style={ds.typeChipT}>{isLost ? 'LOST ITEM' : 'FOUND ITEM'}</Text>
          </View>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={ds.name}>{item.itemName}</Text>
          <View style={ds.metaRow}>
            <Ionicons name="location-outline" size={13} color={C.textLight} />
            <Text style={ds.loc}>{item.location}</Text>
            <Text style={ds.dateT}>{item.date} · {item.time}</Text>
          </View>
          <View style={ds.divider} />
          <Text style={ds.secLbl}>Description</Text>
          <Text style={ds.desc}>{item.desc}</Text>
          <View style={ds.divider} />
          <Text style={ds.secLbl}>Reported By</Text>
          <View style={ds.reporterRow}>
            <LinearGradient colors={[C.primary,C.primaryDark]} style={ds.avatar}>
              <Text style={ds.avatarT}>{item.personName[0]}</Text>
            </LinearGradient>
            <View style={{ flex:1 }}>
              <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
                <Text style={ds.reporterName}>{item.personName}</Text>
                {isOwner && <View style={ds.youPill}><Text style={ds.youTxt}>You</Text></View>}
              </View>
              <Text style={ds.roll}>{isOwner ? ME.rollNo : item.rollNo}</Text>
            </View>
          </View>
          {!isOwner && (
            <TouchableOpacity onPress={close} activeOpacity={0.87} style={{ marginTop:20, marginBottom:8 }}>
              <LinearGradient colors={isLost ? [C.primary,C.primaryDark] : [C.green,'#146038']} style={ds.cta}>
                <Ionicons name={isLost ? 'chatbubble-outline' : 'call-outline'} size={16} color="#fff" />
                <Text style={ds.ctaT}>{isLost ? 'I Found This Item' : "It's Mine — Contact"}</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
          {isOwner && <View style={{ height:18 }} />}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
};

const ds = StyleSheet.create({
  overlay:    { ...StyleSheet.absoluteFillObject, backgroundColor:'rgba(0,0,0,0.50)' },
  sheet:      { position:'absolute', bottom:0, left:0, right:0, backgroundColor:C.surface, borderTopLeftRadius:28, borderTopRightRadius:28, paddingBottom:36 },
  handle:     { width:40, height:4, borderRadius:2, backgroundColor:C.border, alignSelf:'center', marginTop:12, marginBottom:0 },
  heroBox:    { width:'100%', height:200, overflow:'hidden', position:'relative' },
  heroImg:    { width:'100%', height:'100%' },
  heroFallback:{ width:'100%', height:'100%', justifyContent:'center', alignItems:'center' },
  typeChip:   { position:'absolute', bottom:12, left:16, flexDirection:'row', alignItems:'center', gap:5, borderRadius:10, paddingHorizontal:10, paddingVertical:5 },
  typeChipT:  { color:'#fff', fontWeight:'900', fontSize:11, letterSpacing:0.5 },
  name:       { fontSize:18, fontWeight:'900', color:C.textDark, paddingHorizontal:20, paddingTop:16, marginBottom:6 },
  metaRow:    { flexDirection:'row', alignItems:'center', gap:5, paddingHorizontal:20, marginBottom:4 },
  loc:        { fontSize:12, color:C.textLight, flex:1 },
  dateT:      { fontSize:11, color:C.textLight },
  divider:    { height:1, backgroundColor:C.border, marginHorizontal:20, marginVertical:14 },
  secLbl:     { fontSize:11, fontWeight:'700', color:C.textLight, letterSpacing:0.8, textTransform:'uppercase', marginBottom:8, paddingHorizontal:20 },
  desc:       { fontSize:14, color:C.textMid, lineHeight:22, paddingHorizontal:20 },
  reporterRow:{ flexDirection:'row', alignItems:'center', gap:12, paddingHorizontal:20 },
  avatar:     { width:44, height:44, borderRadius:22, justifyContent:'center', alignItems:'center' },
  avatarT:    { color:'#fff', fontWeight:'900', fontSize:18 },
  reporterName:{ fontSize:14, fontWeight:'700', color:C.textDark },
  youPill:    { backgroundColor:C.primaryPale, borderRadius:8, paddingHorizontal:8, paddingVertical:2, borderWidth:1, borderColor:C.border },
  youTxt:     { fontSize:10, fontWeight:'800', color:C.primary },
  roll:       { fontSize:12, color:C.textLight, marginTop:2 },
  cta:        { marginHorizontal:20, borderRadius:16, paddingVertical:15, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8 },
  ctaT:       { color:'#fff', fontWeight:'900', fontSize:15 },
});

// ─────────────────────────────────────────────────────────────────────────────
// ── ADD FORM ──────────────────────────────────────────────────────────────────
const AddForm = ({ visible, type, onClose, onSubmit }) => {
  const slideY = useRef(new Animated.Value(height)).current;
  const [showIcons, setShowIcons]     = useState(false);
  const [pickedImage, setPickedImage] = useState(null);
  const [aiLoading, setAiLoading]     = useState(false);
  const [aiResult, setAiResult]       = useState(null);
  const [modError, setModError]       = useState(null);
  const [modChecking, setModChecking] = useState(false);
  const [form, setForm] = useState({ personName:ME.name, itemName:'', location:'', time:nowTime(), date:nowDate(), desc:'', iconIdx:0 });
  const set = (k,v) => setForm(p => ({...p,[k]:v}));

  useEffect(() => {
    if (visible) {
      setForm({ personName:ME.name, itemName:'', location:'', time:nowTime(), date:nowDate(), desc:'', iconIdx:0 });
      setShowIcons(false); setPickedImage(null); setAiLoading(false); setAiResult(null); setModError(null); setModChecking(false);
      Animated.spring(slideY, { toValue:0, speed:16, bounciness:3, useNativeDriver:true }).start();
    } else {
      Animated.timing(slideY, { toValue:height, duration:260, easing:EASE, useNativeDriver:true }).start();
    }
  }, [visible]);

  const handleImage = async (asset) => {
    const mediaType = asset.mimeType || 'image/jpeg';
    setModChecking(true); setModError(null); setAiResult(null);
    const mod = await moderateContent({ base64Image:asset.base64, mediaType });
    setModChecking(false);
    if (!mod.safe) { setModError(mod.reason || 'This image is not allowed.'); return; }
    setPickedImage({ uri:asset.uri, base64:asset.base64, mediaType });
    setAiLoading(true);
    const parsed = await analyzeImageWithAI(asset.base64, type);
    setAiLoading(false);
    if (parsed) {
      setAiResult(parsed);
      setForm(p => ({ ...p, itemName:parsed.itemName||p.itemName, desc:parsed.description||p.desc, location:parsed.suggestedLocation||p.location, iconIdx:CAT_IDX[parsed.category]??p.iconIdx }));
    }
  };

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes:ImagePicker.MediaTypeOptions.Images, allowsEditing:true, quality:0.7, base64:true });
    if (!r.canceled) await handleImage(r.assets[0]);
  };
  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return;
    const r = await ImagePicker.launchCameraAsync({ allowsEditing:true, quality:0.7, base64:true });
    if (!r.canceled) await handleImage(r.assets[0]);
  };
  const submit = async () => {
    if (!form.itemName.trim()) return;
    setModChecking(true); setModError(null);
    const mod = await moderateContent({ itemName:form.itemName, description:form.desc });
    setModChecking(false);
    if (!mod.safe) { setModError(mod.reason||'Inappropriate content.'); return; }
    onSubmit({ ...form, id:`item_${Date.now()}`, type, rollNo:ME.rollNo, createdBy:ME.rollNo, urgent:false, time:'Just now', imageUrl:pickedImage?.uri||null });
    onClose();
  };

  if (!visible) return null;
  return (
    <Modal transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex:1 }}>
          <TouchableWithoutFeedback onPress={onClose}><View style={af.overlay} /></TouchableWithoutFeedback>
          <Animated.View style={[af.sheet, { transform:[{translateY:slideY}] }]}>
            <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined}>
              <View style={af.head}>
                <View style={af.handle} />
                <View style={af.titleRow}>
                  <LinearGradient colors={[C.primary,C.primaryDark]} style={af.titleIcon}>
                    <Ionicons name={type==='lost'?'alert-circle-outline':'search-outline'} size={15} color="#fff" />
                  </LinearGradient>
                  <Text style={af.title}>Report {type==='lost'?'Lost':'Found'} Item</Text>
                  <TouchableOpacity onPress={onClose} style={af.closeBtn}><Ionicons name="close" size={20} color={C.textMid} /></TouchableOpacity>
                </View>
              </View>
              <ScrollView style={af.scroll} contentContainerStyle={{ paddingBottom:28 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Text style={af.lbl}>Category</Text>
                <TouchableOpacity style={af.picker} onPress={() => setShowIcons(p=>!p)}>
                  <View style={[af.picThumb, { backgroundColor:ICONS[form.iconIdx].bg }]}><Ionicons name={ICONS[form.iconIdx].icon} size={20} color={ICONS[form.iconIdx].color} /></View>
                  <Text style={af.picLbl}>{ICONS[form.iconIdx].label}</Text>
                  <Ionicons name={showIcons?'chevron-up':'chevron-down'} size={16} color={C.textLight} />
                </TouchableOpacity>
                {showIcons && (
                  <View style={af.iconGrid}>
                    {ICONS.map((ic,i) => (
                      <TouchableOpacity key={i} style={[af.iconCell, form.iconIdx===i&&af.iconCellOn]} onPress={() => { set('iconIdx',i); setShowIcons(false); }} activeOpacity={0.8}>
                        <View style={[af.iconThumb, { backgroundColor:ic.bg }]}><Ionicons name={ic.icon} size={18} color={ic.color} /></View>
                        <Text style={af.iconLbl} numberOfLines={1}>{ic.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                <Text style={af.lbl}>Your Name</Text>
                <View style={af.row}><Ionicons name="person-outline" size={16} color={C.textLight} /><TextInput style={af.input} value={form.personName} onChangeText={v=>set('personName',v)} placeholderTextColor={C.textLight} /></View>
                <Text style={af.lbl}>Item Name <Text style={{ color:C.red }}>*</Text></Text>
                <View style={af.row}><Ionicons name="cube-outline" size={16} color={C.textLight} /><TextInput style={af.input} value={form.itemName} onChangeText={v=>set('itemName',v)} placeholder="e.g. Blue Bose Headphones" placeholderTextColor={C.textLight} /></View>
                <Text style={af.lbl}>Location</Text>
                <View style={af.row}><Ionicons name="location-outline" size={16} color={C.textLight} /><TextInput style={af.input} value={form.location} onChangeText={v=>set('location',v)} placeholder="e.g. Library, 2nd Floor" placeholderTextColor={C.textLight} /></View>
                <View style={{ flexDirection:'row', gap:10 }}>
                  <View style={{ flex:1 }}><Text style={af.lbl}>Time</Text><View style={af.row}><Ionicons name="time-outline" size={15} color={C.textLight} /><TextInput style={af.input} value={form.time} onChangeText={v=>set('time',v)} placeholderTextColor={C.textLight} /></View></View>
                  <View style={{ flex:1 }}><Text style={af.lbl}>Date</Text><View style={af.row}><Ionicons name="calendar-outline" size={15} color={C.textLight} /><TextInput style={af.input} value={form.date} onChangeText={v=>set('date',v)} placeholderTextColor={C.textLight} /></View></View>
                </View>
                <Text style={af.lbl}>Description</Text>
                <View style={[af.row, { alignItems:'flex-start', paddingTop:12 }]}><Ionicons name="document-text-outline" size={16} color={C.textLight} style={{ marginTop:1 }} /><TextInput style={[af.input, { height:80, textAlignVertical:'top' }]} value={form.desc} onChangeText={v=>set('desc',v)} placeholder="Colour, brand, distinguishing features..." placeholderTextColor={C.textLight} multiline /></View>

                <Text style={af.lbl}>Photo <Text style={{ color:C.textLight, fontWeight:'400', textTransform:'none', letterSpacing:0 }}>(optional — AI auto-fill)</Text></Text>
                <View style={af.imgBtnRow}>
                  <TouchableOpacity style={af.imgBtn} onPress={pickImage} activeOpacity={0.8}><Ionicons name="images-outline" size={18} color={C.primary} /><Text style={af.imgBtnTxt}>Gallery</Text></TouchableOpacity>
                  <TouchableOpacity style={af.imgBtn} onPress={takePhoto} activeOpacity={0.8}><Ionicons name="camera-outline" size={18} color={C.primary} /><Text style={af.imgBtnTxt}>Camera</Text></TouchableOpacity>
                </View>
                {pickedImage && (<View style={af.prevWrap}><Image source={{ uri:pickedImage.uri }} style={af.prev} resizeMode="cover" /><TouchableOpacity style={af.prevRem} onPress={() => { setPickedImage(null); setAiResult(null); }}><Ionicons name="close-circle" size={22} color="#fff" /></TouchableOpacity></View>)}
                {aiLoading && (<View style={af.aiBox}><ActivityIndicator size="small" color={C.primary} /><View style={{ flex:1 }}><Text style={af.aiTitle}>AI analysing image...</Text><Text style={af.aiSub}>Detecting item, category & description</Text></View></View>)}
                {aiResult && !aiLoading && (<View style={af.aiResultBox}><View style={af.aiResultH}><LinearGradient colors={[C.primary,C.primaryDark]} style={af.aiResultIcon}><Ionicons name="sparkles" size={13} color="#fff" /></LinearGradient><Text style={af.aiResultTitle}>AI filled the form!</Text><TouchableOpacity onPress={()=>setAiResult(null)}><Ionicons name="close" size={16} color={C.textLight} /></TouchableOpacity></View><Text style={af.aiResultBody}>Detected: <Text style={{ fontWeight:'700', color:C.primary }}>{aiResult.category}</Text>{aiResult.itemName?` — ${aiResult.itemName}`:''}</Text></View>)}
                {modChecking && (<View style={af.modCheckBox}><ActivityIndicator size="small" color={C.primary} /><Text style={af.modCheckTxt}>Checking content safety...</Text></View>)}

                <TouchableOpacity onPress={submit} activeOpacity={0.87} style={{ marginTop:14 }} disabled={modChecking||aiLoading}>
                  <LinearGradient colors={[C.primary,C.primaryDark]} style={af.submitBtn}><Ionicons name="add-circle-outline" size={18} color="#fff" /><Text style={af.submitTxt}>Submit Report</Text></LinearGradient>
                </TouchableOpacity>
              </ScrollView>
            </KeyboardAvoidingView>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
      <Modal transparent visible={!!modError} animationType="fade" onRequestClose={()=>setModError(null)}>
        <View style={af.modOverlay}><View style={af.modCard}><View style={af.modIcon}><Ionicons name="shield-checkmark" size={32} color="#fff" /></View><Text style={af.modTitle}>Not Allowed</Text><Text style={af.modMsg}>{modError}</Text><TouchableOpacity style={af.modBtn} onPress={()=>setModError(null)}><LinearGradient colors={[C.red,'#CC2222']} style={af.modBtnG}><Text style={af.modBtnT}>Got it</Text></LinearGradient></TouchableOpacity></View></View>
      </Modal>
    </Modal>
  );
};

const af = StyleSheet.create({
  overlay:    { position:'absolute', top:0, left:0, right:0, bottom:0, backgroundColor:'rgba(0,0,0,0.45)' },
  sheet:      { position:'absolute', bottom:0, left:0, right:0, backgroundColor:C.surface, borderTopLeftRadius:28, borderTopRightRadius:28, maxHeight:height*0.92 },
  head:       { paddingTop:12, paddingHorizontal:20, paddingBottom:14, borderBottomWidth:1, borderBottomColor:C.border },
  handle:     { width:40, height:4, borderRadius:2, backgroundColor:C.border, alignSelf:'center', marginBottom:14 },
  titleRow:   { flexDirection:'row', alignItems:'center', gap:10 },
  titleIcon:  { width:32, height:32, borderRadius:10, justifyContent:'center', alignItems:'center' },
  title:      { flex:1, fontSize:16, fontWeight:'800', color:C.textDark },
  closeBtn:   { width:32, height:32, borderRadius:16, backgroundColor:C.surfaceAlt, justifyContent:'center', alignItems:'center' },
  scroll:     { paddingHorizontal:20, paddingTop:16 },
  lbl:        { fontSize:11, fontWeight:'700', color:C.textLight, letterSpacing:0.6, textTransform:'uppercase', marginBottom:7, marginTop:16 },
  row:        { flexDirection:'row', alignItems:'center', gap:10, backgroundColor:C.surfaceAlt, borderRadius:13, paddingHorizontal:14, paddingVertical:11, borderWidth:1, borderColor:C.border },
  input:      { flex:1, fontSize:14, color:C.textDark, padding:0 },
  picker:     { flexDirection:'row', alignItems:'center', gap:12, backgroundColor:C.surfaceAlt, borderRadius:13, paddingHorizontal:14, paddingVertical:10, borderWidth:1, borderColor:C.border },
  picThumb:   { width:36, height:36, borderRadius:10, justifyContent:'center', alignItems:'center' },
  picLbl:     { flex:1, fontSize:14, fontWeight:'600', color:C.textDark },
  iconGrid:   { flexDirection:'row', flexWrap:'wrap', gap:8, marginTop:10 },
  iconCell:   { width:(width-40-32)/5, alignItems:'center', gap:4, backgroundColor:C.surfaceAlt, borderRadius:12, padding:7, borderWidth:1, borderColor:C.border },
  iconCellOn: { borderColor:C.primary, borderWidth:2, backgroundColor:C.primaryPale },
  iconThumb:  { width:34, height:34, borderRadius:9, justifyContent:'center', alignItems:'center' },
  iconLbl:    { fontSize:9, color:C.textMid, fontWeight:'600', textAlign:'center' },
  submitBtn:  { borderRadius:16, paddingVertical:15, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8 },
  submitTxt:  { color:'#fff', fontWeight:'800', fontSize:15 },
  modCheckBox:{ flexDirection:'row', alignItems:'center', gap:10, backgroundColor:C.primaryPale, borderRadius:12, paddingHorizontal:14, paddingVertical:10, marginTop:10, borderWidth:1, borderColor:C.border },
  modCheckTxt:{ fontSize:13, color:C.primary, fontWeight:'600' },
  modOverlay: { flex:1, backgroundColor:'rgba(0,0,0,0.55)', justifyContent:'center', alignItems:'center', paddingHorizontal:28 },
  modCard:    { backgroundColor:'#fff', borderRadius:24, padding:28, alignItems:'center', width:'100%', gap:12 },
  modIcon:    { width:68, height:68, borderRadius:34, backgroundColor:C.red, justifyContent:'center', alignItems:'center' },
  modTitle:   { fontSize:19, fontWeight:'900', color:C.textDark },
  modMsg:     { fontSize:13, color:C.red, fontWeight:'600', textAlign:'center', lineHeight:19 },
  modBtn:     { width:'100%', borderRadius:14, overflow:'hidden' },
  modBtnG:    { paddingVertical:14, alignItems:'center' },
  modBtnT:    { color:'#fff', fontWeight:'800', fontSize:15 },
  aiBox:      { flexDirection:'row', alignItems:'center', gap:10, backgroundColor:C.primaryPale, borderRadius:12, paddingHorizontal:14, paddingVertical:12, marginTop:12, borderWidth:1, borderColor:C.border },
  aiTitle:    { fontSize:13, fontWeight:'700', color:C.primary },
  aiSub:      { fontSize:11, color:C.textLight, marginTop:2 },
  aiResultBox:{ backgroundColor:C.primaryPale, borderRadius:14, padding:14, marginTop:12, borderWidth:1.5, borderColor:C.primary+'44' },
  aiResultH:  { flexDirection:'row', alignItems:'center', gap:8, marginBottom:6 },
  aiResultIcon:{ width:26, height:26, borderRadius:8, justifyContent:'center', alignItems:'center' },
  aiResultTitle:{ flex:1, fontSize:13, fontWeight:'800', color:C.primary },
  aiResultBody: { fontSize:13, color:C.textDark },
  imgBtnRow:  { flexDirection:'row', gap:10, marginTop:4 },
  imgBtn:     { flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:7, backgroundColor:C.primaryPale, borderRadius:13, paddingVertical:12, borderWidth:1.5, borderColor:C.primary+'40' },
  imgBtnTxt:  { fontSize:13, fontWeight:'700', color:C.primary },
  prevWrap:   { marginTop:12, borderRadius:14, overflow:'hidden', position:'relative' },
  prev:       { width:'100%', height:180, borderRadius:14 },
  prevRem:    { position:'absolute', top:8, right:8, backgroundColor:'rgba(0,0,0,0.5)', borderRadius:12 },
});

// ─────────────────────────────────────────────────────────────────────────────
// ── STATS STRIP ───────────────────────────────────────────────────────────────
const StatsStrip = ({ lostCount, foundCount }) => (
  <View style={SS.strip}>
    {[
      { val:lostCount,  lbl:'Lost Items',  color:C.red,     icon:'alert-circle-outline'     },
      { val:foundCount, lbl:'Found Items', color:C.green,   icon:'checkmark-circle-outline'  },
      { val:Math.max(0,lostCount-foundCount), lbl:'Still Pending', color:C.primary, icon:'time-outline' },
    ].map((s,i,arr) => (
      <React.Fragment key={i}>
        <View style={SS.stat}>
          <View style={[SS.iconWrap, { backgroundColor:s.color+'18' }]}>
            <Ionicons name={s.icon} size={16} color={s.color} />
          </View>
          <Text style={[SS.val, { color:s.color }]}>{s.val}</Text>
          <Text style={SS.lbl}>{s.lbl}</Text>
        </View>
        {i < arr.length-1 && <View style={SS.div} />}
      </React.Fragment>
    ))}
  </View>
);
const SS = StyleSheet.create({
  strip:   { flexDirection:'row', backgroundColor:C.surface, marginHorizontal:16, marginTop:14, borderRadius:18, borderWidth:1, borderColor:C.border, shadowColor:C.primary+'14', shadowOffset:{width:0,height:2}, shadowOpacity:1, shadowRadius:6, elevation:3 },
  stat:    { flex:1, alignItems:'center', paddingVertical:14, gap:4 },
  div:     { width:1, backgroundColor:C.border, marginVertical:12 },
  iconWrap:{ width:32, height:32, borderRadius:10, justifyContent:'center', alignItems:'center', marginBottom:2 },
  val:     { fontSize:19, fontWeight:'900' },
  lbl:     { fontSize:9, color:C.textLight, fontWeight:'600', textAlign:'center' },
});

// ─── AI BANNER ────────────────────────────────────────────────────────────────
const AIBanner = () => {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue:1.14, duration:1100, easing:EASE, useNativeDriver:true }),
      Animated.timing(pulse, { toValue:1,    duration:1100, easing:EASE, useNativeDriver:true }),
    ])).start();
  }, []);
  return (
    <View style={AB.wrap}>
      <LinearGradient colors={[C.primaryPale,'#fff']} start={{x:0,y:0}} end={{x:1,y:1}} style={StyleSheet.absoluteFill} />
      <View style={AB.inner}>
        <View style={AB.left}>
          <View style={AB.titleRow}>
            <Animated.View style={{ transform:[{scale:pulse}] }}>
              <LinearGradient colors={[C.primary,C.primaryDark]} style={AB.icon}><Ionicons name="sparkles" size={14} color="#fff" /></LinearGradient>
            </Animated.View>
            <Text style={AB.title}>AI Smart Match</Text>
          </View>
          <Text style={AB.desc}>Upload a photo — AI identifies & auto-fills your report instantly</Text>
        </View>
        <TouchableOpacity>
          <LinearGradient colors={[C.primary,C.primaryDark]} style={AB.btn}>
            <Ionicons name="scan-outline" size={13} color="#fff" />
            <Text style={AB.btnT}>Try Now</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};
const AB = StyleSheet.create({
  wrap:    { marginHorizontal:16, marginTop:14, marginBottom:4, borderRadius:18, overflow:'hidden', borderWidth:1.5, borderColor:C.primaryLight+'50' },
  inner:   { flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding:16 },
  left:    { flex:1, marginRight:12 },
  titleRow:{ flexDirection:'row', alignItems:'center', gap:8, marginBottom:5 },
  icon:    { width:28, height:28, borderRadius:8, justifyContent:'center', alignItems:'center' },
  title:   { fontSize:15, fontWeight:'800', color:C.textDark },
  desc:    { fontSize:11, color:C.textMid, lineHeight:16 },
  btn:     { flexDirection:'row', alignItems:'center', gap:6, paddingHorizontal:14, paddingVertical:10, borderRadius:12 },
  btnT:    { color:'#fff', fontWeight:'700', fontSize:12 },
});

// ─────────────────────────────────────────────────────────────────────────────
// ── MAIN SCREEN ───────────────────────────────────────────────────────────────
export default function LostAndFoundScreen({ navigation }) {
  const [activeTab,  setActiveTab]  = useState('lost');
  const [search,     setSearch]     = useState('');
  const [showForm,   setShowForm]   = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [lostItems,  setLostItems]  = useState(SEED_LOST);
  const [foundItems, setFoundItems] = useState(SEED_FOUND);

  const SB_H     = Platform.OS==='ios' ? 44 : (StatusBar.currentHeight||24);
  const tabSlide = useRef(new Animated.Value(0)).current;

  const hAnim = useEntrance(0,  -8);
  const tAnim = useEntrance(80,  12);
  const sAnim = useEntrance(150, 12);

  const switchTab = (tab) => {
    setActiveTab(tab);
    Animated.spring(tabSlide, { toValue:tab==='lost'?0:1, speed:22, bounciness:5, useNativeDriver:false }).start();
  };
  const indLeft = tabSlide.interpolate({ inputRange:[0,1], outputRange:['2%','51%'] });

  const addItem = useCallback((item) => {
    if (item.type==='lost') setLostItems(p=>[item,...p]);
    else                    setFoundItems(p=>[item,...p]);
  }, []);

  const filter = (items) => search.trim()
    ? items.filter(i => i.itemName.toLowerCase().includes(search.toLowerCase()) || i.location.toLowerCase().includes(search.toLowerCase()))
    : items;

  const items = filter(activeTab==='lost' ? lostItems : foundItems);

  return (
    <View style={S.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} translucent={false} />

      {/* HEADER */}
      <Animated.View style={[hAnim, S.header, { paddingTop:SB_H + 6 }]}>
        <TouchableOpacity style={S.hBtn} onPress={() => navigation?.goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color={C.textDark} />
        </TouchableOpacity>
        <View>
          <Text style={S.hTitle}>Lost & Found</Text>
          <Text style={S.hSub}>Aditya University Campus</Text>
        </View>
        <View style={S.hBadge}>
          <Text style={S.hBadgeN}>{items.length}</Text>
          <Text style={S.hBadgeSub}>items</Text>
        </View>
      </Animated.View>

      {/* TABS */}
      <Animated.View style={[tAnim, S.tabWrap]}>
        <View style={S.tabBar}>
          <Animated.View style={[S.tabInd, { left:indLeft }]} />
          {['lost','found'].map(tab => (
            <TouchableOpacity key={tab} style={S.tabBtn} onPress={() => switchTab(tab)} activeOpacity={0.85}>
              <Text style={[S.tabTxt, activeTab===tab && S.tabTxtOn]}>{tab==='lost' ? '🔴  Lost' : '🟢  Found'}</Text>
              <View style={[S.tabCnt, { backgroundColor:tab==='lost' ? C.red+'18' : C.green+'18' }]}>
                <Text style={[S.tabCntT, { color:tab==='lost' ? C.red : C.green }]}>{tab==='lost' ? lostItems.length : foundItems.length}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* SEARCH */}
      <Animated.View style={[sAnim, S.searchWrap]}>
        <View style={S.searchBar}>
          <Ionicons name="search-outline" size={17} color={C.textLight} />
          <TextInput style={S.searchInput} placeholder={`Search ${activeTab} items...`} placeholderTextColor={C.textLight} value={search} onChangeText={setSearch} />
          {search.length > 0 && <TouchableOpacity onPress={()=>setSearch('')}><Ionicons name="close-circle" size={17} color={C.textLight} /></TouchableOpacity>}
        </View>
      </Animated.View>

      {/* SCROLLABLE CONTENT */}
      <ScrollView style={{ flex:1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom:110 }} keyboardShouldPersistTaps="handled">
        <StatsStrip lostCount={lostItems.length} foundCount={foundItems.length} />
        <AIBanner />

        <View style={S.listHeader}>
          <View>
            <Text style={S.listTitle}>{activeTab==='lost' ? '🔴 Recently Lost' : '🟢 Recently Found'}</Text>
            <Text style={S.listSub}>{items.length} items · scroll down to see all</Text>
          </View>
          <TouchableOpacity style={S.filterBtn}>
            <Ionicons name="filter-outline" size={13} color={C.primary} />
            <Text style={S.filterBtnT}>Filter</Text>
          </TouchableOpacity>
        </View>

        <GridList items={items} onPress={setDetailItem} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity activeOpacity={0.87} style={S.fabWrap} onPress={() => setShowForm(true)}>
        <LinearGradient colors={[C.primaryLight, C.primary]} style={S.fab}>
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      <AddForm visible={showForm} type={activeTab} onClose={() => setShowForm(false)} onSubmit={addItem} />
      {detailItem && <DetailSheet item={detailItem} onClose={() => setDetailItem(null)} />}
    </View>
  );
}

const S = StyleSheet.create({
  root:   { flex:1, backgroundColor:C.bg },
  header: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:18, paddingBottom:12, backgroundColor:C.bg, borderBottomWidth:1, borderBottomColor:C.border },
  hBtn:   { width:36, height:36, justifyContent:'center' },
  hTitle: { fontSize:18, fontWeight:'900', color:C.textDark },
  hSub:   { fontSize:10, color:C.textLight, fontWeight:'600', marginTop:1 },
  hBadge: { alignItems:'center', backgroundColor:C.primaryPale, borderRadius:14, paddingHorizontal:14, paddingVertical:7, borderWidth:1, borderColor:C.border },
  hBadgeN:  { fontSize:17, fontWeight:'900', color:C.primary },
  hBadgeSub:{ fontSize:9, color:C.textLight, fontWeight:'600' },

  tabWrap: { paddingHorizontal:16, paddingTop:14, paddingBottom:2 },
  tabBar:  { flexDirection:'row', backgroundColor:C.surfaceAlt, borderRadius:14, padding:4, position:'relative', borderWidth:1, borderColor:C.border },
  tabInd:  { position:'absolute', top:4, bottom:4, width:'47%', borderRadius:11, backgroundColor:C.surface, shadowColor:C.primary+'40', shadowOffset:{width:0,height:2}, shadowOpacity:1, shadowRadius:6, elevation:4, borderWidth:1, borderColor:C.border },
  tabBtn:  { flex:1, paddingVertical:9, alignItems:'center', zIndex:1, flexDirection:'row', justifyContent:'center', gap:6 },
  tabTxt:  { fontSize:12, fontWeight:'600', color:C.textLight },
  tabTxtOn:{ color:C.primary, fontWeight:'800' },
  tabCnt:  { borderRadius:8, paddingHorizontal:7, paddingVertical:2 },
  tabCntT: { fontSize:11, fontWeight:'900' },

  searchWrap:  { paddingHorizontal:16, paddingTop:12, paddingBottom:2 },
  searchBar:   { flexDirection:'row', alignItems:'center', gap:10, backgroundColor:C.surface, borderRadius:14, paddingHorizontal:14, paddingVertical:11, borderWidth:1, borderColor:C.border },
  searchInput: { flex:1, fontSize:14, color:C.textDark, padding:0 },

  listHeader:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:16, paddingTop:18, paddingBottom:10 },
  listTitle: { fontSize:15, fontWeight:'900', color:C.textDark },
  listSub:   { fontSize:10, color:C.textLight, marginTop:2 },
  filterBtn: { flexDirection:'row', alignItems:'center', gap:5, backgroundColor:C.primaryPale, borderRadius:10, paddingHorizontal:12, paddingVertical:7, borderWidth:1, borderColor:C.border },
  filterBtnT:{ fontSize:12, fontWeight:'700', color:C.primary },

  fabWrap: { position:'absolute', bottom:28, right:22, shadowColor:C.primary+'55', shadowOffset:{width:0,height:6}, shadowOpacity:1, shadowRadius:14, elevation:10 },
  fab:     { width:58, height:58, borderRadius:29, justifyContent:'center', alignItems:'center' },
});