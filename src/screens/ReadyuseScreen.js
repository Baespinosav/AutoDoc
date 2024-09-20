import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, SafeAreaView } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Logo from '../assets/Logo.png';
import SubaruImage from '../assets/subaru.png';

function ReadyUseScreen({ navigation }) {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    const user = auth().currentUser;
    if (!user) return;

    const subscriber = firestore()
      .collection('vehicles')
      .where('userId', '==', user.uid)
      .onSnapshot(querySnapshot => {
        const vehicleList = [];
        querySnapshot.forEach(documentSnapshot => {
          vehicleList.push({
            ...documentSnapshot.data(),
            id: documentSnapshot.id,
          });
        });
        setVehicles(vehicleList);
      });

    // Unsubscribe from events when no longer in use
    return () => subscriber();
  }, []);

  const renderVehicleItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.vehicleItem}
      onPress={() => navigation.navigate('VehicleDetail', { vehicle: item })}
    >
      <Image source={SubaruImage} style={styles.vehicleImage} />
      <View style={styles.vehicleInfo}>
        <Text style={styles.vehicleText}>{item.marca} {item.modelo}</Text>
        <Text style={styles.vehicleText}>{new Date(item.año).getFullYear()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AutoDoc</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.profileButtonText}>Ver Perfil</Text>
          </TouchableOpacity>
          <Image source={Logo} style={styles.logo} resizeMode="contain" />
        </View>
      </View>
      <FlatList
        data={vehicles}
        renderItem={renderVehicleItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('RegisterCar')}
      >
        <Text style={styles.addButtonText}>Agregar Vehículo</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c3e50',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#34495e',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileButton: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  profileButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  logo: {
    width: 50,
    height: 50,
  },
  listContainer: {
    padding: 20,
  },
  vehicleItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  vehicleImage: {
    width: 80,
    height: 80,
    marginRight: 15,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  addButton: {
    backgroundColor: '#3498db',
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
  backButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    alignSelf: 'center',
    width: 100,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default ReadyUseScreen;
