import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'El usuario es obligatorio'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export const registerSchema = z.object({
  username: z.string().min(1, 'El usuario es obligatorio'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
  nombres: z.string().min(1, 'Los nombres son obligatorios'),
  apellidos: z.string().min(1, 'Los apellidos son obligatorios'),
  correo: z.string({ message: 'El correo es obligatorio' }).nonempty('El correo es obligatorio').email('Correo inválido'),
  tipoUsuario: z.enum(['ALUMNO', 'PROFESOR', 'VISITANTE']),
  campus: z.string().optional(),
});

export const recoverySchema = z
  .object({
    correo: z.string().email('Correo inválido').optional(),
    username: z.string().optional(),
  })
  .refine((data) => !!(data.correo || data.username), {
    message: 'Se requiere correo o número de control',
  });

export function zodErrorsToMap(err: unknown) {
  const map: Record<string, string> = {};
  if (!err || typeof err !== 'object') return map;
  // Prefer ZodError.format() output when available because it preserves custom messages per-field
  // @ts-ignore
  if (typeof (err as any).format === 'function') {
    try {
      // @ts-ignore
      const formatted = (err as any).format();
      for (const key of Object.keys(formatted)) {
        if (key === '_errors') continue;
        const entry = (formatted as any)[key];
        if (entry && Array.isArray(entry._errors) && entry._errors.length) {
          map[key] = entry._errors[0];
        }
      }
      // also include root-level errors if present
      if (!map._form && Array.isArray((formatted as any)._errors) && (formatted as any)._errors.length) {
        map._form = (formatted as any)._errors[0];
      }
      return map;
    } catch (e) {
      // fallthrough to issues parsing
    }
  }

  // @ts-ignore - fallback to issues array
  const issues = (err as any).issues as Array<any> | undefined;
  if (!issues) return map;
  for (const i of issues) {
    const path = (i.path && i.path[0]) || '_form';
    map[path] = i.message || 'Valor inválido';
  }
  return map;
}
