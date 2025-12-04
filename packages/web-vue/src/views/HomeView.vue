<script setup lang="ts">
import UnimapMap from '@/components/map/UnimapMap.vue';
import Sidebar from '@/components/ui/Sidebar.vue';
import Alerts from '@/components/ui/Alerts.vue';

import { ref, onMounted, computed } from 'vue';
import { useAppStore } from '@/stores/app';
import { useObjetos } from '@/composables/useObjetos';
import type { StyleFunction } from 'leaflet';
import { buildGraphFromPasillos, nearestNodeId, pathToGeoJson } from '@/lib/routing/buildGraph';
import { aStar } from '@/lib/routing/graph';

const app = useAppStore();
const rawCenter = (import.meta.env.VITE_CENTRO_DEFAULT_MAPA ?? '24.790277777778,-107.38777777778').split(',').map(Number) as [number,number];

const GEOJSON_CONTORNO = import.meta.env.VITE_GEOJSON_PATH ?? '/data/Tec_Contorno.geojson';
const GEOJSON_PASILLOS = import.meta.env.VITE_GEOJSON_PASILLOS ?? '/data/pasillos-tec.geojson';

const contorno = ref<any|null>(null);
const pasillos = ref<any|null>(null);
const routeFeature = ref<any|null>(null);
const center = ref<[number,number]>(rawCenter);
const markers = ref<{lat:number; lng:number; etiqueta?:string}[]>([]);
const loading = ref(false);
const errorMsg = ref('');

let graph: ReturnType<typeof buildGraphFromPasillos> | null = null;

// objetos layer (from composable) -> to enable feature clicks on objects
const { objetosEnCapa } = useObjetos();
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

const routeFc = computed(() => routeFeature.value ? ({ type:'FeatureCollection', features:[routeFeature.value] }) : null);
// Do NOT include `pasillos` in the merged GeoJSON shown to users. Pasillos is
// still loaded for routing (graph building) but should not be drawn by default.
// Also avoid including `contorno` when the objetos layer already contains the
// same features (to prevent duplicate drawing when we normalize contorno into objetos).
const merged = computed(() => {
  const includeContorno = !(objetosGeojson.value && objetosGeojson.value.features && objetosGeojson.value.features.length > 0);
  return mergeMany([ includeContorno ? contorno.value : null, routeFc.value, objetosGeojson.value ]);
});

function mergeMany(items:any[]){
  const features = items.filter(Boolean).flatMap((fc:any)=> fc.type==='FeatureCollection'? fc.features : [fc]);
  const seen = new Set<string>();
  const out:any[] = [];
  for (const f of features) {
    const p = f?.properties ?? {};
    const geom = f?.geometry;
    let key = p._id ?? p.qgisId ?? p.id ?? null;
    if (!key && geom) {
      try {
        const sig = JSON.stringify([geom.type, Array.isArray(geom.coordinates) ? JSON.stringify(geom.coordinates).slice(0,200) : '']);
        key = sig;
      } catch (e) {
        key = JSON.stringify(f).slice(0,200);
      }
    }
    if (!key) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(f);
  }
  return out.length ? { type:'FeatureCollection', features: out } : null;
}

const styleFn: StyleFunction = (feature) => {
  if (feature?.properties?.capa === 'ruta') return { color:'#1976D2', weight:5, opacity:.95 };
  const t = feature?.geometry?.type;
  if (t==='LineString' || t==='MultiLineString') return { color:'#2e7d32', weight:3, opacity:.9 };
  const color = feature?.properties?.color ?? '#1572A1';
  return { color, weight:2, fillColor: color, fillOpacity:.35 };
};

function computeCenter(g:any): [number,number]{
  const coords:number[][]=[]; const push=(a:any)=>{ if(typeof a?.[0]==='number'){ const [lng,lat]=a; coords.push([lng,lat]); } else if(Array.isArray(a)) a.forEach(push); };
  const walk=(n:any)=>{ if(!n)return; if(n.type==='FeatureCollection') n.features.forEach(walk); else if(n.type==='Feature') walk(n.geometry); else if(n.coordinates) push(n.coordinates); };
  walk(g); if(!coords.length) return center.value;
  let minLng=Infinity,minLat=Infinity,maxLng=-Infinity,maxLat=-Infinity;
  for(const [lng,lat] of coords){ if(lng<minLng)minLng=lng; if(lat<minLat)minLat=lat; if(lng>maxLng)maxLng=lng; if(lat>maxLat)maxLat=lat; }
  return [(minLat+maxLat)/2,(minLng+maxLng)/2];
}

onMounted(async ()=>{
  app.loadToken();
  loading.value = true;
  try {
    const [a,b] = await Promise.all([ fetch(GEOJSON_CONTORNO), fetch(GEOJSON_PASILLOS) ]);
    if (a.ok) contorno.value = await a.json();
    if (!b.ok) throw new Error(`No se pudo cargar ${GEOJSON_PASILLOS} (${b.status})`);
    pasillos.value = await b.json();
    // normalize geojson into objetos store so we render objetos layer
    try {
      const { normalizeFromGeoJson, loadObjetos } = useObjetos();
      normalizeFromGeoJson(contorno.value);
      normalizeFromGeoJson(pasillos.value);
      // ensure backend objects are loaded for current campus
      loadObjetos();
    } catch (e) {
      console.debug('normalizeFromGeoJson/loadObjetos failed:', e);
    }
    center.value = computeCenter(pasillos.value || contorno.value);
    graph = buildGraphFromPasillos(pasillos.value);
  } catch (e:any) {
    errorMsg.value = e?.message ?? 'Error cargando datos';
    app.pushAlert({ type:'error', message: errorMsg.value });
  } finally { loading.value = false; }
});

// selección de ruta con clicks
const start = ref<[number,number] | null>(null);
const end   = ref<[number,number] | null>(null);

async function onMapClick(latlng:[number,number]){
  if (!start.value){ start.value = latlng; markers.value=[{lat:latlng[0], lng:latlng[1], etiqueta:'Inicio'}]; routeFeature.value=null; return; }
  if (!end.value){ end.value = latlng; markers.value.push({lat:latlng[0], lng:latlng[1], etiqueta:'Destino'}); await computeRoute(); return; }
  // reiniciar
  start.value = latlng; end.value = null; routeFeature.value=null; markers.value=[{lat:latlng[0], lng:latlng[1], etiqueta:'Inicio'}];
}

async function computeRoute(){
  if (!graph || !start.value || !end.value) return;
  const s = nearestNodeId(graph, start.value[0], start.value[1]);
  const t = nearestNodeId(graph, end.value[0],   end.value[1]);
  const nodePath = aStar(graph, s, t);
  if (!nodePath){ app.pushAlert({ type:'warning', message:'No se encontró ruta. Revisa conexiones en pasillos.' }); routeFeature.value=null; return; }
  routeFeature.value = pathToGeoJson(graph, nodePath);
}

// click en polígonos/lineas → abre Sidebar
function onFeatureClick(payload:{feature:any, latlng:[number,number]}){
  app.selectFeature(payload.feature); // Sidebar muestra properties
  try{
    const id = payload?.feature?.properties?._id ?? payload?.feature?.properties?.id;
    const msg = id ? `Click objeto ${id}` : `Click objeto sin id`;
    app.pushAlert({ message: msg, type: 'success' });
  }catch(e){ console.debug('onFeatureClick alert error', e); }
}
</script>

<template>
  <div style="height:100vh; width:100vw; position:relative;">
    <div style="position:absolute; left:12px; top:12px; z-index:600; display:flex; gap:12px; align-items:center; background:#fff; padding:8px 12px; border-radius:8px; box-shadow:0 2px 10px rgba(0,0,0,.12);">
      <span v-if="loading">Cargando…</span>
      <span v-if="!loading && !start">Click en el mapa para elegir origen</span>
      <span v-else-if="start && !end">Ahora elige destino…</span>
      <span v-else>Click para reiniciar origen</span>
    </div>

    <UnimapMap
      :center="center"
      :geojson="merged"
      :markers="markers"
      :styleFunction="styleFn"
      :constrainToCenterBounds="true"
      :zoom="18"
      :minZoom="16"
      :maxZoom="21"
      :tileMaxNativeZoom="20"
      @map-click="onMapClick"
      @feature-click="onFeatureClick"
    />

    <Sidebar />
    <Alerts />
  </div>
</template>
