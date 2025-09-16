import { privateProc } from "../../config/trpc";
import { Clase } from "../../models";
import { paginar } from "../../utilities/paginar";
import { paginadoValidator, obtenerPorIdValidator } from "../../utilities/validators";

export const obtenerPaginado = privateProc
  .input(paginadoValidator)
  .query(async ({ input }) => {
    const { limite, pagina, q } = input;
    const paginado = await paginar(Clase, {
      query: {
        $and: [
          q ? { $text: { $search: q } } : {}
        ],
      },
      limite,
      pagina,
    });
    return paginado;
  });

export const eliminar = privateProc
  .input(obtenerPorIdValidator)
  .mutation(async ({ input }) => {
    const { id } = input;
    const clase = await Clase.findByIdAndUpdate(id, { activo: false }, { new: true });
    return clase;
  });