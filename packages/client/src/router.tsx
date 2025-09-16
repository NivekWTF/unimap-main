import {
  Route,
  createHashRouter,
  createRoutesFromElements,
} from 'react-router-dom';

import Home from './features/home';

const router = createHashRouter(
  createRoutesFromElements(
    <>
      <Route path="" element={<Home />} />
    </>
  )
);

export default router;
