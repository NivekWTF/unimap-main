import { z } from 'zod';

import { model, Schema } from 'mongoose';
import { TModelo } from '../utilities/types';

export const servicioValidator = z.object({
  nombre: z.string(),
  descripcion: z.string(),
  palabrasClave: z.array(z.string()).default([]),
  clave: z.string(),
  imagenes: z.array(z.string()).default([]),
  activo: z.boolean().default(true),
  habilitado: z.boolean().default(true),
  usuarioCreacion: z.string(),
  usuarioModificacion: z.string().optional(),
});

export type TServicio = z.infer<typeof servicioValidator> & TModelo;

export const servicioSchema = new Schema<TServicio>(
  {
    nombre: String,
    descripcion: String,
    clave: String,
    imagenes: [String],
    palabrasClave: [String],
    habilitado: {
      type: Boolean,
      required: true,
      default: true,
    },
    activo: {
      type: Boolean,
      required: true,
      default: true,
    },
    usuarioCreacion: {
      type: String,
      ref: 'Usuario',
    },
    usuarioModificacion: {
      type: String,
      ref: 'Usuario',
    },
  },
  {
    timestamps: {
      createdAt: 'fechaCreacion',
      updatedAt: 'fechaModificacion',
    },
    collection: 'servicios',
  }
);

servicioSchema.index({
  nombre: 'text',
  palabrasClave: 'text',
});

export const Servicio = model<TServicio>('Servicio', servicioSchema);
