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
              placeholder="Buscar usuario..."
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
              <th v-for="(column, index) in columns" 
                  :key="index" 
                  scope="col" 
                  class="px-6 py-3 cursor-pointer"
                  @click="sortBy(column.key)"
              >
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
            <tr v-for="usuario in paginatedAndFilteredUsuarios" 
                :key="usuario.id" 
                class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <td class="px-6 py-4">{{ usuario.nombre }}</td>
              <td class="px-6 py-4">{{ usuario.email }}</td>
              <td class="px-6 py-4">{{ usuario.rol }}</td>
              <td class="px-6 py-4">
                <div class="flex items-center space-x-4">
                  <button @click="openViewModal(usuario)" class="text-blue-600 hover:text-blue-900">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  </button>
                  <button @click="openEditModal(usuario)" class="text-yellow-600 hover:text-yellow-900">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                    </svg>
                  </button>
                  <button @click="deleteUsuario(usuario)" class="text-red-600 hover:text-red-900">
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
          <span class="font-semibold text-gray-900 dark:text-white">{{ startIndex + 1 }}-{{ Math.min(endIndex, filteredUsuarios.length) }}</span>
          de
          <span class="font-semibold text-gray-900 dark:text-white">{{ filteredUsuarios.length }}</span>
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

    <!-- Modal para Crear/Editar/Ver usuario -->
    <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen p-4">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
        
        <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          <div class="flex items-start justify-between p-4 border-b">
            <h3 class="text-xl font-semibold">
              {{ modalMode === 'create' ? 'Registrar Usuario' : 
                 modalMode === 'edit' ? 'Editar Usuario' : 'Ver Usuario' }}
            </h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-500">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div class="p-6">
            <form @submit.prevent="handleSubmit">
              <div class="space-y-4">
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
                  <label class="block text-sm font-medium text-gray-700">Email</label>
                  <input 
                    type="email" 
                    v-model="formData.email"
                    :disabled="modalMode === 'view'"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Contraseña</label>
                  <input 
                    type="password" 
                    v-model="formData.password"
                    :disabled="modalMode === 'view'"
                    :required="modalMode === 'create'"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Rol</label>
                  <select
                    v-model="formData.rol"
                    :disabled="modalMode === 'view'"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="administrador">Administrador</option>
                    <option value="empleado">Empleado</option>
                  </select>
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
const usuarios = ref([]);
const searchTerm = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(5);
const sortColumn = ref('nombre');
const sortDirection = ref('asc');
const selectedUsuarioId = ref(null);

const formData = ref({
  nombre: '',
  email: '',
  password: '',
  rol: 'empleado' // Valor por defecto según el modelo
});

// Columnas de la tabla
const columns = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'email', label: 'Email' },
  { key: 'rol', label: 'Rol' }
];

// Computed properties
const filteredUsuarios = computed(() => {
  if (!searchTerm.value) return usuarios.value;
  
  const searchLower = searchTerm.value.toLowerCase();
  return usuarios.value.filter(usuario => 
    usuario.nombre?.toLowerCase().includes(searchLower) ||
    usuario.email?.toLowerCase().includes(searchLower) ||
    usuario.rol?.toLowerCase().includes(searchLower)
  );
});

const sortedUsuarios = computed(() => {
  return [...filteredUsuarios.value].sort((a, b) => {
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

const paginatedAndFilteredUsuarios = computed(() => 
  sortedUsuarios.value.slice(startIndex.value, endIndex.value)
);

const totalPages = computed(() => 
  Math.ceil(filteredUsuarios.value.length / itemsPerPage.value)
);

// Métodos
const loadUsuarios = async () => {
  try {
    const response = await axios.get('/usuarios');
    usuarios.value = response.data;
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
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
    email: '',
    password: '',
    rol: 'user'
  };
  showModal.value = true;
};

const openViewModal = (usuario) => {
  modalMode.value = 'view';
  formData.value = { ...usuario, password: '' };
  showModal.value = true;
};

const openEditModal = (usuario) => {
  modalMode.value = 'edit';
  formData.value = { ...usuario, password: '' }; // No mostramos la contraseña en edición
  selectedUsuarioId.value = usuario.id;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  formData.value = {
    nombre: '',
    email: '',
    password: '',
    rol: 'user'
  };
  selectedUsuarioId.value = null;
};

const handleSubmit = async () => {
  try {
    const userData = {
      nombre: formData.value.nombre,
      email: formData.value.email,
      password: formData.value.password,
      rol: formData.value.rol
    };

    // Validaciones básicas
    if (!userData.nombre || !userData.email) {
      alert('Nombre y email son campos requeridos');
      return;
    }

    // Asegurarse que la contraseña esté presente en modo creación
    if (modalMode.value === 'create' && !userData.password) {
      alert('La contraseña es requerida para crear un nuevo usuario');
      return;
    }

    // Si estamos editando y no se cambió la contraseña, la eliminamos del payload
    if (modalMode.value === 'edit' && !userData.password) {
      delete userData.password;
    }

    if (modalMode.value === 'create') {
      await axios.post('/usuarios', userData);
    } else if (modalMode.value === 'edit') {
      await axios.put(`/usuarios/${selectedUsuarioId.value}`, userData);
    }
    
    await loadUsuarios();
    closeModal();
  } catch (error) {
    console.error('Error al guardar usuario:', error);
    if (error.response) {
      alert(`Error: ${error.response.data.error || 'Error al procesar la solicitud'}`);
    } else {
      alert('Error al conectar con el servidor');
    }
  }
};

const deleteUsuario = async (usuario) => {
  if (confirm('¿Está seguro de eliminar este usuario?')) {
    try {
      await axios.delete(`/usuarios/${usuario.id}`);
      await loadUsuarios();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
    }
  }
};

// Watch para resetear la página cuando cambia la búsqueda
watch(searchTerm, () => {
  currentPage.value = 1;
});

// Watch para resetear la página cuando cambia items por página
watch(itemsPerPage, () => {
  currentPage.value = 1;
});

// Cargar datos al montar el componente
onMounted(() => {
  loadUsuarios();
});

// Exponer método para abrir modal de creación al componente padre
defineExpose({
  openCreateModal
});
</script>

<style scoped>
.datatable-input {
  @apply block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500;
}
</style>