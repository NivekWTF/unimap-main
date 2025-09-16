import { useCallback } from 'react';

import api from '@api';
import useDebounce from './useDebounce';
import useStore from '../store';

const useBusqueda = (campus?: string) => {
  const { busqueda, setBusqueda } = useStore(({ busqueda, setBusqueda }) => ({
    busqueda,
    setBusqueda,
  }));

  const debouncedQuery = useDebounce(busqueda, 300);

  const handleChange = useCallback(
    (q: string) => {
      setBusqueda(q);
    },
    [setBusqueda]
  );

  const { data: resultadoBusqueda, isLoading } = api.busqueda.buscar.useQuery(
    {
      query: debouncedQuery,
      campus: campus!,
    },
    {
      enabled: !!debouncedQuery && !!campus,
    }
  );

  return {
    query: debouncedQuery,
    isLoading,
    handleChange,
    resultadoBusqueda,
  };
};

export default useBusqueda;
