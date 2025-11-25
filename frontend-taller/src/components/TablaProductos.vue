<template>
  <div>
    <!-- Agregar barra de búsqueda y selector de items por página -->
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
            placeholder="Buscar producto..."
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

    <!-- Tabla existente -->
    <div class="relative overflow-x-auto shadow-md sm:rounded-lg m-4">
      <div v-if="productos.length > 0" >
        <table  id="filter-table" class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            
            <th scope="col" class="px-6 py-3">Nombre</th>
            <th scope="col" class="px-6 py-3">Stock</th>
            <th scope="col" class="px-6 py-3">Precio Costo</th>
            <th scope="col" class="px-6 py-3">Precio Venta</th>
            <th scope="col" class="px-6 py-3">Fecha Adquisición</th>
            <th scope="col" class="px-6 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="producto in paginatedProductos" :key="producto.id" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
            
            <td class="px-6 py-4">{{ producto.nombre }}</td>
            <td class="px-6 py-4">{{ producto.stock }}</td>
            <td class="px-6 py-4">{{ producto.precioCosto }}</td>
            <td class="px-6 py-4">{{ producto.precioVenta }}</td>
            <td class="px-6 py-4">{{ formatDate(producto.fechaAdquisicion) }}</td>
            <td class="px-6 py-4">
              <div class="flex items-center space-x-4">
                <button @click="openViewModal(producto)" class="text-blue-600 hover:text-blue-900">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                </button>
                <button @click="openEditModal(producto)" class="text-yellow-600 hover:text-yellow-900">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                  </svg>
                </button>
                <button @click="confirmarEliminacion(producto)" class="text-red-600 hover:text-red-700">
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
      
    </div>

    <!-- Modal de Crear/Editar Producto -->
    <div v-if="showFormModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="relative bg-white rounded-lg shadow dark:bg-gray-800 w-full max-w-md">
        <!-- Header del Modal -->
        <div class="flex items-center justify-between p-4 border-b rounded-t dark:border-gray-600">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ modalMode === 'create' ? 'Registrar Producto' : modalMode === 'edit' ? 'Editar Producto' : 'Ver Producto' }}
          </h3>
          <button @click="closeModal" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </div>

        <!-- Contenido del Modal -->
        <div class="p-6 space-y-6">
          <form @submit.prevent="submitForm">
            <div class="grid gap-4 mb-4">
              <div>
                <label for="nombre" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nombre</label>
                <input 
                  type="text" 
                  id="nombre" 
                  v-model="formData.nombre" 
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                  required
                  :disabled="modalMode === 'view'"
                >
              </div>
              <div>
                <label for="stock" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Stock</label>
                <input 
                  type="number" 
                  id="stock" 
                  v-model="formData.stock" 
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                  required
                  :disabled="modalMode === 'view'"
                >
              </div>
              <div>
                <label for="precioCosto" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Precio Costo</label>
                <input 
                  type="number" 
                  id="precioCosto" 
                  v-model="formData.precioCosto" 
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                  required
                  step="0.01"
                  :disabled="modalMode === 'view'"
                >
              </div>
              <div>
                <label for="precioVenta" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Precio Venta</label>
                <input 
                  type="number" 
                  id="precioVenta" 
                  v-model="formData.precioVenta" 
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                  required
                  step="0.01"
                  :disabled="modalMode === 'view'"
                >
              </div>
              <div>
                <label for="fechaAdquisicion" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Fecha Adquisición</label>
                <input 
                  type="date" 
                  id="fechaAdquisicion" 
                  v-model="formData.fechaAdquisicion" 
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                  required
                  :disabled="modalMode === 'view'"
                >
              </div>
            </div>
            
            <!-- Botones del Modal -->
            <div class="flex items-center justify-end space-x-2 border-t pt-4">
              <button 
                type="button"
                @click="closeModal"
                class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
              >
                Cancelar
              </button>
              <button 
                v-if="modalMode !== 'view'"
                type="submit"
                class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                {{ modalMode === 'create' ? 'Registrar' : 'Actualizar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal de Confirmación de Eliminación -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="relative bg-white rounded-lg shadow dark:bg-gray-800 w-full max-w-md">
        <div class="p-6 text-center">
          <svg class="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
            ¿Está seguro que desea eliminar este producto?
          </h3>
          <button 
            @click="deleteProducto"
            class="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2"
          >
            Sí, eliminar
          </button>
          <button 
            @click="showDeleteModal = false"
            class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
          >
            No, cancelar
          </button>
        </div>
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
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                </button>
                <button @click="openEditModal(producto)" class="text-yellow-600 hover:text-yellow-900">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                  </svg>
                </button>
                <button @click="confirmarEliminacion(producto)" class="text-red-600 hover:text-red-700">
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
      
    </div>

    <!-- Modal de Crear/Editar Producto -->
    <div v-if="showFormModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="relative bg-white rounded-lg shadow dark:bg-gray-800 w-full max-w-md">
        <!-- Header del Modal -->
        <div class="flex items-center justify-between p-4 border-b rounded-t dark:border-gray-600">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ modalMode === 'create' ? 'Registrar Producto' : modalMode === 'edit' ? 'Editar Producto' : 'Ver Producto' }}
          </h3>
          <button @click="closeModal" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </div>

        <!-- Contenido del Modal -->
        <div class="p-6 space-y-6">
          <form @submit.prevent="submitForm">
            <div class="grid gap-4 mb-4">
              <div>
                <label for="nombre" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nombre</label>
                <input 
                  type="text" 
                  id="nombre" 
                  v-model="formData.nombre" 
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                  required
                  :disabled="modalMode === 'view'"
                >
              </div>
              <div>
                <label for="stock" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Stock</label>
                <input 
                  type="number" 
                  id="stock" 
                  v-model="formData.stock" 
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                  required
                  :disabled="modalMode === 'view'"
                >
              </div>
              <div>
                <label for="precioCosto" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Precio Costo</label>
                <input 
                  type="number" 
                  id="precioCosto" 
                  v-model="formData.precioCosto" 
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                  required
                  step="0.01"
                  :disabled="modalMode === 'view'"
                >
              </div>
              <div>
                <label for="precioVenta" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Precio Venta</label>
                <input 
                  type="number" 
                  id="precioVenta" 
                  v-model="formData.precioVenta" 
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                  required
                  step="0.01"
                  :disabled="modalMode === 'view'"
                >
              </div>
              <div>
                <label for="fechaAdquisicion" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Fecha Adquisición</label>
                <input 
                  type="date" 
                  id="fechaAdquisicion" 
                  v-model="formData.fechaAdquisicion" 
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                  required
                  :disabled="modalMode === 'view'"
                >
              </div>
            </div>
            
            <!-- Botones del Modal -->
            <div class="flex items-center justify-end space-x-2 border-t pt-4">
              <button 
                type="button"
                @click="closeModal"
                class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
              >
                Cancelar
              </button>
              <button 
                v-if="modalMode !== 'view'"
                type="submit"
                class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                {{ modalMode === 'create' ? 'Registrar' : 'Actualizar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal de Confirmación de Eliminación -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="relative bg-white rounded-lg shadow dark:bg-gray-800 w-full max-w-md">
        <div class="p-6 text-center">
          <svg class="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
            ¿Está seguro que desea eliminar este producto?
          </h3>
          <button 
            @click="deleteProducto"
            class="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2"
          >
            Sí, eliminar
          </button>
          <button 
            @click="showDeleteModal = false"
            class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
          >
            No, cancelar
          </button>
        </div>
      </div>
    </div>

    <!-- Agregar paginación al final de la tabla -->
    <nav class="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0 p-4">
      <span class="text-sm font-normal text-gray-500 dark:text-gray-400">
        Mostrando 
        <span class="font-semibold text-gray-900 dark:text-white">{{ startIndex + 1 }}-{{ Math.min(endIndex, totalItems) }}</span>
        de
        <span class="font-semibold text-gray-900 dark:text-white">{{ totalItems }}</span>
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
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import axios from '@/api/axios';
import { io } from 'socket.io-client';

// Estados
const productos = ref([]);
const showFormModal = ref(false);
const showDeleteModal = ref(false);
const modalMode = ref('create');
const selectedProduct = ref(null);
const formData = ref({
  nombre: '',
  stock: 0,
  precioCosto: 0,
  precioVenta: 0,
  fechaAdquisicion: ''
});
const searchTerm = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(10); // Default to 10
const totalItems = ref(0);
const totalPages = ref(0);
const isLoading = ref(false);

// Socket.io setup
const socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001', {
  transports: ['websocket'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 10,
  timeout: 5000,
  autoConnect: true,
});

// Funciones
const formatDate = (date) => {
  if (!date) return '';
  const fechaUTC = new Date(date);
  const fechaLocal = new Date(fechaUTC.getTime() + fechaUTC.getTimezoneOffset() * 60000);
  return fechaLocal.toLocaleDateString('es-ES', {
    year: 'numeric',
    ...producto,
    fechaAdquisicion: fechaFormateada
  };
  showFormModal.value = true;
};

const openEditModal = (producto) => {
  modalMode.value = 'edit';
  selectedProduct.value = producto;
  const fechaFormateada = producto.fechaAdquisicion ? new Date(producto.fechaAdquisicion).toISOString().split('T')[0] : '';
  formData.value = {
    ...producto,
    fechaAdquisicion: fechaFormateada
  };
  showFormModal.value = true;
};

const closeModal = () => {
  showFormModal.value = false;
  formData.value = {
    nombre: '',
    stock: 0,
    precioCosto: 0,
    precioVenta: 0,
    fechaAdquisicion: ''
  };
  selectedProduct.value = null;
};

const submitForm = async () => {
  try {
    const dataToSend = {
      ...formData.value,
      fechaAdquisicion: formData.value.fechaAdquisicion ? new Date(formData.value.fechaAdquisicion).toISOString() : null
    };

    if (modalMode.value === 'create') {
      await axios.post('/productos', dataToSend);
      alert('Producto creado exitosamente');
    } else if (modalMode.value === 'edit') {
      await axios.put(`/productos/${selectedProduct.value.id}`, dataToSend);
      alert('Producto actualizado exitosamente');
    }
    showFormModal.value = false;
    await fetchProductos();
  } catch (error) {
    console.error('Error:', error);
    alert('Error al guardar el producto');
  }
};

const confirmarEliminacion = (producto) => {
  selectedProduct.value = producto;
  showDeleteModal.value = true;
};

const deleteProducto = async () => {
  try {
    await axios.delete(`/productos/${selectedProduct.value.id}`);
    showDeleteModal.value = false;
    selectedProduct.value = null;
    alert('Producto eliminado exitosamente');
    await fetchProductos();
  } catch (error) {
    console.error('Error:', error);
    alert('Error al eliminar el producto');
  }
};

// Computed properties
// Ya no filtramos en cliente, usamos los datos directos del servidor
const paginatedProductos = computed(() => productos.value);
const filteredProductos = computed(() => productos.value); // Alias for compatibility if needed

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value);
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage.value, totalItems.value));

// Agregar funciones de paginación
const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchProductos();
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetchProductos();
  }
};

const goToPage = (page) => {
  currentPage.value = page;
  fetchProductos();
};

// Agregar watch para resetear la página en búsqueda
let searchTimeout;
watch(searchTerm, (newVal) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        currentPage.value = 1;
        fetchProductos();
    }, 500);
});

// Agregar watch para items por página
watch(itemsPerPage, () => {
  currentPage.value = 1;
  fetchProductos();
});

// Agregar la función openCreateModal
const openCreateModal = () => {
  modalMode.value = 'create';
  formData.value = {
    nombre: '',
    stock: 0,
    precioCosto: 0,
    precioVenta: 0,
    fechaAdquisicion: ''
  };
  showFormModal.value = true;
};

onMounted(() => {
  fetchProductos();
  
  socket.on('stockUpdated', () => {
    fetchProductos();
  });
});

defineExpose({
  openViewModal,
  openEditModal,
  openCreateModal
});
</script>

<style scoped>
.datatable-input {
  @apply block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500;
}
</style>