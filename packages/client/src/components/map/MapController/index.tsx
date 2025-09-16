import { FC, useEffect } from 'react';

import { useMap } from 'react-leaflet';
import useStore from '../../../store';

const MapController: FC = () => {
  const setMap = useStore(({ setMap }) => setMap);
  
  const map = useMap();

  useEffect(() => {
    setMap(map);
  }, [map, setMap]);

  return null;
}

export default MapController;