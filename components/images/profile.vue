<template>
  <main>
    <NuxtImg
      v-if="isShown"
      class="w-32 h-32 rounded-md"
      :src="imgSrc"
      @error="handleError"
    ></NuxtImg>
  </main>
</template>

<script lang="ts" setup>
import type { User } from "~/interfaces/user";

const defaultUserImg = useUsersStore().defaultUserImg;

const imgSrc = ref(useUsersStore().user.image); // Local reactive variable for the image source

const handleError = () => {
  imgSrc.value = defaultUserImg; // Set to default image on error
};
const isShown = ref(true);
onMounted(async () => {
  eventBus.on("userPatched", (user: User) => {
    if (
      user._id == useUsersStore().user._id &&
      user.image != useUsersStore().user.image
    ) {
      isShown.value = false;
      setTimeout(() => {
        isShown.value = true;
      }, 100);
    }
  });
});
</script>
