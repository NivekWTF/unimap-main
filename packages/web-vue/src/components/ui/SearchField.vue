<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { trpc } from '@/lib/trpc';
import { useAppStore } from '@/stores/app';
import { useObjetos } from '@/composables/useObjetos';

const props = withDefaults(defineProps<{ placeholder?: string; debounce?: number; width?: string }>(), { placeholder: 'Buscar edificios, aulas, servicios...', debounce: 300, width: '480px' });

const query = ref('');
const results = ref<any[]>([]);
const loading = ref(false);
const open = ref(false);
const selectedIndex = ref(-1);

const app = useAppStore();
const { openObjeto } = useObjetos();

let timer: any = null;

watch(query, (q) => {
  open.value = !!q;
  if (timer) clearTimeout(timer);
  if (!q) {
    results.value = [];
    loading.value = false;
    return;
  }
  loading.value = true;
  timer = setTimeout(async () => {
    try {
      const campus = app.campusId ?? '';
      const resp = await (trpc as any).busqueda.buscar.query({ query: q, campus });
      results.value = resp ?? [];
    } catch (e) {
      console.debug('[SearchField] busca error', e);
      results.value = [];
    } finally {
      loading.value = false;
      selectedIndex.value = -1;
    }
  }, props.debounce);
});

function choose(item: any) {
  // If it's an objeto, open object; else open swipeable with item
  try {
    if (item.tipo === 'objeto') {
      openObjeto(String(item._id));
    } else {
      // open swipeable generic
      app.abrirSwipeable('objetos', item);
    }
  } catch (e) {
    console.debug('[SearchField] choose error', e);
  }
  // close dropdown
  open.value = false;
  query.value = '';
}

function onKey(e: KeyboardEvent) {
  if (!open.value) return;
  if (e.key === 'ArrowDown') {
    selectedIndex.value = Math.min(selectedIndex.value + 1, results.value.length - 1);
    e.preventDefault();
  } else if (e.key === 'ArrowUp') {
    selectedIndex.value = Math.max(selectedIndex.value - 1, 0);
    e.preventDefault();
  } else if (e.key === 'Enter') {
    if (selectedIndex.value >= 0 && results.value[selectedIndex.value]) {
      choose(results.value[selectedIndex.value]);
    }
    e.preventDefault();
  } else if (e.key === 'Escape') {
    open.value = false;
  }
}

onMounted(() => {
  // nothing
});
</script>

<template>
  <div :style="{ position: 'relative', width: props.width, maxWidth: '90vw' }">
    <input id="searchField" :placeholder="props.placeholder" v-model="query" @keydown="onKey" style="width:100%; padding:8px 12px; border-radius:8px; border:1px solid #ccc;" />
    <div v-if="open && (results.length || loading)" 
    style="position:absolute; 
    left:0; right:0; top:40px; 
    background:#fff; 
    border:1px solid #eee; 
    box-shadow:0 8px 24px rgba(0,0,0,0.08); 
    max-height:320px; 
    overflow:auto; 
    z-index:1200; 
    border-radius:8px;">
      <div v-if="loading" style="padding:12px; color:#666">Buscando…</div>
      <template v-else>
        <div v-if="!results.length" style="padding:12px; color:#666">No se encontraron resultados</div>
        <ul style="list-style:none; margin:0; padding:8px; display:flex; flex-direction:column; gap:6px;">
          <li v-for="(r,i) in results" :key="r._id + '-' + i" @click="choose(r)" :style="{ padding: '8px', borderRadius: '6px', cursor: 'pointer', background: i===selectedIndex ? '#f0f6ff' : 'transparent' }">
            <div style="font-weight:600">{{ r.nombre }}</div>
            <div style="font-size:12px; color:#666">{{ r.agrupador }} • {{ r.tipo }}</div>
          </li>
        </ul>
      </template>
    </div>
  </div>
</template>

<style scoped>
</style>
