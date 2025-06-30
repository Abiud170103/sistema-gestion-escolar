const nodemailer = require('nodemailer');
const config = require('../config/config');

// Configuración del transporter de correo
// Para pruebas usamos un servicio como Gmail o Ethereal Email
// En producción deberías usar un servicio dedicado como SendGrid, AWS SES, etc.
const createTransporter = () => {
  // Configuración para Gmail (requiere contraseña de aplicación)
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // Contraseña de aplicación, no la contraseña normal
      },
    });
  }
    // Configuración para Ethereal Email (para pruebas)
  // Ethereal genera cuentas temporales para testing
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || 'ethereal.user@ethereal.email',
      pass: process.env.EMAIL_PASSWORD || 'ethereal.pass',
    },
  });
};

/**
 * Genera una contraseña temporal de 8 caracteres
 * Formato: 4 letras + 4 números (ej: ABCD1234)
 */
const generateTempPassword = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  
  let tempPassword = '';
  
  // 4 letras
  for (let i = 0; i < 4; i++) {
    tempPassword += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  
  // 4 números
  for (let i = 0; i < 4; i++) {
    tempPassword += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  
  return tempPassword;
};

/**
 * Genera el usuario para el padre basado en matrícula del estudiante + homoclave
 * @param {string} matricula - Matrícula del estudiante
 * @param {string} homoclave - Homoclave del padre
 * @returns {string} Usuario generado
 */
const generateParentUsername = (matricula, homoclave) => {
  return `${matricula}${homoclave}`;
};

/**
 * Envía un correo de bienvenida a un padre recién registrado
 * @param {Object} padreInfo - Información del padre
 * @param {string} padreInfo.nombre - Nombre del padre
 * @param {string} padreInfo.correo - Correo del padre
 * @param {string} padreInfo.usuario - Usuario generado para el padre
 * @param {string} padreInfo.tempPassword - Contraseña temporal
 * @param {string} padreInfo.estudianteNombre - Nombre del estudiante
 * @param {string} padreInfo.matricula - Matrícula del estudiante
 */
const sendWelcomeEmail = async (padreInfo) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Sistema Escolar" <sistema@escuela.edu.mx>',
      to: padreInfo.correo,
      subject: '🎓 Bienvenido al Sistema Escolar - Credenciales de Acceso',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c5aa0; margin-bottom: 10px;">🎓 Sistema Escolar</h1>
            <p style="color: #666; font-size: 16px;">Bienvenido al portal de padres de familia</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
            <h2 style="color: #2c5aa0; margin-top: 0;">Hola ${padreInfo.nombre},</h2>
            <p>Su registro como padre/tutor de <strong>${padreInfo.estudianteNombre}</strong> (Matrícula: <strong>${padreInfo.matricula}</strong>) ha sido completado exitosamente.</p>
          </div>
          
          <div style="background-color: #e3f2fd; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
            <h3 style="color: #1976d2; margin-top: 0;">📧 Sus credenciales de acceso:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">Usuario:</td>
                <td style="padding: 8px 0; font-family: 'Courier New', monospace; background-color: white; padding: 4px 8px; border-radius: 4px;"><strong>${padreInfo.usuario}</strong></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">Contraseña temporal:</td>
                <td style="padding: 8px 0; font-family: 'Courier New', monospace; background-color: white; padding: 4px 8px; border-radius: 4px;"><strong>${padreInfo.tempPassword}</strong></td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107; margin-bottom: 20px;">
            <h4 style="color: #856404; margin-top: 0;">⚠️ Importante - Cambio de contraseña requerido</h4>
            <ul style="color: #856404; margin: 0; padding-left: 20px;">
              <li>Esta contraseña es <strong>temporal</strong> y debe cambiarla en su primer inicio de sesión</li>
              <li>Tiene <strong>3 días</strong> para acceder al sistema y cambiar su contraseña</li>
              <li>Después de 3 días, deberá contactar al administrador para reactivar su cuenta</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="background-color: #2c5aa0; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              🔑 Acceder al Sistema
            </a>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin-top: 20px;">
            <h4 style="color: #495057; margin-top: 0;">¿Qué puede hacer en el sistema?</h4>
            <ul style="color: #6c757d; margin: 0; padding-left: 20px;">
              <li>Consultar las calificaciones de su hijo/a</li>
              <li>Revisar la asistencia y justificar faltas</li>
              <li>Ver el horario escolar</li>
              <li>Consultar incidencias y reportes</li>
              <li>Información sobre talleres</li>
            </ul>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <div style="text-align: center; color: #6c757d; font-size: 14px;">
            <p>Si tiene problemas para acceder, contacte al administrador del sistema.</p>
            <p style="margin-top: 20px;"><strong>Sistema Escolar</strong><br>
            <em>Este correo fue enviado automáticamente, por favor no responda.</em></p>
          </div>
        </div>
      `,
      text: `
        Sistema Escolar - Credenciales de Acceso
        
        Hola ${padreInfo.nombre},
        
        Su registro como padre/tutor de ${padreInfo.estudianteNombre} (Matrícula: ${padreInfo.matricula}) ha sido completado.
        
        Sus credenciales de acceso:
        Usuario: ${padreInfo.usuario}
        Contraseña temporal: ${padreInfo.tempPassword}
        
        IMPORTANTE:
        - Esta contraseña es temporal y debe cambiarla en su primer inicio de sesión
        - Tiene 3 días para acceder al sistema y cambiar su contraseña
        - Después de 3 días, deberá contactar al administrador
        
        Acceda al sistema en: ${process.env.FRONTEND_URL || 'http://localhost:3000'}
        
        Sistema Escolar
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Correo enviado:', info.messageId);
    
    // Para Ethereal Email, mostrar la URL de preview
    if (process.env.EMAIL_SERVICE !== 'gmail') {
      console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info)
    };
    
  } catch (error) {
    console.error('❌ Error enviando correo:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  generateTempPassword,
  generateParentUsername,
  sendWelcomeEmail
};
