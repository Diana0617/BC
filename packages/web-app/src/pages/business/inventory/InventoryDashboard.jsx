import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCurrentBusiness } from '@shared/store/slices/businessSlice';
import {
  PackageIcon,
  ShoppingCartIcon,
  TruckIcon,
  BarChart3Icon,
  HistoryIcon,
  PackagePlusIcon,
  Warehouse,
  ArrowLeftIcon,
  HomeIcon,
  BookOpenIcon
} from 'lucide-react';
import StockInitial from './stock/StockInitial';
import BranchInventoryView from './stock/BranchInventoryView';
import PurchaseInvoices from './purchases/PurchaseInvoices';
import ProductManagement from './products/ProductManagement';
import SupplierCatalog from './catalog/SupplierCatalog';
import SalesPage from '../../sales/SalesPage';
import InventoryMovements from '../../inventory/movements/InventoryMovements';

const InventoryDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const branding = useSelector(state => state.businessConfiguration?.branding);
  const business = useSelector(state => state.business?.currentBusiness);
  const [activeSection, setActiveSection] = useState('inventario');

  // Cargar el business actual cuando se monta el componente
  useEffect(() => {
    if (!business) {
      console.log('📦 InventoryDashboard - Loading current business...');
      dispatch(fetchCurrentBusiness());
    }
  }, [dispatch, business]);

  const sections = [
    {
      id: 'inventario',
      name: 'Inventario',
      icon: Warehouse,
      description: 'Vista de inventario por sucursal',
      component: <BranchInventoryView />
    },
    {
      id: 'stock-inicial',
      name: 'Stock Inicial',
      icon: PackagePlusIcon,
      description: 'Carga el inventario inicial',
      component: <StockInitial />
    },
    {
      id: 'compras',
      name: 'Compras',
      icon: ShoppingCartIcon,
      description: 'Facturas de compras a proveedores',
      component: <PurchaseInvoices />
    },
    {
      id: 'productos',
      name: 'Productos',
      icon: PackageIcon,
      description: 'Gestión de productos',
      component: <ProductManagement />
    },
    {
      id: 'catalogo',
      name: 'Catálogo',
      icon: BookOpenIcon,
      description: 'Catálogo de productos de proveedores',
      component: <SupplierCatalog />
    },
    {
      id: 'ventas',
      name: 'Ventas',
      icon: TruckIcon,
      description: 'Ventas de productos',
      component: <SalesPage />
    },
    {
      id: 'movimientos',
      name: 'Movimientos',
      icon: HistoryIcon,
      description: 'Historial de movimientos',
      component: <InventoryMovements />
    },
    {
      id: 'reportes',
      name: 'Reportes',
      icon: BarChart3Icon,
      description: 'Análisis y reportes',
      component: <ComingSoonPlaceholder title="Reportes" />
    }
  ];

  const activeContent = sections.find(s => s.id === activeSection)?.component;

  const handleBackToProfile = () => {
    navigate('/business/profile');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Mobile First */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo y título */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {branding?.logo ? (
                <img 
                  src={branding.logo} 
                  alt={business?.name || 'Logo'} 
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover"
                />
              ) : (
                <div 
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${branding?.primaryColor || '#2563eb'}20` }}
                >
                  <Warehouse 
                    className="h-5 w-5 sm:h-6 sm:w-6" 
                    style={{ color: branding?.primaryColor || '#2563eb' }}
                  />
                </div>
              )}
              <div className="hidden sm:block">
                <h1 
                  className="text-lg sm:text-xl font-semibold"
                  style={{ color: branding?.primaryColor || '#111827' }}
                >
                  📦 Inventario
                </h1>
                <p className="text-xs text-gray-500 hidden md:block">
                  {business?.name || 'Mi Negocio'}
                </p>
              </div>
              <h1 className="text-base font-semibold sm:hidden" style={{ color: branding?.primaryColor || '#111827' }}>
                📦 Inventario
              </h1>
            </div>

            {/* Botón volver al perfil */}
            <button
              onClick={handleBackToProfile}
              className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors hover:bg-gray-100"
              style={{ color: branding?.primaryColor || '#2563eb' }}
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Volver al Perfil</span>
              <span className="sm:hidden">Perfil</span>
            </button>
          </div>
        </div>
      </div>

      {/* Layout Principal: Sidebar + Contenido */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Sidebar de navegación - Desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sticky top-20">
              <nav className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;

                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'border-l-4'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                      style={isActive ? {
                        backgroundColor: `${branding?.primaryColor || '#dbeafe'}20`,
                        borderLeftColor: branding?.primaryColor || '#2563eb',
                        color: branding?.primaryColor || '#1d4ed8'
                      } : {}}
                    >
                      <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                      <span className="flex-1 text-left">{section.name}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Botón volver al perfil - Desktop */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={handleBackToProfile}
                  className="w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <HomeIcon className="h-5 w-5 mr-3" />
                  <span>Panel Principal</span>
                </button>
              </div>
            </div>
          </div>

          {/* Navegación Mobile - Tabs horizontales */}
          <div className="lg:hidden col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <nav className="flex space-x-1 p-2" aria-label="Tabs">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;
                    
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`flex-shrink-0 inline-flex flex-col items-center justify-center px-3 py-2 rounded-lg text-xs font-medium transition-colors min-w-[70px] ${
                          isActive
                            ? 'shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                        style={isActive ? {
                          backgroundColor: `${branding?.primaryColor || '#2563eb'}15`,
                          color: branding?.primaryColor || '#2563eb'
                        } : {}}
                      >
                        <Icon className="h-5 w-5 mb-1" />
                        <span className="text-center leading-tight">{section.name}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="lg:col-span-3">
            {activeContent}
          </div>
        </div>
      </div>
    </div>
  );
};

// Placeholder component para tabs no implementados
const ComingSoonPlaceholder = ({ title }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12">
      <div className="text-center">
        <div className="mx-auto h-16 w-16 sm:h-24 sm:w-24 text-gray-300 mb-4">
          <PackageIcon className="h-full w-full" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
          {title} - Próximamente
        </h3>
        <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto">
          Esta funcionalidad está en desarrollo y estará disponible pronto.
        </p>
        <div className="mt-6">
          <span className="inline-flex items-center px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800">
            🚧 En Construcción
          </span>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;
