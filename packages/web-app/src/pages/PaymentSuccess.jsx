import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline'

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [transactionData, setTransactionData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const transactionId = searchParams.get('id')

  useEffect(() => {
    const fetchTransactionData = async () => {
      if (!transactionId) {
        setError('No se recibió ID de transacción')
        setLoading(false)
        return
      }

      try {
        // Consultar el estado de la transacción desde nuestro backend
        const response = await fetch(`http://localhost:3001/api/wompi/transaction/${transactionId}`)
        const result = await response.json()

        if (result.success) {
          setTransactionData(result.data)
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
  }, [transactionId])

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