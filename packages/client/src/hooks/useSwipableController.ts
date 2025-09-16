import { useCallback } from 'react';

import useStore from '../store';
import { ItemBusqueda } from '../features/home/components/SearchField';
import { SwipeableTypes } from '../constants/swipeable-types';

const useSwipableController = () => {
  const { abrirSwipeable } = useStore(({ abrirSwipeable }) => ({ abrirSwipeable,  }));
  
  const seleccionarObjeto = useCallback((item: ItemBusqueda) => {
    abrirSwipeable(SwipeableTypes.Objetos, item);
  }, [abrirSwipeable]);

  const seleccionarServicio = useCallback((item: ItemBusqueda) => {
    console.log('Seleccionar Servicio', item);
    abrirSwipeable(SwipeableTypes.Servicios, item);
  }, [abrirSwipeable]);

  const seleccionarClase = useCallback((item: ItemBusqueda) => {
    console.log('Seleccionar Clase', item);
    abrirSwipeable(SwipeableTypes.Clases, item);
  }, [abrirSwipeable]);

  const abrirSwipeableObjeto = useCallback(() => {
    abrirSwipeable(SwipeableTypes.Objetos, null);
  }, [abrirSwipeable]);

  const seleccionarItemBusqueda = useCallback(
    (item: ItemBusqueda | null) => {
      if (!item) return abrirSwipeable(SwipeableTypes.None, null);
      
      const seleccionPorTipo = {
        servicio: seleccionarServicio,
        objeto: seleccionarObjeto,
        clase: seleccionarClase,
      };

      const { tipo } = item;
      seleccionPorTipo[tipo](item);
    },
    [seleccionarObjeto, seleccionarServicio, seleccionarClase, abrirSwipeable]
  );

  const cerrarSwipeable = useCallback(() => {
    abrirSwipeable(SwipeableTypes.None, null);
  }, [abrirSwipeable]);

  return {
    seleccionarItemBusqueda,
    abrirSwipeableObjeto,
    cerrarSwipeable,
    abrirSwipeable,
  };
};

export default useSwipableController;
