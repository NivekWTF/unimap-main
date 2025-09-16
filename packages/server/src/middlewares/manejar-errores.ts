import chalk from 'chalk';
import { ErrorRequestHandler, Request } from 'express';
import { TRPCError } from '@trpc/server';

import Logger from '../utilities/logger';

type ErrorOptions = {
  error: TRPCError;
  type: 'query' | 'mutation' | 'subscription' | 'unknown';
  path: string | undefined;
  req: Request;
  input: unknown;
  ctx?: any;
};

export const manejarErrorTrpc = (opts: ErrorOptions) => {
  const { error, path } = opts;
  const { code, message, name } = error;
  const msg = `${chalk.hex('#f55742')(path)} ${chalk.blue(code)} ${chalk.yellow(
    name
  )} ${message}`;
  Logger.log({ msg, severidad: 'error', error });
};

export const manejarErrorRest: ErrorRequestHandler = (error, req, res) => {
  const msg = `${chalk.hex('#f55742')(req.url)} ${chalk.blue(
    error.name
  )} ${chalk.yellow(error.message)}`;
  Logger.log({ msg, severidad: 'error', error });

  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }

  return res.status(500).json({ error: error.message });
};
