// ─────────────────────────────────────────────
// IMPORTS
// ─────────────────────────────────────────────

import React, { useRef, useEffect, useState, useCallback } from "react";
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
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { memoriesApi, moderationApi } from "../services/api";

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const { width, height } = Dimensions.get("window");

const THEME = {
  primary:      "#E8445A",
  primaryDark:  "#C22040",
  primaryLight: "#F28096",
  primaryPale:  "#FFF0F3",
  secondary:    "#FF7043",
  bg:           "#FAFAFA",
  surface:      "#FFFFFF",
  surfaceAlt:   "#FFF0F3",
  textDark:     "#262626",
  textMid:      "#8E8E8E",
  textLight:    "#C7C7C7",
  border:       "#DBDBDB",
  liked:        "#E8445A",
};

const EASE = Easing.bezier(0.22, 1, 0.36, 1);

const CURRENT_USER = { name: "Varshitha", rollNo: "22BCE7890", avatar: "V" };

const POST_TAGS = [
  "Campus", "Friends", "Sports", "Study Life",
  "Events", "Tech", "Personal", "Food",
];

const GRAD_PALETTES = [
  { colors: ["#1a1a2e", "#16213e"], label: "Midnight" },
  { colors: ["#0f3460", "#533483"], label: "Ocean"    },
  { colors: ["#2d6a4f", "#1b4332"], label: "Forest"   },
  { colors: ["#6d2b8e", "#3d1054"], label: "Royal"    },
  { colors: ["#c77dff", "#7b2ff7"], label: "Violet"   },
  { colors: ["#f72585", "#7209b7"], label: "Neon"     },
  { colors: ["#e76f51", "#f4a261"], label: "Ember"    },
  { colors: ["#023e8a", "#0077b6"], label: "Navy"     },
  { colors: ["#2b2d42", "#8d99ae"], label: "Slate"    },
  { colors: ["#1d3557", "#457b9d"], label: "Steel"    },
];

const AVATAR_COLORS = {
  A: ["#667EEA", "#764BA2"],
  S: ["#F093FB", "#F5576C"],
  K: ["#43E97B", "#38F9D7"],
  P: ["#FA709A", "#FEE140"],
  R: ["#4FACFE", "#00F2FE"],
  M: ["#A18CD1", "#FBC2EB"],
  D: ["#FD7C6E", "#FFC170"],
  V: ["#E8445A", "#C22040"],
  N: ["#0F3460", "#533483"],
  T: ["#2D6A4F", "#1B4332"],
};

const CAMPUS_IMAGES = [
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80",
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
  "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=800&q=80",
  "https://images.unsplash.com/photo-1476900543704-4312b650a486?w=800&q=80",
  "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=80",
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80",
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80",
  "https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=800&q=80",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
  "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&q=80",
  "https://images.unsplash.com/photo-1540553016722-983e48a2cd10?w=800&q=80",
];

const DEFAULT_POSTS = [
  {
    id: "d1", author: "Arjun Mehta",   authorRoll: "21CSE4501", avatar: "A",
    imageUri: CAMPUS_IMAGES[0],  gradIdx: null, likes: 142, liked: false,
    timeAgo: "2h ago",  tag: "Graduation", isOwn: false,
    description: "Graduation day — the moment we've all been waiting for! 🎓 Four years of hard work, late nights, and unforgettable memories. So proud of our batch! #AdityaUniversity #Class2025",
  },
  {
    id: "d2", author: "Sneha Reddy",   authorRoll: "22ECE3302", avatar: "S",
    imageUri: CAMPUS_IMAGES[1],  gradIdx: null, likes: 89,  liked: false,
    timeAgo: "5h ago",  tag: "Friends",    isOwn: false,
    description: "Squad goals 🔥 College would be nothing without these people. Every laugh, every chai break — all with my favourites! ❤️ #SquadForLife #CollegeDays",
  },
  {
    id: "d3", author: CURRENT_USER.name, authorRoll: CURRENT_USER.rollNo, avatar: CURRENT_USER.avatar,
    imageUri: null, gradIdx: 0, likes: 54, liked: true,
    timeAgo: "1d ago", tag: "Personal", isOwn: true,
    description: "First day at Aditya University ✨ Walking into campus with butterflies but leaving with a family. This place changed me forever. 🏫💙 #NewBeginnings #AdityaVibes",
  },
  {
    id: "d4", author: "Kiran Babu",    authorRoll: "21CSE7701", avatar: "K",
    imageUri: CAMPUS_IMAGES[2],  gradIdx: null, likes: 203, liked: false,
    timeAgo: "2d ago",  tag: "Sports",     isOwn: false,
    description: "Inter-college cricket tournament 🏏 We brought the trophy home!! CHAMPIONS! 🏆 #Cricket #AdityaSports #Champions",
  },
  {
    id: "d5", author: "Priya Sharma",  authorRoll: "22EEE5540", avatar: "P",
    imageUri: CAMPUS_IMAGES[3],  gradIdx: null, likes: 67,  liked: false,
    timeAgo: "3d ago",  tag: "Study Life", isOwn: false,
    description: "Late night in the library before finals 📚 The silence, the coffee cups — somehow this became home for a whole semester. 🥺 #StudyLife #LibraryNights",
  },
  {
    id: "d6", author: "Rohit Kumar",   authorRoll: "21ME2210",  avatar: "R",
    imageUri: CAMPUS_IMAGES[4],  gradIdx: null, likes: 178, liked: false,
    timeAgo: "4d ago",  tag: "Campus",     isOwn: false,
    description: "Sunset from the rooftop of Block C 🌅 After a long day of labs and assignments, this view makes everything worth it. #Sunset #GoldenHour #CampusLife",
  },
  {
    id: "d7", author: "Meera Nair",    authorRoll: "22ME1004",  avatar: "M",
    imageUri: CAMPUS_IMAGES[5],  gradIdx: null, likes: 95,  liked: false,
    timeAgo: "5d ago",  tag: "Tech",       isOwn: false,
    description: "Hackathon 2025 — 24 hours of pure madness 💻🔥 Sleep-deprived but absolutely worth it! #Hackathon2025 #TechLife #BuildFast",
  },
  {
    id: "d8", author: "Divya Rao",     authorRoll: "22CSE1104", avatar: "D",
    imageUri: CAMPUS_IMAGES[6],  gradIdx: null, likes: 134, liked: false,
    timeAgo: "6d ago",  tag: "Events",     isOwn: false,
    description: "Cultural fest day 🎭🎶 The performances were absolutely mind-blowing! Our college really knows how to celebrate! #CulturalFest #Aditya2025",
  },
  {
    id: "d9", author: "Naveen Raj",    authorRoll: "21ECE3301", avatar: "N",
    imageUri: CAMPUS_IMAGES[7],  gradIdx: null, likes: 45,  liked: false,
    timeAgo: "1w ago",  tag: "Study Life", isOwn: false,
    description: "First lecture of the semester with the best professor we've ever had 🙌 This is going to be an amazing year! #ClassroomVibes #Learning",
  },
  {
    id: "d10", author: "Teja Varma",   authorRoll: "21ME0042",  avatar: "T",
    imageUri: null, gradIdx: 7, likes: 72, liked: false,
    timeAgo: "1w ago",  tag: "Personal",   isOwn: false,
    description: "Three years into engineering and I've finally found what I love ❤️ The late nights, the deadlines, the frustration — it all leads to growth. 💪 #EngineeringLife",
  },
  {
    id: "d11", author: "Sneha Reddy",  authorRoll: "22ECE3302", avatar: "S",
    imageUri: CAMPUS_IMAGES[8],  gradIdx: null, likes: 118, liked: false,
    timeAgo: "1w ago",  tag: "Graduation", isOwn: false,
    description: "College convocation rehearsal 🎓 We've been waiting for this day for so long! Next week, we officially become alumni ✨ #Convocation #Graduation",
  },
  {
    id: "d12", author: "Arjun Mehta",  authorRoll: "21CSE4501", avatar: "A",
    imageUri: CAMPUS_IMAGES[9],  gradIdx: null, likes: 93,  liked: false,
    timeAgo: "2w ago",  tag: "Friends",    isOwn: false,
    description: "Group study session turned into the best evening ever 😂📚 These people make even revision fun! #StudyGroup #CollegeLife #Friends",
  },
  {
    id: "d13", author: "Kiran Babu",   authorRoll: "21CSE7701", avatar: "K",
    imageUri: CAMPUS_IMAGES[10], gradIdx: null, likes: 156, liked: false,
    timeAgo: "2w ago",  tag: "Campus",     isOwn: false,
    description: "Morning fog on campus is unreal sometimes 🌫️ Woke up early for a 7AM lab and caught this view. Worth every lost minute of sleep 😍 #CampusBeauty",
  },
  {
    id: "d14", author: CURRENT_USER.name, authorRoll: CURRENT_USER.rollNo, avatar: CURRENT_USER.avatar,
    imageUri: CAMPUS_IMAGES[11], gradIdx: null, likes: 211, liked: false,
    timeAgo: "3w ago",  tag: "Tech",       isOwn: true,
    description: "Tech symposium 2025! 🖥️✨ Our project got selected for the top 5 presentations. The hard work finally paid off! So grateful for my amazing team 🤝 #TechSymposium",
  },
  {
    id: "d15", author: "Priya Sharma",  authorRoll: "22EEE5540", avatar: "P",
    imageUri: null, gradIdx: 4, likes: 389, liked: false,
    timeAgo: "3w ago",  tag: "Personal",   isOwn: false,
    description: "Four years of memories, friendships, failures, victories, and growth. College has shaped me into who I am today. Forever grateful for every moment at Aditya ❤️ #ForeverAdityaian",
  },
];

// ─────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────

const backendMemoryToUi = (m) => {
  if (!m || !m._id) return null;
  const author = m.authorId && typeof m.authorId === "object"
    ? m.authorId.name || "Anonymous"
    : "Anonymous";
  const roll = m.authorId && typeof m.authorId === "object"
    ? m.authorId.rollNumber || ""
    : "";
  return {
    id:          String(m._id),
    author,
    authorRoll:  roll,
    avatar:      (author[0] || "A").toUpperCase(),
    imageUri:    m.imageUrl || null,
    gradIdx:     m.imageUrl ? null : 0,
    description: [m.title, m.description].filter(Boolean).join("\n\n"),
    likes:       0,
    liked:       false,
    timeAgo:     m.createdAt ? new Date(m.createdAt).toLocaleDateString() : "Recently",
    tag:         "Campus",
    isOwn:       false,
    _backend:    true,
  };
};

const moderateContent = async ({ description, imageUri }) => {
  const text = (description || "").trim();
  if (!text && !imageUri) return { safe: true, reason: "", category: "approved" };
  const result = await moderationApi.memory({ description: text, imageUri });
  return {
    safe:     result.safe !== false,
    reason:   result.reason || "",
    category: result.safe === false ? "offensive_language" : "approved",
  };
};

// ─────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────

const useEntrance = (delay = 0, dy = 18) => {
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(dy)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 460, delay, easing: EASE, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 460, delay, easing: EASE, useNativeDriver: true }),
    ]).start();
  }, []);
  return { opacity, transform: [{ translateY }] };
};

// ─────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────

const Avatar = ({ letter, size = 36 }) => {
  const colors = AVATAR_COLORS[letter] || ["#667EEA", "#764BA2"];
  return (
    <LinearGradient
      colors={colors}
      style={{ width: size, height: size, borderRadius: size / 2, justifyContent: "center", alignItems: "center" }}
    >
      <Text style={{ color: "#fff", fontWeight: "800", fontSize: size * 0.38 }}>
        {letter}
      </Text>
    </LinearGradient>
  );
};

// ─────────────────────────────────────────────
// MODERATION MODAL
// ─────────────────────────────────────────────

const ModerationModal = ({ visible, reason, onClose }) => (
  <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
    <View style={moderationStyles.overlay}>
      <View style={moderationStyles.card}>
        <LinearGradient colors={["#FF4444", "#CC2222"]} style={moderationStyles.iconCircle}>
          <Ionicons name="shield-checkmark" size={32} color="#fff" />
        </LinearGradient>
        <Text style={moderationStyles.title}>Post Rejected</Text>
        <Text style={moderationStyles.reason}>{reason}</Text>
        <Text style={moderationStyles.hint}>
          Only positive, respectful campus content is allowed. This includes
          friends, events, academics, sports, and celebrations.
        </Text>
        <TouchableOpacity onPress={onClose} style={moderationStyles.btnWrap} activeOpacity={0.85}>
          <LinearGradient colors={["#FF4444", "#CC2222"]} style={moderationStyles.btn}>
            <Text style={moderationStyles.btnTxt}>Got it</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const moderationStyles = StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center", paddingHorizontal: 24 },
  card:       { backgroundColor: "#fff", borderRadius: 24, padding: 28, alignItems: "center", width: "100%" },
  iconCircle: { width: 70, height: 70, borderRadius: 35, justifyContent: "center", alignItems: "center", marginBottom: 16 },
  title:      { fontSize: 20, fontWeight: "900", color: "#262626", marginBottom: 10, textAlign: "center" },
  reason:     { fontSize: 14, color: "#CC2222", fontWeight: "600", textAlign: "center", marginBottom: 10, lineHeight: 21 },
  hint:       { fontSize: 12, color: "#8E8E8E", textAlign: "center", lineHeight: 18, marginBottom: 22 },
  btnWrap:    { width: "100%", borderRadius: 12, overflow: "hidden" },
  btn:        { paddingVertical: 14, alignItems: "center" },
  btnTxt:     { color: "#fff", fontWeight: "800", fontSize: 15 },
});

// ─────────────────────────────────────────────
// POST OPTIONS SHEET
// ─────────────────────────────────────────────

const PostOptionsSheet = ({ visible, isOwn, onClose, onDelete, onEdit }) => {
  const slideY = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideY, { toValue: 0, speed: 20, bounciness: 4, useNativeDriver: true }).start();
    } else {
      Animated.timing(slideY, { toValue: 300, duration: 220, easing: EASE, useNativeDriver: true }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={optionsStyles.overlay} />
      </TouchableWithoutFeedback>
      <Animated.View style={[optionsStyles.sheet, { transform: [{ translateY: slideY }] }]}>
        <View style={optionsStyles.handle} />

        {isOwn ? (
          <>
            <TouchableOpacity style={optionsStyles.row} onPress={onEdit}>
              <Ionicons name="create-outline" size={22} color="#262626" />
              <Text style={optionsStyles.rowTxt}>Edit Caption</Text>
            </TouchableOpacity>
            <View style={optionsStyles.sep} />
            <TouchableOpacity style={optionsStyles.row} onPress={onDelete}>
              <Ionicons name="trash-outline" size={22} color="#FF3040" />
              <Text style={[optionsStyles.rowTxt, { color: "#FF3040" }]}>Delete Post</Text>
            </TouchableOpacity>
            <View style={optionsStyles.sep} />
          </>
        ) : (
          <>
            <TouchableOpacity style={optionsStyles.row} onPress={onClose}>
              <Ionicons name="flag-outline" size={22} color="#FF3040" />
              <Text style={[optionsStyles.rowTxt, { color: "#FF3040" }]}>Report Post</Text>
            </TouchableOpacity>
            <View style={optionsStyles.sep} />
          </>
        )}

        <TouchableOpacity style={optionsStyles.row} onPress={onClose}>
          <Ionicons name="bookmark-outline" size={22} color="#262626" />
          <Text style={optionsStyles.rowTxt}>Save Post</Text>
        </TouchableOpacity>
        <View style={optionsStyles.sep} />

        <View style={[optionsStyles.sep, { marginBottom: 8 }]} />
        <TouchableOpacity style={[optionsStyles.row, { justifyContent: "center" }]} onPress={onClose}>
          <Text style={[optionsStyles.rowTxt, { color: "#8E8E8E" }]}>Cancel</Text>
        </TouchableOpacity>
        <View style={{ height: 16 }} />
      </Animated.View>
    </Modal>
  );
};

const optionsStyles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)" },
  sheet:   { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 12, paddingHorizontal: 20 },
  handle:  { width: 36, height: 4, borderRadius: 2, backgroundColor: "#DBDBDB", alignSelf: "center", marginBottom: 14 },
  row:     { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14 },
  rowTxt:  { fontSize: 15, color: "#262626", fontWeight: "500" },
  sep:     { height: 1, backgroundColor: "#F0F0F0" },
});

// ─────────────────────────────────────────────
// EDIT CAPTION MODAL
// ─────────────────────────────────────────────

const EditModal = ({ visible, currentDesc, onClose, onSave }) => {
  const [text, setText] = useState(currentDesc);

  useEffect(() => {
    if (visible) setText(currentDesc);
  }, [visible, currentDesc]);

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={editStyles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ width: "100%" }}>
          <View style={editStyles.card}>
            <View style={editStyles.headerRow}>
              <TouchableOpacity onPress={onClose}>
                <Text style={editStyles.cancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={editStyles.title}>Edit Caption</Text>
              <TouchableOpacity onPress={() => { onSave(text); onClose(); }}>
                <Text style={editStyles.done}>Done</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={editStyles.input}
              value={text}
              onChangeText={setText}
              multiline
              autoFocus
              maxLength={500}
              placeholderTextColor="#C7C7C7"
            />
            <Text style={editStyles.count}>{text.length}/500</Text>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const editStyles = StyleSheet.create({
  overlay:   { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  card:      { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, minHeight: 260 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  cancel:    { fontSize: 15, color: "#8E8E8E" },
  title:     { fontSize: 15, fontWeight: "700", color: "#262626" },
  done:      { fontSize: 15, fontWeight: "700", color: THEME.primary },
  input:     { fontSize: 14, color: "#262626", lineHeight: 22, minHeight: 120, textAlignVertical: "top", borderWidth: 1, borderColor: "#DBDBDB", borderRadius: 12, padding: 12 },
  count:     { fontSize: 11, color: "#8E8E8E", textAlign: "right", marginTop: 6 },
});

// ─────────────────────────────────────────────
// NEW POST MODAL
// ─────────────────────────────────────────────

const NewPostModal = ({ visible, onClose, onPost }) => {
  const slideY = useRef(new Animated.Value(height)).current;
  const [desc,         setDesc]         = useState("");
  const [image,        setImage]        = useState(null);
  const [gradIdx,      setGradIdx]      = useState(0);
  const [tag,          setTag]          = useState("Campus");
  const [posting,      setPosting]      = useState(false);
  const [modChecking,  setModChecking]  = useState(false);
  const [modError,     setModError]     = useState(null);

  useEffect(() => {
    if (visible) {
      setDesc(""); setImage(null); setGradIdx(0);
      setTag("Campus"); setPosting(false);
      setModChecking(false); setModError(null);
      Animated.spring(slideY, { toValue: 0, speed: 16, bounciness: 3, useNativeDriver: true }).start();
    } else {
      Animated.timing(slideY, { toValue: height, duration: 260, easing: EASE, useNativeDriver: true }).start();
    }
  }, [visible]);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, quality: 0.8, aspect: [1, 1], base64: true,
    });
    if (res.canceled) return;
    const asset = res.assets[0];
    setImage({ uri: asset.uri, base64: asset.base64, mediaType: asset.mimeType || "image/jpeg" });
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchCameraAsync({
      allowsEditing: true, quality: 0.8, aspect: [1, 1], base64: true,
    });
    if (res.canceled) return;
    const asset = res.assets[0];
    setImage({ uri: asset.uri, base64: asset.base64, mediaType: asset.mimeType || "image/jpeg" });
  };

  const handlePost = async () => {
    if (!desc.trim() && !image) return;
    setModChecking(true);
    const mod = await moderateContent({ imageUri: image?.uri, description: desc });
    setModChecking(false);
    if (!mod.safe) {
      setModError(mod.reason || "This content violates our community guidelines.");
      return;
    }
    setPosting(true);
    setTimeout(() => {
      onPost({
        id:          `p_${Date.now()}`,
        author:      CURRENT_USER.name,
        authorRoll:  CURRENT_USER.rollNo,
        avatar:      CURRENT_USER.avatar,
        imageUri:    image?.uri ?? null,
        gradIdx:     image ? null : gradIdx,
        description: desc.trim(),
        likes: 0, liked: false,
        timeAgo: "Just now",
        tag, isOwn: true,
      });
      setPosting(false);
      onClose();
    }, 400);
  };

  if (!visible) return null;
  const busy = modChecking || posting;

  return (
    <>
      <Modal transparent animationType="none" onRequestClose={onClose}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            <TouchableWithoutFeedback onPress={onClose}>
              <View style={newPostStyles.overlay} />
            </TouchableWithoutFeedback>
            <Animated.View style={[newPostStyles.sheet, { transform: [{ translateY: slideY }] }]}>

              {/* Header */}
              <View style={newPostStyles.sheetHead}>
                <View style={newPostStyles.handle} />
                <View style={newPostStyles.titleRow}>
                  <TouchableOpacity onPress={onClose} style={newPostStyles.closeBtn}>
                    <Ionicons name="close" size={22} color="#262626" />
                  </TouchableOpacity>
                  <Text style={newPostStyles.title}>New Post</Text>
                  <TouchableOpacity
                    onPress={handlePost}
                    disabled={(!desc.trim() && !image) || busy}
                    style={[newPostStyles.shareBtn, ((!desc.trim() && !image) || busy) && { opacity: 0.45 }]}
                  >
                    {busy ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={newPostStyles.shareBtnTxt}>Share</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <ScrollView
                  style={newPostStyles.scroll}
                  contentContainerStyle={{ paddingBottom: 36 }}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  {/* Author */}
                  <View style={newPostStyles.authorRow}>
                    <Avatar letter={CURRENT_USER.avatar} size={42} />
                    <View>
                      <Text style={newPostStyles.authorName}>{CURRENT_USER.name}</Text>
                      <Text style={newPostStyles.authorRoll}>{CURRENT_USER.rollNo}</Text>
                    </View>
                  </View>

                  {/* Caption */}
                  <TextInput
                    style={newPostStyles.captionInput}
                    placeholder="Write a caption..."
                    placeholderTextColor="#C7C7C7"
                    value={desc}
                    onChangeText={setDesc}
                    multiline
                    maxLength={500}
                  />
                  <Text style={newPostStyles.charCount}>{desc.length}/500</Text>

                  {/* Image or Gradient picker */}
                  {image ? (
                    <View style={newPostStyles.imgWrap}>
                      <Image source={{ uri: image.uri }} style={newPostStyles.imgPreview} resizeMode="cover" />
                      <TouchableOpacity style={newPostStyles.imgRemove} onPress={() => setImage(null)}>
                        <View style={newPostStyles.imgRemoveCircle}>
                          <Ionicons name="close" size={16} color="#fff" />
                        </View>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={newPostStyles.gradSection}>
                      <Text style={newPostStyles.sectionLabel}>BACKGROUND COLOR</Text>
                      <LinearGradient colors={GRAD_PALETTES[gradIdx].colors} style={newPostStyles.gradPreview}>
                        <Text style={newPostStyles.gradPreviewLabel}>{GRAD_PALETTES[gradIdx].label}</Text>
                      </LinearGradient>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={newPostStyles.swatchRow}>
                        {GRAD_PALETTES.map((g, i) => (
                          <TouchableOpacity key={i} onPress={() => setGradIdx(i)} style={newPostStyles.swatchWrap}>
                            <LinearGradient colors={g.colors} style={[newPostStyles.swatch, gradIdx === i && newPostStyles.swatchOn]} />
                            {gradIdx === i && (
                              <View style={newPostStyles.swatchCheck}>
                                <Ionicons name="checkmark" size={12} color="#fff" />
                              </View>
                            )}
                            <Text style={newPostStyles.swatchLabel}>{g.label}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}

                  {/* Photo buttons */}
                  <View style={newPostStyles.photoBtnRow}>
                    <TouchableOpacity style={newPostStyles.photoBtn} onPress={pickImage} activeOpacity={0.8}>
                      <Ionicons name="images-outline" size={18} color="#262626" />
                      <Text style={newPostStyles.photoBtnTxt}>Gallery</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={newPostStyles.photoBtn} onPress={takePhoto} activeOpacity={0.8}>
                      <Ionicons name="camera-outline" size={18} color="#262626" />
                      <Text style={newPostStyles.photoBtnTxt}>Camera</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Tags */}
                  <Text style={newPostStyles.sectionLabel}>TAG</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
                    {POST_TAGS.map((t) => (
                      <TouchableOpacity key={t} style={[newPostStyles.tagChip, tag === t && newPostStyles.tagChipOn]} onPress={() => setTag(t)} activeOpacity={0.8}>
                        <Text style={[newPostStyles.tagChipTxt, tag === t && newPostStyles.tagChipTxtOn]}>{t}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {/* Moderation status */}
                  {modChecking && (
                    <View style={newPostStyles.checkRow}>
                      <ActivityIndicator size="small" color={THEME.primary} />
                      <Text style={newPostStyles.checkTxt}>AI is reviewing your content...</Text>
                    </View>
                  )}

                  <View style={newPostStyles.aiNote}>
                    <Ionicons name="sparkles-outline" size={13} color="#8E8E8E" />
                    <Text style={newPostStyles.aiNoteTxt}>Content is reviewed by AI before posting</Text>
                  </View>
                </ScrollView>
              </KeyboardAvoidingView>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <ModerationModal visible={!!modError} reason={modError || ""} onClose={() => setModError(null)} />
    </>
  );
};

const newPostStyles = StyleSheet.create({
  overlay:          { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)" },
  sheet:            { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: height * 0.94 },
  sheetHead:        { paddingTop: 10, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#DBDBDB" },
  handle:           { width: 36, height: 4, borderRadius: 2, backgroundColor: "#DBDBDB", alignSelf: "center", marginBottom: 14 },
  titleRow:         { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  closeBtn:         { width: 36, height: 36, justifyContent: "center" },
  title:            { fontSize: 16, fontWeight: "700", color: "#262626" },
  shareBtn:         { backgroundColor: THEME.primary, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20 },
  shareBtnTxt:      { color: "#fff", fontWeight: "700", fontSize: 14 },
  scroll:           { paddingHorizontal: 16, paddingTop: 16 },
  authorRow:        { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  authorName:       { fontSize: 14, fontWeight: "700", color: "#262626" },
  authorRoll:       { fontSize: 11, color: "#8E8E8E", marginTop: 1 },
  captionInput:     { fontSize: 15, color: "#262626", lineHeight: 22, minHeight: 80, marginBottom: 4 },
  charCount:        { fontSize: 11, color: "#C7C7C7", textAlign: "right", marginBottom: 14 },
  imgWrap:          { borderRadius: 14, overflow: "hidden", marginBottom: 14, position: "relative" },
  imgPreview:       { width: "100%", height: width - 32, borderRadius: 14 },
  imgRemove:        { position: "absolute", top: 10, right: 10 },
  imgRemoveCircle:  { width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "center", alignItems: "center" },
  gradSection:      { marginBottom: 14 },
  sectionLabel:     { fontSize: 11, fontWeight: "700", color: "#8E8E8E", letterSpacing: 0.8, marginBottom: 10, marginTop: 4 },
  gradPreview:      { height: 140, borderRadius: 14, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  gradPreviewLabel: { color: "rgba(255,255,255,0.85)", fontWeight: "700", fontSize: 15, letterSpacing: 1 },
  swatchRow:        { gap: 10, paddingBottom: 4 },
  swatchWrap:       { alignItems: "center", gap: 4 },
  swatch:           { width: 40, height: 40, borderRadius: 20 },
  swatchOn:         { width: 44, height: 44, borderRadius: 22, borderWidth: 3, borderColor: THEME.primary },
  swatchCheck:      { position: "absolute", top: 0, right: 0, width: 18, height: 18, borderRadius: 9, backgroundColor: THEME.primary, justifyContent: "center", alignItems: "center" },
  swatchLabel:      { fontSize: 9, color: "#8E8E8E", fontWeight: "600" },
  photoBtnRow:      { flexDirection: "row", gap: 10, marginBottom: 18 },
  photoBtn:         { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#F5F5F5", borderRadius: 12, paddingVertical: 12, borderWidth: 1, borderColor: "#E0E0E0" },
  photoBtnTxt:      { fontSize: 13, fontWeight: "600", color: "#262626" },
  tagChip:          { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: "#F5F5F5", borderWidth: 1, borderColor: "#E0E0E0" },
  tagChipOn:        { backgroundColor: THEME.primary, borderColor: THEME.primary },
  tagChipTxt:       { fontSize: 12, fontWeight: "600", color: "#8E8E8E" },
  tagChipTxtOn:     { color: "#fff" },
  checkRow:         { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#FFF0F3", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, marginTop: 12 },
  checkTxt:         { fontSize: 13, color: THEME.primary, fontWeight: "600" },
  aiNote:           { flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "center", marginTop: 14 },
  aiNoteTxt:        { fontSize: 11, color: "#C7C7C7" },
});

// ─────────────────────────────────────────────
// POST CARD
// ─────────────────────────────────────────────

const PostCard = React.memo(({ post, onLike, onOptions, index }) => {
  const anim       = useEntrance(Math.min(index, 4) * 60, 16);
  const heartScale = useRef(new Animated.Value(1)).current;
  const [showFull, setShowFull] = useState(false);
  const isLong = post.description.length > 130;

  const handleLike = () => {
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.6, speed: 26, bounciness: 16, useNativeDriver: true }),
      Animated.spring(heartScale, { toValue: 1,   speed: 18, bounciness: 6,  useNativeDriver: true }),
    ]).start();
    onLike(post.id);
  };

  return (
    <Animated.View style={[anim, styles.card]}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <Avatar letter={post.avatar} size={34} />
        <View style={{ flex: 1 }}>
          <Text style={styles.authorName}>{post.author}</Text>
          <Text style={styles.authorSub}>{post.authorRoll} · {post.timeAgo}</Text>
        </View>
        <View style={styles.tagPill}>
          <Text style={styles.tagTxt}>#{post.tag}</Text>
        </View>
        <TouchableOpacity onPress={() => onOptions(post)} style={styles.dotsBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#262626" />
        </TouchableOpacity>
      </View>

      {/* Media */}
      {post.imageUri ? (
        <Image source={{ uri: post.imageUri }} style={styles.postImg} resizeMode="cover" />
      ) : (
        <LinearGradient colors={GRAD_PALETTES[post.gradIdx ?? 0].colors} style={styles.postGrad}>
          <Ionicons name="images-outline" size={32} color="rgba(255,255,255,0.3)" />
        </LinearGradient>
      )}

      {/* Action bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity onPress={handleLike} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.8}>
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <Ionicons name={post.liked ? "heart" : "heart-outline"} size={28} color={post.liked ? THEME.liked : "#262626"} />
          </Animated.View>
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.7}>
          <Ionicons name="bookmark-outline" size={25} color="#262626" />
        </TouchableOpacity>
      </View>

      {/* Likes */}
      {post.likes > 0 && (
        <Text style={styles.likesLine}>
          {post.likes.toLocaleString()} {post.likes === 1 ? "like" : "likes"}
        </Text>
      )}

      {/* Caption */}
      <View style={styles.captionBlock}>
        <Text style={styles.captionText} numberOfLines={showFull ? undefined : 3}>
          <Text style={styles.captionAuthor}>{post.author.split(" ")[0]} </Text>
          {post.description}
        </Text>
        {isLong && !showFull && (
          <TouchableOpacity onPress={() => setShowFull(true)}>
            <Text style={styles.moreBtn}>more</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={{ height: 14 }} />
    </Animated.View>
  );
});

// ─────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────

export default function CampusMemoriesScreen({ navigation }) {
  const [posts,       setPosts]       = useState(DEFAULT_POSTS);
  const [showForm,    setShowForm]    = useState(false);
  const [optionPost,  setOptionPost]  = useState(null);
  const [editPost,    setEditPost]    = useState(null);

  const STATUS_BAR_HEIGHT = Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 24;
  const headerAnim = useEntrance(0, -8);

  // Load backend memories on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await memoriesApi.list();
        if (cancelled) return;
        const uiPosts = (Array.isArray(list) ? list : []).map(backendMemoryToUi).filter(Boolean);
        if (uiPosts.length) {
          setPosts((prev) => [...uiPosts, ...prev.filter((p) => !p._backend)]);
        }
      } catch (err) {
        console.warn("[Memories] backend fetch failed (using seed data):", err?.message || err);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleLike = useCallback((id) => {
    setPosts((prev) =>
      prev.map((p) => p.id === id
        ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
        : p
      )
    );
  }, []);

  const handleNewPost = useCallback(async (post) => {
    setPosts((prev) => [post, ...prev]);
    try {
      const result = await memoriesApi.create({
        title:       post.tag || "Memory",
        description: post.description || "",
        imageUrl:    post.imageUri || undefined,
      });
      const created = backendMemoryToUi(result?.memory);
      if (created) {
        setPosts((prev) => prev.map((p) => (p.id === post.id ? created : p)));
      }
    } catch (err) {
      console.warn("[Memories] backend create failed:", err?.message || err);
    }
  }, []);

  const handleDelete = useCallback(() => {
    if (!optionPost) return;
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          const { id, _backend } = optionPost;
          setPosts((prev) => prev.filter((p) => p.id !== id));
          setOptionPost(null);
          if (_backend) {
            try {
              await memoriesApi.remove(id);
            } catch (err) {
              console.warn("[Memories] backend delete failed:", err?.message || err);
            }
          }
        },
      },
    ]);
  }, [optionPost]);

  const handleEditSave = useCallback(async (newDesc) => {
    if (!editPost) return;
    const { id, _backend } = editPost;
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, description: newDesc } : p)));
    setEditPost(null);
    if (_backend) {
      try {
        await memoriesApi.update(id, { description: newDesc });
      } catch (err) {
        console.warn("[Memories] backend update failed:", err?.message || err);
      }
    }
  }, [editPost]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.surface} translucent={false} />

      <Animated.View style={[headerAnim, styles.header, { paddingTop: STATUS_BAR_HEIGHT + 2 }]}>
        <TouchableOpacity style={styles.hBtn} onPress={() => navigation?.goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color="#262626" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <LinearGradient colors={[THEME.primary, THEME.secondary]} style={styles.headerLogo}>
            <Ionicons name="camera" size={15} color="#fff" />
          </LinearGradient>
          <Text style={styles.headerTitle}>Campus Memories</Text>
        </View>
        <View style={{ width: 36 }} />
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        {posts.map((post, i) => (
          <PostCard key={post.id} post={post} index={i} onLike={handleLike} onOptions={setOptionPost} />
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setShowForm(true)} activeOpacity={0.88}>
        <LinearGradient colors={[THEME.primary, THEME.primaryDark]} style={styles.fabGrad}>
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      <NewPostModal visible={showForm} onClose={() => setShowForm(false)} onPost={handleNewPost} />

      <PostOptionsSheet
        visible={!!optionPost}
        isOwn={optionPost?.isOwn ?? false}
        onClose={() => setOptionPost(null)}
        onDelete={handleDelete}
        onEdit={() => { setEditPost(optionPost); setOptionPost(null); }}
      />

      <EditModal
        visible={!!editPost}
        currentDesc={editPost?.description ?? ""}
        onClose={() => setEditPost(null)}
        onSave={handleEditSave}
      />
    </View>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  // Layout
  root:         { flex: 1, backgroundColor: THEME.bg },

  // Header
  header:       { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingBottom: 10, backgroundColor: THEME.surface, borderBottomWidth: 0.5, borderBottomColor: "#DBDBDB" },
  hBtn:         { width: 36, height: 36, justifyContent: "center" },
  headerCenter: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerLogo:   { width: 28, height: 28, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  headerTitle:  { fontSize: 16, fontWeight: "800", color: "#262626", letterSpacing: 0.1 },

  // Post Card
  card:         { backgroundColor: THEME.surface, marginBottom: 8 },
  cardHeader:   { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingVertical: 10 },
  authorName:   { fontSize: 13, fontWeight: "700", color: "#262626" },
  authorSub:    { fontSize: 11, color: "#8E8E8E", marginTop: 1 },
  tagPill:      { backgroundColor: "#FFF0F3", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: "#F5D0DA", marginRight: 4 },
  tagTxt:       { fontSize: 10, fontWeight: "700", color: THEME.primary },
  dotsBtn:      { padding: 4 },
  postImg:      { width, height: width },
  postGrad:     { width, height: width * 0.75, justifyContent: "center", alignItems: "center" },
  actionBar:    { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingTop: 10, paddingBottom: 4 },
  likesLine:    { fontSize: 13, fontWeight: "700", color: "#262626", paddingHorizontal: 12, marginBottom: 4 },
  captionBlock: { paddingHorizontal: 12 },
  captionText:  { fontSize: 14, color: "#262626", lineHeight: 20 },
  captionAuthor:{ fontWeight: "700" },
  moreBtn:      { fontSize: 14, color: "#8E8E8E", marginTop: 2 },

  // FAB
  fab:          { position: "absolute", bottom: 28, right: 20, shadowColor: THEME.primary + "60", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 1, shadowRadius: 14, elevation: 10 },
  fabGrad:      { width: 56, height: 56, borderRadius: 28, justifyContent: "center", alignItems: "center" },
});
