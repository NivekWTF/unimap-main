import { type Crop } from 'react-image-crop';
import { type Geometria, type GeoJSON } from './types';
import { geoJsonSchema } from './validators';

const { VITE_API_URL } = import.meta.env;

export function readFile(file: File): Promise<ArrayBuffer> {
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

export function readImage(file: File): Promise<string> {
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export function obtenerCoordenadas() {
  if (!('geolocation' in navigator)) return null;

  return new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

const extractFileName = (filename: string) => filename.split('.').slice(0, -1).join('.');

export function recortarImagen({ 
  crop, 
  filename, 
  image 
}: { 
  image: HTMLImageElement, 
  crop: Crop, 
  filename: string 
}): Promise<{ src: string; file: File }> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  
  canvas.width = crop.width;
  canvas.height = crop.height;

  ctx?.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height,
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const src = canvas.toDataURL('image/jpeg');
      const newFileName = `${extractFileName(filename)}.jpeg`
      const file = new File([blob!], newFileName, { type: 'image/jpeg' });
      resolve({ file, src });
    }, 'image/jpeg', 1);
  });
}

 
export function crearFormData(objeto: Record<string, any>) {
  const formData = new FormData();

  for (const key in objeto) {
    const value = objeto[key];

    if (value === undefined || value === null) continue;

    if (Array.isArray(value) && value.every((val) => val instanceof File)) {
      value.forEach((val) => formData.append(key, val));
      continue;
    }

    if (value instanceof File) {
      formData.append(key, objeto[key]);
      continue;
    } 

    if (typeof value === 'object') {
      formData.append(key, JSON.stringify(value));
      continue;
    }
    
    formData.append(key, objeto[key]);
  }

  return formData;
}

export async function validarArchivoGeoJson(archivo: File) {
  const contenido = await readFile(archivo);
  const decoder = new TextDecoder('utf-8');
  const geoJson = JSON.parse(decoder.decode(contenido));
  const resultado = geoJsonSchema.safeParse(geoJson);
  return resultado;
}

export function crearGeoJsonDesdeGeometria(geometry: Geometria, properties = {}) {
  return <GeoJSON>{
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry,
        properties,
      },
    ],
  };
}

export const crearUrlFormato = (url: string) => `${VITE_API_URL}${url}`;