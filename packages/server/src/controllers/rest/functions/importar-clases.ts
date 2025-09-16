import { parser } from 'csv';

import { Campus, Clase } from '../../../models';
import { INSTITUCION_INEXISTENTE, ERROR_PROCESANDO_CSV } from '../../../constants/mensajes';
import { type ResultadoImportacion } from '../../../utilities/types';

type ClaseCSV = {
  clave: string,
  nombre: string,
  descripcion: string,
  campus: string
}

export async function importarClases(clasesCSV: parser.Parser): ResultadoImportacion {
  const clases: ClaseCSV[] = [];
  try { 
    const campusBd = await Campus.find({
      activo: true,
    }, '_id clave').lean();

    const campusPorClave = new Map(
      campusBd.map((i) => [i.clave, i])
    );

    for await (const clase of clasesCSV) {
      const {
        clave,
        nombre,
        descripcion,
        campus: claveCampus,
      } = clase as ClaseCSV;

      const campus = campusPorClave.get(claveCampus);

      if (!campus) {
        return [null, {
          status: false,
          message: INSTITUCION_INEXISTENTE(claveCampus),
        }];
      }

      clases.push({
        clave,
        nombre,
        descripcion,
        campus: campus._id,
      });
    }
  } catch (error: any) {
    return [null, {
      status: false,
      message: ERROR_PROCESANDO_CSV(error.code, error.lines),
    }];
  }

  const upsertClases = clases.map((clase) => ({
    updateOne: {
      filter: { clave: clase.clave, campus: clase.campus },
      update: { $set: clase },
      upsert: true,
    },
  }));

  const clasesCreadas = await Clase.bulkWrite(upsertClases);

  return [clasesCreadas, null];
}