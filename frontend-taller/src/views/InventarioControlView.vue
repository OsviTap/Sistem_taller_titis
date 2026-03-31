<template>
  <div class="py-6 sm:py-8 px-3 sm:px-4 mx-auto max-w-screen-2xl lg:px-6">
    <div class="relative bg-white dark:bg-gray-800 sm:rounded-lg overflow-hidden">
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
          Control de Inventario
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Operación rápida: búsqueda inteligente de productos, reposición desde alertas y kardex histórico.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        <div id="ingreso-rapido" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 lg:col-span-2">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
            <h3 class="font-semibold text-gray-900 dark:text-white">Ingreso Rápido de Stock</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Busca por nombre, ID o SKU sin cargar listas masivas.
            </p>
          </div>

          <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">Buscar producto</label>
          <div class="relative mb-3">
            <input
              v-model="busquedaIngreso"
              @input="onBuscarIngreso"
              @keydown="manejarTeclasIngreso"
              type="text"
              placeholder="Ej: filtro de aire, 1055, SKU-AX"
              class="input-control"
            />
            <div
              v-if="resultadosIngreso.length"
              class="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg max-h-64 overflow-y-auto"
            >
              <button
                v-for="(item, index) in resultadosIngreso"
                :key="item.id"
                type="button"
                :class="[
                  'w-full text-left px-3 py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0',
                  indiceIngresoActivo === index
                    ? 'bg-blue-50 dark:bg-blue-900/30'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                ]"
                @mouseenter="indiceIngresoActivo = index"
                @click="seleccionarProductoIngreso(item)"
              >
                <p class="font-medium text-gray-900 dark:text-white">{{ item.nombre }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  ID: {{ item.id }}
                  <span v-if="item.sku"> | SKU: {{ item.sku }}</span>
                  | Tienda: {{ item.stockPorUbicacion?.TIENDA || 0 }}
                  | Almacén: {{ item.stockPorUbicacion?.ALMACEN || 0 }}
                </p>
              </button>
            </div>
          </div>

          <div v-if="productoIngresoSeleccionado" class="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600 mb-3">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <p class="font-semibold text-gray-900 dark:text-white">{{ productoIngresoSeleccionado.nombre }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  ID: {{ productoIngresoSeleccionado.id }}
                  <span v-if="productoIngresoSeleccionado.sku"> | SKU: {{ productoIngresoSeleccionado.sku }}</span>
                </p>
              </div>
              <div class="text-xs text-gray-600 dark:text-gray-300">
                <span class="inline-block mr-3">Tienda: {{ productoIngresoSeleccionado.stockPorUbicacion?.TIENDA || 0 }}</span>
                <span class="inline-block mr-3">Almacén: {{ productoIngresoSeleccionado.stockPorUbicacion?.ALMACEN || 0 }}</span>
                <span class="inline-block">Mínimo: {{ productoIngresoSeleccionado.stockMinimo || 0 }}</span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            <div>
              <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">Ubicación</label>
              <select v-model="formIngreso.ubicacionCodigo" class="input-control">
                <option value="ALMACEN">Almacén</option>
                <option value="TIENDA">Tienda</option>
              </select>
            </div>

            <div>
              <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">Cantidad</label>
              <input v-model.number="formIngreso.cantidad" type="number" min="1" class="input-control" />
            </div>

            <div>
              <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">Costo unitario</label>
              <input v-model.number="formIngreso.costoUnitario" type="number" min="0" step="0.01" class="input-control" />
            </div>

            <div>
              <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">Margen %</label>
              <input v-model.number="formIngreso.porcentajeGanancia" type="number" min="0" step="0.01" class="input-control" />
            </div>

            <div>
              <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">Ganancia monto</label>
              <input v-model.number="formIngreso.montoGanancia" type="number" min="0" step="0.01" class="input-control" />
            </div>

            <div class="md:col-span-2 xl:col-span-1">
              <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">Precio sugerido</label>
              <input v-model.number="formIngreso.precioVentaSugerido" type="number" min="0" step="0.01" class="input-control" />
            </div>

            <div class="md:col-span-2 xl:col-span-1 flex items-end gap-2">
              <button type="button" class="btn-secondary w-full" @click="calcularPrecioDesdeMargen">
                Calcular precio
              </button>
              <button type="button" class="btn-secondary w-full" @click="calcularMargenDesdePrecio">
                Calcular margen
              </button>
            </div>

            <div class="md:col-span-2 xl:col-span-2">
              <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">Documento / referencia</label>
              <input v-model="formIngreso.documentoIngreso" type="text" class="input-control" placeholder="Factura, OC, guía" />
            </div>

            <div class="md:col-span-2 xl:col-span-2">
              <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">Proveedor</label>
              <input v-model="formIngreso.proveedor" type="text" class="input-control" placeholder="Nombre proveedor" />
            </div>

            <div class="md:col-span-2 xl:col-span-4">
              <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">Observaciones</label>
              <input v-model="formIngreso.observaciones" type="text" class="input-control" placeholder="Detalle opcional" />
            </div>
          </div>

          <div class="mt-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input v-model="formIngreso.actualizarPreciosProducto" type="checkbox" class="rounded border-gray-300" />
              Actualizar precio de producto con este ingreso
            </label>

            <button
              @click="registrarIngresoRapido"
              class="btn-primary md:w-auto"
              :disabled="loading.ingreso || !formIngreso.productoId"
            >
              {{ loading.ingreso ? 'Registrando...' : 'Registrar ingreso' }}
            </button>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-3">Snapshot Diario</h3>
          <div class="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600 mb-3">
            <p class="text-sm text-gray-500 dark:text-gray-400">Último snapshot</p>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ estadoSnapshot.ultimoSnapshot || 'Sin registros' }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Registros: {{ estadoSnapshot.registrosUltimoSnapshot || 0 }}
            </p>
          </div>

          <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">Fecha de snapshot manual</label>
          <input v-model="fechaSnapshotManual" type="date" class="input-control mb-3" />

          <button @click="generarSnapshotManual" class="btn-secondary w-full" :disabled="loading.snapshot">
            {{ loading.snapshot ? 'Generando...' : 'Generar Snapshot Manual' }}
          </button>
        </div>
      </div>

      <div class="p-4 border-t border-b border-gray-200 dark:border-gray-700">
        <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white">Alertas de Reposición (Tienda)</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Priorizadas por urgencia y paginadas para operar rápido.
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 w-full md:w-auto">
            <input
              v-model="filtroAlertas"
              type="text"
              placeholder="Buscar producto o SKU"
              class="input-control"
              @keydown.enter="manejarEnterBusquedaAlertas"
            />
            <select v-model.number="limiteAlertas" class="input-control" @change="cargarAlertas(1)">
              <option :value="10">10 por página</option>
              <option :value="20">20 por página</option>
              <option :value="50">50 por página</option>
            </select>
            <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 px-2">
              <input v-model="incluirSinAlerta" type="checkbox" class="rounded border-gray-300" @change="cargarAlertas(1)" />
              Mostrar sin alerta
            </label>
            <button @click="cargarAlertas(1)" class="btn-primary" :disabled="loading.alertas">
              {{ loading.alertas ? 'Actualizando...' : 'Actualizar' }}
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
          <div class="card-kpi">
            <p class="kpi-label">Productos evaluados</p>
            <p class="kpi-value">{{ resumenAlertas.totalProductos }}</p>
          </div>
          <div class="card-kpi">
            <p class="kpi-label">Con alerta</p>
            <p class="kpi-value text-yellow-600 dark:text-yellow-400">{{ resumenAlertas.conAlerta }}</p>
          </div>
          <div class="card-kpi">
            <p class="kpi-label">Urgentes</p>
            <p class="kpi-value text-red-600 dark:text-red-400">{{ resumenAlertas.urgentes }}</p>
          </div>
          <div class="card-kpi">
            <p class="kpi-label">Sin cobertura almacén</p>
            <p class="kpi-value text-orange-600 dark:text-orange-400">{{ resumenAlertas.sinCoberturaAlmacen }}</p>
          </div>
        </div>

        <div class="overflow-x-auto mt-4">
          <table class="w-full min-w-[1180px] text-sm text-left text-gray-500 dark:text-gray-400">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th class="px-4 py-3">Producto</th>
                <th class="px-4 py-3">Tienda</th>
                <th class="px-4 py-3">Almacén</th>
                <th class="px-4 py-3">Mínimo</th>
                <th class="px-4 py-3">Déficit</th>
                <th class="px-4 py-3">Sugerencia traslado</th>
                <th class="px-4 py-3">Estado</th>
                <th class="px-4 py-3">Acciones rápidas</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in alertas" :key="item.productoId" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">
                  {{ item.nombre }}
                  <span class="text-xs text-gray-500 block" v-if="item.sku">SKU: {{ item.sku }}</span>
                </td>
                <td class="px-4 py-3">{{ item.stockTienda }}</td>
                <td class="px-4 py-3">{{ item.stockAlmacen }}</td>
                <td class="px-4 py-3">{{ item.stockMinimoObjetivo }}</td>
                <td class="px-4 py-3">{{ item.deficitTienda }}</td>
                <td class="px-4 py-3 font-semibold">{{ item.sugerenciaTraslado }}</td>
                <td class="px-4 py-3">
                  <span :class="estadoBadgeClass(item.estadoReposicion)" class="px-2 py-1 rounded-full text-xs font-semibold">
                    {{ estadoLegible(item.estadoReposicion) }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex flex-wrap gap-2">
                    <button
                      type="button"
                      class="btn-mini"
                      :disabled="item.sugerenciaTraslado <= 0 || isAccionCargando(`traslado-${item.productoId}`)"
                      @click="ejecutarTrasladoSugerido(item)"
                    >
                      {{ isAccionCargando(`traslado-${item.productoId}`) ? 'Trasladando...' : 'Trasladar sugerido' }}
                    </button>
                    <button
                      type="button"
                      class="btn-mini-secondary"
                      @click="prepararIngresoDesdeAlerta(item)"
                    >
                      Preparar ingreso
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="!alertas.length">
                <td colspan="8" class="px-4 py-4 text-center text-gray-500">No hay alertas para los filtros seleccionados.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-gray-600 dark:text-gray-300">
          <p>
            Mostrando {{ alertas.length }} de {{ paginacionAlertas.totalItems }} alertas
          </p>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="btn-secondary"
              :disabled="loading.alertas || paginacionAlertas.currentPage <= 1"
              @click="cargarAlertas(paginacionAlertas.currentPage - 1)"
            >
              Anterior
            </button>
            <span>
              Página {{ paginacionAlertas.currentPage }} de {{ paginacionAlertas.totalPages || 1 }}
            </span>
            <button
              type="button"
              class="btn-secondary"
              :disabled="loading.alertas || paginacionAlertas.currentPage >= paginacionAlertas.totalPages"
              @click="cargarAlertas(paginacionAlertas.currentPage + 1)"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-3">Gestión de Lotes y Cambios Comerciales</h3>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <div class="lg:col-span-2">
            <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">Buscar producto para lotes</label>
            <div class="relative">
              <input
                v-model="busquedaLotes"
                @input="onBuscarLotes"
                type="text"
                placeholder="Nombre, ID o SKU"
                class="input-control"
              />
              <div
                v-if="resultadosLotes.length"
                class="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg max-h-56 overflow-y-auto"
              >
                <button
                  v-for="item in resultadosLotes"
                  :key="`lote-producto-${item.id}`"
                  type="button"
                  class="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  @click="seleccionarProductoLotes(item)"
                >
                  <p class="font-medium text-gray-900 dark:text-white">{{ item.nombre }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    ID: {{ item.id }}
                    <span v-if="item.sku"> | SKU: {{ item.sku }}</span>
                  </p>
                </button>
              </div>
            </div>
          </div>

          <div class="flex items-end">
            <button
              type="button"
              class="btn-primary w-full"
              :disabled="!productoLotesSeleccionado || loading.lotes"
              @click="cargarLotesProducto"
            >
              {{ loading.lotes ? 'Cargando lotes...' : 'Ver lotes' }}
            </button>
          </div>
        </div>

        <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">
          Producto seleccionado: {{ productoLotesSeleccionado ? `${productoLotesSeleccionado.nombre} (${productoLotesSeleccionado.id})` : 'Ninguno' }}
        </p>

        <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div class="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
            <table class="w-full min-w-[760px] text-sm text-left text-gray-500 dark:text-gray-400">
              <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th class="px-4 py-3">Lote</th>
                  <th class="px-4 py-3">Ingreso</th>
                  <th class="px-4 py-3">Disponible</th>
                  <th class="px-4 py-3">Costo</th>
                  <th class="px-4 py-3">Margen %</th>
                  <th class="px-4 py-3">Precio</th>
                  <th class="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="lote in lotesProducto" :key="lote.id" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                  <td class="px-4 py-3">{{ lote.id }}</td>
                  <td class="px-4 py-3">{{ lote.fechaIngreso }}</td>
                  <td class="px-4 py-3 font-semibold">{{ lote.cantidadDisponible }}</td>
                  <td class="px-4 py-3">Bs {{ Number(lote.costoUnitario || 0).toFixed(2) }}</td>
                  <td class="px-4 py-3">{{ Number(lote.porcentajeGanancia || 0).toFixed(2) }}</td>
                  <td class="px-4 py-3">Bs {{ Number(lote.precioVentaSugerido || 0).toFixed(2) }}</td>
                  <td class="px-4 py-3">
                    <div class="flex gap-2">
                      <button type="button" class="btn-mini-secondary" @click="prepararEdicionLote(lote)">
                        Editar
                      </button>
                      <button type="button" class="btn-mini" @click="cargarHistorialLote(lote.id, 1)">
                        Historial
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="!lotesProducto.length">
                  <td colspan="7" class="px-4 py-4 text-center text-gray-500">Selecciona un producto para ver sus lotes.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h4 class="font-semibold text-gray-900 dark:text-white mb-3">Edición de Lote</h4>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Solo se permite ajustar lotes con stock disponible para conservar trazabilidad de salida FIFO.
            </p>

            <div v-if="loteEditando">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">Lote</label>
                  <input :value="loteEditando.id" type="text" class="input-control" readonly />
                </div>
                <div>
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">Fecha vigencia</label>
                  <input v-model="formLote.fechaVigencia" type="date" class="input-control" />
                </div>
                <div>
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">Fecha ingreso</label>
                  <input v-model="formLote.fechaIngreso" type="date" class="input-control" />
                </div>
                <div>
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">Costo unitario</label>
                  <input v-model.number="formLote.costoUnitario" type="number" min="0" step="0.01" class="input-control" />
                </div>
                <div>
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">Margen %</label>
                  <input v-model.number="formLote.porcentajeGanancia" type="number" min="0" step="0.01" class="input-control" />
                </div>
                <div>
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">Ganancia monto</label>
                  <input v-model.number="formLote.montoGanancia" type="number" min="0" step="0.01" class="input-control" />
                </div>
                <div class="md:col-span-2">
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">Precio venta sugerido</label>
                  <input v-model.number="formLote.precioVentaSugerido" type="number" min="0" step="0.01" class="input-control" />
                </div>
                <div>
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">Usuario responsable</label>
                  <input v-model="formLote.usuarioResponsable" type="text" class="input-control" placeholder="Ej: Admin" />
                </div>
                <div>
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">Motivo</label>
                  <input v-model="formLote.motivo" type="text" class="input-control" placeholder="Ajuste comercial / corrección" />
                </div>
              </div>

              <div class="flex gap-2">
                <button type="button" class="btn-secondary" @click="calcularPrecioLoteDesdeMargen">
                  Recalcular precio
                </button>
                <button type="button" class="btn-secondary" @click="calcularMargenLoteDesdePrecio">
                  Recalcular margen
                </button>
                <button type="button" class="btn-primary ml-auto" :disabled="loading.lote" @click="guardarAjusteLote">
                  {{ loading.lote ? 'Guardando...' : 'Guardar ajuste' }}
                </button>
              </div>
            </div>

            <p v-else class="text-sm text-gray-500 dark:text-gray-400">
              Selecciona un lote para editar sus parámetros comerciales.
            </p>
          </div>
        </div>

        <div class="mt-4 grid grid-cols-1 md:grid-cols-5 gap-2">
          <div>
            <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">Desde</label>
            <input v-model="filtrosHistorialLote.fechaInicio" type="date" class="input-control" />
          </div>
          <div>
            <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">Hasta</label>
            <input v-model="filtrosHistorialLote.fechaFin" type="date" class="input-control" />
          </div>
          <div>
            <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">Tipo cambio</label>
            <select v-model="filtrosHistorialLote.tipoCambio" class="input-control">
              <option value="">Todos</option>
              <option value="AJUSTE_COMERCIAL">AJUSTE_COMERCIAL</option>
              <option value="CORRECCION_FECHA_INGRESO">CORRECCION_FECHA_INGRESO</option>
            </select>
          </div>
          <div>
            <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">Usuario</label>
            <input v-model="filtrosHistorialLote.usuarioResponsable" type="text" class="input-control" placeholder="Responsable" />
          </div>
          <div>
            <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">Buscar motivo</label>
            <input v-model="filtrosHistorialLote.search" type="text" class="input-control" placeholder="Texto libre" />
          </div>
        </div>

        <div class="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            class="btn-secondary"
            :disabled="!loteHistorialSeleccionadoId || loading.historialLote"
            @click="cargarHistorialLote(loteHistorialSeleccionadoId, 1)"
          >
            Aplicar filtros
          </button>
          <button type="button" class="btn-secondary" @click="limpiarFiltrosHistorialLote">
            Limpiar filtros
          </button>
          <button
            type="button"
            class="btn-primary"
            :disabled="!loteHistorialSeleccionadoId || loading.exportHistorial"
            @click="exportarHistorialLoteCSV"
          >
            {{ loading.exportHistorial ? 'Exportando...' : 'Exportar CSV historial' }}
          </button>
        </div>

        <div class="mt-4 overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
          <table class="w-full min-w-[980px] text-sm text-left text-gray-500 dark:text-gray-400">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th class="px-4 py-3">Fecha cambio</th>
                <th class="px-4 py-3">Lote</th>
                <th class="px-4 py-3">Tipo</th>
                <th class="px-4 py-3">Costo</th>
                <th class="px-4 py-3">Margen</th>
                <th class="px-4 py-3">Precio</th>
                <th class="px-4 py-3">Usuario</th>
                <th class="px-4 py-3">Motivo</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in historialLote" :key="`hist-${item.id}`" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <td class="px-4 py-3">{{ item.fechaVigencia }}<span class="block text-xs">{{ item.createdAt?.slice(11, 19) || '' }}</span></td>
                <td class="px-4 py-3">{{ item.loteId }}</td>
                <td class="px-4 py-3">{{ item.tipoCambio }}</td>
                <td class="px-4 py-3">{{ Number(item.costoAnterior || 0).toFixed(2) }} → {{ Number(item.costoNuevo || 0).toFixed(2) }}</td>
                <td class="px-4 py-3">{{ Number(item.porcentajeGananciaAnterior || 0).toFixed(2) }} → {{ Number(item.porcentajeGananciaNuevo || 0).toFixed(2) }}</td>
                <td class="px-4 py-3">{{ Number(item.precioVentaAnterior || 0).toFixed(2) }} → {{ Number(item.precioVentaNuevo || 0).toFixed(2) }}</td>
                <td class="px-4 py-3">{{ item.usuarioResponsable || '-' }}</td>
                <td class="px-4 py-3">{{ item.motivo || '-' }}</td>
              </tr>
              <tr v-if="!historialLote.length">
                <td colspan="8" class="px-4 py-4 text-center text-gray-500">No hay historial para el lote seleccionado.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-3 flex items-center justify-end gap-2 text-sm text-gray-600 dark:text-gray-300">
          <button
            type="button"
            class="btn-secondary"
            :disabled="loading.historialLote || paginacionHistorialLote.currentPage <= 1 || !loteHistorialSeleccionadoId"
            @click="cargarHistorialLote(loteHistorialSeleccionadoId, paginacionHistorialLote.currentPage - 1)"
          >
            Anterior
          </button>
          <span>Página {{ paginacionHistorialLote.currentPage }} de {{ paginacionHistorialLote.totalPages || 1 }}</span>
          <button
            type="button"
            class="btn-secondary"
            :disabled="loading.historialLote || paginacionHistorialLote.currentPage >= paginacionHistorialLote.totalPages || !loteHistorialSeleccionadoId"
            @click="cargarHistorialLote(loteHistorialSeleccionadoId, paginacionHistorialLote.currentPage + 1)"
          >
            Siguiente
          </button>
        </div>
      </div>

      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-3">Filtros Kardex (Búsqueda Inteligente)</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div class="lg:col-span-2 relative">
            <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">Producto</label>
            <input
              v-model="busquedaKardex"
              @input="onBuscarKardex"
              @keydown="manejarTeclasKardex"
              type="text"
              placeholder="Todos o buscar por nombre, ID, SKU"
              class="input-control"
            />
            <div
              v-if="resultadosKardex.length"
              class="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg max-h-56 overflow-y-auto"
            >
              <button
                v-for="(item, index) in resultadosKardex"
                :key="`kardex-${item.id}`"
                type="button"
                :class="[
                  'w-full text-left px-3 py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0',
                  indiceKardexActivo === index
                    ? 'bg-blue-50 dark:bg-blue-900/30'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                ]"
                @mouseenter="indiceKardexActivo = index"
                @click="seleccionarProductoKardex(item)"
              >
                <p class="font-medium text-gray-900 dark:text-white">{{ item.nombre }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  ID: {{ item.id }}
                  <span v-if="item.sku"> | SKU: {{ item.sku }}</span>
                </p>
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">Ubicación</label>
            <select v-model="filtrosKardex.ubicacionCodigo" class="input-control">
              <option value="">Todas</option>
              <option value="TIENDA">Tienda</option>
              <option value="ALMACEN">Almacén</option>
            </select>
          </div>

          <div>
            <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">Desde</label>
            <input v-model="filtrosKardex.fechaInicio" type="date" class="input-control" />
          </div>

          <div>
            <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">Hasta</label>
            <input v-model="filtrosKardex.fechaFin" type="date" class="input-control" />
          </div>
        </div>

        <div class="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Producto seleccionado: {{ productoKardexSeleccionado ? `${productoKardexSeleccionado.nombre} (${productoKardexSeleccionado.id})` : 'Todos' }}
          </p>
          <div class="flex gap-2">
            <button type="button" class="btn-secondary" @click="limpiarProductoKardex">
              Limpiar producto
            </button>
            <button @click="cargarKardex" class="btn-primary" :disabled="loading.kardex">
              {{ loading.kardex ? 'Cargando...' : 'Actualizar Kardex' }}
            </button>
          </div>
        </div>
      </div>

      <div class="p-4">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-3">Kardex Histórico (Auditoría)</h3>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div class="card-kpi">
            <p class="kpi-label">Saldo inicial</p>
            <p class="kpi-value">{{ kardex.saldoInicial }}</p>
          </div>
          <div class="card-kpi">
            <p class="kpi-label">Saldo final</p>
            <p class="kpi-value">{{ kardex.saldoFinal }}</p>
          </div>
          <div class="card-kpi">
            <p class="kpi-label">Movimientos</p>
            <p class="kpi-value">{{ kardex.totalMovimientos }}</p>
          </div>
        </div>

        <div class="overflow-x-auto mb-4">
          <table class="w-full min-w-[760px] text-sm text-left text-gray-500 dark:text-gray-400">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th class="px-4 py-3">Fecha</th>
                <th class="px-4 py-3">Entradas</th>
                <th class="px-4 py-3">Salidas</th>
                <th class="px-4 py-3">Neto</th>
                <th class="px-4 py-3">Saldo cierre</th>
                <th class="px-4 py-3">Movimientos</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="dia in kardex.resumenDiario" :key="dia.fecha" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <td class="px-4 py-3">{{ dia.fecha }}</td>
                <td class="px-4 py-3 text-green-600 dark:text-green-400">{{ dia.entradas }}</td>
                <td class="px-4 py-3 text-red-600 dark:text-red-400">{{ dia.salidas }}</td>
                <td class="px-4 py-3">{{ dia.neto }}</td>
                <td class="px-4 py-3 font-semibold">{{ dia.saldoCierre }}</td>
                <td class="px-4 py-3">{{ dia.movimientos }}</td>
              </tr>
              <tr v-if="!kardex.resumenDiario.length">
                <td colspan="6" class="px-4 py-4 text-center text-gray-500">Sin movimientos en el período seleccionado.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="mensajeOperacion" class="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 p-3 text-sm text-green-700 dark:text-green-300 mb-2">
          {{ mensajeOperacion }}
        </div>
        <div v-if="errorOperacion" class="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 p-3 text-sm text-red-700 dark:text-red-300">
          {{ errorOperacion }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import axios from '@/api/axios';

const getBoliviaDate = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/La_Paz',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const year = parts.find((p) => p.type === 'year')?.value;
  const month = parts.find((p) => p.type === 'month')?.value;
  const day = parts.find((p) => p.type === 'day')?.value;
  return `${year}-${month}-${day}`;
};

const fechaHoy = getBoliviaDate();
const base = new Date(`${fechaHoy}T00:00:00`);
base.setDate(base.getDate() - 30);
const hace30 = getBoliviaDate(base);

const alertas = ref([]);
const resumenAlertas = ref({
  totalProductos: 0,
  conAlerta: 0,
  urgentes: 0,
  sinCoberturaAlmacen: 0,
});

const paginacionAlertas = ref({
  totalItems: 0,
  totalPages: 0,
  currentPage: 1,
  limit: 10,
});

const filtrosKardex = ref({
  productoId: '',
  ubicacionCodigo: '',
  fechaInicio: hace30,
  fechaFin: fechaHoy,
});

const kardex = ref({
  saldoInicial: 0,
  saldoFinal: 0,
  totalMovimientos: 0,
  resumenDiario: [],
});

const estadoSnapshot = ref({
  ultimoSnapshot: null,
  registrosUltimoSnapshot: 0,
});

const fechaSnapshotManual = ref(fechaHoy);
const filtroAlertas = ref('');
const limiteAlertas = ref(10);
const incluirSinAlerta = ref(false);

const busquedaIngreso = ref('');
const resultadosIngreso = ref([]);
const productoIngresoSeleccionado = ref(null);
const indiceIngresoActivo = ref(-1);

const busquedaKardex = ref('');
const resultadosKardex = ref([]);
const productoKardexSeleccionado = ref(null);
const indiceKardexActivo = ref(-1);

const busquedaLotes = ref('');
const resultadosLotes = ref([]);
const productoLotesSeleccionado = ref(null);
const lotesProducto = ref([]);

const loteEditando = ref(null);
const loteHistorialSeleccionadoId = ref(null);
const historialLote = ref([]);
const paginacionHistorialLote = ref({
  totalItems: 0,
  totalPages: 0,
  currentPage: 1,
  limit: 10,
});

const filtrosHistorialLote = ref({
  fechaInicio: '',
  fechaFin: '',
  tipoCambio: '',
  usuarioResponsable: '',
  search: '',
});

const formLote = ref({
  fechaVigencia: fechaHoy,
  fechaIngreso: fechaHoy,
  costoUnitario: 0,
  porcentajeGanancia: 0,
  montoGanancia: 0,
  precioVentaSugerido: 0,
  motivo: '',
  usuarioResponsable: '',
});

const formIngreso = ref({
  productoId: '',
  ubicacionCodigo: 'ALMACEN',
  cantidad: 1,
  costoUnitario: 0,
  porcentajeGanancia: 0,
  montoGanancia: 0,
  precioVentaSugerido: 0,
  documentoIngreso: '',
  proveedor: '',
  observaciones: '',
  actualizarPreciosProducto: true,
});

const loading = ref({
  alertas: false,
  kardex: false,
  snapshot: false,
  ingreso: false,
  busquedaIngreso: false,
  busquedaKardex: false,
  lotes: false,
  lote: false,
  historialLote: false,
  exportHistorial: false,
});

const accionesCargando = ref({});
const mensajeOperacion = ref('');
const errorOperacion = ref('');

let timerBusquedaIngreso = null;
let timerBusquedaKardex = null;
let timerBusquedaLotes = null;

const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const limpiarMensajes = () => {
  mensajeOperacion.value = '';
  errorOperacion.value = '';
};

const estadoLegible = (estado) => {
  switch (estado) {
    case 'URGENTE_SIN_STOCK_TIENDA': return 'Urgente';
    case 'BAJO_MINIMO_SIN_STOCK_ALMACEN': return 'Bajo mínimo sin cobertura';
    case 'BAJO_MINIMO_REPONER': return 'Reponer';
    default: return 'OK';
  }
};

const estadoBadgeClass = (estado) => {
  switch (estado) {
    case 'URGENTE_SIN_STOCK_TIENDA':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'BAJO_MINIMO_SIN_STOCK_ALMACEN':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    case 'BAJO_MINIMO_REPONER':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    default:
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
  }
};

const setAccionCargando = (key, value) => {
  accionesCargando.value = {
    ...accionesCargando.value,
    [key]: value,
  };
};

const isAccionCargando = (key) => Boolean(accionesCargando.value[key]);

const calcularMargen = (costo, precio) => {
  const costoNum = toNumber(costo, 0);
  const precioNum = toNumber(precio, 0);
  if (costoNum <= 0 || precioNum <= 0) return 0;
  return Number((((precioNum - costoNum) / costoNum) * 100).toFixed(2));
};

const calcularPrecioDesdeMargen = () => {
  const costo = Math.max(toNumber(formIngreso.value.costoUnitario, 0), 0);
  const margen = Math.max(toNumber(formIngreso.value.porcentajeGanancia, 0), 0);
  formIngreso.value.precioVentaSugerido = Number((costo * (1 + margen / 100)).toFixed(2));
  formIngreso.value.montoGanancia = Number((formIngreso.value.precioVentaSugerido - costo).toFixed(2));
};

const calcularMargenDesdePrecio = () => {
  formIngreso.value.porcentajeGanancia = calcularMargen(
    formIngreso.value.costoUnitario,
    formIngreso.value.precioVentaSugerido,
  );
  formIngreso.value.montoGanancia = Number((
    toNumber(formIngreso.value.precioVentaSugerido, 0) - toNumber(formIngreso.value.costoUnitario, 0)
  ).toFixed(2));
};

const calcularPrecioLoteDesdeMargen = () => {
  const costo = Math.max(toNumber(formLote.value.costoUnitario, 0), 0);
  const margen = Math.max(toNumber(formLote.value.porcentajeGanancia, 0), 0);
  const precio = Number((costo * (1 + margen / 100)).toFixed(2));
  formLote.value.precioVentaSugerido = precio;
  formLote.value.montoGanancia = Number((precio - costo).toFixed(2));
};

const calcularMargenLoteDesdePrecio = () => {
  const costo = toNumber(formLote.value.costoUnitario, 0);
  const precio = toNumber(formLote.value.precioVentaSugerido, 0);
  formLote.value.porcentajeGanancia = calcularMargen(costo, precio);
  formLote.value.montoGanancia = Math.max(Number((precio - costo).toFixed(2)), 0);
};

const buscarProductos = async (termino, limit = 8) => {
  const texto = String(termino || '').trim();
  if (texto.length < 2) return [];

  const response = await axios.get('/inventario/resumen', {
    params: {
      page: 1,
      limit,
      search: texto,
    },
  });

  return response.data.data || [];
};

const calcularNuevoIndice = (indiceActual, total, direccion) => {
  if (total <= 0) return -1;
  if (indiceActual < 0) return direccion > 0 ? 0 : total - 1;
  return (indiceActual + direccion + total) % total;
};

const onBuscarIngreso = () => {
  clearTimeout(timerBusquedaIngreso);
  timerBusquedaIngreso = setTimeout(async () => {
    try {
      loading.value.busquedaIngreso = true;
      resultadosIngreso.value = await buscarProductos(busquedaIngreso.value, 8);
      indiceIngresoActivo.value = resultadosIngreso.value.length ? 0 : -1;
    } finally {
      loading.value.busquedaIngreso = false;
    }
  }, 250);
};

const onBuscarKardex = () => {
  clearTimeout(timerBusquedaKardex);
  timerBusquedaKardex = setTimeout(async () => {
    try {
      loading.value.busquedaKardex = true;
      resultadosKardex.value = await buscarProductos(busquedaKardex.value, 10);
      indiceKardexActivo.value = resultadosKardex.value.length ? 0 : -1;
    } finally {
      loading.value.busquedaKardex = false;
    }
  }, 250);
};

const onBuscarLotes = () => {
  clearTimeout(timerBusquedaLotes);
  timerBusquedaLotes = setTimeout(async () => {
    try {
      loading.value.lotes = true;
      resultadosLotes.value = await buscarProductos(busquedaLotes.value, 10);
    } finally {
      loading.value.lotes = false;
    }
  }, 250);
};

const manejarTeclasIngreso = (event) => {
  const total = resultadosIngreso.value.length;
  if (!total && event.key !== 'Escape') return;

  if (event.key === 'Tab') {
    if (!total) return;
    const indice = indiceIngresoActivo.value >= 0 ? indiceIngresoActivo.value : 0;
    const item = resultadosIngreso.value[indice];
    if (item) seleccionarProductoIngreso(item);
    return;
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    indiceIngresoActivo.value = calcularNuevoIndice(indiceIngresoActivo.value, total, 1);
    return;
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault();
    indiceIngresoActivo.value = calcularNuevoIndice(indiceIngresoActivo.value, total, -1);
    return;
  }

  if (event.key === 'Enter') {
    if (!total) return;
    event.preventDefault();
    const indice = indiceIngresoActivo.value >= 0 ? indiceIngresoActivo.value : 0;
    const item = resultadosIngreso.value[indice];
    if (item) seleccionarProductoIngreso(item);
    return;
  }

  if (event.key === 'Escape') {
    resultadosIngreso.value = [];
    indiceIngresoActivo.value = -1;
  }
};

const manejarTeclasKardex = (event) => {
  const total = resultadosKardex.value.length;
  if (!total && event.key !== 'Escape') return;

  if (event.key === 'Tab') {
    if (!total) return;
    const indice = indiceKardexActivo.value >= 0 ? indiceKardexActivo.value : 0;
    const item = resultadosKardex.value[indice];
    if (item) seleccionarProductoKardex(item);
    return;
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    indiceKardexActivo.value = calcularNuevoIndice(indiceKardexActivo.value, total, 1);
    return;
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault();
    indiceKardexActivo.value = calcularNuevoIndice(indiceKardexActivo.value, total, -1);
    return;
  }

  if (event.key === 'Enter') {
    if (!total) return;
    event.preventDefault();
    const indice = indiceKardexActivo.value >= 0 ? indiceKardexActivo.value : 0;
    const item = resultadosKardex.value[indice];
    if (item) seleccionarProductoKardex(item);
    return;
  }

  if (event.key === 'Escape') {
    resultadosKardex.value = [];
    indiceKardexActivo.value = -1;
  }
};

const seleccionarProductoIngreso = (item) => {
  productoIngresoSeleccionado.value = item;
  formIngreso.value.productoId = item.id;
  formIngreso.value.costoUnitario = toNumber(item.precioCosto, 0);
  formIngreso.value.precioVentaSugerido = toNumber(item.precioVenta, 0);
  formIngreso.value.porcentajeGanancia = calcularMargen(item.precioCosto, item.precioVenta);
  formIngreso.value.montoGanancia = Number((
    toNumber(item.precioVenta, 0) - toNumber(item.precioCosto, 0)
  ).toFixed(2));

  const stockTienda = toNumber(item.stockPorUbicacion?.TIENDA, 0);
  const stockMinimo = Math.max(toNumber(item.stockMinimo, 0), 0);
  formIngreso.value.cantidad = Math.max(stockMinimo - stockTienda, 1);

  busquedaIngreso.value = `${item.nombre} (${item.id})`;
  resultadosIngreso.value = [];
  indiceIngresoActivo.value = -1;
};

const seleccionarProductoKardex = (item) => {
  productoKardexSeleccionado.value = item;
  filtrosKardex.value.productoId = item.id;
  busquedaKardex.value = `${item.nombre} (${item.id})`;
  resultadosKardex.value = [];
  indiceKardexActivo.value = -1;
};

const limpiarProductoKardex = () => {
  productoKardexSeleccionado.value = null;
  filtrosKardex.value.productoId = '';
  busquedaKardex.value = '';
  resultadosKardex.value = [];
  indiceKardexActivo.value = -1;
};

const seleccionarProductoLotes = (item) => {
  productoLotesSeleccionado.value = item;
  busquedaLotes.value = `${item.nombre} (${item.id})`;
  resultadosLotes.value = [];
  lotesProducto.value = [];
  historialLote.value = [];
  loteHistorialSeleccionadoId.value = null;
  resetEdicionLote();
  cargarLotesProducto();
};

const resetEdicionLote = () => {
  loteEditando.value = null;
  formLote.value = {
    fechaVigencia: fechaHoy,
    fechaIngreso: fechaHoy,
    costoUnitario: 0,
    porcentajeGanancia: 0,
    montoGanancia: 0,
    precioVentaSugerido: 0,
    motivo: '',
    usuarioResponsable: '',
  };
};

const prepararEdicionLote = (lote) => {
  loteEditando.value = lote;
  formLote.value = {
    fechaVigencia: fechaHoy,
    fechaIngreso: lote.fechaIngreso || fechaHoy,
    costoUnitario: toNumber(lote.costoUnitario, 0),
    porcentajeGanancia: toNumber(lote.porcentajeGanancia, 0),
    montoGanancia: Number((toNumber(lote.precioVentaSugerido, 0) - toNumber(lote.costoUnitario, 0)).toFixed(2)),
    precioVentaSugerido: toNumber(lote.precioVentaSugerido, 0),
    motivo: '',
    usuarioResponsable: '',
  };
};

const cargarLotesProducto = async () => {
  if (!productoLotesSeleccionado.value?.id) {
    return;
  }

  loading.value.lotes = true;
  try {
    const response = await axios.get(`/inventario/productos/${productoLotesSeleccionado.value.id}/lotes`, {
      params: {
        incluirAgotados: false,
      },
    });

    lotesProducto.value = response.data || [];

    if (loteEditando.value) {
      const loteActualizado = lotesProducto.value.find((item) => item.id === loteEditando.value.id);
      if (loteActualizado) {
        prepararEdicionLote(loteActualizado);
      }
    }
  } finally {
    loading.value.lotes = false;
  }
};

const cargarHistorialLote = async (loteId, page = 1) => {
  if (!loteId) return;

  loading.value.historialLote = true;
  loteHistorialSeleccionadoId.value = loteId;
  try {
    const params = {
      page,
      limit: paginacionHistorialLote.value.limit,
    };
    if (filtrosHistorialLote.value.fechaInicio) params.fechaInicio = filtrosHistorialLote.value.fechaInicio;
    if (filtrosHistorialLote.value.fechaFin) params.fechaFin = filtrosHistorialLote.value.fechaFin;
    if (filtrosHistorialLote.value.tipoCambio) params.tipoCambio = filtrosHistorialLote.value.tipoCambio;
    if (filtrosHistorialLote.value.usuarioResponsable) params.usuarioResponsable = filtrosHistorialLote.value.usuarioResponsable;
    if (filtrosHistorialLote.value.search) params.search = filtrosHistorialLote.value.search;

    const response = await axios.get(`/inventario/lotes/${loteId}/historial-cambios`, {
      params,
    });

    historialLote.value = response.data.data || [];
    paginacionHistorialLote.value = {
      totalItems: toNumber(response.data.totalItems, 0),
      totalPages: toNumber(response.data.totalPages, 0),
      currentPage: toNumber(response.data.currentPage, 1),
      limit: paginacionHistorialLote.value.limit,
    };
  } finally {
    loading.value.historialLote = false;
  }
};

const limpiarFiltrosHistorialLote = async () => {
  filtrosHistorialLote.value = {
    fechaInicio: '',
    fechaFin: '',
    tipoCambio: '',
    usuarioResponsable: '',
    search: '',
  };

  if (loteHistorialSeleccionadoId.value) {
    await cargarHistorialLote(loteHistorialSeleccionadoId.value, 1);
  }
};

const exportarHistorialLoteCSV = async () => {
  if (!loteHistorialSeleccionadoId.value) {
    errorOperacion.value = 'Selecciona un lote para exportar su historial.';
    return;
  }

  loading.value.exportHistorial = true;
  try {
    const registros = [];
    let page = 1;
    let totalPages = 1;

    do {
      const params = {
        page,
        limit: 100,
      };
      if (filtrosHistorialLote.value.fechaInicio) params.fechaInicio = filtrosHistorialLote.value.fechaInicio;
      if (filtrosHistorialLote.value.fechaFin) params.fechaFin = filtrosHistorialLote.value.fechaFin;
      if (filtrosHistorialLote.value.tipoCambio) params.tipoCambio = filtrosHistorialLote.value.tipoCambio;
      if (filtrosHistorialLote.value.usuarioResponsable) params.usuarioResponsable = filtrosHistorialLote.value.usuarioResponsable;
      if (filtrosHistorialLote.value.search) params.search = filtrosHistorialLote.value.search;

      const response = await axios.get(`/inventario/lotes/${loteHistorialSeleccionadoId.value}/historial-cambios`, { params });
      const data = response.data.data || [];
      registros.push(...data);
      totalPages = toNumber(response.data.totalPages, 1);
      page += 1;
    } while (page <= totalPages);

    const header = [
      'FechaVigencia',
      'LoteId',
      'TipoCambio',
      'CostoAnterior',
      'CostoNuevo',
      'MargenAnterior',
      'MargenNuevo',
      'PrecioAnterior',
      'PrecioNuevo',
      'FechaIngresoAnterior',
      'FechaIngresoNueva',
      'UsuarioResponsable',
      'Motivo',
      'CreadoEn',
    ];

    const rows = registros.map((item) => [
      item.fechaVigencia || '',
      item.loteId || '',
      item.tipoCambio || '',
      item.costoAnterior || 0,
      item.costoNuevo || 0,
      item.porcentajeGananciaAnterior || 0,
      item.porcentajeGananciaNuevo || 0,
      item.precioVentaAnterior || 0,
      item.precioVentaNuevo || 0,
      item.fechaIngresoAnterior || '',
      item.fechaIngresoNueva || '',
      item.usuarioResponsable || '',
      (item.motivo || '').replace(/\r?\n|\r/g, ' '),
      item.createdAt || '',
    ]);

    const csvContent = [header, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `historial_lote_${loteHistorialSeleccionadoId.value}_${fechaHoy}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    mensajeOperacion.value = `Historial del lote ${loteHistorialSeleccionadoId.value} exportado correctamente.`;
  } catch (error) {
    errorOperacion.value = error.response?.data?.details || error.response?.data?.error || 'No se pudo exportar el historial.';
  } finally {
    loading.value.exportHistorial = false;
  }
};

const guardarAjusteLote = async () => {
  if (!loteEditando.value?.id) {
    errorOperacion.value = 'Selecciona un lote para guardar cambios.';
    return;
  }

  limpiarMensajes();
  loading.value.lote = true;
  try {
    const payload = {
      fechaVigencia: formLote.value.fechaVigencia,
      fechaIngreso: formLote.value.fechaIngreso,
      costoUnitario: toNumber(formLote.value.costoUnitario, 0),
      porcentajeGanancia: toNumber(formLote.value.porcentajeGanancia, 0),
      montoGanancia: toNumber(formLote.value.montoGanancia, 0),
      precioVentaSugerido: toNumber(formLote.value.precioVentaSugerido, 0),
      motivo: formLote.value.motivo,
      usuarioResponsable: formLote.value.usuarioResponsable,
    };

    await axios.put(`/inventario/lotes/${loteEditando.value.id}/parametros-comerciales`, payload);
    mensajeOperacion.value = `Lote ${loteEditando.value.id} actualizado correctamente.`;

    await Promise.all([
      cargarLotesProducto(),
      cargarHistorialLote(loteEditando.value.id, 1),
      cargarAlertas(paginacionAlertas.value.currentPage || 1),
      cargarKardex(),
    ]);
  } catch (error) {
    errorOperacion.value = error.response?.data?.details || error.response?.data?.error || 'No se pudo actualizar el lote.';
  } finally {
    loading.value.lote = false;
  }
};

const prepararIngresoDesdeAlerta = (item) => {
  limpiarMensajes();

  const costoRef = toNumber(item.costoReferencia, 0);
  const precioRef = toNumber(item.precioReferencia, 0);

  productoIngresoSeleccionado.value = {
    id: item.productoId,
    sku: item.sku,
    nombre: item.nombre,
    stockMinimo: item.stockMinimoObjetivo,
    precioCosto: costoRef,
    precioVenta: precioRef,
    stockPorUbicacion: {
      TIENDA: item.stockTienda,
      ALMACEN: item.stockAlmacen,
    },
  };

  formIngreso.value.productoId = item.productoId;
  formIngreso.value.ubicacionCodigo = 'ALMACEN';
  formIngreso.value.cantidad = Math.max(toNumber(item.sinCobertura, 0), 1);
  formIngreso.value.costoUnitario = costoRef;
  formIngreso.value.precioVentaSugerido = precioRef;
  formIngreso.value.porcentajeGanancia = calcularMargen(costoRef, precioRef);
  formIngreso.value.montoGanancia = Number((precioRef - costoRef).toFixed(2));

  busquedaIngreso.value = `${item.nombre} (${item.productoId})`;
  resultadosIngreso.value = [];
  indiceIngresoActivo.value = -1;

  const seccionIngreso = document.getElementById('ingreso-rapido');
  if (seccionIngreso) {
    seccionIngreso.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

const manejarEnterBusquedaAlertas = (event) => {
  const hayDropdownAbierto = resultadosIngreso.value.length > 0 || resultadosKardex.value.length > 0;
  if (hayDropdownAbierto) {
    return;
  }

  event.preventDefault();
  cargarAlertas(1);
};

const cargarAlertas = async (page = 1) => {
  loading.value.alertas = true;
  try {
    const response = await axios.get('/inventario/alertas-reposicion', {
      params: {
        page,
        limit: limiteAlertas.value,
        search: filtroAlertas.value,
        stockMinimoDefault: 5,
        incluirSinAlerta: incluirSinAlerta.value,
      },
    });

    alertas.value = response.data.alertas || [];
    resumenAlertas.value = response.data.resumen || resumenAlertas.value;
    paginacionAlertas.value = {
      totalItems: toNumber(response.data.totalItems, 0),
      totalPages: toNumber(response.data.totalPages, 0),
      currentPage: toNumber(response.data.currentPage, 1),
      limit: toNumber(response.data.limit, limiteAlertas.value),
    };
  } finally {
    loading.value.alertas = false;
  }
};

const cargarKardex = async () => {
  loading.value.kardex = true;
  try {
    const params = {
      fechaInicio: filtrosKardex.value.fechaInicio,
      fechaFin: filtrosKardex.value.fechaFin,
      limit: 1200,
    };

    if (filtrosKardex.value.productoId) params.productoId = filtrosKardex.value.productoId;
    if (filtrosKardex.value.ubicacionCodigo) params.ubicacionCodigo = filtrosKardex.value.ubicacionCodigo;

    const response = await axios.get('/inventario/kardex-historico', { params });
    kardex.value = {
      saldoInicial: response.data.saldoInicial || 0,
      saldoFinal: response.data.saldoFinal || 0,
      totalMovimientos: response.data.totalMovimientos || 0,
      resumenDiario: response.data.resumenDiario || [],
    };
  } finally {
    loading.value.kardex = false;
  }
};

const cargarEstadoSnapshot = async () => {
  const response = await axios.get('/inventario/snapshot-diario/estado');
  estadoSnapshot.value = response.data;
};

const generarSnapshotManual = async () => {
  loading.value.snapshot = true;
  limpiarMensajes();

  try {
    await axios.post('/inventario/snapshot-diario', {
      fecha: fechaSnapshotManual.value,
    });
    await cargarEstadoSnapshot();
    mensajeOperacion.value = 'Snapshot manual generado correctamente.';
  } catch (error) {
    errorOperacion.value = error.response?.data?.details || error.response?.data?.error || 'No se pudo generar snapshot manual.';
  } finally {
    loading.value.snapshot = false;
  }
};

const registrarIngresoRapido = async () => {
  limpiarMensajes();

  if (!formIngreso.value.productoId) {
    errorOperacion.value = 'Selecciona un producto antes de registrar ingreso.';
    return;
  }

  if (toNumber(formIngreso.value.cantidad, 0) <= 0) {
    errorOperacion.value = 'La cantidad debe ser mayor a 0.';
    return;
  }

  loading.value.ingreso = true;
  try {
    const payload = {
      ...formIngreso.value,
      cantidad: parseInt(formIngreso.value.cantidad, 10),
      costoUnitario: toNumber(formIngreso.value.costoUnitario, 0),
      porcentajeGanancia: toNumber(formIngreso.value.porcentajeGanancia, 0),
      montoGanancia: toNumber(formIngreso.value.montoGanancia, 0),
      precioVentaSugerido: toNumber(formIngreso.value.precioVentaSugerido, 0),
    };

    await axios.post('/inventario/ingresos', payload);

    mensajeOperacion.value = `Ingreso registrado para ${productoIngresoSeleccionado.value?.nombre || formIngreso.value.productoId}.`;

    await Promise.all([
      cargarAlertas(paginacionAlertas.value.currentPage || 1),
      cargarKardex(),
      cargarEstadoSnapshot(),
    ]);
  } catch (error) {
    errorOperacion.value = error.response?.data?.details || error.response?.data?.error || 'No se pudo registrar el ingreso.';
  } finally {
    loading.value.ingreso = false;
  }
};

const ejecutarTrasladoSugerido = async (item) => {
  const cantidad = toNumber(item.sugerenciaTraslado, 0);
  if (cantidad <= 0) return;

  limpiarMensajes();
  const key = `traslado-${item.productoId}`;
  setAccionCargando(key, true);

  try {
    await axios.post('/inventario/traslados', {
      productoId: item.productoId,
      cantidad,
      ubicacionOrigenCodigo: 'ALMACEN',
      ubicacionDestinoCodigo: 'TIENDA',
      observaciones: 'Reposicion rapida desde alertas',
    });

    mensajeOperacion.value = `Traslado realizado: ${item.nombre} (${cantidad} unidades).`;

    await Promise.all([
      cargarAlertas(paginacionAlertas.value.currentPage || 1),
      cargarKardex(),
    ]);
  } catch (error) {
    errorOperacion.value = error.response?.data?.details || error.response?.data?.error || 'No se pudo registrar el traslado.';
  } finally {
    setAccionCargando(key, false);
  }
};

onMounted(async () => {
  resetEdicionLote();
  await Promise.all([
    cargarAlertas(1),
    cargarKardex(),
    cargarEstadoSnapshot(),
  ]);
});
</script>

<style scoped>
.input-control {
  @apply block w-full p-2.5 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white;
}

.btn-primary {
  @apply px-4 py-2 rounded-lg bg-blue-700 text-white text-sm font-medium hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply px-4 py-2 rounded-lg bg-gray-700 text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed;
}

.btn-mini {
  @apply px-2 py-1 rounded-md bg-blue-700 text-white text-xs font-medium hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed;
}

.btn-mini-secondary {
  @apply px-2 py-1 rounded-md bg-gray-200 text-gray-800 text-xs font-medium hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600;
}

.card-kpi {
  @apply bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600;
}

.kpi-label {
  @apply text-sm text-gray-500 dark:text-gray-400;
}

.kpi-value {
  @apply text-xl font-semibold text-gray-900 dark:text-white;
}
</style>
