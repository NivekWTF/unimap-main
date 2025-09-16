import { FC, useCallback } from 'react';

import { Stack } from '@mui/material';

import SeleccionPiso from '../SeleccionPiso';
import useStore from '../../../../store';
import CloseButton from '../../../../components/ui/CloseButton';

export type ControlesObjetoProps = {
  onClose: () => void;
};

const ControlesObjeto: FC<ControlesObjetoProps> = ({ onClose }) => {
  const { objetoSeleccionado, setPisoSeleccionado, pisoSeleccionado } =
    useStore(
      ({ objetoSeleccionado, setPisoSeleccionado, pisoSeleccionado }) => ({
        objetoSeleccionado,
        setPisoSeleccionado,
        pisoSeleccionado,
      })
    );

  const { pisos = 1 } = objetoSeleccionado || {};

  const handlePisoChange = useCallback(
    (piso: number) => {
      setPisoSeleccionado(piso);
    },
    [setPisoSeleccionado]
  );

  if (!objetoSeleccionado) return null;

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      width="100%"
      alignItems="flex-start"
    >
      <SeleccionPiso
        onChange={handlePisoChange}
        value={pisoSeleccionado}
        numeroPisos={pisos}
      />
      <CloseButton onClick={onClose} />
    </Stack>
  );
};

export default ControlesObjeto;
