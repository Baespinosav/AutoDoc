import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, SafeAreaView, Image } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Logo from '../assets/Logo.png'; // Asegúrate de que la ruta sea correcta

function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');

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
      // Verificar si el nombre de usuario ya existe
      const usernameExists = await checkUsernameExists(username);
      if (usernameExists) {
        Alert.alert('Error', 'El nombre de usuario ya está en uso');
        return;
      }

      // Crear usuario con email y contraseña
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      
      // Almacenar información adicional en Firestore
      await firestore().collection('users').doc(userCredential.user.uid).set({
        firstName,
        lastName,
        username,
        email,
      });

      // Reservar el nombre de usuario
      await firestore().collection('usernames').doc(username).set({
        uid: userCredential.user.uid
      });

      Alert.alert('Éxito', 'Cuenta creada exitosamente');
      navigation.navigate('ReadyUse'); // Navega a ReadyUse después del registro exitoso
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.message || 'No se pudo crear la cuenta');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AutoDoc</Text>
        <Image source={Logo} style={styles.logo} resizeMode="contain" />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            value={firstName}
            onChangeText={setFirstName}
          />
          <TextInput
            style={styles.input}
            placeholder="Apellido"
            value={lastName}
            onChangeText={setLastName}
          />
          <TextInput
            style={styles.input}
            placeholder="Nombre de usuario"
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirmar contraseña"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Registrarse</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.loginButton]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.buttonText}>Ya tengo una cuenta</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  logo: {
    width: 150,
    height: 150,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    backgroundColor: '#e8e8e8',
    width: '100%',
    height: 50,
    borderRadius: 25,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2c3e50',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 10,
  },
  loginButton: {
    backgroundColor: '#34495e',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#34495e',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
  },
  logo: {
    width: 50,
    height: 50,
  },
  backButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 20,
    alignSelf: 'center',
    width: 100,  // Hace el botón más pequeño
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
