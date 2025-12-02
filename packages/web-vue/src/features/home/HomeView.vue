<script setup lang="ts">
import UnimapMap from '@/components/map/UnimapMap.vue';
import CategorySelector from '@/components/ui/CategorySelector.vue';
import FloorSelector from '@/components/ui/FloorSelector.vue';
import SearchField from '@/components/ui/SearchField.vue';
import Sidebar from '@/components/ui/Sidebar.vue';
import Alerts from '@/components/ui/Alerts.vue';
import { ref, onMounted, computed } from 'vue';
import { useAppStore } from '@/stores/app';
import type { StyleFunction } from 'leaflet';
import { buildGraphFromPasillos, nearestNodeId, pathToGeoJson } from '@/lib/routing/buildGraph';
import { aStar } from '@/lib/routing/graph';
import { useObjetos } from '@/composables/useObjetos';

// ===== env y datos =====
const rawCenter = import.meta.env.VITE_CENTRO_DEFAULT_MAPA ?? '24.790277777778,-107.38777777778';
const centroDefault = rawCenter.split(',').map(Number) as [number, number];
const GEOJSON_CONTORNO = import.meta.env.VITE_GEOJSON_PATH ?? '/data/Tec_Contorno.geojson';
// Soporte para extras separados por coma: 
// VITE_GEOJSON_EXTRA="/data/Biblioteca.geojson,/data/Otro.geojson"
const GEOJSON_EXTRA = (import.meta.env.VITE_GEOJSON_EXTRA as string | undefined)?.split(',').map(s => s.trim()).filter(Boolean) ?? [];
const GEOJSON_PASILLOS = import.meta.env.VITE_GEOJSON_PASILLOS ?? '/data/pasillos-tec.geojson';

const TILE_MIN_ZOOM = Number(import.meta.env.VITE_TILE_MIN_ZOOM ?? 16);
const TILE_MAX_ZOOM = Number(import.meta.env.VITE_TILE_MAX_ZOOM ?? 21);
const TILE_MAX_NATIVE = Number(import.meta.env.VITE_TILE_MAX_NATIVE_ZOOM ?? 20);

// ===== estado =====
const app = useAppStore();
const center = ref<[number, number]>(centroDefault);
const contorno = ref<any | null>(null);
const pasillos = ref<any | null>(null);
const routeFeature = ref<any | null>(null);
const extras = ref<any[]>([]);

// objetos composable: filtering and normalization
const { normalizeFromGeoJson, objetosEnCapa, openObjeto } = useObjetos();

const routeFc = computed(() => routeFeature.value
  ? { type: 'FeatureCollection', features: [routeFeature.value] }
  : null
);
const routeMarkers = ref<{ lat: number; lng: number; etiqueta?: string }[]>([]);
const objetosMarkers = computed(() => {
  const objs = objetosEnCapa?.value ?? [];
  return objs
    .map((o: any) => (o?.centroide ? { lat: o.centroide.lat, lng: o.centroide.lng, etiqueta: o.nombre } : null))
    .filter(Boolean) as { lat: number; lng: number; etiqueta?: string }[];
});
const markers = computed(() => (routeMarkers.value && routeMarkers.value.length ? routeMarkers.value : objetosMarkers.value));

const objetosGeojson = computed(() => {
  const objs = objetosEnCapa?.value ?? [];
  const features = objs
    .filter((o: any) => o && o.geometria)
    .map((o: any) => ({
      type: 'Feature',
      geometry: o.geometria,
      properties: { _id: o._id, nombre: o.nombre, categoria: o.categoria?._id ?? o.categoria },
    }));
  return features.length ? { type: 'FeatureCollection', features } : null;
});

const merged = computed(() => mergeMany([contorno.value, pasillos.value, routeFc.value, objetosGeojson.value, ...extras.value]));
const constrainToCenterBounds = ref(true);
const loading = ref(false);
const errorMsg = ref('');
// Flag to temporarily enable/disable route calculation on map clicks
const routingEnabled = ref(false);
let graph: ReturnType<typeof buildGraphFromPasillos> | null = null;

function mergeMany(items: any[]) {
  const features = items
    .filter(Boolean)
    .flatMap(fc => fc.type === 'FeatureCollection' ? fc.features : [fc]);
  return features.length ? { type: 'FeatureCollection', features } : null;
}

const styleFn: StyleFunction = (feature) => {
  if (feature?.properties?.capa === 'ruta') {
    return { color: '#1976D2', weight: 5, opacity: 0.95 };
  }
  const gType = feature?.geometry?.type;
  if (gType === 'LineString' || gType === 'MultiLineString') {
    return { color: '#2e7d32', weight: 3, opacity: 0.9 }; // pasillos
  }
  const color = feature?.properties?.color ?? '#1572A1';
  return { color, weight: 2, fillColor: color, fillOpacity: 0.35 };
};

function computeCenter(g: any): [number, number] {
  const coords: number[][] = [];
  function push(a: any) { if (typeof a?.[0] === 'number') { const [lng, lat] = a; coords.push([lng, lat]); } else if (Array.isArray(a)) a.forEach(push); }
  function walk(n: any) {
    if (!n) return; if (n.type === 'FeatureCollection') n.features.forEach(walk);
    else if (n.type === 'Feature') walk(n.geometry); else if (n.coordinates) push(n.coordinates);
  }
  walk(g);
  if (!coords.length) return center.value;
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
  for (const [lng, lat] of coords) { if (lng < minLng) minLng = lng; if (lat < minLat) minLat = lat; if (lng > maxLng) maxLng = lng; if (lat > maxLat) maxLat = lat; }
  return [(minLat + maxLat) / 2, (minLng + maxLng) / 2];
}

onMounted(async () => {
  loading.value = true;
  try {
    // 1) Cargar contorno con fallback al nombre con guion bajo
    let contornoResp = await fetch(GEOJSON_CONTORNO);
    if (!contornoResp.ok) {
      // fallback común cuando el archivo real es Tec_Contorno_.geojson
      const fallbackPath = '/data/Tec_Contorno_.geojson';
      const fb = await fetch(fallbackPath);
      if (fb.ok) {
        contornoResp = fb;
        console.warn(`Usando fallback de contorno: ${fallbackPath}`);
      }
    }
    if (contornoResp.ok) {
      contorno.value = await contornoResp.json();
    } else {
      console.warn(`No se pudo cargar contorno desde ${GEOJSON_CONTORNO}`);
    }

    // 2) Cargar pasillos (obligatorio para routing)
    const b = await fetch(GEOJSON_PASILLOS);
    if (!b.ok) throw new Error(`No se pudo cargar ${GEOJSON_PASILLOS} (${b.status})`);
    pasillos.value = await b.json();

    // Normalizar GeoJSON a objetos y guardarlos en la store (para categorías/objetos interactivos)
    try {
      normalizeFromGeoJson(contorno.value);
      normalizeFromGeoJson(pasillos.value);
    } catch (e) {
      console.debug('normalizeFromGeoJson fallo:', e);
    }

    // 3) Cargar extras (ej. Biblioteca)
    if (GEOJSON_EXTRA.length) {
      const loaded = await Promise.all(
        GEOJSON_EXTRA.map(async (url) => {
          try {
            const r = await fetch(url);
            if (r.ok) return await r.json();
            console.warn(`No se pudo cargar extra ${url} (${r.status})`);
            return null;
          } catch (e) {
            console.warn(`Error cargando extra ${url}`, e);
            return null;
          }
        })
      );
      extras.value = loaded.filter(Boolean);
    }

    center.value = computeCenter(pasillos.value || contorno.value);
    graph = buildGraphFromPasillos(pasillos.value);
  } catch (e: any) {
    console.error(e);
    errorMsg.value = e?.message ?? 'Error cargando datos';
  } finally {
    loading.value = false;
  }
});

// ===== selección de origen/destino con clicks =====
const start = ref<[number, number] | null>(null);
const end = ref<[number, number] | null>(null);

async function handleMapClick(latlng: [number, number]) {
  if (!routingEnabled.value) return; // routing disabled for now
    if (!start.value) {
    start.value = latlng;
    routeMarkers.value = [{ lat: latlng[0], lng: latlng[1], etiqueta: 'Inicio' }];
    routeFeature.value = null;
    return;
  }
  if (!end.value) {
    end.value = latlng;
    routeMarkers.value = [
      { lat: start.value[0], lng: start.value[1], etiqueta: 'Inicio' },
      { lat: latlng[0], lng: latlng[1], etiqueta: 'Destino' }
    ];
    await computeRoute();
    return;
  }
  // Si ya hay ambos, reinicia
  start.value = latlng;
  end.value = null;
  routeFeature.value = null;
  routeMarkers.value = [{ lat: latlng[0], lng: latlng[1], etiqueta: 'Inicio' }];
}

async function computeRoute() {
  if (!graph || !start.value || !end.value) return;
  const s = nearestNodeId(graph, start.value[0], start.value[1]);
  const t = nearestNodeId(graph, end.value[0], end.value[1]);
  const nodePath = aStar(graph, s, t);
  if (!nodePath) {
    errorMsg.value = 'No se encontró ruta (revisa conexiones/topología)';
    routeFeature.value = null;
    return;
  }
  routeFeature.value = pathToGeoJson(graph, nodePath);
}

// abrir objeto al hacer click en su feature
function onFeatureClick(payload: { feature: any; latlng: [number, number] }) {
  try {
    console.log('[HomeView] onFeatureClick payload', payload && payload.feature && payload.feature.properties ? { id: payload.feature.properties._id ?? payload.feature.properties.id, props: payload.feature.properties } : payload);
    const id = payload?.feature?.properties?._id ?? payload?.feature?.properties?.id;
    const msg = id ? `Click objeto ${id}` : `Click objeto sin id: ${JSON.stringify(payload?.feature?.properties ?? {})}`;
    app.pushAlert({ message: msg, type: 'success' });
    if (id) openObjeto(String(id));
    else console.debug('[HomeView] feature has no id in properties', payload?.feature?.properties);
  } catch (e) {
    console.debug('onFeatureClick error', e);
  }
}
</script>

<template>
  <!-- Contenedor fijo para que el mapa siempre llene el viewport -->
  <div style="position:fixed; inset:0; display:flex; flex-direction:column;">
    <!-- controles centrados: SearchField arriba y categorías/selector debajo -->
    <div class="top-controls">
      <div class="top-controls-inner">
        <div class="controls-box">
          <div class="search-wrap">
            <SearchField width="560px" />
          </div>
          <div style="height:8px; width:100%;"></div>
          <div class="controls-row">
            <div class="category-wrap"><CategorySelector :floating="false" /></div>
            <div class="floor-wrap"><FloorSelector /></div>
          </div>
        </div>
        <div class="status-row">
          <span v-if="loading">Cargando…</span>
          <span v-if="errorMsg" style="color:#b71c1c">{{ errorMsg }}</span>
          <span v-if="start && !end">Selecciona el destino con un click en el mapa…</span>
          <span v-if="start && end">Click de nuevo para reiniciar desde un nuevo origen.</span>
        </div>
      </div>
    </div>

    <!-- mapa ocupa todo el espacio disponible -->
    <div style="flex:1 1 auto; min-height:0;">
      <UnimapMap :center="center" :geojson="merged" :markers="markers" :styleFunction="styleFn"
          :constrainToCenterBounds="true" :zoom="18" :minZoom="TILE_MIN_ZOOM" :maxZoom="TILE_MAX_ZOOM"
          :tileMaxNativeZoom="TILE_MAX_NATIVE" @map-click="handleMapClick" @feature-click="onFeatureClick" />
    </div>
    <Sidebar />
    <Alerts />
  </div>
</template>

<style scoped>
.top-controls{ position:absolute; top:8px; left:8px; right:8px; z-index:1000; display:flex; justify-content:center; pointer-events:auto }
.top-controls-inner{ background:rgba(255,255,255,0.95); padding:12px; border-radius:10px; box-shadow:0 4px 14px rgba(0,0,0,.12); display:flex; flex-direction:column; align-items:flex-start; gap:12px; max-width:100% }
.search-wrap{ width:100%; display:flex; justify-content:center }
.controls-box{ width:560px; max-width:90vw; display:flex; flex-direction:column; gap:8px }
.controls-row{ display:flex; gap:12px; align-items:center; width:100% }
.category-wrap{ flex:1 }
.floor-wrap{ width:auto }
.status-row{ margin-top:4px; display:flex; flex-direction:column; gap:4px; align-items:flex-start }

@media (max-width:640px){
  .top-controls-inner{ padding:10px; gap:10px; width:calc(100vw - 24px) }
  .controls-box{ width:100% }
  .controls-row{ flex-direction:column; align-items:stretch }
  .controls-row > *{ width:100% }
  .status-row{ align-items:flex-start }
}
</style>
