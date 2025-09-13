const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Business Control API',
      version: '1.0.0',
      description: `
        🎯 **Sistema Completo de Gestión de Negocios **
        
        Esta API proporciona todas las funcionalidades para gestionar negocios  incluyendo:
        
        ## 🔒 **Acceso Restringido**
        ⚠️ **Esta documentación está disponible solo para usuarios con rol OWNER**
        
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
        name: 'Business Control Team',
        email: 'dev@businesscontrol.com'
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
            status: {
              type: 'string',
              enum: ['PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELLED'],
              description: 'Estado actual de la invitación'
            },
            expiresAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de expiración de la invitación'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación de la invitación'
            },
            business: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Nombre del negocio'
                },
                email: {
                  type: 'string',
                  format: 'email',
                  description: 'Email del negocio'
                },
                ownerName: {
                  type: 'string',
                  description: 'Nombre del propietario'
                }
              }
            },
            subscriptionPlan: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'ID del plan'
                },
                name: {
                  type: 'string',
                  description: 'Nombre del plan'
                },
                price: {
                  type: 'number',
                  description: 'Precio del plan'
                },
                currency: {
                  type: 'string',
                  description: 'Moneda del precio'
                }
              }
            },
            customMessage: {
              type: 'string',
              description: 'Mensaje personalizado de la invitación'
            },
            resendCount: {
              type: 'integer',
              description: 'Número de reenvíos realizados'
            },
            lastResentAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha del último reenvío'
            },
            cancelledAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de cancelación (si aplica)'
            },
            cancelReason: {
              type: 'string',
              description: 'Motivo de cancelación (si aplica)'
            },
            acceptedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de aceptación (si aplica)'
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
        },
        SubscriptionPayment: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único del pago'
            },
            businessSubscriptionId: {
              type: 'string',
              format: 'uuid',
              description: 'ID de la suscripción de negocio'
            },
            paymentConfigurationId: {
              type: 'string',
              format: 'uuid',
              nullable: true,
              description: 'ID de la configuración de pago utilizada'
            },
            amount: {
              type: 'number',
              minimum: 0,
              description: 'Monto del pago en centavos'
            },
            currency: {
              type: 'string',
              default: 'COP',
              description: 'Moneda del pago'
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED'],
              description: 'Estado del pago'
            },
            paymentMethod: {
              type: 'string',
              enum: ['CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'PSE', 'CASH', 'CHECK', 'DIGITAL_WALLET', 'MANUAL'],
              description: 'Método de pago utilizado'
            },
            transactionId: {
              type: 'string',
              nullable: true,
              description: 'ID de transacción del proveedor'
            },
            externalReference: {
              type: 'string',
              nullable: true,
              description: 'Referencia externa del pago'
            },
            paidAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Fecha y hora del pago'
            },
            dueDate: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de vencimiento'
            },
            receiptUrl: {
              type: 'string',
              nullable: true,
              description: 'URL del comprobante de pago'
            },
            receiptPublicId: {
              type: 'string',
              nullable: true,
              description: 'Public ID del comprobante en Cloudinary'
            },
            receiptMetadata: {
              type: 'object',
              nullable: true,
              description: 'Metadatos del archivo de comprobante'
            },
            receiptUploadedBy: {
              type: 'string',
              format: 'uuid',
              nullable: true,
              description: 'ID del usuario que subió el comprobante'
            },
            receiptUploadedAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Fecha de subida del comprobante'
            },
            commissionFee: {
              type: 'number',
              default: 0,
              description: 'Comisión cobrada por el proveedor'
            },
            netAmount: {
              type: 'number',
              description: 'Monto neto después de comisiones'
            },
            description: {
              type: 'string',
              nullable: true,
              description: 'Descripción del pago'
            },
            notes: {
              type: 'string',
              nullable: true,
              description: 'Notas internas'
            },
            failureReason: {
              type: 'string',
              nullable: true,
              description: 'Razón del fallo si aplica'
            },
            refundReason: {
              type: 'string',
              nullable: true,
              description: 'Razón del reembolso si aplica'
            },
            refundedAmount: {
              type: 'number',
              default: 0,
              description: 'Monto reembolsado'
            },
            refundedAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Fecha del reembolso'
            },
            providerResponse: {
              type: 'object',
              nullable: true,
              description: 'Respuesta del proveedor de pagos'
            },
            metadata: {
              type: 'object',
              nullable: true,
              description: 'Metadatos adicionales'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización'
            }
          }
        },
        BusinessSubscription: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único de la suscripción'
            },
            businessId: {
              type: 'string',
              format: 'uuid',
              description: 'ID del negocio'
            },
            subscriptionPlanId: {
              type: 'string',
              format: 'uuid',
              description: 'ID del plan de suscripción'
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'PENDING', 'OVERDUE', 'SUSPENDED', 'CANCELLED'],
              description: 'Estado de la suscripción'
            },
            startDate: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de inicio'
            },
            endDate: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de fin'
            },
            autoRenew: {
              type: 'boolean',
              description: 'Renovación automática habilitada'
            },
            amount: {
              type: 'number',
              description: 'Monto de la suscripción'
            },
            currency: {
              type: 'string',
              description: 'Moneda'
            }
          }
        },
        PaymentConfiguration: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único de la configuración'
            },
            name: {
              type: 'string',
              description: 'Nombre descriptivo de la configuración'
            },
            provider: {
              type: 'string',
              enum: ['WOMPI', 'TAXXA', 'STRIPE', 'PAYPAL', 'MERCADOPAGO'],
              description: 'Proveedor de pago'
            },
            environment: {
              type: 'string',
              enum: ['SANDBOX', 'PRODUCTION'],
              description: 'Ambiente de la configuración'
            },
            isActive: {
              type: 'boolean',
              description: 'Estado activo de la configuración'
            },
            isDefault: {
              type: 'boolean',
              description: 'Si es la configuración por defecto'
            },
            supportedCurrencies: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Monedas soportadas'
            },
            commissionRate: {
              type: 'number',
              description: 'Tasa de comisión en porcentaje'
            },
            fixedFee: {
              type: 'number',
              description: 'Tarifa fija por transacción'
            },
            maxAmount: {
              type: 'number',
              nullable: true,
              description: 'Monto máximo permitido'
            },
            minAmount: {
              type: 'number',
              nullable: true,
              description: 'Monto mínimo permitido'
            },
            webhookUrl: {
              type: 'string',
              format: 'uri',
              nullable: true,
              description: 'URL del webhook para notificaciones'
            },
            webhookSecret: {
              type: 'string',
              nullable: true,
              description: 'Secret para validar webhooks'
            },
            configuration: {
              type: 'object',
              nullable: true,
              description: 'Configuración específica del proveedor',
              additionalProperties: true
            },
            credentials: {
              type: 'object',
              nullable: true,
              description: 'Credenciales del proveedor (encriptadas)',
              additionalProperties: true
            },
            lastTestedAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Fecha de la última prueba'
            },
            lastTestResult: {
              type: 'string',
              enum: ['SUCCESS', 'FAILED', 'PENDING'],
              nullable: true,
              description: 'Resultado de la última prueba'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización'
            }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            currentPage: {
              type: 'integer',
              description: 'Página actual'
            },
            totalPages: {
              type: 'integer',
              description: 'Total de páginas'
            },
            totalItems: {
              type: 'integer',
              description: 'Total de elementos'
            },
            itemsPerPage: {
              type: 'integer',
              description: 'Elementos por página'
            },
            hasNext: {
              type: 'boolean',
              description: 'Hay página siguiente'
            },
            hasPrev: {
              type: 'boolean',
              description: 'Hay página anterior'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Mensaje de error'
            },
            error: {
              type: 'string',
              description: 'Código de error'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string'
                  },
                  message: {
                    type: 'string'
                  }
                }
              },
              description: 'Errores de validación detallados'
            }
          }
        },
        OwnerFinancialReport: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único del reporte'
            },
            reportType: {
              type: 'string',
              enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM'],
              description: 'Tipo de reporte'
            },
            reportPeriod: {
              type: 'string',
              description: 'Período del reporte en formato YYYY-MM-DD o YYYY-MM o YYYY'
            },
            startDate: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de inicio del período'
            },
            endDate: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de fin del período'
            },
            status: {
              type: 'string',
              enum: ['GENERATING', 'COMPLETED', 'FAILED'],
              description: 'Estado del reporte'
            },
            totalRevenue: {
              type: 'number',
              description: 'Ingresos totales del período'
            },
            subscriptionRevenue: {
              type: 'number',
              description: 'Ingresos por suscripciones'
            },
            netRevenue: {
              type: 'number',
              description: 'Ingresos netos después de comisiones'
            },
            totalPayments: {
              type: 'integer',
              description: 'Número total de pagos'
            },
            completedPayments: {
              type: 'integer',
              description: 'Pagos completados exitosamente'
            },
            failedPayments: {
              type: 'integer',
              description: 'Pagos fallidos'
            },
            pendingPayments: {
              type: 'integer',
              description: 'Pagos pendientes'
            },
            refundedPayments: {
              type: 'integer',
              description: 'Pagos reembolsados'
            },
            totalCommissions: {
              type: 'number',
              description: 'Comisiones totales pagadas a proveedores'
            },
            averageCommissionRate: {
              type: 'number',
              description: 'Tasa promedio de comisión'
            },
            newSubscriptions: {
              type: 'integer',
              description: 'Nuevas suscripciones en el período'
            },
            renewedSubscriptions: {
              type: 'integer',
              description: 'Suscripciones renovadas'
            },
            canceledSubscriptions: {
              type: 'integer',
              description: 'Suscripciones canceladas'
            },
            activeSubscriptions: {
              type: 'integer',
              description: 'Suscripciones activas al final del período'
            },
            churnRate: {
              type: 'number',
              description: 'Tasa de cancelación en porcentaje'
            },
            retentionRate: {
              type: 'number',
              description: 'Tasa de retención en porcentaje'
            },
            revenueByPlan: {
              type: 'object',
              description: 'Ingresos desglosados por plan de suscripción'
            },
            subscriptionsByPlan: {
              type: 'object',
              description: 'Cantidad de suscripciones por plan'
            },
            revenueByPaymentMethod: {
              type: 'object',
              description: 'Ingresos por método de pago'
            },
            paymentsByMethod: {
              type: 'object',
              description: 'Cantidad de pagos por método'
            },
            averageRevenuePerBusiness: {
              type: 'number',
              description: 'Ingreso promedio por negocio'
            },
            previousPeriodComparison: {
              type: 'object',
              description: 'Comparación con período anterior'
            },
            yearOverYearGrowth: {
              type: 'number',
              description: 'Crecimiento año sobre año en porcentaje'
            },
            currency: {
              type: 'string',
              default: 'COP',
              description: 'Moneda del reporte'
            },
            generatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de generación del reporte'
            },
            generatedBy: {
              type: 'string',
              enum: ['AUTOMATIC', 'MANUAL', 'SCHEDULED'],
              description: 'Método de generación'
            },
            notes: {
              type: 'string',
              nullable: true,
              description: 'Notas adicionales'
            },
            metadata: {
              type: 'object',
              nullable: true,
              description: 'Metadatos adicionales'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización'
            }
          }
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
        name: 'Owner Payments',
        description: 'Gestión de pagos de suscripciones - Ver, crear, actualizar y gestionar comprobantes'
      },
      {
        name: 'Owner Financial Reports',
        description: 'Generación y gestión de reportes financieros detallados con análisis de métricas y KPIs'
      },
      {
        name: 'Owner Business Management',
        description: 'Gestión de negocios e invitaciones por parte del Owner'
      },
      {
        name: 'Owner Payment Configurations',
        description: 'Configuración y gestión de proveedores de pago para el Owner'
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
        name: 'Owner Subscription Status',
        description: 'Gestión y verificación de estados de suscripciones (solo Owner)'
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
    
    /* Mensaje de acceso restringido */
    .swagger-ui .info .description::before {
      content: "🔒 ACCESO RESTRINGIDO - Solo usuarios OWNER";
      display: block;
      background: #ff6b35;
      color: white;
      padding: 15px;
      margin-bottom: 20px;
      border-radius: 5px;
      font-weight: bold;
      text-align: center;
      font-size: 16px;
    }
  `,
  customSiteTitle: "Beauty Control API Docs - OWNER ONLY",
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