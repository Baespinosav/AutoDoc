import React, { useState } from 'react';
import { View, Button, TextInput, Alert, Text } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const VehicleRegistration = () => {
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [año, setAño] = useState('');
  const [pdfUri, setPdfUri] = useState(null);
  const [pdfName, setPdfName] = useState('');

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
      });
      console.log('Documento seleccionado:', JSON.stringify(result));
      setPdfUri(result[0].uri);
      setPdfName(result[0].name);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('Usuario canceló la selección');
      } else {
        console.error('Error al seleccionar documento:', err);
      }
    }
  };

  const uploadPdf = async () => {
    if (!pdfUri) return null;
    try {
      const timestamp = Date.now();
      const storagePath = `vehicleDocs/${auth().currentUser.uid}/${timestamp}_${pdfName}`;
      console.log('Ruta de almacenamiento:', storagePath);

      const reference = storage().ref(storagePath);
      console.log('Referencia creada:', reference.fullPath);

      console.log('Subiendo archivo...');
      const task = reference.putFile(pdfUri);

      // Monitorear el progreso de la subida
      task.on('state_changed', taskSnapshot => {
        console.log(`${taskSnapshot.bytesTransferred} transferidos de ${taskSnapshot.totalBytes}`);
      });

      // Esperar a que se complete la subida
      const snapshot = await task;
      console.log('Archivo subido exitosamente. Snapshot:', JSON.stringify(snapshot));

      // Construir la URL manualmente
      const bucket = storage().app.options.storageBucket || 'tu-proyecto.appspot.com'; // Reemplaza con tu bucket si es necesario
      const manualUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(storagePath)}?alt=media`;
      console.log('URL construida manualmente:', manualUrl);

      return manualUrl;
    } catch (error) {
      console.error('Error al subir PDF:', error);
      return null;
    }
  };

  const registerVehicle = async () => {
    try {
      const pdfUrl = await uploadPdf();
      if (!pdfUrl) {
        throw new Error('No se pudo subir el documento PDF');
      }

      await firestore().collection('vehicles').add({
        marca,
        modelo,
        año: parseInt(año),
        documentUrl: pdfUrl,
        userId: auth().currentUser.uid,
      });

      Alert.alert('Éxito', 'Vehículo registrado correctamente');
      // Limpiar los campos después del registro exitoso
      setMarca('');
      setModelo('');
      setAño('');
      setPdfUri(null);
      setPdfName('');
    } catch (error) {
      console.error('Error al registrar vehículo:', error);
      Alert.alert('Error', 'No se pudo registrar el vehículo: ' + error.message);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Marca"
        value={marca}
        onChangeText={setMarca}
      />
      <TextInput
        placeholder="Modelo"
        value={modelo}
        onChangeText={setModelo}
      />
      <TextInput
        placeholder="Año"
        value={año}
        onChangeText={setAño}
        keyboardType="numeric"
      />
      <Button title="Seleccionar Documento" onPress={pickDocument} />
      {pdfName ? <Text>Documento seleccionado: {pdfName}</Text> : null}
      <Button title="Registrar Vehículo" onPress={registerVehicle} />
    </View>
  );
};

export default VehicleRegistration;
