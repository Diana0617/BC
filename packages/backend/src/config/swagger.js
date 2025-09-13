const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Beauty Control API',
      version: '1.0.0',
      description: `
        🎯 **Sistema Completo de Gestión de Negocios de Belleza**
        
        Esta API proporciona todas las funcionalidades para gestionar negocios de belleza incluyendo:
        
        ## 🏢 **Gestión de Owner**
        - Dashboard con métricas y estadísticas
        - Configuración de pagos y planes
        - Gestión manual de negocios
        - Reportes financieros
        
        ## 🔄 **Sistema de Auto-Renovación**
        - Renovaciones automáticas de suscripciones
        - Procesamiento de pagos con Wompi
        - Notificaciones por email
        - Manejo de fallos y reintentos
        
        ## 📧 **Sistema de Invitaciones**
        - Creación manual de negocios por Owner
        - Invitaciones por email con tokens seguros
        - Procesamiento de pagos públicos
        - Activación automática de negocios
        
        ## 🔐 **Autenticación**
        Para endpoints protegidos, incluye el header:
        \`Authorization: Bearer <tu-token>\`
      `,
      contact: {
        name: 'Beauty Control Team',
        email: 'dev@beautycontrol.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api.beautycontrol.com' 
          : 'http://localhost:3001',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenido del login'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensaje de error'
            },
            details: {
              type: 'string',
              description: 'Detalles adicionales del error'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Mensaje de éxito'
            },
            data: {
              type: 'object',
              description: 'Datos de respuesta'
            }
          }
        },
        Business: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único del negocio'
            },
            name: {
              type: 'string',
              description: 'Nombre del negocio'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del negocio'
            },
            phone: {
              type: 'string',
              description: 'Teléfono de contacto'
            },
            address: {
              type: 'string',
              description: 'Dirección física'
            },
            isActive: {
              type: 'boolean',
              description: 'Estado de activación del negocio'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación'
            }
          }
        },
        SubscriptionPlan: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único del plan'
            },
            name: {
              type: 'string',
              description: 'Nombre del plan'
            },
            price: {
              type: 'number',
              description: 'Precio en centavos'
            },
            duration: {
              type: 'integer',
              description: 'Duración en días'
            },
            features: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Lista de características incluidas'
            }
          }
        },
        BusinessInvitation: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único de la invitación'
            },
            token: {
              type: 'string',
              description: 'Token único para la invitación'
            },
            businessName: {
              type: 'string',
              description: 'Nombre del negocio invitado'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email de contacto'
            },
            status: {
              type: 'string',
              enum: ['SENT', 'VIEWED', 'PAYMENT_STARTED', 'COMPLETED', 'EXPIRED', 'CANCELLED'],
              description: 'Estado actual de la invitación'
            },
            expiresAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de expiración'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación'
            }
          }
        },
        PaymentData: {
          type: 'object',
          properties: {
            cardNumber: {
              type: 'string',
              description: 'Número de tarjeta (será enmascarado)',
              example: '4242424242424242'
            },
            cardHolderName: {
              type: 'string',
              description: 'Nombre del titular de la tarjeta'
            },
            expiryMonth: {
              type: 'integer',
              minimum: 1,
              maximum: 12,
              description: 'Mes de expiración'
            },
            expiryYear: {
              type: 'integer',
              minimum: 2024,
              description: 'Año de expiración'
            },
            cvc: {
              type: 'string',
              description: 'Código de seguridad'
            },
            acceptTerms: {
              type: 'boolean',
              description: 'Aceptación de términos y condiciones'
            }
          },
          required: ['cardNumber', 'cardHolderName', 'expiryMonth', 'expiryYear', 'cvc', 'acceptTerms']
        }
      }
    },
    tags: [
      {
        name: '🔐 Autenticación',
        description: 'Endpoints para login y gestión de tokens'
      },
      {
        name: '👤 Owner - Dashboard',
        description: 'Panel de control principal para el Owner'
      },
      {
        name: '💳 Owner - Pagos',
        description: 'Configuración y gestión de pagos'
      },
      {
        name: '📊 Owner - Planes',
        description: 'Gestión de planes de suscripción'
      },
      {
        name: '🏢 Owner - Negocios',
        description: 'Gestión manual de negocios e invitaciones'
      },
      {
        name: '📈 Owner - Reportes',
        description: 'Reportes financieros y estadísticas'
      },
      {
        name: '🔄 Auto-Renovación',
        description: 'Sistema automático de renovación de suscripciones'
      },
      {
        name: '📧 Invitaciones Públicas',
        description: 'Endpoints públicos para completar invitaciones'
      },
      {
        name: '🏪 Negocio',
        description: 'Endpoints para gestión interna de negocios'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
    './src/models/*.js'
  ]
};

const specs = swaggerJsdoc(options);

const swaggerConfig = {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 50px 0 }
    .swagger-ui .info .title { color: #1976d2 }
    .swagger-ui .scheme-container { background: #fafafa; padding: 10px; margin: 20px 0 }
  `,
  customSiteTitle: "Beauty Control API Docs",
  customfavIcon: "/favicon.ico",
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    docExpansion: 'none',
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2
  }
};

module.exports = {
  specs,
  swaggerUi,
  swaggerConfig
};