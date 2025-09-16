import { parser } from 'csv';

import { Campus, Usuario, TUsuario } from '../../../models';
import {
  INSTITUCION_INEXISTENTE,
  ERROR_PROCESANDO_CSV,
} from '../../../constants/mensajes';
import { ResultadoImportacion } from '../../../utilities/types';
import { TipoUsuario } from '../../../constants/tipo-usuario';

type AlumnoCSV = {
  clave: string;
  nombres: string;
  campus: string;
  apellidos: string;
  correo: string;
};

export async function importarAlumnos(
  alumnosCSV: parser.Parser
): ResultadoImportacion {
  const campusBd = await Campus.find({
    activo: true,
  }, '_id clave').lean();

  const campusPorClave = new Map(campusBd.map((i) => [i.clave, i]));

  const alumnos: TUsuario[] = [];
  try {
    for await (const alumno of alumnosCSV) {
      const {
        clave,
        nombres,
        apellidos,
        campus: claveCampus,
        correo,
      } = alumno as AlumnoCSV;

      const campus = campusPorClave.get(claveCampus);

      if (!campus) {
        return [
          null,
          {
            status: false,
            message: INSTITUCION_INEXISTENTE(claveCampus),
          },
        ];
      }

      alumnos.push({
        username: clave,
        clave,
        nombres,
        apellidos,
        correo,
        campus: campus._id,
        tipoUsuario: TipoUsuario.Alumno,
        cargaAcademica: [],
      });
    }
  } catch (error: any) {
    return [
      null,
      {
        status: false,
        message: ERROR_PROCESANDO_CSV(error.code, error.lines),
      },
    ];
  }

  const upsertAlumnos = alumnos.map((alumno) => ({
    updateOne: {
      filter: { clave: alumno.clave, campus: alumno.campus },
      update: { $set: alumno },
      upsert: true,
    },
  }));

  const alumnosCreados = await Usuario.bulkWrite(upsertAlumnos);

  return [alumnosCreados, null];
}
