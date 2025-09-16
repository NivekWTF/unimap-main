import { FC } from 'react';

import { Close } from '@mui/icons-material';
import { IconButton } from '@mui/material';

export type CloseButtonProps = {
  onClick?: () => void;
};

const CloseButton: FC<CloseButtonProps> = ({ onClick }) => {
  return (
    <IconButton onClick={onClick}>
      <Close />
    </IconButton>
  );
};

export default CloseButton;
