import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ReadyuseScreen from './src/screens/ReadyuseScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import RegisterCarScreen from './src/screens/RegisterCarScreen';
import VehicleDetailScreen from './src/screens/VehicleDetailScreen';
import ChatbotScreen from './src/screens/ChatbotScreen';
import ChatbotSelectionScreen from './src/screens/ChatbotSelectionScreen';
<<<<<<< HEAD
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
=======
>>>>>>> 574ae0de7bf09b25b7f67b4d13647a1912f89e20

// Crea un stack navigator
const Stack = createStackNavigator();

/**
 * Componente principal de la aplicación que configura la navegación.
 * @returns {JSX.Element} Componente de la aplicación.
 */
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ headerShown: false }} // Esto oculta completamente la barra de navegación
        />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="ReadyUse" component={ReadyuseScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="RegisterCar" component={RegisterCarScreen} options={{ headerShown: false }}/>
        <Stack.Screen 
          name="VehicleDetail" 
          component={VehicleDetailScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Chatbot" component={ChatbotScreen} />
        <Stack.Screen name="ChatbotSelection" component={ChatbotSelectionScreen} options={{ headerShown: false }}/>
<<<<<<< HEAD
        <Stack.Screen 
          name="AdminDashboard" 
          component={AdminDashboardScreen} 
          options={{ headerShown: false }}
        />
=======
>>>>>>> 574ae0de7bf09b25b7f67b4d13647a1912f89e20
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
