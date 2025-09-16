import { z } from 'zod';

import { privateProc, publicProc } from '../../config/trpc';
import { Servicio, servicioValidator } from '../../models/servicio';
import { paginar } from '../../utilities/paginar';
import { paginadoValidator } from '../../utilities/validators';
import { Objeto } from '../../models';

export const guardar = privateProc
  .input(servicioValidator)
  .mutation(async ({ ctx, input }) => {
    input.usuarioCreacion = ctx.session._id;
    const servicio = await Servicio.create(input);
    return servicio;
  });

export const obtenerPaginado = privateProc
  .input(paginadoValidator)
  .query(async ({ input }) => {
    const { limite, pagina, q } = input;

    const paginado = await paginar(Servicio, {
      limite,
      pagina,
      query: {
        activo: true,
        $and: [
          q
            ? {
                $or: [
                  { nombre: { $regex: q, $options: 'i' } },
                  { descripcion: { $regex: q, $options: 'i' } },
                  { palabrasClave: { $regex: q, $options: 'i' } },
                ],
              }
            : {},
        ],
      },
    });

    return paginado;
  });

export const obtenerTodos = privateProc.query(async () =>
  Servicio.find({ activo: true }).lean()
);

export const obtenerPorId = publicProc
  .input(
    z.object({
      id: z.string(),
      campus: z.string().optional(),
    })
  )
  .query(async ({ input }) => {
    const { id } = input;

    const [servicio, objetos] = await Promise.all([
      Servicio.findById(id).lean(),
      Objeto.find({ servicios: id, activo: true }).lean(),
    ]);

    return {
      ...servicio,
      objetos,
    };
  });

export const eliminar = privateProc
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input }) => {
    const { id } = input;
    const servicio = await Servicio.findByIdAndUpdate(id, {
      activo: false,
    }, { new: true }).lean();
    return servicio;
  });