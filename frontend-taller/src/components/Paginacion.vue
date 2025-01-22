<template>
  <div class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
    <div class="flex flex-1 justify-between sm:hidden">
      <button
        @click="$emit('cambiarPagina', currentPage - 1)"
        :disabled="currentPage === 1"
        class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Anterior
      </button>
      <button
        @click="$emit('cambiarPagina', currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Siguiente
      </button>
    </div>
    <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
      <div>
        <p class="text-sm text-gray-700">
          Mostrando
          <span class="font-medium">{{ ((currentPage - 1) * itemsPerPage) + 1 }}</span>
          a
          <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, totalItems) }}</span>
          de
          <span class="font-medium">{{ totalItems }}</span>
          resultados
        </p>
      </div>
      <div>
        <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
          <button
            v-for="page in totalPages"
            :key="page"
            @click="$emit('cambiarPagina', page)"
            :class="[
              page === currentPage ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500',
              'relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
            ]"
          >
            {{ page }}
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  itemsPerPage: {
    type: Number,
    required: true
  },
  totalItems: {
    type: Number,
    required: true
  }
});

const totalPages = computed(() => Math.ceil(props.totalItems / props.itemsPerPage));

defineEmits(['cambiarPagina']);
</script> 