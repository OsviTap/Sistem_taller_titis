-- ========================================
-- MIGRACION: VISITAS / HISTORIAL / PRODUCTO EXTERNO (COMPAT)
-- Sistema Taller Titis
-- ========================================
-- Objetivo:
-- 1) Alinear esquema real con los modelos actuales
-- 2) Evitar errores ER_BAD_FIELD_ERROR en detalle_visitas
-- 3) Dejar snapshot e historico consistentes
-- 4) Permitir re-ejecucion segura (idempotente)

-- No fijamos USE para que funcione con la BD activa de la conexion

SET SQL_SAFE_UPDATES = 0;

-- ========================================
-- 0) Detectar tabla de productos (Productos / productos)
-- ========================================
SET @productos_table = (
    SELECT TABLE_NAME
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME IN ('Productos', 'productos')
    ORDER BY CASE WHEN TABLE_NAME = 'Productos' THEN 0 ELSE 1 END
    LIMIT 1
);

SET @servicios_table = (
    SELECT TABLE_NAME
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME IN ('servicios', 'Servicios')
    ORDER BY CASE WHEN TABLE_NAME = 'servicios' THEN 0 ELSE 1 END
    LIMIT 1
);

-- ========================================
-- 1) detalle_visitas: columnas para inventario externo/historico
-- ========================================

-- nombreProducto snapshot
SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'detalle_visitas'
      AND COLUMN_NAME = 'nombreProducto'
);
SET @sql = IF(@column_exists = 0,
    'ALTER TABLE detalle_visitas ADD COLUMN nombreProducto VARCHAR(255) NULL AFTER itemId',
    'SELECT "Column nombreProducto already exists in detalle_visitas" AS Info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- origenInventario
SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'detalle_visitas'
      AND COLUMN_NAME = 'origenInventario'
);
SET @sql = IF(@column_exists = 0,
    'ALTER TABLE detalle_visitas ADD COLUMN origenInventario ENUM(''INVENTARIO'',''COMPRA_DIRECTA'',''HISTORICO'') NOT NULL DEFAULT ''INVENTARIO'' AFTER subtotal',
    'SELECT "Column origenInventario already exists in detalle_visitas" AS Info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Homologar definicion de origenInventario por si existe con otro ENUM
SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'detalle_visitas'
      AND COLUMN_NAME = 'origenInventario'
);
SET @sql = IF(@column_exists > 0,
    'ALTER TABLE detalle_visitas MODIFY COLUMN origenInventario ENUM(''INVENTARIO'',''COMPRA_DIRECTA'',''HISTORICO'') NOT NULL DEFAULT ''INVENTARIO''',
    'SELECT "Column origenInventario missing in detalle_visitas" AS Info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- afectaStock
SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'detalle_visitas'
      AND COLUMN_NAME = 'afectaStock'
);
SET @sql = IF(@column_exists = 0,
    'ALTER TABLE detalle_visitas ADD COLUMN afectaStock TINYINT(1) NOT NULL DEFAULT 1 AFTER origenInventario',
    'SELECT "Column afectaStock already exists in detalle_visitas" AS Info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'detalle_visitas'
      AND COLUMN_NAME = 'afectaStock'
);
SET @sql = IF(@column_exists > 0,
    'ALTER TABLE detalle_visitas MODIFY COLUMN afectaStock TINYINT(1) NOT NULL DEFAULT 1',
    'SELECT "Column afectaStock missing in detalle_visitas" AS Info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- costoCompraExterna
SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'detalle_visitas'
      AND COLUMN_NAME = 'costoCompraExterna'
);
SET @sql = IF(@column_exists = 0,
    'ALTER TABLE detalle_visitas ADD COLUMN costoCompraExterna DECIMAL(10,2) NULL AFTER afectaStock',
    'SELECT "Column costoCompraExterna already exists in detalle_visitas" AS Info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- observacionInventario
SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'detalle_visitas'
      AND COLUMN_NAME = 'observacionInventario'
);
SET @sql = IF(@column_exists = 0,
    'ALTER TABLE detalle_visitas ADD COLUMN observacionInventario VARCHAR(255) NULL AFTER costoCompraExterna',
    'SELECT "Column observacionInventario already exists in detalle_visitas" AS Info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Backfill basico de columnas nuevas
UPDATE detalle_visitas
SET origenInventario = 'INVENTARIO'
WHERE origenInventario IS NULL OR TRIM(origenInventario) = '';

UPDATE detalle_visitas
SET afectaStock = CASE WHEN tipo = 'Producto' THEN 1 ELSE 0 END
WHERE afectaStock IS NULL;

-- Snapshot para detalle de producto/servicio
SET @sql = CASE
    WHEN @productos_table IS NULL THEN 'SELECT "No product table detected (Productos/productos)" AS Info'
    ELSE CONCAT(
        'UPDATE detalle_visitas dv ',
        'INNER JOIN `', @productos_table, '` p ON dv.itemId = p.id ',
        'SET dv.nombreProducto = p.nombre ',
        'WHERE dv.tipo = ''Producto'' AND (dv.nombreProducto IS NULL OR TRIM(dv.nombreProducto) = '''')'
    )
END;
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = CASE
  WHEN @servicios_table IS NULL THEN 'SELECT "No services table detected (servicios/Servicios)" AS Info'
  ELSE CONCAT(
    'UPDATE detalle_visitas dv ',
    'INNER JOIN `', @servicios_table, '` s ON dv.itemId = s.id ',
    'SET dv.nombreProducto = s.nombre ',
    'WHERE dv.tipo = ''Servicio'' AND (dv.nombreProducto IS NULL OR TRIM(dv.nombreProducto) = '''')'
  )
END;
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ========================================
-- 2) historial_visitas: snapshots + fecha DATE
-- ========================================
SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'historial_visitas'
      AND COLUMN_NAME = 'nombreCliente'
);
SET @sql = IF(@column_exists = 0,
    'ALTER TABLE historial_visitas ADD COLUMN nombreCliente VARCHAR(255) NULL AFTER clienteId',
    'SELECT "Column nombreCliente already exists in historial_visitas" AS Info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'historial_visitas'
      AND COLUMN_NAME = 'placaVehiculo'
);
SET @sql = IF(@column_exists = 0,
    'ALTER TABLE historial_visitas ADD COLUMN placaVehiculo VARCHAR(255) NULL AFTER vehiculoId',
    'SELECT "Column placaVehiculo already exists in historial_visitas" AS Info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'historial_visitas'
      AND COLUMN_NAME = 'marcaVehiculo'
);
SET @sql = IF(@column_exists = 0,
    'ALTER TABLE historial_visitas ADD COLUMN marcaVehiculo VARCHAR(255) NULL AFTER placaVehiculo',
    'SELECT "Column marcaVehiculo already exists in historial_visitas" AS Info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'historial_visitas'
      AND COLUMN_NAME = 'modeloVehiculo'
);
SET @sql = IF(@column_exists = 0,
    'ALTER TABLE historial_visitas ADD COLUMN modeloVehiculo VARCHAR(255) NULL AFTER marcaVehiculo',
    'SELECT "Column modeloVehiculo already exists in historial_visitas" AS Info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'historial_visitas'
      AND COLUMN_NAME = 'anioVehiculo'
);
SET @sql = IF(@column_exists = 0,
    'ALTER TABLE historial_visitas ADD COLUMN anioVehiculo INT NULL AFTER modeloVehiculo',
    'SELECT "Column anioVehiculo already exists in historial_visitas" AS Info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Convertir fecha a DATE si sigue en DATETIME
SET @col_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'historial_visitas'
      AND COLUMN_NAME = 'fecha'
);
SET @is_date = (
    SELECT IFNULL(MAX(CASE WHEN DATA_TYPE = 'date' THEN 1 ELSE 0 END), 0)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'historial_visitas'
      AND COLUMN_NAME = 'fecha'
);
SET @sql = CASE
    WHEN @col_exists = 0 THEN 'SELECT "Column historial_visitas.fecha missing" AS Info'
    WHEN @is_date = 1 THEN 'SELECT "historial_visitas.fecha already DATE" AS Info'
    ELSE 'ALTER TABLE historial_visitas MODIFY COLUMN fecha DATE NOT NULL'
END;
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Backfill snapshots
UPDATE historial_visitas hv
INNER JOIN clientes c ON hv.clienteId = c.id
SET hv.nombreCliente = c.nombre
WHERE hv.nombreCliente IS NULL OR TRIM(hv.nombreCliente) = '';

UPDATE historial_visitas hv
INNER JOIN vehiculos v ON hv.vehiculoId = v.id
LEFT JOIN marcas m ON v.marcaId = m.id
LEFT JOIN modelos mo ON v.modeloId = mo.id
SET hv.placaVehiculo = v.placa,
    hv.marcaVehiculo = m.nombre,
    hv.modeloVehiculo = mo.nombre,
    hv.anioVehiculo = v.anio
WHERE hv.placaVehiculo IS NULL
   OR hv.marcaVehiculo IS NULL
   OR hv.modeloVehiculo IS NULL
   OR hv.anioVehiculo IS NULL;

-- ========================================
-- 3) visitas: fecha DATE
-- ========================================
SET @col_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'visitas'
      AND COLUMN_NAME = 'fecha'
);
SET @is_date = (
    SELECT IFNULL(MAX(CASE WHEN DATA_TYPE = 'date' THEN 1 ELSE 0 END), 0)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'visitas'
      AND COLUMN_NAME = 'fecha'
);
SET @sql = CASE
    WHEN @col_exists = 0 THEN 'SELECT "Column visitas.fecha missing" AS Info'
    WHEN @is_date = 1 THEN 'SELECT "visitas.fecha already DATE" AS Info'
    ELSE 'ALTER TABLE visitas MODIFY COLUMN fecha DATE NOT NULL'
END;
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ========================================
-- 4) product_history: snapshot de nombreProducto
-- ========================================
SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'product_history'
      AND COLUMN_NAME = 'nombreProducto'
);
SET @sql = IF(@column_exists = 0,
    'ALTER TABLE product_history ADD COLUMN nombreProducto VARCHAR(255) NULL AFTER cantidad',
    'SELECT "Column nombreProducto already exists in product_history" AS Info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = CASE
    WHEN @productos_table IS NULL THEN 'SELECT "No product table detected (Productos/productos)" AS Info'
    ELSE CONCAT(
        'UPDATE product_history ph ',
        'INNER JOIN `', @productos_table, '` p ON ph.productoId = p.id ',
        'SET ph.nombreProducto = p.nombre ',
    'WHERE ph.nombreProducto IS NULL OR LENGTH(TRIM(ph.nombreProducto)) = 0'
    )
END;
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ========================================
-- 5) productos: columnas esperadas por modelo
-- ========================================
SET @col_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = @productos_table
      AND COLUMN_NAME = 'sku'
);
SET @sql = CASE
    WHEN @productos_table IS NULL THEN 'SELECT "No product table detected (Productos/productos)" AS Info'
    WHEN @col_exists = 0 THEN CONCAT('ALTER TABLE `', @productos_table, '` ADD COLUMN sku VARCHAR(80) NULL AFTER nombre')
    ELSE 'SELECT "Column sku already exists" AS Info'
END;
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = @productos_table
      AND COLUMN_NAME = 'stockMinimo'
);
SET @sql = CASE
    WHEN @productos_table IS NULL THEN 'SELECT "No product table detected (Productos/productos)" AS Info'
    WHEN @col_exists = 0 THEN CONCAT('ALTER TABLE `', @productos_table, '` ADD COLUMN stockMinimo INT NOT NULL DEFAULT 0 AFTER stock')
    ELSE 'SELECT "Column stockMinimo already exists" AS Info'
END;
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = @productos_table
      AND COLUMN_NAME = 'deletedAt'
);
SET @sql = CASE
    WHEN @productos_table IS NULL THEN 'SELECT "No product table detected (Productos/productos)" AS Info'
    WHEN @col_exists = 0 THEN CONCAT('ALTER TABLE `', @productos_table, '` ADD COLUMN deletedAt DATETIME NULL AFTER updatedAt')
    ELSE 'SELECT "Column deletedAt already exists" AS Info'
END;
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ========================================
-- 6) Indices de compatibilidad/performance
-- ========================================
SET @idx_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'detalle_visitas'
      AND INDEX_NAME = 'idx_detalle_visitas_visita_estado'
);
SET @sql = IF(@idx_exists = 0,
    'CREATE INDEX idx_detalle_visitas_visita_estado ON detalle_visitas(visitaId, estado)',
    'SELECT "Index idx_detalle_visitas_visita_estado already exists" AS Info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'detalle_visitas'
      AND INDEX_NAME = 'idx_detalle_visitas_tipo_itemId'
);
SET @sql = IF(@idx_exists = 0,
    'CREATE INDEX idx_detalle_visitas_tipo_itemId ON detalle_visitas(tipo, itemId)',
    'SELECT "Index idx_detalle_visitas_tipo_itemId already exists" AS Info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'visitas'
      AND INDEX_NAME = 'idx_visitas_fecha'
);
SET @sql = IF(@idx_exists = 0,
    'CREATE INDEX idx_visitas_fecha ON visitas(fecha)',
    'SELECT "Index idx_visitas_fecha already exists" AS Info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = @productos_table
      AND INDEX_NAME = 'idx_productos_sku'
);
SET @sql = CASE
    WHEN @productos_table IS NULL THEN 'SELECT "No product table detected (Productos/productos)" AS Info'
    WHEN @idx_exists = 0 THEN CONCAT('CREATE INDEX idx_productos_sku ON `', @productos_table, '`(sku)')
    ELSE 'SELECT "Index idx_productos_sku already exists" AS Info'
END;
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET SQL_SAFE_UPDATES = 1;

SELECT 'Migracion visitas/historico/externo finalizada' AS resultado;
