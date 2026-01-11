import React, { useState, useEffect } from 'react';
import { 
  DocumentTextIcon,
  EyeIcon,
  CalendarIcon,
  UserIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Historial de consentimientos firmados
 * Con filtros, búsqueda y previsualización
 */
export default function ConsentHistory({ clientId, specialistId }) {
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConsent, setSelectedConsent] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadConsents();
  }, [clientId, specialistId, page, searchTerm]);

  const loadConsents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 10,
        ...(clientId && { clientId }),
        ...(specialistId && { specialistId }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/consent-signatures?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) throw new Error('Error loading consents');

      const data = await response.json();
      setConsents(data.consents);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error loading consents:', error);
      alert('Error al cargar el historial');
    } finally {
      setLoading(false);
    }
  };

  const handleViewConsent = async (consent) => {
    setSelectedConsent(consent);
    setShowPreview(true);
  };

  const formatDate = (date) => {
    return format(new Date(date), "d 'de' MMMM, yyyy - HH:mm", { locale: es });
  };

  return (
    <div className="space-y-4">
      {/* Header con búsqueda */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Historial de Consentimientos</h2>
          <p className="text-sm text-gray-600 mt-1">
            Registro de todos los consentimientos firmados
          </p>
        </div>

        {/* Búsqueda */}
        <div className="relative w-full sm:w-64">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Lista de Consentimientos */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : consents.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No hay consentimientos registrados</p>
          </div>
        ) : (
          <>
            {/* Tabla Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paciente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Servicio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Template
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {consents.map(consent => (
                    <tr key={consent.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-gray-400" />
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">
                              {consent.Client?.firstName} {consent.Client?.lastName}
                            </div>
                            <div className="text-gray-500">
                              {consent.Client?.documentNumber}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {consent.Appointment?.Service?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {consent.Template?.name || 'Consentimiento General'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(consent.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleViewConsent(consent)}
                          className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                        >
                          <EyeIcon className="w-4 h-4" />
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards Mobile */}
            <div className="md:hidden divide-y divide-gray-200">
              {consents.map(consent => (
                <div key={consent.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {consent.Client?.firstName} {consent.Client?.lastName}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {consent.Appointment?.Service?.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(consent.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleViewConsent(consent)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-700">
                    Página <span className="font-medium">{page}</span> de{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRightIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de Previsualización */}
      {showPreview && selectedConsent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75" 
              onClick={() => setShowPreview(false)} 
            />
            
            <div className="relative bg-white rounded-2xl shadow-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Consentimiento Informado
                </h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Información del Paciente */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Paciente</p>
                    <p className="font-semibold text-gray-900">
                      {selectedConsent.Client?.firstName} {selectedConsent.Client?.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Documento</p>
                    <p className="font-semibold text-gray-900">
                      {selectedConsent.Client?.documentNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Servicio</p>
                    <p className="font-semibold text-gray-900">
                      {selectedConsent.Appointment?.Service?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fecha</p>
                    <p className="font-semibold text-gray-900">
                      {formatDate(selectedConsent.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Firma */}
              {selectedConsent.signatureData && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">Firma del Paciente:</p>
                  <div className="border-2 border-gray-200 rounded-lg p-4 bg-white">
                    <img 
                      src={selectedConsent.signatureData} 
                      alt="Firma" 
                      className="max-w-full h-auto"
                    />
                  </div>
                </div>
              )}

              {/* Botón Cerrar */}
              <button
                onClick={() => setShowPreview(false)}
                className="w-full px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
