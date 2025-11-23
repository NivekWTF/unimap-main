import { z } from 'zod';
import { model, Schema, Types } from 'mongoose';

import { TipoUsuario } from '../constants/tipo-usuario';
import { TModelo } from '../utilities/types';
import { objetoValidator } from './objeto';
import { claseValidator } from './clase';
import { campusValidator } from './campus';
import { tiposUsuarioValidator } from '../utilities/validators';

const cargaValidator = z.object({
  lugar: z.string().or(objetoValidator),
  clase: z.string().or(claseValidator),
  dia: z.number(),
  horaInicio: z.string(),
  horaFin: z.string(),
});

export const usuarioGuardarValidator = z.object({
  username: z.string(),
  password: z.string(),
  nombres: z.string(),
  avatar: z.string().optional(),
  apellidos: z.string(),
  correo: z.string().optional(),
  clave: z.string().optional(),
  tipoUsuario: tiposUsuarioValidator,
  campus: z.string().or(campusValidator).optional(),
  activo: z.boolean().optional(),
});

export const usuarioValidator = usuarioGuardarValidator.extend({
  password: z.string().optional(),
  cargaAcademica: z.array(cargaValidator).optional().default([]),
  campus: z.string().or(campusValidator).optional(),
});

const cargaSchema = new Schema<TCarga>({
  lugar: { type: Types.ObjectId, ref: 'Objeto', required: true },
  clase: { type: Types.ObjectId, ref: 'Clase', required: true },
  dia: { type: Number, required: true },
  horaInicio: String,
  horaFin: String,
});

export type TCarga = z.infer<typeof cargaValidator>;
export type TUsuario = z.infer<typeof usuarioValidator> & TModelo;

const usuarioSchema = new Schema<TUsuario>(
  {
    username: { type: String, required: true },
    password: { type: String, required: false },
    nombres: { type: String, required: true },
    clave: { type: String, required: false },
    correo: { type: String, required: false },
    apellidos: { type: String, required: true },
    avatar: { type: String, required: false },
    campus: { type: Types.ObjectId, ref: 'Campus', required: false },
    cargaAcademica: { type: [cargaSchema], required: false, default: [] },
    tipoUsuario: {
      type: String,
      required: true,
      enum: Object.values(TipoUsuario),
    },
    activo: { type: Boolean, default: true },
  },
  {
    collection: 'usuarios',
    timestamps: {
      createdAt: 'fechaCreacion',
      updatedAt: 'fechaModificacion',
    },
  }
);

export const Usuario = model<TUsuario>('Usuario', usuarioSchema);
