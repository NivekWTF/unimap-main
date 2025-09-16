import { FC, useCallback, useState, useMemo, useEffect, SetStateAction, Dispatch } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Box, Button, Fade } from '@mui/material';

import AccionesTabla from '../../../../components/ui/AccionesTabla';
import Tabla, { type Cabeceros } from '../../../../components/ui/Tabla';
import Listado from '../../../../containers/Listado';
import ModalImportarDatos from '../../../../components/ui/ModalImportarDatos';

import useAlert from '../../../../hooks/useAlert';
import { useMutation } from '@tanstack/react-query';
import { crearFormData } from '../../../../utils/functions';
import { Paginado } from '../../../../utils/types';

type Filtros = { q: string, pagina: number, limite: number }

type ListadoImportarDatosProps = {
  cabeceros: Cabeceros[];
  mutationFn: (formData: FormData) => Promise<unknown>; 
  mutationKey: string[];
  successMsg: string;
  urlFormato: string;
  titulo: string;
  paginado: Paginado;
  isLoading: boolean;
  onSearchParamsChange: (params: Filtros) => void | Dispatch<SetStateAction<Filtros>>;
  refetch: () => void;
  onDelete: (params: { id: string }) => unknown;
}

const ListadoImportarDatos: FC<ListadoImportarDatosProps> = ({
  cabeceros: cabecerosInicial, 
  mutationFn, 
  mutationKey, 
  successMsg, 
  urlFormato, 
  titulo, 
  onSearchParamsChange,
  paginado,
  isLoading,
  refetch,
  onDelete,
}) => {
  const setAlert = useAlert();

  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams({
    q: '',
    pagina: '1',
    limite: '10',
  });
  
  const { mutate: importar, isLoading: isImportando } = useMutation({
    mutationFn,
    mutationKey,
    onSuccess: () => {
      setAlert({
        message: successMsg,
        type: 'success',
      });
      setIsModalOpen(false);
      setErrorMessage('');
      refetch();
    }, 
    onError: ({
      response: {
        data: { message },
      },
    }) => {
      setErrorMessage(message || 'Error al importar alumnos');
    },
  });

  const cabeceros = useMemo(() => [
    ...cabecerosInicial,
    {
      label: 'Acciones',
      transform: ({ _id: id }: { _id: string }) => <AccionesTabla onDelete={() => onDelete({ id })} />
    }
  ]  as Cabeceros[], [cabecerosInicial, onDelete]);

  const handleModalImportarClose = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => setErrorMessage(''), 200);
  }, []);

  const handleImportarClick = useCallback((csv: File) => {
    const formData = crearFormData({ csv });
    importar(formData);
  }, [importar]);

  useEffect(() => {
    onSearchParamsChange({                            
      limite: Number(searchParams.get('limite') || 10),
      pagina: Number(searchParams.get('pagina') || 1),
      q: searchParams.get('q') || '',
    });
  }, [searchParams, onSearchParamsChange]);

  return (
    <>
      <ModalImportarDatos 
        open={isModalOpen}
        isLoading={isImportando}
        onImportar={handleImportarClick}
        onClose={handleModalImportarClose}
        urlFormato={urlFormato}
        errorMessage={errorMessage}
      />
      <Fade in>
        <Box>
          <Listado
            titulo={titulo}
            onChangeSearchParams={setSearchParams}
            page={searchParams.get('pagina')}
            totalPages={paginado?.totalPaginas}
            action={
              <Button
              variant="contained"
              color="warning"
              onClick={() => setIsModalOpen(true)}
              >
                Importar
              </Button>
            }
            hideAgregar
          >
            <Tabla 
              cabeceros={cabeceros} 
              isLoading={isLoading} 
              rows={paginado?.registros} 
            />
          </Listado>
        </Box>
      </Fade>
    </>
  );
};

export default ListadoImportarDatos;
