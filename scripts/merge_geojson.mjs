import fs from 'fs'
import path from 'path'

const base = process.cwd()
const aPath = path.join(base, 'packages', 'web-vue', 'public', 'data', 'Tec_Contorno_.geojson')
const bPath = path.join(base, 'packages', 'web-vue', 'public', 'data', 'Biblioteca.geojson')
const outPath = path.join(base, 'packages', 'web-vue', 'public', 'data', 'merged_unimap.geojson')

function readJson(p){
  const s = fs.readFileSync(p, 'utf8')
  return JSON.parse(s)
}

const a = readJson(aPath)
const b = readJson(bPath)

// Merge features with simple dedup by properties.qgisId when present
const map = new Map()
function featureKey(f){
  if(f && f.properties && f.properties.qgisId) return String(f.properties.qgisId)
  if(f && f.properties && f.properties.nombre) return `nombre:${String(f.properties.nombre)}`
  return JSON.stringify(f.geometry || {})
}

;(a.features || []).forEach(f => {
  const k = featureKey(f)
  f.properties = f.properties || {}
  f.properties._source = f.properties._source || 'Tec_Contorno'
  if(!map.has(k)) map.set(k, f)
})

;(b.features || []).forEach(f => {
  const k = featureKey(f)
  f.properties = f.properties || {}
  f.properties._source = f.properties._source || 'Biblioteca'
  if(!map.has(k)) map.set(k, f)
})

const merged = {
  type: 'FeatureCollection',
  features: Array.from(map.values())
}

fs.writeFileSync(outPath, JSON.stringify(merged, null, 2), 'utf8')
console.log('Merged features:', merged.features.length)
console.log('Written to', outPath)
