import useStore from '../store';

const useSession = () => {
  const { logOut, setSession, user } = useStore(
    ({ user, logOut, setSession }) => ({
      user,
      logOut,
      setSession,
    })
  );
  
  return {
    logOut,
    setSession,
    user,
  };
};

export default useSession;
