import { defineStore } from 'pinia';

export const useGlobal = defineStore('global', {
  state: () => ({
    user: null as null | { _id: string; nombre: string },
    token: '' as string,
    objetoSeleccionado: null as any,
    pisoSeleccionado: 1,
    busqueda: '',
  }),
  actions: {
    setSession(user: any, token: string) {
      this.user = user;
      this.token = token;
      localStorage.setItem('token', token);
    },
    logOut() {
      this.user = null;
      this.token = '';
      localStorage.removeItem('token');
    },
    setObjetoSeleccionado(o: any) { this.objetoSeleccionado = o; },
    setBusqueda(s: string) { this.busqueda = s; },
    setPiso(p: number) { this.pisoSeleccionado = p; },
  }
});
