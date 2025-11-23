import { ref, computed } from 'vue';
import { useAppStore } from '@/stores/app';

type CategoriaLike = { _id?: string; nombre?: string; icono?: string; color?: string; colorSecundario?: string } | string | null | undefined;

/**
 * Composable to manage objetos (features) and categories.
 * - normalizeFromGeoJson: accepts a FeatureCollection and registers objetos in the global store
 * - getById / getAll / openObjeto: helpers to interact with the store
 */
export function useObjetos() {
  const app = useAppStore();
  const loading = ref(false);
  // Selected category filter (equivalent to React's `categoria` state)
  const categoria = ref<string>('');

  // Derived arrays/maps from store objetosPorId
  const objetos = computed(() => {
    const map = app.objetosPorId || {};
    const arr = Object.values(map || {}).map((o: any) => {
      // ensure centroide exists (compute from geometria if needed)
      if (!o.centroide && o.geometria) {
        const c = centroidFromGeom(o.geometria);
        if (c && Array.isArray(c)) o.centroide = { lat: c[0], lng: c[1] };
      }
      return o;
    });
    return arr;
  });

  const objetosRaiz = computed(() => objetos.value.filter((obj: any) => !obj.pertenece));

  const objetosEnCapa = computed(() => {
    let objs = [...objetosRaiz.value];

    const seleccionado = app.objetoSeleccionado;
    const pisoSeleccionado = app.pisoSeleccionado ?? 1;

    if (seleccionado) {
      objs = objetos.value.filter((o: any) => {
        return (
          (o.pertenece === seleccionado._id && o.pertenecePiso === pisoSeleccionado) ||
          o._id === seleccionado._id ||
          o._id === seleccionado.pertenece
        );
      });
    }

    if (categoria.value) {
      objs = objs.filter((o: any) => {
        const catId = o?.categoria?._id ?? o?.categoria;
        return catId === categoria.value || o._id === (seleccionado?._id);
      });
    }

    return objs;
  });

  const objetosPorId = computed(() => new Map((objetos.value || []).map((o: any) => [o._id, o])));
  const objetosEnCapaPorId = computed(() => new Map((objetosEnCapa.value || []).map((o: any) => [o._id, o])));

  function setCategoria(id: string) { categoria.value = id; }

  function normalizeFromGeoJson(fc: any | null) {
    if (!fc) return [] as any[];
    const features = fc.type === 'FeatureCollection' ? fc.features : Array.isArray(fc) ? fc : [fc];

    const objetos = features
      .filter((f: any) => f && f.type === 'Feature')
      .map((f: any) => {
        const props = f.properties || {};

        const qgisId = props.qgisId ?? props.ggisId ?? props.id ?? props.id_feature ?? null;
        const geom = f.geometry || null;

        const rawCategoria: CategoriaLike = props.categoria ?? props.cat ?? null;

        // Normalize category into the client Categoria shape. Use a safe any-cast
        // to accept different incoming shapes and avoid TS errors on unknown keys.
        let categoriaObj: any = null;
        if (rawCategoria && typeof rawCategoria === 'object') {
          const rc: any = rawCategoria as any;
          categoriaObj = {
            _id: rc._id ?? rc.id ?? rc.nombre ?? String(Math.random().toString(36).slice(2)),
            nombre: rc.nombre ?? rc.name ?? String(rc._id ?? rc.id ?? rc.nombre ?? ''),
            icono: rc.icono ?? rc.icon ?? '',
            color: rc.color ?? rc.colorHex ?? '#1572A1',
            colorSecundario: rc.colorSecundario ?? rc.color_secondary ?? rc.color_secondary ?? '#ffffff',
          };
        } else if (rawCategoria && typeof rawCategoria === 'string') {
          categoriaObj = { _id: rawCategoria, nombre: rawCategoria, icono: '', color: '#1572A1', colorSecundario: '#ffffff' };
        } else {
          categoriaObj = { _id: 'sin-categoria', nombre: 'Sin categoría', icono: '', color: '#1572A1', colorSecundario: '#ffffff' };
        }

        // centroid as {lat,lng}
        const centroideRaw = props.centroide ?? props.centroid ?? centroidFromGeom(geom);
        const centroide = centroideRaw && Array.isArray(centroideRaw)
          ? { lat: centroideRaw[0], lng: centroideRaw[1] }
          : (centroideRaw && typeof centroideRaw === 'object' && 'lat' in centroideRaw ? centroideRaw : null);

        // Build style from category
        const defaultColor = categoriaObj.color ?? '#1572A1';
        const style: any = {};
        if (geom?.type === 'Polygon' || geom?.type === 'MultiPolygon') {
          style.fillColor = defaultColor;
          style.fillOpacity = 0.35;
          style.color = defaultColor;
          style.weight = 2;
          style.opacity = 0.9;
        } else if (geom?.type === 'LineString' || geom?.type === 'MultiLineString') {
          style.color = defaultColor;
          style.weight = 3;
          style.opacity = 0.9;
        } else if (geom?.type === 'Point') {
          style.radius = 6;
          style.fillColor = defaultColor;
        }

        const objeto = {
          _id: props._id ?? qgisId ?? f.id ?? Math.random().toString(36).slice(2),
          nombre: props.nombre ?? props.name ?? props.label ?? '',
          nombreCorto: props.nombreCorto ?? props.shortName ?? undefined,
          descripcion: props.descripcion ?? props.description ?? undefined,
          pisos: typeof props.pisos === 'number' ? props.pisos : (props.pisos ? Number(props.pisos) : undefined),
          pertenecePiso: typeof props.pertenecePiso === 'number' ? props.pertenecePiso : (props.pertenecePiso ? Number(props.pertenecePiso) : undefined),
          pertenece: props.pertenece ?? null,
          categoria: categoriaObj,
          centroide,
          qgisId: qgisId ?? (props.qgis_id ?? props.QGISID ?? String(Math.random().toString(36).slice(2))),
          geometria: geom ? { type: geom.type === 'Polygon' ? 'Polygon' : (geom.type === 'MultiPolygon' ? 'MultiPolygon' : geom.type), coordinates: geom.coordinates } : null,
          servicios: props.servicios ?? [],
          urlImagenes: props.urlImagenes ?? props.images ?? [],
          style,
        };

        return objeto;
      });

    // save into global store keyed by _id
    app.setObjetosPorId(objetos as any[]);
    return objetos;
  }

  function centroidFromGeom(geom: any) {
    try {
      if (!geom) return null;
      if (geom.type === 'Point') return [geom.coordinates[1], geom.coordinates[0]];
      // For polygons, compute average of first ring
      if (geom.type === 'Polygon') {
        const coords = geom.coordinates?.[0] ?? [];
        if (!coords.length) return null;
        const sum = coords.reduce((acc: number[], c: number[]) => [acc[0] + c[1], acc[1] + c[0]], [0, 0]);
        return [sum[0] / coords.length, sum[1] / coords.length];
      }
      if (geom.type === 'MultiPolygon') {
        const coords = (geom.coordinates && geom.coordinates[0] && geom.coordinates[0][0]) ? geom.coordinates[0][0] : [];
        if (!coords.length) return null;
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

  return {
    loading,
    categoria,
    setCategoria,
    objetos,
    objetosRaiz,
    objetosEnCapa,
    objetosPorId,
    objetosEnCapaPorId,
    normalizeFromGeoJson,
    getById,
    getAll,
    openObjeto,
  };
}
