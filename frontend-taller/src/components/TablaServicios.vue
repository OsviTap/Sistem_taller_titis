<template>
    <div class="relative overflow-x-auto shadow-md sm:rounded-lg m-4">
    
    <!-- Tabla -->
    <table id="filter-table" class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
      <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          
          <th scope="col" class="px-6 py-3">Nombre</th>
          <th scope="col" class="px-6 py-3">Precio</th>
          <th scope="col" class="px-6 py-3">Descripcion</th>
          <th scope="col" class="px-6 py-3">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="servicio in servicios" :key="servicio.id" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
          
          <td class="px-6 py-4">{{ servicio.nombre }}</td>
          <td class="px-6 py-4">{{ servicio.precio }} Bs.</td>
          <td class="px-6 py-4">{{ servicio.descripcion }}</td>
          <td class="px-6 py-4">
            <div class="flex items-center space-x-2">
              <button @click="openEditModal(servicio)" class="font-medium text-yellow-600 dark:text-yellow-500 hover:underline">
                Editar
              </button>
              <button @click="deleteServicio(servicioid)" class="font-medium text-red-600 dark:text-red-500 hover:underline">
                Eliminar
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
      <!-- Modal para agregar/editar marca -->
      <div v-if="showModal" class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
        <div class="bg-white p-6 rounded-lg shadow-lg w-96">
          <h3 class="text-lg font-semibold mb-4">{{ isEditing ? 'Editar Servicio' : 'Agregar Servicio' }}</h3>
          <input v-model="form.nombre" type="text" placeholder="Nombre" class="w-full mb-4 p-2 border rounded-lg">
            <input v-model="form.precio" type="number" placeholder="Precio" class="w-full mb-4 p-2 border rounded-lg">
            <input v-model="form.descripcion" type="text"  placeholder="Descripcion" class="block w-full p-7 text-gray-900 border rounded-lg bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
          <div class="flex justify-end space-x-2 mb-3 p-4">
            <button @click="saveServicio" class="px-4 py-2 text-white bg-blue-500 hover:bg-blue-700 rounded-lg">
              Guardar
            </button>
            <button @click="closeModal" class="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg">
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

const servicios = ref([]);
const showModal = ref(false);
const isEditing = ref(false);
const form = ref({ id: null, nombre: '', precio: null, descripcion: '' });


const fetchServicios = async () => {
  const response = await axios.get('/servicios');
  servicios.value = response.data;
};

const openAddModal = () => {
  form.value = { id: null, nombre: '' };
  form.value = { id: null, precio: '' };
  form.value = { id: null, descripcion: '' };
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
};

const saveServicio = async () => {
  if (isEditing.value) {
    await axios.put(`/servicios/${form.value.id}`, form.value);
  } else {
    await axios.post('/servicios', form.value);
    window.location.reload();
  }
  closeModal();
  fetchServicios();
};

const deleteMarca = async (id) => {
  if (confirm('¿Estás seguro de que deseas eliminar este servicio?')) {
    await axios.delete(`/servicios/${id}`);
    fetchServicios();
  }
};

onMounted(async () => {
  await fetchServicios();

  if (document.getElementById("filter-table")) {
    const dataTable = new DataTable("#filter-table", {
      labels: {
        perPage: "Servicios por página",
        placeholder: "Buscar servicio...",
      },
    });
  }
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