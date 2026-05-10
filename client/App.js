import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


// Screens
import HomeScreen           from './src/screens/HomeScreen';
import LostAndFoundScreen   from './src/screens/LostandFound';
import CampusMemoriesScreen from './src/screens/CampusMemories';
import Clubs                from './src/screens/Clubs';
import AlertsScreen         from './src/screens/AlertsScreen';
import AboutScreen          from './src/screens/AboutScreen';
import ProfileScreen        from './src/screens/Profilescreen';
import PlacementsScreen     from './src/screens/Placements';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{ headerShown: false }}
      >
        {/* Main Screens */}
        <Stack.Screen name="Home"           component={HomeScreen}           />
        <Stack.Screen name="Alerts"         component={AlertsScreen}         />
        <Stack.Screen name="About"          component={AboutScreen}          />
        <Stack.Screen name="Profile"        component={ProfileScreen}        />

        {/* Feature Screens */}
        <Stack.Screen name="LostAndFound"   component={LostAndFoundScreen}   />
        <Stack.Screen name="CampusMemories" component={CampusMemoriesScreen} />
        <Stack.Screen name="Clubs"          component={Clubs}                />
        <Stack.Screen name="Placements"     component={PlacementsScreen}     />
      </Stack.Navigator>
    </NavigationContainer>
  );
}