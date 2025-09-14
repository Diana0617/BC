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
  ArrowRightOnRectangleIcon
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
      name: 'Negocios',
      href: '/owner/businesses',
      icon: BuildingOfficeIcon,
      current: location.pathname.startsWith('/owner/businesses')
    },
    {
      name: 'Reportes',
      href: '/owner/reports',
      icon: ChartBarIcon,
      current: location.pathname.startsWith('/owner/reports')
    },
    {
      name: 'Pagos',
      href: '/owner/payments',
      icon: CurrencyDollarIcon,
      current: location.pathname.startsWith('/owner/payments')
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
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar móvil */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75" 
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white pt-5 pb-4">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <XMarkIcon className="h-6 w-6 text-white" />
              </button>
            </div>
            <SidebarContent navigation={navigation} />
          </div>
        </div>
      )}

      {/* Sidebar desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-1 flex-col min-h-0 bg-white shadow">
          <SidebarContent navigation={navigation} />
        </div>
      </div>

      {/* Contenido principal */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white shadow">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Botón menú móvil */}
            <button
              type="button"
              className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            {/* Título de la página */}
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900">
                Panel Administrativo BC
              </h1>
            </div>

            {/* Perfil de usuario */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <UserIcon className="h-6 w-6 text-gray-400" />
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{user?.name || 'Owner'}</p>
                  <p className="text-gray-500">{user?.role || 'OWNER'}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
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
    {/* Logo */}
    <div className="flex items-center h-16 px-4 bg-pink-600">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-pink-600 font-bold text-lg">BC</span>
          </div>
        </div>
        <div className="ml-3">
          <p className="text-white font-semibold">Business Control</p>
          <p className="text-pink-200 text-sm">Panel Admin</p>
        </div>
      </div>
    </div>

    {/* Navegación */}
    <nav className="mt-5 flex-1 px-2 space-y-1">
      {navigation.map((item) => (
        <Link
          key={item.name}
          to={item.href}
          className={`
            group flex items-center px-2 py-2 text-sm font-medium rounded-md
            ${item.current
              ? 'bg-pink-50 border-r-2 border-pink-500 text-pink-700'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }
          `}
        >
          <item.icon
            className={`
              mr-3 h-6 w-6 flex-shrink-0
              ${item.current ? 'text-pink-500' : 'text-gray-400 group-hover:text-gray-500'}
            `}
          />
          {item.name}
        </Link>
      ))}
    </nav>

    {/* Footer del sidebar */}
    <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
      <div className="w-full">
        <div className="text-xs text-gray-500 text-center">
          Business Control v2.0
          <br />
          Sistema de Administración
        </div>
      </div>
    </div>
  </>
);

export default OwnerLayout;