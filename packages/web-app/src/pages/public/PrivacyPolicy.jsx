import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-pink-600 hover:text-pink-700 font-medium"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Volver al inicio
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          <div className="flex items-center mb-4">
            <ShieldCheckIcon className="h-10 w-10 text-pink-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">
              Política de Privacidad
            </h1>
          </div>
          <p className="text-gray-600 mb-8">
            Última actualización: 23 de noviembre de 2025
          </p>

          {/* Resumen destacado */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8">
            <p className="text-gray-800">
              <strong>Resumen:</strong> Valoramos su privacidad. Esta política explica qué información recopilamos, cómo la usamos y sus derechos sobre sus datos.
            </p>
          </div>

          {/* Sección 1 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. Información que Recopilamos
            </h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">
              1.1 Información de Registro
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Nombre y apellidos</li>
              <li>Correo electrónico</li>
              <li>Número de teléfono</li>
              <li>Información del negocio (nombre, dirección, tipo)</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">
              1.2 Información de Uso
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Datos de clientes que usted ingresa</li>
              <li>Citas y servicios registrados</li>
              <li>Transacciones y pagos</li>
              <li>Registros de inventario y productos</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">
              1.3 Información Técnica
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Dirección IP y ubicación aproximada</li>
              <li>Tipo de dispositivo y sistema operativo</li>
              <li>Navegador utilizado</li>
              <li>Cookies y datos de sesión</li>
            </ul>
          </section>

          {/* Sección 2 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. Cómo Usamos su Información
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Utilizamos sus datos para:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Proveer el Servicio:</strong> Gestionar su cuenta, agenda, clientes y reportes</li>
              <li><strong>Comunicación:</strong> Enviar notificaciones, recordatorios y actualizaciones</li>
              <li><strong>Facturación:</strong> Procesar pagos y generar facturas</li>
              <li><strong>Mejoras:</strong> Analizar uso para mejorar funcionalidades</li>
              <li><strong>Soporte:</strong> Responder consultas y resolver problemas técnicos</li>
              <li><strong>Seguridad:</strong> Detectar y prevenir fraudes o uso indebido</li>
            </ul>
          </section>

          {/* Sección 3 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. Base Legal del Procesamiento
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Procesamos sus datos bajo las siguientes bases legales:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Contrato:</strong> Para cumplir con el servicio que contrató</li>
              <li><strong>Consentimiento:</strong> Cuando usted nos autoriza expresamente</li>
              <li><strong>Interés Legítimo:</strong> Para mejorar el servicio y prevenir fraudes</li>
              <li><strong>Obligación Legal:</strong> Cuando sea requerido por ley (registros fiscales, etc.)</li>
            </ul>
          </section>

          {/* Sección 4 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. Compartir Información
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong className="text-pink-600">NO vendemos sus datos personales.</strong> Podemos compartir información con:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Proveedores de Servicios:</strong> Hosting, procesadores de pago, servicios de email</li>
              <li><strong>Requisitos Legales:</strong> Si es requerido por ley o autoridades competentes</li>
              <li><strong>Transferencia de Negocio:</strong> En caso de fusión o adquisición (con notificación previa)</li>
            </ul>
          </section>

          {/* Sección 5 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              5. Seguridad de Datos
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Implementamos medidas de seguridad para proteger su información:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Encriptación SSL/TLS para transmisión de datos</li>
              <li>Almacenamiento seguro con respaldos regulares</li>
              <li>Acceso restringido solo a personal autorizado</li>
              <li>Autenticación de dos factores disponible</li>
              <li>Monitoreo continuo de seguridad</li>
            </ul>
          </section>

          {/* Sección 6 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              6. Retención de Datos
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Mantenemos sus datos mientras:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Su cuenta esté activa</li>
              <li>Sea necesario para proveer el servicio</li>
              <li>Sea requerido por obligaciones legales o fiscales</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4 mb-4">
              Después de cancelar su cuenta, conservamos datos por:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>30 días para recuperación de cuenta</li>
              <li>Hasta 5 años para registros fiscales (según legislación local)</li>
            </ul>
          </section>

          {/* Sección 7 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              7. Sus Derechos
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Usted tiene derecho a:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Acceso:</strong> Solicitar una copia de sus datos personales</li>
              <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos</li>
              <li><strong>Eliminación:</strong> Solicitar la eliminación de sus datos</li>
              <li><strong>Portabilidad:</strong> Exportar sus datos en formato legible</li>
              <li><strong>Oposición:</strong> Oponerse al procesamiento de sus datos</li>
              <li><strong>Restricción:</strong> Limitar el uso de sus datos</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Para ejercer estos derechos, contáctenos en:{' '}
              <a href="mailto:privacidad@controldenegocios.com" className="text-pink-600 hover:text-pink-700 font-medium">
                privacidad@controldenegocios.com
              </a>
            </p>
          </section>

          {/* Sección 8 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              8. Cookies y Tecnologías Similares
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Utilizamos cookies para:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Mantener su sesión activa</li>
              <li>Recordar sus preferencias</li>
              <li>Analizar el uso del servicio</li>
              <li>Mejorar la experiencia del usuario</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Puede configurar su navegador para rechazar cookies, pero esto puede limitar algunas funcionalidades.
            </p>
          </section>

          {/* Sección 9 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              9. Transferencias Internacionales
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Sus datos pueden ser procesados en servidores ubicados fuera de su país. Garantizamos que cualquier transferencia cumple con las leyes de protección de datos aplicables y utilizamos cláusulas contractuales estándar cuando sea necesario.
            </p>
          </section>

          {/* Sección 10 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              10. Privacidad de Menores
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Nuestro servicio no está dirigido a menores de 18 años. No recopilamos intencionalmente información de menores. Si descubrimos que hemos recopilado datos de un menor, los eliminaremos de inmediato.
            </p>
          </section>

          {/* Sección 11 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              11. Cambios en esta Política
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Podemos actualizar esta Política de Privacidad ocasionalmente. Le notificaremos cambios significativos por:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Correo electrónico a su cuenta registrada</li>
              <li>Aviso destacado en la aplicación</li>
              <li>Actualización de la fecha en esta página</li>
            </ul>
          </section>

          {/* Sección 12 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              12. Contacto
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Para preguntas sobre privacidad o ejercer sus derechos:
            </p>
            <ul className="list-none text-gray-700 space-y-2 ml-4">
              <li>
                <strong>Email:</strong>{' '}
                <a href="mailto:privacidad@controldenegocios.com" className="text-pink-600 hover:text-pink-700">
                  privacidad@controldenegocios.com
                </a>
              </li>
              <li>
                <strong>Soporte:</strong>{' '}
                <a href="mailto:soporte@controldenegocios.com" className="text-pink-600 hover:text-pink-700">
                  soporte@controldenegocios.com
                </a>
              </li>
              <li><strong>Web:</strong> https://controldenegocios.com/contacto</li>
            </ul>
          </section>

          {/* Sección 13 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              13. Cumplimiento Legal
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Esta política cumple con:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>GDPR (Reglamento General de Protección de Datos - UE)</li>
              <li>CCPA (California Consumer Privacy Act - USA)</li>
              <li>Ley de Protección de Datos Personales de Argentina</li>
            </ul>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-gray-600">
          <p>© 2025 Control de Negocios. Todos los derechos reservados.</p>
          <div className="mt-2">
            <Link to="/terminos" className="text-pink-600 hover:text-pink-700 mx-2">
              Términos de Servicio
            </Link>
            |
            <Link to="/privacidad" className="text-pink-600 hover:text-pink-700 mx-2">
              Política de Privacidad
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
