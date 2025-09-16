import { parser } from 'csv';

import { Clase, Objeto, Campus, Usuario } from '../../../models';
import { ErrorImportacion } from '../../../utilities/types';
import {
  INSTITUCION_INEXISTENTE,
  REFERENCIA_OBJETO_INEXISTENTE,
  OBJETO_NO_PERTENECE_INSTITUCION,
  ERROR_PROCESANDO_CSV,
} from '../../../constants/mensajes';
import { TipoUsuario } from '../../../constants/tipo-usuario';

type CargaAcademicaCSV = {
  campus: string;
  clase: string;
  alumno: string;
  lugar: string;
  dia: number;
  horaInicio: string;
  horaFin: string;
};

type CargaPorAlumnos = Omit<CargaAcademicaCSV, 'alumno'>[];

export async function importarCargaAcademica(
  cargaAcademicaCSV: parser.Parser
): Promise<ErrorImportacion | null | undefined> {
  const [clases, objetos, campusBd] = await Promise.all([
    Clase.find({ activo: true }, '_id clave').lean(),
    Objeto.find({ activo: true }, '_id qgisId campus').lean(),
    Campus.find({ activo: true }, '_id clave').lean(),
  ]);

  const clasesPorClave = new Map(clases.map((c) => [c.clave, c]));
  const campusPorClave = new Map(campusBd.map((i) => [i.clave, i]));
  const objetosPorQgisId = new Map(objetos.map((o) => [o.qgisId, o]));

  const cargaPorCampus = new Map<string, Map<string, CargaPorAlumnos>>();

  try {
    for await (const carga of cargaAcademicaCSV) {
      const {
        campus: campusClave,
        alumno: claveAlumno,
        clase: claveClase,
        lugar,
        dia,
        horaFin,
        horaInicio,
      } = carga as CargaAcademicaCSV;

      const clase = clasesPorClave.get(claveClase);

      if (!clase) {
        return {
          status: false,
          message: `La clase con clave ${claveClase} no existe`,
        };
      }

      const objeto = objetosPorQgisId.get(lugar);
      const campus = campusPorClave.get(campusClave);

      if (!campus) {
        return {
          status: false,
          message: INSTITUCION_INEXISTENTE(campusClave),
        };
      }

      if (!objeto) {
        return {
          status: false,
          message: REFERENCIA_OBJETO_INEXISTENTE(lugar),
        };
      }

      if (objeto.campus.toString() !== campus._id.toString()) {
        return {
          status: false,
          message: OBJETO_NO_PERTENECE_INSTITUCION(lugar, campusClave),
        };
      }

      if (!cargaPorCampus.has(campus._id)) {
        cargaPorCampus.set(campus._id, new Map());
      }

      const cargaPorAlumno = cargaPorCampus.get(campus._id)!;
      const clasesAlumno = cargaPorAlumno.get(claveAlumno) || [];

      clasesAlumno.push({
        clase: clase._id.toString(),
        lugar: objeto._id.toString(),
        campus: campusClave,
        dia,
        horaInicio,
        horaFin,
      });

      cargaPorAlumno.set(claveAlumno, clasesAlumno);
    }
  } catch (error: any) {
    console.error(error);
    return {
      status: false,
      message: ERROR_PROCESANDO_CSV(error.code, error.lines),
    };
  }

  // Indica el tamaño del lote de registros por cada iteración
  const lote = 5000;

  for (const [campus, cargaPorAlumno] of cargaPorCampus) {
    const { size } = cargaPorAlumno;

    for (let i = 0; i < size; i += lote) {
      const loteClasesPorAlumno = Array.from(cargaPorAlumno.entries()).slice(
        i,
        i + lote
      );

      const alumnos = await Usuario.find({
        campus,
        clave: loteClasesPorAlumno.map(([claveAlumno]) => claveAlumno),
        tipoUsuario: TipoUsuario.Alumno,
      }, '_id clave').lean();

      const alumnosPorClave = new Map(alumnos.map((a) => [a.clave, a]));

      const upsertAlumnos = [];
      for (const [claveAlumno, clases] of loteClasesPorAlumno) {
        const alumno = alumnosPorClave.get(claveAlumno);

        if (!alumno) {
          return {
            status: false,
            message: `El alumno con clave ${claveAlumno} no existe`,
          };
        }

        upsertAlumnos.push({
          updateOne: {
            filter: { clave: alumno.clave, campus },
            update: { $set: { cargaAcademica: clases } },
            upsert: true,
          },
        });
      }

      await Usuario.bulkWrite(upsertAlumnos);
    }
  }
}
