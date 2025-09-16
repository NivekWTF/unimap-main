import { z } from 'zod';

import { privateProc, publicProc } from '../../config/trpc';
import { Objeto, objetoValidator } from '../../models/objeto';
import { descargarArchivosBase64 } from '../../middlewares/descargar-archivos';
import { Carpetas } from '../../constants/carpetas';
import { paginadoValidator } from '../../utilities/validators';
import { paginar } from '../../utilities/paginar';
import { TRPCError } from '@trpc/server';
import { QGIS_ID_REPETIDO } from '../../constants/mensajes';

export const obtenerPaginado = privateProc
  .input(
    paginadoValidator.extend({
      categoria: z.string(),
    })
  )
  .query(async ({ input }) => {
    const { limite, pagina, q, categoria } = input;

    const paginado = await paginar(Objeto, {
      query: {
        categoria,
        activo: true,
        $and: [q ? { nombre: { $regex: q, $options: 'i' } } : {}],
      },
      limite,
      pagina,
    });

    paginado.registros.forEach((objeto) => {
      objeto.urlImagenes = objeto.imagenes.map(
        (imagen) => `${process.env.URL}/${imagen}`
      )
    });

    return paginado;
  });

export const obtenerTodos = publicProc
  .input(
    z.object({
      categoria: z.string().or(z.array(z.string())).optional(),
      campus: z.string().optional(),
    })
  )
  .query(async ({ input }) => {
    const { categoria, campus } = input;

    const objetos = await Objeto.find({
      activo: true,
      $and: [
        categoria ? { categoria } : {},
        campus ? { campus } : {},
      ],
    })
      .populate('categoria', '_id nombre')
      .populate('servicios', '_id nombre')
      .sort({ pertenece: 1 })
      .lean();

    objetos.forEach((objeto) => {
      objeto.urlImagenes = objeto.imagenes.map(
        (imagen) => `${process.env.URL}/${imagen}`
      );
    });

    return objetos;
  });

export const obtenerPorId = privateProc
  .input(z.object({ id: z.string() }))
  .query(async ({ input }) => {
    const { id } = input;
    const objeto = await Objeto.findById(id).lean();

    if (!objeto) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Objeto no encontrado',
      });
    }

    objeto.urlImagenes = objeto.imagenes.map(
      (imagen) => `${process.env.URL}/${imagen}`
    );
    return objeto;
  });

export const guardar = privateProc
  .input(objetoValidator)
  .use(descargarArchivosBase64('imagenes', Carpetas.Cargas))
  .mutation(async ({ input, ctx }) => {
    const { filenames: imagenes, session } = ctx;
    
    input.imagenes = imagenes!;

    const { _id, campus: institucion, qgisId } = input;

    if (_id) {
      const repetido = await Objeto.findOne({
        _id: { $ne: _id },
        activo: true,
        campus: institucion,
        qgisId
      });

      if (repetido) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: QGIS_ID_REPETIDO,
        })
      }  

      input.usuarioModificacion = session?._id;
      const objeto = await Objeto.findByIdAndUpdate(_id, input, { new: true });
      return objeto;
    }

    const repetido = await Objeto.findOne({
      activo: true,
      campus: institucion,
      qgisId,      
    });

    if (repetido) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: QGIS_ID_REPETIDO,
      })
    }

    input.usuarioCreacion = session?._id;
    const objeto = await Objeto.create(input);
    return objeto;
  });

export const eliminar = privateProc
  .input(
    z.object({
      id: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { id } = input
    const { session: { _id: usuarioModificacion } } = ctx

    const objeto = await Objeto.findByIdAndUpdate(id, {
      activo: false,
      usuarioModificacion,
    }, {
      new: true
    });

    return objeto;
  });
