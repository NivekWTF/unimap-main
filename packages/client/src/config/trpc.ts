import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink, createTRPCProxyClient } from '@trpc/client';
import SuperJSON from 'superjson';

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
  transformer: SuperJSON,
});

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: VITE_API_BASE_URL_TRPC as string,
      headers,
    }),
  ],
  transformer: SuperJSON,
});

export default trpc;
