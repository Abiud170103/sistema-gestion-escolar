const express = require('express');
const router = express.Router();
const db = require('../config/db');
const checkRole = require('../middlewares/checkRole');
const auth = require('../middlewares/auth');

// Registrar un estudiante (ejemplo de endpoint)
router.post('/', async (req, res) => {
  const { id_usuario, grupo_id, taller_id, matricula } = req.body;
  if (!id_usuario || !grupo_id || !taller_id || !matricula) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }
  // Validar formato de matrícula: C + 13 dígitos (ejemplo: C1234567890123)
  if (!/^C\d{13}$/.test(matricula)) {
    return res.status(400).json({ error: 'Formato de matrícula inválido (debe ser C seguido de 13 dígitos)' });
  }
  try {
    // Validar unicidad de matrícula
    const existe = await db.query('SELECT 1 FROM estudiante WHERE matricula = $1', [matricula]);
    if (existe.rows.length > 0) {
      return res.status(409).json({ error: 'La matrícula ya está registrada' });
    }
    // Validar existencia de usuario
    const usuario = await db.query('SELECT 1 FROM usuario WHERE id_usuario = $1', [id_usuario]);
    if (usuario.rows.length === 0) {
      return res.status(404).json({ error: 'El usuario asociado no existe. Primero crea el usuario antes de registrar al estudiante.' });
    }
    // Validar existencia de grupo
    const grupo = await db.query('SELECT 1 FROM grupo WHERE id_grupo = $1', [grupo_id]);
    if (grupo.rows.length === 0) {
      return res.status(404).json({ error: 'El grupo asignado no existe.' });
    }
    // Validar cupo máximo de grupo (30 alumnos)
    const inscritosGrupo = await db.query('SELECT COUNT(*) FROM estudiante WHERE grupo_id = $1', [grupo_id]);
    if (parseInt(inscritosGrupo.rows[0].count) >= 30) {
      return res.status(409).json({ error: 'El grupo ya alcanzó el cupo máximo de 30 alumnos.' });
    }
    // ...insertar estudiante...
    const result = await db.query(
      'INSERT INTO estudiante (id_usuario, grupo_id, taller_id, matricula) VALUES ($1, $2, $3, $4) RETURNING *',
      [id_usuario, grupo_id, taller_id, matricula]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al registrar estudiante:', error);
    res.status(500).json({ error: 'Error al registrar estudiante', detalle: error.message });
  }
});

// Endpoint para eliminar un estudiante con validación de dependencias
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Verificar dependencias en calificaciones
    const calificacion = await db.query('SELECT 1 FROM calificacion WHERE estudiante_id = $1', [id]);
    if (calificacion.rows.length > 0) {
      return res.status(409).json({ error: 'No se puede eliminar el estudiante: tiene calificaciones registradas.' });
    }
    // Verificar dependencias en asistencias
    const asistencia = await db.query('SELECT 1 FROM asistencia WHERE usuario_id = $1', [id]);
    if (asistencia.rows.length > 0) {
      return res.status(409).json({ error: 'No se puede eliminar el estudiante: tiene asistencias registradas.' });
    }
    // Verificar dependencias en incidencias
    const incidencia = await db.query('SELECT 1 FROM incidencia WHERE usuario_id = $1', [id]);
    if (incidencia.rows.length > 0) {
      return res.status(409).json({ error: 'No se puede eliminar el estudiante: tiene incidencias registradas.' });
    }
    // Verificar dependencias en padre/tutor
    const padre = await db.query('SELECT 1 FROM padre WHERE estudiante_id = $1', [id]);
    if (padre.rows.length > 0) {
      return res.status(409).json({ error: 'No se puede eliminar el estudiante: tiene tutores asociados.' });
    }
    // Si no hay dependencias, eliminar estudiante
    const result = await db.query('DELETE FROM estudiante WHERE id_usuario = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }
    res.json({ mensaje: 'Estudiante eliminado correctamente', estudiante: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar estudiante', detalle: error.message });
  }
});

// Endpoint para listar todos los estudiantes (admin y docente)
router.get('/', auth, checkRole(['admin', 'docente']), async (req, res) => {
  try {
    const result = await db.query('SELECT e.*, u.nombre, u.rol FROM estudiante e JOIN usuario u ON e.id_usuario = u.id_usuario');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estudiantes', detalle: error.message });
  }
});

// Endpoint para obtener información de un estudiante específico (admin o el propio usuario)
router.get('/:id', auth, checkRole(['admin', 'estudiante', 'docente', 'padre']), async (req, res) => {
  const { id } = req.params;
  const rol = req.user?.rol || req.body.rol || req.headers['x-rol'];
  const userId = req.user?.id_usuario || req.body.id_usuario || req.headers['x-user-id'];
  if (rol !== 'admin' && parseInt(userId) !== parseInt(id)) {
    return res.status(403).json({ error: 'Solo puedes acceder a tu propia información de estudiante.' });
  }
  try {
    const result = await db.query('SELECT * FROM estudiante WHERE id_usuario = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estudiante', detalle: error.message });
  }
});

module.exports = router;