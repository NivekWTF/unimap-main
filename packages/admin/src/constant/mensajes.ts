export const Formularios = {
  required: 'Campo requerido',
  min: 'El campo debe tener al menos 1 caracter',
  email: 'El campo debe ser un correo electrónico',
  max: (max: number) => `El campo debe tener como máximo ${max} caracteres`,
  number: 'El campo debe ser un número',
}

export const Alertas = {
  guardado: 'Se han efectuado los cambios correctamente',
  serviciosImportardos: 'Se han importado los servicios correctamente',
}

export const ARCHIVO_GEOJSON_INVALIDO = 'El archivo seleccionado no es un archivo GeoJSON válido, favor de verificarlo.'; 

export const MAXIMO_ARCHIVOS = (max: number) => `Solo se pueden seleccionar hasta ${max} ${max === 1 ? 'archivo' : 'archivos'}`;