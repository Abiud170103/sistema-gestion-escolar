-- Grupos
DELETE FROM horario;
DELETE FROM calificacion;
DELETE FROM asistencia;
DELETE FROM incidencia;
DELETE FROM reporte;
DELETE FROM padre;
DELETE FROM estudiante;
DELETE FROM grupo;
-- Materias
DELETE FROM docente_materia;
DELETE FROM materia;
-- Talleres
DELETE FROM taller;

INSERT INTO grupo (id_grupo, anio, turno) VALUES
  (1, 1, 'Matutino'), (2, 1, 'Matutino'),
  (3, 2, 'Matutino'), (4, 2, 'Matutino'),
  (5, 3, 'Matutino'), (6, 3, 'Matutino');

INSERT INTO materia (id_materia, nombre, anio) VALUES
  (1, 'Español', 1), (2, 'Matemáticas', 1), (3, 'Geografía', 1), (4, 'Artes', 1), (5, 'Inglés', 1), (6, 'Biología', 1),
  (7, 'Español', 2), (8, 'Matemáticas', 2), (9, 'Historia Universal', 2), (10, 'Artes', 2), (11, 'Inglés', 2), (12, 'Física', 2),
  (13, 'Español', 3), (14, 'Matemáticas', 3), (15, 'Historia de México', 3), (16, 'Artes', 3), (17, 'Inglés', 3), (18, 'Química', 3);

INSERT INTO taller (id_taller, nombre, cupo) VALUES (1, 'Taller A', 30), (2, 'Taller B', 30);

-- Horarios para cada grupo (ejemplo: lunes a viernes, 7:00-13:00, 6 materias)
-- 1A
INSERT INTO horario (grupo_id, materia_id, dia, hora_inicio, hora_fin) VALUES
  (1, 1, 'Lunes', '07:00', '07:50'),
  (1, 2, 'Lunes', '07:50', '08:40'),
  (1, 3, 'Lunes', '08:40', '09:30'),
  (1, 4, 'Lunes', '09:30', '10:20'),
  (1, 5, 'Lunes', '10:20', '11:10'),
  (1, 6, 'Lunes', '11:10', '12:00'),
  (1, 1, 'Martes', '08:40', '09:30'),
  (1, 2, 'Martes', '09:30', '10:20'),
  (1, 3, 'Martes', '10:20', '11:10'),
  (1, 4, 'Martes', '11:10', '12:00');

-- 1B
INSERT INTO horario (grupo_id, materia_id, dia, hora_inicio, hora_fin) VALUES
  (2, 1, 'Lunes', '07:00', '07:50'),
  (2, 2, 'Lunes', '07:50', '08:40'),
  (2, 3, 'Lunes', '08:40', '09:30'),
  (2, 4, 'Lunes', '09:30', '10:20'),
  (2, 5, 'Lunes', '10:20', '11:10'),
  (2, 6, 'Lunes', '11:10', '12:00'),
  (2, 1, 'Martes', '08:40', '09:30'),
  (2, 2, 'Martes', '09:30', '10:20'),
  (2, 3, 'Martes', '10:20', '11:10'),
  (2, 4, 'Martes', '11:10', '12:00');

-- 2A
INSERT INTO horario (grupo_id, materia_id, dia, hora_inicio, hora_fin) VALUES
  (3, 7, 'Lunes', '07:00', '07:50'),
  (3, 8, 'Lunes', '07:50', '08:40'),
  (3, 9, 'Lunes', '08:40', '09:30'),
  (3, 10, 'Lunes', '09:30', '10:20'),
  (3, 11, 'Lunes', '10:20', '11:10'),
  (3, 12, 'Lunes', '11:10', '12:00'),
  (3, 7, 'Martes', '08:40', '09:30'),
  (3, 8, 'Martes', '09:30', '10:20'),
  (3, 9, 'Martes', '10:20', '11:10'),
  (3, 10, 'Martes', '11:10', '12:00');

-- 2B
INSERT INTO horario (grupo_id, materia_id, dia, hora_inicio, hora_fin) VALUES
  (4, 7, 'Lunes', '07:00', '07:50'),
  (4, 8, 'Lunes', '07:50', '08:40'),
  (4, 9, 'Lunes', '08:40', '09:30'),
  (4, 10, 'Lunes', '09:30', '10:20'),
  (4, 11, 'Lunes', '10:20', '11:10'),
  (4, 12, 'Lunes', '11:10', '12:00'),
  (4, 7, 'Martes', '08:40', '09:30'),
  (4, 8, 'Martes', '09:30', '10:20'),
  (4, 9, 'Martes', '10:20', '11:10'),
  (4, 10, 'Martes', '11:10', '12:00');

-- 3A
INSERT INTO horario (grupo_id, materia_id, dia, hora_inicio, hora_fin) VALUES
  (5, 13, 'Lunes', '07:00', '07:50'),
  (5, 14, 'Lunes', '07:50', '08:40'),
  (5, 15, 'Lunes', '08:40', '09:30'),
  (5, 16, 'Lunes', '09:30', '10:20'),
  (5, 17, 'Lunes', '10:20', '11:10'),
  (5, 18, 'Lunes', '11:10', '12:00'),
  (5, 13, 'Martes', '08:40', '09:30'),
  (5, 14, 'Martes', '09:30', '10:20'),
  (5, 15, 'Martes', '10:20', '11:10'),
  (5, 16, 'Martes', '11:10', '12:00');

-- 3B
INSERT INTO horario (grupo_id, materia_id, dia, hora_inicio, hora_fin) VALUES
  (6, 13, 'Lunes', '07:00', '07:50'),
  (6, 14, 'Lunes', '07:50', '08:40'),
  (6, 15, 'Lunes', '08:40', '09:30'),
  (6, 16, 'Lunes', '09:30', '10:20'),
  (6, 17, 'Lunes', '10:20', '11:10'),
  (6, 18, 'Lunes', '11:10', '12:00'),
  (6, 13, 'Martes', '08:40', '09:30'),
  (6, 14, 'Martes', '09:30', '10:20'),
  (6, 15, 'Martes', '10:20', '11:10'),
  (6, 16, 'Martes', '11:10', '12:00');

-- Usuarios de prueba para estudiantes
INSERT INTO usuario (id_usuario, nombre, correo, rol, contraseña) VALUES
  (1, 'Ana López', 'ana1@correo.com', 'estudiante', '1234'),
  (2, 'Luis Pérez', 'luis2@correo.com', 'estudiante', '1234'),
  (3, 'María Ruiz', 'maria3@correo.com', 'estudiante', '1234'),
  (4, 'Carlos Díaz', 'carlos4@correo.com', 'estudiante', '1234'),
  (5, 'Sofía Torres', 'sofia5@correo.com', 'estudiante', '1234'),
  (6, 'Juan Gómez', 'juan6@correo.com', 'estudiante', '1234');

-- Estudiantes de prueba
INSERT INTO estudiante (id_usuario, matricula, grupo_id) VALUES
  (1, 'A001', 1),
  (2, 'A002', 2),
  (3, 'A003', 3),
  (4, 'A004', 4),
  (5, 'A005', 5),
  (6, 'A006', 6);

-- Datos de prueba para calificaciones
INSERT INTO calificacion (estudiante_id, materia_id, calificacion, fecha) VALUES
  (1, 1, 8.5, '2025-06-01'),
  (1, 2, 9.0, '2025-06-01'),
  (2, 1, 7.5, '2025-06-01'),
  (2, 2, 8.0, '2025-06-01'),
  (3, 7, 9.2, '2025-06-01'),
  (3, 8, 8.7, '2025-06-01'),
  (4, 7, 6.5, '2025-06-01'),
  (4, 8, 7.0, '2025-06-01'),
  (5, 13, 8.8, '2025-06-01'),
  (5, 14, 9.1, '2025-06-01'),
  (6, 13, 7.9, '2025-06-01'),
  (6, 14, 8.3, '2025-06-01');

-- Asignación de docentes: se realiza desde el frontend o con otro script, respetando los límites de materias por docente.
