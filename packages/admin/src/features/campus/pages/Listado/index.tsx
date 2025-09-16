import { FC, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import Listado from '../../../../containers/Listado';
import Tarjeta from '../../../../components/ui/Card';

import trpc from '@api';
import useAlert from '../../../../hooks/useAlert';
import { Alertas } from '../../../../constant/mensajes';

const InsitucionesListado: FC = () => {
  const navigate = useNavigate();
  const setAlert = useAlert();

  const [searchParams, setSearchParams] = useSearchParams({
    q: '',
    pagina: '1',
    limite: '10',
  });

  const q = searchParams.get('q');
  const pagina = Number(searchParams.get('pagina'));
  const limite = Number(searchParams.get('limite'));

  const { data: paginado, refetch } = trpc.campus.obtenerPaginado.useQuery({
    pagina,
    limite,
    q,
  }, {
    enabled: !!searchParams.get('pagina'),
  });

  const { mutate: eliminar } = trpc.campus.eliminar.useMutation({
    onSuccess: () => {
      setAlert({ message: Alertas.guardado, type: 'success' });
      refetch();
    },
  });

  const handleEdit = useCallback(
    (id: string) => {
      return () => {
        navigate(`/campus/${id}`);
      };
    },
    [navigate]
  );

  const handleDelete = useCallback((id: string) => {
    return () => {
      eliminar({ id });
    }
  }, [eliminar]);

  return (
    <Listado
      titulo="Campus"
      onChangeSearchParams={setSearchParams}
      page={pagina}
      totalPages={paginado?.totalPaginas}
    >
      {paginado?.registros.map(({ _id, nombre, descripcion }) => (
        <Tarjeta
          key={_id}
          titulo={nombre}
          descripcion={descripcion}
          onEdit={handleEdit(_id)}
          onDelete={handleDelete(_id)}
        />
      ))}
    </Listado>
  );
};

export default InsitucionesListado;
