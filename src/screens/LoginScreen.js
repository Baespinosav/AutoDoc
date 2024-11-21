import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, SafeAreaView, ScrollView, Dimensions, Animated } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore'; // Importa Firestore
import Logo from '../assets/Logo.png';

const { width, height } = Dimensions.get('window');

function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const scaleAnim1 = useRef(new Animated.Value(1)).current;
  const scaleAnim2 = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scaleAnim1, {
            toValue: 1.05,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim1, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(scaleAnim2, {
            toValue: 1.1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim2, {
            toValue: 0.95,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor, ingrese email y contraseña');
      return;
    }

    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const uid = userCredential.user.uid;

      // Obtener el rol del usuario desde Firestore
      const userDoc = await firestore().collection('users').doc(uid).get();

      if (userDoc.exists) {
        const userData = userDoc.data();
        if (userData.role === 'admin') {
          navigation.replace('AdminDashboard');
        } else {
          navigation.navigate('ReadyUse');
        }
      } else {
        Alert.alert('Error', 'No se encontró el documento del usuario en Firestore.');
      }

    } catch (error) {
      console.error(error);
      
      let errorMessage = 'Credenciales incorrectas';
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'El formato del correo electrónico no es válido';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Esta cuenta ha sido deshabilitada';
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'Credenciales incorrectas';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Demasiados intentos fallidos. Por favor, intente más tarde';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Error de conexión. Por favor, verifique su conexión a internet';
          break;
        default:
          errorMessage = 'Credenciales incorrectas';
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  /**
   * Maneja la solicitud de restablecimiento de contraseña.
   * Envía un correo electrónico para restablecer la contraseña si el correo electrónico es válido.
   */
  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Por favor, ingrese su correo electrónico para recuperar la contraseña');
      return;
    }

    try {
      // Primero verificamos si el correo existe en nuestra base de datos
      const usersSnapshot = await firestore()
        .collection('users')
        .where('email', '==', email.toLowerCase().trim())
        .get();

      if (usersSnapshot.empty) {
        Alert.alert('Error', 'El correo electrónico ingresado no está registrado en nuestra aplicación');
        return;
      }

      // Si el correo existe, procedemos con el envío del correo de recuperación
      await auth().sendPasswordResetEmail(email);
      Alert.alert(
        'Éxito', 
        'Se ha enviado un correo electrónico para restablecer su contraseña. Por favor, revise su bandeja de entrada.'
      );
    } catch (error) {
      console.error('Error en recuperación de contraseña:', error);
      
      // Mensajes de error más específicos
      let errorMessage = 'No se pudo enviar el correo de recuperación';
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'El formato del correo electrónico no es válido';
          break;
        case 'auth/user-not-found':
          errorMessage = 'El correo electrónico ingresado no está registrado';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Demasiados intentos. Por favor, intente más tarde';
          break;
        default:
          errorMessage = error.message || 'Error al enviar el correo de recuperación';
      }
      
      Alert.alert('Error', errorMessage);
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
