<template>
    <div class="relative overflow-x-auto shadow-md sm:rounded-lg m-4">
      <div class="p-4 flex items-center gap-4">
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
          Productos con Stock Bajo
        </h3>
        <div class="flex items-center gap-2">
          <label class="text-sm text-gray-600">Umbral de stock bajo:</label>
          <input
            type="number"
            v-model="STOCK_BAJO_UMBRAL"
            @change="cambiarUmbralStockBajo(STOCK_BAJO_UMBRAL)"
            class="w-20 px-2 py-1 border rounded"
            min="1"
          >
        </div>
      </div>
      <div v-if="isLoading" class="p-4 text-center">
        <div role="status">
          <svg class="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
          </svg>
          <span class="sr-only">Cargando...</span>
        </div>
      </div>

      <div v-if="error" class="p-4 text-center text-red-500">
        {{ error }}
      </div>

      <div v-if="productosPaginados.length > 0" class="overflow-x-auto">
        <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" class="px-6 py-3 whitespace-nowrap">Nombre</th>
              <th scope="col" class="px-6 py-3 whitespace-nowrap">Stock</th>
              <th scope="col" class="px-6 py-3 whitespace-nowrap">Precio Venta</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="producto in productosPaginados" 
                :key="producto.id" 
                class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
              <td class="px-6 py-4 whitespace-nowrap">{{ producto.nombre }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-red-600 font-medium">{{ producto.stock }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">{{ producto.precioVenta }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else-if="!isLoading" class="p-4 text-center text-gray-500">
        No hay productos con stock bajo.
      </div>

      <Paginacion
        v-if="totalItems > 0"
        :current-page="currentPage"
        :items-per-page="itemsPerPage"
        :total-items="totalItems"
        @cambiar-pagina="cambiarPagina"
      />
    </div>
</template>
  
<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import axios from '@/api/axios';
import { io } from 'socket.io-client';
import Paginacion from './Paginacion.vue';

// Variables de estado
const productosStockBajo = ref([]);
const isLoading = ref(false);
const error = ref(null);

// Configuración
const STOCK_BAJO_UMBRAL = ref(5);
const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
let socket = null;

// Intentar conectar socket solo si está disponible
try {
  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    timeout: 5000
  });
} catch (err) {
  console.warn('Socket.IO no disponible:', err);
}

// Paginación
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalItems = ref(0);
const todosLosProductos = ref([]); // Almacena todos los productos

const productosPaginados = computed(() => {
  const inicio = (currentPage.value - 1) * itemsPerPage.value;
  const fin = inicio + itemsPerPage.value;
  return productosStockBajo.value.slice(inicio, fin);
});

const cargarProductosStockBajo = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    // OPTIMIZACIÓN: Obtener solo productos con bajo stock del backend
    const response = await axios.get('/productos', {
      params: {
        lowStock: STOCK_BAJO_UMBRAL.value,
        limit: 100 // Límite razonable para evitar sobrecarga
      }
    });
    
    // El backend devuelve { data, totalItems, totalPages, currentPage }
    const productos = response.data.data || response.data.productos || response.data;
    
    // Asegurarse de que productos sea un array
    const productosArray = Array.isArray(productos) ? productos : [];
    
    // Los productos ya vienen filtrados del backend
    todosLosProductos.value = productosArray;
    
    // Actualizar total de items y productos paginados
    totalItems.value = todosLosProductos.value.length;
    productosStockBajo.value = todosLosProductos.value;
    
  } catch (err) {
    error.value = 'Error al cargar productos: ' + err.message;
    console.error('Error al cargar productos:', err);
  } finally {
    isLoading.value = false;
  }
};

const cambiarPagina = (pagina) => {
  currentPage.value = pagina;
};

const cambiarUmbralStockBajo = (nuevoUmbral) => {
  STOCK_BAJO_UMBRAL.value = nuevoUmbral;
  cargarProductosStockBajo();
};

onMounted(() => {
  cargarProductosStockBajo();
  
  if (socket) {
    socket.on('stockUpdated', () => {
      cargarProductosStockBajo();
    });

    socket.on('connect_error', (err) => {
      console.warn('Error de conexión con Socket.IO:', err);
      // No mostrar error al usuario, ya que no es crítico
    });
  }
});

onUnmounted(() => {
  if (socket) {
    socket.off('stockUpdated');
    socket.off('connect_error');
    socket.disconnect();
  }
});
</script>