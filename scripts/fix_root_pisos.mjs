import fs from 'fs';
import path from 'path';

const filePath = path.resolve('packages/web-vue/public/data/merged_unimap_normalized_fixed.geojson');

const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
if (!data.features || !Array.isArray(data.features)) {
  console.error('Not a FeatureCollection');
  process.exit(1);
}

let changed = 0;
for (const feat of data.features) {
  const props = feat.properties || {};
  const pertenece = props.pertenece;
  // treat null or empty string or undefined as root
  const isRoot = pertenece === '' || pertenece === null || pertenece === undefined;
  if (isRoot) {
    const pisos = Number(props.pisos ?? 0);
    if (pisos === 0) {
      props.pisos = 1;
      changed++;
    }
  }
}

if (changed === 0) {
  console.log('No root features needed pisos fix');
} else {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Updated pisos on ${changed} root feature(s)`);
}
