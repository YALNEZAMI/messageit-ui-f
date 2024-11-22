<template>
  <main>
    <NuxtImg
      class="rounded-full w-8 h-8 border-2 border-solid border-black p-1"
      :src="imgSrc"
      @error="handleError"
    ></NuxtImg>
  </main>
</template>

<script setup>
const props = defineProps({
  src: String, // Fixed type definition
});

const authStore = useAuthStore();
const defaultUserImg = authStore.defaultUserImg;

const imgSrc = ref(props.src); // Local reactive variable for the image source

const handleError = () => {
  imgSrc.value = defaultUserImg; // Set to default image on error
};
</script>
