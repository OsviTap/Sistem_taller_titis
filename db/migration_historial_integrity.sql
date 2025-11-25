-- ========================================
-- MIGRACIÓN: INTEGRIDAD DEL HISTORIAL
-- Sistema Taller Titis
-- ========================================
-- Este script asegura que los cambios en productos, servicios, clientes
-- o vehículos NO afecten los registros históricos ya guardados.

-- USE taller_titis;
-- (Comentado para usar la base de datos activa)

-- ========================================
-- 1. AGREGAR CAMPOS SNAPSHOT EN TABLAS
-- ========================================

-- Agregar nombreProducto en product_history (si no existe)
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

-- Agregar nombreProducto en detalle_visitas (si no existe)
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

-- Agregar campos snapshot en historial_visitas para cliente
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

-- Agregar placaVehiculo en historial_visitas
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

-- Agregar marcaVehiculo en historial_visitas
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

-- Agregar modeloVehiculo en historial_visitas
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


-- ========================================
-- 2. LLENAR SNAPSHOTS DE REGISTROS EXISTENTES
-- ========================================

-- Desactivar temporalmente safe update mode
SET SQL_SAFE_UPDATES = 0;

-- Actualizar product_history con nombres de productos actuales
UPDATE product_history ph
INNER JOIN Productos p ON ph.productoId = p.id
SET ph.nombreProducto = p.nombre
WHERE ph.nombreProducto IS NULL;

-- Actualizar detalle_visitas con nombres de productos
UPDATE detalle_visitas dv
INNER JOIN Productos p ON dv.itemId = p.id
SET dv.nombreProducto = p.nombre
WHERE dv.tipo = 'Producto' AND dv.nombreProducto IS NULL;

-- Actualizar historial_visitas con información de clientes
UPDATE historial_visitas hv
INNER JOIN clientes c ON hv.clienteId = c.id
SET hv.nombreCliente = c.nombre
WHERE hv.nombreCliente IS NULL;

-- Actualizar historial_visitas con información de vehículos
UPDATE historial_visitas hv
INNER JOIN vehiculos v ON hv.vehiculoId = v.id
LEFT JOIN marcas m ON v.marcaId = m.id
LEFT JOIN modelos mo ON v.modeloId = mo.id
SET 
    hv.placaVehiculo = v.placa,
    hv.marcaVehiculo = m.nombre,
    hv.modeloVehiculo = mo.nombre
WHERE hv.placaVehiculo IS NULL;

-- Reactivar safe update mode
SET SQL_SAFE_UPDATES = 1;


-- ========================================
-- 3. MODIFICAR FOREIGN KEYS PARA PROTECCIÓN
-- ========================================

-- IMPORTANTE: Las foreign keys deben permitir que el historial se mantenga
-- aunque se elimine el producto/servicio/cliente/vehículo

-- Nota: Esta sección puede generar errores si las constraints no existen.
-- Es normal y no afecta la ejecución del resto del script.

-- Para productoId en product_history
SET @constraint_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'product_history' 
    AND CONSTRAINT_NAME = 'product_history_ibfk_1'
);

SET @sql = IF(@constraint_exists > 0, 
    'ALTER TABLE product_history DROP FOREIGN KEY product_history_ibfk_1',
    'SELECT "Constraint product_history_ibfk_1 does not exist" AS Info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

ALTER TABLE product_history 
ADD CONSTRAINT product_history_ibfk_1 
FOREIGN KEY (productoId) REFERENCES Productos(id) 
ON DELETE RESTRICT 
ON UPDATE CASCADE;

-- Para clienteId en product_history
SET @constraint_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'product_history' 
    AND CONSTRAINT_NAME = 'product_history_ibfk_10'
);

SET @sql = IF(@constraint_exists > 0, 
    'ALTER TABLE product_history DROP FOREIGN KEY product_history_ibfk_10',
    'SELECT "Constraint product_history_ibfk_10 does not exist" AS Info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

ALTER TABLE product_history 
ADD CONSTRAINT product_history_ibfk_10 
FOREIGN KEY (clienteId) REFERENCES clientes(id) 
ON DELETE RESTRICT 
ON UPDATE CASCADE;

-- Para vehiculoId en product_history
SET @constraint_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'product_history' 
    AND CONSTRAINT_NAME = 'product_history_ibfk_11'
);

SET @sql = IF(@constraint_exists > 0, 
    'ALTER TABLE product_history DROP FOREIGN KEY product_history_ibfk_11',
    'SELECT "Constraint product_history_ibfk_11 does not exist" AS Info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

ALTER TABLE product_history 
ADD CONSTRAINT product_history_ibfk_11 
FOREIGN KEY (vehiculoId) REFERENCES vehiculos(id) 
ON DELETE RESTRICT 
ON UPDATE CASCADE;


-- ========================================
-- 4. PROTEGER DETALLE_VISITAS
-- ========================================

-- El itemId NO debe tener foreign key porque puede ser producto O servicio
-- Mantenemos solo la referencia numérica y el snapshot del nombre


-- ========================================
-- 5. PROTEGER HISTORIAL_VISITAS
-- ========================================

-- Para clienteId en historial_visitas
SET @constraint_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'historial_visitas' 
    AND CONSTRAINT_NAME = 'historial_visitas_ibfk_160'
);

SET @sql = IF(@constraint_exists > 0, 
    'ALTER TABLE historial_visitas DROP FOREIGN KEY historial_visitas_ibfk_160',
    'SELECT "Constraint historial_visitas_ibfk_160 does not exist" AS Info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

ALTER TABLE historial_visitas 
ADD CONSTRAINT historial_visitas_ibfk_160 
FOREIGN KEY (clienteId) REFERENCES clientes(id) 
ON DELETE RESTRICT 
ON UPDATE CASCADE;

-- Para vehiculoId en historial_visitas
SET @constraint_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'historial_visitas' 
    AND CONSTRAINT_NAME = 'historial_visitas_ibfk_161'
);

SET @sql = IF(@constraint_exists > 0, 
    'ALTER TABLE historial_visitas DROP FOREIGN KEY historial_visitas_ibfk_161',
    'SELECT "Constraint historial_visitas_ibfk_161 does not exist" AS Info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

ALTER TABLE historial_visitas 
ADD CONSTRAINT historial_visitas_ibfk_161 
FOREIGN KEY (vehiculoId) REFERENCES vehiculos(id) 
ON DELETE RESTRICT 
ON UPDATE CASCADE;


-- ========================================
-- 6. CREAR TRIGGERS PARA PREVENIR ELIMINACIONES
-- ========================================

DELIMITER $$

-- Trigger: Prevenir eliminación de productos si tienen historial
DROP TRIGGER IF EXISTS before_delete_producto$$
CREATE TRIGGER before_delete_producto
BEFORE DELETE ON Productos
FOR EACH ROW
BEGIN
    DECLARE count_history INT;
    
    -- Contar registros en product_history
    SELECT COUNT(*) INTO count_history 
    FROM product_history 
    WHERE productoId = OLD.id;
    
    IF count_history > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No se puede eliminar el producto porque tiene registros en el historial. Considere desactivarlo en su lugar.';
    END IF;
END$$

-- Trigger: Prevenir eliminación de clientes si tienen historial
DROP TRIGGER IF EXISTS before_delete_cliente$$
CREATE TRIGGER before_delete_cliente
BEFORE DELETE ON clientes
FOR EACH ROW
BEGIN
    DECLARE count_visits INT;
    
    -- Contar visitas del cliente
    SELECT COUNT(*) INTO count_visits 
    FROM visitas 
    WHERE clienteId = OLD.id;
    
    IF count_visits > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No se puede eliminar el cliente porque tiene visitas registradas. Considere desactivarlo en su lugar (estado=0).';
    END IF;
END$$

-- Trigger: Prevenir eliminación de servicios si están en detalles
DROP TRIGGER IF EXISTS before_delete_servicio$$
CREATE TRIGGER before_delete_servicio
BEFORE DELETE ON Servicios
FOR EACH ROW
BEGIN
    DECLARE count_detalles INT;
    
    -- Contar detalles que usan este servicio
    SELECT COUNT(*) INTO count_detalles 
    FROM detalle_visitas 
    WHERE tipo = 'Servicio' AND itemId = OLD.id;
    
    IF count_detalles > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No se puede eliminar el servicio porque está registrado en visitas. Los servicios con historial no pueden eliminarse.';
    END IF;
END$$

-- Trigger: Prevenir eliminación de vehículos si tienen visitas
DROP TRIGGER IF EXISTS before_delete_vehiculo$$
CREATE TRIGGER before_delete_vehiculo
BEFORE DELETE ON vehiculos
FOR EACH ROW
BEGIN
    DECLARE count_visits INT;
    
    -- Contar visitas del vehículo
    SELECT COUNT(*) INTO count_visits 
    FROM visitas 
    WHERE vehiculoId = OLD.id;
    
    IF count_visits > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No se puede eliminar el vehículo porque tiene visitas registradas. Considere desactivarlo en su lugar (estado=0).';
    END IF;
END$$

DELIMITER ;


-- ========================================
-- 7. VERIFICACIÓN DE INTEGRIDAD
-- ========================================

-- Ver productos que están en el historial pero podrían eliminarse
SELECT 
    p.id,
    p.nombre,
    COUNT(ph.id) as veces_vendido,
    SUM(ph.cantidad) as cantidad_total
FROM Productos p
INNER JOIN product_history ph ON p.id = ph.productoId
GROUP BY p.id, p.nombre
ORDER BY veces_vendido DESC;

-- Ver servicios que están en detalles de visitas
SELECT 
    s.id,
    s.nombre,
    COUNT(dv.id) as veces_usado
FROM Servicios s
INNER JOIN detalle_visitas dv ON s.id = dv.itemId AND dv.tipo = 'Servicio'
GROUP BY s.id, s.nombre
ORDER BY veces_usado DESC;

-- Ver clientes con visitas
SELECT 
    c.id,
    c.nombre,
    COUNT(v.id) as total_visitas,
    MAX(v.fecha) as ultima_visita
FROM clientes c
INNER JOIN visitas v ON c.id = v.clienteId
GROUP BY c.id, c.nombre
ORDER BY total_visitas DESC;


-- ========================================
-- 8. RECOMENDACIONES
-- ========================================

/*
✅ IMPLEMENTADO:
1. Snapshots de nombres en product_history y detalle_visitas
2. Snapshots de cliente/vehículo en historial_visitas
3. Foreign keys con RESTRICT para prevenir eliminaciones accidentales
4. Triggers para validar antes de eliminar

⚠️ IMPORTANTE:
- Los precios quedan guardados en cada registro histórico
- Los nombres quedan guardados como snapshot
- Si cambia el precio de un producto, NO afecta ventas anteriores
- Si cambia el nombre, el historial muestra el nombre al momento de la venta
- Si se intenta eliminar algo con historial, MySQL lanza error

✅ MEJOR PRÁCTICA:
En lugar de eliminar, usar campo "estado":
- clientes.estado = 0 (inactivo)
- vehiculos.estado = 0 (inactivo)
- productos: agregar campo estado si no existe

Esto permite mantener la integridad referencial mientras se "ocultan"
registros que ya no se usan.
*/

-- ========================================
-- FIN DE MIGRACIÓN
-- ========================================

SELECT 'Migración de integridad del historial completada exitosamente' as Resultado;
