import { z } from "zod";

import { publicProc } from "../../config/trpc";
import { Clase, Objeto, Servicio, TCategoria } from "../../models";

export const buscar = publicProc
  .input(
    z.object({
      query: z.string(),
      campus: z.string(),
    }),
  )
  .query(async ({ input }) => {
    const { query, campus } = input;

    const [clases, servicios, objetos] = await Promise.all([
      Clase.find(
        {
          campus,
          $text: {
            $search: query,
          },
          activo: true,
        },
        "_id nombre descripcion",
      ).lean(),
      Servicio.find(
        {
          $text: {
            $search: query,
          },
          activo: true,
        },
        "_id nombre descripcion",
      ).lean(),
      Objeto.find(
        {
          campus,
          $text: {
            $search: query,
          },
          activo: true,
        },
        "_id nombre descripcion",
      )
        .populate("categoria", "_id nombre")
        .lean(),
    ]);

    const resultados = [
      ...clases.map((clase) => ({
        ...clase,
        agrupador: "Clases",
        tipo: "clase",
      })),
      ...servicios.map((servicio) => ({
        ...servicio,
        agrupador: "Servicios",
        tipo: "servicio",
      })),
      ...objetos.map(({ categoria, ...objeto }) => ({
        ...objeto,
        agrupador: (categoria as TCategoria).nombre,
        tipo: "objeto",
      })),
    ].sort(
      (
        { agrupador: agrupadorA, nombre: nombreA },
        { agrupador: agrupadorB, nombre: nombreB },
      ) => {
        if (agrupadorA === agrupadorB) {
          return nombreA.localeCompare(nombreB);
        }

        return agrupadorA.localeCompare(agrupadorB);
      },
    ) as Array<{
      _id: string;
      nombre: string;
      descripcion: string;
      tipo: "clase" | "servicio" | "objeto";
      agrupador: string;
    }>;

    return resultados;
  });
