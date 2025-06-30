const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middlewares/auth');

// Consultar horario por usuario (estudiante o docente)
router.get('/usuario/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Buscar si es estudiante
    const estudiante = await db.query('SELECT grupo_id FROM estudiante WHERE id_usuario = $1', [id]);
    if (estudiante.rows.length > 0) {
      // Horario para estudiante (por grupo)
      const grupo_id = estudiante.rows[0].grupo_id;
      const result = await db.query(
        `SELECT h.id_horario AS id,
                g.anio AS grupo_anio,
                g.turno AS grupo_turno,
                m.nombre AS materia_nombre,
                u.nombre AS docente_nombre,
                h.dia, h.hora_inicio, h.hora_fin
         FROM horario h
         JOIN grupo g ON h.grupo_id = g.id_grupo
         JOIN materia m ON h.materia_id = m.id_materia
         JOIN docente d ON h.docente_id = d.id_usuario
         JOIN usuario u ON d.id_usuario = u.id_usuario
         WHERE h.grupo_id = $1
         ORDER BY h.dia, h.hora_inicio`,
        [grupo_id]
      );
      return res.json(result.rows);
    }
    // Buscar si es docente
    const docente = await db.query('SELECT id_usuario FROM docente WHERE id_usuario = $1', [id]);
    if (docente.rows.length > 0) {
      // Horario para docente (por docente)
      const result = await db.query(
        `SELECT h.id_horario AS id,
                g.anio AS grupo_anio,
                g.turno AS grupo_turno,
                m.nombre AS materia_nombre,
                h.dia, h.hora_inicio, h.hora_fin
         FROM horario h
         JOIN grupo g ON h.grupo_id = g.id_grupo
         JOIN materia m ON h.materia_id = m.id_materia
         WHERE h.docente_id = $1
         ORDER BY h.dia, h.hora_inicio`,
        [id]
      );
      return res.json(result.rows);
    }
    res.status(404).json({ error: 'Usuario no es estudiante ni docente o no tiene horario asignado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener horario', detalle: error.message });
  }
});

// Consultar horario solo para estudiante (por id_usuario)
router.get('/estudiante/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const estudiante = await db.query('SELECT grupo_id FROM estudiante WHERE id_usuario = $1', [id]);
    if (estudiante.rows.length > 0) {
      const grupo_id = estudiante.rows[0].grupo_id;
      const result = await db.query(
        `SELECT h.id_horario AS id,
                g.anio AS grupo_anio,
                g.turno AS grupo_turno,
                m.nombre AS materia_nombre, 
                u.nombre AS docente_nombre,
                h.dia, h.hora_inicio, h.hora_fin
         FROM horario h
         JOIN grupo g ON h.grupo_id = g.id_grupo
         JOIN materia m ON h.materia_id = m.id_materia
         JOIN docente d ON h.docente_id = d.id_usuario
         JOIN usuario u ON d.id_usuario = u.id_usuario
         WHERE h.grupo_id = $1
         ORDER BY h.dia, h.hora_inicio`,
        [grupo_id]
      );
      return res.json(result.rows);
    }
    res.status(404).json({ error: 'No existe estudiante o no tiene grupo asignado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener horario', detalle: error.message });
  }
});

// Obtener todos los horarios (solo admin)
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT h.id_horario AS id, 
             g.anio AS grupo_anio,
             g.turno AS grupo_turno,
             m.nombre AS materia_nombre, 
             u.nombre AS docente_nombre, 
             h.dia, h.hora_inicio, h.hora_fin
      FROM horario h
      LEFT JOIN grupo g ON h.grupo_id = g.id_grupo
      LEFT JOIN materia m ON h.materia_id = m.id_materia
      LEFT JOIN docente d ON h.docente_id = d.id_usuario
      LEFT JOIN usuario u ON d.id_usuario = u.id_usuario
      ORDER BY h.id_horario
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener horarios', detalle: error.message });
  }
});

// Endpoint para que el docente autenticado vea solo sus horarios, materias y grupos
router.get('/docente', auth, async (req, res) => {
  const docenteId = req.user?.id_usuario;
  if (!docenteId) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  try {
    const result = await db.query(`
      SELECT h.id_horario AS id,
             g.anio AS grupo_anio,
             g.turno AS grupo_turno,
             m.nombre AS materia_nombre,
             h.dia, h.hora_inicio, h.hora_fin
      FROM horario h
      JOIN grupo g ON h.grupo_id = g.id_grupo
      JOIN materia m ON h.materia_id = m.id_materia
      WHERE h.docente_id = $1
      ORDER BY h.dia, h.hora_inicio
    `, [docenteId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener horarios del docente', detalle: error.message });
  }
});

// Endpoint para que el estudiante autenticado consulte su propio horario
router.get('/mio', auth, async (req, res) => {
  const userId = req.user?.id_usuario;
  if (!userId) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  try {
    // Buscar si es estudiante
    const estudiante = await db.query('SELECT grupo_id FROM estudiante WHERE id_usuario = $1', [userId]);
    if (estudiante.rows.length > 0) {
      // Horario para estudiante (por grupo)
      const grupo_id = estudiante.rows[0].grupo_id;
      const result = await db.query(
        `SELECT h.id_horario AS id,
                g.anio AS grupo_anio,
                g.turno AS grupo_turno,
                m.nombre AS materia_nombre,
                u.nombre AS docente_nombre,
                h.dia, h.hora_inicio, h.hora_fin
         FROM horario h
         JOIN grupo g ON h.grupo_id = g.id_grupo
         JOIN materia m ON h.materia_id = m.id_materia
         JOIN docente d ON h.docente_id = d.id_usuario
         JOIN usuario u ON d.id_usuario = u.id_usuario
         WHERE h.grupo_id = $1
         ORDER BY h.dia, h.hora_inicio`,
        [grupo_id]
      );
      return res.json(result.rows);
    }
    res.status(404).json({ error: 'No existe estudiante o no tiene grupo asignado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener horario', detalle: error.message });
  }
});

module.exports = router;
