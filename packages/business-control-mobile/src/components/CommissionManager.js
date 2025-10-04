import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  FlatList,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import useCommissionManager from '../hooks/useCommissionManager';

const CommissionManager = ({ 
  specialistId,
  businessId,
  onPaymentRequestCreated 
}) => {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'requested', 'paid'
  const [refreshing, setRefreshing] = useState(false);

  const {
    loading,
    commissions,
    paymentRequests,
    selectedCommissions,
    summary,
    loadCommissions,
    loadPaymentRequests,
    toggleCommissionSelection,
    selectAllPendingCommissions,
    clearSelection,
    getSelectedTotal,
    createPaymentRequest,
    getCommissionsByStatus,
    getPaymentHistory,
    formatCurrency
  } = useCommissionManager(specialistId);

  useEffect(() => {
    if (specialistId) {
      loadData();
    }
  }, [specialistId]);

  const loadData = async () => {
    await Promise.all([
      loadCommissions(),
      loadPaymentRequests()
    ]);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleCreatePaymentRequest = async () => {
    if (selectedCommissions.size === 0) {
      Alert.alert('Error', 'Selecciona al menos una comisión para crear la solicitud');
      return;
    }

    Alert.alert(
      'Crear Solicitud de Pago',
      `¿Crear solicitud por ${formatCurrency(getSelectedTotal())}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Crear', 
          onPress: async () => {
            const result = await createPaymentRequest();
            if (result && onPaymentRequestCreated) {
              onPaymentRequestCreated(result);
            }
          }
        }
      ]
    );
  };

  const renderTabButton = (tab, title, count) => {
    const isActive = activeTab === tab;
    return (
      <TouchableOpacity
        onPress={() => setActiveTab(tab)}
        className={`flex-1 py-3 px-4 rounded-lg mr-2 ${
          isActive ? 'bg-blue-500' : 'bg-gray-100'
        }`}
      >
        <Text className={`text-center font-medium ${
          isActive ? 'text-white' : 'text-gray-600'
        }`}>
          {title}
        </Text>
        <Text className={`text-center text-sm ${
          isActive ? 'text-blue-100' : 'text-gray-500'
        }`}>
          {count}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderCommissionItem = ({ item }) => {
    const isSelected = selectedCommissions.has(item.id);
    
    return (
      <TouchableOpacity
        onPress={() => toggleCommissionSelection(item.id)}
        className={`bg-white rounded-lg p-4 mb-3 border ${
          isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
        }`}
      >
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-1">
            <Text className="font-medium text-gray-900 mb-1">
              {item.service?.name || 'Servicio'}
            </Text>
            <Text className="text-sm text-gray-600">
              Cliente: {item.appointment?.client?.name}
            </Text>
            <Text className="text-xs text-gray-500">
              {new Date(item.appointmentDate).toLocaleDateString()}
            </Text>
          </View>
          
          <View className="items-end">
            <Text className="font-bold text-blue-600">
              {formatCurrency(item.commissionAmount)}
            </Text>
            <Text className="text-xs text-gray-500">
              {item.commissionPercentage}%
            </Text>
          </View>
          
          {isSelected && (
            <View className="ml-3">
              <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
            </View>
          )}
        </View>
        
        {item.notes && (
          <Text className="text-sm text-gray-600 mt-2">
            Nota: {item.notes}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderPaymentRequestItem = ({ item }) => {
    const statusColor = {
      pending: '#F59E0B',
      approved: '#10B981',
      paid: '#10B981',
      rejected: '#EF4444'
    }[item.status] || '#6B7280';

    const statusText = {
      pending: 'Pendiente',
      approved: 'Aprobada',
      paid: 'Pagada',
      rejected: 'Rechazada'
    }[item.status] || 'Desconocido';

    return (
      <View className="bg-white rounded-lg p-4 mb-3 border border-gray-200">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-1">
            <Text className="font-medium text-gray-900">
              Solicitud #{item.requestNumber || item.id.substring(0, 8)}
            </Text>
            <Text className="text-sm text-gray-600">
              {item.commissionCount} comisiones
            </Text>
            <Text className="text-xs text-gray-500">
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
          
          <View className="items-end">
            <Text className="font-bold text-gray-900">
              {formatCurrency(item.totalAmount)}
            </Text>
            <View 
              className="px-2 py-1 rounded-full"
              style={{ backgroundColor: statusColor + '20' }}
            >
              <Text 
                className="text-xs font-medium"
                style={{ color: statusColor }}
              >
                {statusText}
              </Text>
            </View>
          </View>
        </View>

        {item.notes && (
          <Text className="text-sm text-gray-600 mt-2">
            {item.notes}
          </Text>
        )}

        {item.status === 'paid' && item.paidDate && (
          <Text className="text-xs text-green-600 mt-1">
            Pagado el {new Date(item.paidDate).toLocaleDateString()}
          </Text>
        )}
      </View>
    );
  };

  const renderSummaryCard = () => {
    return (
      <View className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 mb-6">
        <Text className="text-white font-bold text-lg mb-3">
          Resumen de Comisiones
        </Text>
        
        <View className="flex-row justify-between">
          <View className="flex-1">
            <Text className="text-blue-100 text-sm">Pendientes</Text>
            <Text className="text-white font-bold">
              {summary.pending}
            </Text>
            <Text className="text-blue-100 text-xs">
              {formatCurrency(summary.totalPending)}
            </Text>
          </View>
          
          <View className="flex-1">
            <Text className="text-blue-100 text-sm">Solicitadas</Text>
            <Text className="text-white font-bold">
              {summary.requested}
            </Text>
            <Text className="text-blue-100 text-xs">
              {formatCurrency(summary.totalRequested)}
            </Text>
          </View>
          
          <View className="flex-1">
            <Text className="text-blue-100 text-sm">Pagadas</Text>
            <Text className="text-white font-bold">
              {summary.paid}
            </Text>
            <Text className="text-blue-100 text-xs">
              {formatCurrency(summary.totalPaid)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderSelectionBar = () => {
    if (activeTab !== 'pending' || selectedCommissions.size === 0) {
      return null;
    }

    return (
      <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-blue-800 font-medium">
              {selectedCommissions.size} comisiones seleccionadas
            </Text>
            <Text className="text-blue-600 text-sm">
              Total: {formatCurrency(getSelectedTotal())}
            </Text>
          </View>
          
          <View className="flex-row space-x-2">
            <TouchableOpacity
              onPress={clearSelection}
              className="bg-gray-200 px-3 py-2 rounded-lg"
            >
              <Text className="text-gray-700 text-sm">Limpiar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleCreatePaymentRequest}
              className="bg-blue-500 px-4 py-2 rounded-lg"
            >
              <Text className="text-white text-sm font-medium">
                Crear Solicitud
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const getTabData = () => {
    switch (activeTab) {
      case 'pending':
        return getCommissionsByStatus('pending');
      case 'requested':
        return getCommissionsByStatus('payment_requested');
      case 'paid':
        return getPaymentHistory();
      default:
        return [];
    }
  };

  const renderContent = () => {
    const data = getTabData();
    const isPaymentRequests = activeTab === 'paid';

    if (loading && data.length === 0) {
      return (
        <View className="flex-1 items-center justify-center py-12">
          <Text className="text-gray-500">Cargando comisiones...</Text>
        </View>
      );
    }

    if (data.length === 0) {
      const emptyMessages = {
        pending: 'No tienes comisiones pendientes',
        requested: 'No tienes solicitudes de pago',
        paid: 'No tienes pagos realizados'
      };

      return (
        <View className="flex-1 items-center justify-center py-12">
          <Ionicons 
            name="wallet-outline" 
            size={48} 
            color="#9CA3AF" 
          />
          <Text className="text-gray-500 text-center mt-4">
            {emptyMessages[activeTab]}
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={data}
        renderItem={isPaymentRequests ? renderPaymentRequestItem : renderCommissionItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView 
        className="flex-1 p-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Resumen */}
        {renderSummaryCard()}

        {/* Tabs */}
        <View className="flex-row mb-4">
          {renderTabButton('pending', 'Pendientes', summary.pending)}
          {renderTabButton('requested', 'Solicitadas', summary.requested)}
          {renderTabButton('paid', 'Pagadas', summary.paid)}
        </View>

        {/* Barra de selección */}
        {renderSelectionBar()}

        {/* Botón seleccionar todas (solo en tab pendientes) */}
        {activeTab === 'pending' && getCommissionsByStatus('pending').length > 0 && (
          <TouchableOpacity
            onPress={selectAllPendingCommissions}
            className="bg-white border border-gray-200 rounded-lg p-3 mb-4"
          >
            <Text className="text-blue-600 text-center font-medium">
              Seleccionar Todas las Pendientes
            </Text>
          </TouchableOpacity>
        )}

        {/* Contenido principal */}
        {renderContent()}
      </ScrollView>
    </View>
  );
};

export default CommissionManager;