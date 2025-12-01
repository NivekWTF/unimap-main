import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from '@/features/home/HomeView.vue';
import LoginView from '@/views/LoginView.vue';
import RegisterView from '@/views/RegisterView.vue';
import RecuperarContraseñaView from '@/views/RecuperarContraseñaView.vue';
import AdminView from '@/views/AdminView.vue';
import CampusView from '@/views/CampusView.vue';

export default createRouter({
  history: createWebHashHistory(),
  routes: [
  { path: '/', name: 'home', component: HomeView },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/register', name: 'register', component: RegisterView },
  { path: '/Recuperar-password', name: 'recuperar-pass', component: RecuperarContraseñaView },
  { path: '/admin', name: 'Administrador', component: AdminView },
  { path: '/admin', name: 'admin', component: AdminView },
  { path: '/admin/campus', name: 'campus', component: CampusView},

  ],
});
