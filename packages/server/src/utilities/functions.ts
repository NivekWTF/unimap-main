import fs from 'fs/promises'
import Handlebars from 'handlebars';

import { Templates } from '../constants/templates';

export const isUndefined = (value: any) => value === undefined;

export const obtenerSubdominio = (url: string) => {
  url = url
    .replace('http://', '')
    .replace('https://', '')
    .replace('www.', '');
  const urlArray = url.split('.');
  return urlArray[0];
}

const templatesCache = new Map();

export async function parseHtml(ruta: Templates, contexto: object = {}) {
  let template;
  
  if (templatesCache.has(ruta) && process.env.NODE_ENV === 'production') {
    template = templatesCache.get(ruta);
  } else {
    const html = await fs.readFile(ruta, 'utf-8');
    template = Handlebars.compile(html);
    templatesCache.set(ruta, template);
  }

  return template(contexto);
}