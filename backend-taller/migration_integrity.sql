-- Script de migración para integridad de datos
-- Ejecuta estos comandos en tu cliente MySQL (phpMyAdmin, Workbench, etc.)

USE railway;

-- 1. Habilitar Soft Deletes en Productos
-- (Comentado porque ya se ejecutó exitosamente)
-- ALTER TABLE Productos ADD COLUMN deletedAt DATETIME NULL;

-- 2. Agregar columna para snapshot de nombre en DetalleVisita
-- (Comentado porque ya se ejecutó exitosamente)
-- ALTER TABLE detalle_visitas ADD COLUMN nombreProducto VARCHAR(255) NULL;

-- 3. Agregar columna para snapshot de nombre en ProductHistory
-- (Comentado porque ya se ejecutó exitosamente)
-- ALTER TABLE product_history ADD COLUMN nombreProducto VARCHAR(255) NULL;

-- DESACTIVAR MODO SEGURO PARA PERMITIR ACTUALIZACIONES MASIVAS
SET SQL_SAFE_UPDATES = 0;

-- 4. Actualizar registros antiguos con el nombre actual del producto
UPDATE detalle_visitas dv
JOIN Productos p ON dv.itemId = p.id
SET dv.nombreProducto = p.nombre
WHERE dv.tipo = 'Producto';

UPDATE product_history ph
JOIN Productos p ON ph.productoId = p.id
SET ph.nombreProducto = p.nombre;

-- REACTIVAR MODO SEGURO
SET SQL_SAFE_UPDATES = 1;
