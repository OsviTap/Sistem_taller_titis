<template>
  <div class="py-6 sm:py-8 px-3 sm:px-4 mx-auto max-w-screen-2xl lg:px-6">
    <div class="relative bg-white dark:bg-gray-800 sm:rounded-lg overflow-hidden">
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
          Control de Inventario
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Kardex histórico, alertas de reposición y gestión de snapshots diarios.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-3">Filtros Kardex</h3>

          <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">Producto</label>
          <select v-model="filtrosKardex.productoId" class="input-control mb-3">
            <option value="">Todos</option>
            <option v-for="producto in productos" :key="producto.id" :value="producto.id">
              {{ producto.nombre }} ({{ producto.id }})
            </option>
          </select>

          <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">Ubicación</label>
          <select v-model="filtrosKardex.ubicacionCodigo" class="input-control mb-3">
            <option value="">Todas</option>
            <option value="TIENDA">Tienda</option>
            <option value="ALMACEN">Almacén</option>
          </select>

          <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">Desde</label>
          <input v-model="filtrosKardex.fechaInicio" type="date" class="input-control mb-3" />

          <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">Hasta</label>
          <input v-model="filtrosKardex.fechaFin" type="date" class="input-control mb-3" />

          <button @click="cargarKardex" class="btn-primary w-full" :disabled="loading.kardex">
            {{ loading.kardex ? 'Cargando...' : 'Actualizar Kardex' }}
          </button>
        </div>

        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 lg:col-span-2">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-3">Snapshot Diario</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
              <p class="text-sm text-gray-500 dark:text-gray-400">Último snapshot</p>
              <p class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ estadoSnapshot.ultimoSnapshot || 'Sin registros' }}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Registros: {{ estadoSnapshot.registrosUltimoSnapshot || 0 }}
              </p>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
              <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">Fecha de snapshot manual</label>
              <input v-model="fechaSnapshotManual" type="date" class="input-control mb-2" />
              <button @click="generarSnapshotManual" class="btn-secondary w-full" :disabled="loading.snapshot">
                {{ loading.snapshot ? 'Generando...' : 'Generar Snapshot Manual' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="p-4 border-t border-b border-gray-200 dark:border-gray-700">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h3 class="font-semibold text-gray-900 dark:text-white">Alertas de Reposición (Tienda)</h3>
          <div class="flex gap-2">
            <input
              v-model="filtroAlertas"
              type="text"
              placeholder="Buscar producto..."
              class="input-control"
            />
            <button @click="cargarAlertas" class="btn-primary" :disabled="loading.alertas">
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
          <table class="w-full min-w-[980px] text-sm text-left text-gray-500 dark:text-gray-400">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th class="px-4 py-3">Producto</th>
                <th class="px-4 py-3">Tienda</th>
                <th class="px-4 py-3">Almacén</th>
                <th class="px-4 py-3">Mínimo</th>
                <th class="px-4 py-3">Déficit</th>
                <th class="px-4 py-3">Sugerencia traslado</th>
                <th class="px-4 py-3">Estado</th>
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
              </tr>
              <tr v-if="!alertas.length">
                <td colspan="7" class="px-4 py-4 text-center text-gray-500">No hay alertas para los filtros seleccionados.</td>
              </tr>
            </tbody>
          </table>
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import axios from '@/api/axios';

const hoy = new Date();
const fechaHoy = hoy.toISOString().slice(0, 10);
const hace30 = new Date(hoy.getTime() - (30 * 24 * 60 * 60 * 1000)).toISOString().slice(0, 10);

const productos = ref([]);
const alertas = ref([]);
const resumenAlertas = ref({
  totalProductos: 0,
  conAlerta: 0,
  urgentes: 0,
  sinCoberturaAlmacen: 0,
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

const loading = ref({
  alertas: false,
  kardex: false,
  snapshot: false,
});

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

const cargarProductos = async () => {
  const response = await axios.get('/productos', {
    params: { page: 1, limit: 2000 },
  });
  productos.value = response.data.data || [];
};

const cargarAlertas = async () => {
  loading.value.alertas = true;
  try {
    const response = await axios.get('/inventario/alertas-reposicion', {
      params: {
        search: filtroAlertas.value,
        stockMinimoDefault: 5,
      },
    });
    alertas.value = response.data.alertas || [];
    resumenAlertas.value = response.data.resumen || resumenAlertas.value;
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
  try {
    await axios.post('/inventario/snapshot-diario', {
      fecha: fechaSnapshotManual.value,
    });
    await cargarEstadoSnapshot();
  } finally {
    loading.value.snapshot = false;
  }
};

onMounted(async () => {
  await Promise.all([
    cargarProductos(),
    cargarAlertas(),
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
