<template>
  <div class="auth-bg">
    <div class="auth-card">
      <div class="card-decor" aria-hidden="true"></div>

      <div class="card-main">
        <div class="logo-wrap">
          <img src="/logo.png" alt="UniMap" class="logo-img" />
        </div>

        <h2 class="title">Admin</h2>
        <p class="subtitle">Panel de administración</p>

        <div class="admin-layout">
          <aside class="admin-sidebar">
            <button :class="{active: activeSection==='import'}" @click="activeSection='import'"><i class="icon-cloud"></i> Importar Datos</button>
            <button :class="{active: activeSection==='campus'}" @click="activeSection='campus'" @click.prevent="goToCampus"><i class="icon-campus"></i> Campus</button>
            <button :class="{active: activeSection==='alumnos'}" @click="activeSection='alumnos'"><i class="icon-student"></i> Alumnos</button>
            <button :class="{active: activeSection==='edificios'}" @click="activeSection='edificios'"><i class="icon-building"></i> Edificios</button>
            <button :class="{active: activeSection==='aulas'}" @click="activeSection='aulas'"><i class="icon-classroom"></i> Aulas</button>
            <button :class="{active: activeSection==='laboratorios'}" @click="activeSection='laboratorios'"><i class="icon-lab"></i> Laboratorios</button>
            <button :class="{active: activeSection==='administracion'}" @click="activeSection='administracion'"><i class="icon-admin"></i> Administración</button>
            <button :class="{active: activeSection==='sanitarios'}" @click="activeSection='sanitarios'"><i class="icon-wc"></i> Sanitarios</button>
            <button :class="{active: activeSection==='bibliotecas'}" @click="activeSection='bibliotecas'"><i class="icon-library"></i> Bibliotecas</button>
            <button :class="{active: activeSection==='deporte'}" @click="activeSection='deporte'"><i class="icon-sport"></i> Zonas Deportivas</button>
          </aside>

          <section class="admin-content">
            <div v-if="activeSection==='import'" class="import-panel">
              <h2>Importar objetos GeoJSON</h2>
              <p>Sube aquí tus archivos GeoJSON</p>

              <label class="file-input">
                Seleccionar archivos
                <input type="file" accept="application/json,.geojson" multiple @change="onFilesSelected" />
              </label>

              <div class="file-list">
                <div v-for="(f, i) in files" :key="i" class="file-item">
                  <div class="name">{{ f.name }}</div>
                  <div class="actions">
                    <button @click="removeFile(i)">Eliminar</button>
                    <button v-if="errors[i]" @click="viewErrors(i)">Ver errores</button>
                  </div>
                </div>
              </div>

              <label>
                Seleccionar campus
                <select v-model="selectedCampus">
                  <option value="">-- Selecciona --</option>
                  <option v-for="c in campusList" :key="c._id" :value="String(c._id)">{{ c.nombre }}</option>
                </select>
              </label>
              <div style="margin-top:8px; font-size:13px; color:#556">
                <span v-if="campusLoading">Cargando campus…</span>
                <span v-else-if="campusLoadError">Error cargando campus: {{ campusLoadError }} <button @click="loadCampusList">Reintentar</button></span>
                <span v-else-if="!campusList.length">No hay campus disponibles. Puedes crear uno en la sección Campus.</span>
              </div>

              <div class="modal-actions">
                <button :disabled="!files.length || !selectedCampus || loading" @click="importar">Importar</button>
                <button @click="clearImport">Cancelar</button>
              </div>

              <div v-if="loading">Importando...</div>
              <div v-if="serverError" class="error">{{ serverError }}</div>
            </div>

            <!-- error drawer -->
            <div v-if="showErrorIndex !== null" class="error-drawer">
              <h3>Errores en archivo: {{ files[showErrorIndex!]?.name }}</h3>
              <ul>
                <li v-for="(e, idx) in errors[showErrorIndex!]" :key="idx">{{ e }}</li>
              </ul>
              <div class="modal-actions">
                <button @click="showErrorIndex = null">Cerrar</button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { useAppStore } from '@/stores/app';
import { trpc } from '@/lib/trpc';
import { useRouter } from 'vue-router';

const showImport = ref(false);
const activeSection = ref('import');
const app = useAppStore();
const router = useRouter();
const files = ref<File[]>([]);
const parsedGeoJsons = ref<any[]>([]);
const errors = reactive<Record<number, string[]>>({});
const showErrorIndex = ref<number | null>(null);
const campusList = ref<any[]>([]);
const campusLoading = ref(false);
const campusLoadError = ref<string | null>(null);
const selectedCampus = ref<string>('');
const loading = ref(false);
const serverError = ref<string | null>(null);

function onImportClick() {
  activeSection.value = 'import';
}

function goToCampus() {
  router.push('/admin/campus');
}

function clearImport() {
  // Clear import form fields
  files.value = [];
  parsedGeoJsons.value = [];
  Object.keys(errors).forEach((k) => delete errors[Number(k)]);
  selectedCampus.value = '';
  serverError.value = null;
}

function onFilesSelected(e: Event) {
  const input = e.target as HTMLInputElement;
  const list = input.files ? Array.from(input.files) : [];
  files.value = list;
  // reset parsed and errors
  parsedGeoJsons.value = [];
  Object.keys(errors).forEach((k) => delete errors[Number(k)]);
}

function removeFile(index: number) {
  files.value.splice(index, 1);
  parsedGeoJsons.value.splice(index, 1);
  delete errors[index];
}

function viewErrors(index: number) {
  showErrorIndex.value = index;
}

async function importar() {
  serverError.value = null;
  loading.value = true;

  const parsed: any[] = [];

  await Promise.all(
    files.value.map(async (f, i) => {
      try {
        const text = await f.text();
        const json = JSON.parse(text);
        // Minimal validation: must be an object with features array
        if (!json || !Array.isArray(json.features) && !Array.isArray(json)) {
          errors[i] = ['Archivo no válido: no contiene una estructura GeoJSON esperada'];
          return;
        }
        parsed.push(json);
      } catch (err: any) {
        errors[i] = [err.message || 'Error al parsear JSON'];
      }
    })
  );

  if (Object.keys(errors).length) {
    loading.value = false;
    return;
  }

  // call trpc mutation
  try {
    await (trpc as any).importarObjetos.importar.mutate({ campus: selectedCampus.value, geoJson: parsed });
    alert('Importación exitosa');
    clearImport();
  } catch (err: any) {
    serverError.value = err?.message || String(err);
  } finally {
    loading.value = false;
  }
}

async function loadCampusList() {
  campusLoading.value = true;
  campusLoadError.value = null;
  try {
    const resp = await (trpc as any).campus.obtener.query();
    campusList.value = resp || [];
  } catch (err: any) {
    campusList.value = [];
    campusLoadError.value = err?.message ?? String(err);
    console.warn('No se pudieron cargar campus', err);
  } finally {
    campusLoading.value = false;
  }
}

onMounted(() => {
  // Require an authenticated session for admin pages
  const token = app.token || localStorage.getItem('token') || localStorage.getItem('UNIMAP_TOKEN') || '';
  if (!token) {
    // If no token, redirect to login to obtain credentials
    router.push('/login');
    return;
  }
  loadCampusList();
});

// reload campuses when user switches to import section
watch(activeSection, (v) => {
  if (v === 'import') loadCampusList();
});
</script>

<style scoped>
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
.auth-card{
  width:420px;
  background: rgba(255,255,255,0.98);
  border-radius:14px;
  padding:34px 32px 26px 32px;
  box-shadow: 0 10px 30px rgba(15,23,42,0.12);
  position:relative;
  text-align:center;
}
.logo-wrap{ position:absolute; left:50%; transform:translateX(-50%); top:-48px; width:96px; height:96px; background:linear-gradient(180deg,#fff,#fff); border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 8px 20px rgba(15,23,42,0.12);} 
.logo-img{ width:64px; height:64px; }
.title{ margin-top:28px; margin-bottom:6px; color:#143A57; font-size:20px; }
.subtitle{ margin:0 0 18px 0; color:#6b7c86; font-size:13px }
.form{ display:flex; flex-direction:column; gap:12px }
.input{ padding:12px 14px; border-radius:8px; border:1px solid #e6eef6; background:#fff; font-size:14px }
.btn{ margin-top:6px; padding:10px 14px; border-radius:8px; border:none; background:linear-gradient(180deg,#f59d3c,#e86b1d); color:white; font-weight:600; cursor:pointer }
.btn:disabled{ opacity:.6; cursor:default }
.error{ margin-top:8px; color:#b00020; font-size:13px; text-align:left }
.links{ margin-top:14px; display:flex; justify-content:space-between; font-size:13px; color:#4b6b7a }
.links a{ color:#2b6f99; text-decoration:none }

/* Admin-specific */
.card-main{ padding:24px 20px; display:flex; flex-direction:column; align-items:center }
.buttons.card{ background:#fff; padding:12px; border-radius:8px; width:100%; margin-top:12px; box-shadow:0 4px 10px rgba(15,23,42,0.04) }
.buttons.card .primary{ padding:10px 16px; border-radius:8px; background:linear-gradient(180deg,#f59d3c,#e86b1d); color:#fff; border:none; cursor:pointer }

/* modal */
.modal-overlay { position: fixed; inset: 0; display:flex; align-items:center; justify-content:center; background: rgba(0,0,0,0.4) }
.modal { background: white; padding: 16px; border-radius: 6px; width: 560px; max-width: calc(100% - 32px) }
.file-list { margin-top: 8px; max-height: 160px; overflow:auto }
.file-item { display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid #eee }
.modal-actions { display:flex; gap:8px; margin-top:12px }
.error { color: #b00020; margin-top:8px }
.modal {
  color: #143A57; /* color base para el texto */
}

.modal h2 {
  color: #143A57;
  font-weight: 600;
}

.modal p,
.modal label,
.modal select,
.modal option,
.modal .file-item .name {
  color: #4b6b7a; /* gris azulado, buen contraste */
}

/* responsive layout: show decorative column on wider screens */
@media (min-width: 900px) {
  .auth-card{
    width:900px;
    display:grid;
    grid-template-columns: 1fr 1fr;
    overflow:hidden;
  }
  .card-decor{ display:block; }
  .card-decor{
    background: linear-gradient(180deg, rgba(245,157,60,0.12), rgba(232,107,29,0.06));
    background-image: url('/logo.png');
    background-repeat: no-repeat;
    background-position: center;
    background-size: 220px 220px;
    min-height:320px;
  }
  .card-main{ padding:48px 40px; display:flex; flex-direction:column; justify-content:center; }
  .logo-wrap{ position:static; margin:0 auto 12px auto; top:unset; transform:none }
}

@media (max-width: 479px){
  .auth-card{ width:94%; padding:20px; }
  .logo-wrap{ width:72px; height:72px; top:-36px }
  .logo-img{ width:48px; height:48px }
}

.footer-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid rgba(0,0,0,0.05);
}

.footer-buttons button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1px solid #e6eef6;
  border-radius: 10px;
  padding: 10px 16px;
  font-size: 13px;
  color: #143A57;
  box-shadow: 0 2px 6px rgba(15,23,42,0.08);
  cursor: pointer;
  transition: all 0.2s ease;
}

.footer-buttons button:hover {
  background: linear-gradient(180deg,#f59d3c,#e86b1d);
  color: #fff;
  transform: translateY(-2px);
}

/* Admin layout styles */
.admin-layout{ display:flex; gap:18px; align-items:flex-start; width:100% }
.admin-sidebar{ width:220px; background:#fff; border-radius:10px; padding:12px; box-shadow:0 6px 20px rgba(15,23,42,0.06); display:flex; flex-direction:column; gap:8px }
.admin-sidebar button{ display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:8px; border:none; background:transparent; text-align:left; cursor:pointer; color:#143A57 }
.admin-sidebar button.active{ background:linear-gradient(180deg,#f59d3c,#e86b1d); color:#fff }
.admin-content{ flex:1; background:#fff; border-radius:10px; padding:18px; box-shadow:0 6px 20px rgba(15,23,42,0.04) }
.import-panel h2{ margin-top:0 }
.error-drawer{ margin-top:12px; background:#fff7f7; border:1px solid #f5c6cb; padding:12px; border-radius:8px }

</style>
