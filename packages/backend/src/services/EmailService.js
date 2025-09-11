const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * Servicio de Email para Beauty Control
 * Maneja el envío de emails usando nodemailer
 */
class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true para 465, false para otros puertos
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false // Para desarrollo
      }
    });

    // Verificar conexión al inicializar
    this.verifyConnection();
  }

  /**
   * Verificar la conexión SMTP
   */
  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Servicio de email configurado correctamente');
    } catch (error) {
      console.error('❌ Error en configuración de email:', error.message);
    }
  }

  /**
   * Enviar email de recuperación de contraseña
   * @param {string} to - Email del destinatario
   * @param {string} firstName - Nombre del usuario
   * @param {string} resetToken - Token de recuperación
   * @param {string} resetUrl - URL completa para resetear
   */
  async sendPasswordResetEmail(to, firstName, resetToken, resetUrl) {
    const subject = '🔐 Beauty Control - Recuperación de Contraseña';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperación de Contraseña - Beauty Control</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
          .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .button:hover { background: #5a6fd8; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; border-radius: 0 0 10px 10px; }
          .token-box { background: #f8f9fa; border: 2px dashed #667eea; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 16px; text-align: center; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎀 Beauty Control</h1>
            <p>Sistema de Gestión de Negocios de Belleza</p>
          </div>
          
          <div class="content">
            <h2>¡Hola ${firstName}! 👋</h2>
            
            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en Beauty Control.</p>
            
            <p>Si fuiste tú quien solicitó este cambio, puedes crear una nueva contraseña haciendo clic en el siguiente botón:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">🔑 Restablecer Mi Contraseña</a>
            </div>
            
            <div class="warning">
              <strong>⚠️ Importante:</strong>
              <ul>
                <li>Este enlace es válido por <strong>1 hora</strong></li>
                <li>Solo puede usarse una vez</li>
                <li>Si no solicitaste este cambio, ignora este email</li>
              </ul>
            </div>
            
            <p>Si el botón no funciona, puedes copiar y pegar este enlace en tu navegador:</p>
            <div class="token-box">
              ${resetUrl}
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;">
            
            <p><strong>¿No solicitaste este cambio?</strong></p>
            <p>Tu cuenta está segura. Simplemente ignora este email y tu contraseña no será modificada.</p>
          </div>
          
          <div class="footer">
            <p><strong>Beauty Control</strong> - Sistema de Gestión de Negocios de Belleza</p>
            <p>📧 Soporte: ${process.env.BC_ADMIN_EMAIL}</p>
            <p>🌐 ${process.env.FRONTEND_URL}</p>
            <hr style="margin: 15px 0; border: none; border-top: 1px solid #ddd;">
            <p style="font-size: 12px; color: #999;">
              Este es un email automático, por favor no responder directamente.<br>
              © ${new Date().getFullYear()} Beauty Control. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      Beauty Control - Recuperación de Contraseña
      
      Hola ${firstName}!
      
      Recibimos una solicitud para restablecer la contraseña de tu cuenta en Beauty Control.
      
      Para crear una nueva contraseña, visita el siguiente enlace:
      ${resetUrl}
      
      IMPORTANTE:
      - Este enlace es válido por 1 hora
      - Solo puede usarse una vez
      - Si no solicitaste este cambio, ignora este email
      
      ¿No solicitaste este cambio?
      Tu cuenta está segura. Simplemente ignora este email y tu contraseña no será modificada.
      
      --
      Beauty Control
      Soporte: ${process.env.BC_ADMIN_EMAIL}
      ${process.env.FRONTEND_URL}
    `;

    return await this.sendEmail(to, subject, textContent, htmlContent);
  }

  /**
   * Enviar email de confirmación de cambio de contraseña
   * @param {string} to - Email del destinatario
   * @param {string} firstName - Nombre del usuario
   */
  async sendPasswordChangedConfirmation(to, firstName) {
    const subject = '✅ Beauty Control - Contraseña Actualizada';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Contraseña Actualizada - Beauty Control</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #00b894 0%, #00a085 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
          .success { background: #d1edff; border: 1px solid #74b9ff; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎀 Beauty Control</h1>
            <p>Sistema de Gestión de Negocios de Belleza</p>
          </div>
          
          <div class="content">
            <h2>¡Contraseña Actualizada! ✅</h2>
            
            <p>Hola ${firstName},</p>
            
            <div class="success">
              <strong>🎉 ¡Perfecto!</strong><br>
              Tu contraseña ha sido actualizada exitosamente.
            </div>
            
            <p>Tu cuenta en Beauty Control ahora está protegida con tu nueva contraseña.</p>
            
            <p><strong>Detalles de la actualización:</strong></p>
            <ul>
              <li>📅 Fecha: ${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}</li>
              <li>🔐 Tipo: Cambio de contraseña exitoso</li>
              <li>✅ Estado: Completado</li>
            </ul>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;">
            
            <p><strong>¿No fuiste tú?</strong></p>
            <p>Si no cambiaste tu contraseña, contacta inmediatamente nuestro soporte:</p>
            <p>📧 ${process.env.BC_ADMIN_EMAIL}</p>
          </div>
          
          <div class="footer">
            <p><strong>Beauty Control</strong> - Sistema de Gestión de Negocios de Belleza</p>
            <p>📧 Soporte: ${process.env.BC_ADMIN_EMAIL}</p>
            <p>🌐 ${process.env.FRONTEND_URL}</p>
            <hr style="margin: 15px 0; border: none; border-top: 1px solid #ddd;">
            <p style="font-size: 12px; color: #999;">
              Este es un email automático, por favor no responder directamente.<br>
              © ${new Date().getFullYear()} Beauty Control. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      Beauty Control - Contraseña Actualizada
      
      Hola ${firstName},
      
      Tu contraseña ha sido actualizada exitosamente.
      
      Detalles:
      - Fecha: ${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}
      - Tipo: Cambio de contraseña exitoso
      - Estado: Completado
      
      ¿No fuiste tú?
      Si no cambiaste tu contraseña, contacta inmediatamente nuestro soporte:
      ${process.env.BC_ADMIN_EMAIL}
      
      --
      Beauty Control
      ${process.env.FRONTEND_URL}
    `;

    return await this.sendEmail(to, subject, textContent, htmlContent);
  }

  /**
   * Enviar email genérico
   * @param {string} to - Email del destinatario
   * @param {string} subject - Asunto del email
   * @param {string} text - Contenido en texto plano
   * @param {string} html - Contenido en HTML
   */
  async sendEmail(to, subject, text, html) {
    try {
      const mailOptions = {
        from: `"Beauty Control" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        html
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log('✅ Email enviado exitosamente:', {
        to,
        subject,
        messageId: result.messageId
      });

      return {
        success: true,
        messageId: result.messageId,
        message: 'Email enviado exitosamente'
      };

    } catch (error) {
      console.error('❌ Error enviando email:', error);
      
      return {
        success: false,
        error: error.message,
        message: 'Error al enviar email'
      };
    }
  }
}

// Exportar instancia singleton
const emailService = new EmailService();
module.exports = emailService;