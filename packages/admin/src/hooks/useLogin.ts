import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

import useStore from '../store';
import axios from '../config/axios';
import { Usuario, Categoria } from '../utils/types';

type LoginArgs = {
  usuario: Usuario;
  token: string;
  categorias: Categoria[];
};

const useLogin = () => {
  const navigate = useNavigate();
  const setSession = useStore(({ setSession }) => setSession);

  const login = useCallback(
    ({ usuario, token, categorias }: LoginArgs) => {
      sessionStorage.setItem('token', token);
      axios.defaults.headers.common.Authorization = token;
      setSession({
        usuario,
        categorias,
        authToken: token,
      });
      navigate('/');
    },
    [navigate, setSession]
  );

  return login;
};

export default useLogin;
