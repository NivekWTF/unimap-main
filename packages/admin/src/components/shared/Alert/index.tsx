import { FC, useEffect } from 'react';

import MuiAlert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

import useStore from '../../../store';

const Alert: FC = () => {
  const { alertProps, isAlertVisible } = useStore(
    ({ isAlertVisible, alertProps }) => ({
      isAlertVisible,
      alertProps,
    })
  );

  useEffect(() => {
    if (isAlertVisible) {
      setTimeout(() => {
        useStore.setState({ isAlertVisible: false });
      }, 5000);
    }
  }, [isAlertVisible]);

  return (
    <Snackbar open={isAlertVisible} anchorOrigin={{ horizontal: 'center', vertical: 'top' }}>
      <MuiAlert
        severity={alertProps?.type}
        onClose={() => useStore.setState({ isAlertVisible: false })}
      >
        {alertProps?.message}
      </MuiAlert>
    </Snackbar>
  );
};

export default Alert;
