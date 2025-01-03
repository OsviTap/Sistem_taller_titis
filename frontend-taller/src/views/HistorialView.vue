<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white">Historial de Visitas</h1>
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Buscador</label>
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Buscar por cliente, vehículo, placa..."
        class="w-full p-2  text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
      />
    </div>
      <!-- Filtros -->
      <div class="flex gap-4">
        <div class="w-64">
          <label for="clienteFilter" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cliente</label>
          <select v-model.number="clienteFilter" id="clienteFilter" class="input-select">
            <option value="">Todos los clientes</option>
            <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.id">
              {{ cliente.nombre }}
            </option>
          </select>
        </div>
        <div class="flex gap-4">
          <div class="w-40">
            <label for="fechaInicio" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha Inicio</label>
            <input 
              type="date" 
              id="fechaInicio" 
              v-model="fechaInicio" 
              class="input-text"
              :max="fechaFin || undefined"
            />
          </div>
          <div class="w-40">
            <label for="fechaFin" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha Fin</label>
            <input 
              type="date" 
              id="fechaFin" 
              v-model="fechaFin" 
              class="input-text"
              :min="fechaInicio || undefined"
            />
          </div>
          <div class="self-end">
            <button 
              @click="limpiarFechas" 
              class="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              title="Limpiar fechas"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla de Historial -->
    <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table id="historialTable" class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" class="px-6 py-3">Fecha</th>
            <th scope="col" class="px-6 py-3">Cliente</th>
            <th scope="col" class="px-6 py-3">Vehículo</th>
            <th scope="col" class="px-6 py-3">Kilometraje</th>
            <th scope="col" class="px-6 py-3">Próximo Cambio</th>
            <th scope="col" class="px-6 py-3">Total</th>
            <th scope="col" class="px-6 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="visitasFiltradas.length === 0">
            <td colspan="7" class="text-center px-6 py-4">No hay registros disponibles.</td>
          </tr>
          <tr v-for="visita in visitasFiltradasBusqueda" :key="visita.id" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
            <td class="px-6 py-4">{{ formatDate(visita.fecha) }}</td>
            <td class="px-6 py-4">{{ visita.Cliente ? visita.Cliente.nombre : 'Sin Cliente' }}</td>
            <td class="px-6 py-4">{{ visita.Vehiculo ? visita.Vehiculo.placa : 'Sin Vehículo' }}</td>
            <td class="px-6 py-4">{{ visita.kilometraje }} km</td>
            <td class="px-6 py-4">{{ visita.proximoCambio }} km</td>
            <td class="px-6 py-4">Bs {{ visita.total }}</td>
            <td class="px-6 py-4">
              <button @click="generarPDF(visita)" class="btn-primary">Ver</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { DataTable } from 'simple-datatables';
import axios from '@/api/axios';
import jsPDF from 'jspdf';

const clientes = ref([]);
const visitas = ref([]);
const clienteFilter = ref('');
const fechaInicio = ref('');
const fechaFin = ref('');
const route = useRoute();
const searchQuery = ref('');

const obtenerClientes = async () => {
  try {
    const response = await axios.get('/clientes');
    clientes.value = response.data;
  } catch (error) {
    console.error('Error al cargar clientes:', error);
  }
};

// Agregar nuevo computed para búsqueda
const visitasFiltradasBusqueda = computed(() => {
  return visitasFiltradas.value.filter(visita => {
    const busqueda = searchQuery.value.toLowerCase();
    return (
      visita.Cliente?.nombre?.toLowerCase().includes(busqueda) ||
      visita.Vehiculo?.placa?.toLowerCase().includes(busqueda) ||
      `${visita.Vehiculo?.marcaVehiculo?.nombre} ${visita.Vehiculo?.modeloVehiculo?.nombre}`
        .toLowerCase()
        .includes(busqueda) ||
      visita.kilometraje?.toString().includes(busqueda) ||
      visita.total?.toString().includes(busqueda)
    );
  });
});

const visitasFiltradas = computed(() => {
  return visitas.value.filter(visita => {
    const cumpleCliente = clienteFilter.value
      ? visita.Cliente?.id === clienteFilter.value
      : true;

    const cumpleFechaInicio = fechaInicio.value
      ? new Date(visita.fecha) >= new Date(fechaInicio.value)
      : true;

    const cumpleFechaFin = fechaFin.value
      ? new Date(visita.fecha) <= new Date(fechaFin.value)
      : true;
    // Nuevos filtros por parámetros de URL
    const cumpleFechaEspecifica = route.query.fecha
      ? visita.fecha === route.query.fecha
      : true;

    const cumpleClienteId = route.query.clienteId
      ? visita.clienteId === parseInt(route.query.clienteId)
      : true;

    const cumpleVehiculoId = route.query.vehiculoId
      ? visita.vehiculoId === parseInt(route.query.vehiculoId)
      : true;

    return cumpleCliente && cumpleFechaInicio && cumpleFechaFin && 
           cumpleFechaEspecifica && cumpleClienteId && cumpleVehiculoId;
  });
});

// Función para obtener el historial de visitas
const obtenerVisitas = async () => {
  try {
    const response = await axios.get('/historiales');
    visitas.value = response.data;
  } catch (error) {
    console.error('Error al cargar datos:', error);
  }
};

// Función para generar PDF
const generarPDF = async (visita) => {
  try {
    const doc = new jsPDF();
    
    const img = new Image();
    img.src = '/assets/images/logoDetalle.png';
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
    
    // Encabezado
    doc.setDrawColor(0);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(8, 48, 95, 40, 3, 3, "FD");
    doc.roundedRect(105, 48, 95, 40, 3, 3, "FD");

    // Logo
    doc.addImage(img, 'PNG', 40, 8, 150, 45);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PROFORMA DE PRODUCTOS Y TRABAJOS REALIZADOS', 105, 45, { align: 'center' });

    // Datos del Cliente
    doc.setFontSize(14);
    doc.text('DATOS DEL CLIENTE', 10, 55);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`NOMBRE: ${visita.Cliente.nombre}`, 10, 62);
    doc.text(`CELULAR: ${visita.Cliente.telefono || 'N/A'}`, 10, 67);
    doc.text(`NIT CLIENTE: ${visita.Cliente.nit || 'N/A'}`, 10, 72);
    doc.text(`FORMA DE PAGO: ${visita.tipoPago}`, 10, 77);
    doc.text(`FECHA: ${formatDate(visita.fecha)}`, 10, 82);

    // Datos del Vehículo
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DATOS DEL VEHÍCULO', 110, 55);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`PLACA N°: ${visita.Vehiculo.placa}`, 110, 62);
    doc.text(`MARCA: ${visita.Vehiculo.marcaVehiculo?.nombre || 'N/A'}`, 110, 67);
    doc.text(`MODELO: ${visita.Vehiculo.modeloVehiculo?.nombre || 'N/A'}`, 110, 72);
    doc.text(`KM. ACTUAL: ${visita.kilometraje}`, 110, 77);
    doc.text(`PRÓXIMO CAMBIO: ${visita.proximoCambio}`, 110, 82);

    // Tabla de detalles
    const headers = ['CÓD.', 'PRODUCTO/SERVICIO', 'CANT.', 'PRECIO UNIT.', 'SUB-TOTAL'];
    const startY = 95;
    let currentY = startY;

    // Cabecera de la tabla
    doc.setFillColor(240, 240, 240);
    doc.rect(10, currentY, 190, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text(headers[0], 15, currentY + 7);
    doc.text(headers[1], 45, currentY + 7);
    doc.text(headers[2], 120, currentY + 7);
    doc.text(headers[3], 140, currentY + 7);
    doc.text(headers[4], 170, currentY + 7);

    currentY += 15;
    doc.setFont('helvetica', 'normal');

    // Detalles
    visita.detalles.forEach(detalle => {
    const item = detalle.servicio || detalle.producto;
    const precio = detalle.servicio ? item.precio : item.precioVenta;
    
    doc.text(item.id.toString(), 15, currentY);
    doc.text(item.nombre, 45, currentY);
    doc.text(detalle.cantidad?.toString() || '1', 120, currentY);
    doc.text(Number(precio).toFixed(2), 140, currentY);
    doc.text((Number(precio) * (detalle.cantidad || 1)).toFixed(2), 170, currentY);
    currentY += 10;
});

    // Totales
    currentY += 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(10, currentY - 5, 200, currentY - 5);

    //subtotales
    const subtotal = Number(visita.total) + Number(visita.descuento);
    doc.text(`Subtotal: ${subtotal.toFixed(2)}`, 150, currentY);
    currentY += 10;

    if (Number(visita.descuento) > 0) {
        doc.text(`Descuento: ${Number(visita.descuento).toFixed(2)}`, 150, currentY);
        currentY += 10;
      }

    // Total
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL: ${Number(visita.total).toFixed(2)}`, 150, currentY);

    // Abrir en nueva ventana y descargar
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');

    const nombreCliente = visita.Cliente.nombre.replace(/\s+/g, '_');
    const fechaVisita = new Date(visita.fecha).toLocaleDateString('es-ES').replace(/\//g, '-');
    const nombreArchivo = `${nombreCliente}_${fechaVisita}.pdf`;
    doc.save(nombreArchivo);

  } catch (error) {
    console.error('Error al generar PDF:', error);
  }
};

// Llama a la función para obtener los datos al montar el componente
onMounted(() => {
  obtenerVisitas();
  obtenerClientes();
});

// Función para formatear la fecha
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Función para limpiar las fechas
const limpiarFechas = () => {
  fechaInicio.value = '';
  fechaFin.value = '';
  clienteFilter.value = '';
};
</script>

<style scoped>
.input-select, .input-text {
  @apply block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500;
}
.btn-primary {
  @apply px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700;
}
.btn-secondary {
  @apply px-3 py-1.5 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700;
}
</style>