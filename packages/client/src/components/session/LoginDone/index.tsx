import { FC, useCallback } from 'react';

import { Button, Stack, Typography } from '@mui/material';

import useStore from '../../../store';

const LoginDone: FC = () => {
  const setTourVisible = useStore(({ setTourVisible }) => setTourVisible);

  const handleClick = useCallback(() => {
    setTourVisible(true);
  }, [setTourVisible]);

  return (
    <Stack p={2} gap={4} alignItems="center">
      <Typography fontWeight="bold">¡Bienvenido a UNIMAP!</Typography>

      <Typography>Has iniciado sesión correctamente.</Typography>

      <Typography>
        Ahora puedes disfrutar de todas las funcionalidades de UNIMAP.
      </Typography>

      <Button onClick={handleClick}>Continuar</Button>
    </Stack>
  );
};

export default LoginDone;
