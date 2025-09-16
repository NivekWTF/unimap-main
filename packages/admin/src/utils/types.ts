import { z } from 'zod';

import { geoJsonSchema, poligonoSchema } from './validators';
import { Cabeceros } from '../components/ui/Tabla';

export enum TipoUsuario {
  Alumno = 'ALUMNO',
  Profesor = 'PROFESOR',
  Administrador = 'ADMIN'
}

export type GeoJSON = z.infer<typeof geoJsonSchema>;
export type Geometria = z.infer<typeof poligonoSchema>;

export type Usuario = {
  nombre: string;
  username: string;
  apellidos: string;
  avatar?: string;
  tipoUsuario: TipoUsuario;
  activo: boolean;
  fechaCreacion: string;
  fechaModificacion: string;
  _id: string;
  password?: string | undefined;
};

export type Categoria = {
  _id: string;
  nombre: string;
  activo?: boolean;
  fechaCreacion: string;
  fechaModificacion: string;
  pertenece: Categoria[];
  palabrasClave: string;
  descripcion: string;
  habilitado: boolean;
  icono: string;
};

export type CategoriasPorId = { [key: string]: Categoria };

export type Paginado<T=unknown> = {
  total: number;
  registros: T[];
  totalPaginas: number;
}

export type CabecerosDePaginado<K extends Paginado> = Cabeceros<K['registros'][0]>[]