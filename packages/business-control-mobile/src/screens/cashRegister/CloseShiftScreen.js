import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import {
  getShiftSummary,
  closeShift,
  generateClosingPDF,
  selectShiftSummary,
  selectCashRegisterLoading,
  selectCashRegisterError,
} from '@shared/store/reactNativeStore';

export default function CloseShiftScreen({ route, navigation }) {
  const { businessId } = route.params;
  const dispatch = useDispatch();

  const summary = useSelector(selectShiftSummary);
  const loading = useSelector(selectCashRegisterLoading);
  const error = useSelector(selectCashRegisterError);

  const [closingBalance, setClosingBalance] = useState('');
  const [closingNotes, setClosingNotes] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  const expectedBalance =
    (summary?.openingBalance || 0) +
    (summary?.totalCash || 0) -
    (summary?.totalExpenses || 0);

  useEffect(() => {
    dispatch(getShiftSummary({ businessId }));
  }, [businessId, dispatch]);

  useEffect(() => {
    // Sugerir el balance esperado
    if (expectedBalance) {
      setClosingBalance(expectedBalance.toString());
    }
  }, [expectedBalance]);

  const difference = closingBalance
    ? parseFloat(closingBalance) - expectedBalance
    : 0;

  const handleCloseShift = async () => {
    const balance = parseFloat(closingBalance);

    if (isNaN(balance) || balance < 0) {
      Alert.alert('Error', 'Por favor ingresa un balance de cierre válido');
      return;
    }

    // Confirmar el cierre si hay diferencia significativa
    if (Math.abs(difference) > 0) {
      const differenceText =
        difference > 0
          ? `un sobrante de $${Math.abs(difference).toLocaleString('es-CO')}`
          : `un faltante de $${Math.abs(difference).toLocaleString('es-CO')}`;

      Alert.alert(
        'Diferencia Detectada',
        `Hay ${differenceText}. ¿Deseas continuar con el cierre?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Cerrar Turno', onPress: () => performCloseShift(balance) },
        ]
      );
    } else {
      performCloseShift(balance);
    }
  };

  const performCloseShift = async (balance) => {
    setIsClosing(true);

    try {
      // Cerrar el turno
      const result = await dispatch(
        closeShift({
          businessId,
          closingBalance: balance,
          closingNotes: closingNotes.trim() || undefined,
        })
      ).unwrap();

      if (result) {
        // Generar y descargar el PDF automáticamente
        try {
          const pdfResult = await dispatch(
            generateClosingPDF({ businessId })
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

              if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri, {
                  mimeType: 'application/pdf',
                  dialogTitle: 'Resumen del Turno Cerrado',
                });
              }
            };
          }
        } catch (pdfErr) {
          console.error('Error generando PDF:', pdfErr);
        }

        Alert.alert(
          '¡Turno Cerrado!',
          'El turno ha sido cerrado exitosamente y el PDF ha sido generado',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Dashboard' }],
                });
              },
            },
          ]
        );
      }
    } catch (err) {
      Alert.alert('Error', err || 'No se pudo cerrar el turno');
    } finally {
      setIsClosing(false);
    }
  };

  const formatCurrency = (value) => {
    const numValue = parseFloat(value.replace(/[^0-9]/g, ''));
    if (isNaN(numValue)) return '';
    return numValue.toLocaleString('es-CO');
  };

  const handleBalanceChange = (text) => {
    const numText = text.replace(/[^0-9]/g, '');
    setClosingBalance(numText);
  };

  const getDifferenceColor = () => {
    if (difference === 0) return '#10b981';
    if (difference > 0) return '#3b82f6';
    return '#ef4444';
  };

  const getDifferenceIcon = () => {
    if (difference === 0) return 'checkmark-circle';
    if (difference > 0) return 'arrow-up-circle';
    return 'arrow-down-circle';
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#ef4444', '#dc2626']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Cerrar Turno</Text>
            <Text style={styles.headerSubtitle}>Conteo de efectivo final</Text>
          </View>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Resumen del Turno */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Resumen del Turno</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Balance Inicial:</Text>
              <Text style={styles.summaryValue}>
                ${(summary?.openingBalance || 0).toLocaleString('es-CO')}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Ventas en Efectivo:</Text>
              <Text style={[styles.summaryValue, styles.positive]}>
                +${(summary?.totalCash || 0).toLocaleString('es-CO')}
              </Text>
            </View>

            {summary?.totalExpenses > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Gastos:</Text>
                <Text style={[styles.summaryValue, styles.negative]}>
                  -${(summary?.totalExpenses || 0).toLocaleString('es-CO')}
                </Text>
              </View>
            )}

            <View style={[styles.summaryRow, styles.summaryTotal]}>
              <Text style={styles.summaryTotalLabel}>Balance Esperado:</Text>
              <Text style={styles.summaryTotalValue}>
                ${expectedBalance.toLocaleString('es-CO')}
              </Text>
            </View>
          </View>

          {/* Balance de Cierre */}
          <View style={styles.section}>
            <Text style={styles.label}>
              Balance de Cierre <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={formatCurrency(closingBalance)}
                onChangeText={handleBalanceChange}
                keyboardType="numeric"
                placeholderTextColor="#94a3b8"
              />
            </View>
            <Text style={styles.hint}>Efectivo real contado en caja</Text>
          </View>

          {/* Diferencia */}
          {closingBalance && (
            <View
              style={[
                styles.differenceCard,
                { backgroundColor: getDifferenceColor() + '15' },
              ]}
            >
              <Ionicons
                name={getDifferenceIcon()}
                size={32}
                color={getDifferenceColor()}
              />
              <View style={styles.differenceText}>
                <Text style={styles.differenceLabel}>Diferencia</Text>
                <Text
                  style={[
                    styles.differenceValue,
                    { color: getDifferenceColor() },
                  ]}
                >
                  {difference === 0
                    ? 'Cuadra Perfecto ✓'
                    : difference > 0
                    ? `Sobrante: $${Math.abs(difference).toLocaleString('es-CO')}`
                    : `Faltante: $${Math.abs(difference).toLocaleString('es-CO')}`}
                </Text>
              </View>
            </View>
          )}

          {/* Notas de Cierre */}
          <View style={styles.section}>
            <Text style={styles.label}>Notas de Cierre (opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Observaciones sobre el cierre, faltantes, sobrantes, etc."
              value={closingNotes}
              onChangeText={setClosingNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#94a3b8"
            />
            <Text style={styles.hint}>
              Explica diferencias o situaciones especiales
            </Text>
          </View>

          {/* Información Importante */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={24} color="#ef4444" />
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>Antes de cerrar</Text>
              <Text style={styles.infoDescription}>
                • Verifica que el efectivo contado sea correcto{'\n'}
                • Asegúrate de registrar cualquier diferencia{'\n'}
                • El PDF se generará automáticamente al cerrar
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Action Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[
              styles.closeButton,
              (!closingBalance || isClosing) && styles.closeButtonDisabled,
            ]}
            onPress={handleCloseShift}
            disabled={!closingBalance || isClosing}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                !closingBalance || isClosing
                  ? ['#cbd5e1', '#94a3b8']
                  : ['#ef4444', '#dc2626']
              }
              style={styles.buttonGradient}
            >
              {isClosing ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Ionicons
                    name="lock-closed-outline"
                    size={24}
                    color="#ffffff"
                  />
                  <Text style={styles.buttonText}>Cerrar Turno y Generar PDF</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  summaryLabel: {
    fontSize: 15,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  positive: {
    color: '#10b981',
  },
  negative: {
    color: '#ef4444',
  },
  summaryTotal: {
    borderBottomWidth: 0,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#8b5cf6',
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  summaryTotalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#8b5cf6',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '700',
    color: '#64748b',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    paddingVertical: 16,
  },
  textArea: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
  },
  hint: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 6,
    marginLeft: 4,
  },
  differenceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  differenceText: {
    flex: 1,
    marginLeft: 12,
  },
  differenceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  differenceValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
    marginBottom: 6,
  },
  infoDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  closeButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  closeButtonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 8,
  },
});
