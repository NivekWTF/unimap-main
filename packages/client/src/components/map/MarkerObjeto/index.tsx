import { FC } from 'react';

import { Objeto } from '../../../utils/types';
import { Stack, Typography } from '@mui/material';

type MarkerObjetoProps = {
  objeto?: Objeto;
};

const MarkerObjeto: FC<MarkerObjetoProps> = ({ objeto }) => {
  const { nombreCorto, nombre } = objeto || {};

  return (
    <Stack justifyContent="center" alignItems="center">
      <Typography
        style={{
          textAlign: 'center',
          fontWeight: 500,
          margin: 0,
          fontSize: 16,
          color: 'white',
        }}
      >
        {nombreCorto || nombre}
      </Typography>
    </Stack>
  );
};

export default MarkerObjeto;
