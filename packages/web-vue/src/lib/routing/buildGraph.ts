// src/lib/routing/buildGraph.ts
import type { Graph, Node, NodeId, Edge } from './graph';
import { haversine } from './graph';

// redondeo para deduplicar nodos coincidentes
const PREC = 6;
const key = (lat:number, lng:number) => `${lat.toFixed(PREC)},${lng.toFixed(PREC)}`;

export function buildGraphFromPasillos(pasillosGeoJson: any): Graph {
  const nodes: Record<NodeId, Node> = {};
  const adj: Record<NodeId, Edge[]> = {};

  function addNode(lat:number, lng:number): NodeId {
    const id = key(lat, lng);
    if (!nodes[id]) nodes[id] = { id, lat, lng };
    return id;
  }

  function addEdge(a: NodeId, b: NodeId) {
    const A = nodes[a], B = nodes[b];
    const w = haversine(A, B);
    (adj[a] ||= []).push({ from:a, to:b, weight:w });
    (adj[b] ||= []).push({ from:b, to:a, weight:w }); // bidireccional
  }

  for (const f of pasillosGeoJson.features ?? []) {
    const g = f.geometry;
    if (!g) continue;

    const pushLine = (coords: number[][]) => {
      for (let i=0; i<coords.length-1; i++) {
        const [lng1, lat1] = coords[i];
        const [lng2, lat2] = coords[i+1];
        const a = addNode(lat1, lng1);
        const b = addNode(lat2, lng2);
        addEdge(a, b);
      }
    };

    if (g.type === 'LineString') {
      pushLine(g.coordinates as number[][]);
    } else if (g.type === 'MultiLineString') {
      for (const line of g.coordinates as number[][][]) pushLine(line);
    }
  }

  return { nodes, adj };
}

export function nearestNodeId(graph: Graph, lat:number, lng:number): NodeId {
  let best: {id:NodeId; d:number} | null = null;
  for (const id in graph.nodes) {
    const d = haversine({lat, lng}, graph.nodes[id]);
    if (!best || d < best.d) best = { id, d };
  }
  return best!.id;
}

export function pathToGeoJson(graph: Graph, path: NodeId[]) {
  const coords = path.map(id => [graph.nodes[id].lng, graph.nodes[id].lat]);
  return {
    type: 'Feature',
    geometry: { type: 'LineString', coordinates: coords },
    properties: { capa: 'ruta' }
  };
}
