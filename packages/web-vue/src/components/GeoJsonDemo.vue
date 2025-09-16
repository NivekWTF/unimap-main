<!-- packages/web-vue/src/components/GeoJsonDemo.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { StyleFunction } from 'leaflet'
import UnimapMap from './map/UnimapMap.vue'

const center = ref<[number, number]>([-17.7833, -63.1821]) // lat, lng (ejemplo)
const geojson = ref<any | null>(null)

const styleFn: StyleFunction = (feature) => {
  // colorea según propiedad (ajusta a tus datos)
  const color = feature?.properties?.color ?? '#1572A1'
  return { color, weight: 2, fillColor: color, fillOpacity: 0.35 }
}

onMounted(async () => {
  const res = await fetch('/data/Tec_Contorno.geojson')
  geojson.value = await res.json()
  // Opcional: centra el mapa al GeoJSON (ver util más abajo)
  // center.value = computeGeoJsonCenter(geojson.value)
})
</script>

<template>
  <div style="height: 80vh">
    <UnimapMap :center="center" :geojson="geojson" :styleFunction="styleFn" />
  </div>
</template>