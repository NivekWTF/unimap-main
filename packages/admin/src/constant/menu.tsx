export type MenuItem = {
  _id: string;
  name: string;
  path: string;
  icon: string;
  hidden?: boolean;
};

export const MENU_ITEMS: MenuItem[] = [
  {
    _id: 'inicio',
    name: 'Inicio',
    path: '/',
    icon: 'home',
  },
  {
    _id: 'importar-datos',
    name: 'Importar Datos',
    path: '/importar-datos',
    icon: 'cloud_upload',
  },
  {
    _id: 'usuarios',
    name: 'Usuarios',
    path: '/usuarios',
    icon: 'person',
    hidden: true,
  },
  {
    _id: 'campus',
    name: 'Campus',
    path: '/campus',
    icon: 'business',
  },
  {
    _id: 'alumnos',
    name: 'Alumnos',
    path: '/alumnos',
    icon: 'school',
  },
];
