import { FC, useCallback, useMemo, useState } from 'react';

import { Button, Dialog, Fade, Stack, Typography } from '@mui/material';

import FileDragAndDrop from '../../../../components/forms/FileDragAndDrop';
import Select from '../../../../components/forms/Select';

import api from '@api';
import useAlert from '../../../../hooks/useAlert';

import {
  geoJsonImportacionMasivaSchema,
  getErrorMessage,
} from '../../../../utils/validators';
import ModalErrores from '../modal-errores';

const ImportarObjetos: FC = () => {
  const setAlert = useAlert();

  const [indexArchivoErrores, setIndexArchivoErrores] = useState<number | null>(
    null
  );
  const [files, setFiles] = useState<File[]>([]);
  const [errores, setErrores] = useState<string[][]>([]);
  const [campusSeleccionado, setCampusSeleccionado] = useState<string>('');
  const [errorImportacion, setErrorImportacion] = useState<string | null>(null);

  const isModalOpen = useMemo(
    () => indexArchivoErrores !== null,
    [indexArchivoErrores]
  );

  const { mutate: importarObjetos } = api.importarObjetos.importar.useMutation({
    onSuccess: () => {
      setFiles([]);
      setAlert({
        message: 'Objetos importados correctamente',
        type: 'success',
      });
    },
    onError: ({ message }) => {
      setErrorImportacion(message);
    },
  });

  const { data: campus } = api.campus.obtener.useQuery();

  const handleImportar = async () => {
    const errores: string[][] = [];

    const geoJson = await Promise.all(
      files.map(async (file, index) => {
        const text = await file.text();
        const result = await geoJsonImportacionMasivaSchema.safeParseAsync(
          JSON.parse(text)
        );
        if (result.success) return result.data;

        const { errors } = result.error;
        errores[index] = getErrorMessage(errors);
      })
    );

    if (errores.length) {
      setErrores(errores);
      setAlert({
        message: 'Ocurrieron errores en la validación de los archivos',
        type: 'error',
      });
      return;
    }

    importarObjetos({
      geoJson: geoJson as NonNullable<(typeof geoJson)[0]>[],
      campus: campusSeleccionado,
    });
  };

  const handleVerErrores = useCallback((index: number) => {
    return () => {
      setIndexArchivoErrores(index);
    };
  }, []);

  return (
    <>
      <Dialog open={isModalOpen}>
        <Stack minHeight={240} maxWidth={420} p={4} gap={3}>
          <Typography variant="h6">
            El archivo {files[indexArchivoErrores!]?.name} no cumple con el
            formato esperado
          </Typography>
          <Stack gap="4px">
            {errores[indexArchivoErrores!]?.map((error) => (
              <Typography key={error} color="error">
                {error}
              </Typography>
            ))}
          </Stack>
        </Stack>
        <Stack justifyContent="center" gap={2} p={4}>
          <Button
            variant="outlined"
            sx={{ alignSelf: 'center' }}
            onClick={() => setIndexArchivoErrores(null)}
          >
            Cerrar
          </Button>
        </Stack>
      </Dialog>
      
      <ModalErrores 
        mensaje={errorImportacion} 
        onClose={() => setErrorImportacion(null)} 
        open={!!errorImportacion}
      />
      
      <Fade in>
        <Stack pt={2} gap={2} alignItems="center">
          <Typography>Sube aquí tus archivos GeoJSON</Typography>
          <FileDragAndDrop
            value={files}
            onChange={setFiles}
            accept="application/json,.geojson"
            onDeleted={(_, index) => {
              setErrores((prev) => prev.filter((_, i) => i !== index));
            }}
            fileAction={(_, index) => 
              errores[index] ? (
                <Stack>
                  <Button
                    color="error"
                    variant="outlined"
                    onClick={handleVerErrores(index)}
                  >
                    Ver errores
                  </Button>
                </Stack>
              ) : null
            }
          />
          <Select
            label="Campus"
            name="campus"
            value={campusSeleccionado}
            onChange={setCampusSeleccionado}
            options={campus!}
            sx={{ width: 320 }}
          />
          <Button
            disabled={!files.length || !campusSeleccionado}
            sx={{ width: 'min-content', alignSelf: 'center' }}
            onClick={handleImportar}
          >
            Importar
          </Button>
        </Stack>
      </Fade>
    </>
  );
};

export default ImportarObjetos;
