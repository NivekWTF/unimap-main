export type NodeId = string;
export type Node = { id: NodeId; lat: number; lng: number };
export type Edge = { from: NodeId; to: NodeId; weight: number };
export type Graph = { nodes: Record<NodeId, Node>; adj: Record<NodeId, Edge[]> };

export function haversine(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371000; const dLat = (b.lat - a.lat) * Math.PI / 180; const dLng = (b.lng - a.lng) * Math.PI / 180;
  const la1 = a.lat * Math.PI / 180, la2 = b.lat * Math.PI / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

class MinHeap<T> { arr: { k: number; v: T }[] = []; push(k: number, v: T) { this.arr.push({ k, v }); this.arr.sort((a, b) => a.k - b.k); } pop() { return this.arr.shift()?.v ?? null; } get size() { return this.arr.length; } }

export function aStar(graph: Graph, start: NodeId, goal: NodeId) {
  const open = new MinHeap<NodeId>(), g = new Map<NodeId, number>(), f = new Map<NodeId, number>(), came = new Map<NodeId, NodeId>();
  const h = (id: NodeId) => haversine(graph.nodes[id], graph.nodes[goal]);
  g.set(start, 0); f.set(start, h(start)); open.push(f.get(start)!, start);
  const seen = new Set<NodeId>();
  while (open.size) {
    const current = open.pop()!; if (current === goal) return reconstruct(came, current);
    if (seen.has(current)) continue; seen.add(current);
    for (const e of graph.adj[current] || []) {
      const cand = g.get(current)! + e.weight;
      if (cand < (g.get(e.to) ?? Infinity)) {
        came.set(e.to, current); g.set(e.to, cand);
        const score = cand + h(e.to); f.set(e.to, score); open.push(score, e.to);
      }
    }
  }
  return null;
}
function reconstruct(came: Map<NodeId, NodeId>, cur: NodeId) { const path = [cur]; while (came.has(cur)) { cur = came.get(cur)!; path.push(cur); } return path.reverse(); }
