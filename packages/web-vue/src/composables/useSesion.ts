import { onMounted } from 'vue';
import { useAppStore } from '@/stores/app';
import { trpc } from '@/lib/trpc';

export function useSession(){
  const app = useAppStore();
  onMounted(async ()=>{
    app.loadToken();
    const token = app.token || localStorage.getItem('token') || localStorage.getItem('UNIMAP_TOKEN');
    if (token) {
      try {
        // try to revalidate session with backend
        const resp = await (trpc as any).sesiones.revalidarCliente.query();
        // resp may contain { usuario, token }
        const usuario = resp?.usuario ?? resp?.user ?? resp ?? null;
        if (usuario) {
          app.setUser({ id: usuario._id ?? usuario.id ?? usuario.username, name: usuario.nombres ?? usuario.name ?? usuario.username }, token as string);
        }
      } catch (e) {
        // silent fail — remain logged out
        console.debug('Session revalidation failed', e);
      }
    }
  });
}
