import notifee, { AndroidImportance, TriggerType } from '@notifee/react-native';

class NotificationService {
  async createChannel() {
    try {
      const channelId = await notifee.createChannel({
        id: 'documento-vencimiento',
        name: 'Vencimiento de Documentos',
        importance: AndroidImportance.HIGH,
      });
      return channelId;
    } catch (error) {
      console.log('Error creating channel:', error);
      return null;
    }
  }

  async scheduleDocumentNotifications(documentType, expirationDate, vehicleInfo) {
    try {
      console.log(`Programando notificaciones para ${documentType}`);
      console.log('Fecha de vencimiento:', expirationDate);

      const daysToNotify = [7, 5, 3, 1, 0];
      const channelId = await this.createChannel();
      const now = new Date();

      for (const days of daysToNotify) {
        // Calcular la fecha de notificación
        const notificationDate = new Date(expirationDate);
        notificationDate.setDate(notificationDate.getDate() - days);

        // Si la fecha de notificación es hoy o en el futuro, programar
        if (this.isSameDay(notificationDate, now) || notificationDate > now) {
          let message;
          if (days === 0) {
            message = `¡Tu ${documentType} para el vehículo ${vehicleInfo} vence HOY!`;
          } else {
            message = `Tu ${documentType} para el vehículo ${vehicleInfo} vencerá en ${days} días`;
          }

          // Para pruebas inmediatas, si es el mismo día, programar para 10 segundos después
          const triggerTimestamp = this.isSameDay(notificationDate, now) 
            ? now.getTime() + 10000 // 10 segundos después
            : notificationDate.getTime();

          const trigger = {
            type: TriggerType.TIMESTAMP,
            timestamp: triggerTimestamp,
          };

          const notification = {
            id: `${documentType}-${days}-${triggerTimestamp}`,
            title: '¡Documento por vencer!',
            body: message,
            android: {
              channelId,
              importance: AndroidImportance.HIGH,
              pressAction: {
                id: 'default',
              },
            },
            ios: {
              foregroundPresentationOptions: {
                alert: true,
                badge: true,
                sound: true,
              },
            },
          };

          console.log(`Programando notificación para: ${new Date(triggerTimestamp).toLocaleString()}`);
          console.log('Mensaje:', message);

          await notifee.createTriggerNotification(notification, trigger);
          console.log('Notificación programada exitosamente');
        }
      }
    } catch (error) {
      console.error('Error en scheduleDocumentNotifications:', error);
      throw error;
    }
  }

  // Función auxiliar para comparar si dos fechas son el mismo día
  isSameDay(date1, date2) {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  // Función para probar notificaciones programadas
  async testScheduledNotifications() {
    try {
      console.log('Iniciando prueba de notificaciones programadas');
      
      // Programar una notificación para 10 segundos después
      const now = new Date();
      const testDate = new Date(now.getTime() + 10000); // 10 segundos en el futuro
      
      console.log('Fecha de prueba:', testDate);

      await this.scheduleDocumentNotifications(
        'Documento de Prueba',
        testDate,
        'Vehículo de Prueba'
      );

      // Notificación inmediata de confirmación
      await this.onDisplayNotification(
        'Notificaciones Programadas',
        'Las notificaciones de prueba han sido programadas. Espera 10 segundos.'
      );

      return true;
    } catch (error) {
      console.error('Error en testScheduledNotifications:', error);
      throw error;
    }
  }

  async onDisplayNotification(title, body) {
    try {
      const channelId = await this.createChannel();

      await notifee.displayNotification({
        title,
        body,
        android: {
          channelId,
          importance: AndroidImportance.HIGH,
        },
        ios: {
          foregroundPresentationOptions: {
            alert: true,
            badge: true,
            sound: true,
          },
        },
      });
    } catch (error) {
      console.error('Error displaying notification:', error);
      throw error;
    }
  }
}

export default new NotificationService();
