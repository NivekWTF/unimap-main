import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { Alert, Button, Paper, Stack, Typography } from '@mui/material';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';

import Form from '../../components/forms/Form';
import FormField from '../../components/forms/FormField';

import api from '@api';
import useLogin from '../../hooks/useLogin';
import { Formularios } from '../../constant/mensajes';
import { Categoria, Usuario } from '../../utils/types';

const loginSchema = z.object({
  username: z.string().min(1, Formularios.required),
  password: z.string().min(1, Formularios.required),
});

export default function Auth() {
  const login = useLogin();

  const [error, setError] = useState<string>('');

  const form = useForm({ resolver: zodResolver(loginSchema) });

  const { mutate: loginMut, isLoading } = api.sesiones.loginAdmin.useMutation({
    onSuccess: ({ usuario, token, categorias }) =>
      login({
        usuario: usuario as unknown as Usuario,
        token,
        categorias: categorias as Categoria[],
      }),
    onError: ({ message }) => {
      setError(message);
    },
  });

  return (
    <Box
      height="100svh"
      width="100%"
      display="flex"
      alignContent="center"
      justifyContent="center"
      sx={{ backgroundColor: 'primary.300' }}
    >
      <Stack maxWidth={440} width="100%" justifyContent="center">
        <Paper sx={{ overflow: 'hidden' }}>
          <Box
            height={80}
            width="100%"
            sx={{
              backgroundColor: 'primary.main',
              color: 'common.white',
              display: 'flex',
              justifyContent: 'center',
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}
            pl={3}
          >
            <Typography variant="h4" fontWeight="bold" align="center">
              Unimap Admin
            </Typography>
          </Box>
          <Stack py={2} position="relative">
            <Stack py={4} px={3} gap={2}>
              <Typography variant="h4">Bienvenido!</Typography>
              <Typography variant="body1">
                Ingrese sus credenciales para iniciar sesión
              </Typography>
            </Stack>

            <Form form={form} onSubmit={loginMut}>
              <Stack pt={6} px={3} pb={6} gap={3}>
                <FormField name="username" label="Usuario" />
                <FormField name="password" label="Contraseña" type="password" />
              </Stack>

              <Stack py={4} alignItems="center" gap={2}>
                {error && <Alert severity="error">{error}</Alert>}
                <Button
                  type="submit"
                  sx={{ width: '50%', display: 'flex', gap: 2 }}
                  disabled={isLoading}
                >
                  Iniciar
                </Button>
              </Stack>
            </Form>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}
