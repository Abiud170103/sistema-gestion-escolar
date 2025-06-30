const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Obtener todas las materias
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM materia');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener materias', detalle: error.message });
  }
});

module.exports = router;
