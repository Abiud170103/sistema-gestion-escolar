-- Agrega el campo descripcion a la tabla taller si no existe
ALTER TABLE taller ADD COLUMN IF NOT EXISTS descripcion TEXT;
-- Renombra cupo a cupo_maximo si es necesario (ajusta según tu esquema)
-- ALTER TABLE taller RENAME COLUMN cupo TO cupo_maximo;

-- No borra datos existentes. Ejecuta esto solo una vez.
