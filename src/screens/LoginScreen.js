import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, SafeAreaView, ScrollView } from 'react-native';
import auth from '@react-native-firebase/auth';
import Logo from '../assets/Logo.png'; // Asegúrate de que la ruta sea correcta

function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor, ingrese email y contraseña');
      return;
    }

    try {
      await auth().signInWithEmailAndPassword(email, password);
      navigation.navigate('ReadyUse');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.message || 'No se pudo iniciar sesión');
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
            placeholder="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Iniciar Sesión</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.registerButton]}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.buttonText}>¿No tienes una cuenta? Regístrate</Text>
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
    backgroundColor: '#f0f0f0',
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  registerButton: {
    backgroundColor: '#34495e',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
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

export default LoginScreen;
