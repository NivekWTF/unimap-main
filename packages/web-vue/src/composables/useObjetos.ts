import { ref } from 'vue';
import { useAppStore } from '@/stores/app';

/**
 * Composable to manage objetos (features) and categories.
 * - normalizeFromGeoJson: accepts a FeatureCollection and registers objetos in the global store
 * - getById / getAll / openObjeto: helpers to interact with the store
 */
export function useObjetos() {
  const app = useAppStore();
  const loading = ref(false);

  function normalizeFromGeoJson(fc: any | null) {
    if (!fc || fc.type !== 'FeatureCollection') return [] as any[];
    const objetos = fc.features.map((f: any) => {
      const categoria = f.properties?.categoria ?? f.properties?.cat ?? null;
      return {
        _id: f.properties?._id ?? f.id ?? Math.random().toString(36).slice(2),
        nombre: f.properties?.nombre ?? f.properties?.name ?? '',
        descripcion: f.properties?.descripcion ?? f.properties?.description ?? '',
        centroide: f.properties?.centroide ?? f.properties?.centroid ?? (f.geometry && centroidFromGeom(f.geometry)),
        categoria,
        raw: f,
      };
    });
    app.setObjetosPorId(objetos);
    return objetos;
  }

  function centroidFromGeom(geom: any) {
    try {
      // very small heuristic for polygons/points
      if (!geom) return null;
      if (geom.type === 'Point') return [geom.coordinates[1], geom.coordinates[0]];
      if (geom.type === 'Polygon' || geom.type === 'MultiPolygon') {
        const coords = (geom.type === 'Polygon' ? geom.coordinates[0] : geom.coordinates[0][0]);
        const sum = coords.reduce((acc: number[], c: number[]) => [acc[0] + c[1], acc[1] + c[0]], [0, 0]);
        return [sum[0] / coords.length, sum[1] / coords.length];
      }
      return null;
    } catch (e) { return null; }
  }

  function getById(id: string) {
    return app.objetosPorId?.[id] ?? null;
  }

  function getAll() {
    return Object.values(app.objetosPorId ?? {});
  }

  function openObjeto(id: string) {
    app.abrirSwipeableObjeto(id);
  }

  return { loading, normalizeFromGeoJson, getById, getAll, openObjeto };
}
