import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Gift, User, Users, AlertCircle, Loader2 } from 'lucide-react';
import { API_CONFIG } from '../../constants/api';

/**
 * CheckPointsPage - Página pública para consultar puntos de fidelización
 * Accesible sin autenticación mediante QR
 * Ruta: /check-points/:referralCode
 */
const CheckPointsPage = () => {
  const { referralCode } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pointsData, setPointsData] = useState(null);

  useEffect(() => {
    const fetchPoints = async () => {
      if (!referralCode) {
        setError('Código de tarjeta inválido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${API_CONFIG.BASE_URL}/api/loyalty/public/check/${referralCode}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Código de tarjeta no encontrado');
          }
          throw new Error('Error al consultar puntos');
        }

        const result = await response.json();
        
        if (result.success && result.data) {
          setPointsData(result.data);
        } else {
          throw new Error('Respuesta inválida del servidor');
        }
      } catch (err) {
        console.error('Error fetching points:', err);
        setError(err.message || 'Error al consultar puntos');
      } finally {
        setLoading(false);
      }
    };

    fetchPoints();
  }, [referralCode]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Consultando tus puntos...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="flex flex-col items-center text-center">
            <div className="bg-red-100 rounded-full p-3 mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Código no válido
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <p className="text-sm text-gray-500">
              Si crees que esto es un error, contacta con el negocio donde recibiste tu tarjeta.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <div className="flex items-center justify-center mb-2">
            <Gift className="w-8 h-8 mr-2" />
            <h1 className="text-2xl font-bold">Tus Puntos</h1>
          </div>
          <p className="text-center text-purple-100 text-sm">
            Programa de Fidelización
          </p>
        </div>

        {/* Contenido principal */}
        <div className="p-6">
          {/* Nombre del cliente */}
          <div className="flex items-center mb-6 pb-4 border-b">
            <div className="bg-purple-100 rounded-full p-3 mr-4">
              <User className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Cliente</p>
              <p className="text-lg font-semibold text-gray-800">
                {pointsData.clientName}
              </p>
            </div>
          </div>

          {/* Puntos acumulados - Destacado */}
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-6 mb-6 text-center">
            <p className="text-sm text-purple-700 font-medium mb-2">
              PUNTOS ACUMULADOS
            </p>
            <p className="text-5xl font-bold text-purple-900 mb-2">
              {pointsData.points.toLocaleString('es-CO')}
            </p>
            <p className="text-sm text-purple-600">
              puntos disponibles
            </p>
          </div>

          {/* Información adicional */}
          <div className="space-y-4">
            {/* Código de referido */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Código de referido</p>
              <p className="text-lg font-mono font-semibold text-gray-800">
                {pointsData.referralCode}
              </p>
            </div>

            {/* Clientes referidos */}
            {pointsData.referralCount > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="text-xs text-blue-600 mb-1">Has referido a</p>
                    <p className="text-lg font-bold text-blue-800">
                      {pointsData.referralCount} {pointsData.referralCount === 1 ? 'persona' : 'personas'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mensaje informativo */}
          <div className="mt-6 p-4 bg-amber-50 border-l-4 border-amber-400 rounded">
            <p className="text-sm text-amber-800">
              <strong>¿Cómo usar tus puntos?</strong>
            </p>
            <p className="text-xs text-amber-700 mt-1">
              Pregunta en tu próxima visita cómo canjear tus puntos por descuentos y beneficios especiales.
            </p>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              Puntos actualizados en tiempo real
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckPointsPage;
