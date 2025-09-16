import { FC, useMemo } from 'react';

import SwipeableClases from './components/SwipeableClases';
import SwipeableServicios from './components/SwipeableServicios';
import SwipeableObjeto from './components/SwipeableObjeto';

import useStore from '../../../../store';
import { SwipeableTypes } from '../../../../constants/swipeable-types';
import SwipeableUsuario from './components/SwipeableUsuario';

type SwipeableProps = {
  onObjetoSeleccionado: (_id: string) => void;
};

const Swipeable: FC<SwipeableProps> = ({ onObjetoSeleccionado }) => {
  const { swipeableVisible, itemBusquedaSelecionado } = useStore(
    ({ swipeableVisible, itemBusquedaSelecionado }) => ({
      swipeableVisible,
      itemBusquedaSelecionado,
    })
  );

  const swipeablesPorTipo = useMemo(
    () => ({
      [SwipeableTypes.Objetos]: <SwipeableObjeto />,
      [SwipeableTypes.Servicios]: (
        <SwipeableServicios
          servicioId={itemBusquedaSelecionado?._id}
          onObjetoSeleccionado={onObjetoSeleccionado}
        />
      ),
      [SwipeableTypes.Clases]: <SwipeableClases />,
      [SwipeableTypes.Usuario]: <SwipeableUsuario />,
    }),
    [onObjetoSeleccionado, itemBusquedaSelecionado]
  );

  if (swipeableVisible === SwipeableTypes.None) return null;

  const swipeable = swipeablesPorTipo[swipeableVisible];

  return swipeable;
};

export default Swipeable;
