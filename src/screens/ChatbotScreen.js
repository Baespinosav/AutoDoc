import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { LogBox } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Tts from 'react-native-tts';
import Icon from 'react-native-vector-icons/Ionicons'; // Asegúrate de tener instalado react-native-vector-icons

LogBox.ignoreAllLogs(); // Ignora todos los warnings

const API_KEY = 'AIzaSyBtBsTj7u59Sv2kyDRFwF_BRVWfV_UDyeU';
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Componente ChatbotScreen que maneja la interacción del usuario con el chatbot.
 * @param {Object} route - Las propiedades de la ruta, incluyendo el vehículo y el ID de la conversación.
 * @param {Object} navigation - Objeto de navegación para manejar la navegación entre pantallas.
 */
function ChatbotScreen({ route, navigation }) {
  const { vehicle, conversationId } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [currentConversationId, setCurrentConversationId] = useState(conversationId);

  useEffect(() => {
    if (currentConversationId) {
      loadExistingConversation();
    } else {
      createNewConversation();
    }
  }, [currentConversationId]);

  useEffect(() => {
    Tts.setDefaultLanguage('es-ES');
    return () => {
      Tts.stop();
    };
  }, []);

  /**
   * Carga una conversación existente desde Firestore.
   * Si la conversación existe, se actualiza el estado de los mensajes.
   */
  const loadExistingConversation = async () => {
    const conversationRef = firestore().collection('chatbotConversations').doc(currentConversationId);
    const conversationDoc = await conversationRef.get();
    if (conversationDoc.exists) {
      setMessages(conversationDoc.data().messages);
    }
  };

  /**
   * Crea una nueva conversación en Firestore.
   * Se inicializa con el ID del usuario y el ID del vehículo.
   */
  const createNewConversation = async () => {
    const userId = auth().currentUser.uid;
    const newConversationRef = await firestore().collection('chatbotConversations').add({
      userId,
      vehicleId: vehicle.id,
      createdAt: firestore.FieldValue.serverTimestamp(),
      messages: [],
    });
    setCurrentConversationId(newConversationRef.id);
    sendInitialMessage();
  };

  /**
   * Reproduce un mensaje utilizando Text-to-Speech (TTS).
   * @param {string} message - El mensaje que se va a reproducir.
   */
  const speakMessage = (message) => {
    Tts.speak(message);
  };

  /**
   * Envía un mensaje inicial al chatbot.
   * Se genera un mensaje de saludo utilizando el modelo de IA.
   */
  const sendInitialMessage = async () => {
<<<<<<< HEAD
    const prompt = `Debes evitar usar en las respuestas los "*", "**", "***", etc. Debes dar respuestas claras y directas. pero siempre enfocandote en el vehiculo que el usuario tiene y como consejos, prefiriendo siempre la vision de un profesional. Eres un asistente virtual especializado en vehículos. El usuario tiene un ${vehicle.marca} ${vehicle.modelo} del año ${vehicle.año}. Saluda al usuario y ofrece tu ayuda para responder preguntas sobre este vehículo específico.`;
=======
    const prompt = `Eres un asistente virtual especializado en vehículos. El usuario tiene un ${vehicle.marca} ${vehicle.modelo} del año ${vehicle.año}. Saluda al usuario y ofrece tu ayuda para responder preguntas sobre este vehículo específico.`;
>>>>>>> 423064b24f0fabcfa68185da5ab885d92d97dea2

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const newMessage = { id: Date.now(), text, isUser: false };
      setMessages([newMessage]);
      updateFirestoreConversation([newMessage]);
      speakMessage(text);
    } catch (error) {
      console.error('Error al generar el mensaje inicial:', error);
    }
  };

  /**
   * Envía un mensaje del usuario al chatbot.
   * Genera una respuesta del chatbot utilizando el modelo de IA.
   */
  const sendMessage = async () => {
    if (inputText.trim() === '') return;

    const userMessage = { id: Date.now(), text: inputText, isUser: true };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputText('');

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const year = typeof vehicle.año === 'number' ? vehicle.año : 'Año desconocido';
    const prompt = `El usuario tiene un ${vehicle.marca} ${vehicle.modelo} del año ${year}. Pregunta del usuario: ${inputText}`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const botMessage = { id: Date.now(), text, isUser: false };
      setMessages(prevMessages => [...prevMessages, botMessage]);
      updateFirestoreConversation([...messages, userMessage, botMessage]);
      speakMessage(text);
    } catch (error) {
      console.error('Error al generar respuesta:', error);
    }
  };

  /**
   * Actualiza la conversación en Firestore con los mensajes actualizados.
   * @param {Array} updatedMessages - La lista de mensajes actualizados.
   */
  const updateFirestoreConversation = async (updatedMessages) => {
    await firestore().collection('chatbotConversations').doc(currentConversationId).update({
      messages: updatedMessages,
    });
  };

  /**
   * Renderiza un mensaje en la interfaz de usuario.
   * @param {Object} item - El mensaje a renderizar.
   * @returns {JSX.Element} El componente de mensaje.
   */
  const renderMessage = ({ item }) => (
    <View style={[styles.messageBubble, item.isUser ? styles.userMessage : styles.botMessage]}>
      <Text style={styles.messageText}>{item.text}</Text>
      {!item.isUser && (
        <TouchableOpacity 
          style={styles.speakerButton} 
          onPress={() => speakMessage(item.text)}
        >
<<<<<<< HEAD
          <Icon 
            name="volume-medium"
            size={24} 
            color="#FFFFFF"
            style={styles.speakerIcon}
          />
=======
          <Icon name="volume-high-outline" size={24} color="white" />
>>>>>>> 423064b24f0fabcfa68185da5ab885d92d97dea2
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90} // Ajusta este valor según sea necesario
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <FlatList
              data={messages}
              renderItem={renderMessage}
              keyExtractor={item => item.id.toString()}
              style={styles.messageList}
              contentContainerStyle={{ paddingBottom: 20 }} // Espacio extra para el teclado
            />
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Escribe tu mensaje..."
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Text style={styles.sendButtonText}>Enviar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  messageList: {
    flex: 1,
    padding: 10,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 20,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#3498db',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#2ecc71',
  },
  messageText: {
    color: 'white',
    flex: 1,
  },
  speakerButton: {
    marginLeft: 10,
<<<<<<< HEAD
    padding: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)', // Fondo semi-transparente
    justifyContent: 'center',
    alignItems: 'center',
  },
  speakerIcon: {
    marginHorizontal: 5,
=======
>>>>>>> 423064b24f0fabcfa68185da5ab885d92d97dea2
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'white',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    color: '#000', // Color del texto (negro)
  },
  sendButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ChatbotScreen;
