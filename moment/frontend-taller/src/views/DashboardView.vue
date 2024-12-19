<template>
  <div class="flex flex-col h-screen">
    <header class="bg-blue-600 text-white p-4">
      <h1 class="text-2xl font-bold">Panel de Control</h1>
    </header>
    <nav class="bg-gray-800 text-white p-4">
      <router-link to="/clientes" class="mr-4 hover:text-blue-300">Clientes</router-link>
      <router-link to="/vehiculos" class="mr-4 hover:text-blue-300">Vehículos</router-link>
      <router-link to="/inventario" class="mr-4 hover:text-blue-300">Inventario</router-link>
      <router-link to="/reportes" class="hover:text-blue-300">Reportes</router-link>
    </nav>
    <main class="flex-1 p-4 bg-gray-100">
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: 'Dashboard',
};
</script>

<style>
/* Puedes agregar estilos adicionales aquí si es necesario */
</style>
  