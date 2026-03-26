import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './src/screens/LoginScreen';
import ResetPassword from './src/screens/ResetPassword';
import CanteenMenuScreen from './src/screens/CanteenMenuScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>

        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPassword} />
        <Stack.Screen name="CanteenMenu" component={CanteenMenuScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}