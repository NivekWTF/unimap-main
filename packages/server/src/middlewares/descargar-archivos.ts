import fs from 'fs';
import { join } from 'path';
import { v4 } from 'uuid';

import { middleware } from '../config/trpc';
import { TRPCError } from '@trpc/server';
import { Carpetas } from '../constants/carpetas';
import { REGEX_BASE_64 } from '../constants/regex';

const archivosPermitidos = ['png', 'jpg', 'jpeg'];

let carpetasVerificadas: { [key in Carpetas]?: boolean } = {  };

export const descargarArchivosBase64 = (prop: string, destino = Carpetas.Temporal) =>
  middleware(async ({ input, next }) => {
    if (typeof input !== 'object' || !input) return next();

    const { [prop]: data } = input as { [key: string]: string | string[] };

    if (!data) return next();

    const dir = join(__dirname, '..', '..', destino);

    if (!carpetasVerificadas[destino]) {
      carpetasVerificadas[destino] = true;
      if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    }

    const files = Array.isArray(data) ? data : [data];

    try {
      const filenames = await Promise.all(
        files.map(
          (data) =>
            new Promise((resolve, reject) => {
              if (!REGEX_BASE_64.test(data)) resolve(data);

              const extension = extraerExtension(data);
              const base64 = data.split(';base64,').pop() as string;

              if (!extension || !archivosPermitidos.includes(extension))
                return reject(new Error('Tipo de archivo no permitido'));

              const filename = `${v4()}.${extension}`;
              const filePath = join(dir, filename);

              fs.writeFile(filePath, Buffer.from(base64, 'base64'), (err) => {
                if (err) return reject(err);
                resolve(filePath);
              });
            })
        )
      ) as string[];
      return next({ ctx: { filenames } });
    } catch (error: any) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: error.message!,
      });
    }
  });

function extraerExtension(data: string) {
  const [, extension] = data.match(/data:image\/(\w+);base64/) || [];
  return extension;
}
