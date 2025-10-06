const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { Business, User, SubscriptionPlan, BusinessSubscription, SubscriptionPayment } = require('../models')
const { v4: uuidv4 } = require('uuid')

/**
 * @swagger
 * components:
 *   schemas:
 *     SubscriptionRequest:
 *       type: object
 *       required:
 *         - planId
 *         - businessData
 *         - userData
 *         - paymentData
 *       properties:
 *         planId:
 *           type: integer
 *           description: ID del plan seleccionado
 *         billingCycle:
 *           type: string
 *           enum: [MONTHLY, ANNUAL]
 *           default: MONTHLY
 *           description: Ciclo de facturación (mensual o anual)
 *         businessData:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             businessCode:
 *               type: string
 *               description: Subdominio del negocio
 *             type:
 *               type: string
 *             phone:
 *               type: string
 *             email:
 *               type: string
 *             address:
 *               type: string
 *             city:
 *               type: string
 *             country:
 *               type: string
 *         userData:
 *           type: object
 *           properties:
 *             firstName:
 *               type: string
 *             lastName:
 *               type: string
 *             email:
 *               type: string
 *             phone:
 *               type: string
 *             password:
 *               type: string
 *         paymentData:
 *           type: object
 *           properties:
 *             transactionId:
 *               type: string
 *             method:
 *               type: string
 *             amount:
 *               type: number
 *             currency:
 *               type: string
 *             status:
 *               type: string
 *         invitationToken:
 *           type: string
 *           description: Token de invitación opcional
 *         acceptedTerms:
 *           type: object
 *           properties:
 *             terms:
 *               type: boolean
 *             privacy:
 *               type: boolean
 *             marketing:
 *               type: boolean
 *     SubscriptionResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *           properties:
 *             business:
 *               $ref: '#/components/schemas/Business'
 *             user:
 *               $ref: '#/components/schemas/User'
 *             subscription:
 *               type: object
 *             transaction:
 *               type: object
 *         message:
 *           type: string
 */

class SubscriptionController {
  /**
   * @swagger
   * /api/subscriptions/create:
   *   post:
   *     summary: Crear nueva suscripción completa
   *     description: Procesa la creación de un nuevo negocio, usuario administrador, suscripción y transacción
   *     tags: [Subscriptions]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/SubscriptionRequest'
   *     responses:
   *       201:
   *         description: Suscripción creada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/SubscriptionResponse'
   *       400:
   *         description: Error en los datos enviados
   *       409:
   *         description: Conflicto - el negocio o email ya existen
   *       500:
   *         description: Error interno del servidor
   */
  static async createSubscription(req, res) {
    const { 
      planId,
      billingCycle = 'MONTHLY', // MONTHLY o ANNUAL - default a MONTHLY 
      businessData, 
      userData, 
      paymentData, 
      invitationToken,
      acceptedTerms 
    } = req.body

    try {
      console.log('Creando nueva suscripción:', {
        planId,
        businessCode: businessData?.businessCode,
        userEmail: userData?.email
      })

      // Validaciones básicas
      if (!planId || !businessData || !userData || !paymentData) {
        return res.status(400).json({
          success: false,
          error: 'Faltan datos requeridos: planId, businessData, userData y paymentData son obligatorios'
        })
      }

      // Verificar que el plan existe
      const plan = await SubscriptionPlan.findByPk(planId)
      if (!plan) {
        return res.status(400).json({
          success: false,
          error: 'Plan no encontrado'
        })
      }

      // Validar billingCycle
      if (!['MONTHLY', 'ANNUAL'].includes(billingCycle)) {
        return res.status(400).json({
          success: false,
          error: 'billingCycle debe ser MONTHLY o ANNUAL'
        })
      }

      // Calcular precio según el ciclo de facturación
      let finalPrice;
      let finalDuration;
      let finalDurationType;

      if (billingCycle === 'ANNUAL') {
        // Usar precio anual si está disponible, sino calcular descuento desde precio mensual
        finalPrice = plan.annualPrice || (plan.monthlyPrice || plan.price);
        finalDuration = 1;
        finalDurationType = 'YEARS';
      } else {
        // MONTHLY - usar monthlyPrice o price como fallback
        finalPrice = plan.monthlyPrice || plan.price;
        finalDuration = plan.duration;
        finalDurationType = plan.durationType;
      }

      console.log('Precio calculado:', {
        billingCycle,
        finalPrice,
        finalDuration,
        finalDurationType,
        planPrice: plan.price,
        planMonthlyPrice: plan.monthlyPrice,
        planAnnualPrice: plan.annualPrice
      });

      // Verificar que el businessCode (subdominio) no existe
      if (businessData.businessCode) {
        const existingBusiness = await Business.findOne({
          where: { subdomain: businessData.businessCode }
        })
        if (existingBusiness) {
          return res.status(409).json({
            success: false,
            error: 'El subdominio ya está en uso'
          })
        }
      }

      // Verificar que el email del usuario no existe
      const existingUser = await User.findOne({
        where: { email: userData.email }
      })
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'El email ya está registrado'
        })
      }

      // Hashear la contraseña
      const saltRounds = 10
      const hashedPassword = await bcryptjs.hash(userData.password, saltRounds)

      // Comenzar transacción de base de datos
      const transaction = await Business.sequelize.transaction()

      try {
        // 1. Crear el negocio
        const business = await Business.create({
          name: businessData.name,
          businessCode: businessData.businessCode,
          businessType: businessData.type,
          phone: businessData.phone,
          email: businessData.email,
          address: businessData.address,
          city: businessData.city,
          country: businessData.country,
          currentPlanId: planId, // Relación directa con el plan actual
          status: 'TRIAL', // Inicia en trial por 30 días
          trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
          subdomain: businessData.businessCode, // Por compatibilidad
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }, { transaction })

        console.log('Negocio creado:', business.id)

        // 2. Crear reglas predeterminadas del negocio
        const defaultRules = [
          {
            businessId: business.id,
            ruleKey: 'BUSINESS_HOURS',
            ruleValue: {
              monday: { open: '09:00', close: '18:00', enabled: true },
              tuesday: { open: '09:00', close: '18:00', enabled: true },
              wednesday: { open: '09:00', close: '18:00', enabled: true },
              thursday: { open: '09:00', close: '18:00', enabled: true },
              friday: { open: '09:00', close: '18:00', enabled: true },
              saturday: { open: '09:00', close: '15:00', enabled: true },
              sunday: { open: '09:00', close: '15:00', enabled: false }
            },
            description: 'Horarios de atención del negocio',
            category: 'BUSINESS_HOURS'
          },
          {
            businessId: business.id,
            ruleKey: 'CANCELLATION_POLICY',
            ruleValue: {
              allowCancellation: true,
              minHoursBeforeAppointment: 24,
              refundPolicy: 'full'
            },
            description: 'Política de cancelación de citas',
            category: 'CANCELLATION_POLICY'
          },
          {
            businessId: business.id,
            ruleKey: 'APPOINTMENT_RULES',
            ruleValue: {
              maxAdvanceBookingDays: 30,
              minAdvanceBookingHours: 2,
              allowSameDayBooking: true
            },
            description: 'Reglas para agendamiento de citas',
            category: 'APPOINTMENT_RULES'
          }
        ];

        for (const rule of defaultRules) {
          // await BusinessRules.create(rule, { transaction }); // Deprecated - usar RuleTemplate + BusinessRule
        }

        console.log('Reglas del negocio creadas para:', business.id)

        // 3. Crear el usuario administrador
        const user = await User.create({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phone: userData.phone,
          password: hashedPassword,
          role: 'BUSINESS', // El creador del negocio es BUSINESS (owner del negocio)
          businessId: business.id,
          isActive: true,
          emailVerified: true, // Por ahora lo marcamos como verificado
          createdAt: new Date(),
          updatedAt: new Date()
        }, { transaction })

        console.log('Usuario creado:', user.id)

        // 4. Crear la suscripción
        const startDate = new Date()
        
        // Calcular endDate basado en el tipo de suscripción
        // - trialEndDate: Solo para período de prueba gratuito (trialDays del plan)
        // - endDate: Fecha de vencimiento de la suscripción pagada
        
        // Para suscripciones pagadas: usar duration calculada según billingCycle
        const endDate = new Date()
        if (finalDurationType === 'MONTHS') {
          endDate.setMonth(endDate.getMonth() + finalDuration)
        } else if (finalDurationType === 'YEARS') {
          endDate.setFullYear(endDate.getFullYear() + finalDuration)
        } else if (finalDurationType === 'DAYS') {
          endDate.setDate(endDate.getDate() + finalDuration)
        } else if (finalDurationType === 'WEEKS') {
          endDate.setDate(endDate.getDate() + (finalDuration * 7))
        } else {
          // Default: 1 mes
          endDate.setMonth(endDate.getMonth() + 1)
        }

        // trialEndDate: Solo si el plan tiene días de prueba
        const trialEndDate = plan.trialDays > 0 
          ? new Date(Date.now() + plan.trialDays * 24 * 60 * 60 * 1000)
          : null

        const subscription = await BusinessSubscription.create({
          businessId: business.id,
          subscriptionPlanId: planId,
          status: 'TRIAL', // Inicia en trial hasta que se complete el pago
          startDate: startDate,
          endDate: endDate, // Fecha final cuando la suscripción esté pagada
          trialEndDate: trialEndDate, // Fecha final del período de prueba (si aplica)
          amount: finalPrice, // Usar precio calculado según billingCycle
          currency: plan.currency || 'COP',
          billingCycle: billingCycle, // Guardar el ciclo elegido por el cliente
          isActive: true,
          autoRenewal: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }, { transaction })

        console.log('Suscripción creada:', subscription.id)

        // 5. Guardar el token de pago para cobrar después (NO cobrar ahora)
        // Durante el trial (7 días), el usuario usa el servicio gratis
        // Al vencer el trial, el cron job cobrará automáticamente usando este token
        
        if (paymentData && paymentData.paymentSourceToken) {
          // Crear registro de pago pendiente con el token guardado
          const pendingPayment = await SubscriptionPayment.create({
            businessSubscriptionId: subscription.id,
            transactionId: paymentData.transactionId || uuidv4(),
            amount: finalPrice, // Usar precio calculado según billingCycle
            currency: plan.currency || 'COP',
            paymentMethod: 'WOMPI_3DS',
            status: 'PENDING', // Pendiente hasta que termine el trial
            dueDate: trialEndDate, // Se cobrará cuando venza el trial
            metadata: {
              paymentSourceToken: paymentData.paymentSourceToken,
              invitationToken: invitationToken,
              acceptedTerms: acceptedTerms,
              wompiData: paymentData,
              autoRenewal: true,
              billingCycle: billingCycle, // Guardar para referencia
              description: `Token guardado para cobro al finalizar trial de ${plan.trialDays} días - Ciclo: ${billingCycle}`
            },
            createdAt: new Date(),
            updatedAt: new Date()
          }, { transaction });

          console.log('Token de pago guardado para cobro futuro:', pendingPayment.id);
        }

        // Confirmar todas las operaciones
        await transaction.commit()

        // Generar token JWT para auto-login
        const token = jwt.sign(
          { 
            userId: user.id, 
            businessId: business.id,
            role: user.role 
          },
          process.env.JWT_SECRET || 'default-secret',
          { expiresIn: '24h' }
        )

        // Respuesta exitosa
        res.status(201).json({
          success: true,
          message: 'Suscripción creada exitosamente',
          data: {
            business: {
              id: business.id,
              name: business.name,
              businessCode: business.businessCode,
              email: business.email
            },
            user: {
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              role: user.role
            },
            subscription: {
              id: subscription.id,
              subscriptionPlanId: subscription.subscriptionPlanId,
              status: subscription.status,
              startDate: subscription.startDate,
              endDate: subscription.endDate
            },
            transaction: {
              id: paymentTransaction.id,
              transactionId: paymentTransaction.transactionId,
              amount: paymentTransaction.amount,
              status: paymentTransaction.status
            },
            token: token // Para auto-login
          }
        })

      } catch (error) {
        await transaction.rollback()
        throw error
      }

    } catch (error) {
      console.error('Error creando suscripción:', error)
      
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }

  /**
   * @swagger
   * /api/subscriptions/validate-invitation:
   *   post:
   *     summary: Validar token de invitación
   *     description: Valida un token de invitación y retorna información pre-rellenada
   *     tags: [Subscriptions]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               token:
   *                 type: string
   *     responses:
   *       200:
   *         description: Token válido
   *       400:
   *         description: Token inválido o expirado
   */
  static async validateInvitation(req, res) {
    const { token } = req.body

    try {
      // TODO: Implementar validación de token de invitación
      // Por ahora retornamos éxito
      res.json({
        success: true,
        data: {
          prefilledData: {},
          planId: null
        }
      })
    } catch (error) {
      console.error('Error validando invitación:', error)
      res.status(400).json({
        success: false,
        error: 'Token de invitación inválido'
      })
    }
  }
}

module.exports = SubscriptionController