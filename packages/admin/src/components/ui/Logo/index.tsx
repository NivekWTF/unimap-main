import { FC, ImgHTMLAttributes } from 'react';
import { SxProps, styled } from '@mui/material';

type LogoProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & { sx: SxProps }; 

const StyledImg = styled('img')({});

const Logo: FC<LogoProps> = (props) => {
  return <StyledImg {...props} src='assets/img/logo.png' />
};

export default Logo;