import { useEffect } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import useStore from '../store';

const useCategoria = () => {
  const { categoriaId } = useParams();
  const navigate = useNavigate();
  const categoriasPorId = useStore(({ categoriasPorId }) => categoriasPorId);

  const categoria = categoriasPorId[categoriaId!];

  useEffect(() => {
    if (!categoria) navigate('/');
  }, [categoria, navigate]);

  return categoria;
};

export default useCategoria;
