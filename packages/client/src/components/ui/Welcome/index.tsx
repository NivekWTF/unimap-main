import { AnimationEventHandler, FC, useEffect, useState } from 'react';

import { Stack } from '@mui/material';

import Logo from '../Logo';

import useStore from '../../../store';

const backgroundColor = 'rgb(36, 58, 69)';

const Welcome: FC = () => {
  const [welcomeEnd, setWelcomeEnd] = useState(false);

  const { isWelcomeVisible, setWelcomeVisible } = useStore(
    ({ isWelcomeVisible, setWelcomeVisible }) => ({
      isWelcomeVisible,
      setWelcomeVisible,
    })
  );

  useEffect(() => {
    setTimeout(() => {
      setWelcomeVisible(false);
    }, 1500);
  }, [setWelcomeVisible]);

  const removeElement: AnimationEventHandler<HTMLDivElement> = (event) => {
    const target = event.target as HTMLDivElement;
    target.remove();
    setWelcomeEnd(true);
  };

  const logoAnimationEnd: AnimationEventHandler<HTMLImageElement> = (event) => {
    const target = event.target as HTMLImageElement;
    const { animationName } = target.style;
    
    if (animationName !== 'fadeOut') return;
    
    setTimeout(() => {
      target.remove();
      setWelcomeEnd(true);
    }, 400);
  }
 
  if (welcomeEnd) return null;

  return (
    <Stack
      width="100vw"
      height="100svh"
      alignItems="center"
      justifyContent="center"
      direction="row"
      sx={{
        position: 'absolute',
        zIndex: 10,
        overflow: 'hidden',
      }}
    >
      <Stack
        sx={{
          backgroundColor,
          width: '50%',
          height: '100%',
          animation: !isWelcomeVisible ? 'slideLeft 0.5s ease-in' : '',
        }}
        onAnimationEnd={removeElement}
      />
      <Stack
        sx={{
          backgroundColor,
          width: '50%',
          height: '100%',
          animation: !isWelcomeVisible ? 'slideRight 0.5s ease-in' : '',
        }}
        onAnimationEnd={removeElement}
      />
      <Logo
        sx={{
          animation: isWelcomeVisible
            ? 'flipInX 1.2s ease-out'
            : 'fadeOut 0.6s ease-out',
          position: 'absolute',
        }}
        onAnimationStart={logoAnimationEnd}
      />
    </Stack>
  );
};

export default Welcome;
