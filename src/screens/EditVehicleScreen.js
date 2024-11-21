<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
=======
import React, { useState } from 'react';
>>>>>>> 423064b24f0fabcfa68185da5ab885d92d97dea2
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

<<<<<<< HEAD
  // Separar la patente existente en sus partes
  const [patente, setPatente] = useState(() => {
    const partes = vehicle.patente.split('-');
    return {
      parte1: partes[0] || '',
      parte2: partes[1] || '',
      parte3: partes[2] || ''
    };
  });
=======
  const [patente, setPatente] = useState(vehicle.patente);
>>>>>>> 423064b24f0fabcfa68185da5ab885d92d97dea2
  const [año, setAño] = useState(vehicle.año);
  
  // Obtiene el año actual y genera un array de años desde 1900 hasta el año actual
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1899 }, (_, i) => currentYear - i);

<<<<<<< HEAD
  // Función de validación para cada parte
  const validarPatente = (texto, parte) => {
    const soloLetras = /^[A-Z]*$/;
    const letrasNumeros = /^[A-Z0-9]*$/;
    const soloNumeros = /^[0-9]*$/;

    switch (parte) {
      case 'parte1':
        return soloLetras.test(texto);
      case 'parte2':
        return letrasNumeros.test(texto);
      case 'parte3':
        return soloNumeros.test(texto);
      default:
        return false;
    }
  };

=======
>>>>>>> 423064b24f0fabcfa68185da5ab885d92d97dea2
  /**
   * Maneja la actualización de la información del vehículo.
   */
  const handleUpdate = async () => {
<<<<<<< HEAD
    // Validar que todas las partes de la patente estén completas
    if (!patente.parte1 || !patente.parte2 || !patente.parte3 || 
        patente.parte1.length !== 2 || patente.parte2.length !== 2 || patente.parte3.length !== 2) {
      Alert.alert('Error', 'Por favor, complete la patente correctamente');
      return;
    }

    if (!año) {
      Alert.alert('Error', 'Por favor, complete todos los campos');
      return;
    }

    try {
      const patenteCompleta = `${patente.parte1}-${patente.parte2}-${patente.parte3}`;
      
      await firestore().collection('vehicles').doc(vehicle.id).update({
        patente: patenteCompleta,
        año,
      });

      Alert.alert('Éxito', 'Información del vehículo actualizada correctamente');
      navigation.navigate('ReadyUse'); // Cambia esta línea para redirigir a ReadyUseScreen
    } catch (error) {
      console.error('Error al actualizar el vehículo:', error);
      Alert.alert('Error', 'No se pudo actualizar la información del vehículo'); // Manejo de errores
    }
  };
=======
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
>>>>>>> 423064b24f0fabcfa68185da5ab885d92d97dea2
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.label}>Marca:</Text>
        <Text style={styles.readOnlyText}>{vehicle.marca}</Text>
        
        <Text style={styles.label}>Modelo:</Text>
        <Text style={styles.readOnlyText}>{vehicle.modelo}</Text>
        
        <Text style={styles.label}>Patente:</Text>
<<<<<<< HEAD
        <View style={styles.patenteInputContainer}>
          <TextInput
            style={styles.patenteInput}
            value={patente.parte1}
            maxLength={2}
            autoCapitalize="characters"
            onChangeText={(texto) => {
              const textoMayusculas = texto.toUpperCase();
              if (validarPatente(textoMayusculas, 'parte1')) {
                setPatente(prev => ({ ...prev, parte1: textoMayusculas }));
              }
            }}
            placeholder="AA"
            placeholderTextColor="#7f8c8d"
          />
          <Text style={styles.patenteSeparator}>-</Text>
          <TextInput
            style={styles.patenteInput}
            value={patente.parte2}
            maxLength={2}
            autoCapitalize="characters"
            onChangeText={(texto) => {
              const textoMayusculas = texto.toUpperCase();
              if (validarPatente(textoMayusculas, 'parte2')) {
                setPatente(prev => ({ ...prev, parte2: textoMayusculas }));
              }
            }}
            placeholder="BB"
            placeholderTextColor="#7f8c8d"
          />
          <Text style={styles.patenteSeparator}>-</Text>
          <TextInput
            style={styles.patenteInput}
            value={patente.parte3}
            maxLength={2}
            keyboardType="numeric"
            onChangeText={(texto) => {
              if (validarPatente(texto, 'parte3')) {
                setPatente(prev => ({ ...prev, parte3: texto }));
              }
            }}
            placeholder="12"
            placeholderTextColor="#7f8c8d"
          />
        </View>
=======
        <TextInput
          style={styles.input}
          value={patente}
          onChangeText={setPatente}
        />
>>>>>>> 423064b24f0fabcfa68185da5ab885d92d97dea2
        
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
<<<<<<< HEAD
  patenteInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  patenteInput: {
    backgroundColor: '#e8e8e8',
    width: 60,
    height: 50,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    color: '#000',
    fontWeight: 'bold',
  },
  patenteSeparator: {
    fontSize: 24,
    marginHorizontal: 5,
    color: '#333',
    fontWeight: 'bold',
  },
=======
>>>>>>> 423064b24f0fabcfa68185da5ab885d92d97dea2
});

export default EditVehicleScreen;
