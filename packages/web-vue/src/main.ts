import './assets/main.css'
import 'leaflet/dist/leaflet.css';

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useAppStore } from './stores/app';
import { trpc } from './lib/trpc';
import { VueQueryPlugin } from '@tanstack/vue-query';
import { queryClient } from './lib/queryClient';

import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(VueQueryPlugin, { queryClient });

const pinia = createPinia();
app.use(pinia)
app.use(router)

// Restore session token and fetch current user if token exists
try {
	const store = useAppStore();
	store.loadToken();
	const token = store.token || localStorage.getItem('token') || localStorage.getItem('UNIMAP_TOKEN') || '';
	if (token) {
		// ensure token is present for trpc fetch headers
		localStorage.setItem('token', token);
		(async () => {
			try {
				const res = await (trpc as any).sesiones.revalidarCliente.mutate({ token });
				const usuario = res?.usuario ?? null;
				const nuevoToken = res?.token ?? token;
				if (usuario) {
					store.setUser({ id: usuario._id ?? usuario.id ?? usuario.username, name: usuario.nombres ?? usuario.name ?? usuario.username }, nuevoToken);
					store.setUserFull(usuario);
					localStorage.setItem('token', nuevoToken);
					localStorage.setItem('UNIMAP_TOKEN', nuevoToken);
				}
			} catch (e) {
				store.logout();
				store.setUserFull(null);
			}
		})();
	}
} catch (e) {
	console.debug('[main] session restore error', e);
}

app.mount('#app')
