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
    if (!marker) {
      // Use a divIcon so we can style a native-looking blue dot with halo
      const icon = L.divIcon({
        className: 'locate-divicon',
        html: `<span class="locate-dot"></span>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      marker = L.marker([lat, lng], { icon, interactive: false }).addTo(map);
    } else {
      marker.setLatLng([lat, lng]);
    }

    if (!circle) {
      circle = L.circle([lat, lng], { radius: acc, color: '#1e88e5', fillColor: '#1e88e5', fillOpacity: 0.12, weight: 0 }).addTo(map);
    } else {
      circle.setLatLng([lat, lng]);
      circle.setRadius(acc);
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
</style>
