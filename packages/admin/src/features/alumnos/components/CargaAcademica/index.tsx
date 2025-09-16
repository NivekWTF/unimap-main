import { FC } from 'react';

import Paper from '@mui/material/Paper';
import { ViewState } from '@devexpress/dx-react-scheduler';
import {
  Scheduler,
  WeekView,
  Appointments,
} from '@devexpress/dx-react-scheduler-material-ui';

import { startOfWeek, add } from 'date-fns';

export type Carga = {
  horaInicio: string;
  horaFin: string;
  dia: number;
  lugar: { nombre: string };
  clase: { nombre: string };
};

type CargaAcademicaProps = {
  carga?: Carga[];
};

const CargaAcademica: FC<CargaAcademicaProps> = ({ carga }) => {
  const diaInicio = startOfWeek(new Date());

  const eventos = carga!
    .sort(({ dia: a }, { dia: b }) => a - b)
    .map(({ horaInicio, horaFin, dia, lugar, clase }) => ({
      startDate: add(diaInicio, {
        days: dia,
        hours: Number(horaInicio.split(':')[0]),
        minutes: Number(horaInicio.split(':')[1]),
      }),
      endDate: add(diaInicio, {
        days: dia,
        hours: Number(horaFin.split(':')[0]),
        minutes: Number(horaFin.split(':')[1]),
      }),
      title: `${clase.nombre} - ${lugar.nombre}`,
    }));

  return (
    <Paper>
      <Scheduler data={eventos} height={460} firstDayOfWeek={1} locale="es-ES">
        <ViewState />
        <WeekView startDayHour={6} endDayHour={21} />
        <Appointments />
        
      </Scheduler>
    </Paper>
  );
};

CargaAcademica.defaultProps = {
  carga: [],
};

export default CargaAcademica;
