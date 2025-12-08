import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const TermsOfService = () => {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Términos de Servicio
          </h1>
          <p className="text-gray-600 mb-8">
            Última actualización: 23 de noviembre de 2025
          </p>

          {/* Sección 1 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. Aceptación de los Términos
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Al acceder y utilizar Control de Negocios ("el Servicio"), usted acepta estar sujeto a estos Términos de Servicio. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestro servicio.
            </p>
          </section>

          {/* Sección 2 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. Descripción del Servicio
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Control de Negocios es una plataforma de gestión empresarial diseñada para salones de belleza y negocios de servicios. Ofrecemos herramientas para:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Gestión de agenda y citas</li>
              <li>Administración de clientes</li>
              <li>Control de ventas y pagos</li>
              <li>Generación de reportes y estadísticas</li>
              <li>Gestión de inventario</li>
            </ul>
          </section>

          {/* Sección 3 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. Registro y Cuenta
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Para utilizar el Servicio, debe:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Proporcionar información precisa y completa durante el registro</li>
              <li>Mantener la seguridad de su cuenta y contraseña</li>
              <li>Ser mayor de 18 años o tener autorización de un tutor legal</li>
              <li>Notificar inmediatamente cualquier uso no autorizado de su cuenta</li>
            </ul>
          </section>

          {/* Sección 4 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. Suscripciones y Pagos
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              El Servicio ofrece planes de suscripción mensuales o anuales. Al suscribirse, usted acepta:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Los pagos se procesan de forma automática según el plan seleccionado</li>
              <li>Los precios pueden variar y serán notificados con anticipación</li>
              <li>Las renovaciones son automáticas salvo cancelación previa</li>
              <li>Los reembolsos se procesarán según nuestra política de devoluciones</li>
            </ul>
          </section>

          {/* Sección 5 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              5. Uso Aceptable
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Usted se compromete a NO:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Utilizar el Servicio para actividades ilegales o fraudulentas</li>
              <li>Intentar acceder a cuentas de otros usuarios</li>
              <li>Transmitir virus, malware o código malicioso</li>
              <li>Realizar ingeniería inversa del software</li>
              <li>Sobrecargar o interferir con los servidores del Servicio</li>
            </ul>
          </section>

          {/* Sección 6 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              6. Propiedad Intelectual
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Todo el contenido, diseño, logotipos y marcas del Servicio son propiedad de Control de Negocios o sus licenciantes. Los datos que usted ingresa permanecen de su propiedad, pero nos concede una licencia para procesarlos y brindar el Servicio.
            </p>
          </section>

          {/* Sección 7 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              7. Privacidad y Protección de Datos
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Nos comprometemos a proteger su privacidad. Para más información, consulte nuestra{' '}
              <Link to="/privacidad" className="text-pink-600 hover:text-pink-700 font-medium">
                Política de Privacidad
              </Link>
              .
            </p>
          </section>

          {/* Sección 8 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              8. Limitación de Responsabilidad
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              El Servicio se proporciona "tal cual". No garantizamos que estará libre de errores o interrupciones. No seremos responsables por:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Pérdida de datos o información</li>
              <li>Daños indirectos o consecuentes</li>
              <li>Interrupciones del servicio por mantenimiento</li>
              <li>Errores en cálculos o reportes generados</li>
            </ul>
          </section>

          {/* Sección 9 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              9. Cancelación y Terminación
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Puede cancelar su suscripción en cualquier momento desde la configuración de su cuenta. Nos reservamos el derecho de suspender o terminar su cuenta si viola estos términos.
            </p>
          </section>

          {/* Sección 10 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              10. Modificaciones
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Podemos actualizar estos Términos ocasionalmente. Le notificaremos cambios significativos por correo electrónico o mediante aviso en la aplicación.
            </p>
          </section>

          {/* Sección 11 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              11. Ley Aplicable
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Estos Términos se rigen por las leyes de Argentina. Cualquier disputa será resuelta en los tribunales competentes de Buenos Aires, Argentina.
            </p>
          </section>

          {/* Sección 12 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              12. Contacto
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Para preguntas sobre estos Términos, contáctenos en:
            </p>
            <ul className="list-none text-gray-700 space-y-2 ml-4">
              <li><strong>Email:</strong> soporte@controldenegocios.com</li>
              <li><strong>Web:</strong> https://controldenegocios.com/contacto</li>
            </ul>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-gray-600">
          <p>© 2025 Control de Negocios. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default TermsOfService;
