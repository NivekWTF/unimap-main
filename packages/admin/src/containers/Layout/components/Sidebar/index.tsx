import { useCallback, useMemo } from 'react';

import { useLocation } from 'react-router-dom';

import { List, Stack } from '@mui/material';

import SidebarItem from './components/SidebarItem';

import useStore from '../../../../store';
import { MENU_ITEMS, MenuItem } from '../../../../constant/menu';

const Sidebar = () => {
  const categoriasPorId = useStore(({ categoriasPorId }) => categoriasPorId);
  const categorias = Object.values(categoriasPorId);

  const { pathname } = useLocation();

  const moduloActual = useMemo(
    () => pathname.split('/').at(1) || '',
    [pathname]
  );

  const isItemActive = useCallback((moduloActual: string, item: MenuItem) => {
    const { path } = item;
    const modulo = path.split('/').at(1) || '';
    return moduloActual === modulo;
  }, []);

  const menuItems = useMemo(
    () => [
      ...MENU_ITEMS.filter(({ hidden }) => !hidden),
      ...categorias.map(
        ({ _id, nombre, icono }) =>
          ({
            _id,
            path: `/${_id}`,
            icon: icono,
            name: nombre,
          } as MenuItem)
      ),
    ],
    [categorias]
  );

  return (
    <Stack
      sx={{
        height: '100%',
        position: 'sticky',
        top: '10%',
      }}
    >
      <List>
        {menuItems.map((item, index) => (
          <SidebarItem
            key={index}
            item={item}
            active={isItemActive(moduloActual, item)}
          />
        ))}
      </List>
    </Stack>
  );
};

export default Sidebar;
