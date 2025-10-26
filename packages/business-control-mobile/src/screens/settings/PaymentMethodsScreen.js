import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePaymentMethods } from '../../hooks/usePaymentMethods';
import PaymentMethodCard from '../../components/payments/PaymentMethodCard';
import PaymentMethodFormModal from '../../components/payments/PaymentMethodFormModal';

/**
 * Pantalla de configuración de métodos de pago
 * Accesible solo para OWNER
 */
export default function PaymentMethodsScreen({ navigation }) {
  const {
    paymentMethods,
    loading,
    refreshing,
    createPaymentMethod,
    updatePaymentMethod,
    togglePaymentMethod,
    deletePaymentMethod,
    refresh,
  } = usePaymentMethods();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  /**
   * Abrir modal para crear
   */
  const handleCreate = () => {
    setSelectedMethod(null);
    setModalVisible(true);
  };

  /**
   * Abrir modal para editar
   */
  const handleEdit = (method) => {
    setSelectedMethod(method);
    setModalVisible(true);
  };

  /**
   * Guardar método (crear o editar)
   */
  const handleSave = async (methodData) => {
    setActionLoading(true);

    try {
      let result;
      if (selectedMethod) {
        // Editar
        result = await updatePaymentMethod(selectedMethod.id, methodData);
      } else {
        // Crear
        result = await createPaymentMethod(methodData);
      }

      if (result.success) {
        Alert.alert(
          'Éxito',
          selectedMethod
            ? 'Método de pago actualizado correctamente'
            : 'Método de pago creado correctamente'
        );
        setModalVisible(false);
        setSelectedMethod(null);
      } else {
        Alert.alert('Error', result.error || 'No se pudo guardar el método de pago');
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al guardar');
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Toggle activar/desactivar método
   */
  const handleToggle = async (methodId, currentActiveState) => {
    setActionLoading(true);

    try {
      const result = await togglePaymentMethod(methodId, currentActiveState);

      if (result.success) {
        // No mostramos alert, el cambio es visual
      } else {
        Alert.alert('Error', result.error || 'No se pudo cambiar el estado');
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error');
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Eliminar método (hard delete)
   */
  const handleDelete = async (methodId, hardDelete = true) => {
    setActionLoading(true);

    try {
      const result = await deletePaymentMethod(methodId, hardDelete);

      if (result.success) {
        Alert.alert('Éxito', 'Método eliminado correctamente');
      } else {
        Alert.alert('Error', result.error || 'No se pudo eliminar');
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al eliminar');
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Renderizar cada método de pago
   */
  const renderPaymentMethod = ({ item }) => (
    <PaymentMethodCard
      method={item}
      onEdit={handleEdit}
      onToggle={handleToggle}
      onDelete={handleDelete}
      disabled={actionLoading}
    />
  );

  /**
   * Pantalla vacía
   */
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="wallet-outline" size={80} color="#d1d5db" />
      <Text style={styles.emptyTitle}>No hay métodos de pago</Text>
      <Text style={styles.emptySubtitle}>
        Crea tu primer método de pago para empezar a recibir pagos
      </Text>
      <TouchableOpacity onPress={handleCreate} style={styles.emptyButton}>
        <Ionicons name="add-circle" size={20} color="#fff" />
        <Text style={styles.emptyButtonText}>Crear Método</Text>
      </TouchableOpacity>
    </View>
  );

  /**
   * Header de la lista
   */
  const renderListHeader = () => (
    <View style={styles.listHeader}>
      <Text style={styles.listHeaderTitle}>Métodos de Pago Configurados</Text>
      <Text style={styles.listHeaderSubtitle}>
        Gestiona los métodos de pago disponibles para tu negocio
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Métodos de Pago</Text>
          <Text style={styles.headerSubtitle}>
            {paymentMethods.length} método{paymentMethods.length !== 1 ? 's' : ''}
          </Text>
        </View>

        <TouchableOpacity onPress={handleCreate} style={styles.addButton}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Lista de métodos */}
      {loading && paymentMethods.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Cargando métodos de pago...</Text>
        </View>
      ) : (
        <FlatList
          data={paymentMethods}
          renderItem={renderPaymentMethod}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={paymentMethods.length > 0 ? renderListHeader : null}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              colors={['#3b82f6']}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modal de formulario */}
      <PaymentMethodFormModal
        visible={modalVisible}
        method={selectedMethod}
        onSave={handleSave}
        onCancel={() => {
          setModalVisible(false);
          setSelectedMethod(null);
        }}
      />

      {/* Loading overlay */}
      {actionLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingOverlayText}>Procesando...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#3b82f6',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 16,
  },
  listHeader: {
    marginBottom: 20,
  },
  listHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  listHeaderSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingBox: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingOverlayText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
});
