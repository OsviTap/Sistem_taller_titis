-- ========================================
-- MIGRACION: ANIO DE VEHICULO
-- Sistema Taller Titis
-- ========================================
-- Agrega el campo anio en vehiculos y su snapshot en historial_visitas.
-- Diseñado para ser idempotente.

-- USE taller_titis;
-- (Comentado para usar la base de datos activa)

-- 1) Agregar columna anio en vehiculos (si no existe)
SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'vehiculos'
      AND COLUMN_NAME = 'anio'
);

SET @sql = IF(
    @column_exists = 0,
    'ALTER TABLE vehiculos ADD COLUMN anio INT NULL AFTER modeloId',
    'SELECT "Column anio already exists in vehiculos" AS Info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2) Backfill para registros existentes sin anio
--    Estrategia: usar el anio de createdAt si existe, caso contrario anio actual.
UPDATE vehiculos
SET anio = COALESCE(YEAR(createdAt), YEAR(CURDATE()))
WHERE anio IS NULL;

-- 3) Hacer la columna obligatoria
ALTER TABLE vehiculos MODIFY COLUMN anio INT NOT NULL;

-- 4) Agregar snapshot anioVehiculo en historial_visitas (si no existe)
SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'historial_visitas'
      AND COLUMN_NAME = 'anioVehiculo'
);

SET @sql = IF(
    @column_exists = 0,
    'ALTER TABLE historial_visitas ADD COLUMN anioVehiculo INT NULL AFTER modeloVehiculo',
    'SELECT "Column anioVehiculo already exists in historial_visitas" AS Info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 5) Poblar snapshot anioVehiculo en historial existente
UPDATE historial_visitas hv
INNER JOIN vehiculos v ON hv.vehiculoId = v.id
SET hv.anioVehiculo = v.anio
WHERE hv.anioVehiculo IS NULL;
