/**
 * businessWompiPaymentWebhookController.js
 * 
 * Controlador de webhooks de Wompi para pagos de turnos online.
 * 
 * IMPORTANTE: Este webhook es COMPLETAMENTE SEPARADO del webhook de suscripciones
 * de Beauty Control. Este webhook recibe notificaciones de pagos de turnos que
 * los clientes hacen a los negocios.
 * 
 * Endpoint: POST /api/webhooks/wompi/payments/:businessId
 * 
 * Wompi enviará notificaciones cuando:
 * - Un pago es aprobado
 * - Un pago es rechazado
 * - Un pago es cancelado
 * - Cualquier cambio en el estado de una transacción
 */

const { BusinessWompiPaymentConfig } = require('../models')
const BusinessWompiPaymentService = require('../services/BusinessWompiPaymentService')
const logger = require('../utils/logger')

class BusinessWompiPaymentWebhookController {
  /**
   * POST /api/webhooks/wompi/payments/:businessId
   * Recibir notificaciones de Wompi sobre pagos de turnos
   */
  static async handlePaymentWebhook(req, res) {
    try {
      const { businessId } = req.params
      const webhookData = req.body
      const signature = req.headers['x-wompi-signature'] || req.headers['wompi-signature']

      logger.info(`Webhook de Wompi recibido para business ${businessId}`)
      logger.debug('Webhook data:', JSON.stringify(webhookData, null, 2))

      // Buscar configuración del negocio
      const config = await BusinessWompiPaymentConfig.findOne({
        where: { businessId }
      })

      if (!config) {
        logger.error(`No existe configuración de Wompi para business ${businessId}`)
        return res.status(404).json({
          success: false,
          error: 'Configuración de Wompi no encontrada'
        })
      }

      // Validar que la configuración esté activa
      if (!config.isActive) {
        logger.warn(`Webhook recibido pero la configuración de Wompi está inactiva para business ${businessId}`)
        return res.status(400).json({
          success: false,
          error: 'Configuración de Wompi inactiva'
        })
      }

      // Validar firma del webhook
      const isValidSignature = await BusinessWompiPaymentService.validateWebhookSignature(
        config,
        webhookData,
        signature
      )

      if (!isValidSignature) {
        logger.error(`Firma de webhook inválida para business ${businessId}`)
        return res.status(401).json({
          success: false,
          error: 'Firma de webhook inválida'
        })
      }

      // Extraer información del evento
      const { event, data } = webhookData

      if (!event || !data) {
        logger.error('Webhook sin estructura válida (falta event o data)')
        return res.status(400).json({
          success: false,
          error: 'Estructura de webhook inválida'
        })
      }

      // Procesar según el tipo de evento
      switch (event) {
        case 'transaction.updated':
          await this._handleTransactionUpdated(businessId, data)
          break

        case 'transaction.created':
          await this._handleTransactionCreated(businessId, data)
          break

        default:
          logger.warn(`Evento de webhook no manejado: ${event}`)
      }

      // Wompi espera una respuesta 200 para confirmar recepción
      return res.status(200).json({
        success: true,
        message: 'Webhook procesado exitosamente'
      })

    } catch (error) {
      logger.error('Error al procesar webhook de Wompi:', error)
      // Devolver 200 de todas formas para que Wompi no reintente
      return res.status(200).json({
        success: false,
        error: 'Error al procesar webhook'
      })
    }
  }

  /**
   * Manejar evento de transacción actualizada
   * Aquí es donde se confirman los pagos
   */
  static async _handleTransactionUpdated(businessId, transactionData) {
    try {
      const { transaction } = transactionData

      if (!transaction) {
        logger.error('Transaction data vacío en webhook')
        return
      }

      const {
        id: transactionId,
        status,
        reference,
        amount_in_cents,
        currency,
        payment_method_type,
        customer_email
      } = transaction

      logger.info(`Transacción actualizada para business ${businessId}:`, {
        transactionId,
        status,
        reference,
        amount: amount_in_cents / 100
      })

      // TODO: Aquí implementar la lógica de negocio según el estado
      switch (status) {
        case 'APPROVED':
          logger.info(`✅ Pago APROBADO - Business: ${businessId}, Reference: ${reference}, Amount: ${amount_in_cents / 100}`)
          // TODO: Actualizar el turno como pagado
          // TODO: Enviar notificación al cliente y al negocio
          // TODO: Registrar el pago en la base de datos
          break

        case 'DECLINED':
          logger.warn(`❌ Pago RECHAZADO - Business: ${businessId}, Reference: ${reference}`)
          // TODO: Notificar al cliente que el pago fue rechazado
          // TODO: Mantener el turno como pendiente de pago
          break

        case 'ERROR':
          logger.error(`⚠️  Pago con ERROR - Business: ${businessId}, Reference: ${reference}`)
          // TODO: Notificar al cliente del error
          break

        case 'VOIDED':
          logger.warn(`🚫 Pago ANULADO - Business: ${businessId}, Reference: ${reference}`)
          // TODO: Revertir el estado del turno si estaba confirmado
          break

        default:
          logger.info(`ℹ️  Estado de pago: ${status} - Business: ${businessId}, Reference: ${reference}`)
      }

    } catch (error) {
      logger.error('Error al manejar transacción actualizada:', error)
    }
  }

  /**
   * Manejar evento de transacción creada
   * Se dispara cuando se inicia un pago
   */
  static async _handleTransactionCreated(businessId, transactionData) {
    try {
      const { transaction } = transactionData

      if (!transaction) {
        logger.error('Transaction data vacío en webhook')
        return
      }

      const {
        id: transactionId,
        reference,
        amount_in_cents,
        customer_email
      } = transaction

      logger.info(`Transacción creada para business ${businessId}:`, {
        transactionId,
        reference,
        amount: amount_in_cents / 100,
        customer: customer_email
      })

      // TODO: Registrar que se inició el proceso de pago
      // TODO: Opcional: Enviar notificación de que se está procesando el pago

    } catch (error) {
      logger.error('Error al manejar transacción creada:', error)
    }
  }
}

module.exports = BusinessWompiPaymentWebhookController
