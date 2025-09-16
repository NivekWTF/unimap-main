import { useCallback, useEffect, useState } from "react";

const useCurrentPosition = () => {
  const [position, setPosition] = useState<GeolocationPosition['coords'] | null>(null);

  const onPositionChange: PositionCallback = useCallback((position) => {
    const { coords } = position;
    setPosition(coords); 
  }, []);

  const onPositionError: PositionErrorCallback = useCallback((error) => {
    console.log(error)
  }, []);

  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.watchPosition(onPositionChange, onPositionError)
  }, [onPositionChange, onPositionError]);

  return position;
};

export default useCurrentPosition;