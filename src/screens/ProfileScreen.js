import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView, ScrollView, Image, Animated } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Logo from '../assets/Logo.png';

/**
 * Componente ProfileScreen que muestra la información del perfil del usuario.
 * Permite al usuario cerrar sesión y volver a la pantalla anterior.
 * @param {Object} navigation - Objeto de navegación para manejar la navegación entre pantallas.
 */
function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null); // Estado para almacenar la información del usuario
  const scaleAnim1 = useRef(new Animated.Value(1)).current; // Animación para el primer círculo
  const scaleAnim2 = useRef(new Animated.Value(1)).current; // Animación para el segundo círculo

  useEffect(() => {
    // Función para obtener los datos del usuario desde Firestore
    const fetchUserData = async () => {
      const currentUser = auth().currentUser; // Obtiene el usuario actual
      if (currentUser) {
        const userDoc = await firestore().collection('users').doc(currentUser.uid).get(); // Obtiene el documento del usuario
        if (userDoc.exists) {
          setUser(userDoc.data()); // Establece el estado con los datos del usuario
        }
      }
    };

    fetchUserData(); // Llama a la función para obtener los datos del usuario

    // Animación de los círculos
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scaleAnim1, { toValue: 1.1, duration: 2000, useNativeDriver: true }),
          Animated.timing(scaleAnim1, { toValue: 1, duration: 2000, useNativeDriver: true })
        ]),
        Animated.sequence([
          Animated.timing(scaleAnim2, { toValue: 1.15, duration: 2500, useNativeDriver: true }),
          Animated.timing(scaleAnim2, { toValue: 1, duration: 2500, useNativeDriver: true })
        ])
      ])
    ).start(); // Inicia la animación
  }, []);

  /**
   * Maneja el cierre de sesión del usuario.
   * Cierra la sesión y navega a la pantalla de inicio.
   */
  const handleLogout = async () => {
    try {
      await auth().signOut(); // Cierra la sesión del usuario
      Alert.alert('Éxito', 'Sesión cerrada correctamente'); // Mensaje de éxito
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }], // Navega a la pantalla de inicio
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      Alert.alert('Error', 'No se pudo cerrar la sesión'); // Manejo de errores
    }
  };

  // Si los datos del usuario aún no se han cargado, muestra un mensaje de carga
  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.circle1, { transform: [{ scale: scaleAnim1 }] }]} />
      <Animated.View style={[styles.circle2, { transform: [{ scale: scaleAnim2 }] }]} />
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image source={Logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.headerTitle}>
            <Text style={styles.boldText}>Auto</Text>Doc
          </Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Perfil de Usuario</Text>
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Nombre:</Text>
              <Text style={styles.infoText}>{user.firstName} {user.lastName}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoText}>{user.email}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Nombre de usuario:</Text>
              <Text style={styles.infoText}>{user.username}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.buttonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()} // Navega a la pantalla anterior
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  circle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(52, 152, 219, 0.2)',
    top: -50,
    left: -50,
  },
  circle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(46, 204, 113, 0.2)',
    top: -30,
    right: -30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'transparent',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 24,
    color: '#333',
  },
  boldText: {
    fontWeight: 'bold',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoItem: {
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34495e',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 18,
    color: '#2c3e50',
  },
  buttonContainer: {
    padding: 20,
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  backButton: {
    backgroundColor: '#000000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
