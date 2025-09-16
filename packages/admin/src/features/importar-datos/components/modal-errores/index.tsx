import { FC } from 'react';

import { Stack, Typography, Button, Dialog } from '@mui/material';

type ModalErroresProps = {
  mensaje: string | null;
  onClose: () => void;
  open: boolean;
};

const ModalErrores: FC<ModalErroresProps> = ({ mensaje, onClose, open }) => {
  return (
    <Dialog open={open}>
      <Stack minHeight={140} maxWidth={420} p={4} gap={3}>
        <Typography>Ocurrieron errores durante la importación</Typography>
        <Typography color="error">Error: {mensaje}</Typography>
      </Stack>
      <Typography sx={{ color: 'info.main', alignSelf: 'center' }}>
        Favor de verificar los archivos
      </Typography>
      <Stack justifyContent="center" gap={2} p={4}>
        <Button
          variant="outlined"
          sx={{ alignSelf: 'center' }}
          onClick={onClose}
        >
          Cerrar
        </Button>
      </Stack>
    </Dialog>
  );
};

export default ModalErrores;
