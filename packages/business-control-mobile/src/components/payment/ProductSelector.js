// =====================================================
// PRODUCT SELECTOR - Selector de productos adicionales
// =====================================================
// Permite agregar productos adicionales al pago del turno
// =====================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ProductSelector = ({
  visible,
  appointment,
  onProductsUpdate,
  onClose
}) => {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadAvailableProducts();
    }
  }, [visible]);

  const loadAvailableProducts = async () => {
    setLoading(true);
    try {
      // Aquí cargarías los productos disponibles desde la API
      // const response = await fetch(`/api/products?businessId=${businessId}`);
      // const data = await response.json();
      
      // Mock data por ahora
      const mockProducts = [
        { id: '1', name: 'Serum Vitamina C', price: 45000, stock: 10 },
        { id: '2', name: 'Crema Hidratante', price: 35000, stock: 5 },
        { id: '3', name: 'Protector Solar', price: 28000, stock: 8 },
      ];
      
      setProducts(mockProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Error', 'No se pudieron cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const addProduct = (product) => {
    const existing = selectedProducts.find(p => p.id === product.id);
    if (existing) {
      if (existing.quantity < product.stock) {
        setSelectedProducts(prev => 
          prev.map(p => 
            p.id === product.id 
              ? { ...p, quantity: p.quantity + 1 }
              : p
          )
        );
      } else {
        Alert.alert('Stock insuficiente', 'No hay más stock disponible');
      }
    } else {
      setSelectedProducts(prev => [...prev, { 
        ...product, 
        quantity: 1 
      }]);
    }
  };

  const removeProduct = (productId) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeProduct(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (quantity > product.stock) {
      Alert.alert('Stock insuficiente', 'No hay suficiente stock disponible');
      return;
    }

    setSelectedProducts(prev => 
      prev.map(p => 
        p.id === productId 
          ? { ...p, quantity }
          : p
      )
    );
  };

  const getTotalAmount = () => {
    return selectedProducts.reduce((sum, product) => 
      sum + (product.price * product.quantity), 0
    );
  };

  const handleConfirm = () => {
    onProductsUpdate?.(selectedProducts);
    onClose?.();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Productos Adicionales</Text>
          
          <TouchableOpacity 
            onPress={handleConfirm}
            style={styles.doneButton}
          >
            <Text style={styles.doneButtonText}>Listo</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text>Cargando productos...</Text>
            </View>
          ) : (
            <>
              {/* Productos Disponibles */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Productos Disponibles</Text>
                
                {products.map(product => (
                  <View key={product.id} style={styles.productCard}>
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>{product.name}</Text>
                      <Text style={styles.productPrice}>
                        {formatCurrency(product.price)}
                      </Text>
                      <Text style={styles.productStock}>
                        Stock: {product.stock}
                      </Text>
                    </View>
                    
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => addProduct(product)}
                    >
                      <Ionicons name="add" size={20} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {/* Productos Seleccionados */}
              {selectedProducts.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Productos Seleccionados</Text>
                  
                  {selectedProducts.map(product => (
                    <View key={product.id} style={styles.selectedProductCard}>
                      <View style={styles.selectedProductInfo}>
                        <Text style={styles.selectedProductName}>
                          {product.name}
                        </Text>
                        <Text style={styles.selectedProductPrice}>
                          {formatCurrency(product.price)} × {product.quantity}
                        </Text>
                        <Text style={styles.selectedProductTotal}>
                          Total: {formatCurrency(product.price * product.quantity)}
                        </Text>
                      </View>
                      
                      <View style={styles.quantityControls}>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => updateQuantity(product.id, product.quantity - 1)}
                        >
                          <Ionicons name="remove" size={16} color="#374151" />
                        </TouchableOpacity>
                        
                        <Text style={styles.quantityText}>{product.quantity}</Text>
                        
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => updateQuantity(product.id, product.quantity + 1)}
                        >
                          <Ionicons name="add" size={16} color="#374151" />
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => removeProduct(product.id)}
                        >
                          <Ionicons name="trash-outline" size={16} color="#dc2626" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                  
                  {/* Total */}
                  <View style={styles.totalCard}>
                    <Text style={styles.totalLabel}>Total Productos</Text>
                    <Text style={styles.totalAmount}>
                      {formatCurrency(getTotalAmount())}
                    </Text>
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },

  closeButton: {
    padding: 8,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },

  doneButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 6,
  },

  doneButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },

  section: {
    marginTop: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },

  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  productInfo: {
    flex: 1,
  },

  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },

  productPrice: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
    marginBottom: 2,
  },

  productStock: {
    fontSize: 12,
    color: '#6b7280',
  },

  addButton: {
    backgroundColor: '#10b981',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedProductCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  selectedProductInfo: {
    flex: 1,
  },

  selectedProductName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },

  selectedProductPrice: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },

  selectedProductTotal: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
  },

  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  quantityButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    minWidth: 24,
    textAlign: 'center',
  },

  removeButton: {
    backgroundColor: '#fef2f2',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  totalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },

  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },

  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10b981',
  },
});

export default ProductSelector;