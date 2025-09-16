import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from '@/features/home/HomeView.vue';

export default createRouter({
  history: createWebHashHistory(),
  routes: [{ path: '/', name: 'home', component: HomeView }],
});
