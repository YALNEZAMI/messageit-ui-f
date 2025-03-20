<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
<script lang="ts" setup>
window.addEventListener("beforeunload", async (event) => {
  await useUsersStore().setCurrentUserStatus(false);
});
</script>
