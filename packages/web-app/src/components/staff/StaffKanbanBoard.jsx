import React, { useState } from 'react';
import {
  UserCircleIcon,
  StarIcon,
  UserIcon,
  UsersIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  PencilIcon,
  ChevronRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import PermissionsEditorModal from '../permissions/PermissionsEditorModal.jsx';

/**
 * StaffKanbanBoard - Tablero tipo Kanban para gestión visual del equipo
 * Compatible con WebView móvil - Sin drag & drop
 */
const StaffKanbanBoard = ({ 
  specialists = [], 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  loading = false, 
  businessId 
}) => {
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [permissionsStaff, setPermissionsStaff] = useState(null);

  // Definir estados/columnas del tablero
  const columns = [
    {
      id: 'available',
      title: 'Disponibles',
      icon: CheckCircleIcon,
      color: 'green',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      iconColor: 'text-green-600',
      description: 'Staff listo para trabajar'
    },
    {
      id: 'busy',
      title: 'En Servicio',
      icon: ClockIcon,
      color: 'blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      iconColor: 'text-blue-600',
      description: 'Atendiendo clientes'
    },
    {
      id: 'break',
      title: 'En Descanso',
      icon: ClockIcon,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-700',
      iconColor: 'text-yellow-600',
      description: 'Pausa o almuerzo'
    },
    {
      id: 'inactive',
      title: 'Inactivos',
      icon: XCircleIcon,
      color: 'gray',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      textColor: 'text-gray-700',
      iconColor: 'text-gray-600',
      description: 'No disponibles hoy'
    }
  ];

  // Función para determinar el estado de un staff member
  // Por ahora basado en isActive, pero puede expandirse con lógica de citas
  const getStaffStatus = (staff) => {
    if (!staff.isActive) return 'inactive';
    // TODO: Integrar con sistema de citas para estados reales
    // if (staff.currentAppointment) return 'busy';
    // if (staff.onBreak) return 'break';
    return 'available';
  };

  // Agrupar staff por estado
  const groupedStaff = columns.reduce((acc, column) => {
    acc[column.id] = specialists.filter(staff => getStaffStatus(staff) === column.id);
    return acc;
  }, {});

  // Obtener icono según rol
  const getRoleIcon = (role) => {
    switch (role) {
      case 'SPECIALIST':
        return StarIcon;
      case 'RECEPTIONIST_SPECIALIST':
        return UsersIcon;
      case 'RECEPTIONIST':
        return UserIcon;
      default:
        return UserCircleIcon;
    }
  };

  // Obtener label del rol
  const getRoleLabel = (role) => {
    switch (role) {
      case 'SPECIALIST':
        return 'Especialista';
      case 'RECEPTIONIST_SPECIALIST':
        return 'Recep-Especialista';
      case 'RECEPTIONIST':
        return 'Recepcionista';
      default:
        return role;
    }
  };

  // Obtener color del badge según rol
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'SPECIALIST':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'RECEPTIONIST_SPECIALIST':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'RECEPTIONIST':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // Abrir modal de detalles
  const handleCardClick = (staff) => {
    setSelectedStaff(staff);
    setShowDetailModal(true);
  };

  // Cerrar modal
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedStaff(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (specialists.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <UsersIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay miembros del equipo
        </h3>
        <p className="text-gray-500">
          Agrega especialistas y recepcionistas para verlos aquí
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header del tablero */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Vista de Equipo
          </h3>
          <p className="text-sm text-gray-500">
            {specialists.length} {specialists.length === 1 ? 'miembro' : 'miembros'} del equipo
          </p>
        </div>
      </div>

      {/* Tablero Kanban - Grid Responsivo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((column) => {
          const ColumnIcon = column.icon;
          const staffInColumn = groupedStaff[column.id] || [];

          return (
            <div
              key={column.id}
              className={`${column.bgColor} ${column.borderColor} border-2 rounded-lg p-4 min-h-[300px] flex flex-col`}
            >
              {/* Header de columna */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <ColumnIcon className={`h-5 w-5 ${column.iconColor}`} />
                  <h4 className={`font-semibold ${column.textColor}`}>
                    {column.title}
                  </h4>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${column.bgColor} ${column.textColor} border ${column.borderColor}`}>
                  {staffInColumn.length}
                </span>
              </div>

              {/* Descripción de columna */}
              <p className="text-xs text-gray-600 mb-3">
                {column.description}
              </p>

              {/* Cards del staff - Scrollable */}
              <div className="space-y-2 flex-1 overflow-y-auto max-h-[calc(100vh-400px)] pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {staffInColumn.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-sm">Sin personal</p>
                  </div>
                ) : (
                  staffInColumn.map((staff) => {
                    const RoleIcon = getRoleIcon(staff.role);
                    return (
                      <div
                        key={staff.id}
                        onClick={() => handleCardClick(staff)}
                        className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
                      >
                        {/* Header de card */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <RoleIcon className="h-5 w-5 text-gray-600 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 text-sm truncate">
                                {staff.firstName} {staff.lastName}
                              </p>
                            </div>
                          </div>
                          <ChevronRightIcon className="h-4 w-4 text-gray-400 group-hover:text-blue-600 flex-shrink-0 transition-colors" />
                        </div>

                        {/* Badge de rol */}
                        <div className="mb-2">
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded border ${getRoleBadgeColor(staff.role)}`}>
                            {getRoleLabel(staff.role)}
                          </span>
                        </div>

                        {/* Especialización si existe */}
                        {staff.SpecialistProfile?.specialization && (
                          <p className="text-xs text-gray-600 truncate mb-1">
                            {staff.SpecialistProfile.specialization}
                          </p>
                        )}

                        {/* Email */}
                        <p className="text-xs text-gray-500 truncate">
                          {staff.email}
                        </p>

                        {/* Botones de acción */}
                        <div className="mt-2 grid grid-cols-2 gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit && onEdit(staff);
                            }}
                            className="flex items-center justify-center gap-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 py-1 rounded transition-colors"
                            title="Editar información"
                          >
                            <PencilIcon className="h-3 w-3" />
                            Editar
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPermissionsStaff(staff);
                              setShowPermissionsModal(true);
                            }}
                            className="flex items-center justify-center gap-1 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 py-1 rounded transition-colors"
                            title="Gestionar permisos"
                          >
                            <ShieldCheckIcon className="h-3 w-3" />
                            Permisos
                          </button>
                          {onToggleStatus && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleStatus(staff.id);
                              }}
                              className={`flex items-center justify-center gap-1 text-xs py-1 rounded transition-colors ${
                                staff.isActive
                                  ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50'
                                  : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                              }`}
                              title={staff.isActive ? 'Desactivar' : 'Activar'}
                            >
                              {staff.isActive ? (
                                <><XCircleIcon className="h-3 w-3" />Desactivar</>
                              ) : (
                                <><CheckCircleIcon className="h-3 w-3" />Activar</>
                              )}
                            </button>
                          )}
                          {onDelete && !['BUSINESS', 'BUSINESS_SPECIALIST'].includes(staff.role) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(staff.id);
                              }}
                              className="flex items-center justify-center gap-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 py-1 rounded transition-colors"
                              title="Eliminar miembro"
                            >
                              <XCircleIcon className="h-3 w-3" />
                              Eliminar
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Permisos */}
      <PermissionsEditorModal
        isOpen={showPermissionsModal}
        onClose={() => {
          setShowPermissionsModal(false);
          setPermissionsStaff(null);
        }}
        staffMember={permissionsStaff}
        businessId={businessId}
      />

      {/* Modal de Detalles */}
      {showDetailModal && selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header del modal */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Detalles del Miembro
              </h3>
              <button
                onClick={closeDetailModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-6 space-y-4">
              {/* Nombre y Rol */}
              <div className="text-center pb-4 border-b border-gray-200">
                <div className="flex justify-center mb-3">
                  {React.createElement(getRoleIcon(selectedStaff.role), {
                    className: 'h-16 w-16 text-blue-600'
                  })}
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  {selectedStaff.firstName} {selectedStaff.lastName}
                </h4>
                <span className={`inline-block px-3 py-1 text-sm font-medium rounded border ${getRoleBadgeColor(selectedStaff.role)}`}>
                  {getRoleLabel(selectedStaff.role)}
                </span>
              </div>

              {/* Información de contacto */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">{selectedStaff.email}</p>
                  </div>
                </div>

                {selectedStaff.phone && (
                  <div className="flex items-center gap-3">
                    <PhoneIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Teléfono</p>
                      <p className="text-sm text-gray-900">{selectedStaff.phone}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Información profesional (si es especialista) */}
              {selectedStaff.SpecialistProfile && (
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <h5 className="font-semibold text-gray-900 text-sm">
                    Información Profesional
                  </h5>

                  {selectedStaff.SpecialistProfile.specialization && (
                    <div>
                      <p className="text-xs text-gray-500">Especialización</p>
                      <p className="text-sm text-gray-900">
                        {selectedStaff.SpecialistProfile.specialization}
                      </p>
                    </div>
                  )}

                  {selectedStaff.SpecialistProfile.biography && (
                    <div>
                      <p className="text-xs text-gray-500">Biografía</p>
                      <p className="text-sm text-gray-900">
                        {selectedStaff.SpecialistProfile.biography}
                      </p>
                    </div>
                  )}

                  {selectedStaff.SpecialistProfile.experience && (
                    <div>
                      <p className="text-xs text-gray-500">Experiencia</p>
                      <p className="text-sm text-gray-900">
                        {selectedStaff.SpecialistProfile.experience} años
                      </p>
                    </div>
                  )}

                  {selectedStaff.SpecialistProfile.commissionRate && (
                    <div>
                      <p className="text-xs text-gray-500">Comisión</p>
                      <p className="text-sm text-gray-900">
                        {selectedStaff.SpecialistProfile.commissionRate}%
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Estado */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Estado actual</span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    selectedStaff.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {selectedStaff.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>

              {/* Acciones */}
              <div className="pt-4 border-t border-gray-200 flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      closeDetailModal();
                      onEdit && onEdit(selectedStaff);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      closeDetailModal();
                      setPermissionsStaff(selectedStaff);
                      setShowPermissionsModal(true);
                    }}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <ShieldCheckIcon className="h-4 w-4" />
                    Permisos
                  </button>
                  {onToggleStatus && (
                    <button
                      onClick={() => {
                        closeDetailModal();
                        onToggleStatus(selectedStaff.id);
                      }}
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                        selectedStaff.isActive
                          ? 'bg-orange-600 text-white hover:bg-orange-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {selectedStaff.isActive ? (
                        <><XCircleIcon className="h-4 w-4" />Desactivar</>
                      ) : (
                        <><CheckCircleIcon className="h-4 w-4" />Activar</>
                      )}
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        closeDetailModal();
                        onDelete(selectedStaff.id);
                      }}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircleIcon className="h-4 w-4" />
                      Eliminar
                    </button>
                  )}
                </div>
                <button
                  onClick={closeDetailModal}
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffKanbanBoard;
