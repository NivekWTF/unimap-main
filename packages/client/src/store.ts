import { create } from 'zustand';

import { Map } from 'leaflet';

import { Objeto, Usuario } from './utils/types';
import { SwipeableTypes } from './constants/swipeable-types';
import { ItemBusqueda } from './features/home/components/SearchField';
import { ZOOM_OBJETO } from './constants/map';
import { LOCAL_STORAGE } from './constants/general';

type AlertProps = {
  message: string;
  type?: 'success' | 'error' | 'warning';
};

type GlobalState = {
  isAlertVisible: boolean;
  alertProps?: AlertProps;
  user: Usuario | null;
  authToken: string;
  showAlert: (alertProps: AlertProps) => void;
  setSession: (params: Usuario, token: string) => void;
  logOut: () => void;
  objetoSeleccionado: Objeto | null;
  setObjetoSeleccionado: (objeto: Objeto | null) => void;
  objetosPorId: Record<string, Objeto>;
  map?: Map | null;
  setMap: (map: Map) => void;
  pisoSeleccionado?: number;
  setPisoSeleccionado: (piso: number) => void;
  userModalOpen: boolean;
  setUserModalOpen: (open: boolean) => void;
  campusId: string;
  setCampusId: (campusId: string) => void;
  swipeableVisible: SwipeableTypes;
  itemBusquedaSelecionado: ItemBusqueda | null;
  abrirSwipeable: (tipo: SwipeableTypes, itemBusqueda: ItemBusqueda | null) => void;
  abrirSwipeableObjeto: (objetoId: string) => void;
  cerrarSwipeable: () => void;
  busqueda: string;
  setBusqueda: (busqueda: string) => void;
  isWelcomeVisible: boolean;
  setWelcomeVisible: (visible: boolean) => void;
  isTourVisible: boolean;
  setTourVisible: (visible: boolean) => void;
  setObjetosPorId: (objetos: Objeto[]) => void;
};

const useStore = create<GlobalState>((set, get) => ({
  /** Ui general */
  isAlertVisible: false,
  alertProps: undefined,
  showAlert: (alertProps: AlertProps) =>
    set({ isAlertVisible: true, alertProps }),
  
  /** Sesión */
  user: null,
  authToken: '',
  userModalOpen: false,
  setSession: (user, token) => {
    set({ user });
    localStorage.setItem(LOCAL_STORAGE.TokenKey, token);
  },
  logOut: () => {
    set({ user: null });
    localStorage.removeItem(LOCAL_STORAGE.TokenKey);
  },
  setUserModalOpen: (open) => set({ userModalOpen: open }),
  
  /** Mapa */
  categoriasPorId: {},
  map: null,
  objetoSeleccionado: null,
  objetosPorId: {},
  pisoSeleccionado: 1,
  campusId: '',
  setMap: (map) => set({ map }),
  setObjetoSeleccionado: (objeto) => set({ objetoSeleccionado: objeto }),
  setPisoSeleccionado: (piso) => set({ pisoSeleccionado: piso }),
  setCampusId: (campusId) => set({ campusId }),
  setObjetosPorId: (objetos) => {
    const objetosPorId = objetos.reduce((acc, objeto) => {
      acc[objeto._id] = objeto;
      return acc;
    }, {} as Record<string, Objeto>);
    set({ objetosPorId });
  },
  
  /** Swipeables */
  swipeableVisible: SwipeableTypes.None,
  abrirSwipeable: (tipo, itemBusqueda) => {
    set({ swipeableVisible: tipo, itemBusquedaSelecionado: itemBusqueda });
  },
  cerrarSwipeable: () => set({ swipeableVisible: SwipeableTypes.None, itemBusquedaSelecionado: null }),
  abrirSwipeableObjeto: (objetoId) => {
    const { map, objetosPorId } = get();
    const objeto = objetosPorId[objetoId];
    if (!map || !objeto) return;
    map.flyTo(objeto.centroide!, ZOOM_OBJETO);
    set({ 
      swipeableVisible: SwipeableTypes.Objetos, 
      objetoSeleccionado: get().objetosPorId[objetoId], 
    });
  },
  
  /** Búsqueda */
  busqueda: '',
  itemBusquedaSelecionado: null,
  setBusqueda: (busqueda) => set({ busqueda }),
  
  /** Animacion de entrada */
  isWelcomeVisible: true,
  setWelcomeVisible: (visible) => set({ isWelcomeVisible: visible }),
  
  /** Tour de bienvenida */
  isTourVisible: !localStorage.getItem(LOCAL_STORAGE.TourKey),
  setTourVisible: (visible) => set({ isTourVisible: visible }),
}));

export default useStore;
