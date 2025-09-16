import { useCallback } from 'react';

import useStore from '../store';
import { Objeto } from '../utils/types';
import { obtenerCentroide } from '../utils/functions';
import { LatLngExpression } from 'leaflet';
import { ZOOM_CAMPUS, ZOOM_OBJETO } from '../constants/map';

const useMapController = () => {
  const map = useStore(({ map }) => map);

  const centrarMapaAObjeto = useCallback(
    (objeto: Objeto) => {
      const { geometria } = objeto;
      const centroide = obtenerCentroide(geometria);
      map?.setView(centroide, ZOOM_OBJETO);
    },
    [map]
  );

  const centrarMapa = useCallback(
    (centro: LatLngExpression, zoom = ZOOM_CAMPUS) => {
      map?.setView(centro, zoom);
    },
    [map]
  );

  const cambiarZoom = useCallback(
    (zoom: number) => {
      map?.setZoom(zoom);
    },
    [map]
  );

  return {
    centrarMapaAObjeto,
    centrarMapa,
    cambiarZoom,
  };
};

export default useMapController;
