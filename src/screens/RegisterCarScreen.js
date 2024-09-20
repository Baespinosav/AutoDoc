import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, SafeAreaView, ScrollView, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import DocumentPicker from 'react-native-document-picker';
import RNBlobUtil from 'react-native-blob-util';
import Logo from '../assets/Logo.png';

function RegisterCarScreen({ navigation }) {
  const [modelo, setModelo] = useState('Impreza');
  const [marca, setMarca] = useState('Subaru');
  const [año, setAño] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [user, setUser] = useState(null);
  const [pdfUri, setPdfUri] = useState(null);
  const [pdfName, setPdfName] = useState('');

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
      });
      console.log('Documento seleccionado:', result);
      setPdfUri(result[0].uri);
      setPdfName(result[0].name);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled the picker');
      } else {
        console.error('Error al seleccionar el documento:', err);
        Alert.alert('Error', 'No se pudo seleccionar el documento: ' + err.message);
      }
    }
  };

  const uploadPdf = async (userId) => {
    if (!pdfUri) {
      console.log('No se ha seleccionado ningún PDF');
      return null;
    }

    const filename = pdfName || 'documento.pdf';

    try {
      const timestamp = new Date().getTime();
      const storagePath = `vehicle_documents/${userId}/${timestamp}_${filename}`;
      console.log('Ruta de almacenamiento:', storagePath);

      const reference = storage().ref(storagePath);
      console.log('Referencia creada:', reference.fullPath);

      let uploadTask;
      if (Platform.OS === 'android') {
        console.log('Subiendo archivo en Android');
        const fileContent = await RNBlobUtil.fs.readFile(pdfUri, 'base64');
        uploadTask = reference.putString(fileContent, 'base64', { contentType: 'application/pdf' });
      } else {
        console.log('Subiendo archivo en iOS');
        uploadTask = reference.putFile(pdfUri);
      }

      const snapshot = await uploadTask;
      console.log('Archivo subido exitosamente');

      const url = await snapshot.ref.getDownloadURL();
      console.log('URL de descarga:', url);

      return { url, filename: storagePath };
    } catch (error) {
      console.error('Error detallado al subir el PDF:', error);
      throw error;
    }
  };

  const handleRegister = async () => {
    const user = auth().currentUser;
    if (!user) {
      Alert.alert('Error', 'No hay usuario autenticado');
      return;
    }

    try {
      let pdfData = null;
      if (pdfUri) {
        console.log('Intentando subir PDF...');
        console.log('URI del PDF:', pdfUri);
        console.log('Nombre del PDF:', pdfName);
        pdfData = await uploadPdf(user.uid);
        console.log('Resultado de la subida del PDF:', pdfData);
      }

      const vehicleData = {
        marca,
        modelo,
        año: año.toISOString(),
        userId: user.uid,
        documentoPdf: pdfData,
      };

      const docRef = await firestore().collection('vehicles').add(vehicleData);
      console.log('Vehículo registrado con ID:', docRef.id);

      Alert.alert('Éxito', 'Vehículo registrado correctamente');
      navigation.goBack();
    } catch (error) {
      console.error('Error al registrar el vehículo:', error);
      Alert.alert('Error', 'No se pudo registrar el vehículo: ' + error.message);
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Cargando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AutoDoc</Text>
        <Image source={Logo} style={styles.logo} resizeMode="contain" />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={marca}
              onValueChange={(itemValue) => setMarca(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Subaru" value="Subaru" />
              {/* Agrega más marcas aquí si es necesario */}
            </Picker>
          </View>

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={modelo}
              onValueChange={(itemValue) => setModelo(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Impreza" value="Impreza" />
              {/* Agrega más modelos aquí si es necesario */}
            </Picker>
          </View>

          <TouchableOpacity style={styles.button} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.buttonText}>Seleccionar Año</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={año}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selectedDate) setAño(selectedDate);
              }}
            />
          )}

          <TouchableOpacity style={styles.button} onPress={pickDocument}>
            <Text style={styles.buttonText}>Seleccionar PDF</Text>
          </TouchableOpacity>
          {pdfName ? <Text style={styles.pdfName}>Documento seleccionado: {pdfName}</Text> : null}

          <TouchableOpacity style={[styles.button, styles.registerButton]} onPress={handleRegister}>
            <Text style={styles.buttonText}>Registrar Vehículo</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  backButton: {
    padding: 10,
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
  logo: {
    width: 150,
    height: 150,
  },
  formContainer: {
    width: '100%',
  },
  pickerContainer: {
    backgroundColor: '#e8e8e8',
    borderRadius: 25,
    marginBottom: 15,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  button: {
    backgroundColor: '#2c3e50',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
  },
  registerButton: {
    backgroundColor: '#34495e',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pdfName: {
    marginBottom: 15,
    fontSize: 16,
    color: '#2c3e50',
    textAlign: 'center',
  },
});

export default RegisterCarScreen;
