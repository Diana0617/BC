import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  WrenchScrewdriverIcon,
  ServerIcon,
  CircleStackIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  TrashIcon,
  PlayIcon,
  StopIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { apiClient } from '@shared/api/client';

const DeveloperPanel = () => {
  const { user, token } = useSelector(state => state.auth);
  const [maintenanceMode, setMaintenanceMode] = useState({
    enabled: false,
    message: '',
    estimatedEndTime: ''
  });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [queryInput, setQueryInput] = useState('');
  const [queryResults, setQueryResults] = useState(null);
  const [deleteForm, setDeleteForm] = useState({
    table: 'users',
    id: '',
    confirmationCode: ''
  });

  // ✅ Hooks ANTES de cualquier return condicional
  useEffect(() => {
    if (user?.role === 'OWNER') {
      loadMaintenanceMode();
      loadStats();
    }
  }, [user?.role]);

  // Verificar que el usuario sea OWNER
  if (user?.role !== 'OWNER') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Acceso Denegado
          </h2>
          <p className="text-gray-600 text-center">
            Este panel solo está disponible para desarrolladores del sistema (rol OWNER).
          </p>
        </div>
      </div>
    );
  }

  const loadMaintenanceMode = async () => {
    try {
      const response = await apiClient.get('/api/developer/maintenance-mode', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setMaintenanceMode(response.data.data);
      }
    } catch (error) {
      console.error('Error loading maintenance mode:', error);
    }
  };

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/developer/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      toast.error('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const toggleMaintenanceMode = async () => {
    try {
      const newState = !maintenanceMode.enabled;
      
      if (newState) {
        const message = prompt('Mensaje para usuarios (opcional):');
        const endTime = prompt('Tiempo estimado de finalización (HH:MM):');
        
        const response = await apiClient.post('/api/developer/maintenance-mode', {
          enabled: true,
          message: message || 'El sistema está en mantenimiento. Volveremos pronto.',
          estimatedEndTime: endTime || null
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setMaintenanceMode(response.data.data);
          toast.success('Modo mantenimiento ACTIVADO');
        }
      } else {
        const response = await apiClient.post('/api/developer/maintenance-mode', {
          enabled: false,
          message: null,
          estimatedEndTime: null
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setMaintenanceMode(response.data.data);
          toast.success('Modo mantenimiento DESACTIVADO');
        }
      }
    } catch (error) {
      console.error('Error toggling maintenance mode:', error);
      toast.error('Error al cambiar modo de mantenimiento');
    }
  };

  const executeQuery = async () => {
    if (!queryInput.trim()) {
      toast.error('Ingresa una query');
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.post('/api/developer/query', {
        query: queryInput
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setQueryResults(response.data.data);
        toast.success(`Query ejecutado: ${response.data.rowCount} filas`);
      }
    } catch (error) {
      console.error('Error executing query:', error);
      toast.error(error.response?.data?.error || 'Error al ejecutar query');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteForm.table || !deleteForm.id) {
      toast.error('Completa todos los campos');
      return;
    }

    const expectedCode = `DELETE-${deleteForm.id.slice(0, 8).toUpperCase()}`;
    
    if (!deleteForm.confirmationCode) {
      toast.error(`Ingresa el código de confirmación: ${expectedCode}`);
      return;
    }

    if (deleteForm.confirmationCode !== expectedCode) {
      toast.error('Código de confirmación incorrecto');
      return;
    }

    if (!window.confirm('¿REALMENTE quieres eliminar este registro? Esta acción NO se puede deshacer.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.delete(
        `/api/developer/data/${deleteForm.table}/${deleteForm.id}`,
        {
          data: { confirmationCode: deleteForm.confirmationCode },
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success('Registro eliminado exitosamente');
        setDeleteForm({ table: 'users', id: '', confirmationCode: '' });
      }
    } catch (error) {
      console.error('Error deleting data:', error);
      toast.error(error.response?.data?.error || 'Error al eliminar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <WrenchScrewdriverIcon className="w-10 h-10 text-white" />
                <h1 className="text-3xl font-bold text-white">Panel de Desarrollador</h1>
              </div>
              <p className="text-purple-100">
                Herramientas avanzadas para administración del sistema
              </p>
            </div>
            <div className="text-right">
              <div className="text-white text-sm">Usuario</div>
              <div className="text-white font-semibold">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-purple-200 text-xs">{user.email}</div>
            </div>
          </div>
        </div>

        {/* Modo Mantenimiento */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <ServerIcon className="w-8 h-8 text-purple-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Modo Mantenimiento</h2>
                <p className="text-sm text-gray-600">
                  Pausa el sistema para actualizaciones sin afectar a usuarios en diferentes zonas horarias
                </p>
              </div>
            </div>
            <button
              onClick={toggleMaintenanceMode}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                maintenanceMode.enabled
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {maintenanceMode.enabled ? (
                <>
                  <PlayIcon className="w-5 h-5" />
                  Desactivar Mantenimiento
                </>
              ) : (
                <>
                  <StopIcon className="w-5 h-5" />
                  Activar Mantenimiento
                </>
              )}
            </button>
          </div>

          {maintenanceMode.enabled && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                <span className="font-semibold text-red-900">
                  Sistema en Modo Mantenimiento
                </span>
              </div>
              <p className="text-sm text-red-700">
                {maintenanceMode.message}
              </p>
              {maintenanceMode.estimatedEndTime && (
                <p className="text-xs text-red-600 mt-1">
                  Tiempo estimado: {maintenanceMode.estimatedEndTime}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Estadísticas del Sistema */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <CircleStackIcon className="w-8 h-8 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">Estadísticas del Sistema</h2>
            </div>
            <button
              onClick={loadStats}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              Actualizar
            </button>
          </div>

          {stats && (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Negocios</div>
                  <div className="text-3xl font-bold text-blue-600">
                    {stats.counts.businesses}
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Usuarios</div>
                  <div className="text-3xl font-bold text-green-600">
                    {stats.counts.users}
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Citas</div>
                  <div className="text-3xl font-bold text-purple-600">
                    {stats.counts.appointments}
                  </div>
                </div>
                <div className="bg-pink-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Clientes</div>
                  <div className="text-3xl font-bold text-pink-600">
                    {stats.counts.clients}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Tablas más grandes (Top 10)
                </h3>
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Tabla
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Tamaño
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                        Inserts
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                        Updates
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                        Deletes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.tables.slice(0, 10).map((table, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 font-mono text-xs">
                          {table.tablename}
                        </td>
                        <td className="px-4 py-2 text-gray-700">{table.size}</td>
                        <td className="px-4 py-2 text-right text-gray-600">
                          {parseInt(table.inserts).toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-right text-gray-600">
                          {parseInt(table.updates).toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-right text-gray-600">
                          {parseInt(table.deletes).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Query SQL */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Ejecutar Query SQL</h2>
            <p className="text-sm text-gray-600 mb-4">
              Solo queries SELECT (solo lectura)
            </p>
            <textarea
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="SELECT * FROM businesses LIMIT 10;"
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            <button
              onClick={executeQuery}
              disabled={loading}
              className="mt-4 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              Ejecutar Query
            </button>

            {queryResults && (
              <div className="mt-4">
                <div className="text-sm text-gray-600 mb-2">
                  Resultados: {queryResults.length} filas
                </div>
                <div className="overflow-x-auto max-h-96 border border-gray-200 rounded-lg">
                  <pre className="p-4 text-xs font-mono">
                    {JSON.stringify(queryResults, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Eliminar Datos */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrashIcon className="w-8 h-8 text-red-600" />
              <h2 className="text-xl font-bold text-gray-900">Eliminar Datos</h2>
            </div>
            <p className="text-sm text-red-600 mb-4">
              ⚠️ PELIGRO: Esta acción NO se puede deshacer
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tabla
                </label>
                <select
                  value={deleteForm.table}
                  onChange={(e) => setDeleteForm({ ...deleteForm, table: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="users">users</option>
                  <option value="clients">clients</option>
                  <option value="appointments">appointments</option>
                  <option value="receipts">receipts</option>
                  <option value="financial_movements">financial_movements</option>
                  <option value="business_expenses">business_expenses</option>
                  <option value="commission_payment_requests">commission_payment_requests</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID del Registro (UUID)
                </label>
                <input
                  type="text"
                  value={deleteForm.id}
                  onChange={(e) => setDeleteForm({ ...deleteForm, id: e.target.value })}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              {deleteForm.id && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código de Confirmación
                  </label>
                  <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                    Código requerido:{' '}
                    <span className="font-mono font-bold">
                      DELETE-{deleteForm.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={deleteForm.confirmationCode}
                    onChange={(e) => setDeleteForm({ ...deleteForm, confirmationCode: e.target.value })}
                    placeholder="DELETE-XXXXXXXX"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              )}

              <button
                onClick={handleDelete}
                disabled={loading || !deleteForm.id || !deleteForm.confirmationCode}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                Eliminar Registro
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperPanel;
