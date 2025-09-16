import z from 'zod';
import { TRPCError } from '@trpc/server';

import { privateProc, publicProc } from '../../config/trpc';
import { Campus, campusValidator } from '../../models/campus';
import {
  obtenerPorIdValidator,
  paginadoValidator,
} from '../../utilities/validators';
import { paginar } from '../../utilities/paginar';
import { obtenerSubdominio } from '../../middlewares/obtener-subdominio';

export const obtenerPaginado = privateProc
  .input(paginadoValidator)
  .query(async ({ input: { limite, pagina, q } }) => {
    const paginado = await paginar(Campus, {
      query: {
        activo: true,
        $and: [q ? { nombre: { $regex: q, $options: 'i' } } : {}],
      },
      limite,
      pagina,
    });

    return paginado;
  });

export const obtener = privateProc.query(async () => {
  const campus = await Campus.find(
    {
      activo: true,
      habilitado: true,
    },
    '_id nombre'
  ).lean();

  return campus;
});

export const obtenerPorSubdominio = publicProc
  .input(z.object({}))
  .use(obtenerSubdominio)
  .query(async ({ ctx }) => {
    const { subdominio } = ctx;
    const campus = await Campus.findOne({ subdominio }).lean();

    if (!campus) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'El campus no existe.',
      });
    }

    return campus;
  });

export const obtenerPorId = privateProc
  .input(obtenerPorIdValidator)
  .query(async ({ input }) => {
    const { id } = input;

    const campus = await Campus.findById(id).lean();

    if (!campus) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'La institución no existe.',
      });
    }

    return campus;
  });

export const guardar = privateProc
  .input(campusValidator)
  .mutation(async ({ input, ctx }) => {
    const { subdominio, _id } = input;

    // Edición
    if (_id) {
      input.usuarioModificacion = ctx.session._id;
      const campus = await Campus.findById(_id);

      if (!campus) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'La institución no existe.',
        });
      }

      const repetido = await Campus.findOne({
        subdominio: input.subdominio,
        _id: { $ne: _id },
      });

      if (repetido) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'El subdominio ya está en uso.',
        });
      }

      await Campus.updateOne(input);

      return campus;
    }

    input.usuarioCreacion = ctx.session._id;
    const repetido = await Campus.findOne({ subdominio });

    if (repetido) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'El subdominio ya está en uso.',
      });
    }

    const campus = await Campus.create(input);

    return campus;
  });

export const eliminar = privateProc
  .input(
    z.object({
      id: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const { id } = input;
    const campus = await Campus.findById(id);

    if (!campus) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'El campus no existe.',
      });
    }

    campus.activo = false;
    await campus.save();
  });
