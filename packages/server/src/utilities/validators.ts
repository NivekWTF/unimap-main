import { z } from 'zod';

export const paginadoValidator = z.object({
  pagina: z.number().int().default(1),
  limite: z.number().int().default(10),
  q: z.string().optional().nullable(),
});

export const obtenerPorIdValidator = z.object({
  id: z.string(),
});

const puntoSchema = z.array(z.array(z.array(z.number())));

export const tiposUsuarioValidator = z.enum([
  'ADMIN',
  'ALUMNO',
  'PROFESOR',
]);

export const geometriaValidator = z.object({ 
  type: z.enum(['Polygon', 'MultiPolygon']),
  coordinates: z.array(puntoSchema),
});

const featureSchema = z.object({
  type: z.enum(['Feature']),
  geometry: geometriaValidator,
  properties: z.object({
    qgisId: z.string(),
    nombre: z.string(),
    categoria: z.string(),
    pertenece: z.string().optional(),
    nombreCorto: z.string().min(1).max(10).optional(),
    pisos: z.number().optional(),
    pertenecePiso: z.number().optional(),
  }),
});

export const geoJsonValidator = z.object({
  type: z.literal('FeatureCollection'),
  features: z.array(featureSchema),
});
