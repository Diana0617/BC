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
import {
  openShift,
  getActiveShift,
  getLastClosedShift,
  selectCashRegisterLoading,
  selectCashRegisterError,
  selectLastClosedShift,
} from '@shared/store/reactNativeStore';

export default function OpenShiftScreen({ route, navigation }) {
  const { businessId } = route.params;
  const dispatch = useDispatch();

  const loading = useSelector(selectCashRegisterLoading);
  const error = useSelector(selectCashRegisterError);
  const lastShift = useSelector(selectLastClosedShift);

  const [openingBalance, setOpeningBalance] = useState('');
  const [openingNotes, setOpeningNotes] = useState('');
  const [suggestedBalance, setSuggestedBalance] = useState(null);

  useEffect(() => {
    // Obtener último turno cerrado para sugerir balance
    dispatch(getLastClosedShift({ businessId }));
    // Verificar si ya tiene un turno abierto
    dispatch(getActiveShift({ businessId }))
      .unwrap()
      .then((shift) => {
        if (shift) {
          // Ya tiene un turno abierto, redirigir a ActiveShift
          Alert.alert(
            'Turno ya abierto',
            'Ya tienes un turno de caja abierto',
            [
              {
                text: 'Ver Turno',
                onPress: () => navigation.replace('ActiveShift', { businessId })
              }
            ]
          );
        }
      })
      .catch(() => {
        // No hay turno activo, continuar normalmente
      });
  }, [businessId, dispatch]);

  useEffect(() => {
    if (lastShift?.closingBalance) {
      setSuggestedBalance(lastShift.closingBalance);
      setOpeningBalance(lastShift.closingBalance.toString());
    }
  }, [lastShift]);

  const handleOpenShift = async () => {
    const balance = parseFloat(openingBalance);

    if (isNaN(balance) || balance < 0) {
      Alert.alert('Error', 'Por favor ingresa un balance inicial válido');
      return;
    }

    try {
      const result = await dispatch(
        openShift({
          businessId,
          openingBalance: balance,
          openingNotes: openingNotes.trim() || undefined,
        })
      ).unwrap();

      if (result) {
        // Recargar el shift activo en el estado global
        await dispatch(getActiveShift({ businessId }));
        
        Alert.alert(
          '¡Turno Abierto!',
          'Tu turno de caja ha sido abierto exitosamente',
          [
            {
              text: 'Ver Detalles',
              onPress: () => {
                navigation.replace('ActiveShift', { businessId });
              },
            },
          ]
        );
      }
    } catch (err) {
      const errorMessage = typeof err === 'string' 
        ? err 
        : err?.message || err?.error || 'No se pudo abrir el turno de caja';
      Alert.alert('Error', errorMessage);
    }
  };

  const formatCurrency = (value) => {
    const numValue = parseFloat(value.replace(/[^0-9]/g, ''));
    if (isNaN(numValue)) return '';
    return numValue.toLocaleString('es-CO');
  };

  const handleBalanceChange = (text) => {
    const numText = text.replace(/[^0-9]/g, '');
    setOpeningBalance(numText);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#8b5cf6', '#7c3aed']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Abrir Turno de Caja</Text>
            <Text style={styles.headerSubtitle}>Ingresa el balance inicial</Text>
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
          {/* Balance Sugerido */}
          {suggestedBalance !== null && (
            <View style={styles.suggestionCard}>
              <LinearGradient
                colors={['#10b981', '#059669']}
                style={styles.suggestionGradient}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={24}
                  color="#ffffff"
                />
                <View style={styles.suggestionText}>
                  <Text style={styles.suggestionTitle}>Balance Sugerido</Text>
                  <Text style={styles.suggestionValue}>
                    ${suggestedBalance.toLocaleString('es-CO')}
                  </Text>
                  <Text style={styles.suggestionNote}>
                    Basado en el cierre del turno anterior
                  </Text>
                </View>
              </LinearGradient>
            </View>
          )}

          {/* Balance Inicial */}
          <View style={styles.section}>
            <Text style={styles.label}>
              Balance Inicial <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={formatCurrency(openingBalance)}
                onChangeText={handleBalanceChange}
                keyboardType="numeric"
                placeholderTextColor="#94a3b8"
              />
            </View>
            <Text style={styles.hint}>
              Cantidad de efectivo con la que inicias tu turno
            </Text>
          </View>

          {/* Notas de Apertura */}
          <View style={styles.section}>
            <Text style={styles.label}>Notas de Apertura (opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ej: Billetes de 50k y 20k, monedas varias"
              value={openingNotes}
              onChangeText={setOpeningNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#94a3b8"
            />
            <Text style={styles.hint}>
              Detalles sobre el efectivo inicial (opcional)
            </Text>
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color="#ef4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Instrucciones */}
          <View style={styles.infoCard}>
            <Ionicons name="bulb-outline" size={24} color="#8b5cf6" />
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>Importante</Text>
              <Text style={styles.infoDescription}>
                • El turno permanecerá abierto hasta que lo cierres{'\n'}
                • Puedes ver el resumen en cualquier momento{'\n'}
                • Al cerrar, se generará un PDF automáticamente
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Action Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[
              styles.openButton,
              (!openingBalance || loading?.openingShift) && styles.openButtonDisabled,
            ]}
            onPress={handleOpenShift}
            disabled={!openingBalance || loading?.openingShift}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                !openingBalance || loading?.openingShift
                  ? ['#cbd5e1', '#94a3b8']
                  : ['#10b981', '#059669']
              }
              style={styles.buttonGradient}
            >
              {loading?.openingShift ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Ionicons
                    name="lock-open-outline"
                    size={24}
                    color="#ffffff"
                  />
                  <Text style={styles.buttonText}>Abrir Turno</Text>
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
  suggestionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionGradient: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  suggestionText: {
    flex: 1,
    marginLeft: 12,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  suggestionValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  suggestionNote: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
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
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#ef4444',
    marginLeft: 8,
    fontWeight: '500',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9d5ff',
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
    color: '#8b5cf6',
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
  openButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  openButtonDisabled: {
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
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 8,
  },
});
