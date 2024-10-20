import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, SafeAreaView, Dimensions, TouchableOpacity, Image, ScrollView } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import Pdf from 'react-native-pdf';
import RNBlobUtil from 'react-native-blob-util';
import SubaruImage from '../assets/subaru.png';
import Logo from '../assets/Logo.png';

const VehicleDetailScreen = ({ route, navigation }) => {
  const { vehicle } = route.params;

  const [showPdf, setShowPdf] = useState(false);
  const [localPdfPath, setLocalPdfPath] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const downloadAndOpenPdf = async (documentType) => {
    const pdfUrl = vehicle[documentType];
    if (pdfUrl) {
      try {
        const { path } = await RNBlobUtil.config({
          fileCache: true,
          appendExt: 'pdf'
        }).fetch('GET', pdfUrl);
        setLocalPdfPath(path);
        setShowPdf(true);
      } catch (error) {
        console.error('Error al descargar el PDF:', error);
        Alert.alert('Error', 'No se pudo descargar el PDF');
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
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: async () => {
          try {
            await firestore().collection('vehicles').doc(vehicle.id).delete();
            if (vehicle.permisoCirculacion) await storage().refFromURL(vehicle.permisoCirculacion).delete();
            if (vehicle.soap) await storage().refFromURL(vehicle.soap).delete();
            if (vehicle.revisionTecnica) await storage().refFromURL(vehicle.revisionTecnica).delete();
            Alert.alert("Éxito", "Vehículo eliminado correctamente");
            navigation.goBack();
          } catch (error) {
            console.error('Error al eliminar el vehículo:', error);
            Alert.alert("Error", "No se pudo eliminar el vehículo");
          }
        }}
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {!showPdf ? (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image source={Logo} style={styles.logo} resizeMode="contain" />
              <Text style={styles.headerTitle}>
                <Text style={styles.boldText}>Auto</Text>Doc
              </Text>
            </View>
          </View>
          <View style={styles.content}>
            <View style={styles.imageWrapper}>
              <TouchableOpacity style={styles.deleteButton} onPress={deleteVehicle}>
                <Text style={styles.deleteButtonText}>Eliminar</Text>
              </TouchableOpacity>
              <View style={styles.imageContainer}>
                <Image source={SubaruImage} style={styles.image} resizeMode="contain" />
              </View>
            </View>
            <Text style={styles.title}>{vehicle.marca} {vehicle.modelo}</Text>
            <Text style={styles.patenteText}>{vehicle.patente}</Text>
            <Text style={styles.detail}>Año: {vehicle.año}</Text>
            
            <TouchableOpacity style={styles.viewButton} onPress={() => downloadAndOpenPdf('permisoCirculacion')}>
              <Text style={styles.viewButtonText}>Ver Permiso de Circulación</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.viewButton} onPress={() => downloadAndOpenPdf('soap')}>
              <Text style={styles.viewButtonText}>Ver SOAP</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.viewButton} onPress={() => downloadAndOpenPdf('revisionTecnica')}>
              <Text style={styles.viewButtonText}>Ver Revisión Técnica</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.chatbotButton} 
              onPress={() => navigation.navigate('ChatbotSelection', { vehicle: vehicle })}
            >
              <Text style={styles.chatbotButtonText}>CHATBOT</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Text style={styles.backButtonText}>Volver</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.pdfContainer}>
          <Pdf
            source={{ uri: `file://${localPdfPath}` }}
            style={styles.pdf}
            onLoadComplete={(numberOfPages,filePath) => {
              console.log(`Número de páginas: ${numberOfPages}`);
            }}
            onPageChanged={(page,numberOfPages) => {
              console.log(`Página actual: ${page}`);
              setCurrentPage(page);
            }}
            onError={(error) => {
              console.log('Error al cargar PDF:', error);
              Alert.alert('Error', 'No se pudo cargar el PDF');
            }}
          />
          <TouchableOpacity style={styles.closeButton} onPress={() => setShowPdf(false)}>
            <Text style={styles.buttonText}>Cerrar PDF</Text>
          </TouchableOpacity>
          <Text style={styles.pageIndicator}>Página {currentPage}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  headerTitle: {
    fontSize: 24,
    color: '#333',
  },
  boldText: {
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  imageWrapper: {
    width: '100%',
    position: 'relative',
    marginBottom: 20,
    marginTop: 45, // Aumentamos ligeramente el margen superior
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  patenteText: {
    fontSize: 18,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  detail: {
    fontSize: 18,
    color: '#34495e',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  chatbotButton: {
    backgroundColor: '#001f3f', // Azul muy oscuro, casi negro
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  chatbotButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    position: 'absolute',
    top: -45, // Ajustamos la posición un poco más arriba
    right: 0,
    backgroundColor: '#ff0000',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  deleteButtonText: {
    fontSize: 14,
    color: '#ffffff', // Texto blanco para contrastar con el fondo rojo
    fontWeight: 'bold',
  },
  viewButton: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
    borderWidth: 1,
    borderColor: '#000000',
  },
  viewButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#000000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pdfContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 20,
  },
  pageIndicator: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 5,
    borderRadius: 10,
    color: 'white',
  },
});

export default VehicleDetailScreen;
