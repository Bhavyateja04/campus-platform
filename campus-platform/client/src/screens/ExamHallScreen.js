import React, { useState } from "react";

import {
   View,
   Text,
   TextInput,
   Pressable,
   StyleSheet,
   Image,
   ScrollView,
   Alert,
} from "react-native";

import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { AllPlaces } from "../../src/data/places";

export default function ExamHallScreen() {

   const navigation = useNavigation();

   const [rollNo, setRollNo] = useState("");
   const [buildingInput, setBuildingInput] = useState("");

   const [students, setStudents] = useState([]);
   const [selectedBuilding, setSelectedBuilding] = useState(null);

   const [notFound, setNotFound] = useState(false);



   // ROLL INPUT (auto clears building)
   const handleRollChange = (text) => {
      setRollNo(text.replace(/[^a-zA-Z0-9]/g, ""));
      setBuildingInput("");
   };



   // BUILDING INPUT (auto clears roll)
   const handleBuildingChange = (text) => {
      setBuildingInput(text);
      setRollNo("");
   };



   // CLEAR ALL
   const handleClear = () => {
      setRollNo("");
      setBuildingInput("");
      setStudents([]);
      setSelectedBuilding(null);
      setNotFound(false);
   };



   const handleSearch = async () => {

      try {

         if (!rollNo && !buildingInput) {
            Alert.alert("Enter Roll OR Building");
            return;
         }

         const response = await axios.get(
            "http://YOUR_IP:5000/exam-search",
            {
               params: {
                  rollNo,
                  buildingName: buildingInput,
               },
            }
         );

         const data = response.data;

         setStudents(data);



         // ❌ NOT FOUND HANDLING
         if (data.length === 0) {

            setNotFound(true);
            setSelectedBuilding(null);

         } else {

            setNotFound(false);

            const buildingName = data[0].buildingName;

            const building = AllPlaces.find((place) =>
               place.name
                  .replace(/\s+/g, "")
                  .toLowerCase()
                  .includes(
                     buildingName
                        .replace(/\s+/g, "")
                        .toLowerCase()
                  )
            );

            setSelectedBuilding(building || null);
         }

      } catch (err) {

         console.log(err);

         Alert.alert("Error", "Server error");

      }
   };



   return (
      <ScrollView style={styles.container}>

         {/* HEADING */}
         <Text style={styles.heading}>
            Exam Center Locator
         </Text>



         {/* SEARCH CARD */}
         <View style={styles.card}>

            <Text style={styles.label}>
               Roll Number
            </Text>

            <TextInput
               placeholder="Enter Roll Number"
               value={rollNo}
               onChangeText={handleRollChange}
               style={styles.input}
               autoCapitalize="characters"
            />



            {/* OR */}
            <View style={styles.orContainer}>
               <View style={styles.line} />
               <Text style={styles.orText}>OR</Text>
               <View style={styles.line} />
            </View>



            <Text style={styles.label}>
               Building Name
            </Text>

            <TextInput
               placeholder="Enter Building Name"
               value={buildingInput}
               onChangeText={handleBuildingChange}
               style={styles.input}
            />



            {/* BUTTONS */}
            <View style={styles.btnRow}>

               <Pressable
                  style={styles.searchBtn}
                  onPress={handleSearch}
               >
                  <Text style={styles.btnText}>
                     Search
                  </Text>
               </Pressable>



               <Pressable
                  style={styles.clearBtn}
                  onPress={handleClear}
               >
                  <Text style={styles.clearText}>
                     Clear
                  </Text>
               </Pressable>

            </View>

         </View>



         {/* BUILDING CARD */}
         {selectedBuilding && (

            <Pressable
               style={styles.buildingCard}
               onPress={() =>
                  navigation.navigate("Map", {
                     place: selectedBuilding,
                  })
               }
            >

               <Image
                  source={selectedBuilding.placeImage}
                  style={styles.image}
               />

               <Text style={styles.buildingName}>
                  {selectedBuilding.name}
               </Text>

            </Pressable>

         )}



         {/* TABLE */}
         {students.length > 0 && (

            <View style={styles.table}>

               <View style={styles.rowHeader}>
                  <Text style={styles.header}>Name</Text>
                  <Text style={styles.header}>Roll</Text>
                  <Text style={styles.header}>Room</Text>
                  <Text style={styles.header}>Building</Text>
               </View>



               {students.map((s) => (
                  <View key={s._id} style={styles.row}>
                     <Text style={styles.cell}>{s.name}</Text>
                     <Text style={styles.cell}>{s.rollNo}</Text>
                     <Text style={styles.cell}>{s.roomNo}</Text>
                     <Text style={styles.cell}>{s.buildingName}</Text>
                  </View>
               ))}

            </View>

         )}



         {/* ❌ NOT FOUND UI */}
         {notFound && (

            <View style={styles.notFoundBox}>
               <Text style={styles.notFoundText}>
                  ❌ No Results Found
               </Text>
               <Text style={styles.notFoundSub}>
                  Please check Roll Number or Building Name
               </Text>
            </View>

         )}

      </ScrollView>
   );
}

const styles = StyleSheet.create({

   container: {
      flex: 1,
      backgroundColor: "#f5f7fa",
      padding: 16,
   },



   heading: {
      fontSize: 26,
      fontWeight: "bold",
      color: "green",
      marginBottom: 15,
   },



   card: {
      backgroundColor: "white",
      borderRadius: 18,
      padding: 16,
      elevation: 4,
      marginBottom: 20,
   },



   label: {
      fontWeight: "600",
      marginBottom: 6,
      color: "#333",
   },



   input: {
      backgroundColor: "#f2f2f2",
      borderRadius: 12,
      padding: 12,
      fontSize: 16,
      borderWidth: 1,
      borderColor: "#ddd",
   },



   orContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 15,
   },



   line: {
      flex: 1,
      height: 1,
      backgroundColor: "#ccc",
   },



   orText: {
      marginHorizontal: 10,
      fontWeight: "bold",
      color: "gray",
   },



   btnRow: {
      flexDirection: "row",
      marginTop: 15,
      justifyContent: "space-between",
   },



   searchBtn: {
      flex: 1,
      backgroundColor: "green",
      padding: 12,
      borderRadius: 10,
      alignItems: "center",
      marginRight: 10,
   },



   clearBtn: {
      flex: 1,
      backgroundColor: "#e74c3c",
      padding: 12,
      borderRadius: 10,
      alignItems: "center",
   },



   btnText: {
      color: "white",
      fontWeight: "bold",
   },



   clearText: {
      color: "white",
      fontWeight: "bold",
   },



   buildingCard: {
      backgroundColor: "white",
      borderRadius: 15,
      overflow: "hidden",
      marginBottom: 20,
      elevation: 3,
   },



   image: {
      width: "100%",
      height: 180,
   },



   buildingName: {
      fontSize: 20,
      fontWeight: "bold",
      padding: 12,
   },



   table: {
      backgroundColor: "white",
      borderRadius: 12,
      overflow: "hidden",
   },



   rowHeader: {
      flexDirection: "row",
      backgroundColor: "green",
      padding: 10,
   },



   header: {
      flex: 1,
      color: "white",
      fontWeight: "bold",
      textAlign: "center",
   },



   row: {
      flexDirection: "row",
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#eee",
   },



   cell: {
      flex: 1,
      textAlign: "center",
   },

   notFoundBox: {
   marginTop: 20,
   padding: 15,
   backgroundColor: "#ffe5e5",
   borderRadius: 12,
   alignItems: "center",
},

notFoundText: {
   color: "#d10000",
   fontWeight: "bold",
   fontSize: 16,
},

notFoundSub: {
   color: "#a00000",
   fontSize: 13,
   marginTop: 5,
}

});