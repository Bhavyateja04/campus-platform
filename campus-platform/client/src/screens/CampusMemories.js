import React, { useRef, useEffect, useState, useCallback } from "react";
import { memoriesApi, getUser, moderationApi } from "../services/api";

function backendMemoryToUi(m) {
  if (!m || !m._id) return null;
  const author =
    m.authorId && typeof m.authorId === "object"
      ? m.authorId.name || "Anonymous"
      : "Anonymous";
  const roll =
    m.authorId && typeof m.authorId === "object"
      ? m.authorId.rollNumber || ""
      : "";
  return {
    id: String(m._id),
    author,
    authorRoll: roll,
    avatar: (author[0] || "A").toUpperCase(),
    imageUri: m.imageUrl || null,
    gradIdx: m.imageUrl ? null : 0,
    description: [m.title, m.description].filter(Boolean).join("\n\n"),
    likes: 0,
    liked: false,
    timeAgo: m.createdAt
      ? new Date(m.createdAt).toLocaleDateString()
      : "Recently",
    tag: "Campus",
    isOwn: false,
    _backend: true,
  };
}
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

const { width, height } = Dimensions.get("window");

// ─── THEME ────────────────────────────────────────────────────────────────────
const C = {
  primary: "#E8445A",
  primaryDark: "#C22040",
  primaryLight: "#F28096",
  primaryPale: "#FFF0F3",
  secondary: "#FF7043",
  bg: "#FAFAFA",
  surface: "#FFFFFF",
  surfaceAlt: "#FFF0F3",
  textDark: "#262626",
  textMid: "#8E8E8E",
  textLight: "#C7C7C7",
  border: "#DBDBDB",
  liked: "#E8445A",
};

const EASE = Easing.bezier(0.22, 1, 0.36, 1);
const ME = { name: "Varshitha", rollNo: "22BCE7890", avatar: "V" };

const GRAD_PALETTES = [
  { colors: ["#1a1a2e", "#16213e"], label: "Midnight" },
  { colors: ["#0f3460", "#533483"], label: "Ocean" },
  { colors: ["#2d6a4f", "#1b4332"], label: "Forest" },
  { colors: ["#6d2b8e", "#3d1054"], label: "Royal" },
  { colors: ["#c77dff", "#7b2ff7"], label: "Violet" },
  { colors: ["#f72585", "#7209b7"], label: "Neon" },
  { colors: ["#e76f51", "#f4a261"], label: "Ember" },
  { colors: ["#023e8a", "#0077b6"], label: "Navy" },
  { colors: ["#2b2d42", "#8d99ae"], label: "Slate" },
  { colors: ["#1d3557", "#457b9d"], label: "Steel" },
];

const CAMPUS_IMGS = [
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

const AVATARS = {
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

const DEFAULT_POSTS = [
  {
    id: "d1",
    author: "Arjun Mehta",
    authorRoll: "21CSE4501",
    avatar: "A",
    imageUri: CAMPUS_IMGS[0],
    gradIdx: null,
    description:
      "Graduation day — the moment we've all been waiting for! 🎓 Four years of hard work, late nights, and unforgettable memories. So proud of our batch! #AdityaUniversity #Class2025",
    likes: 142,
    liked: false,
    timeAgo: "2h ago",
    tag: "Graduation",
    isOwn: false,
  },
  {
    id: "d2",
    author: "Sneha Reddy",
    authorRoll: "22ECE3302",
    avatar: "S",
    imageUri: CAMPUS_IMGS[1],
    gradIdx: null,
    description:
      "Squad goals 🔥 College would be nothing without these people. Every laugh, every chai break — all with my favourites! ❤️ #SquadForLife #CollegeDays",
    likes: 89,
    liked: false,
    timeAgo: "5h ago",
    tag: "Friends",
    isOwn: false,
  },
  {
    id: "d3",
    author: ME.name,
    authorRoll: ME.rollNo,
    avatar: ME.avatar,
    imageUri: null,
    gradIdx: 0,
    description:
      "First day at Aditya University ✨ Walking into campus with butterflies but leaving with a family. This place changed me forever. 🏫💙 #NewBeginnings #AdityaVibes",
    likes: 54,
    liked: true,
    timeAgo: "1d ago",
    tag: "Personal",
    isOwn: true,
  },
  {
    id: "d4",
    author: "Kiran Babu",
    authorRoll: "21CSE7701",
    avatar: "K",
    imageUri: CAMPUS_IMGS[2],
    gradIdx: null,
    description:
      "Inter-college cricket tournament 🏏 We brought the trophy home!! CHAMPIONS! 🏆 #Cricket #AdityaSports #Champions",
    likes: 203,
    liked: false,
    timeAgo: "2d ago",
    tag: "Sports",
    isOwn: false,
  },
  {
    id: "d5",
    author: "Priya Sharma",
    authorRoll: "22EEE5540",
    avatar: "P",
    imageUri: CAMPUS_IMGS[3],
    gradIdx: null,
    description:
      "Late night in the library before finals 📚 The silence, the coffee cups — somehow this became home for a whole semester. 🥺 #StudyLife #LibraryNights",
    likes: 67,
    liked: false,
    timeAgo: "3d ago",
    tag: "Study Life",
    isOwn: false,
  },
  {
    id: "d6",
    author: "Rohit Kumar",
    authorRoll: "21ME2210",
    avatar: "R",
    imageUri: CAMPUS_IMGS[4],
    gradIdx: null,
    description:
      "Sunset from the rooftop of Block C 🌅 After a long day of labs and assignments, this view makes everything worth it. #Sunset #GoldenHour #CampusLife",
    likes: 178,
    liked: false,
    timeAgo: "4d ago",
    tag: "Campus",
    isOwn: false,
  },
  {
    id: "d7",
    author: "Meera Nair",
    authorRoll: "22ME1004",
    avatar: "M",
    imageUri: CAMPUS_IMGS[5],
    gradIdx: null,
    description:
      "Hackathon 2025 — 24 hours of pure madness 💻🔥 Sleep-deprived but absolutely worth it! #Hackathon2025 #TechLife #BuildFast",
    likes: 95,
    liked: false,
    timeAgo: "5d ago",
    tag: "Tech",
    isOwn: false,
  },
  {
    id: "d8",
    author: "Divya Rao",
    authorRoll: "22CSE1104",
    avatar: "D",
    imageUri: CAMPUS_IMGS[6],
    gradIdx: null,
    description:
      "Cultural fest day 🎭🎶 The performances were absolutely mind-blowing! Our college really knows how to celebrate! #CulturalFest #Aditya2025",
    likes: 134,
    liked: false,
    timeAgo: "6d ago",
    tag: "Events",
    isOwn: false,
  },
  {
    id: "d9",
    author: "Naveen Raj",
    authorRoll: "21ECE3301",
    avatar: "N",
    imageUri: CAMPUS_IMGS[7],
    gradIdx: null,
    description:
      "First lecture of the semester with the best professor we've ever had 🙌 This is going to be an amazing year! #ClassroomVibes #Learning",
    likes: 45,
    liked: false,
    timeAgo: "1w ago",
    tag: "Study Life",
    isOwn: false,
  },
  {
    id: "d10",
    author: "Teja Varma",
    authorRoll: "21ME0042",
    avatar: "T",
    imageUri: null,
    gradIdx: 7,
    description:
      "Three years into engineering and I've finally found what I love ❤️ The late nights, the deadlines, the frustration — it all leads to growth. 💪 #EngineeringLife",
    likes: 72,
    liked: false,
    timeAgo: "1w ago",
    tag: "Personal",
    isOwn: false,
  },
  {
    id: "d11",
    author: "Sneha Reddy",
    authorRoll: "22ECE3302",
    avatar: "S",
    imageUri: CAMPUS_IMGS[8],
    gradIdx: null,
    description:
      "College convocation rehearsal 🎓 We've been waiting for this day for so long! Next week, we officially become alumni ✨ #Convocation #Graduation",
    likes: 118,
    liked: false,
    timeAgo: "1w ago",
    tag: "Graduation",
    isOwn: false,
  },
  {
    id: "d12",
    author: "Arjun Mehta",
    authorRoll: "21CSE4501",
    avatar: "A",
    imageUri: CAMPUS_IMGS[9],
    gradIdx: null,
    description:
      "Group study session turned into the best evening ever 😂📚 These people make even revision fun! #StudyGroup #CollegeLife #Friends",
    likes: 93,
    liked: false,
    timeAgo: "2w ago",
    tag: "Friends",
    isOwn: false,
  },
  {
    id: "d13",
    author: "Kiran Babu",
    authorRoll: "21CSE7701",
    avatar: "K",
    imageUri: CAMPUS_IMGS[10],
    gradIdx: null,
    description:
      "Morning fog on campus is unreal sometimes 🌫️ Woke up early for a 7AM lab and caught this view. Worth every lost minute of sleep 😍 #CampusBeauty",
    likes: 156,
    liked: false,
    timeAgo: "2w ago",
    tag: "Campus",
    isOwn: false,
  },
  {
    id: "d14",
    author: ME.name,
    authorRoll: ME.rollNo,
    avatar: ME.avatar,
    imageUri: CAMPUS_IMGS[11],
    gradIdx: null,
    description:
      "Tech symposium 2025! 🖥️✨ Our project got selected for the top 5 presentations. The hard work finally paid off! So grateful for my amazing team 🤝 #TechSymposium",
    likes: 211,
    liked: false,
    timeAgo: "3w ago",
    tag: "Tech",
    isOwn: true,
  },
  {
    id: "d15",
    author: "Priya Sharma",
    authorRoll: "22EEE5540",
    avatar: "P",
    imageUri: null,
    gradIdx: 4,
    description:
      "Four years of memories, friendships, failures, victories, and growth. College has shaped me into who I am today. Forever grateful for every moment at Aditya ❤️ #ForeverAdityaian",
    likes: 389,
    liked: false,
    timeAgo: "3w ago",
    tag: "Personal",
    isOwn: false,
  },
];

// ─── CONTENT MODERATION ──────────────────────────────────────────────────────
// Campus Memories always uses the backend memory moderation route.
const moderateContent = async ({ description, imageUri }) => {
  const text = (description || "").trim();
  if (!text && !imageUri)
    return { safe: true, reason: "", category: "approved" };

  const result = await moderationApi.memory({ description: text, imageUri });
  return {
    safe: result.safe !== false,
    reason: result.reason || "",
    category: result.safe === false ? "offensive_language" : "approved",
  };
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const useEntrance = (delay = 0, dy = 18) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(dy)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 460,
        delay,
        easing: EASE,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 460,
        delay,
        easing: EASE,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  return { opacity, transform: [{ translateY }] };
};

const Avatar = ({ letter, size = 36 }) => {
  const grad = AVATARS[letter] || ["#667EEA", "#764BA2"];
  return (
    <LinearGradient
      colors={grad}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ color: "#fff", fontWeight: "800", fontSize: size * 0.38 }}>
        {letter}
      </Text>
    </LinearGradient>
  );
};

// ─── MODERATION ERROR MODAL ───────────────────────────────────────────────────
const ModerationModal = ({ visible, reason, onClose }) => (
  <Modal
    transparent
    visible={visible}
    animationType="fade"
    onRequestClose={onClose}
  >
    <View style={mm.overlay}>
      <View style={mm.card}>
        <LinearGradient colors={["#FF4444", "#CC2222"]} style={mm.iconCircle}>
          <Ionicons name="shield-checkmark" size={32} color="#fff" />
        </LinearGradient>
        <Text style={mm.title}>Post Rejected</Text>
        <Text style={mm.reason}>{reason}</Text>
        <Text style={mm.hint}>
          Only positive, respectful campus content is allowed. This includes
          friends, events, academics, sports, and celebrations.
        </Text>
        <TouchableOpacity
          onPress={onClose}
          style={mm.btnWrap}
          activeOpacity={0.85}
        >
          <LinearGradient colors={["#FF4444", "#CC2222"]} style={mm.btn}>
            <Text style={mm.btnTxt}>Got it</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);
const mm = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    width: "100%",
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: "#262626",
    marginBottom: 10,
    textAlign: "center",
  },
  reason: {
    fontSize: 14,
    color: "#CC2222",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 10,
    lineHeight: 21,
  },
  hint: {
    fontSize: 12,
    color: "#8E8E8E",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 22,
  },
  btnWrap: { width: "100%", borderRadius: 12, overflow: "hidden" },
  btn: { paddingVertical: 14, alignItems: "center" },
  btnTxt: { color: "#fff", fontWeight: "800", fontSize: 15 },
});

// ─── POST OPTIONS SHEET — Share removed ──────────────────────────────────────
const PostOptionsSheet = ({ visible, isOwn, onClose, onDelete, onEdit }) => {
  const slideY = useRef(new Animated.Value(300)).current;
  useEffect(() => {
    if (visible)
      Animated.spring(slideY, {
        toValue: 0,
        speed: 20,
        bounciness: 4,
        useNativeDriver: true,
      }).start();
    else
      Animated.timing(slideY, {
        toValue: 300,
        duration: 220,
        easing: EASE,
        useNativeDriver: true,
      }).start();
  }, [visible]);

  if (!visible) return null;
  return (
    <Modal transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={po.overlay} />
      </TouchableWithoutFeedback>
      <Animated.View
        style={[po.sheet, { transform: [{ translateY: slideY }] }]}
      >
        <View style={po.handle} />

        {isOwn ? (
          <>
            <TouchableOpacity style={po.row} onPress={onEdit}>
              <Ionicons name="create-outline" size={22} color="#262626" />
              <Text style={po.rowTxt}>Edit Caption</Text>
            </TouchableOpacity>
            <View style={po.sep} />
            <TouchableOpacity style={po.row} onPress={onDelete}>
              <Ionicons name="trash-outline" size={22} color="#FF3040" />
              <Text style={[po.rowTxt, { color: "#FF3040" }]}>Delete Post</Text>
            </TouchableOpacity>
            <View style={po.sep} />
          </>
        ) : (
          <>
            <TouchableOpacity style={po.row} onPress={onClose}>
              <Ionicons name="flag-outline" size={22} color="#FF3040" />
              <Text style={[po.rowTxt, { color: "#FF3040" }]}>Report Post</Text>
            </TouchableOpacity>
            <View style={po.sep} />
          </>
        )}

        {/* Save — kept */}
        <TouchableOpacity style={po.row} onPress={onClose}>
          <Ionicons name="bookmark-outline" size={22} color="#262626" />
          <Text style={po.rowTxt}>Save Post</Text>
        </TouchableOpacity>
        <View style={po.sep} />

        {/* ── Share row REMOVED ── */}

        <View style={[po.sep, { marginBottom: 8 }]} />
        <TouchableOpacity
          style={[po.row, { justifyContent: "center" }]}
          onPress={onClose}
        >
          <Text style={[po.rowTxt, { color: "#8E8E8E" }]}>Cancel</Text>
        </TouchableOpacity>
        <View style={{ height: 16 }} />
      </Animated.View>
    </Modal>
  );
};
const po = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#DBDBDB",
    alignSelf: "center",
    marginBottom: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
  },
  rowTxt: { fontSize: 15, color: "#262626", fontWeight: "500" },
  sep: { height: 1, backgroundColor: "#F0F0F0" },
});

// ─── EDIT CAPTION MODAL ───────────────────────────────────────────────────────
const EditModal = ({ visible, currentDesc, onClose, onSave }) => {
  const [text, setText] = useState(currentDesc);
  useEffect(() => {
    if (visible) setText(currentDesc);
  }, [visible, currentDesc]);
  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={em.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ width: "100%" }}
        >
          <View style={em.card}>
            <View style={em.headerRow}>
              <TouchableOpacity onPress={onClose}>
                <Text style={em.cancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={em.title}>Edit Caption</Text>
              <TouchableOpacity
                onPress={() => {
                  onSave(text);
                  onClose();
                }}
              >
                <Text style={em.done}>Done</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={em.input}
              value={text}
              onChangeText={setText}
              multiline
              autoFocus
              maxLength={500}
              placeholderTextColor="#C7C7C7"
            />
            <Text style={em.count}>{text.length}/500</Text>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};
const em = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  card: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 260,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cancel: { fontSize: 15, color: "#8E8E8E" },
  title: { fontSize: 15, fontWeight: "700", color: "#262626" },
  done: { fontSize: 15, fontWeight: "700", color: C.primary },
  input: {
    fontSize: 14,
    color: "#262626",
    lineHeight: 22,
    minHeight: 120,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#DBDBDB",
    borderRadius: 12,
    padding: 12,
  },
  count: { fontSize: 11, color: "#8E8E8E", textAlign: "right", marginTop: 6 },
});

// ─── NEW POST MODAL ───────────────────────────────────────────────────────────
const NewPostModal = ({ visible, onClose, onPost }) => {
  const slideY = useRef(new Animated.Value(height)).current;
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState(null);
  const [gradIdx, setGradIdx] = useState(0);
  const [tag, setTag] = useState("Campus");
  const [posting, setPosting] = useState(false);
  const [modChecking, setModChecking] = useState(false);
  const [modError, setModError] = useState(null);
  const TAGS = [
    "Campus",
    "Friends",
    "Sports",
    "Study Life",
    "Events",
    "Tech",
    "Personal",
    "Food",
  ];

  useEffect(() => {
    if (visible) {
      setDesc("");
      setImage(null);
      setGradIdx(0);
      setTag("Campus");
      setPosting(false);
      setModChecking(false);
      setModError(null);
      Animated.spring(slideY, {
        toValue: 0,
        speed: 16,
        bounciness: 3,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideY, {
        toValue: height,
        duration: 260,
        easing: EASE,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      aspect: [1, 1],
      base64: true,
    });
    if (res.canceled) return;
    const a = res.assets[0];
    setImage({
      uri: a.uri,
      base64: a.base64,
      mediaType: a.mimeType || "image/jpeg",
    });
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
      aspect: [1, 1],
      base64: true,
    });
    if (res.canceled) return;
    const a = res.assets[0];
    setImage({
      uri: a.uri,
      base64: a.base64,
      mediaType: a.mimeType || "image/jpeg",
    });
  };

  const handlePost = async () => {
    if (!desc.trim() && !image) return;
    setModChecking(true);
    const mod = await moderateContent({
      imageUri: image?.uri,
      description: desc,
    });
    setModChecking(false);
    if (!mod.safe) {
      setModError(
        mod.reason || "This content violates our community guidelines.",
      );
      return;
    }
    setPosting(true);
    setTimeout(() => {
      onPost({
        id: `p_${Date.now()}`,
        author: ME.name,
        authorRoll: ME.rollNo,
        avatar: ME.avatar,
        imageUri: image?.uri ?? null,
        gradIdx: image ? null : gradIdx,
        description: desc.trim(),
        likes: 0,
        liked: false,
        timeAgo: "Just now",
        tag,
        isOwn: true,
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
              <View style={np.overlay} />
            </TouchableWithoutFeedback>
            <Animated.View
              style={[np.sheet, { transform: [{ translateY: slideY }] }]}
            >
              <View style={np.sheetHead}>
                <View style={np.handle} />
                <View style={np.titleRow}>
                  <TouchableOpacity onPress={onClose} style={np.closeBtn}>
                    <Ionicons name="close" size={22} color="#262626" />
                  </TouchableOpacity>
                  <Text style={np.title}>New Post</Text>
                  <TouchableOpacity
                    onPress={handlePost}
                    disabled={(!desc.trim() && !image) || busy}
                    style={[
                      np.shareBtn,
                      ((!desc.trim() && !image) || busy) && { opacity: 0.45 },
                    ]}
                  >
                    {posting || modChecking ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={np.shareBtnTxt}>Share</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
              >
                <ScrollView
                  style={np.scroll}
                  contentContainerStyle={{ paddingBottom: 36 }}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  <View style={np.authorRow}>
                    <Avatar letter={ME.avatar} size={42} />
                    <View>
                      <Text style={np.authorName}>{ME.name}</Text>
                      <Text style={np.authorRoll}>{ME.rollNo}</Text>
                    </View>
                  </View>

                  <TextInput
                    style={np.captionInput}
                    placeholder="Write a caption..."
                    placeholderTextColor="#C7C7C7"
                    value={desc}
                    onChangeText={setDesc}
                    multiline
                    maxLength={500}
                  />
                  <Text style={np.charCount}>{desc.length}/500</Text>

                  {image ? (
                    <View style={np.imgWrap}>
                      <Image
                        source={{ uri: image.uri }}
                        style={np.imgPreview}
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        style={np.imgRemove}
                        onPress={() => setImage(null)}
                      >
                        <View style={np.imgRemoveCircle}>
                          <Ionicons name="close" size={16} color="#fff" />
                        </View>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={np.gradSection}>
                      <Text style={np.sectionLabel}>BACKGROUND COLOR</Text>
                      <LinearGradient
                        colors={GRAD_PALETTES[gradIdx].colors}
                        style={np.gradPreview}
                      >
                        <Text style={np.gradPreviewLabel}>
                          {GRAD_PALETTES[gradIdx].label}
                        </Text>
                      </LinearGradient>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={np.swatchRow}
                      >
                        {GRAD_PALETTES.map((g, i) => (
                          <TouchableOpacity
                            key={i}
                            onPress={() => setGradIdx(i)}
                            style={np.swatchWrap}
                          >
                            <LinearGradient
                              colors={g.colors}
                              style={[np.swatch, gradIdx === i && np.swatchOn]}
                            />
                            {gradIdx === i && (
                              <View style={np.swatchCheck}>
                                <Ionicons
                                  name="checkmark"
                                  size={12}
                                  color="#fff"
                                />
                              </View>
                            )}
                            <Text style={np.swatchLabel}>{g.label}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}

                  <View style={np.photoBtnRow}>
                    <TouchableOpacity
                      style={np.photoBtn}
                      onPress={pickImage}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="images-outline"
                        size={18}
                        color="#262626"
                      />
                      <Text style={np.photoBtnTxt}>Gallery</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={np.photoBtn}
                      onPress={takePhoto}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="camera-outline"
                        size={18}
                        color="#262626"
                      />
                      <Text style={np.photoBtnTxt}>Camera</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={np.sectionLabel}>TAG</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
                  >
                    {TAGS.map((t) => (
                      <TouchableOpacity
                        key={t}
                        style={[np.tagChip, tag === t && np.tagChipOn]}
                        onPress={() => setTag(t)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[np.tagChipTxt, tag === t && np.tagChipTxtOn]}
                        >
                          {t}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {modChecking && (
                    <View style={np.checkRow}>
                      <ActivityIndicator size="small" color={C.primary} />
                      <Text style={np.checkTxt}>
                        AI is reviewing your content...
                      </Text>
                    </View>
                  )}

                  <View style={np.aiNote}>
                    <Ionicons
                      name="sparkles-outline"
                      size={13}
                      color="#8E8E8E"
                    />
                    <Text style={np.aiNoteTxt}>
                      Content is reviewed by AI before posting
                    </Text>
                  </View>
                </ScrollView>
              </KeyboardAvoidingView>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <ModerationModal
        visible={!!modError}
        reason={modError || ""}
        onClose={() => setModError(null)}
      />
    </>
  );
};

const np = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.94,
  },
  sheetHead: {
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#DBDBDB",
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#DBDBDB",
    alignSelf: "center",
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  closeBtn: { width: 36, height: 36, justifyContent: "center" },
  title: { fontSize: 16, fontWeight: "700", color: "#262626" },
  shareBtn: {
    backgroundColor: C.primary,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  shareBtnTxt: { color: "#fff", fontWeight: "700", fontSize: 14 },
  scroll: { paddingHorizontal: 16, paddingTop: 16 },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  authorName: { fontSize: 14, fontWeight: "700", color: "#262626" },
  authorRoll: { fontSize: 11, color: "#8E8E8E", marginTop: 1 },
  captionInput: {
    fontSize: 15,
    color: "#262626",
    lineHeight: 22,
    minHeight: 80,
    marginBottom: 4,
  },
  charCount: {
    fontSize: 11,
    color: "#C7C7C7",
    textAlign: "right",
    marginBottom: 14,
  },
  imgWrap: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 14,
    position: "relative",
  },
  imgPreview: { width: "100%", height: width - 32, borderRadius: 14 },
  imgRemove: { position: "absolute", top: 10, right: 10 },
  imgRemoveCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
  },
  gradSection: { marginBottom: 14 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#8E8E8E",
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 4,
  },
  gradPreview: {
    height: 140,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  gradPreviewLabel: {
    color: "rgba(255,255,255,0.85)",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 1,
  },
  swatchRow: { gap: 10, paddingBottom: 4 },
  swatchWrap: { alignItems: "center", gap: 4 },
  swatch: { width: 40, height: 40, borderRadius: 20 },
  swatchOn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: C.primary,
  },
  swatchCheck: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: C.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  swatchLabel: { fontSize: 9, color: "#8E8E8E", fontWeight: "600" },
  photoBtnRow: { flexDirection: "row", gap: 10, marginBottom: 18 },
  photoBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  photoBtnTxt: { fontSize: 13, fontWeight: "600", color: "#262626" },
  tagChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  tagChipOn: { backgroundColor: C.primary, borderColor: C.primary },
  tagChipTxt: { fontSize: 12, fontWeight: "600", color: "#8E8E8E" },
  tagChipTxtOn: { color: "#fff" },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFF0F3",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 12,
  },
  checkTxt: { fontSize: 13, color: C.primary, fontWeight: "600" },
  aiNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    justifyContent: "center",
    marginTop: 14,
  },
  aiNoteTxt: { fontSize: 11, color: "#C7C7C7" },
});

// ─── POST CARD — Share icon removed from action bar ───────────────────────────
const PostCard = React.memo(({ post, onLike, onOptions, index }) => {
  const anim = useEntrance(Math.min(index, 4) * 60, 16);
  const heartScale = useRef(new Animated.Value(1)).current;
  const [showFull, setShowFull] = useState(false);
  const isLong = post.description.length > 130;

  const handleLike = () => {
    Animated.sequence([
      Animated.spring(heartScale, {
        toValue: 1.6,
        speed: 26,
        bounciness: 16,
        useNativeDriver: true,
      }),
      Animated.spring(heartScale, {
        toValue: 1,
        speed: 18,
        bounciness: 6,
        useNativeDriver: true,
      }),
    ]).start();
    onLike(post.id);
  };

  return (
    <Animated.View style={[anim, S.card]}>
      {/* Header */}
      <View style={S.cardHeader}>
        <Avatar letter={post.avatar} size={34} />
        <View style={{ flex: 1 }}>
          <Text style={S.authorName}>{post.author}</Text>
          <Text style={S.authorSub}>
            {post.authorRoll} · {post.timeAgo}
          </Text>
        </View>
        <View style={S.tagPill}>
          <Text style={S.tagTxt}>#{post.tag}</Text>
        </View>
        <TouchableOpacity
          onPress={() => onOptions(post)}
          style={S.dotsBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="ellipsis-horizontal" size={20} color="#262626" />
        </TouchableOpacity>
      </View>

      {/* Image or gradient */}
      {post.imageUri ? (
        <Image
          source={{ uri: post.imageUri }}
          style={S.postImg}
          resizeMode="cover"
        />
      ) : (
        <LinearGradient
          colors={GRAD_PALETTES[post.gradIdx ?? 0].colors}
          style={S.postGrad}
        >
          <Ionicons
            name="images-outline"
            size={32}
            color="rgba(255,255,255,0.3)"
          />
        </LinearGradient>
      )}

      {/* ── ACTION BAR — paper-plane (share) icon REMOVED ── */}
      <View style={S.actionBar}>
        {/* Like */}
        <TouchableOpacity
          onPress={handleLike}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.8}
        >
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <Ionicons
              name={post.liked ? "heart" : "heart-outline"}
              size={28}
              color={post.liked ? C.liked : "#262626"}
            />
          </Animated.View>
        </TouchableOpacity>

        {/* ── paper-plane-outline (Share) button REMOVED ── */}

        <View style={{ flex: 1 }} />

        {/* Bookmark — kept */}
        <TouchableOpacity
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          <Ionicons name="bookmark-outline" size={25} color="#262626" />
        </TouchableOpacity>
      </View>

      {/* Likes count */}
      {post.likes > 0 && (
        <Text style={S.likesLine}>
          {post.likes.toLocaleString()} {post.likes === 1 ? "like" : "likes"}
        </Text>
      )}

      {/* Caption */}
      <View style={S.captionBlock}>
        <Text style={S.captionText} numberOfLines={showFull ? undefined : 3}>
          <Text style={S.captionAuthor}>{post.author.split(" ")[0]} </Text>
          {post.description}
        </Text>
        {isLong && !showFull && (
          <TouchableOpacity onPress={() => setShowFull(true)}>
            <Text style={S.moreBtn}>more</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={{ height: 14 }} />
    </Animated.View>
  );
});

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
export default function CampusMemoriesScreen({ navigation }) {
  const [posts, setPosts] = useState(DEFAULT_POSTS);
  const [showForm, setShowForm] = useState(false);
  const [optionPost, setOptionPost] = useState(null);
  const [editPost, setEditPost] = useState(null);
  const SB_H = Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 24;
  const hAnim = useEntrance(0, -8);

  const handleLike = useCallback((id) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              liked: !p.liked,
              likes: p.liked ? p.likes - 1 : p.likes + 1,
            }
          : p,
      ),
    );
  }, []);

  const handleNewPost = useCallback(async (post) => {
    setPosts((prev) => [post, ...prev]);

    try {
      const result = await memoriesApi.create({
        title: post.tag || "Memory",
        description: post.description || "",
        imageUrl: post.imageUri || undefined,
      });
      const created = backendMemoryToUi(result?.memory);
      if (created) {
        setPosts((prev) => prev.map((p) => (p.id === post.id ? created : p)));
      }
    } catch (err) {
      console.warn("[Memories] backend create failed:", err?.message || err);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await memoriesApi.list();
        if (cancelled) return;
        const ui = (Array.isArray(list) ? list : [])
          .map(backendMemoryToUi)
          .filter(Boolean);
        if (ui.length)
          setPosts((prev) => [...ui, ...prev.filter((p) => !p._backend)]);
      } catch (err) {
        console.warn(
          "[Memories] backend fetch failed (using seed data):",
          err?.message || err,
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDelete = useCallback(() => {
    if (!optionPost) return;
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const id = optionPost.id;
          const isBackend = !!optionPost._backend;
          setPosts((prev) => prev.filter((p) => p.id !== id));
          setOptionPost(null);
          if (isBackend) {
            try {
              await memoriesApi.remove(id);
            } catch (err) {
              console.warn(
                "[Memories] backend delete failed:",
                err?.message || err,
              );
            }
          }
        },
      },
    ]);
  }, [optionPost]);

  const handleEditSave = useCallback(
    async (newDesc) => {
      if (!editPost) return;
      const id = editPost.id;
      const isBackend = !!editPost._backend;
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, description: newDesc } : p)),
      );
      setEditPost(null);
      if (isBackend) {
        try {
          await memoriesApi.update(id, { description: newDesc });
        } catch (err) {
          console.warn(
            "[Memories] backend update failed:",
            err?.message || err,
          );
        }
      }
    },
    [editPost],
  );

  return (
    <View style={S.root}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={C.surface}
        translucent={false}
      />

      <Animated.View style={[hAnim, S.header, { paddingTop: SB_H + 2 }]}>
        <TouchableOpacity style={S.hBtn} onPress={() => navigation?.goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color="#262626" />
        </TouchableOpacity>
        <View style={S.headerCenter}>
          <LinearGradient
            colors={[C.primary, C.secondary]}
            style={S.headerLogo}
          >
            <Ionicons name="camera" size={15} color="#fff" />
          </LinearGradient>
          <Text style={S.headerTitle}>Campus Memories</Text>
        </View>
        <View style={{ width: 36 }} />
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {posts.map((post, i) => (
          <PostCard
            key={post.id}
            post={post}
            index={i}
            onLike={handleLike}
            onOptions={setOptionPost}
          />
        ))}
      </ScrollView>

      <TouchableOpacity
        style={S.fab}
        onPress={() => setShowForm(true)}
        activeOpacity={0.88}
      >
        <LinearGradient colors={[C.primary, C.primaryDark]} style={S.fabGrad}>
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      <NewPostModal
        visible={showForm}
        onClose={() => setShowForm(false)}
        onPost={handleNewPost}
      />

      <PostOptionsSheet
        visible={!!optionPost}
        isOwn={optionPost?.isOwn ?? false}
        onClose={() => setOptionPost(null)}
        onDelete={handleDelete}
        onEdit={() => {
          setEditPost(optionPost);
          setOptionPost(null);
        }}
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

// ─── STYLES ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingBottom: 10,
    backgroundColor: C.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: "#DBDBDB",
  },
  hBtn: { width: 36, height: 36, justifyContent: "center" },
  headerCenter: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerLogo: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#262626",
    letterSpacing: 0.1,
  },

  card: { backgroundColor: C.surface, marginBottom: 8 },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  authorName: { fontSize: 13, fontWeight: "700", color: "#262626" },
  authorSub: { fontSize: 11, color: "#8E8E8E", marginTop: 1 },
  tagPill: {
    backgroundColor: "#FFF0F3",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "#F5D0DA",
    marginRight: 4,
  },
  tagTxt: { fontSize: 10, fontWeight: "700", color: C.primary },
  dotsBtn: { padding: 4 },

  postImg: { width, height: width },
  postGrad: {
    width,
    height: width * 0.75,
    justifyContent: "center",
    alignItems: "center",
  },

  // Action bar — only heart + bookmark, no share
  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 4,
  },

  likesLine: {
    fontSize: 13,
    fontWeight: "700",
    color: "#262626",
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  captionBlock: { paddingHorizontal: 12 },
  captionText: { fontSize: 14, color: "#262626", lineHeight: 20 },
  captionAuthor: { fontWeight: "700" },
  moreBtn: { fontSize: 14, color: "#8E8E8E", marginTop: 2 },

  fab: {
    position: "absolute",
    bottom: 28,
    right: 20,
    shadowColor: C.primary + "60",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 14,
    elevation: 10,
  },
  fabGrad: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
});
