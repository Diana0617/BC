import React, { useState } from 'react'
import { CreditCardIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'

const PaymentFlow = ({ selectedPlan, businessData, invitationToken, onComplete, onBack }) => {
  const [paymentMethod, setPaymentMethod] = useState('credit_card')
  const [simulationMode, setSimulationMode] = useState(true) // Modo simulación activo
  const [simulationResult, setSimulationResult] = useState(null)
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    documentType: 'CC',
    documentNumber: '',
    email: businessData?.email || '',
    phone: businessData?.phone || ''
  })
  const [processing, setProcessing] = useState(false)
  const [errors, setErrors] = useState({})

  // Tarjetas de prueba para simulación
  const testCards = {
    success: {
      cardNumber: '4242 4242 4242 4242',
      expiryDate: '12/25',
      cvv: '123',
      cardholderName: 'APROBADA EXITOSA',
      result: 'APPROVED'
    },
    declined: {
      cardNumber: '4000 0000 0000 0002',
      expiryDate: '12/25', 
      cvv: '123',
      cardholderName: 'TARJETA RECHAZADA',
      result: 'DECLINED'
    },
    insufficient: {
      cardNumber: '4000 0000 0000 9995',
      expiryDate: '12/25',
      cvv: '123', 
      cardholderName: 'FONDOS INSUFICIENTES',
      result: 'INSUFFICIENT_FUNDS'
    },
    processing: {
      cardNumber: '4000 0000 0000 0119',
      expiryDate: '12/25',
      cvv: '123',
      cardholderName: 'PROCESANDO PAGO',
      result: 'PROCESSING'
    }
  }

  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency || 'COP'
    }).format(price)
  }

  const formatCardNumber = (value) => {
    // Remove all non-digit characters
    const numbers = value.replace(/\D/g, '')
    // Add spaces every 4 digits
    const formatted = numbers.replace(/(\d{4})(?=\d)/g, '$1 ')
    return formatted.slice(0, 19) // Max 16 digits + 3 spaces
  }

  const formatExpiryDate = (value) => {
    // Remove all non-digit characters
    const numbers = value.replace(/\D/g, '')
    // Add slash after 2 digits
    if (numbers.length >= 2) {
      return numbers.slice(0, 2) + '/' + numbers.slice(2, 4)
    }
    return numbers
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    let formattedValue = value

    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value)
    } else if (name === 'expiryDate') {
      formattedValue = formatExpiryDate(value)
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4)
    }

    setPaymentData(prev => ({
      ...prev,
      [name]: formattedValue
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const validatePaymentData = () => {
    const newErrors = {}

    if (paymentMethod === 'credit_card') {
      const cardNumbers = paymentData.cardNumber.replace(/\s/g, '')
      
      if (!cardNumbers) {
        newErrors.cardNumber = 'El número de tarjeta es requerido'
      } else if (cardNumbers.length < 13 || cardNumbers.length > 19) {
        newErrors.cardNumber = 'Número de tarjeta inválido'
      }

      if (!paymentData.expiryDate) {
        newErrors.expiryDate = 'La fecha de vencimiento es requerida'
      } else if (!/^\d{2}\/\d{2}$/.test(paymentData.expiryDate)) {
        newErrors.expiryDate = 'Formato inválido (MM/AA)'
      }

      if (!paymentData.cvv) {
        newErrors.cvv = 'El CVV es requerido'
      } else if (paymentData.cvv.length < 3) {
        newErrors.cvv = 'CVV inválido'
      }

      if (!paymentData.cardholderName.trim()) {
        newErrors.cardholderName = 'El nombre del titular es requerido'
      }

      if (!paymentData.documentNumber.trim()) {
        newErrors.documentNumber = 'El número de documento es requerido'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validatePaymentData()) {
      return
    }

    setProcessing(true)
    setSimulationResult(null)

    try {
      // Simulador de pagos - detectar tarjeta de prueba
      const cardNumber = paymentData.cardNumber.replace(/\s/g, '')
      let result = 'APPROVED' // Por defecto aprobado
      
      // Detectar tipo de simulación basado en la tarjeta
      if (cardNumber === '4000000000000002') {
        result = 'DECLINED'
      } else if (cardNumber === '4000000000009995') {
        result = 'INSUFFICIENT_FUNDS'
      } else if (cardNumber === '4000000000000119') {
        result = 'PROCESSING'
      }

      // Simular tiempo de procesamiento
      await new Promise(resolve => setTimeout(resolve, 2000))

      const simulationData = {
        transactionId: `SIM_${Date.now()}`,
        status: result,
        method: paymentMethod,
        amount: selectedPlan.price,
        currency: selectedPlan.currency,
        timestamp: new Date().toISOString(),
        cardLast4: cardNumber.slice(-4),
        simulationMode: true
      }

      setSimulationResult(simulationData)

      if (result === 'APPROVED') {
        // Pago exitoso - continuar con el flujo
        setTimeout(() => {
          onComplete({
            success: true,
            ...simulationData,
            businessData,
            selectedPlan
          })
        }, 1500)
      } else {
        // Mostrar error específico
        let errorMessage = 'Error al procesar el pago'
        if (result === 'DECLINED') {
          errorMessage = 'Tarjeta rechazada por el banco'
        } else if (result === 'INSUFFICIENT_FUNDS') {
          errorMessage = 'Fondos insuficientes'
        } else if (result === 'PROCESSING') {
          errorMessage = 'El pago está siendo procesado. Te notificaremos el resultado.'
        }
        
        setErrors({ general: errorMessage })
        setProcessing(false)
      }
    } catch (error) {
      console.error('Payment simulation error:', error)
      setErrors({ general: 'Error al procesar el pago. Por favor intenta nuevamente.' })
      setProcessing(false)
    }
  }

  // Función para usar tarjetas de prueba
  const fillTestCard = (cardType) => {
    const card = testCards[cardType]
    if (card) {
      setPaymentData(prev => ({
        ...prev,
        cardNumber: card.cardNumber,
        expiryDate: card.expiryDate,
        cvv: card.cvv,
        cardholderName: card.cardholderName
      }))
      setErrors({}) // Limpiar errores
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Completar pago
        </h1>
        <p className="text-gray-600">
          Confirma tu suscripción y comienza tu prueba gratuita de 14 días
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Payment form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Payment method selection */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Método de Pago
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="credit_card"
                    value="credit_card"
                    checked={paymentMethod === 'credit_card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="h-4 w-4 text-pink-600 border-gray-300 focus:ring-pink-500"
                  />
                  <label htmlFor="credit_card" className="ml-3 flex items-center">
                    <CreditCardIcon className="w-6 h-6 text-gray-400 mr-2" />
                    <span className="text-gray-900 font-medium">Tarjeta de Crédito/Débito</span>
                  </label>
                </div>
                
                {/* TODO: Add more payment methods */}
                <div className="flex items-center opacity-50">
                  <input
                    type="radio"
                    id="pse"
                    value="pse"
                    disabled
                    className="h-4 w-4 text-gray-400 border-gray-300"
                  />
                  <label htmlFor="pse" className="ml-3 flex items-center">
                    <span className="text-gray-400 font-medium">PSE (Próximamente)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Test Cards Section - Solo en desarrollo */}
            {paymentMethod === 'credit_card' && (
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded mr-3">
                    PRUEBA
                  </span>
                  Tarjetas de Prueba
                </h3>
                <p className="text-blue-700 text-sm mb-4">
                  Usa estas tarjetas para probar diferentes escenarios de pago:
                </p>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={() => fillTestCard('success')}
                    className="p-3 text-left border border-green-200 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <div className="text-xs text-green-600 font-medium">✓ APROBADA</div>
                    <div className="text-xs text-green-700 mt-1">4242 4242 4242 4242</div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => fillTestCard('declined')}
                    className="p-3 text-left border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <div className="text-xs text-red-600 font-medium">✗ RECHAZADA</div>
                    <div className="text-xs text-red-700 mt-1">4000 0000 0000 0002</div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => fillTestCard('insufficient')}
                    className="p-3 text-left border border-orange-200 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                  >
                    <div className="text-xs text-orange-600 font-medium">$ SIN FONDOS</div>
                    <div className="text-xs text-orange-700 mt-1">4000 0000 0000 9995</div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => fillTestCard('processing')}
                    className="p-3 text-left border border-yellow-200 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
                  >
                    <div className="text-xs text-yellow-600 font-medium">⏳ PROCESANDO</div>
                    <div className="text-xs text-yellow-700 mt-1">4000 0000 0000 0119</div>
                  </button>
                </div>
              </div>
            )}

            {/* Credit card form */}
            {paymentMethod === 'credit_card' && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Datos de la Tarjeta
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Tarjeta *
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={paymentData.cardNumber}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                        errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="1234 5678 9012 3456"
                    />
                    {errors.cardNumber && (
                      <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de Vencimiento *
                      </label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={paymentData.expiryDate}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                          errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="MM/AA"
                      />
                      {errors.expiryDate && (
                        <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV *
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        value={paymentData.cvv}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                          errors.cvv ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="123"
                      />
                      {errors.cvv && (
                        <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Titular *
                    </label>
                    <input
                      type="text"
                      name="cardholderName"
                      value={paymentData.cardholderName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                        errors.cardholderName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Nombre como aparece en la tarjeta"
                    />
                    {errors.cardholderName && (
                      <p className="text-red-500 text-sm mt-1">{errors.cardholderName}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Documento
                      </label>
                      <select
                        name="documentType"
                        value={paymentData.documentType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      >
                        <option value="CC">Cédula de Ciudadanía</option>
                        <option value="CE">Cédula de Extranjería</option>
                        <option value="NIT">NIT</option>
                        <option value="PP">Pasaporte</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número de Documento *
                      </label>
                      <input
                        type="text"
                        name="documentNumber"
                        value={paymentData.documentNumber}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                          errors.documentNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="12345678"
                      />
                      {errors.documentNumber && (
                        <p className="text-red-500 text-sm mt-1">{errors.documentNumber}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <ShieldCheckIcon className="w-6 h-6 text-blue-500 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Pago Seguro</h4>
                  <p className="text-blue-700 text-sm mt-1">
                    Tu información está protegida con encriptación SSL de 256 bits. 
                    Procesamos pagos a través de Wompi, una plataforma PCI DSS certificada.
                  </p>
                </div>
              </div>
            </div>

            {/* Error message */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">{errors.general}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between">
              <button
                type="button"
                onClick={onBack}
                disabled={processing}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50"
              >
                ← Volver al registro
              </button>
              
              <button
                type="submit"
                disabled={processing}
                className="px-8 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Procesando...
                  </div>
                ) : (
                  'Completar Suscripción'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Resumen del Pedido
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">{selectedPlan?.name}</h4>
                <p className="text-sm text-gray-600">{selectedPlan?.description}</p>
              </div>
              
              {/* Módulos incluidos */}
              {selectedPlan?.modules && selectedPlan.modules.length > 0 && (
                <>
                  <hr className="border-gray-200" />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      📦 Módulos Incluidos
                    </h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {selectedPlan.modules.map((module, index) => {
                        const isIncluded = module.isIncluded || 
                                         module.included || 
                                         module.PlanModule?.isIncluded || 
                                         false
                        
                        return isIncluded ? (
                          <div key={index} className="flex items-start space-x-2">
                            <span className="text-green-500 text-xs">✓</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-900 truncate">
                                {module.displayName || module.name}
                              </p>
                            </div>
                          </div>
                        ) : null
                      })}
                    </div>
                  </div>
                </>
              )}
              
              <hr className="border-gray-200" />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Precio mensual:</span>
                  <span className="font-medium">
                    {formatPrice(selectedPlan?.price, selectedPlan?.currency)}
                  </span>
                </div>
                
                <div className="flex justify-between text-green-600">
                  <span>Prueba gratuita:</span>
                  <span className="font-medium">{selectedPlan?.trialDays || 14} días</span>
                </div>
                
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Hoy pagas:</span>
                  <span>$0 COP</span>
                </div>
              </div>
              
              <hr className="border-gray-200" />
              
              <div className="flex justify-between text-lg font-semibold">
                <span>Total hoy:</span>
                <span className="text-green-600">$0 COP</span>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-yellow-800 text-sm">
                  <strong>Recordatorio:</strong> Tu primer cobro será el{' '}
                  {new Date(Date.now() + (selectedPlan?.trialDays || 14) * 24 * 60 * 60 * 1000).toLocaleDateString('es-CO')}
                </p>
              </div>
            </div>

            {/* Business info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">Negocio:</h4>
              <p className="text-sm text-gray-600">{businessData?.businessName}</p>
              <p className="text-sm text-gray-600">{businessData?.businessEmail}</p>
            </div>

            {invitationToken && (
              <div className="mt-4 p-3 bg-pink-50 border border-pink-200 rounded">
                <p className="text-pink-800 text-sm font-medium">
                  🎉 Invitación especial
                </p>
                <p className="text-pink-600 text-xs mt-1">
                  Condiciones preferenciales aplicadas
                </p>
              </div>
            )}

            {/* Resultado de simulación */}
            {simulationResult && (
              <div className={`mt-4 p-4 rounded-lg border ${
                simulationResult.status === 'APPROVED' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    simulationResult.status === 'APPROVED' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <h4 className={`font-medium ${
                    simulationResult.status === 'APPROVED' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {simulationResult.status === 'APPROVED' ? '✓ Pago Aprobado' : '✗ Pago Rechazado'}
                  </h4>
                </div>
                <div className={`mt-2 text-sm ${
                  simulationResult.status === 'APPROVED' ? 'text-green-700' : 'text-red-700'
                }`}>
                  <p>ID: {simulationResult.transactionId}</p>
                  <p>Tarjeta: **** {simulationResult.cardLast4}</p>
                  <p>Monto: {formatPrice(simulationResult.amount, simulationResult.currency)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentFlow