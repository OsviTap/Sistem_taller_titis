<template>
  <div class="relative overflow-x-auto shadow-md sm:rounded-lg m-4">
    
    <!-- Tabla -->
    <table id="filter-table" class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
      <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          
          <th scope="col" class="px-6 py-3">Nombre</th>
          <th scope="col" class="px-6 py-3">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="marca in marcas" :key="marca.id" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
          
          <td class="px-6 py-4">{{ marca.nombre }}</td>
          <td class="px-6 py-4">
            <div class="flex items-center space-x-2">
              <button 
                @click="openEditModal(marca)" 
                class="font-medium text-yellow-600 dark:text-yellow-500 hover:underline"
              >
                Editar
              </button>
              <button 
                @click="deleteMarca(marca.id)" 
                class="font-medium text-red-600 dark:text-red-500 hover:underline"
              >
                Eliminar
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
      <!-- Modal para agregar/editar marca -->
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div class="bg-white p-6 rounded-lg shadow-lg w-96">
        <h3 class="text-lg font-semibold mb-4">{{ isEditing ? 'Editar Marca' : 'Agregar Marca' }}</h3>
        
        <!-- Agregar mensaje de error -->
        <div v-if="errorMessage" class="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {{ errorMessage }}
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Nombre de la Marca</label>
          <input 
            v-model="form.nombre" 
            type="text" 
            placeholder="Ingrese el nombre de la marca" 
            class="w-full p-2 border rounded-lg"
          >
        </div>

        <div class="flex justify-end space-x-2">
          <button 
            @click="saveMarca" 
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
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from '@/api/axios';
import { DataTable } from 'simple-datatables';

const marcas = ref([]);
const showModal = ref(false);
const isEditing = ref(false);
const errorMessage = ref('');
const form = ref({ 
  id: null, 
  nombre: '' 
});

//Funcion para obtener las marcas
const fetchMarcas = async () => {
  const response = await axios.get('/marcas');
  marcas.value = response.data;
};

const openAddModal = () => {
  form.value = { id: null, nombre: '' };
  isEditing.value = false;
  showModal.value = true;
};

const openEditModal = (marca) => {
  if (!marca || !marca.id) {
    console.error('Marca inválida:', marca);
    return;
  }
  form.value = {
    id: marca.id,
    nombre: marca.nombre
  };
  isEditing.value = true;
  errorMessage.value = '';
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  form.value = { id: null, nombre: '' };
  errorMessage.value = '';
};

const saveMarca = async () => {
  try {
    // Validaciones
    if (!form.value.nombre) {
      errorMessage.value = 'Por favor complete todos los campos';
      return;
    }

    const datos = {
      nombre: form.value.nombre.trim()
    };

    console.log('Datos a enviar:', datos); // Debug

    if (isEditing.value) {
      const response = await axios.put(`/marcas/${form.value.id}`, datos);
      console.log('Respuesta edición:', response.data);
    } else {
      const response = await axios.post('/marcas', datos);
      console.log('Respuesta creación:', response.data);
    }
    
    await fetchMarcas();
    closeModal();
  } catch (err) {
    console.error('Error al guardar marca:', err);
    // Mostrar mensaje de error más específico
    const errorMsg = err.response?.data?.error || 
                    err.response?.data?.details || 
                    'Error al guardar la marca';
    errorMessage.value = Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg;
  }
};

const deleteMarca = async (id) => {
  if (confirm('¿Estás seguro de que deseas eliminar esta marca?')) {
    try {
      await axios.delete(`/marcas/${id}`);
      await fetchMarcas();
    } catch (error) {
      console.error('Error al eliminar marca:', error);
      errorMessage.value = 'Error al eliminar la marca';
    }
  }
};
onMounted(async () => {
  await fetchMarcas();
  
  const dataTable = new DataTable("#filter-table", {
    perPage: 10,
    perPageSelect: [5, 10, 15, 20, 25],
    labels: {
      placeholder: "Buscar marca...",
      perPage: "Registros por página",
      noRows: "No hay registros para mostrar",
      info: "Mostrando {start} a {end} de {rows} registros",
    },
  });
});
defineExpose({
  openCreateModal: openAddModal,
});
</script>

<style scoped>
.datatable-input {
  @apply block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500;
}
</style>