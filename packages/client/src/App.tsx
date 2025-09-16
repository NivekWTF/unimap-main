import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material';
import { RouterProvider } from 'react-router-dom';

import { queryClient } from './config/query-client';
import { trpc, trpcClient } from './config/trpc';

import Alert from './components/ui/Alert';
import Welcome from './components/ui/Welcome';
import Tour from './components/ui/Tour';
import RevalidarSesion from './components/auth/RevalidarSesion';

import theme from './theme';
import router from './router';
import './theme/styles.css';

function App() {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <RevalidarSesion />
          <Alert />
          <Welcome />
          <Tour />
          <RouterProvider router={router} />
        </ThemeProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default App;

