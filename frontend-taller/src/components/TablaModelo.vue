<template>
  <div class="relative overflow-x-auto shadow-md sm:rounded-lg m-4">
    <!-- Barra de búsqueda -->
    <div class="p-4 bg-white dark:bg-gray-800">
      <label for="table-search" class="sr-only">Search</label>
      <div class="relative mt-1">
        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path>
          </svg>
        </div>
        <input v-model="searchTerm" type="text" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-80 pl-10 p-2.5" placeholder="Buscar modelos">
      </div>
    </div>

    <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
      <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          <th scope="col" class="px-6 py-3">ID</th>
          <th scope="col" class="px-6 py-3">Marca</th>
          <th scope="col" class="px-6 py-3">Nombre</th>
          <th scope="col" class="px-6 py-3">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="modelo in paginatedModelos" :key="modelo.id" class="bg-white border-b hover:bg-gray-50">
          <td class="px-6 py-4">{{ modelo.id }}</td>
          <td class="px-6 py-4">{{ obtenerNombreMarca(modelo.marcaId) }}</td>
          <td class="px-6 py-4">{{ modelo.nombre }}</td>
          <td class="px-6 py-4">
            <div class="flex items-center space-x-2">
              <button 
                @click="openEditModal(modelo)"
                class="font-medium text-yellow-600 dark:text-yellow-500 hover:underline"
              >
                Editar
              </button>
              <button 
                @click="deleteModelo(modelo.id)"
                class="font-medium text-red-600 dark:text-red-500 hover:underline"
              >
                Eliminar
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Paginación mejorada -->
    <div class="flex items-center justify-between p-4 bg-white">
      <div class="flex items-center space-x-2">
        <button
          v-for="page in pageRange"
          :key="page"
          @click="changePage(page)"
          :class="[
            'px-3 py-1 rounded-lg',
            typeof page === 'number' ? (
              currentPage === page 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            ) : 'bg-gray-100 text-gray-700'
          ]"
          :disabled="typeof page !== 'number'"
        >
          {{ page }}
        </button>
      </div>
      <div class="text-sm text-gray-700">
        Mostrando {{ paginatedModelos.length }} de {{ filteredModelos.length }} elementos
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div class="bg-white p-6 rounded-lg shadow-lg w-96">
        <h3 class="text-lg font-semibold mb-4">{{ isEditing ? 'Editar Modelo' : 'Agregar Modelo' }}</h3>
        
        <div v-if="errorMessage" class="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {{ errorMessage }}
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Marca</label>
            <select 
              v-model="form.marcaId" 
              class="w-full p-2 border rounded-lg"
            >
              <option value="">Seleccione una marca</option>
              <option 
                v-for="marca in marcas" 
                :key="marca.id" 
                :value="marca.id"
              >
                {{ marca.nombre }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del Modelo</label>
            <input 
              v-model="form.nombre" 
              type="text" 
              class="w-full p-2 border rounded-lg"
              placeholder="Ingrese el nombre del modelo"
            >
          </div>

          <div class="flex justify-end space-x-2">
            <button 
              @click="saveModelo" 
              class="px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg"
            >
              {{ isEditing ? 'Actualizar' : 'Guardar' }}
            </button>
            <button 
              @click="closeModal" 
              class="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import axios from '@/api/axios';

const modelos = ref([]);
const marcas = ref([]);
const showModal = ref(false);
const isEditing = ref(false);
const errorMessage = ref('');
const form = ref({ 
  id: null, 
  marcaId: '', 
  nombre: '' 
});

// Paginación y búsqueda
const currentPage = ref(1);
const itemsPerPage = ref(10);
const searchTerm = ref('');
const maxPageButtons = 5; // Número máximo de botones de página a mostrar

const fetchModelos = async () => {
  try {
    const response = await axios.get('/modelos');
    modelos.value = response.data;
  } catch (error) {
    console.error('Error al obtener modelos:', error);
    errorMessage.value = 'Error al cargar los modelos';
  }
};

const fetchMarcas = async () => {
  try {
    const response = await axios.get('/marcas');
    marcas.value = response.data;
  } catch (error) {
    console.error('Error al obtener marcas:', error);
    errorMessage.value = 'Error al cargar las marcas';
  }
};

const obtenerNombreMarca = (marcaId) => {
  const marca = marcas.value.find(m => m.id === marcaId);
  return marca ? marca.nombre : 'N/A';
};

const filteredModelos = computed(() => {
  return modelos.value.filter(modelo => 
    modelo.nombre.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    obtenerNombreMarca(modelo.marcaId).toLowerCase().includes(searchTerm.value.toLowerCase())
  );
});

const paginatedModelos = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredModelos.value.slice(start, end);
});

const totalPages = computed(() => 
  Math.ceil(filteredModelos.value.length / itemsPerPage.value)
);

// Lógica para mostrar rango de páginas
const pageRange = computed(() => {
  const start = Math.max(1, currentPage.value - Math.floor(maxPageButtons / 2));
  const end = Math.min(totalPages.value, start + maxPageButtons - 1);
  
  let pages = [];
  if (start > 1) {
    pages.push(1);
    if (start > 2) pages.push('...');
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  if (end < totalPages.value) {
    if (end < totalPages.value - 1) pages.push('...');
    pages.push(totalPages.value);
  }
  
  return pages;
});

const saveModelo = async () => {
  try {
    if (!form.value.marcaId || !form.value.nombre) {
      errorMessage.value = 'Por favor complete todos los campos';
      return;
    }

    const datos = {
      nombre: form.value.nombre.trim(),
      marcaId: form.value.marcaId
    };

    if (isEditing.value) {
      await axios.put(`/modelos/${form.value.id}`, datos);
    } else {
      await axios.post('/modelos', datos);
    }
    
    await fetchModelos();
    closeModal();
  } catch (error) {
    console.error('Error al guardar modelo:', error);
    errorMessage.value = 'Error al guardar el modelo';
  }
};

const openEditModal = (modelo) => {
  form.value = {
    id: modelo.id,
    marcaId: modelo.marcaId,
    nombre: modelo.nombre
  };
  isEditing.value = true;
  errorMessage.value = '';
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  form.value = { id: null, marcaId: '', nombre: '' };
  errorMessage.value = '';
};

const deleteModelo = async (id) => {
  if (confirm('¿Estás seguro de que deseas eliminar este modelo?')) {
    try {
      await axios.delete(`/modelos/${id}`);
      await fetchModelos();
    } catch (error) {
      console.error('Error al eliminar modelo:', error);
      errorMessage.value = 'Error al eliminar el modelo';
    }
  }
};

const changePage = (page) => {
  if (typeof page === 'number') {
    currentPage.value = page;
  }
};

// Agregar un watcher para searchTerm
watch(searchTerm, () => {
  currentPage.value = 1; // Reset a la primera página cuando se realiza una búsqueda
});

onMounted(async () => {
  await fetchMarcas();
  await fetchModelos();
});

defineExpose({
  openCreateModal: () => {
    form.value = { id: null, marcaId: '', nombre: '' };
    isEditing.value = false;
    errorMessage.value = '';
    showModal.value = true;
  }
});
</script>

<style scoped>
.datatable-input {
  @apply block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500;
}
</style>