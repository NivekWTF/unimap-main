import { TRPCError, initTRPC } from '@trpc/server';
import jwt from 'jsonwebtoken';
import SuperJSON from 'superjson';

import { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { TUsuario } from '../models';

export function createContext(opts: CreateExpressContextOptions) {
  const { req } = opts;

  const auth = req.headers.authorization as string;

  if (!auth) return { session: null, req };

  // token may come as "Bearer <token>"; strip prefix if present
  const token = auth.startsWith('Bearer ') ? auth.split(' ')[1] : auth;

  // Try verifying with the main JWT secret, then with the client secret.
  // If verification fails, return session: null instead of throwing.
  try {
    let usuario: any;
    try {
      usuario = jwt.verify(token, process.env.JWT_SECRET!);
    } catch (e) {
      // try client secret
      usuario = jwt.verify(token, process.env.JWT_CLIENT_SECRET!);
    }

    if (!usuario) return { session: null, req };

    const session = usuario as TUsuario & { _id: string };

    return {
      req,
      session,
      filenames: [] as string[] | undefined,
    };
  } catch (err) {
    // invalid token -> no session (do not crash)
    return { session: null, req };
  }
}

export type Context = ReturnType<typeof createContext>;

// Use SuperJSON to match the client transformer
const t = initTRPC.context<Context>().create({ transformer: SuperJSON });

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
