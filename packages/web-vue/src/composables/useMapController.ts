import { ref } from 'vue';
import type { Map as LeafletMap, LatLngExpression } from 'leaflet';

const mapRef = ref<LeafletMap | null>(null);

export function useMapController() {
  function setMap(m: LeafletMap) { mapRef.value = m; }
  function flyTo(target: LatLngExpression, zoom = 20) { mapRef.value?.flyTo(target, zoom); }
  return { setMap, flyTo };
}
