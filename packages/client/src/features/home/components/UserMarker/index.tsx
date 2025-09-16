import { FC } from 'react';

import { Marker } from 'react-leaflet';

import useCurrentPosition from '../../../../hooks/useCurrentPosition';
import { renderToString } from 'react-dom/server';
import { DivIcon } from 'leaflet';

import Navigator from '../../../../components/ui/Navigator';

type IconProps = {
  heading: number | null;
};

const Icon: FC<IconProps> = ({ heading = 0 }) => {
  return (
    <div
      style={{
        width: 30,
        height: 30,
        transform: `rotate(${heading}deg)`,
        position: 'relative',
      }}
    >
      <Navigator size={26} />
    </div>
  );
};

const UserMarker: FC = () => {
  const position = useCurrentPosition();

  if (!position) return null;

  const { latitude, longitude, heading } = position;
  
  const divIcon = new DivIcon({
    html: renderToString(<Icon heading={heading} />),
  });

  return <Marker position={{ lat: latitude, lng: longitude }} icon={divIcon} />;
};

export default UserMarker;
