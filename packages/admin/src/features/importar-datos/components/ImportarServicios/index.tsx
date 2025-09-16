import { FC, useMemo, useState } from 'react';
import ListadoImportarDatos from '../ListadoImportarDatos';

import api from '@api';
import { CabecerosDePaginado } from '../../../../utils/types';
import { importarServicios } from '../../../../services/importador';
import { crearUrlFormato } from '../../../../utils/functions';
import { EJEMPLO_CSV_SERVICIOS } from '../../../../constant/uris';
import { Alertas } from '../../../../constant/mensajes';


const ImportarServicios: FC = () => {
  const [filtros, setFiltros] = useState({ q: '', pagina: 1, limite: 10 });

  const {
    limite, pagina, q,
  } = filtros;

  const { data: paginado, isLoading, refetch } = api.servicios.obtenerPaginado.useQuery({
    limite, pagina, q
  }, {
    initialData: { registros: [], total: 0, totalPaginas: 0 }
  });

  const { mutate: eliminarServicio } = api.servicios.eliminar.useMutation({
    mutationKey: ['eliminar-servicio'],
    onSuccess: () => refetch(),
  });

  const cabeceros = useMemo(() => [
    { 
      key: 'clave',
      label: 'Clave',
    },
    { 
      key: 'nombre',
      label: 'Nombre',
    },
    { 
      key: 'descripcion',
      label: 'Descripción',
    },
  ] as CabecerosDePaginado<typeof paginado>, []);

  return <ListadoImportarDatos  
    titulo="Servicios"
    paginado={paginado}
    cabeceros={cabeceros}
    isLoading={isLoading}
    refetch={refetch}
    mutationFn={importarServicios}
    urlFormato={crearUrlFormato(EJEMPLO_CSV_SERVICIOS)}
    mutationKey={['importar-servicios']}
    successMsg={Alertas.serviciosImportardos}
    onSearchParamsChange={setFiltros} 
    onDelete={eliminarServicio}
  />
};

export default ImportarServicios;