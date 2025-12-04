import type { Graph, Node, NodeId, Edge } from './graph';
import { haversine } from './graph';

const PREC = 6;
const key = (lat: number, lng: number) => `${lat.toFixed(PREC)},${lng.toFixed(PREC)}`;

export function buildGraphFromPasillos(pasillosGeoJson: any): Graph {
  // First pass: collect raw nodes and edges from all LineStrings
  const rawNodes: Record<NodeId, Node> = {};
  const rawEdges: Array<[NodeId, NodeId]> = [];
  const addRawNode = (lat: number, lng: number) => { const id = key(lat, lng); if (!rawNodes[id]) rawNodes[id] = { id, lat, lng }; return id; };

  for (const f of pasillosGeoJson.features ?? []) {
    const g = f.geometry; if (!g) continue;
    const pushLine = (coords: number[][]) => {
      for (let i = 0; i < coords.length - 1; i++) {
        const [lng1, lat1] = coords[i], [lng2, lat2] = coords[i + 1];
        const a = addRawNode(lat1, lng1), b = addRawNode(lat2, lng2);
        rawEdges.push([a, b]);
      }
    };
    if (g.type === 'LineString') pushLine(g.coordinates as number[][]);
    else if (g.type === 'MultiLineString') for (const line of g.coordinates as number[][][]) pushLine(line);
  }

  // SNAP PHASE: group vertices closer than threshold into the same node
  const SNAP_THRESHOLD_METERS = 2; // merge nodes within 2 meters (tunable)
  const rawNodeList = Object.values(rawNodes);
  const repMap: Record<NodeId, NodeId> = {}; // original id -> representative id
  const kept: Node[] = [];

  for (const n of rawNodeList) {
    let foundRep: Node | null = null;
    for (const k of kept) {
      const d = haversine(n, k);
      if (d <= SNAP_THRESHOLD_METERS) { foundRep = k; break; }
    }
    if (foundRep) {
      repMap[n.id] = foundRep.id;
    } else {
      // keep this node as a representative
      kept.push({ id: n.id, lat: n.lat, lng: n.lng });
      repMap[n.id] = n.id;
    }
  }

  // Build final nodes map (representatives only)
  const nodes: Record<NodeId, Node> = {};
  for (const k of kept) nodes[k.id] = k;

  // Build adjacency deduplicating edges and remapping to representatives
  const adj: Record<NodeId, Edge[]> = {};
  const addEdgeFinal = (a: NodeId, b: NodeId) => {
    if (a === b) return;
    const A = nodes[a], B = nodes[b]; if (!A || !B) return;
    const w = haversine(A, B);
    // avoid duplicate edge entries
    const existsA = (adj[a] ?? []).some(e => e.to === b);
    if (!existsA) (adj[a] ??= []).push({ from: a, to: b, weight: w });
    const existsB = (adj[b] ?? []).some(e => e.to === a);
    if (!existsB) (adj[b] ??= []).push({ from: b, to: a, weight: w });
  };

  for (const [a0, b0] of rawEdges) {
    const a = repMap[a0] ?? a0; const b = repMap[b0] ?? b0;
    addEdgeFinal(a, b);
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
