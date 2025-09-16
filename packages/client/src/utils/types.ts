import { PathOptions } from 'leaflet';

export interface Usuario {
  _id:               string;
  campus:            string;
  clave:             string;
  activo:            boolean;
  fechaCreacion?:     string;
  nombres:           string;
  apellidos:         string;
  correo:            string;
  cargaAcademica:    Carga[];
}

export interface Carga {
  lugar:      Objeto;
  clase:      Clase;
  dia:        number;
  horaInicio: string;
  horaFin:    string;
}

export type Clase = {
  _id: string;
  nombre: string;
  descripcion: string;
};

export type Categoria = {
  _id: string;
  nombre: string;
  icono: string;
  color: string;
  colorSecundario: string;
};

export type Geometria = {
  type: 'MultiPolygon' | 'Polygon';
  coordinates: number[][][][];
};

export type Servicio = {
  _id: string;
  nombre: string;
  descripcion: string;
};

export type Objeto = {
  _id: string;
  nombre: string;
  onClick?: () => void;
  nombreCorto?: string;
  descripcion?: string;
  pisos?: number;
  pertenecePiso?: number;
  pertenece?: string;
  categoria: Categoria;
  centroide?: { lat: number; lng: number };
  qgisId: string;
  geometria: Geometria;
  servicios: Servicio[];
  urlImagenes: string[];
  style?: PathOptions;
};
