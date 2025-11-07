# Guía de Integración Frontend - Wompi 3D Secure v2

## Tabla de Contenidos
1. [Introducción](#introducción)
2. [Recolección de Información del Navegador](#recolección-de-información-del-navegador)
3. [Flujo de Pago 3DS v2](#flujo-de-pago-3ds-v2)
4. [Manejo de Challenge (iframe)](#manejo-de-challenge-iframe)
5. [Polling de Estado](#polling-de-estado)
6. [Ejemplos Completos](#ejemplos-completos)
7. [Manejo de Errores](#manejo-de-errores)
8. [Testing](#testing)

## Introducción

Esta guía te ayudará a integrar el sistema de pagos 3D Secure v2 de Wompi en tu frontend. El flujo incluye:

1. **Recolección de browserInfo** - Información del navegador requerida por 3DS v2
2. **Creación de transacción** - Llamada a la API con datos 3DS
3. **Manejo de challenges** - Renderizado de iframe para autenticación
4. **Polling de estado** - Verificación periódica del estado de la transacción
5. **Finalización** - Completar el proceso según el resultado

## Recolección de Información del Navegador

### Código JavaScript para browserInfo

```javascript
/**
 * Recopilar información del navegador requerida para 3DS v2
 * Esta función debe ejecutarse en el navegador del usuario
 */
function collectBrowserInfo() {
  try {
    const browserInfo = {
      browser_color_depth: window.screen.colorDepth.toString(),
      browser_screen_height: window.screen.height.toString(),
      browser_screen_width: window.screen.width.toString(),
      browser_language: window.navigator.language.toString(),
      browser_user_agent: window.navigator.userAgent.toString(),
      browser_tz: new Date().getTimezoneOffset().toString()
    };

    // Validar que todos los campos estén presentes
    for (const [key, value] of Object.entries(browserInfo)) {
      if (!value || value === 'undefined') {
        throw new Error(`Campo browserInfo faltante: ${key}`);
      }
    }

    console.log('✅ Browser info recolectado:', browserInfo);
    return browserInfo;

  } catch (error) {
    console.error('❌ Error recolectando browser info:', error);
    throw new Error(`Error recolectando información del navegador: ${error.message}`);
  }
}

/**
 * Ejemplo de uso con validación adicional
 */
function validateAndCollectBrowserInfo() {
  // Verificar que estamos en un navegador
  if (typeof window === 'undefined') {
    throw new Error('browserInfo solo puede recolectarse en el navegador');
  }

  // Verificar compatibilidad básica
  if (!window.screen || !window.navigator) {
    throw new Error('Navegador no compatible con 3DS v2');
  }

  return collectBrowserInfo();
}
```

### Ejemplo de integración React

```jsx
import React, { useState, useEffect } from 'react';

const Payment3DSForm = ({ businessSubscriptionId, onSuccess, onError }) => {
  const [browserInfo, setBrowserInfo] = useState(null);
  const [paymentData, setPaymentData] = useState({
    cardToken: '',
    customerEmail: '',
    acceptanceToken: ''
  });
  const [processing, setProcessing] = useState(false);
  const [challengeData, setChallengeData] = useState(null);

  // Recolectar browserInfo al cargar el componente
  useEffect(() => {
    try {
      const info = collectBrowserInfo();
      setBrowserInfo(info);
    } catch (error) {
      onError(`Error preparando el navegador: ${error.message}`);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!browserInfo) {
      onError('Información del navegador no disponible');
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch('/api/payments/3ds/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...paymentData,
          businessSubscriptionId,
          browserInfo,
          threeDsAuthType: 'challenge_v2', // Solo para testing
          autoRenewalEnabled: true
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      // Manejar diferentes escenarios
      handlePaymentResponse(result.data);

    } catch (error) {
      onError(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handlePaymentResponse = (data) => {
    console.log('🔐 Respuesta pago 3DS:', data);

    switch (data.scenario) {
      case 'no_challenge_success':
        // Pago exitoso sin challenge
        onSuccess(data);
        break;

      case 'challenge_denied':
        onError('Autenticación 3DS denegada');
        break;

      case 'challenge_required':
        // Mostrar challenge iframe
        setChallengeData(data.challengeData);
        break;

      case 'version_error':
      case 'auth_error':
        onError(data.threeDSInfo.message);
        break;

      default:
        onError(`Escenario desconocido: ${data.scenario}`);
    }
  };

  return (
    <div className="payment-3ds-form">
      {!challengeData ? (
        <form onSubmit={handleSubmit}>
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={paymentData.customerEmail}
              onChange={(e) => setPaymentData(prev => ({
                ...prev,
                customerEmail: e.target.value
              }))}
              required
            />
          </div>

          <div>
            <label>Token de Tarjeta:</label>
            <input
              type="text"
              value={paymentData.cardToken}
              onChange={(e) => setPaymentData(prev => ({
                ...prev,
                cardToken: e.target.value
              }))}
              required
            />
          </div>

          <div>
            <label>Token de Aceptación:</label>
            <input
              type="text"
              value={paymentData.acceptanceToken}
              onChange={(e) => setPaymentData(prev => ({
                ...prev,
                acceptanceToken: e.target.value
              }))}
              required
            />
          </div>

          <button type="submit" disabled={processing || !browserInfo}>
            {processing ? 'Procesando...' : 'Pagar con 3DS'}
          </button>

          {browserInfo && (
            <div className="browser-info-status">
              ✅ Información del navegador recolectada
            </div>
          )}
        </form>
      ) : (
        <Challenge3DSComponent
          challengeData={challengeData}
          onComplete={onSuccess}
          onError={onError}
        />
      )}
    </div>
  );
};

// Función helper para recolección de browserInfo
function collectBrowserInfo() {
  return {
    browser_color_depth: window.screen.colorDepth.toString(),
    browser_screen_height: window.screen.height.toString(),
    browser_screen_width: window.screen.width.toString(),
    browser_language: window.navigator.language.toString(),
    browser_user_agent: window.navigator.userAgent.toString(),
    browser_tz: new Date().getTimezoneOffset().toString()
  };
}
```

## Manejo de Challenge (iframe)

### Componente React para Challenge

```jsx
import React, { useEffect, useRef, useState } from 'react';

const Challenge3DSComponent = ({ challengeData, onComplete, onError }) => {
  const iframeRef = useRef(null);
  const [isPolling, setIsPolling] = useState(false);
  const [transactionId] = useState(challengeData.transactionId);

  useEffect(() => {
    if (challengeData.decodedIframe) {
      renderChallenge();
      startPolling();
    }
  }, [challengeData]);

  const renderChallenge = () => {
    try {
      console.log('🎯 Renderizando challenge 3DS iframe');
      
      // Crear un documento HTML para el iframe
      const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
      
      // Escribir el contenido decodificado
      iframeDoc.open();
      iframeDoc.write(challengeData.decodedIframe);
      iframeDoc.close();

      console.log('✅ Challenge iframe renderizado');

    } catch (error) {
      console.error('❌ Error renderizando challenge:', error);
      onError(`Error renderizando challenge: ${error.message}`);
    }
  };

  const startPolling = () => {
    if (isPolling) return;

    setIsPolling(true);
    console.log('🔄 Iniciando polling de estado 3DS');

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/payments/3ds/status/${transactionId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error);
        }

        const { data } = result;
        console.log('📊 Estado polling:', data.status, data.scenario);

        // Verificar si el challenge se completó
        if (data.scenario === 'challenge_completed' || !data.requiresAction) {
          console.log('✅ Challenge completado:', data.status);
          clearInterval(pollInterval);
          setIsPolling(false);

          if (data.status === 'APPROVED') {
            onComplete(data);
          } else {
            onError(`Pago ${data.status}: ${data.message}`);
          }
        }

      } catch (error) {
        console.error('❌ Error en polling:', error);
        clearInterval(pollInterval);
        setIsPolling(false);
        onError(`Error verificando estado: ${error.message}`);
      }
    }, 3000); // Polling cada 3 segundos

    // Timeout después de 5 minutos
    setTimeout(() => {
      if (isPolling) {
        clearInterval(pollInterval);
        setIsPolling(false);
        onError('Timeout: El challenge 3DS tomó demasiado tiempo');
      }
    }, 300000); // 5 minutos
  };

  return (
    <div className="challenge-3ds-container">
      <div className="challenge-header">
        <h3>🔐 Autenticación 3D Secure</h3>
        <p>Complete la autenticación en el formulario de su banco:</p>
      </div>

      <div className="challenge-iframe-container">
        <iframe
          ref={iframeRef}
          style={{
            width: '100%',
            height: '400px',
            border: '1px solid #ddd',
            borderRadius: '8px'
          }}
          title="3D Secure Challenge"
          sandbox="allow-scripts allow-forms allow-same-origin"
        />
      </div>

      <div className="challenge-status">
        {isPolling && (
          <div className="polling-indicator">
            <span>🔄 Verificando estado del pago...</span>
          </div>
        )}
      </div>

      <div className="challenge-instructions">
        <ul>
          <li>Complete la autenticación con su banco</li>
          <li>No cierre esta ventana durante el proceso</li>
          <li>El resultado se actualizará automáticamente</li>
        </ul>
      </div>
    </div>
  );
};
```

### Manejo de Challenge con Vanilla JavaScript

```javascript
/**
 * Manejar challenge 3DS con JavaScript vanilla
 */
class Challenge3DSHandler {
  constructor(containerId, transactionId, challengeData) {
    this.container = document.getElementById(containerId);
    this.transactionId = transactionId;
    this.challengeData = challengeData;
    this.pollInterval = null;
    this.onComplete = null;
    this.onError = null;
  }

  /**
   * Renderizar el challenge iframe
   */
  render() {
    try {
      console.log('🎯 Renderizando challenge 3DS');

      const challengeHTML = `
        <div class="challenge-3ds-wrapper">
          <h3>🔐 Autenticación 3D Secure</h3>
          <p>Complete la autenticación en el formulario de su banco:</p>
          
          <iframe 
            id="challenge-iframe"
            style="width: 100%; height: 400px; border: 1px solid #ddd; border-radius: 8px;"
            sandbox="allow-scripts allow-forms allow-same-origin">
          </iframe>
          
          <div id="challenge-status">
            <div class="polling-indicator">
              🔄 Verificando estado del pago...
            </div>
          </div>
        </div>
      `;

      this.container.innerHTML = challengeHTML;

      // Obtener referencia al iframe y escribir contenido
      const iframe = document.getElementById('challenge-iframe');
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      
      iframeDoc.open();
      iframeDoc.write(this.challengeData.decodedIframe);
      iframeDoc.close();

      console.log('✅ Challenge iframe renderizado');

      // Iniciar polling
      this.startPolling();

    } catch (error) {
      console.error('❌ Error renderizando challenge:', error);
      this.handleError(`Error renderizando challenge: ${error.message}`);
    }
  }

  /**
   * Iniciar polling de estado
   */
  startPolling() {
    console.log('🔄 Iniciando polling de estado');

    this.pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/payments/3ds/status/${this.transactionId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error);
        }

        console.log('📊 Estado polling:', result.data.status, result.data.scenario);

        if (result.data.scenario === 'challenge_completed' || !result.data.requiresAction) {
          this.stopPolling();

          if (result.data.status === 'APPROVED') {
            this.handleComplete(result.data);
          } else {
            this.handleError(`Pago ${result.data.status}: ${result.data.message}`);
          }
        }

      } catch (error) {
        console.error('❌ Error en polling:', error);
        this.stopPolling();
        this.handleError(`Error verificando estado: ${error.message}`);
      }
    }, 3000);

    // Timeout después de 5 minutos
    setTimeout(() => {
      if (this.pollInterval) {
        this.stopPolling();
        this.handleError('Timeout: El challenge 3DS tomó demasiado tiempo');
      }
    }, 300000);
  }

  /**
   * Detener polling
   */
  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  /**
   * Manejar completación exitosa
   */
  handleComplete(data) {
    console.log('✅ Challenge completado:', data);
    if (this.onComplete) {
      this.onComplete(data);
    }
  }

  /**
   * Manejar error
   */
  handleError(message) {
    console.error('❌ Error en challenge:', message);
    this.stopPolling();
    if (this.onError) {
      this.onError(message);
    }
  }

  /**
   * Configurar callbacks
   */
  setCallbacks(onComplete, onError) {
    this.onComplete = onComplete;
    this.onError = onError;
  }
}

/**
 * Ejemplo de uso
 */
function handleChallenge3DS(challengeData) {
  const handler = new Challenge3DSHandler(
    'challenge-container',
    challengeData.transactionId,
    challengeData
  );

  handler.setCallbacks(
    (data) => {
      alert(`¡Pago exitoso! ID: ${data.transactionId}`);
      window.location.href = '/success';
    },
    (error) => {
      alert(`Error en pago: ${error}`);
      window.location.href = '/error';
    }
  );

  handler.render();
}
```

## Flujo Completo de Integración

### Código completo para manejo de pagos 3DS v2

```javascript
/**
 * Servicio completo para manejar pagos 3DS v2
 */
class Payment3DSService {
  constructor(baseURL, token) {
    this.baseURL = baseURL;
    this.token = token;
  }

  /**
   * Crear pago 3DS v2
   */
  async createPayment(paymentData) {
    try {
      // 1. Recolectar información del navegador
      const browserInfo = this.collectBrowserInfo();

      // 2. Preparar datos completos
      const requestData = {
        ...paymentData,
        browserInfo,
        threeDsAuthType: this.getTestAuthType() // Solo para testing
      };

      // 3. Llamar a la API
      const response = await fetch(`${this.baseURL}/api/payments/3ds/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data;

    } catch (error) {
      console.error('❌ Error creando pago 3DS:', error);
      throw error;
    }
  }

  /**
   * Consultar estado de transacción
   */
  async getTransactionStatus(transactionId) {
    try {
      const response = await fetch(`${this.baseURL}/api/payments/3ds/status/${transactionId}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data;

    } catch (error) {
      console.error('❌ Error consultando estado:', error);
      throw error;
    }
  }

  /**
   * Recolectar información del navegador
   */
  collectBrowserInfo() {
    return {
      browser_color_depth: window.screen.colorDepth.toString(),
      browser_screen_height: window.screen.height.toString(),
      browser_screen_width: window.screen.width.toString(),
      browser_language: window.navigator.language.toString(),
      browser_user_agent: window.navigator.userAgent.toString(),
      browser_tz: new Date().getTimezoneOffset().toString()
    };
  }

  /**
   * Obtener tipo de autenticación para testing
   */
  getTestAuthType() {
    // En producción, este campo NO debe enviarse
    if (process.env.NODE_ENV === 'production') {
      return undefined;
    }

    // Para testing, puedes cambiar entre diferentes escenarios
    return 'challenge_v2'; // 'no_challenge_success', 'challenge_denied', 'challenge_v2', etc.
  }
}

/**
 * Ejemplo de uso completo
 */
async function handlePayment3DS() {
  const paymentService = new Payment3DSService(
    'https://tu-api.com',
    localStorage.getItem('token')
  );

  try {
    // 1. Crear el pago
    console.log('🚀 Iniciando pago 3DS v2');
    
    const paymentResult = await paymentService.createPayment({
      cardToken: 'tok_test_123456',
      customerEmail: 'test@example.com',
      acceptanceToken: 'ptok_123456',
      businessSubscriptionId: 'sub_123456',
      autoRenewalEnabled: true
    });

    console.log('💳 Pago creado:', paymentResult);

    // 2. Manejar respuesta según el escenario
    switch (paymentResult.scenario) {
      case 'no_challenge_success':
        console.log('✅ Pago aprobado sin challenge');
        handleSuccess(paymentResult);
        break;

      case 'challenge_denied':
        console.log('❌ Autenticación denegada');
        handleError('Autenticación 3DS denegada');
        break;

      case 'challenge_required':
        console.log('🔐 Challenge requerido');
        await handleChallenge(paymentResult);
        break;

      case 'version_error':
      case 'auth_error':
        console.log('❌ Error en 3DS');
        handleError(paymentResult.threeDSInfo.message);
        break;

      default:
        console.log('❓ Escenario desconocido');
        handleError(`Escenario no manejado: ${paymentResult.scenario}`);
    }

  } catch (error) {
    console.error('❌ Error en flujo de pago:', error);
    handleError(error.message);
  }
}

async function handleChallenge(paymentResult) {
  // Renderizar challenge iframe
  const challengeHandler = new Challenge3DSHandler(
    'payment-container',
    paymentResult.transactionId,
    paymentResult.challengeData
  );

  return new Promise((resolve, reject) => {
    challengeHandler.setCallbacks(
      (data) => {
        console.log('✅ Challenge completado exitosamente');
        handleSuccess(data);
        resolve(data);
      },
      (error) => {
        console.error('❌ Error en challenge');
        handleError(error);
        reject(new Error(error));
      }
    );

    challengeHandler.render();
  });
}

function handleSuccess(data) {
  console.log('🎉 Pago exitoso:', data);
  
  // Mostrar mensaje de éxito
  alert(`¡Pago completado! Transacción: ${data.transactionId}`);
  
  // Redirigir o actualizar UI
  window.location.href = '/payment-success';
}

function handleError(message) {
  console.error('💥 Error en pago:', message);
  
  // Mostrar mensaje de error
  alert(`Error en el pago: ${message}`);
  
  // Permitir reintento o redirigir
  // window.location.href = '/payment-error';
}
```

## Manejo de Errores

### Errores Comunes y Soluciones

```javascript
/**
 * Manejo robusto de errores en 3DS v2
 */
class Payment3DSErrorHandler {
  static handleAPIError(error, response) {
    if (response?.status === 400) {
      // Error de validación
      return {
        type: 'validation',
        message: 'Datos de pago inválidos',
        details: error.message,
        recoverable: true
      };
    }

    if (response?.status === 401) {
      // Error de autenticación
      return {
        type: 'auth',
        message: 'Sesión expirada',
        details: 'Por favor inicie sesión nuevamente',
        recoverable: false,
        action: 'redirect_login'
      };
    }

    if (response?.status === 500) {
      // Error del servidor
      return {
        type: 'server',
        message: 'Error interno del servidor',
        details: 'Inténtelo nuevamente en unos momentos',
        recoverable: true
      };
    }

    return {
      type: 'unknown',
      message: 'Error desconocido',
      details: error.message,
      recoverable: true
    };
  }

  static handleBrowserInfoError(error) {
    return {
      type: 'browser',
      message: 'Error recolectando información del navegador',
      details: error.message,
      recoverable: false,
      suggestions: [
        'Verifique que JavaScript esté habilitado',
        'Use un navegador moderno',
        'Desactive extensiones que bloqueen scripts'
      ]
    };
  }

  static handle3DSError(scenario, status, message) {
    const errorMap = {
      'challenge_denied': {
        type: '3ds_denied',
        message: 'Autenticación 3DS denegada',
        details: 'Su banco denegó la autenticación',
        recoverable: true,
        suggestions: ['Verifique sus credenciales bancarias', 'Contacte a su banco']
      },
      'version_error': {
        type: '3ds_unsupported',
        message: 'Tarjeta no compatible con 3D Secure',
        details: 'Esta tarjeta no soporta autenticación 3DS',
        recoverable: false,
        suggestions: ['Use una tarjeta diferente', 'Contacte a su banco']
      },
      'auth_error': {
        type: '3ds_auth_error',
        message: 'Error en autenticación 3DS',
        details: message || 'Error de comunicación con el banco',
        recoverable: true,
        suggestions: ['Inténtelo nuevamente', 'Verifique su conexión a internet']
      }
    };

    return errorMap[scenario] || {
      type: '3ds_unknown',
      message: 'Error 3DS desconocido',
      details: message,
      recoverable: true
    };
  }
}

/**
 * Ejemplo de uso del manejo de errores
 */
async function safePayment3DS(paymentData) {
  try {
    const result = await payment3DSService.createPayment(paymentData);
    return { success: true, data: result };

  } catch (error) {
    const errorInfo = Payment3DSErrorHandler.handleAPIError(error, error.response);
    
    console.error('🚨 Error en pago:', errorInfo);

    // Mostrar error al usuario
    showUserError(errorInfo);

    // Log para debugging
    logError('payment_3ds_error', {
      type: errorInfo.type,
      message: errorInfo.message,
      details: errorInfo.details,
      originalError: error.message
    });

    return { success: false, error: errorInfo };
  }
}

function showUserError(errorInfo) {
  const errorContainer = document.getElementById('error-container');
  
  const errorHTML = `
    <div class="error-alert">
      <h4>❌ ${errorInfo.message}</h4>
      <p>${errorInfo.details}</p>
      
      ${errorInfo.suggestions ? `
        <ul>
          ${errorInfo.suggestions.map(s => `<li>${s}</li>`).join('')}
        </ul>
      ` : ''}
      
      ${errorInfo.recoverable ? `
        <button onclick="retryPayment()">🔄 Reintentar</button>
      ` : ''}
    </div>
  `;

  errorContainer.innerHTML = errorHTML;
}
```

## Testing

### Configuración para Testing

```javascript
/**
 * Configuración para testing de 3DS v2
 */
const TEST_CONFIG = {
  // Tarjetas de prueba para diferentes escenarios
  testCards: {
    // Tarjeta principal recomendada por Wompi
    flexible: '4242424242424242',
    
    // Tarjetas específicas para checkout (no API)
    requireChallenge: '2303779951000446',
    frictionless: '2303779951000297',
    denied: '2303779951000453',
    error: '2303779951000354',
    unsupported: '2303779951000347'
  },

  // Tipos de autenticación para testing
  authTypes: {
    noChallenge: 'no_challenge_success',
    challengeDenied: 'challenge_denied',
    challengeRequired: 'challenge_v2',
    versionError: 'supported_version_error',
    authError: 'authentication_error'
  },

  // Datos de prueba
  testData: {
    acceptanceToken: 'ptok_test_123456',
    customerEmail: 'test@beautycontrol.com',
    expMonth: '12',
    expYear: '25',
    cvc: '123'
  }
};

/**
 * Helper para crear pagos de prueba
 */
class Payment3DSTestHelper {
  static createTestPayment(scenario = 'challenge_v2') {
    return {
      cardToken: 'tok_test_' + Date.now(),
      customerEmail: TEST_CONFIG.testData.customerEmail,
      acceptanceToken: TEST_CONFIG.testData.acceptanceToken,
      businessSubscriptionId: 'test_sub_123',
      threeDsAuthType: TEST_CONFIG.authTypes[scenario] || scenario,
      autoRenewalEnabled: true
    };
  }

  static async testAllScenarios() {
    const scenarios = Object.keys(TEST_CONFIG.authTypes);
    const results = {};

    for (const scenario of scenarios) {
      try {
        console.log(`🧪 Testing scenario: ${scenario}`);
        
        const paymentData = this.createTestPayment(scenario);
        const result = await payment3DSService.createPayment(paymentData);
        
        results[scenario] = {
          success: true,
          data: result
        };

        console.log(`✅ ${scenario} passed:`, result.scenario);

      } catch (error) {
        results[scenario] = {
          success: false,
          error: error.message
        };

        console.error(`❌ ${scenario} failed:`, error.message);
      }
    }

    return results;
  }
}

/**
 * Ejemplo de testing automático
 */
async function runPayment3DSTests() {
  console.log('🧪 Iniciando tests de 3DS v2');

  try {
    const results = await Payment3DSTestHelper.testAllScenarios();
    
    console.log('📊 Resultados de tests:', results);

    // Mostrar resumen
    const passed = Object.values(results).filter(r => r.success).length;
    const total = Object.keys(results).length;
    
    console.log(`✅ Tests completados: ${passed}/${total} exitosos`);

  } catch (error) {
    console.error('❌ Error en tests:', error);
  }
}
```

Esta guía proporciona todo lo necesario para integrar el sistema de pagos 3D Secure v2 en el frontend, incluyendo la recolección de browserInfo, manejo de challenges, polling de estado y manejo robusto de errores.