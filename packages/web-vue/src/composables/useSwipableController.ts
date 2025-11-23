import { computed } from 'vue';
import { useAppStore } from '@/stores/app';

export function useSwipableController() {
  const app = useAppStore();

  const visible = computed(() => app.swipeableVisible);
  const item = computed(() => app.itemBusquedaSelecionado ?? app.objetoSeleccionado);

  function open(tipo: string, itemBusqueda: any | null = null) { app.abrirSwipeable(tipo, itemBusqueda); }
  function close() { app.cerrarSwipeable(); }
  function openObjeto(id: string) { app.abrirSwipeableObjeto(id); }

  return { visible, item, open, close, openObjeto };
}
