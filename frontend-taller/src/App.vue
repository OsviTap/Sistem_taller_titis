<script setup>
import { RouterLink, RouterView, useRoute } from 'vue-router'
import Navbar from './components/Navbar.vue';
import Sidebar from './components/Sidebar.vue';
const route = useRoute();
</script>

<template>
 <div class="flex flex-col h-screen" v-if="route.path !== '/login'">
    <Navbar />
    <Sidebar />
    <main class="flex-1 p-4 bg-gray-100">
      
    </main>
  </div>
  <RouterView v-else />
</template>

<style scoped>

</style>
