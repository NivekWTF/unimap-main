import { FC, useState } from 'react';
import { useMutation } from '@tanstack/react-query';

import { Button, Fade, Stack, Typography } from '@mui/material';

import FileDragAndDrop from '../../../../components/forms/FileDragAndDrop';
import ModalErrores from '../modal-errores';

import useAlert from '../../../../hooks/useAlert';
import { crearFormData } from '../../../../utils/functions';

type ImportarDesdeCSVProps = {
  uriFormato: string;
  mutationFn: (formData: FormData) => Promise<unknown>;
  mansajeExito: string;
};

const { VITE_API_URL } = import.meta.env;

const ImportarDesdeCSV: FC<ImportarDesdeCSVProps> = ({
  mutationFn, uriFormato, mansajeExito
}) => {
  const setAlert = useAlert();

  const [files, setFiles] = useState<File[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const urlFormato = `${VITE_API_URL}${uriFormato}`;

  const { mutate: importar } = useMutation({
    mutationKey: ['importar-csv'],
    mutationFn,
    onSuccess: () => {
      setErrorMessage(null);
      setFiles([]);
      setAlert({
        message: mansajeExito,
        type: 'success',
      });
    },
    onError: ({
      response: {
        data: { message },
      },
    }) => {
      setErrorMessage(message || 'Error al importar clases');
    },
  });

  const handleImportarClick = () => {
    const [csv] = files;
    const formData = crearFormData({ csv });
    importar(formData);
  };

  return (
    <>
      <Fade in>
        <Stack gap={2} alignItems="center" py={2}>
          <Typography>
            Solo se admiten archivos csv con el siguiente formato:
          </Typography>
          <Button variant="outlined" href={urlFormato} download>
            Descargar formato
          </Button>
          <FileDragAndDrop value={files} onChange={setFiles} maxFiles={1} />
          <Button disabled={!files.length} onClick={handleImportarClick}>
            Importar
          </Button>
        </Stack>
      </Fade>
      <ModalErrores
        mensaje={errorMessage}
        onClose={() => setErrorMessage(null)}
        open={!!errorMessage}
      />
    </>
  );
};

export default ImportarDesdeCSV;
