import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Pdf from 'react-native-pdf';

function ViewPdfScreen({ route }) {
  const { pdfUrl } = route.params;

  return (
    <Pdf
      source={{ uri: pdfUrl, cache: true }}
      style={styles.pdf}
    />
  );
}

const styles = StyleSheet.create({
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  }
});

export default ViewPdfScreen;
