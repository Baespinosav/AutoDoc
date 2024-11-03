import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, SafeAreaView, ScrollView, Dimensions, Animated } from 'react-native';
import auth from '@react-native-firebase/auth';
import Logo from '../assets/Logo.png'; // Asegúrate de que la ruta sea correcta

const { width, height } = Dimensions.get('window');

/**
 * Componente LoginScreen que permite a los usuarios iniciar sesión en la aplicación.
 * @param {Object} navigation - Objeto de navegación para manejar la navegación entre pantallas.
 */
function LoginScreen({ navigation }) {
  const [email, setEmail] = useState(''); // Estado para almacenar el correo electrónico
  const [password, setPassword] = useState(''); // Estado para almacenar la contraseña

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

  /**
   * Maneja el inicio de sesión del usuario.
   * Valida el correo electrónico y la contraseña, y realiza la autenticación.
   */
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor, ingrese email y contraseña'); // Mensaje de error si faltan campos
      return;
    }

    try {
      await auth().signInWithEmailAndPassword(email, password); // Intenta iniciar sesión


      // Verificar si es el administrador
      if (email === 'admin@admin.cl') {
        navigation.replace('AdminDashboard');
      } else {
        navigation.navigate('ReadyUse'); // Navega a la pantalla principal si el inicio de sesión es exitoso
      }

      navigation.navigate('ReadyUse'); // Navega a la pantalla principal si el inicio de sesión es exitoso

    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.message || 'No se pudo iniciar sesión'); // Manejo de errores
    }
  };

  /**
   * Maneja la solicitud de restablecimiento de contraseña.
   * Envía un correo electrónico para restablecer la contraseña si el correo electrónico es válido.
   */
  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Por favor, ingrese su correo electrónico para recuperar la contraseña'); // Mensaje de error si falta el correo
      return;
    }

    try {
      await auth().sendPasswordResetEmail(email); // Envía el correo de restablecimiento
      Alert.alert('Éxito', 'Se ha enviado un correo electrónico para restablecer su contraseña'); // Mensaje de éxito
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.message || 'No se pudo enviar el correo de recuperación'); // Manejo de errores
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.circle1, { transform: [{ scale: scaleAnim1 }] }]} />
      <Animated.View style={[styles.circle2, { transform: [{ scale: scaleAnim2 }] }]} />
      <View style={styles.header}>
        <Image source={Logo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>
          <Text style={styles.boldText}>Auto</Text>Doc
        </Text>
      </View>
      <View style={styles.sloganContainer}>
        <Text style={styles.slogan}>Tus papeles y mecánico</Text>
        <Text style={styles.sloganHighlight}>en un solo lugar</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.loginMessage}>Inicia sesión en tu cuenta</Text>
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor="#7f8c8d"
            value={email}
            onChangeText={setEmail} // Actualiza el estado del correo electrónico
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#7f8c8d"
            value={password}
            onChangeText={setPassword} // Actualiza el estado de la contraseña
            secureTextEntry
          />
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.registerButton}
            onPress={() => navigation.navigate('Register')} // Navega a la pantalla de registro
          >
            <Text style={styles.registerButtonText}>¿No tienes una cuenta? Regístrate</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.forgotPasswordButton} onPress={handleForgotPassword}>
            <Text style={styles.forgotPasswordButtonText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()} // Navega a la pantalla anterior
      >
        <Text style={styles.backButtonText}>Volver</Text>
      </TouchableOpacity>
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
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    backgroundColor: '#e8f4fd',
    top: -width * 0.9,  // Movido más arriba
    left: -width * 0.25,
    zIndex: 1,
  },
  circle2: {
    position: 'absolute',
    width: width * 1.3,
    height: width * 1.3,
    borderRadius: width * 0.65,
    backgroundColor: '#d1e8fa',
    top: -width * 0.8,  // Movido más arriba
    left: -width * 0.15,
    zIndex: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: height * 0.08,  // Aumentado ligeramente para compensar los círculos más altos
    zIndex: 3,
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
  sloganContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    zIndex: 3,
  },
  slogan: {
    fontSize: 16,
    color: '#666',
  },
  sloganHighlight: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3498db',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 3,
  },
  formContainer: {
    width: '100%',
  },
  loginMessage: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#ffffff',
    width: '100%',
    height: 50,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#000',
    borderWidth: 1,
    borderColor: '#ccc',
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
    fontSize: 18,
    fontWeight: 'bold',
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
  backButton: {
    backgroundColor: '#000000',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    zIndex: 3,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPasswordButton: {
    alignItems: 'center',
  },
  forgotPasswordButtonText: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LoginScreen;
