const express = require('express');
const router = express.Router();
const db = require('../config/db');
const checkRole = require('../middlewares/checkRole');
const config = require('../config/config');

// Listar todos los talleres con cupo máximo y cantidad de inscritos
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT t.id_taller AS id, t.nombre, t.cupo AS cupo_maximo,
        (SELECT COUNT(*) FROM estudiante e WHERE e.taller_id = t.id_taller) AS inscritos
      FROM taller t
      ORDER BY t.id_taller
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener talleres', detalle: error.message });
  }
});

// Endpoint para obtener alumnos inscritos en un taller
router.get('/:id/alumnos', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(`
      SELECT u.id_usuario, u.nombre, u.correo, e.matricula, e.grupo_id
      FROM estudiante e
      JOIN usuario u ON u.id_usuario = e.id_usuario
      WHERE e.taller_id = $1
      ORDER BY u.nombre
    `, [id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener alumnos inscritos', detalle: error.message });
  }
});

// Elegir taller para un estudiante (solo admin)
router.put('/elegir', checkRole(['admin']), async (req, res) => {
  return res.status(501).json({ error: 'Funcionalidad no implementada: no existe relación estudiante-taller en la base de datos actual.' });
});

// Endpoint para eliminar un taller con validación de dependencias
router.delete('/:id', checkRole(['admin']), async (req, res) => {
  const { id } = req.params;
  try {
    // Verificar dependencias en estudiantes
    const estudiantes = await db.query('SELECT 1 FROM estudiante WHERE taller_id = $1', [id]);
    if (estudiantes.rows.length > 0) {
      return res.status(409).json({ error: 'No se puede eliminar el taller: hay estudiantes inscritos.' });
    }
    // Si no hay dependencias, eliminar taller
    const result = await db.query('DELETE FROM taller WHERE id_taller = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Taller no encontrado' });
    }
    res.json({ mensaje: 'Taller eliminado correctamente', taller: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar taller', detalle: error.message });
  }
});

// Endpoint para crear un taller (solo admin)
router.post('/', checkRole(['admin']), async (req, res) => {
  const { nombre, descripcion, cupo } = req.body;
  if (!nombre || !cupo) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }
  if (isNaN(cupo) || cupo < 1 || cupo > 30) {
    return res.status(400).json({ error: 'El cupo debe ser un número entero entre 1 y 30.' });
  }
  try {
    const result = await db.query(
      'INSERT INTO taller (nombre, descripcion, cupo) VALUES ($1, $2, $3) RETURNING *',
      [nombre, descripcion, cupo]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear taller', detalle: error.message });
  }
});

// Endpoint para actualizar el cupo de un taller (solo admin)
router.put('/:id/cupo', checkRole(['admin']), async (req, res) => {
  const { id } = req.params;
  const { cupo } = req.body;
  if (cupo === undefined || isNaN(cupo) || cupo < 1 || cupo > 30) {
    return res.status(400).json({ error: 'El cupo debe ser un número entero entre 1 y 30.' });
  }
  // Validar que el cupo no sea menor que el número de estudiantes inscritos
  const inscritos = await db.query('SELECT COUNT(*) FROM estudiante WHERE taller_id = $1', [id]);
  if (parseInt(inscritos.rows[0].count) > cupo) {
    return res.status(409).json({ error: 'No puedes establecer un cupo menor al número de estudiantes ya inscritos.' });
  }
  try {
    const result = await db.query('UPDATE taller SET cupo = $1 WHERE id_taller = $2 RETURNING *', [cupo, id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Taller no encontrado' });
    }
    res.json({ mensaje: 'Cupo actualizado correctamente', taller: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar cupo', detalle: error.message });
  }
});

// Inscribir estudiante autenticado a un taller (rol estudiante)
router.post('/:id/inscribir', checkRole(['estudiante']), async (req, res) => {
  const tallerId = parseInt(req.params.id);
  const userId = req.user.id_usuario;
  if (!tallerId) return res.status(400).json({ error: 'ID de taller inválido' });
  try {
    // Obtener el estudiante asociado al usuario autenticado
    const estudianteRes = await db.query('SELECT * FROM estudiante WHERE id_usuario = $1', [userId]);
    if (estudianteRes.rows.length === 0) {
      return res.status(404).json({ error: 'No se encontró el estudiante asociado a este usuario.' });
    }
    const estudiante = estudianteRes.rows[0];
    // Validar si ya está inscrito en un taller
    if (estudiante.taller_id && estudiante.taller_id === tallerId) {
      return res.status(409).json({ error: 'Ya estás inscrito en este taller.' });
    }
    if (estudiante.taller_id && estudiante.taller_id !== null) {
      return res.status(409).json({ error: 'Ya estás inscrito en otro taller. Debes solicitar cambio con un administrador.' });
    }
    // Validar cupo del taller
    const cupoRes = await db.query('SELECT cupo FROM taller WHERE id_taller = $1', [tallerId]);
    if (cupoRes.rows.length === 0) {
      return res.status(404).json({ error: 'Taller no encontrado.' });
    }
    const cupoMax = cupoRes.rows[0].cupo;
    const inscritosRes = await db.query('SELECT COUNT(*) FROM estudiante WHERE taller_id = $1', [tallerId]);
    if (parseInt(inscritosRes.rows[0].count) >= cupoMax) {
      return res.status(409).json({ error: 'El taller ya alcanzó el cupo máximo.' });
    }
    // Actualizar el taller_id del estudiante
    await db.query('UPDATE estudiante SET taller_id = $1 WHERE id_usuario = $2', [tallerId, userId]);
    res.json({ mensaje: 'Inscripción exitosa al taller.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al inscribir al taller', detalle: error.message });
  }
});

// Dar de baja a un estudiante de un taller (solo admin)
router.delete('/:tallerId/estudiante/:estudianteId', checkRole(['admin']), async (req, res) => {
  const { tallerId, estudianteId } = req.params;
  
  try {
    // Verificar que el taller existe
    const tallerResult = await db.query('SELECT nombre FROM taller WHERE id_taller = $1', [tallerId]);
    if (tallerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Taller no encontrado' });
    }
    
    // Verificar que el estudiante existe y está inscrito en este taller
    const estudianteResult = await db.query(`
      SELECT e.id_usuario, u.nombre, e.matricula, e.taller_id 
      FROM estudiante e 
      JOIN usuario u ON e.id_usuario = u.id_usuario 
      WHERE e.id_usuario = $1
    `, [estudianteId]);
    
    if (estudianteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }
    
    const estudiante = estudianteResult.rows[0];
    
    // Verificar que el estudiante está inscrito en el taller especificado
    if (estudiante.taller_id !== parseInt(tallerId)) {
      if (estudiante.taller_id === null) {
        return res.status(409).json({ error: 'El estudiante no está inscrito en ningún taller' });
      } else {
        return res.status(409).json({ error: 'El estudiante no está inscrito en este taller' });
      }
    }
    
    // Dar de baja al estudiante (establecer taller_id como null)
    await db.query('UPDATE estudiante SET taller_id = NULL WHERE id_usuario = $1', [estudianteId]);
    
    res.json({ 
      mensaje: 'Estudiante dado de baja del taller exitosamente',
      estudiante: {
        id_usuario: estudiante.id_usuario,
        nombre: estudiante.nombre,
        matricula: estudiante.matricula
      },
      taller: {
        id_taller: tallerId,
        nombre: tallerResult.rows[0].nombre
      }
    });
    
  } catch (error) {
    console.error('Error al dar de baja estudiante del taller:', error);
    res.status(500).json({ error: 'Error al dar de baja estudiante del taller', detalle: error.message });
  }
});

module.exports = router;
