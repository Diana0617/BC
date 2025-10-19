const { TreatmentPlan, TreatmentSession, Service, Client, User, Appointment } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Controlador para gestionar planes de tratamiento multi-sesión
 */
const TreatmentPlanController = {
  
  /**
   * Crear un nuevo plan de tratamiento
   * POST /api/treatment-plans
   */
  async create(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const {
        clientId,
        serviceId,
        specialistId,
        startDate,
        expectedEndDate,
        paymentPlan = 'FULL_UPFRONT',
        notes,
        config
      } = req.body;
      
      const businessId = req.user.businessId;

      // Validar que el servicio existe y es un paquete
      const service = await Service.findByPk(serviceId);
      if (!service) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Servicio no encontrado' });
      }

      if (!service.isPackage) {
        await transaction.rollback();
        return res.status(400).json({ 
          error: 'Este servicio no es un paquete multi-sesión' 
        });
      }

      // Validar que el cliente existe
      const client = await Client.findByPk(clientId);
      if (!client) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }

      // Calcular totales basados en el servicio
      const totalSessions = service.getTotalSessions();
      const totalPrice = service.calculatePackagePrice();
      const pricePerSession = service.pricePerSession || (totalPrice / totalSessions);

      // Crear el plan de tratamiento
      const treatmentPlan = await TreatmentPlan.create({
        clientId,
        serviceId,
        businessId,
        specialistId: specialistId || null,
        planType: service.packageType === 'SINGLE' ? 'MULTI_SESSION' : service.packageType,
        status: 'ACTIVE',
        totalSessions,
        completedSessions: 0,
        totalPrice,
        paidAmount: 0,
        paymentPlan,
        startDate,
        expectedEndDate: expectedEndDate || null,
        notes: notes || null,
        config: config || service.packageConfig
      }, { transaction });

      // Crear todas las sesiones pendientes
      const sessionsToCreate = [];
      for (let i = 1; i <= totalSessions; i++) {
        sessionsToCreate.push({
          treatmentPlanId: treatmentPlan.id,
          sessionNumber: i,
          status: 'PENDING',
          price: pricePerSession,
          paid: false
        });
      }

      await TreatmentSession.bulkCreate(sessionsToCreate, { transaction });

      await transaction.commit();

      // Obtener el plan completo con relaciones
      const completePlan = await TreatmentPlan.findByPk(treatmentPlan.id, {
        include: [
          { model: Client, as: 'client' },
          { model: Service, as: 'service' },
          { model: User, as: 'specialist' },
          { 
            model: TreatmentSession, 
            as: 'sessions',
            order: [['sessionNumber', 'ASC']]
          }
        ]
      });

      return res.status(201).json({
        message: 'Plan de tratamiento creado exitosamente',
        treatmentPlan: completePlan
      });

    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error al crear plan de tratamiento:', error);
      return res.status(500).json({ 
        error: 'Error al crear plan de tratamiento',
        details: error.message 
      });
    }
  },

  /**
   * Obtener plan de tratamiento por ID con todas sus sesiones
   * GET /api/treatment-plans/:id
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const businessId = req.user.businessId;

      const treatmentPlan = await TreatmentPlan.findOne({
        where: { id, businessId },
        include: [
          { 
            model: Client, 
            as: 'client',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
          },
          { 
            model: Service, 
            as: 'service',
            attributes: ['id', 'name', 'description', 'packageType', 'packageConfig']
          },
          { 
            model: User, 
            as: 'specialist',
            attributes: ['id', 'firstName', 'lastName', 'email']
          },
          { 
            model: TreatmentSession, 
            as: 'sessions',
            include: [
              { 
                model: Appointment, 
                as: 'appointment',
                attributes: ['id', 'startTime', 'endTime', 'status']
              },
              {
                model: User,
                as: 'specialist',
                attributes: ['id', 'firstName', 'lastName']
              }
            ],
            order: [['sessionNumber', 'ASC']]
          }
        ]
      });

      if (!treatmentPlan) {
        return res.status(404).json({ error: 'Plan de tratamiento no encontrado' });
      }

      // Agregar información calculada
      const planData = treatmentPlan.toJSON();
      planData.progress = treatmentPlan.getProgress();
      planData.paymentProgress = treatmentPlan.getPaymentProgress();
      planData.canScheduleNext = treatmentPlan.canScheduleNextSession();

      return res.json(planData);

    } catch (error) {
      console.error('❌ Error al obtener plan de tratamiento:', error);
      return res.status(500).json({ 
        error: 'Error al obtener plan de tratamiento',
        details: error.message 
      });
    }
  },

  /**
   * Obtener todos los planes de tratamiento de un cliente
   * GET /api/clients/:clientId/treatment-plans
   */
  async getByClient(req, res) {
    try {
      const { clientId } = req.params;
      const businessId = req.user.businessId;
      const { status, includeCompleted = 'false' } = req.query;

      const whereClause = { clientId, businessId };
      
      if (status) {
        whereClause.status = status;
      } else if (includeCompleted === 'false') {
        whereClause.status = { [Op.ne]: 'COMPLETED' };
      }

      const treatmentPlans = await TreatmentPlan.findAll({
        where: whereClause,
        include: [
          { 
            model: Service, 
            as: 'service',
            attributes: ['id', 'name', 'packageType']
          },
          { 
            model: User, 
            as: 'specialist',
            attributes: ['id', 'firstName', 'lastName']
          },
          { 
            model: TreatmentSession, 
            as: 'sessions',
            attributes: ['id', 'sessionNumber', 'status', 'scheduledDate', 'completedDate', 'paid']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      // Agregar información calculada a cada plan
      const plansWithProgress = treatmentPlans.map(plan => {
        const planData = plan.toJSON();
        planData.progress = plan.getProgress();
        planData.paymentProgress = plan.getPaymentProgress();
        return planData;
      });

      return res.json({
        total: plansWithProgress.length,
        treatmentPlans: plansWithProgress
      });

    } catch (error) {
      console.error('❌ Error al obtener planes del cliente:', error);
      return res.status(500).json({ 
        error: 'Error al obtener planes del cliente',
        details: error.message 
      });
    }
  },

  /**
   * Obtener todos los planes de tratamiento del negocio
   * GET /api/treatment-plans
   */
  async getAll(req, res) {
    try {
      const businessId = req.user.businessId;
      const { 
        status, 
        specialistId, 
        page = 1, 
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = req.query;

      const whereClause = { businessId };
      
      if (status) whereClause.status = status;
      if (specialistId) whereClause.specialistId = specialistId;

      const offset = (parseInt(page) - 1) * parseInt(limit);

      const { count, rows } = await TreatmentPlan.findAndCountAll({
        where: whereClause,
        include: [
          { 
            model: Client, 
            as: 'client',
            attributes: ['id', 'firstName', 'lastName', 'phone']
          },
          { 
            model: Service, 
            as: 'service',
            attributes: ['id', 'name', 'packageType']
          },
          { 
            model: User, 
            as: 'specialist',
            attributes: ['id', 'firstName', 'lastName']
          }
        ],
        limit: parseInt(limit),
        offset,
        order: [[sortBy, sortOrder]]
      });

      const plansWithProgress = rows.map(plan => {
        const planData = plan.toJSON();
        planData.progress = plan.getProgress();
        planData.paymentProgress = plan.getPaymentProgress();
        return planData;
      });

      return res.json({
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
        treatmentPlans: plansWithProgress
      });

    } catch (error) {
      console.error('❌ Error al obtener planes de tratamiento:', error);
      return res.status(500).json({ 
        error: 'Error al obtener planes de tratamiento',
        details: error.message 
      });
    }
  },

  /**
   * Actualizar plan de tratamiento
   * PATCH /api/treatment-plans/:id
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const businessId = req.user.businessId;
      const updateData = req.body;

      // Campos que no se pueden actualizar directamente
      const restrictedFields = ['id', 'businessId', 'serviceId', 'clientId', 'totalSessions', 'completedSessions'];
      restrictedFields.forEach(field => delete updateData[field]);

      const treatmentPlan = await TreatmentPlan.findOne({
        where: { id, businessId }
      });

      if (!treatmentPlan) {
        return res.status(404).json({ error: 'Plan de tratamiento no encontrado' });
      }

      await treatmentPlan.update(updateData);

      const updatedPlan = await TreatmentPlan.findByPk(id, {
        include: [
          { model: Client, as: 'client' },
          { model: Service, as: 'service' },
          { model: User, as: 'specialist' },
          { model: TreatmentSession, as: 'sessions' }
        ]
      });

      return res.json({
        message: 'Plan de tratamiento actualizado',
        treatmentPlan: updatedPlan
      });

    } catch (error) {
      console.error('❌ Error al actualizar plan:', error);
      return res.status(500).json({ 
        error: 'Error al actualizar plan',
        details: error.message 
      });
    }
  },

  /**
   * Cancelar plan de tratamiento
   * DELETE /api/treatment-plans/:id
   */
  async cancel(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const { id } = req.params;
      const businessId = req.user.businessId;
      const { reason } = req.body;

      const treatmentPlan = await TreatmentPlan.findOne({
        where: { id, businessId }
      });

      if (!treatmentPlan) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Plan de tratamiento no encontrado' });
      }

      if (treatmentPlan.status === 'COMPLETED') {
        await transaction.rollback();
        return res.status(400).json({ 
          error: 'No se puede cancelar un plan completado' 
        });
      }

      // Actualizar plan a cancelado
      await treatmentPlan.update({
        status: 'CANCELLED',
        actualEndDate: new Date(),
        notes: treatmentPlan.notes 
          ? `${treatmentPlan.notes}\n\nCancelado: ${reason || 'Sin razón especificada'}`
          : `Cancelado: ${reason || 'Sin razón especificada'}`
      }, { transaction });

      // Cancelar todas las sesiones pendientes
      await TreatmentSession.update(
        { status: 'CANCELLED' },
        { 
          where: { 
            treatmentPlanId: id,
            status: { [Op.in]: ['PENDING', 'SCHEDULED'] }
          },
          transaction
        }
      );

      await transaction.commit();

      return res.json({
        message: 'Plan de tratamiento cancelado',
        treatmentPlan
      });

    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error al cancelar plan:', error);
      return res.status(500).json({ 
        error: 'Error al cancelar plan',
        details: error.message 
      });
    }
  },

  /**
   * Registrar pago en el plan de tratamiento
   * POST /api/treatment-plans/:id/payment
   */
  async addPayment(req, res) {
    try {
      const { id } = req.params;
      const { amount, sessionId } = req.body;
      const businessId = req.user.businessId;

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Monto inválido' });
      }

      const treatmentPlan = await TreatmentPlan.findOne({
        where: { id, businessId }
      });

      if (!treatmentPlan) {
        return res.status(404).json({ error: 'Plan de tratamiento no encontrado' });
      }

      const newPaidAmount = parseFloat(treatmentPlan.paidAmount) + parseFloat(amount);
      const totalPrice = parseFloat(treatmentPlan.totalPrice);

      if (newPaidAmount > totalPrice) {
        return res.status(400).json({ 
          error: 'El monto excede el precio total del tratamiento' 
        });
      }

      await treatmentPlan.update({
        paidAmount: newPaidAmount
      });

      // Si el pago es para una sesión específica, marcarla como pagada
      if (sessionId) {
        const session = await TreatmentSession.findOne({
          where: { id: sessionId, treatmentPlanId: id }
        });

        if (session) {
          await session.update({
            paid: true,
            paymentDate: new Date()
          });
        }
      }

      const paymentProgress = treatmentPlan.getPaymentProgress();

      return res.json({
        message: 'Pago registrado exitosamente',
        paidAmount: newPaidAmount,
        remaining: totalPrice - newPaidAmount,
        paymentProgress
      });

    } catch (error) {
      console.error('❌ Error al registrar pago:', error);
      return res.status(500).json({ 
        error: 'Error al registrar pago',
        details: error.message 
      });
    }
  }
};

module.exports = TreatmentPlanController;
