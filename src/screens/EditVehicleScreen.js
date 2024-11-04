import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import firestore from '@react-native-firebase/firestore';

/**
 * Componente EditVehicleScreen que permite modificar la información de un vehículo.
 * @param {Object} route - Propiedades de la ruta, incluyendo el vehículo a editar.
 * @param {Object} navigation - Objeto de navegación para manejar la navegación entre pantallas.
 */
const EditVehicleScreen = ({ route, navigation }) => {
  const { vehicle } = route.params; // Obtiene el vehículo de los parámetros de la ruta

  const [patente, setPatente] = useState(vehicle.patente);
  const [año, setAño] = useState(vehicle.año);
  
  // Obtiene el año actual y genera un array de años desde 1900 hasta el año actual
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1899 }, (_, i) => currentYear - i);

  /**
   * Maneja la actualización de la información del vehículo.
   */
  const handleUpdate = async () => {
  if (!patente || !año) {
    Alert.alert('Error', 'Por favor, completa todos los campos'); // Mensaje de error si faltan campos
    return;
  }

  try {
    await firestore().collection('vehicles').doc(vehicle.id).update({
      patente,
      año,
    });

    Alert.alert('Éxito', 'Información del vehículo actualizada correctamente');
    navigation.navigate('ReadyUse'); // Cambia esta línea para redirigir a ReadyUseScreen
  } catch (error) {
    console.error('Error al actualizar el vehículo:', error);
    Alert.alert('Error', 'No se pudo actualizar la información del vehículo'); // Manejo de errores
  }
};
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.label}>Marca:</Text>
        <Text style={styles.readOnlyText}>{vehicle.marca}</Text>
        
        <Text style={styles.label}>Modelo:</Text>
        <Text style={styles.readOnlyText}>{vehicle.modelo}</Text>
        
        <Text style={styles.label}>Patente:</Text>
        <TextInput
          style={styles.input}
          value={patente}
          onChangeText={setPatente}
        />
        
        <Text style={styles.label}>Año:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={año}
            style={styles.picker}
            onValueChange={(itemValue) => setAño(itemValue)}
          >
            {years.map((year) => (
              <Picker.Item key={year} label={year.toString()} value={year} />
            ))}
          </Picker>
        </View>
        
        <TouchableOpacity style={styles.button} onPress={handleUpdate}>
          <Text style={styles.buttonText}>Actualizar Vehículo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    marginBottom: 5,
    fontSize: 16,
    color: '#333',
  },
  readOnlyText: {
    backgroundColor: '#e0e0e0',
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    lineHeight: 40,
  },
  input: {
    backgroundColor: '#ffffff',
    height: 40,
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  pickerContainer: {
    backgroundColor: '#e8e8e8',
    borderRadius: 8,
    marginBottom: 15,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  button: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#000000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditVehicleScreen;
