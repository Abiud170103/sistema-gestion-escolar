const express = require('express');
const router = express.Router();
const db = require('../config/db');
const checkRole = require('../middlewares/checkRole');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const auth = require('../middlewares/auth');
const bcrypt = require('bcryptjs');

// Endpoint para listar todos los usuarios desde la base de datos
router.get('/', auth, checkRole(['admin']), async (req, res) => {
  console.log('Usuario autenticado:', req.user);
  try {
    const result = await db.query('SELECT * FROM usuario');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios', detalle: error.message });
  }
});

// Endpoint para obtener información de un usuario específico (admin o el propio usuario)
router.get('/:id', checkRole(['admin', 'estudiante', 'docente', 'padre']), async (req, res) => {
  const { id } = req.params;
  const rol = req.user?.rol || req.body.rol || req.headers['x-rol'];
  const userId = req.user?.id_usuario || req.body.id_usuario || req.headers['x-user-id'];
  if (rol !== 'admin' && parseInt(userId) !== parseInt(id)) {
    return res.status(403).json({ error: 'Solo puedes acceder a tu propia información.' });
  }
  try {
    const result = await db.query('SELECT * FROM usuario WHERE id_usuario = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuario', detalle: error.message });
  }
});

// Endpoint para crear un nuevo usuario
router.post('/', async (req, res) => {
  console.log('=== NUEVO REGISTRO DE USUARIO ===');
  console.log('Body recibido:', JSON.stringify(req.body, null, 2));
  
  let { 
    nombre, 
    usuario, 
    correo, 
    contrasena, 
    password, // Frontend puede enviar password en lugar de contrasena
    rol,
    // Campos adicionales para estudiantes
    apellido_paterno,
    apellido_materno,
    fecha_nacimiento,
    grado,
    grupo,
    telefono,
    direccion
  } = req.body;
  
  // Usar password si contrasena no está presente
  const passwordFinal = contrasena || password;
  
  if (!nombre || !correo || !passwordFinal || !rol) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }
  
  // Validaciones específicas por rol
  if (rol === 'estudiante') {
    // Validar formato de matrícula: C + 13 dígitos
    if (req.body.matricula && !/^C\d{13}$/.test(req.body.matricula)) {
      return res.status(400).json({ 
        error: 'Formato de matrícula inválido. Debe ser: C seguido de 13 dígitos (ej: C1234567890123)' 
      });
    }
    
    // Validar que grupo sea 1 o 2 (solo 2 grupos por año)
    if (req.body.grupo && !['1', '2'].includes(req.body.grupo)) {
      return res.status(400).json({ 
        error: 'Grupo inválido. Solo se permiten grupos 1 y 2' 
      });
    }
    
    // Validar que año sea 1, 2 o 3 (secundaria)
    if (req.body.anio && !['1', '2', '3'].includes(req.body.anio)) {
      return res.status(400).json({ 
        error: 'Año escolar inválido. Solo se permiten años 1, 2 y 3' 
      });
    }
  }
  
  try {
    // Generar usuario automáticamente si está vacío
    if (!usuario || usuario.trim() === '') {
      const baseUsuario = nombre.toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
        .substring(0, 20);
      
      // Verificar si el usuario base existe y generar variante si es necesario
      let usuarioFinal = baseUsuario;
      let contador = 1;
      
      while (true) {
        const existe = await db.query('SELECT 1 FROM usuario WHERE usuario = $1', [usuarioFinal]);
        if (existe.rows.length === 0) break;
        usuarioFinal = `${baseUsuario}_${contador}`;
        contador++;
        if (contador > 100) break; // Prevenir bucle infinito
      }
      
      usuario = usuarioFinal;
      console.log(`Usuario generado automáticamente: ${usuario}`);
    }
    
    // Validar formato de correo
    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(correo)) {
      return res.status(400).json({ error: 'Correo electrónico no válido' });
    }
    
    // Validar unicidad de correo o usuario
    console.log('=== DEBUG 409 ERROR ===');
    console.log('Checking uniqueness for:', { correo, usuario });
    
    const existe = await db.query('SELECT correo, usuario FROM usuario WHERE correo = $1 OR usuario = $2', [correo, usuario]);
    console.log('Found conflicts:', existe.rows);
    
    if (existe.rows.length > 0) {
      const conflicts = existe.rows.map(row => {
        const conflicts = [];
        if (row.correo === correo) conflicts.push('correo');
        if (row.usuario === usuario) conflicts.push('usuario');
        return `${conflicts.join(' y ')} duplicado: ${row.correo}/${row.usuario}`;
      });
      
      console.log('Conflict details:', conflicts);
      return res.status(409).json({ 
        error: 'El correo o usuario ya está registrado',
        detalles: conflicts
      });
    }
    // Guardar contrasena en texto plano (solo para pruebas)
    const result = await db.query(
      'INSERT INTO usuario (nombre, usuario, correo, contrasena, rol) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nombre, usuario, correo, passwordFinal, rol]
    );
    
    const nuevoUsuario = result.rows[0];
    
    // Si es estudiante, insertar también en tabla estudiante
    if (rol === 'estudiante') {
      const { matricula, grupo, anio } = req.body;
      
      // Buscar o crear grupo
      let grupoId = null;
      if (grupo && anio) {
        // Formato de turno: "Grupo {numero} - {año}° año"
        const turnoDescripcion = `Grupo ${grupo} - ${anio}° año`;
        
        // Buscar grupo existente
        const grupoExistente = await db.query(
          'SELECT id_grupo FROM grupo WHERE anio = $1 AND turno = $2',
          [parseInt(anio), turnoDescripcion]
        );
        
        if (grupoExistente.rows.length > 0) {
          grupoId = grupoExistente.rows[0].id_grupo;
        } else {
          // Crear nuevo grupo
          const nuevoGrupo = await db.query(
            'INSERT INTO grupo (anio, turno) VALUES ($1, $2) RETURNING id_grupo',
            [parseInt(anio), turnoDescripcion]
          );
          grupoId = nuevoGrupo.rows[0].id_grupo;
        }
      }
      
      // Insertar en tabla estudiante
      if (matricula) {
        await db.query(
          'INSERT INTO estudiante (id_usuario, matricula, grupo_id) VALUES ($1, $2, $3)',
          [nuevoUsuario.id_usuario, matricula, grupoId]
        );
      }
    }
    
    res.status(201).json(nuevoUsuario);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear usuario', detalle: error.message });
  }
});

// Endpoint para eliminar un usuario con validación de dependencias
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Verificar dependencias en estudiante
    const estudiante = await db.query('SELECT 1 FROM estudiante WHERE id_usuario = $1', [id]);
    if (estudiante.rows.length > 0) {
      return res.status(409).json({ error: 'No se puede eliminar el usuario: está registrado como estudiante.' });
    }
    
    // Verificar dependencias en docente (horarios asignados)
    const docente = await db.query('SELECT 1 FROM docente WHERE id_usuario = $1', [id]);
    if (docente.rows.length > 0) {
      const horarioDocente = await db.query('SELECT 1 FROM horario WHERE docente_id = $1', [id]);
      if (horarioDocente.rows.length > 0) {
        return res.status(409).json({ error: 'No se puede eliminar el usuario: es docente con horarios asignados.' });
      }
    }
    // Verificar dependencias en padre/tutor
    const padre = await db.query('SELECT 1 FROM padre WHERE id_usuario = $1', [id]);
    if (padre.rows.length > 0) {
      // Verificar si tiene estudiantes asignados
      const padreEstudiante = await db.query('SELECT 1 FROM padre_estudiante WHERE padre_id = $1', [id]);
      if (padreEstudiante.rows.length > 0) {
        return res.status(409).json({ error: 'No se puede eliminar el usuario: es padre/tutor de estudiantes registrados.' });
      }
    }
    // Verificar dependencias en asistencias
    const asistencia = await db.query('SELECT 1 FROM asistencia WHERE usuario_id = $1', [id]);
    if (asistencia.rows.length > 0) {
      return res.status(409).json({ error: 'No se puede eliminar el usuario: tiene asistencias registradas.' });
    }
    // Verificar dependencias en incidencias (como reportante o involucrado)
    const incidencia = await db.query('SELECT 1 FROM incidencia WHERE usuario_id = $1', [id]);
    if (incidencia.rows.length > 0) {
      return res.status(409).json({ error: 'No se puede eliminar el usuario: tiene incidencias registradas.' });
    }
    // Si no hay dependencias, eliminar usuario
    const result = await db.query('DELETE FROM usuario WHERE id_usuario = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ mensaje: 'Usuario eliminado correctamente', usuario: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar usuario', detalle: error.message });
  }
});

// Endpoint para cambiar contrasena de un usuario (admin o el propio usuario)
router.put('/:id/cambiar-contrasena', auth, checkRole(['admin', 'estudiante', 'docente', 'padre']), async (req, res) => {
  const { id } = req.params;
  const { nuevaContrasena } = req.body;
  // Validar complejidad de la nueva contrasena (opcional)
  // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
  // if (!passwordRegex.test(nuevaContrasena)) {
  //   return res.status(400).json({ error: 'La contrasena debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.' });
  // }
  try {
    // Guardar la nueva contrasena (texto plano para pruebas)
    const result = await db.query('UPDATE usuario SET contrasena = $1 WHERE id_usuario = $2 RETURNING *', [nuevaContrasena, id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ mensaje: 'Contrasena actualizada correctamente', usuario: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al cambiar contrasena', detalle: error.message });
  }
});

// Endpoint de login (autenticación)
router.post('/login', async (req, res) => {
  console.log('BODY LOGIN:', req.body); // Log para depuración
  const { login, contrasena } = req.body;
  if (!login || !contrasena) {
    console.log('Faltan datos:', { login, contrasena });
    return res.status(400).json({ error: 'Usuario/correo y contrasena requeridos' });
  }
  try {
    const result = await db.query('SELECT * FROM usuario WHERE usuario = $1 OR correo = $1', [login]);
    console.log('Resultado consulta usuario:', result.rows);
    if (result.rows.length === 0) {
      console.log('No se encontró usuario para:', login);
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    const usuario = result.rows[0];
    console.log('Usuario encontrado:', usuario);
    
    // Verificar si la contraseña temporal ha expirado
    if (usuario.temp_password_expires && new Date() > new Date(usuario.temp_password_expires)) {
      return res.status(401).json({ 
        error: 'Su contraseña temporal ha expirado. Contacte al administrador para reactivar su cuenta.',
        expired: true
      });
    }
    
    // Verificar contraseña (temporal o normal)
    let passwordMatch = false;
    
    // Si tiene contraseña temporal y aún no ha expirado, verificar contra ella
    if (usuario.temp_password && usuario.temp_password_expires && new Date() <= new Date(usuario.temp_password_expires)) {
      passwordMatch = (contrasena === usuario.temp_password);
      
      if (passwordMatch && usuario.password_change_required) {
        // Login exitoso pero requiere cambio de contraseña
        const token = jwt.sign({
          id_usuario: usuario.id_usuario,
          rol: usuario.rol,
          nombre: usuario.nombre,
          correo: usuario.correo,
          temp_password: true,
          password_change_required: true
        }, config.jwtSecret, { expiresIn: '15m' }); // Token más largo para cambio de contraseña
        
        return res.json({ 
          token, 
          passwordChangeRequired: true,
          message: 'Debe cambiar su contraseña antes de continuar',
          tempPasswordExpires: usuario.temp_password_expires
        });
      }
    }
    
    // Si no es contraseña temporal o ya cambió, verificar contraseña normal
    if (!passwordMatch) {
      passwordMatch = (contrasena === usuario.contrasena);
    }
    
    if (!passwordMatch) {
      console.log('Contrasena incorrecta:', contrasena);
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    // Si es padre/tutor, obtener estudiantes asociados
    let estudiantes = null;
    if (usuario.rol === 'padre') {
      try {
        const estudiantesRes = await db.query(`
          SELECT e.id_usuario, u.nombre
          FROM padre_estudiante pe
          JOIN estudiante e ON pe.id_estudiante = e.id_usuario
          JOIN usuario u ON e.id_usuario = u.id_usuario
          WHERE pe.id_padre = $1
        `, [usuario.id_usuario]);
        estudiantes = estudiantesRes.rows; // [{id_usuario, nombre}, ...]
      } catch (e) {
        console.error('Error obteniendo estudiantes para padre:', e);
        estudiantes = [];
      }
    }
    
    // Marcar que ya no es primer login si corresponde
    if (usuario.first_login) {
      await db.query('UPDATE usuario SET first_login = false WHERE id_usuario = $1', [usuario.id_usuario]);
    }
    
    // Generar JWT normal
    const token = jwt.sign({
      id_usuario: usuario.id_usuario,
      rol: usuario.rol,
      nombre: usuario.nombre,
      correo: usuario.correo,
      estudiantes // incluir aunque sea null
    }, config.jwtSecret, { expiresIn: '5m' });
    
    res.json({ token, estudiantes });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en login', detalle: error.message });
  }
});

// Endpoint para actualizar un usuario
router.put('/:id', auth, checkRole(['admin']), async (req, res) => {
  const { id } = req.params;
  const { nombre, correo, rol, tipo_docente } = req.body;
  if (!nombre || !correo || !rol) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }
  // Validar formato de correo
  const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!emailRegex.test(correo)) {
    return res.status(400).json({ error: 'Correo electrónico no válido' });
  }
  try {
    // Validar unicidad de correo (excepto el propio usuario)
    const existe = await db.query('SELECT 1 FROM usuario WHERE correo = $1 AND id_usuario != $2', [correo, id]);
    if (existe.rows.length > 0) {
      return res.status(409).json({ error: 'El correo ya está registrado por otro usuario' });
    }
    // Actualizar usuario
    const result = await db.query(
      'UPDATE usuario SET nombre = $1, correo = $2, rol = $3, tipo_docente = $4 WHERE id_usuario = $5 RETURNING *',
      [nombre, correo, rol, tipo_docente || null, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ mensaje: 'Usuario actualizado correctamente', usuario: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar usuario', detalle: error.message });
  }
});

// Endpoint para cambiar contraseña temporal por una permanente
router.post('/cambiar-password-temporal', auth, async (req, res) => {
  console.log('🔧 Endpoint cambiar-password-temporal iniciado');
  console.log('   Headers:', req.headers.authorization ? 'Token presente' : 'Sin token');
  console.log('   User desde middleware:', req.user ? `ID: ${req.user.id_usuario}` : 'No user');
  console.log('   Body:', req.body);
  
  const { nuevaContrasena } = req.body;
  const userId = req.user?.id_usuario;
  
  if (!userId) {
    console.log('❌ Error: Usuario no autenticado');
    return res.status(401).json({ error: 'No autenticado' });
  }
  
  if (!nuevaContrasena) {
    console.log('❌ Error: Nueva contraseña no proporcionada');
    return res.status(400).json({ error: 'Nueva contraseña requerida' });
  }
  
  // Validar complejidad de la nueva contraseña
  if (nuevaContrasena.length < 8) {
    console.log('❌ Error: Contraseña muy corta');
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
  }
  
  try {
    console.log(`🔍 Buscando usuario con ID: ${userId}`);
    // Verificar que el usuario tiene una contraseña temporal activa
    const usuarioResult = await db.query(`
      SELECT temp_password, temp_password_expires, password_change_required 
      FROM usuario 
      WHERE id_usuario = $1
    `, [userId]);
    
    if (usuarioResult.rows.length === 0) {
      console.log('❌ Error: Usuario no encontrado en DB');
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    const usuario = usuarioResult.rows[0];
    console.log('📋 Estado del usuario:', {
      tiene_temp_password: !!usuario.temp_password,
      password_change_required: usuario.password_change_required,
      temp_expires: usuario.temp_password_expires
    });
    
    if (!usuario.password_change_required) {
      console.log('❌ Error: No requiere cambio de contraseña');
      return res.status(400).json({ error: 'No es necesario cambiar la contraseña' });
    }
    
    if (!usuario.temp_password || !usuario.temp_password_expires) {
      console.log('❌ Error: No tiene contraseña temporal activa');
      return res.status(400).json({ error: 'No tiene una contraseña temporal activa' });
    }
    
    if (new Date() > new Date(usuario.temp_password_expires)) {
      console.log('❌ Error: Contraseña temporal expirada');
      return res.status(401).json({ error: 'Su contraseña temporal ha expirado. Contacte al administrador.' });
    }
    
    console.log('✅ Actualizando contraseña...');
    // Actualizar con la nueva contraseña y limpiar campos temporales
    const result = await db.query(`
      UPDATE usuario 
      SET contrasena = $1,
          temp_password = NULL,
          temp_password_expires = NULL,
          password_change_required = FALSE,
          first_login = FALSE
      WHERE id_usuario = $2 
      RETURNING id_usuario, nombre, correo, rol
    `, [nuevaContrasena, userId]);
    
    if (result.rowCount === 0) {
      console.log('❌ Error: No se pudo actualizar');
      return res.status(404).json({ error: 'Error al actualizar contraseña' });
    }
    
    console.log(`✅ Contraseña actualizada para usuario ${userId}`);
    
    res.json({ 
      mensaje: 'Contraseña actualizada correctamente. Ya puede usar su nueva contraseña para futuros inicios de sesión.',
      usuario: result.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Error al cambiar contraseña temporal:', error);
    res.status(500).json({ error: 'Error al cambiar contraseña', detalle: error.message });
  }
});

// Endpoint para verificar si un correo ya está registrado
router.get('/check-email/:email', async (req, res) => {
  const { email } = req.params;
  
  try {
    const result = await db.query('SELECT 1 FROM usuario WHERE correo = $1', [email]);
    const disponible = result.rows.length === 0;
    
    res.json({ 
      disponible, 
      mensaje: disponible ? 'Correo disponible' : 'Correo ya registrado' 
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al verificar correo', detalle: error.message });
  }
});

module.exports = router;
