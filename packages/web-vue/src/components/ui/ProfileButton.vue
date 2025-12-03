<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '@/stores/app';

const router = useRouter();
const app = useAppStore();
const open = ref(false);

const user = computed(() => app.user);
const userFull = computed(() => app.userFull);

function onClick() {
  if (!user.value) {
    router.push('/login');
    return;
  }
  open.value = !open.value;
}

function initials(name?: string) {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0,2).toUpperCase();
  return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
}

function doLogout() {
  app.logout();
  app.setUserFull(null);
  open.value = false;
  router.push('/login');
}

function tipoLabel(tipo: any) {
  if (!tipo) return '-';
  const t = typeof tipo === 'string' ? tipo : (tipo?.toString?.() ?? '');
  switch ((t || '').toUpperCase()) {
    case 'ALUMNO': return 'Alumno';
    case 'PROFESOR': return 'Profesor';
    case 'ADMIN':
    case 'ADMINISTRADOR': return 'Administrador';
    default: return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
  }
}
</script>

<template>
  <div style="position:relative;">
    <button class="profile-btn" @click="onClick" aria-label="Perfil">
      <template v-if="user">
        <img v-if="userFull && userFull.avatar" :src="userFull.avatar" alt="avatar" class="avatar" />
        <div v-else class="avatar avatar-fallback">{{ initials(user?.name) }}</div>
      </template>
      <template v-else>
        <div class="avatar avatar-fallback">🔒</div>
      </template>
    </button>

    <div v-if="open" class="profile-pop">
      <div style="display:flex; gap:12px; align-items:center; margin-bottom:8px;">
        <img v-if="userFull && userFull.avatar" :src="userFull.avatar" alt="avatar" class="avatar-lg" />
        <div>
          <div style="font-weight:600">{{ userFull?.nombres ?? user?.name ?? 'Usuario' }}</div>
          <div style="font-size:13px; color:#556">{{ userFull?.correo ?? '-' }}</div>
        </div>
      </div>

      <div style="display:flex; flex-direction:column; gap:6px; font-size:14px;">
        <div><strong>Nombre:</strong> <span>{{ userFull?.nombres ?? '-' }}</span></div>
        <div><strong>Apellidos:</strong> <span>{{ userFull?.apellidos ?? '-' }}</span></div>
        <div><strong>Tipo:</strong> <span>{{ tipoLabel(userFull?.tipoUsuario) }}</span></div>
        <div><strong>Correo:</strong> <span>{{ userFull?.correo ?? '-' }}</span></div>
      </div>

      <div style="height:10px"></div>
      <div style="display:flex; gap:8px; justify-content:flex-end;">
        <button class="btn secondary" @click="open = false">Cerrar</button>
        <button class="btn" @click="doLogout">Cerrar sesión</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-btn{ background:transparent; border:none; padding:0; cursor:pointer }
.avatar{ width:34px; height:34px; border-radius:50%; object-fit:cover; box-shadow:0 2px 8px rgba(0,0,0,0.08) }
.avatar-fallback{ width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; background:#fff; box-shadow:0 2px 8px rgba(0,0,0,0.06); font-weight:600 }
.profile-pop{ position:absolute; right:0; top:44px; background:white; padding:12px; border-radius:8px; box-shadow:0 10px 30px rgba(10,20,40,0.12); min-width:240px; z-index:1200 }
.avatar-lg{ width:56px; height:56px; border-radius:50%; object-fit:cover; }
.btn.secondary{ background:transparent; border:1px solid #e6eef6; color:#143A57 }
</style>
