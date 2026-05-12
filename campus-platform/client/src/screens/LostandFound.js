import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
  Image,
  KeyboardAvoidingView,
  Keyboard,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { lostFoundApi, moderationApi } from "../services/api";

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 16 * 2 - 10) / 2;
const EASE = Easing.bezier(0.22, 1, 0.36, 1);

// Current user — replace with auth context in production
const CURRENT_USER = { name: "Varshitha", rollNo: "22BCE7890", phone: "9876543210" };

const COLOR = {
  primary:      "#6C3CE1",
  primaryDark:  "#4B1FA8",
  primaryLight: "#9B6FF0",
  primaryPale:  "#F0EAFF",
  bg:           "#F8F6FF",
  surface:      "#FFFFFF",
  surfaceAlt:   "#F0EAFF",
  textDark:     "#1A0A3C",
  textMid:      "#4A3880",
  textLight:    "#9B8EC0",
  border:       "#DDD4F8",
  red:          "#E53935",
  redPale:      "#FFF0F0",
  green:        "#1B8A4C",
  greenPale:    "#E8F7EE",
  gold:         "#F59E0B",
};

const FILTER_CATEGORIES = [
  { key: "all",         label: "All Items",    icon: "apps-outline",          color: "#6C3CE1" },
  { key: "electronics", label: "Electronics",  icon: "phone-portrait-outline", color: "#1565C0" },
  { key: "idcards",     label: "ID Cards",     icon: "card-outline",           color: "#F0A500" },
  { key: "bags",        label: "Bags",         icon: "bag-outline",            color: "#8D4E1F" },
  { key: "books",       label: "Books",        icon: "book-outline",           color: "#00796B" },
  { key: "accessories", label: "Accessories",  icon: "watch-outline",          color: "#880E4F" },
  { key: "others",      label: "Others",       icon: "cube-outline",           color: "#4A6560" },
];

const ICONS = [
  { icon: "wallet",        label: "Wallet",     color: "#C07030", bg: "#FFF3E0", filterKey: "accessories" },
  { icon: "phone-portrait",label: "Phone",      color: "#1565C0", bg: "#E3F2FD", filterKey: "electronics" },
  { icon: "headset",       label: "Headphones", color: "#6C3CE1", bg: "#F0EAFF", filterKey: "electronics" },
  { icon: "key",           label: "Keys",       color: "#E05252", bg: "#FDEAEA", filterKey: "accessories" },
  { icon: "card",          label: "ID / Card",  color: "#F0A500", bg: "#FFF4D6", filterKey: "idcards"     },
  { icon: "laptop",        label: "Laptop",     color: "#444",    bg: "#F0F0F0", filterKey: "electronics" },
  { icon: "shirt",         label: "Clothing",   color: "#6B5EA8", bg: "#EEEAF8", filterKey: "accessories" },
  { icon: "book",          label: "Books",      color: "#00796B", bg: "#E0F2F1", filterKey: "books"       },
  { icon: "bag",           label: "Bag",        color: "#8D4E1F", bg: "#FBF0E8", filterKey: "bags"        },
  { icon: "watch",         label: "Watch",      color: "#6C3CE1", bg: "#F0EAFF", filterKey: "accessories" },
  { icon: "umbrella",      label: "Umbrella",   color: "#1565C0", bg: "#E3F2FD", filterKey: "accessories" },
  { icon: "cafe",          label: "Bottle",     color: "#00796B", bg: "#E0F2F1", filterKey: "accessories" },
  { icon: "pencil",        label: "Stationery", color: "#6B5EA8", bg: "#EEEAF8", filterKey: "books"       },
  { icon: "glasses",       label: "Glasses",    color: "#333",    bg: "#F5F5F5", filterKey: "accessories" },
  { icon: "musical-notes", label: "Earphones",  color: "#E91E63", bg: "#FCE4EC", filterKey: "electronics" },
  { icon: "cube-outline",  label: "Other",      color: "#4A6560", bg: "#EFF4F3", filterKey: "others"      },
];

// Map icon label → index for AI auto-fill
const ICON_INDEX_BY_LABEL = Object.fromEntries(
  ICONS.map((ic, i) => [ic.label, i])
);

// ─────────────────────────────────────────────
// STOCK IMAGES
// ─────────────────────────────────────────────

const IMG = {
  headphones:     "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
  wallet:         "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&q=80",
  phone:          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80",
  keys:           "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
  laptop:         "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80",
  bag:            "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80",
  watch:          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
  bottle:         "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&q=80",
  jacket:         "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=400&q=80",
  umbrella:       "https://images.unsplash.com/photo-1527540003-4debc444f40f?w=400&q=80",
  idcard:         "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&q=80",
  pencilcase:     "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400&q=80",
  earphones:      "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=400&q=80",
  glasses:        "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400&q=80",
  book:           "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80",
  airpods:        "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400&q=80",
  charger:        "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&q=80",
  backpack:       "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80",
  notebook:       "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80",
  sonyheadphones: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&q=80",
  smartwatch:     "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&q=80",
};

// ─────────────────────────────────────────────
// SEED DATA
// ─────────────────────────────────────────────

const SEED_LOST = [
  { id: "l01", type: "lost", personName: "Arjun Mehta",   rollNo: "21CSE4501", phone: "9876501234", itemName: "Blue Bose QC45 Headphones",    location: "Central Library, 3rd Floor",      time: "2h ago",  date: "13/03/2026", desc: 'Left in Study Room 302. Black carrying case with "AM" written inside the lid.',                           iconIdx: 2,  urgent: true,  createdBy: "21CSE4501", imageUrl: IMG.headphones    },
  { id: "l02", type: "lost", personName: CURRENT_USER.name, rollNo: CURRENT_USER.rollNo, phone: CURRENT_USER.phone, itemName: "Brown Leather Bifold Wallet", location: "Student Union Food Court",         time: "1d ago",  date: "12/03/2026", desc: "Brown bifold wallet containing student ID, ATM card and ₹500 cash. Please return urgently.",          iconIdx: 0,  urgent: true,  createdBy: CURRENT_USER.rollNo, imageUrl: IMG.wallet     },
  { id: "l03", type: "lost", personName: "Priya Sharma",   rollNo: "22ECE3302", phone: "9876503456", itemName: "iPhone 14 Pro — Space Black",   location: "Engineering Block B Restroom",     time: "5h ago",  date: "13/03/2026", desc: "No screen protector. Lock screen has a mountain range wallpaper.",                                      iconIdx: 1,  urgent: true,  createdBy: "22ECE3302", imageUrl: IMG.phone         },
  { id: "l04", type: "lost", personName: "Rohit Kumar",    rollNo: "21ME2210",  phone: "9876504567", itemName: "North Face Jacket — Black L",   location: "Athletic Centre Bench",            time: "2d ago",  date: "11/03/2026", desc: "Black insulated jacket, Size L. Left on the bench outside the gymnasium.",                               iconIdx: 6,  urgent: false, createdBy: "21ME2210",  imageUrl: IMG.jacket        },
  { id: "l05", type: "lost", personName: "Divya Rao",      rollNo: "22EEE5540", phone: "9876505678", itemName: "Blue Hydro Flask 32oz",         location: "Science Block B, Room 204",        time: "4h ago",  date: "13/03/2026", desc: "Blue bottle with a mountain sticker and an Aditya University sticker. 32 oz.",                           iconIdx: 11, urgent: false, createdBy: "22EEE5540", imageUrl: IMG.bottle        },
  { id: "l06", type: "lost", personName: "Kavya Nair",     rollNo: "22CSE1110", phone: "9876506789", itemName: "Samsung Galaxy Watch 5",        location: "Canteen Block A",                  time: "6h ago",  date: "13/03/2026", desc: '"Kavya" engraved on the strap. Minor scratch on the bezel.',                                             iconIdx: 9,  urgent: true,  createdBy: "22CSE1110", imageUrl: IMG.smartwatch    },
  { id: "l07", type: "lost", personName: "Sai Kiran",      rollNo: "21CSE7890", phone: "9876507890", itemName: "Dell Inspiron 15 — Silver",     location: "CS Lab Block A, 2nd Floor",        time: "3h ago",  date: "13/03/2026", desc: "Silver Dell laptop with blue stickers. Charger also missing. Contains important project files.",           iconIdx: 5,  urgent: true,  createdBy: "21CSE7890", imageUrl: IMG.laptop        },
  { id: "l08", type: "lost", personName: "Meena Kumari",   rollNo: "22ME4433",  phone: "9876508901", itemName: "AirPods Pro — White",           location: "Seminar Hall, Main Block",         time: "1h ago",  date: "13/03/2026", desc: "White AirPods Pro in a white case. Right earpiece has a small green dot sticker.",                       iconIdx: 14, urgent: false, createdBy: "22ME4433",  imageUrl: IMG.airpods       },
  { id: "l09", type: "lost", personName: "Aakash Singh",   rollNo: "22EEE1231", phone: "9876509012", itemName: "Fossil Chronograph Watch",      location: "Lab 3, Mechanical Block",          time: "5d ago",  date: "08/03/2026", desc: '"A.S" initials engraved on the back. Brown leather strap, silver dial.',                                  iconIdx: 9,  urgent: false, createdBy: "22EEE1231", imageUrl: IMG.watch         },
  { id: "l10", type: "lost", personName: "Pooja Reddy",    rollNo: "21ECE2200", phone: "9876510123", itemName: "Dark Green Adidas Backpack",    location: "Auditorium, Main Block",           time: "2d ago",  date: "11/03/2026", desc: "Dark green backpack containing notebooks, a charger and a red thermos bottle.",                           iconIdx: 8,  urgent: false, createdBy: "21ECE2200", imageUrl: IMG.backpack      },
  { id: "l11", type: "lost", personName: "Nikhil Verma",   rollNo: "22CSE5566", phone: "9876511234", itemName: "Black Prescription Glasses",    location: "Library Reading Area, Table 12",   time: "7h ago",  date: "13/03/2026", desc: "Black rectangular frame glasses with blue-tint lenses. Left at reading table 12.",                       iconIdx: 13, urgent: false, createdBy: "22CSE5566", imageUrl: IMG.glasses       },
  { id: "l12", type: "lost", personName: "Swathi Goud",    rollNo: "22ECE8811", phone: "9876512345", itemName: "boAt Airdopes 441 — Teal",      location: "Sports Ground Bleachers",          time: "3d ago",  date: "10/03/2026", desc: "Teal and black wireless earbuds. Charging case has a crack on the lid.",                                 iconIdx: 14, urgent: false, createdBy: "22ECE8811", imageUrl: IMG.earphones     },
  { id: "l13", type: "lost", personName: "Tarun Babu",     rollNo: "21ME9900",  phone: "9876513456", itemName: "Engineering Drawing Set",       location: "Drawing Hall, Block D",            time: "1d ago",  date: "12/03/2026", desc: "Pentel stationery set in a blue zip pouch, including a protractor, compass and ruler.",                   iconIdx: 12, urgent: false, createdBy: "21ME9900",  imageUrl: IMG.pencilcase    },
  { id: "l14", type: "lost", personName: "Hema Latha",     rollNo: "22CSE3341", phone: "9876514567", itemName: "Red Collapsible Umbrella",      location: "Campus Wi-Fi Lounge",              time: "6h ago",  date: "13/03/2026", desc: "Compact red folding umbrella with slight wear on the handle. Left near the Wi-Fi lounge.",                iconIdx: 10, urgent: false, createdBy: "22CSE3341", imageUrl: IMG.umbrella      },
  { id: "l15", type: "lost", personName: "Vikram Rao",     rollNo: "21ME1122",  phone: "9876515678", itemName: "Sony WH-1000XM4 Headphones",   location: "Cafeteria, Main Counter Area",     time: "4h ago",  date: "13/03/2026", desc: "Black over-ear Sony headphones without a case. Last seen near the food counter.",                        iconIdx: 2,  urgent: true,  createdBy: "21ME1122",  imageUrl: IMG.sonyheadphones},
  { id: "l16", type: "lost", personName: "Deepa Nair",     rollNo: "22EEE4499", phone: "9876516789", itemName: "MacBook MagSafe 67W Charger",   location: "Block C Study Hall",               time: "8h ago",  date: "13/03/2026", desc: '"DN" written in black marker on the brick. White Apple MagSafe 3 charger (67W).',                       iconIdx: 15, urgent: false, createdBy: "22EEE4499", imageUrl: IMG.charger       },
];

const SEED_FOUND = [
  { id: "f01", type: "found", personName: "Sneha Reddy",    rollNo: "22ECE3105", phone: "9876517890", itemName: "Keys with Red Keychain",          location: "Main Gate Security Office",        time: "1h ago",  date: "13/03/2026", desc: "Three keys with a red keychain and a mini LED torch. Submitted to the main gate security.",               iconIdx: 3,  urgent: false, createdBy: "22ECE3105", imageUrl: IMG.keys          },
  { id: "f02", type: "found", personName: "Kiran Babu",     rollNo: "21CSE7701", phone: "9876518901", itemName: "Samsung Galaxy Watch 4",          location: "Central Canteen, Table 6",         time: "6h ago",  date: "13/03/2026", desc: "Black band watch with a minor screen scratch on the right side. Currently kept with the warden.",        iconIdx: 9,  urgent: false, createdBy: "21CSE7701", imageUrl: IMG.smartwatch    },
  { id: "f03", type: "found", personName: "Meera Nair",     rollNo: "22ME1004",  phone: "9876519012", itemName: "Purple Folding Umbrella",          location: "CS Lab Block A Entrance",          time: "2h ago",  date: "13/03/2026", desc: "Compact collapsible purple umbrella with a floral pattern inside. Found near the lab door.",              iconIdx: 10, urgent: false, createdBy: "22ME1004",  imageUrl: IMG.umbrella      },
  { id: "f04", type: "found", personName: "Anil Kumar",     rollNo: "21CSE0092", phone: "9876520123", itemName: "Aditya University Student ID Card",location: "Sports Ground, Near Goal Post",     time: "3h ago",  date: "13/03/2026", desc: "Student ID card found on the ground. Name clearly visible. Submitted to the admin office.",               iconIdx: 4,  urgent: false, createdBy: "21CSE0092", imageUrl: IMG.idcard        },
  { id: "f05", type: "found", personName: "Lakshmi Devi",   rollNo: "22EEE9901", phone: "9876521234", itemName: "Bose Headphones in Black Case",    location: "Block C Corridor, Near Rm 204",    time: "5h ago",  date: "13/03/2026", desc: "Blue Bose headphones in a black case. Found in the corridor. Handed over to the Class Representative.",  iconIdx: 2,  urgent: false, createdBy: "22EEE9901", imageUrl: IMG.headphones    },
  { id: "f06", type: "found", personName: "Ravi Teja",      rollNo: "21CSE3312", phone: "9876522345", itemName: "Blue Stationery Zip Pouch",        location: "Library Reading Hall, Table 8",    time: "8h ago",  date: "13/03/2026", desc: "Blue zip pouch containing a ruler, pens, an eraser and a compass. Placed at the library help desk.",     iconIdx: 12, urgent: false, createdBy: "21CSE3312", imageUrl: IMG.pencilcase    },
  { id: "f07", type: "found", personName: "Harini Devi",    rollNo: "22CSE2234", phone: "9876523456", itemName: "Black 65W Laptop Charger",         location: "CS Lab 2, Block B",                time: "4h ago",  date: "13/03/2026", desc: "Black laptop charger (65W) found under a desk in Lab 2. Has a yellow sticker on the brick.",             iconIdx: 15, urgent: false, createdBy: "22CSE2234", imageUrl: IMG.charger       },
  { id: "f08", type: "found", personName: "Suresh Babu",    rollNo: "21ME0045",  phone: "9876524567", itemName: "Matte Black Steel Bottle 1L",      location: "Gymnasium Entry Area",             time: "2d ago",  date: "11/03/2026", desc: '"SB" initials on the base. Matte black 1L steel bottle found at the gym entry gate.',                   iconIdx: 11, urgent: false, createdBy: "21ME0045",  imageUrl: IMG.bottle        },
  { id: "f09", type: "found", personName: "Anjali Reddy",   rollNo: "22ECE4421", phone: "9876525678", itemName: "Brown Leather Wallet",             location: "Canteen Seating Area",             time: "1d ago",  date: "12/03/2026", desc: "Brown bifold wallet containing some cash and an ID card. Found between canteen seats.",                  iconIdx: 0,  urgent: true,  createdBy: "22ECE4421", imageUrl: IMG.wallet        },
  { id: "f10", type: "found", personName: "Pradeep Rao",    rollNo: "21CSE6677", phone: "9876526789", itemName: "Apple AirPods Pro — White",        location: "Library Study Cubicle 7B",         time: "3h ago",  date: "13/03/2026", desc: "White AirPods Pro in case. Owner name not found nearby. Currently held by the librarian.",               iconIdx: 14, urgent: false, createdBy: "21CSE6677", imageUrl: IMG.airpods       },
  { id: "f11", type: "found", personName: "Chandra Sekhar", rollNo: "22ME5532",  phone: "9876527890", itemName: "Black Reading Glasses",            location: "Reading Room, Library Block",      time: "5h ago",  date: "13/03/2026", desc: "Black rectangular glasses found on reading table 9. Handed over to the librarian.",                     iconIdx: 13, urgent: false, createdBy: "22ME5532",  imageUrl: IMG.glasses       },
  { id: "f12", type: "found", personName: "Radha Krishna",  rollNo: "21EEE3310", phone: "9876528901", itemName: "Set of 3 Spiral Notebooks",        location: "Seminar Hall Exit Area",           time: "6h ago",  date: "13/03/2026", desc: "Three spiral notebooks: Maths, Physics and Chemistry. Available at the department office.",               iconIdx: 7,  urgent: false, createdBy: "21EEE3310", imageUrl: IMG.notebook      },
  { id: "f13", type: "found", personName: "Pavithra S",     rollNo: "22CSE7788", phone: "9876529012", itemName: "Fossil Men's Leather Watch",       location: "Sports Ground Pavilion",           time: "1d ago",  date: "12/03/2026", desc: '"FS" engraved on the back. Brown strap Fossil watch found on the pavilion bench.',                      iconIdx: 9,  urgent: false, createdBy: "22CSE7788", imageUrl: IMG.watch         },
  { id: "f14", type: "found", personName: "Venkat Rao",     rollNo: "21ME2289",  phone: "9876530123", itemName: "Sony WH-1000XM4 Headphones",      location: "Block A Rooftop Garden",           time: "2h ago",  date: "13/03/2026", desc: "Black Sony over-ear headphones near the garden bench. No case. Fully functional.",                       iconIdx: 2,  urgent: false, createdBy: "21ME2289",  imageUrl: IMG.sonyheadphones},
  { id: "f15", type: "found", personName: "Bhavya Teja",    rollNo: "22ECE0011", phone: "9876531234", itemName: "Samsung Galaxy A53 — Blue",       location: "Workshop Block Exit",              time: "7h ago",  date: "13/03/2026", desc: "Blue Samsung A53 without a case. Screen locked. Submitted to workshop block security.",                  iconIdx: 1,  urgent: true,  createdBy: "22ECE0011", imageUrl: IMG.phone         },
  { id: "f16", type: "found", personName: "Naga Sai",       rollNo: "21CSE8899", phone: "9876532345", itemName: "Navy Blue Adidas Backpack",        location: "Main Auditorium, Row 12",          time: "3d ago",  date: "10/03/2026", desc: "Navy blue Adidas backpack with a red logo. Contains books and a charger. Held with security.",           iconIdx: 8,  urgent: false, createdBy: "21CSE8899", imageUrl: IMG.bag           },
];

// ─────────────────────────────────────────────
// AI CREDITS (module-level singleton)
// ─────────────────────────────────────────────

let _aiCredits = 3;
const getAiCredits  = () => _aiCredits;
const consumeAiCredit = () => { _aiCredits = Math.max(0, _aiCredits - 1); };

// ─────────────────────────────────────────────
// AI / MODERATION HELPERS
// ─────────────────────────────────────────────

// Image analysis requires an external multimodal LLM; degrades gracefully to null.
const analyzeImageWithAI = async (_base64, _type) => null;
const verifyItemWithAI   = async (_args)           => null;

async function moderateContent({ itemName, description }) {
  const text = [itemName, description].filter(Boolean).join("\n").trim();
  if (!text) return { safe: true, reason: null };
  const result = await moderationApi.text(text);
  return {
    safe:   result.safe !== false,
    reason: result.reason ?? "",
  };
}

// ─────────────────────────────────────────────
// DATA MAPPERS
// ─────────────────────────────────────────────

function backendItemToUi(it) {
  if (!it?._id) return null;
  const poster = it.postedBy && typeof it.postedBy === "object" ? it.postedBy : null;
  return {
    id:                String(it._id),
    type:              it.status === "found" ? "found" : "lost",
    personName:        poster?.name        ?? it.postedByName  ?? "Anonymous",
    rollNo:            poster?.rollNumber  ?? it.postedByRoll  ?? "",
    phone:             it.contactNumber    ?? poster?.phone    ?? "",
    itemName:          it.itemName         ?? "(Untitled)",
    location:          it.location         ?? "Unknown",
    time:              "Recently",
    date:              it.dateLost ? new Date(it.dateLost).toLocaleDateString() : "",
    desc:              it.description      ?? "",
    iconIdx:           15,
    urgent:            false,
    createdBy:         poster?.rollNumber  ?? it.postedByRoll  ?? "",
    imageUrl:          it.imageUrl         ?? null,
    _matchSuggestions: Array.isArray(it.matchSuggestions) ? it.matchSuggestions : [],
    _backend:          true,
  };
}

function uiItemToBackendPayload(item) {
  return {
    itemName:      item.itemName,
    description:   item.desc         ?? "",
    imageUrl:      item.imageUrl     ?? undefined,
    location:      item.location     ?? "",
    contactNumber: item.phone        ?? "",
    status:        item.type === "found" ? "found" : "lost",
    dateLost:      new Date().toISOString(),
  };
}

// ─────────────────────────────────────────────
// UTILITY FUNCTIONS
// ─────────────────────────────────────────────

function getCurrentTime() {
  const d = new Date();
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function getCurrentDate() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) chunks.push(array.slice(i, i + size));
  return chunks;
}

function resolveVerdictColor(verdict) {
  if (verdict === "High" || verdict === "Likely Owner") return COLOR.green;
  if (verdict === "Medium" || verdict === "Uncertain") return COLOR.gold;
  return COLOR.red;
}

// ─────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────

function useEntranceAnimation(delay = 0, translateYOffset = 18) {
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(translateYOffset)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 520, delay, easing: EASE, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 520, delay, easing: EASE, useNativeDriver: true }),
    ]).start();
  }, []);

  return { opacity, transform: [{ translateY }] };
}

// ─────────────────────────────────────────────
// SHARED MICRO-COMPONENTS
// ─────────────────────────────────────────────

function ScoreBar({ score }) {
  const barColor = score >= 70 ? COLOR.green : score >= 40 ? COLOR.gold : COLOR.red;
  return (
    <View style={SharedS.barBackground}>
      <View style={[SharedS.barFill, { width: `${score}%`, backgroundColor: barColor }]} />
    </View>
  );
}

const SharedS = StyleSheet.create({
  barBackground: { height: 6, backgroundColor: "#EEE", borderRadius: 3, overflow: "hidden" },
  barFill:       { height: "100%", borderRadius: 3 },
});
