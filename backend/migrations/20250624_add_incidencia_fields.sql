-- Agregar campos faltantes a la tabla incidencia
-- Fecha: 2025-06-24

-- Agregar columna tipo si no existe
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'incidencia' AND column_name = 'tipo') THEN
        ALTER TABLE incidencia ADD COLUMN tipo VARCHAR(100);
    END IF;
END $$;

-- Agregar columna sancion si no existe
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'incidencia' AND column_name = 'sancion') THEN
        ALTER TABLE incidencia ADD COLUMN sancion VARCHAR(100);
    END IF;
END $$;

-- Agregar columna materia_id si no existe
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'incidencia' AND column_name = 'materia_id') THEN
        ALTER TABLE incidencia ADD COLUMN materia_id INTEGER REFERENCES materia(id_materia);
    END IF;
END $$;

-- Agregar columna taller_id si no existe
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'incidencia' AND column_name = 'taller_id') THEN
        ALTER TABLE incidencia ADD COLUMN taller_id INTEGER REFERENCES taller(id_taller);
    END IF;
END $$;

-- Agregar índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_incidencia_materia_id ON incidencia(materia_id);
CREATE INDEX IF NOT EXISTS idx_incidencia_taller_id ON incidencia(taller_id);
CREATE INDEX IF NOT EXISTS idx_incidencia_tipo ON incidencia(tipo);
CREATE INDEX IF NOT EXISTS idx_incidencia_fecha ON incidencia(fecha);