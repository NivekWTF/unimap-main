import { create } from 'zustand';

import { Usuario, CategoriasPorId, Categoria } from './utils/types';

type AlertProps = {
  message: string;
  type?: 'success' | 'error' | 'warning';
};

type SetSessionParam = {
  usuario: Usuario;
  authToken: string;
  categorias: Categoria[];
};

type GlobalState = {
  isAlertVisible: boolean;
  alertProps?: AlertProps;
  user: Usuario | null;
  authToken: string;
  categoriasPorId: CategoriasPorId;
  showAlert: (alertProps: AlertProps) => void;
  setSession: (params: SetSessionParam) => void;
  logOut: () => void;
};

const useStore = create<GlobalState>((set) => ({
  isAlertVisible: false,
  alertProps: undefined,
  user: null,
  authToken: '',
  categoriasPorId: {},
  showAlert: (alertProps: AlertProps) =>
    set({ isAlertVisible: true, alertProps }),
  setSession: ({ usuario: user, authToken, categorias }) => {
    const categoriasPorId = categorias.reduce((acc, categoria) => {
      acc[categoria._id] = categoria as Categoria;
      return acc;
    }, {} as CategoriasPorId);
    set({ user, authToken, categoriasPorId });
  },
  logOut: () => {
    set({ user: null });
    sessionStorage.removeItem('token');
  },
}));

export default useStore;
