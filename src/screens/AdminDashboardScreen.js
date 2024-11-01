import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, PermissionsAndroid, Platform } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import RNHTMLtoPDF from 'react-native-html-to-pdf';

const AdminDashboardScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: "Permiso de almacenamiento",
            message: "La aplicación necesita acceso al almacenamiento para guardar PDFs",
            buttonNeutral: "Preguntar luego",
            buttonNegative: "Cancelar",
            buttonPositive: "OK"
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const generatePDF = async (title, data) => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: "Permiso de almacenamiento",
            message: "La aplicación necesita acceso al almacenamiento para guardar PDFs",
            buttonNeutral: "Preguntar luego",
            buttonNegative: "Cancelar",
            buttonPositive: "OK"
          }
        );
        
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Error', 'Se necesitan permisos de almacenamiento para generar el PDF');
          return;
        }
      }

      const formatData = (title, data) => {
        if (title.includes('Usuarios')) {
          return `
            <div class="content">
              <p class="report-text">
                Actualmente la aplicación cuenta con <strong>${data.totalUsuarios}</strong> usuarios registrados.
              </p>
            </div>
          `;
        } else if (title.includes('Chats')) {
          return `
            <div class="content">
              <h2>Resumen de Chats</h2>
              <p>Total de chats: <strong>${data.totalChats}</strong></p>
              <h3>Desglose por usuario:</h3>
              <ul>
                ${Object.entries(data.chatsPorUsuario).map(([userName, count]) => 
                  `<li><strong>${userName}</strong>: ${count} chats</li>`
                ).join('')}
              </ul>
            </div>
          `;
        } else if (title.includes('Vehículos')) {
          return `
            <div class="content">
              <h2>Resumen de Vehículos</h2>
              <p>Total de vehículos: <strong>${data.totalVehiculos}</strong></p>
              <h3>Desglose por usuario:</h3>
              <ul>
                ${Object.entries(data.vehiculosPorUsuario).map(([userName, count]) => 
                  `<li><strong>${userName}</strong>: ${count} vehículos</li>`
                ).join('')}
              </ul>
            </div>
          `;
        }
      };

      const html = `
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 20px;
                line-height: 1.6;
                color: #333;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
              }
              .logo {
                width: 150px;
                height: auto;
                margin-bottom: 20px;
              }
              h1 {
                color: #001f3f;
                font-size: 24px;
                margin: 20px 0;
                padding-bottom: 10px;
                border-bottom: 2px solid #001f3f;
              }
              .content {
                margin: 20px 0;
                padding: 20px;
                background-color: #f8f9fa;
                border-radius: 8px;
              }
              .report-text {
                font-size: 18px;
                line-height: 1.6;
                text-align: center;
              }
              .timestamp {
                text-align: right;
                color: #666;
                font-size: 12px;
                margin-top: 30px;
                border-top: 1px solid #ddd;
                padding-top: 10px;
              }
              strong {
                color: #001f3f;
              }
              ul {
                list-style-type: none;
                padding-left: 0;
              }
              li {
                padding: 8px 0;
                border-bottom: 1px solid #eee;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <img src="file:///android_asset/src/assets/Logo.png" class="logo" />
              <h1>AutoDoc</h1>
              <h2>${title}</h2>
            </div>
            ${formatData(title, data)}
            <div class="timestamp">
              Reporte generado el: ${new Date().toLocaleString()}
            </div>
          </body>
        </html>
      `;

      const options = {
        html: html,
        fileName: `AutoDoc_${title.replace(/\s+/g, '_')}_${Date.now()}`,
        directory: Platform.OS === 'ios' ? 'Documents' : 'Download',
        base64: false,
        height: 842,
        width: 595,
        padding: 24,
      };

      console.log('Iniciando generación de PDF...');
      const file = await RNHTMLtoPDF.convert(options);

      if (file && file.filePath) {
        console.log('PDF generado exitosamente en:', file.filePath);
        Alert.alert(
          'Éxito',
          `PDF guardado en: ${file.filePath}`,
          [{ text: 'OK', onPress: () => console.log('PDF alert closed') }]
        );
      } else {
        throw new Error('No se generó la ruta del archivo');
      }
    } catch (error) {
      console.error('Error detallado al generar PDF:', error);
      Alert.alert(
        'Error',
        'No se pudo generar el PDF. Detalles: ' + (error.message || error),
        [{ text: 'OK', onPress: () => console.log('Error alert closed') }]
      );
    }
  };

  const getUserCount = async () => {
    setLoading(true);
    try {
      const usersSnapshot = await firestore().collection('users').get();
      const count = usersSnapshot.size;
      const userData = {
        totalUsuarios: count,
        fecha: new Date().toLocaleString()
      };
      
      Alert.alert(
        'Total de Usuarios',
        `Hay ${count} usuarios registrados`,
        [
          {
            text: 'Descargar PDF',
            onPress: () => generatePDF('Reporte de Usuarios', userData)
          },
          { text: 'OK' }
        ]
      );
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'No se pudo obtener el conteo de usuarios');
    } finally {
      setLoading(false);
    }
  };

  const getChatsByUser = async () => {
    setLoading(true);
    try {
      const chatsSnapshot = await firestore().collection('chatbotConversations').get();
      const usersSnapshot = await firestore().collection('users').get();
      
      // Crear un mapa de IDs de usuario a nombres
      const userMap = {};
      usersSnapshot.docs.forEach(doc => {
        userMap[doc.id] = doc.data().username || doc.data().email;
      });

      const chatsByUser = {};
      
      chatsSnapshot.docs.forEach(doc => {
        const userId = doc.data().userId;
        const userName = userMap[userId] || 'Usuario Desconocido';
        chatsByUser[userName] = (chatsByUser[userName] || 0) + 1;
      });

      const chatData = {
        chatsPorUsuario: chatsByUser,
        totalChats: chatsSnapshot.size,
        fecha: new Date().toLocaleString()
      };

      Alert.alert(
        'Chats por Usuario',
        `Total de chats: ${chatsSnapshot.size}`,
        [
          {
            text: 'Descargar PDF',
            onPress: () => generatePDF('Reporte de Chats por Usuario', chatData)
          },
          { text: 'OK' }
        ]
      );
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'No se pudo obtener el conteo de chats');
    } finally {
      setLoading(false);
    }
  };

  const getVehiclesByUser = async () => {
    setLoading(true);
    try {
      const vehiclesSnapshot = await firestore().collection('vehicles').get();
      const usersSnapshot = await firestore().collection('users').get();
      
      // Crear un mapa de IDs de usuario a nombres
      const userMap = {};
      usersSnapshot.docs.forEach(doc => {
        userMap[doc.id] = doc.data().username || doc.data().email;
      });

      const vehiclesByUser = {};
      
      vehiclesSnapshot.docs.forEach(doc => {
        const userId = doc.data().userId;
        const userName = userMap[userId] || 'Usuario Desconocido';
        vehiclesByUser[userName] = (vehiclesByUser[userName] || 0) + 1;
      });

      const vehicleData = {
        vehiculosPorUsuario: vehiclesByUser,
        totalVehiculos: vehiclesSnapshot.size,
        fecha: new Date().toLocaleString()
      };

      Alert.alert(
        'Vehículos por Usuario',
        `Total de vehículos: ${vehiclesSnapshot.size}`,
        [
          {
            text: 'Descargar PDF',
            onPress: () => generatePDF('Reporte de Vehículos por Usuario', vehicleData)
          },
          { text: 'OK' }
        ]
      );
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'No se pudo obtener el conteo de vehículos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel de Administrador</Text>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={getUserCount}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Ver Total de Usuarios</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={getChatsByUser}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Ver Chats por Usuario</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={getVehiclesByUser}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Ver Vehículos por Usuario</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  button: {
    backgroundColor: '#001f3f',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#ff0000',
    padding: 15,
    borderRadius: 8,
    marginTop: 'auto',
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default AdminDashboardScreen;