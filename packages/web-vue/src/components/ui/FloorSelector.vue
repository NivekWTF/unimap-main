<script setup lang="ts">
import { computed } from 'vue';
import { useAppStore } from '@/stores/app';

const app = useAppStore();

const objetoSeleccionado = computed(() => app.objetoSeleccionado);
const pisoSeleccionado = computed({
  get: () => app.pisoSeleccionado ?? 1,
  set: (v: number) => app.setPisoSeleccionado(v),
});

const numeroPisos = computed(() => (objetoSeleccionado.value?.pisos ?? 1));

function handleChange(piso: number) {
  app.setPisoSeleccionado(piso);
}
</script>

<template>
  <div v-if="numeroPisos > 1" style="display:flex;align-items:center;">
    <div style="background:white;padding:6px;border-radius:6px;box-shadow:0 1px 6px rgba(0,0,0,0.08);">
      <div style="display:flex;flex-direction:row;gap:6px;align-items:center;">
        <label v-for="p in Array.from({length: numeroPisos}, (_,i)=>i+1)" :key="p" style="display:inline-flex;align-items:center;">
          <input type="radio" :value="p" v-model.number="pisoSeleccionado" @change.prevent="handleChange(p)" />
          <span style="margin-left:6px;">Piso {{ p }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<style scoped>
input[type="radio"] {
  accent-color: #1976d2;
}
</style>
