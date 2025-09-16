import { FC, useCallback, useState } from "react";

import { Dialog, Stack, Fade, Typography, Button } from "@mui/material";

import FileDragAndDrop from "../../forms/FileDragAndDrop";

type ModalImportarDatosProps = {
  open: boolean;
  onClose?: () => void;
  errorMessage?: string;
  onImportar: (file: File) => void;
  isLoading: boolean;
  urlFormato: string;
}

const ModalImportarDatos: FC<ModalImportarDatosProps> = ({
  onClose, open, errorMessage, onImportar, isLoading, urlFormato,
}) => {
  const [files, setFiles] = useState<File[]>([]);

  const handleImportar = () => {
    const [file] = files
    onImportar(file);
  }

  const handleClose = useCallback(() => {
    setTimeout(() => setFiles([]), 200);
    if (onClose) onClose();
  }, [onClose]);

  return (
    <Dialog open={open} onClose={handleClose}>
      <Stack minWidth={440} minHeight={360}>
        {!errorMessage && (
          <Fade in>
            <Stack py={4} px={2} alignItems="center" gap={2}>
              <Typography>
                Solo se admiten archivos csv con el siguiente formato:
              </Typography>
              <Button variant="outlined" href={urlFormato} download>
                Descargar formato
              </Button>
              <FileDragAndDrop
                value={files}
                onChange={setFiles}
                accept=".csv"
                maxFiles={1}
              />
              <Button
                onClick={handleImportar}
                disabled={!files.length || isLoading}
              >
                Importar
              </Button>
            </Stack>
          </Fade>
        )}
        {errorMessage && (
          <Fade in>
            <Stack py={4} px={2} alignItems="center" gap={2} flexGrow={1}>
              <Typography>
                Ocurrió un error al realizar la importación
              </Typography>
              <Typography sx={{ flexGrow: 1 }} color="error">
                {errorMessage}
              </Typography>
              <Button onClick={handleClose} variant="outlined">
                Cerrar
              </Button>
            </Stack>
          </Fade>
        )}
      </Stack>
    </Dialog>
  );
};

export default ModalImportarDatos;
