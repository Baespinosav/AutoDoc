import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, SafeAreaView } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Logo from '../assets/Logo.png';
import SubaruImage from '../assets/subaru.png';

/**
 * Componente ReadyUseScreen que muestra la lista de vehículos del usuario.
 * Permite al usuario ver detalles de cada vehículo y agregar nuevos vehículos.
 * @param {Object} navigation - Objeto de navegación para manejar la navegación entre pantallas.
 */
function ReadyUseScreen({ navigation }) {
  const [vehicles, setVehicles] = useState([]); // Estado para almacenar la lista de vehículos

  useEffect(() => {
    const user = auth().currentUser; // Obtiene el usuario actual
    if (!user) return; // Si no hay usuario, no hace nada

    // Suscripción a la colección de vehículos en Firestore
    const subscriber = firestore()
      .collection('vehicles')
      .where('userId', '==', user.uid) // Filtra vehículos por ID de usuario
      .onSnapshot(querySnapshot => {
        const vehicleList = [];
        querySnapshot.forEach(documentSnapshot => {
          vehicleList.push({
            ...documentSnapshot.data(),
            id: documentSnapshot.id, // Agrega el ID del documento a la lista
          });
        });
        setVehicles(vehicleList); // Actualiza el estado con la lista de vehículos
      });

    return () => subscriber(); // Limpia la suscripción al desmontar el componente
  }, []);

  /**
   * Renderiza un elemento de vehículo en la lista.
   * @param {Object} item - El objeto de vehículo a renderizar.
   * @returns {JSX.Element} El componente de vehículo.
   */
  const renderVehicleItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.vehicleItem}
      onPress={() => navigation.navigate('VehicleDetail', { vehicle: item })} // Navega a la pantalla de detalles del vehículo
    >
      <Image source={SubaruImage} style={styles.vehicleImage} />
      <View style={styles.vehicleInfo}>
        <Text style={styles.vehicleText}>{item.marca} {item.modelo}</Text>
        <Text style={styles.patenteText}>{item.patente}</Text>
        <Text style={styles.vehicleText}>
          {item.año ? item.año : 'Año no disponible'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image source={Logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>
            <Text style={styles.boldText}>Auto</Text>Doc
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')} // Navega a la pantalla de perfil
        >
          <Text style={styles.profileButtonText}>Ver Perfil</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={vehicles} // Lista de vehículos
        renderItem={renderVehicleItem} // Función para renderizar cada vehículo
        keyExtractor={item => item.id} // Clave única para cada elemento
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyListText}>No tienes vehículos registrados</Text> // Mensaje si no hay vehículos
        }
      />
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('RegisterCar')} // Navega a la pantalla para agregar un vehículo
      >
        <Text style={styles.addButtonText}>Agregar Vehículo</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0', // Un color de fondo suave
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
  title: {
    fontSize: 24,
    color: '#333',
  },
  boldText: {
    fontWeight: 'bold',
  },
  profileButton: {
    backgroundColor: '#000000',
    padding: 10,
    borderRadius: 20,
  },
  profileButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 20,
  },
  vehicleItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000000',
  },
  vehicleImage: {
    width: 120,
    height: 80,
    marginRight: 15,
    resizeMode: 'cover',
    borderRadius: 5,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleText: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 5,
  },
  patenteText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  addButton: {
    backgroundColor: '#000000',
    padding: 15,
    borderRadius: 25,
    margin: 20,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyListText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 20,
  },
});

export default ReadyUseScreen;
