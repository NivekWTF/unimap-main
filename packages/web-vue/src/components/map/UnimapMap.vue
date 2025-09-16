<script setup lang="ts">
import { LMap, LTileLayer, LGeoJson, LMarker, LControlZoom } from '@vue-leaflet/vue-leaflet'
import type { StyleFunction } from 'leaflet'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  center: [number, number],
  geojson?: any,
  markers?: Array<{ lat:number; lng:number; etiqueta?: string }>,
  styleFunction?: StyleFunction,
  /** URL de tus tiles (ej. "/tiles/{z}/{x}/{y}.jpg") */
  tilesUrl?: string,
  minZoom?: number,
  maxZoom?: number
}>(), {
  markers: () => [],
  tilesUrl: '/tiles/{z}/{x}/{y}.jpg',   // ← apunta a public/tiles
  minZoom: 16,
  maxZoom: 21,
})

const osmUrl = import.meta.env.VITE_TILES_URL ?? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
</script>

<template>
  <LMap :zoom="18" :center="center" :zoomControl="false" style="height:100%; width:100%">
    <LControlZoom position="bottomright" />

    <!-- Tus tiles del dron -->
    <LTileLayer
      :url="tilesUrl"
      :minZoom="minZoom"
      :maxZoom="maxZoom"
      :zIndex="1"
      attribution="&copy; Ortofoto Tec"
    />

    <!-- (Opcional) Fallback a OSM debajo, baja zIndex -->
    <LTileLayer :url="osmUrl" :zIndex="0" />

    <!-- GeoJSON y marcadores arriba de la ortofoto -->
    <LGeoJson v-if="geojson" :geojson="geojson" :optionsStyle="styleFunction" />
    <LMarker v-for="(m,i) in markers" :key="i" :lat-lng="[m.lat, m.lng]" />
  </LMap>
</template>

<style>
@import "leaflet/dist/leaflet.css";
/* evita que estilos globales deformen los tiles */
.leaflet-container img, .leaflet-pane img { max-width: none !important; }
</style>
