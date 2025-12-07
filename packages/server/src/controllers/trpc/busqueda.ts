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

    // Build query objects and include campus only when provided (non-empty)
    const claseQuery: any = { $text: { $search: query }, activo: true };
    const servicioQuery: any = { $text: { $search: query }, activo: true };
    const objetoQuery: any = { $text: { $search: query }, activo: true };
    if (campus && campus.trim()) {
      claseQuery.campus = campus;
      objetoQuery.campus = campus;
    }

    // Perform text searches
    const [clases, servicios, objetosText] = await Promise.all([
      Clase.find(claseQuery, '_id nombre descripcion').lean(),
      Servicio.find(servicioQuery, '_id nombre descripcion').lean(),
      Objeto.find(objetoQuery, '_id nombre descripcion qgisId categoria').populate('categoria', '_id nombre').lean(),
    ]);

    // Additionally try to find objetos by qgisId (exact or partial, case-insensitive)
    let objetosByQgis: any[] = [];
    try {
      const qgisQuery: any = { qgisId: { $regex: query, $options: 'i' }, activo: true };
      if (campus && campus.trim()) qgisQuery.campus = campus;
      objetosByQgis = await Objeto.find(qgisQuery, '_id nombre descripcion qgisId categoria').populate('categoria', '_id nombre').lean();
    } catch (e) {
      console.debug('[busqueda] qgis lookup failed', e);
      objetosByQgis = [];
    }

    // Merge objetosText and objetosByQgis, deduplicating by _id
    const objetosMap = new Map<string, any>();
    (objetosText || []).forEach((o: any) => objetosMap.set(String(o._id), o));
    (objetosByQgis || []).forEach((o: any) => objetosMap.set(String(o._id), { ...(objetosMap.get(String(o._id)) || {}), ...o }));
    const objetos = Array.from(objetosMap.values());

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

    console.log(`[busqueda] query="${query}" campus="${campus}" resultados=${resultados.length}`);
    return resultados;
  });
