import { FC, Fragment, useCallback } from 'react';

import {
  List,
  ListItem,
  Typography,
  type SelectChangeEvent,
  Divider,
  Collapse,
  FormControlLabel,
  Radio,
  RadioGroup,
} from '@mui/material';

import { crearArregloNumerico } from '../../../../utils/functions';

export type SeleccionPisoProps = {
  numeroPisos: number;
  value?: number;
  onChange: (piso: number) => void;
};

const SeleccionPiso: FC<SeleccionPisoProps> = ({
  numeroPisos,
  onChange,
  value,
}) => {
  const handleChange = useCallback(
    (event: SelectChangeEvent<number>) => {
      const { value } = event.target;
      onChange(Number(value));
    },
    [onChange],
  );

  const opciones = crearArregloNumerico(1, numeroPisos + 1);

  return (
    <Collapse in={numeroPisos > 1}>
      <RadioGroup onChange={handleChange} value={value}>
        {numeroPisos > 1 && (
          <List sx={{ backgroundColor: 'common.white' }}>
            {opciones.map((piso, index) => (
              <Fragment key={piso}>
                <ListItem>
                  <FormControlLabel
                    value={piso}
                    control={<Radio />}
                    label={<Typography noWrap>{`Piso ${piso}`}</Typography>}
                  />
                </ListItem>
                {index !== opciones.length - 1 && <Divider />}
              </Fragment>
            ))}
          </List>
        )}
      </RadioGroup>
    </Collapse>
  );
};

export default SeleccionPiso;
