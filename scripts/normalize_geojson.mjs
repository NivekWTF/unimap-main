import fs from 'fs'
import path from 'path'

const base = process.cwd()
const inPath = path.join(base, 'packages', 'web-vue', 'public', 'data', 'merged_unimap.geojson')
const outPath = path.join(base, 'packages', 'web-vue', 'public', 'data', 'merged_unimap_normalized.geojson')

function readJson(p){
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

const data = readJson(inPath)
const inputCount = (data.features||[]).length
let kept = 0
let skipped = 0
const outFeatures = []

for(const f of (data.features||[])){
  const geom = f.geometry || {}
  const type = geom.type
  // keep only Polygon / MultiPolygon
  if(type !== 'Polygon' && type !== 'MultiPolygon'){
    skipped++
    continue
  }

  // normalize Polygon to MultiPolygon
  let geometry = geom
  if(type === 'Polygon'){
    geometry = {
      type: 'MultiPolygon',
      coordinates: [geom.coordinates]
    }
  }

  // ensure properties
  const p = Object.assign({}, f.properties || {})

  // qgisId, nombre, categoria required by server: ensure non-empty strings
  if(!p.qgisId) p.qgisId = (p.nombreCorto && String(p.nombreCorto).slice(0,10)) || (p.nombre && String(p.nombre).slice(0,10)) || 'sin_qgis'
  if(!p.nombre) p.nombre = p.qgisId || 'sin_nombre'
  if(!p.categoria) p.categoria = p.categoria || 'otros'

  // nombreCorto: must be 1..10 chars per server validation
  let nc = p.nombreCorto ? String(p.nombreCorto).trim() : ''
  if(nc.length === 0){
    nc = String(p.nombre).slice(0,10)
  }
  if(nc.length > 10) nc = nc.slice(0,10)
  if(nc.length === 0) nc = String(p.qgisId).slice(0,10) || 'nc'
  p.nombreCorto = nc

  // pisos and pertenecePiso: convert to numbers (integer). If not parseable, set 0
  function toInt(v){
    if(v === null || v === undefined) return 0
    if(typeof v === 'number') return v
    const s = String(v).trim()
    if(s === '') return 0
    const n = parseInt(s, 10)
    return Number.isFinite(n) ? n : 0
  }
  p.pisos = toInt(p.pisos)
  p.pertenecePiso = toInt(p.pertenecePiso)

  // Keep a source marker if exists
  if(!p._source) p._source = f.properties && f.properties._source ? f.properties._source : 'merged'

  outFeatures.push({ type: 'Feature', properties: p, geometry })
  kept++
}

const out = { type: 'FeatureCollection', features: outFeatures }
fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8')
console.log('Input features:', inputCount)
console.log('Kept features:', kept)
console.log('Skipped features (invalid geometry):', skipped)
console.log('Written:', outPath)
