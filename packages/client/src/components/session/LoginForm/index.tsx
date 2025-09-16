import { FC, FormEventHandler, useState } from 'react';

import { TextField, Typography, Button, Stack } from '@mui/material';

import api from '@api';
import useStore from '../../../store';
import useAlert from '../../../hooks/useAlert';
import { Usuario } from '../../../utils/types';

type LoginFormProps = {
  onChangeFormType: (type: 'register') => void;
};

const LoginForm: FC<LoginFormProps> = ({ onChangeFormType }) => {
  const setAlert = useAlert();

  const { setSession, setUserModalOpen } = useStore(
    ({ setSession, setUserModalOpen }) => ({
      setSession,
      setUserModalOpen,
    })
  );

  const { mutate: login, isLoading } = api.sesiones.loginCliente.useMutation({
    onSuccess: ({ usuario, token }) => {
      setSession(usuario as unknown as Usuario, token);
      console.log(usuario);
      setUserModalOpen(false);
      setAlert({
        message: `Bienvenido de vuelta, ${usuario.nombres}!`,
        type: 'success',
      });
    },
  });

  const [form, setForm] = useState({
    username: '',
    password: '',
  });

  const [errors, setErrors] = useState({
    username: '',
    password: '',
  });

  const handleLogIn: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    const newErrors = {
      username: form.username ? '' : 'Campo obligatorio',
      password: form.password ? '' : 'Campo obligatorio',
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some((error) => error)) return;

    login(form);
  };

  return (
    <form onSubmit={handleLogIn}>
      <Stack gap={4}>
        <Typography>
          Inicia sesión para acceder a todas las funciones de la aplicación.
        </Typography>
        <TextField
          label="Número de control"
          fullWidth
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          error={Boolean(errors.username)}
          helperText={errors.username}
        />
        <TextField
          label="Contraseña"
          type="password"
          fullWidth
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          error={Boolean(errors.password)}
          helperText={errors.password}
        />
        <Button variant="contained" type="submit" disabled={isLoading}>
          Iniciar sesión
        </Button>
        <Typography>
          ¿No tienes cuenta?{' '}
          <Button
            onClick={() => onChangeFormType('register')}
            color="primary"
            variant="text"
          >
            Regístrate
          </Button>
        </Typography>
      </Stack>
    </form>
  );
};

export default LoginForm;
