import { Types, model, Schema } from 'mongoose';
import { z } from 'zod';

import { geometriaValidator } from '../utilities/validators';
import { geometria } from './geometria';

export const campusValidator = z.object({
  _id: z.string().optional(),
  nombre: z.string(),
  clave: z.string(),
  subdominio: z.string(),
  descripcion: z.string().optional(),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
  geometria: geometriaValidator,
  email: z.string().optional(),
  web: z.string().optional(),
  habilitado: z.boolean().default(true),
  usuarioCreacion: z.string().optional(),
  usuarioModificacion: z.string().optional(),
  activo: z.boolean().optional().default(true)
});

export type TCampus = z.infer<typeof campusValidator>;

const campusSchema = new Schema<TCampus>(
  {
    nombre: String,
    subdominio: String,
    clave: String,
    descripcion: String,
    direccion: String,
    telefono: String,
    email: String,
    web: String,
    geometria,
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
    collection: 'campus',
  }
);

campusSchema.index({ nombre: 1, subdominio: 1 }, { unique: true });

campusSchema.post('save', async function (doc: TCampus) {
  const { activo } = doc;

  if (activo) {
    return;
  }

  await Promise.all([

  ]);
});

export const Campus = model<TCampus>(
  'Campus',
  campusSchema
);
