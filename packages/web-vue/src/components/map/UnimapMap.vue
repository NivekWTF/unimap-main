<script setup lang="ts">
import { LMap, LTileLayer, LGeoJson, LMarker, LControlZoom } from '@vue-leaflet/vue-leaflet';
import type { StyleFunction } from 'leaflet';
import { computed } from 'vue';

const emit = defineEmits<{
  (e:'map-click', latlng:[number,number]): void
  (e:'feature-click', payload:{ feature:any, latlng:[number,number] }): void
}>();

const props = withDefaults(defineProps<{
  center: [number, number],
  geojson?: any,
  markers?: Array<{ lat:number; lng:number; etiqueta?: string }>,
  styleFunction?: StyleFunction,
  constrainToCenterBounds?: boolean,
  zoom?: number,
  minZoom?: number,
  maxZoom?: number,
  tileMaxNativeZoom?: number,
  tilesUrl?: string
}>(), {
  markers: () => [],
  constrainToCenterBounds: true,
  zoom: 18,
  minZoom: 0,
  maxZoom: 22,
  tileMaxNativeZoom: 19,
  tilesUrl: import.meta.env.VITE_TILES_URL ?? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
});

const boundsOffset = 0.004;
const maxBounds = computed(() => [
  [props.center[0] - boundsOffset, props.center[1] - boundsOffset],
  [props.center[0] + boundsOffset, props.center[1] + boundsOffset],
]);

function onMapClick(e:any){ emit('map-click', [e.latlng.lat, e.latlng.lng]); }

// onEachFeature para capturar clicks sobre geometrías
const geojsonOptions = computed(() => ({
  onEachFeature: (feature:any, layer:any) => {
    layer.on('click', (e:any) => {
      const { lat, lng } = e.latlng;
      emit('feature-click', { feature, latlng: [lat, lng] });
    });
  },
}));
</script>

<template>
  <LMap
    :zoom="zoom" :minZoom="minZoom" :maxZoom="maxZoom"
    :center="center" :maxBounds="constrainToCenterBounds ? maxBounds : undefined"
    :zoomControl="false" style="height:100%;width:100%" @click="onMapClick"
  >
    <LControlZoom position="bottomright" />
    <LTileLayer :url="tilesUrl" :maxZoom="maxZoom" :maxNativeZoom="tileMaxNativeZoom" />
    <LGeoJson v-if="geojson" :geojson="geojson" :options="geojsonOptions" :optionsStyle="styleFunction" />
    <LMarker v-for="(m,i) in markers" :key="i" :lat-lng="[m.lat, m.lng]" />
  </LMap>
</template>

<style>
@import "leaflet/dist/leaflet.css";
.leaflet-container img, .leaflet-pane img { max-width: none !important; }
</style>
