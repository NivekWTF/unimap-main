import {
  ChangeEventHandler,
  FC,
  useCallback,
  useEffect,
  useState,
} from "react";

import { Search } from "@mui/icons-material";
import { InputAdornment, TextField, TextFieldProps } from "@mui/material";
import { useDebounce } from "../../../hooks/useDebounce";

type SearchFieldProps = Omit<TextFieldProps, "onChange"> & {
  onChange: (text: string) => void;
  debounceTime?: number;
};

const SearchField: FC<SearchFieldProps> = ({
  onChange,
  debounceTime,
  ...props
}) => {
  const [value, setValue] = useState<string>('');
  const debounced = useDebounce(value, debounceTime!);

  const handleChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      const {
        target: { value },
      } = event;
      setValue(value || '');
    },
    []
  );

  useEffect(() => {
    onChange(debounced!);
  }, [debounced, onChange]);

  return (
    <TextField
      {...props}
      value={value}
      onChange={handleChange}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search />
          </InputAdornment>
        ),
      }}
      autoFocus
    />
  );
};

SearchField.defaultProps = {
  debounceTime: 400,
};

export default SearchField;
