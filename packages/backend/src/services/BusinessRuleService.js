/**
 * 📋 BUSINESS RULE SERVICE
 * 
 * Servicio para validar y aplicar reglas de negocio configuradas
 * Soporta validaciones personalizadas antes de completar citas
 */

const { BusinessRule, RuleTemplate, Service, Appointment, ConsentSignature } = require('../models');
const { Op } = require('sequelize');

class BusinessRuleService {
  /**
   * Códigos de reglas estándar del sistema
   */
  static RULE_CODES = {
    // Reglas de consentimiento
    REQUIRE_CONSENT_FOR_COMPLETION: 'REQUIRE_CONSENT_FOR_COMPLETION',
    
    // Reglas de evidencia
    REQUIRE_BEFORE_PHOTO: 'REQUIRE_BEFORE_PHOTO',
    REQUIRE_AFTER_PHOTO: 'REQUIRE_AFTER_PHOTO',
    REQUIRE_BOTH_PHOTOS: 'REQUIRE_BOTH_PHOTOS',
    
    // Reglas de pago
    REQUIRE_FULL_PAYMENT: 'REQUIRE_FULL_PAYMENT',
    REQUIRE_MINIMUM_PAYMENT: 'REQUIRE_MINIMUM_PAYMENT',
    
    // Reglas de tiempo
    MINIMUM_DURATION: 'MINIMUM_DURATION',
    MAXIMUM_DURATION: 'MAXIMUM_DURATION',
    
    // Reglas de cliente
    REQUIRE_CLIENT_SIGNATURE: 'REQUIRE_CLIENT_SIGNATURE',
    REQUIRE_CLIENT_FEEDBACK: 'REQUIRE_CLIENT_FEEDBACK'
  };

  /**
   * Validar si una cita puede ser completada según las reglas del negocio
   * @param {UUID} appointmentId - ID de la cita
   * @param {UUID} businessId - ID del negocio
   * @returns {Object} { canComplete: boolean, errors: [], warnings: [] }
   */
  static async validateAppointmentCompletion(appointmentId, businessId) {
    try {
      const errors = [];
      const warnings = [];

      // 1. Obtener la cita con toda la información necesaria
      const appointment = await Appointment.findOne({
        where: { id: appointmentId, businessId },
        include: [
          {
            model: Service,
            attributes: ['id', 'name', 'requiresConsent', 'consentTemplateId']
          }
        ]
      });

      if (!appointment) {
        return {
          canComplete: false,
          errors: ['Cita no encontrada'],
          warnings: []
        };
      }

      // 2. Validar estado de la cita
      if (!['IN_PROGRESS', 'CONFIRMED'].includes(appointment.status)) {
        errors.push(`No se puede completar una cita en estado ${appointment.status}`);
      }

      // 3. Obtener reglas activas del negocio
      const businessRules = await this.getActiveRules(businessId);

      // 4. Validar consentimiento si el servicio lo requiere
      if (appointment.Service.requiresConsent) {
        const consentValid = await this.validateConsent(appointment);
        if (!consentValid.valid) {
          errors.push(...consentValid.errors);
        }
      }

      // 5. Validar regla de consentimiento obligatorio
      const requireConsentRule = businessRules.find(
        r => r.ruleCode === this.RULE_CODES.REQUIRE_CONSENT_FOR_COMPLETION
      );
      
      if (requireConsentRule && requireConsentRule.isActive) {
        if (!appointment.hasConsent || !appointment.consentSignedAt) {
          errors.push('Esta cita requiere consentimiento firmado antes de completarse');
        }
      }

      // 6. Validar evidencia fotográfica
      const photoRules = await this.validatePhotoEvidence(appointment, businessRules);
      if (photoRules.errors.length > 0) {
        errors.push(...photoRules.errors);
      }
      if (photoRules.warnings.length > 0) {
        warnings.push(...photoRules.warnings);
      }

      // 7. Validar pago
      const paymentRules = await this.validatePayment(appointment, businessRules);
      if (paymentRules.errors.length > 0) {
        errors.push(...paymentRules.errors);
      }
      if (paymentRules.warnings.length > 0) {
        warnings.push(...paymentRules.warnings);
      }

      // 8. Validar duración de la cita
      const durationRules = await this.validateDuration(appointment, businessRules);
      if (durationRules.errors.length > 0) {
        errors.push(...durationRules.errors);
      }
      if (durationRules.warnings.length > 0) {
        warnings.push(...durationRules.warnings);
      }

      return {
        canComplete: errors.length === 0,
        errors,
        warnings
      };

    } catch (error) {
      console.error('Error validando reglas de negocio:', error);
      throw error;
    }
  }

  /**
   * Obtener reglas activas de un negocio
   * @param {UUID} businessId
   * @returns {Array} reglas activas
   */
  static async getActiveRules(businessId) {
    try {
      const rules = await BusinessRule.findAll({
        where: {
          businessId,
          isActive: true
        },
        include: [
          {
            association: 'template',
            attributes: ['id', 'key', 'description', 'category', 'defaultValue', 'type']
          }
        ]
      });

      return rules.map(rule => ({
        id: rule.id,
        ruleCode: rule.template?.key,
        ruleName: rule.template?.description,
        category: rule.template?.category,
        value: rule.customValue || rule.template?.defaultValue,
        valueType: rule.template?.type,
        isActive: rule.isActive
      }));

    } catch (error) {
      console.error('Error obteniendo reglas del negocio:', error);
      return [];
    }
  }

  /**
   * Obtener el valor de una regla específica para un negocio
   * @param {UUID} businessId - ID del negocio
   * @param {string} ruleKey - Key de la regla (ej: 'RESERVAS_ONLINE_HABILITADAS')
   * @returns {any} El valor de la regla (customValue o defaultValue)
   */
  static async getRuleValue(businessId, ruleKey) {
    try {
      // Buscar la regla del negocio
      const businessRule = await BusinessRule.findOne({
        where: {
          businessId,
          isActive: true
        },
        include: [
          {
            model: RuleTemplate,
            as: 'template',
            where: {
              key: ruleKey
            },
            attributes: ['id', 'key', 'defaultValue', 'type']
          }
        ]
      });

      // Si el negocio tiene la regla configurada, usar su valor personalizado
      if (businessRule && businessRule.customValue !== null && businessRule.customValue !== undefined) {
        return businessRule.customValue;
      }

      // Si no tiene regla personalizada, buscar el template y usar el valor por defecto
      if (businessRule && businessRule.template) {
        return businessRule.template.defaultValue;
      }

      // Si el negocio no tiene la regla asignada, buscar el template para obtener el default
      const ruleTemplate = await RuleTemplate.findOne({
        where: { key: ruleKey },
        attributes: ['defaultValue']
      });

      if (ruleTemplate) {
        return ruleTemplate.defaultValue;
      }

      // Si no existe la regla, retornar null
      console.warn(`Regla '${ruleKey}' no encontrada para negocio ${businessId}`);
      return null;

    } catch (error) {
      console.error(`Error obteniendo valor de regla '${ruleKey}':`, error);
      return null;
    }
  }

  /**
   * Validar consentimiento de la cita
   * @param {Appointment} appointment
   * @returns {Object} { valid: boolean, errors: [] }
   */
  static async validateConsent(appointment) {
    const errors = [];

    try {
      // Si no tiene consentimiento marcado
      if (!appointment.hasConsent) {
        errors.push('Esta cita requiere consentimiento informado firmado');
        return { valid: false, errors };
      }

      // Si no tiene fecha de firma
      if (!appointment.consentSignedAt) {
        errors.push('El consentimiento no tiene fecha de firma válida');
        return { valid: false, errors };
      }

      // Verificar que existe el registro de firma en la tabla de consentimientos
      if (appointment.Service.consentTemplateId) {
        const signature = await ConsentSignature.findOne({
          where: {
            businessId: appointment.businessId,
            customerId: appointment.clientId,
            templateId: appointment.Service.consentTemplateId,
            status: 'ACTIVE'
          }
        });

        if (!signature) {
          errors.push('No se encontró la firma del consentimiento en el sistema');
          return { valid: false, errors };
        }

        // Verificar que la firma no esté revocada
        if (signature.status === 'REVOKED') {
          errors.push('El consentimiento firmado ha sido revocado');
          return { valid: false, errors };
        }
      }

      return { valid: true, errors: [] };

    } catch (error) {
      console.error('Error validando consentimiento:', error);
      errors.push('Error al validar consentimiento');
      return { valid: false, errors };
    }
  }

  /**
   * Validar evidencia fotográfica según reglas del negocio
   * @param {Appointment} appointment
   * @param {Array} businessRules
   * @returns {Object} { errors: [], warnings: [] }
   */
  static async validatePhotoEvidence(appointment, businessRules) {
    const errors = [];
    const warnings = [];

    const evidence = appointment.evidence || {};
    const beforePhotos = evidence.before || [];
    const afterPhotos = evidence.after || [];

    // Regla: Requiere fotos antes
    const requireBeforeRule = businessRules.find(
      r => r.ruleCode === this.RULE_CODES.REQUIRE_BEFORE_PHOTO
    );
    if (requireBeforeRule && requireBeforeRule.isActive) {
      if (beforePhotos.length === 0) {
        errors.push('Se requiere al menos una foto "antes" del procedimiento');
      }
    }

    // Regla: Requiere fotos después
    const requireAfterRule = businessRules.find(
      r => r.ruleCode === this.RULE_CODES.REQUIRE_AFTER_PHOTO
    );
    if (requireAfterRule && requireAfterRule.isActive) {
      if (afterPhotos.length === 0) {
        errors.push('Se requiere al menos una foto "después" del procedimiento');
      }
    }

    // Regla: Requiere ambas fotos
    const requireBothRule = businessRules.find(
      r => r.ruleCode === this.RULE_CODES.REQUIRE_BOTH_PHOTOS
    );
    if (requireBothRule && requireBothRule.isActive) {
      if (beforePhotos.length === 0) {
        errors.push('Se requiere foto "antes" del procedimiento');
      }
      if (afterPhotos.length === 0) {
        errors.push('Se requiere foto "después" del procedimiento');
      }
    }

    // Warning si no hay evidencia fotográfica (pero no es obligatoria)
    if (beforePhotos.length === 0 && afterPhotos.length === 0) {
      const hasPhotoRules = [requireBeforeRule, requireAfterRule, requireBothRule].some(
        r => r && r.isActive
      );
      if (!hasPhotoRules) {
        warnings.push('Se recomienda subir evidencia fotográfica del procedimiento');
      }
    }

    return { errors, warnings };
  }

  /**
   * Validar estado de pago según reglas del negocio
   * @param {Appointment} appointment
   * @param {Array} businessRules
   * @returns {Object} { errors: [], warnings: [] }
   */
  static async validatePayment(appointment, businessRules) {
    const errors = [];
    const warnings = [];

    const totalAmount = parseFloat(appointment.totalAmount || 0);
    const paidAmount = parseFloat(appointment.paidAmount || 0);
    const pendingAmount = totalAmount - paidAmount;

    // Regla: Requiere pago completo
    const requireFullPaymentRule = businessRules.find(
      r => r.ruleCode === this.RULE_CODES.REQUIRE_FULL_PAYMENT
    );
    if (requireFullPaymentRule && requireFullPaymentRule.isActive) {
      if (pendingAmount > 0) {
        errors.push(
          `Se requiere pago completo antes de completar la cita. Pendiente: $${pendingAmount.toLocaleString()}`
        );
      }
    }

    // Regla: Requiere pago mínimo (porcentaje)
    const requireMinPaymentRule = businessRules.find(
      r => r.ruleCode === this.RULE_CODES.REQUIRE_MINIMUM_PAYMENT
    );
    if (requireMinPaymentRule && requireMinPaymentRule.isActive) {
      const minPercentage = parseFloat(requireMinPaymentRule.value || 50);
      const minAmount = (totalAmount * minPercentage) / 100;
      
      if (paidAmount < minAmount) {
        errors.push(
          `Se requiere pago mínimo del ${minPercentage}% ($${minAmount.toLocaleString()}). ` +
          `Pagado: $${paidAmount.toLocaleString()}`
        );
      }
    }

    // Warning si hay saldo pendiente (pero no es obligatorio)
    if (pendingAmount > 0 && errors.length === 0) {
      warnings.push(
        `Hay un saldo pendiente de $${pendingAmount.toLocaleString()} (${appointment.paymentStatus})`
      );
    }

    return { errors, warnings };
  }

  /**
   * Validar duración de la cita según reglas del negocio
   * @param {Appointment} appointment
   * @param {Array} businessRules
   * @returns {Object} { errors: [], warnings: [] }
   */
  static async validateDuration(appointment, businessRules) {
    const errors = [];
    const warnings = [];

    // Solo validar si la cita ya está en progreso
    if (!appointment.startedAt) {
      return { errors, warnings };
    }

    const startTime = new Date(appointment.startedAt);
    const now = new Date();
    const durationMinutes = Math.floor((now - startTime) / 60000);

    // Regla: Duración mínima
    const minDurationRule = businessRules.find(
      r => r.ruleCode === this.RULE_CODES.MINIMUM_DURATION
    );
    if (minDurationRule && minDurationRule.isActive) {
      const minMinutes = parseInt(minDurationRule.value || 30);
      if (durationMinutes < minMinutes) {
        warnings.push(
          `La cita ha durado solo ${durationMinutes} minutos (mínimo recomendado: ${minMinutes})`
        );
      }
    }

    // Regla: Duración máxima
    const maxDurationRule = businessRules.find(
      r => r.ruleCode === this.RULE_CODES.MAXIMUM_DURATION
    );
    if (maxDurationRule && maxDurationRule.isActive) {
      const maxMinutes = parseInt(maxDurationRule.value || 240);
      if (durationMinutes > maxMinutes) {
        warnings.push(
          `La cita ha excedido el tiempo máximo (${durationMinutes} min > ${maxMinutes} min)`
        );
      }
    }

    return { errors, warnings };
  }

  /**
   * Validar si se puede actualizar una cita
   * @param {Appointment} appointment
   * @param {Object} updateData
   * @returns {Object} { canUpdate: boolean, errors: [], warnings: [] }
   */
  static async validateAppointmentUpdate(appointment, updateData) {
    const errors = [];
    const warnings = [];

    // No se puede actualizar una cita completada
    if (appointment.status === 'COMPLETED') {
      errors.push('No se puede modificar una cita completada');
    }

    // No se puede actualizar una cita cancelada
    if (appointment.status === 'CANCELED') {
      errors.push('No se puede modificar una cita cancelada');
    }

    // Si se cambia el horario, validar disponibilidad
    if (updateData.startTime || updateData.endTime) {
      const newStartTime = updateData.startTime || appointment.startTime;
      const newEndTime = updateData.endTime || appointment.endTime;

      // Validar que no sea en el pasado
      if (new Date(newStartTime) < new Date()) {
        errors.push('No se puede programar una cita en el pasado');
      }

      // Validar que endTime sea después de startTime
      if (new Date(newEndTime) <= new Date(newStartTime)) {
        errors.push('La hora de fin debe ser posterior a la hora de inicio');
      }
    }

    return {
      canUpdate: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validar si se puede reprogramar una cita
   * @param {Appointment} appointment
   * @param {Date} newStartTime
   * @returns {Object} { canReschedule: boolean, errors: [], warnings: [] }
   */
  static async validateReschedule(appointment, newStartTime) {
    const errors = [];
    const warnings = [];

    // No se puede reprogramar una cita completada
    if (appointment.status === 'COMPLETED') {
      errors.push('No se puede reprogramar una cita completada');
    }

    // No se puede reprogramar una cita cancelada
    if (appointment.status === 'CANCELED') {
      errors.push('No se puede reprogramar una cita cancelada');
    }

    // Validar que la nueva fecha no sea en el pasado
    if (new Date(newStartTime) < new Date()) {
      errors.push('No se puede reprogramar una cita en el pasado');
    }

    // Warning si se reprograma muchas veces
    const rescheduleCount = appointment.rescheduleHistory?.length || 0;
    if (rescheduleCount >= 3) {
      warnings.push(
        `Esta cita ya ha sido reprogramada ${rescheduleCount} veces`
      );
    }

    return {
      canReschedule: errors.length === 0,
      errors,
      warnings
    };
  }
}

module.exports = BusinessRuleService;
