<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useUserStore } from './stores/user';

const router = useRouter();
const { user, isLoggedIn, logout } = useUserStore();
const showDropdown = ref(false);

const defaultAvatar = '👤';

function handleLogout() {
  logout();
  showDropdown.value = false;
  router.push('/');
}

function goToProfile() {
  showDropdown.value = false;
  router.push('/profile');
}

function getAvatar() {
  return user.value?.avatar || defaultAvatar;
}
</script>

<template>
  <div class="app-container">
    <main class="main-content">
      <RouterView />
    </main>

    <div v-if="showDropdown" class="dropdown-backdrop" @click="showDropdown = false"></div>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 20px;
}
</style>
