import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, SafeAreaView, ScrollView, Dimensions, Animated } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Logo from '../assets/Logo.png';

const { width, height } = Dimensions.get('window');

function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');

  const scaleAnim1 = useRef(new Animated.Value(1)).current;
  const scaleAnim2 = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scaleAnim1, {
            toValue: 1.03,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim1, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(scaleAnim2, {
            toValue: 1.05,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim2, {
            toValue: 0.97,
            duration: 2500,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, []);

  const validateInputs = () => {
    if (!email || !password || !confirmPassword || !firstName || !lastName || !username) {
      Alert.alert('Error', 'Por favor, complete todos los campos');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return false;
    }
    if (!email.includes('@')) {
      Alert.alert('Error', 'Por favor, ingrese un correo electrónico válido');
      return false;
    }
    return true;
  };

  const checkUsernameExists = async (username) => {
    const usernameDoc = await firestore().collection('usernames').doc(username).get();
    return usernameDoc.exists;
  };

  const handleRegister = async () => {
    if (!validateInputs()) return;

    try {
      const usernameExists = await checkUsernameExists(username);
      if (usernameExists) {
        Alert.alert('Error', 'El nombre de usuario ya está en uso');
        return;
      }

      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      
      await firestore().collection('users').doc(userCredential.user.uid).set({
        firstName,
        lastName,
        username,
        email,
      });

      await firestore().collection('usernames').doc(username).set({
        uid: userCredential.user.uid
      });

      Alert.alert('Éxito', 'Cuenta creada exitosamente');
      navigation.navigate('ReadyUse');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.message || 'No se pudo crear la cuenta');
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
          <Text style={styles.registerMessage}>Crea tu cuenta</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            placeholderTextColor="#7f8c8d"
            value={firstName}
            onChangeText={setFirstName}
          />
          <TextInput
            style={styles.input}
            placeholder="Apellido"
            placeholderTextColor="#7f8c8d"
            value={lastName}
            onChangeText={setLastName}
          />
          <TextInput
            style={styles.input}
            placeholder="Nombre de usuario"
            placeholderTextColor="#7f8c8d"
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor="#7f8c8d"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#7f8c8d"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder="Confirmar contraseña"
            placeholderTextColor="#7f8c8d"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.registerButtonText}>Registrarse</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>¿Ya tienes una cuenta? Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
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
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    backgroundColor: '#e8f4fd',
    top: -width * 0.7,
    left: -width * 0.1,
    zIndex: 1,
  },
  circle2: {
    position: 'absolute',
    width: width * 1.0,
    height: width * 1.0,
    borderRadius: width * 0.5,
    backgroundColor: '#d1e8fa',
    top: -width * 0.6,
    left: -width * 0.05,
    zIndex: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: height * 0.06,
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
    paddingTop: 40,
    zIndex: 3,
  },
  formContainer: {
    width: '100%',
  },
  registerMessage: {
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
  registerButton: {
    backgroundColor: '#000000',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
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
});

export default RegisterScreen;
