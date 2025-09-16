import { AnimationEventHandler, FC } from 'react';
import { SxProps, styled } from '@mui/material';

const Image = styled('img')({
  width: 100,
  height: 100,
});

type LogoProps = {
  sx?: SxProps;
  onAnimationStart?: AnimationEventHandler<HTMLImageElement> ;
};

const Logo: FC<LogoProps> = (props) => {
  return <Image {...props} src="/assets/img/logo.png" alt="Logo" />;
};

export default Logo;
