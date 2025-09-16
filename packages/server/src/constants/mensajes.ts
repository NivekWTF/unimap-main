import chalk from 'chalk';

const obtenerColorPorEntorno = (entorno: string) => {
  const colores: { [key: string]: chalk.Chalk } = {
    production: chalk.blue,
    development: chalk.green,
  } as const;

  const color = colores[entorno];
  return color(entorno);
};

export const LOGIN_INCORRECTO =
  'El nombre de usuario o la contraseña son incorrectos';

export const TOKEN_REFRESCO_INVALIDO = 'El token de refresco no es válido';

export const SERVICIO_INICIADO = (puerto: number | string) =>
  `El servicio ha iniciado en el puerto ${puerto}`;

export const ENTORNO_DE_EJECUCION = (entorno: string) =>
  `Entorno de ejecución => ${obtenerColorPorEntorno(entorno)}`;

export const CONEXION_EXITOSA_DB = 'Conexión exitosa a la base de datos';
export const CONEXION_FALLIDA_DB = (cnn: string) =>
  `Error al conectar a la base de datos: ${cnn}`;

export const REFERENCIA_OBJETO_INEXISTENTE = (id: string) =>
  `Se hace referencia al objeto con qgisId: "${id}", pero este no existe dentro del campus`;

export const REFERENCIA_CATEGORIA_INEXISTENTE = (
  qgisId: string,
  categoria: string
) =>
  `Se hace referencia a la categoría "${categoria}" en el objeto con qgisId: "${qgisId}", pero está no existe.`;

export const QGIS_ID_REPETIDO =
  'El qgisId proporcionado ya se encuentra en uso dentro del campus';

export const PISO_SUPERIOR_INEXISTENTE = ({
  piso,
  pisoMax,
  padre,
  hijo,
}: {
  pisoMax: number;
  piso: number;
  padre: string;
  hijo: string;
}) =>
  `El objeto con qgisId: "${hijo}" hace referencia al piso: ${piso} del objeto con qgisId: "${padre}", pero este solo cuenta con ${pisoMax} piso(s)`;

export const CATEGORIA_SIN_RELACION = ({
  categoriaHijo,
  categoriaPadre,
  hijo,
  padre,
}: {
  categoriaHijo: string;
  categoriaPadre: string;
  hijo: string;
  padre: string;
}) =>
  `La categoría "${categoriaHijo}" del objeto con qgisId: "${hijo}" no tiene relación con la categoría "${categoriaPadre}" del objeto con qgisId: "${padre}"`;

export const INSTITUCION_INEXISTENTE = (clave: string) =>
  `Se hace referencia al campus con clave: "${clave}", pero esta no existe`;

export const OBJETO_NO_PERTENECE_INSTITUCION = (objeto: string, institucion: string) => 
  `El objeto con qgisId: ${objeto}, no existe dentro del campus con clave: ${institucion}`;

export const ERROR_CSV_INVALIDO = 'El archivo no es un CSV válido';

export const ERROR_PROCESANDO_CSV = (codigo: string, linea: number) =>
  `El archivo no tiene el formato correcto. Error: ${codigo}, Linea: ${linea}`;
