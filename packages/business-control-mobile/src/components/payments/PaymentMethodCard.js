import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * Obtener color según tipo de método de pago
 */
const getMethodColor = (type) => {
  const colors = {
    CASH: '#10b981',      // Verde
    CARD: '#3b82f6',      // Azul
    TRANSFER: '#8b5cf6',  // Púrpura
    QR: '#f59e0b',        // Naranja
    ONLINE: '#06b6d4',    // Cyan
    OTHER: '#6b7280',     // Gris
  };
  return colors[type] || colors.OTHER;
};

/**
 * Componente para mostrar cada método de pago
 */
export default function PaymentMethodCard({ 
  method, 
  onEdit, 
  onToggle, 
  onDelete,
  disabled = false,
}) {
  const color = getMethodColor(method.type);
  const isActive = method.isActive;

  const handleToggle = () => {
    Alert.alert(
      isActive ? 'Desactivar Método' : 'Activar Método',
      `¿Deseas ${isActive ? 'desactivar' : 'activar'} el método "${method.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: isActive ? 'Desactivar' : 'Activar',
          style: isActive ? 'destructive' : 'default',
          onPress: () => onToggle(method.id, isActive),
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar Método',
      `¿Estás seguro de eliminar "${method.name}"?\n\nEsta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => onDelete(method.id, true), // Hard delete
        },
      ]
    );
  };

  return (
    <View style={[styles.container, !isActive && styles.containerInactive]}>
      <LinearGradient
        colors={isActive ? [color, `${color}DD`] : ['#9ca3af', '#6b7280']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconContainer, !isActive && styles.iconInactive]}>
              <Ionicons name={method.icon || 'cash-outline'} size={24} color="#fff" />
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.name}>{method.name}</Text>
              <Text style={styles.type}>{method.type}</Text>
            </View>
          </View>

          {/* Toggle Active */}
          <TouchableOpacity
            onPress={handleToggle}
            disabled={disabled}
            style={styles.toggleButton}
          >
            <Ionicons
              name={isActive ? 'checkmark-circle' : 'close-circle'}
              size={28}
              color={isActive ? '#10b981' : '#ef4444'}
            />
          </TouchableOpacity>
        </View>

        {/* Info adicional */}
        <View style={styles.info}>
          {method.requiresProof && (
            <View style={styles.badge}>
              <Ionicons name="document-attach-outline" size={14} color="#fff" />
              <Text style={styles.badgeText}>Requiere comprobante</Text>
            </View>
          )}

          {method.bankInfo && (
            <View style={styles.bankInfo}>
              {method.bankInfo.phoneNumber && (
                <Text style={styles.bankInfoText}>
                  📱 {method.bankInfo.phoneNumber}
                </Text>
              )}
              {method.bankInfo.accountNumber && (
                <Text style={styles.bankInfoText}>
                  🏦 {method.bankInfo.bankName || 'Banco'} - ****{method.bankInfo.accountNumber.slice(-4)}
                </Text>
              )}
              {method.bankInfo.holderName && (
                <Text style={styles.bankInfoText}>
                  👤 {method.bankInfo.holderName}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => onEdit(method)}
            disabled={disabled}
            style={[styles.actionButton, styles.editButton]}
          >
            <Ionicons name="pencil" size={18} color="#fff" />
            <Text style={styles.actionText}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDelete}
            disabled={disabled}
            style={[styles.actionButton, styles.deleteButton]}
          >
            <Ionicons name="trash-outline" size={18} color="#fff" />
            <Text style={styles.actionText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Indicador de orden */}
      <View style={styles.orderIndicator}>
        <Text style={styles.orderText}>#{method.order}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  containerInactive: {
    opacity: 0.7,
  },
  gradient: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  titleContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  type: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  toggleButton: {
    padding: 4,
  },
  info: {
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
  },
  bankInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 10,
    borderRadius: 8,
  },
  bankInfoText: {
    fontSize: 12,
    color: '#fff',
    marginBottom: 4,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
  },
  editButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  orderIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  orderText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
});
