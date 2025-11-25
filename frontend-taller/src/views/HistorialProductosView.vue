<template>
  <div class="py-8 px-4 mx-auto max-w-screen-2xl lg:px-6">
    <div class="relative bg-white dark:bg-gray-800 sm:rounded-lg overflow-hidden">
      <!-- Título y filtros -->
      <div class="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
        <div class="w-full md:w-1/2">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
            Historial de Productos
          </h2>
        </div>
        <div class="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
          <!-- Filtro de período -->
          <select 
            v-model="periodoSeleccionado" 
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
            <option value="mensual">Mensual</option>
            <option value="anual">Anual</option>
          </select>
          <!-- Selector de fecha -->
          <input 
            type="month" 
            v-if="periodoSeleccionado === 'mensual'"
            v-model="fechaSeleccionada"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
          <input 
            type="number" 
            v-else
            v-model="yearSeleccionado"
            placeholder="Año"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
        </div>
      </div>

      <!-- Tabla de historial -->
      <div class="relative overflow-x-auto shadow-md sm:rounded-lg m-4">
        <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" class="px-6 py-3">Fecha De Venta</th>
              <th scope="col" class="px-6 py-3">Producto</th>
              <th scope="col" class="px-6 py-3">Cliente</th>
              <th scope="col" class="px-6 py-3">Vehículo</th>
              <th scope="col" class="px-6 py-3">Cantidad</th>
              <th scope="col" class="px-6 py-3">Precio Costo</th>
              <th scope="col" class="px-6 py-3">Precio Venta</th>
              <th scope="col" class="px-6 py-3">Descuento</th>
              <th scope="col" class="px-6 py-3">Ganancia</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="registro in historialPaginado" :key="registro.id" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
              <td class="px-6 py-4">{{ formatDate(registro.fechaSalida) }}</td>
              <td class="px-6 py-4">{{ registro.nombreProducto || registro.Producto?.nombre }}</td>
              <td class="px-6 py-4">{{ registro.Cliente.nombre }}</td>
              <td class="px-6 py-4">
                {{
                  `${registro.Vehiculo?.marcaVehiculo?.nombre || 'Sin marca'} - ${registro.Vehiculo?.modeloVehiculo?.nombre || 'Sin modelo'}`
                }}
              </td>
              <td class="px-6 py-4">{{ registro.cantidad }}</td>
              <td class="px-6 py-4">{{ formatCurrency(registro.precioCosto) }}</td>
              <td class="px-6 py-4">{{ formatCurrency(registro.precioVenta) }}</td>
              <td class="px-6 py-4">{{ formatCurrency(registro.descuento) }}</td>
              <td class="px-6 py-4">{{ formatCurrency(registro.ganancia) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div class="flex justify-between items-center p-4">
        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-700 dark:text-gray-400">
            Mostrando
            <span class="font-semibold text-gray-900 dark:text-white">{{ paginaInicio }}</span>
            a
            <span class="font-semibold text-gray-900 dark:text-white">{{ paginaFin }}</span>
            de
            <span class="font-semibold text-gray-900 dark:text-white">{{ totalItems }}</span>
            resultados
          </span>
        </div>
        <div class="flex space-x-2">
          <button
            @click="cambiarPagina(paginaActual - 1)"
            :disabled="paginaActual === 1"
            class="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
            Anterior
          </button>
          <button
            v-for="pagina in totalPaginas"
            :key="pagina"
            @click="cambiarPagina(pagina)"
            :class="[
              'px-3 py-1 border rounded-md',
              paginaActual === pagina ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'
            ]">
            {{ pagina }}
          </button>
          <button
            @click="cambiarPagina(paginaActual + 1)"
            :disabled="paginaActual === totalPaginas"
            class="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
            Siguiente
          </button>
        </div>
      </div>

      <!-- Resumen de totales -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 m-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div class="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Total Vendido</h3>
          <p class="text-2xl font-bold text-green-600 dark:text-green-400">
            {{ formatCurrency(totales.totalVendido) }}
          </p>
        </div>
        <div class="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Total Costo</h3>
          <p class="text-2xl font-bold text-red-600 dark:text-red-400">
            {{ formatCurrency(totales.totalCosto) }}
          </p>
        </div>
        <div class="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Total Descuento</h3>
          <p class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {{ formatCurrency(totales.totalDescuento) }}
          </p>
        </div>
        <div class="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Ganancia Total</h3>
          <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {{ formatCurrency(totales.gananciaTotal) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import axios from '@/api/axios';

const periodoSeleccionado = ref('mensual');
const fechaSeleccionada = ref(new Date().toISOString().slice(0, 7));
const yearSeleccionado = ref(new Date().getFullYear());
const historial = ref([]);
const totales = ref({
  totalVendido: 0,
  totalCosto: 0,
  totalDescuento: 0,
  gananciaTotal: 0
});

// Paginación del servidor
const itemsPorPagina = ref(10);
const paginaActual = ref(1);
const totalItems = ref(0);
const totalPaginasServer = ref(0);
const isLoading = ref(false);

// Computed properties para la paginación
const totalPaginas = computed(() => totalPaginasServer.value);
const paginaInicio = computed(() => ((paginaActual.value - 1) * itemsPorPagina.value) + 1);
const paginaFin = computed(() => Math.min(paginaActual.value * itemsPorPagina.value, totalItems.value));

// Ya no necesitamos paginación del cliente, usamos los datos directos del servidor
const historialPaginado = computed(() => historial.value);

// Función para cambiar de página
const cambiarPagina = (pagina) => {
  if (pagina >= 1 && pagina <= totalPaginas.value) {
    paginaActual.value = pagina;
    cargarHistorial();
  }
};

// Cargar datos del historial con paginación del servidor
const cargarHistorial = async () => {
  isLoading.value = true;
  try {
    let params = {
      page: paginaActual.value,
      limit: itemsPorPagina.value
    };
    
    if (periodoSeleccionado.value === 'mensual' && fechaSeleccionada.value) {
      const [year, month] = fechaSeleccionada.value.split('-');
      params.year = year;
      params.month = month;
    } else if (periodoSeleccionado.value === 'anual' && yearSeleccionado.value) {
      params.year = yearSeleccionado.value;
    }

    const response = await axios.get('/historial-productos', { params });
    
    // Manejar la nueva estructura de respuesta paginada
    historial.value = response.data.historial;
    totales.value = response.data.totales;
    totalItems.value = response.data.totalItems || 0;
    totalPaginasServer.value = response.data.totalPages || 0;
    
  } catch (error) {
    console.error('Error al cargar historial:', error);
  } finally {
    isLoading.value = false;
  }
};

// Observar cambios en los filtros - resetear a página 1
watch([periodoSeleccionado, fechaSeleccionada, yearSeleccionado], () => {
  paginaActual.value = 1;
  cargarHistorial();
});

// Formatear moneda
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB'
  }).format(amount || 0);
};

// Formatear fecha (corregido para evitar problemas de timezone)
const formatDate = (dateString) => {
  if (!dateString) return '';
  
  // Crear fecha desde el string sin conversión de timezone
  // Esto asegura que si la fecha es "2024-11-24", se muestre como 24 de noviembre
  const date = new Date(dateString);
  
  // Ajustar por el offset de timezone para obtener la fecha "local" correcta
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() + userTimezoneOffset);
  
  return localDate.toLocaleDateString('es-BO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Cargar datos iniciales
onMounted(() => {
  cargarHistorial();
});

// Función para registrar automáticamente en el historial cuando se realiza una venta
const registrarEnHistorial = async (venta) => {
  try {
    await axios.post('/historial-productos', {
      fechaSalida: new Date(),
      cantidad: venta.cantidad,
      precioCosto: venta.precioCosto,
      precioVenta: venta.precioVenta,
      descuento: venta.descuento || 0,
      productoId: venta.productoId,
      clienteId: venta.clienteId,
      vehiculoId: venta.vehiculoId,
      visitaId: venta.visitaId
    });
    
    await cargarHistorial();
  } catch (error) {
    console.error('Error al registrar en historial:', error);
  }
};
</script>

<style scoped>
.input-select, .input-text {
  @apply block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500;
}
</style>