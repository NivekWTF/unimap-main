<script setup lang="ts">
import { ref, onUnmounted, watch, computed } from 'vue';
import L from 'leaflet';
import { useAppStore } from '@/stores/app';

const app = useAppStore();
const locating = ref(false);
// reactive indicator for map availability
const mapReady = computed(() => !!app.map);
// store last known position until the map is ready (kept for safety)
let lastPos: GeolocationPosition | null = null;
// avoid pushing the same waiting/info toast multiple times
const notifiedMapLoading = ref(false);
// track last toast time for location messages to avoid spamming
const lastLocationToastAt = ref<number | null>(null);

// helper to attach marker/circle when map becomes available
function attachPosition(pos: GeolocationPosition) {
  const lat = pos.coords.latitude;
  const lng = pos.coords.longitude;
  const acc = pos.coords.accuracy ?? 5;
  const map = app.map as any;
  if (!map) return false;

  try {
    // Ensure a dedicated pane exists so the locate visuals render above polygons
    try {
      if (map && map.createPane && !map.getPane('locatePane')) {
        const p = map.createPane('locatePane');
        // put it above overlayPane/markerPane
        (p as HTMLElement).style.zIndex = '650';
      }
    } catch (e) {
      console.debug('[LocateControl] createPane error', e);
    }

    if (!marker) {
      // Use a divIcon so we can style a native-looking orange dot with halo
      const icon = L.divIcon({
        className: 'locate-divicon',
        html: `<span class="locate-dot"></span>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        // ensure icon is placed in our pane
        pane: 'locatePane',
      } as any);
      marker = L.marker([lat, lng], { icon, interactive: false, pane: 'locatePane' } as any).addTo(map);
    } else {
      marker.setLatLng([lat, lng]);
      try { (marker as any).options.pane = 'locatePane'; } catch (e) { /* ignore */ }
      try { marker.addTo(map); } catch (e) { /* ignore */ }
    }

    if (!circle) {
      // Put the accuracy circle into our custom locatePane so it's above polygons
      circle = L.circle([lat, lng], {
        pane: (map.getPane && map.getPane('locatePane')) ? 'locatePane' : undefined,
        radius: acc,
        color: '#ff9800',
        fillColor: '#ff9800',
        fillOpacity: 0.22,
        weight: 0,
        interactive: false,
      }).addTo(map);
      try { circle.bringToFront(); } catch (e) { /* ignore */ }
      console.log('[LocateControl] accuracy circle created', { lat, lng, acc });
    } else {
      circle.setLatLng([lat, lng]);
      circle.setRadius(acc);
      try { circle.bringToFront(); } catch (e) { /* ignore */ }
    }

    try { map.flyTo([lat, lng], 18); } catch (e) { map.setView([lat, lng], 18); }
    // Inform the developer that the marker/circle were placed
    console.log(`[LocateControl] posición fijada en mapa: lat=${lat} lng=${lng} acc=${acc}m`);
    // Show location in a toast, but limit frequency to once every 5 seconds
    try {
      const now = Date.now();
      if (!lastLocationToastAt.value || now - lastLocationToastAt.value > 5000) {
        const msg = `Ubicación: ${lat.toFixed(6)}, ${lng.toFixed(6)} (±${Math.round(acc)} m)`;
        app.pushAlert({ message: msg, type: 'success' });
        lastLocationToastAt.value = now;
      }
    } catch (e) {
      console.debug('[LocateControl] error pushing location toast', e);
    }
    return true;
  } catch (e) {
    console.debug('[LocateControl] attachPosition error', e);
    return false;
  }
}

// watch map availability and attach buffered position when ready
watch(mapReady, (ready) => {
  if (ready) {
    console.debug('[LocateControl] map became available');
    if (lastPos) {
      const ok = attachPosition(lastPos);
      if (ok) lastPos = null;
    }
  }
});
let watchId: number | null = null;
let marker: L.Marker | null = null;
let circle: L.Circle | null = null;

function handleSuccess(pos: GeolocationPosition) {
  const lat = pos.coords.latitude;
  const lng = pos.coords.longitude;
  const acc = pos.coords.accuracy ?? 5;
  const map = app.map as any;
  // Always log the raw geolocation result so it's visible in browser console
  console.log(`[LocateControl] geolocation success: lat=${lat} lng=${lng} acc=${acc}m`);
  // Push a location toast immediately (rate-limited) so mobile sees the coordinate
  try {
    const now = Date.now();
    if (!lastLocationToastAt.value || now - lastLocationToastAt.value > 5000) {
      const msg = `Ubicación: ${lat.toFixed(6)}, ${lng.toFixed(6)} (±${Math.round(acc)} m)`;
      console.log('[LocateControl] pushing immediate location toast', msg);
      app.pushAlert({ message: msg, type: 'success' });
      lastLocationToastAt.value = now;
    }
  } catch (e) {
    console.debug('[LocateControl] error pushing immediate location toast', e);
  }
  // if map isn't ready yet, buffer the position for later attachment
  if (!map) {
    lastPos = pos;
    console.debug('[LocateControl] buffering position until map ready');
    return;
  }

  // attach immediately if map exists
  attachPosition(pos);
}

function handleError(err: GeolocationPositionError) {
  console.debug('[LocateControl] geolocation error', err);
  app.pushAlert({ message: `Error de geolocalización: ${err.message}`, type: 'error' });
  stopLocating();
}

function startLocating() {
  if (!('geolocation' in navigator)) {
    app.pushAlert({ message: 'Geolocalización no soportada por este navegador', type: 'error' });
    return;
  }
  if (locating.value) return;
  // If the map hasn't been mounted yet, avoid starting geolocation to prevent
  // repeated/wrong-toasts and confusing state. Ask the user to try again.
  if (!mapReady.value) {
    // notify once while map is loading
    if (!notifiedMapLoading.value) {
      app.pushAlert({ message: 'El mapa aún se está cargando. Intenta nuevamente en unos segundos.', type: 'warning' });
      notifiedMapLoading.value = true;
    }
    return;
  }

  try {
    watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 10000,
    }) as unknown as number;
    locating.value = true;
    app.pushAlert({ message: 'Geolocalización activada', type: 'success' });
  } catch (e) {
    app.pushAlert({ message: 'No se pudo iniciar geolocalización', type: 'error' });
  }
}

function stopLocating() {
  if (watchId !== null) {
    try { navigator.geolocation.clearWatch(watchId); } catch (e) { /* ignore */ }
    watchId = null;
  }
  locating.value = false;
  const map = app.map as any;
  try {
    if (marker && map) { map.removeLayer(marker); marker = null; }
    if (circle && map) { map.removeLayer(circle); circle = null; }
  } catch (e) {
    console.debug('[LocateControl] error removing layers', e);
  }
  app.pushAlert({ message: 'Geolocalización desactivada', type: 'success' });
}

onUnmounted(() => {
  stopLocating();
});
</script>

<template>
  <div class="locate-control">
    <button
      class="locate-btn"
      :disabled="!mapReady && !locating"
      @click="locating ? stopLocating() : startLocating()"
      :title="!mapReady && !locating ? 'El mapa se está cargando' : (locating ? 'Detener ubicación' : 'Mostrar mi ubicación')"
    >
      <span v-if="!locating">📍</span>
      <span v-else>⛔</span>
    </button>
  </div>
</template>

<style scoped>
.locate-control { position: absolute; top: 10px; right: 10px; z-index: 1200; }
.locate-btn { background: white; border-radius: 6px; border: 1px solid #ccc; padding: 6px 8px; cursor: pointer; box-shadow: 0 1px 4px rgba(0,0,0,0.3); }
.locate-btn:hover { background:#f7f7f7 }
.locate-btn:disabled { opacity: 0.6; cursor: not-allowed }

/* Styles for the blue location dot (similar to Google Maps) */
.locate-divicon { display:flex; align-items:center; justify-content:center; }
.locate-divicon .locate-dot { position: relative; width: 14px; height: 14px; border-radius: 50%; background: #ff9800; border: 2px solid white; box-shadow: 0 0 0 6px rgba(255,152,0,0.12), 0 0 6px rgba(255,152,0,0.35); }
.locate-divicon .locate-dot::after { content: ''; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 100%; height: 100%; border-radius: 50%; background: rgba(255,152,0,0.18); animation: locate-pulse 2s infinite; }
@keyframes locate-pulse { 0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.9 } 70% { transform: translate(-50%, -50%) scale(2.2); opacity: 0 } 100% { opacity: 0 } }
</style>
