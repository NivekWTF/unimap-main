import csv from 'csv';
import { Router } from 'express';

import { multerMemoria } from '../../middlewares';
import { ERROR_CSV_INVALIDO } from '../../constants/mensajes';
import {
  importarAlumnos,
  importarClases,
  importarCargaAcademica,
  importarServicios,
} from './functions';

const importador = Router();

importador.post(
  '/alumnos',
  multerMemoria.single('csv'),
  async (req, res, next) => {
    try {
      const { file } = req;

      if (!file) {
        return res.status(400).json({ message: 'No se ha subido el archivo' });
      }

      let alumnosCSV;
      try {
        alumnosCSV = csv.parse(file.buffer, { columns: true });
      } catch (error) {
        return res
          .status(400)
          .json({ status: false, message: ERROR_CSV_INVALIDO });
      }

      const [alumnosCreados, error] = await importarAlumnos(alumnosCSV);

      if (error) {
        return res.status(400).json(error);
      }

      return res.status(200).json(alumnosCreados);
    } catch (error) {
      return next(error);
    }
  }
);

importador.post(
  '/clases',
  multerMemoria.single('csv'),
  async (req, res, next) => {
    try {
      const { file } = req;

      if (!file) {
        return res.status(400).json({ message: 'No se ha subido el archivo' });
      }

      let clasesCSV;
      try {
        clasesCSV = csv.parse(file.buffer, { columns: true });
      } catch (error) {
        return res
          .status(400)
          .json({ status: false, message: ERROR_CSV_INVALIDO });
      }

      const [clases, error] = await importarClases(clasesCSV);

      if (error) {
        return res.status(400).json(error);
      }

      return res.status(200).json(clases);
    } catch (error) {
      return next(error);
    }
  }
);

importador.post(
  '/carga-academica',
  multerMemoria.single('csv'),
  async (req, res, next) => {
    try {
      const { file } = req;

      if (!file) {
        return res.status(400).json({ message: 'No se ha subido el archivo' });
      }

      let cargaCSV;
      try {
        cargaCSV = csv.parse(file.buffer, { columns: true });
      } catch (error) {
        return res
          .status(400)
          .json({ status: false, message: ERROR_CSV_INVALIDO });
      }

      const error = await importarCargaAcademica(cargaCSV);

      if (error) {
        return res.status(400).json(error);
      }

      return res
        .status(200)
        .json({ status: true, message: 'Carga académica importada' });
    } catch (error) {
      return next(error);
    }
  }
);

importador.post(
  '/servicios',
  multerMemoria.single('csv'),
  async (req, res, next) => {
    try {
      const { file } = req;

      if (!file) {
        return res.status(400).json({ message: 'No se ha subido el archivo' });
      }

      let serviciosCSV;
      try {
        serviciosCSV = csv.parse(file.buffer, { columns: true });
      } catch (error) {
        return res
          .status(400)
          .json({ status: false, message: ERROR_CSV_INVALIDO });
      }

      const [servicios, error] = await importarServicios(serviciosCSV);

      if (error) {
        return res.status(400).json(error);
      }

      return res.status(200).json(servicios);
    } catch (error) {
      return next(error);
    }
  }
);

export default importador;
