import jwt from 'jsonwebtoken';
import { type Handler } from 'express';

import { type TUsuario } from '../models';

export const validarToken: Handler = async (req, res, next) => {
  try {
    const auth = req.headers.authorization as string;

    if (!auth) return res.status(401).json({ estatus: false, message: 'No autorizado' });

    const usuario = jwt.verify(auth, process.env.JWT_SECRET!);

    if (!usuario) return res.status(401).json({ estatus: false, message: 'No autorizado' });

    const session = usuario as TUsuario & { _id: string };

    const { method } = req
    
    if (method === 'POST') {
      req.body.usuarioCreacion = session._id;
    } else if (['PUT', 'DELETE'].includes(method)) {
      req.body.usuarioModificacion = session._id;
      req.body.fechaModificacion = new Date();
    }

    res.locals.session = session;
    next();
  } catch (error) {
    return res.status(500).json({ estatus: false, message: 'Error el validar el token' });
  }
};
