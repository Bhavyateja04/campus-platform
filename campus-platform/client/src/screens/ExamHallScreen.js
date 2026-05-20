// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   Pressable,
//   StyleSheet,
//   Image,
//   ScrollView,
//   Alert,
//   TouchableOpacity,
// } from "react-native";
// import axios from "axios";
// import { API_BASE_URL } from "../config";
// import { useNavigation } from "@react-navigation/native";
// import { AllPlaces } from "../data/places";
// import { LinearGradient } from "expo-linear-gradient";
// import { Ionicons } from "@expo/vector-icons";

// const THEME = {
//   primary: "#6B46C1",
//   primaryDark: "#4A2FA0",
//   background: "#F6F7FB",
//   surface: "#FFFFFF",
//   muted: "#667085",
//   danger: "#DC2626",
// };

// export default function ExamHallScreen({ navigation }) {
//   const [rollNo, setRollNo] = useState("");
//   const [buildingInput, setBuildingInput] = useState("");
//   const [students, setStudents] = useState([]);
//   const [selectedBuilding, setSelectedBuilding] = useState(null);
//   const [notFound, setNotFound] = useState(false);

//   // Example UI state for locator card
//   const [examDate, setExamDate] = useState("24 May 2025");
//   const [examName, setExamName] = useState("Data Structures & Algorithms");

//   const handleBuildingChange = (text) => {
//     setBuildingInput(text);
//     setRollNo("");
//   };

//   const handleClear = () => {
//     setRollNo("");
//     setBuildingInput("");
//     setStudents([]);
//     setSelectedBuilding(null);
//     setNotFound(false);
//   };

//   const handleSearch = async () => {
//     try {
//       if (!rollNo && !buildingInput) {
//         Alert.alert("Enter Roll OR Building");
//         return;
//       }

//       const response = await axios.get(`${API_BASE_URL}/exam-search`, {
//         params: { rollNo, buildingName: buildingInput },
//       });

//       const data = response.data || [];
//       setStudents(data);

//       if (data.length === 0) {
//         setNotFound(true);
//         setSelectedBuilding(null);
//       } else {
//         setNotFound(false);
//         const buildingName = data[0].buildingName || "";
//         const building = AllPlaces.find((place) =>
//           place.name
//             .replace(/\s+/g, "")
//             .toLowerCase()
//             .includes(buildingName.replace(/\s+/g, "").toLowerCase()),
//         );
//         setSelectedBuilding(building || null);
//       }
//     } catch (err) {
//       console.warn(err);
//       Alert.alert("Error", "Server error");
//     }
//   };

//   return (
//     <ScrollView
//       style={styles.container}
//       contentContainerStyle={styles.contentContainer}
//     >
//       <View style={styles.contentWrapper}>
//         <View style={styles.headerRow}>
//           <View>
//             <Text style={styles.heading}>Exam Hall Locator</Text>
//             <Text style={styles.headingSub}>
//               Smart navigation to your exam hall
//             </Text>
//           </View>
//           <View style={styles.headerIconWrap}>
//             <LinearGradient
//               colors={[THEME.primaryDark, THEME.primary]}
//               style={styles.headerIcon}
//             >
//               <Ionicons name="school" size={28} color="#fff" />
//             </LinearGradient>
//           </View>
//         </View>

//         <LinearGradient
//           colors={["#FFFFFF", "#F6F4FF"]}
//           style={styles.locatorCardGradient}
//         >
//           <View style={styles.locatorCardInner}>
//             <View style={styles.searchMiniRow}>
//               <Ionicons name="search" size={18} color="#6B46C1" />
//               <Text style={styles.searchMiniText}>Find Your Exam Hall</Text>
//             </View>

//             <Text style={styles.cardSub}>
//               Enter your exam details to locate hall
//             </Text>

//             <View style={styles.rowFields}>
//               <View style={{ flex: 1, marginRight: 8 }}>
//                 <Text style={styles.fieldLabel}>Select Date</Text>
//                 <Pressable style={styles.fieldBox} onPress={() => {}}>
//                   <View style={{ flexDirection: "row", alignItems: "center" }}>
//                     <Ionicons
//                       name="calendar"
//                       size={16}
//                       color={THEME.primaryDark}
//                       style={{ marginRight: 8 }}
//                     />
//                     <Text style={styles.fieldText}>{examDate}</Text>
//                   </View>
//                 </Pressable>
//               </View>

//               <View style={{ flex: 1 }}>
//                 <Text style={styles.fieldLabel}>Select Exam</Text>
//                 <Pressable style={styles.fieldBox} onPress={() => {}}>
//                   <Text
//                     style={[styles.fieldText, { flex: 1 }]}
//                     numberOfLines={1}
//                   >
//                     {examName}
//                   </Text>
//                   <Ionicons
//                     name="chevron-down"
//                     size={16}
//                     color={THEME.muted}
//                     style={{ marginLeft: 8 }}
//                   />
//                 </Pressable>
//               </View>
//             </View>

//             <TouchableOpacity
//               style={styles.locateBtnGradient}
//               onPress={handleSearch}
//               activeOpacity={0.95}
//             >
//               <LinearGradient
//                 colors={[THEME.primaryDark, THEME.primary]}
//                 style={styles.locateInner}
//               >
//                 <Text style={styles.locateBtnText}>Locate My Hall</Text>
//                 <Ionicons
//                   name="navigate"
//                   size={18}
//                   color="#fff"
//                   style={{ marginLeft: 12 }}
//                 />
//               </LinearGradient>
//             </TouchableOpacity>
//           </View>
//         </LinearGradient>

//         <View style={styles.scheduleCard}>
//           <View
//             style={{
//               flexDirection: "row",
//               justifyContent: "space-between",
//               alignItems: "center",
//             }}
//           >
//             <View>
//               <Text style={styles.scheduleTitle}>Today's Schedule</Text>
//               <Text style={styles.scheduleSub}>2 Exams Today</Text>
//             </View>
//             <TouchableOpacity>
//               <Text style={styles.viewFull}>View Full Schedule</Text>
//             </TouchableOpacity>
//           </View>

//           <View style={{ marginTop: 12 }}>
//             <View style={styles.scheduleRow}>
//               <View style={[styles.timePill, { backgroundColor: "#E9E5FF" }]}>
//                 <Text style={styles.timeText}>09:00 AM</Text>
//               </View>
//               <View style={{ flex: 1 }}>
//                 <Text style={styles.examTitle}>
//                   Data Structures & Algorithms
//                 </Text>
//                 <Text style={styles.examCode}>CS-301</Text>
//               </View>
//             </View>

//             <View style={[styles.scheduleRow, { marginTop: 12 }]}>
//               <View style={[styles.timePill, { backgroundColor: "#FFF3E6" }]}>
//                 <Text style={styles.timeText}>02:00 PM</Text>
//               </View>
//               <View style={{ flex: 1 }}>
//                 <Text style={styles.examTitle}>
//                   Database Management Systems
//                 </Text>
//                 <Text style={styles.examCode}>CS-302</Text>
//               </View>
//             </View>
//           </View>
//         </View>

//         <View style={styles.tipsCard}>
//           <Text style={styles.tipsTitle}>Smart Tips</Text>
//           <View style={styles.tipRow}>
//             <Text style={styles.tipBullet}>✅</Text>
//             <View style={{ flex: 1 }}>
//               <Text style={styles.tipText}>Reach 20 min early</Text>
//               <Text style={styles.tipSub}>
//                 Avoid last-minute rush and be exam-ready!
//               </Text>
//             </View>
//           </View>
//         </View>

//         {selectedBuilding && (
//           <Pressable
//             style={styles.buildingCard}
//             onPress={() =>
//               navigation.navigate("CampusMap", {
//                 place: selectedBuilding,
//               })
//             }
//           >
//             <Image source={selectedBuilding.placeImage} style={styles.image} />
//             <View style={styles.buildingInfo}>
//               <Text style={styles.buildingName}>{selectedBuilding.name}</Text>
//               <Text style={styles.buildingSub}>
//                 {selectedBuilding.placeType || "Building"}
//               </Text>
//             </View>
//           </Pressable>
//         )}

//         {students.length > 0 && (
//           <View style={styles.resultsList}>
//             {students.map((s) => (
//               <View key={s._id || s.id || s.rollNo} style={styles.studentCard}>
//                 <View style={{ flex: 1 }}>
//                   <Text style={styles.studentName}>{s.name}</Text>
//                   <Text style={styles.studentMeta}>
//                     {s.buildingName} • Room {s.roomNo}
//                   </Text>
//                 </View>
//                 <View style={styles.rollBadge}>
//                   <Text style={styles.rollText}>{s.rollNo}</Text>
//                 </View>
//               </View>
//             ))}
//           </View>
//         )}

//         {notFound && (
//           <View style={styles.notFoundBox}>
//             <Text style={styles.notFoundText}>No Results Found</Text>
//             <Text style={styles.notFoundSub}>
//               Please check Roll Number or Building Name
//             </Text>
//           </View>
//         )}
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: THEME.background, padding: 16 },
//   headerRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 18,
//   },
//   heading: {
//     fontSize: 24,
//     fontWeight: "800",
//     color: THEME.primaryDark,
//     marginBottom: 4,
//   },
//   headingSub: { color: THEME.muted },
//   headerIconWrap: { marginLeft: 10 },
//   headerIcon: {
//     width: 56,
//     height: 56,
//     borderRadius: 14,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   contentContainer: { padding: 16, alignItems: "center" },
//   contentWrapper: { width: "100%", maxWidth: 720 },

//   locatorCardGradient: {
//     borderRadius: 16,
//     marginBottom: 16,
//     overflow: "hidden",
//     elevation: 4,
//   },
//   locatorCardInner: { padding: 18, backgroundColor: "transparent" },
//   searchMiniRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     padding: 12,
//     borderRadius: 12,
//     elevation: 2,
//     shadowColor: "#000",
//     shadowOpacity: 0.03,
//     shadowRadius: 8,
//     marginBottom: 10,
//     width: "100%",
//   },
//   searchMiniText: { marginLeft: 10, color: "#4C2889", fontWeight: "600" },
//   cardSub: { color: THEME.muted, marginTop: 6, marginBottom: 12 },
//   rowFields: { flexDirection: "row", marginTop: 8 },
//   fieldLabel: { fontSize: 12, color: THEME.muted, marginBottom: 6 },
//   fieldBox: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     padding: 12,
//     borderRadius: 10,
//     elevation: 1,
//     justifyContent: "space-between",
//   },
//   fieldText: { color: "#0F1724" },
//   locateBtnGradient: { marginTop: 16, borderRadius: 12, overflow: "hidden" },
//   locateInner: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 14,
//   },
//   locateBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },

//   scheduleCard: {
//     backgroundColor: THEME.surface,
//     borderRadius: 12,
//     padding: 14,
//     elevation: 2,
//     marginBottom: 16,
//   },
//   scheduleTitle: { fontWeight: "700", fontSize: 15, color: "#0F1724" },
//   scheduleSub: { color: THEME.muted, fontSize: 12, marginTop: 2 },
//   scheduleRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
//   timePill: {
//     width: 72,
//     height: 36,
//     borderRadius: 10,
//     alignItems: "center",
//     justifyContent: "center",
//     marginRight: 12,
//   },
//   timeText: { color: "#4C2889", fontWeight: "700" },
//   examTitle: { fontWeight: "600", color: "#0F1724" },
//   examCode: { color: THEME.muted, marginTop: 4 },
//   viewFull: { color: THEME.primary, fontWeight: "600" },

//   tipsCard: {
//     backgroundColor: "#F7FFFA",
//     borderRadius: 12,
//     padding: 14,
//     elevation: 2,
//     marginBottom: 30,
//   },
//   tipsTitle: { fontWeight: "800", marginBottom: 8 },
//   tipRow: { flexDirection: "row", alignItems: "flex-start" },
//   tipBullet: { marginRight: 10, fontSize: 18 },
//   tipText: { fontWeight: "700" },
//   tipSub: { color: THEME.muted, marginTop: 4 },

//   buildingCard: {
//     backgroundColor: THEME.surface,
//     borderRadius: 12,
//     overflow: "hidden",
//     marginBottom: 16,
//     elevation: 3,
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   image: { width: 120, height: 90 },
//   buildingInfo: { padding: 12, flex: 1 },
//   buildingName: { fontSize: 18, fontWeight: "800", color: THEME.primaryDark },
//   buildingSub: { color: THEME.muted, marginTop: 4 },

//   resultsList: { marginTop: 6 },
//   studentCard: {
//     backgroundColor: THEME.surface,
//     padding: 12,
//     borderRadius: 10,
//     marginBottom: 10,
//     flexDirection: "row",
//     alignItems: "center",
//     elevation: 2,
//   },
//   studentName: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
//   studentMeta: { color: THEME.muted, marginTop: 6 },
//   rollBadge: {
//     backgroundColor: "#F3F0FF",
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 8,
//   },
//   rollText: { color: THEME.primaryDark, fontWeight: "800" },

//   notFoundBox: {
//     marginTop: 20,
//     padding: 15,
//     backgroundColor: "#FFF4F6",
//     borderRadius: 12,
//     alignItems: "center",
//   },
//   notFoundText: { color: THEME.danger, fontWeight: "800", fontSize: 16 },
//   notFoundSub: { color: THEME.danger, fontSize: 13, marginTop: 5 },
// });
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native"
import SafeAreaView from "react-native-safe-area-view";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function ExamHallScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Exam Hall Locator</Text>
            <Text style={styles.subtitle}>
              Smart navigation to your exam hall
            </Text>
          </View>

          <View style={styles.iconBox}>
            <Ionicons name="school" size={30} color="#fff" />
          </View>
        </View>

        {/* SEARCH CARD */}
        <View style={styles.card}>
          <View style={styles.searchHeader}>
            <Ionicons name="search-outline" size={20} color="#5B4CF0" />
            <Text style={styles.searchTitle}>Find Your Exam Hall</Text>
          </View>

          <Text style={styles.searchSub}>
            Enter your exam details to locate hall
          </Text>

          {/* DATE */}
          <Text style={styles.label}>Select Date</Text>

          <TouchableOpacity style={styles.inputBox}>
            <Text style={styles.inputText}>24 May 2025</Text>

            <Ionicons
              name="calendar-outline"
              size={20}
              color="#666"
            />
          </TouchableOpacity>

          {/* EXAM */}
          <Text style={styles.label}>Select Exam</Text>

          <TouchableOpacity style={styles.inputBox}>
            <Text style={styles.inputText}>
              Data Structures & Algorithms
            </Text>

            <Ionicons
              name="chevron-down"
              size={20}
              color="#666"
            />
          </TouchableOpacity>

          {/* BUTTON */}
          <TouchableOpacity activeOpacity={0.8}>
            <LinearGradient
              colors={["#4F46E5", "#7C3AED"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Locate My Hall</Text>

              <Ionicons
                name="navigate-outline"
                size={20}
                color="#fff"
                style={{ marginLeft: 10 }}
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* TODAY SCHEDULE */}
        <View style={styles.scheduleCard}>
          <View style={styles.scheduleHeader}>
            <View>
              <Text style={styles.scheduleTitle}>
                Today's Schedule
              </Text>

              <Text style={styles.scheduleSub}>
                2 Exams Today
              </Text>
            </View>

            <TouchableOpacity>
              <Ionicons
                name="arrow-forward"
                size={22}
                color="#6B46C1"
              />
            </TouchableOpacity>
          </View>

          {/* EXAM 1 */}
          <View style={styles.examRow}>
            <View style={styles.timeBoxPurple}>
              <Text style={styles.timeTextPurple}>09:00 AM</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.examName}>
                Data Structures & Algorithms
              </Text>

              <Text style={styles.examCode}>CS-301</Text>
            </View>
          </View>

          {/* EXAM 2 */}
          <View style={styles.examRow}>
            <View style={styles.timeBoxOrange}>
              <Text style={styles.timeTextOrange}>02:00 PM</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.examName}>
                Database Management Systems
              </Text>

              <Text style={styles.examCode}>CS-302</Text>
            </View>
          </View>

          <TouchableOpacity>
            <Text style={styles.viewSchedule}>
              View Full Schedule
            </Text>
          </TouchableOpacity>
        </View>

        {/* SMART TIPS */}
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>Smart Tips</Text>

          <View style={styles.tipInner}>
            <Ionicons
              name="bulb-outline"
              size={22}
              color="#22C55E"
            />

            <View style={{ marginLeft: 10 }}>
              <Text style={styles.tipMain}>
                Reach 20 min early
              </Text>

              <Text style={styles.tipSub}>
                Avoid last-minute rush and be exam-ready!
              </Text>
            </View>
          </View>
        </View>

        {/* BOTTOM NAV */}
        <View style={styles.bottomNav}>
          <NavItem icon="home" text="Home" active />
          <NavItem icon="calendar" text="Schedule" />
          <NavItem icon="location" text="Locator" />
          <NavItem icon="notifications" text="Alerts" />
          <NavItem icon="person" text="Profile" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function NavItem({ icon, text, active }) {
  return (
    <TouchableOpacity style={styles.navItem}>
      <Ionicons
        name={icon}
        size={22}
        color={active ? "#5B4CF0" : "#777"}
      />

      <Text
        style={[
          styles.navText,
          active && {
            color: "#5B4CF0",
            fontWeight: "700",
          },
        ]}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingTop: 20,
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1E1B4B",
  },

  subtitle: {
    marginTop: 5,
    color: "#6B7280",
    fontSize: 14,
  },

  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: "#6D5DFB",
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 22,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },

  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  searchTitle: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  searchSub: {
    marginTop: 8,
    color: "#6B7280",
    marginBottom: 18,
  },

  label: {
    marginBottom: 8,
    marginTop: 10,
    color: "#6B7280",
    fontWeight: "600",
  },

  inputBox: {
    height: 56,
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  inputText: {
    fontSize: 15,
    color: "#111827",
  },

  button: {
    marginTop: 16,
    height: 58,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },

  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },

  scheduleCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 22,
    padding: 20,
    elevation: 3,
  },

  scheduleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  scheduleTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  scheduleSub: {
    marginTop: 4,
    color: "#6B7280",
  },

  examRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
  },

  timeBoxPurple: {
    backgroundColor: "#EEE9FF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 14,
  },

  timeTextPurple: {
    color: "#6D5DFB",
    fontWeight: "700",
    fontSize: 12,
  },

  timeBoxOrange: {
    backgroundColor: "#FFF1E6",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 14,
  },

  timeTextOrange: {
    color: "#FF8A00",
    fontWeight: "700",
    fontSize: 12,
  },

  examName: {
    fontWeight: "700",
    fontSize: 15,
    color: "#111827",
  },

  examCode: {
    marginTop: 4,
    color: "#6B7280",
  },

  viewSchedule: {
    marginTop: 18,
    color: "#5B4CF0",
    fontWeight: "700",
  },

  tipCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 22,
    padding: 20,
    marginBottom: 30,
  },

  tipTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
    color: "#111827",
  },

  tipInner: {
    flexDirection: "row",
    backgroundColor: "#F0FFF4",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },

  tipMain: {
    fontWeight: "700",
    color: "#16A34A",
  },

  tipSub: {
    marginTop: 4,
    color: "#6B7280",
    fontSize: 13,
  },

  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 18,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
  },

  navItem: {
    alignItems: "center",
  },

  navText: {
    marginTop: 4,
    fontSize: 12,
    color: "#777",
  },
});