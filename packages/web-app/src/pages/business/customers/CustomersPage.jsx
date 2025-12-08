/**
 * Página de Gestión de Clientes
 * Vista para Owner, Recepcionista y Especialista_Recepcionista
 * 
 * Muestra:
 * - Lista de clientes con filtros
 * - Historial de citas por cliente
 * - Historial de cancelaciones
 * - Vouchers generados y estado
 * - Estado de bloqueo
 * - Estadísticas por cliente
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  TicketIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  ChartBarIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { fetchBusinessVouchers } from '@beautycontrol/shared';
import ClientList from './components/ClientList';
import ClientDetailModal from './components/ClientDetailModal';
import CreateManualVoucherModal from './components/CreateManualVoucherModal';
import ClientFilters from './components/ClientFilters';

const CustomersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Estado local
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all', // all, blocked, with_vouchers, frequent_cancellers
    sortBy: 'recent', // recent, name, cancellations, vouchers
    timeRange: 30 // días
  });

  // Redux state
  const { user } = useSelector(state => state.auth);
  const { currentBusiness } = useSelector(state => state.business);

  // Datos de clientes (TODO: Crear API y thunk para obtener clientes)
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    if (currentBusiness?.id) {
      loadClientsData();
    }
  }, [currentBusiness, filters]);

  const loadClientsData = async () => {
    setLoading(true);
    try {
      // TODO: Implementar API call para obtener clientes
      // const result = await dispatch(fetchBusinessClients({ 
      //   businessId: currentBusiness.id,
      //   ...filters 
      // }));
      
      // Por ahora datos mock
      setClients([]);
    } catch (error) {
      console.error('Error cargando clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar clientes por búsqueda
  const filteredClients = useMemo(() => {
    if (!searchTerm) return clients;
    
    const term = searchTerm.toLowerCase();
    return clients.filter(client => 
      client.name?.toLowerCase().includes(term) ||
      client.email?.toLowerCase().includes(term) ||
      client.phone?.includes(term)
    );
  }, [clients, searchTerm]);

  // Estadísticas generales
  const stats = useMemo(() => {
    return {
      total: clients.length,
      blocked: clients.filter(c => c.isBlocked).length,
      withVouchers: clients.filter(c => c.activeVouchersCount > 0).length,
      frequentCancellers: clients.filter(c => c.cancellationsCount >= 3).length
    };
  }, [clients]);

  const handleClientClick = (client) => {
    setSelectedClient(client);
  };

  const handleCreateVoucher = (client) => {
    setSelectedClient(client);
    setShowVoucherModal(true);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <UserGroupIcon className="h-8 w-8 text-indigo-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Gestión de Clientes
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Historial, cancelaciones y vouchers de tus clientes
                </p>
              </div>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={UserGroupIcon}
              label="Total Clientes"
              value={stats.total}
              color="indigo"
            />
            <StatCard
              icon={ExclamationTriangleIcon}
              label="Bloqueados"
              value={stats.blocked}
              color="red"
            />
            <StatCard
              icon={TicketIcon}
              label="Con Vouchers"
              value={stats.withVouchers}
              color="green"
            />
            <StatCard
              icon={CalendarIcon}
              label="Canceladores Frecuentes"
              value={stats.frequentCancellers}
              color="orange"
            />
          </div>
        </div>
      </div>

      {/* Búsqueda y filtros */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Buscador */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, email o teléfono..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Botón de filtros */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filtros
            </button>
          </div>

          {/* Panel de filtros expandible */}
          {showFilters && (
            <ClientFilters
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          )}
        </div>

        {/* Lista de clientes */}
        <ClientList
          clients={filteredClients}
          loading={loading}
          onClientClick={handleClientClick}
          onCreateVoucher={handleCreateVoucher}
        />
      </div>

      {/* Modal de detalle del cliente */}
      {selectedClient && !showVoucherModal && (
        <ClientDetailModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onCreateVoucher={() => setShowVoucherModal(true)}
        />
      )}

      {/* Modal para crear voucher manual */}
      {showVoucherModal && selectedClient && (
        <CreateManualVoucherModal
          client={selectedClient}
          onClose={() => {
            setShowVoucherModal(false);
            setSelectedClient(null);
          }}
          onSuccess={() => {
            setShowVoucherModal(false);
            loadClientsData(); // Recargar datos
          }}
        />
      )}
    </div>
  );
};

/**
 * Componente de tarjeta de estadística
 */
const StatCard = ({ icon: Icon, label, value, color }) => {
  const colorClasses = {
    indigo: 'bg-indigo-100 text-indigo-600',
    red: 'bg-red-100 text-red-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default CustomersPage;
