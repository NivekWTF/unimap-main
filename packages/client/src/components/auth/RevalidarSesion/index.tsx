import { useCallback, useEffect } from 'react';

import api from '@api';
import useSession from '../../../hooks/useSession';
import { Usuario } from '../../../utils/types';
import { LOCAL_STORAGE } from '../../../constants/general';

const RevalidarSesion = () => {
  const { setSession } = useSession();

  const { mutate: revalidarSesion } = api.sesiones.revalidarCliente.useMutation({
    onSuccess: ({ usuario, token }) => {
      setSession(usuario as unknown as Usuario, token);
    },
  });

  const verificarSesion = useCallback(() => {
    const token = localStorage.getItem(LOCAL_STORAGE.TokenKey);
    if (!token) return;
    revalidarSesion({ token });
  }, [revalidarSesion]);

  useEffect(() => {
    verificarSesion();
  }, [verificarSesion]);

  return null;
};

export default RevalidarSesion;
