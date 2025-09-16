import { z } from 'zod';

import { ZodIssueCode } from 'zod';
import { Formularios } from '../constant/mensajes';

const ERROR_MESSAGES: { [K in ZodIssueCode]?: string } = {
  invalid_literal:
    'Valor inválido en la propiedad "$path", se esperaba "$expected"',
  invalid_type:
    'Tipo inválido en la propiedad "$path", se esperaba "$expected"',
  invalid_enum_value:
    'Valor inválido en la propiedad "$path", valores posibles: $expected',
};

const PROPIEDAD_REQUIRED = 'La propiedad "$path" es requerida';

 
export const getErrorMessage = (errors: any[]) => {
  const messages: string[] = [];

  errors.forEach(({ code, message: zodMessage, path, options, expected }) => {
    if (zodMessage === 'Required') {
      messages.push(
        PROPIEDAD_REQUIRED.replace('$path', path.join('.')) + '.\n'
      );
      return;
    }

    const errorMessage = ERROR_MESSAGES[code as ZodIssueCode];
    messages.push(
      errorMessage
        ?.replace('$path', path.join('.'))
        .replace(
          '$expected',
          Array.isArray(options)
            ? options.map((v) => `"${v}"`).join(', ')
            : expected
        ) + '.\n'
    );
  });

  return messages;
};

const puntoSchema = z.array(z.array(z.array(z.number())));

export const poligonoSchema = z.object({
  type: z.enum(['Polygon', 'MultiPolygon']),
  coordinates: z.array(puntoSchema),
});

const featureSchema = z.object({
  type: z.enum(['Feature']),
  geometry: poligonoSchema,
  properties: z.any(),
});

export const featureImportacionMasivaSchema = z.object({
  type: z.enum(['Feature']),
  geometry: poligonoSchema,
  properties: z.object({
    qgisId: z.string(),
    nombre: z.string(),
    categoria: z.string(),
    pertenece: z.string().optional(),
    pisos: z.coerce.number().optional(),
    pertenecePiso: z.coerce.number().optional(),
  }),
});

export const geoJsonImportacionMasivaSchema = z.object({
  type: z.literal('FeatureCollection'),
  features: z.array(featureImportacionMasivaSchema),
});

export const geoJsonSchema = z.object({
  type: z.literal('FeatureCollection'),
  features: z.array(featureSchema),
});

export const fileValidator = z
  .any()
  .optional()
  .refine((value) => value instanceof File, Formularios.required);
