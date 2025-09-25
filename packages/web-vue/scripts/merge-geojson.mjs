import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '../public/data');

// Candidates for contorno input
const CONTORNO_CANDIDATES = [
  process.env.CONTORNO || 'Tec_Contorno.geojson',
  'Tec_Contorno_.geojson',
];

// Extras can be provided via env GEOJSON_EXTRA as comma-separated list, else default Biblioteca.geojson
const extraEnv = process.env.GEOJSON_EXTRA || 'Biblioteca.geojson';
const EXTRAS = extraEnv.split(',').map(s => s.trim()).filter(Boolean);

async function readJsonIfExists(p) {
  try {
    const buf = await fs.readFile(p, 'utf8');
    return JSON.parse(buf);
  } catch (e) {
    return null;
  }
}

function toFeatures(fc) {
  if (!fc) return [];
  if (fc.type === 'FeatureCollection') return Array.isArray(fc.features) ? fc.features : [];
  if (fc.type === 'Feature') return [fc];
  return [];
}

async function main() {
  // pick first existing contorno
  let contornoPath = null;
  for (const c of CONTORNO_CANDIDATES) {
    const p = path.join(dataDir, c);
    const j = await readJsonIfExists(p);
    if (j) { contornoPath = p; break; }
  }
  if (!contornoPath) {
    console.error('No se encontró ningún contorno en', CONTORNO_CANDIDATES.join(', '));
    process.exit(1);
  }

  const contorno = await readJsonIfExists(contornoPath);
  const contornoFeatures = toFeatures(contorno);

  const extras = [];
  for (const name of EXTRAS) {
    const p = path.join(dataDir, name);
    const j = await readJsonIfExists(p);
    if (!j) {
      console.warn('No se pudo leer extra:', name);
      continue;
    }
    extras.push(...toFeatures(j));
  }

  const merged = {
    type: 'FeatureCollection',
    features: [...contornoFeatures, ...extras],
  };

  const outPath = path.join(dataDir, 'Tec_Contorno.geojson');
  await fs.writeFile(outPath, JSON.stringify(merged));
  console.log('GeoJSON fusionado escrito en', outPath, 'features:', merged.features.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
