import bcrypt from 'bcryptjs';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { generarJwt, verificarJwt } from '../../utilities/jwt';
import { publicProc } from '../../config/trpc';
import { Usuario, TUsuario, Campus } from '../../models';
import {
  LOGIN_INCORRECTO,
  TOKEN_REFRESCO_INVALIDO,
} from '../../constants/mensajes';
import { Categoria } from '../../models/categoria';
import { obtenerSubdominio } from '../../middlewares/obtener-subdominio';
import { TipoUsuario } from '../../constants/tipo-usuario';

const { JWT_CLIENT_SECRET } = process.env;

export const loginCliente = publicProc
  .input(
    z.object({
      username: z.string(),
      password: z.string(),
    })
  )
  .use(obtenerSubdominio)
  .mutation(async ({ input, ctx }) => {
    const { subdominio } = ctx;

    const campus = await Campus.findOne({ subdominio }).lean();

    if (!campus) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'El campus no existe.',
      });
    }

    const { username, password } = input;

    const usuario = await Usuario.findOne({
      username,
      activo: true,
      campus,
      tipoUsuario: [TipoUsuario.Alumno, TipoUsuario.Profesor],
    })
      .populate('cargaAcademica.clase')
      .populate('cargaAcademica.lugar')
      .lean();

    if (!usuario) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: LOGIN_INCORRECTO,
      });
    }

    const sonCredencialesValidas = await bcrypt.compare(
      password,
      usuario.password!
    );

    if (!sonCredencialesValidas) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: LOGIN_INCORRECTO,
      });
    }

    delete usuario.password;

    const token = await generarJwt(usuario, JWT_CLIENT_SECRET) as string;

    return { token, usuario };
  });

export const loginAdmin = publicProc
  .input(
    z.object({
      username: z.string(),
      password: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const { username, password } = input;

    const usuario = await Usuario.findOne({ username, activo: true }).lean();

    if (!usuario) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: LOGIN_INCORRECTO,
      });
    }

    const sonCredencialesValidas = await bcrypt.compare(
      password,
      usuario.password!
    );

    if (!sonCredencialesValidas) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: LOGIN_INCORRECTO,
      });
    }

    delete usuario.password;

    const [token, categorias] = await Promise.all([
      (await generarJwt(usuario)) as string,
      Categoria.find({ activo: true }).populate('pertenece').lean(),
    ]);

    return {
      usuario,
      categorias,
      token,
    };
  });

export const revalidarAdmin = publicProc
  .input(
    z.object({
      token: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const { token } = input;

    try {
      const { _id } = verificarJwt(token) as { _id: string };

      const usuario = (await Usuario.findById(
        _id,
        'username activo nombres apellidos avatar tipoUsuario'
      ).lean()) as TUsuario;

      const [nuevoToken, categorias] = await Promise.all([
        generarJwt(usuario!),
        Categoria.find({ activo: true }).populate('pertenece').lean(),
      ]);

      return { usuario, token: nuevoToken as string, categorias };
    } catch (error) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: TOKEN_REFRESCO_INVALIDO,
      });
    }
  });

export const revalidarCliente = publicProc
  .input(z.object({ token: z.string() }))
  .mutation(async ({ input }) => {
    const { token } = input;
    try {
      const { _id } = verificarJwt(token, JWT_CLIENT_SECRET) as { _id: string };
      const usuario = await Usuario.findOne({
        _id,
        activo: true,
        tipoUsuario: [TipoUsuario.Alumno, TipoUsuario.Profesor],
      })
        .populate('cargaAcademica.clase')
        .populate('cargaAcademica.lugar')
        .lean();

      delete usuario?.password;
      if (!usuario) throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: TOKEN_REFRESCO_INVALIDO,
      });

      const nuevoToken = await generarJwt(usuario, JWT_CLIENT_SECRET) as string;

      return  { usuario, token: nuevoToken };
    } catch (error) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: TOKEN_REFRESCO_INVALIDO,
      });
    }
  });
