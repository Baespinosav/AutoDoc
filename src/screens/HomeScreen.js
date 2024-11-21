import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, StatusBar, Dimensions, Animated } from 'react-native';
import Logo from '../assets/Logo.png';

const { width, height } = Dimensions.get('window');

/**
 * Componente HomeScreen que muestra la pantalla de inicio de la aplicación.
 * Permite al usuario iniciar sesión o registrarse.
 * @param {Object} navigation - Objeto de navegación para manejar la navegación entre pantallas.
 */
function HomeScreen({ navigation }) {
  const scaleAnim1 = useRef(new Animated.Value(1)).current; // Animación para el primer círculo
  const scaleAnim2 = useRef(new Animated.Value(1)).current; // Animación para el segundo círculo

  useEffect(() => {
    // Inicia las animaciones de escalado en bucle
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scaleAnim1, {
            toValue: 1.05, // Escala hacia arriba
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim1, {
            toValue: 1, // Regresa a la escala original
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(scaleAnim2, {
            toValue: 1.1, // Escala hacia arriba
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim2, {
            toValue: 0.95, // Regresa a una escala más pequeña
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Animated.View style={[styles.circle1, { transform: [{ scale: scaleAnim1 }] }]} />
      <Animated.View style={[styles.circle2, { transform: [{ scale: scaleAnim2 }] }]} />
      <View style={styles.header}>
        <Image source={Logo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>
          <Text style={styles.boldText}>Auto</Text>Doc
        </Text>
      </View>
      <View style={styles.content}>
        <View style={styles.sloganContainer}>
          <Text style={styles.sloganPart1}>Tus papeles y mecánico</Text>
          <Text style={styles.sloganPart2}>en un solo lugar</Text>
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')} // Navega a la pantalla de inicio de sesión
        >
          <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => navigation.navigate('Register')} // Navega a la pantalla de registro
        >
          <Text style={styles.registerButtonText}>Registrarse</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  circle1: {
    position: 'absolute',
    width: width * 1.9,
    height: width * 1.9,
    borderRadius: width * 0.95,
    backgroundColor: '#e8f4fd',
    top: -width * 0.95,
    right: -width * 0.45,
    zIndex: 1,
  },
  circle2: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    backgroundColor: '#d1e8fa',
    top: -width * 0.65,
    right: -width * 0.25,
    zIndex: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: height * 0.15,
    zIndex: 2,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  title: {
    fontSize: 28,
    color: '#333',
  },
  boldText: {
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 2,
  },
  sloganContainer: {
    alignItems: 'center',
  },
  sloganPart1: {
    fontSize: 22,
    color: '#666',
    textAlign: 'center',
    marginBottom: 5,
  },
  sloganPart2: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498db',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 30,
    zIndex: 2,
  },
  loginButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#000000',
  },
  loginButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: '#000000',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;
