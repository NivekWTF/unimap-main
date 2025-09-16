import { geoJSON } from 'leaflet';
import { format, add, startOfDay } from 'date-fns';

import { Carga, Geometria, Objeto } from './types';

export function crearFeaturesDesdeObjetos(objetos: Objeto[]) {
  return objetos.map(({ geometria: geometry, ...objeto }) => ({
    type: 'Feature',
    geometry,
    properties: objeto,
  }));
}

export function crearFeaturesDesdeGeometria(
  geometrias: Geometria[],
  properties: object = {}
) {
  return geometrias.map((geometria) => ({
    type: 'Feature',
    geometry: geometria,
    properties,
  }));
}

export function crearGeoJson(features: any[]) {
  return {
    type: 'FeatureCollection',
    features,
  };
}

export function obtenerCentroide(geometria: Geometria) {
  const bounds = geoJSON(geometria).getBounds();
  return bounds.getCenter();
}

export const crearArregloNumerico = (inicio: number, fin: number) =>
  Array.from({ length: fin - inicio }, (_, i) => i + inicio);

export function ocultarTeclado() {
  if ('virtualKeyboard' in navigator) {
    (navigator as any).virtualKeyboard?.hide();
  }
}

export function parseHour(formatedHour: string) {
  const [hour, minutes] = formatedHour.split(':');
  return { hour: +hour, minutes: +minutes };
}

export function formatearHorasClase(carga: Carga) {
  const { horaInicio: inicio, horaFin: fin } = carga;
  const { hour: horaInicio } = parseHour(inicio);
  const { hour: horaFin } = parseHour(fin);
  const horaInicioFormato = format(add(startOfDay(new Date()), { hours: horaInicio }), 'hh:mm a');
  const horaFinFormato = format(add(startOfDay(new Date()), { hours: horaFin }), 'hh:mm a');
  return `${horaInicioFormato} a ${horaFinFormato}`
}