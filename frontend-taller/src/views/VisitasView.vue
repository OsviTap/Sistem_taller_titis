<template>
    <div class="p-6">
      <!-- Header -->
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">Registro de Visita</h1>
  
      <!-- Formulario -->
      <form @submit.prevent="guardarVisita">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Cliente -->
          <div>
            <label for="cliente" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Cliente</label>
            <select v-model="clienteSeleccionado" id="cliente" class="input-select">
              <option value="">Seleccione un cliente</option>
              <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.id">
                {{ cliente.nombre }}
              </option>
            </select>
          </div>
  
          <!-- Vehículo -->
          <div>
            <label for="vehiculo" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Vehículo</label>
            <select v-model="vehiculoSeleccionado" id="vehiculo" class="input-select">
              <option value="">Seleccione un vehículo</option>
              <option v-for="vehiculo in vehiculosFiltrados" 
                      :key="vehiculo.id" 
                      :value="vehiculo.id">
                {{ vehiculo.marcaVehiculo?.nombre }} - {{ vehiculo.modeloVehiculo?.nombre }} - {{ vehiculo.placa }}
              </option>
            </select>
          </div>
  
          <!-- Fecha -->
          <div>
            <label for="fecha" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha</label>
            <input type="date" id="fecha" v-model="fechaFormateada" class="input-text" />
          </div>
  
          <!-- Kilometraje Actual -->
          <div>
            <label for="kilometraje" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Kilometraje Actual</label>
            <input type="number" id="kilometraje" v-model.number="kilometraje" class="input-text" />
          </div>
  
          <!-- Próximo Cambio -->
          <div>
            <label for="proximo-cambio" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Próximo Cambio (Km)</label>
            <input type="number" id="proximo-cambio" v-model.number="proximoCambio" class="input-text" />
          </div>
          <!-- Tipo de pago -->
            <div>
              <label for="tipo-pago" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Pago</label>
              <select v-model="tipoPago" id="tipo-pago" class="input-select">
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Transferencia">Transferencia</option>
                <option value="QR">QR</option>
              </select>
            </div>
            <!-- Descuento -->
            <div>
              <label for="descuento" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Descuento (Bs)</label>
              <input 
                  type="number" 
                  id="descuento" 
                  v-model.number="descuento" 
                  placeholder="0.00"
                  class="input-text" 
                  min="0"
                  step="0.01"
              />
            </div>
        </div>

          
  
        <!-- Sección de Detalles -->
        <div class="mt-8">
          <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4">Detalles de la Visita</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <!-- Selector de Servicios -->
            <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 class="text-lg font-medium text-gray-800 dark:text-white mb-3">Agregar Servicio</h3>
              <div class="space-y-3">
                <select v-model="servicioSeleccionado" id="servicio" class="input-select">
                  <option value="">Seleccione un servicio</option>
                  <option v-for="servicio in servicios" 
                          :key="servicio.id" 
                          :value="servicio">
                    {{ servicio.nombre }} - Bs {{ servicio.precio }}
                  </option>
                </select>
                <button type="button" 
                        @click="agregarServicio" 
                        :disabled="!servicioSeleccionado"
                        class="btn-primary w-full">
                  Agregar Servicio
                </button>
              </div>
            </div>
  
            <!-- Selector de Productos -->
            <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 class="text-lg font-medium text-gray-800 dark:text-white mb-3">Agregar Producto</h3>
              <div class="space-y-3">
                <div class="relative">
                  <input 
                    type="text"
                    v-model="productoSearchTerm"
                    @focus="showProductosList = true"
                    class="input-text pl-10 w-full"
                    placeholder="Buscar producto por nombre o código..."
                  >
                  <div class="absolute inset-y-0 right-2 pl-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>

                <!-- Lista de productos filtrados -->
                <div v-if="showProductosList && productoSearchTerm && filteredProductos.length > 0" 
                    class="productos-dropdown absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                  <ul class="py-1">
                    <li v-for="producto in filteredProductos" 
                        :key="producto.id"
                        @click="selectProducto(producto)"
                        class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer flex justify-between items-center">
                      <span>{{ producto.nombre }}</span>
                      <span class="text-sm text-gray-500 dark:text-gray-400">
                        Bs {{ producto.precio }} (Stock: {{ producto.stock }})
                      </span>
                    </li>
                  </ul>
                </div>
                <!-- Cantidad del producto -->
                <div v-if="productoSeleccionado" class="flex gap-2">
                  <input 
                    type="number"
                    v-model.number="cantidadProducto"
                    class="input-text w-24"
                    min="1"
                    :max="productoSeleccionado.stock"
                    placeholder="Cant."
                  />
                  <span class="text-sm text-gray-500 dark:text-gray-400 self-center">
                    Disponible: {{ productoSeleccionado.stock }}
                  </span>
                </div>

                <button type="button" 
                        @click="agregarProducto" 
                        :disabled="!productoSeleccionado"
                        class="btn-primary w-full">
                  Agregar Producto
                </button>
              </div>
            </div>
          </div>
  
          <!-- Lista Unificada de Detalles -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
            <table class="table-auto w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" class="px-6 py-3">Tipo</th>
                  <th scope="col" class="px-6 py-3">Descripción</th>
                  <th scope="col" class="px-6 py-3">Cantidad</th>
                  <th scope="col" class="px-6 py-3">Precio Unit. (Bs)</th>
                  <th scope="col" class="px-6 py-3">Subtotal (Bs)</th>
                  <th scope="col" class="px-6 py-3">Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(detalle, index) in detallesUnificados" 
                    :key="index" 
                    class="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                  <td class="px-6 py-4">
                    <span :class="{
                      'px-2 py-1 rounded text-xs font-medium': true,
                      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300': detalle.tipo === 'Servicio',
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300': detalle.tipo === 'Producto'
                    }">
                      {{ detalle.tipo }}
                    </span>
                  </td>
                  <td class="px-6 py-4">{{ detalle.nombre }}</td>
                  <td class="px-6 py-4">{{ detalle.cantidad }}</td>
                  <td class="px-6 py-4">Bs {{ detalle.precio }}</td>
                  <td class="px-6 py-4">Bs {{ (detalle.precio * detalle.cantidad).toFixed(2) }}</td>
                  <td class="px-6 py-4">
                    <button @click="eliminarDetalle(index, detalle.tipo)" 
                            class="btn-danger">
                      Eliminar
                    </button>
                  </td>
                </tr>
                <tr v-if="detallesUnificados.length === 0" 
                    class="bg-white dark:bg-gray-800">
                  <td colspan="6" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No hay items agregados
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
  
          <!-- Total -->
          <div class="flex justify-end mt-6 space-x-4">
              <div class="text-right">
                  <p class="text-gray-600 dark:text-gray-400">Subtotal: Bs {{ subtotal }}</p>
                  <p class="text-gray-600 dark:text-gray-400">Descuento: Bs {{ descuento }}</p>
                  <p class="text-lg font-semibold text-gray-800 dark:text-white">
                      Total: Bs {{ totalConDescuento }}
                  </p>
              </div>
          </div>
  
        <!-- Botones -->
        <div class="flex justify-end gap-4 mt-6">
          <button type="button" @click="generarDocumento" class="btn-secondary">Imprimir</button>
          <button type="submit" class="btn-primary">Guardar</button>
        </div>
        </div>
      </form>
    </div>
</template>
  
<script setup>
  import { ref, computed, onMounted, onUnmounted ,watch } from 'vue';
  import axios from '@/api/axios';
  import jsPDF from 'jspdf';
  import html2canvas from 'html2canvas';


  // Referencias para los datos
const clientes = ref([]);
const vehiculos = ref([]);
const servicios = ref([]);
const productos = ref([]);
const detalleServicios = ref([]);
const detalleProductos = ref([]);

// Referencias para las selecciones
const clienteSeleccionado = ref(null);
const vehiculoSeleccionado = ref(null);
const servicioSeleccionado = ref(null);
const productoSeleccionado = ref(null);
const tipoPago = ref('Efectivo');
const descuento = ref(0);
const cantidadProducto = ref(1);

// Referencias para la búsqueda de productos
const productoSearchTerm = ref('');
const showProductosList = ref(false);

// Referencias para los datos del formulario
const fechaActual = ref(new Date());

const fechaFormateada = ref(new Date().toISOString().split('T')[0]);

// computed(() => {
//     return formatDate(fechaActual.value);
// });
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const kilometraje = ref(0);
const proximoCambio = ref(0);

// Computed properties
const vehiculosFiltrados = computed(() => {
    if (!clienteSeleccionado.value) return [];
    return vehiculos.value.filter(v => v.clienteId === clienteSeleccionado.value);
});

const cantidadProductoValida = computed(() => {
    if (!productoSeleccionado.value || !cantidadProducto.value) return false;
    return cantidadProducto.value > 0 && cantidadProducto.value <= productoSeleccionado.value.stock;
});


const filteredProductos = computed(() => {
    if (!productoSearchTerm.value) return [];
    const searchTerm = productoSearchTerm.value.toLowerCase();
    return productos.value.filter(producto => 
        producto.nombre.toLowerCase().includes(searchTerm) ||
        producto.id.toString().includes(searchTerm)
    );
});

const detallesUnificados = computed(() => {
    const servicios = detalleServicios.value.map(servicio => ({
        ...servicio,
        tipo: 'Servicio'
    }));
    const productos = detalleProductos.value.map(producto => ({
        ...producto,
        tipo: 'Producto'
    }));
    return [...servicios, ...productos];
});
const subtotal = computed(() => 
    detallesUnificados.value.reduce((sum, item) => sum + (item.precio * (item.cantidad || 1)), 0)
);
const totalConDescuento = computed(() => 
    Math.max(subtotal.value - descuento.value, 0)
);
const totalGeneral = computed(() => 
    detallesUnificados.value.reduce((sum, item) => sum + (item.precio * (item.cantidad || 1)), 0)
);

// Funciones para la búsqueda de productos
const selectProducto = (producto) => {
    productoSeleccionado.value = producto;
    productoSearchTerm.value = producto.nombre;
    showProductosList.value = false; // Cerrar el dropdown después de seleccionar
};

// Función para cerrar el dropdown de productos al hacer click afuera
const handleClickOutside = (event) => {
    const dropdown = document.querySelector('.productos-dropdown');
    if (dropdown && !dropdown.contains(event.target)) {
        showProductosList.value = false;
    }
};
// Funciones para cargar datos
const loadData = async () => {
    try {
        // Cargar clientes
        const clientesResponse = await axios.get('/clientes');
        clientes.value = clientesResponse.data.filter(c => c.estado === 1);

        // Cargar servicios
        const serviciosResponse = await axios.get('/servicios');
        servicios.value = serviciosResponse.data.map(servicio => ({
            id: servicio.id,
            nombre: servicio.nombre,
            precio: servicio.precio,
            descripcion: servicio.descripcion
        }));
        console.log('Servicios cargados:', servicios.value);

        // Cargar productos
        const productosResponse = await axios.get('/productos');
        productos.value = productosResponse.data.map(producto => ({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precioVenta,
            stock: producto.stock || 0
        }));
        console.log('Productos cargados:', productos.value);

    } catch (error) {
        console.error('Error al cargar datos:', error);
        if (error.response) {
            console.error('Error del servidor:', error.response.data);
        }
    }
};

// Watch para cargar vehículos cuando cambia el cliente
watch(clienteSeleccionado, async (newValue) => {
    if (newValue) {
        try {
            const response = await axios.get(`/vehiculos/cliente/${newValue}`);
            vehiculos.value = response.data.filter(v => v.estado === 1);
        } catch (error) {
            console.error('Error al cargar vehículos:', error);
        }
    } else {
        vehiculos.value = [];
    }
});

// Funciones para manejar servicios y productos
const agregarServicio = () => {
    if (servicioSeleccionado.value) {
        detalleServicios.value.push({
            ...servicioSeleccionado.value,
            cantidad: 1
        });
        servicioSeleccionado.value = null;
    }
};

const agregarProducto = () => {
    if (productoSeleccionado.value && cantidadProductoValida.value) {
        // Buscar si el producto ya existe en la lista
        const productoExistente = detalleProductos.value.find(p => p.id === productoSeleccionado.value.id);
        
        if (productoExistente) {
            // Actualizar la cantidad si el producto ya existe
            productoExistente.cantidad += cantidadProducto.value;
        } else {
            // Agregar nuevo producto si no existe
            detalleProductos.value.push({
                ...productoSeleccionado.value,
                cantidad: cantidadProducto.value
            });
        }
        
        // Resetear los campos
        productoSeleccionado.value = null;
        productoSearchTerm.value = '';
        cantidadProducto.value = 1;
        showProductosList.value = false;
    }
};

const eliminarDetalle = (index, tipo) => {
    if (tipo === 'Servicio') {
        detalleServicios.value.splice(index, 1);
    } else {
        const serviciosLength = detalleServicios.value.length;
        detalleProductos.value.splice(index - serviciosLength, 1);
    }
};

// Función para guardar la visita
const guardarVisita = async () => {
    try {
        // Obtener datos del cliente y vehículo
        const clienteResponse = await axios.get(`/clientes/${clienteSeleccionado.value}`);
        const vehiculoResponse = await axios.get(`/vehiculos/cliente/${clienteSeleccionado.value}`);
        
        const clienteData = clienteResponse.data;
        const vehiculoData = vehiculoResponse.data.find(v => v.id === vehiculoSeleccionado.value);

        if (!clienteData || !vehiculoData) {
            throw new Error('No se encontraron los datos del cliente o vehículo');
        }

        // Preparar datos de la visita
        const visitaData = {
            clienteId: clienteSeleccionado.value,
            vehiculoId: vehiculoSeleccionado.value,
            fecha: new Date(fechaFormateada.value),
            kilometraje: kilometraje.value,
            proximoCambio: proximoCambio.value,
            tipoPago: tipoPago.value,
            descuento: Number(descuento.value) || 0,
            total: totalConDescuento.value,
            detalles: [
                ...detalleServicios.value.map(s => ({
                    tipo: 'Servicio',
                    itemId: s.id,
                    precio: s.precio,
                    cantidad: s.cantidad
                })),
                ...detalleProductos.value.map(p => ({
                    tipo: 'Producto',
                    itemId: p.id,
                    precio: p.precio,
                    cantidad: p.cantidad
                }))
            ]
        };

        // Guardar la visita
        const response = await axios.post('/visitas', visitaData);
        const visitaId = response.data.id;

        // Registrar productos en el historial
        const productosPromises = detalleProductos.value.map(async producto => {
            const productoResponse = await axios.get(`/productos/${producto.id}`);
            const productoCompleto = productoResponse.data;

            // Registrar en el historial
            await axios.post('/historial-productos', {
                fechaSalida: new Date(),
                cantidad: producto.cantidad,
                precioCosto: productoCompleto.precioCosto,
                precioVenta: producto.precio,
                descuento: (descuento.value / detalleProductos.value.length) || 0,
                productoId: producto.id,
                clienteId: clienteSeleccionado.value,
                vehiculoId: vehiculoSeleccionado.value,
                visitaId: visitaId
            });
        });

        // Esperar a que se completen todos los registros
        await Promise.all(productosPromises);

        // Generar PDF
        const detallesCompletos = [
            ...detalleServicios.value.map(servicio => ({
                id: servicio.id,
                nombre: servicio.nombre,
                precio: servicio.precio,
                cantidad: servicio.cantidad
            })),
            ...detalleProductos.value.map(producto => ({
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                cantidad: producto.cantidad
            }))
        ];

        const doc = await generarPDF(visitaData, clienteData, vehiculoData, detallesCompletos);
        
        // Abrir PDF en nueva ventana
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, '_blank');

        // Guardar PDF
        const nombreCliente = clienteData.nombre.replace(/\s+/g, '_');
        const fechaVisita = new Date(visitaData.fecha).toLocaleDateString('es-ES').replace(/\//g, '-');
        const nombreArchivo = `${nombreCliente}_${fechaVisita}.pdf`;
        doc.save(nombreArchivo);

        resetearFormulario();
    } catch (error) {
        console.error('Error al procesar la visita:', error);
        alert('Error al procesar la visita. Por favor, verifique los datos.');
    }
};


//Funcion para generar PDF
const generarPDF = async (visitaData, clienteData, vehiculoData, detallesCompletos) => {
    const doc = new jsPDF();
    
    return new Promise((resolve, reject) => {
        

        const img = new Image();
        img.src = '/assets/images/logoDetalle.png';
        
        img.onload = () => {
            // Encabezado
            // Black square with rounded corners
            doc.setDrawColor(0);
            doc.setFillColor(255, 255, 255);
            doc.roundedRect(8, 48, 95, 40, 3, 3, "FD");
            // Black square with rounded corners2
            doc.setDrawColor(0);
            doc.setFillColor(255, 255, 255);
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
            doc.text(`NOMBRE: ${clienteData.nombre}`, 10, 62);
            doc.text(`CELULAR: ${clienteData.telefono}`, 10, 67);
            doc.text(`NIT CLIENTE: ${clienteData.nit || 'N/A'}`, 10, 72);
            doc.text(`FORMA DE PAGO: ${visitaData.tipoPago}`, 10, 77);
            doc.text(`FECHA: ${formatDate(visitaData.fecha)}`, 10, 82);

            // Datos del Vehículo
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('DATOS DEL VEHÍCULO', 110, 55);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`PLACA N°: ${vehiculoData.placa}`, 110, 62);
            doc.text(`MARCA: ${vehiculoData.marcaVehiculo?.nombre || 'N/A'}`, 110, 67);
            doc.text(`MODELO: ${vehiculoData.modeloVehiculo?.nombre || 'N/A'}`, 110, 72);
            doc.text(`KM. ACTUAL: ${visitaData.kilometraje}`, 110, 77);
            doc.text(`PRÓXIMO CAMBIO: ${visitaData.proximoCambio}`, 110, 82);

            // Tabla de detalles
            const headers = ['CÓD.', 'PRODUCTO/SERVICIO', 'CANT.', 'PRECIO UNIT.', 'SUB-TOTAL'];
            const startY = 95;
            let currentY = startY;

            // Cabecera
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
            detallesCompletos.forEach(item => {
                doc.text(item.id.toString(), 15, currentY);
                doc.text(item.nombre, 45, currentY);
                doc.text(item.cantidad.toString(), 120, currentY);
                doc.text(item.precio.toFixed(2), 140, currentY);
                doc.text((item.precio * item.cantidad).toFixed(2), 170, currentY);
                currentY += 10;
            });

            // Totales
            currentY += 10;
            const lineWidth = 190;
            doc.setDrawColor(200, 200, 200);
            doc.line(10, currentY - 5, lineWidth, currentY - 5);

            if (visitaData.descuento > 0) {
                doc.text(`Subtotal: ${visitaData.total + visitaData.descuento}`, 150, currentY);
                currentY += 10;
                doc.text(`Descuento: ${visitaData.descuento}`, 150, currentY);
                currentY += 10;
            }
            doc.setFont('helvetica', 'bold');
            doc.text(`TOTAL: ${visitaData.total}`, 150, currentY);

            resolve(doc);
        };

        img.onerror = reject;
    });
};

// Funciones auxiliares
const validarFormulario = () => {
    return (
        clienteSeleccionado.value &&
        vehiculoSeleccionado.value &&
        kilometraje.value > 0 &&
        proximoCambio.value > 0 &&
        tipoPago.value &&
        (detalleServicios.value.length > 0 || detalleProductos.value.length > 0)
    );
};

const resetearFormulario = () => {
    clienteSeleccionado.value = null;
    vehiculoSeleccionado.value = null;
    kilometraje.value = 0;
    proximoCambio.value = 0;
    tipoPago.value = 'Efectivo';
    detalleServicios.value = [];
    detalleProductos.value = [];
};

// Inicialización
onMounted(() => {
    loadData();
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});

//export { generarPDF, guardarVisita };
</script>
  
<style scoped>
  .input-select, .input-text {
    @apply block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500;
}

.btn-primary {
    @apply px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-secondary {
    @apply px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700;
}

.btn-danger {
    @apply px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700;
}

.productos-dropdown {
    @apply border border-gray-200 dark:border-gray-600;
}
</style>