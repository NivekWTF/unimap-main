<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useAppStore } from '@/stores/app';

const app = useAppStore();
const { selectedFeature } = storeToRefs(app);

function close(){ app.selectFeature(null); }
</script>

<template>
  <aside v-if="selectedFeature" style="position:absolute; right:0; top:0; height:100%; width:340px; background:#fff; box-shadow:-2px 0 10px rgba(0,0,0,.15); padding:16px; overflow:auto; z-index:500;">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
      <h3 style="margin:0;">Detalle</h3>
      <button @click="close">✕</button>
    </div>
    <pre style="white-space:pre-wrap; word-break:break-word;">{{ JSON.stringify(selectedFeature.properties, null, 2) }}</pre>
  </aside>
</template>
