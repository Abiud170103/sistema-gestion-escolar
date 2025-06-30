-- Migración para añadir campos de contraseña temporal y expiración
-- Fecha: 2025-06-25

-- Añadir campos para manejo de contraseñas temporales
ALTER TABLE usuario ADD COLUMN IF NOT EXISTS temp_password VARCHAR(100);
ALTER TABLE usuario ADD COLUMN IF NOT EXISTS temp_password_expires TIMESTAMP;
ALTER TABLE usuario ADD COLUMN IF NOT EXISTS password_change_required BOOLEAN DEFAULT FALSE;
ALTER TABLE usuario ADD COLUMN IF NOT EXISTS first_login BOOLEAN DEFAULT TRUE;

-- Crear índice para mejorar consultas de expiración
CREATE INDEX IF NOT EXISTS idx_usuario_temp_password_expires ON usuario(temp_password_expires);
