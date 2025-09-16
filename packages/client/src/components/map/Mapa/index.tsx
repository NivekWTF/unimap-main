import { CSSProperties, ReactNode } from 'react';
import { renderToString } from 'react-dom/server';

import { DivIcon, StyleFunction } from 'leaflet';
import { MapContainer, Marker, ZoomControl, GeoJSON } from 'react-leaflet';
import { Geometria, Objeto } from '../../../utils/types';

import MapController from '../MapController';
import MarkerObjeto from '../MarkerObjeto';

type MapProps = {
  style: CSSProperties;
  center: { lat: number; lng: number };
  geojson?: any;
  onClick?: (objeto: Objeto, geometria: Geometria) => void;
  styleFunction?: StyleFunction;
  marcadores?: Objeto[];
  onEachFeature?: (feature: any, layer: any) => void;
  children?: ReactNode;
};

function Mapa({
  style,
  center,
  geojson,
  onClick,
  styleFunction,
  marcadores,
  onEachFeature,
  children,
}: MapProps) {
  const boundsOffset = 0.004;

  return (
    <MapContainer
      id="mapa"
      style={style}
      center={center}
      zoom={18}
      scrollWheelZoom={false}
      zoomControl={false}
      maxBounds={[
        [center.lat - boundsOffset, center.lng - boundsOffset],
        [center.lat + boundsOffset, center.lng + boundsOffset],
      ]}
      maxBoundsViscosity={1.0}
    >
      <MapController />
      <ZoomControl position="bottomright" />
      {geojson && (
        <GeoJSON
          key={JSON.stringify(geojson)}
          data={geojson}
          onEachFeature={onEachFeature}
          style={styleFunction}
        />
      )}
      {marcadores?.filter(({ centroide }) => !!centroide).map((objeto) => (
        <Marker
          key={objeto._id}
          position={objeto.centroide!}
          eventHandlers={{
            click: () =>
              onClick && !objeto.onClick
                ? onClick(objeto, objeto.geometria)
                : null,
          }}
          icon={
            new DivIcon({
              html: renderToString(<MarkerObjeto objeto={objeto} />),
              iconSize: [50, 50],
            })
          }
        />
      ))}
      {children}
    </MapContainer>
  );
}

Mapa.defaultProps = {
  style: {
    width: '100%',
    height: '100%',
  },
  center: { lat: 0, lng: 0 },
  geojson: null,
  onClick: undefined,
  styleFunction: undefined,
  marcadores: [],
};

export default Mapa;
