/**
 * LostAndFoundScreen.jsx
 *
 * Displays, searches, filters, and manages lost and found item reports on the
 * Aditya University campus. Students can:
 *   • Browse lost / found items in a two-column card grid.
 *   • Search by item name or location.
 *   • Filter by category (electronics, bags, ID cards, etc.).
 *   • Tap a card to open a full detail bottom sheet.
 *   • Claim a lost item ("I Found It"), which moves it to the Found tab.
 *   • Submit a new report via an add-item form with optional photo and AI
 *     auto-fill (degrades gracefully when the AI service is unavailable).
 *   • Run AI verification against an existing report (credits-gated).
 *
 * Data strategy
 * ─────────────
 * Seed data (SEED_LOST / SEED_FOUND) is shown immediately. On mount the
 * screen attempts to fetch live records from the backend; if successful, live
 * records are prepended and seed items with _isFromBackend=false are retained.
 * Backend errors are swallowed and logged — the screen stays fully functional.
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
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { lostFoundApi, moderationApi } from '../services/api';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const { width, height } = Dimensions.get('window');

/** Width of each card in the two-column grid. */
const CARD_W = (width - 16 * 2 - 10) / 2;

/** Shared colour palette. */
const COLORS = {
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
  gold:         '#F59E0B',
};

/** Smooth spring-like cubic-bezier reused across all animations. */
const EASE_OUT_EXPO = Easing.bezier(0.22, 1, 0.36, 1);

/**
 * Current user stub. Replace with real auth context when available.
 * @type {{ name: string, rollNo: string, phone: string }}
 */
const CURRENT_USER = { name: 'Varshitha', rollNo: '22BCE7890', phone: '9876543210' };

// ─── DATA ─────────────────────────────────────────────────────────────────────

/** Category filters shown in the filter modal. */
const FILTER_CATEGORIES = [
  { key: 'all',         label: 'All Items',   icon: 'apps-outline',           color: '#6C3CE1' },
  { key: 'electronics', label: 'Electronics', icon: 'phone-portrait-outline',  color: '#1565C0' },
  { key: 'idcards',     label: 'ID Cards',    icon: 'card-outline',            color: '#F0A500' },
  { key: 'bags',        label: 'Bags',        icon: 'bag-outline',             color: '#8D4E1F' },
  { key: 'books',       label: 'Books',       icon: 'book-outline',            color: '#00796B' },
  { key: 'accessories', label: 'Accessories', icon: 'watch-outline',           color: '#880E4F' },
  { key: 'others',      label: 'Others',      icon: 'cube-outline',            color: '#4A6560' },
];

/**
 * Icon and category metadata for each item type.
 * The `iconIdx` field on every item card indexes into this array.
 */
const ITEM_ICONS = [
  { icon: 'wallet',        label: 'Wallet',      color: '#C07030', bg: '#FFF3E0', filterKey: 'accessories' },
  { icon: 'phone-portrait',label: 'Phone',       color: '#1565C0', bg: '#E3F2FD', filterKey: 'electronics' },
  { icon: 'headset',       label: 'Headphones',  color: '#6C3CE1', bg: '#F0EAFF', filterKey: 'electronics' },
  { icon: 'key',           label: 'Keys',        color: '#E05252', bg: '#FDEAEA', filterKey: 'accessories' },
  { icon: 'card',          label: 'ID / Card',   color: '#F0A500', bg: '#FFF4D6', filterKey: 'idcards'     },
  { icon: 'laptop',        label: 'Laptop',      color: '#444',    bg: '#F0F0F0', filterKey: 'electronics' },
  { icon: 'shirt',         label: 'Clothing',    color: '#6B5EA8', bg: '#EEEAF8', filterKey: 'accessories' },
  { icon: 'book',          label: 'Books',       color: '#00796B', bg: '#E0F2F1', filterKey: 'books'       },
  { icon: 'bag',           label: 'Bag',         color: '#8D4E1F', bg: '#FBF0E8', filterKey: 'bags'        },
  { icon: 'watch',         label: 'Watch',       color: '#6C3CE1', bg: '#F0EAFF', filterKey: 'accessories' },
  { icon: 'umbrella',      label: 'Umbrella',    color: '#1565C0', bg: '#E3F2FD', filterKey: 'accessories' },
  { icon: 'cafe',          label: 'Bottle',      color: '#00796B', bg: '#E0F2F1', filterKey: 'accessories' },
  { icon: 'pencil',        label: 'Stationery',  color: '#6B5EA8', bg: '#EEEAF8', filterKey: 'books'       },
  { icon: 'glasses',       label: 'Glasses',     color: '#333',    bg: '#F5F5F5', filterKey: 'accessories' },
  { icon: 'musical-notes', label: 'Earphones',   color: '#E91E63', bg: '#FCE4EC', filterKey: 'electronics' },
  { icon: 'cube-outline',  label: 'Other',       color: '#4A6560', bg: '#EFF4F3', filterKey: 'others'      },
];

/** Maps AI-detected category name → ITEM_ICONS index for auto-filling the form. */
const CATEGORY_TO_ICON_INDEX = {
  Wallet: 0, Phone: 1, Headphones: 2, Keys: 3, 'ID/Card': 4,
  Laptop: 5, Clothing: 6, Books: 7, Bag: 8, Watch: 9,
  Umbrella: 10, Bottle: 11, Stationery: 12, Glasses: 13, Earphones: 14, Other: 15,
};

/**
 * Unsplash image URLs keyed by item type, used as card thumbnails.
 * Width is constrained to 400 px to keep download sizes small.
 */
const ITEM_IMAGES = {
  headphones:     'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
  wallet:         'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&q=80',
  phone:          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80',
  keys:           'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
  laptop:         'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80',
  bag:            'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80',
  watch:          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
  bottle:         'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&q=80',
  jacket:         'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=400&q=80',
  umbrella:       'https://images.unsplash.com/photo-1527540003-4debc444f40f?w=400&q=80',
  idcard:         'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&q=80',
  pencilcase:     'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400&q=80',
  earphones:      'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=400&q=80',
  glasses:        'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400&q=80',
  book:           'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80',
  airpods:        'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400&q=80',
  charger:        'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&q=80',
  backpack:       'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80',
  notebook:       'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
  sonyheadphones: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&q=80',
  smartwatch:     'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&q=80',
};

// ─── SEED DATA ────────────────────────────────────────────────────────────────

/**
 * Static lost-item records shown before the backend responds.
 * Kept in a separate constant so they can be excluded after live data loads.
 */
const SEED_LOST = [
  { id: 'l01', type: 'lost', personName: 'Arjun Mehta',   rollNo: '21CSE4501', phone: '9876501234', itemName: 'Blue Bose QC45 Headphones',    location: 'Central Library, 3rd Floor',   time: '2h ago',  date: '13/03/2026', desc: 'Left in Study Room 302. Black carrying case with "AM" written inside the lid.',                        iconIdx: 2,  urgent: true,  createdBy: '21CSE4501', imageUrl: ITEM_IMAGES.headphones    },
  { id: 'l02', type: 'lost', personName: CURRENT_USER.name, rollNo: CURRENT_USER.rollNo, phone: CURRENT_USER.phone, itemName: 'Brown Leather Bifold Wallet', location: 'Student Union Food Court',     time: '1d ago',  date: '12/03/2026', desc: 'Brown bifold wallet containing student ID, ATM card and ₹500 cash. Please return urgently.',           iconIdx: 0,  urgent: true,  createdBy: CURRENT_USER.rollNo,    imageUrl: ITEM_IMAGES.wallet        },
  { id: 'l03', type: 'lost', personName: 'Priya Sharma',  rollNo: '22ECE3302', phone: '9876503456', itemName: 'iPhone 14 Pro — Space Black',  location: 'Engineering Block B Restroom', time: '5h ago',  date: '13/03/2026', desc: 'No screen protector. Lock screen has a mountain range wallpaper.',                                    iconIdx: 1,  urgent: true,  createdBy: '22ECE3302', imageUrl: ITEM_IMAGES.phone         },
  { id: 'l04', type: 'lost', personName: 'Rohit Kumar',   rollNo: '21ME2210',  phone: '9876504567', itemName: 'North Face Jacket — Black L',  location: 'Athletic Centre Bench',        time: '2d ago',  date: '11/03/2026', desc: 'Black insulated jacket, Size L. Left on the bench outside the gymnasium.',                             iconIdx: 6,  urgent: false, createdBy: '21ME2210',  imageUrl: ITEM_IMAGES.jacket        },
  { id: 'l05', type: 'lost', personName: 'Divya Rao',     rollNo: '22EEE5540', phone: '9876505678', itemName: 'Blue Hydro Flask 32oz',        location: 'Science Block B, Room 204',    time: '4h ago',  date: '13/03/2026', desc: 'Blue bottle with a mountain sticker and an Aditya University sticker. 32 oz.',                          iconIdx: 11, urgent: false, createdBy: '22EEE5540', imageUrl: ITEM_IMAGES.bottle        },
  { id: 'l06', type: 'lost', personName: 'Kavya Nair',    rollNo: '22CSE1110', phone: '9876506789', itemName: 'Samsung Galaxy Watch 5',       location: 'Canteen Block A',              time: '6h ago',  date: '13/03/2026', desc: 'Black band Galaxy Watch 5 with a minor scratch on the bezel. "Kavya" engraved on the strap.',           iconIdx: 9,  urgent: true,  createdBy: '22CSE1110', imageUrl: ITEM_IMAGES.smartwatch    },
  { id: 'l07', type: 'lost', personName: 'Sai Kiran',     rollNo: '21CSE7890', phone: '9876507890', itemName: 'Dell Inspiron 15 — Silver',    location: 'CS Lab Block A, 2nd Floor',    time: '3h ago',  date: '13/03/2026', desc: 'Silver Dell laptop with blue stickers. Charger also missing. Contains important project files.',        iconIdx: 5,  urgent: true,  createdBy: '21CSE7890', imageUrl: ITEM_IMAGES.laptop        },
  { id: 'l08', type: 'lost', personName: 'Meena Kumari',  rollNo: '22ME4433',  phone: '9876508901', itemName: 'AirPods Pro — White',          location: 'Seminar Hall, Main Block',     time: '1h ago',  date: '13/03/2026', desc: 'White AirPods Pro in a white case. Right earpiece has a small green dot sticker.',                     iconIdx: 14, urgent: false, createdBy: '22ME4433',  imageUrl: ITEM_IMAGES.airpods       },
  { id: 'l09', type: 'lost', personName: 'Aakash Singh',  rollNo: '22EEE1231', phone: '9876509012', itemName: 'Fossil Chronograph Watch',     location: 'Lab 3, Mechanical Block',      time: '5d ago',  date: '08/03/2026', desc: '"A.S" initials engraved on the back. Brown leather strap, silver dial.',                              iconIdx: 9,  urgent: false, createdBy: '22EEE1231', imageUrl: ITEM_IMAGES.watch         },
  { id: 'l10', type: 'lost', personName: 'Pooja Reddy',   rollNo: '21ECE2200', phone: '9876510123', itemName: 'Dark Green Adidas Backpack',   location: 'Auditorium, Main Block',       time: '2d ago',  date: '11/03/2026', desc: 'Dark green backpack containing notebooks, a charger and a red thermos bottle.',                         iconIdx: 8,  urgent: false, createdBy: '21ECE2200', imageUrl: ITEM_IMAGES.backpack      },
  { id: 'l11', type: 'lost', personName: 'Nikhil Verma',  rollNo: '22CSE5566', phone: '9876511234', itemName: 'Black Prescription Glasses',   location: 'Library Reading Area, Table 12',time: '7h ago', date: '13/03/2026', desc: 'Black rectangular frame glasses with blue-tint lenses. Left at reading table 12.',                    iconIdx: 13, urgent: false, createdBy: '22CSE5566', imageUrl: ITEM_IMAGES.glasses       },
  { id: 'l12', type: 'lost', personName: 'Swathi Goud',   rollNo: '22ECE8811', phone: '9876512345', itemName: 'boAt Airdopes 441 — Teal',     location: 'Sports Ground Bleachers',      time: '3d ago',  date: '10/03/2026', desc: 'Teal and black wireless earbuds. Charging case has a crack on the lid.',                              iconIdx: 14, urgent: false, createdBy: '22ECE8811', imageUrl: ITEM_IMAGES.earphones     },
  { id: 'l13', type: 'lost', personName: 'Tarun Babu',    rollNo: '21ME9900',  phone: '9876513456', itemName: 'Engineering Drawing Set',      location: 'Drawing Hall, Block D',        time: '1d ago',  date: '12/03/2026', desc: 'Pentel stationery set in a blue zip pouch, including a protractor, compass and ruler.',              iconIdx: 12, urgent: false, createdBy: '21ME9900',  imageUrl: ITEM_IMAGES.pencilcase    },
  { id: 'l14', type: 'lost', personName: 'Hema Latha',    rollNo: '22CSE3341', phone: '9876514567', itemName: 'Red Collapsible Umbrella',     location: 'Campus Wi-Fi Lounge',          time: '6h ago',  date: '13/03/2026', desc: 'Compact red folding umbrella with slight wear on the handle. Left near the Wi-Fi lounge.',            iconIdx: 10, urgent: false, createdBy: '22CSE3341', imageUrl: ITEM_IMAGES.umbrella      },
  { id: 'l15', type: 'lost', personName: 'Vikram Rao',    rollNo: '21ME1122',  phone: '9876515678', itemName: 'Sony WH-1000XM4 Headphones',  location: 'Cafeteria, Main Counter Area', time: '4h ago',  date: '13/03/2026', desc: 'Black over-ear Sony headphones without a case. Last seen near the food counter.',                      iconIdx: 2,  urgent: true,  createdBy: '21ME1122',  imageUrl: ITEM_IMAGES.sonyheadphones},
  { id: 'l16', type: 'lost', personName: 'Deepa Nair',    rollNo: '22EEE4499', phone: '9876516789', itemName: 'MacBook MagSafe 67W Charger',  location: 'Block C Study Hall',           time: '8h ago',  date: '13/03/2026', desc: '"DN" written in black marker on the brick. White Apple MagSafe 3 charger (67W).',                    iconIdx: 15, urgent: false, createdBy: '22EEE4499', imageUrl: ITEM_IMAGES.charger       },
];

const SEED_FOUND = [
  { id: 'f01', type: 'found', personName: 'Sneha Reddy',    rollNo: '22ECE3105', phone: '9876517890', itemName: 'Keys with Red Keychain',           location: 'Main Gate Security Office',   time: '1h ago',  date: '13/03/2026', desc: 'Three keys with a red keychain and a mini LED torch. Submitted to main gate security.',                  iconIdx: 3,  urgent: false, createdBy: '22ECE3105', imageUrl: ITEM_IMAGES.keys          },
  { id: 'f02', type: 'found', personName: 'Kiran Babu',     rollNo: '21CSE7701', phone: '9876518901', itemName: 'Samsung Galaxy Watch 4',           location: 'Central Canteen, Table 6',    time: '6h ago',  date: '13/03/2026', desc: 'Black band watch with a minor screen scratch on the right side. Currently kept with the warden.',       iconIdx: 9,  urgent: false, createdBy: '21CSE7701', imageUrl: ITEM_IMAGES.smartwatch    },
  { id: 'f03', type: 'found', personName: 'Meera Nair',     rollNo: '22ME1004',  phone: '9876519012', itemName: 'Purple Folding Umbrella',          location: 'CS Lab Block A Entrance',     time: '2h ago',  date: '13/03/2026', desc: 'Compact collapsible purple umbrella with a floral pattern inside. Found near the lab door.',             iconIdx: 10, urgent: false, createdBy: '22ME1004',  imageUrl: ITEM_IMAGES.umbrella      },
  { id: 'f04', type: 'found', personName: 'Anil Kumar',     rollNo: '21CSE0092', phone: '9876520123', itemName: 'Aditya University Student ID Card',location: 'Sports Ground, Near Goal Post',time: '3h ago',  date: '13/03/2026', desc: 'Student ID card found on the ground. Name clearly visible. Submitted to the admin office.',            iconIdx: 4,  urgent: false, createdBy: '21CSE0092', imageUrl: ITEM_IMAGES.idcard        },
  { id: 'f05', type: 'found', personName: 'Lakshmi Devi',   rollNo: '22EEE9901', phone: '9876521234', itemName: 'Bose Headphones in Black Case',    location: 'Block C Corridor, Near Rm 204',time: '5h ago', date: '13/03/2026', desc: 'Blue Bose headphones in a black case. Found in the corridor. Handed to the Class Representative.',    iconIdx: 2,  urgent: false, createdBy: '22EEE9901', imageUrl: ITEM_IMAGES.headphones    },
  { id: 'f06', type: 'found', personName: 'Ravi Teja',      rollNo: '21CSE3312', phone: '9876522345', itemName: 'Blue Stationery Zip Pouch',        location: 'Library Reading Hall, Table 8',time: '8h ago', date: '13/03/2026', desc: 'Blue zip pouch containing a ruler, pens, an eraser and a compass. Placed at the library help desk.',  iconIdx: 12, urgent: false, createdBy: '21CSE3312', imageUrl: ITEM_IMAGES.pencilcase    },
  { id: 'f07', type: 'found', personName: 'Harini Devi',    rollNo: '22CSE2234', phone: '9876523456', itemName: 'Black 65W Laptop Charger',         location: 'CS Lab 2, Block B',           time: '4h ago',  date: '13/03/2026', desc: 'Black laptop charger (65W) found under a desk in Lab 2. Has a yellow sticker on the brick.',           iconIdx: 15, urgent: false, createdBy: '22CSE2234', imageUrl: ITEM_IMAGES.charger       },
  { id: 'f08', type: 'found', personName: 'Suresh Babu',    rollNo: '21ME0045',  phone: '9876524567', itemName: 'Matte Black Steel Bottle 1L',      location: 'Gymnasium Entry Area',        time: '2d ago',  date: '11/03/2026', desc: 'Matte black 1L steel bottle with "SB" initials on the base. Found at the gym entry gate.',             iconIdx: 11, urgent: false, createdBy: '21ME0045',  imageUrl: ITEM_IMAGES.bottle        },
  { id: 'f09', type: 'found', personName: 'Anjali Reddy',   rollNo: '22ECE4421', phone: '9876525678', itemName: 'Brown Leather Wallet',             location: 'Canteen Seating Area',        time: '1d ago',  date: '12/03/2026', desc: 'Brown bifold wallet containing some cash and an ID card. Found between canteen seats.',                iconIdx: 0,  urgent: true,  createdBy: '22ECE4421', imageUrl: ITEM_IMAGES.wallet        },
  { id: 'f10', type: 'found', personName: 'Pradeep Rao',    rollNo: '21CSE6677', phone: '9876526789', itemName: 'Apple AirPods Pro — White',        location: 'Library Study Cubicle 7B',    time: '3h ago',  date: '13/03/2026', desc: 'White AirPods Pro in case. Owner name not found nearby. Currently held by the librarian.',              iconIdx: 14, urgent: false, createdBy: '21CSE6677', imageUrl: ITEM_IMAGES.airpods       },
  { id: 'f11', type: 'found', personName: 'Chandra Sekhar', rollNo: '22ME5532',  phone: '9876527890', itemName: 'Black Reading Glasses',            location: 'Reading Room, Library Block', time: '5h ago',  date: '13/03/2026', desc: 'Black rectangular glasses found on reading table 9. Handed over to the librarian.',                    iconIdx: 13, urgent: false, createdBy: '22ME5532',  imageUrl: ITEM_IMAGES.glasses       },
  { id: 'f12', type: 'found', personName: 'Radha Krishna',  rollNo: '21EEE3310', phone: '9876528901', itemName: 'Set of 3 Spiral Notebooks',        location: 'Seminar Hall Exit Area',      time: '6h ago',  date: '13/03/2026', desc: 'Three spiral notebooks labelled Maths, Physics and Chemistry. Available at the department office.',    iconIdx: 7,  urgent: false, createdBy: '21EEE3310', imageUrl: ITEM_IMAGES.notebook      },
  { id: 'f13', type: 'found', personName: 'Pavithra S',     rollNo: '22CSE7788', phone: '9876529012', itemName: "Fossil Men's Leather Watch",       location: 'Sports Ground Pavilion',      time: '1d ago',  date: '12/03/2026', desc: 'Brown strap Fossil watch with "FS" engraved on the back. Found on the pavilion bench.',                iconIdx: 9,  urgent: false, createdBy: '22CSE7788', imageUrl: ITEM_IMAGES.watch         },
  { id: 'f14', type: 'found', personName: 'Venkat Rao',     rollNo: '21ME2289',  phone: '9876530123', itemName: 'Sony WH-1000XM4 Headphones',       location: 'Block A Rooftop Garden',      time: '2h ago',  date: '13/03/2026', desc: 'Black Sony over-ear headphones near the garden bench. No case. Fully functional.',                      iconIdx: 2,  urgent: false, createdBy: '21ME2289',  imageUrl: ITEM_IMAGES.sonyheadphones},
  { id: 'f15', type: 'found', personName: 'Bhavya Teja',    rollNo: '22ECE0011', phone: '9876531234', itemName: 'Samsung Galaxy A53 — Blue',        location: 'Workshop Block Exit',         time: '7h ago',  date: '13/03/2026', desc: 'Blue Samsung A53 without a case. Screen locked. Submitted to workshop block security.',                 iconIdx: 1,  urgent: true,  createdBy: '22ECE0011', imageUrl: ITEM_IMAGES.phone         },
  { id: 'f16', type: 'found', personName: 'Naga Sai',       rollNo: '21CSE8899', phone: '9876532345', itemName: 'Navy Blue Adidas Backpack',         location: 'Main Auditorium, Row 12',     time: '3d ago',  date: '10/03/2026', desc: 'Navy blue Adidas backpack with a red logo. Contains books and a charger. Held with security.',          iconIdx: 8,  urgent: false, createdBy: '21CSE8899', imageUrl: ITEM_IMAGES.bag           },
];

// ─── AI CREDITS (module-level, shared across modal instances) ─────────────────

/**
 * Simple module-level credit counter for the AI Verification feature.
 * A proper implementation would persist this in AsyncStorage or the backend.
 */
let _aiCreditsRemaining = 3;
const getAiCredits   = ()  => _aiCreditsRemaining;
const consumeCredit  = ()  => { _aiCreditsRemaining = Math.max(0, _aiCreditsRemaining - 1); };

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/**
 * Maps a raw backend LostItem document to the UI shape used by this screen.
 *
 * @param {object} backendItem - Raw document returned by the API.
 * @returns {object|null} UI-ready item, or null if the input is invalid.
 */
function mapBackendItemToUi(backendItem) {
  if (!backendItem?._id) return null;
  return {
    id:            String(backendItem._id),
    type:          backendItem.status === 'found' ? 'found' : 'lost',
    personName:    backendItem.postedByName   || 'Anonymous',
    rollNo:        backendItem.postedByRoll   || '',
    phone:         backendItem.contactNumber  || '',
    itemName:      backendItem.itemName       || '(Untitled)',
    location:      backendItem.location       || 'Unknown',
    time:          'Recently',
    date:          backendItem.dateLost ? new Date(backendItem.dateLost).toLocaleDateString() : '',
    desc:          backendItem.description    || '',
    iconIdx:       15,
    urgent:        false,
    createdBy:     backendItem.postedByRoll   || '',
    imageUrl:      backendItem.imageUrl       || null,
    _isFromBackend: true,
  };
}

/**
 * Converts a UI item (from the add form) to the backend API payload shape.
 *
 * @param {object} uiItem - Item as held in local state.
 * @returns {object} Backend-compatible payload.
 */
function mapUiItemToBackendPayload(uiItem) {
  return {
    itemName:      uiItem.itemName,
    description:   uiItem.desc          || '',
    imageUrl:      uiItem.imageUrl      || undefined,
    location:      uiItem.location      || '',
    contactNumber: uiItem.phone         || '',
    status:        uiItem.type === 'found' ? 'found' : 'lost',
    dateLost:      new Date().toISOString(),
  };
}

/** Returns the current time formatted as "H:MM AM/PM". */
function getCurrentTime() {
  const d = new Date();
  let hours   = d.getHours();
  const mins  = d.getMinutes();
  const ampm  = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${String(mins).padStart(2, '0')} ${ampm}`;
}

/** Returns the current date formatted as "DD/MM/YYYY". */
function getCurrentDate() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

// ─── HOOKS ────────────────────────────────────────────────────────────────────

/**
 * Drives a fade-in + slide-up entrance animation.
 *
 * @param {number} delay             - Start delay in milliseconds.
 * @param {number} [slideDistance=18] - Vertical distance in pixels.
 */
function useEntranceAnimation(delay = 0, slideDistance = 18) {
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(slideDistance)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 520, delay, easing: EASE_OUT_EXPO, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 520, delay, easing: EASE_OUT_EXPO, useNativeDriver: true }),
    ]).start();
  }, []);

  return { opacity, transform: [{ translateY }] };
}

// ─── AI HELPERS ───────────────────────────────────────────────────────────────

/**
 * Analyses an image with an external multimodal LLM and returns a pre-filled
 * form object. Returns null when the service is unavailable — callers fall back
 * to manual entry.
 *
 * NOTE: Direct device-to-anthropic-api calls require an API key. Until a
 * backend proxy is set up this always returns null to avoid 401 errors.
 */
const analyzeImageWithAI = async (_base64Image, _type) => null;

/**
 * Verifies a user's ownership claim against a reported item using an LLM.
 * Returns null when unavailable — the UI degrades gracefully.
 */
const verifyItemWithAI = async (_args) => null;

/**
 * Sends item text through the backend moderation endpoint.
 *
 * @param {{ itemName?: string, description?: string }} fields
 * @returns {{ safe: boolean, reason: string|null, category: string }}
 */
async function moderateContent({ itemName, description }) {
  const text = [itemName, description].filter(Boolean).join('\n').trim();
  if (!text) return { safe: true, reason: null, category: 'safe' };

  const result = await moderationApi.text(text);
  return {
    safe:     result.safe !== false,
    reason:   result.reason || '',
    category: result.safe === false ? 'unsafe' : 'safe',
  };
}

// ─── AI VERIFY MODAL ─────────────────────────────────────────────────────────

/**
 * Credits-gated AI verification modal. Runs up to three checks against a
 * reported item: image matching, description similarity, and duplicate
 * detection. Falls back gracefully when the AI service is unavailable.
 *
 * @param {object}   item    - The item being claimed.
 * @param {Function} onClose - Called to dismiss the modal.
 */
const AIVerifyModal = ({ item, onClose }) => {
  const [credits,      setCredits]     = useState(getAiCredits());
  const [claimDesc,    setClaimDesc]   = useState('');
  const [isLoading,    setIsLoading]   = useState(false);
  const [result,       setResult]      = useState(null);
  const [errorMessage, setErrorMessage]= useState('');

  const handleRunVerification = async () => {
    if (credits <= 0)           { setErrorMessage('You have used all your AI verification credits.'); return; }
    if (!claimDesc.trim())      { setErrorMessage('Please describe the item to verify your claim.'); return; }

    setIsLoading(true);
    setErrorMessage('');
    setResult(null);

    consumeCredit();
    setCredits(getAiCredits());

    const verificationResult = await verifyItemWithAI({ item, claimDescription: claimDesc });
    setIsLoading(false);

    if (!verificationResult) {
      setErrorMessage('Verification failed. Please try again.');
      return;
    }
    setResult(verificationResult);
  };

  const verdictColor = (verdict) => {
    if (verdict === 'High' || verdict === 'Likely Owner') return COLORS.green;
    if (verdict === 'Medium' || verdict === 'Uncertain')  return COLORS.gold;
    return COLORS.red;
  };

  const ScoreBar = ({ score }) => (
    <View style={aiVerifyStyles.scoreBarTrack}>
      <View style={[
        aiVerifyStyles.scoreBarFill,
        { width: `${score}%`, backgroundColor: score >= 70 ? COLORS.green : score >= 40 ? COLORS.gold : COLORS.red },
      ]} />
    </View>
  );

  const CHECK_ICONS = [
    { icon: 'images-outline',       label: 'Image Matching'         },
    { icon: 'document-text-outline',label: 'Description Similarity' },
    { icon: 'copy-outline',         label: 'Duplicate Detection'    },
  ];

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <View style={aiVerifyStyles.overlay}>
        <View style={aiVerifyStyles.sheet}>
          <View style={aiVerifyStyles.dragHandle} />

          <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={aiVerifyStyles.header}>
            <View style={{ flex: 1 }}>
              <Text style={aiVerifyStyles.headerTitle}>🤖  AI Item Verification</Text>
              <Text style={aiVerifyStyles.headerSubtitle}>
                Powered by Claude · {credits} credit{credits !== 1 ? 's' : ''} remaining
              </Text>
            </View>
            <TouchableOpacity style={aiVerifyStyles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={18} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView style={aiVerifyStyles.scroll} contentContainerStyle={{ paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
            {/* Checks included */}
            <Text style={aiVerifyStyles.sectionLabel}>Verification Checks Included</Text>
            <View style={aiVerifyStyles.checksRow}>
              {CHECK_ICONS.map((check, index) => (
                <View key={index} style={aiVerifyStyles.checkBadge}>
                  <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={aiVerifyStyles.checkBadgeIcon}>
                    <Ionicons name={check.icon} size={14} color="#fff" />
                  </LinearGradient>
                  <Text style={aiVerifyStyles.checkBadgeLabel}>{check.label}</Text>
                </View>
              ))}
            </View>

            {/* Item being verified */}
            <View style={aiVerifyStyles.itemBox}>
              <Text style={aiVerifyStyles.itemBoxLabel}>Item Being Verified</Text>
              <Text style={aiVerifyStyles.itemBoxName}>{item.itemName}</Text>
              <Text style={aiVerifyStyles.itemBoxLocation}>
                <Ionicons name="location-outline" size={11} /> {item.location}
              </Text>
            </View>

            {/* Claim description input */}
            <Text style={aiVerifyStyles.sectionLabel}>Your Claim Description</Text>
            <Text style={aiVerifyStyles.hintText}>
              Describe the item in detail — colour, brand, any distinguishing marks.
              The AI will match this against the report.
            </Text>
            <TextInput
              style={aiVerifyStyles.claimInput}
              placeholder="e.g. It's my dark blue Bose QC45, the right ear cup has a small scuff and my name is written inside the case..."
              placeholderTextColor={COLORS.textLight}
              value={claimDesc}
              onChangeText={setClaimDesc}
              multiline
              textAlignVertical="top"
            />

            {errorMessage ? <Text style={aiVerifyStyles.errorText}>{errorMessage}</Text> : null}

            {/* Run button */}
            {!result && !isLoading && (
              <TouchableOpacity
                onPress={handleRunVerification}
                activeOpacity={0.87}
                style={{ marginTop: 14 }}
                disabled={credits <= 0}
              >
                <LinearGradient
                  colors={credits > 0 ? [COLORS.primary, COLORS.primaryDark] : ['#ccc', '#aaa']}
                  style={aiVerifyStyles.runButton}
                >
                  <Ionicons name="sparkles-outline" size={17} color="#fff" />
                  <Text style={aiVerifyStyles.runButtonText}>
                    {credits > 0 ? 'Run AI Verification' : 'No Credits Left'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {isLoading && (
              <View style={aiVerifyStyles.loadingBox}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <View>
                  <Text style={aiVerifyStyles.loadingTitle}>AI is verifying your claim…</Text>
                  <Text style={aiVerifyStyles.loadingSubtitle}>
                    Running 3 checks — image match · description · duplicates
                  </Text>
                </View>
              </View>
            )}

            {/* Results */}
            {result && (
              <View style={aiVerifyStyles.resultsWrapper}>
                {/* Overall verdict */}
                <View style={[aiVerifyStyles.verdictBox, { borderColor: verdictColor(result.overallVerdict) }]}>
                  <Text style={[aiVerifyStyles.verdictLabel, { color: verdictColor(result.overallVerdict) }]}>
                    {result.overallVerdict}
                  </Text>
                  <Text style={aiVerifyStyles.verdictSummary}>{result.summary}</Text>
                </View>

                {/* Image Match */}
                <View style={aiVerifyStyles.checkCard}>
                  <View style={aiVerifyStyles.checkCardHeader}>
                    <Ionicons name="images-outline" size={16} color={COLORS.primary} />
                    <Text style={aiVerifyStyles.checkCardTitle}>Image Matching</Text>
                    <View style={[aiVerifyStyles.checkVerdict, { backgroundColor: `${verdictColor(result.imageMatch?.verdict)}22` }]}>
                      <Text style={[aiVerifyStyles.checkVerdictText, { color: verdictColor(result.imageMatch?.verdict) }]}>
                        {result.imageMatch?.verdict}
                      </Text>
                    </View>
                  </View>
                  <ScoreBar score={result.imageMatch?.score || 0} />
                  <Text style={aiVerifyStyles.checkNote}>{result.imageMatch?.note}</Text>
                </View>

                {/* Description Similarity */}
                <View style={aiVerifyStyles.checkCard}>
                  <View style={aiVerifyStyles.checkCardHeader}>
                    <Ionicons name="document-text-outline" size={16} color={COLORS.primary} />
                    <Text style={aiVerifyStyles.checkCardTitle}>Description Similarity</Text>
                    <View style={[aiVerifyStyles.checkVerdict, { backgroundColor: `${verdictColor(result.descriptionSimilarity?.verdict)}22` }]}>
                      <Text style={[aiVerifyStyles.checkVerdictText, { color: verdictColor(result.descriptionSimilarity?.verdict) }]}>
                        {result.descriptionSimilarity?.verdict}
                      </Text>
                    </View>
                  </View>
                  <ScoreBar score={result.descriptionSimilarity?.score || 0} />
                  <Text style={aiVerifyStyles.checkNote}>{result.descriptionSimilarity?.note}</Text>
                </View>

                {/* Duplicate Detection */}
                <View style={aiVerifyStyles.checkCard}>
                  <View style={aiVerifyStyles.checkCardHeader}>
                    <Ionicons name="copy-outline" size={16} color={COLORS.primary} />
                    <Text style={aiVerifyStyles.checkCardTitle}>Duplicate Detection</Text>
                    <View style={[aiVerifyStyles.checkVerdict, {
                      backgroundColor: result.duplicateDetection?.isDuplicate ? `${COLORS.red}22` : `${COLORS.green}22`,
                    }]}>
                      <Text style={[aiVerifyStyles.checkVerdictText, {
                        color: result.duplicateDetection?.isDuplicate ? COLORS.red : COLORS.green,
                      }]}>
                        {result.duplicateDetection?.isDuplicate ? 'Duplicate Found' : 'No Duplicate'}
                      </Text>
                    </View>
                  </View>
                  <Text style={aiVerifyStyles.checkNote}>{result.duplicateDetection?.note}</Text>
                </View>

                <Text style={aiVerifyStyles.creditsFootnote}>
                  {getAiCredits()} AI verification credit{getAiCredits() !== 1 ? 's' : ''} remaining
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const aiVerifyStyles = StyleSheet.create({
  overlay:          { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet:            { backgroundColor: COLORS.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: height * 0.92, paddingBottom: Platform.OS === 'ios' ? 20 : 0 },
  dragHandle:       { width: 36, height: 4, borderRadius: 2, backgroundColor: COLORS.border, alignSelf: 'center', marginTop: 12 },
  header:           { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle:      { fontSize: 16, fontWeight: '800', color: '#fff' },
  headerSubtitle:   { fontSize: 11, color: 'rgba(255,255,255,0.72)', marginTop: 2 },
  closeButton:      { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  scroll:           { padding: 16 },
  sectionLabel:     { fontSize: 11, fontWeight: '700', color: COLORS.textLight, letterSpacing: 0.6, textTransform: 'uppercase', marginTop: 16, marginBottom: 8 },
  hintText:         { fontSize: 12, color: COLORS.textMid, lineHeight: 18, marginBottom: 10 },
  checksRow:        { flexDirection: 'row', gap: 8, marginBottom: 4 },
  checkBadge:       { flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 10, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: COLORS.border },
  checkBadgeIcon:   { width: 30, height: 30, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  checkBadgeLabel:  { fontSize: 9, fontWeight: '700', color: COLORS.textMid, textAlign: 'center' },
  itemBox:          { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginTop: 4, borderWidth: 1, borderColor: COLORS.border },
  itemBoxLabel:     { fontSize: 10, fontWeight: '700', color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  itemBoxName:      { fontSize: 14, fontWeight: '800', color: COLORS.textDark },
  itemBoxLocation:  { fontSize: 11, color: COLORS.textLight, marginTop: 3 },
  claimInput:       { backgroundColor: COLORS.surface, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, color: COLORS.textDark, minHeight: 90, marginTop: 4 },
  errorText:        { fontSize: 12, color: COLORS.red, fontWeight: '600', marginTop: 8 },
  runButton:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 16, paddingVertical: 15 },
  runButtonText:    { fontSize: 15, fontWeight: '800', color: '#fff' },
  loadingBox:       { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.primaryPale, borderRadius: 14, padding: 14, marginTop: 14, borderWidth: 1, borderColor: COLORS.border },
  loadingTitle:     { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  loadingSubtitle:  { fontSize: 11, color: COLORS.textLight, marginTop: 2 },
  resultsWrapper:   { marginTop: 16, gap: 10 },
  verdictBox:       { borderRadius: 16, borderWidth: 2, padding: 16, backgroundColor: COLORS.surface },
  verdictLabel:     { fontSize: 18, fontWeight: '900', marginBottom: 6 },
  verdictSummary:   { fontSize: 13, color: COLORS.textMid, lineHeight: 19 },
  checkCard:        { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border, gap: 8 },
  checkCardHeader:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkCardTitle:   { flex: 1, fontSize: 13, fontWeight: '700', color: COLORS.textDark },
  checkVerdict:     { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  checkVerdictText: { fontSize: 10, fontWeight: '800' },
  scoreBarTrack:    { height: 6, backgroundColor: '#EEE', borderRadius: 3, overflow: 'hidden' },
  scoreBarFill:     { height: '100%', borderRadius: 3 },
  checkNote:        { fontSize: 12, color: COLORS.textMid, lineHeight: 18 },
  creditsFootnote:  { fontSize: 11, color: COLORS.textLight, textAlign: 'center', marginTop: 6 },
});

// ─── FILTER MODAL ─────────────────────────────────────────────────────────────

/**
 * Category filter bottom sheet.
 *
 * @param {boolean}  visible        - Whether the modal is visible.
 * @param {string}   selectedFilter - Currently active filter key.
 * @param {Function} onSelect       - Called with the chosen filter key.
 * @param {Function} onClose        - Dismisses the modal.
 */
const FilterModal = ({ visible, selectedFilter, onSelect, onClose }) => (
  <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={filterModalStyles.overlay} />
    </TouchableWithoutFeedback>

    <View style={filterModalStyles.sheet}>
      <View style={filterModalStyles.dragHandle} />
      <Text style={filterModalStyles.title}>Filter by Category</Text>
      <ScrollView contentContainerStyle={filterModalStyles.grid} showsVerticalScrollIndicator={false}>
        {FILTER_CATEGORIES.map((category) => {
          const isActive = selectedFilter === category.key;
          return (
            <TouchableOpacity
              key={category.key}
              style={[filterModalStyles.chip, isActive && { backgroundColor: category.color, borderColor: category.color }]}
              onPress={() => { onSelect(category.key); onClose(); }}
              activeOpacity={0.8}
            >
              <Ionicons name={category.icon} size={15} color={isActive ? '#fff' : category.color} />
              <Text style={[filterModalStyles.chipText, isActive && { color: '#fff' }]}>{category.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  </Modal>
);

const filterModalStyles = StyleSheet.create({
  overlay:   { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.40)' },
  sheet:     { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40 },
  dragHandle:{ width: 36, height: 4, borderRadius: 2, backgroundColor: COLORS.border, alignSelf: 'center', marginBottom: 16 },
  title:     { fontSize: 16, fontWeight: '800', color: COLORS.textDark, marginBottom: 14 },
  grid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip:      { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: COLORS.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1.5, borderColor: COLORS.border },
  chipText:  { fontSize: 13, fontWeight: '700', color: COLORS.textDark },
});

// ─── GRID CARD ────────────────────────────────────────────────────────────────

/**
 * Card displayed in the two-column item grid.
 *
 * @param {object}   item    - Item data object.
 * @param {Function} onPress - Called with the item when tapped.
 * @param {number}   delay   - Entrance animation delay in ms.
 */
const GridCard = ({ item, onPress, delay }) => {
  const entranceStyle = useEntranceAnimation(delay, 24);
  const pressScale    = useRef(new Animated.Value(1)).current;
  const [imageError,  setImageError]  = useState(false);

  const isOwner = item.createdBy === CURRENT_USER.rollNo;
  const iconMeta = ITEM_ICONS[item.iconIdx] ?? ITEM_ICONS[15];
  const isLost   = item.type === 'lost';

  const handlePressIn  = () => Animated.spring(pressScale, { toValue: 0.96, speed: 22, useNativeDriver: true }).start();
  const handlePressOut = () => Animated.spring(pressScale, { toValue: 1,    speed: 16, useNativeDriver: true }).start();

  return (
    <Animated.View style={[entranceStyle, { transform: [...entranceStyle.transform, { scale: pressScale }], width: CARD_W }]}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onPress(item)}
        activeOpacity={1}
        style={gridStyles.card}
      >
        {/* Image / icon fallback */}
        <View style={gridStyles.imageBox}>
          {item.imageUrl && !imageError ? (
            <>
              <Image source={{ uri: item.imageUrl }} style={gridStyles.itemImage} resizeMode="cover" onError={() => setImageError(true)} />
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.42)']} style={StyleSheet.absoluteFill} pointerEvents="none" />
            </>
          ) : (
            <View style={[gridStyles.iconFallback, { backgroundColor: iconMeta.bg }]}>
              <Ionicons name={iconMeta.icon} size={52} color={iconMeta.color} />
            </View>
          )}

          <View style={gridStyles.badgeRow}>
            {item.urgent && (
              <View style={gridStyles.urgentBadge}>
                <Ionicons name="flash" size={8} color="#fff" />
                <Text style={gridStyles.urgentText}>URGENT</Text>
              </View>
            )}
            {isOwner && (
              <View style={gridStyles.youBadge}>
                <Text style={gridStyles.youBadgeText}>YOU</Text>
              </View>
            )}
          </View>

          <View style={[gridStyles.statusStamp, { backgroundColor: isLost ? 'rgba(229,57,53,0.90)' : 'rgba(27,138,76,0.90)' }]}>
            <Ionicons name={isLost ? 'alert-circle' : 'checkmark-circle'} size={9} color="#fff" />
            <Text style={gridStyles.statusStampText}>{isLost ? 'LOST' : 'FOUND'}</Text>
          </View>
        </View>

        {/* Info */}
        <View style={gridStyles.infoSection}>
          <View style={[gridStyles.categoryPill, { backgroundColor: iconMeta.bg }]}>
            <Ionicons name={iconMeta.icon} size={9} color={iconMeta.color} />
            <Text style={[gridStyles.categoryPillText, { color: iconMeta.color }]}>{iconMeta.label}</Text>
          </View>
          <Text style={gridStyles.itemName} numberOfLines={2}>{item.itemName}</Text>
          <View style={gridStyles.locationRow}>
            <Ionicons name="location-outline" size={10} color={COLORS.textLight} />
            <Text style={gridStyles.locationText} numberOfLines={1}>{item.location}</Text>
          </View>
          <View style={gridStyles.metaRow}>
            <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={gridStyles.avatarDot}>
              <Text style={gridStyles.avatarDotText}>{item.personName[0]}</Text>
            </LinearGradient>
            <Text style={gridStyles.reporterName} numberOfLines={1}>{item.personName.split(' ')[0]}</Text>
            <Text style={gridStyles.metaSeparator}>·</Text>
            <Text style={gridStyles.timeText}>{item.time}</Text>
          </View>
        </View>

        {/* Action button */}
        {!isOwner ? (
          <TouchableOpacity
            style={[gridStyles.actionButton, { backgroundColor: isLost ? COLORS.primary : COLORS.green }]}
            onPress={() => onPress(item)}
            activeOpacity={0.85}
          >
            <Ionicons name={isLost ? 'chatbubble-ellipses-outline' : 'call-outline'} size={12} color="#fff" />
            <Text style={gridStyles.actionButtonText}>{isLost ? "I Found It!" : "It's Mine!"}</Text>
          </TouchableOpacity>
        ) : (
          <View style={gridStyles.ownerButton}>
            <Ionicons name="person-circle-outline" size={12} color={COLORS.primary} />
            <Text style={gridStyles.ownerButtonText}>Your Report</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

/**
 * Two-column grid of GridCard components.
 *
 * @param {object[]} items   - Items to display.
 * @param {Function} onPress - Forwarded to each GridCard.
 */
const GridList = ({ items, onPress }) => {
  if (items.length === 0) {
    return (
      <View style={gridStyles.emptyState}>
        <Ionicons name="search-outline" size={44} color={COLORS.textLight} />
        <Text style={gridStyles.emptyStateTitle}>No items found</Text>
        <Text style={gridStyles.emptyStateSubtitle}>Tap + to report a new item</Text>
      </View>
    );
  }

  // Build rows of two.
  const rows = [];
  for (let i = 0; i < items.length; i += 2) rows.push(items.slice(i, i + 2));

  return (
    <View style={gridStyles.grid}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={gridStyles.row}>
          {row.map((item, colIndex) => (
            <GridCard key={item.id} item={item} onPress={onPress} delay={rowIndex * 55 + colIndex * 25} />
          ))}
          {/* Spacer keeps the last row left-aligned when it has only one item. */}
          {row.length === 1 && <View style={{ width: CARD_W }} />}
        </View>
      ))}
    </View>
  );
};

const gridStyles = StyleSheet.create({
  grid:  { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  row:   { flexDirection: 'row', gap: 10, marginBottom: 12 },
  card:  { backgroundColor: COLORS.surface, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#E8E0F8', shadowColor: COLORS.primaryDark, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 10, elevation: 5 },

  imageBox:    { width: '100%', height: CARD_W * 0.84, position: 'relative', backgroundColor: COLORS.primaryPale },
  itemImage:   { width: '100%', height: '100%' },
  iconFallback:{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },

  badgeRow:    { position: 'absolute', top: 8, left: 8, flexDirection: 'row', gap: 4, zIndex: 10 },
  urgentBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: COLORS.red, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3 },
  urgentText:  { color: '#fff', fontSize: 8, fontWeight: '900', letterSpacing: 0.4 },
  youBadge:    { backgroundColor: COLORS.primary, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3 },
  youBadgeText:{ color: '#fff', fontSize: 8, fontWeight: '900', letterSpacing: 0.4 },

  statusStamp:    { position: 'absolute', bottom: 8, right: 8, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, paddingVertical: 4, borderRadius: 8 },
  statusStampText:{ color: '#fff', fontSize: 9, fontWeight: '900', letterSpacing: 0.6 },

  infoSection:     { paddingHorizontal: 10, paddingTop: 10, paddingBottom: 6, gap: 5 },
  categoryPill:    { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  categoryPillText:{ fontSize: 9, fontWeight: '800', letterSpacing: 0.3 },
  itemName:        { fontSize: 13, fontWeight: '800', color: COLORS.textDark, lineHeight: 17 },
  locationRow:     { flexDirection: 'row', alignItems: 'center', gap: 3 },
  locationText:    { fontSize: 10, color: COLORS.textLight, flex: 1 },
  metaRow:         { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  avatarDot:       { width: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  avatarDotText:   { color: '#fff', fontWeight: '900', fontSize: 7 },
  reporterName:    { fontSize: 10, color: COLORS.textMid, fontWeight: '600', maxWidth: CARD_W * 0.34 },
  metaSeparator:   { fontSize: 8, color: COLORS.textLight },
  timeText:        { fontSize: 9, color: COLORS.textLight, fontWeight: '600' },

  actionButton:    { margin: 8, marginTop: 2, paddingVertical: 9, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  actionButtonText:{ color: '#fff', fontWeight: '800', fontSize: 11, letterSpacing: 0.2 },
  ownerButton:     { margin: 8, marginTop: 2, paddingVertical: 9, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, backgroundColor: COLORS.primaryPale, borderWidth: 1, borderColor: COLORS.border },
  ownerButtonText: { color: COLORS.primary, fontWeight: '800', fontSize: 11 },

  emptyState:        { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyStateTitle:   { fontSize: 15, color: COLORS.textLight, fontWeight: '700' },
  emptyStateSubtitle:{ fontSize: 12, color: COLORS.textLight },
});

// ─── DETAIL SHEET ─────────────────────────────────────────────────────────────

/**
 * Full-detail bottom sheet for a selected item.
 *
 * @param {object}   item      - Item to display.
 * @param {Function} onClose   - Dismisses the sheet.
 * @param {Function} onFoundIt - Called with the item when the user claims to have found it.
 */
const DetailSheet = ({ item, onClose, onFoundIt }) => {
  const slideY = useRef(new Animated.Value(height)).current;

  const isOwner = item.createdBy === CURRENT_USER.rollNo;
  const iconMeta = ITEM_ICONS[item.iconIdx] ?? ITEM_ICONS[15];
  const isLost   = item.type === 'lost';

  const [imageError,      setImageError]      = useState(false);
  const [showAIVerify,    setShowAIVerify]     = useState(false);
  const [aiCreditsLocal,  setAiCreditsLocal]   = useState(getAiCredits());

  useEffect(() => {
    Animated.spring(slideY, { toValue: 0, speed: 18, bounciness: 4, useNativeDriver: true }).start();
  }, []);

  const handleClose = () =>
    Animated.timing(slideY, { toValue: height, duration: 260, easing: EASE_OUT_EXPO, useNativeDriver: true }).start(onClose);

  const handleFoundItPress = () => {
    Alert.alert(
      'Confirm — I Found This Item',
      `Are you sure you found "${item.itemName}"? This item will be moved to the Found section.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes, I Found It', onPress: () => { onFoundIt(item); handleClose(); } },
      ],
    );
  };

  const handleCallPress = (phone) => {
    Linking.openURL(`tel:${phone}`).catch(() => Alert.alert('Error', 'Could not open the dialler.'));
  };

  return (
    <>
      <Modal transparent animationType="none" onRequestClose={handleClose}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={detailStyles.overlay} />
        </TouchableWithoutFeedback>

        <Animated.View style={[detailStyles.sheet, { transform: [{ translateY: slideY }] }]}>
          <View style={detailStyles.dragHandle} />

          {/* Hero image */}
          <View style={detailStyles.heroBox}>
            {item.imageUrl && !imageError ? (
              <Image
                source={{ uri: item.imageUrl }}
                style={detailStyles.heroImage}
                resizeMode="cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <View style={[detailStyles.heroFallback, { backgroundColor: iconMeta.bg }]}>
                <Ionicons name={iconMeta.icon} size={56} color={iconMeta.color} />
              </View>
            )}
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.55)']} style={StyleSheet.absoluteFill} />
            <View style={[detailStyles.typeChip, { backgroundColor: isLost ? COLORS.red : COLORS.green }]}>
              <Ionicons name={isLost ? 'alert-circle' : 'checkmark-circle'} size={12} color="#fff" />
              <Text style={detailStyles.typeChipText}>{isLost ? 'LOST ITEM' : 'FOUND ITEM'}</Text>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={detailStyles.itemName}>{item.itemName}</Text>
            <View style={detailStyles.metaRow}>
              <Ionicons name="location-outline" size={13} color={COLORS.textLight} />
              <Text style={detailStyles.locationText}>{item.location}</Text>
              <Text style={detailStyles.dateText}>{item.date} · {item.time}</Text>
            </View>

            <View style={detailStyles.divider} />

            {/* AI Verify button */}
            <TouchableOpacity
              style={detailStyles.aiVerifyButton}
              onPress={() => { setAiCreditsLocal(getAiCredits()); setShowAIVerify(true); }}
              activeOpacity={0.85}
            >
              <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={detailStyles.aiVerifyGradient}>
                <Ionicons name="sparkles-outline" size={16} color="#fff" />
                <View style={{ flex: 1 }}>
                  <Text style={detailStyles.aiVerifyTitle}>AI Item Verification</Text>
                  <Text style={detailStyles.aiVerifySubtitle}>
                    Image match · Description check · Duplicate scan · {aiCreditsLocal} credit{aiCreditsLocal !== 1 ? 's' : ''} left
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.7)" />
              </LinearGradient>
            </TouchableOpacity>

            <View style={detailStyles.divider} />
            <Text style={detailStyles.sectionLabel}>Description</Text>
            <Text style={detailStyles.descriptionText}>{item.desc}</Text>

            <View style={detailStyles.divider} />
            <Text style={detailStyles.sectionLabel}>Reported By</Text>
            <View style={detailStyles.reporterRow}>
              <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={detailStyles.reporterAvatar}>
                <Text style={detailStyles.reporterAvatarText}>{item.personName[0]}</Text>
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={detailStyles.reporterName}>{item.personName}</Text>
                  {isOwner && (
                    <View style={detailStyles.youPill}>
                      <Text style={detailStyles.youPillText}>You</Text>
                    </View>
                  )}
                </View>
                <Text style={detailStyles.reporterRollNo}>{isOwner ? CURRENT_USER.rollNo : item.rollNo}</Text>
              </View>
            </View>

            {/* Contact card */}
            {!isOwner && item.phone && (
              <View style={detailStyles.contactCard}>
                <View style={detailStyles.contactLeft}>
                  <Ionicons name="call-outline" size={16} color={COLORS.primary} />
                  <View>
                    <Text style={detailStyles.contactLabel}>Contact Number</Text>
                    <Text style={detailStyles.contactPhone}>+91 {item.phone}</Text>
                  </View>
                </View>
                <TouchableOpacity style={detailStyles.callButton} onPress={() => handleCallPress(item.phone)} activeOpacity={0.85}>
                  <LinearGradient colors={[COLORS.green, '#146038']} style={detailStyles.callButtonGradient}>
                    <Ionicons name="call" size={14} color="#fff" />
                    <Text style={detailStyles.callButtonText}>Call</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            {/* Primary action */}
            {!isOwner && (
              <View style={detailStyles.actionsRow}>
                <TouchableOpacity
                  onPress={isLost ? handleFoundItPress : handleClose}
                  activeOpacity={0.87}
                  style={{ flex: 1 }}
                >
                  <LinearGradient
                    colors={isLost ? [COLORS.primary, COLORS.primaryDark] : [COLORS.green, '#146038']}
                    style={detailStyles.primaryAction}
                  >
                    <Ionicons name={isLost ? 'chatbubble-outline' : 'call-outline'} size={16} color="#fff" />
                    <Text style={detailStyles.primaryActionText}>
                      {isLost ? 'I Found This Item' : "It's Mine — Contact"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
            {isOwner && <View style={{ height: 18 }} />}
          </ScrollView>
        </Animated.View>
      </Modal>

      {showAIVerify && (
        <AIVerifyModal
          item={item}
          onClose={() => { setAiCreditsLocal(getAiCredits()); setShowAIVerify(false); }}
        />
      )}
    </>
  );
};

const detailStyles = StyleSheet.create({
  overlay:            { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.50)' },
  sheet:              { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 36 },
  dragHandle:         { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.border, alignSelf: 'center', marginTop: 12 },
  heroBox:            { width: '100%', height: 200, overflow: 'hidden', position: 'relative' },
  heroImage:          { width: '100%', height: '100%' },
  heroFallback:       { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  typeChip:           { position: 'absolute', bottom: 12, left: 16, flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  typeChipText:       { color: '#fff', fontWeight: '900', fontSize: 11, letterSpacing: 0.5 },
  itemName:           { fontSize: 18, fontWeight: '900', color: COLORS.textDark, paddingHorizontal: 20, paddingTop: 16, marginBottom: 6 },
  metaRow:            { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 20, marginBottom: 4 },
  locationText:       { fontSize: 12, color: COLORS.textLight, flex: 1 },
  dateText:           { fontSize: 11, color: COLORS.textLight },
  divider:            { height: 1, backgroundColor: COLORS.border, marginHorizontal: 20, marginVertical: 14 },
  sectionLabel:       { fontSize: 11, fontWeight: '700', color: COLORS.textLight, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8, paddingHorizontal: 20 },
  descriptionText:    { fontSize: 14, color: COLORS.textMid, lineHeight: 22, paddingHorizontal: 20 },
  reporterRow:        { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20 },
  reporterAvatar:     { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  reporterAvatarText: { color: '#fff', fontWeight: '900', fontSize: 18 },
  reporterName:       { fontSize: 14, fontWeight: '700', color: COLORS.textDark },
  youPill:            { backgroundColor: COLORS.primaryPale, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderColor: COLORS.border },
  youPillText:        { fontSize: 10, fontWeight: '800', color: COLORS.primary },
  reporterRollNo:     { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  aiVerifyButton:     { marginHorizontal: 20, borderRadius: 16, overflow: 'hidden', marginBottom: 4 },
  aiVerifyGradient:   { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  aiVerifyTitle:      { fontSize: 13, fontWeight: '800', color: '#fff' },
  aiVerifySubtitle:   { fontSize: 10, color: 'rgba(255,255,255,0.72)', marginTop: 2 },
  contactCard:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 20, marginTop: 14, backgroundColor: COLORS.primaryPale, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  contactLeft:        { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  contactLabel:       { fontSize: 10, color: COLORS.textLight, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  contactPhone:       { fontSize: 14, fontWeight: '800', color: COLORS.textDark, marginTop: 2 },
  callButton:         { borderRadius: 12, overflow: 'hidden' },
  callButtonGradient: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 10 },
  callButtonText:     { color: '#fff', fontWeight: '700', fontSize: 13 },
  actionsRow:         { flexDirection: 'row', gap: 10, marginHorizontal: 20, marginTop: 16, marginBottom: 8 },
  primaryAction:      { borderRadius: 16, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryActionText:  { color: '#fff', fontWeight: '900', fontSize: 15 },
});

// ─── ADD FORM ─────────────────────────────────────────────────────────────────

/** Default form state returned to its initial values each time the form opens. */
const buildEmptyForm = () => ({
  personName: CURRENT_USER.name,
  phone:      CURRENT_USER.phone,
  itemName:   '',
  location:   '',
  time:       getCurrentTime(),
  date:       getCurrentDate(),
  desc:       '',
  iconIdx:    0,
});

/**
 * Bottom-sheet form for submitting a new lost or found report.
 *
 * @param {boolean}  visible   - Whether the sheet is visible.
 * @param {string}   type      - 'lost' | 'found'.
 * @param {Function} onClose   - Dismisses the form.
 * @param {Function} onSubmit  - Called with the completed item object.
 */
const AddForm = ({ visible, type, onClose, onSubmit }) => {
  const slideY = useRef(new Animated.Value(height)).current;

  const [showIconPicker, setShowIconPicker] = useState(false);
  const [pickedImage,    setPickedImage]    = useState(null);
  const [aiLoading,      setAiLoading]      = useState(false);
  const [aiResult,       setAiResult]       = useState(null);
  const [moderationError, setModerationError] = useState(null);
  const [isModerating,   setIsModerating]   = useState(false);
  const [form, setForm] = useState(buildEmptyForm());

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    if (visible) {
      setForm(buildEmptyForm());
      setShowIconPicker(false);
      setPickedImage(null);
      setAiLoading(false);
      setAiResult(null);
      setModerationError(null);
      setIsModerating(false);
      Animated.spring(slideY, { toValue: 0, speed: 16, bounciness: 3, useNativeDriver: true }).start();
    } else {
      Animated.timing(slideY, { toValue: height, duration: 260, easing: EASE_OUT_EXPO, useNativeDriver: true }).start();
    }
  }, [visible]);

  const handleImage = async (asset) => {
    setIsModerating(true);
    setModerationError(null);
    setAiResult(null);

    const moderationResult = await moderateContent({ base64Image: asset.base64, mediaType: asset.mimeType || 'image/jpeg' });
    setIsModerating(false);

    if (!moderationResult.safe) {
      setModerationError(moderationResult.reason || 'This image is not permitted.');
      return;
    }

    setPickedImage({ uri: asset.uri, base64: asset.base64, mediaType: asset.mimeType || 'image/jpeg' });
    setAiLoading(true);

    const parsed = await analyzeImageWithAI(asset.base64, type);
    setAiLoading(false);

    if (parsed) {
      setAiResult(parsed);
      setForm((prev) => ({
        ...prev,
        itemName: parsed.itemName       || prev.itemName,
        desc:     parsed.description    || prev.desc,
        location: parsed.suggestedLocation || prev.location,
        iconIdx:  CATEGORY_TO_ICON_INDEX[parsed.category] ?? prev.iconIdx,
      }));
    }
  };

  const handlePickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled) await handleImage(result.assets[0]);
  };

  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.7, base64: true });
    if (!result.canceled) await handleImage(result.assets[0]);
  };

  const handleSubmit = async () => {
    if (!form.itemName.trim()) { Alert.alert('Required', 'Please enter the item name.'); return; }

    setIsModerating(true);
    setModerationError(null);

    const moderationResult = await moderateContent({ itemName: form.itemName, description: form.desc });
    setIsModerating(false);

    if (!moderationResult.safe) {
      setModerationError(moderationResult.reason || 'Inappropriate content detected.');
      return;
    }

    onSubmit({
      ...form,
      id:        `item_${Date.now()}`,
      type,
      rollNo:    CURRENT_USER.rollNo,
      createdBy: CURRENT_USER.rollNo,
      urgent:    false,
      time:      'Just now',
      imageUrl:  pickedImage?.uri || null,
    });
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <TouchableWithoutFeedback onPress={onClose}>
            <View style={addFormStyles.overlay} />
          </TouchableWithoutFeedback>

          <Animated.View style={[addFormStyles.sheet, { transform: [{ translateY: slideY }] }]}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

              {/* Header */}
              <View style={addFormStyles.header}>
                <View style={addFormStyles.dragHandle} />
                <View style={addFormStyles.titleRow}>
                  <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={addFormStyles.titleIcon}>
                    <Ionicons name={type === 'lost' ? 'alert-circle-outline' : 'search-outline'} size={15} color="#fff" />
                  </LinearGradient>
                  <Text style={addFormStyles.title}>Report {type === 'lost' ? 'Lost' : 'Found'} Item</Text>
                  <TouchableOpacity onPress={onClose} style={addFormStyles.closeButton}>
                    <Ionicons name="close" size={20} color={COLORS.textMid} />
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView
                style={addFormStyles.scroll}
                contentContainerStyle={{ paddingBottom: 28 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* Category picker */}
                <Text style={addFormStyles.fieldLabel}>Category</Text>
                <TouchableOpacity style={addFormStyles.categoryPicker} onPress={() => setShowIconPicker((p) => !p)}>
                  <View style={[addFormStyles.categoryPickerThumb, { backgroundColor: ITEM_ICONS[form.iconIdx].bg }]}>
                    <Ionicons name={ITEM_ICONS[form.iconIdx].icon} size={20} color={ITEM_ICONS[form.iconIdx].color} />
                  </View>
                  <Text style={addFormStyles.categoryPickerLabel}>{ITEM_ICONS[form.iconIdx].label}</Text>
                  <Ionicons name={showIconPicker ? 'chevron-up' : 'chevron-down'} size={16} color={COLORS.textLight} />
                </TouchableOpacity>

                {showIconPicker && (
                  <View style={addFormStyles.iconGrid}>
                    {ITEM_ICONS.map((icon, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[addFormStyles.iconCell, form.iconIdx === index && addFormStyles.iconCellSelected]}
                        onPress={() => { setField('iconIdx', index); setShowIconPicker(false); }}
                        activeOpacity={0.8}
                      >
                        <View style={[addFormStyles.iconCellThumb, { backgroundColor: icon.bg }]}>
                          <Ionicons name={icon.icon} size={18} color={icon.color} />
                        </View>
                        <Text style={addFormStyles.iconCellLabel} numberOfLines={1}>{icon.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Your Name */}
                <Text style={addFormStyles.fieldLabel}>Your Name</Text>
                <View style={addFormStyles.inputRow}>
                  <Ionicons name="person-outline" size={16} color={COLORS.textLight} />
                  <TextInput style={addFormStyles.input} value={form.personName} onChangeText={(v) => setField('personName', v)} placeholderTextColor={COLORS.textLight} />
                </View>

                {/* Phone */}
                <Text style={addFormStyles.fieldLabel}>Contact Number <Text style={{ color: COLORS.red }}>*</Text></Text>
                <View style={addFormStyles.inputRow}>
                  <Ionicons name="call-outline" size={16} color={COLORS.textLight} />
                  <TextInput style={addFormStyles.input} value={form.phone} onChangeText={(v) => setField('phone', v)} placeholder="e.g. 9876543210" placeholderTextColor={COLORS.textLight} keyboardType="phone-pad" />
                </View>

                {/* Item Name */}
                <Text style={addFormStyles.fieldLabel}>Item Name <Text style={{ color: COLORS.red }}>*</Text></Text>
                <View style={addFormStyles.inputRow}>
                  <Ionicons name="cube-outline" size={16} color={COLORS.textLight} />
                  <TextInput style={addFormStyles.input} value={form.itemName} onChangeText={(v) => setField('itemName', v)} placeholder="e.g. Blue Bose Headphones" placeholderTextColor={COLORS.textLight} />
                </View>

                {/* Location */}
                <Text style={addFormStyles.fieldLabel}>Location</Text>
                <View style={addFormStyles.inputRow}>
                  <Ionicons name="location-outline" size={16} color={COLORS.textLight} />
                  <TextInput style={addFormStyles.input} value={form.location} onChangeText={(v) => setField('location', v)} placeholder="e.g. Central Library, 2nd Floor" placeholderTextColor={COLORS.textLight} />
                </View>

                {/* Time + Date */}
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={addFormStyles.fieldLabel}>Time</Text>
                    <View style={addFormStyles.inputRow}>
                      <Ionicons name="time-outline" size={15} color={COLORS.textLight} />
                      <TextInput style={addFormStyles.input} value={form.time} onChangeText={(v) => setField('time', v)} placeholderTextColor={COLORS.textLight} />
                    </View>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={addFormStyles.fieldLabel}>Date</Text>
                    <View style={addFormStyles.inputRow}>
                      <Ionicons name="calendar-outline" size={15} color={COLORS.textLight} />
                      <TextInput style={addFormStyles.input} value={form.date} onChangeText={(v) => setField('date', v)} placeholderTextColor={COLORS.textLight} />
                    </View>
                  </View>
                </View>

                {/* Description */}
                <Text style={addFormStyles.fieldLabel}>Description</Text>
                <View style={[addFormStyles.inputRow, { alignItems: 'flex-start', paddingTop: 12 }]}>
                  <Ionicons name="document-text-outline" size={16} color={COLORS.textLight} style={{ marginTop: 1 }} />
                  <TextInput
                    style={[addFormStyles.input, { height: 80, textAlignVertical: 'top' }]}
                    value={form.desc}
                    onChangeText={(v) => setField('desc', v)}
                    placeholder="Colour, brand, distinguishing features…"
                    placeholderTextColor={COLORS.textLight}
                    multiline
                  />
                </View>

                {/* Photo section */}
                <Text style={addFormStyles.fieldLabel}>
                  Photo{' '}
                  <Text style={{ color: COLORS.textLight, fontWeight: '400', textTransform: 'none', letterSpacing: 0 }}>
                    (optional — AI auto-fill)
                  </Text>
                </Text>
                <View style={addFormStyles.imageButtonRow}>
                  <TouchableOpacity style={addFormStyles.imageButton} onPress={handlePickFromGallery} activeOpacity={0.8}>
                    <Ionicons name="images-outline" size={18} color={COLORS.primary} />
                    <Text style={addFormStyles.imageButtonText}>Gallery</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={addFormStyles.imageButton} onPress={handleTakePhoto} activeOpacity={0.8}>
                    <Ionicons name="camera-outline" size={18} color={COLORS.primary} />
                    <Text style={addFormStyles.imageButtonText}>Camera</Text>
                  </TouchableOpacity>
                </View>

                {pickedImage && (
                  <View style={addFormStyles.imagePreviewWrapper}>
                    <Image source={{ uri: pickedImage.uri }} style={addFormStyles.imagePreview} resizeMode="cover" />
                    <TouchableOpacity
                      style={addFormStyles.imageRemoveButton}
                      onPress={() => { setPickedImage(null); setAiResult(null); }}
                    >
                      <Ionicons name="close-circle" size={22} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )}

                {aiLoading && (
                  <View style={addFormStyles.aiStatusBox}>
                    <ActivityIndicator size="small" color={COLORS.primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={addFormStyles.aiStatusTitle}>AI is analysing your image…</Text>
                      <Text style={addFormStyles.aiStatusSubtitle}>Detecting item, category and description</Text>
                    </View>
                  </View>
                )}

                {aiResult && !aiLoading && (
                  <View style={addFormStyles.aiResultBox}>
                    <View style={addFormStyles.aiResultHeader}>
                      <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={addFormStyles.aiResultIcon}>
                        <Ionicons name="sparkles" size={13} color="#fff" />
                      </LinearGradient>
                      <Text style={addFormStyles.aiResultTitle}>AI filled the form!</Text>
                      <TouchableOpacity onPress={() => setAiResult(null)}>
                        <Ionicons name="close" size={16} color={COLORS.textLight} />
                      </TouchableOpacity>
                    </View>
                    <Text style={addFormStyles.aiResultBody}>
                      Detected: <Text style={{ fontWeight: '700', color: COLORS.primary }}>{aiResult.category}</Text>
                      {aiResult.itemName ? ` — ${aiResult.itemName}` : ''}
                    </Text>
                  </View>
                )}

                {isModerating && (
                  <View style={addFormStyles.moderatingBox}>
                    <ActivityIndicator size="small" color={COLORS.primary} />
                    <Text style={addFormStyles.moderatingText}>Checking content safety…</Text>
                  </View>
                )}

                <TouchableOpacity
                  onPress={handleSubmit}
                  activeOpacity={0.87}
                  style={{ marginTop: 14 }}
                  disabled={isModerating || aiLoading}
                >
                  <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={addFormStyles.submitButton}>
                    <Ionicons name="add-circle-outline" size={18} color="#fff" />
                    <Text style={addFormStyles.submitButtonText}>Submit Report</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </ScrollView>
            </KeyboardAvoidingView>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>

      {/* Moderation error dialog */}
      <Modal
        transparent
        visible={!!moderationError}
        animationType="fade"
        onRequestClose={() => setModerationError(null)}
      >
        <View style={addFormStyles.moderationOverlay}>
          <View style={addFormStyles.moderationCard}>
            <View style={addFormStyles.moderationIcon}>
              <Ionicons name="shield-checkmark" size={32} color="#fff" />
            </View>
            <Text style={addFormStyles.moderationTitle}>Not Permitted</Text>
            <Text style={addFormStyles.moderationMessage}>{moderationError}</Text>
            <TouchableOpacity style={addFormStyles.moderationButton} onPress={() => setModerationError(null)}>
              <LinearGradient colors={[COLORS.red, '#CC2222']} style={addFormStyles.moderationButtonGradient}>
                <Text style={addFormStyles.moderationButtonText}>Understood</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const addFormStyles = StyleSheet.create({
  overlay:              { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet:                { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: height * 0.92 },
  header:               { paddingTop: 12, paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  dragHandle:           { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.border, alignSelf: 'center', marginBottom: 14 },
  titleRow:             { flexDirection: 'row', alignItems: 'center', gap: 10 },
  titleIcon:            { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  title:                { flex: 1, fontSize: 16, fontWeight: '800', color: COLORS.textDark },
  closeButton:          { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.surfaceAlt, justifyContent: 'center', alignItems: 'center' },
  scroll:               { paddingHorizontal: 20, paddingTop: 16 },
  fieldLabel:           { fontSize: 11, fontWeight: '700', color: COLORS.textLight, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 7, marginTop: 16 },
  inputRow:             { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.surfaceAlt, borderRadius: 13, paddingHorizontal: 14, paddingVertical: 11, borderWidth: 1, borderColor: COLORS.border },
  input:                { flex: 1, fontSize: 14, color: COLORS.textDark, padding: 0 },
  categoryPicker:       { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.surfaceAlt, borderRadius: 13, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: COLORS.border },
  categoryPickerThumb:  { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  categoryPickerLabel:  { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.textDark },
  iconGrid:             { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  iconCell:             { width: (width - 40 - 32) / 5, alignItems: 'center', gap: 4, backgroundColor: COLORS.surfaceAlt, borderRadius: 12, padding: 7, borderWidth: 1, borderColor: COLORS.border },
  iconCellSelected:     { borderColor: COLORS.primary, borderWidth: 2, backgroundColor: COLORS.primaryPale },
  iconCellThumb:        { width: 34, height: 34, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  iconCellLabel:        { fontSize: 9, color: COLORS.textMid, fontWeight: '600', textAlign: 'center' },
  imageButtonRow:       { flexDirection: 'row', gap: 10, marginTop: 4 },
  imageButton:          { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: COLORS.primaryPale, borderRadius: 13, paddingVertical: 12, borderWidth: 1.5, borderColor: `${COLORS.primary}40` },
  imageButtonText:      { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  imagePreviewWrapper:  { marginTop: 12, borderRadius: 14, overflow: 'hidden', position: 'relative' },
  imagePreview:         { width: '100%', height: 180, borderRadius: 14 },
  imageRemoveButton:    { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12 },
  aiStatusBox:          { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.primaryPale, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginTop: 12, borderWidth: 1, borderColor: COLORS.border },
  aiStatusTitle:        { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  aiStatusSubtitle:     { fontSize: 11, color: COLORS.textLight, marginTop: 2 },
  aiResultBox:          { backgroundColor: COLORS.primaryPale, borderRadius: 14, padding: 14, marginTop: 12, borderWidth: 1.5, borderColor: `${COLORS.primary}44` },
  aiResultHeader:       { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  aiResultIcon:         { width: 26, height: 26, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  aiResultTitle:        { flex: 1, fontSize: 13, fontWeight: '800', color: COLORS.primary },
  aiResultBody:         { fontSize: 13, color: COLORS.textDark },
  moderatingBox:        { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.primaryPale, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginTop: 10, borderWidth: 1, borderColor: COLORS.border },
  moderatingText:       { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  submitButton:         { borderRadius: 16, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  submitButtonText:     { color: '#fff', fontWeight: '800', fontSize: 15 },
  moderationOverlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28 },
  moderationCard:       { backgroundColor: '#fff', borderRadius: 24, padding: 28, alignItems: 'center', width: '100%', gap: 12 },
  moderationIcon:       { width: 68, height: 68, borderRadius: 34, backgroundColor: COLORS.red, justifyContent: 'center', alignItems: 'center' },
  moderationTitle:      { fontSize: 19, fontWeight: '900', color: COLORS.textDark },
  moderationMessage:    { fontSize: 13, color: COLORS.red, fontWeight: '600', textAlign: 'center', lineHeight: 19 },
  moderationButton:     { width: '100%', borderRadius: 14, overflow: 'hidden' },
  moderationButtonGradient: { paddingVertical: 14, alignItems: 'center' },
  moderationButtonText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});

// ─── STATS STRIP ─────────────────────────────────────────────────────────────

/**
 * Horizontal strip showing aggregate lost / found / pending counts.
 *
 * @param {number} lostCount  - Total lost items.
 * @param {number} foundCount - Total found items.
 */
const StatsStrip = ({ lostCount, foundCount }) => {
  const STATS = [
    { value: lostCount,                          label: 'Lost Items',    color: COLORS.red,     icon: 'alert-circle-outline'     },
    { value: foundCount,                         label: 'Found Items',   color: COLORS.green,   icon: 'checkmark-circle-outline' },
    { value: Math.max(0, lostCount - foundCount),label: 'Still Pending', color: COLORS.primary, icon: 'time-outline'             },
  ];

  return (
    <View style={statsStyles.strip}>
      {STATS.map((stat, index) => (
        <React.Fragment key={stat.label}>
          <View style={statsStyles.statItem}>
            <View style={[statsStyles.iconWrapper, { backgroundColor: `${stat.color}18` }]}>
              <Ionicons name={stat.icon} size={16} color={stat.color} />
            </View>
            <Text style={[statsStyles.statValue, { color: stat.color }]}>{stat.value}</Text>
            <Text style={statsStyles.statLabel}>{stat.label}</Text>
          </View>
          {index < STATS.length - 1 && <View style={statsStyles.divider} />}
        </React.Fragment>
      ))}
    </View>
  );
};

const statsStyles = StyleSheet.create({
  strip:       { flexDirection: 'row', backgroundColor: COLORS.surface, marginHorizontal: 16, marginTop: 14, borderRadius: 18, borderWidth: 1, borderColor: COLORS.border, shadowColor: `${COLORS.primary}14`, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 3 },
  statItem:    { flex: 1, alignItems: 'center', paddingVertical: 14, gap: 4 },
  divider:     { width: 1, backgroundColor: COLORS.border, marginVertical: 12 },
  iconWrapper: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 2 },
  statValue:   { fontSize: 19, fontWeight: '900' },
  statLabel:   { fontSize: 9, color: COLORS.textLight, fontWeight: '600', textAlign: 'center' },
});

// ─── SCREEN ───────────────────────────────────────────────────────────────────

/**
 * LostAndFoundScreen
 *
 * @param {object} navigation - React Navigation prop.
 */
export default function LostAndFoundScreen({ navigation }) {
  const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 44 : (StatusBar.currentHeight || 24);

  const [activeTab,     setActiveTab]     = useState('lost');
  const [searchQuery,   setSearchQuery]   = useState('');
  const [showForm,      setShowForm]      = useState(false);
  const [detailItem,    setDetailItem]    = useState(null);
  const [lostItems,     setLostItems]     = useState(SEED_LOST);
  const [foundItems,    setFoundItems]    = useState(SEED_FOUND);
  const [activeFilter,  setActiveFilter]  = useState('all');
  const [showFilter,    setShowFilter]    = useState(false);

  const tabSlideValue = useRef(new Animated.Value(0)).current;

  const headerAnim = useEntranceAnimation(0,  -8);
  const tabsAnim   = useEntranceAnimation(80,  12);
  const searchAnim = useEntranceAnimation(150, 12);

  // ── Tab switching ─────────────────────────────────────────────────────────

  const handleSwitchTab = (tab) => {
    setActiveTab(tab);
    Animated.spring(tabSlideValue, { toValue: tab === 'lost' ? 0 : 1, speed: 22, bounciness: 5, useNativeDriver: false }).start();
  };

  const tabIndicatorLeft = tabSlideValue.interpolate({ inputRange: [0, 1], outputRange: ['2%', '51%'] });

  // ── Data fetching ─────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    async function fetchItems() {
      try {
        const response = await lostFoundApi.list();
        if (cancelled) return;

        const allItems = (response?.data || []).map(mapBackendItemToUi).filter(Boolean);
        const backendLost  = allItems.filter((i) => i.type === 'lost');
        const backendFound = allItems.filter((i) => i.type === 'found');

        if (backendLost.length)  setLostItems((prev)  => [...backendLost,  ...prev.filter((p) => !p._isFromBackend)]);
        if (backendFound.length) setFoundItems((prev) => [...backendFound, ...prev.filter((p) => !p._isFromBackend)]);
      } catch (error) {
        console.warn('[LostAndFoundScreen] Backend fetch failed — using seed data.', error?.message ?? error);
      }
    }

    fetchItems();
    return () => { cancelled = true; };
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────

  /**
   * Moves a lost item to the Found tab as recovered by the current user.
   * Both the Lost and Found lists are updated atomically.
   */
  const handleFoundIt = useCallback((item) => {
    setLostItems((prev) => prev.filter((i) => i.id !== item.id));

    const recoveredItem = {
      ...item,
      id:         `found_${item.id}`,
      type:       'found',
      time:       'Just now',
      date:       getCurrentDate(),
      personName: CURRENT_USER.name,
      rollNo:     CURRENT_USER.rollNo,
      phone:      CURRENT_USER.phone,
      createdBy:  CURRENT_USER.rollNo,
      desc:       `${item.desc} — Recovered and reported by ${CURRENT_USER.name}.`,
    };
    setFoundItems((prev) => [recoveredItem, ...prev]);

    Alert.alert(
      '🎉  Item Recovered!',
      `"${item.itemName}" has been moved to the Found Items section. The original reporter has been notified.`,
      [{ text: 'Great!' }],
    );
  }, []);

  /**
   * Adds a new item optimistically then attempts to persist it to the backend.
   * If the backend call succeeds, the local optimistic record is replaced.
   */
  const handleAddItem = useCallback(async (item) => {
    // Optimistic update
    if (item.type === 'lost') setLostItems((prev)  => [item, ...prev]);
    else                      setFoundItems((prev) => [item, ...prev]);

    try {
      const result  = await lostFoundApi.create(mapUiItemToBackendPayload(item));
      const created = mapBackendItemToUi(result?.data);
      if (!created) return;

      const setter = created.type === 'lost' ? setLostItems : setFoundItems;
      setter((prev) => {
        const replaced = prev.map((p) => (p.id === item.id ? created : p));
        return replaced.some((p) => p.id === created.id) ? replaced : [created, ...replaced];
      });
    } catch (error) {
      console.warn('[LostAndFoundScreen] Backend create failed:', error?.message ?? error);
    }
  }, []);

  // ── Derived state ─────────────────────────────────────────────────────────

  const applySearchAndFilter = (items) => {
    const query = searchQuery.trim().toLowerCase();
    let result  = query
      ? items.filter((i) =>
          i.itemName.toLowerCase().includes(query) ||
          i.location.toLowerCase().includes(query))
      : items;

    if (activeFilter !== 'all') {
      result = result.filter((i) => ITEM_ICONS[i.iconIdx]?.filterKey === activeFilter);
    }
    return result;
  };

  const displayedItems = applySearchAndFilter(activeTab === 'lost' ? lostItems : foundItems);

  const activeCategoryLabel =
    FILTER_CATEGORIES.find((f) => f.key === activeFilter)?.label || 'All Items';

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} translucent={false} />

      {/* Header */}
      <Animated.View style={[headerAnim, styles.header, { paddingTop: STATUS_BAR_HEIGHT + 6 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Lost & Found</Text>
          <Text style={styles.headerSubtitle}>Aditya University Campus</Text>
        </View>
        <View style={styles.itemCountBadge}>
          <Text style={styles.itemCountValue}>{displayedItems.length}</Text>
          <Text style={styles.itemCountLabel}>items</Text>
        </View>
      </Animated.View>

      {/* Tab bar */}
      <Animated.View style={[tabsAnim, styles.tabWrapper]}>
        <View style={styles.tabBar}>
          <Animated.View style={[styles.tabIndicator, { left: tabIndicatorLeft }]} />
          {['lost', 'found'].map((tab) => (
            <TouchableOpacity key={tab} style={styles.tabButton} onPress={() => handleSwitchTab(tab)} activeOpacity={0.85}>
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'lost' ? '🔴  Lost' : '🟢  Found'}
              </Text>
              <View style={[styles.tabCount, { backgroundColor: tab === 'lost' ? `${COLORS.red}18` : `${COLORS.green}18` }]}>
                <Text style={[styles.tabCountText, { color: tab === 'lost' ? COLORS.red : COLORS.green }]}>
                  {tab === 'lost' ? lostItems.length : foundItems.length}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* Search bar */}
      <Animated.View style={[searchAnim, styles.searchWrapper]}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={17} color={COLORS.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${activeTab} items…`}
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
      </Animated.View>

      {/* Scrollable content */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
        keyboardShouldPersistTaps="handled"
      >
        <StatsStrip lostCount={lostItems.length} foundCount={foundItems.length} />

        {/* List header + filter button */}
        <View style={styles.listHeader}>
          <View>
            <Text style={styles.listTitle}>{activeTab === 'lost' ? '🔴 Recently Lost' : '🟢 Recently Found'}</Text>
            <Text style={styles.listSubtitle}>
              {displayedItems.length} item{displayedItems.length !== 1 ? 's' : ''} · {activeCategoryLabel}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.filterButton, activeFilter !== 'all' && styles.filterButtonActive]}
            onPress={() => setShowFilter(true)}
          >
            <Ionicons name="filter-outline" size={13} color={activeFilter !== 'all' ? '#fff' : COLORS.primary} />
            <Text style={[styles.filterButtonText, activeFilter !== 'all' && { color: '#fff' }]}>
              {activeFilter === 'all' ? 'Filter' : activeCategoryLabel}
            </Text>
            {activeFilter !== 'all' && (
              <TouchableOpacity onPress={() => setActiveFilter('all')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={13} color="#fff" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>

        <GridList items={displayedItems} onPress={setDetailItem} />
      </ScrollView>

      {/* FAB — report new item */}
      <TouchableOpacity activeOpacity={0.87} style={styles.fabWrapper} onPress={() => setShowForm(true)}>
        <LinearGradient colors={[COLORS.primaryLight, COLORS.primary]} style={styles.fab}>
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Modals */}
      <AddForm visible={showForm} type={activeTab} onClose={() => setShowForm(false)} onSubmit={handleAddItem} />

      {detailItem && (
        <DetailSheet item={detailItem} onClose={() => setDetailItem(null)} onFoundIt={handleFoundIt} />
      )}

      <FilterModal
        visible={showFilter}
        selectedFilter={activeFilter}
        onSelect={setActiveFilter}
        onClose={() => setShowFilter(false)}
      />
    </View>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },

  // Header
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingBottom: 12, backgroundColor: COLORS.bg, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backButton:     { width: 36, height: 36, justifyContent: 'center' },
  headerTitle:    { fontSize: 18, fontWeight: '900', color: COLORS.textDark },
  headerSubtitle: { fontSize: 10, color: COLORS.textLight, fontWeight: '600', marginTop: 1 },
  itemCountBadge: { alignItems: 'center', backgroundColor: COLORS.primaryPale, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: COLORS.border },
  itemCountValue: { fontSize: 17, fontWeight: '900', color: COLORS.primary },
  itemCountLabel: { fontSize: 9, color: COLORS.textLight, fontWeight: '600' },

  // Tabs
  tabWrapper:    { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 2 },
  tabBar:        { flexDirection: 'row', backgroundColor: COLORS.surfaceAlt, borderRadius: 14, padding: 4, position: 'relative', borderWidth: 1, borderColor: COLORS.border },
  tabIndicator:  { position: 'absolute', top: 4, bottom: 4, width: '47%', borderRadius: 11, backgroundColor: COLORS.surface, shadowColor: `${COLORS.primary}40`, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 4, borderWidth: 1, borderColor: COLORS.border },
  tabButton:     { flex: 1, paddingVertical: 9, alignItems: 'center', zIndex: 1, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  tabText:       { fontSize: 12, fontWeight: '600', color: COLORS.textLight },
  tabTextActive: { color: COLORS.primary, fontWeight: '800' },
  tabCount:      { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 },
  tabCountText:  { fontSize: 11, fontWeight: '900' },

  // Search
  searchWrapper: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 2 },
  searchBar:     { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.surface, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11, borderWidth: 1, borderColor: COLORS.border },
  searchInput:   { flex: 1, fontSize: 14, color: COLORS.textDark, padding: 0 },

  // List header
  listHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 18, paddingBottom: 10 },
  listTitle:       { fontSize: 15, fontWeight: '900', color: COLORS.textDark },
  listSubtitle:    { fontSize: 10, color: COLORS.textLight, marginTop: 2 },
  filterButton:    { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: COLORS.primaryPale, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: COLORS.border },
  filterButtonActive:{ backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterButtonText:{ fontSize: 12, fontWeight: '700', color: COLORS.primary },

  // FAB
  fabWrapper: { position: 'absolute', bottom: 28, right: 22, shadowColor: `${COLORS.primary}55`, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 1, shadowRadius: 14, elevation: 10 },
  fab:        { width: 58, height: 58, borderRadius: 29, justifyContent: 'center', alignItems: 'center' },
});
