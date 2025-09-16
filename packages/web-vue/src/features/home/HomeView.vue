<script setup lang="ts">
import UnimapMap from '@/components/map/UnimapMap.vue';
import { ref, onMounted } from 'vue';
import type { StyleFunction } from 'leaflet';

const rawCenter = import.meta.env.VITE_CENTRO_DEFAULT_MAPA ?? '24.790277777778,-107.38777777778';
const centroDefault = rawCenter.split(',').map(Number) as [number, number];

const center = ref<[number, number]>(centroDefault);
const geojson = ref<any | null>(null);
const markers = ref<{lat:number; lng:number; etiqueta?: string}[]>([]);
const constrainToCenterBounds = ref(true);

const GEOJSON_PATH =
  import.meta.env.VITE_GEOJSON_PATH ??
  '/data/Tec_Contorno.geojson'; // coloca el archivo en /public/data/

// Estilo opcional para las geometrías
const styleFn: StyleFunction = (feature) => {
  const color = feature?.properties?.color ?? '#1572A1';
  return { color, weight: 2, fillColor: color, fillOpacity: 0.35 };
};

// Calcula el centro (lat, lng) del bbox del GeoJSON (coordenadas de entrada GeoJSON: [lng, lat])
function computeGeoJsonCenter(g: any): [number, number] {
  const coords: number[][] = [];

  function pushCoords(arr: any) {
    if (typeof arr?.[0] === 'number') {
      const [lng, lat] = arr as [number, number];
      coords.push([lng, lat]);
    } else if (Array.isArray(arr)) {
      arr.forEach(pushCoords);
    }
  }

  function walk(node: any) {
    if (!node) return;
    if (node.type === 'FeatureCollection') node.features.forEach(walk);
    else if (node.type === 'Feature') walk(node.geometry);
    else if (node.type && node.coordinates) pushCoords(node.coordinates);
  }

  walk(g);

  if (!coords.length) return center.value;
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
  for (const [lng, lat] of coords) {
    if (lng < minLng) minLng = lng;
    if (lat < minLat) minLat = lat;
    if (lng > maxLng) maxLng = lng;
    if (lat > maxLat) maxLat = lat;
  }
  return [(minLat + maxLat) / 2, (minLng + maxLng) / 2];
}

onMounted(async () => {
  try {
    const res = await fetch(GEOJSON_PATH, { headers: { accept: 'application/geo+json,application/json' } });
    if (!res.ok) throw new Error(`No se pudo cargar ${GEOJSON_PATH} (${res.status})`);
    const gj = await res.json();
    geojson.value = gj;
    // centra el mapa al contenido del GeoJSON
    center.value = computeGeoJsonCenter(gj);
  } catch (err) {
    console.error(err);
  }
});

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      geojson.value = data;
      center.value = computeGeoJsonCenter(data);
    } catch (err) {
      console.error('GeoJSON inválido:', err);
    }
  };
  reader.readAsText(file);
}
</script>

<template>
  <div style="height:100vh; width:100vw; display: grid; grid-template-rows: auto 1fr; gap: 8px; padding: 8px; box-sizing: border-box;">
    <div style="display:flex; align-items:center; gap: 12px;">
      <label style="display:inline-flex; align-items:center; gap:8px;">
        <span>Subir GeoJSON:</span>
        <input type="file" accept=".geojson,application/geo+json,application/json" @change="onFileChange" />
      </label>
      <label style="display:inline-flex; align-items:center; gap:8px;">
        <input type="checkbox" v-model="constrainToCenterBounds" />
        <span>Limitar movimiento (maxBounds)</span>
      </label>
    </div>
    <div style="height:100%; width:100%;">
      <UnimapMap :center="center" :geojson="geojson" :markers="markers" :styleFunction="styleFn" :constrainToCenterBounds="constrainToCenterBounds" />
    </div>
  </div>
</template>

