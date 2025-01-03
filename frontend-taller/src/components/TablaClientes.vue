<template>
  <div>
    <div class="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg">
      <!-- Barra de búsqueda y selector de páginas -->
      <div class="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
        <!-- Búsqueda -->
        <div class="w-full md:w-1/2">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
              </svg>
            </div>
            <input
              type="text"
              v-model="searchTerm"
              class="block p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-full bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Buscar cliente..."
            >
          </div>
        </div>
        <!-- Selector de ítems por página -->
        <div class="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
          <div class="flex items-center space-x-3 w-full md:w-auto">
            <select
              v-model="itemsPerPage"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Tabla -->
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <!-- Grupo: Datos de Usuario -->
              <th colspan="4" class="px-6 py-3 text-center border-b">Datos de Usuario</th>
              <!-- Grupo: Vehículo -->
              <th colspan="3" class="px-6 py-3 text-center border-b">Vehículo</th>
              <th class="px-6 py-3 border-b">Acciones</th>
            </tr>
            <tr>
              <!-- Columnas de Datos de Usuario -->
              <th v-for="column in userColumns" 
                  :key="column.key" 
                  scope="col" 
                  class="px-6 py-3 cursor-pointer"
                  @click="sortBy(column.key)">
                <div class="flex items-center">
                  {{ column.label }}
                  <svg v-if="sortColumn === column.key" class="w-3 h-3 ml-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                    <path :d="sortDirection === 'asc' ? 'M12 5l-8 8h16l-8-8z' : 'M12 19l-8-8h16l-8 8z'"/>
                  </svg>
                </div>
              </th>
              <!-- Columnas de Vehículo -->
              <th v-for="column in vehicleColumns" 
                  :key="column.key" 
                  scope="col" 
                  class="px-6 py-3 cursor-pointer"
                  @click="sortBy(column.key)">
                <div class="flex items-center">
                  {{ column.label }}
                  <svg v-if="sortColumn === column.key" class="w-3 h-3 ml-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                    <path :d="sortDirection === 'asc' ? 'M12 5l-8 8h16l-8-8z' : 'M12 19l-8-8h16l-8 8z'"/>
                  </svg>
                </div>
              </th>
              <th scope="col" class="px-6 py-3">
                <span class="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cliente in paginatedAndFilteredClientes" 
                :key="cliente.id" 
                class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <!-- Datos de Usuario -->
              <td class="px-6 py-4">{{ cliente.nombre }}</td>
              <td class="px-6 py-4">{{ cliente.direccion }}</td>
              <td class="px-6 py-4">{{ cliente.telefono }}</td>
              <td class="px-6 py-4">{{ cliente.nit }}</td>
              <!-- Datos de Vehículo -->
              <td class="px-6 py-4 relative">
                  {{ cliente.Vehiculos?.[0]?.marcaVehiculo?.nombre || '-' }}
                  <!-- Badge para múltiples vehículos -->
                  <span v-if="cliente.Vehiculos?.length > 1"
                        class="absolute top-2 right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full"
                  >
                      +{{ cliente.Vehiculos.length - 1 }}
                  </span>
              </td>
              <td class="px-6 py-4">
                  {{ cliente.Vehiculos?.[0]?.modeloVehiculo?.nombre || '-' }}
              </td>
              <td class="px-6 py-4">
                  {{ cliente.Vehiculos?.[0]?.placa || '-' }}
              </td>
              
              <!-- Acciones -->
              <td class="px-6 py-4">
                <div class="flex items-center space-x-4">
                  <button @click="openViewModal(cliente)" class="text-blue-600 hover:text-blue-900">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  </button>
                  <button @click="openEditModal(cliente)" class="text-yellow-600 hover:text-yellow-900">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                    </svg>
                  </button>
                  <button @click="deleteCliente(cliente)" class="text-red-600 hover:text-red-900">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <nav class="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0 p-4">
        <span class="text-sm font-normal text-gray-500 dark:text-gray-400">
          Mostrando 
          <span class="font-semibold text-gray-900 dark:text-white">{{ startIndex + 1 }}-{{ Math.min(endIndex, filteredClientes.length) }}</span>
          de
          <span class="font-semibold text-gray-900 dark:text-white">{{ filteredClientes.length }}</span>
        </span>
        <ul class="inline-flex items-stretch -space-x-px">
          <li>
            <button
              @click="previousPage"
              :disabled="currentPage === 1"
              class="flex items-center justify-center h-full py-1.5 px-3 ml-0 text-gray-500 bg-white rounded-l-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
            >
              <span class="sr-only">Anterior</span>
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
            </button>
          </li>
          <li v-for="page in totalPages" :key="page">
            <button
              @click="goToPage(page)"
              class="flex items-center justify-center text-sm py-2 px-3 leading-tight"
              :class="{
                'text-blue-600 bg-blue-50 border border-blue-300 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white': page === currentPage,
                'text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white': page !== currentPage
              }"
            >
              {{ page }}
            </button>
          </li>
          <li>
            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="flex items-center justify-center h-full py-1.5 px-3 leading-tight text-gray-500 bg-white rounded-r-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              :class="{ 'opacity-50 cursor-not-allowed': currentPage === totalPages }"
            >
              <span class="sr-only">Siguiente</span>
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
              </svg>
            </button>
          </li>
        </ul>
      </nav>
    </div>

    <!-- Modal para Crear/Editar/Ver cliente -->
    <!-- Modal para Crear/Editar/Ver cliente -->
    <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen p-4">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
        
        <div class="relative bg-white rounded-lg shadow-xl max-w-4xl w-full">
          <div class="flex items-start justify-between p-4 border-b">
            <h3 class="text-xl font-semibold">
              {{ modalMode === 'create' ? 'Registrar Cliente' : 
                 modalMode === 'edit' ? 'Editar Cliente' : 'Ver Cliente' }}
            </h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-500">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div class="p-6">
            <form @submit.prevent="handleSubmit">
              <!-- Sección de datos del cliente -->
              <div class="mb-6">
                <h4 class="text-lg font-medium mb-4">Datos del Cliente</h4>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Nombre</label>
                    <input 
                      type="text" 
                      v-model="formData.nombre"
                      :disabled="modalMode === 'view'"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700">Dirección</label>
                    <input 
                      type="text" 
                      v-model="formData.direccion"
                      :disabled="modalMode === 'view'"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700">Teléfono</label>
                    <input 
                      type="text" 
                      v-model="formData.telefono"
                      :disabled="modalMode === 'view'"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700">NIT</label>
                    <input 
                      type="text" 
                      v-model="formData.nit"
                      :disabled="modalMode === 'view'"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                  </div>
                </div>
              </div>

              <!-- Sección de vehículos -->
              <div class="mb-6">
                <div class="flex justify-between items-center mb-4">
                  <h4 class="text-lg font-medium">Vehículos</h4>
                  <button 
                    v-if="modalMode !== 'view'"
                    type="button"
                    @click="addVehicle"
                    class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                    </svg>
                    Agregar Vehículo
                  </button>
                </div>

                <div v-for="(vehiculo, index) in formData.vehiculos" :key="index" class="mb-4 p-4 border rounded-md relative">
                  <div class="grid grid-cols-3 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Marca</label>
                      <select
                        v-model="vehiculo.marcaId"
                        @change="loadModelosByMarca(vehiculo.marcaId, index)"
                        :disabled="modalMode === 'view'"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="">Seleccionar Marca</option>
                        <option v-for="marca in marcas" :key="marca.id" :value="marca.id">
                          {{ marca.nombre }}
                        </option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700">Modelo</label>
                      <select
                        v-model="vehiculo.modeloId"
                        :disabled="modalMode === 'view' || !vehiculo.marcaId"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="">Seleccionar Modelo</option>
                        <option v-for="modelo in modelosPorMarca[index]" :key="modelo.id" :value="modelo.id">
                          {{ modelo.nombre }}
                        </option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700">Placa</label>
                      <input
                        type="text"
                        v-model="vehiculo.placa"
                        :disabled="modalMode === 'view'"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                    </div>
                  </div>

                  <button 
                    v-if="modalMode !== 'view' && formData.vehiculos.length > 1"
                    type="button"
                    @click="removeVehicle(index)"
                    class="absolute top-2 right-2 text-red-600 hover:text-red-700"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div class="mt-6 flex justify-end space-x-3">
                <button 
                  type="button"
                  @click="closeModal"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button
                  v-if="modalMode !== 'view'"
                  type="submit"
                  class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {{ modalMode === 'create' ? 'Crear' : 'Guardar' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import axios from '@/api/axios';

// Estados
const showModal = ref(false);
const modalMode = ref('create');
const clientes = ref([]);
const searchTerm = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(5);
const sortColumn = ref('nombre');
const sortDirection = ref('asc');
const selectedClienteId = ref(null);

const marcas = ref([]);
const modelosPorMarca = ref([]);

const formData = ref({
  nombre: '',
  direccion: '',
  telefono: '',
  nit: '',
  vehiculos: [{
    marcaId: '',
    modeloId: '',
    placa: ''
  }]
});

// Columnas de la tabla
const userColumns = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'direccion', label: 'Dirección' },
  { key: 'telefono', label: 'Teléfono' },
  { key: 'nit', label: 'NIT' }
];

const vehicleColumns = [
  { key: 'marca', label: 'Marca' },
  { key: 'modelo', label: 'Modelo' },
  { key: 'placa', label: 'Placa' }
];

// Nuevas funciones para manejar vehículos
const loadMarcas = async () => {
  try {
    const response = await axios.get('/marcas');
    marcas.value = response.data;
  } catch (error) {
    console.error('Error al cargar marcas:', error);
  }
};

const loadModelosByMarca = async (marcaId, index) => {
    if (!marcaId) {
        modelosPorMarca.value[index] = [];
        formData.value.vehiculos[index].modeloId = '';
        return;
    }
    try {
        const response = await axios.get(`/modelos/marca/${marcaId}`);
        modelosPorMarca.value[index] = response.data;
        
        // No resetear el modeloId si ya existe y es válido
        const modeloActual = formData.value.vehiculos[index].modeloId;
        if (modeloActual) {
            const modeloExiste = response.data.some(m => m.id === modeloActual);
            if (!modeloExiste) {
                formData.value.vehiculos[index].modeloId = '';
            }
        }
    } catch (error) {
        console.error('Error al cargar modelos:', error);
        modelosPorMarca.value[index] = [];
    }
};

const addVehicle = () => {
  formData.value.vehiculos.push({
    marcaId: '',
    modeloId: '',
    placa: ''
  });
  modelosPorMarca.value.push([]);
};

const removeVehicle = (index) => {
  formData.value.vehiculos.splice(index, 1);
  modelosPorMarca.value.splice(index, 1);
};

// Computed properties
const filteredClientes = computed(() => {
  if (!searchTerm.value) return clientes.value;
  
  const searchLower = searchTerm.value.toLowerCase();
  return clientes.value.filter(cliente => 
    cliente.nombre?.toLowerCase().includes(searchLower) ||
    cliente.direccion?.toLowerCase().includes(searchLower) ||
    cliente.telefono?.toString().includes(searchLower) ||
    cliente.nit?.toString().includes(searchLower)
  );
});

const sortedClientes = computed(() => {
  return [...filteredClientes.value].sort((a, b) => {
    const aValue = a[sortColumn.value];
    const bValue = b[sortColumn.value];
    
    if (sortDirection.value === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
});

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value);
const endIndex = computed(() => startIndex.value + itemsPerPage.value);

const paginatedAndFilteredClientes = computed(() => 
  sortedClientes.value.slice(startIndex.value, endIndex.value)
);

const totalPages = computed(() => 
  Math.ceil(filteredClientes.value.length / itemsPerPage.value)
);

// Métodos
const loadClientes = async () => {
    try {
        const response = await axios.get('/clientes');
        clientes.value = response.data
            .filter(cliente => cliente.estado === 1) // Solo mostrar clientes activos
            .map(cliente => ({
                ...cliente,
                vehiculos: cliente.Vehiculos?.map(v => ({
                    ...v,
                    marca: v.marcaVehiculo?.nombre || '',
                    modelo: v.modeloVehiculo?.nombre || '',
                    marcaId: v.marcaId,
                    modeloId: v.modeloId,
                    placa: v.placa || ''
                })) || []
            }));
    } catch (error) {
        console.error('Error al cargar clientes:', error);
    }
};
const sortBy = (column) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn.value = column;
    sortDirection.value = 'asc';
  }
};

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const goToPage = (page) => {
  currentPage.value = page;
};

// Métodos del modal
const openCreateModal = () => {
  modalMode.value = 'create';
  formData.value = {
    nombre: '',
    direccion: '',
    telefono: '',
    nit: '',
    vehiculos: [{
      marcaId: '',
      modeloId: '',
      placa: ''
    }]
  };
  modelosPorMarca.value = [[]];
  showModal.value = true;
};

const openViewModal = async (cliente) => {
    modalMode.value = 'view';
    selectedClienteId.value = cliente.id;

    const vehiculos = cliente.Vehiculos?.map(v => ({
        marcaId: v.marcaId,
        modeloId: v.modeloId,
        placa: v.placa
    })) || [{
        marcaId: '',
        modeloId: '',
        placa: ''
    }];

    formData.value = {
        ...cliente,
        vehiculos
    };

    modelosPorMarca.value = new Array(vehiculos.length).fill([]);

    // Cargar los modelos para cada vehículo que tenga marca
    for (let i = 0; i < vehiculos.length; i++) {
        if (vehiculos[i].marcaId) {
            await loadModelosByMarca(vehiculos[i].marcaId, i);
        }
    }

    showModal.value = true;
};

const openEditModal = async (cliente) => {
    modalMode.value = 'edit';
    selectedClienteId.value = cliente.id;

    // Preparar los datos del vehículo
    const vehiculos = cliente.Vehiculos?.map(v => ({
        marcaId: v.marcaId,
        modeloId: v.modeloId,
        placa: v.placa
    })) || [{
        marcaId: '',
        modeloId: '',
        placa: ''
    }];

    formData.value = {
        ...cliente,
        vehiculos
    };

    // Inicializar modelosPorMarca para cada vehículo
    modelosPorMarca.value = new Array(vehiculos.length).fill([]);

    // Cargar los modelos para cada vehículo que tenga marca
    for (let i = 0; i < vehiculos.length; i++) {
        if (vehiculos[i].marcaId) {
            await loadModelosByMarca(vehiculos[i].marcaId, i);
        }
    }

    showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  formData.value = {
    nombre: '',
    direccion: '',
    telefono: '',
    nit: '',
    vehiculos: [{
      marcaId: '',
      modeloId: '',
      placa: ''
    }]
  };
  modelosPorMarca.value = [[]];
  selectedClienteId.value = null;
};

const handleSubmit = async () => {
    try {
        // Validar que los campos requeridos estén llenos
        if (!formData.value.nombre || !formData.value.telefono) {
            alert('Por favor complete los campos requeridos');
            return;
        }

        // Validar que los vehículos tengan los datos necesarios
        const vehiculosValidos = formData.value.vehiculos.every(v => 
            v.marcaId && v.modeloId && v.placa
        );

        if (!vehiculosValidos) {
            alert('Por favor complete todos los datos del vehículo');
            return;
        }

        const clienteData = {
            nombre: formData.value.nombre,
            direccion: formData.value.direccion,
            telefono: formData.value.telefono,
            nit: formData.value.nit,
            Vehiculos: formData.value.vehiculos.map(v => ({
                marcaId: parseInt(v.marcaId),    // Asegurarse de que sean números
                modeloId: parseInt(v.modeloId),  // Asegurarse de que sean números
                placa: v.placa
            }))
        };

        console.log('Datos a enviar:', clienteData); // Para debug

        let response;
        if (modalMode.value === 'create') {
            response = await axios.post('/clientes', clienteData);
        } else if (modalMode.value === 'edit') {
            response = await axios.put(`/clientes/${selectedClienteId.value}`, clienteData);
        }

        console.log('Respuesta del servidor:', response.data); // Para debug
        
        await loadClientes();
        closeModal();
    } catch (error) {
        console.error('Error completo:', error);
        console.error('Detalles del error:', error.response?.data);
        alert(`Error al guardar los datos: ${error.response?.data?.details || error.message}`);
    }
};

const deleteCliente = async (cliente) => {
    try {
        if (!confirm('¿Está seguro de eliminar este cliente?')) {
            return;
        }

        console.log('Eliminando cliente:', cliente.id); // Para debug

        const response = await axios.delete(`/clientes/${cliente.id}`);
        
        if (response.status === 200) {
            // Actualizar la lista de clientes
            await loadClientes();
            alert('Cliente eliminado correctamente');
        }
    } catch (error) {
        console.error('Error al eliminar cliente:', error);
        alert('Error al eliminar el cliente');
    }
};

// Watch para resetear la página cuando cambia la búsqueda
watch(searchTerm, () => {
  currentPage.value = 1;
});
// Agregar este watch para vigilar cambios en las marcas de los vehículos
watch(
    () => formData.value.vehiculos,
    (newVehiculos) => {
        newVehiculos.forEach((vehiculo, index) => {
            if (vehiculo.marcaId) {
                loadModelosByMarca(vehiculo.marcaId, index);
            }
        });
    },
    { deep: true }
);
// Watch para resetear la página cuando cambia items por página
watch(itemsPerPage, () => {
  currentPage.value = 1;
});

// Cargar datos al montar el componente
onMounted(() => {
  loadClientes();
  loadMarcas();
});

// Exponer método para abrir modal de creación al componente padre
defineExpose({
  openCreateModal
});
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
