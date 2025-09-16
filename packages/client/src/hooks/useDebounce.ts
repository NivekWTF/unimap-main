import { useEffect, useState } from 'react';

const useDebounce = <T=unknown>(state: T, delay: number) => {
  const [debouncedState, setDebouncedState] = useState<T>(state);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedState(state);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [state, delay]);

  return debouncedState;
};

export default useDebounce;
