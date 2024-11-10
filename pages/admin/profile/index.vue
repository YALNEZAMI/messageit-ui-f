<template>
  <main>
    <button @click="logout" type="button" class="bg-red-500">Logout</button>
  </main>
</template>
<script lang="ts" setup>
const authStore = useAuthStore();
const logout = () => {
  authStore.logout();
};
definePageMeta({
  layout: "admin",
});
</script>
