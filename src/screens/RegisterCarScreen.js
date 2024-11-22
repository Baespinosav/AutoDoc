import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, SafeAreaView, ScrollView, Image, Animated, Modal, ProgressBarAndroid } from 'react-native'; // Importa ProgressBarAndroid
import { Picker } from '@react-native-picker/picker';
import DocumentPicker from 'react-native-document-picker';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import Logo from '../assets/Logo.png';
import { Platform } from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import RNFS from 'react-native-fs';
import DateTimePicker from '@react-native-community/datetimepicker';
import NotificationService from '../utils/NotificationService';

/**
 * Componente RegisterCar que permite al usuario registrar un nuevo vehículo.
 * Permite seleccionar documentos necesarios y subirlos a Firebase.
 * @returns {JSX.Element} Componente de registro de vehículo.
 */
const RegisterCar = () => {
  const navigation = useNavigation();
  const [marca, setMarca] = useState('Subaru');
  const [modelo, setModelo] = useState('Impreza');
  const [año, setAño] = useState(new Date().getFullYear());
  const [patente, setPatente] = useState({
    parte1: '',
    parte2: '',
    parte3: ''
  });
  const [documents, setDocuments] = useState({
    permisoCirculacion: null,
    soap: null,
    revisionTecnica: null
  });
  const [documentDates, setDocumentDates] = useState({
    permisoCirculacion: null,
    soap: null,
    revisionTecnica: null
  });
  const [showDatePicker, setShowDatePicker] = useState({
    permisoCirculacion: false,
    soap: false,
    revisionTecnica: false
  });
  const [uploadProgress, setUploadProgress] = useState(0); // Estado para el progreso de la subida
  const [isUploading, setIsUploading] = useState(false); // Estado para controlar la visibilidad del modal

  const scaleAnim1 = useRef(new Animated.Value(1)).current;
  const scaleAnim2 = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scaleAnim1, {
            toValue: 1.03,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim1, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(scaleAnim2, {
            toValue: 1.05,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim2, {
            toValue: 0.97,
            duration: 2500,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, []);

  useEffect(() => {
    setupNotifications();
  }, []);

  const setupNotifications = async () => {
    await NotificationService.requestPermission();
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1899 }, (_, i) => currentYear - i);

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
      const reference = storage().ref(storagePath);

      let fileUri = doc.uri;
      if (Platform.OS === 'android' && doc.uri.startsWith('content://')) {
        const destPath = `${RNFS.CachesDirectoryPath}/${doc.name}`;
        await RNFS.copyFile(doc.uri, destPath);
        fileUri = `file://${destPath}`;
      }

      const base64Data = await RNFS.readFile(fileUri, 'base64');

      setIsUploading(true); // Muestra el modal de carga
      setUploadProgress(0); // Reinicia el progreso

      const uploadTask = reference.putString(base64Data, 'base64', { contentType: 'application/pdf' });

      return new Promise((resolve, reject) => {
        uploadTask.on(
          storage.TaskEvent.STATE_CHANGED,
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Progreso de subida ${documentType}: ${progress.toFixed(2)}%`);
            setUploadProgress(progress); // Actualiza el progreso
          },
          (error) => {
            console.error('Error durante la subida:', error);
            setIsUploading(false); // Oculta el modal de carga
            reject(error);
          },
          async () => {
            setIsUploading(false); // Oculta el modal de carga
            console.log('Subida completada');
            try {
              const url = await reference.getDownloadURL();
              console.log('URL de descarga:', url);
              resolve(url);
            } catch (urlError) {
              console.error('Error al obtener la URL de descarga:', urlError);
              reject(urlError);
            }
          }
        );
      });
    } catch (error) {
      console.error(`Error detallado al subir ${documentType}:`, JSON.stringify(error, null, 2));
      throw error;
    }
  };

  const handleDateChange = (event, selectedDate, documentType) => {
    setShowDatePicker(prev => ({
      ...prev,
      [documentType]: false
    }));

    if (selectedDate) {
      setDocumentDates(prev => ({
        ...prev,
        [documentType]: selectedDate
      }));
    }
  };

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

  const registerCar = async () => {
    try {
      // Validar que todas las partes de la patente estén completas
      if (!patente.parte1 || !patente.parte2 || !patente.parte3 || 
          patente.parte1.length !== 2 || patente.parte2.length !== 2 || patente.parte3.length !== 2) {
        Alert.alert('Error', 'Por favor, complete la patente correctamente');
        return;
      }

      const patenteCompleta = `${patente.parte1}-${patente.parte2}-${patente.parte3}`;

      // Validación de campos básicos
      if (!marca || !modelo || !año || !patenteCompleta) {
        Alert.alert('Error', 'Por favor, complete todos los campos obligatorios del vehículo');
        return;
      }

      // Validación de documentos y fechas
      const documentosRequeridos = {
        'Permiso de Circulación': {
          documento: documents.permisoCirculacion,
          fecha: documentDates.permisoCirculacion
        },
        'SOAP': {
          documento: documents.soap,
          fecha: documentDates.soap
        },
        'Revisión Técnica': {
          documento: documents.revisionTecnica,
          fecha: documentDates.revisionTecnica
        }
      };

      // Verificar documentos faltantes
      const documentosFaltantes = Object.entries(documentosRequeridos)
        .filter(([_, value]) => !value.documento || !value.fecha)
        .map(([key, _]) => key);

      if (documentosFaltantes.length > 0) {
        Alert.alert(
          'Documentos Faltantes',
          `Por favor, complete los siguientes documentos y sus fechas de vencimiento:\n\n${documentosFaltantes.join('\n')}`
        );
        return;
      }

      // Si pasa todas las validaciones, continuar con el registro
      const documentUrls = {};
      const documentTypes = ['permisoCirculacion', 'soap', 'revisionTecnica'];

      for (const docType of documentTypes) {
        try {
          const url = await uploadPdf(docType);
          if (url) {
            documentUrls[docType] = url;
          } else {
            throw new Error(`No se pudo obtener la URL para ${docType}`);
          }
        } catch (uploadError) {
          console.error(`Error al subir ${docType}:`, uploadError);
          Alert.alert('Error', `No se pudo subir el documento ${docType}. Por favor, inténtelo de nuevo.`);
          return;
        }
      }

      const docRef = await firestore().collection('vehicles').add({
        marca,
        modelo,
        año: parseInt(año, 10),
        patente: patenteCompleta,
        ...documentUrls,
        documentDates: {
          permisoCirculacion: documentDates.permisoCirculacion?.toISOString(),
          soap: documentDates.soap?.toISOString(),
          revisionTecnica: documentDates.revisionTecnica?.toISOString()
        },
        userId: auth().currentUser.uid,
        createdAt: firestore.FieldValue.serverTimestamp(),
        notificationsSent: {} // Para rastrear notificaciones enviadas
      });

      console.log('Vehículo registrado con ID:', docRef.id);

      // Programar notificaciones para cada documento
      const vehicleInfo = `${marca} ${modelo} (${patenteCompleta})`;

      if (documentDates.permisoCirculacion) {
        await NotificationService.scheduleDocumentNotifications(
          'Permiso de Circulación',
          documentDates.permisoCirculacion,
          vehicleInfo
        );
      }

      if (documentDates.soap) {
        await NotificationService.scheduleDocumentNotifications(
          'SOAP',
          documentDates.soap,
          vehicleInfo
        );
      }

      if (documentDates.revisionTecnica) {
        await NotificationService.scheduleDocumentNotifications(
          'Revisión Técnica',
          documentDates.revisionTecnica,
          vehicleInfo
        );
      }

      // Navegar a la pantalla de detalles del vehículo y pasar las fechas
      navigation.navigate('VehicleDetail', {
        vehicle: {
          id: docRef.id,
          marca,
          modelo,
          año,
          patente: patenteCompleta,
          documentDates: {
            permisoCirculacion: documentDates.permisoCirculacion,
            soap: documentDates.soap,
            revisionTecnica: documentDates.revisionTecnica
          }
        }
      });

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

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.circle1, { transform: [{ scale: scaleAnim1 }] }]} />
      <Animated.View style={[styles.circle2, { transform: [{ scale: scaleAnim2 }] }]} />
      <View style={styles.header}>
        <Image source={Logo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>
          <Text style={styles.boldText}>Auto</Text>Doc
        </Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.registerMessage}>Registra tu vehículo</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={marca}
              style={styles.picker}
              onValueChange={(itemValue) => setMarca(itemValue)}
            >
              <Picker.Item label="Subaru" value="Subaru" color="black"/>
            </Picker>
          </View>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={modelo}
              style={styles.picker}
              onValueChange={(itemValue) => setModelo(itemValue)}
            >
              <Picker.Item label="Impreza" value="Impreza" color="black" />
            </Picker>
          </View>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={año}
              style={styles.picker}
              onValueChange={(itemValue) => setAño(itemValue)}
            >
              {years.map((year) => (
                <Picker.Item key={year} label={year.toString()} value={year} color="black" />
              ))}
            </Picker>
          </View>
          <View style={styles.patenteContainer}>
            <Text style={styles.patenteLabel}>Patente *</Text>
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
          </View>
          <TouchableOpacity style={styles.documentButton} onPress={() => pickDocument('permisoCirculacion')}>
            <Text style={styles.documentButtonText}>Seleccionar Permiso de Circulación *</Text>
          </TouchableOpacity>
          {documents.permisoCirculacion && (
            <>
              <Text style={styles.documentName}>Documento seleccionado: {documents.permisoCirculacion.name}</Text>
              <TouchableOpacity 
                style={[styles.dateButton, !documentDates.permisoCirculacion && styles.dateButtonRequired]}
                onPress={() => setShowDatePicker(prev => ({...prev, permisoCirculacion: true}))}
              >
                <Text style={[styles.dateButtonText, !documentDates.permisoCirculacion && styles.dateButtonTextRequired]}>
                  {documentDates.permisoCirculacion 
                    ? `Fecha de vencimiento: ${documentDates.permisoCirculacion.toLocaleDateString()}`
                    : 'Seleccionar fecha de vencimiento *'}
                </Text>
              </TouchableOpacity>
              {showDatePicker.permisoCirculacion && (
                <DateTimePicker
                  value={documentDates.permisoCirculacion || new Date()}
                  mode="date"
                  onChange={(event, date) => handleDateChange(event, date, 'permisoCirculacion')}
                />
              )}
            </>
          )}
          <TouchableOpacity style={styles.documentButton} onPress={() => pickDocument('soap')}>
            <Text style={styles.documentButtonText}>Seleccionar SOAP *</Text>
          </TouchableOpacity>
          {documents.soap && (
            <>
              <Text style={styles.documentName}>Documento seleccionado: {documents.soap.name}</Text>
              <TouchableOpacity 
                style={[styles.dateButton, !documentDates.soap && styles.dateButtonRequired]}
                onPress={() => setShowDatePicker(prev => ({...prev, soap: true}))}
              >
                <Text style={[styles.dateButtonText, !documentDates.soap && styles.dateButtonTextRequired]}>
                  {documentDates.soap 
                    ? `Fecha de vencimiento: ${documentDates.soap.toLocaleDateString()}`
                    : 'Seleccionar fecha de vencimiento *'}
                </Text>
              </TouchableOpacity>
              {showDatePicker.soap && (
                <DateTimePicker
                  value={documentDates.soap || new Date()}
                  mode="date"
                  onChange={(event, date) => handleDateChange(event, date, 'soap')}
                />
              )}
            </>
          )}
          <TouchableOpacity style={styles.documentButton} onPress={() => pickDocument('revisionTecnica')}>
            <Text style={styles.documentButtonText}>Seleccionar Revisión Técnica *</Text>
          </TouchableOpacity>
          {documents.revisionTecnica && (
            <>
              <Text style={styles.documentName}>Documento seleccionado: {documents.revisionTecnica.name}</Text>
              <TouchableOpacity 
                style={[styles.dateButton, !documentDates.revisionTecnica && styles.dateButtonRequired]}
                onPress={() => setShowDatePicker(prev => ({...prev, revisionTecnica: true}))}
              >
                <Text style={[styles.dateButtonText, !documentDates.revisionTecnica && styles.dateButtonTextRequired]}>
                  {documentDates.revisionTecnica 
                    ? `Fecha de vencimiento: ${documentDates.revisionTecnica.toLocaleDateString()}`
                    : 'Seleccionar fecha de vencimiento *'}
                </Text>
              </TouchableOpacity>
              {showDatePicker.revisionTecnica && (
                <DateTimePicker
                  value={documentDates.revisionTecnica || new Date()}
                  mode="date"
                  onChange={(event, date) => handleDateChange(event, date, 'revisionTecnica')}
                />
              )}
            </>
          )}
          <Text style={styles.requiredFieldsNote}>* Campos obligatorios</Text>
          <TouchableOpacity style={styles.registerButton} onPress={registerCar}>
            <Text style={styles.registerButtonText}>Registrar Vehículo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal de carga */}
      <Modal
        visible={isUploading}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Subiendo documentos</Text>
            <ProgressBarAndroid
              styleAttr="Horizontal"
              indeterminate={false}
              progress={uploadProgress / 100}
            />
            <Text style={styles.progressText}>{uploadProgress.toFixed(0)}%</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  circle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#e8f4fd',
    top: -200,
    left: -50,
    zIndex: 1,
  },
  circle2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#d1e8fa',
    top: -180,
    right: -100,
    zIndex: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    zIndex: 3,
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    zIndex: 3,
  },
  formContainer: {
    width: '100%',
  },
  registerMessage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
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
  input: {
    backgroundColor: '#e8e8e8',
    width: '100%',
    height: 50,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#000',
  },
  documentButton: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#000000',
  },
  documentButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  documentName: {
    marginVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  registerButton: {
    backgroundColor: '#001f3f', // Azul muy oscuro, casi negro
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#000000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000000',
  },
  progressText: {
    marginTop: 10,
    fontSize: 16,
    color: '#000000',
  },
  dateButton: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  dateButtonText: {
    color: '#333',
    fontSize: 14,
  },
  dateButtonRequired: {
    borderColor: 'red',
    borderWidth: 1,
  },
  dateButtonTextRequired: {
    color: 'red',
  },
  requiredFieldsNote: {
    marginTop: 10,
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  patenteContainer: {
    marginBottom: 15,
  },
  patenteLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  patenteInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
});

export default RegisterCar;
