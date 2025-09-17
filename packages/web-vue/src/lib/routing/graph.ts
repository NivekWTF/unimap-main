// src/lib/routing/graph.ts
export type NodeId = string;

export type Node = {
  id: NodeId;
  lat: number;
  lng: number;
};

export type Edge = {
  from: NodeId;
  to: NodeId;
  weight: number; // metros
};

export type Graph = {
  nodes: Record<NodeId, Node>;
  adj: Record<NodeId, Edge[]>;
};

// Haversine en metros
export function haversine(a: {lat:number; lng:number}, b: {lat:number; lng:number}) {
  const R = 6371000;
  const dLat = (b.lat - a.lat) * Math.PI/180;
  const dLng = (b.lng - a.lng) * Math.PI/180;
  const la1 = a.lat * Math.PI/180;
  const la2 = b.lat * Math.PI/180;
  const x = Math.sin(dLat/2)**2 + Math.cos(la1)*Math.cos(la2)*Math.sin(dLng/2)**2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

// Min-heap simple
class MinHeap<T> {
  arr: {k:number; v:T}[] = [];
  push(k:number, v:T){ this.arr.push({k,v}); this.arr.sort((a,b)=>a.k-b.k); }
  pop(){ return this.arr.shift()?.v ?? null; }
  get size(){ return this.arr.length; }
}

export function aStar(graph: Graph, start: NodeId, goal: NodeId) {
  const open = new MinHeap<NodeId>();
  const g = new Map<NodeId, number>();
  const f = new Map<NodeId, number>();
  const came = new Map<NodeId, NodeId>();

  const h = (id: NodeId) => haversine(graph.nodes[id], graph.nodes[goal]);

  g.set(start, 0);
  f.set(start, h(start));
  open.push(f.get(start)!, start);

  const visited = new Set<NodeId>();

  while (open.size) {
    const current = open.pop()!;
    if (current === goal) return reconstruct(came, current);
    if (visited.has(current)) continue;
    visited.add(current);

    for (const e of graph.adj[current] || []) {
      const tentative = g.get(current)! + e.weight;
      if (tentative < (g.get(e.to) ?? Infinity)) {
        came.set(e.to, current);
        g.set(e.to, tentative);
        const score = tentative + h(e.to);
        f.set(e.to, score);
        open.push(score, e.to);
      }
    }
  }
  return null;
}

function reconstruct(came: Map<NodeId,NodeId>, current: NodeId): NodeId[] {
  const path = [current];
  while (came.has(current)) {
    current = came.get(current)!;
    path.push(current);
  }
  return path.reverse();
}
