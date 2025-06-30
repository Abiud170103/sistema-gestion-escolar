const express = require('express');
const router = express.Router();
const db = require('../config/db');
const checkRole = require('../middlewares/checkRole');

// Asignar materia a docente (solo admin)
router.post('/', checkRole(['admin']), async (req, res) => {
  const { id_docente, id_materia } = req.body;
  if (!id_docente || !id_materia) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }
  try {
    // Validar existencia de docente
    const docente = await db.query('SELECT 1 FROM docente WHERE id_usuario = $1', [id_docente]);
    if (docente.rows.length === 0) {
      return res.status(404).json({ error: 'Docente no encontrado' });
    }
    // Validar existencia de materia
    const materia = await db.query('SELECT 1 FROM materia WHERE id_materia = $1', [id_materia]);
    if (materia.rows.length === 0) {
      return res.status(404).json({ error: 'Materia no encontrada' });
    }
    // Validar cantidad de materias asignadas
    const materiasAsignadas = await db.query('SELECT COUNT(*) FROM docente_materia WHERE id_docente = $1', [id_docente]);
    const count = parseInt(materiasAsignadas.rows[0].count);
    if (count >= 4) {
      return res.status(409).json({ error: 'Un docente no puede tener más de 4 materias asignadas' });
    }
    // Validar que no tenga menos de 2 materias (opcional, para eliminación)
    // Validar que la materia no esté ya asignada
    const yaAsignada = await db.query('SELECT 1 FROM docente_materia WHERE id_docente = $1 AND id_materia = $2', [id_docente, id_materia]);
    if (yaAsignada.rows.length > 0) {
      return res.status(409).json({ error: 'La materia ya está asignada a este docente' });
    }
    const result = await db.query('INSERT INTO docente_materia (id_docente, id_materia) VALUES ($1, $2) RETURNING *', [id_docente, id_materia]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al asignar materia', detalle: error.message });
  }
});

module.exports = router;
