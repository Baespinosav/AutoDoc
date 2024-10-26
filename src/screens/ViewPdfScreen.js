import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Pdf from 'react-native-pdf';

/**
 * Componente ViewPdfScreen que muestra un documento PDF.
 * @param {Object} route - Propiedades de la ruta, incluyendo la URL del PDF.
 */
function ViewPdfScreen({ route }) {
  const { pdfUrl } = route.params; // Obtiene la URL del PDF de los parámetros de la ruta

  return (
    <Pdf
      source={{ uri: pdfUrl, cache: true }} // Carga el PDF desde la URL proporcionada
      style={styles.pdf} // Aplica estilos al componente PDF
    />
  );
}

const styles = StyleSheet.create({
  pdf: {
    flex: 1, // Ocupa todo el espacio disponible
    width: Dimensions.get('window').width, // Ancho igual al de la ventana
    height: Dimensions.get('window').height, // Alto igual al de la ventana
  }
});

export default ViewPdfScreen;
