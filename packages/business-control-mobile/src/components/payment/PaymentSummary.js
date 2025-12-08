// =====================================================
// PAYMENT SUMMARY - Resumen detallado de pagos
// =====================================================
// Muestra pagos existentes + productos + total pendiente
// =====================================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PaymentSummary = ({
  baseAmount = 0,
  products = [],
  existingPayments = [],
  total = 0,
  showExistingPayments = false,
  showDetails = false,
  onProductsEdit
}) => {

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getPaymentMethodName = (payment) => {
    return payment.paymentMethod?.name || payment.method || 'N/A';
  };

  const getPaymentTypeLabel = (payment) => {
    if (payment.type === 'advance') return 'Anticipado';
    if (payment.type === 'partial') return 'Parcial';
    return 'Pago';
  };

  const productTotal = products.reduce(
    (sum, product) => sum + (product.price * product.quantity), 0
  );

  const paidTotal = existingPayments.reduce(
    (sum, payment) => sum + parseFloat(payment.amount || 0), 0
  );

  const pendingAmount = Math.max(0, baseAmount - paidTotal);

  console.log('💰 PaymentSummary:', {
    baseAmount,
    paidTotal,
    pendingAmount,
    productTotal,
    total
  });

  return (
    <View style={styles.container}>
      {/* Servicio Base */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Servicio</Text>
        <View style={styles.row}>
          <Text style={styles.itemName}>Precio del servicio</Text>
          <Text style={styles.itemPrice}>{formatCurrency(baseAmount)}</Text>
        </View>
      </View>

      {/* Pagos Existentes */}
      {showExistingPayments && existingPayments.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pagos Realizados</Text>
          {existingPayments.map((payment, index) => (
            <View key={index} style={styles.row}>
              <View style={styles.paymentInfo}>
                <Text style={styles.itemName}>
                  {getPaymentTypeLabel(payment)} - {getPaymentMethodName(payment)}
                </Text>
                {payment.reference && (
                  <Text style={styles.paymentReference}>
                    Ref: {payment.reference}
                  </Text>
                )}
                {payment.createdAt && (
                  <Text style={styles.paymentDate}>
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </Text>
                )}
              </View>
              <Text style={styles.paidAmount}>
                -{formatCurrency(payment.amount)}
              </Text>
            </View>
          ))}
          
          {/* Subtotal pagado */}
          <View style={[styles.row, styles.subtotalRow]}>
            <Text style={styles.subtotalText}>Total pagado</Text>
            <Text style={styles.subtotalAmount}>-{formatCurrency(paidTotal)}</Text>
          </View>
        </View>
      )}

      {/* Monto Pendiente del Servicio */}
      {pendingAmount > 0 && (
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.itemName}>Pendiente del servicio</Text>
            <Text style={[styles.itemPrice, styles.pendingAmount]}>
              {formatCurrency(pendingAmount)}
            </Text>
          </View>
        </View>
      )}

      {/* Productos Adicionales */}
      {products.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Productos</Text>
            {onProductsEdit && (
              <TouchableOpacity onPress={onProductsEdit} style={styles.editButton}>
                <Ionicons name="pencil" size={16} color="#3b82f6" />
                <Text style={styles.editButtonText}>Editar</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {products.map((product, index) => (
            <View key={index} style={styles.row}>
              <View style={styles.productInfo}>
                <Text style={styles.itemName}>{product.name}</Text>
                <Text style={styles.productDetails}>
                  {product.quantity} × {formatCurrency(product.price)}
                </Text>
              </View>
              <Text style={styles.itemPrice}>
                {formatCurrency(product.price * product.quantity)}
              </Text>
            </View>
          ))}
          
          {/* Subtotal productos */}
          <View style={[styles.row, styles.subtotalRow]}>
            <Text style={styles.subtotalText}>Total productos</Text>
            <Text style={styles.subtotalAmount}>{formatCurrency(productTotal)}</Text>
          </View>
        </View>
      )}

      {/* Total a Pagar */}
      <View style={[styles.section, styles.totalSection]}>
        <View style={[styles.row, styles.totalRow]}>
          <Text style={styles.totalLabel}>
            {pendingAmount === 0 && productTotal === 0 
              ? 'Total pagado' 
              : 'Total a pagar ahora'}
          </Text>
          <Text style={styles.totalAmount}>
            {formatCurrency(pendingAmount + productTotal)}
          </Text>
        </View>
      </View>

      {/* Estado del Pago */}
      {pendingAmount === 0 && productTotal === 0 && (
        <View style={styles.statusContainer}>
          <View style={styles.statusBadge}>
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            <Text style={styles.statusText}>Servicio completamente pagado</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginVertical: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  itemName: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
  },

  itemPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },

  pendingAmount: {
    color: '#dc2626',
    fontWeight: '600',
  },

  paymentInfo: {
    flex: 1,
  },

  paymentReference: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },

  paymentDate: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },

  paidAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10b981',
  },

  productInfo: {
    flex: 1,
  },

  productDetails: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },

  subtotalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },

  subtotalText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },

  subtotalAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },

  totalSection: {
    backgroundColor: '#f8fafc',
    borderBottomWidth: 0,
  },

  totalRow: {
    marginBottom: 0,
  },

  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },

  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },

  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  editButtonText: {
    fontSize: 12,
    color: '#3b82f6',
    marginLeft: 4,
    fontWeight: '500',
  },

  statusContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },

  statusText: {
    fontSize: 14,
    color: '#065f46',
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default PaymentSummary;