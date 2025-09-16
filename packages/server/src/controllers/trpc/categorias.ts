import z from 'zod';
import { publicProc } from '../../config/trpc';

import { Categoria } from '../../models/categoria';

import { isUndefined } from '../../utilities/functions';

export const obtenerTodos = publicProc
  .input(
    z.object({
      habilitado: z.boolean().optional(),
    })
  )
  .query(async ({ input: { habilitado } }) => {
    const categorias = await Categoria.find(
      {
        activo: true,
        $and: [!isUndefined(habilitado) ? { habilitado } : {}],
      },
      ''
    )
      .populate('pertenece')
      .lean();

    return categorias;
  });
