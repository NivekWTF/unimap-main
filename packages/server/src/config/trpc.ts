import { TRPCError, initTRPC } from '@trpc/server';
import jwt from 'jsonwebtoken';

import { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { TUsuario } from '../models';

export function createContext(opts: CreateExpressContextOptions) {
  const { req } = opts;

  const auth = req.headers.authorization as string;

  if (!auth) return { session: null, req };

  const usuario = jwt.verify(auth, process.env.JWT_SECRET!);

  if (!usuario) return { session: null, req };

  const session = usuario as TUsuario & { _id: string };

  return {
    req,
    session,
    filenames: [] as string[] | undefined,
  };
}

export type Context = ReturnType<typeof createContext>;

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const middleware = t.middleware;
export const publicProc = t.procedure;

export const privateProc = t.procedure.use((opts) => {
  const { session } = opts.ctx;

  if (!session) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'No autorizado',
    });
  }

  return opts.next({
    ctx: opts.ctx,
  });
});
