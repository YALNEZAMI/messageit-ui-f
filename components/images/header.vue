<template>
  <ImagesFallback class="w-14 h-14 rounded-md object-cover"
    :src="usersStore.user.image" :fallback="usersStore.defaultUserImg" alt="Photo de profil" />
</template>

<script lang="ts" setup>
const usersStore = useUsersStore();
</script>
