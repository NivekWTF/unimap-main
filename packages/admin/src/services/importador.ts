import axios from '../config/axios';
import {
  ALUMNOS,
  CARGA_ACADEMICA,
  CLASES,
  IMPORTADOR,
  SERVICIOS,
  endpoint,
} from '../constant/uris';

export const importarAlumnos = (formData: FormData) =>
  axios.post(endpoint(IMPORTADOR, ALUMNOS), formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

export const importarClases = (formData: FormData) =>
  axios.post(endpoint(IMPORTADOR, CLASES), formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

export const importarCargaAcademica = (formData: FormData) =>
  axios.post(endpoint(IMPORTADOR, CARGA_ACADEMICA), formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

export const importarServicios = (formData: FormData) =>
  axios.post(endpoint(IMPORTADOR, SERVICIOS), formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
