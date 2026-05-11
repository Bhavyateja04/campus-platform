import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Feature screens (kept from feature_frontend1)
import HomeScreen from "./src/screens/HomeScreen";
import LostAndFoundScreen from "./src/screens/LostandFound";
import CampusMemoriesScreen from "./src/screens/CampusMemories";
import Clubs from "./src/screens/Clubs";
import AlertsScreen from "./src/screens/AlertsScreen";
import AboutScreen from "./src/screens/AboutScreen";
import ProfileScreen from "./src/screens/Profilescreen";
import PlacementsScreen from "./src/screens/Placements";
import MarketplaceScreen from "./src/screens/MarketplaceScreen";
import CanteenMenuScreen from "./src/screens/CanteenMenuScreen";
import CampusMapScreen from "./src/screens/CampusMapScreen";
import ExamHallScreen from "./src/screens/ExamHallScreen";
import FindLocationScreen from "./src/screens/FindLocationScreen";

// Auth + main-branch placeholder screens (registered so Login flow works)
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import ResetPassword, {
  ForgotPasswordScreen,
  ForceResetScreen,
} from "./src/screens/ResetPassword";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="ForceReset" component={ForceResetScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPassword} />

        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Alerts" component={AlertsScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />

        <Stack.Screen name="LostAndFound" component={LostAndFoundScreen} />
        <Stack.Screen name="CampusMemories" component={CampusMemoriesScreen} />
        <Stack.Screen name="Clubs" component={Clubs} />
        <Stack.Screen name="Placements" component={PlacementsScreen} />
        <Stack.Screen name="Marketplace" component={MarketplaceScreen} />
        <Stack.Screen name="CanteenMenu" component={CanteenMenuScreen} />
        <Stack.Screen name="CampusMap" component={CampusMapScreen} />
        <Stack.Screen name="ExamHall" component={ExamHallScreen} />
        <Stack.Screen
          name="FindLocationScreen"
          component={FindLocationScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
