import mongoose from 'mongoose'

import Logger from '../utilities/logger';
import { CONEXION_EXITOSA_DB, CONEXION_FALLIDA_DB } from '../constants/mensajes';

const establacerConexionBaseDeDatos = async () => {
  const { MONGO_CNN } = process.env;

  if (!MONGO_CNN) {
    Logger.log({ msg: 'Variable de entorno MONGO_CNN no configurada', severidad: 'warning' });
    return process.exit(1);
  }

  try {
    const conexion = await mongoose.connect(MONGO_CNN!);
    Logger.log({ msg: CONEXION_EXITOSA_DB, severidad: 'info' });
    return conexion
  } catch (error) {
    Logger.log({ msg: CONEXION_FALLIDA_DB(MONGO_CNN), severidad: 'error' });
    process.exit(1);
  }
}

const conexion = establacerConexionBaseDeDatos();

export default conexion;