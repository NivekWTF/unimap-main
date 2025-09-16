import { FC } from 'react';

import { Outlet } from 'react-router-dom';
import { Box, Container, Stack } from '@mui/material';

import Alert from '../../components/shared/Alert';
import AppBar from './components/AppBar';
import Sidebar from './components/Sidebar';

const Layout: FC = () => {
  return (
    <Box sx={{ height: '100svh' }}>
      <Alert />
      <AppBar />
      <Container>
        <Stack pt={4} gap={4} direction="row" width="100%" height="100%">
          <Sidebar />
          <Box width="100%" pb={4}>
            <Outlet />
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default Layout;
