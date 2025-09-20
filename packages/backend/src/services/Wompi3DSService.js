/**
 * Servicio para manejar pagos con Wompi u      console.log('🔐 Creando transacción 3DS v2:', {
        email: transactionData.customerEmail,
        amount: transactionData.amountInCents,
        reference: transactionData.reference,
        authType: transactionData.threeDsAuthType,
        customerName: transactionData.customerName,
        url: `${this.baseURL}/transactions`,
        publicKey: this.publicKey.substring(0, 12) + '...'
      }); Secure v2 (3DS) y 3RI
 * 
 * 3DS v2: Para crear transacciones seguras con autenticación (primera vez)
 * 3RI: Para pagos recurrentes automáticos usando tokens de fuentes de pago
 * 
 * Documentación: https://docs.wompi.co/docs/colombia/transacciones-con-3d-secure-v2/
 */

const axios = require('axios');
const { SubscriptionPayment, BusinessSubscription, Business } = require('../models');

class Wompi3DSService {
  constructor() {
    this.baseURL = process.env.WOMPI_API_URL || 'https://sandbox.wompi.co/v1';
    this.publicKey = process.env.WOMPI_PUBLIC_KEY;
    this.privateKey = process.env.WOMPI_PRIVATE_KEY;
    this.isSandbox = process.env.WOMPI_ENVIRONMENT === 'test';
    
    console.log('🔧 Wompi3DSService configurado:', {
      baseURL: this.baseURL,
      publicKey: this.publicKey?.substring(0, 10) + '...',
      privateKey: this.privateKey?.substring(0, 10) + '...',
      isSandbox: this.isSandbox,
      environment: process.env.WOMPI_ENVIRONMENT
    });
    
    if (!this.publicKey || !this.privateKey) {
      throw new Error('Las claves de Wompi no están configuradas');
    }
  }

  /**
   * Crear una transacción con 3D Secure v2
   * @param {Object} transactionData - Datos de la transacción
   * @param {string} transactionData.token - Token de la tarjeta
   * @param {string} transactionData.customerEmail - Email del cliente
   * @param {string} transactionData.acceptanceToken - Token de aceptación
   * @param {number} transactionData.amountInCents - Monto en centavos
   * @param {string} transactionData.currency - Moneda (COP)
   * @param {string} transactionData.reference - Referencia única
   * @param {Object} transactionData.browserInfo - Información del navegador requerida para 3DS v2
   * @param {string} transactionData.threeDsAuthType - Tipo de autenticación 3DS (solo sandbox)
   * @returns {Object} Transacción creada con datos 3DS
   */
  async create3DSTransaction(transactionData) {
    try {
      console.log('🔐 Creando transacción 3DS v2:', {
        email: transactionData.customerEmail,
        amount: transactionData.amountInCents,
        reference: transactionData.reference,
        authType: transactionData.threeDsAuthType,
        url: `${this.baseURL}/transactions`,
        publicKey: this.publicKey?.substring(0, 10) + '...'
      });

      // Validar que browserInfo esté presente
      if (!transactionData.browserInfo || Object.keys(transactionData.browserInfo).length === 0) {
        throw new Error('browserInfo es requerido para transacciones 3DS v2');
      }

      const requestBody = {
        acceptance_token: transactionData.acceptanceToken,
        amount_in_cents: transactionData.amountInCents,
        currency: transactionData.currency || 'COP',
        customer_email: transactionData.customerEmail,
        reference: transactionData.reference,
        payment_method: {
          type: 'CARD',
          token: transactionData.token,
          installments: 1 // Campo obligatorio - número de cuotas
        },
        // Campos obligatorios para 3DS v2
        is_three_ds: true,
        customer_data: {
          full_name: transactionData.customerName || 'Usuario BC',
          browser_info: transactionData.browserInfo
        }
      };

      // Solo agregar three_ds_auth_type en sandbox/testing
      if (this.isSandbox && transactionData.threeDsAuthType) {
        requestBody.three_ds_auth_type = transactionData.threeDsAuthType;
      }

      // Corregir formato de customer_data para Wompi - mantener full_name
      if (requestBody.customer_data?.browser_info) {
        requestBody.customer_data = {
          full_name: requestBody.customer_data.full_name, // Mantener el full_name
          browser_info: requestBody.customer_data.browser_info
        };
      }

      // DEBUG: Log del requestBody completo antes de enviar
      console.log('📤 DEBUG - RequestBody completo a Wompi:', {
        ...requestBody,
        customer_data_debug: {
          full_name: requestBody.customer_data?.full_name,
          browser_info_present: !!requestBody.customer_data?.browser_info,
          browser_info_keys: requestBody.customer_data?.browser_info ? Object.keys(requestBody.customer_data.browser_info) : null
        },
        payment_method_debug: {
          type: requestBody.payment_method?.type,
          token: requestBody.payment_method?.token ? requestBody.payment_method.token.substring(0, 20) + '...' : 'NO_TOKEN',
          token_length: requestBody.payment_method?.token?.length
        }
      });

      const response = await axios.post(`${this.baseURL}/transactions`, requestBody, {
        headers: {
          'Authorization': `Bearer ${this.publicKey}`,
          'Content-Type': 'application/json'
        }
      });

      const transaction = response.data.data;
      
      console.log('✅ Transacción 3DS creada:', {
        id: transaction.id,
        status: transaction.status,
        authType: transaction.payment_method?.extra?.three_ds_auth_type,
        currentStep: transaction.payment_method?.extra?.three_ds_auth?.current_step,
        stepStatus: transaction.payment_method?.extra?.three_ds_auth?.current_step_status
      });

      return transaction;

    } catch (error) {
      console.error('❌ Error creando transacción 3DS:', {
        status: error.response?.status,
        data: error.response?.data,
        error: error.response?.data?.error,
        messages: error.response?.data?.error?.messages,
        customer_data_errors: error.response?.data?.error?.messages?.customer_data,
        payment_method_errors: error.response?.data?.error?.messages?.payment_method,
        payment_method_details: error.response?.data?.error?.messages?.payment_method?.messages
      });
      throw new Error(`Error al crear transacción 3DS: ${error.response?.data?.error?.reason || error.message}`);
    }
  }

  /**
   * Consultar el estado de una transacción 3DS
   * @param {string} transactionId - ID de la transacción
   * @returns {Object} Estado actual de la transacción con datos 3DS
   */
  async get3DSTransactionStatus(transactionId) {
    try {
      const response = await axios.get(`${this.baseURL}/transactions/${transactionId}`, {
        headers: {
          'Authorization': `Bearer ${this.publicKey}`
        }
      });

      const transaction = response.data.data;
      
      console.log('📊 Estado transacción 3DS:', {
        id: transactionId,
        status: transaction.status,
        currentStep: transaction.payment_method?.extra?.three_ds_auth?.current_step,
        stepStatus: transaction.payment_method?.extra?.three_ds_auth?.current_step_status,
        hasChallenge: !!transaction.payment_method?.extra?.three_ds_auth?.three_ds_method_data
      });

      return transaction;

    } catch (error) {
      console.error('❌ Error consultando transacción 3DS:', error.response?.data || error.message);
      throw new Error(`Error al consultar transacción: ${error.response?.data?.error?.reason || error.message}`);
    }
  }

  /**
   * Crear una fuente de pago segura con 3D Secure (para tokenización)
   * @param {Object} paymentData - Datos del pago
   * @param {string} paymentData.token - Token de la tarjeta
   * @param {string} paymentData.customerEmail - Email del cliente
   * @param {string} paymentData.acceptanceToken - Token de aceptación
   * @returns {Object} Fuente de pago creada
   */
  async createSecurePaymentSource(paymentData) {
    try {
      console.log('🔐 Creando fuente de pago segura con 3DS:', paymentData.customerEmail);

      const response = await axios.post(`${this.baseURL}/payment_sources`, {
        type: 'CARD',
        token: paymentData.token,
        customer_email: paymentData.customerEmail,
        acceptance_token: paymentData.acceptanceToken
      }, {
        headers: {
          'Authorization': `Bearer ${this.publicKey}`,
          'Content-Type': 'application/json'
        }
      });

      const paymentSource = response.data.data;
      
      console.log('✅ Fuente de pago creada:', {
        id: paymentSource.id,
        status: paymentSource.status,
        is3DS: paymentSource.extra?.is_three_ds
      });

      return paymentSource;

    } catch (error) {
      console.error('❌ Error creando fuente de pago:', error.response?.data || error.message);
      throw new Error(`Error al crear fuente de pago: ${error.response?.data?.error?.reason || error.message}`);
    }
  }

  /**
   * Extraer y decodificar el iframe del challenge 3DS
   * @param {string} threeDsMethodData - Datos codificados del iframe
   * @returns {string} HTML decodificado del iframe
   */
  decodeChallenge3DSIframe(threeDsMethodData) {
    try {
      if (!threeDsMethodData) {
        throw new Error('No hay datos de challenge 3DS para decodificar');
      }

      // Decodificar entidades HTML (&lt; a < , &gt; a > , etc.)
      const decodedHtml = threeDsMethodData
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&amp;/g, '&');

      console.log('✅ Challenge iframe decodificado correctamente');
      return decodedHtml;

    } catch (error) {
      console.error('❌ Error decodificando challenge iframe:', error.message);
      throw new Error(`Error al decodificar challenge: ${error.message}`);
    }
  }

  /**
   * Procesar respuesta de transacción 3DS v2 según los diferentes escenarios
   * @param {Object} transaction - Respuesta de transacción de Wompi
   * @returns {Object} Datos procesados con el estado y acciones requeridas
   */
  process3DSTransactionResponse(transaction) {
    try {
      const threeDsAuth = transaction.payment_method?.extra?.three_ds_auth;
      const authType = transaction.payment_method?.extra?.three_ds_auth_type;
      
      if (!threeDsAuth) {
        return {
          scenario: 'no_3ds',
          status: transaction.status,
          requiresAction: false,
          message: 'Transacción sin 3D Secure'
        };
      }

      const currentStep = threeDsAuth.current_step;
      const stepStatus = threeDsAuth.current_step_status;

      switch (authType) {
        case 'no_challenge_success':
          return {
            scenario: 'no_challenge_success',
            status: transaction.status, // Should be APPROVED
            requiresAction: false,
            message: 'Autenticación 3DS exitosa sin challenge',
            currentStep,
            stepStatus
          };

        case 'challenge_denied':
          return {
            scenario: 'challenge_denied',
            status: transaction.status, // Should be DECLINED
            requiresAction: false,
            message: 'Autenticación 3DS denegada',
            currentStep,
            stepStatus
          };

        case 'challenge_v2':
          if (currentStep === 'CHALLENGE' && stepStatus === 'PENDING') {
            return {
              scenario: 'challenge_required',
              status: transaction.status, // Should be PENDING
              requiresAction: true,
              message: 'Se requiere completar challenge 3DS',
              currentStep,
              stepStatus,
              challengeData: threeDsAuth.three_ds_method_data,
              decodedIframe: this.decodeChallenge3DSIframe(threeDsAuth.three_ds_method_data)
            };
          } else if (currentStep === 'AUTHENTICATION' && stepStatus === 'COMPLETED') {
            return {
              scenario: 'challenge_completed',
              status: transaction.status, // APPROVED, DECLINED, or ERROR
              requiresAction: false,
              message: 'Challenge 3DS completado',
              currentStep,
              stepStatus
            };
          }
          break;

        case 'supported_version_error':
          return {
            scenario: 'version_error',
            status: transaction.status, // Should be ERROR
            requiresAction: false,
            message: 'Tarjeta no compatible con 3D Secure',
            currentStep,
            stepStatus,
            error: 'La tarjeta no soporta el protocolo 3D Secure'
          };

        case 'authentication_error':
          return {
            scenario: 'auth_error',
            status: transaction.status, // Should be ERROR
            requiresAction: false,
            message: 'Error en la autenticación 3DS',
            currentStep,
            stepStatus,
            error: 'Error de comunicación o autenticación 3DS'
          };

        default:
          return {
            scenario: 'unknown',
            status: transaction.status,
            requiresAction: false,
            message: `Tipo de autenticación desconocido: ${authType}`,
            currentStep,
            stepStatus
          };
      }

    } catch (error) {
      console.error('❌ Error procesando respuesta 3DS:', error.message);
      throw new Error(`Error al procesar respuesta 3DS: ${error.message}`);
    }
  }

  /**
   * Validar información del navegador requerida para 3DS v2
   * @param {Object} browserInfo - Información del navegador
   * @returns {boolean} Si la información es válida
   */
  validateBrowserInfo(browserInfo) {
    const requiredFields = [
      'browser_color_depth',
      'browser_screen_height', 
      'browser_screen_width',
      'browser_language',
      'browser_user_agent',
      'browser_tz'
    ];

    for (const field of requiredFields) {
      if (!browserInfo[field]) {
        throw new Error(`Campo requerido faltante: ${field}`);
      }
    }

    return true;
  }

  /**
   * Registrar pago 3DS v2 en nuestra base de datos
   * @param {Object} paymentData - Datos del pago para guardar
   * @returns {Object} Registro de pago creado
   */
  async savePayment3DSToDatabase(paymentData) {
    try {
      console.log('💾 Guardando pago 3DS en base de datos:', paymentData.reference);

      const subscriptionPayment = await SubscriptionPayment.create({
        businessSubscriptionId: paymentData.businessSubscriptionId,
        amount: paymentData.amount,
        currency: paymentData.currency || 'COP',
        status: this.mapWompiStatusToOurs(paymentData.status),
        paymentMethod: 'WOMPI_3DS',
        transactionId: paymentData.transactionId,
        externalReference: paymentData.reference,
        dueDate: paymentData.dueDate,
        
        // Datos específicos 3DS v2
        isThreeDsEnabled: true,
        browserInfo: paymentData.browserInfo,
        threeDsAuthType: paymentData.threeDsAuthType,
        threeDsMethodData: paymentData.threeDsMethodData,
        currentStep: paymentData.currentStep,
        currentStepStatus: paymentData.currentStepStatus,
        threeDsAuthData: paymentData.threeDsAuthData,
        
        // Datos para tokenización
        paymentSourceToken: paymentData.paymentSourceToken,
        recurringType: paymentData.recurringType || 'INITIAL',
        isRecurringPayment: false,
        autoRenewalEnabled: paymentData.autoRenewalEnabled || false,
        
        // Metadatos
        providerResponse: paymentData.providerResponse,
        netAmount: paymentData.amount, // Se actualizará con las comisiones reales
        commissionFee: 0 // Se actualizará con las comisiones reales
      });

      console.log('✅ Pago 3DS guardado en BD:', {
        id: subscriptionPayment.id,
        transactionId: subscriptionPayment.transactionId,
        status: subscriptionPayment.status
      });

      return subscriptionPayment;

    } catch (error) {
      console.error('❌ Error guardando pago 3DS en BD:', error.message);
      throw new Error(`Error al guardar pago en BD: ${error.message}`);
    }
  }

  /**
   * Actualizar estado de pago 3DS según respuesta de Wompi
   * @param {string} paymentId - ID del pago en nuestra BD
   * @param {Object} wompiTransaction - Respuesta de transacción de Wompi
   * @returns {Object} Pago actualizado
   */
  async updatePayment3DSStatus(paymentId, wompiTransaction) {
    try {
      console.log('🔄 Actualizando estado pago 3DS:', paymentId);

      const payment = await SubscriptionPayment.findByPk(paymentId);
      if (!payment) {
        throw new Error('Pago no encontrado');
      }

      const processedResponse = this.process3DSTransactionResponse(wompiTransaction);
      const threeDsAuth = wompiTransaction.payment_method?.extra?.three_ds_auth;

      const updateData = {
        status: this.mapWompiStatusToOurs(wompiTransaction.status),
        currentStep: threeDsAuth?.current_step,
        currentStepStatus: threeDsAuth?.current_step_status,
        threeDsMethodData: threeDsAuth?.three_ds_method_data,
        threeDsAuthData: threeDsAuth,
        providerResponse: wompiTransaction
      };

      // Si la transacción fue aprobada, marcar como completada
      if (wompiTransaction.status === 'APPROVED') {
        updateData.paidAt = new Date();
        updateData.status = 'COMPLETED';
      }

      await payment.update(updateData);

      console.log('✅ Estado pago 3DS actualizado:', {
        id: paymentId,
        newStatus: updateData.status,
        scenario: processedResponse.scenario
      });

      return payment;

    } catch (error) {
      console.error('❌ Error actualizando estado pago 3DS:', error.message);
      throw new Error(`Error al actualizar estado: ${error.message}`);
    }
  }

  /**
   * Mapear estados de Wompi a nuestros estados internos
   * @param {string} wompiStatus - Estado de Wompi
   * @returns {string} Estado interno
   */
  mapWompiStatusToOurs(wompiStatus) {
    const statusMap = {
      'PENDING': 'THREEDS_PENDING',
      'APPROVED': 'COMPLETED',
      'DECLINED': 'DECLINED', 
      'ERROR': 'ERROR',
      'FAILED': 'FAILED'
    };

    return statusMap[wompiStatus] || 'PENDING';
  }

  /**
   * Procesar flujo completo de pago 3DS v2
   * @param {Object} paymentRequest - Solicitud de pago completa
   * @returns {Object} Resultado del proceso con siguiente acción
   */
  async processComplete3DSPayment(paymentRequest) {
    try {
      console.log('🚀 Iniciando flujo completo 3DS v2:', paymentRequest.reference);

      // 1. Validar información del navegador
      this.validateBrowserInfo(paymentRequest.browserInfo);

      // 2. Crear transacción 3DS en Wompi
      const wompiTransaction = await this.create3DSTransaction({
        token: paymentRequest.cardToken,
        customerEmail: paymentRequest.customerEmail,
        acceptanceToken: paymentRequest.acceptanceToken,
        amountInCents: paymentRequest.amountInCents,
        currency: paymentRequest.currency,
        reference: paymentRequest.reference,
        browserInfo: paymentRequest.browserInfo,
        threeDsAuthType: paymentRequest.threeDsAuthType
      });

      // 3. Procesar respuesta y determinar siguiente acción
      const processedResponse = this.process3DSTransactionResponse(wompiTransaction);

      // 4. Guardar en nuestra base de datos
      const payment = await this.savePayment3DSToDatabase({
        businessSubscriptionId: paymentRequest.businessSubscriptionId,
        amount: paymentRequest.amountInCents / 100,
        currency: paymentRequest.currency,
        status: wompiTransaction.status,
        transactionId: wompiTransaction.id,
        reference: paymentRequest.reference,
        dueDate: paymentRequest.dueDate,
        browserInfo: paymentRequest.browserInfo,
        threeDsAuthType: wompiTransaction.payment_method?.extra?.three_ds_auth_type,
        threeDsMethodData: wompiTransaction.payment_method?.extra?.three_ds_auth?.three_ds_method_data,
        currentStep: wompiTransaction.payment_method?.extra?.three_ds_auth?.current_step,
        currentStepStatus: wompiTransaction.payment_method?.extra?.three_ds_auth?.current_step_status,
        threeDsAuthData: wompiTransaction.payment_method?.extra?.three_ds_auth,
        providerResponse: wompiTransaction,
        autoRenewalEnabled: paymentRequest.autoRenewalEnabled
      });

      return {
        success: true,
        payment: payment,
        wompiTransaction: wompiTransaction,
        processedResponse: processedResponse,
        nextAction: processedResponse.requiresAction ? 'render_challenge' : 'complete'
      };

    } catch (error) {
      console.error('❌ Error en flujo completo 3DS:', error.message);
      throw new Error(`Error en proceso 3DS: ${error.message}`);
    }
  }

  /**
   * Crear una transacción recurrente usando 3RI
   * @param {Object} transactionData - Datos de la transacción
   * @returns {Object} Transacción creada
   */
  async createRecurringTransaction(transactionData) {
    try {
      console.log('🔄 Creando transacción recurrente con 3RI:', transactionData.reference);

      const response = await axios.post(`${this.baseURL}/transactions`, {
        amount_in_cents: transactionData.amountInCents,
        currency: transactionData.currency,
        customer_email: transactionData.customerEmail,
        payment_method: {
          type: 'CARD',
          installments: 1,
          token: transactionData.paymentSourceId
        },
        reference: transactionData.reference,
        customer_data: {
          phone_number: transactionData.customerPhone || '',
          full_name: transactionData.customerName || ''
        }
      }, {
        headers: {
          'Authorization': `Bearer ${this.privateKey}`,
          'Content-Type': 'application/json'
        }
      });

      const transaction = response.data.data;
      
      console.log('✅ Transacción recurrente creada:', {
        id: transaction.id,
        status: transaction.status,
        reference: transaction.reference
      });

      return transaction;

    } catch (error) {
      console.error('❌ Error en transacción recurrente:', error.response?.data || error.message);
      throw new Error(`Error en transacción recurrente: ${error.response?.data?.error?.reason || error.message}`);
    }
  }

  /**
   * Registrar método de pago durante TRIAL (sin cobrar)
   * @param {string} businessId - ID del negocio
   * @param {Object} paymentData - Datos de la tarjeta
   * @returns {Object} Registro de pago con token para futuros cobros
   */
  async registerTrialPaymentMethod(businessId, paymentData) {
    try {
      console.log('💳 Registrando método de pago para TRIAL:', businessId);

      // 1. Crear fuente de pago segura con 3DS
      const paymentSource = await this.createSecurePaymentSource(paymentData);

      // 2. Crear registro en la base de datos
      const subscriptionPayment = await SubscriptionPayment.create({
        businessSubscriptionId: paymentData.businessSubscriptionId,
        amount: 0, // Sin cobro durante TRIAL
        currency: 'COP',
        status: 'THREEDS_PENDING',
        paymentMethod: 'WOMPI_3DS',
        paymentSourceToken: paymentSource.token,
        isThreeDsEnabled: true,
        threeDsAuthData: paymentSource.extra || {},
        recurringType: 'INITIAL',
        autoRenewalEnabled: true,
        description: 'Registro de método de pago para período de prueba',
        metadata: {
          paymentSourceId: paymentSource.id,
          wompiPublicData: paymentSource.public_data
        }
      });

      console.log('✅ Método de pago registrado para TRIAL:', subscriptionPayment.id);

      return {
        subscriptionPayment,
        paymentSource,
        requires3DSAuth: paymentSource.status === 'PENDING' && paymentSource.extra?.is_three_ds
      };

    } catch (error) {
      console.error('❌ Error registrando método de pago TRIAL:', error);
      throw error;
    }
  }

  /**
   * Procesar cobro automático al finalizar TRIAL
   * @param {string} businessId - ID del negocio
   * @param {number} amount - Monto a cobrar
   * @returns {Object} Resultado del cobro
   */
  async processTrialToActivePayment(businessId, amount) {
    try {
      console.log('💰 Procesando cobro TRIAL → ACTIVE:', businessId, amount);

      // 1. Buscar el método de pago registrado durante TRIAL
      const business = await Business.findByPk(businessId, {
        include: [{
          model: BusinessSubscription,
          as: 'subscriptions',
          include: [{
            model: SubscriptionPayment,
            as: 'payments',
            where: {
              recurringType: 'INITIAL',
              autoRenewalEnabled: true,
              paymentSourceToken: { [Op.ne]: null }
            },
            order: [['createdAt', 'DESC']],
            limit: 1
          }]
        }]
      });

      if (!business?.subscriptions?.[0]?.payments?.[0]) {
        throw new Error('No se encontró método de pago registrado para el negocio');
      }

      const initialPayment = business.subscriptions[0].payments[0];
      
      if (!initialPayment.paymentSourceToken) {
        throw new Error('Token de pago no disponible');
      }

      // 2. Crear nueva transacción recurrente
      const transaction = await this.createRecurringTransaction({
        paymentSourceId: initialPayment.paymentSourceToken,
        amountInCents: Math.round(amount * 100),
        currency: 'COP',
        customerEmail: business.email,
        reference: `renewal_${businessId}_${Date.now()}`,
        customerPhone: business.phone,
        customerName: business.name
      });

      // 3. Crear registro del pago recurrente
      const recurringPayment = await SubscriptionPayment.create({
        businessSubscriptionId: business.subscriptions[0].id,
        amount: amount,
        currency: 'COP',
        status: transaction.status === 'APPROVED' ? 'COMPLETED' : 'PENDING',
        paymentMethod: 'WOMPI_3RI',
        transactionId: transaction.id,
        paymentSourceToken: initialPayment.paymentSourceToken,
        isThreeDsEnabled: true,
        isRecurringPayment: true,
        originalPaymentId: initialPayment.id,
        recurringType: 'RECURRING',
        autoRenewalEnabled: true,
        paidAt: transaction.status === 'APPROVED' ? new Date() : null,
        description: 'Pago automático de renovación de suscripción',
        providerResponse: transaction,
        metadata: {
          wompiTransactionId: transaction.id,
          originalTrialPaymentId: initialPayment.id
        }
      });

      console.log('✅ Cobro TRIAL → ACTIVE procesado:', {
        paymentId: recurringPayment.id,
        status: recurringPayment.status,
        amount: amount
      });

      return {
        success: transaction.status === 'APPROVED',
        payment: recurringPayment,
        transaction: transaction
      };

    } catch (error) {
      console.error('❌ Error en cobro TRIAL → ACTIVE:', error);
      throw error;
    }
  }

  /**
   * Verificar el estado de un pago y actualizar la base de datos
   * @param {string} subscriptionPaymentId - ID del pago en nuestra DB
   * @returns {Object} Estado actualizado del pago
   */
  async verifyAndUpdatePaymentStatus(subscriptionPaymentId) {
    try {
      const payment = await SubscriptionPayment.findByPk(subscriptionPaymentId);
      
      if (!payment || !payment.transactionId) {
        throw new Error('Pago no encontrado o sin ID de transacción');
      }

      // Consultar estado en Wompi
      const response = await axios.get(`${this.baseURL}/transactions/${payment.transactionId}`, {
        headers: {
          'Authorization': `Bearer ${this.publicKey}`
        }
      });

      const transaction = response.data.data;
      
      // Mapear estados de Wompi a nuestros estados
      const statusMapping = {
        'APPROVED': 'COMPLETED',
        'DECLINED': 'FAILED',
        'PENDING': 'PENDING',
        'ERROR': 'ERROR',
        'VOIDED': 'CANCELLED'
      };

      const newStatus = statusMapping[transaction.status] || 'PENDING';
      
      // Actualizar el pago si el estado cambió
      if (payment.status !== newStatus) {
        await payment.update({
          status: newStatus,
          paidAt: transaction.status === 'APPROVED' ? new Date() : null,
          failureReason: transaction.status === 'DECLINED' ? transaction.status_message : null,
          providerResponse: transaction
        });

        console.log('🔄 Estado de pago actualizado:', {
          paymentId: subscriptionPaymentId,
          oldStatus: payment.status,
          newStatus: newStatus
        });
      }

      return payment.reload();

    } catch (error) {
      console.error('❌ Error verificando estado de pago:', error);
      throw error;
    }
  }
}

module.exports = Wompi3DSService;