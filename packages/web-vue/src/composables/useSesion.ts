import { useGlobal } from '@/stores/useGlobal';

export function useSession() {
  const g = useGlobal();
  return {
    user: g.user,
    token: g.token,
    setSession: g.setSession,
    logOut: g.logOut,
  };
}
