<script setup>
import { RouterView, useRoute } from 'vue-router';
import { ref, watch } from 'vue';
import Navbar from './components/Navbar.vue';
import Sidebar from './components/Sidebar.vue';

const route = useRoute();
const isSidebarOpen = ref(false);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const closeSidebar = () => {
  isSidebarOpen.value = false;
};

watch(
  () => route.path,
  () => {
    closeSidebar();
  }
);
</script>

<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-700" v-if="route.path !== '/login'">
    <Navbar @toggle-sidebar="toggleSidebar" />
    <Sidebar :isOpen="isSidebarOpen" @close-mobile="closeSidebar" />

    <div
      v-if="isSidebarOpen"
      @click="closeSidebar"
      class="fixed inset-0 top-16 z-30 bg-black/40 sm:hidden"
      aria-hidden="true"
    />

    <main class="min-w-0 flex-1 pt-16 sm:ml-64">
      <div class="px-3 py-4 sm:px-4 sm:py-6 lg:px-6">
        <RouterView />
      </div>
    </main>
  </div>
  <RouterView v-else />
</template>

<style scoped>

</style>
