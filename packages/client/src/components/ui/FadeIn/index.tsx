import { FC, useEffect, useState } from 'react';

import { styled } from '@mui/material';

type FadeInProps = {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
};

const StyleDiv = styled('div')({
  '@keyframes fadeIn': {
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
  animation: 'fadeIn 0.5s ease',
});

const FadeIn: FC<FadeInProps> = ({ children, delay, duration }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setVisible(true);
    }, delay || 0);
  }, [delay]);

  if (!visible) return null;

  return (
    <StyleDiv
      sx={{
        animationDuration: `${duration || 0.5}s`,
      }}
    >
      {children}
    </StyleDiv>
  );
};

export default FadeIn;
