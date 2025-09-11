Beauty Control - Sistema de Gestión de Negocios
1️⃣ Descripción general

Beauty Control (BC) desarrollará un sistema de gestión para negocios de estética y bienestar, donde cada suscriptor (negocio) pueda manejar clientes, agenda de turnos, empleados, procedimientos, inventario, ventas y finanzas. Además, BC gestionará suscripciones y módulos de manera centralizada.

El sistema será una aplicación web (React + Tailwind) y eventualmente se podrá migrar a app móvil (React Native). Redux Toolkit se usará en ambos frentes para manejar el estado compartido.

2️⃣ Roles de usuario

Owner (BC)

Administra suscripciones y planes de negocio.

Define módulos disponibles (agenda, facturación, Wompi, balance, inventario, etc.).

Visualiza métricas globales y movimientos de todos los negocios.

Business / Suscriptor

Accede a los módulos contratados según su plan.

Administra su negocio: empleados, procedimientos, clientes.

Configura reglas de negocio (por ejemplo, permisos para cerrar turnos sin pago o sin consentimiento).

Visualiza balances, movimientos financieros, inventario y reportes.

Specialist

Gestiona su propia agenda y turnos.

Registra procedimientos realizados.

Sube evidencia multimedia (fotos, videos) y PDFs de consentimiento.

Puede registrar pagos o cerrar turno sin pago según reglas del negocio.

Puede vender productos de su negocio.

Receptionist

Acceso a agenda de todos los especialistas del negocio.

Puede registrar procedimientos y pagos, igual que un especialista.

Client (final)

Agenda turnos según disponibilidad.

Puede cancelar turnos indicando motivo, quedando bloqueado para nuevos turnos si existe cancelación pendiente.

3️⃣ Modelos principales
3.1 Negocio y suscripciones

Business: información del negocio, logo, estado.

SubscriptionPlan: define planes con precio y duración.

Module: representa un módulo funcional (agenda, facturación, inventario, Wompi, etc.).

PlanModule: tabla intermedia para relacionar planes con módulos.

BusinessSubscription: suscripción activa de un negocio a un plan.

3.2 Reglas y configuración del negocio

BusinessRules: reglas personalizables por negocio, incluyen:

allowCloseWithoutPayment → cerrar turno sin pago

enableCancellation → permitir cancelación de turnos

autoRefundOnCancel → devolver dinero automáticamente

createVoucherOnCancel → generar voucher

allowCloseWithoutConsent → cerrar turno sin consentimiento

cancellationPolicy → políticas de cancelación adicionales

3.3 Clientes y agenda

Client: información de clientes finales.

BusinessClient: relación entre cliente y negocio, permite que un cliente esté en varios negocios pero cada negocio vea solo su propia información.

Appointment: agenda de turnos con:

especialista asignado

estado (PENDING, COMPLETED, CANCELED)

pago (PENDING, PAID)

evidencia multimedia y PDFs de consentimiento

motivo y fecha de cancelación

ClientHistory: registro histórico de servicios, procedimientos, pagos, evidencia y consentimiento, filtrado por negocio.

3.4 Servicios y productos

Service: define procedimientos o actividades del negocio:

precio, duración

si requiere consentimiento (requiresConsent)

Product: productos de venta o consumibles

InventoryMovement: movimientos de inventario registrados por usuarios del negocio

3.5 Finanzas

FinancialMovement: registro de todo movimiento de dinero (gastos, compras, ventas de servicios/productos)

incluye usuario que lo realizó

método de pago

link a comprobante o voucher

PaymentIntegration: configuración de integraciones externas (Wompi, Taxxa, etc.)

4️⃣ Reglas de negocio clave

Cierre de turno sin pago

Permitido según BusinessRules.allowCloseWithoutPayment.

El especialista recibe alerta si intenta cerrar turno sin pago.

Cancelación de turnos por cliente

Habilitada según BusinessRules.enableCancellation.

Cliente debe indicar motivo.

Mientras exista un turno cancelado pendiente, no puede agendar nuevos turnos.

Posibilidad de devolución automática o voucher según reglas.

Consentimiento para procedimientos

Cada procedimiento puede requerir consentimiento (Service.requiresConsent).

Negocio puede permitir cerrar turno sin consentimiento (BusinessRules.allowCloseWithoutConsent).

Especialista recibe alerta si el turno se cierra sin consentimiento requerido.

Historia del cliente

Cada cliente puede tener múltiples negocios.

Cada negocio ve solo la historia de servicios realizada en su negocio.

Turnos completados o cancelados quedan registrados con evidencia y pagos.

5️⃣ Consideraciones técnicas

Tenancy: todo filtrado por businessId para aislar datos de cada negocio.

Cloudinary: almacenamiento de imágenes, videos y PDFs (consentimientos, evidencias, logos).

Flexibilidad: nuevas reglas o módulos se agregan sin tocar código mediante BusinessRules y módulos dinámicos.

Frontend/Backend: React + Tailwind, React Native para app, Node.js + Express + Sequelize para backend.

Redux compartido entre web y app para manejo de estado global.