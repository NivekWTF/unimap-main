import { useCallback, useRef, useState } from 'react';

import { Avatar, Menu, MenuItem, Stack } from '@mui/material';
import MuiAppBar from '@mui/material/AppBar';

import useSession from '../../../../hooks/useSession';
import useStore from '../../../../store';
import { useNavigate } from 'react-router-dom';

const AppBar = () => {
  const navigate = useNavigate();
  const usuario = useSession();
  const logOut = useStore(({ logOut }) => logOut);

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const anchorRef = useRef(null);

  const handleMenuOpen = useCallback(() => {
    setIsMenuOpen(true);
  }, []);

  const handleMenuClose = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const handleLogOutClick = useCallback(() => {
    logOut();
    navigate('/login');
  }, [logOut, navigate]);

  return (
    <>
      <MuiAppBar sx={{ position: 'sticky', top: 0, backgroundColor: 'primary.800' }}>
        <Stack
          direction="row"
          px={4}
          py={1}
          alignItems="center"
          justifyContent="flex-end"
        >
          <Avatar
            onClick={handleMenuOpen}
            ref={anchorRef}
            src={usuario.avatar}
            sx={{ cursor: 'pointer' }}
          />
        </Stack>
      </MuiAppBar>
      <Menu
        onClick={handleMenuClose}
        anchorEl={anchorRef.current}
        open={isMenuOpen}
      >
        <MenuItem onClick={handleLogOutClick}>Cerrar sesión</MenuItem>
      </Menu>
    </>
  );
};

export default AppBar;
