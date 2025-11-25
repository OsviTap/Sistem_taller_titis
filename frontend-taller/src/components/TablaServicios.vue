<template>
    <div class="relative overflow-x-auto shadow-md sm:rounded-lg m-4">
    
    <!-- Barra de Búsqueda -->
    <div class="pb-4 bg-white dark:bg-gray-800 px-4 pt-4">
      <label for="table-search" class="sr-only">Buscar</label>
      <div class="relative">
        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path>
          </svg>
        </div>
        <input 
          v-model="searchQuery" 
          type="text" 
          id="table-search" 
          class="block w-full pl-10 pr-3 py-2.5 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
          placeholder="Buscar por nombre o descripción..."
        >
      </div>
    </div>

    <!-- Estado de carga -->
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
      <p class="mt-2 text-gray-600 dark:text-gray-400">Cargando servicios...</p>
    </div>
    
    <!-- Tabla -->
    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" class="px-6 py-3">Nombre</th>
            <th scope="col" class="px-6 py-3">Precio</th>
            <th scope="col" class="px-6 py-3">Descripción</th>
            <th scope="col" class="px-6 py-3 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="servicios.length === 0">
            <td colspan="4" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
              <svg class="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <p>No se encontraron servicios</p>
            </td>
          </tr>
          <tr v-else v-for="servicio in servicios" :key="servicio.id" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
            <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">{{ servicio.nombre }}</td>
            <td class="px-6 py-4">
              <span class="font-semibold text-green-600 dark:text-green-400">Bs {{ parseFloat(servicio.precio).toFixed(2) }}</span>
            </td>
            <td class="px-6 py-4 max-w-xs truncate" :title="servicio.descripcion">
              {{ servicio.descripcion || 'Sin descripción' }}
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center justify-center gap-2">
                <button 
                  @click="openEditModal(servicio)" 
                  class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 focus:ring-4 focus:ring-yellow-300 dark:focus:ring-yellow-800 transition-colors">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                  Editar
                </button>
                <button 
                  @click="deleteServicio(servicio.id)" 
                  class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:ring-red-300 dark:focus:ring-red-800 transition-colors">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                  Eliminar
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    <div v-if="totalPages > 1" class="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
      <div class="flex-1 flex justify-between sm:hidden">
        <button 
          @click="cambiarPagina(currentPage - 1)"
          :disabled="currentPage === 1"
          class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
          Anterior
        </button>
        <button 
          @click="cambiarPagina(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
          Siguiente
        </button>
      </div>
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-gray-700 dark:text-gray-300">
            Mostrando <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> a <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, totalItems) }}</span> de <span class="font-medium">{{ totalItems }}</span> servicios
          </p>
        </div>
        <div>
          <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button 
              @click="cambiarPagina(currentPage - 1)"
              :disabled="currentPage === 1"
              class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">
              <span class="sr-only">Anterior</span>
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
            </button>
            
            <button 
              v-for="page in pageNumbers" 
              :key="page"
              @click="typeof page === 'number' ? cambiarPagina(page) : null"
              :disabled="page === '...'"
              :class="[
                page === currentPage 
                  ? 'z-10 bg-blue-600 border-blue-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600',
                'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                page === '...' ? 'cursor-default' : ''
              ]">
              {{ page }}
            </button>

            <button 
              @click="cambiarPagina(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">
              <span class="sr-only">Siguiente</span>
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
      <!-- Modal para agregar/editar servicio -->
      <Teleport to="body">
        <div v-if="showModal" class="fixed inset-0 flex items-center justify-center z-50 p-4" @click="closeModal">
          <div class="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity"></div>
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md relative z-10 transform transition-all" @click.stop>
            <!-- Header -->
            <div class="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 rounded-t-xl">
              <div class="flex items-center justify-between">
                <h3 class="text-xl font-bold text-white flex items-center">
                  <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                  {{ isEditing ? 'Editar Servicio' : 'Nuevo Servicio' }}
                </h3>
                <button @click="closeModal" class="text-white hover:text-gray-200 transition-colors">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Body -->
            <div class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre del Servicio <span class="text-red-500">*</span>
                </label>
                <input 
                  v-model="form.nombre" 
                  type="text" 
                  placeholder="Ej: Cambio de aceite" 
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  required
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Precio (Bs) <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <span class="absolute left-3 top-2.5 text-gray-500 dark:text-gray-400">Bs</span>
                  <input 
                    v-model="form.precio" 
                    type="number" 
                    step="0.01"
                    placeholder="0.00" 
                    class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    required
                  >
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea 
                  v-model="form.descripcion" 
                  placeholder="Descripción detallada del servicio..."
                  rows="4"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 resize-none"
                ></textarea>
              </div>
            </div>

            <!-- Footer -->
            <div class="bg-gray-50 dark:bg-gray-700 px-6 py-4 rounded-b-xl flex justify-end gap-3">
              <button 
                @click="closeModal" 
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500 transition-colors">
                Cancelar
              </button>
              <button 
                @click="saveServicio" 
                :disabled="!form.nombre || !form.precio"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                {{ isEditing ? 'Actualizar' : 'Guardar' }}
              </button>
            </div>
          </div>
        </div>
      </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import axios from '@/api/axios';

const servicios = ref([]);
const showModal = ref(false);
const isEditing = ref(false);
const form = ref({ id: null, nombre: '', precio: null, descripcion: '' });
const loading = ref(false);

// Paginación
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalItems = ref(0);
const totalPages = ref(0);

// Búsqueda
const searchQuery = ref('');
let searchTimeout = null;

// Paginación inteligente
const pageNumbers = computed(() => {
  const pages = [];
  const maxVisible = 7;
  
  if (totalPages.value <= maxVisible) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    if (currentPage.value <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push('...');
      pages.push(totalPages.value);
    } else if (currentPage.value >= totalPages.value - 3) {
      pages.push(1);
      pages.push('...');
      for (let i = totalPages.value - 4; i <= totalPages.value; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push('...');
      for (let i = currentPage.value - 1; i <= currentPage.value + 1; i++) pages.push(i);
      pages.push('...');
      pages.push(totalPages.value);
    }
  }
  
  return pages;
});

const fetchServicios = async () => {
  loading.value = true;
  try {
    const response = await axios.get('/servicios', {
      params: {
        page: currentPage.value,
        limit: itemsPerPage.value,
        search: searchQuery.value
      }
    });
    
    servicios.value = response.data.data || [];
    totalItems.value = response.data.totalItems || 0;
    totalPages.value = response.data.totalPages || 0;
  } catch (error) {
    console.error('Error al cargar servicios:', error);
    servicios.value = [];
  } finally {
    loading.value = false;
  }
};

const cambiarPagina = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    fetchServicios();
  }
};

// Watch para búsqueda con debounce
watch(searchQuery, () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    fetchServicios();
  }, 500);
});

const openAddModal = () => {
  form.value = { id: null, nombre: '', precio: '', descripcion: '' };
  isEditing.value = false;
  showModal.value = true;
};

const openEditModal = (servicio) => {
  form.value = { ...servicio };
  isEditing.value = true;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  form.value = { id: null, nombre: '', precio: '', descripcion: '' };
};

const saveServicio = async () => {
  if (!form.value.nombre || !form.value.precio) {
    return;
  }

  try {
    if (isEditing.value) {
      await axios.put(`/servicios/${form.value.id}`, form.value);
    } else {
      await axios.post('/servicios', form.value);
    }
    await fetchServicios();
    closeModal();
    
    // Mostrar notificación de éxito si SweetAlert2 está disponible
    if (window.Swal) {
      window.Swal.fire({
        icon: 'success',
        title: isEditing.value ? 'Servicio actualizado' : 'Servicio creado',
        text: `El servicio ha sido ${isEditing.value ? 'actualizado' : 'creado'} exitosamente.`,
        timer: 2000,
        showConfirmButton: false
      });
    }
  } catch (error) {
    console.error('Error al guardar servicio:', error);
    if (window.Swal) {
      window.Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar el servicio. Intente nuevamente.'
      });
    }
  }
};

const deleteServicio = async (id) => {
  // Usar SweetAlert2 si está disponible, sino usar confirm nativo
  const confirmar = window.Swal ? await window.Swal.fire({
    title: '¿Estás seguro?',
    text: "Esta acción no se puede deshacer",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }) : { isConfirmed: confirm('¿Estás seguro de que deseas eliminar este servicio?') };

  if (confirmar.isConfirmed) {
    try {
      await axios.delete(`/servicios/${id}`);
      await fetchServicios();
      
      if (window.Swal) {
        window.Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'El servicio ha sido eliminado exitosamente.',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Error al eliminar servicio:', error);
      if (window.Swal) {
        window.Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar el servicio. Puede estar en uso.'
        });
      }
    }
  }
};

onMounted(() => {
  fetchServicios();
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