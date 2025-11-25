<script setup lang="ts">
import { computed } from 'vue';
import { useObjetos } from '@/composables/useObjetos';

const { objetos, categoria, setCategoria, categorias: categoriasBackend } = useObjetos();

// Use backend categorias if available, otherwise derive from objetos
const categorias = computed(() => {
  if ((categoriasBackend.value || []).length) {
    return categoriasBackend.value.map((c: any) => ({ id: c._id, nombre: c.nombre }));
  }
  const map = new Map<string, { id: string; nombre: string }>();
  for (const o of objetos.value || []) {
    const cid = o?.categoria?._id ?? o?.categoria;
    const nombre = o?.categoria?.nombre ?? String(cid ?? o?.categoria ?? 'Sin categoría');
    if (!cid) continue;
    if (!map.has(cid)) map.set(cid, { id: cid, nombre });
  }
  return Array.from(map.values());
});

function onChange(e: Event) {
  const v = (e.target as HTMLSelectElement).value;
  setCategoria(v || '');
}
</script>

<template>
  <div style="display:flex;align-items:center;gap:8px">
    <label for="category-select" style="font-weight:600;font-size:14px;color:#222">Categoría</label>
    <select id="category-select" @change="onChange" :value="categoria">
      <option value="">Todas</option>
      <option v-for="c in categorias" :key="c.id" :value="c.id">{{ c.nombre }}</option>
    </select>
  </div>
</template>
