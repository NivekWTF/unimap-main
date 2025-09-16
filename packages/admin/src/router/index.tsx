import {
  Outlet,
  Route,
  createHashRouter,
  createRoutesFromElements,
} from 'react-router-dom';

import Home from '../features/home';
import Auth from '../features/auth';
import ObjetosListado from '../features/admin/pages/Listado';

import verifySession from './loaders/verify-session';
import FormularioObjetos from '../features/admin/pages/Formulario';
import AuthLayout from '../containers/AuthLayout';
import CampusListado from '../features/campus/pages/Listado';
import CampusFormulario from '../features/campus/pages/Formulario';
import ImportarDatos from '../features/importar-datos';
import AlumnosListado from '../features/alumnos/pages/Listado';
import AlumnosFormulario from '../features/alumnos/pages/Formulario';

const router = createHashRouter(
  createRoutesFromElements(
    <>
      <Route path="/login" element={<Auth />} loader={verifySession} />
      <Route path="" element={<AuthLayout />}>
        <Route path="" element={<Home />} />
        <Route path="campus" element={<Outlet />}>
          <Route path="" element={<CampusListado />} />
          <Route path="formulario" element={<CampusFormulario />} />
          <Route path=":id" element={<CampusFormulario />} />
        </Route>
        <Route path="importar-datos" element={<Outlet />}>
          <Route path="" element={<ImportarDatos />} />
        </Route>
        <Route path="alumnos" element={<Outlet />}>
          <Route path="" element={<AlumnosListado />} />
          <Route path="formulario" element={<AlumnosFormulario />} />
          <Route path=":id" element={<AlumnosFormulario />} />
        </Route>
        <Route path=":categoriaId" element={<Outlet />}>
          <Route path="" element={<ObjetosListado />} />
          <Route path="formulario" element={<FormularioObjetos />} />
          <Route path=":id" element={<FormularioObjetos />} />
        </Route>
        <Route path="*" element={<Home />} />
      </Route>
    </>
  )
);

export default router;
