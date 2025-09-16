import useStore from '../store';
import { Usuario } from '../utils/types';

const useSession = () => {
  const user = useStore(({ user }) => user);
  return user as Usuario;
};

export default useSession;
