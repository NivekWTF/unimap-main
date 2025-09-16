import { FC, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import trpc from '@api';
import useSession from '../../hooks/useSession';
import Layout from '../Layout';

import useLogin from '../../hooks/useLogin';
import { Categoria, Usuario } from '../../utils/types';

const AuthLayout: FC = () => {
  const navigate = useNavigate();
  const usuario = useSession();
  const login = useLogin();

  const { mutate: revalidarSesion } = trpc.sesiones.revalidarAdmin.useMutation({
    onSuccess: ({ categorias, token, usuario }) => {
      login({
        usuario: usuario as unknown as Usuario,
        token,
        categorias: categorias as Categoria[],
      });
    },
    onError: () => {
      navigate('/login');
    },
  });

  useEffect(() => {
    if (usuario) return;

    const token = sessionStorage.getItem('token') as string;
    if (!token) navigate('/login');

    revalidarSesion({ token });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!usuario) return <></>;

  return <Layout />;
};

export default AuthLayout;
