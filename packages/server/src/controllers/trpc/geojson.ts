import { TRPCError } from "@trpc/server";

import { publicProc } from "../../config/trpc";
import { obtenerPorIdValidator } from "../../utilities/validators";
import { Campus, Objeto, TCampus } from "../../models";

export const obtenerPorCampusId = publicProc
  .input(obtenerPorIdValidator)
  .query(async ({ input }) => {
    const { id } = input;

    const campus = (await Campus.findById(id).lean()) as Partial<TCampus>;
    if (!campus) {
      throw new TRPCError({
        code: "NOT_FOUND",
      });
    }

    const objetos = await Objeto.find({
      campus: campus._id,
    })
      .populate("categoria")
      .lean();

    const geojson = {
      type: "FeatureCollection",
      features: [] as any[],
    };

    const { geometria } = campus;
    delete campus.geometria;

    geojson.features = [
      {
        type: "MultiPolygon",
        properties: campus,
        geometry: geometria,
      },
    ];

    for (const { geometria, ...objeto } of objetos) {
      geojson.features.push({
        type: "MultiPolygon",
        properties: objeto,
        geometry: geometria,
      });
    }

    return geojson;
  });
