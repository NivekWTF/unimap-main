import { FC,  useState } from 'react';

import { Stack, Typography, Fade } from '@mui/material';

import LoginForm from '../LoginForm';
import Register from '../RegisterForm';

const LogIn: FC = () => {
  const [formType, setFormType] = useState<'login' | 'register'>('login');

  return (
    <Stack p={2} gap={4} alignItems="center">
      <Typography fontWeight="bold">
        Desbloquea el máximo potencial de UNIMAP!
      </Typography>
      <Fade key={formType} in>
        <Stack gap={4} alignItems="center">
          {formType === 'login' ? (
            <LoginForm onChangeFormType={setFormType} />
          ) : (
            <Register onChangeFormType={setFormType} />
          )}
        </Stack>
      </Fade>
    </Stack>
  );
};

export default LogIn;
