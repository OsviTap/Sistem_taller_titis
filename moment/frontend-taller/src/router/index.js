import Vue from 'vue';
import VueRouter from 'vue-router';

import DashboardView from '@/views/DashboardView.vue';
import LoginView from '@/views/LoginView.vue';
import ClientesView from '@/views/ClientesView.vue';
import VehiculosView from '@/views/VehiculosView.vue';
import InventarioView from '@/views/InventarioView.vue';
import ReportesView from '@/views/ReportesView.vue';


Vue.use(VueRouter);

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginView },
  { path: '/dashboard', component: DashboardView},
  { path: '/clientes', component: ClientesView },
  { path: '/vehiculos', component: VehiculosView },
  { path: '/inventario', component: InventarioView },
  { path: '/reportes', component: ReportesView },
 
];

const router = new VueRouter({
  mode: 'history',
  routes,
});

export default router;
