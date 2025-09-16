import { FC, useCallback } from 'react';

import MuiTextField from '@mui/material/TextField';
import {

  FilledInputProps,
  InputProps,
  OutlinedInputProps,
  SxProps,
} from '@mui/material';

interface TextFieldProps {
  sx?: SxProps;
  onTextChange?: (text: string) => void;
  size?: 'medium' | 'small';
  placeholder?: string;
  value: string;
  InputProps?:
    | Partial<FilledInputProps>
    | Partial<OutlinedInputProps>
    | Partial<InputProps>;
  required?: boolean;
  title?: string;
  subtitle?: string;
  fullWidth?: boolean;
  type?: 'text' | 'password' | 'number' | 'date';
  label?: string;
  error?: boolean;
  helperText?: string;
  isHandleChange?: boolean;
  onChange?: (prevState: object) => void;
  name?: string;
  disabled?: boolean;
}

const TextField: FC<TextFieldProps> = ({
  onTextChange,
  sx,
  size,
  placeholder,
  InputProps,
  value,
  required,
  title,
  fullWidth,
  type,
  label,
  error,
  helperText,
  isHandleChange,
  onChange,
  name,
  disabled,
}) => {
  const handleChange = useCallback(
    (event: any) => {
      const {
        target: { value },
      } = event;
      if (isHandleChange && onChange)
        onChange((prev: any) => ({ ...prev, [name!]: value }));
      else onTextChange!(value);
    },
    [onTextChange, isHandleChange, name, onChange]
  );

  return (
    <MuiTextField
      label={label}
      placeholder={placeholder}
      helperText={helperText}
      required={required}
      title={title}
      error={error}
      size={size}
      fullWidth={fullWidth}
      type={type}
      value={value}
      onChange={handleChange}
      InputProps={InputProps}
      sx={sx}
      disabled={disabled}
    />
  );
};

TextField.defaultProps = {
  onTextChange: () => {},
  isHandleChange: false,
  onChange: () => {},
  disabled: false,
};

export default TextField;
