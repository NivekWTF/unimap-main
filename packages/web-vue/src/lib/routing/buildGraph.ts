import type { Graph, Node, NodeId, Edge } from './graph';
import { haversine } from './graph';

const PREC = 6;
const key = (lat: number, lng: number) => `${lat.toFixed(PREC)},${lng.toFixed(PREC)}`;

export function buildGraphFromPasillos(pasillosGeoJson: any): Graph {
  const nodes: Record<NodeId, Node> = {}, adj: Record<NodeId, Edge[]> = {};
  const addNode = (lat: number, lng: number) => { const id = key(lat, lng); if (!nodes[id]) nodes[id] = { id, lat, lng }; return id; };
  const addEdge = (a: NodeId, b: NodeId) => {
    const A = nodes[a], B = nodes[b], w = haversine(A, B);
    (adj[a] ??= []).push({ from: a, to: b, weight: w }); (adj[b] ??= []).push({ from: b, to: a, weight: w });
  };

  for (const f of pasillosGeoJson.features ?? []) {
    const g = f.geometry; if (!g) continue;
    const pushLine = (coords: number[][]) => {
      for (let i = 0; i < coords.length - 1; i++) {
        const [lng1, lat1] = coords[i], [lng2, lat2] = coords[i + 1];
        const a = addNode(lat1, lng1), b = addNode(lat2, lng2); addEdge(a, b);
      }
    };
    if (g.type === 'LineString') pushLine(g.coordinates as number[][]);
    else if (g.type === 'MultiLineString') for (const line of g.coordinates as number[][][]) pushLine(line);
  }
  return { nodes, adj };
}
export function nearestNodeId(graph: Graph, lat: number, lng: number): NodeId {
  let best: { id: NodeId; d: number } | null = null;
  for (const id in graph.nodes) { const d = haversine({ lat, lng }, graph.nodes[id]); if (!best || d < best.d) best = { id, d }; }
  return best!.id;
}
export function pathToGeoJson(graph: Graph, path: NodeId[]) {
  const coords = path.map(id => [graph.nodes[id].lng, graph.nodes[id].lat]);
  return { type: 'Feature', geometry: { type: 'LineString', coordinates: coords }, properties: { capa: 'ruta' } };
}
