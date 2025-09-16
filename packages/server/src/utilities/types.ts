import { z } from 'zod';
import { Types } from 'mongoose';

import { TUsuario } from '../models';
import { geoJsonValidator } from '../utilities/validators';

export type TModelo = {
  _id?: string;
  activo?: boolean;
  fechaCreacion?: Date;
  fechaModificacion?: Date;
  usuarioCreacion?: Types.ObjectId | TUsuario | string;
  usuarioModificacion?: Types.ObjectId | TUsuario | string;
};

export type TGeoJsonImportar = z.infer<typeof geoJsonValidator>;

export type TGeoJsonFeatureImportar = TGeoJsonImportar['features'][0];

export type ErrorImportacion = {
  status: false;
  message: string;
};

export type ResultadoImportacion = Promise<[any, ErrorImportacion | null]>;
