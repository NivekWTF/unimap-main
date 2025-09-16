import { useState } from 'react';

import SwipeableDrawer from '../../../../../../components/ui/SwipeableDrawer';

const SwipeableClases = () => {
  const [open, setOpen] = useState<boolean>(true);
  
  const toggleDrawer = () => {
    setOpen(!open);
  };


  return (
    <SwipeableDrawer open={open} toggleDrawer={toggleDrawer} drawerBleeding={150}>

    </SwipeableDrawer>
  );
}

export default SwipeableClases;