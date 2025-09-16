 
import { FC, ReactNode } from 'react';

import { UseFormReturn } from 'react-hook-form';

import { Stack, Typography, Grid, Button } from '@mui/material';

import Form from '../../components/forms/Form';

export type FormularioProps = {
  onSubmit?: (data: any) => any;
  onCancel?: () => void;
  children?: ReactNode;
  form: UseFormReturn<any>;
  title?: ReactNode | string;
  isLoading?: boolean;
  hideGuardar?: boolean;
  action?: ReactNode;
};

const Formulario: FC<FormularioProps> = ({
  children,
  onCancel,
  onSubmit,
  form,
  title,
  isLoading,
  hideGuardar,
  action,
}) => {
  return (
    <Stack width="100%">
      <Typography variant="h5">{title}</Typography>
      <Form form={form} onSubmit={onSubmit!}>
        <Grid
          pt={4}
          display="grid"
          gridTemplateColumns="1fr 1fr"
          maxHeight="100%"
          overflow="auto"
          rowGap={3}
          columnGap={3}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            gridColumn="span 2"
          >
            <Typography variant="h6" color="info.main" gridColumn="span 2">
              Datos generales
            </Typography>
            <Stack direction="row" gap={2}>
              {action}
              {!hideGuardar && <Button type="submit" disabled={isLoading}>
                Guardar
              </Button>}
              <Button onClick={onCancel} variant="outlined">
                Regresar
              </Button>
            </Stack>
          </Stack>
          {children}
        </Grid>
      </Form>
    </Stack>
  );
};

Formulario.defaultProps = {
  isLoading: false,
  onSubmit: () => {},
  onCancel: () => {},
};

export default Formulario;
