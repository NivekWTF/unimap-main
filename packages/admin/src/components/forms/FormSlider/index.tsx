import { FC } from 'react';

import { Controller, useFormContext } from 'react-hook-form';

import Slider from '@mui/material/Slider';
import Box from '@mui/material/Box';
import { Stack, SxProps, Typography } from '@mui/material';

interface FormSliderProps {
  defaultValue: number | string;
  name: string;
  title?: string;
  subtitle?: string;
  marks?: { value: any; label: string }[] | boolean;
  required?: boolean;
  sx?: SxProps;
  valueLabelDisplay?: 'auto' | 'on' | 'off';
  valueLabelFormat?: ((value: number, index?: number) => string);
  min?: number;
  max?: number;
}

const FormSlider: FC<FormSliderProps> = ({
  defaultValue,
  name,
  marks,
  sx,
  title,
  subtitle,
  required,
  valueLabelDisplay,
  valueLabelFormat,
  min,
  max,
}) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      render={({ field }) => (
        <Stack rowGap={2}>
          <Box display="flex" flexDirection="column">
            <Typography variant="body1">
              {`${title} ${required ? '*' : ''}`}{' '}
            </Typography>
            <Typography variant="caption">{subtitle}</Typography>
          </Box>
          <Slider
            {...field}
            marks={marks}
            sx={sx}
            valueLabelDisplay={valueLabelDisplay}
            valueLabelFormat={valueLabelFormat}
            min={min}
            max={max}
          />
        </Stack>
      )}
    />
  );
};

FormSlider.defaultProps = {
  defaultValue: '',
  title: '',
  subtitle: '',
  marks: false,
};

export default FormSlider;
