import { FC } from 'react';

import { Card, ImageListItem, Stack } from '@mui/material';

type ImagenesObjetoProps = {
  imagenes?: string[];
};

const ImagenesObjeto: FC<ImagenesObjetoProps> = ({ imagenes }) => {
  return (
    <Stack direction="row" overflow="auto" spacing={2}>
      {imagenes!.map((src) => (
        <ImageListItem key={src}>
          <Card sx={{ width: 260 }} variant="outlined">
            <Stack alignItems="center">
              <img
                src={src}
                alt={`imagen-${src}`}
                style={{ objectFit: 'contain', height: '200px' }}
              />
            </Stack>
          </Card>
        </ImageListItem>
      ))}
    </Stack>
  );
};

ImagenesObjeto.defaultProps = {
  imagenes: [],
};

export default ImagenesObjeto;
