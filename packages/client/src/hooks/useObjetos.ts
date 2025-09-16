import { useState, useMemo, useEffect } from 'react';

import api from '@api';
import useStore from '../store';
import { obtenerCentroide } from '../utils/functions';
import { Objeto } from '../utils/types';

const useObjetos = (campus?: string) => {
  const { objetoSeleccionado, pisoSeleccionado, setObjetosPorId } = useStore(
    ({ objetoSeleccionado, pisoSeleccionado, setObjetosPorId }) => ({
      objetoSeleccionado,
      pisoSeleccionado,
      setObjetosPorId,
    })
  );

  const [categoria, setCategoria] = useState<string>('');

  const { data: objetosApi } = api.objetos.obtenerTodos.useQuery(
    {
      campus: campus,
    },
    {
      enabled: !!campus,
      staleTime: Infinity,
    }
  );

  const objetos = useMemo(() => {
    if (!objetosApi) return [];
    return objetosApi.map((objeto) => ({
      ...objeto,
      centroide: obtenerCentroide(objeto.geometria),
    })) as unknown as Objeto[];
  }, [objetosApi]);

  const objetosRaiz = useMemo(
    () => objetos.filter(({ pertenece }) => !pertenece),
    [objetos]
  );

  const objetosEnCapa = useMemo(() => {
    // Inicialmente, los objetos en la capa son los objetos raíz del campus
    let objetosEnCapa = [...objetosRaiz];

    // Si existe un objeto seleccionado
    if (objetoSeleccionado) {
      objetosEnCapa = objetos.filter(
        ({ pertenece, pertenecePiso, _id }) =>
          (pertenece === objetoSeleccionado._id &&
            pertenecePiso === pisoSeleccionado) ||
          _id === objetoSeleccionado._id ||
          _id === objetoSeleccionado.pertenece
      );
    }

    // Si existe una categoría seleccionada
    if (categoria) {
      objetosEnCapa = objetosEnCapa.filter(
        ({ categoria: { _id: categoriaObjeto }, _id }) =>
          categoriaObjeto === categoria || _id === objetoSeleccionado?._id
      );
    }

    return objetosEnCapa;
  }, [objetos, objetosRaiz, categoria, objetoSeleccionado, pisoSeleccionado]);
  
  const objetosPorId = useMemo(
    () => new Map(objetos.map((objeto) => [objeto._id, objeto])),
    [objetos]
  );
  
  const objetosEnCapaPorId = useMemo(
    () => new Map(objetosEnCapa.map((objeto) => [objeto._id, objeto])),
    [objetosEnCapa]
  );

  useEffect(() => {
    setObjetosPorId(objetos);
  }, [objetos, setObjetosPorId]);

  return {
    categoria,
    setCategoria,
    objetos,
    objetosEnCapa,
    objetosPorId,
    objetosEnCapaPorId,
  };
};

export default useObjetos;
