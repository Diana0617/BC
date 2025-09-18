import React, { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline'
import { createSubscription } from '../../../shared/src/store/slices/subscriptionSlice.js'

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { creating, createError, success } = useSelector(state => state.subscription)
  const [transactionData, setTransactionData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [businessCreating, setBusinessCreating] = useState(false)
  const [businessCreated, setBusinessCreated] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState(null)
  const [businessCreationAttempted, setBusinessCreationAttempted] = useState(false)

  const transactionId = searchParams.get('id')
  const reference = searchParams.get('reference')

  // Función para generar contraseña temporal
  const generateTemporaryPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  // Función para crear el negocio cuando el pago está aprobado
  const createBusinessFromPayment = useCallback(async (transactionData) => {
    try {
      // Prevenir intentos duplicados
      if (businessCreationAttempted || businessCreating || businessCreated) {
        console.log('⚠️ Intento de creación duplicado prevenido:', {
          businessCreationAttempted,
          businessCreating,
          businessCreated
        });
        return;
      }

      setBusinessCreationAttempted(true);
      setBusinessCreating(true);
      console.log('💼 Creando negocio desde pago aprobado:', transactionData);

      // Obtener datos del negocio desde localStorage
      console.log('🔍 Verificando localStorage...');
      console.log('📦 Keys en localStorage:', Object.keys(localStorage));
      console.log('📦 Contenido completo:', {
        pendingBusinessCreation: localStorage.getItem('pendingBusinessCreation'),
        allKeys: Object.keys(localStorage).map(key => ({ key, value: localStorage.getItem(key) }))
      });
      
      const pendingBusinessData = localStorage.getItem('pendingBusinessCreation');
      if (!pendingBusinessData) {
        console.error('❌ No se encontraron datos del negocio en localStorage');
        setError('No se encontraron datos del negocio para crear la suscripción');
        return;
      }

      const { businessData, selectedPlan } = JSON.parse(pendingBusinessData);
      console.log('📋 Datos del negocio recuperados:', { businessData, selectedPlan });

      // Validar que tenemos todos los datos necesarios
      if (!businessData || !selectedPlan) {
        console.error('❌ Faltan datos del negocio o plan en localStorage');
        setError('Datos incompletos del negocio para crear la suscripción');
        return;
      }

      // Verificar si el usuario ya ingresó una contraseña en el formulario
      console.log('🔍 Verificando contraseña en businessData:', {
        hasPassword: !!businessData.password,
        businessData: Object.keys(businessData)
      });
      
      const userPassword = businessData.password || generateTemporaryPassword();
      if (businessData.password) {
        console.log('✅ Usando contraseña del formulario del usuario');
      } else {
        console.log('🔑 Generando contraseña temporal (no se encontró contraseña del usuario)');
        setGeneratedPassword(userPassword);
      }

      // Preparar datos para la creación del negocio
      const subscriptionData = {
        // Plan seleccionado
        planId: selectedPlan.id,
        
        // Datos del negocio
        businessData: {
          name: businessData.businessName,
          businessCode: businessData.businessCode,
          type: businessData.businessType,
          phone: businessData.businessPhone,
          email: businessData.businessEmail,
          address: businessData.address,
        },
        
        // Datos del usuario
        userData: {
          firstName: businessData.firstName,
          lastName: businessData.lastName,
          phone: businessData.phone,
          email: businessData.email,
          password: userPassword, // Contraseña del usuario o temporal
        },
        
        // Confirmación de pago
        paymentData: {
          transactionId: transactionData.id,
          reference: transactionData.reference,
          status: transactionData.status,
          amount: transactionData.amount_in_cents,
          currency: transactionData.currency,
          paymentMethod: 'wompi'
        }
      };

      console.log('🚀 Enviando datos para crear negocio:', subscriptionData);
      console.log('🔍 businessData:', subscriptionData.businessData);
      console.log('🔍 userData:', subscriptionData.userData);
      console.log('🔍 planId:', subscriptionData.planId);

      // Crear el negocio usando Redux
      const result = await dispatch(createSubscription(subscriptionData)).unwrap();
      
      console.log('✅ Negocio creado exitosamente:', result);
      setBusinessCreated(true);
      
      // Solo limpiar localStorage si la creación fue exitosa
      console.log('🗑️ Limpiando localStorage después de creación exitosa');
      localStorage.removeItem('pendingBusinessCreation');
      
      // Opcional: Redirigir después de un tiempo
      setTimeout(() => {
        navigate('/dashboard');
      }, 5000);

    } catch (error) {
      console.error('❌ Error creando negocio:', error);
      
      // Manejar errores específicos
      if (error.message && error.message.includes('409')) {
        console.log('⚠️ El negocio/usuario ya existe - verificando estado...');
        // En caso de error 409 (usuario ya existe), considerarlo como éxito
        setBusinessCreated(true);
        localStorage.removeItem('pendingBusinessCreation');
        setError('El negocio ya fue creado exitosamente con este pago.');
      } else {
        setError('Error creando el negocio: ' + error.message);
      }
    } finally {
      setBusinessCreating(false);
    }
  }, [dispatch, navigate, businessCreationAttempted, businessCreating, businessCreated]);

  useEffect(() => {
    const fetchTransactionData = async () => {
      // Priorizar referencia sobre transactionId
      const identifier = reference || transactionId;
      const endpoint = reference 
        ? `http://localhost:3001/api/wompi/transaction-by-reference/${reference}`
        : `http://localhost:3001/api/wompi/transaction/${transactionId}`;

      if (!identifier) {
        setError('No se recibió referencia o ID de transacción')
        setLoading(false)
        return
      }

      try {
        console.log('🔍 Consultando transacción:', { reference, transactionId, endpoint });
        
        // Consultar el estado de la transacción desde nuestro backend
        const response = await fetch(endpoint)
        const result = await response.json()

        console.log('📊 Resultado de consulta:', result);

        if (result.success) {
          setTransactionData(result.data)
          
          // Si el pago está aprobado, crear el negocio
          if (result.data.status === 'APPROVED' && !businessCreated) {
            createBusinessFromPayment(result.data);
          }
        } else {
          setError(result.message || 'Error consultando transacción')
        }
      } catch (err) {
        console.error('Error:', err)
        setError('Error de conexión')
      } finally {
        setLoading(false)
      }
    }

    fetchTransactionData()
  }, [transactionId, reference, businessCreated, createBusinessFromPayment])

  const getStatusInfo = (status) => {
    switch (status) {
      case 'APPROVED':
        return {
          icon: CheckCircleIcon,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          title: '¡Pago Exitoso!',
          description: 'Tu pago ha sido procesado correctamente.'
        }
      case 'DECLINED':
        return {
          icon: XCircleIcon,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          title: 'Pago Rechazado',
          description: 'Tu pago no pudo ser procesado. Intenta con otro método de pago.'
        }
      case 'PENDING':
        return {
          icon: ClockIcon,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          title: 'Pago Pendiente',
          description: 'Tu pago está siendo procesado. Te notificaremos cuando se complete.'
        }
      default:
        return {
          icon: ClockIcon,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          title: 'Estado Desconocido',
          description: 'No pudimos determinar el estado de tu pago.'
        }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Consultando estado del pago...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <XCircleIcon className="h-16 w-16 text-red-600 mx-auto" />
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Error</h1>
          <p className="text-gray-600 mt-2">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-6 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    )
  }

  const statusInfo = getStatusInfo(transactionData?.status)
  const StatusIcon = statusInfo.icon

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-lg mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className={`${statusInfo.bgColor} rounded-full p-3 w-16 h-16 mx-auto flex items-center justify-center`}>
            <StatusIcon className={`h-8 w-8 ${statusInfo.color}`} />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mt-4">
            {statusInfo.title}
          </h1>
          
          <p className="text-gray-600 mt-2">
            {statusInfo.description}
          </p>

          {transactionData && (
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Detalles de la Transacción</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">ID:</span>
                  <span className="text-gray-900 font-mono">{transactionData.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Referencia:</span>
                  <span className="text-gray-900">{transactionData.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Monto:</span>
                  <span className="text-gray-900">
                    {new Intl.NumberFormat('es-CO', {
                      style: 'currency',
                      currency: transactionData.currency || 'COP'
                    }).format((transactionData.amount_in_cents || 0) / 100)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Estado:</span>
                  <span className={`${statusInfo.color} font-semibold`}>
                    {transactionData.status}
                  </span>
                </div>
                {transactionData.created_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Fecha:</span>
                    <span className="text-gray-900">
                      {new Date(transactionData.created_at).toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Estado de creación del negocio */}
          {transactionData?.status === 'APPROVED' && (
            <div className="mt-6 bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-700 mb-3 flex items-center">
                {businessCreating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                ) : businessCreated ? (
                  <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2" />
                ) : (
                  <ClockIcon className="h-4 w-4 text-blue-600 mr-2" />
                )}
                Estado del Negocio
              </h3>
              <div className="text-sm">
                {businessCreating && (
                  <p className="text-blue-700">
                    ⏳ Creando tu negocio y suscripción...
                  </p>
                )}
                {businessCreated && (
                  <div className="space-y-2">
                    <p className="text-green-700 font-semibold">
                      ✅ ¡Negocio y suscripción creados exitosamente!
                    </p>
                    <p className="text-blue-600 text-xs">
                      Redirigiendo al dashboard en unos segundos...
                    </p>
                  </div>
                )}
                {!businessCreating && !businessCreated && (
                  <p className="text-blue-700">
                    🚀 Procesando la creación de tu negocio...
                  </p>
                )}
                {createError && (
                  <p className="text-red-600 font-semibold">
                    ❌ Error: {createError}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-8">
            <button
              onClick={() => navigate('/')}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
            >
              Volver al Inicio
            </button>
            <button
              onClick={() => navigate('/subscription')}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Ver Suscripción
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccess