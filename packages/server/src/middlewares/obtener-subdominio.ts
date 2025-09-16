import { middleware } from '../config/trpc';

import { obtenerSubdominio as getSubdominio } from '../utilities/functions';

const { DEV_SUB_DOMAIN, NODE_ENV } = process.env;

const esDev = NODE_ENV !== 'production';

export const obtenerSubdominio = middleware(async ({ ctx, next }) => {
  const { req } = ctx;
  const subdominio = getSubdominio(req.headers.origin!); 
  return next({ ctx: { subdominio: esDev ? DEV_SUB_DOMAIN : subdominio } });
});