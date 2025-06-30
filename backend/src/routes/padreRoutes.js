const express = require('express');
const router = express.Router();
const db = require('../config/db');
const checkRole = require('../middlewares/checkRole');
const auth = require('../middlewares/auth');
const bcrypt = require('bcryptjs');
const emailService = require('../services/emailService');

// Registrar un padre/tutor (ejemplo de endpoint)
router.post('/', auth, checkRole(['admin']), async (req, res) => {
  const { id_usuario, estudiante_id, homoclave } = req.body;
  if (!id_usuario || !estudiante_id || !homoclave) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }
  // Validar formato de homoclave: 3 caracteres, puede ser 1 dígito y 2 letras o 2 letras y 1 dígito
  if (!/^((\d[A-Za-z]{2})|([A-ZaZ]{2}\d))$/.test(homoclave)) {
    return res.status(400).json({ error: 'Formato de homoclave inválido (debe ser 1 dígito y 2 letras o 2 letras y 1 dígito, ejemplo: 1AB o AB2)' });
  }
  try {
    // Validar existencia de usuario
    const usuario = await db.query('SELECT 1 FROM usuario WHERE id_usuario = $1', [id_usuario]);
    if (usuario.rows.length === 0) {
      return res.status(404).json({ error: 'El usuario asociado no existe. Primero crea el usuario antes de registrar al tutor.' });
    }
    // Validar existencia de estudiante
    const estudiante = await db.query('SELECT 1 FROM estudiante WHERE id_usuario = $1', [estudiante_id]);
    if (estudiante.rows.length === 0) {
      return res.status(404).json({ error: 'El estudiante asociado no existe.' });
    }
    // ...insertar tutor...
    const result = await db.query(
      'INSERT INTO padre (id_usuario, estudiante_id, homoclave) VALUES ($1, $2, $3) RETURNING *',
      [id_usuario, estudiante_id, homoclave]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al registrar tutor:', error);
    res.status(500).json({ error: 'Error al registrar tutor', detalle: error.message });
  }
});

// Registrar usuario y tutor en un solo flujo con envío de correo
router.post('/completo', async (req, res) => {
  const { nombre, correo, estudiante_id, homoclave } = req.body;
  if (!nombre || !correo || !estudiante_id || !homoclave) {
    return res.status(400).json({ error: 'Faltan datos requeridos: nombre, correo, estudiante_id, homoclave' });
  }
  
  // Validar formato de correo
  const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!emailRegex.test(correo)) {
    return res.status(400).json({ error: 'Correo electrónico no válido' });
  }
  
  // Validar formato de homoclave
  if (!/^((\d[A-Za-z]{2})|([A-Za-z]{2}\d))$/.test(homoclave)) {
    return res.status(400).json({ error: 'Formato de homoclave inválido (debe ser 1 dígito y 2 letras o 2 letras y 1 dígito, ejemplo: 1AB o AB2)' });
  }
  
  try {
    // Validar unicidad de correo
    const existeCorreo = await db.query('SELECT 1 FROM usuario WHERE correo = $1', [correo]);
    if (existeCorreo.rows.length > 0) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }
    
    // Validar existencia de estudiante y obtener su información
    const estudianteResult = await db.query(`
      SELECT e.id_usuario, e.matricula, u.nombre as estudiante_nombre
      FROM estudiante e
      JOIN usuario u ON e.id_usuario = u.id_usuario
      WHERE e.id_usuario = $1
    `, [estudiante_id]);
    
    if (estudianteResult.rows.length === 0) {
      return res.status(404).json({ error: 'El estudiante asociado no existe.' });
    }
    
    const estudiante = estudianteResult.rows[0];
    
    // Generar usuario y contraseña temporal
    const usuario = emailService.generateParentUsername(estudiante.matricula, homoclave);
    const tempPassword = emailService.generateTempPassword();
    
    // Validar que el usuario generado no exista
    const existeUsuario = await db.query('SELECT 1 FROM usuario WHERE usuario = $1', [usuario]);
    if (existeUsuario.rows.length > 0) {
      return res.status(409).json({ error: 'El usuario generado ya existe. Verifique la matrícula y homoclave.' });
    }    // Calcular fecha de expiración (3 días)
    const fechaExpiracion = new Date();
    fechaExpiracion.setDate(fechaExpiracion.getDate() + 3);
    
    // Crear usuario con contraseña temporal (para login)
    const usuarioResult = await db.query(`
      INSERT INTO usuario (
        usuario, nombre, correo, contrasena, rol, 
        temp_password, temp_password_expires, 
        password_change_required, first_login
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING id_usuario
    `, [
      usuario, nombre, correo, tempPassword, 'padre', 
      tempPassword, fechaExpiracion, 
      true, true
    ]);
    
    const id_usuario = usuarioResult.rows[0].id_usuario;
    console.log('🔍 ID usuario creado:', id_usuario);
    
    // Crear registro en tabla padre usando el MISMO id_usuario
    const padreResult = await db.query(`
      INSERT INTO padre (id_usuario, nombre, correo, contrasena) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id_usuario
    `, [id_usuario, nombre, correo, tempPassword]);
    
    const id_padre = padreResult.rows[0].id_usuario;
    console.log('🔍 ID padre creado:', id_padre);
    console.log('🔍 Intentando crear relación padre-estudiante:', { id_padre, estudiante_id });
    
    // Crear relación padre-estudiante
    await db.query(`
      INSERT INTO padre_estudiante (id_padre, id_estudiante) 
      VALUES ($1, $2)
    `, [id_padre, estudiante_id]);
    
    // Preparar información para el correo
    const padreInfo = {
      nombre: nombre,
      correo: correo,
      usuario: usuario,
      tempPassword: tempPassword,
      estudianteNombre: estudiante.estudiante_nombre,
      matricula: estudiante.matricula
    };
    
    // Enviar correo de bienvenida
    const emailResult = await emailService.sendWelcomeEmail(padreInfo);
    
    console.log('📧 Resultado del envío de correo:', emailResult);
      // Respuesta exitosa
    res.status(201).json({ 
      mensaje: 'Padre registrado exitosamente',
      usuario: {
        id_usuario: id_usuario,
        usuario: usuario,
        nombre: nombre,
        correo: correo,
        rol: 'padre'
      },      padre: {
        id_padre: id_usuario, // Same as id_usuario
        nombre: nombre,
        correo: correo
      },
      estudiante: {
        nombre: estudiante.estudiante_nombre,
        matricula: estudiante.matricula
      },
      correo_enviado: emailResult.success,
      preview_url: emailResult.previewUrl // Solo para pruebas con Ethereal
    });
    
  } catch (error) {
    console.error('Error en registro completo de tutor:', error);
    res.status(500).json({ error: 'Error al registrar usuario y tutor', detalle: error.message });
  }
});

// Endpoint para eliminar un padre/tutor con validación de dependencias
router.delete('/:id', auth, checkRole(['admin']), async (req, res) => {
  const { id } = req.params;
  try {
    // Verificar dependencias en incidencias (si alguna incidencia hace referencia al tutor)
    const incidencia = await db.query('SELECT 1 FROM incidencia WHERE usuario_id = $1', [id]);
    if (incidencia.rows && incidencia.rows.length > 0) {
      return res.status(409).json({ error: 'No se puede eliminar el tutor: está referenciado en una incidencia.' });
    }
    // Si no hay dependencias, eliminar tutor
    const result = await db.query('DELETE FROM padre WHERE id_usuario = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Tutor no encontrado' });
    }
    res.json({ mensaje: 'Tutor eliminado correctamente', tutor: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar tutor', detalle: error.message });
  }
});

// Endpoint para listar todos los tutores (solo admin)
router.get('/', auth, checkRole(['admin']), async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM padre');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener tutores', detalle: error.message });
  }
});

// Endpoint para obtener información de un tutor específico (admin o el propio tutor)
router.get('/:id', auth, checkRole(['admin', 'padre']), async (req, res) => {
  const { id } = req.params;
  const rol = req.user?.rol || req.body.rol || req.headers['x-rol'];
  const userId = req.user?.id_usuario || req.body.id_usuario || req.headers['x-user-id'];
  if (rol !== 'admin' && parseInt(userId) !== parseInt(id)) {
    return res.status(403).json({ error: 'Solo puedes acceder a tu propia información de tutor.' });
  }
  try {
    const result = await db.query('SELECT * FROM padre WHERE id_usuario = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tutor no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener tutor', detalle: error.message });
  }
});

module.exports = router;