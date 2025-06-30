// Configuración de variables de entorno y parámetros generales
module.exports = {
  port: process.env.PORT || 3001    ,
  db: {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'secundaria',
    password: process.env.DB_PASSWORD || '040917',
    port: process.env.DB_PORT || 5432,
  },
  parametros: {
    fechaLimiteCambioTaller: process.env.FECHA_LIMITE_CAMBIO_TALLER || '2025-06-30',
  },
  jwtSecret: process.env.JWT_SECRET || 'supersecreto',
};
