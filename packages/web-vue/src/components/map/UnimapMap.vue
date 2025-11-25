<script setup lang="ts">
import { LMap, LTileLayer, LGeoJson, LMarker, LControlZoom } from '@vue-leaflet/vue-leaflet';
import type { StyleFunction } from 'leaflet';
import { computed, ref, onMounted, watch } from 'vue';
import { useAppStore } from '@/stores/app';

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

// expose the internal LMap component via ref so we can store the Leaflet map
const mapRef = ref<any>(null);
const app = useAppStore();

onMounted(() => {
  // The underlying Leaflet map instance is available as `mapRef.value.mapObject`.
  // Set it into the global store so actions like `abrirSwipeableObjeto` can use it.
  try {
    const maybeMap = mapRef.value?.mapObject ?? null;
    if (maybeMap) app.setMap(maybeMap);
  } catch (e) {
    console.debug('[UnimapMap] unable to set map on mount', e);
  }
});

// Also watch in case the map object is attached slightly after mount
watch(() => mapRef.value && mapRef.value.mapObject, (m) => {
  if (m) app.setMap(m);
});

function onMapClick(e:any){ emit('map-click', [e.latlng.lat, e.latlng.lng]); }

// onEachFeature para capturar clicks sobre geometrías
const geojsonOptions = computed(() => ({
  onEachFeature: (feature:any, layer:any) => {
    layer.on('click', (e:any) => {
      const { lat, lng } = e.latlng;
      // debug: log feature click payload so we can trace clicks
      try {
        // Log minimal info to container logs (visible when running in docker)
        // JSON.stringify can fail for circular refs, so guard it
        const props = feature && feature.properties ? feature.properties : null;
        console.log('[UnimapMap] feature click', { id: props?._id ?? props?.id ?? null, props });
      } catch (e) {
        console.debug('[UnimapMap] feature click log error', e);
      }
      emit('feature-click', { feature, latlng: [lat, lng] });
    });
  },
}));
</script>

<template>
  <LMap ref="mapRef"
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
