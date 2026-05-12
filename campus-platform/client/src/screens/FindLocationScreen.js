import React, { useState } from "react";
import { View,ScrollView, Text,Pressable, StyleSheet,TextInput,Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { AllPlaces } from "../data/places";



export default function FindLocationScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const [searchText, setSearchText] = useState("");

    const filteredPlaces = AllPlaces.filter((place) =>
        place.name
            .replace(/\s+/g, "")
            .toLowerCase()
            .includes(searchText.replace(/\s+/g, "").toLowerCase())
    );

    return (
        <View style={{backgroundColor: 'white',flex:1 }}>
            <Text style={styles.topHeadingText}>Find Places throughout the campus</Text>
            <TextInput
                placeholder="Search places..."
                value={searchText}
                onChangeText={(text) => setSearchText(text)}
                style={styles.searchInput}
                />
            <ScrollView>
                {filteredPlaces.map((place) => (
                <Pressable
                    key={place.id}
                    onPress={() => navigation.navigate("Map", { place })}
                    style={styles.card}
                >
                    <View>
                        <Image source={place.placeImage} style={styles.image} />

                        <Text style={styles.placeName}>{place.name}</Text>
                    </View>
                </Pressable>
                ))}
            </ScrollView>
        </View>
    );
}

const styles= StyleSheet.create({
    topHeadingText:{
        color: 'green',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
        paddingLeft: 10,
        paddingTop: 10,
    },
    searchInput: {
    backgroundColor: "#f2f2f2",
    marginHorizontal: 10,
    marginBottom: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    },
    card: {
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 16,
    overflow: "hidden",

    elevation: 4, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    },
    image: {
    width: "100%",
    height: 160,
    },
    placeName: {
    fontSize: 18,
    fontWeight: "bold",
    padding: 12,
    color: "#222",
    },
})