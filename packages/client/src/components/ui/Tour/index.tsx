import { FC } from 'react';

import Joyride, {
  CallBackProps,
  EVENTS,
  STATUS,
  Step,
} from 'react-joyride';

import useStore from '../../../store';
import { Typography, useTheme } from '@mui/material';

const locale = {
  skip: 'Omitir',
  next: 'Siguiente',
  close: 'Siguiente',
  back: 'Atrás',
};

const Tour: FC = () => {
  const { palette } = useTheme();

  const { isTourVisible, setTourVisible, isWelcomeVisible } = useStore(
    ({ isTourVisible, setTourVisible, isWelcomeVisible }) => ({
      isTourVisible,
      setTourVisible,
      isWelcomeVisible,
    })
  );

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type } = data;

    if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type as any)) {
      return;
    }

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      setTourVisible(false);
      localStorage.setItem('tour', 'true');
    }
  };

  const styles = {
    options: {
      primaryColor: palette.primary.main,
    },
  }

  const steps: Step[] = [
    {
      target: '*',
      content: <Typography variant="h6">¡Bienvenido a UNIMAP!</Typography>,
      disableBeacon: true,
      floaterProps: {
        hideArrow: true,
        placement: 'center',
      },
      locale,
      showProgress: true,
      hideCloseButton: true,
      styles,
    },
    {
      target: '#mapa',
      content: (
        <Typography variant="body1">
          Este es el mapa de tu campus, aquí podrás encontrar información
          relevante sobre los lugares con los cuenta tu universidad.
        </Typography>
      ),
      disableBeacon: true,
      locale,
      hideCloseButton: true,
      styles,
    },
    {
      target: '#categorias',
      content: <Typography>
        Aquí puedes filtrar los lugares que muestra el mapa por categorías y servicios
      </Typography>,
      disableBeacon: true,
      locale,
      hideCloseButton: true,
      styles,
    },
    {
      target: '#searchField',
      content: <Typography>
        Aquí puedes buscar un lugar, actividad o servicio específico en el campus.
      </Typography>,
      disableBeacon: true,
      locale,
      hideCloseButton: true,
      styles,
    },
    {
      target: '#avatar',
      content: <Typography>
        Aquí puedes iniciar sesión como estudiante y acceder a tu perfil.
      </Typography>,
      disableBeacon: true,
      locale,
      hideCloseButton: true,
      styles,
    },
    {
      target: '*',
      content: <Typography>
        ¡Listo! Ahora puedes explorar el mapa y conocer más sobre tu campus.
      </Typography>,
      disableBeacon: true,
      locale: { ...locale,  close: 'Finalizar',  },
      hideCloseButton: true,
      styles,
      floaterProps: {
        hideArrow: true,
        placement: 'center',
      },
    },
  ];

  return (
    <Joyride
      run={isTourVisible && !isWelcomeVisible}
      steps={steps}
      callback={handleJoyrideCallback}
      scrollToFirstStep
      showProgress
      showSkipButton
    />
  );
};

export default Tour;
