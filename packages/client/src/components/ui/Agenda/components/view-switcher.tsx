import { FC } from 'react';

import { ViewSwitcher } from '@devexpress/dx-react-scheduler-material-ui';
import { Stack, IconButton, Typography } from '@mui/material';

const LocalizedViewSwitcher: FC<ViewSwitcher.SwitcherProps> = ({
  onChange,
  currentView,
}) => {
  return (
    <Stack direction="row" spacing={1}>
      <IconButton
        onClick={() => onChange('Day')}
        color={currentView.name === 'Day' ? 'primary' : 'default'}
      >
        <Typography variant="button">Día</Typography>
      </IconButton>
      <IconButton
        onClick={() => onChange('Week')}
        color={currentView.name === 'Week' ? 'primary' : 'default'}
      >
        <Typography variant="button">Semana</Typography>
      </IconButton>
    </Stack>
  );
};

export default LocalizedViewSwitcher;