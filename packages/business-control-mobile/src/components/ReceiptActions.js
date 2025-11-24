import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import {
  generateReceiptPDF,
  getReceiptData,
  markReceiptSent,
  selectReceiptLoading,
  selectCurrentReceiptData,
} from '@shared/store/reactNativeStore';

/**
 * Componente para generar y enviar recibos PDF
 * Se integra en la pantalla de detalles de cita
 */
export default function ReceiptActions({ appointmentId, businessId }) {
  const dispatch = useDispatch();
  const loading = useSelector(selectReceiptLoading);
  const receiptData = useSelector(selectCurrentReceiptData);

  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);

  useEffect(() => {
    if (appointmentId && businessId) {
      // Cargar datos del recibo
      dispatch(getReceiptData({ appointmentId, businessId }));
    }
  }, [appointmentId, businessId, dispatch]);

  const handleGeneratePDF = async () => {
    setGeneratingPDF(true);

    try {
      const result = await dispatch(
        generateReceiptPDF({ appointmentId, businessId })
      ).unwrap();

      if (result?.blob && result?.filename) {
        // Guardar el blob en el sistema de archivos
        const fileUri = `${FileSystem.documentDirectory}${result.filename}`;

        const reader = new FileReader();
        reader.readAsDataURL(result.blob);
        reader.onloadend = async () => {
          const base64data = reader.result.split(',')[1];
          await FileSystem.writeAsStringAsync(fileUri, base64data, {
            encoding: FileSystem.EncodingType.Base64,
          });

          // Compartir el archivo
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri, {
              mimeType: 'application/pdf',
              dialogTitle: 'Compartir Recibo',
            });
          }

          Alert.alert(
            '¡Recibo Generado!',
            'El recibo ha sido generado exitosamente',
            [{ text: 'OK' }]
          );
        };
      }
    } catch (err) {
      Alert.alert('Error', err || 'No se pudo generar el recibo PDF');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleSendWhatsApp = async () => {
    if (!receiptData?.whatsappReady) {
      Alert.alert(
        'No Disponible',
        'El cliente no tiene un número de WhatsApp registrado o no hay datos de recibo disponibles'
      );
      return;
    }

    setSendingWhatsApp(true);

    try {
      // Primero generar el PDF
      const pdfResult = await dispatch(
        generateReceiptPDF({ appointmentId, businessId })
      ).unwrap();

      if (pdfResult?.blob && pdfResult?.filename) {
        const fileUri = `${FileSystem.documentDirectory}${pdfResult.filename}`;

        const reader = new FileReader();
        reader.readAsDataURL(pdfResult.blob);
        reader.onloadend = async () => {
          const base64data = reader.result.split(',')[1];
          await FileSystem.writeAsStringAsync(fileUri, base64data, {
            encoding: FileSystem.EncodingType.Base64,
          });

          // Construir mensaje de WhatsApp
          const receipt = receiptData?.receipt;
          const clientName = receipt?.clientName || 'Cliente';
          const total = receipt?.totalAmount || 0;
          const businessName = receipt?.businessName || 'Negocio';

          const message = `Hola ${clientName}! 👋\n\nTe enviamos el recibo de tu cita en ${businessName}.\n\nTotal: $${total.toLocaleString('es-CO')}\n\n¡Gracias por tu preferencia! ✨`;

          const whatsappPhone = receiptData.receipt?.clientPhone?.replace(/\D/g, '');
          const whatsappUrl = `whatsapp://send?phone=${whatsappPhone}&text=${encodeURIComponent(message)}`;

          // Abrir WhatsApp
          const canOpen = await Linking.canOpenURL(whatsappUrl);
          if (canOpen) {
            await Linking.openURL(whatsappUrl);

            // Marcar como enviado
            if (receipt?.id) {
              await dispatch(
                markReceiptSent({
                  receiptId: receipt.id,
                  method: 'whatsapp',
                })
              ).unwrap();
            }

            Alert.alert(
              '¡Listo!',
              'WhatsApp se ha abierto. Comparte el recibo desde tu galería o carpeta de descargas.',
              [{ text: 'OK' }]
            );
          } else {
            Alert.alert(
              'WhatsApp no disponible',
              'No se pudo abrir WhatsApp. Por favor verifica que esté instalado.'
            );
          }
        };
      }
    } catch (err) {
      Alert.alert('Error', err || 'No se pudo enviar por WhatsApp');
    } finally {
      setSendingWhatsApp(false);
    }
  };

  if (loading && !receiptData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#8b5cf6" />
        <Text style={styles.loadingText}>Cargando datos del recibo...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recibo de Pago</Text>

      {/* Generar PDF */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleGeneratePDF}
        disabled={generatingPDF}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={generatingPDF ? ['#cbd5e1', '#94a3b8'] : ['#8b5cf6', '#7c3aed']}
          style={styles.buttonGradient}
        >
          {generatingPDF ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <>
              <Ionicons name="document-text-outline" size={24} color="#ffffff" />
              <Text style={styles.buttonText}>Generar PDF</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Enviar por WhatsApp */}
      <TouchableOpacity
        style={[
          styles.button,
          !receiptData?.whatsappReady && styles.buttonDisabled,
        ]}
        onPress={handleSendWhatsApp}
        disabled={!receiptData?.whatsappReady || sendingWhatsApp}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={
            !receiptData?.whatsappReady || sendingWhatsApp
              ? ['#cbd5e1', '#94a3b8']
              : ['#10b981', '#059669']
          }
          style={styles.buttonGradient}
        >
          {sendingWhatsApp ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <>
              <Ionicons name="logo-whatsapp" size={24} color="#ffffff" />
              <Text style={styles.buttonText}>
                {receiptData?.whatsappReady
                  ? 'Enviar por WhatsApp'
                  : 'WhatsApp no disponible'}
              </Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Info del Recibo */}
      {receiptData?.receipt && (
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={16} color="#64748b" />
            <Text style={styles.infoText}>
              {receiptData.receipt.clientName || 'Sin nombre'}
            </Text>
          </View>
          {receiptData.receipt.clientPhone && (
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={16} color="#64748b" />
              <Text style={styles.infoText}>
                {receiptData.receipt.clientPhone}
              </Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Ionicons name="cash-outline" size={16} color="#64748b" />
            <Text style={styles.infoText}>
              Total: ${(receiptData.receipt.totalAmount || 0).toLocaleString('es-CO')}
            </Text>
          </View>
          {receiptData.receipt.receiptNumber && (
            <View style={styles.infoRow}>
              <Ionicons name="document-outline" size={16} color="#64748b" />
              <Text style={styles.infoText}>
                Recibo #{receiptData.receipt.receiptNumber}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Estado de Envío */}
      {receiptData?.receipt?.sentVia && (
        <View style={styles.sentBadge}>
          <Ionicons name="checkmark-circle" size={16} color="#10b981" />
          <Text style={styles.sentText}>
            Enviado por {receiptData.receipt.sentVia === 'whatsapp' ? 'WhatsApp' : 'Email'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#64748b',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#475569',
    flex: 1,
  },
  sentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d1fae5',
    padding: 8,
    borderRadius: 8,
    marginTop: 12,
    gap: 6,
  },
  sentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10b981',
  },
});
