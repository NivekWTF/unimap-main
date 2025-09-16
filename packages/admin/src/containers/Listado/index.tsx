import { ChangeEvent, FC, ReactNode, memo, useCallback } from 'react';

import { Link, SetURLSearchParams } from 'react-router-dom';
import { Button, Grid, Pagination, Stack, Typography } from '@mui/material';

import SearchField from '../../components/forms/SearchField';

type ListadoProps = {
  titulo: string;
  children?: ReactNode;
  onSearchChange?: (text: string) => void;
  redirect?: string;
  page?: number | string | null;
  totalPages?: number | string | null;
  onPageChange?: (page: number) => void;
  onChangeSearchParams?: SetURLSearchParams;
  action?: ReactNode;
  hideAgregar?: boolean;
};

const Listado: FC<ListadoProps> = memo(({
  titulo,
  onSearchChange,
  children,
  redirect,
  onPageChange,
  page,
  totalPages,
  onChangeSearchParams,
  action,
  hideAgregar,
}) => {
  const handleSearchChange = useCallback(
    (q: string) => {
      if (onSearchChange) {
        onSearchChange(q);
      }
      if (onChangeSearchParams) {
        onChangeSearchParams((prev) => {
          prev.set('q', q);
          return prev;
        });
      }
    },
    [onChangeSearchParams, onSearchChange]
  );

  const handlePageChange = useCallback(
    (_: ChangeEvent<unknown>, page: number) => {
      if (onPageChange) {
        onPageChange(page);
      }
      if (onChangeSearchParams) {
        onChangeSearchParams((prev) => {
          prev.set('pagina', page.toString() || '1');
          return prev;
        });
      }
    },
    [onPageChange, onChangeSearchParams]
  );

  return (
    <Stack width="100%" height="100%">
      <Typography variant="h5">{titulo}</Typography>
      <Stack direction="row" pt={2} gap={2} >
        <SearchField onChange={handleSearchChange!} />
        {!hideAgregar && <Link to={redirect!}>
          <Button sx={{ height: '100%' }}>Agregar</Button>
        </Link>}
        {action}
      </Stack>
      <Grid
        pt={4}
        pb={2}
        display="grid"
        gridTemplateColumns="repeat(3, 1fr)"
        height="80%"
        gap={2}
        sx={{
          '& MuiBox-root': {
            alignSelf: 'flex-start',
          },
        }}
      >
        {children}
      </Grid>
      <Stack direction="row" justifyContent="flex-end">
        <Pagination
          count={Number(totalPages) || 1}
          onChange={handlePageChange}
          page={Number(page) || 1}
        />
      </Stack>
    </Stack>
  );
});

Listado.defaultProps = {
  redirect: 'formulario',
  onSearchChange: () => {},
};

export default Listado;
