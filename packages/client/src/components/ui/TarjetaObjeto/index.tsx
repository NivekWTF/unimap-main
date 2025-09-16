import { FC } from 'react';

import { Button } from '@mui/material';

import FadeIn from '../FadeIn';
import { Objeto } from '../../../utils/types';

type TarjetaObjetoProps = {
  objeto: Objeto;
  fadeInDelay?: number;
  onClick?: (_id: string) => void;
};

const TarjetaObjeto: FC<TarjetaObjetoProps> = ({ objeto, onClick, fadeInDelay }) => {
  const handleClick = () => {
    onClick?.(objeto._id);
  };

  return (
    <FadeIn delay={fadeInDelay} duration={0.7}>
      <Button
        onClick={handleClick}
        variant="contained"
        sx={{ width: 130, height: 120 }}
      >
        {objeto.nombre}
      </Button>
    </FadeIn>
  );
};

export default TarjetaObjeto;
