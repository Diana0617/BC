const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// In development we may want to avoid parsing very large / fragile JSDoc
// blocks (like owner.js) that can break swagger-jsdoc due to YAML examples.
const isDev = process.env.NODE_ENV !== 'production';
const defaultApis = [
  './src/routes/*.js',
  './src/controllers/*.js'
];

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
              description: 'ID único del plan',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            name: {
              type: 'string',
              description: 'Nombre del plan',
              example: 'Plan Básico'
            },
            description: {
              type: 'string',
              description: 'Descripción detallada del plan',
              example: 'Plan ideal para negocios pequeños con funcionalidades básicas'
            },
            price: {
              type: 'string',
              description: 'Precio del plan en formato decimal',
              example: '29.99'
            },
            currency: {
              type: 'string',
              description: 'Moneda del precio',
              example: 'COP'
            },
            duration: {
              type: 'integer',
              description: 'Duración del plan',
              example: 1
            },
            durationType: {
              type: 'string',
              enum: ['DAYS', 'WEEKS', 'MONTHS', 'YEARS'],
              description: 'Tipo de duración del plan',
              example: 'MONTHS'
            },
            maxUsers: {
              type: 'integer',
              description: 'Máximo número de usuarios permitidos',
              example: 5
            },
            maxClients: {
              type: 'integer',
              description: 'Máximo número de clientes permitidos',
              example: 100
            },
            maxAppointments: {
              type: 'integer',
              description: 'Máximo número de citas permitidas',
              example: 500
            },
            storageLimit: {
              type: 'string',
              description: 'Límite de almacenamiento en MB',
              example: '1000'
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'INACTIVE', 'DEPRECATED'],
              description: 'Estado del plan',
              example: 'ACTIVE'
            },
            isPopular: {
              type: 'boolean',
              description: 'Indica si el plan es popular/destacado',
              example: false
            },
            trialDays: {
              type: 'integer',
              description: 'Días de prueba gratuita',
              example: 14
            },
            features: {
              type: 'object',
              description: 'Características booleanas del plan',
              properties: {
                reports: {
                  type: 'boolean',
                  example: true
                },
                customization: {
                  type: 'boolean',
                  example: false
                },
                notifications: {
                  type: 'boolean',
                  example: true
                }
              }
            },
            limitations: {
              type: 'object',
              description: 'Limitaciones específicas del plan',
              properties: {
                maxBranches: {
                  type: 'integer',
                  example: 1
                },
                supportLevel: {
                  type: 'string',
                  example: 'basic'
                }
              }
            },
            modules: {
              type: 'array',
              description: 'Módulos incluidos en el plan (disponible en rutas públicas)',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    format: 'uuid',
                    description: 'ID único del módulo'
                  },
                  name: {
                    type: 'string',
                    description: 'Nombre técnico del módulo',
                    example: 'authentication'
                  },
                  displayName: {
                    type: 'string',
                    description: 'Nombre para mostrar del módulo',
                    example: 'Autenticación'
                  },
                  icon: {
                    type: 'string',
                    description: 'Icono del módulo',
                    example: 'mdi-shield-account'
                  },
                  category: {
                    type: 'string',
                    description: 'Categoría del módulo',
                    example: 'core'
                  },
                  status: {
                    type: 'string',
                    enum: ['ACTIVE', 'INACTIVE'],
                    description: 'Estado del módulo',
                    example: 'ACTIVE'
                  },
                  pricing: {
                    type: 'object',
                    description: 'Información de precios del módulo'
                  },
                  PlanModule: {
                    type: 'object',
                    description: 'Configuración específica del módulo para este plan',
                    properties: {
                      isIncluded: {
                        type: 'boolean',
                        description: 'Si el módulo está incluido en el plan',
                        example: true
                      },
                      limitQuantity: {
                        type: 'integer',
                        nullable: true,
                        description: 'Cantidad límite del módulo',
                        example: null
                      },
                      additionalPrice: {
                        type: 'number',
                        description: 'Precio adicional del módulo',
                        example: 0
                      },
                      configuration: {
                        type: 'object',
                        description: 'Configuración específica del módulo',
                        example: {}
                      }
                    }
                  }
                }
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación del plan'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización del plan'
            }
          },
          required: ['id', 'name', 'price', 'currency', 'duration', 'durationType', 'status']
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
        },
        Service: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único del servicio'
            },
            businessId: {
              type: 'string',
              format: 'uuid',
              description: 'ID del negocio al que pertenece'
            },
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              description: 'Nombre del servicio'
            },
            description: {
              type: 'string',
              nullable: true,
              description: 'Descripción detallada del servicio'
            },
            category: {
              type: 'string',
              nullable: true,
              description: 'Categoría del servicio'
            },
            price: {
              type: 'number',
              minimum: 0,
              description: 'Precio del servicio'
            },
            duration: {
              type: 'integer',
              minimum: 1,
              description: 'Duración del servicio en minutos'
            },
            requiresConsent: {
              type: 'boolean',
              default: false,
              description: 'Si el servicio requiere consentimiento del cliente'
            },
            consentTemplate: {
              type: 'string',
              nullable: true,
              description: 'Plantilla de consentimiento'
            },
            isActive: {
              type: 'boolean',
              default: true,
              description: 'Estado activo del servicio'
            },
            color: {
              type: 'string',
              nullable: true,
              pattern: '^#[0-9A-F]{6}$',
              description: 'Color hexadecimal para identificación visual'
            },
            preparationTime: {
              type: 'integer',
              minimum: 0,
              default: 0,
              description: 'Tiempo de preparación en minutos antes del servicio'
            },
            cleanupTime: {
              type: 'integer',
              minimum: 0,
              default: 0,
              description: 'Tiempo de limpieza en minutos después del servicio'
            },
            maxConcurrent: {
              type: 'integer',
              minimum: 1,
              default: 1,
              description: 'Máximo número de servicios concurrentes'
            },
            requiresEquipment: {
              type: 'array',
              items: {
                type: 'string'
              },
              default: [],
              description: 'Lista de equipamiento requerido'
            },
            skillsRequired: {
              type: 'array',
              items: {
                type: 'string'
              },
              default: [],
              description: 'Lista de habilidades requeridas'
            },
            images: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  url: {
                    type: 'string',
                    format: 'uri'
                  },
                  description: {
                    type: 'string'
                  },
                  order: {
                    type: 'integer'
                  }
                }
              },
              default: [],
              description: 'Lista de imágenes del servicio'
            },
            commission: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['PERCENTAGE', 'FIXED'],
                  default: 'PERCENTAGE'
                },
                value: {
                  type: 'number',
                  default: 0
                },
                specialistPercentage: {
                  type: 'number',
                  minimum: 0,
                  maximum: 100,
                  default: 50
                },
                businessPercentage: {
                  type: 'number',
                  minimum: 0,
                  maximum: 100,
                  default: 50
                }
              },
              description: 'Configuración de comisiones del servicio'
            },
            bookingSettings: {
              type: 'object',
              properties: {
                onlineBookingEnabled: {
                  type: 'boolean',
                  default: true
                },
                advanceBookingDays: {
                  type: 'integer',
                  default: 30
                },
                requiresApproval: {
                  type: 'boolean',
                  default: false
                },
                allowWaitlist: {
                  type: 'boolean',
                  default: true
                }
              },
              description: 'Configuración de reservas para el servicio'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              default: [],
              description: 'Etiquetas del servicio'
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
        Product: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único del producto'
            },
            businessId: {
              type: 'string',
              format: 'uuid',
              description: 'ID del negocio al que pertenece'
            },
            name: {
              type: 'string',
              description: 'Nombre del producto',
              example: 'Shampoo Profesional'
            },
            description: {
              type: 'string',
              description: 'Descripción detallada del producto',
              example: 'Shampoo profesional para cabello graso'
            },
            sku: {
              type: 'string',
              description: 'Código SKU único',
              example: 'SHA0001'
            },
            barcode: {
              type: 'string',
              description: 'Código de barras',
              example: '1234567890123'
            },
            category: {
              type: 'string',
              description: 'Categoría del producto',
              example: 'Productos para Cabello',
              enum: [
                'Consumibles',
                'Productos para Cabello',
                'Productos para Piel',
                'Cosméticos',
                'Herramientas',
                'Equipos',
                'Suministros',
                'Otros'
              ]
            },
            brand: {
              type: 'string',
              description: 'Marca del producto',
              example: 'L\'Oréal Professional'
            },
            price: {
              type: 'number',
              format: 'decimal',
              minimum: 0,
              description: 'Precio de venta',
              example: 45000
            },
            cost: {
              type: 'number',
              format: 'decimal',
              minimum: 0,
              description: 'Costo de compra',
              example: 25000
            },
            trackInventory: {
              type: 'boolean',
              default: true,
              description: 'Si se rastrea el inventario de este producto'
            },
            currentStock: {
              type: 'number',
              format: 'decimal',
              minimum: 0,
              default: 0,
              description: 'Stock actual disponible'
            },
            minStock: {
              type: 'number',
              format: 'decimal',
              minimum: 0,
              default: 5,
              description: 'Stock mínimo para alertas'
            },
            maxStock: {
              type: 'number',
              format: 'decimal',
              minimum: 0,
              description: 'Stock máximo recomendado'
            },
            unit: {
              type: 'string',
              description: 'Unidad de medida',
              example: 'ml',
              enum: [
                'unidad',
                'ml',
                'litro',
                'gramo',
                'kilogramo',
                'onza',
                'paquete'
              ]
            },
            weight: {
              type: 'number',
              format: 'decimal',
              minimum: 0,
              description: 'Peso del producto en gramos'
            },
            dimensions: {
              type: 'object',
              properties: {
                length: {
                  type: 'number',
                  description: 'Largo en cm'
                },
                width: {
                  type: 'number',
                  description: 'Ancho en cm'
                },
                height: {
                  type: 'number',
                  description: 'Alto en cm'
                }
              },
              description: 'Dimensiones del producto'
            },
            taxable: {
              type: 'boolean',
              default: true,
              description: 'Si el producto está sujeto a impuestos'
            },
            taxRate: {
              type: 'number',
              format: 'decimal',
              minimum: 0,
              maximum: 100,
              description: 'Tasa de impuesto en porcentaje'
            },
            isActive: {
              type: 'boolean',
              default: true,
              description: 'Si el producto está activo'
            },
            images: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  url: {
                    type: 'string',
                    description: 'URL de la imagen'
                  },
                  description: {
                    type: 'string',
                    description: 'Descripción de la imagen'
                  },
                  uploadedAt: {
                    type: 'string',
                    format: 'date-time',
                    description: 'Fecha de subida'
                  }
                }
              },
              description: 'Imágenes del producto'
            },
            supplier: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Nombre del proveedor'
                },
                contactInfo: {
                  type: 'string',
                  description: 'Información de contacto'
                },
                supplierCode: {
                  type: 'string',
                  description: 'Código del proveedor'
                }
              },
              description: 'Información del proveedor principal'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              default: [],
              description: 'Etiquetas del producto'
            },
            expirationTracking: {
              type: 'boolean',
              default: false,
              description: 'Si se rastrea la fecha de vencimiento'
            },
            batchTracking: {
              type: 'boolean',
              default: false,
              description: 'Si se rastrea por lotes'
            },
            serialTracking: {
              type: 'boolean',
              default: false,
              description: 'Si se rastrea por número de serie'
            },
            variants: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    description: 'Nombre de la variante'
                  },
                  value: {
                    type: 'string',
                    description: 'Valor de la variante'
                  },
                  sku: {
                    type: 'string',
                    description: 'SKU específico de la variante'
                  },
                  price: {
                    type: 'number',
                    description: 'Precio específico de la variante'
                  },
                  stock: {
                    type: 'number',
                    description: 'Stock específico de la variante'
                  }
                }
              },
              description: 'Variantes del producto (tallas, colores, etc.)'
            },
            lastMovementDate: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha del último movimiento de inventario'
            },
            stockStatus: {
              type: 'string',
              enum: ['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'OVERSTOCK', 'NO_TRACKED'],
              description: 'Estado actual del stock'
            },
            totalValue: {
              type: 'number',
              format: 'decimal',
              description: 'Valor total del inventario (stock * costo)'
            },
            retailValue: {
              type: 'number',
              format: 'decimal',
              description: 'Valor de venta del inventario (stock * precio)'
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
        InventoryMovement: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único del movimiento'
            },
            businessId: {
              type: 'string',
              format: 'uuid',
              description: 'ID del negocio'
            },
            productId: {
              type: 'string',
              format: 'uuid',
              description: 'ID del producto'
            },
            movementType: {
              type: 'string',
              enum: [
                'PURCHASE',
                'SALE',
                'ADJUSTMENT',
                'TRANSFER',
                'RETURN',
                'DAMAGE',
                'EXPIRED',
                'INITIAL_STOCK'
              ],
              description: 'Tipo de movimiento de inventario'
            },
            quantity: {
              type: 'number',
              format: 'decimal',
              description: 'Cantidad del movimiento (positiva para entradas, negativa para salidas)'
            },
            unitCost: {
              type: 'number',
              format: 'decimal',
              minimum: 0,
              description: 'Costo unitario en el momento del movimiento'
            },
            totalCost: {
              type: 'number',
              format: 'decimal',
              description: 'Costo total del movimiento (quantity * unitCost)'
            },
            reason: {
              type: 'string',
              description: 'Razón del movimiento',
              example: 'Compra a proveedor ABC'
            },
            notes: {
              type: 'string',
              description: 'Notas adicionales sobre el movimiento'
            },
            batchNumber: {
              type: 'string',
              description: 'Número de lote (si aplica)'
            },
            serialNumber: {
              type: 'string',
              description: 'Número de serie (si aplica)'
            },
            expirationDate: {
              type: 'string',
              format: 'date',
              description: 'Fecha de vencimiento (si aplica)'
            },
            stockBefore: {
              type: 'number',
              format: 'decimal',
              description: 'Stock antes del movimiento'
            },
            stockAfter: {
              type: 'number',
              format: 'decimal',
              description: 'Stock después del movimiento'
            },
            supplierInfo: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Nombre del proveedor'
                },
                invoiceNumber: {
                  type: 'string',
                  description: 'Número de factura'
                },
                purchaseOrder: {
                  type: 'string',
                  description: 'Número de orden de compra'
                }
              },
              description: 'Información del proveedor (para compras)'
            },
            relatedDocuments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    description: 'Tipo de documento'
                  },
                  url: {
                    type: 'string',
                    description: 'URL del documento'
                  },
                  description: {
                    type: 'string',
                    description: 'Descripción del documento'
                  }
                }
              },
              description: 'Documentos relacionados (facturas, recibos, etc.)'
            },
            product: {
              $ref: '#/components/schemas/Product',
              description: 'Información del producto relacionado'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación del movimiento'
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
            page: {
              type: 'integer',
              minimum: 1,
              description: 'Página actual'
            },
            limit: {
              type: 'integer',
              minimum: 1,
              description: 'Límite de resultados por página'
            },
            total: {
              type: 'integer',
              minimum: 0,
              description: 'Total de registros'
            },
            pages: {
              type: 'integer',
              minimum: 0,
              description: 'Total de páginas'
            }
          }
        },

        // ==================== SCHEMAS DE PROVEEDORES ====================
        
        Supplier: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único del proveedor'
            },
            businessId: {
              type: 'string',
              format: 'uuid',
              description: 'ID del negocio'
            },
            name: {
              type: 'string',
              description: 'Nombre de la empresa proveedora',
              example: 'Distribuidora Beauty Corp'
            },
            code: {
              type: 'string',
              description: 'Código único del proveedor',
              example: 'DBC001'
            },
            type: {
              type: 'string',
              enum: ['DISTRIBUTOR', 'MANUFACTURER', 'WHOLESALER', 'RETAILER', 'SERVICE_PROVIDER', 'FREELANCER'],
              description: 'Tipo de proveedor'
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'INACTIVE', 'PENDING', 'BLOCKED', 'UNDER_REVIEW'],
              description: 'Estado del proveedor'
            },
            taxId: {
              type: 'string',
              description: 'NIT o identificación fiscal',
              example: '900123456-1'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email principal del proveedor'
            },
            phone: {
              type: 'string',
              description: 'Teléfono principal',
              example: '+57 300 123 4567'
            },
            website: {
              type: 'string',
              format: 'uri',
              description: 'Sitio web del proveedor'
            },
            address: {
              type: 'object',
              properties: {
                street: {
                  type: 'string',
                  description: 'Dirección de la calle'
                },
                city: {
                  type: 'string',
                  description: 'Ciudad'
                },
                state: {
                  type: 'string',
                  description: 'Estado o departamento'
                },
                country: {
                  type: 'string',
                  description: 'País'
                },
                postalCode: {
                  type: 'string',
                  description: 'Código postal'
                }
              },
              description: 'Dirección completa del proveedor'
            },
            contactPerson: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Nombre del contacto principal'
                },
                position: {
                  type: 'string',
                  description: 'Cargo del contacto'
                },
                email: {
                  type: 'string',
                  format: 'email'
                },
                phone: {
                  type: 'string'
                }
              },
              description: 'Contacto principal del proveedor'
            },
            categories: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Categorías de productos que maneja'
            },
            paymentTerms: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['IMMEDIATE', 'NET_15', 'NET_30', 'NET_45', 'NET_60', 'NET_90', 'COD'],
                  description: 'Tipo de término de pago'
                },
                creditLimit: {
                  type: 'number',
                  description: 'Límite de crédito'
                },
                currency: {
                  type: 'string',
                  default: 'COP'
                }
              },
              description: 'Términos de pago del proveedor'
            },
            bankInfo: {
              type: 'object',
              properties: {
                bankName: {
                  type: 'string'
                },
                accountNumber: {
                  type: 'string'
                },
                accountType: {
                  type: 'string',
                  enum: ['SAVINGS', 'CHECKING']
                }
              },
              description: 'Información bancaria'
            },
            certifications: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string'
                  },
                  issuer: {
                    type: 'string'
                  },
                  expirationDate: {
                    type: 'string',
                    format: 'date'
                  }
                }
              },
              description: 'Certificaciones del proveedor'
            },
            notes: {
              type: 'string',
              description: 'Notas adicionales sobre el proveedor'
            },
            stats: {
              type: 'object',
              properties: {
                totalOrders: {
                  type: 'integer',
                  description: 'Total de órdenes realizadas'
                },
                totalSpent: {
                  type: 'number',
                  description: 'Total gastado en el proveedor'
                },
                pendingInvoices: {
                  type: 'integer',
                  description: 'Facturas pendientes'
                },
                averageRating: {
                  type: 'number',
                  description: 'Calificación promedio'
                }
              },
              description: 'Estadísticas del proveedor'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          },
          required: ['name', 'type']
        },

        SupplierContact: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            supplierId: {
              type: 'string',
              format: 'uuid'
            },
            name: {
              type: 'string',
              description: 'Nombre del contacto'
            },
            position: {
              type: 'string',
              description: 'Cargo o posición'
            },
            email: {
              type: 'string',
              format: 'email'
            },
            phone: {
              type: 'string'
            },
            department: {
              type: 'string',
              description: 'Departamento'
            },
            isPrimary: {
              type: 'boolean',
              description: 'Si es el contacto principal'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          },
          required: ['name', 'position']
        },

        PurchaseOrder: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            businessId: {
              type: 'string',
              format: 'uuid'
            },
            supplierId: {
              type: 'string',
              format: 'uuid'
            },
            orderNumber: {
              type: 'string',
              description: 'Número de orden de compra',
              example: 'PO2024001'
            },
            status: {
              type: 'string',
              enum: ['DRAFT', 'SENT', 'CONFIRMED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'],
              description: 'Estado de la orden'
            },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productName: {
                    type: 'string'
                  },
                  quantity: {
                    type: 'number'
                  },
                  unitPrice: {
                    type: 'number'
                  },
                  total: {
                    type: 'number'
                  },
                  unit: {
                    type: 'string'
                  },
                  notes: {
                    type: 'string'
                  }
                }
              },
              description: 'Items de la orden'
            },
            subtotal: {
              type: 'number',
              description: 'Subtotal de la orden'
            },
            tax: {
              type: 'number',
              description: 'Impuestos'
            },
            total: {
              type: 'number',
              description: 'Total de la orden'
            },
            notes: {
              type: 'string',
              description: 'Notas adicionales'
            },
            deliveryDate: {
              type: 'string',
              format: 'date',
              description: 'Fecha de entrega esperada'
            },
            deliveryAddress: {
              type: 'object',
              description: 'Dirección de entrega'
            },
            supplier: {
              $ref: '#/components/schemas/Supplier'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          },
          required: ['supplierId', 'items']
        },

        SupplierInvoice: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            businessId: {
              type: 'string',
              format: 'uuid'
            },
            supplierId: {
              type: 'string',
              format: 'uuid'
            },
            purchaseOrderId: {
              type: 'string',
              format: 'uuid',
              description: 'ID de orden de compra relacionada'
            },
            invoiceNumber: {
              type: 'string',
              description: 'Número de factura del proveedor'
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'APPROVED', 'PAID', 'OVERDUE', 'DISPUTED', 'CANCELLED'],
              description: 'Estado de la factura'
            },
            issueDate: {
              type: 'string',
              format: 'date',
              description: 'Fecha de emisión'
            },
            dueDate: {
              type: 'string',
              format: 'date',
              description: 'Fecha de vencimiento'
            },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  description: {
                    type: 'string'
                  },
                  quantity: {
                    type: 'number'
                  },
                  unitPrice: {
                    type: 'number'
                  },
                  total: {
                    type: 'number'
                  }
                }
              },
              description: 'Items de la factura'
            },
            subtotal: {
              type: 'number'
            },
            tax: {
              type: 'number'
            },
            total: {
              type: 'number'
            },
            currency: {
              type: 'string',
              default: 'COP'
            },
            notes: {
              type: 'string'
            },
            supplier: {
              $ref: '#/components/schemas/Supplier'
            },
            payments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  amount: {
                    type: 'number'
                  },
                  paymentDate: {
                    type: 'string',
                    format: 'date'
                  },
                  paymentMethod: {
                    type: 'string'
                  },
                  reference: {
                    type: 'string'
                  }
                }
              },
              description: 'Pagos realizados'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          },
          required: ['supplierId', 'invoiceNumber', 'issueDate', 'dueDate', 'total']
        },

        SupplierEvaluation: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            supplierId: {
              type: 'string',
              format: 'uuid'
            },
            qualityScore: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
              description: 'Puntuación de calidad (1-5)'
            },
            deliveryScore: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
              description: 'Puntuación de entrega (1-5)'
            },
            serviceScore: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
              description: 'Puntuación de servicio (1-5)'
            },
            priceScore: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
              description: 'Puntuación de precio (1-5)'
            },
            averageScore: {
              type: 'number',
              description: 'Puntuación promedio calculada'
            },
            comments: {
              type: 'string',
              description: 'Comentarios sobre la evaluación'
            },
            period: {
              type: 'string',
              description: 'Período evaluado'
            },
            evaluatedBy: {
              type: 'string',
              format: 'uuid',
              description: 'Usuario que realizó la evaluación'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          },
          required: ['qualityScore', 'deliveryScore', 'serviceScore', 'priceScore']
        },

        SupplierCatalogItem: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            supplierId: {
              type: 'string',
              format: 'uuid'
            },
            supplierSku: {
              type: 'string',
              description: 'SKU del proveedor'
            },
            name: {
              type: 'string',
              description: 'Nombre del producto'
            },
            description: {
              type: 'string',
              description: 'Descripción del producto'
            },
            category: {
              type: 'string',
              description: 'Categoría del producto'
            },
            price: {
              type: 'number',
              description: 'Precio del proveedor'
            },
            currency: {
              type: 'string',
              default: 'COP'
            },
            unit: {
              type: 'string',
              description: 'Unidad de medida'
            },
            minimumOrder: {
              type: 'number',
              description: 'Cantidad mínima de pedido'
            },
            leadTime: {
              type: 'integer',
              description: 'Tiempo de entrega en días'
            },
            available: {
              type: 'boolean',
              description: 'Si está disponible',
              default: true
            },
            lastUpdate: {
              type: 'string',
              format: 'date-time',
              description: 'Última actualización del precio/disponibilidad'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          },
          required: ['supplierSku', 'name', 'price']
        },

        // 💳 ADVANCE PAYMENT SCHEMAS
        AdvancePaymentInfo: {
          type: 'object',
          properties: {
            appointmentId: {
              type: 'string',
              format: 'uuid',
              description: 'ID de la cita'
            },
            required: {
              type: 'boolean',
              description: 'Si se requiere pago adelantado'
            },
            amount: {
              type: 'number',
              description: 'Monto del pago adelantado en centavos'
            },
            percentage: {
              type: 'number',
              description: 'Porcentaje del servicio para el depósito'
            },
            status: {
              type: 'string',
              enum: ['NOT_REQUIRED', 'PENDING', 'PAID', 'FAILED', 'REFUNDED'],
              description: 'Estado del pago adelantado'
            },
            wompiReference: {
              type: 'string',
              description: 'Referencia de la transacción en Wompi'
            },
            paymentLink: {
              type: 'string',
              format: 'uri',
              description: 'Link de pago de Wompi'
            },
            wompiPublicKey: {
              type: 'string',
              description: 'Clave pública de Wompi para el checkout'
            },
            paidAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha y hora del pago'
            },
            transactionData: {
              type: 'object',
              description: 'Datos completos de la transacción de Wompi'
            }
          },
          required: ['appointmentId', 'required', 'amount', 'status']
        },

        AdvancePaymentCustomerData: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del cliente'
            },
            phone: {
              type: 'string',
              description: 'Teléfono del cliente'
            },
            fullName: {
              type: 'string',
              description: 'Nombre completo del cliente'
            },
            documentType: {
              type: 'string',
              description: 'Tipo de documento'
            },
            documentNumber: {
              type: 'string',
              description: 'Número de documento'
            }
          },
          required: ['email', 'phone', 'fullName']
        },

        AdvancePaymentConfig: {
          type: 'object',
          properties: {
            requireDeposit: {
              type: 'boolean',
              description: 'Si se requiere depósito para citas'
            },
            depositPercentage: {
              type: 'number',
              description: 'Porcentaje del servicio para depósito',
              minimum: 0,
              maximum: 100
            },
            depositMinAmount: {
              type: 'number',
              description: 'Monto mínimo de depósito en centavos'
            },
            allowPartialPayments: {
              type: 'boolean',
              description: 'Permitir pagos parciales'
            },
            autoRefundCancellations: {
              type: 'boolean',
              description: 'Reembolso automático al cancelar'
            }
          },
          required: ['requireDeposit', 'depositPercentage', 'depositMinAmount']
        },

        AdvancePaymentResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Si la operación fue exitosa'
            },
            paymentLink: {
              type: 'string',
              format: 'uri',
              description: 'URL de pago de Wompi'
            },
            wompiReference: {
              type: 'string',
              description: 'Referencia única en Wompi'
            },
            wompiPublicKey: {
              type: 'string',
              description: 'Clave pública de Wompi'
            },
            amount: {
              type: 'number',
              description: 'Monto a pagar en centavos'
            },
            expirationTime: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de expiración del link'
            }
          },
          required: ['success', 'paymentLink', 'wompiReference', 'amount']
        },

        WompiWebhookPayload: {
          type: 'object',
          properties: {
            event: {
              type: 'string',
              description: 'Tipo de evento de Wompi'
            },
            data: {
              type: 'object',
              properties: {
                transaction: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                      description: 'ID de la transacción'
                    },
                    reference: {
                      type: 'string',
                      description: 'Referencia de la transacción'
                    },
                    status: {
                      type: 'string',
                      description: 'Estado de la transacción'
                    },
                    amount_in_cents: {
                      type: 'number',
                      description: 'Monto en centavos'
                    },
                    currency: {
                      type: 'string',
                      description: 'Moneda de la transacción'
                    }
                  }
                }
              }
            },
            sent_at: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de envío del webhook'
            }
          },
          required: ['event', 'data']
        },

        // 🔐 BUSINESS VALIDATION SCHEMAS
        BusinessAccessValidation: {
          type: 'object',
          properties: {
            businessId: {
              type: 'string',
              format: 'uuid',
              description: 'ID del negocio validado'
            },
            hasAccess: {
              type: 'boolean',
              description: 'Si el usuario tiene acceso al negocio'
            },
            userRole: {
              type: 'string',
              enum: ['OWNER', 'ADMIN', 'SPECIALIST', 'RECEPTIONIST', 'VIEWER'],
              description: 'Rol del usuario en el negocio'
            },
            permissions: {
              type: 'array',
              items: {
                type: 'string',
                enum: [
                  'READ_APPOINTMENTS', 'WRITE_APPOINTMENTS', 'DELETE_APPOINTMENTS',
                  'READ_CLIENTS', 'WRITE_CLIENTS',
                  'READ_INVENTORY', 'WRITE_INVENTORY',
                  'READ_PAYMENTS', 'WRITE_PAYMENTS',
                  'READ_REPORTS', 'MANAGE_STAFF', 'MANAGE_SETTINGS',
                  'MANAGE_BILLING', 'SUPER_ADMIN'
                ]
              },
              description: 'Lista de permisos del usuario'
            },
            businessData: {
              $ref: '#/components/schemas/BusinessBasicInfo'
            },
            restrictions: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/AccessRestriction'
              },
              description: 'Restricciones de acceso aplicables'
            }
          },
          required: ['businessId', 'hasAccess', 'userRole', 'permissions']
        },

        BusinessBasicInfo: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID del negocio'
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
              description: 'Teléfono del negocio'
            },
            address: {
              type: 'string',
              description: 'Dirección del negocio'
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'SUSPENDED', 'TRIAL', 'EXPIRED', 'PENDING_SETUP'],
              description: 'Estado del negocio'
            },
            planType: {
              type: 'string',
              description: 'Tipo de plan contratado'
            },
            subscriptionStatus: {
              type: 'string',
              description: 'Estado de la suscripción'
            }
          },
          required: ['id', 'name', 'email', 'status']
        },

        AccessRestriction: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['TIME_LIMIT', 'IP_RESTRICTION', 'FEATURE_LIMIT'],
              description: 'Tipo de restricción'
            },
            description: {
              type: 'string',
              description: 'Descripción de la restricción'
            },
            active: {
              type: 'boolean',
              description: 'Si la restricción está activa'
            },
            metadata: {
              type: 'object',
              description: 'Metadatos adicionales de la restricción'
            }
          },
          required: ['type', 'description', 'active']
        },

        AccessibleBusiness: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID del negocio'
            },
            name: {
              type: 'string',
              description: 'Nombre del negocio'
            },
            role: {
              type: 'string',
              enum: ['OWNER', 'ADMIN', 'SPECIALIST', 'RECEPTIONIST', 'VIEWER'],
              description: 'Rol del usuario en este negocio'
            },
            permissions: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Permisos en este negocio'
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'SUSPENDED', 'TRIAL', 'EXPIRED', 'PENDING_SETUP'],
              description: 'Estado del negocio'
            },
            lastAccessed: {
              type: 'string',
              format: 'date-time',
              description: 'Último acceso al negocio'
            },
            isActive: {
              type: 'boolean',
              description: 'Si es el negocio actualmente activo'
            }
          },
          required: ['id', 'name', 'role', 'permissions', 'status']
        },

        BusinessValidationRequest: {
          type: 'object',
          properties: {
            businessId: {
              type: 'string',
              format: 'uuid',
              description: 'ID del negocio a validar'
            },
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'ID del usuario (opcional)'
            },
            requestedAction: {
              type: 'string',
              description: 'Acción que se desea realizar'
            },
            requestedResource: {
              type: 'string',
              description: 'Recurso sobre el que se actúa'
            }
          },
          required: ['businessId']
        },

        BusinessPermissionCheck: {
          type: 'object',
          properties: {
            businessId: {
              type: 'string',
              format: 'uuid',
              description: 'ID del negocio'
            },
            permission: {
              type: 'string',
              description: 'Permiso a verificar'
            },
            hasPermission: {
              type: 'boolean',
              description: 'Si el usuario tiene el permiso'
            },
            reason: {
              type: 'string',
              description: 'Razón del resultado'
            }
          },
          required: ['businessId', 'permission', 'hasPermission']
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
        name: 'Business Config - Services',
        description: 'Gestión completa de servicios del negocio - CRUD, categorías, comisiones, imágenes y estadísticas'
      },
      {
        name: 'Business Inventory',
        description: 'Gestión completa de inventario - Productos, stock, movimientos, categorías, reportes y alertas'
      },
      {
        name: '🏪 Negocio',
        description: 'Endpoints para gestión interna de negocios'
      },
      {
        name: '💳 Pagos Adelantados',
        description: 'Sistema de pagos adelantados con Wompi - Verificación, iniciación, estado y webhooks'
      },
      {
        name: '🔐 Validación de Business',
        description: 'Sistema de validación multitenancy - Acceso, permisos y seguridad entre negocios'
      }
    ]
  },
  // In development only parse controller files to avoid parsing large/fragile JSDoc in routes
  apis: isDev ? [
    './src/controllers/*.js'
  ] : defaultApis
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