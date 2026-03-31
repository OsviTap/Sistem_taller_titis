# Setup Importacion Inversa Google Sheets

## 1) Variables de entorno (persistentes)
Configurar en el servidor (Render/Railway/VPS) para no escribir datos cada vez.

- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
- `GOOGLE_SHEETS_SPREADSHEET_ID`

Opcionales para auto-import:
- `ENABLE_GOOGLE_SHEETS_IMPORT_AUTO=true`
- `GOOGLE_SHEETS_IMPORT_INTERVAL_MIN=30`
- `GOOGLE_SHEETS_IMPORT_SHEETS=Ventas,GastosPlanillas,CajaTurnos`
- `GOOGLE_SHEETS_IMPORT_RUN_ON_START=true`

## 2) Compartir hoja con Service Account
Aunque la hoja este en otra cuenta de Google, funciona igual si compartes el spreadsheet con el email de service account como Editor.

## 3) Endpoints nuevos
Base: `/api/ventas-diarias`

- `POST /google-sheets/import/preview`
  - Previsualiza estructura de columnas y detecta columnas desconocidas.

- `POST /google-sheets/import`
  - Importa datos hacia BD.
  - Soporta `dryRun` y `columnMappings`.

- `GET /google-sheets/import/extras`
  - Lista columnas extra capturadas durante importaciones.
  - Filtros opcionales: `entidadTipo`, `entidadId`, `hoja`, `page`, `limit`.

- `GET /google-sheets/import/estado`
  - Estado de configuracion y scheduler.

- `POST /google-sheets/import/auto/trigger`
  - Dispara import automatico manualmente.

## 4) Flujo recomendado
1. Ejecutar `preview`.
2. Si hay encabezados diferentes, enviar `columnMappings`.
3. Ejecutar `import` con `dryRun=true`.
4. Validar reporte.
5. Ejecutar `import` con `dryRun=false`.

## 4.1) Columnas nuevas sin perder informacion
- Si la hoja trae columnas nuevas que no existen en los campos base, el importador ahora las guarda en la tabla `google_sheets_import_extras`.
- Se guardan por entidad importada (`VentaDiaria`, `GastoDiario`, `PlanillaRegistro`, `CajaTurno`) con `entidadId`, `hoja` y `columnasExtra` (JSON).
- El preview sigue mostrando `unknownColumns` para que puedas decidir si mapear o dejar como extra.

## 5) Ejemplo preview
```json
{
  "spreadsheetId": "TU_SPREADSHEET_ID",
  "sheets": ["Ventas", "GastosPlanillas", "CajaTurnos"],
  "columnMappings": {
    "Ventas": {
      "numeroVenta": ["nro", "numero"],
      "clienteNombre": ["cliente nombre"],
      "metodoPago": ["forma pago"]
    }
  }
}
```

## 6) Ejemplo import dry-run
```json
{
  "spreadsheetId": "TU_SPREADSHEET_ID",
  "sheets": ["Ventas", "GastosPlanillas"],
  "dryRun": true,
  "upsert": true,
  "columnMappings": {
    "GastosPlanillas": {
      "concepto": ["detalle", "concepto"]
    }
  }
}
```

## 7) Ejemplo import real
```json
{
  "spreadsheetId": "TU_SPREADSHEET_ID",
  "sheets": ["Ventas", "GastosPlanillas", "CajaTurnos"],
  "dryRun": false,
  "upsert": true
}
```
