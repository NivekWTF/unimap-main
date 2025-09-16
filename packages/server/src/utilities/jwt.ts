/* eslint-disable  @typescript-eslint/no-explicit-any */
import jwt from 'jsonwebtoken';

const { JWT_SECRET } = process.env;

/**
 * Función para generar un JWT
 */
export const generarJwt = (
  payload: Record<string, unknown>,
  secret: string = JWT_SECRET!
) =>
  new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      secret,
      {
        expiresIn: '24h',
      },
      (err, token) => {
        if (err) reject(err);
        resolve(token);
      }
    );
  });

export const verificarJwt = (token: string, secret: string = JWT_SECRET!) =>
  jwt.verify(token, secret);
