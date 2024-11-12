<template>
  <ContainersTheme class="flex items-center p-2 rounded">
    <div class="flex h-1/6">
      <NuxtImg
        class="w-full md:w-20 h-16"
        :src="authStore.defaultUserImg"
      ></NuxtImg>
    </div>
    <div
      v-if="authStore.user.name"
      class="text-xl md:text-2xl mx-2 w-3/4 truncate"
    >
      {{
        authStore.user
          ? "Bienvenue " + authStore.user.name.toUpperCase()
          : "Deconnecté"
      }}
    </div>
    <div class="flex justify-end w-1/4">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-6"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
        />
      </svg>
    </div>
  </ContainersTheme>
</template>
<script lang="ts" setup>
const authStore = useAuthStore();
definePageMeta({
  middleware: "admin",
});
onMounted(async () => {
  await useFriendsStore().onFriendRequests();
  await useFriendsStore().onFriends();
});
</script>
