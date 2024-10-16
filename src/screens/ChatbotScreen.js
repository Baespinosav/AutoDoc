import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { LogBox } from 'react-native';

LogBox.ignoreAllLogs(); // Ignora todos los warnings


const API_KEY = 'AIzaSyBtBsTj7u59Sv2kyDRFwF_BRVWfV_UDyeU';
const genAI = new GoogleGenerativeAI(API_KEY);

function ChatbotScreen({ route }) {
  const { vehicle } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    sendInitialMessage();
  }, []);

  const sendInitialMessage = async () => {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Eres un asistente virtual especializado en vehículos. El usuario tiene un ${vehicle.marca} ${vehicle.modelo} del año ${new Date(vehicle.año).getFullYear()}. Saluda al usuario y ofrece tu ayuda para responder preguntas sobre este vehículo específico.`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      setMessages([{ id: Date.now(), text, isUser: false }]);
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
    const prompt = `El usuario tiene un ${vehicle.marca} ${vehicle.modelo} del año ${new Date(vehicle.año).getFullYear()}. Pregunta del usuario: ${inputText}`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const botMessage = { id: Date.now(), text, isUser: false };
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error al generar respuesta:', error);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageBubble, item.isUser ? styles.userMessage : styles.botMessage]}>
      <Text style={styles.messageText}>{item.text}</Text>
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
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <FlatList
              data={messages}
              renderItem={renderMessage}
              keyExtractor={item => item.id.toString()}
              style={styles.messageList}
              contentContainerStyle={{ paddingBottom: 100 }} // Espacio extra para el teclado
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
  messageList: {
    flex: 1,
    padding: 10,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 20,
    marginBottom: 10,
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
