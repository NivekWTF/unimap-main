import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import SuperJSON from 'superjson';

const baseUrl = import.meta.env.VITE_TRPC_BASE_URL;

export const trpc = createTRPCProxyClient<any>({
  links: [
    httpBatchLink({
      url: `${baseUrl}/trpc`,
      transformer: SuperJSON,
      fetch(url, opts) {
        const token = localStorage.getItem('token') ?? '';
        return fetch(url, {
          ...opts,
          headers: { ...opts?.headers, Authorization: token ? `Bearer ${token}` : '' },
        });
      },
    }),
  ],
});
