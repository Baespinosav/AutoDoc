import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, SafeAreaView, Dimensions, TouchableOpacity, Image, ScrollView } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import Pdf from 'react-native-pdf';
import RNBlobUtil from 'react-native-blob-util';
import SubaruImage from '../assets/subaru.png';
import Logo from '../assets/Logo.png';

// Agregar esta función auxiliar al inicio del archivo, antes del componente
const calcularDiasRestantes = (fechaVencimiento) => {
  if (!fechaVencimiento) return null;
  
  const hoy = new Date();
  const vencimiento = new Date(fechaVencimiento);
  const diferencia = vencimiento - hoy;
  const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  return dias;
};

const formatearFecha = (fecha) => {
  if (!fecha) return 'Fecha no disponible';
  const date = new Date(fecha);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Componente VehicleDetailScreen que muestra los detalles de un vehículo.
 * Permite al usuario ver documentos asociados y eliminar el vehículo.
 * @param {Object} route - Propiedades de la ruta, incluyendo el vehículo.
 * @param {Object} navigation - Objeto de navegación para manejar la navegación entre pantallas.
 */
const VehicleDetailScreen = ({ route, navigation }) => {
  const { vehicle } = route.params; // Obtiene el vehículo de los parámetros de la ruta

  const [showPdf, setShowPdf] = useState(false); // Estado para controlar la visualización del PDF
  const [localPdfPath, setLocalPdfPath] = useState(null); // Estado para almacenar la ruta local del PDF
  const [currentPage, setCurrentPage] = useState(1); // Estado para almacenar la página actual del PDF

  const renderDiasRestantes = (fechaVencimiento) => {
    const dias = calcularDiasRestantes(fechaVencimiento);
    if (dias === null) return null;

    return (
      <Text style={[styles.diasRestantes, { color: '#000000' }]}>
        {dias > 0 
          ? `Faltan ${dias} días para vencer`
          : `Vencido hace ${Math.abs(dias)} días`}
      </Text>
    );
  };

  /**
   * Descarga y abre un documento PDF asociado al vehículo.
   * @param {string} documentType - Tipo de documento a descargar (permisoCirculacion, soap, revisionTecnica).
   */
  const downloadAndOpenPdf = async (documentType) => {
    const pdfUrl = vehicle[documentType]; // Obtiene la URL del PDF
    if (pdfUrl) {
      try {
        const { path } = await RNBlobUtil.config({
          fileCache: true,
          appendExt: 'pdf'
        }).fetch('GET', pdfUrl); // Descarga el PDF
        setLocalPdfPath(path); // Establece la ruta local del PDF
        setShowPdf(true); // Muestra el PDF
      } catch (error) {
        console.error('Error al descargar el PDF:', error);
        Alert.alert('Error', 'No se pudo descargar el PDF'); // Manejo de errores
      }
    } else {
      Alert.alert('Información', 'No hay documento PDF asociado a este vehículo'); // Mensaje si no hay PDF
    }
  };

  /**
   * Elimina el vehículo de Firestore y sus documentos asociados de Firebase Storage.
   */
  const deleteVehicle = async () => {
    Alert.alert(
      "Eliminar Vehículo",
      "¿Estás seguro de que quieres eliminar este vehículo?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              // Primero eliminar los documentos de Storage si existen
              const documentTypes = ['permisoCirculacion', 'soap', 'revisionTecnica'];
              
              for (const docType of documentTypes) {
                if (vehicle[docType]) {
                  try {
                    await storage().refFromURL(vehicle[docType]).delete();
                  } catch (storageError) {
                    console.log(`Archivo ${docType} no encontrado o ya eliminado:`, storageError);
                    // Continuamos con la ejecución aunque el archivo no exista
                  }
                }
              }

              // Eliminar el documento de Firestore
              await firestore().collection('vehicles').doc(vehicle.id).delete();
              
              Alert.alert(
                "Éxito",
                "Vehículo eliminado correctamente",
                [{ text: "OK", onPress: () => navigation.goBack() }]
              );
            } catch (error) {
              console.error('Error al eliminar el vehículo:', error);
              Alert.alert(
                "Error",
                "No se pudo completar la eliminación del vehículo"
              );
            }
          },
        },
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
              <TouchableOpacity 
                style={styles.editButton} 
                onPress={() => navigation.navigate('EditVehicle', { vehicle })} // Navega a la pantalla de edición
              >
                <Text style={styles.editButtonText}>Editar</Text>
              </TouchableOpacity>
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
            
            <View style={styles.documentContainer}>
              <TouchableOpacity style={styles.viewButton} onPress={() => downloadAndOpenPdf('permisoCirculacion')}>
                <Text style={styles.viewButtonText}>Ver Permiso de Circulación</Text>
              </TouchableOpacity>
              <Text style={[styles.diasRestantes, { color: '#000000' }]}>
                {calcularDiasRestantes(vehicle.documentDates.permisoCirculacion) !== null 
                  ? `Faltan ${calcularDiasRestantes(vehicle.documentDates.permisoCirculacion)} días para vencer`
                  : 'Fecha no disponible'}
              </Text>

              <TouchableOpacity style={styles.viewButton} onPress={() => downloadAndOpenPdf('soap')}>
                <Text style={styles.viewButtonText}>Ver SOAP</Text>
              </TouchableOpacity>
              <Text style={[styles.diasRestantes, { color: '#000000' }]}>
                {calcularDiasRestantes(vehicle.documentDates.soap) !== null 
                  ? `Faltan ${calcularDiasRestantes(vehicle.documentDates.soap)} días para vencer`
                  : 'Fecha no disponible'}
              </Text>

              <TouchableOpacity style={styles.viewButton} onPress={() => downloadAndOpenPdf('revisionTecnica')}>
                <Text style={styles.viewButtonText}>Ver Revisión Técnica</Text>
              </TouchableOpacity>
              <Text style={[styles.diasRestantes, { color: '#000000' }]}>
                {calcularDiasRestantes(vehicle.documentDates.revisionTecnica) !== null 
                  ? `Faltan ${calcularDiasRestantes(vehicle.documentDates.revisionTecnica)} días para vencer`
                  : 'Fecha no disponible'}
              </Text>
            </View>

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
            source={{ uri: `file://${localPdfPath}` }} // Carga el PDF desde la ruta local
            style={styles.pdf}
            onLoadComplete={(numberOfPages,filePath) => {
              console.log(`Número de páginas: ${numberOfPages}`);
            }}
            onPageChanged={(page,numberOfPages) => {
              console.log(`Página actual: ${page}`);
              setCurrentPage(page); // Actualiza la página actual
            }}
            onError={(error) => {
              console.log('Error al cargar PDF:', error);
              Alert.alert('Error', 'No se pudo cargar el PDF'); // Manejo de errores
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
  editButton: {
    position: 'absolute',
    top: -45, // Ajustamos la posición un poco más arriba
    right: 80, // Ajusta la posición horizontal
    backgroundColor: '#3498db', // Color azul para el botón de editar
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  editButtonText: {
    fontSize: 14,
    color: '#ffffff', // Texto blanco para contrastar con el fondo azul
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
  documentContainer: {
    width: '100%',
    marginBottom: 10,
  },
  diasRestantes: {
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 15,
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  fechaVencimiento: {
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 15,
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic'
  }
});

export default VehicleDetailScreen;