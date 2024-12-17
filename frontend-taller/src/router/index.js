import Vue from 'vue';
import VueRouter from 'vue-router';

import Dashboard from '@/views/Dashboard.vue';
import Login from '@/views/Login.vue';
import Clientes from '@/views/Clientes.vue';
import Vehiculos from '@/views/Vehiculos.vue';
import Inventario from '@/views/Inventario.vue';
import Reportes from '@/views/Reportes.vue';

Vue.use(VueRouter);

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/dashboard', component: Dashboard },
  { path: '/clientes', component: Clientes },
  { path: '/vehiculos', component: Vehiculos },
  { path: '/inventario', component: Inventario },
  { path: '/reportes', component: Reportes },
];

const router = new VueRouter({
  mode: 'history',
  routes,
});

export default router;
