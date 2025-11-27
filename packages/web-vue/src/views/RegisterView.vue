<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { trpc } from '@/lib/trpc';
import { useAppStore } from '@/stores/app';
import { registerSchema, zodErrorsToMap } from '@/utils/validators';

const router = useRouter();
const app = useAppStore();

const username = ref('');
const password = ref('');
const nombres = ref('');
const apellidos = ref('');
const correo = ref('');
const tipoUsuario = ref('ALUMNO');

const loading = ref(false);
const error = ref('');
const fieldErrors = reactive({ username: '', password: '', nombres: '', apellidos: '', correo: '' });

async function submit() {
  error.value = '';
  loading.value = true;
  // reset field errors
  Object.keys(fieldErrors).forEach((k) => (fieldErrors[k as keyof typeof fieldErrors] = ''));
  try {
    const payload: any = {
      username: username.value,
      password: password.value,
      nombres: nombres.value,
      apellidos: apellidos.value,
      correo: correo.value || undefined,
      tipoUsuario: tipoUsuario.value,
    };

    // validate with Zod
    const parsed = registerSchema.safeParse(payload);
    if (!parsed.success) {
      const map = zodErrorsToMap(parsed.error);
      fieldErrors.username = map.username || '';
      fieldErrors.password = map.password || '';
      fieldErrors.nombres = map.nombres || '';
      fieldErrors.apellidos = map.apellidos || '';
      fieldErrors.correo = map.correo || '';
      throw new Error('Corrige los campos marcados.');
    }
    // obtener campus según subdominio (el middleware devolverá DEV_SUB_DOMAIN en dev)
    let campusId: string | undefined = undefined;
    try {
      const campus = await (trpc as any).campus.obtenerPorSubdominio.query({});
      campusId = campus?._id;
    } catch (err) {
      // si no existe campus, dejamos campusId undefined y el back-end puede rechazar o aceptar según configuración
      console.warn('No se pudo obtener campus por subdominio', err);
    }

    if (campusId) parsed.success && (parsed.data.campus = campusId);

    // uso any para evitar problemas de tipado del cliente trpc en este ejemplo
    await (trpc as any).usuarios.guardar.mutate(parsed.success ? parsed.data : payload);

    app.pushAlert({ type: 'success', message: 'Usuario creado. Inicia sesión.' });
    router.push('/login');
  } catch (e:any) {
    error.value = e?.message ?? 'Error creando usuario';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="auth-bg">
    <div class="auth-card">
      <div class="card-decor" aria-hidden="true"></div>

      <div class="card-main">
        <div class="logo-wrap">
          <img src="/logo.png" alt="UniMap" class="logo-img" />
        </div>

        <h2 class="title">Registro</h2>
        <p class="subtitle">Crea una cuenta</p>

        <form class="form" @submit.prevent="submit" novalidate>
          <input class="input" placeholder="Usuario" v-model="username" />
          <div v-if="fieldErrors.username" class="field-error">{{ fieldErrors.username }}</div>
          <input class="input" placeholder="Contraseña" v-model="password" type="password" />
          <div v-if="fieldErrors.password" class="field-error">{{ fieldErrors.password }}</div>
          <input class="input" placeholder="Nombres" v-model="nombres" />
          <div v-if="fieldErrors.nombres" class="field-error">{{ fieldErrors.nombres }}</div>
          <input class="input" placeholder="Apellidos" v-model="apellidos" />
          <div v-if="fieldErrors.apellidos" class="field-error">{{ fieldErrors.apellidos }}</div>
          <input class="input" placeholder="Correo electrónico" v-model="correo" type="email" />
          <div v-if="fieldErrors.correo" class="field-error">{{ fieldErrors.correo }}</div>

          <select class="input" v-model="tipoUsuario">
            <option value="ALUMNO">Alumno</option>
            <option value="PROFESOR">Profesor</option>
            <option value="VISITANTE">Visitante</option>
          </select>

          <button class="btn" type="submit" :disabled="loading">{{ loading ? 'Creando...' : 'Crear cuenta' }}</button>

          <div v-if="error" class="error">{{ error }}</div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-bg{
  /* Ocupa todo el viewport para evitar huecos en blanco */
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
.field-error{ margin-top:4px; color:#b00020; font-size:13px; text-align:left }
.links{ margin-top:14px; display:flex; justify-content:space-between; font-size:13px; color:#4b6b7a }
.links a{ color:#2b6f99; text-decoration:none }
</style>

<style scoped>
/* reuse same responsive rules as login */
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
</style>
