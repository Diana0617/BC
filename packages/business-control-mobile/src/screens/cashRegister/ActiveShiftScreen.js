import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { downloadAsync, documentDirectory } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import {
  getShiftSummary,
  generateClosingPDF,
  selectShiftSummary,
  selectCashRegisterLoading,
  selectCashRegisterError,
} from '@shared/store/reactNativeStore';

export default function ActiveShiftScreen({ route, navigation }) {
  const { businessId } = route.params;
  const dispatch = useDispatch();

  const summary = useSelector(selectShiftSummary);
  const loading = useSelector(selectCashRegisterLoading);
  const error = useSelector(selectCashRegisterError);

  const [refreshing, setRefreshing] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    loadSummary();
  }, [businessId]);

  const loadSummary = () => {
    dispatch(getShiftSummary({ businessId }));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSummary();
    setRefreshing(false);
  };

  const handleGeneratePDF = async () => {
    setGeneratingPDF(true);
    try {
      // Obtener token y URL
      const token = await require('@shared/api/client').apiClient.getAuthToken();
      const url = `${require('@shared/api/client').apiClient.baseURL}/api/cash-register/generate-closing-pdf?businessId=${businessId}`;
      
      // Descargar PDF directamente usando la API legacy
      const fileUri = `${documentDirectory}turno_${Date.now()}.pdf`;
      
      const downloadResult = await downloadAsync(
        url,
        fileUri,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (downloadResult.status === 200) {
        // Compartir el archivo
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(downloadResult.uri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Compartir Resumen de Turno',
          });
        }

        Alert.alert(
          '¡PDF Generado!',
          'El resumen del turno ha sido guardado exitosamente',
          [{ text: 'OK' }]
        );
      } else {
        throw new Error('Error al descargar el PDF');
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo generar el PDF');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleCloseShift = () => {
    navigation.navigate('CloseShift', { businessId });
  };

  if (loading && !summary) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Cargando resumen...</Text>
      </View>
    );
  }

  if (error && !summary) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadSummary}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentBalance =
    (summary?.openingBalance || 0) +
    (summary?.totalCash || 0) -
    (summary?.totalExpenses || 0);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#10b981', '#059669']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Turno Activo</Text>
            <Text style={styles.headerSubtitle}>
              Abierto:{' '}
              {summary?.openedAt
                ? new Date(summary.openedAt).toLocaleTimeString('es-CO', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '-'}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Balance Actual */}
        <View style={styles.balanceCard}>
          <LinearGradient
            colors={['#8b5cf6', '#7c3aed']}
            style={styles.balanceGradient}
          >
            <Text style={styles.balanceLabel}>Balance Actual</Text>
            <Text style={styles.balanceAmount}>
              ${currentBalance.toLocaleString('es-CO')}
            </Text>
            <View style={styles.balanceDetails}>
              <View style={styles.balanceDetailRow}>
                <Text style={styles.balanceDetailLabel}>Inicial:</Text>
                <Text style={styles.balanceDetailValue}>
                  ${(summary?.openingBalance || 0).toLocaleString('es-CO')}
                </Text>
              </View>
              <View style={styles.balanceDetailRow}>
                <Text style={styles.balanceDetailLabel}>Entradas:</Text>
                <Text style={[styles.balanceDetailValue, styles.positive]}>
                  +${(summary?.totalCash || 0).toLocaleString('es-CO')}
                </Text>
              </View>
              {summary?.totalExpenses > 0 && (
                <View style={styles.balanceDetailRow}>
                  <Text style={styles.balanceDetailLabel}>Salidas:</Text>
                  <Text style={[styles.balanceDetailValue, styles.negative]}>
                    -${(summary?.totalExpenses || 0).toLocaleString('es-CO')}
                  </Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </View>

        {/* Resumen de Ventas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen de Ventas</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="calendar-outline" size={24} color="#8b5cf6" />
              <Text style={styles.statValue}>{summary?.appointmentsCount || 0}</Text>
              <Text style={styles.statLabel}>Citas</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="cash-outline" size={24} color="#10b981" />
              <Text style={styles.statValue}>
                ${(summary?.totalCash || 0).toLocaleString('es-CO')}
              </Text>
              <Text style={styles.statLabel}>Efectivo</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="card-outline" size={24} color="#3b82f6" />
              <Text style={styles.statValue}>
                ${(summary?.totalCard || 0).toLocaleString('es-CO')}
              </Text>
              <Text style={styles.statLabel}>Tarjeta</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="wallet-outline" size={24} color="#f59e0b" />
              <Text style={styles.statValue}>
                ${(summary?.totalTransfer || 0).toLocaleString('es-CO')}
              </Text>
              <Text style={styles.statLabel}>Transfer.</Text>
            </View>
          </View>
        </View>

        {/* Notas de Apertura */}
        {summary?.openingNotes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notas de Apertura</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{summary.openingNotes}</Text>
            </View>
          </View>
        )}

        {/* Info de Usuario */}
        <View style={styles.infoCard}>
          <Ionicons name="person-outline" size={20} color="#64748b" />
          <View style={styles.infoText}>
            <Text style={styles.infoLabel}>Responsable:</Text>
            <Text style={styles.infoValue}>
              {summary?.userName || 'Usuario'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.pdfButton}
          onPress={handleGeneratePDF}
          disabled={generatingPDF}
          activeOpacity={0.8}
        >
          <View style={styles.pdfButtonContent}>
            {generatingPDF ? (
              <ActivityIndicator color="#8b5cf6" />
            ) : (
              <>
                <Ionicons name="document-text-outline" size={24} color="#8b5cf6" />
                <Text style={styles.pdfButtonText}>Generar PDF</Text>
              </>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleCloseShift}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#ef4444', '#dc2626']}
            style={styles.closeButtonGradient}
          >
            <Ionicons name="lock-closed-outline" size={24} color="#ffffff" />
            <Text style={styles.closeButtonText}>Cerrar Turno</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f9fafb',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  balanceCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  balanceGradient: {
    padding: 24,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  balanceDetails: {
    width: '100%',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
  },
  balanceDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceDetailLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  balanceDetailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  positive: {
    color: '#d1fae5',
  },
  negative: {
    color: '#fecaca',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    margin: '1%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  notesCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  notesText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    marginRight: 8,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
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
    gap: 12,
  },
  pdfButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#8b5cf6',
  },
  pdfButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  pdfButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8b5cf6',
    marginLeft: 8,
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
  closeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 8,
  },
});
