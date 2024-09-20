import React from 'react';
import { View, Text, StyleSheet, Button, Linking, Alert, SafeAreaView, Image, TouchableOpacity } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Logo from '../assets/Logo.png';

function VehicleDetailScreen({ route, navigation }) {
  const { vehicle } = route.params;

  const openPdf = async () => {
    if (vehicle.documentoPdf && vehicle.documentoPdf.url) {
      try {
        const supported = await Linking.canOpenURL(vehicle.documentoPdf.url);
        if (supported) {
          await Linking.openURL(vehicle.documentoPdf.url);
        } else {
          Alert.alert('Error', 'No se puede abrir el PDF en este dispositivo');
        }
      } catch (error) {
        console.error('Error al abrir el PDF:', error);
        Alert.alert('Error', 'No se pudo abrir el PDF');
      }
    } else {
      Alert.alert('Información', 'No hay documento PDF asociado a este vehículo');
    }
  };

  const deleteVehicle = async () => {
    Alert.alert(
      "Eliminar Vehículo",
      "¿Estás seguro de que quieres eliminar este vehículo?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        { 
          text: "Eliminar", 
          onPress: async () => {
            try {
              // Verificar si el documento existe antes de intentar eliminarlo
              const vehicleRef = firestore().collection('vehicles').doc(vehicle.id);
              const doc = await vehicleRef.get();

              if (!doc.exists) {
                console.log('El documento no existe');
                Alert.alert('Error', 'No se encontró el vehículo en la base de datos');
                return;
              }

              // Intentar eliminar el documento
              await vehicleRef.delete();
              console.log('Vehículo eliminado con éxito');
              Alert.alert('Éxito', 'El vehículo ha sido eliminado', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              console.error('Error al eliminar el vehículo:', error);
              Alert.alert('Error', 'No se pudo eliminar el vehículo: ' + error.message);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AutoDoc</Text>
        <Image source={Logo} style={styles.logo} resizeMode="contain" />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{vehicle.marca} {vehicle.modelo}</Text>
        <Text style={styles.detail}>Año: {new Date(vehicle.año).getFullYear()}</Text>
        <Text style={styles.detail}>ID: {vehicle.id}</Text>
        
        {vehicle.documentoPdf ? (
          <Button title="Ver documento PDF" onPress={openPdf} />
        ) : (
          <Text style={styles.noDocument}>No hay documento PDF asociado a este vehículo</Text>
        )}

        <TouchableOpacity style={styles.deleteButton} onPress={deleteVehicle}>
          <Text style={styles.deleteButtonText}>Eliminar Vehículo</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#34495e',
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
  },
  logo: {
    width: 50,
    height: 50,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
  },
  detail: {
    fontSize: 18,
    marginBottom: 10,
    color: '#34495e',
  },
  noDocument: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#666',
    marginTop: 20,
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default VehicleDetailScreen;
