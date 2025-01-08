<template>
  <div class="relative overflow-x-auto shadow-md sm:rounded-lg m-4">
    <!-- Barra de búsqueda y ordenamiento -->
    <div class="p-4 bg-white dark:bg-gray-800">
      <div class="flex items-center justify-between">
        <input
          v-model="searchTerm"
          type="text"
          class="p-2 border rounded-lg"
          placeholder="Buscar por nombre..."
        >
        <button
          @click="toggleOrden"
          class="px-4 py-2 bg-gray-200 rounded-lg"
        >
          Ordenar {{ sortOrder === 'asc' ? '↑' : '↓' }}
        </button>
      </div>
    </div>

    <!-- Tabla existente pero usando modelosPaginados -->
    <table id="filter-table" class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
      <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          <th scope="col" class="px-6 py-3">ID</th>
          <th scope="col" class="px-6 py-3">Marca</th>
          <th scope="col" class="px-6 py-3">Nombre</th>
          <th scope="col" class="px-6 py-3">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="modelo in modelos" :key="modelo.id" class="bg-white border-b hover:bg-gray-50">
          <td class="px-6 py-4">{{ modelo.id }}</td>
          <td class="px-6 py-4">{{ obtenerNombreMarca(modelo.marcaId) }}</td>
          <td class="px-6 py-4">{{ modelo.nombre }}</td>
          <td class="px-6 py-4">
            <div class="flex items-center space-x-2">
              <button @click="openEditModal(modelo)" class="font-medium text-yellow-600 dark:text-yellow-500 hover:underline">
                Editar
              </button>
              <button @click="deleteModelo(modelo.id)" class="font-medium text-red-600 dark:text-red-500 hover:underline">
                Eliminar
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="showModal" class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div class="bg-white p-6 rounded-lg shadow-lg w-96">
        <h3 class="text-lg font-semibold mb-4">{{ isEditing ? 'Editar Modelo' : 'Agregar Modelo' }}</h3>
        
        <!-- Mensaje de error -->
        <div v-if="errorMessage" class="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {{ errorMessage }}
        </div>

        <!-- Formulario -->
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
              placeholder="Ingrese el nombre del modelo" 
              class="w-full p-2 border rounded-lg"
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
import { ref, onMounted, computed } from 'vue';
import axios from '@/api/axios';
import { DataTable } from 'simple-datatables';

const modelos = ref([]);
const marcas = ref([]);
const showModal = ref(false);
const isEditing = ref(false);
const errorMessage = ref('');  // Definido correctamente como ref

const form = ref({ 
  id: null, 
  marcaId: '', 
  nombre: '' 
});

const sortOrder = ref('asc');
const searchTerm = ref('');

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

const openAddModal = () => {
  form.value = { id: null, marcaId: '', nombre: '' };
  isEditing.value = false;
  errorMessage.value = '';  // Limpiar mensaje de error
  showModal.value = true;
};

const openEditModal = (modelo) => {
  if (!modelo || !modelo.id) {
    console.error('Modelo inválido:', modelo);
    return;
  }
  form.value = {
    id: modelo.id,
    marcaId: modelo.marcaId,
    nombre: modelo.nombre
  };
  isEditing.value = true;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  form.value = { id: null, marcaId: '', nombre: '' };
  errorMessage.value = '';  // Limpiar mensaje de error
};

const saveModelo = async () => {
  try {
    // Validaciones
    if (!form.value.marcaId || !form.value.nombre) {
      errorMessage.value = 'Por favor complete todos los campos';
      return;
    }

    const datos = {
      nombre: form.value.nombre.trim(),
      marcaId: form.value.marcaId
    };

    console.log('Datos a enviar:', datos); // Debug

    if (isEditing.value) {
      const response = await axios.put(`/modelos/${form.value.id}`, datos);
      console.log('Respuesta edición:', response.data);
    } else {
      const response = await axios.post('/modelos', datos);
      console.log('Respuesta creación:', response.data);
    }
    
    await fetchModelos();
    closeModal();
  } catch (err) {
    console.error('Error al guardar modelo:', err);
    // Mostrar mensaje de error más específico
    const errorMsg = err.response?.data?.error || 
                    err.response?.data?.details || 
                    'Error al guardar el modelo';
    errorMessage.value = Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg;
  }
};

const deleteModelo = async (id) => {
  try {
    if (!confirm('¿Estás seguro de que deseas eliminar este modelo?')) {
      return;
    }
    await axios.delete(`/modelos/${id}`);
    await fetchModelos();
  } catch (error) {
    console.error('Error al eliminar modelo:', error);
    errorMessage.value = 'Error al eliminar el modelo';
  }
};

const obtenerNombreMarca = (marcaId) => {
  const marca = marcas.value.find(m => m.id === marcaId);
  return marca ? marca.nombre : 'N/A';
};

const modelosFiltrados = computed(() => {
  let resultado = [...modelos.value];
  
  // Filtrar por término de búsqueda
  if (searchTerm.value) {
    resultado = resultado.filter(modelo => 
      modelo.nombre.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      obtenerNombreMarca(modelo.marcaId).toLowerCase().includes(searchTerm.value.toLowerCase())
    );
  }
  
  // Ordenar
  resultado.sort((a, b) => {
    const nombreA = a.nombre.toLowerCase();
    const nombreB = b.nombre.toLowerCase();
    return sortOrder.value === 'asc' 
      ? nombreA.localeCompare(nombreB)
      : nombreB.localeCompare(nombreA);
  });
  
  return resultado;
});

const editarModelo = (modelo) => {
  form.value = {
    id: modelo.id,
    marcaId: modelo.marcaId,
    nombre: modelo.nombre
  };
  isEditing.value = true;
  showModal.value = true;
};

const confirmarEliminar = async (id) => {
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

const toggleOrden = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
};

onMounted(async () => {
  await fetchMarcas();
  await fetchModelos();
  
  const dataTable = new DataTable("#filter-table", {
    perPage: 10,
    perPageSelect: [5, 10, 15, 20, 25],
    labels: {
      placeholder: "Buscar modelo...",
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