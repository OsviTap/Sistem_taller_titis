<template>
  <div>
    <!-- Tabla existente -->
    <div class="relative overflow-x-auto shadow-md sm:rounded-lg m-4">
      <div v-if="productos.length > 0" >
        <table  id="filter-table" class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            
            <th scope="col" class="px-6 py-3">Nombre</th>
            <th scope="col" class="px-6 py-3">Stock</th>
            <th scope="col" class="px-6 py-3">Precio Costo</th>
            <th scope="col" class="px-6 py-3">Precio Venta</th>
            <th scope="col" class="px-6 py-3">Fecha Adquisición</th>
            <th scope="col" class="px-6 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="producto in productos" :key="producto.id" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
            
            <td class="px-6 py-4">{{ producto.nombre }}</td>
            <td class="px-6 py-4">{{ producto.stock }}</td>
            <td class="px-6 py-4">{{ producto.precioCosto }}</td>
            <td class="px-6 py-4">{{ producto.precioVenta }}</td>
            <td class="px-6 py-4">{{ formatDate(producto.fechaAdquisicion) }}</td>
            <td class="px-6 py-4">
              <div class="flex items-center space-x-2">
                <button @click="openViewModal(producto)" class="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                  Ver
                </button>
                <button @click="openEditModal(producto)" class="font-medium text-yellow-600 dark:text-yellow-500 hover:underline">
                  Editar
                </button>
                <button @click="confirmarEliminacion(producto)" class="font-medium text-red-600 dark:text-red-500 hover:underline">
                  Eliminar
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
      
    </div>

    <!-- Modal de Crear/Editar Producto -->
    <div v-if="showFormModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="relative bg-white rounded-lg shadow dark:bg-gray-800 w-full max-w-md">
        <!-- Header del Modal -->
        <div class="flex items-center justify-between p-4 border-b rounded-t dark:border-gray-600">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ modalMode === 'create' ? 'Registrar Producto' : modalMode === 'edit' ? 'Editar Producto' : 'Ver Producto' }}
          </h3>
          <button @click="closeModal" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </div>

        <!-- Contenido del Modal -->
        <div class="p-6 space-y-6">
          <form @submit.prevent="submitForm">
            <div class="grid gap-4 mb-4">
              <div>
                <label for="nombre" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nombre</label>
                <input 
                  type="text" 
                  id="nombre" 
                  v-model="formData.nombre" 
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                  required
                  :disabled="modalMode === 'view'"
                >
              </div>
              <div>
                <label for="stock" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Stock</label>
                <input 
                  type="number" 
                  id="stock" 
                  v-model="formData.stock" 
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                  required
                  :disabled="modalMode === 'view'"
                >
              </div>
              <div>
                <label for="precioCosto" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Precio Costo</label>
                <input 
                  type="number" 
                  id="precioCosto" 
                  v-model="formData.precioCosto" 
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                  required
                  step="0.01"
                  :disabled="modalMode === 'view'"
                >
              </div>
              <div>
                <label for="precioVenta" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Precio Venta</label>
                <input 
                  type="number" 
                  id="precioVenta" 
                  v-model="formData.precioVenta" 
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                  required
                  step="0.01"
                  :disabled="modalMode === 'view'"
                >
              </div>
              <div>
                <label for="fechaAdquisicion" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Fecha Adquisición</label>
                <input 
                  type="date" 
                  id="fechaAdquisicion" 
                  v-model="formData.fechaAdquisicion" 
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                  required
                  :disabled="modalMode === 'view'"
                >
              </div>
            </div>
            
            <!-- Botones del Modal -->
            <div class="flex items-center justify-end space-x-2 border-t pt-4">
              <button 
                type="button"
                @click="closeModal"
                class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
              >
                Cancelar
              </button>
              <button 
                v-if="modalMode !== 'view'"
                type="submit"
                class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                {{ modalMode === 'create' ? 'Registrar' : 'Actualizar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal de Confirmación de Eliminación -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="relative bg-white rounded-lg shadow dark:bg-gray-800 w-full max-w-md">
        <div class="p-6 text-center">
          <svg class="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
            ¿Está seguro que desea eliminar este producto?
          </h3>
          <button 
            @click="deleteProducto"
            class="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2"
          >
            Sí, eliminar
          </button>
          <button 
            @click="showDeleteModal = false"
            class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
          >
            No, cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, onUnmounted } from 'vue';
import { DataTable } from 'simple-datatables';
import axios from '@/api/axios';
import { io } from 'socket.io-client';

const productos = ref([]);
const showFormModal = ref(false);
const showDeleteModal = ref(false);
const modalMode = ref('create');
const selectedProduct = ref(null);
const dataTable = ref(null);
const socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001', {
  transports: ['websocket'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 10,
  timeout: 5000,
  autoConnect: true,
});

const formData = ref({
  nombre: '',
  stock: 0,
  precioCosto: 0,
  precioVenta: 0,
  fechaAdquisicion: ''
});

// Función para cargar productos
const cargarProductos = async () => {
    try {
        const response = await axios.get('/productos');
        productos.value = response.data;
    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
};

// Función de formateo de fecha
const formatDate = (date) => {
  if (!date) return '';
  const fechaUTC = new Date(date);
  // Ajustar la fecha a la zona horaria local sin cambiar el día
  const fechaLocal = new Date(fechaUTC.getTime() + fechaUTC.getTimezoneOffset() * 60000);
  return fechaLocal.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};
// Función para convertir fecha a formato ISO para el input date
const formatDateForInput = (date) => {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
};

const initializeDataTable = async () => {
  await nextTick();
  const table = document.getElementById("filter-table");
  if (table && productos.value.length > 0) {
    if (dataTable.value) {
      dataTable.value.destroy();
    }
    dataTable.value = new DataTable(table, {
      perPageSelect: [5, 10, 15, 20, 25],
      labels: {
        placeholder: "Buscar...",
        perPage: "{select} registros por página",
        noRows: "No hay registros",
        info: "Mostrando {start} a {end} de {rows} registros",
      },
    });
  }
};

const fetchProductos = async () => {
  try {
    const response = await axios.get('/productos');
    productos.value = response.data;
    await nextTick();
    await initializeDataTable();
  } catch (error) {
    console.error('Error al obtener productos:', error);
  }
};

onMounted(() => {
  fetchProductos();
  cargarProductos();
    
    // Escuchar actualizaciones de stock
    socket.on('stockUpdated', () => {
        cargarProductos();
    });
});

// Limpiar socket al desmontar
onUnmounted(() => {
    socket.off('stockUpdated');
    socket.disconnect();
});

onBeforeUnmount(() => {
  if (dataTable.value) {
    dataTable.value.destroy();
  }
});

const resetFormData = () => {
  formData.value = {
    nombre: '',
    stock: 0,
    precioCosto: 0,
    precioVenta: 0,
    fechaAdquisicion: ''
  };
};

const openCreateModal = () => {
  modalMode.value = 'create';
  resetFormData();
  showFormModal.value = true;
};

const openEditModal = (producto) => {
  modalMode.value = 'edit';
  selectedProduct.value = producto;
  formData.value = {
    ...producto,
    fechaAdquisicion: formatDateForInput(producto.fechaAdquisicion)
  };
  showFormModal.value = true;
};

const openViewModal = (producto) => {
  modalMode.value = 'view';
  selectedProduct.value = producto;
  formData.value = {
    ...producto,
    fechaAdquisicion: formatDateForInput(producto.fechaAdquisicion)
  };
  showFormModal.value = true;
};

const closeModal = () => {
  showFormModal.value = false;
  resetFormData();
  selectedProduct.value = null;
};

const submitForm = async () => {
  try {
    if (modalMode.value === 'create') {
      await axios.post('/productos', formData.value);
      alert('Producto creado exitosamente');
    } else if (modalMode.value === 'edit') {
      await axios.put(`/productos/${selectedProduct.value.id}`, formData.value);
      alert('Producto actualizado exitosamente');
    }
    showFormModal.value = false;
    resetFormData();
    window.location.reload();
  } catch (error) {
    console.error('Error:', error);
    alert('Error al guardar el producto');
  }
};

const confirmarEliminacion = (producto) => {
  selectedProduct.value = producto;
  showDeleteModal.value = true;
};

const deleteProducto = async () => {
  try {
    await axios.delete(`/productos/${selectedProduct.value.id}`);
    showDeleteModal.value = false;
    selectedProduct.value = null;
    alert('Producto eliminado exitosamente');
    window.location.reload();
  } catch (error) {
    console.error('Error:', error);
    alert('Error al eliminar el producto');
  }
};

defineExpose({
  openCreateModal,
  openEditModal,
  openViewModal
});
</script>

<style scoped>
.datatable-input {
  @apply block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500;
}
</style>