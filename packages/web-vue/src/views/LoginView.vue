<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { trpc } from '@/lib/trpc';
import { useAppStore } from '@/stores/app';
import { loginSchema, zodErrorsToMap } from '@/utils/validators';

const router = useRouter();
const app = useAppStore();

const username = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

// field-level errors for inputs
const errors = reactive<{ username: string; password: string }>({
  username: '',
  password: '',
});

async function submit() {
  // clear server error
  error.value = '';
  // validate with Zod
  errors.username = '';
  errors.password = '';
  const parsed = loginSchema.safeParse({ username: username.value, password: password.value });
  if (!parsed.success) {
    const map = zodErrorsToMap(parsed.error);
    errors.username = map.username || '';
    errors.password = map.password || '';
    error.value = 'Corrige los campos marcados.';
    return;
  }

  loading.value = true;
  try {
    // trpc client is untyped here; cast to any to avoid TS complaints in this small example
    const res = await (trpc as any).sesiones.loginCliente.mutate({ username: username.value, password: password.value });
    const { token, usuario } = res as any;
    // store token in both keys to be compatible with existing helpers
    localStorage.setItem('token', token);
    localStorage.setItem('UNIMAP_TOKEN', token);
    app.setUser(usuario ? { id: usuario._id ?? usuario.id ?? usuario.username, name: usuario.nombres ?? 
        usuario.name ?? usuario.username } : null, token);
    router.push('/');
  } catch (e:any) {
    error.value = e?.message ?? 'Error iniciando sesión';
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
          <!-- use favicon as a simple logo placeholder -->
          <img src="/logo.png" alt="UniMap" class="logo-img" />
        </div>

        <h2 class="title">Iniciar sesión</h2>
        <p class="subtitle">Ingresa tus credenciales</p>

        <form class="form" @submit.prevent="submit">
          <input class="input" placeholder="Usuario" v-model="username" />
          <div v-if="errors.username" class="field-error">{{ errors.username }}</div>

          <input class="input" placeholder="Contraseña" v-model="password" type="password" />
          <div v-if="errors.password" class="field-error">{{ errors.password }}</div>

          <button class="btn" type="submit" :disabled="loading">{{ loading ? 'Iniciando...' : 'Entrar' }}</button>

          <div v-if="error" class="error">{{ error }}</div>
        </form>

        <div class="links">
          <a href="#/Recuperar-password">Olvidé mi contraseña</a>
          <a href="#/register">Crear una cuenta</a>
        </div>
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
</style>
