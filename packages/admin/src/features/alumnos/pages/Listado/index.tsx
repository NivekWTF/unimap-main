import { FC, useCallback, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Button, Stack } from '@mui/material';

import AccionesTabla from '../../../../components/ui/AccionesTabla';
import Tabla, { type Cabeceros } from '../../../../components/ui/Tabla';
import Listado from '../../../../containers/Listado';
import ModalImportarDatos from '../../../../components/ui/ModalImportarDatos';

import trpc from '@api';
import useAlert from '../../../../hooks/useAlert';
import { Alertas } from '../../../../constant/mensajes';
import { crearFormData, crearUrlFormato } from '../../../../utils/functions';
import { importarAlumnos, importarCargaAcademica } from '../../../../services/importador';
import { useMutation } from '@tanstack/react-query';
import { EJEMPLO_CSV_ALUMNOS, EJEMPLO_CSV_CARGA_ACADEMICA } from '../../../../constant/uris';

const MODALES = {
  ImportarAlumnos: 1,
  CargaAcademica: 2
}

const AlumnosListado: FC = () => {
  const navigate = useNavigate();
  const setAlert = useAlert();

  const [errorMessage, setErrorMessage] = useState<string>('');
  const [modalAbierto, setModalAbierto] = useState<number>(0);
  const [searchParams, setSearchParams] = useSearchParams({
    q: '',
    pagina: '1',
    limite: '10',
  });

  const q = searchParams.get('q');
  const pagina = Number(searchParams.get('pagina'));
  const limite = Number(searchParams.get('limite'));

  const { data: paginado, refetch, isLoading } = trpc.usuarios.obtenerPaginado.useQuery({
    limite,
    pagina,
    q,
    tipoUsuario: 'ALUMNO'
  });

  const handleDetail = useCallback((id: string) => {
    return () => {
      navigate(`/alumnos/${id}`);
    }
  }, [navigate]);

  const { mutate: eliminar } = trpc.objetos.eliminar.useMutation({
    onSuccess: () => {
      setAlert({ message: Alertas.guardado, type: 'success' });
      refetch();
    },
  });

  const cabeceros = useMemo<Cabeceros<NonNullable<typeof paginado>['registros'][0]>[]>(() => [
    { label: 'Clave', key: 'clave' },
    { label: 'Nombres', key: 'nombres' },
    { label: 'Apellidos', key: 'apellidos' },
    { label: 'Campus', transform: ({ campus }) => (campus as { nombre: string })?.nombre },
    { label: 'Correo', key: 'correo' },
    { label: 'Acciones', transform: ({ _id }) => <AccionesTabla 
      key={_id} 
      onDetail={handleDetail(_id)} 
      onDelete={() => eliminar({ id: _id })} 
    />}
  ], [handleDetail, eliminar]); 

  const mutationOptions = ({
    successMsg, errorMsg
  }: { successMsg: string, errorMsg: string }) => ({
    onSuccess: () => {
      setAlert({
        message: successMsg,
        type: 'success',
      });
      setModalAbierto(0);
      setErrorMessage('');
      refetch();
    }, 
    onError: ({
      response: {
        data: { message },
      },
    }: { response: { data: { message?: string } } }) => {
      setErrorMessage(message || errorMsg);
    },
  });

  const { mutate: mutImportarAlumnos, isLoading: isLoadingAlumnos } = useMutation({
    mutationFn: importarAlumnos,
    mutationKey: ['importar-alumnos'],
    ...mutationOptions({
      successMsg: 'Alumnos importados correctamente',
      errorMsg: 'Error al importar alumnos',
    })
  });

  const { mutate: mutImportarCarga, isLoading: isLoadingCargaAcademica } = useMutation({
    mutationFn: importarCargaAcademica,
    mutationKey: ['importar-carga'],
    ...mutationOptions({
      successMsg: 'Carga acádecima importada correctamente',
      errorMsg: 'Error al importar la carga acádemica', 
    }),
  });

  const isImportando = isLoadingAlumnos || isLoadingCargaAcademica;

  const handleImportarAlumnosClick = useCallback((csv: File) => {
    const formData = crearFormData({ csv });
    mutImportarAlumnos(formData);
  }, [mutImportarAlumnos]);

  const handleImportarCargaAcademicaClick = useCallback((csv: File) => {
    const formData = crearFormData({ csv });
    mutImportarCarga(formData);
  }, [mutImportarCarga]);

  const handleModalImportarClose = useCallback(() => {
    setModalAbierto(0);
    setErrorMessage('');
  }, []);

  return (
    <>
      <ModalImportarDatos 
        open={modalAbierto === MODALES.ImportarAlumnos}
        isLoading={isImportando}
        onImportar={handleImportarAlumnosClick}
        onClose={handleModalImportarClose}
        urlFormato={crearUrlFormato(EJEMPLO_CSV_ALUMNOS)}
        errorMessage={errorMessage}
      />
      <ModalImportarDatos 
        open={modalAbierto === MODALES.CargaAcademica}
        isLoading={isImportando}
        onImportar={handleImportarCargaAcademicaClick}
        onClose={handleModalImportarClose}
        urlFormato={crearUrlFormato(EJEMPLO_CSV_CARGA_ACADEMICA)}
        errorMessage={errorMessage}
      />
      <Listado
        titulo="Alumnos"
        onChangeSearchParams={setSearchParams}
        page={searchParams.get('pagina')}
        totalPages={paginado?.totalPaginas}
        hideAgregar
        action={
          <Stack direction="row" gap={2}>
            <Button
              variant="contained"
              color="warning"
              onClick={() => setModalAbierto(MODALES.ImportarAlumnos)}
            >
              Importar
            </Button>
            <Button
              variant="contained"
              color="info"
              onClick={() => setModalAbierto(MODALES.CargaAcademica)}
            >
              Carga acádemica
            </Button>
          </Stack>
        }
      >
        <Tabla 
          cabeceros={cabeceros} 
          isLoading={isLoading} 
          rows={paginado?.registros} 
        />
      </Listado>
    </>
  );
};

export default AlumnosListado;
