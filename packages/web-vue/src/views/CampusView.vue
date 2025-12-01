<template>
  <div class="campus-bg">
    <div class="campus-card">
      <div class="card-main">
        <h1 class="page-title">Campus</h1>

        <form @submit.prevent="onSubmit" class="campus-form">
      <section class="section">
        <h2>Datos generales</h2>
        <label>
          Nombre
          <input v-model="form.nombre" name="nombre" />
        </label>
        <label>
          Clave
          <input v-model="form.clave" name="clave" />
        </label>
        <label>
          Descripción
          <textarea v-model="form.descripcion" name="descripcion" rows="3" />
        </label>
      </section>

      <section class="section">
        <h2>Detalles del sitio</h2>
        <label>
          Subdominio
          <input v-model="form.subdominio" name="subdominio" />
        </label>
        <label>
          URL
          <input :value="computedUrl" readonly />
        </label>
      </section>

      <section class="section">
        <h2>Detalles de la institución</h2>
        <label>
          Dirección
          <input v-model="form.direccion" name="direccion" />
        </label>
        <label>
          Teléfono
          <input v-model="form.telefono" name="telefono" />
        </label>
        <label>
          Correo electrónico
          <input v-model="form.email" name="email" />
        </label>
        <label>
          Sitio web
          <input v-model="form.web" name="web" />
        </label>
      </section>

      <section class="section">
        <h2>Detalles geográficos</h2>
        <label>
          Archivo GeoJSON
          <input type="file" @change="onFileChange" accept="application/json,.geojson" />
        </label>
        <div v-if="geojsonName">Archivo seleccionado: {{ geojsonName }}</div>
        <div class="map-placeholder">Mapa (placeholder)</div>
      </section>

      <div class="actions">
        <button type="submit" class="btn primary">Guardar</button>
        <button type="button" class="btn" @click="onBack">Regresar</button>
      </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const VITE_DOMINIO = import.meta.env.VITE_DOMINIO || '';

const form = reactive({
  nombre: '',
  clave: '',
  descripcion: '',
  subdominio: '',
  direccion: '',
  telefono: '',
  email: '',
  web: '',
});

const geojsonName = ref<string | null>(null);

const computedUrl = computed(() => {
  return form.subdominio ? `https://${form.subdominio}.${VITE_DOMINIO}` : '';
});

function onCampusClick() {
  /*console.log('Campus button clicked');*/
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files && input.files[0];
  if (file) {
    geojsonName.value = file.name;
  } else {
    geojsonName.value = null;
  }
}

function onBack() {
  router.back();
}

function onSubmit() {
  console.log('Guardar payload:', { ...form });
  alert('Guardado (simulado)');
}
</script>

<style scoped>

.campus-form label {
  color: #143A57; /* azul grisáceo oscuro, combina con tu tema */
  font-weight: 500;
}

.auth-bg{
  position:fixed;
  inset:0;
  display:flex;
  align-items:center;
  justify-content:center;
  background: radial-gradient(circle at center, rgba(248,193,119,0.28), rgba(241,128,37,0.08) 40%, rgba(21,82,132,0.04) 80%), #f6f9fb;
  background-size:cover;
  z-index:0;
}
.campus-card{
  width: 900px;
  max-width: calc(100% - 32px);
  background: rgba(255,255,255,0.98);
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(15,23,42,0.08);
}
.card-main{ padding: 12px 18px; }
.page-title{ font-size:26px; color:#143A57; margin:6px 0 12px 0; text-align:left }
.campus-form{ display:block; }
.section { border: none; padding: 16px; margin-bottom: 16px; border-radius: 8px; background: #fafafa; box-shadow: 0 1px 2px rgba(15,23,42,0.03) }
.section h2 { margin: 0 0 12px 0; color: #1976d2; font-size:16px }
.campus-form label { display: block; margin-bottom: 12px; }
.campus-form input, .campus-form textarea { width: 100%; padding: 12px; margin-top: 6px; box-sizing: border-box; border-radius:8px; border:1px solid #e6eef6; background:#fff }
.map-placeholder { height: 320px; background: #f6f6f6; border: 1px dashed #ddd; display:flex; align-items:center; justify-content:center; color:#666; margin-top:8px; border-radius:8px }
.actions { display:flex; gap:12px; margin-top:18px }
.btn{ padding:10px 14px; border-radius:8px; border:1px solid transparent; background:transparent; cursor:pointer }
.btn.primary{ background: linear-gradient(180deg,#f59d3c,#e86b1d); color:white; border:none }

@media (max-width: 700px){
  .campus-card{ width: 100%; }
  .page-title{ text-align:center }
}
</style>
