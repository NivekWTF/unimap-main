<script setup lang="ts">
import { computed } from 'vue';
import { useAppStore } from '@/stores/app';

const app = useAppStore();
const selectedFeature = computed(() => app.selectedFeature as any | null);
const objetoSeleccionado = computed(() => app.objetoSeleccionado as any | null);

function close(){
  // Use the centralized close action so side-effects (like map reset) run
  try {
    app.cerrarSwipeable();
  } catch (e) {
    console.debug('[Sidebar] cerrarSwipeable error', e);
    app.selectFeature(null);
    app.setObjetoSeleccionado(null);
  }
}

function formatCategoria(cat: any) {
  if (!cat) return null;
  return {
    nombre: cat.nombre ?? cat.name ?? String(cat._id ?? cat),
    color: cat.color ?? '#1572A1',
    icono: cat.icono ?? cat.icono ?? ''
  };
}

function verMas() {
  // placeholder for future detailed view navigation
  app.pushAlert({ message: 'Ver más (pendiente)', type: 'success' });
}

function share() {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(typeof window !== 'undefined' ? window.location.href : '');
      app.pushAlert({ message: 'Enlace copiado al portapapeles', type: 'success' });
    } else {
      app.pushAlert({ message: 'Portapapeles no disponible', type: 'warning' });
    }
  } catch (e) {
    console.debug('[Sidebar] share error', e);
    app.pushAlert({ message: 'No se pudo copiar el enlace', type: 'error' });
  }
}
</script>

<template>
  <aside v-if="selectedFeature || objetoSeleccionado" class="unimap-sidebar">
    <div class="unimap-sidebar__header">
      <div>
        <h3 style="margin:0; font-size:18px;">{{ objetoSeleccionado?.nombre ?? (selectedFeature?.properties?.nombre ?? selectedFeature?.properties?.name ?? 'Detalle') }}</h3>
        <div style="margin-top:6px; display:flex; gap:8px; align-items:center;">
          <template v-if="(objetoSeleccionado && objetoSeleccionado.categoria) || (selectedFeature && selectedFeature.properties && selectedFeature.properties.categoria)">
            <span :style="{ background: (objetoSeleccionado ? (objetoSeleccionado.categoria?.color ?? '#ddd') : (selectedFeature.properties.categoria?.color ?? '#ddd')), color: '#fff', padding: '4px 8px', borderRadius: '6px', fontSize: '12px' }">
              {{ (objetoSeleccionado ? (objetoSeleccionado.categoria?.nombre ?? objetoSeleccionado.categoria) : (selectedFeature.properties.categoria?.nombre ?? selectedFeature.properties.categoria)) }}
            </span>
          </template>
          <small style="color:#666">ID: {{ objetoSeleccionado?._id ?? selectedFeature?.properties?._id ?? selectedFeature?.properties?.id ?? '—' }}</small>
        </div>
      </div>
      <button @click="close" class="unimap-sidebar__close" aria-label="Cerrar">✕</button>
    </div>

    <!-- Imagen principal -->
    <div v-if="objetoSeleccionado && objetoSeleccionado.urlImagenes && objetoSeleccionado.urlImagenes.length" style="margin-bottom:12px;">
      <img :src="objetoSeleccionado.urlImagenes[0]" alt="imagen" style="width:100%; height:160px; object-fit:cover; border-radius:8px;" />
    </div>

    <!-- Si solo tenemos selectedFeature (raw), mostrar sus propiedades clave -->
    <div v-if="!objetoSeleccionado && selectedFeature">
      <p style="color:#444; margin:0 0 8px 0;"><strong>Propiedades</strong></p>
      <ul style="padding-left:18px; margin-top:6px; color:#333">
        <li v-for="(v,k) in selectedFeature.properties" :key="k"><strong>{{ k }}:</strong> {{ typeof v === 'object' ? JSON.stringify(v) : String(v) }}</li>
      </ul>
    </div>

    <!-- Vista enriquecida del objeto seleccionado -->
    <div v-else-if="objetoSeleccionado">
      <p style="color:#444; margin:0 0 8px 0;"><strong>Descripción</strong></p>
      <p style="color:#333; margin-top:6px; white-space:pre-wrap;">{{ objetoSeleccionado.descripcion ?? 'Sin descripción disponible.' }}</p>

      <div style="display:flex; gap:12px; margin-top:12px;">
        <div style="flex:1">
          <p style="margin:0 0 6px 0; color:#444;"><strong>Pisos</strong></p>
          <p style="margin:0; color:#333;">{{ objetoSeleccionado.pisos ?? objetoSeleccionado.pertenecePiso ?? '—' }}</p>
        </div>
        <div style="flex:1">
          <p style="margin:0 0 6px 0; color:#444;"><strong>Tipo</strong></p>
          <p style="margin:0; color:#333;">{{ (objetoSeleccionado.categoria?.nombre ?? objetoSeleccionado.categoria) ?? '—' }}</p>
        </div>
      </div>

      <div v-if="objetoSeleccionado.servicios && objetoSeleccionado.servicios.length" style="margin-top:12px;">
        <p style="margin:0 0 6px 0; color:#444;"><strong>Servicios</strong></p>
        <ul style="padding-left:18px; margin-top:6px; color:#333">
          <li v-for="(s,i) in objetoSeleccionado.servicios" :key="i">{{ s }}</li>
        </ul>
      </div>

      <div style="margin-top:14px; display:flex; gap:8px;">
        <button @click.prevent="verMas" style="padding:8px 12px; background:#1976D2; color:#fff; border:none; border-radius:6px; cursor:pointer">Ver más</button>
        <button @click.prevent="share" style="padding:8px 12px; background:#eee; border:none; border-radius:6px; cursor:pointer">Compartir</button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.unimap-sidebar{
  position: fixed;
  right: 0;
  top: 0;
  height: 100%;
  width: 360px;
  background: #fff;
  box-shadow: -2px 0 14px rgba(0,0,0,.18);
  padding: 16px;
  overflow: auto;
  z-index: 9999; /* above leaflet controls */
  -webkit-overflow-scrolling: touch;
}
.unimap-sidebar__header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:8px;
  gap:12px;
}
.unimap-sidebar__close{
  background:transparent;
  border:none;
  font-size:22px;
  line-height:1;
  cursor:pointer;
  padding:8px;
  border-radius:6px;
}
.unimap-sidebar__close:active{ transform:scale(0.98); }

/* Responsive: on small screens make sidebar full width and overlay content */
@media (max-width: 640px){
  .unimap-sidebar{ width: 100%; }
}

</style>
