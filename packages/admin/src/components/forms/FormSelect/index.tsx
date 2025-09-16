import { FC, ReactNode, useMemo } from 'react';

import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';

import {
  Controller,
  FieldValues,
  RegisterOptions,
  useFormContext,
} from 'react-hook-form';
import { SxProps } from '@mui/material';

interface FormSelectProps {
  name: string;
  options: any[];
  rules?: Omit<
    RegisterOptions<FieldValues, string>,
    'disabled' | 'setValueAs' | 'valueAsNumber' | 'valueAsDate'
  >;
  label?: string;
  defaultValue?: number | string | boolean | string[];
  bindLabel?: string;
  bindValue?: string;
  title?: string;
  subtitle?: string;
  renderTitle?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  sx?: SxProps;
  containerSx?: SxProps;
  multi?: boolean;
}

const FormSelect: FC<FormSelectProps> = ({
  name,
  options,
  label,
  defaultValue,
  bindLabel,
  bindValue,
  title,
  subtitle,
  required,
  disabled,
  sx,
  containerSx,
  multi,
}) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const valuesByKeys = useMemo(() => new Map(options.map((option) => [option[bindValue!], option])), [options, bindValue]);

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={multi ? [] : defaultValue}
      render={({ field }) => (
        <Box sx={containerSx} display="flex" flexDirection="column" gap="4px">
          <Box display="flex" flexDirection="column">
            <Typography variant="body1">
              {`${title || ''} ${required ? '*' : ''}`}{' '}
            </Typography>
            <Typography variant="caption">{subtitle}</Typography>
          </Box>
          <FormControl fullWidth>
            <InputLabel sx={{ translate: '0px -5px' }}>{label}</InputLabel>
            <Select
              {...field}
              sx={sx}
              error={!!errors[name]}
              label={label}
              disabled={disabled}
              size="small"
              multiple={multi}
              renderValue={(selected) => {
                let text;

                if (multi) {
                  text = (selected as string[]).map((value) => valuesByKeys.get(value)?.[bindLabel!]).join(', ');
                } else {
                  text = valuesByKeys.get(selected as string)?.[bindLabel!];
                }
                
                return <Typography variant="body1" maxWidth={380} overflow="hidden" textOverflow="ellipsis">
                  {text}
                </Typography>  
              }}
              fullWidth
            >
              {options.map(
                ({ [bindLabel!]: label, [bindValue!]: value }, index) => (
                  <MenuItem key={index} value={value}>
                    {label}
                  </MenuItem>
                )
              )}
            </Select>
            {!!errors[name] && (
              <FormHelperText>{(errors[name] as any)?.message}</FormHelperText>
            )}
          </FormControl>
        </Box>
      )}
    />
  );
};

FormSelect.defaultProps = {
  bindLabel: 'nombre',
  bindValue: '_id',
  options: [],
  defaultValue: '',
  disabled: false,
};

export default FormSelect;
