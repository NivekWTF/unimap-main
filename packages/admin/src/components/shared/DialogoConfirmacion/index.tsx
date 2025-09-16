import { FC, useCallback } from 'react';

import Box from '@mui/material/Box';

import { Button, Dialog, Stack, Typography } from '@mui/material';

interface DialogoConfirmacionProps {
  onClose?: (confirmado: boolean) => void;
  open: boolean;
  mensaje?: string;
}

const DialogoConfirmacion: FC<DialogoConfirmacionProps> = ({
  open,
  onClose,
  mensaje,
}) => {
  const handleClose = useCallback(
    (confirmado: boolean) => {
      return () => {
        if (onClose) onClose(confirmado);
      };
    },
    [onClose]
  );

  return (
    <Dialog open={open}>
      <Stack p={4} gap={2}>
        <Typography variant="h6">¿Estás seguro?</Typography>
        <Typography>{mensaje}</Typography>
        <Box display="flex" width="100%" justifyContent="space-between" pt={2}>
          <Button variant="text" onClick={handleClose(false)}>
            Cancelar
          </Button>
          <Button variant="text" onClick={handleClose(true)}>
            Confirmar
          </Button>
        </Box>
      </Stack>
    </Dialog>
  );
};

DialogoConfirmacion.defaultProps = {
  onClose: () => {},
  mensaje: 'Se perderán los cambios realizados',
};

export default DialogoConfirmacion;
