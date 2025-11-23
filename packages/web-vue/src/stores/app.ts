import { defineStore } from 'pinia';
import type { Map as LeafletMap } from 'leaflet';

export type User = { id: string; name: string } | null;
export type MapCenter = [number, number];

type Alert = { id: string; message: string; type?: 'success'|'error'|'warning' };

// Minimal migration of Zustand global state to Pinia for Vue app.
export const useAppStore = defineStore('app', {
  state: () => ({
    // session
    user: null as User,
    token: '' as string,
    // map
    center: [24.790277777778, -107.38777777778] as MapCenter,
    selectedFeature: null as any | null,
    map: null as LeafletMap | null,
    objetosPorId: {} as Record<string, any>,
    objetoSeleccionado: null as any | null,
    pisoSeleccionado: 1 as number | undefined,
    campusId: '' as string,
    // UI
    alerts: [] as Alert[],
    // swipeable / drawers
    swipeableVisible: null as string | null,
    itemBusquedaSelecionado: null as any | null,
    // search
    busqueda: '' as string,
    // onboarding
    isWelcomeVisible: true as boolean,
    isTourVisible: true as boolean,
  }),
  actions: {
    /** Session related */
    setUser(user: User, token?: string) {
      this.user = user;
      if (token) {
        this.token = token;
        localStorage.setItem('UNIMAP_TOKEN', token);
      }
    },
    loadToken() {
      const t = localStorage.getItem('UNIMAP_TOKEN') || localStorage.getItem('token') || '';
      this.token = t;
    },
    logout() {
      this.user = null;
      this.token = '';
      localStorage.removeItem('UNIMAP_TOKEN');
    },

    /** Map & objetos */
    setCenter(c: MapCenter) { this.center = c; },
    setMap(m: LeafletMap) { this.map = m; },
    selectFeature(f: any | null) { this.selectedFeature = f; },
    setObjetosPorId(objetos: any[]) {
      const objetosPorId = objetos.reduce((acc: Record<string, any>, objeto: any) => {
        acc[objeto._id] = objeto;
        return acc;
      }, {});
      this.objetosPorId = objetosPorId;
    },
    setObjetoSeleccionado(objeto: any | null) { this.objetoSeleccionado = objeto; },
    setPisoSeleccionado(piso: number) { this.pisoSeleccionado = piso; },
    setCampusId(campusId: string) { this.campusId = campusId; },
    abrirSwipeable(tipo: string, itemBusqueda: any | null) { this.swipeableVisible = tipo; this.itemBusquedaSelecionado = itemBusqueda; },
    cerrarSwipeable() { this.swipeableVisible = null; this.itemBusquedaSelecionado = null; },
    abrirSwipeableObjeto(objetoId: string, zoom = 18) {
      const objeto = this.objetosPorId?.[objetoId];
      if (!this.map || !objeto) return;
      // @ts-ignore flyTo exists on Leaflet map
      (this.map as any).flyTo(objeto.centroide, zoom);
      this.swipeableVisible = 'objetos';
      this.objetoSeleccionado = objeto;
    },

    /** Search & UI */
    setBusqueda(b: string) { this.busqueda = b; },
    pushAlert(a: Omit<Alert,'id'>){ 
      const id = Math.random().toString(36).slice(2);
      this.alerts.push({ id, ...a });
      setTimeout(()=> this.dismissAlert(id), 4000);
    },
    dismissAlert(id: string){ this.alerts = this.alerts.filter((x: Alert)=>x.id!==id); },

    /** Onboarding */
    setWelcomeVisible(v: boolean){ this.isWelcomeVisible = v; },
    setTourVisible(v: boolean){
      this.isTourVisible = v;
      if (!v) localStorage.setItem('tour_shown','1');
    },
  }
});
