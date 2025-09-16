import { FC } from "react";

import FormControlLabel from "@mui/material/FormControlLabel";
import MuiCheckbox from "@mui/material/Checkbox";

interface CheckboxProps {
  label?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

const Checkbox: FC<CheckboxProps> = ({ label, checked, onChange }) => {
  return (
    <FormControlLabel
      label={label}
      control={
        <MuiCheckbox
          checked={checked}
          onChange={(_, checked) => onChange(checked)}
        />
      }
    />
  );
};

Checkbox.defaultProps = {
  onChange: () => {},
  checked: false,
  label: "",
};

export default Checkbox;
