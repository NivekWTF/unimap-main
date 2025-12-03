import fs from 'fs'
import path from 'path'

const base = process.cwd()
const inPath = path.join(base, 'packages', 'web-vue', 'public', 'data', 'merged_unimap_normalized.geojson')
const outPath = path.join(base, 'packages', 'web-vue', 'public', 'data', 'merged_unimap_normalized_fixed.geojson')

function readJson(p){ return JSON.parse(fs.readFileSync(p, 'utf8')) }
const doc = readJson(inPath)
const features = doc.features || []

// Build index by qgisId
const byQgis = new Map()
for(const f of features){
  const q = f.properties && f.properties.qgisId
  if(q) byQgis.set(String(q), f)
}

// For each feature that has pertenece (parent qgisId) and pertenecePiso > 0, collect max per parent
const parentMax = new Map()
for(const f of features){
  const p = f.properties || {}
  const parent = p.pertenece
  const piso = Number(p.pertenecePiso || 0)
  if(parent){
    const cur = parentMax.get(parent) || 0
    if(Number.isFinite(piso) && piso > cur) parentMax.set(parent, piso)
  }
}

// Apply to parents: set pisos = Math.max(existing, maxChild)
const changed = []
for(const [parentId, maxPiso] of parentMax.entries()){
  const parentFeature = byQgis.get(String(parentId))
  if(!parentFeature) continue
  parentFeature.properties = parentFeature.properties || {}
  const existing = Number(parentFeature.properties.pisos || 0)
  if(!Number.isFinite(existing) || existing < maxPiso){
    parentFeature.properties.pisos = maxPiso
    changed.push({ qgisId: parentId, old: existing, new: maxPiso })
  }
}

fs.writeFileSync(outPath, JSON.stringify(doc, null, 2), 'utf8')
console.log('Parents updated:', changed.length)
if(changed.length) console.log(JSON.stringify(changed, null, 2))
console.log('Written to', outPath)
