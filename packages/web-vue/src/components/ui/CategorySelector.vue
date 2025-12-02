<script setup lang="ts">
import { computed, nextTick } from 'vue';
import { useObjetos } from '@/composables/useObjetos';
import { useAppStore } from '@/stores/app';

const props = withDefaults(defineProps<{ floating?: boolean }>(), { floating: true });

const { objetos, categoria, setCategoria, categorias: categoriasBackend, openObjeto } = useObjetos();
const app = useAppStore();

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

async function select(id: string) {
  // set the category filter
  setCategoria(id || '');

  if (!id) {
    // show all: close any open swipeable / selected object
    try {
      app.cerrarSwipeable();
    } catch (e) { console.debug('cerrarSwipeable error', e); }
    return;
  }

  // find a representative object for this category and open it
  try {
    // try to find a root object (not a child) matching the category
    const objs = objetos.value || [];
    const found = objs.find((o: any) => {
      const cid = o?.categoria?._id ?? o?.categoria;
      return cid === id;
    });
    if (found) {
      // ensure UI reacts after category is set
      await nextTick();
      openObjeto(String(found._id));
    }
  } catch (e) {
    console.debug('CategorySelector select openObjeto error', e);
  }
}
</script>

<template>
  <div class="cat-overlay" :class="{ floating: props.floating }" role="toolbar" aria-label="Selector de categorías">
    <div class="cat-container">
      <button class="cat-button" :class="{ active: categoria === '' }" @click="select('')">Todas</button>
      <button v-for="c in categorias" :key="c.id" class="cat-button" :class="{ active: categoria === c.id }" @click="select(c.id)">{{ c.nombre }}</button>
    </div>
  </div>
</template>

<style scoped>
.cat-overlay{
  position: static;
  left: auto;
  top: auto;
  transform: none;
  z-index: 1200;
  pointer-events: auto;
}
.cat-overlay.floating{
  position: fixed;
  left: 50%;
  top: 25%;
  transform: translate(-50%, -50%);
}
.cat-container{
  display:flex;
  gap:8px;
  flex-wrap:wrap;
  align-items:center;
  background: rgba(255,255,255,0.95);
  padding: 10px 14px;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.12);
  max-width: 100vw;
  margin-top: 8px;
}
.cat-button{
  padding:8px 12px;
  background: transparent;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor:pointer;
  font-weight:600;
  color:#222;
}
.cat-button:hover{ background:#f5f5f5 }
.cat-button.active{
  background: #1976D2;
  color: #fff;
  border-color: rgba(25,118,210,0.9);
}

@media (max-width:640px){
  .cat-container{ gap:6px; padding:8px }
  .cat-button{ padding:6px 10px; font-size:13px }
}
</style>
