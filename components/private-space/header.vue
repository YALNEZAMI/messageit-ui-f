<template>
  <ContainersTheme class="workspace-header flex items-center">
    <div class="flex w-14 h-14 shrink-0">
      <ImagesHeader></ImagesHeader>
    </div>
    <div
      v-if="userStore.user.name"
      class="workspace-greeting mx-3 min-w-0 flex-1 truncate"
    >
      {{
        userStore.user
          ? "Bienvenue, " + userStore.user.name
          : "Deconnecté"
      }}
    </div>
    <div class="flex justify-end">
      <button
        type="button"
        aria-label="Ouvrir le menu"
        @click="DisplaySideBar()"
        class="header-menu"
        ><svg
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
          /></svg
      ></button>
    </div>
  </ContainersTheme>
</template>
<script lang="ts" setup>
const userStore = useUsersStore();
const DisplaySideBar = () => {
  eventBus.emit("sideBareToogled", true);
};
</script>
