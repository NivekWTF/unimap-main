<script setup lang="ts">
import UnimapMap from '@/components/map/UnimapMap.vue';
import { ref, onMounted, computed } from 'vue';
import type { StyleFunction } from 'leaflet';
import { buildGraphFromPasillos, nearestNodeId, pathToGeoJson } from '@/lib/routing/buildGraph';
import { aStar } from '@/lib/routing/graph';

// ===== env y datos =====
const rawCenter = import.meta.env.VITE_CENTRO_DEFAULT_MAPA ?? '24.790277777778,-107.38777777778';
const centroDefault = rawCenter.split(',').map(Number) as [number, number];
const GEOJSON_CONTORNO = import.meta.env.VITE_GEOJSON_PATH ?? '/data/Tec_Contorno.geojson';
const GEOJSON_PASILLOS  = import.meta.env.VITE_GEOJSON_PASILLOS ?? '/data/pasillos-tec.geojson';

const TILE_MIN_ZOOM = Number(import.meta.env.VITE_TILE_MIN_ZOOM ?? 16);
const TILE_MAX_ZOOM = Number(import.meta.env.VITE_TILE_MAX_ZOOM ?? 21);
const TILE_MAX_NATIVE = Number(import.meta.env.VITE_TILE_MAX_NATIVE_ZOOM ?? 20);

// ===== estado =====
const center = ref<[number, number]>(centroDefault);
const contorno = ref<any|null>(null);
const pasillos = ref<any|null>(null);
const routeFeature = ref<any|null>(null);
const merged = computed(() => mergeMany([contorno.value, pasillos.value, routeFc.value]));

const routeFc = computed(() => routeFeature.value
  ? { type:'FeatureCollection', features:[routeFeature.value] }
  : null
);
const markers = ref<{lat:number; lng:number; etiqueta?: string}[]>([]);
const constrainToCenterBounds = ref(true);
const loading = ref(false);
const errorMsg = ref('');
let graph: ReturnType<typeof buildGraphFromPasillos> | null = null;

function mergeMany(items:any[]) {
  const features = items
    .filter(Boolean)
    .flatMap(fc => fc.type === 'FeatureCollection' ? fc.features : [fc]);
  return features.length ? { type:'FeatureCollection', features } : null;
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

function computeCenter(g:any): [number, number] {
  const coords:number[][] = [];
  function push(a:any){ if (typeof a?.[0]==='number'){ const [lng,lat]=a; coords.push([lng,lat]); } else if (Array.isArray(a)) a.forEach(push); }
  function walk(n:any){ if(!n)return; if(n.type==='FeatureCollection') n.features.forEach(walk);
    else if(n.type==='Feature') walk(n.geometry); else if(n.coordinates) push(n.coordinates); }
  walk(g);
  if (!coords.length) return center.value;
  let minLng=Infinity,minLat=Infinity,maxLng=-Infinity,maxLat=-Infinity;
  for (const [lng,lat] of coords){ if(lng<minLng)minLng=lng; if(lat<minLat)minLat=lat; if(lng>maxLng)maxLng=lng; if(lat>maxLat)maxLat=lat; }
  return [(minLat+maxLat)/2,(minLng+maxLng)/2];
}

onMounted(async () => {
  loading.value = true;
  try {
    const [a,b] = await Promise.all([
      fetch(GEOJSON_CONTORNO),
      fetch(GEOJSON_PASILLOS),
    ]);
    if (a.ok) contorno.value = await a.json();
    if (!b.ok) throw new Error(`No se pudo cargar ${GEOJSON_PASILLOS} (${b.status})`);
    pasillos.value = await b.json();

    center.value = computeCenter(pasillos.value || contorno.value);
    graph = buildGraphFromPasillos(pasillos.value);
  } catch (e:any) {
    console.error(e);
    errorMsg.value = e?.message ?? 'Error cargando datos';
  } finally {
    loading.value = false;
  }
});

// ===== selección de origen/destino con clicks =====
const start = ref<[number,number] | null>(null);
const end   = ref<[number,number] | null>(null);

async function handleMapClick(latlng:[number,number]) {
  if (!start.value) {
    start.value = latlng;
    markers.value = [{ lat:latlng[0], lng:latlng[1], etiqueta:'Inicio' }];
    routeFeature.value = null;
    return;
  }
  if (!end.value) {
    end.value = latlng;
    markers.value = [
      { lat:start.value[0], lng:start.value[1], etiqueta:'Inicio' },
      { lat:latlng[0], lng:latlng[1], etiqueta:'Destino' }
    ];
    await computeRoute();
    return;
  }
  // Si ya hay ambos, reinicia
  start.value = latlng;
  end.value = null;
  routeFeature.value = null;
  markers.value = [{ lat:latlng[0], lng:latlng[1], etiqueta:'Inicio' }];
}

async function computeRoute() {
  if (!graph || !start.value || !end.value) return;
  const s = nearestNodeId(graph, start.value[0], start.value[1]);
  const t = nearestNodeId(graph, end.value[0],   end.value[1]);
  const nodePath = aStar(graph, s, t);
  if (!nodePath) {
    errorMsg.value = 'No se encontró ruta (revisa conexiones/topología)';
    routeFeature.value = null;
    return;
  }
  routeFeature.value = pathToGeoJson(graph, nodePath);
}
</script>

<template>
  <div style="height:100vh; width:100vw; display:grid; grid-template-rows:auto 1fr; gap:8px; padding:8px;">
    <div style="display:flex; flex-wrap:wrap; align-items:center; gap:12px;">
      <span v-if="loading">Cargando…</span>
      <span v-if="errorMsg" style="color:#b71c1c">{{ errorMsg }}</span>
      <span v-if="start && !end">Selecciona el destino con un click en el mapa…</span>
      <span v-if="start && end">Click de nuevo para reiniciar desde un nuevo origen.</span>
    </div>

    <div style="height:100%; width:100%;">
      <UnimapMap
        :center="center"
        :geojson="merged"
        :markers="markers"
        :styleFunction="styleFn"
        :constrainToCenterBounds="true"
        :zoom="18"
        :minZoom="TILE_MIN_ZOOM"
        :maxZoom="TILE_MAX_ZOOM"
        :tileMaxNativeZoom="TILE_MAX_NATIVE"
        @map-click="handleMapClick"
      />
    </div>
  </div>
</template>
