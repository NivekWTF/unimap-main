import { FC, useMemo, useState } from 'react';

import { Stack, Typography } from '@mui/material';

import api from '@api';
import useStore from '../../../../../../store';
import TarjetaObjeto from '../../../../../../components/ui/TarjetaObjeto';
import SwipeableDrawer from '../../../../../../components/ui/SwipeableDrawer';

import { Objeto } from '../../../../../../utils/types';

type SwipeableServiciosProps = {
  servicioId?: string;
  onObjetoSeleccionado: (_id: string) => void;
};

const SwipeableServicios: FC<SwipeableServiciosProps> = ({
  onObjetoSeleccionado,
  servicioId,
}) => {
  const campusId = useStore(({ campusId }) => campusId);

  const [open, setOpen] = useState(false);

  const { data: servicio } = api.servicios.obtenerPorId.useQuery({
    id: servicioId!,
    campus: campusId,
  }); 

  const objetos = useMemo(() => (servicio?.objetos || []) as unknown[] as Objeto[], [servicio]);

  const mensajeDisponibilidad = useMemo(() => {
    if (objetos.length === 0) {
      return 'Actualmente el servicio no se encuentra disponible en ningún lugar.';
    }

    if (objetos.length === 1) {
      return 'Este servicio se encuentra disponible en un solo lugar:';
    }

    return `Hay ${objetos.length} lugares que ofrecen este servicio:`;
  }, [objetos]);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  return (
    <SwipeableDrawer
      toggleDrawer={toggleDrawer}
      open={open}
      drawerBleeding={200}
      height="50%"
      renderSlide={
        <>
          <Stack p={2} gap={1}>
            <Typography variant="h4" fontWeight={600}>
              {servicio?.nombre}
            </Typography>
            <Typography variant="body1" fontWeight={300}>
              {servicio?.descripcion}
            </Typography>
          </Stack>
          <Stack spacing={2} px={2} pt={2}>
            <Typography fontWeight={500}>{mensajeDisponibilidad}</Typography>
          </Stack>
        </>
      }
      slideUp
    >
      <Stack flexBasis={180} direction="row" maxWidth="100%" gap={2} px={2}>
        {objetos.map((objeto, index) => (
          <TarjetaObjeto
            key={objeto._id}
            objeto={objeto}
            onClick={onObjetoSeleccionado}
            fadeInDelay={150 * (index + 1)}
          />
        ))}
      </Stack>
      <Stack position="relative" pt={2}></Stack>
    </SwipeableDrawer>
  );
};

export default SwipeableServicios;
