const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.checkDocumentExpiration = functions.pubsub
  .schedule('every day 09:00')
  .timeZone('America/Santiago')
  .onRun(async (context) => {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));

    try {
      const vehiclesSnapshot = await admin.firestore()
        .collection('vehicles')
        .get();

      for (const doc of vehiclesSnapshot.docs) {
        const vehicle = doc.data();
        const documentDates = vehicle.documentDates;
        const notificationsSent = vehicle.notificationsSent || {};

        // Obtener el token FCM del usuario
        const userDoc = await admin.firestore()
          .collection('users')
          .doc(vehicle.userId)
          .get();
        
        const fcmToken = userDoc.data()?.fcmToken;
        if (!fcmToken) continue;

        const documentTypes = {
          permisoCirculacion: 'Permiso de Circulación',
          soap: 'SOAP',
          revisionTecnica: 'Revisión Técnica'
        };

        for (const [docType, docName] of Object.entries(documentTypes)) {
          const expirationDate = new Date(documentDates[docType]);
          const notificationKey = `${docType}_${expirationDate.getTime()}`;

          if (expirationDate > now && 
              expirationDate <= sevenDaysFromNow && 
              !notificationsSent[notificationKey]) {
            
            const daysUntilExpiration = Math.ceil((expirationDate - now) / (1000 * 60 * 60 * 24));
            
            const message = {
              notification: {
                title: '¡Documento por vencer!',
                body: `Tu ${docName} para el vehículo ${vehicle.marca} ${vehicle.modelo} vencerá en ${daysUntilExpiration} días.`
              },
              token: fcmToken
            };

            try {
              await admin.messaging().send(message);
              
              // Marcar la notificación como enviada
              await admin.firestore()
                .collection('vehicles')
                .doc(doc.id)
                .update({
                  [`notificationsSent.${notificationKey}`]: true
                });
              
              console.log(`Notificación enviada para ${docName}`);
            } catch (error) {
              console.error(`Error al enviar notificación para ${docName}:`, error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error en checkDocumentExpiration:', error);
    }
  });