import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../App.vue'
import LoginView from '@/views/LoginView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/dashboard',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/home',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/', redirect: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {path: '/login', component: LoginView },
  ],
})

export default router
