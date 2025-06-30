-- Eliminar todas las tablas principales (ajusta según tus dependencias reales)
DROP TABLE IF EXISTS asistencia CASCADE;
DROP TABLE IF EXISTS incidencia CASCADE;
DROP TABLE IF EXISTS reporte CASCADE;
DROP TABLE IF EXISTS calificacion CASCADE;
DROP TABLE IF EXISTS estudiante CASCADE;
DROP TABLE IF EXISTS padre CASCADE;
DROP TABLE IF EXISTS docente_materia CASCADE;
DROP TABLE IF EXISTS grupo CASCADE;
DROP TABLE IF EXISTS materia CASCADE;
DROP TABLE IF EXISTS taller CASCADE;
DROP TABLE IF EXISTS usuario CASCADE;

-- Crear tabla usuario (sin acentos ni eñes)
CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,
    usuario VARCHAR(20) NOT NULL UNIQUE, -- login segun formato del rol
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(100) NOT NULL,
    rol VARCHAR(20) NOT NULL,
    tipo_docente VARCHAR(10)
);

-- Crear tabla grupo
CREATE TABLE grupo (
    id_grupo SERIAL PRIMARY KEY,
    anio INTEGER NOT NULL,
    turno VARCHAR(20) NOT NULL
);

-- Crear tabla materia
CREATE TABLE materia (
    id_materia SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    anio INTEGER NOT NULL
);

-- Crear tabla taller
CREATE TABLE taller (
    id_taller SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    cupo INTEGER NOT NULL
);

-- Crear tabla estudiante
CREATE TABLE estudiante (
    id_usuario INTEGER PRIMARY KEY REFERENCES usuario(id_usuario),
    matricula VARCHAR(20) NOT NULL,
    grupo_id INTEGER REFERENCES grupo(id_grupo)
);

-- Crear tabla calificacion
CREATE TABLE calificacion (
    id_calificacion SERIAL PRIMARY KEY,
    estudiante_id INTEGER REFERENCES estudiante(id_usuario),
    materia_id INTEGER REFERENCES materia(id_materia),
    calificacion NUMERIC(4,2) NOT NULL,
    fecha DATE NOT NULL
);

-- Crear tabla padre
CREATE TABLE padre (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    direccion VARCHAR(200)
);

-- Crear tabla docente_materia
CREATE TABLE docente_materia (
    id SERIAL PRIMARY KEY,
    docente_id INTEGER REFERENCES usuario(id_usuario),
    materia_id INTEGER REFERENCES materia(id_materia),
    grupo_id INTEGER REFERENCES grupo(id_grupo)
);

-- Crear tabla asistencia
CREATE TABLE asistencia (
    id_asistencia SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuario(id_usuario),
    fecha DATE NOT NULL,
    presente BOOLEAN NOT NULL
);

-- Crear tabla incidencia
CREATE TABLE incidencia (
    id_incidencia SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuario(id_usuario),
    fecha DATE NOT NULL,
    descripcion TEXT
);

-- Crear tabla reporte
CREATE TABLE reporte (
    id_reporte SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuario(id_usuario),
    fecha DATE NOT NULL,
    descripcion TEXT
);

-- Usuarios de prueba para todos los roles
INSERT INTO usuario (id_usuario, usuario, nombre, correo, rol, contrasena, tipo_docente) VALUES
  (1, 'A01', 'Admin Uno', 'admin1@correo.com', 'admin', 'admin123', NULL),
  (2, 'A02', 'Admin Dos', 'admin2@correo.com', 'admin', 'admin123', NULL),
  (3, 'A03', 'Admin Tres', 'admin3@correo.com', 'admin', 'admin123', NULL),
  (4, 'BA000001', 'Docente Grupo 1', 'docente1@correo.com', 'docente', 'docente123', 'frente'),
  (5, 'BA000002', 'Docente Grupo 2', 'docente2@correo.com', 'docente', 'docente123', 'frente'),
  (6, 'BB000001', 'Docente Admin', 'docente3@correo.com', 'docente', 'docente123', 'admin'),
  (7, 'CABC123456DEF', 'Ana Lopez', 'ana1@correo.com', 'estudiante', '1234', NULL),
  (8, 'CDEF234567GHI', 'Luis Perez', 'luis2@correo.com', 'estudiante', '1234', NULL),
  (9, 'CJKL345678MNO', 'Maria Ruiz', 'maria3@correo.com', 'estudiante', '1234', NULL),
  (10, 'CPQR456789STU', 'Carlos Diaz', 'carlos4@correo.com', 'estudiante', '1234', NULL),
  (11, 'CVWX567890YZA', 'Sofia Torres', 'sofia5@correo.com', 'estudiante', '1234', NULL),
  (12, 'CBCD678901EFG', 'Juan Gomez', 'juan6@correo.com', 'estudiante', '1234', NULL),
  (13, 'CABC123456DEF1A', 'Padre Ana', 'padre1@correo.com', 'padre', 'padre123', NULL),
  (14, 'CDEF234567GHI2B', 'Padre Luis', 'padre2@correo.com', 'padre', 'padre123', NULL);

-- Grupos de prueba (2 grupos por año, 3 años = 6 grupos)
INSERT INTO grupo (id_grupo, anio, turno) VALUES
  (1, 1, 'Matutino'),
  (2, 1, 'Matutino'),
  (3, 2, 'Matutino'),
  (4, 2, 'Matutino'),
  (5, 3, 'Matutino'),
  (6, 3, 'Matutino');

-- Materias de prueba (6 por año, 3 años = 18 materias)
INSERT INTO materia (id_materia, nombre, anio) VALUES
  (1, 'Espanol', 1), (2, 'Matematicas', 1), (3, 'Geografia', 1), (4, 'Artes', 1), (5, 'Ingles', 1), (6, 'Biologia', 1),
  (7, 'Espanol', 2), (8, 'Matematicas', 2), (9, 'Historia Universal', 2), (10, 'Artes', 2), (11, 'Ingles', 2), (12, 'Fisica', 2),
  (13, 'Espanol', 3), (14, 'Matematicas', 3), (15, 'Historia de Mexico', 3), (16, 'Artes', 3), (17, 'Ingles', 3), (18, 'Quimica', 3);

-- Estudiantes de prueba
INSERT INTO estudiante (id_usuario, matricula, grupo_id) VALUES
  (7, 'A001', 1),
  (8, 'A002', 2),
  (9, 'A003', 3),
  (10, 'A004', 4),
  (11, 'A005', 5),
  (12, 'A006', 6);

-- Datos de prueba para calificaciones
INSERT INTO calificacion (estudiante_id, materia_id, calificacion, fecha) VALUES
  (7, 1, 8.5, '2025-06-01'),
  (7, 2, 9.0, '2025-06-01'),
  (8, 1, 7.5, '2025-06-01'),
  (8, 2, 8.0, '2025-06-01'),
  (9, 7, 9.2, '2025-06-01'),
  (9, 8, 8.7, '2025-06-01'),
  (10, 7, 6.5, '2025-06-01'),
  (10, 8, 7.0, '2025-06-01'),
  (11, 13, 8.8, '2025-06-01'),
  (11, 14, 9.1, '2025-06-01'),
  (12, 13, 7.9, '2025-06-01'),
  (12, 14, 8.3, '2025-06-01');

-- Talleres de prueba
INSERT INTO taller (id_taller, nombre, cupo) VALUES
  (1, 'Programacion', 30),
  (2, 'Electricidad', 30),
  (3, 'Dibujo Tecnico', 30),
  (4, 'Cocina', 30),
  (5, 'Textiles', 30),
  (6, 'Carpinteria', 30);

-- Padres de prueba
INSERT INTO padre (id_usuario, nombre, correo, contrasena, telefono, direccion) VALUES
  (13, 'Padre Ana', 'padre1@correo.com', 'padre123', '5551112222', 'Calle Uno #1'),
  (14, 'Padre Luis', 'padre2@correo.com', 'padre123', '5553334444', 'Calle Dos #2');

-- Docente-materia de prueba
INSERT INTO docente_materia (docente_id, materia_id, grupo_id) VALUES
  (4, 1, 1), (4, 2, 1), (4, 3, 1), (4, 4, 1), (4, 5, 1), (4, 6, 1),
  (5, 7, 2), (5, 8, 2), (5, 9, 2), (5, 10, 2), (5, 11, 2), (5, 12, 2),
  (6, 13, 3), (6, 14, 3), (6, 15, 3), (6, 16, 3), (6, 17, 3), (6, 18, 3);

-- Asistencias de prueba
INSERT INTO asistencia (usuario_id, fecha, presente) VALUES
  (7, '2025-06-01', true), (8, '2025-06-01', false), (9, '2025-06-01', true),
  (10, '2025-06-01', true), (11, '2025-06-01', false), (12, '2025-06-01', true),
  (4, '2025-06-01', true), (5, '2025-06-01', true), (6, '2025-06-01', true);

-- Incidencias de prueba
INSERT INTO incidencia (usuario_id, fecha, descripcion) VALUES
  (8, '2025-06-01', 'Llego tarde a clase'),
  (11, '2025-06-01', 'No entrego tarea'),
  (9, '2025-06-01', 'Falta injustificada');

-- Reportes de prueba
INSERT INTO reporte (usuario_id, fecha, descripcion) VALUES
  (8, '2025-06-01', 'Reporte semanal de conducta'),
  (11, '2025-06-01', 'Reporte semanal de conducta'),
  (9, '2025-06-01', 'Reporte semanal de conducta');
