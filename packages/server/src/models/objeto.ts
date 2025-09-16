import { z } from 'zod';
import { Schema, Types, model } from 'mongoose';

import { TModelo } from '../utilities/types';
import { servicioValidator } from './servicio';
import { geometriaValidator } from '../utilities/validators';
import { categoriaValidator } from './categoria';
import { campusValidator } from './campus';
import { geometria } from './geometria';

export const objetoValidator = z.object({
  _id: z.string().optional(),
  nombre: z.string(),
  qgisId: z.string(),
  archivosImagenes: z.array(z.string()).optional(),
  nombreCorto: z.string().optional(),
  descripcion: z.string().optional(),
  categoria: z.string().or(categoriaValidator),
  campus: z.string().or(campusValidator),
  geometria: geometriaValidator,
  pisos: z.number({ coerce: true }).optional(),
  pertenecePiso: z.number({ coerce: true }).optional(),
  pertenece: z.string().optional(),
  servicios: z.array(z.string()).or(z.array(servicioValidator)),
  imagenes: z.array(z.string()).default([]),
  urlImagenes: z.array(z.string()).optional().default([]),
  habilitado: z.boolean().default(true),
  usuarioCreacion: z.string().optional(),
  usuarioModificacion: z.string().optional(),
  fechaCreacion: z.date().optional(),
  fechaModificacion: z.date().optional(),
});

export type TObjeto = Omit<z.infer<typeof objetoValidator>, 'centroide'> & TModelo;

const objetoSchema = new Schema<TObjeto>(
  {
    nombre: String,
    descripcion: String,
    qgisId: String,
    nombreCorto: {
      type: String,
      required: false,
      minlength: 1,
      maxlength: 10,
    },
    pisos: {
      type: Number,
      required: false,
      min: 1,
      default: 1,
    },
    pertenecePiso: {
      type: Number,
      required: false,
      min: 1,
      default: 1,
    },
    categoria: {
      type: String,
      ref: 'Categoria',
    },
    pertenece: {
      type: Types.ObjectId,
      ref: 'Objeto',
    },
    geometria: {
      type: geometria,
      required: true,
    },
    servicios: [
      {
        ref: 'Servicio',
        type: Types.ObjectId,
      },
    ],
    campus: {
      type: Types.ObjectId,
      ref: 'Campus',
      required: true,
    },
    imagenes: [String],
    activo: {
      type: Boolean,
      required: true,
      default: true,
    },
    habilitado: {
      type: Boolean,
      required: true,
      default: true,
    },
    usuarioCreacion: {
      type: Types.ObjectId,
      ref: 'Usuario',
      required: true,
    },
    usuarioModificacion: {
      type: Types.ObjectId,
      ref: 'Usuario',
    },
  },
  {
    timestamps: {
      createdAt: 'fechaCreacion',
      updatedAt: 'fechaModificacion',
    },
    collection: 'objetos',
    toJSON: {
      virtuals: true,
      getters: true,
    },
    toObject: {
      virtuals: true,
      getters: true,
    },
  }
);

objetoSchema.index({
  nombre: 'text',
  nombreCorto: 'text',
});

export const Objeto = model<TObjeto>('Objeto', objetoSchema);
