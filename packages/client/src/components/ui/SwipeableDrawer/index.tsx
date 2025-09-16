import { FC, ReactNode } from 'react';

import {
  Box,
  SwipeableDrawer as MuiSwipableDrawer,
  Slide,
  styled,
} from '@mui/material';
import { Global } from '@emotion/react';
import { grey } from '@mui/material/colors';

type SwipeableDrawerProps = {
  open: boolean;
  toggleDrawer?: () => void;
  children?: ReactNode;
  slideUp?: boolean;
  renderSlide?: ReactNode;
  drawerBleeding?: number;
  height?: number | string;
};

const Puller = styled('div')(({ theme }) => ({
  width: 30,
  height: 6,
  backgroundColor: theme.palette.mode === 'light' ? grey[300] : grey[900],
  borderRadius: 3,
  position: 'absolute',
  top: 8,
  left: 'calc(50% - 15px)',
  cursor: 'pointer',
}));

const SwipeableDrawer: FC<SwipeableDrawerProps> = ({
  open,
  toggleDrawer = () => {},
  children,
  slideUp,
  renderSlide,
  drawerBleeding = 120,
  height = '70%',
}) => {
  return (
    <>
      <Global
        styles={{
          '.MuiDrawer-root > .MuiPaper-root': {
            height: `calc(${height} - ${drawerBleeding}px)`,
            overflow: 'visible',
          },
        }}
      />
      <MuiSwipableDrawer
        anchor="bottom"
        open={open}
        onClose={toggleDrawer}
        onOpen={toggleDrawer}
        swipeAreaWidth={drawerBleeding}
      >
        <Slide direction="up" in={slideUp}>
          <Box
            sx={(theme) => ({
              backgroundColor:
                theme.palette.mode === 'light' ? '#fff' : grey[800],
              position: 'absolute',
              top: -drawerBleeding ,
              visibility: 'visible',
              width: '100%',
              height: drawerBleeding,
              left: 0,
              right: 0,
            })}
          >
            <Puller />
            {renderSlide}
          </Box>
        </Slide>

        {children}
      </MuiSwipableDrawer>
    </>
  );
};

SwipeableDrawer.defaultProps = {
  slideUp: false,
  drawerBleeding: 120,
};

export default SwipeableDrawer;
