<script setup>
import { RouterLink, RouterView, useRoute } from 'vue-router'

const route = useRoute();

</script>

<script>
import Navbar from './components/Navbar.vue';
import Sidebar from './components/Sidebar.vue';

export default {
  components: { Navbar, Sidebar },
  data() {
    return {
      isSidebarOpen: false,
    };
  },
  methods: {
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen;
    },
  },
};
</script>

<template>
 <div class="flex flex-col h-screen" v-if="route.path !== '/login'">
    <Navbar @toggle-sidebar="toggleSidebar" />
    <Sidebar :isOpen="isSidebarOpen" />
    <main class="sm:ml-64 flex-1 mt-5 p-12 bg-gray-100 transition-transform">
      <RouterView />
    </main>
  </div>
  <RouterView v-else />
</template>

<style scoped>

</style>
