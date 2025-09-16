export const OBJETOS = '/objetos';
export const IMPORTADOR = '/importador';
export const ALUMNOS = '/alumnos';
export const CLASES = '/clases';
export const CARGA_ACADEMICA = '/carga-academica';
export const SERVICIOS = '/servicios';

// Ejemplos formatos
export const EJEMPLO_CSV_ALUMNOS = '/public/examples/alumnos.csv'
export const EJEMPLO_CSV_CLASES = '/public/examples/clases.csv';
export const EJEMPLO_CSV_CARGA_ACADEMICA = '/public/examples/carga.csv';
export const EJEMPLO_CSV_SERVICIOS = '/public/examples/servicios.csv';

export const endpoint = (...paths: (string | number)[]) =>
  `/${paths.map((path) => String(path).replace(/^\//, '')).join('/')}`;
