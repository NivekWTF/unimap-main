import { FC } from 'react';

import { Box, Dialog, Fade, IconButton, Stack } from '@mui/material';
import { Close } from '@mui/icons-material';

import LogIn from '../LogIn';

import useStore from '../../../store';

const UserModal: FC = () => {
  const { userModalOpen, setUserModalOpen } = useStore(
    ({ userModalOpen, setUserModalOpen }) => ({
      userModalOpen,
      setUserModalOpen,
    })
  );

  return (
    <Dialog open={userModalOpen}>
      <IconButton
        sx={{ position: 'absolute', right: 10, top: 10 }}
        onClick={() => setUserModalOpen(false)}
      >
        <Close />
      </IconButton>

      <Stack spacing={2} sx={{ p: 2 }}>
        <Fade in>
          <Box>
            <LogIn />
          </Box>
        </Fade>
      </Stack>
    </Dialog>
  );
};

export default UserModal;
