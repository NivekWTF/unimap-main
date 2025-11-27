<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { trpc } from '@/lib/trpc';

const router = useRouter();
const correo = ref('');
const submitted = ref(false);
const error = ref('');
const loading = ref(false);

async function submit() {
  error.value = '';
  if (!correo.value || correo.value.trim() === '') {
    error.value = 'Campo necesario.';
    return;
  }
  // validación básica de correo
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(correo.value)) {
    error.value = 'Ingrese un correo válido. Ejemplo=HolaMundo@HolaMundo.com';
    return;
  }

  loading.value = true;
  try {
    // call backend trpc to send simple recovery email
    await (trpc as any).usuarios.enviarRecuperacion.mutate({ correo: correo.value });
    submitted.value = true;
  } catch (e:any) {
    error.value = e?.message ?? 'Error enviando correo';
  } finally {
    loading.value = false;
  }
}

function backToLogin() {
  router.push('/login');
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

        <h2 class="title">Recuperar contraseña</h2>
        <p class="subtitle">Ingrese su correo para recibir instrucciones</p>

        <form class="form" @submit.prevent="submit">
          <input
            class="input"
            placeholder="Por favor ingrese su correo"
            v-model="correo"
          />
          <div v-if="error" class="field-error">{{ error }}</div>

          <template v-if="!submitted">
            <div class="buttons-row">
              <button class="btn" type="submit">Enviar</button>
              <button class="btn secondary" type="button" @click="backToLogin">
                Volver
              </button>
            </div>
          </template>

          <template v-else>
            <div class="success-msg">
              Hemos enviado un correo para su recuperación
            </div>
            <div class="buttons-row">
              <button class="btn" type="button" @click="backToLogin">
                Ir a Iniciar sesión
              </button>
            </div>
          </template>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Fondo: si quieres que sea igual que el login, usa el degradado.
   Si prefieres todo blanco, deja background:#ffffff; */
.auth-bg{
  position:fixed;
  inset:0;
  display:flex;
  align-items:center;
  justify-content:center;
  background: radial-gradient(
      circle at center,
      rgba(248,193,119,0.28),
      rgba(241,128,37,0.08) 40%,
      rgba(21,82,132,0.04) 80%
    ),
    #f6f9fb;
  background-size:cover;
  z-index:0;
}

/* === MISMO RECUDRO QUE EL LOGIN === */
.auth-card{
  width:420px;
  background: rgba(255,255,255,0.98);
  border-radius:14px;
  padding:34px 32px 26px 32px;
  box-shadow: 0 10px 30px rgba(15,23,42,0.12);
  position:relative;
  text-align:center;
}

.logo-wrap{
  position:absolute;
  left:50%;
  transform:translateX(-50%);
  top:-48px;
  width:96px;
  height:96px;
  background:linear-gradient(180deg,#fff,#fff);
  border-radius:50%;
  display:flex;
  align-items:center;
  justify-content:center;
  box-shadow:0 8px 20px rgba(15,23,42,0.12);
}
.logo-img{ width:64px; height:64px; }

.title{
  margin-top:28px;
  margin-bottom:6px;
  color:#143A57;
  font-size:20px;
}
.subtitle{
  margin:0 0 18px 0;
  color:#6b7c86;
  font-size:13px;
}

.form{
  display:flex;
  flex-direction:column;
  gap:12px;
}

.input{
  padding:12px 14px;
  border-radius:8px;
  border:1px solid #e6eef6;
  background:#fff;
  font-size:14px;
}

.btn{
  margin-top:6px;
  padding:10px 14px;
  border-radius:8px;
  border:none;
  background:linear-gradient(180deg,#f59d3c,#e86b1d);
  color:white;
  font-weight:600;
  cursor:pointer;
}
.btn.secondary{
  background: linear-gradient(180deg,#2e7d32,#1b5e20);
  color:#ffffff;
}
.btn:disabled{
  opacity:.6;
  cursor:default;
}

.buttons-row{
  margin-top:10px;
  display:flex;
  gap:8px;
  justify-content:center;
}

.field-error{
  margin-top:4px;
  color:#b00020;
  font-size:13px;
  text-align:left;
}
.success-msg{
  margin-top:12px;
  color:#2e7d32;
  font-size:14px;
  text-align:center;
  font-weight:600;
}

/* === Layout responsive igual que login === */
@media (min-width: 900px) {
  .auth-card{
    width:900px;
    display:grid;
    grid-template-columns: 1fr 1fr;
    overflow:hidden;
  }

  .card-decor{
    display:block;
    background: linear-gradient(
      180deg,
      rgba(245,157,60,0.12),
      rgba(232,107,29,0.06)
    );
    background-image: url('/logo.png');
    background-repeat: no-repeat;
    background-position: center;
    background-size: 220px 220px;
    min-height:320px;
  }

  .card-main{
    padding:48px 40px;
    display:flex;
    flex-direction:column;
    justify-content:center;
  }

  .logo-wrap{
    position:static;
    margin:0 auto 12px auto;
    top:unset;
    transform:none;
  }
}

@media (max-width: 479px){
  .auth-card{ width:94%; padding:20px; }
  .logo-wrap{ width:72px; height:72px; top:-36px }
  .logo-img{ width:48px; height:48px }
}
</style>
