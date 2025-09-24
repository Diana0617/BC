import React from 'react';

const BusinessRuleModal = ({ isOpen, onClose, businessId, business }) => {
  // Obtener las reglas activas del negocio
  const activeBusinessRules = business?.rules ? [business.rules] : [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Configurar reglas de negocio</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            <div className="space-y-6">
              {/* Reglas activas del negocio */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900">Reglas activas del negocio</h3>
                </div>
                
                {activeBusinessRules.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>No hay reglas activas configuradas</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeBusinessRules.map((rule, index) => (
                      <div key={rule.id || index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-md font-semibold text-gray-900">{rule.description || 'Regla de negocio'}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            rule.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {rule.isActive ? 'Activa' : 'Inactiva'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Categoría:</span>
                            <span className="ml-2 text-gray-900">{rule.category}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Clave:</span>
                            <span className="ml-2 text-gray-900">{rule.ruleKey}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Prioridad:</span>
                            <span className="ml-2 text-gray-900">{rule.priority}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Tipo:</span>
                            <span className="ml-2 text-gray-900">
                              {rule.isFromTemplate ? 'De plantilla' : 'Personalizada'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Mostrar configuración específica según la categoría */}
                        {rule.category === 'CANCELLATION_POLICY' && rule.ruleValue && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <h5 className="font-medium text-gray-700 mb-2">Política de cancelación:</h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                              <div>Permite cancelación: <span className="font-medium">{rule.ruleValue.allowCancellation ? 'Sí' : 'No'}</span></div>
                              <div>Horas mínimas: <span className="font-medium">{rule.ruleValue.minHoursBeforeAppointment || rule.cancellationTimeLimit}</span></div>
                              <div>Reembolso: <span className="font-medium">{rule.ruleValue.refundPolicy || 'N/A'}</span></div>
                            </div>
                          </div>
                        )}
                        
                        {rule.category === 'BOOKING_POLICY' && rule.ruleValue && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <h5 className="font-medium text-gray-700 mb-2">Política de reservas:</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <div>Requiere depósito: <span className="font-medium">{rule.ruleValue.requireDepositForBooking ? 'Sí' : 'No'}</span></div>
                              <div>Booking online: <span className="font-medium">{rule.ruleValue.allowOnlineBooking ? 'Sí' : 'No'}</span></div>
                            </div>
                          </div>
                        )}
                        
                        {rule.workingHours && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <h5 className="font-medium text-gray-700 mb-2">Horarios de trabajo:</h5>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                              {Object.entries(rule.workingHours).map(([day, hours]) => (
                                <div key={day} className="text-center">
                                  <div className="font-medium capitalize">{day}</div>
                                  <div className={hours.enabled ? 'text-green-600' : 'text-gray-400'}>
                                    {hours.enabled ? `${hours.start}-${hours.end}` : 'Cerrado'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {rule.notificationSettings && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <h5 className="font-medium text-gray-700 mb-2">Notificaciones:</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <div>Email: <span className="font-medium">{rule.notificationSettings.emailNotifications ? 'Activado' : 'Desactivado'}</span></div>
                              <div>SMS: <span className="font-medium">{rule.notificationSettings.smsNotifications ? 'Activado' : 'Desactivado'}</span></div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessRuleModal;
