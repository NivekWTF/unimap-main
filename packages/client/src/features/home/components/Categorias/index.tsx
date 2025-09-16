import { FC, useCallback } from 'react';

import { Stack, Chip, Icon } from '@mui/material';

import { type Categoria } from '../../../../utils/types';

type CategoriasProps = {
  categorias: Categoria[];
  onChange?: (categoria: Categoria) => void;
  value: string;
};

const Categorias: FC<CategoriasProps> = ({ categorias, onChange, value }) => {
  const handleClick = useCallback((categoria: Categoria) => {
    return () => onChange && onChange(categoria);
  }, [onChange]);

  const obtenerColor = (categoria: Categoria) => {
    if (categoria._id === value) return 'secondary';
    return 'primary';
  }

  return (
    <Stack id="categorias" direction="row" gap={1} maxWidth="100%" overflow="auto" pb={2} zIndex={1}>
      {categorias.map((categoria) => (
        <Chip
          key={categoria._id}
          onClick={handleClick(categoria)}
          variant="filled"
          color={obtenerColor(categoria)}
          label={categoria.nombre}
          icon={<Icon>{categoria.icono}</Icon>}
        />
      ))}
    </Stack>
  );
};

Categorias.defaultProps = {
  categorias: [],
};

export default Categorias;
