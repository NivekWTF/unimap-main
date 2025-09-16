import { FC, useState } from 'react';

import { Box, Stack, Tab, Tabs, Typography } from '@mui/material';

import ImportarObjetos from './components/ImportarObjetos';
import ImportarServicios from './components/ImportarServicios';
import ImportarClases from './components/ImportarClases';

const ImportarDatos: FC = () => {
  const [tab, setTab] = useState(0);

  const elementoPorTab = [
    <ImportarObjetos />,
    <ImportarClases />,
    <ImportarServicios />
  ];

  return (
    <Stack gap={2}>
      <Typography variant="h5">Importar datos</Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tab}
          onChange={(_, tab) => setTab(tab)}
          aria-label="basic tabs example"
        >
          <Tab label="Objetos" />
          <Tab label="Clases" />
          <Tab label="Servicios" />
        </Tabs>
      </Box>
      {elementoPorTab[tab]}
    </Stack>
  );
};

export default ImportarDatos;
