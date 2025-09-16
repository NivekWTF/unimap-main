import { CSSProperties, FC, useCallback, useEffect, useState } from "react";

import { MapContainer } from "react-leaflet/MapContainer";
import { TileLayer } from "react-leaflet/TileLayer";
import { GeoJSON } from "react-leaflet/GeoJSON";
import { Skeleton } from "@mui/material";

import { obtenerCoordenadas } from "../../../utils/functions";
import { GeoJSON as TGeoJSON } from "../../../utils/types";
import { Marker, Popup, useMap } from "react-leaflet";
import { geoJSON, DivIcon, latLngBounds, StyleFunction } from "leaflet";
import { renderToString } from "react-dom/server";

type MapProps = {
  objetos?: [];
  style?: CSSProperties;
  geojson?: TGeoJSON;
  geojsonKey?: string;
};

const { VITE_CENTRO_DEFAULT_MAPA: centroDefault } = import.meta.env;
const coordenadasDefault = centroDefault.split(",").map(Number);

type TMarker = {
  lat: number;
  lng: number;
  etiqueta: string;
};

const Icon = ({ nombre }: { nombre: string }) => {
  return (
    <p style={{ textAlign: "center", fontWeight: 500, margin: 0 }}>{nombre}</p>
  );
};

const MapController = ({ geojson }: { geojson: TGeoJSON }) => {
  const map = useMap();

  useEffect(() => {
    const allCoordinates = geojson.features.map((feature) =>
      geoJSON(feature.geometry).getBounds().getCenter()
    );
    const centroid = latLngBounds(allCoordinates).getCenter();
    map.setView(centroid, 22);
  }, [geojson, map]);

  return null;
};

const Map: FC<MapProps> = ({ style, geojson, geojsonKey }) => {
  const [centro, setCentro] = useState<[number, number] | null>(null);
  const [markers, setMarkers] = useState<TMarker[]>([]);

  const obtenerCentro = useCallback(async () => {
    const posicion = await obtenerCoordenadas();
    if (!posicion) return setCentro(coordenadasDefault);
    const { coords } = posicion;
    const { latitude, longitude } = coords;
    setCentro([latitude, longitude]);
  }, []);

  const onEachFeature = useCallback((feature: any) => {
    const center = geoJSON(feature.geometry).getBounds().getCenter();
    const { lat, lng } = center;
    const { properties } = feature;
    const { qgisId } = properties;
    setMarkers((prev) => [...prev, { lat, lng, etiqueta: qgisId }]);
  }, []);

  const styleFunction: StyleFunction = () => ({
    fillColor: "blue",
    color: "white",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.7,
  });

  useEffect(() => {
    obtenerCentro();
  }, [obtenerCentro]);

  if (!centro)
    return <Skeleton variant="rectangular" width="100%" height={400} />;

  return (
    <MapContainer
      center={centro}
      zoom={20}
      scrollWheelZoom={false}
      style={style}
    >
      {geojson && <MapController geojson={geojson} />}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {geojson && (
        <GeoJSON
          key={geojsonKey}
          data={geojson}
          onEachFeature={onEachFeature}
          style={styleFunction}
        />
      )}
      {markers.map((marker, index) => (
        <Marker
          key={index}
          position={[marker.lat, marker.lng]}
          icon={
            new DivIcon({
              className: "custom-div-icon",
              html: renderToString(<Icon nombre={marker.etiqueta} />),
              iconSize: [20, 20],
            })
          }
        >
          <Popup>{marker.etiqueta}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map;
