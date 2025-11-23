<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useAppStore } from '@/stores/app';

const app = useAppStore();
const { alerts } = storeToRefs(app);
</script>

<template>
  <div style="position:fixed; left:16px; bottom:16px; display:flex; flex-direction:column; gap:8px; z-index:1000;">
    <div v-for="a in alerts" :key="a.id"
      :style="{
        background: a.type==='error'?'#ffebee':a.type==='warning'?'#fff8e1':'#e8f5e9',
        border: '1px solid rgba(0,0,0,.1)', padding:'10px 12px', borderRadius:'8px',
        minWidth:'260px', boxShadow:'0 2px 8px rgba(0,0,0,.12)'}">
      <strong style="margin-right:6px;">{{ a.type?.toUpperCase() ?? 'INFO' }}:</strong>{{ a.message }}
    </div>
  </div>
</template>
