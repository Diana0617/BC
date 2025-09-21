import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../../shared/src/index.js';
import { 
  HomeIcon, 
  CubeIcon, 
  DocumentTextIcon, 
  BuildingOfficeIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  ClipboardDocumentListIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

/**
 * Layout principal para el panel administrativo del Owner
 */
const OwnerLayout = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector(state => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Navegación principal
  const navigation = [
    {
      name: 'Dashboard',
      href: '/owner/dashboard',
      icon: HomeIcon,
      current: location.pathname === '/owner/dashboard'
    },
    {
      name: 'Planes',
      href: '/owner/plans',
      icon: DocumentTextIcon,
      current: location.pathname.startsWith('/owner/plans')
    },
    {
      name: 'Módulos',
      href: '/owner/modules',
      icon: CubeIcon,
      current: location.pathname.startsWith('/owner/modules')
    },
    {
      name: 'Plantillas de Reglas',
      href: '/owner/rule-templates',
      icon: ClipboardDocumentListIcon,
      current: location.pathname.startsWith('/owner/rule-templates')
    },
    {
      name: 'Negocios',
      href: '/owner/businesses',
      icon: BuildingOfficeIcon,
      current: location.pathname.startsWith('/owner/businesses')
    },
    {
      name: 'Suscripciones',
      href: '/owner/subscriptions',
      icon: CreditCardIcon,
      current: location.pathname.startsWith('/owner/subscriptions')
    },
    {
      name: 'Reportes',
      href: '/owner/reports',
      icon: ChartBarIcon,
      current: location.pathname.startsWith('/owner/reports')
    },
    {
      name: 'Gastos',
      href: '/owner/expenses',
      icon: CurrencyDollarIcon,
      current: location.pathname.startsWith('/owner/expenses')
    },
    {
      name: 'Configuración',
      href: '/owner/settings',
      icon: Cog6ToothIcon,
      current: location.pathname.startsWith('/owner/settings')
    }
  ];

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
  <div className="min-h-screen bg-gradient-to-b from-gray-50 to-cyan-50">
      {/* Sidebar móvil */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div 
            className="fixed inset-0 bg-gray-900 bg-opacity-80" 
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-gradient-to-b from-gray-900 to-cyan-900 pt-5 pb-4 shadow-2xl">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            <SidebarContent navigation={navigation} isMobile={true} />
          </div>
        </div>
      )}

      {/* Sidebar desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-1 flex-col min-h-0 bg-gradient-to-b from-cyan-700 to-cyan-900 shadow-lg">
          <SidebarContent navigation={navigation} />
        </div>
      </div>

      {/* Contenido principal */}
  <div className="lg:pl-64 flex flex-col flex-1 min-h-screen bg-gradient-to-b from-cyan-50 to-white">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-cyan-700 via-cyan-800 to-cyan-900 shadow">
          <div className="flex h-16 items-center justify-between px-2 sm:px-6 lg:px-8">
            {/* Botón menú móvil */}
            <button
              type="button"
              className="border-r border-gray-200 px-4 text-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            {/* Título de la página */}
            <div className="flex-1 flex items-center">
              <Link to="/" className="flex items-center group">
                <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center shadow-lg transition hover:scale-105">
                  <span className="text-cyan-700 font-bold text-xl">BC</span>
                </div>
                <span className="ml-2 text-lg font-bold text-white group-hover:text-yellow-300 transition">Business Control</span>
              </Link>
              <span className="ml-4 text-base font-semibold text-cyan-200 hidden sm:inline">Panel Owner</span>
            </div>

            {/* Perfil de usuario */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <UserIcon className="h-6 w-6 text-cyan-200" />
                <div className="text-sm">
                  <p className="font-medium text-white">{user?.name || 'Owner'}</p>
                  <p className="text-cyan-100">{user?.role || 'OWNER'}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-cyan-200 hover:text-yellow-300 px-3 py-2 rounded-md text-sm font-medium transition"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                <span>Salir</span>
              </button>
            </div>
          </div>
        </div>

        {/* Contenido de la página */}
        <main className="flex-1 pb-8">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

/**
 * Contenido del sidebar compartido entre desktop y móvil
 */
const SidebarContent = ({ navigation }) => (
  <>
    {/* Logo responsive y navegación al home */}
    <div className={`flex items-center h-16 px-2 ${typeof isMobile !== 'undefined' && isMobile ? 'bg-gray-900' : 'bg-gradient-to-r from-cyan-700 via-cyan-800 to-cyan-900'}`}>
      <Link to="/" className="flex items-center group">
        <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center shadow-lg transition hover:scale-105">
          <span className="text-cyan-700 font-bold text-lg">BC</span>
        </div>
        <span className={`ml-2 font-semibold transition ${typeof isMobile !== 'undefined' && isMobile ? 'text-gray-100 group-hover:text-yellow-300' : 'text-white group-hover:text-yellow-300'}`}>Business Control</span>
      </Link>
      <span className={`ml-2 text-xs hidden sm:inline ${typeof isMobile !== 'undefined' && isMobile ? 'text-gray-300' : 'text-cyan-200'}`}>Panel Owner</span>
    </div>

    {/* Navegación */}
  <nav className="mt-5 flex-1 px-2 space-y-1">
      {navigation.map((item) => (
        <Link
          key={item.name}
          to={item.href}
          className={`
            group flex items-center px-2 py-2 text-base font-semibold rounded-md transition
            ${item.current
              ? (typeof isMobile !== 'undefined' && isMobile ? 'bg-cyan-200 text-cyan-900 shadow' : 'bg-cyan-100 border-r-2 border-cyan-400 text-cyan-900 shadow')
              : (typeof isMobile !== 'undefined' && isMobile ? 'text-gray-100 hover:bg-cyan-900 hover:text-yellow-300' : 'text-cyan-50 hover:bg-cyan-800 hover:text-yellow-300')
            }
          `}
        >
          <item.icon
            className={`
              mr-3 h-6 w-6 flex-shrink-0
              ${item.current ? 'text-cyan-500' : (typeof isMobile !== 'undefined' && isMobile ? 'text-gray-300 group-hover:text-yellow-300' : 'text-cyan-200 group-hover:text-yellow-300')}
            `}
          />
          {item.name}
        </Link>
      ))}
    </nav>

    {/* Footer del sidebar */}
    <div className="flex-shrink-0 flex border-t border-cyan-800 p-4">
      <div className="w-full">
        <div className="text-xs text-cyan-200 text-center">
          Business Control v2.0
          <br />
          Sistema de Administración
        </div>
      </div>
    </div>
  </>
);

export default OwnerLayout;