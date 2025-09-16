 
import { SxProps, styled } from '@mui/material';
import { FC, ReactNode } from 'react';

import { FormProvider, UseFormReturn } from 'react-hook-form';

export interface FormProps {
  form: UseFormReturn<any>;
  children: ReactNode;
  onSubmit: (data: any) => void;
  sx?: SxProps;
}

const StyledForm = styled('form')({});

const Form: FC<FormProps> = ({ form, children, onSubmit, sx }) => {
  return (
    <FormProvider {...form}>
      <StyledForm sx={sx} onSubmit={form.handleSubmit(onSubmit)}>
        {children}
      </StyledForm>
    </FormProvider>
  );
};

Form.defaultProps = {
  onSubmit: () => {},
};

export default Form;
