import 'dotenv/config'
import express from 'express';

import './models'
import './database'
import Logger from './utilities/logger';
import { createAppRouter } from './router';
import { ENTORNO_DE_EJECUCION, SERVICIO_INICIADO } from './constants/mensajes';

const { PORT, NODE_ENV } = process.env;

const app = express();

const appRouter = createAppRouter(app);

app.listen(PORT, () => {
  Logger.log({ msg: ENTORNO_DE_EJECUCION(NODE_ENV as string) })
  Logger.log({ msg: SERVICIO_INICIADO(PORT as string) })
});

export type AppRouter = typeof appRouter;
