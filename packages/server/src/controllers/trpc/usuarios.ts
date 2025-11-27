import bcrypt from 'bcryptjs';
import { v4 } from 'uuid';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

import transporter from '../../config/nodemailer';
import { privateProc, publicProc } from '../../config/trpc';
import { Usuario, usuarioGuardarValidator } from '../../models';
import {
  obtenerPorIdValidator,
  paginadoValidator,
  tiposUsuarioValidator,
} from '../../utilities/validators';
import { paginar } from '../../utilities/paginar';
import { parseHtml } from '../../utilities/functions';
import { Templates } from '../../constants/templates';
import { TipoUsuario } from '../../constants/tipo-usuario';

export const obtenerPaginado = privateProc
  .input(paginadoValidator.extend({ tipoUsuario: tiposUsuarioValidator }))
  .query(async ({ input }) => {
    const { pagina = 1, limite = 10, q, tipoUsuario } = input;

    const paginado = await paginar(Usuario, {
      query: {
        tipoUsuario,
        $and: [
          q
            ? {
                $or: [
                  { nombres: { $regex: q, $options: 'i' } },
                  { apellidos: { $regex: q, $options: 'i' } },
                  { username: { $regex: q, $options: 'i' } },
                ],
              }
            : {},
        ],
      },
      pagina,
      limite,
      options: {
        populate: {
          path: 'campus',
        },
      },
    });

    return paginado;
  });


export const enviarPassword = publicProc
  .input(z.object({ username: z.string() }))
  .mutation(async ({ input }) => {
    const { username } = input;

    const usuario = await Usuario.findOne({
      username,
      activo: true,
    })

    if (!usuario) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Usuario no encontrado.',
      });
    }

    if (usuario.password) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'El usuario ya se encuentra registrado.',
      });
    }

    const { 
      hashedPassword, password 
    } = await generateHashedPassword();

    usuario.password = hashedPassword;
    await usuario.save();

    const contexto = {
      nombre: `${usuario.nombres} ${usuario.apellidos}`,
      username: usuario.username,
      password,
    }

    const html = await parseHtml(Templates.CORREO_PASSWORD, contexto);

    (await transporter).sendMail({
      to: usuario.correo,
      subject: 'Generación de contraseña',
      html,
    });
  });

// Public procedure to request password recovery by email (uses correo)
export const enviarRecuperacion = publicProc
  .input(z.object({ correo: z.string().email().optional(), username: z.string().optional() }).refine(data => !!(data.correo || data.username), { message: 'correo o username requerido' }))
  .mutation(async ({ input }) => {
    const { correo, username } = input as { correo?: string; username?: string };

    // Support lookup by correo if present, otherwise by username for legacy DBs
    const findQuery: any = { activo: true };
    if (correo) findQuery.correo = correo;
    else if (username) findQuery.username = username;

    const usuario = await Usuario.findOne(findQuery);
    if (!usuario) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Usuario no encontrado.' });
    }

    // Generate a new password and hash it
    const { hashedPassword, password } = await generateHashedPassword();

    // Save hashed password first
    usuario.password = hashedPassword;
    await usuario.save();

    const contexto = {
      nombre: `${usuario.nombres} ${usuario.apellidos}`,
      username: usuario.username,
      password,
    };

    const html = await parseHtml(Templates.CORREO_REINICIAR_PASSWORD, contexto);

    try {
      await (await transporter).sendMail({
        to: usuario.correo,
        subject: 'Recuperación de contraseña',
        html,
      });
    } catch (e) {
      // revert saved password if sending failed
      try {
        usuario.password = undefined as any;
        await usuario.save();
      } catch (e2) {
        console.error('Error revertiendo password tras fallo de envío', e2);
      }
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'No se pudo enviar el correo de recuperación.' });
    }

    return { ok: true };
  });

export const obtenerPorId = privateProc
  .input(z.object({ id: z.string() }))
  .query(async ({ input }) => {
    const { id } = input;
    const usuario = await Usuario.findById(id)
      .populate('campus')
      .populate('cargaAcademica.clase')
      .populate('cargaAcademica.lugar')
      .lean();
    return usuario;
  });

export const guardar = publicProc
  .input(usuarioGuardarValidator)
  .mutation(async (ctx) => {
    const { input } = ctx;
    const { password } = input;

    const { hashedPassword } = await generateHashedPassword(password)

    const usuario = await Usuario.create({
      ...input,
      password: hashedPassword,
    });

    return usuario;
  });

export const reiniciarPassword = privateProc
  .input(obtenerPorIdValidator)
  .mutation(async ({ input }) => {
    const { id } = input;

    const usuario = await Usuario.findById(id);

    if (!usuario) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'El usuario no existe'
      });
    }

    if (usuario.tipoUsuario !== TipoUsuario.Alumno) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'Solo se puede reiniciar la contraseña a alumnos'
      });
    }

    const { 
      correo,
      nombres,
      username,
    } = usuario;

    const {
      hashedPassword, password,
    } = await generateHashedPassword();
    
    usuario.password = hashedPassword;
    await usuario.save();
    
    const contexto = { correo, nombres, username, password };
    const html = await parseHtml(Templates.CORREO_REINICIAR_PASSWORD, contexto); 

    (await transporter).sendMail({
      to: usuario.correo,
      subject: 'Recuperación de contraseña',
      html,
    });
  });

async function generateHashedPassword(password: string = v4().substring(0, 8)) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password!, salt);
  return { password, hashedPassword };
}