import { z } from 'zod';
import { Schema, Types, model } from 'mongoose';

import { TCampus, campusValidator } from '.';

export const claseValidator = z.object({
  nombre: z.string(),
  clave: z.string(),
  descripcion: z.string(),
  campus: z.string().or(campusValidator),
  activo: z.boolean().optional(),
  fechaCreacion: z.date().optional(),
  fechaModificacion: z.date().optional(),
});

export type TClase = {
  nombre: string;
  clave: string;
  descripcion: string;
  campus: Types.ObjectId | TCampus; 
  activo: boolean;
  fechaCreacion: Date;
  fechaModificacion: Date;
}

const claseSchema: Schema<TClase> = new Schema<TClase>(
  {
    nombre: { type: String, required: true },
    clave: { type: String, required: true },
    descripcion: { type: String, required: true },
    campus: { type: Types.ObjectId, required: true },
    activo: { type: Boolean, default: true },
    fechaCreacion: { type: Date, default: Date.now },
    fechaModificacion: { type: Date, default: Date.now },
  },
  {
    timestamps: {
      createdAt: 'fechaCreacion',
      updatedAt: 'fechaModificacion',
    },
    collection: 'clases',
  }
);

claseSchema.index({
  nombre: 'text',
});

export const Clase = model<TClase>('Clase', claseSchema);
