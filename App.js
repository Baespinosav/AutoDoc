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

const Stack = createStackNavigator();

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
          options={{ title: 'Detalles del Vehículo' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;