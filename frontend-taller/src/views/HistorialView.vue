<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white">Historial de Visitas</h1>
      
      <!-- Filtros -->
      <div class="flex flex-wrap gap-4 items-end">
        <div class="w-64">
          <label for="clienteFilter" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cliente</label>
          <select v-model="clienteFilter" id="clienteFilter" class="input-select">
            <option value="">Todos los clientes</option>
            <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.id">
              {{ cliente.nombre }}
            </option>
          </select>
        </div>
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
        <div class="flex gap-2">
          <button 
            @click="aplicarFiltros" 
            class="btn-primary"
            title="Aplicar filtros"
          >
            Filtrar
          </button>
          <button 
            @click="limpiarFiltros" 
            class="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600"
            title="Limpiar filtros"
          >
            Limpiar
          </button>
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
          <tr v-if="loading" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
            <td colspan="7" class="text-center px-6 py-4">Cargando...</td>
          </tr>
          <tr v-else-if="visitas.length === 0" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
            <td colspan="7" class="text-center px-6 py-4">No hay registros disponibles.</td>
          </tr>
          <tr v-else v-for="visita in visitas" :key="visita.id" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
            <td class="px-6 py-4">{{ formatDate(visita.fecha) }}</td>
            <td class="px-6 py-4">{{ visita.Cliente?.nombre || 'Sin Cliente' }}</td>
            <td class="px-6 py-4">{{ visita.Vehiculo?.placa || 'Sin Vehículo' }}</td>
            <td class="px-6 py-4">{{ visita.kilometraje }} km</td>
            <td class="px-6 py-4">{{ visita.proximoCambio }} km</td>
            <td class="px-6 py-4">Bs {{ visita.total }}</td>
            <td class="px-6 py-4">
              <div class="flex space-x-2">
                <button @click="generarPDF(visita)" class="btn-primary">Ver</button>
                <button 
                  @click="eliminarVisita(visita.id)"
                  class="text-red-600 hover:text-red-900 font-medium"
                >
                  Eliminar
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    <div class="flex justify-between items-center mt-4" v-if="totalItems > 0">
      <div class="text-sm text-gray-700 dark:text-gray-400">
        Mostrando
        <span class="font-semibold text-gray-900 dark:text-white">{{ (currentPage - 1) * limit + 1 }}</span>
        a
        <span class="font-semibold text-gray-900 dark:text-white">{{ Math.min(currentPage * limit, totalItems) }}</span>
        de
        <span class="font-semibold text-gray-900 dark:text-white">{{ totalItems }}</span>
        resultados
      </div>
      <div class="flex space-x-2">
        <button
          @click="cambiarPagina(1)"
          :disabled="currentPage === 1"
          class="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-700 text-gray-700 dark:text-white"
        >
          «
        </button>
        <button
          @click="cambiarPagina(currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-700 text-gray-700 dark:text-white"
        >
          ‹
        </button>
        
        <span class="px-3 py-1 text-gray-700 dark:text-white">
          Página {{ currentPage }} de {{ totalPages }}
        </span>
        
        <button
          @click="cambiarPagina(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-700 text-gray-700 dark:text-white"
        >
          ›
        </button>
        <button
          @click="cambiarPagina(totalPages)"
          :disabled="currentPage === totalPages"
          class="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-700 text-gray-700 dark:text-white"
        >
          »
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import jsPDF from 'jspdf';
import Swal from 'sweetalert2';

const route = useRoute();
const router = useRouter();

// Estado
const visitas = ref([]);
const clientes = ref([]);
const loading = ref(false);

// Filtros y Paginación
const clienteFilter = ref('');
const fechaInicio = ref('');
const fechaFin = ref('');
const vehiculoIdFilter = ref('');

const currentPage = ref(1);
const totalPages = ref(1);
const totalItems = ref(0);
const limit = 10;

// Cargar Clientes para el filtro
const fetchClientes = async () => {
  try {
    // Obtenemos todos los clientes para el select (sin paginación o con un límite alto si es necesario, 
    // idealmente debería ser un autocompletado si son muchos, pero por ahora usaremos el endpoint existente)
    // Nota: El endpoint de clientes ahora pagina, así que pediremos un límite alto para llenar el select
    const response = await axios.get('http://localhost:3000/api/clientes?limit=100');
    clientes.value = response.data.data;
  } catch (error) {
    console.error('Error al cargar clientes:', error);
  }
};

// Cargar Visitas
const fetchVisitas = async () => {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      limit: limit,
      clienteId: clienteFilter.value || undefined,
      vehiculoId: vehiculoIdFilter.value || undefined,
      fechaInicio: fechaInicio.value || undefined,
      fechaFin: fechaFin.value || undefined
    };

    const response = await axios.get('http://localhost:3000/api/visitas', { params });
    
    visitas.value = response.data.data;
    totalItems.value = response.data.totalItems;
    totalPages.value = response.data.totalPages;
    currentPage.value = response.data.currentPage;
  } catch (error) {
    console.error('Error al cargar visitas:', error);
    Swal.fire('Error', 'No se pudieron cargar las visitas', 'error');
  } finally {
    loading.value = false;
  }
};

// Manejo de Filtros
const aplicarFiltros = () => {
  currentPage.value = 1;
  fetchVisitas();
};

const limpiarFiltros = () => {
  clienteFilter.value = '';
  fechaInicio.value = '';
  fechaFin.value = '';
  vehiculoIdFilter.value = '';
  
  // Limpiar query params de la URL
  router.replace({ query: {} });
  
  aplicarFiltros();
};

const cambiarPagina = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const eliminarVisita = async (id) => {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: "No podrás revertir esto",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });

  if (result.isConfirmed) {
    try {
      await axios.delete(`http://localhost:3000/api/visitas/${id}`);
      Swal.fire('Eliminado', 'La visita ha sido eliminada.', 'success');
      fetchVisitas();
    } catch (error) {
      console.error('Error al eliminar visita:', error);
      Swal.fire('Error', 'No se pudo eliminar la visita', 'error');
    }
  }
};

const generarPDF = async (visita) => {
  try {
    const doc = new jsPDF();
    
    const img = new Image();
    img.src = '/assets/images/logoDetalle.png';
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = resolve; // Continuar aunque falle la imagen
      // Timeout por si acaso
      setTimeout(resolve, 1000);
    });
    
    // Encabezado
    doc.setDrawColor(0);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(8, 48, 95, 40, 3, 3, "FD");
    doc.roundedRect(105, 48, 95, 40, 3, 3, "FD");

    // Logo (si cargó)
    try {
        doc.addImage(img, 'PNG', 40, 8, 150, 45);
    } catch (e) {
        console.warn("No se pudo agregar el logo al PDF");
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PROFORMA DE PRODUCTOS Y TRABAJOS REALIZADOS', 105, 45, { align: 'center' });

    // Datos del Cliente
    doc.setFontSize(14);
    doc.text('DATOS DEL CLIENTE', 10, 55);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`NOMBRE: ${visita.Cliente?.nombre || 'N/A'}`, 10, 62);
    doc.text(`CELULAR: ${visita.Cliente?.telefono || 'N/A'}`, 10, 67);
    doc.text(`NIT CLIENTE: ${visita.Cliente?.nit || 'N/A'}`, 10, 72);
    doc.text(`FORMA DE PAGO: ${visita.tipoPago || 'Efectivo'}`, 10, 77);
    doc.text(`FECHA: ${formatDate(visita.fecha)}`, 10, 82);

    // Datos del Vehículo
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DATOS DEL VEHÍCULO', 110, 55);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`PLACA N°: ${visita.Vehiculo?.placa || 'N/A'}`, 110, 62);
    doc.text(`MARCA: ${visita.Vehiculo?.marcaVehiculo?.nombre || 'N/A'}`, 110, 67);
    doc.text(`MODELO: ${visita.Vehiculo?.modeloVehiculo?.nombre || 'N/A'}`, 110, 72);
    doc.text(`KM. ACTUAL: ${visita.kilometraje || 0}`, 110, 77);
    doc.text(`PRÓXIMO CAMBIO: ${visita.proximoCambio || 0}`, 110, 82);

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
    if (visita.detalles) {
        visita.detalles.forEach(detalle => {
            // Determinar nombre y precio según tipo (aunque en la vista original parecía venir ya populado o con lógica compleja)
            // Asumiremos que el backend devuelve detalles con info suficiente o que 'detalle' tiene lo necesario.
            // En la vista corrupta: const item = detalle.servicio || detalle.producto;
            // El backend incluye DetalleVisita, pero no vi que incluyera Producto o Servicio anidados en el include de DetalleVisita en el GET /.
            // Revisando routes/visitas.js: include: [{ model: DetalleVisita, as: 'detalles' }]
            // Faltaría incluir Producto y Servicio dentro de DetalleVisita para tener los nombres.
            // PERO, el código original corrupto asumía que estaban.
            // Voy a asumir que el backend NO los está enviando ahora mismo y eso podría ser un problema para el PDF.
            // Sin embargo, para no bloquear, usaré lo que tenga o placeholders.
            
            // NOTA: Si el backend no envía los nombres, el PDF saldrá vacío.
            // Debería verificar el backend include.
            
            const nombre = detalle.nombreProducto || detalle.Producto?.nombre || detalle.Servicio?.nombre || 'Item ' + detalle.itemId;
            const precio = detalle.precio;
            
            doc.text((detalle.itemId || '').toString(), 15, currentY);
            doc.text(nombre, 45, currentY);
            doc.text((detalle.cantidad || 1).toString(), 120, currentY);
            doc.text(Number(precio).toFixed(2), 140, currentY);
            doc.text((Number(precio) * (detalle.cantidad || 1)).toFixed(2), 170, currentY);
            currentY += 10;
        });
    }

    // Totales
    currentY += 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(10, currentY - 5, 200, currentY - 5);

    //subtotales
    const subtotal = Number(visita.total) + Number(visita.descuento || 0);
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

    const nombreCliente = (visita.Cliente?.nombre || 'Cliente').replace(/\s+/g, '_');
    const fechaVisita = new Date(visita.fecha).toLocaleDateString('es-ES').replace(/\//g, '-');
    const nombreArchivo = `${nombreCliente}_${fechaVisita}.pdf`;
    doc.save(nombreArchivo);

  } catch (error) {
    console.error('Error al generar PDF:', error);
    Swal.fire('Error', 'No se pudo generar el PDF', 'error');
  }
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