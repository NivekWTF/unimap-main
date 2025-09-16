import { z } from 'zod';
import { Schema, model } from 'mongoose';

import { TModelo } from '../utilities/types';

export interface TCategoria extends TModelo {
  nombre: string;
  palabrasClave: string;
  descripcion: string;
  pertenece: string[] | TCategoria[];
  habilitado?: boolean;
  color: string;
  colorSecundario: string;
  icono: string;
}

export const categoriaValidator: z.ZodType<TCategoria> = z.lazy(() =>
  z.object({
    nombre: z.string(),
    palabrasClave: z.string(),
    descripcion: z.string(),
    pertenece: z.array(z.string()).or(z.array(categoriaValidator)),
    habilitado: z.boolean().default(true),
    icono: z.string(),
    color: z.string(),
    colorSecundario: z.string(),
  }),
);

const categoriaSchema = new Schema<TCategoria>(
  {
    _id: String,
    nombre: String,
    descripcion: String,
    palabrasClave: String,
    icono: String,
    color: String,
    colorSecundario: String,
    pertenece: [
      {
        type: String,
        ref: 'Categoria',
      },
    ],
    
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
  },
  {
    timestamps: {
      createdAt: 'fechaCreacion',
      updatedAt: 'fechaModificacion',
    },
    collection: 'categorias',
  }
);



export const Categoria = model<TCategoria>('Categoria', categoriaSchema);
