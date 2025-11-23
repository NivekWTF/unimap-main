import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import SuperJSON from 'superjson';

// Determine base URL at runtime so the same build can be used locally and remotely.
// Priority: window.__TRPC_BASE_URL (optional runtime injection) -> VITE env -> relative '/api/v1'
const baseUrl = import.meta.env.VITE_TRPC_BASE_URL;

const normalize = (u: string) => u.replace(/\/$/, '');

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
