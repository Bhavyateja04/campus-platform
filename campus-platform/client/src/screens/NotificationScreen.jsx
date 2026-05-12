import React, {
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  FlatList,
  Button,
  Linking,
} from "react-native";

import axios from "axios";

import * as Notifications from "expo-notifications";

import * as Device from "expo-device";
import Constants from "expo-constants";

export default function NotificationScreen() {

  const [notifications, setNotifications] = useState([]);

  const [permissionGranted, setPermissionGranted] = useState(false);



  useEffect(() => {
    checkPermission();
  }, []);



  // CHECK PERMISSION
const checkPermission = async () => {

  const { status } =
    await Notifications.getPermissionsAsync();

  console.log("Permission status:", status);

  if (status === "granted") {
    setPermissionGranted(true);
    getTokenAndSave(); // IMPORTANT
    getNotifications();
  } else {
    setPermissionGranted(false);
  }
};

// get and save token
const getTokenAndSave = async () => {

  try {

    const tokenData =
      await Notifications.getExpoPushTokenAsync({
        projectId:
          Constants.expoConfig?.extra?.eas?.projectId,
      });

    const token = tokenData.data;

    console.log("TOKEN:", token);

    await axios.post(
      "http://YOUR_IP:5000/api/save-token",
      { token }
    );

  } catch (err) {

    console.log("Token error:", err.message);
  }
};


  // ALLOW NOTIFICATIONS
const allowNotifications = async () => {

  let { status } =
    await Notifications.getPermissionsAsync();

  if (status !== "granted") {

    const permission =
      await Notifications.requestPermissionsAsync();

    status = permission.status;
  }

  if (status !== "granted") {
    Linking.openSettings();
    return;
  }

  console.log("Permission GRANTED");

  setPermissionGranted(true); // 🔥 THIS fixes UI

  await getTokenAndSave(); // 🔥 store token immediately

  await getNotifications();
};



  // FETCH NOTIFICATIONS
  const getNotifications = async () => {
    try {
      const res = await axios.get(
        "http://10.241.85.6:5000/api/notifications"
      );

      setNotifications(res.data);

    } catch (err) {
      console.log(err);
    }
  };



  return (

    <View style={{ flex: 1 }}>

      {/* SHOW ONLY BUTTON IF NOT GRANTED */}
      {
        !permissionGranted ? (

          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >

            <Button
              title="Allow Notifications"
              onPress={allowNotifications}
            />

          </View>

        ) : (

          <FlatList

            data={notifications}

            keyExtractor={(item) => item._id}

            ListEmptyComponent={() => (

              <View
                style={{
                  marginTop: 50,
                  alignItems: "center",
                }}
              >

                <Text>No Notifications</Text>

              </View>
            )}

            renderItem={({ item }) => (

              <View
                style={{
                  padding: 15,
                  borderBottomWidth: 1,
                }}
              >

                <Text style={{ fontWeight: "bold" }}>
                  {item.title}
                </Text>

                <Text>{item.body}</Text>

                <Text style={{ color: "gray", fontSize: 12 }}>
                  {new Date(item.createdAt).toLocaleString()}
                </Text>

              </View>
            )}
          />

        )
      }

    </View>
  );
}