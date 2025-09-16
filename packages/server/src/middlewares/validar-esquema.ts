import { Handler } from 'express';

import { z } from 'zod';

export const validarEsquema: (esquema: z.Schema) => Handler =
  (esquema) => (req, res, next) => {
    try {
      esquema.parse(req.body);
    } catch (error: any) {
      return res.status(400).json({ message: error.errors });
    }

    next();
  };
