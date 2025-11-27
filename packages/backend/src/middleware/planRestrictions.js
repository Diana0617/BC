const { Business, BusinessSubscription, SubscriptionPlan, Service } = require('../models');
const { Op } = require('sequelize');

/**
 * Helper to check if a business is on a free plan
 */
const isFreePlan = async (businessId) => {
  try {
    const business = await Business.findByPk(businessId, {
      include: [{
        model: BusinessSubscription,
        as: 'subscriptions',
        where: { 
          status: { [Op.in]: ['ACTIVE', 'TRIAL'] } 
        },
        include: [{ model: SubscriptionPlan, as: 'plan' }],
        limit: 1,
        order: [['createdAt', 'DESC']]
      }]
    });
    
    if (!business || !business.subscriptions || business.subscriptions.length === 0) {
      return false;
    }

    const subscription = business.subscriptions[0];
    const price = subscription.plan.price;
    
    return price === 0 || price === '0.00' || parseFloat(price) === 0;
  } catch (error) {
    console.error('Error checking free plan status:', error);
    return false;
  }
};

/**
 * Middleware to restrict features based on Free Plan limits
 * @param {string} feature - The feature to check (STAFF_CREATE, PAYMENT_METHODS, SERVICES_LIMIT, RULES_EDIT)
 */
const restrictFreePlan = (feature) => {
  return async (req, res, next) => {
    try {
      // Skip for Owner? No, user said "el usuario con plan gratuito". 
      // Usually the owner IS the one with the plan.
      // But maybe we should skip for Super Admin if that exists?
      // Assuming req.user.businessId is present.
      
      const businessId = req.user.businessId;
      if (!businessId) return next(); 

      const freePlan = await isFreePlan(businessId);
      
      if (freePlan) {
        if (feature === 'STAFF_CREATE') {
             return res.status(403).json({ 
                 success: false, 
                 message: 'El plan gratuito no permite agregar más especialistas. Actualiza tu plan para desbloquear esta función.' 
             });
        }
        
        if (feature === 'PAYMENT_METHODS') {
             const { type } = req.body;
             // If creating/updating to a non-CASH type
             if (type && type !== 'CASH') {
                 return res.status(403).json({ 
                     success: false, 
                     message: 'El plan gratuito solo permite pagos en efectivo. Actualiza tu plan para aceptar otros métodos.' 
                 });
             }
        }
        
        if (feature === 'SERVICES_LIMIT') {
             const count = await Service.count({ where: { businessId } });
             if (count >= 5) {
                 return res.status(403).json({ 
                     success: false, 
                     message: 'Has alcanzado el límite de 5 servicios del plan gratuito. Actualiza tu plan para agregar más.' 
                 });
             }
        }
        
        if (feature === 'RULES_EDIT') {
             return res.status(403).json({ 
                 success: false, 
                 message: 'El plan gratuito no permite personalizar las reglas de negocio. Actualiza tu plan para desbloquear esta función.' 
             });
        }
      }
      
      next();
    } catch (error) {
      console.error('Error in planRestrictions middleware:', error);
      res.status(500).json({ success: false, message: 'Error verificando restricciones del plan.' });
    }
  };
};

module.exports = { restrictFreePlan };
