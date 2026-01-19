import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import {
  BeakerIcon,
  PlusIcon,
  CalendarIcon,
  UserIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { fetchSuppliesByAppointment, clearAppointmentSupplies, deleteSupply } from '@shared/store/slices/procedureSupplySlice';
import RegisterSupplyModal from '../procedures/RegisterSupplyModal';

/**
 * AppointmentSuppliesTab - Tab para mostrar los insumos consumidos en una cita
 * 
 * @param {String} appointmentId - ID del turno/cita
 * @param {String} specialistId - ID del especialista (opcional)
 * @param {String} branchId - ID de la sucursal (opcional)
 * @param {String} serviceName - Nombre del servicio (opcional)
 */
const AppointmentSuppliesTab = ({ 
  appointmentId,
  specialistId = null,
  branchId = null,
  serviceName = null
}) => {
  const dispatch = useDispatch();
  const { appointmentSupplies, loading } = useSelector(state => state.procedureSupply);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Cargar consumos al montar
  useEffect(() => {
    if (appointmentId) {
      dispatch(fetchSuppliesByAppointment(appointmentId));
    }

    return () => {
      dispatch(clearAppointmentSupplies());
    };
  }, [appointmentId, dispatch]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRegisterSuccess = () => {
    setShowRegisterModal(false);
    // Recargar la lista
    dispatch(fetchSuppliesByAppointment(appointmentId));
  };

  const handleDeleteSupply = async (supplyId, productName) => {
    if (!window.confirm(`¿Estás seguro de eliminar el consumo de "${productName}"?\n\nEsta acción revertirá el stock y no se puede deshacer.`)) {
      return;
    }

    try {
      await dispatch(deleteSupply(supplyId)).unwrap();
      toast.success('Consumo eliminado correctamente');
    } catch (error) {
      console.error('Error eliminando consumo:', error);
      toast.error(error?.error || 'Error al eliminar el consumo');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const supplies = appointmentSupplies?.supplies || [];
  const summary = appointmentSupplies?.summary || { totalItems: 0, totalCost: 0 };

  return (
    <div className="p-6">
      {/* Header con botón */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Consumo de Productos
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Productos utilizados durante el procedimiento
          </p>
        </div>
        <button
          onClick={() => setShowRegisterModal(true)}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
        >
          <PlusIcon className="h-5 w-5" />
          Registrar Consumo
        </button>
      </div>

      {/* Resumen */}
      {supplies.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <BeakerIcon className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Productos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.totalItems}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <BeakerIcon className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Costo Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${summary.totalCost?.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de consumos */}
      {supplies.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <BeakerIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay consumos registrados
          </h3>
          <p className="text-gray-500 mb-6">
            Registra los productos utilizados durante el procedimiento
          </p>
          <button
            onClick={() => setShowRegisterModal(true)}
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
          >
            <PlusIcon className="h-5 w-5" />
            Registrar Primer Consumo
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {supplies.map((supply) => (
            <div
              key={supply.id}
              className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start gap-4">
                {/* Información del producto */}
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {supply.Product?.name}
                  </h4>
                  <p className="text-sm text-gray-500 mb-2">
                    SKU: {supply.Product?.sku}
                  </p>

                  {/* Cantidad y unidad */}
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-sm font-medium text-purple-600">
                      {supply.quantity} {supply.unit}
                    </span>
                    <span className="text-sm text-gray-600">
                      Costo: ${supply.unitCost?.toLocaleString()}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      Total: ${supply.totalCost?.toLocaleString()}
                    </span>
                  </div>

                  {/* Motivo/Razón */}
                  {supply.reason && (
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Procedimiento:
                      </span>
                      <span className="text-sm text-gray-600 ml-2">
                        {supply.reason}
                      </span>
                    </div>
                  )}

                  {/* Notas */}
                  {supply.notes && (
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Notas:
                      </span>
                      <span className="text-sm text-gray-600 ml-2">
                        {supply.notes}
                      </span>
                    </div>
                  )}

                  {/* Info adicional */}
                  <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t text-sm text-gray-500">
                    {supply.Specialist && (
                      <div className="flex items-center gap-1">
                        <UserIcon className="h-4 w-4" />
                        {supply.Specialist.fullName}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      {formatDate(supply.registeredAt)}
                    </div>
                  </div>
                </div>

                {/* Botón de eliminar */}
                <button
                  onClick={() => handleDeleteSupply(supply.id, supply.Product?.name)}
                  className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar consumo"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de registro */}
      <RegisterSupplyModal
        isOpen={showRegisterModal}
        onClose={handleRegisterSuccess}
        appointmentId={appointmentId}
        specialistId={specialistId}
        branchId={branchId}
        serviceName={serviceName}
      />
    </div>
  );
};

export default AppointmentSuppliesTab;
