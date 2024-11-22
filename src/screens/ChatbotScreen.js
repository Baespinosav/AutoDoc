import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { LogBox } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Tts from 'react-native-tts';
import Icon from 'react-native-vector-icons/Ionicons';

LogBox.ignoreAllLogs();

const API_KEY = 'AIzaSyDR9Uym_genh_zzf8D7iRNNlXBw2ItH8SA';
const genAI = new GoogleGenerativeAI(API_KEY);

function ChatbotScreen({ route, navigation }) {
  const { vehicle, conversationId } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [currentConversationId, setCurrentConversationId] = useState(conversationId);
  const flatListRef = useRef(null);

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

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const loadExistingConversation = async () => {
    const conversationRef = firestore().collection('chatbotConversations').doc(currentConversationId);
    const conversationDoc = await conversationRef.get();
    if (conversationDoc.exists) {
      setMessages(conversationDoc.data().messages);
    }
  };

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

  const speakMessage = (message) => {
    Tts.speak(message);
  };

  const sendInitialMessage = async () => {
    const prompt = `El mensaje de bienvenida debe ser mas corto, sin tanta informacion, un "Hola, soy tu asistente virtual de vehiculos, como puedo ayudarte hoy con tu ${vehicle.marca} ${vehicle.modelo}?",  Eres un asistente virtual especializado en vehículos. El usuario tiene un ${vehicle.marca} ${vehicle.modelo} del año ${vehicle.año}. 
    Saluda al usuario y ofrece tu ayuda para responder preguntas sobre este vehículo específico. Si no sabes la respuesta inventalo o di lo primero que encuentres en internet. 
    Si el usuario te pregunta sobre el estado de los documentos del vehículo, responde con la fecha de vencimiento de cada uno de ellos. ,
    haz que el usuario solo pueda preguntar cosas sobre el vehiculo, todas las preguntas que no sean sobre el vehiculo, debes ignorarlas y dile que pregunte cosas sobre el vehiculo.
    Responde con la informacion cargada en tu memoria y de internet.`;

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

  const updateFirestoreConversation = async (updatedMessages) => {
    await firestore().collection('chatbotConversations').doc(currentConversationId).update({
      messages: updatedMessages,
    });
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageBubble, item.isUser ? styles.userMessage : styles.botMessage]}>
      <Text style={styles.messageText}>{item.text}</Text>
      {!item.isUser && (
        <TouchableOpacity 
          style={styles.speakerButton} 
          onPress={() => speakMessage(item.text)}
        >
          <Icon 
            name="volume-medium"
            size={24} 
            color="#FFFFFF"
            style={styles.speakerIcon}
          />
        </TouchableOpacity>
      )}
    </View>
  );

  const scrollToBottom = () => {
    flatListRef.current.scrollToEnd({ animated: true });
  };

  const scrollToTop = () => {
    flatListRef.current.scrollToIndex({ index: 0, animated: true });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id.toString()}
            style={styles.messageList}
            contentContainerStyle={{ paddingBottom: 70 }}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
          />
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
          <View style={styles.scrollButtonsContainer}>
            <TouchableOpacity style={styles.scrollButton} onPress={scrollToTop}>
              <Icon name="arrow-up" size={30} color="#3498db" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.scrollButton} onPress={scrollToBottom}>
              <Icon name="arrow-down" size={30} color="#3498db" />
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
    padding: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
    color: '#000',
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
  scrollButtonsContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'column',
  },
  scrollButton: {
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 10,
    marginBottom: 5,
    elevation: 5,
  },
});

export default ChatbotScreen;
