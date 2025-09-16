import Multer from 'multer';
import { sync } from 'mkdirp';
import { v4 } from 'uuid';

import { Carpetas } from '../constants/carpetas';

const getMimeExtension = (fileName: string) => fileName.split('.').at(1) as string;

const validateExtension = (extension: string) =>
  ['csv', 'json', 'geojson', 'png', 'jpeg', 'jpg'].includes(extension);

const almacenamientoDisco = Multer.diskStorage({
  destination: (_, __, cb) => {
    const carpeta = Carpetas.Cargas
    sync(carpeta);
    cb(null, carpeta);
  },
  filename: (_, file, cb) => {
    const extension = getMimeExtension(file.originalname);

    if (!validateExtension(extension)) {
      return cb(new Error('Extensión no válida'), '');
    }

    const newFilename = `${v4()}.${getMimeExtension(file.originalname)}`;
    cb(null, newFilename);
  },
});

const almacenamientoMemoria = Multer.memoryStorage();

export const multerDisco = Multer({ storage: almacenamientoDisco });

export const multerMemoria = Multer({ storage: almacenamientoMemoria });
