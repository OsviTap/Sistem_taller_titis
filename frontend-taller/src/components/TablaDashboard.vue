<template>
  <div class="max-w-full bg-white rounded-lg shadow dark:bg-gray-800 p-4 md:p-6">
    <!-- Búsqueda y filtros -->
    <div class="mb-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Buscar cliente, vehículo o placa..."
        class="w-full p-2 border rounded"
      />
    </div>

    <!-- Tabla con resultados -->
    <div class="overflow-x-auto">
      <table id="search-table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Vehículo</th>
            <th>Placa</th>
            <th>Última Visita</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cliente in paginatedClientes" :key="cliente.id">
            <td>{{ cliente.Cliente?.nombre }}</td>
            <td>{{ formatVehiculo(cliente.Vehiculo) }}</td>
            <td>{{ cliente.Vehiculo?.placa }}</td>
            <td>{{ formatDate(cliente.fecha) }}</td>
            <td class="flex gap-2">
              <button 
                @click="verUltimaVisita(cliente)"
                class="px-2 py-1 text-white bg-green-500 rounded hover:bg-green-600">
                Ver Última Visita
              </button>
              <button 
                @click="verHistorialVehiculo(cliente)"
                class="px-2 py-1 text-white bg-blue-500 rounded hover:bg-blue-600">
                Historial Vehículo
              </button>
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
    const router = useRouter();
    const clientes = ref([]);
    const searchQuery = ref('');
    const currentPage = ref(1);
    const itemsPerPage = ref(10);

    // Obtener últimas visitas por cliente/vehículo
    const obtenerUltimasVisitas = async () => {
      try {
        const response = await axios.get('/historiales');
        // Agrupar por cliente y vehículo para obtener solo últimas visitas
        const visitasAgrupadas = response.data.reduce((acc, visita) => {
          const key = `${visita.clienteId}-${visita.vehiculoId}`;
          if (!acc[key] || new Date(visita.fecha) > new Date(acc[key].fecha)) {
            acc[key] = visita;
          }
          return acc;
        }, {});
        
        clientes.value = Object.values(visitasAgrupadas);
      } catch (error) {
        console.error('Error al obtener visitas:', error);
      }
    };

    const filteredClientes = computed(() => {
      return clientes.value.filter(cliente => {
        const searchTerm = searchQuery.value.toLowerCase();
        return (
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