import { FC, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Stack, Typography } from '@mui/material';

import Tarjeta from '../../../../components/ui/Card';
import Listado from '../../../../containers/Listado';

import api from '@api';
import useCategoria from '../../../../hooks/useCategoria';
import useAlert from '../../../../hooks/useAlert';
import { Alertas } from '../../../../constant/mensajes';

const ObjetosListado: FC = () => {
  const navigate = useNavigate();
  const categoria = useCategoria();

  const setAlert = useAlert();

  const [searchParams, setSearchParams] = useSearchParams({
    q: '',
    pagina: '1',
    limite: '6',
  });

  const { data: paginado, refetch, isLoading } = api.objetos.obtenerPaginado.useQuery(
    {
      categoria: categoria?._id,
      limite: Number(searchParams.get('limite')) || 6,
      pagina: Number(searchParams.get('pagina')) || 1,
      q: searchParams.get('q') || '',
    },
    {
      enabled: !!categoria,
    }
  );

  const { mutate: eliminar } = api.objetos.eliminar.useMutation({
    onSuccess: () => {
      setAlert({ message: Alertas.guardado, type: 'success' });
      refetch();
    },
  });

  const handleEditar = useCallback(
    (id: string) => {
      return () => {
        navigate(`/${categoria._id}/${id}`);
      };
    },
    [navigate, categoria]
  );

  const handleEliminar = useCallback(
    (id: string) => {
      return () => {
        eliminar({ id });
      };
    },
    [eliminar]
  );

  return (
    <>
      <Listado
        titulo={categoria?.nombre}
        onChangeSearchParams={setSearchParams}
        page={searchParams.get('pagina')}
        totalPages={paginado?.totalPaginas}
      >
        {((paginado?.total || 0) > 0) ? (
          paginado?.registros.map(({ _id, nombre, descripcion, urlImagenes }) => (
            <Tarjeta
              key={_id}
              titulo={nombre}
              descripcion={descripcion}
              img={urlImagenes[0]}
              onEdit={handleEditar(_id)}
              onDelete={handleEliminar(_id)}
            />
          ))
        ) : (
          <Stack
            width="100%"
            height="100%"
            alignItems="center"
            justifyContent="center"
            gridColumn="span 3"
          >
            {!isLoading && <Typography variant="h5" color="primary">
              Sin resultados
            </Typography>}
          </Stack>
        )}
      </Listado>
    </>
  );
};

export default ObjetosListado;
