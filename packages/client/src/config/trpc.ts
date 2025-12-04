import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink, createTRPCProxyClient } from '@trpc/client';
// NOTE: Do not set a transformer here to match the server router (server
// intentionally omits a transformer to preserve CommonJS build). Setting
// SuperJSON here caused a TypeScript mismatch against the server AppRouter
// type. If you need a transformer, ensure the server router uses the same
// transformer.

import store from '../store';

import type { AppRouter } from '../../../server/src';

const { VITE_API_BASE_URL_TRPC } = import.meta.env;

export const trpc = createTRPCReact<AppRouter>();

const headers = () => {
  const { authToken } = store.getState();
  return { Authorization: authToken };
};

export const trpcVanilla = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: VITE_API_BASE_URL_TRPC as string,
      headers,
    }),
  ],
});

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: VITE_API_BASE_URL_TRPC as string,
      headers,
    }),
  ],
  // transformer: SuperJSON, // intentionally omitted to match server router
});

export default trpc;
