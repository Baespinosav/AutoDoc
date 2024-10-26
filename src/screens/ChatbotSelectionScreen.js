import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, SafeAreaView, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useFocusEffect } from '@react-navigation/native';

/**
 * Componente ChatbotSelectionScreen que permite al usuario seleccionar o iniciar conversaciones con el chatbot.
 * @param {Object} route - Las propiedades de la ruta, incluyendo el vehículo.
 * @param {Object} navigation - Objeto de navegación para manejar la navegación entre pantallas.
 */
const ChatbotSelectionScreen = ({ route, navigation }) => {
  const { vehicle } = route.params; // Obtiene el vehículo de los parámetros de la ruta
  const [conversations, setConversations] = useState([]); // Estado para almacenar las conversaciones

  /**
   * Carga las conversaciones del usuario desde Firestore.
   * Filtra las conversaciones por el ID del usuario y el ID del vehículo.
   */
  const loadConversations = () => {
    const userId = auth().currentUser.uid; // Obtiene el ID del usuario actual
    return firestore()
      .collection('chatbotConversations')
      .where('userId', '==', userId)
      .where('vehicleId', '==', vehicle.id)
      .orderBy('createdAt', 'desc')
      .onSnapshot(querySnapshot => {
        if (querySnapshot) {
          const conversationList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setConversations(conversationList); // Actualiza el estado con la lista de conversaciones
        } else {
          console.log('No se encontraron conversaciones');
          setConversations([]); // Si no hay conversaciones, establece el estado como vacío
        }
      }, error => {
        console.error("Error al obtener conversaciones:", error); // Manejo de errores
      });
  };

  // Carga las conversaciones cuando la pantalla está enfocada
  useFocusEffect(
    React.useCallback(() => {
      const unsubscribe = loadConversations(); // Llama a la función para cargar conversaciones
      return () => unsubscribe(); // Limpia el listener al salir de la pantalla
    }, [vehicle.id])
  );

  /**
   * Navega a la pantalla de Chatbot para iniciar una nueva conversación.
   */
  const startNewConversation = () => {
    navigation.navigate('Chatbot', { vehicle, conversationId: null }); // Navega a la pantalla de Chatbot
  };

  /**
   * Navega a la pantalla de Chatbot para abrir una conversación existente.
   * @param {string} conversationId - El ID de la conversación a abrir.
   */
  const openExistingConversation = (conversationId) => {
    navigation.navigate('Chatbot', { vehicle, conversationId }); // Navega a la pantalla de Chatbot con el ID de la conversación
  };

  /**
   * Elimina una conversación de Firestore.
   * @param {string} conversationId - El ID de la conversación a eliminar.
   */
  const deleteConversation = (conversationId) => {
    Alert.alert(
      "Eliminar conversación",
      "¿Estás seguro de que quieres eliminar esta conversación?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: async () => {
            try {
              await firestore().collection('chatbotConversations').doc(conversationId).delete(); // Elimina la conversación de Firestore
              console.log('Conversación eliminada');
              // No es necesario recargar manualmente, el listener se encargará de actualizar la lista
            } catch (error) {
              console.error('Error al eliminar la conversación:', error);
              Alert.alert('Error', 'No se pudo eliminar la conversación'); // Manejo de errores
            }
          }
        }
      ]
    );
  };

  /**
   * Renderiza un elemento de conversación en la lista.
   * @param {Object} item - El objeto de conversación a renderizar.
   * @returns {JSX.Element} El componente de conversación.
   */
  const renderConversationItem = ({ item }) => (
    <View style={styles.conversationItem}>
      <TouchableOpacity
        style={styles.conversationButton}
        onPress={() => openExistingConversation(item.id)} // Abre la conversación existente
      >
        <Text style={styles.conversationTitle}>
          Conversación del {item.createdAt ? item.createdAt.toDate().toLocaleString() : 'Fecha desconocida'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteConversation(item.id)} // Elimina la conversación
      >
        <Text style={styles.deleteButtonText}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Chats</Text>
      <TouchableOpacity style={styles.newConversationButton} onPress={startNewConversation}>
        <Text style={styles.newConversationButtonText}>Iniciar nueva conversación</Text>
      </TouchableOpacity>
      <FlatList
        data={conversations}
        renderItem={renderConversationItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>No hay conversaciones previas</Text>} // Mensaje si no hay conversaciones
      />
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Volver</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  newConversationButton: {
    backgroundColor: '#001f3f',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  newConversationButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  conversationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  conversationButton: {
    flex: 1,
  },
  conversationTitle: {
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#ff0000',
    padding: 8,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
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
});

export default ChatbotSelectionScreen;
