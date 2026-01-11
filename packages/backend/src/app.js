const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Intentamos cargar la configuración de Swagger; si falla (por ejemplo
// por un bloque @swagger mal formateado), no queremos que el servidor
// deje de arrancar. Usamos un try/catch y stubs seguros como fallback.
let specs = {};
let swaggerUi = {
  // middleware stub que simplemente delega al siguiente handler
  serve: (req, res, next) => next(),
  // setup debe devolver un middleware; por defecto devolvemos uno que
  // responde 501 indicando que la documentación no está disponible
  setup: () => (req, res) => res.status(501).json({ success: false, message: 'API docs not available' })
};
let swaggerConfig = {};
try {
  const swaggerModule = require('./config/swagger');
  specs = swaggerModule.specs;
  // swaggerUi y swaggerConfig vienen del módulo; si no tienen las
  // propiedades esperadas, mantenemos los stubs.
  if (swaggerModule.swaggerUi) swaggerUi = swaggerModule.swaggerUi;
  if (swaggerModule.swaggerConfig) swaggerConfig = swaggerModule.swaggerConfig;
} catch (err) {
  // Logueamos el error para diagnóstico, pero no rompemos el arranque
  // del servidor. Esto es intencional durante desarrollo para permitir
  // pruebas aunque la documentación tenga errores de formato.
  // eslint-disable-next-line no-console
  console.warn('Warning: failed to load Swagger docs -', err && err.message ? err.message : err);
}

// const { specs, swaggerUi, swaggerConfig } = require('./config/swagger');

const { authenticateToken } = require('./middleware/auth');
const ownerOnly = require('./middleware/ownerOnly');
require('dotenv').config();

const app = express();

// Trust proxy - IMPORTANTE para Render/Vercel
// Esto permite que Express confíe en los headers X-Forwarded-* 
// establecidos por proxies inversos (Render, Vercel, etc.)
// Necesario para rate limiting y obtención correcta de IPs de clientes
app.set('trust proxy', true);

// Middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.cloudinary.com"]
    }
  }
}));

// CORS configurado - Always allow production URLs
const allowedOrigins = [
  // Production URLs
  'https://bc-nine-alpha.vercel.app',
  'https://www.controldenegocios.com',
  'https://controldenegocios.com',
  process.env.WEB_URL,
  process.env.APP_URL,
  process.env.FRONTEND_URL,
  // Development URLs
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:19006',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://192.168.0.213:3000',
  'http://192.168.0.213:3001',
  'http://192.168.0.213:19006'
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Check exact match
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Check regex patterns for Vercel preview deployments and custom domain
    const vercelPatterns = [
      /^https:\/\/.*\.controldenegocios\.com$/,
      /^https:\/\/bc-[a-z0-9]+-[a-z0-9]+-diana0617s-projects\.vercel\.app$/,
      /^https:\/\/.*-diana0617s-projects\.vercel\.app$/
    ];
    
    const isAllowed = vercelPatterns.some(pattern => pattern.test(origin));
    if (isAllowed) {
      return callback(null, true);
    }
    
    // Reject
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // límite de requests por IP
  message: {
    success: false,
    error: 'Demasiadas solicitudes, intenta nuevamente en 15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting in development or configure proper IP extraction
  skip: (req) => process.env.NODE_ENV === 'development',
  // En producción, confiar en el proxy para obtener la IP real
  keyGenerator: (req) => {
    // En desarrollo, usar una IP fija
    if (process.env.NODE_ENV === 'development') {
      return 'dev-local';
    }
    // En producción, usar X-Forwarded-For si existe
    return req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
  }
});

app.use('/api/', limiter);

// 📚 SWAGGER DOCUMENTATION - SOLO PARA OWNERS (excepto en desarrollo)
// Middleware condicional para desarrollo vs producción
const swaggerMiddleware = process.env.NODE_ENV === 'development'
  ? [] // Sin restricciones en desarrollo
  : [authenticateToken, ownerOnly]; // Con restricciones en producción

app.use('/api-docs', ...swaggerMiddleware, swaggerUi.serve, swaggerUi.setup(specs, swaggerConfig));

// Ruta adicional para desarrollo sin restricciones
if (process.env.NODE_ENV === 'development') {
  app.use('/api-docs-dev', swaggerUi.serve, swaggerUi.setup(specs, {
    ...swaggerConfig,
    customSiteTitle: "Control de Negocios API Docs - DESARROLLO (Sin restricciones)"
  }));
}

// Ruta para acceder al JSON de la documentación - También con restricción condicional
app.get('/api-docs.json', ...swaggerMiddleware, (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

// Rate limiting más estricto para autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 50, // Aumentado temporalmente para testing
  message: {
    success: false,
    error: 'Demasiados intentos de inicio de sesión, intenta nuevamente en 15 minutos'
  },
  skipSuccessfulRequests: true,
  // Skip rate limiting in development or configure proper IP extraction
  skip: (req) => process.env.NODE_ENV === 'development',
  keyGenerator: (req) => {
    if (process.env.NODE_ENV === 'development') {
      return 'dev-local';
    }
    return req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
  }
});

// Comentado temporalmente para testing
// app.use('/api/auth/login', authLimiter);
// app.use('/api/auth/register', authLimiter);

// Middleware de parsing y compresión
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Servir archivos estáticos (PDFs de consentimientos)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true,
    message: 'Control de Negocios API está funcionando',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Test endpoint para verificar sistema de suscripciones
app.get('/api/test/subscription-system', async (req, res) => {
  try {
    const SubscriptionStatusService = require('./services/SubscriptionStatusService');
    const CronJobManager = require('./utils/CronJobManager');
    
    const summary = await SubscriptionStatusService.getSubscriptionsRequiringAttention();
    
    res.json({
      success: true,
      message: 'Sistema de suscripciones funcionando correctamente',
      data: {
        timestamp: new Date().toISOString(),
        systemStatus: {
          cronJobsActive: true,
          subscriptionServiceActive: true,
          attentionRequired: summary
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en sistema de suscripciones',
      error: error.message
    });
  }
});

// Rutas de API
const authRoutes = require('./routes/auth');
const businessRoutes = require('./routes/business');
const plansRoutes = require('./routes/plans');
const moduleRoutes = require('./routes/modules');
const clientRoutes = require('./routes/clients');
const appointmentRoutes = require('./routes/appointments');
const serviceRoutes = require('./routes/services');
const productRoutes = require('./routes/products');
const financialRoutes = require('./routes/financial');
const ownerRoutes = require('./routes/owner');
const wompiPaymentRoutes = require('./routes/wompiPayments');
const whatsappWebhookRoutes = require('./routes/whatsappWebhookRoutes'); // WhatsApp webhooks
const whatsappAdminRoutes = require('./routes/whatsappAdminRoutes'); // WhatsApp admin (business self-service)
const businessWompiPaymentConfigRoutes = require('./routes/businessWompiPaymentConfigRoutes'); // Business Wompi payment config
const businessWompiPaymentWebhookRoutes = require('./routes/businessWompiPaymentWebhookRoutes'); // Business Wompi payment webhooks
const autoRenewalTestRoutes = require('./routes/autoRenewalTest');
const ownerBusinessManagementRoutes = require('./routes/ownerBusinessManagement');
const publicInvitationRoutes = require('./routes/publicInvitation');
const publicBookingsRoutes = require('./routes/publicBookings');
const businessConfigRoutes = require('./routes/businessConfig');
const businessRulesRoutes = require('./routes/businessRules'); // Nuevas rutas simplificadas
const ruleTemplateRoutes = require('./routes/ruleTemplate');
const branchRoutes = require('./routes/branches');
const ownerExpenseRoutes = require('./routes/ownerExpenses');
const businessExpenseRoutes = require('./routes/businessExpenses');
const voucherRoutes = require('./routes/vouchers');
const cacheRoutes = require('./routes/cache');
const receiptRoutes = require('./routes/receipts');
const subscriptionRoutes = require('./routes/subscription');
const subscriptionStatusRoutes = require('./routes/subscriptionStatus');
const payment3DSRoutes = require('./routes/payment3DS');
const testingRoutes = require('./routes/testing');
const scheduleRoutes = require('./routes/schedules');
const timeSlotRoutes = require('./routes/time-slots');
const calendarRoutes = require('./routes/calendar');
const commissionRoutes = require('./routes/commissionRoutes');
const commissionPublicRoutes = require('./routes/commissionPublicRoutes');
const consentRoutes = require('./routes/consentRoutes');
const specialistRoutes = require('./routes/specialistRoutes');
const permissionRoutes = require('./routes/permissions');
const treatmentPlanRoutes = require('./routes/treatmentPlans');
const paymentRoutes = require('./routes/paymentRoutes');
const supplierInvoiceRoutes = require('./routes/supplierInvoices');
const supplierRoutes = require('./routes/suppliers');
const supplierCatalogRoutes = require('./routes/supplierCatalog');
const cloudinaryUploadRoutes = require('./routes/cloudinaryUpload');
const adminRoutes = require('./routes/admin'); // Rutas de administración
const cashRegisterRoutes = require('./routes/cashRegister'); // Rutas de gestión de caja
const loyaltyRoutes = require('./routes/loyalty'); // Rutas de programa de fidelización
// const specialistServicesRoutes = require('./routes/specialistServices'); // DEPRECATED: Ahora usando rutas RESTful en businessConfig.js

// Rutas de sesiones móviles
const mobileRoutes = require('./routes/mobile.routes.js');


app.use('/api/auth', authRoutes);
app.use('/api/mobile', mobileRoutes); // Rutas de auto-login desde móvil
app.use('/api/admin', adminRoutes); // Rutas de administración (seed, etc.)
app.use('/api/seed', require('./routes/seed')); // Rutas de seeding protegidas
app.use('/api/business', businessRoutes);
app.use('/api/business', businessConfigRoutes); // Rutas de configuración del negocio
app.use('/api/business', businessWompiPaymentConfigRoutes); // Rutas de configuración de pagos Wompi del negocio
app.use('/api/business', branchRoutes); // Rutas de sucursales
app.use('/api/business/:businessId/upload', cloudinaryUploadRoutes); // Rutas de upload a Cloudinary
app.use('/api/business/:businessId/supplier-invoices', supplierInvoiceRoutes); // Rutas de facturas de proveedores
app.use('/api/business/:businessId/suppliers', supplierRoutes); // Rutas de proveedores
app.use('/api/business', supplierCatalogRoutes); // Rutas de catálogo de proveedores
app.use('/api/business/:businessId/clients', clientRoutes); // Rutas de clientes del negocio
app.use('/api/business/:businessId', commissionRoutes); // Rutas de comisiones
app.use('/api/commissions', commissionPublicRoutes); // Rutas públicas de comisiones para especialistas
app.use('/api/business/:businessId', consentRoutes); // Rutas de consentimientos
app.use('/api/permissions', permissionRoutes); // Rutas de permisos
app.use('/api/treatment-plans', treatmentPlanRoutes); // Rutas de tratamientos multi-sesión
app.use('/api/cash-register', cashRegisterRoutes); // Rutas de gestión de caja
app.use('/api/loyalty', loyaltyRoutes); // Rutas de programa de fidelización
app.use('/api', paymentRoutes); // Rutas de pagos y métodos de pago
app.use('/api', businessRulesRoutes); // Nuevas rutas simplificadas de reglas
app.use('/api/rule-templates', ruleTemplateRoutes); // Rutas de plantillas de reglas (legacy)
app.use('/api/receipts', receiptRoutes); // Rutas de recibos
app.use('/api/plans', plansRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/calendar', calendarRoutes); // Rutas de calendario y disponibilidad
app.use('/api/services', serviceRoutes);
app.use('/api/specialists', specialistRoutes); // Rutas de especialistas
// app.use('/api/specialists', specialistServicesRoutes); // DEPRECATED: Ahora usando /api/business/:businessId/specialists/:specialistId/services
app.use('/api/business/:businessId/products', productRoutes); // Rutas de productos del negocio
app.use('/api/financial', financialRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/owner/business', ownerBusinessManagementRoutes);
app.use('/api/owner/expenses', ownerExpenseRoutes);
app.use('/api/business/:businessId/expenses', businessExpenseRoutes); // Rutas de gastos del negocio
app.use('/api/vouchers', voucherRoutes); // Rutas de vouchers y penalizaciones
app.use('/api/cache', cacheRoutes); // Rutas de gestión de cache
app.use('/api/subscriptions', subscriptionRoutes); // Rutas de suscripciones
app.use('/api/owner/subscription-status', subscriptionStatusRoutes); // Rutas de estado de suscripciones para Owner
app.use('/api/owner/subscriptions', subscriptionStatusRoutes); // Alias para compatibilidad con el frontend
app.use('/api/public', publicInvitationRoutes);
app.use('/api/public/bookings', publicBookingsRoutes); // Nuevas rutas públicas para bookings
app.use('/api/wompi', wompiPaymentRoutes);
app.use('/api/webhooks/whatsapp', whatsappWebhookRoutes); // WhatsApp Business Platform webhooks
app.use('/api/webhooks/wompi', businessWompiPaymentWebhookRoutes); // Business Wompi payment webhooks (turnos online)
app.use('/api/admin/whatsapp', whatsappAdminRoutes); // WhatsApp admin endpoints (business self-service)
app.use('/api/payments/3ds', payment3DSRoutes); // Rutas de pagos 3D Secure
app.use('/api/test/auto-renewal', autoRenewalTestRoutes);
app.use('/api/testing', testingRoutes); // Rutas de testing (solo desarrollo)
app.use('/api/schedules', scheduleRoutes); // Rutas de gestión de horarios
app.use('/api/time-slots', timeSlotRoutes); // Rutas de gestión de slots de tiempo

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada'
  });
});

// Middleware de manejo de errores
app.use((error, req, res, next) => {
  console.error('Error no manejado:', error);

  // Error de validación de Sequelize
  if (error.name === 'SequelizeValidationError') {
    const validationErrors = error.errors.map(err => ({
      field: err.path,
      message: err.message
    }));
    
    return res.status(400).json({
      success: false,
      error: 'Errores de validación',
      details: validationErrors
    });
  }

  // Error de constraint único
  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      error: 'El recurso ya existe',
      details: error.errors?.[0]?.message
    });
  }

  // Error de foreign key
  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      error: 'Referencia inválida a recurso relacionado'
    });
  }

  // Error de conexión a base de datos
  if (error.name === 'SequelizeConnectionError') {
    return res.status(503).json({
      success: false,
      error: 'Error de conexión a la base de datos'
    });
  }

  // Error de JWT
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Token inválido'
    });
  }

  // Error genérico
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Error interno del servidor' 
      : error.message
  });
});

module.exports = app;