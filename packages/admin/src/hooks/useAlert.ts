import useStore from '../store';

const useAlert = () => {
  const showAlert = useStore(({ showAlert }) => showAlert);

  return showAlert;
};

export default useAlert;
