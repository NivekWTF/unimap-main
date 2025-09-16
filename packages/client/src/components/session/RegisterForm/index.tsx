import { FC, useState } from 'react';

import { Button, TextField, Typography } from '@mui/material';

import api from '@api';
import useAlert from '../../../hooks/useAlert';
import useStore from '../../../store';

type RegisterProps = {
  onChangeFormType: (formType: 'login') => void;
};

const Register: FC<RegisterProps> = ({ onChangeFormType }) => {
  const alert = useAlert();
  
  const { setUserModalOpen } = useStore(({ setUserModalOpen }) => ({
    setUserModalOpen,
  }));

  const [form, setForm] = useState({
    username: '',
  });

  const [errors, setErrors] = useState({
    username: '',
  });

  const { mutate: enviarPassword } = api.usuarios.enviarPassword.useMutation({
    onSuccess: () => {
      alert({
        message: 'El correo ha sido enviado correctamente!',
        type: 'success'
      });
      setUserModalOpen(false);
    },
    onError: ({
      message,
    }) => {
      alert({
        message,
        type: 'error',
      });
    }
  });

  const handleSubmit = () => {
    const newErrors = {
      username: form.username ? '' : 'Campo obligatorio',
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some((error) => error)) return;

    enviarPassword(form);
  }

  return (
    <>
      <Typography variant="body1">
        Te enviaremos un correo con una contraseña autogenerada a tu correo
        institucional
      </Typography>
      
      <TextField 
        label="Número de control" 
        value={form.username}
        onChange={(e) => setForm({ ...form, username: e.target.value })}
        error={Boolean(errors.username)}
        helperText={errors.username}
        fullWidth 
      />

      <Button variant="contained" onClick={handleSubmit}>
        <Typography variant="body1">Registrarme</Typography>
      </Button>

      <Button onClick={() => onChangeFormType('login')}>
        <Typography variant="body1">Iniciar sesión</Typography>
      </Button>
    </>
  );
};

export default Register;
