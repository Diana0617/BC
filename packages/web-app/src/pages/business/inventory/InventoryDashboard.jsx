import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  PackageIcon,
  ShoppingCartIcon,
  TruckIcon,
  BarChart3Icon,
  HistoryIcon,
  PackagePlusIcon
} from 'lucide-react';
import StockInitial from './stock/StockInitial';

const InventoryDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('stock-inicial');

  const tabs = [
    {
      id: 'stock-inicial',
      name: 'Stock Inicial',
      icon: PackagePlusIcon,
      description: 'Carga el inventario inicial'
    },
    {
      id: 'productos',
      name: 'Productos',
      icon: PackageIcon,
      description: 'Gestión de productos'
    },
    {
      id: 'compras',
      name: 'Compras',
      icon: ShoppingCartIcon,
      description: 'Órdenes de compra a proveedores'
    },
    {
      id: 'ventas',
      name: 'Ventas',
      icon: TruckIcon,
      description: 'Ventas de productos'
    },
    {
      id: 'movimientos',
      name: 'Movimientos',
      icon: HistoryIcon,
      description: 'Historial de movimientos'
    },
    {
      id: 'reportes',
      name: 'Reportes',
      icon: BarChart3Icon,
      description: 'Análisis y reportes'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'stock-inicial':
        return <StockInitial />;
      case 'productos':
        return <ComingSoonPlaceholder title="Productos" />;
      case 'compras':
        return <ComingSoonPlaceholder title="Compras" />;
      case 'ventas':
        return <ComingSoonPlaceholder title="Ventas" />;
      case 'movimientos':
        return <ComingSoonPlaceholder title="Movimientos" />;
      case 'reportes':
        return <ComingSoonPlaceholder title="Reportes" />;
      default:
        return <StockInitial />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                📦 Inventario
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Gestiona productos, stock, compras y ventas
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                    transition-colors duration-200
                    ${isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon
                    className={`
                      -ml-0.5 mr-2 h-5 w-5
                      ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
                    `}
                  />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>
    </div>
  );
};

// Placeholder component para tabs no implementados
const ComingSoonPlaceholder = ({ title }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
      <div className="text-center">
        <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
          <PackageIcon className="h-full w-full" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {title} - Próximamente
        </h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Esta funcionalidad está en desarrollo y estará disponible pronto.
          Por ahora, puedes cargar el stock inicial en la primera pestaña.
        </p>
        <div className="mt-6">
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            🚧 En Construcción
          </span>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;
