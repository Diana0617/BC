import React, { useState, useEffect } from 'react'

const WompiWidgetMinimal = ({ 
  planName = "Premium", 
  amount = 1200000,
  businessData = null,
  selectedPlan = null,
  onSuccess, 
  onError 
}) => {
  const [config, setConfig] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  // Paso 1: Cargar configuración
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/wompi/config')
        const result = await response.json()
        
        if (result.success) {
          setConfig(result.data)
          console.log('✅ Configuración cargada:', result.data)
        } else {
          setError('Error cargando configuración')
        }
      } catch (err) {
        console.error('Error:', err)
        setError('Error de conexión: ' + err.message)
      }
    }

    loadConfig()
  }, [])

  const handlePayment = async () => {
    if (!config) {
      setError('Configuración no disponible')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Paso 2: Generar referencia única
      const reference = `BC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const amountInCents = Math.round(amount * 100)

      console.log('🎯 Datos del pago:', {
        reference,
        amountInCents,
        currency: config.currency,
        publicKey: config.publicKey
      })

      // Paso 2.5: Guardar datos del negocio en localStorage para payment-success
      if (businessData && selectedPlan) {
        const paymentData = {
          businessData,
          selectedPlan,
          reference,
          timestamp: Date.now()
        }
        localStorage.setItem('pendingBusinessCreation', JSON.stringify(paymentData))
        console.log('💾 Datos del negocio guardados en localStorage:', paymentData)
      }

      // Paso 3: Generar firma de integridad
      const signatureResponse = await fetch('http://localhost:3001/api/wompi/generate-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference,
          amountInCents,
          currency: config.currency
        })
      })

      const signatureData = await signatureResponse.json()
      console.log('🔐 Firma generada:', signatureData)

      if (!signatureData.success) {
        throw new Error('Error generando firma')
      }

      // Crear el formulario HTML dinámicamente (método más simple)
      createWompiForm({
        publicKey: config.publicKey,
        currency: config.currency,
        amountInCents: amountInCents,
        reference: reference,
        signature: signatureData.signature,
        redirectUrl: `http://localhost:3000/payment-success?reference=${reference}`
      })

    } catch (err) {
      console.error('❌ Error:', err)
      setError('Error: ' + err.message)
      setLoading(false)
    }
  }

  // Método más simple: crear formulario HTML y enviarlo
  const createWompiForm = (params) => {
    console.log('📝 Creando formulario con parámetros:', params)
    
    // Remover formulario anterior si existe
    const existingForm = document.getElementById('wompi-form')
    if (existingForm) {
      existingForm.remove()
    }

    // Crear nuevo formulario
    const form = document.createElement('form')
    form.id = 'wompi-form'
    form.action = 'https://checkout.wompi.co/p/'
    form.method = 'GET'
    form.target = '_blank' // Abrir en nueva ventana
    form.style.display = 'none'

    // Agregar campos obligatorios y opcionales
    const fields = {
      // Campos obligatorios según documentación oficial
      'public-key': params.publicKey,
      'currency': params.currency,
      'amount-in-cents': params.amountInCents,
      'reference': params.reference,
      'signature:integrity': params.signature,
      'redirect-url': params.redirectUrl
    }

    // Información básica del customer (opcional pero recomendada)
    fields['customer-data:email'] = 'test@beautycontrol.com'
    fields['customer-data:full-name'] = 'Usuario Prueba'
    fields['customer-data:phone-number'] = '3001234567'
    fields['customer-data:legal-id'] = '12345678'
    fields['customer-data:legal-id-type'] = 'CC'

    // Crear inputs
    Object.entries(fields).forEach(([name, value]) => {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = name
      input.value = value
      form.appendChild(input)
    })

    // Agregar al DOM y enviar
    document.body.appendChild(form)
    console.log('🚀 Enviando formulario a Wompi...')
    form.submit()
    
    // Limpiar estado después de un momento
    setTimeout(() => {
      setLoading(false)
      form.remove()
    }, 2000)
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4">💳 Wompi - Método Simple</h3>
      
      <div className="space-y-4">
        <div>
          <strong>Estado:</strong>
          <div className="text-sm">
            <div className={`${config ? 'text-green-600' : 'text-red-600'}`}>
              🔧 Config: {config ? 'Cargada' : 'Esperando...'}
            </div>
            <div className="text-gray-600">
              🌐 Método: Formulario HTML (Web Checkout)
            </div>
          </div>
        </div>

        {config && (
          <div className="text-xs bg-gray-100 p-2 rounded">
            <strong>Configuración:</strong>
            <div>PublicKey: {config.publicKey}</div>
            <div>Currency: {config.currency}</div>
            <div>Environment: {config.environment}</div>
          </div>
        )}

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div>
          <strong>Pago:</strong>
          <div className="text-sm text-gray-600 mb-2">
            Plan: {planName} - Monto: ${amount.toLocaleString('es-CO')} COP
          </div>
          
          {loading && (
            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-blue-800 font-medium">Redirigiendo a Wompi...</span>
              </div>
              <div className="text-xs text-blue-600 mt-1">
                Se abrirá una nueva ventana con el checkout de Wompi
              </div>
            </div>
          )}
          
          <button
            onClick={handlePayment}
            disabled={!config || loading}
            className={`w-full py-3 px-4 rounded font-semibold transition-colors ${
              config && !loading
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? '🔄 Procesando...' : 'Pagar con Wompi (Método Simple)'}
          </button>
        </div>

        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          <strong>📋 Método Simple:</strong>
          <div>• Usa formulario HTML estándar</div>
          <div>• Se abre en nueva ventana</div>
          <div>• Evita problemas de iframe</div>
          <div>• Más compatible con políticas de seguridad</div>
        </div>
      </div>
    </div>
  )
}

export default WompiWidgetMinimal