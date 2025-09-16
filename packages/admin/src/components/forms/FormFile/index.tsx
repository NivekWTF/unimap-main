import { FC } from "react";

import { MuiFileInput, MuiFileInputProps } from "mui-file-input";
import { Controller, useFormContext } from "react-hook-form";

type FormFileProps = MuiFileInputProps & {
  name: string;
  defaultValue?: File;
};

const FormFile: FC<FormFileProps> = ({ name, defaultValue, ...props }) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      defaultValue={defaultValue}
      render={({ field }) => (
        <MuiFileInput
          id={name}
          {...props}
          {...field}
          helperText={errors[name]?.message as string}
        />
      )}
    />
  );
};

export default FormFile;
