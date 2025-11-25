<template>
  <div class="max-w-full bg-white rounded-lg shadow dark:bg-gray-800 p-4 md:p-6 h-full">
  <!-- Search bar -->
  <div class="mb-4">
    <input
      v-model="searchQuery"
      type="text"
      placeholder="Buscar cliente, vehículo o placa..."
      class="w-full p-3 border rounded-lg shadow-sm"
    />
  </div>

  <!-- Table container -->
  <div class="overflow-x-auto h-[calc(100%-100px)]">
    <table class="w-full table-auto">
      <thead class="sticky top-0 bg-gray-50 dark:bg-gray-700">
        <tr>
          <th class="px-6 py-3 text-left">Cliente</th>
          <th class="px-6 py-3 text-left">Vehículo</th>
          <th class="px-6 py-3 text-left">Placa</th>
          <th class="px-6 py-3 text-left">Última Visita</th>
          <th class="px-6 py-3 text-left min-w-[200px]">Acciones</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
        <tr v-for="cliente in paginatedClientes" 
            :key="cliente.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700">
          <td class="px-6 py-4 whitespace-nowrap">{{ cliente.Cliente?.nombre }}</td>
          <td class="px-6 py-4 whitespace-nowrap">{{ formatVehiculo(cliente.Vehiculo) }}</td>
          <td class="px-6 py-4 whitespace-nowrap">{{ cliente.Vehiculo?.placa }}</td>
          <td class="px-6 py-4 whitespace-nowrap">{{ formatDate(cliente.fecha) }}</td>
          <td class="px-6 py-4">
            <div class="flex gap-2">
              <button 
                @click="verUltimaVisita(cliente)"
                class="px-3 py-1.5 text-sm text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors">
                Ver Última Visita
              </button>
              <button 
                @click="verHistorialVehiculo(cliente)"
                class="px-3 py-1.5 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors">
                Historial Vehículo
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

    <!-- Paginación -->
    <div class="mt-4 flex justify-between items-center">
      <select v-model="itemsPerPage" class="p-2 border rounded">
        <option value="5">5 por página</option>
        <option value="10">10 por página</option>
        <option value="20">20 por página</option>
      </select>
      
      <div class="flex gap-2">
        <button 
          @click="prevPage" 
          :disabled="currentPage === 1"
          class="px-3 py-1 border rounded disabled:opacity-50">
          Anterior
        </button>
        <span class="px-3 py-1">{{ currentPage }} / {{ totalPages }}</span>
        <button 
          @click="nextPage" 
          :disabled="currentPage === totalPages"
          class="px-3 py-1 border rounded disabled:opacity-50">
          Siguiente
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/api/axios';

export default {
  setup() {
          cliente.Cliente?.nombre?.toLowerCase().includes(searchTerm) ||
          cliente.Vehiculo?.placa?.toLowerCase().includes(searchTerm) ||
          `${cliente.Vehiculo?.marcaVehiculo?.nombre} ${cliente.Vehiculo?.modeloVehiculo?.nombre}`
            .toLowerCase()
            .includes(searchTerm)
        );
      });
    });

    const totalPages = computed(() => {
      return Math.ceil(filteredClientes.value.length / itemsPerPage.value);
    });

    const paginatedClientes = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return filteredClientes.value.slice(start, end);
    });

    const formatVehiculo = (vehiculo) => {
      if (!vehiculo) return 'N/A';
      return `${vehiculo.marcaVehiculo?.nombre || ''} ${vehiculo.modeloVehiculo?.nombre || ''}`.trim();
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const verUltimaVisita = (cliente) => {
      router.push({
        path: '/historial',
        query: {
          fecha: cliente.fecha,
          clienteId: cliente.clienteId,
          vehiculoId: cliente.vehiculoId
        }
      });
    };

    const verHistorialVehiculo = (cliente) => {
      router.push({
        path: '/historial',
        query: {
          clienteId: cliente.clienteId,
          vehiculoId: cliente.vehiculoId
        }
      });
    };

    const prevPage = () => {
      if (currentPage.value > 1) currentPage.value--;
    };

    const nextPage = () => {
      if (currentPage.value < totalPages.value) currentPage.value++;
    };

    onMounted(() => {
      obtenerUltimasVisitas();
    });

    return {
      searchQuery,
      currentPage,
      itemsPerPage,
      paginatedClientes,
      totalPages,
      formatVehiculo,
      formatDate,
      verUltimaVisita,
      verHistorialVehiculo,
      prevPage,
      nextPage
    };
  }
};
</script>