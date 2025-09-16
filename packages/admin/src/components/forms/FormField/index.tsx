import { FC } from 'react';

import { TextField, TextFieldProps } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

type FormFieldProps = {
  name: string;
} & TextFieldProps;

const FormField: FC<FormFieldProps> = ({ defaultValue, name, ...props }) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <Controller
      name={name}
      defaultValue={defaultValue}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          error={!!errors[name]}
          helperText={errors[name]?.message as string}
          {...props}
        />
      )}
    />
  );
};

FormField.defaultProps = {
  defaultValue: '',
  title: '',
  type: 'text',
  required: false,
  rows: 1,
};

export default FormField;
