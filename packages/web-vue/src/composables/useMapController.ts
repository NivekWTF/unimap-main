import { ref } from 'vue';
import type { Map as LeafletMap, LatLngExpression } from 'leaflet';
import { useAppStore } from '@/stores/app';

const mapRef = ref<LeafletMap | null>(null);

export function useMapController() {
  const app = useAppStore();
  function setMap(m: LeafletMap) { mapRef.value = m; app.setMap(m); }
  function flyTo(target: LatLngExpression, zoom = 20) { mapRef.value?.flyTo(target, zoom); }
  function getMap() { return mapRef.value; }
  return { setMap, flyTo, getMap };
}
