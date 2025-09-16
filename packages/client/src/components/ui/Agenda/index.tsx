import { FC, useCallback, useMemo } from 'react';

import Paper from '@mui/material/Paper';
import { ViewState } from '@devexpress/dx-react-scheduler';
import {
  Scheduler,
  WeekView,
  Appointments,
  DayView,
  ViewSwitcher,
  Toolbar,
} from '@devexpress/dx-react-scheduler-material-ui';

import { startOfWeek, add } from 'date-fns';
import LocalizedViewSwitcher from './components/view-switcher';

export type Carga = {
  horaInicio: string;
  horaFin: string;
  dia: number;
  lugar: { _id: string; nombre: string; nombreCorto?: string };
  clase: { _id: string; nombre: string };
};

type AgendaProps = {
  carga?: Carga[];
  onClick?: (carga: Carga) => void;
};

const Agenda: FC<AgendaProps> = ({ carga, onClick }) => {
  const diaInicio = startOfWeek(new Date());

  const eventos = useMemo(
    () =>
      carga!
        .sort(({ dia: a }, { dia: b }) => a - b)
        .map((carga) => {
          const { horaInicio, horaFin, dia, lugar, clase } = carga;
          return {
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
            carga,
            title: `${clase.nombre}, ${lugar.nombreCorto} - ${lugar.nombre}`,
          };
        }),
    [carga, diaInicio]
  );

  const handleAppointmentClick = useCallback(({ data }: {
    target: HTMLElement;
    data: (typeof eventos)[0];
  }) => {
    const { carga } = data;
    onClick!(carga);
  }, [onClick]);

  return (
    <Paper>
      <Scheduler data={eventos} height={460} firstDayOfWeek={1} locale="es-ES">
        <ViewState defaultCurrentViewName="Day" />
        <WeekView startDayHour={6} endDayHour={24} />
        <DayView startDayHour={6} endDayHour={24} />
        <Appointments
          appointmentComponent={({ children, ...props }) => (
            <Appointments.Appointment
              {...props}
              onClick={handleAppointmentClick}
            >
              {children}
            </Appointments.Appointment>
          )}
        />
        <Toolbar />
        <ViewSwitcher switcherComponent={LocalizedViewSwitcher} />
      </Scheduler>
    </Paper>
  );
};

Agenda.defaultProps = {
  carga: [],
  onClick: () => {},
};

export default Agenda;
