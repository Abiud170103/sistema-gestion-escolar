const express = require('express');
const router = express.Router();
const db = require('../config/db');
const checkRole = require('../middlewares/checkRole');
const auth = require('../middlewares/auth');

// Registrar una incidencia (solo docente o admin)
router.post('/', auth, checkRole(['docente', 'admin']), async (req, res) => {
  const { usuario_id, descripcion, fecha, tipo, sancion, materia_id, taller_id } = req.body;
  if (!usuario_id || !descripcion || !fecha || !tipo) {
    return res.status(400).json({ error: 'Faltan datos requeridos (usuario_id, descripcion, fecha, tipo)' });
  }
  // Validar formato de fecha (YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return res.status(400).json({ error: 'Formato de fecha inválido (debe ser YYYY-MM-DD)' });
  }
  // Validar fecha lógica (no futura, no antes del año 2000)
  const fechaIncidencia = new Date(fecha);
  const hoy = new Date();
  if (fechaIncidencia > hoy) {
    return res.status(400).json({ error: 'La fecha de la incidencia no puede ser futura.' });
  }
  if (fechaIncidencia.getFullYear() < 2000) {
    return res.status(400).json({ error: 'La fecha de la incidencia no puede ser anterior al año 2000.' });
  }
  try {
    // Validar existencia de usuario
    const usuario = await db.query('SELECT 1 FROM usuario WHERE id_usuario = $1', [usuario_id]);
    if (usuario.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    const result = await db.query(
      'INSERT INTO incidencia (usuario_id, fecha, descripcion, tipo, sancion, materia_id, taller_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [usuario_id, fecha, descripcion, tipo, sancion || null, materia_id || null, taller_id || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al registrar incidencia:', error);
    res.status(500).json({ error: 'Error al registrar incidencia', detalle: error.message });
  }
});

// Consultar incidencias por usuario
router.get('/usuario/:id', auth, checkRole(['admin', 'docente', 'estudiante', 'padre']), async (req, res) => {
  const { id } = req.params;
  const rol = req.user?.rol;
  const userId = req.user?.id_usuario;
  if (rol === 'estudiante' && parseInt(userId) !== parseInt(id)) {
    return res.status(403).json({ error: 'Solo puedes acceder a tus propias incidencias.' });
  }
  if (rol === 'padre') {
    const estudiantes = req.user.estudiantes || [];
    const ids = Array.isArray(estudiantes) ? estudiantes.map(e => (typeof e === 'object' ? e.id_usuario : e)) : [];
    if (!ids.includes(parseInt(id))) {
      return res.status(403).json({ error: 'Solo puedes acceder a las incidencias de los estudiantes asociados a tu cuenta.' });
    }
  }  try {
    const result = await db.query(
      'SELECT i.*, u.nombre AS estudiante_nombre, e.matricula AS estudiante_matricula FROM incidencia i LEFT JOIN usuario u ON i.usuario_id = u.id_usuario LEFT JOIN estudiante e ON i.usuario_id = e.id_usuario WHERE usuario_id = $1 ORDER BY i.fecha DESC',
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener incidencias', detalle: error.message });
  }
});

// Actualizar una incidencia (solo admin y docente)
router.put('/:id', auth, checkRole(['admin', 'docente']), async (req, res) => {
  const { id } = req.params;
  const { tipo, descripcion, sancion, materia_id, taller_id } = req.body;
  
  if (!tipo || !descripcion) {
    return res.status(400).json({ error: 'Tipo y descripción son requeridos' });
  }
  
  try {
    const result = await db.query(
      'UPDATE incidencia SET tipo = $1, descripcion = $2, sancion = $3, materia_id = $4, taller_id = $5 WHERE id_incidencia = $6 RETURNING *',
      [tipo, descripcion, sancion || null, materia_id || null, taller_id || null, id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Incidencia no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar incidencia:', error);
    res.status(500).json({ error: 'Error al actualizar incidencia', detalle: error.message });
  }
});

// Endpoint para eliminar una incidencia (solo admin)
router.delete('/:id', checkRole(['admin']), async (req, res) => {
  const { id } = req.params;
  try {
    // Si hay dependencias futuras, aquí se validarían
    const result = await db.query('DELETE FROM incidencia WHERE id_incidencia = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Incidencia no encontrada' });
    }
    res.json({ mensaje: 'Incidencia eliminada correctamente', incidencia: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar incidencia', detalle: error.message });
  }
});

// Obtener todas las incidencias (solo admin)
router.get('/', auth, checkRole(['admin']), async (req, res) => {
  try {
    const result = await db.query(`
      SELECT i.*, u.nombre AS estudiante_nombre, e.matricula AS estudiante_matricula,
             m.nombre AS materia_nombre, t.nombre AS taller_nombre
      FROM incidencia i
      LEFT JOIN usuario u ON i.usuario_id = u.id_usuario
      LEFT JOIN estudiante e ON i.usuario_id = e.id_usuario
      LEFT JOIN materia m ON i.materia_id = m.id_materia
      LEFT JOIN taller t ON i.taller_id = t.id_taller
      ORDER BY i.fecha DESC, i.id_incidencia DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener incidencias', detalle: error.message });
  }
});

// Obtener incidencias de los grupos asignados al docente autenticado
router.get('/docente', auth, checkRole(['docente']), async (req, res) => {
  const docenteId = req.user?.id_usuario;
  if (!docenteId) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  try {
    const result = await db.query(`
      SELECT i.*, u.nombre AS estudiante_nombre, est.matricula AS estudiante_matricula,
             g.anio AS grupo_anio, g.turno AS grupo_turno,
             m.nombre AS materia_nombre, t.nombre AS taller_nombre
      FROM docente_materia dm
      JOIN grupo g ON dm.grupo_id = g.id_grupo
      JOIN estudiante est ON est.grupo_id = g.id_grupo
      JOIN usuario u ON est.id_usuario = u.id_usuario
      JOIN incidencia i ON i.usuario_id = est.id_usuario
      LEFT JOIN materia m ON i.materia_id = m.id_materia
      LEFT JOIN taller t ON i.taller_id = t.id_taller
      WHERE dm.docente_id = $1
      ORDER BY i.fecha DESC, i.id_incidencia DESC
    `, [docenteId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener incidencias del docente', detalle: error.message });
  }
});

module.exports = router;
