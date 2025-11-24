import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { 
  checkShouldUseCashRegister, 
  getActiveShift,
  selectShouldUseCashRegister,
  selectActiveShift,
  selectCashRegisterLoading
} from '@shared/store/slices';

/**
 * Componente que muestra el estado de la caja registradora
 * Se integra en los dashboards de Receptionist y Specialist
 */
export default function CashRegisterCard({ navigation, businessId }) {
  const dispatch = useDispatch();
  const shouldUse = useSelector(selectShouldUseCashRegister);
  const activeShift = useSelector(selectActiveShift);
  const loading = useSelector(selectCashRegisterLoading);

  useEffect(() => {
    if (businessId) {
      // Verificar si el usuario debe usar caja registradora
      dispatch(checkShouldUseCashRegister({ businessId }));
      // Obtener turno activo si existe
      dispatch(getActiveShift({ businessId }));
    }
  }, [businessId, dispatch]);

  // No mostrar nada si el usuario no debe usar caja
  if (!shouldUse) {
    return null;
  }

  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  const hasActiveShift = activeShift !== null;

  const handlePress = () => {
    if (hasActiveShift) {
      navigation.navigate('ActiveShift', { businessId });
    } else {
      navigation.navigate('OpenShift', { businessId });
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={hasActiveShift ? ['#10b981', '#059669'] : ['#8b5cf6', '#7c3aed']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={hasActiveShift ? 'cash-outline' : 'lock-closed-outline'}
              size={28}
              color="#ffffff"
            />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>Caja Registradora</Text>
            <Text style={styles.subtitle}>
              {hasActiveShift ? 'Turno Abierto' : 'Sin turno activo'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ffffff" />
        </View>

        {hasActiveShift && activeShift && (
          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Balance Inicial:</Text>
              <Text style={styles.detailValue}>
                ${activeShift.openingBalance?.toLocaleString() || '0'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Hora Apertura:</Text>
              <Text style={styles.detailValue}>
                {new Date(activeShift.openedAt).toLocaleTimeString('es-CO', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>
        )}

        {!hasActiveShift && (
          <View style={styles.actionHint}>
            <Ionicons name="information-circle-outline" size={16} color="#ffffff" />
            <Text style={styles.actionHintText}>
              Toca para abrir turno de caja
            </Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  gradient: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  details: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  actionHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  actionHintText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: 6,
    fontStyle: 'italic',
  },
});
