import { FC } from 'react';

import { Controller, useFormContext } from 'react-hook-form';

import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';
import { Typography } from '@mui/material';

interface FormRatingProps {
  defaultValue?: number;
  name: string;
}

const FormRating: FC<FormRatingProps> = ({ defaultValue, name }) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <Controller
      control={control}
      defaultValue={defaultValue}
      name={name}
      render={({ field }) => (
        <Stack>
          <Rating {...field} />
          {!!errors[name] && (
            <Typography color='error'>{errors[name]?.message as string}</Typography>
          )}
        </Stack>
      )}
    />
  );
};

FormRating.defaultProps = {
  defaultValue: 0,
};

export default FormRating;
