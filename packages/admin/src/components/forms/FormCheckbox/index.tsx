import { FC } from 'react';

import { Controller, useFormContext } from 'react-hook-form';

import FormControlLabel from '@mui/material/FormControlLabel';
import MuiCheckbox from '@mui/material/Checkbox';

interface FormCheckBoxProps {
  name: string;
  defaultValue?: boolean;
  label: string;
}

const FormCheckbox: FC<FormCheckBoxProps> = ({ name, defaultValue, label }) => {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      defaultValue={defaultValue}
      render={({ field }) => (
        <FormControlLabel
          label={label}
          control={
            <MuiCheckbox
              checked={field.value}
              onChange={(_, checked) => field.onChange(checked)}
            />
          }
        />
      )}
    />
  );
};

FormCheckbox.defaultProps = {
  defaultValue: false,
};

export default FormCheckbox;
