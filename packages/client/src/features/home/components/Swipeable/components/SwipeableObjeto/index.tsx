import { FC, useState } from 'react';

import { Stack, Typography } from '@mui/material';

import ImagenesObjeto from '../../../../../../components/ui/ImagenesObjeto';
import SwipeableDrawer from '../../../../../../components/ui/SwipeableDrawer';

import useStore from '../../../../../../store';

const SwipeableObjeto: FC = () => {
  const { objetoSeleccionado } = useStore(({ objetoSeleccionado }) => ({
    objetoSeleccionado,
  }));

  const [open, setOpen] = useState(false);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  return (
    <SwipeableDrawer
      slideUp
      open={open}
      toggleDrawer={toggleDrawer}
      renderSlide={
        <Stack spacing={2} p={2}>
          <ImagenesObjeto />
          <Typography variant="h4" fontWeight={600}>
            {objetoSeleccionado?.nombre}
          </Typography>
          <Typography variant="body1" fontWeight={300}>
          {objetoSeleccionado?.descripcion}
        </Typography>
        </Stack>
      }
    >
      <Stack spacing={2} px={2}>
        <Stack direction="row" width="100%">
          <ImagenesObjeto imagenes={objetoSeleccionado?.urlImagenes} />
        </Stack>

        {!!objetoSeleccionado?.servicios.length && (
          <Stack>
            <Typography variant="h6" fontWeight={600}>
              ¿Qué servicios ofrece?
            </Typography>
            <Stack gap="4px" pt={1}>
              {objetoSeleccionado?.servicios?.map((servicio) => (
                <Typography key={servicio._id} variant="body1" fontWeight={500}>
                  {servicio.nombre}
                </Typography>
              ))}
            </Stack>
          </Stack>
        )}
      </Stack>
    </SwipeableDrawer>
  );
};

export default SwipeableObjeto;
