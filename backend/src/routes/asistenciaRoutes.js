const express = require('express');
const router = express.Router();
const db = require('../config/db');
const checkRole = require('../middlewares/checkRole');
const auth = require('../middlewares/auth');

// Registrar una asistencia (solo docente o admin)
router.post('/', checkRole(['docente', 'admin']), async (req, res) => {
  const { fecha, usuario_id, presente } = req.body;
  if (!fecha || !usuario_id || typeof presente !== 'boolean') {
    return res.status(400).json({ error: 'Faltan datos requeridos o tipos incorrectos' });
  }
  // Validar formato de fecha (YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return res.status(400).json({ error: 'Formato de fecha inválido (debe ser YYYY-MM-DD)' });
  }
  // Validar fecha lógica (no futura, no antes del año 2000)
  const fechaAsistencia = new Date(fecha);
  const hoy = new Date();
  if (fechaAsistencia > hoy) {
    return res.status(400).json({ error: 'La fecha de asistencia no puede ser futura.' });
  }
  if (fechaAsistencia.getFullYear() < 2000) {
    return res.status(400).json({ error: 'La fecha de asistencia no puede ser anterior al año 2000.' });
  }
  try {
    // Validar existencia de usuario
    const usuario = await db.query('SELECT 1 FROM usuario WHERE id_usuario = $1', [usuario_id]);
    if (usuario.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    const result = await db.query(
      'INSERT INTO asistencia (fecha, usuario_id, presente) VALUES ($1, $2, $3) RETURNING *',
      [fecha, usuario_id, presente]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al registrar asistencia:', error);
    res.status(500).json({ error: 'Error al registrar asistencia', detalle: error.message });
  }
});

// Consultar asistencias por usuario (admin, docente, estudiante o padre)
router.get('/usuario/:id', auth, checkRole(['admin', 'docente', 'estudiante', 'padre']), async (req, res) => {
  const { id } = req.params;
  const rol = req.user?.rol || req.body.rol || req.headers['x-rol'];
  const userId = req.user?.id_usuario || req.body.id_usuario || req.headers['x-user-id'];
  if (rol === 'estudiante' && parseInt(userId) !== parseInt(id)) {
    return res.status(403).json({ error: 'Solo puedes acceder a tus propias asistencias.' });
  }
  if (rol === 'padre') {
    const estudiantes = req.user.estudiantes || [];
    const ids = Array.isArray(estudiantes) ? estudiantes.map(e => (typeof e === 'object' ? e.id_usuario : e)) : [];
    if (!ids.includes(parseInt(id))) {
      return res.status(403).json({ error: 'Solo puedes acceder a las asistencias de los estudiantes asociados a tu cuenta.' });
    }
  }
  try {
    const result = await db.query(`
      SELECT a.id_asistencia AS id,
             a.fecha,
             a.usuario_id,
             u.nombre AS estudiante_nombre,
             CASE WHEN a.presente THEN 'ASISTENCIA' ELSE 'FALTA' END AS estado
      FROM asistencia a
      JOIN usuario u ON a.usuario_id = u.id_usuario
      WHERE a.usuario_id = $1
      ORDER BY a.fecha DESC, a.id_asistencia DESC
    `, [id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener asistencias', detalle: error.message });
  }
});

// Consultar asistencias por fecha y grupo (opcional)
router.get('/grupo/:grupo_id/fecha/:fecha', async (req, res) => {
  const { grupo_id, fecha } = req.params;
  try {
    const result = await db.query(
      `SELECT a.* FROM asistencia a
       JOIN estudiante e ON a.usuario_id = e.id_usuario
       WHERE e.grupo_id = $1 AND a.fecha = $2`,
      [grupo_id, fecha]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener asistencias por grupo y fecha', detalle: error.message });
  }
});

// Obtener todas las asistencias (solo admin)
router.get('/', auth, checkRole(['admin']), async (req, res) => {
  try {
    const result = await db.query(`
      SELECT a.id_asistencia AS id,
             a.fecha,
             a.usuario_id,
             u.nombre AS estudiante_nombre,
             CASE WHEN a.presente THEN 'ASISTENCIA' ELSE 'FALTA' END AS estado
      FROM asistencia a
      JOIN usuario u ON a.usuario_id = u.id_usuario
      ORDER BY a.fecha DESC, a.id_asistencia DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener asistencias', detalle: error.message });
  }
});

// Obtener asistencias de los grupos/materias asignados al docente autenticado
router.get('/docente', auth, checkRole(['docente']), async (req, res) => {
  const docenteId = req.user?.id_usuario;
  if (!docenteId) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  try {
    // Buscar asistencias de estudiantes de los grupos/materias del docente
    const result = await db.query(`
      SELECT a.id_asistencia AS id,
             a.fecha,
             a.usuario_id,
             u.nombre AS estudiante_nombre,
             CASE WHEN a.presente THEN 'ASISTENCIA' ELSE 'FALTA' END AS estado,
             g.anio AS grupo_anio,
             g.turno AS grupo_turno,
             m.nombre AS materia_nombre
      FROM docente_materia dm
      JOIN materia m ON dm.materia_id = m.id_materia
      JOIN horario h ON h.materia_id = m.id_materia AND h.docente_id = dm.docente_id
      JOIN grupo g ON h.grupo_id = g.id_grupo
      JOIN estudiante e ON e.grupo_id = g.id_grupo
      JOIN usuario u ON e.id_usuario = u.id_usuario
      JOIN asistencia a ON a.usuario_id = e.id_usuario
      WHERE dm.docente_id = $1
      ORDER BY a.fecha DESC, a.id_asistencia DESC
    `, [docenteId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener asistencias del docente', detalle: error.message });
  }
});

// Endpoint para eliminar una asistencia con validación de dependencias
router.delete('/:id', checkRole(['admin', 'docente']), async (req, res) => {
  const { id } = req.params;
  try {
    // Verificar dependencias en incidencias (si alguna incidencia hace referencia a la asistencia)
    const incidencia = await db.query('SELECT 1 FROM incidencia WHERE asistencia_id = $1', [id]);
    if (incidencia.rows && incidencia.rows.length > 0) {
      return res.status(409).json({ error: 'No se puede eliminar la asistencia: está referenciada en una incidencia.' });
    }
    // Si no hay dependencias, eliminar asistencia
    const result = await db.query('DELETE FROM asistencia WHERE id_asistencia = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Asistencia no encontrada' });
    }
    res.json({ mensaje: 'Asistencia eliminada correctamente', asistencia: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar asistencia', detalle: error.message });
  }
});

// Justificar una falta (solo admin o docente)
router.put('/:id/justificar', checkRole(['admin', 'docente']), async (req, res) => {
  const { id } = req.params;
  const { justificacion } = req.body;
  if (!justificacion || typeof justificacion !== 'string') {
    return res.status(400).json({ error: 'La justificación es requerida y debe ser texto.' });
  }
  try {
    // Validar que la asistencia exista y sea una falta
    const asistencia = await db.query('SELECT * FROM asistencia WHERE id_asistencia = $1', [id]);
    if (asistencia.rows.length === 0) {
      return res.status(404).json({ error: 'Asistencia no encontrada' });
    }
    if (asistencia.rows[0].presente) {
      return res.status(409).json({ error: 'Solo se pueden justificar faltas.' });
    }
    // Actualizar justificación
    await db.query('UPDATE asistencia SET justificacion = $1 WHERE id_asistencia = $2', [justificacion, id]);
    res.json({ mensaje: 'Falta justificada correctamente', justificacion });
  } catch (error) {
    res.status(500).json({ error: 'Error al justificar falta', detalle: error.message });
  }
});

module.exports = router;
