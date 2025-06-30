const express = require('express');
const router = express.Router();
const db = require('../config/db');
const checkRole = require('../middlewares/checkRole');
const auth = require('../middlewares/auth');
const calificacionesFlag = require('../config/calificacionesFlag');

// Registrar una calificación (solo docente o admin)
router.post('/', checkRole(['docente', 'admin']), async (req, res) => {
  const { estudiante_id, materia_id, calificacion, fecha } = req.body;
  if (!estudiante_id || !materia_id || calificacion === undefined || !fecha) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }
  // Validar rango de calificación
  if (typeof calificacion !== 'number' || calificacion < 0 || calificacion > 10) {
    return res.status(400).json({ error: 'La calificación debe ser un número entre 0 y 10' });
  }
  // Validar formato de fecha (YYYY-MM-DD)
  if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(fecha)) {
    return res.status(400).json({ error: 'Formato de fecha inválido (debe ser YYYY-MM-DD)' });
  }
  // Solo validar los 3 días hábiles si el sistema NO está habilitado
  if (!calificacionesFlag.get()) {
    const fechaApertura = new Date('2025-06-10'); // <-- Ajusta según tu lógica real
    const fechaRegistro = new Date(fecha);
    let diasHabiles = 0;
    let temp = new Date(fechaApertura);
    while (temp <= fechaRegistro) {
      const dia = temp.getDay();
      if (dia !== 0 && dia !== 6) diasHabiles++;
      temp.setDate(temp.getDate() + 1);
    }
    if (diasHabiles > 3) {
      return res.status(403).json({ error: 'Solo se puede registrar calificaciones dentro de los 3 días hábiles posteriores a la apertura del sistema' });
    }
  }
  // Validar fecha lógica (no futura, no antes del año 2000)
  const fechaCalificacion = new Date(fecha);
  const hoy = new Date();
  if (fechaCalificacion > hoy) {
    return res.status(400).json({ error: 'La fecha de la calificación no puede ser futura.' });
  }
  if (fechaCalificacion.getFullYear() < 2000) {
    return res.status(400).json({ error: 'La fecha de la calificación no puede ser anterior al año 2000.' });
  }
  try {
    // Validar existencia de estudiante
    const estudiante = await db.query('SELECT 1 FROM estudiante WHERE id_usuario = $1', [estudiante_id]);
    if (estudiante.rows.length === 0) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }
    // Validar existencia de materia
    const materia = await db.query('SELECT 1 FROM materia WHERE id_materia = $1', [materia_id]);
    if (materia.rows.length === 0) {
      return res.status(404).json({ error: 'Materia no encontrada' });
    }
    const result = await db.query(
      'INSERT INTO calificacion (estudiante_id, materia_id, calificacion, fecha) VALUES ($1, $2, $3, $4) RETURNING *',
      [estudiante_id, materia_id, calificacion, fecha]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al registrar calificación:', error);
    res.status(500).json({ error: 'Error al registrar calificación', detalle: error.message });
  }
});

// Consultar calificaciones por estudiante (admin, docente o el propio estudiante)
router.get('/estudiante/:id', auth, checkRole(['admin', 'docente', 'estudiante', 'padre']), async (req, res) => {
  const { id } = req.params;
  const rol = req.user?.rol || req.body.rol || req.headers['x-rol'];
  const userId = req.user?.id_usuario || req.body.id_usuario || req.headers['x-user-id'];
  // Permitir a padre/tutor ver solo las calificaciones de su hijo/hija asignado
  if (rol === 'estudiante' && parseInt(userId) !== parseInt(id)) {
    return res.status(403).json({ error: 'Solo puedes acceder a tus propias calificaciones.' });
  }
  if (rol === 'padre') {
    // Permitir si el id está en el arreglo de estudiantes asociados
    const estudiantes = req.user.estudiantes || [];
    const ids = Array.isArray(estudiantes) ? estudiantes.map(e => (typeof e === 'object' ? e.id_usuario : e)) : [];
    if (!ids.includes(parseInt(id))) {
      return res.status(403).json({ error: 'Solo puedes acceder a las calificaciones de los estudiantes asociados a tu cuenta.' });
    }
  }
  try {
    const result = await db.query(`
      SELECT e.id_usuario AS estudiante_id,
             u.nombre AS estudiante_nombre,
             e.matricula,
             e.grupo_id,
             g.anio AS grupo_anio,
             g.turno AS grupo_turno,
             c.id_calificacion AS id,
             c.materia_id,
             m.nombre AS materia_nombre,
             c.calificacion AS valor,
             c.fecha
      FROM estudiante e
      JOIN usuario u ON e.id_usuario = u.id_usuario
      LEFT JOIN grupo g ON e.grupo_id = g.id_grupo
      INNER JOIN calificacion c ON e.id_usuario = c.estudiante_id
      INNER JOIN materia m ON c.materia_id = m.id_materia
      WHERE e.id_usuario = $1
      ORDER BY c.fecha
    `, [id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener calificaciones', detalle: error.message });
  }
});

// Obtener todas las calificaciones (solo admin)
router.get('/', auth, checkRole(['admin']), async (req, res) => {
  try {
    const result = await db.query(`
      SELECT e.id_usuario AS estudiante_id,
             u.nombre AS estudiante_nombre,
             e.matricula,
             e.grupo_id,
             g.anio AS grupo_anio,
             g.turno AS grupo_turno,
             c.id_calificacion AS id,
             c.materia_id,
             m.nombre AS materia_nombre,
             c.calificacion AS valor,
             c.fecha
      FROM estudiante e
      JOIN usuario u ON e.id_usuario = u.id_usuario
      LEFT JOIN grupo g ON e.grupo_id = g.id_grupo
      INNER JOIN calificacion c ON e.id_usuario = c.estudiante_id
      INNER JOIN materia m ON c.materia_id = m.id_materia
      ORDER BY estudiante_nombre, c.fecha
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener calificaciones', detalle: error.message });
  }
});

// Obtener calificaciones de materias y grupos asignados al docente autenticado
router.get('/docente', auth, checkRole(['docente']), async (req, res) => {
  const docenteId = req.user?.id_usuario;
  if (!docenteId) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  try {
    // Buscar materias y grupos asignados al docente
    const result = await db.query(`
      SELECT e.id_usuario AS estudiante_id,
             u.nombre AS estudiante_nombre,
             e.matricula AS estudiante_matricula,
             e.grupo_id,
             c.id_calificacion AS id,
             c.materia_id,
             m.nombre AS materia_nombre,
             c.calificacion AS valor,
             c.fecha
      FROM docente_materia dm
      JOIN materia m ON dm.materia_id = m.id_materia
      JOIN horario h ON h.materia_id = m.id_materia AND h.docente_id = dm.docente_id
      JOIN grupo g ON h.grupo_id = g.id_grupo
      JOIN estudiante e ON e.grupo_id = g.id_grupo
      JOIN usuario u ON e.id_usuario = u.id_usuario
      LEFT JOIN calificacion c ON e.id_usuario = c.estudiante_id AND c.materia_id = m.id_materia
      WHERE dm.docente_id = $1
      ORDER BY estudiante_nombre, c.fecha
    `, [docenteId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener calificaciones del docente', detalle: error.message });
  }
});

// Endpoint para eliminar una calificación con validación de dependencias
router.delete('/:id', checkRole(['admin', 'docente']), async (req, res) => {
  const { id } = req.params;
  try {
    // Verificar dependencias en incidencias (si alguna incidencia hace referencia a la calificación)
    const incidencia = await db.query('SELECT 1 FROM incidencia WHERE calificacion_id = $1', [id]);
    if (incidencia.rows && incidencia.rows.length > 0) {
      return res.status(409).json({ error: 'No se puede eliminar la calificación: está referenciada en una incidencia.' });
    }
    // Si no hay dependencias, eliminar calificación
    const result = await db.query('DELETE FROM calificacion WHERE id_calificacion = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Calificación no encontrada' });
    }
    res.json({ mensaje: 'Calificación eliminada correctamente', calificacion: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar calificación', detalle: error.message });
  }
});

// Endpoint para habilitar/deshabilitar el sistema de calificaciones (solo admin)
router.post('/habilitar', checkRole(['admin']), (req, res) => {
  const { habilitado } = req.body;
  if (typeof habilitado !== 'boolean') {
    return res.status(400).json({ error: 'Se requiere el campo habilitado (boolean)' });
  }
  const calificacionesFlag = require('../config/calificacionesFlag');
  calificacionesFlag.set(habilitado);
  res.json({ mensaje: `Sistema de calificaciones ${habilitado ? 'habilitado' : 'deshabilitado'}` });
});

// Endpoint OPTIONS para consultar si el sistema está habilitado
router.options('/', (req, res) => {
  const calificacionesFlag = require('../config/calificacionesFlag');
  res.json({ sistemaHabilitado: calificacionesFlag.get() });
});

// Endpoint para obtener todas las materias (también en /)
router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM materia');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener materias', detalle: error.message });
  }
});

// PUT: Editar calificación (solo docente o admin, solo valor y fecha)
router.put('/:id', auth, checkRole(['docente', 'admin']), async (req, res) => {
  const { id } = req.params;
  const { calificacion, fecha } = req.body;
  const userId = req.user?.id_usuario;
  const rol = req.user?.rol;

  if (calificacion === undefined || !fecha) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }
  if (typeof calificacion !== 'number' || calificacion < 0 || calificacion > 10) {
    return res.status(400).json({ error: 'La calificación debe ser un número entre 0 y 10' });
  }
  if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(fecha)) {
    return res.status(400).json({ error: 'Formato de fecha inválido (debe ser YYYY-MM-DD)' });
  }
  try {
    // Validar existencia de la calificación
    const calRes = await db.query('SELECT * FROM calificacion WHERE id_calificacion = $1', [id]);
    if (calRes.rows.length === 0) {
      return res.status(404).json({ error: 'Calificación no encontrada' });
    }
    const cal = calRes.rows[0];
    // Si es docente, validar que imparte la materia y grupo de la calificación
    if (rol === 'docente') {
      const valid = await db.query(`
        SELECT 1 FROM docente_materia dm
        JOIN horario h ON h.docente_id = dm.docente_id AND h.materia_id = dm.materia_id
        JOIN estudiante e ON e.grupo_id = h.grupo_id
        WHERE dm.docente_id = $1 AND dm.materia_id = $2 AND e.id_usuario = $3
      `, [userId, cal.materia_id, cal.estudiante_id]);
      if (valid.rows.length === 0) {
        return res.status(403).json({ error: 'No autorizado para modificar esta calificación' });
      }
    }
    // Actualizar solo valor y fecha
    const result = await db.query(
      'UPDATE calificacion SET calificacion = $1, fecha = $2 WHERE id_calificacion = $3 RETURNING *',
      [calificacion, fecha, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar calificación', detalle: error.message });
  }
});

module.exports = router;
