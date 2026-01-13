/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  PlusIcon,
  ChartBarIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline';
import CreateSaleModal from '../../components/sales/CreateSaleModal';
import SalesList from '../../components/sales/SalesList';

const SalesPage = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const user = useSelector(state => state.auth?.user);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <ShoppingCartIcon className="h-8 w-8 text-blue-600" />
                Ventas
              </h1>
              <p className="mt-2 text-gray-600">
                Registra y gestiona las ventas de productos
              </p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg transition-all"
            >
              <PlusIcon className="h-5 w-5" />
              Nueva Venta
            </button>
          </div>
        </div>

        {/* Stats Cards (opcional - para implementar después) */}
        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ventas Hoy</p>
                <p className="text-2xl font-bold text-gray-900">15</p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div> */}

        {/* Lista de Ventas */}
        <SalesList />

        {/* Modal */}
        <CreateSaleModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      </div>
    </div>
  );
};

export default SalesPage;
