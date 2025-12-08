/**
 * BusinessWompiPaymentConfigController.js
 * 
 * Controlador para la configuración de pagos Wompi de cada Business.
 * Permite a los negocios configurar sus credenciales de Wompi para recibir
 * pagos de turnos online de sus clientes.
 * 
 * IMPORTANTE: Este sistema está COMPLETAMENTE SEPARADO del sistema de
 * suscripciones de Beauty Control. Cada Business configura sus propias
 * credenciales para recibir pagos directamente en su cuenta de Wompi.
 */

const { BusinessWompiPaymentConfig, Business } = require('../models')
const BusinessWompiPaymentService = require('../services/BusinessWompiPaymentService')
const logger = require('../utils/logger')

class BusinessWompiPaymentConfigController {
  /**
   * GET /api/business/:businessId/wompi-config
   * Obtener la configuración de Wompi del negocio
   */
  static async getConfig(req, res) {
    try {
      const { businessId } = req.params
      const userId = req.user.id

      // Verificar que el usuario tenga acceso a este negocio
      const business = await Business.findByPk(businessId)
      if (!business) {
        return res.status(404).json({
          success: false,
          error: 'Negocio no encontrado'
        })
      }

      // Verificar que el usuario sea el dueño del negocio o admin
      if (business.userId !== userId && req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'No tienes permiso para acceder a esta configuración'
        })
      }

      // Buscar configuración existente
      let config = await BusinessWompiPaymentConfig.findOne({
        where: { businessId }
      })

      if (!config) {
        // Si no existe, devolver estructura vacía
        return res.status(200).json({
          success: true,
          data: {
            exists: false,
            businessId,
            isTestMode: true,
            isActive: false,
            webhookUrl: BusinessWompiPaymentService.generateWebhookUrl(businessId),
            hasTestCredentials: false,
            hasProdCredentials: false,
            verificationStatus: 'pending',
            lastVerifiedAt: null
          }
        })
      }

      // Desencriptar credenciales para mostrar (solo las públicas completas)
      const decryptedConfig = await BusinessWompiPaymentService.decryptCredentials(config)

      // Preparar respuesta (NO enviar claves privadas completas)
      const responseData = {
        exists: true,
        businessId: config.businessId,
        isTestMode: config.isTestMode,
        isActive: config.isActive,
        webhookUrl: config.webhookUrl,
        verificationStatus: config.verificationStatus,
        verificationError: config.verificationError,
        lastVerifiedAt: config.lastVerifiedAt,
        
        // Credenciales de TEST (públicas completas, privadas parciales)
        hasTestCredentials: !!(decryptedConfig.testPublicKey && decryptedConfig.testPrivateKey),
        testPublicKey: decryptedConfig.testPublicKey || '',
        testPrivateKeyPreview: decryptedConfig.testPrivateKey 
          ? `${decryptedConfig.testPrivateKey.substring(0, 15)}...` 
          : '',
        testIntegritySecretPreview: decryptedConfig.testIntegritySecret
          ? `${decryptedConfig.testIntegritySecret.substring(0, 10)}...`
          : '',
        
        // Credenciales de PRODUCCIÓN (públicas completas, privadas parciales)
        hasProdCredentials: !!(decryptedConfig.prodPublicKey && decryptedConfig.prodPrivateKey),
        prodPublicKey: decryptedConfig.prodPublicKey || '',
        prodPrivateKeyPreview: decryptedConfig.prodPrivateKey
          ? `${decryptedConfig.prodPrivateKey.substring(0, 15)}...`
          : '',
        prodIntegritySecretPreview: decryptedConfig.prodIntegritySecret
          ? `${decryptedConfig.prodIntegritySecret.substring(0, 10)}...`
          : '',

        createdAt: config.createdAt,
        updatedAt: config.updatedAt
      }

      return res.status(200).json({
        success: true,
        data: responseData
      })

    } catch (error) {
      logger.error('Error al obtener configuración de Wompi:', error)
      return res.status(500).json({
        success: false,
        error: 'Error al obtener la configuración de Wompi'
      })
    }
  }

  /**
   * POST /api/business/:businessId/wompi-config
   * Guardar o actualizar la configuración de Wompi del negocio
   */
  static async saveConfig(req, res) {
    try {
      const { businessId } = req.params
      const userId = req.user.id
      const {
        testPublicKey,
        testPrivateKey,
        testIntegritySecret,
        prodPublicKey,
        prodPrivateKey,
        prodIntegritySecret,
        isTestMode
      } = req.body

      // Verificar que el usuario tenga acceso a este negocio
      const business = await Business.findByPk(businessId)
      if (!business) {
        return res.status(404).json({
          success: false,
          error: 'Negocio no encontrado'
        })
      }

      if (business.userId !== userId && req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'No tienes permiso para modificar esta configuración'
        })
      }

      // Validar que al menos tenga credenciales de test
      if (!testPublicKey || !testPrivateKey || !testIntegritySecret) {
        return res.status(400).json({
          success: false,
          error: 'Las credenciales de prueba (test) son obligatorias'
        })
      }

      // Validar formato de las claves
      const validationErrors = []

      if (testPublicKey && !BusinessWompiPaymentService.isValidPublicKey(testPublicKey)) {
        validationErrors.push('La clave pública de prueba no tiene un formato válido')
      }
      if (testPrivateKey && !BusinessWompiPaymentService.isValidPrivateKey(testPrivateKey)) {
        validationErrors.push('La clave privada de prueba no tiene un formato válido')
      }
      if (prodPublicKey && !BusinessWompiPaymentService.isValidPublicKey(prodPublicKey)) {
        validationErrors.push('La clave pública de producción no tiene un formato válido')
      }
      if (prodPrivateKey && !BusinessWompiPaymentService.isValidPrivateKey(prodPrivateKey)) {
        validationErrors.push('La clave privada de producción no tiene un formato válido')
      }

      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Errores de validación',
          errors: validationErrors
        })
      }

      // Encriptar credenciales
      const encryptedCredentials = await BusinessWompiPaymentService.encryptCredentials({
        testPublicKey,
        testPrivateKey,
        testIntegritySecret,
        prodPublicKey,
        prodPrivateKey,
        prodIntegritySecret
      })

      // Generar URL de webhook
      const webhookUrl = BusinessWompiPaymentService.generateWebhookUrl(businessId)

      // Buscar configuración existente
      let config = await BusinessWompiPaymentConfig.findOne({
        where: { businessId }
      })

      if (config) {
        // Actualizar configuración existente
        await config.update({
          ...encryptedCredentials,
          isTestMode: isTestMode !== undefined ? isTestMode : config.isTestMode,
          webhookUrl,
          verificationStatus: 'pending', // Reset verification status
          verificationError: null,
          lastVerifiedAt: null
        })
      } else {
        // Crear nueva configuración
        config = await BusinessWompiPaymentConfig.create({
          businessId,
          ...encryptedCredentials,
          isTestMode: isTestMode !== undefined ? isTestMode : true,
          isActive: false, // Por defecto inactivo hasta verificar
          webhookUrl,
          verificationStatus: 'pending'
        })
      }

      logger.info(`Configuración de Wompi guardada para business ${businessId}`)

      return res.status(200).json({
        success: true,
        message: 'Configuración guardada exitosamente',
        data: {
          id: config.id,
          webhookUrl: config.webhookUrl,
          verificationStatus: config.verificationStatus
        }
      })

    } catch (error) {
      logger.error('Error al guardar configuración de Wompi:', error)
      return res.status(500).json({
        success: false,
        error: 'Error al guardar la configuración de Wompi'
      })
    }
  }

  /**
   * POST /api/business/:businessId/wompi-config/verify
   * Verificar las credenciales de Wompi haciendo una llamada real a la API
   */
  static async verifyCredentials(req, res) {
    try {
      const { businessId } = req.params
      const userId = req.user.id

      // Verificar acceso
      const business = await Business.findByPk(businessId)
      if (!business) {
        return res.status(404).json({
          success: false,
          error: 'Negocio no encontrado'
        })
      }

      if (business.userId !== userId && req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'No tienes permiso para verificar esta configuración'
        })
      }

      // Buscar configuración
      const config = await BusinessWompiPaymentConfig.findOne({
        where: { businessId }
      })

      if (!config) {
        return res.status(404).json({
          success: false,
          error: 'No existe configuración de Wompi para este negocio'
        })
      }

      // Verificar credenciales según el modo activo
      const verificationResult = await BusinessWompiPaymentService.verifyCredentials(config)

      // Actualizar estado de verificación
      await config.update({
        verificationStatus: verificationResult.valid ? 'verified' : 'failed',
        verificationError: verificationResult.error || null,
        lastVerifiedAt: new Date()
      })

      if (verificationResult.valid) {
        logger.info(`Credenciales de Wompi verificadas para business ${businessId}`)
        return res.status(200).json({
          success: true,
          message: 'Credenciales verificadas exitosamente',
          data: {
            verified: true,
            mode: config.isTestMode ? 'test' : 'production'
          }
        })
      } else {
        logger.warn(`Verificación de credenciales de Wompi falló para business ${businessId}: ${verificationResult.error}`)
        return res.status(400).json({
          success: false,
          error: verificationResult.error,
          data: {
            verified: false,
            mode: config.isTestMode ? 'test' : 'production'
          }
        })
      }

    } catch (error) {
      logger.error('Error al verificar credenciales de Wompi:', error)
      return res.status(500).json({
        success: false,
        error: 'Error al verificar las credenciales de Wompi'
      })
    }
  }

  /**
   * PATCH /api/business/:businessId/wompi-config/toggle-mode
   * Cambiar entre modo test y producción
   */
  static async toggleMode(req, res) {
    try {
      const { businessId } = req.params
      const userId = req.user.id
      const { isTestMode } = req.body

      if (isTestMode === undefined) {
        return res.status(400).json({
          success: false,
          error: 'El campo isTestMode es requerido'
        })
      }

      // Verificar acceso
      const business = await Business.findByPk(businessId)
      if (!business) {
        return res.status(404).json({
          success: false,
          error: 'Negocio no encontrado'
        })
      }

      if (business.userId !== userId && req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'No tienes permiso para modificar esta configuración'
        })
      }

      // Buscar configuración
      const config = await BusinessWompiPaymentConfig.findOne({
        where: { businessId }
      })

      if (!config) {
        return res.status(404).json({
          success: false,
          error: 'No existe configuración de Wompi para este negocio'
        })
      }

      // Si está cambiando a producción, verificar que tenga credenciales de producción
      if (!isTestMode) {
        if (!config.prodPublicKey || !config.prodPrivateKeyEncrypted) {
          return res.status(400).json({
            success: false,
            error: 'No se puede cambiar a modo producción sin configurar credenciales de producción'
          })
        }
      }

      // Actualizar modo
      await config.update({
        isTestMode,
        verificationStatus: 'pending', // Reset verification al cambiar de modo
        verificationError: null
      })

      logger.info(`Modo de Wompi cambiado a ${isTestMode ? 'TEST' : 'PRODUCCIÓN'} para business ${businessId}`)

      return res.status(200).json({
        success: true,
        message: `Modo cambiado a ${isTestMode ? 'prueba' : 'producción'} exitosamente`,
        data: {
          isTestMode: config.isTestMode,
          verificationStatus: config.verificationStatus
        }
      })

    } catch (error) {
      logger.error('Error al cambiar modo de Wompi:', error)
      return res.status(500).json({
        success: false,
        error: 'Error al cambiar el modo de Wompi'
      })
    }
  }

  /**
   * PATCH /api/business/:businessId/wompi-config/toggle-status
   * Activar o desactivar la configuración de Wompi
   */
  static async toggleStatus(req, res) {
    try {
      const { businessId } = req.params
      const userId = req.user.id
      const { isActive } = req.body

      if (isActive === undefined) {
        return res.status(400).json({
          success: false,
          error: 'El campo isActive es requerido'
        })
      }

      // Verificar acceso
      const business = await Business.findByPk(businessId)
      if (!business) {
        return res.status(404).json({
          success: false,
          error: 'Negocio no encontrado'
        })
      }

      if (business.userId !== userId && req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'No tienes permiso para modificar esta configuración'
        })
      }

      // Buscar configuración
      const config = await BusinessWompiPaymentConfig.findOne({
        where: { businessId }
      })

      if (!config) {
        return res.status(404).json({
          success: false,
          error: 'No existe configuración de Wompi para este negocio'
        })
      }

      // Si está activando, verificar que las credenciales estén verificadas
      if (isActive && config.verificationStatus !== 'verified') {
        return res.status(400).json({
          success: false,
          error: 'No se puede activar sin verificar las credenciales primero'
        })
      }

      // Actualizar estado
      await config.update({ isActive })

      logger.info(`Configuración de Wompi ${isActive ? 'activada' : 'desactivada'} para business ${businessId}`)

      return res.status(200).json({
        success: true,
        message: `Configuración ${isActive ? 'activada' : 'desactivada'} exitosamente`,
        data: {
          isActive: config.isActive
        }
      })

    } catch (error) {
      logger.error('Error al cambiar estado de Wompi:', error)
      return res.status(500).json({
        success: false,
        error: 'Error al cambiar el estado de la configuración'
      })
    }
  }
}

module.exports = BusinessWompiPaymentConfigController
