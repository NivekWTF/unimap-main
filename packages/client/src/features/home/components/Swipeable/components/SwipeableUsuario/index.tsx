import { FC, useCallback, useMemo, useState } from 'react';
import { getDay, getHours } from 'date-fns';

import { Avatar, Button, IconButton, Stack, Typography } from '@mui/material';
import { Logout } from '@mui/icons-material';

import Agenda, { Carga } from '../../../../../../components/ui/Agenda';
import SwipeableDrawer from '../../../../../../components/ui/SwipeableDrawer';

import useSession from '../../../../../../hooks/useSession';
import useStore from '../../../../../../store';
import {
  formatearHorasClase,
  parseHour,
} from '../../../../../../utils/functions';

const SwipeableUsuario: FC = () => {
  const { user } = useSession();

  const { logOut, cerrarSwipeable, abrirSwipeableObjeto } = useStore(
    ({ logOut, cerrarSwipeable, abrirSwipeableObjeto }) => ({
      logOut,
      cerrarSwipeable,
      abrirSwipeableObjeto,
    }),
  );

  const [open, setOpen] = useState<boolean>(false);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const cargaAcademica = useMemo(() => user?.cargaAcademica, [user]);

  const clasesHoy = useMemo(() => {
    const diaHoy = getDay(new Date());

    const clases = cargaAcademica
      ?.filter(({ dia }) => dia === diaHoy)
      .sort((a, b) => {
        const { hour: horaInicioA, minutes: minutoInicioA } = parseHour(
          a.horaInicio,
        );
        const { hour: horaInicioB, minutes: minutoInicioB } = parseHour(
          b.horaInicio,
        );
        if (horaInicioA !== horaInicioB) return horaInicioA - horaInicioB;
        return minutoInicioA - minutoInicioB;
      });

    return clases;
  }, [cargaAcademica]);

  const claseActual = useMemo(() => {
    const horaActual = getHours(new Date());
    const clase = clasesHoy?.find(({ horaInicio, horaFin }) => {
      const { hour: horaInicioClase } = parseHour(horaInicio);
      const { hour: horaFinClase } = parseHour(horaFin);
      return horaInicioClase <= horaActual && horaActual <= horaFinClase;
    });
    return clase;
  }, [clasesHoy]);

  const claseSiguiente = useMemo(() => {
    const horaActual = getHours(new Date());
    const clase = clasesHoy?.find(({ horaInicio }) => {
      const { hour: horaInicioClase } = parseHour(horaInicio);
      return horaInicioClase > horaActual;
    });
    return clase;
  }, [clasesHoy]);

  const horaFormatoClaseSiguiente = useMemo(() => {
    if (!claseSiguiente) return '';
    return formatearHorasClase(claseSiguiente);
  }, [claseSiguiente]);

  const horaFormatoClaseActual = useMemo(() => {
    if (!claseActual) return '';
    return formatearHorasClase(claseActual);
  }, [claseActual]);

  const handleLogOut = useCallback(() => {
    logOut();
    cerrarSwipeable();
  }, [logOut, cerrarSwipeable]);

  const handleClaseClick = useCallback(
    (carga: Carga) => {
      abrirSwipeableObjeto(carga.lugar._id);
    },
    [abrirSwipeableObjeto],
  );

  const handleClaseSiguienteClick = useCallback(() => {
    const { lugar } = claseSiguiente!;
    abrirSwipeableObjeto(lugar._id);
  }, [abrirSwipeableObjeto, claseSiguiente]);

  const handleClaseActualClick = useCallback(() => {
    const { lugar } = claseActual!;
    abrirSwipeableObjeto(lugar._id);
  }, [abrirSwipeableObjeto, claseActual]);

  return (
    <SwipeableDrawer
      open={open}
      toggleDrawer={toggleDrawer}
      drawerBleeding={150}
      renderSlide={
        <Stack p={2} gap={2}>
          <Stack direction="row" gap={2} alignItems="center">
            <Avatar />
            <Stack direction="row" gap={1}>
              <Typography variant="h5" fontWeight={500}>
                {user?.nombres}
              </Typography>
              <Typography variant="h5" fontWeight={500}>
                {user?.apellidos}
              </Typography>
            </Stack>
            <IconButton onClick={handleLogOut} sx={{ marginLeft: 'auto' }}>
              <Logout />
            </IconButton>
          </Stack>

          {!clasesHoy?.length && (
            <Typography variant="body1">
              Vaya día! No tienes ninguna clase asignada hoy
            </Typography>
          )}

          {!claseActual && !claseSiguiente && (
            <Typography variant="body1">
              Has finalizado tus clases el día de hoy!
            </Typography>
          )}

          {!claseActual && claseSiguiente && (
            <Typography variant="body1">
              Tú siguiente clase {claseSiguiente.clase.nombre} es en{' '}
              <Button
                variant="contained"
                onClick={handleClaseSiguienteClick}
                color="secondary"
              >
                {claseSiguiente.lugar.nombreCorto ||
                  claseSiguiente.lugar.nombre}
              </Button>{' '}
              de {horaFormatoClaseSiguiente}
            </Typography>
          )}

          {claseActual && (
            <Typography variant="body1">
              Tienes clase {claseActual.clase.nombre} es en{' '}
              <Button
                variant="contained"
                onClick={handleClaseActualClick}
                color="secondary"
              >
                {claseActual.lugar.nombreCorto || claseActual.lugar.nombre}
              </Button>{' '}
              de {horaFormatoClaseActual}
            </Typography>
          )}
        </Stack>
      }
      slideUp
    >
      <Agenda carga={cargaAcademica} onClick={handleClaseClick} />
    </SwipeableDrawer>
  );
};

export default SwipeableUsuario;
