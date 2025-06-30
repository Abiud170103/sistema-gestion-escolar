// Configuración principal de Express y carga de rutas
const express = require('express');
const app = express();
const config = require('./config/config');
const usuarioRoutes = require('./routes/usuarioRoutes');
const calificacionRoutes = require('./routes/calificacionRoutes');
const asistenciaRoutes = require('./routes/asistenciaRoutes');
const tallerRoutes = require('./routes/tallerRoutes');
const incidenciaRoutes = require('./routes/incidenciaRoutes');
const horarioRoutes = require('./routes/horarioRoutes');
const docenteMateriaRoutes = require('./routes/docenteMateriaRoutes');
const estudianteRoutes = require('./routes/estudianteRoutes');
const padreRoutes = require('./routes/padreRoutes');
const materiaRoutes = require('./routes/materiaRoutes');
const db = require('./config/db');
const auth = require('./middlewares/auth');
const cors = require('cors');

app.use(express.json());
// Middleware CORS robusto para permitir OPTIONS y métodos personalizados
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Permitir preflight para cualquier ruta
app.options('*', cors());

// Login debe ser público
app.use('/api/usuarios', usuarioRoutes);

// Rutas de padres (algunas requieren auth, otras no)
app.use('/api/padres', padreRoutes);

// Proteger los demás endpoints
app.use('/api/calificaciones', auth, calificacionRoutes);
app.use('/api/asistencias', auth, asistenciaRoutes);
app.use('/api/talleres', auth, tallerRoutes);
app.use('/api/incidencias', auth, incidenciaRoutes);
app.use('/api/horarios', auth, horarioRoutes);
app.use('/api/docente-materia', auth, docenteMateriaRoutes);
app.use('/api/estudiantes', auth, estudianteRoutes);
app.use('/api/materias', auth, materiaRoutes); // Para endpoint /materias

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API de Gestión Escolar funcionando');
});

// Prueba de conexión a la base de datos
(async () => {
  try {
    await db.query('SELECT NOW()');
    console.log('Conexión a PostgreSQL exitosa');
  } catch (err) {
    console.error('Error al conectar a PostgreSQL:', err);
  }
})();

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = config.port || 3001;
app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en puerto ${PORT}`);
});
