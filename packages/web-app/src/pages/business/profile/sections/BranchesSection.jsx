import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  BuildingOfficeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MapPinIcon,
  PhoneIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { businessBranchesApi } from '@shared/api';

const BranchesSection = ({ isSetupMode, onComplete, isCompleted }) => {
  // Corrección: el estado en businessSlice se llama currentBusiness, no activeBusiness
  const activeBusiness = useSelector(state => state.business.currentBusiness);
  const isLoadingBusiness = useSelector(state => state.business.isLoading);
  
  const [branches, setBranches] = useState([]);
  const [isAddingBranch, setIsAddingBranch] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    address: '',
    city: '',
    state: '',
    country: 'Colombia',
    postalCode: '',
    phone: '',
    email: '',
    isMainBranch: false,
    isActive: true
  });

  // Cargar sucursales existentes
  useEffect(() => {
    if (activeBusiness?.id) {
      loadBranches();
    }
  }, [activeBusiness?.id]);

  const loadBranches = async () => {
    if (!activeBusiness?.id) {
      console.error('No hay negocio activo');
      setError('No se pudo identificar el negocio. Por favor recarga la página.');
      return;
    }
    
    try {
      setLoading(true);
      console.log('📥 Cargando sucursales para negocio:', activeBusiness.id);
      const response = await businessBranchesApi.getBranches(activeBusiness.id);
      const branchesData = (response.data || response || []).map(branch => ({
        ...branch,
        // ✅ Mapear 'status' del backend a 'isActive' para la UI
        isActive: branch.status === 'ACTIVE',
        // ✅ Mapear 'isMain' a 'isMainBranch' para consistencia
        isMainBranch: branch.isMain || branch.isMainBranch
      }));
      console.log('📦 Sucursales recibidas:', branchesData);
      console.log('📊 Estado de cada sucursal:', branchesData.map(b => ({
        id: b.id,
        name: b.name,
        code: b.code,
        status: b.status,
        isActive: b.isActive,
        isMainBranch: b.isMainBranch
      })));
      setBranches(branchesData);
      
      // Si no hay sucursales y estamos en modo setup, crear una por defecto
      if (branchesData.length === 0 && isSetupMode) {
        const defaultBranch = {
          code: generateBranchCode('Principal'),
          name: 'Sucursal Principal',
          address: null,
          city: null,
          state: null,
          country: 'Colombia',
          phone: null,
          email: null,
          isMain: true,
          status: 'ACTIVE'
        };
        
        try {
          await businessBranchesApi.createBranch(activeBusiness.id, defaultBranch);
          await loadBranches(); // Recargar para obtener la sucursal creada
        } catch (createError) {
          console.error('Error creando sucursal por defecto:', createError);
        }
      }
    } catch (err) {
      setError('Error al cargar sucursales');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateBranchCode = (name) => {
    const prefix = name.substring(0, 3).toUpperCase();
    const suffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${suffix}`;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let updatedData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    };
    
    // Generar código automáticamente cuando se ingresa el nombre
    if (name === 'name' && !editingBranch) {
      updatedData.code = generateBranchCode(value);
    }
    
    setFormData(updatedData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!activeBusiness?.id) {
      setError('No se pudo identificar el negocio. Por favor recarga la página.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);

      // ✅ Transformar datos del frontend al formato del backend
      const backendData = {
        ...formData,
        status: formData.isActive ? 'ACTIVE' : 'INACTIVE',
        isMain: formData.isMainBranch,
        zipCode: formData.postalCode
      };
      // Remover campos que no existen en el backend
      delete backendData.isActive;
      delete backendData.isMainBranch;
      delete backendData.postalCode;

      if (editingBranch) {
        // Actualizar sucursal
        await businessBranchesApi.updateBranch(activeBusiness.id, editingBranch.id, backendData);
        await loadBranches();
      } else {
        // Crear nueva sucursal
        await businessBranchesApi.createBranch(activeBusiness.id, backendData);
        await loadBranches();
        
        // Si es el primer registro en modo setup, completar paso
        if (isSetupMode && branches.length === 0 && onComplete) {
          onComplete();
        }
      }

      resetForm();
    } catch (err) {
      setError(err.message || 'Error al guardar sucursal');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (branch) => {
    setEditingBranch(branch);
    setFormData({
      code: branch.code,
      name: branch.name,
      address: branch.address,
      city: branch.city,
      state: branch.state,
      country: branch.country,
      postalCode: branch.zipCode || branch.postalCode || '',
      phone: branch.phone,
      email: branch.email,
      isMainBranch: branch.isMain || branch.isMainBranch,
      isActive: branch.status === 'ACTIVE' || branch.isActive
    });
    setIsAddingBranch(true);
  };

  const handleDelete = async (branchId) => {
    if (!confirm('¿Estás seguro de eliminar esta sucursal?')) return;
    
    if (!activeBusiness?.id) {
      setError('No se pudo identificar el negocio. Por favor recarga la página.');
      return;
    }
    
    try {
      setLoading(true);
      await businessBranchesApi.deleteBranch(activeBusiness.id, branchId);
      await loadBranches();
    } catch (err) {
      setError('Error al eliminar sucursal');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (branchId) => {
    if (!activeBusiness?.id) {
      setError('No se pudo identificar el negocio. Por favor recarga la página.');
      return;
    }
    
    try {
      const branch = branches.find(b => b.id === branchId);
      const newStatus = branch.isActive ? 'INACTIVE' : 'ACTIVE';
      console.log('🔄 Toggle status - Sucursal actual:', {
        id: branch.id,
        name: branch.name,
        statusActual: branch.status,
        isActive: branch.isActive,
        nuevoStatus: newStatus
      });
      
      // ✅ Enviar el objeto completo con 'status' en lugar de 'isActive'
      await businessBranchesApi.updateBranch(activeBusiness.id, branchId, { status: newStatus });
      console.log('✅ Toggle status - Cambio exitoso');
      
      await loadBranches();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al cambiar estado';
      setError(`Error al cambiar estado: ${errorMsg}`);
      console.error('❌ Error en toggleStatus:', err);
      console.error('❌ Detalles del error:', err.response?.data);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      address: '',
      city: '',
      state: '',
      country: 'Colombia',
      postalCode: '',
      phone: '',
      email: '',
      isMainBranch: false,
      isActive: true
    });
    setEditingBranch(null);
    setIsAddingBranch(false);
  };

  const isFormValid = formData.name && formData.address && formData.city;

  // Mostrar loading mientras se carga el negocio
  if (isLoadingBusiness) {
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <BuildingOfficeIcon className="h-12 w-12 text-blue-400 mx-auto mb-3 animate-pulse" />
          <h3 className="text-lg font-medium text-blue-900 mb-2">
            Cargando información del negocio...
          </h3>
          <p className="text-sm text-blue-700">
            Un momento por favor
          </p>
        </div>
      </div>
    );
  }

  // Si no hay negocio activo después de cargar, mostrar mensaje de error
  if (!activeBusiness) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <BuildingOfficeIcon className="h-12 w-12 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-red-900 mb-2">
            No se pudo cargar la información del negocio
          </h3>
          <p className="text-sm text-red-700 mb-4">
            Por favor, recarga la página o inicia sesión nuevamente.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Recargar Página
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <BuildingOfficeIcon className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">Sucursales</h2>
          {isCompleted && !isSetupMode && (
            <CheckCircleIcon className="h-6 w-6 text-green-500 ml-2" />
          )}
        </div>
        
        {!isAddingBranch && (
          <button
            onClick={() => setIsAddingBranch(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Agregar Sucursal
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Lista de sucursales */}
      {branches.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {branches.map((branch) => (
            <div 
              key={branch.id} 
              className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${
                !branch.isActive ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{branch.name}</h3>
                    {branch.isMainBranch && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                        Principal
                      </span>
                    )}
                    {branch.isActive ? (
                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircleIcon className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(branch)}
                    className="p-1 text-gray-400 hover:text-blue-600"
                    title="Editar"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  {!branch.isMainBranch && (
                    <button
                      onClick={() => handleDelete(branch.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Eliminar"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <MapPinIcon className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-600">{branch.address}</p>
                    <p className="text-gray-500">
                      {branch.city}, {branch.state}
                    </p>
                  </div>
                </div>
                
                {branch.phone && (
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-600">{branch.phone}</p>
                  </div>
                )}
                
                {branch.email && (
                  <p className="text-gray-500">{branch.email}</p>
                )}
              </div>

              <div className="mt-3 pt-3 border-t">
                <button
                  onClick={() => toggleStatus(branch.id)}
                  className={`text-sm font-medium ${
                    branch.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'
                  }`}
                >
                  {branch.isActive ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulario */}
      {isAddingBranch && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingBranch ? 'Editar Sucursal' : 'Nueva Sucursal'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Sucursal *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Sucursal Centro"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Calle 123 #45-67"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ciudad *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Bogotá"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Departamento/Estado
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Cundinamarca"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código Postal
              </label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="110111"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+57 300 123 4567"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="sucursal@negocio.com"
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isMainBranch"
                  checked={formData.isMainBranch}
                  onChange={handleInputChange}
                  disabled={branches.some(b => b.isMainBranch && b.id !== editingBranch?.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Sucursal Principal</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Activa</span>
              </label>
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={!isFormValid || loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : editingBranch ? 'Actualizar' : 'Crear Sucursal'}
            </button>
            
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Estado vacío */}
      {branches.length === 0 && !isAddingBranch && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <BuildingOfficeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Sin sucursales registradas
          </h3>
          <p className="text-gray-500 mb-4">
            Crea al menos una sucursal para tu negocio
          </p>
          <button
            onClick={() => setIsAddingBranch(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 inline mr-2" />
            Crear Primera Sucursal
          </button>
        </div>
      )}

      {/* Mensaje de ayuda */}
      {isSetupMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Gestión de Sucursales:</strong> Si tienes múltiples ubicaciones, 
            agrégalas aquí. Los especialistas podrán ser asignados a una o varias sucursales.
          </p>
        </div>
      )}
    </div>
  );
};

export default BranchesSection;
