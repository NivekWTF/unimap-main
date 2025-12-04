<script setup lang="ts">
import UnimapMap from '@/components/map/UnimapMap.vue';
import CategorySelector from '@/components/ui/CategorySelector.vue';
import FloorSelector from '@/components/ui/FloorSelector.vue';
import SearchField from '@/components/ui/SearchField.vue';
import Sidebar from '@/components/ui/Sidebar.vue';
import Alerts from '@/components/ui/Alerts.vue';
import ProfileButton from '@/components/ui/ProfileButton.vue';
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
// Prefer rutas.geojson placed under `public/assets/data` for user-provided routes
const GEOJSON_PASILLOS = import.meta.env.VITE_GEOJSON_PASILLOS ?? '/assets/data/rutas.geojson';

const TILE_MIN_ZOOM = Number(import.meta.env.VITE_TILE_MIN_ZOOM ?? 16);
const TILE_MAX_ZOOM = Number(import.meta.env.VITE_TILE_MAX_ZOOM ?? 21);
const TILE_MAX_NATIVE = Number(import.meta.env.VITE_TILE_MAX_NATIVE_ZOOM ?? 20);

// ===== estado =====
const app = useAppStore();
const center = ref<[number, number]>(centroDefault);
const contorno = ref<any | null>(null);
const pasillos = ref<any | null>(null);
// routeFeature is stored in the global app store (app.routeFeature)
const extras = ref<any[]>([]);

// objetos composable: filtering and normalization
const { normalizeFromGeoJson, objetosEnCapa, openObjeto } = useObjetos();

const routeFc = computed(() => {
  const rf = (app as any).routeFeature;
  return rf ? { type: 'FeatureCollection', features: [rf] } : null;
});
const objetosMarkers = computed(() => {
  const objs = objetosEnCapa?.value ?? [];
  return objs
    .map((o: any) => (o?.centroide ? { lat: o.centroide.lat, lng: o.centroide.lng, etiqueta: o.nombre } : null))
    .filter(Boolean) as { lat: number; lng: number; etiqueta?: string }[];
});
const markers = computed(() => {
  const rm = (app as any).routeMarkers as Array<any> | undefined;
  return (rm && rm.length ? rm : objetosMarkers.value);
});

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

// Do NOT include `pasillos` in the merged GeoJSON shown to users.
// `pasillos` is still loaded (used to build the routing graph) but should remain hidden
// until a specific route is computed and stored in `app.routeFeature`.
const merged = computed(() => mergeMany([contorno.value, routeFc.value, objetosGeojson.value, ...extras.value]));
const constrainToCenterBounds = ref(true);
const loading = ref(false);
const errorMsg = ref('');
// Rutas se calculan automáticamente desde la ubicación del usuario (vía botón '¿Cómo llegar?').
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

    // 2) Cargar pasillos (obligatorio para routing). If the configured path fails,
    // try the common fallback `/data/rutas.geojson` where routes/pasillos are marked.
    let b = await fetch(GEOJSON_PASILLOS);
    if (!b.ok) {
      console.warn(`No se pudo cargar ${GEOJSON_PASILLOS} (${b.status}), intentando /assets/data/rutas.geojson`);
      const altPath = '/assets/data/rutas.geojson';
      const alt = await fetch(altPath);
      if (!alt.ok) throw new Error(`No se pudo cargar ninguno de: ${GEOJSON_PASILLOS}, ${altPath}`);
      b = alt;
    }
    // Validate response is JSON and not an HTML error page
    const ct = b.headers.get('content-type') || '';
    const bodyText = await b.text();
    if (!ct.includes('application/json') && bodyText.trim().startsWith('<')) {
      console.error('[HomeView] rutas fetch returned HTML (likely 404):', bodyText.slice(0,300));
      app.pushAlert({ message: 'Error cargando rutas: el servidor devolvió HTML en lugar de JSON. Revisa la ruta de `rutas.geojson`.', type: 'error' });
      throw new Error('rutas.geojson no es JSON (respuesta HTML)');
    }
    try {
      pasillos.value = JSON.parse(bodyText);
    } catch (e) {
      console.error('[HomeView] error parsing rutas.geojson:', e, bodyText.slice(0,300));
      app.pushAlert({ message: 'Error parseando rutas.geojson: JSON inválido. Revisa el archivo.', type: 'error' });
      throw e;
    }

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

// Las rutas se calculan por acción explícita desde la ubicación (ej. botón '¿Cómo llegar?').
// La selección manual por clicks queda deshabilitada para evitar confusión en móviles.

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
        <div style="width:100%; display:flex; justify-content:flex-end;">
          <ProfileButton />
        </div>
        <div style="display:flex; gap:8px; align-items:center; width:100%;">
          <div style="font-size:12px; color:#555">Rutas automáticas: usa el botón "¿Cómo llegar?" en la ficha del edificio para obtener la ruta desde tu ubicación.</div>
        </div>
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
          <span style="font-size:12px; color:#555">Las rutas se calculan automáticamente desde tu ubicación usando el botón "¿Cómo llegar?" en la ficha de un edificio.</span>
        </div>
      </div>
    </div>

    <!-- mapa ocupa todo el espacio disponible -->
    <div style="flex:1 1 auto; min-height:0;">
        <UnimapMap :center="center" :geojson="merged" :markers="markers" :styleFunction="styleFn"
          :constrainToCenterBounds="true" :zoom="18" :minZoom="TILE_MIN_ZOOM" :maxZoom="TILE_MAX_ZOOM"
          :tileMaxNativeZoom="TILE_MAX_NATIVE" @feature-click="onFeatureClick" />
    </div>
    <Sidebar />
    <Alerts />
  </div>
</template>

<style scoped>
.top-controls{ position:absolute; top:8px; left:8px; right:8px; z-index:1000; display:flex; justify-content:center; pointer-events:auto }
.top-controls-inner{ background:rgba(255,255,255,0.95); padding:6px; border-radius:10px; box-shadow:0 4px 14px rgba(0,0,0,.12); display:flex; flex-direction:column; align-items:center; gap:6px; max-width:96vw; overflow:visible; justify-content:center; z-index:2000; max-height:15vh }
.search-wrap{ width:60%; min-width:220px; display:flex; justify-content:center; position:relative; z-index:2100 }
.controls-box{ width:80%; max-width:80vw; display:flex; flex-direction:column; gap:6px; align-items:center }
.controls-row{ display:flex; gap:10px; align-items:center; width:100%; flex-wrap:wrap; justify-content:center }
.category-wrap{ flex:0 0 auto }
.floor-wrap{ width:auto }
.status-row{ margin-top:4px; display:flex; flex-direction:column; gap:4px; align-items:flex-start }

@media (max-width:640px){
  /* On small screens allow the header to expand and become scrollable so
     the SearchField dropdown and category list are not clipped. */
  .top-controls-inner{ padding:10px; gap:8px; width:calc(100vw - 24px); flex-direction:column; align-items:center; max-height:none; min-height:12vh; overflow:auto }
  .controls-box{ width:100% }
  .controls-row{ flex-direction:column; align-items:stretch }
  .controls-row > *{ width:100% }
  .status-row{ align-items:flex-start }
}
</style>
