import { parser } from 'csv';

import { Servicio } from '../../../models';
import { ResultadoImportacion } from '../../../utilities/types';

type ServicioCSV = {
  clave: string;
  nombre: string;
  descripcion: string;
  palabrasClave: string;
  activo: true;
};

export async function importarServicios(
  serviciosCSV: parser.Parser
): ResultadoImportacion {
  const servicios = [];
  try {
    for await (const servicio of serviciosCSV) {
      const { clave, nombre, descripcion, palabrasClave } = servicio as ServicioCSV;
      servicios.push({
        clave,
        nombre,
        descripcion,
        palabrasClave: palabrasClave.split(','),
        activo: true,
      });
    }
  } catch (error: any) {
    return [null, {
      status: false,
      message: error.message,
    }];
  }

  const upsertServicios = servicios.map((servicio) => ({
    updateOne: {
      filter: { clave: servicio.clave },
      update: { $set: servicio },
      upsert: true,
    },
  }));

  const serviciosBd = await Servicio.bulkWrite(upsertServicios);

  return [serviciosBd, null];
}
