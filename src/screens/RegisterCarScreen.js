import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import DocumentPicker from 'react-native-document-picker';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import RNFS from 'react-native-fs';
import { Platform } from 'react-native';
import Logo from '../assets/Logo.png';

const RegisterCar = () => {
  const navigation = useNavigation();
  const [marca, setMarca] = useState('Subaru');
  const [modelo, setModelo] = useState('Impreza');
  const [año, setAño] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [documents, setDocuments] = useState({
    permisoCirculacion: null,
    soap: null,
    revisionTecnica: null
  });

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setAño(selectedDate);
    }
  };

  const pickDocument = async (documentType) => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
      });
      setDocuments(prev => ({
        ...prev,
        [documentType]: {
          uri: result[0].uri,
          name: result[0].name
        }
      }));
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled the picker');
      } else {
        console.error('Error al seleccionar el documento:', err);
        Alert.alert('Error', 'No se pudo seleccionar el documento');
      }
    }
  };

  const uploadPdf = async (documentType) => {
    const doc = documents[documentType];
    if (!doc) {
      console.log(`No hay documento para ${documentType}`);
      return null;
    }
    try {
      console.log(`Iniciando subida de ${documentType}...`);
      const timestamp = Date.now();
      const storagePath = `vehicle_documents/${auth().currentUser.uid}/${timestamp}_${doc.name}`;
      console.log('Ruta de almacenamiento:', storagePath);

      const reference = storage().ref(storagePath);
      console.log('Referencia creada:', reference.fullPath);

      console.log('Preparando archivo para subir...');
      console.log('URI del archivo:', doc.uri);
      
      let filePath = doc.uri;
      if (Platform.OS === 'android' && doc.uri.startsWith('content://')) {
        try {
          const stat = await RNFS.stat(doc.uri);
          filePath = stat.path;
          console.log('Ruta del archivo en Android (desde stat):', filePath);
        } catch (statError) {
          console.log('Error al obtener stat:', statError);
          // Si falla stat, intentamos copiar el archivo a una ubicación temporal
          const tempFilePath = `${RNFS.CachesDirectoryPath}/${doc.name}`;
          await RNFS.copyFile(doc.uri, tempFilePath);
          filePath = tempFilePath;
          console.log('Ruta del archivo en Android (copiado):', filePath);
        }
      }

      // Verificar si el archivo existe
      const fileExists = await RNFS.exists(filePath);
      console.log('¿El archivo existe?', fileExists);

      if (!fileExists) {
        throw new Error('El archivo no existe en la ruta especificada');
      }

      console.log('Subiendo archivo...');
      const task = reference.putFile(filePath);

      return new Promise((resolve, reject) => {
        task.on('state_changed', 
          (snapshot) => {
            console.log(`${snapshot.bytesTransferred} transferidos de ${snapshot.totalBytes}`);
          },
          (error) => {
            console.error('Error durante la subida:', error);
            reject(error);
          },
          async () => {
            console.log('Subida completada');
            const url = await reference.getDownloadURL();
            console.log('URL de descarga:', url);
            resolve(url);
          }
        );
      });
    } catch (error) {
      console.error(`Error detallado al subir ${documentType}:`, JSON.stringify(error, null, 2));
      return null;
    }
  };

  const registerCar = async () => {
    try {
      if (!marca || !modelo || !año) {
        Alert.alert('Error', 'Por favor, complete los campos obligatorios');
        return;
      }

      const documentUrls = {};
      const documentTypes = ['permisoCirculacion', 'soap', 'revisionTecnica'];

      for (const docType of documentTypes) {
        if (documents[docType]) {
          const url = await uploadPdf(docType);
          if (url) {
            documentUrls[docType] = url;
          } else {
            console.log(`No se pudo subir el documento ${docType}`);
          }
        } else {
          console.log(`No se seleccionó documento para ${docType}`);
        }
      }

      const docRef = await firestore().collection('vehicles').add({
        marca,
        modelo,
        año: firestore.Timestamp.fromDate(año),
        ...documentUrls,
        userId: auth().currentUser.uid,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      console.log('Vehículo registrado con ID:', docRef.id);

      Alert.alert(
        'Éxito',
        'Vehículo registrado correctamente',
        [{ text: 'OK', onPress: () => navigation.navigate('ReadyUse', { refreshVehicles: true }) }]
      );
    } catch (error) {
      console.error('Error al registrar vehículo:', error);
      Alert.alert('Error', 'No se pudo registrar el vehículo: ' + error.message);
    }
  };

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AutoDoc</Text>
        <Image source={Logo} style={styles.logo} resizeMode="contain" />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Picker
            selectedValue={marca}
            style={styles.picker}
            onValueChange={(itemValue) => setMarca(itemValue)}
          >
            <Picker.Item label="Subaru" value="Subaru" />
          </Picker>
          <Picker
            selectedValue={modelo}
            style={styles.picker}
            onValueChange={(itemValue) => setModelo(itemValue)}
          >
            <Picker.Item label="Impreza" value="Impreza" />
          </Picker>
          <TouchableOpacity style={styles.button} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.buttonText}>{`Seleccionar Año: ${año.getFullYear()}`}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={año}
              mode={'date'}
              display="default"
              onChange={onChangeDate}
            />
          )}
          <TouchableOpacity style={styles.button} onPress={() => pickDocument('permisoCirculacion')}>
            <Text style={styles.buttonText}>Seleccionar Permiso de Circulación</Text>
          </TouchableOpacity>
          {documents.permisoCirculacion && <Text style={styles.documentName}>Documento seleccionado: {documents.permisoCirculacion.name}</Text>}
          <TouchableOpacity style={styles.button} onPress={() => pickDocument('soap')}>
            <Text style={styles.buttonText}>Seleccionar SOAP</Text>
          </TouchableOpacity>
          {documents.soap && <Text style={styles.documentName}>Documento seleccionado: {documents.soap.name}</Text>}
          <TouchableOpacity style={styles.button} onPress={() => pickDocument('revisionTecnica')}>
            <Text style={styles.buttonText}>Seleccionar Revisión Técnica</Text>
          </TouchableOpacity>
          {documents.revisionTecnica && <Text style={styles.documentName}>Documento seleccionado: {documents.revisionTecnica.name}</Text>}
          <TouchableOpacity style={styles.button} onPress={registerCar}>
            <Text style={styles.buttonText}>Registrar Vehículo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={goBack}>
            <Text style={styles.buttonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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
  picker: {
    height: 50,
    width: '100%',
    backgroundColor: '#e8e8e8',
    marginBottom: 15,
    borderRadius: 25,
  },
  button: {
    backgroundColor: '#2c3e50',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  documentName: {
    marginVertical: 10,
    fontSize: 16,
    color: '#333',
  },
  backButton: {
    backgroundColor: '#ae0404',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
});

export default RegisterCar;
