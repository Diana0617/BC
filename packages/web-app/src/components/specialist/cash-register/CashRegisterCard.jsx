import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  BanknotesIcon, 
  LockClosedIcon, 
  ClockIcon,
  ChevronRightIcon,
  InformationCircleIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

/**
 * Card de estado de la caja registradora
 * Se integra en dashboards de especialistas que requieren manejo de caja
 */
export default function CashRegisterCard({ businessId }) {
  const { token } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [shouldUse, setShouldUse] = useState(false);
  const [activeShift, setActiveShift] = useState(null);

  useEffect(() => {
    if (businessId) {
      checkCashRegisterStatus();
    }
  }, [businessId]);

  const checkCashRegisterStatus = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      
      // Verificar si el usuario debe usar caja registradora
      const shouldUseResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/cash-register/should-use?businessId=${businessId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (shouldUseResponse.ok) {
        const shouldUseData = await shouldUseResponse.json();
        setShouldUse(shouldUseData.shouldUse);

        if (shouldUseData.shouldUse) {
          // Obtener turno activo si existe
          const activeShiftResponse = await fetch(
            `${import.meta.env.VITE_API_URL}/api/cash-register/active-shift?businessId=${businessId}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );

          if (activeShiftResponse.ok) {
            const activeShiftData = await activeShiftResponse.json();
            setActiveShift(activeShiftData.shift);
          }
        }
      }
    } catch (error) {
      console.error('Error checking cash register status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePress = () => {
    // Siempre navegar a la página de caja registradora
    // Allí el usuario verá las pestañas correspondientes según si tiene turno activo o no
    navigate('/specialist/cash-register');
  };

  // No mostrar nada si el usuario no debe usar caja
  if (!shouldUse) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  const hasActiveShift = activeShift !== null;

  return (
    <div
      onClick={handlePress}
      className={`rounded-xl overflow-hidden shadow-lg cursor-pointer transition-transform hover:scale-105 ${
        hasActiveShift
          ? 'bg-gradient-to-br from-green-500 to-emerald-600'
          : 'bg-gradient-to-br from-purple-500 to-violet-600'
      }`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
              {hasActiveShift ? (
                <BanknotesIcon className="w-7 h-7 text-white" />
              ) : (
                <LockClosedIcon className="w-7 h-7 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Caja Registradora
              </h3>
              <p className="text-sm text-white/90 font-medium">
                {hasActiveShift ? 'Turno Abierto' : 'Sin turno activo'}
              </p>
            </div>
          </div>
          <ChevronRightIcon className="w-6 h-6 text-white" />
        </div>

        {/* Detalles del turno activo */}
        {hasActiveShift && activeShift && (
          <div className="space-y-2 mt-4 pt-4 border-t border-white/30">
            {activeShift.branch && (
              <div className="flex items-center gap-2 text-white mb-2">
                <BuildingOfficeIcon className="w-4 h-4 opacity-80" />
                <span className="text-sm font-medium">{activeShift.branch.name}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-white">
              <span className="text-sm opacity-80">Balance Inicial:</span>
              <span className="text-base font-bold">
                ${activeShift.openingBalance?.toLocaleString('es-CO') || '0'}
              </span>
            </div>
            <div className="flex items-center justify-between text-white">
              <span className="text-sm opacity-80">Hora Apertura:</span>
              <span className="text-base font-semibold">
                {new Date(activeShift.openedAt).toLocaleTimeString('es-CO', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        )}

        {/* Hint para abrir turno */}
        {!hasActiveShift && (
          <div className="flex items-center gap-2 mt-4">
            <InformationCircleIcon className="w-4 h-4 text-white" />
            <p className="text-sm text-white/90 italic">
              Toca para abrir turno de caja
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
