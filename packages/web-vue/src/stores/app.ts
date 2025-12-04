import { defineStore } from 'pinia';
import type { Map as LeafletMap } from 'leaflet';

export type User = { id: string; name: string } | null;
export type MapCenter = [number, number];

type Alert = { id: string; message: string; type?: 'success'|'error'|'warning' };

export const useAppStore = defineStore('app', {
  state: () => ({
    // sessions
    user: null as User,
    token: '' as string,
    userFull: null as any,
    // mapa
    center: [24.790277777778, -107.38777777778] as MapCenter,
    selectedFeature: null as any | null,
    map: null as LeafletMap | null,
    // preserve initial map view so we can reset on sidebar close
    initialMapCenter: null as MapCenter | null,
    initialMapZoom: null as number | null,
    objetosPorId: {} as Record<string, any>,
    objetoSeleccionado: null as any | null,
    // routing
    routeFeature: null as any | null,
    routeMarkers: [] as { lat:number; lng:number; etiqueta?:string }[],
    pisoSeleccionado: 1 as number | undefined,
    campusId: '' as string,
    // UI
    alerts: [] as Alert[],

    swipeableVisible: null as string | null,
    itemBusquedaSelecionado: null as any | null,
    // timestamp (ms) when the swipeable was last closed to avoid immediate reopen
    lastSwipeableClosedAt: null as number | null,

    busqueda: '' as string,

    isWelcomeVisible: true as boolean,
    isTourVisible: true as boolean,
  }),
  actions: {
    /** Sesiones */
    setUser(user: User, token?: string) {
      this.user = user;
      if (token) {
        this.token = token;
        localStorage.setItem('UNIMAP_TOKEN', token);
        localStorage.setItem('token', token);
      }
    },
    loadToken() {
      const t = localStorage.getItem('token') || localStorage.getItem('UNIMAP_TOKEN') || '';
      this.token = t;
    },
    logout() {
      this.user = null;
      this.token = '';
      this.userFull = null;
      localStorage.removeItem('UNIMAP_TOKEN');
      localStorage.removeItem('token');
    },

    setUserFull(userFull: any | null) { this.userFull = userFull; },

    /** Mapa & objetos */
    setCenter(c: MapCenter) { this.center = c; },
    setMap(m: LeafletMap) {
      this.map = m;
      try {
        if (!this.initialMapCenter) {
          const c = (m as any).getCenter?.();
          const z = (m as any).getZoom?.();
          if (c && typeof c.lat === 'number' && typeof c.lng === 'number') {
            this.initialMapCenter = [c.lat, c.lng];
          }
          if (typeof z === 'number') this.initialMapZoom = z;
        }
      } catch (e) {
        console.debug('[app] setMap initial view capture error', e);
      }
    },
    selectFeature(f: any | null) { this.selectedFeature = f; },
    setObjetosPorId(objetos: any[]) {
      const objetosPorId = objetos.reduce((acc: Record<string, any>, objeto: any) => {
        acc[objeto._id] = objeto;
        return acc;
      }, {});
      this.objetosPorId = objetosPorId;
    },
    setObjetoSeleccionado(objeto: any | null) { this.objetoSeleccionado = objeto; },
    setRouteFeature(f: any | null) { this.routeFeature = f; },
    setRouteMarkers(m: { lat:number; lng:number; etiqueta?:string }[]) { this.routeMarkers = m; },
    setPisoSeleccionado(piso: number) { this.pisoSeleccionado = piso; },
    setCampusId(campusId: string) { this.campusId = campusId; },
    abrirSwipeable(tipo: string, itemBusqueda: any | null) { this.swipeableVisible = tipo; this.itemBusquedaSelecionado = itemBusqueda; },
    cerrarSwipeable() {
      const prev = this.swipeableVisible;
      this.swipeableVisible = null;
      this.itemBusquedaSelecionado = null;
      this.lastSwipeableClosedAt = Date.now();
      // also clear selected feature / objeto so UI that depends on them hides
      try {
        this.selectFeature(null);
        this.setObjetoSeleccionado(null);
      } catch (e) {
        console.debug('[app] cerrarSwipeable: error clearing selection', e);
      }
      // If a sidebar with objeto info was closed, reset map to initial view
      try {
        if (this.map && this.initialMapCenter) {
          // small timeout to allow sidebar animation to finish and map to repaint
          setTimeout(() => {
            try {
              (this.map as any).invalidateSize?.();
              (this.map as any).setView(this.initialMapCenter, this.initialMapZoom ?? 18);
              console.log('[app] cerrarSwipeable: map reset to initial view', { center: this.initialMapCenter, zoom: this.initialMapZoom });
            } catch (e) {
              console.debug('[app] cerrarSwipeable: error resetting map view', e);
            }
          }, 220);
        }
      } catch (e) {
        console.debug('[app] cerrarSwipeable unexpected error', e);
      }
    },
    abrirSwipeableObjeto(objetoId: string, zoom = 18) {
      let objeto = this.objetosPorId?.[objetoId];
      
      if (!objeto) {
        for (const k in this.objetosPorId) {
          const o = this.objetosPorId[k];
          if (!o) continue;
          if (String(k) === String(objetoId) || String(o._id) === String(objetoId) || String(o.qgisId) === String(objetoId)) {
            objeto = o;
            break;
          }
        }
      }

      if (!objeto) {
        console.debug('[app] abrirSwipeableObjeto: objeto not found, setting placeholder to open UI', objetoId);
        // Only open the swipeable immediately if the user hasn't just closed it
        const now = Date.now();
        const closedAt = this.lastSwipeableClosedAt ?? 0;
        const reopenThreshold = 800; // ms
        if (!closedAt || now - closedAt > reopenThreshold) {
          this.swipeableVisible = 'objetos';
        } else {
          console.log('[app] abrirSwipeableObjeto: suppressing immediate reopen (recently closed)', { objetoId, sinceClosedMs: now - closedAt });
        }
        this.objetoSeleccionado = { _id: objetoId, nombre: `Objeto ${objetoId}`, cargando: true } as any;
        return;
      }

      // helper: gather all [lat,lng] points from a GeoJSON geometry
      function gatherLatLngs(geom: any, acc: Array<[number, number]>) {
        if (!geom) return;
        const t = geom.type;
        const c = geom.coordinates;
        if (!c) return;
        function walk(coords: any) {
          if (!coords) return;
          if (typeof coords[0] === 'number') {
            // GeoJSON coordinate: [lng, lat]
            const lng = coords[0]; const lat = coords[1];
            acc.push([lat, lng]);
            return;
          }
          for (const inner of coords) walk(inner);
        }
        walk(c);
      }

      function normalizeCentroide(centroide: any) {
        if (!centroide) return null;
        if (Array.isArray(centroide) && centroide.length >= 2) return centroide;
        if (centroide && typeof centroide === 'object' && 'lat' in centroide && 'lng' in centroide) return [centroide.lat, centroide.lng];
        return null;
      }

      try {
        console.log('[app] abrirSwipeableObjeto called', { objetoId, hasMap: !!this.map, centroide: objeto?.centroide });
        if (this.map && objeto) {
          // If geometry exists and is not a point, compute bounds and fitBounds
          const geom = objeto.geometria ?? objeto.geometriaGeojson ?? null;
          try {
            if (geom && geom.type && geom.type !== 'Point') {
              const pts: Array<[number, number]> = [];
              gatherLatLngs(geom, pts);
              if (pts.length) {
                let minLat = Infinity, minLng = Infinity, maxLat = -Infinity, maxLng = -Infinity;
                for (const [lat, lng] of pts) {
                  if (lat < minLat) minLat = lat;
                  if (lng < minLng) minLng = lng;
                  if (lat > maxLat) maxLat = lat;
                  if (lng > maxLng) maxLng = lng;
                }
                const bounds: any = [[minLat, minLng], [maxLat, maxLng]];
                try {
                  (this.map as any).fitBounds(bounds, { padding: [60, 60] });
                  console.log('[app] abrirSwipeableObjeto: fitBounds invoked', { bounds });
                } catch (e) {
                  console.log('[app] abrirSwipeableObjeto fitBounds error', e, { bounds });
                }
              } else {
                console.log('[app] abrirSwipeableObjeto: no coords found in geometry, falling back to centroide', { geom });
                // fallthrough to centroide handling below
                const coords = normalizeCentroide(objeto.centroide);
                if (coords) (this.map as any).flyTo(coords, zoom);
              }
            } else if (objeto.centroide) {
              const coords = normalizeCentroide(objeto.centroide);
              if (coords) {
                (this.map as any).flyTo(coords, zoom);
                console.log('[app] abrirSwipeableObjeto: flyTo invoked', { coords, zoom });
              }
            } else {
              console.log('[app] abrirSwipeableObjeto: objeto has no geometry or centroide to zoom to', { objeto });
            }
          } catch (e) {
            console.log('[app] abrirSwipeableObjeto geometry handling error', e, { objeto });
          }
        } else {
          console.log('[app] abrirSwipeableObjeto: map not set or objeto missing, skipping zoom', { hasMap: !!this.map, objeto });
        }
      } catch (e) {
        console.log('[app] abrirSwipeableObjeto unexpected error', e);
      }
      // Set the swipeable visible only if user hasn't just closed it
      try {
        const now = Date.now();
        const closedAt = this.lastSwipeableClosedAt ?? 0;
        const reopenThreshold = 800; // ms
        if (!closedAt || now - closedAt > reopenThreshold) {
          this.swipeableVisible = 'objetos';
        } else {
          console.log('[app] abrirSwipeableObjeto: suppressing reopen after recent close', { objetoId, sinceClosedMs: now - closedAt });
        }
      } catch (e) {
        console.debug('[app] abrirSwipeableObjeto reopen check error', e);
      }
      this.objetoSeleccionado = objeto;
    },

    /** Busqueda & UI */
    setBusqueda(b: string) { this.busqueda = b; },
    pushAlert(a: Omit<Alert,'id'>){ 
      const id = Math.random().toString(36).slice(2);
      this.alerts.push({ id, ...a });
      setTimeout(()=> this.dismissAlert(id), 4000);
    },
    dismissAlert(id: string){ this.alerts = this.alerts.filter((x: Alert)=>x.id!==id); },

    
    setWelcomeVisible(v: boolean){ this.isWelcomeVisible = v; },
    setTourVisible(v: boolean){
      this.isTourVisible = v;
      if (!v) localStorage.setItem('tour_shown','1');
    },
  }
});
